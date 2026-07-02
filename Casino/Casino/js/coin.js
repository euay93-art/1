// ============================================================
// js/coin.js
// 코인 가격 변동 및 거래 시스템
// ============================================================

function resetCoinMarket() {
    if (!confirm("정말 코인 시장을 초기화하시겠습니까?\n\n• 모든 코인 가격이 상장가로 초기화됩니다.\n• 보유 중인 모든 코인이 삭제됩니다.\n• 이 작업은 되돌릴 수 없습니다.")) {
        return;
    }

    initCoinPrices();
    coinPortfolio = {};

    if (typeof updateCoinMarketDisplay === 'function') updateCoinMarketDisplay();
    if (typeof renderCoinHoldingsNew === 'function') renderCoinHoldingsNew();
    if (typeof updateLedgerDisplays === 'function') updateLedgerDisplays();
    if (typeof saveData === 'function') saveData();

    showToast("코인 시장이 상장가로 완전히 초기화되었습니다.", 'success');
    appendLogRecord("[시스템]", "코인 시장 초기화 (상장가 복원 + 보유코인 삭제)", "color:#fbbf24;");
}

function initCoinPrices() {
    COINS.forEach(coin => {
        coinPrices[coin.id] = coin.price;
        previousCoinPrices[coin.id] = coin.price;
    });
}

function ensureCoinDataLoaded() {
    if (!coinPrices || typeof coinPrices !== 'object') coinPrices = {};
    if (!previousCoinPrices || typeof previousCoinPrices !== 'object') previousCoinPrices = {};

    COINS.forEach(coin => {
        if (coinPrices[coin.id] === undefined || coinPrices[coin.id] === null) {
            coinPrices[coin.id] = coin.price;
        }
        if (previousCoinPrices[coin.id] === undefined || previousCoinPrices[coin.id] === null) {
            previousCoinPrices[coin.id] = coinPrices[coin.id];
        }
    });
}

function updateCoinTimerDisplay() {
    const el = document.getElementById('coin-timer-display');
    if (el) {
        el.innerText = coinSecondsLeft;
        el.style.color = '#ef4444';
    }
}

function startCoinPriceFluctuation() {
    if (coinTimerInterval) clearInterval(coinTimerInterval);
    if (coinDisplayTimerInterval) clearInterval(coinDisplayTimerInterval);

    coinSecondsLeft = 15;

    coinDisplayTimerInterval = setInterval(() => {
        coinSecondsLeft--;
        if (coinSecondsLeft < 0) coinSecondsLeft = 15;
        if (activeTab === 'coin') {
            updateCoinTimerDisplay();
            const t2 = document.getElementById('coin-timer-display2');
            if (t2) t2.innerText = coinSecondsLeft;
        }
    }, 1000);

    coinTimerInterval = setInterval(() => {
        COINS.forEach(coin => {
            previousCoinPrices[coin.id] = coinPrices[coin.id];
            const currentPrice = coinPrices[coin.id];
            let changeRate;

            // ✨ 코인 펌핑봇 개입! (100% ~ 300% 폭등)
            if (window.hackedCoin === coin.id) {
                changeRate = 1.0 + Math.random() * 2.0; 
            } else {
                if (coin.type === "major") {
                    const baseDrift = 0.00145; 
                    changeRate = (Math.random() * coin.volatility * 2) - coin.volatility + baseDrift;
                    if (Math.random() < 0.01) changeRate -= 0.08 + Math.random() * 0.10; 
                } else {
                    const isCheap = currentPrice <= 20;
                    if (isCheap) {
                        if (currentPrice <= 6) changeRate = (Math.random() * 0.95) + 0.38; 
                        else changeRate = (Math.random() * coin.volatility * 2.35) - coin.volatility * 0.5;
                    } else {
                        changeRate = (Math.random() * coin.volatility * 2) - coin.volatility;
                    }

                    const pumpChance = isCheap ? 0.055 : 0.0115;
                    if (Math.random() < pumpChance) {
                        if (isCheap) changeRate = 1.5 + Math.random() * 3.4; 
                        else changeRate = 0.9 + Math.random() * 2.5; 
                    }
                }
            }

            let newPrice = Math.floor(currentPrice * (1 + changeRate));

            if (window.hackedCoin !== coin.id) {
                if (coin.type === "major") {
                    const initialPrice = COINS.find(c => c.id === coin.id).price;
                    const dynamicFloor = Math.floor(initialPrice * 0.48);
                    newPrice = Math.max(dynamicFloor, newPrice);
                    if (currentPrice < initialPrice * 0.55 && Math.random() < 0.18) {
                        newPrice = Math.floor(currentPrice * (1.08 + Math.random() * 0.12)); 
                    }
                } else {
                    const initialPrice = COINS.find(c => c.id === coin.id).price;
                    const dynamicFloor = Math.max(1, Math.floor(initialPrice * 0.28));
                    newPrice = Math.max(dynamicFloor, newPrice);
                    if (currentPrice < initialPrice * 0.40 && Math.random() < 0.22) {
                        newPrice = Math.floor(currentPrice * (1.12 + Math.random() * 0.18));
                    }
                }
            }
            coinPrices[coin.id] = newPrice;
        });
        
        window.hackedCoin = null; // 펌핑 끝났으면 초기화

        coinSecondsLeft = 15;
        if (activeTab === 'coin') {
            updateCoinTimerDisplay();
            updateCoinMarketDisplay();
            renderCoinHoldingsNew();
            updateCoinPercentPreviews();
            if (typeof renderInfoPrices === 'function') renderInfoPrices(); 
        }

        if (typeof checkTurnaroundNotifications === 'function') checkTurnaroundNotifications();
        if (typeof saveData === 'function') saveData();
    }, 15000);
}

