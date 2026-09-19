// ============================================================
// game2/js/ai.js — 사람들을 Claude가 연기한다
//   1) Artifact 런타임의 sample — 설치 없이 페이지가 직접 묻는다
//   2) 로컬 서버(/api/ask) — npm start. 구독 인증을 그대로 쓴다
//   3) 각본 모드 — 둘 다 없으면 미리 쓰인 대사로 진행한다
// ============================================================

const AI = {
    mode: "offline",
    model: null,
    _sample: null,

    get online() { return this.mode !== "offline"; },

    async probe() {
        try {
            if (typeof window !== "undefined" && window.claude && window.claude.use) {
                const s = await window.claude.use("sample");
                if (s) { this._sample = s; this.mode = "sample"; this.model = "Claude"; return true; }
            }
        } catch (e) { /* 다음 경로로 */ }
        try {
            const r = await fetch("/api/health", { cache: "no-store" });
            if (r.ok) {
                const d = await r.json();
                if (d.ok) { this.mode = "server"; this.model = d.model; return true; }
            }
        } catch (e) { /* 서버 없음 */ }
        this.mode = "offline";
        return false;
    },

    async ask(pid, message, showing, onText, quote) {
        const history = State.chatFor(pid)
            .filter(m => m.role === "user" || m.role === "them")
            .map(m => ({ role: m.role === "user" ? "user" : "assistant", text: m.text }));
        const presented = State.presentedFor(pid);
        const confronts = State.confrontsFor(pid);
        const opened = State.opened(pid);

        if (this.mode === "sample")
            return this._viaSample(pid, message, showing, history, presented, onText, quote, confronts, opened);
        return this._viaServer(pid, message, showing, history, presented, quote, confronts, opened);
    },

    async _viaSample(pid, message, showing, history, presented, onText, quote, confronts, opened) {
        const system = buildSystemPrompt(pid, presented, pressureLabel(presented, confronts),
                                         opened, awarenessLabel(presented, confronts));
        const user = buildUserPrompt({ history, message, showing, quote });
        const res = await this._sample(
            [{ role: "user", content: system + "\n\n──────────\n\n" + user }],
            {
                cache: false,
                modelTier: pid === "peddler" ? "complex" : "default",
                onText: onText ? (e => onText(this._clean(e.text))) : undefined
            }
        );
        return this._finish(res.text);
    },

    async _viaServer(pid, message, showing, history, presented, quote, confronts, opened) {
        const res = await fetch("/api/ask", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ person: pid, message, showing: showing || null, presented,
                                   history, quote: quote || null, confronts: confronts || 0, opened: !!opened })
        });
        const data = await res.json();
        if (!res.ok || data.error) throw new Error(data.error || "응답 실패");
        return { text: data.text, confessed: data.confessed, opened: data.opened };
    },

    _clean(t) { return String(t || "").replace(/\[\[자백\]\]|\[\[마음\]\]/g, "").trim(); },

    _finish(raw) {
        const text = String(raw || "").trim();
        return { text: this._clean(text),
                 confessed: text.indexOf("[[자백]]") !== -1,
                 opened: text.indexOf("[[마음]]") !== -1 };
    },

    explain(e) {
        const code = e && e.code;
        if (code === "not_granted") return "말을 붙일 권한이 허용되지 않았습니다.";
        if (code === "rate_limited") return "한꺼번에 몰렸습니다. 잠시 뒤 다시 물어보십시오.";
        if (code === "cancelled") return "질문이 취소되었습니다.";
        return (e && e.message) || "답을 받지 못했습니다.";
    }
};
