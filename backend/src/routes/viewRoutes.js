import express from "express";
import { trackView } from "../controllers/viewController.js";

const router = express.Router();

router.post("/:username", trackView);

export default router;
