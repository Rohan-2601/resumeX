import mongoose from "mongoose";
import User from "../models/User.js";
import Resume from "../models/Resume.js";
import ResumeVersion from "../models/ResumeVersion.js";
import View from "../models/View.js";
import cloudinary, { generateUploadSignature, deleteCloudinaryAsset } from "../config/cloudinary.js";
import AppError from "../utils/AppError.js";

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
  const userId = req.user.userId;
  const { title, slug } = req.body;

  const normalizedSlug = normalizeSlug(slug);

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
};

// 1a. Get all resumes for the current user
export const getMyResumes = async (req, res) => {
  const userId = req.user.userId;

  const resumes = await Resume.find({ userId })
    .sort({ updatedAt: -1, createdAt: -1 })
    .populate("currentVersionId");

  res.json({ resumes: resumes.map(formatResume) });
};

// 1b. Update Resume Title
export const updateResumeTitle = async (req, res) => {
  const { resumeId } = req.params;
  const { title } = req.body;

  const resume = await Resume.findById(resumeId);
  if (!resume) {
    throw new AppError("Resume not found", 404);
  }

  if (resume.userId.toString() !== req.user.userId) {
    throw new AppError("Not authorized", 403);
  }

  resume.title = title;
  await resume.save();

  res.json({ message: "Resume title updated", resume });
};

// 2. Get Upload Signature
export const getUploadSignature = async (req, res) => {
  const { resumeId } = req.params;
  const userId = req.user.userId;

  const resume = await Resume.findById(resumeId);
  if (!resume) {
    throw new AppError("Resume not found", 404);
  }
  if (resume.userId.toString() !== userId) {
    throw new AppError("Not authorized", 403);
  }

  const folder = `resumex/users/${userId}/resumes/${resumeId}`;
  const signatureData = generateUploadSignature(folder);

  res.json(signatureData);
};

// 3. Upload New Version
export const uploadVersion = async (req, res, next) => {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    const { resumeId } = req.params;
    const { fileUrl, publicId, resourceType, format, bytes, notes } = req.body;
    const userId = req.user.userId;

    if (!fileUrl) {
      throw new AppError("fileUrl is required", 400);
    }

    if (publicId) {
      if (format && format.toLowerCase() !== "pdf") {
        throw new AppError("Only PDF files are allowed", 400);
      }
      if (bytes && bytes > 5242880) { // 5MB
        throw new AppError("File exceeds 5MB limit", 400);
      }
      const expectedFolder = `resumex/users/${userId}/resumes/${resumeId}`;
      if (!publicId.startsWith(expectedFolder)) {
        throw new AppError("Invalid asset scope", 403);
      }
    }

    const resume = await Resume.findOneAndUpdate(
      { _id: resumeId, userId },
      { $inc: { versionCounter: 1 } },
      { new: true, session }
    );

    if (!resume) {
      throw new AppError("Resume not found or not authorized", 404);
    }

    const nextVersionNumber = resume.versionCounter;

    let previewUrl = null;
    if (publicId && (!resourceType || resourceType === "image")) {
      try {
        const eagerResult = await cloudinary.uploader.explicit(publicId, {
          type: "upload",
          resource_type: "image",
          eager: [{ format: "jpg", width: 1200, crop: "scale", page: 1 }],
        });
        if (eagerResult?.eager?.[0]?.secure_url) {
          previewUrl = eagerResult.eager[0].secure_url;
        }
      } catch (err) {
        console.error("Failed to generate eager preview:", err);
        previewUrl = cloudinary.url(publicId, {
          resource_type: "image",
          format: "jpg",
          width: 1200,
          crop: "scale",
          page: 1,
          secure: true,
        });
      }
    }

    let newVersion;
    try {
      const createdVersions = await ResumeVersion.create([{
        resumeId,
        fileUrl,
        publicId,
        resourceType: resourceType || "image",
        format,
        bytes,
        previewUrl,
        versionNumber: nextVersionNumber,
        notes: notes || "",
      }], { session });
      newVersion = createdVersions[0];
    } catch (createError) {
      throw createError; // caught by outer try-catch
    }

    resume.currentVersionId = newVersion._id;
    await resume.save({ session });

    await session.commitTransaction();
    session.endSession();

    res.status(201).json({ message: "New version uploaded", version: newVersion });
  } catch (error) {
    if (session.inTransaction()) {
      await session.abortTransaction();
    }
    session.endSession();
    
    // Compensation logic outside the transaction
    if (req.body.publicId) {
      console.log("Attempting to clean up Cloudinary asset due to MongoDB error...");
      await deleteCloudinaryAsset(req.body.publicId, req.body.resourceType || "image").catch(e => console.error(e));
    }
    
    next(error);
  }
};

