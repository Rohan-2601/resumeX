"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import { Playfair_Display, Sora } from "next/font/google";
import { useAuth } from "../../../context/AuthContext";
import { UploadIcon } from "../../../components/icons/Icons";
import { ArrowLeftIcon, CheckCircle2Icon, InfoIcon } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

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
    <div
      className={`${sansFont.className} relative min-h-[100dvh] bg-[#e9e1d0] px-4 py-6 text-[#1f1b16] sm:px-6 md:px-8`}
    >
      <div className="pointer-events-none absolute -top-24 left-10 h-72 w-72 rounded-full bg-white/50 blur-3xl" />
      <div className="pointer-events-none absolute right-4 top-24 h-96 w-96 rounded-full bg-[#d7c0a0]/35 blur-3xl" />

      <div className="relative mx-auto max-w-[1600px] space-y-2">
        {alertState ? (
          <Alert
            variant={alertState.type === "error" ? "destructive" : "default"}
            className={`fixed bottom-4 right-4 z-[160] w-[min(92vw,360px)] rounded-xl border shadow-[0_20px_50px_-30px_rgba(0,0,0,0.65)] ${
              alertState.type === "error"
                ? "border-rose-500/40 bg-[#1b1314] text-rose-100"
                : "border-emerald-500/40 bg-[#141815] text-emerald-100"
            }`}
          >
            <AlertDescription className="flex items-center gap-2">
              {alertState.type === "error" ? (
                <InfoIcon className="h-4 w-4 shrink-0 text-rose-400" />
              ) : (
                <CheckCircle2Icon className="h-4 w-4 shrink-0 text-emerald-400" />
              )}
              <span>{alertState.message}</span>
            </AlertDescription>
          </Alert>
        ) : null}

        <section className="grid min-h-[84dvh] grid-cols-1 gap-3 lg:grid-cols-[40%_60%]">
          <aside className="space-y-5 border-b border-black/10 pb-5 lg:border-b-0 lg:border-r lg:pb-0 lg:pr-5">
            <div className="space-y-2 border-b border-black/10 pb-3">
              <div className="flex items-center gap-2">
                <Link
                  href="/dashboard/resumes"
                  aria-label="Back to resumes"
                  className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-black/10 bg-white/75 text-[#5f5144] transition hover:bg-white"
                >
                  <ArrowLeftIcon className="h-3.5 w-3.5" />
                </Link>
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#7b5a3d]">
                  Resume workspace
                </p>
              </div>
              <h1 className="text-xl font-semibold tracking-tight text-[#211911] sm:text-2xl">
                {resume?.title || "Resume"}
                <span
                  className={`${displayFont.className} ml-2 text-base italic text-[#7b5a3d]`}
                ></span>
              </h1>

              <div className="flex items-center gap-2">
                <p className="truncate font-mono text-xs text-[#6b5b4a]">
                  {publicLink || "-"}
                </p>
                <button
                  type="button"
                  onClick={handleCopyLink}
                  title="Copy public link"
                  className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-black/10 bg-white/85 text-[#5f5144] transition hover:bg-white"
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

              <button
                type="button"
                onClick={() => setIsUploadModalOpen(true)}
                className="inline-flex items-center gap-2 rounded-md bg-[#241c16] px-3 py-1.5 text-xs font-bold uppercase tracking-[0.14em] text-[#f6ebd7] transition hover:bg-[#17110c]"
              >
                <UploadIcon />
                Upload New Version
              </button>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#7b5a3d]">
                Version history
              </p>

              <div className="mt-3 max-h-[66dvh] space-y-2 overflow-y-auto pr-1">
                {loading ? (
                  <div className="flex min-h-[180px] items-center justify-center">
                    <div className="flex items-center gap-3 rounded-full border border-black/10 bg-[linear-gradient(180deg,rgba(251,247,238,0.92)_0%,rgba(242,233,218,0.9)_100%)] px-5 py-3 text-sm font-medium text-[#5f5144] shadow-[0_20px_60px_-40px_rgba(0,0,0,0.5)]">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#d7c6aa] border-t-[#7b5a3d]" />
                      Loading versions...
                    </div>
                  </div>
                ) : versions.length === 0 ? (
                  <div className="rounded-xl border border-black/10 bg-white/75 p-5 text-center text-sm text-[#5f5144]">
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
                        className={`border p-3 text-left transition ${
                          isSelected
                            ? "border-[#8a6340]/40 bg-[#fff7ec]"
                            : "border-black/10 bg-white/75 hover:bg-white"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-sm font-semibold text-[#211911]">
                            v{version.versionNumber}
                          </p>
                          <span
                            className={`px-2 py-0.5 text-[11px] font-bold ${
                              isActive
                                ? "bg-[#e6f0e5] text-[#3f6b4d]"
                                : "bg-white/80 text-[#6b5b4a]"
                            }`}
                          >
                            {isActive ? "ACTIVE" : "idle"}
                          </span>
                        </div>

                        <p className="mt-1 text-xs text-[#6b5b4a]">
                          {new Date(version.createdAt).toLocaleString()}
                        </p>

                        <div className="mt-2 flex gap-2">
                          {!isActive ? (
                            <button
                              type="button"
                              onClick={(event) => {
                                event.stopPropagation();
                                handleSetActive(version._id);
                              }}
                              disabled={rollingBackId === version._id}
                              className="rounded-md border border-black/10 bg-white px-2 py-1 text-[11px] font-semibold text-[#5f5144] transition hover:bg-[#f7f2ea] disabled:opacity-60"
                            >
                              {rollingBackId === version._id
                                ? "Switching..."
                                : "Set Active"}
                            </button>
                          ) : (
                            <span className="flex-1 border border-emerald-900/15 bg-emerald-50 px-2 py-1.5 text-center text-xs font-semibold text-emerald-800">
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
                            className="inline-flex items-center justify-center rounded-md border border-rose-900/25 bg-rose-50 px-2 py-1 text-rose-700 transition hover:bg-rose-100 disabled:opacity-60"
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
                                className="h-4 w-4"
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
            </div>
          </aside>

          <div className="h-full lg:sticky lg:top-2 lg:self-start lg:pl-2">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#7b5a3d]">
                  Full resume preview
                </p>
                <h2 className="mt-1 text-lg font-semibold text-[#211911]">
                  {selectedVersion
                    ? `Previewing v${selectedVersion.versionNumber}`
                    : "Select a version"}
                </h2>
              </div>

              {activeVersion && selectedVersion ? (
                <span className="border border-black/10 bg-white px-2.5 py-1 text-xs font-semibold text-[#5f5144]">
                  Active: v{activeVersion.versionNumber}
                </span>
              ) : null}
            </div>

            <div className="h-[86dvh] overflow-hidden border border-black/10 bg-white/75">
              {selectedVersion?.fileUrl ? (
                <iframe
                  title="Resume PDF Preview"
                  src={selectedVersion.fileUrl}
                  className="h-full w-full"
                />
              ) : (
                <div className="flex h-full items-center justify-center p-6 text-center text-sm text-[#5f5144]">
                  Select a version from the left to preview the full resume.
                </div>
              )}
            </div>

            {activeVersion &&
            selectedVersion &&
            activeVersion._id !== selectedVersion._id ? (
              <p className="mt-2 text-xs text-[#7b5a3d]">
                You are previewing v{selectedVersion.versionNumber}. Public link
                is serving v{activeVersion.versionNumber}.
              </p>
            ) : null}
          </div>
        </section>

        {isUploadModalOpen ? (
          <div className="fixed inset-0 z-[120] flex items-end justify-center bg-black/40 px-0 py-0 backdrop-blur-sm sm:items-center sm:px-4 sm:py-6">
            <div className="w-full max-w-xl border border-black/10 bg-[linear-gradient(180deg,rgba(251,247,238,0.98)_0%,rgba(242,233,218,0.98)_100%)] p-5 shadow-[0_28px_90px_-35px_rgba(0,0,0,0.6)]">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#7b5a3d]">
                    Upload New Version
                  </p>
                  <h3 className="mt-1 text-lg font-semibold text-[#211911]">
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
                  className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-black/10 bg-white/75 text-[#5f5144]"
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

              <label className="mt-4 flex cursor-pointer flex-col border border-dashed border-black/20 bg-white/70 p-3 text-sm text-[#5f5144] transition hover:border-[#8a6340]/45 hover:bg-white">
                <input
                  type="file"
                  accept="application/pdf"
                  className="hidden"
                  onChange={(event) => {
                    setUploadFile(event.target.files?.[0] || null);
                  }}
                />
                {uploadFile ? (
                  <>
                    <span className="font-semibold text-[#211911]">
                      {uploadFile.name}
                    </span>
                    <span className="mt-1 text-xs text-[#6b5b4a]">
                      {(uploadFile.size / 1024 / 1024).toFixed(2)} MB
                    </span>
                  </>
                ) : (
                  <span>Select PDF file</span>
                )}
              </label>

              {uploadPreviewUrl ? (
                <div className="mt-3 h-44 overflow-hidden border border-black/10 bg-white">
                  <iframe
                    title="Selected PDF preview"
                    src={uploadPreviewUrl}
                    className="h-full w-full"
                  />
                </div>
              ) : null}

              <div className="mt-4 flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsUploadModalOpen(false);
                    setUploadFile(null);
                    setUploadPreviewUrl("");
                  }}
                  className="flex-1 rounded-md border border-black/10 bg-white/75 px-3 py-2 text-sm font-semibold text-[#5f5144]"
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
                  className="flex-1 rounded-md bg-[#241c16] px-3 py-2 text-sm font-semibold text-[#f6ebd7] disabled:cursor-not-allowed disabled:opacity-50"
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
