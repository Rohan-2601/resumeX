"use client";

import { useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

export default function UploadResume() {
  const { user } = useAuth();
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");

  const handleFileChange = (e) => {
    setMessage("");
    if (e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setMessage("Please select a PDF file first.");
      return;
    }

    setUploading(true);
    setMessage("");

    try {
      // 🔥 FIXED Cloudinary upload
      const formData = new FormData();
      formData.append("file", file);
      formData.append(
        "upload_preset",
        process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET
      );

      const res = await axios.post(
        `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/upload`,
        formData
      );

      const fileUrl = res.data.secure_url;

      console.log("Uploaded URL:", fileUrl);

      // send to backend via versioning APIs
      const token = localStorage.getItem("token");
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

      let resumeId = null;
      try {
        const resumeRes = await axios.get(`${backendUrl}/api/resume/${user.username}`);
        resumeId = resumeRes.data.resume._id;
      } catch (err) {
        if (err.response?.status === 404) {
          const createRes = await axios.post(
            `${backendUrl}/api/resume`,
            {},
            { headers: { Authorization: `Bearer ${token}` } }
          );
          resumeId = createRes.data.resume._id;
        } else {
          throw err;
        }
      }

      await axios.post(
        `${backendUrl}/api/resume/${resumeId}/version`,
        { fileUrl },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setMessage("✅ Resume uploaded successfully!");
      setFile(null);

    } catch (error) {
      console.error(error);
      setMessage("❌ Upload failed");
    } finally {
      setUploading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="card" style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      <h2 style={{ fontSize: "1.1rem", margin: 0 }}>Upload PDF Document</h2>

      <div style={{ display: "flex", gap: "1rem", alignItems: "center", border: "1px dashed var(--border)", padding: "1rem", borderRadius: "8px", backgroundColor: "var(--bg-surface-hover)" }}>
        <input
          type="file"
          accept="application/pdf"
          onChange={handleFileChange}
          style={{ flex: 1 }}
        />
        <button onClick={handleUpload} disabled={uploading} className="btn btn-primary" style={{ padding: "0.5rem 1.5rem" }}>
          {uploading ? "Uploading..." : "Upload Resume"}
        </button>
      </div>

      {message && <p style={{ margin: 0, fontSize: "0.9rem", color: message.includes("✅") ? "var(--success-text)" : "var(--danger-text)" }}>{message}</p>}
    </div>
  );
}