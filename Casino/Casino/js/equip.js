// ============================================================
// js/equip.js
// 장비 시스템, 수익률 보너스, 세트 효과 및 강화(스타캐치) 로직
// ============================================================

function getEnhanceCost(level, tier = 1) {
    if (level >= 25) return 0;
    const base = Math.floor(25000 * (level + 1) * (1 + level * 0.08));
    const tierInfo = TIER_DATA[tier] || TIER_DATA[1];
    const costMultiplier = tierInfo.multiplier || 1;
    return Math.floor(base * costMultiplier);
}

function getEvolutionCost(itemKey) {
    const item = equipment[itemKey];
    if (!item || item.level < 25) return 0;
    const tier = item.tier || 1;
    if (tier >= 11) return 0; 
    
    const evolutionMultipliers = [0, 6, 10, 16, 25, 38, 55, 80, 120, 180, 300];
    const baseCost = getEnhanceCost(24, tier); 
    return Math.floor(baseCost * (evolutionMultipliers[tier] || 1));
}

function calculateEquipPower() {
    let total = 0;
    Object.values(equipment).forEach(item => { total += item.level; });
    return total;
}

function getEquipmentProfitRate(itemKey) {
    const item = equipment[itemKey];
    if (!item) return 0;
    if (itemKey === 'shoulder') return 0; // 견장은 수익률 없음

    const tier = item.tier || 1;
    const tierInfo = TIER_DATA[tier] || TIER_DATA[1];
    const multiplier = tierInfo.multiplier || 1.0;

    // ✨ 밸런스 패치: 티어가 올라갈수록 기본 깡스탯과 성장치가 대폭 상승합니다!
    const base = 0.007 + ((tier - 1) * 0.015);      // 티어당 1.5%p 기본 수익률 추가
    const perLevel = 0.0009 + ((tier - 1) * 0.0002); // 티어당 레벨업 성장치 0.02%p 추가
    
    return (base + (item.level * perLevel)) * multiplier;
}

function getEquipDisplayName(itemKey) {
    const item = equipment[itemKey];
    if (!item) return "";
    const tierInfo = TIER_DATA[item.tier] || TIER_DATA[1];
    return tierInfo.name + item.baseName;
}

function getSetBonusRate() {
    const items = Object.values(equipment);
    const tiers = items.map(item => item.tier || 1);
    const uniqueTiers = new Set(tiers);

    if (uniqueTiers.size > 1) return 0;

    const currentTier = tiers[0]; 
    const levels = items.map(item => item.level || 0);
    const minLevel = levels.length > 0 ? Math.min(...levels) : 0;

    let baseBonus = 0;
    if (minLevel >= 25) baseBonus = 0.09;      
    else if (minLevel >= 20) baseBonus = 0.05;      
    else if (minLevel >= 10) baseBonus = 0.025;     
    else baseBonus = 0;

    // ✨ 밸런스 패치: 티어당 세트 보너스 추가치를 0.9%에서 5%로 대폭 상향 (제한선 해제)
    const tierBonus = (currentTier - 1) * 0.05; 
    return baseBonus + tierBonus;
}

function getGameProfitRate(game) {
    const mapping = {
        'ladder': ['hat', 'card'], '사다리': ['hat', 'card'],
        'blackjack': ['top', 'card'], '블랙잭': ['top', 'card'],
        'stock': ['pants', 'card'], '주식': ['pants', 'card'],
        'coin': ['shoes', 'card'], '코인': ['shoes', 'card'],
        'toto': ['gloves', 'card'], '토토': ['gloves', 'card'],
        'roulette': ['card'], '룰렛': ['card']
    };
    const keys = mapping[game] || [];
    let rate = 0;
    keys.forEach(k => { rate += getEquipmentProfitRate(k); });
    rate += getSetBonusRate();
    return rate;
}

function calculateTotalProfitRate() {
    let total = 0;
    Object.keys(equipment).forEach(key => { total += getEquipmentProfitRate(key); });
    total += getSetBonusRate();
    return total;
}

function getTotalProfitRatePercent() {
    return (calculateTotalProfitRate() * 100).toFixed(2);
}

function renderProfitStatsPanel() {
    const container = document.getElementById('equip-profit-stats-list');
    if (!container) return;

    const gameStats = [
        { game: '사다리', items: ['hat', 'card'], itemNames: '모자 + 카드 + 세트', icon: '🎰' },
        { game: '블랙잭', items: ['top', 'card'], itemNames: '상의 + 카드 + 세트', icon: '🃏' },
        { game: '주식', items: ['pants', 'card'], itemNames: '하의 + 카드 + 세트', icon: '📈' },
        { game: '코인', items: ['shoes', 'card'], itemNames: '신발 + 카드 + 세트', icon: '🪙' },
        { game: '토토', items: ['gloves', 'card'], itemNames: '장갑 + 카드 + 세트', icon: '⚽' }
    ];

    let html = '';
    gameStats.forEach(stat => {
        const gameRate = getGameProfitRate(stat.game);
        const percent = (gameRate * 100).toFixed(2);
        const color = gameRate > 0 ? '#4ade80' : '#64748b';

        html += `
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:5px; padding:3px 0; border-bottom:1px solid #1e293b;">
                <div style="flex:1;">
                    <span style="font-weight:700; color:#f1f5f9;">${stat.icon} ${stat.game}</span>
                    <span style="font-size:11px; color:#64748b; margin-left:6px;">(${stat.itemNames})</span>
                </div>
                <span style="font-weight:900; color:${color}; min-width:58px; text-align:right;">${percent}%</span>
            </div>
        `;
    });
    container.innerHTML = html;
}

