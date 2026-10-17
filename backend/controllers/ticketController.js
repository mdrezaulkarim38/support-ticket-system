import Ticket from "../models/Ticket.js";
import { analyzeTicket } from "../utils/aiService.js";

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
    .populate("assignedTo", "name email");

export const createTicket = async (req, res) => {
  try {
    const { title, description } = req.body;

    if (!title || !description) {
      return res
        .status(400)
        .json({ message: "Please provide title and description" });
    }

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

    const isOwner = ticket.createdBy._id.equals(req.user._id);
    if (req.user.role !== "agent" && !isOwner) {
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

    if (!status || !STATUSES.includes(status)) {
      return res.status(400).json({ message: "Please provide a valid status" });
    }

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

    ticket.status = status;
    await ticket.save();

    res.json(ticket);
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(404).json({ message: "Ticket not found" });
    }
    res.status(500).json({ message: error.message });
  }
};
