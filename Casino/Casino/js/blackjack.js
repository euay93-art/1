// ============================================================
// js/blackjack.js
// 블랙잭 게임 로직 (스플릿, 더블다운 포함)
// ============================================================

let bjDeck = [];
let playerHand = [];
let dealerHand = [];
let bjActiveBet = 0;
let isBjGameActive = false;

let isDoubleDown = false;
let isSplit = false;
let splitHands = [];           
let currentSplitIndex = 0;
let originalBetForSplit = 0;

function resetBlackjackTableUI() {
    document.getElementById("dealer-cards").innerHTML = `<div style="color:#64748b; font-size:12px; margin-top:25px;">딜 대기 중</div>`;
    document.getElementById("player-cards").innerHTML = `<div style="color:#64748b; font-size:12px; margin-top:25px;">딜 대기 중</div>`;
    document.getElementById("dealer-score-lbl").innerText = "Score: 0";
    document.getElementById("player-score-lbl").innerText = "Score: 0";
    document.getElementById("bj-deal-btn").disabled = false;
    document.getElementById("bj-hit-btn").disabled = true;
    document.getElementById("bj-stand-btn").disabled = true;
    document.getElementById("bj-double-btn").disabled = true;
    document.getElementById("bj-split-btn").disabled = true;
    
    isSplit = false; splitHands = []; currentSplitIndex = 0; isDoubleDown = false;

    const cheatBtn = document.getElementById("bj-cheat-btn");
    if (typeof inventory !== 'undefined' && inventory['bm_bj_hack'] > 0) {
        if (!cheatBtn) {
            const btn = document.createElement("button");
            btn.id = "bj-cheat-btn";
            btn.className = "btn-ignition";
            btn.style.cssText = "margin-top:10px; background:linear-gradient(135deg, #b91c1c, #7f1d1d); box-shadow:0 6px 20px rgba(185,28,28,0.5); border:1px solid #ef4444;";
            btn.innerHTML = `🃏 마킹 덱으로 밑장빼기 (보유: ${inventory['bm_bj_hack']}개)`;
            btn.onclick = () => startBlackjackGame(true); 
            const controlsNode = document.querySelector(".bj-controls");
            if (controlsNode) controlsNode.parentNode.appendChild(btn);
        } else {
            cheatBtn.style.display = "block";
            cheatBtn.innerHTML = `🃏 마킹 덱으로 밑장빼기 (보유: ${inventory['bm_bj_hack']}개)`;
        }
    } else if (cheatBtn) {
        cheatBtn.style.display = "none";
    }
}

function buildBlackjackDeck() {
    // 사라졌던 카드 문양(스페이드, 하트, 다이아몬드, 클로버) 복구
    let suits = ['♠', '♥', '♦', '♣']; 
    let values = ['2','3','4','5','6','7','8','9','10','J','Q','K','A'];
    bjDeck = [];
    for (let s of suits) for (let v of values) {
        let weight = parseInt(v); 
        if (['J','Q','K'].includes(v)) weight = 10; 
        if (v === 'A') weight = 11;
        // 하트(♥)와 다이아몬드(♦)일 때만 빨간색으로 표시되도록 조건 복구
        bjDeck.push({ suit: s, value: v, weight: weight, isRed: (s==='♥'||s==='♦') }); 
    }
    for (let i = bjDeck.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        [bjDeck[i], bjDeck[j]] = [bjDeck[j], bjDeck[i]];
    }
}

function calcHandScore(hand) {
    let total = 0, aces = 0;
    hand.forEach(c => { total += c.weight; if (c.value === 'A') aces++; });
    while (total > 21 && aces > 0) { total -= 10; aces--; }
    return total;
}

