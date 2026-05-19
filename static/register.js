const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const status = document.getElementById('status');
const captureBtn = document.getElementById('captureBtn');

let capturing = false;

navigator.mediaDevices.getUserMedia({ video: true })
    .then(stream => {
        video.srcObject = stream;
        captureBtn.disabled = false;
        status.innerText = '카메라 준비 완료 — 버튼을 눌러 등록하세요';
    })
    .catch(() => {
        status.innerText = '카메라 접근 실패';
    });

captureBtn.addEventListener('click', () => {
    if (capturing) return;
    capturing = true;
    captureBtn.disabled = true;

    const images = [];
    let count = 0;
    const total = 30;

    status.innerText = `캡처중... (0 / ${total})`;

    const interval = setInterval(() => {
        ctx.drawImage(video, 0, 0, 640, 480);
        images.push(canvas.toDataURL('image/jpeg', 0.85));
        count++;
        status.innerText = `캡처중... (${count} / ${total})`;

        if (count >= total) {
            clearInterval(interval);
            upload(images);
        }
    }, 150);
});

function upload(images) {
    status.innerText = '서버로 전송중...';

    fetch('/register_face', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ images })
    })
    .then(r => r.json())
    .then(data => {
        if (data.success) {
            status.innerText = '✅ ' + data.msg;
            alert('얼굴 등록 완료!\nPC B에서 주식 매수를 시작하세요.');
        } else {
            status.innerText = '❌ ' + data.msg;
            captureBtn.disabled = false;
            capturing = false;
        }
    });
}
