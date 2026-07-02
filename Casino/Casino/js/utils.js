// ============================================================
// js/utils.js
// 전역 상태 변수 및 공통 유틸리티 함수 (오디오, 모달, 세이브/로드 등)
// ============================================================

// --- 전역 상태 변수 ---
let bankAsset = 20000000;
let gameChips = 0;
let savingsBalance = 0;
let pendingInterest = 0;
let lastInterestTime = Date.now();
let portfolio = {};
let coinPortfolio = {};
let previousProfitStatus = {};
let selectedCoinId = null;
let unlockedItems = [];
let currentCategoryFilter = "all";
let currentSearchTerm = "";
let showOwnedOnly = false;
let activeTab = "ladder";
let isGameRunning = false;

// ✨ 스탯 및 레벨 시스템 상태
let playerLevel = 1;
let playerExp = 0;
let playerSP = 0;
let playerStats = { luk: 0, int: 0, dex: 0, cha: 0 };

// 장비 시스템 상태
let equipment = {
    hat:     { level: 0, tier: 1, baseName: "모자",     icon: "<i class='fa-solid fa-crown lux-icon'></i>", slot: "hat" },
    top:     { level: 0, tier: 1, baseName: "상의",     icon: "<i class='fa-solid fa-user-tie lux-icon'></i>", slot: "top" },
    pants:   { level: 0, tier: 1, baseName: "하의",     icon: "<i class='fa-solid fa-gem lux-icon'></i>", slot: "pants" },
    shoes:   { level: 0, tier: 1, baseName: "신발",     icon: "<i class='fa-solid fa-shoe-prints lux-icon'></i>", slot: "shoes" },
    gloves:  { level: 0, tier: 1, baseName: "장갑",     icon: "<i class='fa-solid fa-hand-sparkles lux-icon'></i>", slot: "gloves" },
    shoulder:{ level: 0, tier: 1, baseName: "견장",     icon: "<i class='fa-solid fa-shield-halved lux-icon'></i>", slot: "shoulder" },
    card:    { level: 0, tier: 1, baseName: "카드",     icon: "<i class='fa-solid fa-id-card lux-icon'></i>", slot: "card" }
};
let currentSelectedEquipSlot = null;

// ✨ 통계 상태 V2
let gameStats = {
    totalProfit: 0, totalLoss: 0, totalGames: 0,
    ladder: { plays: 0, hits: 0, profit: 0, loss: 0, maxWinStreak: 0, currentWinStreak: 0, maxOddsHit: 1.0, maxSingleWin: 0, maxSingleLoss: 0 },
    blackjack: { plays: 0, wins: 0, profit: 0, loss: 0, busts: 0, blackjacks: 0, maxSingleWin: 0, maxSingleLoss: 0 },
    roulette: { plays: 0, profit: 0, loss: 0, maxSingleWin: 0, maxSingleLoss: 0 },
    slot: { plays: 0, profit: 0, loss: 0, maxSingleWin: 0, maxSingleLoss: 0, jackpots: 0 },
    stock: { buys: 0, sells: 0, realizedProfit: 0, maxPortfolioValue: 0, feePaid: 0 },
    coin: { buys: 0, sells: 0, realizedProfit: 0, maxPortfolioValue: 0, feePaid: 0 },
    toto: { plays: 0, hits: 0, profit: 0, loss: 0, maxOddsHit: 1.0, currentHitStreak: 0, maxHitStreak: 0, maxSingleWin: 0, maxSingleLoss: 0 },
    arena: { plays: 0, wins: 0, profit: 0, loss: 0, maxSingleWin: 0, maxSingleLoss: 0 },
    business: { collections: 0, profit: 0, bailouts: 0 }, // 신규 추가
    events: { occurrences: 0, profit: 0, loss: 0, interest: 0 }, // 신규 추가
    system: { policeFines: 0, brokerFees: 0, pawnshopLosses: 0, equipEnhances: 0, equipDestroys: 0 }
};
let assetHistory = [20000000]; // 자산 차트용 배열

// 주식 및 뉴스 상태
let stockPrices = {};
let previousPrices = {};
let priceHistory = {};
let currentStockTurn = 0;
let stockTurnTimer = 30;
let stockTimerInterval = null;
let reputationPoints = 0;
let newsLog = [];
let activeNewsEffects = [];
let lastNewsTime = 0;

