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

export default mongoose.model("ResumeVersion", resumeVersionSchema);
