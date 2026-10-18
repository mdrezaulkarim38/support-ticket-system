import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { addComment, getComments } from "../controllers/commentController.js";
import { commentRules } from "../middleware/validators.js";

const router = express.Router({ mergeParams: true });

router.use(protect);

router.route("/").get(getComments).post(commentRules, addComment);

export default router;
