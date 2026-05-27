// ════════════════════════════════════════
// 상수
// ════════════════════════════════════════

const INDUSTRIES = ['반도체', 'AI', '바이오', '2차전지', '우주항공', '로봇'];

const COLORS = {
    '반도체':  '#3b82f6',
    'AI':      '#8b5cf6',
    '바이오':  '#10b981',
    '2차전지': '#f59e0b',
    '우주항공': '#ef4444',
    '로봇':    '#06b6d4'
};

const INITIAL = {
    '반도체':  75000,
    'AI':      42000,
    '바이오':  68000,
    '2차전지': 48000,
    '우주항공': 31000,
    '로봇':    55000
};

// 날짜(일 단위) 시드 — 같은 날 모든 컴퓨터에서 동일
const TODAY_SEED = Math.floor(Date.now() / 86400000);

function seededRand(tick, slot) {
    let h = ((tick * 1000003 + slot * 7919 + TODAY_SEED * 48271) & 0xFFFFFFFF) >>> 0;
    h ^= h >>> 16;
    h  = Math.imul(h, 0x45d9f3b) >>> 0;
    h ^= h >>> 15;
    h  = Math.imul(h, 0xc2b2ae35) >>> 0;
    return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

function secondToTimeStr(s) {
    const hh = String(Math.floor(s / 3600)).padStart(2, '0');
    const mm = String(Math.floor((s % 3600) / 60)).padStart(2, '0');
    const ss = String(s % 60).padStart(2, '0');
    return `${hh}:${mm}:${ss}`;
}

// 산업 간 상관관계 (반도체↑ → AI 동반 상승 등)
const CORR = {
    '반도체':  { 'AI': 0.4, '로봇': 0.2 },
    'AI':      { '반도체': 0.4, '로봇': 0.25 },
    '2차전지': { '반도체': 0.25 },
    '우주항공': { '2차전지': 0.2 },
    '로봇':    { 'AI': 0.35, '반도체': 0.2 }
};

// ════════════════════════════════════════
// 뉴스 DB
// ════════════════════════════════════════

const NEWS_DB = {
    '반도체': {
        positive: [
            '엔비디아 HBM3E 단독 공급사 선정 — 연간 수주 8조',
            '미국 반도체법 보조금 2조 원 수령 최종 확정',
            'TSMC 공급 차질로 국내 파운드리 반사이익 급등',
            'AI 반도체 수요 폭발 — 분기 수주 잔고 역대 최고',
            '3나노 공정 양산 돌입, 글로벌 점유율 50% 돌파',
            '차량용 반도체 공급 부족 사태 — 수주 폭주',
            '반도체 특허 소송 최종 승소, 로열티 연 5000억',
            '美 AI 데이터센터 수요 급증, 메모리 가격 30% 상승',
            '양자컴퓨팅 칩 시제품 개발 성공 발표',
            'EU 반도체 공장 착공 — 정부 1조 보조금 지원',
            'DDR6 규격 선점, 국제 표준 등재 확정',
            '방산 반도체 수출 허가 취득 — 중동 대규모 수주',
            '2분기 영업이익 역대 최고치 경신',
            '구글·아마존 AI칩 공동개발 MOU 체결',
            '파운드리 가동률 100% 돌파, 대기 수요 급증',
            '소부장 국산화 완료 — 일본 의존도 제로 선언',
            '인텔과 파운드리 5년 장기 공급 계약 체결',
            '중국 수출 규제 반사이익 — 글로벌 점유율 급상승',
            '차세대 HBM4 업계 최초 샘플 출하 성공',
            '일본 소재 규제 완화로 원가 절감 기대'
        ],
        negative: [
            '미국, 대중국 반도체 수출 추가 제재 발표',
            'TSMC 가격 인하로 파운드리 수주 경쟁 심화',
            '핵심 기술 중국 유출 — 전직 임원 구속',
            '메모리 가격 40% 폭락, 업황 급격 악화',
            '공장 화재로 주력 생산 라인 3개월 셧다운',
            '환경부 공장 폐수 오염 조사 착수 — 가동 중단 가능성',
            '엔비디아, 공급처 변경 검토 중 보도',
            '미국 제재로 중국 매출 50% 급감',
            '일본 핵심 소재 수출 금지 조치 발동',
            '공정 설계 오류 발견, 출하 제품 전량 리콜',
            '인력 구조조정 발표 — 임직원 15% 감원',
            '미국 ITC, 특허 침해 수입 금지 명령 발동',
            '전력 과소비 논란으로 EU 탄소 규제 적용',
            '주요 고객사 삼성, 수주 취소 통보',
            '2분기 영업이익 전망치 대폭 하향 조정',
            '대규모 시설투자 실패, 감가상각 부담 폭증',
            '반도체 수출 통제 강화로 공급망 차질',
            '핵심 연구인력 20명 스타트업으로 집단 이탈',
            '사이버 공격으로 생산 시스템 랜섬웨어 감염',
            '과잉 공급으로 메모리 평균판가 30% 폭락'
        ]
    },
    'AI': {
        positive: [
            '오픈AI, 국내 AI 기업과 독점 파트너십 체결',
            '정부 AI 국가전략 발표 — 업종 전체 투자 급증',
            'GPT-5 능가하는 한국형 LLM 개발 성공 발표',
            '미 국방부 AI 시스템 5000억 수주 확정',
            'AI 반도체 독자 설계 성공 — 엔비디아 의존 탈피',
            '구글에 AI 핵심 특허 기술 2000억에 매각 완료',
            '병원 AI 진단 시스템 FDA 승인 취득',
            '자율주행 레벨4 인증 획득, 상용화 초읽기',
            '애플 AI 기능 탑재 파트너사로 선정',
            '분기 매출 1조 첫 돌파, 흑자 전환 성공',
            '중동 국부펀드 단독 전략적 1조 투자 확정',
            '의료 AI 암 조기진단 정확도 99.7% 달성',
            'UN AI 윤리위원회 기술 표준으로 채택',
            '마이크로소프트 애저 공식 AI 파트너 선정',
            'AI 번역 서비스 전 세계 100개국 동시 출시',
            '네이버·카카오 AI 인프라 장기 공급 계약',
            '군사 드론 AI 제어 시스템 방사청 납품 확정',
            'AI 교육 플랫폼 미국 학군 500개 동시 도입',
            '국내 AI 스타트업 역대 최대 1조 투자 유치',
            '세계 최초 실시간 AI 법률 서비스 출시'
        ],
        negative: [
            'AI 학습 데이터 저작권 침해 집단소송 제기',
            '챗GPT 고도화로 핵심 서비스 경쟁력 타격',
            'AI 생성 콘텐츠 규제법 국회 통과 — 사업 모델 위기',
            '개인정보보호법 위반, 과징금 1000억 부과',
            '핵심 AI 연구팀 전원 오픈AI로 이직',
            'AI 오작동으로 자율주행 차량 사망사고 발생',
            '미 상원, 한국산 AI 수입 안보 심사 착수',
            '투자금 소진 — 추가 자금 조달 실패 위기',
            'AI 편향 논란으로 글로벌 파트너 계약 해지',
            '구글·메타 무료 AI 공개로 수익 모델 붕괴',
            '데이터센터 화재로 서비스 전면 중단 72시간',
            'AI 핵심 특허 무효 판결, 기술 해자 소멸',
            '중국 딥시크 등장으로 밸류에이션 급락',
            '공정위, AI 시장 독점 혐의 조사 착수',
            '대규모 해킹으로 AI 학습 데이터 전량 유출',
            '창업자·CEO 간 경영권 분쟁 표면화',
            'EU AI법 전면 시행, 핵심 서비스 유럽 출시 금지',
            '군사 AI 계약 국제 윤리 위반 논란 폭발',
            '3분기 영업손실 확대, 흑자 전환 무산',
            'AI 규제 샌드박스 신청 3년 연속 탈락'
        ]
    },
    '바이오': {
        positive: [
            'FDA 신약 승인 획득 — 글로벌 판매 즉시 개시',
            '국내 최초 항암 신약 임상 3상 성공 발표',
            '노바티스와 바이오시밀러 독점 공급 계약 5조 체결',
            '알츠하이머 치료제 임상 2상 완치율 89% 달성',
            '빌게이츠 재단 감염병 백신 개발 2000억 지원',
            '보건부, 첫 국산 mRNA 백신 긴급사용 승인',
            '췌장암 조기진단 키트 유럽 CE 인증 획득',
            '일본 다케다제약과 공동 임상 협력 MOU',
            '독보적 항체 플랫폼 기술 미국 특허 등록',
            '아스트라제네카 기술이전 계약 8000억 체결',
            'AI 신약개발 플랫폼 후보물질 발굴 10배 가속',
            '비만 치료제 임상 1상 부작용 없이 통과',
            'WHO 필수의약품 목록 등재 확정',
            '미국 병원 체인 300곳 바이오시밀러 독점 공급',
            '세포유전자치료제 CMO 수주 2조 돌파',
            '국내 첫 ADC 항암제 임상 진입 성공',
            '중동 국부펀드 바이오 부문 1조 전략 투자',
            '유전자가위 기술 네이처 논문 게재, 세계 주목',
            '바이오시밀러 유럽 매출 분기 역대 최고치 경신',
            '코스닥 제약주 최초 시총 10조 돌파'
        ],
        negative: [
            'FDA 임상 3상 실패 — 신약 개발 전면 중단',
            '주력 항암제 심각한 부작용 보고, 판매 즉시 중지',
            '식약처, 불법 임상시험 의혹 조사 착수',
            '바이오시밀러 특허 분쟁 패소 — 유럽 판매 금지',
            '임상 참여 환자 사망 사고 조사 개시',
            '대표이사 임상 데이터 조작 혐의 구속',
            '핵심 파이프라인 임상 2상 조기 종료',
            '생산 공장 GMP 적합성 조사 행정처분',
            '주요 투자자 전량 매도 — 지분 구조 급변',
            '미국 CMS 의약품 가격 인하 정책 직격탄',
            '복지부, 보험 급여 삭제 결정 — 매출 60% 증발',
            '중국산 바이오시밀러 저가 공세로 유럽 수주 잠식',
            '창업 멤버 특허 귀속 분쟁으로 법정 공방',
            'CMO 공장 오염 사고로 배치 전량 폐기',
            '희귀질환 치료제 보험 등재 거부 결정',
            '핵심 연구 특허 무효 심판 청구 인용',
            '임상 데이터 위조 의혹 내부 제보자 등장',
            '글로벌 파트너사 계약 해지 통보 수령',
            '바이오 버블 경고로 투자 심리 급속 냉각',
            '경쟁사 오리지널 약 특허 만료 연장 — 시장 진입 차질'
        ]
    },
    '2차전지': {
        positive: [
            '테슬라, 배터리 10년 독점 공급 계약 50조 체결',
            '전고체 배터리 상용화 성공 — 세계 최초 양산 개시',
            '미국 IRA 보조금 수혜 확정 — 연 1조 이상 수령',
            '포드·GM 동시 배터리 공급사로 선정',
            '급속충전 10분 완충 기술 특허 등록',
            '에너지 밀도 세계 최고치 경신 발표',
            '사우디 아람코와 ESS 배터리 공급 5조 계약',
            '유럽 배터리법 최우수 등급 인증 획득',
            '리튬 광산 지분 51% 인수 — 원재료 자급 기반 마련',
            '나트륨이온 배터리 양산 돌입, 원가 40% 절감',
            '현대차 전기차 전 모델 배터리 단독 공급 확정',
            '항공용 배터리 에어버스와 공동개발 MOU',
            '2분기 영업이익 사상 첫 2조 돌파',
            '중국 CATL 특허 침해 소송 완승',
            '미국 켄터키 공장 가동 개시 — 현지 생산 본격화',
            '드론·로봇용 고출력 배터리 시장 점유율 1위',
            '차세대 음극재 독자 개발 성공, 수명 3배 연장',
            '탄소중립 평가 업계 최고 AAA 등급 획득',
            '인도 최대 전기차 타타모터스 배터리 공급 계약',
            '배터리 재활용 플랫폼 유럽 법인 설립'
        ],
        negative: [
            '배터리 화재로 아파트 지하주차장 대규모 피해 발생',
            '미국 IRA 요건 미충족 — 보조금 자격 박탈',
            '중국산 저가 배터리 공세로 수주 경쟁 악화',
            '리튬 가격 60% 폭락으로 재고자산 손상 처리',
            '공장 화재로 생산 중단 — 보험금 분쟁 예고',
            '포드, 전기차 수요 부진으로 배터리 발주 대폭 축소',
            '전고체 배터리 양산 일정 2년 추가 연기 발표',
            '환경부, 공장 토양·지하수 오염 조사 착수',
            '대규모 배터리 리콜 — 결함 원인 화학적 폭발',
            '주요 고객사 테슬라 자체 생산 전환 선언',
            '중국 CATL, 핵심 특허 무효 소송 전면 제기',
            '직원 4000명 구조조정 발표 — 노사 갈등 격화',
            '2분기 영업손실 전환, 가이던스 전면 수정',
            '원자재 선물 계약 손실로 수천억 파생 손실',
            '미국 공장 건설 비용 초과로 자금 조달 비상',
            'EU 배터리 법 강화로 재활용 의무 비용 폭증',
            '핵심 기술 중국 업체에 유출 전직 직원 구속',
            '과잉 공급으로 배터리 평균판가 30% 하락',
            '납품 불량 제품 대규모 발견, 리콜 비용 1조',
            '코발트 공급망 차질로 생산 라인 가동 중단'
        ]
    },
    '로봇': {
        positive: [
            '현대차 로보틱스, 보스턴다이나믹스 인수 후 매출 첫 흑자 전환',
            '삼성전자 협동로봇 글로벌 시장 점유율 1위 등극',
            '로봇 배송 서비스 전국 100개 도시 동시 출시',
            '테슬라 옵티머스 핵심 부품 독점 공급사 선정',
            '미 국방부 전투지원 로봇 5000억 수주 확정',
            '일본 소프트뱅크, 국내 로봇 기업 1조 전략 투자',
            '의료 수술 로봇 FDA 허가 취득 — 세계 시장 진출',
            '물류 자동화 로봇 쿠팡·CJ 동시 대규모 수주',
            '로봇 관절 핵심 부품 국산화 성공 — 원가 35% 절감',
            '반도체 클린룸 로봇 TSMC 단독 공급 계약 체결',
            '농업용 자율주행 로봇 정부 스마트팜 전국 보급 선정',
            '건설 현장 자동화 로봇 대형 건설사 5곳 동시 계약',
            '로봇 소프트웨어 플랫폼 글로벌 표준 채택 확정',
            '노인 돌봄 로봇 공공기관 전국 2만 대 보급 사업 선정',
            '2분기 로봇 수출액 사상 최고치 경신',
            '유럽 제조업 자동화 수요 폭증 — 대규모 수주',
            '로봇 AI 융합 솔루션 엔비디아와 공동개발 MOU',
            '중동 스마트 시티 로봇 인프라 구축 2조 수주',
            '인간형 로봇 양산 개시 — 글로벌 언론 집중 조명',
            '국내 로봇 스타트업 나스닥 상장 성공'
        ],
        negative: [
            '로봇 오작동으로 공장 작업자 중상 — 안전 규제 강화',
            '중국 저가 로봇 공세로 국내 시장 점유율 급락',
            '핵심 구동 모터 일본 수출 규제 전격 적용',
            '로봇 대량 보급에 노동계 총파업 압박 — 정부 중재',
            'AI 로봇 개인정보 수집 논란 — 개인정보위 조사 착수',
            '배터리 결함으로 로봇 자연 발화 사고 잇따라',
            '글로벌 경기 침체로 제조업 자동화 투자 급감',
            '핵심 특허 미국 기업에 무효 판결 — 기술 우위 상실',
            '로봇 시스템 해킹으로 생산 라인 전면 마비 48시간',
            '과대 광고 혐의로 공정위 조사 및 과징금 부과',
            '3분기 수주 잔고 급감 — 실적 전망 대폭 하향',
            '소프트웨어 오류로 납품 로봇 전량 리콜 결정',
            '핵심 연구 인력 경쟁사로 집단 이탈',
            'EU 로봇 안전 기준 강화로 유럽 수출 전면 중단',
            '미국 ITC 특허 침해 수입 금지 예비 판결',
            '대규모 시설투자 실패로 감가상각 부담 급증',
            '테슬라 자체 로봇 생산 전환 — 공급 계약 해지',
            '로봇 부품 공급망 차질로 납기 6개월 지연',
            '경쟁사 압도적 신제품 출시로 수주 경쟁력 급락',
            '로봇 윤리 규제법 국회 통과 — 사업 모델 직격탄'
        ]
    },
    '우주항공': {
        positive: [
            '누리호 3차 발사 성공 — 상업 위성 궤도 안착',
            'NASA 달 탐사 부품 1조 규모 수주',
            '스페이스X와 공동 위성 발사 서비스 계약 체결',
            '군 정찰위성 2호기 발사 성공',
            '차세대 엔진 연소 시험 성공 — 추력 세계 3위',
            '방사청 국산 무인기 3000억 양산 사업 선정',
            '아랍에미리트 위성 3기 발사 수주 계약 체결',
            '우주 쓰레기 제거 기술 특허 등록 — 업계 최초',
            '초소형 SAR 위성 군집 발사 성공',
            '미 공군 항공기 MRO 5년 장기 계약 수주',
            '달 자원 탐사 국제 컨소시엄 주관사 선정',
            '수직이착륙 비행체(eVTOL) 형식 증명 취득',
            '한국형 GPS 항법위성 4기 발사 성공',
            '도심항공교통(UAM) 상업 운항 시범 허가 취득',
            '초음속 여객기 공동개발 보잉과 MOU 체결',
            '방산 수출 규모 역대 최초 5조 돌파',
            '달 착륙선 핵심 부품 NASA 공식 공급사 선정',
            '우주 인터넷 서비스 정지궤도 위성 발사 성공',
            '민간 우주정거장 건설 컨소시엄 참여 확정',
            '인공위성 보험료 사상 최저 갱신 — 신뢰성 공인'
        ],
        negative: [
            '발사체 3단 분리 실패 — 위성 궤도 진입 불발',
            '미 국무부, 항공 부품 수출 허가 갑작스럽게 취소',
            '핵심 엔진 설계 결함 발견 — 전면 재설계 착수',
            '방산 비리 연루 임원 구속, 계약 취소 위기',
            '러시아 제재로 소유즈 협력 사업 전면 중단',
            '드론 격추 사고로 인명 피해 — 결함 논란 폭발',
            '납품 기한 2년 연속 미달로 방사청 계약 해지',
            '우주발사체 폭발 사고 — 발사대 설비 전파',
            '핵심 인재 스페이스X로 대거 이직',
            '위성 통신 기술 중국 유출 의혹 수사',
            '국산 전투기 엔진 내구성 결함 리콜 결정',
            '미국 ITAR 규정 위반 — 수출 면허 취소 위기',
            '위성 충돌 사고로 궤도 파편 생성 — 국제 항의',
            '예산 삭감으로 달 탐사 2030 계획 전면 취소',
            '대형 발사 실패로 보험금 청구 — 신뢰도 타격',
            '차기 발사체 개발 비용 2배 초과, 국감 소환',
            '초음속 시제기 시험비행 중 추락 사고',
            '스타링크 저궤도 위성 선점으로 시장 잠식',
            '항공 MRO 정비 불량으로 항공기 결함 논란',
            '우주산업 펀드 버블 경고 — 기관 투자자 대거 이탈'
        ]
    }
};

// ════════════════════════════════════════
// 공통 유틸
// ════════════════════════════════════════

function makeChartOptions() {
    return {
        responsive: true,
        animation: false,
        interaction: { mode: 'index', intersect: false },
        plugins: { legend: { labels: { color: '#374151', font: { size: 13 } } } },
        scales: {
            x: { ticks: { color: '#9ca3af', maxTicksLimit: 10 }, grid: { color: '#f3f4f6' } },
            y: { ticks: { color: '#9ca3af', callback: v => v.toLocaleString() + '원' }, grid: { color: '#f3f4f6' } }
        }
    };
}

function makeDatasets() {
    return INDUSTRIES.map(n => ({
        label: n,
        data: [],
        borderColor: COLORS[n],
        backgroundColor: 'transparent',
        borderWidth: 2.5,
        tension: 0.5,
        pointRadius: 0
    }));
}

// ════════════════════════════════════════
// 가격 상태 (마스터 전용)
// ════════════════════════════════════════

const prices    = { ...INITIAL };
const history   = Object.fromEntries(INDUSTRIES.map(n => [n, []]));
const times     = [];
const prevRates = {};
const momentum  = {};
let lastNewsObj = null;

// ════════════════════════════════════════
// BroadcastChannel
// ════════════════════════════════════════

const bc = new BroadcastChannel('facepay_stocks');

// ════════════════════════════════════════
// 토스트
// ════════════════════════════════════════

const toastEl  = document.getElementById('toast');
let toastTimer = null;

function showToast(text, type) {
    toastEl.innerText = text;
    toastEl.className = `toast ${type} show`;
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove('show'), 6000);
}

