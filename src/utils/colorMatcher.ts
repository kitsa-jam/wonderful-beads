import type { PaletteColor } from '../types/pattern';
const rgb = (hex:string) => { const v=hex.replace('#',''); return [parseInt(v.slice(0,2),16),parseInt(v.slice(2,4),16),parseInt(v.slice(4,6),16)] as const; };
const dist = (a:readonly number[], b:readonly number[]) => {
  const dr = a[0] - b[0];
  const dg = a[1] - b[1];
  const db = a[2] - b[2];
  const lightness = (dr + dg + db) / 3;
  return dr * dr * .35 + dg * dg * .48 + db * db * .17 + lightness * lightness * .18;
};
export const nearestColor = (r:number,g:number,b:number, palette:PaletteColor[]) => palette.reduce((best,c)=> dist([r,g,b],rgb(c.hex)) < dist([r,g,b],rgb(best.hex)) ? c : best, palette[0]);
export const limitPalette = (pixels:{r:number;g:number;b:number}[], palette:PaletteColor[], max:number) => {
  const counts = new Map<string,{color:PaletteColor;count:number}>();
  pixels.forEach(p=>{ const c=nearestColor(p.r,p.g,p.b,palette); const item=counts.get(c.id) ?? {color:c,count:0}; item.count++; counts.set(c.id,item); });
  return [...counts.values()].sort((a,b)=>b.count-a.count).slice(0,max).map(x=>x.color);
};
