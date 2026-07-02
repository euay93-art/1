// ============================================================
// js/blackmarket.js
// 브로커 J의 암시장, 스마트 인벤토리, 불법 전당포 시스템
// ============================================================

// 💧 저당 잡힌 아이템 ID를 기록하는 비밀 장부
let inventory = {}; 
let bmCurrentStock = [];
let bmLastRefresh = 0;
let bmTimerInterval = null;
let pawnedItems = []; 

function renderBlackMarket() {
    const now = Date.now();
    if (now - bmLastRefresh > 1800000 || bmCurrentStock.length === 0) {
        refreshBlackMarket(false);
    } else {
        drawBlackMarketItems();
    }
    startBlackMarketTimer();
    renderPawnShop(); // 전당포 함께 렌더링
}

function refreshBlackMarket(isManual = false) {
    if (isManual) {
        if (gameChips < 1000000) { showAlert("갱신 수수료가 부족합니다. (100만 칩 필요)"); return; }
        gameChips -= 1000000;
        
        // ✨ 통계: 암시장 갱신 수수료 누적
        if (!gameStats.system) gameStats.system = {};
        gameStats.system.brokerFees = (gameStats.system.brokerFees || 0) + 1000000;
        
        if(typeof updateLedgerDisplays === 'function') updateLedgerDisplays();
        showToast("브로커에게 수수료를 지급했습니다: 품목 갱신됨.", "success");
    }
    
    bmLastRefresh = Date.now();
    const shuffled = [...BLACK_MARKET_ITEMS].sort(() => 0.5 - Math.random());
    bmCurrentStock = shuffled.slice(0, 3).map(item => ({ ...item, isSoldOut: false }));
    
    drawBlackMarketItems();
    if(typeof saveData === 'function') saveData();

    // ✨ 신규: 암시장 물건 갱신 시 탭을 보고 있지 않다면 알림 켜기
    if (activeTab !== 'blackmarket') {
        const bmTab = document.getElementById('tab-blackmarket');
        if (bmTab) bmTab.classList.add('tab-alert-red');
    }
}

function drawBlackMarketItems() {
    const list = document.getElementById('bm-item-list');
    if (!list) return;
    list.innerHTML = '';
    
    bmCurrentStock.forEach((item, index) => {
        const div = document.createElement('div');
        div.style.cssText = `background:#1a0808; border:1px solid #7f1d1d; border-radius:12px; padding:12px; display:flex; justify-content:space-between; align-items:center;`;
        
        let btnHtml = item.isSoldOut 
            ? `<button disabled style="background:#3f1f1f; color:#7f1d1d; border:none; padding:8px 12px; border-radius:8px; font-weight:bold; font-size:12px;">품절 (SOLD)</button>`
            : `<button onclick="buyBlackMarketItem(${index})" style="background:linear-gradient(135deg, #b91c1c, #7f1d1d); color:white; border:none; padding:8px 12px; border-radius:8px; font-weight:900; font-size:13px; cursor:pointer; box-shadow:0 4px 10px rgba(185,28,28,0.4);">구매 (BUY)</button>`;
        div.innerHTML = `
            <div style="flex:1;">
                <div style="font-weight:900; color:#fca5a5; font-size:15px; margin-bottom:4px;">${item.icon} ${item.name}</div>
                <div style="font-size:11px; color:#fbbf24; font-weight:bold; margin-bottom:4px;">가격: ${item.price.toLocaleString()} 칩</div>
                <div style="font-size:11.5px; color:#94a3b8; line-height:1.4;">${item.desc}</div>
            </div>
            <div style="margin-left:12px;">${btnHtml}</div>
        `;
        list.appendChild(div);
    });
}

function buyBlackMarketItem(index) {
    const item = bmCurrentStock[index];
    if (item.isSoldOut) return;
    if (gameChips < item.price) { showAlert(`게임칩이 부족합니다. (필요: ${item.price.toLocaleString()} 칩)`); return; }
    if (!confirm(`[밀수품] ${item.name}을(를) ${item.price.toLocaleString()} 칩에 거래하시겠습니까?`)) return;

    if (Math.random() < 0.10) {
        const penalty = Math.floor(gameChips * 0.3);
        gameChips -= penalty;
        item.isSoldOut = true; 
        
        if(typeof updateLedgerDisplays === 'function') updateLedgerDisplays();
        drawBlackMarketItems();
        if(typeof saveData === 'function') saveData();
        
        showToast("🚨 [함정 단속] 경찰이다! 물건을 압수당하고 벌금을 물었습니다!", "fail");
        if (typeof appendLogRecord === 'function') appendLogRecord(`[경찰 단속] 암시장 거래 적발`, `-${penalty.toLocaleString()} 칩`, 'color:#ef4444; font-weight:bold;');
        if (typeof AudioSynth !== 'undefined') AudioSynth.playLose();
        return;
    }
    
    gameChips -= item.price;
    item.isSoldOut = true;
    
    if (!inventory[item.id]) inventory[item.id] = 0;
    inventory[item.id] += 1;
    
    // ✨ 암시장 구매 퀘스트 신호 전송
    if (typeof updateQuestProgress === 'function') updateQuestProgress('bm_buy', 1);
    
    if(typeof updateLedgerDisplays === 'function') updateLedgerDisplays();
    drawBlackMarketItems();
    renderSmartInventory();
    if(typeof saveData === 'function') saveData();
    
    showToast(`🕵️ 거래 완료. ${item.name}이(가) 금고에 보관되었습니다.`);
    if (typeof AudioSynth !== 'undefined') AudioSynth.playCoin();
}

