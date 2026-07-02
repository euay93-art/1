// ============================================================
// js/arena.js
// 지하결투장 (블러드 릴리) 시스템 V3 - 5각 상성 & 고유 스킬 업데이트
// ============================================================

let ARENA_FIGHTERS = [
    { id: "f1", name: "카리나", team: "aespa", teamColor: "#a855f7", title: "무결점의 처형인", catchphrase: "내 발끝이 닿는 곳이 곧 너의 무덤이야.", hp: 900, maxHp: 900, atkMin: 40, atkMax: 70, evasion: 0.10, critRate: 0.40, critMult: 2.5, bounty: 1000, streak: 0, isSponsored: false, matches: 0, wins: 0, losses: 0, koWins: 0, decWins: 0, vipCount: 0, killCount: 0, maxBounty: 1000, lore: "신디케이트의 냉혹한 간부이자 처형인. 감정을 철저히 배제한 완벽한 킬링 머신으로, 그녀의 하이킥은 상대의 경동맥을 서늘하고 정확하게 끊어버린다.\n\n<span style='color:#a855f7; font-weight:bold;'>[스킬: 단두대 하이킥] 적의 HP가 20% 이하일 때 30% 확률로 즉사(K.O) 시킵니다.</span>" },
    { id: "f2", name: "윈터", team: "aespa", teamColor: "#a855f7", title: "냉혹한 스나이퍼", catchphrase: "숨소리조차 내지 마. 이미 늦었으니까.", hp: 850, maxHp: 850, atkMin: 35, atkMax: 80, evasion: 0.15, critRate: 0.45, critMult: 2.2, bounty: 1000, streak: 0, isSponsored: false, matches: 0, wins: 0, losses: 0, koWins: 0, decWins: 0, vipCount: 0, killCount: 0, maxBounty: 1000, lore: "전직 국가 기밀 부대 소속 스나이퍼. 총을 버리고 링에 올랐으나, 백발백중의 정밀 타격 본능은 그대로다. 상대의 호흡이 끊기는 0.1초의 찰나를 노려 급소를 꿰뚫는다.\n\n<span style='color:#3b82f6; font-weight:bold;'>[스킬: 헤드샷] 매치 시작 후 자신의 첫 번째 공격은 무조건 100% 치명타로 적중합니다.</span>" },
    { id: "f3", name: "닝닝", team: "aespa", teamColor: "#a855f7", title: "치명적인 독수", catchphrase: "반칙? 살아남는 게 유일한 룰이지.", hp: 850, maxHp: 850, atkMin: 30, atkMax: 85, evasion: 0.20, critRate: 0.35, critMult: 2.5, bounty: 1000, streak: 0, isSponsored: false, matches: 0, wins: 0, losses: 0, koWins: 0, decWins: 0, vipCount: 0, killCount: 0, maxBounty: 1000, lore: "하얼빈 뒷골목을 지배하던 독약 제조가. 그녀의 손톱과 타격에는 신경을 마비시키는 미세한 독이 묻어 있어, 스치는 것만으로도 상대는 죽음의 공포를 느낀다.\n\n<span style='color:#10b981; font-weight:bold;'>[스킬: 맹독 부여] 타격 성공 시 15% 확률로 적을 중독시켜, 매 턴 최대 HP의 5% 피해를 줍니다.</span>" },
    { id: "f4", name: "지젤", team: "aespa", teamColor: "#a855f7", title: "우아한 사신", catchphrase: "가장 우아하게, 그리고 가장 끔찍하게 끝내줄게.", hp: 950, maxHp: 950, atkMin: 40, atkMax: 75, evasion: 0.10, critRate: 0.35, critMult: 2.0, bounty: 1000, streak: 0, isSponsored: false, matches: 0, wins: 0, losses: 0, koWins: 0, decWins: 0, vipCount: 0, killCount: 0, maxBounty: 1000, lore: "몰락한 재벌가의 외동딸에서 암살 조직의 에이스로 거듭난 인물. 가장 우아한 동작으로 춤을 추듯 다가가, 가장 잔인하고 끔찍한 일격을 선사한다.\n\n<span style='color:#f472b6; font-weight:bold;'>[스킬: 피의 왈츠] 치명타가 터질 때마다 자신의 회피율이 5%씩 영구적으로 상승합니다.</span>" },
    { id: "f5", name: "김채원", team: "LE SSERAFIM", teamColor: "#ef4444", title: "독기 품은 불도저", catchphrase: "한 번 쓰러뜨려 봐. 난 웃으면서 다시 일어날 테니까.", hp: 1800, maxHp: 1800, atkMin: 45, atkMax: 90, evasion: 0.05, critRate: 0.10, critMult: 1.5, bounty: 1000, streak: 0, isSponsored: false, matches: 0, wins: 0, losses: 0, koWins: 0, decWins: 0, vipCount: 0, killCount: 0, maxBounty: 1000, lore: "지하 데스매치에서 단 한 번도 쓰러진 적 없는 전설. 고통을 모르는 짐승처럼 피투성이가 된 채 웃으며 다가가, 기어코 상대의 숨통을 끊어놓는 진정한 괴물.\n\n<span style='color:#ef4444; font-weight:bold;'>[스킬: 아드레날린 분출] 자신의 HP가 50% 이하가 되면 공격력이 1.5배로 대폭 상승합니다.</span>" },
    { id: "f6", name: "사쿠라", team: "LE SSERAFIM", teamColor: "#ef4444", title: "관절 파괴자", catchphrase: "비즈니스는 깔끔해야지. 뼈를 부러뜨려줄게.", hp: 1700, maxHp: 1700, atkMin: 50, atkMax: 85, evasion: 0.08, critRate: 0.15, critMult: 1.5, bounty: 1000, streak: 0, isSponsored: false, matches: 0, wins: 0, losses: 0, koWins: 0, decWins: 0, vipCount: 0, killCount: 0, maxBounty: 1000, lore: "20년 경력의 지하 프로레슬러 생존자. 타격보다는 실전 압축 근육으로 옭아매는 그래플링의 달인. 한 번 잡힌 상대는 뼈와 인대가 산산조각 날 때까지 풀려나지 못한다.\n\n<span style='color:#a855f7; font-weight:bold;'>[스킬: 암바] 적의 공격을 맞았을 때 20% 확률로 적의 기본 공격력을 영구히 10% 감소시킵니다.</span>" },
    { id: "f7", name: "카즈하", team: "LE SSERAFIM", teamColor: "#ef4444", title: "강철의 발레리나", catchphrase: "가장 아름다운 춤은 피보라 속에서 완성되는 법.", hp: 1600, maxHp: 1600, atkMin: 55, atkMax: 95, evasion: 0.10, critRate: 0.10, critMult: 1.8, bounty: 1000, streak: 0, isSponsored: false, matches: 0, wins: 0, losses: 0, koWins: 0, decWins: 0, vipCount: 0, killCount: 0, maxBounty: 1000, lore: "토슈즈 대신 쇳덩이가 박힌 군화를 신고 링에 오르는 전직 발레리나. 우아한 턴 스핀 뒤에 날아오는 묵직한 하이킥은 상대의 두개골을 함몰시키기에 충분하다.\n\n<span style='color:#fcd34d; font-weight:bold;'>[스킬: 불굴의 백조] K.O 당할 피해를 입었을 때, 경기 중 딱 한 번 체력을 15% 회복하며 부활합니다.</span>" },
    { id: "f8", name: "이채영", team: "fromis_9", teamColor: "#ec4899", title: "환영의 포식자", catchphrase: "도망쳐봐, 어차피 내 스텝 안이니까.", hp: 1100, maxHp: 1100, atkMin: 25, atkMax: 60, evasion: 0.40, critRate: 0.15, critMult: 1.8, bounty: 1000, streak: 0, isSponsored: false, matches: 0, wins: 0, losses: 0, koWins: 0, decWins: 0, vipCount: 0, killCount: 0, maxBounty: 1000, lore: "악명 높은 사채업자 출신 해결사. 잔상만 남기는 미친 스텝으로 상대의 공격을 약올리듯 피하며, 이성을 잃은 상대의 틈을 노려 피를 말려 죽이는 악질적인 플레이어.\n\n<span style='color:#ec4899; font-weight:bold;'>[스킬: 사각지대 습격] 적의 공격을 회피한 직후의 반격은 치명타 확률이 2배로 증폭됩니다.</span>" },
    { id: "f9", name: "송하영", team: "fromis_9", teamColor: "#ec4899", title: "경쾌한 스텝", catchphrase: "내 리듬을 따라올 수 있겠어?", hp: 1050, maxHp: 1050, atkMin: 20, atkMax: 55, evasion: 0.45, critRate: 0.10, critMult: 1.5, bounty: 1000, streak: 0, isSponsored: false, matches: 0, wins: 0, losses: 0, koWins: 0, decWins: 0, vipCount: 0, killCount: 0, maxBounty: 1000, lore: "이태원 스트리트 댄스 크루의 리더. 카포에라와 비보잉을 결합한 아크로바틱 무술의 창시자. 그녀의 예측 불가능한 움직임 앞에서 상대는 제풀에 지쳐 쓰러진다.\n\n<span style='color:#10b981; font-weight:bold;'>[스킬: 카포에라 리듬] 적의 공격을 회피할 때마다 잃은 체력의 5%를 즉시 회복합니다.</span>" },
    { id: "f10", name: "박지원", team: "fromis_9", teamColor: "#ec4899", title: "스웨이의 달인", catchphrase: "가드 올려. 뼛속까지 울리게 해줄 테니까.", hp: 1200, maxHp: 1200, atkMin: 30, atkMax: 65, evasion: 0.35, critRate: 0.10, critMult: 1.5, bounty: 1000, streak: 0, isSponsored: false, matches: 0, wins: 0, losses: 0, koWins: 0, decWins: 0, vipCount: 0, killCount: 0, maxBounty: 1000, lore: "전 국가대표 복서 출신. 압도적인 상체 움직임(스웨이)으로 쏟아지는 펀치를 종이 한 장 차이로 모두 흘려보낸다. 분노한 상대가 헛손질을 할 때, 묵직한 카운터 잽을 꽂아넣는다.\n\n<span style='color:#f59e0b; font-weight:bold;'>[스킬: 뎀프시롤] 회피 성공 시 다음 타격 데미지가 20% 증가합니다. (중첩 가능, 공격 성공 시 초기화)</span>" },
    { id: "f11", name: "정원이", team: "RESCENE", teamColor: "#10b981", title: "통제불능 미친개", catchphrase: "뭐해? 더 세게 때려보라고!", hp: 1300, maxHp: 1300, atkMin: 35, atkMax: 70, evasion: 0.20, critRate: 0.25, critMult: 2.0, bounty: 1000, streak: 0, isSponsored: false, matches: 0, wins: 0, losses: 0, koWins: 0, decWins: 0, vipCount: 0, killCount: 0, maxBounty: 1000, lore: "격투기 훈련을 받은 적 없는 뒷골목 고교 자퇴생. 하지만 선천적인 짐승의 반사신경으로, 상대가 때리려는 찰나의 순간을 파고들어 턱주가리를 박살 내는 천부적인 카운터 펀처.\n\n<span style='color:#f59e0b; font-weight:bold;'>[스킬: 카운터 펀치] 데미지를 입었을 때 25% 확률로 즉각 반격하여 받은 피해의 50%를 돌려줍니다.</span>" },
    { id: "f12", name: "미나미", team: "RESCENE", teamColor: "#10b981", title: "더티 카운터", catchphrase: "수단과 방법을 가리지 않는 게 진짜 싸움이지.", hp: 1400, maxHp: 1400, atkMin: 30, atkMax: 75, evasion: 0.15, critRate: 0.20, critMult: 1.8, bounty: 1000, streak: 0, isSponsored: false, matches: 0, wins: 0, losses: 0, koWins: 0, decWins: 0, vipCount: 0, killCount: 0, maxBounty: 1000, lore: "조직에 배신당한 오사카 야쿠자 출신. 정정당당한 승부 따윈 개나 줘버렸다. 상대의 빈틈을 유도한 뒤, 눈 찌르기와 낭심 차기를 서슴지 않는 진흙탕 싸움의 1인자.\n\n<span style='color:#64748b; font-weight:bold;'>[스킬: 눈 찌르기] 공격 성공 시 15% 확률로 상대방의 시야를 가려 다음 공격을 무조건 빗나가게 만듭니다.</span>" }
];

