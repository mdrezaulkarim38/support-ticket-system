import Ticket from "../models/Ticket.js";
import Activity from "../models/Activity.js";
import User from "../models/User.js";
import { analyzeTicket } from "../utils/aiService.js";
import { logActivity } from "../utils/activity.js";

const STATUSES = ["Open", "In Progress", "Resolved", "Closed"];
const PRIORITIES = ["Low", "Medium", "High", "Urgent"];

const ALLOWED_TRANSITIONS = {
  Open: ["In Progress", "Closed"],
  "In Progress": ["Resolved", "Closed"],
  Resolved: ["Closed"],
  Closed: [],
};

const SORTS = {
  newest: { createdAt: -1 },
  oldest: { createdAt: 1 },
  updated: { updatedAt: -1 },
  priority: { priorityRank: 1, createdAt: -1 },
  title: { title: 1 },
};

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const populatedUsers = [
  {
    $lookup: {
      from: "users",
      localField: "createdBy",
      foreignField: "_id",
      as: "createdBy",
      pipeline: [{ $project: { name: 1, email: 1, role: 1 } }],
    },
  },
  {
    $lookup: {
      from: "users",
      localField: "assignedTo",
      foreignField: "_id",
      as: "assignedTo",
      pipeline: [{ $project: { name: 1, email: 1, role: 1 } }],
    },
  },
  { $unwind: { path: "$createdBy", preserveNullAndEmptyArrays: true } },
  { $unwind: { path: "$assignedTo", preserveNullAndEmptyArrays: true } },
];

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
    const { q, status, priority, category, sort = "newest" } = req.query;

    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(
      Math.max(parseInt(req.query.limit, 10) || 10, 1),
      100
    );

    const filter = {};
    if (req.user.role !== "agent") {
      filter.createdBy = req.user._id;
    }
    if (status) {
      if (!STATUSES.includes(status)) {
        return res.status(400).json({ message: "Invalid status filter" });
      }
      filter.status = status;
    }
    if (priority) {
      if (!PRIORITIES.includes(priority)) {
        return res.status(400).json({ message: "Invalid priority filter" });
      }
      filter.priority = priority;
    }
    if (category) {
      filter.category = category;
    }
    if (q && q.trim()) {
      const regex = new RegExp(escapeRegex(q.trim()), "i");
      filter.$or = [{ title: regex }, { description: regex }];
    }

    const sortStage = SORTS[sort] || SORTS.newest;

    const [result] = await Ticket.aggregate([
      { $match: filter },
      {
        $addFields: {
          priorityRank: {
            $switch: {
              branches: [
                { case: { $eq: ["$priority", "Urgent"] }, then: 0 },
                { case: { $eq: ["$priority", "High"] }, then: 1 },
                { case: { $eq: ["$priority", "Medium"] }, then: 2 },
              ],
              default: 3,
            },
          },
        },
      },
      {
        $facet: {
          items: [
            { $sort: sortStage },
            { $skip: (page - 1) * limit },
            { $limit: limit },
            ...populatedUsers,
            { $project: { priorityRank: 0 } },
          ],
          count: [{ $count: "total" }],
        },
      },
    ]);

    const total = result.count[0]?.total || 0;

    res.json({
      items: result.items,
      total,
      page,
      limit,
      pages: Math.max(Math.ceil(total / limit), 1),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getStats = async (req, res) => {
  try {
    const match = req.user.role === "agent" ? {} : { createdBy: req.user._id };

    const [statusAgg, priorityAgg] = await Promise.all([
      Ticket.aggregate([
        { $match: match },
        { $group: { _id: "$status", count: { $sum: 1 } } },
      ]),
      Ticket.aggregate([
        { $match: match },
        { $group: { _id: "$priority", count: { $sum: 1 } } },
      ]),
    ]);

    const byStatus = STATUSES.reduce((acc, key) => ({ ...acc, [key]: 0 }), {});
    const byPriority = PRIORITIES.reduce((acc, key) => ({ ...acc, [key]: 0 }), {});
    let total = 0;

    statusAgg.forEach((row) => {
      byStatus[row._id] = row.count;
      total += row.count;
    });
    priorityAgg.forEach((row) => {
      byPriority[row._id] = row.count;
    });

    res.json({ total, byStatus, byPriority });
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
