// app/src/pages/AdminLogin.jsx
import React, { useState, useEffect } from "react";
import AdminDashboard from "./AdminDashboard.jsx";

const ADMIN_SECRET = "123456"; 

export default function AdminLogin() {
  const [input, setInput] = useState("");
  const [error, setError] = useState("");
  const [isAuthorized, setIsAuthorized] = useState(false);

  // -localStorage
  useEffect(() => {
    const ok = localStorage.getItem("smartlaw_admin") === "1";
    if (ok) setIsAuthorized(true);
  }, []);

  function handleSubmit(e) {
    e.preventDefault();
    if (input === ADMIN_SECRET) {
      setIsAuthorized(true);
      setError("");
      localStorage.setItem("smartlaw_admin", "1");
    } else {
      setError("ססמה שגויה");
    }
  }

  //  ניהול התחומים
  if (isAuthorized) {
  return (
    <div>
      {/* logout for admin */}
      <div style={{ padding: "16px", textAlign: "right" }}>
        <button
          onClick={() => {
            localStorage.removeItem("smartlaw_admin");
            window.location.reload();
          }}
          style={{
            padding: "8px 16px",
            background: "linear-gradient(135deg, #ef4444, #dc2626)",
            border: "none",
            borderRadius: 12,
            color: "white",
            fontWeight: "600",
            cursor: "pointer",
          }}
        >
          התנתקות מנהל
        </button>
      </div>

      <AdminDashboard />
    </div>
  );
}


  return (
    <main
      style={{
        minHeight: "100vh",
        background: "radial-gradient(circle at top, #0f172a, #020617)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        direction: "rtl",
      }}
    >
      <div
        style={{
          background: "rgba(15, 23, 42, 0.95)",
          borderRadius: 24,
          padding: "24px 28px",
          width: "100%",
          maxWidth: 420,
          boxShadow: "0 24px 60px rgba(15,23,42,0.9)",
          border: "1px solid rgba(148,163,184,0.25)",
          color: "#e5e7eb",
        }}
      >
        <h1
          style={{
            fontSize: 22,
            fontWeight: 700,
            marginBottom: 8,
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <span>🔒</span>
          <span>כניסת מנהל תחומים</span>
        </h1>
        <p style={{ fontSize: 14, color: "#9ca3af", marginBottom: 18 }}>
          הזינו ססמה פנימית כדי לנהל את רשימת תחומי הידע והמקורות.
        </p>

        <form onSubmit={handleSubmit}>
          <label
            style={{
              display: "block",
              fontSize: 13,
              color: "#cbd5f5",
              marginBottom: 6,
            }}
          >
            ססמת מנהל
          </label>
          <input
            type="password"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            style={{
              width: "100%",
              padding: "10px 12px",
              borderRadius: 9999,
              border: "1px solid #1f2937",
              backgroundColor: "#020617",
              color: "#e5e7eb",
              marginBottom: 10,
            }}
          />
          {error && (
            <div style={{ color: "#f97373", fontSize: 13, marginBottom: 10 }}>
              {error}
            </div>
          )}
          <button
            type="submit"
            style={{
              width: "100%",
              padding: "10px 14px",
              borderRadius: 9999,
              border: "none",
              background:
                "linear-gradient(135deg, #3b82f6, #2563eb)",
              color: "white",
              fontWeight: 600,
              cursor: "pointer",
              boxShadow: "0 8px 24px rgba(37,99,235,0.6)",
            }}
          >
            כניסה
          </button>
        </form>
      </div>
    </main>
  );
}
