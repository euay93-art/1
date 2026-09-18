// ============================================================
// build/verify-case.mjs
// 사건이 논리적으로 서 있는지 기계로 검사한다.
//
//   node build/verify-case.mjs
//
// 사람이 눈으로 보면 놓치는 것들 — 알리바이 공백, 어느 쪽에서도
// 확인할 수 없는 사실, 뒷받침 없는 정답 — 을 잡는 것이 목적이다.
// ============================================================

import { readFileSync } from "fs";
import { createRequire } from "module";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const require = createRequire(import.meta.url);
const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

const CASE = eval(readFileSync(join(ROOT, "js/case.js"), "utf8") + "; CASE");
const CH = require(join(ROOT, "server/characters.js"));
const TL = require(join(ROOT, "server/timeline.js"));
const { t, WINDOW, CULPRIT, TIMELINE, CLEARED, SUPPORT } = TL;

// ── 보고 ────────────────────────────────────────────────────
let pass = 0, warn = 0, fail = 0;
const ok   = m => { pass++; console.log("  ✓ " + m); };
const soft = m => { warn++; console.log("  ⚠ " + m); };
const bad  = m => { fail++; console.log("  ✗ " + m); };
const head = m => console.log("\n\x1b[1m" + m + "\x1b[0m");

// ── 도우미 ──────────────────────────────────────────────────
const clueIds = Object.keys(CASE.clues);
const suspects = CASE.suspects.map(s => s.id);
const nameOf = id => (CASE.suspects.find(s => s.id === id) || {}).name || id;

// 플레이어가 이 근거에 실제로 도달할 수 있는가
function reachable(ref) {
    if (ref.startsWith("talk:")) return suspects.includes(ref.slice(5));
    if (!CASE.clues[ref]) return false;
    const seen = new Set();
    const walk = id => {
        if (seen.has(id)) return true;
        seen.add(id);
        return (CASE.clues[id].requires || []).every(walk);
    };
    return walk(ref);
}

// 그 인물이 [a,b) 구간 내내 누군가에게 확인되는가 (함께였거나, 보였거나)
function covered(who, a, b, mutualOnly) {
    const gaps = [];
    let cur = a;
    const blocks = (TIMELINE[who] || [])
        .filter(x => (x.with || []).length || (!mutualOnly && (x.seenBy || []).length))
        .map(x => [t(x.from), t(x.to)])
        .sort((p, q) => p[0] - q[0]);
    for (const [s, e] of blocks) {
        if (e <= cur) continue;
        if (s > cur) gaps.push([cur, Math.min(s, b)]);
        cur = Math.max(cur, e);
        if (cur >= b) break;
    }
    if (cur < b) gaps.push([cur, b]);
    return gaps.filter(g => g[1] > g[0]);
}
const clock = m => {
    const tot = m + 20 * 60, h = Math.floor(tot / 60) % 24;
    return String(h).padStart(2, "0") + ":" + String(tot % 60).padStart(2, "0");
};

console.log("\n\x1b[1m설야장 사건 검증\x1b[0m");
console.log(`증거 ${clueIds.length} · 용의자 ${suspects.length} · 장소 ${CASE.locations.length} · 문항 ${CASE.quiz.length}`);

// ── 1. 범행 시간대 ──────────────────────────────────────────
head("1. 범행 가능 시간대");
const W = [t(WINDOW.from), t(WINDOW.to)];
console.log(`  ${WINDOW.from} ~ ${WINDOW.to} (${W[1] - W[0]}분)`);
for (const [label, refs] of [["하한", WINDOW.by_from], ["상한", WINDOW.by_to]]) {
    const missing = refs.filter(r => !reachable(r));
    missing.length ? bad(`${label}을 세우는 근거에 도달 불가: ${missing.join(", ")}`)
                   : ok(`${label}은 ${refs.join(", ")} 로 확인 가능`);
}
const bodyRange = /11시에서 새벽 1시/.test(CASE.clues.c_body.text);
bodyRange ? ok("시신만으로는 두 시간 폭 — 시간대를 좁히려면 다른 증거가 필요")
          : soft("시신 소견이 시간대를 직접 좁히고 있는지 확인 필요");

