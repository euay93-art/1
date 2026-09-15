// ============================================================
// js/main.js — 초기화와 화면 배선
// ============================================================

let prologueIndex = 0;

function showPrologue(i) {
    const p = CASE.prologue[i];
    if (!p) return startGame();
    document.getElementById("prologue-head").textContent = p.head;
    document.getElementById("prologue-body").innerHTML = p.body;
    document.getElementById("prologue-dots").textContent =
        CASE.prologue.map((_, k) => (k === i ? "●" : "○")).join(" ");
    document.getElementById("btn-prologue-next").textContent =
        (i === CASE.prologue.length - 1) ? "조사에 들어간다" : "다음";
    UI.show("prologue");
}

function startGame() {
    State.started = true;
    State.save();
    UI.hud();
    Investigate.renderLocations();
    Interrogate.renderSuspects();
    UI.tab("investigate");
    UI.show("game");
}

function boot() {
    UI.snow(45);
    document.title = CASE.meta.title;

    // 이어서 하기
    const hasSave = State.load();
    if (hasSave && !State.finished) {
        document.getElementById("btn-continue").hidden = false;
    }

    // AI 서버 확인
    const status = document.getElementById("ai-status");
    AI.probe().then(ok => {
        if (ok) {
            status.className = "ai-status ok";
            status.innerHTML = `● 용의자 AI 연결됨 (${AI.model}) — 다섯 명에게 무엇이든 자유롭게 물을 수 있습니다.`;
        } else {
            status.className = "ai-status off";
            status.innerHTML = `○ 각본 모드 — 준비된 질문으로만 진행됩니다.<br>AI 심문을 켜려면 터미널에서 <b>npm start</b> 후 표시된 주소로 접속하십시오.`;
        }
    });

    // 타이틀
    document.getElementById("btn-start").onclick = () => {
        State.reset();
        prologueIndex = 0;
        showPrologue(0);
    };
    document.getElementById("btn-continue").onclick = () => startGame();

    // 프롤로그
    document.getElementById("btn-prologue-next").onclick = () => showPrologue(++prologueIndex);

    // 탭
    document.querySelectorAll(".tab").forEach(t => {
        t.onclick = () => UI.tab(t.dataset.tab);
    });
    document.querySelectorAll(".nb-tab").forEach(t => {
        t.onclick = () => { Notebook.view = t.dataset.nb; Notebook.render(); };
    });

    // 현장 조사
    document.getElementById("btn-loc-back").onclick = () => Investigate.renderLocations();

    // 심문
    document.getElementById("btn-chat-back").onclick = () => Interrogate.renderSuspects();
    document.getElementById("btn-chat-send").onclick = () => Interrogate.send();
    document.getElementById("chat-text").addEventListener("keydown", e => {
        if (e.key === "Enter" && !e.isComposing) Interrogate.send();
    });
    document.getElementById("btn-show-evidence").onclick = () => Interrogate.openEvidenceModal();
    document.getElementById("btn-modal-close").onclick = () => { document.getElementById("modal-evidence").hidden = true; };
    document.getElementById("modal-evidence").onclick = e => {
        if (e.target.id === "modal-evidence") e.target.hidden = true;
    };

    // 최종 추리
    document.getElementById("btn-goto-accuse").onclick = () => Accuse.open();
    document.getElementById("btn-accuse-back").onclick = () => UI.show("game");
    document.getElementById("btn-accuse-submit").onclick = () => Accuse.submit();
    document.getElementById("btn-replay").onclick = () => { State.reset(); location.reload(); };
}

document.addEventListener("DOMContentLoaded", boot);
