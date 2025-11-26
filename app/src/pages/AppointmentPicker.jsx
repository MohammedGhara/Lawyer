// app/src/pages/AppointmentPicker.jsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const API_BASE = "http://127.0.0.1:8000/api";

export default function AppointmentPicker() {
  const { caseId } = useParams();

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
    <main style={{ paddingTop: "5rem", paddingBottom: "3rem" }}>
      <div
        style={{
          maxWidth: "900px",
          margin: "0 auto",
          padding: "2rem 1.5rem",
        }}
      >
        <h1
          style={{
            fontSize: "2rem",
            fontWeight: 700,
            marginBottom: "0.5rem",
            textAlign: "center",
          }}
        >
          קביעת פגישה עם עורך הדין
        </h1>
        <p
          style={{
            color: "#6b7280",
            marginBottom: "1.8rem",
            textAlign: "center",
          }}
        >
          בחרי יום ושעה שנוחים לך. עורך הדין יאשר, ידחה או יציע מועד חדש – ותוכלי
          לראות כאן את הסטטוס.
        </p>

        {/* טופס תאריך ושעה */}
        <form
          onSubmit={handleSubmit}
          style={{
            background: "white",
            borderRadius: "1.5rem",
            padding: "1.8rem",
            boxShadow: "0 12px 30px rgba(15, 23, 42, 0.08)",
            marginBottom: "2rem",
          }}
        >
          <label style={{ display: "block", marginBottom: "0.5rem" }}>
            בחירת תאריך ושעה לפגישה *
          </label>
          <input
            type="datetime-local"
            value={requestedDatetime}
            onChange={(e) => setRequestedDatetime(e.target.value)}
            required
            style={{
              width: "100%",
              maxWidth: "280px",
              padding: "0.65rem 0.9rem",
              borderRadius: "0.75rem",
              border: "1px solid #d1d5db",
              marginBottom: "1rem",
            }}
          />

          {message && (
            <div
              style={{
                marginBottom: "0.8rem",
                padding: "0.7rem 1rem",
                borderRadius: "0.75rem",
                background: "#ecfdf3",
                color: "#166534",
                fontSize: "0.9rem",
              }}
            >
              {message}
            </div>
          )}

          {error && (
            <div
              style={{
                marginBottom: "0.8rem",
                padding: "0.7rem 1rem",
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
            disabled={saving}
            style={{
              background: saving ? "#9ca3af" : "#2563eb",
              border: "none",
              borderRadius: "999px",
              padding: "0.8rem 2.4rem",
              color: "white",
              fontWeight: 600,
              fontSize: "1rem",
            }}
          >
            {saving ? "שולח..." : "שליחת בקשת פגישה"}
          </button>
        </form>

        {/* רשימת הפגישות וסטטוסים */}
        <h2
          style={{
            fontSize: "1.2rem",
            fontWeight: 600,
            marginBottom: "0.7rem",
            textAlign: "center",
          }}
        >
          הפגישות שביקשת עבור תיק זה
        </h2>

        {loading ? (
          <p style={{ textAlign: "center" }}>טוען נתונים...</p>
        ) : appointments.length === 0 ? (
          <p style={{ color: "#9ca3af", textAlign: "center" }}>
            אין פגישות עדיין.
          </p>
        ) : (
          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {appointments.map((a) => (
              <li
                key={a.id}
                style={{
                  padding: "0.85rem 1.1rem",
                  borderRadius: "0.9rem",
                  border: "1px solid #e5e7eb",
                  marginBottom: "0.7rem",
                  background: "white",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: "1rem",
                    alignItems: "center",
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600 }}>
                      {formatDateTime(a.requested_datetime)}
                    </div>
                    {a.approved_datetime && (
                      <div
                        style={{
                          fontSize: "0.85rem",
                          color: "#6b7280",
                          marginTop: "0.1rem",
                        }}
                      >
                        מועד שנקבע בפועל:{" "}
                        {formatDateTime(a.approved_datetime)}
                      </div>
                    )}
                  </div>
                  <span
                    style={{
                      fontSize: "0.85rem",
                      padding: "0.3rem 0.8rem",
                      borderRadius: "999px",
                      background: statusBg(a.status),
                      color: statusColor(a.status),
                      fontWeight: 600,
                    }}
                  >
                    {describeStatus(a.status)}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
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