let STANDBY_FIGHTERS = [
    { id: "f13", name: "제나", team: "RESCENE", teamColor: "#10b981", title: "살을 주고 뼈를 깎는 자", catchphrase: "아프냐고? 난 이 고통이 너무 즐거워!", hp: 1350, maxHp: 1350, atkMin: 40, atkMax: 75, evasion: 0.15, critRate: 0.20, critMult: 1.7, bounty: 1000, streak: 0, isSponsored: false, matches: 0, wins: 0, losses: 0, koWins: 0, decWins: 0, vipCount: 0, killCount: 0, maxBounty: 1000, lore: "희귀한 무통증 환자. 가드를 내리고 상대의 공격을 일부러 얼굴로 받아낸다. 상대가 타격의 반동으로 방심하는 순간, 웃으며 두 배의 충격을 돌려주는 전투광.\n\n<span style='color:#ef4444; font-weight:bold;'>[스킬: 통각 상실] 상대방의 '크리티컬 배율'을 무시하고, 모든 치명타를 일반 데미지로만 받아냅니다.</span>" },
    { id: "f14", name: "리브", team: "RESCENE", teamColor: "#10b981", title: "계산된 역습", catchphrase: "너의 다음 움직임, 0.1초 전에 이미 계산 끝났어.", hp: 1250, maxHp: 1250, atkMin: 35, atkMax: 80, evasion: 0.25, critRate: 0.15, critMult: 1.9, bounty: 1000, streak: 0, isSponsored: false, matches: 0, wins: 0, losses: 0, koWins: 0, decWins: 0, vipCount: 0, killCount: 0, maxBounty: 1000, lore: "멘사 출신의 수학 천재. 링 위에 오르는 순간 상대의 근육 움직임을 실시간 방정식으로 푼다. 정확히 0.1초 뒤의 미래를 예측해 완벽한 각도에 주먹을 대기시켜 놓는다.\n\n<span style='color:#3b82f6; font-weight:bold;'>[스킬: 수읽기] 매 턴이 지날 때마다 자신의 회피율이 3%씩 영구적으로 상승합니다.</span>" },
    { id: "f15", name: "메이", team: "RESCENE", teamColor: "#10b981", title: "보이지 않는 그림자", catchphrase: "내 그림자를 밟을 수 있다면 쳐보든가.", hp: 1200, maxHp: 1200, atkMin: 30, atkMax: 70, evasion: 0.30, critRate: 0.20, critMult: 2.0, bounty: 1000, streak: 0, isSponsored: false, matches: 0, wins: 0, losses: 0, koWins: 0, decWins: 0, vipCount: 0, killCount: 0, maxBounty: 1000, lore: "이름 없는 고아원에서 자란 은신술의 달인. 상대가 맹렬히 공격을 퍼부은 직후 숨을 고르는 아주 짦은 순간, 사각지대에서 튀어나와 관절을 꺾어버린다.\n\n<span style='color:#10b981; font-weight:bold;'>[스킬: 암습] 공격 시 30% 확률로 상대의 회피율을 완전히 무시하고 타격을 꽂아넣습니다.</span>" },
    { id: "f16", name: "김나경", team: "tripleS", teamColor: "#3b82f6", title: "침착한 해부학자", catchphrase: "급소는 이미 파악했어. 메스 대신 주먹으로 갈라줄게.", hp: 900, maxHp: 900, atkMin: 70, atkMax: 80, evasion: 0.20, critRate: 0.20, critMult: 1.5, bounty: 1000, streak: 0, isSponsored: false, matches: 0, wins: 0, losses: 0, koWins: 0, decWins: 0, vipCount: 0, killCount: 0, maxBounty: 1000, lore: "의대 본과 출신의 사이코패스 해부학 천재. 맷집이 두껍든 회피율이 높든 인체의 가장 연약한 신경망을 핀포인트로 파괴하며, 단숨에 상대를 식물인간으로 만든다.\n\n<span style='color:#a855f7; font-weight:bold;'>[스킬: 급소 찌르기] 회피를 무시하며, 매 턴 고정 80의 관통(True) 피해를 입힙니다.</span>" }
];

let GRADUATED_FIGHTERS = [];
let MISSING_FIGHTERS = [];

let currentArenaMatches = []; 
let currentArenaMatch = null;
let arenaSelectedBet = null;
let arenaLiveInterval = null;
let activeSponsor = { fighterId: null, amount: 0 };

const FIGHTER_BASE_STATS = {};
[...ARENA_FIGHTERS, ...STANDBY_FIGHTERS].forEach(f => {
    FIGHTER_BASE_STATS[f.id] = { maxHp: f.maxHp, critRate: f.critRate };
});

function restoreOriginalStats(f) {
    if (FIGHTER_BASE_STATS[f.id]) {
        f.maxHp = FIGHTER_BASE_STATS[f.id].maxHp;
        f.critRate = FIGHTER_BASE_STATS[f.id].critRate;
    }
    f.isSponsored = false;
    f.currentHp = Math.min(f.currentHp, f.maxHp);
}

function initCombatStats(f) {
    f.c = {
        firstHit: true,
        poison: false,
        evaBonus: 0,
        atkDebuff: 0,
        nextCritDouble: false,
        dmgStack: 0,
        blinded: false,
        surviveUsed: false,
        chaewonTriggered: false
    };
}

function calculateArenaOdds(fA, fB) {
    const getScore = (f) => {
        const ehp = f.maxHp / (1 - f.evasion);
        const avgAtk = ((f.atkMin + f.atkMax) / 2) * (1 - f.critRate + f.critRate * f.critMult);
        return ehp * avgAtk;
    };
    const scoreA = getScore(fA), scoreB = getScore(fB);
    const total = scoreA + scoreB;
    
    let oddsA = Math.max(1.25, (1 / (scoreA / total)) * 0.95 + 0.25);
    let oddsB = Math.max(1.25, (1 / (scoreB / total)) * 0.95 + 0.25);
    
    return { A: parseFloat(oddsA.toFixed(2)), B: parseFloat(oddsB.toFixed(2)) };
}

