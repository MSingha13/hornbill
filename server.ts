import express from 'express';
import http from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import { GoogleGenAI, Modality } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json({ limit: '10mb' }));

const server = http.createServer(app);
const wss = new WebSocketServer({ server, path: '/live' });

const apiKey = process.env.GEMINI_API_KEY || '';

let ai: GoogleGenAI | null = null;
if (apiKey) {
  ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// WebSocket for Gemini 3.8 Live Voice conversation
wss.on('connection', async (clientWs: WebSocket) => {
  console.log('Client connected to Live audio WebSocket');

  if (!apiKey || !ai) {
    clientWs.send(JSON.stringify({
      error: 'GEMINI_API_KEY is not configured on the server. Please check your AI Studio secrets.',
    }));
    return;
  }

  let session: any = null;

  try {
    session = await ai.live.connect({
      model: 'gemini-3.8-live',
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } },
        },
        systemInstruction: `คุณคือผู้เชี่ยวชาญด้านชีววิทยาการอนุรักษ์สัตว์ป่าและนักวิจัยระบบดาวเทียม GISTDA ผู้ดูแล "โครงการชีวานุรักษ์: พันธกิจเพื่อความหลากหลายทางชีวภาพ" ซึ่งเป็นความร่วมมือระหว่าง สำนักงานพัฒนาเทคโนโลยีอวกาศและภูมิสารสนเทศ (GISTDA), บริษัท บางจาก ศรีราชา จำกัด (มหาชน) (BSRC) และ สวนสัตว์เปิดเขาเขียว (รหัสนก KKOZ ย่อมาจาก Khao Kheow Open Zoo)
คุณกำลังพูดคุยกับผู้ใช้งานผ่านระบบวิทยุเสียงแบบเรียลไทม์

ข้อมูลปัจจุบันของนกกกเป้าหมาย:
- รหัสประจำตัว: KKOZ01 ("เจ้าขุนตาล" เพาะเลี้ยงและฟื้นฟูโดยสวนสัตว์เปิดเขาเขียว ติดตั้งปลอกคอดาวเทียม GNSS โดย GISTDA ร่วมสนับสนุนโดย BSRC)
- ชนิด: นกกก หรือ นกกาฮัง (Great Hornbill, Buceros bicornis)
- ตำแหน่งล่าสุด: 17.3345° N, 98.9752° E บริเวณยอดเขาสูง อุทยานแห่งชาติแจ้ซ้อน จังหวัดลำปาง
- ความสูงจากระดับน้ำทะเล: 840 เมตร
- ระดับแบตเตอรี่ปลอกคอดาวเทียม: 81.25% (ชาร์จด้วยพลังงานแสงอาทิตย์)
- อุณหภูมิอุปกรณ์: 15.50 °C (อากาศเย็นสบายบนยอดเขา)
- เส้นทางการบิน: บินข้ามแนวเทือกเขาจากอุทยานแห่งชาติดอยขุนตาล ข้ามหุบเขาแม่ปาน ผ่านรอยต่อห้างฉัตร มุ่งหน้ามายังพื้นที่ป่าดิบชื้นอุทยานแห่งชาติแจ้ซ้อน รวมระยะทางสะสมกว่า 64.8 กิโลเมตร
- พฤติกรรม: กำลังเกาะพักบนยอดไม้ยางแดง (Dipterocarpus alatus) และหาผลไทรป่า (Ficus) นกกกทำหน้าที่เป็น "นักปลูกป่าแห่งพงไพร" โดยกระจายเมล็ดพันธุ์ไม้ใหญ่ที่มีเปลือกแข็ง

คำแนะนำในการตอบ:
- สนทนาด้วยน้ำเสียงเป็นมิตร สุภาพ มีพลัง และมีความรู้เชิงวิชาการที่เข้าใจง่าย (ภาษาไทยเป็นหลัก หรือตอบภาษาอังกฤษหากผู้ใช้พูดภาษาอังกฤษ)
- ทราบถึงบทบาทของพันธมิตร 3 ฝ่าย: GISTDA (เทคโนโลยีอวกาศ & ระบบติดตาม), BSRC (พลังงานสะอาด & การสนับสนุนความหลากหลายทางชีวภาพ), สวนสัตว์เปิดเขาเขียว (การเพาะเลี้ยง อนุบาล และฟื้นฟูสุขภาพสัตว์ป่า)
- กระชับและรวดเร็ว เหมาะกับการคุยผ่านเสียงเรียลไทม์`,
      },
      callbacks: {
        onmessage: (message: any) => {
          try {
            const parts = message.serverContent?.modelTurn?.parts;
            if (parts && parts.length > 0) {
              for (const part of parts) {
                if (part.inlineData?.data) {
                  clientWs.send(JSON.stringify({
                    type: 'audio',
                    audio: part.inlineData.data,
                  }));
                }
                if (part.text) {
                  clientWs.send(JSON.stringify({
                    type: 'text',
                    text: part.text,
                  }));
                }
              }
            }
            if (message.serverContent?.interrupted) {
              clientWs.send(JSON.stringify({
                type: 'interrupted',
                interrupted: true,
              }));
            }
          } catch (e) {
            console.error('Error handling Live message:', e);
          }
        },
        onclose: () => {
          console.log('Gemini Live session closed');
          if (clientWs.readyState === WebSocket.OPEN) {
            clientWs.send(JSON.stringify({ type: 'session_closed' }));
          }
        },
        onerror: (err: any) => {
          console.error('Gemini Live error:', err);
          if (clientWs.readyState === WebSocket.OPEN) {
            clientWs.send(JSON.stringify({ type: 'error', error: err?.message || 'Gemini Live error' }));
          }
        },
      },
    });

    clientWs.send(JSON.stringify({ type: 'ready', message: 'Connected to Gemini 3.8 Live API' }));

    clientWs.on('message', (data: any) => {
      try {
        const payload = JSON.parse(data.toString());
        if (payload.audio && session) {
          session.sendRealtimeInput({
            audio: { data: payload.audio, mimeType: 'audio/pcm;rate=16000' },
          });
        } else if (payload.text && session) {
          session.sendRealtimeInput({
            text: payload.text,
          });
        }
      } catch (err) {
        console.error('Error in clientWs message handler:', err);
      }
    });

    clientWs.on('close', () => {
      console.log('Client disconnected from Live WebSocket');
      if (session) {
        try {
          session.close();
        } catch {}
      }
    });
  } catch (err: any) {
    console.error('Failed to connect to Live API session:', err);
    clientWs.send(JSON.stringify({
      type: 'error',
      error: err?.message || 'Failed to initialize Gemini 3.8 Live session',
    }));
  }
});

