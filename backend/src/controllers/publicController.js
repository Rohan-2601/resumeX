import User from "../models/User.js";
import Resume from "../models/Resume.js";
import View from "../models/View.js";
import { detectViewSource, shouldTrackView } from "../utils/viewTracking.js";
import AppError from "../utils/AppError.js";

// GET /api/public/:username/:slug/meta
export const getPublicResumeMeta = async (req, res) => {
  const { username, slug } = req.params;

  const user = await User.findOne({ username }).select('_id name username').lean();
  if (!user) {
    throw new AppError("User not found", 404);
  }

  const resume = await Resume.findOne({ userId: user._id, slug })
    .select('slug currentVersionId')
    .populate({ path: 'currentVersionId', select: 'fileUrl' })
    .lean();
    
  const version = resume?.currentVersionId;

  if (!version) {
    throw new AppError("Content for this resume is no longer available", 404);
  }

  res.json({
    fileUrl: version.fileUrl,
    slug: resume.slug,
    user: {
      name: user.name,
      username: user.username,
    },
  });
};

// GET /api/public/:username/meta
export const getPublicDefaultResumeMeta = async (req, res) => {
  const { username } = req.params;

  const user = await User.findOne({ username }).select('_id name username').lean();
  if (!user) {
    throw new AppError("User not found", 404);
  }

  const resume = await Resume.findOne({ userId: user._id })
    .sort({ updatedAt: -1, createdAt: -1 })
    .select('slug currentVersionId')
    .populate({ path: 'currentVersionId', select: 'fileUrl' })
    .lean();
    
  if (!resume || !resume.currentVersionId) {
    throw new AppError("No active resume found", 404);
  }

  res.json({
    fileUrl: resume.currentVersionId.fileUrl,
    slug: resume.slug,
    user: {
      name: user.name,
      username: user.username,
    },
  });
};

// GET /api/public/:username/:slug
export const accessResumeViaLink = async (req, res) => {
  const { username, slug } = req.params;

  const user = await User.findOne({ username }).select('_id name username').lean();
  if (!user) {
    throw new AppError("User not found", 404);
  }

  const resume = await Resume.findOne({ userId: user._id, slug })
    .select('currentVersionId slug')
    .populate({ path: 'currentVersionId', select: 'fileUrl versionNumber' })
    .lean();
    
  const version = resume?.currentVersionId;

  if (!version) {
    throw new AppError("Content for this resume is no longer available", 404);
  }

  res.json({
    fileUrl: version.fileUrl,
    versionNumber: version.versionNumber,
    user: {
      name: user.name,
      username: user.username,
    },
  });
};

// GET /api/public/:username
export const accessDefaultResume = async (req, res) => {
  const { username } = req.params;

  const user = await User.findOne({ username }).select('_id name username').lean();
  if (!user) {
    throw new AppError("User not found", 404);
  }

  const resume = await Resume.findOne({ userId: user._id })
    .sort({ updatedAt: -1, createdAt: -1 })
    .select('currentVersionId slug')
    .populate({ path: 'currentVersionId', select: 'fileUrl versionNumber' })
    .lean();
    
  if (!resume || !resume.currentVersionId) {
    throw new AppError("No active resume found", 404);
  }

  const version = resume.currentVersionId;

  res.json({
    fileUrl: version.fileUrl,
    versionNumber: version.versionNumber,
    user: {
      name: user.name,
      username: user.username,
    },
  });
};

// POST /api/public/:username/:slug/view
export const trackResumeView = async (req, res) => {
  const { username, slug } = req.params;

  if (!shouldTrackView(req)) {
    return res.status(204).end();
  }

  const user = await User.findOne({ username }).select('_id').lean();
  if (!user) {
    throw new AppError("User not found", 404);
  }

  const resume = await Resume.findOne({ userId: user._id, slug }).select('_id currentVersionId slug').lean();
  if (!resume || !resume.currentVersionId) {
    throw new AppError("Content for this resume is no longer available", 404);
  }

  const source = detectViewSource(req);

  // We explicitly await it here because the frontend calls this asynchronously. 
  // Waiting ensures it saves correctly before sending 204.
  await View.create({
    resumeId: resume._id,
    versionId: resume.currentVersionId,
    userId: user._id,
    slug: resume.slug,
    source,
    userAgent: req.headers["user-agent"],
    ip: req.ip,
  });

  res.status(204).end();
};

// POST /api/public/:username/view
export const trackDefaultResumeView = async (req, res) => {
  const { username } = req.params;

  if (!shouldTrackView(req)) {
    return res.status(204).end();
  }

  const user = await User.findOne({ username }).select('_id').lean();
  if (!user) {
    throw new AppError("User not found", 404);
  }

  const resume = await Resume.findOne({ userId: user._id })
    .sort({ updatedAt: -1, createdAt: -1 })
    .select('_id currentVersionId slug')
    .lean();

  if (!resume || !resume.currentVersionId) {
    throw new AppError("No active resume found", 404);
  }

  const source = detectViewSource(req);

  await View.create({
    resumeId: resume._id,
    versionId: resume.currentVersionId,
    userId: user._id,
    slug: resume.slug,
    source,
    userAgent: req.headers["user-agent"],
    ip: req.ip,
  });

  res.status(204).end();
};
