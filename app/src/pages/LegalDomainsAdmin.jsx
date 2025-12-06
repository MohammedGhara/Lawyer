import { useEffect, useState } from "react";
import "../styles/LawyerDashboard.css";

const API_URL = "http://127.0.0.1:8000/api";

const DOMAIN_TEMPLATES = [
  {
    key: "labor",
    name: "דיני עבודה",
    description: "תעסוקה וזכויות עובדים",
    url: "https://www.kolzchut.org.il/he/%D7%AA%D7%A2%D7%A1%D7%95%D7%A7%D7%94_%D7%95%D7%96%D7%9B%D7%95%D7%99%D7%95%D7%AA_%D7%A2%D7%95%D7%91%D7%93%D7%99%D7%9D/%D7%97%D7%A7%D7%99%D7%A7%D7%94_%D7%95%D7%A0%D7%94%D7%9C%D7%99%D7%9D",
  },
  {
    key: "family",
    name: "דיני משפחה",
    description: "משפחה וזכויות",
    url: "https://www.kolzchut.org.il/he/%D7%9E%D7%A9%D7%A4%D7%97%D7%94",
  },
  {
    key: "inheritance",
    name: "דיני ירושה",
    description: "ירושה וצוואות – חוק הירושה",
    url: "https://www.nevo.co.il/law_html/law01/087_001.htm",
  },
  {
    key: "contracts",
    name: "דיני חוזים",
    description: "חוק החוזים (חלק כללי)",
    url: "https://main.knesset.gov.il/Activity/Legislation/Laws/Pages/LawPrimary.aspx?lawitemid=2000484",
  },
  {
    key: "torts",
    name: "דיני נזיקין",
    description: "חוק הנזיקין האזרחיים ופקודת הנזיקין",
    url: "https://www.nevo.co.il/law_html/Law01/226_001.htm",
  },
  {
    key: "real_estate",
    name: "דיני מקרקעין",
    description: "חוק המקרקעין",
    url: "https://www.nevo.co.il/law_html/Law01/309_001.htm",
  },
  {
    key: "companies",
    name: "דיני חברות",
    description: "חוק החברות",
    url: "https://www.nevo.co.il/law_html/Law01/297_001.htm",
  },
  {
    key: "criminal",
    name: "משפט פלילי",
    description: "חוק העונשין",
    url: "https://www.nevo.co.il/law_html/Law01/089_001.htm",
  },
  {
    key: "traffic",
    name: "דיני תעבורה",
    description: "פקודת התעבורה ותקנות התעבורה",
    url: "https://www.nevo.co.il/law_html/Law01/269_001.htm",
  },
  {
    key: "tax",
    name: "דיני מסים",
    description: "רשות המסים – דיני מס",
    url: "https://taxinfo.taxes.gov.il/gmishurim/Pages/mankesLaw.aspx",
  },
  {
    key: "national_insurance",
    name: "דיני ביטוח לאומי",
    description: "ביטוח לאומי – זכויות",
    url: "https://www.kolzchut.org.il/he/%D7%91%D7%99%D7%98%D7%95%D7%97_%D7%9C%D7%90%D7%95%D7%9E%D7%99",
  },
  {
    key: "health",
    name: "דיני בריאות",
    description: "חוק ביטוח בריאות ממלכתי",
    url: "https://www.nevo.co.il/law_html/Law01/186_001.htm",
  },
  {
    key: "education",
    name: "דיני חינוך",
    description: "חוק חינוך חובה וחוקים נלווים",
    url: "https://www.nevo.co.il/law_html/Law01/079_001.htm",
  },
  {
    key: "consumer",
    name: "דיני צרכנות",
    description: "חוק הגנת הצרכן",
    url: "https://www.nevo.co.il/law_html/law01/173_001.htm",
  },
  {
    key: "immigration",
    name: "דיני הגירה ומעמד",
    description: "חוק הכניסה לישראל",
    url: "https://www.nevo.co.il/law_html/law01/098_001.htm",
  },
  {
    key: "administrative",
    name: "משפט מנהלי",
    description: "חוק בתי משפט לעניינים מנהליים",
    url: "https://www.nevo.co.il/law_html/Law01/193_001.htm",
  },
  {
    key: "environment",
    name: "דיני איכות סביבה",
    description: "חוק אוויר נקי וחוקים סביבתיים",
    url: "https://www.nevo.co.il/law_html/Law01/223_001.htm",
  },
  {
    key: "telecom",
    name: "דיני תקשורת",
    description: "חוק התקשורת (בזק ושידורים)",
    url: "https://www.nevo.co.il/law_html/Law01/226_001.htm",
  },
  {
    key: "privacy_cyber",
    name: "דיני סייבר ופרטיות",
    description: "חוק הגנת הפרטיות",
    url: "https://www.nevo.co.il/law_html/law01/081_001.htm",
  },
  {
    key: "constitutional",
    name: "משפט חוקתי",
    description: "חוקי יסוד – אתר הכנסת",
    url: "https://main.knesset.gov.il/Activity/Legislation/Laws/Pages/BasicLaws.aspx",
  },
  {
    key: "ip",
    name: "דיני קניין רוחני",
    description: "חוק זכויות יוצרים וחוק הפטנטים",
    url: "https://www.nevo.co.il/law_html/law01/212_001.htm",
  },
  {
    key: "defamation",
    name: "דיני לשון הרע",
    description: "חוק איסור לשון הרע",
    url: "https://www.nevo.co.il/law_html/Law01/205_001.htm",
  },
  {
    key: "evidence",
    name: "דיני ראיות",
    description: "פקודת הראיות",
    url: "https://www.nevo.co.il/law_html/law01/169_001.htm",
  },
  {
    key: "execution",
    name: "דיני הוצאה לפועל",
    description: "חוק ההוצאה לפועל",
    url: "https://www.nevo.co.il/law_html/law01/178_002.htm",
  },
  {
    key: "international_trade",
    name: "דיני סחר בינלאומי",
    description: "חוקים ותקנות במשרד הכלכלה",
    url: "https://www.gov.il/he/departments/legalframework",
  },
  {
    key: "insurance",
    name: "דיני ביטוח",
    description: "חוק חוזה הביטוח",
    url: "https://www.nevo.co.il/law_html/law01/190_001.htm",
  },
];