// 코인 상태
let coinPrices = {};
let previousCoinPrices = {};
let coinTimerInterval = null;
let coinDisplayTimerInterval = null;
let coinSecondsLeft = 15;
let selectedCoinForTrade = null;

// 퀘스트 상태
let dailyQuestProgress = { casinoPlays: 0, arenaBets: 0, marketBuys: 0, totoBets: 0, dailyProfit: 0 };
let weeklyQuestProgress = { itemsBought: 0, bmBuys: 0, enhances: 0, weeklyProfit: 0, creampie: 0 };
let completedDailyQuests = [];
let completedWeeklyQuests = [];
let lastDailyReset = null;
let lastWeeklyReset = null;

// ✨ 경험치 및 스탯 처리 함수
function getRequiredExp(level) {
    return Math.floor(100 * Math.pow(1.06, level - 1));
}

function addExp(amount) {
    if (playerLevel >= 200) return;
    playerExp += amount;
    let reqExp = getRequiredExp(playerLevel);
    let leveledUp = false;
    
    while (playerExp >= reqExp && playerLevel < 200) {
        playerExp -= reqExp;
        playerLevel++;
        playerSP += 5; 
        leveledUp = true;
        reqExp = getRequiredExp(playerLevel);
    }
    if (playerLevel >= 200) playerExp = 0;
    
    if (leveledUp) {
        showToast(`🎉 레벨 업! Lv.${playerLevel} 달성! (SP +5)`, 'success');
        if (typeof AudioSynth !== 'undefined') AudioSynth.playWin();
    }
    if (activeTab === 'profile') renderProfileUI();
    if (typeof saveData === 'function') saveData();
}

function upgradeStat(statKey) {
    if (playerSP <= 0) { showAlert("스탯 포인트(SP)가 부족합니다."); return; }
    playerSP--;
    playerStats[statKey]++;
    renderProfileUI();
    if (typeof saveData === 'function') saveData();
}

function renderProfileUI() {
    const lvlTxt = document.getElementById('profile-level-txt');
    const spTxt = document.getElementById('profile-sp-txt');
    const expBar = document.getElementById('profile-exp-bar');
    const expTxt = document.getElementById('profile-exp-txt');
    const container = document.getElementById('stat-upgrades-container');
    if (!lvlTxt || !container) return;

    lvlTxt.innerText = playerLevel;
    spTxt.innerText = playerSP;
    
    const reqExp = playerLevel >= 200 ? 0 : getRequiredExp(playerLevel);
    const expPct = playerLevel >= 200 ? 100 : Math.min(100, (playerExp / reqExp) * 100);
    expBar.style.width = `${expPct}%`;
    expTxt.innerText = playerLevel >= 200 ? 'MAX LEVEL' : `${playerExp.toLocaleString()} / ${reqExp.toLocaleString()} EXP`;

    const statInfos = [
        { key: 'luk', name: '🍀 행운 (LUK)', desc: '카지노(사다리,블랙잭 등) 수익금 보너스', effect: `+${(playerStats.luk * 0.05).toFixed(2)}%` },
        { key: 'int', name: '🧠 분석력 (INT)', desc: '시장 수수료 감소 및 토토 수익 상승', effect: `-${(playerStats.int * 0.005).toFixed(3)}%p` },
        { key: 'dex', name: '🛠️ 손재주 (DEX)', desc: '장비 강화 확률 혜택 (성공↑ 파괴↓)', effect: `성공 +${(playerStats.dex * 0.05).toFixed(2)}%p` },
        { key: 'cha', name: '👑 명성 (CHA)', desc: '적금 이자율 및 투기장 스폰서 잭팟 상승', effect: `+${(playerStats.cha * 0.0002).toFixed(4)}%p` }
    ];

    container.innerHTML = '';
    statInfos.forEach(s => {
        container.innerHTML += `
            <div style="background: linear-gradient(145deg, #0f172a, #020617); border: 1px solid #334155; border-radius: 12px; padding: 14px; display: flex; flex-direction: column; justify-content: space-between; gap: 10px; box-shadow: 0 4px 10px rgba(0,0,0,0.3);">
                <div>
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                        <span style="font-size: 14px; font-weight: 900; color: #e2e8f0;">${s.name}</span>
                        <span style="font-size: 14px; font-weight: 900; color: #fbbf24;">Lv.${playerStats[s.key]}</span>
                    </div>
                    <div style="font-size: 11.5px; color: #94a3b8; margin-bottom: 8px; line-height: 1.4; min-height: 32px;">${s.desc}</div>
                    <div style="font-size: 11.5px; font-weight: bold; color: #34d399; background: #052e16; padding: 4px 8px; border-radius: 6px; display: inline-block;">
                        효과: ${s.effect}
                    </div>
                </div>
                <button onclick="upgradeStat('${s.key}')" ${playerSP <= 0 ? 'disabled' : ''} 
                        style="width: 100%; padding: 10px; margin-top: 4px;
                               background: ${playerSP > 0 ? 'linear-gradient(135deg, #4f46e5, #3730a3)' : '#1e293b'}; 
                               color: ${playerSP > 0 ? '#fff' : '#64748b'}; 
                               border: 1px solid ${playerSP > 0 ? '#4f46e5' : '#334155'}; 
                               border-radius: 8px; font-weight: bold; font-size: 13px;
                               cursor: ${playerSP > 0 ? 'pointer' : 'not-allowed'}; 
                               box-shadow: ${playerSP > 0 ? '0 4px 10px rgba(79,70,229,0.3)' : 'none'}; transition: all 0.2s;">
                    스탯 강화 (SP 1 소모)
                </button>
            </div>
        `;
    });
}

