import User from "../models/User.js";
import Link from "../models/Link.js";
import Resume from "../models/Resume.js";
import View from "../models/View.js";

// GET /api/public/:username/:slug
export const accessResumeViaLink = async (req, res) => {
  try {
    const { username, slug } = req.params;

    // 1. find user by username
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // 2. find link using userId + slug
    const link = await Link.findOne({ userId: user._id, slug });
    if (!link) {
      return res.status(404).json({ message: "Link not found or deactivated" });
    }

    // 3. resolve version from resume source of truth
    const resume = await Resume.findById(link.resumeId).populate(
      "currentVersionId",
    );
    const version = resume?.currentVersionId;

    if (!version) {
      return res
        .status(404)
        .json({ message: "Content for this link is no longer available" });
    }

    // 4. track view in View collection
    const referer = req.headers.referer || "";
    let source = "Direct";

    if (referer.includes("linkedin")) source = "LinkedIn";
    else if (referer.includes("twitter")) source = "Twitter";
    else if (referer.includes("github")) source = "GitHub";

    await View.create({
      resumeId: link.resumeId,
      versionId: version._id,
      userId: user._id,
      slug: link.slug, // Track which link was used
      source,
      userAgent: req.headers["user-agent"],
      ip: req.ip,
    });

    // 5. return fileUrl
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
    const resume = await Resume.findOne({ userId: user._id }).populate(
      "currentVersionId",
    );
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
      slug: "default", // Mark as default profile visit
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
