

import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import "../styles/UploadPage.css";
import { AuthContext } from "../context/AuthContext";

const SERVER = "http://localhost:5000";
const MAX_ANALYSIS_ROWS = 20;

export default function UploadPage() {
  const { user } = useContext(AuthContext);

  const [originalFile, setOriginalFile] = useState(null);
  const [verifyFile, setVerifyFile] = useState(null);
  const [originalPreview, setOriginalPreview] = useState(null);
  const [verifyPreview, setVerifyPreview] = useState(null);
  const [originalResult, setOriginalResult] = useState(null);
  const [verifyResult, setVerifyResult] = useState(null);
  const [loadingOriginal, setLoadingOriginal] = useState(false);
  const [loadingVerify, setLoadingVerify] = useState(false);

  const analysisSummary = verifyResult?.analysis?.summary;
  const lineAnalysis = verifyResult?.analysis?.lineAnalysis || [];
  const limitedLineAnalysis = lineAnalysis.slice(0, MAX_ANALYSIS_ROWS);

  useEffect(() => {
    return () => {
      if (originalPreview) URL.revokeObjectURL(originalPreview);
      if (verifyPreview) URL.revokeObjectURL(verifyPreview);
    };
  }, [originalPreview, verifyPreview]);

  const isImage = (file) => file?.type?.startsWith("image/");

  const handleFileSelect = (type, e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (type === "original") {
      setOriginalFile(file);
      setOriginalPreview(isImage(file) ? URL.createObjectURL(file) : null);
      setOriginalResult(null);
    } else {
      setVerifyFile(file);
      setVerifyPreview(isImage(file) ? URL.createObjectURL(file) : null);
      setVerifyResult(null);
    }
  };

  const uploadFile = async (type) => {
    const file = type === "original" ? originalFile : verifyFile;
    if (!file) return alert(`Please select a ${type} document first.`);
    if (!user?.username) return alert("User not found. Please log in first.");

    if (type === "original") setLoadingOriginal(true);
    else setLoadingVerify(true);

    try {
      const fd = new FormData();
      fd.append("username", user.username);
      fd.append("file", file);

      const endpoint =
        type === "original" ? "/upload-original" : "/verify";
      const res = await axios.post(`${SERVER}${endpoint}`, fd);

      if (type === "original") setOriginalResult(res.data);
      else setVerifyResult(res.data);
    } catch (err) {
      console.error(err);
      alert(`Failed to process ${type} document.`);
    } finally {
      if (type === "original") setLoadingOriginal(false);
      else setLoadingVerify(false);
    }
  };

  return (
    <div className="upload-page">
      <div className="upload-wrapper">
        <h2>Document Verification System</h2>

        <div className="upload-section">
          {/* Original Upload */}
          <div className="upload-card">
            <h3>📄 Upload Original Document</h3>
            <input type="file" onChange={(e) => handleFileSelect("original", e)} />
            {originalPreview && (
              <img src={originalPreview} alt="Preview" className="preview-img" />
            )}
            {originalFile && !originalPreview && (
              <p className="file-name">{originalFile.name}</p>
            )}
            <button
              onClick={() => uploadFile("original")}
              disabled={loadingOriginal}
              className="btn red"
            >
              {loadingOriginal ? "Uploading..." : "Upload Original"}
            </button>

            {originalResult && (
              <div className="result-box success">
                <p><b>Stored as:</b> {originalResult.storedAs}</p>
                <p><b>Hash:</b> {originalResult.hash}</p>
                <p>
                  <b>View:</b>{" "}
                  <a href={originalResult.url} target="_blank" rel="noreferrer">
                    Open File
                  </a>
                </p>
              </div>
            )}
          </div>

         
          <div className="upload-card">
            <h3>🔍 Verify Document Authenticity</h3>
            <input type="file" onChange={(e) => handleFileSelect("verify", e)} />
            {verifyPreview && (
              <img src={verifyPreview} alt="Preview" className="preview-img" />
            )}
            {verifyFile && !verifyPreview && (
              <p className="file-name">{verifyFile.name}</p>
            )}
            <button
              onClick={() => uploadFile("verify")}
              disabled={loadingVerify}
              className="btn green"
            >
              {loadingVerify ? "Verifying..." : "Verify Document"}
            </button>

            {verifyResult && (
              <div
                className={`result-box ${
                  verifyResult.status === "Original" ? "success" : "danger"
                }`}
              >
                <p><b>Result:</b> {verifyResult.status}</p>
                <p><b>Similarity:</b> {verifyResult.similarity || "—"}</p>
                <p>
                  <b>Uploaded file:</b>{" "}
                  <a href={verifyResult.url} target="_blank" rel="noreferrer">
                    Open
                  </a>
                </p>
                {verifyResult.matchedOriginal && (
                  <p>
                    <b>Matched original:</b>{" "}
                    <a href={verifyResult.matchedOriginal} target="_blank" rel="noreferrer">
                      Open
                    </a>
                  </p>
                )}
                {verifyResult.analysis && (
                  <div className="analysis-box">
                    <h4>Line-by-line analysis</h4>
                    <div className="analysis-summary">
                      <div>
                        <span>Original lines</span>
                        <strong>{analysisSummary?.totalOriginalLines ?? "—"}</strong>
                      </div>
                      <div>
                        <span>Verified lines</span>
                        <strong>{analysisSummary?.totalVerifyLines ?? "—"}</strong>
                      </div>
                      <div>
                        <span>Matches</span>
                        <strong>{analysisSummary?.matches ?? 0}</strong>
                      </div>
                      <div>
                        <span>Modified</span>
                        <strong>{analysisSummary?.modified ?? 0}</strong>
                      </div>
                      <div>
                        <span>Removed</span>
                        <strong>{analysisSummary?.removed ?? 0}</strong>
                      </div>
                      <div>
                        <span>Added</span>
                        <strong>{analysisSummary?.added ?? 0}</strong>
                      </div>
                    </div>

                    {limitedLineAnalysis.length > 0 ? (
                      <div className="line-diff-list">
                        {limitedLineAnalysis
                          .filter((line) => {
                            
                            const hasReadableText = (text) => {
                              if (!text || text.length < 3) return false;
                              const alphaCount = (text.match(/[a-zA-Z]/g) || []).length;
                              return alphaCount >= text.length * 0.3; 
                            };
                            return (
                              hasReadableText(line.originalText) ||
                              hasReadableText(line.verifyText)
                            );
                          })
                          .map((line, idx) => (
                            <div
                              key={`${line.type}-${line.originalLine}-${line.verifyLine}-${idx}`}
                              className={`line-diff-row ${line.type}`}
                            >
                              <div className="line-diff-header">
                                <div className="line-content">
                                  <small className="line-label">Original #{line.originalLine ?? "—"}</small>
                                  <p className="line-text original">
                                    {line.originalText && line.originalText.length > 150
                                      ? `${line.originalText.substring(0, 150)}...`
                                      : line.originalText || "—"}
                                  </p>
                                </div>
                                <div className="line-content">
                                  <small className="line-label">Verified #{line.verifyLine ?? "—"}</small>
                                  <p className="line-text verify">
                                    {line.verifyText && line.verifyText.length > 150
                                      ? `${line.verifyText.substring(0, 150)}...`
                                      : line.verifyText || "—"}
                                  </p>
                                </div>
                                <span className={`line-tag ${line.type}`}>{line.type}</span>
                              </div>
                              {line.wordDiff &&
                                (line.wordDiff.removed?.length > 0 ||
                                  line.wordDiff.added?.length > 0) && (
                                  <div className="word-diff">
                                    {line.wordDiff.removed?.length > 0 && (
                                      <p className="word-removed">
                                        <b>Removed:</b>{" "}
                                        {line.wordDiff.removed
                                          .filter((w) => w && w.length > 2)
                                          .slice(0, 3)
                                          .join(" | ")}
                                      </p>
                                    )}
                                    {line.wordDiff.added?.length > 0 && (
                                      <p className="word-added">
                                        <b>Added:</b>{" "}
                                        {line.wordDiff.added
                                          .filter((w) => w && w.length > 2)
                                          .slice(0, 3)
                                          .join(" | ")}
                                      </p>
                                    )}
                                  </div>
                                )}
                            </div>
                          ))}
                      </div>
                    ) : (
                      <p className="analysis-empty">No meaningful textual differences detected.</p>
                    )}
                    {lineAnalysis.length > MAX_ANALYSIS_ROWS && (
                      <p className="analysis-note">
                        Showing first {MAX_ANALYSIS_ROWS} lines of analysis. Download full report from
                        the backend logs if needed.
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
