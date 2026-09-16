// ============================================================
// js/partner.js — 동행 수사
// 플레이어가 지금까지 확보한 것만 아는 파트너. 정답은 모른다.
// 그래서 대신 풀어주지 못하고, 같이 헤맨다.
// ============================================================

const Partner = {
    busy: false,

    available() { return AI.mode === "sample" || AI.mode === "server"; },

    // 파트너에게 넘길 자료 — 플레이어가 실제로 확보한 것만
    brief() {
        const L = [];
        L.push("[사건 개요]");
        L.push("12월 19일 아침, 폭설로 고립된 강원도 산중 아트 레지던시 '설야장'에서 화단의 거장 윤제하(52)가 2층 작업실에서 뒤통수가 함몰된 채 발견됐다. 어젯밤 건물 안에 있던 사람은 피해자와 다섯 명, 그리고 우리 둘뿐이다. 외부에서 들어온 발자국은 없다. 경찰은 오후 3시에나 도착한다.");
        L.push("");
        L.push("[용의자]");
        CASE.suspects.forEach(s => L.push(`- ${s.name}(${s.age}), ${s.role}`));
        L.push("");
        L.push(`[현재 시각] ${State.clock()} · ${State.remainText()}`);
        L.push("");

        L.push("[우리가 지금까지 확보한 증거]");
        if (!State.found.length) {
            L.push("아직 아무것도 없다.");
        } else {
            State.found.forEach(id => {
                const c = CASE.clues[id];
                L.push(`- 「${c.name}」 (${c.tag}) : ${c.text.replace(/<[^>]+>/g, "")}`);
            });
        }
        L.push("");

        const talked = CASE.suspects.filter(s => (State.chats[s.id] || []).some(m => m.role === "them"));
        if (talked.length) {
            L.push("[심문에서 나온 말]");
            talked.forEach(s => {
                const lines = (State.chats[s.id] || [])
                    .filter(m => m.role === "user" || m.role === "them").slice(-8);
                L.push(`《${s.name}》`);
                lines.forEach(m => L.push((m.role === "user" ? "  나: " : `  ${s.name}: `) + m.text));
            });
            L.push("");
        }

        const unexplored = CASE.locations.filter(l => l.clues.some(c => !State.has(c)));
        if (unexplored.length) {
            L.push("[아직 더 뒤질 것이 남은 장소]");
            L.push(unexplored.map(l => l.name).join(", "));
            L.push("");
        }
        return L.join("\n");
    },

    systemPrompt() {
        return `당신은 이 사건을 나와 함께 조사하는 동료다. 나는 국립현대미술관 학예연구사고, 당신은 내가 상의할 수 있는 유일한 사람이다.

[가장 중요한 규칙]
당신은 <b>범인이 누구인지 모른다.</b> 진짜로 모른다. 당신이 아는 것은 아래에 적힌, 내가 지금까지 직접 확보한 자료가 전부다. 그 밖의 사실을 지어내지 마라. 아직 찾지 못한 증거의 내용을 아는 척하지 마라.

[당신이 하는 일]
- 확보한 자료 안에서 <b>모순과 빈틈</b>을 짚는다. ("이 시각이 맞으면 저 진술이 안 맞는다")
- 다음에 뭘 뒤지고 누구에게 뭘 물어야 할지 <b>구체적으로</b> 제안한다.
- 내가 틀린 방향으로 가면 근거를 들어 반대한다. 동의만 하는 사람은 쓸모가 없다.
- 확신이 없으면 없다고 말한다. "아마", "이것만으로는 모른다"를 쓴다.
- 자료가 부족하면 단정하지 말고, 무엇이 더 있어야 말할 수 있는지 말한다.

[말투]
동료끼리 하는 반존대. 짧고 실무적으로. 3~6문장. 흥분하지 않고, 필요하면 목록으로 정리한다.
소설 지문을 쓰지 마라. 게임이나 AI에 대한 메타 발언을 하지 마라.

${this.brief()}`;
    },

    view: "partner",     // "partner" | "radio"
    unread: 0,

    setView(v) {
        this.view = v;
        document.querySelectorAll("#partner-switch .seg").forEach(b =>
            b.classList.toggle("active", b.dataset.view === v));
        document.getElementById("partner-side").hidden = (v !== "partner");
        document.getElementById("radio-side").hidden = (v !== "radio");
        if (v === "radio") { this.unread = 0; this.badge(); }
        this.render();
    },

    badge() {
        const t = document.getElementById("tab-partner");
        if (t) t.textContent = this.unread ? `🤝 동행 (${this.unread})` : "🤝 동행";
        const s = document.querySelector('#partner-switch [data-view="radio"]');
        if (s) s.textContent = this.unread ? `📻 무전 ${this.unread}` : "📻 무전";
    },

    // Sync 가 새 무전을 받으면 부른다
    onRadio() {
        const log = Sync.radioLog();
        const last = log[log.length - 1];
        if (this.view !== "radio" && last && last.from === "claude") {
            this.unread++;
            this.badge();
            UI.toast("📻 무전이 왔다 — 동행 탭에서 확인하십시오.", 4000);
        }
        if (this.view === "radio") this.renderRadio();
    },

    renderRadio() {
        const box = document.getElementById("radio-log");
        if (!box) return;
        const on = Sync.db;
        const log = on ? Sync.radioLog() : [];

        if (!on) {
            box.innerHTML = `<div class="msg system">이 화면에서는 무전을 쓸 수 없습니다. 배포된 링크로 열면 연결됩니다.</div>`;
        } else if (!log.length) {
            box.innerHTML = `<div class="msg system">아직 주고받은 무전이 없습니다. 먼저 말을 걸어 보십시오.</div>`;
        } else {
            box.innerHTML = log.map(m => m.from === "me"
                ? `<div class="msg me">${Interrogate.esc(m.text)}</div>`
                : `<div class="msg them radio">${Interrogate.esc(m.text)}</div>`).join("");
        }
        box.scrollTop = box.scrollHeight;
        document.getElementById("btn-radio-send").disabled = !on;
        document.getElementById("radio-text").disabled = !on;
    },

    async sayRadio() {
        const input = document.getElementById("radio-text");
        const text = (input.value || "").trim();
        if (!text) return;
        input.value = "";
        try {
            await Sync.sayRadio(text);
            this.renderRadio();
        } catch (e) {
            UI.toast("무전을 보내지 못했습니다.", 3000);
        }
    },

    render() {
        if (this.view === "radio") return this.renderRadio();
        const box = document.getElementById("partner-log");
        const log = State.partnerChat || (State.partnerChat = []);
        box.innerHTML = log.map(m =>
            m.role === "user"
                ? `<div class="msg me">${Interrogate.esc(m.text)}</div>`
                : `<div class="msg them">${Interrogate.esc(m.text)}</div>`
        ).join("");
        box.scrollTop = box.scrollHeight;

        document.getElementById("partner-stat").textContent =
            `증거 ${State.found.length}개 · ${State.clock()} 기준으로 함께 보는 중`;
    },

    async send(preset) {
        if (this.busy) return;
        const input = document.getElementById("partner-text");
        const text = (preset || input.value || "").trim();
        if (!text) return;
        input.value = "";

        const log = State.partnerChat || (State.partnerChat = []);
        log.push({ role: "user", text });
        State.save();
        this.render();

        this.busy = true;
        document.getElementById("btn-partner-send").disabled = true;
        input.disabled = true;

        const box = document.getElementById("partner-log");
        const el = document.createElement("div");
        el.className = "msg them thinking";
        el.textContent = "자료를 훑고 있다…";
        box.appendChild(el);
        box.scrollTop = box.scrollHeight;

        try {
            const history = log.slice(-10, -1)
                .map(m => (m.role === "user" ? "나: " : "동료: ") + m.text).join("\n");

            const prompt = this.systemPrompt() +
                (history ? `\n\n[우리가 방금 나눈 말]\n${history}` : "") +
                `\n\n──────────\n나: ${text}\n\n동료로서 대답하라. 대사만 출력한다.`;

            let streamed = false;
            const res = await AI.raw(prompt, t => {
                streamed = true;
                el.className = "msg them";
                el.textContent = t;
                box.scrollTop = box.scrollHeight;
            });

            el.className = "msg them";
            if (streamed) el.textContent = res;
            else await UI.type(el, res, 14);

            log.push({ role: "them", text: res });
            State.save();
            Sync.push();
        } catch (e) {
            el.remove();
            log.push({ role: "them", text: "⚠ " + AI.explain(e) });
            State.save();
            this.render();
        } finally {
            this.busy = false;
            document.getElementById("btn-partner-send").disabled = false;
            input.disabled = false;
            input.focus();
        }
    }
};
