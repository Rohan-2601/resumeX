import User from "../models/User.js";
import Resume from "../models/Resume.js";
import ResumeVersion from "../models/ResumeVersion.js";
import View from "../models/View.js";

const normalizeSlug = (value) => value.trim().toLowerCase();

const slugRegex = /^[a-zA-Z0-9-]+$/;

const formatResume = (resume) => {
  if (!resume) {
    return null;
  }

  return {
    _id: resume._id,
    userId: resume.userId,
    title: resume.title,
    slug: resume.slug,
    currentVersionId: resume.currentVersionId,
    createdAt: resume.createdAt,
    updatedAt: resume.updatedAt,
  };
};

// 1. Create base resume container
export const createResume = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { title, slug } = req.body;

    if (!slug || !slug.trim()) {
      return res.status(400).json({ message: "slug is required" });
    }

    const normalizedSlug = normalizeSlug(slug);

    if (!slugRegex.test(normalizedSlug)) {
      return res.status(400).json({
        message: "Slug can only contain letters, numbers, and dashes",
      });
    }

    const existingResume = await Resume.findOne({
      userId,
      slug: normalizedSlug,
    });
    if (existingResume) {
      return res.status(200).json({
        message: "Resume container already exists",
        resume: existingResume,
      });
    }

    const newResume = await Resume.create({
      userId,
      title: title || "My Resume",
      slug: normalizedSlug,
    });

    res.status(201).json({ message: "Resume created", resume: newResume });
  } catch (error) {
    console.error(error);
    if (error.code === 11000) {
      return res.status(400).json({ message: "This slug is already in use" });
    }
    res.status(500).json({ message: "Server error" });
  }
};

// 1a. Get all resumes for the current user
export const getMyResumes = async (req, res) => {
  try {
    const userId = req.user.userId;

    const resumes = await Resume.find({ userId })
      .sort({ updatedAt: -1, createdAt: -1 })
      .populate("currentVersionId");

    res.json({ resumes: resumes.map(formatResume) });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// 1b. Update Resume Title
export const updateResumeTitle = async (req, res) => {
  try {
    const { resumeId } = req.params;
    const { title } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ message: "title is required" });
    }

    const resume = await Resume.findById(resumeId);
    if (!resume) {
      return res.status(404).json({ message: "Resume not found" });
    }

    if (resume.userId.toString() !== req.user.userId) {
      return res.status(403).json({ message: "Not authorized" });
    }

    resume.title = title.trim();
    await resume.save();

    res.json({ message: "Resume title updated", resume });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// 2. Upload New Version
export const uploadVersion = async (req, res) => {
  try {
    const { resumeId } = req.params;
    const { fileUrl, notes } = req.body;

    if (!fileUrl) {
      return res.status(400).json({ message: "fileUrl is required" });
    }

    const resume = await Resume.findById(resumeId);
    if (!resume) {
      return res.status(404).json({ message: "Resume not found" });
    }

    // Verify ownership
    if (resume.userId.toString() !== req.user.userId) {
      return res.status(403).json({ message: "Not authorized" });
    }

    // Find latest version to increment logic
    const latestVersion = await ResumeVersion.findOne({ resumeId }).sort({
      versionNumber: -1,
    });
    const nextVersionNumber = latestVersion
      ? latestVersion.versionNumber + 1
      : 1;

    const newVersion = await ResumeVersion.create({
      resumeId,
      fileUrl,
      versionNumber: nextVersionNumber,
      notes: notes || "",
    });

    // Update Resume.currentVersionId
    resume.currentVersionId = newVersion._id;
    await resume.save();

    res
      .status(201)
      .json({ message: "New version uploaded", version: newVersion });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// 3. Get All Versions
export const getAllVersions = async (req, res) => {
  try {
    const { resumeId } = req.params;

    const resume = await Resume.findById(resumeId);
    if (!resume) {
      return res.status(404).json({ message: "Resume not found" });
    }

    if (resume.userId.toString() !== req.user.userId) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const versions = await ResumeVersion.find({ resumeId }).sort({
      createdAt: -1,
    });
    res.json({ versions });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// 4. Rollback Version
export const rollbackVersion = async (req, res) => {
  try {
    const { resumeId, versionId } = req.params;

    const resume = await Resume.findById(resumeId);
    if (!resume) {
      return res.status(404).json({ message: "Resume not found" });
    }

    if (resume.userId.toString() !== req.user.userId) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const version = await ResumeVersion.findById(versionId);
    if (!version || version.resumeId.toString() !== resumeId) {
      return res.status(404).json({ message: "Version not found" });
    }

    resume.currentVersionId = version._id;
    await resume.save();

    res.json({ message: "Rolled back successfully", resume });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// 4a. Delete Resume
export const deleteResume = async (req, res) => {
  try {
    const { resumeId } = req.params;

    const resume = await Resume.findById(resumeId);
    if (!resume) {
      return res.status(404).json({ message: "Resume not found" });
    }

    if (resume.userId.toString() !== req.user.userId) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await Promise.all([
      ResumeVersion.deleteMany({ resumeId: resume._id }),
      View.deleteMany({ resumeId: resume._id }),
      Resume.findByIdAndDelete(resume._id),
    ]);

    res.json({ message: "Resume deleted" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// 5. Get Current Resume
export const getResumeByUsername = async (req, res) => {
  try {
    const { username, slug } = req.params;

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const query = { userId: user._id };
    if (slug) {
      query.slug = normalizeSlug(slug);
    }

    const resumeQuery = Resume.findOne(query).populate("currentVersionId");

    if (!slug) {
      resumeQuery.sort({ updatedAt: -1, createdAt: -1 });
    }

    const resume = await resumeQuery;

    if (!resume || !resume.currentVersionId) {
      return res.status(404).json({ message: "No active resume found" });
    }

    // Format to match frontend expectations
    const responseResume = {
      _id: resume._id,
      title: resume.title,
      slug: resume.slug,
      userId: resume.userId,
      fileUrl: resume.currentVersionId.fileUrl,
      versionId: resume.currentVersionId._id,
      versionNumber: resume.currentVersionId.versionNumber,
      updatedAt: resume.currentVersionId.createdAt,
    };

    res.json({ resume: responseResume, user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
