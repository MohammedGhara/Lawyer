// app/src/App.jsx
import React from "react";
import { Routes, Route, useNavigate } from "react-router-dom";

import Navbar from "./components/Navbar.jsx";
import Home from "./pages/Home.jsx";
import IntakeForm from "./pages/IntakeForm.jsx";
import Chatbot from "./pages/Chatbot.jsx";
import LawyerDashboard from "./pages/LawyerDashboard.jsx";
import AppointmentPicker from "./pages/AppointmentPicker.jsx";
import LawyerLogin from "./pages/LawyerLogin.jsx";
import RequireLawyer from "./components/RequireLawyer.jsx";
// 🔐 דף המנהל עם סיסמה פנימית
import AdminLogin from "./pages/AdminLogin.jsx";

export default function App() {
  const navigate = useNavigate();

  const handleStartIntake = () => {
    navigate("/intake");
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f3f4f6" }}>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home onStartIntake={handleStartIntake} />} />
        <Route path="/intake" element={<IntakeForm />} />
        <Route path="/chat/:caseId" element={<Chatbot />} />

        {/* דשבורד עו"ד רגיל – לפי תפקיד */}
        <Route
          path="/lawyer"
          element={
            <RequireLawyer>
              <LawyerDashboard />
            </RequireLawyer>
          }
        />

        {/* 🔐 דף מנהל תחומי ידע – עם סיסמה (לא קשור ל־RequireLawyer) */}
        <Route path="/admin-domains" element={<AdminLogin />} />

        <Route
          path="/cases/:caseId/appointment"
          element={<AppointmentPicker />}
        />
        <Route path="/lawyer-login" element={<LawyerLogin />} />
      </Routes>
    </div>
  );
}
