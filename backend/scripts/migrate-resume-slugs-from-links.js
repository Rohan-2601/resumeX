import mongoose from "mongoose";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, "..", ".env") });

async function runMigration() {
  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI is missing in backend/.env");
  }

  await mongoose.connect(process.env.MONGO_URI);

  const linksCollection = mongoose.connection.collection("links");
  const resumesCollection = mongoose.connection.collection("resumes");

  const links = await linksCollection
    .find({
      resumeId: { $exists: true },
      slug: { $exists: true, $type: "string" },
    })
    .toArray();

  let updated = 0;
  let skipped = 0;

  for (const link of links) {
    const resume = await resumesCollection.findOne({ _id: link.resumeId });

    if (!resume) {
      skipped += 1;
      continue;
    }

    if (resume.slug === link.slug) {
      skipped += 1;
      continue;
    }

    const conflict = await resumesCollection.findOne({
      userId: resume.userId,
      slug: link.slug,
      _id: { $ne: resume._id },
    });

    if (conflict) {
      skipped += 1;
      continue;
    }

    if (!resume.slug) {
      await resumesCollection.updateOne(
        { _id: resume._id },
        { $set: { slug: link.slug } },
      );
      updated += 1;
      continue;
    }

    skipped += 1;
  }

  console.log("Resume slug migration complete.");
  console.log(`Updated: ${updated}`);
  console.log(`Skipped: ${skipped}`);
}

runMigration()
  .then(async () => {
    await mongoose.disconnect();
    process.exit(0);
  })
  .catch(async (error) => {
    console.error("Migration failed:", error.message);
    await mongoose.disconnect();
    process.exit(1);
  });