function renderCardEntity(containerId, card, isHidden) {
    const container = document.getElementById(containerId);
    
    // 🃏 뒷면 카드 (카지노 스타일 고급 패턴)
    if (isHidden) { 
        container.innerHTML += `
        <div style="display: inline-block; margin: 0 4px; width: 62px; height: 88px; background: repeating-linear-gradient(45deg, #1e3a8a, #1e3a8a 5px, #1e40af 5px, #1e40af 10px); border-radius: 6px; border: 2px solid #cbd5e1; box-shadow: 2px 3px 6px rgba(0,0,0,0.5); position: relative; vertical-align: top;">
            <div style="position: absolute; inset: 4px; border: 1px dashed #93c5fd; border-radius: 3px;"></div>
        </div>`; 
        return; 
    }
    
    // 🃏 앞면 카드
    let color = card.isRed ? "#ef4444" : "#0f172a"; // 빨간색(하트,다이아) / 검은색(스페이드,클로버)
    
    let cardHtml = `
    <div style="display: inline-block; margin: 0 4px; width: 62px; height: 88px; background: #ffffff; border-radius: 6px; border: 1px solid #cbd5e1; box-shadow: 2px 3px 6px rgba(0,0,0,0.5); position: relative; color: ${color}; font-family: 'Arial', sans-serif; vertical-align: top;">
        <div style="position: absolute; top: 4px; left: 5px; text-align: center; line-height: 1;">
            <div style="font-size: 15px; font-weight: 900; letter-spacing: -1px;">${card.value}</div>
            <div style="font-size: 12px; margin-top: 1px;">${card.suit}</div>
        </div>
        
        <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); font-size: 34px;">
            ${card.suit}
        </div>
        
        <div style="position: absolute; bottom: 4px; right: 5px; text-align: center; line-height: 1; transform: rotate(180deg);">
            <div style="font-size: 15px; font-weight: 900; letter-spacing: -1px;">${card.value}</div>
            <div style="font-size: 12px; margin-top: 1px;">${card.suit}</div>
        </div>
    </div>`;
    
    container.innerHTML += cardHtml;
}

function startBlackjackGame(useCheat = false) {
    if (isBjGameActive) return;
    bjActiveBet = parseInt(document.getElementById("bj-bet-input").value) || 0;
    if (bjActiveBet <= 0) { bjActiveBet = 100000; document.getElementById("bj-bet-input").value = 100000; }
    if (bjActiveBet > gameChips) { showAlert("💎 충전된 게임 칩 자산이 부족합니다!"); return; }

    gameChips -= bjActiveBet; updateLedgerDisplays();
    isBjGameActive = true; 
    isDoubleDown = false; isSplit = false; splitHands = []; currentSplitIndex = 0;
    if (typeof updateQuestProgress === 'function') updateQuestProgress('bj_play', 1);

    if (useCheat === true && typeof inventory !== 'undefined' && inventory['bm_bj_hack'] > 0) {
        inventory['bm_bj_hack'] -= 1;
        showToast("🕵️ 브로커 J의 마킹 덱으로 바꿔치기 했습니다...", "fail");
        if(typeof saveData === 'function') saveData();
        const cheatBtn = document.getElementById("bj-cheat-btn");
        if(cheatBtn) cheatBtn.style.display = "none"; 
    }

    document.getElementById("bj-deal-btn").disabled = true;
    document.getElementById("bj-hit-btn").disabled = false;
    document.getElementById("bj-stand-btn").disabled = false;
    document.getElementById("bj-double-btn").disabled = false;
    document.getElementById("bj-split-btn").disabled = true;

    document.getElementById("hud-status-text").innerText = "🃏 패 분배 완료. 히트, 더블, 스플릿 또는 스테이 선택하세요.";
    document.getElementById("hud-result-text").innerText = ""; document.getElementById("hud-profit-text").innerText = "";

    buildBlackjackDeck();

    if (useCheat === true) {
        playerHand = [
            { suit: '♠', value: 'A', weight: 11, isRed: false },
            { suit: '♦', value: 'K', weight: 10, isRed: true }
        ];
        dealerHand = [
            { suit: '♣', value: '10', weight: 10, isRed: false },
            { suit: '♥', value: '6', weight: 6, isRed: true }
        ];
    } else {
        playerHand = [bjDeck.pop(), bjDeck.pop()];
        dealerHand = [bjDeck.pop(), bjDeck.pop()];
    }

    document.getElementById("dealer-cards").innerHTML = "";
    document.getElementById("player-cards").innerHTML = "";

    renderCardEntity("dealer-cards", dealerHand[0], false);
    renderCardEntity("dealer-cards", dealerHand[1], true);
    renderCardEntity("player-cards", playerHand[0], false);
    renderCardEntity("player-cards", playerHand[1], false);

    document.getElementById("dealer-score-lbl").innerText = `Score: ${dealerHand[0].weight} + ?`;
    document.getElementById("player-score-lbl").innerText = `Score: ${calcHandScore(playerHand)}`;

    if (playerHand[0].value === playerHand[1].value) {
        document.getElementById("bj-split-btn").disabled = false;
    }

    if (calcHandScore(playerHand) === 21) triggerBlackjackStand();
}

