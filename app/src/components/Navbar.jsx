// app/src/components/Navbar.jsx
import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const isLawyer = localStorage.getItem("smartlaw_role") === "lawyer";
  const [scrolled, setScrolled] = useState(false);

  // Track scroll for navbar background effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  function handleLogout() {
    localStorage.removeItem("smartlaw_role");
    navigate("/");
  }

  return (
    <>
      <style>{`
        @keyframes navbarFadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes logoPulse {
          0%, 100% {
            transform: scale(1);
            box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.7);
          }
          50% {
            transform: scale(1.05);
            box-shadow: 0 0 0 8px rgba(59, 130, 246, 0);
          }
        }

        @keyframes linkHover {
          from {
            transform: translateY(0);
          }
          to {
            transform: translateY(-2px);
          }
        }

        .navbar-container {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 1000;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          animation: navbarFadeIn 0.6s ease-out;
        }

        .navbar-container.scrolled {
          backdrop-filter: blur(20px);
          background: rgba(15, 23, 42, 0.85) !important;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
        }

        .navbar-content {
          max-width: 1400px;
          margin: 0 auto;
          padding: 1rem 2rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          direction: rtl;
        }

        .navbar-logo-link {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          text-decoration: none;
          color: white;
          transition: transform 0.3s ease;
        }

        .navbar-logo-link:hover {
          transform: translateX(-3px);
        }

        .navbar-logo-circle {
          width: 42px;
          height: 42px;
          background: linear-gradient(135deg, #3b82f6, #2563eb);
          border-radius: 50%;
          display: flex;
          justify-content: center;
          align-items: center;
          font-size: 1.3rem;
          position: relative;
          animation: logoPulse 3s ease-in-out infinite;
          box-shadow: 0 4px 15px rgba(59, 130, 246, 0.4);
          transition: all 0.3s ease;
        }

        .navbar-logo-circle::before {
          content: '';
          position: absolute;
          inset: -2px;
          border-radius: 50%;
          background: linear-gradient(135deg, #3b82f6, #60a5fa);
          opacity: 0;
          transition: opacity 0.3s ease;
          z-index: -1;
        }

        .navbar-logo-link:hover .navbar-logo-circle::before {
          opacity: 0.3;
        }

        .navbar-logo-link:hover .navbar-logo-circle {
          transform: scale(1.1);
          box-shadow: 0 6px 20px rgba(59, 130, 246, 0.6);
        }

        .navbar-brand-text {
          font-size: 1.35rem;
          font-weight: 800;
          background: linear-gradient(135deg, #ffffff, #e0e7ff);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          letter-spacing: -0.02em;
          transition: all 0.3s ease;
        }

        .navbar-logo-link:hover .navbar-brand-text {
          background: linear-gradient(135deg, #ffffff, #c7d2fe);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .navbar-links {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .navbar-link {
          position: relative;
          text-decoration: none;
          color: rgba(255, 255, 255, 0.9);
          font-size: 0.95rem;
          font-weight: 500;
          padding: 0.6rem 1.2rem;
          border-radius: 0.75rem;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          overflow: hidden;
        }

        .navbar-link::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(37, 99, 235, 0.1));
          opacity: 0;
          transition: opacity 0.3s ease;
          border-radius: 0.75rem;
        }

        .navbar-link:hover::before {
          opacity: 1;
        }

        .navbar-link:hover {
          color: #ffffff;
          transform: translateY(-2px);
          background: rgba(59, 130, 246, 0.15);
        }

        .navbar-link.active {
          color: #ffffff;
          background: linear-gradient(135deg, rgba(59, 130, 246, 0.3), rgba(37, 99, 235, 0.2));
        }

        .navbar-link.active::after {
          content: '';
          position: absolute;
          bottom: 0.3rem;
          left: 50%;
          transform: translateX(-50%);
          width: 60%;
          height: 2px;
          background: linear-gradient(90deg, transparent, #60a5fa, transparent);
          border-radius: 2px;
        }

        .navbar-button {
          padding: 0.6rem 1.4rem;
          background: linear-gradient(135deg, #ef4444, #dc2626);
          border: none;
          border-radius: 0.75rem;
          color: white;
          font-weight: 600;
          font-size: 0.9rem;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
          position: relative;
          overflow: hidden;
        }

        .navbar-button::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, #f87171, #ef4444);
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .navbar-button:hover::before {
          opacity: 1;
        }

        .navbar-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(239, 68, 68, 0.4);
        }

        .navbar-button:active {
          transform: translateY(0);
        }

        .navbar-login-button {
          padding: 0.6rem 1.4rem;
          background: linear-gradient(135deg, #3b82f6, #2563eb);
          border: none;
          border-radius: 0.75rem;
          color: white;
          font-weight: 600;
          font-size: 0.9rem;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
          text-decoration: none;
          display: inline-block;
          position: relative;
          overflow: hidden;
        }

        .navbar-login-button::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, #60a5fa, #3b82f6);
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .navbar-login-button:hover::before {
          opacity: 1;
        }

        .navbar-login-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(59, 130, 246, 0.4);
        }

        .navbar-login-button:active {
          transform: translateY(0);
        }

        @media (max-width: 768px) {
          .navbar-content {
            padding: 0.85rem 1.2rem;
          }

          .navbar-brand-text {
            font-size: 1.15rem;
          }

          .navbar-logo-circle {
            width: 36px;
            height: 36px;
            font-size: 1.1rem;
          }

          .navbar-link {
            padding: 0.5rem 0.9rem;
            font-size: 0.85rem;
          }

          .navbar-button,
          .navbar-login-button {
            padding: 0.5rem 1rem;
            font-size: 0.85rem;
          }
        }
      `}</style>

      <nav className={`navbar-container ${scrolled ? "scrolled" : ""}`}>
        <div
          style={{
            background: scrolled
              ? "rgba(15, 23, 42, 0.85)"
              : "linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(30, 41, 59, 0.98))",
            backdropFilter: scrolled ? "blur(20px)" : "blur(10px)",
            borderBottom: scrolled
              ? "1px solid rgba(148, 163, 184, 0.2)"
              : "1px solid rgba(148, 163, 184, 0.1)",
            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          }}
        >
          <div className="navbar-content">
            {/* ---------- RIGHT SIDE: LOGO + WEBSITE NAME ---------- */}
            <Link to="/" className="navbar-logo-link">
              <div className="navbar-logo-circle">⚖️</div>
              <span className="navbar-brand-text">משפט חכם</span>
            </Link>

            {/* ---------- LEFT SIDE: NAV LINKS ---------- */}
            <div className="navbar-links">
              {/* Home always visible */}
              <Link
                to="/"
                className={`navbar-link ${location.pathname === "/" ? "active" : ""}`}
              >
                דף הבית
              </Link>

              {/* Lawyer-specific items */}
              {!isLawyer && (
                <Link to="/lawyer-login" className="navbar-login-button">
                  כניסת עו״ד
                </Link>
              )}

              {isLawyer && (
                <>
                  <Link
                    to="/lawyer"
                    className={`navbar-link ${
                      location.pathname === "/lawyer" ? "active" : ""
                    }`}
                  >
                    דשבורד עו״ד
                  </Link>

                  <button onClick={handleLogout} className="navbar-button">
                    התנתקות
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>
    </>
  );
}
