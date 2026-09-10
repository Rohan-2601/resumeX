"use client";

import { useEffect, useRef } from "react";

export default function ViewTracker({ username, slug }) {
  const hasTracked = useRef(false);

  useEffect(() => {
    if (hasTracked.current) return;
    hasTracked.current = true;

    const trackView = async () => {
      try {
        const backendUrl =
          process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
        const endpoint = slug
          ? `${backendUrl}/api/public/${username}/${slug}/view`
          : `${backendUrl}/api/public/${username}/view`;

        await fetch(endpoint, {
          method: "POST",
        });
      } catch (error) {
        console.error("Failed to track view:", error);
      }
    };

    const timeout = setTimeout(trackView, 500);
    return () => clearTimeout(timeout);
  }, [username, slug]);

  return null;
}
