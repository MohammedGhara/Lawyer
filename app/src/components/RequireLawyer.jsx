// app/src/components/RequireLawyer.jsx
import React from "react";
import { Navigate } from "react-router-dom";

export default function RequireLawyer({ children }) {
  const isLawyer = localStorage.getItem("smartlaw_role") === "lawyer";

  if (!isLawyer) {
    // Not logged in as lawyer → go to login page
    return <Navigate to="/lawyer-login" replace />;
  }

  return children;
}
