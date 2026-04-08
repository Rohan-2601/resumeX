"use client";

import { useAuth } from "./context/AuthContext";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

import Hero from "./components/hero/Hero";
import Features from "./components/features/Features";
import SharePreview from "./components/share-preview/SharePreview";
import FAQs from "./components/faqs/FAQs";
import CTA from "./components/cta/CTA";
import Footer from "./components/footer/Footer";

export default function LandingPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user && !loading) {
      router.push("/dashboard");
    }
  }, [user, loading, router]);

  if (loading)
    return (
      <div className="flex min-h-[100dvh] items-center justify-center bg-[var(--bg-app)]">
        <div className="w-6 h-6 rounded-full border-3 border-[var(--border)] border-t-[var(--primary)] animate-spin" />
      </div>
    );

  return (
    <div className="min-h-[100dvh] flex flex-col bg-[var(--bg-app)] overflow-x-hidden">
      <Hero />
      <Features />
      <SharePreview />
      <FAQs />
      <CTA />
      <Footer />
    </div>
  );
}
