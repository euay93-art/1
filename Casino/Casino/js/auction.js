// ============================================================
// js/auction.js
// VVIP 비밀 경매장 - 블랙 클럽 랭커 연동 및 실시간 입찰 (스탯 제거 안전 버전)
// ============================================================

let isAuctionActive = false;
let auctionTimeLeft = 0;
let auctionInterval = null;
let aiBidInterval = null;

let currentAuctionItem = null;
let currentBidPrice = 0;
let highestBidder = null; 
let heldPlayerChips = 0;  
let activeAIs = [];

let soldAuctionItems = JSON.parse(localStorage.getItem('highroller_auction_sold') || '[]');
let myAuctionItems = JSON.parse(localStorage.getItem('highroller_my_auction') || '[]');

if (!document.getElementById('auction-shiny-css')) {
    const style = document.createElement('style');
    style.id = 'auction-shiny-css';
    style.innerHTML = `
        @keyframes relicSparkle {
            0% { filter: drop-shadow(0 0 2px rgba(251, 191, 36, 0.4)) brightness(1); transform: scale(1); }
            50% { filter: drop-shadow(0 0 12px rgba(251, 191, 36, 1)) brightness(1.3); transform: scale(1.08); }
            100% { filter: drop-shadow(0 0 2px rgba(251, 191, 36, 0.4)) brightness(1); transform: scale(1); }
        }
        .auction-shiny-icon {
            display: inline-block;
            animation: relicSparkle 2.5s ease-in-out infinite;
        }
    `;
    document.head.appendChild(style);
}

function saveAuctionData() {
    localStorage.setItem('highroller_auction_sold', JSON.stringify(soldAuctionItems));
    localStorage.setItem('highroller_my_auction', JSON.stringify(myAuctionItems));
}

function initAuctionSystem() {
    document.getElementById('auction-gate-panel').style.display = 'block';
    document.getElementById('auction-lounge-panel').style.display = 'none';
    document.getElementById('auction-main-panel').style.display = 'none';
    
    renderMyAuctionSafe();

    if (isAuctionActive) {
        document.getElementById('auction-gate-panel').style.display = 'none';
        document.getElementById('auction-main-panel').style.display = 'block';
    }
}

function renderMyAuctionSafe() {
    const safeDiv = document.getElementById('auction-inventory-list');
    if (!safeDiv) return;
    
    if (myAuctionItems.length === 0) {
        safeDiv.innerHTML = '낙찰받은 전설적인 유물이 없습니다.';
        return;
    }
    
    safeDiv.innerHTML = '';
    myAuctionItems.forEach(itemId => {
        const item = AUCTION_ITEMS.find(i => i.id === itemId);
        if (item) {
            safeDiv.innerHTML += `
                <div style="background:#0a0f1c; border:1px solid #334155; padding:12px; border-radius:8px; margin-bottom:8px;">
                    <div style="font-weight:900; color:#fbbf24; font-size:14px;"><span class="auction-shiny-icon">${item.icon}</span> ${item.name}</div>
                    <div style="font-size:11px; color:#cbd5e1; margin-top:6px;"><b>발견 연대:</b> ${item.era}</div>
                    <div style="font-size:11px; color:#94a3b8; margin-top:4px; font-style:italic;">"${item.lore}"</div>
                </div>`;
        }
    });
}

