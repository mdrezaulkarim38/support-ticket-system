import express from "express";
import { register, login } from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";
import { registerRules, loginRules } from "../middleware/validators.js";

const router = express.Router();

router.post("/register", registerRules, register);
router.post("/login", loginRules, login);

router.get("/me", protect, (req, res) => {
  res.json({ user: req.user });
});

export default router;
