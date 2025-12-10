import React from "react";
import "../styles/LearnMore.css";

export default function LearnMore() {
  return (
    <div className="learn-container">

      {/* HEADER */}
      <header className="learn-header">
        <h1 className="title">Document Forgery Detection</h1>
        <p className="subtitle">
          A modern AI-powered system that detects forged and tampered documents
          using Machine Learning, Image Processing, and Smart Comparison.
        </p>
      </header>

      {/* SECTION 1 */}
      <section className="learn-section fade-in">
        <h2>1. What is Document Forgery?</h2>
        <p>
          Document forgery involves altering certificates, ID cards, marksheets,
          or legal documents by modifying text, signatures, photos, or seals.
          Manual verification is slow and often inaccurate. This system automates
          verification using machine intelligence.
        </p>
      </section>

      {/* SECTION 2 */}
      <section className="learn-section fade-in">
        <h2>2. Project Objective</h2>
        <p>
          The goal of this project is to provide fast and reliable verification
          by identifying whether a document is <b>genuine</b> or <b>forged</b>.
          The system compares uploaded documents with the stored original using
          feature extraction and ML classification.
        </p>
      </section>

      {/* WORKFLOW */}
      <section className="learn-section fade-in">
        <h2>3. How the System Works</h2>
        <div className="workflow-box">
          <div className="flow-item">📤 Upload Original Document</div>
          <div className="flow-arrow">➜</div>
          <div className="flow-item">📁 Stored Securely in Database</div>
          <div className="flow-arrow">➜</div>
          <div className="flow-item">🔍 Upload File for Verification</div>
          <div className="flow-arrow">➜</div>
          <div className="flow-item">🤖 ML Model Compares Features</div>
          <div className="flow-arrow">➜</div>
          <div className="flow-item">📥 Genuine / Fake Result</div>
        </div>
      </section>

      {/* TECHNOLOGY GRID */}
      <section className="learn-section fade-in">
        <h2>4. Technologies Used</h2>
        <div className="tech-grid">
          {[
            "React.js",
            "Node.js",
            "Express.js",
            "Multer",
            "Crypto.js",
            "Python",
            "Flask",
            "OpenCV",
            "NumPy",
            "Scikit-Learn",
            "Joblib",
            "Axios",
            "CSS",
          ].map((tech, i) => (
            <div key={i} className="tech-item">{tech}</div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section className="learn-section fade-in">
        <h2>5. What This System Can Do</h2>
        <ul className="styled-list">
          <li>Compares uploaded documents with stored originals</li>
          <li>Detects major forgery attempts with high accuracy</li>
          <li>Automates verification with minimal human effort</li>
        </ul>
      </section>

      {/* FUTURE ENHANCEMENTS */}
      <section className="learn-section fade-in">
        <h2>6. Future Enhancements</h2>
        <ul className="styled-list">
          <li>Deep learning–based forgery detection (CNN models)</li>
          <li>OCR text extraction & intelligent content comparison</li>
          <li>Signature and watermark verification</li>
          <li>Tamper region detection using heatmaps</li>
        </ul>
      </section>

      {/* FOOTER */}
      <footer className="learn-footer">
        © {new Date().getFullYear()} Document Forgery Detection — All Rights Reserved
      </footer>
    </div>
  );
}