function tryEnterVvipAuction() {
    if (typeof getTotalAsset === 'function' && getTotalAsset() < 1000000000) {
        if(typeof showAlert === 'function') showAlert("❌ 총 자산 10억 원 이상의 하이롤러만 입장할 수 있습니다."); 
        return;
    }
    
    document.getElementById('auction-gate-panel').style.display = 'none';
    
    const availableItems = AUCTION_ITEMS.filter(item => !soldAuctionItems.includes(item.id));

    if (availableItems.length === 0) {
        currentAuctionItem = AUCTION_ITEMS[Math.floor(Math.random() * AUCTION_ITEMS.length)];
    } else {
        currentAuctionItem = availableItems[Math.floor(Math.random() * availableItems.length)];
    }

    const availableAIs = typeof BLACK_CLUB_MEMBERS !== 'undefined' ? BLACK_CLUB_MEMBERS.filter(r => r.status === "active") : [];
    const shuffledAIs = [...availableAIs].sort(() => 0.5 - Math.random());
    const minAIs = 2;
    const maxAIs = Math.min(8, availableAIs.length);
    const participantCount = Math.floor(Math.random() * (maxAIs - minAIs + 1)) + minAIs;
    activeAIs = shuffledAIs.slice(0, participantCount);
    
    document.getElementById('lounge-item-name').innerHTML = `<span class="auction-shiny-icon" style="font-size:24px; vertical-align:middle;">${currentAuctionItem.icon}</span> ${currentAuctionItem.name}`;
    document.getElementById('lounge-item-story').innerText = `"${currentAuctionItem.lore}"`;
    document.getElementById('lounge-item-effect').innerHTML = `<span style="color:#94a3b8; font-weight:normal;">${currentAuctionItem.description}</span>`;
    
    const npcListDiv = document.getElementById('lounge-npc-list');
    npcListDiv.innerHTML = '';

    activeAIs.forEach(ai => {
        let multi = 1.0 + (Math.random() * ((ai.stats.flex || 50) / 20)); 
        ai.desire = Math.floor(Math.random() * 30) + 40; 
        
        if (ai.giftPreferences && (ai.giftPreferences.includes(currentAuctionItem.category) || ai.giftPreferences.includes("신화/유물"))) {
            multi *= 2.5; 
            ai.desire = Math.min(99, ai.desire + 30); 
        }
        
        const chaStat = typeof playerStats !== 'undefined' ? playerStats.cha : 0;
        const intimidation = Math.max(0.7, 1 - (chaStat * 0.005));
        
        ai.maxWillingPrice = Math.floor(currentAuctionItem.startPrice * multi * intimidation);
        ai.maxWillingPrice = Math.min(ai.maxWillingPrice, ai.netWorth);

        npcListDiv.innerHTML += `
            <button onclick="showNpcProfile('${ai.id}')" style="background:#1e293b; color:#cbd5e1; border:1px solid #475569; border-radius:8px; padding:6px 10px; font-size:12px; cursor:pointer;">
                👑 ${ai.name}
            </button>`;
    });

    document.getElementById('auction-lounge-panel').style.display = 'block';
    if(typeof AudioSynth !== 'undefined') AudioSynth.playCoin();
}

