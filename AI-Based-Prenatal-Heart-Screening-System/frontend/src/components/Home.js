import React from "react";

export default function Home({ setPage }) {
  return (
    <div className="home-container">
      <div className="overlay d-flex flex-column justify-content-end align-items-center">
        <div className="home-buttons mb-5"> {/* Add margin-bottom */}
     <button
  className="btn btn-outline-light btn-lg m-2"
  onClick={() => setPage("login")}
>
  Login
</button>

<button
  className="btn btn-outline-success btn-lg m-2"
  onClick={() => setPage("signup")}
>
  Sign Up
</button>
        </div>
      </div>
    </div>
  );
}