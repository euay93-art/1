// ============================================================
// js/slot.js
// VVIP 럭셔리 슬롯머신 엔진 (디테일의 악마 버전)
// ============================================================

const SLOT_SYMBOLS = [
    { id: 'DIAMOND', icon: '💎', multiplier: 2, weight: 45, desc: '블루 다이아몬드' },
    { id: 'GOLDBAR', icon: '🟨', multiplier: 5, weight: 25, desc: '골드바' },
    { id: 'ROLEX', icon: '⌚', multiplier: 10, weight: 15, desc: '명품 시계' },
    { id: 'CAR', icon: '🏎️', multiplier: 20, weight: 8, desc: '슈퍼카' },
    { id: 'WILD', icon: '🃏', multiplier: 50, weight: 5, desc: '조커 (WILD)' },
    { id: 'JACKPOT', icon: '7️⃣', multiplier: 0, weight: 2, desc: '잭팟 (777)' } // 잭팟은 multiplier 대신 누적금 지급
];

let isSlotSpinning = false;
let isAutoSlot = false;
let autoSlotCount = 0;
let slotReelResults = [[], [], []]; 

// 초기 잭팟 금액 설정 (main.js에서 로드되지 않았을 경우)
if (typeof slotJackpotAmount === 'undefined') {
    window.slotJackpotAmount = 10000000;
}

function initSlotMachine() {
    updateJackpotDisplay();
    // 초기 릴 렌더링 (가짜 심볼 3개씩)
    for (let i = 0; i < 3; i++) {
        const reel = document.getElementById(`reel-${i}`);
        if (!reel) continue;
        reel.innerHTML = '<div class="reel-strip" style="transform: translateY(0px);"></div>';
        const strip = reel.querySelector('.reel-strip');
        
        let html = '';
        for(let j=0; j<3; j++) {
            const randomSymbol = SLOT_SYMBOLS[Math.floor(Math.random() * SLOT_SYMBOLS.length)];
            html += `<div class="slot-symbol">${randomSymbol.icon}</div>`;
        }
        strip.innerHTML = html;
    }
}

function updateJackpotDisplay() {
    const jpDisplay = document.getElementById('slot-jackpot-amount');
    if (jpDisplay) {
        jpDisplay.innerText = Math.floor(window.slotJackpotAmount).toLocaleString();
    }
}

function toggleAutoSlot() {
    if (isSlotSpinning && !isAutoSlot) return; // 수동 스핀 중에는 오토 켜기 금지
    
    const autoBtn = document.getElementById('slot-auto-btn');
    const spinBtn = document.getElementById('slot-spin-btn');
    
    if (isAutoSlot) {
        // 오토 정지
        isAutoSlot = false;
        autoSlotCount = 0;
        autoBtn.innerHTML = '🔄 오토 스핀';
        autoBtn.style.background = 'linear-gradient(135deg, #475569, #1e293b)';
        autoBtn.style.borderColor = '#64748b';
        autoBtn.style.color = '#fff';
        autoBtn.style.animation = 'none';
        spinBtn.disabled = false;
        showToast("오토 스핀이 중지되었습니다.", "maintain");
    } else {
        // 오토 시작
        isAutoSlot = true;
        autoSlotCount = 100;
        autoBtn.innerHTML = `🛑 오토 정지 (${autoSlotCount})`;
        autoBtn.style.background = 'linear-gradient(135deg, #991b1b, #7f1d1d)';
        autoBtn.style.borderColor = '#ef4444';
        autoBtn.style.color = '#fca5a5';
        autoBtn.style.animation = 'pulse 1.5s infinite';
        spinBtn.disabled = true;
        showToast("오토 스핀 100회 시작!", "success");
        if (!isSlotSpinning) spinSlot();
    }
}

