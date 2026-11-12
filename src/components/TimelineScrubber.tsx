import React, { useRef } from 'react';
import { Play, Pause, SkipBack, SkipForward, Repeat, RotateCcw } from 'lucide-react';
import { formatTimecode } from '../engine/motionHelpers';

interface TimelineScrubberProps {
  currentTime: number;
  duration: number;
  fps: number;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onSeek: (time: number) => void;
  playbackRate: number;
  onChangePlaybackRate: (rate: number) => void;
  isLooping: boolean;
  onToggleLoop: () => void;
}

export const TimelineScrubber: React.FC<TimelineScrubberProps> = ({
  currentTime,
  duration,
  fps,
  isPlaying,
  onTogglePlay,
  onSeek,
  playbackRate,
  onChangePlaybackRate,
  isLooping,
  onToggleLoop,
}) => {
  const trackRef = useRef<HTMLDivElement | null>(null);

  const totalFrames = Math.floor(duration * fps);
  const currentFrame = Math.floor(currentTime * fps);
  const progressPercent = Math.min(100, Math.max(0, (currentTime / duration) * 100));

  const handleTrackClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!trackRef.current) return;
    const rect = trackRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const ratio = Math.max(0, Math.min(1, clickX / rect.width));
    onSeek(ratio * duration);
  };

  const handleStepFrame = (deltaFrames: number) => {
    const nextFrame = Math.max(0, Math.min(totalFrames, currentFrame + deltaFrames));
    onSeek(nextFrame / fps);
  };

  return (
    <div className="bg-[#0B0F17] border-t border-[#1E293B] px-6 py-3 select-none flex flex-col gap-2 shrink-0">
      {/* Upper Bar: Controls & Timecode */}
      <div className="flex items-center justify-between">
        {/* Playback Controls */}
        <div className="flex items-center gap-2">
          {/* Reset to Start */}
          <button
            onClick={() => onSeek(0)}
            className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-[#1E293B] rounded transition-all"
            title="Reset to 00:00:00"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          {/* Step Back 1 Frame */}
          <button
            onClick={() => handleStepFrame(-1)}
            className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-[#1E293B] rounded transition-all"
            title="Step Back 1 Frame"
          >
            <SkipBack className="w-3.5 h-3.5" />
          </button>

          {/* Main Play / Pause */}
          <button
            onClick={onTogglePlay}
            className="w-8 h-8 rounded-full bg-cyan-500 hover:bg-cyan-400 text-[#080C14] flex items-center justify-center font-bold shadow-lg shadow-cyan-500/20 transition-transform active:scale-95"
            title={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? (
              <Pause className="w-4 h-4 fill-current" />
            ) : (
              <Play className="w-4 h-4 fill-current ml-0.5" />
            )}
          </button>

          {/* Step Forward 1 Frame */}
          <button
            onClick={() => handleStepFrame(1)}
            className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-[#1E293B] rounded transition-all"
            title="Step Forward 1 Frame"
          >
            <SkipForward className="w-3.5 h-3.5" />
          </button>

          {/* Loop Toggle */}
          <button
            onClick={onToggleLoop}
            className={`p-1.5 rounded transition-all ${
              isLooping
                ? 'bg-cyan-950/60 border border-cyan-800 text-cyan-300'
                : 'text-slate-500 hover:text-slate-300'
            }`}
            title="Toggle Repeat Loop"
          >
            <Repeat className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Center: Timecode & Frame Counter */}
        <div className="flex items-center gap-4 text-xs font-mono tabular-nums">
          <div className="flex items-center gap-1.5 bg-[#080C14] px-3 py-1 rounded border border-[#1E293B]">
            <span className="text-cyan-400 font-semibold">{formatTimecode(currentTime)}</span>
            <span className="text-slate-600">/</span>
            <span className="text-slate-400">{formatTimecode(duration)}</span>
          </div>

          <div className="text-[11px] text-slate-500">
            Frame <span className="text-slate-300 font-medium">{currentFrame}</span> / {totalFrames} (60 FPS)
          </div>
        </div>

        {/* Right: Playback Speed */}
        <div className="flex items-center gap-1 bg-[#080C14] p-0.5 rounded border border-[#1E293B] text-xs font-mono">
          {[0.5, 1, 1.5, 2].map((rate) => (
            <button
              key={rate}
              onClick={() => onChangePlaybackRate(rate)}
              className={`px-2 py-0.5 rounded text-[11px] transition-all ${
                playbackRate === rate
                  ? 'bg-[#1E293B] text-cyan-300 font-bold'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              {rate}x
            </button>
          ))}
        </div>
      </div>

      {/* Lower Bar: Interactive Timeline Scrubber Track */}
      <div
        ref={trackRef}
        onClick={handleTrackClick}
        className="relative h-7 bg-[#080C14] rounded-md border border-[#1E293B] cursor-pointer overflow-hidden group flex items-center"
      >
        {/* Timeline Tick Marks */}
        <div className="absolute inset-0 flex justify-between px-2 pointer-events-none opacity-20">
          {Array.from({ length: Math.ceil(duration) + 1 }).map((_, i) => (
            <div key={i} className="flex flex-col items-center h-full justify-between py-1">
              <span className="w-px h-2 bg-slate-300" />
              <span className="text-[9px] font-mono text-slate-400">{i}s</span>
            </div>
          ))}
        </div>

        {/* Progress Fill */}
        <div
          className="absolute top-0 bottom-0 left-0 bg-gradient-to-r from-cyan-900/40 to-cyan-500/30 border-r border-cyan-400 transition-none"
          style={{ width: `${progressPercent}%` }}
        />

        {/* Playhead Needle */}
        <div
          className="absolute top-0 bottom-0 w-1 bg-cyan-400 shadow-md shadow-cyan-400/50 z-10 transition-none"
          style={{ left: `calc(${progressPercent}% - 2px)` }}
        >
          <div className="w-3 h-3 bg-cyan-400 rounded-sm -ml-1 -mt-1 shadow" />
        </div>
      </div>
    </div>
  );
};