function renderSetBonusPanel() {
    const container = document.getElementById('equip-set-bonus-list');
    if (!container) return;

    const equipKeys = ['hat', 'top', 'pants', 'shoes', 'gloves', 'shoulder', 'card'];
    const items = equipKeys.map(k => ({ key: k, ...equipment[k] }));
    
    const levels = items.map(i => i.level || 0);
    const minLevel = levels.length > 0 ? Math.min(...levels) : 0;
    const tiers = items.map(i => i.tier || 1);
    const uniqueTiers = new Set(tiers);
    const isSetActive = uniqueTiers.size === 1 && levels.length === 7;

    let currentTier = 1;
    let tierName = "도박꾼의 세트";
    let setBonusPercent = "0.0";

    if (isSetActive) {
        currentTier = tiers[0];
        const tierNames = {
            1: "도박꾼의 세트", 2: "승부사의 세트", 3: "허슬러의 세트",
            4: "타짜의 세트", 5: "마스터의 세트", 6: "거물의 세트",
            7: "랭커의 세트", 8: "VIP의 세트", 9: "챔피언의 세트",
            10: "킹의 세트", 11: "레전드의 세트"
        };
        tierName = tierNames[currentTier] || "알 수 없는 세트";
        setBonusPercent = (getSetBonusRate() * 100).toFixed(1);
    }

    let activeBracket = '0-9';
    if (minLevel >= 25) activeBracket = '25';
    else if (minLevel >= 20) activeBracket = '20-24';
    else if (minLevel >= 10) activeBracket = '10-19';

    let html = `
    <div style="background: linear-gradient(145deg, #0a0f1c, #020617); border: ${isSetActive ? '2px solid #fbbf24' : '1px solid #334155'}; border-radius: 18px; padding: 16px 15px 14px; box-shadow: ${isSetActive ? '0 0 20px rgba(251,191,36,0.25), 0 12px 30px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.08)' : '0 8px 20px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.04)'}; position: relative; overflow: hidden; transition: all 0.4s cubic-bezier(0.23, 1, 0.32, 1);">
        ${isSetActive ? `<div style="position: absolute; top: -50%; left: -100%; width: 40%; height: 200%; background: linear-gradient(90deg, transparent, rgba(251,191,36,0.35), transparent); animation: setShine 2.8s infinite linear; pointer-events: none;"></div>` : ''}

        <div style="display:flex; align-items:center; gap:10px; margin-bottom:12px; padding-bottom:10px; border-bottom:1px solid #1e293b;">
            <div style="font-size:15px; font-weight:900; color:#fbbf24; display:flex; align-items:center; gap:6px;">
                🛡️ 세트 보너스 ${isSetActive ? `<span style="font-size:11px; background:#052e16; color:#10b981; padding:1px 7px; border-radius:999px; font-weight:800;">완성</span>` : ''}
            </div>
            <div style="flex:1;"></div>
            <div style="text-align:right;">
                <div style="font-size:24px; font-weight:900; color:${isSetActive ? '#fbbf24' : '#4ade80'}; line-height:1; text-shadow:0 0 10px rgba(251,191,36,0.4);">+${setBonusPercent}%</div>
                <div style="font-size:10px; color:#64748b; margin-top:1px; font-weight:700;">${tierName}</div>
            </div>
        </div>
        <div style="display:flex; gap:16px; margin-bottom:8px; justify-content:center; flex-wrap:wrap; padding:4px 2px;">
    `;

    items.forEach(item => {
        const isCurrentTier = item.tier === currentTier;
        const tierColor = item.tier >= 10 ? '#ef4444' : item.tier >= 7 ? '#fbbf24' : item.tier >= 4 ? '#34d399' : '#94a3b8';
        const borderColor = isSetActive && isCurrentTier ? '#fbbf24' : '#475569';
        const glow = isSetActive && isCurrentTier ? '0 0 14px rgba(251,191,36,0.65), 0 4px 10px rgba(0,0,0,0.5)' : '0 3px 8px rgba(0,0,0,0.4)';

        html += `
            <div onclick="selectEquipSlot('${item.key}');" 
                 style="background: #0f172a; border: 2.5px solid ${borderColor}; border-radius: 13px; padding: 7px 5px 6px; width: 58px; text-align: center; cursor: pointer; transition: all 0.25s cubic-bezier(0.23, 1, 0.32, 1); box-shadow: ${glow}; position: relative;"
                 onmouseenter="this.style.transform='translateY(-3px) scale(1.03)'; this.style.borderColor='#64748b'"
                 onmouseleave="this.style.transform='translateY(0) scale(1)'; this.style.borderColor='${borderColor}'">
                <div style="position:absolute; top:-2px; right:-2px; background:${tierColor}; color:#fff; font-size:8px; font-weight:900; padding:1px 5px; border-radius:0 11px 0 7px; line-height:1.1; box-shadow:0 1px 2px rgba(0,0,0,0.35);">${item.tier}티어</div>
                <div style="font-size:24px; line-height:1; margin:2px 0 5px; filter: drop-shadow(0 2px 3px rgba(0,0,0,0.55));">${item.icon}</div>
                <div style="font-size:10.5px; font-weight:900; color:#e0e7ff; letter-spacing:-0.3px; background:rgba(0,0,0,0.3); padding:1px 6px; border-radius:6px; display:inline-block; min-width:30px;">${item.level || 0}성</div>
            </div>
        `;
    });

    html += `</div>`;
    if (isSetActive) {
        html += `<div style="margin: 0px 10px 10px; height: 3.5px; background: repeating-linear-gradient(90deg, #fbbf24 0px, #fbbf24 4px, transparent 4px, transparent 12px); border-radius: 3px; opacity: 0.7; box-shadow: 0 0 5px rgba(251,191,36,0.35);"></div>`;
    }

    html += `<div style="display:flex; flex-direction:column; gap:6px;">`;
    const brackets = [
        { key: '0-9',   label: '0~9성',   bonus: '0',   fill: 0,   barColor: '#475569', activeColor: '#64748b' },
        { key: '10-19', label: '10~19성', bonus: '2.5', fill: 42,  barColor: '#166534', activeColor: '#4ade80' },
        { key: '20-24', label: '20~24성', bonus: '5',   fill: 68,  barColor: '#854d0e', activeColor: '#fbbf24' },
        { key: '25',    label: '25성',    bonus: '9',   fill: 100, barColor: '#7f1d1d', activeColor: '#f87171' }
    ];

    brackets.forEach(br => {
        const isActive = isSetActive && activeBracket === br.key;
        const displayFill = isActive ? 100 : br.fill;
        html += `
            <div style="display:flex; align-items:center; gap:8px; ${isActive ? 'transform: translateX(1px);' : ''}">
                <div style="width:58px; font-size:11px; font-weight:800; color:${isActive ? '#e0e7ff' : '#64748b'}; flex-shrink:0;">${br.label}</div>
                <div style="flex:1; height:7px; background:#1e293b; border-radius:999px; overflow:hidden; border:1px solid #334155; position:relative;">
                    <div style="width:${displayFill}%; height:100%; background: linear-gradient(to right, ${isActive ? br.activeColor : br.barColor}, ${isActive ? '#f1f5f9' : '#475569'}); transition: width 0.5s cubic-bezier(0.23,1,0.32,1); box-shadow: ${isActive ? '0 0 8px ' + br.activeColor + ', inset 0 1px 0 rgba(255,255,255,0.4)' : 'none'};">
                        ${isActive ? `<div style="position:absolute; right:0; top:0; bottom:0; width:28%; background:linear-gradient(to right, transparent, rgba(255,255,255,0.5));"></div>` : ''}
                    </div>
                </div>
                <div style="width:46px; text-align:right; font-size:12.5px; font-weight:900; color:${isActive ? '#fbbf24' : '#94a3b8'}; flex-shrink:0;">+${br.bonus}%</div>
            </div>
        `;
    });

    html += `</div>`;
    if (isSetActive) {
        html += `<div style="margin-top:12px; padding-top:9px; border-top:1px solid #334155; font-size:11px; color:#10b981; text-align:center; font-weight:800;">✨ ${tierName} 완성! 모든 게임 수익률 대폭 상승</div>`;
    } else {
        html += `<div style="margin-top:12px; padding-top:9px; border-top:1px solid #1e293b; font-size:10.5px; color:#f87171; text-align:center; font-weight:700;">세트 효과 미적용 — 모든 장비를 <b>같은 티어</b>로 맞춰주세요</div>`;
    }

    html += `</div>`;
    container.innerHTML = html;
}

