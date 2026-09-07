"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Playfair_Display, Sora } from "next/font/google";
import { useAuth } from "../../context/AuthContext";
import { IoIosArrowBack } from "react-icons/io";
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
      className={`${sansFont.className} relative space-y-6 pb-8 text-[#123F5B]`}
    >

      <header className="border-b border-[#E5E7E3] pb-5">
        <div>
          <div className="flex items-center gap-2">
            <Link
              href="/dashboard"
              aria-label="Back to dashboard"
              className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-[#E5E7E3] bg-transparent text-[#557083] transition hover:bg-black/5"
            >
              <IoIosArrowBack className="h-4 w-4" />
            </Link>
            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-[#557083]">
              Dashboard / Links
            </p>
          </div>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-[#123F5B] sm:text-4xl">
            Share clean resume links fast.
            <span
              className={`${displayFont.className} mt-1 block text-base font-medium italic text-[#557083] sm:text-lg`}
            >
              Full links, one-click copy, no trimming.
            </span>
          </h1>
        </div>
      </header>

      <section className="space-y-3">
        <div className="mb-5 flex items-end justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#557083]">
              Permanent public links
            </p>
            <h2 className="mt-1 text-xl font-semibold text-[#123F5B]">
              Resume links
            </h2>
          </div>
          <button
            type="button"
            onClick={loadResumes}
            disabled={loading}
            className="rounded-xl border border-[#E5E7E3] bg-white/85 px-3 py-2 text-xs font-bold uppercase tracking-[0.14em] text-[#557083] transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-60"
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
          <div className="flex min-h-[220px] items-center justify-center">
            <div className="flex items-center gap-3 rounded-full border border-[#E5E7E3] bg-[#FFFFFF] px-5 py-3 text-sm font-medium text-[#557083] shadow-[0_20px_60px_-40px_rgba(0,0,0,0.5)]">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#E5E7E3] border-t-[#123F5B]" />
              Loading links...
            </div>
          </div>
        ) : publicLinks.length === 0 ? (
          <div className="mx-auto max-w-2xl rounded-2xl border border-[#E5E7E3] bg-white/75 p-6 text-center text-sm text-[#557083]">
            No resumes found. Upload one from the Resumes tab.
          </div>
        ) : (
          <div className="space-y-2.5">
            {publicLinks.map((link) => {
              const copyState = copiedSlug === (link.slug || "default");
              return (
                <div
                  key={link.id}
                  className="rounded-xl border border-[#E5E7E3] bg-white/75 px-3 py-3"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-[#123F5B]">
                        {link.title}
                      </p>
                      <p className="mt-0.5 text-xs text-[#557083]">
                        /{user.username}/{link.slug}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopy(link.href, link.slug)}
                      className="rounded-lg border border-[#E5E7E3] bg-white px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-[#557083] transition hover:bg-black/5"
                    >
                      {copyState ? "Copied" : "Copy Link"}
                    </button>
                  </div>

                  <div className="mt-2 rounded-lg border border-[#E5E7E3] bg-white/80 px-3 py-2">
                    <p className="break-all font-mono text-xs text-[#123F5B]">
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
