// ============================================================
// game2/server/knowledge.js
// 침선계 — 지식 격자  ★ 정답이 들어 있다. 브라우저로 내려보내지 않는다.
//
// 이 사건은 "누가 어디 있었나"가 아니라 "누가 무엇을 알았나"로 푼다.
// 계주는 일부러 정보를 쪼개어 나눠준다. 한 사람이 다 알면 그 한 사람이
// 무너질 때 계가 통째로 무너지므로. 그런데 순사는 네 조각을 전부 쥐고
// 그 길목에 서 있었다. 쪼갠 것이 한 자리에 모였다는 것 — 그것이 사건이다.
//
// 검증기가 확인하는 것:
//   · 네 조각을 전부 쥔 사람이 정확히 한 명인가
//   · 조각마다 최소 한 명은 몰랐고(판별력), 최소 두 명은 알았는가(즉답 방지)
//   · 나머지 다섯이 빠뜨린 조각을 플레이어가 확인할 수 있는가
//   · 둘이 나눠 흘렸을 가능성이 이야기로 잠기는가
// ============================================================

const MEMBERS = {
    gisaeng:    { name: "김월향", age: 23, job: "기생",        sphere: "jp_spoken"  },
    operator:   { name: "윤정희", age: 25, job: "전화교환수",  sphere: "comms"      },
    seamstress: { name: "한말선", age: 28, job: "침모",        sphere: "jp_written" },
    midwife:    { name: "오복녀", age: 41, job: "산파",        sphere: "private"    },
    printer:    { name: "배영실", age: 22, job: "인쇄 담당",   sphere: "internal"   },
    peddler:    { name: "차금옥", age: 26, job: "행상",        sphere: "street"     }
};

const GYEJU  = { name: "서영신", age: 54, title: "계주" };
const VICTIM = { name: "이선화", age: 17, job: "여학생", role: "운반책" };

// ── 계주의 분리 원칙 ────────────────────────────────────────
// 격자가 성립하는 이유. 계주가 1막에서 직접 말한다.
const SPLIT_RULE = {
    line: "한 사람이 다 알면, 그 한 사람이 무너질 때 계가 통째로 무너진다.",
    detail: "누가 나르는지, 언제 나가는지, 어느 길로 가는지, 어디에 넣는지 — 넷을 한 사람에게 다 일러준 적이 없다.",
    proof: ["talk:gyeju", "c_split_note"]
};

// ── 그날 밤 순사가 알고 있었던 네 조각 ──────────────────────
// police : 순사의 행동 중 '그것을 알았다'를 드러내는 부분
// proof  : 플레이어가 그 행동을 확인하는 경로
const FACTS = {
    F1_who: {
        what: "그날의 운반책이 이선화라는 것",
        note: "사흘 전에 바뀌었다. 그 전까지는 포목점 심부름꾼이 날랐다.",
        police: "검문이 아니었다. 같은 시각 그 골목을 지난 학생이 넷인데 그 아이만 세웠다.",
        proof: ["c_witness_street", "c_replacement"]
    },
    F2_when: {
        what: "그날 밤에 나간다는 것",
        police: "미리 나와 기다리고 있었다. 그 시각 그 구역은 순찰 배치에 없다.",
        proof: ["c_patrol_log", "c_witness_street"]
    },
    F3_where: {
        what: "길이 그날 저녁에 바뀌었다는 것",
        police: "원래 길이 아니라 바뀐 길목에 서 있었다.",
        proof: ["c_map_marks", "talk:gyeju"]
    },
    F4_how: {
        what: "교복 저고리 안감에 넣었다는 것",
        police: "가방도 책도 열어보지 않았다. 곧장 안감을 뜯었다.",
        proof: ["c_uniform", "c_body"]
    }
};

