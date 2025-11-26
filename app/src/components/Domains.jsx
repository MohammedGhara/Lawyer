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
          padding: "3rem 1.5rem 4rem",
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
            marginBottom: "2rem",
          }}
        >
          אנו מטפלים במגוון רחב של סוגיות בדיני עבודה.
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
            gap: "1.3rem",
          }}
        >
          {domains.map((name) => (
            <div
              key={name}
              style={{
                background: "white",
                borderRadius: "1rem",
                padding: "1.2rem 1.4rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                boxShadow: "0 8px 20px rgba(15, 23, 42, 0.04)",
              }}
            >
              <span style={{ color: "#16a34a", fontSize: "1.2rem" }}>✔</span>
              <span
                style={{
                  flex: 1,
                  marginRight: "0.7rem",
                  fontSize: "1rem",
                  fontWeight: 500,
                }}
              >
                {name}
              </span>
              <div
                style={{
                  width: "38px",
                  height: "38px",
                  borderRadius: "999px",
                  background: "#2563eb",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white",
                  fontSize: "1.1rem",
                }}
              >
                ⏱
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
