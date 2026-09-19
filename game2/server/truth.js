// ============================================================
// game2/server/truth.js
// 침선계 — 실제로 일어난 일  ★ 정답이 들어 있다. 서버 전용.
//
// knowledge.js 가 "누가 무엇을 알았나"라면 이 파일은 "무슨 일이
// 있었나"다. 모든 단서는 여기서 나온다. 단서가 여기 없는 것을
// 말하면 그것은 거짓말이고, 여기 있는 것을 말하지 않으면 그것은
// 빈틈이다. 검증기가 양쪽을 다 본다.
// ============================================================

const SETTING = {
    year: 1934, city: "경성",
    cell: {
        name: "침선계", meaning: "바느질 계. 곗돈을 모으는 아낙네 모임으로 위장했다.",
        front: "종로 뒷골목의 침선방. 간판은 '한성침선(漢城針線)'.",
        work: "등사판 소식지를 찍고, 만주로 가는 자금선의 이름을 옮긴다.",
        cover: "계(契)는 흔하다. 여자 여럿이 매달 모여 장부에 도장을 찍어도 아무도 보지 않는다."
    },
    upline: {
        what: "상해로 이어지는 선",
        who: "계주만 안다. 계원 여섯 중 누구도 모른다.",
        matters: "순사가 아이에게 나흘 동안 물은 것이 이것이다."
    }
};

// ── 그날까지 ────────────────────────────────────────────────
// 시각은 단서가 말할 수 있는 것과 없는 것을 가른다.
// by    : 이 일을 아는 사람 (계주 제외)
// grants: 이 일로 손에 들어오는 조각. 조각마다 by 를 다 모으면
//         knowledge.js 의 아는 사람 목록과 정확히 같아야 한다.
// mark  : 이 일이 세상에 남긴 흔적 = 단서 후보
const TIMELINE = [
    { when: "3월 9일 낮", what: "포목점 심부름꾼이 감찰 단속에 걸려 못 쓰게 됐다. 행상이 그 소식을 계주에게 물어다 줬다.",
      by: ["peddler"], mark: ["c_replacement"] },
    { when: "3월 9일 저녁", what: "계주가 운반책을 이선화로 바꿨다. 침모에게 치수를 일렀다.",
      by: ["peddler", "seamstress"], grants: ["F1_who"], mark: ["c_replacement", "c_uniform"] },
    { when: "3월 10일 낮", what: "계주가 기생더러 요정 앞을 지나는 아이 얼굴을 익혀두라 했다. 급한 전갈을 넘길 자리가 거기뿐이라.",
      by: ["gisaeng"], grants: ["F1_who"], mark: [] },
    { when: "3월 11일 저녁", what: "계주가 산파에게 받을 자리와 뜯을 자리를 일러뒀다. 받는 쪽은 얼굴을 보지 않는다.",
      by: ["midwife"], grants: ["F4_how"], mark: ["c_split_note"] },
    { when: "3월 12일 낮 한 시", what: "침선방 안방에서 계 모임. 오늘 밤에 나간다고 정했다. 곗돈 장부에 참석 도장.",
      by: ["gisaeng", "operator", "seamstress", "printer", "peddler"], grants: ["F2_when"], mark: ["c_meeting_note"] },
    { when: "3월 12일 두 시부터 세 시 반", what: "모임이 끝나고 인쇄가 등사판을 돌렸다. 밤에 대려면 그 시간뿐이었다.",
      by: ["printer"], mark: ["c_ink_dates"] },
    { when: "3월 12일 오후 네 시", what: "침모가 교복 저고리 안감을 뜯고 종이를 넣고 다시 꿰맸다. 인쇄가 종이를 접어 건넸고, 행상이 실패를 가져다주러 들렀다가 보았다.",
      by: ["seamstress", "printer", "peddler"], grants: ["F4_how"], mark: ["c_sewing_room", "c_uniform"] },
    { when: "3월 12일 네 시 반", what: "침모가 침선방을 닫고 집으로 갔다.", by: ["seamstress"], mark: ["c_sewing_room"] },
    { when: "3월 12일 다섯 시", what: "인쇄가 등사실로 돌아가 밤까지 있었다. 잉크를 갈고 판을 닦았다.",
      by: ["printer"], mark: ["c_ink_dates"] },
    { when: "3월 12일 여섯 시", what: "기생이 요정에 들었다. 손님장에 이름이 오르고 새벽까지 나오지 못했다.",
      by: ["gisaeng"], mark: ["c_yojeong_ledger"] },
    { when: "3월 12일 일곱 시", what: "행상이 원래 길에 단속이 잦다고 해서 길을 바꿨다. 계주가 전화로 산파에게 알렸고 교환수가 그 선을 이었다.",
      by: ["peddler", "operator", "midwife"], grants: ["F3_where"], mark: ["c_map_marks", "c_switchboard"] },
    { when: "3월 12일 여덟 시", what: "산파가 해산을 받으러 사직동으로 갔다. 아침까지 그 집에 있었다.",
      by: ["midwife"], mark: ["c_birth_record"] },
    { when: "3월 12일 아홉 시 반", what: "사복 둘이 바뀐 길목에 자리를 잡았다. 그 시각 그 구역은 순찰 배치에 없다.",
      by: [], mark: ["c_patrol_log", "c_witness_street"] },
    { when: "3월 12일 열 시 십 분", what: "학생 넷이 그 골목을 지났다. 순사는 이선화만 세웠다. 가방도 책도 열지 않고 저고리 안감을 뜯었다.",
      by: [], mark: ["c_witness_street", "c_uniform"] },
    { when: "3월 12일 ~ 15일", what: "종로경찰서. 나흘. 순사가 물은 것은 윗선이다. 아이는 말하지 않았다.",
      by: [], mark: ["c_police_note", "c_body"] },
    { when: "3월 13일", what: "종로서 보안계에서 그 건으로 사례금이 나갔다. 가명 한 줄, 한 몫.",
      by: [], mark: ["c_reward_ledger", "c_police_note"] },
    { when: "3월 16일 새벽", what: "이선화가 죽었다. 주검은 뒷문으로 나왔다. 사인은 '급성 폐렴'으로 적혔다.",
      by: [], mark: ["c_body", "c_death_cert"] },
    { when: "3월 16일 아침", what: "계주가 계원 여섯을 침선방으로 부른다. 여기서 게임이 시작된다.",
      by: [], mark: [] }
];

