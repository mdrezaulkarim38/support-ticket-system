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

const parseJsonObject = (text) => {
  const cleaned = text.replace(/```json/gi, "").replace(/```/g, "").trim();
  const match = cleaned.match(/\{[\s\S]*\}/);
  return JSON.parse(match ? match[0] : cleaned);
};

const clamp = (value, max) => value.slice(0, max);

const buildImprovePrompt = (title, description) => `
You are an assistant that rewrites support tickets so they are clear, specific and professional.

Rewrite the ticket below. Fix spelling and grammar, keep the original meaning, and make it
easy for a support agent to understand. Do not invent facts. If a title is missing, write
a short one. Keep the title under 150 characters.

Return ONLY a valid JSON object (no markdown, no extra text):

{
  "title": "...",
  "description": "..."
}

Title: ${title}
Description: ${description}
`;

export const improveTicket = async (title = "", description = "") => {
  const cleanTitle = clamp(title.trim(), 150);
  const cleanDescription = clamp(description.trim(), 5000);

  const fallback = {
    title: cleanTitle || "Support request",
    description: cleanDescription,
  };

  const genAI = getClient();
  if (!genAI) {
    console.warn("AI improve skipped: GEMINI_API_KEY is not set");
    return fallback;
  }

  try {
    const model = genAI.getGenerativeModel({
      model: process.env.GEMINI_MODEL || "gemini-3.5-flash-lite",
    });

    const result = await model.generateContent(
      buildImprovePrompt(cleanTitle, cleanDescription)
    );
    const parsed = parseJsonObject(result.response.text());

    return {
      title:
        typeof parsed.title === "string" && parsed.title.trim()
          ? clamp(parsed.title.trim(), 150)
          : fallback.title,
      description:
        typeof parsed.description === "string" && parsed.description.trim()
          ? clamp(parsed.description.trim(), 5000)
          : fallback.description,
    };
  } catch (error) {
    console.error("AI Improve Error:", error.message);
    return fallback;
  }
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
