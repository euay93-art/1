// ============================================================
// js/ranking.js
// 블랙 클럽(VVIP 랭킹) 시뮬레이션 시스템 (오류 수정 및 안정화판)
// ============================================================

let rankingSimulationInterval = null;

// 시스템 초기화 (세이브 데이터 로드 및 적용)
function initRankingSystem() {
    if (typeof BLACK_CLUB_MEMBERS === 'undefined') {
        console.error("BLACK_CLUB_MEMBERS 데이터를 불러올 수 없습니다. data.js를 확인하세요.");
        return;
    }

    // 🌟 랭커들의 시작 원금 기준이 상실되지 않도록 보존하는 코드 추가
    BLACK_CLUB_MEMBERS.forEach(ranker => {
        if (!ranker.originNetWorth) {
            ranker.originNetWorth = ranker.netWorth; 
        }
    });

    const savedRankers = localStorage.getItem('highroller_rankers');
    if (savedRankers) {
        try {
            const parsed = JSON.parse(savedRankers);
            BLACK_CLUB_MEMBERS.forEach(ranker => {
                const saved = parsed.find(r => r.id === ranker.id);
                if (saved) {
                    ranker.netWorth = saved.netWorth;
                    ranker.status = saved.status;
                    ranker.isUnlocked = saved.isUnlocked;
                    ranker.affinity = saved.affinity;
                }
            });
        } catch (e) {
            console.error("랭킹 데이터 로드 실패", e);
        }
    }
    checkRankerUnlocks();
    startRankingSimulation();
}

// 조건에 따른 랭커 해금 체크 (순위 기반 영구 해금 시스템)
function checkRankerUnlocks() {
    const combinedRanking = getCombinedRanking();
    const playerIndex = combinedRanking.findIndex(r => r.isPlayer);
    
    let unlockedAny = false;

    combinedRanking.forEach((ranker, index) => {
        if (ranker.isPlayer) return;

        const originalRanker = BLACK_CLUB_MEMBERS.find(r => r.id === ranker.id);
        
        if (originalRanker && !originalRanker.isUnlocked) {
            if (index >= playerIndex - 3) {
                originalRanker.isUnlocked = true;
                unlockedAny = true;
                if (typeof showToast === 'function') {
                    showToast(`[블랙 클럽] 새로운 VVIP '${originalRanker.name}'의 정보를 알아냈습니다.`, 'success');
                }
            }
        }
    });

    if (unlockedAny) saveRankingData();
}

// 랭커들의 스탯 기반 자산 시뮬레이션 (15초마다 실행)
function startRankingSimulation() {
    if (rankingSimulationInterval) clearInterval(rankingSimulationInterval);
    
    rankingSimulationInterval = setInterval(() => {
        BLACK_CLUB_MEMBERS.forEach(ranker => {
            let changePercent = 0;

            const gambleRoll = Math.random() * 100;
            if (gambleRoll < ranker.stats.gambling) {
                const win = Math.random() < 0.50; // 🌟 50% 반반 확률 적용 완료
                const fluctuation = (Math.random() * 0.15) + 0.05; 
                changePercent += win ? fluctuation : -fluctuation;
            }

            const investRoll = Math.random() * 100;
            if (investRoll < ranker.stats.investment) {
                const win = Math.random() < 0.55; 
                const fluctuation = (Math.random() * 0.10) + 0.02; 
                changePercent += win ? fluctuation : -fluctuation;
            }

            const analysisRoll = Math.random() * 100;
            if (analysisRoll < ranker.stats.analysis) {
                changePercent += (Math.random() * 0.05);
            }

            changePercent += (ranker.stats.business / 100) * 0.02;

            const flexRoll = Math.random() * 100;
            if (flexRoll < ranker.stats.flex) {
                changePercent -= (Math.random() * 0.04) + 0.01;
            }

            ranker.netWorth = Math.floor(ranker.netWorth * (1 + changePercent));
            // 자산이 50억(5,000,000,000) 이하로 떨어지지 않도록 고정 및 파산 방지
            if (ranker.netWorth < 5000000000) {
                ranker.netWorth = 5000000000;
            }
        });

        checkRankerUnlocks();
        saveRankingData();
        
        if (typeof activeTab !== 'undefined' && activeTab === 'blackclub') {
            if (typeof renderBlackClubRanking === 'function') renderBlackClubRanking();
        }
    }, 15000); 
}

function getCombinedRanking() {
    const playerNetWorth = typeof getTotalAsset === 'function' ? getTotalAsset() : 0;
    
    const playerObj = {
        id: "player",
        name: "임동혁",
        title: "언더독", 
        netWorth: playerNetWorth,
        isPlayer: true
    };

    const combined = [...BLACK_CLUB_MEMBERS, playerObj];
    combined.sort((a, b) => b.netWorth - a.netWorth);
    
    return combined;
}

function saveRankingData() {
    const exportData = BLACK_CLUB_MEMBERS.map(r => ({
        id: r.id,
        netWorth: r.netWorth,
        status: r.status,
        isUnlocked: r.isUnlocked,
        affinity: r.affinity
    }));
    localStorage.setItem('highroller_rankers', JSON.stringify(exportData));
}

// 🌟 오타 및 오류가 완벽히 수정된 랭커 데이터 전용 초기화 함수
function resetRankersOnly() {
    if (!confirm("모든 랭커의 보유 금액과 데이터를 처음 상태로 초기화하시겠습니까?\n\n(파산한 랭커들도 원금으로 복구됩니다.)")) {
        return;
    }

    // 1. 브라우저 로컬스토리지 저장 데이터 삭제
    localStorage.removeItem('highroller_rankers');

    // 2. [오류 수정됨] 현재 게임 메모리(RAM)에서 돌아가는 랭커 데이터 원금 복구
    if (typeof BLACK_CLUB_MEMBERS !== 'undefined' && Array.isArray(BLACK_CLUB_MEMBERS)) {
        BLACK_CLUB_MEMBERS.forEach(ranker => {
            const originalValues = {
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

            if (originalValues[ranker.id] !== undefined) {
                ranker.netWorth = originalValues[ranker.id];
            }
            ranker.status = "active"; 
        });
    }

    // 3. 변경된 초기 데이터를 즉시 다시 저장하여 구버전 찌꺼기 덮어쓰기
    if (typeof saveRankingData === 'function') {
        saveRankingData();
    }

    alert("랭커 데이터가 성공적으로 초기화되었습니다.");
    location.reload(); 
}