function generateArenaMatches() {
    if (ARENA_FIGHTERS.length < 8) return; 

    const shuffled = [...ARENA_FIGHTERS].sort(() => Math.random() - 0.5);
    currentArenaMatches = [];
    for (let i = 0; i < 4; i++) {
        const fA = shuffled[i * 2], fB = shuffled[i * 2 + 1];
        const odds = calculateArenaOdds(fA, fB);
        
        const betOptions = [
            { id: 'A_WIN', label: `${fA.name} 승리`, odds: odds.A, desc: "경기 결과와 무관하게 승리" },
            { id: 'B_WIN', label: `${fB.name} 승리`, odds: odds.B, desc: "경기 결과와 무관하게 승리" },
            { id: 'A_KO', label: `${fA.name} KO 승`, odds: parseFloat((odds.A * 1.8).toFixed(2)), desc: "제한 턴 내에 적 HP 0 달성" },
            { id: 'B_KO', label: `${fB.name} KO 승`, odds: parseFloat((odds.B * 1.8).toFixed(2)), desc: "제한 턴 내에 적 HP 0 달성" },
            { id: 'A_DEC', label: `${fA.name} 판정 승`, odds: parseFloat((odds.A * 2.2).toFixed(2)), desc: "3턴 종료 시 남은 HP가 더 많음" },
            { id: 'B_DEC', label: `${fB.name} 판정 승`, odds: parseFloat((odds.B * 2.2).toFixed(2)), desc: "3턴 종료 시 남은 HP가 더 많음" }
        ];
        currentArenaMatches.push({ id: i, fA: { ...fA }, fB: { ...fB }, options: betOptions });
    }
    renderArenaMatchList();
}

function renderArenaMatchList() {
    document.getElementById('arena-match-panel').style.display = 'none';
    document.getElementById('arena-live-panel').style.display = 'none';
    const listPanel = document.getElementById('arena-match-list-panel');
    listPanel.style.display = 'block';
    listPanel.innerHTML = '<div class="row-lbl" style="color:#ef4444; font-size:15px; text-align:center; margin-bottom:14px;">블러드 아레나 매치업 (오늘의 대진)</div>';

    currentArenaMatches.forEach((match, idx) => {
        let teamAHtml = match.fA.team ? `<span style="font-size:11px; color:${match.fA.teamColor}; margin-right:4px;">[${match.fA.team}]</span>` : '';
        let teamBHtml = match.fB.team ? `<span style="font-size:11px; color:${match.fB.teamColor}; margin-right:4px;">[${match.fB.team}]</span>` : '';
        
        listPanel.innerHTML += `
            <div style="background:linear-gradient(145deg, #1a0808, #0f0505); border:1px solid #7f1d1d; border-radius:10px; padding:16px; margin-bottom:10px; cursor:pointer; transition:all 0.2s; box-shadow:0 4px 10px rgba(0,0,0,0.5);"
                 onclick="selectArenaMatch(${idx})" onmouseover="this.style.borderColor='#ef4444'; this.style.transform='translateY(-2px)';" onmouseout="this.style.borderColor='#7f1d1d'; this.style.transform='translateY(0)';">
                <div style="display:flex; justify-content:space-between; align-items:center;">
                    <div style="flex:1; text-align:right; font-weight:900; color:#e2e8f0; font-size:16px;">${teamAHtml}${match.fA.name}</div>
                    <div style="color:#ef4444; font-weight:900; font-size:18px; padding:0 20px;">VS</div>
                    <div style="flex:1; text-align:left; font-weight:900; color:#e2e8f0; font-size:16px;">${teamBHtml}${match.fB.name}</div>
                </div>
            </div>
        `;
    });
}

function selectArenaMatch(idx) {
    currentArenaMatch = currentArenaMatches[idx];
    arenaSelectedBet = null; 
    document.getElementById('arena-match-list-panel').style.display = 'none';
    document.getElementById('arena-match-panel').style.display = 'block';
    renderArenaMatch();
}

function backToArenaList() {
    currentArenaMatch = null;
    arenaSelectedBet = null;
    document.getElementById('arena-match-panel').style.display = 'none';
    document.getElementById('arena-match-list-panel').style.display = 'block';
}

function renderArenaMatch() {
    if (!currentArenaMatch) return;
    const { fA, fB, options } = currentArenaMatch;
    
    let teamA = fA.team ? `<div style="font-size:12px; color:${fA.teamColor}; margin-bottom:2px; font-weight:bold;">${fA.team}</div>` : '';
    let teamB = fB.team ? `<div style="font-size:12px; color:${fB.teamColor}; margin-bottom:2px; font-weight:bold;">${fB.team}</div>` : '';

    document.getElementById('arena-fighters-info').innerHTML = `
        <div style="text-align:center; flex:1;">
            <div style="font-size:11px; color:#94a3b8;">${fA.title}</div>
            ${teamA}
            <div style="font-size:18px; font-weight:900; color:#e2e8f0;">${fA.name} ${fA.isSponsored ? '<span class="sponsor-badge">SPONSORED</span>' : ''}</div>
            <div style="font-size:12px; color:#fbbf24;">현상금: ${fA.bounty}점</div>
        </div>
        <div style="font-size:24px; font-weight:900; color:#ef4444; padding:0 15px;">VS</div>
        <div style="text-align:center; flex:1;">
            <div style="font-size:11px; color:#94a3b8;">${fB.title}</div>
            ${teamB}
            <div style="font-size:18px; font-weight:900; color:#e2e8f0;">${fB.name} ${fB.isSponsored ? '<span class="sponsor-badge">SPONSORED</span>' : ''}</div>
            <div style="font-size:12px; color:#fbbf24;">현상금: ${fB.bounty}점</div>
        </div>
    `;

    const optsContainer = document.getElementById('arena-bet-options');
    optsContainer.innerHTML = '';
    options.forEach(opt => {
        const btn = document.createElement('div');
        btn.className = 'btn-opt';
        btn.style.cssText = 'display:flex; flex-direction:column; justify-content:center; align-items:center; padding:10px; font-size:13px; gap:4px;';
        btn.innerHTML = `<div>${opt.label}</div><div style="font-size:14px; font-weight:900; color:#fef08a;">@${opt.odds}</div>`;
        btn.onclick = () => {
            document.querySelectorAll('#arena-bet-options .btn-opt').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            arenaSelectedBet = opt;
        };
        optsContainer.appendChild(btn);
    });

    let cheatDiv = document.getElementById('arena-cheat-ui');
    if (typeof inventory !== 'undefined' && inventory['bm_arena_poison'] > 0) {
        if (!cheatDiv) {
            cheatDiv = document.createElement('div');
            cheatDiv.id = 'arena-cheat-ui';
            cheatDiv.style.cssText = "margin-bottom:12px; background:rgba(220,38,38,0.15); border:1px solid #dc2626; border-radius:10px; padding:10px; text-align:left;";
            const startBtn = document.getElementById('arena-start-btn');
            startBtn.parentNode.insertBefore(cheatDiv, startBtn);
        }
        cheatDiv.style.display = 'block';
        cheatDiv.innerHTML = `
            <label style="display:flex; align-items:center; gap:8px; cursor:pointer; color:#fca5a5; font-size:13px; font-weight:bold;">
                <input type="checkbox" id="use-arena-poison" style="width:18px; height:18px; accent-color:#dc2626;">
                반대편 선수에게 맹독 투여 (시작 HP 절반) 잔여: ${inventory['bm_arena_poison']}개
            </label>
        `;
    } else if (cheatDiv) {
        cheatDiv.style.display = 'none';
    }
    
    updateArenaLeaderboard();
}

function placeArenaBet() {
    if (document.getElementById('arena-live-panel').style.display === 'block') return;

    const input = document.getElementById('arena-bet-amount');
    const betAmt = parseInt(input.value) || 0;
    
    if (!arenaSelectedBet) { showAlert("배팅 대상을 선택하세요."); return; }
    if (betAmt < 10000 || gameChips < betAmt) { showAlert("보유 칩이 부족하거나 최소 배팅액(10,000) 미만입니다."); return; }
    
    gameChips -= betAmt;
    updateLedgerDisplays();
    
    if (typeof updateQuestProgress === 'function') updateQuestProgress('arena_bet', 1);
    
    document.getElementById('arena-match-panel').style.display = 'none';
    document.getElementById('arena-live-panel').style.display = 'block';
    
    startArenaMatch(betAmt);
}

function triggerPoliceRaid(betAmt) {
    const logBox = document.getElementById('arena-commentary-log');
    
    if (typeof unlockedItems !== 'undefined' && unlockedItems.includes("auc_018")) {
        logBox.innerHTML += `<div style="color:#a855f7; font-size:14px; font-weight:900; margin-top:10px; text-align:center;">경찰 기습 단속이 있었으나 투명 망토의 힘으로 완벽하게 은폐했습니다!</div>`;
        logBox.scrollTop = logBox.scrollHeight;
        if (typeof showToast === 'function') showToast("단속 무마 성공!", "success");
        setTimeout(() => { resetArenaPanel(); }, 3500);
        return; 
    }

    logBox.innerHTML += `<div style="color:#ef4444; font-size:15px; font-weight:900; margin-top:10px; text-align:center;">🚨 경찰 기습 단속 발생! 경기 무효 처리 및 배팅액 압수!</div>`;
    logBox.scrollTop = logBox.scrollHeight;
    
    if (typeof showToast === 'function') {
        showToast("🚨 불법 투기장 단속 적발!", "fail");
    }
    if (typeof appendLogRecord === 'function') {
        appendLogRecord(`[경찰 단속] 투기장 배팅금 압수`, `-${betAmt.toLocaleString()} 원`, `color:#ef4444;`);
    }
    if (typeof AudioSynth !== 'undefined') AudioSynth.playLose();
    
    if (!gameStats.system) gameStats.system = {};
    gameStats.system.policeFines = (gameStats.system.policeFines || 0) + betAmt;

    setTimeout(() => {
        resetArenaPanel();
    }, 3500);
}

