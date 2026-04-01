"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import { HomeIcon, FileTextIcon, LinkIcon, LogOutIcon } from "../components/icons/Icons";

export default function DashboardLayout({ children }) {
  const { user, loading, logout } = useAuth();
  const pathname = usePathname();

  if (loading) return (
    <div style={{ height: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ fontSize: "1.2rem", color: "var(--text-muted)", display: "flex", gap: "1rem", alignItems: "center" }}>
        <div style={{ width: 24, height: 24, borderRadius: "50%", border: "3px solid var(--primary-light)", borderTopColor: "var(--primary)", animation: "spin 1s linear infinite" }} />
        Loading your workspace...
      </div>
      <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
    </div>
  );

  if (!user) {
    // We could auto-redirect, or show standard unauthorized
    return (
      <div style={{ height: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "var(--bg-app)" }}>
        <div className="card" style={{ maxWidth: 400, textAlign: "center" }}>
          <h2 style={{ fontSize: "1.5rem", marginBottom: "1rem", color: "var(--danger-text)" }}>Access Denied</h2>
          <p style={{ color: "var(--text-muted)", marginBottom: "1.5rem" }}>You are not logged in. Please return to the home page to authenticate via GitHub.</p>
          <Link href="/" className="btn btn-primary">Go to Home</Link>
        </div>
      </div>
    );
  }

  const navItems = [
    { label: "Overview", href: "/dashboard", icon: <HomeIcon /> },
    { label: "Resumes", href: "/dashboard/resumes", icon: <FileTextIcon /> },
    { label: "Smart Links", href: "/dashboard/links", icon: <LinkIcon /> },
  ];

  return (
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: "var(--bg-app)" }}>
      {/* Sidebar */}
      <aside style={{ width: "280px", borderRight: "1px solid var(--border)", backgroundColor: "white", padding: "1.5rem 1rem", display: "flex", flexDirection: "column", position: "sticky", top: 0, height: "100vh" }}>
        <Link href="/dashboard" style={{ textDecoration: "none", marginBottom: "2.5rem", display: "flex", alignItems: "center", gap: "0.75rem", padding: "0 0.5rem" }}>
          <div style={{ width: 36, height: 36, borderRadius: "10px", background: "linear-gradient(135deg, var(--primary), #818cf8)", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.2rem", fontWeight: "bold", boxShadow: "0 4px 6px -1px rgba(79, 70, 229, 0.4)" }}>X</div>
          <span style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--text-main)", letterSpacing: "-0.02em" }}>resume<span style={{color: "var(--primary)"}}>X</span></span>
        </Link>

        {/* Navigation */}
        <nav style={{ flex: 1, display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          <div style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--text-light)", textTransform: "uppercase", letterSpacing: "0.05em", padding: "0 0.5rem", marginBottom: "0.5rem" }}>Dashboard</div>
          {navItems.map(item => {
            const isActive = pathname === item.href;
            return (
              <Link key={item.href} href={item.href} style={{
                display: "flex", alignItems: "center", gap: "0.875rem", padding: "0.75rem 1rem",
                borderRadius: "var(--radius-md)", textDecoration: "none",
                backgroundColor: isActive ? "var(--primary-light)" : "transparent",
                color: isActive ? "var(--primary)" : "var(--text-muted)",
                fontWeight: isActive ? 600 : 500,
                transition: "all 0.2s ease"
              }}>
                <span style={{ display: "flex", opacity: isActive ? 1 : 0.7 }}>{item.icon}</span>
                {item.label}
              </Link>
            )
          })}
        </nav>

        {/* User Profile bottom section */}
        <div style={{ marginTop: "auto", borderTop: "1px solid var(--border)", paddingTop: "1.5rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.875rem", padding: "0.5rem", marginBottom: "1rem" }}>
            <div style={{ width: 44, height: 44, borderRadius: "50%", background: "var(--bg-surface-hover)", border: "2px solid white", boxShadow: "var(--shadow-sm)", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
              <img src={`https://api.dicebear.com/7.x/initials/svg?seed=${user.username}`} alt="Avatar" width={44} height={44} />
            </div>
            <div style={{ overflow: "hidden" }}>
              <div style={{ fontSize: "0.95rem", fontWeight: 600, color: "var(--text-main)", whiteSpace: "nowrap", textOverflow: "ellipsis" }}>{user.name}</div>
              <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", whiteSpace: "nowrap", textOverflow: "ellipsis" }}>@{user.username}</div>
            </div>
          </div>
          <button onClick={logout} className="btn" style={{ width: "100%", backgroundColor: "var(--bg-app)", color: "var(--text-muted)", justifyContent: "center", padding: "0.75rem", border: "1px solid var(--border)", transition: "all 0.2s" }} onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#fef2f2'; e.currentTarget.style.color = '#ef4444'; e.currentTarget.style.borderColor = '#fca5a5'; }} onMouseOut={(e) => { e.currentTarget.style.backgroundColor = 'var(--bg-app)'; e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.borderColor = 'var(--border)'; }}>
            <LogOutIcon />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Pane */}
      <main style={{ flex: 1, padding: "3rem 4rem", overflowY: "auto", position: "relative" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          {children}
        </div>
      </main>
    </div>
  );
}
