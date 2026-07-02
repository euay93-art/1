// ============================================================
// js/ladder.js
// 사다리 캔버스 렌더링 및 게임 로직
// ============================================================

let selectedTarget = "";
let selectedOdds = 0.0;
let ladderInterval = null;
let currentStartDir = "좌";
let currentLinesCount = 3;
let horizontalBridges = [];
let canvas, ctx;
let pathPointsList = [];
let tracerBallCoord = { x: 0, y: 0 };
let timeRemaining = 15;
let currentRound = 1;

function selectBetTarget(opt, rate) {
    if (isGameRunning) return;
    selectedTarget = opt; selectedOdds = rate;
    document.querySelectorAll('#section-ladder .btn-opt').forEach(b => b.classList.remove('active'));
    document.getElementById("target-" + opt).classList.add('active');
    if (typeof AudioSynth !== 'undefined') AudioSynth.playTick();
}

function compileNextLadderStructure() {
    currentStartDir = Math.random() < 0.5 ? "좌" : "우";
    currentLinesCount = Math.random() < 0.5 ? 3 : 4;
    horizontalBridges = [];
    if (currentLinesCount === 3) {
        [110, 190, 270].forEach((h, i) => horizontalBridges.push({ y: h, color: i % 2 === 0 ? "#b91c1c" : "#0369a1" }));
    } else {
        [90, 150, 210, 270].forEach((h, i) => horizontalBridges.push({ y: h, color: i % 2 === 0 ? "#b91c1c" : "#0369a1" }));
    }
}

