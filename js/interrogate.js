// ============================================================
// js/interrogate.js — 용의자 심문
// AI 서버가 있으면 자유 대화, 없으면 각본 대사로 진행한다.
// ============================================================

const Interrogate = {
    current: null,
    busy: false,

    renderSuspects() {
        const grid = document.getElementById("sus-grid");
        grid.innerHTML = CASE.suspects.map(s => {
            const turns = (State.chats[s.id] || []).filter(m => m.role === "user").length;
            const shown = (State.presented[s.id] || []).length;
            return `<button class="sus-card" data-sus="${s.id}">
                <span class="sus-face">${s.face}</span>
                <span>
                    <b>${s.name} <small style="display:inline">(${s.age})</small></b>
                    <small>${s.role}</small>
                    <span class="sus-meta">질문 ${turns}회 · 증거 제시 ${shown}건</span>
                </span>
            </button>`;
        }).join("");

        grid.querySelectorAll(".sus-card").forEach(b => {
            b.onclick = () => this.open(b.dataset.sus);
        });

        grid.hidden = false;
        document.getElementById("chat-wrap").hidden = true;
    },

    open(id) {
        this.current = CASE.suspects.find(s => s.id === id);
        if (!this.current) return;

        document.getElementById("sus-grid").hidden = true;
        document.getElementById("chat-wrap").hidden = false;
        document.getElementById("chat-face").textContent = this.current.face;
        document.getElementById("chat-name").textContent = this.current.name;
        document.getElementById("chat-role").textContent = this.current.role;

        const log = State.chatFor(id);
        if (!log.length) {
            log.push({ role: "system", text: this.current.profile });
            State.save();
        }
        this.renderLog();
        this.renderChips();
        document.getElementById("chat-text").focus();
    },

    renderLog() {
        const box = document.getElementById("chat-log");
        box.innerHTML = State.chatFor(this.current.id).map(m => {
            if (m.role === "system") return `<div class="msg system">${m.text}</div>`;
            if (m.role === "evidence") return `<div class="msg evidence">📎 「${m.text}」을(를) 내밀었다</div>`;
            if (m.role === "user") return `<div class="msg me">${this.esc(m.text)}</div>`;
            return `<div class="msg them ${m.confess ? "confess" : ""}">${this.esc(m.text)}</div>`;
        }).join("");
        box.scrollTop = box.scrollHeight;
    },

    renderChips() {
        const box = document.getElementById("chat-chips");
        const asked = State.asked;
        const topics = (this.current.topics || []).filter(t => !asked.includes(t.id));
        box.innerHTML = topics.slice(0, 4)
            .map(t => `<button class="chip" data-topic="${t.id}">${t.q}</button>`).join("");
        box.querySelectorAll("[data-topic]").forEach(b => {
            b.onclick = () => {
                const t = this.current.topics.find(x => x.id === b.dataset.topic);
                if (AI.online) {
                    document.getElementById("chat-text").value = t.q;
                    this.send();
                } else {
                    this.scriptedTopic(t);
                }
            };
        });
    },

    esc(s) {
        return String(s).replace(/[&<>]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]));
    },

    push(role, text, extra) {
        State.chatFor(this.current.id).push(Object.assign({ role, text }, extra || {}));
        State.save();
        this.renderLog();
    },

    // ── AI 대화 ────────────────────────────────────────
    async send(showing) {
        if (this.busy) return;
        if (State.timeUp()) return Accuse.forceEnd();

        const input = document.getElementById("chat-text");
        const text = (input.value || "").trim();
        if (!text && !showing) return;
        input.value = "";

        if (!AI.online) return this.offlineReply(text);

        this.push("user", text || "이건 어떻게 설명하시겠습니까?");
        this.busy = true;
        this.setBusy(true);

        const box = document.getElementById("chat-log");
        const wait = document.createElement("div");
        wait.className = "msg them thinking";
        wait.textContent = `${this.current.name}이(가) 생각하고 있다…`;
        box.appendChild(wait);
        box.scrollTop = box.scrollHeight;

        let el = null, streamed = false;
        const stream = t => {
            if (!t) return;
            if (!el) {
                wait.remove();
                el = document.createElement("div");
                el.className = "msg them";
                box.appendChild(el);
            }
            streamed = true;
            el.textContent = t;
            box.scrollTop = box.scrollHeight;
        };

        try {
            const res = await AI.ask(this.current.id, text, showing, stream);
            wait.remove();

            State.spend();
            UI.hud();

            if (!el) {
                el = document.createElement("div");
                el.className = "msg them";
                box.appendChild(el);
            }
            if (res.confessed) el.classList.add("confess");
            if (streamed) { el.textContent = res.text; box.scrollTop = box.scrollHeight; }
            else await UI.type(el, res.text, 15);

            State.chatFor(this.current.id).push({ role: "them", text: res.text, confess: res.confessed });
            if (res.confessed && !State.confessed) {
                State.confessed = true;
                UI.toast("배정훈이 무너졌다. 최종 추리를 진술할 수 있다.", 5000);
            }
            State.save();
            this.renderChips();
            if (State.timeUp()) setTimeout(() => Accuse.forceEnd(), 1500);
        } catch (e) {
            wait.remove();
            if (el) el.remove();
            this.push("system", "⚠ " + AI.explain(e));
            if (!e || e.code !== "rate_limited") {
                AI.mode = "offline";
                this.push("system", "각본 모드로 전환합니다. 아래 질문 버튼을 사용하십시오.");
            }
            this.renderChips();
        } finally {
            this.busy = false;
            this.setBusy(false);
        }
    },

    setBusy(on) {
        document.getElementById("btn-chat-send").disabled = on;
        document.getElementById("btn-show-evidence").disabled = on;
        document.getElementById("chat-text").disabled = on;
        if (!on) document.getElementById("chat-text").focus();
    },

    // ── 각본 모드 ──────────────────────────────────────
    offlineReply(text) {
        if (text) this.push("user", text);
        this.push("them", "…무슨 말씀이신지 모르겠군요. 물으실 게 있으면 정확히 물어 주십시오.");
    },

    scriptedTopic(t) {
        if (State.timeUp()) return Accuse.forceEnd();
        this.push("user", t.q);
        if (!State.asked.includes(t.id)) {
            State.asked.push(t.id);
            State.spend();
            UI.hud();
        }
        this.push("them", t.a);
        this.renderChips();
        if (State.timeUp()) setTimeout(() => Accuse.forceEnd(), 1200);
    },

    // ── 증거 제시 ──────────────────────────────────────
    openEvidenceModal() {
        const modal = document.getElementById("modal-evidence");
        const list = document.getElementById("modal-evidence-list");
        const shown = State.presentedFor(this.current.id);
        const items = State.found.filter(id => !shown.includes(id));

        if (!items.length) {
            list.innerHTML = `<p class="nb-empty">${State.found.length ? "이 사람에게는 가진 증거를 모두 보여줬다." : "아직 내밀 증거가 없다. 먼저 현장을 조사하십시오."}</p>`;
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

        if (AI.online) {
            this.send(cid);
            return;
        }

        // 각본 모드: 미리 쓰인 반응이 있으면 그것을, 없으면 일반 반응을
        const r = (this.current.reactions || {})[cid];
        if (State.timeUp()) return Accuse.forceEnd();
        State.spend();
        UI.hud();
        if (r) {
            this.push("them", r.text);
            if (r.unlock === "break_4") {
                State.confessed = true;
                UI.toast("배정훈의 진술이 무너지고 있다.", 4000);
            }
        } else {
            this.push("them", "…글쎄요. 저는 그것에 대해 아는 바가 없습니다.");
        }
        State.save();
    }
};
