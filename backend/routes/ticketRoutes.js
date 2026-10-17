import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { requireRole } from "../middleware/roleMiddleware.js";
import {
  createTicket,
  getTickets,
  getTicket,
  updateStatus,
} from "../controllers/ticketController.js";

const router = express.Router();

router.use(protect);

router
  .route("/")
  .get(getTickets)
  .post(requireRole("customer"), createTicket);

router.get("/:id", getTicket);
router.patch("/:id/status", requireRole("agent"), updateStatus);

export default router;
