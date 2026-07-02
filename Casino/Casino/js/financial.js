// ============================================================
// js/financial.js
// 금융 시스템: 입출금, 이자 계산, 자산 업데이트 및 % 배팅
// ============================================================

function updateTopAssetPremiumEffects() {
    const bar = document.getElementById('top-asset-bar');
    if (!bar) return;

    const total = getTotalAsset();
    bar.classList.remove('premium-gold', 'premium-premium', 'premium-legend', 'rebal-mode');

    if (total >= 10000000000) bar.classList.add('premium-legend');       // 100억 이상
    else if (total >= 1000000000) bar.classList.add('premium-premium');  // 10억 이상
    else if (total >= 100000000) bar.classList.add('premium-gold');      // 1억 이상
}

function calculatePortfolioValue() {
    let total = 0;
    for (let stock in portfolio) {
        if (portfolio[stock].qty > 0) total += portfolio[stock].qty * stockPrices[stock];
    }
    return Math.floor(total);
}

function calculateCoinPortfolioValue() {
    let total = 0;
    for (let coinId in coinPortfolio) {
        const holding = coinPortfolio[coinId];
        if (holding.amount > 0) {
            const currentPrice = coinPrices[coinId] || 0;
            total += holding.amount * currentPrice;
        }
    }
    return Math.floor(total);
}

function getTotalAsset() {
    return bankAsset + gameChips + calculatePortfolioValue() + calculateCoinPortfolioValue() + savingsBalance + pendingInterest;
}

function formatKoreanMoneyFull(amount) {
    if (amount === 0) return "0";
    const absAmt = Math.abs(amount);
    let result = "";
    
    const jo = Math.floor(absAmt / 1000000000000);
    const eok = Math.floor((absAmt % 1000000000000) / 100000000);
    const man = Math.floor((absAmt % 100000000) / 10000);
    const won = Math.floor(absAmt % 10000);

    if (jo > 0) result += `${jo.toLocaleString()}조 `;
    if (eok > 0) result += `${eok.toLocaleString()}억 `;
    if (man > 0) result += `${man.toLocaleString()}만 `;
    if (won > 0 || result === "") result += `${won.toLocaleString()}`;
    
    return (amount < 0 ? "-" : "") + result.trim();
}

// 기존 자산 UI 업데이트 함수 덮어쓰기
function updateLedgerDisplays() {
    document.getElementById("bank-txt").innerText = formatKoreanMoneyFull(bankAsset) + " 원";
    document.getElementById("chips-txt").innerText = formatKoreanMoneyFull(gameChips) + " 원";
    
    const savEl = document.getElementById("savings-txt");
    if (savEl) savEl.innerText = formatKoreanMoneyFull(savingsBalance) + " 원";
    
    const pendEl = document.getElementById("pending-interest-txt");
    if (pendEl) pendEl.innerHTML = `대기 이자: <span style="color:#fbbf24; font-weight:900;">${formatKoreanMoneyFull(pendingInterest)} 원</span>`;
    
    if (typeof updateSavingsInterestTimer === 'function') updateSavingsInterestTimer();

    const mBank = document.getElementById("market-bank");
    const mChips = document.getElementById("market-chips");
    const mPortfolio = document.getElementById("market-portfolio-value");
    const mTotal = document.getElementById("market-total-asset");
    
    if (mBank) mBank.innerText = formatKoreanMoneyFull(bankAsset) + " 원";
    if (mChips) mChips.innerText = formatKoreanMoneyFull(gameChips) + " 원";
    if (mPortfolio && mTotal) {
        const portfolioValue = calculatePortfolioValue();
        mPortfolio.innerText = formatKoreanMoneyFull(portfolioValue) + " 원";
        mTotal.innerText = formatKoreanMoneyFull(bankAsset + gameChips + portfolioValue) + " 원";
        if (typeof updateQuestProgress === 'function') updateQuestProgress('portfolio_value', portfolioValue);
        if (portfolioValue > (gameStats.stock.maxPortfolioValue || 0)) {
            gameStats.stock.maxPortfolioValue = portfolioValue;
        }
    }
    updatePercentButtonLabels();
    
    const topTotal = document.getElementById("top-total-asset");
    if (topTotal) topTotal.innerText = formatKoreanMoneyFull(getTotalAsset()) + " 원";
    
    updateTopAssetPremiumEffects();
    
    const bTotal = document.getElementById("bottom-total");
    const bBank = document.getElementById("bottom-bank");
    const bChips = document.getElementById("bottom-chips");
    if (bTotal) bTotal.innerText = formatKoreanMoneyFull(getTotalAsset());
    if (bBank) bBank.innerText = formatKoreanMoneyFull(bankAsset);
    if (bChips) bChips.innerText = formatKoreanMoneyFull(gameChips);
    
    if (activeTab === 'market' && typeof updateBuyPercentButtons === 'function') {
        setTimeout(() => { updateBuyPercentButtons(); }, 10);
    }
    
    const coinBankEl = document.getElementById("coin-market-bank");
    const coinChipsEl = document.getElementById("coin-market-chips");
    const coinTotalEl = document.getElementById("coin-market-total-asset");
    const coinPortfolioEl = document.getElementById("coin-market-portfolio-value");
    
    if (coinBankEl) coinBankEl.innerText = formatKoreanMoneyFull(bankAsset) + " 원";
    if (coinChipsEl) coinChipsEl.innerText = formatKoreanMoneyFull(gameChips) + " 원";
    if (coinTotalEl) coinTotalEl.innerText = formatKoreanMoneyFull(getTotalAsset()) + " 원";
    if (coinPortfolioEl) coinPortfolioEl.innerText = formatKoreanMoneyFull(calculateCoinPortfolioValue()) + " 원";
}

