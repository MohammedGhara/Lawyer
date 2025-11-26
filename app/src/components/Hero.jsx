import React from "react";

export default function Hero({ onStart }) {
  return (
    <section
      style={{
        minHeight: "80vh",
        background:
          "linear-gradient(135deg, #1d4ed8 0%, #1e40af 45%, #020617 100%)",
        color: "white",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        paddingTop: "4.5rem",
      }}
    >
      <div
        style={{
          maxWidth: "1100px",
          margin: "0 auto",
          padding: "3rem 1.5rem",
          display: "grid",
          gridTemplateColumns: "minmax(0, 1.1fr) minmax(0, 0.9fr)",
          gap: "2.5rem",
          alignItems: "center",
        }}
      >
        <div>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              background: "rgba(15, 23, 42, 0.6)",
              borderRadius: "999px",
              padding: "0.35rem 0.9rem",
              fontSize: "0.9rem",
              marginBottom: "1.2rem",
            }}
          >
            <span>⚖️</span>
            <span>מערכת חכמה לדיני עבודה</span>
          </div>

          <h1
            style={{
              fontSize: "3rem",
              lineHeight: 1.1,
              fontWeight: 800,
              marginBottom: "0.75rem",
            }}
          >
            הזכויות שלכם בעבודה
            <br />
            <span style={{ color: "#bfdbfe" }}>מגיעות לכם</span>
          </h1>

          <p
            style={{
              fontSize: "1.05rem",
              maxWidth: "32rem",
              color: "#e2e8f0",
              marginBottom: "1.8rem",
            }}
          >
            מערכת חכמה שמסייעת לכם לאסוף את כל המידע הנדרש לתביעת דיני עבודה,
            ומחברת אתכם עם עורך דין מומחה בתחום.
          </p>

          <button
            onClick={onStart}
            style={{
              background: "#f97316",
              borderRadius: "999px",
              border: "none",
              padding: "0.9rem 2.4rem",
              fontSize: "1.05rem",
              fontWeight: 600,
              color: "white",
              boxShadow: "0 18px 40px rgba(15, 23, 42, 0.45)",
            }}
          >
            התחלת פנייה חדשה
          </button>
        </div>

        {/* תמונה צדדית – כרגע קופסת צבע במקום תמונה אמיתית */}
        <div
          style={{
            borderRadius: "1.5rem",
            background:
              "linear-gradient(145deg, rgba(15, 23, 42, 0.9), rgba(30, 64, 175, 0.9))",
            border: "1px solid rgba(191, 219, 254, 0.3)",
            padding: "1.5rem",
            color: "#e5e7eb",
          }}
        >
          <h3
            style={{
              fontSize: "1.2rem",
              fontWeight: 600,
              marginBottom: "0.75rem",
            }}
          >
            מה מקבלים במערכת?
          </h3>
          <ul style={{ listStyle: "none", paddingRight: 0, fontSize: "0.95rem" }}>
            <li>• איסוף אוטומטי של נתוני התיק</li>
            <li>• העלאת מסמכים רלוונטיים (תלושים, חוזה, מכתב פיטורים)</li>
            <li>• שיחה עם צ׳אטבוט ייעודי לדיני עבודה</li>
            <li>• קביעת פגישה מסודרת עם עורך הדין</li>
          </ul>
        </div>
      </div>
    </section>
  );
}
