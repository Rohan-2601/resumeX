import express from "express";
import {
  accessResumeViaLink,
  accessDefaultResume,
  getPublicDefaultResumeMeta,
  getPublicResumeMeta,
  trackDefaultResumeView,
  trackResumeView,
} from "../controllers/publicController.js";
import { validate } from "../middleware/validate.js";
import {
  getPublicResumeMetaSchema,
  getPublicDefaultResumeMetaSchema,
} from "../utils/validationSchemas.js";

const router = express.Router();

router.get("/:username/meta", validate(getPublicDefaultResumeMetaSchema), getPublicDefaultResumeMeta);
router.get("/:username", validate(getPublicDefaultResumeMetaSchema), accessDefaultResume);
router.post("/:username/view", validate(getPublicDefaultResumeMetaSchema), trackDefaultResumeView);
router.get("/:username/:slug/meta", validate(getPublicResumeMetaSchema), getPublicResumeMeta);
router.get("/:username/:slug", validate(getPublicResumeMetaSchema), accessResumeViaLink);
router.post("/:username/:slug/view", validate(getPublicResumeMetaSchema), trackResumeView);

export default router;
