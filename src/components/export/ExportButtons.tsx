import { useState } from 'react';
import { Download, FileJson, FileText, ImageDown } from 'lucide-react';
import type { PatternResult } from '../../types/pattern';
import { exportCSV, exportJSON, exportPDF, exportPNG, type ExportPatternMode } from '../../utils/exporter';
import { Button } from '../common/Button';

export function ExportButtons({ result }: { result: PatternResult; targetId?: string }) {
  const [mode, setMode] = useState<ExportPatternMode>('codes');

  return (
    <div className="exportPanel">
      <div className="exportMode" aria-label="导出图纸模式">
        <button className={mode === 'codes' ? 'active' : ''} onClick={() => setMode('codes')}>显示色号</button>
        <button className={mode === 'blocks' ? 'active' : ''} onClick={() => setMode('blocks')}>只显示色块</button>
      </div>
      <div className="exportBar">
        <Button onClick={() => exportPNG(result, mode)}><ImageDown size={18} />PNG</Button>
        <Button onClick={() => exportPDF(result, mode)}><Download size={18} />PDF</Button>
        <Button variant="soft" onClick={() => exportCSV(result)}><FileText size={18} />CSV</Button>
        <Button variant="soft" onClick={() => exportJSON(result)}><FileJson size={18} />JSON</Button>
      </div>
    </div>
  );
}
