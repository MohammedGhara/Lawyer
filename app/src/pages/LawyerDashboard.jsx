// app/src/pages/LawyerDashboard.jsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "../styles/LawyerDashboard.css";

const API_BASE = "http://127.0.0.1:8000/api";

export default function LawyerDashboard() {
  const [cases, setCases] = useState([]);
  const [appointments, setAppointments] = useState({});
  const [draftTimes, setDraftTimes] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [filterClaim, setFilterClaim] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [sortOrder, setSortOrder] = useState("newest");

  useEffect(() => {
    loadAllData();
  }, []);

  useEffect(() => {
    const elements = document.querySelectorAll("[data-dashboard-animate]");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry, index) => {
          if (entry.isIntersecting) {
            setTimeout(() => {
              entry.target.classList.add("dashboard-animate-in");
            }, index * 100);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [cases]);

  async function loadAllData() {
    try {
      setLoading(true);
      setError(null);

      const resCases = await fetch(`${API_BASE}/cases/list/`);
      if (!resCases.ok) throw new Error("שגיאה בשליפת רשימת תיקים");
      const casesData = await resCases.json();

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

  async function deleteDocument(documentId, caseId) {
    if (!window.confirm("האם אתה בטוח שברצונך למחוק את המסמך הזה?")) {
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/documents/${documentId}/`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.detail || "שגיאה במחיקת המסמך");
      }

      // Reload all data to refresh the documents list
      await loadAllData();
    } catch (err) {
      console.error(err);
      alert(err.message || "שגיאה במחיקת המסמך");
    }
  }

  async function approveAppt(id) {
    try {
      await fetch(`${API_BASE}/appointments/${id}/approve/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      await loadAllData();
    } catch (err) {
      console.error(err);
      alert("שגיאה באישור הפגישה");
    }
  }

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
      return new Date(b.created_at) - new Date(a.created_at);
    });

  return (
    <main className="sl-dashboard-page" dir="rtl">
      <div className="sl-dashboard-container">
        <h1 className="sl-dashboard-title" data-dashboard-animate>
          דאשבורד עורך הדין – ניהול תיקים ופגישות
        </h1>

        {loading && (
          <div className="sl-loading" data-dashboard-animate>
            טוען נתונים...
          </div>
        )}

        {error && (
          <div className="sl-error" data-dashboard-animate>
            שגיאה: {error}
          </div>
        )}

        {!loading && !error && (
          <>
            <div
              style={{
                textAlign: "right",
                marginBottom: 12,
              }}
              data-dashboard-animate
            >
              
            </div>

            <div className="sl-dashboard-filters" data-dashboard-animate>
              <span className="sl-filter-label">סינון:</span>

              <div
                className={`sl-filter-select-wrapper ${
                  filterClaim !== "all" ? "has-selection" : ""
                }`}
              >
                <select
                  value={filterClaim}
                  onChange={(e) => setFilterClaim(e.target.value)}
                  className="sl-filter-select"
                >
                  <option value="all">כל סוגי התביעות</option>
                  <option value="dismissal">פיטורים שלא כדין</option>
                  <option value="salary">אי תשלום שכר / הלנת שכר</option>
                  <option value="overtime">שעות נוספות</option>
                  <option value="rights">פגיעה בזכויות סוציאליות</option>
                </select>
              </div>

              <div
                className={`sl-filter-select-wrapper ${
                  filterStatus !== "all" ? "has-selection" : ""
                }`}
              >
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="sl-filter-select"
                >
                  <option value="all">כל הסטטוסים</option>
                  <option value="new">חדש</option>
                  <option value="in_review">בבדיקה</option>
                  <option value="closed">נסגר</option>
                </select>
              </div>

              <div className="sl-sort-wrapper">
                <span className="sl-filter-label">מיון:</span>
                <div
                  className={`sl-filter-select-wrapper ${
                    sortOrder !== "newest" ? "has-selection" : ""
                  }`}
                >
                  <select
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value)}
                    className="sl-filter-select"
                  >
                    <option value="newest">מהחדשים לישנים</option>
                    <option value="oldest">מהישנים לחדשים</option>
                  </select>
                </div>
              </div>
            </div>

            <div
              className="sl-dashboard-table-wrapper"
              data-dashboard-animate
            >
              <table className="sl-dashboard-table">
                <thead>
                  <tr>
                    <th>מס'</th>
                    <th>שם לקוח</th>
                    <th>טלפון</th>
                    <th>אימייל</th>
                    <th>סוג תביעה</th>
                    <th>סטטוס תיק</th>
                    <th>מסמכים</th>
                    <th>סיכום מה־Chatbot</th>
                    <th>פגישה</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredCases.map((c, idx) => {
                    const appt = appointments[c.id];
                    const isPending = appt && appt.status === "pending";

                    return (
                      <tr key={c.id} data-dashboard-animate>
                        <td>{idx + 1}</td>
                        <td>{c.client_name}</td>
                        <td>
  <a 
    href={`https://wa.me/972${c.phone.replace(/^0/, "")}`}
    target="_blank"
    rel="noopener noreferrer"
    className="sl-whatsapp-link"
  >
    {c.phone}
  </a>
</td>
                        <td>{c.email}</td>
                        <td>
                          {c.legal_domain_name || describeClaimType(c.claim_type) || "—"}
                        </td>

                        <td>
                          <div className="sl-status-container">
                            <span
                              className={`sl-status-badge ${
                                c.status === "new"
                                  ? "sl-status-new"
                                  : c.status === "in_review"
                                  ? "sl-status-review"
                                  : "sl-status-closed"
                              }`}
                            >
                              {describeStatus(c.status)}
                            </span>
                            <div className="sl-status-buttons">
                              <button
                                type="button"
                                onClick={() => updateCaseStatus(c.id, "new")}
                                disabled={c.status === "new"}
                                className="sl-status-btn"
                              >
                                סמן כ"חדש"
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  updateCaseStatus(c.id, "in_review")
                                }
                                disabled={c.status === "in_review"}
                                className="sl-status-btn sl-status-btn-review"
                              >
                                בבדיקה
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  updateCaseStatus(c.id, "closed")
                                }
                                disabled={c.status === "closed"}
                                className="sl-status-btn sl-status-btn-closed"
                              >
                                סגור תיק
                              </button>
                            </div>
                          </div>
                        </td>

                        <td className="sl-documents-cell">
                          {c.documents && c.documents.length > 0 ? (
                            <div className="sl-documents-container">
                              <div className="sl-documents-header">
                                <span className="sl-documents-icon">📎</span>
                                <span className="sl-documents-count">
                                  {c.documents.length} מסמכים
                                </span>
                              </div>
                              <div className="sl-documents-grid">
                                {c.documents.map((doc) => (
                                  <div
                                    key={doc.id}
                                    className="sl-document-card-wrapper"
                                  >
                                    <a
                                      href={doc.file_url || `http://127.0.0.1:8000${doc.file}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="sl-document-card"
                                      title={getDocumentTypeLabel(doc.document_type)}
                                    >
                                      <div className="sl-document-icon">
                                        {getDocumentIcon(doc.document_type)}
                                      </div>
                                      <div className="sl-document-info">
                                        <div className="sl-document-name">
                                          {getFileName(doc.file)}
                                        </div>
                                        <div className="sl-document-type">
                                          {getDocumentTypeLabel(doc.document_type)}
                                        </div>
                                      </div>
                                      <div className="sl-document-download">
                                        ⬇️
                                      </div>
                                    </a>
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        deleteDocument(doc.id, c.id);
                                      }}
                                      className="sl-document-delete-btn"
                                      title="מחק מסמך"
                                    >
                                      🗑️
                                    </button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ) : (
                            <div className="sl-documents-empty">
                              <span className="sl-documents-empty-icon">📄</span>
                              <span>אין מסמכים</span>
                            </div>
                          )}
                        </td>

                        <td>
                          <div
                            className="sl-summary-cell"
                            title={
                              c.notes_from_chatbot ||
                              "אין סיכום שנשמר מה־chatbot"
                            }
                          >
                            {c.notes_from_chatbot ? (
                              <>
                                <div className="sl-summary-header">
                                  <span className="sl-summary-icon">📝</span>
                                  <span className="sl-summary-label">
                                    סיכום מה־Chatbot
                                  </span>
                                </div>
                                <div className="sl-summary-content">
                                  {c.notes_from_chatbot}
                                </div>
                              </>
                            ) : (
                              <div className="sl-summary-empty">
                                <span className="sl-summary-empty-icon">
                                  📄
                                </span>
                                <span>אין סיכום שנשמר</span>
                              </div>
                            )}
                            {c.phone && (
  <a
    href={`https://wa.me/972${c.phone.replace(/^0/, "")}?text=${encodeURIComponent(
      `שלום ${c.client_name}, עברתי על הסיכום שלך ואשמח לעזור לך.`
    )}`}
    target="_blank"
    rel="noopener noreferrer"
    className="sl-whatsapp-action-btn"
    style={{
      display: "inline-block",
      marginTop: "8px",
      padding: "6px 12px",
      background: "#25d366",
      color: "white",
      borderRadius: "6px",
      fontSize: "14px",
      textDecoration: "none",
    }}
  >
    💬 פניה ללקוח בוואטסאפ
  </a>
)}
                          </div>
                        </td>

                        <td className="sl-appointment-cell">
                          {!appt ? (
                            <span className="sl-no-appointment">
                              אין בקשת פגישה
                            </span>
                          ) : (
                            <div>
                              <div className="sl-appointment-info">
                                <b>מבוקש:</b>{" "}
                                {formatDateTime(appt.requested_datetime)}
                              </div>
                              {appt.approved_datetime && c.phone && (
                                <a
                                  href={`https://wa.me/972${c.phone.replace(/^0/, "")}?text=${encodeURIComponent(
                                    `שלום ${c.client_name}, הפגישה שלך אושרה! נתראה בתאריך: ${formatDateTime(
                                      appt.approved_datetime
                                    )}.`
                                  )}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="sl-whatsapp-action-btn"
                                  style={{
                                    display: "inline-block",
                                    marginTop: "6px",
                                    padding: "6px 12px",
                                    background: "#25d366",
                                    color: "white",
                                    borderRadius: "6px",
                                    fontSize: "14px",
                                    textDecoration: "none",
                                  }}
                                >
                                  🟢 שלח אישור בוואטסאפ
                                </a>
                            )}

                              <div className="sl-appointment-info">
                                <b>סטטוס:</b> {translateStatus(appt.status)}
                              </div>

                              {isPending && (
                                <div className="sl-appointment-actions">
                                  <button
                                    onClick={() => approveAppt(appt.id)}
                                    className="sl-appt-btn sl-appt-btn-approve"
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
                                    className="sl-datetime-input"
                                  />

                                  <button
                                    onClick={() => suggestAppt(appt.id)}
                                    className="sl-appt-btn sl-appt-btn-suggest"
                                  >
                                    הצעת מועד חדש
                                  </button>

                                  <button
                                    onClick={() => rejectAppt(appt.id)}
                                    className="sl-appt-btn sl-appt-btn-reject"
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

function getDocumentTypeLabel(type) {
  switch (type) {
    case "contract":
      return "חוזה עבודה";
    case "pay_slip":
      return "תלוש שכר";
    case "termination_letter":
      return "מכתב פיטורים";
    case "other":
      return "מסמך אחר";
    default:
      return type || "מסמך";
  }
}

function getDocumentIcon(type) {
  switch (type) {
    case "contract":
      return "📋";
    case "pay_slip":
      return "🧾";
    case "termination_letter":
      return "✉️";
    case "other":
      return "📎";
    default:
      return "📄";
  }
}

function getFileName(filePath) {
  if (!filePath) return "מסמך";
  const parts = filePath.split("/");
  const fileName = parts[parts.length - 1];
  // Remove Hebrew characters if they exist in the path, or just return the filename
  return fileName.length > 30 ? fileName.substring(0, 30) + "..." : fileName;
}
