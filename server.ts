import express from "express";
import http from "http";
import path from "path";
import dotenv from "dotenv";
import { WebSocketServer, WebSocket } from "ws";
import { GoogleGenAI, LiveServerMessage, Modality } from "@google/genai";

dotenv.config();

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 3000;

// Body parser for JSON with large payload support (for image animation)
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Lazy Google GenAI initialization
function getGenAI() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not set in environment secrets.");
  }
  return new GoogleGenAI({ apiKey });
}

// 1. Text-to-Video API using gemini-omni-1.2-flash via Interactions API
app.post("/api/generate-video", async (req, res) => {
  try {
    const { prompt, aspectRatio = "16:9", duration = "10s", resolution = "720p" } = req.body;
    if (!prompt || typeof prompt !== "string") {
      return res.status(400).json({ error: "Missing or invalid prompt string." });
    }

    const ai = getGenAI();

    // Call Interactions API with gemini-omni-1.2-flash
    const interaction = await ai.interactions.create(
      {
        model: "gemini-omni-1.2-flash",
        input: prompt,
        background: false,
        store: false,
        stream: false,
        response_format: {
          type: "video",
          aspect_ratio: aspectRatio === "9:16" ? "9:16" : "16:9",
          duration: duration || "10s",
          resolution: resolution || "720p",
        },
      },
      { timeout: 300000 } // 5 minutes timeout for video generation
    );

    const videoPart = interaction.output_video;
    if (videoPart && videoPart.data) {
      return res.json({
        success: true,
        mimeType: videoPart.mime_type || "video/mp4",
        videoData: `data:${videoPart.mime_type || "video/mp4"};base64,${videoPart.data}`,
        aspectRatio,
        duration,
      });
    } else if (videoPart && (videoPart as any).uri) {
      return res.json({
        success: true,
        mimeType: videoPart.mime_type || "video/mp4",
        videoUri: (videoPart as any).uri,
        aspectRatio,
        duration,
      });
    }

    return res.status(500).json({ error: "Video model did not return video output." });
  } catch (error: any) {
    console.error("Video generation error:", error);
    return res.status(500).json({
      error: error.message || "Failed to generate video.",
      details: error.status || error.code || null,
    });
  }
});

// 2. Animate Image into Video using gemini-omni-1.2-flash via Interactions API
app.post("/api/animate-image", async (req, res) => {
  try {
    const { imageData, mimeType = "image/png", prompt, aspectRatio = "16:9", duration = "10s" } = req.body;
    if (!imageData) {
      return res.status(400).json({ error: "Missing base64 imageData." });
    }

    // Clean base64 string if it contains data URI prefix
    const base64Clean = imageData.replace(/^data:image\/[a-zA-Z+]+;base64,/, "");

    const ai = getGenAI();

    const motionPrompt = prompt || "Bring this image to life with smooth, cinematic, dynamic motion.";

    const interaction = await ai.interactions.create(
      {
        model: "gemini-omni-1.2-flash",
        input: [
          {
            type: "image",
            mime_type: mimeType,
            data: base64Clean,
          },
          {
            type: "text",
            text: motionPrompt,
          },
        ],
        background: false,
        store: false,
        stream: false,
        response_format: {
          type: "video",
          aspect_ratio: aspectRatio === "9:16" ? "9:16" : "16:9",
          duration: duration || "10s",
        },
      },
      { timeout: 300000 }
    );

    const videoPart = interaction.output_video;
    if (videoPart && videoPart.data) {
      return res.json({
        success: true,
        mimeType: videoPart.mime_type || "video/mp4",
        videoData: `data:${videoPart.mime_type || "video/mp4"};base64,${videoPart.data}`,
        aspectRatio,
        duration,
      });
    } else if (videoPart && (videoPart as any).uri) {
      return res.json({
        success: true,
        mimeType: videoPart.mime_type || "video/mp4",
        videoUri: (videoPart as any).uri,
        aspectRatio,
        duration,
      });
    }

    return res.status(500).json({ error: "Video model did not return video output." });
  } catch (error: any) {
    console.error("Animate image error:", error);
    return res.status(500).json({
      error: error.message || "Failed to animate image.",
      details: error.status || error.code || null,
    });
  }
});

