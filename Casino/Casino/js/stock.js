// ============================================================
// js/stock.js
// 주식 거래소, 차트, 뉴스 이벤트 및 실시간 시세 로직
// ============================================================

function resetStockMarket() {
    if (!confirm("정말 주식 시장을 초기화하시겠습니까?\n\n• 모든 주식 가격이 상장가로 초기화됩니다.\n• 보유 중인 모든 주식이 삭제됩니다.\n• 이 작업은 되돌릴 수 없습니다.")) {
        return;
    }

    Object.keys(STOCK_INITIAL_PRICES).forEach(key => {
        stockPrices[key] = STOCK_INITIAL_PRICES[key];
    });

    previousPrices = { ...stockPrices };
    priceHistory = {};
    currentStockTurn = 0;
    stockTurnTimer = 30;
    portfolio = {};

    if (typeof updateMarketDisplay === 'function') updateMarketDisplay();
    if (typeof renderHoldings === 'function') renderHoldings();
    if (typeof updateLedgerDisplays === 'function') updateLedgerDisplays();

    const chartContainer = document.getElementById('stock-chart-container');
    if (chartContainer) chartContainer.style.display = 'none';

    if (typeof saveData === 'function') saveData();

    showToast("주식 시장이 상장가로 완전히 초기화되었습니다.", 'success');
    appendLogRecord("[시스템]", "주식 시장 초기화 (상장가 복원 + 보유주식 삭제)", "color:#fbbf24;");
}

function updateMarketDisplay() {
    const select = document.getElementById('stock-select');
    if (!select) return;
    const name = select.value;
    const priceEl = document.getElementById('stock-price-display');
    const changeEl = document.getElementById('stock-change-display');
    const nameEl = document.getElementById('stock-name-display');
    if (!priceEl || !changeEl || !nameEl) return;

    nameEl.innerText = name;
    priceEl.innerText = "₩ " + stockPrices[name].toLocaleString();

    const prev = previousPrices[name] || stockPrices[name];
    const change = ((stockPrices[name] - prev) / prev * 100);
    
    if (change >= 0) {
        changeEl.innerHTML = `변동률: <span class="change-up">+${change.toFixed(2)}%</span>`;
        changeEl.className = "stock-change change-up";
    } else {
        changeEl.innerHTML = `변동률: <span class="change-down">${change.toFixed(2)}%</span>`;
        changeEl.className = "stock-change change-down";
    }
    setTimeout(() => { drawStockChart(name); }, 50);
    setTimeout(() => { updateBuyPercentButtons(); }, 30);

    // ✨ 주식 찌라시 버튼 UI 위치 최적화
    let cheatBtn = document.getElementById('stock-cheat-btn');
    if (typeof inventory !== 'undefined' && inventory['bm_stock_leak'] > 0) {
        if (!cheatBtn) {
            const container = document.querySelector('#section-market .stock-selector');
            cheatBtn = document.createElement('button');
            cheatBtn.id = 'stock-cheat-btn';
            cheatBtn.className = 'btn-ignition';
            cheatBtn.style.cssText = "margin-bottom:12px; background:linear-gradient(135deg, #1e3a8a, #1e1b4b); box-shadow:0 4px 15px rgba(30,58,138,0.5); border:1px solid #3b82f6; width:100%; padding:12px; font-size:14px;";
            cheatBtn.onclick = useStockCheat;
            
            const nameDisplay = document.getElementById('stock-name-display');
            if (nameDisplay && nameDisplay.parentNode) {
                nameDisplay.parentNode.insertBefore(cheatBtn, nameDisplay);
            } else if (container) {
                container.appendChild(cheatBtn);
            }
        }
        cheatBtn.style.display = 'block';
        cheatBtn.innerHTML = `✉️ 밀수업자의 비밀 찌라시 열어보기 (보유: ${inventory['bm_stock_leak']}개)`;
    } else if (cheatBtn) {
        cheatBtn.style.display = 'none';
    }
}

