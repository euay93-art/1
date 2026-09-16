// ============================================================
// js/watch.js — 관제실
// 같은 링크를 창 하나 더 열어 게임 옆에 띄워 두는 화면.
// 내 수사와 상대 수사가 한 화면에서 실시간으로 갱신된다.
// ============================================================

const Watch = {
    runs: {},
    started: false,

    async open() {
        UI.show("watch");
        if (this.started) return;
        this.started = true;

        if (!Sync.db) {
            await Sync.init();
        }
        if (!Sync.db) {
            document.getElementById("watch-body").innerHTML =
                `<p class="nb-empty">이 화면에서는 실시간 연결을 쓸 수 없습니다. 배포된 링크로 열어야 합니다.</p>`;
            return;
        }

        // 진행 상황 — 한 번만 구독한다
        try {
            Sync.db.collection("plays").onSnapshot(
                snap => {
                    this.runs = {};
                    snap.docs.forEach(d => { this.runs[d.id] = d.data(); });
                    this.render();
                },
                () => { UI.toast("진행 상황 연결이 끊겼습니다.", 3000); }
            );
        } catch (e) { /* 경로 오류 */ }

        Sync.watchRadio(() => this.renderRadio());
        this.render();
        this.renderRadio();
    },

    // 가장 최근에 갱신된 것을 고른다
    pick(mine) {
        const entries = Object.entries(this.runs)
            .filter(([id]) => (id.indexOf("claude") === 0) === mine)
            .sort((a, b) => String(b[1].갱신시각 || "").localeCompare(String(a[1].갱신시각 || "")));
        return entries.length ? entries[0][1] : null;
    },

    card(title, face, r) {
        if (!r) {
            return `<div class="watch-col">
                <h3>${face} ${title}</h3>
                <p class="nb-empty">아직 조사를 시작하지 않았습니다.</p>
            </div>`;
        }
        const total = Object.keys(CASE.clues).length;
        const got = (r.증거 || []).length;
        const pct = Math.round(got / total * 100);

        const talks = Object.entries(r.심문 || {});
        const recent = talks.map(([who, lines]) => {
            const tail = lines.slice(-2).map(l => `<div class="watch-line">${Interrogate.esc(l)}</div>`).join("");
            return `<div class="watch-talk"><b>${Interrogate.esc(who)}</b>${tail}</div>`;
        }).join("");

        return `<div class="watch-col">
            <h3>${face} ${title}</h3>
            <div class="watch-meta">
                <span class="watch-clock">${r.게임내시각 || "--:--"}</span>
                <span>${r.남은시간 || ""}</span>
            </div>
            <div class="watch-bar"><i style="width:${pct}%"></i></div>
            <div class="watch-count">증거 ${got} / ${total}${r.배정훈자백 ? ' · <b class="watch-flag">배정훈 자백</b>' : ""}${r.종료 ? " · 종료" : ""}</div>
            <div class="watch-chips">${(r.증거 || []).map(n => `<span class="watch-chip">${Interrogate.esc(n)}</span>`).join("") || '<span class="nb-empty">아직 없음</span>'}</div>
            ${recent ? `<h4>최근 심문</h4>${recent}` : ""}
        </div>`;
    },

    render() {
        const box = document.getElementById("watch-body");
        if (!box || !Sync.db) return;
        box.innerHTML =
            this.card("Claude", "🕵️", this.pick(true)) +
            this.card("당신", "🔍", this.pick(false));
    },

    renderRadio() {
        const box = document.getElementById("watch-radio-log");
        if (!box) return;
        const log = Sync.radioLog();
        box.innerHTML = log.length
            ? log.map(m => m.from === "me"
                ? `<div class="msg me">${Interrogate.esc(m.text)}</div>`
                : `<div class="msg them radio">${Interrogate.esc(m.text)}</div>`).join("")
            : `<div class="msg system">아직 주고받은 무전이 없습니다.</div>`;
        box.scrollTop = box.scrollHeight;
    },

    async say() {
        const input = document.getElementById("watch-radio-text");
        const text = (input.value || "").trim();
        if (!text) return;
        input.value = "";
        try { await Sync.sayRadio(text); this.renderRadio(); }
        catch (e) { UI.toast("무전을 보내지 못했습니다.", 3000); }
    }
};