// REST API for intelligent Q&A and analysis using gemini-3.8-flash
app.post('/api/analyze', async (req, res) => {
  try {
    if (!ai) {
      return res.status(500).json({ error: 'Gemini API is not configured on server.' });
    }

    const { prompt, context } = req.body;
    const systemPrompt = `คุณคือนักวิจัยและผู้เชี่ยวชาญการอนุรักษ์นกกก (Great Hornbill Specialist) จากโครงการร่วม กรมอุทยานแห่งชาติ สัตว์ป่า และพันธุ์พืช, GISTDA และ องค์การสวนสัตว์แห่งประเทศไทย
จงตอบคำถาม วิเคราะห์ข้อมูลพิกัดดาวเทียม เส้นทางการบิน สภาพภูมิประเทศแจ้ซ้อน-ดอยขุนตาล และพฤติกรรมชีววิทยาของนกกก KKOZ01 อย่างแม่นยำ ละเอียด เป็นมิตร และให้ความรู้เชิงอนุรักษ์`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: [
        { role: 'user', parts: [{ text: `${context ? `บริบทข้อมูล: ${JSON.stringify(context)}\n\n` : ''}${prompt}` }] },
      ],
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.7,
      },
    });

    return res.json({ text: response.text });
  } catch (error: any) {
    console.error('Error in /api/analyze:', error);
    return res.status(500).json({ error: error?.message || 'Failed to generate response' });
  }
});

// Google Apps Script Live Telemetry API Endpoint
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwZPgebby-VcBqA_y089FfcuzT-RuAwqeaMEUDx4X6uKLT5SvZ4yKVXbXSK-TZaQZaljg/exec';

let cachedTrackingData: any = null;
let lastFetchTime = 0;
const CACHE_TTL_MS = 15000; // 15 seconds cache

app.get('/api/tracking', async (_req, res) => {
  const now = Date.now();
  if (cachedTrackingData && (now - lastFetchTime) < CACHE_TTL_MS) {
    return res.json({ ...cachedTrackingData, fromCache: true });
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);
    const response = await fetch(APPS_SCRIPT_URL, {
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
      },
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Google Apps Script responded with ${response.status}`);
    }

    const data = await response.json();
    cachedTrackingData = data;
    lastFetchTime = now;
    return res.json({ ...data, fromCache: false });
  } catch (error: any) {
    console.warn('Error fetching from Google Apps Script:', error?.message);
    if (cachedTrackingData) {
      return res.json({ ...cachedTrackingData, fromCache: true, stale: true });
    }
    return res.status(502).json({
      success: false,
      error: error?.message || 'Failed to fetch tracking data',
    });
  }
});

// Setup Vite or static serving
async function startServer() {
  const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR !== 'true',
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  server.listen(port, '0.0.0.0', () => {
    console.log(`Hornbill Tracking App running at http://0.0.0.0:${port}`);
  });
}

startServer().catch((err) => {
  console.error('Error starting server:', err);
});
