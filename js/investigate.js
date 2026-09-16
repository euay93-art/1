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
            const twoStep = !!loc.objects;
            return `<button class="loc-card" data-loc="${loc.id}">
                <span class="loc-icon">${loc.icon}</span>
                <b>${loc.name}</b>
                <span class="loc-prog ${done ? "done" : ""}">${done ? "조사 완료" : `단서 ${got} / ${total}`}${twoStep ? ' <span class="loc-new">둘러보기</span>' : ""}</span>
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
        this.unfolded = {};      // 방에 다시 들어오면 접힌 상태로 시작한다
        document.getElementById("loc-grid").hidden = true;
        document.getElementById("loc-detail").hidden = false;
        document.getElementById("loc-name").textContent = this.current.icon + "  " + this.current.name;
        document.getElementById("loc-desc").textContent = this.current.desc;
        this.renderClues();
    },

    // ── 2단 보기 ────────────────────────────────────────
    // 물건 목록이 있는 방은 이쪽으로 간다. 훑어보는 건 공짜,
    // 가까이 들여다보는 것만 시간을 쓴다.
    key(loc, obj) { return loc.id + "." + obj.id; },

    // 이 물건에서 아직 캘 것이 남았는가
    remaining(obj) {
        return (obj.steps || []).filter(c => !State.has(c));
    },

    unfolded: {},

    renderObjects() {
        const loc = this.current;
        const box = document.getElementById("clue-list");

        box.innerHTML = loc.objects.map(o => {
            const k = this.key(loc, o);
            const seen = State.looked.indexOf(k) !== -1;
            const left = this.remaining(o).length;
            const mark = !seen ? '<span class="ob-mark">○</span>'
                       : left  ? '<span class="ob-mark more">◆</span>'
                               : '<span class="ob-mark done">✓</span>';

            if (!seen) {
                return `<button class="ob ob-shut" data-look="${o.id}">
                    ${mark}<span class="ob-icon">${o.icon}</span><b>${o.name}</b>
                    <span class="ob-hint">살펴본다</span>
                </button>`;
            }

            if (!this.unfolded[o.id]) {
                return `<button class="ob ob-shut ob-seen" data-fold="${o.id}">
                    ${mark}<span class="ob-icon">${o.icon}</span><b>${o.name}</b>
                    <span class="ob-hint">${left ? "아직 볼 것이 남았다" : "다시 본다"}</span>
                </button>`;
            }

            const found = (o.steps || []).filter(c => State.has(c)).map(c => {
                const cl = CASE.clues[c];
                return `<div class="clue ${cl.key ? "key" : ""}">
                    <div class="clue-head"><span>${cl.icon}</span><b>${cl.name}</b>
                        <span class="clue-tag ${cl.tag}">${cl.tag}</span></div>
                    <p class="clue-text">${cl.text}</p>
                </div>`;
            }).join("");

            const more = left
                ? `<button class="btn btn-small btn-closer" data-closer="${o.id}">🔎 가까이 본다 <span class="cost">5분</span></button>`
                : `<p class="ob-none">더 볼 것은 없다.</p>`;

            return `<div class="ob ob-open">
                <button class="ob-head" data-fold="${o.id}">
                    ${mark}<span class="ob-icon">${o.icon}</span><b>${o.name}</b>
                    <span class="ob-hint">접는다</span>
                </button>
                <p class="ob-look">${o.look}</p>
                ${found}
                ${more}
            </div>`;
        }).join("");

        box.querySelectorAll("[data-look]").forEach(b => {
            b.onclick = () => this.lookAt(b.dataset.look);
        });
        box.querySelectorAll("[data-fold]").forEach(b => {
            b.onclick = () => {
                const id = b.dataset.fold;
                this.unfolded[id] = !this.unfolded[id];
                this.renderObjects();
            };
        });
        box.querySelectorAll("[data-closer]").forEach(b => {
            b.onclick = () => this.lookCloser(b.dataset.closer);
        });
    },

    // 훑어보기 — 시간을 쓰지 않는다
    lookAt(objId) {
        const k = this.key(this.current, { id: objId });
        if (State.looked.indexOf(k) === -1) {
            State.looked.push(k);
            State.save();
        }
        this.unfolded[objId] = true;
        this.renderObjects();
    },

    // 가까이 보기 — 여기서만 시계가 돈다
    lookCloser(objId) {
        if (State.timeUp()) return Accuse.forceEnd();
        const obj = this.current.objects.find(o => o.id === objId);
        const next = this.remaining(obj)[0];
        if (!next) return;

        const c = CASE.clues[next];
        State.find(next);
        UI.hud();
        this.unfolded[objId] = true;
        this.renderObjects();
        UI.toast(`${c.icon} 「${c.name}」 — ${c.short}`, 3600);
        if (State.timeUp()) setTimeout(() => Accuse.forceEnd(), 1200);
    },

    renderClues() {
        if (this.current.objects) return this.renderObjects();

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
