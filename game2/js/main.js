// ============================================================
// game2/js/main.js — 배선
// ============================================================

let prologueIndex = 0;

const Main = {
    closeModal() {
        document.getElementById("modal-evidence").hidden = true;
        document.getElementById("modal-quote").hidden = true;
    },

    // 무언가를 새로 손에 넣을 때마다 막이 넘어갔는지 본다
    afterGain() {
        UI.hud();
        const next = State.checkAct();
        if (next) {
            UI.curtain(next);
            UI.hud();
            Investigate.renderLocations();
        }
    },

    showPrologue(i) {
        const p = CASE.prologue[i];
        if (!p) return this.start();
        document.getElementById("prologue-head").textContent = p.head;
        document.getElementById("prologue-body").innerHTML = p.body;
        document.getElementById("prologue-dots").textContent =
            CASE.prologue.map((_, k) => (k === i ? "●" : "○")).join(" ");
        document.getElementById("btn-prologue-next").textContent =
            (i === CASE.prologue.length - 1) ? "여섯을 만나러 간다" : "다음";
        UI.show("prologue");
    },

    start() {
        State.started = true;
        State.save();
        UI.hud();
        Investigate.renderLocations();
        Interrogate.renderPeople();
        UI.tab("investigate");
        UI.show("game");
    },

    boot() {
        UI.dust(28);
        document.title = CASE.meta.title;

        if (!SEALED) {
            document.getElementById("ai-status").innerHTML =
                "⚠ 봉인 파일을 읽지 못했습니다. <b>node build/seal.mjs</b> 를 먼저 돌려 주십시오.";
        }

        if (State.load() && !State.finished) document.getElementById("btn-continue").hidden = false;

        const status = document.getElementById("ai-status");
        AI.probe().then(() => {
            if (AI.mode === "sample") {
                status.className = "ai-status ok";
                status.innerHTML = "● 일곱 사람을 Claude가 연기합니다 — 무엇이든 자유롭게 물어보십시오.";
            } else if (AI.mode === "server") {
                status.className = "ai-status ok";
                status.innerHTML = `● 인물 연결됨 (${AI.model}) — 무엇이든 자유롭게 물어보십시오.`;
            } else {
                const inArtifact = typeof window !== "undefined" && window.claude && window.claude.use;
                status.className = "ai-status off";
                status.innerHTML = inArtifact
                    ? "○ 각본 모드 — 준비된 질문으로만 진행됩니다."
                    : "○ 각본 모드 — 준비된 질문으로만 진행됩니다.<br>자유 대화를 켜려면 터미널에서 <b>npm start</b> 후 표시된 주소로 들어오십시오.";
            }
        });

        document.getElementById("btn-start").onclick = () => {
            State.reset(); prologueIndex = 0; this.showPrologue(0);
        };
        document.getElementById("btn-continue").onclick = () => this.start();
        document.getElementById("btn-prologue-next").onclick = () => this.showPrologue(++prologueIndex);

        document.querySelectorAll(".tab").forEach(t => t.onclick = () => UI.tab(t.dataset.tab));
        document.querySelectorAll(".nb-tab").forEach(t => t.onclick = () => {
            Notes.view = t.dataset.nb; Notes.render();
        });

        document.getElementById("btn-loc-back").onclick = () => Investigate.renderLocations();
        document.getElementById("btn-chat-back").onclick = () => Interrogate.renderPeople();
        document.getElementById("btn-chat-send").onclick = () => Interrogate.send();
        document.getElementById("chat-text").addEventListener("keydown", e => {
            if (e.key === "Enter" && !e.isComposing) Interrogate.send();
        });
        document.getElementById("btn-show-evidence").onclick = () => Interrogate.openEvidenceModal();
        document.getElementById("btn-show-quote").onclick = () => Interrogate.openQuoteModal();

        ["btn-quote-close", "btn-modal-close"].forEach(id =>
            document.getElementById(id).onclick = () => this.closeModal());
        ["modal-quote", "modal-evidence"].forEach(id =>
            document.getElementById(id).onclick = e => { if (e.target.id === id) this.closeModal(); });
        document.getElementById("btn-curtain-close").onclick = () =>
            document.getElementById("curtain").hidden = true;
        document.addEventListener("keydown", e => {
            if (e.key !== "Escape") return;
            this.closeModal();
            document.getElementById("curtain").hidden = true;
        });

        document.getElementById("btn-goto-verdict").onclick = () => Verdict.open();
        document.getElementById("btn-verdict-back").onclick = () => UI.show("game");
        document.getElementById("btn-verdict-submit").onclick = () => Verdict.submit();
        document.getElementById("btn-verdict-giveup").onclick = () => Verdict.giveUp();
        document.getElementById("btn-replay").onclick = () => { State.reset(); location.reload(); };
    }
};

document.addEventListener("DOMContentLoaded", () => Main.boot());
