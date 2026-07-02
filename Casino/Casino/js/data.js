// ============================================================
// js/data.js
// 상수 및 기본 데이터 구조 (칭호 인플레이션 & 20인 랭커 로스터 적용)
// ============================================================

const LUXURY_ITEMS = [
    // --- ⌚ 시계 (Watch) ---
    { id: "watch_001", name: "카시오 G-Shock", price: 89000, category: "시계", rank: "normal", setTag: "starter", desc: "밑바닥 도박꾼의 튼튼한 동반자" },
    { id: "watch_002", name: "세이코 5 스포츠", price: 350000, category: "시계", rank: "normal", setTag: "starter", desc: "가성비 좋은 오토매틱 입문기" },
    { id: "watch_003", name: "티쏘 PRX", price: 850000, category: "시계", rank: "rare", setTag: "gentleman", desc: "사회 초년생의 세련된 스포츠 워치" },
    { id: "watch_004", name: "롤렉스 서브마리너", price: 25000000, category: "시계", rank: "epic", setTag: "rich", desc: "성공한 자들의 기본 소양" },
    { id: "watch_005", name: "오메가 스피드마스터", price: 12000000, category: "시계", rank: "epic", setTag: "space", desc: "인류와 함께 달에 다녀온 시계" },
    { id: "watch_006", name: "파텍 필립 노틸러스", price: 250000000, category: "시계", rank: "legend", setTag: "vvip", desc: "돈이 있어도 구할 수 없는 하이엔드" },
    { id: "watch_007", name: "오데마 피게 로열 오크", price: 180000000, category: "시계", rank: "legend", setTag: "vvip", desc: "8각 베젤이 뿜어내는 압도적 존재감" },
    { id: "watch_008", name: "리차드 밀 RM 11-03", price: 1200000000, category: "시계", rank: "mythic", setTag: "billionaire", desc: "손목 위의 하이퍼카, 억만장자의 상징" },

    // --- 🚗 자동차 (Car) ---
    { id: "car_001", name: "중고 아반떼 MD", price: 6500000, category: "자동차", rank: "normal", setTag: "starter", desc: "에어컨은 잘 나오는 훌륭한 뚜벅이 탈출기" },
    { id: "car_002", name: "기아 K8 하이브리드", price: 48000000, category: "자동차", rank: "rare", setTag: "gentleman", desc: "조용하고 편안한 국산 프리미엄 세단" },
    { id: "car_003", name: "BMW 520i M Spt", price: 75000000, category: "자동차", rank: "rare", setTag: "gentleman", desc: "카푸어와 성공의 아슬아슬한 경계선" },
    { id: "car_004", name: "벤츠 S-Class", price: 150000000, category: "자동차", rank: "epic", setTag: "rich", desc: "성공한 사장님들의 교복" },
    { id: "car_005", name: "포르쉐 911 터보 S", price: 320000000, category: "자동차", rank: "legend", setTag: "speed", desc: "외계인을 고문해서 만든 데일리카" },
    { id: "car_006", name: "페라리 SF90", price: 850000000, category: "자동차", rank: "legend", setTag: "speed", desc: "이탈리아 마라넬로의 붉은 종마" },
    { id: "car_007", name: "람보르기니 레부엘토", price: 950000000, category: "자동차", rank: "legend", setTag: "speed", desc: "V12 자연흡기의 미친 황소" },
    { id: "car_008", name: "부가티 투르비용", price: 6500000000, category: "자동차", rank: "mythic", setTag: "billionaire", desc: "도로 위의 예술품, 예술 그 자체" },

    // --- 🏠 부동산 (Real Estate) ---
    { id: "real_001", name: "장유 30평 아파트", price: 450000000, category: "부동산", rank: "normal", setTag: "starter", desc: "도박꾼의 첫 안식처, 내 집 마련의 꿈" },
    { id: "real_002", name: "해운대 오션뷰 오피스텔", price: 850000000, category: "부동산", rank: "rare", setTag: "gentleman", desc: "아침마다 바다를 보며 커피를 마시는 삶" },
    { id: "real_003", name: "마포 한강뷰 아파트", price: 2500000000, category: "부동산", rank: "epic", setTag: "rich", desc: "인서울 입성의 상징" },
    { id: "real_004", name: "제주 프라이빗 풀빌라", price: 4200000000, category: "부동산", rank: "epic", setTag: "rich", desc: "아무도 방해할 수 없는 나만의 요새" },
    { id: "real_005", name: "한남동 단독주택", price: 15000000000, category: "부동산", rank: "legend", setTag: "vvip", desc: "재계 총수들이 모여 사는 그곳" },
    { id: "real_006", name: "시그니엘 서울 펜트하우스", price: 35000000000, category: "부동산", rank: "legend", setTag: "vvip", desc: "구름 위에서 서울을 내려다보는 삶" },
    { id: "real_007", name: "뉴욕 맨해튼 펜트하우스", price: 85000000000, category: "부동산", rank: "mythic", setTag: "billionaire", desc: "세계의 중심에서 세상을 내려다보는 방" },
    { id: "real_008", name: "모나코 프라이빗 저택", price: 150000000000, category: "부동산", rank: "mythic", setTag: "billionaire", desc: "세금 없는 부자들의 궁극적인 낙원" },

    // --- 📱 테크 (Tech) ---
    { id: "tech_001", name: "아이폰 16 Pro Max", price: 2500000, category: "테크", rank: "normal", setTag: "starter", desc: "사과 농장의 가장 강력한 수확물" },
    { id: "tech_002", name: "맥북 프로 M4 Max 풀옵션", price: 10500000, category: "테크", rank: "rare", setTag: "gentleman", desc: "카페 출입을 위한 최고의 통행증" },
    { id: "tech_003", name: "라이카 M11 카메라 세트", price: 25000000, category: "테크", rank: "epic", setTag: "rich", desc: "사진이 아니라 감성을 찍는 도구" },
    { id: "tech_004", name: "개인용 서버 룸 구축", price: 150000000, category: "테크", rank: "epic", setTag: "hacker", desc: "방구석 해커의 로망 완성" },
    { id: "tech_005", name: "NVIDIA H200 AI 슈퍼컴퓨터", price: 650000000, category: "테크", rank: "legend", setTag: "hacker", desc: "전 세계가 줄 서서 기다리는 연산 괴물" },
    { id: "tech_006", name: "Boston Dynamics 로봇견", price: 120000000, category: "테크", rank: "legend", setTag: "hacker", desc: "산책시킬 때 이목을 집중시키는 철댕이" },
    { id: "tech_007", name: "SpaceX 스타십 VIP 티켓", price: 5000000000, category: "테크", rank: "mythic", setTag: "space", desc: "화성 갈 끄니까~ 1등석 예약" },
    { id: "tech_008", name: "비밀 지하 AI 연구소", price: 35000000000, category: "테크", rank: "mythic", setTag: "billionaire", desc: "A.I로 세상을 지배하기 위한 전초기지" },

    // --- 👜 명품 (Luxury) ---
    { id: "luxury_001", name: "디올 새들백", price: 4500000, category: "명품", rank: "normal", setTag: "gentleman", desc: "스테디셀러의 정석" },
    { id: "luxury_002", name: "샤넬 클래식 미디엄", price: 15000000, category: "명품", rank: "rare", setTag: "rich", desc: "오늘이 가장 싸다는 그 가방" },
    { id: "luxury_003", name: "에르메스 버킨 30", price: 55000000, category: "명품", rank: "epic", setTag: "vvip", desc: "돈이 있어도 실적이 없으면 못 사는 가방" },
    { id: "luxury_004", name: "에르메스 히말라야 켈리", price: 250000000, category: "명품", rank: "legend", setTag: "vvip", desc: "가방계의 전설, 백색의 악어 가죽" },
    { id: "luxury_005", name: "까르띠에 다이아몬드 팬더", price: 180000000, category: "명품", rank: "legend", setTag: "vvip", desc: "표범의 우아함을 담은 하이 주얼리" },
    { id: "luxury_006", name: "그라프 핑크 다이아몬드 링", price: 1500000000, category: "명품", rank: "mythic", setTag: "billionaire", desc: "손가락 위에 올려진 15억짜리 아파트" },
    { id: "luxury_007", name: "크리스티 경매 피카소 진품", price: 45000000000, category: "명품", rank: "mythic", setTag: "billionaire", desc: "거실 벽을 장식할 인류의 문화유산" },
    { id: "luxury_008", name: "프랑스 왕실 왕관", price: 120000000000, category: "명품", rank: "mythic", setTag: "billionaire", desc: "루브르 박물관에서 훔쳐... 아니 사온 보물" },

    // --- ✨ 경험 (Experience) ---
    { id: "exp_001", name: "미슐랭 3스타 레스토랑 대관", price: 15000000, category: "경험", rank: "normal", setTag: "rich", desc: "단 하루, 나만을 위한 최고급 만찬" },
    { id: "exp_002", name: "두바이 버즈 알 아랍 스위트룸 7박", price: 85000000, category: "경험", rank: "rare", setTag: "rich", desc: "7성급 호텔에서 누리는 황제의 휴식" },
    { id: "exp_003", name: "프라이빗 요트 지중해 투어", price: 350000000, category: "경험", rank: "epic", setTag: "vvip", desc: "선상 파티와 샴페인, 그리고 지중해의 노을" },
    { id: "exp_004", name: "F1 모나코 그랑프리 패독 클럽", price: 500000000, category: "경험", rank: "epic", setTag: "speed", desc: "전 세계 갑부들과 샴페인을 터뜨리며 관람" },
    { id: "exp_005", name: "걸그룹 프라이빗 콘서트 초청", price: 1200000000, category: "경험", rank: "legend", setTag: "vvip", desc: "내 펜트하우스에서 열리는 나만의 콘서트" },
    { id: "exp_006", name: "에베레스트 정복 잠수정 투어", price: 8500000000, category: "경험", rank: "legend", setTag: "billionaire", desc: "지구의 가장 깊은 곳과 높은 곳을 하루만에" },
    { id: "exp_007", name: "국제우주정거장(ISS) 1주일 숙박", price: 65000000000, category: "경험", rank: "mythic", setTag: "space", desc: "무중력 상태에서 마시는 마티니 한 잔" },
    { id: "exp_008", name: "무인도 독립 국가 건국", price: 500000000000, category: "경험", rank: "mythic", setTag: "billionaire", desc: "내 섬, 내 법, 내가 곧 국가다" },

    // --- 🐉 판타지 (Fantasy) ---
    { id: "fantasy_001", name: "블랙카드 무제한 발급권", price: 5000000000, category: "판타지", rank: "epic", setTag: "vvip", desc: "한도 없는 카드, 긁는 즉시 은행장이 인사함" },
    { id: "fantasy_002", name: "라스베가스 카지노 지분 1%", price: 15000000000, category: "판타지", rank: "legend", setTag: "billionaire", desc: "매일 앉아서 칩이 복사되는 마법" },
    { id: "fantasy_003", name: "미국 국방부 (펜타곤) 기밀 패스", price: 80000000000, category: "판타지", rank: "legend", setTag: "hacker", desc: "UFO의 진실을 내 눈으로 확인하다" },
    { id: "fantasy_004", name: "타임머신 탑승권 (과거)", price: 250000000000, category: "판타지", rank: "mythic", setTag: "space", desc: "비트코인 100원일 때로 돌아가는 편도 티켓" },
    { id: "fantasy_005", name: "영생의 엘릭서", price: 777000000000, category: "판타지", rank: "mythic", setTag: "billionaire", desc: "죽지 않고 영원히 도박을 즐길 수 있는 비약" },
    { id: "fantasy_006", name: "일루미나티 최고 위원회 의석", price: 1500000000000, category: "판타지", rank: "mythic", setTag: "billionaire", desc: "지구의 진짜 주인이 되어 세계를 조종하다" },
    { id: "fantasy_007", name: "화성 거주지 식민지 소유권", price: 5000000000000, category: "판타지", rank: "mythic", setTag: "space", desc: "지구를 떠나 새로운 행성의 주인이 되다" },
    { id: "fantasy_008", name: "럭셔리 하이롤러 카지노 인수", price: 9999000000000, category: "판타지", rank: "mythic", setTag: "billionaire", desc: "이 게임의 개발자를 해고하고 모든 것을 소유하다" }
];

