// app/src/pages/AppointmentPicker.jsx
import React, { useEffect, useState } from "react";
import '../styles/AppointmentPicker.css';
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
