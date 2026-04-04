"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

export default function ResumeHistory() {
  const { user } = useAuth();
  const [versions, setVersions] = useState([]);
  const [resumeData, setResumeData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [rollingBack, setRollingBack] = useState(false);

  const fetchVersions = async () => {
    if (!user) return;
    setLoading(true);
    setError("");

    try {
      const backendUrl =
        process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
      const token = localStorage.getItem("token");

      // 1. Get current resume context
      const resumeRes = await axios.get(`${backendUrl}/api/resume/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const resumeContainer = resumeRes.data.resumes?.[0] || null;
      if (!resumeContainer) {
        setResumeData(null);
        setVersions([]);
        setError("No resumes uploaded yet.");
        return;
      }
      setResumeData(resumeContainer);

      // 2. Fetch all versions
      const versionsRes = await axios.get(
        `${backendUrl}/api/resume/${resumeContainer._id}/versions`,
        { headers: { Authorization: `Bearer ${token}` } },
      );

      setVersions(versionsRes.data.versions);
    } catch (err) {
      if (err.response?.status === 404) {
        setError("No resumes uploaded yet.");
      } else {
        console.error(err);
        setError("Failed to load versions.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVersions();
  }, [user]);

  const handleRollback = async (versionId) => {
    if (!resumeData) return;

    setRollingBack(true);
    try {
      const backendUrl =
        process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
      const token = localStorage.getItem("token");

      await axios.post(
        `${backendUrl}/api/resume/${resumeData._id}/rollback/${versionId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } },
      );

      await fetchVersions();
    } catch (err) {
      console.error(err);
      alert("Failed to rollback");
    } finally {
      setRollingBack(false);
    }
  };

  if (!user) return null;

  return (
    <div
      className="card"
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "1rem",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h2 style={{ marginTop: 0 }}>Version History</h2>
        <button
          onClick={fetchVersions}
          disabled={loading}
          style={{ padding: "0.5rem" }}
        >
          Refresh
        </button>
      </div>

      {loading && <p>Loading versions...</p>}
      {error && <p>{error}</p>}

      {!loading && !error && versions.length === 0 && <p>No versions found.</p>}

      {!loading && versions.length > 0 && (
        <ul
          style={{
            listStyle: "none",
            padding: 0,
            margin: 0,
            marginTop: "1rem",
          }}
        >
          {versions.map((v) => {
            const isCurrent = resumeData && resumeData.versionId === v._id;

            return (
              <li
                key={v._id}
                style={{
                  padding: "1rem",
                  borderBottom: "1px solid #eee",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  backgroundColor: isCurrent ? "#f0f8ff" : "transparent",
                }}
              >
                <div>
                  <strong>Version {v.versionNumber}</strong>
                  {isCurrent && (
                    <span
                      style={{
                        marginLeft: "0.5rem",
                        color: "blue",
                        fontSize: "0.8rem",
                        fontWeight: "bold",
                      }}
                    >
                      (Current active)
                    </span>
                  )}
                  <div
                    style={{
                      fontSize: "0.85rem",
                      color: "#666",
                      marginTop: "0.25rem",
                    }}
                  >
                    Uploaded: {new Date(v.createdAt).toLocaleString()}
                  </div>
                  <div style={{ marginTop: "0.5rem" }}>
                    <a
                      href={v.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: "#0066cc", textDecoration: "none" }}
                    >
                      View PDF
                    </a>
                  </div>
                </div>

                {!isCurrent && (
                  <button
                    onClick={() => handleRollback(v._id)}
                    disabled={rollingBack}
                    style={{
                      padding: "0.5rem 1rem",
                      cursor: rollingBack ? "not-allowed" : "pointer",
                    }}
                  >
                    Rollback to this
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
