// ============================================================
// js/business.js
// 지하 사업장 운영 시스템 V2 - 스트레스 제로 & 돌발 이벤트 업데이트
// ============================================================

let myBusinesses = JSON.parse(localStorage.getItem('highroller_businesses') || '{}');

let businessTickInterval = null;
let raidTickInterval = null;

// 관리인 전용 대사 및 서사 데이터
const MANAGER_PROFILES = {
    "biz_1": { 
        catchphrase: "배당률이 짜다고? 그럼 목숨을 걸어보든가.", 
        lore: "과거 촉망받는 국가대표 격투기 선수였으나, 거대 승부조작에 휘말려 영구 제명당했다. 지금은 동혁의 밑에서 묵묵히 불법 토토판의 질서를 유지하며, 빚을 안 갚는 놈들의 뼈를 부러뜨리는 행동대장이다." 
    },
    "biz_2": { 
        catchphrase: "돈만 많으면 뭐해? 쓸 줄을 알아야 진짜 VVIP지.", 
        lore: "정재계 인사들의 치부를 모두 쥐고 있는 강남 유흥계의 절대 권력자. 그녀의 VIP 룸살롱은 단순한 쾌락을 파는 곳이 아니라, 대한민국에서 가장 은밀한 정보가 거래되는 사설 첩보국이다." 
    },
    "biz_3": { 
        catchphrase: "피 묻은 돈이든, 썩은 돈이든. 수수료만 내면 새 돈으로 싹 세탁해 드립니다.", 
        lore: "명문대 경제학과 수석 출신의 천재 회계사였으나, 재벌의 꼬리 자르기로 감방을 다녀온 뒤 완전히 흑화했다. 전 세계 어디서도 추적 불가능한 돈세탁과 환전의 마술사." 
    },
    "biz_4": { 
        catchphrase: "숫자는 거짓말을 하지 않죠. 제가 완벽하게 조작할 거니까요.", 
        lore: "전직 국세청 에이스 조사관 출신의 비리 공무원. 동혁의 거대한 카지노 자금 출처를 조세 피난처의 수십 개 페이퍼 컴퍼니들로 완벽하게 쪼개고 숨기는 장부 조작의 1인자." 
    },
    "biz_5": { 
        catchphrase: "동혁님의 제국은 이제 마카오를 넘어 전 세계를 삼킬 겁니다.", 
        lore: "전직 KGB 요원이자 마카오 카지노 연합의 핵심 브로커. 동혁의 거대한 자본을 해외로 유통하며 글로벌 카지노 네트워크를 구축하는 피도 눈물도 없는 냉혈한 파트너." 
    }
};

document.addEventListener('DOMContentLoaded', () => {
    const tabBtn = document.getElementById('tab-business');
    if(tabBtn) {
        tabBtn.addEventListener('click', () => {
            tabBtn.style.animation = 'none';
            tabBtn.innerHTML = `🏢 지하 사업`;
        });
    }
});

function notifyBusinessEvent(type, bizName, msg) {
    const tabBtn = document.getElementById('tab-business');
    if (type === 'police') {
        if(typeof showToast === 'function') showToast(`🚨 [긴급] ${bizName} - ${msg}`, "fail");
        if(typeof appendLogRecord === 'function') appendLogRecord(`[영업 정지] ${bizName}`, `경찰 단속`, `color:#ef4444;`);
        if(tabBtn && activeTab !== 'business') { tabBtn.style.animation = 'fail-glow 1s infinite alternate'; tabBtn.innerHTML = "🏢 지하 사업 🚨"; }
        if(typeof AudioSynth !== 'undefined') AudioSynth.playLose();
    } else if (type === 'vip') {
        if(typeof showToast === 'function') showToast(`🤑 [VIP 방문] ${bizName} - ${msg}`, "success");
        if(typeof appendLogRecord === 'function') appendLogRecord(`[VIP 방문] ${bizName}`, `팁 폭탄`, `color:#fbbf24; font-weight:bold;`);
        if(tabBtn && activeTab !== 'business') { tabBtn.style.animation = 'win-glow 1s infinite alternate'; tabBtn.innerHTML = "🏢 지하 사업 🤑"; }
        if(typeof AudioSynth !== 'undefined') AudioSynth.playWin();
    } else if (type === 'jinsang') {
        if(typeof showToast === 'function') showToast(`🤬 [진상 난동] ${bizName} - ${msg}`, "fail");
        if(typeof appendLogRecord === 'function') appendLogRecord(`[진상 난동] ${bizName}`, `금고 손실`, `color:#ef4444;`);
        if(tabBtn && activeTab !== 'business') { tabBtn.style.animation = 'fail-glow 1s infinite alternate'; tabBtn.innerHTML = "🏢 지하 사업 ⚠️"; }
        if(typeof AudioSynth !== 'undefined') AudioSynth.playLose();
    }
}