if (!document.getElementById('set-shine-style')) {
    const style = document.createElement('style');
    style.id = 'set-shine-style';
    style.innerHTML = `@keyframes setShine { 0% { left: -100%; } 25% { left: 300%; } 100% { left: 300%; } }`;
    document.head.appendChild(style);
}

function renderIndividualProfitList() {
    const container = document.getElementById('equip-individual-profit-list');
    if (!container) return;

    const items = [
        { key: 'hat',      game: '사다리',   icon: '🎩' },
        { key: 'top',      game: '블랙잭',   icon: '👕' },
        { key: 'pants',    game: '주식',     icon: '👖' },
        { key: 'shoes',    game: '코인',     icon: '👟' },
        { key: 'gloves',   game: '토토',     icon: '🧤' },
        { key: 'shoulder', game: '효과없음', icon: '🛡️' },
        { key: 'card',     game: '모든게임', icon: '🃏' }
    ];

    let html = '';
    items.forEach(item => {
        const equip = equipment[item.key];
        const level = equip ? equip.level : 0;
        const rate = getEquipmentProfitRate(item.key);
        const percent = (rate * 100).toFixed(2);
        const color = rate > 0 ? '#4ade80' : '#64748b';
        const displayName = getEquipDisplayName(item.key);

        html += `
            <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:5px; padding:3px 4px; background:#0a0f1c; border-radius:8px;">
                <div style="display:flex; align-items:center; gap:6px; flex:1; min-width:0;">
                    <span style="font-size:15px; flex-shrink:0;">${item.icon}</span>
                    <div style="min-width:0; flex:1;">
                        <div style="font-weight:700; color:#e2e8f0; font-size:12.5px; line-height:1.1;">${displayName}</div>
                        <div style="font-size:10px; color:#64748b;">${item.game}</div>
                    </div>
                </div>
                <div style="text-align:right; flex-shrink:0; margin-left:8px;">
                    <div style="font-weight:900; color:#fbbf24; font-size:13px; line-height:1;">${level}성</div>
                    <div style="font-weight:900; color:${color}; font-size:13.5px; line-height:1; margin-top:1px;">${percent}%</div>
                </div>
            </div>
        `;
    });
    container.innerHTML = html;
}

// ✨ 스탯 (LUK, INT) 및 컬렉션 시너지 보너스 적용
function applyProfitBonus(baseAmount, gameType = null) {
    let equipRate = gameType ? getGameProfitRate(gameType) : calculateTotalProfitRate();
    let statRate = 0;
    
    // 1. 스탯 보너스
    if (gameType === 'toto' || gameType === '주식' || gameType === '코인') {
        statRate = (typeof playerStats !== 'undefined' ? playerStats.int : 0) * 0.0015; // INT 당 0.15%
    } else if (['ladder', 'blackjack', 'roulette', 'arena', '투기장', '사다리', '룰렛'].includes(gameType)) {
        statRate = (typeof playerStats !== 'undefined' ? playerStats.luk : 0) * 0.0005; // LUK 당 0.05%
    }
    
    // 2. 컬렉션 시너지 보너스
    let synergyRate = 0;
    if (typeof getCollectionSynergyBuffs === 'function') {
        const buffs = getCollectionSynergyBuffs();
        if (['ladder', 'blackjack', 'roulette', '사다리', '블랙잭', '룰렛'].includes(gameType)) synergyRate += (buffs.casinoProfit / 100);
        if (['toto', 'arena', '토토', '투기장'].includes(gameType)) synergyRate += (buffs.totoArenaProfit / 100);
        if (['stock', 'coin', '주식', '코인'].includes(gameType)) synergyRate += (buffs.marketProfit / 100);
    }
    
    // 3. [신규] VVIP 경매장 유물 개별 보너스 적용
    let artifactRate = 0;
    if (typeof unlockedItems !== 'undefined') {
        // 스페인 황금 닻: 모든 게임 수익 +3%
        if (unlockedItems.includes("auc_014")) artifactRate += 0.03;
        // 칼리굴라 금화: 사다리 15%
        if (['ladder', '사다리'].includes(gameType) && unlockedItems.includes("auc_011")) artifactRate += 0.15;
        // 티치 나침반: 주식/코인 5%
        if (['stock', 'coin', '주식', '코인'].includes(gameType) && unlockedItems.includes("auc_013")) artifactRate += 0.05;
        // 연산군 피리: 블랙잭/룰렛 10%
        if (['blackjack', 'roulette', '블랙잭', '룰렛'].includes(gameType) && unlockedItems.includes("auc_017")) artifactRate += 0.10;
        // 아즈텍 석판: 투기장 15%
        if (['arena', '투기장'].includes(gameType) && unlockedItems.includes("auc_019")) artifactRate += 0.15;
    }
    
    return Math.floor(baseAmount * (equipRate + statRate + synergyRate + artifactRate));
}
   

function updateEquipPowerDisplay() {
    const totalEl = document.getElementById('equip-total-power');
    const avgEl = document.getElementById('equip-avg-level');
    
    if (!totalEl || !avgEl) return;
    
    const total = calculateEquipPower();
    const avg = (total / 7).toFixed(1);
    totalEl.innerText = total;
    avgEl.innerText = avg;

    if (typeof renderProfitStatsPanel === 'function') renderProfitStatsPanel();
    if (typeof renderIndividualProfitList === 'function') renderIndividualProfitList();
    if (typeof renderSetBonusPanel === 'function') renderSetBonusPanel();
    
    if (total >= 100) {
        totalEl.style.color = '#fbbf24';
        totalEl.style.textShadow = '0 0 8px rgba(251,191,36,0.5)';
    } else {
        totalEl.style.color = '#fbbf24';
        totalEl.style.textShadow = 'none';
    }
}

