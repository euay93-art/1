// ============================================================
// js/main.js
// 게임 초기화, 탭 전환, 퀘스트, 통계, 세이브/로드 및 히든 이벤트
// ============================================================

function switchGameView(target) {
    if (isGameRunning || (typeof isBjGameActive !== 'undefined' && isBjGameActive)) { showAlert("⚠️ 현재 게임 회차가 진행 중일 때는 탭을 전환할 수 없습니다!"); return; }
    activeTab = target;
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    
    const activeBtn = document.getElementById("tab-" + target);
    if (activeBtn) activeBtn.classList.add('active');
    
    document.querySelectorAll('.game-section').forEach(s => s.style.display = "none");

    const hStatus = document.getElementById("hud-status-text");
    const hResult = document.getElementById("hud-result-text");
    const hProfit = document.getElementById("hud-profit-text");

    if (target === 'ladder') {
        document.getElementById("section-ladder").style.display = "block";
        hStatus.innerText = "🪜 럭셔리 사다리 보드에 진입했습니다.";
        hResult.innerText = ""; hProfit.innerText = "";
        if(typeof paintCanvasFrame === 'function') paintCanvasFrame(); 
        if(typeof initializeTimerSequence === 'function') initializeTimerSequence();
    } else if (target === 'blackjack') {
        document.getElementById("section-blackjack").style.display = "block";
        if(typeof ladderInterval !== 'undefined') clearInterval(ladderInterval);
        hStatus.innerText = "🃏 클래식 블랙잭 에어리어에 진입했습니다.";
        hResult.innerText = ""; hProfit.innerText = "";
        if(typeof resetBlackjackTableUI === 'function') resetBlackjackTableUI();
    } else if (target === 'roulette') {
        document.getElementById("section-roulette").style.display = "block";
        if(typeof ladderInterval !== 'undefined') clearInterval(ladderInterval);
        hStatus.innerText = "🎡 프리미엄 유럽식 룰렛 테이블에 진입했습니다.";
        hResult.innerText = ""; hProfit.innerText = "";
        if (typeof initRouletteWheel === 'function') initRouletteWheel();
    } else if (target === 'slot') { 
        document.getElementById("section-slot").style.display = "block";
        if(typeof ladderInterval !== 'undefined') clearInterval(ladderInterval);
        hStatus.innerText = "🎰 럭셔리 릴 슬롯에 오신 것을 환영합니다. 잭팟을 터뜨려보세요!";
        hResult.innerText = ""; hProfit.innerText = "";
        if (typeof initSlotMachine === 'function') initSlotMachine();
    } else if (target === 'market') {
        document.getElementById("section-market").style.display = "block";
        if(typeof ladderInterval !== 'undefined') clearInterval(ladderInterval);
        hStatus.innerText = "📈 종합 거래소에 진입했습니다.";
        hResult.innerText = ""; hProfit.innerText = "";
        if(typeof updateMarketDisplay === 'function') updateMarketDisplay(); 
        if(typeof renderHoldings === 'function') renderHoldings();
        if(typeof renderInfoPrices === 'function') renderInfoPrices(); 
        setTimeout(() => { if(typeof updateBuyPercentButtons === 'function') updateBuyPercentButtons(); }, 50);
    } else if (target === 'coin') {
        document.getElementById("section-coin").style.display = "block";
        if(typeof ladderInterval !== 'undefined') clearInterval(ladderInterval);
        hStatus.innerText = "🪙 코인 거래소에 진입했습니다. 15초마다 가격이 자동 변동됩니다.";
        hResult.innerText = ""; hProfit.innerText = "";
        setTimeout(() => {
            const select = document.getElementById('coin-select');
            if (select && !selectedCoinForTrade) selectedCoinForTrade = select.value || '비트코인';
            if(typeof updateCoinMarketDisplay === 'function') updateCoinMarketDisplay();
            if(typeof renderCoinHoldingsNew === 'function') renderCoinHoldingsNew();
            if(typeof updateCoinPercentPreviews === 'function') updateCoinPercentPreviews();
        }, 30);
        if(typeof updateCoinDisplay === 'function') updateCoinDisplay();
        if(typeof renderCoinHoldingsNew === 'function') renderCoinHoldingsNew();
        if(typeof renderInfoPrices === 'function') renderInfoPrices(); 
        selectedCoinId = null;
    } else if (target === 'toto') {
        document.getElementById("section-toto").style.display = "block";
        if(typeof ladderInterval !== 'undefined') clearInterval(ladderInterval);
        hResult.innerText = ""; hProfit.innerText = "";
        hStatus.innerText = "⚽ 프리미어 리그 토토에 오신 것을 환영합니다.";
        
        document.getElementById('tab-toto')?.classList.remove('tab-alert-blue');

        document.getElementById('toto-match-list').style.display = 'grid';
        document.getElementById('toto-betting-panel').style.display = 'none';
        document.getElementById('toto-live-panel').style.display = 'none';
        
        if(typeof renderTotoMatches === 'function') renderTotoMatches();
        if(typeof renderPreviousRoundSummary === 'function') renderPreviousRoundSummary();
        if(typeof startRoundTimer === 'function') startRoundTimer();
        if (typeof renderLeagueStandingsInInfoTab === 'function') setTimeout(() => renderLeagueStandingsInInfoTab(), 50); 
        if (typeof renderPreviousSeasonHighlight === 'function') setTimeout(() => renderPreviousSeasonHighlight(), 80); 
    } else if (target === 'collection') {
        document.getElementById("section-collection").style.display = "block";
        if(typeof ladderInterval !== 'undefined') clearInterval(ladderInterval);
        hStatus.innerText = "🏆 럭셔리 컬렉션에 오신 것을 환영합니다.";
        hResult.innerText = ""; hProfit.innerText = "";
        renderCollection();
    } else if (target === 'blackmarket') {
        document.getElementById("section-blackmarket").style.display = "block";
        if(typeof ladderInterval !== 'undefined') clearInterval(ladderInterval);
        hStatus.innerText = "🕵️‍♂️ 암시장에 오신 것을 환영합니다. 모든 거래는 흔적이 남지 않습니다.";
        hResult.innerText = ""; hProfit.innerText = "";
        
        document.getElementById('tab-blackmarket')?.classList.remove('tab-alert-red');

        if(typeof renderBlackMarket === 'function') renderBlackMarket();
        if(typeof renderSmartInventory === 'function') renderSmartInventory();
    } else if (target === 'auction') {
        document.getElementById("section-auction").style.display = "block";
        if(typeof ladderInterval !== 'undefined') clearInterval(ladderInterval);
        hStatus.innerText = "📦 VVIP 극비 경매장에 입장했습니다. 검은손들의 베팅이 시작됩니다.";
        hResult.innerText = ""; hProfit.innerText = "";
        if(typeof initAuctionSystem === 'function') initAuctionSystem();
    } else if (target === 'blackclub') {
        document.getElementById("section-blackclub").style.display = "block";
        if(typeof ladderInterval !== 'undefined') clearInterval(ladderInterval);
        hStatus.innerText = "🏆 하이롤러 시티의 VVIP 랭킹을 확인합니다.";
        if(typeof renderBlackClubRanking === 'function') renderBlackClubRanking();
    
    // ✨ [신규 추가] 메신저 탭 연결
    } else if (target === 'messenger') {
        document.getElementById("section-messenger").style.display = "block";
        if(typeof ladderInterval !== 'undefined') clearInterval(ladderInterval);
        hStatus.innerText = "💬 시크릿 메신저에 접속했습니다. 은밀한 지시를 내리세요.";
        hResult.innerText = ""; hProfit.innerText = "";
        
        if(typeof initMessengerSystem === 'function') initMessengerSystem();
    } else if (target === 'business') {
        document.getElementById("section-business").style.display = "block";
        if(typeof ladderInterval !== 'undefined') clearInterval(ladderInterval);
        hStatus.innerText = "🏢 지하 사업장을 시찰합니다. 관리인들의 충성도를 확인하십시오.";
        hResult.innerText = ""; hProfit.innerText = "";
        if(typeof renderBusinessUI === 'function') renderBusinessUI();
    } else if (target === 'quest') {
        document.getElementById("section-quest").style.display = "block";
        if(typeof ladderInterval !== 'undefined') clearInterval(ladderInterval);
        hStatus.innerText = "📋 퀘스트 보드에 진입했습니다.";
        hResult.innerText = ""; hProfit.innerText = "";
        renderQuests();
    } else if (target === 'stats') {
        document.getElementById("section-stats").style.display = "block";
        if(typeof ladderInterval !== 'undefined') clearInterval(ladderInterval);
        hStatus.innerText = "📊 통계 탭에 진입했습니다.";
        hResult.innerText = ""; hProfit.innerText = "";
        renderStats();
    } else if (target === 'title') {
        document.getElementById("section-title").style.display = "block";
        if(typeof ladderInterval !== 'undefined') clearInterval(ladderInterval);
        hStatus.innerText = "🏅 게임별 칭호 진행 상황을 확인하세요!";
        hResult.innerText = ""; hProfit.innerText = "";
        renderTitleTab();
    } else if (target === 'guide') {
        document.getElementById("section-guide").style.display = "block";
        if(typeof ladderInterval !== 'undefined') clearInterval(ladderInterval);
        hStatus.innerText = "📖 칭호 시스템 상세 가이드를 확인하세요. 숨겨진 재미를 찾아보세요!";
        hResult.innerText = ""; hProfit.innerText = "";
    } else if (target === 'info') {
        document.getElementById("section-info").style.display = "block";
        if(typeof ladderInterval !== 'undefined') clearInterval(ladderInterval);
        hStatus.innerText = "💾 소중한 게임 데이터를 안전하게 백업하고 복원하세요.";
        hResult.innerText = ""; hProfit.innerText = "";
    } else if (target === 'equip') {
        document.getElementById("section-equip").style.display = "block";
        if(typeof ladderInterval !== 'undefined') clearInterval(ladderInterval);
        hStatus.innerText = "⚔️ 도박꾼 장비 시스템에 진입했습니다. 장비를 강화하여 행운을 극대화하세요!";
        hResult.innerText = ""; hProfit.innerText = "";
        if(typeof renderEquipUI === 'function') renderEquipUI();
    } else if (target === 'arena') {
        document.getElementById("section-arena").style.display = "block";
        if(typeof ladderInterval !== 'undefined') clearInterval(ladderInterval);
        hStatus.innerText = "🩸 규칙 없는 불법 투기장에 오신 것을 환영합니다.";
        hResult.innerText = ""; hProfit.innerText = "";
        if(typeof initArena === 'function') initArena();
    } else if (target === 'profile') {
        document.getElementById("section-profile").style.display = "block";
        if(typeof ladderInterval !== 'undefined') clearInterval(ladderInterval);
        hStatus.innerText = "👤 내 정보 및 스탯을 관리하세요.";
        hResult.innerText = ""; hProfit.innerText = "";
        if(typeof renderProfileUI === 'function') renderProfileUI();
    }
}

