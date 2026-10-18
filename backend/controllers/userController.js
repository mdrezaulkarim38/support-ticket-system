import User from "../models/User.js";

const publicUser = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
});

export const getAgents = async (req, res) => {
  try {
    const agents = await User.find({ role: "agent" }).select(
      "name email role"
    );
    res.json(agents);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createAgent = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(409).json({ message: "Email already registered" });
    }

    const agent = await User.create({
      name,
      email,
      password,
      role: "agent",
    });

    res.status(201).json(publicUser(agent));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
