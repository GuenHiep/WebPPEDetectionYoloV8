import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";

export default function Detection() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [outputImage, setOutputImage] = useState(null);
  const [detections, setDetections] = useState([]);
  const [missingPPE, setMissingPPE] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      alert("Vui lòng chọn một tệp hình ảnh!");
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append("image", selectedFile);

    try {
      const response = await fetch("http://localhost:5001/detect", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setOutputImage("http://localhost:5001" + data.image_url);
        setDetections(data.detections);
        setMissingPPE(data.missing_ppe);
      } else {
        alert("Lỗi: " + data.error);
      }
    } catch (error) {
      console.error("Lỗi khi gửi ảnh:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-4">
      <h1 className="mb-4">Detection Page</h1>

      <div className="mb-3">
        <input type="file" accept="image/*" onChange={handleFileChange} className="form-control mb-2" />
        <button className="btn btn-success" onClick={handleUpload} disabled={loading}>
          {loading ? "Đang xử lý..." : "Tải lên và xử lý"}
        </button>
      </div>

      {outputImage && (
        <div>
          <h2 className="mt-4">Kết quả:</h2>
          <div className="row mt-3">
            {/* Cột trái: hình ảnh */}
            <div className="col-md-5">
              <img
                src={outputImage}
                alt="Kết quả xử lý"
                style={{ width: "100%", border: "1px solid #ccc", borderRadius: "5px" }}
              />
            </div>

            {/* Cột phải: detections + thiếu PPE */}
            <div className="col-md-7">
              <div className="row">
                <div className="col-md-6">
                  <h4>🔍 Detections:</h4>
                  <ul>
                    {detections.map((item, index) => (
                      <li key={index}>
                        {item.class_name} - Score: {item.score.toFixed(2)}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="col-md-6">
                  {missingPPE.length > 0 ? (
                    <div>
                      <h4 className="text-danger">⚠️ Thiếu các đồ bảo hộ:</h4>
                      <ul>
                        {missingPPE.map((item, index) => (
                          <li key={index}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  ) : (
                    <p className="text-success mt-4">✔️ Đã đầy đủ thiết bị bảo hộ</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
