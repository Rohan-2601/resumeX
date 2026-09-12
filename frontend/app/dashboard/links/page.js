"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import { IoIosArrowBack } from "react-icons/io";
import { motion, AnimatePresence } from "framer-motion";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Link as LinkIcon } from "lucide-react";



const backendUrl =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

export default function LinksPage() {
  const { user } = useAuth();
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [copiedSlug, setCopiedSlug] = useState("");

  const publicLinks = useMemo(() => {
    if (!user) return [];

    const origin =
      typeof window === "undefined" ? "" : window.location.origin || "";

    return resumes.map((resume) => {
      const href = resume.slug
        ? `${origin}/${user.username}/${resume.slug}`
        : `${origin}/${user.username}`;

      return {
        id: resume._id,
        title: resume.title || "My Resume",
        slug: resume.slug,
        href,
        updatedAt: resume.updatedAt,
      };
    });
  }, [resumes, user]);

  const loadResumes = async (showLoading = true) => {
    if (!user) return;

    if (showLoading) setLoading(true);
    setMessage("");

    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${backendUrl}/api/resume/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setResumes(response.data.resumes || []);
    } catch (error) {
      console.error(error);
      if (error.response?.status === 404) {
        setResumes([]);
      } else {
        setMessage("Unable to load links right now.");
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
        const response = await axios.get(`${backendUrl}/api/resume/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (isCurrent) {
          setResumes(response.data.resumes || []);
        }
      } catch (error) {
        if (!isCurrent) return;
        console.error(error);
        if (error.response?.status === 404) {
          setResumes([]);
        } else {
          setMessage("Unable to load links right now.");
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

  const handleCopy = async (link, slug) => {
    try {
      await navigator.clipboard.writeText(link);
      setCopiedSlug(slug || "default");
      window.setTimeout(() => setCopiedSlug(""), 1800);
    } catch (error) {
      console.error(error);
      setMessage("Failed to copy link.");
    }
  };

  if (!user) return null;

  return (
    <div className="relative pb-8 text-[#123F5B] dark:text-[#f8fafc]">
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
              <div className="mb-2 flex items-center gap-3 text-[11px] font-medium uppercase tracking-[0.2em] text-[#6B7280] dark:text-[#a1a1aa]">
                <span className="h-px w-6 bg-[#0A2540]/10 dark:bg-white/10"></span>
                Overview
              </div>
              <h1 className="text-[1.8rem] font-medium tracking-tight text-[#0A2540]/90 dark:text-[#f8fafc]/90 flex items-center gap-3">
                Links
              </h1>
            </div>
          </div>
          <section className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between mb-8">
            <div className="max-w-3xl relative z-10">
              <motion.h1
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-3xl font-medium tracking-tight text-[#0A2540]/90 dark:text-[#f8fafc]/90 sm:text-[2.5rem] leading-tight"
              >
                Share your links
              </motion.h1>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="mt-2 text-[15px] font-normal text-[#4B5E76] dark:text-[#a1a1aa]"
              >
                Clean, permanent URLs for all your workspaces.
              </motion.p>
            </div>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="flex w-full gap-3 sm:w-auto relative z-10"
            >
              <button
                type="button"
                onClick={() => loadResumes(true)}
                disabled={loading}
                className="group flex flex-1 items-center justify-center gap-2 rounded-xl border border-[#0A2540]/[0.08] dark:border-white/10 bg-[#0A2540]/[0.03] dark:bg-white/5 px-5 py-2.5 text-[14px] font-medium text-[#0A2540]/90 dark:text-[#f8fafc]/90 transition-all hover:bg-[#0A2540]/[0.06] dark:hover:bg-white/10 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto sm:flex-none"
              >
                Refresh Links
              </button>
            </motion.div>
          </section>

          <section className="relative z-10 space-y-4">
            {message ? (
              <Alert
                variant="destructive"
                className="mb-4 rounded-2xl border-rose-200 dark:border-rose-900/20 bg-rose-50/80 dark:bg-rose-950/20 backdrop-blur-md dark:backdrop-blur-none text-rose-800 dark:text-rose-400 shadow-sm dark:shadow-none"
              >
                <AlertDescription className="font-medium text-[15px]">{message}</AlertDescription>
              </Alert>
            ) : null}

            {publicLinks.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[#0A2540]/20 dark:border-white/10 bg-white/50 dark:bg-white/5 px-6 py-12 text-center min-h-[200px] w-full transition-colors">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#0A2540]/5 dark:bg-white/10 text-[#0A2540]/90 dark:text-[#f8fafc]/90 transition-colors">
                  <LinkIcon className="h-5 w-5" />
                </div>
                <h3 className="text-base font-medium text-[#0A2540]/90 dark:text-[#f8fafc]/90">
                  No links available
                </h3>
                <p className="mt-2 text-[14px] font-normal text-[#4B5E76] dark:text-[#a1a1aa] max-w-sm">
                  No resumes found. Create a workspace first to get a shareable link.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {publicLinks.map((link) => {
                  const copyState = copiedSlug === (link.slug || "default");
                  return (
                    <div
                      key={link.id}
                      className="group flex flex-col sm:flex-row sm:items-center justify-between gap-4 overflow-hidden rounded-2xl border border-[#0A2540]/[0.08] dark:border-white/10 bg-white dark:bg-white/5 p-4 transition-all duration-300 hover:border-[#0A2540]/20 dark:hover:border-white/20 hover:bg-[#0A2540]/[0.01] dark:hover:bg-white/10"
                    >
                      <div className="flex items-center gap-4 min-w-0">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#0A2540]/[0.03] dark:bg-white/10 text-[#0A2540]/90 dark:text-[#f8fafc]/90 border border-[#0A2540]/[0.08] dark:border-white/10">
                          <LinkIcon className="h-4 w-4" />
                        </div>

                        <div className="min-w-0">
                          <h2 className="truncate text-[15px] font-medium text-[#0A2540]/90 dark:text-[#f8fafc]/90">
                            {link.title}
                          </h2>
                          <div className="flex items-center gap-1.5 truncate mt-0.5">
                            <span className="truncate text-[13px] font-normal text-[#4B5E76] dark:text-[#a1a1aa]">
                              /{user.username}/{link.slug}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
                        <div className="rounded-lg border border-[#0A2540]/[0.06] dark:border-white/10 bg-[#0A2540]/[0.02] dark:bg-white/5 px-3 py-2 w-full sm:max-w-[200px] md:max-w-[300px] overflow-hidden">
                          <p className="truncate font-mono text-[11px] text-[#4B5E76] dark:text-[#a1a1aa]">
                            {link.href}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleCopy(link.href, link.slug)}
                          className={`flex shrink-0 h-9 items-center justify-center rounded-lg px-4 text-[11px] font-semibold uppercase tracking-[0.1em] transition-all w-full sm:w-auto ${copyState
                            ? "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800"
                            : "border border-[#0A2540]/[0.12] dark:border-white/10 bg-white dark:bg-transparent text-[#4B5E76] dark:text-[#a1a1aa] shadow-sm dark:shadow-none dark:shadow-none hover:bg-[#0A2540]/[0.02] dark:hover:bg-white/10 hover:text-[#0A2540] dark:hover:text-[#f8fafc]"
                            }`}
                        >
                          {copyState ? "Copied" : "Copy"}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </motion.div>
      )}
    </div>
  );
}
