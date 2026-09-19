// ============================================================
// game2/server/server.js
// 정적 파일 서빙 + 인물 대화 API.
// Claude Code CLI(`claude -p`)를 통해 호출하므로 Max 구독 인증을 그대로 쓴다.
// 별도의 API 키가 필요 없다.
// ============================================================

const http = require("http");
const fs = require("fs");
const path = require("path");
const os = require("os");
const { spawn } = require("child_process");
const { CHARACTERS, buildSystemPrompt, buildUserPrompt, pressureLabel, awarenessLabel } = require("./characters");

const ROOT = path.resolve(__dirname, "..");
const PORT = Number(process.env.PORT || 4173);
const MODEL = process.env.CHIMSEON_MODEL || "opus";
const EFFORT = process.env.CHIMSEON_EFFORT || "low";
const CLAUDE_BIN = process.env.CLAUDE_BIN || "claude";
const TIMEOUT_MS = Number(process.env.CHIMSEON_TIMEOUT || 180000);

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
            const id = body.person || body.suspect;
            if (!CHARACTERS[id]) return send(res, 400, { error: "알 수 없는 인물입니다." });

            const presented = Array.isArray(body.presented) ? body.presented : [];
            const confronts = Number(body.confronts) || 0;
            const sys = buildSystemPrompt(id, presented, pressureLabel(presented, confronts),
                                          !!body.opened, awarenessLabel(presented, confronts));
            const usr = buildUserPrompt(body);

            let text = await callClaude(sys, usr);
            const confessed = text.includes("[[자백]]");
            const opened = text.includes("[[마음]]");
            text = text.replace(/\[\[자백\]\]/g, "").replace(/\[\[마음\]\]/g, "").trim();

            send(res, 200, { text, confessed, opened });
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
    console.log("  針  침선계 — 경성 1934");
    console.log("  ─────────────────────────────────────────");
    console.log(`  브라우저에서 열기 :  http://localhost:${PORT}`);
    console.log(`  인물 연기 모델    :  ${MODEL} (effort: ${EFFORT})`);
    console.log("  인증              :  Claude Code 로그인 (구독 사용, API 키 불필요)");
    console.log("");
});
