// app/src/pages/LawyerLogin.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE = "http://127.0.0.1:8000/api";

export default function LawyerLogin() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/lawyer/login/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      const data = await res.json();

      if (!res.ok || !data.ok) {
        setError("סיסמה שגויה. נסה/י שוב.");
        return;
      }

      // ✔ login success – remember that this browser is the lawyer
      localStorage.setItem("smartlaw_role", "lawyer");
      navigate("/lawyer");
    } catch (err) {
      console.error(err);
      setError("שגיאת שרת. נסה/י שוב מאוחר יותר.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{ paddingTop: "5rem", paddingBottom: "3rem" }}>
      <div
        style={{
          maxWidth: "420px",
          margin: "0 auto",
          padding: "2rem 1.5rem",
        }}
      >
        <h1
          style={{
            fontSize: "1.8rem",
            fontWeight: 700,
            marginBottom: "0.75rem",
            textAlign: "center",
          }}
        >
          כניסת עורך דין
        </h1>
        <p
          style={{
            color: "#6b7280",
            marginBottom: "1.5rem",
            textAlign: "center",
          }}
        >
          עמוד זה מיועד רק לעורך הדין. נא להזין סיסמה.
        </p>

        <form
          onSubmit={handleSubmit}
          style={{
            background: "white",
            borderRadius: "1.5rem",
            padding: "1.8rem",
            boxShadow: "0 15px 35px rgba(15, 23, 42, 0.08)",
          }}
        >
          <div style={{ marginBottom: "1.3rem" }}>
            <label style={{ display: "block", marginBottom: "0.45rem" }}>
              סיסמת עורך דין
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{
                width: "100%",
                padding: "0.7rem 0.9rem",
                borderRadius: "0.75rem",
                border: "1px solid #d1d5db",
                fontSize: "0.95rem",
              }}
            />
          </div>

          {error && (
            <div
              style={{
                marginBottom: "1rem",
                padding: "0.75rem 1rem",
                borderRadius: "0.75rem",
                background: "#fef2f2",
                color: "#b91c1c",
                fontSize: "0.9rem",
              }}
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              background: "#2563eb",
              border: "none",
              borderRadius: "999px",
              padding: "0.85rem 2.2rem",
              color: "white",
              fontWeight: 600,
              fontSize: "1rem",
              opacity: loading ? 0.7 : 1,
              cursor: loading ? "wait" : "pointer",
            }}
          >
            {loading ? "בוצע..." : "כניסה לדשבורד"}
          </button>
        </form>
      </div>
    </main>
  );
}
