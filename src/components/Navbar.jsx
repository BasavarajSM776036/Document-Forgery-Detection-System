import React, { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../styles/Navbar.css"; // ✅ Add this

const Navbar = () => {
  const { user, isLoggedIn, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/");
    setMenuOpen(false);
  };

  const navLinks = useMemo(
    () => (
      <>
        <Link to="/" onClick={() => setMenuOpen(false)}>
          Home
        </Link>
        <Link to="/upload" onClick={() => setMenuOpen(false)}>
          Upload
        </Link>
        <Link to="/dashboard" onClick={() => setMenuOpen(false)}>
          Dashboard
        </Link>
        <Link to="/learn-more" onClick={() => setMenuOpen(false)}>
          Learn More
        </Link>
      </>
    ),
    []
  );

  return (
    <nav className={`navbar ${menuOpen ? "is-open" : ""}`}>
      <div className="navbar-left">
        <Link to="/" className="logo">
          Forgery<span>Detection</span>
        </Link>
      </div>

      <button
        type="button"
        className="navbar-toggle focus-ring"
        aria-label={menuOpen ? "Close menu" : "Open menu"}
        aria-expanded={menuOpen}
        onClick={() => setMenuOpen((v) => !v)}
      >
        <span className="navbar-toggle-bar" />
        <span className="navbar-toggle-bar" />
        <span className="navbar-toggle-bar" />
      </button>

      <div className="navbar-links">{navLinks}</div>

      <div className="navbar-right">
        {isLoggedIn ? (
          <>
            <span className="user-info" title={user?.username}>
              👤 {user?.username}
            </span>
            <button className="logout-btn" onClick={handleLogout}>
              Logout
            </button>
          </>
        ) : (
          <Link className="login-btn" to="/login" onClick={() => setMenuOpen(false)}>
            Login
          </Link>
        )}
      </div>

      <div className="navbar-mobile-panel">
        <div className="navbar-mobile-links">{navLinks}</div>
        <div className="navbar-mobile-auth">
          {isLoggedIn ? (
            <>
              <div className="navbar-mobile-user">Signed in as {user?.username}</div>
              <button className="logout-btn" onClick={handleLogout}>
                Logout
              </button>
            </>
          ) : (
            <Link className="login-btn" to="/login" onClick={() => setMenuOpen(false)}>
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
