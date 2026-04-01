import express from "express";
import cors from "cors";
import resumeRoutes from "./routes/resumeRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import viewRoutes from "./routes/viewRoutes.js";
import analyticsRoutes from "./routes/analyticsRoutes.js";
import linkRoutes from "./routes/linkRoutes.js";
import publicRoutes from "./routes/publicRoutes.js";

const app = express();

app.use(
  cors({
    origin: "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
  })
);
app.use(express.json());

app.get("/", (req, res) => {
  res.send("API is running...");
});
app.use("/api/resume", resumeRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/view", viewRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/link", linkRoutes);
app.use("/api/public", publicRoutes);

export default app;