// --- 유틸리티 함수 ---
const AudioSynth = {
    ctx: null,
    init() { if (!this.ctx) { this.ctx = new (window.AudioContext || window.webkitAudioContext)(); } },
    playTick() {
        this.init(); let osc = this.ctx.createOscillator(); let g = this.ctx.createGain();
        osc.type = 'sine'; osc.frequency.setValueAtTime(500, this.ctx.currentTime);
        g.gain.setValueAtTime(0.03, this.ctx.currentTime); g.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.04);
        osc.connect(g); g.connect(this.ctx.destination); osc.start(); osc.stop(this.ctx.currentTime + 0.05);
    },
    playCoin() {
        this.init(); let now = this.ctx.currentTime;
        [880, 1200].forEach((f, i) => {
            let osc = this.ctx.createOscillator(); let g = this.ctx.createGain();
            osc.frequency.setValueAtTime(f, now + i * 0.05); g.gain.setValueAtTime(0.05, now + i * 0.05);
            g.gain.exponentialRampToValueAtTime(0.001, now + i * 0.05 + 0.12);
            osc.connect(g); g.connect(this.ctx.destination); osc.start(now + i * 0.05); osc.stop(now + i * 0.05 + 0.15);
        });
    },
    playWin() {
        this.init(); let now = this.ctx.currentTime;
        [523.25, 659.25, 783.99].forEach((f, i) => {
            let osc = this.ctx.createOscillator(); let g = this.ctx.createGain();
            osc.frequency.setValueAtTime(f, now + i * 0.07); g.gain.setValueAtTime(0.08, now + i * 0.07);
            g.gain.exponentialRampToValueAtTime(0.001, now + i * 0.07 + 0.25);
            osc.connect(g); g.connect(this.ctx.destination); osc.start(now + i * 0.07); osc.stop(now + i * 0.07 + 0.3);
        });
    },
    playLose() {
        this.init(); let osc = this.ctx.createOscillator(); let g = this.ctx.createGain();
        osc.type = 'triangle'; osc.frequency.setValueAtTime(150, this.ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(70, this.ctx.currentTime + 0.35);
        g.gain.setValueAtTime(0.1, this.ctx.currentTime); g.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.35);
        osc.connect(g); g.connect(this.ctx.destination); osc.start(); osc.stop(this.ctx.currentTime + 0.35);
    }
};

