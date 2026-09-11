"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2Icon, XCircleIcon, XIcon } from "lucide-react";

const ToastContext = createContext(null);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = "info") => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    // Auto dismiss after 4 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, 4000);
  }, []);

  const toast = {
    success: (message) => addToast(message, "success"),
    error: (message) => addToast(message, "error"),
    info: (message) => addToast(message, "info"),
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="fixed bottom-6 right-6 z-[200] flex flex-col gap-3 pointer-events-none">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.15 } }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              className={`pointer-events-auto flex items-center gap-3 rounded-xl border bg-white px-4 py-3 shadow-lg min-w-[280px] max-w-[400px] ${
                t.type === "error"
                  ? "border-rose-200 bg-rose-50"
                  : "border-[#E5E7E3]"
              }`}
            >
              <div className="flex-shrink-0">
                {t.type === "success" && (
                  <CheckCircle2Icon className="h-5 w-5 text-emerald-500" />
                )}
                {t.type === "error" && (
                  <XCircleIcon className="h-5 w-5 text-rose-500" />
                )}
                {t.type === "info" && (
                  <div className="h-5 w-5 rounded-full bg-[#0A2540]/10 flex items-center justify-center">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#0A2540]" />
                  </div>
                )}
              </div>
              <p
                className={`text-sm font-medium flex-1 ${
                  t.type === "error" ? "text-rose-800" : "text-[#0A2540]"
                }`}
              >
                {t.message}
              </p>
              <button
                onClick={() => removeToast(t.id)}
                className={`flex-shrink-0 ml-2 rounded-lg p-1 transition-colors ${
                  t.type === "error"
                    ? "hover:bg-rose-100 text-rose-600"
                    : "hover:bg-black/5 text-[#6B7280]"
                }`}
              >
                <XIcon className="h-4 w-4" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};
