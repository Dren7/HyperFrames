import { SceneRenderContext } from '../types';
import * as motion from './motionHelpers';

export interface RenderOptions {
  width: number;
  height: number;
  fps: number;
  duration: number;
  props: Record<string, any>;
  renderCode: string;
  onProgress: (progress: number, frame: number, totalFrames: number) => void;
}

export async function renderVideoToBlob(options: RenderOptions): Promise<Blob> {
  const { width, height, fps, duration, props, renderCode, onProgress } = options;
  const totalFrames = Math.ceil(duration * fps);

  // Create isolated rendering canvas
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Could not acquire 2D rendering context.');
  }

  // Compile the rendering code into an executable function
  // Expose motion math helpers to the sandbox context
  let drawFunction: (context: SceneRenderContext & typeof motion) => void;
  try {
    drawFunction = new Function(
      'context',
      `"use strict";
      try {
        ${renderCode}
      } catch (err) {
        console.error("Frame render error:", err);
      }`
    ) as any;
  } catch (err: any) {
    throw new Error(`Syntax error in rendering code: ${err.message}`);
  }

  // Detect supported mimeType
  const mimeTypes = [
    'video/mp4;codecs=avc1',
    'video/mp4',
    'video/webm;codecs=vp9',
    'video/webm;codecs=vp8',
    'video/webm',
  ];
  let selectedMimeType = '';
  for (const mime of mimeTypes) {
    if (MediaRecorder.isTypeSupported(mime)) {
      selectedMimeType = mime;
      break;
    }
  }

  if (!selectedMimeType) {
    selectedMimeType = 'video/webm';
  }

  // Create stream and media recorder
  const stream = canvas.captureStream(fps);
  const recordedChunks: Blob[] = [];

  const mediaRecorder = new MediaRecorder(stream, {
    mimeType: selectedMimeType,
    videoBitsPerSecond: 8000000, // 8 Mbps high quality
  });

  mediaRecorder.ondataavailable = (event) => {
    if (event.data && event.data.size > 0) {
      recordedChunks.push(event.data);
    }
  };

  const recordingPromise = new Promise<Blob>((resolve, reject) => {
    mediaRecorder.onstop = () => {
      const blob = new Blob(recordedChunks, { type: selectedMimeType });
      resolve(blob);
    };
    mediaRecorder.onerror = (e) => reject(e);
  });

  mediaRecorder.start();

  // Draw frame by frame with timing synchronization
  const frameIntervalMs = 1000 / fps;

  for (let frame = 0; frame <= totalFrames; frame++) {
    const time = Math.min(duration, frame / fps);
    const progress = Math.min(1.0, time / duration);

    const renderContext: SceneRenderContext & typeof motion = {
      ctx,
      width,
      height,
      progress,
      time,
      frame,
      fps,
      duration,
      props,
      ...motion,
    };

    // Draw scene
    ctx.clearRect(0, 0, width, height);
    drawFunction(renderContext);

    // Update progress
    onProgress(Math.floor((frame / totalFrames) * 100), frame, totalFrames);

    // Brief yield for MediaRecorder frame capture
    await new Promise((resolve) => setTimeout(resolve, frameIntervalMs));
  }

  // Stop recording
  mediaRecorder.stop();

  return recordingPromise;
}

export function safeDownloadVideo(videoSource: Blob | string, filename: string) {
  try {
    let url: string;
    let shouldRevoke = false;

    if (videoSource instanceof Blob) {
      url = URL.createObjectURL(videoSource);
      shouldRevoke = true;
    } else if (typeof videoSource === 'string' && videoSource.startsWith('data:')) {
      // Convert base64 data URL to Blob to prevent browser iframe navigation
      const parts = videoSource.split(';base64,');
      const contentType = parts[0].replace('data:', '') || 'video/mp4';
      const raw = window.atob(parts[1]);
      const rawLength = raw.length;
      const uInt8Array = new Uint8Array(rawLength);
      for (let i = 0; i < rawLength; ++i) {
        uInt8Array[i] = raw.charCodeAt(i);
      }
      const blob = new Blob([uInt8Array], { type: contentType });
      url = URL.createObjectURL(blob);
      shouldRevoke = true;
    } else {
      url = videoSource;
    }

    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = filename;
    a.rel = 'noopener noreferrer';
    a.target = '_self';
    document.body.appendChild(a);
    a.click();

    setTimeout(() => {
      if (document.body.contains(a)) {
        document.body.removeChild(a);
      }
      if (shouldRevoke) {
        URL.revokeObjectURL(url);
      }
    }, 3000);
  } catch (err) {
    console.error('Safe download error:', err);
  }
}

export function downloadBlob(blob: Blob, filename: string) {
  safeDownloadVideo(blob, filename);
}