// 확률 조작이 들어간 심볼 뽑기 (Weighted RNG)
function getRandomSymbol() {
    const totalWeight = SLOT_SYMBOLS.reduce((sum, sym) => sum + sym.weight, 0);
    let randomNum = Math.random() * totalWeight;
    
    for (let sym of SLOT_SYMBOLS) {
        if (randomNum < sym.weight) return sym;
        randomNum -= sym.weight;
    }
    return SLOT_SYMBOLS[0];
}

function spinSlot() {
    if (isSlotSpinning) return;
    
    const betInput = document.getElementById('slot-bet-amount');
    const betAmount = parseInt(betInput.value) || 0;
    const isTurbo = document.getElementById('slot-turbo-mode')?.checked || false;

    if (betAmount < 1000) { 
        showAlert("최소 배팅 금액은 1,000 칩입니다."); 
        isAutoSlot = false;
        if (document.getElementById('slot-auto-btn')) toggleAutoSlot(); // UI 초기화
        return; 
    }
    if (gameChips < betAmount) { 
        showAlert("칩스가 부족합니다!"); 
        if (isAutoSlot) toggleAutoSlot();
        return; 
    }

    // 1. 배팅금 차감 및 잭팟 누적 (0.5%)
    isSlotSpinning = true;
    gameChips -= betAmount;
    window.slotJackpotAmount += betAmount * 0.005; 
    updateLedgerDisplays();
    updateJackpotDisplay();
    
    if (typeof updateQuestProgress === 'function') updateQuestProgress('casino_play', 1);

    const spinBtn = document.getElementById('slot-spin-btn');
    if (spinBtn) spinBtn.disabled = true;

    const labelEl = document.getElementById('slot-result-label');
    const resultEl = document.getElementById('slot-result-text');
    const profitEl = document.getElementById('slot-profit-text');
    
    labelEl.innerText = "스핀 중...";
    resultEl.innerText = "운명의 릴이 돌아갑니다";
    profitEl.innerText = "";
    
    // 오토 스핀 UI 카운트 갱신
    if (isAutoSlot) {
        autoSlotCount--;
        const autoBtn = document.getElementById('slot-auto-btn');
        if (autoBtn) autoBtn.innerHTML = `🛑 오토 정지 (${autoSlotCount})`;
    }

    if (typeof AudioSynth !== 'undefined' && !isTurbo) AudioSynth.playTick(); // 스핀 시작음

    // 2. 결과 미리 결정 (3x3 배열)
    slotReelResults = [[], [], []];
    for (let col = 0; col < 3; col++) {
        for (let row = 0; row < 3; row++) {
            slotReelResults[col].push(getRandomSymbol());
        }
    }

    // [디테일 악마 1] 니어 미스(Near Miss) 판별 로직
    // 첫 번째, 두 번째 릴의 같은 페이라인에 'JACKPOT'이 2개 떴는지 확인
    let isNearMiss = false;
    if (!isTurbo) {
        // 수평선 체크
        for (let r = 0; r < 3; r++) {
            if (slotReelResults[0][r].id === 'JACKPOT' && slotReelResults[1][r].id === 'JACKPOT') isNearMiss = true;
        }
        // 대각선 체크
        if (slotReelResults[0][0].id === 'JACKPOT' && slotReelResults[1][1].id === 'JACKPOT') isNearMiss = true;
        if (slotReelResults[0][2].id === 'JACKPOT' && slotReelResults[1][1].id === 'JACKPOT') isNearMiss = true;
    }

    // 3. 릴 애니메이션 생성 및 실행
    // 릴의 시각적 길이를 위해 앞에 더미 심볼 추가
    const dummyCount = isTurbo ? 10 : 30; // 터보일 땐 짧게
    
    const baseDuration = isTurbo ? 0.3 : 1.5;
    const stagger = isTurbo ? 0.1 : 0.4;
    
    for (let col = 0; col < 3; col++) {
        const reel = document.getElementById(`reel-${col}`);
        if (!reel) continue;
        
        let html = '';
        // 더미 심볼
        for (let i = 0; i < dummyCount + (col * 5); i++) {
            html += `<div class="slot-symbol" style="filter: blur(2px);">${SLOT_SYMBOLS[Math.floor(Math.random() * SLOT_SYMBOLS.length)].icon}</div>`;
        }
        // 실제 결과 심볼 (위에서부터 렌더링되므로, CSS translateY로 아래서 위로 끌어올림)
        for (let row = 0; row < 3; row++) {
            html += `<div class="slot-symbol">${slotReelResults[col][row].icon}</div>`;
        }
        
        const strip = reel.querySelector('.reel-strip');
        // 초기화 (위치 맨 위로)
        strip.style.transition = 'none';
        strip.style.transform = 'translateY(0px)';
        strip.innerHTML = html;

        // 리플로우 강제
        void strip.offsetWidth;

        // 목표 Y값 계산 (심볼 1개당 60px)
        const totalSymbols = dummyCount + (col * 5) + 3;
        const targetY = -((totalSymbols - 3) * 60);

        // [디테일 악마 2] 텐션 바운스 & 니어 미스 지연
        let duration = baseDuration + (col * stagger);
        let timingFunction = 'cubic-bezier(0.2, 0.8, 0.2, 1.15)'; // 살짝 튕기는 마찰감
        
        if (isNearMiss && col === 2) {
            duration += 2.5; // 마지막 릴 심장 쫄깃하게 늦게 멈춤
            timingFunction = 'cubic-bezier(0.1, 0.7, 0.1, 1)';
            
            // 화면 어두워지는 심장 박동 연출
            setTimeout(() => {
                const overlay = document.getElementById('flash-overlay');
                if(overlay) {
                    overlay.style.display = 'block';
                    overlay.style.background = 'radial-gradient(circle at center, transparent 0%, rgba(0,0,0,0.8) 100%)';
                    overlay.style.opacity = '1';
                    overlay.style.animation = 'pulse 0.5s infinite';
                }
                if (typeof AudioSynth !== 'undefined') AudioSynth.playLose(); // 쿵쾅거리는 느낌 대용
            }, (baseDuration + stagger) * 1000);
        }

        setTimeout(() => {
            strip.style.transition = `transform ${duration}s ${timingFunction}`;
            strip.style.transform = `translateY(${targetY}px)`;
            
            // 각 릴 멈출 때 소리
            setTimeout(() => {
                if (typeof AudioSynth !== 'undefined' && !isTurbo) AudioSynth.playTick();
            }, duration * 1000);

        }, 50);
    }

    // 모든 애니메이션이 끝난 후 결과 정산
    const maxDuration = baseDuration + (2 * stagger) + (isNearMiss ? 2.5 : 0);
    setTimeout(() => {
        // 니어 미스 오버레이 해제
        if (isNearMiss) {
            const overlay = document.getElementById('flash-overlay');
            if(overlay) {
                overlay.style.animation = 'none';
                overlay.style.display = 'none';
            }
        }
        evaluateSlotResult(betAmount, isTurbo);
    }, (maxDuration * 1000) + 100);
}

