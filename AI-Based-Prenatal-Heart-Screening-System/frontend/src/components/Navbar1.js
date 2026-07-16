import React from "react";

export default function Navbar({ user, setUser, setPage }) {
  const handleLogout = () => {
    sessionStorage.removeItem("currentUser");
    setUser(null);
    setPage("home");
  };

  return (
    <div className="navbar">
      <div className="brand">AI Prenatal System</div>

      <div className="nav-right">
        {/* SAFE CHECK */}
        {user?.email && <span>{user.email}</span>}

        <button className="btn btn-danger ms-3" onClick={handleLogout}>
          Logout
        </button>

        {/* ONLY SHOW ADMIN BUTTON IF NOT ADMIN */}
        {user?.role !== "admin" && (
          <button
            className="btn btn-warning ms-2"
            onClick={() => setPage("admin-login")}
          >
            Admin Login
          </button>
        )}
      </div>
    </div>
  );
}