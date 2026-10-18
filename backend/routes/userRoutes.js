import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { requireRole } from "../middleware/roleMiddleware.js";
import { getAgents, createAgent } from "../controllers/userController.js";
import { createAgentRules } from "../middleware/validators.js";

const router = express.Router();

router.get("/agents", protect, requireRole("admin", "agent"), getAgents);
router.post(
  "/agents",
  protect,
  requireRole("admin"),
  createAgentRules,
  createAgent
);

export default router;