const DAILY_QUESTS = [
    { id: 'd1', name: '카지노의 탕아', target: 15, key: 'casinoPlays', reward: 2000000, desc: '블랙잭 또는 룰렛 15회 플레이' },
    { id: 'd2', name: '야수의 심장', target: 3, key: 'arenaBets', reward: 3000000, desc: '불법 지하 투기장 3회 배팅' },
    { id: 'd3', name: '단타의 신', target: 10, key: 'marketBuys', reward: 2500000, desc: '주식 또는 코인 10회 매수' },
    { id: 'd4', name: '승부사', target: 5, key: 'totoBets', reward: 3000000, desc: 'EPL 토토 5경기 배팅' },
    { id: 'd5', name: '일당백', target: 20000000, key: 'dailyProfit', reward: 5000000, desc: '하루 통합 순수익 2,000만 원 달성' }
];

const WEEKLY_QUESTS = [
    { id: 'w1', name: '플렉스 해버렸지 뭐야', target: 2, key: 'itemsBought', reward: 30000000, desc: '럭셔리 컬렉션 2개 구매' },
    { id: 'w2', name: '어둠의 거래', target: 3, key: 'bmBuys', reward: 40000000, desc: '암시장에서 불법 조작 아이템 3회 구매' },
    { id: 'w3', name: '대장장이', target: 25, key: 'enhances', reward: 30000000, desc: '아바타 장비 강화 25회 시도 (티어 무관)' },
    { id: 'w4', name: '월가의 늑대', target: 300000000, key: 'weeklyProfit', reward: 50000000, desc: '주간 누적 수익 3억 원 달성' }
];

const COINS = [
    { id: "비트코인", name: "비트코인", type: "major", price: 95000000, volatility: 0.14, color: "#f7931a" },
    { id: "이더리움", name: "이더리움", type: "major", price: 3800000, volatility: 0.15, color: "#627eea" },
    { id: "도지", name: "도지코인", type: "meme", price: 420, volatility: 0.25, color: "#c3a634" },
    { id: "침착맨", name: "침착맨", type: "meme", price: 1850, volatility: 0.26, color: "#00b894" },
    { id: "임동혁", name: "임동혁", type: "meme", price: 777, volatility: 0.28, color: "#e17055" },
    { id: "섹스", name: "섹스", type: "meme", price: 69, volatility: 0.30, color: "#fd79a8" }
];

const NEWS_DATABASE = [
    { type: 'individual', stock: '삼성전자', sentiment: 'positive', strength: 1.13, text: "삼성전자, 3나노 공정 수율 대폭 개선" },
    { type: 'individual', stock: '삼성전자', sentiment: 'negative', strength: 0.89, text: "삼성전자, 미국 반도체 보조금 심사 지연" },
    { type: 'individual', stock: 'SK하이닉스', sentiment: 'positive', strength: 1.14, text: "SK하이닉스, HBM 수주 대폭 증가" },
    { type: 'individual', stock: 'SK하이닉스', sentiment: 'negative', strength: 0.88, text: "SK하이닉스, 중국 공장 가동 중단 우려" },
    { type: 'individual', stock: '엔비디아', sentiment: 'positive', strength: 1.17, text: "엔비디아, 차세대 AI 칩 'Blackwell' 대량 수주" },
    { type: 'individual', stock: '엔비디아', sentiment: 'negative', strength: 0.87, text: "엔비디아, 중국 수출 규제 강화 우려" },
    { type: 'individual', stock: '네이버', sentiment: 'positive', strength: 1.11, text: "네이버, AI 검색 'CLOVA X' 사용자 급증" },
    { type: 'individual', stock: '네이버', sentiment: 'negative', strength: 0.90, text: "네이버, 개인정보 유출 논란" },
    { type: 'individual', stock: '유튜브', sentiment: 'positive', strength: 1.09, text: "유튜브, 숏폼 광고 수익 크게 증가" },
    { type: 'individual', stock: '유튜브', sentiment: 'negative', strength: 0.88, text: "유튜브, 광고 수익 급감 우려 제기" },
    { type: 'individual', stock: '치지직', sentiment: 'positive', strength: 1.10, text: "치지직, 신규 기능 업데이트 성공" },
    { type: 'individual', stock: '치지직', sentiment: 'negative', strength: 0.87, text: "치지직, 대형 BJ 대거 이탈 소식" },
    { type: 'individual', stock: '숲', sentiment: 'positive', strength: 1.12, text: "숲, 대형 스트리머 유치 소식" },
    { type: 'individual', stock: '숲', sentiment: 'negative', strength: 0.89, text: "숲, 주요 크리에이터 이적" },
    { type: 'individual', stock: '스페이스X', sentiment: 'positive', strength: 1.15, text: "스페이스X, 스타십 5차 시험비행 성공" },
    { type: 'individual', stock: '스페이스X', sentiment: 'negative', strength: 0.86, text: "스페이스X, 발사 실패로 주가 하락" },
    { type: 'macro', sentiment: 'positive', strength: 1.09, text: "미 Fed 금리 인하 결정… 테크株 강세" },
    { type: 'macro', sentiment: 'negative', strength: 0.89, text: "글로벌 경기 침체 신호… 투자 심리 위축" }
];

const STOCK_INITIAL_PRICES = {
    "삼성전자": 70000, "SK하이닉스": 150000, "엔비디아": 120000,
    "네이버": 180000, "유튜브": 300000, "스페이스X": 500000,
    "숲": 15000, "치지직": 5000
};

const ALL_TEAMS = [
    { name: "맨체스터 시티", strength: 88, keyPlayers: ["홀란드", "드 브라위너", "로드리", "포든"] },
    { name: "아스날", strength: 85, keyPlayers: ["사카", "외데고르", "하베르츠", "라이스"] },
    { name: "리버풀", strength: 84, keyPlayers: ["살라", "반 다이크", "맥알리스터", "누녜스"] },
    { name: "맨체스터 유나이티드", strength: 76, keyPlayers: ["페르난데스", "호일룬드", "가르나초", "마인츠"] }
];

const EPL_TEAMS = [
    { id: "MCI", name: "맨체스터 시티", power: 92, homeAdv: 1.15 },
    { id: "ARS", name: "아스날", power: 88, homeAdv: 1.12 },
    { id: "LIV", name: "리버풀", power: 87, homeAdv: 1.13 },
    { id: "CHE", name: "첼시", power: 84, homeAdv: 1.10 },
    { id: "TOT", name: "토트넘", power: 82, homeAdv: 1.11 },
    { id: "MUN", name: "맨체스터 유나이티드", power: 81, homeAdv: 1.12 },
    { id: "NEW", name: "뉴캐슬", power: 79, homeAdv: 1.14 },
    { id: "BHA", name: "브라이튼", power: 76, homeAdv: 1.08 },
    { id: "AVL", name: "애스턴 빌라", power: 78, homeAdv: 1.09 },
    { id: "WHU", name: "웨스트햄", power: 74, homeAdv: 1.10 },
    { id: "CRY", name: "크리스탈 팰리스", power: 73, homeAdv: 1.07 },
    { id: "FUL", name: "풀럼", power: 72, homeAdv: 1.08 },
    { id: "BRE", name: "브렌트포드", power: 71, homeAdv: 1.09 },
    { id: "WOL", name: "울버햄튼", power: 70, homeAdv: 1.06 },
    { id: "EVE", name: "에버턴", power: 69, homeAdv: 1.05 },
    { id: "BOU", name: "본머스", power: 68, homeAdv: 1.07 }
];

