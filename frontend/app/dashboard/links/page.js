"use client";
import CreateLink from "../../components/CreateLink";

export default function LinksPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 style={{ fontSize: "2rem", letterSpacing: "-0.02em", marginBottom: "0.25rem", color: "var(--text-main)" }}>Smart Links Engine</h1>
        <p style={{ color: "var(--text-muted)" }}>Generate unique tracked links securely tied to specific resume commits.</p>
      </div>

      <div>
        <CreateLink />
      </div>
    </div>
  );
}