function triggerBlackjackHit() {
    if (!isBjGameActive) return;
    document.getElementById("bj-double-btn").disabled = true;
    
    if (isSplit) {
        const currentHandObj = splitHands[currentSplitIndex];
        if (currentHandObj.finished) return;
        
        currentHandObj.hand.push(bjDeck.pop());
        renderCurrentSplitHand();
        if (typeof AudioSynth !== 'undefined') AudioSynth.playTick();
        
        if (calcHandScore(currentHandObj.hand) > 21) {
            currentHandObj.finished = true;
            setTimeout(() => moveToNextSplitHand(), 600);
        }
    } else {
        playerHand.push(bjDeck.pop());
        let lastIdx = playerHand.length - 1;
        renderCardEntity("player-cards", playerHand[lastIdx], false);
        if (typeof AudioSynth !== 'undefined') AudioSynth.playTick();
        let pScore = calcHandScore(playerHand);
        document.getElementById("player-score-lbl").innerText = `Score: ${pScore}`;
        if (pScore > 21) concludeBlackjackSystem("LOSE_BUST");
    }
}

function triggerBlackjackStand() {
    if (!isBjGameActive) return;
    
    if (isSplit) {
        splitHands[currentSplitIndex].finished = true;
        moveToNextSplitHand();
    } else {
        document.getElementById("dealer-cards").innerHTML = "";
        renderCardEntity("dealer-cards", dealerHand[0], false);
        renderCardEntity("dealer-cards", dealerHand[1], false);

        let dScore = calcHandScore(dealerHand);
        while (dScore < 17) {
            let c = bjDeck.pop(); dealerHand.push(c);
            renderCardEntity("dealer-cards", c, false);
            dScore = calcHandScore(dealerHand);
        }
        document.getElementById("dealer-score-lbl").innerText = `Score: ${dScore}`;
        
        let pScore = calcHandScore(playerHand);
        if (dScore > 21) concludeBlackjackSystem("WIN_DEALER_BUST");
        else if (pScore > dScore) concludeBlackjackSystem("WIN");
        else if (pScore < dScore) concludeBlackjackSystem("LOSE");
        else concludeBlackjackSystem("PUSH");
    }
}

