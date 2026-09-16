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
        this.watchRadio(() => { if (typeof Partner !== 'undefined') Partner.onRadio(); });
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
            무전함: "radio/" + this.runId + " (Claude가 쓰는 곳) / radio/" + this.runId + "-me (플레이어가 쓰는 곳)",
            배정훈자백: !!State.confessed,
            종료: !!State.finished,
            최종답변: State.finished ? State.answers : null
        };
    },

    // ── 무전 ────────────────────────────────────────────
    // 문서를 둘로 나눠 한쪽만 쓴다. 덮어쓸 일이 없다.
    //   radio/<run>      ← Claude 가 대화창에서 쓴다 (페이지는 읽기만)
    //   radio/<run>-me   ← 플레이어가 쓴다 (Claude 가 읽기만)
    mine: [],
    theirs: [],

    watchRadio(onChange) {
        if (!this.db) return;
        this._onRadio = onChange;
        try {
            this.db.doc("radio/" + this.runId).onSnapshot(
                snap => {
                    const d = snap.exists ? snap.data() : null;
                    this.theirs = (d && Array.isArray(d.msgs)) ? d.msgs : [];
                    if (this._onRadio) this._onRadio();
                },
                () => { /* 구독이 끊기면 조용히 포기한다 */ }
            );
        } catch (e) { /* 경로 오류 등 */ }
    },

    radioLog() {
        return [].concat(
            this.mine.map(m => ({ from: "me", text: m.text, at: m.at })),
            this.theirs.map(m => ({ from: "claude", text: String(m.text || ""), at: m.at }))
        ).sort((a, b) => String(a.at).localeCompare(String(b.at)));
    },

    async sayRadio(text) {
        if (!this.db) throw new Error("무전을 쓸 수 없는 화면입니다.");
        this.mine.push({ text, at: new Date().toISOString() });
        if (this.mine.length > 80) this.mine = this.mine.slice(-80);
        await this.db.doc("radio/" + this.runId + "-me").set({
            msgs: this.mine,
            갱신시각: new Date().toISOString(),
            증거수: State.found.length,
            게임내시각: State.clock()
        });
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
