import View from "../models/View.js";
import User from "../models/User.js";
import Resume from "../models/Resume.js";

export const trackView = async (req, res) => {
  try {
    const { username } = req.params;

    const user = await User.findOne({ username });
    if (!user) return res.status(404).json({ message: "User not found" });

    const resume = await Resume.findOne({ userId: user._id })
      .sort({ updatedAt: -1, createdAt: -1 })
      .populate("currentVersionId");

    if (!resume || !resume.currentVersionId) {
      return res.status(404).json({ message: "No active resume found" });
    }

    // detect source
    const referer = req.headers.referer || "";
    let source = "Direct";

    if (referer.includes("linkedin")) source = "LinkedIn";
    else if (referer.includes("twitter")) source = "Twitter";
    else if (referer.includes("github")) source = "GitHub";

    await View.create({
      resumeId: resume._id,
      versionId: resume.currentVersionId._id,
      userId: user._id,
      source,
      userAgent: req.headers["user-agent"],
      ip: req.ip,
    });

    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Tracking failed" });
  }
};

export const getAnalytics = async (req, res) => {
  try {
    const userId = req.user.userId;

    const resumes = await Resume.find({ userId }).select("_id");
    if (!resumes.length) {
      return res.status(404).json({ message: "No resume container found" });
    }

    const resumeIds = resumes.map((resume) => resume._id);

    const totalViews = await View.countDocuments({
      resumeId: { $in: resumeIds },
    });

    const sources = await View.aggregate([
      { $match: { resumeId: { $in: resumeIds } } },
      { $group: { _id: "$source", count: { $sum: 1 } } },
      { $project: { _id: 0, source: "$_id", count: 1 } },
      { $sort: { count: -1 } },
    ]);

    const recentViews = await View.find({ resumeId: { $in: resumeIds } })
      .sort({ createdAt: -1 })
      .limit(10)
      .select("-ip");

    res.json({
      totalViews,
      sources,
      recentViews,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Analytics query failed" });
  }
};
