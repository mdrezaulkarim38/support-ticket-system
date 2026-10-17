import { GoogleGenerativeAI } from "@google/generative-ai";

const CATEGORIES = ["Technical", "Billing", "Account", "Feature Request", "General"];
const PRIORITIES = ["Low", "Medium", "High", "Urgent"];

const FALLBACK = { category: "General", priority: "Medium" };

let client = null;

const getClient = () => {
  if (!process.env.GEMINI_API_KEY) return null;
  if (!client) client = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  return client;
};

const buildPrompt = (title, description) => `
You are a support ticket classifier.
Analyze the following ticket and return ONLY a valid JSON object (no extra text, no markdown):

{
  "category": "one of: Technical, Billing, Account, Feature Request, General",
  "priority": "one of: Low, Medium, High, Urgent"
}

Rules:
- "Technical": bugs, errors, crashes, login failures, performance.
- "Billing": payments, invoices, refunds, subscription charges.
- "Account": profile, password reset, email change, access.
- "Feature Request": asking for new functionality.
- "General": anything that does not clearly fit the above.
- "Urgent": service down or data loss. "High": blocked work. "Medium": normal. "Low": minor/cosmetic.

Title: ${title}
Description: ${description}
`;

const parseSuggestion = (text) => {
  const cleaned = text.replace(/```json/gi, "").replace(/```/g, "").trim();
  const match = cleaned.match(/\{[\s\S]*\}/);
  const parsed = JSON.parse(match ? match[0] : cleaned);

  return {
    category: CATEGORIES.includes(parsed.category) ? parsed.category : FALLBACK.category,
    priority: PRIORITIES.includes(parsed.priority) ? parsed.priority : FALLBACK.priority,
  };
};

export const analyzeTicket = async (title, description) => {
  const genAI = getClient();
  if (!genAI) {
    console.warn("AI Analysis skipped: GEMINI_API_KEY is not set");
    return { ...FALLBACK };
  }

  try {
    const model = genAI.getGenerativeModel({
      model: process.env.GEMINI_MODEL || "gemini-3.5-flash-lite",
    });

    const result = await model.generateContent(buildPrompt(title, description));
    return parseSuggestion(result.response.text());
  } catch (error) {
    console.error("AI Analysis Error:", error.message);
    return { ...FALLBACK };
  }
};