function showNpcProfile(aiId) {
    const ai = activeAIs.find(a => a.id === aiId);
    if(!ai) return;
    
    const modal = document.getElementById('vvip-profile-modal');
    if (!modal) return;

    const themeColor = '#fbbf24'; 
    
    let desireColor = ai.desire >= 80 ? '#ef4444' : ai.desire >= 50 ? '#fbbf24' : '#34d399';
    let desireText = ai.desire >= 80 ? '경쟁 극심 (무조건 입찰)' : ai.desire >= 50 ? '입찰 유력' : '관망 중';
    let desireBg = ai.desire >= 80 ? '#450a0a' : ai.desire >= 50 ? '#451a03' : '#052e16';
    let desireBorder = ai.desire >= 80 ? '#ef4444' : ai.desire >= 50 ? '#fbbf24' : '#10b981';

    const summaryHtml = `
        <div style="display:flex; justify-content:space-between; margin-bottom:8px; font-size:12.5px;">
            <span style="color:#94a3b8;">추정 자산</span>
            <span style="font-weight:900; color:#10b981;">₩${Math.floor(ai.netWorth / 100000000).toLocaleString()}억</span>
        </div>
        <div style="display:flex; justify-content:space-between; font-size:12.5px;">
            <span style="color:#94a3b8;">선호품</span>
            <span style="font-weight:bold; color:#e2e8f0;">${ai.giftPreferences ? ai.giftPreferences.join(", ") : '없음'}</span>
        </div>
    `;

    const stats = ai.stats || { investment: 0, gambling: 0, analysis: 0, business: 0, flex: 0 };
    const statsHtml = `
        <div style="margin-bottom:8px;">
            <div style="display:flex; justify-content:space-between; font-size:11px; color:#cbd5e1; margin-bottom:4px;"><span>💎 과시욕 (입찰 과감성)</span><span style="font-weight:bold; color:#ef4444;">${stats.flex}</span></div>
            <div style="height:6px; background:#1e293b; border-radius:3px; overflow:hidden;"><div style="height:100%; background:linear-gradient(90deg, #b91c1c, #ef4444); width:${stats.flex}%;"></div></div>
        </div>
        <div style="margin-bottom:8px;">
            <div style="display:flex; justify-content:space-between; font-size:11px; color:#cbd5e1; margin-bottom:4px;"><span>📈 투자 및 수완 (사업성)</span><span style="font-weight:bold; color:#3b82f6;">${Math.max(stats.investment, stats.business)}</span></div>
            <div style="height:6px; background:#1e293b; border-radius:3px; overflow:hidden;"><div style="height:100%; background:linear-gradient(90deg, #1d4ed8, #3b82f6); width:${Math.max(stats.investment, stats.business)}%;"></div></div>
        </div>
        <div>
            <div style="display:flex; justify-content:space-between; font-size:11px; color:#cbd5e1; margin-bottom:4px;"><span>🎲 도박 및 분석 (리스크 선호)</span><span style="font-weight:bold; color:#a855f7;">${Math.max(stats.gambling, stats.analysis)}</span></div>
            <div style="height:6px; background:#1e293b; border-radius:3px; overflow:hidden;"><div style="height:100%; background:linear-gradient(90deg, #7e22ce, #a855f7); width:${Math.max(stats.gambling, stats.analysis)}%;"></div></div>
        </div>
    `;

    modal.innerHTML = `
        <div style="background: linear-gradient(145deg, #0f172a, #020617); border: 2px solid ${themeColor}; border-radius: 20px; padding: 24px; width: 90%; max-width: 360px; text-align: left; box-shadow: 0 20px 60px rgba(0,0,0,0.9), inset 0 0 20px ${themeColor}25; position:relative;">
            <div onclick="closeVvipProfile()" style="position:absolute; top:12px; right:16px; font-size:28px; color:#94a3b8; cursor:pointer; font-weight:bold; line-height:1;">&times;</div>
            <div style="border-bottom: 1px solid #334155; padding-bottom: 14px; margin-bottom: 16px; text-align: center;">
                <div style="font-size: 13px; color: ${themeColor}; font-weight: bold; margin-bottom: 4px;">${ai.title}</div>
                <div style="font-size: 26px; font-weight: 900; color: #f8fafc; letter-spacing: 1px; text-shadow: 0 0 15px ${themeColor}66;">${ai.name}</div>
            </div>
            <div style="background: #020617; border-radius: 12px; padding: 14px; margin-bottom: 16px; border: 1px solid #1e293b;">
                ${summaryHtml}
            </div>
            <div style="background: #020617; border-radius: 12px; padding: 14px; margin-bottom: 16px; border: 1px solid #1e293b;">
                <div style="font-size: 12px; color: ${themeColor}; font-weight: 900; margin-bottom: 12px;">📊 성향 지표 분석</div>
                ${statsHtml}
            </div>
            <div style="background: ${desireBg}; border: 1px solid ${desireBorder}; border-radius: 8px; padding: 12px; margin-bottom: 16px; text-align: center;">
                <div style="font-size: 11px; color: ${desireColor}; margin-bottom: 4px; opacity:0.8;">현재 경매품에 대한 입찰 욕구</div>
                <div style="font-size: 16px; font-weight: 900; color: ${desireColor}; text-shadow: 0 0 8px ${desireColor}80;">${ai.desire}% (${desireText})</div>
            </div>
        </div>
    `;
    modal.style.display = 'flex';
}

function closeVvipProfile() {
    document.getElementById('vvip-profile-modal').style.display = 'none';
}