function renderBusinessUI() {
    const container = document.getElementById('business-list-container');
    if (!container) return;
    container.innerHTML = '';

    let totalCps = 0;
    let ownedCount = 0;
    let totalUpgrades = 0;

    Object.values(myBusinesses).forEach(data => {
        totalUpgrades += (data.skillLevel - 1) + (data.lobbyLevel - 1) + (data.loyaltyLevel - 1);
    });

    UNDERGROUND_BUSINESSES.forEach(biz => {
        const myData = myBusinesses[biz.id];
        const isOwned = !!myData;

        const intStat = typeof playerStats !== 'undefined' ? playerStats.int : 0;
        const discountRate = 1 - (intStat * 0.0005); 

        if (isOwned) {
            ownedCount++;
            if (myData.suspendedUntil === undefined) myData.suspendedUntil = 0;

            const sLvl = Math.min(100, myData.skillLevel);
            const lbLvl = Math.min(100, myData.lobbyLevel);
            const lyLvl = Math.min(100, myData.loyaltyLevel);

            const currentCps = Math.floor(biz.baseCps * (1 + 0.1 * sLvl));
            const maxVaultTime = biz.baseCapacityTime * (1 + 0.5 * lbLvl); 
            const maxVault = Math.floor(currentCps * maxVaultTime);
            
            const bonusPercent = lyLvl * 1; 
            
            const isSuspended = myData.suspendedUntil > Date.now();
            if (!isSuspended) totalCps += currentCps;

            const vaultPct = Math.min(100, (myData.vault / maxVault) * 100);
            const vaultColor = vaultPct >= 100 ? '#ef4444' : vaultPct >= 50 ? '#fbbf24' : '#10b981';

            const upCostSkill = Math.floor((biz.baseCost * 0.1) * Math.pow(1.15, sLvl) * discountRate);
            const upCostLobby = Math.floor((biz.baseCost * 0.15) * Math.pow(1.2, lbLvl) * discountRate);
            const upCostLoyalty = Math.floor((biz.baseCost * 0.08) * Math.pow(1.1, lyLvl) * discountRate);

            const getUpBtn = (type, lvl, cost) => {
                if (lvl >= 100) {
                    return `
                        <button disabled style="background:linear-gradient(135deg, #451a03, #1e293b); border:1px solid #fbbf24; border-radius:8px; padding:8px 4px; color:#fbbf24; cursor:not-allowed; box-shadow:0 0 10px rgba(251,191,36,0.2);">
                            <div style="font-size:11px; font-weight:900; margin-bottom:4px;">MAX LEVEL</div>
                            <div style="font-size:10px; opacity:0.8;">업그레이드 완료</div>
                        </button>`;
                } else {
                    const icon = type === 'skill' ? '📊 수완' : type === 'lobby' ? '👮 로비' : '🤝 충성';
                    return `
                        <button onclick="upgradeBusiness('${biz.id}', '${type}')" style="background:#1e293b; border:1px solid #334155; border-radius:8px; padding:8px 4px; color:#cbd5e1; cursor:pointer; transition:all 0.2s;" onmouseover="this.style.borderColor='#64748b'" onmouseout="this.style.borderColor='#334155'">
                            <div style="font-size:11px; font-weight:bold; margin-bottom:4px;">${icon} Lv.${lvl}</div>
                            <div style="font-size:10px; color:#fbbf24;">${cost.toLocaleString()}</div>
                        </button>`;
                }
            };

            let bodyHtml = '';
            if (isSuspended) {
                const remainSec = Math.ceil((myData.suspendedUntil - Date.now()) / 1000);
                const rH = Math.floor(remainSec / 3600);
                const rM = Math.floor((remainSec % 3600) / 60);
                const rS = remainSec % 60;
                const bailAmount = currentCps * 86400; 

                bodyHtml = `
                    <div style="background:rgba(239,68,68,0.1); border:1px solid #ef4444; border-radius:12px; padding:16px; text-align:center; animation: fail-glow 1.5s infinite alternate;">
                        <div style="font-size:16px; font-weight:900; color:#ef4444; margin-bottom:8px;">🚨 경찰 단속으로 영업 정지됨</div>
                        <div style="font-size:13px; color:#fca5a5; margin-bottom:14px;">정지 해제까지: ${rH}시간 ${rM}분 ${rS}초 남음</div>
                        <button onclick="payBailout('${biz.id}', ${bailAmount})" style="width:100%; padding:12px; background:linear-gradient(135deg, #b91c1c, #7f1d1d); color:white; border:none; border-radius:8px; font-size:14px; font-weight:bold; cursor:pointer; box-shadow:0 4px 12px rgba(239,68,68,0.4);">
                            보석금 납부 및 영업 재개 (${bailAmount.toLocaleString()} 칩)
                        </button>
                        <div style="font-size:11px; color:#94a3b8; margin-top:8px;">(보석금 납부 거부 시 남은 시간 동안 생산이 중단됩니다)</div>
                    </div>
                `;
            } else {
                bodyHtml = `
                    <div style="background:#020617; border:1px solid #1e293b; border-radius:12px; padding:12px; margin-bottom:12px;">
                        <div style="display:flex; justify-content:space-between; font-size:12px; margin-bottom:6px;">
                            <span style="color:#94a3b8; font-weight:bold;">비밀 금고 수납량</span>
                            <span style="color:${vaultColor}; font-weight:bold;">${Math.floor(myData.vault).toLocaleString()} / ${maxVault.toLocaleString()} 칩</span>
                        </div>
                        <div style="height:8px; background:#1e293b; border-radius:4px; overflow:hidden; margin-bottom:12px;">
                            <div style="height:100%; width:${vaultPct}%; background:${vaultColor}; transition:width 0.5s;"></div>
                        </div>
                        
                        <div style="background:#0a0f1c; border-radius:8px; padding:10px; border:1px solid #334155;">
                            <div style="display:flex; justify-content:space-between; align-items:center;">
                                <div style="font-size:12px; color:#10b981; font-weight:bold;">✨ 충성 보너스: +${bonusPercent}%</div>
                                <button onclick="collectProfit('${biz.id}')" style="padding:10px 24px; background:linear-gradient(135deg, #10b981, #059669); color:white; border:none; border-radius:8px; font-size:13px; font-weight:900; cursor:pointer; box-shadow:0 4px 10px rgba(16,185,129,0.3);">
                                    수금하기
                                </button>
                            </div>
                        </div>
                    </div>

                    <div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:6px;">
                        ${getUpBtn('skill', sLvl, upCostSkill)}
                        ${getUpBtn('lobby', lbLvl, upCostLobby)}
                        ${getUpBtn('loyalty', lyLvl, upCostLoyalty)}
                    </div>
                `;
            }

            container.innerHTML += `
                <div style="background:linear-gradient(145deg, #0f172a, #020617); border:2px solid ${isSuspended ? '#ef4444' : '#334155'}; border-radius:16px; padding:16px; position:relative; box-shadow: 0 10px 25px rgba(0,0,0,0.5); margin-bottom:12px;">
                    <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:12px;">
                        <div>
                            <!-- ✨ [수정된 부분] 지하사업 관리인 프로필 배지 스타일 적용 -->
                            <div style="display:inline-flex; align-items:center; gap:6px; background:linear-gradient(90deg, #064e3b, #022c22); border:1px solid #10b981; border-radius:6px; padding:4px 10px; margin-bottom:8px; cursor:pointer; box-shadow:0 0 8px rgba(16,185,129,0.3); transition:all 0.2s;" onclick="showManagerProfile('${biz.id}')" onmouseover="this.style.transform='translateY(-1px)'; this.style.boxShadow='0 0 12px rgba(16,185,129,0.6)';" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 0 8px rgba(16,185,129,0.3)';">
                                <span style="font-size:12px;">👤</span>
                                <span style="font-size:11px; color:#6ee7b7; font-weight:bold;">[${biz.title}]</span>
                                <span style="font-size:12.5px; font-weight:900; color:#f8fafc;">${biz.manager}</span>
                            </div>
                            <div style="font-size:18px; font-weight:900; color:#f8fafc; letter-spacing:0.5px;">${biz.name}</div>
                        </div>
                        <div style="text-align:right;">
                            <div style="font-size:16px; font-weight:900; color:${isSuspended ? '#64748b' : '#34d399'};">
                                ${isSuspended ? '생산 중지' : `+${currentCps.toLocaleString()} 칩/초`}
                            </div>
                        </div>
                    </div>
                    ${bodyHtml}
                </div>
            `;
        } else {
            const canUnlock = totalUpgrades >= biz.unlockReq;
            
            container.innerHTML += `
                <div style="background:#0a0f1c; border:1px dashed #475569; border-radius:16px; padding:16px; text-align:center; opacity:${canUnlock ? '1' : '0.5'}; margin-bottom:12px;">
                    <div style="font-size:24px; margin-bottom:8px;">🔒</div>
                    <div style="font-size:16px; font-weight:900; color:#94a3b8; margin-bottom:4px;">${biz.name}</div>
                    <div style="font-size:12px; color:#64748b; margin-bottom:12px;">${biz.desc}</div>
                    ${canUnlock 
                        ? `<button onclick="buyBusiness('${biz.id}')" style="padding:12px 24px; background:linear-gradient(135deg, #d97706, #b45309); color:white; border:none; border-radius:8px; font-weight:bold; cursor:pointer;">인수하기 (${biz.baseCost.toLocaleString()} 칩)</button>`
                        : `<div style="font-size:11.5px; color:#ef4444; font-weight:bold;">해금 조건: 하위 사업장 누적 업그레이드 ${biz.unlockReq}회 필요 <span style="color:#fbbf24;">(현재: ${totalUpgrades}회)</span></div>`
                    }
                </div>
            `;
        }
    });

    document.getElementById('biz-total-cps').innerText = `${totalCps.toLocaleString()} 칩/초`;
    
    const headerPanel = document.querySelector('#section-business > div:nth-child(2)');
    if (headerPanel) {
        let masterBtn = document.getElementById('master-collect-btn');
        if (!masterBtn) {
            masterBtn = document.createElement('button');
            masterBtn.id = 'master-collect-btn';
            masterBtn.onclick = collectAllBusinessProfit;
            masterBtn.style.cssText = 'width:100%; padding:16px; background:linear-gradient(135deg, #10b981, #059669); color:white; border:none; border-radius:12px; font-size:16px; font-weight:900; cursor:pointer; box-shadow:0 6px 20px rgba(16,185,129,0.4); margin-top:12px;';
            headerPanel.appendChild(masterBtn);
        }
        
        let pendingTotal = 0;
        let bonusTotal = 0;
        Object.keys(myBusinesses).forEach(bizId => {
            const data = myBusinesses[bizId];
            if (data.vault > 0 && (!data.suspendedUntil || data.suspendedUntil < Date.now())) {
                pendingTotal += Math.floor(data.vault);
                bonusTotal += Math.floor(data.vault * (data.loyaltyLevel * 0.01));
            }
        });
        
        if (pendingTotal > 0) {
            masterBtn.innerHTML = `👑 구단주 일괄 수금 (+${(pendingTotal + bonusTotal).toLocaleString()})`;
            masterBtn.style.background = 'linear-gradient(135deg, #10b981, #059669)';
            masterBtn.style.pointerEvents = 'auto';
        } else {
            masterBtn.innerHTML = `수금할 금액이 없습니다`;
            masterBtn.style.background = '#334155';
            masterBtn.style.pointerEvents = 'none';
        }
    }
}

