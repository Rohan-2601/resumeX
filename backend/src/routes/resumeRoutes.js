import express from "express";
import {
  createResume,
  updateResumeTitle,
  uploadVersion,
  getAllVersions,
  rollbackVersion,
  getResumeByUsername,
} from "../controllers/resumeController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, createResume);
router.patch("/:resumeId/title", protect, updateResumeTitle);
router.post("/:resumeId/version", protect, uploadVersion);
router.get("/:resumeId/versions", protect, getAllVersions);
router.post("/:resumeId/rollback/:versionId", protect, rollbackVersion);
router.get("/:username", getResumeByUsername);

export default router;
