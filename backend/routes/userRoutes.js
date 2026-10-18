import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { requireRole } from "../middleware/roleMiddleware.js";
import { getAgents } from "../controllers/userController.js";

const router = express.Router();

router.get("/agents", protect, requireRole("agent"), getAgents);

export default router;
