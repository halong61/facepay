// =========================
// 초기값 (trade.html data 속성에서 읽기)
// =========================

const tradeEl = document.getElementById('tradeData');
const START_PRICE = parseInt(tradeEl.dataset.price);
const STOCK_NAME = tradeEl.dataset.stock;

// =========================
// 상태 변수
// =========================

let currentPrice = START_PRICE;
let timer = 180;
let count = 1;

let bought = false;
let sold = false;
let buyPrice = 0;

let priceInterval;
let timerInterval;

// =========================
// 뉴스 데이터
// =========================

const positiveNews = [
    'AI 투자 유치 성공',
    '신기술 개발 성공',
    '글로벌 진출 성공',
    '실적 상승 발표',
    '대기업 계약 체결'
];

const negativeNews = [
    '개인정보 논란 발생',
    '서비스 오류 발생',
    '실적 감소 발표',
    '보안 문제 발생',
    '투자자 이탈'
];

// =========================
// DOM 요소
// =========================

const priceText  = document.getElementById('price');
const timerText  = document.getElementById('timer');
const profitText = document.getElementById('profit');

// =========================
// 차트 생성
// =========================

const ctx = document.getElementById('chart').getContext('2d');

const chart = new Chart(ctx, {
    type: 'line',
    data: {
        labels: [0],
        datasets: [{
            label: STOCK_NAME,
            data: [currentPrice],
            borderColor: '#d4af37',
            backgroundColor: 'rgba(212,175,55,0.15)',
            borderWidth: 3,
            tension: 0.3,
            pointRadius: 0,
            fill: true
        }]
    },
    options: {
        responsive: true,
        animation: false,
        plugins: {
            legend: { labels: { color: '#f0e6c8' } }
        },
        scales: {
            x: { ticks: { color: '#c9b07a' }, grid: { color: '#2d2a4a' } },
            y: { beginAtZero: false, ticks: { color: '#c9b07a' }, grid: { color: '#2d2a4a' } }
        }
    }
});

// =========================
// 차트 업데이트 함수
// =========================

function pushChart(price) {
    chart.data.labels.push(count);
    chart.data.datasets[0].data.push(price);
    chart.update();
    count++;
}

// =========================
// 타이머 포맷 (MM:SS)
// =========================

function formatTimer(s) {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${String(sec).padStart(2, '0')}`;
}

// =========================
// 매도 함수
// =========================

function sell() {
    if (!bought || sold) return;
    sold = true;
    clearInterval(priceInterval);

    const profit = Math.floor(((currentPrice - buyPrice) / buyPrice) * 100);
    const sign = profit >= 0 ? '+' : '';

    profitText.style.color = profit >= 0 ? '#22c55e' : '#ef4444';
    profitText.innerText = `수익률 ${sign}${profit}%`;

    alert(
        `💰 매도 완료!\n` +
        `매수가: ${buyPrice.toLocaleString()}원\n` +
        `매도가: ${currentPrice.toLocaleString()}원\n` +
        `수익률: ${sign}${profit}%`
    );
}

// =========================
// 자동 매수 (1초 후)
// =========================

setTimeout(() => {
    bought = true;
    buyPrice = currentPrice;
}, 1000);

// =========================
// 1초마다 ±5% 가격 변동
// =========================

priceInterval = setInterval(() => {
    if (sold) return;

    const rate = (Math.random() * 0.1) - 0.05;
    currentPrice = Math.round(currentPrice * (1 + rate));
    if (currentPrice < 100) currentPrice = 100;

    priceText.innerText = currentPrice.toLocaleString() + '원';
    pushChart(currentPrice);
}, 1000);

// =========================
// 10초마다 공시 alert (급등/급락)
// =========================

setInterval(() => {
    if (sold) return;

    const isPositive = Math.random() > 0.5;

    if (isPositive) {
        const news = positiveNews[Math.floor(Math.random() * positiveNews.length)];
        const spike = Math.floor(currentPrice * (Math.random() * 0.15 + 0.05));
        currentPrice += spike;
        alert(`📢 호재 공시!\n${news}\n\n주가 +${spike.toLocaleString()}원 급등!`);
    } else {
        const news = negativeNews[Math.floor(Math.random() * negativeNews.length)];
        const drop = Math.floor(currentPrice * (Math.random() * 0.15 + 0.05));
        currentPrice -= drop;
        if (currentPrice < 100) currentPrice = 100;
        alert(`📢 악재 공시!\n${news}\n\n주가 -${drop.toLocaleString()}원 급락!`);
    }

    priceText.innerText = currentPrice.toLocaleString() + '원';
    pushChart(currentPrice);
}, 10000);

// =========================
// 3분 타이머 (자동 매도)
// =========================

timerInterval = setInterval(() => {
    timer--;
    timerText.innerText = formatTimer(timer);

    if (timer <= 0) {
        clearInterval(timerInterval);
        if (!sold) {
            sell();
        }
        setTimeout(() => { location.href = '/'; }, 1500);
    }
}, 1000);

// =========================
// 키보드 입력
// =========================

document.addEventListener('keydown', (e) => {
    if (e.code === 'Space' && bought && !sold) {
        e.preventDefault();
        sell();
    }
    if (e.code === 'Escape') {
        location.href = '/';
    }
});
