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
  const sourceCanvas = document.createElement('canvas');
  const sourceWidth = Math.max(1, img.naturalWidth || img.width);
  const sourceHeight = Math.max(1, img.naturalHeight || img.height);
  sourceCanvas.width = sourceWidth;
  sourceCanvas.height = sourceHeight;

  const sourceCtx = sourceCanvas.getContext('2d', { willReadFrequently: true })!;
  sourceCtx.drawImage(img, 0, 0, sourceWidth, sourceHeight);
  const source = sourceCtx.getImageData(0, 0, sourceWidth, sourceHeight).data;
  const rect = mode === 'fit-board'
    ? containRect(sourceWidth, sourceHeight, width / height)
    : coverRect(sourceWidth, sourceHeight, width / height);
  const fallback = averageRect(source, sourceWidth, sourceHeight, 0, 0, sourceWidth, sourceHeight);

  return Array.from({ length: width * height }, (_, index) => {
    const row = Math.floor(index / width);
    const col = index % width;
    const mirroredCol = mirror === 'horizontal' || mirror === 'both' ? width - col - 1 : col;
    const mirroredRow = mirror === 'vertical' || mirror === 'both' ? height - row - 1 : row;

    if (mode === 'fit-board' && rect.kind === 'contain') {
      const localX = (mirroredCol + 0.5) / width;
      const localY = (mirroredRow + 0.5) / height;
      if (localX < rect.padX || localX > 1 - rect.padX || localY < rect.padY || localY > 1 - rect.padY) {
        return fallback;
      }
    }

    const sx0 = rect.x + (mirroredCol / width) * rect.w;
    const sx1 = rect.x + ((mirroredCol + 1) / width) * rect.w;
    const sy0 = rect.y + (mirroredRow / height) * rect.h;
    const sy1 = rect.y + ((mirroredRow + 1) / height) * rect.h;
    return averageRect(source, sourceWidth, sourceHeight, sx0, sy0, sx1, sy1);
  });
}

function coverRect(sourceWidth: number, sourceHeight: number, targetAspect: number) {
  const sourceAspect = sourceWidth / sourceHeight;
  if (sourceAspect > targetAspect) {
    const w = sourceHeight * targetAspect;
    return { kind: 'cover' as const, x: (sourceWidth - w) / 2, y: 0, w, h: sourceHeight };
  }
  const h = sourceWidth / targetAspect;
  return { kind: 'cover' as const, x: 0, y: (sourceHeight - h) / 2, w: sourceWidth, h };
}

function containRect(sourceWidth: number, sourceHeight: number, targetAspect: number) {
  const sourceAspect = sourceWidth / sourceHeight;
  if (sourceAspect > targetAspect) {
    const h = sourceWidth / targetAspect;
    return { kind: 'contain' as const, x: 0, y: (sourceHeight - h) / 2, w: sourceWidth, h, padX: 0, padY: Math.max(0, (h - sourceHeight) / h / 2) };
  }
  const w = sourceHeight * targetAspect;
  return { kind: 'contain' as const, x: (sourceWidth - w) / 2, y: 0, w, h: sourceHeight, padX: Math.max(0, (w - sourceWidth) / w / 2), padY: 0 };
}

function averageRect(
  data: Uint8ClampedArray,
  sourceWidth: number,
  sourceHeight: number,
  x0: number,
  y0: number,
  x1: number,
  y1: number,
): SampledPixel {
  const left = clamp(Math.floor(x0), 0, sourceWidth - 1);
  const right = clamp(Math.ceil(x1), left + 1, sourceWidth);
  const top = clamp(Math.floor(y0), 0, sourceHeight - 1);
  const bottom = clamp(Math.ceil(y1), top + 1, sourceHeight);
  let r = 0;
  let g = 0;
  let b = 0;
  let a = 0;
  let count = 0;

  const stepX = Math.max(1, Math.floor((right - left) / 8));
  const stepY = Math.max(1, Math.floor((bottom - top) / 8));
  for (let y = top; y < bottom; y += stepY) {
    for (let x = left; x < right; x += stepX) {
      const offset = (y * sourceWidth + x) * 4;
      const alpha = data[offset + 3] / 255;
      r += data[offset] * alpha + 255 * (1 - alpha);
      g += data[offset + 1] * alpha + 255 * (1 - alpha);
      b += data[offset + 2] * alpha + 255 * (1 - alpha);
      a += data[offset + 3];
      count += 1;
    }
  }

  return {
    r: Math.round(r / count),
    g: Math.round(g / count),
    b: Math.round(b / count),
    a: Math.round(a / count),
  };
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}
