import Ticket from "../models/Ticket.js";
import Activity from "../models/Activity.js";
import User from "../models/User.js";
import { analyzeTicket } from "../utils/aiService.js";
import { logActivity } from "../utils/activity.js";

const STATUSES = ["Open", "In Progress", "Resolved", "Closed"];

const ALLOWED_TRANSITIONS = {
  Open: ["In Progress", "Closed"],
  "In Progress": ["Resolved", "Closed"],
  Resolved: ["Closed"],
  Closed: [],
};

const withRefs = (query) =>
  query
    .populate("createdBy", "name email role")
    .populate("assignedTo", "name email role");

const canAccess = (ticket, user) =>
  user.role === "agent" || ticket.createdBy.equals(user._id);

export const createTicket = async (req, res) => {
  try {
    const { title, description } = req.body;

    const { category, priority } = await analyzeTicket(title, description);

    const ticket = await Ticket.create({
      title,
      description,
      category,
      priority,
      aiSuggestedCategory: category,
      aiSuggestedPriority: priority,
      createdBy: req.user._id,
    });

    await logActivity({
      ticket: ticket._id,
      actor: req.user._id,
      action: "created",
      meta: { category, priority },
    });

    res.status(201).json(ticket);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getTickets = async (req, res) => {
  try {
    const filter = {};

    if (req.user.role !== "agent") {
      filter.createdBy = req.user._id;
    }

    if (req.query.status) {
      if (!STATUSES.includes(req.query.status)) {
        return res.status(400).json({ message: "Invalid status filter" });
      }
      filter.status = req.query.status;
    }

    const tickets = await withRefs(Ticket.find(filter)).sort({ createdAt: -1 });
    res.json(tickets);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getTicket = async (req, res) => {
  try {
    const ticket = await withRefs(Ticket.findById(req.params.id));
    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    if (!canAccess(ticket, req.user)) {
      return res.status(403).json({ message: "Not authorized to view this ticket" });
    }

    res.json(ticket);
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(404).json({ message: "Ticket not found" });
    }
    res.status(500).json({ message: error.message });
  }
};

export const updateStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    if (ticket.status === status) {
      return res.status(400).json({ message: `Ticket is already ${status}` });
    }

    if (!ALLOWED_TRANSITIONS[ticket.status].includes(status)) {
      return res.status(400).json({
        message: `Invalid transition from ${ticket.status} to ${status}`,
      });
    }

    const from = ticket.status;
    ticket.status = status;
    await ticket.save();

    await logActivity({
      ticket: ticket._id,
      actor: req.user._id,
      action: "status_changed",
      meta: { from, to: status },
    });

    res.json(ticket);
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(404).json({ message: "Ticket not found" });
    }
    res.status(500).json({ message: error.message });
  }
};

export const assignTicket = async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    const hasField = Object.prototype.hasOwnProperty.call(
      req.body,
      "assignedTo"
    );
    let value = hasField ? req.body.assignedTo : req.user._id;

    if (value) {
      const agent = await User.findById(value);
      if (!agent || agent.role !== "agent") {
        return res
          .status(400)
          .json({ message: "Assignee must be an agent" });
      }
    } else {
      value = null;
    }

    const previous = ticket.assignedTo ? String(ticket.assignedTo) : null;
    const next = value ? String(value) : null;
    if (previous === next) {
      return res
        .status(400)
        .json({ message: "Ticket assignment is unchanged" });
    }

    ticket.assignedTo = value;
    await ticket.save();
    await ticket.populate("createdBy", "name email role");
    await ticket.populate("assignedTo", "name email role");

    await logActivity({
      ticket: ticket._id,
      actor: req.user._id,
      action: next ? (previous ? "reassigned" : "assigned") : "unassigned",
      meta: { to: ticket.assignedTo?.name || null },
    });

    res.json(ticket);
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(404).json({ message: "Ticket not found" });
    }
    res.status(500).json({ message: error.message });
  }
};

export const getActivity = async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    if (!canAccess(ticket, req.user)) {
      return res.status(403).json({ message: "Not authorized for this ticket" });
    }

    const activity = await Activity.find({ ticket: ticket._id })
      .populate("actor", "name role")
      .sort({ createdAt: 1 });

    res.json(activity);
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(404).json({ message: "Ticket not found" });
    }
    res.status(500).json({ message: error.message });
  }
};
