"use client";

import React, { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

export const ConfirmationDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  isDestructive = false,
  loading = false,
}) => {
  const confirmBtnRef = useRef(null);
  const cancelBtnRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      // Focus cancel button by default to prevent accidental deletion
      cancelBtnRef.current?.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen || loading) return;
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, loading, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="absolute inset-0 bg-[#0A2540]/40 backdrop-blur-sm"
            onClick={() => !loading && onClose()}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="dialog-title"
            aria-describedby="dialog-description"
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="relative flex w-full max-w-[400px] flex-col overflow-hidden rounded-2xl border border-[#0A2540]/[0.08] bg-white p-6 shadow-2xl"
          >
            <h2 id="dialog-title" className="text-lg font-semibold text-[#0A2540]">
              {title}
            </h2>
            <p id="dialog-description" className="mt-2 text-[14px] text-[#4B5E76]">
              {description}
            </p>

            <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button
                ref={cancelBtnRef}
                type="button"
                onClick={onClose}
                disabled={loading}
                className="inline-flex h-10 items-center justify-center rounded-xl border border-[#0A2540]/[0.08] bg-white px-4 text-sm font-medium text-[#4B5E76] transition-colors hover:bg-[#0A2540]/[0.03] focus:outline-none focus:ring-2 focus:ring-[#0A2540]/20 disabled:opacity-50"
              >
                {cancelLabel}
              </button>
              <button
                ref={confirmBtnRef}
                type="button"
                onClick={onConfirm}
                disabled={loading}
                className={`inline-flex h-10 items-center justify-center rounded-xl px-4 text-sm font-medium transition-colors focus:outline-none focus:ring-2 disabled:opacity-50 ${isDestructive
                    ? "bg-rose-50 text-rose-600 hover:bg-rose-100 focus:ring-rose-200 border border-rose-100"
                    : "bg-[#0A2540] text-white hover:bg-[#0A2540]/90 focus:ring-[#0A2540]/30"
                  }`}
              >
                {loading ? (
                  <>
                    <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    {isDestructive ? "Deleting..." : "Loading..."}
                  </>
                ) : (
                  confirmLabel
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