function startArenaMatch(betAmt) {
    const { fA, fB } = currentArenaMatch;
    fA.currentHp = fA.maxHp; fB.currentHp = fB.maxHp;
    
    initCombatStats(fA);
    initCombatStats(fB);

    const poisonCb = document.getElementById('use-arena-poison');
    if (poisonCb && poisonCb.checked && inventory['bm_arena_poison'] > 0) {
        inventory['bm_arena_poison'] -= 1;
        showToast("맹독을 몰래 투여했습니다.", "success");
        if(typeof saveData === 'function') saveData();
        if(typeof renderSmartInventory === 'function') renderSmartInventory();
        
        const betSide = arenaSelectedBet.id.split('_')[0]; 
        if (betSide === 'A') {
            fB.currentHp = Math.floor(fB.maxHp * 0.5);
        } else {
            fA.currentHp = Math.floor(fA.maxHp * 0.5);
        }
        
        const cheatDiv = document.getElementById('arena-cheat-ui');
        if (cheatDiv) cheatDiv.style.display = 'none';
    }

    const logBox = document.getElementById('arena-commentary-log');
    logBox.innerHTML = '';

    // --- ⏳ 남은 턴(시간) 전광판 UI 추가 ---
    let turnDisplay = document.getElementById('arena-turn-display');
    if (!turnDisplay) {
        turnDisplay = document.createElement('div');
        turnDisplay.id = 'arena-turn-display';
        turnDisplay.style.cssText = 'text-align:center; font-size:14px; font-weight:900; color:#fbbf24; margin-bottom:8px; background:rgba(217, 119, 6, 0.15); border:1px solid #d97706; border-radius:8px; padding:6px; box-shadow: inset 0 0 10px rgba(217, 119, 6, 0.1);';
        logBox.parentNode.insertBefore(turnDisplay, logBox);
    }
    turnDisplay.style.display = 'block'; // 경기 시작 시 무조건 표시

    document.getElementById('live-fighter-a-name').innerText = fA.name;
    document.getElementById('live-fighter-b-name').innerText = fB.name;
    updateArenaHpBar();

    let turn = 0;
    const maxTurns = 20; // 20턴 제한
    const policeRaidTurn = Math.random() < 0.05 ? Math.floor(Math.random() * 15) + 3 : -1;
    
    // 첫 턴 표시
    turnDisplay.innerHTML = `⏳ 남은 턴: <span style="color:#f8fafc;">${maxTurns - turn}</span> / ${maxTurns} <span style="font-size:11px; color:#94a3b8;">(턴 종료 시 체력 판정)</span>`;

    arenaLiveInterval = setInterval(() => {
        if (turn === policeRaidTurn) {
            clearInterval(arenaLiveInterval);
            triggerPoliceRaid(betAmt);
            turnDisplay.style.display = 'none'; // 경찰 단속 시 전광판 숨김
            return;
        }

        if (fA.currentHp <= 0 || fB.currentHp <= 0 || turn >= maxTurns) {
            clearInterval(arenaLiveInterval);
            turnDisplay.innerHTML = `🏁 매치 종료! 판정 중...`;
            endArenaMatch(betAmt, turn >= maxTurns);
            
            // 결과 확인 후 패널이 닫힐 때 전광판 숨김
            setTimeout(() => { if (turnDisplay) turnDisplay.style.display = 'none'; }, 3500); 
            return;
        }

        // 실시간 턴 카운트다운 업데이트
        turnDisplay.innerHTML = `⏳ 남은 턴: <span style="color:#f8fafc;">${maxTurns - turn - 1}</span> / ${maxTurns} <span style="font-size:11px; color:#94a3b8;">(턴 종료 시 체력 판정)</span>`;

        processAttack(fA, fB, logBox);
        if (fB.currentHp > 0) setTimeout(() => processAttack(fB, fA, logBox), 500);
        
        turn++;
    }, 1200);
}

function getAttackFlavorText(attackerName, isCrit) {
    const signatures = {
        "카리나": isCrit ? "안면을 짓뭉개는 잔혹한 하이킥! 허공에 피가 흩뿌려집니다!" : "급소를 정확히 노려 파고드는 서늘한 스트레이트!",
        "윈터": isCrit ? "무릎 관절을 역방향으로 박살 내는 치명적인 스나이퍼 킥!" : "거리를 벌리며 눈을 노리는 악랄한 레프트 잽!",
        "닝닝": isCrit ? "안구를 후벼 파고 목젖을 짓누르는 끔찍한 반칙 연타!" : "심판 몰래 허벅지 안쪽을 찍어 누르는 비열한 로우킥!",
        "지젤": isCrit ? "갈비뼈가 산산조각 나는 소리! 무자비한 카운터 어퍼컷!" : "턱을 으스러뜨릴 듯 묵직하게 꽂히는 원투 펀치!",
        "정원이": isCrit ? "광기에 차올라 짐승처럼 살점을 물어뜯을 듯한 아드레날린 난타!!" : "살의를 담아 짐승처럼 휘두르는 맵고 흉폭한 막싸움 펀치!",
        "미나미": isCrit ? "피투성이가 된 채 기괴하게 웃으며 상대의 두개골을 박치기로 함몰시킵니다!" : "뼈를 깎는 고통을 동반하는 무자비한 바디블로우!",
        "제나": isCrit ? "방어를 포기하고 맨주먹으로 얼굴을 피떡으로 만드는 끔찍한 파운딩!" : "살점이 찢어져라 쏟아지는 짐승 같은 소나기 펀치!",
        "리브": isCrit ? "숨통을 단번에 끊어버리는 각도에서 터진 치명적인 카운터!" : "자세를 완벽히 붕괴시키는 정교하고 잔인한 로우킥!",
        "메이": isCrit ? "어둠 속에서 튀어나와 아킬레스건을 끊어버리는 소름 돋는 일격!" : "소리 없이 다가와 명치를 꿰뚫어 버리는 기습 타격!",
        "김채원": isCrit ? "분노에 찬 괴성과 함께 턱을 통째로 날려버리는 플라잉 니킥!!" : "상대를 펜스에 몰아넣고 숨통을 조이는 압도적인 러쉬!",
        "사쿠라": isCrit ? "살이 찢어지고 뼈가 어긋나는 끔찍한 비명! 완벽한 살인 초크입니다!" : "돈줄을 끊어놓겠다는 듯 무자비하게 꽂히는 관절기!",
        "카즈하": isCrit ? "예술적인 궤적으로 날아올라 목뼈를 꺾어버리는 백스핀 블로우!!" : "우아하게 날아와 명치를 꿰뚫는 칼날 같은 앞차기!",
        "이채영": isCrit ? "쓰러진 상대의 얼굴을 자비 없이 짓밟아버립니다! 바닥이 흥건하게 피로 물듭니다!" : "상대의 급소만 집요하게 노려 패는 악질적인 타격!",
        "송하영": isCrit ? "화려한 윈드밀 스텝 후 뒤통수를 그대로 으깨버리는 카포에라 킥!" : "예측 불가능한 리듬으로 시야를 뺏고 꽂아 넣는 기습 엘보우!",
        "박지원": isCrit ? "닿는 순간 장기가 파열될 듯한 끔찍한 파괴력의 메가톤 펀치!" : "막아도 뼈에 금이 가는 압도적인 완력의 스트레이트!",
        "김나경": isCrit ? "해부학적 지식으로 정확히 간장을 파열시키는 소름 끼치는 일격!" : "신경계를 마비시켜 버리는 날카롭고 섬뜩한 타격!"
    };

    const genericCrits = [
        "뼈가 박살 나는 끔찍한 파열음이 투기장을 울립니다!",
        "안면이 완전히 함몰되었습니다! 사방으로 피가 튑니다!",
        "단숨에 숨통을 끊어놓는 잔혹하고 치명적인 일격!",
        "관중들이 광기에 휩싸입니다! 뇌진탕을 일으키는 무자비한 타격!"
    ];

    const genericNormals = [
        "살점이 찢어지는 둔탁한 타격음이 울려 퍼집니다.",
        "피보라를 일으키며 주먹이 묵직하게 꽂혀 들어갑니다.",
        "가드 위로 내리꽂히지만 엄청난 데미지가 뼛속까지 전해집니다.",
        "자비 없는 펀치가 명치에 깊숙이 꽂힙니다."
    ];

    if (Math.random() < 0.4 && signatures[attackerName]) {
        return signatures[attackerName];
    } else {
        if (isCrit) return genericCrits[Math.floor(Math.random() * genericCrits.length)];
        else return genericNormals[Math.floor(Math.random() * genericNormals.length)];
    }
}

function getDodgeFlavorText(defenderName) {
    const dodges = [
        "종이 한 장 차이로 아슬아슬하게 회피합니다!",
        "유연한 허리놀림으로 공격을 부드럽게 흘려보냅니다.",
        "미리 읽었다는 듯이 뒤로 빠지며 스텝을 밟습니다.",
        "가드를 굳건히 올려 타격의 충격을 100% 흡수합니다!",
        "잔상만 남기며 기적적으로 공격을 피합니다!"
    ];
    return dodges[Math.floor(Math.random() * dodges.length)];
}