const GAME_TITLES = {
    ladder: [
        { level: 1, name: "초보 사다리꾼", icon: "🟣", desc: "기본" },
        { level: 2, name: "사다리 견습생", icon: "🥋", desc: "사다리 50회 플레이", plays: 50 },
        { level: 3, name: "사다리 도전자", icon: "🔮", desc: "사다리 150회 + 승률 48%↑", plays: 150, winRate: 48 },
        { level: 4, name: "사다리 실력자", icon: "⚡", desc: "사다리 300회 + 수익 10억↑", plays: 300, profit: 1000000000 },
        { level: 5, name: "사다리의 고수", icon: "👑", desc: "사다리 500회 + 승률 50%↑", plays: 500, winRate: 50 },
        { level: 6, name: "사다리의 달인", icon: "🌟", desc: "사다리 800회 + 수익 50억↑", plays: 800, profit: 5000000000 },
        { level: 7, name: "전설의 사다리꾼", icon: "🔥", desc: "사다리 1,500회 + 승률 52%↑", plays: 1500, winRate: 52 },
        { level: 8, name: "사다리의 신", icon: "🌀", desc: "사다리 3,000회 + 승률 53% + 수익 300억↑", plays: 3000, winRate: 53, profit: 30000000000 }
    ],
    blackjack: [
        { level: 1, name: "초보 플레이어", icon: "⚪", desc: "기본" },
        { level: 2, name: "카드 견습생", icon: "♠️", desc: "블랙잭 50회 플레이", plays: 50 },
        { level: 3, name: "블랙잭 도전자", icon: "❤️", desc: "블랙잭 150회 + 승률 48%↑", plays: 150, winRate: 48 },
        { level: 4, name: "카드 실력자", icon: "♦️", desc: "블랙잭 300회 + 수익 10억↑", plays: 300, profit: 1000000000 },
        { level: 5, name: "블랙잭 고수", icon: "♣️", desc: "블랙잭 500회 + 승률 50%↑", plays: 500, winRate: 50 },
        { level: 6, name: "카드의 달인", icon: "🏆", desc: "블랙잭 800회 + 수익 100억↑", plays: 800, profit: 10000000000 },
        { level: 7, name: "하우스 브레이커", icon: "👑", desc: "블랙잭 1,500회 + 승률 52%↑", plays: 1500, winRate: 52 },
        { level: 8, name: "전설의 카드 마스터", icon: "🌟", desc: "블랙잭 3,000회 + 승률 53% + 수익 500억↑", plays: 3000, winRate: 53, profit: 50000000000 }
    ],
    toto: [
        { level: 1, name: "풋볼 초보", icon: "⚽", desc: "기본" },
        { level: 2, name: "분석 견습생", icon: "🟦", desc: "베팅 50회 진행", plays: 50 },
        { level: 3, name: "승부 예측가", icon: "🏆", desc: "베팅 150회 + 적중률 40%↑", plays: 150, hitRate: 40 },
        { level: 4, name: "승리의 예언자", icon: "🟣", desc: "베팅 300회 + 당첨금 10억↑", plays: 300, payout: 1000000000 },
        { level: 5, name: "베팅 고수", icon: "👑", desc: "베팅 500회 + 적중률 45%↑", plays: 500, hitRate: 45 },
        { level: 6, name: "베팅의 달인", icon: "🌟", desc: "베팅 800회 + 당첨금 100억↑", plays: 800, payout: 10000000000 },
        { level: 7, name: "전설의 승부사", icon: "🔥", desc: "베팅 1,500회 + 연승(Hit Streak) 5회↑", plays: 1500, streak: 5 },
        { level: 8, name: "베팅의 신", icon: "🐉", desc: "베팅 3,000회 + 당첨금 500억↑ + 연승 8회↑", plays: 3000, payout: 50000000000, streak: 8 }
    ],
    stock: [
        { level: 1, name: "일반 투자자", icon: "🟣", desc: "기본" },
        { level: 2, name: "신참 트레이더", icon: "🌱", desc: "매매 50회 진행", trades: 50 },
        { level: 3, name: "실전 투자자", icon: "📈", desc: "매매 150회 + 평균 수익률 5%↑", trades: 150, avgRate: 5 },
        { level: 4, name: "월가의 신참", icon: "💼", desc: "매매 300회 + 누적 수익 10억↑", trades: 300, profit: 1000000000 },
        { level: 5, name: "하이롤러 트레이더", icon: "🔥", desc: "매매 500회 + 평균 수익률 10%↑", trades: 500, avgRate: 10 },
        { level: 6, name: "전설의 월가 늑대", icon: "👑", desc: "매매 800회 + 누적 수익 200억↑", trades: 800, profit: 20000000000 },
        { level: 7, name: "월가의 지배자", icon: "🌐", desc: "매매 1,500회 + 평균 수익률 15%↑", trades: 1500, avgRate: 15 },
        { level: 8, name: "투자계의 신", icon: "⭐", desc: "매매 3,000회 + 평균 수익률 20% + 수익 1,000억↑", trades: 3000, avgRate: 20, profit: 100000000000 }
    ],
    coin: [
        { level: 1, name: "코린이", icon: "🪙", desc: "기본" },
        { level: 2, name: "코인 견습생", icon: "🌱", desc: "총 거래 50회", trades: 50 },
        { level: 3, name: "코인 트레이더", icon: "📈", desc: "총 거래 150회 + 실현수익 10억↑", trades: 150, profit: 1000000000 },
        { level: 4, name: "차트의 달인", icon: "🔥", desc: "총 거래 300회 + 실현수익 100억↑", trades: 300, profit: 10000000000 },
        { level: 5, name: "다이아몬드 홀더", icon: "💎", desc: "총 거래 500회 + 최대 포트폴리오 500억↑", trades: 500, maxPortfolio: 50000000000 },
        { level: 6, name: "코인 고수", icon: "👑", desc: "총 거래 800회 + 실현수익 500억↑", trades: 800, profit: 50000000000 },
        { level: 7, name: "전설의 코인러", icon: "🌟", desc: "총 거래 1,500회 + 최대 포트폴리오 1,000억↑", trades: 1500, maxPortfolio: 100000000000 },
        { level: 8, name: "코인의 신", icon: "🌀", desc: "총 거래 3,000회 + 실현수익 3,000억↑ + 최대포트 2,000억↑", trades: 3000, profit: 300000000000, maxPortfolio: 200000000000 }
    ],
    arena: [
        { level: 1, name: "관람객", icon: "🍿", desc: "기본" },
        { level: 2, name: "혈투의 팬", icon: "🩸", desc: "배팅 50회 진행", plays: 50 },
        { level: 3, name: "분석하는 구경꾼", icon: "👁️", desc: "배팅 150회 + 적중 50회", plays: 150, wins: 50 },
        { level: 4, name: "뒷골목 도박사", icon: "🥊", desc: "배팅 300회 + 수익 10억↑", plays: 300, profit: 1000000000 },
        { level: 5, name: "피의 감정사", icon: "🔪", desc: "배팅 500회 + 적중 200회", plays: 500, wins: 200 },
        { level: 6, name: "언더그라운드 킹", icon: "👑", desc: "배팅 800회 + 수익 100억↑", plays: 800, profit: 10000000000 },
        { level: 7, name: "무자비한 포식자", icon: "💀", desc: "배팅 1,500회 + 적중 600회", plays: 1500, wins: 600 },
        { level: 8, name: "지하의 지배자", icon: "👿", desc: "배팅 3,000회 + 적중 1,200회 + 수익 500억↑", plays: 3000, wins: 1200, profit: 50000000000 }
    ],
    equip: [
        { level: 1, name: "초보 대장장이", icon: "🔨", desc: "기본" },
        { level: 2, name: "도전하는 제련술사", icon: "🔧", desc: "강화 시도 50회", enhance: 50 },
        { level: 3, name: "아픔을 아는 자", icon: "💥", desc: "시도 150회 + 파괴 5회", enhance: 150, destroy: 5 },
        { level: 4, name: "강화 중독자", icon: "🔥", desc: "시도 300회 + 파괴 20회", enhance: 300, destroy: 20 },
        { level: 5, name: "기적의 대장장이", icon: "✨", desc: "시도 500회 + 파괴 50회", enhance: 500, destroy: 50 },
        { level: 6, name: "신들린 제련술사", icon: "🌟", desc: "시도 1,000회 + 파괴 100회", enhance: 1000, destroy: 100 },
        { level: 7, name: "강화의 마에스트로", icon: "🔱", desc: "시도 2,000회 + 파괴 200회", enhance: 2000, destroy: 200 },
        { level: 8, name: "전설의 연금술사", icon: "🌌", desc: "시도 3,000회 + 파괴 300회 + 장비 25성 달성", enhance: 3000, destroy: 300, reqMaxLevel: true }
    ],
    blackmarket: [
        { level: 1, name: "어리숙한 호구", icon: "🥺", desc: "기본" },
        { level: 2, name: "뒷골목 탕아", icon: "🕶️", desc: "조작 아이템 누적 구매 10개", bmBuys: 10 },
        { level: 3, name: "부패한 큰손", icon: "💰", desc: "조작 아이템 누적 구매 30개", bmBuys: 30 },
        { level: 4, name: "법망을 피하는 자", icon: "🚨", desc: "조작 아이템 누적 구매 80개", bmBuys: 80 },
        { level: 5, name: "블랙마켓 VVIP", icon: "🎩", desc: "조작 아이템 누적 구매 150개", bmBuys: 150 },
        { level: 6, name: "뒷골목의 권력자", icon: "🖤", desc: "조작 아이템 누적 구매 300개", bmBuys: 300 },
        { level: 7, name: "그림자 정부", icon: "🌑", desc: "조작 아이템 누적 구매 600개", bmBuys: 600 },
        { level: 8, name: "암흑가의 큰손", icon: "🦅", desc: "조작 아이템 누적 구매 1,000개", bmBuys: 1000 }
    ],
    auction: [
        { level: 1, name: "초보 수집가", icon: "👀", desc: "기본" },
        { level: 2, name: "경매장 샛별", icon: "🔨", desc: "경매 낙찰 5회 성공", aucWins: 5 },
        { level: 3, name: "안목 있는 자", icon: "🧐", desc: "경매 낙찰 15회 성공", aucWins: 15 },
        { level: 4, name: "진품 감정사", icon: "💎", desc: "경매 낙찰 30회 성공 + 최고 응찰가 50억↑", aucWins: 30, maxBid: 5000000000 },
        { level: 5, name: "VIP 입찰자", icon: "🎟️", desc: "경매 낙찰 50회 성공 + 최고 응찰가 200억↑", aucWins: 50, maxBid: 20000000000 },
        { level: 6, name: "소더비의 황제", icon: "👑", desc: "경매 낙찰 80회 성공 + 최고 응찰가 500억↑", aucWins: 80, maxBid: 50000000000 },
        { level: 7, name: "전설적인 콜렉터", icon: "🏛️", desc: "경매 낙찰 150회 성공 + 최고 응찰가 1,000억↑", aucWins: 150, maxBid: 100000000000 },
        { level: 8, name: "박물관의 주인", icon: "🌌", desc: "경매 낙찰 300회 성공 + 최고 응찰가 5,000억↑", aucWins: 300, maxBid: 500000000000 }
    ],
    business: [
        { level: 1, name: "동네 양아치", icon: "⚾", desc: "기본" },
        { level: 2, name: "구역장", icon: "🔑", desc: "누적 수금 50회", bizCols: 50 },
        { level: 3, name: "행동대장", icon: "🔪", desc: "누적 수금 150회 + 순수익 10억↑", bizCols: 150, profit: 1000000000 },
        { level: 4, name: "지하의 사업가", icon: "💼", desc: "누적 수금 300회 + 순수익 50억↑", bizCols: 300, profit: 5000000000 },
        { level: 5, name: "어둠의 보스", icon: "🕶️", desc: "누적 수금 500회 + 순수익 200억↑", bizCols: 500, profit: 20000000000 },
        { level: 6, name: "신디케이트 보스", icon: "👑", desc: "누적 수금 800회 + 순수익 500억↑", bizCols: 800, profit: 50000000000 },
        { level: 7, name: "범죄의 제왕", icon: "💀", desc: "누적 수금 1,500회 + 순수익 1,500억↑", bizCols: 1500, profit: 150000000000 },
        { level: 8, name: "언더그라운드 킹", icon: "🌑", desc: "누적 수금 3,000회 + 순수익 5,000억↑", bizCols: 3000, profit: 500000000000 }
    ]
};

