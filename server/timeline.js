// ============================================================
// server/timeline.js
// 어젯밤 실제 행적을 '데이터'로 적어 둔 것. 산문이 아니라 표다.
// 작가의 머릿속에 있던 것을 파일에 꺼내 두면 기계가 검사할 수 있다.
//
// by = 플레이어가 이 사실을 확인할 수 있는 근거
//      "c_xxx"    → 증거
//      "talk:xxx" → 그 인물을 심문해서 듣는 말
//
// 이 파일은 서버에만 있다. 브라우저로 내려가지 않는다.
// ============================================================

// 시각은 20:00 기준 분으로 환산해 자정을 넘어가도 순서가 유지되게 한다
function t(hhmm) {
    const [h, m] = hhmm.split(":").map(Number);
    return (h < 12 ? h + 24 : h) * 60 + m - 20 * 60;
}

// 범행 가능 시간대와, 그 경계를 세우는 근거
const WINDOW = {
    from: "00:12", by_from: ["c_phone"],       // 이 시각에 피해자가 살아 있었다
    to:   "00:45", by_to:   ["talk:oh"]        // 이 시각에 작업실 불이 꺼졌다
};

const CULPRIT = "bae";

// with   = 함께 있었다 (쌍방. 서로 증언해 줄 수 있다)
// seenBy = 저쪽에서 나를 보거나 들었다 (일방. 나는 저쪽을 증언해 주지 못한다)
// 둘 다 비어 있으면 혼자다.
const TIMELINE = {
    han: [
        { from: "22:30", to: "23:10", where: "작업실", with: ["victim"], by: ["talk:han"] },
        { from: "23:10", to: "00:10", where: "201호",  with: [],         by: ["talk:han"] },
        { from: "00:10", to: "00:55", where: "주방",   with: ["seo"],    by: ["talk:han", "talk:seo", "c_teacups"] }
    ],
    seo: [
        { from: "23:20", to: "23:50", where: "진입로 끝", with: [],      by: ["talk:seo"] },
        { from: "23:50", to: "00:00", where: "현관 근처", with: ["oh"],  by: ["talk:seo", "talk:oh"] },
        { from: "00:00", to: "00:10", where: "거실",   with: [], seenBy: [],
          note: "뻗어 있는 윤태오를 보았을 뿐이다. 의식 없는 사람은 그를 본 사람의 알리바이가 되어주지 못한다. 이 10분은 서가을도 혼자다 — 다만 범행 시간대(00:12~) 전이라 문제되지 않는다.",
          by: ["talk:seo"] },
        { from: "00:10", to: "00:55", where: "주방",   with: ["han"],    by: ["talk:seo", "talk:han", "c_teacups"] }
    ],
    yun: [
        { from: "23:00", to: "23:50", where: "거실",   with: ["bae"],    by: ["talk:yun", "talk:bae", "c_bottle"] },
        { from: "23:50", to: "00:00", where: "거실 소파", with: [], seenBy: [],
          note: "만취해 잠듦. 이 10분은 아무도 보지 않았다.",
          by: ["c_bottle"] },
        { from: "00:00", to: "07:10", where: "거실 소파", with: [], seenBy: ["seo", "han"],
          note: "00:00 서가을이 들어오며 보고, 00:10부터는 주방의 두 사람이 계속 봄.",
          by: ["talk:seo", "c_bottle", "c_kwindow"] }
    ],
    oh: [
        { from: "23:00", to: "23:50", where: "보일러실", with: [],       by: ["c_boilerlog", "talk:oh"] },
        { from: "23:50", to: "00:00", where: "보일러실 앞", with: ["seo"], by: ["talk:oh", "talk:seo"] },
        { from: "00:00", to: "00:10", where: "창고",    with: [],        by: ["talk:oh"] },
        { from: "00:10", to: "01:10", where: "진입로",  with: [], seenBy: ["han", "seo"],
          note: "제설기 소음을 주방의 두 사람이 내내 들음. 소리만으로는 모는 사람이 누구인지 보지 못한다.",
          by: ["c_plow", "talk:oh", "talk:han", "talk:seo"] }
    ],
    bae: [
        { from: "23:00", to: "23:50", where: "거실",   with: ["yun"],    by: ["talk:bae", "talk:yun", "c_bottle"] },
        { from: "23:50", to: "07:10", where: "불명",   with: [],
          note: "본인은 204호에서 잤다고 진술. 목격자 없음.",
          by: ["talk:bae", "c_room_bae"] }
    ]
};

// 범인이 아닌 사람을 지우는 근거. 플레이어가 실제로 확보할 수 있어야 한다.
const CLEARED = {
    han: { why: "00:10~00:55 주방에서 서가을과 함께", by: ["c_teacups", "talk:seo"] },
    seo: { why: "00:10~00:55 주방에서 한소민과 함께", by: ["c_teacups", "talk:han"] },
    yun: { why: "만취해 소파에서 잠듦. 주방에서 계속 보임", by: ["c_bottle", "c_kwindow", "talk:seo"] },
    oh:  { why: "00:10~01:10 제설기 가동. 소음을 두 사람이 들음", by: ["c_plow", "talk:han", "talk:seo"] }
};

// 최종 추리 각 문항의 답을 뒷받침하는 증거
const SUPPORT = {
    q_culprit: ["c_phone", "c_teacups", "c_plow", "c_bottle", "c_kwindow", "c_room_bae"],
    q_weapon:  ["c_statue", "c_pedestal"],
    q_trick:   ["c_clock", "c_clock_trick", "c_phone"],
    q_motive:  ["c_room_seo", "c_ash"],
    q_prints:  ["c_footprint", "c_stride", "c_newspaper", "c_shoes", "c_boots", "c_window"]
};

module.exports = { t, WINDOW, CULPRIT, TIMELINE, CLEARED, SUPPORT };
