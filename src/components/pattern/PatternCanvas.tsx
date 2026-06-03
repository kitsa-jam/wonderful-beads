import { Minus, Plus } from 'lucide-react';
import { useState } from 'react';
import type { CSSProperties } from 'react';
import type { PatternResult } from '../../types/pattern';

export function PatternCanvas({ result }: { result: PatternResult }) {
  const [cellSize, setCellSize] = useState(24);
  const gridVars = {
    '--cols': result.width,
    '--cell-size': `${cellSize}px`,
  } as CSSProperties;

  return (
    <section className="patternPanel">
      <div className="patternTools">
        <b>图纸预览</b>
        <div>
          <button onClick={() => setCellSize((size) => Math.max(14, size - 3))} aria-label="缩小图纸"><Minus size={18} /></button>
          <span>{Math.round((cellSize / 24) * 100)}%</span>
          <button onClick={() => setCellSize((size) => Math.min(34, size + 3))} aria-label="放大图纸"><Plus size={18} /></button>
        </div>
      </div>
      <div className="patternWrap" style={gridVars}>
        <div className="axis top">{Array.from({ length: result.width }, (_, i) => <span key={i}>{i + 1}</span>)}</div>
        <div className="axis left">{Array.from({ length: result.height }, (_, i) => <span key={i}>{i + 1}</span>)}</div>
        <div className="patternGrid" style={{ gridTemplateColumns: `repeat(${result.width}, var(--cell-size))` }}>
          {result.cells.map((cell) => (
            <span
              key={`${cell.row}-${cell.col}`}
              className="cell"
              style={{
                background: cell.hex,
                borderRight: (cell.col + 1) % 29 === 0 ? '2px solid #2f2f3a' : undefined,
                borderBottom: (cell.row + 1) % 29 === 0 ? '2px solid #2f2f3a' : undefined,
              }}
              title={`${cell.row + 1},${cell.col + 1} ${cell.colorId}`}
            >
              {result.settings.style === 'codes-grid' ? cell.colorId : ''}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