function updateBuyPercentButtons() {
    const stockName = document.getElementById('stock-select')?.value;
    if (!stockName) return;
    const price = stockPrices[stockName] || 0;
    if (price <= 0) return;

    const percents = [10, 30, 50, 70, 100];
    percents.forEach(pct => {
        const el = document.getElementById(`buy-pct-${pct}`);
        if (!el) return;
        const affordable = Math.floor(bankAsset * (pct / 100));
        const shares = price > 0 ? Math.floor(affordable / price) : 0;
        el.innerText = `${shares.toLocaleString()}주`;
    });
}

function buyStockByPercent(percent) {
    const stockName = document.getElementById('stock-select')?.value;
    if (!stockName) return;

    const price = stockPrices[stockName];
    if (!price || price <= 0) return;

    const maxAffordable = Math.floor(bankAsset * (percent / 100));
    const qty = Math.floor(maxAffordable / price);

    if (qty <= 0) {
        showAlert("은행 잔고가 부족합니다.");
        return;
    }

    const input = document.getElementById('direct-shares-input');
    if (input) {
        input.value = qty;
    }

    updateDirectSharesPreview();

    const hud = document.getElementById('hud-status-text');
    if (hud) {
        hud.innerText = `${percent}% 선택됨 → 매수 버튼을 눌러주세요`;
        setTimeout(() => {
            if (hud) hud.innerText = "📈 주식 거래소";
        }, 2500);
    }
}

function updateDirectSharesPreview() {
    const stockName = document.getElementById('stock-select')?.value;
    const input = document.getElementById('direct-shares-input');
    const reqEl = document.getElementById('direct-required-amount');
    if (!stockName || !input || !reqEl) return;
    const price = stockPrices[stockName] || 0;
    const shares = parseInt(input.value) || 0;
    reqEl.innerText = `₩${(shares * price).toLocaleString()}`;
}

function executeDirectBuy() {
    const stockName = document.getElementById('stock-select')?.value;
    const input = document.getElementById('direct-shares-input');
    if (!stockName || !input) return;

    const shares = parseInt(input.value) || 0;
    if (shares <= 0) {
        showAlert("매수할 주 수를 입력해주세요.");
        return;
    }
    const price = stockPrices[stockName];
    const totalCost = shares * price;

    if (bankAsset < totalCost) {
        showAlert(`은행 잔고 부족\n필요: ₩${totalCost.toLocaleString()}`);
        return;
    }

    bankAsset -= totalCost;

    if (!portfolio[stockName]) portfolio[stockName] = { qty: 0, avgPrice: 0 };
    const oldQty = portfolio[stockName].qty;
    const oldAvg = portfolio[stockName].avgPrice;
    portfolio[stockName].qty += shares;
    portfolio[stockName].avgPrice = ((oldQty * oldAvg) + (shares * price)) / (oldQty + shares);

    gameStats.stock.buys = (gameStats.stock.buys || 0) + 1;
    
    if (typeof updateQuestProgress === 'function') updateQuestProgress('market_buy', 1);

    appendLogRecord(`[거래소 매수] ${stockName} ${shares}주 @${price.toLocaleString()}`, `-${totalCost.toLocaleString()} 원`, "color:#ef4444;");
    if (typeof AudioSynth !== 'undefined') AudioSynth.playCoin();

    updateLedgerDisplays();
    updateMarketDisplay();
    renderHoldings();
    updateBuyPercentButtons();
    input.value = "";
    document.getElementById('direct-required-amount').innerText = "₩0";
    if (typeof saveData === 'function') saveData();
    showToast(`✅ ${stockName} ${shares.toLocaleString()}주 매수 완료!`);
}