function getStarsHTML(level, size = 11) {
    const getStarColor = (filled, starIndex) => {
        if (!filled) return { fill: '#334155', stroke: '#1e293b' };
        if (level >= 25) return { fill: '#ef4444', stroke: '#b91c1c' };
        else if (level >= 20) return { fill: '#fbbf24', stroke: '#d97706' };
        else if (level >= 10) return { fill: '#34d399', stroke: '#059669' };
        else return { fill: '#e2e8f0', stroke: '#64748b' };
    };

    const svgStar = (filled, starIndex) => {
        const colors = getStarColor(filled, starIndex);
        const glow = (level >= 20 && filled) ? `filter: drop-shadow(0 0 3px ${level >= 25 ? '#ef4444' : '#fbbf24'});` : '';
        return `
            <svg width="${size}" height="${size}" viewBox="0 0 24 24" style="display:inline-block; vertical-align:middle; margin:0 1px; ${glow}">
                <defs>
                    <linearGradient id="starGrad${starIndex}" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stop-color="${colors.fill}"/>
                        <stop offset="100%" stop-color="${level >= 20 && filled ? (level >= 25 ? '#b91c1c' : '#d97706') : colors.fill}"/>
                    </linearGradient>
                </defs>
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill="url(#starGrad${starIndex})" stroke="${colors.stroke}" stroke-width="1.5" stroke-linejoin="round"/>
                ${level >= 20 && filled ? `<path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill="none" stroke="#fef08a" stroke-width="0.8" stroke-linejoin="round" opacity="0.6"/>` : ''}
            </svg>`;
    };
    
    let html = `<div style="display:flex; flex-direction:column; align-items:center; gap:3px;">`;
    html += `<div style="display:flex; gap:1.5px; justify-content:center;">`;
    for (let i = 0; i < 10; i++) html += svgStar(i < level, i);
    html += `</div><div style="display:flex; gap:1.5px; justify-content:center;">`;
    for (let i = 10; i < 20; i++) html += svgStar(i < level, i);
    html += `</div><div style="display:flex; gap:2px; justify-content:center;">`;
    for (let i = 20; i < 25; i++) html += svgStar(i < level, i);
    html += `</div></div>`;
    return html;
}

function getLevelColor(level) {
    if (level >= 20) return '#ef4444';
    if (level >= 10) return '#10b981';
    return '#94a3b8';
}

function renderEquipUI() {
    const grid = document.getElementById('equip-slots-grid');
    if (!grid) return;
    grid.innerHTML = '';
    
    Object.keys(equipment).forEach(key => {
        const item = equipment[key];
        const isSelected = currentSelectedEquipSlot === key;
        const div = document.createElement('div');
        
        let equipClass = 'equip-card';
        const tier = item.tier || 1;
        let borderColor = isSelected ? '#fbbf24' : '#475569';
        let boxShadow = isSelected 
            ? '0 10px 25px rgba(0,0,0,0.6), 0 0 0 1px rgba(251,191,36,0.3), inset 0 1px 0 rgba(255,255,255,0.08)' 
            : '0 6px 16px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)';

        if (item.level >= 25 || tier >= 8) {
            equipClass += ' equip-card-legend';
            borderColor = isSelected ? '#ef4444' : '#ef4444';
            boxShadow = isSelected 
                ? '0 15px 38px rgba(0,0,0,0.7), 0 0 0 2.5px rgba(239,68,68,0.7), 0 0 28px rgba(251,191,36,0.45), inset 0 1px 0 rgba(255,255,255,0.12)' 
                : '0 12px 30px rgba(0,0,0,0.6), 0 0 0 2px rgba(239,68,68,0.55), 0 0 22px rgba(251,191,36,0.3), inset 0 1px 0 rgba(255,255,255,0.08)';
        } else if (item.level >= 20 || tier >= 5) {
            equipClass += ' equip-card-gold';
            borderColor = isSelected ? '#fbbf24' : '#fbbf24';
            boxShadow = isSelected 
                ? '0 14px 34px rgba(0,0,0,0.65), 0 0 0 2px rgba(251,191,36,0.6), 0 0 20px rgba(251,191,36,0.35), inset 0 1px 0 rgba(255,255,255,0.1)' 
                : '0 10px 26px rgba(0,0,0,0.55), 0 0 0 1.5px rgba(251,191,36,0.45), 0 0 16px rgba(251,191,36,0.25), inset 0 1px 0 rgba(255,255,255,0.06)';
        } else if (item.level >= 10 || tier >= 3) {
            equipClass += ' equip-card-emerald';
            borderColor = isSelected ? '#34d399' : '#34d399';
            boxShadow = isSelected 
                ? '0 12px 30px rgba(0,0,0,0.6), 0 0 0 1.5px rgba(52,211,153,0.5), 0 0 16px rgba(52,211,153,0.3), inset 0 1px 0 rgba(255,255,255,0.08)' 
                : '0 8px 22px rgba(0,0,0,0.5), 0 0 0 1px rgba(52,211,153,0.35), 0 0 12px rgba(52,211,153,0.2), inset 0 1px 0 rgba(255,255,255,0.05)';
        }
        
        if (isSelected) equipClass += ' selected';
        div.className = equipClass;
        
        div.style.cssText = `background: linear-gradient(145deg, #0f172a, #020617); border: 2px solid ${borderColor}; border-radius: 16px; padding: 13px 8px 11px; text-align: center; cursor: pointer; transition: all 0.25s cubic-bezier(0.23, 1, 0.32, 1); box-shadow: ${boxShadow}; position: relative; overflow: hidden;`;
        if (isSelected) div.style.transform = 'translateY(-2px)';
        
        const starsHTML = getStarsHTML(item.level, 10);
        const levelColor = getLevelColor(item.level);
        let maxBadge = item.level === 25 ? `<div style="position:absolute; top:6px; right:6px; background:#052e16; color:#10b981; font-size:8px; font-weight:900; padding:1px 6px; border-radius:999px; letter-spacing:0.5px;">MAX</div>` : '';
        
        div.innerHTML = `
            ${maxBadge}
            <div style="font-size:28px; margin-bottom:4px; line-height:1; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.4));">${item.icon}</div>
            <div style="font-size:11.5px; font-weight:700; color:#e2e8f0; margin-bottom:3px; letter-spacing:-0.2px;">${getEquipDisplayName(key)}</div>
            <div style="margin: 4px 0 6px;">
                <span style="font-size:22px; font-weight:900; color:${levelColor}; text-shadow:0 2px 6px rgba(0,0,0,0.5); line-height:1;">${item.level}</span>
                <span style="font-size:12px; color:#64748b; font-weight:700;">성</span>
            </div>
            <div style="margin-top:2px;">${starsHTML}</div>
        `;
        
        div.onclick = () => selectEquipSlot(key);
        div.onmouseenter = () => { if (!isSelected) { div.style.borderColor = '#64748b'; div.style.transform = 'translateY(-3px)'; } };
        div.onmouseleave = () => { if (!isSelected) { div.style.borderColor = '#475569'; div.style.transform = 'translateY(0)'; } };
        
        grid.appendChild(div);
    });
    
    updateEquipPowerDisplay();
    if (currentSelectedEquipSlot) renderEnhancePanel();
}