function triggerBlackjackDouble() {
    if (!isBjGameActive) return;
    
    if (isSplit) {
        const currentHandObj = splitHands[currentSplitIndex];
        if (currentHandObj.finished) return;
        
        const doubleCost = currentHandObj.bet;
        if (gameChips < doubleCost) { showAlert("칩이 부족해서 더블 다운을 할 수 없습니다."); return; }
        
        gameChips -= doubleCost;
        currentHandObj.bet += doubleCost; 
        updateLedgerDisplays();
        
        currentHandObj.hand.push(bjDeck.pop());
        renderCurrentSplitHand();
        if (typeof AudioSynth !== 'undefined') AudioSynth.playTick();
        
        currentHandObj.finished = true;
        setTimeout(() => { moveToNextSplitHand(); }, 500);
        
    } else {
        if (isDoubleDown) return;
        
        const doubleCost = bjActiveBet;
        if (gameChips < doubleCost) { showAlert("칩이 부족해서 더블 다운을 할 수 없습니다."); return; }
        
        gameChips -= doubleCost;
        bjActiveBet += doubleCost;
        isDoubleDown = true;
        updateLedgerDisplays();
        
        playerHand.push(bjDeck.pop());
        let lastIdx = playerHand.length - 1;
        renderCardEntity("player-cards", playerHand[lastIdx], false);
        if (typeof AudioSynth !== 'undefined') AudioSynth.playTick();
        
        let pScore = calcHandScore(playerHand);
        document.getElementById("player-score-lbl").innerText = `Score: ${pScore}`;
        
        document.getElementById("bj-hit-btn").disabled = true;
        document.getElementById("bj-double-btn").disabled = true;
        document.getElementById("bj-split-btn").disabled = true;
        
        setTimeout(() => {
            if (pScore > 21) concludeBlackjackSystem("LOSE_BUST");
            else triggerBlackjackStand();
        }, 600);
    }
}

function triggerBlackjackSplit() {
    if (!isBjGameActive || isSplit) return;
    if (playerHand.length !== 2 || playerHand[0].value !== playerHand[1].value) {
        showAlert("스플릿은 첫 두 장의 카드가 같은 랭크일 때만 가능합니다."); return;
    }
    
    const additionalBet = bjActiveBet;
    if (gameChips < additionalBet) { showAlert("추가 배팅할 게임 칩이 부족합니다."); return; }
    
    gameChips -= additionalBet; updateLedgerDisplays();
    
    isSplit = true;
    originalBetForSplit = bjActiveBet;
    bjActiveBet = originalBetForSplit * 2; 
    
    const card1 = playerHand[0], card2 = playerHand[1];
    splitHands = [
        { hand: [card1, bjDeck.pop()], bet: originalBetForSplit, finished: false },
        { hand: [card2, bjDeck.pop()], bet: originalBetForSplit, finished: false }
    ];
    currentSplitIndex = 0;
    
    document.getElementById("bj-split-btn").disabled = true;
    document.getElementById("bj-double-btn").disabled = false;
    
    renderSplitUI(); updateSplitHandControls();
    
    document.getElementById("hud-status-text").innerText = `🃏 스플릿 완료! [Hand 1/2] 플레이 중 | 총 배팅: ${(originalBetForSplit * 2).toLocaleString()}원`;
    
    if (calcHandScore(splitHands[0].hand) === 21) {
        setTimeout(() => { splitHands[0].finished = true; moveToNextSplitHand(); }, 800);
    }
}

function renderSplitUI() {
    const playerZone = document.getElementById("player-cards");
    playerZone.innerHTML = "";
    
    const statusDiv = document.createElement("div");
    statusDiv.id = "split-hand-status";
    statusDiv.style.cssText = "margin-bottom:8px; font-size:13px; color:#fbbf24; font-weight:bold;";
    statusDiv.innerHTML = `Hand ${currentSplitIndex + 1}/2 <span style="color:#64748b;">(다른 핸드는 대기 중)</span>`;
    playerZone.appendChild(statusDiv);
    
    const currentHand = splitHands[currentSplitIndex].hand;
    currentHand.forEach(card => renderCardEntity("player-cards", card, false));
    document.getElementById("player-score-lbl").innerText = `Hand ${currentSplitIndex + 1} Score: ${calcHandScore(currentHand)}`;
}

function renderCurrentSplitHand() {
    const playerZone = document.getElementById("player-cards");
    playerZone.innerHTML = "";
    
    const statusDiv = document.createElement("div");
    statusDiv.id = "split-hand-status";
    statusDiv.style.cssText = "margin-bottom:8px; font-size:13px; color:#fbbf24; font-weight:bold;";
    statusDiv.innerHTML = `Hand ${currentSplitIndex + 1}/2 플레이 중`;
    playerZone.appendChild(statusDiv);
    
    const currentHand = splitHands[currentSplitIndex].hand;
    currentHand.forEach(card => renderCardEntity("player-cards", card, false));
    document.getElementById("player-score-lbl").innerText = `Hand ${currentSplitIndex + 1} Score: ${calcHandScore(currentHand)}`;
}