function sellAllStock(stockName) {
    if (!portfolio[stockName] || portfolio[stockName].qty <= 0) return;
    
    const qty = portfolio[stockName].qty;
    const currentPrice = stockPrices[stockName];
    const avgPrice = portfolio[stockName].avgPrice || currentPrice;

    showSellConfirmModal('stock', stockName, qty, avgPrice, currentPrice, () => {
        // ✅ 무한 돈복사 방어: 모달 승인 시점에 주식이 실제로 포트폴리오에 남아있는지 재검증!
        if (!portfolio[stockName] || portfolio[stockName].qty <= 0) return;

        const gross = Math.floor(qty * currentPrice);
        const fee = Math.floor(gross * 0.02);
        const netRevenue = gross - fee;
        const cost = Math.floor(qty * avgPrice);
        const realizedProfit = netRevenue - cost;

        const profitBonus = typeof applyProfitBonus === 'function' ? applyProfitBonus(realizedProfit, 'stock') : 0;
        const finalRevenue = netRevenue + profitBonus;

        bankAsset += finalRevenue;

        if (!gameStats.stock) gameStats.stock = { buys: 0, sells: 0, realizedProfit: 0, maxPortfolioValue: 0, feePaid: 0 };
        gameStats.stock.feePaid = (gameStats.stock.feePaid || 0) + fee;
        gameStats.stock.sells = (gameStats.stock.sells || 0) + 1;
        gameStats.stock.realizedProfit = (gameStats.stock.realizedProfit || 0) + realizedProfit + profitBonus;

        delete portfolio[stockName];

        appendLogRecord(`[거래소 매도] ${stockName} ${qty}주 @${currentPrice.toLocaleString()} (수수료 ${fee.toLocaleString()})`, `+${netRevenue.toLocaleString()} 원`, "color:#10b981; font-weight:bold;");
        if (typeof AudioSynth !== 'undefined') AudioSynth.playWin();

        updateLedgerDisplays();
        updateMarketDisplay();
        renderHoldings();
        if (typeof saveData === 'function') saveData();
    });
}

function renderHoldings() {
    const container = document.getElementById('holdings-list');
    if (!container) return;
    container.innerHTML = '';
    const stocksOwned = Object.keys(portfolio).filter(s => portfolio[s].qty > 0);

    if (stocksOwned.length === 0) {
        container.innerHTML = `<div style="color:#475569; font-size:13px; text-align:center; padding:12px 0;">보유 중인 주식이 없습니다.</div>`;
        return;
    }

    stocksOwned.forEach(stock => {
        const data = portfolio[stock];
        const currentPrice = stockPrices[stock];
        const currentValue = data.qty * currentPrice;
        const avgValue = data.qty * data.avgPrice;
        const profit = currentValue - avgValue;
        const profitRate = ((currentPrice - data.avgPrice) / data.avgPrice * 100);

        const div = document.createElement('div');
        div.className = 'holding-item';
        div.dataset.stock = stock;
        div.onclick = (e) => {
            if (e.target.classList.contains('btn-sell-all')) return;
            const select = document.getElementById('stock-select');
            if (select) { select.value = stock; updateMarketDisplay(); }
        };

        div.innerHTML = `
            <div>
                <div class="holding-name">${stock}</div>
                <div class="holding-qty">${data.qty}주 (평균단가 ₩${Math.floor(data.avgPrice).toLocaleString()})</div>
            </div>
            <div class="holding-actions">
                <div class="holding-value">
                    <div>₩${currentValue.toLocaleString()}</div>
                    <div class="holding-profit" style="color: ${profit >= 0 ? '#10b981' : '#ef4444'}">
                        ${profit >= 0 ? '+' : ''}${profit.toLocaleString()}원 (${profitRate.toFixed(1)}%)
                    </div>
                </div>
                <button type="button" class="btn-sell-all" onclick="event.stopImmediatePropagation(); sellAllStock('${stock}')">전량매도</button>
            </div>
        `;

        container.appendChild(div);
    });
}

function initPriceHistory() {
    for (let stock in stockPrices) {
        if (!priceHistory[stock]) priceHistory[stock] = [stockPrices[stock]];
    }
}

function recordPriceHistory() {
    for (let stock in stockPrices) {
        if (!priceHistory[stock]) priceHistory[stock] = [];
        priceHistory[stock].push(stockPrices[stock]);
        if (priceHistory[stock].length > 25) priceHistory[stock].shift();
    }
}

