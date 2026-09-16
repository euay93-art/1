// ============================================================
// js/accuse.js — 최종 추리와 엔딩
// ============================================================

const Accuse = {
    open() {
        const box = document.getElementById("quiz-list");
        box.innerHTML = CASE.quiz.map((q, qi) => `
            <div class="quiz">
                <h3>${qi + 1}. ${q.q}</h3>
                ${q.options.map((o, oi) => `
                    <label><input type="radio" name="${q.id}" value="${oi}"> <span>${o}</span></label>
                `).join("")}
            </div>`).join("");
        UI.show("accuse");
    },

    forceEnd() {
        if (State.finished) return;
        UI.toast("오후 3시. 경찰이 도착했다.", 4000);
        setTimeout(() => this.open(), 900);
    },

    submit() {
        const missing = [];
        CASE.quiz.forEach(q => {
            const sel = document.querySelector(`input[name="${q.id}"]:checked`);
            if (!sel) missing.push(q.q);
            else State.answers[q.id] = Number(sel.value);
        });
        if (missing.length) return UI.toast("아직 답하지 않은 항목이 있습니다.", 3000);

        let score = 0, max = 0;
        const marks = CASE.quiz.map(q => {
            max += q.weight;
            const picked = State.answers[q.id];
            const ok = picked === q.answer;
            if (ok) score += q.weight;
            return { q, picked, ok };
        });

        const rate = State.found.length / Object.keys(CASE.clues).length;
        const total = score;

        // 범인을 틀렸다면 나머지를 몇 개 맞혔든 오판이다.
        // 맞혔다면 얼마나 설명해냈는지로 등급이 갈린다.
        const namedRight = marks[0].ok;
        const rank = namedRight
            ? (CASE.ranks.find(r => r.grade !== "F" && total >= r.min) || CASE.ranks[CASE.ranks.length - 2])
            : CASE.ranks[CASE.ranks.length - 1];

        State.finished = true;
        State.save();
        this.ending(marks, total, max, rank, rate);
    },

    ending(marks, total, max, rank, rate) {
        document.getElementById("rank-grade").textContent = rank.grade;
        document.getElementById("rank-title").textContent = rank.title;
        document.getElementById("rank-score").textContent =
            `${total} / ${max}점 · 증거 ${State.found.length}/${Object.keys(CASE.clues).length}개 수집 (${Math.round(rate * 100)}%) · 종료 시각 ${State.clock()}`;
        document.getElementById("rank-line").textContent = rank.line;

        document.getElementById("ending-marks").innerHTML = marks.map(m => `
            <div class="mark">
                <span class="mark-icon">${m.ok ? "✔" : "✘"}</span>
                <div>
                    <div class="mark-q">${m.q.q}</div>
                    <div class="mark-a ${m.ok ? "" : "wrong"}">당신의 답: ${m.q.options[m.picked]}</div>
                    ${m.ok ? "" : `<div class="mark-a">정답: ${m.q.options[m.q.answer]}</div>`}
                    <div class="mark-exp">${m.q.explain}</div>
                </div>
            </div>`).join("");

        document.getElementById("solution-body").innerHTML = CASE.solution.map(s =>
            `<div class="sol-block"><h3>${s.head}</h3><p>${s.body}</p></div>`).join("");

        UI.show("ending");
    }
};
