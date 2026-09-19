// ============================================================
// game2/js/people.js — 만날 수 있는 사람들
// 계주는 용의자가 아니다. 그러나 말은 붙일 수 있다.
// ============================================================

const People = {
    all() { return CASE.suspects.concat([CASE.chief]); },
    get(id) { return this.all().find(p => p.id === id) || null; },
    isSuspect(id) { return CASE.suspects.some(s => s.id === id); },
    // 이 사람에게서 실제로 답을 들었는가
    heard(id) { return (State.chats[id] || []).some(m => m.role === "them"); }
};
