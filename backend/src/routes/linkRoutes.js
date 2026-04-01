import express from "express";
import { createLink, getAllLinks } from "../controllers/linkController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", protect, getAllLinks);
router.post("/", protect, createLink);

export default router;