function showToast(message, type = 'success') {
    const existing = document.querySelector('.purchase-toast');
    if (existing) existing.remove();
    
    const toast = document.createElement('div');
    toast.className = 'purchase-toast';
    
    let bgColor = '#052e16', borderColor = '#10b981', textColor = '#10b981', emoji = '💫 ';
    if (type === 'destroy' || type === 'fail') {
        bgColor = '#450a0a'; borderColor = '#ef4444'; textColor = '#f87171'; emoji = '🔥 ';
    } else if (type === 'maintain') {
        bgColor = '#1e3a8a'; borderColor = '#60a5fa'; textColor = '#60a5fa'; emoji = '🌟 ';
    }
    
    toast.style.background = bgColor;
    toast.style.borderColor = borderColor;
    toast.style.color = textColor;
    toast.style.bottom = '95px';
    toast.innerHTML = emoji + message;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        if (toast && toast.parentNode) {
            toast.style.transition = 'all 0.25s ease';
            toast.style.opacity = '0';
            setTimeout(() => {
                if (toast.parentNode) toast.parentNode.removeChild(toast);
            }, 200);
        }
    }, 2200);
}

function showAlert(message) {
    const modal = document.getElementById('custom-alert-modal');
    const msgEl = document.getElementById('custom-alert-message');
    if (!modal || !msgEl) { alert(message); return; }
    msgEl.innerHTML = message;
    modal.style.display = 'flex';
}

function closeCustomAlert() {
    const modal = document.getElementById('custom-alert-modal');
    if (modal) modal.style.display = 'none';
}

function appendLogRecord(title, profit, styleClass) {
    const ul = document.getElementById("history-items-ul");
    if (!ul) return;
    if (ul.innerText.includes("존재하지 않습니다")) ul.innerHTML = "";
    let li = document.createElement("li");
    li.innerHTML = `<span>${title}</span> <span style="${styleClass}">${profit}</span>`;
    ul.insertBefore(li, ul.firstChild);
    while (ul.children.length > 12) ul.removeChild(ul.lastChild);
}

function getBonusBreakdownHTML(gameType) {
    const mapping = {
        'ladder': ['hat','card'], '사다리': ['hat','card'],
        'blackjack': ['top','card'], '블랙잭': ['top','card'],
        'stock': ['pants','card'], '주식': ['pants','card'],
        'coin': ['shoes','card'], '코인': ['shoes','card'],
        'toto': ['gloves','card'], '토토': ['gloves','card'],
        'roulette': ['card'], '룰렛': ['card'],
        'arena': ['card'], '투기장': ['card']
    };
    const slots = mapping[gameType] || [];
    let html = '';
    
    if (typeof getEquipDisplayName === 'function' && typeof getEquipmentProfitRate === 'function') {
        slots.forEach(s => {
            const item = equipment[s];
            if (item && item.level > 0) {
                html += `<div style="font-size:11px;color:#64748b;">• ${getEquipDisplayName(s)||s} <span style="color:#4ade80;">+${(getEquipmentProfitRate(s)*100).toFixed(2)}%</span></div>`;
            }
        });
        const setR = typeof getSetBonusRate === 'function' ? getSetBonusRate() : 0;
        if (setR > 0) html += `<div style="font-size:11px;color:#fbbf24;margin-top:2px;">• 세트 보너스 <span style="color:#4ade80;">+${(setR*100).toFixed(1)}%</span></div>`;
    }

    if (gameType === 'toto' || gameType === '토토') {
        if (playerStats.int > 0) html += `<div style="font-size:11px;color:#c4b5fd;margin-top:2px;">• 🧠 분석력(INT) 스탯 <span style="color:#4ade80;">+${(playerStats.int * 0.15).toFixed(2)}%</span></div>`;
    } else if (['ladder', 'blackjack', 'roulette', 'arena', '사다리', '블랙잭', '룰렛'].includes(gameType)) {
        if (playerStats.luk > 0) html += `<div style="font-size:11px;color:#c4b5fd;margin-top:2px;">• 🍀 행운(LUK) 스탯 <span style="color:#4ade80;">+${(playerStats.luk * 0.05).toFixed(2)}%</span></div>`;
    }
    
    return html || '<div style="font-size:11px;color:#64748b;">보너스 기여 항목 없음</div>';
}

