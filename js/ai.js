// ============================================================
// js/ai.js — AI 용의자 연결
//
// 세 가지 경로를 순서대로 시도한다.
//   1) Artifact 런타임의 sample 기능 — 설치 없이 페이지가 직접 Claude에게 묻는다
//   2) 로컬 서버(/api/ask) — npm start 로 띄운 경우, 구독 인증을 그대로 쓴다
//   3) 각본 모드 — 둘 다 없으면 case.js 의 미리 쓰인 대사로 진행한다
// ============================================================

const AI = {
    mode: "offline",       // "sample" | "server" | "offline"
    model: null,
    _sample: null,

    get online() { return this.mode !== "offline"; },

    async probe() {
        // 1) Artifact 런타임
        try {
            if (typeof window !== "undefined" && window.claude && window.claude.use) {
                const s = await window.claude.use("sample");
                if (s) {
                    this._sample = s;
                    this.mode = "sample";
                    this.model = "Claude";
                    return true;
                }
            }
        } catch (e) { /* 사용할 수 없으면 다음 경로로 */ }

        // 2) 로컬 서버
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

    // { text, confessed } 를 반환한다. onText 가 있으면 생성 중에 계속 호출된다.
    async ask(suspectId, message, showing, onText) {
        const history = State.chatFor(suspectId)
            .filter(m => m.role === "user" || m.role === "them")
            .map(m => ({ role: m.role === "user" ? "user" : "assistant", text: m.text }));
        const presented = State.presentedFor(suspectId);

        if (this.mode === "sample") return this._viaSample(suspectId, message, showing, history, presented, onText);
        return this._viaServer(suspectId, message, showing, history, presented);
    },

    async _viaSample(suspectId, message, showing, history, presented, onText) {
        const system = buildSystemPrompt(suspectId, presented, pressureLabel(presented));
        const user = buildUserPrompt({ history, message, showing });

        const res = await this._sample(
            [{ role: "user", content: system + "\n\n──────────\n\n" + user }],
            {
                cache: false,
                modelTier: suspectId === "bae" ? "complex" : "default",
                onText: onText ? (e => onText(this._clean(e.text))) : undefined
            }
        );
        return this._finish(res.text);
    },

    async _viaServer(suspectId, message, showing, history, presented) {
        const res = await fetch("/api/ask", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ suspect: suspectId, message, showing: showing || null, presented, history })
        });
        const data = await res.json();
        if (!res.ok || data.error) throw new Error(data.error || "응답 실패");
        return { text: data.text, confessed: data.confessed };
    },

    // 인물 연기가 아닌 자유 호출 (동행 수사)
    async raw(prompt, onText) {
        if (this.mode === "sample") {
            const res = await this._sample(
                [{ role: "user", content: prompt }],
                { cache: false, modelTier: "complex", onText: onText ? (e => onText(e.text)) : undefined }
            );
            return String(res.text || "").trim();
        }
        const res = await fetch("/api/raw", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ prompt })
        });
        const data = await res.json();
        if (!res.ok || data.error) throw new Error(data.error || "응답 실패");
        return data.text;
    },

    _clean(t) { return String(t || "").replace(/\[\[자백\]\]/g, "").trim(); },

    _finish(raw) {
        const text = String(raw || "").trim();
        return { text: this._clean(text), confessed: text.includes("[[자백]]") };
    },

    // 오류 코드를 사람이 읽을 수 있는 말로
    explain(e) {
        const code = e && e.code;
        if (code === "not_granted") return "심문 권한이 허용되지 않았습니다.";
        if (code === "rate_limited") return "요청이 몰렸습니다. 잠시 뒤 다시 물어보십시오.";
        if (code === "cancelled") return "질문이 취소되었습니다.";
        return (e && e.message) || "응답을 받지 못했습니다.";
    }
};
