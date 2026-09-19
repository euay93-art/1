// ============================================================
// game2/js/state.js — 상태와 저장
// 이 게임에 시계는 없다. 대신 막(幕)이 있다.
// ============================================================

const SAVE_KEY = "chimseon.save.v1";

const State = {
    started: false,
    act: 1,
    found: [],          // 찾은 증거 id
    asked: [],          // 들은 문답 id (talk:xxx 포함)
    looked: [],         // 훑어본 물건
    presented: {},      // 사람별로 내민 증거
    chats: {},          // 사람별 대화
    quoted: [],         // 이미 물려 놓은 말
    confronted: {},     // 사람별 대질 횟수
    trust: {},          // 마음을 연 사람
    confessed: false,
    verdict: null,      // { name, proof: {factId: clueId} }
    disposal: null,     // 진엔딩 뒤의 처분
    finished: false,

    // 증거든 증언이든, 손에 들어온 것은 다 여기서 본다
    has(id) { return this.found.indexOf(id) !== -1 || this.asked.indexOf(id) !== -1; },

    canFind(id) {
        const c = CASE.clues[id];
        if (!c || !c.requires) return true;
        return c.requires.every(r => this.has(r));
    },

    find(id) {
        if (this.found.indexOf(id) !== -1) return false;
        this.found.push(id);
        this.save();
        return true;
    },

    hear(id) {
        if (this.asked.indexOf(id) !== -1) return false;
        this.asked.push(id);
        this.save();
        return true;
    },

    presentedFor(sid) { return this.presented[sid] || (this.presented[sid] = []); },
    present(sid, cid) {
        const list = this.presentedFor(sid);
        if (list.indexOf(cid) === -1) list.push(cid);
        this.save();
    },
    chatFor(sid) { return this.chats[sid] || (this.chats[sid] = []); },
    confront(sid) { this.confronted[sid] = (this.confronted[sid] || 0) + 1; },
    confrontsFor(sid) { return this.confronted[sid] || 0; },
    opened(sid) { return !!this.trust[sid]; },
    openUp(sid) { this.trust[sid] = true; },

    // ── 막 ──────────────────────────────────────────────
    // 1막: 순사가 무엇을 쥐었나. 2막: 누가 무엇을 알았나. 3막: 짚는다.
    factsStanding() {
        return CASE.facts.filter(f => Grid.factProven(f.id)).length;
    },
    cellsFilled() { return Grid.filledCount(); },

    // 한 번에 한 막씩만 넘어간다. 두 조건이 동시에 찼다고
    // 2막을 건너뛰면 플레이어는 자기가 뭘 했는지 모르게 된다.
    checkAct() {
        if (this.act === 1 && this.factsStanding() >= 4) { this.act = 2; this.save(); return CASE.acts[1]; }
        if (this.act === 2 && this.cellsFilled() >= 16) { this.act = 3; this.save(); return CASE.acts[2]; }
        return null;
    },

    save() {
        try {
            localStorage.setItem(SAVE_KEY, JSON.stringify({
                started: this.started, act: this.act, found: this.found, asked: this.asked,
                looked: this.looked, presented: this.presented, chats: this.chats,
                quoted: this.quoted, confronted: this.confronted, trust: this.trust,
                confessed: this.confessed, verdict: this.verdict,
                disposal: this.disposal, finished: this.finished
            }));
        } catch (e) { /* 사생활 보호 모드 — 저장 없이 진행 */ }
    },

    // 저장 내용은 믿지 않는다. 손상됐거나 옛 판본이어도 게임이 서야 한다.
    load() {
        try {
            const raw = localStorage.getItem(SAVE_KEY);
            if (!raw) return false;
            const d = JSON.parse(raw);
            if (!d || d.started !== true) return false;

            const clueIds = Object.keys(CASE.clues);
            const people = People.all().map(p => p.id);
            const topicIds = [];
            People.all().forEach(p => (p.topics || []).forEach(t => topicIds.push(t.id)));

            const known = (v, allow) => Array.isArray(v) ? v.filter(x => allow.indexOf(x) !== -1) : [];
            const plain = v => (v && typeof v === "object" && !Array.isArray(v)) ? v : {};

            this.started = true;
            this.act = (d.act === 2 || d.act === 3) ? d.act : 1;
            this.found = known(d.found, clueIds);
            this.asked = known(d.asked, topicIds);
            this.looked = Array.isArray(d.looked) ? d.looked.filter(x => typeof x === "string") : [];
            this.quoted = Array.isArray(d.quoted) ? d.quoted.filter(x => typeof x === "string") : [];
            this.confessed = !!d.confessed;
            this.finished = !!d.finished;

            const tr = plain(d.trust), cf = plain(d.confronted);
            this.trust = {}; this.confronted = {};
            people.forEach(id => {
                this.trust[id] = !!tr[id];
                this.confronted[id] = (typeof cf[id] === "number" && cf[id] > 0) ? Math.floor(cf[id]) : 0;
            });

            const pres = plain(d.presented), ch = plain(d.chats);
            this.presented = {}; this.chats = {};
            people.forEach(id => {
                this.presented[id] = known(pres[id], clueIds);
                this.chats[id] = Array.isArray(ch[id])
                    ? ch[id].filter(m => m && typeof m.role === "string" && typeof m.text === "string")
                    : [];
            });

            const v = plain(d.verdict);
            this.verdict = (typeof v.name === "string") ? { name: v.name, proof: plain(v.proof) } : null;
            const disp = CASE.disposal.map(x => x.id);
            this.disposal = disp.indexOf(d.disposal) !== -1 ? d.disposal : null;

            return true;
        } catch (e) { return false; }
    },

    reset() {
        this.started = false; this.act = 1;
        this.found = []; this.asked = []; this.looked = []; this.presented = {};
        this.chats = {}; this.quoted = []; this.confronted = {}; this.trust = {};
        this.confessed = false; this.verdict = null; this.disposal = null; this.finished = false;
        try { localStorage.removeItem(SAVE_KEY); } catch (e) {}
    }
};