function showClaimWinningsModal(opts) {
    const {
        title = '🎉 수령 확인', betLabel = '배팅 금액', betAmount = 0, multiplier = 1.0,
        grossAmount = 0, bonusAmount = 0, finalAmount = 0, profitAmount = 0,
        onClaim = null, gameTypeForBreakdown = null
    } = opts || {};

    const modal = document.createElement('div');
    modal.style.cssText = `position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.88);display:flex;align-items:center;justify-content:center;z-index:999999;`;

    const profitColor = profitAmount >= 0 ? '#10b981' : '#ef4444';
    const profitSign = profitAmount >= 0 ? '+' : '';

    let bonusHTML = bonusAmount > 0 ? `
        <div style="display:flex; justify-content:space-between; font-size:14px; margin-bottom:6px;">
            <span style="color:#4ade80;">⭐ 장비 & 스탯 보너스</span>
            <span style="font-weight:bold; color:#4ade80;">₩ +${bonusAmount.toLocaleString()}</span>
        </div>` : '';

    let breakdownHTML = '';
    if (gameTypeForBreakdown && bonusAmount > 0) {
        breakdownHTML = `
            <div style="margin-top:10px; padding-top:8px; border-top:1px solid #1e293b;">
                <div style="font-size:12px; color:#fbbf24; font-weight:700; margin-bottom:4px;">보너스 출처</div>
                ${getBonusBreakdownHTML(gameTypeForBreakdown)}
            </div>`;
    }

    modal.innerHTML = `
        <div style="background: linear-gradient(145deg, #0f172a, #020617); border: 3px solid #334155; border-radius: 20px; padding: 26px 24px; max-width: 420px; width: 92%; color: #f1f5f9; box-shadow: 0 20px 60px rgba(0,0,0,0.7);">
            <div style="text-align:center; margin-bottom:18px;">
                <div style="font-size:20px; font-weight:900; color:#fbbf24;">${title}</div>
                <div style="font-size:14px; color:#94a3b8; margin-top:4px;">${betLabel} ₩${betAmount.toLocaleString()} × ${multiplier.toFixed(2)}</div>
            </div>
            <div style="background:#020617; border-radius:12px; padding:16px; margin-bottom:18px; border:1px solid #1e293b;">
                <div style="display:flex; justify-content:space-between; font-size:14px; margin-bottom:8px;">
                    <span style="color:#64748b;">총 당첨 금액</span><span style="font-weight:bold;">₩ ${grossAmount.toLocaleString()}</span>
                </div>
                ${bonusHTML}
                <div style="display:flex; justify-content:space-between; font-size:15px; font-weight:900; margin-top:8px; padding-top:8px; border-top:1px solid #334155;">
                    <span>실수령액</span><span style="color:#10b981;">₩ ${finalAmount.toLocaleString()}</span>
                </div>
                ${breakdownHTML}
            </div>
            <div style="text-align:center; margin-bottom:22px;">
                <div style="font-size:13px; color:#64748b;">예상 순이익</div>
                <div style="font-size:22px; font-weight:900; color:${profitColor}; margin-top:2px;">
                    ₩ ${profitSign}${Math.abs(profitAmount).toLocaleString()}
                </div>
            </div>
            <div style="display:flex; gap:12px;">
                <button id="claim-confirm-btn" style="width:100%; padding:16px 0; background:linear-gradient(135deg, #059669, #047857); color:white; border:none; border-radius:12px; font-size:17px; font-weight:900; cursor:pointer; box-shadow: 0 6px 15px rgba(16,185,129,0.4);">💰 당첨금 수령하기</button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    let isClaimed = false;
    modal.querySelector('#claim-confirm-btn').onclick = () => {
        if (isClaimed) return; 
        isClaimed = true; 
        
        modal.remove();
        if (typeof onClaim === 'function') onClaim();
        
        let expGained = 0;
        if (gameTypeForBreakdown === 'ladder') expGained = 10;
        if (gameTypeForBreakdown === 'blackjack') expGained = multiplier > 2.0 ? 20 : 10;
        if (gameTypeForBreakdown === 'roulette') expGained = multiplier >= 36 ? 150 : (multiplier >= 3 ? 20 : 10);
        if (gameTypeForBreakdown === 'toto') expGained = 50;
        
        if (expGained > 0) addExp(expGained);
    };
}

function showSellConfirmModal(type, assetName, qty, buyPrice, sellPrice, onConfirm) {
    const unit = (type === 'stock') ? '주' : '개';
    const gross = Math.floor(qty * sellPrice);
    
    const baseFeeRate = 0.02; 
    const intBonus = (typeof playerStats !== 'undefined' ? playerStats.int : 0) * 0.00005; 
    const finalFeeRate = Math.max(0.005, baseFeeRate - intBonus); 
    const fee = Math.floor(gross * finalFeeRate);
    
    const net = gross - fee;
    const cost = Math.floor(qty * buyPrice);
    const profit = net - cost;

    const gameType = (type === 'stock') ? 'stock' : 'coin';
    const profitBonus = (profit > 0 && typeof applyProfitBonus === 'function') ? applyProfitBonus(profit, gameType) : 0;
    const finalNet = net + profitBonus;

    const modal = document.createElement('div');
    modal.style.cssText = `position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.88);display:flex;align-items:center;justify-content:center;z-index:999999;`;

    const profitColor = profit >= 0 ? '#10b981' : '#ef4444';
    const profitSign = profit >= 0 ? '+' : '-';

    let bonusHTML = profitBonus > 0 ? `
        <div style="display:flex; justify-content:space-between; font-size:14px; margin:6px 0; padding-top:6px; border-top:1px dashed #334155;">
            <span style="color:#4ade80;">⭐ 장비 보너스</span><span style="font-weight:bold; color:#4ade80;">₩ +${profitBonus.toLocaleString()}</span>
        </div>` : '';
        
    let intEffectHTML = playerStats.int > 0 ? ` <span style="font-size:11px; color:#c4b5fd;">(INT 적용: ${(finalFeeRate*100).toFixed(2)}%)</span>` : ' (2%)';

    modal.innerHTML = `
        <div style="background: linear-gradient(145deg, #0f172a, #020617); border: 3px solid #334155; border-radius: 20px; padding: 26px 24px; max-width: 420px; width: 92%; color: #f1f5f9; box-shadow: 0 20px 60px rgba(0,0,0,0.7);">
            <div style="text-align:center; margin-bottom:18px;">
                <div style="font-size:20px; font-weight:900; color:#fbbf24;">💰 매도 확인</div>
                <div style="font-size:15px; color:#94a3b8; margin-top:4px;">${assetName} × ${qty}${unit}</div>
            </div>
            <div style="background:#020617; border-radius:12px; padding:16px; margin-bottom:18px; border:1px solid #1e293b;">
                <div style="display:flex; justify-content:space-between; font-size:14px; margin-bottom:8px;">
                    <span style="color:#64748b;">구매 단가</span><span style="font-weight:bold;">₩ ${Math.floor(buyPrice).toLocaleString()}</span>
                </div>
                <div style="display:flex; justify-content:space-between; font-size:14px; margin-bottom:8px;">
                    <span style="color:#64748b;">판매 단가</span><span style="font-weight:bold; color:#fbbf24;">₩ ${Math.floor(sellPrice).toLocaleString()}</span>
                </div>
                <div style="height:1px; background:#1e293b; margin:10px 0;"></div>
                <div style="display:flex; justify-content:space-between; font-size:14px; margin-bottom:6px;">
                    <span style="color:#64748b;">총 매도 금액</span><span style="font-weight:bold;">₩ ${gross.toLocaleString()}</span>
                </div>
                <div style="display:flex; justify-content:space-between; font-size:14px; margin-bottom:6px;">
                    <span style="color:#ef4444;">수수료${intEffectHTML}</span><span style="font-weight:bold; color:#ef4444;">₩ -${fee.toLocaleString()}</span>
                </div>
                ${bonusHTML}
                <div style="display:flex; justify-content:space-between; font-size:15px; font-weight:900; margin-top:8px; padding-top:8px; border-top:1px solid #334155;">
                    <span>실수령액</span><span style="color:#10b981;">₩ ${finalNet.toLocaleString()}</span>
                </div>
            </div>
            <div style="text-align:center; margin-bottom:22px;">
                <div style="font-size:13px; color:#64748b;">예상 손익 (보너스 포함)</div>
                <div style="font-size:22px; font-weight:900; color:${profitColor}; margin-top:2px;">
                    ₩ ${profitSign}${Math.abs(profit + profitBonus).toLocaleString()}
                </div>
            </div>
            <div style="display:flex; gap:12px;">
                <button id="sell-cancel-btn" style="flex:1; padding:14px 0; background:#334155; color:#cbd5e1; border:none; border-radius:12px; font-size:16px; font-weight:bold; cursor:pointer;">취소</button>
                <button id="sell-confirm-btn" style="flex:1; padding:14px 0; background:linear-gradient(135deg, #059669, #047857); color:white; border:none; border-radius:12px; font-size:16px; font-weight:900; cursor:pointer;">수령하기</button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    let isConfirmed = false; // ✨ 광클 복사 방지용 플래그
    modal.querySelector('#sell-cancel-btn').onclick = () => modal.remove();
    modal.querySelector('#sell-confirm-btn').onclick = () => {
        if (isConfirmed) return;
        isConfirmed = true; // ✨ 1회 실행 후 잠금
        
        modal.remove();
        if (typeof onConfirm === 'function') onConfirm();
    };
    modal.onclick = (e) => { if (e.target === modal) modal.remove(); };
}