function updateCoinMarketDisplay() {
    const select = document.getElementById('coin-select');
    if (!select) return;
    
    selectedCoinForTrade = select.value;
    const coin = COINS.find(c => c.id === selectedCoinForTrade);
    if (!coin) return;

    const currentPrice = coinPrices[selectedCoinForTrade] || coin.price;
    const prevPrice = previousCoinPrices[selectedCoinForTrade] || currentPrice;
    const change = prevPrice > 0 ? ((currentPrice - prevPrice) / prevPrice) * 100 : 0;
    
    const nameEl = document.getElementById('coin-name-display');
    const priceEl = document.getElementById('coin-price-display');
    const changeEl = document.getElementById('coin-change-display');
    
    if (nameEl) nameEl.innerText = coin.name;
    if (priceEl) priceEl.innerHTML = `₩ ${currentPrice.toLocaleString()}`;
    if (changeEl) {
        const color = change >= 0 ? '#10b981' : '#ef4444';
        const arrow = change >= 0 ? '▲' : '▼';
        changeEl.innerHTML = `변동률: ${arrow} ${change.toFixed(2)}%`;
        changeEl.style.color = color;
    }
    
    updateCoinPercentPreviews();

    // ✨ 암시장 코인 펌핑봇 버튼 UI 위치 최적화
    let cheatBtn = document.getElementById('coin-cheat-btn');
    if (typeof inventory !== 'undefined' && inventory['bm_coin_bot'] > 0) {
        if (!cheatBtn) {
            const container = document.querySelector('#section-coin .stock-selector');
            cheatBtn = document.createElement('button');
            cheatBtn.id = 'coin-cheat-btn';
            cheatBtn.className = 'btn-ignition';
            cheatBtn.style.cssText = "margin-bottom:12px; background:linear-gradient(135deg, #1e3a8a, #1e1b4b); box-shadow:0 4px 15px rgba(30,58,138,0.5); border:1px solid #3b82f6; width:100%; padding:12px; font-size:14px;";
            cheatBtn.onclick = useCoinCheat;
            
            const nameDisplay = document.getElementById('coin-name-display');
            if (nameDisplay && nameDisplay.parentNode) {
                nameDisplay.parentNode.insertBefore(cheatBtn, nameDisplay);
            } else if (container) {
                container.appendChild(cheatBtn);
            }
        }
        cheatBtn.style.display = 'block';
        cheatBtn.innerHTML = `🤖 텔레그램 펌핑 봇 가동 (현재 코인 조작, 보유: ${inventory['bm_coin_bot']}개)`;
    } else if (cheatBtn) {
        cheatBtn.style.display = 'none';
    }
}

function updateCoinPercentPreviews() {
    if (!selectedCoinForTrade) return;
    const currentPrice = coinPrices[selectedCoinForTrade] || 0;
    if (currentPrice <= 0) return;

    [10,30,50,70,100].forEach(pct => {
        const el = document.getElementById(`coin-buy-pct-${pct}`);
        if (!el) return;
        const spendAmount = Math.floor(bankAsset * (pct / 100));
        const amount = Math.floor(spendAmount / currentPrice);
        el.innerText = amount > 0 ? amount.toLocaleString() : '0';
    });
}

