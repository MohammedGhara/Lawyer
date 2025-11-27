// app/src/pages/LawyerDashboard.jsx
import React, { useEffect, useState } from "react";

const API_BASE = "http://127.0.0.1:8000/api";

export default function LawyerDashboard() {
  const [cases, setCases] = useState([]);
  const [appointments, setAppointments] = useState({});
  const [draftTimes, setDraftTimes] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 🔵 סינון + מיון
  const [filterClaim, setFilterClaim] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [sortOrder, setSortOrder] = useState("newest");

  useEffect(() => {
    loadAllData();
  }, []);

  // Smooth animations on mount
  useEffect(() => {
    const elements = document.querySelectorAll("[data-dashboard-animate]");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry, index) => {
          if (entry.isIntersecting) {
            setTimeout(() => {
              entry.target.classList.add("dashboard-animate-in");
            }, index * 100);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [cases]);

  async function loadAllData() {
    try {
      setLoading(true);
      setError(null);

      // 1) תיקים
      const resCases = await fetch(`${API_BASE}/cases/list/`);
      if (!resCases.ok) throw new Error("שגיאה בשליפת רשימת תיקים");
      const casesData = await resCases.json();

      // 2) פגישות
      const resAppt = await fetch(`${API_BASE}/appointments/list/`);
      if (!resAppt.ok) throw new Error("שגיאה בטעינת פגישות");
      const apptData = await resAppt.json();

      const apptByCase = {};
      apptData.forEach((appt) => {
        apptByCase[appt.case] = appt;
      });

      setCases(casesData);
      setAppointments(apptByCase);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  // ---------- עדכון סטטוס תיק (עורך דין) ----------
  async function updateCaseStatus(caseId, newStatus) {
    try {
      const res = await fetch(`${API_BASE}/cases/${caseId}/status/`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.detail || "שגיאה בעדכון סטטוס התיק");
      }

      await loadAllData();
    } catch (err) {
      console.error(err);
      alert(err.message || "שגיאה בעדכון סטטוס התיק");
    }
  }

  // ---------- פעולות עו״ד על פגישה ----------

  // אישור – בלי לבחור זמן חדש (השרת משתמש ב-requested_datetime)
  async function approveAppt(id) {
    try {
      await fetch(`${API_BASE}/appointments/${id}/approve/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}), // אין חובה על תאריך
      });
      await loadAllData();
    } catch (err) {
      console.error(err);
      alert("שגיאה באישור הפגישה");
    }
  }

  // דחייה – דורש בחירת תאריך/שעה (רק בשבילך ב־UI)
  async function rejectAppt(id) {
    const dt = draftTimes[id];
    if (!dt) {
      alert("לפני דחייה – בחר/י תאריך ושעה (לפי דרישת המטלה).");
      return;
    }

    try {
      await fetch(`${API_BASE}/appointments/${id}/reject/`, {
        method: "POST",
      });
      await loadAllData();
    } catch (err) {
      console.error(err);
      alert("שגיאה בדחיית הפגישה");
    }
  }

  // הצעת מועד חדש – חובה לבחור dateTime
  async function suggestAppt(id) {
    const dt = draftTimes[id];
    if (!dt) {
      alert("בחר/י תאריך ושעה למועד החדש");
      return;
    }

    try {
      await fetch(`${API_BASE}/appointments/${id}/suggest/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          suggested_datetime: new Date(dt).toISOString(),
        }),
      });
      await loadAllData();
    } catch (err) {
      console.error(err);
      alert("שגיאה בהצעת מועד חדש");
    }
  }

  function translateStatus(value) {
    switch (value) {
      case "pending":
        return "ממתין לתגובה";
      case "approved":
        return "אושר";
      case "rejected":
        return "נדחה";
      case "suggested":
        return "הוצע מועד חדש";
      default:
        return value;
    }
  }

  function formatDateTime(iso) {
    if (!iso) return "";
    const d = new Date(iso);
    return d.toLocaleString("he-IL", {
      dateStyle: "short",
      timeStyle: "short",
    });
  }

  // ---------- סינון + מיון תיקים לתצוגה ----------
  const filteredCases = cases
    .filter((c) => {
      const byClaim =
        filterClaim === "all" ? true : c.claim_type === filterClaim;
      const byStatus =
        filterStatus === "all" ? true : c.status === filterStatus;
      return byClaim && byStatus;
    })
    .sort((a, b) => {
      if (sortOrder === "oldest") {
        return new Date(a.created_at) - new Date(b.created_at);
      }
      // default: newest first
      return new Date(b.created_at) - new Date(a.created_at);
    });

  return (
    <>
      <style>{`
        @keyframes dashboardFadeIn {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes dashboardSlideIn {
          from {
            opacity: 0;
            transform: translateX(-30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        @keyframes shimmer {
          0% {
            background-position: -1000px 0;
          }
          100% {
            background-position: 1000px 0;
          }
        }

        [data-dashboard-animate] {
          opacity: 0;
          transform: translateY(40px);
          transition: opacity 0.8s cubic-bezier(0.4, 0, 0.2, 1),
                      transform 0.8s cubic-bezier(0.4, 0, 0.2, 1);
        }

        [data-dashboard-animate].dashboard-animate-in {
          opacity: 1;
          transform: translateY(0);
        }

        .sl-dashboard-page {
          min-height: 100vh;
          padding: 7rem 1.5rem 4rem;
          background: linear-gradient(
            135deg,
            #0f172a 0%,
            #1e293b 25%,
            #1d4ed8 50%,
            #111827 75%,
            #020617 100%
          );
          background-size: 400% 400%;
          animation: gradientShift 15s ease infinite;
          color: #f9fafb;
          position: relative;
          overflow-x: hidden;
        }

        .sl-dashboard-page::before {
          content: '';
          position: absolute;
          inset: 0;
          background: radial-gradient(circle at 20% 30%, rgba(59, 130, 246, 0.15) 0%, transparent 50%),
                      radial-gradient(circle at 80% 70%, rgba(34, 197, 94, 0.1) 0%, transparent 50%);
          pointer-events: none;
        }

        .sl-dashboard-container {
          max-width: 1400px;
          margin: 0 auto;
          position: relative;
          z-index: 1;
        }

        .sl-dashboard-title {
          font-size: 3.2rem;
          font-weight: 900;
          margin-bottom: 2rem;
          line-height: 1.15;
          background: linear-gradient(135deg, #ffffff 0%, #e0e7ff 50%, #c7d2fe 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          letter-spacing: -0.03em;
          text-align: center;
        }

        .sl-dashboard-filters {
          display: flex;
          flex-wrap: wrap;
          gap: 1rem;
          align-items: center;
          margin-bottom: 2rem;
          padding: 1.5rem;
          background: linear-gradient(145deg, rgba(15, 23, 42, 0.95), rgba(15, 23, 42, 0.88));
          backdrop-filter: blur(30px);
          border-radius: 1.5rem;
          box-shadow: 0 20px 50px rgba(15, 23, 42, 0.7),
                      0 0 0 1px rgba(148, 163, 184, 0.2);
          border: 1px solid rgba(148, 163, 184, 0.2);
        }

        .sl-filter-label {
          font-size: 1.15rem;
          font-weight: 800;
          color: #ffffff;
          margin-left: 0.5rem;
          letter-spacing: 0.02em;
          text-shadow: 0 2px 8px rgba(255, 255, 255, 0.1),
                       0 0 20px rgba(59, 130, 246, 0.2);
          background: linear-gradient(135deg, #ffffff, #cbd5e1);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          transition: all 0.3s ease;
        }

        .sl-filter-select-wrapper {
          position: relative;
          display: inline-block;
        }

        .sl-filter-select-wrapper::before {
          content: '';
          position: absolute;
          inset: -2px;
          border-radius: 999px;
          background: linear-gradient(135deg, #3b82f6, #22c55e);
          opacity: 0;
          transition: opacity 0.3s ease;
          z-index: -1;
        }

        .sl-filter-select-wrapper:hover::before {
          opacity: 0.3;
        }

        .sl-filter-select-wrapper:focus-within::before {
          opacity: 0.4;
        }

        .sl-filter-select {
          padding: 0.85rem 1.4rem;
          border-radius: 999px;
          border: 2px solid rgba(55, 65, 81, 0.6);
          font-size: 1.05rem;
          font-weight: 700;
          letter-spacing: 0.01em;
          background: linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(30, 64, 175, 0.15));
          color: #f1f5f9;
          text-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
          cursor: pointer;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 20 20'%3E%3Cdefs%3E%3ClinearGradient id='arrowGrad' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' style='stop-color:%233b82f6;stop-opacity:1' /%3E%3Cstop offset='100%25' style='stop-color:%2322c55e;stop-opacity:1' /%3E%3C/linearGradient%3E%3C/defs%3E%3Cpath fill='url(%23arrowGrad)' d='M10 13L4 7h12z'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: left 1rem center;
          background-size: 20px 20px;
          padding-right: 3rem;
          position: relative;
          min-width: 180px;
        }

        .sl-filter-select:hover {
          border-color: rgba(59, 130, 246, 0.7);
          background: linear-gradient(135deg, rgba(15, 23, 42, 0.98), rgba(30, 64, 175, 0.25));
          box-shadow: 0 6px 20px rgba(59, 130, 246, 0.3),
                      0 0 0 1px rgba(59, 130, 246, 0.2);
          transform: translateY(-2px);
        }

        .sl-filter-select:focus {
          outline: none;
          border-color: #3b82f6;
          background: linear-gradient(135deg, rgba(15, 23, 42, 1), rgba(30, 64, 175, 0.3));
          box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.3),
                      0 8px 25px rgba(59, 130, 246, 0.25);
          transform: translateY(-3px);
        }

        .sl-filter-select:active {
          transform: translateY(-1px);
        }

        .sl-filter-select option {
          background: rgba(15, 23, 42, 0.98);
          color: #e5e7eb;
          padding: 1rem 1.2rem;
          font-size: 1.05rem;
          font-weight: 500;
          border: none;
        }

        .sl-filter-select option:hover {
          background: rgba(59, 130, 246, 0.3);
          color: #ffffff;
        }

        .sl-filter-select option:checked {
          background: linear-gradient(135deg, rgba(37, 99, 235, 0.4), rgba(34, 197, 94, 0.3));
          color: #ffffff;
          font-weight: 700;
        }

        /* Selected value indicator - will be added via JS if needed */
        .sl-filter-select-wrapper.has-selection::after {
          content: '✓';
          position: absolute;
          left: 0.5rem;
          top: 50%;
          transform: translateY(-50%);
          width: 22px;
          height: 22px;
          background: linear-gradient(135deg, #22c55e, #16a34a);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.7rem;
          color: white;
          font-weight: 900;
          opacity: 0;
          transition: opacity 0.3s ease, transform 0.3s ease;
          z-index: 1;
          pointer-events: none;
        }

        .sl-filter-select-wrapper.has-selection:hover::after,
        .sl-filter-select-wrapper.has-selection:focus-within::after {
          opacity: 1;
          transform: translateY(-50%) scale(1.1);
        }

        .sl-sort-wrapper {
          margin-right: auto;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .sl-dashboard-table-wrapper {
          overflow-x: auto;
          background: linear-gradient(145deg, rgba(15, 23, 42, 0.98), rgba(15, 23, 42, 0.92));
          backdrop-filter: blur(30px);
          border-radius: 2rem;
          box-shadow: 0 35px 90px rgba(15, 23, 42, 0.9),
                      0 0 0 1px rgba(148, 163, 184, 0.2);
          border: 1px solid rgba(148, 163, 184, 0.2);
          position: relative;
          overflow: hidden;
        }

        .sl-dashboard-table-wrapper::before {
          content: "";
          position: absolute;
          inset: 0;
          border-radius: inherit;
          padding: 1px;
          background: linear-gradient(135deg, rgba(59, 130, 246, 0.3), rgba(34, 197, 94, 0.2));
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          pointer-events: none;
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .sl-dashboard-table-wrapper:hover::before {
          opacity: 1;
        }

        .sl-dashboard-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 1rem;
        }

        .sl-dashboard-table thead {
          background: linear-gradient(135deg, rgba(30, 64, 175, 0.3), rgba(15, 23, 42, 0.5));
        }

        .sl-dashboard-table th {
          padding: 1.2rem 1rem;
          text-align: right;
          font-weight: 900;
          font-size: 0.95rem;
          color: #ffffff;
          border-bottom: 2px solid rgba(148, 163, 184, 0.3);
          letter-spacing: 0.03em;
          text-shadow: 0 2px 10px rgba(255, 255, 255, 0.15),
                       0 0 25px rgba(59, 130, 246, 0.3);
          background: linear-gradient(135deg, #ffffff, #e0e7ff);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          text-transform: uppercase;
        }

        .sl-dashboard-table tbody tr {
          border-bottom: 1px solid rgba(148, 163, 184, 0.15);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .sl-dashboard-table tbody tr:hover {
          background: rgba(59, 130, 246, 0.1);
          transform: scale(1.01);
        }

        .sl-dashboard-table td {
          padding: 1.2rem 1rem;
          text-align: right;
          color: #f1f5f9;
          font-size: 1.05rem;
          font-weight: 500;
          vertical-align: top;
          letter-spacing: 0.01em;
          line-height: 1.7;
          text-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
        }

        .sl-dashboard-table td:first-child {
          font-weight: 800;
          font-size: 1.1rem;
          color: #ffffff;
          text-shadow: 0 2px 8px rgba(255, 255, 255, 0.2),
                       0 0 15px rgba(59, 130, 246, 0.3);
        }

        .sl-dashboard-table td:nth-child(2) {
          font-weight: 700;
          color: #ffffff;
          text-shadow: 0 1px 5px rgba(255, 255, 255, 0.15);
        }

        .sl-dashboard-table td:nth-child(3),
        .sl-dashboard-table td:nth-child(4) {
          font-weight: 600;
          color: #e2e8f0;
        }

        .sl-dashboard-table td:nth-child(5) {
          font-weight: 700;
          color: #cbd5e1;
          text-shadow: 0 1px 4px rgba(203, 213, 225, 0.3);
        }

        .sl-status-badge {
          display: inline-block;
          padding: 0.5rem 1rem;
          border-radius: 999px;
          font-size: 0.95rem;
          font-weight: 800;
          margin-bottom: 0.5rem;
          letter-spacing: 0.02em;
          text-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
          text-transform: uppercase;
        }

        .sl-status-new {
          background: linear-gradient(135deg, #22c55e, #16a34a);
          color: white;
          box-shadow: 0 4px 15px rgba(34, 197, 94, 0.4);
        }

        .sl-status-review {
          background: linear-gradient(135deg, #f97316, #ea580c);
          color: white;
          box-shadow: 0 4px 15px rgba(249, 115, 22, 0.4);
        }

        .sl-status-closed {
          background: linear-gradient(135deg, #6b7280, #4b5563);
          color: white;
          box-shadow: 0 4px 15px rgba(107, 114, 128, 0.4);
        }

        .sl-status-buttons {
          display: flex;
          gap: 0.4rem;
          flex-wrap: wrap;
          margin-top: 0.5rem;
        }

        .sl-status-btn {
          background: linear-gradient(135deg, #22c55e, #16a34a);
          color: white;
          border: none;
          border-radius: 999px;
          padding: 0.5rem 1rem;
          font-size: 0.9rem;
          font-weight: 700;
          letter-spacing: 0.02em;
          text-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 4px 12px rgba(34, 197, 94, 0.3);
        }

        .sl-status-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(34, 197, 94, 0.5);
        }

        .sl-status-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .sl-status-btn-review {
          background: linear-gradient(135deg, #f97316, #ea580c);
          box-shadow: 0 4px 12px rgba(249, 115, 22, 0.3);
        }

        .sl-status-btn-review:hover:not(:disabled) {
          box-shadow: 0 6px 20px rgba(249, 115, 22, 0.5);
        }

        .sl-status-btn-closed {
          background: linear-gradient(135deg, #6b7280, #4b5563);
          box-shadow: 0 4px 12px rgba(107, 114, 128, 0.3);
        }

        .sl-status-btn-closed:hover:not(:disabled) {
          box-shadow: 0 6px 20px rgba(107, 114, 128, 0.5);
        }

        .sl-summary-cell {
          max-width: 280px;
          white-space: pre-wrap;
          overflow: hidden;
          text-overflow: ellipsis;
          cursor: pointer;
          color: #93c5fd;
          line-height: 1.8;
          font-size: 1rem;
          font-weight: 500;
          letter-spacing: 0.01em;
          transition: all 0.3s ease;
          text-shadow: 0 2px 8px rgba(147, 197, 253, 0.3);
        }

        .sl-summary-cell:hover {
          color: #60a5fa;
          text-shadow: 0 2px 12px rgba(96, 165, 250, 0.5);
          transform: translateX(-2px);
        }

        .sl-appointment-cell {
          min-width: 320px;
        }

        .sl-appointment-info {
          margin-bottom: 0.6rem;
          font-size: 1rem;
          line-height: 1.8;
          color: #e2e8f0;
          font-weight: 500;
          letter-spacing: 0.01em;
          text-shadow: 0 1px 4px rgba(0, 0, 0, 0.2);
        }

        .sl-appointment-info b {
          color: #ffffff;
          font-weight: 800;
          letter-spacing: 0.02em;
          text-shadow: 0 2px 8px rgba(255, 255, 255, 0.2),
                       0 0 15px rgba(59, 130, 246, 0.3);
          background: linear-gradient(135deg, #ffffff, #cbd5e1);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .sl-appointment-actions {
          margin-top: 0.8rem;
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
          align-items: center;
        }

        .sl-appt-btn {
          border: none;
          border-radius: 999px;
          padding: 0.6rem 1.2rem;
          font-size: 0.95rem;
          font-weight: 800;
          letter-spacing: 0.02em;
          text-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          color: white;
        }

        .sl-appt-btn-approve {
          background: linear-gradient(135deg, #22c55e, #16a34a);
          box-shadow: 0 4px 15px rgba(34, 197, 94, 0.4);
        }

        .sl-appt-btn-approve:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(34, 197, 94, 0.6);
        }

        .sl-appt-btn-suggest {
          background: linear-gradient(135deg, #3b82f6, #2563eb);
          box-shadow: 0 4px 15px rgba(59, 130, 246, 0.4);
        }

        .sl-appt-btn-suggest:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(59, 130, 246, 0.6);
        }

        .sl-appt-btn-reject {
          background: linear-gradient(135deg, #ef4444, #dc2626);
          box-shadow: 0 4px 15px rgba(239, 68, 68, 0.4);
        }

        .sl-appt-btn-reject:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(239, 68, 68, 0.6);
        }

        .sl-datetime-input {
          padding: 0.5rem 0.8rem;
          border-radius: 0.75rem;
          border: 2px solid rgba(55, 65, 81, 0.6);
          background: rgba(15, 23, 42, 0.9);
          color: #e5e7eb;
          font-size: 0.9rem;
          transition: all 0.3s ease;
        }

        .sl-datetime-input:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
          background: rgba(15, 23, 42, 1);
        }

        .sl-loading {
          text-align: center;
          padding: 3rem;
          font-size: 1.5rem;
          color: #cbd5e1;
          font-weight: 700;
          letter-spacing: 0.03em;
          text-shadow: 0 2px 10px rgba(203, 213, 225, 0.3),
                       0 0 20px rgba(59, 130, 246, 0.2);
          background: linear-gradient(135deg, #cbd5e1, #94a3b8);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .sl-error {
          text-align: center;
          padding: 2rem;
          background: linear-gradient(135deg, rgba(248, 113, 113, 0.15), rgba(239, 68, 68, 0.1));
          border: 2px solid rgba(248, 113, 113, 0.5);
          border-radius: 1.5rem;
          color: #fecaca;
          font-size: 1.2rem;
          font-weight: 800;
          letter-spacing: 0.02em;
          text-shadow: 0 2px 8px rgba(254, 202, 202, 0.4),
                       0 0 15px rgba(248, 113, 113, 0.3);
          box-shadow: 0 8px 25px rgba(248, 113, 113, 0.2);
        }

        .sl-no-appointment {
          color: #9ca3af;
          font-style: italic;
          font-weight: 500;
          letter-spacing: 0.01em;
          text-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
        }

        /* Responsive */
        @media (max-width: 768px) {
          .sl-dashboard-page {
            padding: 6rem 1.2rem 3rem;
          }

          .sl-dashboard-title {
            font-size: 2.2rem;
          }

          .sl-dashboard-filters {
            padding: 1.2rem;
          }

          .sl-filter-label {
            font-size: 0.95rem;
          }

          .sl-filter-select {
            font-size: 0.9rem;
            padding: 0.65rem 1.1rem;
            min-width: 150px;
          }

          .sl-filter-select-wrapper {
            min-width: 150px;
          }

          .sl-dashboard-table {
            font-size: 0.85rem;
          }

          .sl-dashboard-table th,
          .sl-dashboard-table td {
            padding: 0.8rem 0.6rem;
          }
        }
      `}</style>

      <main className="sl-dashboard-page" dir="rtl">
        <div className="sl-dashboard-container">
          <h1 className="sl-dashboard-title" data-dashboard-animate>
            דאשבורד עורך הדין – ניהול תיקים ופגישות
          </h1>

          {loading && (
            <div className="sl-loading" data-dashboard-animate>
              טוען נתונים...
            </div>
          )}

          {error && (
            <div className="sl-error" data-dashboard-animate>
              שגיאה: {error}
            </div>
          )}

          {!loading && !error && (
            <>
              {/* 🔵 פס מסננים + מיון */}
              <div className="sl-dashboard-filters" data-dashboard-animate>
                <span className="sl-filter-label">סינון:</span>

                <div className={`sl-filter-select-wrapper ${filterClaim !== "all" ? "has-selection" : ""}`}>
                  <select
                    value={filterClaim}
                    onChange={(e) => setFilterClaim(e.target.value)}
                    className="sl-filter-select"
                  >
                    <option value="all">כל סוגי התביעות</option>
                    <option value="dismissal">פיטורים שלא כדין</option>
                    <option value="salary">אי תשלום שכר / הלנת שכר</option>
                    <option value="overtime">שעות נוספות</option>
                    <option value="rights">פגיעה בזכויות סוציאליות</option>
                  </select>
                </div>

                <div className={`sl-filter-select-wrapper ${filterStatus !== "all" ? "has-selection" : ""}`}>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="sl-filter-select"
                  >
                    <option value="all">כל הסטטוסים</option>
                    <option value="new">חדש</option>
                    <option value="in_review">בבדיקה</option>
                    <option value="closed">נסגר</option>
                  </select>
                </div>

                <div className="sl-sort-wrapper">
                  <span className="sl-filter-label">מיון:</span>
                  <div className={`sl-filter-select-wrapper ${sortOrder !== "newest" ? "has-selection" : ""}`}>
                    <select
                      value={sortOrder}
                      onChange={(e) => setSortOrder(e.target.value)}
                      className="sl-filter-select"
                    >
                      <option value="newest">מהחדשים לישנים</option>
                      <option value="oldest">מהישנים לחדשים</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* 🔵 טבלה */}
              <div className="sl-dashboard-table-wrapper" data-dashboard-animate>
                <table className="sl-dashboard-table">
                  <thead>
                    <tr>
                      <th>מס'</th>
                      <th>שם לקוח</th>
                      <th>טלפון</th>
                      <th>אימייל</th>
                      <th>סוג תביעה</th>
                      <th>סטטוס תיק</th>
                      <th>סיכום מה־Chatbot</th>
                      <th>פגישה</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredCases.map((c, idx) => {
                      const appt = appointments[c.id];
                      const isPending = appt && appt.status === "pending";

                      return (
                        <tr key={c.id} data-dashboard-animate>
                          <td>{idx + 1}</td>
                          <td>{c.client_name}</td>
                          <td>{c.phone}</td>
                          <td>{c.email}</td>
                          <td>{describeClaimType(c.claim_type)}</td>

                          {/* סטטוס תיק + כפתורים */}
                          <td>
                            <div>
                              <span
                                className={`sl-status-badge ${
                                  c.status === "new"
                                    ? "sl-status-new"
                                    : c.status === "in_review"
                                    ? "sl-status-review"
                                    : "sl-status-closed"
                                }`}
                              >
                                {describeStatus(c.status)}
                              </span>
                              <div className="sl-status-buttons">
                                <button
                                  type="button"
                                  onClick={() => updateCaseStatus(c.id, "new")}
                                  disabled={c.status === "new"}
                                  className="sl-status-btn"
                                >
                                  סמן כ"חדש"
                                </button>
                                <button
                                  type="button"
                                  onClick={() =>
                                    updateCaseStatus(c.id, "in_review")
                                  }
                                  disabled={c.status === "in_review"}
                                  className="sl-status-btn sl-status-btn-review"
                                >
                                  בבדיקה
                                </button>
                                <button
                                  type="button"
                                  onClick={() =>
                                    updateCaseStatus(c.id, "closed")
                                  }
                                  disabled={c.status === "closed"}
                                  className="sl-status-btn sl-status-btn-closed"
                                >
                                  סגור תיק
                                </button>
                              </div>
                            </div>
                          </td>

                          {/* ✅ תא עם סיכום מה־Chatbot */}
                          <td>
                            <div
                              className="sl-summary-cell"
                              title={
                                c.notes_from_chatbot ||
                                "אין סיכום שנשמר מה־chatbot"
                              }
                            >
                              {c.notes_from_chatbot ? c.notes_from_chatbot : "—"}
                            </div>
                          </td>

                          {/* פגישות */}
                          <td className="sl-appointment-cell">
                            {!appt ? (
                              <span className="sl-no-appointment">
                                אין בקשת פגישה
                              </span>
                            ) : (
                              <div>
                                <div className="sl-appointment-info">
                                  <b>מבוקש:</b>{" "}
                                  {formatDateTime(appt.requested_datetime)}
                                </div>
                                {appt.approved_datetime && (
                                  <div className="sl-appointment-info">
                                    <b>מועד שנקבע:</b>{" "}
                                    {formatDateTime(appt.approved_datetime)}
                                  </div>
                                )}
                                <div className="sl-appointment-info">
                                  <b>סטטוס:</b> {translateStatus(appt.status)}
                                </div>

                                {/* כפתורים + בחירת זמן רק כשהפגישה ממתינה */}
                                {isPending && (
                                  <div className="sl-appointment-actions">
                                    <button
                                      onClick={() => approveAppt(appt.id)}
                                      className="sl-appt-btn sl-appt-btn-approve"
                                    >
                                      אישור
                                    </button>

                                    <input
                                      type="datetime-local"
                                      value={draftTimes[appt.id] || ""}
                                      onChange={(e) =>
                                        setDraftTimes((prev) => ({
                                          ...prev,
                                          [appt.id]: e.target.value,
                                        }))
                                      }
                                      className="sl-datetime-input"
                                    />

                                    <button
                                      onClick={() => suggestAppt(appt.id)}
                                      className="sl-appt-btn sl-appt-btn-suggest"
                                    >
                                      הצעת מועד חדש
                                    </button>

                                    <button
                                      onClick={() => rejectAppt(appt.id)}
                                      className="sl-appt-btn sl-appt-btn-reject"
                                    >
                                      דחייה
                                    </button>
                                  </div>
                                )}
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </main>
    </>
  );
}

function describeClaimType(value) {
  switch (value) {
    case "dismissal":
      return "פיטורים שלא כדין";
    case "salary":
      return "אי תשלום שכר / הלנת שכר";
    case "overtime":
      return "שעות נוספות";
    case "rights":
      return "פגיעה בזכויות סוציאליות";
    default:
      return value || "";
  }
}

function describeStatus(value) {
  switch (value) {
    case "new":
      return "חדש";
    case "in_review":
      return "בבדיקה";
    case "closed":
      return "נסגר";
    default:
      return value || "";
  }
}
