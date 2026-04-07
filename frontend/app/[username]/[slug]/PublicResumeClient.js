"use client";

import { useEffect, useState } from "react";
import axios from "axios";

export default function PublicResumeClient({ username, slug }) {
  const [resumeData, setResumeData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!username || !slug) return;

    const fetchPublicLink = async () => {
      try {
        const backendUrl =
          process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
        // Keep this endpoint for page views; it tracks visit analytics.
        const res = await axios.get(
          `${backendUrl}/api/public/${username}/${slug}`,
        );
        setResumeData(res.data);
      } catch (err) {
        console.error(err);
        setError(
          err.response?.data?.message || "Link not found or deactivated.",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchPublicLink();
  }, [username, slug]);

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "0.75rem",
        }}
      >
        <div
          style={{
            width: "32px",
            height: "32px",
            borderRadius: "999px",
            border: "3px solid #e2e8f0",
            borderTopColor: "#4f46e5",
            animation: "resumeSpin 0.7s linear infinite",
          }}
        />
        <p style={{ margin: 0, color: "#64748b", fontSize: "0.95rem" }}>
          Loading resume...
        </p>
        <style jsx>{`
          @keyframes resumeSpin {
            to {
              transform: rotate(360deg);
            }
          }
        `}</style>
      </div>
    );
  }
  if (error) return <p style={{ color: "red", padding: "2rem" }}>{error}</p>;
  if (!resumeData) return null;

  return (
    <div style={{ margin: 0, padding: 0, overflow: "hidden" }}>
      <iframe
        src={`https://docs.google.com/gview?url=${encodeURIComponent(
          resumeData.fileUrl,
        )}&embedded=true`}
        style={{
          width: "100%",
          height: "100vh",
          border: "none",
          display: "block",
        }}
        title={`${resumeData.user.name}'s Resume`}
      />
    </div>
  );
}
