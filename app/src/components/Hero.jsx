// app/src/components/Hero.jsx
import React from "react";

export default function Hero({ onStart }) {
  return (
    <section
      style={{
        background:
          "radial-gradient(circle at top left, #1d4ed8 0, #111827 45%, #020617 100%)",
        color: "white",
      }}
    >
      <div
        style={{
          maxWidth: "1100px",
          margin: "0 auto",
          padding: "4.5rem 1.5rem 4rem",
          display: "flex",
          flexWrap: "wrap-reverse",
          gap: "2.5rem",
          alignItems: "center",
          direction: "rtl",
        }}
      >
        {/* ---------- RIGHT: TEXT BLOCK ---------- */}
        <div style={{ flex: "1 1 320px" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.4rem",
              padding: "0.25rem 0.7rem",
              borderRadius: "999px",
              background: "rgba(15, 23, 42, 0.7)",
              marginBottom: "1rem",
              fontSize: "0.8rem",
            }}
          >
            <span
              style={{
                width: "18px",
                height: "18px",
                borderRadius: "999px",
                background: "#22c55e",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "0.9rem",
              }}
            >
              ✔
            </span>
            <span>עוזר חכם לדיני עבודה – 24/7</span>
          </div>

          <h1
            style={{
              fontSize: "2.4rem",
              lineHeight: 1.2,
              fontWeight: 800,
              marginBottom: "0.75rem",
            }}
          >
            מקבלים החלטות חכמות
            <br />
            לפני שמחליטים לתבוע.
          </h1>

          <p
            style={{
              fontSize: "1.02rem",
              color: "#e5e7eb",
              maxWidth: "540px",
              marginBottom: "1.8rem",
            }}
          >
            &quot;משפט חכם&quot; מנתח את המקרה שלכם, מסביר את הזכויות בשפה
            פשוטה ומכין עבור עורך הדין תקציר ברור – כדי שתגיעו לפגישה הרבה יותר
            מוכנים.
          </p>

          {/* CTA buttons */}
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "0.8rem",
              marginBottom: "1.6rem",
            }}
          >
            <button
              type="button"
              onClick={onStart}
              style={{
                padding: "0.9rem 1.8rem",
                borderRadius: "999px",
                border: "none",
                background: "#3b82f6",
                color: "white",
                fontWeight: 600,
                fontSize: "1rem",
                cursor: "pointer",
                boxShadow: "0 18px 40px rgba(37, 99, 235, 0.55)",
              }}
            >
              התחלת בדיקת זכויות
            </button>

            <button
              type="button"
              onClick={() => {
                const el = document.getElementById("how-it-works");
                if (el) el.scrollIntoView({ behavior: "smooth" });
              }}
              style={{
                padding: "0.85rem 1.6rem",
                borderRadius: "999px",
                border: "1px solid rgba(148, 163, 184, 0.7)",
                background: "transparent",
                color: "#e5e7eb",
                fontWeight: 500,
                fontSize: "0.96rem",
                cursor: "pointer",
              }}
            >
              איך זה עובד?
            </button>
          </div>

          {/* Trust strip */}
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "1.2rem",
              fontSize: "0.9rem",
              color: "#9ca3af",
            }}
          >
            <div>
              <span style={{ color: "#22c55e", marginLeft: "0.3rem" }}>●</span>
              מידע מאובטח ולא מועבר למעסיק
            </div>
            <div>
              <span style={{ color: "#22c55e", marginLeft: "0.3rem" }}>●</span>
              מותאם לדיני עבודה בישראל
            </div>
          </div>
        </div>

        {/* ---------- LEFT: ILLUSTRATION / CARD ---------- */}
        <div
          style={{
            flex: "1 1 300px",
            display: "flex",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: "380px",
              borderRadius: "1.5rem",
              padding: "1.4rem 1.2rem",
              background:
                "linear-gradient(145deg, rgba(15,23,42,0.95), rgba(30,64,175,0.9))",
              boxShadow: "0 24px 60px rgba(15, 23, 42, 0.75)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "1rem",
              }}
            >
              <div style={{ display: "flex", gap: "0.4rem", direction: "ltr" }}>
                <span
                  style={{
                    width: "8px",
                    height: "8px",
                    borderRadius: "999px",
                    background: "#f97373",
                  }}
                />
                <span
                  style={{
                    width: "8px",
                    height: "8px",
                    borderRadius: "999px",
                    background: "#facc15",
                  }}
                />
                <span
                  style={{
                    width: "8px",
                    height: "8px",
                    borderRadius: "999px",
                    background: "#22c55e",
                  }}
                />
              </div>
              <span style={{ fontSize: "0.8rem", color: "#9ca3af" }}>
                צ׳אט עוזר חכם
              </span>
            </div>

            <div
              style={{
                background: "rgba(15,23,42,0.92)",
                borderRadius: "1rem",
                padding: "0.9rem 0.9rem 0.8rem",
                marginBottom: "1rem",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  marginBottom: "0.7rem",
                }}
              >
                <div
                  style={{
                    maxWidth: "82%",
                    background:
                      "linear-gradient(135deg, #2563eb, #38bdf8)",
                    padding: "0.6rem 0.75rem",
                    borderRadius: "1rem 1rem 0.2rem 1rem",
                    fontSize: "0.85rem",
                  }}
                >
                  פיטרו אותי בלי שימוע, ואני לא בטוח/ה אם מגיע לי פיצוי.
                </div>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-start",
                }}
              >
                <div
                  style={{
                    maxWidth: "88%",
                    background: "rgba(15, 23, 42, 0.9)",
                    border: "1px solid rgba(148, 163, 184, 0.6)",
                    padding: "0.6rem 0.75rem",
                    borderRadius: "1rem 1rem 1rem 0.2rem",
                    fontSize: "0.83rem",
                    color: "#e5e7eb",
                  }}
                >
                  נראה שיש לך עילה לבדיקה. אסכם את הפרטים עבור עורך הדין,
                  נבדוק פיצויי פיטורים, הודעה מוקדמת וזכויות נוספות.
                </div>
              </div>
            </div>

            {/* Stats bar */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, minmax(0,1fr))",
                gap: "0.7rem",
                fontSize: "0.8rem",
              }}
            >
              <div
                style={{
                  padding: "0.6rem 0.7rem",
                  borderRadius: "0.9rem",
                  background: "rgba(15, 23, 42, 0.85)",
                  border: "1px solid rgba(55, 65, 81, 0.9)",
                }}
              >
                <div style={{ color: "#9ca3af", marginBottom: "0.15rem" }}>
                  זמן מילוי
                </div>
                <div style={{ fontWeight: 700 }}>~ 5 דקות</div>
              </div>
              <div
                style={{
                  padding: "0.6rem 0.7rem",
                  borderRadius: "0.9rem",
                  background: "rgba(15, 23, 42, 0.85)",
                  border: "1px solid rgba(55, 65, 81, 0.9)",
                }}
              >
                <div style={{ color: "#9ca3af", marginBottom: "0.15rem" }}>
                  מסמכים
                </div>
                <div style={{ fontWeight: 700 }}>חוזה, תלושים</div>
              </div>
              <div
                style={{
                  padding: "0.6rem 0.7rem",
                  borderRadius: "0.9rem",
                  background: "rgba(15, 23, 42, 0.85)",
                  border: "1px solid rgba(55, 65, 81, 0.9)",
                }}
              >
                <div style={{ color: "#9ca3af", marginBottom: "0.15rem" }}>
                  סטטוס תיק
                </div>
                <div style={{ fontWeight: 700, color: "#22c55e" }}>
                  מוכן לסקירה
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}