// ── 2. 알리바이 ─────────────────────────────────────────────
head("2. 범행 시간대의 알리바이");
const uncovered = [];
for (const s of suspects) {
    const gaps = covered(s, W[0], W[1]);
    if (!gaps.length) {
        const kind = covered(s, W[0], W[1], true).length ? "목격" : "동행";
        const who = new Set();
        (TIMELINE[s] || []).forEach(x => {
            if (t(x.from) < W[1] && t(x.to) > W[0])
                [...(x.with || []), ...(x.seenBy || [])].forEach(n => who.add(nameOf(n)));
        });
        ok(`${nameOf(s)} — 전 구간 확인됨 (${kind}: ${[...who].join(", ")})`);
        continue;
    }
    uncovered.push(s);
    const g = gaps.map(x => `${clock(x[0])}~${clock(x[1])}`).join(", ");
    console.log(`  · ${nameOf(s)} — 공백 ${g}`);
}
if (uncovered.length === 1 && uncovered[0] === CULPRIT) {
    ok(`알리바이가 없는 사람은 ${nameOf(CULPRIT)} 한 명뿐 — 소거법이 성립`);
} else if (uncovered.length === 0) {
    bad("전원에게 알리바이가 있다 — 범인이 없는 사건");
} else {
    bad(`알리바이 없는 사람이 ${uncovered.length}명: ${uncovered.map(nameOf).join(", ")} — 소거법이 성립하지 않음`);
}

// ── 3. 진술 대조 ────────────────────────────────────────────
head("3. 진술끼리 어긋나는 곳");
let clash = 0;
for (const a of suspects) for (const blk of TIMELINE[a] || []) {
    for (const b of (blk.with || [])) {
        if (!TIMELINE[b]) continue;   // victim 등
        const match = TIMELINE[b].some(x =>
            (x.with || []).includes(a) && t(x.from) <= t(blk.from) && t(x.to) >= t(blk.to));
        if (!match) {
            bad(`${nameOf(a)}는 ${blk.from}~${blk.to} 에 ${nameOf(b)}와 함께라는데, ${nameOf(b)} 쪽 기록엔 그 구간이 없다`);
            clash++;
        }
    }
}
if (!clash) ok("동행 진술이 양쪽에서 모두 맞물린다");

// ── 4. 범인 아닌 사람을 지우는 근거 ─────────────────────────
head("4. 용의자를 지우는 근거");
for (const s of suspects) {
    if (s === CULPRIT) continue;
    const c = CLEARED[s];
    if (!c) { bad(`${nameOf(s)} 를 지우는 근거가 없다`); continue; }
    const lost = c.by.filter(r => !reachable(r));
    lost.length ? bad(`${nameOf(s)}: 근거에 도달 불가 — ${lost.join(", ")}`)
                : ok(`${nameOf(s)}: ${c.why} (${c.by.join(", ")})`);
}
if (CLEARED[CULPRIT]) bad(`범인 ${nameOf(CULPRIT)} 에게 면죄 근거가 붙어 있다`);
else ok(`범인 ${nameOf(CULPRIT)} 에게는 면죄 근거가 없다`);

// ── 5. 알리바이가 서로에게만 기대는가 ───────────────────────
head("5. 상호 알리바이 (한쪽이 거짓이면 함께 무너지는 짝)");
const pairs = [];
for (const a of suspects) for (const b of suspects) {
    if (a >= b) continue;
    const aOnB = !covered(a, W[0], W[1], true).length &&
        (TIMELINE[a] || []).some(x => (x.with || []).includes(b) && t(x.from) <= W[0] && t(x.to) >= W[1]);
    const bOnA = !covered(b, W[0], W[1], true).length &&
        (TIMELINE[b] || []).some(x => (x.with || []).includes(a) && t(x.from) <= W[0] && t(x.to) >= W[1]);
    if (aOnB && bOnA) pairs.push([a, b]);
}
if (!pairs.length) ok("서로에게만 기대는 짝 없음");
for (const [a, b] of pairs) {
    const others = new Set();
    for (const s of suspects) if (s !== a && s !== b)
        for (const blk of TIMELINE[s] || [])
            if ((blk.with || []).includes(a) || (blk.with || []).includes(b)) others.add(s);
    const phys = [...new Set([...(CLEARED[a]?.by || []), ...(CLEARED[b]?.by || [])])]
        .filter(r => !r.startsWith("talk:"));
    soft(`${nameOf(a)} ↔ ${nameOf(b)} 가 서로의 유일한 동행 — 물증 ${phys.join(", ") || "없음"} 이 받치고, ${others.size}명의 알리바이가 이 둘에 의존`);
}