export default function LegalDomainsAdmin() {
  const [domains, setDomains] = useState([]);
  const [form, setForm] = useState({
    id: null,
    templateKey: "",
    name: "",
    description: "",
    source_url: "",
    is_active: true,
  });

  const [selectedDomainId, setSelectedDomainId] = useState(null);
  const [selectedDomainName, setSelectedDomainName] = useState("");

  const [messages, setMessages] = useState([]);
  const [messageForm, setMessageForm] = useState({
    id: null,
    text: "",
    title: "",
    order: 1,
    is_active: true,
  });

  // ---- טוען תחומים ----
  useEffect(() => {
    fetch(`${API_URL}/domains/`)
      .then((res) => res.json())
      .then((data) =>
        Array.isArray(data)
          ? setDomains(
              data.sort((a, b) => a.name.localeCompare(b.name, "he"))
            )
          : setDomains([])
      )
      .catch((err) => console.error("Failed to load domains", err));
  }, []);

  // ---- טוען הודעות עבור התחום שנבחר ----
  useEffect(() => {
    if (!selectedDomainId) {
      setMessages([]);
      return;
    }

    fetch(`${API_URL}/bot-messages/?domain=${selectedDomainId}`)
      .then((res) => res.json())
      .then((data) => setMessages(Array.isArray(data) ? data : []))
      .catch((err) => {
        console.error("Failed to load messages", err);
        setMessages([]);
      });
  }, [selectedDomainId]);

  function handleTemplateChange(e) {
    const value = e.target.value;
    const template = DOMAIN_TEMPLATES.find((t) => t.key === value) || null;

    if (!template) {
      setForm((prev) => ({
        ...prev,
        templateKey: "",
        name: "",
        source_url: "",
        description: "",
      }));
      return;
    }

    setForm((prev) => ({
      ...prev,
      templateKey: value,
      name: template.name,
      source_url: template.url,
      description: template.description || "",
    }));
  }

  function handleActiveChange(e) {
    const checked = e.target.checked;
    setForm((prev) => ({ ...prev, is_active: checked }));
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (!form.name || !form.source_url) {
      alert("יש לבחור תחום מהרשימה");
      return;
    }

    const payload = {
      name: form.name,
      description: form.description,
      source_url: form.source_url,
      is_active: form.is_active,
    };

    try {
      let res;
      if (form.id) {
        res = await fetch(`${API_URL}/domains/${form.id}/`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch(`${API_URL}/domains/`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

        if (!res.ok) {
        let data = null;
        try {
          data = await res.json();
          console.error("Domain save error body:", data);

          // 👇 כאן ההודעה היפה
          if (
            res.status === 400 &&
            data &&
            data.name &&
            Array.isArray(data.name) &&
            typeof data.name[0] === "string" &&
            data.name[0].includes("already exists")
          ) {
            alert("התחום הזה כבר קיים במערכת, אי אפשר להוסיף אותו פעמיים.");
          } else {
            alert("אירעה שגיאה בשמירת התחום. אנא בדקי את הנתונים ונסי שוב.");
          }
        } catch (e) {
          console.error("Domain save error (no JSON)", e);
          alert("אירעה שגיאה בשמירת התחום.");
        }

        throw new Error("Save failed");
      }


      const saved = await res.json();

      setDomains((prev) => {
        const others = prev.filter((d) => d.id !== saved.id);
        return [...others, saved].sort((a, b) =>
          a.name.localeCompare(b.name, "he")
        );
      });

      setForm({
        id: null,
        templateKey: "",
        name: "",
        description: "",
        source_url: "",
        is_active: true,
      });
    } catch (err) {
      console.error(err);
    }
  }

  function resetMessageForm() {
    setMessageForm({
      id: null,
      text: "",
      title: "",
      order: 1,
      is_active: true,
    });
  }

  function handleEdit(domain) {
    setForm({
      id: domain.id,
      templateKey: "",
      name: domain.name,
      description: domain.description || "",
      source_url: domain.source_url,
      is_active: domain.is_active,
    });
    setSelectedDomainId(domain.id);
    setSelectedDomainName(domain.name);
    resetMessageForm();
  }

  async function handleDelete(id) {
    if (!window.confirm("למחוק את התחום?")) return;
    await fetch(`${API_URL}/domains/${id}/`, { method: "DELETE" });
    setDomains((prev) => prev.filter((d) => d.id !== id));
    if (selectedDomainId === id) {
      setSelectedDomainId(null);
      setSelectedDomainName("");
      setMessages([]);
      resetMessageForm();
    }
  }

  function handleMessageEdit(msg) {
    setMessageForm({
      id: msg.id,
      text: msg.text,
      title: msg.title || "",
      order: msg.order || 1,
      is_active: msg.is_active,
    });
  }

  async function handleMessageDelete(id) {
    if (!window.confirm("למחוק את ההודעה?")) return;
    await fetch(`${API_URL}/bot-messages/${id}/`, { method: "DELETE" });
    setMessages((prev) => prev.filter((m) => m.id !== id));
    if (messageForm.id === id) {
      resetMessageForm();
    }
  }

  async function handleMessageSave(e) {
    e.preventDefault();

    if (!selectedDomainId) {
      alert("קודם בחרי תחום מהרשימה התחתונה (עריכה)");
      return;
    }
    if (!messageForm.text.trim()) {
      alert("אי אפשר לשמור הודעה ריקה");
      return;
    }

    const payload = {
      domain: selectedDomainId,
      title: messageForm.title,
      text: messageForm.text,
      order: Number(messageForm.order) || 1,
      is_active: messageForm.is_active,
    };

    try {
      let res;
      if (messageForm.id) {
        res = await fetch(`${API_URL}/bot-messages/${messageForm.id}/`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch(`${API_URL}/bot-messages/`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      if (!res.ok) throw new Error("Save failed");
      const saved = await res.json();

      setMessages((prev) => {
        const others = prev.filter((m) => m.id !== saved.id);
        return [...others, saved].sort(
          (a, b) => (a.order || 1) - (b.order || 1) || a.id - b.id
        );
      });

      resetMessageForm();
    } catch (err) {
      console.error(err);
      alert("שגיאה בשמירת ההודעה");
    }
  }

  return (
    <main className="sl-dashboard-page" dir="rtl">
      <div className="sl-dashboard-container">
        <h1 className="sl-dashboard-title">
          דאשבורד תחומי ידע – ניהול מקורות מידע
        </h1>

        {/* פס עליון – יצירת / עדכון תחום */}
        <div className="sl-dashboard-filters">
          <span className="sl-filter-label">תחום חדש:</span>

          <div
            className={`sl-filter-select-wrapper ${
              form.templateKey ? "has-selection" : ""
            }`}
          >
            <select
              value={form.templateKey}
              onChange={handleTemplateChange}
              className="sl-filter-select"
            >
              <option value="">בחר תחום מהרשימה...</option>
              {DOMAIN_TEMPLATES.map((t) => (
                <option key={t.key} value={t.key}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>

          <div className="sl-sort-wrapper">
            <span className="sl-filter-label">תחום פעיל:</span>
            <input
              type="checkbox"
              checked={form.is_active}
              onChange={handleActiveChange}
              style={{ width: 18, height: 18 }}
            />
          </div>

          <button
            onClick={handleSubmit}
            className="sl-status-btn sl-status-btn-review"
            style={{ whiteSpace: "nowrap" }}
          >
            {form.id ? "עדכון תחום" : "הוספת תחום חדש"}
          </button>
        </div>

        <div className="sl-dashboard-table-wrapper" style={{ marginTop: 32 }}>
          {/* כרטיס מידע על תחום שנבחר */}
          <div
            style={{
              marginBottom: 16,
              fontSize: 20,
              fontWeight: 600,
              color: "#e2e8f0",
              paddingRight: 6,
            }}
          >
            פרטי התחום שנבחר:
          </div>

          <div
            style={{
              backgroundColor: "#020617",
              borderRadius: 24,
              padding: "16px 18px",
              marginBottom: 28,
              boxShadow: "0 18px 45px rgba(15,23,42,0.7)",
              color: "#e5e7eb",
            }}
          >
            <div style={{ marginBottom: 10 }}>
              <div style={{ fontSize: 13, color: "#9ca3af", marginBottom: 4 }}>
                שם תחום
              </div>
              <div
                style={{
                  padding: "8px 14px",
                  borderRadius: 9999,
                  backgroundColor: "#0b1120",
                  border: "1px solid #1f2937",
                  minHeight: 38,
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <span>
                  {selectedDomainName || form.name || "לא נבחר תחום"}
                </span>
              </div>
            </div>

            <div style={{ marginBottom: 10 }}>
              <div style={{ fontSize: 13, color: "#9ca3af", marginBottom: 4 }}>
                תיאור קצר
              </div>
              <div
                style={{
                  padding: "8px 14px",
                  borderRadius: 9999,
                  backgroundColor: "#0b1120",
                  border: "1px solid #1f2937",
                  minHeight: 38,
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <span>{form.description || "—"}</span>
              </div>
            </div>

            <div>
              <div style={{ fontSize: 13, color: "#9ca3af", marginBottom: 4 }}>
                כתובת מאגר ידע (URL)
              </div>
              <div
                style={{
                  padding: "8px 14px",
                  borderRadius: 9999,
                  backgroundColor: "#0b1120",
                  border: "1px solid #1f2937",
                  minHeight: 38,
                  display: "flex",
                  alignItems: "center",
                  overflowX: "auto",
                }}
              >
                {form.source_url ? (
                  <a
                    href={form.source_url}
                    target="_blank"
                    rel="noreferrer"
                    style={{ color: "#60a5fa" }}
                  >
                    {form.source_url}
                  </a>
                ) : (
                  <span>—</span>
                )}
              </div>
            </div>
          </div>

          {/* ניהול הודעות צ׳אט לתחום */}
          {selectedDomainId && (
            <div style={{ marginBottom: 32 }}>
              <div
                style={{
                  marginBottom: 12,
                  fontSize: 18,
                  fontWeight: 600,
                  color: "#e2e8f0",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  paddingRight: 6,
                }}
              >
                <span style={{ fontSize: 22 }}>💬</span>
                <span>הודעות צ'אט עבור: {selectedDomainName}</span>
              </div>

              {/* טופס יצירת / עדכון הודעה */}
              <form
                onSubmit={handleMessageSave}
                style={{
                  backgroundColor: "#020617",
                  borderRadius: 24,
                  padding: "16px 18px",
                  marginBottom: 20,
                  boxShadow: "0 18px 45px rgba(15,23,42,0.7)",
                  color: "#e5e7eb",
                }}
              >
                <div style={{ marginBottom: 10 }}>
                  <div
                    style={{
                      fontSize: 13,
                      color: "#9ca3af",
                      marginBottom: 4,
                    }}
                  >
                    כותרת פנימית (לא חובה)
                  </div>
                  <input
                    type="text"
                    value={messageForm.title}
                    onChange={(e) =>
                      setMessageForm((p) => ({
                        ...p,
                        title: e.target.value,
                      }))
                    }
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      borderRadius: 9999,
                      border: "1px solid #1f2937",
                      backgroundColor: "#020617",
                      color: "#e5e7eb",
                    }}
                  />
                </div>

                <div style={{ marginBottom: 10 }}>
                  <div
                    style={{
                      fontSize: 13,
                      color: "#9ca3af",
                      marginBottom: 4,
                    }}
                  >
                    תוכן ההודעה
                  </div>
                  <textarea
                    rows={3}
                    value={messageForm.text}
                    onChange={(e) =>
                      setMessageForm((p) => ({
                        ...p,
                        text: e.target.value,
                      }))
                    }
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      borderRadius: 18,
                      border: "1px solid #1f2937",
                      backgroundColor: "#020617",
                      color: "#e5e7eb",
                      resize: "vertical",
                    }}
                  />
                </div>

                <div
                  style={{
                    display: "flex",
                    gap: 16,
                    alignItems: "center",
                    justifyContent: "space-between",
                    flexWrap: "wrap",
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontSize: 13,
                        color: "#9ca3af",
                        marginBottom: 4,
                      }}
                    >
                      סדר בתסריט
                    </div>
                    <input
                      type="number"
                      min={1}
                      value={messageForm.order}
                      onChange={(e) =>
                        setMessageForm((p) => ({
                          ...p,
                          order: e.target.value,
                        }))
                      }
                      style={{
                        width: 80,
                        padding: "6px 10px",
                        borderRadius: 9999,
                        border: "1px solid #1f2937",
                        backgroundColor: "#020617",
                        color: "#e5e7eb",
                      }}
                    />
                  </div>

                  <label
                    style={{ display: "flex", alignItems: "center", gap: 6 }}
                  >
                    <input
                      type="checkbox"
                      checked={messageForm.is_active}
                      onChange={(e) =>
                        setMessageForm((p) => ({
                          ...p,
                          is_active: e.target.checked,
                        }))
                      }
                    />
                    פעילה
                  </label>

                  <div style={{ marginRight: "auto" }}>
                    <button
                      type="submit"
                      className="sl-status-btn sl-status-btn-review"
                      style={{ whiteSpace: "nowrap" }}
                    >
                      {messageForm.id ? "עדכון הודעה" : "הוספת הודעה"}
                    </button>
                    {messageForm.id && (
                      <button
                        type="button"
                        onClick={resetMessageForm}
                        style={{
                          marginRight: 8,
                          padding: "8px 16px",
                          borderRadius: 9999,
                          border: "1px solid #4b5563",
                          background: "transparent",
                          color: "#e5e7eb",
                          cursor: "pointer",
                        }}
                      >
                        ביטול
                      </button>
                    )}
                  </div>
                </div>
              </form>

              {/* טבלת ההודעות */}
              <table className="sl-dashboard-table">
                <thead>
                  <tr>
                    <th>סדר</th>
                    <th>כותרת</th>
                    <th>תוכן</th>
                    <th>פעילה</th>
                    <th>פעולות</th>
                  </tr>
                </thead>
                <tbody>
                  {messages.map((m) => (
                    <tr key={m.id}>
                      <td>{m.order}</td>
                      <td>{m.title || "—"}</td>
                      <td style={{ maxWidth: 400 }}>{m.text}</td>
                      <td style={{ textAlign: "center" }}>
                        {m.is_active ? "✓" : "✗"}
                      </td>
                      <td style={{ textAlign: "center" }}>
                        <button
                          onClick={() => handleMessageEdit(m)}
                          className="sl-status-btn"
                          style={{ marginInline: 4 }}
                        >
                          עריכה
                        </button>
                        <button
                          onClick={() => handleMessageDelete(m.id)}
                          className="sl-status-btn sl-status-btn-closed"
                          style={{ marginInline: 4 }}
                        >
                          מחיקה
                        </button>
                      </td>
                    </tr>
                  ))}
                  {messages.length === 0 && (
                    <tr>
                      <td
                        colSpan={5}
                        style={{ textAlign: "center", padding: 12 }}
                      >
                        אין הודעות מוגדרות עדיין לתחום זה
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* טבלת התחומים עצמה */}
          <table className="sl-dashboard-table">
            <thead>
              <tr>
                <th>שם תחום</th>
                <th>מאגר ידע</th>
                <th>פעיל</th>
                <th>פעולות</th>
              </tr>
            </thead>
            <tbody>
              {domains.map((d) => (
                <tr key={d.id}>
                  <td>{d.name}</td>
                  <td
                    style={{
                      maxWidth: 520,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    <a
                      href={d.source_url}
                      target="_blank"
                      rel="noreferrer"
                      style={{ color: "#60a5fa" }}
                    >
                      {d.source_url}
                    </a>
                  </td>
                  <td style={{ textAlign: "center" }}>
                    {d.is_active ? "✓" : "✗"}
                  </td>
                  <td style={{ textAlign: "center" }}>
                    <button
                      onClick={() => handleEdit(d)}
                      className="sl-status-btn"
                      style={{ marginInline: 4 }}
                    >
                      עריכה
                    </button>
                    <button
                      onClick={() => handleDelete(d.id)}
                      className="sl-status-btn sl-status-btn-closed"
                      style={{ marginInline: 4 }}
                    >
                      מחיקה
                    </button>
                  </td>
                </tr>
              ))}
              {domains.length === 0 && (
                <tr>
                  <td colSpan={4} style={{ textAlign: "center", padding: 14 }}>
                    אין תחומים שמורים עדיין
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