function processAttack(attacker, defender, logBox) {
    let logWrapper = document.createElement('div');
    // UI 개선: 기본적인 줄 간격과 배경을 줘서 가독성 업그레이드
    logWrapper.style.cssText = "margin-bottom: 6px; padding: 8px; border-radius: 8px; background: rgba(255,255,255,0.03); line-height: 1.5; font-size: 13px; transition: all 0.3s ease;";

    // 1. 상태 이상 확인 (실명)
    if (attacker.c.blinded) {
        attacker.c.blinded = false;
        logWrapper.style.borderLeft = "4px solid #64748b";
        logWrapper.innerHTML += `<div style="color:#94a3b8; font-weight:bold;">👁️ [실명] ${attacker.name}의 시야가 가려져 허공을 가릅니다! (공격 빗나감)</div>`;
        processEndTurnEffects(attacker, logWrapper);
        logBox.appendChild(logWrapper);
        logBox.scrollTop = logBox.scrollHeight;
        updateArenaHpBar();
        return; 
    }

    let isDodge = false;
    let ignoreEvasion = false;
    
    // 공격자 특수 패시브 (회피 무시)
    if (attacker.name === "메이" && Math.random() < 0.3) ignoreEvasion = true;
    if (attacker.name === "김나경") ignoreEvasion = true;

    let evasionRate = Math.min(0.9, defender.evasion + defender.c.evaBonus);
    if (!ignoreEvasion && Math.random() < evasionRate) {
        isDodge = true;
    }

    if (isDodge) {
        // 회피 성공
        logWrapper.style.borderLeft = "4px solid #94a3b8";
        logWrapper.style.background = "rgba(255,255,255,0.05)";
        logWrapper.innerHTML += `<div style="color:#cbd5e1; font-style:italic;">💨 ${defender.name}, ${getDodgeFlavorText(defender.name)}</div>`;

        // 방어자 회피 스킬 연계
        if (defender.name === "이채영") {
            defender.c.nextCritDouble = true;
            logWrapper.innerHTML += `<div style="color:#ec4899; font-weight:900; margin-top:6px; padding:6px; background:rgba(236,72,153,0.15); border-radius:6px;">✨ [사각지대 습격] 이채영이 사각으로 파고듭니다! 다음 공격 치명타 확률 2배!</div>`;
        }
        if (defender.name === "송하영") {
            let heal = Math.floor((defender.maxHp - defender.currentHp) * 0.05);
            defender.currentHp += heal;
            logWrapper.innerHTML += `<div style="color:#10b981; font-weight:900; margin-top:6px; padding:6px; background:rgba(16,185,129,0.15); border-radius:6px;">🎵 [카포에라 리듬] 송하영이 춤을 추며 체력을 회복합니다! (+${heal})</div>`;
        }
        if (defender.name === "박지원") {
            defender.c.dmgStack += 0.2;
            logWrapper.innerHTML += `<div style="color:#f59e0b; font-weight:900; margin-top:6px; padding:6px; background:rgba(245,158,11,0.15); border-radius:6px;">🥊 [뎀프시롤] 박지원의 다음 타격이 20% 강해집니다! (누적 ${Math.floor(defender.c.dmgStack*100)}%)</div>`;
        }
    } else {
        // 적중 (Hit)
        let isCrit = false;
        let critRate = attacker.critRate;
        
        if (attacker.c.nextCritDouble) {
            critRate *= 2;
            attacker.c.nextCritDouble = false;
        }

        if (attacker.name === "윈터" && attacker.c.firstHit) {
            isCrit = true;
            logWrapper.innerHTML += `<div style="color:#60a5fa; font-weight:900; margin-bottom:6px; padding:6px; background:rgba(59,130,246,0.15); border-radius:6px;">🎯 [헤드샷] 윈터의 첫 공격은 무조건 치명타입니다!</div>`;
        } else {
            isCrit = Math.random() < critRate;
        }

        // 제나 패시브 (치명타 무시)
        if (defender.name === "제나" && isCrit) {
            isCrit = false; 
            logWrapper.innerHTML += `<div style="color:#ef4444; font-weight:900; margin-bottom:6px; padding:6px; background:rgba(239,68,68,0.15); border-radius:6px;">🩸 [통각 상실] 제나가 치명타를 웃으며 일반 피해로 받아냅니다!</div>`;
        }

        let dmg = Math.floor(Math.random() * (attacker.atkMax - attacker.atkMin + 1)) + attacker.atkMin;

        // 김채원 버서커 버프
        if (attacker.name === "김채원" && attacker.currentHp <= attacker.maxHp * 0.5) {
            dmg = Math.floor(dmg * 1.5);
            if (!attacker.c.chaewonTriggered) {
                logWrapper.innerHTML += `<div style="color:#ef4444; font-weight:900; margin-bottom:6px; padding:6px; background:rgba(239,68,68,0.15); border-radius:6px;">🔥 [아드레날린 분출] 김채원이 피투성이가 된 채 폭주합니다! (공격력 1.5배)</div>`;
                attacker.c.chaewonTriggered = true;
            }
        }

        dmg = Math.floor(dmg * (1 + attacker.c.dmgStack) * (1 - attacker.c.atkDebuff));

        if (attacker.name === "김나경") {
            dmg = 80; 
            isCrit = false;
            logWrapper.innerHTML += `<div style="color:#a855f7; font-weight:900; margin-bottom:6px; padding:6px; background:rgba(168,85,247,0.15); border-radius:6px;">🔪 [급소 찌르기] 김나경이 방어를 무시하고 급소를 도려냅니다! (고정 80 피해)</div>`;
        } else if (isCrit) {
            dmg = Math.floor(dmg * attacker.critMult);
        }

        if (ignoreEvasion && attacker.name === "메이") {
            logWrapper.innerHTML += `<div style="color:#10b981; font-weight:900; margin-bottom:6px; padding:6px; background:rgba(16,185,129,0.15); border-radius:6px;">👤 [암습] 메이가 사각지대에서 튀어나와 회피를 무시합니다!</div>`;
        }

        defender.currentHp -= dmg;
        if (defender.currentHp < 0) defender.currentHp = 0;

        const attackDesc = getAttackFlavorText(attacker.name, isCrit);
        
        if (isCrit) {
            logWrapper.style.borderLeft = "4px solid #ef4444";
            logWrapper.style.background = "rgba(239,68,68,0.08)";
            logWrapper.innerHTML += `<div style="color:#fca5a5; font-weight:900; font-size:15px; margin-bottom:4px;">💥 CRITICAL! ${attacker.name}!</div><div style="color:#e2e8f0;">${attackDesc} <span style="color:#ef4444; font-weight:bold;">(${defender.name} HP -${dmg})</span></div>`;
        } else {
            logWrapper.style.borderLeft = "4px solid #f59e0b";
            logWrapper.innerHTML += `<div style="color:#e2e8f0; font-weight:bold;">⚔️ ${attacker.name}! ${attackDesc} <span style="color:#fbbf24;">(${defender.name} HP -${dmg})</span></div>`;
        }

        // 타격 성공 후 초기화
        attacker.c.dmgStack = 0;
        attacker.c.firstHit = false;

        // 적중 후 연계 스킬들
        if (attacker.name === "지젤" && isCrit) {
            attacker.c.evaBonus += 0.05;
            logWrapper.innerHTML += `<div style="color:#f472b6; font-weight:900; margin-top:6px; padding:6px; background:rgba(244,114,182,0.15); border-radius:6px;">💃 [피의 왈츠] 지젤의 움직임이 더욱 우아해집니다! (회피율 영구 증가)</div>`;
        }
        if (attacker.name === "닝닝" && Math.random() < 0.15) {
            if (!defender.c.poison) {
                defender.c.poison = true;
                logWrapper.innerHTML += `<div style="color:#10b981; font-weight:900; margin-top:6px; padding:6px; background:rgba(16,185,129,0.15); border-radius:6px;">🐍 [맹독 부여] 닝닝의 맹독이 상대의 혈관을 타고 흐릅니다!</div>`;
            }
        }
        if (attacker.name === "미나미" && Math.random() < 0.15) {
            defender.c.blinded = true;
            logWrapper.innerHTML += `<div style="color:#94a3b8; font-weight:900; margin-top:6px; padding:6px; background:rgba(148,163,184,0.15); border-radius:6px;">👀 [눈 찌르기] 미나미의 치명적인 반칙! 상대의 다음 공격이 빗나갑니다!</div>`;
        }
        if (defender.name === "정원이" && Math.random() < 0.25 && defender.currentHp > 0) {
            let counterDmg = Math.floor(dmg * 0.5);
            attacker.currentHp -= counterDmg;
            logWrapper.innerHTML += `<div style="color:#f59e0b; font-weight:900; margin-top:6px; padding:6px; background:rgba(245,158,11,0.15); border-radius:6px;">💢 [카운터 펀치] 정원이가 맞자마자 즉시 주먹을 꽂아 넣습니다! (반사 피해: ${counterDmg})</div>`;
        }
        if (defender.name === "사쿠라" && Math.random() < 0.20 && defender.currentHp > 0) {
            attacker.c.atkDebuff += 0.10;
            logWrapper.innerHTML += `<div style="color:#a855f7; font-weight:900; margin-top:6px; padding:6px; background:rgba(168,85,247,0.15); border-radius:6px;">🦴 [암바] 사쿠라가 상대의 관절을 꺾어버렸습니다! (공격력 영구 감소)</div>`;
        }
        if (attacker.name === "카리나" && defender.currentHp <= defender.maxHp * 0.20 && defender.currentHp > 0) {
            if (Math.random() < 0.3) {
                defender.currentHp = 0;
                logWrapper.innerHTML += `<div style="color:#ef4444; font-weight:900; font-size:16px; border:2px solid #ef4444; padding:8px; text-align:center; margin-top:8px; background:rgba(239,68,68,0.2); border-radius:8px; box-shadow: 0 0 15px rgba(239,68,68,0.4);">🩸 [단두대 하이킥] 카리나의 발끝이 상대의 경동맥을 끊었습니다! 즉각 K.O!!</div>`;
            }
        }

        // 카즈하 부활
        if (defender.name === "카즈하" && defender.currentHp <= 0 && !defender.c.surviveUsed) {
            defender.currentHp = Math.floor(defender.maxHp * 0.15);
            defender.c.surviveUsed = true;
            logWrapper.innerHTML += `<div style="color:#fcd34d; font-weight:900; font-size:15px; border:2px solid #fcd34d; padding:8px; text-align:center; margin-top:8px; background:rgba(252,211,77,0.2); border-radius:8px; box-shadow: 0 0 15px rgba(252,211,77,0.4);">🦢 [불굴의 백조] 쓰러지던 카즈하가 예술적인 턴으로 살아남으며 체력을 회복합니다!</div>`;
        }
    }

    processEndTurnEffects(attacker, logWrapper);
    
    logBox.appendChild(logWrapper);
    logBox.scrollTop = logBox.scrollHeight;
    updateArenaHpBar();
}

