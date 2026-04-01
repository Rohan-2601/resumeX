import { GitHubIcon } from "../icons/Icons";

export default function Footer() {
  return (
    <footer style={{ background: "white", padding: "4rem 2rem", borderTop: "1px solid var(--border)", position: "relative", zIndex: 15 }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "2rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <div style={{ width: 32, height: 32, borderRadius: "8px", background: "var(--primary)", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1rem", fontWeight: "bold" }}>X</div>
          <span style={{ fontSize: "1.25rem", fontWeight: 700, letterSpacing: "-0.02em" }}>resume<span style={{color: "var(--primary)"}}>X</span></span>
        </div>
        <div style={{ display: "flex", gap: "2rem", color: "var(--text-muted)", fontSize: "0.875rem", fontWeight: 500 }}>
          <a href="#" style={{ color: "var(--text-muted)", textDecoration: "none" }}>Product</a>
          <a href="#" style={{ color: "var(--text-muted)", textDecoration: "none" }}>Privacy</a>
          <a href="#" style={{ color: "var(--text-muted)", textDecoration: "none" }}>Terms</a>
        </div>
        <div>
          <a href="https://github.com/Rohan-2601/resumeX" target="_blank" rel="noopener noreferrer" style={{ color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "0.5rem", textDecoration: "none", fontWeight: 600 }}>
            <GitHubIcon /> Open Source
          </a>
        </div>
      </div>
      <div style={{ maxWidth: 1200, margin: "2rem auto 0", paddingTop: "2rem", borderTop: "1px solid var(--border)", textAlign: "center", color: "var(--text-light)", fontSize: "0.875rem" }}>
        © {new Date().getFullYear()} resumeX. All rights reserved. Built for developers.
      </div>
    </footer>
  );
}
