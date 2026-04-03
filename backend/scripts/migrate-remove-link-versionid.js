import mongoose from "mongoose";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

import Link from "../src/models/Link.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, "..", ".env") });

async function runMigration() {
  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI is missing in backend/.env");
  }

  await mongoose.connect(process.env.MONGO_URI);

  const linksCollection = Link.collection;

  const withLegacyField = await linksCollection.countDocuments({
    versionId: { $exists: true },
  });

  if (withLegacyField === 0) {
    console.log(
      "No legacy versionId fields found on Link documents. Nothing to migrate.",
    );
    return;
  }

  const result = await linksCollection.updateMany(
    { versionId: { $exists: true } },
    { $unset: { versionId: "" } },
  );

  const remaining = await linksCollection.countDocuments({
    versionId: { $exists: true },
  });

  console.log("Link versionId cleanup complete.");
  console.log(`Matched: ${result.matchedCount}`);
  console.log(`Modified: ${result.modifiedCount}`);
  console.log(`Remaining docs with versionId: ${remaining}`);
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
