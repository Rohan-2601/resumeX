"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";

import { useAuth } from "../../../context/AuthContext";
import { UploadIcon } from "../../../components/icons/Icons";
import { CheckCircle2Icon, InfoIcon, Check, Copy } from "lucide-react";
import { IoIosArrowBack } from "react-icons/io";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { motion, AnimatePresence } from "framer-motion";





const backendUrl =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

export default function ResumeWorkspacePage() {
  const params = useParams();
  const resumeId = params?.resumeId;
  const { user } = useAuth();

  const [resume, setResume] = useState(null);
  const [versions, setVersions] = useState([]);
  const [activeVersionId, setActiveVersionId] = useState("");
  const [selectedVersionId, setSelectedVersionId] = useState("");

  const [loading, setLoading] = useState(true);
  const [uploadState, setUploadState] = useState("idle");
  const [rollingBackId, setRollingBackId] = useState("");
  const [deletingVersionId, setDeletingVersionId] = useState("");
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [alertState, setAlertState] = useState(null);

  const [uploadFile, setUploadFile] = useState(null);
  const [uploadPreviewUrl, setUploadPreviewUrl] = useState("");
  const [copiedLink, setCopiedLink] = useState(false);
  const alertTimeoutRef = useRef(null);
  const copyTimeoutRef = useRef(null);

  const selectedVersion = useMemo(
    () => versions.find((version) => version._id === selectedVersionId) || null,
    [versions, selectedVersionId],
  );

  const activeVersion = useMemo(
    () => versions.find((version) => version._id === activeVersionId) || null,
    [versions, activeVersionId],
  );

  const getToken = () => localStorage.getItem("token");

  const showAlert = (message, type = "success") => {
    if (alertTimeoutRef.current) {
      window.clearTimeout(alertTimeoutRef.current);
    }

    setAlertState({ message, type });

    alertTimeoutRef.current = window.setTimeout(() => {
      setAlertState(null);
    }, 2200);
  };

  useEffect(() => {
    return () => {
      if (alertTimeoutRef.current) {
        window.clearTimeout(alertTimeoutRef.current);
      }
      if (copyTimeoutRef.current) {
        window.clearTimeout(copyTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!uploadFile) {
      setUploadPreviewUrl("");
      return undefined;
    }

    const objectUrl = URL.createObjectURL(uploadFile);
    setUploadPreviewUrl(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [uploadFile]);

  const loadWorkspace = async () => {
    if (!resumeId || !user) return;

    setLoading(true);

    try {
      const token = getToken();
      const [resumesRes, versionsRes] = await Promise.all([
        axios.get(`${backendUrl}/api/resume/me`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${backendUrl}/api/resume/${resumeId}/versions`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const myResume = (resumesRes.data.resumes || []).find(
        (item) => item._id === resumeId,
      );

      if (!myResume) {
        setResume(null);
        setVersions([]);
        showAlert("Resume not found or no access.", "error");
        return;
      }

      const fetchedVersions = versionsRes.data.versions || [];
      const nextActiveVersionId =
        myResume.currentVersionId?._id || myResume.currentVersionId || "";

      setResume(myResume);
      setVersions(fetchedVersions);
      setActiveVersionId(nextActiveVersionId);

      if (fetchedVersions.length > 0) {
        const activeVersion = fetchedVersions.find(
          (version) => version._id === nextActiveVersionId,
        );
        setSelectedVersionId(activeVersion?._id || fetchedVersions[0]._id);
      } else {
        setSelectedVersionId("");
      }
    } catch (error) {
      console.error(error);
      showAlert("Unable to load workspace.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWorkspace();
  }, [resumeId, user]);

  const uploadToCloudinary = async (pdfFile) => {
    const token = getToken();

    // 1. Get signature from backend
    const signatureRes = await axios.get(`${backendUrl}/api/resume/${resumeId}/upload-signature`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const { timestamp, signature, cloudName, apiKey, folder } = signatureRes.data;

    // 2. Upload to Cloudinary with signature
    const formData = new FormData();
    formData.append("file", pdfFile);
    formData.append("api_key", apiKey);
    formData.append("timestamp", timestamp);
    formData.append("signature", signature);
    formData.append("folder", folder);

    const uploadRes = await axios.post(
      `https://api.cloudinary.com/v1_1/${cloudName}/upload`,
      formData,
    );

    return uploadRes.data;
  };

  const handleUploadVersion = async () => {
    if (!uploadFile) {
      showAlert("Please select a PDF first.", "error");
      return false;
    }

    if (uploadFile.type !== "application/pdf") {
      showAlert("Only PDF files are allowed.", "error");
      return false;
    }

    if (uploadFile.size > 5242880) { // 5MB limit
      showAlert("File exceeds 5MB limit.", "error");
      return false;
    }

    setUploadState("uploading");

    try {
      const token = getToken();
      const cloudinaryData = await uploadToCloudinary(uploadFile);

      setUploadState("saving");

      const payload = {
        fileUrl: cloudinaryData.secure_url,
        publicId: cloudinaryData.public_id,
        resourceType: cloudinaryData.resource_type,
        format: cloudinaryData.format,
        bytes: cloudinaryData.bytes
      };

      await axios.post(
        `${backendUrl}/api/resume/${resumeId}/version`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } },
      );

      setUploadState("success");
      await loadWorkspace();

      setTimeout(() => {
        setUploadFile(null);
        setUploadPreviewUrl("");
        setIsUploadModalOpen(false);
        setUploadState("idle");
        showAlert("New version uploaded successfully.");
      }, 400);

      return true;
    } catch (error) {
      console.error(error);
      setUploadState("error");
      showAlert(error.response?.data?.message || "Upload failed. Please try again.", "error");
      return false;
    }
  };

  const handleSetActive = async (versionId) => {
    setRollingBackId(versionId);

    try {
      const token = getToken();
      await axios.post(
        `${backendUrl}/api/resume/${resumeId}/rollback/${versionId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } },
      );

      await loadWorkspace();
      showAlert("Active version updated.");
    } catch (error) {
      console.error(error);
      showAlert("Failed to update active version.", "error");
    } finally {
      setRollingBackId("");
    }
  };

  const handleDeleteVersion = async (versionId) => {
    setDeletingVersionId(versionId);

    try {
      const token = getToken();
      await axios.delete(
        `${backendUrl}/api/resume/${resumeId}/version/${versionId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      await loadWorkspace();
      showAlert("Version deleted.");
    } catch (error) {
      console.error(error);
      showAlert(
        error.response?.data?.message || "Failed to delete version.",
        "error",
      );
    } finally {
      setDeletingVersionId("");
    }
  };

  if (!user) return null;

  const publicPath = resume?.slug ? `/${user.username}/${resume.slug}` : "";
  const publicLink =
    typeof window !== "undefined" && publicPath
      ? `${window.location.origin}${publicPath}`
      : publicPath;

  const handleCopyLink = async () => {
    if (!publicLink) return;

    try {
      await navigator.clipboard.writeText(publicLink);
      setCopiedLink(true);
      if (copyTimeoutRef.current) {
        window.clearTimeout(copyTimeoutRef.current);
      }
      copyTimeoutRef.current = window.setTimeout(() => {
        setCopiedLink(false);
      }, 2000);
      showAlert("Link copied.");
    } catch (error) {
      console.error(error);
      showAlert("Failed to copy link.", "error");
    }
  };

  return (
    <div className="flex flex-col text-[#0A2540]/90 dark:text-[#f8fafc]/90">
      <div className="flex flex-col mx-auto w-full">
        {alertState ? (
          <Alert
            variant={alertState.type === "error" ? "destructive" : "default"}
            className={`fixed bottom-4 right-4 z-[160] w-[min(92vw,360px)] rounded-2xl border shadow-lg dark:shadow-none ${alertState.type === "error"
                ? "border-rose-200 dark:border-rose-900/20 bg-rose-50/90 dark:bg-rose-950/20 backdrop-blur-md dark:backdrop-blur-none text-rose-800 dark:text-rose-400"
                : "border-emerald-200 dark:border-emerald-900/20 bg-emerald-50/90 dark:bg-emerald-950/20 backdrop-blur-md dark:backdrop-blur-none text-emerald-800 dark:text-emerald-400"
              }`}
          >
            <AlertDescription className="flex items-center gap-2 font-medium">
              {alertState.type === "error" ? (
                <InfoIcon className="h-4 w-4 shrink-0 text-rose-600 dark:text-rose-400" />
              ) : (
                <CheckCircle2Icon className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
              )}
              <span>{alertState.message}</span>
            </AlertDescription>
          </Alert>
        ) : null}

        <section className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between mb-6 shrink-0">
          <div className="max-w-3xl relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <Link
                href="/dashboard/resumes"
                aria-label="Back to resumes"
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[#0A2540]/[0.08] dark:border-white/10 bg-white dark:bg-white/5 text-[#4B5E76] dark:text-[#a1a1aa] shadow-[0_1px_2px_rgba(10,37,64,0.03)] dark:shadow-none dark:shadow-none transition-all duration-150 hover:bg-[#0A2540]/[0.04] dark:hover:bg-white/10 hover:text-[#0A2540] dark:hover:text-[#f8fafc] hover:border-[#0A2540]/20 dark:hover:border-white/20 active:scale-95"
              >
                <IoIosArrowBack className="h-4 w-4 text-inherit" />
              </Link>
              <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-[#6B7280] dark:text-[#a1a1aa]">
                Resume Workspace
              </p>
            </div>

            <motion.h1
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-3xl font-extrabold tracking-tight text-[#0A2540]/90 dark:text-[#f8fafc]/90 sm:text-[2.5rem] leading-tight"
            >
              {resume?.title || "Resume"}
            </motion.h1>

            <div className="mt-3 flex items-center gap-2">
              <div className="rounded-lg border border-[#0A2540]/[0.06] dark:border-white/10 bg-[#0A2540]/[0.02] dark:bg-white/5 px-3 py-1.5">
                <p className="truncate font-mono text-[11px] text-[#4B5E76] dark:text-[#a1a1aa]">
                  {publicLink || "-"}
                </p>
              </div>
              <button
                type="button"
                onClick={handleCopyLink}
                title={copiedLink ? "Copied to clipboard!" : "Copy public link"}
                aria-label={copiedLink ? "Copied" : "Copy link"}
                className={`relative inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border transition-all duration-200 active:scale-95 ${copiedLink
                    ? "border-emerald-500/40 bg-emerald-50/90 text-emerald-600 shadow-sm dark:shadow-none dark:bg-emerald-500/10 dark:text-emerald-400"
                    : "border-[#0A2540]/[0.08] dark:border-white/10 bg-white dark:bg-white/5 text-[#4B5E76] dark:text-[#a1a1aa] shadow-[0_1px_2px_rgba(10,37,64,0.04)] dark:shadow-none dark:shadow-none hover:border-[#0A2540]/20 dark:hover:border-white/20 hover:bg-[#0A2540]/[0.04] dark:hover:bg-white/10 hover:text-[#0A2540] dark:hover:text-[#f8fafc]"
                  }`}
              >
                <AnimatePresence mode="wait" initial={false}>
                  {copiedLink ? (
                    <motion.div
                      key="check"
                      initial={{ scale: 0.6, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.6, opacity: 0 }}
                      transition={{ duration: 0.15 }}
                      className="flex items-center justify-center"
                    >
                      <Check className="h-3.5 w-3.5 stroke-[2.5]" />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="copy"
                      initial={{ scale: 0.6, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.6, opacity: 0 }}
                      transition={{ duration: 0.15 }}
                      className="flex items-center justify-center"
                    >
                      <Copy className="h-3.5 w-3.5" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </button>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="flex w-full gap-3 sm:w-auto relative z-10"
          >
            <button
              type="button"
              onClick={() => setIsUploadModalOpen(true)}
              className="group relative flex flex-1 items-center justify-center gap-2 rounded-xl px-6 py-2.5 text-[13.5px] font-semibold tracking-wide text-white shadow-[0_4px_14px_0_rgba(10,37,64,0.25)] dark:shadow-none transition-all duration-300 hover:shadow-[0_6px_20px_rgba(10,37,64,0.15)] dark:shadow-none active:scale-[0.97] sm:w-auto sm:flex-none overflow-hidden border border-white/10"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-[#0A2540] to-[#1a3857] dark:from-[#f8fafc]/10 dark:to-[#f8fafc]/5" />
              <div className="absolute inset-0 opacity-0 group-hover:opacity-20 bg-[radial-gradient(circle_at_top,white_0%,transparent_70%)] transition-opacity duration-500" />
              <div className="relative flex items-center gap-2 drop-shadow-sm dark:drop-shadow-none dark:shadow-none">
                <UploadIcon className="h-4 w-4" />
                <span>Upload New Version</span>
              </div>
            </button>
          </motion.div>
        </section>

        <section className="flex flex-col lg:flex-row gap-8">
          <aside className="w-full lg:w-[320px] xl:w-[360px] flex flex-col shrink-0">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#0A2540]/[0.08] dark:border-white/10">
              <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-[#6B7280] dark:text-[#a1a1aa]">
                Version history
              </p>
            </div>

            <div className="flex flex-col gap-3">
              {loading ? (
                <div className="flex min-h-[180px] items-center justify-center p-4">
                </div>
              ) : versions.length === 0 ? (
                <div className="p-8 text-center text-[13.5px] font-medium text-[#6B7280] dark:text-[#a1a1aa]">
                  No versions yet. Upload your first PDF.
                </div>
              ) : (
                versions.map((version) => {
                  const isActive = version._id === activeVersionId;
                  const isSelected = version._id === selectedVersionId;

                  return (
                    <div
                      key={version._id}
                      role="button"
                      tabIndex={0}
                      onClick={() => setSelectedVersionId(version._id)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault();
                          setSelectedVersionId(version._id);
                        }
                      }}
                      className={`group flex flex-col items-start rounded-xl border p-4 text-left transition-colors cursor-pointer ${isSelected
                          ? "bg-white dark:bg-[#16171b] border-[#0A2540] dark:border-white/50 shadow-[0_2px_12px_rgba(10,37,64,0.08)] dark:shadow-none dark:shadow-none"
                          : "bg-white dark:bg-white/5 border-[#0A2540]/[0.08] dark:border-white/10 shadow-[0_1px_3px_rgba(10,37,64,0.02)] dark:shadow-none dark:shadow-none hover:border-[#0A2540]/30 dark:hover:border-white/20 hover:shadow-md dark:shadow-none dark:hover:shadow-none dark:shadow-none"
                        }`}
                    >
                      <div className="flex w-full items-center justify-between gap-2">
                        <p className={`text-[1.05rem] font-medium ${isSelected ? "text-[#0A2540]/90 dark:text-[#f8fafc]/90" : "text-[#4B5E76] dark:text-[#a1a1aa] group-hover:text-[#0A2540] dark:group-hover:text-[#f8fafc]"}`}>
                          v{version.versionNumber}
                        </p>
                        <span
                          className={`px-2.5 py-0.5 rounded-md text-[10px] font-semibold uppercase tracking-wider ${isActive
                              ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20"
                              : "bg-[#0A2540]/[0.03] dark:bg-white/10 text-[#6B7280] dark:text-[#a1a1aa] border border-[#0A2540]/[0.06] dark:border-white/10"
                            }`}
                        >
                          {isActive ? "ACTIVE" : "idle"}
                        </span>
                      </div>

                      <p className="mt-1 text-[12px] font-medium text-[#6B7280] dark:text-[#a1a1aa]">
                        {new Date(version.createdAt).toLocaleString()}
                      </p>

                      <div className="mt-4 flex w-full gap-2">
                        {!isActive ? (
                          <button
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation();
                              handleSetActive(version._id);
                            }}
                            disabled={rollingBackId === version._id}
                            className="flex-1 rounded-lg border border-[#0A2540]/[0.12] dark:border-white/10 bg-white dark:bg-white/5 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-[#4B5E76] dark:text-[#a1a1aa] shadow-[0_1px_2px_rgba(10,37,64,0.04)] dark:shadow-none dark:shadow-none transition hover:bg-[#0A2540]/[0.02] dark:hover:bg-white/10 hover:text-[#0A2540] dark:hover:text-[#f8fafc] disabled:opacity-60"
                          >
                            {rollingBackId === version._id
                              ? "Switching..."
                              : "Set Active"}
                          </button>
                        ) : (
                          <span className="flex-1 rounded-lg border border-emerald-200 dark:border-emerald-500/20 bg-emerald-50 dark:bg-emerald-500/10 px-3 py-1.5 text-center text-[11px] font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-400">
                            Serving public link
                          </span>
                        )}

                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            handleDeleteVersion(version._id);
                          }}
                          disabled={deletingVersionId === version._id}
                          className="inline-flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-lg border border-rose-200 dark:border-rose-900/50 bg-rose-50 dark:bg-rose-900/10 text-rose-600 dark:text-rose-400 transition hover:bg-rose-100 dark:hover:bg-rose-900/30 disabled:opacity-60"
                          title="Delete version"
                        >
                          {deletingVersionId === version._id ? (
                            "..."
                          ) : (
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              className="h-3.5 w-3.5"
                            >
                              <path d="M3 6h18" />
                              <path d="M8 6V4h8v2" />
                              <path d="M19 6l-1 14H6L5 6" />
                              <path d="M10 11v6" />
                              <path d="M14 11v6" />
                            </svg>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </aside>

          <div className="relative flex-1 h-[1150px] rounded-2xl border border-[#0A2540]/[0.08] dark:border-white/10 bg-[#0A2540]/[0.02] dark:bg-white/5 overflow-hidden shadow-sm dark:shadow-none">
            <div className="absolute top-4 left-4 right-4 z-10 flex flex-wrap items-start justify-between gap-3 pointer-events-none">
              <div className="flex items-center gap-2 pointer-events-auto">
                {selectedVersion ? (
                  <div className="flex items-center gap-2 rounded-xl border border-[#0A2540]/[0.08] dark:border-white/10 bg-white/90 dark:bg-[#16171b]/90 px-3 py-1.5 shadow-sm dark:shadow-none backdrop-blur-md dark:backdrop-blur-none">
                    <div className={`h-2 w-2 rounded-full ${activeVersion && activeVersion._id === selectedVersion._id ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] dark:shadow-none" : "bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)] dark:shadow-none"}`} />
                    <span className="text-[12px] font-semibold text-[#0A2540]/90 dark:text-[#f8fafc]/90">
                      Previewing v{selectedVersion.versionNumber}
                    </span>
                  </div>
                ) : null}
              </div>

              {activeVersion && selectedVersion && activeVersion._id !== selectedVersion._id ? (
                <div className="rounded-xl border border-rose-200 dark:border-rose-900/50 bg-rose-50/95 dark:bg-rose-950/95 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-rose-700 dark:text-rose-400 shadow-sm dark:shadow-none backdrop-blur-md dark:backdrop-blur-none pointer-events-auto">
                  Not Public
                </div>
              ) : null}
            </div>

            <div className="h-full w-full">
              {selectedVersion?.fileUrl ? (
                <iframe
                  title="Resume PDF Preview"
                  src={selectedVersion.fileUrl}
                  className="h-full w-full border-none bg-white"
                />
              ) : (
                <div className="flex h-full items-center justify-center p-6 text-center text-[13.5px] font-medium text-[#6B7280] dark:text-[#a1a1aa]">
                  Select a version from the left to preview the full resume.
                </div>
              )}
            </div>
          </div>
        </section>

        {isUploadModalOpen ? (
          <div className="fixed inset-0 z-[120] flex items-end justify-center bg-[#0A2540]/40 dark:bg-[#000]/60 px-0 py-0 backdrop-blur-sm dark:backdrop-blur-none sm:items-center sm:px-4 sm:py-6">
            <div className="w-full max-w-xl rounded-2xl border border-[#0A2540]/10 dark:border-white/10 bg-white dark:bg-[#16171b] p-6 shadow-2xl dark:shadow-none">
              <div className="flex items-center justify-between gap-3 border-b border-[#0A2540]/[0.06] dark:border-white/10 pb-4 mb-4">
                <div>
                  <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-[#6B7280] dark:text-[#a1a1aa]">
                    Upload New Version
                  </p>
                  <h3 className="mt-1 text-lg font-medium text-[#0A2540]/90 dark:text-[#f8fafc]/90">
                    {resume?.title || "Resume"}
                  </h3>
                </div>
                <button
                  type="button"
                  disabled={uploadState !== "idle" && uploadState !== "error"}
                  onClick={() => {
                    setIsUploadModalOpen(false);
                    setUploadFile(null);
                    setUploadPreviewUrl("");
                  }}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[#0A2540]/[0.08] dark:border-white/10 bg-white dark:bg-white/5 text-[#4B5E76] dark:text-[#a1a1aa] transition hover:bg-[#0A2540]/[0.03] dark:hover:bg-white/10 disabled:opacity-50"
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
              </div>

              <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[#0A2540]/15 dark:border-white/20 bg-[#0A2540]/[0.02] dark:bg-white/5 p-8 text-center transition hover:border-[#0A2540]/30 dark:hover:border-white/30 hover:bg-[#0A2540]/[0.04] dark:hover:bg-white/10">
                <input
                  type="file"
                  accept="application/pdf"
                  className="hidden"
                  onChange={(event) => {
                    setUploadFile(event.target.files?.[0] || null);
                  }}
                />
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#0A2540]/[0.05] dark:bg-white/10 mb-3">
                  <UploadIcon className="h-5 w-5 text-[#0A2540]/90 dark:text-[#f8fafc]/90" />
                </div>
                {uploadFile ? (
                  <>
                    <span className="font-medium text-[#0A2540]/90 dark:text-[#f8fafc]/90">
                      {uploadFile.name}
                    </span>
                    <span className="mt-1 text-[13px] font-medium text-[#6B7280] dark:text-[#a1a1aa]">
                      {(uploadFile.size / 1024 / 1024).toFixed(2)} MB
                    </span>
                  </>
                ) : (
                  <>
                    <span className="font-medium text-[#0A2540]/90 dark:text-[#f8fafc]/90">Click to select PDF</span>
                    <span className="mt-1 text-[13px] font-medium text-[#6B7280] dark:text-[#a1a1aa]">or drag and drop here</span>
                  </>
                )}
              </label>

              {uploadPreviewUrl ? (
                <div className="mt-4 h-44 overflow-hidden rounded-xl border border-[#0A2540]/[0.08] dark:border-white/10 bg-white">
                  <iframe
                    title="Selected PDF preview"
                    src={uploadPreviewUrl}
                    className="h-full w-full"
                  />
                </div>
              ) : null}

              <div className="mt-6 flex gap-3">
                <button
                  type="button"
                  disabled={uploadState !== "idle" && uploadState !== "error"}
                  onClick={() => {
                    setIsUploadModalOpen(false);
                    setUploadFile(null);
                    setUploadPreviewUrl("");
                  }}
                  className="flex-1 rounded-xl border border-[#0A2540]/[0.12] dark:border-white/10 bg-white dark:bg-white/5 px-4 py-2.5 text-sm font-medium text-[#4B5E76] dark:text-[#a1a1aa] shadow-sm dark:shadow-none transition hover:bg-[#0A2540]/[0.02] dark:hover:bg-white/10 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    await handleUploadVersion();
                  }}
                  disabled={(uploadState !== "idle" && uploadState !== "error") || !uploadFile}
                  className="flex-1 rounded-xl bg-[#0A2540] dark:bg-[#f8fafc]/10 px-4 py-2.5 text-sm font-medium text-white dark:text-[#f8fafc] shadow-sm dark:shadow-none transition hover:bg-[#113155] dark:hover:bg-[#f8fafc]/20 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {uploadState === "uploading" ? (
                    "Uploading PDF..."
                  ) : uploadState === "saving" ? (
                    "Saving version..."
                  ) : uploadState === "success" ? (
                    <span className="flex items-center justify-center gap-1.5 text-emerald-400">
                      Uploaded successfully
                    </span>
                  ) : (
                    "Upload Version"
                  )}
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