// ✨ 신규: 통합 랭킹 렌더링 함수 (이름 클릭 시 프로필 팝업 추가)
function renderBlackClubRanking() {
    const listEl = document.getElementById('blackclub-ranking-list');
    if (!listEl) return;
    
    listEl.innerHTML = '';
    
    const combined = getCombinedRanking();

    // 🌟 신규: 금액을 '조'와 '억' 단위로 포맷팅해 주는 함수
    function formatMoney(amount) {
        const absAmt = Math.abs(amount);
        if (absAmt < 100000000) return Math.floor(absAmt).toLocaleString(); // 1억 미만 처리
        const eokTotal = Math.floor(absAmt / 100000000);
        const jo = Math.floor(eokTotal / 10000);
        const eok = eokTotal % 10000;
        
        let result = "";
        if (jo > 0) result += `${jo.toLocaleString()}조 `;
        if (eok > 0 || jo === 0) result += `${eok.toLocaleString()}억`;
        return amount < 0 ? "-" + result.trim() : result.trim();
    }

    // data.js에 등록된 랭커들의 고유 시작 자산 리스트 (기준 금액)
    const ORIGINAL_NET_WORTH = {
        "rank_iu": 12500000000000,
        "rank_sohee": 9500000000000,
        "rank_hyori": 8200000000000,
        "rank_wonyoung": 7100000000000,
        "rank_jisoo": 6500000000000,
        "rank_suzy": 5800000000000,
        "rank_jennie": 4900000000000,
        "rank_jongseo": 4200000000000,
        "rank_goeun": 3500000000000,
        "rank_taeyeon": 2800000000000,
        "rank_jiwon": 2100000000000,
        "rank_yujin": 1500000000000,
        "rank_minji": 1200000000000,
        "rank_sekyung": 900000000000,
        "rank_miyeon": 750000000000,
        "rank_seolyoon": 600000000000,
        "rank_haerin": 450000000000,
        "rank_jeongeui": 300000000000,
        "rank_minsi": 200000000000,
        "rank_eunbi": 100000000000
    };
    
    combined.forEach((r, idx) => {
        const rank = idx + 1;
        let bgStyle = "background:#0f172a; border:1px solid #334155;";
        let rankClass = "";
        let nameColor = "#e2e8f0";
        
        if (r.isPlayer) {
            bgStyle = "background:linear-gradient(145deg, #1e3a8a, #0f172a); border:2px solid #3b82f6; box-shadow:0 0 10px rgba(59,130,246,0.3);";
            nameColor = "#60a5fa";
        } else if (rank === 1) {
            rankClass = "rank-1-glow";
            nameColor = "#fcd34d";
        } else if (rank === 2) {
            rankClass = "rank-2-glow";
        } else if (rank === 3) {
            rankClass = "rank-3-glow";
        }
        
        let subText = r.isPlayer ? "👑 언더독 (나)" : (r.isUnlocked ? r.title : "정체불명의 하이롤러");
        let displayStatus = r.status === "bankrupt" ? `<span style="color:#ef4444; font-size:11px; font-weight:bold;">[파산 도피중]</span>` : "";
        
        let displayNameHtml = r.isPlayer ? "임동혁" : (r.isUnlocked ? `<span onclick="showRankerProfile('${r.id}')" style="cursor:pointer; border-bottom:1px dashed #94a3b8; padding-bottom:1px;" title="프로필 보기">${r.name} 🔍</span>` : "???");

        // 🌟 수정됨: 총 자산을 조/억 포맷팅 함수에 통과
        let displayNetWorth = r.isUnlocked || r.isPlayer ? `총 ₩${formatMoney(r.netWorth)}` : "???";

        // 🌟 수정됨: 변동 금액(수익/손실)도 조/억 포맷팅 함수에 통과
        let profitLossHtml = "";
        if (!r.isPlayer && ORIGINAL_NET_WORTH[r.id]) {
            const diff = r.netWorth - ORIGINAL_NET_WORTH[r.id];
            if (diff > 0) {
                profitLossHtml = `<div style="font-size:11px; color:#ef4444; font-weight:bold;">(수익: +${formatMoney(diff)})</div>`;
            } else if (diff < 0) {
                profitLossHtml = `<div style="font-size:11px; color:#3b82f6; font-weight:bold;">(손실: ${formatMoney(diff)})</div>`;
            } else {
                profitLossHtml = `<div style="font-size:11px; color:#94a3b8;">(변동 없음)</div>`;
            }
        } else if (r.isPlayer) {
            // 플레이어는 2,000만 원 시작이므로 20,000,000을 기준으로 계산
            const playerDiff = r.netWorth - 20000000;
            if (playerDiff > 0) {
                profitLossHtml = `<div style="font-size:11px; color:#ef4444; font-weight:bold;">(수익: +${formatMoney(playerDiff)})</div>`;
            } else if (playerDiff < 0) {
                profitLossHtml = `<div style="font-size:11px; color:#3b82f6; font-weight:bold;">(손실: ${formatMoney(playerDiff)})</div>`;
            } else {
                profitLossHtml = `<div style="font-size:11px; color:#94a3b8;">(변동 없음)</div>`;
            }
        }

        const div = document.createElement('div');
        div.className = rankClass;
        div.style.cssText = `${bgStyle} border-radius:12px; padding:12px; display:flex; justify-content:space-between; align-items:center; transition:transform 0.2s;`;
        
        let subText2 = "";
        if (!r.isPlayer && !r.isUnlocked) {
            subText2 = `<div style="font-size:10px; color:#64748b; margin-top:4px;">(정보 없음)</div>`;
        }
        
        div.innerHTML = `
            <div style="display:flex; align-items:center; gap:12px;">
                <div style="font-size:20px; font-weight:900; color:${rank <= 3 ? '#fbbf24' : '#94a3b8'}; width:30px; text-align:center;">${rank}</div>
                <div>
                    <div style="font-size:15px; font-weight:900; color:${nameColor}; letter-spacing:0.5px;">${displayNameHtml} ${displayStatus}</div>
                    <div style="font-size:11px; color:#94a3b8; margin-top:2px;">${subText}</div>
                </div>
            </div>
            <div style="text-align:right;">
                <div style="font-size:14px; font-weight:900; color:#10b981; margin-bottom:2px;">${displayNetWorth}</div>
                ${profitLossHtml}
                ${subText2}
            </div>
        `;
        listEl.appendChild(div);
    });
}

// 🌟 신규: 랭커 프로필 전용 모달 오픈 함수
function showRankerProfile(rankerId) {
    const ranker = BLACK_CLUB_MEMBERS.find(r => r.id === rankerId);
    if(!ranker) return;
    
    const modal = document.getElementById('vvip-profile-modal');
    if (!modal) return;
    const themeColor = '#c026d3'; 
    
    const summaryHtml = `
        <div style="display:flex; justify-content:space-between; margin-bottom:8px; font-size:12.5px;">
            <span style="color:#94a3b8;">추정 자산</span>
            <span style="font-weight:900; color:#10b981;">₩${Math.floor(ranker.netWorth / 100000000).toLocaleString()}억</span>
        </div>
        <div style="display:flex; justify-content:space-between; font-size:12.5px;">
            <span style="color:#94a3b8;">선호품(경매)</span>
            <span style="font-weight:bold; color:#e2e8f0;">${ranker.giftPreferences ? ranker.giftPreferences.join(", ") : '없음'}</span>
        </div>
    `;

    const stats = ranker.stats || { investment: 0, gambling: 0, analysis: 0, business: 0, flex: 0 };
    const statsHtml = `
        <div style="margin-bottom:8px;">
            <div style="display:flex; justify-content:space-between; font-size:11px; color:#cbd5e1; margin-bottom:4px;"><span>과시욕 (Flex)</span><span style="font-weight:bold; color:#ef4444;">${stats.flex}</span></div>
            <div style="height:6px; background:#1e293b; border-radius:3px; overflow:hidden;"><div style="height:100%; background:linear-gradient(90deg, #b91c1c, #ef4444); width:${stats.flex}%;"></div></div>
        </div>
        <div style="margin-bottom:8px;">
            <div style="display:flex; justify-content:space-between; font-size:11px; color:#cbd5e1; margin-bottom:4px;"><span>냉철함 (투자/사업)</span><span style="font-weight:bold; color:#3b82f6;">${Math.max(stats.investment, stats.business)}</span></div>
            <div style="height:6px; background:#1e293b; border-radius:3px; overflow:hidden;"><div style="height:100%; background:linear-gradient(90deg, #1d4ed8, #3b82f6); width:${Math.max(stats.investment, stats.business)}%;"></div></div>
        </div>
        <div>
            <div style="display:flex; justify-content:space-between; font-size:11px; color:#cbd5e1; margin-bottom:4px;"><span>광기 (도박/분석)</span><span style="font-weight:bold; color:#a855f7;">${Math.max(stats.gambling, stats.analysis)}</span></div>
            <div style="height:6px; background:#1e293b; border-radius:3px; overflow:hidden;"><div style="height:100%; background:linear-gradient(90deg, #7e22ce, #a855f7); width:${Math.max(stats.gambling, stats.analysis)}%;"></div></div>
        </div>
    `;

    modal.innerHTML = `
        <div style="background: linear-gradient(145deg, #0f172a, #020617); border: 2px solid ${themeColor}; border-radius: 20px; padding: 24px; width: 90%; max-width: 360px; text-align: left; box-shadow: 0 20px 60px rgba(0,0,0,0.9), inset 0 0 20px ${themeColor}25; position:relative;">
            <div onclick="document.getElementById('vvip-profile-modal').style.display='none'" style="position:absolute; top:12px; right:16px; font-size:28px; color:#94a3b8; cursor:pointer; font-weight:bold; line-height:1;">&times;</div>
            
            <div style="border-bottom: 1px solid #334155; padding-bottom: 14px; margin-bottom: 16px; text-align: center;">
                <div style="font-size: 13px; color: ${themeColor}; font-weight: bold; margin-bottom: 4px;">${ranker.title}</div>
                <div style="font-size: 26px; font-weight: 900; color: #f8fafc; letter-spacing: 1px; text-shadow: 0 0 15px ${themeColor}66;">${ranker.name}</div>
            </div>
            <div style="background: #020617; border-radius: 12px; padding: 14px; margin-bottom: 16px; border: 1px solid #1e293b;">
                ${summaryHtml}
            </div>
            <div style="background: #020617; border-radius: 12px; padding: 14px; margin-bottom: 16px; border: 1px solid #1e293b;">
                <div style="font-size: 12px; color: ${themeColor}; font-weight: 900; margin-bottom: 12px;">성향 스탯</div>
                ${statsHtml}
            </div>
            <div style="background: rgba(192,38,211,0.05); border-left: 4px solid ${themeColor}; padding: 14px; border-radius: 0 8px 8px 0; font-size: 12.5px; color: #cbd5e1; line-height: 1.6; max-height: 120px; overflow-y: auto;">
                ${ranker.lore}
            </div>
        </div>
    `;

    modal.style.display = 'flex';
}

function saveData() {
    try {
        const data = {
            bankAsset, gameChips, savingsBalance, pendingInterest, lastInterestTime,
            portfolio, coinPortfolio, coinPrices, previousCoinPrices, currentRound, unlockedItems,
            dailyQuestProgress, weeklyQuestProgress, completedDailyQuests, completedWeeklyQuests,
            lastDailyReset, lastWeeklyReset, stockPrices, previousPrices, priceHistory,
            newsLog, activeNewsEffects, totoActiveBet,
            currentTotoMatchId: currentTotoMatch ? currentTotoMatch.id : null,
            gameStats, assetHistory,
            activeSponsor, 
            inventory: typeof inventory !== 'undefined' ? inventory : {}, 
            bmCurrentStock: typeof bmCurrentStock !== 'undefined' ? bmCurrentStock : [], 
            bmLastRefresh: typeof bmLastRefresh !== 'undefined' ? bmLastRefresh : 0,
            pawnedItems: typeof pawnedItems !== 'undefined' ? pawnedItems : [], 
            currentSeason: currentSeason || 1,
            currentRound: (typeof currentRound !== 'undefined' && currentRound >= 1) ? currentRound : 1,
            currentRoundMatches: (currentRoundMatches && Array.isArray(currentRoundMatches) && currentRoundMatches.length > 0) ? currentRoundMatches : [],
            roundTimeLeft: (typeof roundTimeLeft !== 'undefined' && roundTimeLeft > 0) ? roundTimeLeft : 600,
            roundPhase: roundPhase || 'betting',
            leagueStandings: (leagueStandings && typeof leagueStandings === 'object' && Object.keys(leagueStandings).length > 0) ? leagueStandings : {},
            currentTotoMatch: currentTotoMatch || null,
            selectedTotoBetType: selectedTotoBetType || null,
            selectedTotoOdds: selectedTotoOdds || 0,
            lastRoundBets: lastRoundBets || [],
            lastRoundMatches: lastRoundMatches || [],
            roundBets: roundBets || [],
            previousSeasonNumber: previousSeasonNumber || 0,
            previousSeasonStandings: previousSeasonStandings || null,
            equipmentLevels: Object.fromEntries(Object.entries(equipment).map(([k, v]) => [k, v.level])),
            equipmentTiers: Object.fromEntries(Object.entries(equipment).map(([k, v]) => [k, v.tier || 1])),
            arenaFighters: (typeof ARENA_FIGHTERS !== 'undefined') ? ARENA_FIGHTERS : [],
            standbyFighters: (typeof STANDBY_FIGHTERS !== 'undefined') ? STANDBY_FIGHTERS : [],
            graduatedFighters: (typeof GRADUATED_FIGHTERS !== 'undefined') ? GRADUATED_FIGHTERS : [],
            missingFighters: (typeof MISSING_FIGHTERS !== 'undefined') ? MISSING_FIGHTERS : [],
            playerLevel, playerExp, playerSP, playerStats,
            claimedMilestones: window.claimedMilestones || [],
            slotJackpotAmount: typeof slotJackpotAmount !== 'undefined' ? slotJackpotAmount : 10000000
        };
        localStorage.setItem('highroller_save_v2', JSON.stringify(data));
        
        if (typeof saveRankingData === 'function') saveRankingData();
    } catch (e) { console.warn('저장 실패:', e); }
}

