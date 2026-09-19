// ============================================================
// game2/build/verify-case.mjs
// 「침선계」가 실제로 풀리는 게임인지 검사한다.
//
//   node build/verify-case.mjs          이름을 가린 채 (기본)
//   node build/verify-case.mjs --spoil  실명으로
//
// 격자가 논리적으로 서는 것과, 플레이어가 그 격자를 손으로
// 채울 수 있는 것은 다른 문제다. 이 파일은 뒤쪽을 본다.
// ============================================================
import { createRequire } from "module";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { readFileSync } from "fs";

const require = createRequire(import.meta.url);
const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const K = require(join(ROOT, "server/knowledge.js"));
const { MEMBERS, FACTS, KNEW, CULPRIT, SPLIT_RULE, COLLUSION_LOCK } = K;
const CASE = new Function(readFileSync(join(ROOT, "js/case.js"), "utf8") + ";return CASE;")();

const SPOIL = process.argv.includes("--spoil");
const ids = Object.keys(MEMBERS), facts = Object.keys(FACTS);
const label = {};
[...ids].sort((a, b) => (a + "침선").localeCompare(b + "침선"))
    .forEach((id, i) => { label[id] = SPOIL ? MEMBERS[id].name : "용의자 " + "ABCDEF"[i]; });
const L = id => label[id];
const F = k => SPOIL ? FACTS[k].what : "조각 " + (facts.indexOf(k) + 1);

let pass = 0, warn = 0, fail = 0;
const ok = m => { pass++; console.log("  ✓ " + m); };
const soft = m => { warn++; console.log("  ⚠ " + m); };
const bad = m => { fail++; console.log("  ✗ " + m); };
const head = m => console.log("\n\x1b[1m" + m + "\x1b[0m");

console.log("\n\x1b[1m침선계 — 진행 가능성 검증\x1b[0m" + (SPOIL ? " \x1b[31m(실명)\x1b[0m" : " (익명)"));

// ── 이 게임에서 손에 넣을 수 있는 것들 ──────────────────────
const clues = CASE.clues;
const allTopics = [];
[CASE.chief, ...CASE.suspects].forEach(p =>
    (p.topics || []).forEach(t => allTopics.push({ ...t, owner: p.id })));
const topicById = Object.fromEntries(allTopics.map(t => [t.id, t]));

// 장소 → 단서. act 는 그 단서를 몇 막부터 집을 수 있는지.
const clueAct = {};
CASE.locations.forEach(loc =>
    loc.objects.forEach(o => o.steps.forEach(c => {
        clueAct[c] = Math.min(clueAct[c] === undefined ? 9 : clueAct[c], loc.act);
    })));

// ── 1. 가리키는 것이 다 있는가 ──────────────────────────────
head("1. 가리키는 것이 실재하는가");
const exists = id => (id in clues) || (id in topicById);
const refs = new Set();
const eat = o => (o && o.proof || []).forEach(x => refs.add(x));
Object.values(FACTS).forEach(eat);
Object.values(KNEW).forEach(r => Object.values(r).forEach(eat));
eat(SPLIT_RULE); eat(COLLUSION_LOCK);
const ghosts = [...refs].filter(r => !exists(r));
ghosts.length ? bad(`격자가 가리키는데 게임에 없는 것: ${ghosts.join(", ")}`)
              : ok(`격자가 가리키는 ${refs.size}가지가 모두 게임 안에 있다`);
let dangling = 0;
Object.entries(clues).forEach(([id, c]) =>
    (c.requires || []).forEach(r => { if (!clues[r]) { bad(`${id} 가 없는 단서 ${r} 를 요구한다`); dangling++; } }));
allTopics.forEach(t => {
    (t.needs || []).forEach(r => { if (!clues[r]) { bad(`문답 ${t.id} 가 없는 단서 ${r} 를 요구한다`); dangling++; } });
    if (t.after && !topicById[t.after]) { bad(`문답 ${t.id} 가 없는 문답 ${t.after} 뒤에 온다`); dangling++; }
});
if (!dangling) ok("단서와 문답의 잠금장치가 모두 실재하는 것을 가리킨다");

// ── 2. 끝까지 풀리는가 ──────────────────────────────────────
// 아무것도 모르는 상태에서 시작해 더 열리지 않을 때까지 민다.
head("2. 끝까지 풀리는가");
const got = new Set();
let moved = true, rounds = 0;
while (moved && rounds < 60) {
    moved = false; rounds++;
    for (const [id, c] of Object.entries(clues)) {
        if (got.has(id) || clueAct[id] === undefined) continue;
        if ((c.requires || []).every(r => got.has(r))) { got.add(id); moved = true; }
    }
    for (const t of allTopics) {
        if (got.has(t.id)) continue;
        if ((t.needs || []).every(r => got.has(r)) && (!t.after || got.has(t.after))) { got.add(t.id); moved = true; }
    }
}
const stuckClues = Object.keys(clues).filter(c => !got.has(c));
const stuckTopics = allTopics.filter(t => !got.has(t.id)).map(t => t.id);
stuckClues.length ? bad(`영영 못 얻는 단서: ${stuckClues.join(", ")}`)
                  : ok(`단서 ${Object.keys(clues).length}개가 모두 도달 가능하다 (${rounds}바퀴)`);
