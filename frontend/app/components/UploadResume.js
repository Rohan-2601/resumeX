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
    <div style={{ marginTop: "2rem", padding: "1rem", border: "1px solid #ccc" }}>
      <h2>Upload Resume</h2>

      <input
        type="file"
        accept="application/pdf"
        onChange={handleFileChange}
      />

      <button onClick={handleUpload} disabled={uploading}>
        {uploading ? "Uploading..." : "Upload Resume"}
      </button>

      <p>{message}</p>
    </div>
  );
}