function buyBusiness(bizId) {
    const biz = UNDERGROUND_BUSINESSES.find(b => b.id === bizId);
    if (!biz) return;
    
    if (typeof gameChips !== 'undefined' && gameChips < biz.baseCost) {
        if(typeof showAlert === 'function') showAlert(`❌ 자금이 부족합니다. (필요 칩: ${biz.baseCost.toLocaleString()})`); return;
    }
    if (confirm(`[${biz.name}] 사업장을 인수하시겠습니까?\n\n관리인: ${biz.manager} (${biz.title})\n"${biz.lore}"`)) {
        gameChips -= biz.baseCost;
        myBusinesses[bizId] = { isOwned: true, skillLevel: 1, lobbyLevel: 1, loyaltyLevel: 1, vault: 0, suspendedUntil: 0 };
        
        if(typeof updateLedgerDisplays === 'function') updateLedgerDisplays();
        saveBusinessData();
        renderBusinessUI();
        if(typeof showToast === 'function') showToast(`🏢 ${biz.name} 인수를 완료했습니다!`, "success");
        if(typeof AudioSynth !== 'undefined') AudioSynth.playWin();
    }
}

function upgradeBusiness(bizId, type) {
    const biz = UNDERGROUND_BUSINESSES.find(b => b.id === bizId);
    const myData = myBusinesses[bizId];
    if (!biz || !myData) return;

    if (type === 'skill' && myData.skillLevel >= 100) return;
    if (type === 'lobby' && myData.lobbyLevel >= 100) return;
    if (type === 'loyalty' && myData.loyaltyLevel >= 100) return;

    const intStat = typeof playerStats !== 'undefined' ? playerStats.int : 0;
    const discountRate = 1 - (intStat * 0.0005);

    let cost = 0;
    if (type === 'skill') cost = Math.floor((biz.baseCost * 0.1) * Math.pow(1.15, myData.skillLevel) * discountRate);
    else if (type === 'lobby') cost = Math.floor((biz.baseCost * 0.15) * Math.pow(1.2, myData.lobbyLevel) * discountRate);
    else if (type === 'loyalty') cost = Math.floor((biz.baseCost * 0.08) * Math.pow(1.1, myData.loyaltyLevel) * discountRate);

    if (typeof gameChips !== 'undefined' && gameChips < cost) {
        if(typeof showAlert === 'function') showAlert("❌ 업그레이드 비용이 부족합니다."); return;
    }

    gameChips -= cost;
    if (type === 'skill') myData.skillLevel++;
    else if (type === 'lobby') myData.lobbyLevel++;
    else if (type === 'loyalty') myData.loyaltyLevel++;

    if(typeof updateLedgerDisplays === 'function') updateLedgerDisplays();
    saveBusinessData();
    renderBusinessUI();
    if(typeof AudioSynth !== 'undefined') AudioSynth.playCoin();
}

