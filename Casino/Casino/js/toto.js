// ============================================================
// js/toto.js
// EPL 토토 시스템, 리그 시뮬레이션, 라이브 스코어 로직
// ============================================================

let currentSeason = 1;
let currentRoundMatches = [];
let roundTimeLeft = 600;
let roundPhase = 'betting'; 
let matchTimeLeft = 0;
let liveUpdateInterval = null;
let roundBets = []; 
let lastRoundBets = []; 
let lastRoundMatches = []; 
let isLiveMode = false; 
let showingFinalResults = false; 

let previousSeasonNumber = 0;
let previousSeasonStandings = null;

let eplMatches = [];
let currentTotoMatch = null;
let selectedTotoBetType = "";
let selectedTotoOdds = 0;
let totoActiveBet = 0;
let leagueStandings = {};

function resetTotoToSeason1() {
    if (!confirm("정말 토토를 시즌 1 리그 1 상태로 완전 초기화하시겠습니까?\n\n• 현재 시즌/라운드 초기화\n• 모든 리그 순위 초기화\n• 진행 중인 매치/배팅 내역 초기화\n• 이 작업은 되돌릴 수 없습니다.")) return;

    currentSeason = 1;
    currentRound = 1;
    roundTimeLeft = 600;
    roundPhase = 'betting';

    initLeagueStandings();
    previousSeasonNumber = 0;
    previousSeasonStandings = null;

    currentRoundMatches = generateRoundMatches(currentRound);
    currentTotoMatch = null;
    selectedTotoBetType = "";
    selectedTotoOdds = 0;
    totoActiveBet = 0;

    lastRoundBets = [];
    lastRoundMatches = [];
    roundBets = [];

    renderTotoMatches();
    const livePanel = document.getElementById('toto-live-panel');
    if (livePanel) livePanel.style.display = 'none';

    setTimeout(() => {
        if (typeof renderLeagueStandingsInInfoTab === 'function') renderLeagueStandingsInInfoTab();
        if (typeof renderPreviousSeasonHighlight === 'function') renderPreviousSeasonHighlight();
    }, 150);

    if (typeof saveData === 'function') saveData();
    showToast("토토가 시즌 1 리그 1 상태로 완전히 초기화되었습니다.", 'success');
    appendLogRecord("[시스템]", "토토 시즌1 리그1 초기화 (리그 순위 포함)", "color:#a855f7;");
}

const TEAM_BADGES = {
    "MCI": { color: "#6CABDD", short: "MCI" },
    "ARS": { color: "#EF0107", short: "ARS" },
    "LIV": { color: "#C8102E", short: "LIV" },
    "CHE": { color: "#034694", short: "CHE" },
    "TOT": { color: "#132257", short: "TOT" },
    "MUN": { color: "#DA291C", short: "MUN" },
    "NEW": { color: "#241F20", short: "NEW" },
    "BHA": { color: "#0057B8", short: "BHA" },
    "AVL": { color: "#670E36", short: "AVL" },
    "WHU": { color: "#7A263A", short: "WHU" },
    "CRY": { color: "#1B458F", short: "CRY" },
    "FUL": { color: "#FFFFFF", short: "FUL", textColor: "#000000" },
    "BRE": { color: "#E30613", short: "BRE" },
    "WOL": { color: "#FDB913", short: "WOL", textColor: "#000000" },
    "EVE": { color: "#003399", short: "EVE" },
    "BOU": { color: "#DA291C", short: "BOU" }
};

function getTeamBadge(teamId) {
    if (!teamId) return `<div style="width:38px; height:38px;"></div>`; 
    const badge = TEAM_BADGES[teamId] || { color: "#64748b", short: "UNK" };
    const textColor = badge.textColor || "#ffffff";
    return `
        <svg width="38" height="38" viewBox="0 0 38 38" style="display:inline-block; vertical-align:middle; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.5));">
            <defs>
                <linearGradient id="badgeGrad-${teamId}" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stop-color="${badge.color}"/>
                    <stop offset="100%" stop-color="${badge.color}dd"/>
                </linearGradient>
                <filter id="glow-${teamId}" x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur in="SourceGraphic" stdDeviation="1.5" result="coloredBlur"/>
                    <feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge>
                </filter>
            </defs>
            <circle cx="19" cy="19" r="17" fill="url(#badgeGrad-${teamId})" stroke="#ffffff" stroke-width="2.5" stroke-opacity="0.3"/>
            <circle cx="19" cy="19" r="14" fill="none" stroke="#ffffff" stroke-width="1" stroke-opacity="0.15"/>
            <text x="19" y="23.5" text-anchor="middle" fill="${textColor}" font-size="11" font-weight="900" letter-spacing="0.5" filter="url(#glow-${teamId})">${badge.short}</text>
        </svg>
    `;
}