const TIER_DATA = {
    1:  { name: "도박꾼의",   color: "#94a3b8", multiplier: 1.00, label: "기본" },
    2:  { name: "승부사의",   color: "#4ade80", multiplier: 1.18, label: "승부사" },
    3:  { name: "허슬러의",   color: "#3b82f6", multiplier: 1.38, label: "허슬러" },
    4:  { name: "타짜의",     color: "#a855f7", multiplier: 1.65, label: "타짜" },
    5:  { name: "마스터의",   color: "#ec4899", multiplier: 2.00, label: "마스터" },
    6:  { name: "거물의",     color: "#fbbf24", multiplier: 2.45, label: "거물" },
    7:  { name: "랭커의",     color: "#f97316", multiplier: 3.00, label: "랭커" },
    8:  { name: "VIP의",      color: "#ef4444", multiplier: 3.70, label: "VIP" },
    9:  { name: "챔피언의",   color: "#d97706", multiplier: 4.60, label: "챔피언" },
    10: { name: "킹의",       color: "#111827", multiplier: 5.80, label: "킹" },
    11: { name: "레전드의",   color: "#10b981", multiplier: 7.50, label: "레전드" }
};

const ENHANCE_PROBS = [
    {success: 99.75, maintain: 0.25, destroy: 0},
    {success: 94.50, maintain: 5.50, destroy: 0},
    {success: 89.25, maintain: 10.75, destroy: 0},
    {success: 89.25, maintain: 10.75, destroy: 0},
    {success: 84.00, maintain: 16.00, destroy: 0},
    {success: 78.75, maintain: 21.25, destroy: 0},
    {success: 73.50, maintain: 26.50, destroy: 0},
    {success: 68.25, maintain: 31.75, destroy: 0},
    {success: 63.00, maintain: 37.00, destroy: 0},
    {success: 57.75, maintain: 42.25, destroy: 0},
    {success: 52.50, maintain: 47.50, destroy: 0},
    {success: 47.25, maintain: 52.75, destroy: 0},
    {success: 42.00, maintain: 58.00, destroy: 0},
    {success: 36.75, maintain: 63.25, destroy: 0},
    {success: 31.50, maintain: 68.50, destroy: 0},
    {success: 31.50, maintain: 66.445, destroy: 2.055},
    {success: 31.50, maintain: 66.445, destroy: 2.055},
    {success: 15.75, maintain: 77.51, destroy: 6.74},
    {success: 15.75, maintain: 77.51, destroy: 6.74},
    {success: 15.75, maintain: 75.825, destroy: 8.425},
    {success: 31.50, maintain: 58.225, destroy: 10.275},
    {success: 15.75, maintain: 71.6125, destroy: 12.6375},
    {success: 15.75, maintain: 67.40, destroy: 16.85},
    {success: 10.50, maintain: 71.60, destroy: 17.90},
    {success: 10.50, maintain: 71.60, destroy: 17.90}
];

const BLACK_MARKET_ITEMS = [
    { id: "bm_equip_protect", name: "특수 티타늄 합금액", price: 300000000, category: "장비", icon: "🛡️", desc: "장비 강화 창에서 사용. 강화 실패 시 장비가 0성으로 파괴되는 것을 딱 1회 막아줍니다." },
    { id: "bm_equip_prob", name: "확률 조작 리모컨", price: 150000000, category: "장비", icon: "📱", desc: "장비 강화 창에서 사용. 딱 한 번, 다음 장비 강화 성공 확률을 강제로 20% 대폭 올려줍니다." },
    { id: "bm_bj_hack", name: "형광 마킹 덱", price: 150000000, category: "블랙잭", icon: "🃏", desc: "블랙잭 배팅 시 특수 버튼으로 사용. 다음 판에 무조건 A와 K가 들어오게 조작하여 내추럴 블랙잭(2.5배)을 완성합니다." },
    { id: "bm_roulette_magnet", name: "미세 자성 칩", price: 120000000, category: "룰렛", icon: "🧲", desc: "룰렛 배팅 전 사용. 룰렛 구슬이 내가 배팅한 구역에 떨어질 확률을 90%로 완벽하게 조작합니다." },
    { id: "bm_ladder_hack", name: "적외선 콘택트렌즈", price: 100000000, category: "사다리", icon: "👁️", desc: "사다리 배팅 전 사용. 숨겨진 사다리 줄을 투시하여 100% 확률로 다음 회차의 정답을 미리 알아냅니다." },
    { id: "bm_toto_bribe", name: "심판의 약점 사진", price: 250000000, category: "토토", icon: "📸", desc: "토토 배팅 후 사용. 심판을 완벽히 매수하여, 내가 돈을 건 팀이 무조건 3:0으로 압승하게 만듭니다." },
    { id: "bm_stock_leak", name: "밀수업자의 비밀 찌라시", price: 500000000, category: "주식", icon: "✉️", desc: "주식 탭에서 사용. 다음 턴에 35%~60% 무조건 폭등할 세력주 종목을 귓속말로 알려줍니다." },
    { id: "bm_coin_bot", name: "텔레그램 펌핑 봇", price: 400000000, category: "코인", icon: "🤖", desc: "코인 탭에서 사용. 밈 코인 세력을 움직여 다음 턴에 100%~300% 미친듯이 가격을 펌핑시킵니다." },
    { id: "bm_arena_poison", name: "신경 마비 독침", price: 200000000, category: "투기장", icon: "🩸", desc: "투기장에서 배팅 전 사용. 내가 배팅한 선수의 반대편 상대방 체력을 시작부터 절반(50%)으로 날려버립니다." }
];