function evaluateSlotResult(betAmount, isTurbo) {
    const paylines = [
        [{c:0, r:1}, {c:1, r:1}, {c:2, r:1}], // Center
        [{c:0, r:0}, {c:1, r:0}, {c:2, r:0}], // Top
        [{c:0, r:2}, {c:1, r:2}, {c:2, r:2}], // Bottom
        [{c:0, r:0}, {c:1, r:1}, {c:2, r:2}], // Diagonal 1
        [{c:0, r:2}, {c:1, r:1}, {c:2, r:0}], // Diagonal 2
    ];

    let totalMultiplier = 0;
    let isJackpotHit = false;
    let winningLines = [];

    paylines.forEach((line, index) => {
        const sym1 = slotReelResults[line[0].c][line[0].r];
        const sym2 = slotReelResults[line[1].c][line[1].r];
        const sym3 = slotReelResults[line[2].c][line[2].r];

        // 잭팟은 WILD 카드로 대체 불가능
        if (sym1.id === 'JACKPOT' && sym2.id === 'JACKPOT' && sym3.id === 'JACKPOT') {
            isJackpotHit = true;
            winningLines.push(index);
        } else {
            // 일반 심볼 라인 판별 (WILD 포함)
            const symbols = [sym1, sym2, sym3];
            const nonWilds = symbols.filter(s => s.id !== 'WILD');
            
            // 전부 WILD거나, 남은 심볼들이 모두 같은 id일 경우 당첨
            let isWin = false;
            let targetSym = null;

            if (nonWilds.length === 0) {
                isWin = true; // 3 WILD
                targetSym = SLOT_SYMBOLS.find(s => s.id === 'WILD');
            } else {
                const firstId = nonWilds[0].id;
                if (nonWilds.every(s => s.id === firstId)) {
                    isWin = true;
                    targetSym = nonWilds[0];
                }
            }

            if (isWin && targetSym.id !== 'JACKPOT') {
                totalMultiplier += targetSym.multiplier;
                winningLines.push(index);
            }
        }
    });

    const labelEl = document.getElementById('slot-result-label');
    const resultEl = document.getElementById('slot-result-text');
    const profitEl = document.getElementById('slot-profit-text');
    const flash = document.getElementById('flash-overlay');

    if (!gameStats.slot) gameStats.slot = { plays: 0, profit: 0, loss: 0, maxSingleWin: 0, maxSingleLoss: 0, jackpots: 0 };
    gameStats.slot.plays++;
    gameStats.totalGames++;

    if (isJackpotHit) {
        // 잭팟 당첨 처리
        const jackpotWin = Math.floor(window.slotJackpotAmount);
        gameChips += jackpotWin;
        window.slotJackpotAmount = 10000000; // 잭팟 초기화 (천만 칩)
        
        gameStats.slot.jackpots++;
        if (jackpotWin > (gameStats.slot.maxSingleWin || 0)) gameStats.slot.maxSingleWin = jackpotWin;
        gameStats.slot.profit += (jackpotWin - betAmount);
        gameStats.totalProfit += (jackpotWin - betAmount);

        labelEl.innerText = "🚨 MEGA JACKPOT!!! 🚨";
        resultEl.innerHTML = `<span style="color:#ef4444; animation: pulse 0.5s infinite;">7️⃣ 7️⃣ 7️⃣</span>`;
        profitEl.innerHTML = `<span style="color:#fbbf24; font-size: 24px;">+${jackpotWin.toLocaleString()} 칩</span>`;
        
        if (flash) { flash.style.display = "block"; flash.className = "flash-win-effect"; setTimeout(() => { flash.style.display = "none"; flash.className = ""; }, 2500); }
        if (typeof AudioSynth !== 'undefined') AudioSynth.playWin();
        if (typeof AudioSynth !== 'undefined') setTimeout(() => AudioSynth.playWin(), 500);
        
        showToast("미쳤습니다 보스! 잭팟이 터졌습니다!", "success");
        appendLogRecord(`[슬롯] 🎰 잭팟 당첨!`, `+${jackpotWin.toLocaleString()} 칩`, `color:#fbbf24; font-weight:bold; text-shadow:0 0 5px #fbbf24;`);

        // 화면 흔들림 효과
        document.querySelector('.game-wrapper').style.animation = "equip-fail-shake 0.5s 5";
        setTimeout(() => document.querySelector('.game-wrapper').style.animation = "none", 2500);

    } else if (totalMultiplier > 0) {
        // 일반 당첨 (Multi-line 합산)
        const rawWin = betAmount * totalMultiplier;
        const profitBonus = typeof applyProfitBonus === 'function' ? applyProfitBonus(rawWin, 'slot') : 0;
        const finalWin = rawWin + profitBonus;
        const netProfit = finalWin - betAmount;

        gameChips += finalWin;

        // [디테일 악마 3] LDW (위장된 승리)
        // 땄지만 배팅금보다 적은 경우 (ex: 10만칩 배팅, 2만칩 당첨)
        if (netProfit < 0) {
            labelEl.innerText = "소액 당첨 (LDW)";
            resultEl.innerHTML = `<span style="color:#34d399;">축하합니다! 당첨!</span>`; // 유저를 속이는 긍정적 텍스트
            profitEl.innerHTML = `<span style="color:#10b981;">+${finalWin.toLocaleString()} 칩 (실제: ${netProfit.toLocaleString()})</span>`;
            
            gameStats.slot.loss += Math.abs(netProfit);
            gameStats.totalLoss += Math.abs(netProfit);
            if (typeof AudioSynth !== 'undefined' && !isTurbo) AudioSynth.playCoin(); // 소액도 코인 소리
            appendLogRecord(`[슬롯] ${totalMultiplier}x 당첨`, `+${finalWin.toLocaleString()} 칩`, `color:#10b981;`);
        } else {
            // 진짜 승리
            labelEl.innerText = `당첨! (총 ${totalMultiplier}x)`;
            resultEl.innerHTML = `<span style="color:#fbbf24;">페이라인 ${winningLines.length}개 적중!</span>`;
            profitEl.innerHTML = `<span style="color:#10b981;">+${finalWin.toLocaleString()} 칩 ${profitBonus>0?`<span style="font-size:11px;">(+${profitBonus.toLocaleString()})</span>`:''}</span>`;
            
            if (finalWin > (gameStats.slot.maxSingleWin || 0)) gameStats.slot.maxSingleWin = finalWin;
            gameStats.slot.profit += netProfit;
            gameStats.totalProfit += netProfit;
            if (flash && !isTurbo) { flash.style.display = "block"; flash.className = "flash-win-effect"; setTimeout(() => { flash.style.display = "none"; flash.className = ""; }, 800); }
            if (typeof AudioSynth !== 'undefined' && !isTurbo) AudioSynth.playWin();
            appendLogRecord(`[슬롯] ${totalMultiplier}x 당첨`, `+${finalWin.toLocaleString()} 칩`, `color:#10b981; font-weight:bold;`);
        }

    } else {
        // 꽝
        labelEl.innerText = "다음 기회에...";
        resultEl.innerHTML = `<span style="color:#64748b;">아쉽습니다.</span>`;
        profitEl.innerHTML = `<span style="color:#ef4444;">-${betAmount.toLocaleString()} 칩</span>`;
        
        if (betAmount > (gameStats.slot.maxSingleLoss || 0)) gameStats.slot.maxSingleLoss = betAmount;
        gameStats.slot.loss += betAmount;
        gameStats.totalLoss += betAmount;
        
        if (typeof AudioSynth !== 'undefined' && !isTurbo) AudioSynth.playLose();
        appendLogRecord(`[슬롯] 꽝`, `-${betAmount.toLocaleString()} 칩`, `color:#ef4444;`);
    }

    updateLedgerDisplays();
    updateJackpotDisplay();
    if (typeof saveData === 'function') saveData();

    // 상태 복구 및 오토 스핀 연속 실행
    setTimeout(() => {
        isSlotSpinning = false;
        const spinBtn = document.getElementById('slot-spin-btn');
        if (spinBtn && !isAutoSlot) spinBtn.disabled = false;

        if (isAutoSlot) {
            if (autoSlotCount > 0 && gameChips >= betAmount) {
                spinSlot(); // 꼬리물기 스핀
            } else {
                toggleAutoSlot(); // 오토 종료 (횟수 소진 or 잔고 부족)
                if (gameChips < betAmount) showAlert("잔고가 부족하여 오토 스핀이 종료되었습니다.");
            }
        }
    }, isTurbo ? 300 : 800);
}

// 초기화 호출
document.addEventListener("DOMContentLoaded", () => {
    // 탭을 눌렀을 때 초기화되도록 main.js의 switchGameView에서 호출됨
});