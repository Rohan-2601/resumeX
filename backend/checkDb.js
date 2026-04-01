import mongoose from "mongoose";
import dotenv from "dotenv";
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '.env') });

import User from "./src/models/User.js";
import Resume from "./src/models/Resume.js";

async function check() {
  await mongoose.connect(process.env.MONGO_URI);
  let out = "Users:\n";

  const users = await User.find().lean();
  users.forEach(u => out += `${u.username} ${u._id}\n`);

  out += "Resumes:\n";
  const resumes = await Resume.find().lean();
  resumes.forEach(r => out += `${r._id} ${r.userId} ${r.isActive} ${r.fileUrl}\n`);

  fs.writeFileSync('output2.txt', out, 'utf8');
  console.log("Done");
  process.exit(0);
}

check().catch(console.error);