function updateSplitHandControls() {
    if (!isSplit) return;
    const hitBtn = document.getElementById("bj-hit-btn");
    const standBtn = document.getElementById("bj-stand-btn");
    const doubleBtn = document.getElementById("bj-double-btn");
    const current = splitHands[currentSplitIndex];
    
    if (current.finished) {
        hitBtn.disabled = true; standBtn.disabled = true; doubleBtn.disabled = true;
    } else {
        hitBtn.disabled = false; standBtn.disabled = false; doubleBtn.disabled = false;
    }
    document.getElementById("bj-split-btn").disabled = true;
}

function moveToNextSplitHand() {
    splitHands[currentSplitIndex].finished = true;
    let nextIndex = splitHands.findIndex(h => !h.finished);
    
    if (nextIndex !== -1) {
        currentSplitIndex = nextIndex;
        renderCurrentSplitHand(); updateSplitHandControls();
        document.getElementById("hud-status-text").innerText = `🃏 [Hand ${currentSplitIndex + 1}/2] 플레이 중`;
        if (calcHandScore(splitHands[currentSplitIndex].hand) === 21) {
            setTimeout(() => { splitHands[currentSplitIndex].finished = true; moveToNextSplitHand(); }, 700);
        }
    } else {
        concludeAllSplitHands();
    }
}

