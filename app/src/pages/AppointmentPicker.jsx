// app/src/pages/AppointmentPicker.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

const API_BASE = "http://127.0.0.1:8000/api";

export default function AppointmentPicker() {
  const { caseId } = useParams();
  const navigate = useNavigate();

  const [requestedDatetime, setRequestedDatetime] = useState("");
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);

  // שליפת הפגישות הקיימות לתיק – כדי להראות לעובד סטטוס
  useEffect(() => {
    async function fetchAppointments() {
      try {
        setLoading(true);
        const res = await fetch(`${API_BASE}/cases/${caseId}/appointments/`);
        if (!res.ok) throw new Error("שגיאה בשליפת הפגישות");
        const data = await res.json();
        setAppointments(data);
      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchAppointments();
  }, [caseId]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!requestedDatetime) return;

    setSaving(true);
    setError(null);
    setMessage(null);

    try {
      const res = await fetch(`${API_BASE}/cases/${caseId}/appointments/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          requested_datetime: new Date(requestedDatetime).toISOString(),
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.detail || "שגיאה ביצירת הפגישה");
      }

      const newAppt = await res.json();
      setAppointments((prev) => [newAppt, ...prev]);
      setMessage("הבקשה לפגישה נשלחה. הסטטוס יתעדכן לאחר החלטת עורך הדין.");
      setRequestedDatetime("");
    } catch (err) {
      console.error(err);
      setError(err.message || "שגיאה בלתי צפויה");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <style>{`
        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(-30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.7;
          }
        }

        @keyframes shimmer {
          0% { background-position: -1000px 0; }
          100% { background-position: 1000px 0; }
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-5px); }
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .appointment-page {
          min-height: 100vh;
          padding: 5.5rem 1.5rem 3rem;
          background: linear-gradient(
            135deg,
            #0f172a 0%,
            #1e293b 25%,
            #1d4ed8 50%,
            #111827 75%,
            #020617 100%
          );
          background-size: 400% 400%;
          animation: gradientShift 20s ease infinite;
          position: relative;
          overflow-x: hidden;
        }

        .appointment-page::before {
          content: '';
          position: absolute;
          inset: 0;
          background: radial-gradient(circle at 20% 30%, rgba(59, 130, 246, 0.15) 0%, transparent 50%),
                      radial-gradient(circle at 80% 70%, rgba(34, 197, 94, 0.1) 0%, transparent 50%);
          pointer-events: none;
        }

        .appointment-container {
          max-width: 1000px;
          margin: 0 auto;
          position: relative;
          z-index: 1;
        }

        .back-button {
          display: inline-flex;
          align-items: center;
          gap: 0.6rem;
          padding: 0.7rem 1.5rem;
          margin-bottom: 2rem;
          background: rgba(15, 23, 42, 0.9);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(148, 163, 184, 0.3);
          border-radius: 999px;
          color: #cbd5e1;
          font-weight: 600;
          font-size: 0.95rem;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 8px 25px rgba(15, 23, 42, 0.4);
          text-decoration: none;
          position: relative;
          overflow: hidden;
          animation: fadeInUp 0.6s ease-out;
        }

        .back-button::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(
            135deg,
            rgba(59, 130, 246, 0.2),
            rgba(34, 197, 94, 0.15)
          );
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .back-button:hover {
          transform: translateY(-2px) translateX(-3px);
          background: rgba(15, 23, 42, 0.95);
          border-color: rgba(59, 130, 246, 0.5);
          box-shadow: 0 12px 35px rgba(34, 197, 94, 0.3);
        }

        .back-button:hover::before {
          opacity: 1;
        }

        .back-button:active {
          transform: translateY(0) translateX(-1px);
        }

        .back-button-icon {
          font-size: 1.2rem;
          position: relative;
          z-index: 1;
          transition: transform 0.3s ease;
        }

        .back-button:hover .back-button-icon {
          transform: translateX(3px);
        }

        .back-button-text {
          position: relative;
          z-index: 1;
        }

        .appointment-header {
          text-align: center;
          margin-bottom: 3rem;
          animation: fadeInUp 0.8s ease-out;
        }

        .appointment-title {
          font-size: 3rem;
          font-weight: 900;
          margin-bottom: 1rem;
          line-height: 1.2;
          background: linear-gradient(135deg, #ffffff 0%, #e0e7ff 50%, #c7d2fe 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          letter-spacing: -0.02em;
        }

        .appointment-subtitle {
          font-size: 1.2rem;
          color: #cbd5e1;
          font-weight: 400;
          line-height: 1.7;
          max-width: 600px;
          margin: 0 auto;
        }

        .appointment-form-card {
          background: linear-gradient(
            145deg,
            rgba(15, 23, 42, 0.98),
            rgba(15, 23, 42, 0.92)
          );
          backdrop-filter: blur(30px);
          border-radius: 2rem;
          padding: 2.5rem;
          box-shadow: 0 35px 90px rgba(15, 23, 42, 0.9),
                      0 0 0 1px rgba(148, 163, 184, 0.2);
          margin-bottom: 2.5rem;
          position: relative;
          overflow: hidden;
          animation: fadeInUp 0.8s ease-out 0.2s both;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .appointment-form-card::before {
          content: "";
          position: absolute;
          inset: 0;
          border-radius: inherit;
          padding: 1px;
          background: linear-gradient(135deg, rgba(59, 130, 246, 0.3), rgba(34, 197, 94, 0.2));
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          pointer-events: none;
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .appointment-form-card:hover::before {
          opacity: 1;
        }

        .appointment-form-card::before {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: inherit;
          padding: 1px;
          background: linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(34, 197, 94, 0.15));
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          pointer-events: none;
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .appointment-form-card:hover::before {
          opacity: 1;
        }

        .form-label {
          display: block;
          font-weight: 700;
          font-size: 1.1rem;
          color: #e5e7eb;
          margin-bottom: 0.8rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          position: relative;
          z-index: 1;
        }

        .form-label-icon {
          font-size: 1.3rem;
          animation: float 3s ease-in-out infinite;
        }

        .datetime-input {
          width: 100%;
          max-width: 320px;
          padding: 1rem 1.2rem;
          border-radius: 1rem;
          border: 2px solid rgba(55, 65, 81, 0.6);
          font-size: 1rem;
          background: rgba(15, 23, 42, 0.9);
          color: #e5e7eb;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          outline: none;
          font-family: inherit;
          position: relative;
          z-index: 1;
        }

        .datetime-input::placeholder {
          color: #6b7280;
        }

        .datetime-input:focus {
          border-color: #3b82f6;
          box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1),
                      0 8px 25px rgba(59, 130, 246, 0.15);
          background: rgba(15, 23, 42, 1);
          transform: translateY(-2px);
        }

        .submit-btn {
          border-radius: 999px;
          padding: 1rem 2.5rem;
          border: none;
          background: linear-gradient(135deg, #2563eb, #3b82f6, #60a5fa);
          color: white;
          font-weight: 700;
          font-size: 1.05rem;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 
            0 8px 25px rgba(37, 99, 235, 0.5),
            0 0 0 1px rgba(255, 255, 255, 0.1);
          position: relative;
          overflow: hidden;
          margin-top: 1.5rem;
          z-index: 1;
        }

        .submit-btn::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, #3b82f6, #60a5fa);
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .submit-btn:hover::before {
          opacity: 1;
        }

        .submit-btn:hover:not(:disabled) {
          transform: translateY(-3px) scale(1.05);
          box-shadow: 0 12px 35px rgba(37, 99, 235, 0.5);
        }

        .submit-btn:active:not(:disabled) {
          transform: translateY(-1px) scale(1);
        }

        .submit-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
          transform: none;
        }

        .submit-btn span {
          position: relative;
          z-index: 1;
        }

        .message-box {
          padding: 1rem 1.2rem;
          border-radius: 1rem;
          margin-bottom: 1rem;
          font-size: 0.95rem;
          font-weight: 600;
          line-height: 1.6;
          animation: slideInRight 0.4s ease-out;
          position: relative;
          z-index: 1;
        }

        .message-success {
          background: linear-gradient(135deg, rgba(22, 163, 74, 0.15), rgba(34, 197, 94, 0.1));
          border: 2px solid rgba(22, 163, 74, 0.4);
          color: #bbf7d0;
          box-shadow: 0 8px 25px rgba(22, 163, 74, 0.2);
        }

        .message-error {
          background: linear-gradient(135deg, rgba(248, 113, 113, 0.15), rgba(239, 68, 68, 0.1));
          border: 2px solid rgba(248, 113, 113, 0.5);
          color: #fecaca;
          box-shadow: 0 8px 25px rgba(248, 113, 113, 0.2);
        }

        .appointments-section {
          animation: fadeInUp 0.8s ease-out 0.4s both;
        }

        .appointments-title {
          font-size: 1.5rem;
          font-weight: 800;
          margin-bottom: 1.5rem;
          text-align: center;
          color: #ffffff;
        }

        .loading-state {
          text-align: center;
          padding: 3rem;
          color: #cbd5e1;
          font-size: 1.1rem;
          font-weight: 600;
        }

        .loading-spinner {
          width: 50px;
          height: 50px;
          border: 4px solid rgba(59, 130, 246, 0.2);
          border-top-color: #3b82f6;
          border-radius: 50%;
          margin: 0 auto 1rem;
          animation: spin 1s linear infinite;
        }

        .empty-state {
          text-align: center;
          padding: 3rem;
          background: linear-gradient(
            145deg,
            rgba(15, 23, 42, 0.98),
            rgba(15, 23, 42, 0.92)
          );
          backdrop-filter: blur(30px);
          border-radius: 2rem;
          box-shadow: 0 35px 90px rgba(15, 23, 42, 0.9),
                      0 0 0 1px rgba(148, 163, 184, 0.2);
          position: relative;
          overflow: hidden;
        }

        .empty-state::before {
          content: "";
          position: absolute;
          inset: 0;
          border-radius: inherit;
          padding: 1px;
          background: linear-gradient(135deg, rgba(59, 130, 246, 0.3), rgba(34, 197, 94, 0.2));
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          pointer-events: none;
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .empty-state:hover::before {
          opacity: 1;
        }

        .empty-state-icon {
          font-size: 4rem;
          margin-bottom: 1rem;
          opacity: 0.6;
          animation: float 3s ease-in-out infinite;
          position: relative;
          z-index: 1;
        }

        .empty-state-text {
          color: #9ca3af;
          font-size: 1.1rem;
          font-weight: 500;
          position: relative;
          z-index: 1;
        }

        .appointments-list {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .appointment-item {
          background: linear-gradient(
            145deg,
            rgba(15, 23, 42, 0.98),
            rgba(15, 23, 42, 0.92)
          );
          backdrop-filter: blur(30px);
          border-radius: 1.5rem;
          padding: 1.5rem;
          box-shadow: 0 15px 40px rgba(15, 23, 42, 0.7),
                      0 0 0 1px rgba(148, 163, 184, 0.2);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          animation: slideInRight 0.5s ease-out;
          position: relative;
          overflow: hidden;
        }

        .appointment-item::before {
          content: "";
          position: absolute;
          inset: 0;
          border-radius: inherit;
          padding: 1px;
          background: linear-gradient(135deg, rgba(59, 130, 246, 0.3), rgba(34, 197, 94, 0.2));
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          pointer-events: none;
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .appointment-item:hover {
          transform: translateY(-3px) translateX(-5px);
          box-shadow: 0 20px 55px rgba(15, 23, 42, 1),
                      0 0 0 2px rgba(59, 130, 246, 0.5);
        }

        .appointment-item:hover::before {
          opacity: 1;
        }

        .appointment-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 1.5rem;
          position: relative;
          z-index: 1;
        }

        .appointment-details {
          flex: 1;
        }

        .appointment-datetime {
          font-weight: 800;
          font-size: 1.1rem;
          color: #ffffff;
          margin-bottom: 0.4rem;
          display: flex;
          align-items: center;
          gap: 0.6rem;
        }

        .appointment-datetime-icon {
          font-size: 1.3rem;
        }

        .appointment-approved {
          font-size: 0.9rem;
          color: #9ca3af;
          margin-top: 0.5rem;
          padding-right: 1.8rem;
          font-weight: 500;
        }

        .status-badge {
          font-size: 0.9rem;
          padding: 0.5rem 1.2rem;
          border-radius: 999px;
          font-weight: 700;
          white-space: nowrap;
          box-shadow: 0 4px 12px rgba(15, 23, 42, 0.5);
          transition: transform 0.2s ease;
          position: relative;
          z-index: 1;
        }

        .status-badge:hover {
          transform: scale(1.05);
        }

        .status-pending {
          background: linear-gradient(135deg, rgba(251, 191, 36, 0.2), rgba(245, 158, 11, 0.15));
          color: #92400e;
          border: 2px solid rgba(251, 191, 36, 0.3);
        }

        .status-approved {
          background: linear-gradient(135deg, rgba(34, 197, 94, 0.2), rgba(22, 163, 74, 0.15));
          color: #166534;
          border: 2px solid rgba(34, 197, 94, 0.3);
        }

        .status-rejected {
          background: linear-gradient(135deg, rgba(248, 113, 113, 0.2), rgba(239, 68, 68, 0.15));
          color: #b91c1c;
          border: 2px solid rgba(248, 113, 113, 0.3);
        }

        .status-suggested {
          background: linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(37, 99, 235, 0.15));
          color: #1d4ed8;
          border: 2px solid rgba(59, 130, 246, 0.3);
        }

        @media (max-width: 768px) {
          .appointment-title {
            font-size: 2.2rem;
          }

          .appointment-form-card {
            padding: 1.8rem;
          }

          .appointment-content {
            flex-direction: column;
            align-items: flex-start;
            gap: 1rem;
          }

          .status-badge {
            align-self: flex-start;
          }
        }
      `}</style>

      <main className="appointment-page" dir="rtl">
        <div className="appointment-container">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="back-button"
          >
            <span className="back-button-icon">←</span>
            <span className="back-button-text">חזרה</span>
          </button>

          <div className="appointment-header">
            <h1 className="appointment-title">קביעת פגישה עם עורך הדין</h1>
            <p className="appointment-subtitle">
              בחרי יום ושעה שנוחים לך. עורך הדין יאשר, ידחה או יציע מועד חדש – ותוכלי
              לראות כאן את הסטטוס.
            </p>
          </div>

          {/* טופס תאריך ושעה */}
          <form
            onSubmit={handleSubmit}
            className="appointment-form-card"
          >
            <label className="form-label">
              <span className="form-label-icon">📅</span>
              בחירת תאריך ושעה לפגישה *
            </label>
            <input
              type="datetime-local"
              value={requestedDatetime}
              onChange={(e) => setRequestedDatetime(e.target.value)}
              required
              className="datetime-input"
            />

            {message && (
              <div className="message-box message-success">
                ✅ {message}
              </div>
            )}

            {error && (
              <div className="message-box message-error">
                ⚠️ {error}
              </div>
            )}

            <button
              type="submit"
              disabled={saving}
              className="submit-btn"
            >
              <span>
                {saving ? "שולח..." : "שליחת בקשת פגישה"}
              </span>
            </button>
          </form>

          {/* רשימת הפגישות וסטטוסים */}
          <div className="appointments-section">
            <h2 className="appointments-title">
              הפגישות שביקשת עבור תיק זה
            </h2>

            {loading ? (
              <div className="loading-state">
                <div className="loading-spinner"></div>
                טוען נתונים...
              </div>
            ) : appointments.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">📋</div>
                <p className="empty-state-text">אין פגישות עדיין.</p>
              </div>
            ) : (
              <ul className="appointments-list">
                {appointments.map((a, idx) => (
                  <li
                    key={a.id}
                    className="appointment-item"
                    style={{ animationDelay: `${idx * 0.1}s` }}
                  >
                    <div className="appointment-content">
                      <div className="appointment-details">
                        <div className="appointment-datetime">
                          <span className="appointment-datetime-icon">🕐</span>
                          {formatDateTime(a.requested_datetime)}
                        </div>
                        {a.approved_datetime && (
                          <div className="appointment-approved">
                            ✓ מועד שנקבע בפועל:{" "}
                            {formatDateTime(a.approved_datetime)}
                          </div>
                        )}
                      </div>
                      <span
                        className={`status-badge status-${a.status}`}
                      >
                        {describeStatus(a.status)}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </main>
    </>
  );
}

function formatDateTime(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleString("he-IL", {
    dateStyle: "short",
    timeStyle: "short",
  });
}

function describeStatus(st) {
  switch (st) {
    case "pending":
      return "ממתין לאישור עו\"ד";
    case "approved":
      return "אושרה";
    case "rejected":
      return "נדחתה";
    case "suggested":
      return "הוצע מועד חדש";
    default:
      return st;
  }
}

function statusBg(st) {
  switch (st) {
    case "pending":
      return "rgba(251, 191, 36, 0.12)";
    case "approved":
      return "rgba(34, 197, 94, 0.12)";
    case "rejected":
      return "rgba(248, 113, 113, 0.12)";
    case "suggested":
      return "rgba(59, 130, 246, 0.12)";
    default:
      return "#e5e7eb";
  }
}

function statusColor(st) {
  switch (st) {
    case "pending":
      return "#92400e";
    case "approved":
      return "#166534";
    case "rejected":
      return "#b91c1c";
    case "suggested":
      return "#1d4ed8";
    default:
      return "#374151";
  }
}
