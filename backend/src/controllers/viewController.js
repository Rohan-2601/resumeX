import View from "../models/View.js";
import User from "../models/User.js";
import Resume from "../models/Resume.js";

export const trackView = async (req, res) => {
  try {
    const { username } = req.params;

    const user = await User.findOne({ username });
    if (!user) return res.status(404).json({ message: "User not found" });

    const resume = await Resume.findOne({ userId: user._id }).populate("currentVersionId");

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
      ip: req.ip
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
    
    const resume = await Resume.findOne({ userId });
    if (!resume) {
      return res.status(404).json({ message: "No resume container found" });
    }

    const totalViews = await View.countDocuments({ resumeId: resume._id });

    const sources = await View.aggregate([
      { $match: { resumeId: resume._id } },
      { $group: { _id: "$source", count: { $sum: 1 } } },
      { $project: { _id: 0, source: "$_id", count: 1 } },
      { $sort: { count: -1 } }
    ]);

    const recentViews = await View.find({ resumeId: resume._id })
      .sort({ createdAt: -1 })
      .limit(10)
      .select("-ip");

    res.json({
      totalViews,
      sources,
      recentViews
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Analytics query failed" });
  }
};
