import React, { useState, useEffect } from "react";
import '../styles/IntakeForm.css';
import { useNavigate } from "react-router-dom";

const CLAIM_TYPES = [
  { value: "dismissal", label: "פיטורים שלא כדין" },
  { value: "salary", label: "אי תשלום שכר / הלנת שכר" },
  { value: "overtime", label: "שעות נוספות" },
  { value: "rights", label: "פגיעה בזכויות סוציאליות" },
];

const API_BASE = "http://127.0.0.1:8000/api";

export default function IntakeForm() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    client_name: "",
    client_id_number: "",
    phone: "",
    email: "",
    claim_type: "",
  });

  const [contractFile, setContractFile] = useState(null);
  const [payslips, setPayslips] = useState([]);
  const [otherDocs, setOtherDocs] = useState([]);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  // Smooth scroll animations on mount
  useEffect(() => {
    const elements = document.querySelectorAll("[data-intake-animate]");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry, index) => {
          if (entry.isIntersecting) {
            setTimeout(() => {
              entry.target.classList.add("intake-animate-in");
            }, index * 100);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    setError(null);

    try {
      // 1) יצירת תיק חדש
      const caseResponse = await fetch(`${API_BASE}/cases/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      if (!caseResponse.ok) {
        const data = await caseResponse.json().catch(() => ({}));
        throw new Error(data.detail || "שגיאה ביצירת התיק");
      }

      const caseData = await caseResponse.json();
      const caseId = caseData.id;

      // 2) העלאת קבצים (אם יש)
      const hasAnyFiles =
        contractFile ||
        (payslips && payslips.length > 0) ||
        (otherDocs && otherDocs.length > 0);

      if (hasAnyFiles) {
        const fd = new FormData();

        if (contractFile) fd.append("contract", contractFile);
        for (const f of payslips) fd.append("payslips", f);
        for (const f of otherDocs) fd.append("other_documents", f);

        const docsRes = await fetch(
          `${API_BASE}/cases/${caseId}/documents/`,
          {
            method: "POST",
            body: fd,
          }
        );

        if (!docsRes.ok) {
          const data = await docsRes.json().catch(() => ({}));
          console.warn("Upload docs error:", data);
        }
      }

      setMessage("הפנייה נשלחה בהצלחה! מעבירים אותך לעוזר החכם...");

      setForm({
        client_name: "",
        client_id_number: "",
        phone: "",
        email: "",
        claim_type: "",
      });
      setContractFile(null);
      setPayslips([]);
      setOtherDocs([]);

      setTimeout(() => {
        navigate(`/chat/${caseId}`);
      }, 1500);
    } catch (err) {
      console.error(err);
      setError(err.message || "אירעה שגיאה בלתי צפויה");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      

      <main className="sl-intake-page" dir="rtl">
        <div className="sl-intake-shell">
          {/* HEADER */}
          <header className="sl-intake-header" data-intake-animate>
            <div className="sl-intake-header-main">
              <div className="sl-intake-pill">
                <span className="sl-intake-pill-dot" />
                <span>שלב 1 מתוך 3 · פתיחת פנייה והעלאת מסמכים</span>
              </div>
              <h1 className="sl-intake-title">טופס פתיחת פנייה</h1>
              <p className="sl-intake-sub">
                כמה דקות של מילוי טופס – ומשם העוזר החכם יאסוף את כל הפרטים,
                יסכם את הזכויות הרלוונטיות ויכין תיק מסודר לעורך הדין.
              </p>
            </div>

            <aside className="sl-intake-meta" data-intake-animate>
              <div className="sl-intake-meta-row">
                <span className="sl-intake-meta-label">זמן משוער</span>
                <span className="sl-intake-meta-value">3–5 דקות</span>
              </div>
              <div className="sl-intake-meta-row">
                <span className="sl-intake-meta-label">מסמכים עיקריים</span>
                <span className="sl-intake-meta-value">חוזה, תלושים</span>
              </div>
              <div className="sl-intake-meta-row">
                <span className="sl-intake-meta-label">אבטחת מידע</span>
                <span className="sl-intake-meta-value">TLS · נשמר בדיסקרטיות</span>
              </div>
            </aside>
          </header>

          <div className="sl-intake-layout" data-intake-animate>
            {/* MAIN FORM CARD */}
            <form className="sl-intake-card" onSubmit={handleSubmit}>
              {/* PERSONAL DETAILS */}
              <section>
                <h2 className="sl-intake-section-title">פרטים אישיים</h2>
                <p className="sl-intake-section-sub">
                  הפרטים משמשים לזיהוי ויצירת קשר בלבד. השדות המסומנים ב
                  <span style={{ color: "#f97373" }}> *</span> הם שדות חובה.
                </p>

                {/* שם מלא + תעודת זהות באותה שורה */}
                <div className="sl-intake-grid-2">
                  <div className="sl-field">
                    <div className="sl-label-row">
                      <label className="sl-label" htmlFor="client_name">
                        שם מלא <span>*</span>
                      </label>
                      <span className="sl-label-hint">
                        כפי שמופיע בתעודת הזהות
                      </span>
                    </div>
                    <div className="sl-input-wrapper">
                      <span className="sl-input-icon">👤</span>
                      <input
                        id="client_name"
                        type="text"
                        name="client_name"
                        className="sl-input"
                        value={form.client_name}
                        onChange={handleChange}
                        required
                        placeholder="הכניסו את שמכם המלא"
                      />
                    </div>
                  </div>
<div className="sl-field">
                    <div className="sl-label-row">
                      <label className="sl-label" htmlFor="client_id_number">
                        תעודת זהות <span>*</span>
                      </label>
                      <span className="sl-label-hint">9 ספרות ללא מקפים</span>
                    </div>
                    <div className="sl-input-wrapper">
                      <span className="sl-input-icon">🪪</span>
                      <input
                        id="client_id_number"
                        type="text"
                        inputMode="numeric"
                        maxLength={9}
                        pattern="\d{9}"
                        title="נא להזין 9 ספרות"
                        name="client_id_number"
                        className="sl-input"
                        value={form.client_id_number}
                        onChange={handleChange}
                        required
                        placeholder="לדוגמה: 012345678"
                      />
                    </div>
                  </div>
                </div>

                {/* טלפון + אימייל */}
                <div className="sl-intake-grid-2">
                  <div className="sl-field">
                    <div className="sl-label-row">
                      <label className="sl-label" htmlFor="phone">
                        טלפון נייד <span>*</span>
                      </label>
                      <span className="sl-label-hint">
                        נתקשר אליך רק במידת הצורך
                      </span>
                    </div>
                    <div className="sl-input-wrapper">
                      <span className="sl-input-icon">📱</span>
                      <input
                        id="phone"
                        type="tel"
                        inputMode="numeric"
                        maxLength={10}
                        pattern="05\d{8}"
                        title="נא להזין מספר נייד תקין (10 ספרות)"
                        name="phone"
                        className="sl-input"
                        value={form.phone}
                        onChange={handleChange}
                        required
                        placeholder="0500000000"
                      />
                    </div>
                  </div>
                  
                  <div className="sl-field">
                    <div className="sl-label-row">
                      <label className="sl-label" htmlFor="email">
                        כתובת אימייל <span>*</span>
                      </label>
                      <span className="sl-label-hint">
                        לקבלת אישור ושליחת סיכום
                      </span>
                    </div>
                    <div className="sl-input-wrapper">
                      <span className="sl-input-icon">✉️</span>
                      <input
                        id="email"
                        type="email"
                        name="email"
                        className="sl-input"
                        value={form.email}
                        onChange={handleChange}
                        required
                        placeholder="name@example.com"
                      />
                    </div>
                  </div>
                </div>
              </section>

              <div className="sl-intake-divider" />

              {/* CLAIM TYPE */}
              <section>
                <h2 className="sl-intake-section-title">סוג הפנייה</h2>
                <p className="sl-intake-section-sub">
                  בחירה ראשונית בלבד – ניתן לפרט יותר בשיחה עם העוזר החכם.
                </p>

                <div className="sl-field">
                  <div className="sl-label-row">
                    <label className="sl-label" htmlFor="claim_type">
                      מה סוג הבעיה העיקרית? <span>*</span>
                    </label>
                    <span className="sl-label-hint">
                      בחרי את האפשרות הקרובה ביותר למקרה שלך
                    </span>
                  </div>
                  <div className={`sl-input-wrapper ${form.claim_type ? 'sl-select-wrapper-has-value' : ''}`}>
                    <span className="sl-input-icon">⚖️</span>
                    <select
                      id="claim_type"
                      name="claim_type"
                      className="sl-select"
                      value={form.claim_type}
                      onChange={handleChange}
                      required
                    >
                      <option value="">בחרו את סוג הפנייה</option>
                      {CLAIM_TYPES.map((c) => (
                        <option key={c.value} value={c.value}>
                          {c.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </section>

              <div className="sl-intake-divider" />

              {/* DOCUMENTS */}
              <section>
                <h2 className="sl-intake-section-title">
                  העלאת מסמכים (אופציונלי)
                </h2>
                <p className="sl-intake-section-sub">
                  מומלץ לצרף חוזה ותלושים אם הם זמינים. כרגע ניתן להעלות{" "}
                  <strong>קבצי PDF בלבד</strong>.
                </p>

                {/* שלושה כרטיסים בשורה */}
                <div className="sl-docs-grid">
                  {/* חוזה עבודה */}
                  <div className="sl-doc-card">
                    <div className="sl-field">
                      <div className="sl-label-row">
                        <label className="sl-label" htmlFor="contract">
                          חוזה עבודה
                        </label>
                        <span className="sl-label-hint">קובץ PDF אחד</span>
                      </div>
                      <div className="sl-input-wrapper">
                        <span className="sl-input-icon">📄</span>
                        <input
                          id="contract"
                          type="file"
                          className="sl-file-input"
                          accept="application/pdf"
                          onChange={(e) =>
                            setContractFile(e.target.files[0] || null)
                          }
                        />
                      </div>
                    </div>

                    <div className="sl-file-hint">
                      אם יש יותר מחוזה אחד – ניתן לצרף אותם תחת "מסמכים נוספים".
                    </div>

                    {/* הצגת שם הקובץ שנבחר */}
                    {contractFile && (
                      <div className="sl-file-list">
                        <div className="sl-file-pill">
                          <span className="sl-file-pill-icon">📎</span>
                          <span>{contractFile.name}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* תלושי שכר */}
                  <div className="sl-doc-card">
                    <div className="sl-field">
                      <div className="sl-label-row">
                        <label className="sl-label" htmlFor="payslips">
                          תלושי שכר
                        </label>
                        <span className="sl-label-hint">
                          אפשר לבחור כמה קבצים יחד
                        </span>
                      </div>
                      <div className="sl-input-wrapper">
                        <span className="sl-input-icon">🧾</span>
                        <input
                          id="payslips"
                          type="file"
                          multiple
                          className="sl-file-input"
                          accept="application/pdf"
                          onChange={(e) =>
                            setPayslips(Array.from(e.target.files))
                          }
                        />
                      </div>
                    </div>

                    <div className="sl-file-hint">
                      מספיק לצרף תלושים מהתקופה הרלוונטית למחלוקת.
                    </div>

                    {/* הצגת שמות הקבצים */}
                    {payslips.length > 0 && (
                      <div className="sl-file-list">
                        {payslips.map((f, idx) => (
                          <div key={idx} className="sl-file-pill">
                            <span className="sl-file-pill-icon">🧾</span>
                            <span>{f.name}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* מסמכים נוספים */}
                  <div className="sl-doc-card">
                    <div className="sl-field">
                      <div className="sl-label-row">
                        <label className="sl-label" htmlFor="other_docs">
                          מסמכים נוספים
                        </label>
                        <span className="sl-label-hint">
                          מכתבים, הודעות, פרוטוקולים ועוד
                        </span>
                      </div>
                      <div className="sl-input-wrapper">
                        <span className="sl-input-icon">📎</span>
                        <input
                          id="other_docs"
                          type="file"
                          multiple
                          className="sl-file-input"
                          accept="application/pdf"
                          onChange={(e) =>
                            setOtherDocs(Array.from(e.target.files))
                          }
                        />
                      </div>
                    </div>

                    <div className="sl-file-hint">
                      לדוגמה: מכתבי פיטורים, מיילים, הודעות וואטסאפ מודפסות,
                      פרוטוקול שימוע וכו'.
                    </div>

                    {otherDocs.length > 0 && (
                      <div className="sl-file-list">
                        {otherDocs.map((f, idx) => (
                          <div key={idx} className="sl-file-pill">
                            <span className="sl-file-pill-icon">📎</span>
                            <span>{f.name}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </section>

              {/* MESSAGES */}
              {message && (
                <div className="sl-notice sl-notice-success">
                  <span className="sl-notice-icon">✅</span>
                  <span>{message}</span>
                </div>
              )}

              {error && (
                <div className="sl-notice sl-notice-error">
                  <span className="sl-notice-icon">⚠️</span>
                  <span>{error}</span>
                </div>
              )}

              <div className="sl-submit-row">
                <button
                  type="submit"
                  disabled={loading}
                  className="sl-btn-submit"
                >
                  {loading ? "שולח את הפרטים..." : "המשך לשיחה עם עוזר חכם"}
                </button>
                <span className="sl-submit-helper">
                  המידע נשמר בצורה מאובטחת ואינו משותף עם המעסיק.
                </span>
              </div>
            </form>

            {/* SIDE TIMELINE / EXPLANATION */}
            <aside className="sl-aside-card" data-intake-animate>
              <h2 className="sl-aside-title">מה קורה אחרי מילוי הטופס?</h2>
              <p className="sl-aside-sub">
                המערכת בונה תיק דיגיטלי מסודר ומעבירה אותך לשיחה קצרה עם העוזר
                החכם, לפני שעורך הדין נכנס לתמונה.
              </p>

              <ul className="sl-steps-list">
                <li className="sl-step-row">
                  <div className="sl-step-badge-wrap">
                    <div className="sl-step-badge">1</div>
                    <div className="sl-step-line" />
                  </div>
                  <div>
                    <div className="sl-step-title">יצירת תיק</div>
                    <div className="sl-step-text">
                      הפרטים והמסמכים מאורגנים לתיק מסודר הכולל פרטי העסקה,
                      משך העבודה וסוג הפנייה.
                    </div>
                  </div>
                </li>

                <li className="sl-step-row">
                  <div className="sl-step-badge-wrap">
                    <div className="sl-step-badge">2</div>
                    <div className="sl-step-line" />
                  </div>
                  <div>
                    <div className="sl-step-title">שיחה עם העוזר החכם</div>
                    <div className="sl-step-text">
                      העוזר שואל מספר שאלות ממוקדות, מסכם את המקרה ומדגיש נקודות
                      חשובות לעורך הדין.
                    </div>
                  </div>
                </li>

                <li className="sl-step-row">
                  <div className="sl-step-badge-wrap">
                    <div className="sl-step-badge">3</div>
                  </div>
                  <div>
                    <div className="sl-step-title">בחינת עורך הדין</div>
                    <div className="sl-step-text">
                      עורך הדין מקבל את כל החומר בצורה מובנית, בוחן את סיכויי
                      התביעה וממליץ על הצעדים הבאים.
                    </div>
                  </div>
                </li>
              </ul>

              <div className="sl-aside-foot">
                ניתן לעצור בכל שלב ולחזור מאוחר יותר – התיק שנוצר ישמר עבורך
                במערכת.
              </div>
            </aside>
          </div>
        </div>
      </main>
    </>
  );
}
