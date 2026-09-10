import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

async function checkDuplicates() {
  await mongoose.connect(process.env.MONGO_URI);
  const ResumeVersion = mongoose.model("ResumeVersion", new mongoose.Schema({ resumeId: mongoose.Schema.Types.ObjectId, versionNumber: Number }));
  const pipeline = [
    { $group: { _id: { resumeId: "$resumeId", versionNumber: "$versionNumber" }, count: { $sum: 1 } } },
    { $match: { count: { $gt: 1 } } }
  ];
  const duplicates = await ResumeVersion.aggregate(pipeline);
  console.log("Duplicates:", duplicates);
  process.exit(0);
}

checkDuplicates().catch(console.error);
