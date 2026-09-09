"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import { Playfair_Display, Sora } from "next/font/google";
import { useAuth } from "../../../context/AuthContext";
import { UploadIcon } from "../../../components/icons/Icons";
import { CheckCircle2Icon, InfoIcon } from "lucide-react";
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

export default function ResumeWorkspacePage() {
  const params = useParams();
  const resumeId = params?.resumeId;
  const { user } = useAuth();

  const [resume, setResume] = useState(null);
  const [versions, setVersions] = useState([]);
  const [activeVersionId, setActiveVersionId] = useState("");
  const [selectedVersionId, setSelectedVersionId] = useState("");

  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [rollingBackId, setRollingBackId] = useState("");
  const [deletingVersionId, setDeletingVersionId] = useState("");
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [alertState, setAlertState] = useState(null);

  const [uploadFile, setUploadFile] = useState(null);
  const [uploadPreviewUrl, setUploadPreviewUrl] = useState("");
  const alertTimeoutRef = useRef(null);

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

  const handleUploadVersion = async () => {
    if (!uploadFile) {
      showAlert("Please select a PDF first.", "error");
      return false;
    }

    if (uploadFile.type !== "application/pdf") {
      showAlert("Only PDF files are allowed.", "error");
      return false;
    }

    setUploading(true);

    try {
      const token = getToken();
      const fileUrl = await uploadToCloudinary(uploadFile);
      await axios.post(
        `${backendUrl}/api/resume/${resumeId}/version`,
        { fileUrl },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      setUploadFile(null);
      setUploadPreviewUrl("");
      await loadWorkspace();
      showAlert("New version uploaded successfully.");
      return true;
    } catch (error) {
      console.error(error);
      showAlert("Upload failed. Please try again.", "error");
      return false;
    } finally {
      setUploading(false);
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
      showAlert("Link copied.");
    } catch (error) {
      console.error(error);
      showAlert("Failed to copy link.", "error");
    }
  };

  return (
    <div className={`${sansFont.className} flex-1 flex flex-col p-4 sm:p-6 lg:p-8 text-[#0A2540] min-h-0`}>
      <div className="flex flex-col flex-1 mx-auto w-full min-h-0">
        {alertState ? (
          <Alert
            variant={alertState.type === "error" ? "destructive" : "default"}
            className={`fixed bottom-4 right-4 z-[160] w-[min(92vw,360px)] rounded-2xl border shadow-lg ${
              alertState.type === "error"
                ? "border-rose-200 bg-rose-50/90 backdrop-blur-md text-rose-800"
                : "border-emerald-200 bg-emerald-50/90 backdrop-blur-md text-emerald-800"
            }`}
          >
            <AlertDescription className="flex items-center gap-2 font-medium">
              {alertState.type === "error" ? (
                <InfoIcon className="h-4 w-4 shrink-0 text-rose-600" />
              ) : (
                <CheckCircle2Icon className="h-4 w-4 shrink-0 text-emerald-600" />
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
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[#0A2540]/[0.08] bg-transparent text-[#4B5E76] transition hover:bg-[#0A2540]/[0.03]"
              >
                <IoIosArrowBack className="h-4 w-4" />
              </Link>
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#6B7280]">
                Resume Workspace
              </p>
            </div>
            
            <motion.h1 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-3xl font-extrabold tracking-tight text-[#0A2540] sm:text-[2.5rem] leading-tight"
            >
              {resume?.title || "Resume"}
            </motion.h1>
            
            <div className="mt-3 flex items-center gap-2">
              <div className="rounded-lg border border-[#0A2540]/[0.06] bg-[#0A2540]/[0.02] px-3 py-1.5">
                <p className="truncate font-mono text-[11px] text-[#4B5E76]">
                  {publicLink || "-"}
                </p>
              </div>
              <button
                type="button"
                onClick={handleCopyLink}
                title="Copy public link"
                className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[#0A2540]/[0.08] bg-white text-[#4B5E76] shadow-[0_1px_2px_rgba(10,37,64,0.04)] transition hover:bg-[#0A2540]/[0.02] hover:text-[#0A2540]"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  className="h-4 w-4"
                >
                  <rect x="9" y="9" width="11" height="11" rx="2" />
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                </svg>
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
              className="group flex flex-1 items-center justify-center gap-2 rounded-xl border border-transparent bg-[#0A2540] px-5 py-2.5 text-sm font-medium tracking-wide text-white shadow-sm transition-all hover:bg-[#113155] active:scale-[0.98] sm:w-auto sm:flex-none"
            >
              <UploadIcon className="h-4 w-4" />
              Upload New Version
            </button>
          </motion.div>
        </section>

        <section className="flex flex-col lg:flex-row flex-1 min-h-0 overflow-hidden rounded-2xl border border-[#0A2540]/[0.08] bg-white shadow-sm">
          <aside className="w-full lg:w-[340px] xl:w-[380px] flex flex-col border-b border-[#0A2540]/[0.08] lg:border-b-0 lg:border-r bg-[#0A2540]/[0.01]">
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#0A2540]/[0.08] bg-white">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#6B7280]">
                Version history
              </p>
            </div>

            <div className="flex-1 overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
              {loading ? (
                <div className="flex min-h-[180px] items-center justify-center p-4">
                  <div className="flex items-center gap-3 rounded-2xl border border-[#0A2540]/[0.08] bg-white px-5 py-4 text-sm font-medium text-[#4B5E76] shadow-sm">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#E5E7E3] border-t-[#0A2540]" />
                    Loading versions...
                  </div>
                </div>
              ) : versions.length === 0 ? (
                <div className="p-8 text-center text-[13.5px] font-medium text-[#6B7280]">
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
                      className={`group flex flex-col items-start border-b border-[#0A2540]/[0.06] last:border-0 p-5 text-left transition-colors cursor-pointer ${
                        isSelected
                          ? "bg-white border-l-2 border-l-[#0A2540]"
                          : "hover:bg-white/60 border-l-2 border-l-transparent"
                      }`}
                    >
                      <div className="flex w-full items-center justify-between gap-2">
                        <p className={`text-[1.05rem] font-semibold ${isSelected ? "text-[#0A2540]" : "text-[#4B5E76] group-hover:text-[#0A2540]"}`}>
                          v{version.versionNumber}
                        </p>
                        <span
                          className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                            isActive
                              ? "bg-emerald-50 text-emerald-600 border border-emerald-200"
                              : "bg-[#0A2540]/[0.03] text-[#6B7280] border border-[#0A2540]/[0.06]"
                          }`}
                        >
                          {isActive ? "ACTIVE" : "idle"}
                        </span>
                      </div>

                      <p className="mt-1 text-[12px] font-medium text-[#6B7280]">
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
                            className="flex-1 rounded-lg border border-[#0A2540]/[0.12] bg-white px-3 py-1.5 text-[11px] font-bold uppercase tracking-wide text-[#4B5E76] shadow-[0_1px_2px_rgba(10,37,64,0.04)] transition hover:bg-[#0A2540]/[0.02] hover:text-[#0A2540] disabled:opacity-60"
                          >
                            {rollingBackId === version._id
                              ? "Switching..."
                              : "Set Active"}
                          </button>
                        ) : (
                          <span className="flex-1 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-center text-[11px] font-bold uppercase tracking-wide text-emerald-700">
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
                          className="inline-flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-lg border border-rose-200 bg-rose-50 text-rose-600 transition hover:bg-rose-100 disabled:opacity-60"
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

          <div className="relative flex-1 bg-[#0A2540]/[0.02] min-h-[60dvh] lg:min-h-0">
            <div className="absolute top-4 left-4 right-4 z-10 flex flex-wrap items-start justify-between gap-3 pointer-events-none">
              <div className="flex items-center gap-2 pointer-events-auto">
                {selectedVersion ? (
                  <div className="flex items-center gap-2 rounded-xl border border-[#0A2540]/[0.08] bg-white/90 px-3 py-1.5 shadow-sm backdrop-blur-md">
                    <div className={`h-2 w-2 rounded-full ${activeVersion && activeVersion._id === selectedVersion._id ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" : "bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]"}`} />
                    <span className="text-[12px] font-bold text-[#0A2540]">
                      Previewing v{selectedVersion.versionNumber}
                    </span>
                  </div>
                ) : null}
              </div>
              
              {activeVersion && selectedVersion && activeVersion._id !== selectedVersion._id ? (
                <div className="rounded-xl border border-rose-200 bg-rose-50/95 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-rose-700 shadow-sm backdrop-blur-md pointer-events-auto">
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
                <div className="flex h-full items-center justify-center p-6 text-center text-[13.5px] font-medium text-[#6B7280]">
                  Select a version from the left to preview the full resume.
                </div>
              )}
            </div>
          </div>
        </section>

        {isUploadModalOpen ? (
          <div className="fixed inset-0 z-[120] flex items-end justify-center bg-[#0A2540]/40 px-0 py-0 backdrop-blur-sm sm:items-center sm:px-4 sm:py-6">
            <div className="w-full max-w-xl rounded-2xl border border-[#0A2540]/10 bg-white p-6 shadow-2xl">
              <div className="flex items-center justify-between gap-3 border-b border-[#0A2540]/[0.06] pb-4 mb-4">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#6B7280]">
                    Upload New Version
                  </p>
                  <h3 className="mt-1 text-lg font-semibold text-[#0A2540]">
                    {resume?.title || "Resume"}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setIsUploadModalOpen(false);
                    setUploadFile(null);
                    setUploadPreviewUrl("");
                  }}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[#0A2540]/[0.08] bg-white text-[#4B5E76] transition hover:bg-[#0A2540]/[0.03]"
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

              <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[#0A2540]/15 bg-[#0A2540]/[0.02] p-8 text-center transition hover:border-[#0A2540]/30 hover:bg-[#0A2540]/[0.04]">
                <input
                  type="file"
                  accept="application/pdf"
                  className="hidden"
                  onChange={(event) => {
                    setUploadFile(event.target.files?.[0] || null);
                  }}
                />
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#0A2540]/[0.05] mb-3">
                  <UploadIcon className="h-5 w-5 text-[#0A2540]" />
                </div>
                {uploadFile ? (
                  <>
                    <span className="font-semibold text-[#0A2540]">
                      {uploadFile.name}
                    </span>
                    <span className="mt-1 text-[13px] font-medium text-[#6B7280]">
                      {(uploadFile.size / 1024 / 1024).toFixed(2)} MB
                    </span>
                  </>
                ) : (
                  <>
                    <span className="font-semibold text-[#0A2540]">Click to select PDF</span>
                    <span className="mt-1 text-[13px] font-medium text-[#6B7280]">or drag and drop here</span>
                  </>
                )}
              </label>

              {uploadPreviewUrl ? (
                <div className="mt-4 h-44 overflow-hidden rounded-xl border border-[#0A2540]/[0.08] bg-white">
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
                  onClick={() => {
                    setIsUploadModalOpen(false);
                    setUploadFile(null);
                    setUploadPreviewUrl("");
                  }}
                  className="flex-1 rounded-xl border border-[#0A2540]/[0.12] bg-white px-4 py-2.5 text-sm font-semibold text-[#4B5E76] shadow-sm transition hover:bg-[#0A2540]/[0.02]"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    const uploaded = await handleUploadVersion();
                    if (uploaded) {
                      setIsUploadModalOpen(false);
                    }
                  }}
                  disabled={uploading || !uploadFile}
                  className="flex-1 rounded-xl bg-[#0A2540] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#113155] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {uploading ? "Uploading..." : "Upload Version"}
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
