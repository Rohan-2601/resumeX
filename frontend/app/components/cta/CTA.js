"use client";

import { useAuth } from "../../context/AuthContext";
import { GitHubIcon } from "../icons/Icons";

export default function CTA() {
  const { login } = useAuth();
  
  return (
    <section style={{ padding: "6rem 2rem", background: "var(--bg-surface-hover)", textAlign: "center", borderTop: "1px solid var(--border)", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, background: "linear-gradient(135deg, rgba(79, 70, 229, 0.05) 0%, transparent 100%)", zIndex: 0 }} />
      <div style={{ maxWidth: 800, margin: "0 auto", position: "relative", zIndex: 10 }}>
        <h2 style={{ fontSize: "3rem", fontWeight: 800, color: "var(--text-main)", marginBottom: "1.5rem", letterSpacing: "-0.02em" }}>Ready to upgrade your job hunt?</h2>
        <p style={{ fontSize: "1.25rem", color: "var(--text-muted)", marginBottom: "3rem", maxWidth: 600, margin: "0 auto 3rem" }}>
          Join thousands of developers tracking their resumes like professionals. Setup takes less than 30 seconds.
        </p>
        <button onClick={login} className="btn btn-primary" style={{ padding: "1rem 2.5rem", fontSize: "1.1rem", borderRadius: "999px", boxShadow: "0 10px 15px -3px rgba(79, 70, 229, 0.3)" }}>
          <GitHubIcon /> Start Tracking for Free
        </button>
      </div>
    </section>
  );
}