function selectEquipSlot(slotKey) {
    currentSelectedEquipSlot = slotKey;
    renderEquipUI();
    
    // 모달창 띄우기!
    const modal = document.getElementById('equip-enhance-modal');
    if (modal) modal.style.display = 'flex';
    renderEnhancePanel();
}

// 모달창 닫기 버튼용 기능 추가
function closeEnhanceModal() {
    const modal = document.getElementById('equip-enhance-modal');
    if (modal) modal.style.display = 'none';
    currentSelectedEquipSlot = null; 
    renderEquipUI(); 
}

// ✨ DEX 스탯을 UI에 표시
function renderEnhancePanel() {
    const detail = document.getElementById('equip-modal-detail');
    const controls = document.getElementById('equip-modal-controls');
    const nameEl = document.getElementById('equip-modal-selected-name');
    
    if (!currentSelectedEquipSlot || !detail || !controls) return;
    const item = equipment[currentSelectedEquipSlot];
    if (!item) return;
    
    const displayName = getEquipDisplayName(currentSelectedEquipSlot);
    nameEl.innerHTML = `<span style="color:#fbbf24;">${item.icon}</span> ${displayName}`;
    
    if (item.level >= 25) {
        const tier = item.tier || 1;
        const tierInfo = TIER_DATA[tier] || TIER_DATA[1];
        const nextTier = tier + 1;
        const canEvolve = tier < 11;
        
        if (canEvolve) {
            const nextTierInfo = TIER_DATA[nextTier];
            const evoCost = getEvolutionCost(currentSelectedEquipSlot);
            
            detail.innerHTML = `
                <div style="text-align:center; padding:8px 4px;">
                    <div style="font-size:48px; margin-bottom:6px; filter:drop-shadow(0 4px 10px rgba(16,185,129,0.3));">${item.icon}</div>
                    <div style="font-size:20px; font-weight:900; color:#fbbf24; margin-bottom:4px;">${displayName}</div>
                    <div style="font-size:15px; color:#10b981; font-weight:700; margin-bottom:12px;">25성 MAX • ${tierInfo.label} 단계</div>
                    <div style="background:#052e16; border:2px solid #10b981; border-radius:14px; padding:16px; margin:12px 0;">
                        <div style="font-size:14px; color:#4ade80; margin-bottom:8px;">다음 단계로 진화 가능</div>
                        <div style="font-size:18px; font-weight:900; color:#fbbf24; margin-bottom:4px;">${nextTierInfo.name}${item.baseName}</div>
                        <div style="font-size:13px; color:#94a3b8;">수익률 배율: ${tierInfo.multiplier.toFixed(2)}x → <span style="color:#10b981; font-weight:700;">${nextTierInfo.multiplier.toFixed(2)}x</span></div>
                    </div>
                </div>
            `;
            controls.innerHTML = `
                <div style="margin-top:8px;">
                    <button onclick="evolveEquipment('${currentSelectedEquipSlot}')" style="width:100%; padding:16px; background:linear-gradient(135deg, #7c3aed, #5b21b6); color:white; font-size:16px; font-weight:900; border:none; border-radius:14px; cursor:pointer; box-shadow:0 8px 25px rgba(124, 58, 237, 0.4);">
                        ✨ 다음 단계로 진화하기<br><span style="font-size:13px; opacity:0.9;">비용: ${evoCost.toLocaleString()} 칩</span>
                    </button>
                    <div style="font-size:11px; color:#64748b; text-align:center; margin-top:8px;">진화하면 레벨이 0성으로 초기화됩니다</div>
                </div>
            `;
            controls.style.display = 'block';
        } else {
            detail.innerHTML = `
                <div style="text-align:center; padding:8px 4px;">
                    <div style="font-size:48px; margin-bottom:6px; filter:drop-shadow(0 4px 10px rgba(16,185,129,0.3));">${item.icon}</div>
                    <div style="font-size:22px; font-weight:900; color:#10b981; margin-bottom:4px;">${displayName}</div>
                    <div style="font-size:16px; color:#fbbf24; font-weight:700; margin-bottom:8px;">★ 전설의 경지에 도달했습니다 ★</div>
                    <div style="color:#64748b; font-size:13px;">이 장비는 더 이상 진화할 수 없습니다.</div>
                </div>
            `;
            controls.style.display = 'none';
        }
        return;
    }
    
    const cost = getEnhanceCost(item.level, item.tier || 1);
    const probs = ENHANCE_PROBS[item.level] || { success: 30, maintain: 65, destroy: 5 };
    const progressPercent = Math.floor((item.level / 25) * 100);

    const dex = typeof playerStats !== 'undefined' ? playerStats.dex : 0;
    const dexSucc = dex * 0.05;
    const dexDest = dex * 0.02;
    
    let finalSucc = Math.min(100, probs.success + dexSucc);
    let finalDest = Math.max(0, probs.destroy - dexDest);
    let finalMaint = 100 - finalSucc - finalDest;
    
    let dexText = dex > 0 ? `<div style="font-size:11px; color:#c4b5fd; text-align:center; margin-top:4px;">✨ DEX 스탯 보정 적용 중</div>` : '';

    // ✨ 암시장 조작 아이템 UI 생성 로직
    let cheatHTML = '';
    if (typeof inventory !== 'undefined') {
        if (inventory['bm_equip_protect'] > 0 && finalDest > 0) {
            cheatHTML += `
                <div style="margin-top:10px; background:rgba(234,88,12,0.15); border:1px solid #ea580c; border-radius:10px; padding:10px; display:flex; justify-content:space-between; align-items:center;">
                    <label style="display:flex; align-items:center; gap:8px; cursor:pointer; color:#fbbf24; font-size:13px; font-weight:bold;">
                        <input type="checkbox" id="use-protect-checkbox" style="width:18px; height:18px; accent-color:#ea580c;">
                        🛡️ 티타늄 합금액 (파괴 방지)
                    </label>
                    <span style="color:#94a3b8; font-size:12px;">보유: ${inventory['bm_equip_protect']}개</span>
                </div>
            `;
        }
        if (inventory['bm_equip_prob'] > 0 && item.level < 25) {
            cheatHTML += `
                <div style="margin-top:6px; background:rgba(16,185,129,0.15); border:1px solid #10b981; border-radius:10px; padding:10px; display:flex; justify-content:space-between; align-items:center;">
                    <label style="display:flex; align-items:center; gap:8px; cursor:pointer; color:#34d399; font-size:13px; font-weight:bold;">
                        <input type="checkbox" id="use-prob-checkbox" style="width:18px; height:18px; accent-color:#10b981;">
                        📱 확률 조작 리모컨 (성공률 +20%)
                    </label>
                    <span style="color:#94a3b8; font-size:12px;">보유: ${inventory['bm_equip_prob']}개</span>
                </div>
            `;
        }
    }
    
    detail.innerHTML = `
        <div style="display:flex; gap:16px; align-items:center;">
            <div style="font-size:42px; width:68px; text-align:center; line-height:1; filter: drop-shadow(0 4px 8px rgba(0,0,0,0.5));">${item.icon}</div>
            <div style="flex:1; min-width:0;">
                <div style="font-size:15px; font-weight:700; color:#f1f5f9; margin-bottom:2px;">${displayName}</div>
                <div style="display:flex; align-items:baseline; gap:4px; margin:6px 0 8px;">
                    <span style="font-size:34px; font-weight:900; color:${getLevelColor(item.level)}; line-height:1; text-shadow:0 2px 8px rgba(0,0,0,0.6);">${item.level}</span>
                    <span style="font-size:15px; color:#64748b; font-weight:600;">/ 25 성</span>
                </div>
                <div style="margin-bottom:6px;">${getStarsHTML(item.level, 9)}</div>
                <div style="height:5px; background:#1e293b; border-radius:999px; overflow:hidden; margin-top:4px;">
                    <div style="height:100%; width:${progressPercent}%; background:linear-gradient(to right, #fbbf24, #d97706); transition:width 0.4s ease;"></div>
                </div>
            </div>
        </div>
    `;
    
    controls.innerHTML = `
        <div style="display:flex; justify-content:space-between; font-size:13px; margin-bottom:10px; padding:0 4px;">
            <div>현재 <span id="equip-current-level" style="font-weight:900; color:#fbbf24; font-size:17px;">${item.level}</span><span style="color:#94a3b8;">/25 성</span></div>
            <div>비용 <span id="equip-enhance-cost" style="font-weight:900; color:#ef4444;">${cost.toLocaleString()}</span> 칩</div>
        </div>
        <div style="background:#0a0f1c; border-radius:12px; padding:12px; margin-bottom:6px;">
            <div style="font-size:11px; color:#94a3b8; margin-bottom:8px; font-weight:700;">다음 강화 결과 확률</div>
            <div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:8px; font-size:12.5px;">
                <div style="background:#052e16; border-radius:10px; padding:8px 12px; display:flex; justify-content:space-between; align-items:center;">
                    <span style="color:#10b981;">✅ 성공</span><span id="prob-success" style="font-weight:900; color:#4ade80; font-size:15px;">${finalSucc.toFixed(2)}%</span>
                </div>
                <div style="background:#1e3a8a; border-radius:10px; padding:8px 12px; display:flex; justify-content:space-between; align-items:center;">
                    <span style="color:#60a5fa;">🔄 유지</span><span id="prob-maintain" style="font-weight:900; color:#93c5fd; font-size:15px;">${finalMaint.toFixed(2)}%</span>
                </div>
                <div style="background:#450a0a; border-radius:10px; padding:8px 12px; display:flex; justify-content:space-between; align-items:center;">
                    <span style="color:#f87171;">💥 파괴</span><span id="prob-destroy" style="font-weight:900; color:#fca5a5; font-size:15px;">${finalDest.toFixed(2)}%</span>
                </div>
            </div>
            ${dexText}
        </div>
        ${cheatHTML}
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-top:14px;">
            <button onclick="enhanceSelectedEquipment()" style="padding:15px 10px; font-size:15px; font-weight:900; background:#334155; color:#e2e8f0; border:1px solid #475569; border-radius:14px; transition:all 0.2s; cursor:pointer;">⚡ 일반 강화</button>
            <button onclick="startStarCatchMiniGame()" style="padding:15px 10px; font-size:15px; font-weight:900; background:linear-gradient(135deg, #7c3aed, #5b21b6); color:white; border:none; border-radius:14px; box-shadow:0 6px 20px rgba(124,58,237,0.45); cursor:pointer;">⭐ 스타캐치</button>
        </div>
    `;
    controls.style.display = 'block';
}

