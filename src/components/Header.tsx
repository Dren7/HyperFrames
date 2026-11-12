import React from 'react';
import { Film, Sparkles, Mic, Code2, Download, Layers } from 'lucide-react';

interface HeaderProps {
  activeTab: 'editor' | 'templates' | 'ai-video' | 'api-docs';
  setActiveTab: (tab: 'editor' | 'templates' | 'ai-video' | 'api-docs') => void;
  onOpenVoiceDirector: () => void;
  onOpenRender: () => void;
  onOpenAIVideo: () => void;
  isVoiceActive: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onOpenVoiceDirector,
  onOpenRender,
  onOpenAIVideo,
  isVoiceActive,
}) => {
  return (
    <header className="flex items-center justify-between gap-8 px-6 py-3.5 bg-[#080C14] border-b border-[#1E293B] shrink-0 z-30 select-none">
      {/* Zone 1: Wordmark */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/20">
          <Film className="w-4 h-4" />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-base font-bold tracking-tight text-white font-sans whitespace-nowrap">
            HyperFrames
          </span>
          <span className="text-[11px] font-mono text-cyan-400 bg-cyan-950/60 border border-cyan-800/60 px-1.5 py-0.5 rounded">
            STUDIO
          </span>
        </div>
      </div>

      {/* Zone 2: Navigation Links */}
      <nav className="hidden md:flex items-center gap-1 bg-[#0F172A] p-1 rounded-lg border border-[#1E293B]">
        <button
          onClick={() => setActiveTab('editor')}
          className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-medium rounded-md transition-all whitespace-nowrap ${
            activeTab === 'editor'
              ? 'bg-[#1E293B] text-cyan-300 shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Code2 className="w-3.5 h-3.5" />
          Code Studio
        </button>

        <button
          onClick={() => {
            setActiveTab('templates');
          }}
          className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-medium rounded-md transition-all whitespace-nowrap ${
            activeTab === 'templates'
              ? 'bg-[#1E293B] text-cyan-300 shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          Scene Templates
        </button>

        <button
          onClick={() => {
            setActiveTab('ai-video');
            onOpenAIVideo();
          }}
          className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-medium rounded-md transition-all whitespace-nowrap ${
            activeTab === 'ai-video'
              ? 'bg-[#1E293B] text-cyan-300 shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          Gemini Omni Video
        </button>

        <button
          onClick={() => setActiveTab('api-docs')}
          className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-medium rounded-md transition-all whitespace-nowrap ${
            activeTab === 'api-docs'
              ? 'bg-[#1E293B] text-cyan-300 shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          API Integration
        </button>
      </nav>

      {/* Zone 3: Actions */}
      <div className="flex items-center gap-3 shrink-0">
        {/* Voice Director Button */}
        <button
          onClick={onOpenVoiceDirector}
          className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg border transition-all whitespace-nowrap ${
            isVoiceActive
              ? 'bg-amber-950/40 border-amber-500/80 text-amber-300 shadow-md shadow-amber-500/20'
              : 'bg-[#0F172A] border-[#1E293B] text-slate-300 hover:border-slate-700 hover:text-white'
          }`}
          title="Talk with Gemini 3.8 Live Voice Director"
        >
          <Mic className={`w-3.5 h-3.5 ${isVoiceActive ? 'text-amber-400 animate-pulse' : 'text-slate-400'}`} />
          <span>{isVoiceActive ? 'Voice Live' : 'Voice Director'}</span>
        </button>

        {/* Primary CTA: Render MP4 */}
        <button
          onClick={onOpenRender}
          className="flex items-center gap-2 px-4 py-1.5 text-xs font-semibold text-white bg-gradient-to-r from-cyan-500 to-blue-600 rounded-lg hover:from-cyan-400 hover:to-blue-500 shadow-md shadow-cyan-500/20 transition-all whitespace-nowrap"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Render MP4</span>
        </button>
      </div>
    </header>
  );
};