// ============================================================
// VVIP 경매장 아이템 목록 (스탯 배제, 순수 서사형 전설 유물)
// ============================================================
const AUCTION_ITEMS = [
    {
        id: "auc_001", name: "요시츠네의 그림자 칼 (Shadow Blade)", startPrice: 8000000000, category: "유물", icon: "🗡️",
        era: "1189년, 일본 가마쿠라 시대",
        description: "길이 62cm 단도(단검). 칼날에 극히 미세한 물결 무늬가 있어, 빛을 받으면 칼날이 ‘흐려지는’ 듯한 착시를 일으킨다. 자루에 ‘義經’ 두 글자가 새겨져 있다.",
        lore: "미나모토 요시츠네가 마지막으로 사용한 단도라는 전설이 있다. 그가 자결하기 전 ‘내 그림자처럼 조용히 세상을 떠나고 싶다’고 말했다고 전해진다.",
        history: "요시츠네 사후 행방이 묘연해졌다가 에도 시대에 한 사무라이 가문이 소유. 메이지 유신 때 폐도령으로 민간에 나왔다가 태평양 전쟁 중 일본군이 징발하려다 실패. 최근 고미술상이 경매에 내놓았다."
    },
    {
        id: "auc_002", name: "에드워드 티치의 흑진주 나침반", startPrice: 12000000000, category: "유물", icon: "🧭",
        era: "18세기 초, 카리브해 바하마 해역",
        description: "낡은 청동 주물 덮개 속에 검은 진주로 조각된 방위판이 들어있다. 바늘은 자성을 잃었지만, 핏방울을 떨어뜨리면 특정 방향을 향해 미세하게 진동한다.",
        lore: "희대의 해적 '검은수염' 에드워드 티치가 자신의 가장 큰 보물 은닉처를 가리키게 만들었다는 전설의 나침반.",
        history: "영국 해군에게 참수당할 때 그의 부관이 빼돌렸으며, 19세기 런던 암시장에 잠시 등장했다가 자취를 감췄다. 최근 심해 난파선 인양 작업 중 방수 가죽 주머니 안에서 원형 그대로 발견되었다."
    },
    {
        id: "auc_003", name: "마리 앙투아네트의 핏빛 루비 펜던트", startPrice: 25000000000, category: "보석", icon: "🩸",
        era: "18세기 후반, 프랑스 부르봉 왕조",
        description: "40캐럿에 달하는 비둘기 피(Pigeon Blood) 색상의 거대한 천연 루비. 펜던트 뒷면에는 루이 16세의 이니셜이 정교하게 각인되어 있다.",
        lore: "단두대에 오르기 전날 밤, 마리 앙투아네트가 자신의 눈물을 섞어 만들었다는 괴담이 도는 보석. 소유자는 막대한 부를 얻지만 끝없는 탐욕에 시달린다고 한다.",
        history: "혁명 정부의 몰수 목록에서 누락된 채 러시아 제국 귀족의 손을 거쳐 세계 대전 당시 스위스 비밀 금고에 보관되었고, 최근 익명의 소유자가 사망하며 출품되었다."
    },
    {
        id: "auc_004", name: "다빈치의 소실된 13번째 코덱스", startPrice: 35000000000, category: "문서", icon: "📜",
        era: "15세기 후반, 이탈리아 피렌체",
        description: "낡은 양피지로 된 12장의 필사본. 특유의 거울 글씨(우측에서 좌측으로 작성)로 빼곡하게 채워져 있으며, 가장자리에는 불에 탄 흔적이 선명하다.",
        lore: "교황청에서 이단으로 규정해 소각하려 했던 다빈치의 미공개 스케치. '인간의 생명을 연장하는 기계'에 대한 소름 돋는 해부학적 설계도가 담겨 있다.",
        history: "바티칸 비밀 서고 깊은 곳에 보관되어 있었으나 19세기에 사서가 빼돌려 암시장에 팔아넘겼고, 최근 파산한 실리콘밸리 억만장자의 저택 압류품에서 발견되었다."
    },
    {
        id: "auc_005", name: "롱기누스의 창 파편", startPrice: 55000000000, category: "성물", icon: "🔱",
        era: "기원후 1세기, 로마 제국",
        description: "검붉게 산화된 철제 창날의 끝부분. 방사성 탄소 연대 측정 결과 1세기 중동 지역의 철광석으로 판명되었다.",
        lore: "골고다 언덕에서 십자가에 매달린 예수의 옆구리를 찔렀다는 로마 백부장 롱기누스의 창. 닿은 자에게 기적과 세계를 제패할 권력을 준다고 믿어진다.",
        history: "수세기 동안 유럽 군주들의 비밀 소장품으로 전해지다 2차 세계대전 직후 바티칸 지하 수장고로 옮겨졌으나, 내부자의 횡령으로 은밀하게 암시장에 등장했다."
    },
    {
        id: "auc_006", name: "아소카 왕의 잊혀진 불사리탑", startPrice: 68000000000, category: "성물", icon: "🪷",
        era: "기원전 3세기, 마우리아 왕조",
        description: "순금과 청금석으로 세공된 손바닥만 한 원통형 사리탑. 안에는 좁쌀 크기의 영롱한 진신사리 3과가 완전한 진공 상태로 봉인되어 있다.",
        lore: "불교를 널리 전파한 아소카 대왕이 직접 세운 8만 4천 개의 사리탑 중, 기록에만 존재하고 실제로는 발견되지 않았던 '0번째' 시작의 탑.",
        history: "인도 북부의 지진으로 무너진 동굴 사원 깊은 곳에서 발굴되었으나, 현지 도굴꾼들이 스위스 밀매업자에게 팔아넘겨 VVIP 경매에 회부되었다."
    },
    {
        id: "auc_007", name: "솔로몬의 72악마 봉인 반지", startPrice: 85000000000, category: "성물", icon: "🔯",
        era: "기원전 10세기경, 고대 이스라엘",
        description: "육망성(다윗의 별)이 깊게 파인 낡은 구리 반지. 기이하게도 반지를 만지면 주변의 온도가 미세하게 떨어지는 기현상이 발생한다.",
        lore: "지혜의 왕 솔로몬이 대천사 미카엘에게 받아 72기둥의 악마들을 부렸다는 전설의 반지. 악마를 복종시키고 초자연적인 부를 끌어당긴다고 한다.",
        history: "십자군 전쟁 당시 템플 기사단이 솔로몬 신전 지하에서 발견하여 유럽으로 반입, 이후 프리메이슨 최상위 계층의 밀실에서 비밀리에 보관되어 왔다."
    },
    {
        id: "auc_008", name: "시바 나타라자 원형 청동상", startPrice: 120000000000, category: "성물", icon: "🔥",
        era: "10세기 촐라 제국, 남인도",
        description: "화염의 고리 안에서 춤을 추는 파괴의 신 '시바'의 조각상. 겉면의 청동은 묘하게도 사람의 체온과 비슷한 36.5도를 영구적으로 유지한다.",
        lore: "우주의 창조와 파괴를 관장하는 시바 신의 우주적 춤(Tandava)을 형상화한 최초의 원형 조각. 이 조각상이 파괴되면 세계가 멸망한다는 힌두교의 교리가 있다.",
        history: "영국 식민 지배 시절 인도 총독이 약탈해 대영박물관으로 수송하던 중 배가 침몰함. 최근 심해 인양 전문 기업이 건져올려 막대한 빚을 갚기 위해 출품했다."
    },
    {
        id: "auc_009", name: "안티키테라 기계의 유실된 심장", startPrice: 180000000000, category: "유물", icon: "⚙️",
        era: "기원전 2세기 초, 고대 그리스",
        description: "심하게 부식된 청동 재질의 정밀한 톱니바퀴. 톱니의 배열이 현대의 기계 공학으로도 완벽한 오차율 0%를 자랑하며, 미세한 천체 기호가 양각되어 있다.",
        lore: "세계 최초의 아날로그 컴퓨터라 불리는 안티키테라 기계의 핵심 동력 부품. 이것이 제자리에 꽂히면 과거와 미래의 모든 시공간을 정확히 예측할 수 있다는 소문이 있다.",
        history: "1901년 난파선에서 발견될 당시 공식 기록에는 누락되었던 부품. 발굴에 참여했던 잠수부가 사적으로 빼돌려 가보로 전해오다가 경매에 내놓았다."
    },
    {
        id: "auc_010", name: "파가니니의 악마의 현", startPrice: 250000000000, category: "유물", icon: "🎻",
        era: "19세기 초, 이탈리아 제노바",
        description: "오래되어 검게 변색된 양의 창자로 만든 바이올린 G선. 고급스러운 진공 유리관 안에 보존되어 있으며, 곁에 두면 누군가 흐느끼는 듯한 미세한 공명음이 울린다.",
        lore: "악마에게 영혼을 팔았다는 천재 바이올리니스트 니콜로 파가니니가 마지막까지 끊어먹지 않고 사용하던 단 하나의 현. 듣는 이의 마음을 완전히 지배할 수 있다고 한다.",
        history: "파가니니 사망 후 교회가 장례를 거부했을 때 악기 수리공이 몰래 챙긴 물건. 유럽의 거장들이 소유했으나 모두 원인 모를 마비 증세를 겪고 봉인해버렸다."
    },
    {
        id: "auc_011", name: "측천무후의 은비녀", startPrice: 380000000000, category: "유물", icon: "🪷",
        era: "7세기 후반, 당나라",
        description: "섬세한 백호(白虎) 조각이 장식된 순은 비녀. 끝부분이 미세하게 푸른빛을 띠고 있으며, 조각의 입 부분에 육안으로 보이지 않는 치명적인 독침 기믹이 숨겨져 있다.",
        lore: "중국 역사상 유일한 여황제 측천무후가 정적들을 은밀히 암살할 때 사용했다는 전설의 암기. 그녀의 핏빛 권력욕과 무자비한 숙청을 상징하는 물건.",
        history: "황궁의 환관에 의해 도굴되어 청나라 때까지 황실 창고에 보관됨. 아편전쟁 당시 서구 열강에 약탈당해 영국 귀족의 소유가 되었다가 아시아 경매장에 나타났다."
    },
    {
        id: "auc_012", name: "라스푸틴의 멈춘 회중시계", startPrice: 500000000000, category: "유물", icon: "🕰️",
        era: "20세기 초, 제정 러시아",
        description: "겉면에 심하게 금이 간 러시아 제국 황실 문장의 회중시계. 시계바늘은 정확히 그가 사망한 시간인 새벽 1시 30분에 멈춰 있으며 검붉은 얼룩이 남아있다.",
        lore: "독살, 총상, 익사에도 끈질기게 살아남았던 괴승 라스푸틴의 생명력과 동기화되어 있었다는 괴담의 시계. 멈춰있는 초침이 다시 움직이는 날 그가 부활한다고 한다.",
        history: "네바 강에서 시신을 건져 올린 경찰이 슬쩍한 물건. 냉전 시대 소련 고위 간부들 사이에서 뇌물로 오가다 소련 붕괴 후 마피아 보스의 손을 거쳐 스위스에 상륙했다."
    },
    {
        id: "auc_013", name: "템플 기사단의 일루미나티 인장", startPrice: 850000000000, category: "유물", icon: "👁️",
        era: "13세기 초, 프랑스 샹파뉴",
        description: "순도 높은 백금으로 주조된 묵직한 도장. 두 명의 기사가 한 마리의 말을 탄 기사단 전통 문양 뒷면에 '전시안(All-seeing eye)'이 정교하게 조각되어 있다.",
        lore: "템플 기사단이 숙청당할 당시, 세계의 금융을 쥐락펴락할 '그림자 정부'를 세우기 위해 결성된 비밀 조직의 설립 증서에 찍혔다는 전설의 인장.",
        history: "1307년 '13일의 금요일' 숙청의 밤에 기사단 단장이 빼돌려 스코틀랜드로 도주. 이후 프리메이슨 최고위층 가문에서 전승되다가 익명의 의뢰인에 의해 출품됨."
    },
    {
        id: "auc_014", name: "테슬라의 데스 레이 다이오드", startPrice: 1500000000000, category: "유물", icon: "⚡",
        era: "1930년대, 미국 뉴욕",
        description: "크리스탈과 미지의 합금으로 이루어진 진공관 형태의 부품. 전기가 없는 상태에서도 스스로 푸른빛의 스파크를 미세하게 튕겨내며 웅웅거린다.",
        lore: "천재 발명가 니콜라 테슬라가 말년에 연구했던, 수백 킬로미터 밖의 적기를 단숨에 격추시킬 수 있다는 빔 무기 '평화의 광선'의 핵심 증폭 장치.",
        history: "테슬라 사망 직후 FBI가 압수수색하기 1시간 전 조수가 가방에 넣어 빼돌림. 70년간 지하 벙커에 방치되다가 최근 중동 무기상의 손을 거쳐 암시장에 나왔다."
    },
    {
        id: "auc_015", name: "트리니티 프로젝트 기폭 스위치", startPrice: 3000000000000, category: "유물", icon: "☢️",
        era: "1945년 7월 16일, 미국 뉴멕시코",
        description: "붉은 덮개가 씌워진 철제 스위치 뭉치. 'TRINITY - 05:29:45'라는 각인이 투박하게 새겨져 있으며, 가이거 계수기에 대면 미량의 방사선이 측정된다.",
        lore: "인류 최초의 핵실험 당시 로버트 오펜하이머가 직접 눌렀다고 전해지는 바로 그 버튼. '나는 이제 죽음이요, 세상의 파괴자가 되었다'는 묵시록적 상징.",
        history: "공식 기록에서는 위험물로 폐기되었다고 명시되었으나, 프로젝트의 고위 장교가 기념품으로 밀반출함. '인류 멸망의 상징'으로 불리며 전 세계 하이롤러들의 최종 타겟이 되었다."
    },
    {
        id: "auc_016", name: "아틀란티스의 가라앉은 태양석", startPrice: 4500000000000, category: "유물", icon: "☀️",
        era: "기원전 10,000년 경, 신화 시대",
        description: "심해의 엄청난 수압을 견뎌내고 미세한 빛을 발하는 오리할콘 재질의 원판. 표면을 만지면 심장 박동 같은 기괴한 진동이 손끝을 타고 흐른다.",
        lore: "아틀란티스를 바다 밑으로 가라앉힌 원흉이자 그들의 찬란했던 문명을 지탱하던 무한한 동력원. 이 돌을 소유한 자는 절대적인 권력과 부를 얻지만, 결국 물과 관련된 끔찍한 최후를 맞이한다는 서늘한 전설이 있다.",
        history: "마리아나 해구 가장 깊은 곳에서 심해 탐사정에 의해 우연히 인양됨. 당시 탐사정의 승무원들은 전원 정신 착란을 일으켰고, 유물만이 무인 귀환선에 실려 암시장으로 유입되었다."
    },
    {
        id: "auc_017", name: "모차르트의 피 묻은 깃펜", startPrice: 7200000000000, category: "유물", icon: "🪶",
        era: "1791년, 오스트리아 빈",
        description: "끝부분이 검붉게 물들어 딱딱하게 굳어버린 낡은 백조 깃펜. 잉크 없이 종이에 가져다 대기만 해도, 펜이 스스로 움직이며 섬뜩한 진혼곡의 악보를 그려내는 기현상이 보고된다.",
        lore: "죽음의 문턱에서 미완성 교향곡 '레퀴엠'을 작곡하던 모차르트가, 환각 속에서 악마와 거래하며 자신의 피를 찍어 썼다는 전설의 깃펜. 이 펜으로 서명한 계약은 악마의 보증을 받아 절대 파기할 수 없다고 한다.",
        history: "라이벌 살리에리의 비밀 일기장 갈피에 꽂혀 있던 것을 19세기에 한 수집가가 발견했다. 이후 유럽의 지하 금융계 거물들이 이 펜으로 '피의 계약'을 맺을 때만 극비리에 사용해왔다."
    },
    {
        id: "auc_018", name: "유다의 30번째 은화", startPrice: 9500000000000, category: "성물", icon: "🪙",
        era: "기원후 1세기, 예루살렘",
        description: "표면이 까맣게 부식된 티로스 은화(Shekel of Tyre). 은화의 양면에는 로마 황제의 얼굴 대신, 고통에 일그러져 절규하는 사람의 형상이 기괴하게 새겨져 있다.",
        lore: "가룟 유다가 예수를 팔아넘기고 받은 30닢의 은화 중 가장 마지막 동전. 소유자에게 타인의 마음을 읽고 배신을 꿰뚫어 보는 통찰력을 주지만, 종국에는 가장 사랑하는 사람에게 배신당하는 잔혹한 저주가 깃들어 있다.",
        history: "십자군 전쟁 당시 예루살렘 지하 묘지에서 발굴된 후, 세계를 뒤에서 조종하는 배후 세력들의 손을 거쳤다. 전 소유주였던 유럽의 억만장자가 자신의 친아들에게 암살당한 직후 경매에 회부되었다."
    },
    {
        id: "auc_019", name: "메두사의 석화된 눈동자", startPrice: 15000000000000, category: "신화", icon: "👁️",
        era: "고대 그리스 신화 시대",
        description: "탁한 에메랄드빛을 띠는 주먹만 한 크기의 광물. 자세히 들여다보면 광물 깊은 곳에서 동공 형태의 문양이 미세하게 축소하고 확장하는 듯한 소름 끼치는 움직임이 보인다.",
        lore: "영웅 페르세우스가 베어낸 고르곤 메두사의 잘린 머리에서 파생된 보석. 사람을 돌로 만들 수는 없지만, 바라보는 이의 이성과 영혼을 완전히 옭아매어 어떠한 거절도 하지 못하게 만드는 강력한 최면 효과를 발휘한다.",
        history: "수백 년간 바티칸 지하 수장고 가장 깊은 곳, 납으로 된 상자에 철저히 봉인되어 있었다. 그러나 최근 교황청 내부의 극비 회계 부정 사건을 덮을 천문학적인 자금을 마련하기 위해 VVIP 경매장에 은밀하게 출품되었다."
    }
];

