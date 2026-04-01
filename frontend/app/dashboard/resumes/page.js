"use client";
import UploadResume from "../../components/UploadResume";
import ResumeHistory from "../../components/ResumeHistory";

export default function ResumesPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 style={{ fontSize: "2rem", letterSpacing: "-0.02em", marginBottom: "0.25rem" }}>Resume Management</h1>
        <p style={{ color: "var(--text-muted)" }}>Upload new versions of your resume and track history.</p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
        <div style={{ width: "100%" }}>
          <UploadResume />
        </div>
        
        <div style={{ width: "100%" }}>
          <ResumeHistory />
        </div>
      </div>
    </div>
  );
}