function concludeAllSplitHands() {
    isBjGameActive = false;
    document.getElementById("dealer-cards").innerHTML = "";
    renderCardEntity("dealer-cards", dealerHand[0], false);
    renderCardEntity("dealer-cards", dealerHand[1], false);
    
    let dScore = calcHandScore(dealerHand);
    while (dScore < 17) {
        let c = bjDeck.pop(); dealerHand.push(c);
        renderCardEntity("dealer-cards", c, false);
        dScore = calcHandScore(dealerHand);
    }
    document.getElementById("dealer-score-lbl").innerText = `Score: ${dScore}`;
    
    // ✨ 스플릿 수익/손실 및 반환 금액 이중 차감 버그 완벽 수정
    let totalReturn = 0; 
    let totalBetSpent = 0;
    let results = [];
    
    splitHands.forEach((sh, idx) => {
        totalBetSpent += sh.bet; // 배팅한 총 원금 추적 (더블다운 고려)
        const pScore = calcHandScore(sh.hand);
        let handResult = "", handNetProfit = 0, handReturn = 0;
        
        if (pScore > 21) { handResult = "BUST"; handReturn = 0; handNetProfit = -sh.bet; }
        else if (dScore > 21) { handResult = "WIN (딜러 버스트)"; handReturn = sh.bet * 2; handNetProfit = sh.bet; }
        else if (pScore > dScore) { handResult = "WIN"; handReturn = sh.bet * 2; handNetProfit = sh.bet; }
        else if (pScore < dScore) { handResult = "LOSE"; handReturn = 0; handNetProfit = -sh.bet; }
        else { handResult = "PUSH"; handReturn = sh.bet; handNetProfit = 0; }
        
        totalReturn += handReturn;
        results.push({ hand: idx + 1, score: pScore, result: handResult, profit: handNetProfit });
    });
    
    gameChips += totalReturn; // 계산된 반환금액만 더해줌 (이중차감 방지)
    
    const hStatus = document.getElementById("hud-status-text");
    const hResult = document.getElementById("hud-result-text");
    const hProfit = document.getElementById("hud-profit-text");
    const flash = document.getElementById("flash-overlay");
    
    hStatus.innerText = "🃏 스플릿 라운드 정산 완료";
    let resultHTML = "";
    let netProfit = totalReturn - totalBetSpent; // 정확한 순이익 계산
    
    results.forEach(r => {
        const color = r.profit > 0 ? "#10b981" : (r.profit < 0 ? "#ef4444" : "#94a3b8");
        resultHTML += `Hand ${r.hand}: ${r.score}점 → <span style="color:${color}">${r.result}</span> (${r.profit > 0 ? '+' : ''}${r.profit.toLocaleString()}원)<br>`;
    });
    hResult.innerHTML = resultHTML;
    
    if (netProfit > 0) {
        hProfit.innerHTML = `<span style="color:#10b981;">🎉 스플릿 승리! 순수익 +${netProfit.toLocaleString()} 원</span>`;
        if(flash) { flash.style.display = "block"; flash.className = "flash-win-effect"; setTimeout(() => flash.style.display = "none", 1200); }
        if (typeof AudioSynth !== 'undefined') AudioSynth.playWin();
        
        if (netProfit > (gameStats.blackjack.maxSingleWin || 0)) gameStats.blackjack.maxSingleWin = netProfit;

        gameStats.blackjack.wins++;
        gameStats.blackjack.profit += netProfit;
        gameStats.totalProfit += netProfit;
    } else if (netProfit < 0) {
        hProfit.innerHTML = `<span style="color:#ef4444;">📉 스플릿 패배... 순손실 ${netProfit.toLocaleString()} 원</span>`;
        if(flash) { flash.style.display = "block"; flash.className = "flash-fail-effect"; setTimeout(() => flash.style.display = "none", 1000); }
        if (typeof AudioSynth !== 'undefined') AudioSynth.playLose();
        
        if (Math.abs(netProfit) > (gameStats.blackjack.maxSingleLoss || 0)) gameStats.blackjack.maxSingleLoss = Math.abs(netProfit);

        gameStats.blackjack.loss += Math.abs(netProfit);
        gameStats.totalLoss += Math.abs(netProfit);
    } else {
        hProfit.innerHTML = `<span style="color:#94a3b8;">🤝 스플릿 무승부 (원금 반환)</span>`;
    }
    
    gameStats.blackjack.plays++; gameStats.totalGames++;
    
    document.getElementById("bj-deal-btn").disabled = false;
    document.getElementById("bj-hit-btn").disabled = true;
    document.getElementById("bj-stand-btn").disabled = true;
    document.getElementById("bj-double-btn").disabled = true;
    document.getElementById("bj-split-btn").disabled = true;
    
    updateLedgerDisplays(); saveData();
    
    setTimeout(() => { if (!isBjGameActive) resetBlackjackTableUI(); }, 5500);
}

