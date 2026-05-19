const startBox = document.getElementById('startBox');
const authBox = document.getElementById('authBox');
const startBtn = document.getElementById('startBtn');
const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const authEmoji = document.getElementById('authEmoji');
const authStatus = document.getElementById('authStatus');
const skipBtn = document.getElementById('skipBtn');

skipBtn.addEventListener('click', () => { location.href = '/select'; });

let authInterval = null;

startBtn.addEventListener('click', () => {
    alert('FacePay 결제를 진행합니다.');

    startBox.style.display = 'none';
    authBox.style.display = 'block';

    navigator.mediaDevices.getUserMedia({ video: true })
        .then(stream => {
            video.srcObject = stream;
            video.onloadedmetadata = () => startAuth(stream);
        })
        .catch(() => {
            authStatus.innerText = '카메라 접근 실패';
            skipBtn.style.display = 'block';
        });
});

function startAuth(stream) {
    let tries = 0;
    const maxTries = 20;

    authInterval = setInterval(() => {
        if (tries >= maxTries) {
            clearInterval(authInterval);
            stopCamera(stream);
            authStatus.innerText = '인증 실패 — 다시 시도하세요';
            setTimeout(() => {
                authBox.style.display = 'none';
                startBox.style.display = 'block';
            }, 2000);
            return;
        }

        ctx.drawImage(video, 0, 0, 640, 480);
        const image = canvas.toDataURL('image/jpeg', 0.85);
        tries++;

        fetch('/authenticate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ image })
        })
        .then(r => r.json())
        .then(data => {
            if (data.success) {
                clearInterval(authInterval);
                stopCamera(stream);
                authEmoji.innerText = '😁';
                authStatus.innerText = 'FacePay 인증 성공!';
                setTimeout(() => { location.href = '/select'; }, 1500);
            } else {
                authStatus.innerText = `인식중... (${tries} / ${maxTries})  ${data.msg || ''}`;
            }
        });
    }, 800);
}

function stopCamera(stream) {
    stream.getTracks().forEach(t => t.stop());
}
