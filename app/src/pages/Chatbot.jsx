import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../styles/Chatbot.css";

const API_BASE = "http://127.0.0.1:8000/api";

/* ───────────── הגדרות השאלות ───────────── */

const COMMON_QUESTIONS = [
  {
    key: "start_date",
    text: "מתי התחלת לעבוד במקום העבודה הזה?",
    type: "text",
  },
  {
    key: "end_date",
    text: "מתי סיימת לעבוד (אם סיימת)? אם עדיין עובד/ת – כתבו 'עדיין עובד/ת'.",
    type: "text",
  },
  {
    key: "last_salary",
    text: "מה היה השכר האחרון שלך (ברוטו, בערך)?",
    type: "text",
  },
];

const CLAIM_SPECIFIC_QUESTIONS = {
  dismissal: [
    {
      key: "had_hearing",
      text: "האם נערך לך שימוע לפני הפיטורים? (כן/לא)",
      type: "text",
    },
    {
      key: "notice",
      text: "כמה זמן מראש הודיעו לך על הפיטורים?",
      type: "text",
    },
    {
      key: "termination_letter",
      text: "האם קיבלת מכתב פיטורים כתוב? (כן/לא)",
      type: "text",
    },
  ],
  salary: [
    {
      key: "missing_months",
      text: "על איזה חודשים לא קיבלת שכר?",
      type: "text",
    },
    {
      key: "partial_or_none",
      text: "האם חלק מהשכר שולם או שלא שולם בכלל? פרט/י.",
      type: "text",
    },
  ],
  overtime: [
    {
      key: "weekly_overtime",
      text: "כמה שעות נוספות בערך עבדת בכל שבוע?",
      type: "text",
    },
    {
      key: "overtime_paid",
      text: "האם קיבלת תשלום על שעות נוספות? (כן/לא, והסבר קצר)",
      type: "text",
    },
  ],
  rights: [
    {
      key: "missing_benefits",
      text: "אילו זכויות סוציאליות לדעתך נפגעו? (פנסיה, הבראה, חופשה וכו')",
      type: "text",
    },
  ],
};

/* ───────────── טיפים לפי שאלה ───────────── */

const QUESTION_TIPS = {
  start_date: "אין חובה לתאריך מדויק. אפשר לכתוב גם '01/2020' או 'תחילת 2020'.",
  end_date:
    "אם את/ה עדיין עובד/ת, אפשר לכתוב פשוט 'עדיין עובד/ת'. אם לא זוכר/ת את היום, מספיק חודש ושנה.",
  last_salary:
    "אפשר לכתוב הערכה, לדוגמה: 'בערך 6,000 ברוטו' או 'שכר שעתי 35 ₪'.",
  missing_months:
    "לדוגמה: 'ינואר–מרץ 2024' או 'יולי ואוגוסט 2023'. מספיק תיאור כללי.",
  partial_or_none:
    "לדוגמה: 'שולם חצי שכר בכל חודש' או 'לא שולם בכלל שלושה חודשים'.",
  weekly_overtime:
    "אם לא זוכר/ת בדיוק – אפשר לכתוב טווח, למשל 'בין 5 ל-10 שעות נוספות בשבוע'.",
  overtime_paid:
    "אפשר לציין גם אם השעות שולמו כשכר רגיל ולא כשעות נוספות לפי חוק.",
  missing_benefits:
    "לדוגמה: 'לא שולמה פנסיה', 'לא שולמו ימי חופשה', 'לא קיבלתי דמי הבראה' וכו'.",
};

/* ───────────── תשובות מוצעות (כפתורי קיצור) ───────────── */

const SUGGESTED_ANSWERS = {
  had_hearing: ["כן", "לא", "לא זוכר/ת"],
  termination_letter: ["כן", "לא"],
  overtime_paid: ["כן", "לא", "חלקית"],
  end_date: ["עדיין עובד/ת", "לא זוכר/ת תאריך מדויק"],
  partial_or_none: ["שולם חלקית", "לא שולם בכלל"],
};

/* ───────────── קומפוננטת הצ'אט ───────────── */