function remitCapital(amt) {
    if (isGameRunning || (typeof isBjGameActive !== 'undefined' && isBjGameActive)) return;
    if (amt === 'ALL') amt = bankAsset;
    if (amt <= 0) return;
    if (bankAsset < amt) { showAlert("🏦 은행 계좌 잔액이 부족합니다!"); return; }
    bankAsset -= amt; gameChips += amt;
    updateLedgerDisplays(); AudioSynth.playCoin(); 
    if (typeof saveData === 'function') saveData();
}

function refundCapital() {
    if (isGameRunning || (typeof isBjGameActive !== 'undefined' && isBjGameActive)) return;
    if (gameChips <= 0) return;
    bankAsset += gameChips; gameChips = 0;
    updateLedgerDisplays(); AudioSynth.playCoin(); 
    if (typeof saveData === 'function') saveData();
}

function showChargeAmountModal() {
    if (isGameRunning || (typeof isBjGameActive !== 'undefined' && isBjGameActive)) return;
    showAmountInputModal({
        title: "💰 직접 충전하기",
        subtitle: "은행 계좌에서 게임 칩으로 이동할 금액을 입력하세요",
        confirmText: "충전하기",
        confirmColor: "#059669",
        minAmount: 10000,
        maxAmount: bankAsset, // ✨ MAX 버튼용 최대치 전달
        callback: (amount) => {
            if (bankAsset < amount) { showAlert("🏦 은행 계좌 잔액이 부족합니다!"); return; }
            bankAsset -= amount; gameChips += amount;
            updateLedgerDisplays(); AudioSynth.playCoin(); 
            if (typeof saveData === 'function') saveData();
            const hStatus = document.getElementById("hud-status-text");
            if (hStatus) hStatus.innerText = `💰 [충전 완료] +${amount.toLocaleString()}원 이동`;
        }
    });
}

function showExchangeAmountModal() {
    if (isGameRunning || (typeof isBjGameActive !== 'undefined' && isBjGameActive)) return;
    showAmountInputModal({
        title: "💸 직접 환전하기",
        subtitle: "게임 칩을 은행 계좌로 이동할 금액을 입력하세요",
        confirmText: "환전하기",
        confirmColor: "#475569",
        minAmount: 10000,
        maxAmount: gameChips, // ✨ MAX 버튼용 최대치 전달
        callback: (amount) => {
            if (gameChips < amount) { showAlert("💎 보유 칩이 부족합니다!"); return; }
            gameChips -= amount; bankAsset += amount;
            updateLedgerDisplays(); AudioSynth.playCoin(); 
            if (typeof saveData === 'function') saveData();
            const hStatus = document.getElementById("hud-status-text");
            if (hStatus) hStatus.innerText = `💸 [환전 완료] +${amount.toLocaleString()}원 이동`;
        }
    });
}

function chargeAllBankToChips() {
    if (isGameRunning || (typeof isBjGameActive !== 'undefined' && isBjGameActive)) return;
    if (bankAsset <= 0) { showAlert("🏦 충전할 은행 잔액이 없습니다."); return; }
    remitCapital('ALL');
}

