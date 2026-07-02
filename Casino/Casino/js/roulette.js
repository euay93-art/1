// ============================================================
// js/roulette.js
// 룰렛 게임 렌더링 및 애니메이션, 정산 로직
// ============================================================

let rouletteTarget = null;
let rouletteOdds = 0;
let rouletteWheelAngle = 0;
let isRouletteSpinning = false;
let rouletteSelectedNumber = null;

const rouletteOrder = [0,32,15,19,4,21,2,25,17,34,6,27,13,36,11,30,8,23,10,5,24,16,33,1,20,14,31,9,22,18,29,7,28,12,35,3,26];
const redNumbers = [1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36];
const rouletteColors = {};

function initRouletteColors() {
    for (let i = 0; i < 37; i++) {
        if (i === 0) rouletteColors[i] = 'green';
        else if (redNumbers.includes(i)) rouletteColors[i] = 'red';
        else rouletteColors[i] = 'black';
    }
}

function initRouletteWheel() {
    initRouletteColors();
    const canvas = document.getElementById('rouletteCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    drawRouletteWheel(ctx, 0);
    canvas.onclick = () => { if (!isRouletteSpinning) spinRoulette(); };
    renderRouletteCheatUI(); // 아이템 UI 렌더링 호출 추가
}

function renderRouletteCheatUI() {
    let cheatDiv = document.getElementById('roulette-cheat-ui');
    if (typeof inventory !== 'undefined' && inventory['bm_roulette_magnet'] > 0) {
        if (!cheatDiv) {
            cheatDiv = document.createElement('div');
            cheatDiv.id = 'roulette-cheat-ui';
            cheatDiv.style.cssText = "margin-bottom:12px; background:rgba(220,38,38,0.15); border:1px solid #dc2626; border-radius:10px; padding:10px; text-align:left;";
            const spinBtn = document.getElementById('roulette-spin-btn');
            spinBtn.parentNode.insertBefore(cheatDiv, spinBtn);
        }
        cheatDiv.style.display = 'block';
        cheatDiv.innerHTML = `
            <label style="display:flex; align-items:center; gap:8px; cursor:pointer; color:#fca5a5; font-size:13px; font-weight:bold;">
                <input type="checkbox" id="use-roulette-magnet" style="width:18px; height:18px; accent-color:#dc2626;">
                🧲 미세 자성 칩 가동 (당첨 확률 90%로 조작, 보유: ${inventory['bm_roulette_magnet']}개)
            </label>
        `;
    } else if (cheatDiv) {
        cheatDiv.style.display = 'none';
    }
}

function drawRouletteWheel(ctx, angle) {
    const cx = 160, cy = 160, radius = 150;
    ctx.clearRect(0, 0, 320, 320);
    const numSectors = 37;
    const sectorAngle = (2 * Math.PI) / numSectors;

    for (let i = 0; i < numSectors; i++) {
        const startAngle = angle + i * sectorAngle;
        const num = rouletteOrder[i];
        const color = rouletteColors[num] || 'black';

        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.arc(cx, cy, radius, startAngle, startAngle + sectorAngle);
        ctx.closePath();
        
        const grad = ctx.createRadialGradient(
            cx + Math.cos(startAngle + sectorAngle/2) * radius * 0.3,
            cy + Math.sin(startAngle + sectorAngle/2) * radius * 0.3,
            radius * 0.1, cx, cy, radius
        );
        
        if (color === 'red') {
            grad.addColorStop(0, '#f87171'); grad.addColorStop(0.5, '#dc2626'); grad.addColorStop(1, '#991b1b');
        } else if (color === 'black') {
            grad.addColorStop(0, '#475569'); grad.addColorStop(0.5, '#1f2937'); grad.addColorStop(1, '#0f172a');
        } else {
            grad.addColorStop(0, '#4ade80'); grad.addColorStop(0.5, '#166534'); grad.addColorStop(1, '#052e16');
        }
        
        ctx.fillStyle = grad; ctx.fill();
        ctx.strokeStyle = '#fbbf24'; ctx.lineWidth = 1.5; ctx.stroke();

        ctx.save();
        ctx.translate(cx, cy); ctx.rotate(startAngle + sectorAngle / 2);
        ctx.textAlign = 'center'; ctx.shadowColor = 'rgba(0,0,0,0.7)';
        ctx.shadowBlur = 3; ctx.shadowOffsetX = 1; ctx.shadowOffsetY = 1;
        ctx.fillStyle = '#fff';
        ctx.font = (num === 0 ? 'bold 19px' : 'bold 15px') + ' sans-serif';
        ctx.fillText(num.toString(), radius * 0.72, 5);
        ctx.restore();
    }

    ctx.beginPath(); ctx.arc(cx, cy, 32, 0, Math.PI * 2);
    ctx.fillStyle = '#020617'; ctx.fill();
    ctx.strokeStyle = '#fbbf24'; ctx.lineWidth = 5; ctx.stroke();

    ctx.beginPath(); ctx.arc(cx, cy, 24, 0, Math.PI * 2);
    ctx.fillStyle = '#0f172a'; ctx.fill();
    ctx.strokeStyle = '#475569'; ctx.lineWidth = 2; ctx.stroke();

    ctx.beginPath(); ctx.arc(cx, cy, 12, 0, Math.PI * 2);
    ctx.fillStyle = '#1e293b'; ctx.fill();

    ctx.save();
    ctx.shadowColor = '#fbbf24'; ctx.shadowBlur = 12;
    ctx.shadowOffsetX = 0; ctx.shadowOffsetY = 0;

    ctx.beginPath(); ctx.moveTo(cx, 8); ctx.lineTo(cx - 9, 26); ctx.lineTo(cx + 9, 26);
    ctx.closePath(); ctx.fillStyle = '#fbbf24'; ctx.fill();

    ctx.beginPath(); ctx.arc(cx, 24, 7, 0, Math.PI * 2);
    ctx.fillStyle = '#fef08a'; ctx.fill();
    ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.stroke();
    ctx.restore();
}

function selectRouletteTarget(type, odds) {
    // ✨ 룰렛이 돌아가는 중에는 배팅 변경 금지 방어 코드 추가
    if (isRouletteSpinning) { 
        showAlert("⚠️ 룰렛이 돌아가는 중에는 배팅 구역을 변경할 수 없습니다!"); 
        return; 
    }

    document.querySelectorAll('#section-roulette .btn-opt').forEach(b => b.classList.remove('active'));
    const btn = document.getElementById('roulette-' + type);
    if (btn) btn.classList.add('active');

    rouletteTarget = type; rouletteOdds = odds; rouletteSelectedNumber = null;
    document.getElementById('roulette-selected-number').innerHTML = '';
    document.getElementById('roulette-number-input').value = '';
}

function selectRouletteNumber() {
    // ✨ 룰렛이 돌아가는 중에는 숫자 변경 금지 방어 코드 추가
    if (isRouletteSpinning) { 
        showAlert("⚠️ 룰렛이 돌아가는 중에는 숫자를 변경할 수 없습니다!"); 
        return; 
    }

    const input = document.getElementById('roulette-number-input');
    const num = parseInt(input.value);
    if (isNaN(num) || num < 0 || num > 36) { showAlert("0~36 사이 숫자를 입력해주세요."); return; }
    
    document.querySelectorAll('#section-roulette .btn-opt').forEach(b => b.classList.remove('active'));
    rouletteTarget = 'number'; rouletteOdds = 36.0; rouletteSelectedNumber = num;
    document.getElementById('roulette-selected-number').innerHTML = `선택된 숫자: <span style="color:#fbbf24; font-weight:900;">${num}</span> (36.0x)`;
}

function spinRoulette() {
    if (isRouletteSpinning) return;
    const betInput = document.getElementById('roulette-bet-amount');
    const betAmount = parseInt(betInput.value) || 0;
    if (!rouletteTarget || betAmount <= 0) { showAlert("배팅 대상을 선택하고 금액을 입력하세요."); return; }
    if (gameChips < betAmount) { showAlert("보유 칩이 부족합니다!"); return; }
    gameChips -= betAmount; updateLedgerDisplays();
    
    if (typeof updateQuestProgress === 'function') updateQuestProgress('casino_play', 1);
    let useCheat = false;
    const cheatCb = document.getElementById('use-roulette-magnet');
    if (cheatCb && cheatCb.checked && inventory['bm_roulette_magnet'] > 0) {
        inventory['bm_roulette_magnet'] -= 1;
        useCheat = true;
        showToast("미세 자성 칩을 사용했습니다.", "success");
        if(typeof saveData === 'function') saveData();
        if(typeof renderSmartInventory === 'function') renderSmartInventory();
        renderRouletteCheatUI(); // UI 업데이트
    }
    isRouletteSpinning = true;
    const spinBtn = document.getElementById('roulette-spin-btn');
    if (spinBtn) spinBtn.disabled = true;
    const canvas = document.getElementById('rouletteCanvas');
    const ctx = canvas.getContext('2d');
    
    // 🌟 수정 1: 바퀴 수를 무조건 정수(4~7바퀴)로 고정하여 엉뚱한 각도로 틀어지는 것을 방지
    const extraSpins = Math.floor(4 + Math.random() * 4); 
    
    let targetSector = Math.floor(Math.random() * 37);
    if (useCheat && Math.random() < 0.90) {
        let validNumbers = [];
        for (let i = 0; i <= 36; i++) {
            let color = rouletteColors[i];
            let isMatch = false;
            if (rouletteTarget === 'red' && color === 'red') isMatch = true;
            else if (rouletteTarget === 'black' && color === 'black') isMatch = true;
            else if (rouletteTarget === 'even' && i !== 0 && i % 2 === 0) isMatch = true;
            else if (rouletteTarget === 'odd' && i % 2 === 1) isMatch = true;
            else if (rouletteTarget === 'low' && i >= 1 && i <= 18) isMatch = true;
            else if (rouletteTarget === 'high' && i >= 19 && i <= 36) isMatch = true;
            else if (rouletteTarget === 'dozen1' && i >= 1 && i <= 12) isMatch = true;
            else if (rouletteTarget === 'dozen2' && i >= 13 && i <= 24) isMatch = true;
            else if (rouletteTarget === 'dozen3' && i >= 25 && i <= 36) isMatch = true;
            else if (rouletteTarget === 'number' && i === rouletteSelectedNumber) isMatch = true;
            
            if (isMatch) validNumbers.push(i);
        }
        if (validNumbers.length > 0) {
            const hackedNumber = validNumbers[Math.floor(Math.random() * validNumbers.length)];
            targetSector = rouletteOrder.indexOf(hackedNumber);
        }
    }
    const sectorAngle = (2 * Math.PI) / 37;
    
    // 🌟 수정 2: 포인터(12시 방향, -90도)에 정확히 멈추게 하기 위해 - (Math.PI / 2) 각도 보정 추가
    const finalAngle = (2 * Math.PI * extraSpins) - (Math.PI / 2) - (targetSector * sectorAngle) - (sectorAngle / 2);
    
    const currentAngle = rouletteWheelAngle || 0;
    const startTime = Date.now();
    const duration = 4200;
    function animate() {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        rouletteWheelAngle = currentAngle + (finalAngle - currentAngle) * eased;
        drawRouletteWheel(ctx, rouletteWheelAngle);
        if (progress < 1) {
            requestAnimationFrame(animate);
        } else {
            isRouletteSpinning = false;
            if (spinBtn) spinBtn.disabled = false;
            const pointerAngle = -Math.PI / 2; 
            const normalized = ((rouletteWheelAngle % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
            const wheelLocal = (pointerAngle - normalized + 4 * Math.PI) % (2 * Math.PI);
            let landedIndex = Math.floor(wheelLocal / sectorAngle) % 37;
            const landedNumber = rouletteOrder[landedIndex];
            processRouletteResult(landedNumber, betAmount);
        }
    }
    animate();
}

function processRouletteResult(landedNumber, betAmount) {
    const color = rouletteColors[landedNumber];
    let won = false, payoutMultiplier = 0;
    let resultDesc = `${landedNumber} (${color === 'red' ? '빨강' : color === 'black' ? '검정' : '녹색'})`;

    if (rouletteTarget === 'red' && color === 'red') { won = true; payoutMultiplier = 2.0; }
    else if (rouletteTarget === 'black' && color === 'black') { won = true; payoutMultiplier = 2.0; }
    else if (rouletteTarget === 'even' && landedNumber !== 0 && landedNumber % 2 === 0) { won = true; payoutMultiplier = 2.0; }
    else if (rouletteTarget === 'odd' && landedNumber % 2 === 1) { won = true; payoutMultiplier = 2.0; }
    else if (rouletteTarget === 'low' && landedNumber >= 1 && landedNumber <= 18) { won = true; payoutMultiplier = 2.0; }
    else if (rouletteTarget === 'high' && landedNumber >= 19 && landedNumber <= 36) { won = true; payoutMultiplier = 2.0; }
    else if (rouletteTarget === 'dozen1' && landedNumber >= 1 && landedNumber <= 12) { won = true; payoutMultiplier = 3.0; }
    else if (rouletteTarget === 'dozen2' && landedNumber >= 13 && landedNumber <= 24) { won = true; payoutMultiplier = 3.0; }
    else if (rouletteTarget === 'dozen3' && landedNumber >= 25 && landedNumber <= 36) { won = true; payoutMultiplier = 3.0; }
    else if (rouletteTarget === 'number' && landedNumber === rouletteSelectedNumber) { won = true; payoutMultiplier = 36.0; }

    const labelEl = document.getElementById('roulette-result-label');
    const resultEl = document.getElementById('roulette-result-text');
    const profitEl = document.getElementById('roulette-profit-text');

    if (!gameStats.roulette) gameStats.roulette = { plays: 0, profit: 0, loss: 0, maxSingleWin: 0, maxSingleLoss: 0 };

    if (won) {
        const totalReturn = Math.floor(betAmount * payoutMultiplier);
        const profit = totalReturn - betAmount;
        
        const profitBonus = typeof applyProfitBonus === 'function' ? applyProfitBonus(totalReturn, 'roulette') : 0;
        const finalPayout = totalReturn + profitBonus;
        const netProfit = profit + profitBonus;

        labelEl.innerText = "🎉 당첨!";
        resultEl.innerHTML = `${resultDesc} <span style="color:#10b981;">당첨</span>`;
        profitEl.innerHTML = `<span style="color:#fbbf24;">💰 수령 대기중... 모달에서 수령하세요</span>`;
        profitEl.style.color = '#fbbf24';

        if (typeof showClaimWinningsModal === 'function') {
            showClaimWinningsModal({
                title: '🎡 룰렛 승리 수령', betLabel: '배팅 금액', betAmount: betAmount, multiplier: payoutMultiplier,
                grossAmount: totalReturn, bonusAmount: profitBonus, finalAmount: finalPayout, profitAmount: netProfit,
                gameTypeForBreakdown: 'roulette',
                onClaim: () => {
                    gameChips += finalPayout; updateLedgerDisplays();
                    profitEl.innerHTML = `+${netProfit.toLocaleString()} 원 (x${payoutMultiplier})${profitBonus > 0 ? ` <span style="color:#4ade80;">(+${profitBonus.toLocaleString()} 보너스)</span>` : ''}`;
                    profitEl.style.color = '#10b981';

                    const overlay = document.getElementById('flash-overlay');
                    if(overlay) { overlay.className = 'flash-win-effect'; overlay.style.display = 'block'; setTimeout(() => { overlay.style.display = 'none'; overlay.className = ''; }, 650); }

                    // ✨ 명예의 전당 잭팟 추적
                    if (finalPayout > (gameStats.roulette.maxSingleWin || 0)) gameStats.roulette.maxSingleWin = finalPayout;

                    gameStats.roulette.plays++; 
                    gameStats.roulette.profit += netProfit;
                    
                    if (typeof AudioSynth !== 'undefined') AudioSynth.playWin();
                    saveData();
                }
            });
        }
    } else {
        labelEl.innerText = "😢 낙첨";
        resultEl.innerHTML = `${resultDesc} <span style="color:#ef4444;">낙첨</span>`;
        profitEl.innerHTML = `-${betAmount.toLocaleString()} 원`;
        profitEl.style.color = '#ef4444';

        const overlay = document.getElementById('flash-overlay');
        if(overlay) { overlay.className = 'flash-fail-effect'; overlay.style.display = 'block'; setTimeout(() => { overlay.style.display = 'none'; overlay.className = ''; }, 650); }

        // ✨ 명예의 전당 손실 추적
        if (betAmount > (gameStats.roulette.maxSingleLoss || 0)) gameStats.roulette.maxSingleLoss = betAmount;

        gameStats.roulette.plays++; 
        gameStats.roulette.loss += betAmount;
        if (typeof AudioSynth !== 'undefined') AudioSynth.playLose();
    }

    if (typeof appendLogRecord === 'function') appendLogRecord(`[룰렛] ${rouletteTarget}`, won ? `+${(betAmount * payoutMultiplier - betAmount).toLocaleString()}원` : `-${betAmount.toLocaleString()}원`, won ? 'color:#10b981;' : 'color:#ef4444;');

    setTimeout(() => {
        document.querySelectorAll('#section-roulette .btn-opt').forEach(b => b.classList.remove('active'));
        rouletteTarget = null; rouletteSelectedNumber = null;
        document.getElementById('roulette-selected-number').innerHTML = '';
        if (profitEl) profitEl.innerHTML = '';
        renderRouletteCheatUI();
    }, 2800);
}