function enhanceSelectedEquipment() {
    if (!currentSelectedEquipSlot) { showAlert("강화할 장비를 먼저 선택해주세요."); return; }
    const item = equipment[currentSelectedEquipSlot];
    if (item.level >= 25) { showAlert("이미 최대 성급입니다."); return; }
    
    const cost = getEnhanceCost(item.level, item.tier || 1);
    if (gameChips < cost) { showAlert(`게임칩이 부족합니다!\n필요: ${cost.toLocaleString()} 칩\n보유: ${gameChips.toLocaleString()} 칩`); return; }
    
    gameChips -= cost; updateLedgerDisplays();
    
    // ✨ 버그 수정: 주간 퀘스트 진행도 전송
    if (typeof updateQuestProgress === 'function') updateQuestProgress('enhance', 1);
    
    const probs = ENHANCE_PROBS[item.level];
    const dex = typeof playerStats !== 'undefined' ? playerStats.dex : 0;
    let finalSucc = Math.min(100, probs.success + (dex * 0.05));
    let finalDest = Math.max(0, probs.destroy - (dex * 0.02));
    let finalMaint = 100 - finalSucc - finalDest;

    const probCb = document.getElementById('use-prob-checkbox');
    if (probCb && probCb.checked && inventory['bm_equip_prob'] > 0) {
        inventory['bm_equip_prob'] -= 1;
        finalSucc = Math.min(100, finalSucc + 20);
        finalMaint = Math.max(0, 100 - finalSucc - finalDest);
        showToast("📱 조작 리모컨 가동! 성공 확률 대폭 상승!", "success");
    }

    const protectCb = document.getElementById('use-protect-checkbox');
    if (protectCb && protectCb.checked && inventory['bm_equip_protect'] > 0) {
        inventory['bm_equip_protect'] -= 1;
        finalDest = 0;
        finalMaint = 100 - finalSucc; 
        showToast("🛡️ 티타늄 합금액 적용! 파괴 방지 활성화!", "maintain");
    }

    const rand = Math.random() * 100;
    let resultText = '', newLevel = item.level, isDestroy = false, flashClass = '';
    
    let cum = finalSucc;
    if (rand < cum) {
        newLevel = item.level + 1;
        resultText = `성공! ${item.level}성 → ${newLevel}성`;
        flashClass = 'flash-win-effect';
    } else {
        cum += finalMaint;
        if (rand < cum) {
            resultText = `유지! ${item.level}성 유지`;
        } else {
            newLevel = 0;
            resultText = `파괴! ${item.level}성 → 0성 초기화`;
            isDestroy = true; flashClass = 'flash-fail-effect';
        }
    }
    
    if (!gameStats.system) gameStats.system = {};
    gameStats.system.equipEnhances = (gameStats.system.equipEnhances || 0) + 1;
    if (isDestroy) gameStats.system.equipDestroys = (gameStats.system.equipDestroys || 0) + 1;

    item.level = newLevel;
    renderEquipUI(); renderEnhancePanel();
    
    let toastType = isDestroy ? 'destroy' : (resultText.includes('유지') ? 'maintain' : 'success');
    showToast(resultText, toastType);
    
    const overlay = document.getElementById('flash-overlay');
    if (overlay && flashClass) {
        overlay.className = flashClass; overlay.style.display = 'block';
        setTimeout(() => { overlay.style.display = 'none'; overlay.className = ''; }, 1050);
    }
    
    const detailPanel = document.getElementById('equip-modal-detail');
    if (detailPanel) {
        if (isDestroy || resultText.includes('파괴')) {
            detailPanel.classList.add('equip-detail-fail');
            setTimeout(() => detailPanel.classList.remove('equip-detail-fail'), 800);
        } else if (!resultText.includes('유지')) {
            detailPanel.classList.add('equip-detail-success');
            setTimeout(() => detailPanel.classList.remove('equip-detail-success'), 1400);
        }
    }
    
    const hudProfit = document.getElementById('hud-profit-text');
    if (hudProfit) { hudProfit.innerHTML = `<span style="color:#64748b;">-${cost.toLocaleString()} 칩 소모</span>`; setTimeout(() => { if (hudProfit) hudProfit.innerHTML = ''; }, 2800); }
    
    const logName = getEquipDisplayName(currentSelectedEquipSlot) || item.name || '';
    appendLogRecord(`[장비] ${logName}`, resultText, isDestroy ? 'color:#ef4444;' : 'color:#10b981;');
    if (typeof saveData === 'function') saveData();
    
    if (newLevel === 25) { setTimeout(() => { showAlert(`🎉 축하합니다!\n${logName}이(가) 25성 전설 장비가 되었습니다!`); }, 400); }
}

