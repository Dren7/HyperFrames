import { VideoTemplate } from '../types';

export const VIDEO_TEMPLATES: VideoTemplate[] = [
  {
    id: 'saas-launch',
    name: 'SaaS Product Drop',
    category: 'kinetic',
    description: 'High-converting kinetic motion teaser with 3D glass metrics, glowing gradients, and punchy typography.',
    duration: 5,
    fps: 60,
    aspectRatio: '16:9',
    defaultProps: {
      headline: 'Next-Gen Video API',
      subheadline: 'Render 4K videos in seconds via declarative code',
      badge: 'HYPERFRAMES 2.0',
      metricValue: '10x Faster',
      accentColor: '#06B6D4',
      bgGlow: '#0284C7',
    },
    propConfig: [
      { key: 'headline', label: 'Headline', type: 'text', default: 'Next-Gen Video API' },
      { key: 'subheadline', label: 'Sub-headline', type: 'text', default: 'Render 4K videos in seconds via declarative code' },
      { key: 'badge', label: 'Top Badge', type: 'text', default: 'HYPERFRAMES 2.0' },
      { key: 'metricValue', label: 'Metric Counter', type: 'text', default: '10x Faster' },
      { key: 'accentColor', label: 'Accent Color', type: 'color', default: '#06B6D4' },
    ],
    code: `// Scene: SaaS Product Drop
const { ctx, width, height, progress, time, props, ease, lerp, roundRect, drawGlowText } = context;

// 1. Dark Studio Backdrop with Ambient Radial Bloom
ctx.fillStyle = '#080C14';
ctx.fillRect(0, 0, width, height);

const cx = width / 2;
const cy = height / 2;

// Pulsing ambient gradient
const pulse = Math.sin(time * 3) * 0.1 + 0.9;
const radial = ctx.createRadialGradient(cx, cy * 0.9, 50, cx, cy * 0.9, width * 0.6 * pulse);
radial.addColorStop(0, 'rgba(6, 182, 212, 0.18)');
radial.addColorStop(0.5, 'rgba(2, 132, 199, 0.05)');
radial.addColorStop(1, 'rgba(8, 12, 20, 0)');
ctx.fillStyle = radial;
ctx.fillRect(0, 0, width, height);

// 2. Animated Background Grid Lines
ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
ctx.lineWidth = 1;
const gridSize = 48;
const gridOffset = (time * 20) % gridSize;
for (let x = 0; x < width; x += gridSize) {
  ctx.beginPath();
  ctx.moveTo(x, 0);
  ctx.lineTo(x, height);
  ctx.stroke();
}
for (let y = gridOffset; y < height; y += gridSize) {
  ctx.beginPath();
  ctx.moveTo(0, y);
  ctx.lineTo(width, y);
  ctx.stroke();
}

// 3. Staggered Entrance Animations
// Phase 1: Badge Drop (0.0 -> 0.3)
const badgeProgress = ease.easeOutBack(Math.min(1, Math.max(0, progress / 0.25)));
const badgeY = lerp(cy - 180, cy - 130, badgeProgress);
const badgeAlpha = Math.min(1, progress * 4);

ctx.save();
ctx.globalAlpha = badgeAlpha;
const badgeW = 200;
const badgeH = 34;
ctx.fillStyle = 'rgba(6, 182, 212, 0.1)';
ctx.strokeStyle = props.accentColor;
ctx.lineWidth = 1.5;
roundRect(ctx, cx - badgeW / 2, badgeY, badgeW, badgeH, 17);
ctx.fill();
ctx.stroke();

ctx.font = '600 12px "JetBrains Mono"';
ctx.fillStyle = props.accentColor;
ctx.textAlign = 'center';
ctx.textBaseline = 'middle';
ctx.fillText(props.badge, cx, badgeY + badgeH / 2);
ctx.restore();

// Phase 2: Main Headline Kinetic Rise (0.15 -> 0.5)
const headProgress = ease.easeOutCubic(Math.min(1, Math.max(0, (progress - 0.15) / 0.35)));
const headY = lerp(cy + 40, cy - 40, headProgress);
const headAlpha = Math.min(1, Math.max(0, (progress - 0.15) * 5));

ctx.save();
ctx.globalAlpha = headAlpha;
drawGlowText(ctx, props.headline, cx, headY, {
  font: '800 68px "Plus Jakarta Sans"',
  color: '#FFFFFF',
  glowColor: props.accentColor,
  glowBlur: 24,
});

// Subheadline fade in (0.3 -> 0.6)
const subProgress = ease.easeOutQuad(Math.min(1, Math.max(0, (progress - 0.3) / 0.3)));
ctx.globalAlpha = subProgress;
ctx.font = '400 22px "Plus Jakarta Sans"';
ctx.fillStyle = '#94A3B8';
ctx.textAlign = 'center';
ctx.fillText(props.subheadline, cx, headY + 68);
ctx.restore();

// Phase 3: Floating Metric HUD Card (0.4 -> 0.8)
const cardProgress = ease.easeOutExpo(Math.min(1, Math.max(0, (progress - 0.4) / 0.35)));
const cardY = lerp(height + 100, cy + 130, cardProgress);
const cardW = 380;
const cardH = 88;

ctx.save();
ctx.translate(cx, cardY);
// Subtle floating 3D hover
const cardHover = Math.sin(time * 4) * 6;
ctx.translate(0, cardHover);

// Glass surface
ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
ctx.lineWidth = 1;
roundRect(ctx, -cardW / 2, 0, cardW, cardH, 16);
ctx.fill();
ctx.stroke();

// Accent neon top border line
ctx.beginPath();
ctx.moveTo(-cardW / 2 + 30, 0);
ctx.lineTo(cardW / 2 - 30, 0);
ctx.strokeStyle = props.accentColor;
ctx.lineWidth = 2;
ctx.stroke();

// Metric Text
ctx.font = '700 32px "Plus Jakarta Sans"';
ctx.fillStyle = '#38BDF8';
ctx.textAlign = 'left';
ctx.textBaseline = 'middle';
ctx.fillText(props.metricValue, -cardW / 2 + 28, cardH / 2 - 8);

ctx.font = '500 13px "Plus Jakarta Sans"';
ctx.fillStyle = '#64748B';
ctx.fillText('GPU Parallel Encoding Engine', -cardW / 2 + 28, cardH / 2 + 20);

// Status indicator dot
ctx.beginPath();
ctx.arc(cardW / 2 - 36, cardH / 2, 6, 0, Math.PI * 2);
ctx.fillStyle = props.accentColor;
ctx.fill();
ctx.restore();
`,
  },
  {
    id: 'cyber-glitch',
    name: 'Cyber Matrix Title',
    category: 'cyber',
    description: 'Futuristic HUD title with chromatic aberration, scanning laser beam, and digital target brackets.',
    duration: 6,
    fps: 60,
    aspectRatio: '16:9',
    defaultProps: {
      title: 'HYPERFRAMES',
      subtitle: 'AUTONOMOUS MOTION ENGINE',
      accentColor: '#10B981',
      glitchIntensity: 1.0,
    },
    propConfig: [
      { key: 'title', label: 'Main Title', type: 'text', default: 'HYPERFRAMES' },
      { key: 'subtitle', label: 'Subtitle', type: 'text', default: 'AUTONOMOUS MOTION ENGINE' },
      { key: 'accentColor', label: 'Matrix Accent', type: 'color', default: '#10B981' },
    ],
    code: `// Scene: Cyber Matrix Title
const { ctx, width, height, progress, time, props, ease, lerp, roundRect } = context;

ctx.fillStyle = '#05070B';
ctx.fillRect(0, 0, width, height);

const cx = width / 2;
const cy = height / 2;

// 1. Digital Scanline Overlay
ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
for (let y = 0; y < height; y += 4) {
  ctx.fillRect(0, y, width, 2);
}

// 2. Animated Laser Sweep
const laserY = ((time * 0.7) % 1) * height;
const laserGrad = ctx.createLinearGradient(0, laserY - 30, 0, laserY + 30);
laserGrad.addColorStop(0, 'rgba(16, 185, 129, 0)');
laserGrad.addColorStop(0.5, 'rgba(16, 185, 129, 0.25)');
laserGrad.addColorStop(1, 'rgba(16, 185, 129, 0)');
ctx.fillStyle = laserGrad;
ctx.fillRect(0, laserY - 30, width, 60);

// 3. HUD Target Frame Brackets
const boxSize = 280;
const cornerLen = 30;
ctx.strokeStyle = props.accentColor;
ctx.lineWidth = 2;
ctx.save();
ctx.translate(cx, cy);

// Top-Left
ctx.beginPath();
ctx.moveTo(-boxSize, -boxSize / 2 + cornerLen);
ctx.lineTo(-boxSize, -boxSize / 2);
ctx.lineTo(-boxSize + cornerLen, -boxSize / 2);
ctx.stroke();

// Top-Right
ctx.beginPath();
ctx.moveTo(boxSize - cornerLen, -boxSize / 2);
ctx.lineTo(boxSize, -boxSize / 2);
ctx.lineTo(boxSize, -boxSize / 2 + cornerLen);
ctx.stroke();

// Bottom-Left
ctx.beginPath();
ctx.moveTo(-boxSize, boxSize / 2 - cornerLen);
ctx.lineTo(-boxSize, boxSize / 2);
ctx.lineTo(-boxSize + cornerLen, boxSize / 2);
ctx.stroke();

// Bottom-Right
ctx.beginPath();
ctx.moveTo(boxSize - cornerLen, boxSize / 2);
ctx.lineTo(boxSize, boxSize / 2);
ctx.lineTo(boxSize, boxSize / 2 - cornerLen);
ctx.stroke();
ctx.restore();

// 4. Glitch Chromatic Aberration Text
const isGlitching = Math.sin(time * 12) > 0.85;
const glitchOffset = isGlitching ? (Math.random() - 0.5) * 14 : 0;

ctx.font = '800 76px "JetBrains Mono"';
ctx.textAlign = 'center';
ctx.textBaseline = 'middle';

// Red Channel offset
if (isGlitching) {
  ctx.fillStyle = 'rgba(239, 68, 68, 0.7)';
  ctx.fillText(props.title, cx - glitchOffset, cy - 10);
}

// Cyan Channel offset
if (isGlitching) {
  ctx.fillStyle = 'rgba(6, 182, 212, 0.7)';
  ctx.fillText(props.title, cx + glitchOffset, cy - 10);
}

// Main Title
ctx.fillStyle = '#FFFFFF';
ctx.shadowColor = props.accentColor;
ctx.shadowBlur = 18;
ctx.fillText(props.title, cx, cy - 10);
ctx.shadowBlur = 0;

// Subtitle HUD ticker
ctx.font = '600 16px "JetBrains Mono"';
ctx.fillStyle = props.accentColor;
ctx.fillText(props.subtitle, cx, cy + 60);

// Coordinates readouts
ctx.font = '400 11px "JetBrains Mono"';
ctx.fillStyle = 'rgba(148, 163, 184, 0.6)';
ctx.textAlign = 'left';
ctx.fillText('LOC_X: ' + (cx + Math.sin(time) * 10).toFixed(1), cx - boxSize + 10, cy + boxSize / 2 - 12);
ctx.textAlign = 'right';
ctx.fillText('FRAME: ' + Math.floor(time * 60), cx + boxSize - 10, cy + boxSize / 2 - 12);
`,
  },
  {
    id: 'audio-visualizer',
    name: 'Sonic Frequency Visualizer',
    category: 'visualizer',
    description: 'Harmonic concentric audio spectrum with particle constellations and pulsating central resonance core.',
    duration: 6,
    fps: 60,
    aspectRatio: '16:9',
    defaultProps: {
      trackName: 'FREQUENCY MATRIX',
      bpm: '128 BPM',
      barsCount: 48,
      accentColor: '#F59E0B',
    },
    propConfig: [
      { key: 'trackName', label: 'Track Title', type: 'text', default: 'FREQUENCY MATRIX' },
      { key: 'bpm', label: 'Tempo', type: 'text', default: '128 BPM' },
      { key: 'accentColor', label: 'Spectrum Color', type: 'color', default: '#F59E0B' },
    ],
    code: `// Scene: Sonic Frequency Visualizer
const { ctx, width, height, progress, time, props, ease, lerp } = context;

ctx.fillStyle = '#070913';
ctx.fillRect(0, 0, width, height);

const cx = width / 2;
const cy = height / 2;
const bars = 48;
const baseRadius = 140;

// Central Core Pulse
const beat = Math.pow(Math.sin(time * 5), 4);
const centerR = baseRadius * 0.55 + beat * 24;

const coreGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, centerR);
coreGrad.addColorStop(0, '#FFFFFF');
coreGrad.addColorStop(0.3, props.accentColor);
coreGrad.addColorStop(1, 'rgba(245, 158, 11, 0)');
ctx.fillStyle = coreGrad;
ctx.beginPath();
ctx.arc(cx, cy, centerR, 0, Math.PI * 2);
ctx.fill();

// Concentric Circular Spectrum Bars
for (let i = 0; i < bars; i++) {
  const angle = (i / bars) * Math.PI * 2 + time * 0.2;
  const freq = Math.sin(i * 1.5 + time * 6) * 0.5 + 0.5;
  const barHeight = 20 + freq * 85 + beat * 35;

  const x1 = cx + Math.cos(angle) * baseRadius;
  const y1 = cy + Math.sin(angle) * baseRadius;
  const x2 = cx + Math.cos(angle) * (baseRadius + barHeight);
  const y2 = cy + Math.sin(angle) * (baseRadius + barHeight);

  ctx.strokeStyle = i % 2 === 0 ? props.accentColor : '#EC4899';
  ctx.lineWidth = 4;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
}

// Track Title & Tempo
ctx.font = '700 24px "Plus Jakarta Sans"';
ctx.fillStyle = '#FFFFFF';
ctx.textAlign = 'center';
ctx.textBaseline = 'middle';
ctx.fillText(props.trackName, cx, cy + baseRadius + 140);

ctx.font = '500 13px "JetBrains Mono"';
ctx.fillStyle = '#94A3B8';
ctx.fillText(props.bpm + ' · STEREO 24-BIT 96kHz', cx, cy + baseRadius + 172);
`,
  },
  {
    id: 'vertical-reel',
    name: 'Dynamic Story Reel (9:16)',
    category: 'reels',
    description: 'High-impact 9:16 portrait video template engineered for TikTok, Shorts, and Instagram Reels.',
    duration: 5,
    fps: 60,
    aspectRatio: '9:16',
    defaultProps: {
      headline: 'CODE IS THE NEW CAMERA',
      hook: 'Render in 60 FPS',
      cta: 'Link in Bio',
      accentColor: '#8B5CF6',
    },
    propConfig: [
      { key: 'headline', label: 'Hook Headline', type: 'text', default: 'CODE IS THE NEW CAMERA' },
      { key: 'hook', label: 'Sub-Hook', type: 'text', default: 'Render in 60 FPS' },
      { key: 'cta', label: 'CTA Label', type: 'text', default: 'Link in Bio' },
      { key: 'accentColor', label: 'Brand Color', type: 'color', default: '#8B5CF6' },
    ],
    code: `// Scene: Dynamic Story Reel (9:16)
const { ctx, width, height, progress, time, props, ease, lerp, roundRect } = context;

// Vertical canvas fill
ctx.fillStyle = '#0A0612';
ctx.fillRect(0, 0, width, height);

const cx = width / 2;
const cy = height / 2;

// Top Progress Bar (Reels style)
ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
ctx.fillRect(24, 32, width - 48, 4);
ctx.fillStyle = props.accentColor;
ctx.fillRect(24, 32, (width - 48) * progress, 4);

// Background Animated Fluid Blob
const blobY = cy + Math.sin(time * 2) * 50;
const grad = ctx.createRadialGradient(cx, blobY, 20, cx, blobY, width * 0.8);
grad.addColorStop(0, 'rgba(139, 92, 246, 0.35)');
grad.addColorStop(0.6, 'rgba(236, 72, 153, 0.1)');
grad.addColorStop(1, 'rgba(10, 6, 18, 0)');
ctx.fillStyle = grad;
ctx.beginPath();
ctx.arc(cx, blobY, width * 0.8, 0, Math.PI * 2);
ctx.fill();

// Main Kinetic Headline Words (Word by word stagger)
const words = props.headline.split(' ');
const totalWords = words.length;

ctx.textAlign = 'center';
ctx.textBaseline = 'middle';

words.forEach((word, index) => {
  const wordStart = (index / totalWords) * 0.4;
  const wordProg = ease.easeOutBack(Math.min(1, Math.max(0, (progress - wordStart) / 0.2)));
  const wordAlpha = Math.min(1, Math.max(0, (progress - wordStart) * 5));
  const wordY = cy - 140 + index * 76 + lerp(40, 0, wordProg);
  
  ctx.save();
  ctx.globalAlpha = wordAlpha;
  ctx.font = '800 52px "Plus Jakarta Sans"';
  
  if (index === 0) {
    ctx.fillStyle = props.accentColor;
    ctx.shadowColor = props.accentColor;
    ctx.shadowBlur = 24;
  } else {
    ctx.fillStyle = '#FFFFFF';
  }
  
  ctx.fillText(word, cx, wordY);
  ctx.restore();
});

// Bottom CTA Pill
const ctaProgress = ease.easeOutExpo(Math.min(1, Math.max(0, (progress - 0.5) / 0.3)));
const ctaY = lerp(height + 80, height - 160, ctaProgress);
const ctaW = width - 80;
const ctaH = 64;

ctx.save();
ctx.translate(cx, ctaY);
ctx.fillStyle = props.accentColor;
roundRect(ctx, -ctaW / 2, 0, ctaW, ctaH, 32);
ctx.fill();

ctx.font = '700 20px "Plus Jakarta Sans"';
ctx.fillStyle = '#FFFFFF';
ctx.textAlign = 'center';
ctx.textBaseline = 'middle';
ctx.fillText(props.cta + ' ➔', 0, ctaH / 2);
ctx.restore();
`,
  },
];
