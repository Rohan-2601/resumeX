"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { ActivityIcon, EyeIcon } from "../components/icons/Icons";

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

export default function DashboardOverview() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) return;

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
  }, [user]);

  if (loading) return (
    <div className="flex items-center justify-center h-full">
      <div style={{ width: 24, height: 24, borderRadius: "50%", border: "3px solid var(--border)", borderTopColor: "var(--primary)", animation: "spin 1s linear infinite" }} />
    </div>
  );
  
  if (error) return <div className="card text-danger">{error}</div>;

  // Handle Empty State
  if (!data || data.totalViews === 0) {
    return (
      <div className="flex justify-center mt-6">
        <div className="card w-full" style={{ textAlign: "center", padding: "4rem 2rem", background: "white" }}>
          <div style={{ width: 64, height: 64, borderRadius: "50%", background: "var(--primary-light)", color: "var(--primary)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1.5rem" }}>
            <ActivityIcon />
          </div>
          <h2 style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>No activity yet!</h2>
          <p style={{ color: "var(--text-muted)", marginBottom: "2rem", maxWidth: 400, margin: "0 auto 2rem" }}>
            Your analytics dashboard will light up once you upload a resume and share your first Smart Link.
          </p>
        </div>
      </div>
    );
  }

  // Extract counts for common sources safely
  const getSourceCount = (sourceName) => {
    const found = data.sources.find(s => s.source.toLowerCase() === sourceName.toLowerCase());
    return found ? found.count : 0;
  };

  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 style={{ fontSize: "2rem", letterSpacing: "-0.02em", marginBottom: "0.25rem" }}>Overview</h1>
          <p style={{ color: "var(--text-muted)" }}>Welcome back, {user.name.split(" ")[0]}. Here's what's happening today.</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="card" style={{ padding: "1.25rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem", color: "var(--text-muted)" }}>
            <span style={{ fontSize: "0.875rem", fontWeight: 600 }}>Total Views</span>
            <EyeIcon />
          </div>
          <div style={{ fontSize: "2.5rem", fontWeight: 800, color: "var(--text-main)", lineHeight: 1 }}>{data.totalViews}</div>
          <div style={{ fontSize: "0.75rem", color: "var(--success-text)", marginTop: "0.5rem", display: "flex", gap: "0.25rem", alignItems: "center" }}>
             Lifetime impressions
          </div>
        </div>

        <div className="card" style={{ padding: "1.25rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem", color: "var(--text-muted)" }}>
            <span style={{ fontSize: "0.875rem", fontWeight: 600 }}>LinkedIn</span>
          </div>
          <div style={{ fontSize: "2.5rem", fontWeight: 800, color: "var(--text-main)", lineHeight: 1 }}>{getSourceCount("LinkedIn")}</div>
        </div>

        <div className="card" style={{ padding: "1.25rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem", color: "var(--text-muted)" }}>
            <span style={{ fontSize: "0.875rem", fontWeight: 600 }}>GitHub</span>
          </div>
          <div style={{ fontSize: "2.5rem", fontWeight: 800, color: "var(--text-main)", lineHeight: 1 }}>{getSourceCount("GitHub")}</div>
        </div>

        <div className="card" style={{ padding: "1.25rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem", color: "var(--text-muted)" }}>
            <span style={{ fontSize: "0.875rem", fontWeight: 600 }}>Direct URL</span>
          </div>
          <div style={{ fontSize: "2.5rem", fontWeight: 800, color: "var(--text-main)", lineHeight: 1 }}>{getSourceCount("Direct")}</div>
        </div>
      </div>

      {/* Recent Activity Section */}
      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        <div style={{ padding: "1.25rem 1.5rem", borderBottom: "1px solid var(--border)", background: "white" }}>
          <h2 style={{ fontSize: "1.1rem", fontWeight: 600 }}>Recent Activity Tracker</h2>
        </div>
        
        {data.recentViews && data.recentViews.length > 0 ? (
          <div className="table-container" style={{ border: "none", borderRadius: 0 }}>
            <table>
              <thead>
                <tr>
                  <th>Event Details</th>
                  <th>Source Map</th>
                  <th>Target Link</th>
                  <th>Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {data.recentViews.map((view, idx) => (
                  <tr key={view._id || idx}>
                    <td style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                      <div style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--primary)" }} />
                      <span style={{ fontWeight: 500, color: "var(--text-main)" }}>Resume Viewed</span>
                    </td>
                    <td>
                      <span className="badge badge-neutral bg-surface-hover" style={{ color: "var(--text-main)", border: "1px solid var(--border)" }}>{view.source}</span>
                    </td>
                    <td>
                      <span style={{ fontFamily: "monospace", color: "var(--text-muted)", fontSize: "0.85rem" }}>/{user.username}/{view.slug === "default" ? "" : view.slug}</span>
                    </td>
                    <td style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>
                      {timeAgo(view.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-6 text-center" style={{ color: "var(--text-muted)" }}>No recent activity to show.</div>
        )}
      </div>

    </div>
  );
}
