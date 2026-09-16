// ============================================================
// js/state.js — 게임 상태와 저장
// ============================================================

const SAVE_KEY = "seolyajang.save.v1";

const State = {
    started: false,
    minute: CASE.meta.startMinute,
    found: [],          // 발견한 증거 id
    presented: {},       // 용의자별로 제시한 증거 id 배열
    chats: {},           // 용의자별 대화 기록 [{role,text}]
    asked: [],           // 오프라인 모드에서 소비한 질문 id
    quoted: [],          // 이미 대질에 쓴 진술
    confronted: {},      // 용의자별 대질 횟수
    confessed: false,    // 배정훈이 자백했는가
    answers: {},         // 최종 추리 선택
    finished: false,

    has(id) { return this.found.includes(id); },

    canFind(id) {
        const c = CASE.clues[id];
        if (!c || !c.requires) return true;
        return c.requires.every(r => this.has(r));
    },

    find(id) {
        if (this.has(id)) return false;
        this.found.push(id);
        this.spend();
        this.save();
        return true;
    },

    presentedFor(sid) { return this.presented[sid] || (this.presented[sid] = []); },

    confront(sid) { this.confronted[sid] = (this.confronted[sid] || 0) + 1; },
    confrontsFor(sid) { return this.confronted[sid] || 0; },

    present(sid, cid) {
        const list = this.presentedFor(sid);
        if (!list.includes(cid)) list.push(cid);
        this.save();
    },

    chatFor(sid) { return this.chats[sid] || (this.chats[sid] = []); },

    spend(n) {
        this.minute += (n === undefined ? CASE.meta.actionCost : n);
        if (this.minute > CASE.meta.endMinute) this.minute = CASE.meta.endMinute;
    },

    timeUp() { return this.minute >= CASE.meta.endMinute; },

    clock() {
        const h = Math.floor(this.minute / 60), m = this.minute % 60;
        return String(h).padStart(2, "0") + ":" + String(m).padStart(2, "0");
    },

    remainText() {
        const left = CASE.meta.endMinute - this.minute;
        if (left <= 0) return "경찰이 도착했다";
        const h = Math.floor(left / 60), m = left % 60;
        return `경찰 도착까지 ${h ? h + "시간 " : ""}${m}분`;
    },

    save() {
        try {
            localStorage.setItem(SAVE_KEY, JSON.stringify({
                started: this.started, minute: this.minute, found: this.found,
                presented: this.presented, chats: this.chats, asked: this.asked,
                quoted: this.quoted, confronted: this.confronted,
                confessed: this.confessed, answers: this.answers, finished: this.finished
            }));
        } catch (e) { /* 사생활 보호 모드 등 — 저장 없이 진행 */ }
    },

    // 저장 내용은 믿지 않는다. 손상됐거나 옛 판본이어도 게임이 서야 한다.
    load() {
        try {
            const raw = localStorage.getItem(SAVE_KEY);
            if (!raw) return false;
            const d = JSON.parse(raw);
            if (!d || d.started !== true) return false;

            const clueIds = Object.keys(CASE.clues);
            const suspectIds = CASE.suspects.map(s => s.id);
            const topicIds = [];
            CASE.suspects.forEach(s => (s.topics || []).forEach(t => topicIds.push(t.id)));

            const clamp = (v, lo, hi, dflt) =>
                (typeof v === "number" && isFinite(v)) ? Math.min(hi, Math.max(lo, v)) : dflt;
            const known = (v, allow) =>
                Array.isArray(v) ? v.filter(x => allow.indexOf(x) !== -1) : [];
            const plain = v => (v && typeof v === "object" && !Array.isArray(v)) ? v : {};

            this.started = true;
            this.minute = clamp(d.minute, CASE.meta.startMinute, CASE.meta.endMinute, CASE.meta.startMinute);
            this.found = known(d.found, clueIds);
            this.asked = known(d.asked, topicIds);
            this.quoted = Array.isArray(d.quoted) ? d.quoted.filter(x => typeof x === "string") : [];
            const cf = plain(d.confronted);
            this.confronted = {};
            suspectIds.forEach(id => {
                this.confronted[id] = (typeof cf[id] === "number" && cf[id] > 0) ? Math.floor(cf[id]) : 0;
            });
            this.confessed = !!d.confessed;
            this.finished = !!d.finished;

            const pres = plain(d.presented);
            this.presented = {};
            suspectIds.forEach(id => { this.presented[id] = known(pres[id], clueIds); });

            const ch = plain(d.chats);
            this.chats = {};
            suspectIds.forEach(id => {
                this.chats[id] = Array.isArray(ch[id])
                    ? ch[id].filter(m => m && typeof m.role === "string" && typeof m.text === "string")
                    : [];
            });

            const ans = plain(d.answers);
            this.answers = {};
            CASE.quiz.forEach(q => { if (typeof ans[q.id] === "number") this.answers[q.id] = ans[q.id]; });

            return true;
        } catch (e) { return false; }
    },

    reset() {
        this.started = false;
        this.minute = CASE.meta.startMinute;
        this.found = []; this.presented = {}; this.chats = {}; this.asked = []; this.quoted = []; this.confronted = {};
        this.confessed = false; this.answers = {}; this.finished = false;
        try { localStorage.removeItem(SAVE_KEY); } catch (e) {}
    }
};
