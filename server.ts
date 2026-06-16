import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini SDK with telemetry user-agent
const getGeminiClient = (): GoogleGenAI | null => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn("GEMINI_API_KEY is not defined. AI advisor features will run in mock/explanatory fallback mode.");
    return null;
  }
  return new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
};

// 1. Analyze Carbon Footprint API
app.post("/api/advisor/analyze", async (req, res) => {
  try {
    const { entries, habits, userProfile } = req.body;
    const ai = getGeminiClient();

    if (!ai) {
      // Fallback response with beautiful helpful mock insights if key is omitted
      return res.json({
        timestamp: new Date().toISOString(),
        summary: "You are doing an excellent job tracking your carbon footprint. Based on your current logs, utilities and transportation are your primary emission areas. Implementing a few small changes could significantly lower your environmental impact.",
        strengths: [
          "Regular logging of meat-free vegan/vegetarian meals.",
          "Committed to active and shared travel methods.",
          "Conscious shopping habits focusing on secondhand items."
        ],
        recommendations: [
          {
            title: "Transition Solo Car Commutes",
            description: "Try carpooling or taking train/public transport on two of your solo driving days.",
            savingsEstimate: "Save ~15.4 kg CO2e / week",
            category: "transport"
          },
          {
            title: "Lower Home Heating and Water Temperatures",
            description: "Washing laundry in cold water saves 0.5kg CO2e per cycle, and reducing heating by 2 degrees cuts carbon footprints considerably.",
            savingsEstimate: "Save ~5.0 kg CO2e / week",
            category: "utilities"
          },
          {
            title: "Pledge to Buy Wearables Secondhand",
            description: "Buying vintage or thrifted items instead of fast fashion saves approximately 10.8 kg of carbon per item.",
            savingsEstimate: "Save ~10.8 kg CO2e / item",
            category: "shopping"
          }
        ],
        isAiGenerated: false
      });
    }

    // Prepare carbon data summary as a text prompt for Gemini
    const carbonLogSummary = JSON.stringify(entries || []);
    const habitCommitments = JSON.stringify(habits || []);
    const profile = JSON.stringify(userProfile || {});

    const promptMessage = `
You are an expert Carbon Footprint Analyst. Analyze this user's carbon footprint profile and activity log:
- User Profile: ${profile}
- Fuel & Travel Activity Logs (last 7-14 days): ${carbonLogSummary}
- Active Habit Commitments: ${habitCommitments}

Provide an expert summary, top 2-3 strengths in their current behaviors, and 3 high-impact actionable recommendations to reduce their emissions.
Return the response strictly adhering to the requested JSON schema.
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: promptMessage,
      config: {
        systemInstruction: "You are the primary carbon footprint advisor, giving constructive, practical, encouraging advice. Avoid guilt; champion small incremental changes.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          required: ["summary", "strengths", "recommendations"],
          properties: {
            summary: {
              type: Type.STRING,
              description: "A friendly, expert 2-3 sentence overview of the user's progress and footprint priorities."
            },
            strengths: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "A list of 2 or 3 behaviors where the user is already low-carbon or improving."
            },
            recommendations: {
              type: Type.ARRAY,
              description: "3 concrete, high-impact suggestions customized to their profile.",
              items: {
                type: Type.OBJECT,
                required: ["title", "description", "savingsEstimate", "category"],
                properties: {
                  title: { type: Type.STRING, description: "A punchy, clear action title." },
                  description: { type: Type.STRING, description: "Detailed, practical guidelines on how to carry this out." },
                  savingsEstimate: { type: Type.STRING, description: "Est. carbon savings, e.g. 'Save 4.2 kg CO2e per day' or 'Save 15 kg CO2e/commute'." },
                  category: { type: Type.STRING, description: "Must be exactly one of: 'transport', 'food', 'utilities', or 'shopping'." }
                }
              }
            }
          }
        }
      }
    });

    const reportText = response.text;
    if (!reportText) {
      throw new Error("No response text from Gemini");
    }

    const payload = JSON.parse(reportText.trim());
    return res.json({
      timestamp: new Date().toISOString(),
      ...payload,
      isAiGenerated: true
    });

  } catch (error: any) {
    console.error("Gemini carbon advisor error:", error);
    return res.status(500).json({
      error: "Could not generate insights",
      details: error.message
    });
  }
});

// 2. Chat Q&A Carbon Advisor API
app.post("/api/advisor/chat", async (req, res) => {
  try {
    const { message, history } = req.body;
    const ai = getGeminiClient();

    if (!ai) {
      // Fallback explanatory responses
      let reply = "I would love to help you estimate that! Usually, making a direct choice like walking instead of driving is the most immediate way to drop emissions. Once you configure your Gemini API Key in the Secrets panel, I can answer complex questions about carbon footprints in real-time!";
      const lower = message.toLowerCase();
      if (lower.includes("paper") || lower.includes("plastic") || lower.includes("bag")) {
        reply = "Paper bags usually require more energy and water to produce than plastic, but decompose naturally without microplastics. Best option is a reusable canvas bag used at least 50 times!";
      } else if (lower.includes("car") || lower.includes("vehicle") || lower.includes("transit")) {
        reply = "Taking trains or buses is almost always lower footprint (up to 70-80% lower emission per passenger-kilometer) than riding in a solo gasoline passenger car.";
      } else if (lower.includes("beef") || lower.includes("vegan") || lower.includes("plant")) {
        reply = "Beef is highly carbon-intensive: roughly 6.8kg of CO2e per meal compared to only 0.6kg or less for a fully plant-based vegan meal. Turning one meal a day vegan is an incredibly low-friction carbon victory!";
      }
      return res.json({ text: reply });
    }

    // Build chat structure with context
    const chatSession = ai.chats.create({
      model: "gemini-3.5-flash",
      config: {
        systemInstruction: `You are Carbon Buddy, an enthusiastic, highly knowledgeable, friendly carbon footprint and environmental science specialist.
Keep explanations accurate, easy to understand, and concrete. Give actionable carbon metrics (e.g. 'Manufacturing a standard plastic bottle emits about 80g of CO2').
Use respectful, positive, encouraging language.`
      }
    });

    // Populate history if provided
    if (history && history.length > 0) {
      for (const item of history.slice(-6)) { // take last 3 QAs to avoid overloading
        if (item.sender === "user") {
          await chatSession.sendMessage({ message: item.text });
        }
      }
    }

    const response = await chatSession.sendMessage({ message });
    return res.json({ text: response.text });

  } catch (error: any) {
    console.error("Gemini chat error:", error);
    return res.status(500).json({
      error: "Error processing question",
      details: error.message
    });
  }
});

// Vite middleware and serving logic
async function bootstrap() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server starting on port ${PORT}`);
  });
}

bootstrap();