function exchangeAllChipsToBank() {
    if (isGameRunning || (typeof isBjGameActive !== 'undefined' && isBjGameActive)) return;
    if (gameChips <= 0) { showAlert("💎 환전할 칩이 없습니다."); return; }
    refundCapital();
}

function showSavingsDepositModal() {
    if (isGameRunning || (typeof isBjGameActive !== 'undefined' && isBjGameActive)) return;
    if (bankAsset < 10000) { showAlert("🏦 은행 잔고가 부족합니다. (최소 10,000원 필요)"); return; }
    showAmountInputModal({
        title: "📥 적금 입금하기",
        subtitle: "은행 계좌 → 적금 계좌로 이동할 금액 (수수료 없음)",
        confirmText: "입금하기",
        confirmColor: "#059669",
        minAmount: 10000,
        maxAmount: bankAsset, // ✨ MAX 버튼용 최대치 전달
        callback: (amount) => {
            if (bankAsset < amount) { showAlert("🏦 은행 계좌 잔액이 부족합니다!"); return; }
            bankAsset -= amount; savingsBalance += amount;
            updateLedgerDisplays(); AudioSynth.playCoin(); 
            if (typeof saveData === 'function') saveData();
            updateSavingsInterestTimer();
            const hStatus = document.getElementById("hud-status-text");
            if (hStatus) hStatus.innerText = `📥 [적금 입금 완료] +${amount.toLocaleString()}원`;
        }
    });
}

function showSavingsWithdrawModal() {
    if (isGameRunning || (typeof isBjGameActive !== 'undefined' && isBjGameActive)) return;
    if (savingsBalance < 10000) { showAlert("🏦 적금 잔고가 부족합니다. (최소 10,000원 필요)"); return; }
    showAmountInputModal({
        title: "📤 적금 출금하기",
        subtitle: "적금 계좌 → 은행 계좌로 이동할 금액 (수수료 없음)",
        confirmText: "출금하기",
        confirmColor: "#475569",
        minAmount: 10000,
        maxAmount: savingsBalance, // ✨ MAX 버튼용 최대치 전달
        callback: (amount) => {
            if (savingsBalance < amount) { showAlert("🏦 적금 계좌 잔액이 부족합니다!"); return; }
            savingsBalance -= amount; bankAsset += amount;
            updateLedgerDisplays(); AudioSynth.playCoin(); 
            if (typeof saveData === 'function') saveData();
            updateSavingsInterestTimer();
            const hStatus = document.getElementById("hud-status-text");
            if (hStatus) hStatus.innerText = `📤 [적금 출금 완료] +${amount.toLocaleString()}원 → 은행`;
        }
    });
}

function claimPendingInterest() {
    if (pendingInterest <= 0) { showAlert("💰 수령할 이자가 없습니다."); return; }
    const amount = pendingInterest;
    bankAsset += amount; pendingInterest = 0;
    updateLedgerDisplays(); AudioSynth.playWin(); 
    if (typeof saveData === 'function') saveData();

    const hud = document.getElementById('hud-profit-text');
    if (hud) {
        hud.innerHTML = `<span style="color:#10b981; font-weight:900;">💰 이자 수령 완료! +${amount.toLocaleString()} 원 → 은행 입금</span>`;
        setTimeout(() => { if (hud) hud.innerHTML = ''; }, 3200);
    }
    appendLogRecord('[적금 이자]', `+${amount.toLocaleString()} 원 수령`, 'color:#10b981; font-weight:bold;');
    updateSavingsInterestTimer();
}

