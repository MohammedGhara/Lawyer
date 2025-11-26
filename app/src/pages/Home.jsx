// app/src/pages/Home.jsx
import React, { useEffect } from "react";

export default function Home({ onStartIntake }) {
  // Simple scroll-in animations
  useEffect(() => {
    const elements = document.querySelectorAll("[data-sl-animate]");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("sl-animate-in");
            observer.unobserve(e.target);
          }
        });
      },
      { threshold: 0.2 }
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const steps = [
    {
      number: 1,
      title: "מילוי טופס קצר",
      text: "מזינים פרטים בסיסיים, מעלים חוזה ותלושי שכר והמערכת מארגנת אותם לתיק מסודר.",
    },
    {
      number: 2,
      title: "שיחה עם עוזר חכם",
      text: "הצ׳אטבוט שואל שאלות ממוקדות, מסביר את הזכויות ומכין תקציר ברור לעורך הדין.",
    },
    {
      number: 3,
      title: "קביעת פגישה",
      text: "בוחרים יחד מועד נוח – פרונטלי או אונליין – ישירות מתוך המערכת.",
    },
    {
      number: 4,
      title: "ליווי משפטי מקצועי",
      text: "עורך דין מומחה בדיני עבודה בוחן את התיק ומלווה אתכם עד לקבלת ההחלטה הנכונה.",
    },
  ];

  const domains = [
    "פיטורים שלא כדין ושימוע לא תקין",
    "אי תשלום שכר / הלנת שכר",
    "פגיעה בזכויות סוציאליות והפרשות לפנסיה",
    "שעות נוספות, כוננויות והחזרי הוצאות",
  ];

  const stats = [
    { label: "זמן מילוי ממוצע", value: "~ 5 דקות" },
    { label: "מסמכים עיקריים", value: "חוזה, תלושים" },
    { label: "סטטוס תיק בסיום", value: "מוכן לסקירה" },
  ];

  return (
    <>
      {/* All styles & animations live here */}
      <style>{`
        .sl-home-root {
          min-height: 100vh;
          background: #0f172a;
        }

        .sl-hero {
          background:
            radial-gradient(circle at top left, #1d4ed8 0, #111827 40%, #020617 100%);
          color: #f9fafb;
        }

        .sl-container {
          max-width: 1120px;
          margin: 0 auto;
          padding: 4.5rem 1.5rem 4rem;
        }

        .sl-grid-hero {
          display: grid;
          grid-template-columns: minmax(0, 1.3fr) minmax(0, 1fr);
          gap: 2.5rem;
          align-items: center;
        }

        @media (max-width: 900px) {
          .sl-grid-hero {
            grid-template-columns: minmax(0, 1fr);
          }
          .sl-hero-text {
            text-align: center;
          }
        }

        .sl-pill {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          padding: 0.25rem 0.7rem;
          border-radius: 999px;
          background: rgba(15, 23, 42, 0.8);
          font-size: 0.8rem;
          margin-bottom: 0.9rem;
        }

        .sl-pill-dot {
          width: 16px;
          height: 16px;
          border-radius: 999px;
          background: #22c55e;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-size: 0.8rem;
        }

        .sl-hero-title {
          font-size: 2.5rem;
          line-height: 1.2;
          font-weight: 800;
          margin-bottom: 0.8rem;
        }

        .sl-hero-sub {
          font-size: 1.03rem;
          color: #e5e7eb;
          max-width: 540px;
          margin-bottom: 1.9rem;
        }

        .sl-hero-ctas {
          display: flex;
          flex-wrap: wrap;
          gap: 0.8rem;
          margin-bottom: 1.6rem;
        }

        .sl-btn-primary {
          padding: 0.95rem 1.9rem;
          border-radius: 999px;
          border: none;
          background: linear-gradient(135deg, #2563eb, #22c55e);
          color: white;
          font-weight: 600;
          font-size: 1rem;
          cursor: pointer;
          box-shadow: 0 18px 40px rgba(37, 99, 235, 0.55);
          transition: transform 0.18s ease, box-shadow 0.18s ease;
        }

        .sl-btn-primary:hover {
          transform: translateY(-1px);
          box-shadow: 0 20px 45px rgba(37, 99, 235, 0.7);
        }

        .sl-btn-ghost {
          padding: 0.9rem 1.7rem;
          border-radius: 999px;
          border: 1px solid rgba(148, 163, 184, 0.75);
          background: transparent;
          color: #e5e7eb;
          font-weight: 500;
          font-size: 0.96rem;
          cursor: pointer;
          transition: background 0.18s ease, color 0.18s ease;
        }

        .sl-btn-ghost:hover {
          background: rgba(15, 23, 42, 0.9);
          color: #ffffff;
        }

        .sl-hero-trust {
          display: flex;
          flex-wrap: wrap;
          gap: 1.2rem;
          font-size: 0.9rem;
          color: #9ca3af;
        }

        .sl-hero-trust-dot {
          margin-left: 0.3rem;
          color: #22c55e;
        }

        /* Chat card */
        .sl-hero-card-wrap {
          display: flex;
          justify-content: center;
        }

        .sl-hero-card {
          width: 100%;
          max-width: 380px;
          border-radius: 1.5rem;
          padding: 1.4rem 1.2rem;
          background: linear-gradient(145deg, rgba(15,23,42,0.95), rgba(30,64,175,0.9));
          box-shadow: 0 24px 60px rgba(15, 23, 42, 0.8);
          animation: sl-float 7s ease-in-out infinite;
        }

        .sl-window-dots {
          display: flex;
          gap: 0.4rem;
          direction: ltr;
        }

        .sl-window-dot {
          width: 8px;
          height: 8px;
          border-radius: 999px;
        }

        .sl-window-dot.red { background: #f97373; }
        .sl-window-dot.yellow { background: #facc15; }
        .sl-window-dot.green { background: #22c55e; }

        .sl-card-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 1rem;
          font-size: 0.8rem;
          color: #9ca3af;
        }

        .sl-chat-bubble-user,
        .sl-chat-bubble-bot {
          max-width: 85%;
          padding: 0.65rem 0.8rem;
          border-radius: 1rem;
          font-size: 0.83rem;
        }

        .sl-chat-bubble-user {
          background: linear-gradient(135deg, #2563eb, #38bdf8);
          border-radius: 1rem 1rem 0.2rem 1rem;
        }

        .sl-chat-bubble-bot {
          background: rgba(15,23,42,0.95);
          border: 1px solid rgba(148, 163, 184, 0.6);
          border-radius: 1rem 1rem 1rem 0.3rem;
        }

        .sl-chat-row {
          display: flex;
          margin-bottom: 0.65rem;
        }
        .sl-chat-row.user { justify-content: flex-end; }
        .sl-chat-row.bot { justify-content: flex-start; }

        .sl-card-stats {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 0.7rem;
          margin-top: 1rem;
          font-size: 0.8rem;
        }

        .sl-card-stat {
          padding: 0.6rem 0.7rem;
          border-radius: 0.9rem;
          background: rgba(15, 23, 42, 0.85);
          border: 1px solid rgba(55, 65, 81, 0.9);
        }

        .sl-card-stat-label {
          color: #9ca3af;
          margin-bottom: 0.15rem;
        }

        .sl-card-stat-value {
          font-weight: 700;
        }

        /* Sections below */
        .sl-section-light {
          background: #ffffff;
        }

        .sl-section-muted {
          background: #f3f4f6;
        }

        .sl-section-inner {
          max-width: 1120px;
          margin: 0 auto;
          padding: 3.3rem 1.5rem 3.7rem;
        }

        .sl-section-title {
          font-size: 2rem;
          font-weight: 700;
          text-align: center;
          margin-bottom: 0.6rem;
        }

        .sl-section-sub {
          text-align: center;
          color: #6b7280;
          margin-bottom: 2.4rem;
          font-size: 0.98rem;
        }

        /* ===== NEW STEPS DESIGN ===== */

        .sl-steps-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 1.4rem;
        }

        @media (max-width: 1000px) {
          .sl-steps-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }

        @media (max-width: 640px) {
          .sl-steps-grid {
            grid-template-columns: minmax(0, 1fr);
          }
        }

       .sl-step-card {
          position: relative;
          background: radial-gradient(circle at top, #f9fafb 0, #ffffff 45%, #f3f4f6 100%);
          border-radius: 1.8rem;
          padding: 3rem 1.8rem 2.4rem; /* BIGGER */
          min-height: 230px;           /* NEW — makes the card taller */
          box-shadow:
            0 22px 48px rgba(15, 23, 42, 0.08),
            0 0 0 1px rgba(148, 163, 184, 0.16);
          text-align: center;
          transition: transform 0.18s ease, box-shadow 0.18s ease, background 0.18s ease;
        }
        .sl-step-card:hover {
          transform: translateY(-5px);
          box-shadow:
            0 26px 60px rgba(15, 23, 42, 0.12),
            0 0 0 1px rgba(37, 99, 235, 0.25);
          background: radial-gradient(circle at top, #eff6ff 0, #ffffff 55%, #eef2ff 100%);
        }

       .sl-step-badge-wrap {
          position: absolute;
          top: -25px;      /* moved up for the bigger circle */
          left: 50%;
          transform: translateX(-50%);
          width: 55px;     /* bigger */
          height: 55px;    /* bigger */
          z-index: 2;
        }

     .sl-step-badge-glow {
      position: absolute;
      inset: 0;
      filter: blur(16px); /* stronger glow */
      background: radial-gradient(circle, rgba(37, 99, 235, 0.85), transparent 70%);
      opacity: 1;
      z-index: 1;
    }

     .sl-step-badge {
        position: relative;
        width: 55px;     /* bigger */
        height: 55px;    /* bigger */
        border-radius: 999px;
        background: linear-gradient(145deg, #2563eb, #3b82f6);
        color: #ffffff !important;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 800;
        font-size: 1.5rem; /* bigger number */
        box-shadow: 0 18px 38px rgba(37, 99, 235, 0.6);
        z-index: 2;
        text-shadow: 0 0 4px rgba(15, 23, 42, 0.7);
      }


        .sl-step-title {
          margin-top: 0.4rem;
          margin-bottom: 0.5rem;
          font-size: 1.05rem;
          font-weight: 700;
          color: #0f172a;
        }

        .sl-step-text {
          font-size: 0.9rem;
          color: #4b5563;
          line-height: 1.6;
        }

        /* Domains section stays mostly as before */
        .sl-domains-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 1.3rem;
        }

        @media (max-width: 800px) {
          .sl-domains-grid {
            grid-template-columns: minmax(0, 1fr);
          }
        }

        .sl-domain-card {
          background: #ffffff;
          border-radius: 1rem;
          padding: 1.2rem 1.4rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          box-shadow: 0 8px 20px rgba(15, 23, 42, 0.04);
          border: 1px solid #e5e7eb;
        }

        .sl-domain-text {
          flex: 1;
          margin-right: 0.8rem;
          font-size: 1.02rem;
          font-weight: 500;
          color: #111827;
        }

        .sl-domain-icon {
          width: 40px;
          height: 40px;
          border-radius: 999px;
          background: #2563eb;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #ffffff;
          font-size: 1.1rem;
        }

        .sl-domain-check {
          color: #22c55e;
          font-size: 1.25rem;
        }

        .sl-cta-bottom {
          text-align: center;
          margin-top: 2.4rem;
        }

        .sl-cta-bottom-text {
          margin-bottom: 1rem;
          font-size: 1.02rem;
          color: #374151;
        }

        /* Scroll animation */
        [data-sl-animate] {
          opacity: 0;
          transform: translateY(24px);
          transition: opacity 0.6s ease, transform 0.6s ease;
        }

        .sl-animate-in {
          opacity: 1;
          transform: translateY(0);
        }

        /* Float animation for the hero card */
        @keyframes sl-float {
          0%   { transform: translateY(0px); }
          50%  { transform: translateY(-8px); }
          100% { transform: translateY(0px); }
        }
      `}</style>

      <main className="sl-home-root" dir="rtl">
        {/* HERO SECTION – unchanged */}
        {/* ... (hero code exactly like you already have) ... */}
        {/* I’ll keep it here so you have one full file: */}

        <section className="sl-hero">
          <div className="sl-container sl-grid-hero">
            <div className="sl-hero-text" data-sl-animate>
              <div className="sl-pill">
                <span className="sl-pill-dot">✔</span>
                <span>עוזר חכם לדיני עבודה – מסכם את המקרה עבור עורך הדין</span>
              </div>

              <h1 className="sl-hero-title">
                מקבלים החלטות חכמות
                <br />
                לפני שמחליטים לתבוע.
              </h1>

              <p className="sl-hero-sub">
                &quot;משפט חכם&quot; אוסף את הפרטים, מנתח את הזכויות ומכין תקציר
                ברור לעורך הדין – כדי שתגיעו לפגישה רגועים, ממוקדים, ועם כל
                המסמכים הנכונים.
              </p>

              <div className="sl-hero-ctas">
                <button
                  type="button"
                  className="sl-btn-primary"
                  onClick={onStartIntake}
                >
                  התחלת בדיקת זכויות
                </button>

                <button
                  type="button"
                  className="sl-btn-ghost"
                  onClick={() => {
                    const el = document.getElementById("sl-how-it-works");
                    if (el) el.scrollIntoView({ behavior: "smooth" });
                  }}
                >
                  לראות איך זה עובד
                </button>
              </div>

              <div className="sl-hero-trust">
                <div>
                  <span className="sl-hero-trust-dot">●</span>
                  מידע מאובטח – לא משותף עם המעסיק
                </div>
                <div>
                  <span className="sl-hero-trust-dot">●</span>
                  מותאם לדיני עבודה בישראל
                </div>
              </div>
            </div>

            <div className="sl-hero-card-wrap" data-sl-animate>
              <div className="sl-hero-card">
                <div className="sl-card-header">
                  <div className="sl-window-dots">
                    <span className="sl-window-dot red" />
                    <span className="sl-window-dot yellow" />
                    <span className="sl-window-dot green" />
                  </div>
                  <span>צ׳אט – סיכום מקרה</span>
                </div>

                <div
                  style={{
                    background: "rgba(15,23,42,0.95)",
                    borderRadius: "1rem",
                    padding: "0.9rem 0.9rem 0.7rem",
                    marginBottom: "1rem",
                  }}
                >
                  <div className="sl-chat-row user">
                    <div className="sl-chat-bubble-user">
                      פיטרו אותי בלי שימוע, ועבדתי שם שלוש שנים במשרה מלאה.
                    </div>
                  </div>
                  <div className="sl-chat-row bot">
                    <div className="sl-chat-bubble-bot">
                      לפי הנתונים הראשוניים, ייתכן שמדובר בפיטורים שלא כדין.
                      אסכם לעורך הדין את משך ההעסקה, השכר, נסיבות הפיטורים והאם
                      ניתנה הודעה מוקדמת.
                    </div>
                  </div>
                </div>

                <div className="sl-card-stats">
                  {stats.map((s) => (
                    <div key={s.label} className="sl-card-stat">
                      <div className="sl-card-stat-label">{s.label}</div>
                      <div
                        className="sl-card-stat-value"
                        style={
                          s.value === "מוכן לסקירה"
                            ? { color: "#22c55e" }
                            : undefined
                        }
                      >
                        {s.value}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* HOW IT WORKS – uses NEW CARD DESIGN */}
        <section id="sl-how-it-works" className="sl-section-light">
          <div className="sl-section-inner">
            <div data-sl-animate>
              <h2 className="sl-section-title">איך זה עובד?</h2>
              <p className="sl-section-sub">
                תהליך ברור, קצר ומדויק – משלב מילוי הטופס ועד לפגישה עם עורך הדין.
              </p>
            </div>

            <div className="sl-steps-grid">
              {steps.map((step) => (
                <div
                  key={step.number}
                  className="sl-step-card"
                  data-sl-animate
                >
                  <div className="sl-step-badge-wrap">
                    <div className="sl-step-badge-glow" />
                    <div className="sl-step-badge">{step.number}</div>
                  </div>
                  <h3 className="sl-step-title">{step.title}</h3>
                  <p className="sl-step-text">{step.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* DOMAINS SECTION – unchanged */}
        <section className="sl-section-muted">
          <div className="sl-section-inner">
            <div data-sl-animate>
              <h2 className="sl-section-title">תחומי התמחות</h2>
              <p className="sl-section-sub">
                המערכת מותאמת למצבים הנפוצים ביותר בדיני עבודה – כדי שלא תישארו
                לבד מול המעסיק.
              </p>
            </div>

            <div className="sl-domains-grid">
              {domains.map((d) => (
                <div key={d} className="sl-domain-card" data-sl-animate>
                  <span className="sl-domain-check">✔</span>
                  <span className="sl-domain-text">{d}</span>
                  <div className="sl-domain-icon">⚖️</div>
                </div>
              ))}
            </div>

            <div className="sl-cta-bottom" data-sl-animate>
              <p className="sl-cta-bottom-text">
                לא בטוחים לאיזה תחום המקרה שלכם שייך? התחילו בטופס הראשוני –
                העוזר החכם כבר ישאל את השאלות הנכונות.
              </p>
              <button
                type="button"
                className="sl-btn-primary"
                onClick={onStartIntake}
              >
                התחלת מילוי טופס
              </button>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
