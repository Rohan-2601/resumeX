"use client";

import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Playfair_Display, Sora } from "next/font/google";
import { useAuth } from "../../context/AuthContext";
import { UploadIcon } from "../../components/icons/Icons";

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

  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadMode, setUploadMode] = useState("new");
  const [uploading, setUploading] = useState(false);
  const [uploadNotice, setUploadNotice] = useState("");
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadPreviewUrl, setUploadPreviewUrl] = useState("");

  const [newResumeTitle, setNewResumeTitle] = useState("My Resume");
  const [newResumeSlug, setNewResumeSlug] = useState("");
  const [targetResumeId, setTargetResumeId] = useState("");

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

  const targetResume = useMemo(
    () => resumes.find((resume) => resume._id === targetResumeId) || null,
    [resumes, targetResumeId],
  );

  const getToken = () => localStorage.getItem("token");

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
    setUploadMode("new");
    setTargetResumeId("");
    setNewResumeTitle("My Resume");
    setNewResumeSlug("");
    setUploadFile(null);
    setUploadPreviewUrl("");
    setUploadNotice("");
    setIsUploadModalOpen(true);
  };

  const openNewVersionModal = (resumeId) => {
    setUploadMode("version");
    setTargetResumeId(resumeId);
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
      let resumeId = targetResumeId;

      if (uploadMode === "new") {
        const createdResume = await createResume();
        if (!createdResume) {
          return;
        }
        resumeId = createdResume._id;
      }

      if (!resumeId) {
        setUploadNotice("No resume selected for version upload.");
        return;
      }

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
      setTargetResumeId("");
      await loadResumes();

      if (uploadMode === "new") {
        setMessage("New resume uploaded successfully.");
      } else {
        setMessage("New version uploaded successfully.");
      }

      openWorkspace(resumeId);
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

  return (
    <div
      className={`${sansFont.className} relative space-y-8 pb-8 text-[#1f1b16]`}
    >
      <div className="pointer-events-none absolute -top-24 left-10 h-72 w-72 rounded-full bg-white/50 blur-3xl" />
      <div className="pointer-events-none absolute right-4 top-24 h-96 w-96 rounded-full bg-[#d7c0a0]/35 blur-3xl" />

      {message ? (
        <div
          className={`rounded-[1.25rem] border px-4 py-3 text-sm shadow-[0_18px_45px_-35px_rgba(0,0,0,0.45)] ${
            isErrorMessage
              ? "border-rose-900/20 bg-rose-50 text-rose-700"
              : "border-emerald-900/15 bg-emerald-50 text-emerald-800"
          }`}
        >
          {message}
        </div>
      ) : null}

      <section className="relative overflow-hidden rounded-[2rem] border border-black/10 bg-[linear-gradient(135deg,rgba(248,242,231,0.96)_0%,rgba(238,228,211,0.96)_52%,rgba(232,219,193,0.96)_100%)] p-7 shadow-[0_24px_80px_-50px_rgba(0,0,0,0.55)] sm:p-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.6),transparent_35%),radial-gradient(circle_at_bottom_left,rgba(123,90,61,0.12),transparent_30%)]" />

        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-[#7b5a3d]">
              Dashboard / Resumes
            </p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-[#211911] sm:text-5xl">
              Your resumes
              <span
                className={`${displayFont.className} mt-2 block text-lg font-medium italic text-[#7b5a3d] sm:text-xl`}
              >
                Click a resume to open its full version workspace in a new tab.
              </span>
            </h1>
          </div>

          <div className="flex w-full gap-3 sm:w-auto">
            <button
              type="button"
              onClick={loadResumes}
              disabled={loading}
              className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-xs font-bold uppercase tracking-[0.16em] text-[#5f5144] transition hover:bg-[#f7f2ea] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
            >
              {loading ? "Refreshing" : "Refresh"}
            </button>
            <button
              type="button"
              onClick={openNewResumeModal}
              className="w-full rounded-2xl bg-[#241c16] px-5 py-3 text-xs font-bold uppercase tracking-[0.16em] text-[#f6ebd7] transition hover:bg-[#17110c] sm:w-auto"
            >
              Upload New Resume
            </button>
          </div>
        </div>
      </section>

      <section className="rounded-[1.75rem] border border-black/10 bg-[linear-gradient(180deg,rgba(251,247,238,0.95)_0%,rgba(242,233,218,0.9)_100%)] p-6 shadow-[0_20px_60px_-42px_rgba(0,0,0,0.42)] sm:p-8">
        {loading ? (
          <div className="rounded-2xl border border-black/10 bg-white/65 p-5 text-sm text-[#5f5144]">
            Loading resumes...
          </div>
        ) : sortedResumes.length === 0 ? (
          <div className="rounded-2xl border border-black/10 bg-white/65 p-5 text-sm text-[#5f5144]">
            No resumes yet. Upload your first PDF from the button above.
          </div>
        ) : (
          <div className="space-y-4">
            {sortedResumes.map((resume) => {
              const publicPath = `/${user.username}/${resume.slug}`;
              return (
                <div
                  key={resume._id}
                  className="rounded-2xl border border-black/10 bg-white/70 p-4 text-left shadow-[0_10px_30px_-24px_rgba(0,0,0,0.45)]"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <button
                      type="button"
                      onClick={() => openWorkspace(resume._id)}
                      className="min-w-0 text-left"
                    >
                      <p className="truncate text-base font-semibold text-[#211911]">
                        {resume.title || "My Resume"}
                      </p>
                      <p className="mt-1 truncate font-mono text-sm text-[#6b5b4a]">
                        {publicPath}
                      </p>
                    </button>

                    <div className="flex flex-wrap items-center gap-2 text-xs text-[#6b5b4a]">
                      <span className="mr-1">
                        Updated {timeAgo(resume.updatedAt)}
                      </span>
                      <button
                        type="button"
                        onClick={() => openWorkspace(resume._id)}
                        className="rounded-full border border-black/10 bg-[#f4ecde] px-3 py-1 font-semibold text-[#5f5144] transition hover:bg-[#ece0ca]"
                      >
                        Open Workspace
                      </button>
                      <button
                        type="button"
                        onClick={() => openNewVersionModal(resume._id)}
                        className="rounded-full border border-black/10 bg-white px-3 py-1 font-semibold text-[#5f5144] transition hover:bg-[#f7f2ea]"
                      >
                        Upload New Version
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {isUploadModalOpen ? (
        <div className="fixed inset-0 z-[120] flex items-end justify-center bg-black/45 px-0 py-0 backdrop-blur-sm sm:items-center sm:px-4 sm:py-6">
          <div className="w-full max-w-2xl rounded-t-[1.5rem] border border-black/10 bg-[linear-gradient(180deg,rgba(251,247,238,0.98)_0%,rgba(242,233,218,0.98)_100%)] p-5 shadow-[0_28px_90px_-35px_rgba(0,0,0,0.6)] sm:rounded-[1.75rem]">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#7b5a3d]">
              {uploadMode === "new"
                ? "Upload new resume"
                : "Upload new version"}
            </p>
            <h3 className="mt-2 text-xl font-semibold text-[#211911]">
              {uploadMode === "new"
                ? "Create resume and upload PDF"
                : `Upload PDF to ${targetResume?.title || "selected resume"}`}
            </h3>

            <div className="mt-4 space-y-4">
              {uploadMode === "new" ? (
                <>
                  <div>
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.24em] text-[#7b5a3d]">
                      Resume title
                    </label>
                    <input
                      value={newResumeTitle}
                      onChange={(event) =>
                        setNewResumeTitle(event.target.value)
                      }
                      className="w-full rounded-2xl border border-black/10 bg-white/80 px-4 py-3 text-sm text-[#211911] outline-none transition placeholder:text-[#8b7a68] focus:border-[#8a6340]/60"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.24em] text-[#7b5a3d]">
                      Slug
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
                </>
              ) : null}

              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.24em] text-[#7b5a3d]">
                  PDF file
                </label>
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={(event) => {
                    setUploadNotice("");
                    setUploadFile(event.target.files?.[0] || null);
                  }}
                  className="w-full rounded-2xl border border-black/10 bg-white/80 px-4 py-3 text-sm text-[#211911] file:mr-3 file:rounded-xl file:border-0 file:bg-[#241c16] file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-[#f6ebd7]"
                />
              </div>

              {uploadPreviewUrl ? (
                <div className="h-56 overflow-hidden rounded-2xl border border-black/10 bg-white">
                  <iframe
                    title="Selected PDF preview"
                    src={uploadPreviewUrl}
                    className="h-full w-full"
                  />
                </div>
              ) : null}

              {uploadNotice ? (
                <div className="rounded-2xl border border-rose-900/20 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                  {uploadNotice}
                </div>
              ) : null}
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => setIsUploadModalOpen(false)}
                className="flex-1 rounded-2xl border border-black/10 bg-white/75 px-4 py-3 text-sm font-semibold text-[#5f5144] transition hover:bg-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleUpload}
                disabled={
                  uploading ||
                  !uploadFile ||
                  (uploadMode === "new" && !newResumeSlug.trim())
                }
                className="flex-1 rounded-2xl bg-[#241c16] px-4 py-3 text-sm font-semibold text-[#f6ebd7] transition hover:bg-[#17110c] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {uploading ? "Uploading..." : "Upload"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
