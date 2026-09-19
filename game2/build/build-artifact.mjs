// ============================================================
// game2/build/build-artifact.mjs
// 서버 없이 혼자 도는 단일 HTML 을 만든다 (dist/chimseonkye.html).
// Artifact 런타임의 sample 기능으로 일곱 인물이 그대로 살아난다.
//
//   node build/seal.mjs && node build/build-artifact.mjs
//
// 인물 시트는 server/characters.js 한 곳에서만 관리하고, 빌드가 그
// 모듈을 읽어 그대로 주입한다. 사본이 어긋날 일이 없다.
// 소스를 열었을 때 답이 바로 보이지 않도록 base64 로 감싼다.
// 자물쇠가 아니라 봉인이다.
// ============================================================

import { readFileSync, writeFileSync, mkdirSync, existsSync } from "fs";
import { createRequire } from "module";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const require = createRequire(import.meta.url);
const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = p => readFileSync(join(ROOT, p), "utf8");

if (!existsSync(join(ROOT, "js/sealed.js"))) {
    console.error("js/sealed.js 가 없다. 먼저 node build/seal.mjs 를 돌려라.");
    process.exit(1);
}

const C = require(join(ROOT, "server/characters.js"));

const secrets = Buffer.from(JSON.stringify({
    CHARACTERS: C.CHARACTERS,
    EVIDENCE_BRIEF: C.EVIDENCE_BRIEF,
    CANON_PUBLIC: C.CANON_PUBLIC,
    COMMON_RULES: C.COMMON_RULES,
    FATAL: C.FATAL
}), "utf8").toString("base64");

// 서버와 브라우저가 같은 함수를 쓰도록 소스 그대로 옮겨 심는다
const sharedPrompts = `
const __B64 = "${secrets}";
const __D = JSON.parse(new TextDecoder().decode(
    Uint8Array.from(atob(__B64), ch => ch.charCodeAt(0))
));
const CHARACTERS = __D.CHARACTERS;
const EVIDENCE_BRIEF = __D.EVIDENCE_BRIEF;
const CANON_PUBLIC = __D.CANON_PUBLIC;
const COMMON_RULES = __D.COMMON_RULES;
const FATAL = __D.FATAL;
const pressureLabel = ${C.pressureLabel.toString()};
const awarenessLabel = ${C.awarenessLabel.toString()};
const buildUserPrompt = ${C.buildUserPrompt.toString()};
const buildSystemPrompt = ${C.buildSystemPrompt.toString()};
`.trim();

const html = read("index.html");
const body = html
    .slice(html.indexOf("<body>") + 6, html.indexOf("</body>"))
    .replace(/<script src="[^"]*"><\/script>\s*/g, "")
    .trim();

// index.html 의 script 순서를 그대로 따라간다. 손으로 두 벌 관리하지 않는다.
const order = [...html.matchAll(/<script src="([^"]+)"><\/script>/g)].map(m => m[1]);
const scripts = order.map(read).join("\n\n");

const out = `<title>침선계</title>
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Nanum+Myeongjo:wght@400;700;800&display=swap">
<style>
${read("css/style.css")}
/* 단일 파일 빌드: 게임이 화면 전체를 쓴다 */
html, body { height: 100%; }
</style>

${body}

<script>
${sharedPrompts}
</script>

<script>
${scripts}
</script>
`;

mkdirSync(join(ROOT, "dist"), { recursive: true });
writeFileSync(join(ROOT, "dist/chimseonkye.html"), out);

const kb = (Buffer.byteLength(out) / 1024).toFixed(0);
console.log(`✓ dist/chimseonkye.html  (${kb} KB · 인물 ${Object.keys(C.CHARACTERS).length}명 · 증거 ${Object.keys(C.EVIDENCE_BRIEF).length}개 · 스크립트 ${order.length}개)`);
