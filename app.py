from flask import Flask, render_template, request, jsonify, redirect
import cv2
import numpy as np
import os
import base64

app = Flask(__name__)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
CASCADE_PATH = os.path.join(BASE_DIR, 'haarcascade_frontalface_default.xml')
MODEL_PATH = os.path.join(BASE_DIR, 'face_model.yml')

face_cascade = cv2.CascadeClassifier(CASCADE_PATH)

STOCKS = {
    "FACE_TECH": 1000,
    "AI_BANK": 1200,
    "META_PAY": 900,
    "SMART_COIN": 1500,
    "FIN_AI": 1300
}

try:
    cv2.face.LBPHFaceRecognizer_create()
    LBPH_OK = True
except AttributeError:
    LBPH_OK = False


def decode_image(b64_str):
    img_data = base64.b64decode(b64_str.split(',')[1])
    arr = np.frombuffer(img_data, np.uint8)
    return cv2.imdecode(arr, cv2.IMREAD_COLOR)


def extract_face(frame):
    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
    faces = face_cascade.detectMultiScale(gray, 1.1, 5, minSize=(60, 60))
    if len(faces) == 0:
        return None
    x, y, w, h = faces[0]
    face = gray[y:y+h, x:x+w]
    return cv2.resize(face, (200, 200))


# =========================
# PC A - 얼굴 등록
# =========================

@app.route('/register')
def register():
    return render_template('register.html')


@app.route('/register_face', methods=['POST'])
def register_face():
    if not LBPH_OK:
        return jsonify({'success': False, 'msg': 'opencv-contrib-python 설치 필요'})

    images_b64 = request.json.get('images', [])
    faces = []

    for b64 in images_b64:
        frame = decode_image(b64)
        face = extract_face(frame)
        if face is not None:
            faces.append(face)

    if len(faces) < 5:
        return jsonify({'success': False, 'msg': f'얼굴 {len(faces)}장 감지 - 최소 5장 필요, 다시 시도하세요'})

    recognizer = cv2.face.LBPHFaceRecognizer_create()
    labels = np.zeros(len(faces), dtype=np.int32)
    recognizer.train(faces, labels)
    recognizer.save(MODEL_PATH)

    return jsonify({'success': True, 'msg': f'등록 완료 ({len(faces)}장 학습)'})


# =========================
# PC B - 시작 + 인증
# =========================

@app.route('/')
def start():
    return render_template('start.html')


@app.route('/authenticate', methods=['POST'])
def authenticate():
    if not LBPH_OK:
        return jsonify({'success': False, 'msg': 'opencv-contrib-python 설치 필요'})

    if not os.path.exists(MODEL_PATH):
        return jsonify({'success': False, 'msg': 'PC A에서 먼저 얼굴을 등록하세요'})

    frame = decode_image(request.json.get('image', ''))
    face = extract_face(frame)

    if face is None:
        return jsonify({'success': False, 'msg': '얼굴이 감지되지 않았습니다'})

    recognizer = cv2.face.LBPHFaceRecognizer_create()
    recognizer.read(MODEL_PATH)
    _, confidence = recognizer.predict(face)

    if confidence < 85:
        return jsonify({'success': True, 'confidence': round(confidence, 1)})

    return jsonify({'success': False, 'msg': '인증 실패', 'confidence': round(confidence, 1)})


# =========================
# 주식 선택 + 거래
# =========================

@app.route('/select')
def select():
    return render_template('select.html', stocks=STOCKS)


@app.route('/trade/<stock>')
def trade(stock):
    price = STOCKS.get(stock)
    if price is None:
        return redirect('/')
    return render_template('trade.html', stock=stock, start_price=price)


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