function drawStockChart(stockName) {
    const canvas = document.getElementById('stock-chart');
    const container = document.getElementById('stock-chart-container');
    const rangeEl = document.getElementById('chart-price-range');
    if (!canvas || !container) return;
    const history = priceHistory[stockName] || [];
    if (history.length < 2) { container.style.display = 'none'; return; }
    container.style.display = 'block';
    const ctx = canvas.getContext('2d');
    const w = canvas.width; const h = canvas.height;
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = '#0a0f1c'; ctx.fillRect(0, 0, w, h);
    const minPrice = Math.min(...history);
    const maxPrice = Math.max(...history);
    const priceRange = maxPrice - minPrice || 1;

    ctx.strokeStyle = '#1e293b'; ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
        const y = (h / 4) * i;
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
    }

    ctx.strokeStyle = '#fbbf24'; ctx.lineWidth = 2.5;
    ctx.shadowColor = 'rgba(251, 191, 36, 0.4)'; ctx.shadowBlur = 4;
    ctx.beginPath();
    history.forEach((price, i) => {
        const x = (w / (history.length - 1)) * i;
        const y = h - ((price - minPrice) / priceRange) * (h - 20) - 10;
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    });
    ctx.stroke(); ctx.shadowBlur = 0;

    const lastX = w;
    const lastY = h - ((history[history.length-1] - minPrice) / priceRange) * (h - 20) - 10;
    ctx.fillStyle = '#fbbf24'; ctx.beginPath(); ctx.arc(lastX - 2, lastY, 5, 0, Math.PI * 2); ctx.fill();

    if (rangeEl) {
        const change = ((history[history.length-1] - history[0]) / history[0] * 100);
        const color = change >= 0 ? '#10b981' : '#ef4444';
        rangeEl.innerHTML = `<span style="color:${color}">${change >= 0 ? '+' : ''}${change.toFixed(1)}%</span> 
            <span style="color:#64748b"> | </span> 
            <span style="color:#94a3b8">${minPrice.toLocaleString()} ~ ${maxPrice.toLocaleString()}</span>`;
    }
}

function triggerNews() {
    const now = Date.now();
    if (now - lastNewsTime < 150000) return;
    const news = NEWS_DATABASE[Math.floor(Math.random() * NEWS_DATABASE.length)];
    let duration = Math.floor(Math.random() * 5) + 1;
    if (news.type === 'macro') duration = Math.max(duration, 3);
    const impact = news.strength;

    if (news.type === 'macro') {
        for (let stock in stockPrices) {
            activeNewsEffects.push({ stock, impact, remainingTurns: duration, newsText: news.text, isMacro: true });
        }
    } else {
        activeNewsEffects.push({ stock: news.stock, impact, remainingTurns: duration, newsText: news.text, isMacro: false });
    }

    newsLog.unshift({ text: news.text, time: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }), type: news.type, sentiment: news.sentiment });
    if (newsLog.length > 6) newsLog.pop();
    lastNewsTime = now;

    const hStatus = document.getElementById("hud-status-text");
    if (hStatus) {
        const prefix = news.type === 'macro' ? '🌍 [매크로 뉴스] ' : '📰 [뉴스] ';
        hStatus.innerText = `${prefix}${news.text}`;
    }
    if (activeTab === 'market') renderNewsLog();
    if (news.type === 'macro' || Math.random() < 0.4) showToast(`📰 ${news.text}`);
}

function applyNewsEffects() {
    for (let i = activeNewsEffects.length - 1; i >= 0; i--) {
        const effect = activeNewsEffects[i];
        effect.remainingTurns--;
        if (effect.remainingTurns <= 0) activeNewsEffects.splice(i, 1);
    }
}

function getNewsImpactForStock(stockName) {
    let totalImpact = 1.0;
    for (let effect of activeNewsEffects) {
        if (effect.stock === stockName) totalImpact *= effect.impact;
    }
    return Math.max(0.82, Math.min(1.38, totalImpact));
}

function renderNewsLog() {
    const container = document.getElementById('news-log-list');
    if (!container) return;
    container.innerHTML = '';
    if (newsLog.length === 0) {
        container.innerHTML = `<div style="color:#475569; font-size:12px; text-align:center; padding:8px 0;">최근 뉴스가 없습니다.</div>`;
        return;
    }
    newsLog.forEach(news => {
        const div = document.createElement('div');
        div.style.cssText = `padding:6px 10px; border-bottom:1px solid #1e293b; font-size:12px;`;
        const color = news.sentiment === 'positive' ? '#10b981' : (news.sentiment === 'negative' ? '#ef4444' : '#fbbf24');
        div.innerHTML = `
            <div style="color:#64748b; font-size:11px;">${news.time}</div>
            <div style="color:${color}; font-weight:600; margin-top:2px;">${news.text}</div>
        `;
        container.appendChild(div);
    });
}

