import mongoose from "mongoose";

const viewSchema = new mongoose.Schema(
  {
    resumeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Resume",
      required: true
    },
    versionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ResumeVersion"
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    slug: {
      type: String
    },
    source: {
      type: String,
      default: "Direct"
    },
    ip: String,
    userAgent: String
  },
  { timestamps: true }
);

export default mongoose.model("View", viewSchema);