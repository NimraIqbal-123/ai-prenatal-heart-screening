import React, { useState } from "react";

export default function Login({ setUser, setPage }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleLogin = (e) => {
    e.preventDefault();

    // Fetch users from localStorage
    let users = JSON.parse(localStorage.getItem("users")) || [];

    const validUser = users.find(u => u.email === email && u.password === password);
    if (!validUser) {
      setMessage("Invalid email or password");
      return;
    }

    // Save current user to session
    sessionStorage.setItem("currentUser", JSON.stringify(validUser));
    setUser(validUser);
    setPage("dashboard"); // Go to dashboard after login
  };

  return (
    <div className="auth-container-wrapper">
      <div className="auth-container">
        <h2>Login</h2>
        <form onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="Enter Email"
            value={email}
            required
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="Enter Password"
            value={password}
            required
            onChange={(e) => setPassword(e.target.value)}
          />
          <button type="submit" className="btn btn-primary">Login</button>
        </form>

        {message && <p className="error">{message}</p>}

        <p className="link" onClick={() => setPage("signup")}>
          Don't have an account? Sign Up
        </p>
      </div>
    </div>
  );
}