function startStockPriceFluctuation() {
    if (stockTimerInterval) clearInterval(stockTimerInterval);
    if (window.stockPriceTimerInterval) clearInterval(window.stockPriceTimerInterval);

    stockTimerInterval = setInterval(() => {
        stockTurnTimer--;
        if (activeTab === 'market') {
            const turnEl = document.getElementById('stock-turn-display');
            const timerEl = document.getElementById('stock-timer-display');
            if (turnEl) turnEl.innerText = currentStockTurn;
            if (timerEl) timerEl.innerText = stockTurnTimer;
        }
        if (stockTurnTimer <= 0) { stockTurnTimer = 30; currentStockTurn++; }
    }, 1000);

    window.stockPriceTimerInterval = setInterval(() => {
        if (Math.random() < 0.18) triggerNews();
        for (let stock in stockPrices) {
            previousPrices[stock] = stockPrices[stock];
            let changeRate = (Math.random() * 0.125) - 0.0625;
            const newsImpact = getNewsImpactForStock(stock);
            changeRate = changeRate * newsImpact;
            if (window.hackedStock === stock) {
                changeRate = 0.35 + Math.random() * 0.25; //
            }
            const BASE_PRICES = STOCK_INITIAL_PRICES;
            const basePrice = BASE_PRICES[stock] || 100000;
            let tentativePrice = Math.floor(stockPrices[stock] * (1 + changeRate));
            const deviation = (tentativePrice - basePrice) / basePrice;
            if (Math.abs(deviation) > 0.12 && window.hackedStock !== stock) {
                const reversionForce = -deviation * 0.08;
                tentativePrice = Math.floor(tentativePrice * (1 + reversionForce));
            }
            stockPrices[stock] = Math.max(1000, tentativePrice);
        }
        
        window.hackedStock = null;
        applyNewsEffects();
        recordPriceHistory();
        currentStockTurn++;
        
        if (activeTab === 'market') {
            updateMarketDisplay();
            renderHoldings();
            updateLedgerDisplays();
            renderNewsLog();
            const turnEl = document.getElementById('stock-turn-display');
            if (turnEl) turnEl.innerText = currentStockTurn;
            const select = document.getElementById('stock-select');
            if (select) drawStockChart(select.value);
            if (typeof renderInfoPrices === 'function') renderInfoPrices();
        }
        if (typeof checkTurnaroundNotifications === 'function') checkTurnaroundNotifications();
        if (typeof saveData === 'function') saveData();
    }, 30000);
}

function initProfitStatusSnapshot() {
    previousProfitStatus = {};
    Object.keys(portfolio).forEach(stockName => {
        const holding = portfolio[stockName];
        if (holding && holding.qty > 0) {
            const currentPrice = stockPrices[stockName] || 0;
            const currentValue = holding.qty * currentPrice;
            const costValue = holding.qty * holding.avgPrice;
            previousProfitStatus[stockName] = currentValue > costValue;
        }
    });

    Object.keys(coinPortfolio).forEach(coinId => {
        const holding = coinPortfolio[coinId];
        if (holding && holding.amount > 0) {
            const currentPrice = coinPrices[coinId] || 0;
            const currentValue = holding.amount * currentPrice;
            const costValue = holding.amount * holding.avgPrice;
            previousProfitStatus[coinId] = currentValue > costValue;
        }
    });
}

function checkTurnaroundNotifications() {
    Object.keys(portfolio).forEach(stockName => {
        const holding = portfolio[stockName];
        if (!holding || holding.qty <= 0) return;

        const currentPrice = stockPrices[stockName] || 0;
        const currentValue = holding.qty * currentPrice;
        const costValue = holding.qty * holding.avgPrice;
        const isNowProfit = currentValue > costValue;

        const prevStatus = previousProfitStatus[stockName];

        if (prevStatus === false && isNowProfit) {
            showToast(`🎉 ${stockName} 양전! 수익으로 전환됐습니다!`);
        }

        previousProfitStatus[stockName] = isNowProfit;
    });

    Object.keys(coinPortfolio).forEach(coinId => {
        const holding = coinPortfolio[coinId];
        if (!holding || holding.amount <= 0) return;

        const currentPrice = coinPrices[coinId] || 0;
        const currentValue = holding.amount * currentPrice;
        const costValue = holding.amount * holding.avgPrice;
        const isNowProfit = currentValue > costValue;

        const prevStatus = previousProfitStatus[coinId];

        if (prevStatus === false && isNowProfit) {
            showToast(`🎉 ${coinId} 양전! 수익으로 전환됐습니다!`);
        }

        previousProfitStatus[coinId] = isNowProfit;
    });
}