function evolveEquipment(itemKey) {
    const item = equipment[itemKey];
    if (!item || item.level < 25) { showAlert("25성 장비만 진화할 수 있습니다."); return; }
    
    const tier = item.tier || 1;
    if (tier >= 11) { showAlert("이미 최고 단계입니다."); return; }
    
    const evoCost = getEvolutionCost(itemKey);
    if (gameChips < evoCost) { showAlert(`게임칩이 부족합니다!\n필요: ${evoCost.toLocaleString()} 칩\n보유: ${gameChips.toLocaleString()} 칩`); return; }
    
    const nextTier = tier + 1;
    const currentTierInfo = TIER_DATA[tier];
    const nextTierInfo = TIER_DATA[nextTier];
    const displayName = getEquipDisplayName(itemKey);
    
    if (!confirm(`${displayName}을(를)\n${nextTierInfo.name}${item.baseName}으로 진화하시겠습니까?\n\n비용: ${evoCost.toLocaleString()} 칩\n수익률: ${currentTierInfo.multiplier.toFixed(2)}x → ${nextTierInfo.multiplier.toFixed(2)}x\n\n※ 진화하면 레벨이 0성으로 초기화됩니다.`)) return;
    
    gameChips -= evoCost;
    updateLedgerDisplays();
    
    item.tier = nextTier; item.level = 0; 
    renderEquipUI(); renderEnhancePanel();
    
    const newDisplayName = getEquipDisplayName(itemKey);
    showToast(`${displayName} → ${newDisplayName} 진화 완료!`, 'success');
    appendLogRecord(`[장비 진화] ${displayName}`, `${newDisplayName} (비용 ${evoCost.toLocaleString()} 칩)`, 'color:#a855f7; font-weight:bold;');
    if (typeof saveData === 'function') saveData();
    
    const overlay = document.getElementById('flash-overlay');
    if (overlay) {
        overlay.className = 'flash-win-effect'; overlay.style.display = 'block';
        setTimeout(() => { overlay.style.display = 'none'; overlay.className = ''; }, 1200);
    }
    
    if (nextTier === 11) {
        setTimeout(() => { showAlert(`🏆 전설 달성!\n\n${newDisplayName}이(가)\n마침내 레전드의 경지에 올랐습니다!\n\n이제 진정한 고수가 되었습니다.`); }, 500);
    } else if (nextTier >= 8) {
        setTimeout(() => { showToast(`🔥 ${newDisplayName} 진화! 고티어 세트에 한 걸음 더!`, 'success'); }, 800);
    }
}

let starcatchInterval = null, starcatchPos = 50, starcatchDir = 1, starcatchStopped = false, starcatchFinalBonus = 0;

function startStarCatchMiniGame() {
    const modal = document.getElementById('starcatch-modal');
    const needle = document.getElementById('starcatch-needle');
    const stopBtn = document.getElementById('starcatch-stop-btn');
    const execBtn = document.getElementById('starcatch-execute-btn');
    const preview = document.getElementById('starcatch-prob-preview');
    if (!modal || !needle) return;

    starcatchPos = 15 + Math.random() * 70;
    starcatchDir = Math.random() > 0.5 ? 1 : -1;
    starcatchStopped = false;
    starcatchFinalBonus = 0;

    needle.style.left = starcatchPos + '%';
    stopBtn.style.display = 'block';
    execBtn.style.display = 'none';
    preview.style.opacity = '0.6';
    modal.style.display = 'flex';

    if (starcatchInterval) clearInterval(starcatchInterval);
    starcatchInterval = setInterval(() => {
        if (starcatchStopped) return;
        starcatchPos += starcatchDir * 2.1;
        if (starcatchPos >= 94) { starcatchPos = 94; starcatchDir = -1; }
        if (starcatchPos <= 6)  { starcatchPos = 6;  starcatchDir = 1; }
        needle.style.left = starcatchPos + '%';
        updateStarCatchPreview(starcatchPos);
    }, 18);
}

function updateStarCatchPreview(pos) {
    const item = equipment[currentSelectedEquipSlot];
    if (!item) return;

    const base = ENHANCE_PROBS[item.level] || { success: 30, maintain: 65, destroy: 5 };
    const distance = Math.abs(pos - 50);

    let bonus = distance <= 7 ? 28 : distance <= 16 ? 14 : distance <= 28 ? 5 : -6;
    
    // ✨ DEX 스탯 스타캐치 보정
    const dex = typeof playerStats !== 'undefined' ? playerStats.dex : 0;
    
    let finalSuccess = Math.min(92, base.success + bonus + (dex * 0.05));
    const remaining = 100 - finalSuccess;

    const totalFail = base.maintain + base.destroy;
    let finalMaintain = Math.floor(remaining * (base.maintain / totalFail));
    let finalDestroy = 100 - finalSuccess - finalMaintain;

    document.getElementById('preview-success').innerText = finalSuccess.toFixed(1) + '%';
    document.getElementById('preview-maintain').innerText = finalMaintain.toFixed(1) + '%';
    document.getElementById('preview-destroy').innerText = finalDestroy.toFixed(1) + '%';
}