function startVvipAuction() {
    if (isAuctionActive) return;
    isAuctionActive = true;
    
    document.getElementById('auction-lounge-panel').style.display = 'none';
    document.getElementById('auction-main-panel').style.display = 'block';
    
    currentBidPrice = currentAuctionItem.startPrice;
    highestBidder = "경매사";
    heldPlayerChips = 0;
    
    document.getElementById('auction-item-title-mini').innerHTML = `<span class="auction-shiny-icon" style="font-size:18px; vertical-align:middle;">${currentAuctionItem.icon}</span> ${currentAuctionItem.name}`;
    document.getElementById('auction-effect-txt').innerText = currentAuctionItem.history; 
    updateBidUI();
    
    const logBox = document.getElementById('auction-live-logs');
    logBox.innerHTML = '';
    addAuctionLog("==================================", "#64748b");
    addAuctionLog(`🎤 경매사: 지금부터 전설적인 유물, [${currentAuctionItem.name}] 경매를 시작하겠습니다.`, "#fbbf24");
    addAuctionLog(`🎤 시작가: ₩${currentBidPrice.toLocaleString()} 칩부터 출발합니다!`, "#fbbf24");
    addAuctionLog("==================================", "#64748b");

    document.getElementById('btn-bid-step').disabled = false;
    document.getElementById('btn-bid-strong').disabled = false;

    auctionTimeLeft = 60; 
    document.getElementById('auction-timer-lbl').innerText = `${auctionTimeLeft}초 남음`;
    
    auctionInterval = setInterval(auctionTick, 1000);
    aiBidInterval = setInterval(processAIBids, 1500 + Math.random() * 2000); 
}

function auctionTick() {
    auctionTimeLeft--;
    const timerLbl = document.getElementById('auction-timer-lbl');
    
    if (auctionTimeLeft <= 10) {
        timerLbl.style.color = "#ef4444";
        timerLbl.style.animation = "heartbeat 1s infinite";
    } else {
        timerLbl.style.color = "#ef4444";
        timerLbl.style.animation = "none";
    }
    
    timerLbl.innerText = `${Math.max(0, auctionTimeLeft)}초 남음`;
    if (auctionTimeLeft <= 0) endVvipAuction();
}

function executePlayerBid(isStrong) {
    const nextBid = isStrong ? Math.floor(currentBidPrice * 1.15) : Math.floor(currentBidPrice * 1.05);
    const requiredChips = nextBid - heldPlayerChips;

    if (typeof gameChips !== 'undefined' && gameChips < requiredChips) {
        if(typeof showAlert === 'function') showAlert("💎 보유 칩(Chips)이 부족하여 입찰할 수 없습니다."); return;
    }

    gameChips -= requiredChips;
    heldPlayerChips = nextBid;
    if(typeof updateLedgerDisplays === 'function') updateLedgerDisplays();

    currentBidPrice = nextBid;
    highestBidder = "player";
    
    if(typeof AudioSynth !== 'undefined') AudioSynth.playTick();
    addAuctionLog(`👑 [임동혁] ${isStrong ? "🔥강력 호가 쾅!" : "✋일반 응찰"} ➡️ ₩${currentBidPrice.toLocaleString()}`, "#10b981");
    
    timeExtensionCheck();
    updateBidUI();
}

