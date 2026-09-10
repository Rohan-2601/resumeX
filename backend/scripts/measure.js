import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { performance } from 'perf_hooks';

dotenv.config({ path: './.env' });

async function measure() {
  await mongoose.connect(process.env.MONGO_URI);
  
  const db = mongoose.connection.db;
  const resume = await db.collection('resumes').findOne({ currentVersionId: { $exists: true, $ne: null } });
  if (!resume) {
    console.log("No valid resume found");
    process.exit(1);
  }
  
  const user = await db.collection('users').findOne({ _id: resume.userId });
  console.log(`Testing with User: ${user.username}, Slug: ${resume.slug}`);
  
  const backendUrl = `http://localhost:5000/api/public/${user.username}/${resume.slug}`;
  const viewUrl = `http://localhost:5000/api/public/${user.username}/${resume.slug}/view`;
  
  console.log("--- 1. Backend API (Data) TTFB ---");
  let start = performance.now();
  let res = await fetch(backendUrl);
  let end = performance.now();
  console.log(`Backend API Time: ${(end - start).toFixed(2)} ms`);
  let data = await res.json();
  
  console.log("--- 2. Backend API (View Tracking) TTFB ---");
  const initialViews = await db.collection('views').countDocuments({ resumeId: resume._id });
  start = performance.now();
  const viewRes = await fetch(viewUrl, { method: "POST" });
  end = performance.now();
  console.log(`View POST Time: ${(end - start).toFixed(2)} ms`);
  console.log(`View HTTP Status: ${viewRes.status}`);

  // Wait briefly for the DB write
  await new Promise(resolve => setTimeout(resolve, 200));
  const finalViews = await db.collection('views').countDocuments({ resumeId: resume._id });
  console.log(`Views changed from ${initialViews} to ${finalViews}`);
  
  process.exit(0);
}

measure().catch(console.error);
