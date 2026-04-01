"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "next/navigation";

export default function ResumePage() {
  const params = useParams();
  const username = params?.username;

  const [resume, setResume] = useState(null);

  // ✅ ADD FUNCTION HERE
  const getPdfViewUrl = (url) => {
    return url.replace("/upload/", "/upload/fl_attachment/");
  };

  useEffect(() => {
    if (!username) return;

    const fetchResume = async () => {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/resume/${username}`
      );

      setResume(res.data.resume);
    };

    fetchResume();
  }, [username]);

  if (!resume) return <p>Loading...</p>;

  return (
    <iframe
  src={`https://docs.google.com/gview?url=${encodeURIComponent(resume.fileUrl)}&embedded=true`}
  style={{ width: "100%", height: "100vh", border: "none" }}
/>
  );
}