// ════════════════════════════════════════
// 화면 분기 — 반드시 DOM 준비 후 실행
// ════════════════════════════════════════

const isChart = window.location.pathname.includes('index_2');

window.addEventListener('DOMContentLoaded', () => {
    if (isChart) {
        initChartView();
    } else {
        initTradingView();
        buildHistory();
        startEngine();
    }
});

// ════════════════════════════════════════
// 가격 엔진 (마스터)
// ════════════════════════════════════════

// s: 자정 이후 초, silent: true면 토스트 미출력
function applyTick(s, silent) {
    times.push(secondToTimeStr(s));
    if (times.length > 120) times.shift();

    // ── 1. 개별 레이트 (±3.5%, 결정론적) ──
    const rawRates = {};
    for (let i = 0; i < INDUSTRIES.length; i++) {
        rawRates[INDUSTRIES[i]] = seededRand(s, i) * 0.07 - 0.035;
    }

    // ── 2. 산업 간 상관관계 반영 ──
    for (const n of INDUSTRIES) {
        if (!CORR[n]) continue;
        for (const [peer, w] of Object.entries(CORR[n])) rawRates[n] += rawRates[peer] * w;
    }

    // ── 3. 모멘텀 + 스무딩 + 가격 클램핑 ──
    for (const n of INDUSTRIES) {
        const lo = Math.round(INITIAL[n] * 0.5);
        const hi = Math.round(INITIAL[n] * 2);

        let rate = rawRates[n];
        if (momentum[n]) {
            rate += momentum[n].dir * 0.012;
            if (--momentum[n].ticks <= 0) delete momentum[n];
        }

        prevRates[n] = (prevRates[n] || 0) * 0.65 + rate * 0.35;
        prices[n]    = Math.min(hi, Math.max(lo, Math.round(prices[n] * (1 + prevRates[n]))));
        history[n].push(prices[n]);
        if (history[n].length > 120) history[n].shift();
    }

    // ── 4. 뉴스 이벤트 (10초마다) ──
    if (s > 0 && s % 10 === 0) {
        const ni     = Math.floor(seededRand(s, 6) * INDUSTRIES.length);
        const name   = INDUSTRIES[ni];
        const isPos  = seededRand(s, 7) > 0.5;
        const ti     = Math.floor(seededRand(s, 8) * 20);
        const text   = NEWS_DB[name][isPos ? 'positive' : 'negative'][ti];
        const change = Math.round(prices[name] * (seededRand(s, 9) * 0.12 + 0.05));
        const nlo    = Math.round(INITIAL[name] * 0.5);
        const nhi    = Math.round(INITIAL[name] * 2);

        if (isPos) prices[name] = Math.min(nhi, prices[name] + change);
        else       prices[name] = Math.max(nlo, prices[name] - change);
        history[name][history[name].length - 1] = prices[name];

        momentum[name] = { dir: isPos ? 1 : -1, ticks: 3 + Math.floor(seededRand(s, 10) * 3) };

        lastNewsObj = { id: s, name, type: isPos ? 'positive' : 'negative', text, change };
        if (!silent) {
            showToast(
                `${isPos ? '📢 호재' : '📢 악재'} [${name}] ${text}  (${isPos ? '+' : '-'}${change.toLocaleString()}원)`,
                isPos ? 'positive' : 'negative'
            );
        }
    }

    // ── 5. 블랙스완 (평균 25초마다, 확률적) ──
    if (s > 0 && seededRand(s, 11) < 0.04) {
        const ni    = Math.floor(seededRand(s, 12) * INDUSTRIES.length);
        const name  = INDUSTRIES[ni];
        const isPos = seededRand(s, 13) > 0.5;
        const shock = Math.round(prices[name] * (0.08 + seededRand(s, 14) * 0.07));
        const nlo   = Math.round(INITIAL[name] * 0.5);
        const nhi   = Math.round(INITIAL[name] * 2);

        if (isPos) prices[name] = Math.min(nhi, prices[name] + shock);
        else       prices[name] = Math.max(nlo, prices[name] - shock);
        history[name][history[name].length - 1] = prices[name];

        momentum[name] = { dir: isPos ? 1 : -1, ticks: 5 };
        if (!silent) {
            showToast(
                `⚡ 블랙스완 [${name}] ${isPos ? '급등' : '급락'}!  (${isPos ? '+' : '-'}${shock.toLocaleString()}원)`,
                isPos ? 'positive' : 'negative'
            );
        }
    }
}

