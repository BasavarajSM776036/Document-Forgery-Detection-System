import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext"; 
import "../styles/home.css";

const Homepage = () => {
  const { isLoggedIn } = useAuth(); 

  return (
    <div className="page">

      {/* Hero Section */}
      <section className="hero">
        <h1>Advanced Document Forgery Detection System</h1>
        <p>
          Upload any document or image and instantly verify its authenticity.
        </p>

        <div className="buttons">

          {/* Analyze button based on login */}
          {isLoggedIn ? (
            <Link
              style={{ fontSize: "20px", color: "white" }}
              to="/upload"
              className="btn btn-primary"
            >
              Analyze Document
            </Link>
          ) : (
            <Link
              style={{ fontSize: "20px" }}
              to="/login"
              className="btn btn-primary"
            >
              Login to Analyze
            </Link>
          )}

          {/* ✅ FIXED LEARN MORE BUTTON */}
          <Link
            style={{ fontSize: "20px", color: "red" }}
            to="/learn-more"
            className="btn btn-secondary"
          >
            Learn More
          </Link>

        </div>
      </section>

      {/* Features */}
      <section className="features">
        <h2>How It Works</h2>
        <div className="feature-grid">
          <div className="feature-card">📂 Upload Document</div>
          <div className="feature-card">⚡ Advanced Analysis</div>
          <div className="feature-card">📊 Detailed Results</div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta">
        <h2>Ready to Verify Your Documents?</h2>
        <p>Start using our advanced system today.</p>

        {isLoggedIn ? (
          <Link to="/upload" className="btn btn-primary">
            Get Started Now
          </Link>
        ) : (
          <Link to="/login" className="btn btn-primary">
            Login to Get Started
          </Link>
        )}
      </section>

      {/* Footer */}
      <footer className="footer">
        © 2025 Forgery Detection System | All rights reserved
      </footer>

    </div>
  );
};

export default Homepage;