function collectProfit(bizId) {
    const myData = myBusinesses[bizId];
    if (!myData || myData.vault <= 0 || (myData.suspendedUntil > Date.now())) return;

    const baseAmount = Math.floor(myData.vault);
    const bonusAmount = Math.floor(baseAmount * (myData.loyaltyLevel * 0.01)); 
    const totalAmount = baseAmount + bonusAmount;

    gameChips += totalAmount;
    myData.vault = 0;
    
    if (typeof gameStats !== 'undefined') {
        if (!gameStats.business) gameStats.business = { collections: 0, profit: 0, bailouts: 0 };
        gameStats.business.collections++;
        gameStats.business.profit += totalAmount;
    }
    
    if(typeof updateLedgerDisplays === 'function') updateLedgerDisplays();
    saveBusinessData();
    renderBusinessUI();
    if(typeof showToast === 'function') showToast(`💰 ${totalAmount.toLocaleString()} 칩 수금 완료! (보너스 +${bonusAmount.toLocaleString()})`, "success");
    if(typeof AudioSynth !== 'undefined') AudioSynth.playCoin();
}

function collectAllBusinessProfit() {
    let totalBase = 0;
    let totalBonus = 0;

    Object.keys(myBusinesses).forEach(bizId => {
        const data = myBusinesses[bizId];
        if (data.vault > 0 && (!data.suspendedUntil || data.suspendedUntil < Date.now())) {
            let base = Math.floor(data.vault);
            let bonus = Math.floor(base * (data.loyaltyLevel * 0.01));
            totalBase += base;
            totalBonus += bonus;
            data.vault = 0;
        }
    });

    const grandTotal = totalBase + totalBonus;

    if (grandTotal <= 0) {
        if(typeof showAlert === 'function') showAlert("수금할 칩이 없습니다."); return;
    }

    gameChips += grandTotal;
    
    if (typeof gameStats !== 'undefined') {
        if (!gameStats.business) gameStats.business = { collections: 0, profit: 0, bailouts: 0 };
        gameStats.business.collections++;
        gameStats.business.profit += grandTotal;
    }

    if(typeof updateLedgerDisplays === 'function') updateLedgerDisplays();
    saveBusinessData();
    renderBusinessUI();
    if(typeof showToast === 'function') showToast(`👑 일괄 수금 완료! +${grandTotal.toLocaleString()} 칩 획득! (팁: ${totalBonus.toLocaleString()})`, "success");
    if(typeof AudioSynth !== 'undefined') AudioSynth.playWin();
}