function loadData() {
    try {
        const saved = localStorage.getItem('highroller_save_v2');
        if (!saved) return false;
        const data = JSON.parse(saved);
        
        if (data.bankAsset !== undefined) bankAsset = data.bankAsset;
        if (data.gameChips !== undefined) gameChips = data.gameChips;
        if (data.savingsBalance !== undefined) savingsBalance = data.savingsBalance;
        if (data.pendingInterest !== undefined) pendingInterest = data.pendingInterest;
        if (data.lastInterestTime !== undefined) lastInterestTime = data.lastInterestTime;
        if (data.portfolio) portfolio = data.portfolio;
        if (data.coinPortfolio) coinPortfolio = data.coinPortfolio;
        if (data.currentRound) currentRound = data.currentRound;
        if (data.unlockedItems) unlockedItems = data.unlockedItems;
        if (data.dailyQuestProgress) dailyQuestProgress = data.dailyQuestProgress;
        if (data.weeklyQuestProgress) weeklyQuestProgress = data.weeklyQuestProgress;
        if (data.completedDailyQuests) completedDailyQuests = data.completedDailyQuests;
        if (data.completedWeeklyQuests) completedWeeklyQuests = data.completedWeeklyQuests;
        if (data.lastDailyReset) lastDailyReset = data.lastDailyReset;
        if (data.lastWeeklyReset) lastWeeklyReset = data.lastWeeklyReset;
        if (data.stockPrices) stockPrices = data.stockPrices;
        if (data.previousPrices) previousPrices = data.previousPrices;
        if (data.priceHistory) priceHistory = data.priceHistory;
        if (data.coinPrices) coinPrices = data.coinPrices;
        if (data.previousCoinPrices) previousCoinPrices = data.previousCoinPrices;
        if (data.newsLog) newsLog = data.newsLog;
        if (data.activeNewsEffects) activeNewsEffects = data.activeNewsEffects;
        if (data.gameStats) gameStats = { ...gameStats, ...data.gameStats };
        if (data.assetHistory) assetHistory = data.assetHistory;
        
        if (data.inventory) inventory = data.inventory;
        if (data.bmCurrentStock) bmCurrentStock = data.bmCurrentStock;
        if (data.bmLastRefresh) bmLastRefresh = data.bmLastRefresh;
        if (data.pawnedItems) pawnedItems = data.pawnedItems;
        
        if (data.activeSponsor !== undefined) activeSponsor = data.activeSponsor; 
        
        if (data.playerLevel !== undefined) playerLevel = data.playerLevel;
        if (data.playerExp !== undefined) playerExp = data.playerExp;
        if (data.playerSP !== undefined) playerSP = data.playerSP;
        if (data.playerStats !== undefined) playerStats = data.playerStats;

        if (data.claimedMilestones) window.claimedMilestones = data.claimedMilestones; 
        if (data.slotJackpotAmount !== undefined && typeof slotJackpotAmount !== 'undefined') slotJackpotAmount = data.slotJackpotAmount;

        if (data.equipmentLevels) {
            Object.keys(data.equipmentLevels).forEach(key => {
                if (equipment[key]) equipment[key].level = Math.max(0, Math.min(25, data.equipmentLevels[key] || 0));
            });
        }
        if (data.equipmentTiers) {
            Object.keys(data.equipmentTiers).forEach(key => {
                if (equipment[key]) equipment[key].tier = Math.max(1, Math.min(11, data.equipmentTiers[key] || 1));
            });
        }
        
        let restored = false;
        if (data.currentSeason !== undefined) currentSeason = data.currentSeason;
        if (data.currentRound !== undefined && data.currentRound >= 1) { currentRound = data.currentRound; restored = true; }
        if (data.currentRoundMatches && Array.isArray(data.currentRoundMatches) && data.currentRoundMatches.length > 0) { currentRoundMatches = data.currentRoundMatches; restored = true; }
        if (data.roundTimeLeft !== undefined && data.roundTimeLeft > 0) { roundTimeLeft = data.roundTimeLeft; restored = true; }
        if (data.roundPhase) roundPhase = data.roundPhase;
        
        if (data.leagueStandings && typeof data.leagueStandings === 'object' && Object.keys(data.leagueStandings).length > 0) {
            leagueStandings = data.leagueStandings;
        } else {
            leagueStandings = {};
            if(typeof initLeagueStandings === 'function') initLeagueStandings();
        }
        
        if (data.previousSeasonNumber !== undefined) previousSeasonNumber = data.previousSeasonNumber;
        if (data.previousSeasonStandings && typeof data.previousSeasonStandings === 'object') previousSeasonStandings = data.previousSeasonStandings;
        if (data.currentTotoMatch) currentTotoMatch = data.currentTotoMatch;
        if (data.roundBets && Array.isArray(data.roundBets)) roundBets = data.roundBets;
        if (data.lastRoundBets && Array.isArray(data.lastRoundBets)) lastRoundBets = data.lastRoundBets;
        if (data.selectedTotoBetType) {
            selectedTotoBetType = data.selectedTotoBetType;
            selectedTotoOdds = data.selectedTotoOdds || 0;
            totoActiveBet = data.totoActiveBet || 0;
        }
        
        if (data.arenaFighters && data.arenaFighters.length > 0 && typeof ARENA_FIGHTERS !== 'undefined') ARENA_FIGHTERS = data.arenaFighters;
        if (data.standbyFighters && typeof STANDBY_FIGHTERS !== 'undefined') STANDBY_FIGHTERS = data.standbyFighters;
        if (data.graduatedFighters && typeof GRADUATED_FIGHTERS !== 'undefined') GRADUATED_FIGHTERS = data.graduatedFighters;
        if (data.missingFighters && typeof MISSING_FIGHTERS !== 'undefined') MISSING_FIGHTERS = data.missingFighters;
        
        if (window.roundTimerInterval) { clearInterval(window.roundTimerInterval); window.roundTimerInterval = null; }
        setTimeout(() => {
            if (!window.roundTimerInterval && typeof startRoundTimer === 'function') { startRoundTimer(); }
        }, 400);
        
        return true;
    } catch (e) { console.warn('불러오기 실패:', e); return false; }
}

function resetAllData() {
    if (!confirm('정말 모든 데이터를 초기화할까요?')) return;
    localStorage.removeItem('highroller_save_v2');
    localStorage.removeItem('highroller_businesses'); 
    localStorage.removeItem('highroller_biz_tick');   
    localStorage.removeItem('highroller_auction_sold'); 
    localStorage.removeItem('highroller_my_auction');   
    localStorage.removeItem('highroller_rankers'); 

    bankAsset = 20000000; gameChips = 0; portfolio = {};
    currentRound = 0; unlockedItems = []; newsLog = []; activeNewsEffects = []; priceHistory = {};
    inventory = {}; bmCurrentStock = []; bmLastRefresh = 0; pawnedItems = [];
    window.claimedMilestones = []; 
    if(typeof myBusinesses !== 'undefined') myBusinesses = {}; 
    if(typeof soldAuctionItems !== 'undefined') soldAuctionItems = [];
    if(typeof myAuctionItems !== 'undefined') myAuctionItems = [];
    if(typeof slotJackpotAmount !== 'undefined') slotJackpotAmount = 10000000; 
    
    if(typeof initPriceHistory === 'function') initPriceHistory();

    gameStats = {
        totalProfit: 0, totalLoss: 0, totalGames: 0,
        ladder: { plays: 0, hits: 0, profit: 0, loss: 0, maxWinStreak: 0, currentWinStreak: 0, maxOddsHit: 1.0, maxSingleWin: 0, maxSingleLoss: 0 },
        blackjack: { plays: 0, wins: 0, profit: 0, loss: 0, busts: 0, blackjacks: 0, maxSingleWin: 0, maxSingleLoss: 0 },
        roulette: { plays: 0, profit: 0, loss: 0, maxSingleWin: 0, maxSingleLoss: 0 },
        slot: { plays: 0, profit: 0, loss: 0, maxSingleWin: 0, maxSingleLoss: 0, jackpots: 0 }, 
        stock: { buys: 0, sells: 0, realizedProfit: 0, maxPortfolioValue: 0, feePaid: 0 },
        coin: { buys: 0, sells: 0, realizedProfit: 0, maxPortfolioValue: 0, feePaid: 0 },
        toto: { plays: 0, hits: 0, profit: 0, loss: 0, maxOddsHit: 1.0, currentHitStreak: 0, maxHitStreak: 0, maxSingleWin: 0, maxSingleLoss: 0 },
        arena: { plays: 0, wins: 0, profit: 0, loss: 0, maxSingleWin: 0, maxSingleLoss: 0 },
        system: { policeFines: 0, brokerFees: 0, pawnshopLosses: 0, equipEnhances: 0, equipDestroys: 0 }
    };
    assetHistory = [20000000];

    playerLevel = 1; playerExp = 0; playerSP = 0; playerStats = { luk: 0, int: 0, dex: 0, cha: 0 };
    Object.keys(equipment).forEach(key => {
        equipment[key].level = 0;
        equipment[key].tier = 1;
    });

    dailyQuestProgress = { casinoPlays: 0, arenaBets: 0, marketBuys: 0, totoBets: 0, dailyProfit: 0 };
    weeklyQuestProgress = { itemsBought: 0, bmBuys: 0, enhances: 0, weeklyProfit: 0, creampie: 0 };
    completedDailyQuests = []; completedWeeklyQuests = [];
    lastDailyReset = null; lastWeeklyReset = null;

    stockPrices = { ...STOCK_INITIAL_PRICES }; previousPrices = { ...stockPrices };
    coinPortfolio = {}; if(typeof initCoinPrices === 'function') initCoinPrices();

    leagueStandings = {}; if(typeof initLeagueStandings === 'function') initLeagueStandings();
    currentRound = 1; currentSeason = 1;
    if(typeof generateRoundMatches === 'function') currentRoundMatches = generateRoundMatches(currentRound);
    roundBets = []; lastRoundMatches = []; lastRoundBets = [];
    roundTimeLeft = 600; roundPhase = 'betting'; isLiveMode = false; showingFinalResults = false;
    matchTimeLeft = 0; currentTotoMatch = null; selectedTotoBetType = ""; totoActiveBet = 0;
    previousSeasonNumber = 0; previousSeasonStandings = {};

    if (window.roundTimerInterval) { clearInterval(window.roundTimerInterval); window.roundTimerInterval = null; }
    if (window.liveUpdateInterval) { clearInterval(window.liveUpdateInterval); window.liveUpdateInterval = null; }

    const ul = document.getElementById("history-items-ul");
    if (ul) ul.innerHTML = `<li style="color:#475569; text-align:center; width:100%;">정산 원장 이력이 존재하지 않습니다.</li>`;

    if(typeof updateLedgerDisplays === 'function') updateLedgerDisplays();
    if(typeof renderHoldings === 'function' && document.getElementById('holdings-list')) renderHoldings();
    if(typeof renderStats === 'function' && document.getElementById('stats-total-asset')) renderStats();
    if(typeof renderQuests === 'function' && document.getElementById('daily-quest-list')) renderQuests();
    if(typeof renderCollection === 'function' && document.getElementById('collection-grid')) renderCollection();
    if(typeof renderBusinessUI === 'function' && document.getElementById('biz-total-cps')) renderBusinessUI(); 
    if(typeof renderMyAuctionSafe === 'function' && document.getElementById('auction-inventory-list')) renderMyAuctionSafe(); 
    
    if(typeof renderEquipUI === 'function' && document.getElementById('equip-total-power')) renderEquipUI();
    updateCurrentTitle();

    const roundInfoEl = document.getElementById('toto-round-info');
    if (roundInfoEl) roundInfoEl.innerText = `제 ${currentRound}라운드`;
    if(typeof renderTotoMatches === 'function') renderTotoMatches();
    if(typeof renderPreviousRoundSummary === 'function') renderPreviousRoundSummary();
    if(typeof renderTotoBettingHistory === 'function') renderTotoBettingHistory();
    if(typeof startRoundTimer === 'function') startRoundTimer();
    if(typeof initSlotMachine === 'function') initSlotMachine(); 

    showAlert('데이터가 초기화되었습니다. (장비 및 슬롯머신 포함 전체 초기화 완료)');
    setTimeout(() => { location.reload(); }, 1500); 
}

function exportSaveData() {
    try {
        saveData(); 
        if(typeof saveBusinessData === 'function') saveBusinessData(); 
        if(typeof saveAuctionData === 'function') saveAuctionData(); 

        const saved = localStorage.getItem('highroller_save_v2');
        const bizSaved = localStorage.getItem('highroller_businesses');
        const bizTick = localStorage.getItem('highroller_biz_tick');
        const aucSold = localStorage.getItem('highroller_auction_sold');
        const aucMy = localStorage.getItem('highroller_my_auction');     
        const rankerData = localStorage.getItem('highroller_rankers');

        if (!saved) { showAlert("저장된 데이터가 없습니다."); return; }
        
        const data = JSON.parse(saved);
        data.myBusinesses_export = bizSaved ? JSON.parse(bizSaved) : {};
        data.bizTick_export = bizTick || Date.now();
        data.auctionSold_export = aucSold ? JSON.parse(aucSold) : [];
        data.auctionMy_export = aucMy ? JSON.parse(aucMy) : [];
        data.rankers_export = rankerData ? JSON.parse(rankerData) : []; 

        const timestamp = new Date().toISOString().slice(0,10).replace(/-/g,'');
        const filename = `highroller_save_${timestamp}.json`;
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a'); a.href = url; a.download = filename;
        document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
        
        showAlert(`✅ 데이터 내보내기 완료!\n파일명: ${filename}\n\n이 파일을 카톡/텔레그램으로 다른 기기에 보내세요.`);
    } catch (e) { showAlert("내보내기 중 오류가 발생했습니다."); }
}

function importSaveData(event) {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const importedData = JSON.parse(e.target.result);
            if (importedData.bankAsset === undefined && importedData.gameChips === undefined) {
                showAlert("올바른 세이브 파일이 아닙니다.\n(highroller_save_ 파일을 선택해주세요)"); return;
            }
            if (!confirm('정말 이 데이터로 덮어쓰시겠습니까?\n현재 진행 상황이 모두 사라집니다.')) { event.target.value = ''; return; }
            
            if (typeof businessTickInterval !== 'undefined') clearInterval(businessTickInterval);
            if (typeof raidTickInterval !== 'undefined') clearInterval(raidTickInterval);
            if (typeof stockTimerInterval !== 'undefined') clearInterval(stockTimerInterval);
            if (typeof coinTimerInterval !== 'undefined') clearInterval(coinTimerInterval);
            if (typeof rankingSimulationInterval !== 'undefined') clearInterval(rankingSimulationInterval);

            localStorage.setItem('highroller_save_v2', JSON.stringify(importedData));
            
            if (importedData.myBusinesses_export) {
                if (typeof myBusinesses !== 'undefined') myBusinesses = importedData.myBusinesses_export;
                localStorage.setItem('highroller_businesses', JSON.stringify(importedData.myBusinesses_export));
                localStorage.setItem('highroller_biz_tick', importedData.bizTick_export || Date.now());
            }

            if (importedData.auctionSold_export) {
                if (typeof soldAuctionItems !== 'undefined') soldAuctionItems = importedData.auctionSold_export;
                localStorage.setItem('highroller_auction_sold', JSON.stringify(importedData.auctionSold_export));
            }
            if (importedData.auctionMy_export) {
                if (typeof myAuctionItems !== 'undefined') myAuctionItems = importedData.auctionMy_export;
                localStorage.setItem('highroller_my_auction', JSON.stringify(importedData.auctionMy_export));
            }
            
            if (importedData.rankers_export) {
                localStorage.setItem('highroller_rankers', JSON.stringify(importedData.rankers_export));
            }

            showAlert('✅ 데이터 불러오기 완료!\n페이지를 새로고침합니다...');
            setTimeout(() => { location.reload(); }, 1200);
        } catch (err) { showAlert("파일을 읽는 중 오류가 발생했습니다.\n올바른 JSON 파일인지 확인해주세요."); }
    };
    reader.readAsText(file);
    setTimeout(() => { event.target.value = ''; }, 100);
}

