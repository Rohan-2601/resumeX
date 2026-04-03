import mongoose from "mongoose";

const linkSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    resumeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Resume",
      required: true,
    },
    slug: {
      type: String,
      required: true,
    },
    label: {
      type: String,
    },
  },
  { timestamps: true },
);

// Ensure slug is unique per user
linkSchema.index({ userId: 1, slug: 1 }, { unique: true });

export default mongoose.model("Link", linkSchema);