function renderSmartInventory() {
    const invenDiv = document.getElementById('bm-inventory-list');
    if (!invenDiv) return;
    
    const ownedKeys = Object.keys(inventory).filter(k => inventory[k] > 0);
    if (ownedKeys.length === 0) {
        invenDiv.innerHTML = '<div style="color:#64748b; text-align:center; padding:10px 0;">보유 중인 조작 아이템이 없습니다.</div>';
        return;
    }
    
    let html = '';
    ownedKeys.forEach(key => {
        const itemInfo = BLACK_MARKET_ITEMS.find(i => i.id === key);
        if (itemInfo) {
            html += `<div style="display:flex; justify-content:space-between; border-bottom:1px solid #334155; padding:6px 0;">
                <span style="color:#e2e8f0; font-weight:bold;">${itemInfo.icon} ${itemInfo.name}</span>
                <span style="color:#fbbf24; font-weight:900;">${inventory[key]} 개</span>
            </div>`;
        }
    });
    invenDiv.innerHTML = html;
}

function startBlackMarketTimer() {
    if (typeof bmTimerInterval !== 'undefined' && bmTimerInterval) clearInterval(bmTimerInterval);
    bmTimerInterval = setInterval(() => {
        const timerEl = document.getElementById('bm-timer');
        if (!timerEl) return;
        const remain = 1800000 - (Date.now() - bmLastRefresh);
        if (remain <= 0) { refreshBlackMarket(false); return; }
        const m = Math.floor(remain / 60000);
        const s = Math.floor((remain % 60000) / 1000);
        timerEl.innerText = `${m}:${s.toString().padStart(2, '0')}`;
    }, 1000);
}

// ----------------------------------------------------------------
// 💧 불법 전당포 로직 (위탁 및 환수)
// ----------------------------------------------------------------

function renderPawnShop() {
    const pawnDiv = document.getElementById('bm-pawnshop-list');
    if (!pawnDiv) return;
    
    let html = '';
    
    html += '<div style="font-size:12px; color:#fbbf24; font-weight:bold; margin-bottom:6px; border-bottom:1px solid #7f1d1d; padding-bottom:3px;">💰 저당 잡힐 수 있는 내 컬렉션 (원가 35% 획득)</div>';
    if (typeof unlockedItems === 'undefined' || unlockedItems.length === 0) {
        html += '<div style="color:#64748b; text-align:center; padding:10px 0; font-size:12px; background:#020617; border-radius:8px; margin-bottom:14px;">전당포에 맡길 수집품이 없습니다.</div>';
    } else {
        unlockedItems.forEach(itemId => {
            const item = LUXURY_ITEMS.find(i => i.id === itemId);
            if (item) {
                const pawnPrice = Math.floor(item.price * 0.35);
                html += `
                    <div style="display:flex; justify-content:space-between; align-items:center; background:#1a0808; border:1px solid #7f1d1d; border-radius:10px; padding:10px; margin-bottom:6px;">
                        <div>
                            <div style="color:#f8fafc; font-weight:bold; font-size:13px; margin-bottom:2px;">${item.icon || '💎'} ${item.name}</div>
                            <div style="color:#64748b; font-size:11px;">원가: ₩${item.price.toLocaleString()}</div>
                        </div>
                        <div style="text-align:right;">
                            <div style="color:#ef4444; font-weight:900; font-size:13px; margin-bottom:4px;">+${pawnPrice.toLocaleString()} 칩</div>
                            <button onclick="sellCollectionToPawnshop('${item.id}', ${pawnPrice})" style="background:linear-gradient(135deg, #b91c1c, #7f1d1d); color:white; border:none; border-radius:6px; padding:6px 12px; font-size:12px; font-weight:900; cursor:pointer;">물건 맡기기</button>
                        </div>
                    </div>
                `;
            }
        });
    }
    
    html += '<div style="font-size:12px; color:#34d399; font-weight:bold; margin-top:16px; margin-bottom:6px; border-bottom:1px solid #065f46; padding-bottom:3px;">🔄 찾아올 수 있는 저당 물건 (원가 50% 지불)</div>';
    if (typeof pawnedItems === 'undefined' || pawnedItems.length === 0) {
        html += '<div style="color:#64748b; text-align:center; padding:10px 0; font-size:12px; background:#020617; border-radius:8px;">저당 잡힌 물건이 없습니다.</div>';
    } else {
        pawnedItems.forEach(itemId => {
            const item = LUXURY_ITEMS.find(i => i.id === itemId);
            if (item) {
                const buyBackPrice = Math.floor(item.price * 0.50);
                html += `
                    <div style="display:flex; justify-content:space-between; align-items:center; background:#052e16; border:1px solid #10b981; border-radius:10px; padding:10px; margin-bottom:6px;">
                        <div>
                            <div style="color:#f8fafc; font-weight:bold; font-size:13px; margin-bottom:2px;">${item.icon || '💎'} ${item.name}</div>
                            <div style="color:#64748b; font-size:11px;">원가: ₩${item.price.toLocaleString()}</div>
                        </div>
                        <div style="text-align:right;">
                            <div style="color:#10b981; font-weight:900; font-size:13px; margin-bottom:4px;">-${buyBackPrice.toLocaleString()} 칩</div>
                            <button onclick="buyBackCollectionFromPawnshop('${item.id}', ${buyBackPrice})" style="background:linear-gradient(135deg, #059669, #047857); color:white; border:none; border-radius:6px; padding:6px 12px; font-size:12px; font-weight:900; cursor:pointer;">돈 주고 되찾기</button>
                        </div>
                    </div>
                `;
            }
        });
    }
    pawnDiv.innerHTML = html;
}