// ── 6. 정답의 뒷받침 ────────────────────────────────────────
head("6. 최종 추리 각 문항이 증거로 뒷받침되는가");
let w = 0;
for (const q of CASE.quiz) {
    w += q.weight;
    const sup = SUPPORT[q.id];
    if (!sup) { bad(`${q.id}: 뒷받침 목록이 없다`); continue; }
    const lost = sup.filter(r => !reachable(r));
    if (q.answer < 0 || q.answer >= q.options.length) bad(`${q.id}: 정답 인덱스 범위 밖`);
    lost.length ? bad(`${q.id}: 도달 불가 — ${lost.join(", ")}`)
                : ok(`${q.id}: 증거 ${sup.length}개로 뒷받침 (${q.weight}점)`);
}
w === 100 ? ok("배점 합계 100") : bad(`배점 합계 ${w}`);

// ── 7. 증거 도달성 ──────────────────────────────────────────
head("7. 증거와 단서 연결");
const inLoc = new Set(); CASE.locations.forEach(l => l.clues.forEach(c => inLoc.add(c)));
const orphan = clueIds.filter(c => !inLoc.has(c));
orphan.length ? bad(`어느 장소에도 없는 증거: ${orphan.join(", ")}`) : ok("모든 증거가 어느 장소엔가 놓여 있다");
const unreach = clueIds.filter(c => !reachable(c));
unreach.length ? bad(`선행조건 때문에 못 얻는 증거: ${unreach.join(", ")}`) : ok("모든 증거가 결국 획득 가능");

// 2단 보기를 쓰는 방은 물건이 그 방 증거를 전부 덮는가
for (const loc of CASE.locations.filter(l => l.objects)) {
    const held = new Set(); loc.objects.forEach(o => (o.steps || []).forEach(c => held.add(c)));
    const miss = loc.clues.filter(c => !held.has(c));
    miss.length ? bad(`${loc.name}: 물건에 걸리지 않은 증거 ${miss.join(", ")}`)
                : ok(`${loc.name}: 증거 ${loc.clues.length}개가 물건 ${loc.objects.length}개에 모두 걸림`);
    const empty = loc.objects.filter(o => !(o.steps || []).length).length;
    empty ? ok(`${loc.name}: 2단이 없는 물건 ${empty}개 — 「가까이 본다」가 도박이 된다`)
          : soft(`${loc.name}: 모든 물건에 2단이 있다 — 전부 누르면 그만이라 선택이 없다`);
}

// ── 8. 인물 시트와 게임 데이터가 어긋나는가 ─────────────────
head("8. 인물 시트 점검");
for (const s of CASE.suspects) {
    const sheet = CH.CHARACTERS[s.id];
    if (!sheet) { bad(`${s.name}: 시트 없음`); continue; }
    const bits = [];
    if (!s.fallback) bits.push("fallback 없음");
    if (!s.topics.some(x => !x.after && !x.needs)) bits.push("시작 질문 없음");
    if (!/몸에 밴 것/.test(sheet.sheet)) bits.push("몸에 밴 것 없음");
    const isCulprit = !!sheet.isCulprit;
    if (isCulprit !== (s.id === CULPRIT)) bits.push("범인 표시 불일치");
    bits.length ? bad(`${s.name}: ${bits.join(" / ")}`) : ok(`${s.name}: 시트 ${sheet.sheet.length}자, 이상 없음`);
}
const fatalReach = CH.FATAL.filter(c => !reachable(c));
fatalReach.length ? bad(`치명적 증거 중 도달 불가: ${fatalReach.join(", ")}`)
                  : ok(`치명적 증거 ${CH.FATAL.length}개 모두 획득 가능`);

// ── 결과 ────────────────────────────────────────────────────
console.log("\n" + "─".repeat(54));
console.log(`통과 ${pass} · 주의 ${warn} · 실패 ${fail}`);
console.log(fail ? "\x1b[31m사건이 서지 않는다. 위 실패 항목을 고칠 것.\x1b[0m"
                 : warn ? "\x1b[33m사건은 선다. 주의 항목은 설계상의 선택으로 남길 수 있다.\x1b[0m"
                        : "\x1b[32m빈틈 없음.\x1b[0m");
process.exit(fail ? 1 : 0);
