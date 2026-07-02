// ============================================================
// js/event.js
// 히든 이벤트, 이스터에그, 외치기 콘솔 로직 전용 파일
// ============================================================

// -----------------------------------------
// 1. 기존 히든 이벤트 (주식 급매, 구걸, 딱지, 시민과 결투, 기부)
// -----------------------------------------

function sellAllPortfolio() {
    const stocksOwned = Object.keys(portfolio).filter(s => portfolio[s].qty > 0);
    if (stocksOwned.length === 0) {
        const hStatus = document.getElementById("hud-status-text");
        if(hStatus) hStatus.innerText = "📉 보유하고 있는 주식이 없습니다.";
        if(typeof AudioSynth !== 'undefined') AudioSynth.playLose(); return;
    }
    let totalRevenue = 0;
    stocksOwned.forEach(stock => { const qty = portfolio[stock].qty; const price = stockPrices[stock]; totalRevenue += qty * price; delete portfolio[stock]; });
    const fee = Math.floor(totalRevenue * 0.03); const netRevenue = totalRevenue - fee; bankAsset += netRevenue;

    const hStatus = document.getElementById("hud-status-text"); const hProfit = document.getElementById("hud-profit-text"); const flash = document.getElementById("flash-overlay");
    if(hStatus) hStatus.innerText = "💼 [전량 현금화] 모든 주식을 급하게 처분했습니다.";
    if(hProfit) hProfit.innerHTML = `<span style="color:#fbbf24;">전체 평가액 ${totalRevenue.toLocaleString()}원 → 수수료 ${fee.toLocaleString()}원 공제 후 <b>+${netRevenue.toLocaleString()}원</b> 입금</span>`;
    if(flash) { flash.style.display = "block"; flash.style.background = "rgba(251, 191, 36, 0.2)"; setTimeout(() => { flash.style.display = "none"; flash.style.background = ""; }, 800); }
    if(typeof AudioSynth !== 'undefined') AudioSynth.playCoin();
    appendLogRecord(`[이벤트] 전량 급매도 (수수료 3%)`, `+${netRevenue.toLocaleString()} 원`, `color:#fbbf24; font-weight:bold;`);
    if(typeof updateLedgerDisplays === 'function') updateLedgerDisplays(); 
    if(typeof renderHoldings === 'function') renderHoldings(); 
    saveData();
}

function fightRandomCitizen() {
    const hStatus = document.getElementById("hud-status-text"); const hProfit = document.getElementById("hud-profit-text"); const flash = document.getElementById("flash-overlay");
    const win = Math.random() < 0.55;
    
    // ✨ 통계: 이벤트 발생 횟수 누적
    if (!gameStats.events) gameStats.events = { occurrences: 0, profit: 0, loss: 0, interest: 0 };
    gameStats.events.occurrences++;

    if (win) {
        const gain = Math.floor(Math.random() * 1200000) + 300000; bankAsset += gain;
        gameStats.events.profit += gain; // ✨ 통계: 수익 누적
        
        if(hStatus) hStatus.innerText = "🥊 [함 싸울래] 지나가던 시민과 시비가 붙었습니다...";
        if(hProfit) hProfit.innerHTML = `<span style="color:#10b981;">이겼습니다! 상대가 <b>+${gain.toLocaleString()}원</b>을 주고 도망갔습니다.</span>`;
        if(flash) { flash.style.display = "block"; flash.style.background = "rgba(16, 185, 129, 0.2)"; setTimeout(() => { flash.style.display = "none"; flash.style.background = ""; }, 700); }
        if(typeof AudioSynth !== 'undefined') AudioSynth.playWin();
        appendLogRecord(`[이벤트] 함 싸울래 (승)`, `+${gain.toLocaleString()} 원`, `color:#10b981; font-weight:bold;`);
    } else {
        const loss = Math.floor(Math.random() * 800000) + 200000;
        if (bankAsset + gameChips < loss) {
            if(hStatus) hStatus.innerText = "🥊 [함 싸울래] 시비를 걸었는데... 상대가 너무 세서 그냥 도망쳤습니다.";
            if(hProfit) hProfit.innerHTML = `<span style="color:#94a3b8;">결국 돈은 잃지 않았지만 자존심이 좀 상했습니다.</span>`;
            if(typeof AudioSynth !== 'undefined') AudioSynth.playLose();
        } else {
            bankAsset -= loss;
            gameStats.events.loss += loss; // ✨ 통계: 손실 누적
            
            if(hStatus) hStatus.innerText = "🥊 [함 싸울래] 지나가던 시민과 시비가 붙었습니다...";
            if(hProfit) hProfit.innerHTML = `<span style="color:#ef4444;">졌습니다... <b>-${loss.toLocaleString()}원</b>을 빼앗겼습니다.</span>`;
            if(flash) { flash.style.display = "block"; flash.style.background = "rgba(239, 68, 68, 0.2)"; setTimeout(() => { flash.style.display = "none"; flash.style.background = ""; }, 700); }
            if(typeof AudioSynth !== 'undefined') AudioSynth.playLose();
            appendLogRecord(`[이벤트] 함 싸울래 (패)`, `-${loss.toLocaleString()} 원`, `color:#ef4444;`);
        }
    }
    if(typeof updateLedgerDisplays === 'function') updateLedgerDisplays(); saveData();
}

