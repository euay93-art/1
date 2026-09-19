// ============================================================
// game2/build/verify-knowledge.mjs
// 지식 격자가 논리적으로 서 있는지 검사한다.
//
//   node build/verify-knowledge.mjs          이름을 가린 채 (기본)
//   node build/verify-knowledge.mjs --spoil  실명으로
//
// 기본은 익명이다. 플레이어에게 보여줘도 답이 새지 않아야 하므로.
// ============================================================

import { createRequire } from "module";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const require = createRequire(import.meta.url);
const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const K = require(join(ROOT, "server/knowledge.js"));
const T = require(join(ROOT, "server/truth.js"));
const { MEMBERS, FACTS, KNEW, CULPRIT, SPLIT_RULE, COLLUSION_LOCK } = K;
const { TIMELINE, SECRETS, HOW_IT_WENT } = T;

const SPOIL = process.argv.includes("--spoil");
const ids = Object.keys(MEMBERS);
const facts = Object.keys(FACTS);
// 익명 모드에서는 A~F 로 가린다. 순서도 섞어 실명 순서를 유추 못 하게 한다.
const shuffled = [...ids].sort((a, b) =>
    (a + "침선").localeCompare(b + "침선"));
const label = {};
shuffled.forEach((id, i) => { label[id] = SPOIL ? MEMBERS[id].name : "용의자 " + "ABCDEF"[i]; });
const L = id => label[id];
const F = k => SPOIL ? FACTS[k].what : "조각 " + (facts.indexOf(k) + 1);

let pass = 0, warn = 0, fail = 0;
const ok = m => { pass++; console.log("  ✓ " + m); };
const soft = m => { warn++; console.log("  ⚠ " + m); };
const bad = m => { fail++; console.log("  ✗ " + m); };
const head = m => console.log("\n\x1b[1m" + m + "\x1b[0m");

console.log("\n\x1b[1m침선계 — 지식 격자 검증\x1b[0m" + (SPOIL ? " \x1b[31m(실명)\x1b[0m" : " (익명)"));
console.log(`정보 조각 ${facts.length} · 구성원 ${ids.length}`);

// ── 1. 표가 빠짐없이 채워졌는가 ─────────────────────────────
head("1. 표의 완결성");
let holes = 0;
for (const id of ids) for (const f of facts) {
    const cell = (KNEW[id] || {})[f];
    if (!cell || typeof cell.knew !== "boolean") { bad(`${L(id)} × ${F(f)} 칸이 비었다`); holes++; }
    else if (cell.knew && !cell.how) { bad(`${L(id)} × ${F(f)} — 알았다는데 경위가 없다`); holes++; }
    else if (!cell.knew && !cell.why) { bad(`${L(id)} × ${F(f)} — 몰랐다는데 이유가 없다`); holes++; }
}
if (!holes) ok(`${ids.length} × ${facts.length} = ${ids.length * facts.length}칸이 모두 채워졌다`);

// ── 2. 전부 쥔 사람이 한 명인가 ─────────────────────────────
head("2. 네 조각을 전부 쥔 사람");
const full = ids.filter(id => facts.every(f => KNEW[id][f].knew));
for (const id of ids) {
    const n = facts.filter(f => KNEW[id][f].knew).length;
    console.log(`  · ${L(id)} — ${n} / ${facts.length}`);
}
if (full.length === 1 && full[0] === CULPRIT) ok(`정확히 한 명 (${L(full[0])}) — 답이 하나로 떨어진다`);
else if (!full.length) bad("전부 쥔 사람이 없다 — 이 사건은 성립하지 않는다");
else bad(`${full.length}명이 전부 쥐고 있다: ${full.map(L).join(", ")} — 답이 갈린다`);

// ── 3. 둘이 나눠 흘렸을 가능성 ──────────────────────────────
// 조각 넷·구성원 여섯으로는 모든 쌍을 격자만으로 막을 수 없다.
// (쌍마다 둘 다 모르는 조각이 있으려면 격자가 한쪽으로 무너진다.)
// 그래서 남는 쌍은 이야기 잠금으로 막는다.
head("3. 두 사람이 나눠서 흘렸을 가능성");
const pairs = [];
for (let i = 0; i < ids.length; i++) for (let j = i + 1; j < ids.length; j++) {
    const a = ids[i], b = ids[j];
    if (a === CULPRIT || b === CULPRIT) continue;
    if (facts.every(f => KNEW[a][f].knew || KNEW[b][f].knew)) pairs.push([a, b]);
}
const lock = COLLUSION_LOCK || {};
const lockProof = lock.proof || [];
if (!pairs.length) ok("범인 아닌 두 사람의 조합으로는 네 조각이 채워지지 않는다");
else if (lockProof.length >= 2) {
    ok(`합치면 네 조각이 채워지는 쌍 ${pairs.length}개 — 이야기 잠금이 막는다 (근거 ${lockProof.length}개)`);
    pairs.forEach(([a, b]) => console.log(`  · ${L(a)} + ${L(b)}`));
} else if (lockProof.length === 1)
    soft(`쌍 ${pairs.length}개를 잠그는 근거가 하나뿐이다 — 그 하나를 놓치면 추리가 열린다`);
