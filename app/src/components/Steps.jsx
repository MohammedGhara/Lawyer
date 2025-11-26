import React from "react";

const steps = [
  {
    number: 1,
    title: "מילוי טופס פשוט",
    text: "ממלאים פרטים בסיסיים ומעלים מסמכים רלוונטיים.",
  },
  {
    number: 2,
    title: "שיחה עם עוזר חכם",
    text: "הצ׳אטבוט שלנו אוסף את כל המידע הנדרש לתיק שלכם.",
  },
  {
    number: 3,
    title: "קביעת פגישה",
    text: "בוחרים מועד נוח לפגישה עם עורך הדין.",
  },
  {
    number: 4,
    title: "ליווי מקצועי",
    text: "עורך דין מומחה בדיני עבודה ילווה אתכם בתהליך.",
  },
];

export default function Steps() {
  return (
    <section style={{ background: "white" }}>
      <div
        style={{
          maxWidth: "1100px",
          margin: "0 auto",
          padding: "3rem 1.5rem 3.5rem",
        }}
      >
        <h2
          style={{
            fontSize: "2rem",
            fontWeight: 700,
            textAlign: "center",
            marginBottom: "0.5rem",
          }}
        >
          איך זה עובד?
        </h2>
        <p
          style={{
            textAlign: "center",
            color: "#6b7280",
            marginBottom: "2.5rem",
          }}
        >
          תהליך פשוט בארבעה שלבים שיעזור לכם לקבל את הזכויות המגיעות לכם.
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
            gap: "1.5rem",
          }}
        >
          {steps.map((step) => (
            <div
              key={step.number}
              style={{
                position: "relative",
                background: "#f9fafb",
                borderRadius: "1.25rem",
                padding: "1.5rem",
                boxShadow: "0 10px 25px rgba(15, 23, 42, 0.06)",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  top: "-0.85rem",
                  left: "1.2rem",
                  width: "2.1rem",
                  height: "2.1rem",
                  borderRadius: "999px",
                  background: "#2563eb",
                  color: "white",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 700,
                  fontSize: "0.95rem",
                  boxShadow: "0 10px 20px rgba(37, 99, 235, 0.4)",
                }}
              >
                {step.number}
              </div>
              <h3
                style={{
                  fontSize: "1.05rem",
                  fontWeight: 600,
                  marginBottom: "0.4rem",
                }}
              >
                {step.title}
              </h3>
              <p style={{ fontSize: "0.9rem", color: "#4b5563" }}>
                {step.text}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
