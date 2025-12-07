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
      <main className="sl-home-root" dir="rtl">
        {/* HERO SECTION */}
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

        {/* HOW IT WORKS */}
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

        {/* DOMAINS SECTION */}
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

        {/* --- NEW CONTACT SECTION --- */}
        <section className="sl-section-light" id="contact" style={{ borderTop: "1px solid #e2e8f0" }}>
          <div className="sl-section-inner">
            <div data-sl-animate style={{ textAlign: "center", marginBottom: "2rem" }}>
              <h2 className="sl-section-title">יש לכם שאלות נוספות?</h2>
              <p className="sl-section-sub">
                אנחנו זמינים לכל שאלה בוואטסאפ או במייל
              </p>
            </div>

            <div className="sl-contact-grid">
              {/* WhatsApp Button */}
              <a
                href="https://wa.me/972549470881"
                target="_blank"
                rel="noopener noreferrer"
                className="sl-contact-card whatsapp"
                data-sl-animate
              >
                <div className="sl-icon-wrapper">
                  <svg viewBox="0 0 24 24" width="32" height="32" fill="currentColor">
                    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
                  </svg>
                </div>
                <div className="sl-text-wrapper">
                  <h3>וואטסאפ</h3>
                  <span>054-947-0881</span>
                </div>
              </a>

              {/* Email Button */}
              <a
                href="mailto:muhambs@ac.sce.ac.il"
                className="sl-contact-card email"
                data-sl-animate
              >
                <div className="sl-icon-wrapper">
                  <svg viewBox="0 0 24 24" width="32" height="32" fill="currentColor">
                    <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                  </svg>
                </div>
                <div className="sl-text-wrapper">
                  <h3>אימייל</h3>
                  <span>muhambs@ac.sce.ac.il</span>
                </div>
              </a>
            </div>
          </div>
        </section>
        {/* --- END NEW CONTACT SECTION --- */}

      </main>
    </>
  );
}