// ==================== 컬렉션 ====================
function buyItem(itemId) {
    const item = LUXURY_ITEMS.find(i => i.id === itemId);
    if (!item) return;
    if (unlockedItems.includes(itemId)) { showAlert("이미 소유하고 있는 아이템입니다."); return; }
    if (bankAsset < item.price) { showAlert(`은행 잔고가 부족합니다!\n필요: ₩${item.price.toLocaleString()}`); return; }
    if (item.price >= 50000000) { if (!confirm(`정말로 "${item.name}"을(를)\n₩${item.price.toLocaleString()}에 구매하시겠습니까?`)) return; }
    
    bankAsset -= item.price; 
    unlockedItems.push(itemId);
    updateQuestProgress('item_buy', 1);
    
    if(typeof updateLedgerDisplays === 'function') updateLedgerDisplays();
    updateCurrentTitle(); 
    saveData();
    
    if (activeTab === 'collection') renderCollection();
    showToast(`✅ ${item.name} 구매 완료!`);
    showPurchaseCompletePopup(item);
    
    const hStatus = document.getElementById("hud-status-text");
    if (hStatus) hStatus.innerText = `🛍️ [구매 완료] ${item.name}을(를) 구매했습니다!`;
    if(typeof AudioSynth !== 'undefined') AudioSynth.playCoin();
}

function showPurchaseCompletePopup(item) {
    const existing = document.querySelector('.center-purchase-popup');
    if (existing) existing.remove();
    const pop = document.createElement('div');
    pop.className = 'center-purchase-popup';
    
    const rankColors = { normal:'#94a3b8', rare:'#3b82f6', epic:'#a855f7', legend:'#fbbf24', mythic:'#ef4444' };
    const color = rankColors[item.rank] || '#10b981';
    const rankName = item.rank.toUpperCase();

    pop.innerHTML = `
        <div style="font-size:26px; font-weight:900; color:${color}; margin-bottom:6px; text-shadow:0 0 10px ${color};">🎉 ${rankName} 획득!</div>
        <div style="font-size:16px; color:#e0e7ff; margin-bottom:4px; font-weight:bold;">${item.name}</div>
        <div style="font-size:12px; color:#64748b;">메인 쇼룸을 확인해보세요</div>
    `;
    document.body.appendChild(pop);
    
    setTimeout(() => {
        if (pop && pop.parentNode) {
            pop.style.transition = 'all 0.4s cubic-bezier(0.4, 0, 1, 1)'; 
            pop.style.opacity = '0'; 
            pop.style.transform = 'translate(-50%, -45%) scale(0.9)';
            setTimeout(() => { if (pop.parentNode) pop.parentNode.removeChild(pop); }, 350);
        }
    }, 1800);
}

function getSetTagName(tag) {
    const dict = {
        starter: "초심자", gentleman: "젠틀맨", rich: "영앤리치", 
        vvip: "VVIP", billionaire: "빌리어네어", speed: "스피드광", 
        space: "우주개척자", hacker: "천재해커"
    };
    return dict[tag] || tag;
}

function getCollectionSynergyBuffs() {
    const setDict = {};
    LUXURY_ITEMS.forEach(item => {
        if(!setDict[item.setTag]) setDict[item.setTag] = { total:0, owned:0 };
        setDict[item.setTag].total++;
        if (unlockedItems.includes(item.id)) setDict[item.setTag].owned++;
    });

    const buffs = { casinoProfit: 0, totoArenaProfit: 0, marketProfit: 0, interestRate: 0 };
    const activeTags = Object.keys(setDict).filter(tag => setDict[tag].owned === setDict[tag].total);

    if (activeTags.includes('starter')) buffs.casinoProfit += 1;          
    if (activeTags.includes('rich')) buffs.casinoProfit += 2;             
    if (activeTags.includes('vvip')) { buffs.casinoProfit += 3; buffs.interestRate += 0.02; } 
    if (activeTags.includes('billionaire')) { buffs.casinoProfit += 5; buffs.interestRate += 0.05; } 
    if (activeTags.includes('speed')) buffs.totoArenaProfit += 5;         
    if (activeTags.includes('space')) buffs.marketProfit += 3;            

    return buffs;
}

function claimMilestoneReward(pct, reward) {
    if (!window.claimedMilestones) window.claimedMilestones = [];
    if (window.claimedMilestones.includes(pct)) return;
    
    window.claimedMilestones.push(pct);
    gameChips += reward;
    updateLedgerDisplays();
    showToast(`🎉 ${pct}% 달성 보상! ${reward.toLocaleString()} 칩을 받았습니다!`, "success");
    if(typeof AudioSynth !== 'undefined') AudioSynth.playWin();
    renderCollection();
    saveData();
}

function renderCollection() {
    const grid = document.getElementById('collection-grid');
    const progressEl = document.getElementById('collection-progress');
    const barEl = document.getElementById('collection-bar');
    const showroom = document.getElementById('collection-showroom');
    const milestones = document.getElementById('collection-milestones');
    const synergyList = document.getElementById('collection-synergy-list');
    
    if (!grid) return;

    const total = LUXURY_ITEMS.length; 
    const unlockedCount = unlockedItems.length;
    const percent = Math.floor((unlockedCount / total) * 100);
    
    if(progressEl) progressEl.innerText = `${unlockedCount} / ${total} (${percent}%)`; 
    if(barEl) barEl.style.width = `${percent}%`;

    if (showroom) {
        const ownedItems = LUXURY_ITEMS.filter(i => unlockedItems.includes(i.id))
                                       .sort((a,b) => b.price - a.price)
                                       .slice(0, 3);
        showroom.innerHTML = '';
        if (ownedItems.length === 0) {
            showroom.innerHTML = '<div style="grid-column:1/-1; color:#64748b; font-size:12px; padding:20px 0;">전시된 자산이 없습니다. 명품을 구매하여 펜트하우스를 꾸며보세요.</div>';
        } else {
            ownedItems.forEach((item, idx) => {
                const rankColor = item.rank==='mythic' ? '#ef4444' : item.rank==='legend' ? '#fbbf24' : item.rank==='epic' ? '#a855f7' : item.rank==='rare' ? '#3b82f6' : '#94a3b8';
                showroom.innerHTML += `
                    <div class="showroom-booth" style="padding:10px; border-radius:12px; text-align:center; border-color:${rankColor} !important;">
                        <div style="font-size:10px; color:${rankColor}; font-weight:bold; margin-bottom:4px;">TOP ${idx+1}</div>
                        <div style="font-size:13px; font-weight:900; color:#f8fafc; margin-bottom:4px; word-break:keep-all;">${item.name}</div>
                        <div style="font-size:11px; color:#fbbf24;">₩${(item.price >= 100000000 ? (item.price/100000000).toFixed(0)+'억' : item.price.toLocaleString())}</div>
                    </div>
                `;
            });
        }
    }

    if (milestones) {
        let claimed = window.claimedMilestones || [];
        const thresholds = [
            { pct: 20, reward: 50000000, label: "5천만 칩" },
            { pct: 50, reward: 500000000, label: "5억 칩" },
            { pct: 100, reward: 10000000000, label: "100억 칩 + 명예" }
        ];
        milestones.innerHTML = '';
        thresholds.forEach(t => {
            const isClaimed = claimed.includes(t.pct);
            const canClaim = percent >= t.pct && !isClaimed;
            const boxClass = canClaim ? "milestone-box-active" : "";
            const bg = isClaimed ? "#052e16" : "#0f172a";
            const border = isClaimed ? "#10b981" : "#334155";
            const icon = isClaimed ? "✅" : (canClaim ? "🎁" : "🔒");
            const textColor = canClaim ? "#fbbf24" : (isClaimed ? "#10b981" : "#64748b");
            
            milestones.innerHTML += `
                <div class="${boxClass}" style="background:${bg}; border:1px solid ${border}; border-radius:10px; padding:10px 4px; transition:all 0.2s;" ${canClaim ? `onclick="claimMilestoneReward(${t.pct}, ${t.reward})"` : ""}>
                    <div style="font-size:20px; margin-bottom:4px;">${icon}</div>
                    <div style="font-size:11px; font-weight:900; color:${textColor};">${t.pct}% 달성</div>
                    <div style="font-size:10px; color:#94a3b8; margin-top:2px; word-break:keep-all;">${t.label}</div>
                </div>
            `;
        });
    }

    if (synergyList) {
        const setDict = {};
        LUXURY_ITEMS.forEach(item => {
            if(!setDict[item.setTag]) setDict[item.setTag] = { total:0, owned:0, name: getSetTagName(item.setTag), items: [] };
            setDict[item.setTag].total++;
            setDict[item.setTag].items.push(item);
            if (unlockedItems.includes(item.id)) setDict[item.setTag].owned++;
        });

        const buffDescriptions = {
            'starter': '카지노(사다리,카드) 수익률 +1%p',
            'gentleman': '마일스톤 달성용 명예 도감',
            'rich': '카지노 수익률 +2%p',
            'vvip': '카지노 수익률 +3%p, 이자율 +0.02%p',
            'billionaire': '카지노 수익률 +5%p, 이자율 +0.05%p',
            'speed': '토토/투기장 수익률 +5%p',
            'space': '주식/코인 수익률 +3%p',
            'hacker': '마일스톤 달성용 명예 도감'
        };
        
        synergyList.innerHTML = '';
        Object.keys(setDict).forEach(tag => {
            const s = setDict[tag];
            const isComplete = s.owned === s.total;
            const color = isComplete ? '#10b981' : '#64748b';
            const desc = buffDescriptions[tag] || '';
            
            let itemsHtml = '<div style="display:flex; flex-wrap:wrap; gap:4px; margin-top:8px;">';
            s.items.forEach(item => {
                const isOwned = unlockedItems.includes(item.id);
                const badgeBg = isOwned ? '#052e16' : '#0f172a';
                const badgeColor = isOwned ? '#10b981' : '#64748b';
                const badgeBorder = isOwned ? '#10b981' : '#334155';
                itemsHtml += `<span style="font-size:10px; padding:3px 6px; border-radius:6px; background:${badgeBg}; color:${badgeColor}; border:1px solid ${badgeBorder};">${item.name}</span>`;
            });
            itemsHtml += '</div>';
            
            synergyList.innerHTML += `
            <div style="margin-bottom:8px; padding-bottom:10px; border-bottom:1px solid #1e293b;">
                <div style="display:flex; justify-content:space-between; align-items:center;">
                    <div>
                        <div style="color:${isComplete ? '#f8fafc' : '#94a3b8'}; font-weight:${isComplete ? 'bold' : 'normal'}; font-size:13px;">[${s.name}] 컬렉션</div>
                        <div style="font-size:10.5px; color:${isComplete ? '#4ade80' : '#475569'}; margin-top:3px;">효과: ${desc}</div>
                    </div>
                    <div style="text-align:right;">
                        <div style="color:${color}; font-weight:900; font-size:14px;">${s.owned} / ${s.total}</div>
                        ${isComplete ? '<div style="font-size:10px; color:#10b981; margin-top:2px;">활성화됨 ✨</div>' : ''}
                    </div>
                </div>
                ${itemsHtml}
            </div>`;
        });
    }

    const unownedToggle = document.getElementById('unowned-only-toggle');
    const showUnownedOnly = unownedToggle ? unownedToggle.checked : false;

    let filtered = LUXURY_ITEMS.filter(item => {
        const matchesSearch = !currentSearchTerm || item.name.toLowerCase().includes(currentSearchTerm.toLowerCase()) || item.desc.toLowerCase().includes(currentSearchTerm.toLowerCase());
        const matchesCategory = currentCategoryFilter === "all" || item.category === currentCategoryFilter;
        const matchesOwned = !showOwnedOnly || unlockedItems.includes(item.id);
        const matchesUnowned = !showUnownedOnly || !unlockedItems.includes(item.id);
        return matchesSearch && matchesCategory && matchesOwned && matchesUnowned;
    });

    grid.innerHTML = '';
    if (filtered.length === 0) {
        grid.innerHTML = `<div style="grid-column: 1 / -1; color:#64748b; text-align:center; padding:30px 10px; font-size:14px;">조건에 맞는 아이템이 없습니다.</div>`; return;
    }

    filtered.forEach(item => {
        const isUnlocked = unlockedItems.includes(item.id); 
        const canAfford = bankAsset >= item.price;
        const div = document.createElement('div');
        
        div.className = `collection-item rank-${item.rank}`;
        div.style.cssText = `background: ${isUnlocked ? '#052e16' : '#1e293b'}; border: 2px solid ${isUnlocked ? '#10b981' : '#334155'}; border-radius: 12px; padding: 12px; text-align: left; transition: all 0.2s; display:flex; flex-direction:column; justify-content:space-between;`;

        const rankBadgeColor = item.rank==='mythic' ? '#ef4444' : item.rank==='legend' ? '#fbbf24' : item.rank==='epic' ? '#a855f7' : item.rank==='rare' ? '#3b82f6' : '#64748b';
        const rankBadgeName = item.rank.toUpperCase();

        let innerHtml = `
            <div>
                <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:6px;">
                    <div style="font-size:9px; background:${rankBadgeColor}; color:#fff; padding:3px 6px; border-radius:4px; font-weight:bold;">${rankBadgeName}</div>
                    <div style="font-size:9px; color:#94a3b8; border:1px solid #334155; padding:2px 5px; border-radius:4px;">${getSetTagName(item.setTag)}</div>
                </div>
                <div style="font-weight:900; color:${isUnlocked ? '#10b981' : '#f8fafc'}; font-size:14px; margin-bottom:4px;">${isUnlocked ? '✓ ' : ''}${item.name}</div>
                <div style="font-size:11px; color:#64748b; margin-bottom:6px;">${item.category}</div>
                <div style="font-size:13px; color:#fbbf24; font-weight:bold;">₩${item.price.toLocaleString()}</div>
                <div style="font-size:11px; color:#94a3b8; margin-top:6px; line-height:1.3;">${item.desc}</div>
            </div>
        `;

        if (!isUnlocked) {
            const btnClass = canAfford ? 'btn-buy-item' : ''; 
            const btnStyle = canAfford ? `background: linear-gradient(135deg, #059669, #047857); color:white;` : `background: #334155; color:#64748b; cursor:not-allowed;`; 
            const btnText = canAfford ? '💰 구매하기' : '잔고 부족'; 
            const btnDisabled = canAfford ? '' : 'disabled';
            innerHtml += `<button onclick="buyItem('${item.id}'); event.stopImmediatePropagation();" class="${btnClass}" style="margin-top:10px; width:100%; padding:10px 0; border:none; border-radius:9px; font-weight:900; font-size:14px; ${btnStyle}" ${btnDisabled}>${btnText}</button>`;
        }
        
        div.innerHTML = innerHtml;
        grid.appendChild(div);
    });
}

