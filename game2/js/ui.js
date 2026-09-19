// ============================================================
// game2/js/ui.js — 화면 전환, 머리띠, 토스트
// ============================================================

const UI = {
    show(id) {
        document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
        const el = document.getElementById("screen-" + id);
        if (el) el.classList.add("active");
        window.scrollTo({ top: 0, behavior: "instant" in window ? "instant" : "auto" });
    },

    tab(name) {
        document.querySelectorAll(".tab").forEach(t => t.classList.toggle("active", t.dataset.tab === name));
        document.querySelectorAll(".panel").forEach(p => p.classList.toggle("active", p.id === "panel-" + name));
        if (name === "grid") Grid.render();
        if (name === "notes") Notes.render();
    },

    hud() {
        const act = CASE.acts[State.act - 1];
        document.getElementById("hud-act").textContent = `${["一", "二", "三"][State.act - 1]}막 · ${act.name}`;
        document.getElementById("hud-goal").textContent = act.goal;
        document.getElementById("hud-count").textContent =
            `증거 ${State.found.length} / ${Object.keys(CASE.clues).length} · 격자 ${Grid.filledCount()} / 24`;
        document.getElementById("btn-goto-verdict").hidden = State.act < 3;
    },

    // 막이 바뀔 때만 화면을 멈춘다
    curtain(act) {
        const el = document.getElementById("curtain");
        document.getElementById("curtain-act").textContent = ["一", "二", "三"][act.id - 1] + " 막";
        document.getElementById("curtain-name").textContent = act.name;
        document.getElementById("curtain-open").textContent = act.open;
        document.getElementById("curtain-goal").textContent = act.goal;
        el.hidden = false;
    },

    toast(msg, ms) {
        const t = document.getElementById("toast");
        t.innerHTML = msg;
        t.hidden = false;
        clearTimeout(this._toastTimer);
        this._toastTimer = setTimeout(() => { t.hidden = true; }, ms || 2800);
    },

    // 경성의 밤. 눈이 아니라 등사판 먼지와 재가 내린다.
    dust(count) {
        const box = document.getElementById("dust");
        if (!box) return;
        let html = "";
        for (let i = 0; i < (count || 30); i++) {
            const left = Math.random() * 100;
            const dur = 14 + Math.random() * 22;
            const delay = -Math.random() * dur;
            const size = 2 + Math.random() * 3;
            const drift = (Math.random() * 90 - 45).toFixed(0);
            html += `<span style="left:${left}%;width:${size}px;height:${size}px;animation-duration:${dur}s;animation-delay:${delay}s;--drift:${drift}px"></span>`;
        }
        box.innerHTML = html;
    },

    type(el, text, speed) {
        return new Promise(resolve => {
            el.textContent = "";
            let i = 0;
            const step = () => {
                if (i >= text.length) return resolve();
                el.textContent += text[i++];
                const log = el.closest(".chat-log");
                if (log) log.scrollTop = log.scrollHeight;
                setTimeout(step, speed || 16);
            };
            step();
        });
    }
};
