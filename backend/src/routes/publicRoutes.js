import express from "express";
import { accessResumeViaLink, accessDefaultResume } from "../controllers/publicController.js";

const router = express.Router();

router.get("/:username", accessDefaultResume);
router.get("/:username/:slug", accessResumeViaLink);

export default router;