// ============================================================
// ✨ 신규: 블랙 클럽 멤버 (20인 로스터 데이터 - 서사 대폭 확장 및 인물 교체)
// ============================================================
const BLACK_CLUB_MEMBERS = [
    // --- [최상위 1~3위] 언터처블 ---
    {
        id: "rank_iu", name: "아이유", title: "부동산의 제왕",
        netWorth: 12500000000000, status: "active", isUnlocked: false, unlockCondition: 3000000000000,
        stats: { investment: 90, gambling: 5, analysis: 70, business: 100, flex: 50 },
        affinity: 0, giftPreferences: ["부동산", "미술품"],
        lore: "하이롤러 시티의 노른자위 땅을 싹쓸이한 거물. 표면적으론 국민 여동생이자 천재 아티스트로 불리지만, 뒷골목에서는 피도 눈물도 없는 부동산 투기의 여왕으로 통합니다. 그녀가 한 번 눈독 들인 건물은 다음 날 반드시 소유주가 바뀐다는 소문이 있으며, 카지노 VVIP 룸에서는 오직 최상급 샴페인만을 마시며 조용히 칩을 쌓아 올립니다. 그녀의 자산 그래프는 단 한 번도 하향 곡선을 그린 적이 없습니다."
    },
    {
        id: "rank_sohee", name: "한소희", title: "투기장의 흑장미",
        netWorth: 9500000000000, status: "active", isUnlocked: false, unlockCondition: 2000000000000,
        stats: { investment: 20, gambling: 85, analysis: 95, business: 80, flex: 70 },
        affinity: 0, giftPreferences: ["신화/유물", "명품"],
        lore: "다크하고 퇴폐적인 매력으로 지하 투기장을 지배하는 메인 스폰서. 평범한 카지노 게임보다는 피 튀기는 격투와 목숨을 건 러시안룰렛을 즐깁니다. 거친 성향 탓에 마음에 들지 않는 상대에게는 칩 대신 재떨이를 날리기도 하며, 적개심이 쉽게 오르지만 한 번 신뢰한 사람에겐 엄청난 자금력을 지원해주는 변덕스러운 큰손입니다."
    },
    {
        id: "rank_hyori", name: "이효리", title: "제주의 대모",
        netWorth: 8200000000000, status: "active", isUnlocked: false, unlockCondition: 1500000000000,
        stats: { investment: 50, gambling: 20, analysis: 60, business: 95, flex: 80 },
        affinity: 0, giftPreferences: ["미술품", "명품"],
        lore: "한 시대를 풍미했던 슈퍼스타이자, 현재는 남쪽 섬 전체를 통째로 사들여 거대한 지하 왕국을 건설한 진정한 대모. 은퇴한 척 평화로운 일상을 보내는 듯 보이나, 실제로는 위성 전화를 통해 매일 밤 수백억 단위의 검은돈을 세탁하고 있습니다. 짬에서 우러나오는 엄청난 직관력으로 뒷골목 사업을 쥐락펴락합니다."
    },
    // --- [상위 4~10위] 글로벌 하이롤러 ---
    {
        id: "rank_wonyoung", name: "장원영", title: "경매장의 지배자",
        netWorth: 7100000000000, status: "active", isUnlocked: false, unlockCondition: 1000000000000,
        stats: { investment: 30, gambling: 40, analysis: 20, business: 85, flex: 100 },
        affinity: 0, giftPreferences: ["신화/유물", "보석"],
        lore: "세상의 모든 반짝이고 희귀한 것은 전부 자신의 진열장에 있어야 직성이 풀리는 압도적인 과시욕의 소유자. 경매장에 전설급 유물이나 보석이 뜨면 경쟁자의 호가를 비웃듯 무자비한 입찰 폭격을 가해 기어코 낙찰을 받아냅니다. 그녀에게 돈이란 그저 자존심과 권력을 증명하기 위한 도구일 뿐입니다."
    },
    {
        id: "rank_jisoo", name: "지수", title: "코인계의 고래",
        netWorth: 6500000000000, status: "active", isUnlocked: false, unlockCondition: 800000000000,
        stats: { investment: 95, gambling: 70, analysis: 50, business: 40, flex: 60 },
        affinity: 0, giftPreferences: ["테크", "명품"],
        lore: "우아하고 사랑스러운 미소 뒤에 숨겨진 암호화폐 시장의 냉혹한 작전 세력 핵심. 전 세계적인 영향력을 이용해 특정 밈 코인을 펌핑시킨 뒤 고점에서 털어먹는다는 무시무시한 루머의 주인공입니다. 차트가 떡상하는 날이면 그녀의 자산 순위는 최상위권까지 위협하며, 카지노에서는 항상 최고급 펜트하우스를 통째로 빌려 파티를 엽니다."
    },
    {
        id: "rank_suzy", name: "배수지", title: "청담동 큰손",
        netWorth: 5800000000000, status: "active", isUnlocked: false, unlockCondition: 700000000000,
        stats: { investment: 80, gambling: 30, analysis: 60, business: 80, flex: 70 },
        affinity: 0, giftPreferences: ["부동산", "자동차"],
        lore: "'국민 첫사랑'이라는 타이틀로 대중의 사랑을 받지만, 이면에서는 강남 일대의 최고급 빌딩과 하이엔드 차량을 쓸어 담는 무서운 투자자입니다. 언제나 차분하고 우아한 태도를 유지하지만, 배팅 테이블에 앉으면 가장 안정적이면서도 상대의 심리를 완전히 무너뜨리는 과감한 승부사 기질을 발휘합니다."
    },
    {
        id: "rank_jennie", name: "제니", title: "럭셔리 엠베서더",
        netWorth: 4900000000000, status: "active", isUnlocked: false, unlockCondition: 600000000000,
        stats: { investment: 60, gambling: 60, analysis: 40, business: 70, flex: 95 },
        affinity: 0, giftPreferences: ["명품", "시계"],
        lore: "전 세계 하이엔드 명품 브랜드들이 앞다투어 모셔가는 글로벌 아이콘. 그녀가 걸치는 모든 것이 가치를 지니며, 소비의 단위 자체가 일반적인 하이롤러들과 궤를 달리합니다. 돈을 벌기 위해서가 아니라 그저 '돈 쓰는 맛'을 느끼기 위해 카지노와 경매장을 방문하며, 딜러의 팁으로 수억 원짜리 시계를 풀어서 주기도 합니다."
    },
    {
        id: "rank_jongseo", name: "전종서", title: "피의 스폰서",
        netWorth: 4200000000000, status: "active", isUnlocked: false, unlockCondition: 500000000000,
        stats: { investment: 40, gambling: 75, analysis: 90, business: 85, flex: 50 },
        affinity: 0, giftPreferences: ["신화/유물", "자동차"],
        lore: "돈 앞에서는 피도 눈물도 없는 냉혹하고 잔혹한 사채업계의 숨은 지배자. 광기 어린 눈빛으로 상대의 기선을 제압하며, 그녀가 직접 눈독 들여 스폰하는 투기장 선수는 절대 지지 않는다는 불문율이 있습니다. 빚을 갚지 못하는 자들의 담보를 헐값에 넘겨 막대한 이득을 취하는 뒷골목의 실세입니다."
    },
    {
        id: "rank_goeun", name: "김고은", title: "월스트리트의 마녀",
        netWorth: 3500000000000, status: "active", isUnlocked: false, unlockCondition: 400000000000,
        stats: { investment: 100, gambling: 20, analysis: 80, business: 50, flex: 40 },
        affinity: 0, giftPreferences: ["테크", "미술품"],
        lore: "도도하고 지적인 이미지로 주식 시장에서 수많은 개미들의 영혼을 털어먹는 글로벌 작전 세력의 브레인. 기업의 재무제표와 글로벌 시황을 읽어내는 능력이 타의 추종을 불허하며, 수조 원이 오가는 공매도 작전을 커피 한 잔 마시듯 여유롭게 지휘합니다. 감정에 흔들리지 않는 얼음 같은 심장을 가졌습니다."
    },
    {
        id: "rank_taeyeon", name: "태연", title: "사다리의 악마",
        netWorth: 2800000000000, status: "active", isUnlocked: false, unlockCondition: 300000000000,
        stats: { investment: 20, gambling: 95, analysis: 60, business: 30, flex: 70 },
        affinity: 0, giftPreferences: ["명품", "보석"],
        lore: "요정 같은 외모와 맑은 목소리를 가졌지만, VIP 룸에만 들어가면 사다리 홀짝에 수천억을 태우는 진짜 광기의 도박사로 돌변합니다. 승률이 시스템을 해킹한 것이 아닐까 의심될 정도로 비정상적으로 높으며, 확률에 모든 것을 맡길 때 뿜어져 나오는 짜릿한 아드레날린에 완전히 중독되어 있습니다."
    },
    // --- [중위 11~20위] 신흥 하이롤러 ---
    {
        id: "rank_jiwon", name: "김지원", title: "냉혹한 승부사",
        netWorth: 2100000000000, status: "active", isUnlocked: true, unlockCondition: 0,
        stats: { investment: 10, gambling: 90, analysis: 80, business: 40, flex: 50 },
        affinity: 0, giftPreferences: ["시계", "미술품"],
        lore: "재벌가 영애 같은 기품 있는 분위기를 풍기며, VVIP 룸에서 오직 블랙잭과 바카라로만 수천억을 따낸 천재 타짜. 카드 카운팅의 달인으로, 딜러의 미세한 표정 변화조차 놓치지 않습니다. 그녀와 같은 테이블에 앉은 호구들은 자신이 언제 파산했는지도 모른 채 구경꾼들 틈으로 쫓겨나곤 합니다."
    },
    {
        id: "rank_yujin", name: "안유진", title: "토토 분석가",
        netWorth: 1500000000000, status: "active", isUnlocked: true, unlockCondition: 0,
        stats: { investment: 40, gambling: 60, analysis: 95, business: 50, flex: 50 },
        affinity: 0, giftPreferences: ["테크", "자동차"],
        lore: "이른바 '맑은 눈의 광인'. 예능에서의 활기찬 모습은 철저한 위장일 뿐, 그녀의 진짜 정체는 EPL과 글로벌 스포츠 토토의 패턴을 귀신같이 읽어내는 데이터 분석의 달인입니다. 불법 도박 사이트의 배당률을 조작하는 뒷배경 세력과도 연관이 있다는 소문이 있으며, 매주 막대한 상금을 조용히 쓸어 담습니다."
    },
    {
        id: "rank_minji", name: "민지", title: "잭팟 브레이커",
        netWorth: 1200000000000, status: "active", isUnlocked: true, unlockCondition: 0,
        stats: { investment: 20, gambling: 100, analysis: 30, business: 20, flex: 60 },
        affinity: 0, giftPreferences: ["보석", "명품"],
        lore: "청순하고 깨끗한 이미지로 대중을 사로잡은 스타. 하지만 밤이 되면 아무도 모르게 캡모자를 눌러쓰고 카지노 슬롯머신 구역을 배회합니다. 그녀가 레버를 당기기만 하면 기계가 오류를 일으킨 것처럼 그랜드 잭팟이 터지며, 전 세계 카지노 지배인들이 가장 기피하는 블랙리스트 1순위로 꼽힙니다."
    },
    {
        id: "rank_sekyung", name: "신세경", title: "조용한 그림자",
        netWorth: 900000000000, status: "active", isUnlocked: true, unlockCondition: 0,
        stats: { investment: 70, gambling: 10, analysis: 60, business: 90, flex: 40 },
        affinity: 0, giftPreferences: ["미술품", "부동산"],
        lore: "언제나 차분하게 브이로그를 찍으며 평범하고 소박한 일상을 공유하는 듯 보이지만, 카메라가 꺼진 뒤에는 거대한 자본을 굴리는 은밀하고 치밀한 실력자입니다. 뒷골목 자금을 세탁해 합법적인 빌딩과 부동산으로 둔갑시키는 데 천부적인 재능을 보이며, 결코 자신의 진정한 부를 겉으로 드러내지 않습니다."
    },
    {
        id: "rank_miyeon", name: "미연", title: "룰렛의 여왕",
        netWorth: 750000000000, status: "active", isUnlocked: true, unlockCondition: 0,
        stats: { investment: 30, gambling: 85, analysis: 40, business: 30, flex: 85 },
        affinity: 0, giftPreferences: ["명품", "시계"],
        lore: "화려하고 숨 막히는 비주얼만큼이나 화끈하고 무자비한 배팅 스타일을 자랑합니다. 룰렛 테이블에 앉아 단일 번호(스트레이트 업)에 수십억을 한 번에 밀어 넣고 구슬이 떨어지는 소리를 샴페인과 함께 즐기는 쾌락주의자입니다. 수십억을 잃어도 눈 하나 깜짝하지 않으며, 오직 짜릿한 잭팟만을 추구합니다."
    },
    {
        id: "rank_seolyoon", name: "설윤", title: "암시장 딜러",
        netWorth: 600000000000, status: "active", isUnlocked: true, unlockCondition: 0,
        stats: { investment: 40, gambling: 20, analysis: 50, business: 75, flex: 90 },
        affinity: 0, giftPreferences: ["신화/유물", "보석"],
        lore: "천사 같은 비주얼로 사람들의 경계심을 완전히 무너뜨린 뒤, 뒤통수를 치고 막대한 이득을 취하는 뒷골목 암시장의 요정. 합법적인 시장에서는 구할 수 없는 위험하고 희귀한 조작 아이템들을 은밀하게 유통하며, 그녀의 치명적인 미소에 홀려 전 재산을 탕진한 어리석은 하이롤러가 셀 수 없이 많습니다."
    },
    {
        id: "rank_haerin", name: "해린", title: "차트 리더",
        netWorth: 450000000000, status: "active", isUnlocked: true, unlockCondition: 0,
        stats: { investment: 85, gambling: 30, analysis: 75, business: 40, flex: 30 },
        affinity: 0, giftPreferences: ["테크", "미술품"],
        lore: "속을 알 수 없는 무심한 고양이 같은 눈빛으로 하루 종일 모니터의 차트만 쳐다보는 타고난 스캘퍼(초단타 매매자). 나이를 가늠할 수 없는 냉철함으로 0.1초 단위의 틱 변화를 포착해 돈을 진공청소기처럼 긁어모읍니다. 인간관계에 무관심해 보이지만, 최고급 테크 기기를 선물해주면 미세하게 표정이 밝아집니다."
    },
    {
        id: "rank_jeongeui", name: "노정의", title: "스타트업 헌터",
        netWorth: 300000000000, status: "active", isUnlocked: true, unlockCondition: 0,
        stats: { investment: 80, gambling: 40, analysis: 60, business: 70, flex: 50 },
        affinity: 0, giftPreferences: ["부동산", "자동차"],
        lore: "어린 나이에 이미 산전수전을 다 겪은 비즈니스의 여우. 유망해 보이는 지하 사업장이나 파산 직전의 전당포를 헐값에 후려쳐 인수한 뒤, 폭력적인 구조조정을 통해 수익률을 극대화하여 비싸게 되파는 악랄한 수완을 자랑합니다. 귀여운 외모에 속아 계약서에 사인했다간 뼈까지 발라먹히기 십상입니다."
    },
    {
        id: "rank_minsi", name: "고민시", title: "단타의 신",
        netWorth: 200000000000, status: "active", isUnlocked: true, unlockCondition: 0,
        stats: { investment: 90, gambling: 80, analysis: 50, business: 30, flex: 60 },
        affinity: 0, giftPreferences: ["명품", "시계"],
        lore: "어둠의 텔레그램 망을 활용한 찌라시 정보력이 타의 추종을 불허하며, 세력들이 움직여 급등락하는 밈 코인장에서 미리 선점해 한 몫 단단히 챙긴 뒤 폭락 직전 빠져나오는 전설적인 단타꾼입니다. 항상 촉각을 곤두세우고 있어 다소 예민하지만, 막대한 현금을 직접 만질 때만큼은 환한 웃음을 지어 보입니다."
    },
    {
        id: "rank_eunbi", name: "권은비", title: "경매장의 워터밤",
        netWorth: 100000000000, status: "active", isUnlocked: true, unlockCondition: 0,
        stats: { investment: 20, gambling: 60, analysis: 30, business: 60, flex: 95 },
        affinity: 0, giftPreferences: ["신화/유물", "자동차"],
        lore: "돈을 마치 물 쓰듯 쏟아붓는 것을 즐기는 하이롤러 클럽의 화려한 뉴페이스. VVIP 경매장에 나타나면 주변의 시선은 아랑곳하지 않고 화끈한 최고가 호가를 부르며 분위기를 단숨에 압도합니다. 막대한 부를 쌓은 기간은 비교적 짧지만, 그 과시욕과 씀씀이 스케일만큼은 최상위 랭커들을 위협할 정도로 매섭습니다."
    }
];

