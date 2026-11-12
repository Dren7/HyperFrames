/**
 * Motion math & Canvas utility toolkit for HyperFrames code-to-video scenes
 */

// Easing functions
export const ease = {
  linear: (t: number) => t,
  easeInQuad: (t: number) => t * t,
  easeOutQuad: (t: number) => t * (2 - t),
  easeInOutQuad: (t: number) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t),
  easeInCubic: (t: number) => t * t * t,
  easeOutCubic: (t: number) => --t * t * t + 1,
  easeInOutCubic: (t: number) =>
    t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1,
  easeOutExpo: (t: number) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t)),
  easeInOutExpo: (t: number) => {
    if (t === 0) return 0;
    if (t === 1) return 1;
    if ((t *= 2) < 1) return 0.5 * Math.pow(2, 10 * (t - 1));
    return 0.5 * (-Math.pow(2, -10 * --t) + 2);
  },
  easeOutBack: (t: number) => {
    const c1 = 1.70158;
    const c3 = c1 + 1;
    return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
  },
  elasticOut: (t: number) => {
    const p = 0.3;
    return Math.pow(2, -10 * t) * Math.sin(((t - p / 4) * (2 * Math.PI)) / p) + 1;
  },
};

// Math helpers
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const clamp = (val: number, min: number, max: number) =>
  Math.min(Math.max(val, min), max);
export const mapRange = (
  value: number,
  inMin: number,
  inMax: number,
  outMin: number,
  outMax: number
) => {
  const norm = clamp((value - inMin) / (inMax - inMin), 0, 1);
  return lerp(outMin, outMax, norm);
};

// Stagger helper for sequence items
export const stagger = (
  index: number,
  total: number,
  progress: number,
  overlap: number = 0.2
) => {
  const step = (1 - overlap) / total;
  const start = index * step;
  const end = start + overlap + step;
  return clamp((progress - start) / (end - start), 0, 1);
};

// Rounded rect helper for Canvas
export function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  if (w < 2 * r) r = w / 2;
  if (h < 2 * r) r = h / 2;
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

// Kinetic glow text helper
export function drawGlowText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  options: {
    font?: string;
    color?: string;
    glowColor?: string;
    glowBlur?: number;
    align?: CanvasTextAlign;
    baseline?: CanvasTextBaseline;
  } = {}
) {
  const {
    font = '700 48px "Plus Jakarta Sans"',
    color = '#FFFFFF',
    glowColor = '#06B6D4',
    glowBlur = 20,
    align = 'center',
    baseline = 'middle',
  } = options;

  ctx.save();
  ctx.font = font;
  ctx.textAlign = align;
  ctx.textBaseline = baseline;
  
  if (glowBlur > 0) {
    ctx.shadowColor = glowColor;
    ctx.shadowBlur = glowBlur;
  }
  
  ctx.fillStyle = color;
  ctx.fillText(text, x, y);
  ctx.restore();
}

// Format timecode (e.g. 00:03.24)
export function formatTimecode(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  const frames = Math.floor((seconds % 1) * 30);
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${pad(mins)}:${pad(secs)}:${pad(frames)}`;
}