function filterCollection() {
    const searchInput = document.getElementById('collection-search');
    const ownedToggle = document.getElementById('owned-only-toggle');
    if (searchInput) currentSearchTerm = searchInput.value.trim();
    if (ownedToggle) showOwnedOnly = ownedToggle.checked;
    renderCollection();
}

function initCategoryFilters() {
    const container = document.getElementById('category-filters');
    if (!container) return;
    const categories = ["all", "시계", "자동차", "부동산", "테크", "명품", "경험", "판타지"];
    const labels = { "all": "전체", "시계": "⌚ 시계", "자동차": "🚗 자동차", "부동산": "🏠 부동산", "테크": "📱 테크", "명품": "👜 명품", "경험": "✨ 경험", "판타지": "🐉 판타지" };
    container.innerHTML = '';
    categories.forEach(cat => {
        const btn = document.createElement('button'); btn.type = 'button'; btn.innerText = labels[cat];
        btn.style.cssText = `padding: 6px 11px; font-size:12px; font-weight:700; border-radius:9999px; border:1px solid #334155; background:#1e293b; color:#94a3b8; cursor:pointer; white-space:nowrap; flex-shrink:0;`;
        if (cat === 'all') { btn.style.background = '#d97706'; btn.style.color = '#fff'; btn.style.borderColor = '#f59e0b'; }
        btn.onclick = () => {
            currentCategoryFilter = cat;
            container.querySelectorAll('button').forEach(b => { b.style.background = '#1e293b'; b.style.color = '#94a3b8'; b.style.borderColor = '#334155'; });
            btn.style.background = '#d97706'; btn.style.color = '#fff'; btn.style.borderColor = '#f59e0b'; renderCollection();
        };
        container.appendChild(btn);
    });
}

// ==================== 퀘스트 ====================
function checkAndResetQuests() {
    const now = new Date(); const todayStr = now.toISOString().split('T')[0]; 
    if (!lastDailyReset || lastDailyReset !== todayStr) { if (now.getHours() >= 5) { resetDailyQuests(); lastDailyReset = todayStr; } }
    if (now.getDay() === 0) { if (!lastWeeklyReset || lastWeeklyReset !== todayStr) { resetWeeklyQuests(); lastWeeklyReset = todayStr; } }
}

function resetDailyQuests() {
    dailyQuestProgress = { casinoPlays: 0, arenaBets: 0, marketBuys: 0, totoBets: 0, dailyProfit: 0 };
    completedDailyQuests = []; saveData(); if (activeTab === 'quest') renderQuests();
}

function resetWeeklyQuests() {
    weeklyQuestProgress = { itemsBought: 0, bmBuys: 0, enhances: 0, weeklyProfit: 0, creampie: 0 };
    completedWeeklyQuests = []; saveData(); if (activeTab === 'quest') renderQuests();
}

function updateQuestProgress(type, value = 1) {
    checkAndResetQuests(); let changed = false;
    if (type === 'casino_play' || type === 'bj_play') { dailyQuestProgress.casinoPlays = (dailyQuestProgress.casinoPlays || 0) + value; changed = true; }
    else if (type === 'arena_bet') { dailyQuestProgress.arenaBets = (dailyQuestProgress.arenaBets || 0) + value; changed = true; }
    else if (type === 'market_buy') { dailyQuestProgress.marketBuys = (dailyQuestProgress.marketBuys || 0) + value; changed = true; }
    else if (type === 'toto_bet') { dailyQuestProgress.totoBets = (dailyQuestProgress.totoBets || 0) + value; changed = true; }
    else if (type === 'profit') { dailyQuestProgress.dailyProfit = (dailyQuestProgress.dailyProfit || 0) + value; weeklyQuestProgress.weeklyProfit = (weeklyQuestProgress.weeklyProfit || 0) + value; changed = true; }
    else if (type === 'item_buy') { weeklyQuestProgress.itemsBought = (weeklyQuestProgress.itemsBought || 0) + value; changed = true; }
    else if (type === 'bm_buy') { weeklyQuestProgress.bmBuys = (weeklyQuestProgress.bmBuys || 0) + value; changed = true; }
    else if (type === 'enhance') { weeklyQuestProgress.enhances = (weeklyQuestProgress.enhances || 0) + value; changed = true; }
    else if (type === 'creampie') { weeklyQuestProgress.creampie = (weeklyQuestProgress.creampie || 0) + value; changed = true; } 
    
    if (changed) { saveData(); if (activeTab === 'quest') renderQuests(); }
}

function claimQuestReward(questId, isDaily) {
    const quests = isDaily ? DAILY_QUESTS : WEEKLY_QUESTS; const quest = quests.find(q => q.id === questId); if (!quest) return;
    const completedList = isDaily ? completedDailyQuests : completedWeeklyQuests;
    if (completedList.includes(questId)) { showAlert("이미 보상을 수령한 퀘스트입니다."); return; }
    if (!isQuestCompleted(quest, isDaily)) { showAlert("아직 퀘스트를 완료하지 않았습니다."); return; }
    gameChips += quest.reward; completedList.push(questId);
    if(typeof AudioSynth !== 'undefined') AudioSynth.playWin();
    if(typeof updateLedgerDisplays === 'function') updateLedgerDisplays(); saveData();
    const hStatus = document.getElementById("hud-status-text");
    if (hStatus) hStatus.innerText = `🎉 [퀘스트 완료] ${quest.name} 보상 수령! +${quest.reward.toLocaleString()} 칩`;
    if (activeTab === 'quest') renderQuests();
}

function isQuestCompleted(quest, isDaily) {
    const progress = isDaily ? dailyQuestProgress : weeklyQuestProgress; const current = progress[quest.key] || 0;
    if (quest.extraKey) { const extraCurrent = progress[quest.extraKey] || 0; return current >= quest.target && extraCurrent >= quest.extraTarget; }
    return current >= quest.target;
}

function renderQuests() {
    checkAndResetQuests();
    
    // 1. 일일 퀘스트 렌더링
    const dailyContainer = document.getElementById('daily-quest-list'); 
    const dailyProgressEl = document.getElementById('daily-progress');
    
    if (dailyContainer && dailyProgressEl) {
        dailyContainer.innerHTML = ''; let completedCount = 0;
        DAILY_QUESTS.forEach(quest => {
            const isDone = completedDailyQuests.includes(quest.id); 
            const current = dailyQuestProgress[quest.key] || 0; 
            const percent = Math.min(Math.floor((current / quest.target) * 100), 100);
            if (isDone) completedCount++;
            
            // ✨ [복구됨] 퀘스트 달성 여부 체크
            const isReadyToClaim = isQuestCompleted(quest, true);

            const div = document.createElement('div'); 
            // 달성했지만 아직 안 받았을 때 테두리 글로우 효과
            div.style.cssText = `background:#020617; border:1px solid ${isDone ? '#10b981' : (isReadyToClaim ? '#fbbf24' : '#334155')}; border-radius:12px; padding:14px; transition:all 0.3s; ${isReadyToClaim ? 'box-shadow: 0 0 15px rgba(251, 191, 36, 0.15);' : ''}`;
            
            let progressHtml = '';
            if (!isDone) {
                progressHtml = `<div style="margin:8px 0 4px;"><div style="height:6px; background:#1e293b; border-radius:3px; overflow:hidden;"><div style="height:100%; width:${percent}%; background:linear-gradient(90deg, #10b981, #34d399); transition:width 0.3s;"></div></div><div style="font-size:11px; color:#94a3b8; margin-top:4px; display:flex; justify-content:space-between;"><span>${current.toLocaleString()} / ${quest.target.toLocaleString()}</span><span>${percent}%</span></div></div>`;
            }
            
            // ✨ [복구됨] 상태에 따른 버튼 조건부 렌더링
            let btnHtml = '';
            if (isDone) {
                btnHtml = `<div style="margin-top:8px; font-size:12px; color:#10b981; font-weight:bold;">✅ 완료</div>`;
            } else if (isReadyToClaim) {
                btnHtml = `<button onclick="claimQuestReward('${quest.id}', true)" style="margin-top:8px; padding:6px 14px; background:linear-gradient(135deg, #10b981, #059669); color:white; border:none; border-radius:8px; font-size:12px; font-weight:900; cursor:pointer; box-shadow: 0 0 10px rgba(16,185,129,0.4); animation: pulseGreen 1s infinite alternate;">🎁 보상 받기</button>`;
            } else {
                btnHtml = `<button disabled style="margin-top:8px; padding:6px 14px; background:#1e293b; color:#64748b; border:1px solid #334155; border-radius:8px; font-size:12px; font-weight:bold; cursor:not-allowed;">진행 중</button>`;
            }

            div.innerHTML = `<div style="display:flex; justify-content:space-between; align-items:flex-start;"><div style="flex:1;"><div style="font-weight:900; color:#f8fafc; font-size:14px;">${quest.name}</div><div style="font-size:12px; color:#94a3b8; margin-top:2px;">${quest.desc}</div>${progressHtml}</div><div style="text-align:right; margin-left:12px;"><div style="font-size:13px; font-weight:900; color:#fbbf24;">+${quest.reward.toLocaleString()} 칩</div>${btnHtml}</div></div>`;
            dailyContainer.appendChild(div);
        });
        dailyProgressEl.innerText = `${completedCount}/5 완료`;
    }

    // 2. 주간 퀘스트 렌더링
    const weeklyContainer = document.getElementById('weekly-quest-list'); 
    const weeklyProgressEl = document.getElementById('weekly-progress');
    
    if (weeklyContainer && weeklyProgressEl) {
        weeklyContainer.innerHTML = ''; let completedCount = 0;
        WEEKLY_QUESTS.forEach(quest => {
            const isDone = completedWeeklyQuests.includes(quest.id); 
            const current = weeklyQuestProgress[quest.key] || 0;
            let percent = Math.min(Math.floor((current / quest.target) * 100), 100);
            
            if (quest.extraKey) { 
                const extra = weeklyQuestProgress[quest.extraKey] || 0; 
                const extraPercent = Math.min(Math.floor((extra / quest.extraTarget) * 100), 100); 
                percent = Math.floor((percent + extraPercent) / 2); 
            }
            if (isDone) completedCount++;
            
            // ✨ [복구됨] 퀘스트 달성 여부 체크
            const isReadyToClaim = isQuestCompleted(quest, false);

            const div = document.createElement('div'); 
            // 달성했지만 아직 안 받았을 때 테두리 글로우 효과
            div.style.cssText = `background:#020617; border:1px solid ${isDone ? '#10b981' : (isReadyToClaim ? '#fbbf24' : '#334155')}; border-radius:12px; padding:14px; transition:all 0.3s; ${isReadyToClaim ? 'box-shadow: 0 0 15px rgba(251, 191, 36, 0.15);' : ''}`;
            
            let progressHtml = '';
            if (!isDone) {
                let progressText = `${current.toLocaleString()} / ${quest.target.toLocaleString()}`;
                if (quest.extraKey) { 
                    const extra = weeklyQuestProgress[quest.extraKey] || 0; 
                    progressText += ` | 적중 ${extra} / ${quest.extraTarget}`; 
                }
                progressHtml = `<div style="margin:8px 0 4px;"><div style="height:6px; background:#1e293b; border-radius:3px; overflow:hidden;"><div style="height:100%; width:${percent}%; background:linear-gradient(90deg, #fbbf24, #f59e0b); transition:width 0.3s;"></div></div><div style="font-size:11px; color:#94a3b8; margin-top:4px;">${progressText} (${percent}%)</div></div>`;
            }

            // ✨ [복구됨] 상태에 따른 버튼 조건부 렌더링
            let btnHtml = '';
            if (isDone) {
                btnHtml = `<div style="margin-top:8px; font-size:12px; color:#10b981; font-weight:bold;">✅ 완료</div>`;
            } else if (isReadyToClaim) {
                btnHtml = `<button onclick="claimQuestReward('${quest.id}', false)" style="margin-top:8px; padding:6px 14px; background:linear-gradient(135deg, #d97706, #b45309); color:white; border:none; border-radius:8px; font-size:12px; font-weight:900; cursor:pointer; box-shadow: 0 0 10px rgba(217,119,6,0.5); animation: pulseGold 1s infinite alternate;">🎁 보상 받기</button>`;
            } else {
                btnHtml = `<button disabled style="margin-top:8px; padding:6px 14px; background:#1e293b; color:#64748b; border:1px solid #334155; border-radius:8px; font-size:12px; font-weight:bold; cursor:not-allowed;">진행 중</button>`;
            }

            div.innerHTML = `<div style="display:flex; justify-content:space-between; align-items:flex-start;"><div style="flex:1;"><div style="font-weight:900; color:#f8fafc; font-size:14px;">${quest.name}</div><div style="font-size:12px; color:#94a3b8; margin-top:2px;">${quest.desc}</div>${progressHtml}</div><div style="text-align:right; margin-left:12px;"><div style="font-size:13px; font-weight:900; color:#fbbf24;">+${quest.reward.toLocaleString()} 칩</div>${btnHtml}</div></div>`;
            weeklyContainer.appendChild(div);
        });
        weeklyProgressEl.innerText = `${completedCount}/4 완료`;
    }
}