// ✨ 신규 스탯 추가: atk(공격 가중치), def(수비 가중치), upset(이변/기복 확률 - 높을수록 역배 잘터짐)
const TOTO_TEAMS = [
    { id: "MCI", name: "맨체스터 시티", power: 92, homeAdv: 1.15, atk: 1.30, def: 1.30, upset: 0.8, tactics: "압도적인 점유율과 닥공", keyPlayer: "엘링 홀란드", stadium: "에티하드 스타디움", owner: "만수르", lore: "공수 밸런스가 완벽해 무승부나 패배(이변) 확률이 가장 적습니다. 확실한 정배당 팀." },
    { id: "ARS", name: "아스날", power: 88, homeAdv: 1.12, atk: 1.15, def: 1.20, upset: 0.9, tactics: "유기적인 패스 워크", keyPlayer: "부카요 사카", stadium: "에미레이츠 스타디움", owner: "스탠 크론엔키", lore: "빠르고 안정적이지만 득점력이 폭발적이지는 않아 점수차가 크게 벌어지진 않습니다." },
    { id: "LIV", name: "리버풀", power: 87, homeAdv: 1.13, atk: 1.25, def: 1.05, upset: 1.0, tactics: "게겐프레싱 (미친 압박)", keyPlayer: "모하메드 살라", stadium: "안필드", owner: "존 헨리", lore: "홈 구장(안필드)에서의 파괴력이 엄청납니다. 실점도 종종 하지만 더 많이 넣어서 이깁니다." },
    { id: "CHE", name: "첼시", power: 84, homeAdv: 1.10, atk: 1.10, def: 1.00, upset: 1.5, tactics: "변칙적인 측면 공격", keyPlayer: "콜 팔머", stadium: "스탬포드 브릿지", owner: "토드 보엘리", lore: "최고의 도깨비팀(upset 1.5). 강팀을 잡고 약팀에게 박살 나는 기복 때문에 역배당을 노리기 가장 좋습니다." },
    { id: "TOT", name: "토트넘", power: 82, homeAdv: 1.11, atk: 1.35, def: 0.80, upset: 1.2, tactics: "라인 올리고 무한 닥공", keyPlayer: "손흥민", stadium: "토트넘 홋스퍼 스타디움", owner: "다니엘 레비", lore: "극단적인 닥공 전술. 무조건 골을 넣지만 무조건 실점도 합니다. 난타전 특화 팀." },
    { id: "MUN", name: "맨유", power: 81, homeAdv: 1.12, atk: 1.00, def: 1.05, upset: 1.2, tactics: "선 수비 후 역습", keyPlayer: "브루노 페르난데스", stadium: "올드 트래포드", owner: "짐 랫클리프", lore: "이름값에 비해 득점력이 빈약하며 언제 미끄러질지 모르는 시한폭탄 같은 폼을 가졌습니다." },
    { id: "NEW", name: "뉴캐슬", power: 79, homeAdv: 1.14, atk: 1.10, def: 1.05, upset: 1.1, tactics: "거칠고 빠른 피지컬 축구", keyPlayer: "알렉산더 이사크", stadium: "세인트 제임스 파크", owner: "사우디 국부 펀드", lore: "홈 이점이 강하며 강팀 상대로도 물러서지 않고 거칠게 싸워 무승부를 자주 만들어냅니다." },
    { id: "BHA", name: "브라이튼", power: 76, homeAdv: 1.08, atk: 1.05, def: 0.95, upset: 1.0, tactics: "치밀한 후방 빌드업", keyPlayer: "미토마 카오루", stadium: "아멕스 스타디움", owner: "토니 블룸", lore: "전력은 중위권이지만 빌드업 축구로 상대를 괴롭힙니다." },
    { id: "AVL", name: "애스턴 빌라", power: 78, homeAdv: 1.09, atk: 1.10, def: 1.00, upset: 1.2, tactics: "오프사이드 트랩과 날카로운 역습", keyPlayer: "올리 왓킨스", stadium: "빌라 파크", owner: "나세프 사위리스", lore: "전술적으로 뛰어나 강팀의 발목을 자주 잡는 고춧가루 부대입니다." },
    { id: "WHU", name: "웨스트햄", power: 74, homeAdv: 1.10, atk: 0.80, def: 1.25, upset: 1.0, tactics: "텐백 수비 후 철퇴 한방", keyPlayer: "제러드 보웬", stadium: "런던 스타디움", owner: "데이비드 설리반", lore: "전형적인 늪축구. 극단적 수비(방어력 1.25)로 인해 0:0, 1:1 무승부 빈도가 매우 높습니다." },
    { id: "CRY", name: "크리스탈 팰리스", power: 73, homeAdv: 1.07, atk: 0.95, def: 1.00, upset: 1.1, tactics: "선수비 후 측면 파괴", keyPlayer: "에베레치 에제", stadium: "셀허스트 파크", owner: "스티브 패리시", lore: "끈적한 경기력으로 중하위권을 지키는 도깨비 팀입니다." },
    { id: "FUL", name: "풀럼", power: 72, homeAdv: 1.08, atk: 0.95, def: 0.95, upset: 1.0, tactics: "실용적인 밸런스 축구", keyPlayer: "안토니 로빈슨", stadium: "크레이븐 코티지", owner: "샤히드 칸", lore: "공수 밸런스가 평범하며 약팀 상대로 착실히 승점을 쌓습니다." },
    { id: "BRE", name: "브렌트포드", power: 71, homeAdv: 1.09, atk: 1.00, def: 0.90, upset: 1.1, tactics: "롱볼 뚝배기와 세트피스 올인", keyPlayer: "브라이언 음뵈모", stadium: "지테크 커뮤니티 스타디움", owner: "매튜 베넘", lore: "세트피스 한방이 무서워 예상치 못한 득점을 종종 터뜨립니다." },
    { id: "WOL", name: "울버햄튼", power: 70, homeAdv: 1.06, atk: 0.85, def: 1.05, upset: 0.9, tactics: "수비 집중 후 황희찬 런", keyPlayer: "황희찬", stadium: "몰리뉴 스타디움", owner: "푸싱 그룹", lore: "공격력이 매우 약하지만 수비는 준수해 실점이 적습니다." },
    { id: "EVE", name: "에버턴", power: 69, homeAdv: 1.05, atk: 0.80, def: 1.15, upset: 1.1, tactics: "거친 태클과 생존 늪축구", keyPlayer: "조던 픽포드", stadium: "구디슨 파크", owner: "파하드 모시리", lore: "끈질긴 생존 본능의 늪축구 팀. 승리를 하긴 어렵지만 지독하게 무승부를 캐냅니다." },
    { id: "BOU", name: "본머스", power: 68, homeAdv: 1.07, atk: 1.15, def: 0.70, upset: 1.3, tactics: "전방 압박과 무지성 공격", keyPlayer: "도미닉 솔랑케", stadium: "바이탈리티 스타디움", owner: "빌 폴리", lore: "수비를 버리고 공격에 올인(유리대포). 실점을 밥 먹듯이 하지만 종종 약팀을 학살합니다." }
];

function initLeagueStandings() {
    leagueStandings = {};
    TOTO_TEAMS.forEach(team => {
        leagueStandings[team.id] = { name: team.name, played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, points: 0 };
    });
}

function generateRoundMatches(roundNumber) {
    const matches = [];
    const teams = [...TOTO_TEAMS];
    const shuffled = teams.sort(() => Math.random() - 0.5);
    
    for (let i = 0; i < 6; i++) {
        const homeTeam = shuffled[i * 2];
        const awayTeam = shuffled[i * 2 + 1];
        
        const homePower = homeTeam.power * homeTeam.homeAdv;
        const awayPower = awayTeam.power;
        
        // ✨ 팀 특성(공격력 vs 수비력) 교차 계산
        const expectedGoalsHome = Math.max(0.3, ((homePower * homeTeam.atk) / (awayPower * awayTeam.def)) * 1.6 + (Math.random() - 0.5) * 0.4);
        const expectedGoalsAway = Math.max(0.2, ((awayPower * awayTeam.atk) / (homePower * homeTeam.def)) * 1.3 + (Math.random() - 0.5) * 0.4);
        
        const powerDiff = Math.abs(homePower - awayPower);
        const volatilityFactor = (homeTeam.upset + awayTeam.upset) / 2;

        // ✨ 무승부 확률 동적 계산 (전력차가 적거나 늪축구 팀일수록 상승)
        let drawProb = Math.max(0.12, 0.32 - (powerDiff / 120));
        if (homeTeam.id === 'WHU' || awayTeam.id === 'WHU' || homeTeam.id === 'EVE' || awayTeam.id === 'EVE') {
            drawProb += 0.08; // 늪축구 팀 등장 시 무승부 떡상
        }

        // 승률 기초 계산
        let homeWinProb = (expectedGoalsHome / (expectedGoalsHome + expectedGoalsAway)) * (1 - drawProb);
        let awayWinProb = 1 - homeWinProb - drawProb;
        
        // ✨ 도깨비팀 효과 (기복이 큰 팀이 있으면 강팀의 승률을 깎아 역배당 확률을 올림)
        if (volatilityFactor > 1.15) {
            homeWinProb = homeWinProb * 0.85 + 0.15 * ((1 - drawProb) / 2);
            awayWinProb = awayWinProb * 0.85 + 0.15 * ((1 - drawProb) / 2);
        }

        const margin = 0.94; // 하우스 마진
        const homeOdds = Math.max(1.15, (1 / homeWinProb) * margin);
        const drawOdds = Math.max(2.2, (1 / drawProb) * margin);
        const awayOdds = Math.max(1.15, (1 / awayWinProb) * margin);
        
        const overOdds = 1.85 + (Math.random() - 0.5) * 0.15;
        const underOdds = 1.95 + (Math.random() - 0.5) * 0.15;
        
        matches.push({
            id: `R${roundNumber}_M${i + 1}`, round: roundNumber,
            home: homeTeam.name, away: awayTeam.name,
            homeId: homeTeam.id, awayId: awayTeam.id,
            expectedGoals: { home: parseFloat(expectedGoalsHome.toFixed(1)), away: parseFloat(expectedGoalsAway.toFixed(1)) },
            odds: { home_win: parseFloat(homeOdds.toFixed(2)), draw: parseFloat(drawOdds.toFixed(2)), away_win: parseFloat(awayOdds.toFixed(2)), over_25: parseFloat(overOdds.toFixed(2)), under_25: parseFloat(underOdds.toFixed(2)) },
            result: null, status: "scheduled"
        });
    }
    return matches;
}