function processEndTurnEffects(attacker, logWrapper) {
    if (attacker.name === "리브") {
        attacker.c.evaBonus += 0.03;
        if (attacker.c.evaBonus > 0.45) attacker.c.evaBonus = 0.45;
    }

    if (attacker.c.poison && attacker.currentHp > 0) {
        let pDmg = Math.floor(attacker.maxHp * 0.05);
        attacker.currentHp -= pDmg;
        logWrapper.innerHTML += `<div style="color:#10b981; font-weight:bold; font-size:12px; margin-top:6px; padding-top:6px; border-top:1px dashed rgba(16,185,129,0.3);">🐍 맹독이 퍼져 ${attacker.name}이(가) 피해를 입습니다. (-${pDmg})</div>`;
        
        if (attacker.currentHp <= 0) {
            attacker.currentHp = 0;
            if (attacker.name === "카즈하" && !attacker.c.surviveUsed) {
                attacker.currentHp = Math.floor(attacker.maxHp * 0.15);
                attacker.c.surviveUsed = true;
                logWrapper.innerHTML += `<div style="color:#fcd34d; font-weight:900; font-size:14px; border:2px solid #fcd34d; padding:6px; text-align:center; margin-top:6px; background:rgba(252,211,77,0.1); border-radius:8px;">🦢 [불굴의 백조] 카즈하가 맹독의 고통을 딛고 다시 일어섭니다!</div>`;
            }
        }
    }
}

function updateArenaHpBar() {
    const setBar = (barId, textId, f) => {
        const pct = Math.max(0, (f.currentHp / f.maxHp) * 100);
        const bar = document.getElementById(barId);
        const textEl = document.getElementById(textId);
        
        bar.style.width = `${pct}%`;
        if (textEl) textEl.innerText = `${Math.floor(f.currentHp)} / ${f.maxHp}`;
        
        if (pct > 50) {
            bar.style.background = 'linear-gradient(90deg, #10b981, #34d399)';
            if (textEl) textEl.style.color = '#4ade80';
        } else if (pct > 20) {
            bar.style.background = 'linear-gradient(90deg, #f59e0b, #fbbf24)';
            if (textEl) textEl.style.color = '#fbbf24';
        } else {
            bar.style.background = 'linear-gradient(90deg, #b91c1c, #ef4444)';
            if (textEl) textEl.style.color = '#ef4444';
        }
    };

    setBar('live-hp-a', 'live-hp-text-a', currentArenaMatch.fA);
    setBar('live-hp-b', 'live-hp-text-b', currentArenaMatch.fB);
}

function endArenaMatch(betAmt, isDecision) {
    const { fA, fB } = currentArenaMatch;
    const logBox = document.getElementById('arena-commentary-log');
    
    let winner = null; let method = '';
    
    if (!isDecision) {
        winner = fA.currentHp > 0 ? fA : fB;
        const loser = fA.currentHp > 0 ? fB : fA;
        method = 'KO';
        logBox.innerHTML += `<div style="color:#fbbf24; font-size:15px; font-weight:900; margin-top:10px;">💀 K.O! ${loser.name}이(가) 쓰러졌습니다! ${winner.name}의 승리!</div>`;
    } else {
        winner = fA.currentHp > fB.currentHp ? fA : fB;
        method = 'DEC';
        logBox.innerHTML += `<div style="color:#fbbf24; font-size:15px; font-weight:900; margin-top:10px;">🔔 판정 결과, HP가 더 많은 ${winner.name}의 승리입니다!</div>`;
    }
    logBox.scrollTop = logBox.scrollHeight;

    let isWin = false;
    const betId = arenaSelectedBet.id; 
    const betSide = betId.split('_')[0]; 
    const betMethod = betId.split('_')[1]; 
    const actualSide = winner.id === fA.id ? 'A' : 'B';
    
    if (betSide === actualSide) {
        if (betMethod === 'WIN') isWin = true; 
        else if (betMethod === 'KO' && method === 'KO') isWin = true;
        else if (betMethod === 'DEC' && method === 'DEC') isWin = true;
    }

    setTimeout(() => {
        const loserId = winner.id === fA.id ? fB.id : fA.id;
        updateFighterStats(winner.id, loserId, method);
        
        // --- 백그라운드 매치 자동 시뮬레이션 ---
        currentArenaMatches.forEach(match => {
            if (match.id !== currentArenaMatch.id) { 
                const scoreA = match.fA.maxHp * ((match.fA.atkMin + match.fA.atkMax) / 2);
                const scoreB = match.fB.maxHp * ((match.fB.atkMin + match.fB.atkMax) / 2);
                const probA = scoreA / (scoreA + scoreB);
                const simWinner = Math.random() < probA ? match.fA : match.fB;
                const simLoser = simWinner.id === match.fA.id ? match.fB : match.fA;
                const simMethod = Math.random() < 0.4 ? 'KO' : 'DEC';
                
                updateFighterStats(simWinner.id, simLoser.id, simMethod); 
            }
        });
        // ------------------------------------

        gameStats.arena = gameStats.arena || { plays: 0, wins: 0, profit: 0, loss: 0 };
        gameStats.arena.plays++;
        gameStats.totalGames++;

        if (isWin) {
            let payout = Math.floor(betAmt * arenaSelectedBet.odds);
            const profitBonus = typeof applyProfitBonus === 'function' ? applyProfitBonus(payout, 'arena') : 0;
            const finalPayout = payout + profitBonus;
            const netProfit = finalPayout - betAmt;

            gameChips += finalPayout;
            if (typeof addExp === 'function') addExp(50); 
            showToast(`🎉 적중! +${finalPayout.toLocaleString()} 칩 획득!`);
            
            if (typeof appendLogRecord === 'function') {
                appendLogRecord(`[투기장] ${winner.name} 승 적중`, `+${netProfit.toLocaleString()} 원`, `color:#10b981; font-weight:bold;`);
            }
            if(typeof AudioSynth !== 'undefined') AudioSynth.playWin();

            if (finalPayout > (gameStats.arena.maxSingleWin || 0)) gameStats.arena.maxSingleWin = finalPayout;

            gameStats.arena.wins++;
            gameStats.arena.profit += netProfit;
            gameStats.totalProfit += netProfit;
        } else {
            showToast(`📉 낙첨... 배팅금을 잃었습니다.`, "fail");
            if (typeof appendLogRecord === 'function') {
                appendLogRecord(`[투기장] 배팅 실패`, `-${betAmt.toLocaleString()} 원`, `color:#ef4444;`);
            }
            if(typeof AudioSynth !== 'undefined') AudioSynth.playLose();

            if (betAmt > (gameStats.arena.maxSingleLoss || 0)) gameStats.arena.maxSingleLoss = betAmt;

            gameStats.arena.loss += betAmt;
            gameStats.totalLoss += betAmt;
        }

        updateLedgerDisplays();
        saveData();
        resetArenaPanel();
    }, 2000);
}

