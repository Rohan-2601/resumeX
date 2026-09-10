import mongoose from "mongoose";

const oauthCodeSchema = new mongoose.Schema(
  {
    codeHash: {
      type: String,
      required: true,
      unique: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
      expires: 300, // Expires after 5 minutes (300 seconds)
    },
  },
  {
    timestamps: false,
  }
);

export default mongoose.model("OAuthCode", oauthCodeSchema);
