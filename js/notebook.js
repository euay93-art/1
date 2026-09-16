// ============================================================
// js/notebook.js — 사건 수첩
// ============================================================

const Notebook = {
    view: "evidence",

    // 그 사람에게서 실제로 답을 들었는가
    heard(sid) {
        return (State.chats[sid] || []).some(m => m.role === "them");
    },

    render() {
        const box = document.getElementById("nb-body");
        document.querySelectorAll(".nb-tab").forEach(t => t.classList.toggle("active", t.dataset.nb === this.view));
        box.innerHTML = this[this.view]();
    },

    evidence() {
        if (!State.found.length) return `<p class="nb-empty">아직 아무것도 찾지 못했다.</p>`;
        const keyAll = Object.keys(CASE.clues).filter(id => CASE.clues[id].tag === "결정적");
        const keyGot = keyAll.filter(id => State.has(id));
        const bar = `<p class="clue-hint" style="margin:-6px 0 18px">
            결정적 단서 <b>${keyGot.length} / ${keyAll.length}</b>
            ${keyGot.length === keyAll.length ? " — 사건을 세울 재료는 다 모였다." : ""}
        </p>`;
        const order = ["결정적", "현장", "흉기", "동기", "알리바이", "동선"];
        const groups = {};
        State.found.forEach(id => {
            const c = CASE.clues[id];
            (groups[c.tag] = groups[c.tag] || []).push(c);
        });
        return bar + order.filter(t => groups[t]).map(tag => `
            <div class="nb-group">
                <h3>${tag}</h3>
                ${groups[tag].map(c => `<div class="clue ${c.key ? "key" : ""}">
                    <div class="clue-head"><span>${c.icon}</span><b>${c.name}</b></div>
                    <p class="clue-text">${c.text}</p>
                </div>`).join("")}
            </div>`).join("");
    },

    people() {
        return CASE.suspects.map(s => {
            const shown = (State.presented[s.id] || []).length;
            const turns = (State.chats[s.id] || []).filter(m => m.role === "user").length;
            return `<div class="nb-group">
                <h3>${s.face} ${s.name} (${s.age}) — ${s.role}</h3>
                <p class="clue-text">${s.profile}</p>
                <p class="clue-hint">질문 ${turns}회 · 증거 제시 ${shown}건</p>
            </div>`;
        }).join("");
    },

    time() {
        // 확보한 증거·증언으로만 채워지는 타임라인
        const rows = [
            { t: "20:30", w: "윤태오가 윤제하와 작업실에 있었다. 벽시계는 멀쩡했다.", talk: "yun" },
            { t: "22:30", w: "한소민이 작업실에서 윤제하와 다퉜다.", talk: "han" },
            { t: "23:00", w: "배정훈과 윤태오가 거실에서 술자리를 시작했다.", need: "c_bottle", talk: "bae" },
            { t: "23:00–23:50", w: "오만춘이 보일러실에서 순환펌프를 고쳤다.", need: "c_boilerlog" },
            { t: "23:20–00:00", w: "서가을이 진입로 끝에 나가 있었다. 돌아오며 오만춘과 마주쳤다.", talk: "seo" },
            { t: "23:40", w: "벽시계가 멈춘 것으로 되어 있는 시각. — 조작된 시각이다.", need: "c_clock_trick" },
            { t: "23:50", w: "배정훈이 방으로 올라갔다고 진술한 시각. 이후 목격자 없음.", talk: "bae" },
            { t: "00:10", w: "한소민과 서가을이 주방에 앉았다. 거실이 보이는 자리다.", need: "c_teacups", talk: "han" },
            { t: "00:10–01:10", w: "오만춘이 제설기로 진입로를 쳤다.", need: "c_plow", talk: "oh" },
            { t: "00:12", w: "윤제하가 미술관에 문자를 보냈다. 이때까지 살아 있었다.", need: "c_phone" },
            { t: "00:45", w: "2층 작업실 불이 꺼졌다. — 범행 시각의 상한선.", talk: "oh" },
            { t: "07:10", w: "한소민이 시신을 발견했다.", need: "c_body" }
        ].filter(r => (!r.need || State.has(r.need)) && (!r.talk || this.heard(r.talk)));

        if (!rows.length) return `<p class="nb-empty">타임라인을 채우려면 증거가 더 필요하다.</p>`;

        const head = State.has("c_phone") && this.heard("oh")
            ? `<p class="clue-hint" style="margin-bottom:14px">확정된 범행 가능 시간대: <b>00:12 – 00:45</b>. 이 시간에 알리바이가 없는 사람은 한 명뿐이다.</p>`
            : "";

        return head + rows.map(r => `<div class="tl-row"><span class="tl-time">${r.t}</span><span class="tl-what">${r.w}</span></div>`).join("");
    }
};