function payBailout(bizId, amount) {
    const biz = UNDERGROUND_BUSINESSES.find(b => b.id === bizId);
    const myData = myBusinesses[bizId];
    
    if (typeof gameChips !== 'undefined' && gameChips < amount) {
        if(typeof showAlert === 'function') showAlert("❌ 보석금을 낼 칩이 부족합니다."); return;
    }
    if (confirm(`보석금 ${amount.toLocaleString()} 칩을 납부하고 즉시 영업을 재개하시겠습니까?`)) {
        gameChips -= amount;
        myData.suspendedUntil = 0;
        
        if (typeof gameStats !== 'undefined') {
            if (!gameStats.business) gameStats.business = { collections: 0, profit: 0, bailouts: 0 };
            gameStats.business.bailouts++;
            gameStats.business.profit -= amount;
        }

        if(typeof updateLedgerDisplays === 'function') updateLedgerDisplays();
        saveBusinessData();
        renderBusinessUI();
        if(typeof showToast === 'function') showToast(`💸 뇌물이 성공적으로 전달되어 ${biz.name} 영업이 재개되었습니다!`, "success");
    }
}

function initBusinessEngines() {
    if (businessTickInterval) clearInterval(businessTickInterval);
    if (raidTickInterval) clearInterval(raidTickInterval);

    businessTickInterval = setInterval(() => {
        let needsRender = false;
        
        Object.keys(myBusinesses).forEach(bizId => {
            const biz = UNDERGROUND_BUSINESSES.find(b => b.id === bizId);
            const myData = myBusinesses[bizId];
            if (!biz || !myData) return;

            if (myData.suspendedUntil > Date.now()) {
                if (typeof activeTab !== 'undefined' && activeTab === 'business') needsRender = true; 
                return; 
            }

            const currentCps = Math.floor(biz.baseCps * (1 + 0.1 * myData.skillLevel));
            const maxVaultTime = biz.baseCapacityTime * (1 + 0.5 * myData.lobbyLevel);
            const maxVault = Math.floor(currentCps * maxVaultTime);

            if (myData.vault < maxVault) {
                myData.vault += currentCps;
            } else {
                myData.vault = maxVault;
            }

            if (typeof activeTab !== 'undefined' && activeTab === 'business') needsRender = true;
        });

        if (needsRender) renderBusinessUI();
        saveBusinessData();
    }, 1000);

    raidTickInterval = setInterval(() => {
        Object.keys(myBusinesses).forEach(bizId => {
            const myData = myBusinesses[bizId];
            const biz = UNDERGROUND_BUSINESSES.find(b => b.id === bizId);
            
            if (myData.suspendedUntil > Date.now()) return; 

            const rand = Math.random() * 100;
            const lobbyDefense = myData.lobbyLevel * 0.05; 
            
            let policeRisk = Math.max(0, 1.0 - lobbyDefense); 
            let jinsangRisk = Math.max(1.0, 5.0 - lobbyDefense); 
            let vipChance = 2.0; 

            if (rand < policeRisk) {
                if (typeof unlockedItems !== 'undefined' && unlockedItems.includes("auc_018")) {
                } else {
                    myData.suspendedUntil = Date.now() + (24 * 60 * 60 * 1000); 
                    notifyBusinessEvent('police', biz.name, `경찰 급습! 24시간 영업 정지 처분!`);
                }
            } 
            else if (rand < policeRisk + jinsangRisk) {
                if (myData.vault > 0) {
                    const loss = Math.floor(myData.vault * 0.5);
                    myData.vault -= loss;
                    notifyBusinessEvent('jinsang', biz.name, `진상 난동으로 금고 칩 50% 파손 (-${loss.toLocaleString()})`);
                }
            }
            else if (rand < policeRisk + jinsangRisk + vipChance) {
                const currentCps = Math.floor(biz.baseCps * (1 + 0.1 * myData.skillLevel));
                const maxVaultTime = biz.baseCapacityTime * (1 + 0.5 * myData.lobbyLevel);
                const maxVault = Math.floor(currentCps * maxVaultTime);
                const tip = currentCps * 7200; 

                myData.vault = maxVault; 
                if (typeof gameChips !== 'undefined') gameChips += tip;
                if(typeof updateLedgerDisplays === 'function') updateLedgerDisplays();
                notifyBusinessEvent('vip', biz.name, `큰손 탑승! 금고 100% 충전 & 보너스 팁 +${tip.toLocaleString()}`);
            }
        });
        if (typeof activeTab !== 'undefined' && activeTab === 'business') renderBusinessUI();
    }, 300000); 
}

