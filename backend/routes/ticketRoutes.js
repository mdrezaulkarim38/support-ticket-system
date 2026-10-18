import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { requireRole } from "../middleware/roleMiddleware.js";
import {
  createTicket,
  getTickets,
  getTicket,
  updateStatus,
  assignTicket,
  getActivity,
} from "../controllers/ticketController.js";
import { createTicketRules, statusRules } from "../middleware/validators.js";

const router = express.Router();

router.use(protect);

router
  .route("/")
  .get(getTickets)
  .post(requireRole("customer"), createTicketRules, createTicket);

router.get("/:id/activity", getActivity);
router.patch("/:id/status", requireRole("agent"), statusRules, updateStatus);
router.patch("/:id/assign", requireRole("agent"), assignTicket);
router.get("/:id", getTicket);

export default router;
