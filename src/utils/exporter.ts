import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { saveAs } from 'file-saver';
import type { PatternResult } from '../types/pattern';
export async function exportPNG(node:HTMLElement){ const canvas=await html2canvas(node,{backgroundColor:'#fff8f2',scale:2}); canvas.toBlob(b=>b&&saveAs(b,'wonderful-beads-pattern.png')); }
export async function exportPDF(node:HTMLElement, result:PatternResult){ const canvas=await html2canvas(node,{backgroundColor:'#fff8f2',scale:2}); const img=canvas.toDataURL('image/png'); const pdf=new jsPDF('p','mm','a4'); const w=190; const h=canvas.height*w/canvas.width; pdf.addImage(img,'PNG',10,10,w,Math.min(h,277)); pdf.addPage(); pdf.text('Wonderful Beads Color List',10,12); result.stats.forEach((s,i)=>pdf.text(`${s.colorId} ${s.colorName} ${s.hex} ${s.count}`,10,24+i*7)); pdf.save('wonderful-beads-pattern.pdf'); }
export function exportCSV(result:PatternResult){ const rows=['色号,颜色名,HEX,数量',...result.stats.map(s=>`${s.colorId},${s.colorName},${s.hex},${s.count}`)]; saveAs(new Blob([rows.join('\n')],{type:'text/csv;charset=utf-8'}),'wonderful-beads-colors.csv'); }
export function exportJSON(result:PatternResult){ saveAs(new Blob([JSON.stringify(result,null,2)],{type:'application/json'}),'wonderful-beads-project.json'); }
