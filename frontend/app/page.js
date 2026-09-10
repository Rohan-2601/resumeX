"use client";

import { useAuth } from "./context/AuthContext";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

import Hero from "./components/hero/Hero";
import PremiumFeatures from "./components/premium-features/PremiumFeatures";
import HowItWorks from "./components/how-it-works/HowItWorks";
import Comparison from "./components/comparison/Comparison";
import SharePreview from "./components/share-preview/SharePreview";
import FAQs from "./components/faqs/FAQs";
import CTA from "./components/cta/CTA";
import Footer from "./components/footer/Footer";

export default function LandingPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user && !loading) {
      router.replace("/dashboard");
    }
  }, [user, loading, router]);

  return (
    <>
      {(loading || user) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--bg-app)]">
          <div className="flex items-center gap-3 rounded-full border border-[var(--border)] bg-[var(--bg-surface)] px-5 py-3 text-sm font-medium text-[var(--text-main)] shadow-lg">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-[var(--border)] border-t-black" />
            Loading...
          </div>
        </div>
      )}
      <div className={`min-h-[100dvh] flex flex-col bg-[var(--bg-app)] overflow-x-hidden ${(loading || user) ? 'opacity-0 pointer-events-none' : 'opacity-100'} transition-opacity duration-300`}>
        <Hero />
        <PremiumFeatures />
        <SharePreview />
        <Comparison />
        <HowItWorks />
        <FAQs />
        <CTA />
        <Footer />
      </div>
    </>
  );
}
