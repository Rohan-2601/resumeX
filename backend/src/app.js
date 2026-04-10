import express from "express";
import cors from "cors";
import resumeRoutes from "./routes/resumeRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import viewRoutes from "./routes/viewRoutes.js";
import analyticsRoutes from "./routes/analyticsRoutes.js";
import publicRoutes from "./routes/publicRoutes.js";

const app = express();

const allowedOrigins = (
  process.env.FRONTEND_URL ||
  "http://localhost:3000,https://resume-x-frontend-kappa.vercel.app, http://localhost:3001"
)
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const corsOptions = {
  origin: (origin, callback) => {
    // Allow same-origin/server-to-server calls that do not send Origin.
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error("Not allowed by CORS"));
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());

app.get("/", (req, res) => {
  res.send("API is running...");
});
app.use("/api/resume", resumeRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/view", viewRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/public", publicRoutes);

export default app;
