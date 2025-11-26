import React from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import Home from "./pages/Home.jsx";
import IntakeForm from "./pages/IntakeForm.jsx"; // חדש
import Chatbot from "./pages/Chatbot.jsx";
import LawyerDashboard from "./pages/LawyerDashboard.jsx";
import AppointmentPicker from "./pages/AppointmentPicker.jsx";
import LawyerLogin from "./pages/LawyerLogin.jsx";
import RequireLawyer from "./components/RequireLawyer.jsx";
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
        <Route path="/intake" element={<IntakeForm />} /> {/* חדש */}
        <Route path="/chat/:caseId" element={<Chatbot />} />   {}
          <Route
          path="/lawyer"
          element={
            <RequireLawyer>
              <LawyerDashboard />
            </RequireLawyer>
          }
            />
          <Route path="/cases/:caseId/appointment" element={<AppointmentPicker />} />
        <Route path="/lawyer-login" element={<LawyerLogin />} />
      </Routes>
    </div>
  );
}
