import User from "../models/User.js";
import Resume from "../models/Resume.js";
import View from "../models/View.js";

// GET /api/public/:username/:slug/meta
export const getPublicResumeMeta = async (req, res) => {
  try {
    const { username, slug } = req.params;

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const resume = await Resume.findOne({ userId: user._id, slug }).populate(
      "currentVersionId",
    );
    const version = resume?.currentVersionId;

    if (!version) {
      return res
        .status(404)
        .json({ message: "Content for this resume is no longer available" });
    }

    res.json({
      fileUrl: version.fileUrl,
      slug: resume.slug,
      user: {
        name: user.name,
        username: user.username,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error resolving metadata" });
  }
};

// GET /api/public/:username/meta
export const getPublicDefaultResumeMeta = async (req, res) => {
  try {
    const { username } = req.params;

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const resume = await Resume.findOne({ userId: user._id })
      .sort({ updatedAt: -1, createdAt: -1 })
      .populate("currentVersionId");
    if (!resume || !resume.currentVersionId) {
      return res.status(404).json({ message: "No active resume found" });
    }

    res.json({
      fileUrl: resume.currentVersionId.fileUrl,
      slug: resume.slug,
      user: {
        name: user.name,
        username: user.username,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error resolving metadata" });
  }
};

// GET /api/public/:username/:slug
export const accessResumeViaLink = async (req, res) => {
  try {
    const { username, slug } = req.params;

    // 1. find user by username
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // 2. find resume using userId + slug
    const resume = await Resume.findOne({ userId: user._id, slug }).populate(
      "currentVersionId",
    );
    const version = resume?.currentVersionId;

    if (!version) {
      return res
        .status(404)
        .json({ message: "Content for this resume is no longer available" });
    }

    // 3. track view in View collection
    const referer = req.headers.referer || "";
    let source = "Direct";

    if (referer.includes("linkedin")) source = "LinkedIn";
    else if (referer.includes("twitter")) source = "Twitter";
    else if (referer.includes("github")) source = "GitHub";

    await View.create({
      resumeId: resume._id,
      versionId: version._id,
      userId: user._id,
      slug: resume.slug,
      source,
      userAgent: req.headers["user-agent"],
      ip: req.ip,
    });

    // 4. return fileUrl
    res.json({
      fileUrl: version.fileUrl,
      versionNumber: version.versionNumber,
      user: {
        name: user.name,
        username: user.username,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error resolving link" });
  }
};

// GET /api/public/:username
export const accessDefaultResume = async (req, res) => {
  try {
    const { username } = req.params;

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // find default resume
    const resume = await Resume.findOne({ userId: user._id })
      .sort({ updatedAt: -1, createdAt: -1 })
      .populate("currentVersionId");
    if (!resume || !resume.currentVersionId) {
      return res.status(404).json({ message: "No active resume found" });
    }

    const version = resume.currentVersionId;

    // track view in View collection
    const referer = req.headers.referer || "";
    let source = "Direct";

    if (referer.includes("linkedin")) source = "LinkedIn";
    else if (referer.includes("twitter")) source = "Twitter";
    else if (referer.includes("github")) source = "GitHub";

    await View.create({
      resumeId: resume._id,
      versionId: version._id,
      userId: user._id,
      slug: resume.slug,
      source,
      userAgent: req.headers["user-agent"],
      ip: req.ip,
    });

    res.json({
      fileUrl: version.fileUrl,
      versionNumber: version.versionNumber,
      user: {
        name: user.name,
        username: user.username,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