function saveBusinessData() {
    localStorage.setItem('highroller_businesses', JSON.stringify(myBusinesses));
    localStorage.setItem('highroller_biz_tick', Date.now()); 
}

// 🌟 [스크롤 및 최대 높이 설정 추가된 결산 팝업]
function processOfflineProgress() {
    const now = Date.now();
    const lastTick = parseInt(localStorage.getItem('highroller_biz_tick') || now);
    const elapsedSec = Math.floor((now - lastTick) / 1000);

    if (elapsedSec < 60) {
        localStorage.setItem('highroller_biz_tick', now);
        return; 
    }

    let totalEarned = 0;
    let hasReport = false;
    
    // 🌟 여기에 max-height와 overflow-y를 추가하여 스크롤이 생기게 만듭니다!
    let msg = `<div style="max-height: 55vh; overflow-y: auto; padding-right: 8px; text-align: left;">`;
    msg += `<div style="font-size:15px; font-weight:900; color:#fbbf24; margin-bottom:12px; text-align:center;">📊 오프라인 사업장 결산 보고서</div>`;
    msg += `<div style="font-size:12px; color:#cbd5e1; margin-bottom:16px; text-align:center;">회장님께서 자리를 비우신 <b style="color:#f8fafc;">${formatOfflineTime(elapsedSec)}</b> 동안의 수금 내역입니다.<br><span style="font-size:10px; color:#ef4444;">(오프라인 중에는 사건사고가 발생하지 않습니다)</span></div>`;

    Object.keys(myBusinesses).forEach(bizId => {
        const biz = UNDERGROUND_BUSINESSES.find(b => b.id === bizId);
        const myData = myBusinesses[bizId];
        if (!biz || !myData) return;

        let activeSec = elapsedSec;
        if (myData.suspendedUntil && myData.suspendedUntil > lastTick) {
            if (myData.suspendedUntil > now) activeSec = 0;
            else activeSec = Math.floor((now - myData.suspendedUntil) / 1000);
        }

        if (activeSec > 0) {
            hasReport = true;
            const currentCps = Math.floor(biz.baseCps * (1 + 0.1 * myData.skillLevel));
            const maxVaultTime = biz.baseCapacityTime * (1 + 0.5 * myData.lobbyLevel);
            const maxVault = Math.floor(currentCps * maxVaultTime);

            const spaceLeft = maxVault - myData.vault;
            const timeToFill = spaceLeft > 0 ? Math.ceil(spaceLeft / currentCps) : 0;

            let earnedTime = Math.min(activeSec, timeToFill);
            let earned = earnedTime * currentCps;

            myData.vault += earned;
            totalEarned += earned;

            msg += `
            <div style="background:#020617; padding:10px; border-radius:8px; border:1px solid #334155; margin-bottom:8px;">
                <div style="font-size:12px; color:#fbbf24; font-weight:bold; margin-bottom:4px;">${biz.name} <span style="font-size:10px; color:#64748b;">(관리인: ${biz.manager})</span></div>
                <div style="font-size:12px; color:#10b981;">+ 자동 생산: ${earned.toLocaleString()} 칩</div>
            </div>`;
        }
    });

    if (hasReport) {
        msg += `<div style="margin-top:14px; font-weight:bold; color:#f8fafc; font-size:14px; text-align:center;">오프라인 누적 수납액: <span style="color:#10b981;">+${totalEarned.toLocaleString()}</span> 칩</div>`;
        msg += `</div>`; // 🌟 래퍼 닫기
        
        if (typeof gameStats !== 'undefined') {
            if (!gameStats.business) gameStats.business = { collections: 0, profit: 0, bailouts: 0 };
            gameStats.business.collections++;
            gameStats.business.profit += totalEarned;
        }

        if(typeof showAlert === 'function') showAlert(msg);
        saveBusinessData();
    } else {
        localStorage.setItem('highroller_biz_tick', now);
    }
}