function buyCoinByPercent(percent) {
    if (!selectedCoinForTrade) { showAlert("코인을 먼저 선택해주세요."); return; }

    const currentPrice = coinPrices[selectedCoinForTrade] || 0;
    if (currentPrice <= 0) return;

    const spendAmount = Math.floor(bankAsset * (percent / 100));
    const buyAmount = Math.floor(spendAmount / currentPrice);

    if (buyAmount < 1) {
        showAlert("은행 잔고가 부족합니다.");
        return;
    }

    const input = document.getElementById('coin-direct-amount-input');
    if (input) input.value = buyAmount;

    updateCoinDirectPreview();

    const hud = document.getElementById('hud-status-text');
    if (hud) {
        hud.innerText = `${percent}% 선택됨 → 매수 버튼을 눌러주세요`;
        setTimeout(() => { if (hud) hud.innerText = "🪙 코인 거래소"; }, 2500);
    }
}

function updateCoinDirectPreview() {
    const input = document.getElementById('coin-direct-amount-input');
    const preview = document.getElementById('coin-direct-required-amount');
    if (!input || !preview || !selectedCoinForTrade) return;

    const coins = parseInt(input.value) || 0;
    const price = coinPrices[selectedCoinForTrade] || 0;
    
    if (price <= 0 || coins < 1) { preview.innerHTML = `₩0`; return; }
    
    const requiredMoney = coins * price;
    preview.innerHTML = `₩${requiredMoney.toLocaleString()}`;
}

function executeCoinDirectBuy() {
    if (!selectedCoinForTrade) { showAlert("코인을 먼저 선택해주세요."); return; }
    
    const input = document.getElementById('coin-direct-amount-input');
    if (!input) return;

    const buyAmount = parseInt(input.value);
    if (!buyAmount || buyAmount < 1) {
        showAlert("1개 이상의 정수 개수를 입력해주세요.");
        return;
    }

    const currentPrice = coinPrices[selectedCoinForTrade] || 0;
    if (currentPrice <= 0) return;

    const totalCost = buyAmount * currentPrice;

    if (totalCost > bankAsset) {
        showAlert(`은행 잔고가 부족합니다.\n필요: ₩${totalCost.toLocaleString()}\n(코인 1개 가격: ₩${currentPrice.toLocaleString()})`);
        return;
    }

    bankAsset -= totalCost;

    if (!coinPortfolio[selectedCoinForTrade]) {
        coinPortfolio[selectedCoinForTrade] = { amount: 0, avgPrice: 0 };
    }

    const h = coinPortfolio[selectedCoinForTrade];
    const oldAmount = h.amount;
    const oldAvg = h.avgPrice;

    h.amount += buyAmount;
    if (oldAmount + buyAmount > 0) {
        h.avgPrice = ((oldAmount * oldAvg) + (buyAmount * currentPrice)) / (oldAmount + buyAmount);
    } else {
        h.avgPrice = currentPrice;
    }

    if (!gameStats.coin) gameStats.coin = { buys: 0, sells: 0, realizedProfit: 0, maxPortfolioValue: 0, feePaid: 0 };
    gameStats.coin.buys = (gameStats.coin.buys || 0) + 1;

    if (typeof updateQuestProgress === 'function') updateQuestProgress('market_buy', 1);

    appendLogRecord(`[코인 매수] ${selectedCoinForTrade} ${buyAmount}개 @₩${currentPrice.toLocaleString()}`, `-${totalCost.toLocaleString()} 원`, "color:#ef4444;");
    if (typeof AudioSynth !== 'undefined') AudioSynth.playCoin();
    showToast(`✅ ${selectedCoinForTrade} ${buyAmount}개 매수 완료!`);

    updateLedgerDisplays();
    updateCoinMarketDisplay();
    renderCoinHoldingsNew();
    if (typeof saveData === 'function') saveData();
    
    input.value = '';
    document.getElementById('coin-direct-required-amount').innerHTML = '₩0';
}

