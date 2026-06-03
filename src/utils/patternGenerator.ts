import { getPaletteColors } from '../data/palettes';
import type { PatternResult, PatternSettings } from '../types/pattern';
import { nearestColor, limitPalette } from './colorMatcher';
import { sampleImage } from './imageProcessor';
export async function generatePattern(img: HTMLImageElement, settings: PatternSettings): Promise<PatternResult> {
  const pixels = sampleImage(img, settings.width, settings.height, settings.mirror);
  const palette = getPaletteColors(settings.paletteId, settings.paletteVersion);
  const active = limitPalette(pixels, palette, settings.maxColors);
  const cells = pixels.map((p,i)=>{ const c=nearestColor(p.r,p.g,p.b,active); return { row:Math.floor(i/settings.width), col:i%settings.width, colorId:c.id, colorName:c.name, hex:c.hex }; });
  const map = new Map<string,{colorId:string;colorName:string;hex:string;count:number}>();
  cells.forEach(c=>{ const s=map.get(c.colorId) ?? {colorId:c.colorId,colorName:c.colorName,hex:c.hex,count:0}; s.count++; map.set(c.colorId,s); });
  const stats=[...map.values()].sort((a,b)=>b.count-a.count);
  return { cells, stats, width:settings.width, height:settings.height, totalBeads:cells.length, usedColors:stats.length, settings, createdAt:new Date().toISOString() };
}
