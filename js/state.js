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
    partnerChat: [],     // 동행 수사 대화
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
                partnerChat: this.partnerChat,
                confessed: this.confessed, answers: this.answers, finished: this.finished
            }));
        } catch (e) { /* 사생활 보호 모드 등 — 저장 없이 진행 */ }
        if (typeof Sync !== "undefined") Sync.push();
    },

    load() {
        try {
            const raw = localStorage.getItem(SAVE_KEY);
            if (!raw) return false;
            const d = JSON.parse(raw);
            if (!d || !d.started) return false;
            Object.assign(this, d);
            return true;
        } catch (e) { return false; }
    },

    reset() {
        this.started = false;
        this.minute = CASE.meta.startMinute;
        this.found = []; this.presented = {}; this.chats = {}; this.asked = [];
        this.partnerChat = [];
        this.confessed = false; this.answers = {}; this.finished = false;
        try { localStorage.removeItem(SAVE_KEY); } catch (e) {}
    }
};
