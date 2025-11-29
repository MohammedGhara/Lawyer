// app/src/pages/Home.jsx
import React, { useEffect } from "react";
import '../styles/Home.css';

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