function processAIBids() {
    if (!isAuctionActive || auctionTimeLeft <= 0) return;
    if (highestBidder !== "player" && Math.random() < 0.4) return; 

    const willingAIs = activeAIs.filter(ai => {
        if (ai.id === highestBidder) return false;
        let finalMax = ai.maxWillingPrice;
        if (highestBidder === "player" && ai.affinity < -30) finalMax *= 1.2; 
        return finalMax > currentBidPrice * 1.05 && ai.desire > Math.random() * 100;
    });
    
    if (willingAIs.length > 0) {
        const bidder = willingAIs[Math.floor(Math.random() * willingAIs.length)];
        
        if (highestBidder === "player") {
            gameChips += heldPlayerChips;
            heldPlayerChips = 0;
            if(typeof updateLedgerDisplays === 'function') updateLedgerDisplays();
            addAuctionLog(`⚠️ 상위 입찰 발생! 동혁 님의 입찰금(${currentBidPrice.toLocaleString()} 칩)이 반환되었습니다.`, "#ef4444");
        }

        currentBidPrice = Math.floor(currentBidPrice * (Math.random() < 0.2 ? 1.10 : 1.05));
        highestBidder = bidder.id;
        
        addAuctionLog(`👥 [${bidder.title}] ${bidder.name}: ₩${currentBidPrice.toLocaleString()}`, "#cbd5e1");
        
        timeExtensionCheck();
        updateBidUI();
        if(typeof AudioSynth !== 'undefined') AudioSynth.playCoin();
    } else {
        if (auctionTimeLeft < 7 && Math.random() < 0.3) addAuctionLog(`🎤 경매사: 자, 더 없으십니까? 위대한 역사를 소유할 마지막 기회입니다!`, "#fbbf24");
    }
}

function timeExtensionCheck() {
    if (auctionTimeLeft < 10) {
        auctionTimeLeft += 5;
        addAuctionLog(`⏳ 마감 직전 호가 발생! 경매 시간이 5초 연장됩니다.`, "#f59e0b");
    }
}

function updateBidUI() {
    document.getElementById('auction-current-price-txt').innerText = `₩ ${currentBidPrice.toLocaleString()}`;
    let bidderName = "경매사";
    
    if (highestBidder === "player") {
        bidderName = "👑 임동혁 (나)";
        document.getElementById('auction-current-price-txt').style.color = "#10b981";
    } else if (highestBidder !== "경매사") {
        const ai = activeAIs.find(a => a.id === highestBidder);
        if (ai) bidderName = `👥 ${ai.name}`;
        document.getElementById('auction-current-price-txt').style.color = "#fbbf24";
    }
    document.getElementById('auction-high-bidder-txt').innerText = `최고 입찰자: ${bidderName}`;

    const playerChipsEl = document.getElementById('auction-player-chips-txt');
    if (playerChipsEl && typeof gameChips !== 'undefined') {
        playerChipsEl.innerText = `${gameChips.toLocaleString()} 칩`;
    }
}

function addAuctionLog(msg, color) {
    const logBox = document.getElementById('auction-live-logs');
    if (!logBox) return;
    const div = document.createElement('div');
    div.style.color = color;
    div.innerText = msg;
    logBox.appendChild(div);
    logBox.scrollTop = logBox.scrollHeight;
}

