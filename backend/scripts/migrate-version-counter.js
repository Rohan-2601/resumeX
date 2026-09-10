import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

async function runMigration() {
  await mongoose.connect(process.env.MONGO_URI);
  
  const Resume = mongoose.model("Resume", new mongoose.Schema({ versionCounter: Number }, { strict: false }));
  const ResumeVersion = mongoose.model("ResumeVersion", new mongoose.Schema({ resumeId: mongoose.Schema.Types.ObjectId, versionNumber: Number }, { strict: false }));
  
  const resumes = await Resume.find({});
  let updatedCount = 0;
  
  for (const resume of resumes) {
    const latestVersion = await ResumeVersion.findOne({ resumeId: resume._id }).sort({ versionNumber: -1 });
    const maxVersion = latestVersion ? latestVersion.versionNumber : 0;
    
    await Resume.updateOne({ _id: resume._id }, { $set: { versionCounter: maxVersion } });
    updatedCount++;
    console.log(`Updated Resume ${resume._id} with versionCounter = ${maxVersion}`);
  }
  
  console.log(`Migration completed. Updated ${updatedCount} resumes.`);
  process.exit(0);
}

runMigration().catch(console.error);
