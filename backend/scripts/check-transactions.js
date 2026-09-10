import mongoose from "mongoose";

async function checkTransactions() {
  await mongoose.connect("mongodb://localhost:27017/resumex");
  try {
    const session = await mongoose.startSession();
    session.startTransaction();
    
    // We actually need to do a write to really test if the replica set is active
    const Resume = mongoose.model("Resume", new mongoose.Schema({ title: String }));
    await Resume.create([{ title: "test" }], { session });
    
    console.log("Transactions supported!");
    await session.abortTransaction();
    session.endSession();
  } catch (err) {
    console.log("Transactions NOT supported:", err.message);
  }
  process.exit(0);
}

checkTransactions().catch(console.error);