function showAmountInputModal(options) {
    const existing = document.getElementById('amount-input-modal');
    if (existing) existing.remove();

    const modal = document.createElement('div');
    modal.id = 'amount-input-modal';
    modal.style.cssText = `position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);background:linear-gradient(135deg,#052e16,#064e3b);border:3px solid ${options.confirmColor};border-radius:18px;padding:26px 30px;z-index:999999;box-shadow:0 15px 50px rgba(0,0,0,0.75);min-width:300px;text-align:center;color:#fff;`;

    modal.innerHTML = `
        <div style="font-size:20px;font-weight:900;margin-bottom:8px;">${options.title}</div>
        <div style="font-size:13px;color:#94a3b8;margin-bottom:16px;line-height:1.4;">${options.subtitle}</div>
        <input type="number" id="amount-modal-input" class="cash-input-box" value="100000" min="${options.minAmount}" step="10000" style="width:100%;margin-bottom:8px;font-size:20px;text-align:center;">
        <div style="display:flex;gap:10px;justify-content:center;margin-top:12px;">
            <button id="amount-modal-cancel" style="flex:1;padding:13px;background:#334155;color:#fff;border:none;border-radius:10px;font-weight:bold;font-size:15px;cursor:pointer;">취소</button>
            <button id="amount-modal-confirm" style="flex:1;padding:13px;background:${options.confirmColor};color:#fff;border:none;border-radius:10px;font-weight:900;font-size:15px;cursor:pointer;">${options.confirmText}</button>
        </div>
    `;
    document.body.appendChild(modal);

    const input = modal.querySelector('#amount-modal-input');
    const confirmBtn = modal.querySelector('#amount-modal-confirm');
    const cancelBtn = modal.querySelector('#amount-modal-cancel');

    const moneyChips = [
        { label: '+1만', val: 10000, color: '#475569' },
        { label: '+10만', val: 100000, color: '#3b82f6' },
        { label: '+100만', val: 1000000, color: '#10b981' },
        { label: '+1000만', val: 10000000, color: '#8b5cf6' },
        { label: '+1억', val: 100000000, color: '#f59e0b' },
        { label: '+10억', val: 1000000000, color: '#ef4444' },
        { label: '+100억', val: 10000000000, color: '#0f172a', border: '#fbbf24' }
    ];

    // ✨ MAX 버튼 동적 추가
    if (options.maxAmount !== undefined) {
        moneyChips.push({ label: 'MAX', isMax: true, color: '#991b1b', border: '#ef4444' });
    }

    createChipUI(input, moneyChips, options.maxAmount);

    input.focus();
    input.select();

    const closeModal = () => modal.remove();

    let isProcessed = false; 
    confirmBtn.onclick = () => {
        if (isProcessed) return;
        
        const val = parseInt(input.value) || 0;
        if (val < options.minAmount) { showAlert(`최소 ${options.minAmount.toLocaleString()}원부터 가능합니다.`); return; }
        
        isProcessed = true; 
        closeModal();
        options.callback(val);
    };

    cancelBtn.onclick = closeModal;
    input.onkeypress = (e) => { if (e.key === 'Enter') confirmBtn.click(); };
}

