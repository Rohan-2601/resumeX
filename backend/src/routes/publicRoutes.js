import express from "express";
import {
  accessResumeViaLink,
  accessDefaultResume,
  getPublicDefaultResumeMeta,
  getPublicResumeMeta,
} from "../controllers/publicController.js";

const router = express.Router();

router.get("/:username/meta", getPublicDefaultResumeMeta);
router.get("/:username", accessDefaultResume);
router.get("/:username/:slug/meta", getPublicResumeMeta);
router.get("/:username/:slug", accessResumeViaLink);

export default router;