function stopStarCatch() {
    if (starcatchStopped) return;
    starcatchStopped = true;
    if (starcatchInterval) { clearInterval(starcatchInterval); starcatchInterval = null; }

    const distance = Math.abs(starcatchPos - 50);
    starcatchFinalBonus = distance <= 7 ? 0.28 : distance <= 16 ? 0.14 : distance <= 28 ? 0.05 : -0.06;

    document.getElementById('starcatch-instruction').innerHTML = distance <= 7 ? '💫 PERFECT! 대성공 구간!' : distance <= 16 ? '🌟 GOOD! 좋은 타이밍!' : '괜찮은 위치';
    document.getElementById('starcatch-prob-preview').style.opacity = '1';
    document.getElementById('starcatch-stop-btn').style.display = 'none';
    document.getElementById('starcatch-execute-btn').style.display = 'block';
}

function executeStarCatchEnhance() {
    // ✨ 광클(다중 클릭)로 퍼펙트 스타캐치 보너스를 연속으로 훔쳐가는 어뷰징 방지
    const btn = document.getElementById('starcatch-execute-btn');
    if (!btn || btn.style.display === 'none') return;
    btn.style.display = 'none'; // 즉시 버튼 비활성화 처리
    
    closeStarCatchModal();
    executeEnhanceWithBonus(starcatchFinalBonus);
    
    starcatchFinalBonus = 0; // 보너스 스탯 즉시 초기화
}

function closeStarCatchModal() {
    const modal = document.getElementById('starcatch-modal');
    if (modal) modal.style.display = 'none';
    if (starcatchInterval) { clearInterval(starcatchInterval); starcatchInterval = null; }
}

function executeEnhanceWithBonus(bonusRate = 0) {
    if (!currentSelectedEquipSlot || !equipment[currentSelectedEquipSlot]) { showAlert("장비를 선택해주세요."); return; }
    const item = equipment[currentSelectedEquipSlot];
    if (item.level >= 25) { showAlert("이미 최대 성급입니다."); return; }
    
    const cost = getEnhanceCost(item.level, item.tier || 1);
    if (gameChips < cost) { showAlert(`게임칩이 부족합니다!\n필요: ${cost.toLocaleString()} 칩\n보유: ${gameChips.toLocaleString()} 칩`); return; }
    
    gameChips -= cost; updateLedgerDisplays();
    
    // ✨ 버그 수정: 주간 퀘스트 진행도 전송
    if (typeof updateQuestProgress === 'function') updateQuestProgress('enhance', 1);
    
    const base = ENHANCE_PROBS[item.level] || { success: 30, maintain: 65, destroy: 5 };
    const dex = typeof playerStats !== 'undefined' ? playerStats.dex : 0;
    
    let rawSucc = base.success + (dex * 0.05);
    let rawDest = Math.max(0, base.destroy - (dex * 0.02));
    let rawMaint = 100 - rawSucc - rawDest;

    let finalSucc = Math.min(100, rawSucc + Math.floor(bonusRate * 100));
    
    const probCb = document.getElementById('use-prob-checkbox');
    if (probCb && probCb.checked && inventory['bm_equip_prob'] > 0) {
        inventory['bm_equip_prob'] -= 1;
        finalSucc = Math.min(100, finalSucc + 20);
        showToast("📱 조작 리모컨 가동! 성공 확률 대폭 상승!", "success");
    }

    let remaining = Math.max(0, 100 - finalSucc);
    let failTotal = rawMaint + rawDest;
    let finalMaint = failTotal > 0 ? remaining * (rawMaint / failTotal) : remaining;
    let finalDest = failTotal > 0 ? remaining * (rawDest / failTotal) : 0;

    const protectCb = document.getElementById('use-protect-checkbox');
    if (protectCb && protectCb.checked && inventory['bm_equip_protect'] > 0) {
        inventory['bm_equip_protect'] -= 1;
        finalDest = 0;
        finalMaint = remaining; 
        showToast("🛡️ 티타늄 합금액 적용! 파괴 방지 활성화!", "maintain");
    }

    const rand = Math.random() * 100;
    let resultText = '', newLevel = item.level, isDestroy = false, flashClass = '';
    
    let cum = finalSucc;
    if (rand < cum) {
        newLevel = item.level + 1;
        resultText = bonusRate >= 0.20 ? `💫 대성공! ${item.level}성 → ${newLevel}성` : `성공! ${item.level}성 → ${newLevel}성`;
        flashClass = 'flash-win-effect';
    } else {
        cum += finalMaint;
        if (rand < cum) {
            resultText = `유지! ${item.level}성 유지`;
        } else {
            newLevel = 0; resultText = `파괴! ${item.level}성 → 0성 초기화`;
            isDestroy = true; flashClass = 'flash-fail-effect';
        }
    }

    if (!gameStats.system) gameStats.system = {};
    gameStats.system.equipEnhances = (gameStats.system.equipEnhances || 0) + 1;
    if (isDestroy) gameStats.system.equipDestroys = (gameStats.system.equipDestroys || 0) + 1;
    
    item.level = newLevel;
    renderEquipUI(); renderEnhancePanel();
    
    const overlay = document.getElementById('flash-overlay');
    if (overlay && flashClass) {
        overlay.className = flashClass; overlay.style.display = 'block';
        setTimeout(() => { overlay.style.display = 'none'; overlay.className = ''; }, 1050);
    }
    
    const detailPanel = document.getElementById('equip-modal-detail');
    if (detailPanel) {
        if (isDestroy || resultText.includes('파괴')) {
            detailPanel.classList.add('equip-detail-fail'); setTimeout(() => detailPanel.classList.remove('equip-detail-fail'), 800);
        } else if (!resultText.includes('유지')) {
            detailPanel.classList.add('equip-detail-success'); setTimeout(() => detailPanel.classList.remove('equip-detail-success'), 1400);
        }
    }
    
    let toastType = isDestroy ? 'destroy' : (resultText.includes('대성공') || resultText.includes('성공')) ? 'success' : resultText.includes('유지') ? 'maintain' : 'success';
    showToast(resultText, toastType);
    
    const logName = getEquipDisplayName(currentSelectedEquipSlot) || item.name || '';
    appendLogRecord(`[장비] ${logName}`, resultText, isDestroy ? 'color:#ef4444;' : 'color:#10b981;');
    if (typeof saveData === 'function') saveData();
    
    if (newLevel === 25) { setTimeout(() => { showAlert(`🎉 축하합니다!\n${logName}이(가) 25성 전설 장비가 되었습니다!`); }, 500); }
}

document.addEventListener('keydown', function(e) {
    if (e.key === 'Enter' && activeTab === 'equip' && currentSelectedEquipSlot) {
        const controls = document.getElementById('equip-enhance-controls');
        if (controls && controls.style.display !== 'none') {
            enhanceSelectedEquipment(); 
        }
    }
});