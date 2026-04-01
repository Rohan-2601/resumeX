import express from "express";
import { accessResumeViaLink } from "../controllers/publicController.js";

const router = express.Router();

router.get("/:username/:slug", accessResumeViaLink);

export default router;