// ── 밀정이 한 일 ────────────────────────────────────────────
// 플레이어가 끝에 가서 맞춰야 하는 그림.
const HOW_IT_WENT = {
    who: "peddler",
    contact: "감찰(행상 허가)을 내주는 종로서 보안계. 감찰을 쥔 손이 목줄이다.",
    what_she_gave: "네 조각을 한 번에 넘긴 것이 아니다. 사흘에 걸쳐 조각조각 말했고, 맞춘 것은 순사다.",
    what_she_believed: "물건만 빼앗고 아이는 훈방할 줄 알았다. 나흘을 두들길 줄은 몰랐다.",
    what_she_did_not_know: "윗선. 계원 누구도 모른다. 그래서 순사는 아이를 붙들고 나흘을 물었다.",
    payment: "사례금 한 몫. 장부에는 가명 한 줄.",
    price: "동생이 서대문에 있다. 열셋 아래. 작년 가을에 잡혀갔다."
};

// ── 여섯이 각각 숨기는 것 ───────────────────────────────────
// 밀정이 아닌 다섯도 숨기는 것이 있어야 한다. 그래야 심문이
// 전부 같은 모양이 되지 않고, 숨긴다는 것만으로는 아무도 못 지목한다.
const SECRETS = {
    gisaeng:    { hides: "아이를 뱄다. 아비는 요정에 드나드는 총독부 관리다.",
                  knows: ["midwife"], lookslike: "일본인과 깊다 — 그래서 넘겼나",
                  truth: "그 자리에서 캐낸 말로 계가 여러 번 피했다. 넘긴 쪽이 아니라 캐낸 쪽이다." },
    operator:   { hides: "아버지가 순사보다. 계원 누구에게도 말하지 않았다.",
                  knows: [], lookslike: "순사 집 딸 — 그래서 넘겼나",
                  truth: "아버지와 삼 년째 말을 섞지 않는다. 그 집을 나온 것이 계에 든 이유다." },
    seamstress: { hides: "삼 년 전에 한 번 불었다. 그때는 계가 아니었고, 사람이 죽지는 않았다.",
                  knows: [], lookslike: "전과가 있다 — 또 했나",
                  truth: "그 뒤로 스스로를 의심하며 산다. 이번에는 아무 말도 하지 않았다." },
    midwife:    { hides: "순사 집 해산도 받는다. 일본인 관사를 드나든다.",
                  knows: [], lookslike: "그 집을 드나든다 — 그래서 넘겼나",
                  truth: "드나드는 덕에 관사 안 사정이 계로 들어온다. 계주가 그렇게 시켰다." },
    printer:    { hides: "선화를 계에 끌어들인 사람이 본인이다. 잡히기 전날 그 아이와 다퉜다.",
                  knows: [], lookslike: "마지막으로 다툰 사람 — 홧김에 넘겼나",
                  truth: "다툰 까닭은 위험하니 그만두라는 말을 아이가 듣지 않아서다." },
    peddler:    { hides: "동생이 서대문에 있다. 감찰을 쥔 손이 목줄이다.",
                  knows: [], lookslike: "누구보다 발이 넓다 — 그래서 다 안다",
                  truth: "다 안 것이 맞다. 그리고 다 말했다." }
};

module.exports = { SETTING, TIMELINE, HOW_IT_WENT, SECRETS };