// ============================================================
// 🏢 지하 사업장 및 전담 관리인 데이터 (서사 및 세부 스탯 추가)
// ============================================================
const UNDERGROUND_BUSINESSES = [
    { 
        id: "biz_1", name: "뒷골목 불법 전당포", manager: "박수진", title: "전직 조폭 행동대장", 
        baseCost: 50000000, baseCps: 1000, baseCapacityTime: 3600, unlockReq: 0, 
        lore: "과거 전국구를 주름잡던 폭력조직의 칼잡이 출신. 조직이 와해된 후 뒷골목 전당포를 맡아 거칠게 수금하고 있습니다. 피를 보는 것을 두려워하지 않으며, 무식할 정도로 돈을 뜯어내는 데는 천부적인 재능이 있습니다. 하지만 머리를 쓰는 로비나 경찰 대처에는 젬병이라 뇌물을 줄 생각도 못 합니다.", 
        skillGrade: "B", lobbyGrade: "F", loyaltyGrade: "A",
        stats: { skill: 70, lobby: 10, loyalty: 85 },
        desc: "무식하게 수금만 잘합니다. 경찰 단속에 매우 취약합니다."
    },
    { 
        id: "biz_2", name: "강남 VIP 시크릿 클럽", manager: "설인아", title: "강남 화류계의 전설", 
        baseCost: 500000000, baseCps: 15000, baseCapacityTime: 7200, unlockReq: 10, 
        lore: "정재계 거물들의 비밀이 오가는 하이엔드 클럽의 마담. 뛰어난 언변과 치명적인 매력으로 경찰과 권력자들을 구워삶아 단속을 완벽하게 무마시킵니다. 하지만 씀씀이가 워낙 헤퍼서, 회장님께서 월급을 제때 주지 않으면 손님들의 칩을 몰래 빼돌려 명품백을 사러 갑니다.", 
        skillGrade: "A", lobbyGrade: "S", loyaltyGrade: "C",
        stats: { skill: 85, lobby: 95, loyalty: 40 },
        desc: "로비력이 뛰어나 단속을 잘 피하지만, 사치가 심해 월급이 밀리면 횡령이 극심합니다."
    },
    { 
        id: "biz_3", name: "역외 페이퍼 컴퍼니", manager: "박은빈", title: "월스트리트 출신 회계사", 
        baseCost: 5000000000, baseCps: 200000, baseCapacityTime: 14400, unlockReq: 15, 
        lore: "숫자 하나로 수백억을 합법과 불법 사이로 넘나들게 하는 천재 회계사. 완벽한 자금 세탁과 탈세 스킬로 막대한 수익을 창출합니다. 다만, 그녀의 뛰어난 두뇌는 회장님의 뒤통수를 치고 횡령을 할 때도 똑같이 작동합니다. 그녀의 횡령은 사실상 예술에 가깝습니다.", 
        skillGrade: "S", lobbyGrade: "A", loyaltyGrade: "B",
        stats: { skill: 95, lobby: 85, loyalty: 70 },
        desc: "수완과 로비력이 뛰어난 브레인. 횡령을 시작하면 스케일이 남다릅니다."
    },
    { 
        id: "biz_4", name: "마카오 카지노 정킷방", manager: "신혜선", title: "마카오 삼합회 간부", 
        baseCost: 50000000000, baseCps: 3000000, baseCapacityTime: 28800, unlockReq: 20, 
        lore: "아시아 도박판의 실세인 삼합회의 여성 간부. 회장님에 대한 충성심 하나는 타의 추종을 불허하여 1원 한 장도 횡령하지 않습니다. 그러나 굴리는 판돈이 단위부터 다르다 보니, 인터폴과 현지 경찰들의 어그로를 1순위로 끌어 항상 단속의 위험에 노출되어 있습니다.", 
        skillGrade: "SS", lobbyGrade: "B", loyaltyGrade: "S",
        stats: { skill: 98, lobby: 65, loyalty: 95 },
        desc: "충성도가 확실해 배신하지 않지만, 국제경찰의 어그로를 끌어 단속 리스크가 큽니다."
    },
   { 
        id: "biz_5", name: "글로벌 불법 무기 밀매망", manager: "이주빈", title: "전직 KGB 블랙요원", 
        baseCost: 500000000000, baseCps: 50000000, baseCapacityTime: 43200, unlockReq: 30,
        lore: "타겟 확인. 감정은 제거했습니다. 명령만 내리십시오.", 
        skillGrade: "SSS", lobbyGrade: "SS", loyaltyGrade: "SSS",
        stats: { skill: 100, lobby: 100, loyalty: 100 },
        desc: "완벽한 살인기계. 경찰 단속 확률이 0%가 되며 절대 횡령하지 않습니다."
    }
];