// 4. Get All Versions
export const getAllVersions = async (req, res) => {
  const { resumeId } = req.params;

  const resume = await Resume.findById(resumeId);
  if (!resume) {
    throw new AppError("Resume not found", 404);
  }

  if (resume.userId.toString() !== req.user.userId) {
    throw new AppError("Not authorized", 403);
  }

  const versions = await ResumeVersion.find({ resumeId }).sort({
    createdAt: -1,
  });
  res.json({ versions });
};

// 5. Rollback Version
export const rollbackVersion = async (req, res, next) => {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    const { resumeId, versionId } = req.params;
    const userId = req.user.userId;

    const resume = await Resume.findOne({ _id: resumeId, userId }).session(session);
    if (!resume) {
      throw new AppError("Resume not found or not authorized", 404);
    }

    const version = await ResumeVersion.findOne({ _id: versionId, resumeId }).session(session);
    if (!version) {
      throw new AppError("Version not found or does not belong to this resume", 404);
    }

    resume.currentVersionId = version._id;
    await resume.save({ session });

    await session.commitTransaction();
    session.endSession();

    res.json({ message: "Rolled back successfully", resume });
  } catch (error) {
    if (session.inTransaction()) {
      await session.abortTransaction();
    }
    session.endSession();
    next(error);
  }
};

// 6. Delete Version
export const deleteVersion = async (req, res, next) => {
  const session = await mongoose.startSession();
  let cloudinaryAssetToDelete = null;

  try {
    session.startTransaction();
    const { resumeId, versionId } = req.params;
    const userId = req.user.userId;

    const resume = await Resume.findOne({ _id: resumeId, userId }).session(session);
    if (!resume) {
      throw new AppError("Resume not found or not authorized", 404);
    }

    const version = await ResumeVersion.findOne({ _id: versionId, resumeId }).session(session);
    if (!version) {
      throw new AppError("Version not found", 404);
    }

    // Save for deletion after successful commit
    if (version.publicId) {
      cloudinaryAssetToDelete = { publicId: version.publicId, resourceType: version.resourceType };
    }

    await ResumeVersion.findByIdAndDelete(versionId).session(session);

    const wasActive = resume.currentVersionId && resume.currentVersionId.toString() === versionId;
    let nextActiveVersion = null;

    if (wasActive) {
      // Find the next best active version (latest remaining by versionNumber)
      nextActiveVersion = await ResumeVersion.findOne({ resumeId })
        .sort({ versionNumber: -1 })
        .session(session);
      resume.currentVersionId = nextActiveVersion ? nextActiveVersion._id : null;
      await resume.save({ session });
    }

    await session.commitTransaction();
    session.endSession();

    // Now safely delete from Cloudinary
    if (cloudinaryAssetToDelete) {
      await deleteCloudinaryAsset(cloudinaryAssetToDelete.publicId, cloudinaryAssetToDelete.resourceType).catch(e => console.error(e));
    }

    res.json({
      message: "Version deleted",
      deletedVersionId: versionId,
      newActiveVersionId: nextActiveVersion?._id || null,
    });
  } catch (error) {
    if (session.inTransaction()) {
      await session.abortTransaction();
    }
    session.endSession();
    next(error);
  }
};

// 7. Delete Resume
export const deleteResume = async (req, res, next) => {
  const session = await mongoose.startSession();
  let cloudinaryAssetsToDelete = [];

  try {
    session.startTransaction();
    const { resumeId } = req.params;
    const userId = req.user.userId;

    const resume = await Resume.findOne({ _id: resumeId, userId }).session(session);
    if (!resume) {
      throw new AppError("Resume not found or not authorized", 404);
    }

    const versions = await ResumeVersion.find({ resumeId }).session(session);
    cloudinaryAssetsToDelete = versions
      .filter(v => v.publicId)
      .map(v => ({ publicId: v.publicId, resourceType: v.resourceType }));

    await ResumeVersion.deleteMany({ resumeId: resume._id }).session(session);
    await View.deleteMany({ resumeId: resume._id }).session(session);
    await Resume.findByIdAndDelete(resume._id).session(session);

    await session.commitTransaction();
    session.endSession();

    // Asynchronously cleanup Cloudinary after DB commit succeeds
    const deletePromises = cloudinaryAssetsToDelete.map(asset => 
      deleteCloudinaryAsset(asset.publicId, asset.resourceType)
    );
    await Promise.allSettled(deletePromises);

    res.json({ message: "Resume deleted" });
  } catch (error) {
    if (session.inTransaction()) {
      await session.abortTransaction();
    }
    session.endSession();
    next(error);
  }
};

