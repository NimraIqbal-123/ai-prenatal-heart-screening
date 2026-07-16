import React, { useState } from "react";

export default function AIPrediction({ user, historyData, setHistoryData }) {
  const [result, setResult] = useState("");
  const [confidence, setConfidence] = useState("");
  const [file, setFile] = useState(null);

  const handlePredict = () => {
    if (!file) {
      alert("Please select an image first");
      return;
    }

    const mockResult = "Healthy";
    const mockConfidence = (Math.random()*100).toFixed(2) + "%";
    setResult(mockResult);
    setConfidence(mockConfidence);

    const newItem = {
      email: user.email,
      result: mockResult,
      confidence: mockConfidence,
      date: new Date().toLocaleString(),
    };

    const updated = [...historyData, newItem];
    setHistoryData(updated);
    localStorage.setItem("history", JSON.stringify(updated));
  };

  return (
    <div className="card">
      <h4>Upload Ultrasound Image</h4>
      <input type="file" accept="image/*" className="form-control mb-3" onChange={e => setFile(e.target.files[0])} />
      <button className="btn btn-primary mb-3" onClick={handlePredict}>Predict</button>

      {result && (
        <div>
          <p>Result: {result}</p>
          <p>Confidence: {confidence}</p>
        </div>
      )}
    </div>
  );
}