function showDdakjiBetModal(callback) {
    const existing = document.getElementById('ddakji-bet-modal'); if (existing) existing.remove();
    const modal = document.createElement('div'); modal.id = 'ddakji-bet-modal';
    modal.style.cssText = `position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);background:linear-gradient(135deg,#052e16,#064e3b);border:3px solid #10b981;border-radius:16px;padding:24px 28px;z-index:999999;box-shadow:0 15px 50px rgba(0,0,0,0.75);min-width:280px;text-align:center;color:#fff;`;
    modal.innerHTML = `<div style="font-size:18px;font-weight:900;margin-bottom:12px;">🃏 딱지 승부</div><div style="font-size:14px;color:#94a3b8;margin-bottom:16px;">배팅 금액을 입력하세요 (최소 10,000원)</div><input type="number" id="ddakji-bet-input" class="cash-input-box" value="100000" min="10000" step="10000" style="width:100%;margin-bottom:12px;font-size:18px;"><div style="display:flex;gap:10px;justify-content:center;margin-top:12px;"><button id="ddakji-cancel" style="flex:1;padding:12px;background:#334155;color:#fff;border:none;border-radius:10px;font-weight:bold;">취소</button><button id="ddakji-confirm" style="flex:1;padding:12px;background:linear-gradient(135deg,#059669,#047857);color:#fff;border:none;border-radius:10px;font-weight:900;">배팅하기</button></div>`;
    document.body.appendChild(modal);
    const input = modal.querySelector('#ddakji-bet-input'); const confirmBtn = modal.querySelector('#ddakji-confirm'); const cancelBtn = modal.querySelector('#ddakji-cancel');
    
    if (typeof createChipUI === 'function') {
        const moneyChips = [
            { label: '+1만', val: 10000, color: '#475569' },
            { label: '+10만', val: 100000, color: '#3b82f6' },
            { label: '+100만', val: 1000000, color: '#10b981' },
            { label: '+1000만', val: 10000000, color: '#8b5cf6' },
            { label: '+1억', val: 100000000, color: '#f59e0b' }
        ];
        createChipUI(input, moneyChips);
    }

    input.focus(); input.select();
    const close = () => modal.remove();
    confirmBtn.onclick = () => { const val = parseInt(input.value) || 0; if (val < 10000) { showAlert("최소 10,000원부터 배팅할 수 있습니다."); return; } close(); callback(val); };
    cancelBtn.onclick = () => { close(); callback(null); };
    input.onkeypress = (e) => { if (e.key === 'Enter') confirmBtn.click(); };
}

