import Link from "../models/Link.js";
import Resume from "../models/Resume.js";

// GET /api/link
export const getAllLinks = async (req, res) => {
  try {
    const userId = req.user.userId;
    const links = await Link.find({ userId }).sort({ createdAt: -1 });
    res.json({ links });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch links" });
  }
};

// POST /api/link
export const createLink = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { resumeId, versionId, slug, label } = req.body;

    if (!resumeId || !slug) {
      return res.status(400).json({ message: "resumeId and slug are required" });
    }

    // validate slug format strictly (alphanumeric and dashes only)
    const slugRegex = /^[a-zA-Z0-9-]+$/;
    if (!slugRegex.test(slug)) {
      return res.status(400).json({ message: "Slug can only contain letters, numbers, and dashes" });
    }

    // Verify ownership of resume
    const resume = await Resume.findById(resumeId);
    if (!resume || resume.userId.toString() !== userId) {
      return res.status(403).json({ message: "Not authorized to link this resume" });
    }

    // ensure slug is unique per user
    const existing = await Link.findOne({ userId, slug });
    if (existing) {
      return res.status(400).json({ message: "This custom URL is already in use by you" });
    }

    const newLink = await Link.create({
      userId,
      resumeId,
      versionId,
      slug,
      label: label || ""
    });

    res.status(201).json({ message: "Link created successfully", link: newLink });
  } catch (error) {
    console.error(error);
    // Duplicate key error from mongo index
    if (error.code === 11000) {
      return res.status(400).json({ message: "This custom URL is already in use by you" });
    }
    res.status(500).json({ message: "Failed to create link" });
  }
};
