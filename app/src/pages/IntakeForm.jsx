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
      // 1) יצירת תיק חדש בשרת
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

      // 2) העלאת קבצים (אם קיימים)
      const hasAnyFiles =
        contractFile ||
        (payslips && payslips.length > 0) ||
        (otherDocs && otherDocs.length > 0);

      if (hasAnyFiles) {
        const fd = new FormData();

        if (contractFile) {
          fd.append("contract", contractFile);
        }

        for (const f of payslips) {
          fd.append("payslips", f);
        }

        for (const f of otherDocs) {
          fd.append("other_documents", f);
        }

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
          // לא מפילים את כל התהליך – התיק קיים, רק הקבצים נכשלו
        }
      }

      setMessage("הפנייה נשלחה בהצלחה! עוברים לשיחה עם עוזר חכם...");

      // איפוס הטופס
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

      // מעבר למסך הצ'אטבוט עם מזהה התיק
      navigate(`/chat/${caseId}`);
    } catch (err) {
      console.error(err);
      setError(err.message || "אירעה שגיאה בלתי צפויה");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{ paddingTop: "5rem", paddingBottom: "3rem" }}>
      <div
        style={{
          maxWidth: "800px",
          margin: "0 auto",
          padding: "2rem 1.5rem",
        }}
      >
        <h1
          style={{
            fontSize: "2rem",
            fontWeight: 700,
            marginBottom: "0.75rem",
          }}
        >
          טופס פתיחת פנייה
        </h1>
        <p style={{ color: "#6b7280", marginBottom: "1.8rem" }}>
          כל השדות המסומנים בכוכבית הם שדות חובה.
        </p>

        <form
          onSubmit={handleSubmit}
          style={{
            background: "white",
            borderRadius: "1.5rem",
            padding: "1.8rem",
            boxShadow: "0 15px 35px rgba(15, 23, 42, 0.08)",
          }}
        >
          {/* פרטים אישיים */}
          <div style={{ marginBottom: "1.5rem" }}>
            <label style={{ display: "block", marginBottom: "0.25rem" }}>
              שם מלא *
            </label>
            <input
              type="text"
              name="client_name"
              value={form.client_name}
              onChange={handleChange}
              required
              placeholder="הכניסו את שמכם המלא"
              style={inputStyle}
            />
          </div>

          <div style={{ marginBottom: "1.5rem" }}>
            <label style={{ display: "block", marginBottom: "0.25rem" }}>
              תעודת זהות *
            </label>
            <input
              type="text"
              name="client_id_number"
              value={form.client_id_number}
              onChange={handleChange}
              required
              placeholder="9 ספרות"
              style={inputStyle}
            />
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "1rem",
            }}
          >
            <div style={{ marginBottom: "1.5rem" }}>
              <label style={{ display: "block", marginBottom: "0.25rem" }}>
                טלפון נייד *
              </label>
              <input
                type="tel"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                required
                placeholder="050-0000000"
                style={inputStyle}
              />
            </div>

            <div style={{ marginBottom: "1.5rem" }}>
              <label style={{ display: "block", marginBottom: "0.25rem" }}>
                כתובת אימייל *
              </label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
                placeholder="example@email.com"
                style={inputStyle}
              />
            </div>
          </div>

          {/* סוג פנייה */}
          <div style={{ marginBottom: "1.8rem" }}>
            <label style={{ display: "block", marginBottom: "0.25rem" }}>
              סוג פנייה *
            </label>
            <select
              name="claim_type"
              value={form.claim_type}
              onChange={handleChange}
              required
              style={inputStyle}
            >
              <option value="">בחרו את סוג הפנייה</option>
              {CLAIM_TYPES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>

          {/* מסמכים */}
          <h2
            style={{
              fontSize: "1.1rem",
              fontWeight: 600,
              marginBottom: "0.6rem",
            }}
          >
            העלאת מסמכים (אופציונלי)
          </h2>
          <p
            style={{
              color: "#6b7280",
              marginBottom: "1rem",
              fontSize: "0.9rem",
            }}
          >
            ניתן להעלות קבצי PDF בלבד.
          </p>

          <div style={{ marginBottom: "1rem" }}>
            <label style={{ display: "block", marginBottom: "0.25rem" }}>
              חוזה עבודה
            </label>
            <input
              type="file"
              accept="application/pdf"
              onChange={(e) =>
                setContractFile(e.target.files[0] || null)
              }
            />
          </div>

          <div style={{ marginBottom: "1rem" }}>
            <label style={{ display: "block", marginBottom: "0.25rem" }}>
              תלושי שכר (ניתן לבחור מספר קבצים)
            </label>
            <input
              type="file"
              multiple
              accept="application/pdf"
              onChange={(e) =>
                setPayslips(Array.from(e.target.files))
              }
            />
          </div>

          <div style={{ marginBottom: "1.4rem" }}>
            <label style={{ display: "block", marginBottom: "0.25rem" }}>
              מסמכים נוספים
            </label>
            <input
              type="file"
              multiple
              accept="application/pdf"
              onChange={(e) =>
                setOtherDocs(Array.from(e.target.files))
              }
            />
          </div>

          {/* הודעות למשתמש */}
          {message && (
            <div
              style={{
                marginBottom: "1rem",
                padding: "0.75rem 1rem",
                borderRadius: "0.75rem",
                background: "#ecfdf3",
                color: "#166534",
                fontSize: "0.9rem",
              }}
            >
              {message}
            </div>
          )}

          {error && (
            <div
              style={{
                marginBottom: "1rem",
                padding: "0.75rem 1rem",
                borderRadius: "0.75rem",
                background: "#fef2f2",
                color: "#b91c1c",
                fontSize: "0.9rem",
              }}
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              marginTop: "0.5rem",
              background: loading ? "#9ca3af" : "#2563eb",
              border: "none",
              borderRadius: "999px",
              padding: "0.85rem 2.2rem",
              color: "white",
              fontWeight: 600,
              fontSize: "1rem",
            }}
          >
            {loading ? "שולח..." : "המשך לשיחה עם עוזר חכם"}
          </button>
        </form>
      </div>
    </main>
  );
}

const inputStyle = {
  width: "100%",
  padding: "0.7rem 0.9rem",
  borderRadius: "0.75rem",
  border: "1px solid #d1d5db",
  fontSize: "0.95rem",
  outline: "none",
};