function startDdakjiChallenge() {
    const hStatus = document.getElementById("hud-status-text"); const hProfit = document.getElementById("hud-profit-text"); const flash = document.getElementById("flash-overlay");
    if(hStatus) hStatus.innerText = "🃏 [딱지남 등장] 낯선 남자가 다가옵니다...";
    if(hProfit) hProfit.innerHTML = `<span style="color:#fbbf24;">"안녕하십니까. <b>딱지 한 번 쳐보시겠습니까?</b>"</span>`;
    setTimeout(() => {
        showDdakjiBetModal((bet) => {
            if (!bet) { if(hStatus) hStatus.innerText = "딱지남이 아쉽다는 듯이 돌아섭니다."; return; }
            if (gameChips < bet) { showAlert("게임 칩이 부족합니다."); return; }
            gameChips -= bet; 
            
            // ✨ 통계: 딱지 배팅 지출 & 이벤트 횟수 증가
            if (!gameStats.events) gameStats.events = { occurrences: 0, profit: 0, loss: 0, interest: 0 };
            gameStats.events.loss += bet;
            gameStats.events.occurrences++;

            if(typeof updateLedgerDisplays === 'function') updateLedgerDisplays();
            if(hStatus) hStatus.innerText = `🃏 딱지남과 승부 시작! 배팅: ${bet.toLocaleString()}원`;
            runDdakjiGame(bet, hStatus, hProfit, flash);
        });
    }, 900);
}

function showDdakjiFinalResult(successes, bet, hStatus, hProfit, flash) {
    if (successes === 0) {
        if(hStatus) hStatus.innerText = "😔 딱지남과의 승부에서 완패했습니다...";
        if(hProfit) hProfit.innerHTML = `<span style="color:#ef4444;">3번 모두 실패했습니다...<br>배팅금 <b>-${bet.toLocaleString()}원</b>을 잃었습니다.</span>`;
        if(flash) { flash.style.display = "block"; flash.style.background = "rgba(239, 68, 68, 0.35)"; }
        if(typeof AudioSynth !== 'undefined') AudioSynth.playLose();
        appendLogRecord(`[이스터에그] 딱지남 완패 (0/3)`, `-${bet.toLocaleString()} 원`, `color:#ef4444;`);
        setTimeout(() => {
            if(flash) { flash.style.display = "none"; flash.style.background = ""; }
            if(hStatus) hStatus.innerText = `🃏 딱지남: "야... 이 새끼야. 3번을 다 놓쳐?"`;
            setTimeout(() => {
                if(hProfit) hProfit.innerHTML = `<span style="color:#ef4444;">(딱지남이 뺨을 세게 한 대 때림)</span>`;
                setTimeout(() => { if(hStatus) hStatus.innerText = `🃏 딱지남: "다음에 또 오면 진짜로 패준다. 꺼져."`; if(typeof updateLedgerDisplays === 'function') updateLedgerDisplays(); saveData(); }, 1100);
            }, 800);
        }, 600);
    } else {
        let mult = successes === 3 ? 3.5 : successes === 2 ? 2.5 : 2.0; const payout = Math.floor(bet * mult); gameChips += payout;
        
        // ✨ 통계: 딱지 승리 상금 누적
        if (!gameStats.events) gameStats.events = { occurrences: 0, profit: 0, loss: 0, interest: 0 };
        gameStats.events.profit += payout;

        let msg = successes === 3 ? "와... 완벽합니다!" : successes === 2 ? "제법이십니다." : "운이 좀 따랐네요.";
        if(hStatus) hStatus.innerText = `🎉 딱지남과의 승부에서 승리했습니다! (${successes}/3)`;
        if(hProfit) hProfit.innerHTML = `<span style="color:#10b981;">${msg}<br>배팅금의 <b>${mult}배</b>인 <b>+${payout.toLocaleString()}원</b>을 획득!</span>`;
        if(flash) { flash.style.display = "block"; flash.style.background = "rgba(16, 185, 129, 0.3)"; }
        if(typeof AudioSynth !== 'undefined') AudioSynth.playWin();
        appendLogRecord(`[이스터에그] 딱지남 승리 (${successes}/3)`, `+${payout.toLocaleString()} 원`, `color:#10b981; font-weight:bold;`);
        setTimeout(() => {
            if(flash) { flash.style.display = "none"; flash.style.background = ""; }
            if(typeof updateLedgerDisplays === 'function') updateLedgerDisplays(); saveData();
            setTimeout(() => { const end = successes === 3 ? "대단하시네요. 다음에 또 뵙겠습니다." : "역시 운이 좋으시네요. 다음에 또 뵙겠습니다."; if(hStatus) hStatus.innerText = `🃏 딱지남: "${end}"`; }, 1400);
        }, 700);
    }
}