function renderTotoMatches() {
    try {
        const container = document.getElementById('toto-match-list');
        if (!container) return;
        container.innerHTML = '';
        
        const seasonEl = document.getElementById('season-num');
        const roundEl = document.getElementById('round-num');
        if (seasonEl) seasonEl.innerText = currentSeason || 1;
        if (roundEl) roundEl.innerText = currentRound || 1;
        
        if (!currentRoundMatches || currentRoundMatches.length === 0 || !currentRoundMatches[0].homeId || !currentRoundMatches[0].odds) {
            currentRoundMatches = generateRoundMatches(currentRound);
        }
        
        const isLive = (roundPhase === 'live') || (roundTimeLeft <= 240 && roundTimeLeft > 30);
        
        if (showingFinalResults && currentRoundMatches.length > 0 && currentRoundMatches[0].result) {
            currentRoundMatches.forEach((match) => {
                const div = document.createElement('div');
                div.style.cssText = 'background:#052e16; border:2px solid #10b981; border-radius:14px; padding:14px 12px;';
                const homeWin = match.result.result === 'home_win';
                const awayWin = match.result.result === 'away_win';
                let resultText = homeWin ? `${match.home} 승` : (awayWin ? `${match.away} 승` : '무승부');
                let resultColor = homeWin ? '#10b981' : (awayWin ? '#ef4444' : '#fbbf24');
                
                div.innerHTML = `
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
                        <div style="font-size:13px; font-weight:700; color:#e2e8f0;">${match.home}</div>
                        <div style="font-size:22px; font-weight:900; color:#f8fafc;">${match.result.homeGoals} - ${match.result.awayGoals}</div>
                        <div style="font-size:13px; font-weight:700; color:#e2e8f0; text-align:right;">${match.away}</div>
                    </div>
                    <div style="text-align:center; font-size:13px; color:${resultColor}; font-weight:bold; margin-top:4px;">🏁 경기 종료 • ${resultText}</div>
                    <div style="text-align:center; font-size:11px; color:#64748b; margin-top:6px;">30초 후 다음 라운드 배팅 시작...</div>
                `;
                container.appendChild(div);
            });
            renderPreviousRoundSummary();
            return;
        }
        
        if (isLive) {
            currentRoundMatches.forEach((match) => {
                if (match.liveHomeScore === undefined) match.liveHomeScore = 0;
                if (match.liveAwayScore === undefined) match.liveAwayScore = 0;
                
                const displayTime = Math.max(0, Math.ceil(roundTimeLeft - 30));
                const liveMin = Math.floor(displayTime / 60);
                const liveSec = displayTime % 60;
                const liveTime = `${liveMin}:${liveSec.toString().padStart(2, '0')}`;
                
                const div = document.createElement('div');
                div.style.cssText = 'background:#0f172a; border:2px solid #1e40af; border-radius:14px; padding:14px 12px; transition:all 0.2s;';
                div.innerHTML = `
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
                        <div style="font-size:14px; font-weight:900; color:#e2e8f0; flex:1; cursor:pointer; text-decoration:underline; text-underline-offset:3px; text-decoration-color:#475569;" onclick="showTeamProfile('${match.homeId}')" title="팀 정보 보기">${match.home}</div>
                        <div class="live-score" style="font-size:22px; font-weight:900; color:#10b981; min-width:36px; text-align:center;">${match.liveHomeScore}</div>
                        <div style="text-align:center; padding:0 12px; min-width:70px;">
                            <div style="font-size:11px; color:#64748b;">경기시간</div>
                            <div style="font-size:18px; font-weight:900; color:#ef4444;">${liveTime}</div>
                        </div>
                        <div class="live-score" style="font-size:22px; font-weight:900; color:#ef4444; min-width:36px; text-align:center;">${match.liveAwayScore}</div>
                        <div style="font-size:14px; font-weight:900; color:#e2e8f0; flex:1; text-align:right; cursor:pointer; text-decoration:underline; text-underline-offset:3px; text-decoration-color:#475569;" onclick="showTeamProfile('${match.awayId}')" title="팀 정보 보기">${match.away}</div>
                    </div>
                    <div style="text-align:center; font-size:11px; color:#94a3b8;">실시간 경기 진행 중...</div>
                `;
                container.appendChild(div);
            });
            
            const info = document.createElement('div');
            info.style.cssText = 'margin-top:12px; font-size:12px; color:#64748b; text-align:center;';
            info.innerText = '⚽ 모든 경기가 동시에 진행 중입니다. 4분 후 결과가 확정됩니다.';
            container.appendChild(info);
        } else {
            currentRoundMatches.forEach((match) => {
                const homeOdds = match.odds ? match.odds.home_win : '1.0';
                const drawOdds = match.odds ? match.odds.draw : '1.0';
                const awayOdds = match.odds ? match.odds.away_win : '1.0';

                const div = document.createElement('div');
                div.style.cssText = 'background:#1e293b; border:1px solid #334155; border-radius:14px; padding:14px 12px; transition:all 0.2s;';
                div.innerHTML = `
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px; gap:6px;">
                        <div style="display:flex; align-items:center; gap:6px; flex:1; cursor:pointer;" onclick="event.stopPropagation(); showTeamProfile('${match.homeId}')" title="팀 정보 보기">
                            ${getTeamBadge(match.homeId)}
                            <div style="font-size:13px; font-weight:900; color:#e2e8f0; text-decoration:underline; text-underline-offset:3px; text-decoration-color:#475569;">${match.home}</div>
                        </div>
                        <div style="font-size:11px; color:#64748b; flex-shrink:0;">VS</div>
                        <div style="display:flex; align-items:center; gap:6px; flex:1; justify-content:flex-end; text-align:right; cursor:pointer;" onclick="event.stopPropagation(); showTeamProfile('${match.awayId}')" title="팀 정보 보기">
                            <div style="font-size:13px; font-weight:900; color:#e2e8f0; text-decoration:underline; text-underline-offset:3px; text-decoration-color:#475569;">${match.away}</div>
                            ${getTeamBadge(match.awayId)}
                        </div>
                    </div>
                    <div style="display:flex; justify-content:space-between; font-size:11px; color:#94a3b8; margin-bottom:10px;">
                        <div>홈 <span style="color:#fbbf24; font-weight:bold;">@${homeOdds}</span></div>
                        <div>무 <span style="color:#fbbf24; font-weight:bold;">@${drawOdds}</span></div>
                        <div>원정 <span style="color:#fbbf24; font-weight:bold;">@${awayOdds}</span></div>
                    </div>
                    <div style="text-align:center;">
                        <button type="button" onclick="selectTotoMatch('${match.id}')" style="background:#1e40af; color:white; border:none; border-radius:999px; padding:6px 20px; font-size:12px; font-weight:bold; width:100%; cursor:pointer; box-shadow:0 2px 6px rgba(0,0,0,0.4);">이 경기 배팅하기 →</button>
                    </div>
                `;
                container.appendChild(div);
            });
        }
        
        setTimeout(() => {
            if (typeof renderLeagueStandingsInInfoTab === 'function') renderLeagueStandingsInInfoTab();
        }, 200);

        if (typeof renderTotoBettingHistory === 'function') renderTotoBettingHistory();
        if (typeof renderPreviousRoundSummary === 'function') renderPreviousRoundSummary();
    } catch (e) {
        console.error("renderTotoMatches 에러 발생! 강제 초기화 진행 중...", e);
        currentRoundMatches = generateRoundMatches(currentRound);
        renderTotoMatches();
    }
}

function startLivePhase() {
    roundPhase = 'live';
    currentRoundMatches.forEach(match => {
        if (!match.finalResult) match.finalResult = simulateMatchResult(match);
        match.liveHomeScore = 0; match.liveAwayScore = 0;
    });

    const bettingPanel = document.getElementById('toto-betting-panel');
    if (bettingPanel) { bettingPanel.style.opacity = '0.4'; bettingPanel.style.pointerEvents = 'none'; }

    renderTotoMatches();
    const hud = document.getElementById('hud-status-text');
    if (hud) hud.innerText = '⚽ 경기가 시작되었습니다! 실시간 스코어를 확인하세요.';

    if (window.liveUpdateInterval) { clearInterval(window.liveUpdateInterval); window.liveUpdateInterval = null; }
}