stuckTopics.length ? bad(`영영 못 여는 문답: ${stuckTopics.join(", ")}`)
                   : ok(`문답 ${allTopics.length}개가 모두 열린다`);

// ── 3. 격자 스물네 칸을 손으로 채울 수 있는가 ───────────────
head("3. 격자를 채울 수 있는가");
let blocked = 0;
for (const id of ids) for (const f of facts) {
    const p = KNEW[id][f].proof || [];
    const miss = p.filter(x => !got.has(x));
    if (miss.length) { bad(`${L(id)} × ${F(f)} 칸을 채울 수 없다 — ${miss.join(", ")}`); blocked++; }
}
if (!blocked) ok(`스물네 칸 모두 근거를 손에 넣을 수 있다`);

// ── 4. 1막이 제 몫을 하는가 ─────────────────────────────────
// 1막 목표는 '순사가 무엇을 쥐었나' 넷을 세우는 것이다.
// 1막에 열린 장소만으로 그것이 되어야 한다.
head("4. 1막만으로 조각 넷이 서는가");
const act1 = new Set();
moved = true;
while (moved) {
    moved = false;
    for (const [id, c] of Object.entries(clues)) {
        if (act1.has(id) || clueAct[id] !== 1) continue;
        if ((c.requires || []).every(r => act1.has(r))) { act1.add(id); moved = true; }
    }
    for (const t of allTopics) {
        if (act1.has(t.id)) continue;
        if ((t.needs || []).every(r => act1.has(r)) && (!t.after || act1.has(t.after))) { act1.add(t.id); moved = true; }
    }
}
for (const f of facts) {
    const p = FACTS[f].proof || [];
    const miss = p.filter(x => !act1.has(x));
    miss.length ? bad(`${F(f)}: 1막에서 세울 수 없다 — ${miss.join(", ")}`)
                : ok(`${F(f)}: 1막 안에서 선다`);
}
const lockMiss = ((COLLUSION_LOCK || {}).proof || []).filter(x => !act1.has(x));
lockMiss.length ? soft(`공범 가능성을 막는 근거가 1막에 없다 — ${lockMiss.join(", ")}`)
                : ok("공범 가능성을 막는 근거도 1막 안에 있다");

// ── 5. 마지막 증명 ──────────────────────────────────────────
head("5. 마지막에 내놓을 것이 손에 있는가");
for (const f of facts) {
    const p = KNEW[CULPRIT][f].proof || [];
    const have = p.filter(x => got.has(x));
    have.length >= 2 ? ok(`${F(f)}: 내놓을 수 있는 근거 ${have.length}가지`)
                     : have.length === 1 ? soft(`${F(f)}: 근거가 하나뿐이다 — 그것을 놓치면 증명이 막힌다`)
                     : bad(`${F(f)}: 내놓을 근거가 없다`);
}

// ── 6. 여섯이 고르게 의심스러운가 ───────────────────────────
// 사정 단서가 한쪽에만 쏠리면 누가 범인인지 단서 목록만 봐도 보인다.
head("6. 혐의의 분포");
const T = require(join(ROOT, "server/truth.js"));
const sideClues = Object.entries(clues).filter(([, c]) => c.tag === "사정").map(([id]) => id);
ok(`사정 단서 ${sideClues.length}개`);
const owner = {
    c_operator_father: "operator", c_seamstress_past: "seamstress", c_midwife_kanpan: "midwife",
    c_printer_quarrel: "printer", c_prison_visit: "peddler", c_gisaeng_medicine: "gisaeng",
    c_draper_word: "peddler", c_student_diary: null, c_student_letter: null
};
const per = {};
sideClues.forEach(c => { const o = owner[c]; if (o) per[o] = (per[o] || 0) + 1; });
const bareMen = ids.filter(id => !per[id]);
bareMen.length ? bad(`사정이 없는 사람: ${bareMen.map(L).join(", ")} — 의심할 거리가 없다`)
               : ok("여섯 모두 사정 단서를 하나 이상 지고 있다");
const counts = ids.map(id => per[id] || 0);
Math.max(...counts) - Math.min(...counts) > 1
    ? soft(`사정 단서가 고르지 않다 (${counts.join("·")}) — 목록만 보고 짚을 수 있다`)
    : ok(`사정 단서가 고르다 (${counts.join("·")})`);
const secrets = Object.keys(T.SECRETS || {});
secrets.length === ids.length ? ok("여섯의 비밀이 인물 자료에도 다 있다")
                              : bad("비밀이 빠진 사람이 있다");

console.log("\n" + "─".repeat(54));
console.log(`통과 ${pass} · 주의 ${warn} · 실패 ${fail}`);
console.log(fail ? "\x1b[31m이대로는 못 푼다.\x1b[0m"
                 : warn ? "\x1b[33m풀린다. 주의 항목은 손봐야 한다.\x1b[0m"
                        : "\x1b[32m끝까지 풀린다.\x1b[0m");
if (!SPOIL) console.log("\x1b[2m이름은 가렸다. 실명으로 보려면 --spoil\x1b[0m");
process.exit(fail ? 1 : 0);
