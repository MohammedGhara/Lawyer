// app/src/pages/LawyerDashboard.jsx
import React, { useEffect, useState } from "react";

const API_BASE = "http://127.0.0.1:8000/api";

export default function LawyerDashboard() {
  const [cases, setCases] = useState([]);
  const [appointments, setAppointments] = useState({});
  const [draftTimes, setDraftTimes] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 🔵 סינון + מיון
  const [filterClaim, setFilterClaim] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [sortOrder, setSortOrder] = useState("newest");

  useEffect(() => {
    loadAllData();
  }, []);

  async function loadAllData() {
    try {
      setLoading(true);
      setError(null);

      // 1) תיקים
      const resCases = await fetch(`${API_BASE}/cases/list/`);
      if (!resCases.ok) throw new Error("שגיאה בשליפת רשימת תיקים");
      const casesData = await resCases.json();

      // 2) פגישות
      const resAppt = await fetch(`${API_BASE}/appointments/list/`);
      if (!resAppt.ok) throw new Error("שגיאה בטעינת פגישות");
      const apptData = await resAppt.json();

      const apptByCase = {};
      apptData.forEach((appt) => {
        apptByCase[appt.case] = appt;
      });

      setCases(casesData);
      setAppointments(apptByCase);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  // ---------- עדכון סטטוס תיק (עורך דין) ----------
  async function updateCaseStatus(caseId, newStatus) {
    try {
      const res = await fetch(`${API_BASE}/cases/${caseId}/status/`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.detail || "שגיאה בעדכון סטטוס התיק");
      }

      await loadAllData();
    } catch (err) {
      console.error(err);
      alert(err.message || "שגיאה בעדכון סטטוס התיק");
    }
  }

  // ---------- פעולות עו״ד על פגישה ----------

  // אישור – בלי לבחור זמן חדש (השרת משתמש ב-requested_datetime)
  async function approveAppt(id) {
    try {
      await fetch(`${API_BASE}/appointments/${id}/approve/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}), // אין חובה על תאריך
      });
      await loadAllData();
    } catch (err) {
      console.error(err);
      alert("שגיאה באישור הפגישה");
    }
  }

  // דחייה – דורש בחירת תאריך/שעה (רק בשבילך ב־UI)
  async function rejectAppt(id) {
    const dt = draftTimes[id];
    if (!dt) {
      alert("לפני דחייה – בחר/י תאריך ושעה (לפי דרישת המטלה).");
      return;
    }

    try {
      await fetch(`${API_BASE}/appointments/${id}/reject/`, {
        method: "POST",
      });
      await loadAllData();
    } catch (err) {
      console.error(err);
      alert("שגיאה בדחיית הפגישה");
    }
  }

  // הצעת מועד חדש – חובה לבחור dateTime
  async function suggestAppt(id) {
    const dt = draftTimes[id];
    if (!dt) {
      alert("בחר/י תאריך ושעה למועד החדש");
      return;
    }

    try {
      await fetch(`${API_BASE}/appointments/${id}/suggest/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          suggested_datetime: new Date(dt).toISOString(),
        }),
      });
      await loadAllData();
    } catch (err) {
      console.error(err);
      alert("שגיאה בהצעת מועד חדש");
    }
  }

  function translateStatus(value) {
    switch (value) {
      case "pending":
        return "ממתין לתגובה";
      case "approved":
        return "אושר";
      case "rejected":
        return "נדחה";
      case "suggested":
        return "הוצע מועד חדש";
      default:
        return value;
    }
  }

  function formatDateTime(iso) {
    if (!iso) return "";
    const d = new Date(iso);
    return d.toLocaleString("he-IL", {
      dateStyle: "short",
      timeStyle: "short",
    });
  }

  // ---------- סינון + מיון תיקים לתצוגה ----------
  const filteredCases = cases
    .filter((c) => {
      const byClaim =
        filterClaim === "all" ? true : c.claim_type === filterClaim;
      const byStatus =
        filterStatus === "all" ? true : c.status === filterStatus;
      return byClaim && byStatus;
    })
    .sort((a, b) => {
      if (sortOrder === "oldest") {
        return new Date(a.created_at) - new Date(b.created_at);
      }
      // default: newest first
      return new Date(b.created_at) - new Date(a.created_at);
    });

  return (
    <main style={{ paddingTop: "5rem", paddingBottom: "3rem" }}>
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "2rem 1.5rem",
        }}
      >
        <h1 style={{ fontSize: "1.9rem", fontWeight: 700, marginBottom: "1rem" }}>
          דאשבורד עורך הדין – ניהול תיקים ופגישות
        </h1>

        {loading && <p>טוען נתונים...</p>}
        {error && <p style={{ color: "red" }}>שגיאה: {error}</p>}

        {!loading && !error && (
          <>
            {/* 🔵 פס מסננים + מיון */}
            <div
              style={{
                marginBottom: "1rem",
                display: "flex",
                flexWrap: "wrap",
                gap: "0.75rem",
                alignItems: "center",
              }}
            >
              <div style={{ fontSize: "0.9rem", fontWeight: 500 }}>סינון:</div>

              <select
                value={filterClaim}
                onChange={(e) => setFilterClaim(e.target.value)}
                style={filterSelectStyle}
              >
                <option value="all">כל סוגי התביעות</option>
                <option value="dismissal">פיטורים שלא כדין</option>
                <option value="salary">אי תשלום שכר / הלנת שכר</option>
                <option value="overtime">שעות נוספות</option>
                <option value="rights">פגיעה בזכויות סוציאליות</option>
              </select>

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                style={filterSelectStyle}
              >
                <option value="all">כל הסטטוסים</option>
                <option value="new">חדש</option>
                <option value="in_review">בבדיקה</option>
                <option value="closed">נסגר</option>
              </select>

              <div style={{ marginLeft: "auto", fontSize: "0.9rem" }}>
                <label style={{ marginLeft: "0.4rem" }}>מיון:</label>
                <select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                  style={filterSelectStyle}
                >
                  <option value="newest">מהחדשים לישנים</option>
                  <option value="oldest">מהישנים לחדשים</option>
                </select>
              </div>
            </div>

            {/* 🔵 טבלה */}
            <div
              style={{
                overflowX: "auto",
                background: "white",
                borderRadius: "1.2rem",
                boxShadow: "0 12px 30px rgba(15, 23, 42, 0.08)",
              }}
            >
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  fontSize: "0.9rem",
                }}
              >
                <thead>
                  <tr style={{ background: "#f3f4f6" }}>
                    <th style={thStyle}>מס'</th>
                    <th style={thStyle}>שם לקוח</th>
                    <th style={thStyle}>טלפון</th>
                    <th style={thStyle}>אימייל</th>
                    <th style={thStyle}>סוג תביעה</th>
                    <th style={thStyle}>סטטוס תיק</th>

                    {/* ✅ העמודה החדשה לסיכום מה־chatbot */}
                    <th style={thStyle}>סיכום מה־Chatbot</th>

                    <th style={thStyle}>פגישה</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredCases.map((c, idx) => {
                    const appt = appointments[c.id];
                    const isPending = appt && appt.status === "pending";

                    return (
                      <tr key={c.id} style={{ borderTop: "1px solid #e5e7eb" }}>
                        <td style={tdStyle}>{idx + 1}</td>
                        <td style={tdStyle}>{c.client_name}</td>
                        <td style={tdStyle}>{c.phone}</td>
                        <td style={tdStyle}>{c.email}</td>
                        <td style={tdStyle}>{describeClaimType(c.claim_type)}</td>

                        {/* סטטוס תיק + כפתורים */}
                        <td style={tdStyle}>
                          <div
                            style={{
                              display: "flex",
                              flexDirection: "column",
                              gap: "0.3rem",
                              alignItems: "flex-start",
                            }}
                          >
                            <span>{describeStatus(c.status)}</span>
                            <div
                              style={{
                                display: "flex",
                                gap: "0.3rem",
                                flexWrap: "wrap",
                              }}
                            >
                              <button
                                type="button"
                                onClick={() => updateCaseStatus(c.id, "new")}
                                disabled={c.status === "new"}
                                style={{
                                  ...smallStatusBtn,
                                  opacity: c.status === "new" ? 0.5 : 1,
                                }}
                              >
                                סמן כ"חדש"
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  updateCaseStatus(c.id, "in_review")
                                }
                                disabled={c.status === "in_review"}
                                style={{
                                  ...smallStatusBtn,
                                  background: "#f97316",
                                  opacity: c.status === "in_review" ? 0.5 : 1,
                                }}
                              >
                                בבדיקה
                              </button>
                              <button
                                type="button"
                                onClick={() => updateCaseStatus(c.id, "closed")}
                                disabled={c.status === "closed"}
                                style={{
                                  ...smallStatusBtn,
                                  background: "#6b7280",
                                  opacity: c.status === "closed" ? 0.5 : 1,
                                }}
                              >
                                סגור תיק
                              </button>
                            </div>
                          </div>
                        </td>

                        {/* ✅ תא עם סיכום מה־Chatbot */}
                        <td style={{ ...tdStyle, maxWidth: "260px" }}>
                          <div
                            style={{
                              whiteSpace: "pre-wrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              cursor: c.notes_from_chatbot ? "pointer" : "default",
                              color: c.notes_from_chatbot ? "#2563eb" : "#6b7280",
                            }}
                            title={
                              c.notes_from_chatbot || "אין סיכום שנשמר מה־chatbot"
                            }
                          >
                            {c.notes_from_chatbot ? c.notes_from_chatbot : "—"}
                          </div>
                        </td>

                        {/* פגישות */}
                        <td style={{ ...tdStyle, minWidth: "290px" }}>
                          {!appt ? (
                            <span style={{ color: "#9ca3af" }}>
                              אין בקשת פגישה
                            </span>
                          ) : (
                            <div>
                              <div>
                                <b>מבוקש:</b>{" "}
                                {formatDateTime(appt.requested_datetime)}
                              </div>
                              {appt.approved_datetime && (
                                <div>
                                  <b>מועד שנקבע:</b>{" "}
                                  {formatDateTime(appt.approved_datetime)}
                                </div>
                              )}
                              <div style={{ marginTop: "0.2rem" }}>
                                <b>סטטוס:</b> {translateStatus(appt.status)}
                              </div>

                              {/* כפתורים + בחירת זמן רק כשהפגישה ממתינה */}
                              {isPending && (
                                <div
                                  style={{
                                    marginTop: "0.6rem",
                                    display: "flex",
                                    gap: "0.5rem",
                                    flexWrap: "wrap",
                                    alignItems: "center",
                                  }}
                                >
                                  <button
                                    onClick={() => approveAppt(appt.id)}
                                    style={btnApprove}
                                  >
                                    אישור
                                  </button>

                                  <input
                                    type="datetime-local"
                                    value={draftTimes[appt.id] || ""}
                                    onChange={(e) =>
                                      setDraftTimes((prev) => ({
                                        ...prev,
                                        [appt.id]: e.target.value,
                                      }))
                                    }
                                    style={{
                                      padding: "0.35rem 0.5rem",
                                      borderRadius: "0.5rem",
                                      border: "1px solid #d1d5db",
                                    }}
                                  />

                                  <button
                                    onClick={() => suggestAppt(appt.id)}
                                    style={btnSuggest}
                                  >
                                    הצעת מועד חדש
                                  </button>

                                  <button
                                    onClick={() => rejectAppt(appt.id)}
                                    style={btnReject}
                                  >
                                    דחייה
                                  </button>
                                </div>
                              )}
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </main>
  );
}

const thStyle = {
  padding: "0.7rem 0.8rem",
  textAlign: "right",
  fontWeight: 600,
};

const tdStyle = {
  padding: "0.6rem 0.8rem",
  textAlign: "right",
};

const btnApprove = {
  background: "#22c55e",
  color: "white",
  border: "none",
  borderRadius: "8px",
  padding: "6px 10px",
  cursor: "pointer",
};

const btnSuggest = {
  background: "#3b82f6",
  color: "white",
  border: "none",
  borderRadius: "8px",
  padding: "6px 10px",
  cursor: "pointer",
};

const btnReject = {
  background: "#ef4444",
  color: "white",
  border: "none",
  borderRadius: "8px",
  padding: "6px 10px",
  cursor: "pointer",
};

// סגנון למסננים
const filterSelectStyle = {
  padding: "0.45rem 0.7rem",
  borderRadius: "999px",
  border: "1px solid #d1d5db",
  fontSize: "0.85rem",
  background: "white",
};

// כפתורי סטטוס קטנים
const smallStatusBtn = {
  background: "#22c55e",
  color: "white",
  border: "none",
  borderRadius: "999px",
  padding: "3px 8px",
  fontSize: "0.75rem",
  cursor: "pointer",
};

function describeClaimType(value) {
  switch (value) {
    case "dismissal":
      return "פיטורים שלא כדין";
    case "salary":
      return "אי תשלום שכר / הלנת שכר";
    case "overtime":
      return "שעות נוספות";
    case "rights":
      return "פגיעה בזכויות סוציאליות";
    default:
      return value || "";
  }
}

function describeStatus(value) {
  switch (value) {
    case "new":
      return "חדש";
    case "in_review":
      return "בבדיקה";
    case "closed":
      return "נסגר";
    default:
      return value || "";
  }
}
