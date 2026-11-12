import React, { useState, useRef } from 'react';
import { AspectRatio, AIVideoResult } from '../types';
import { safeDownloadVideo } from '../engine/videoRecorder';
import { X, Sparkles, Image as ImageIcon, Video, Upload, Download, Loader2, Play, AlertCircle, Check } from 'lucide-react';

interface AIVideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectVideoForProject?: (videoUrl: string) => void;
}

export const AIVideoModal: React.FC<AIVideoModalProps> = ({ isOpen, onClose }) => {
  const [mode, setMode] = useState<'text-to-video' | 'image-to-video'>('text-to-video');
  const [prompt, setPrompt] = useState('Futuristic cybernetic city with flying light trails, cinematic 4K camera move, volumetric fog.');
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('16:9');
  const [duration, setDuration] = useState<'5s' | '10s'>('10s');
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [uploadedMimeType, setUploadedMimeType] = useState<string>('image/png');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedVideo, setGeneratedVideo] = useState<AIVideoResult | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (!isOpen) return null;

  const handleImageUpload = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Please upload a valid image file (PNG, JPG, WebP).');
      return;
    }
    setUploadedMimeType(file.type);
    const reader = new FileReader();
    reader.onload = () => {
      setUploadedImage(reader.result as string);
      setError(null);
    };
    reader.readAsDataURL(file);
  };

  const handleGenerate = async () => {
    setError(null);
    setIsGenerating(true);

    try {
      if (mode === 'text-to-video') {
        if (!prompt.trim()) {
          throw new Error('Please enter a descriptive prompt for video generation.');
        }

        const res = await fetch('/api/generate-video', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt,
            aspectRatio,
            duration,
          }),
        });

        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.error || 'Failed to generate video with Gemini Omni Flash.');
        }

        const videoUrl = data.videoData || data.videoUri;
        setGeneratedVideo({
          id: String(Date.now()),
          type: 'text-to-video',
          prompt,
          videoUrl,
          aspectRatio,
          duration,
          createdAt: Date.now(),
        });
      } else {
        // Image-to-video
        if (!uploadedImage) {
          throw new Error('Please upload an image to animate.');
        }

        const res = await fetch('/api/animate-image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            imageData: uploadedImage,
            mimeType: uploadedMimeType,
            prompt: prompt || 'Bring this image to life with smooth cinematic motion.',
            aspectRatio,
            duration,
          }),
        });

        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.error || 'Failed to animate image with Gemini Omni Flash.');
        }

        const videoUrl = data.videoData || data.videoUri;
        setGeneratedVideo({
          id: String(Date.now()),
          type: 'image-to-video',
          prompt: prompt || 'Animate photo into video',
          videoUrl,
          aspectRatio,
          duration,
          createdAt: Date.now(),
        });
      }
    } catch (err: any) {
      console.error('Generation error:', err);
      setError(err.message || 'Error occurred while generating video.');
    } finally {
      setIsGenerating(false);
    }
  };

  const presetPrompts = [
    'A hyper-realistic neon cyber city with hovering drone cameras and rain reflections.',
    'Product teaser: sleek geometric glass prism rotating in zero-gravity with laser caustics.',
    'Atmospheric macro view of glowing bioluminescent botanical crystals pulsing with energy.',
    'Kinetic typography motion: bold metallic letters assembling from kinetic digital dust.',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-[#0B0F17] border border-[#1E293B] rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#1E293B] bg-[#080C14]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-950/80 border border-cyan-800 flex items-center justify-center text-cyan-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white font-sans">Gemini Omni Flash Video Studio</h2>
              <p className="text-[11px] text-slate-400 font-mono">
                Model: gemini-omni-1.2-flash via Interactions API
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
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Mode Tabs */}
          <div className="flex items-center gap-2 p-1 bg-[#080C14] rounded-xl border border-[#1E293B] w-fit">
            <button
              onClick={() => {
                setMode('text-to-video');
                setError(null);
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                mode === 'text-to-video'
                  ? 'bg-cyan-500 text-[#080C14] shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Video className="w-3.5 h-3.5" />
              Generate Video from Text
            </button>
            <button
              onClick={() => {
                setMode('image-to-video');
                setError(null);
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                mode === 'image-to-video'
                  ? 'bg-cyan-500 text-[#080C14] shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <ImageIcon className="w-3.5 h-3.5" />
              Animate Photo into Video
            </button>
          </div>

          {/* Configuration Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column: Inputs */}
            <div className="space-y-4">
              {/* Photo Upload Zone (if Image-to-Video mode) */}
              {mode === 'image-to-video' && (
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-2">
                    Source Photo to Animate
                  </label>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files?.[0]) handleImageUpload(e.target.files[0]);
                    }}
                  />

                  {uploadedImage ? (
                    <div className="relative rounded-xl overflow-hidden border border-[#1E293B] bg-[#080C14] max-h-48 group flex items-center justify-center">
                      <img
                        src={uploadedImage}
                        alt="Upload preview"
                        className="w-full h-48 object-cover"
                      />
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 text-xs font-semibold text-white"
                      >
                        <Upload className="w-4 h-4" /> Change Photo
                      </button>
                    </div>
                  ) : (
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed border-[#1E293B] hover:border-cyan-500/50 rounded-xl p-6 text-center cursor-pointer transition-colors bg-[#080C14]/50 hover:bg-[#080C14]"
                    >
                      <Upload className="w-8 h-8 text-slate-500 mx-auto mb-2" />
                      <p className="text-xs font-medium text-slate-300">
                        Click or drag a photo here to animate
                      </p>
                      <p className="text-[11px] text-slate-500 mt-1">PNG, JPG, or WebP</p>
                    </div>
                  )}
                </div>
              )}

              {/* Prompt Input */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  {mode === 'text-to-video' ? 'Video Generation Prompt' : 'Motion Direction Prompt'}
                </label>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  rows={3}
                  placeholder={
                    mode === 'text-to-video'
                      ? 'Describe the scene, action, camera motion, and lighting...'
                      : 'Describe how the photo should animate (e.g. camera zoom in, wind blowing petals)...'
                  }
                  className="w-full p-3 bg-[#080C14] border border-[#1E293B] rounded-xl text-xs text-slate-200 focus:border-cyan-500 focus:outline-none leading-relaxed resize-none"
                />
              </div>

              {/* Aspect Ratio & Duration Controls */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-slate-400 mb-1.5">
                    Aspect Ratio (Mandatory)
                  </label>
                  <div className="grid grid-cols-2 gap-1.5 bg-[#080C14] p-1 rounded-lg border border-[#1E293B]">
                    <button
                      type="button"
                      onClick={() => setAspectRatio('16:9')}
                      className={`py-1.5 text-xs font-medium rounded transition-all ${
                        aspectRatio === '16:9'
                          ? 'bg-[#1E293B] text-cyan-300 font-bold'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      16:9 Landscape
                    </button>
                    <button
                      type="button"
                      onClick={() => setAspectRatio('9:16')}
                      className={`py-1.5 text-xs font-medium rounded transition-all ${
                        aspectRatio === '9:16'
                          ? 'bg-[#1E293B] text-cyan-300 font-bold'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      9:16 Portrait
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-400 mb-1.5">
                    Clip Duration
                  </label>
                  <div className="grid grid-cols-2 gap-1.5 bg-[#080C14] p-1 rounded-lg border border-[#1E293B]">
                    <button
                      type="button"
                      onClick={() => setDuration('5s')}
                      className={`py-1.5 text-xs font-mono rounded transition-all ${
                        duration === '5s'
                          ? 'bg-[#1E293B] text-cyan-300 font-bold'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      5s
                    </button>
                    <button
                      type="button"
                      onClick={() => setDuration('10s')}
                      className={`py-1.5 text-xs font-mono rounded transition-all ${
                        duration === '10s'
                          ? 'bg-[#1E293B] text-cyan-300 font-bold'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      10s
                    </button>
                  </div>
                </div>
              </div>

              {/* Preset Ideas */}
              {mode === 'text-to-video' && (
                <div>
                  <span className="text-[11px] text-slate-500 font-mono block mb-1.5">
                    Quick Prompt Starters:
                  </span>
                  <div className="space-y-1">
                    {presetPrompts.map((p, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setPrompt(p)}
                        className="text-left w-full text-[11px] text-slate-400 hover:text-cyan-300 truncate py-1 px-2 rounded hover:bg-[#1E293B]/60 transition-colors"
                      >
                        ➔ {p}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right Column: Video Output / Preview */}
            <div className="flex flex-col justify-between bg-[#080C14] border border-[#1E293B] rounded-xl p-4">
              <div>
                <h3 className="text-xs font-semibold text-slate-300 mb-2">Video Output Preview</h3>
                {generatedVideo ? (
                  <div className="space-y-3">
                    <div className="relative rounded-lg overflow-hidden bg-black aspect-video flex items-center justify-center">
                      <video
                        src={generatedVideo.videoUrl}
                        controls
                        autoPlay
                        loop
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
                      <span>Aspect: {generatedVideo.aspectRatio}</span>
                      <span>Duration: {generatedVideo.duration}</span>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        safeDownloadVideo(generatedVideo.videoUrl, `hyperframes-${generatedVideo.id}.mp4`);
                      }}
                      className="flex items-center justify-center gap-2 w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold shadow-lg shadow-emerald-600/20 transition-all cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Download Rendered MP4
                    </button>
                  </div>
                ) : (
                  <div className="h-64 flex flex-col items-center justify-center text-center p-6 border border-dashed border-[#1E293B] rounded-lg">
                    {isGenerating ? (
                      <div className="space-y-3">
                        <Loader2 className="w-8 h-8 text-cyan-400 animate-spin mx-auto" />
                        <p className="text-xs text-slate-300 font-medium">
                          Synthesizing video with gemini-omni-1.2-flash...
                        </p>
                        <p className="text-[11px] text-slate-500">
                          Interactions API video diffusion rendering in progress.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-2 text-slate-500">
                        <Video className="w-8 h-8 mx-auto stroke-1 text-slate-600" />
                        <p className="text-xs">Generated video will appear here.</p>
                        <p className="text-[11px]">Supports 16:9 Landscape and 9:16 Vertical formats.</p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Error Notice */}
              {error && (
                <div className="mt-4 p-3 rounded-lg bg-red-950/80 border border-red-500/50 text-red-200 text-xs flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  <div className="font-mono text-[11px] leading-relaxed">{error}</div>
                </div>
              )}

              {/* Action Button */}
              <div className="pt-4">
                <button
                  type="button"
                  disabled={isGenerating}
                  onClick={handleGenerate}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold rounded-xl text-xs shadow-lg shadow-cyan-500/20 transition-all disabled:opacity-50"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Generating Video...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>
                        {mode === 'text-to-video'
                          ? 'Generate Video with Omni Flash'
                          : 'Animate Photo into Video'}
                      </span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