function calculateAndApplyInterest() {
    const now = Date.now();
    const elapsed = now - lastInterestTime;
    const intervalMs = 3 * 60 * 1000; // 3분
    if (elapsed >= intervalMs && savingsBalance > 0) {
        const periods = Math.floor(elapsed / intervalMs);
        if (periods > 0) {
            let baseRate = 0.0008; // 기본 0.08%
            
            // 1. 매력(CHA) 스탯 보너스
            if (typeof playerStats !== 'undefined' && playerStats.cha > 0) {
                baseRate += playerStats.cha * 0.000002; 
            }
            // 2. 시너지 보너스
            let synergyBonus = 0;
            if (typeof getCollectionSynergyBuffs === 'function') {
                synergyBonus = getCollectionSynergyBuffs().interestRate / 100;
            }
            const rate = baseRate + synergyBonus;
            const interest = Math.floor(savingsBalance * rate * periods);
            
            if (interest > 0) {
                pendingInterest += interest;
                
                // ✨ 통계 데이터 누적 (예금 이자 발생)
                if (!gameStats.events) gameStats.events = { occurrences: 0, profit: 0, loss: 0, interest: 0 };
                gameStats.events.interest += interest;

                const hudProfit = document.getElementById('hud-profit-text');
                if (hudProfit && interest >= 5000) {
                    hudProfit.innerHTML = `<span style="color:#34d399;">예금 이자 발생 +${interest.toLocaleString()} 칩 <span style="font-size:11px;">(이율: ${(rate*100).toFixed(3)}%)</span></span>`;
                    setTimeout(() => {
                        if (hudProfit && hudProfit.innerHTML.includes('예금 이자 발생')) hudProfit.innerHTML = '';
                    }, 2800);
                }
            }
            lastInterestTime = now - (elapsed % intervalMs);
            updateLedgerDisplays();
            if (typeof saveData === 'function') saveData();
        }
    }
}

function updateSavingsInterestTimer() {
    const timerEl = document.getElementById('savings-interest-timer');
    if (!timerEl) return;
    const now = Date.now();
    const elapsed = now - lastInterestTime;
    const intervalMs = 3 * 60 * 1000;
    let remaining = intervalMs - (elapsed % intervalMs);
    if (remaining < 0) remaining = 0;
    const min = Math.floor(remaining / 60000);
    const sec = Math.floor((remaining % 60000) / 1000);
    timerEl.innerHTML = `⏱ 다음 이자: <span style="color:#fbbf24; font-weight:900;">${min}:${sec.toString().padStart(2, '0')}</span>`;
}

function startInterestTimer() {
    calculateAndApplyInterest();
    updateSavingsInterestTimer();
    if (window.savingsDisplayTimer) clearInterval(window.savingsDisplayTimer);
    window.savingsDisplayTimer = setInterval(() => updateSavingsInterestTimer(), 1000);
    if (window.interestTimerInterval) clearInterval(window.interestTimerInterval);
    window.interestTimerInterval = setInterval(() => {
        calculateAndApplyInterest();
        updateSavingsInterestTimer();
    }, 25000);
}

function setBetByPercent(gameType, percent) {
    const chips = gameChips;
    let amount = Math.floor(chips * (percent / 100));
    let inputId = gameType === 'ladder' ? "bet-amount-input" : 
                  gameType === 'bj' ? "bj-bet-input" : 
                  gameType === 'roulette' ? "roulette-bet-amount" : 
                  gameType === 'toto' ? "toto-bet-amount" : "arena-bet-amount";
    const input = document.getElementById(inputId);
    if (input) input.value = amount;
}

function setBetToAllIn(gameType) {
    let inputId = gameType === 'ladder' ? "bet-amount-input" : 
                  gameType === 'bj' ? "bj-bet-input" : 
                  gameType === 'roulette' ? "roulette-bet-amount" : 
                  gameType === 'toto' ? "toto-bet-amount" : "arena-bet-amount";
    const input = document.getElementById(inputId);
    if (input) input.value = gameChips;
}

function resetBetCash(gameType) {
    let inputId = gameType === 'ladder' ? "bet-amount-input" : 
                  gameType === 'bj' ? "bj-bet-input" : 
                  gameType === 'roulette' ? "roulette-bet-amount" : 
                  gameType === 'toto' ? "toto-bet-amount" : "arena-bet-amount";
    const el = document.getElementById(inputId);
    if (el) el.value = 100000;
}

function updatePercentButtonLabels() {
    const chips = gameChips || 0;
    const buttons = [
        {id: 'ladder-10', percent: 10}, {id: 'ladder-25', percent: 25}, {id: 'ladder-50', percent: 50},
        {id: 'bj-10', percent: 10}, {id: 'bj-25', percent: 25}, {id: 'bj-50', percent: 50},
        {id: 'toto-10', percent: 10}, {id: 'toto-25', percent: 25}, {id: 'toto-50', percent: 50}
    ];
    buttons.forEach(b => {
        const btn = document.getElementById(b.id);
        if (btn) {
            const amount = Math.floor(chips * (b.percent / 100));
            btn.innerHTML = `${b.percent}%<br><span style="font-size:10px; opacity:0.75;">₩${amount.toLocaleString()}</span>`;
        }
    });
}