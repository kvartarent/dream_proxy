import express from "express";
import cors from "cors";
import { GoogleGenAI } from "@google/genai";

const app = express();
app.use(cors());
app.use(express.json({ limit: "1mb" }));

const PORT = process.env.PORT || 8080;
const API_KEY = process.env.GEMINI_API_KEY;

if (!API_KEY) {
  console.warn("GEMINI_API_KEY is not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

app.get("/health", (req, res) => res.json({ ok: true }));

app.post("/interpret", async (req, res) => {
  try {
    const { dreamText } = req.body || {};
    if (!dreamText || typeof dreamText !== "string") {
      return res.status(400).json({ error: "dreamText is required" });
    }

    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: `Проанализируй сон: "${dreamText}"`,
      config: {
        systemInstruction:
          "Ты мистический психоаналитик. Твоя задача — расшифровать сон, используя психологические архетипы Юнга. Предложи поэтичное название (title), глубокое толкование (interpretation), жизненный совет (advice) и 3 коротких тега (tags). Определи настроение сна (mood) из списка: mystical, dark, bright, neutral. Ответ должен быть строго в формате JSON.",
        responseMimeType: "application/json",
      },
    });

    res.json(JSON.parse(response.text));
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Gemini error" });
  }
});

app.listen(PORT, () => console.log(`Proxy listening on ${PORT}`));
