import React from "react";
import "../styles/LearnMore.css";

export default function LearnMore() {
  return (
    <div className="learn-container">

      <header className="learn-header">
        <h1>Document Forgery Detection</h1>
        <p className="subtitle">
          A simple explanation of how this system detects forged or genuine documents
          using image processing and machine learning.
        </p>
      </header>

      {/* Section 1 */}
      <section className="learn-section">
        <h2>1. What is Document Forgery?</h2>
        <p>
          Document forgery refers to modifying or creating fake certificates,
          ID cards, marksheets, or legal documents. These forgeries may include
          altered text, changed photographs, edited signatures, or tampered
          seals. Detecting such changes manually is difficult and error-prone.
        </p>
      </section>

      {/* Section 2 */}
      <section className="learn-section">
        <h2>2. Project Purpose</h2>
        <p>
          The goal of this project is to provide an automated way to detect
          whether an uploaded document is <b>genuine</b> or <b>forged</b>.
          The system compares the uploaded document with the stored original
          using machine learning-based feature extraction.
        </p>
      </section>

      {/* Section 3 */}
      <section className="learn-section">
        <h2>3. How the System Works</h2>
        <div className="workflow-box">
          <div>📤 User uploads Original Document</div>
          <div>➡ Node.js saves file and extracts features</div>
          <div>➡ Verification document is uploaded</div>
          <div>➡ ML model compares the two documents</div>
          <div>📥 System shows Genuine / Fake result</div>
        </div>
      </section>

      {/* Section 4 */}
      <section className="learn-section">
        <h2>4. Technologies Used</h2>
        <div className="tech-grid">
          <div className="tech-item">React.js</div>
          <div className="tech-item">Node.js</div>
          <div className="tech-item">Express.js</div>
          <div className="tech-item">Python</div>
          <div className="tech-item">OpenCV</div>
          <div className="tech-item">Machine Learning</div>
        </div>
      </section>

      {/* Section 5 */}
      <section className="learn-section">
        <h2>5. What This System Can Do</h2>
        <ul>
          <li>Compares uploaded documents with their original version</li>
          <li>Detects high-level forgery attempts (major changes)</li>
          <li>Provides fast and automated verification</li>
        </ul>
      </section>

      {/* Section 6 */}
      <section className="learn-section">
        <h2>6. Future Enhancements</h2>
        <ul>
          <li>Deep learning-based forgery detection</li>
          <li>Text extraction (OCR) and comparison</li>
          <li>Signature verification</li>
          <li>Watermark and stamp verification</li>
        </ul>
      </section>

      <footer className="learn-footer">
        © {new Date().getFullYear()} Document Forgery Detection Project
      </footer>
    </div>
  );
}