// 자정부터 현재까지 재현 — 어느 컴퓨터에서 열어도 같은 그래프
function buildHistory() {
    const now    = new Date();
    const nowSec = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();

    INDUSTRIES.forEach(n => { prices[n] = INITIAL[n]; history[n] = []; });
    Object.keys(prevRates).forEach(k => delete prevRates[k]);
    Object.keys(momentum).forEach(k => delete momentum[k]);
    times.length = 0;

    for (let s = 0; s <= nowSec; s++) applyTick(s, true);

    return nowSec;
}

function startEngine() {
    const now = new Date();
    let currentSecond = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();

    setInterval(() => {
        currentSecond++;
        applyTick(currentSecond, false);

        bc.postMessage({
            prices:  { ...prices },
            history: Object.fromEntries(INDUSTRIES.map(n => [n, [...history[n]]])),
            times:   [...times],
            news:    lastNewsObj
        });

        if (typeof _updateTradeUI === 'function') _updateTradeUI();
    }, 1000);
}

// ════════════════════════════════════════
// 거래 화면 초기화
// ════════════════════════════════════════

function initTradingView() {

    // ── 차트 ──
    const tradeChart = new Chart(
        document.getElementById('chartTrade').getContext('2d'),
        { type: 'line', data: { labels: [], datasets: makeDatasets() }, options: makeChartOptions() }
    );

    // ── 버튼 ──
    const btnRow  = document.getElementById('btnRow');
    const buttons = {};

    INDUSTRIES.forEach(name => {
        const btn = document.createElement('button');
        btn.className = 'industry-btn';
        btn.style.setProperty('--accent', COLORS[name]);
        btn.innerHTML = `
            <span class="btn-name">${name}</span>
            <span class="btn-price" id="bp-${name}">${INITIAL[name].toLocaleString()}원</span>
            <span class="btn-tag"   id="bt-${name}"></span>
        `;
        btn.addEventListener('click', () => handleClick(name));
        btnRow.appendChild(btn);
        buttons[name] = btn;
    });

    // ── 거래 상태 ──
    let selected = null;
    let holdings = {};

    const statusEl    = document.getElementById('status');
    const modal       = document.getElementById('modal');
    const modalContent = document.getElementById('modalContent');

    function handleClick(name) {
        if (holdings[name]) { doSell(name); return; }
        selected = (selected === name) ? null : name;
        renderButtons();
        updateStatus();
    }

    function doBuy(name) {
        holdings[name] = { buyPrice: prices[name] };
        selected = null;
        renderButtons();
        updateStatus();
    }

    function doSell(name) {
        const h = holdings[name];
        if (!h) return;
        const sell   = prices[name];
        const profit = Math.round(((sell - h.buyPrice) / h.buyPrice) * 100);
        delete holdings[name];
        selected = null;
        renderButtons();
        updateStatus();
        showModal(name, h.buyPrice, sell, profit);
    }

    function updateStatus() {
        const held = Object.keys(holdings);
        if (selected && !holdings[selected]) {
            statusEl.innerText   = `${selected} 선택됨 — SPACE 로 매수`;
            statusEl.style.color = COLORS[selected];
        } else if (held.length > 0) {
            statusEl.innerText   = `보유 중: ${held.join(', ')} — 버튼 클릭 or SPACE 로 매도`;
            statusEl.style.color = '#374151';
        } else {
            statusEl.innerText   = '산업 버튼을 클릭하고 SPACE 로 매수하세요';
            statusEl.style.color = '#6b7280';
        }
    }

    function renderButtons() {
        INDUSTRIES.forEach(name => {
            const btn = buttons[name];
            const tag = document.getElementById(`bt-${name}`);
            btn.classList.remove('selected', 'holding');
            tag.innerText = '';

            if (holdings[name]) {
                btn.classList.add('holding');
                const pct  = Math.round(((prices[name] - holdings[name].buyPrice) / holdings[name].buyPrice) * 100);
                tag.innerText   = (pct >= 0 ? '+' : '') + pct + '%';
                tag.style.color = pct >= 0 ? '#16a34a' : '#dc2626';
            } else if (selected === name) {
                btn.classList.add('selected');
                tag.innerText = '선택됨';
            }
        });
    }

    function showModal(name, buy, sell, profit) {
        const sign  = profit >= 0 ? '+' : '';
        const color = profit >= 0 ? '#16a34a' : '#dc2626';
        modalContent.innerHTML = `
            <div class="modal-industry" style="color:${COLORS[name]}">${name}</div>
            <div class="modal-row">매수가&nbsp;<b>${buy.toLocaleString()}원</b></div>
            <div class="modal-row">매도가&nbsp;<b>${sell.toLocaleString()}원</b></div>
            <div class="modal-profit" style="color:${color}">${sign}${profit}%</div>
        `;
        modal.style.display = 'flex';
    }

    // 엔진에서 호출할 UI 업데이트 함수 등록
    window._updateTradeUI = function () {
        tradeChart.data.labels = [...times];
        INDUSTRIES.forEach((n, i) => { tradeChart.data.datasets[i].data = [...history[n]]; });
        tradeChart.update();

        INDUSTRIES.forEach(n => {
            const el = document.getElementById(`bp-${n}`);
            if (el) el.innerText = prices[n].toLocaleString() + '원';
        });

        renderButtons();
    };

    // 키보드
    document.addEventListener('keydown', e => {
        if (e.code === 'Space') {
            e.preventDefault();
            if (modal.style.display !== 'none') return;
            if (selected && !holdings[selected])      doBuy(selected);
            else if (selected && holdings[selected])  doSell(selected);
            else {
                const held = Object.keys(holdings);
                if (held.length === 1) { selected = held[0]; doSell(selected); }
            }
        }
        if (e.code === 'Escape') {
            if (modal.style.display !== 'none') {
                modal.style.display = 'none';
            } else {
                selected = null;
                renderButtons();
                updateStatus();
            }
        }
    });

    updateStatus();
}

