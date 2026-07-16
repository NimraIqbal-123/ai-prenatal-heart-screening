import React, { useState } from "react";

export default function Signup({ setUser, setPage }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleSignup = (e) => {
    e.preventDefault();

    // Fetch users from localStorage
    let users = JSON.parse(localStorage.getItem("users")) || [];

    // Check if email already exists
    if (users.find(u => u.email === email)) {
      setMessage("Email already exists");
      return;
    }

    const newUser = { email, password, role: "user" };
    users.push(newUser);
    localStorage.setItem("users", JSON.stringify(users));

    sessionStorage.setItem("currentUser", JSON.stringify(newUser));
    setUser(newUser);
    setPage("dashboard"); // Go to dashboard after signup
  };

  return (
    <div className="auth-container-wrapper">
      <div className="auth-container">
        <h2>Sign Up</h2>
        <form onSubmit={handleSignup}>
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
          <button type="submit" className="btn btn-success">Sign Up</button>
        </form>

        {message && <p className="error">{message}</p>}

        <p className="link" onClick={() => setPage("login")}>
          Already have an account? Login
        </p>
      </div>
    </div>
  );
}