// ==================== 통계 및 칭호 V2 ====================

function drawAssetChart() {
    const canvas = document.getElementById('asset-chart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width, h = canvas.height;
    ctx.clearRect(0, 0, w, h);
    if (assetHistory.length < 2) return;
    
    const max = Math.max(...assetHistory);
    const min = Math.min(...assetHistory);
    const range = max - min || 1;
    
    ctx.beginPath();
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 2.5;
    ctx.shadowColor = 'rgba(16, 185, 129, 0.5)';
    ctx.shadowBlur = 6;
    
    assetHistory.forEach((val, i) => {
        const x = (i / (assetHistory.length - 1)) * w;
        const y = h - ((val - min) / range) * (h - 20) - 10;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
    });
    ctx.stroke();
    
    ctx.lineTo(w, h);
    ctx.lineTo(0, h);
    ctx.closePath();
    ctx.shadowBlur = 0;
    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, 'rgba(16, 185, 129, 0.2)');
    grad.addColorStop(1, 'rgba(16, 185, 129, 0)');
    ctx.fillStyle = grad;
    ctx.fill();
}

function drawRadarChart() {
    const canvas = document.getElementById('radar-chart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width, h = canvas.height;
    const cx = w / 2, cy = h / 2, r = 55;
    ctx.clearRect(0, 0, w, h);
    
    const s = gameStats;
    const casino = (s.ladder.plays || 0) + (s.blackjack.plays || 0) + ((s.roulette && s.roulette.plays) || 0) + ((s.slot && s.slot.plays) || 0);
    const trading = (s.stock.buys || 0) + (s.stock.sells || 0) + (s.coin.buys || 0) + (s.coin.sells || 0);
    const sports = (s.toto.plays || 0);
    const combat = ((s.arena && s.arena.plays) || 0);
    const dark = ((s.system && s.system.brokerFees) || 0) / 1000000 + ((s.system && s.system.equipEnhances) || 0); 
    
    const maxVal = Math.max(casino, trading, sports, combat, dark, 1);
    const data = [casino/maxVal, trading/maxVal, sports/maxVal, combat/maxVal, dark/maxVal];
    
    const labels = ["카지노", "트레이딩", "스포츠", "투기장", "어둠의루트"];
    let maxIdx = data.indexOf(Math.max(...data));
    let title = "", desc = "";
    
    if (maxVal < 5) { 
        title = "초보 도박꾼"; desc = "아직 분석할 데이터가 부족합니다."; 
    } else if (maxIdx === 0) { 
        title = "카지노의 망령"; desc = "사다리, 카드, 슬롯에 영혼을 판 진정한 도박사."; 
    } else if (maxIdx === 1) { 
        title = "냉철한 트레이더"; desc = "차트와 호가창을 지배하는 월가의 늑대."; 
    } else if (maxIdx === 2) { 
        title = "토토 분석가"; desc = "스포츠의 흐름을 꿰뚫어보는 매의 눈."; 
    } else if (maxIdx === 3) { 
        title = "피에 굶주린 투사"; desc = "투기장의 피비린내를 즐기는 야수."; 
    } else { 
        title = "뒷골목의 큰손"; desc = "암시장과 강화 시스템을 통제하는 흑막."; 
    }
    
    document.getElementById('player-archetype-title').innerText = `[${title}]`;
    document.getElementById('player-archetype-desc').innerText = desc;
    
    ctx.strokeStyle = '#334155'; ctx.lineWidth = 1;
    for(let j=1; j<=4; j++) {
        ctx.beginPath();
        for(let i=0; i<5; i++) {
            let a = Math.PI*2 * (i/5) - Math.PI/2;
            let currentR = r * (j/4);
            let x = cx + Math.cos(a)*currentR, y = cy + Math.sin(a)*currentR;
            if(i===0) ctx.moveTo(x,y); else ctx.lineTo(x,y);
        }
        ctx.closePath(); ctx.stroke();
    }
    
    ctx.fillStyle = '#94a3b8'; ctx.font = '10px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    for(let i=0; i<5; i++) {
        let a = Math.PI*2 * (i/5) - Math.PI/2;
        ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + Math.cos(a)*r, cy + Math.sin(a)*r); ctx.stroke();
        let lx = cx + Math.cos(a)*(r+12), ly = cy + Math.sin(a)*(r+12);
        ctx.fillText(labels[i], lx, ly);
    }
    
    ctx.fillStyle = 'rgba(251, 191, 36, 0.35)'; ctx.strokeStyle = '#fbbf24'; ctx.lineWidth = 2;
    ctx.beginPath();
    for(let i=0; i<5; i++) {
        let a = Math.PI*2 * (i/5) - Math.PI/2;
        let val = Math.max(0.1, data[i]) * r;
        let x = cx + Math.cos(a)*val, y = cy + Math.sin(a)*val;
        if(i===0) ctx.moveTo(x,y); else ctx.lineTo(x,y);
    }
    ctx.closePath(); ctx.fill(); ctx.stroke();
}

function renderStats() {
    drawAssetChart();
    drawRadarChart();
    
    if (!gameStats.slot) gameStats.slot = { plays: 0, profit: 0, loss: 0, maxSingleWin: 0, maxSingleLoss: 0, jackpots: 0 };
    if (!gameStats.business) gameStats.business = { collections: 0, profit: 0, bailouts: 0 };
    if (!gameStats.events) gameStats.events = { occurrences: 0, profit: 0, loss: 0, interest: 0 };
    
    const totalAsset = getTotalAsset(); const net = gameStats.totalProfit - gameStats.totalLoss;
    const setText = (id, text) => { const el = document.getElementById(id); if (el) el.innerText = text; };

    setText('stats-total-asset', totalAsset.toLocaleString() + " 원");
    setText('stats-total-profit', gameStats.totalProfit.toLocaleString() + " 원");
    setText('stats-total-loss', gameStats.totalLoss.toLocaleString() + " 원");
    setText('stats-net-profit', net.toLocaleString() + " 원");
    setText('stats-total-games', gameStats.totalGames + " 회");

    let overallMaxWin = Math.max(
        gameStats.ladder.maxSingleWin||0, gameStats.blackjack.maxSingleWin||0,
        (gameStats.roulette&&gameStats.roulette.maxSingleWin)||0, 
        (gameStats.slot&&gameStats.slot.maxSingleWin)||0, 
        gameStats.toto.maxSingleWin||0, (gameStats.arena&&gameStats.arena.maxSingleWin)||0
    );
    let overallMaxLoss = Math.max(
        gameStats.ladder.maxSingleLoss||0, gameStats.blackjack.maxSingleLoss||0,
        (gameStats.roulette&&gameStats.roulette.maxSingleLoss)||0, 
        (gameStats.slot&&gameStats.slot.maxSingleLoss)||0, 
        gameStats.toto.maxSingleLoss||0, (gameStats.arena&&gameStats.arena.maxSingleLoss)||0
    );
    
    const games = [
        {name: "사다리", net: (gameStats.ladder.profit||0) - (gameStats.ladder.loss||0)},
        {name: "블랙잭", net: (gameStats.blackjack.profit||0) - (gameStats.blackjack.loss||0)},
        {name: "룰렛", net: ((gameStats.roulette&&gameStats.roulette.profit)||0) - ((gameStats.roulette&&gameStats.roulette.loss)||0)},
        {name: "슬롯", net: ((gameStats.slot&&gameStats.slot.profit)||0) - ((gameStats.slot&&gameStats.slot.loss)||0)},
        {name: "주식", net: (gameStats.stock.realizedProfit||0)},
        {name: "코인", net: (gameStats.coin.realizedProfit||0)},
        {name: "토토", net: (gameStats.toto.profit||0) - (gameStats.toto.loss||0)},
        {name: "투기장", net: ((gameStats.arena&&gameStats.arena.profit)||0) - ((gameStats.arena&&gameStats.arena.loss)||0)}
    ];
    let best = games.reduce((max, g) => g.net > max.net ? g : max, games[0]);
    let bestGameName = best.net > 0 ? `${best.name} (+${best.net.toLocaleString()})` : "없음";

    setText('stat-max-win', `+${overallMaxWin.toLocaleString()} 원`);
    setText('stat-max-loss', `-${overallMaxLoss.toLocaleString()} 원`);
    setText('stat-best-game', bestGameName);

    let sys = gameStats.system || { policeFines: 0, brokerFees: 0, pawnshopLosses: 0, equipEnhances: 0, equipDestroys: 0 };
    setText('stat-police-fine', `-${(sys.policeFines||0).toLocaleString()} 원`);
    setText('stat-broker-fee', `-${(sys.brokerFees||0).toLocaleString()} 원`);
    let totalFee = (gameStats.stock.feePaid||0) + (gameStats.coin.feePaid||0);
    setText('stat-market-fee', `-${totalFee.toLocaleString()} 원`);
    setText('stat-pawn-loss', `-${(sys.pawnshopLosses||0).toLocaleString()} 원`);

    const ladderEl = document.getElementById('stats-ladder');
    if (ladderEl) {
        const l = gameStats.ladder; const rate = l.plays > 0 ? ((l.hits / l.plays) * 100).toFixed(1) : 0; const netProfit = (l.profit || 0) - (l.loss || 0); const color = netProfit >= 0 ? '#10b981' : '#ef4444';
        ladderEl.innerHTML = `<div style="display:flex; justify-content:space-between; margin-bottom:6px;"><div>총 플레이 <b style="color:#fbbf24;">${l.plays}</b>회</div><div>적중률 <b style="color:#fbbf24;">${rate}%</b></div></div><div style="margin-bottom:6px;">순수익 <b style="color:${color}; font-size:15px;">${netProfit.toLocaleString()} 원</b></div><div style="font-size:12px; color:#94a3b8;">최대 연승 <b style="color:#f8fafc;">${l.maxWinStreak || 0}</b>회 &nbsp;|&nbsp; 최고 배당 <b style="color:#f8fafc;">${(l.maxOddsHit || 1).toFixed(2)}</b>배</div>`;
    }

    const bjEl = document.getElementById('stats-blackjack');
    if (bjEl) {
        const b = gameStats.blackjack; const rate = b.plays > 0 ? ((b.wins / b.plays) * 100).toFixed(1) : 0; const netProfit = (b.profit || 0) - (b.loss || 0); const color = netProfit >= 0 ? '#10b981' : '#ef4444';
        bjEl.innerHTML = `<div style="display:flex; justify-content:space-between; margin-bottom:6px;"><div>총 플레이 <b style="color:#fbbf24;">${b.plays}</b>회</div><div>승률 <b style="color:#fbbf24;">${rate}%</b></div></div><div style="margin-bottom:6px;">순수익 <b style="color:${color}; font-size:15px;">${netProfit.toLocaleString()} 원</b></div><div style="font-size:12px; color:#94a3b8;">블랙잭 <b style="color:#f8fafc;">${b.blackjacks || 0}</b>회 &nbsp;|&nbsp; 버스트 <b style="color:#f8fafc;">${b.busts || 0}</b>회</div>`;
    }
    
    const rlEl = document.getElementById('stats-roulette');
    if (rlEl) {
        const r = gameStats.roulette || {plays:0, profit:0, loss:0}; const netProfit = (r.profit || 0) - (r.loss || 0); const color = netProfit >= 0 ? '#10b981' : '#ef4444';
        rlEl.innerHTML = `<div style="display:flex; justify-content:space-between; margin-bottom:6px;"><div>총 플레이 <b style="color:#fbbf24;">${r.plays}</b>회</div></div><div style="margin-bottom:6px;">순수익 <b style="color:${color}; font-size:15px;">${netProfit.toLocaleString()} 원</b></div>`;
    }

    const slotEl = document.getElementById('stats-slot');
    if (slotEl) {
        const sl = gameStats.slot || {plays:0, profit:0, loss:0, jackpots:0}; 
        const netProfit = (sl.profit || 0) - (sl.loss || 0); 
        const color = netProfit >= 0 ? '#10b981' : '#ef4444';
        slotEl.innerHTML = `<div style="display:flex; justify-content:space-between; margin-bottom:6px;"><div>총 스핀 <b style="color:#fbbf24;">${sl.plays}</b>회</div><div>잭팟 당첨 <b style="color:#fbbf24;">${sl.jackpots||0}</b>회</div></div><div style="margin-bottom:6px;">순수익 <b style="color:${color}; font-size:15px;">${netProfit.toLocaleString()} 원</b></div>`;
    }

    const stockEl = document.getElementById('stats-stock');
    if (stockEl) {
        const s = gameStats.stock; const realized = s.realizedProfit || 0; const color = realized >= 0 ? '#10b981' : '#ef4444'; const portfolioValue = typeof calculatePortfolioValue === 'function' ? calculatePortfolioValue() : 0;
        stockEl.innerHTML = `<div style="display:flex; justify-content:space-between; margin-bottom:6px;"><div>매수 <b style="color:#fbbf24;">${s.buys || 0}</b>회</div><div>매도 <b style="color:#fbbf24;">${s.sells || 0}</b>회</div></div><div style="margin-bottom:6px;">실현 손익 <b style="color:${color}; font-size:15px;">${realized.toLocaleString()} 원</b></div><div style="font-size:12px; color:#94a3b8;">현재 포트폴리오 평가액 <b style="color:#f8fafc;">${portfolioValue.toLocaleString()} 원</b><br>최고 평가액 <b style="color:#f8fafc;">${(s.maxPortfolioValue || 0).toLocaleString()} 원</b></div>`;
    }

    const coinStatsEl = document.getElementById('stats-coin');
    if (coinStatsEl) {
        const c = gameStats.coin || { buys: 0, sells: 0, realizedProfit: 0 }; const realized = c.realizedProfit || 0; const color = realized >= 0 ? '#10b981' : '#ef4444'; const currentValue = typeof calculateCoinPortfolioValue === 'function' ? calculateCoinPortfolioValue() : 0;
        if (!c.maxPortfolioValue || currentValue > c.maxPortfolioValue) c.maxPortfolioValue = currentValue;
        coinStatsEl.innerHTML = `<div style="display:flex; justify-content:space-between; margin-bottom:6px;"><div>매수 <b style="color:#fbbf24;">${c.buys || 0}</b>회</div><div>매도 <b style="color:#fbbf24;">${c.sells || 0}</b>회</div></div><div style="margin-bottom:6px;">실현 손익 <b style="color:${color}; font-size:15px;">${realized.toLocaleString()} 원</b></div><div style="font-size:12px; color:#94a3b8;">현재 포트폴리오 평가액 <b style="color:#f8fafc;">${currentValue.toLocaleString()} 원</b><br>최고 평가액 <b style="color:#f8fafc;">${(c.maxPortfolioValue || 0).toLocaleString()} 원</b></div>`;
    }
    
    const totoEl = document.getElementById('stats-toto');
    if (totoEl) {
        const t = gameStats.toto; const rate = t.plays > 0 ? ((t.hits / t.plays) * 100).toFixed(1) : 0; const netProfit = (t.profit || 0) - (t.loss || 0); const color = netProfit >= 0 ? '#10b981' : '#ef4444';
        totoEl.innerHTML = `<div style="display:flex; justify-content:space-between; margin-bottom:6px;"><div>총 플레이 <b style="color:#fbbf24;">${t.plays}</b>회</div><div>적중률 <b style="color:#fbbf24;">${rate}%</b></div></div><div style="margin-bottom:6px;">순수익 <b style="color:${color}; font-size:15px;">${netProfit.toLocaleString()} 원</b></div><div style="font-size:12px; color:#94a3b8;">최고 배당 <b style="color:#f8fafc;">${(t.maxOddsHit || 1).toFixed(2)}</b>배 &nbsp;|&nbsp; 최대 연속 적중 <b style="color:#f8fafc;">${t.maxHitStreak || 0}</b>회</div>`;
    }
    
    const arenaEl = document.getElementById('stats-arena');
    if (arenaEl) {
        const a = gameStats.arena || {plays:0, wins:0, profit:0, loss:0}; const netProfit = (a.profit || 0) - (a.loss || 0); const color = netProfit >= 0 ? '#10b981' : '#ef4444';
        arenaEl.innerHTML = `<div style="display:flex; justify-content:space-between; margin-bottom:6px;"><div>총 배팅 <b style="color:#fbbf24;">${a.plays}</b>회</div><div>적중 <b style="color:#fbbf24;">${a.wins}</b>회</div></div><div style="margin-bottom:6px;">순수익 <b style="color:${color}; font-size:15px;">${netProfit.toLocaleString()} 원</b></div>`;
    }

    const bizEl = document.getElementById('stats-business');
    if (bizEl) {
        const bz = gameStats.business || { collections: 0, profit: 0, bailouts: 0 };
        const netProfit = bz.profit || 0;
        const color = netProfit >= 0 ? '#10b981' : '#ef4444';
        bizEl.innerHTML = `<div style="display:flex; justify-content:space-between; margin-bottom:6px;"><div>총 수금 <b style="color:#fbbf24;">${bz.collections}</b>회</div><div>보석금 납부 <b style="color:#ef4444;">${bz.bailouts}</b>회</div></div><div style="margin-bottom:6px;">순수익 <b style="color:${color}; font-size:15px;">${netProfit.toLocaleString()} 원</b></div>`;
    }

    const eventEl = document.getElementById('stats-events');
    if (eventEl) {
        const ev = gameStats.events || { occurrences: 0, profit: 0, loss: 0, interest: 0 };
        const netProfit = (ev.profit || 0) + (ev.interest || 0) - (ev.loss || 0);
        const color = netProfit >= 0 ? '#10b981' : '#ef4444';
        eventEl.innerHTML = `<div style="display:flex; justify-content:space-between; margin-bottom:6px;"><div>이벤트 발생 <b style="color:#fbbf24;">${ev.occurrences}</b>회</div><div>누적 예금 이자 <b style="color:#34d399;">+${(ev.interest||0).toLocaleString()}</b> 원</div></div><div style="margin-bottom:6px;">순수익 <b style="color:${color}; font-size:15px;">${netProfit.toLocaleString()} 원</b></div>`;
    }
    
    const sysEl = document.getElementById('stats-system');
    if (sysEl) {
        sysEl.innerHTML = `<div style="display:flex; justify-content:space-between; margin-bottom:6px;"><div>장비 강화 <b style="color:#fbbf24;">${sys.equipEnhances||0}</b>회 시도</div></div><div style="margin-bottom:6px; color:#94a3b8; font-size:12px;">파괴 횟수 <b style="color:#ef4444;">${sys.equipDestroys||0}</b>회</div>`;
    }
}

