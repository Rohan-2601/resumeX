import express from "express";
import {
  createResume,
  deleteResume,
  getMyResumes,
  updateResumeTitle,
  uploadVersion,
  getAllVersions,
  rollbackVersion,
  getResumeByUsername,
} from "../controllers/resumeController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, createResume);
router.get("/me", protect, getMyResumes);
router.delete("/:resumeId", protect, deleteResume);
router.patch("/:resumeId/title", protect, updateResumeTitle);
router.post("/:resumeId/version", protect, uploadVersion);
router.get("/:resumeId/versions", protect, getAllVersions);
router.post("/:resumeId/rollback/:versionId", protect, rollbackVersion);
router.get("/:username/:slug", getResumeByUsername);
router.get("/:username", getResumeByUsername);

export default router;