// ════════════════════════════════════════
// 차트 전용 화면 초기화
// ════════════════════════════════════════

function initChartView() {

    // ── 차트 ──
    const onlyChart = new Chart(
        document.getElementById('chartOnly').getContext('2d'),
        { type: 'line', data: { labels: [], datasets: makeDatasets() }, options: makeChartOptions() }
    );


    // ── 마스터 연결 대기 안내 ──
    const statusMsg = document.getElementById('chartStatus');
    let receivedData = false;
    setTimeout(() => {
        if (!receivedData) statusMsg.innerText = '⚠️ index_1.html 을 먼저 열어주세요';
    }, 3000);

    // ── 마스터로부터 수신 ──
    let lastNewsId = 0;

    bc.onmessage = (e) => {
        receivedData = true;
        statusMsg.innerText = '';

        const { prices: p, history: h, times: t, news: n } = e.data;

        onlyChart.data.labels = t;
        INDUSTRIES.forEach((name, i) => { onlyChart.data.datasets[i].data = h[name]; });
        onlyChart.update();

        if (n && n.id !== lastNewsId) {
            lastNewsId = n.id;
            showToast(
                `${n.type === 'positive' ? '📢 호재' : '📢 악재'} [${n.name}] ${n.text}`,
                n.type
            );
        }
    };
}
