// ============================================================
// game2/js/interrogate.js — 사람을 만난다
// 여섯은 처음에 밀정 얘기를 모른다. 파고들수록 눈치챈다.
// ============================================================

const Interrogate = {
    current: null,
    busy: false,

    renderPeople() {
        const grid = document.getElementById("sus-grid");
        const card = p => {
            const turns = (State.chats[p.id] || []).filter(m => m.role === "user").length;
            const shown = (State.presented[p.id] || []).length;
            const sub = p.job || p.role;
            const filled = People.isSuspect(p.id)
                ? CASE.facts.filter(f => Grid.known(p.id, f.id)).length : null;
            return `<button class="sus-card ${p.id === "gyeju" ? "chief" : ""}" data-sus="${p.id}">
                <span class="sus-face">${p.face || "◆"}</span>
                <span>
                    <b>${p.name} <small style="display:inline">(${p.age})</small></b>
                    <small>${sub}</small>
                    <span class="sus-meta">질문 ${turns}회 · 내민 것 ${shown}건${
                        filled !== null ? ` · 격자 ${filled}/4` : " · 계주"
                    }${State.opened(p.id) ? ' · <b class="sus-open">마음을 열었다</b>' : ""}</span>
                </span></button>`;
        };
        grid.innerHTML = CASE.suspects.map(card).join("") + card(CASE.chief);
        grid.querySelectorAll(".sus-card").forEach(b => b.onclick = () => this.open(b.dataset.sus));
        grid.hidden = false;
        document.getElementById("chat-wrap").hidden = true;
    },

    open(id) {
        this.current = People.get(id);
        if (!this.current) return;
        document.getElementById("sus-grid").hidden = true;
        document.getElementById("chat-wrap").hidden = false;
        document.getElementById("chat-face").textContent = this.current.face || "◆";
        document.getElementById("chat-name").textContent = this.current.name;
        this.refreshHeader();

        const log = State.chatFor(id);
        if (!log.length) { log.push({ role: "system", text: this.current.profile }); State.save(); }
        this.renderLog();
        this.renderChips();
        document.getElementById("chat-text").focus();
    },

    refreshHeader() {
        const el = document.getElementById("chat-role");
        if (!el || !this.current) return;
        el.textContent = (this.current.job || this.current.role) +
            (State.opened(this.current.id) ? "  ·  🔓 마음을 열었다" : "");
    },

    renderLog() {
        const box = document.getElementById("chat-log");
        box.innerHTML = State.chatFor(this.current.id).map(m => {
            if (m.role === "system") return `<div class="msg system">${m.text}</div>`;
            if (m.role === "evidence") return `<div class="msg evidence">📎 「${m.text}」을(를) 내놓았다</div>`;
            if (m.role === "quote") {
                const cut = m.text.indexOf("|");
                return `<div class="msg quote">🗣 <b>${this.esc(m.text.slice(0, cut))}</b>의 말을 옮겼다<br>「${this.esc(m.text.slice(cut + 1))}」</div>`;
            }
            if (m.role === "user") return `<div class="msg me">${this.esc(m.text)}</div>`;
            return `<div class="msg them ${m.confess ? "confess" : ""} ${m.open ? "open" : ""}">${this.esc(m.text)}</div>`;
        }).join("");
        box.scrollTop = box.scrollHeight;
    },

    // 아직 알 리 없는 것을 전제하는 질문은 내놓지 않는다.
    chipOpen(t) {
        if (State.asked.indexOf(t.id) !== -1) return false;
        if (t.after && State.asked.indexOf(t.after) === -1) return false;
        if (t.needs && !t.needs.some(c => State.has(c))) return false;
        return true;
    },

    renderChips() {
        const box = document.getElementById("chat-chips");
        const topics = (this.current.topics || []).filter(t => this.chipOpen(t));
        box.innerHTML = topics.slice(0, 3)
            .map(t => `<button class="chip" data-topic="${t.id}">${t.q}</button>`).join("");
        box.querySelectorAll("[data-topic]").forEach(b => {
            b.onclick = () => {
                const t = this.current.topics.find(x => x.id === b.dataset.topic);
                if (AI.online) {
                    State.hear(t.id);
                    document.getElementById("chat-text").value = t.q;
                    this.send();
                    Main.afterGain();
                } else this.scriptedTopic(t);
            };
        });
    },

    esc(s) { return String(s).replace(/[&<>]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c])); },

    push(role, text, extra) {
        State.chatFor(this.current.id).push(Object.assign({ role, text }, extra || {}));
        State.save();
        this.renderLog();
    },

    async send(showing, quote) {
        if (this.busy) return;
        const input = document.getElementById("chat-text");
        const text = (input.value || "").trim();
        if (!text && !showing && !quote) return;
        input.value = "";

        if (!AI.online) return this.offlineReply(text);

        // 상대를 지금 못 박는다. 기다리는 사이 화면을 옮겨도 답은 이 사람 것이다.
        const who = this.current;
        const mine = () => this.current === who;

        if (text || !quote) this.push("user", text || "이건 어떻게 된 겁니까?");
        this.busy = true;
        this.setBusy(true);

        const box = document.getElementById("chat-log");
        const wait = document.createElement("div");
        wait.className = "msg them thinking";
        wait.textContent = `${who.name}이(가) 생각하고 있다…`;
        box.appendChild(wait);
        box.scrollTop = box.scrollHeight;

        let el = null, streamed = false;
        const stream = t => {
            if (!t || !mine()) return;
            if (!el) { wait.remove(); el = document.createElement("div"); el.className = "msg them"; box.appendChild(el); }
            streamed = true;
            el.textContent = t;
            box.scrollTop = box.scrollHeight;
        };

        try {
            const res = await AI.ask(who.id, text, showing, stream, quote);
            wait.remove();
            State.chatFor(who.id).push({ role: "them", text: res.text, confess: res.confessed, open: res.opened });
            if (res.opened && !State.opened(who.id)) {
                State.openUp(who.id);
                UI.toast("🔓 " + who.name + "이(가) 마음을 열었다.", 4500);
                if (mine()) this.refreshHeader();
            }
            if (res.confessed && !State.confessed) {
                State.confessed = true;
                UI.toast("무너졌다. 그러나 계주는 말이 아니라 근거를 본다.", 5200);
            }
            State.save();

            if (!mine()) {
                UI.toast(who.name + "의 답이 도착했다. 대화에 남겨 두었다.", 3500);
                return;
            }
            if (!el) { el = document.createElement("div"); el.className = "msg them"; box.appendChild(el); }
            if (res.confessed) el.classList.add("confess");
            if (res.opened) el.classList.add("open");
            if (streamed) { el.textContent = res.text; box.scrollTop = box.scrollHeight; }
            else await UI.type(el, res.text, 15);
            this.renderChips();
        } catch (e) {
            wait.remove();
            if (el) el.remove();
            if (!mine()) { UI.toast(who.name + "의 답을 받지 못했다.", 3000); return; }
            this.push("system", "⚠ " + AI.explain(e));
            if (!e || e.code !== "rate_limited") {
                AI.mode = "offline";
                this.push("system", "각본 모드로 바꿉니다. 아래 질문 단추를 쓰십시오.");
            }
            this.renderChips();
        } finally {
            this.busy = false;
            if (mine()) this.setBusy(false);
            else ["btn-chat-send", "btn-show-evidence", "btn-show-quote", "chat-text"]
                .forEach(id => document.getElementById(id).disabled = false);
        }
    },

    setBusy(on) {
        ["btn-chat-send", "btn-show-evidence", "btn-show-quote", "chat-text"]
            .forEach(id => document.getElementById(id).disabled = on);
        if (!on) document.getElementById("chat-text").focus();
    },

    offlineReply(text) {
        if (text) this.push("user", text);
        this.push("them", this.current.fallback || "…무슨 말씀인지 모르겠습니다. 물으실 게 있으면 정확히 물어 주십시오.");
    },

    scriptedTopic(t) {
        this.push("user", t.q);
        State.hear(t.id);
        this.push("them", t.a);
        this.renderChips();
        Main.afterGain();
    },

    // ── 남의 말을 물려 놓는다 ──────────────────────────
    quotes() {
        const out = [];
        People.all().forEach(p => {
            if (p.id === this.current.id) return;
            (State.chats[p.id] || []).forEach((m, i) => {
                if (m.role !== "them" || !m.text || m.text.length < 25) return;
                const key = p.id + ":" + i;
                if ((State.quoted || []).indexOf(key) !== -1) return;
                out.push({ key, who: p.name, face: p.face || "◆", text: m.text });
            });
        });
        return out.reverse();
    },

    openQuoteModal() {
        const modal = document.getElementById("modal-quote");
        const list = document.getElementById("modal-quote-list");
        const items = this.quotes();
        if (!items.length) {
            list.innerHTML = `<p class="nb-empty">아직 옮길 만한 말이 없습니다. 다른 사람을 먼저 만나 보십시오.</p>`;
        } else {
            list.innerHTML = items.map(q =>
                `<button class="modal-item" data-q="${q.key}">${q.face} ${q.who}<small>「${this.esc(q.text.slice(0, 90))}${q.text.length > 90 ? "…" : ""}」</small></button>`).join("");
            list.querySelectorAll("[data-q]").forEach(b => {
                b.onclick = () => { modal.hidden = true; this.confront(items.find(x => x.key === b.dataset.q)); };
            });
        }
        modal.hidden = false;
    },

    confront(q) {
        if (!q) return;
        if (!State.quoted) State.quoted = [];
        State.quoted.push(q.key);
        State.confront(this.current.id);
        this.push("quote", q.who + "|" + q.text);
        State.save();
        if (AI.online) return this.send(null, q);
        this.push("them", this.current.fallback || "…그 사람이 그렇게 말했습니까. 저는 제가 본 것밖에 모릅니다.");
    },

    // ── 증거를 내놓는다 ────────────────────────────────
    openEvidenceModal() {
        const modal = document.getElementById("modal-evidence");
        const list = document.getElementById("modal-evidence-list");
        const shown = State.presentedFor(this.current.id);
        const items = State.found.filter(id => shown.indexOf(id) === -1);
        if (!items.length) {
            list.innerHTML = `<p class="nb-empty">${State.found.length ? "이 사람에게는 가진 것을 다 보여줬다." : "아직 내놓을 것이 없다. 먼저 발로 뛰십시오."}</p>`;
        } else {
            list.innerHTML = items.map(id => {
                const c = CASE.clues[id];
                return `<button class="modal-item" data-ev="${id}">${c.icon} ${c.name}<small>${c.short}</small></button>`;
            }).join("");
            list.querySelectorAll("[data-ev]").forEach(b => {
                b.onclick = () => { modal.hidden = true; this.present(b.dataset.ev); };
            });
        }
        modal.hidden = false;
    },

    present(cid) {
        const c = CASE.clues[cid];
        State.present(this.current.id, cid);
        this.push("evidence", c.name);
        if (AI.online) return this.send(cid);
        this.push("them", this.current.fallback || "…글쎄요. 저는 그것에 대해 아는 바가 없습니다.");
    }
};
