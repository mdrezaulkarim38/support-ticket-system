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
  getStats,
  improveTicketDraft,
} from "../controllers/ticketController.js";
import {
  createTicketRules,
  statusRules,
  improveTicketRules,
} from "../middleware/validators.js";

const router = express.Router();

router.use(protect);

router.post(
  "/improve",
  requireRole("customer"),
  improveTicketRules,
  improveTicketDraft
);

router
  .route("/")
  .get(getTickets)
  .post(requireRole("customer"), createTicketRules, createTicket);

router.get("/stats", getStats);
router.get("/:id/activity", getActivity);
router.patch(
  "/:id/status",
  requireRole("agent", "admin"),
  statusRules,
  updateStatus
);
router.patch("/:id/assign", requireRole("agent", "admin"), assignTicket);
router.get("/:id", getTicket);

export default router;
