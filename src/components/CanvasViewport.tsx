import React, { useRef, useEffect, useState } from 'react';
import { AspectRatio, Resolution, SceneRenderContext } from '../types';
import * as motion from '../engine/motionHelpers';
import { Maximize2, Minimize2, ZoomIn, ZoomOut, Grid, AlertTriangle } from 'lucide-react';

interface CanvasViewportProps {
  code: string;
  currentTime: number;
  duration: number;
  fps: number;
  isPlaying: boolean;
  aspectRatio: AspectRatio;
  setAspectRatio: (ar: AspectRatio) => void;
  resolution: Resolution;
  setResolution: (res: Resolution) => void;
  customProps: Record<string, any>;
  onTimeUpdate: (time: number | ((prevTime: number) => number)) => void;
}

export const CanvasViewport: React.FC<CanvasViewportProps> = ({
  code,
  currentTime,
  duration,
  fps,
  isPlaying,
  aspectRatio,
  setAspectRatio,
  resolution,
  setResolution,
  customProps,
  onTimeUpdate,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [showGuides, setShowGuides] = useState(false);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [renderError, setRenderError] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Compute target canvas dimensions
  const baseWidth = resolution === '1080p' ? 1920 : 1280;
  const baseHeight = resolution === '1080p' ? 1080 : 720;
  
  const canvasWidth = aspectRatio === '9:16' ? baseHeight : baseWidth;
  const canvasHeight = aspectRatio === '9:16' ? baseWidth : baseHeight;

  // Render current frame
  const drawFrame = (time: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    try {
      const drawFunction = new Function(
        'context',
        `"use strict";
        ${code}`
      );

      const progress = Math.min(1.0, Math.max(0, time / duration));
      const frame = Math.floor(time * fps);

      const renderContext: SceneRenderContext & typeof motion = {
        ctx,
        width: canvasWidth,
        height: canvasHeight,
        progress,
        time,
        frame,
        fps,
        duration,
        props: customProps,
        ...motion,
      };

      ctx.clearRect(0, 0, canvasWidth, canvasHeight);
      drawFunction(renderContext);

      // Draw safe guides if enabled
      if (showGuides) {
        ctx.save();
        ctx.strokeStyle = 'rgba(6, 182, 212, 0.4)';
        ctx.lineWidth = 1;
        ctx.setLineDash([6, 6]);

        // Action Safe (90%)
        const ax = canvasWidth * 0.05;
        const ay = canvasHeight * 0.05;
        const aw = canvasWidth * 0.9;
        const ah = canvasHeight * 0.9;
        ctx.strokeRect(ax, ay, aw, ah);

        // Center crosshair
        const cx = canvasWidth / 2;
        const cy = canvasHeight / 2;
        ctx.beginPath();
        ctx.moveTo(cx - 20, cy);
        ctx.lineTo(cx + 20, cy);
        ctx.moveTo(cx, cy - 20);
        ctx.lineTo(cx, cy + 20);
        ctx.stroke();
        ctx.restore();
      }

      if (renderError) setRenderError(null);
    } catch (err: any) {
      setRenderError(err.message || 'Render execution error');
    }
  };

  // Redraw when properties, code, or time changes
  useEffect(() => {
    drawFrame(currentTime);
  }, [code, currentTime, customProps, aspectRatio, resolution, showGuides]);

  // Handle Playback animation loop
  useEffect(() => {
    if (!isPlaying) return;

    let animationFrameId: number;
    let lastTimestamp = performance.now();

    const loop = (timestamp: number) => {
      const delta = (timestamp - lastTimestamp) / 1000;
      lastTimestamp = timestamp;

      onTimeUpdate((prevTime) => {
        let nextTime = prevTime + delta;
        if (nextTime >= duration) {
          nextTime = 0; // loop
        }
        return nextTime;
      });

      animationFrameId = requestAnimationFrame(loop);
    };

    animationFrameId = requestAnimationFrame(loop);

    return () => cancelAnimationFrame(animationFrameId);
  }, [isPlaying, duration]);

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  return (
    <div
      ref={containerRef}
      className="flex-1 flex flex-col bg-[#07090F] relative overflow-hidden select-none"
    >
      {/* Viewport Control Bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-[#0B0F17] border-b border-[#1E293B] text-xs text-slate-300">
        {/* Aspect Ratio & Resolution Switches */}
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-[#080C14] rounded-lg p-0.5 border border-[#1E293B]">
            <button
              onClick={() => setAspectRatio('16:9')}
              className={`px-2.5 py-1 rounded text-xs font-medium transition-all ${
                aspectRatio === '16:9'
                  ? 'bg-[#1E293B] text-cyan-300 font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              16:9 Landscape
            </button>
            <button
              onClick={() => setAspectRatio('9:16')}
              className={`px-2.5 py-1 rounded text-xs font-medium transition-all ${
                aspectRatio === '9:16'
                  ? 'bg-[#1E293B] text-cyan-300 font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              9:16 Reel
            </button>
          </div>

          <div className="flex items-center bg-[#080C14] rounded-lg p-0.5 border border-[#1E293B]">
            <button
              onClick={() => setResolution('720p')}
              className={`px-2 py-1 rounded text-xs font-mono transition-all ${
                resolution === '720p'
                  ? 'bg-[#1E293B] text-cyan-300 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              720p
            </button>
            <button
              onClick={() => setResolution('1080p')}
              className={`px-2 py-1 rounded text-xs font-mono transition-all ${
                resolution === '1080p'
                  ? 'bg-[#1E293B] text-cyan-300 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              1080p
            </button>
          </div>
        </div>

        {/* Viewport Utilities */}
        <div className="flex items-center gap-2">
          {/* Safe Guides Toggle */}
          <button
            onClick={() => setShowGuides(!showGuides)}
            className={`p-1.5 rounded transition-all ${
              showGuides
                ? 'bg-cyan-950/60 border border-cyan-800 text-cyan-300'
                : 'text-slate-400 hover:bg-[#1E293B] hover:text-slate-200'
            }`}
            title="Toggle Safe Area Guides"
          >
            <Grid className="w-3.5 h-3.5" />
          </button>

          {/* Zoom */}
          <div className="flex items-center gap-1 text-slate-400">
            <button
              onClick={() => setZoomLevel((z) => Math.max(0.5, z - 0.1))}
              className="p-1 hover:text-slate-200 rounded"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="text-[11px] font-mono w-9 text-center tabular-nums">
              {Math.round(zoomLevel * 100)}%
            </span>
            <button
              onClick={() => setZoomLevel((z) => Math.min(1.5, z + 0.1))}
              className="p-1 hover:text-slate-200 rounded"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Fullscreen */}
          <button
            onClick={toggleFullscreen}
            className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-[#1E293B] rounded transition-all"
            title="Toggle Fullscreen"
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Main Canvas Container */}
      <div className="flex-1 flex items-center justify-center p-6 relative overflow-hidden bg-dot-grid">
        {/* Error Banner */}
        {renderError && (
          <div className="absolute top-4 left-4 right-4 z-20 flex items-center gap-2.5 p-3 rounded-lg bg-red-950/80 border border-red-500/50 text-red-200 text-xs backdrop-blur">
            <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
            <div className="font-mono truncate">{renderError}</div>
          </div>
        )}

        {/* Scaled Canvas Frame */}
        <div
          className="relative transition-transform duration-100 shadow-2xl rounded-lg overflow-hidden border border-[#1E293B]"
          style={{
            transform: `scale(${zoomLevel})`,
            maxWidth: '100%',
            maxHeight: '100%',
            aspectRatio: aspectRatio === '16:9' ? '16 / 9' : '9 / 16',
          }}
        >
          <canvas
            ref={canvasRef}
            width={canvasWidth}
            height={canvasHeight}
            className="w-full h-full object-contain block bg-[#080C14]"
          />
        </div>
      </div>
    </div>
  );
};