// ✨ 칩스 UI 공통 생성 엔진 (입력창 하단에 동적 생성)
function createChipUI(inputElement, chipConfig, maxAmount = undefined) {
    if (!inputElement || (inputElement.nextElementSibling && inputElement.nextElementSibling.classList.contains('chip-container'))) return;

    const container = document.createElement('div');
    container.className = 'chip-container';
    container.style.cssText = 'display: flex; gap: 5px; flex-wrap: wrap; margin-top: 6px; margin-bottom: 12px; justify-content: flex-end;';

    const resetBtn = document.createElement('button');
    resetBtn.type = 'button';
    resetBtn.innerText = '정정(0)';
    resetBtn.style.cssText = 'background:#1e293b; color:#94a3b8; border:1px solid #334155; border-radius:6px; padding:6px 10px; font-size:11px; font-weight:bold; cursor:pointer; margin-right:auto; transition:background 0.1s;';
    resetBtn.onmousedown = () => resetBtn.style.background = '#334155';
    resetBtn.onmouseup = () => resetBtn.style.background = '#1e293b';
    resetBtn.onclick = () => {
        inputElement.value = 0;
        inputElement.dispatchEvent(new Event('input'));
        if (inputElement.id === 'direct-shares-input' && typeof updateDirectSharesPreview === 'function') updateDirectSharesPreview();
        if (inputElement.id === 'coin-direct-amount-input' && typeof updateCoinDirectPreview === 'function') updateCoinDirectPreview();
    };
    container.appendChild(resetBtn);

    chipConfig.forEach(chip => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.innerText = chip.label;
        const borderCSS = chip.border ? `border: 1px solid ${chip.border};` : `border: none;`;
        btn.style.cssText = `background:${chip.color}; color:#fff; ${borderCSS} border-radius:6px; padding:6px 10px; font-size:11.5px; font-weight:900; cursor:pointer; box-shadow:0 3px 6px rgba(0,0,0,0.4); text-shadow:0 1px 2px rgba(0,0,0,0.6); transition:transform 0.1s, filter 0.1s;`;
        
        btn.onmousedown = () => { btn.style.transform = 'scale(0.92)'; btn.style.filter = 'brightness(1.15)'; };
        btn.onmouseup = () => { btn.style.transform = 'scale(1)'; btn.style.filter = 'brightness(1)'; };
        btn.onmouseleave = () => { btn.style.transform = 'scale(1)'; btn.style.filter = 'brightness(1)'; };
        
        btn.onclick = () => {
            // ✨ MAX 버튼을 눌렀을 때의 동작 처리
            if (chip.isMax && maxAmount !== undefined) {
                inputElement.value = maxAmount;
            } else {
                const currentVal = parseInt(inputElement.value) || 0;
                inputElement.value = currentVal + chip.val;
            }
            inputElement.dispatchEvent(new Event('input')); 
            
            if (inputElement.id === 'direct-shares-input' && typeof updateDirectSharesPreview === 'function') updateDirectSharesPreview();
            if (inputElement.id === 'coin-direct-amount-input' && typeof updateCoinDirectPreview === 'function') updateCoinDirectPreview();
        };
        container.appendChild(btn);
    });

    inputElement.parentNode.insertBefore(container, inputElement.nextSibling);
}

