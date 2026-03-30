import mongoose from "mongoose";

const viewSchema = new mongoose.Schema(
  {
    resumeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Resume",
      required: true
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    source: {
      type: String,
      default: "direct"
    },
    ip: String,
    userAgent: String
  },
  { timestamps: true }
);

export default mongoose.model("View", viewSchema);