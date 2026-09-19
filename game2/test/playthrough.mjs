// ============================================================
// game2/test/playthrough.mjs
// 사람이 하듯 끝까지 눌러본다. 격자가 차는지, 엔딩이 나오는지.
//   node test/playthrough.mjs
// ============================================================
import { chromium } from "playwright";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const K = require(join(ROOT, "server/knowledge.js"));

const log = [];
const say = m => { log.push(m); console.log(m); };
let problems = 0;
const bad = m => { problems++; console.log("  ✗ " + m); };

const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" });
const page = await browser.newPage({ viewport: { width: 390, height: 844 } });

const errors = [];
// file:// 로 여는 탓에 생기는 소음은 걸러낸다 — 글꼴과 서버 탐색 실패.
const noise = t => /fonts\.g|api\/health|ERR_CERT|ERR_FAILED|CORS policy/.test(t);
page.on("pageerror", e => { if (!noise(String(e))) errors.push(String(e)); });
page.on("console", m => { if (m.type() === "error" && !noise(m.text())) errors.push(m.text()); });

await page.goto("file://" + join(ROOT, "dist/chimseonkye.html"));
await page.waitForTimeout(600);

// ── 시작 ────────────────────────────────────────────────────
await page.click("#btn-start");
for (let i = 0; i < 12; i++) {
    if (!(await page.isVisible("#screen-prologue.active"))) break;
    await page.click("#btn-prologue-next");
    await page.waitForTimeout(120);
}
if (!(await page.isVisible("#screen-game.active"))) bad("본편으로 들어가지 못했다");

// 막이 넘어가면 알림이 화면을 덮는다. 사람이 하듯 치우고 계속한다.
const curtains = [];
async function clear() {
    if (!(await page.isVisible("#curtain"))) return false;
    curtains.push((await page.textContent("#curtain-name")).trim());
    await page.click("#btn-curtain-close");
    await page.waitForTimeout(150);
    return true;
}

// ── 가로 넘침 ───────────────────────────────────────────────
const overflow = async where => {
    const w = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    if (w > 0) bad(`${where}: 가로로 ${w}px 넘친다`);
};
await overflow("본편 첫 화면");

// ── 발로 뛴다 : 모든 곳, 모든 물건 ──────────────────────────
async function sweep() {
    let gained = 0;
    await page.click('.tab[data-tab="investigate"]');
    await page.waitForTimeout(100);
    const locs = await page.$$eval(".loc-card[data-loc]", els => els.map(e => e.dataset.loc));
    for (const id of locs) {
        await clear();
        await page.click(`.loc-card[data-loc="${id}"]`);
        await page.waitForTimeout(120);
        // 누를 때마다 화면이 다시 그려진다. 붙들고 있던 손잡이는 떨어진다.
        for (let step = 0; step < 60; step++) {
            await clear();
            const look = page.locator("[data-look]").first();
            if (await look.count()) { await look.click(); await page.waitForTimeout(60); continue; }
            const closer = page.locator("[data-closer]").first();
            if (await closer.count()) { await closer.click(); await page.waitForTimeout(90); gained++; continue; }
            break;
        }
        await overflow("장소 " + id);
        await page.click("#btn-loc-back");
        await page.waitForTimeout(80);
    }
    return gained;
}

// ── 만난다 : 열리는 문답을 모두 ─────────────────────────────
async function talkAll() {
    await page.click('.tab[data-tab="interrogate"]');
    await page.waitForTimeout(100);
    const people = await page.$$eval(".sus-card", els => els.map(e => e.dataset.sus));
    let asked = 0;
    for (const id of people) {
        await clear();
        await page.click(`.sus-card[data-sus="${id}"]`);
        await page.waitForTimeout(120);
        for (let step = 0; step < 40; step++) {
            await clear();
            const chip = page.locator(".chip").first();
            if (!(await chip.count())) break;
            await chip.click(); await page.waitForTimeout(80); asked++;
        }
        await overflow("대화 " + id);
        await page.click("#btn-chat-back");
        await page.waitForTimeout(80);
    }
    return asked;
}

let clues = 0, asked = 0;
for (let pass = 1; pass <= 4; pass++) {
    const g = await sweep();
    const a = await talkAll();
    clues += g; asked += a;
    await clear();
    if (!g && !a) break;
}
say(`증거 ${clues}개 · 문답 ${asked}개`);
say(`넘어간 막: ${curtains.join(" → ") || "없음"}`);
await clear();

