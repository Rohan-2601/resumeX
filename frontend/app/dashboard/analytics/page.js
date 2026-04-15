"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import { Playfair_Display, Sora } from "next/font/google";
import { IoIosArrowBack } from "react-icons/io";
import {
  ActivityIcon,
  EyeIcon,
  HistoryIcon,
  Link2Icon,
} from "../../components/icons/Icons";
import { Alert, AlertDescription } from "@/components/ui/alert";

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
  const [resumeSlug, setResumeSlug] = useState("");
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [copyMessage, setCopyMessage] = useState("");

  const publicLink = useMemo(() => {
    if (!user) return "";
    if (typeof window === "undefined") {
      return resumeSlug
        ? `/${user.username}/${resumeSlug}`
        : `/${user.username}`;
    }
    return resumeSlug
      ? `${window.location.origin}/${user.username}/${resumeSlug}`
      : `${window.location.origin}/${user.username}`;
  }, [resumeSlug, user]);

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

  const copyPublicLink = async () => {
    if (!publicLink) return;

    try {
      await navigator.clipboard.writeText(publicLink);
      setCopyMessage("Copied");
      window.setTimeout(() => setCopyMessage(""), 1800);
    } catch (error) {
      console.error(error);
      setCopyMessage("Copy failed");
      window.setTimeout(() => setCopyMessage(""), 1800);
    }
  };

  const loadAnalytics = async () => {
    if (!user) return;

    setLoading(true);
    setErrorMessage("");

    try {
      const token = localStorage.getItem("token");
      const resumeRes = await axios.get(`${backendUrl}/api/resume/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const resume = resumeRes.data.resumes?.[0] || null;
      if (!resume) {
        setResumeTitle("My Resume");
        setResumeSlug("");
        setAnalytics(null);
        setErrorMessage("No analytics available yet. Upload a resume first.");
        return;
      }
      setResumeTitle(resume.title || "My Resume");
      setResumeSlug(resume.slug || "");

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
      className={`${sansFont.className} relative space-y-6 pb-8 text-[#1f1b16]`}
    >
      <div className="pointer-events-none absolute -top-24 left-10 h-72 w-72 rounded-full bg-white/50 blur-3xl" />
      <div className="pointer-events-none absolute right-4 top-24 h-96 w-96 rounded-full bg-[#d7c0a0]/35 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-[#f0e2c9]/50 blur-3xl" />

      <header className="border-b border-black/10 pb-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2">
              <Link
                href="/dashboard"
                aria-label="Back to dashboard"
                className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-black/10 bg-transparent text-[#5f5144] transition hover:bg-black/5"
              >
                <IoIosArrowBack className="h-4 w-4" />
              </Link>
              <p className="text-xs font-semibold uppercase tracking-[0.32em] text-[#7b5a3d]">
                Dashboard / Analytics
              </p>
            </div>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight text-[#211911] sm:text-4xl">
              Resume performance, without the clutter.
              <span
                className={`${displayFont.className} mt-1 block text-base font-medium italic text-[#7b5a3d] sm:text-lg`}
              >
                See where your link is being opened and what is working best.
              </span>
            </h1>
          </div>
        </div>
      </header>

      <section className="space-y-3">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#7b5a3d]">
              Breakdown
            </p>
            <h2 className="mt-1 text-xl font-semibold text-[#211911]">
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
          <div className="flex min-h-[220px] items-center justify-center">
            <div className="flex items-center gap-3 rounded-full border border-black/10 bg-[linear-gradient(180deg,rgba(251,247,238,0.92)_0%,rgba(242,233,218,0.9)_100%)] px-5 py-3 text-sm font-medium text-[#5f5144] shadow-[0_20px_60px_-40px_rgba(0,0,0,0.5)]">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#d7c6aa] border-t-[#7b5a3d]" />
              Loading analytics...
            </div>
          </div>
        ) : errorMessage ? (
          <Alert
            variant="destructive"
            className="rounded-xl border-rose-900/20 bg-rose-50 text-rose-700"
          >
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        ) : analytics ? (
          <>
            <div className="grid grid-cols-1 gap-2.5 md:grid-cols-3">
              <div className="rounded-xl border border-black/10 bg-white/72 px-4 py-3">
                <div className="flex items-center justify-between text-[#5f5144]">
                  <span className="text-xs font-semibold uppercase tracking-[0.12em]">
                    LinkedIn
                  </span>
                  <Link2Icon />
                </div>
                <p className="mt-2 text-2xl font-semibold text-[#211911]">
                  {sourceMap("LinkedIn")}
                </p>
              </div>

              <div className="rounded-xl border border-black/10 bg-white/72 px-4 py-3">
                <div className="flex items-center justify-between text-[#5f5144]">
                  <span className="text-xs font-semibold uppercase tracking-[0.12em]">
                    GitHub
                  </span>
                  <HistoryIcon />
                </div>
                <p className="mt-2 text-2xl font-semibold text-[#211911]">
                  {sourceMap("GitHub")}
                </p>
              </div>

              <div className="rounded-xl border border-black/10 bg-white/72 px-4 py-3">
                <div className="flex items-center justify-between text-[#5f5144]">
                  <span className="text-xs font-semibold uppercase tracking-[0.12em]">
                    Direct
                  </span>
                  <ActivityIcon />
                </div>
                <p className="mt-2 text-2xl font-semibold text-[#211911]">
                  {sourceMap("Direct")}
                </p>
              </div>
            </div>

            <div className="mt-2 overflow-hidden rounded-xl border border-black/10 bg-white/70">
              <div className="border-b border-black/10 px-5 py-4">
                <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-[#7b5a3d]">
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
                        <th>Link</th>
                        <th>Time</th>
                      </tr>
                    </thead>
                    <tbody>
                      {analytics.recentViews.map((view, index) => {
                        const targetPath = view.slug
                          ? `/${user.username}/${view.slug}`
                          : `/${user.username}`;
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
          <Alert className="rounded-xl border-black/10 bg-white/70 text-[#5f5144]">
            <AlertDescription>No analytics available yet.</AlertDescription>
          </Alert>
        )}
      </section>
    </div>
  );
}
