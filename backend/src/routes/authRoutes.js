import express from "express";
import { githubLogin, githubCallback, getMe } from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/github", githubLogin);
router.get("/github/callback", githubCallback);
router.get("/me", protect, getMe);

export default router;