function updateFighterStats(winnerId, loserId, method) {
    const winner = ARENA_FIGHTERS.find(f => f.id === winnerId);
    const loser = ARENA_FIGHTERS.find(f => f.id === loserId);
    let isGraduatedThisTurn = false;

    const pointChange = method === 'KO' ? 150 : 75;

    if (winner) {
        winner.matches = (winner.matches || 0) + 1;
        winner.wins = (winner.wins || 0) + 1;
        if (method === 'KO') winner.koWins = (winner.koWins || 0) + 1;
        else winner.decWins = (winner.decWins || 0) + 1;

        winner.streak = winner.streak > 0 ? winner.streak + 1 : 1;
        winner.bounty += pointChange;

        if (winner.bounty > (winner.maxBounty || winner.bounty)) {
            winner.maxBounty = winner.bounty;
        }
    }

    if (loser) {
        loser.matches = (loser.matches || 0) + 1;
        loser.losses = (loser.losses || 0) + 1;
        loser.streak = loser.streak < 0 ? loser.streak - 1 : -1;
        loser.bounty -= pointChange;
    }

    if (activeSponsor.fighterId) {
        const sortedForRank = [...ARENA_FIGHTERS].sort((a, b) => b.bounty - a.bounty);
        const sponsorRank = sortedForRank.findIndex(f => f.id === activeSponsor.fighterId) + 1;

        if (sponsorRank >= 1 && sponsorRank <= 3) {
            const f = ARENA_FIGHTERS.find(f => f.id === activeSponsor.fighterId);
            const jackpot = activeSponsor.amount * 30;

            f.vipCount = (f.vipCount || 0) + 1;

            setTimeout(() => {
                gameChips += jackpot;
                showToast(`축하합니다! 스폰서한 [${f.name}] 파이터가 Top 3에 진입했습니다! (+${jackpot.toLocaleString()} 칩)`, "success");
                if (typeof appendLogRecord === 'function') {
                    appendLogRecord(`[스폰서 성공] ${f.name} (Top 3)`, `+${jackpot.toLocaleString()} 칩`, `color:#fbbf24; font-weight:bold;`);
                }
                if(typeof AudioSynth !== 'undefined') AudioSynth.playWin();
                updateLedgerDisplays();
                if(typeof saveData === 'function') saveData();
            }, 1500);

            restoreOriginalStats(f);
            activeSponsor = { fighterId: null, amount: 0 };
        }
    }

    let removedFighters = [];
    ARENA_FIGHTERS = ARENA_FIGHTERS.filter(f => {
        if (f.bounty >= 2000) {
            showToast(`안내: ${f.name} 파이터가 현상금 2000을 달성하여 명예의 전당으로 은퇴합니다!`, "success");
            if (typeof appendLogRecord === 'function') {
                appendLogRecord(`[명예의 전당] ${f.name} 은퇴`, `축하합니다`, `color:#fbbf24;`);
            }

            if (!GRADUATED_FIGHTERS.includes(f.name)) GRADUATED_FIGHTERS.push(f.name);
            removedFighters.push(f);
            if (f.id === winnerId) isGraduatedThisTurn = true;

            if (activeSponsor.fighterId === f.id) {
                activeSponsor = { fighterId: null, amount: 0 };
            }
            return false;
        }
        if (f.bounty <= 0) {
            showToast(`안내: ${f.name} 파이터가 현상금을 모두 잃고 실종되었습니다...`, "fail");
            if (typeof appendLogRecord === 'function') {
                appendLogRecord(`[실종] ${f.name} 퇴출`, `행방불명`, `color:#ef4444;`);
            }

            if (f.id === loserId && winner) {
                winner.killCount = (winner.killCount || 0) + 1;
            }
            if (!MISSING_FIGHTERS.includes(f.name)) MISSING_FIGHTERS.push(f.name);
            removedFighters.push(f);

            if (activeSponsor.fighterId === f.id) {
                showToast(`스폰서하던 [${f.name}] 파이터가 실종되어 계약이 종료되었습니다.`, "fail");
                activeSponsor = { fighterId: null, amount: 0 };
            }
            return false;
        }
        return true;
    });

    removedFighters.forEach(f => {
        f.bounty = 1000;
        f.streak = 0;
        restoreOriginalStats(f);
        f.currentHp = f.maxHp;
        STANDBY_FIGHTERS.push(f);
    });

    removedFighters.forEach(() => {
        if (STANDBY_FIGHTERS.length > 0) {
            const randomIndex = Math.floor(Math.random() * STANDBY_FIGHTERS.length);
            let newFighter = STANDBY_FIGHTERS.splice(randomIndex, 1)[0];

            ARENA_FIGHTERS.push(newFighter);
            showToast(`안내: 새로운 도전자 [${newFighter.name}] 합류!`, "success");
        }
    });

    updateArenaLeaderboard();
    return isGraduatedThisTurn;
}

function sponsorFighter(fighterId) {
    if (activeSponsor.fighterId) {
        showAlert("이미 스폰 중인 선수가 있습니다.\n오직 한 명의 파이터에게만 투자할 수 있습니다."); return;
    }
    
    const fighter = ARENA_FIGHTERS.find(f => f.id === fighterId);
    if (!fighter) return;

    if (typeof showAmountInputModal === 'function') {
        showAmountInputModal({
            title: `💎 [${fighter.name}] VVIP 스폰서 투자`,
            subtitle: "투자 즉시 HP와 치명타 확률이 대폭 상승합니다!<br>이 선수가 Top 3에 진입하면 배팅액의 <b>30배</b> 잭팟!",
            confirmText: "스폰하기",
            confirmColor: "#059669",
            minAmount: 100000, 
            callback: (amount) => {
                if (activeSponsor.fighterId) {
                    showAlert("⚠️ 이미 다른 스폰 계약이 체결되어 있습니다."); return; 
                }
                if (gameChips < amount) { showAlert("💎 보유 칩이 부족합니다!"); return; }
                
                gameChips -= amount;
                updateLedgerDisplays();
                
                fighter.isSponsored = true;
                fighter.maxHp = Math.floor(fighter.maxHp * 1.2); 
                fighter.currentHp = fighter.maxHp;
                fighter.critRate = Math.min(0.9, fighter.critRate + 0.15); 
                
                activeSponsor = { fighterId: fighter.id, amount: amount };

                if (typeof currentArenaMatches !== 'undefined') {
                    currentArenaMatches.forEach(match => {
                        if (match.fA.id === fighter.id) {
                            match.fA.isSponsored = true;
                            match.fA.maxHp = fighter.maxHp;
                            match.fA.currentHp = fighter.currentHp;
                            match.fA.critRate = fighter.critRate;
                        }
                        if (match.fB.id === fighter.id) {
                            match.fB.isSponsored = true;
                            match.fB.maxHp = fighter.maxHp;
                            match.fB.currentHp = fighter.currentHp;
                            match.fB.critRate = fighter.critRate;
                        }
                    });
                }
                
                if (typeof currentArenaMatch !== 'undefined' && currentArenaMatch) {
                    if (currentArenaMatch.fA.id === fighter.id) {
                        currentArenaMatch.fA.isSponsored = true;
                        currentArenaMatch.fA.maxHp = fighter.maxHp;
                        currentArenaMatch.fA.currentHp = fighter.currentHp;
                        currentArenaMatch.fA.critRate = fighter.critRate;
                    }
                    if (currentArenaMatch.fB.id === fighter.id) {
                        currentArenaMatch.fB.isSponsored = true;
                        currentArenaMatch.fB.maxHp = fighter.maxHp;
                        currentArenaMatch.fB.currentHp = fighter.currentHp;
                        currentArenaMatch.fB.critRate = fighter.critRate;
                    }
                    renderArenaMatch(); 
                } else {
                    renderArenaMatchList(); 
                }
                
                showToast(`💸 [${fighter.name}] 선수에게 ${amount.toLocaleString()} 칩 스폰 완료! 능력치가 상승했습니다!`, "success");
                if (typeof appendLogRecord === 'function') {
                    appendLogRecord(`[자본치료] ${fighter.name} 스폰`, `-${amount.toLocaleString()} 원`, `color:#10b981;`);
                }
                
                if (typeof AudioSynth !== 'undefined') AudioSynth.playWin();
                saveData();
                updateArenaLeaderboard();
            }
        });
    }
}

function updateArenaLeaderboard() {
    const container = document.getElementById('arena-leaderboard-content');
    const sponsorPanel = document.getElementById('arena-sponsor-panel');
    const sponsorInfo = document.getElementById('arena-sponsor-info');
    
    if (!container) return;
    container.innerHTML = '';
    
    if (sponsorPanel && sponsorInfo) {
        if (activeSponsor.fighterId) {
            const f = ARENA_FIGHTERS.find(f => f.id === activeSponsor.fighterId);
            if (f) {
                sponsorPanel.style.display = 'block';
                sponsorInfo.innerHTML = `[${f.name}] 선수 지원 중 <span style="color:#64748b;">|</span> 투자금: ${activeSponsor.amount.toLocaleString()} 칩`;
            }
        } else {
            sponsorPanel.style.display = 'none';
        }
    }
    
    const sorted = [...ARENA_FIGHTERS].sort((a, b) => b.bounty - a.bounty);
    
    sorted.forEach((f, idx) => {
        const rank = idx + 1;
        let streakHtml = '';
        if (f.streak >= 2) streakHtml = `<span style="color:#ef4444; font-size:11px;">${f.streak}연승🔥</span>`;
        else if (f.streak <= -2) streakHtml = `<span style="color:#3b82f6; font-size:11px;">${Math.abs(f.streak)}연패❄️</span>`;
        
        const rankColor = rank <= 3 ? '#fbbf24' : '#94a3b8';
        const sponsorBadge = f.isSponsored ? `<span class="sponsor-badge">SPONSORED</span>` : '';
        
        let sponsorBtnHtml = '';
        if (f.bounty <= 800 && !f.isSponsored && !activeSponsor.fighterId) {
            // ✨ [수정된 부분] 투기장 스폰서 버튼을 럭셔리 네온 스타일로 변경
            sponsorBtnHtml = `<button onclick="sponsorFighter('${f.id}')" style="background:linear-gradient(135deg, #7f1d1d, #450a0a); color:#fbbf24; border:1px solid #b45309; border-radius:8px; padding:6px 12px; font-size:11.5px; font-weight:900; cursor:pointer; box-shadow:0 0 10px rgba(251,191,36,0.3); transition:all 0.2s;" onmouseover="this.style.transform='scale(1.05)'; this.style.boxShadow='0 0 15px rgba(251,191,36,0.6)';" onmouseout="this.style.transform='scale(1)'; this.style.boxShadow='0 0 10px rgba(251,191,36,0.3)';">🩸 VVIP 스폰</button>`;
        }
        
        container.innerHTML += `
            <div style="display:flex; justify-content:space-between; align-items:center; padding:8px 6px; border-bottom:1px solid #1e293b;">
                <div style="flex:1;">
                    <span style="color:${rankColor}; font-weight:bold; width:20px; display:inline-block;">${rank}</span> 
                    <span style="color:#e2e8f0; font-weight:bold; cursor:pointer;" onclick="showFighterProfile('${f.id}')" title="프로필 보기">
                        ${f.team ? `<span style="font-size:10px; color:${f.teamColor}; margin-right:4px;">[${f.team}]</span>` : ''} ${f.name}
                    </span> 
                    ${sponsorBadge}
                    <div style="color:#64748b; font-size:11px; margin-top:2px; margin-left:24px;">${f.title}</div>
                </div>
                <div style="text-align:right;">
                    ${sponsorBtnHtml}
                    <div style="color:#fbbf24; font-weight:bold; font-size:13px; margin-top:2px;">${f.bounty} 점</div>
                    ${streakHtml}
                </div>
            </div>
        `;
    });

    let footerHtml = `<div style="margin-top:12px; padding-top:12px; border-top:1px dashed #334155; font-size:11px; line-height:1.6;">`;
    if (GRADUATED_FIGHTERS.length > 0) {
        footerHtml += `<div style="color:#fbbf24;">🏆 명예의 전당 (졸업생): ${GRADUATED_FIGHTERS.join(', ')}</div>`;
    }
    if (MISSING_FIGHTERS.length > 0) {
        footerHtml += `<div style="color:#ef4444;">💀 실종자 명단 (사망): ${MISSING_FIGHTERS.join(', ')}</div>`;
    }
    footerHtml += `</div>`;
    
    if (GRADUATED_FIGHTERS.length > 0 || MISSING_FIGHTERS.length > 0) {
        container.innerHTML += footerHtml;
    }
}

