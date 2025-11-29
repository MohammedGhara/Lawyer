// app/src/pages/LawyerLogin.jsx
import React, { useState, useEffect } from "react";
import '../styles/LawyerLogin.css';
import { useNavigate } from "react-router-dom";

const API_BASE = "http://127.0.0.1:8000/api";

export default function LawyerLogin() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  // Smooth animations on mount
  useEffect(() => {
    const elements = document.querySelectorAll("[data-login-animate]");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry, index) => {
          if (entry.isIntersecting) {
            setTimeout(() => {
              entry.target.classList.add("login-animate-in");
            }, index * 150);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

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
    <>
      

      <main className="sl-login-page" dir="rtl">
        <div className="sl-login-container">
          {/* HEADER */}
          <header className="sl-login-header" data-login-animate>
            <div className="sl-login-icon">
              <span>⚖️</span>
            </div>
            <h1 className="sl-login-title">כניסת עורך דין</h1>
            <p className="sl-login-subtitle">
              עמוד זה מיועד רק לעורך הדין. נא להזין סיסמה.
            </p>
          </header>

          {/* LOGIN CARD */}
          <form className="sl-login-card" onSubmit={handleSubmit} data-login-animate>
            <div className="sl-login-field">
              <label className="sl-login-label" htmlFor="password">
                סיסמת עורך דין
              </label>
              <div className="sl-login-input-wrapper">
                <span className="sl-login-input-icon">🔒</span>
                <input
                  id="password"
                  type="password"
                  className="sl-login-input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="הזינו את הסיסמה"
                  autoComplete="current-password"
                />
              </div>
            </div>

            {error && (
              <div className="sl-login-error">
                <span className="sl-login-error-icon">⚠️</span>
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="sl-login-button"
            >
              <span>{loading ? "בוצע..." : "כניסה לדשבורד"}</span>
            </button>
          </form>
        </div>
      </main>
    </>
  );
}
