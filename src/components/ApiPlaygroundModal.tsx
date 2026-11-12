import React, { useState } from 'react';
import { X, Copy, Check, Terminal, Code2, Server } from 'lucide-react';

interface ApiPlaygroundModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ApiPlaygroundModal: React.FC<ApiPlaygroundModalProps> = ({ isOpen, onClose }) => {
  const [lang, setLang] = useState<'curl' | 'node' | 'python'>('curl');
  const [endpoint, setEndpoint] = useState<'generate-video' | 'animate-image'>('generate-video');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const currentHost = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';

  const snippets = {
    curl: {
      'generate-video': `curl -X POST "${currentHost}/api/generate-video" \\
  -H "Content-Type: application/json" \\
  -d '{
    "prompt": "Cinematic aerial view of cybernetic laboratory with laser holographic schematics.",
    "aspectRatio": "16:9",
    "duration": "10s",
    "resolution": "720p"
  }'`,
      'animate-image': `curl -X POST "${currentHost}/api/animate-image" \\
  -H "Content-Type: application/json" \\
  -d '{
    "imageData": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUg...",
    "prompt": "Slow camera zoom into the scene, gentle particle breeze.",
    "aspectRatio": "16:9",
    "duration": "10s"
  }'`,
    },
    node: {
      'generate-video': `import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function createVideo() {
  const interaction = await ai.interactions.create(
    {
      model: "gemini-omni-1.2-flash",
      input: "Cinematic drone view of futuristic cityscape, 4K raytracing.",
      background: false,
      store: false,
      stream: false,
      response_format: {
        type: "video",
        aspect_ratio: "16:9", // '16:9' or '9:16'
        duration: "10s",      // '5s' to '10s'
        resolution: "720p",   // '720p' or '1080p'
      },
    },
    { timeout: 300000 }
  );

  const video = interaction.output_video;
  if (video?.data) {
    const buffer = Buffer.from(video.data, "base64");
    // save to file or send to client
    console.log("Video generated successfully, size:", buffer.length);
  }
}

createVideo();`,
      'animate-image': `import { GoogleGenAI } from "@google/genai";
import fs from "fs";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function animatePhoto(imagePath: string) {
  const base64Image = fs.readFileSync(imagePath).toString("base64");

  const interaction = await ai.interactions.create(
    {
      model: "gemini-omni-1.2-flash",
      input: [
        {
          type: "image",
          mime_type: "image/png",
          data: base64Image,
        },
        {
          type: "text",
          text: "Bring this photo to life with smooth cinematic camera zoom and floating light motes.",
        },
      ],
      response_format: {
        type: "video",
        aspect_ratio: "16:9",
        duration: "10s",
      },
    },
    { timeout: 300000 }
  );

  const video = interaction.output_video;
  console.log("Animated video created:", video?.mime_type);
}

animatePhoto("input.png");`,
    },
    python: {
      'generate-video': `from google import genai
import os

client = genai.Client(api_key=os.environ.get("GEMINI_API_KEY"))

response = client.interactions.create(
    model="gemini-omni-1.2-flash",
    input="Cinematic 4K teaser of high-speed data flow inside fiber optic cables.",
    response_format={
        "type": "video",
        "aspect_ratio": "16:9",
        "duration": "10s",
    }
)

video = response.output_video
if video and video.data:
    import base64
    with open("output.mp4", "wb") as f:
        f.write(base64.b64decode(video.data))
    print("Saved output.mp4")`,
      'animate-image': `from google import genai
import base64
import os

client = genai.Client(api_key=os.environ.get("GEMINI_API_KEY"))

with open("source_photo.png", "rb") as image_file:
    encoded_string = base64.b64encode(image_file.read()).decode("utf-8")

response = client.interactions.create(
    model="gemini-omni-1.2-flash",
    input=[
        {
            "type": "image",
            "mime_type": "image/png",
            "data": encoded_string,
        },
        {
            "type": "text",
            "text": "Smooth atmospheric camera pan across the landscape.",
        }
    ],
    response_format={
        "type": "video",
        "aspect_ratio": "16:9",
        "duration": "10s",
    }
)

video = response.output_video
print("Video generated:", video.mime_type if video else "None")`,
    },
  };

  const activeCode = snippets[lang][endpoint];

  const handleCopy = () => {
    navigator.clipboard.writeText(activeCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-3xl bg-[#0B0F17] border border-[#1E293B] rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#1E293B] bg-[#080C14]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-950/80 border border-cyan-800 flex items-center justify-center text-cyan-400">
              <Terminal className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white font-sans">
                HyperFrames API Integration & SDK
              </h2>
              <p className="text-[11px] text-slate-400 font-mono">
                Trigger programmatic video rendering and AI synthesis via REST or SDK
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-[#1E293B] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4">
          {/* Controls: Endpoint & Language Selection */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            {/* Endpoint */}
            <div className="flex items-center bg-[#080C14] rounded-lg p-1 border border-[#1E293B]">
              <button
                onClick={() => setEndpoint('generate-video')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                  endpoint === 'generate-video'
                    ? 'bg-[#1E293B] text-cyan-300 font-semibold shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                POST /api/generate-video
              </button>
              <button
                onClick={() => setEndpoint('animate-image')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                  endpoint === 'animate-image'
                    ? 'bg-[#1E293B] text-cyan-300 font-semibold shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                POST /api/animate-image
              </button>
            </div>

            {/* Language */}
            <div className="flex items-center bg-[#080C14] rounded-lg p-1 border border-[#1E293B]">
              <button
                onClick={() => setLang('curl')}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                  lang === 'curl'
                    ? 'bg-cyan-500 text-[#080C14] font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                cURL
              </button>
              <button
                onClick={() => setLang('node')}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                  lang === 'node'
                    ? 'bg-cyan-500 text-[#080C14] font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Node.js
              </button>
              <button
                onClick={() => setLang('python')}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                  lang === 'python'
                    ? 'bg-cyan-500 text-[#080C14] font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Python
              </button>
            </div>
          </div>

          {/* Code Viewer */}
          <div className="relative bg-[#080C14] border border-[#1E293B] rounded-xl overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2 border-b border-[#1E293B] bg-[#0B0F17]/80 text-[11px] font-mono text-slate-400">
              <span className="flex items-center gap-1.5">
                <Code2 className="w-3.5 h-3.5 text-cyan-400" />
                {lang.toUpperCase()} Example Snippet
              </span>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-2.5 py-1 text-xs text-slate-300 hover:text-white bg-[#1E293B] hover:bg-slate-700 rounded transition-colors"
              >
                {copied ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-400" />
                    <span className="text-emerald-400">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Copy Code</span>
                  </>
                )}
              </button>
            </div>

            <pre className="p-4 text-xs font-mono text-slate-200 overflow-x-auto leading-relaxed max-h-96">
              <code>{activeCode}</code>
            </pre>
          </div>

          {/* Quick Notes */}
          <div className="p-3 rounded-lg bg-[#080C14] border border-[#1E293B] text-[11px] text-slate-400 space-y-1">
            <div className="font-semibold text-slate-300">Authentication & Environment:</div>
            <div>
              • Uses server-side <code className="text-cyan-400">GEMINI_API_KEY</code> injected securely via AI Studio.
            </div>
            <div>
              • Models deployed: <code className="text-cyan-400">gemini-omni-1.2-flash</code> (Video generation) and <code className="text-amber-400">gemini-3.8-live</code> (Real-time voice director).
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