else pairs.forEach(([a, b]) =>
    bad(`${L(a)} + ${L(b)} 둘이 합치면 네 조각이 채워지는데 막는 것이 없다`));

// ── 4. 지우는 근거를 플레이어가 확인할 수 있는가 ────────────
head("4. 몰랐다는 것을 확인할 근거");
for (const id of ids) {
    if (id === CULPRIT) continue;
    const missing = facts.filter(f => !KNEW[id][f].knew);
    if (!missing.length) { bad(`${L(id)} 는 빠뜨린 조각이 없다 — 지울 수가 없다`); continue; }
    const noProof = missing.filter(f => !(KNEW[id][f].proof || []).length);
    noProof.length ? bad(`${L(id)}: ${noProof.map(F).join(", ")} 를 몰랐다는 근거가 없다`)
                   : ok(`${L(id)}: ${missing.length}개를 몰랐고, 각각 확인할 근거가 있다`);
}
const culpritGaps = facts.filter(f => !KNEW[CULPRIT][f].knew);
culpritGaps.length ? bad(`범인에게 빠진 조각이 있다: ${culpritGaps.map(F).join(", ")}`)
                   : ok("범인에게는 빠진 조각이 없다");

// ── 5. 조각마다 용의자가 실제로 갈리는가 ────────────────────
// 전원이 알면 아무도 못 가르고, 한 명만 알면 그 조각 하나로 끝나버린다.
head("5. 각 조각의 판별력");
for (const f of facts) {
    const yes = ids.filter(id => KNEW[id][f].knew);
    const no  = ids.length - yes.length;
    if (!no) bad(`${F(f)}: 전원이 알았다 — 아무도 못 가른다. 조각으로서 죽었다`);
    else if (yes.length === 1) bad(`${F(f)}: 한 명만 알았다 — 이 조각 하나로 답이 나온다. 너무 이르다`);
    else ok(`${F(f)}: ${yes.length}명으로 좁히고 ${no}명을 지운다`);
}

// ── 6. 순사가 알았다는 것 자체의 근거 ───────────────────────
head("6. '순사가 이것을 알았다'를 무엇으로 아는가");
for (const f of facts) {
    const p = FACTS[f].proof || [];
    p.length ? ok(`${F(f)}: 근거 ${p.length}개`)
             : bad(`${F(f)}: 순사가 알았다는 근거가 없다`);
}

// ── 7. 범인이 네 조각을 쥐었다는 것을 증명할 수 있는가 ──────
// 지워서 한 명이 남는 것만으로는 부족하다. 그 한 명이 실제로
// 넷을 모았다는 것을 플레이어가 대놓고 증명할 수 있어야 한다.
head("7. 범인이 쥐었다는 증명");
for (const f of facts) {
    const cell = KNEW[CULPRIT][f];
    const p = cell.proof || [];
    p.length ? ok(`${F(f)}: 손에 넣은 경위에 근거 ${p.length}개`)
             : bad(`${F(f)}: 범인이 이것을 알았다는 근거가 없다`);
}

// ── 8. 격자가 성립하는 전제 ─────────────────────────────────
// "계주가 쪼개서 알렸다"가 확인되지 않으면 넷을 다 아는 것이
// 이상한 일이 아니게 된다. 추리의 바닥이 빠진다.
head("8. 분리 원칙의 근거");
const sp = (SPLIT_RULE || {}).proof || [];
sp.length >= 2 ? ok(`계주가 정보를 쪼갰다는 근거 ${sp.length}개`)
               : bad("분리 원칙을 확인할 근거가 모자라다 — 격자의 전제가 무너진다");