function paintCanvasFrame() {
    if (!canvas || !ctx) {
        canvas = document.getElementById("ladderCanvas");
        if(canvas) ctx = canvas.getContext("2d");
        if(!ctx) return;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#020617"; ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.lineWidth = 5; ctx.lineCap = "round"; ctx.strokeStyle = "#334155";
    ctx.beginPath(); ctx.moveTo(80, 40); ctx.lineTo(80, 340); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(260, 40); ctx.lineTo(260, 340); ctx.stroke();

    if (isGameRunning) {
        ctx.lineWidth = 4;
        horizontalBridges.forEach(b => {
            ctx.strokeStyle = b.color; ctx.beginPath(); ctx.moveTo(80, b.y); ctx.lineTo(260, b.y); ctx.stroke();
        });
    }

    function drawNodeBall(x, y, txt, c) {
        ctx.lineWidth = 2; ctx.strokeStyle = "#475569"; ctx.fillStyle = "#0f172a";
        ctx.beginPath(); ctx.arc(x, y, 15, 0, Math.PI*2); ctx.fill(); ctx.stroke();
        ctx.fillStyle = c; ctx.font = "bold 12px sans-serif";
        ctx.textBaseline = "middle"; ctx.textAlign = "center"; ctx.fillText(txt, x, y);
    }
    
    drawNodeBall(80, 35, "좌", "#f8fafc"); drawNodeBall(260, 35, "우", "#f8fafc");
    drawNodeBall(80, 345, "홀", "#f87171"); drawNodeBall(260, 345, "짝", "#34d399");

    if (isGameRunning) {
        ctx.fillStyle = "#fbbf24"; ctx.beginPath();
        ctx.arc(tracerBallCoord.x, tracerBallCoord.y, 8, 0, Math.PI*2); ctx.fill();
    }
}

function initializeTimerSequence() {
    clearInterval(ladderInterval); timeRemaining = 15;
    const timerDisplay = document.getElementById("timer-display");
    if (timerDisplay) timerDisplay.innerText = "00:15";
    
    let cheatBtn = document.getElementById('ladder-cheat-btn');
    if (typeof inventory !== 'undefined' && inventory['bm_ladder_hack'] > 0) {
        if (!cheatBtn) {
            const board = document.querySelector('#section-ladder .console-board');
            cheatBtn = document.createElement('button');
            cheatBtn.id = 'ladder-cheat-btn';
            cheatBtn.className = 'btn-ignition';
            cheatBtn.style.cssText = "margin-bottom:12px; background:linear-gradient(135deg, #1e3a8a, #1e1b4b); box-shadow:0 4px 15px rgba(30,58,138,0.5); border:1px solid #3b82f6;";
            cheatBtn.onclick = useLadderCheat;
            board.insertBefore(cheatBtn, board.firstChild);
        }
        cheatBtn.style.display = 'block';
        cheatBtn.innerHTML = `👁️ 적외선 렌즈로 다음 결과 투시하기 (보유: ${inventory['bm_ladder_hack']}개)`;
    } else if (cheatBtn) {
        cheatBtn.style.display = 'none';
    }

    ladderInterval = setInterval(() => {
        timeRemaining--;
        if (timeRemaining <= 0) {
            clearInterval(ladderInterval); 
            if (timerDisplay) timerDisplay.innerText = "00:00";
            if (selectedTarget === "") {
                const hStatus = document.getElementById("hud-status-text");
                if (hStatus) hStatus.innerText = "📢 배팅 미참여 상태로 카운트다운이 마감되어 회차가 패스되었습니다.";
                compileNextLadderStructure(); paintCanvasFrame(); initializeTimerSequence();
            } else { 
                launchLadderEngine(); 
            }
            return;
        }
        if (timerDisplay) timerDisplay.innerText = "00:" + (timeRemaining < 10 ? "0" : "") + timeRemaining;
    }, 1000);
}

function manualLeverTrigger() {
    if (isGameRunning) return;
    if (selectedTarget === "") { showAlert("🎯 베팅 타겟 옵션을 마킹하고 레버를 당기세요!"); return; }
    clearInterval(ladderInterval); launchLadderEngine();
}

function launchLadderEngine() {
    if (isGameRunning) return;
    const input = document.getElementById("bet-amount-input");
    let stake = parseInt(input ? input.value : 0) || 0;
    if (stake <= 0) { stake = 100000; if (input) input.value = 100000; }
    if (stake > gameChips) { showAlert("💎 충전된 게임 칩 머니가 부족합니다!"); initializeTimerSequence(); return; }

    isGameRunning = true;
    const btn = document.getElementById("launchLeverBtn");
    if (btn) btn.disabled = true;
    
    gameChips -= stake; 
    if (typeof updateLedgerDisplays === 'function') updateLedgerDisplays();
    if (typeof updateQuestProgress === 'function') updateQuestProgress('ladder_play', 1);

    const hStatus = document.getElementById("hud-status-text");
    if (hStatus) hStatus.innerText = "⚡ 사다리 작동 시작! 엄폐되었던 가로줄들이 즉시 개방됩니다!";
    
    pathPointsList = [];
    let curX = (currentStartDir === "좌") ? 80 : 260;
    pathPointsList.push({ x: curX, y: 35 });

    horizontalBridges.forEach(b => {
        if (curX === 80) {
            pathPointsList.push({ x: 80, y: b.y }); pathPointsList.push({ x: 260, y: b.y }); curX = 260;
        } else {
            pathPointsList.push({ x: 260, y: b.y }); pathPointsList.push({ x: 80, y: b.y }); curX = 80;
        }
    });
    pathPointsList.push({ x: curX, y: 345 });

    let segmentIdx = 0, frameTicks = 0, totalTicks = 20;
    function stepAnimation() {
        if (segmentIdx >= pathPointsList.length - 1) { concludeLadderRound(stake); return; }
        let p1 = pathPointsList[segmentIdx], p2 = pathPointsList[segmentIdx+1];
        frameTicks++;
        let ratio = frameTicks / totalTicks;
        tracerBallCoord.x = p1.x + (p2.x - p1.x) * ratio;
        tracerBallCoord.y = p1.y + (p2.y - p1.y) * ratio;
        if (frameTicks === 1 && typeof AudioSynth !== 'undefined') AudioSynth.playTick();
        paintCanvasFrame();
        if (frameTicks < totalTicks) { requestAnimationFrame(stepAnimation); } 
        else { segmentIdx++; frameTicks = 0; stepAnimation(); }
    }
    stepAnimation();
}

function concludeLadderRound(stake) {
    currentRound++; isGameRunning = false;
    const btn = document.getElementById("launchLeverBtn");
    if (btn) btn.disabled = false;
    
    let startRes = (pathPointsList[0].x === 80) ? "좌출발" : "우출발";
    let linesRes = horizontalBridges.length;
    let finalOddEven = (pathPointsList[pathPointsList.length - 1].x === 80) ? "홀" : "짝";
    
    let startShort = startRes === "좌출발" ? "좌" : "우";
    let comboRes = startShort + linesRes + finalOddEven;
    
    let hit = false;
    if (selectedTarget === "홀" || selectedTarget === "짝") hit = (selectedTarget === finalOddEven);
    // ✨ 수정됨: '좌' / '우' 만 선택해도 완벽하게 정답으로 판정되도록 예외 처리 추가!
    else if (selectedTarget === "좌" || selectedTarget === "우" || selectedTarget === "좌출발" || selectedTarget === "우출발") hit = (selectedTarget === startRes || selectedTarget === startShort);
    else if (selectedTarget === "3줄" || selectedTarget === "4줄") hit = (selectedTarget === (linesRes + "줄"));
    else hit = (selectedTarget === comboRes);
    
    const hStatus = document.getElementById("hud-status-text");
    const hResult = document.getElementById("hud-result-text");
    const hProfit = document.getElementById("hud-profit-text");
    const flash = document.getElementById("flash-overlay");
    
    if (hStatus) hStatus.innerText = `[회차 결과] 제 ${currentRound}회`;
    if (hResult) hResult.innerHTML = `시작: <b>${startRes}</b> / 줄수: <b>${linesRes}줄</b> / 결과: <span style="color:#fbbf24;">【 ${finalOddEven} 】</span>`;
    
    let logTxt = "", logColor = "";
    
    if (hit) {
        let win = Math.floor(stake * selectedOdds);
        const profitBonus = typeof applyProfitBonus === 'function' ? applyProfitBonus(win, 'ladder') : 0;
        const finalWin = win + profitBonus;
        const netProfit = finalWin - stake;
        
        logTxt = `+${finalWin.toLocaleString()} 칩`; logColor = "color:#10b981; font-weight:bold;";
        
        if (typeof showClaimWinningsModal === 'function') {
            showClaimWinningsModal({
                title: '사다리 적중!',
                betLabel: '배팅 금액:',
                betAmount: stake,
                multiplier: selectedOdds,
                grossAmount: win,
                bonusAmount: profitBonus,
                finalAmount: finalWin,
                profitAmount: netProfit,
                gameTypeForBreakdown: 'ladder',
                onClaim: () => {
                    gameChips += finalWin;
                    if (hProfit) hProfit.innerHTML = `<span style="color:#10b981;">적중! +${finalWin.toLocaleString()} 칩 ${profitBonus > 0 ? ` <span style="color:#4ade80;">(+${profitBonus.toLocaleString()} 보너스)</span>` : ''}</span>`;
                    
                    if (flash) { flash.style.display = "block"; flash.className = "flash-win-effect"; setTimeout(() => flash.style.display = "none", 1000); }
                    if (typeof AudioSynth !== 'undefined') AudioSynth.playWin();
                    if (typeof updateQuestProgress === 'function') { updateQuestProgress('ladder_hit', 1); updateQuestProgress('profit', finalWin); }
                    
                    if (finalWin > (gameStats.ladder.maxSingleWin || 0)) gameStats.ladder.maxSingleWin = finalWin;
                    gameStats.ladder.hits++;
                    gameStats.ladder.profit += netProfit;
                    gameStats.totalProfit += netProfit;
                    
                    gameStats.ladder.currentWinStreak++;
                    if (gameStats.ladder.currentWinStreak > gameStats.ladder.maxWinStreak) gameStats.ladder.maxWinStreak = gameStats.ladder.currentWinStreak;
                    if (selectedOdds > gameStats.ladder.maxOddsHit) gameStats.ladder.maxOddsHit = selectedOdds;
                    
                    if (typeof updateLedgerDisplays === 'function') updateLedgerDisplays();
                    if (typeof saveData === 'function') saveData();
                }
            });
        }
        if (hProfit) hProfit.innerHTML = `<span style="color:#fbbf24;">결과 확인 중... 정산 대기</span>`;
    } else {
        if (hProfit) hProfit.innerHTML = `<span style="color:#ef4444;">미적중 낙첨... -${stake.toLocaleString()} 칩 소멸</span>`;
        logTxt = `-${stake.toLocaleString()} 칩`; logColor = "color:#ef4444;";
        if (flash) { flash.style.display = "block"; flash.className = "flash-fail-effect"; setTimeout(() => flash.style.display = "none", 1000); }
        if (typeof AudioSynth !== 'undefined') AudioSynth.playLose();
        
        if (stake > (gameStats.ladder.maxSingleLoss || 0)) gameStats.ladder.maxSingleLoss = stake;
        gameStats.ladder.loss += stake;
        gameStats.totalLoss += stake;
        gameStats.ladder.currentWinStreak = 0;
    }
    
    if (typeof appendLogRecord === 'function') appendLogRecord(`[사다리 ${currentRound}회] ${startRes}·${linesRes}줄·[${finalOddEven}] (픽:${selectedTarget})`, logTxt, logColor);
    
    gameStats.ladder.plays++;
    gameStats.totalGames++;
    
    selectedTarget = ""; selectedOdds = 0.0;
    document.querySelectorAll('#section-ladder .btn-opt').forEach(b => b.classList.remove('active'));
    
    if (typeof updateLedgerDisplays === 'function') updateLedgerDisplays(); 
    compileNextLadderStructure(); paintCanvasFrame(); initializeTimerSequence();
    if (typeof saveData === 'function') saveData();
}


function useLadderCheat() {
    if (typeof inventory === 'undefined' || !inventory['bm_ladder_hack'] || inventory['bm_ladder_hack'] <= 0) return;
    inventory['bm_ladder_hack'] -= 1;
    
    let dest = "";
    // ✨ 버그 수정: 3줄 조합의 좌/우 오타를 정상적으로 수정
    if (currentStartDir === "좌출발" && currentLinesCount === 3) dest = "좌3짝";
    else if (currentStartDir === "좌출발" && currentLinesCount === 4) dest = "좌4홀";
    else if (currentStartDir === "우출발" && currentLinesCount === 3) dest = "우3홀";
    else if (currentStartDir === "우출발" && currentLinesCount === 4) dest = "우4짝";
    
    showAlert(`[내부자 쪽지]:\n\n시작: [${currentStartDir}]\n줄수: [${currentLinesCount}]\n조합: [${dest}]`);
    
    if(typeof updateLedgerDisplays === 'function') updateLedgerDisplays();
    if(typeof renderSmartInventory === 'function') renderSmartInventory();
    if(typeof saveData === 'function') saveData();
    
    const btn = document.getElementById('ladder-cheat-btn');
    if (btn) btn.style.display = 'none';
}