function resetStatsOnly() {
    if(!confirm("정말 통계 데이터만 초기화하시겠습니까?\n\n(자산, 아이템, 퀘스트, 칭호는 그대로 유지되며 오직 순수 통계 기록만 0으로 돌아갑니다.)")) return;
    
    gameStats = {
        totalProfit: 0, totalLoss: 0, totalGames: 0,
        ladder: { plays: 0, hits: 0, profit: 0, loss: 0, maxWinStreak: 0, currentWinStreak: 0, maxOddsHit: 1.0, maxSingleWin: 0, maxSingleLoss: 0 },
        blackjack: { plays: 0, wins: 0, profit: 0, loss: 0, busts: 0, blackjacks: 0, maxSingleWin: 0, maxSingleLoss: 0 },
        roulette: { plays: 0, profit: 0, loss: 0, maxSingleWin: 0, maxSingleLoss: 0 },
        slot: { plays: 0, profit: 0, loss: 0, maxSingleWin: 0, maxSingleLoss: 0, jackpots: 0 }, 
        stock: { buys: 0, sells: 0, realizedProfit: 0, maxPortfolioValue: 0, feePaid: 0 },
        coin: { buys: 0, sells: 0, realizedProfit: 0, maxPortfolioValue: 0, feePaid: 0 },
        toto: { plays: 0, hits: 0, profit: 0, loss: 0, maxOddsHit: 1.0, currentHitStreak: 0, maxHitStreak: 0, maxSingleWin: 0, maxSingleLoss: 0 },
        arena: { plays: 0, wins: 0, profit: 0, loss: 0, maxSingleWin: 0, maxSingleLoss: 0 },
        business: { collections: 0, profit: 0, bailouts: 0 },
        events: { occurrences: 0, profit: 0, loss: 0, interest: 0 },
        system: { policeFines: 0, brokerFees: 0, pawnshopLosses: 0, equipEnhances: 0, equipDestroys: 0 }
    };
    assetHistory = [getTotalAsset()];
    saveData();
    renderStats();
    showToast("통계가 성공적으로 초기화되었습니다.", "success");
}

function getCurrentGameTitle(gameType) {
    const titles = GAME_TITLES[gameType]; if (!titles) return { level: 1, name: "초보", icon: "⚪", desc: "기본" };
    let currentLevel = 1; const stats = gameStats[gameType] || {};
    
    let customCurPlays = stats.plays || 0;
    let customCurTrades = (stats.buys || 0) + (stats.sells || 0);
    
    if (gameType === 'equip') {
        customCurPlays = gameStats.system?.equipEnhances || 0;
    } else if (gameType === 'blackmarket') {
        customCurPlays = Object.values(inventory).reduce((a, b) => a + b, 0); 
    } else if (gameType === 'auction') {
        customCurPlays = stats.wins || 0; 
    } else if (gameType === 'business') {
        customCurPlays = stats.collections || 0; 
    }

    for (let i = titles.length - 1; i >= 0; i--) {
        const t = titles[i]; let qualified = true;
        
        if (t.plays && customCurPlays < t.plays) qualified = false;
        if (t.trades && customCurTrades < t.trades) qualified = false;
        if (t.enhance && (gameStats.system?.equipEnhances || 0) < t.enhance) qualified = false;
        if (t.destroy && (gameStats.system?.equipDestroys || 0) < t.destroy) qualified = false;
        if (t.reqMaxLevel) {
            const hasMaxLevel = Object.values(equipment).some(e => e.level >= 25);
            if (!hasMaxLevel) qualified = false;
        }
        if (t.bmBuys && customCurPlays < t.bmBuys) qualified = false;
        if (t.aucWins && customCurPlays < t.aucWins) qualified = false;
        if (t.bizCols && customCurPlays < t.bizCols) qualified = false;
        
        if (t.winRate) { const rate = (stats.plays || 0) > 0 ? ((stats.hits || stats.wins || 0) / stats.plays * 100) : 0; if (rate < t.winRate) qualified = false; }
        if (t.hitRate) { const rate = (stats.plays || 0) > 0 ? ((stats.hits || 0) / stats.plays * 100) : 0; if (rate < t.hitRate) qualified = false; }
        if (t.streak) { if ((stats.maxHitStreak || 0) < t.streak) qualified = false; }
        if (t.wins) { if ((stats.wins || 0) < t.wins) qualified = false; }
        if (t.maxBid) { if ((stats.maxPrice || 0) < t.maxBid) qualified = false; } 
        
        if (t.profit) {
            let profitVal = 0;
            if (['ladder', 'blackjack', 'arena', 'slot', 'business'].includes(gameType)) profitVal = stats.profit || 0;
            else if (['stock', 'coin'].includes(gameType)) profitVal = stats.realizedProfit || 0;
            if (profitVal < t.profit) qualified = false;
        }
        if (t.payout) { if ((stats.profit || 0) < t.payout) qualified = false; }
        if (t.maxPortfolio) { const maxPort = stats.maxPortfolioValue || 0; if (maxPort < t.maxPortfolio) qualified = false; }
        if (t.avgRate && gameType === 'stock') { const totalBuy = stats.totalBuyValue || 0; const rate = totalBuy > 0 ? ((stats.realizedProfit || 0) / totalBuy * 100) : 0; if (rate < t.avgRate) qualified = false; }
        
        if (t.jackpots && (stats.jackpots || 0) < t.jackpots) qualified = false;
        
        if (qualified) { currentLevel = t.level; break; }
    }
    return titles.find(t => t.level === currentLevel) || titles[0];
}

function getTitleProgress(gameType) {
    const titles = GAME_TITLES[gameType]; const current = getCurrentGameTitle(gameType); const next = titles.find(t => t.level === current.level + 1);
    if (!next) return { current, next: null, progress: 100, detail: "🏆 최고 레벨 달성! 전설의 하이롤러!" };
    
    const stats = gameStats[gameType] || {}; let progress = 0; let detail = "";
    
    let customCurPlays = stats.plays || 0;
    if (gameType === 'equip') customCurPlays = gameStats.system?.equipEnhances || 0;
    if (gameType === 'blackmarket') customCurPlays = Object.values(inventory).reduce((a, b) => a + b, 0);
    if (gameType === 'auction') customCurPlays = stats.wins || 0;
    if (gameType === 'business') customCurPlays = stats.collections || 0;

    if (next.plays) { progress = Math.min(Math.floor(customCurPlays / next.plays * 100), 100); detail = `진행 ${customCurPlays.toLocaleString()} / ${next.plays.toLocaleString()}회`; } 
    else if (next.trades) { const cur = (stats.buys || 0) + (stats.sells || 0); progress = Math.min(Math.floor(cur / next.trades * 100), 100); detail = `매매 ${cur} / ${next.trades}회`; }
    else if (next.enhance) { progress = Math.min(Math.floor(customCurPlays / next.enhance * 100), 100); detail = `강화 시도 ${customCurPlays.toLocaleString()} / ${next.enhance.toLocaleString()}회`; }
    else if (next.bmBuys) { progress = Math.min(Math.floor(customCurPlays / next.bmBuys * 100), 100); detail = `조작템 구매 ${customCurPlays.toLocaleString()} / ${next.bmBuys.toLocaleString()}개`; }
    else if (next.aucWins) { progress = Math.min(Math.floor(customCurPlays / next.aucWins * 100), 100); detail = `경매 낙찰 ${customCurPlays.toLocaleString()} / ${next.aucWins.toLocaleString()}회`; }
    else if (next.bizCols) { progress = Math.min(Math.floor(customCurPlays / next.bizCols * 100), 100); detail = `사업 수금 ${customCurPlays.toLocaleString()} / ${next.bizCols.toLocaleString()}회`; }
    
    if (next.winRate || next.hitRate) { const rate = (stats.plays || 0) > 0 ? Math.floor(((stats.hits || stats.wins || 0) / stats.plays * 100) * 10) / 10 : 0; const target = next.winRate || next.hitRate; detail += ` | ${rate}% / ${target}%`; }
    return { current, next, progress, detail };
}

