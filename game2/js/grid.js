// ============================================================
// game2/js/grid.js — 격자
//
// 이 게임의 수첩은 표다. 가로 여섯, 세로 넷.
// 칸은 플레이어가 채우는 것이 아니라, 근거를 손에 넣으면
// 저절로 채워진다. 근거 없이 칸이 차는 일은 없다.
// ============================================================

const Grid = {
    // 그 칸의 근거를 다 쥐었는가
    known(memberId, factId) {
        if (!SEALED) return null;
        const cell = (SEALED.grid[memberId] || {})[factId];
        if (!cell) return null;
        return (cell.p || []).every(p => State.has(p)) ? cell : null;
    },

    filledCount() {
        if (!SEALED) return 0;
        let n = 0;
        CASE.suspects.forEach(s => CASE.facts.forEach(f => { if (this.known(s.id, f.id)) n++; }));
        return n;
    },

    // 순사가 그 조각을 쥐고 있었다는 것 자체가 서는가
    factProven(factId) {
        const f = (SEALED && SEALED.police) ? SEALED.police[factId] : null;
        const need = f || FACT_PROOF[factId] || [];
        return need.length > 0 && need.every(p => State.has(p));
    },

    // 넷을 다 쥔 것으로 확인된 사람
    fullKnowers() {
        return CASE.suspects.filter(s => CASE.facts.every(f => {
            const c = this.known(s.id, f.id);
            return c && c.k;
        }));
    },

    render() {
        const box = document.getElementById("grid-body");
        const facts = CASE.facts;

        const head = `<tr><th class="g-corner">계원</th>${facts.map((f, i) =>
            `<th title="${f.label}"><span class="g-n">${i + 1}</span>${f.n}</th>`).join("")}</tr>`;

        const rows = CASE.suspects.map(s => {
            const cells = facts.map(f => {
                const c = this.known(s.id, f.id);
                if (!c) return `<td class="g-cell g-unknown" title="아직 모른다">·</td>`;
                return c.k
                    ? `<td class="g-cell g-yes" title="${this.esc(c.w)}">알았다</td>`
                    : `<td class="g-cell g-no" title="${this.esc(c.w)}">몰랐다</td>`;
            }).join("");
            const n = facts.filter(f => { const c = this.known(s.id, f.id); return c && c.k; }).length;
            const q = facts.filter(f => !this.known(s.id, f.id)).length;
            return `<tr><th class="g-name">${s.face} ${s.name}<small>${s.job}</small></th>${cells}
                <td class="g-sum">${q ? "?" : n + " / 4"}</td></tr>`;
        }).join("");

        box.innerHTML = `<table class="grid"><thead>${head.replace("</tr>", "<th class='g-corner'>쥔 것</th></tr>")}</thead><tbody>${rows}</tbody></table>`;

        // 조각 설명
        document.getElementById("grid-facts").innerHTML = facts.map((f, i) => {
            const on = this.factProven(f.id);
            return `<div class="g-fact ${on ? "on" : ""}">
                <span class="g-n">${i + 1}</span>
                <div><b>${f.label}</b><small>${on ? f.note : "순사가 이것을 알고 있었는지 아직 확인하지 못했다."}</small></div>
            </div>`;
        }).join("");

        const filled = this.filledCount();
        const full = this.fullKnowers();
        const note = document.getElementById("grid-note");
        let msg = `채운 칸 <b>${filled} / 24</b>`;
        if (full.length === 1) msg += ` · 넷을 다 쥔 것으로 확인된 사람이 <b>한 명</b> 있다.`;
        else if (full.length > 1) msg += ` · 넷을 다 쥔 것으로 보이는 사람이 ${full.length}명이다. 아직 지울 것이 남았다.`;
        else if (filled >= 16) msg += ` · 아직 넷을 다 쥔 사람이 드러나지 않았다.`;
        note.innerHTML = msg;
    },

    esc(s) { return String(s || "").replace(/"/g, "&quot;").replace(/</g, "&lt;"); }
};

// 순사가 각 조각을 알았다는 것을 무엇으로 아는가.
// (봉인된 쪽에 없을 때를 위한 받침. 내용은 정답이 아니라 현장 증거다.)
const FACT_PROOF = {
    F1_who:   ["c_witness_street", "c_replacement"],
    F2_when:  ["c_patrol_log", "c_witness_street"],
    F3_where: ["c_map_marks", "talk:gyeju"],
    F4_how:   ["c_uniform", "c_body"]
};
