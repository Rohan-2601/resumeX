import mongoose from "mongoose";

const resumeSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      default: "My Resume",
    },
    slug: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    currentVersionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ResumeVersion",
    },
  },
  { timestamps: true },
);

resumeSchema.index({ userId: 1, slug: 1 }, { unique: true });

export default mongoose.model("Resume", resumeSchema);
