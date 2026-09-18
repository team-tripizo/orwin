import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-initialized Gemini AI client
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'YatraSafar Holidays API' });
});

// Real-time Chat Support Endpoint (AI Travel Concierge)
app.post('/api/chat', async (req, res) => {
  try {
    const { message, history } = req.body;
    if (!message || typeof message !== 'string') {
      res.status(400).json({ error: 'Valid message string required' });
      return;
    }

    const ai = getGeminiClient();

    if (ai) {
      try {
        const systemInstruction = `You are "SafarMitra", the expert real-time travel concierge for "YatraSafar Holidays & Fixed Departures".
Provide answers in friendly, polite, professional English.
Keep your answers warm, concise, well-formatted with bullet points, and proactively suggest holiday packages, departure dates, and booking guidance.`;

        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: [
            { role: 'user', parts: [{ text: `${systemInstruction}\n\nUser Query: ${message}` }] },
          ],
        });

        const reply = response.text;
        if (reply) {
          res.json({ reply });
          return;
        }
      } catch (geminiError) {
        console.warn('Gemini API call failed, falling back to local travel logic:', geminiError);
        // Fall through to rich travel logic below
      }
    }

    // Fallback if API key is not yet set or returns empty
    const lower = message.toLowerCase();
    let reply = "Hello! Welcome to YatraSafar Holidays. I am here to assist you with holiday packages, fixed departure flight bookings, and payment options.";

    if (lower.includes("domestic") || lower.includes("kashmir") || lower.includes("kerala") || lower.includes("goa") || lower.includes("himachal")) {
      reply = `🏔️ **Popular Domestic Holiday Packages**:
• **Kashmir Paradise (5N/6D)**: Srinagar, Gulmarg Gondola & Pahalgam - Starting ₹24,999/person (Flight included).
• **Kerala Serenity (4N/5D)**: Munnar Tea Gardens, Alleppey Houseboat - Starting ₹19,999/person.
• **Goa Beach Bliss (3N/4D)**: 4-Star Resort, North & South Goa Tour - Starting ₹14,499/person.
👉 Switch to the 'Domestic' tab to select your dates and book directly!`;
    } else if (lower.includes("international") || lower.includes("dubai") || lower.includes("bali") || lower.includes("thailand") || lower.includes("europe")) {
      reply = `✈️ **Trending International Fixed Departures**:
• **Dubai Extravaganza (4N/5D)**: Burj Khalifa 124th Floor, Desert Safari, Dhow Cruise - ₹42,999/person.
• **Bali Tropical Getaway (5N/6D)**: Ubud, Nusa Penida Island, Kuta - ₹38,999/person.
• **Thailand Explorer (4N/5D)**: Bangkok + Pattaya + Coral Island - ₹27,499/person.
All fixed departures include guaranteed group flights, 4-star hotels, airport transfers, and visa guidance!`;
    } else if (lower.includes("refer") || lower.includes("earn") || lower.includes("reera") || lower.includes("commission")) {
      reply = `🎁 **YatraSafar Refer & Earn Program**:
• Copy your unique Referral Code or link from your dashboard and share it with friends and family.
• When your friend completes their 1st holiday booking, they receive a **₹2,000 Discount** and you unlock **₹1,500 Cash**!
• Transfer your wallet earnings directly to your bank account or redeem them on your next tour.`;
    } else if (lower.includes("payment") || lower.includes("gateway") || lower.includes("upi") || lower.includes("refund")) {
      reply = `💳 **Payment Options Available**:
• We support **UPI (Google Pay, PhonePe, Paytm, BHIM)**, **Credit/Debit Cards (Visa, Mastercard, RuPay)**, **Net Banking**, and **No-Cost EMI**.
• All transactions are secured with 256-bit SSL encryption. You receive instant confirmed E-Vouchers and PNR flight tickets.`;
    } else if (lower.includes("fixed") || lower.includes("departure") || lower.includes("flight")) {
      reply = `🛫 **What Are Flight Fixed Departures?**:
Fixed departures are airline seats booked in bulk in advance, ensuring prices stay locked even during peak tourist seasons!
• Confirmed group seats on top airlines (IndiGo, Emirates, Air India, etc.)
• Baggage allowance included (20kg+ check-in + 7kg cabin)
• Pre-scheduled departure dates available on the 'Fixed Departures' section.`;
    }

    res.json({ reply });
  } catch (error: any) {
    console.error('Chat API error:', error);
    res.status(500).json({
      error: 'Failed to generate travel assistance',
      reply: 'We are experiencing a temporary network delay. Please retry shortly or call our 24x7 helpline at 1800-270-0888.',
    });
  }
});

// Setup Vite middleware or static serving
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
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
    console.log(`YatraSafar server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
