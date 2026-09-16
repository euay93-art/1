// ============================================================
// js/sync.js — 진행 기록을 아티팩트 DB에 올린다
// 이걸 켜 두면 Claude가 대화 쪽에서 내 수사 진행을 읽고 같이 볼 수 있다.
// DB를 못 쓰는 환경이면 조용히 꺼진다.
// ============================================================

const Sync = {
    db: null,
    runId: null,
    dirty: false,
    inflight: false,
    timer: null,

    async init() {
        try {
            if (!(typeof window !== "undefined" && window.claude && window.claude.use)) return false;
            this.db = await window.claude.use("db");
            if (!this.db) return false;
        } catch (e) { return false; }

        try {
            this.runId = localStorage.getItem("seolyajang.run");
        } catch (e) { /* 저장 불가 */ }
        if (!this.runId) {
            this.runId = "run-" + new Date().toISOString().slice(0, 16).replace(/[-:T]/g, "") +
                         "-" + Math.random().toString(36).slice(2, 6);
            try { localStorage.setItem("seolyajang.run", this.runId); } catch (e) {}
        }
        this.push();
        return true;
    },

    snapshot() {
        const talked = {};
        CASE.suspects.forEach(s => {
            const lines = (State.chats[s.id] || []).filter(m => m.role === "user" || m.role === "them");
            if (lines.length) {
                talked[s.name] = lines.map(m => (m.role === "user" ? "나: " : s.name + ": ") + m.text);
            }
        });

        return {
            갱신시각: new Date().toISOString(),
            게임내시각: State.clock(),
            남은시간: State.remainText(),
            증거: State.found.map(id => CASE.clues[id].name),
            미발견: Object.keys(CASE.clues).filter(id => !State.has(id)).map(id => CASE.clues[id].name),
            제시한증거: Object.fromEntries(Object.entries(State.presented || {})
                .filter(([, v]) => v && v.length)
                .map(([sid, v]) => [
                    (CASE.suspects.find(s => s.id === sid) || {}).name || sid,
                    v.map(c => CASE.clues[c].name)
                ])),
            심문: talked,
            동행대화: (State.partnerChat || []).map(m => (m.role === "user" ? "나: " : "동료: ") + m.text),
            배정훈자백: !!State.confessed,
            종료: !!State.finished,
            최종답변: State.finished ? State.answers : null
        };
    },

    // 잦은 변경을 한 번의 쓰기로 모은다
    push() {
        if (!this.db) return;
        this.dirty = true;
        clearTimeout(this.timer);
        this.timer = setTimeout(() => this._flush(), 1200);
    },

    async _flush() {
        if (!this.db || !this.dirty || this.inflight) return;
        this.inflight = true;
        this.dirty = false;
        try {
            await this.db.doc("plays/" + this.runId).set(this.snapshot());
        } catch (e) {
            this.dirty = true;   // 다음 기회에 다시
        } finally {
            this.inflight = false;
            if (this.dirty) setTimeout(() => this._flush(), 3000);
        }
    }
};
