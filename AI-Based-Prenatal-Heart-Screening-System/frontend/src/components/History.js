import React from "react";

export default function History({ history, onDeleteHistory }) {
  return (
    <div className="container">
  <div className="row justify-content-center">
    <div className="card shadow-lg border-0 rounded-4 mb-5">
  <div className="card-body p-4">
      <div className="card mt-4 p-3">
      <h4>My Prediction History</h4>

      <button
        className="btn btn-danger btn-sm mb-3"
        onClick={onDeleteHistory}
      >
        Delete My History
      </button>

      <table className="table">
        <thead>
          <tr>
            <th>#</th>
            <th>Result</th>
            <th>Confidence</th>
            <th>Date</th>
          </tr>
        </thead>

        <tbody>
          {history.length === 0 ? (
            <tr>
              <td colSpan="4" className="text-center">
                No history available
              </td>
            </tr>
          ) : (
            history.map((item, index) => (
              <tr key={index}>
                <td>{index + 1}</td>
                <td style={{ color: item.riskText === "High Risk" ? "red" : "green" }}>
  {item.riskText}
</td>
               <td>{(item.severityScore * 100).toFixed(0)}%</td>
                <td>{item.date}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
       </div>
    </div>
  </div>
</div>
 </div>

  );
}