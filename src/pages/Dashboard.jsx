// ✅ src/pages/Dashboard.jsx
import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import "../styles/Dashboard.css";
import { AuthContext } from "../context/AuthContext";

const SERVER = "http://localhost:5000";

export default function Dashboard() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user, logout } = useContext(AuthContext);

  useEffect(() => {
    if (user) fetchRecords(user.username);
  }, [user]);

  // ✅ Fetch history for this specific user
  const fetchRecords = async (username) => {
    try {
      const res = await axios.get(`${SERVER}/history`, {
        params: { username },
      });

      // ✅ Fix all URLs by adding SERVER prefix
      const fixedRecords = res.data.map((r) => ({
        ...r,
        url: r.url?.startsWith("http")
          ? r.url
          : `${SERVER}${r.url}`,
        matchedOriginal: r.matchedOriginal
          ? r.matchedOriginal.startsWith("http")
            ? r.matchedOriginal
            : `${SERVER}${r.matchedOriginal}`
          : null,
      }));

      setRecords(fixedRecords);
    } catch (err) {
      console.error("Failed to fetch history:", err);
    } finally {
      setLoading(false);
    }
  };

  // 🧩 Helper to format the status field
  const getStatusText = (r) => {
    if (r.type === "upload") return "Original Upload";
    if (r.status) return r.status;
    return "—";
  };

  // 🧩 Helper to format similarity
  const getSimilarityText = (r) => {
    if (r.similarity) {
      const clean = r.similarity.toString().replace("%", "");
      return `${clean}%`;
    }
    if (r.type === "upload") return "100%";
    return "—";
  };

  // 🧩 CSS class for status color
  const getStatusClass = (r) => {
    if (r.type === "upload") return "status-original";
    if (r.status === "Original") return "status-original";
    if (r.status === "Fake") return "status-forged";
    return "";
  };

  return (
    <div className="dashboard-page">
     
      

      
      <div className="dashboard-container">
        <h2>
          {user
            ? `${user.username}'s Verification History`
            : "Verification History"}
        </h2>

        {loading ? (
          <p>Loading records...</p>
        ) : records.length === 0 ? (
          <p>No records found for this user.</p>
        ) : (
          <table className="history-table">
            <thead>
              <tr>
                <th>File Name</th>
                <th>Status</th>
                <th>Similarity</th>
                <th>Date</th>
                <th>Links</th>
              </tr>
            </thead>
            <tbody>
              {records.map((r, i) => (
                <tr key={i}>
                  <td>{r.fileName}</td>
                  <td className={getStatusClass(r)}>{getStatusText(r)}</td>
                  <td>{getSimilarityText(r)}</td>
                  <td>{new Date(r.date).toLocaleString()}</td>
                  <td>
                    <a href={r.url} target="_blank" rel="noreferrer">
                      View
                    </a>
                    {r.matchedOriginal && (
                      <>
                        {" | "}
                        <a
                          href={r.matchedOriginal}
                          target="_blank"
                          rel="noreferrer"
                        >
                          Matched Original
                        </a>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
