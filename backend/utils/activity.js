import Activity from "../models/Activity.js";

export const logActivity = async ({ ticket, actor, action, meta = {} }) => {
  try {
    await Activity.create({ ticket, actor, action, meta });
  } catch (error) {
    console.error("Activity log error:", error.message);
  }
};
