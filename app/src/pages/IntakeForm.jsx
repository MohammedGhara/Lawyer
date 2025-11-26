import React, { useState } from "react";
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

      navigate(`/chat/${caseId}`);
    } catch (err) {
      console.error(err);
      setError(err.message || "אירעה שגיאה בלתי צפויה");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* PRO UI STYLES */}
      <style>{`
       .sl-intake-page {
        min-height: 100vh;
        padding: 5rem 1.5rem 3.5rem;
        background:
          radial-gradient(circle at top left, #1d4ed8 0, #111827 40%, #020617 100%);
        color: #f9fafb;
        display: flex;
        align-items: flex-start;
        justify-content: center;
      }

        .sl-intake-shell {
          width: 100%;
          max-width: 1080px;
        }

        .sl-intake-header {
          display: flex;
          justify-content: space-between;
          gap: 1.5rem;
          margin-bottom: 1.9rem;
          flex-wrap: wrap;
        }

        .sl-intake-header-main {
          max-width: 640px;
          animation: sl-fade-up 0.6s ease-out forwards;
          opacity: 0;
          transform: translateY(16px);
        }

        .sl-intake-pill {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.35rem 0.95rem;
          border-radius: 999px;
          background: rgba(15,23,42,0.85);
          border: 1px solid rgba(148,163,184,0.4);
          font-size: 0.78rem;
          color: #9ca3af;
          margin-bottom: 0.8rem;
        }

        .sl-intake-pill-dot {
          width: 9px;
          height: 9px;
          border-radius: 999px;
          background: #22c55e;
        }

        .sl-intake-title {
          font-size: 2.3rem;
          font-weight: 800;
          margin-bottom: 0.45rem;
        }

        .sl-intake-sub {
          font-size: 0.98rem;
          color: #cbd5f5;
        }

        .sl-intake-meta {
          min-width: 210px;
          font-size: 0.82rem;
          color: #9ca3af;
          border-radius: 1.4rem;
          padding: 0.9rem 1.2rem;
          background: linear-gradient(135deg, rgba(15,23,42,0.95), rgba(30,64,175,0.98));
          box-shadow: 0 18px 40px rgba(15,23,42,0.7);
          animation: sl-fade-up 0.6s ease-out 0.1s forwards;
          opacity: 0;
          transform: translateY(20px);
          margin-top: 2.6rem;   /* 🔹 move the top small card down */
        }

        .sl-intake-meta-row {
          display: flex;
          justify-content: space-between;
          gap: 0.6rem;
          margin-bottom: 0.35rem;
        }

        .sl-intake-meta-label {
          color: #9ca3af;
        }
        .sl-intake-meta-value {
          font-weight: 600;
          color: #e5e7eb;
        }

        .sl-intake-layout {
          display: grid;
          grid-template-columns: minmax(0, 2.3fr) minmax(0, 1.1fr);
          gap: 1.8rem;
          align-items: flex-start;
          animation: sl-fade-up 0.7s ease-out 0.15s forwards;
          opacity: 0;
          transform: translateY(20px);
        }

        @media (max-width: 960px) {
          .sl-intake-layout {
            grid-template-columns: minmax(0, 1fr);
          }
          .sl-intake-meta {
            margin-top: 1rem;   /* a bit less margin on mobile */
          }
        }

        /* GLASS CARD */
        .sl-intake-card {
          position: relative;
          background: linear-gradient(
            145deg,
            rgba(15,23,42,0.96),
            rgba(15,23,42,0.90)
          );
          border-radius: 1.8rem;
          padding: 1.9rem 1.8rem 1.7rem;
          box-shadow:
            0 30px 80px rgba(15,23,42,0.85),
            0 0 0 1px rgba(148,163,184,0.32);
          backdrop-filter: blur(20px);
          overflow: hidden;
        }

        .sl-intake-card::before {
          content: "";
          position: absolute;
          inset: 0;
          border-radius: inherit;
          border: 1px solid rgba(148, 163, 184, 0.15);
          pointer-events: none;
        }

        .sl-intake-divider {
          height: 1px;
          background: radial-gradient(circle, rgba(148,163,184,0.6), transparent 70%);
          margin: 1.5rem 0 1.3rem;
        }

        .sl-intake-section-title {
          font-size: 0.98rem;
          font-weight: 700;
          margin-bottom: 0.45rem;
          color: #e5e7eb;
        }

        .sl-intake-section-sub {
          font-size: 0.82rem;
          color: #9ca3af;
          margin-bottom: 0.9rem;
        }

        .sl-intake-grid-2 {
          display: grid;
          grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
          gap: 1rem;
        }

        @media (max-width: 640px) {
          .sl-intake-grid-2 {
            grid-template-columns: minmax(0, 1fr);
          }
        }

        /* FIELDS */
        .sl-field {
          margin-bottom: 1.1rem;
        }

        .sl-label-row {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          margin-bottom: 0.25rem;
        }

        .sl-label {
          font-size: 0.86rem;
          font-weight: 600;
          color: #e5e7eb;
        }

        .sl-label span {
          color: #f97373;
        }

        .sl-label-hint {
          font-size: 0.78rem;
          color: #9ca3af;
        }

        .sl-input-wrapper {
          display: flex;
          align-items: center;
          gap: 0.55rem;
          padding: 0.65rem 0.8rem;
          border-radius: 0.9rem;
          background: rgba(15,23,42,0.85);
          border: 1px solid rgba(55,65,81,0.9);
          transition:
            border-color 0.16s ease,
            box-shadow 0.16s ease,
            background 0.16s ease,
            transform 0.16s ease;
        }

        .sl-input-wrapper:focus-within {
          border-color: #3b82f6;
          box-shadow: 0 0 0 1px rgba(59,130,246,0.7);
          background: rgba(15,23,42,0.98);
          transform: translateY(-1px);
        }

        .sl-input-icon {
          font-size: 1rem;
          opacity: 0.9;
        }

        .sl-input,
        .sl-select {
          width: 100%;
          border: none;
          outline: none;
          background: transparent;
          color: #e5e7eb;
          font-size: 0.92rem;
        }

        .sl-input::placeholder {
          color: #6b7280;
        }

        .sl-select {
          appearance: none;
          cursor: pointer;
        }
        .sl-file-input {
          width: 100%;
          font-size: 0.84rem;
          color: #e5e7eb;
          background: transparent;
          border: none;
          outline: none;
          cursor: pointer;
        }

        /* Custom file button */
        .sl-file-input::-webkit-file-upload-button,
        .sl-file-input::file-selector-button {
          margin-left: 0.75rem;
          padding: 0.45rem 1.2rem;
          border-radius: 999px;
          border: none;
          background: linear-gradient(135deg, #2563eb, #22c55e);
          color: #ffffff;
          font-weight: 600;
          font-size: 0.8rem;
          cursor: pointer;
          box-shadow: 0 12px 25px rgba(15, 23, 42, 0.7);
          transition: transform 0.15s ease, box-shadow 0.15s ease, opacity 0.1s ease;
        }

        .sl-file-input::-webkit-file-upload-button:hover,
        .sl-file-input::file-selector-button:hover {
          transform: translateY(-1px);
          box-shadow: 0 16px 35px rgba(15, 23, 42, 0.85);
        }

        .sl-file-input:disabled::-webkit-file-upload-button,
        .sl-file-input:disabled::file-selector-button {
          opacity: 0.6;
          cursor: default;
          box-shadow: none;
        }

        .sl-file-hint {
          font-size: 0.78rem;
          color: #9ca3af;
          margin-top: 0.25rem;
        }

        /* ===== DOCS SECTION LAYOUT (3 CARDS IN A ROW) ===== */
        .sl-docs-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 1rem;
          margin-top: 0.7rem;
        }

        @media (max-width: 1000px) {
          .sl-docs-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }

        @media (max-width: 640px) {
          .sl-docs-grid {
            grid-template-columns: minmax(0, 1fr);
          }
        }

        .sl-doc-card {
          border-radius: 1.1rem;
          padding: 0.85rem 0.9rem 0.9rem;
          background: radial-gradient(circle at top, rgba(15,23,42,0.98), rgba(15,23,42,0.92));
          border: 1px solid rgba(55,65,81,0.9);
          box-shadow: 0 12px 32px rgba(15,23,42,0.85);
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
          transform-origin: center;
          transition: transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease;
        }

        .sl-doc-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 18px 45px rgba(15,23,42,1);
          border-color: rgba(59,130,246,0.7);
        }

        .sl-doc-card .sl-field {
          margin-bottom: 0.4rem;
        }

        .sl-doc-card .sl-file-hint {
          margin-top: 0.1rem;
        }

        /* Selected file list */
        .sl-file-list {
          margin-top: 0.25rem;
          max-height: 4.5rem;
          overflow-y: auto;
          overflow-x: auto;
          scrollbar-width: thin;
          scrollbar-color: #4b5563 transparent;
        }

        .sl-file-list::-webkit-scrollbar {
          height: 6px;
          width: 6px;
        }

        .sl-file-list::-webkit-scrollbar-track {
          background: rgba(15, 23, 42, 0.95);
          border-radius: 999px;
        }

        .sl-file-list::-webkit-scrollbar-thumb {
          background: #6b7280;
          border-radius: 999px;
        }

        .sl-file-list::-webkit-scrollbar-thumb:hover {
          background: #9ca3af;
        }

        .sl-file-pill {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          padding: 0.25rem 0.55rem;
          border-radius: 999px;
          background: rgba(15,23,42,0.9);
          border: 1px solid rgba(55,65,81,0.9);
          font-size: 0.76rem;
          color: #e5e7eb;
          margin: 0.15rem 0.25rem 0 0.25rem;
          white-space: nowrap;
        }

        .sl-file-pill-icon {
          font-size: 0.78rem;
        }

        .sl-notice {
          margin-top: 1rem;
          margin-bottom: 0.2rem;
          padding: 0.7rem 0.9rem;
          border-radius: 0.9rem;
          font-size: 0.84rem;
          display: flex;
          gap: 0.45rem;
          align-items: flex-start;
          animation: sl-fade-in 0.25s ease-out;
        }

        .sl-notice-success {
          background: rgba(22,163,74,0.12);
          border: 1px solid rgba(22,163,74,0.4);
          color: #bbf7d0;
        }

        .sl-notice-error {
          background: rgba(248,113,113,0.08);
          border: 1px solid rgba(248,113,113,0.55);
          color: #fecaca;
        }

        .sl-notice-icon {
          margin-top: 0.1rem;
        }

        .sl-submit-row {
          margin-top: 1.4rem;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          flex-wrap: wrap;
        }

        .sl-btn-submit {
          background: linear-gradient(135deg, #2563eb, #22c55e);
          border: none;
          border-radius: 999px;
          padding: 0.85rem 2.6rem;
          color: #ffffff;
          font-weight: 600;
          font-size: 0.96rem;
          cursor: pointer;
          box-shadow: 0 20px 45px rgba(15,23,42,0.9);
          transition: transform 0.17s ease, box-shadow 0.17s ease, opacity 0.1s ease;
        }

        .sl-btn-submit:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 24px 60px rgba(15,23,42,1);
        }

        .sl-btn-submit:disabled {
          opacity: 0.65;
          cursor: default;
          box-shadow: none;
        }

        .sl-submit-helper {
          font-size: 0.8rem;
          color: #9ca3af;
        }

        /* RIGHT TIMELINE CARD */
        .sl-aside-card {
          border-radius: 1.8rem;
          padding: 1.5rem 1.4rem 1.4rem;
          background: linear-gradient(150deg, rgba(15,23,42,0.98), rgba(30,64,175,0.9));
          box-shadow: 0 26px 65px rgba(15,23,42,0.9);
          animation: sl-fade-up 0.8s ease-out 0.25s forwards;
          opacity: 0;
          transform: translateY(24px);
          margin-top: 3rem;   /* 🔹 move the big timeline card down */
        }

        @media (max-width: 960px) {
          .sl-aside-card {
            margin-top: 1.6rem;
          }
        }

        .sl-aside-title {
          font-size: 0.96rem;
          font-weight: 700;
          margin-bottom: 0.4rem;
        }

        .sl-aside-sub {
          font-size: 0.82rem;
          color: #cbd5f5;
          margin-bottom: 1.1rem;
        }

        .sl-steps-list {
          list-style: none;
          padding: 0;
          margin: 0 0 1.2rem 0;
        }

        .sl-step-row {
          display: grid;
          grid-template-columns: auto 1fr;
          gap: 0.7rem;
          margin-bottom: 0.8rem;
        }

        .sl-step-badge-wrap {
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .sl-step-badge {
          width: 28px;
          height: 28px;
          border-radius: 999px;
          background: #1d4ed8;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.8rem;
          font-weight: 700;
          color: #e5e7eb;
          box-shadow: 0 10px 24px rgba(15,23,42,0.9);
        }

        .sl-step-line {
          flex: 1;
          width: 2px;
          margin-top: 0.2rem;
          background: linear-gradient(to bottom, #4b5563, transparent);
        }

        .sl-step-title {
          font-size: 0.86rem;
          font-weight: 600;
          margin-bottom: 0.15rem;
        }

        .sl-step-text {
          font-size: 0.78rem;
          color: #cbd5f5;
        }

        .sl-aside-foot {
          font-size: 0.78rem;
          color: #9ca3af;
          border-top: 1px solid rgba(148,163,184,0.4);
          padding-top: 0.8rem;
        }

        /* Animations */
        @keyframes sl-fade-up {
          0% { opacity: 0; transform: translateY(22px); }
          100% { opacity: 1; transform: translateY(0); }
        }

        @keyframes sl-fade-in {
          0% { opacity: 0; }
          100% { opacity: 1; }
        }
      `}</style>

      <main className="sl-intake-page" dir="rtl">
        <div className="sl-intake-shell">
          {/* HEADER */}
          <header className="sl-intake-header">
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

            <aside className="sl-intake-meta">
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

          <div className="sl-intake-layout">
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
                        name="phone"
                        className="sl-input"
                        value={form.phone}
                        onChange={handleChange}
                        required
                        placeholder="050-0000000"
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
                  <div className="sl-input-wrapper">
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
            <aside className="sl-aside-card">
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
