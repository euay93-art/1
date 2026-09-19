// ============================================================
// game2/js/verdict.js — 이름을 대고, 넷을 증명한다
//
// 이름만으로는 계주가 움직이지 않는다. 짐작으로 사람을 없애는 것은
// 저쪽이 하는 짓이기 때문이다.
// ============================================================

const Verdict = {
    picked: null,
    proof: {},

    // 지금 내놓을 수 있는 것들 — 증거와 들은 말
    options() {
        const out = State.found.map(id => ({ id, label: CASE.clues[id].icon + " " + CASE.clues[id].name }));
        People.all().forEach(p => (p.topics || []).forEach(t => {
            if (State.has(t.id)) out.push({ id: t.id, label: "🗣 " + p.name + " — " + t.q });
        }));
        return out;
    },

    open() {
        this.picked = State.verdict ? State.verdict.name : null;
        this.proof = State.verdict ? Object.assign({}, State.verdict.proof) : {};
        document.getElementById("verdict-intro").textContent = CASE.verdict.intro;
        this.render();
        UI.show("verdict");
    },

    render() {
        document.getElementById("verdict-names").innerHTML = CASE.suspects.map(s =>
            `<button class="vname ${this.picked === s.id ? "on" : ""}" data-name="${s.id}">
                <span class="sus-face">${s.face}</span><b>${s.name}</b><small>${s.job}</small></button>`).join("");

        const opts = this.options();
        document.getElementById("verdict-proof").innerHTML = CASE.facts.map((f, i) => `
            <div class="vfact">
                <h3><span class="g-n">${i + 1}</span> ${f.label}</h3>
                <p class="clue-hint">이 사람이 이것을 알고 있었다는 근거는?</p>
                <select data-fact="${f.id}">
                    <option value="">— 고르십시오 —</option>
                    ${opts.map(o => `<option value="${o.id}" ${this.proof[f.id] === o.id ? "selected" : ""}>${o.label}</option>`).join("")}
                </select>
            </div>`).join("");

        document.querySelectorAll("[data-name]").forEach(b => b.onclick = () => {
            this.picked = b.dataset.name;
            this.render();
        });
        document.querySelectorAll("[data-fact]").forEach(s => s.onchange = () => {
            this.proof[s.dataset.fact] = s.value;
        });
    },

    submit() {
        if (!this.picked) return UI.toast("이름을 고르십시오.", 2600);
        const blank = CASE.facts.filter(f => !this.proof[f.id]);
        if (blank.length) return UI.toast(`아직 근거를 대지 않은 조각이 ${blank.length}개 있습니다.`, 3200);

        const key = SEALED || { culprit: null, proof: {} };
        const right = this.picked === key.culprit;
        const marks = CASE.facts.map(f => {
            const want = key.proof[f.id] || [];
            return { fact: f, gave: this.proof[f.id], ok: right && want.indexOf(this.proof[f.id]) !== -1 };
        });
        const proven = marks.filter(m => m.ok).length;
        const score = (right ? CASE.verdict.weightName : 0) + proven * CASE.verdict.weightFact;

        let endId;
        if (!right) endId = "wrong";
        else if (proven >= 4) endId = "true_full";
        else if (proven >= 2) endId = "true_thin";
        else endId = "doubt";

        State.verdict = { name: this.picked, proof: this.proof };
        State.finished = true;
        State.save();
        this.ending(endId, marks, score, right);
    },

    giveUp() {
        if (!confirm("이름을 대지 않고 끝냅니다. 되돌릴 수 없습니다.")) return;
        State.finished = true;
        State.save();
        this.ending("silence", [], 0, false);
    },

    ending(endId, marks, score, right) {
        const e = CASE.endings[endId];
        document.getElementById("rank-grade").textContent = e.grade;
        document.getElementById("rank-title").textContent = e.title;
        document.getElementById("rank-score").textContent =
            `${score} / 100점 · 증거 ${State.found.length}/${Object.keys(CASE.clues).length} · 격자 ${Grid.filledCount()}/24`;
        document.getElementById("rank-line").textContent = e.line;

        document.getElementById("ending-marks").innerHTML = marks.length ? marks.map(m => {
            const label = this.labelOf(m.gave);
            return `<div class="mark">
                <span class="mark-icon">${m.ok ? "✔" : "✘"}</span>
                <div><div class="mark-q">${m.fact.label}</div>
                <div class="mark-a ${m.ok ? "" : "wrong"}">당신이 댄 근거: ${label}</div>
                ${m.ok ? "" : `<div class="mark-exp">이것으로는 그 사람이 이 조각을 쥐었다는 것이 서지 않는다.</div>`}
                </div></div>`;
        }).join("") : "";

        // 진엔딩일 때만 마지막 선택이 남는다
        const box = document.getElementById("disposal");
        if (endId === "true_full") {
            box.hidden = false;
            document.getElementById("disposal-list").innerHTML = CASE.disposal.map(d =>
                `<button class="btn" data-disp="${d.id}">${d.label}</button>`).join("");
            document.querySelectorAll("[data-disp]").forEach(b => b.onclick = () => {
                const d = CASE.disposal.find(x => x.id === b.dataset.disp);
                State.disposal = d.id; State.save();
                document.getElementById("disposal-list").innerHTML = "";
                document.getElementById("disposal-line").textContent = d.line;
            });
        } else box.hidden = true;

        // 끝난 뒤에야 전모를 보여준다
        document.getElementById("solution-body").innerHTML = this.solution(right);
        UI.show("ending");
    },

    labelOf(id) {
        if (CASE.clues[id]) return CASE.clues[id].name;
        const p = People.all().find(p => (p.topics || []).some(t => t.id === id));
        const t = p && p.topics.find(t => t.id === id);
        return t ? p.name + " — " + t.q : id;
    },

    solution(right) {
        if (!SEALED) return "";
        const who = CASE.suspects.find(s => s.id === SEALED.culprit);
        const rows = CASE.suspects.map(s => {
            const cells = CASE.facts.map(f => {
                const c = SEALED.grid[s.id][f.id];
                return `<td class="g-cell ${c.k ? "g-yes" : "g-no"}">${c.k ? "알았다" : "몰랐다"}</td>`;
            }).join("");
            return `<tr><th class="g-name">${s.face} ${s.name}<small>${s.job}</small></th>${cells}</tr>`;
        }).join("");
        const head = `<tr><th class="g-corner">계원</th>${CASE.facts.map(f => `<th>${f.n}</th>`).join("")}</tr>`;

        return `<div class="sol-block"><h3>격자</h3>
            <table class="grid">${head}${rows}</table></div>
            <div class="sol-block"><h3>넷을 다 쥔 사람</h3>
            <p>${who.face} <b>${who.name}</b> — ${who.job}. 여섯 중 넷을 모두 쥔 사람은 이 사람뿐이었다.
            ${right ? "당신은 그것을 짚었다." : "당신이 짚은 것은 다른 사람이었다."}</p></div>
            <div class="sol-block"><h3>어떻게 넷이 한 자리에 모였나</h3>
            <p>${CASE.facts.map((f, i) => `<b>${i + 1}. ${f.n}</b> — ${SEALED.grid[SEALED.culprit][f.id].w}`).join("<br>")}</p></div>
            <div class="sol-block"><h3>둘이 나눠 흘렸을 가능성</h3>
            <p>그 건으로 나간 사례금은 한 몫, 장부에 한 줄이었다. 둘이 나눴다면 몫도 둘이어야 한다. 말한 사람은 하나다.</p></div>`;
    }
};
