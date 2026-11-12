import React, { useState } from 'react';
import { AspectRatio, Resolution } from '../types';
import { renderVideoToBlob, downloadBlob } from '../engine/videoRecorder';
import { X, Download, Film, Loader2, CheckCircle2, Play, Sparkles } from 'lucide-react';

interface RenderModalProps {
  isOpen: boolean;
  onClose: () => void;
  code: string;
  duration: number;
  fps: number;
  aspectRatio: AspectRatio;
  resolution: Resolution;
  customProps: Record<string, any>;
  projectName: string;
}

export const RenderModal: React.FC<RenderModalProps> = ({
  isOpen,
  onClose,
  code,
  duration,
  fps,
  aspectRatio,
  resolution,
  customProps,
  projectName,
}) => {
  const [isRendering, setIsRendering] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentFrame, setCurrentFrame] = useState(0);
  const [totalFrames, setTotalFrames] = useState(0);
  const [renderedBlob, setRenderedBlob] = useState<Blob | null>(null);
  const [renderedUrl, setRenderedUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleStartRender = async () => {
    setIsRendering(true);
    setProgress(0);
    setError(null);
    setRenderedBlob(null);
    setRenderedUrl(null);

    const baseWidth = resolution === '1080p' ? 1920 : 1280;
    const baseHeight = resolution === '1080p' ? 1080 : 720;
    const width = aspectRatio === '9:16' ? baseHeight : baseWidth;
    const height = aspectRatio === '9:16' ? baseWidth : baseHeight;

    try {
      const blob = await renderVideoToBlob({
        width,
        height,
        fps,
        duration,
        props: customProps,
        renderCode: code,
        onProgress: (pct, frame, total) => {
          setProgress(pct);
          setCurrentFrame(frame);
          setTotalFrames(total);
        },
      });

      setRenderedBlob(blob);
      setRenderedUrl(URL.createObjectURL(blob));
    } catch (err: any) {
      console.error('Render error:', err);
      setError(err.message || 'An error occurred during video rendering.');
    } finally {
      setIsRendering(false);
    }
  };

  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const handleDownload = (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    if (!renderedBlob) return;
    const extension = renderedBlob.type.includes('mp4') ? 'mp4' : 'webm';
    downloadBlob(renderedBlob, `${projectName.toLowerCase().replace(/\s+/g, '-')}-${resolution}.${extension}`);
    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-lg bg-[#0B0F17] border border-[#1E293B] rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#1E293B] bg-[#080C14]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-950/80 border border-cyan-800 flex items-center justify-center text-cyan-400">
              <Film className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white font-sans">
                Render High-Definition Video
              </h2>
              <p className="text-[11px] text-slate-400 font-mono">
                Frame-by-frame deterministic hardware recording
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
        <div className="p-6 space-y-5">
          {/* Output Spec Card */}
          <div className="bg-[#080C14] border border-[#1E293B] rounded-xl p-4 space-y-2 text-xs">
            <div className="flex items-center justify-between text-slate-400">
              <span>Scene Duration:</span>
              <span className="font-mono text-slate-200">{duration} seconds</span>
            </div>
            <div className="flex items-center justify-between text-slate-400">
              <span>Aspect Ratio:</span>
              <span className="font-mono text-slate-200">
                {aspectRatio === '16:9' ? '16:9 (Landscape)' : '9:16 (Portrait)'}
              </span>
            </div>
            <div className="flex items-center justify-between text-slate-400">
              <span>Target Resolution:</span>
              <span className="font-mono text-slate-200">
                {resolution === '1080p'
                  ? aspectRatio === '16:9'
                    ? '1920 × 1080 (Full HD)'
                    : '1080 × 1920'
                  : aspectRatio === '16:9'
                  ? '1280 × 720 (HD)'
                  : '720 × 1280'}
              </span>
            </div>
            <div className="flex items-center justify-between text-slate-400">
              <span>Frame Rate:</span>
              <span className="font-mono text-cyan-400 font-bold">{fps} FPS</span>
            </div>
          </div>

          {/* Rendering Progress */}
          {isRendering && (
            <div className="space-y-3 bg-[#080C14] border border-[#1E293B] rounded-xl p-4">
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-2 text-slate-300">
                  <Loader2 className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
                  Rendering frames...
                </span>
                <span className="font-mono font-bold text-cyan-400 tabular-nums">{progress}%</span>
              </div>

              {/* Progress bar */}
              <div className="w-full h-2 bg-[#1E293B] rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full transition-all duration-75"
                  style={{ width: `${progress}%` }}
                />
              </div>

              <div className="text-[11px] text-slate-500 font-mono text-right tabular-nums">
                Frame {currentFrame} / {totalFrames}
              </div>
            </div>
          )}

          {/* Render Result Preview */}
          {renderedUrl && (
            <div className="space-y-3 bg-[#080C14] border border-[#1E293B] rounded-xl p-4">
              <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold">
                <CheckCircle2 className="w-4 h-4" />
                Render Complete!
              </div>

              <div className="rounded-lg overflow-hidden bg-black aspect-video flex items-center justify-center">
                <video
                  src={renderedUrl}
                  controls
                  autoPlay
                  loop
                  className="w-full h-full object-contain"
                />
              </div>

              <button
                type="button"
                onClick={handleDownload}
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-emerald-600/20 transition-all cursor-pointer"
              >
                {downloadSuccess ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-white" />
                    <span>File Downloaded to Computer!</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    <span>Download Video File ({renderedBlob?.type.includes('mp4') ? 'MP4' : 'WebM'})</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="p-3 rounded-lg bg-red-950/80 border border-red-500/50 text-red-200 text-xs">
              {error}
            </div>
          )}

          {/* Start Render Button */}
          {!isRendering && !renderedUrl && (
            <button
              onClick={handleStartRender}
              className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold rounded-xl text-xs shadow-lg shadow-cyan-500/20 transition-all"
            >
              <Sparkles className="w-4 h-4" />
              Start In-Browser Render
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
