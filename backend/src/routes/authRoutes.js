import express from "express";
import rateLimit from "express-rate-limit";
import {
  register,
  login,
  githubLogin,
  githubCallback,
  exchangeOAuthCode,
  getMe,
} from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";
import { validate } from "../middleware/validate.js";
import {
  registerSchema,
  loginSchema,
  exchangeOAuthCodeSchema,
} from "../utils/validationSchemas.js";

const router = express.Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // Limit each IP to 20 requests per windowMs
  message: "Too many authentication attempts, please try again later",
  standardHeaders: true,
  legacyHeaders: false,
});

router.post("/register", authLimiter, validate(registerSchema), register);
router.post("/login", authLimiter, validate(loginSchema), login);
router.get("/github", authLimiter, githubLogin);
router.get("/github/callback", authLimiter, githubCallback);
router.post("/exchange", authLimiter, validate(exchangeOAuthCodeSchema), exchangeOAuthCode);
router.get("/me", protect, getMe);

export default router;
