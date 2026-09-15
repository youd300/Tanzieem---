import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { createServer as createViteServer } from 'vite';
import { apiRouter } from './server/routes';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Mount the comprehensive production Tanzieem API router
app.use('/api', apiRouter);

// Lazy-initialized Gemini AI client
let aiClient: GoogleGenAI | null = null;
function getAI(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    try {
      aiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    } catch (e) {
      console.warn('Failed to initialize GoogleGenAI client:', e);
    }
  }
  return aiClient;
}

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'Tanzieem Chrono Backend' });
});

// AI Time Coach API Endpoint
app.post('/api/ai-coach', async (req, res) => {
  try {
    const { prompt, userContext } = req.body;
    const ai = getAI();

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    if (ai) {
      try {
        const systemInstruction = `
You are the Tanzieem Chrono Coach — an intelligent, calm, inspiring, and mathematically disciplined productivity mentor.
Application: TANZIEEM (Organize Your Time. Build Your Life. By Yosef Idris).
Context:
- Current user: ${userContext?.name || 'Alex'}
- Current level: ${userContext?.level || 12} (${userContext?.title || 'Chrono Architect'})
- Today's focus minutes: ${userContext?.focusMinutes || 165} min
- Daily target: ${userContext?.dailyTarget || 240} min
- Active Streak: ${userContext?.streak || 7} days
- Focus Area: ${userContext?.focusArea || 'Design'}

Tone:
Calm, encouraging, crisp, laser-focused on practical time-blocking and flow state.
Never give generic corporate jargon or fluffy advice.
If user feels overloaded, diagnose their estimated workload vs available focus capacity.
Provide actionable suggestions (e.g. 25m or 50m intervals, time-boxing).
`;

        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
          config: {
            systemInstruction,
            temperature: 0.7,
          },
        });

        if (response.text) {
          return res.json({ reply: response.text });
        }
      } catch (geminiError) {
        console.warn('Gemini API call failed, using deterministic coaching engine:', geminiError);
      }
    }

    // Deterministic fallback if API key not yet configured or quota exhausted
    const lower = (prompt || '').toLowerCase();
    let reply = `Based on your focus stats (${userContext?.focusMinutes || 165}m completed toward your ${userContext?.dailyTarget || 240}m target), you have roughly 75 minutes remaining to hit your daily goal. I suggest two 25-minute Pomodoro sprints with a 5-minute breather between them.`;

    if (lower.includes('overload') || lower.includes('tired') || lower.includes('busy')) {
      reply = `Overload alert detected. When facing multiple high-priority objectives, the human brain loses up to 40% efficiency due to context-switching. Pick only ONE quest right now: "Finalize Mobile UI Design System". Park all other tasks for 45 minutes and step into a 25m Pomodoro with Lo-Fi Rain ambient audio.`;
    } else if (lower.includes('schedule') || lower.includes('morning') || lower.includes('plan')) {
      reply = `Here is your optimized flow schedule:\n• Block 1 (09:00 - 10:30): 2x Pomodoro sprints on high-leverage UI design tokens.\n• 15m Cognitive Break: Hydrate and let subconscious consolidate.\n• Block 2 (11:00 - 12:00): Architecture Specs & Wireframes.\n• Block 3 (Afternoon): Review API endpoints.`;
    } else if (lower.includes('arabic') || lower.includes('عربي') || lower.includes('نظم')) {
      reply = `أهلاً بك يا ${userContext?.name || 'أليكس'}. بناءً على إحصائياتك لليوم (${userContext?.focusMinutes || 165} دقيقة من أصل هدفك ${userContext?.dailyTarget || 240} دقيقة)، يتبقى لك ٧٥ دقيقة فقط لتحقيق الهدف الأقصى. أنصحك ببدء جلسة بومودورو ٢٥ دقيقة فوراً على مهمتك الأهم.`;
    }

    res.json({ reply });
  } catch (error: any) {
    console.error('Error in /api/ai-coach:', error);
    res.status(500).json({
      reply: 'Focus on your next single priority. Break it down into a 25-minute Pomodoro sprint.',
    });
  }
});

// Vite middleware setup
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Tanzieem server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
