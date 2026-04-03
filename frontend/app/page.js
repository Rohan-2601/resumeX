"use client";

import { useAuth } from "./context/AuthContext";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

import Navbar from "./components/navbar/Navbar";
import Hero from "./components/hero/Hero";
import Features from "./components/features/Features";
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
      <div className="h-screen flex items-center justify-center bg-[var(--bg-app)]">
        <div className="w-6 h-6 rounded-full border-3 border-[var(--border)] border-t-[var(--primary)] animate-spin" />
      </div>
    );

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-app)] overflow-hidden">
    
      <Hero />
      <Features />
      <CTA />
      <Footer />
    </div>
  );
}
