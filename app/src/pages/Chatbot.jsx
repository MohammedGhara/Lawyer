import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../styles/Chatbot.css";

const API_BASE = "http://127.0.0.1:8000/api";

/* ───────────── קומפוננטת הצ'אט ───────────── */

export default function Chatbot() {
  const { caseId } = useParams();
  const navigate = useNavigate();

  const [caseData, setCaseData] = useState(null);
  const [adminMessages, setAdminMessages] = useState([]); // הודעות/שאלות מהמנהל
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState({}); // { messageId: "answer text" }
  const [inputValue, setInputValue] = useState("");
  const [history, setHistory] = useState([]); // { from: 'bot'|'user', text }
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState(null);

  // ───── שליפת פרטי התיק + הודעות מהתחום ─────
  useEffect(() => {
    async function fetchCaseAndMessages() {
      try {
        setError(null);

        // 1. שולפים את התיק
        const res = await fetch(`${API_BASE}/cases/${caseId}/`);
        if (!res.ok) throw new Error("שגיאה בשליפת פרטי התיק");
        const data = await res.json();
        setCaseData(data);

        // 2. מנסים להבין מה ה-ID של התחום המשפטי בתיק
        let domainId = null;
        if (data.legal_domain) {
          if (typeof data.legal_domain === 'number') {
            domainId = data.legal_domain;
          } else if (data.legal_domain.id) {
            domainId = data.legal_domain.id;
          } else if (typeof data.legal_domain === 'string') {
            domainId = parseInt(data.legal_domain);
          }
        } else if (data.domain) {
          // Fallback for old data structure
          domainId = typeof data.domain === 'number' ? data.domain : parseInt(data.domain);
        }

        // 3. אם יש תחום – שולפים הודעות בוט מהשרת
        let scriptMessages = [];
        if (domainId) {
          try {
            const resMessages = await fetch(
              `${API_BASE}/bot-messages/?domain=${domainId}`
            );
            if (resMessages.ok) {
              const raw = await resMessages.json();
              scriptMessages = (Array.isArray(raw) ? raw : [])
                .filter((m) => m.is_active)
                .sort(
                  (a, b) => (a.order || 1) - (b.order || 1) || a.id - b.id
                );
            }
          } catch (e) {
            console.error("Failed to load bot messages", e);
          }
        } else {
          console.warn("No legal_domain found in case data. Bot messages will not be loaded.");
        }

        // 4. אם אין הודעות מהמנהל – הצג שגיאה
        if (scriptMessages.length === 0) {
          setError("לא נמצאו הודעות או שאלות עבור התחום הזה. אנא צור קשר עם המנהל.");
          return;
        }

        // 5. שמירת ההודעות והצגת הראשונה
        setAdminMessages(scriptMessages);

        // 6. בונים היסטוריה התחלתית: רק את ההודעה הראשונה מהמנהל
        const initialHistory = [];
        if (scriptMessages.length > 0) {
          initialHistory.push({ from: "bot", text: scriptMessages[0].text });
        }

        setHistory(initialHistory);
        setCurrentIdx(0);
      } catch (err) {
        console.error(err);
        setError(err.message);
      }
    }

    fetchCaseAndMessages();
  }, [caseId]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    const chatContainer = document.getElementById("chat-messages");
    if (chatContainer) {
      chatContainer.scrollTop = chatContainer.scrollHeight;
    }
  }, [history]);

  /* ───────────── לוגיקת שליחת תשובה ───────────── */

  const sendAnswer = (overrideText) => {
    if (adminMessages.length === 0) return;
    
    const currentMessage = adminMessages[currentIdx];
    const raw = overrideText ?? inputValue.trim();
    if (!currentMessage || !raw) return;

    const answerText = raw;
    const messageId = currentMessage.id;

    // שמירת התשובה לפי ID ההודעה
    setAnswers((prev) => ({ ...prev, [messageId]: answerText }));
    setHistory((prev) => [...prev, { from: "user", text: answerText }]);
    setInputValue("");

    // מעבר לשאלה הבאה (אם יש)
    const nextIdx = currentIdx + 1;
    if (nextIdx < adminMessages.length) {
      const nextMessage = adminMessages[nextIdx];
      setHistory((prev) => [...prev, { from: "bot", text: nextMessage.text }]);
      setCurrentIdx(nextIdx);
    } else {
      // סיימנו את כל השאלות
      setDone(true);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      sendAnswer();
    }
  };

  /* ───────────── בניית סיכום מסודר ───────────── */

  const buildSummary = () => {
    if (!caseData || adminMessages.length === 0) return "";

    const parts = [];
    
    // כותרת בסיסית
    if (caseData.client_name) {
      parts.push(`העובד/ת ${caseData.client_name}`);
      
      // אם יש תחום משפטי - מוסיפים אותו
      if (caseData.legal_domain) {
        const domainName = typeof caseData.legal_domain === 'object' 
          ? caseData.legal_domain.name 
          : 'תחום משפטי';
        parts.push(`פונה בנושא: ${domainName}.`);
      } else {
        parts.push(`פונה בנושא משפטי.`);
      }
    }

    // הוספת כל השאלות והתשובות
    adminMessages.forEach((msg, idx) => {
      const answer = answers[msg.id];
      if (answer) {
        parts.push(`${msg.text} ${answer}.`);
      }
    });

    return parts.join(" ");
  };

  /* ───────────── שמירת הסיכום בשרת ───────────── */

  const handleSaveSummary = async () => {
    const summary = buildSummary();
    if (!summary) return false;

    setSaving(true);
    setError(null);

    try {
      const res = await fetch(`${API_BASE}/cases/${caseId}/chat/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ summary }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.detail || "שגיאה בשמירת הסיכום");
      }

      return true;
    } catch (err) {
      console.error(err);
      setError(err.message);
      return false;
    } finally {
      setSaving(false);
    }
  };

  const handleFinish = async () => {
    const ok = await handleSaveSummary();
    if (ok) {
      navigate(`/cases/${caseId}/appointment`);
    }
  };

  /* ───────────── UI ───────────── */

  if (error) {
    return (
      <>
        <main className="error-page" dir="rtl">
          <div className="error-card">
            <div className="error-icon">⚠️</div>
            <p className="error-text">שגיאה: {error}</p>
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="back-button"
              style={{ marginTop: "1rem" }}
            >
              <span className="back-button-icon">←</span>
              <span className="back-button-text">חזרה</span>
            </button>
          </div>
        </main>
      </>
    );
  }

  if (!caseData || adminMessages.length === 0) {
    return (
      <>
        <main className="loading-page" dir="rtl">
          <div className="loading-card">
            <div className="loading-spinner"></div>
            <p className="loading-text">טוען את פרטי התיק והשאלות...</p>
          </div>
        </main>
      </>
    );
  }

  const currentMessage = adminMessages[currentIdx];
  const progress = Math.round(
    ((currentIdx + (done ? 1 : 0)) / adminMessages.length) * 100
  );

  return (
    <>
      <main className="chat-page" dir="rtl">
        <div className="chat-container">
          <div style={{ gridColumn: "1 / -1", marginBottom: "1rem" }}>
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="back-button"
            >
              <span className="back-button-icon">←</span>
              <span className="back-button-text">חזרה</span>
            </button>
          </div>

          {/* צד שמאל – הצ'אט */}
          <section>
            <div className="chat-header">
              <h1 className="chat-title">שיחה עם עוזר חכם</h1>
              <p className="chat-subtitle">
                נשתמש בשיחה קצרה כדי לאסוף את כל הפרטים הדרושים לתיק העבודה שלך.
              </p>
            </div>

            {/* סרגל התקדמות משופר */}
            <div className="progress-container">
              <div className="progress-header">
                <span className="progress-label">
                  שאלה {Math.min(currentIdx + 1, adminMessages.length)} מתוך{" "}
                  {adminMessages.length}
                </span>
                <span className="progress-percent">{progress}% הושלמו</span>
              </div>
              <div className="progress-bar-wrapper">
                <div
                  className="progress-bar-fill"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            {/* כרטיס הצ'אט */}
            <div className="chat-card">
              <div id="chat-messages" className="chat-messages">
                {history.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`message-wrapper ${msg.from}`}
                    style={{ animationDelay: `${idx * 0.1}s` }}
                  >
                    <div className={`message-bubble ${msg.from}`}>
                      {msg.text}
                    </div>
                  </div>
                ))}
              </div>

              {!done ? (
                <>
                  {/* שורת קלט משופרת */}
                  <div className="input-container">
                    <input
                      type="text"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="כתבו את התשובה שלכם כאן ולחצו שלח"
                      className="chat-input"
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() => sendAnswer()}
                      disabled={!inputValue.trim()}
                      className="send-btn"
                    >
                      <span style={{ position: "relative", zIndex: 1 }}>
                        שלח
                      </span>
                    </button>
                  </div>
                </>
              ) : (
                <div className="finish-container">
                  <p className="finish-text">
                    ✅ סיימנו את השאלות. אפשר לעבור על הסיכום בצד ולאשר שמירה.
                  </p>
                  <button
                    type="button"
                    onClick={handleFinish}
                    disabled={saving}
                    className="finish-btn"
                  >
                    <span style={{ position: "relative", zIndex: 1 }}>
                      {saving ? "שומר..." : "שמירה וסיום"}
                    </span>
                  </button>
                </div>
              )}
            </div>
          </section>

          {/* צד ימין – מידע על התיק + סיכום */}
          <aside>
            <div className="sidebar-card">
              <h2 className="sidebar-title">
                <span className="sidebar-title-icon">📋</span>
                פרטי תיק
              </h2>
              <div className="info-row">
                <span className="info-label">שם העובד/ת:</span>
                <span className="info-value">{caseData.client_name}</span>
              </div>
              <div className="info-row">
                <span className="info-label">סוג פנייה:</span>
                <span className="info-value">
                  {caseData.legal_domain 
                    ? (typeof caseData.legal_domain === 'object' 
                        ? caseData.legal_domain.name 
                        : 'תחום משפטי')
                    : (caseData.claim_type ? describeClaimType(caseData.claim_type) : '-')}
                </span>
              </div>
              <div className="info-row">
                <span className="info-label">טלפון:</span>
                <span className="info-value">{caseData.phone}</span>
              </div>
              <div className="info-row">
                <span className="info-label">אימייל:</span>
                <span className="info-value">{caseData.email}</span>
              </div>
            </div>

            <div className="sidebar-card">
              <h2 className="sidebar-title">
                <span className="sidebar-title-icon">📝</span>
                סיכום אוטומטי
              </h2>
              <p className="summary-hint">
                זהו סיכום טיוטה של התיק שמועבר לעורך הדין. אין צורך לנסח
                בשפה משפטית – רק לוודא שהמידע מדויק.
              </p>
              <div className="summary-box">
                {buildSummary() || (
                  <span style={{ color: "#94a3b8", fontStyle: "italic" }}>
                    הסיכום יתעדכן אוטומטית לפי התשובות שלך.
                  </span>
                )}
              </div>
            </div>
          </aside>
        </div>
      </main>
    </>
  );
}

/* ───────────── פונקציית עזר ───────────── */

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