function runDdakjiGame(bet, hStatus, hProfit, flash) {
    const failureLines = ["아쉽네요...", "음... 이번엔 안됐군요. 조금 더 세게 치셔야 할 것 같습니다.", "하... 진짜 답답하네. 이렇게 놓치면 어떡합니까?"];
    const successLines = ["오... 잘 하셨습니다.", "역시... 운이 따르는군요.", "제법이십니다. 생각보다 잘 하시네요."];
    let successes = 0; const successRate = 0.35;
    setTimeout(() => {
        const s1 = Math.random() < successRate; if(s1) successes++; const l1 = s1 ? successLines[Math.floor(Math.random()*3)] : failureLines[Math.floor(Math.random()*3)];
        hStatus.innerText = `1번째 시도`; hProfit.innerHTML = `<span style="color:#94a3b8;">딱지남: "${l1}"</span><br>` + (s1 ? `<span style="color:#10b981;">✅ 딱지가 넘어갔습니다!</span>` : `<span style="color:#ef4444;">❌ 아쉽게 넘어가지 않았습니다.</span>`);
        setTimeout(() => {
            const s2 = Math.random() < successRate; if(s2) successes++; const l2 = s2 ? successLines[Math.floor(Math.random()*3)] : failureLines[Math.floor(Math.random()*3)];
            hStatus.innerText = `2번째 시도`; hProfit.innerHTML = `<span style="color:#94a3b8;">딱지남: "${l2}"</span><br>` + (s2 ? `<span style="color:#10b981;">✅ 딱지가 넘어갔습니다!</span>` : `<span style="color:#ef4444;">❌ 아쉽게 넘어가지 않았습니다.</span>`);
            setTimeout(() => {
                const s3 = Math.random() < successRate; if(s3) successes++; const l3 = s3 ? successLines[Math.floor(Math.random()*3)] : failureLines[Math.floor(Math.random()*3)];
                hStatus.innerText = `3번째 시도`; hProfit.innerHTML = `<span style="color:#94a3b8;">딱지남: "${l3}"</span><br>` + (s3 ? `<span style="color:#10b981;">✅ 딱지가 넘어갔습니다!</span>` : `<span style="color:#ef4444;">❌ 아쉽게 넘어가지 않았습니다.</span>`);
                setTimeout(() => { showDdakjiFinalResult(successes, bet, hStatus, hProfit, flash); }, 800);
            }, 3000);
        }, 1000);
    }, 600);
}


// -----------------------------------------
// 2. 신규 히든 이벤트 (3명의 총잡이)
// -----------------------------------------
let gunmenBetAmount = 0;
const gunmenMultiplier = 3.3; // 배당률 3.3배

