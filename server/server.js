// ============================================================
// server/server.js
// 정적 파일 서빙 + AI 용의자 심문 API.
// Claude Code CLI(`claude -p`)를 통해 호출하므로 Max 구독 인증을 그대로 쓴다.
// 별도의 API 키가 필요 없다.
// ============================================================

const http = require("http");
const fs = require("fs");
const path = require("path");
const os = require("os");
const { spawn } = require("child_process");
const { CHARACTERS, EVIDENCE_BRIEF, buildSystemPrompt } = require("./characters");

const ROOT = path.resolve(__dirname, "..");
const PORT = Number(process.env.PORT || 4173);
const MODEL = process.env.SEOLYA_MODEL || "opus";
const EFFORT = process.env.SEOLYA_EFFORT || "low";
const CLAUDE_BIN = process.env.CLAUDE_BIN || "claude";
const TIMEOUT_MS = Number(process.env.SEOLYA_TIMEOUT || 180000);

// 배정훈의 붕괴 판정에 쓰이는 치명적 증거들
const FATAL = ["c_phone", "c_clock_trick", "c_newspaper", "c_shoes", "c_stride",
               "c_glassdust", "c_room_bae", "c_room_seo"];

const MIME = {
    ".html": "text/html; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".js": "text/javascript; charset=utf-8",
    ".json": "application/json; charset=utf-8",
    ".svg": "image/svg+xml",
    ".png": "image/png",
    ".ico": "image/x-icon"
};

// ── Claude 호출 ─────────────────────────────────────────────
function callClaude(systemPrompt, userPrompt) {
    return new Promise((resolve, reject) => {
        const args = [
            "-p",
            "--output-format", "json",
            "--model", MODEL,
            "--effort", EFFORT,
            "--system-prompt", systemPrompt,
            "--tools", "",
            "--disable-slash-commands",
            "--strict-mcp-config",
            "--no-session-persistence",
            "--permission-prompts", "none"
        ];

        const child = spawn(CLAUDE_BIN, args, {
            cwd: os.tmpdir(),
            stdio: ["pipe", "pipe", "pipe"]
        });

        let out = "", err = "", done = false;
        const timer = setTimeout(() => {
            if (!done) { done = true; child.kill("SIGKILL"); reject(new Error("응답 시간 초과")); }
        }, TIMEOUT_MS);

        child.stdout.on("data", d => { out += d; });
        child.stderr.on("data", d => { err += d; });
        child.on("error", e => {
            if (done) return;
            done = true; clearTimeout(timer);
            reject(new Error(`claude 실행 실패: ${e.message}`));
        });
        child.on("close", code => {
            if (done) return;
            done = true; clearTimeout(timer);
            if (code !== 0) return reject(new Error(err.trim() || `claude 종료 코드 ${code}`));
            try {
                const json = JSON.parse(out);
                if (json.is_error) return reject(new Error(json.result || "claude 오류"));
                resolve(String(json.result || "").trim());
            } catch (e) {
                reject(new Error("응답 파싱 실패: " + out.slice(0, 300)));
            }
        });

        child.stdin.write(userPrompt);
        child.stdin.end();
    });
}

// ── 심문 프롬프트 ───────────────────────────────────────────
function buildUserPrompt(body) {
    const { history = [], message = "", showing = null } = body;

    const lines = [];
    if (history.length) {
        lines.push("[지금까지의 대화]");
        for (const turn of history.slice(-14)) {
            lines.push((turn.role === "user" ? "질문자: " : "나: ") + turn.text);
        }
        lines.push("");
    }

    if (showing && EVIDENCE_BRIEF[showing]) {
        lines.push("[질문자가 지금 당신 앞에 증거를 내밀었다]");
        lines.push(EVIDENCE_BRIEF[showing]);
        lines.push("");
        lines.push("질문자: " + (message || "이건 어떻게 설명하시겠습니까?"));
    } else {
        lines.push("질문자: " + message);
    }

    lines.push("");
    lines.push("위 질문에 당신(인물 본인)으로서 대답하라. 대사만 출력한다. 이름표나 따옴표를 붙이지 않는다.");
    return lines.join("\n");
}

function pressureLabel(presented) {
    const n = (presented || []).filter(id => FATAL.includes(id)).length;
    if (n >= 5) return "붕괴 — 이번 답변에서 무너진다. 사실을 말하고 맨 끝에 [[자백]] 을 붙인다.";
    if (n >= 3) return `높음 (치명적 증거 ${n}개) — 눈에 띄게 동요하지만 아직 부인한다.`;
    if (n >= 1) return `보통 (치명적 증거 ${n}개) — 침착하게 받아넘긴다.`;
    return "낮음 — 여유롭다. 협조적인 태도를 유지한다.";
}

// ── API ─────────────────────────────────────────────────────
async function handleAsk(req, res) {
    let raw = "";
    req.on("data", d => {
        raw += d;
        if (raw.length > 200000) req.destroy();
    });
    req.on("end", async () => {
        try {
            const body = JSON.parse(raw || "{}");
            const id = body.suspect;
            if (!CHARACTERS[id]) return send(res, 400, { error: "알 수 없는 인물입니다." });

            const presented = Array.isArray(body.presented) ? body.presented : [];
            const sys = buildSystemPrompt(id, presented, pressureLabel(presented));
            const usr = buildUserPrompt(body);

            let text = await callClaude(sys, usr);
            const confessed = text.includes("[[자백]]");
            text = text.replace(/\[\[자백\]\]/g, "").trim();

            send(res, 200, { text, confessed });
        } catch (e) {
            send(res, 500, { error: String(e.message || e) });
        }
    });
}

function send(res, code, obj) {
    const buf = Buffer.from(JSON.stringify(obj));
    res.writeHead(code, { "Content-Type": "application/json; charset=utf-8", "Content-Length": buf.length });
    res.end(buf);
}

// ── 정적 파일 ───────────────────────────────────────────────
function serveStatic(req, res) {
    let rel = decodeURIComponent(req.url.split("?")[0]);
    if (rel === "/") rel = "/index.html";
    const file = path.join(ROOT, rel);
    if (!file.startsWith(ROOT)) { res.writeHead(403); return res.end("403"); }

    fs.readFile(file, (err, data) => {
        if (err) { res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" }); return res.end("404"); }
        res.writeHead(200, {
            "Content-Type": MIME[path.extname(file).toLowerCase()] || "application/octet-stream",
            "Cache-Control": "no-cache"
        });
        res.end(data);
    });
}

http.createServer((req, res) => {
    if (req.method === "POST" && req.url === "/api/ask") return handleAsk(req, res);
    if (req.method === "GET" && req.url === "/api/health") {
        return send(res, 200, { ok: true, model: MODEL, effort: EFFORT });
    }
    if (req.method === "GET") return serveStatic(req, res);
    res.writeHead(405); res.end();
}).listen(PORT, () => {
    console.log("");
    console.log("  ❄  설야장 살인사건");
    console.log("  ─────────────────────────────────────────");
    console.log(`  브라우저에서 열기 :  http://localhost:${PORT}`);
    console.log(`  용의자 AI 모델    :  ${MODEL} (effort: ${EFFORT})`);
    console.log("  인증              :  Claude Code 로그인 (구독 사용, API 키 불필요)");
    console.log("");
});
