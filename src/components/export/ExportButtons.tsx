import { Download, FileJson, FileText, ImageDown } from 'lucide-react';
import type { PatternResult } from '../../types/pattern';
import { exportCSV, exportJSON, exportPDF, exportPNG } from '../../utils/exporter';
import { Button } from '../common/Button';
export function ExportButtons({result,targetId}:{result:PatternResult;targetId:string}){ const node=()=>document.getElementById(targetId)!; return <div className="exportBar"><Button onClick={()=>exportPNG(node())}><ImageDown size={18}/>PNG</Button><Button onClick={()=>exportPDF(node(),result)}><Download size={18}/>PDF</Button><Button variant="soft" onClick={()=>exportCSV(result)}><FileText size={18}/>CSV</Button><Button variant="soft" onClick={()=>exportJSON(result)}><FileJson size={18}/>JSON</Button></div> }
