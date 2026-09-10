import express from "express";
import {
  createResume,
  deleteResume,
  deleteVersion,
  getMyResumes,
  updateResumeTitle,
  uploadVersion,
  getAllVersions,
  rollbackVersion,
  getUploadSignature,
} from "../controllers/resumeController.js";
import { protect } from "../middleware/authMiddleware.js";
import { validate } from "../middleware/validate.js";
import {
  createResumeSchema,
  updateResumeTitleSchema,
  resumeIdParamSchema,
  versionIdParamSchema,
} from "../utils/validationSchemas.js";

const router = express.Router();

router.post("/", protect, validate(createResumeSchema), createResume);
router.get("/me", protect, getMyResumes);
router.delete("/:resumeId", protect, validate(resumeIdParamSchema), deleteResume);
router.patch("/:resumeId/title", protect, validate(updateResumeTitleSchema), updateResumeTitle);
router.get("/:resumeId/upload-signature", protect, validate(resumeIdParamSchema), getUploadSignature);
router.post("/:resumeId/version", protect, validate(resumeIdParamSchema), uploadVersion);
router.delete("/:resumeId/version/:versionId", protect, validate(versionIdParamSchema), deleteVersion);
router.get("/:resumeId/versions", protect, validate(resumeIdParamSchema), getAllVersions);
router.post("/:resumeId/rollback/:versionId", protect, validate(versionIdParamSchema), rollbackVersion);

export default router;
