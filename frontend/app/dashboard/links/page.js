"use client";

import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Playfair_Display, Sora } from "next/font/google";
import { useAuth } from "../../context/AuthContext";
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
      className={`${sansFont.className} relative space-y-6 pb-8 text-[#1f1b16]`}
    >
      <div className="pointer-events-none absolute -top-24 left-10 h-72 w-72 rounded-full bg-white/50 blur-3xl" />
      <div className="pointer-events-none absolute right-4 top-24 h-96 w-96 rounded-full bg-[#d7c0a0]/35 blur-3xl" />

      <header className="border-b border-black/10 pb-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.32em] text-[#7b5a3d]">
            Dashboard / Links
          </p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-[#211911] sm:text-4xl">
            Share clean resume links fast.
            <span
              className={`${displayFont.className} mt-1 block text-base font-medium italic text-[#7b5a3d] sm:text-lg`}
            >
              Full links, one-click copy, no trimming.
            </span>
          </h1>
        </div>
      </header>

      <section className="space-y-3">
        <div className="mb-5 flex items-end justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#7b5a3d]">
              Permanent public links
            </p>
            <h2 className="mt-1 text-xl font-semibold text-[#211911]">
              Resume links
            </h2>
          </div>
          <button
            type="button"
            onClick={loadResumes}
            disabled={loading}
            className="rounded-xl border border-black/10 bg-white/85 px-3 py-2 text-xs font-bold uppercase tracking-[0.14em] text-[#5f5144] transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Refreshing" : "Refresh"}
          </button>
        </div>

        {message ? (
          <Alert
            variant="destructive"
            className="mb-4 rounded-xl border-rose-900/20 bg-rose-50 text-rose-700"
          >
            <AlertDescription>{message}</AlertDescription>
          </Alert>
        ) : null}

        {loading ? (
          <div className="rounded-xl border border-black/10 bg-white/75 p-4 text-sm text-[#5f5144]">
            Loading links...
          </div>
        ) : publicLinks.length === 0 ? (
          <div className="rounded-xl border border-black/10 bg-white/75 p-4 text-sm text-[#5f5144]">
            No resumes found. Upload one from the Resumes tab.
          </div>
        ) : (
          <div className="space-y-2.5">
            {publicLinks.map((link) => {
              const copyState = copiedSlug === (link.slug || "default");
              return (
                <div
                  key={link.id}
                  className="rounded-xl border border-black/10 bg-white/75 px-3 py-3"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-[#211911]">
                        {link.title}
                      </p>
                      <p className="mt-0.5 text-xs text-[#6b5b4a]">
                        /{user.username}/{link.slug}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopy(link.href, link.slug)}
                      className="rounded-lg border border-black/10 bg-white px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-[#5f5144] transition hover:bg-[#f7f2ea]"
                    >
                      {copyState ? "Copied" : "Copy Link"}
                    </button>
                  </div>

                  <div className="mt-2 rounded-lg border border-black/10 bg-white/80 px-3 py-2">
                    <p className="break-all font-mono text-xs text-[#3a2f25]">
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
