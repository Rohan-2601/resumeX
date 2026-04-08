"use client";

import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import { Playfair_Display, Sora } from "next/font/google";
import { ActivityIcon, UploadIcon } from "../../components/icons/Icons";

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

  const [selectedResumeId, setSelectedResumeId] = useState("");
  const [selectedResumeTitle, setSelectedResumeTitle] = useState("My Resume");
  const [resumes, setResumes] = useState([]);
  const [activeVersionId, setActiveVersionId] = useState("");
  const [versions, setVersions] = useState([]);
  const [selectedVersionId, setSelectedVersionId] = useState("");
  const [analytics, setAnalytics] = useState(null);

  const [loading, setLoading] = useState(true);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [rollingBackId, setRollingBackId] = useState("");
  const [deletingVersionId, setDeletingVersionId] = useState("");
  const [deletingResumeId, setDeletingResumeId] = useState("");
  const [deleteDialog, setDeleteDialog] = useState(null);
  const [message, setMessage] = useState("");
  const [copyMessage, setCopyMessage] = useState("");
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadMode, setUploadMode] = useState("version");
  const [uploadFile, setUploadFile] = useState(null);
  const [newResumeTitle, setNewResumeTitle] = useState("My Resume");
  const [newResumeSlug, setNewResumeSlug] = useState("");
  const [uploadNotice, setUploadNotice] = useState("");
  const [uploadPreviewUrl, setUploadPreviewUrl] = useState("");

  const selectedResume = useMemo(
    () => resumes.find((resume) => resume._id === selectedResumeId) || null,
    [resumes, selectedResumeId],
  );

  const publicLink = useMemo(() => {
    if (!user) return "";
    const slug = selectedResume?.slug;
    if (typeof window === "undefined") {
      return slug ? `/${user.username}/${slug}` : `/${user.username}`;
    }
    return slug
      ? `${window.location.origin}/${user.username}/${slug}`
      : `${window.location.origin}/${user.username}`;
  }, [selectedResume, user]);

  const selectedVersion = useMemo(
    () => versions.find((version) => version._id === selectedVersionId) || null,
    [versions, selectedVersionId],
  );

  const activeVersion = useMemo(
    () => versions.find((version) => version._id === activeVersionId) || null,
    [versions, activeVersionId],
  );

  const totalViews = analytics?.totalViews || 0;
  const isErrorMessage =
    /failed|unable|error|not found|not authorized|required|invalid/i.test(
      message,
    );

  const getToken = () => localStorage.getItem("token");

  useEffect(() => {
    if (!uploadFile) {
      setUploadPreviewUrl("");
      return undefined;
    }

    const objectUrl = URL.createObjectURL(uploadFile);
    setUploadPreviewUrl(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [uploadFile]);

  const fetchAnalytics = async () => {
    const token = getToken();
    if (!token) {
      setAnalytics(null);
      setAnalyticsLoading(false);
      return;
    }

    try {
      setAnalyticsLoading(true);
      const response = await axios.get(`${backendUrl}/api/analytics`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAnalytics(response.data);
    } catch (error) {
      console.error(error);
      setAnalytics(null);
    } finally {
      setAnalyticsLoading(false);
    }
  };

  const loadVersionsForResume = async (resume) => {
    if (!resume) {
      setVersions([]);
      setActiveVersionId("");
      setSelectedVersionId("");
      return;
    }

    setSelectedResumeTitle(resume.title || "My Resume");
    setActiveVersionId(
      resume.currentVersionId?._id || resume.currentVersionId || "",
    );

    const token = getToken();
    const versionsRes = await axios.get(
      `${backendUrl}/api/resume/${resume._id}/versions`,
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );

    const fetchedVersions = versionsRes.data.versions || [];
    setVersions(fetchedVersions);

    if (fetchedVersions.length > 0) {
      const active = fetchedVersions.find(
        (version) =>
          version._id ===
          (resume.currentVersionId?._id || resume.currentVersionId),
      );
      setSelectedVersionId(active ? active._id : fetchedVersions[0]._id);
    } else {
      setSelectedVersionId("");
    }
  };

  const loadResumeState = async () => {
    if (!user) return;

    setLoading(true);
    setMessage("");

    try {
      const token = getToken();
      const resumeRes = await axios.get(`${backendUrl}/api/resume/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const fetchedResumes = resumeRes.data.resumes || [];
      setResumes(fetchedResumes);

      const preferredResume =
        fetchedResumes.find((resume) => resume._id === selectedResumeId) ||
        fetchedResumes[0] ||
        null;

      setSelectedResumeId(preferredResume ? preferredResume._id : "");
      setSelectedResumeTitle(preferredResume?.title || "My Resume");
    } catch (error) {
      if (error.response?.status === 404) {
        setResumes([]);
        setVersions([]);
        setSelectedResumeId("");
        setSelectedResumeTitle("My Resume");
        setActiveVersionId("");
        setSelectedVersionId("");
      } else {
        console.error(error);
        setMessage("Unable to load resume data right now.");
        setAnalytics(null);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadResumeState();
  }, [user]);

  useEffect(() => {
    if (!user) return;

    const resume =
      resumes.find((item) => item._id === selectedResumeId) || null;
    loadVersionsForResume(resume).catch((error) => {
      console.error(error);
      setMessage("Unable to load versions right now.");
    });
  }, [resumes, selectedResumeId, user]);

  useEffect(() => {
    fetchAnalytics().catch((error) => {
      console.error(error);
      setAnalytics(null);
    });
  }, [user]);

  const openUploadModal = () => {
    setUploadMode("version");
    setUploadFile(null);
    setUploadPreviewUrl("");
    setNewResumeTitle(selectedResumeTitle || "My Resume");
    setNewResumeSlug(selectedResume?.slug || "");
    setUploadNotice("");
    setIsUploadModalOpen(true);
  };

  const openNewResumeModal = () => {
    setUploadMode("new");
    setUploadFile(null);
    setUploadPreviewUrl("");
    setNewResumeTitle("My Resume");
    setNewResumeSlug("");
    setUploadNotice("");
    setIsUploadModalOpen(true);
  };

  const createResume = async () => {
    const titleValue = newResumeTitle.trim() || "My Resume";
    const slugValue = newResumeSlug.trim();

    if (!slugValue) {
      setMessage("Enter a slug for the new resume.");
      return null;
    }

    try {
      const token = getToken();
      const createRes = await axios.post(
        `${backendUrl}/api/resume`,
        { title: titleValue, slug: slugValue },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      const resume = createRes.data.resume;
      setResumes((previous) => {
        const next = previous.filter((item) => item._id !== resume._id);
        return [resume, ...next];
      });
      setSelectedResumeId(resume._id);
      setSelectedResumeTitle(resume.title || titleValue);
      setNewResumeTitle(resume.title || titleValue);
      setNewResumeSlug("");
      setMessage(`Created /${user.username}/${resume.slug}`);
      return resume;
    } catch (error) {
      console.error(error);
      setMessage(error.response?.data?.message || "Failed to create resume.");
      return null;
    }
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

  const handleUpload = async () => {
    if (!uploadFile) {
      setUploadNotice("Select a PDF first.");
      return;
    }

    if (uploadFile.type !== "application/pdf") {
      setUploadNotice("Only PDF files are allowed.");
      return;
    }

    setUploading(true);
    setUploadNotice("");

    try {
      let resumeId = selectedResumeId;

      if (uploadMode === "new" || !resumeId) {
        const createdResume = await createResume();
        if (!createdResume) {
          return;
        }
        resumeId = createdResume._id;
      }

      const fileUrl = await uploadToCloudinary(uploadFile);
      const token = getToken();

      const versionRes = await axios.post(
        `${backendUrl}/api/resume/${resumeId}/version`,
        { fileUrl },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      const newVersion = versionRes.data.version;
      setVersions((previous) => [newVersion, ...previous]);
      setActiveVersionId(newVersion._id);
      setSelectedVersionId(newVersion._id);
      setMessage(`Uploaded v${newVersion.versionNumber}. It is now ACTIVE.`);
      setIsUploadModalOpen(false);
      setUploadFile(null);
      setUploadPreviewUrl("");
      await fetchAnalytics();
    } catch (error) {
      console.error(error);
      setUploadNotice("Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleRollback = async (versionId) => {
    if (!selectedResumeId) return;

    setRollingBackId(versionId);
    setMessage("");

    try {
      const token = getToken();
      await axios.post(
        `${backendUrl}/api/resume/${selectedResumeId}/rollback/${versionId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } },
      );

      setActiveVersionId(versionId);
      setSelectedVersionId(versionId);
      const version = versions.find((item) => item._id === versionId);
      setMessage(
        version
          ? `Rolled back to v${version.versionNumber}. It is now ACTIVE.`
          : "Rollback complete.",
      );
      await fetchAnalytics();
    } catch (error) {
      console.error(error);
      setMessage("Rollback failed. Please try again.");
    } finally {
      setRollingBackId("");
    }
  };

  const handleDeleteVersion = (versionId) => {
    if (!selectedResumeId || !versionId) return;

    const versionToDelete = versions.find((item) => item._id === versionId);
    if (!versionToDelete) return;

    setDeleteDialog({
      kind: "version",
      versionId,
      label: `v${versionToDelete.versionNumber}`,
    });
  };

  const performDeleteVersion = async (versionId) => {
    if (!selectedResumeId || !versionId) return;

    setDeletingVersionId(versionId);
    setMessage("");

    try {
      const token = getToken();
      await axios.delete(
        `${backendUrl}/api/resume/${selectedResumeId}/version/${versionId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      await loadResumeState();
      setMessage(`Deleted v${versionToDelete.versionNumber}.`);
      await fetchAnalytics();
    } catch (error) {
      console.error(error);
      setMessage(error.response?.data?.message || "Failed to delete version.");
    } finally {
      setDeletingVersionId("");
    }
  };

  const copyPublicLink = async () => {
    try {
      await navigator.clipboard.writeText(publicLink);
      setCopyMessage("Link copied.");
      window.setTimeout(() => setCopyMessage(""), 1800);
    } catch (error) {
      console.error(error);
      setCopyMessage("Copy failed.");
    }
  };

  const handleDeleteResume = (resumeId) => {
    if (!resumeId) return;

    const resumeToDelete = resumes.find((resume) => resume._id === resumeId);
    if (!resumeToDelete) return;

    setDeleteDialog({
      kind: "resume",
      resumeId,
      label: resumeToDelete.title,
    });
  };

  const performDeleteResume = async (resumeId) => {
    if (!resumeId) return;

    setDeletingResumeId(resumeId);
    setMessage("");

    try {
      const token = getToken();
      await axios.delete(`${backendUrl}/api/resume/${resumeId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      await loadResumeState();
      setMessage(`Deleted ${resumeToDelete.title}.`);
      await fetchAnalytics();
    } catch (error) {
      console.error(error);
      setMessage(error.response?.data?.message || "Failed to delete resume.");
    } finally {
      setDeletingResumeId("");
    }
  };

  if (!user) return null;

  return (
    <div
      className={`${sansFont.className} relative space-y-8 pb-8 text-[#1f1b16]`}
    >
      <div className="pointer-events-none absolute -top-24 left-10 h-72 w-72 rounded-full bg-white/50 blur-3xl" />
      <div className="pointer-events-none absolute right-4 top-24 h-96 w-96 rounded-full bg-[#d7c0a0]/35 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-[#f0e2c9]/50 blur-3xl" />

      {message && (
        <div
          className={`rounded-[1.25rem] border px-4 py-3 text-sm shadow-[0_18px_45px_-35px_rgba(0,0,0,0.45)] ${
            isErrorMessage
              ? "border-rose-900/20 bg-rose-50 text-rose-700"
              : "border-emerald-900/15 bg-emerald-50 text-emerald-800"
          }`}
        >
          {message}
        </div>
      )}

      <section className="grid grid-cols-1 items-start gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <div className="relative rounded-[1.9rem] border border-black/10 bg-[linear-gradient(135deg,rgba(248,242,231,0.96)_0%,rgba(238,228,211,0.96)_52%,rgba(232,219,193,0.96)_100%)] p-5 shadow-[0_24px_80px_-50px_rgba(0,0,0,0.55)] sm:p-6">
          <button
            type="button"
            onClick={loadResumeState}
            disabled={loading}
            aria-label="Refresh resumes"
            className="absolute right-5 top-5 inline-flex h-9 w-9 items-center justify-center rounded-full border border-black/10 bg-white/75 text-[#5f5144] transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-60 sm:right-6 sm:top-6"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
            >
              <path d="M21 12a9 9 0 1 1-3.1-6.8" />
              <path d="M21 3v6h-6" />
            </svg>
          </button>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.32em] text-[#7b5a3d]">
                Your resumes
              </p>
              <h1 className="mt-3 text-3xl font-semibold tracking-tight text-[#211911] sm:text-4xl">
                Pick a resume to inspect
                <span
                  className={`${displayFont.className} mt-2 block text-lg font-medium italic text-[#7b5a3d] sm:text-xl`}
                >
                  Click any resume to open its permanent link and version
                  history.
                </span>
              </h1>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={openNewResumeModal}
                className="inline-flex w-full items-center justify-center gap-2 whitespace-nowrap rounded-2xl bg-[#241c16] px-6 py-3 text-sm font-semibold text-[#f6ebd7] transition hover:bg-[#17110c] sm:w-auto sm:min-w-[220px]"
              >
                <UploadIcon />
                Upload new resume
              </button>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-3">
            <div className="rounded-2xl border border-black/10 bg-white/65 px-4 py-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#7b5a3d]">
                Resumes
              </p>
              <p className="mt-1 text-2xl font-semibold text-[#211911]">
                {resumes.length}
              </p>
            </div>
          </div>

          <div className="mt-5 space-y-3">
            {loading && (
              <div className="rounded-2xl border border-black/10 bg-white/65 p-4 text-sm text-[#5f5144]">
                Loading resumes...
              </div>
            )}

            {!loading && resumes.length === 0 && (
              <div className="rounded-2xl border border-black/10 bg-white/65 p-4 text-sm text-[#5f5144]">
                No resumes yet. Upload your first PDF or create a slugged
                resume.
              </div>
            )}

            {!loading &&
              resumes.map((resume) => {
                const isSelected = resume._id === selectedResumeId;

                return (
                  <div
                    key={resume._id}
                    role="button"
                    tabIndex={0}
                    onClick={() => setSelectedResumeId(resume._id)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        setSelectedResumeId(resume._id);
                      }
                    }}
                    className={`flex w-full cursor-pointer items-center justify-between gap-4 rounded-2xl border p-4 text-left transition ${
                      isSelected
                        ? "border-[#8a6340]/40 bg-[#fff7ec] shadow-[0_14px_30px_-24px_rgba(123,90,61,0.35)]"
                        : "border-black/10 bg-white/60 hover:border-black/15 hover:bg-white/80"
                    }`}
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-3">
                        <p className="truncate text-sm font-semibold text-[#211911]">
                          {resume.title}
                        </p>
                        {isSelected ? (
                          <span className="rounded-full bg-[#e6f0e5] px-2.5 py-1 text-[11px] font-bold text-[#3f6b4d]">
                            OPEN
                          </span>
                        ) : null}
                      </div>
                      <p className="mt-1 truncate font-mono text-xs text-[#6b5b4a]">
                        /{user.username}/{resume.slug}
                      </p>
                    </div>

                    <div className="flex items-center gap-3 text-right text-xs text-[#6b5b4a]">
                      <p>{timeAgo(resume.updatedAt)}</p>
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          handleDeleteResume(resume._id);
                        }}
                        disabled={deletingResumeId === resume._id}
                        aria-label={`Delete ${resume.title}`}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-rose-900/25 bg-rose-50 text-rose-700 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {deletingResumeId === resume._id ? (
                          <span className="text-[10px] font-bold">...</span>
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
              })}
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-[1.75rem] border border-black/10 bg-[linear-gradient(180deg,rgba(251,247,238,0.95)_0%,rgba(242,233,218,0.9)_100%)] p-5 shadow-[0_20px_60px_-42px_rgba(0,0,0,0.42)] backdrop-blur">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#7b5a3d]">
                  Selected resume
                </p>
                <h2 className="mt-1 text-xl font-semibold text-[#211911]">
                  {selectedResumeTitle || "No resume selected"}
                </h2>
                <div className="mt-3 w-full rounded-2xl border border-black/10 bg-white px-3 py-2.5">
                  <p className="w-full overflow-x-auto whitespace-nowrap font-mono text-sm text-[#6b5b4a]">
                    {publicLink || `/${user.username}`}
                  </p>
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <button
                    onClick={copyPublicLink}
                    disabled={!publicLink}
                    className="w-full rounded-full border border-black/10 bg-white px-3.5 py-1.5 text-[11px] font-bold text-[#5f5144] transition hover:bg-[#f7f2ea] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                  >
                    {copyMessage === "Link copied." ? "Copied" : "Copy"}
                  </button>
                </div>
              </div>
              <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
                <button
                  onClick={openUploadModal}
                  disabled={!selectedResumeId}
                  className="inline-flex w-full items-center justify-center gap-2 whitespace-nowrap rounded-2xl border border-black/10 bg-white/75 px-6 py-3 text-sm font-semibold text-[#5f5144] transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto sm:min-w-[220px]"
                >
                  <UploadIcon />
                  Upload new version
                </button>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3 text-center text-[#1f1b16]">
              <div className="rounded-2xl border border-black/10 bg-white/55 px-3 py-3">
                <p className="text-[11px] uppercase tracking-[0.24em] text-[#7b5a3d]">
                  Active
                </p>
                <p className="mt-1 text-xl font-semibold">
                  {activeVersion ? `v${activeVersion.versionNumber}` : "-"}
                </p>
              </div>
              <div className="rounded-2xl border border-black/10 bg-white/55 px-3 py-3">
                <p className="text-[11px] uppercase tracking-[0.24em] text-[#7b5a3d]">
                  Views
                </p>
                <p className="mt-1 text-xl font-semibold">
                  {analyticsLoading ? "..." : totalViews}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-[1.75rem] border border-black/10 bg-[linear-gradient(180deg,rgba(251,247,238,0.95)_0%,rgba(242,233,218,0.9)_100%)] p-4 shadow-[0_20px_60px_-42px_rgba(0,0,0,0.42)] backdrop-blur">
            <div className="mb-4 flex items-center justify-between px-2">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#7b5a3d]">
                  Versions
                </p>
                <h3 className="mt-1 text-lg font-semibold text-[#211911]">
                  Version history
                </h3>
              </div>
            </div>

            <div className="max-h-[320px] space-y-3 overflow-y-auto pr-1">
              {!selectedResumeId && (
                <div className="rounded-2xl border border-black/10 bg-white/65 p-4 text-sm text-[#5f5144]">
                  Select a resume to see its versions.
                </div>
              )}

              {selectedResumeId && loading && (
                <div className="rounded-2xl border border-black/10 bg-white/65 p-4 text-sm text-[#5f5144]">
                  Loading versions...
                </div>
              )}

              {selectedResumeId && !loading && versions.length === 0 && (
                <div className="rounded-2xl border border-black/10 bg-white/65 p-4 text-sm text-[#5f5144]">
                  No versions yet. Upload the first PDF for this resume.
                </div>
              )}

              {selectedResumeId &&
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
                      className={`flex w-full cursor-pointer items-center justify-between rounded-2xl border p-4 text-left transition ${
                        isSelected
                          ? "border-[#8a6340]/40 bg-[#fff7ec] shadow-[0_14px_30px_-24px_rgba(123,90,61,0.35)]"
                          : "border-black/10 bg-white/60 hover:border-black/15 hover:bg-white/80"
                      }`}
                    >
                      <div>
                        <div className="flex items-center gap-3">
                          <p className="text-sm font-semibold text-[#211911]">
                            v{version.versionNumber}
                          </p>
                          {isActive ? (
                            <span className="rounded-full bg-[#e6f0e5] px-2.5 py-1 text-[11px] font-bold text-[#3f6b4d]">
                              ACTIVE
                            </span>
                          ) : (
                            <span className="rounded-full bg-white/70 px-2.5 py-1 text-[11px] font-bold text-[#6b5b4a]">
                              idle
                            </span>
                          )}
                        </div>
                        <p className="mt-1 text-xs text-[#6b5b4a]">
                          {new Date(version.createdAt).toLocaleString()}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        {!isActive ? (
                          <button
                            onClick={(event) => {
                              event.stopPropagation();
                              handleRollback(version._id);
                            }}
                            disabled={rollingBackId === version._id}
                            className="rounded-xl border border-black/10 px-3.5 py-2 text-xs font-semibold text-[#5f5144] transition hover:bg-white/70 disabled:opacity-60"
                          >
                            {rollingBackId === version._id
                              ? "Switching..."
                              : "Set Active"}
                          </button>
                        ) : (
                          <span className="text-xs font-medium text-[#3f6b4d]">
                            Currently serving live link
                          </span>
                        )}

                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            handleDeleteVersion(version._id);
                          }}
                          disabled={deletingVersionId === version._id}
                          aria-label={`Delete version ${version.versionNumber}`}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-rose-900/25 bg-rose-50 text-rose-700 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {deletingVersionId === version._id ? (
                            <span className="text-[10px] font-bold">...</span>
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
                })}
            </div>
          </div>

          <div className="rounded-[1.75rem] border border-black/10 bg-[linear-gradient(180deg,rgba(251,247,238,0.95)_0%,rgba(242,233,218,0.9)_100%)] p-4 shadow-[0_20px_60px_-42px_rgba(0,0,0,0.42)] backdrop-blur">
            <div className="mb-4 flex items-center justify-between px-2">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#7b5a3d]">
                  Preview
                </p>
                <h2 className="mt-1 text-lg font-semibold text-[#211911]">
                  Live PDF preview
                </h2>
              </div>
              <span className="rounded-full bg-white/70 px-3 py-1 text-xs font-semibold text-[#5f5144]">
                {selectedVersion
                  ? `v${selectedVersion.versionNumber}`
                  : "No file"}
              </span>
            </div>

            <div className="h-[560px] overflow-hidden rounded-[1.5rem] border border-black/10 bg-white/60">
              {selectedVersion?.fileUrl ? (
                <iframe
                  title="Resume PDF Preview"
                  src={selectedVersion.fileUrl}
                  className="h-full w-full"
                />
              ) : (
                <div className="flex h-full flex-col items-center justify-center p-6 text-center text-sm text-[#5f5144]">
                  <ActivityIcon />
                  <p className="mt-3 font-medium text-[#211911]">
                    Upload a PDF to see the live preview here.
                  </p>
                </div>
              )}
            </div>

            {activeVersion &&
              selectedVersion &&
              activeVersion._id !== selectedVersion._id && (
                <p className="mt-3 text-xs text-[#7b5a3d]">
                  Previewing v{selectedVersion.versionNumber}. Active public
                  link currently serves v{activeVersion.versionNumber}.
                </p>
              )}
          </div>
        </div>
      </section>

      {isUploadModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/35 px-0 py-0 backdrop-blur-sm sm:items-center sm:px-4 sm:py-6">
          <div className="relative h-[100dvh] w-full max-w-5xl overflow-y-auto rounded-none border border-black/10 bg-[linear-gradient(135deg,rgba(249,244,236,0.98)_0%,rgba(239,229,212,0.96)_50%,rgba(232,219,194,0.96)_100%)] shadow-[0_30px_120px_-40px_rgba(0,0,0,0.6)] sm:h-auto sm:max-h-[calc(100dvh-3rem)] sm:rounded-[2rem]">
            <button
              onClick={() => setIsUploadModalOpen(false)}
              className="absolute right-3 top-3 z-10 rounded-full border border-black/10 bg-white/70 px-3 py-2 text-sm font-bold text-[#5f5144] transition hover:bg-white sm:right-4 sm:top-4"
            >
              ×
            </button>

            <div className="grid grid-cols-1 lg:grid-cols-2">
              <div className="border-b border-black/10 bg-[linear-gradient(180deg,rgba(251,247,238,0.95)_0%,rgba(242,233,218,0.88)_100%)] p-4 sm:p-5 lg:border-b-0 lg:border-r">
                <div className="mb-4 flex items-center gap-3 text-[#211911]">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/70 text-[#5f5144]">
                    <UploadIcon />
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#7b5a3d]">
                      Upload resume
                    </p>
                    <h3 className="text-xl font-semibold">Choose a PDF</h3>
                  </div>
                </div>

                <label className="flex min-h-[32vh] cursor-pointer flex-col overflow-hidden rounded-[1.5rem] border border-dashed border-black/20 bg-white/55 p-4 transition hover:border-[#8a6340]/50 hover:bg-white/75 sm:min-h-[44vh]">
                  <input
                    type="file"
                    accept="application/pdf"
                    className="hidden"
                    onChange={(e) => {
                      const nextFile = e.target.files?.[0] || null;
                      setUploadNotice("");
                      setUploadFile(nextFile);
                    }}
                  />

                  {!uploadFile ? (
                    <div className="flex flex-1 items-center justify-center">
                      <div className="text-center text-[#211911]">
                        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-white/75 text-[#5f5144]">
                          <UploadIcon />
                        </div>
                        <p className="text-lg font-semibold">
                          Click to select PDF
                        </p>
                        <p className="mt-2 max-w-sm text-sm text-[#6b5b4a]">
                          Once selected, the left side will show the PDF preview
                          before upload.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex h-full flex-col gap-4 text-[#211911]">
                      <div className="rounded-2xl border border-black/10 bg-white/75 p-4">
                        <p className="text-sm font-semibold">
                          {uploadFile.name}
                        </p>
                        <p className="mt-1 text-xs text-[#6b5b4a]">
                          {(uploadFile.size / 1024 / 1024).toFixed(2)} MB • PDF
                          ready for upload
                        </p>
                      </div>

                      <div className="min-h-[24vh] flex-1 overflow-hidden rounded-[1.25rem] border border-black/10 bg-white sm:min-h-[32vh]">
                        <iframe
                          title="Selected PDF preview"
                          src={uploadPreviewUrl}
                          className="h-full w-full"
                        />
                      </div>
                    </div>
                  )}
                </label>
              </div>

              <div className="bg-[linear-gradient(180deg,rgba(251,247,238,0.9)_0%,rgba(242,233,218,0.85)_100%)] p-4 text-[#211911] sm:p-5">
                <div className="mb-5 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#7b5a3d]">
                      Details
                    </p>
                    <h3 className="mt-1 text-xl font-semibold">
                      {uploadMode === "new"
                        ? "New resume details"
                        : "Version upload details"}
                    </h3>
                  </div>
                </div>

                <div className="space-y-5">
                  {uploadMode === "new" ? (
                    <div className="space-y-3 rounded-[1.4rem] border border-black/10 bg-white/65 p-4">
                      <div>
                        <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.24em] text-[#7b5a3d]">
                          Resume title
                        </label>
                        <input
                          value={newResumeTitle}
                          onChange={(event) =>
                            setNewResumeTitle(event.target.value)
                          }
                          placeholder="e.g. Frontend Resume"
                          className="w-full rounded-2xl border border-black/10 bg-white/80 px-4 py-3 text-sm text-[#211911] outline-none transition placeholder:text-[#8b7a68] focus:border-[#8a6340]/60"
                        />
                      </div>

                      <div>
                        <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.24em] text-[#7b5a3d]">
                          Custom slug
                        </label>
                        <div className="flex flex-nowrap items-center gap-2 overflow-x-auto rounded-2xl border border-black/10 bg-white/80 px-4 py-3">
                          <span className="shrink-0 font-mono text-sm text-[#6b5b4a]">
                            /{user.username}/
                          </span>
                          <input
                            value={newResumeSlug}
                            onChange={(event) =>
                              setNewResumeSlug(event.target.value)
                            }
                            placeholder="frontend"
                            className="min-w-0 flex-1 bg-transparent text-sm text-[#211911] outline-none placeholder:text-[#8b7a68]"
                          />
                        </div>
                      </div>

                      <p className="text-xs text-[#6b5b4a]">
                        Use only letters, numbers, and dashes.
                      </p>
                    </div>
                  ) : (
                    <>
                      <div>
                        <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.24em] text-[#7b5a3d]">
                          Selected resume
                        </label>
                        <div className="rounded-2xl border border-black/10 bg-white/65 px-4 py-3 text-sm text-[#211911]">
                          <div className="font-semibold">
                            {selectedResumeTitle || "My Resume"}
                          </div>
                          <div className="mt-1 overflow-x-auto whitespace-nowrap font-mono text-xs text-[#6b5b4a]">
                            {publicLink || `/${user.username}`}
                          </div>
                        </div>
                      </div>

                      {/* <div className="rounded-[1.4rem] border border-black/10 bg-white/65 p-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#7b5a3d]">
                          Permanent link
                        </p>
                        <div className="mt-2 flex items-center justify-between gap-3 overflow-x-auto rounded-2xl border border-black/10 bg-white/80 px-4 py-3">
                          <span className="min-w-0 whitespace-nowrap font-mono text-sm text-[#211911]">
                            {publicLink || `/${user.username}`}
                          </span>
                          <button
                            onClick={copyPublicLink}
                            className="rounded-full bg-[#241c16] px-3 py-1.5 text-xs font-bold text-[#f6ebd7] transition hover:bg-[#17110c]"
                          >
                            {copyMessage === "Link copied." ? "Copied" : "Copy"}
                          </button>
                        </div>
                        <p className="mt-2 text-xs text-[#6b5b4a]">
                          Uploading a new PDF creates a new version and makes it
                          active.
                        </p>
                      </div> */}
                    </>
                  )}

                  {uploadNotice && (
                    <div className="rounded-2xl border border-rose-900/20 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                      {uploadNotice}
                    </div>
                  )}
                </div>

                <div className="mt-6 flex gap-3">
                  <button
                    onClick={() => setIsUploadModalOpen(false)}
                    className="flex-1 rounded-2xl border border-black/10 bg-white/70 px-4 py-3 text-sm font-semibold text-[#5f5144] transition hover:bg-white"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleUpload}
                    disabled={
                      uploading ||
                      !uploadFile ||
                      (uploadMode === "new" && !newResumeSlug.trim())
                    }
                    className="flex-1 rounded-2xl bg-[#241c16] px-4 py-3 text-sm font-semibold text-[#f6ebd7] transition hover:bg-[#17110c] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {uploading
                      ? "Uploading..."
                      : uploadMode === "new"
                        ? "Create and upload"
                        : "Upload version"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {deleteDialog && (
        <div className="fixed inset-0 z-[110] flex items-end justify-center bg-black/45 px-0 py-0 backdrop-blur-sm sm:items-center sm:px-4 sm:py-6">
          <div className="w-full max-w-lg rounded-t-[1.5rem] border border-black/10 bg-[linear-gradient(180deg,rgba(251,247,238,0.98)_0%,rgba(242,233,218,0.98)_100%)] p-5 shadow-[0_28px_90px_-35px_rgba(0,0,0,0.6)] sm:rounded-[1.75rem]">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#7b5a3d]">
              Confirm delete
            </p>
            <h3 className="mt-2 text-xl font-semibold text-[#211911]">
              {deleteDialog.kind === "resume"
                ? `Delete "${deleteDialog.label}"?`
                : `Delete ${deleteDialog.label}?`}
            </h3>
            <p className="mt-3 text-sm text-[#5f5144]">
              {deleteDialog.kind === "resume"
                ? "This will remove the resume and all of its versions permanently."
                : "This will permanently remove the selected version from this resume."}
            </p>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => setDeleteDialog(null)}
                className="flex-1 rounded-2xl border border-black/10 bg-white/75 px-4 py-3 text-sm font-semibold text-[#5f5144] transition hover:bg-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={async () => {
                  const target = deleteDialog;
                  setDeleteDialog(null);

                  if (target.kind === "resume") {
                    await performDeleteResume(target.resumeId);
                  } else {
                    await performDeleteVersion(target.versionId);
                  }
                }}
                className="flex-1 rounded-2xl bg-[#7a1f1f] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#631919]"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