function endLivePhase() {
    isLiveMode = false;
    roundPhase = 'settled';
    showingFinalResults = true; 
    
    const hud = document.getElementById('hud-status-text');
    if (hud) hud.innerText = '🏁 모든 경기 종료! 최종 스코어를 확인하세요 (10초 후 다음 라운드)';
    
    currentRoundMatches.forEach(match => {
        let finalRes = match.finalResult;
        if (finalRes) {
            match.liveHomeScore = finalRes.homeGoals;
            match.liveAwayScore = finalRes.awayGoals;
        } else {
            const homeGoals = match.liveHomeScore || 0;
            const awayGoals = match.liveAwayScore || 0;
            let resultType = homeGoals > awayGoals ? 'home_win' : (awayGoals > homeGoals ? 'away_win' : 'draw');
            finalRes = { homeGoals: homeGoals, awayGoals: awayGoals, result: resultType };
        }
        match.result = finalRes; match.status = 'finished';
        updateLeagueStandings(match, finalRes);
    });
    
    if (roundBets.length > 0) calculateBetResults();
    
    lastRoundMatches = JSON.parse(JSON.stringify(currentRoundMatches));
    lastRoundBets = [...roundBets];
    
    renderTotoMatches(); renderPreviousRoundSummary(); renderTotoBettingHistory();
    
    setTimeout(() => {
        showingFinalResults = false;
        currentRound++;
        if (currentRound > 10) {
            previousSeasonNumber = currentSeason;
            previousSeasonStandings = JSON.parse(JSON.stringify(leagueStandings));
            currentSeason++; currentRound = 1; initLeagueStandings();
        }
        currentRoundMatches = generateRoundMatches(currentRound);
        roundBets = []; roundTimeLeft = 600; roundPhase = 'betting';
        
        const roundEl = document.getElementById('toto-round-info');
        if (roundEl) roundEl.innerText = `제 ${currentRound}라운드`;
        
        renderTotoMatches(); renderPreviousRoundSummary(); startRoundTimer();
        if(typeof saveData === 'function') saveData();
        
        const hud2 = document.getElementById('hud-status-text');
        if (hud2) hud2.innerText = `⚽ 제 ${currentRound}라운드 시작!`;
    }, 10000);
}

function placeTotoBet() {
    // ✨ 배팅 마감(Live) 후 스코어를 보고 배팅하는 강제 배팅 방지 코드 추가
    if (roundPhase !== 'betting') {
        showAlert("⏳ 현재 라운드의 배팅이 이미 마감되었습니다!");
        return;
    }

    const amountInput = document.getElementById('toto-bet-amount');
    if (amountInput && amountInput.value) totoActiveBet = parseInt(amountInput.value) || 0;
    
    if (!currentTotoMatch || !selectedTotoBetType || !totoActiveBet || totoActiveBet <= 0) { showAlert("배팅할 경기를 선택하고 금액을 입력해주세요."); return; }
    if (gameChips < totoActiveBet) { showAlert(`게임칩이 부족합니다!\n현재 칩: ${gameChips.toLocaleString()} 원\n필요 칩: ${totoActiveBet.toLocaleString()} 원`); return; }
    
    const alreadyBet = roundBets.findIndex(b => b.matchId === currentTotoMatch.id);
    if (alreadyBet !== -1) { showAlert("이미 이 경기에 배팅했습니다. 다른 경기를 선택하세요."); return; }

    const cheatCb = document.getElementById('use-toto-bribe');
    if (cheatCb && cheatCb.checked && inventory['bm_toto_bribe'] > 0) {
        inventory['bm_toto_bribe'] -= 1;
        currentTotoMatch.hackedResult = selectedTotoBetType; 
        showToast("📸 심판에게 약점 사진을 전송했습니다. 결과가 조작됩니다.", "success");
        if(typeof saveData === 'function') saveData();
        if(typeof renderSmartInventory === 'function') renderSmartInventory();
    }
    
    roundBets.push({ matchId: currentTotoMatch.id, betType: selectedTotoBetType, amount: totoActiveBet, odds: selectedTotoOdds, won: null, settled: false });
    
    gameChips -= totoActiveBet;
    updateLedgerDisplays();

    if (typeof updateQuestProgress === 'function') updateQuestProgress('toto_bet', 1);

    gameStats.toto.plays = (gameStats.toto.plays || 0) + 1;
    gameStats.totalGames = (gameStats.totalGames || 0) + 1;
    
    const hud = document.getElementById('hud-status-text');
    if (hud) hud.innerText = `✅ ${currentTotoMatch.home} vs ${currentTotoMatch.away} 배팅 확정! (총 ${roundBets.length}경기 배팅)`;
    
    const panel = document.getElementById('toto-betting-panel');
    if (panel) panel.style.display = 'none';
    
    currentTotoMatch = null; selectedTotoBetType = ""; totoActiveBet = 0;
    renderTotoBettingHistory();
    if(typeof saveData === 'function') saveData();
}

function renderTotoBettingHistory() {
    const container = document.getElementById('toto-betting-history');
    const listEl = document.getElementById('toto-betting-history-list');
    if (!container || !listEl) return;
    
    const hasLastRound = lastRoundBets && lastRoundBets.length > 0;
    const hasCurrent = roundBets && roundBets.length > 0;
    
    container.style.display = 'block'; listEl.innerHTML = '';
    
    if (!hasLastRound && !hasCurrent) {
        listEl.innerHTML = `<div style="padding:16px 12px; text-align:center; color:#64748b; font-size:13px; line-height:1.6;">이번 라운드에 배팅한 경기가 없습니다.<br><span style="font-size:12px; color:#475569;">경기를 선택하고 배팅해보세요!</span></div>`;
        return;
    }
    
    if (hasLastRound) {
        const header = document.createElement('div');
        header.style.cssText = 'font-size:12px; color:#fbbf24; font-weight:bold; margin:8px 0 4px; padding-bottom:4px; border-bottom:1px solid #334155;';
        header.innerText = '📋 지난 라운드 배팅 결과';
        listEl.appendChild(header);
        
        lastRoundBets.forEach((bet, index) => {
            let match = lastRoundMatches.find(m => m.id === bet.matchId) || currentRoundMatches.find(m => m.id === bet.matchId);
            if (!match) return;
            
            let betTypeText = bet.betType === 'home_win' ? `${match.home} 승` : bet.betType === 'draw' ? '무승부' : `${match.away} 승`;
            let statusHTML = '';
            
            if (bet.won === true && !bet.settled) {
                const payoutAmount = Math.floor(bet.amount * bet.odds);
                statusHTML = `<div style="text-align:right;"><div style="color:#10b981; font-weight:bold;">당첨! +${payoutAmount.toLocaleString()} 원</div><button onclick="claimBetWinningsFromLast(${index})" style="margin-top:4px; padding:4px 12px; background:#059669; color:white; border:none; border-radius:6px; font-size:12px; font-weight:bold; cursor:pointer;">수령하기</button></div>`;
            } else if (bet.won === true && bet.settled) {
                statusHTML = `<div style="color:#10b981; font-weight:bold; text-align:right;">수령 완료</div>`;
            } else if (bet.won === false) {
                statusHTML = `<div style="color:#ef4444; font-weight:bold; text-align:right;">낙첨</div>`;
            } else {
                statusHTML = `<div style="color:#94a3b8; font-size:12px; text-align:right;">결과 대기중</div>`;
            }
            
            const div = document.createElement('div');
            div.style.cssText = 'display:flex; justify-content:space-between; align-items:center; padding:8px 0; border-bottom:1px solid #1e293b; font-size:13px;';
            div.innerHTML = `<div style="flex:1;"><div style="font-weight:bold; color:#e2e8f0;">${match.home} vs ${match.away}</div><div style="font-size:12px; color:#94a3b8;">${betTypeText} @${bet.odds}</div></div>${statusHTML}`;
            listEl.appendChild(div);
        });
    }
    
    if (hasCurrent) {
        if (hasLastRound) {
            const divider = document.createElement('div');
            divider.style.cssText = 'height:1px; background:#334155; margin:8px 0;';
            listEl.appendChild(divider);
        }
        const header2 = document.createElement('div');
        header2.style.cssText = 'font-size:12px; color:#10b981; font-weight:bold; margin:4px 0;';
        header2.innerText = '이번 라운드 배팅 중';
        listEl.appendChild(header2);
        
        roundBets.forEach((bet) => {
            const match = currentRoundMatches.find(m => m.id === bet.matchId);
            if (!match) return;
            
            let betTypeText = bet.betType === 'home_win' ? `${match.home} 승` : bet.betType === 'draw' ? '무승부' : `${match.away} 승`;
            const statusHTML = `<div style="text-align:right;"><div style="color:#10b981; font-weight:bold;">${bet.amount.toLocaleString()} 원</div><div style="font-size:11px; color:#64748b;">예상 ${Math.floor(bet.amount * bet.odds).toLocaleString()} 원</div></div>`;
            
            const div = document.createElement('div');
            div.style.cssText = 'display:flex; justify-content:space-between; align-items:center; padding:8px 0; border-bottom:1px solid #1e293b; font-size:13px;';
            div.innerHTML = `<div style="flex:1;"><div style="font-weight:bold; color:#e2e8f0;">${match.home} vs ${match.away}</div><div style="font-size:12px; color:#94a3b8;">${betTypeText} @${bet.odds}</div></div>${statusHTML}`;
            listEl.appendChild(div);
        });
    }
}

