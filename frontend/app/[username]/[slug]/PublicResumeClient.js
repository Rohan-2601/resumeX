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
          alignItems: "center",
          justifyContent: "center",
          background:
            "radial-gradient(circle at top, #f8fbff 0%, #eef4ff 40%, #e6eeff 100%)",
          padding: "2rem",
        }}
      >
        <div
          style={{
            textAlign: "center",
            padding: "2rem 2.25rem",
            borderRadius: "20px",
            background: "rgba(255, 255, 255, 0.84)",
            border: "1px solid rgba(99, 102, 241, 0.12)",
            boxShadow: "0 20px 45px rgba(30, 58, 138, 0.12)",
            backdropFilter: "blur(6px)",
            maxWidth: "480px",
            width: "100%",
          }}
        >
          <div
            style={{
              width: "44px",
              height: "44px",
              borderRadius: "999px",
              border: "4px solid #c7d2fe",
              borderTopColor: "#4338ca",
              margin: "0 auto",
              animation: "resumeSpin 0.8s linear infinite",
            }}
          />
          <p
            style={{
              marginTop: "1rem",
              marginBottom: "0.4rem",
              fontSize: "1.1rem",
              fontWeight: 700,
              color: "#1e3a8a",
            }}
          >
            Polishing this resume for you
          </p>
          <p style={{ margin: 0, color: "#334155", fontSize: "0.95rem" }}>
            Loading your preview. This usually takes a moment.
          </p>
        </div>
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