function startGunmenEvent() {
    const existing = document.getElementById('gunmen-modal');
    if (existing) existing.remove();

    const currentChips = typeof gameChips !== 'undefined' ? gameChips : 0; 

    const modalHTML = `
        <div id="gunmen-modal" style="position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.9); display:flex; align-items:center; justify-content:center; z-index:9999;">
            <div style="background:#1a1a1a; border: 2px solid #d4af37; padding:30px; border-radius:10px; text-align:center; color:#fff; max-width:550px; font-family:sans-serif; box-shadow: 0 0 20px rgba(212, 175, 55, 0.5);">
                <h2 style="color:#d4af37; margin-top:0; border-bottom: 1px solid #d4af37; padding-bottom: 10px;">🕵️ 브로커 J의 은밀한 제안</h2>
                <p style="font-size:16px; line-height:1.6; text-align: left;">
                    어둠 속에서 브로커 J가 나타나 어깨를 잡습니다.<br><br>
                    "당신을 노리는 두 명의 암살자 제니와 로제가 골목 끝에 와 있소. 내 손에 리볼버 한 자루가 있는데... 
                    돈을 내고 사시겠소? 사지 않으면 고스란히 당하게 될 거요."
                </p>
                <div style="margin:20px 0;">
                    <label style="display:block; margin-bottom:10px; color:#aaa; font-size:14px;">베팅할 칩 금액 입력 (보유: ${currentChips.toLocaleString()})</label>
                    <input type="number" id="gunmen-bet-input" value="${Math.min(100000, currentChips)}" min="1" max="${currentChips}" style="padding:10px; width:80%; background:#222; border:1px solid #d4af37; color:#fff; text-align:center; font-size:16px; border-radius:5px;">
                </div>
                <div id="gunmen-buttons" style="display:flex; gap:10px; justify-content:center;">
                    <button onclick="buyGunmenPistol()" style="padding:12px 24px; background:#2e8b57; color:white; border:1px solid #3cb371; cursor:pointer; font-weight:bold; border-radius:5px; font-size:15px;">[총 구매하기 (베팅)]</button>
                    <button onclick="refuseGunmenPistol()" style="padding:12px 24px; background:#8b0000; color:white; border:1px solid #ff4c4c; cursor:pointer; font-weight:bold; border-radius:5px; font-size:15px;">[구매 거절 (패배)]</button>
                </div>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHTML);
}

function buyGunmenPistol() {
    const inputVal = parseInt(document.getElementById('gunmen-bet-input').value);
    if (isNaN(inputVal) || inputVal <= 0) { alert("올바른 금액을 입력해 주세요."); return; }
    if (inputVal > gameChips) { alert("게임 칩이 부족합니다."); return; }

    gunmenBetAmount = inputVal;
    gameChips -= gunmenBetAmount;
    
    // ✨ 통계: 총잡이 배팅금(구매비용) 지출 처리
    if (!gameStats.events) gameStats.events = { occurrences: 0, profit: 0, loss: 0, interest: 0 };
    gameStats.events.loss += gunmenBetAmount;
    gameStats.events.occurrences++;

    if (typeof updateLedgerDisplays === 'function') updateLedgerDisplays(); 

    showGunmenDuelStart();
}

function refuseGunmenPistol() {
    document.getElementById('gunmen-modal').remove();
    alert("💀 [패배] 총을 사지 않고 걷다가 어둠 속에서 날아온 총알에 무력하게 쓰러졌습니다.");
}

function showGunmenDuelStart() {
    const text = `
        차가운 금속의 감각이 전해집니다.<br><br>
        골목 끝에서 암살자 제니(명중률 50%)와 로제(명중률 100%)가 다가옵니다. 
        당신의 명중률은 33%입니다. 첫 사격 기회는 당신에게 있습니다. 누구를 쏘시겠습니까?
    `;
    const buttons = `
        <button onclick="gunmenShoot('C')" style="padding:12px; background:#8b0000; color:white; border:1px solid #ff4c4c; cursor:pointer; font-weight:bold; border-radius:5px;">[선택 1] 백발백중의 로제를 쏜다</button>
        <button onclick="gunmenShoot('B')" style="padding:12px; background:#b8860b; color:white; border:1px solid #ffd700; cursor:pointer; font-weight:bold; border-radius:5px;">[선택 2] 명중률 50%의 제니를 쏜다</button>
        <button onclick="gunmenShoot('AIR')" style="padding:12px; background:#2e8b57; color:white; border:1px solid #3cb371; cursor:pointer; font-weight:bold; border-radius:5px;">[선택 3] 허공에 위협 사격을 한다</button>
    `;
    updateGunmenModal(text, buttons);
}

function updateGunmenModal(text, buttonHTML) {
    const modalContent = document.querySelector('#gunmen-modal > div');
    if (modalContent) {
        modalContent.innerHTML = `
            <h2 style="color:#d4af37; margin-top:0; border-bottom: 1px solid #d4af37; padding-bottom: 10px;">🤠 3명의 총잡이 결투</h2>
            <p style="font-size:16px; line-height:1.6; min-height: 80px; text-align:left;">${text}</p>
            <div style="margin-top:20px; display:flex; flex-direction:column; gap:10px;">${buttonHTML}</div>
        `;
    }
}

function createNextBtn(nextState, btnText = "[다음 상황 보기]") {
    return `<button onclick="gunmenNext('${nextState}')" style="padding:12px; background:#333; color:#d4af37; border:1px solid #d4af37; cursor:pointer; font-weight:bold; border-radius:5px; font-size:16px;">${btnText}</button>`;
}

function gunmenShoot(target) {
    let hit = Math.random() < 0.33;
    if (target === 'C') {
        updateGunmenModal(`가장 위험한 백발백중의 로제를 향해 방아쇠를 당겼습니다! "탕-!"`, createNextBtn(hit ? 'C_HIT_B_TURN' : 'C_MISS_B_TURN'));
    } else if (target === 'B') {
        updateGunmenModal(`중간 실력자인 제니를 타겟으로 발사했습니다! "탕-!"`, createNextBtn(hit ? 'B_HIT_C_TURN' : 'B_MISS_B_TURN'));
    } else if (target === 'AIR') {
        updateGunmenModal(`어둠을 향해 허공으로 위협 사격을 했습니다! "탕-!"`, createNextBtn('AIR_B_TURN'));
    }
}

function gunmenNext(state) {
    let hit;
    switch(state) {
        case 'C_HIT_B_TURN':
            updateGunmenModal(`기적입니다! 로제가 쓰러졌습니다! <br><br>하지만 남은 제니가 당신을 향해 조준합니다!`, createNextBtn('B_SHOOT_A'));
            break;
        case 'B_SHOOT_A':
            hit = Math.random() < 0.50; 
            if(hit) { updateGunmenModal(`"타앙-!" 제니의 총알이 가슴에 적중했습니다...`, createNextBtn('LOSE', '[결과 보기]')); } 
            else { updateGunmenModal(`"핑-!" 제니가 다급하게 쏜 총알이 빗나갔습니다! 다시 당신의 턴!`, createNextBtn('A_SHOOT_B')); }
            break;
        case 'A_SHOOT_B':
            hit = Math.random() < 0.33; 
            if(hit) { updateGunmenModal(`침착하게 쏜 총알이 제니를 쓰러뜨렸습니다! 승리!`, createNextBtn('WIN', '[결과 보기]')); } 
            else { updateGunmenModal(`아차! 빗나갔습니다. 제니가 차가운 미소를 지으며 조준합니다!`, createNextBtn('B_SHOOT_A')); }
            break;
        case 'C_MISS_B_TURN':
            updateGunmenModal(`총알이 로제를 빗나갔습니다! <br><br>이제 제니의 턴입니다. 제니는 생존을 위해 가장 위협적인 로제를 노립니다!`, createNextBtn('B_SHOOT_C'));
            break;
        case 'B_MISS_B_TURN':
        case 'AIR_B_TURN':
            updateGunmenModal(`총소리에 놀란 제니와 로제가 서로를 노려봅니다! <br><br>제니는 생존을 위해 100% 명중률의 로제를 쏩니다!`, createNextBtn('B_SHOOT_C'));
            break;
        case 'B_SHOOT_C':
            hit = Math.random() < 0.50; 
            if(hit) { updateGunmenModal(`제니가 로제를 완벽하게 제압했습니다! <br><br>이제 당신과 제니의 1:1 상황, 당신이 먼저 쏠 차례입니다!`, createNextBtn('A_SHOOT_B')); } 
            else { updateGunmenModal(`제니의 총알이 빗나갔습니다! 로제가 분노하며 제니를 조준합니다.`, createNextBtn('C_SHOOT_B')); }
            break;
        case 'C_SHOOT_B':
            updateGunmenModal(`백발백중의 로제가 방아쇠를 당깁니다. "탕!" 제니가 즉사했습니다. <br><br>이제 당신과 로제의 1:1 상황, 마지막 기회입니다!`, createNextBtn('A_SHOOT_C'));
            break;
        case 'A_SHOOT_C':
            hit = Math.random() < 0.33; 
            if(hit) { updateGunmenModal(`기적입니다! 쏜 마지막 총알이 로제를 쓰러뜨렸습니다!`, createNextBtn('WIN', '[결과 보기]')); } 
            else { updateGunmenModal(`총알이 빗나갔습니다. 로제가 당신을 향해 천천히 총구를 돌립니다...`, createNextBtn('C_SHOOT_A')); }
            break;
        case 'B_HIT_C_TURN':
            updateGunmenModal(`제니를 쓰러뜨렸습니다! <br><br>하지만 유일한 표적이 된 당신을 향해 백발백중의 로제가 총구를 돌립니다...`, createNextBtn('C_SHOOT_A'));
            break;
        case 'C_SHOOT_A':
            updateGunmenModal(`백발백중의 로제가 방아쇠를 당깁니다. 피할 수 없습니다...`, createNextBtn('LOSE', '[결과 보기]'));
            break;
        case 'WIN': endGunmenEvent(true); break;
        case 'LOSE': endGunmenEvent(false); break;
    }
}

function endGunmenEvent(isWin) {
    document.getElementById('gunmen-modal').remove();
    if (isWin) {
        const reward = Math.floor(gunmenBetAmount * gunmenMultiplier);
        alert(`🎉 [생존 성공] 최후의 승자가 되셨습니다!\n베팅금의 ${gunmenMultiplier}배인 ${reward.toLocaleString()} 칩을 획득했습니다!`);
        gameChips += reward;
        
        // ✨ 통계: 총잡이 승리 상금 누적
        if (!gameStats.events) gameStats.events = { occurrences: 0, profit: 0, loss: 0, interest: 0 };
        gameStats.events.profit += reward;

        appendLogRecord(`[히든 결투] 생존 성공`, `+${reward.toLocaleString()} 칩`, `color:#10b981; font-weight:bold;`);
    } else {
        alert(`💀 [사망] 결투에서 패배했습니다...\n베팅한 ${gunmenBetAmount.toLocaleString()} 칩을 모두 잃었습니다.`);
        appendLogRecord(`[히든 결투] 사망 (패배)`, `-${gunmenBetAmount.toLocaleString()} 칩`, `color:#ef4444; font-weight:bold;`);
    }
    if (typeof updateLedgerDisplays === 'function') updateLedgerDisplays();
    if (typeof saveData === 'function') saveData();
}