function concludeBlackjackSystem(condition) {
    isBjGameActive = false; isDoubleDown = false; isSplit = false;
    document.getElementById("bj-deal-btn").disabled = false;
    document.getElementById("bj-hit-btn").disabled = true;
    document.getElementById("bj-stand-btn").disabled = true;
    document.getElementById("bj-double-btn").disabled = true;
    document.getElementById("bj-split-btn").disabled = true;

    const hStatus = document.getElementById("hud-status-text");
    const hResult = document.getElementById("hud-result-text");
    const hProfit = document.getElementById("hud-profit-text");
    const flash = document.getElementById("flash-overlay");

    let pScore = calcHandScore(playerHand);
    let dScore = calcHandScore(dealerHand);
    hStatus.innerText = "🃏 블랙잭 라운드 정산 완료";
    hResult.innerHTML = `나의 스코어: <b>${pScore}</b> 🆚 딜러 스코어: <b>${dScore}</b>`;

    let profitLog = "", logClr = "";

    if (condition === "WIN" || condition === "WIN_DEALER_BUST") {
        let isNaturalBlackjack = (pScore === 21 && playerHand.length === 2);
        let winCash = isNaturalBlackjack ? Math.floor(bjActiveBet * 2.5) : bjActiveBet * 2; 
        
        const profitBonus = typeof applyProfitBonus === 'function' ? applyProfitBonus(winCash, 'blackjack') : 0;
        const finalWinCash = winCash + profitBonus;
        const netProfit = finalWinCash - bjActiveBet; 
        
        profitLog = `+${finalWinCash.toLocaleString()} 원`; logClr = "color:#10b981; font-weight:bold;";
        hProfit.innerHTML = `<span style="color:#fbbf24;">💰 수령 대기중... 모달에서 수령하세요</span>`;
        
        if (typeof showClaimWinningsModal === 'function') {
            showClaimWinningsModal({
                title: isNaturalBlackjack ? '🃏 자연 블랙잭 승리 수령' : '🃏 블랙잭 승리 수령',
                betLabel: '배팅 금액',
                betAmount: bjActiveBet,
                multiplier: isNaturalBlackjack ? 2.5 : 2.0,
                grossAmount: winCash,
                bonusAmount: profitBonus,
                finalAmount: finalWinCash,
                profitAmount: netProfit,
                gameTypeForBreakdown: 'blackjack',
                onClaim: () => {
                    gameChips += finalWinCash;
                    let bjMsg = isNaturalBlackjack ? `🎉 자연 블랙잭! (3:2) +${finalWinCash.toLocaleString()} 원` : `🎉 승리! +${finalWinCash.toLocaleString()} 원`;
                    if (profitBonus > 0) bjMsg += ` <span style="color:#4ade80;">(+${profitBonus.toLocaleString()} 보너스)</span>`;
                    
                    hProfit.innerHTML = `<span style="color:#10b981;">${bjMsg}</span>`;
                    if(flash) { flash.style.display = "block"; flash.className = "flash-win-effect"; setTimeout(() => flash.style.display = "none", 1000); }
                    if (typeof AudioSynth !== 'undefined') AudioSynth.playWin();
                    if (typeof updateQuestProgress === 'function') updateQuestProgress('profit', finalWinCash);
                    
                    if (finalWinCash > (gameStats.blackjack.maxSingleWin || 0)) gameStats.blackjack.maxSingleWin = finalWinCash;

                    gameStats.blackjack.wins++;
                    gameStats.blackjack.profit += netProfit;
                    gameStats.totalProfit += netProfit;
                    
                    if (isNaturalBlackjack) gameStats.blackjack.blackjacks++;
                    
                    updateLedgerDisplays(); saveData();
                }
            });
        }
    } else if (condition === "LOSE" || condition === "LOSE_BUST") {
        let displayMsg = (condition==="LOSE_BUST") ? "버스트(21초과)로 패배했습니다!" : "딜러 하이 스코어로 패배했습니다.";
        hProfit.innerHTML = `<span style="color:#ef4444;">📉 패배... ${displayMsg} -${bjActiveBet.toLocaleString()} 원</span>`;
        profitLog = `-${bjActiveBet.toLocaleString()} 원`; logClr = "color:#ef4444;";
        if(flash) { flash.style.display = "block"; flash.className = "flash-fail-effect"; setTimeout(() => flash.style.display = "none", 1000); }
        if (typeof AudioSynth !== 'undefined') AudioSynth.playLose();
        
        if (bjActiveBet > (gameStats.blackjack.maxSingleLoss || 0)) gameStats.blackjack.maxSingleLoss = bjActiveBet;

        gameStats.blackjack.loss += bjActiveBet;
        gameStats.totalLoss += bjActiveBet;
        if (condition === "LOSE_BUST") gameStats.blackjack.busts++;
    } else {
        gameChips += bjActiveBet;
        hProfit.innerHTML = `<span style="color:#94a3b8;">🤝 무승부(Push) 처리되어 배팅액이 원금 반환되었습니다.</span>`;
        profitLog = "0 원 (무승부)"; logClr = "color:#94a3b8;";
    }

    if (typeof appendLogRecord === 'function') appendLogRecord(`[블랙잭 승부] 내:${pScore}/딜러:${dScore} 결과: ${condition}`, profitLog, logClr);

    gameStats.blackjack.plays++;
    gameStats.totalGames++;

    updateLedgerDisplays(); saveData();
}