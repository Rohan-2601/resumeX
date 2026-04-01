"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

export default function CreateLink() {
  const { user } = useAuth();
  const [versions, setVersions] = useState([]);
  const [links, setLinks] = useState([]);
  const [resumeId, setResumeId] = useState(null);
  
  const [selectedVersion, setSelectedVersion] = useState("");
  const [slug, setSlug] = useState("");
  const [label, setLabel] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

  const fetchVersionsAndLinks = async () => {
    if (!user) return;
    try {
      const token = localStorage.getItem("token");

      // 1. Get Resume ID
      const resumeRes = await axios.get(`${backendUrl}/api/resume/${user.username}`);
      const rId = resumeRes.data.resume._id;
      setResumeId(rId);

      // 2. Fetch Versions
      const versionsRes = await axios.get(`${backendUrl}/api/resume/${rId}/versions`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setVersions(versionsRes.data.versions);
      if (versionsRes.data.versions.length > 0) {
        setSelectedVersion(versionsRes.data.versions[0]._id);
      }

      // 3. Fetch Existing Links
      const linksRes = await axios.get(`${backendUrl}/api/link`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setLinks(linksRes.data.links);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchVersionsAndLinks();
  }, [user]);

  const handleCreate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");

    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `${backendUrl}/api/link`,
        {
          resumeId,
          versionId: selectedVersion,
          slug,
          label
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setMessage("Link created successfully!");
      setSlug("");
      setLabel("");
      fetchVersionsAndLinks(); // refresh list
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create link");
    } finally {
      setLoading(false);
    }
  };

  if (!user || !resumeId) return null;

  return (
    <div className="card" style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      <h2 style={{ marginTop: 0, color: "#1e293b", fontSize: "1.2rem" }}>Smart Resume Links</h2>
      <p style={{ color: "#64748b", fontSize: "0.9rem", marginBottom: "1.5rem" }}>Create custom, trackable URLs for specific resume versions.</p>
      
      {/* Create Form */}
      <form onSubmit={handleCreate} style={{ display: "flex", flexDirection: "column", gap: "1rem", marginBottom: "2rem" }}>
        <div>
          <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "bold", marginBottom: "0.5rem" }}>Select Resume Version</label>
          <select 
            value={selectedVersion} 
            onChange={(e) => setSelectedVersion(e.target.value)}
            style={{ width: "100%", padding: "0.5rem", borderRadius: "4px", border: "1px solid #cbd5e1" }}
          >
            <option value="">Always point to Latest Auto-Version</option>
            {versions.map(v => (
              <option key={v._id} value={v._id}>
                Fixed on Version {v.versionNumber} (Uploaded: {new Date(v.createdAt).toLocaleDateString()})
              </option>
            ))}
          </select>
        </div>

        <div style={{ display: "flex", gap: "1rem" }}>
          <div style={{ flex: 1 }}>
            <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "bold", marginBottom: "0.5rem" }}>Custom Slug (e.g. google-sde)</label>
            <div style={{ display: "flex", alignItems: "center" }}>
              <span style={{ padding: "0.5rem", backgroundColor: "#f1f5f9", border: "1px solid #cbd5e1", borderRight: "none", borderRadius: "4px 0 0 4px", color: "#64748b" }}>
                /{user.username}/
              </span>
              <input 
                type="text" 
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="frontend-startup"
                style={{ flex: 1, padding: "0.5rem", borderRadius: "0 4px 4px 0", border: "1px solid #cbd5e1" }}
                required
              />
            </div>
          </div>
          
          <div style={{ flex: 1 }}>
            <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "bold", marginBottom: "0.5rem" }}>Internal Label (Optional)</label>
            <input 
              type="text" 
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="e.g. Sent to Google HR"
              style={{ width: "100%", padding: "0.5rem", borderRadius: "4px", border: "1px solid #cbd5e1", boxSizing: "border-box" }}
            />
          </div>
        </div>

        <button 
          type="submit" 
          disabled={loading || !slug}
          style={{ padding: "0.75rem", backgroundColor: "#2563eb", color: "white", border: "none", borderRadius: "4px", fontWeight: "bold", cursor: loading ? "not-allowed" : "pointer" }}
        >
          {loading ? "Creating..." : "Generate Shareable Link"}
        </button>
        
        {message && <p style={{ color: "green", margin: 0, fontSize: "0.9rem" }}>{message}</p>}
        {error && <p style={{ color: "red", margin: 0, fontSize: "0.9rem" }}>{error}</p>}
      </form>

      {/* Links List */}
      {links.length > 0 && (
        <div>
          <h3 style={{ fontSize: "1rem", color: "#334155", marginBottom: "1rem", borderTop: "1px solid #e2e8f0", paddingTop: "1rem" }}>Your Active Links</h3>
          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {links.map(link => {
              const url = `${window.location.origin}/${user.username}/${link.slug}`;
              const ver = versions.find(v => v._id === link.versionId);
              return (
                <li key={link._id} style={{ padding: "1rem", backgroundColor: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "6px", marginBottom: "0.5rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div>
                      <a href={url} target="_blank" rel="noopener noreferrer" style={{ color: "#2563eb", fontWeight: "bold", textDecoration: "none", fontSize: "1.1rem" }}>
                        /{user.username}/{link.slug}
                      </a>
                      <div style={{ color: "#64748b", fontSize: "0.85rem", marginTop: "0.25rem" }}>
                        Target: Version {ver ? ver.versionNumber : "?"} {link.label && `• Label: ${link.label}`}
                      </div>
                    </div>
                    <button 
                      onClick={() => navigator.clipboard.writeText(url)}
                      style={{ padding: "0.25rem 0.5rem", fontSize: "0.8rem", cursor: "pointer", borderRadius: "4px", border: "1px solid #cbd5e1" }}
                    >
                      Copy URI
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
