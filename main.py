from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import cv2
import torch
import numpy as np
from ultralytics import YOLO
import os

app = Flask(__name__)
CORS(app)

# Tải mô hình YOLO
model = YOLO("best.pt")

# Danh sách các class
SELECTED_CLASSES = {
    0: "Nguoi",
    1: "Tai",
    2: "Bit tai",
    4: "Bao ve mat",
    5: "Mat na",
    8: "Kinh",
    9: "Gang tay",
    10: "Mu bao ho",
    14: "Giay",
    15: "Do bao ho",
    16: "Ao bao ho",
}

REQUIRED_PPE = {"Mu bao ho", "Giay", "Do bao ho", "Ao bao ho", "Gang tay"}

@app.route('/detect', methods=['POST'])
def detect_ppe():
    if 'image' not in request.files:
        return jsonify({'error': 'No file uploaded'}), 400

    image_file = request.files['image']
    image_np = cv2.imdecode(np.frombuffer(image_file.read(), np.uint8), cv2.IMREAD_COLOR)

    # Dự đoán với YOLO
    results = model(image_np, conf=0.25, iou=0.35)[0]

    detected_classes = set()
    detections = []

    # Vẽ bounding box lên hình ảnh
    for box in results.boxes.data:
        x1, y1, x2, y2, score, class_id = map(float, box)
        class_id = int(class_id)
        if class_id in SELECTED_CLASSES:
            class_name = SELECTED_CLASSES[class_id]
            detected_classes.add(class_name)
            detections.append({
                "class_name": class_name,
                "score": score,
                "bbox": [int(x1), int(y1), int(x2), int(y2)]
            })
            cv2.rectangle(image_np, (int(x1), int(y1)), (int(x2), int(y2)), (0, 255, 0), 2)
            cv2.putText(image_np, class_name, (int(x1), int(y1) - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 0), 2)

    # Kiểm tra thiếu PPE
    missing_ppe = REQUIRED_PPE - detected_classes

    # Lưu hình ảnh kết quả
    output_path = "output.jpg"
    cv2.imwrite(output_path, image_np)

    return jsonify({
        "detections": detections,
        "missing_ppe": list(missing_ppe),
        "image_url": "/output.jpg"
    })

@app.route('/output.jpg')
def get_output_image():
    return send_file("output.jpg", mimetype='image/jpeg')

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5001, debug=True)
