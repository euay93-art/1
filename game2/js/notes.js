// ============================================================
// game2/js/notes.js — 손에 든 것
// ============================================================

const Notes = {
    view: "clues",

    render() {
        document.querySelectorAll(".nb-tab").forEach(t => t.classList.toggle("active", t.dataset.nb === this.view));
        document.getElementById("nb-body").innerHTML = this[this.view]();
    },

    clues() {
        if (!State.found.length) return `<p class="nb-empty">아직 아무것도 찾지 못했다.</p>`;
        const keyAll = Object.keys(CASE.clues).filter(id => CASE.clues[id].tag === "결정적");
        const keyGot = keyAll.filter(id => State.has(id));
        const bar = `<p class="clue-hint" style="margin:-6px 0 18px">
            결정적 증거 <b>${keyGot.length} / ${keyAll.length}</b>
            ${keyGot.length === keyAll.length ? " — 격자를 세울 재료는 다 모였다." : ""}</p>`;
        const order = ["결정적", "현장", "사정"];
        const groups = {};
        State.found.forEach(id => {
            const c = CASE.clues[id];
            (groups[c.tag] = groups[c.tag] || []).push(c);
        });
        return bar + order.filter(t => groups[t]).map(tag => `
            <div class="nb-group"><h3>${tag}</h3>
            ${groups[tag].map(c => `<div class="clue ${c.key ? "key" : ""}">
                <div class="clue-head"><span>${c.icon}</span><b>${c.name}</b></div>
                <p class="clue-text">${c.text}</p></div>`).join("")}</div>`).join("");
    },

    words() {
        const rows = [];
        People.all().forEach(p => {
            (p.topics || []).filter(t => State.has(t.id)).forEach(t => {
                rows.push(`<div class="nb-group"><h3>${p.face || "◆"} ${p.name} — ${t.q}</h3>
                    <p class="clue-text">${t.a}</p></div>`);
            });
        });
        if (!rows.length) return `<p class="nb-empty">아직 들은 말이 없다.</p>`;
        // 자유 대화에서는 말이 그때그때 달라진다. 여기 적힌 것은
        // 당신이 요점만 추려 적어둔 것이다.
        return `<p class="clue-hint" style="margin:-6px 0 18px">들은 말에서 요점만 추려 적어 두었다.</p>` + rows.join("");
    },

    people() {
        return People.all().map(p => {
            const shown = (State.presented[p.id] || []).length;
            const turns = (State.chats[p.id] || []).filter(m => m.role === "user").length;
            const cells = People.isSuspect(p.id)
                ? CASE.facts.map(f => {
                    const c = Grid.known(p.id, f.id);
                    return `<span class="p-cell ${c ? (c.k ? "yes" : "no") : ""}">${f.n}</span>`;
                  }).join("")
                : `<span class="p-cell chief">용의자가 아니다</span>`;
            return `<div class="nb-group">
                <h3>${p.face || "◆"} ${p.name} (${p.age}) — ${p.job || p.role}</h3>
                <p class="clue-text">${p.profile}</p>
                <p class="p-cells">${cells}</p>
                <p class="clue-hint">질문 ${turns}회 · 내민 것 ${shown}건</p></div>`;
        }).join("");
    }
};
