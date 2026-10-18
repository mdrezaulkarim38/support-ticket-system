import Comment from "../models/Comment.js";
import Ticket from "../models/Ticket.js";

const canAccess = (ticket, user) => {
  if (user.role === "admin") return true;
  if (user.role === "agent") {
    if (!ticket.assignedTo) return false;
    return String(ticket.assignedTo) === String(user._id);
  }
  return ticket.createdBy.equals(user._id);
};

export const addComment = async (req, res) => {
  try {
    const { message } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ message: "Message is required" });
    }

    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    if (!canAccess(ticket, req.user)) {
      return res.status(403).json({ message: "Not authorized for this ticket" });
    }

    const comment = await Comment.create({
      ticket: ticket._id,
      user: req.user._id,
      message: message.trim(),
    });
    await comment.populate("user", "name email role");

    res.status(201).json(comment);
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(404).json({ message: "Ticket not found" });
    }
    res.status(500).json({ message: error.message });
  }
};

export const getComments = async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    if (!canAccess(ticket, req.user)) {
      return res.status(403).json({ message: "Not authorized for this ticket" });
    }

    const comments = await Comment.find({ ticket: ticket._id })
      .populate("user", "name email role")
      .sort({ createdAt: 1 });

    res.json(comments);
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(404).json({ message: "Ticket not found" });
    }
    res.status(500).json({ message: error.message });
  }
};
