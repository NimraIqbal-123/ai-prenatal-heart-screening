import React, { useEffect, useState } from "react";
import logo from "../assets/logo.png";
import "bootstrap/dist/css/bootstrap.min.css";
import jsPDF from "jspdf";
import { PieChart, Pie, Cell } from "recharts";
import History from "./History";
import bgImage from "../assets/back.jpg";
const UserDashboard = () => {
  const [image, setImage] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [history, setHistory] = useState([]);
  const [heatmap, setHeatmap] = useState(null);
  const [segmentation, setSegmentation] = useState(null);
  const [loading, setLoading] = useState(false);

  const [result, setResult] = useState({
    riskText: "",
    severityScore: "",
    riskValue: "",
    defectPercentage: "",
    location: "",
    recommendation: "",
    explanation: "",
  });

  const loadHistory = () => {
    const stored = JSON.parse(localStorage.getItem("predictionHistory")) || [];
    setHistory(stored);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImage(URL.createObjectURL(file));
      setSegmentation(null);
      setHeatmap(null);
      setResult({
        riskText: "",
        severityScore: "",
        riskValue: "",
        defectPercentage: "",
        location: "",
        recommendation: "",
        explanation: "",
      });
    }
  };

  const handlePredict = async () => {
    if (!imageFile) {
      alert("Please upload an image first");
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("image", imageFile);

      const response = await fetch("http://127.0.0.1:5000/predict", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (data.error) {
        alert("Error: " + data.error);
        setLoading(false);
        return;
      }

      const segmentationUrl = data.segmentation_overlay;
      const gradcamUrl = data.gradcam_overlay;

      setSegmentation(segmentationUrl);
      setHeatmap(gradcamUrl);

      const newResult = {
        riskText: data.risk_text,
        severityScore: data.severity_score,
        riskValue: data.risk_value,
        defectPercentage: data.defect_percentage,
        location: data.location,
        recommendation: data.recommendation,
        explanation: data.explanation,
      };

      setResult(newResult);

     const newPrediction = {
  id: Date.now(),
  patient: { ...patient } , // 🔥 ADD THIS LINE
  image,
  segmentation: segmentationUrl,
  heatmap: gradcamUrl,
  riskText: data.risk_text,
  severityScore: data.severity_score,
  riskValue: data.risk_value,
  defectPercentage: data.defect_percentage,
  location: data.location,
  recommendation: data.recommendation,
  explanation: data.explanation,
  date: new Date().toLocaleString(),
};


      const stored = JSON.parse(localStorage.getItem("predictionHistory")) || [];
stored.unshift(newPrediction);
      localStorage.setItem("predictionHistory", JSON.stringify(stored));
      loadHistory();
    } catch (error) {
      console.error(error);
      alert("Prediction failed. Check backend.");
    }

    setLoading(false);
  };

  const clearHistory = () => {
    if (window.confirm("Are you sure you want to delete history?")) {
      localStorage.removeItem("predictionHistory");
      setHistory([]);
    }
  };
const [patient, setPatient] = useState({
  name: "",
  age: "",
  gender: ""
});
useEffect(() => {
  loadHistory();

  // ✅ clear form on page load
  setPatient({
    name: "",
    age: "",
    gender: ""
  });

}, []);
const loadImageAsBase64 = (url) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "Anonymous"; // 🔥 important for CORS
    img.src = url;

    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;

      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0);

      const dataURL = canvas.toDataURL("image/png");
      resolve(dataURL);
    };

    img.onerror = (error) => reject(error);
  });
};
const downloadReport = async () => {
  if (!result.riskText) {
    alert("Please generate prediction first!");
    return;
  }

  const pdf = new jsPDF("p", "mm", "a4");

  // ===== LOAD LOGO =====
  let logoBase64 = null;
  try {
    logoBase64 = await loadImageAsBase64(logo);
  } catch {
    console.warn("Logo not loaded");
  }

  // ===== HEADER =====
  pdf.setFillColor(0, 102, 204);
  pdf.rect(0, 0, 210, 25, "F");

  if (logoBase64) {
    pdf.addImage(logoBase64, "PNG", 160, 5, 30, 15);
  }

  pdf.setFontSize(18);
  pdf.setTextColor(255, 255, 255);
  pdf.text("AI Prenatal Heart Screening Report", 10, 15);

  pdf.setFontSize(10);
  pdf.text("Hospital AI Diagnostic System", 10, 22);

  // ===== PATIENT INFO =====
  pdf.setFillColor(245, 245, 245);
  pdf.roundedRect(10, 30, 190, 30, 3, 3, "F");

  pdf.setTextColor(0);
  pdf.setFontSize(12);

  pdf.text(`Patient Name: ${patient.name || "N/A"}`, 15, 40);
  pdf.text(`Age: ${patient.age || "N/A"}`, 15, 47);
  pdf.text(`Gender: ${patient.gender || "N/A"}`, 15, 54);
  pdf.text(`Date: ${new Date().toLocaleString()}`, 120, 40);

  // ===== DIAGNOSIS =====
  pdf.setFontSize(14);
  pdf.setTextColor(0, 102, 204);
  pdf.text("Diagnosis Result", 10, 75);

  pdf.roundedRect(10, 80, 190, 45, 3, 3);

  pdf.setFontSize(12);

  pdf.setTextColor(result.riskText === "High Risk" ? 220 : 40, result.riskText === "High Risk" ? 53 : 167, result.riskText === "High Risk" ? 69 : 69);
  pdf.text(`Risk Level: ${result.riskText}`, 15, 90);

  pdf.setTextColor(0);
  pdf.text(`Severity Score: ${result.severityScore}`, 15, 98);
  pdf.text(`Risk Value: ${result.riskValue}`, 15, 106);
  pdf.text(`Defect Percentage: ${result.defectPercentage}%`, 15, 114);
  pdf.text(`Location: ${result.location}`, 15, 122);

  // ===== LOAD IMAGES =====
  let originalImg = null;
  let segImg = null;
  let heatImg = null;

  try {
    if (image) originalImg = await loadImageAsBase64(image);
    if (segmentation) segImg = await loadImageAsBase64(segmentation);
    if (heatmap) heatImg = await loadImageAsBase64(heatmap);
  } catch {
    console.warn("Image load failed");
  }

  // ===== VISUAL SECTION =====
  pdf.setFontSize(14);
  pdf.setTextColor(0, 102, 204);
  pdf.text("Visual Analysis", 10, 135);

  let y = 140;

  if (originalImg) {
    pdf.text("Original", 20, y);
    pdf.addImage(originalImg, "PNG", 15, y + 5, 55, 40);
    pdf.rect(15, y + 5, 55, 40);
  }

  if (segImg) {
    pdf.text("Segmentation", 85, y);
    pdf.addImage(segImg, "PNG", 80, y + 5, 55, 40);
    pdf.rect(80, y + 5, 55, 40);
  }

  if (heatImg) {
    pdf.text("Heatmap", 150, y);
    pdf.addImage(heatImg, "PNG", 145, y + 5, 50, 40);
    pdf.rect(145, y + 5, 50, 40);
  }

  let nextY = y + 55;

  // ===== RECOMMENDATION =====
  pdf.setFontSize(14);
  pdf.setTextColor(0, 102, 204);
  pdf.text("Recommendation", 10, nextY);

  pdf.roundedRect(10, nextY + 5, 190, 25, 3, 3);

  const recText = pdf.splitTextToSize(result.recommendation || "N/A", 180);
  pdf.setFontSize(11);
  pdf.setTextColor(0);
  pdf.text(recText, 15, nextY + 15);

  nextY += 40;

  // ===== EXPLANATION =====
  pdf.setFontSize(14);
  pdf.setTextColor(0, 102, 204);
  pdf.text("Explanation", 10, nextY);

  pdf.roundedRect(10, nextY + 5, 190, 30, 3, 3);

  const expText = pdf.splitTextToSize(result.explanation || "N/A", 180);
  pdf.setFontSize(11);
  pdf.text(expText, 15, nextY + 15);

  // ===== FOOTER =====
  pdf.setFontSize(9);
  pdf.setTextColor(120);
  pdf.text(
    "AI-generated report. Must be reviewed by a medical professional.",
    10,
    285
  );

  pdf.save("Medical_Report.pdf");
};
  return (
    <div
      className="min-vh-100 py-5"
      style={{
        backgroundImage: `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url(${bgImage})`,
        backgroundSize: "cover", // 🔥 FIX ZOOM
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundAttachment: "fixed", // 🔥 FIX SCROLL
      }}
    >
      <div className="container">
        {/* Header */}
        <div className="text-center mb-5">
          <h1 className="text-white fw-bold mb-3">
            AI Prenatal Heart Screening Dashboard
          </h1>
          <p className="text-light fs-5">
            Upload fetal heart ultrasound image and view AI-based analysis
          </p>
        </div>
{/* Patient Info Card */}
<div className="card shadow-lg border-0 rounded-4 mb-4">
  <div className="card-body p-4">
    <h4 className="fw-bold text-primary mb-3">Patient Information</h4>

    <div className="row g-3">
      <div className="col-md-4">
        <input
          type="text"
          placeholder="Patient Name"
          className="form-control"
          value={patient.name}
          onChange={(e) => setPatient({ ...patient, name: e.target.value })}
        />
      </div>

      <div className="col-md-4">
        <input
          type="number"
          placeholder="Age"
          className="form-control"
          value={patient.age}
          onChange={(e) => setPatient({ ...patient, age: e.target.value })}
        />
      </div>

      <div className="col-md-4">
        <select
          className="form-control"
          value={patient.gender}
          onChange={(e) => setPatient({ ...patient, gender: e.target.value })}
        >
          <option value="">Select Gender</option>
          <option>Male</option>
          <option>Female</option>
        </select>
      </div>
    </div>

    <button
      className="btn btn-success mt-3"
     onClick={() => {
  alert("Patient info ready!");
}}
    >
      Save Patient Info
    </button>
  </div>
</div>
        {/* Upload Card */}
        <div className="card shadow-lg border-0 rounded-4 mb-5">
          <div className="card-body p-4">
            <h3 className="fw-bold mb-4 text-primary">
              Upload Ultrasound Image
            </h3>
            <div className="mb-3">
              <input
                type="file"
                accept="image/*"
                className="form-control"
                onChange={handleImageUpload}
              />
            </div>
            <button
              className="btn btn-primary px-4 py-2 fw-semibold"
              onClick={handlePredict}
              disabled={loading}
            >
              {loading ? "Analyzing..." : "Predict Now"}
            </button>
          </div>
        </div>

        {/* Report Section */}
        <div id="reportSection">
          {image && (
            <div className="card shadow-lg border-0 rounded-4 mb-5">
              <div className="card-body p-4">
                {/* Heading with Buttons */}
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <h3 className="fw-bold mb-0 text-success">
                    Prediction Results
                  </h3>
                  <div className="d-flex gap-2">
                    <button
                      className="btn btn-success btn-sm"
                      onClick={downloadReport}
                    >
                      Download PDF
                    </button>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={clearHistory}
                    >
                      Delete History
                    </button>
                  </div>
                </div>

                {/* Images */}
                <div className="row g-4">
                  <div className="col-md-4 text-center">
                    <h5 className="fw-bold mb-3">Uploaded Image</h5>
                    <img
                      src={image}
                      alt="uploaded"
                      className="img-fluid rounded shadow"
                      style={{ maxHeight: "300px", objectFit: "contain" }}
                    />
                  </div>
                  <div className="col-md-4 text-center">
                    <h5 className="fw-bold mb-3">U-Net Segmentation Result</h5>
                    {segmentation ? (
                      <img
                        src={segmentation}
                        alt="segmentation"
                        className="img-fluid rounded shadow"
                        style={{ maxHeight: "300px", objectFit: "contain" }}
                      />
                    ) : (
                      <div className="text-muted">No segmentation yet</div>
                    )}
                  </div>
                  <div className="col-md-4 text-center">
                    <h5 className="fw-bold mb-3">ResNet Grad-CAM Heatmap</h5>
                    {heatmap ? (
                      <img
                        src={heatmap}
                        alt="heatmap"
                        className="img-fluid rounded shadow"
                        style={{ maxHeight: "300px", objectFit: "contain" }}
                      />
                    ) : (
                      <div className="text-muted">No heatmap yet</div>
                    )}
                  </div>
                </div>

                {/* Analysis Details */}
                {result.riskText && (
                  <div className="mt-5">
                    <h4 className="fw-bold text-dark mb-4">Analysis Details</h4>
                    <div className="row g-4">
                      <div className="col-md-6">
                        <div className="p-3 bg-light rounded shadow-sm">
  <p className="mb-2">
  <strong>Risk Level:</strong>{" "}
  <span className={`badge ${result.riskText === "High Risk" ? "bg-danger" : "bg-success"}`}>
    {result.riskText}
  </span>
</p>
                          <p className="mb-2">
                            <strong>Severity Score:</strong>{" "}
                            {result.severityScore}
                          </p>
                           <p className="fw-semibold text-muted mb-1">Severity Level</p>
                          {/* 🔥 PROGRESS BAR */}
                          <div
                            className="progress mb-3"
                            style={{ height: "22px", }}
                          >
                            <div
                              className={`progress-bar ${
                                result.severityScore < 0.4
                                  ? "bg-success"
                                  : result.severityScore < 0.7
                                    ? "bg-warning"
                                    : "bg-danger"
                              }`}
                              role="progressbar"
                              style={{
                                width: `${result.severityScore * 100}%`,
                              }}
                            >
                              {Math.round(result.severityScore * 100)}%
                            </div>
                          </div>
                          <p className="mb-2">
                            <strong>Risk Value:</strong> {result.riskValue}
                          </p>
                          <p className="mb-2">
                            <strong>Defect Percentage:</strong>{" "}
                            {result.defectPercentage}%
                          </p>
                          <p className="mb-0">
                            <strong>Detected Location:</strong>{" "}
                            {result.location}
                          </p>
                        </div>
                        {/* 🔥 CHART */}
<div className="mt-4 text-center">
  <h5 className="fw-bold">Risk Distribution</h5>

  <PieChart width={200} height={200}>
    <Pie
      data={[
        { name: "Risk", value: result.defectPercentage },
        { name: "Safe", value: 100 - result.defectPercentage }
      ]}
      cx="50%"
      cy="50%"
      outerRadius={70}
      dataKey="value"
    >
      <Cell fill="#dc3545" />
      <Cell fill="#28a745" />
    </Pie>
  </PieChart>
</div>
                      </div>

                      <div className="col-md-6">
                        <div className="p-3 bg-light rounded shadow-sm">
                          <p className="mb-2">
                            <strong>Recommendation:</strong>{" "}
                            {result.recommendation}
                          </p>
                          <p className="mb-0">
                            <strong>Explanation:</strong> {result.explanation}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
        <div className="container mt-4">
          <div className="card p-4">
            <History history={history} onDeleteHistory={clearHistory} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