// -----------------------------------------
// 3. 메인 외치기 트리거 핸들러
// -----------------------------------------
function triggerHiddenEvent() {
    const input = document.getElementById("cheat-input"); 
    const msg = input.value.trim(); 
    if (msg === "") return; 
    input.value = "";
    
    if (msg === "제발 돈 좀 주세요") {
        if (!gameStats.events) gameStats.events = { occurrences: 0, profit: 0, loss: 0, interest: 0 };
        gameStats.events.occurrences++; // ✨ 통계: 이벤트 횟수 추가
        
        if (bankAsset + gameChips < 50000) {
            bankAsset += 10000000; 
            gameStats.events.profit += 10000000; // ✨ 통계: 기연 적선 수익 추가
            
            if(typeof updateLedgerDisplays === 'function') updateLedgerDisplays();
            const hStatus = document.getElementById("hud-status-text"); const hProfit = document.getElementById("hud-profit-text"); const flash = document.getElementById("flash-overlay");
            if(hStatus) hStatus.innerText = "🎩 [히든 이벤트 발생] 지나가는 석유 재벌이 당신을 발견했습니다.";
            if(hProfit) hProfit.innerHTML = `<span style="color:#fbbf24;">"쯧쯧... 안타깝군. 이걸로 다시 시작해 보게나." +10,000,000 원 획득!</span>`;
            if(flash) { flash.style.display = "block"; flash.style.background = "rgba(251, 191, 36, 0.25)"; setTimeout(() => { flash.style.display = "none"; flash.style.background = ""; }, 1000); }
            if(typeof AudioSynth !== 'undefined') AudioSynth.playWin();
            appendLogRecord(`[기연] 지나가는 부자의 적선`, `+10,000,000 원`, `color:#fbbf24; font-weight:bold;`);
        } else {
            const hStatus = document.getElementById("hud-status-text"); if(document.getElementById("hud-profit-text")) document.getElementById("hud-profit-text").innerHTML = "";
            if(hStatus) hStatus.innerText = "🚶‍♂️ [이벤트 실패] 지나가는 부자가 당신의 남은 잔고를 보고 비웃으며 지나갑니다.";
            if(typeof AudioSynth !== 'undefined') AudioSynth.playLose();
        }
    } 
    else if (msg === "함 싸울래") { 
        fightRandomCitizen(); 
    } 
    else if (msg === "기부") {
        const hStatus = document.getElementById("hud-status-text"); const hProfit = document.getElementById("hud-profit-text"); const flash = document.getElementById("flash-overlay");
        const decimalPart = bankAsset - Math.floor(bankAsset);
        if (decimalPart <= 0) {
            if(hStatus) hStatus.innerText = "💸 [기부] 현재 잔고에 소수점 금액이 없습니다.";
            if(hProfit) hProfit.innerHTML = `<span style="color:#94a3b8;">잔고가 이미 깔끔한 정수입니다!</span>`;
            if(typeof AudioSynth !== 'undefined') AudioSynth.playLose();
        } else {
            const donationAmount = decimalPart; bankAsset = Math.floor(bankAsset); 
            
            // ✨ 통계: 기부 지출 추가
            if (!gameStats.events) gameStats.events = { occurrences: 0, profit: 0, loss: 0, interest: 0 };
            gameStats.events.loss += donationAmount;
            gameStats.events.occurrences++;
            
            if(typeof updateLedgerDisplays === 'function') updateLedgerDisplays();
            if(hStatus) hStatus.innerText = "✨ [소수점 정리 기부 완료]";
            if(hProfit) hProfit.innerHTML = `<span style="color:#10b981;">소수점 <b>₩${donationAmount.toFixed(3)}</b>원을 기부했습니다.<br>잔고가 깔끔한 정수로 정리됐어요!</span>`;
            if(flash) { flash.style.display = "block"; flash.style.background = "rgba(16, 185, 129, 0.18)"; setTimeout(() => { flash.style.display = "none"; flash.style.background = ""; }, 900); }
            if(typeof AudioSynth !== 'undefined') AudioSynth.playWin();
            appendLogRecord(`[기부] 소수점 정리`, `-${donationAmount.toFixed(3)} 원`, `color:#10b981;`);
        }
    } 
    else if (msg === "딱지" || msg === "딱지남" || msg.includes("딱지")) { 
        startDdakjiChallenge(); 
    } 
    else if (msg === "결투" || msg === "총잡이" || msg.includes("총잡이")) {
        startGunmenEvent();
    }
    else {
        const hStatus = document.getElementById("hud-status-text"); if(document.getElementById("hud-profit-text")) document.getElementById("hud-profit-text").innerHTML = "";
        if(hStatus) hStatus.innerText = `💬 허공에 대고 외쳤습니다: "${msg}"`;
    }
}