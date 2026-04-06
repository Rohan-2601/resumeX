"use client";

import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Playfair_Display, Sora } from "next/font/google";
import { useAuth } from "../../context/AuthContext";

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

  const loadResumes = async () => {
    if (!user) return;

    setLoading(true);
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
    loadResumes();
  }, [user]);

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
    <div
      className={`${sansFont.className} relative space-y-8 pb-8 text-[#1f1b16]`}
    >
      <div className="pointer-events-none absolute -top-24 left-10 h-72 w-72 rounded-full bg-white/50 blur-3xl" />
      <div className="pointer-events-none absolute right-4 top-24 h-96 w-96 rounded-full bg-[#d7c0a0]/35 blur-3xl" />

      <header className="relative overflow-hidden rounded-[2rem] border border-black/10 bg-[linear-gradient(135deg,rgba(248,242,231,0.96)_0%,rgba(238,228,211,0.96)_52%,rgba(232,219,193,0.96)_100%)] p-7 shadow-[0_24px_80px_-50px_rgba(0,0,0,0.55)] sm:p-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.6),transparent_35%),radial-gradient(circle_at_bottom_left,rgba(123,90,61,0.12),transparent_30%)]" />
        <div className="relative">
          <p className="text-xs font-semibold uppercase tracking-[0.32em] text-[#7b5a3d]">
            Dashboard / Links
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-[#211911] sm:text-5xl">
            Share clean resume links fast.
            <span
              className={`${displayFont.className} mt-2 block text-lg font-medium italic text-[#7b5a3d] sm:text-xl`}
            >
              Full links, one-click copy, no trimming.
            </span>
          </h1>
        </div>
      </header>

      <section className="rounded-[1.75rem] border border-black/10 bg-[linear-gradient(180deg,rgba(251,247,238,0.95)_0%,rgba(242,233,218,0.9)_100%)] p-6 shadow-[0_20px_60px_-42px_rgba(0,0,0,0.42)] sm:p-8">
        <div className="mb-5 flex items-end justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#7b5a3d]">
              Permanent public links
            </p>
            <h2 className="mt-1 text-2xl font-semibold text-[#211911]">
              Resume link cards
            </h2>
          </div>
          <button
            type="button"
            onClick={loadResumes}
            disabled={loading}
            className="rounded-2xl border border-black/10 bg-white px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-[#5f5144] transition hover:bg-[#f7f2ea] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Refreshing" : "Refresh"}
          </button>
        </div>

        {message ? (
          <div className="mb-4 rounded-2xl border border-black/10 bg-white p-4 text-sm text-[#5f5144]">
            {message}
          </div>
        ) : null}

        {loading ? (
          <div className="rounded-2xl border border-black/10 bg-white p-5 text-sm text-[#5f5144]">
            Loading links...
          </div>
        ) : publicLinks.length === 0 ? (
          <div className="rounded-2xl border border-black/10 bg-white p-5 text-sm text-[#5f5144]">
            No resumes found. Upload one from the Resumes tab.
          </div>
        ) : (
          <div className="space-y-4">
            {publicLinks.map((link) => {
              const copyState = copiedSlug === (link.slug || "default");
              return (
                <div
                  key={link.id}
                  className="rounded-2xl border border-black/10 bg-white p-4 shadow-[0_10px_30px_-24px_rgba(0,0,0,0.45)]"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-[#211911]">
                        {link.title}
                      </p>
                      <p className="mt-1 text-xs text-[#6b5b4a]">
                        /{user.username}/{link.slug}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopy(link.href, link.slug)}
                      className="rounded-xl border border-black/10 bg-white px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-[#5f5144] transition hover:bg-[#f7f2ea]"
                    >
                      {copyState ? "Copied" : "Copy Link"}
                    </button>
                  </div>

                  <div className="mt-3 rounded-xl border border-black/10 bg-white px-3 py-2.5">
                    <p className="break-all font-mono text-sm text-[#3a2f25]">
                      {link.href}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
