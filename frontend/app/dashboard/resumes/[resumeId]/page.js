"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Playfair_Display, Sora } from "next/font/google";
import { useAuth } from "../../../context/AuthContext";
import { UploadIcon } from "../../../components/icons/Icons";

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
  const [notice, setNotice] = useState("");

  const [uploadFile, setUploadFile] = useState(null);
  const [uploadPreviewUrl, setUploadPreviewUrl] = useState("");

  const selectedVersion = useMemo(
    () => versions.find((version) => version._id === selectedVersionId) || null,
    [versions, selectedVersionId],
  );

  const activeVersion = useMemo(
    () => versions.find((version) => version._id === activeVersionId) || null,
    [versions, activeVersionId],
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

  const loadWorkspace = async () => {
    if (!resumeId || !user) return;

    setLoading(true);
    setNotice("");

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
        setNotice("Resume not found or you do not have access.");
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
      setNotice("Unable to load this resume workspace right now.");
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
      setNotice("Please select a PDF first.");
      return;
    }

    if (uploadFile.type !== "application/pdf") {
      setNotice("Only PDF files are allowed.");
      return;
    }

    setUploading(true);
    setNotice("");

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
      setNotice("New version uploaded and set active.");
    } catch (error) {
      console.error(error);
      setNotice("Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleSetActive = async (versionId) => {
    setRollingBackId(versionId);
    setNotice("");

    try {
      const token = getToken();
      await axios.post(
        `${backendUrl}/api/resume/${resumeId}/rollback/${versionId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } },
      );

      await loadWorkspace();
      setNotice("Active version updated.");
    } catch (error) {
      console.error(error);
      setNotice("Failed to update active version.");
    } finally {
      setRollingBackId("");
    }
  };

  const handleDeleteVersion = async (versionId) => {
    setDeletingVersionId(versionId);
    setNotice("");

    try {
      const token = getToken();
      await axios.delete(
        `${backendUrl}/api/resume/${resumeId}/version/${versionId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      await loadWorkspace();
      setNotice("Version deleted.");
    } catch (error) {
      console.error(error);
      setNotice(error.response?.data?.message || "Failed to delete version.");
    } finally {
      setDeletingVersionId("");
    }
  };

  if (!user) return null;

  const publicPath = resume?.slug ? `/${user.username}/${resume.slug}` : "";

  return (
    <div
      className={`${sansFont.className} relative min-h-[100dvh] bg-[#e9e1d0] px-4 py-6 text-[#1f1b16] sm:px-6 md:px-8`}
    >
      <div className="pointer-events-none absolute -top-24 left-10 h-72 w-72 rounded-full bg-white/50 blur-3xl" />
      <div className="pointer-events-none absolute right-4 top-24 h-96 w-96 rounded-full bg-[#d7c0a0]/35 blur-3xl" />

      <div className="relative mx-auto max-w-[1500px] space-y-5">
        <header className="rounded-[1.5rem] border border-black/10 bg-[linear-gradient(135deg,rgba(248,242,231,0.96)_0%,rgba(238,228,211,0.96)_52%,rgba(232,219,193,0.96)_100%)] p-5 shadow-[0_20px_60px_-38px_rgba(0,0,0,0.45)] sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#7b5a3d]">
                Resume workspace
              </p>
              <h1 className="mt-1 text-2xl font-semibold tracking-tight text-[#211911] sm:text-3xl">
                {resume?.title || "Resume"}
                <span
                  className={`${displayFont.className} ml-2 text-lg italic text-[#7b5a3d]`}
                >
                  Versions + Live Preview
                </span>
              </h1>
              <p className="mt-1 font-mono text-sm text-[#6b5b4a]">
                {publicPath || "-"}
              </p>
            </div>

            <div className="flex gap-2">
              <Link
                href="/dashboard/resumes"
                className="rounded-2xl border border-black/10 bg-white px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-[#5f5144] transition hover:bg-[#f7f2ea]"
              >
                Back to Resumes
              </Link>
              <button
                type="button"
                onClick={loadWorkspace}
                disabled={loading}
                className="rounded-2xl border border-black/10 bg-white px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-[#5f5144] transition hover:bg-[#f7f2ea] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Refreshing" : "Refresh"}
              </button>
            </div>
          </div>

          {notice ? (
            <div className="mt-4 rounded-xl border border-black/10 bg-white/70 px-4 py-2 text-sm text-[#5f5144]">
              {notice}
            </div>
          ) : null}
        </header>

        <section className="grid grid-cols-1 gap-5 xl:grid-cols-[420px_minmax(0,1fr)]">
          <aside className="space-y-5 rounded-[1.5rem] border border-black/10 bg-[linear-gradient(180deg,rgba(251,247,238,0.95)_0%,rgba(242,233,218,0.9)_100%)] p-4 shadow-[0_20px_60px_-42px_rgba(0,0,0,0.42)]">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#7b5a3d]">
                Upload new version
              </p>
              <label className="mt-3 flex cursor-pointer flex-col rounded-2xl border border-dashed border-black/20 bg-white/70 p-4 text-sm text-[#5f5144] transition hover:border-[#8a6340]/45 hover:bg-white">
                <input
                  type="file"
                  accept="application/pdf"
                  className="hidden"
                  onChange={(event) => {
                    setNotice("");
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

              <button
                type="button"
                onClick={handleUploadVersion}
                disabled={uploading || !uploadFile}
                className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#241c16] px-4 py-3 text-sm font-semibold text-[#f6ebd7] transition hover:bg-[#17110c] disabled:cursor-not-allowed disabled:opacity-50"
              >
                <UploadIcon />
                {uploading ? "Uploading..." : "Upload version"}
              </button>

              {uploadPreviewUrl ? (
                <div className="mt-3 h-44 overflow-hidden rounded-2xl border border-black/10 bg-white">
                  <iframe
                    title="Selected PDF preview"
                    src={uploadPreviewUrl}
                    className="h-full w-full"
                  />
                </div>
              ) : null}
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#7b5a3d]">
                Version history
              </p>

              <div className="mt-3 max-h-[52dvh] space-y-3 overflow-y-auto pr-1">
                {loading ? (
                  <div className="rounded-2xl border border-black/10 bg-white/65 p-4 text-sm text-[#5f5144]">
                    Loading versions...
                  </div>
                ) : versions.length === 0 ? (
                  <div className="rounded-2xl border border-black/10 bg-white/65 p-4 text-sm text-[#5f5144]">
                    No versions yet. Upload your first PDF.
                  </div>
                ) : (
                  versions.map((version) => {
                    const isActive = version._id === activeVersionId;
                    const isSelected = version._id === selectedVersionId;

                    return (
                      <button
                        key={version._id}
                        type="button"
                        onClick={() => setSelectedVersionId(version._id)}
                        className={`w-full rounded-2xl border p-3 text-left transition ${
                          isSelected
                            ? "border-[#8a6340]/40 bg-[#fff7ec]"
                            : "border-black/10 bg-white/70 hover:bg-white"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-sm font-semibold text-[#211911]">
                            v{version.versionNumber}
                          </p>
                          <span
                            className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${
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

                        <div className="mt-3 flex gap-2">
                          {!isActive ? (
                            <button
                              type="button"
                              onClick={(event) => {
                                event.stopPropagation();
                                handleSetActive(version._id);
                              }}
                              disabled={rollingBackId === version._id}
                              className="flex-1 rounded-xl border border-black/10 bg-white px-3 py-2 text-xs font-semibold text-[#5f5144] transition hover:bg-[#f7f2ea] disabled:opacity-60"
                            >
                              {rollingBackId === version._id
                                ? "Switching..."
                                : "Set Active"}
                            </button>
                          ) : (
                            <span className="flex-1 rounded-xl border border-emerald-900/15 bg-emerald-50 px-3 py-2 text-center text-xs font-semibold text-emerald-800">
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
                            className="rounded-xl border border-rose-900/25 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700 transition hover:bg-rose-100 disabled:opacity-60"
                          >
                            {deletingVersionId === version._id
                              ? "..."
                              : "Delete"}
                          </button>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          </aside>

          <div className="rounded-[1.5rem] border border-black/10 bg-[linear-gradient(180deg,rgba(251,247,238,0.95)_0%,rgba(242,233,218,0.9)_100%)] p-4 shadow-[0_20px_60px_-42px_rgba(0,0,0,0.42)]">
            <div className="mb-3 flex items-center justify-between gap-3 px-1">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#7b5a3d]">
                  Full resume
                </p>
                <h2 className="mt-1 text-lg font-semibold text-[#211911]">
                  {selectedVersion
                    ? `Previewing v${selectedVersion.versionNumber}`
                    : "Select a version"}
                </h2>
              </div>

              {activeVersion && selectedVersion ? (
                <span className="rounded-full border border-black/10 bg-white px-3 py-1 text-xs font-semibold text-[#5f5144]">
                  Active: v{activeVersion.versionNumber}
                </span>
              ) : null}
            </div>

            <div className="h-[78dvh] overflow-hidden rounded-[1.25rem] border border-black/10 bg-white/70">
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
              <p className="mt-3 text-xs text-[#7b5a3d]">
                You are previewing v{selectedVersion.versionNumber}. Public link
                is serving v{activeVersion.versionNumber}.
              </p>
            ) : null}
          </div>
        </section>
      </div>
    </div>
  );
}