function renderInfoPrices() {
    const stockContainer = document.getElementById('info-stock-list');
    if (stockContainer) {
        stockContainer.innerHTML = '';
        const BASE_PRICES = STOCK_INITIAL_PRICES;
        
        Object.keys(stockPrices).forEach(stock => {
            const current = stockPrices[stock] || 0;
            const base = BASE_PRICES[stock] || current;
            const change = current - base;
            const changeRate = base > 0 ? (change / base * 100) : 0;
            const isUp = change >= 0;
            
            const div = document.createElement('div');
            div.style.cssText = 'display:flex; justify-content:space-between; align-items:center; padding:6px 4px; border-bottom:1px solid #1e293b; font-size:13px;';
            div.innerHTML = `
                <div style="flex: 1.2; color:#e2e8f0; font-weight:500;">${stock}</div>
                <div style="flex: 1; text-align:right; color:#94a3b8;">${base.toLocaleString()}원</div>
                <div style="flex: 1; text-align:right; color:#fbbf24; font-weight:bold;">${current.toLocaleString()}원</div>
                <div style="flex: 1; text-align:right; color:${isUp ? '#10b981' : '#ef4444'}; font-weight:500;">
                    ${isUp ? '+' : ''}${changeRate.toFixed(1)}%
                </div>
            `;
            stockContainer.appendChild(div);
        });
    }

    const coinContainer = document.getElementById('info-coin-list');
    if (coinContainer && typeof COINS !== 'undefined') {
        coinContainer.innerHTML = '';
        COINS.forEach(coin => {
            const current = coinPrices[coin.id] || 0;
            const base = coin.price || current;
            const change = current - base;
            const changeRate = base > 0 ? (change / base * 100) : 0;
            const isUp = change >= 0;
            
            const div = document.createElement('div');
            div.style.cssText = 'display:flex; justify-content:space-between; align-items:center; padding:6px 4px; border-bottom:1px solid #1e293b; font-size:13px;';
            div.innerHTML = `
                <div style="flex: 1.2; color:#e2e8f0; font-weight:500;">${coin.id}</div>
                <div style="flex: 1; text-align:right; color:#94a3b8;">${base.toLocaleString()}원</div>
                <div style="flex: 1; text-align:right; color:#fbbf24; font-weight:bold;">${current.toLocaleString()}원</div>
                <div style="flex: 1; text-align:right; color:${isUp ? '#10b981' : '#ef4444'}; font-weight:500;">
                    ${isUp ? '+' : ''}${changeRate.toFixed(1)}%
                </div>
            `;
            coinContainer.appendChild(div);
        });
    }
}

// ✨ 주식 아이템 타이머 고장 해결 완벽 적용
function useStockCheat() {
    if (typeof inventory === 'undefined' || !inventory['bm_stock_leak'] || inventory['bm_stock_leak'] <= 0) return;
    inventory['bm_stock_leak'] -= 1;

    const stocks = Object.keys(stockPrices);
    window.hackedStock = stocks[Math.floor(Math.random() * stocks.length)];
    
    showAlert(`✉️ [비밀 찌라시 내용]\n\n"회장님, 지금 당장 [${window.hackedStock}] 종목이 폭등합니다. 풀매수 하십시오."`);
    
    if(typeof renderSmartInventory === 'function') renderSmartInventory();
    
    // 남은 시간을 즉시 0으로 강제해서 기존 시스템(타이머)이 안전하게 다음 턴으로 넘어가게 함
    stockTurnTimer = 0; 
    
    if(typeof saveData === 'function') saveData();
    updateMarketDisplay();
}