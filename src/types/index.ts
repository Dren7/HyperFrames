export type AspectRatio = '16:9' | '9:16';
export type Resolution = '720p' | '1080p';

export interface SceneRenderContext {
  ctx: CanvasRenderingContext2D;
  width: number;
  height: number;
  progress: number; // 0.0 to 1.0
  time: number;     // seconds from 0 to duration
  frame: number;    // current frame index
  fps: number;
  duration: number; // total seconds
  props: Record<string, any>;
}

export interface VideoTemplate {
  id: string;
  name: string;
  category: 'kinetic' | 'cyber' | 'visualizer' | 'reels' | 'data';
  description: string;
  duration: number; // in seconds
  fps: number;
  aspectRatio: AspectRatio;
  defaultProps: Record<string, any>;
  propConfig: {
    key: string;
    label: string;
    type: 'text' | 'number' | 'color' | 'boolean' | 'select';
    options?: string[];
    min?: number;
    max?: number;
    step?: number;
    default: any;
  }[];
  code: string;
}

export interface AIVideoResult {
  id: string;
  type: 'text-to-video' | 'image-to-video';
  prompt: string;
  videoUrl: string;
  aspectRatio: AspectRatio;
  duration: string;
  createdAt: number;
}
