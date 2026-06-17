import type { GenerationMode, MirrorMode } from '../types/pattern';

export type SampledPixel = { r: number; g: number; b: number; a: number };

export async function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}

export function sampleImage(
  img: HTMLImageElement,
  width: number,
  height: number,
  mirror: MirrorMode = 'none',
  mode: GenerationMode = 'keep-ratio',
): SampledPixel[] {
  const pixelCanvas = document.createElement('canvas');
  pixelCanvas.width = width;
  pixelCanvas.height = height;

  const ctx = pixelCanvas.getContext('2d', { willReadFrequently: true })!;
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, width, height);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  const sourceWidth = Math.max(1, img.naturalWidth || img.width);
  const sourceHeight = Math.max(1, img.naturalHeight || img.height);
  const draw = mode === 'keep-ratio'
    ? containRect(sourceWidth, sourceHeight, width, height)
    : coverRect(sourceWidth, sourceHeight, width, height);

  ctx.save();
  applyMirror(ctx, width, height, mirror);
  ctx.drawImage(img, draw.x, draw.y, draw.w, draw.h);
  ctx.restore();

  const data = ctx.getImageData(0, 0, width, height).data;
  return Array.from({ length: width * height }, (_, index) => {
    const offset = index * 4;
    return {
      r: data[offset],
      g: data[offset + 1],
      b: data[offset + 2],
      a: data[offset + 3],
    };
  });
}

function containRect(sourceWidth: number, sourceHeight: number, targetWidth: number, targetHeight: number) {
  const scale = Math.min(targetWidth / sourceWidth, targetHeight / sourceHeight);
  const w = sourceWidth * scale;
  const h = sourceHeight * scale;
  return {
    x: (targetWidth - w) / 2,
    y: (targetHeight - h) / 2,
    w,
    h,
  };
}

function coverRect(sourceWidth: number, sourceHeight: number, targetWidth: number, targetHeight: number) {
  const scale = Math.max(targetWidth / sourceWidth, targetHeight / sourceHeight);
  const w = sourceWidth * scale;
  const h = sourceHeight * scale;
  return {
    x: (targetWidth - w) / 2,
    y: (targetHeight - h) / 2,
    w,
    h,
  };
}

function applyMirror(ctx: CanvasRenderingContext2D, width: number, height: number, mirror: MirrorMode) {
  if (mirror === 'horizontal' || mirror === 'both') {
    ctx.translate(width, 0);
    ctx.scale(-1, 1);
  }
  if (mirror === 'vertical' || mirror === 'both') {
    ctx.translate(0, height);
    ctx.scale(1, -1);
  }
}
