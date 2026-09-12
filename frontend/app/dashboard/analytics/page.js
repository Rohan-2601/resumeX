"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";

import { IoIosArrowBack } from "react-icons/io";
import {
  ActivityIcon,
  EyeIcon,
  HistoryIcon,
  Link2Icon,
} from "../../components/icons/Icons";
import { motion, AnimatePresence } from "framer-motion";
import { Alert, AlertDescription } from "@/components/ui/alert";





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

  const loadAnalytics = async (showLoading = true) => {
    if (!user) return;

    if (showLoading) setLoading(true);
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
    let isCurrent = true;

    const fetchInitial = async () => {
      if (!user) return;

      try {
        const token = localStorage.getItem("token");
        const resumeRes = await axios.get(`${backendUrl}/api/resume/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const resume = resumeRes.data.resumes?.[0] || null;
        if (!resume) {
          if (isCurrent) {
            setResumeTitle("My Resume");
            setResumeSlug("");
            setAnalytics(null);
            setErrorMessage("No analytics available yet. Upload a resume first.");
          }
          return;
        }
        if (isCurrent) {
          setResumeTitle(resume.title || "My Resume");
          setResumeSlug(resume.slug || "");
        }

        if (!token) {
          if (isCurrent) {
            setAnalytics(null);
            setErrorMessage("Sign in to view analytics.");
          }
          return;
        }

        const analyticsRes = await axios.get(`${backendUrl}/api/analytics`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (isCurrent) {
          setAnalytics(analyticsRes.data);
        }
      } catch (error) {
        if (!isCurrent) return;
        if (error.response?.status === 404) {
          setAnalytics(null);
          setErrorMessage("No analytics available yet. Upload a resume first.");
        } else {
          console.error(error);
          setAnalytics(null);
          setErrorMessage("Unable to load analytics right now.");
        }
      } finally {
        if (isCurrent) {
          setLoading(false);
        }
      }
    };

    fetchInitial();

    return () => {
      isCurrent = false;
    };
  }, [user?._id]);

  if (!user) return null;

  return (
    <div
      className="relative pb-8 text-[#123F5B]"
    >
      {loading ? (
        <div className="flex min-h-[60vh] items-center justify-center">
        </div>
      ) : (
        <motion.div
          key="content"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="space-y-6"
        >
          <div className="mb-2 hidden items-end justify-between md:flex">
            <div>
              <div className="mb-2 flex items-center gap-3 text-[11px] font-medium uppercase tracking-[0.2em] text-[#6B7280]">
                <span className="h-px w-6 bg-[#0A2540]/10"></span>
                Overview
              </div>
              <h1 className="text-3xl font-semibold tracking-tight text-[#0A2540] flex items-center gap-3">
                Analytics
              </h1>
            </div>
          </div>
          <section className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between mb-8">
            <div className="max-w-3xl relative z-10">
              <motion.h1
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-3xl font-semibold tracking-tight text-[#0A2540] sm:text-[2.5rem] leading-tight"
              >
                Resume performance
              </motion.h1>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="mt-2 text-[15px] font-normal text-[#4B5E76]"
              >
                See where your link is being opened and what is working best.
              </motion.p>
            </div>
          </section>

          <section className="relative z-10 space-y-8">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <h2 className="text-xl font-semibold tracking-tight text-[#0A2540]">
                Where views are coming from
              </h2>
              <div className="text-[13px] font-medium text-[#4B5E76]">
                {analytics?.totalViews || 0} total views
              </div>
            </div>

            {errorMessage === "No analytics available yet. Upload a resume first." || errorMessage === "Sign in to view analytics." ? (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[#0A2540]/20 bg-white/50 px-6 py-12 text-center">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#0A2540]/5 text-[#0A2540]">
                  <ActivityIcon />
                </div>
                <h3 className="text-base font-semibold text-[#0A2540]">{errorMessage}</h3>
                <p className="mt-2 text-[14px] font-normal text-[#4B5E76] max-w-sm">
                  Once your link is active and starts receiving visits, your performance metrics will appear here.
                </p>
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
                  <div className="rounded-xl border border-[#E5E7E3] bg-white/72 px-4 py-3">
                    <div className="flex items-center justify-between text-[#557083]">
                      <span className="text-xs font-semibold uppercase tracking-[0.12em]">
                        LinkedIn
                      </span>
                      <Link2Icon />
                    </div>
                    <p className="mt-2 text-2xl font-semibold text-[#123F5B]">
                      {sourceMap("LinkedIn")}
                    </p>
                  </div>

                  <div className="rounded-xl border border-[#E5E7E3] bg-white/72 px-4 py-3">
                    <div className="flex items-center justify-between text-[#557083]">
                      <span className="text-xs font-semibold uppercase tracking-[0.12em]">
                        GitHub
                      </span>
                      <HistoryIcon />
                    </div>
                    <p className="mt-2 text-2xl font-semibold text-[#123F5B]">
                      {sourceMap("GitHub")}
                    </p>
                  </div>

                  <div className="rounded-xl border border-[#E5E7E3] bg-white/72 px-4 py-3">
                    <div className="flex items-center justify-between text-[#557083]">
                      <span className="text-xs font-semibold uppercase tracking-[0.12em]">
                        Direct
                      </span>
                      <ActivityIcon />
                    </div>
                    <p className="mt-2 text-2xl font-semibold text-[#123F5B]">
                      {sourceMap("Direct")}
                    </p>
                  </div>
                </div>

                <div className="mt-2 overflow-hidden rounded-xl border border-[#E5E7E3] bg-white/70">
                  <div className="border-b border-[#E5E7E3] px-5 py-4">
                    <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-[#557083]">
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
                                    <div className="h-2 w-2 rounded-full bg-[#D4E5B2]" />
                                    <span className="font-semibold text-[#123F5B]">
                                      Resume Viewed
                                    </span>
                                  </div>
                                </td>
                                <td>
                                  <span className="badge badge-neutral border border-[#E5E7E3] bg-white/70 text-[#557083]">
                                    {view.source}
                                  </span>
                                </td>
                                <td>
                                  <span className="font-mono text-sm text-[#557083]">
                                    {targetPath}
                                  </span>
                                </td>
                                <td className="text-sm text-[#557083]">
                                  {timeAgo(view.createdAt)}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="p-6 text-sm text-[#557083]">
                      No recent activity yet.
                    </div>
                  )}
                </div>
              </>
            ) : (
              <Alert className="rounded-xl border-[#E5E7E3] bg-white/70 text-[#557083]">
                <AlertDescription>No analytics available yet.</AlertDescription>
              </Alert>
            )}
          </section>
        </motion.div>
      )}
    </div>
  );
}
