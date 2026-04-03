"use client";

import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import { Playfair_Display, Sora } from "next/font/google";
import {
  ActivityIcon,
  EyeIcon,
  HistoryIcon,
  Link2Icon,
} from "../../components/icons/Icons";

const displayFont = Playfair_Display({
  subsets: ["latin"],
  style: ["italic"],
  weight: ["500", "600"],
});

const sansFont = Sora({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const backendUrl =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

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

export default function AnalyticsPage() {
  const { user } = useAuth();

  const [analytics, setAnalytics] = useState(null);
  const [resumeTitle, setResumeTitle] = useState("My Resume");
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const publicLink = useMemo(() => {
    if (!user) return "";
    if (typeof window === "undefined") return `/${user.username}`;
    return `${window.location.origin}/${user.username}`;
  }, [user]);

  const sourceMap = (sourceName) => {
    const found = analytics?.sources?.find(
      (source) => source.source.toLowerCase() === sourceName.toLowerCase(),
    );
    return found ? found.count : 0;
  };

  const topSource = useMemo(() => {
    const sources = analytics?.sources || [];
    if (sources.length === 0) return "No source data yet";
    return [...sources].sort((a, b) => b.count - a.count)[0];
  }, [analytics]);

  const loadAnalytics = async () => {
    if (!user) return;

    setLoading(true);
    setErrorMessage("");

    try {
      const resumeRes = await axios.get(
        `${backendUrl}/api/resume/${user.username}`,
      );
      const resume = resumeRes.data.resume;
      setResumeTitle(resume.title || "My Resume");

      const token = localStorage.getItem("token");
      if (!token) {
        setAnalytics(null);
        setErrorMessage("Sign in to view analytics.");
        return;
      }

      const analyticsRes = await axios.get(`${backendUrl}/api/analytics`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAnalytics(analyticsRes.data);
    } catch (error) {
      if (error.response?.status === 404) {
        setAnalytics(null);
        setErrorMessage("No analytics available yet. Upload a resume first.");
      } else {
        console.error(error);
        setAnalytics(null);
        setErrorMessage("Unable to load analytics right now.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, [user]);

  if (!user) return null;

  return (
    <div
      className={`${sansFont.className} relative space-y-8 pb-8 text-[#1f1b16]`}
    >
      <div className="pointer-events-none absolute -top-24 left-10 h-72 w-72 rounded-full bg-white/50 blur-3xl" />
      <div className="pointer-events-none absolute right-4 top-24 h-96 w-96 rounded-full bg-[#d7c0a0]/35 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-[#f0e2c9]/50 blur-3xl" />

      <header className="relative overflow-hidden rounded-[2rem] border border-black/10 bg-[linear-gradient(135deg,rgba(248,242,231,0.96)_0%,rgba(238,228,211,0.96)_52%,rgba(232,219,193,0.96)_100%)] p-7 shadow-[0_24px_80px_-50px_rgba(0,0,0,0.55)] sm:p-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.6),transparent_35%),radial-gradient(circle_at_bottom_left,rgba(123,90,61,0.12),transparent_30%)]" />
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-[#7b5a3d]">
              Dashboard / Analytics
            </p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-[#211911] sm:text-5xl">
              Resume performance, without the clutter.
              <span
                className={`${displayFont.className} mt-2 block text-lg font-medium italic text-[#7b5a3d] sm:text-xl`}
              >
                See where your link is being opened and what is working best.
              </span>
            </h1>
          </div>

          <div className="flex flex-col gap-3 rounded-3xl border border-black/10 bg-[linear-gradient(180deg,rgba(251,247,238,0.9)_0%,rgba(242,233,218,0.84)_100%)] p-4 shadow-[0_20px_60px_-44px_rgba(0,0,0,0.55)] backdrop-blur-md sm:min-w-[320px]">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#7b5a3d]">
                Permanent Public Link
              </p>
              <div className="mt-2 flex items-center gap-2 rounded-2xl border border-black/10 bg-white/65 px-3 py-2 text-sm text-[#1f1b16]">
                <code className="min-w-0 flex-1 truncate">{publicLink}</code>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-center text-[#1f1b16]">
              <div className="rounded-2xl border border-black/10 bg-white/55 px-3 py-3">
                <p className="text-[11px] uppercase tracking-[0.24em] text-[#7b5a3d]">
                  Total
                </p>
                <p className="mt-1 text-xl font-semibold">
                  {loading || !analytics ? "..." : analytics.totalViews}
                </p>
              </div>
              <div className="rounded-2xl border border-black/10 bg-white/55 px-3 py-3">
                <p className="text-[11px] uppercase tracking-[0.24em] text-[#7b5a3d]">
                  Top source
                </p>
                <p className="mt-1 truncate text-sm font-semibold">
                  {loading ? "..." : topSource?.source || "None"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <section className="rounded-[1.75rem] border border-black/10 bg-[linear-gradient(180deg,rgba(251,247,238,0.95)_0%,rgba(242,233,218,0.9)_100%)] p-6 shadow-[0_20px_60px_-42px_rgba(0,0,0,0.42)] sm:p-8">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#7b5a3d]">
              Breakdown
            </p>
            <h2 className="mt-1 text-2xl font-semibold text-[#211911]">
              Where views are coming from
            </h2>
          </div>
          <div className="text-sm text-[#5f5144]">
            {loading
              ? "Refreshing analytics..."
              : `${analytics?.totalViews || 0} total views`}
          </div>
        </div>

        {loading ? (
          <div className="rounded-2xl border border-black/10 bg-white/60 p-6 text-sm text-[#5f5144]">
            Loading analytics...
          </div>
        ) : errorMessage ? (
          <div className="rounded-2xl border border-black/10 bg-white/60 p-6 text-sm text-[#5f5144]">
            {errorMessage}
          </div>
        ) : analytics ? (
          <>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="rounded-2xl border border-black/10 bg-white/65 p-5">
                <div className="flex items-center justify-between text-[#5f5144]">
                  <span className="text-sm font-semibold">LinkedIn</span>
                  <Link2Icon />
                </div>
                <p className="mt-4 text-3xl font-semibold text-[#211911]">
                  {sourceMap("LinkedIn")}
                </p>
              </div>

              <div className="rounded-2xl border border-black/10 bg-white/65 p-5">
                <div className="flex items-center justify-between text-[#5f5144]">
                  <span className="text-sm font-semibold">GitHub</span>
                  <HistoryIcon />
                </div>
                <p className="mt-4 text-3xl font-semibold text-[#211911]">
                  {sourceMap("GitHub")}
                </p>
              </div>

              <div className="rounded-2xl border border-black/10 bg-white/65 p-5">
                <div className="flex items-center justify-between text-[#5f5144]">
                  <span className="text-sm font-semibold">Direct</span>
                  <ActivityIcon />
                </div>
                <p className="mt-4 text-3xl font-semibold text-[#211911]">
                  {sourceMap("Direct")}
                </p>
              </div>
            </div>

            <div className="mt-6 overflow-hidden rounded-2xl border border-black/10 bg-white/60">
              <div className="border-b border-black/10 px-5 py-4">
                <h3 className="text-sm font-semibold uppercase tracking-[0.24em] text-[#7b5a3d]">
                  Recent Activity
                </h3>
              </div>

              {analytics.recentViews?.length > 0 ? (
                <div className="overflow-x-auto">
                  <table>
                    <thead>
                      <tr>
                        <th>Event</th>
                        <th>Source</th>
                        <th>Target Link</th>
                        <th>Time</th>
                      </tr>
                    </thead>
                    <tbody>
                      {analytics.recentViews.map((view, index) => {
                        const targetPath = `/${user.username}${view.slug && view.slug !== "default" ? `/${view.slug}` : ""}`;
                        return (
                          <tr key={view._id || index}>
                            <td>
                              <div className="flex items-center gap-3">
                                <div className="h-2 w-2 rounded-full bg-[#8a6340]" />
                                <span className="font-semibold text-[#211911]">
                                  Resume Viewed
                                </span>
                              </div>
                            </td>
                            <td>
                              <span className="badge badge-neutral border border-black/10 bg-white/70 text-[#5f5144]">
                                {view.source}
                              </span>
                            </td>
                            <td>
                              <span className="font-mono text-sm text-[#5f5144]">
                                {targetPath}
                              </span>
                            </td>
                            <td className="text-sm text-[#5f5144]">
                              {timeAgo(view.createdAt)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-6 text-sm text-[#5f5144]">
                  No recent activity yet.
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="rounded-2xl border border-black/10 bg-white/60 p-6 text-sm text-[#5f5144]">
            No analytics available yet.
          </div>
        )}
      </section>
    </div>
  );
}
