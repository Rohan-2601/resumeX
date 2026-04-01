"use client";

import { useEffect, useState, use } from "react";
import axios from "axios";

export default function PublicResumePage({ params }) {
  const resolvedParams = use(params);
  const username = resolvedParams?.username;
  const slug = resolvedParams?.slug;

  const [resumeData, setResumeData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!username || !slug) return;

    const fetchPublicLink = async () => {
      try {
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
        // Fetch data from the unprotected endpoint (tracks view automatically!)
        const res = await axios.get(`${backendUrl}/api/public/${username}/${slug}`);
        setResumeData(res.data);
      } catch (err) {
        console.error(err);
        setError(err.response?.data?.message || "Link not found or deactivated.");
      } finally {
        setLoading(false);
      }
    };

    fetchPublicLink();
  }, [username, slug]);

  if (loading) return <p style={{ padding: "2rem" }}>Loading resume...</p>;
  if (error) return <p style={{ color: "red", padding: "2rem" }}>{error}</p>;
  if (!resumeData) return null;

  return (
    <div style={{ margin: 0, padding: 0, overflow: "hidden" }}>
      <iframe
        src={`https://docs.google.com/gview?url=${encodeURIComponent(resumeData.fileUrl)}&embedded=true`}
        style={{ width: "100%", height: "100vh", border: "none", display: "block" }}
        title={`${resumeData.user.name}'s Resume`}
      />
    </div>
  );
}
