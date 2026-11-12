import React from 'react';
import { VideoTemplate } from '../types';
import { VIDEO_TEMPLATES } from '../engine/templates';
import { X, Layers, Play, Clock, Sparkles } from 'lucide-react';

interface TemplateGalleryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTemplate: (template: VideoTemplate) => void;
}

export const TemplateGalleryModal: React.FC<TemplateGalleryModalProps> = ({
  isOpen,
  onClose,
  onSelectTemplate,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-4xl bg-[#0B0F17] border border-[#1E293B] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#1E293B] bg-[#080C14]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-950/80 border border-cyan-800 flex items-center justify-center text-cyan-400">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white font-sans">
                Programmatic Scene Templates
              </h2>
              <p className="text-[11px] text-slate-400 font-mono">
                Pre-configured 60 FPS motion graphics ready for instant customization
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

        {/* Template Cards Grid */}
        <div className="p-6 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-4">
          {VIDEO_TEMPLATES.map((tmpl) => (
            <div
              key={tmpl.id}
              className="bg-[#080C14] border border-[#1E293B] hover:border-cyan-500/50 rounded-xl p-5 flex flex-col justify-between transition-all group hover:shadow-xl hover:shadow-cyan-500/5"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono uppercase tracking-wider text-cyan-400 bg-cyan-950/60 border border-cyan-800/60 px-2 py-0.5 rounded">
                    {tmpl.category}
                  </span>
                  <div className="flex items-center gap-2 text-[11px] font-mono text-slate-500">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {tmpl.duration}s
                    </span>
                    <span>·</span>
                    <span>{tmpl.aspectRatio}</span>
                  </div>
                </div>

                <div>
                  <h3 className="text-base font-bold text-white group-hover:text-cyan-300 transition-colors">
                    {tmpl.name}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    {tmpl.description}
                  </p>
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-[#1E293B] flex items-center justify-between">
                <span className="text-[11px] font-mono text-slate-500">
                  {tmpl.propConfig.length} Custom Parameters
                </span>

                <button
                  onClick={() => {
                    onSelectTemplate(tmpl);
                    onClose();
                  }}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#1E293B] hover:bg-cyan-500 hover:text-[#080C14] text-slate-200 text-xs font-semibold rounded-lg transition-all"
                >
                  <Play className="w-3 h-3 fill-current" />
                  Load Scene
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
