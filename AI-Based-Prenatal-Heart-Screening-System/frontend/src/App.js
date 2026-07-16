import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import AdminLogin from "./components/AdminLogin";
import AdminDashboard from "./components/AdminDashboard";
import Home from "./components/Home";
import Login from "./components/Login";
import Signup from "./components/Signup";
import UserDashboard from "./components/UserDashboard";
import Navbar from "./components/Navbar1";

function App() {
  const [page, setPage] = useState("home");
  const [user, setUser] = useState(null);

  // ✅ session restore
  useEffect(() => {
    const savedUser = JSON.parse(sessionStorage.getItem("currentUser"));

    if (savedUser) {
      setUser(savedUser);

      if (savedUser.role === "admin") {
        setPage("admin");
      } else {
        setPage("dashboard");
      }
    }
  }, []);

  return (
    <>
      {/* Navbar only when logged in */}
      {user && (
        <Navbar user={user} setUser={setUser} setPage={setPage} />
      )}

      {page === "home" && <Home setPage={setPage} />}

      {page === "login" && (
        <Login setUser={setUser} setPage={setPage} />
      )}

      {page === "signup" && (
        <Signup setUser={setUser} setPage={setPage} />
      )}

      {page === "admin-login" && (
        <AdminLogin setUser={setUser} setPage={setPage} />
      )}

      {page === "dashboard" && user && (
        <UserDashboard user={user} />
      )}

      {page === "admin" && user?.role === "admin" && (
        <AdminDashboard user={user} />
      )}

      {/* ❌ BLOCK FAKE ADMIN ACCESS */}
      {page === "admin" && user && user.role !== "admin" && (
        <div className="text-center text-danger mt-5">
          Access Denied
        </div>
      )}
    </>
  );
}

export default App;