function sellCollectionToPawnshop(itemId, pawnPrice) {
    const item = LUXURY_ITEMS.find(i => i.id === itemId);
    if (!item) return;
    
    const buyBackEstimate = Math.floor(item.price * 0.50);
    if (!confirm(`정말 "${item.name}"을(를) 브로커 J에게 저당 잡히시겠습니까?\n\n[+${pawnPrice.toLocaleString()} 칩]을 즉시 받지만, 나중에 되찾으려면 원가의 50%인 [${buyBackEstimate.toLocaleString()} 칩]을 지불해야 합니다.`)) return;
    
    const index = unlockedItems.indexOf(itemId);
    if (index > -1) unlockedItems.splice(index, 1);
    
    if (typeof pawnedItems === 'undefined') pawnedItems = [];
    pawnedItems.push(itemId);
    
    gameChips += pawnPrice;
    
    if(typeof updateLedgerDisplays === 'function') updateLedgerDisplays();
    renderPawnShop();
    if(typeof renderCollection === 'function' && document.getElementById('collection-grid')) renderCollection();
    if(typeof updateCurrentTitle === 'function') updateCurrentTitle();
    if(typeof saveData === 'function') saveData();
    
    showToast(`🩸 피눈물을 머금고 ${item.name}을(를) 저당 잡혔습니다...`, "fail");
    if (typeof appendLogRecord === 'function') appendLogRecord(`[전당포 저당] ${item.name} 위탁`, `+${pawnPrice.toLocaleString()} 칩`, 'color:#ef4444; font-weight:bold;');
    if (typeof AudioSynth !== 'undefined') AudioSynth.playCoin();
}

function buyBackCollectionFromPawnshop(itemId, buyBackPrice) {
    const item = LUXURY_ITEMS.find(i => i.id === itemId);
    if (!item) return;
    
    if (gameChips < buyBackPrice) {
        showAlert(`되찾을 칩이 부족합니다!\n\n필요 금액: ${buyBackPrice.toLocaleString()} 칩\n현재 보유: ${gameChips.toLocaleString()} 칩`);
        return;
    }
    
    if (!confirm(`저당 잡혔던 "${item.name}"을(를) ${buyBackPrice.toLocaleString()} 칩을 치르고 회수하시겠습니까?`)) return;
    
    gameChips -= buyBackPrice;
    
    // ✅ 수정된 부분: 원가 35%에 맡기고 50%에 되찾을 때 발생하는 차액(15%)을 '전당포 매각 손실' 장부에 영구 기록!
    const pawnPrice = Math.floor(item.price * 0.35);
    const lossAmount = buyBackPrice - pawnPrice;
    if (!gameStats.system) gameStats.system = {};
    gameStats.system.pawnshopLosses = (gameStats.system.pawnshopLosses || 0) + lossAmount;

    const index = pawnedItems.indexOf(itemId);
    if (index > -1) pawnedItems.splice(index, 1);
    
    unlockedItems.push(itemId);
    
    if(typeof updateLedgerDisplays === 'function') updateLedgerDisplays();
    renderPawnShop();
    if(typeof renderCollection === 'function' && document.getElementById('collection-grid')) renderCollection();
    if(typeof updateCurrentTitle === 'function') updateCurrentTitle();
    if(typeof saveData === 'function') saveData();
    
    showToast(`✨ 브로커 J에게서 ${item.name}을(를) 되찾아왔습니다!`, "success");
    if (typeof appendLogRecord === 'function') appendLogRecord(`[전당포 환수] ${item.name} 회수`, `-${buyBackPrice.toLocaleString()} 칩`, 'color:#10b981; font-weight:bold;');
    if (typeof AudioSynth !== 'undefined') AudioSynth.playCoin();
}