function resetArenaPanel() {
    setTimeout(() => {
        document.getElementById('arena-live-panel').style.display = 'none';
        document.getElementById('arena-match-panel').style.display = 'none'; 
        currentArenaMatch = null;
        arenaSelectedBet = null;
        generateArenaMatches(); 
    }, 3500);
}

function initArena() {
    let allFighters = [...ARENA_FIGHTERS, ...(typeof STANDBY_FIGHTERS !== 'undefined' ? STANDBY_FIGHTERS : [])];
    allFighters.forEach(f => {
        if (!activeSponsor || activeSponsor.fighterId !== f.id) {
            restoreOriginalStats(f);
        }
    });

    if (!currentArenaMatches || currentArenaMatches.length === 0) {
        generateArenaMatches();
    } else {
        renderArenaMatchList();
    }
    updateArenaLeaderboard();
}

function showFighterProfile(fighterId) {
    const fighter = ARENA_FIGHTERS.find(f => f.id === fighterId) || STANDBY_FIGHTERS.find(f => f.id === fighterId);
    if (!fighter) return;
    
    const modal = document.getElementById('fighter-profile-modal');
    if (!modal) return;

    const themeColor = '#ef4444'; // Red 테마

    const titleHtml = fighter.team ? `<span style="color:${fighter.teamColor}; margin-right:4px;">[${fighter.team}]</span> ${fighter.title}` : fighter.title;
    const catchphraseHtml = fighter.catchphrase ? `<div style="font-size: 14px; font-weight: 900; color: #fbbf24; font-style: italic; margin-bottom: 12px; border-left: 3px solid #fbbf24; padding-left: 8px;">"${fighter.catchphrase}"</div>` : '';
    
    const summaryHtml = `
        <div style="display:grid; grid-template-columns: 1fr 1fr; gap:8px; font-size:11.5px; color:#cbd5e1;">
            <div>총 전적: <span style="color:#f8fafc; font-weight:bold;">${fighter.matches || 0}전 ${fighter.wins || 0}승 ${fighter.losses || 0}패</span></div>
            <div>승리 방식: <span style="color:#f8fafc; font-weight:bold;">KO ${fighter.koWins || 0} / 판정 ${fighter.decWins || 0}</span></div>
            <div>최고 현상금: <span style="color:#fbbf24; font-weight:bold;">${fighter.maxBounty || fighter.bounty} 점</span></div>
            <div>킬 카운트: <span style="color:#ef4444; font-weight:bold;">${fighter.killCount || 0}명 실종</span></div>
            <div style="grid-column: span 2; padding-top:4px; border-top:1px dashed #334155;">스폰서 잭팟 달성 횟수: <span style="color:#fbbf24; font-weight:bold;">${fighter.vipCount || 0}회</span></div>
        </div>
    `;

    const hpPct = Math.min(100, (fighter.maxHp / 2000) * 100);
    const atkPct = Math.min(100, (fighter.atkMax / 130) * 100);
    const evaPct = fighter.evasion * 100;
    const critPct = fighter.critRate * 100;

    const statsHtml = `
        <div style="margin-bottom:8px;">
            <div style="display:flex; justify-content:space-between; font-size:11px; color:#cbd5e1; margin-bottom:4px;"><span>❤️ 기초 체력 (HP)</span><span style="font-weight:bold; color:#10b981;">${fighter.maxHp}</span></div>
            <div style="height:6px; background:#1e293b; border-radius:3px; overflow:hidden;"><div style="height:100%; background:#10b981; width:${hpPct}%;"></div></div>
        </div>
        <div style="margin-bottom:8px;">
            <div style="display:flex; justify-content:space-between; font-size:11px; color:#cbd5e1; margin-bottom:4px;"><span>⚔️ 공격력 (최대)</span><span style="font-weight:bold; color:#ef4444;">${fighter.atkMax}</span></div>
            <div style="height:6px; background:#1e293b; border-radius:3px; overflow:hidden;"><div style="height:100%; background:#ef4444; width:${atkPct}%;"></div></div>
        </div>
        <div style="margin-bottom:8px;">
            <div style="display:flex; justify-content:space-between; font-size:11px; color:#cbd5e1; margin-bottom:4px;"><span>💨 회피율</span><span style="font-weight:bold; color:#3b82f6;">${evaPct.toFixed(0)}%</span></div>
            <div style="height:6px; background:#1e293b; border-radius:3px; overflow:hidden;"><div style="height:100%; background:#3b82f6; width:${evaPct}%;"></div></div>
        </div>
        <div>
            <div style="display:flex; justify-content:space-between; font-size:11px; color:#cbd5e1; margin-bottom:4px;"><span>💥 치명타 확률</span><span style="font-weight:bold; color:#fbbf24;">${critPct.toFixed(0)}%</span></div>
            <div style="height:6px; background:#1e293b; border-radius:3px; overflow:hidden;"><div style="height:100%; background:#fbbf24; width:${critPct}%;"></div></div>
        </div>
    `;

    modal.innerHTML = `
        <div style="background: linear-gradient(145deg, #0f172a, #020617); border: 2px solid ${themeColor}; border-radius: 20px; padding: 24px; width: 90%; max-width: 360px; text-align: left; box-shadow: 0 20px 60px rgba(0,0,0,0.9), inset 0 0 20px ${themeColor}25; position:relative;">
            <div onclick="closeFighterProfile()" style="position:absolute; top:12px; right:16px; font-size:28px; color:#94a3b8; cursor:pointer; font-weight:bold; line-height:1;">&times;</div>
            
            <div style="border-bottom: 1px solid #334155; padding-bottom: 14px; margin-bottom: 16px; text-align: center;">
                <div style="font-size: 13px; color: ${themeColor}; font-weight: bold; margin-bottom: 4px;">${titleHtml}</div>
                <div style="font-size: 26px; font-weight: 900; color: #f8fafc; letter-spacing: 1px; text-shadow: 0 0 15px ${themeColor}66;">${fighter.name}</div>
            </div>

            <div style="background: #020617; border-radius: 12px; padding: 14px; margin-bottom: 16px; border: 1px solid #1e293b;">
                <div style="font-size: 12px; color: #fbbf24; font-weight: 900; margin-bottom: 10px;">🏆 통산 전적 및 기록</div>
                ${summaryHtml}
            </div>

            <div style="background: #020617; border-radius: 12px; padding: 14px; margin-bottom: 16px; border: 1px solid #1e293b;">
                <div style="font-size: 12px; color: ${themeColor}; font-weight: 900; margin-bottom: 12px;">📊 숨겨진 능력치</div>
                ${statsHtml}
            </div>

            <div style="background: rgba(239,68,68,0.05); border-left: 4px solid ${themeColor}; padding: 14px; border-radius: 0 8px 8px 0; font-size: 12.5px; color: #cbd5e1; line-height: 1.6; max-height: 140px; overflow-y: auto;">
                ${catchphraseHtml}
                ${fighter.lore || "데이터가 존재하지 않습니다."}
            </div>
        </div>
    `;
    modal.style.display = 'flex';
}

function closeFighterProfile() {
    document.getElementById('fighter-profile-modal').style.display = 'none';
}

function resetArena() {
    if (!confirm("투기장 시즌을 초기화하시겠습니까?\n\n모든 선수의 전적과 현상금이 초기화되며, 실종자와 명예의 전당 인원도 전부 링으로 복귀합니다.")) {
        return;
    }

    let allFighters = [...ARENA_FIGHTERS, ...STANDBY_FIGHTERS];

    allFighters.forEach(f => {
        f.bounty = 1000;
        f.maxBounty = 1000;
        f.matches = 0;
        f.wins = 0;
        f.losses = 0;
        f.koWins = 0;
        f.decWins = 0;
        f.killCount = 0;
        f.vipCount = 0;
        f.streak = 0;
        
        restoreOriginalStats(f);
        f.currentHp = f.maxHp;
    });

    ARENA_FIGHTERS = allFighters.slice(0, 12);
    STANDBY_FIGHTERS = allFighters.slice(12);

    GRADUATED_FIGHTERS = [];
    MISSING_FIGHTERS = [];
    activeSponsor = { fighterId: null, amount: 0 };

    if (typeof saveData === 'function') saveData();

    if (typeof appendLogRecord === 'function') {
        appendLogRecord("[시스템]", "투기장 시즌 초기화 (현상금 1000점 리셋)", "color:#ef4444;");
    }

    alert("투기장 선수 라인업이 기본 현상금 1000점으로 재설정되었습니다.");
    location.reload(); 
}