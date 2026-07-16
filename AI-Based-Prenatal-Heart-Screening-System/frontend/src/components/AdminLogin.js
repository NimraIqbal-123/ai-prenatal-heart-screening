import React, { useState } from "react";

const AdminLogin = ({ setUser, setPage }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

 const handleLogin = async (e) => {
  e.preventDefault();

  const res = await fetch("http://127.0.0.1:5000/admin/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ email, password })
  });

  const data = await res.json();

  if (data.status === "success") {
    const adminUser = { email, role: "admin" };

    setUser(adminUser);
    sessionStorage.setItem("currentUser", JSON.stringify(adminUser));
    sessionStorage.setItem("role", "admin");

    setPage("admin");
  } else {
    alert("Invalid admin credentials");
  }
};

  return (
    <div className="d-flex justify-content-center align-items-center min-vh-100">
      <div className="card p-4 shadow" style={{ width: "350px" }}>
        <h3 className="text-center mb-3">Admin Login</h3>

        <form onSubmit={handleLogin}>
          <input
            type="email"
            className="form-control mb-2"
            placeholder="Admin Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            className="form-control mb-3"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button className="btn btn-dark w-100">Login</button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;