// 3. Status check endpoint
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    hasApiKey: Boolean(process.env.GEMINI_API_KEY),
    models: {
      video: "gemini-omni-1.2-flash",
      live: "gemini-3.8-live",
    },
  });
});

// 4. WebSocket Server for Gemini Live API (gemini-3.8-live)
const wss = new WebSocketServer({ server, path: "/api/live" });

wss.on("connection", async (clientWs: WebSocket) => {
  console.log("Client connected to Gemini Live voice bridge");

  let liveSession: any = null;

  try {
    const ai = getGenAI();

    liveSession = await ai.live.connect({
      model: "gemini-3.8-live",
      callbacks: {
        onmessage: (message: LiveServerMessage) => {
          if (clientWs.readyState !== WebSocket.OPEN) return;

          const audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
          if (audio) {
            clientWs.send(JSON.stringify({ type: "audio", audio }));
          }

          if (message.serverContent?.interrupted) {
            clientWs.send(JSON.stringify({ type: "interrupted" }));
          }

          // Check for text transcript
          const textPart = message.serverContent?.modelTurn?.parts?.find((p: any) => p.text)?.text;
          if (textPart) {
            clientWs.send(JSON.stringify({ type: "text", text: textPart }));
          }
        },
        onclose: () => {
          if (clientWs.readyState === WebSocket.OPEN) {
            clientWs.send(JSON.stringify({ type: "session_closed" }));
          }
        },
        onerror: (err) => {
          console.error("Live session error:", err);
          if (clientWs.readyState === WebSocket.OPEN) {
            clientWs.send(JSON.stringify({ type: "error", error: String(err) }));
          }
        },
      },
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: { prebuiltVoiceConfig: { voiceName: "Zephyr" } },
        },
        systemInstruction:
          "You are the HyperFrames Live Creative Voice Director. You guide developers, designers, and creators in creating captivating programmatic motion graphics, animation pacing, kinetic typography, camera moves, color palettes, and video scripts. Give concise, enthusiastic, and highly actionable advice in natural conversational spoken English or Indonesian as addressed.",
      },
    });

    clientWs.send(JSON.stringify({ type: "ready" }));

    clientWs.on("message", (rawData) => {
      try {
        const payload = JSON.parse(rawData.toString());
        if (payload.audio && liveSession) {
          liveSession.sendRealtimeInput({
            audio: { data: payload.audio, mimeType: "audio/pcm;rate=16000" },
          });
        } else if (payload.text && liveSession) {
          liveSession.sendRealtimeInput({
            text: payload.text,
          });
        }
      } catch (err) {
        console.error("Error processing client audio packet:", err);
      }
    });

    clientWs.on("close", () => {
      console.log("Client disconnected from Live voice bridge");
      try {
        if (liveSession && typeof liveSession.close === "function") {
          liveSession.close();
        }
      } catch (e) {
        // ignore close errors
      }
    });
  } catch (err: any) {
    console.error("Failed to establish Gemini Live connection:", err);
    if (clientWs.readyState === WebSocket.OPEN) {
      clientWs.send(JSON.stringify({ type: "error", error: err.message || "Failed to initialize Live voice session." }));
    }
  }
});

// Setup Vite middleware in dev or static serving in production
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(process.cwd(), "dist")));
    app.get("*", (_req, res) => {
      res.sendFile(path.resolve(process.cwd(), "dist/index.html"));
    });
  }

  server.listen(PORT, () => {
    console.log(`HyperFrames Studio running on http://localhost:${PORT}`);
  });
}

startServer();
