import React, { useState } from 'react';
import { VideoTemplate } from '../types';
import { Sliders, Code2, RotateCcw, Copy, Check, Play, Save, FolderUp, CheckCircle2 } from 'lucide-react';

interface EditorPanelProps {
  currentTemplate: VideoTemplate;
  code: string;
  onChangeCode: (code: string) => void;
  customProps: Record<string, any>;
  onChangeProp: (key: string, value: any) => void;
  onResetCode: () => void;
  onRunCode: () => void;
  onExportProject: () => void;
  onImportProject: (e: React.ChangeEvent<HTMLInputElement>) => void;
  lastSavedText: string;
}

export const EditorPanel: React.FC<EditorPanelProps> = ({
  currentTemplate,
  code,
  onChangeCode,
  customProps,
  onChangeProp,
  onResetCode,
  onRunCode,
  onExportProject,
  onImportProject,
  lastSavedText,
}) => {
  const [activeTab, setActiveTab] = useState<'code' | 'props'>('code');
  const [copied, setCopied] = useState(false);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const lineCount = code.split('\n').length;

  return (
    <div className="flex flex-col h-full bg-[#0B0F17] border-r border-[#1E293B] overflow-hidden">
      {/* Tab Switcher & Actions */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-[#080C14] border-b border-[#1E293B]">
        <div className="flex items-center gap-1 bg-[#0F172A] p-0.5 rounded-lg border border-[#1E293B]">
          <button
            onClick={() => setActiveTab('code')}
            className={`flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-md transition-all ${
              activeTab === 'code'
                ? 'bg-[#1E293B] text-cyan-300 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            Code
          </button>
          <button
            onClick={() => setActiveTab('props')}
            className={`flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-md transition-all ${
              activeTab === 'props'
                ? 'bg-[#1E293B] text-cyan-300 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            Parameters ({currentTemplate.propConfig.length})
          </button>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={onRunCode}
            className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-emerald-400 bg-emerald-950/40 border border-emerald-800/60 rounded hover:bg-emerald-900/60 transition-all cursor-pointer"
            title="Re-evaluate code"
          >
            <Play className="w-3 h-3 fill-current" />
            <span>Run</span>
          </button>

          <button
            onClick={onExportProject}
            className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-[#1E293B] rounded transition-all cursor-pointer"
            title="Download Project Backup (.json)"
          >
            <Save className="w-3.5 h-3.5" />
          </button>

          <label
            className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-[#1E293B] rounded transition-all cursor-pointer"
            title="Import Project (.json)"
          >
            <FolderUp className="w-3.5 h-3.5" />
            <input
              type="file"
              accept=".json"
              className="hidden"
              onChange={onImportProject}
            />
          </label>

          <button
            onClick={handleCopyCode}
            className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-[#1E293B] rounded transition-all cursor-pointer"
            title="Copy Code"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>

          <button
            onClick={onResetCode}
            className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-[#1E293B] rounded transition-all cursor-pointer"
            title="Reset to Template Default"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Editor Content */}
      <div className="flex-1 overflow-auto">
        {activeTab === 'code' ? (
          <div className="flex h-full min-h-[450px] font-mono text-xs">
            {/* Line Numbers */}
            <div className="w-10 py-3 select-none text-right pr-3 text-slate-600 bg-[#080C14] border-r border-[#1E293B]/60 leading-5">
              {Array.from({ length: lineCount }).map((_, i) => (
                <div key={i}>{i + 1}</div>
              ))}
            </div>

            {/* Code Textarea */}
            <div className="flex-1 relative">
              <textarea
                value={code}
                onChange={(e) => onChangeCode(e.target.value)}
                spellCheck={false}
                className="w-full h-full p-3 bg-transparent text-slate-200 font-mono text-xs leading-5 outline-none resize-none selection:bg-cyan-500/30 selection:text-cyan-200"
                style={{ tabSize: 2 }}
              />
            </div>
          </div>
        ) : (
          /* Parametric Controls */
          <div className="p-4 space-y-4">
            <div className="text-xs text-slate-400 mb-2">
              Tweak scene parameters to immediately affect the canvas render:
            </div>

            {currentTemplate.propConfig.map((prop) => (
              <div key={prop.key} className="space-y-1.5 bg-[#0F172A]/70 p-3 rounded-lg border border-[#1E293B]">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-slate-200">{prop.label}</label>
                  <span className="text-[11px] font-mono text-slate-500">{prop.key}</span>
                </div>

                {prop.type === 'text' && (
                  <input
                    type="text"
                    value={customProps[prop.key] ?? prop.default}
                    onChange={(e) => onChangeProp(prop.key, e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs bg-[#080C14] border border-[#1E293B] rounded text-slate-200 focus:border-cyan-500 focus:outline-none"
                  />
                )}

                {prop.type === 'color' && (
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={customProps[prop.key] ?? prop.default}
                      onChange={(e) => onChangeProp(prop.key, e.target.value)}
                      className="w-8 h-8 rounded border border-[#1E293B] bg-transparent cursor-pointer"
                    />
                    <input
                      type="text"
                      value={customProps[prop.key] ?? prop.default}
                      onChange={(e) => onChangeProp(prop.key, e.target.value)}
                      className="flex-1 px-2.5 py-1 text-xs font-mono bg-[#080C14] border border-[#1E293B] rounded text-slate-200 focus:border-cyan-500 focus:outline-none"
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="px-4 py-2 bg-[#080C14] border-t border-[#1E293B] flex items-center justify-between text-[11px] text-slate-500 font-mono">
        <div className="flex items-center gap-1.5 text-emerald-400">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>{lastSavedText || 'Auto-saved to Browser'}</span>
        </div>
        <span>Canvas2D · 60 FPS</span>
      </div>
    </div>
  );
};
