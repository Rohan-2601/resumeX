"use client";

import { useAuth } from "./context/AuthContext";
import { GitHubIcon } from "./components/icons/Icons";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LandingPage() {
  const { user, loading, login } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user && !loading) {
      router.push("/dashboard");
    }
  }, [user, loading, router]);

  if (loading) return (
    <div style={{ height: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg-app)" }}>
      <div style={{ width: 24, height: 24, borderRadius: "50%", border: "3px solid var(--border)", borderTopColor: "var(--primary)", animation: "spin 1s linear infinite" }} />
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "var(--bg-app)", overflow: "hidden" }}>
      {/* Navbar */}
      <nav style={{ padding: "1.25rem 2.5rem", display: "flex", justifyContent: "space-between", alignItems: "center", position: "relative", zIndex: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <div style={{ width: 36, height: 36, borderRadius: "10px", background: "linear-gradient(135deg, var(--primary), #818cf8)", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.2rem", fontWeight: "bold", boxShadow: "0 4px 6px -1px rgba(79, 70, 229, 0.4)" }}>X</div>
          <span style={{ fontSize: "1.5rem", fontWeight: 800, letterSpacing: "-0.02em" }}>resume<span style={{color: "var(--primary)"}}>X</span></span>
        </div>
        <div>
          <button onClick={login} className="btn" style={{ display: "flex", gap: "0.5rem", backgroundColor: "white", border: "1px solid var(--border)", color: "var(--text-main)", padding: "0.5rem 1.25rem", borderRadius: "99px", fontWeight: 600, boxShadow: "var(--shadow-sm)" }}>
            <GitHubIcon /> Sign In
          </button>
        </div>
      </nav>

      {/* Hero Content */}
      <main style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "6rem 2rem", textAlign: "center", position: "relative" }}>
        {/* Background Gradients */}
        <div style={{ position: "absolute", top: "-10%", left: "50%", transform: "translateX(-50%)", width: "100vw", height: "800px", background: "radial-gradient(circle at center, rgba(79, 70, 229, 0.08) 0%, transparent 70%)", zIndex: 0, pointerEvents: "none" }} />
        
        <div style={{ maxWidth: 850, position: "relative", zIndex: 10 }}>
          <div className="badge badge-primary" style={{ marginBottom: "2rem", padding: "0.5rem 1rem", fontSize: "0.875rem", background: "white", border: "1px solid var(--primary-light)", boxShadow: "0 2px 10px rgba(79,70,229,0.1)" }}>
            ✨ Version Control for your Resumes
          </div>
          
          <h1 style={{ fontSize: "4.5rem", fontWeight: 800, letterSpacing: "-0.03em", color: "var(--text-main)", marginBottom: "1.5rem", lineHeight: 1.05 }}>
            Manage your resumes like <span style={{ color: "var(--primary)", background: "linear-gradient(135deg, var(--primary), #818cf8)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>code commits</span>.
          </h1>
          
          <p style={{ fontSize: "1.35rem", color: "var(--text-muted)", marginBottom: "3rem", lineHeight: 1.6, maxWidth: 650, margin: "0 auto 3rem" }}>
            Upload infinite versions of your resume, generate traceable smart links for different recruiters, and track analytics intelligently.
          </p>
          
          <div style={{ display: "flex", gap: "1rem", justifyContent: "center" }}>
            <button onClick={login} className="btn btn-primary" style={{ padding: "1rem 2.5rem", fontSize: "1.1rem", borderRadius: "999px", boxShadow: "0 10px 15px -3px rgba(79, 70, 229, 0.3), 0 4px 6px -2px rgba(79, 70, 229, 0.1)", transition: "all 0.3s" }} onMouseOver={(e) => e.currentTarget.style.transform = "translateY(-2px)"} onMouseOut={(e) => e.currentTarget.style.transform = "translateY(0)"}>
              <GitHubIcon /> Get Started with GitHub
            </button>
            <a href="https://github.com/Rohan-2601/resumeX" target="_blank" rel="noopener noreferrer" className="btn btn-outline" style={{ padding: "1rem 2rem", fontSize: "1.1rem", borderRadius: "999px", backgroundColor: "white" }}>
              View Documentation
            </a>
          </div>
        </div>

        {/* Dashboard Mockup Image or UI Elements (Abstracted for visual flare) */}
        <div style={{ marginTop: "5rem", width: "100%", maxWidth: 1000, height: 400, background: "white", borderRadius: "16px 16px 0 0", border: "1px solid var(--border)", borderBottom: "none", boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)", padding: "1.5rem", position: "relative", zIndex: 10 }}>
          <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.5rem" }}>
            <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#ef4444" }}/>
            <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#eab308" }}/>
            <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#22c55e" }}/>
          </div>
          <div className="grid grid-cols-4 gap-4 mb-4">
             <div style={{ height: 100, background: "var(--bg-surface-hover)", borderRadius: "8px" }} />
             <div style={{ height: 100, background: "var(--bg-surface-hover)", borderRadius: "8px" }} />
             <div style={{ height: 100, background: "var(--bg-surface-hover)", borderRadius: "8px" }} />
             <div style={{ height: 100, background: "var(--bg-surface-hover)", borderRadius: "8px" }} />
          </div>
          <div style={{ height: 180, background: "var(--bg-surface-hover)", borderRadius: "8px" }} />
        </div>
      </main>
    </div>
  );
}
