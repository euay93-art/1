// ============================================================
// js/ai.js — AI 용의자 연결
// 서버(server/server.js)가 살아 있으면 Claude가 인물을 연기하고,
// 없으면 case.js의 각본 대사로 자동 전환된다.
// ============================================================

const AI = {
    online: false,
    model: null,

    async probe() {
        try {
            const r = await fetch("/api/health", { cache: "no-store" });
            if (!r.ok) throw new Error();
            const d = await r.json();
            this.online = !!d.ok;
            this.model = d.model;
        } catch (e) {
            this.online = false;
        }
        return this.online;
    },

    // 서버에 질문을 던진다. { text, confessed } 반환.
    async ask(suspectId, message, showing) {
        const history = State.chatFor(suspectId)
            .filter(m => m.role === "user" || m.role === "them")
            .map(m => ({ role: m.role === "user" ? "user" : "assistant", text: m.text }));

        const res = await fetch("/api/ask", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                suspect: suspectId,
                message: message,
                showing: showing || null,
                presented: State.presentedFor(suspectId),
                history: history
            })
        });

        const data = await res.json();
        if (!res.ok || data.error) throw new Error(data.error || "응답 실패");
        return data;
    }
};
