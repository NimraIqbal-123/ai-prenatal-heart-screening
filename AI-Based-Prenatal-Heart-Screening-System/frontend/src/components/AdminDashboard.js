import React, { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from "recharts";

const AdminDashboard = () => {
  const [records, setRecords] = useState([]);
  const [search, setSearch] = useState("");

  // ================= LOAD DATA =================
  useEffect(() => {
    const role = sessionStorage.getItem("role");

    if (role !== "admin") {
      alert("Access Denied!");
      window.location.href = "/";
      return;
    }

    loadData();
  }, []);

  const loadData = () => {
    const stored =
      JSON.parse(localStorage.getItem("predictionHistory")) || [];
    setRecords(stored);
  };

  // ================= DELETE RECORD =================
  const deleteRecord = (id) => {
    const updated = records.filter((item) => item.id !== id);
    localStorage.setItem("predictionHistory", JSON.stringify(updated));
    setRecords(updated);
  };

  // ================= EXPORT CSV =================
  const exportCSV = () => {
    const csv = [
      ["Patient", "Risk", "Confidence", "Date"],
      ...records.map((r) => [
        r.patient?.name || "N/A",
        r.riskText,
        r.severityScore,
        r.date
      ])
    ]
      .map((e) => e.join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");

    a.href = url;
    a.download = "predictions.csv";
    a.click();
  };

  // ================= CHART DATA =================
  const chartData = records.map((item) => ({
    date: item.date?.split(",")[0] || "N/A",
    value: item.severityScore
  }));

  return (
    <div className="container mt-4">

      {/* HEADER */}
      <h2 className="text-center text-white fw-bold mb-4">
        Admin Dashboard - AI Medical Reports
      </h2>

      {/* EXPORT BUTTON */}
      <div className="text-end mb-3">
        <button className="btn btn-success" onClick={exportCSV}>
          📁 Export CSV
        </button>
      </div>

      {/* SEARCH BOX */}
      <input
        type="text"
        className="form-control mb-3"
        placeholder="Search by risk level..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {/* CHART */}
      <div className="card p-3 mb-4 shadow">
        <h5 className="text-center mb-3">
          📊 Severity Analysis Chart
        </h5>

        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={chartData}>
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="value" fill="#dc3545" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* TABLE */}
      <div className="card shadow p-3">
        {records.length === 0 ? (
          <p className="text-center">No records found</p>
        ) : (
          <table className="table table-striped text-center">
            <thead className="table-dark">
              <tr>
                <th>#</th>
                <th>Patient</th>
                <th>Risk</th>
                <th>Confidence</th>
                <th>Date</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {records
                .filter((item) =>
                  item.riskText
                    .toLowerCase()
                    .includes(search.toLowerCase())
                )
                .map((item, index) => (
                  <tr key={item.id}>
                    <td>{index + 1}</td>

                    <td>{item.patient?.name || "N/A"}</td>

                    <td>
                      <span
                        className={`badge ${
                          item.riskText === "High Risk"
                            ? "bg-danger"
                            : "bg-success"
                        }`}
                      >
                        {item.riskText}
                      </span>
                    </td>

                    <td>{item.severityScore}</td>
                    <td>{item.date}</td>

                    <td>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => deleteRecord(item.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;