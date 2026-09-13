"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { UploadIcon } from "../../components/icons/Icons";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { CheckCircle2Icon, InfoIcon, RotateCwIcon, FileText, Plus, ArrowRight, Link as LinkIcon, Trash2 } from "lucide-react";
import { IoIosArrowBack } from "react-icons/io";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { motion, AnimatePresence } from "framer-motion";



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
  const router = useRouter();

  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [uploadSuccessToast, setUploadSuccessToast] = useState("");

  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadState, setUploadState] = useState("idle");
  const [uploadNotice, setUploadNotice] = useState("");
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadPreviewUrl, setUploadPreviewUrl] = useState("");
  const uploadToastTimeoutRef = useRef(null);

  const [newResumeTitle, setNewResumeTitle] = useState("My Resume");
  const [newResumeSlug, setNewResumeSlug] = useState("");

  const toast = useToast();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [workspaceToDelete, setWorkspaceToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

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

  const loadResumes = async (showLoading = true) => {
    if (!user) return;

    if (showLoading) setLoading(true);
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
    let isCurrent = true;

    const fetchInitial = async () => {
      if (!user) return;

      try {
        const token = getValidToken();
        if (!token) {
          handleUnauthorized(setMessage);
          if (isCurrent) setResumes([]);
          return;
        }

        const response = await axios.get(`${backendUrl}/api/resume/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (isCurrent) {
          setResumes(response.data.resumes || []);
        }
      } catch (error) {
        if (!isCurrent) return;
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
        if (isCurrent) {
          setLoading(false);
        }
      }
    };

    fetchInitial();

    return () => {
      isCurrent = false;
    };
  }, [user?._id]);

  const openWorkspace = (resumeId) => {
    router.push(`/dashboard/resumes/${resumeId}`);
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

    return createRes.data.resume;
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

    setUploadState("uploading");
    setUploadNotice("");

    try {
      const fileUrl = await uploadToCloudinary(uploadFile);

      setUploadState("saving");

      const createdResume = await createResume();
      if (!createdResume) {
        setUploadState("error");
        return;
      }

      const resumeId = createdResume._id;
      const token = getValidToken();

      if (!token) {
        handleUnauthorized(setUploadNotice);
        setUploadState("error");
        return;
      }

      await axios.post(
        `${backendUrl}/api/resume/${resumeId}/version`,
        { fileUrl },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      setUploadState("success");
      await loadResumes();

      setTimeout(() => {
        setIsUploadModalOpen(false);
        setUploadFile(null);
        setUploadPreviewUrl("");
        setUploadState("idle");
        showUploadSuccessToast("New resume uploaded successfully.");
      }, 400);
    } catch (error) {
      console.error(error);
      setUploadState("error");
      if (
        error.response?.status === 401 &&
        error.config?.url?.includes(backendUrl)
      ) {
        handleUnauthorized(setUploadNotice);
        return;
      }

      const errorMessage = error.response?.data?.error?.message || error.response?.data?.message || "Upload failed. Please try again.";
      setUploadNotice(errorMessage);
    }
  };

  const handleDeleteResume = (e, resumeId) => {
    e.stopPropagation();
    setWorkspaceToDelete(resumeId);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteWorkspace = async () => {
    if (!workspaceToDelete) return;
    setIsDeleting(true);

    try {
      const token = getValidToken();
      if (!token) {
        handleUnauthorized(setMessage);
        setIsDeleting(false);
        return;
      }

      await axios.delete(`${backendUrl}/api/resume/${workspaceToDelete}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setResumes((prev) => prev.filter((r) => r._id !== workspaceToDelete));
      toast.success("Workspace deleted successfully.");
      setIsDeleteDialogOpen(false);
      setWorkspaceToDelete(null);
    } catch (error) {
      console.error(error);
      if (
        error.response?.status === 401 &&
        error.config?.url?.includes(backendUrl)
      ) {
        handleUnauthorized(setMessage);
      } else {
        toast.error("Failed to delete workspace. Please try again.");
      }
      setIsDeleteDialogOpen(false);
    } finally {
      setIsDeleting(false);
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
    <div className="relative space-y-8 pb-8 text-[#0A2540]/90 dark:text-[#f8fafc]/90">
      <AnimatePresence>
        {uploadSuccessToast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
            className="fixed bottom-6 right-6 z-[160]"
          >
            <Alert className="w-[min(92vw,360px)] rounded-2xl border-emerald-500/30 dark:border-emerald-500/10 bg-[#064E3B]/95 dark:bg-[#064E3B]/95 backdrop-blur-md dark:backdrop-blur-none text-emerald-50 shadow-[0_20px_50px_-15px_rgba(6,78,59,0.5)] dark:shadow-none">
              <AlertDescription className="flex items-center gap-3 py-1">
                <CheckCircle2Icon className="h-5 w-5 shrink-0 text-emerald-400" />
                <span className="font-medium text-[15px]">{uploadSuccessToast}</span>
              </AlertDescription>
            </Alert>
          </motion.div>
        )}
      </AnimatePresence>

      {loading ? (
        <div className="flex min-h-[60vh] items-center justify-center">
        </div>
      ) : (
        <motion.div
          key="content"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="space-y-8"
        >
          <div className="mb-2 hidden items-end justify-between md:flex">
            <div>
              <div className="mb-2 flex items-center gap-3 text-[11px] font-medium uppercase tracking-[0.2em] text-[#6B7280] dark:text-[#a1a1aa]">
                <span className="h-px w-6 bg-[#0A2540]/10 dark:bg-white/10"></span>
                Overview
              </div>
              <h1 className="text-3xl font-medium tracking-tight text-[#0A2540]/90 dark:text-[#f8fafc]/90 flex items-center gap-3">
                Resumes
              </h1>
            </div>
          </div>
          {message && (
            <Alert
              variant={isErrorMessage ? "destructive" : "default"}
              className={
                isErrorMessage
                  ? "rounded-2xl border-rose-200 dark:border-rose-900/20 bg-rose-50/80 dark:bg-rose-950/20 backdrop-blur-md dark:backdrop-blur-none text-rose-800 dark:text-rose-400 shadow-sm dark:shadow-none"
                  : "rounded-2xl border-emerald-200 dark:border-emerald-900/20 bg-emerald-50/80 dark:bg-emerald-950/20 backdrop-blur-md dark:backdrop-blur-none text-emerald-800 dark:text-emerald-400 shadow-sm dark:shadow-none"
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
                className="text-3xl font-medium tracking-tight text-[#0A2540]/90 dark:text-[#f8fafc]/90 sm:text-[2.5rem] leading-tight"
              >
                Your resumes
              </motion.h1>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="mt-2 text-[15px] font-normal text-[#4B5E76] dark:text-[#a1a1aa]"
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
                onClick={openNewResumeModal}
                className="group flex flex-1 items-center justify-center gap-2 rounded-xl border border-[#0A2540]/[0.08] dark:border-white/10 bg-[#0A2540]/[0.03] dark:bg-white/5 px-5 py-2.5 text-[14px] font-medium text-[#0A2540]/90 dark:text-[#f8fafc]/90 transition-all hover:bg-[#0A2540]/[0.06] dark:hover:bg-white/10 active:scale-[0.98] sm:w-auto sm:flex-none"
              >
                <Plus className="h-4 w-4 transition-transform group-hover:rotate-90" />
                Upload New Resume
              </button>
            </motion.div>
          </section>

          <section className="relative z-10">
            {sortedResumes.length === 0 ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[#0A2540]/20 dark:border-white/20 bg-white/50 dark:bg-white/5 px-6 py-12 text-center min-h-[360px] w-full"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#0A2540]/5 dark:bg-white/10 text-[#0A2540]/90 dark:text-[#f8fafc]/90">
                  <FileText className="h-6 w-6" />
                </div>
                <h3 className="text-base font-medium text-[#0A2540]/90 dark:text-[#f8fafc]/90">
                  No resumes yet
                </h3>
                <p className="mt-2 mb-8 max-w-sm text-[14px] font-normal text-[#4B5E76] dark:text-[#a1a1aa]">
                  Create your first workspace to start building your professional resume.
                </p>
                <button
                  onClick={openNewResumeModal}
                  className="group inline-flex items-center gap-2 rounded-xl border border-[#0A2540]/[0.08] dark:border-white/10 bg-[#0A2540]/[0.03] dark:bg-white/5 px-5 py-2.5 text-[14px] font-medium text-[#0A2540]/90 dark:text-[#f8fafc]/90 transition-all hover:bg-[#0A2540]/[0.06] dark:hover:bg-white/10 active:scale-[0.98]"
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
                    <motion.div
                      variants={itemVariants}
                      key={resume._id}
                      onClick={() => openWorkspace(resume._id)}
                      className="group relative flex flex-col items-start overflow-hidden rounded-2xl border border-[#0A2540]/[0.08] dark:border-white/10 bg-white dark:bg-white/5 p-6 text-left transition-all duration-300 hover:border-[#0A2540]/20 dark:hover:border-white/20 hover:bg-[#0A2540]/[0.01] dark:hover:bg-white/10 cursor-pointer"
                    >
                      <div className="relative z-10 w-full flex flex-col h-full justify-between">
                        <div className="mb-5 flex items-start justify-between w-full">
                          <div className="flex h-[42px] w-[42px] items-center justify-center rounded-xl bg-[#0A2540]/[0.03] dark:bg-white/5 text-[#0A2540]/90 dark:text-[#f8fafc]/90 transition-colors group-hover:bg-[#0A2540]/[0.06] dark:group-hover:bg-white/10">
                            <FileText className="h-5 w-5" />
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-[12px] font-normal text-[#6B7280] dark:text-[#a1a1aa]">
                              {timeAgo(resume.updatedAt)}
                            </span>
                            <button
                              type="button"
                              onClick={(e) => handleDeleteResume(e, resume._id)}
                              className="flex h-10 w-10 items-center justify-center rounded-xl text-[#6B7280]/60 dark:text-[#a1a1aa]/60 transition-colors hover:bg-rose-50 dark:hover:bg-rose-500/10 hover:text-rose-500 dark:hover:text-rose-400"
                              title="Delete Workspace"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>

                        <div className="min-w-0 w-full mb-6">
                          <h2 className="mb-1.5 truncate text-[15px] font-medium text-[#0A2540]/90 dark:text-[#f8fafc]/90">
                            {resume.title || "My Resume"}
                          </h2>
                          <div className="flex items-center gap-1.5 truncate">
                            <LinkIcon className="shrink-0 h-3 w-3 text-[#4B5E76] dark:text-[#a1a1aa] opacity-70 translate-y-[-1px]" />
                            <span className="truncate text-[13px] font-normal text-[#4B5E76] dark:text-[#a1a1aa]">
                              {publicPath}
                            </span>
                          </div>
                        </div>

                        <div className="flex w-full items-center justify-between border-t border-[#0A2540]/[0.06] dark:border-white/10 pt-4 mt-auto">
                          <span className="text-[13px] font-medium text-[#0A2540]/60 dark:text-[#f8fafc]/60 transition-colors group-hover:text-[#0A2540] dark:group-hover:text-[#f8fafc]">
                            Open Workspace
                          </span>
                          <ArrowRight className="h-4 w-4 text-[#0A2540]/90 dark:text-[#f8fafc]/90 opacity-0 transition-all duration-300 group-hover:translate-x-1 group-hover:opacity-100" />
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>
            )}
          </section>
        </motion.div>
      )}
      <AnimatePresence>
        {isUploadModalOpen && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center px-4 py-6 sm:px-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-[#0A2540]/40 dark:bg-black/60 backdrop-blur-sm dark:backdrop-blur-none"
              onClick={() => (uploadState === "idle" || uploadState === "error") && setIsUploadModalOpen(false)}
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative flex max-h-[90vh] w-full max-w-[500px] flex-col overflow-hidden rounded-2xl border border-[#0A2540]/[0.08] dark:border-white/10 bg-white dark:bg-[#16171b] shadow-[0_20px_40px_-10px_rgba(10,37,64,0.08)] dark:shadow-none dark:shadow-none"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => (uploadState === "idle" || uploadState === "error") && setIsUploadModalOpen(false)}
                disabled={uploadState !== "idle" && uploadState !== "error"}
                className="absolute right-4 top-4 z-20 flex h-8 w-8 items-center justify-center rounded-lg border border-transparent bg-transparent text-[#4B5E76] dark:text-[#a1a1aa] transition-colors hover:bg-[#0A2540]/[0.03] dark:hover:bg-white/10 hover:border-[#0A2540]/[0.08] dark:hover:border-white/10 disabled:opacity-50"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  className="h-4 w-4"
                >
                  <path d="M18 6 6 18" />
                  <path d="m6 6 12 12" />
                </svg>
              </button>

              {/* Minimal header */}
              <div className="relative z-10 overflow-y-auto px-6 pb-6 pt-8">
                <div className="mb-6 text-center">
                  <div className="mx-auto mb-4 flex h-[48px] w-[48px] items-center justify-center rounded-xl bg-[#0A2540]/[0.03] dark:bg-white/10 border border-[#0A2540]/[0.08] dark:border-white/10">
                    <UploadIcon className="h-5 w-5 text-[#0A2540]/90 dark:text-[#f8fafc]/90" />
                  </div>
                  <h3 className="text-xl font-medium tracking-tight text-[#0A2540]/90 dark:text-[#f8fafc]/90">Upload New Resume</h3>
                  <p className="mt-1.5 text-[13.5px] font-medium text-[#6B7280] dark:text-[#a1a1aa]">
                    Add a PDF to create a new editable workspace.
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="mb-2 block text-[11px] font-medium uppercase tracking-[0.1em] text-[#6B7280] dark:text-[#a1a1aa]">
                      Resume title
                    </label>
                    <input
                      value={newResumeTitle}
                      onChange={(event) => setNewResumeTitle(event.target.value)}
                      className="w-full rounded-xl border border-[#0A2540]/[0.08] dark:border-white/10 bg-[#0A2540]/[0.02] dark:bg-white/5 px-4 py-3 text-[14px] font-medium text-[#0A2540]/90 dark:text-[#f8fafc]/90 outline-none transition-all placeholder:text-[#9CA3AF] dark:placeholder:text-[#71717a] focus:border-[#0A2540]/20 dark:focus:border-white/20 focus:bg-[#0A2540]/[0.04] dark:focus:bg-white/10 focus:ring-0"
                      placeholder="e.g. Software Engineer Role"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-[11px] font-medium uppercase tracking-[0.1em] text-[#6B7280] dark:text-[#a1a1aa]">
                      Public Slug
                    </label>
                    <div className="flex flex-nowrap items-center gap-2 overflow-x-auto rounded-xl border border-[#0A2540]/[0.08] dark:border-white/10 bg-[#0A2540]/[0.02] dark:bg-white/5 px-4 py-3 transition-all focus-within:border-[#0A2540]/20 dark:focus-within:border-white/20 focus-within:bg-[#0A2540]/[0.04] dark:focus-within:bg-white/10 focus-within:ring-0">
                      <span className="shrink-0 font-mono text-[13px] text-[#6B7280] dark:text-[#a1a1aa]">
                        /{user.username}/
                      </span>
                      <input
                        value={newResumeSlug}
                        onChange={(event) => setNewResumeSlug(event.target.value)}
                        placeholder="frontend"
                        className="min-w-0 flex-1 bg-transparent text-[14px] font-medium text-[#0A2540]/90 dark:text-[#f8fafc]/90 outline-none placeholder:text-[#9CA3AF] dark:placeholder:text-[#71717a]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block text-[11px] font-medium uppercase tracking-[0.1em] text-[#6B7280] dark:text-[#a1a1aa]">
                      PDF file
                    </label>
                    <div className="relative overflow-hidden rounded-xl border border-[#0A2540]/[0.08] dark:border-white/10 bg-[#0A2540]/[0.02] dark:bg-white/5 transition-all hover:border-[#0A2540]/20 dark:hover:border-white/20 hover:bg-[#0A2540]/[0.04] dark:hover:bg-white/10">
                      <input
                        type="file"
                        accept="application/pdf"
                        onChange={(event) => {
                          setUploadNotice("");
                          setUploadFile(event.target.files?.[0] || null);
                        }}
                        className="absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0"
                      />
                      <div className="flex w-full min-w-0 items-center px-4 py-2.5">
                        <div className="flex shrink-0 items-center gap-2 whitespace-nowrap rounded-md border border-[#0A2540]/[0.12] dark:border-white/20 bg-white dark:bg-white/10 px-3 py-1.5 text-[12px] font-medium text-[#0A2540]/90 dark:text-[#f8fafc]/90 shadow-[0_1px_2px_rgba(10,37,64,0.04)] dark:shadow-none dark:shadow-none transition-all">
                          Choose File
                        </div>
                        <span className="ml-3 truncate text-[13px] font-medium text-[#6B7280] dark:text-[#a1a1aa]">
                          {uploadFile ? uploadFile.name : "No PDF selected"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {uploadPreviewUrl && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="overflow-hidden rounded-xl border border-[#0A2540]/[0.08] dark:border-white/10 bg-[#0A2540]/[0.02] dark:bg-white/5"
                    >
                      <div className="border-b border-[#0A2540]/[0.08] dark:border-white/10 bg-[#0A2540]/[0.01] dark:bg-white/5 px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.1em] text-[#6B7280] dark:text-[#a1a1aa]">
                        Preview
                      </div>
                      <div className="h-56 w-full">
                        <iframe
                          title="Selected PDF preview"
                          src={uploadPreviewUrl}
                          className="h-full w-full border-none opacity-90"
                        />
                      </div>
                    </motion.div>
                  )}

                  {uploadNotice && (
                    <Alert
                      variant="destructive"
                      className="rounded-xl border border-rose-100 dark:border-rose-900/20 bg-rose-50/50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400"
                    >
                      <AlertDescription className="flex items-center gap-2 text-[13px] font-medium">
                        <InfoIcon className="h-4 w-4 shrink-0 text-rose-500" />
                        <span>{uploadNotice}</span>
                      </AlertDescription>
                    </Alert>
                  )}
                </div>

                <div className="mt-6 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setIsUploadModalOpen(false)}
                    disabled={uploadState !== "idle" && uploadState !== "error"}
                    className="flex-1 rounded-xl border border-[#0A2540]/[0.08] dark:border-white/10 bg-white dark:bg-white/5 px-5 py-2.5 text-[14px] font-medium text-[#4B5E76] dark:text-[#a1a1aa] transition-all hover:bg-[#0A2540]/[0.02] dark:hover:bg-white/10 active:scale-[0.98] disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleUpload}
                    disabled={
                      (uploadState !== "idle" && uploadState !== "error") ||
                      !uploadFile ||
                      !newResumeSlug.trim()
                    }
                    className="group flex min-w-[140px] items-center justify-center gap-2 rounded-xl border border-[#0A2540]/[0.08] dark:border-white/10 bg-[#0A2540]/[0.03] dark:bg-white/10 px-5 py-2.5 text-[14px] font-medium tracking-wide text-[#0A2540]/90 dark:text-[#f8fafc]/90 transition-all hover:bg-[#0A2540]/[0.06] dark:hover:bg-white/20 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {uploadState === "uploading" ? (
                      "Uploading PDF"
                    ) : uploadState === "saving" ? (
                      "Saving resume"
                    ) : uploadState === "success" ? (
                      <span className="flex items-center gap-1.5 text-emerald-600">
                        <CheckCircle2Icon className="h-4 w-4" />
                        Uploaded successfully
                      </span>
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

      <ConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false);
          setWorkspaceToDelete(null);
        }}
        onConfirm={confirmDeleteWorkspace}
        title="Delete Workspace"
        description="Are you sure you want to delete this workspace? This action cannot be undone."
        confirmLabel="Delete"
        isDestructive={true}
        loading={isDeleting}
      />
    </div>
  );
}
