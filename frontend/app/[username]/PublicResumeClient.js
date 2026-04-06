"use client";

import { useEffect, useState } from "react";
import axios from "axios";

export default function PublicResumeClient({ username }) {
  const [resume, setResume] = useState(null);

  useEffect(() => {
    if (!username) return;

    const fetchResume = async () => {
      const backendUrl =
        process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
      const res = await axios.get(`${backendUrl}/api/public/${username}`);

      setResume(res.data);
    };

    fetchResume();
  }, [username]);

  if (!resume) return <p>Loading...</p>;

  return (
    <iframe
      src={`https://docs.google.com/gview?url=${encodeURIComponent(resume.fileUrl)}&embedded=true`}
      style={{ width: "100%", height: "100vh", border: "none" }}
      title={`${resume.user?.name || username}'s Resume`}
    />
  );
}
