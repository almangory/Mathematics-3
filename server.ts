import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

let aiClient: GoogleGenAI | null = null;

function getAiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is required but missing.");
    }
    aiClient = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Route for Friendly Interactive Math Assistant explains textbook problems
  app.post("/api/explain", async (req, res) => {
    try {
      const { prompt } = req.body;
      if (!prompt) {
        return res.status(400).json({ error: "Missing prompt parameter." });
      }

      console.log(`[AI Explanation API Request]: ${prompt}`);
      const ai = getAiClient();
      
      const systemInstruction = 
        `أنت المعلم البطل "حسون"، ببغاء حكيم ومرح وصديق للأطفال في الابتدائية في السودان. ` +
        `وظيفتك شرح مفاهيم الرياضيات والمسائل الحسابية لأطفال الصف الثالث الابتدائي بأسلوب ممتع ولطيف وبسيط جداً. ` +
        `دائماً شجع الأطفال مستخدماً عبارات مثل: "أحسنت يا عبقري!"، "يا سلام على الشطارة!"، "أنت بطل غابة الأرقام!". ` +
        `تحدث بلغة عربية عامية لطيفة قريبة لقلوب الأطفال السودانيين، واستخدم أمثلة واقعية وبسيطة من البيئة والفاكهة (مثل الموز والمنجو والدجاج والطيور). ` +
        `اجعل الإجابة منسقة ومقسمة بعناوين ونقاط واضحة جداً، ومطعّمة بالكثير من الرموز التعبيرية المفرحة للأطفال مثل (🍎, 🍌, 🦜, 📐, ⭐, 🎈). ` +
        `لا تذكر تفاصيل تقنية معقدة أو معادلات صعبة جداً فوق سنهم، وبسط الكسور برسم البيتزا والساعة والمقارنة الكرتونية.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          systemInstruction: systemInstruction,
          temperature: 0.8,
        }
      });

      const explanation = response.text || "أوه! حسون عاجز عن التفكير بالمسألة الآن، اكتب لي سؤالاً آخر يا بطل!";
      
      res.json({
        status: "ok",
        explanation: explanation
      });
    } catch (error: any) {
      console.error("[Gemini API Error in Server]:", error);
      res.status(500).json({
        status: "error",
        message: "عذراً يا بطل! واجهنا مشكلة في التواصل مع حسون المساعد الذكي. تفحص إعدادات مفتاح GEMINI_API_KEY.",
        error: error.message
      });
    }
  });

  // Serve static assets and Vite development setup
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server is running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
