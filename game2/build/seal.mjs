// ============================================================
// game2/build/seal.mjs
//   node build/seal.mjs  →  js/sealed.js
//
// 정답을 브라우저로 내려보내야 게임이 굴러간다. 그러나 소스를
// 훑는 것만으로 답이 보이면 안 된다. 그래서 봉해서 내려보낸다.
// 자물쇠가 아니라 봉인이다 — 뜯을 사람은 뜯는다. 다만 실수로
// 눈에 들어오는 일은 없다.
// ============================================================
import { createRequire } from "module";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { writeFileSync } from "fs";

const require = createRequire(import.meta.url);
const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const { MEMBERS, FACTS, KNEW, CULPRIT, COLLUSION_LOCK } = require(join(ROOT, "server/knowledge.js"));

const facts = Object.keys(FACTS);
const grid = {};
for (const id of Object.keys(MEMBERS)) {
    grid[id] = {};
    for (const f of facts) {
        const c = KNEW[id][f];
        grid[id][f] = { k: c.knew, p: c.proof || [], w: c.knew ? c.how : c.why };
    }
}

const payload = {
    grid,
    culprit: CULPRIT,
    // 이름 대신 '넷을 쥔 사람'을 증명하는 근거
    proof: facts.reduce((o, f) => (o[f] = KNEW[CULPRIT][f].proof || [], o), {}),
    lock: (COLLUSION_LOCK || {}).proof || []
};

const b64 = Buffer.from(JSON.stringify(payload), "utf8").toString("base64");
const out = `// ============================================================
// game2/js/sealed.js  —  build/seal.mjs 가 찍어낸다. 손대지 않는다.
// 열어보지 마십시오. 플레이어에게서 재미를 뺏는 것은 이 파일뿐입니다.
// ============================================================
const SEALED = (function () {
    const b = "${b64}";
    try {
        const bin = atob(b);
        const bytes = new Uint8Array(bin.length);
        for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
        return JSON.parse(new TextDecoder("utf-8").decode(bytes));
    } catch (e) { return null; }
})();
`;
writeFileSync(join(ROOT, "js/sealed.js"), out, "utf8");

const cells = Object.keys(MEMBERS).length * facts.length;
console.log(`봉인 완료 — 칸 ${cells}개 · ${b64.length}자`);