// ── 격자 ────────────────────────────────────────────────────
await clear();
await page.click('.tab[data-tab="grid"]');
await page.waitForTimeout(200);
await overflow("격자");
const filled = await page.evaluate(() => Grid.filledCount());
const full = await page.evaluate(() => Grid.fullKnowers().map(s => s.id));
say(`격자 ${filled} / 24 · 넷을 다 쥔 사람 ${full.length}명`);
if (filled !== 24) bad(`격자가 다 차지 않았다 (${filled}/24)`);
if (full.length !== 1) bad(`넷을 다 쥔 사람이 ${full.length}명이다`);
else if (full[0] !== K.CULPRIT) bad("격자가 가리키는 사람이 답과 다르다");

const act = await page.evaluate(() => State.act);
if (act !== 3) bad(`3막에 들어가지 못했다 (지금 ${act}막)`);

// ── 수첩 ────────────────────────────────────────────────────
for (const nb of ["clues", "words", "people"]) {
    await page.click('.tab[data-tab="notes"]');
    await page.click(`.nb-tab[data-nb="${nb}"]`);
    await page.waitForTimeout(120);
    const len = (await page.textContent("#nb-body")).trim().length;
    if (len < 40) bad(`수첩 ${nb} 가 비어 있다`);
    await overflow("수첩 " + nb);
}

// ── 이름을 댄다 ─────────────────────────────────────────────
// MODE=full|thin|doubt|wrong|silence 로 끝맺음을 바꿔 가며 본다.
const MODE = process.env.MODE || "full";
const WANT = { full: "진", thin: "A", doubt: "C", wrong: "F", silence: "—" }[MODE];

await page.click("#btn-goto-verdict");
await page.waitForTimeout(250);
await overflow("최종 판단");

if (MODE === "silence") {
    page.on("dialog", d => d.accept());
    await page.click("#btn-verdict-giveup");
} else {
    const name = MODE === "wrong"
        ? Object.keys(K.MEMBERS).find(id => id !== K.CULPRIT)
        : K.CULPRIT;
    await page.click(`.vname[data-name="${name}"]`);
    await page.waitForTimeout(100);
    const facts = Object.keys(K.FACTS);
    const rightUpTo = { full: 4, thin: 2, doubt: 1, wrong: 4 }[MODE];
    for (let i = 0; i < facts.length; i++) {
        const f = facts[i];
        const opts = await page.$$eval(`select[data-fact="${f}"] option`, els => els.map(e => e.value).filter(Boolean));
        const want = K.KNEW[K.CULPRIT][f].proof || [];
        const good = want.find(w => opts.includes(w));
        const junk = opts.find(o => !want.includes(o));
        const pick = i < rightUpTo ? good : junk;
        if (!pick) { bad(`${f}: 고를 근거가 목록에 없다`); continue; }
        await page.selectOption(`select[data-fact="${f}"]`, pick);
    }
    await page.click("#btn-verdict-submit");
}
await page.waitForTimeout(400);

if (!(await page.isVisible("#screen-ending.active"))) bad("엔딩 화면이 뜨지 않았다");
const grade = await page.textContent("#rank-grade");
const title = await page.textContent("#rank-title");
const score = await page.textContent("#rank-score");
say(`엔딩 ${grade} · ${title} · ${score}`);
if (grade !== WANT) bad(`${MODE}: 기대한 등급은 ${WANT} 인데 ${grade} 가 나왔다`);

// 처분 선택은 진엔딩에서만 열린다
const disp = await page.locator("[data-disp]").count();
if (MODE !== "full") { if (disp) bad(`${MODE} 인데 처분 선택이 열렸다`); }
else if (disp !== 3) bad(`처분 선택지가 ${disp}개다`);
else {
    await page.locator("[data-disp]").nth(1).click();
    await page.waitForTimeout(150);
    const line = (await page.textContent("#disposal-line")).trim();
    if (line.length < 20) bad("처분 후일담이 나오지 않았다");
}
if (MODE !== "full" && MODE !== "silence") { /* 나머지는 전모만 본다 */ }
const sol = (await page.textContent("#solution-body")).trim();
if (sol.length < 200) bad("전모가 비어 있다");
await overflow("엔딩");

if (errors.length) { errors.slice(0, 5).forEach(e => bad("콘솔 오류: " + e.slice(0, 160))); }

await browser.close();
console.log("\n" + "─".repeat(50));
console.log(problems ? `\x1b[31m[${MODE}] 문제 ${problems}건\x1b[0m` : `\x1b[32m[${MODE}] 끝까지 돌아간다. 문제 없음.\x1b[0m`);
process.exit(problems ? 1 : 0);
