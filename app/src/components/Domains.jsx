// app/src/components/Domains.jsx
import React from "react";

const domains = [
  "פיטורים שלא כדין",
  "אי תשלום שכר / הלנת שכר",
  "פגיעה בזכויות עובדים",
  "שעות נוספות שלא שולמו",
];

export default function Domains() {
  return (
    <section style={{ background: "#f3f4f6" }}>
      <div
        style={{
          maxWidth: "1100px",
          margin: "0 auto",
          padding: "3.2rem 1.5rem 4rem",
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
          תחומי התמחות
        </h2>
        <p
          style={{
            textAlign: "center",
            color: "#6b7280",
            marginBottom: "2.1rem",
          }}
        >
          התמחות מלאה בדיני עבודה – מהשכר הראשון ועד לסיום יחסי העבודה.
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
            gap: "1.3rem",
            direction: "rtl",
          }}
        >
          {domains.map((name) => (
            <div
              key={name}
              style={{
                background: "white",
                borderRadius: "1rem",
                padding: "1.25rem 1.4rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                boxShadow: "0 8px 20px rgba(15, 23, 42, 0.04)",
                border: "1px solid #e5e7eb",
              }}
            >
              <span style={{ color: "#22c55e", fontSize: "1.3rem" }}>✔</span>
              <span
                style={{
                  flex: 1,
                  marginRight: "0.8rem",
                  fontSize: "1.02rem",
                  fontWeight: 500,
                  color: "#111827",
                }}
              >
                {name}
              </span>
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "999px",
                  background: "#2563eb",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white",
                  fontSize: "1.1rem",
                }}
              >
                ⚖️
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