function renderTitleTab() {
    const games = ['ladder', 'blackjack', 'toto', 'stock', 'coin', 'arena', 'equip', 'blackmarket', 'slot', 'auction', 'business'];
    games.forEach(game => {
        const contentEl = document.getElementById(`title-${game}-content`); if (!contentEl) return;
        const progressInfo = getTitleProgress(game); const cur = progressInfo.current; const next = progressInfo.next;
        let html = `<div style="display:flex; align-items:center; gap:12px; margin-bottom:8px;"><div style="font-size:28px;">${cur.icon}</div><div style="flex:1;"><div style="font-weight:900; font-size:16px; color:#f8fafc;">${cur.name} <span style="font-size:12px; color:#64748b;">Lv.${cur.level}</span></div><div style="font-size:12px; color:#94a3b8;">${cur.desc}</div></div></div>`;
        if (next) {
            html += `<div style="margin:8px 0 4px;"><div style="height:8px; background:#1e293b; border-radius:4px; overflow:hidden;"><div style="height:100%; width:${progressInfo.progress}%; background:linear-gradient(90deg, #fbbf24, #f59e0b); transition:width 0.4s;"></div></div><div style="font-size:11px; color:#94a3b8; margin-top:4px; display:flex; justify-content:space-between;"><span>다음: ${next.name}</span><span>${progressInfo.progress}%</span></div></div><div style="font-size:12px; color:#64748b; margin-top:4px;">${progressInfo.detail || next.desc}</div>`;
        } else {
            html += `<div style="margin-top:8px; padding:8px; background:#052e16; border-radius:8px; text-align:center;"><span style="color:#10b981; font-weight:bold;">🏆 최고 레벨 달성 완료!</span></div>`;
        }
        contentEl.innerHTML = html;
    });
}

function getCurrentTitle() {
    const total = getTotalAsset(); const collection = unlockedItems.length;
    if (total >= 10000000000000 && collection >= 64) return "🌌 신화적 하이롤러 (최고 등급)";
    if (total >= 1000000000000) return "🪐 조만장자 클럽";
    if (total >= 500000000000 && collection >= 50) return "🌍 월드클래스 부호";
    if (total >= 50000000000) return "🏆 전설의 하이롤러";
    if (collection >= 45) return "💎 컬렉션의 신";
    if (total >= 10000000000) return "👑 진짜 재벌";
    if (collection >= 30) return "👜 명품 수집가";
    if (total >= 2000000000) return "💰 자산 20억 클럽";
    if (collection >= 15) return "⌚ 시계 수집가";
    if (total >= 500000000) return "🚗 차 좀 타는 사람";
    if (collection >= 5) return "🌟 수집가 입문";
    return "🐜 열심히 사는 개미";
}

function updateCurrentTitle() {
    const titleEl = document.getElementById('current-title'); if (titleEl) titleEl.innerText = getCurrentTitle();
    const topTitle = document.getElementById('top-title'); const topBar = document.getElementById('top-asset-bar');
    if (topTitle) {
        const currentTitle = getCurrentTitle(); topTitle.innerText = currentTitle;
        if (topBar) { if (currentTitle.includes('재벌') || currentTitle.includes('조만장자') || currentTitle.includes('신화적')) { topBar.classList.add('rebal-mode'); } else { topBar.classList.remove('rebal-mode'); } }
    }
}

// ==================== 초기화 ====================
window.onload = function() {
    if (!document.getElementById('tab-alert-style')) {
        const style = document.createElement('style');
        style.id = 'tab-alert-style';
        style.innerHTML = `
            @keyframes tabGlowRed {
                from { box-shadow: 0 0 5px rgba(220, 38, 38, 0.4); border-color: #991b1b; }
                to { box-shadow: 0 0 18px rgba(239, 68, 68, 0.9); border-color: #ef4444; }
            }
            @keyframes tabGlowBlue {
                from { box-shadow: 0 0 5px rgba(37, 99, 235, 0.4); border-color: #1e3a8a; }
                to { box-shadow: 0 0 18px rgba(59, 130, 246, 0.9); border-color: #3b82f6; }
            }
            /* ✨ [신규 추가] 탭 네온 펄스 애니메이션 */
            @keyframes pulseGold { from { box-shadow: 0 0 5px rgba(251,191,36,0.3); } to { box-shadow: 0 0 15px rgba(251,191,36,0.9); border-color: #fbbf24; } }
            @keyframes pulseGreen { from { box-shadow: 0 0 5px rgba(16,185,129,0.3); } to { box-shadow: 0 0 15px rgba(16,185,129,0.9); border-color: #10b981; } }
            @keyframes pulsePurple { from { box-shadow: 0 0 5px rgba(192,38,211,0.3); } to { box-shadow: 0 0 15px rgba(192,38,211,0.9); border-color: #c026d3; } }
            
            .tab-alert-red { animation: tabGlowRed 0.7s infinite alternate !important; color: #fca5a5 !important; }
            .tab-alert-blue { animation: tabGlowBlue 0.7s infinite alternate !important; color: #93c5fd !important; }
            .tab-pulse-gold { animation: pulseGold 0.8s infinite alternate !important; color: #fef08a !important; }
            .tab-pulse-green { animation: pulseGreen 0.8s infinite alternate !important; color: #6ee7b7 !important; }
            .tab-pulse-purple { animation: pulsePurple 0.8s infinite alternate !important; color: #f0abfc !important; }
        `;
        document.head.appendChild(style);
    }

    loadData();
    
    if (typeof GAME_TITLES !== 'undefined' && !GAME_TITLES.slot) {
        GAME_TITLES.slot = [
            { level: 1, name: "초보", icon: "⚪", desc: "기본" },
            { level: 2, name: "견습생", icon: "🌱", desc: "스핀 50회", plays: 50 },
            { level: 3, name: "장인", icon: "🎰", desc: "스핀 300회", plays: 300, profit: 1000000000 },
            { level: 4, name: "헌터", icon: "🏹", desc: "스핀 1000회", plays: 1000, profit: 5000000000 },
            { level: 5, name: "망령", icon: "👻", desc: "스핀 3000회 + 수익 300억", plays: 3000, profit: 30000000000 },
            { level: 6, name: "브레이커", icon: "⚡", desc: "스핀 5000회", plays: 5000, jackpots: 5 }
        ];
    }
    if (!gameStats.slot) gameStats.slot = { plays: 0, profit: 0, loss: 0, maxSingleWin: 0, maxSingleLoss: 0, jackpots: 0 };

    if(typeof initPriceHistory === 'function') initPriceHistory();
    if(typeof ensureCoinDataLoaded === 'function') ensureCoinDataLoaded();
    if(typeof initProfitStatusSnapshot === 'function') initProfitStatusSnapshot();
    
    if (!newsLog) newsLog = [];
    if (!activeNewsEffects) activeNewsEffects = [];
    
    checkAndResetQuests();
    if(typeof updateLedgerDisplays === 'function') updateLedgerDisplays(); 
    if(typeof startInterestTimer === 'function') startInterestTimer();
    updateCurrentTitle();
    initCategoryFilters();
    if(typeof compileNextLadderStructure === 'function') compileNextLadderStructure(); 
    if(typeof paintCanvasFrame === 'function') paintCanvasFrame(); 
    if(typeof initializeTimerSequence === 'function') initializeTimerSequence();
    
    if(typeof initChipButtons === 'function') initChipButtons();

    if(typeof generateRandomMatches === 'function') generateRandomMatches();
    if(typeof renderTotoMatches === 'function') renderTotoMatches();
    
    if(typeof startStockPriceFluctuation === 'function') startStockPriceFluctuation();
    if(typeof startCoinPriceFluctuation === 'function') startCoinPriceFluctuation();   
    
    setInterval(() => {
        if(typeof assetHistory !== 'undefined') {
            assetHistory.push(getTotalAsset());
            if (assetHistory.length > 50) assetHistory.shift();
            if (activeTab === 'stats') drawAssetChart();
        }
    }, 60000);
    
    setTimeout(() => { const turnEl = document.getElementById('stock-turn-display'); if (turnEl) turnEl.innerText = currentStockTurn; }, 500);
    setTimeout(() => { const select = document.getElementById('stock-select'); if (select && typeof updateMarketDisplay === 'function') updateMarketDisplay(); }, 100);
    setTimeout(() => { const hStatus = document.getElementById("hud-status-text"); if (hStatus && activeTab === "ladder") hStatus.innerText = "🪜 환영합니다! 사다리, 블랙잭, 슬롯머신을 자유롭게 이용하세요."; }, 2500);

    let needInit = false;
    if (typeof leagueStandings === 'undefined' || leagueStandings === null || typeof leagueStandings !== 'object' || Object.keys(leagueStandings).length < 10) needInit = true;
    if (needInit && typeof initLeagueStandings === 'function') initLeagueStandings();
    
    if (!currentRoundMatches || !Array.isArray(currentRoundMatches) || currentRoundMatches.length === 0) {
        if(typeof generateRoundMatches === 'function') currentRoundMatches = generateRoundMatches(currentRound);
    }
    if (typeof currentRound !== 'number' || currentRound < 1) currentRound = 1;
    
    if(typeof startRoundTimer === 'function') startRoundTimer();
    
    setTimeout(() => {
        if (typeof currentTotoMatch !== 'undefined' && currentTotoMatch && selectedTotoBetType) {
            const panel = document.getElementById('toto-betting-panel');
            if (panel) {
                panel.style.display = 'block';
                const sm = document.getElementById('toto-selected-match');
                if(sm) sm.innerHTML = `${currentTotoMatch.home} <span style="color:#64748b; font-weight:400;">vs</span> ${currentTotoMatch.away}`;
                panel.querySelectorAll('.btn-opt').forEach(btn => { if (btn.onclick && btn.onclick.toString().includes(selectedTotoBetType)) btn.classList.add('active'); });
                if (typeof roundTimeLeft !== 'undefined' && roundTimeLeft <= 240) { panel.style.opacity = '0.5'; panel.style.pointerEvents = 'none'; }
            }
        }
    }, 800);

    // ✨ 신규: 블랙클럽 초기화 및 백그라운드 시뮬레이션 가동
    if (typeof initRankingSystem === 'function') initRankingSystem();
    if (typeof initMessengerData === 'function') initMessengerData();

    // ✨ 신규: 통합 탭 알림 시스템 가동
    setInterval(checkTabNotifications, 1000);

    console.log('%c[럭셔리 하이롤러] 통합 시스템 정상 부팅 완료', 'color:#10b981');
};

// ✨ [신규 추가] 탭 알림 시스템 로직
window.lastPlayerRank = null;

function checkTabNotifications() {
    if (!document.getElementById('tab-alert-style')) return;

    // 1. 토토 (배팅 가능 시간)
    const totoTab = document.getElementById('tab-toto');
    if (totoTab) {
        if (typeof roundPhase !== 'undefined' && roundPhase === 'betting' && activeTab !== 'toto') totoTab.classList.add('tab-alert-blue');
        else totoTab.classList.remove('tab-alert-blue');
    }

    // 2. 암시장 (물품 갱신)
    const bmTab = document.getElementById('tab-blackmarket');
    if (bmTab) {
        if (typeof bmLastRefresh !== 'undefined') {
            const remain = 1800000 - (Date.now() - bmLastRefresh);
            if (remain <= 0 && activeTab !== 'blackmarket') bmTab.classList.add('tab-alert-red');
            else bmTab.classList.remove('tab-alert-red');
        }
    }

    // 3. 지하사업 (한 곳이라도 금고 100% 찼을 때)
    const bizTab = document.getElementById('tab-business');
    if (bizTab) {
        let isFull = false;
        if (typeof myBusinesses !== 'undefined' && typeof UNDERGROUND_BUSINESSES !== 'undefined') {
            Object.keys(myBusinesses).forEach(bizId => {
                const myData = myBusinesses[bizId];
                const biz = UNDERGROUND_BUSINESSES.find(b => b.id === bizId);
                if (biz && myData && (!myData.suspendedUntil || myData.suspendedUntil < Date.now())) {
                    const currentCps = Math.floor(biz.baseCps * (1 + 0.1 * myData.skillLevel));
                    const maxVault = Math.floor(currentCps * (biz.baseCapacityTime * (1 + 0.5 * myData.lobbyLevel)));
                    if (myData.vault >= maxVault) isFull = true;
                }
            });
        }
        if (isFull && activeTab !== 'business') bizTab.classList.add('tab-pulse-green');
        else bizTab.classList.remove('tab-pulse-green');
    }

    // 4. 퀘스트 (보상 수령 가능)
    const questTab = document.getElementById('tab-quest');
    if (questTab) {
        let hasClaimable = false;
        if (typeof DAILY_QUESTS !== 'undefined') {
            DAILY_QUESTS.forEach(q => { if(typeof isQuestCompleted === 'function' && isQuestCompleted(q, true) && !completedDailyQuests.includes(q.id)) hasClaimable = true; });
            WEEKLY_QUESTS.forEach(q => { if(typeof isQuestCompleted === 'function' && isQuestCompleted(q, false) && !completedWeeklyQuests.includes(q.id)) hasClaimable = true; });
        }
        if (hasClaimable && activeTab !== 'quest') questTab.classList.add('tab-pulse-gold');
        else questTab.classList.remove('tab-pulse-gold');
    }

    // 5. 내 정보 (잔여 SP 존재)
    const profileTab = document.getElementById('tab-profile');
    if (profileTab) {
        if (typeof playerSP !== 'undefined' && playerSP > 0 && activeTab !== 'profile') profileTab.classList.add('tab-pulse-purple');
        else profileTab.classList.remove('tab-pulse-purple');
    }

    // 6. 랭킹 (내 순위 변동 시)
    const rankTab = document.getElementById('tab-blackclub');
    if (rankTab && typeof getCombinedRanking === 'function') {
        const combined = getCombinedRanking();
        const currentRank = combined.findIndex(r => r.isPlayer) + 1;
        
        if (window.lastPlayerRank === null) window.lastPlayerRank = currentRank;
        
        if (currentRank !== window.lastPlayerRank && activeTab !== 'blackclub') {
            rankTab.classList.add('tab-pulse-gold');
        } else if (activeTab === 'blackclub') {
            window.lastPlayerRank = currentRank;
            rankTab.classList.remove('tab-pulse-gold');
        }
    }
}