// ── 여섯 명이 각각 무엇을 쥐고 있었나 ───────────────────────
// knew  : 그 조각을 알았다
// how   : 어떻게 알게 됐는가   (알았다는 것을 플레이어가 증명할 수 있어야 한다)
// why   : 왜 몰랐는가          (몰랐다는 것을 플레이어가 확인할 수 있어야 한다)
// proof : 그 칸을 확인하는 경로
const KNEW = {
    // 기생 — 요정에 매인 몸. 저녁 여섯 시면 이미 자리에 앉아 있다.
    gisaeng: {
        F1_who:   { knew: true,  how: "계주가 아이 얼굴을 익혀두라고 요정 앞을 한 번 지나가게 했다.",
                    proof: ["talk:gyeju", "talk:gisaeng"] },
        F2_when:  { knew: true,  how: "그날 낮 계 모임에서 오늘 밤이라는 말이 오갔다.",
                    proof: ["c_meeting_note", "talk:gyeju"] },
        F3_where: { knew: false, why: "여섯 시에 요정으로 들어가 새벽까지 나오지 못했다. 길은 일곱 시에 바뀌었다.",
                    proof: ["c_yojeong_ledger", "talk:gyeju"] },
        F4_how:   { knew: false, why: "침선방에 간 적이 없다. 꿰맨 쪽과 받을 쪽 말고는 알리지 않는다.",
                    proof: ["c_sewing_room", "talk:seamstress"] }
    },
    // 전화교환수 — 선을 잇는 자리. 오가는 말은 듣지만 이름은 오르지 않는다.
    operator: {
        F1_who:   { knew: false, why: "교환대에 이름이 오른 적이 없다. 통화에서는 '그 아이'라고만 했다.",
                    proof: ["c_switchboard", "talk:gyeju"] },
        F2_when:  { knew: true,  how: "그날 낮 계 모임에 있었다.",
                    proof: ["c_meeting_note", "talk:gyeju"] },
        F3_where: { knew: true,  how: "일곱 시에 길을 바꾸는 통화를 본인이 연결했다.",
                    proof: ["c_switchboard", "talk:operator"] },
        F4_how:   { knew: false, why: "안감 얘기는 선을 타고 오간 적이 없다. 침선방 안에서만 정해졌다.",
                    proof: ["c_switchboard", "talk:seamstress"] }
    },
    // 침모 — 손으로 꿰맨 사람. 아는 것이 셋이라 가장 의심스럽다.
    seamstress: {
        F1_who:   { knew: true,  how: "그 아이 치수로 저고리를 고쳤다. 몸에 맞춰야 하니 누구인지 알아야 했다.",
                    proof: ["c_uniform", "talk:seamstress"] },
        F2_when:  { knew: true,  how: "그날 오후 네 시에 꿰맸다. 밤에 나간다는 말을 듣고 서둘렀다.",
                    proof: ["c_sewing_room", "talk:gyeju"] },
        F3_where: { knew: false, why: "네 시 반에 침선방을 닫고 집으로 갔다. 길은 일곱 시에 바뀌었다.",
                    proof: ["c_sewing_room", "talk:gyeju"] },
        F4_how:   { knew: true,  how: "본인이 꿰맸다.",
                    proof: ["c_uniform", "talk:seamstress"] }
    },
    // 산파 — 받는 쪽. 골목에서 신호만 주고받고 얼굴은 보지 않는다.
    midwife: {
        F1_who:   { knew: false, why: "받는 자리에서는 얼굴을 보지 않는다. 신호를 맞추고 물건만 받는다.",
                    proof: ["talk:midwife", "talk:gyeju"] },
        F2_when:  { knew: false, why: "오늘이나 내일이라고만 들었다. 그날 밤에는 해산을 받으러 나가 있었다.",
                    proof: ["c_birth_record", "talk:midwife"] },
        F3_where: { knew: true,  how: "바뀐 길이 제 집 쪽으로 오는 길이라 미리 들었다.",
                    proof: ["c_map_marks", "talk:midwife"] },
        F4_how:   { knew: true,  how: "받으면 뜯어내야 하니 어디에 들었는지 들었다.",
                    proof: ["talk:midwife", "talk:seamstress"] }
    },
    // 인쇄 담당 — 찍어서 넘기고 끝. 누가 나르는지는 묻지 않는다.
    printer: {
        F1_who:   { knew: false, why: "찍어서 넘기는 데까지가 제 몫이다. 나르는 사람은 묻지 않는 것이 계의 법이다.",
                    proof: ["talk:printer", "talk:gyeju"] },
        F2_when:  { knew: true,  how: "모임이 끝나자마자 등사판을 돌렸다. 밤에 대려면 그 시간뿐이었다.",
                    proof: ["c_ink_dates", "talk:printer"] },
        F3_where: { knew: false, why: "오후에 침선방으로 넘기고 등사실로 돌아가 밤까지 있었다.",
                    proof: ["c_ink_dates", "talk:printer"] },
        F4_how:   { knew: true,  how: "침선방에서 종이를 접어 건넨 사람이 본인이다.",
                    proof: ["c_sewing_room", "talk:seamstress"] }
    },
    // 행상 — 하루 종일 길 위에 있다. 모든 자리를 스쳐 지나간다.
    peddler: {
        F1_who:   { knew: true,  how: "포목점이 끊긴 것을 계주에게 알린 사람이 본인이다. 그래서 아이로 바뀌었고, 바뀌는 자리에 있었다.",
                    proof: ["c_replacement", "c_draper_word", "talk:gyeju"] },
        F2_when:  { knew: true,  how: "그날 낮 계 모임에 있었다.",
                    proof: ["c_meeting_note", "talk:gyeju"] },
        F3_where: { knew: true,  how: "길을 바꾸자고 한 사람이 본인이다. 그 길이 조용하다고 했다.",
                    proof: ["c_map_marks", "talk:gyeju", "talk:peddler"] },
        F4_how:   { knew: true,  how: "침선방에 물건을 가져다주러 들렀다가 꿰매는 것을 보았다.",
                    proof: ["c_sewing_room", "c_spool", "talk:seamstress"] }
    }
};

// ── 둘이 나눠 흘렸을 가능성을 막는 것 ───────────────────────
// 격자만으로는 막히지 않는다(네 조각·여섯 명으로는 수학적으로 불가능하다).
// 그래서 이야기로 잠근다. 순사 쪽 장부가 사람 수를 말해준다.
const COLLUSION_LOCK = {
    line: "그날 밤 건으로 나간 사례금은 한 몫이다. 받아간 이름 자리에는 가명 하나뿐.",
    detail: "둘이 나눠 흘렸다면 몫도 둘이어야 한다. 장부에는 한 줄이다.",
    proof: ["c_reward_ledger", "c_police_note"]
};

const CULPRIT = "peddler";

module.exports = { MEMBERS, GYEJU, VICTIM, SPLIT_RULE, FACTS, KNEW, COLLUSION_LOCK, CULPRIT };
