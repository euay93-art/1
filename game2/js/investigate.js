// ============================================================
// game2/js/investigate.js — 발로 뛰는 일
// 훑어보는 것은 공짜다. 가까이 보는 것도 공짜다.
// 이 게임에서 아끼는 것은 시간이 아니라 사람의 신뢰다.
// ============================================================

const Investigate = {
    current: null,
    unfolded: {},

    open(id) {
        this.current = CASE.locations.find(l => l.id === id);
        if (!this.current) return;
        this.unfolded = {};
        document.getElementById("loc-grid").hidden = true;
        document.getElementById("loc-detail").hidden = false;
        document.getElementById("loc-name").textContent = this.current.icon + "  " + this.current.name;
        document.getElementById("loc-desc").textContent = this.current.desc;
        this.renderObjects();
    },

    renderLocations() {
        const grid = document.getElementById("loc-grid");
        grid.innerHTML = CASE.locations.map(loc => {
            const all = [];
            loc.objects.forEach(o => (o.steps || []).forEach(c => all.push(c)));
            const got = all.filter(c => State.has(c)).length;
            const done = got === all.length;
            const shut = loc.act > State.act;
            if (shut) {
                return `<button class="loc-card shut" disabled>
                    <span class="loc-icon">${loc.icon}</span><b>${loc.name}</b>
                    <span class="loc-prog">${loc.act}막이 되어야 갈 수 있다</span></button>`;
            }
            return `<button class="loc-card" data-loc="${loc.id}">
                <span class="loc-icon">${loc.icon}</span><b>${loc.name}</b>
                <span class="loc-prog ${done ? "done" : ""}">${done ? "더 볼 것 없다" : `증거 ${got} / ${all.length}`}</span>
            </button>`;
        }).join("");

        grid.querySelectorAll(".loc-card[data-loc]").forEach(b => {
            b.onclick = () => this.open(b.dataset.loc);
        });
        grid.hidden = false;
        document.getElementById("loc-detail").hidden = true;
    },

    key(loc, objId) { return loc.id + "." + objId; },
    remaining(obj) { return (obj.steps || []).filter(c => !State.has(c)); },

    renderObjects() {
        const loc = this.current;
        const box = document.getElementById("clue-list");

        box.innerHTML = loc.objects.map(o => {
            const seen = State.looked.indexOf(this.key(loc, o.id)) !== -1;
            const left = this.remaining(o).length;
            const mark = !seen ? '<span class="ob-mark">○</span>'
                       : left  ? '<span class="ob-mark more">◆</span>'
                               : '<span class="ob-mark done">✓</span>';

            if (!seen) {
                return `<button class="ob ob-shut" data-look="${o.id}">
                    ${mark}<span class="ob-icon">${o.icon}</span><b>${o.name}</b>
                    <span class="ob-hint">살펴본다</span></button>`;
            }
            if (!this.unfolded[o.id]) {
                return `<button class="ob ob-shut ob-seen" data-fold="${o.id}">
                    ${mark}<span class="ob-icon">${o.icon}</span><b>${o.name}</b>
                    <span class="ob-hint">${left ? "아직 볼 것이 남았다" : "다시 본다"}</span></button>`;
            }

            const found = (o.steps || []).filter(c => State.has(c)).map(c => this.clueHtml(CASE.clues[c])).join("");
            const next = this.remaining(o)[0];
            let more;
            if (!next) more = `<p class="ob-none">더 볼 것은 없다.</p>`;
            else if (!State.canFind(next)) {
                const req = CASE.clues[next].requires.filter(r => !State.has(r))
                    .map(r => "「" + (CASE.clues[r] ? CASE.clues[r].name : r) + "」").join(", ");
                more = `<p class="ob-none">지금은 이것이 무슨 뜻인지 모른다. ${req}을(를) 먼저 알아야 한다.</p>`;
            } else {
                more = `<button class="btn btn-small btn-closer" data-closer="${o.id}">🔎 가까이 본다</button>`;
            }

            return `<div class="ob ob-open">
                <button class="ob-head" data-fold="${o.id}">
                    ${mark}<span class="ob-icon">${o.icon}</span><b>${o.name}</b>
                    <span class="ob-hint">접는다</span></button>
                <p class="ob-look">${o.look}</p>${found}${more}</div>`;
        }).join("");

        box.querySelectorAll("[data-look]").forEach(b => b.onclick = () => this.lookAt(b.dataset.look));
        box.querySelectorAll("[data-fold]").forEach(b => b.onclick = () => {
            const id = b.dataset.fold;
            this.unfolded[id] = !this.unfolded[id];
            this.renderObjects();
        });
        box.querySelectorAll("[data-closer]").forEach(b => b.onclick = () => this.lookCloser(b.dataset.closer));
    },

    clueHtml(c) {
        return `<div class="clue ${c.key ? "key" : ""}">
            <div class="clue-head"><span>${c.icon}</span><b>${c.name}</b>
                <span class="clue-tag ${c.tag}">${c.tag}</span></div>
            <p class="clue-text">${c.text}</p></div>`;
    },

    lookAt(objId) {
        const k = this.key(this.current, objId);
        if (State.looked.indexOf(k) === -1) { State.looked.push(k); State.save(); }
        this.unfolded[objId] = true;
        this.renderObjects();
    },

    lookCloser(objId) {
        const obj = this.current.objects.find(o => o.id === objId);
        const next = this.remaining(obj)[0];
        if (!next || !State.canFind(next)) return;

        const c = CASE.clues[next];
        State.find(next);
        this.unfolded[objId] = true;
        this.renderObjects();
        UI.toast(`${c.icon} 「${c.name}」 — ${c.short}`, 3600);
        Main.afterGain();
    }
};