// ── 9. 아직 만들지 않은 단서 목록 ───────────────────────────
// 표가 가리키는 증거를 전부 뽑는다. 다음 단계에서 이 목록대로 만든다.
head("9. 표가 요구하는 증거");
const refs = new Set();
const eat = o => (o && o.proof || []).forEach(x => refs.add(x));
Object.values(FACTS).forEach(eat);
Object.values(KNEW).forEach(row => Object.values(row).forEach(eat));
eat(SPLIT_RULE); eat(COLLUSION_LOCK);
const clues = [...refs].filter(x => x.startsWith("c_")).sort();
const talks = [...refs].filter(x => x.startsWith("talk:")).sort();
ok(`현장 증거 ${clues.length}종 · 증언 ${talks.length}종`);
console.log("  " + clues.join("  "));
console.log("  " + talks.join("  "));

// ── 10. 사건과 표가 어긋나지 않는가 ─────────────────────────
// truth.js 의 사건 하나하나가 조각을 건넨다. 그 사건을 아는 사람을
// 다 모으면 표의 '알았다' 목록과 글자 하나까지 같아야 한다.
// 한쪽만 고치면 여기서 걸린다.
head("10. 사건과 표의 대조");
for (const f of facts) {
    const by = new Set();
    TIMELINE.filter(e => (e.grants || []).includes(f)).forEach(e => (e.by || []).forEach(x => by.add(x)));
    const knowers = ids.filter(id => KNEW[id][f].knew);
    const a = [...by].sort().join("|"), b = [...knowers].sort().join("|");
    if (!by.size) bad(`${F(f)}: 이 조각을 건네는 사건이 없다 — 어디서 알았는지 사건에 없다`);
    else if (a === b) ok(`${F(f)}: 사건에서 이것을 얻은 ${by.size}명 = 표에서 안다고 한 ${knowers.length}명`);
    else {
        const only1 = [...by].filter(x => !knowers.includes(x)).map(L);
        const only2 = knowers.filter(x => !by.has(x)).map(L);
        bad(`${F(f)}: 어긋난다 — 사건에만 ${only1.join(",") || "없음"} · 표에만 ${only2.join(",") || "없음"}`);
    }
}

// ── 11. 단서 목록과 사건의 흔적이 맞물리는가 ────────────────
head("11. 단서와 흔적");
const marks = new Set();
TIMELINE.forEach(e => (e.mark || []).forEach(m => marks.add(m)));
const orphan = clues.filter(c => !marks.has(c));
orphan.length ? bad(`표가 찾는데 사건이 남기지 않은 단서: ${orphan.join(", ")}`)
              : ok(`표가 찾는 단서 ${clues.length}종이 모두 사건에 흔적을 두고 있다`);
const spare = [...marks].filter(m => !refs.has(m));
ok(`격자에 안 쓰이는 흔적 ${spare.length}종 — 분위기와 붉은 청어의 몫${spare.length ? " (" + spare.join(", ") + ")" : ""}`);

// ── 12. 밀정 아닌 다섯도 숨기는 것이 있는가 ─────────────────
// 다섯 중 누구 하나라도 숨기는 것이 없으면 "숨기는 자가 범인"이
// 되어버린다. 심문이 성립하지 않는다.
head("12. 다섯의 숨긴 것");
let bare = 0;
for (const id of ids) {
    const sc = (SECRETS || {})[id];
    if (!sc || !sc.hides) { bad(`${L(id)}: 숨기는 것이 없다 — 심문할 거리가 없다`); bare++; }
    else if (id !== CULPRIT && !sc.truth) { bad(`${L(id)}: 숨긴 것이 풀리는 대목이 없다 — 누명이 안 벗겨진다`); bare++; }
}
if (!bare) ok(`여섯 모두 숨기는 것이 있고, 범인 아닌 다섯은 풀리는 대목이 있다`);
const looks = new Set(ids.map(id => (SECRETS[id] || {}).lookslike));
looks.size === ids.length ? ok("여섯의 혐의가 서로 다른 모양이다")
                          : bad("혐의의 모양이 겹친다 — 인물이 구별되지 않는다");

console.log("\n" + "─".repeat(54));
console.log(`통과 ${pass} · 주의 ${warn} · 실패 ${fail}`);
console.log(fail ? "\x1b[31m격자가 서지 않는다.\x1b[0m"
                 : warn ? "\x1b[33m격자는 선다. 주의 항목은 이야기로 막아야 한다.\x1b[0m"
                        : "\x1b[32m빈틈 없음.\x1b[0m");
if (!SPOIL) console.log("\x1b[2m이름은 가렸다. 실명으로 보려면 --spoil\x1b[0m");
process.exit(fail ? 1 : 0);
