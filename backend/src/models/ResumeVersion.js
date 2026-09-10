import mongoose from "mongoose";

const resumeVersionSchema = new mongoose.Schema(
  {
    resumeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Resume",
      required: true
    },
    fileUrl: {
      type: String,
      required: true
    },
    // New Cloudinary Metadata
    publicId: {
      type: String,
    },
    resourceType: {
      type: String,
      default: "image",
    },
    format: {
      type: String,
    },
    bytes: {
      type: Number,
    },
    versionNumber: {
      type: Number,
      required: true
    },
    notes: {
      type: String
    }
  },
  { timestamps: true }
);

resumeVersionSchema.index({ resumeId: 1, versionNumber: 1 }, { unique: true });
resumeVersionSchema.index({ resumeId: 1, versionNumber: -1 });

export default mongoose.model("ResumeVersion", resumeVersionSchema);
