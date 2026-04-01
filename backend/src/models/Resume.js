import mongoose from "mongoose";

const resumeSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    title: {
      type: String,
      default: "My Resume"
    },
    currentVersionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ResumeVersion"
    }
  },
  { timestamps: true }
);

export default mongoose.model("Resume", resumeSchema);