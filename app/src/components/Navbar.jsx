import React from "react";

export default function Navbar() {
  return (
    <header
      style={{
        width: "100%",
        background: "rgba(15, 23, 42, 0.9)",
        backdropFilter: "blur(12px)",
        color: "white",
        position: "fixed",
        top: 0,
        right: 0,
        left: 0,
        zIndex: 50,
      }}
    >
      <div
        style={{
          maxWidth: "1100px",
          margin: "0 auto",
          padding: "0.75rem 1.5rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        {/* לוגו + שם המערכת */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <div
            style={{
              width: "38px",
              height: "38px",
              borderRadius: "999px",
              background: "#2563eb",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "1.2rem",
            }}
          >
            ⚖️
          </div>
          <span style={{ fontWeight: 700, fontSize: "1.1rem" }}>משפט חכם</span>
        </div>

        {/* כפתור התחברות */}
        <button
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            background: "transparent",
            borderRadius: "999px",
            border: "1px solid rgba(148, 163, 184, 0.5)",
            padding: "0.4rem 0.9rem",
            color: "white",
            fontSize: "0.9rem",
          }}
        >
          <span>התחברות</span>
          
          <span style={{ fontSize: "1rem" }}>↪</span>
        </button>
        <a href="/lawyer" style={{ fontWeight: 600 }}>
          דשבורד עורך הדין
        </a>
      </div>
    </header>
  );
}