// ✨ 모든 고정 입력란에 칩스 시스템 부착
function initChipButtons() {
    const moneyChips = [
        { label: '+1만', val: 10000, color: '#475569' },
        { label: '+10만', val: 100000, color: '#3b82f6' },
        { label: '+100만', val: 1000000, color: '#10b981' },
        { label: '+1000만', val: 10000000, color: '#8b5cf6' },
        { label: '+1억', val: 100000000, color: '#f59e0b' },
        { label: '+10억', val: 1000000000, color: '#ef4444' },
        { label: '+100억', val: 10000000000, color: '#0f172a', border: '#fbbf24' }
    ];

    const tradeChips = [
        { label: '+10', val: 10, color: '#475569' },
        { label: '+50', val: 50, color: '#3b82f6' },
        { label: '+100', val: 100, color: '#10b981' },
        { label: '+500', val: 500, color: '#8b5cf6' },
        { label: '+1천', val: 1000, color: '#f59e0b' },
        { label: '+1만', val: 10000, color: '#ef4444' }
    ];

    // 룰렛 숫자 입력창(#roulette-number-input) 예외 처리 추가
    const cashInputs = document.querySelectorAll('.cash-input-box:not(#amount-modal-input):not(#ddakji-bet-input):not(#roulette-number-input)');
    cashInputs.forEach(input => createChipUI(input, moneyChips));

    const tradeInputs = document.querySelectorAll('.trade-input');
    tradeInputs.forEach(input => createChipUI(input, tradeChips));
}