function formatOfflineTime(seconds) {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    if (h > 0) return `${h}시간 ${m}분`;
    return `${m}분`;
}

processOfflineProgress();
initBusinessEngines();

function showManagerProfile(bizId) {
    const biz = UNDERGROUND_BUSINESSES.find(b => b.id === bizId);
    if (!biz) return;
    const myData = typeof myBusinesses !== 'undefined' ? myBusinesses[bizId] : null;
    const loreData = MANAGER_PROFILES[bizId] || { catchphrase: "...", lore: "정보가 없습니다." };

    let modal = document.getElementById('manager-profile-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'manager-profile-modal';
        modal.style.cssText = 'position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.85); display:none; align-items:center; justify-content:center; z-index:999999; backdrop-filter:blur(5px);';
        document.body.appendChild(modal);
    }

    const themeColor = '#10b981'; 

    let sLvl = 1, lbLvl = 1, lyLvl = 1;
    if (myData) {
        sLvl = Math.min(100, myData.skillLevel || 1);
        lbLvl = Math.min(100, myData.lobbyLevel || 1);
        lyLvl = Math.min(100, myData.loyaltyLevel || 1);
    }
    
    const curSkill = Math.floor(biz.stats.skill + ((100 - biz.stats.skill) * ((sLvl - 1) / 99)));
    const curLobby = Math.floor(biz.stats.lobby + ((100 - biz.stats.lobby) * ((lbLvl - 1) / 99)));
    const curLoyalty = Math.floor(biz.stats.loyalty + ((100 - biz.stats.loyalty) * ((lyLvl - 1) / 99)));

    const cpsMulti = (1 + 0.1 * sLvl).toFixed(1);
    const vaultMulti = (1 + 0.5 * lbLvl).toFixed(1);
    const bonusPct = lyLvl;

    const summaryHtml = `
        <div style="display:flex; justify-content:space-between; font-size:12.5px;">
            <span style="color:#94a3b8;">담당 구역</span>
            <span style="font-weight:900; color:#f8fafc;">${biz.name}</span>
        </div>
    `;

    const statsHtml = `
        <div style="margin-bottom:12px;">
            <div style="display:flex; justify-content:space-between; font-size:11.5px; color:#cbd5e1; margin-bottom:6px;">
                <span>📊 수완 <span style="color:#4ade80;">(수익 x${cpsMulti})</span> <span style="font-size:10px; color:#64748b; font-weight:bold;">(Lv.${sLvl})</span></span>
                <span style="font-weight:900; color:#4ade80;">${curSkill} <span style="font-size:10px; color:#64748b; font-weight:normal;">/ 100</span></span>
            </div>
            <div style="height:8px; background:#0f172a; border-radius:4px; overflow:hidden; border:1px solid #1e293b; box-shadow:inset 0 1px 3px rgba(0,0,0,0.5);">
                <div style="height:100%; background:linear-gradient(90deg, #059669, #34d399); width:${curSkill}%; box-shadow:0 0 10px rgba(52,211,153,0.5);"></div>
            </div>
        </div>
        <div style="margin-bottom:12px;">
            <div style="display:flex; justify-content:space-between; font-size:11.5px; color:#cbd5e1; margin-bottom:6px;">
                <span>👮 로비 <span style="color:#60a5fa;">(금고 x${vaultMulti})</span> <span style="font-size:10px; color:#64748b; font-weight:bold;">(Lv.${lbLvl})</span></span>
                <span style="font-weight:900; color:#60a5fa;">${curLobby} <span style="font-size:10px; color:#64748b; font-weight:normal;">/ 100</span></span>
            </div>
            <div style="height:8px; background:#0f172a; border-radius:4px; overflow:hidden; border:1px solid #1e293b; box-shadow:inset 0 1px 3px rgba(0,0,0,0.5);">
                <div style="height:100%; background:linear-gradient(90deg, #1d4ed8, #60a5fa); width:${curLobby}%; box-shadow:0 0 10px rgba(96,165,250,0.5);"></div>
            </div>
        </div>
        <div>
            <div style="display:flex; justify-content:space-between; font-size:11.5px; color:#cbd5e1; margin-bottom:6px;">
                <span>🤝 충성 <span style="color:#c084fc;">(팁 +${bonusPct}%)</span> <span style="font-size:10px; color:#64748b; font-weight:bold;">(Lv.${lyLvl})</span></span>
                <span style="font-weight:900; color:#c084fc;">${curLoyalty} <span style="font-size:10px; color:#64748b; font-weight:normal;">/ 100</span></span>
            </div>
            <div style="height:8px; background:#0f172a; border-radius:4px; overflow:hidden; border:1px solid #1e293b; box-shadow:inset 0 1px 3px rgba(0,0,0,0.5);">
                <div style="height:100%; background:linear-gradient(90deg, #7e22ce, #c084fc); width:${curLoyalty}%; box-shadow:0 0 10px rgba(192,132,252,0.5);"></div>
            </div>
        </div>
    `;

    modal.innerHTML = `
        <div style="background: linear-gradient(145deg, #0a0f1c, #020617); border: 2px solid ${themeColor}; border-radius: 24px; padding: 28px 24px; width: 90%; max-width: 360px; text-align: left; box-shadow: 0 25px 50px rgba(0,0,0,0.9), inset 0 0 25px rgba(16,185,129,0.15); position:relative;">
            <button onclick="document.getElementById('manager-profile-modal').style.display='none'" style="position:absolute; top:14px; right:18px; background:none; border:none; color:#64748b; font-size:26px; cursor:pointer; font-weight:bold; line-height:1; transition:color 0.2s;" onmouseover="this.style.color='#f1f5f9'" onmouseout="this.style.color='#64748b'">&times;</button>
            
            <div style="display:flex; align-items:center; gap:14px; border-bottom: 1px solid #1e293b; padding-bottom: 16px; margin-bottom: 18px;">
                <div style="width:54px; height:54px; background:linear-gradient(135deg, #064e3b, #022c22); border:2px solid ${themeColor}; border-radius:16px; display:flex; align-items:center; justify-content:center; font-size:26px; box-shadow:0 0 15px rgba(16,185,129,0.3);">👤</div>
                <div>
                    <div style="font-size: 11px; color: ${themeColor}; font-weight: 900; margin-bottom: 4px; letter-spacing:0.5px;">[${biz.title}]</div>
                    <div style="font-size: 24px; font-weight: 900; color: #f8fafc; letter-spacing: 0.5px; text-shadow: 0 0 12px rgba(16,185,129,0.4); line-height:1;">${biz.manager}</div>
                </div>
            </div>

            <div style="background: linear-gradient(145deg, #0f172a, #020617); border-radius: 14px; padding: 16px; margin-bottom: 16px; border: 1px solid #1e293b; box-shadow:0 4px 6px rgba(0,0,0,0.3);">
                <div style="font-size: 11px; color: #fbbf24; font-weight: 900; margin-bottom: 12px; letter-spacing:0.5px;">🏢 사업장 정보</div>
                ${summaryHtml}
            </div>

            <div style="background: linear-gradient(145deg, #0f172a, #020617); border-radius: 14px; padding: 16px; margin-bottom: 16px; border: 1px solid #1e293b; box-shadow:0 4px 6px rgba(0,0,0,0.3);">
                <div style="font-size: 11px; color: ${themeColor}; font-weight: 900; margin-bottom: 16px; letter-spacing:0.5px;">📊 관리인 세부 스탯</div>
                ${statsHtml}
            </div>

            <div style="background: rgba(16,185,129,0.05); border-left: 4px solid ${themeColor}; padding: 14px 16px; border-radius: 0 12px 12px 0; font-size: 12.5px; color: #cbd5e1; line-height: 1.6; max-height: 140px; overflow-y: auto;">
                <div style="font-size: 14px; font-weight: 900; color: #fbbf24; font-style: italic; margin-bottom: 12px; border-left: 3px solid #fbbf24; padding-left: 8px;">"${loreData.catchphrase}"</div>
                ${loreData.lore}
            </div>
        </div>
    `;
    modal.style.display = 'flex';
}