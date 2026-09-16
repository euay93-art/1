// ============================================================
// js/ui.js — 화면 전환, HUD, 눈, 토스트
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
        if (name === "notebook") Notebook.render();
    },

    hud() {
        document.getElementById("hud-clock").textContent = State.clock();
        const dl = document.getElementById("hud-deadline");
        dl.textContent = State.remainText();
        dl.classList.toggle("urgent", CASE.meta.endMinute - State.minute <= 90);
        const total = Object.keys(CASE.clues).length;
        document.getElementById("hud-count").textContent = `증거 ${State.found.length} / ${total}`;
    },

    toast(msg, ms) {
        const t = document.getElementById("toast");
        t.textContent = msg;
        t.hidden = false;
        clearTimeout(this._toastTimer);
        this._toastTimer = setTimeout(() => { t.hidden = true; }, ms || 2600);
    },

    snow(count) {
        const box = document.getElementById("snow");
        const glyphs = ["❄", "❅", "•", "·"];
        let html = "";
        for (let i = 0; i < (count || 40); i++) {
            const left = Math.random() * 100;
            const dur = 8 + Math.random() * 14;
            const delay = -Math.random() * dur;
            const size = 7 + Math.random() * 11;
            const drift = (Math.random() * 120 - 60).toFixed(0);
            html += `<span style="left:${left}%;font-size:${size}px;animation-duration:${dur}s;animation-delay:${delay}s;--drift:${drift}px">${glyphs[i % glyphs.length]}</span>`;
        }
        box.innerHTML = html;
    },

    // 타자기 효과로 한 글자씩 출력
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