function endVvipAuction() {
    isAuctionActive = false;
    clearInterval(auctionInterval);
    clearInterval(aiBidInterval);
    
    document.getElementById('btn-bid-step').disabled = true;
    document.getElementById('btn-bid-strong').disabled = true;
    document.getElementById('auction-timer-lbl').innerText = "경매 종료";
    
    addAuctionLog("==================================", "#64748b");
    addAuctionLog(`🎤 경매사: 탕! 탕! 탕! 낙찰입니다!`, "#fbbf24");

    if (!soldAuctionItems.includes(currentAuctionItem.id)) {
        soldAuctionItems.push(currentAuctionItem.id);
    }

    if (highestBidder === "player") {
        addAuctionLog(`👑 축하합니다! 동혁 님께서 ₩${currentBidPrice.toLocaleString()}에 전설적인 유물을 손에 넣으셨습니다!`, "#10b981");
        if(typeof showToast === 'function') showToast("🎉 경매 낙찰 성공! 금고에 역사가 새겨졌습니다.", "success");
        if(typeof AudioSynth !== 'undefined') AudioSynth.playWin();
        
        if (!myAuctionItems.includes(currentAuctionItem.id)) {
            myAuctionItems.push(currentAuctionItem.id);
        }
        applyAuctionReward(currentAuctionItem);
        
        if(typeof gameStats !== 'undefined') {
            if(!gameStats.auction) gameStats.auction = { wins: 0, maxPrice: 0 };
            gameStats.auction.wins++;
            if(currentBidPrice > gameStats.auction.maxPrice) gameStats.auction.maxPrice = currentBidPrice;
        }
        if(typeof appendLogRecord === 'function') appendLogRecord(`[경매 낙찰] ${currentAuctionItem.name}`, `-${currentBidPrice.toLocaleString()} 칩`, "color:#10b981; font-weight:bold;");

        activeAIs.forEach(ai => {
            if (ai.desire > 70) {
                ai.affinity = Math.max(-100, ai.affinity - 10);
                if (typeof saveRankingData === 'function') saveRankingData();
            }
        });

        // ==========================================================
        // ✨ [신규] VVIP 은밀한 뒷거래 (애교 만점 딜레마 선톡) 이벤트!
        // ==========================================================
        if (Math.random() < 0.4) { 
            const interestedAIs = activeAIs.filter(ai => ai.id !== "player");
            if (interestedAIs.length > 0) {
                interestedAIs.sort((a, b) => b.desire - a.desire);
                const dilemmaAI = interestedAIs[0];
                
                const offerMultiplier = 1.5 + (Math.random() * 1.5);
                const offerPrice = Math.floor(currentBidPrice * offerMultiplier);
                
                dilemmaAI.pendingDilemma = {
                    itemId: currentAuctionItem.id,
                    itemName: currentAuctionItem.name,
                    offerPrice: offerPrice
                };
                
                setTimeout(() => {
                    if (!dilemmaAI.chatHistory) dilemmaAI.chatHistory = [];
                    
                    const isYoung = ['rank_yujin', 'rank_wonyoung', 'rank_eunbi', 'rank_seolyoon'].includes(dilemmaAI.id);
                    const titleCall = isYoung ? "동혁 오빠" : "동혁 님";
                    
                    dilemmaAI.chatHistory.push({ 
                        sender: 'npc', 
                        text: `"${titleCall}앙~ 방금 낙찰받으신 [${currentAuctionItem.name}] 말이에요오... 제가 ₩${offerPrice.toLocaleString()} 칩 얹어드릴 테니까 저한테 양보해 주시면 안 될까요오? 네? 🥺💕"` 
                    });
                    
                    if (typeof activeTab !== 'undefined' && activeTab !== 'messenger') {
                        const msgTab = document.getElementById('tab-messenger');
                        if (msgTab) msgTab.classList.add('tab-alert-red');
                    }
                    if (typeof showToast === 'function') showToast(`📱 [메신저] ${dilemmaAI.name}에게서 애교 섞인 제안이 도착했습니다!`, 'success');
                    if (typeof AudioSynth !== 'undefined') AudioSynth.playCoin();
                    
                    // 💡 뒷거래 알림 증발 방지: 메신저 데이터를 즉시 강제 저장!
                    if (typeof saveMessengerData === 'function') saveMessengerData(); 
                    if (typeof saveData === 'function') saveData();
                }, 5000);
            }
        }
        // ==========================================================

    } else {
        const ai = activeAIs.find(a => a.id === highestBidder);
        const winnerName = ai ? ai.name : "익명";
        addAuctionLog(`😔 아쉽습니다. ${winnerName} 님에게 낙찰되었습니다.`, "#ef4444");
        if(typeof AudioSynth !== 'undefined') AudioSynth.playLose();

        if (ai) {
            ai.netWorth = Math.max(0, ai.netWorth - currentBidPrice);
            ai.ownedItems = ai.ownedItems || [];
            ai.ownedItems.push(currentAuctionItem.id);
            if (typeof saveRankingData === 'function') saveRankingData();
        }
    }
    
    heldPlayerChips = 0; 
    saveAuctionData(); 
    if(typeof saveData === 'function') saveData();

    setTimeout(() => {
        initAuctionSystem(); 
    }, 8000);
}

function applyAuctionReward(item) {
    if (typeof unlockedItems !== 'undefined' && !unlockedItems.includes(item.id)) {
        unlockedItems.push(item.id);
    }
    if (typeof renderProfileUI === 'function') renderProfileUI();
    if (typeof renderCollection === 'function' && document.getElementById('collection-grid')) renderCollection();
}