"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import { Playfair_Display, Sora } from "next/font/google";
import { useAuth } from "../../context/AuthContext";
import { UploadIcon } from "../../components/icons/Icons";
import { CheckCircle2Icon, InfoIcon, RotateCwIcon, FileText, Plus, ArrowRight, Link as LinkIcon } from "lucide-react";
import { IoIosArrowBack } from "react-icons/io";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { motion, AnimatePresence } from "framer-motion";

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

function timeAgo(dateString) {
  if (!dateString) return "";
  const now = new Date();
  const past = new Date(dateString);
  const diffInSeconds = Math.floor((now - past) / 1000);

  if (diffInSeconds < 60) return `${diffInSeconds} sec ago`;
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes} min ago`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours} hrs ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  return `${diffInDays} days ago`;
}

export default function ResumesPage() {
  const { user } = useAuth();

  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [uploadSuccessToast, setUploadSuccessToast] = useState("");

  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadNotice, setUploadNotice] = useState("");
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadPreviewUrl, setUploadPreviewUrl] = useState("");
  const uploadToastTimeoutRef = useRef(null);

  const [newResumeTitle, setNewResumeTitle] = useState("My Resume");
  const [newResumeSlug, setNewResumeSlug] = useState("");

  const isErrorMessage = /failed|unable|error|not found|required|invalid/i.test(
    message,
  );

  const sortedResumes = useMemo(
    () =>
      [...resumes].sort((a, b) => {
        return (
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        );
      }),
    [resumes],
  );

  const getToken = () => localStorage.getItem("token");

  const showUploadSuccessToast = (text) => {
    if (uploadToastTimeoutRef.current) {
      window.clearTimeout(uploadToastTimeoutRef.current);
    }

    setUploadSuccessToast(text);
    uploadToastTimeoutRef.current = window.setTimeout(() => {
      setUploadSuccessToast("");
    }, 2200);
  };

  const getValidToken = () => {
    const token = (getToken() || "").trim();
    if (!token || token === "null" || token === "undefined") {
      return null;
    }
    return token;
  };

  const handleUnauthorized = (setter) => {
    localStorage.removeItem("token");
    localStorage.removeItem("auth_user");
    setter("Session expired. Please login again.");
    window.setTimeout(() => {
      window.location.href = "/login";
    }, 700);
  };

  useEffect(() => {
    if (!uploadFile) {
      setUploadPreviewUrl("");
      return undefined;
    }

    const objectUrl = URL.createObjectURL(uploadFile);
    setUploadPreviewUrl(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [uploadFile]);

  useEffect(() => {
    return () => {
      if (uploadToastTimeoutRef.current) {
        window.clearTimeout(uploadToastTimeoutRef.current);
      }
    };
  }, []);

  const loadResumes = async () => {
    if (!user) return;

    setLoading(true);
    setMessage("");

    try {
      const token = getValidToken();
      if (!token) {
        handleUnauthorized(setMessage);
        setResumes([]);
        return;
      }

      const response = await axios.get(`${backendUrl}/api/resume/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setResumes(response.data.resumes || []);
    } catch (error) {
      if (error.response?.status === 401) {
        handleUnauthorized(setMessage);
        setResumes([]);
        return;
      }

      if (error.response?.status === 404) {
        setResumes([]);
      } else {
        console.error(error);
        setMessage("Unable to load resumes right now.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadResumes();
  }, [user]);

  const openWorkspace = (resumeId) => {
    window.open(
      `/dashboard/resumes/${resumeId}`,
      "_blank",
      "noopener,noreferrer",
    );
  };

  const openNewResumeModal = () => {
    setNewResumeTitle("My Resume");
    setNewResumeSlug("");
    setUploadFile(null);
    setUploadPreviewUrl("");
    setUploadNotice("");
    setIsUploadModalOpen(true);
  };

  const uploadToCloudinary = async (pdfFile) => {
    const formData = new FormData();
    formData.append("file", pdfFile);
    formData.append(
      "upload_preset",
      process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET,
    );

    const uploadRes = await axios.post(
      `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/upload`,
      formData,
    );

    return uploadRes.data.secure_url;
  };

  const createResume = async () => {
    const titleValue = newResumeTitle.trim() || "My Resume";
    const slugValue = newResumeSlug.trim().toLowerCase();

    if (!slugValue) {
      setUploadNotice("Slug is required for a new resume.");
      return null;
    }

    const token = getValidToken();
    if (!token) {
      handleUnauthorized(setUploadNotice);
      return null;
    }

    const createRes = await axios.post(
      `${backendUrl}/api/resume`,
      { title: titleValue, slug: slugValue },
      { headers: { Authorization: `Bearer ${token}` } },
    );

    const resume = createRes.data.resume;
    setResumes((prev) => {
      const deduped = prev.filter((item) => item._id !== resume._id);
      return [resume, ...deduped];
    });

    return resume;
  };

  const handleUpload = async () => {
    if (!uploadFile) {
      setUploadNotice("Please select a PDF first.");
      return;
    }

    if (uploadFile.type !== "application/pdf") {
      setUploadNotice("Only PDF files are allowed.");
      return;
    }

    setUploading(true);
    setUploadNotice("");

    try {
      const createdResume = await createResume();
      if (!createdResume) {
        return;
      }

      const resumeId = createdResume._id;

      const fileUrl = await uploadToCloudinary(uploadFile);
      const token = getValidToken();

      if (!token) {
        handleUnauthorized(setUploadNotice);
        return;
      }

      await axios.post(
        `${backendUrl}/api/resume/${resumeId}/version`,
        { fileUrl },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      setIsUploadModalOpen(false);
      setUploadFile(null);
      setUploadPreviewUrl("");
      await loadResumes();
      showUploadSuccessToast("New resume uploaded successfully.");
    } catch (error) {
      console.error(error);
      if (error.response?.status === 401) {
        handleUnauthorized(setUploadNotice);
        return;
      }
      setUploadNotice(error.response?.data?.message || "Upload failed.");
    } finally {
      setUploading(false);
    }
  };

  if (!user) return null;

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <div className={`${sansFont.className} relative space-y-8 pb-8 text-[#0A2540]`}>
      <AnimatePresence>
        {uploadSuccessToast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
            className="fixed bottom-6 right-6 z-[160]"
          >
            <Alert className="w-[min(92vw,360px)] rounded-2xl border-emerald-500/30 bg-[#064E3B]/95 backdrop-blur-md text-emerald-50 shadow-[0_20px_50px_-15px_rgba(6,78,59,0.5)]">
              <AlertDescription className="flex items-center gap-3 py-1">
                <CheckCircle2Icon className="h-5 w-5 shrink-0 text-emerald-400" />
                <span className="font-medium text-[15px]">{uploadSuccessToast}</span>
              </AlertDescription>
            </Alert>
          </motion.div>
        )}
      </AnimatePresence>

      {message && (
        <Alert
          variant={isErrorMessage ? "destructive" : "default"}
          className={
            isErrorMessage
              ? "rounded-2xl border-rose-200 bg-rose-50/80 backdrop-blur-md text-rose-800 shadow-sm"
              : "rounded-2xl border-emerald-200 bg-emerald-50/80 backdrop-blur-md text-emerald-800 shadow-sm"
          }
        >
          <AlertDescription className="flex items-center gap-3 py-1">
            {isErrorMessage ? (
              <InfoIcon className="h-5 w-5 shrink-0 text-rose-500" />
            ) : (
              <CheckCircle2Icon className="h-5 w-5 shrink-0 text-emerald-500" />
            )}
            <span className="font-medium text-[15px]">{message}</span>
          </AlertDescription>
        </Alert>
      )}

      <section className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-3xl relative z-10">
          <motion.h1 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl font-extrabold tracking-tight text-[#0A2540] sm:text-[2.5rem] leading-tight"
          >
            Your resumes
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className={`${displayFont.className} mt-2 text-lg italic text-[#4B5E76]`}
          >
            Manage and edit your professional profiles in one place.
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
            onClick={loadResumes}
            disabled={loading}
            aria-label={loading ? "Refreshing resumes" : "Refresh resumes"}
            title={loading ? "Refreshing resumes" : "Refresh resumes"}
            className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-white/60 bg-white/50 text-[#4B5E76] transition-all hover:bg-white hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60 backdrop-blur-md"
          >
            <RotateCwIcon
              className={`h-5 w-5 ${loading ? "animate-spin text-[#0A2540]" : ""}`}
            />
          </button>
          <button
            type="button"
            onClick={openNewResumeModal}
            className="group flex flex-1 items-center justify-center gap-2 rounded-2xl bg-[#0A2540] px-6 py-3 text-sm font-bold tracking-wide text-white transition-all hover:bg-[#1E3A8A] hover:shadow-[0_8px_25px_rgba(30,58,138,0.3)] hover:-translate-y-0.5 active:translate-y-0 sm:w-auto sm:flex-none"
          >
            <Plus className="h-4 w-4 transition-transform group-hover:rotate-90" />
            Upload New Resume
          </button>
        </motion.div>
      </section>

      <section className="relative z-10">
        {loading ? (
          <div className="flex min-h-[300px] items-center justify-center">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-4 rounded-full border border-white/40 bg-white/60 backdrop-blur-xl px-8 py-5 text-sm font-bold text-[#4B5E76] shadow-lg"
            >
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#E5E7E3] border-t-[#0A2540]" />
              Loading your workspaces...
            </motion.div>
          </div>
        ) : sortedResumes.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mx-auto flex max-w-2xl flex-col items-center justify-center rounded-[2rem] border border-white/60 bg-white/40 backdrop-blur-xl p-12 text-center shadow-sm"
          >
            <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-[#0A2540]/5">
              <FileText className="h-10 w-10 text-[#0A2540]/40" />
            </div>
            <h3 className="text-xl font-bold text-[#0A2540]">No resumes found</h3>
            <p className="mt-2 mb-8 max-w-sm text-[15px] leading-relaxed text-[#4B5E76]">
              You haven't uploaded any resumes yet. Start building your portfolio by uploading your first PDF.
            </p>
            <button
              onClick={openNewResumeModal}
              className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-[#0A2540] shadow-sm transition hover:shadow-md active:scale-95"
            >
              <UploadIcon className="h-4 w-4" />
              Upload your first resume
            </button>
          </motion.div>
        ) : (
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
          >
            {sortedResumes.map((resume) => {
              const publicPath = `/${user.username}/${resume.slug}`;
              return (
                <motion.button
                  variants={itemVariants}
                  type="button"
                  key={resume._id}
                  onClick={() => openWorkspace(resume._id)}
                  className="group relative flex flex-col items-start overflow-hidden rounded-[1.5rem] border border-white/60 bg-white/50 backdrop-blur-xl p-6 text-left transition-all duration-300 hover:bg-white hover:shadow-[0_8px_30px_rgba(10,37,64,0.08)] hover:-translate-y-1"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                  
                  <div className="relative z-10 w-full">
                    <div className="mb-5 flex items-center justify-between">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#0A2540]/5 text-[#0A2540] transition-transform duration-300 group-hover:scale-110 group-hover:bg-[#0A2540] group-hover:text-white">
                        <FileText className="h-5 w-5" />
                      </div>
                      <span className="rounded-full border border-white/80 bg-white/60 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-[#4B5E76] shadow-sm backdrop-blur-sm transition-colors group-hover:border-[#E5E7E3]">
                        {timeAgo(resume.updatedAt)}
                      </span>
                    </div>

                    <div className="min-w-0 w-full space-y-1">
                      <h2 className="truncate text-lg font-bold text-[#0A2540] transition-colors group-hover:text-[#111827]">
                        {resume.title || "My Resume"}
                      </h2>
                      <p className="flex items-center gap-1.5 truncate text-[13px] font-medium text-[#4B5E76]">
                        <LinkIcon className="h-3.5 w-3.5 opacity-70" />
                        {publicPath}
                      </p>
                    </div>

                    <div className="mt-6 flex w-full items-center justify-between border-t border-black/5 pt-4">
                      <span className="text-[13px] font-semibold text-[#0A2540]/60 group-hover:text-[#0A2540]">
                        Open Workspace
                      </span>
                      <ArrowRight className="h-4 w-4 text-[#0A2540] opacity-0 transition-all duration-300 group-hover:translate-x-1 group-hover:opacity-100" />
                    </div>
                  </div>
                </motion.button>
              );
            })}
          </motion.div>
        )}
      </section>

      <AnimatePresence>
        {isUploadModalOpen && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center px-4 py-6 sm:px-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-[#0A2540]/40 backdrop-blur-sm"
              onClick={() => !uploading && setIsUploadModalOpen(false)}
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="relative w-full max-w-[600px] overflow-hidden rounded-[2rem] border border-white/20 bg-[#fafafa] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.4)]"
            >
              {/* Decorative header background */}
              <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-br from-[#0A2540] to-[#1E3A8A]" />
              
              <div className="relative z-10 px-8 pb-8 pt-10">
                <div className="mb-8 text-center text-white">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-md shadow-inner">
                    <UploadIcon className="h-7 w-7 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold tracking-tight">Upload New Resume</h3>
                  <p className="mt-2 text-sm text-blue-100/80">
                    Add a PDF to create a new editable workspace.
                  </p>
                </div>

                <div className="rounded-[1.5rem] bg-white p-6 shadow-sm border border-black/5 space-y-5">
                  <div>
                    <label className="mb-2 block text-[11px] font-bold uppercase tracking-[0.2em] text-[#6B7280]">
                      Resume title
                    </label>
                    <input
                      value={newResumeTitle}
                      onChange={(event) => setNewResumeTitle(event.target.value)}
                      className="w-full rounded-xl border border-[#E5E7E3] bg-[#fafafa] px-4 py-3.5 text-[15px] font-semibold text-[#0A2540] outline-none transition-all placeholder:font-medium placeholder:text-[#9CA3AF] focus:border-[#0A2540] focus:bg-white focus:ring-4 focus:ring-[#0A2540]/5"
                      placeholder="e.g. Software Engineer Role"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-[11px] font-bold uppercase tracking-[0.2em] text-[#6B7280]">
                      Public Slug
                    </label>
                    <div className="flex flex-nowrap items-center gap-2 overflow-x-auto rounded-xl border border-[#E5E7E3] bg-[#fafafa] px-4 py-3.5 transition-all focus-within:border-[#0A2540] focus-within:bg-white focus-within:ring-4 focus-within:ring-[#0A2540]/5">
                      <span className="shrink-0 font-mono text-[15px] text-[#6B7280]">
                        /{user.username}/
                      </span>
                      <input
                        value={newResumeSlug}
                        onChange={(event) => setNewResumeSlug(event.target.value)}
                        placeholder="frontend"
                        className="min-w-0 flex-1 bg-transparent text-[15px] font-semibold text-[#0A2540] outline-none placeholder:font-medium placeholder:text-[#9CA3AF]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block text-[11px] font-bold uppercase tracking-[0.2em] text-[#6B7280]">
                      PDF file
                    </label>
                    <div className="relative overflow-hidden rounded-xl border border-[#E5E7E3] bg-[#fafafa] transition-all focus-within:border-[#0A2540] focus-within:bg-white focus-within:ring-4 focus-within:ring-[#0A2540]/5 hover:border-[#0A2540]/30">
                      <input
                        type="file"
                        accept="application/pdf"
                        onChange={(event) => {
                          setUploadNotice("");
                          setUploadFile(event.target.files?.[0] || null);
                        }}
                        className="absolute inset-0 h-full w-full opacity-0 cursor-pointer"
                      />
                      <div className="flex items-center px-4 py-3.5">
                        <div className="flex items-center gap-2 rounded-lg bg-[#0A2540] px-3 py-1.5 text-xs font-bold text-white shadow-sm">
                          Choose File
                        </div>
                        <span className="ml-3 truncate text-[14px] font-medium text-[#6B7280]">
                          {uploadFile ? uploadFile.name : "No PDF selected"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {uploadPreviewUrl && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="overflow-hidden rounded-xl border border-[#E5E7E3] bg-white shadow-sm"
                    >
                      <div className="bg-[#f8f9fa] border-b border-[#E5E7E3] px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-[#6B7280]">
                        Preview
                      </div>
                      <div className="h-48 w-full bg-[#e9ecef]">
                        <iframe
                          title="Selected PDF preview"
                          src={uploadPreviewUrl}
                          className="h-full w-full border-none"
                        />
                      </div>
                    </motion.div>
                  )}

                  {uploadNotice && (
                    <Alert
                      variant="destructive"
                      className="rounded-xl border-rose-200 bg-rose-50 text-rose-800"
                    >
                      <AlertDescription className="flex items-center gap-2 text-sm font-medium">
                        <InfoIcon className="h-4 w-4 shrink-0 text-rose-500" />
                        <span>{uploadNotice}</span>
                      </AlertDescription>
                    </Alert>
                  )}
                </div>

                <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    onClick={() => setIsUploadModalOpen(false)}
                    disabled={uploading}
                    className="rounded-xl border border-transparent bg-transparent px-6 py-3 text-[15px] font-bold text-[#6B7280] transition-colors hover:bg-black/5 hover:text-[#0A2540] disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleUpload}
                    disabled={uploading || !uploadFile || !newResumeSlug.trim()}
                    className="flex min-w-[140px] items-center justify-center gap-2 rounded-xl bg-[#0A2540] px-6 py-3 text-[15px] font-bold tracking-wide text-white shadow-[0_8px_20px_rgba(10,37,64,0.25)] transition-all hover:bg-[#1E3A8A] hover:shadow-[0_8px_25px_rgba(30,58,138,0.3)] hover:-translate-y-0.5 active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
                  >
                    {uploading ? (
                      <>
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-white" />
                        Uploading
                      </>
                    ) : (
                      "Upload Resume"
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
