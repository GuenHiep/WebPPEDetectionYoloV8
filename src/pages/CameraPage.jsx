import React, { useRef, useEffect, useState } from 'react';

function CameraPage() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [missingPPE, setMissingPPE] = useState([]);
  const [detections, setDetections] = useState([]);
  const [isDetecting, setIsDetecting] = useState(true);

  useEffect(() => {
    const getCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        videoRef.current.srcObject = stream;
      } catch (err) {
        console.error('Không thể mở camera:', err);
      }
    };
    getCamera();
  }, []);

  useEffect(() => {
    if (isDetecting) {
      startDetectionLoop();
    }

    return () => {
      setIsDetecting(false);
    };
  }, [isDetecting]);

  const drawBoundingBoxes = (detections) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    detections.forEach((det) => {
      const [x1, y1, x2, y2] = det.bbox;
      ctx.strokeStyle = 'lime';
      ctx.lineWidth = 2;
      ctx.strokeRect(x1, y1, x2 - x1, y2 - y1);
      ctx.fillStyle = 'black';
      ctx.font = '14px Arial';
      ctx.fillText(det.class_name, x1, y1 > 10 ? y1 - 5 : y1 + 15);
    });
  };

  const startDetectionLoop = () => {
    const canvasTemp = document.createElement('canvas');
    const ctxTemp = canvasTemp.getContext('2d');

    const detect = async () => {
      if (!isDetecting) return;

      const video = videoRef.current;
      canvasTemp.width = video.videoWidth;
      canvasTemp.height = video.videoHeight;
      ctxTemp.drawImage(video, 0, 0, canvasTemp.width, canvasTemp.height);

      const blob = await new Promise((res) => canvasTemp.toBlob(res, 'image/jpeg'));
      const formData = new FormData();
      formData.append('image', blob);

      try {
        const response = await fetch('http://localhost:5001/detect', {
          method: 'POST',
          body: formData,
        });
        const data = await response.json();

        if (response.ok) {
          setDetections(data.detections);
          setMissingPPE(data.missing_ppe);
          drawBoundingBoxes(data.detections);
        } else {
          console.error('Lỗi phản hồi:', data.error);
        }
      } catch (err) {
        console.error('Lỗi khi gửi ảnh:', err);
      }

      setTimeout(detect, 1000);
    };

    detect();
  };

  return (
    <div style={{ display: 'flex', padding: '20px' }}>
      {/* Cột trái: Camera */}
      <div style={{ position: 'relative', width: 640, height: 480, marginRight: '30px' }}>
        <video
          ref={videoRef}
          width="640"
          height="480"
          autoPlay
          muted
          style={{ position: 'absolute', top: 0, left: 0 }}
        />
        <canvas
          ref={canvasRef}
          width="640"
          height="480"
          style={{ position: 'absolute', top: 0, left: 0 }}
        />
      </div>

      {/* Cột phải: Kết quả nhận diện */}
      <div>
        <h3>🚨 Thiếu các đồ bảo hộ:</h3>
        {missingPPE.length > 0 ? (
          <ul>
            {missingPPE.map((item, index) => (
              <li key={index} style={{ color: 'red', fontWeight: 'bold' }}>{item}</li>
            ))}
          </ul>
        ) : (
          <p style={{ color: 'green' }}>✔️ Đã đầy đủ thiết bị bảo hộ</p>
        )}

        <h4 style={{ marginTop: '20px' }}>🔍 Chi tiết nhận diện:</h4>
        <ul>
          {detections.map((item, index) => (
            <li key={index}>
              {item.class_name} – Score: {(item.score * 100).toFixed(1)}%
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default CameraPage;
