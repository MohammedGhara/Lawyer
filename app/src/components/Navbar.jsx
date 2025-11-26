// app/src/components/Navbar.jsx
import React from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();
  const isLawyer = localStorage.getItem("smartlaw_role") === "lawyer";

  function handleLogout() {
    localStorage.removeItem("smartlaw_role");
    navigate("/");
  }

  return (
    <nav
      style={{
        width: "100%",
        background: "#1e293b", // dark navy
        color: "white",
        padding: "0.75rem 2rem",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        direction: "rtl",
      }}
    >
      {/* ---------- RIGHT SIDE: LOGO + WEBSITE NAME ---------- */}
      <Link
        to="/"
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.6rem",
          textDecoration: "none",
          color: "white",
        }}
      >
        {/* LOGO CIRCLE */}
        <div
          style={{
            width: "36px",
            height: "36px",
            background: "#3b82f6",
            borderRadius: "50%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            fontSize: "1.2rem",
          }}
        >
          ⚖️
        </div>

        {/* WEBSITE NAME */}
        <span style={{ fontSize: "1.25rem", fontWeight: 700 }}>
          משפט חכם
        </span>
      </Link>

      {/* ---------- LEFT SIDE: NAV LINKS ---------- */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "1.5rem",
        }}
      >
        {/* Home always visible */}
        <Link
          to="/"
          style={{
            textDecoration: "none",
            color: "white",
            fontSize: "1rem",
            fontWeight: 500,
          }}
        >
          דף הבית
        </Link>

        {/* Lawyer-specific items */}
        {!isLawyer && (
          <Link
            to="/lawyer-login"
            style={{
              textDecoration: "none",
              color: "white",
              fontSize: "1rem",
              fontWeight: 500,
            }}
          >
            כניסת עו״ד
          </Link>
        )}

        {isLawyer && (
          <>
            <Link
              to="/lawyer"
              style={{
                textDecoration: "none",
                color: "white",
                fontSize: "1rem",
                fontWeight: 500,
              }}
            >
              דשבורד עו״ד
            </Link>

            <button
              onClick={handleLogout}
              style={{
                padding: "0.4rem 1rem",
                background: "#ef4444",
                border: "none",
                borderRadius: "0.5rem",
                color: "white",
                fontWeight: 600,
                cursor: "pointer",
                fontSize: "0.95rem",
              }}
            >
              התנתקות
            </button>
          </>
        )}
      </div>
    </nav>
  );
}
