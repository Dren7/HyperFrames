import React, { useState, useEffect } from 'react';
import { AspectRatio, Resolution, VideoTemplate } from './types';
import { VIDEO_TEMPLATES } from './engine/templates';
import { safeDownloadVideo } from './engine/videoRecorder';
import { Header } from './components/Header';
import { EditorPanel } from './components/EditorPanel';
import { CanvasViewport } from './components/CanvasViewport';
import { TimelineScrubber } from './components/TimelineScrubber';
import { AIVideoModal } from './components/AIVideoModal';
import { VoiceDirectorModal } from './components/VoiceDirectorModal';
import { RenderModal } from './components/RenderModal';
import { ApiPlaygroundModal } from './components/ApiPlaygroundModal';
import { TemplateGalleryModal } from './components/TemplateGalleryModal';

const STORAGE_KEY = 'hyperframes_saved_project';

export default function App() {
  // Load saved project from local browser storage if available
  const [currentTemplate, setCurrentTemplate] = useState<VideoTemplate>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        const found = VIDEO_TEMPLATES.find((t) => t.id === parsed.templateId);
        if (found) return found;
      }
    } catch (e) {}
    return VIDEO_TEMPLATES[0];
  });

  const [code, setCode] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.code) return parsed.code;
      }
    } catch (e) {}
    return VIDEO_TEMPLATES[0].code;
  });

  const [customProps, setCustomProps] = useState<Record<string, any>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.customProps) return parsed.customProps;
      }
    } catch (e) {}
    return { ...VIDEO_TEMPLATES[0].defaultProps };
  });

  const [aspectRatio, setAspectRatio] = useState<AspectRatio>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.aspectRatio) return parsed.aspectRatio;
      }
    } catch (e) {}
    return VIDEO_TEMPLATES[0].aspectRatio;
  });

  const [resolution, setResolution] = useState<Resolution>('720p');
  const [lastSavedText, setLastSavedText] = useState<string>('Auto-saved to Browser');

  // Playback State
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [playbackRate, setPlaybackRate] = useState<number>(1);
  const [isLooping, setIsLooping] = useState<boolean>(true);

  // Navigation & Modals State
  const [activeTab, setActiveTab] = useState<'editor' | 'templates' | 'ai-video' | 'api-docs'>('editor');
  const [showAIVideoModal, setShowAIVideoModal] = useState<boolean>(false);
  const [showVoiceDirectorModal, setShowVoiceDirectorModal] = useState<boolean>(false);
  const [showRenderModal, setShowRenderModal] = useState<boolean>(false);
  const [showApiPlaygroundModal, setShowApiPlaygroundModal] = useState<boolean>(false);
  const [showTemplateGalleryModal, setShowTemplateGalleryModal] = useState<boolean>(false);
  const [isVoiceActive, setIsVoiceActive] = useState<boolean>(false);

  // Auto-save to localStorage whenever code, props, or template changes
  useEffect(() => {
    try {
      const dataToSave = {
        templateId: currentTemplate.id,
        code,
        customProps,
        aspectRatio,
        updatedAt: Date.now(),
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
      setLastSavedText('Auto-saved to Browser');
    } catch (err) {
      console.warn('Storage save warning:', err);
    }
  }, [code, customProps, currentTemplate.id, aspectRatio]);

  // Prevent accidental page reloads or tab closures during editing
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      // Modern browsers will show confirmation dialog
      e.preventDefault();
      e.returnValue = '';
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  // Export project backup as JSON file
  const handleExportProject = () => {
    const projectBackup = {
      app: 'HyperFrames',
      version: '1.0',
      exportedAt: new Date().toISOString(),
      templateId: currentTemplate.id,
      templateName: currentTemplate.name,
      code,
      customProps,
      aspectRatio,
      duration: currentTemplate.duration,
      fps: currentTemplate.fps,
    };

    const jsonString = JSON.stringify(projectBackup, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    safeDownloadVideo(blob, `${currentTemplate.name.toLowerCase().replace(/\s+/g, '-')}-project.json`);
    setLastSavedText('Backup File Exported!');
  };

  // Import project backup from JSON file
  const handleImportProject = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      try {
        const imported = JSON.parse(reader.result as string);
        if (imported.code) setCode(imported.code);
        if (imported.customProps) setCustomProps(imported.customProps);
        if (imported.aspectRatio) setAspectRatio(imported.aspectRatio);
        if (imported.templateId) {
          const found = VIDEO_TEMPLATES.find((t) => t.id === imported.templateId);
          if (found) setCurrentTemplate(found);
        }
        setLastSavedText('Project Restored!');
        setCurrentTime(0);
      } catch (err) {
        alert('Failed to parse project JSON file.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Switch template handler
  const handleSelectTemplate = (template: VideoTemplate) => {
    setCurrentTemplate(template);
    setCode(template.code);
    setCustomProps({ ...template.defaultProps });
    setAspectRatio(template.aspectRatio);
    setCurrentTime(0);
    setIsPlaying(true);
  };

  const handlePropChange = (key: string, value: any) => {
    setCustomProps((prev) => ({ ...prev, [key]: value }));
  };

  const handleResetCode = () => {
    setCode(currentTemplate.code);
    setCustomProps({ ...currentTemplate.defaultProps });
    setLastSavedText('Reset to Template Default');
  };

  const handleTabChange = (tab: 'editor' | 'templates' | 'ai-video' | 'api-docs') => {
    setActiveTab(tab);
    if (tab === 'templates') {
      setShowTemplateGalleryModal(true);
    } else if (tab === 'ai-video') {
      setShowAIVideoModal(true);
    } else if (tab === 'api-docs') {
      setShowApiPlaygroundModal(true);
    }
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-[#080C14] text-slate-100 overflow-hidden font-sans">
      {/* 1. Header Top Bar Contract */}
      <Header
        activeTab={activeTab}
        setActiveTab={handleTabChange}
        onOpenVoiceDirector={() => setShowVoiceDirectorModal(true)}
        onOpenRender={() => setShowRenderModal(true)}
        onOpenAIVideo={() => setShowAIVideoModal(true)}
        isVoiceActive={isVoiceActive}
      />

      {/* 2. Main Studio Work Area */}
      <div className="flex-1 flex flex-row overflow-hidden">
        {/* Left Side: Code Editor & Parameter Inspector */}
        <div className="w-[440px] shrink-0 h-full">
          <EditorPanel
            currentTemplate={currentTemplate}
            code={code}
            onChangeCode={setCode}
            customProps={customProps}
            onChangeProp={handlePropChange}
            onResetCode={handleResetCode}
            onRunCode={() => {
              setCurrentTime((t) => (t === 0 ? 0.001 : 0));
            }}
            onExportProject={handleExportProject}
            onImportProject={handleImportProject}
            lastSavedText={lastSavedText}
          />
        </div>

        {/* Right Side: High-Resolution Real-time Canvas Viewport */}
        <div className="flex-1 flex flex-col h-full overflow-hidden">
          <CanvasViewport
            code={code}
            currentTime={currentTime}
            duration={currentTemplate.duration}
            fps={currentTemplate.fps}
            isPlaying={isPlaying}
            aspectRatio={aspectRatio}
            setAspectRatio={setAspectRatio}
            resolution={resolution}
            setResolution={setResolution}
            customProps={customProps}
            onTimeUpdate={(updater) => {
              if (typeof updater === 'function') {
                setCurrentTime(updater);
              } else {
                setCurrentTime(updater);
              }
            }}
          />

          {/* 3. Interactive Frame-accurate Timeline Scrubber */}
          <TimelineScrubber
            currentTime={currentTime}
            duration={currentTemplate.duration}
            fps={currentTemplate.fps}
            isPlaying={isPlaying}
            onTogglePlay={() => setIsPlaying(!isPlaying)}
            onSeek={(time) => {
              setCurrentTime(time);
              setIsPlaying(false);
            }}
            playbackRate={playbackRate}
            onChangePlaybackRate={setPlaybackRate}
            isLooping={isLooping}
            onToggleLoop={() => setIsLooping(!isLooping)}
          />
        </div>
      </div>

      {/* 4. Modals */}
      <AIVideoModal
        isOpen={showAIVideoModal}
        onClose={() => {
          setShowAIVideoModal(false);
          setActiveTab('editor');
        }}
      />

      <VoiceDirectorModal
        isOpen={showVoiceDirectorModal}
        onClose={() => setShowVoiceDirectorModal(false)}
        onVoiceStateChange={setIsVoiceActive}
      />

      <RenderModal
        isOpen={showRenderModal}
        onClose={() => setShowRenderModal(false)}
        code={code}
        duration={currentTemplate.duration}
        fps={currentTemplate.fps}
        aspectRatio={aspectRatio}
        resolution={resolution}
        customProps={customProps}
        projectName={currentTemplate.name}
      />

      <ApiPlaygroundModal
        isOpen={showApiPlaygroundModal}
        onClose={() => {
          setShowApiPlaygroundModal(false);
          setActiveTab('editor');
        }}
      />

      <TemplateGalleryModal
        isOpen={showTemplateGalleryModal}
        onClose={() => {
          setShowTemplateGalleryModal(false);
          setActiveTab('editor');
        }}
        onSelectTemplate={handleSelectTemplate}
      />
    </div>
  );
}
