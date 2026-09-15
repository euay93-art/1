// ============================================================
// js/investigate.js — 현장 조사
// ============================================================

const Investigate = {
    current: null,

    renderLocations() {
        const grid = document.getElementById("loc-grid");
        grid.innerHTML = CASE.locations.map(loc => {
            const total = loc.clues.length;
            const got = loc.clues.filter(c => State.has(c)).length;
            const done = got === total;
            return `<button class="loc-card" data-loc="${loc.id}">
                <span class="loc-icon">${loc.icon}</span>
                <b>${loc.name}</b>
                <span class="loc-prog ${done ? "done" : ""}">${done ? "조사 완료" : `단서 ${got} / ${total}`}</span>
            </button>`;
        }).join("");

        grid.querySelectorAll(".loc-card").forEach(b => {
            b.onclick = () => this.open(b.dataset.loc);
        });

        document.getElementById("loc-grid").hidden = false;
        document.getElementById("loc-detail").hidden = true;
    },

    open(id) {
        this.current = CASE.locations.find(l => l.id === id);
        if (!this.current) return;
        document.getElementById("loc-grid").hidden = true;
        document.getElementById("loc-detail").hidden = false;
        document.getElementById("loc-name").textContent = this.current.icon + "  " + this.current.name;
        document.getElementById("loc-desc").textContent = this.current.desc;
        this.renderClues();
    },

    renderClues() {
        const box = document.getElementById("clue-list");
        box.innerHTML = this.current.clues.map(id => {
            const c = CASE.clues[id];
            if (State.has(id)) {
                return `<div class="clue ${c.key ? "key" : ""}">
                    <div class="clue-head">
                        <span>${c.icon}</span><b>${c.name}</b>
                        <span class="clue-tag ${c.tag}">${c.tag}</span>
                    </div>
                    <p class="clue-text">${c.text}</p>
                </div>`;
            }
            const ok = State.canFind(id);
            const need = ok ? "" : `<div class="clue-hint">먼저 ${c.requires.map(r => "「" + CASE.clues[r].name + "」").join(", ")}을(를) 확인해야 한다.</div>`;
            return `<div class="clue locked">
                <div class="clue-undiscovered">
                    <span>${ok ? "아직 살펴보지 않은 곳이 있다." : "지금은 의미를 알 수 없다."}</span>
                    <button class="btn btn-small" data-find="${id}" ${ok ? "" : "disabled"}>조사한다</button>
                </div>${need}
            </div>`;
        }).join("");

        box.querySelectorAll("[data-find]").forEach(b => {
            b.onclick = () => this.examine(b.dataset.find);
        });
    },

    examine(id) {
        if (State.timeUp()) return Accuse.forceEnd();
        const c = CASE.clues[id];
        if (!State.find(id)) return;
        UI.hud();
        this.renderClues();
        UI.toast(`${c.icon} 「${c.name}」 — ${c.short}`, 3600);
        if (State.timeUp()) setTimeout(() => Accuse.forceEnd(), 1200);
    }
};
