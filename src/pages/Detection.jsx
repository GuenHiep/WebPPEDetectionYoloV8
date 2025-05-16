import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";

export default function Detection() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [outputImage, setOutputImage] = useState(null);
  const [detections, setDetections] = useState([]);
  const [missingPPE, setMissingPPE] = useState([]);
  const [loading, setLoading] = useState(false);

  // Hàm xử lý khi người dùng chọn tệp hình ảnh
  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  // Hàm xử lý khi người dùng nhấn nút tải lên
  const handleUpload = async () => {
    if (!selectedFile) {
      alert("Vui lòng chọn một tệp hình ảnh!");
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append("image", selectedFile);

    try {
      // Gửi yêu cầu POST tới server để tải lên và xử lý ảnh
      const response = await fetch("http://localhost:5001/detect", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        // Nếu phản hồi thành công, cập nhật ảnh đầu ra và các kết quả phát hiện
        setOutputImage("http://localhost:5001" + data.image_url);
        setDetections(data.detections);
        setMissingPPE(data.missing_ppe);
      } else {
        // Nếu có lỗi, hiển thị thông báo lỗi
        alert("Lỗi: " + data.error);
      }
    } catch (error) {
      console.error("Lỗi khi gửi ảnh:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>Detection Page</h1>

      {/* Input để chọn tệp hình ảnh */}
      <input type="file" accept="image/*" onChange={handleFileChange} />
      <button className="btn btn-success" onClick={handleUpload} disabled={loading}>
        {loading ? "Đang xử lý..." : "Tải lên và xử lý"}
      </button>

      {/* Hiển thị ảnh đầu ra nếu có */}
      {outputImage && (
        <div>
          <h2>Kết quả:</h2>
          <div className="d-flex justify-content-around">  
          <img
            src={outputImage}
            alt="Kết quả xử lý"
            style={{ maxWidth: "100%" }}
          />
          <div>
            <h3>Detections:</h3>
            <ul>
              {detections.map((item, index) => (
                <li key={index}>
                  {item.class_name} - Score: {item.score.toFixed(2)}
                </li>
              ))}
            </ul>
          </div>
          {missingPPE.length > 0 && (
            <div>
              <h3>Thiếu các đồ bảo hộ:</h3>
              <ul>
                {missingPPE.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </div>
          )}
          </div>
        </div>
      )}
    </div>
  );
}
