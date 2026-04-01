"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import CreateLink from "../components/CreateLink";

// Simple time ago formatter
function timeAgo(dateString) {
  if (!dateString) return "";
  const now = new Date();
  const past = new Date(dateString);
  const diffInSeconds = Math.floor((now - past) / 1000);

  if (diffInSeconds < 60) return `${diffInSeconds} sec ago`;
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes} min ago`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours} hrs ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  return `${diffInDays} days ago`;
}

export default function Dashboard() {
  const { user, loading: authLoading } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setLoading(false);
      return;
    }

    const fetchAnalytics = async () => {
      try {
        const token = localStorage.getItem("token");
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
        
        const res = await axios.get(`${backendUrl}/api/analytics`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        setData(res.data);
      } catch (err) {
        console.error(err);
        setError(err.response?.data?.message || "Failed to load analytics");
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [user, authLoading]);

  // Handle Auth State
  if (authLoading) return <div style={{ padding: "2rem" }}>Checking authentication...</div>;
  if (!user) return <div style={{ padding: "2rem", color: "red" }}>Please login to view dashboard.</div>;

  // Handle Loading & Error States
  if (loading) return <div style={{ padding: "2rem" }}>Loading analytics...</div>;
  if (error) return <div style={{ padding: "2rem", color: "red" }}>{error}</div>;

  // Handle Empty State
  if (!data || data.totalViews === 0) {
    return (
      <div style={{ padding: "2rem", fontFamily: "sans-serif" }}>
        <h1>Analytics Dashboard</h1>
        <p>No views yet! Share your resume link to get started.</p>
      </div>
    );
  }

  // Extract counts for common sources safely
  const getSourceCount = (sourceName) => {
    const found = data.sources.find(s => s.source.toLowerCase() === sourceName.toLowerCase());
    return found ? found.count : 0;
  };

  const cardStyle = {
    border: "1px solid #e2e8f0",
    borderRadius: "8px",
    padding: "1.5rem",
    minWidth: "150px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f8fafc",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
  };

  const labelStyle = { fontSize: "0.9rem", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.5rem" };
  const valueStyle = { fontSize: "2rem", fontWeight: "bold", color: "#0f172a", margin: 0 };

  return (
    <main style={{ padding: "2rem", fontFamily: "sans-serif", maxWidth: "900px", margin: "0 auto" }}>
      <h1 style={{ color: "#1e293b", marginBottom: "2rem" }}>Resume Analytics Dashboard</h1>

      {/* Stats Section */}
      <section style={{ marginBottom: "3rem" }}>
        <h2 style={{ fontSize: "1.2rem", color: "#334155", marginBottom: "1rem" }}>Traffic Overview</h2>
        <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
          
          <div style={cardStyle}>
            <span style={labelStyle}>Total Views</span>
            <span style={valueStyle}>{data.totalViews}</span>
          </div>

          <div style={cardStyle}>
            <span style={labelStyle}>LinkedIn</span>
            <span style={valueStyle}>{getSourceCount("LinkedIn")}</span>
          </div>

          <div style={cardStyle}>
            <span style={labelStyle}>GitHub</span>
            <span style={valueStyle}>{getSourceCount("GitHub")}</span>
          </div>

          <div style={cardStyle}>
            <span style={labelStyle}>Direct</span>
            <span style={valueStyle}>{getSourceCount("Direct")}</span>
          </div>

        </div>
      </section>

      <section style={{ marginBottom: "3rem" }}>
        <CreateLink />
      </section>

      {/* Recent Activity Section */}
      <section>
        <h2 style={{ fontSize: "1.2rem", color: "#334155", marginBottom: "1rem" }}>Recent Activity</h2>
        
        {data.recentViews && data.recentViews.length > 0 ? (
          <ul style={{ listStyle: "none", padding: 0, border: "1px solid #e2e8f0", borderRadius: "8px", overflow: "hidden" }}>
            {data.recentViews.map((view, idx) => (
              <li 
                key={view._id || idx} 
                style={{ 
                  padding: "1rem 1.5rem", 
                  backgroundColor: idx % 2 === 0 ? "#ffffff" : "#f8fafc",
                  borderBottom: idx !== data.recentViews.length - 1 ? "1px solid #e2e8f0" : "none",
                  display: "flex",
                  alignItems: "center"
                }}
              >
                <div style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#3b82f6", marginRight: "1rem" }}></div>
                <span style={{ color: "#334155", fontWeight: 500 }}>
                  Viewed from {view.source}
                </span>
                <span style={{ color: "#94a3b8", marginLeft: "auto", fontSize: "0.9rem" }}>
                  {timeAgo(view.createdAt)}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p style={{ color: "#64748b" }}>No recent activity to show.</p>
        )}
      </section>

    </main>
  );
}