function renderPreviousRoundSummary() {
    const container = document.getElementById('previous-round-summary');
    const listEl = document.getElementById('previous-round-matches-list');
    if (!container || !listEl) return;

    container.style.display = 'block'; listEl.innerHTML = '';

    if (!lastRoundMatches || lastRoundMatches.length === 0) {
        listEl.innerHTML = `<div style="padding:16px 12px; text-align:center; color:#64748b; font-size:13px; line-height:1.6;">지난 라운드 경기 결과가 없습니다.<br><span style="font-size:12px; color:#475569;">경기가 진행되면 여기에 결과가 표시됩니다.</span></div>`;
        return;
    }

    lastRoundMatches.forEach((match) => {
        if (!match.result) return;
        const homeWin = match.result.result === 'home_win';
        const awayWin = match.result.result === 'away_win';
        let resultBadge = homeWin ? `<span style="background:#052e16; color:#10b981; padding:2px 8px; border-radius:999px; font-size:11px; font-weight:bold;">${match.home} 승</span>` : awayWin ? `<span style="background:#3f1f1f; color:#ef4444; padding:2px 8px; border-radius:999px; font-size:11px; font-weight:bold;">${match.away} 승</span>` : `<span style="background:#1e293b; color:#fbbf24; padding:2px 8px; border-radius:999px; font-size:11px; font-weight:bold;">무승부</span>`;

        const div = document.createElement('div');
        div.style.cssText = 'background:#0f172a; border:1px solid #334155; border-radius:10px; padding:10px 12px;';
        div.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
                <div style="font-weight:700; color:#e2e8f0; font-size:13px; cursor:pointer; text-decoration:underline; text-underline-offset:3px; text-decoration-color:#475569;" onclick="showTeamProfile('${match.homeId}')">${match.home}</div> 
                <div style="font-size:18px; font-weight:900; color:#f8fafc;">${match.result.homeGoals} - ${match.result.awayGoals}</div>
                <div style="font-weight:700; color:#e2e8f0; font-size:13px; cursor:pointer; text-decoration:underline; text-underline-offset:3px; text-decoration-color:#475569;" onclick="showTeamProfile('${match.awayId}')">${match.away}</div>
            </div>
            <div style="display:flex; justify-content:space-between; align-items:center;"><div style="font-size:11px; color:#94a3b8;">제 ${match.round || (currentRound-1)}라운드</div>${resultBadge}</div>
        `;
        listEl.appendChild(div);
    });
}

function claimBetWinnings(betIndex) {
    // ✨ 수령 모달 다중 클릭(무한 복사) 방어 코드
    if (document.getElementById('claim-confirm-btn')) {
        return; // 이미 모달이 떠 있으면 중복 실행 금지
    }

    const betsToShow = (lastRoundBets && lastRoundBets.length > 0) ? lastRoundBets : roundBets;
    const bet = betsToShow[betIndex];
    if (!bet || !bet.won || bet.settled) return;
    
    const payout = Math.floor(bet.amount * bet.odds);
    const netProfit = payout - bet.amount;
    const profitBonus = typeof applyProfitBonus === 'function' ? applyProfitBonus(payout, 'toto') : 0;
    const finalPayout = payout + profitBonus;
    
    showClaimWinningsModal({
        title: '⚽ 토토 배팅 수령', betLabel: '배팅 금액', betAmount: bet.amount, multiplier: bet.odds, grossAmount: payout, bonusAmount: profitBonus, finalAmount: finalPayout, profitAmount: netProfit + profitBonus, gameTypeForBreakdown: 'toto',
        onClaim: () => {
            gameChips += finalPayout; bet.settled = true;
            
            if (finalPayout > (gameStats.toto.maxSingleWin || 0)) gameStats.toto.maxSingleWin = finalPayout;

            gameStats.toto.profit = (gameStats.toto.profit || 0) + netProfit + profitBonus;
            gameStats.totalProfit = (gameStats.totalProfit || 0) + netProfit + profitBonus;
            updateLedgerDisplays(); renderTotoBettingHistory();
            if (typeof renderStats === 'function') renderStats();
            
            const hud = document.getElementById('hud-profit-text');
            if (hud) {
                let msg = `배팅 수령 완료! +${finalPayout.toLocaleString()} 원`;
                if (profitBonus > 0) msg += ` <span style="color:#4ade80;">(+${profitBonus.toLocaleString()} 보너스)</span>`;
                hud.innerHTML = `<span style="color:#10b981;">${msg}</span>`;
                setTimeout(() => { if (hud) hud.innerHTML = ''; }, 3000);
            }
            appendLogRecord(`[토토 수령] 배팅 수령`, `+${finalPayout.toLocaleString()} 원`, 'color:#10b981; font-weight:bold;');
        }
    });
}

function claimBetWinningsFromLast(betIndex) {
    // ✨ 수령 모달 다중 클릭(무한 복사) 방어 코드
    if (document.getElementById('claim-confirm-btn')) {
        return; // 이미 모달이 떠 있으면 중복 실행 금지
    }

    if (!lastRoundBets || !lastRoundBets[betIndex]) return;
    const bet = lastRoundBets[betIndex];
    if (!bet || !bet.won || bet.settled) return;
    
    const payout = Math.floor(bet.amount * bet.odds);
    const netProfit = payout - bet.amount;
    const profitBonus = typeof applyProfitBonus === 'function' ? applyProfitBonus(payout, 'toto') : 0;
    const finalPayout = payout + profitBonus;
    
    showClaimWinningsModal({
        title: '⚽ 토토 배팅 수령 (지난 라운드)', betLabel: '배팅 금액', betAmount: bet.amount, multiplier: bet.odds, grossAmount: payout, bonusAmount: profitBonus, finalAmount: finalPayout, profitAmount: netProfit + profitBonus, gameTypeForBreakdown: 'toto',
        onClaim: () => {
            gameChips += finalPayout; bet.settled = true;

            // ✨ 명예의 전당 잭팟 추적
            if (finalPayout > (gameStats.toto.maxSingleWin || 0)) gameStats.toto.maxSingleWin = finalPayout;

            gameStats.toto.profit = (gameStats.toto.profit || 0) + netProfit + profitBonus;
            gameStats.totalProfit = (gameStats.totalProfit || 0) + netProfit + profitBonus;
            updateLedgerDisplays(); renderTotoBettingHistory();
            if (typeof renderStats === 'function') renderStats();
            
            const hud = document.getElementById('hud-profit-text');
            if (hud) {
                let msg = `배팅 수령 완료! +${finalPayout.toLocaleString()} 원`;
                if (profitBonus > 0) msg += ` <span style="color:#4ade80;">(+${profitBonus.toLocaleString()} 보너스)</span>`;
                hud.innerHTML = `<span style="color:#10b981;">${msg}</span>`;
                setTimeout(() => { if (hud) hud.innerHTML = ''; }, 3000);
            }
            appendLogRecord(`[토토 수령] 지난 라운드 배팅 수령`, `+${finalPayout.toLocaleString()} 원`, 'color:#10b981; font-weight:bold;');
        }
    });
}

function calculateBetResults() {
    roundBets.forEach(bet => {
        // ✅ 수정된 부분: 이미 통계 처리가 끝난 배팅건은 중복 계산하지 않도록 방어
        if (bet.statsProcessed) return;
        
        const match = currentRoundMatches.find(m => m.id === bet.matchId);
        if (!match || !match.result) return;
        
        let won = false;
        if (bet.betType === 'home_win' && match.result.result === 'home_win') won = true;
        else if (bet.betType === 'draw' && match.result.result === 'draw') won = true;
        else if (bet.betType === 'away_win' && match.result.result === 'away_win') won = true;
        
        bet.won = won;
        bet.statsProcessed = true; // ✅ 통계 처리 완료 마킹 (중복 뻥튀기 차단)
        
        if (won) {
            gameStats.toto.hits = (gameStats.toto.hits || 0) + 1;
            if (bet.odds > (gameStats.toto.maxOddsHit || 1)) gameStats.toto.maxOddsHit = bet.odds;
            gameStats.toto.currentHitStreak = (gameStats.toto.currentHitStreak || 0) + 1;
            if (gameStats.toto.currentHitStreak > (gameStats.toto.maxHitStreak || 0)) gameStats.toto.maxHitStreak = gameStats.toto.currentHitStreak;
        } else {
            // ✨ 명예의 전당 손실 추적
            if (bet.amount > (gameStats.toto.maxSingleLoss || 0)) gameStats.toto.maxSingleLoss = bet.amount;

            gameStats.toto.loss = (gameStats.toto.loss || 0) + bet.amount;
            gameStats.totalLoss = (gameStats.totalLoss || 0) + bet.amount;
            gameStats.toto.currentHitStreak = 0;
        }
    });
    renderTotoBettingHistory();
}

function renderLeagueStandingsInInfoTab() {
    const container = document.getElementById('info-league-standings-content');
    if (!container) return;
    
    if (typeof leagueStandings === 'undefined' || leagueStandings === null || typeof leagueStandings !== 'object' || Object.keys(leagueStandings).length === 0) {
        container.innerHTML = '<div style="color:#64748b; text-align:center; padding:20px; font-size:13px;">리그 데이터가 없습니다.<br>토토 탭에서 경기를 진행하면 순위가 생성됩니다.</div>';
        return;
    }
    
    const keys = Object.keys(leagueStandings);
    const sortedTeams = keys.map(key => {
        const team = leagueStandings[key];
        return { 
            id: key, name: team.name || key, played: team.played || 0, won: team.won || 0, drawn: team.drawn || 0,
            lost: team.lost || 0, goalsFor: team.goalsFor || 0, goalsAgainst: team.goalsAgainst || 0, points: team.points || 0
        };
    }).sort((a, b) => {
        if (b.points !== a.points) return b.points - a.points;
        const gdA = a.goalsFor - a.goalsAgainst;
        const gdB = b.goalsFor - b.goalsAgainst;
        if (gdB !== gdA) return gdB - gdA;
        return b.goalsFor - a.goalsFor;
    });
    
    let html = '<table style="width:100%; font-size:11px; border-collapse: collapse;">';
    html += '<thead><tr style="border-bottom:1px solid #334155; color:#94a3b8;"><th style="text-align:left; padding:3px 2px;">순위</th><th style="text-align:left; padding:3px 2px;">팀</th><th style="text-align:center; padding:3px 1px;">경기</th><th style="text-align:center; padding:3px 1px;">승</th><th style="text-align:center; padding:3px 1px;">무</th><th style="text-align:center; padding:3px 1px;">패</th><th style="text-align:center; padding:3px 1px;">득실</th><th style="text-align:center; padding:3px 2px;">승점</th></tr></thead><tbody>';
    
    sortedTeams.forEach((team, index) => {
        const rank = index + 1;
        let rankColor = rank <= 4 ? '#10b981' : rank >= 14 ? '#ef4444' : '#f8fafc';
        let rowClass = rank <= 4 ? 'league-top4' : rank >= 14 ? 'league-bottom3' : '';
        const gd = team.goalsFor - team.goalsAgainst;
        const gdColor = gd > 0 ? '#10b981' : (gd < 0 ? '#ef4444' : '#94a3b8');
        const gdText = gd > 0 ? `+${gd}` : gd;
        
        html += `<tr class="${rowClass}" style="border-bottom:1px solid #1e293b; cursor:pointer;" onclick="showTeamProfile('${team.id}')">
            <td style="padding:3px 2px; font-weight:bold; color:${rankColor};">${rank}</td><td style="padding:3px 2px; font-weight:bold; color:#e2e8f0; font-size:11px; text-decoration:underline; text-underline-offset:2px; text-decoration-color:#475569;">${team.name}</td><td style="text-align:center; padding:3px 1px; color:#94a3b8;">${team.played}</td><td style="text-align:center; padding:3px 1px; color:#10b981; font-weight:bold;">${team.won}</td><td style="text-align:center; padding:3px 1px; color:#fbbf24;">${team.drawn}</td><td style="text-align:center; padding:3px 1px; color:#ef4444;">${team.lost}</td><td style="text-align:center; padding:3px 1px; color:${gdColor}; font-weight:bold;">${gdText}</td><td style="text-align:center; padding:3px 2px; font-weight:bold; color:#fbbf24;">${team.points}</td>
        </tr>`;
    });
    
    html += '</tbody></table>';
    container.innerHTML = html;
}

function selectTotoMatch(matchId) {
    currentTotoMatch = currentRoundMatches.find(m => m.id === matchId);
    if (!currentTotoMatch) return;
    
    document.getElementById('toto-betting-panel').style.display = 'block';
    document.getElementById('toto-live-panel').style.display = 'none';
    document.getElementById('toto-selected-match').innerHTML = `${currentTotoMatch.home} <span style="color:#64748b; font-weight:400;">vs</span> ${currentTotoMatch.away}`;
    document.getElementById('odds-home').innerText = currentTotoMatch.odds.home_win;
    document.getElementById('odds-draw').innerText = currentTotoMatch.odds.draw;
    document.getElementById('odds-away').innerText = currentTotoMatch.odds.away_win;
    
    selectedTotoBetType = null; totoActiveBet = 0;
    document.querySelectorAll('#toto-betting-panel .btn-opt').forEach(btn => btn.classList.remove('active'));

    let cheatDiv = document.getElementById('toto-cheat-ui');
    if (typeof inventory !== 'undefined' && inventory['bm_toto_bribe'] > 0) {
        if (!cheatDiv) {
            cheatDiv = document.createElement('div');
            cheatDiv.id = 'toto-cheat-ui';
            cheatDiv.style.cssText = "margin-top:12px; background:rgba(220,38,38,0.15); border:1px solid #dc2626; border-radius:10px; padding:10px; text-align:left;";
            const startBtn = document.getElementById('toto-start-btn');
            startBtn.parentNode.insertBefore(cheatDiv, startBtn);
        }
        cheatDiv.style.display = 'block';
        cheatDiv.innerHTML = `
            <label style="display:flex; align-items:center; gap:8px; cursor:pointer; color:#fca5a5; font-size:13px; font-weight:bold;">
                <input type="checkbox" id="use-toto-bribe" style="width:18px; height:18px; accent-color:#dc2626;">
                📸 심판 협박 (내가 배팅한 팀 무조건 승리, 보유: ${inventory['bm_toto_bribe']}개)
            </label>
        `;
    } else if (cheatDiv) {
        cheatDiv.style.display = 'none';
    }
}

function startRoundTimer() {
    if (window.roundTimerInterval) return;
    if (typeof roundTimeLeft === 'undefined' || roundTimeLeft <= 0) roundTimeLeft = 600;
    if (typeof roundPhase === 'undefined') roundPhase = 'betting';
    
    const timerEl = document.getElementById('round-timer');
    if (timerEl) {
        const displayTime = Math.ceil(roundTimeLeft);
        const min = Math.floor(displayTime / 60); const sec = displayTime % 60;
        timerEl.innerText = `${min}:${sec.toString().padStart(2, '0')}`;
        timerEl.style.color = '#ef4444';
    }
    let lastTickTime = Date.now();
    
    window.roundTimerInterval = setInterval(() => {
        if (!window.roundTimerInterval) { startRoundTimer(); return; }
        const now = Date.now();
        const deltaSec = (now - lastTickTime) / 1000;
        lastTickTime = now;
        let previousTimeLeft = roundTimeLeft;
        roundTimeLeft -= deltaSec;
        if (roundTimeLeft < 0) roundTimeLeft = 0;
        
        const displayTime = Math.ceil(roundTimeLeft);
        if (timerEl) {
            const min = Math.floor(displayTime / 60); 
            const sec = displayTime % 60;
            const timeStr = `${min}:${sec.toString().padStart(2, '0')}`;
            if (roundPhase === 'live') timerEl.innerText = `LIVE ${timeStr}`;
            else if (roundPhase === 'results') timerEl.innerText = `정산 중 ${timeStr}`;
            else timerEl.innerText = timeStr;
        }

        // ✨ 탭 반짝임 처리 (라이브나 정산 중이면 꺼짐)
        const totoTab = document.getElementById('tab-toto');
        if (totoTab) {
            if (roundPhase === 'betting' && activeTab !== 'toto') {
                totoTab.classList.add('tab-alert-blue');
            } else {
                totoTab.classList.remove('tab-alert-blue');
            }
        }

        if (previousTimeLeft > 240 && roundTimeLeft <= 240 && roundPhase === 'betting') {
            roundPhase = 'live';
            const panel = document.getElementById('toto-betting-panel');
            if (panel) { panel.style.opacity = '0.4'; panel.style.pointerEvents = 'none'; }
            startLivePhase();
            setTimeout(() => { if (activeTab === 'toto') renderTotoMatches(); }, 50);
        }
        
        if (roundPhase === 'live' && roundTimeLeft > 30) {
            currentRoundMatches.forEach(match => {
                if (!match.finalResult) return;
                if ((match.liveHomeScore || 0) < match.finalResult.homeGoals && Math.random() < 0.032) { match.liveHomeScore = (match.liveHomeScore || 0) + 1; }
                if ((match.liveAwayScore || 0) < match.finalResult.awayGoals && Math.random() < 0.032) { match.liveAwayScore = (match.liveAwayScore || 0) + 1; }
            });
            
            // ✨ 버그 수정: 골이 터지지 않더라도 매초마다 화면을 새로고침하여 카드 안의 시간이 정상적으로 흐르도록 변경
            if (activeTab === 'toto') renderTotoMatches();
        }
              
        if (previousTimeLeft > 30 && roundTimeLeft <= 30 && roundPhase === 'live') {
            roundPhase = 'results'; showingFinalResults = true;
            currentRoundMatches.forEach(match => {
                if (!match.result && match.finalResult) {
                    match.result = match.finalResult; match.status = 'finished'; updateLeagueStandings(match, match.result);
                }
            });
            if (roundBets.length > 0) calculateBetResults();
            lastRoundMatches = JSON.parse(JSON.stringify(currentRoundMatches));
            lastRoundBets = [...roundBets];
            if (activeTab === 'toto') { renderTotoMatches(); renderPreviousRoundSummary(); renderTotoBettingHistory(); }
        }
        
        if (roundTimeLeft <= 0) {
            clearInterval(window.roundTimerInterval); window.roundTimerInterval = null;
            showingFinalResults = false; endCurrentRound();
        }
        
        if (Math.floor(previousTimeLeft / 5) !== Math.floor(roundTimeLeft / 5) && typeof saveData === 'function') saveData();
    }, 1000);
}

function updateLeagueStandings(match, result) {
    if (!leagueStandings) return;
    const homeTeam = match.homeId; const awayTeam = match.awayId;
    if (!leagueStandings[homeTeam] || !leagueStandings[awayTeam]) return;
    
    leagueStandings[homeTeam].played++; leagueStandings[awayTeam].played++;
    leagueStandings[homeTeam].goalsFor += result.homeGoals; leagueStandings[homeTeam].goalsAgainst += result.awayGoals;
    leagueStandings[awayTeam].goalsFor += result.awayGoals; leagueStandings[awayTeam].goalsAgainst += result.homeGoals;
    
    if (result.result === 'home_win') { leagueStandings[homeTeam].won++; leagueStandings[awayTeam].lost++; leagueStandings[homeTeam].points += 3; } 
    else if (result.result === 'away_win') { leagueStandings[awayTeam].won++; leagueStandings[homeTeam].lost++; leagueStandings[awayTeam].points += 3; } 
    else { leagueStandings[homeTeam].drawn++; leagueStandings[awayTeam].drawn++; leagueStandings[homeTeam].points += 1; leagueStandings[awayTeam].points += 1; }
}

function simulateMatchResult(match) {
    if (match.hackedResult) {
        if (match.hackedResult === 'home_win') return { homeGoals: 3, awayGoals: 0, result: 'home_win' };
        if (match.hackedResult === 'away_win') return { homeGoals: 0, awayGoals: 3, result: 'away_win' };
        if (match.hackedResult === 'draw') return { homeGoals: 1, awayGoals: 1, result: 'draw' };
    }

    const homeTeam = TOTO_TEAMS.find(t => t.id === match.homeId) || { upset: 1.0 };
    const awayTeam = TOTO_TEAMS.find(t => t.id === match.awayId) || { upset: 1.0 };

    // ✨ 기대 득점을 바탕으로 난수(기복/upset)를 곱해 실제 골 결정
    let homeGoals = Math.round(match.expectedGoals.home + (Math.random() - 0.5) * 1.8 * homeTeam.upset);
    let awayGoals = Math.round(match.expectedGoals.away + (Math.random() - 0.5) * 1.8 * awayTeam.upset);

    homeGoals = Math.max(0, homeGoals);
    awayGoals = Math.max(0, awayGoals);

    let result = homeGoals > awayGoals ? 'home_win' : homeGoals < awayGoals ? 'away_win' : 'draw';
    return { homeGoals: homeGoals, awayGoals: awayGoals, result: result };
}

function endCurrentRound() {
    showingFinalResults = false;
    const hud = document.getElementById('hud-status-text');
    if (hud) hud.innerText = `⚽ 제 ${currentRound}라운드 종료! 경기 결과 처리 중...`;
    
    setTimeout(() => {
        currentRoundMatches.forEach(match => {
            if (!match.result) {
                const result = simulateMatchResult(match); match.result = result; match.status = 'finished'; updateLeagueStandings(match, result);
            } else { match.status = 'finished'; }
        });
        
        if (roundBets.length > 0) calculateBetResults();
        lastRoundMatches = JSON.parse(JSON.stringify(currentRoundMatches));
        
        const bettingPanel = document.getElementById('toto-betting-panel');
        if (bettingPanel) { bettingPanel.style.display = 'none'; bettingPanel.style.opacity = '1'; bettingPanel.style.pointerEvents = 'auto'; }
        
        currentRound++;
        if (currentRound > 10) {
            previousSeasonNumber = currentSeason;
            previousSeasonStandings = JSON.parse(JSON.stringify(leagueStandings));
            currentSeason++; currentRound = 1; initLeagueStandings();
            if (hud) hud.innerText = `🏆 시즌 ${currentSeason} 시작! 새로운 리그가 개막했습니다.`;
        }
        
        currentRoundMatches = generateRoundMatches(currentRound);
        roundTimeLeft = 600; roundPhase = 'betting';
        lastRoundBets = [...roundBets]; roundBets = [];
        
        const roundEl = document.getElementById('toto-round-info');
        if (roundEl) roundEl.innerText = `제 ${currentRound}라운드`;
        
        renderTotoMatches(); renderPreviousRoundSummary(); startRoundTimer();
        if (typeof saveData === 'function') saveData(); 
        if (hud && currentRound <= 10) hud.innerText = `⚽ 제 ${currentRound}라운드 시작!`;
    }, 2000);
}

function renderPreviousSeasonHighlight() {
    const container = document.getElementById('prev-season-highlight');
    if (!container) return;
    if (!previousSeasonStandings || Object.keys(previousSeasonStandings).length === 0 || !previousSeasonNumber) {
        container.innerHTML = '<div style="color:#64748b; text-align:center; padding:20px 0;">이전 시즌 데이터가 없습니다.<br>시즌이 종료되면 여기에 1~3위와 14~16위가 표시됩니다.</div>';
        return;
    }
    const sorted = Object.entries(previousSeasonStandings).sort((a, b) => {
        const ta = a[1], tb = b[1];
        if (tb.points !== ta.points) return tb.points - ta.points;
        const gdA = ta.goalsFor - ta.goalsAgainst; const gdB = tb.goalsFor - tb.goalsAgainst;
        if (gdB !== gdA) return gdB - gdA;
        return tb.goalsFor - ta.goalsFor;
    });

    let html = `<div style="margin-bottom:8px; font-weight:bold; color:#fbbf24;">시즌 ${previousSeasonNumber} 최종 순위 하이라이트</div><div style="display:grid; gap:6px;">`;
    html += '<div style="background:#052e16; border-radius:8px; padding:8px 12px; margin-bottom:4px;"><div style="font-size:12px; color:#10b981; font-weight:bold; margin-bottom:4px;">🏆 챔피언스리그 진출 (상위 3팀)</div>';
    for (let i = 0; i < Math.min(3, sorted.length); i++) {
        const team = sorted[i][1]; const gd = team.goalsFor - team.goalsAgainst;
        html += `<div style="display:flex; justify-content:space-between; font-size:13px; padding:2px 0;"><span style="color:#e2e8f0; font-weight:bold; cursor:pointer; text-decoration:underline; text-underline-offset:2px; text-decoration-color:#475569;" onclick="showTeamProfile('${sorted[i][0]}')">${i+1}. ${team.name}</span><span style="color:#10b981;">${team.points}점 <span style="color:#64748b; font-size:11px;">(득실 ${gd > 0 ? '+' : ''}${gd})</span></span></div>`;
    }
    html += '</div><div style="background:#3f1f1f; border-radius:8px; padding:8px 12px;"><div style="font-size:12px; color:#ef4444; font-weight:bold; margin-bottom:4px;">⬇️ 강등권 (14~16위)</div>';
    const start = Math.max(0, sorted.length - 3);
    for (let i = start; i < sorted.length; i++) {
        const team = sorted[i][1]; const gd = team.goalsFor - team.goalsAgainst;
        html += `<div style="display:flex; justify-content:space-between; font-size:13px; padding:2px 0;"><span style="color:#e2e8f0; font-weight:bold; cursor:pointer; text-decoration:underline; text-underline-offset:2px; text-decoration-color:#475569;" onclick="showTeamProfile('${sorted[i][0]}')">${i+1}. ${team.name}</span><span style="color:#ef4444;">${team.points}점 <span style="color:#64748b; font-size:11px;">(득실 ${gd > 0 ? '+' : ''}${gd})</span></span></div>`;
    }
    html += '</div></div>';
    container.innerHTML = html;
}

function showTeamProfile(teamId) {
    const team = TOTO_TEAMS.find(t => t.id === teamId);
    if (!team) return;

    const standings = leagueStandings[teamId] || { played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, points: 0 };
    const gd = standings.goalsFor - standings.goalsAgainst;
    const gdText = gd > 0 ? `+${gd}` : gd;

    // ✨ 신규: 팀 특성 시각화 (능력치 바)
    const atkWidth = Math.min(100, (team.atk * 70).toFixed(0));
    const defWidth = Math.min(100, (team.def * 70).toFixed(0));
    const upsetWidth = Math.min(100, (team.upset * 70).toFixed(0));

    document.getElementById('team-profile-badge').innerHTML = getTeamBadge(teamId);
    document.getElementById('team-profile-name').innerText = team.name;
    
    document.getElementById('team-profile-tactics').innerText = team.tactics || "정보 없음";
    document.getElementById('team-profile-keyplayer').innerText = team.keyPlayer || "정보 없음";
    document.getElementById('team-profile-stadium').innerText = team.stadium || "정보 없음";
    document.getElementById('team-profile-owner').innerText = team.owner || "정보 없음";
    document.getElementById('team-profile-lore').innerHTML = team.lore || "알려진 정보가 없습니다.";

    // ✨ 수정됨: 상세 능력치 바 추가
    document.getElementById('team-profile-record').innerHTML = `
        <div style="margin-bottom:12px; padding:10px; background:#020617; border-radius:8px;">
            <div style="font-size:11px; color:#fbbf24; font-weight:bold; margin-bottom:8px;">팀 능력치 (전술 성향)</div>
            <div style="font-size:11px; margin-bottom:4px;">공격력 (Atk)</div>
            <div style="height:6px; background:#1e293b; border-radius:3px; margin-bottom:8px;"><div style="height:100%; width:${atkWidth}%; background:#ef4444; border-radius:3px;"></div></div>
            <div style="font-size:11px; margin-bottom:4px;">수비력 (Def)</div>
            <div style="height:6px; background:#1e293b; border-radius:3px; margin-bottom:8px;"><div style="height:100%; width:${defWidth}%; background:#3b82f6; border-radius:3px;"></div></div>
            <div style="font-size:11px; margin-bottom:4px;">기복/변수 (Upset)</div>
            <div style="height:6px; background:#1e293b; border-radius:3px;"><div style="height:100%; width:${upsetWidth}%; background:#10b981; border-radius:3px;"></div></div>
        </div>
        <div style="display:flex; justify-content:space-between; color:#e2e8f0; margin-top:8px;"><span>시즌 전적</span><span style="font-weight:bold;">${standings.played}전 ${standings.won}승 ${standings.drawn}무 ${standings.lost}패</span></div>
        <div style="display:flex; justify-content:space-between; color:#e2e8f0; margin-top:4px;"><span>승점 / 득실차</span><span style="font-weight:bold; color:#fbbf24;">${standings.points}점 <span style="color:#64748b; font-size:11px;">(${gdText})</span></span></div>
    `;

    document.getElementById('team-profile-modal').style.display = 'flex';
}

function closeTeamProfile() {
    document.getElementById('team-profile-modal').style.display = 'none';
}

// ============================================================
// ✨ 유실되었던 토토 배팅 옵션 선택 및 취소 함수 복구
// ============================================================

function selectTotoBetSimple(betType, btnElement) {
    // 경기가 선택되지 않았으면 무시
    if (!currentTotoMatch) return;

    // 배팅 타입 저장
    selectedTotoBetType = betType;

    // 선택한 배팅의 배당률 저장
    if (betType === 'home_win') selectedTotoOdds = currentTotoMatch.odds.home_win;
    else if (betType === 'draw') selectedTotoOdds = currentTotoMatch.odds.draw;
    else if (betType === 'away_win') selectedTotoOdds = currentTotoMatch.odds.away_win;

    // 기존에 눌려있던 버튼 효과 초기화
    document.querySelectorAll('#toto-betting-panel .btn-opt').forEach(btn => {
        btn.classList.remove('active');
        btn.style.boxShadow = ''; 
    });

    // 방금 클릭한 버튼에 하이라이트 효과(파란색 테두리/글로우) 추가
    if (btnElement) {
        btnElement.classList.add('active');
        btnElement.style.boxShadow = '0 0 12px rgba(59, 130, 246, 0.8)';
        btnElement.style.borderColor = '#3b82f6';
    }
}

function cancelTotoSelection() {
    // 선택된 경기 및 배팅 데이터 초기화
    currentTotoMatch = null;
    selectedTotoBetType = "";
    totoActiveBet = 0;
    
    // 배팅 패널 숨기기
    const panel = document.getElementById('toto-betting-panel');
    if (panel) {
        panel.style.display = 'none';
    }
}