export default function Chatbot() {
  const { caseId } = useParams();
  const navigate = useNavigate();

  const [caseData, setCaseData] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState({});
  const [inputValue, setInputValue] = useState("");
  const [history, setHistory] = useState([]); // { from: 'bot'|'user', text }
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState(null);

  // שליפת פרטי התיק מהשרת
  useEffect(() => {
    async function fetchCase() {
      try {
        const res = await fetch(`${API_BASE}/cases/${caseId}/`);
        if (!res.ok) throw new Error("שגיאה בשליפת פרטי התיק");
        const data = await res.json();
        setCaseData(data);

        const claim = data.claim_type; // dismissal / salary / ...
        const specific = CLAIM_SPECIFIC_QUESTIONS[claim] || [];
        const allQuestions = [...COMMON_QUESTIONS, ...specific];

        setQuestions(allQuestions);

        if (allQuestions.length > 0) {
          setHistory([
            {
              from: "bot",
              text: `שלום ${data.client_name || ""}, נעבור עכשיו כמה שאלות קצרות כדי שנרכז את כל הפרטים החשובים לגבי ${describeClaimType(
                claim
              )}.`,
            },
            { from: "bot", text: allQuestions[0].text },
          ]);
        }
      } catch (err) {
        console.error(err);
        setError(err.message);
      }
    }
    fetchCase();
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
    const q = questions[currentIdx];
    const raw = overrideText ?? inputValue.trim();
    if (!q || !raw) return;

    const answerText = raw;

    setAnswers((prev) => ({ ...prev, [q.key]: answerText }));
    setHistory((prev) => [...prev, { from: "user", text: answerText }]);
    setInputValue("");

    const nextIdx = currentIdx + 1;
    if (nextIdx < questions.length) {
      const nextQ = questions[nextIdx];
      setHistory((prev) => [...prev, { from: "bot", text: nextQ.text }]);
      setCurrentIdx(nextIdx);
    } else {
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
    if (!caseData) return "";

    const parts = [];
    parts.push(
      `העובד/ת ${caseData.client_name} תובע/ת בגין ${describeClaimType(
        caseData.claim_type
      )}.`
    );

    if (answers.start_date) {
      parts.push(`תחילת העבודה: ${answers.start_date}.`);
    }
    if (answers.end_date) {
      parts.push(`סיום העבודה: ${answers.end_date}.`);
    }
    if (answers.last_salary) {
      parts.push(
        `השכר האחרון (ברוטו, לפי הצהרת העובד/ת): ${answers.last_salary}.`
      );
    }

    switch (caseData.claim_type) {
      case "dismissal":
        if (answers.had_hearing) {
          parts.push(`שימוע לפני פיטורים: ${answers.had_hearing}.`);
        }
        if (answers.notice) {
          parts.push(`הודעה מוקדמת לפיטורים: ${answers.notice}.`);
        }
        if (answers.termination_letter) {
          parts.push(`מכתב פיטורים כתוב: ${answers.termination_letter}.`);
        }
        break;
      case "salary":
        if (answers.missing_months) {
          parts.push(`חודשים ללא שכר: ${answers.missing_months}.`);
        }
        if (answers.partial_or_none) {
          parts.push(`מידת התשלום בפועל: ${answers.partial_or_none}.`);
        }
        break;
      case "overtime":
        if (answers.weekly_overtime) {
          parts.push(
            `שעות נוספות שבועיות משוערות: ${answers.weekly_overtime}.`
          );
        }
        if (answers.overtime_paid) {
          parts.push(`תשלום על שעות נוספות: ${answers.overtime_paid}.`);
        }
        break;
      case "rights":
        if (answers.missing_benefits) {
          parts.push(
            `זכויות סוציאליות שלטענת העובד/ת לא כובדו: ${answers.missing_benefits}.`
          );
        }
        break;
      default:
        break;
    }

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
          </div>
        </main>
      </>
    );
  }

  if (!caseData || questions.length === 0) {
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

  const currentQuestion = questions[currentIdx];
  const currentTip = currentQuestion
    ? QUESTION_TIPS[currentQuestion.key]
    : null;
  const currentSuggestions =
    (currentQuestion && SUGGESTED_ANSWERS[currentQuestion.key]) || [];

  const progress = Math.round(((currentIdx + (done ? 1 : 0)) / questions.length) * 100);

  return (
    <>
      <main className="chat-page" dir="rtl">
        <div className="chat-container">
          <div style={{ gridColumn: '1 / -1', marginBottom: '1rem' }}>
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
                  שאלה {Math.min(currentIdx + 1, questions.length)} מתוך{" "}
                  {questions.length}
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
                  {/* טיפ לשאלה הנוכחית */}
                  {currentTip && (
                    <div className="tip-box">
                      <span className="tip-icon">💡</span>
                      <strong> טיפ:</strong> {currentTip}
                    </div>
                  )}

                  {/* תשובות מוצעות */}
                  {currentSuggestions.length > 0 && (
                    <div className="suggestions-container">
                      {currentSuggestions.map((s, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => sendAnswer(s)}
                          className="suggestion-btn"
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  )}

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
                  {describeClaimType(caseData.claim_type)}
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