function renderCoinHoldingsNew() {
    const container = document.getElementById('coin-holdings-list');
    if (!container) return;
    container.innerHTML = '';

    const owned = Object.keys(coinPortfolio).filter(id => coinPortfolio[id] && coinPortfolio[id].amount > 0);

    if (owned.length === 0) {
        container.innerHTML = `<div style="color:#475569; font-size:13px; text-align:center; padding:12px 0;">보유 중인 코인이 없습니다.</div>`;
        return;
    }

    owned.forEach(coinId => {
        const holding = coinPortfolio[coinId];
        const coin = COINS.find(c => c.id === coinId);
        if (!coin) return;

        const currentPrice = coinPrices[coinId] || 0;
        const amount = Math.floor(holding.amount);
        const value = amount * currentPrice;
        const avgPrice = holding.avgPrice || currentPrice;
        const cost = amount * avgPrice;
        const pl = value - cost;
        const plRate = cost > 0 ? (pl / cost) * 100 : 0;
        const plColor = pl >= 0 ? '#10b981' : '#ef4444';

        const div = document.createElement('div');
        div.className = 'holding-item';
        div.onclick = (e) => {
            if (e.target.classList.contains('btn-sell-all')) return;
            const select = document.getElementById('coin-select');
            if (select) { select.value = coinId; updateCoinMarketDisplay(); }
        };

        div.innerHTML = `
            <div>
                <div class="holding-name" style="color:${coin.color || '#f8fafc'};">${coin.name}</div>
                <div class="holding-qty">${amount.toLocaleString()}개 (평균단가 ₩${Math.floor(avgPrice).toLocaleString()})</div>
            </div>
            <div class="holding-actions">
                <div class="holding-value">
                    <div>₩${Math.floor(value).toLocaleString()}</div>
                    <div class="holding-profit" style="color: ${plColor}">
                        ${pl >= 0 ? '+' : ''}${Math.floor(pl).toLocaleString()}원 (${plRate.toFixed(1)}%)
                    </div>
                </div>
                <button type="button" class="btn-sell-all" onclick="event.stopImmediatePropagation(); quickSellCoinFromHoldings('${coinId}')">전량매도</button>
            </div>
        `;
        container.appendChild(div);
    });
}

function quickSellCoinFromHoldings(coinId) {
    const holding = coinPortfolio[coinId];
    if (!holding || holding.amount <= 0) return;

    const amount = Math.floor(holding.amount);
    const currentPrice = coinPrices[coinId] || 0;
    const avgBuyPrice = holding.avgPrice || currentPrice;

    showSellConfirmModal('coin', coinId, amount, avgBuyPrice, currentPrice, () => {
        // ✅ 무한 돈복사 방어: 모달 승인 시점에 코인이 실제로 포트폴리오에 남아있는지 재검증!
        if (!coinPortfolio[coinId] || coinPortfolio[coinId].amount <= 0) return;

        const revenue = amount * currentPrice;
        const fee = Math.floor(revenue * 0.02);
        const net = revenue - fee;
        const cost = amount * avgBuyPrice;
        const realized = net - cost;

        const profitBonus = typeof applyProfitBonus === 'function' ? applyProfitBonus(realized, 'coin') : 0;
        const finalRevenue = net + profitBonus;

        bankAsset += finalRevenue;
        delete coinPortfolio[coinId];

        if (!gameStats.coin) gameStats.coin = { buys: 0, sells: 0, realizedProfit: 0, maxPortfolioValue: 0, feePaid: 0 };
        gameStats.coin.feePaid = (gameStats.coin.feePaid || 0) + fee;
        gameStats.coin.sells = (gameStats.coin.sells || 0) + 1;
        gameStats.coin.realizedProfit = (gameStats.coin.realizedProfit || 0) + realized + profitBonus;

        appendLogRecord(`[코인 매도] ${coinId} ${amount}개 (수수료 ${fee.toLocaleString()})`, `+${net.toLocaleString()} 원`, "color:#10b981; font-weight:bold;");
        if (typeof AudioSynth !== 'undefined') AudioSynth.playWin();
        showToast(`✅ ${coinId} 전량 매도 완료! (+${net.toLocaleString()}원)`);

        updateLedgerDisplays();
        if (typeof updateCoinDisplay === 'function') updateCoinDisplay();
        renderCoinHoldingsNew();
        if (typeof saveData === 'function') saveData();
    });
}

function updateCoinDisplay() {
    updateCoinMarketDisplay();
}

// ✨ 코인 아이템 타이머 고장 해결 완벽 적용
function useCoinCheat() {
    if (!selectedCoinForTrade) return;
    if (typeof inventory === 'undefined' || !inventory['bm_coin_bot'] || inventory['bm_coin_bot'] <= 0) return;
    inventory['bm_coin_bot'] -= 1;

    window.hackedCoin = selectedCoinForTrade;
    
    showToast(`🤖 펌핑 봇 가동! 다음 턴에 [${window.hackedCoin}] 시세가 강제 폭등합니다!`, 'success');
    
    if(typeof renderSmartInventory === 'function') renderSmartInventory();
    
    // 남은 시간을 즉시 0으로 강제해서 기존 시스템(타이머)이 안전하게 다음 턴으로 넘어가게 함
    coinSecondsLeft = 0;
    
    if(typeof saveData === 'function') saveData();
    updateCoinMarketDisplay();
}