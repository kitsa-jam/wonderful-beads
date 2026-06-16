import { Maximize2, Minus, Plus } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import type { PatternResult } from '../../types/pattern';

export function PatternCanvas({ result }: { result: PatternResult }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [fitCellSize, setFitCellSize] = useState(14);
  const [zoom, setZoom] = useState(1);
  const cellSize = Math.round(fitCellSize * zoom * 10) / 10;
  const gridVars = {
    '--cols': result.width,
    '--cell-size': `${cellSize}px`,
  } as CSSProperties;

  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;

    const updateFit = () => {
      const availableWidth = Math.max(220, wrap.clientWidth - 56);
      const availableHeight = Math.max(220, wrap.clientHeight - 56);
      const next = Math.max(4, Math.min(24, availableWidth / result.width, availableHeight / result.height));
      setFitCellSize(next);
      setZoom(1);
      requestAnimationFrame(() => {
        wrap.scrollLeft = Math.max(0, (wrap.scrollWidth - wrap.clientWidth) / 2);
        wrap.scrollTop = Math.max(0, (wrap.scrollHeight - wrap.clientHeight) / 2);
      });
    };

    updateFit();
    const observer = new ResizeObserver(updateFit);
    observer.observe(wrap);
    return () => observer.disconnect();
  }, [result.width, result.height]);

  function changeZoom(nextZoom: number) {
    const wrap = wrapRef.current;
    if (!wrap) return;
    const oldContentWidth = result.width * cellSize;
    const oldContentHeight = result.height * cellSize;
    const centerX = wrap.scrollLeft + wrap.clientWidth / 2;
    const centerY = wrap.scrollTop + wrap.clientHeight / 2;
    const ratioX = oldContentWidth > 0 ? centerX / oldContentWidth : 0.5;
    const ratioY = oldContentHeight > 0 ? centerY / oldContentHeight : 0.5;

    setZoom(nextZoom);
    requestAnimationFrame(() => {
      const nextCell = fitCellSize * nextZoom;
      wrap.scrollLeft = result.width * nextCell * ratioX - wrap.clientWidth / 2;
      wrap.scrollTop = result.height * nextCell * ratioY - wrap.clientHeight / 2;
    });
  }

  function showWholePattern() {
    const wrap = wrapRef.current;
    setZoom(1);
    requestAnimationFrame(() => {
      if (!wrap) return;
      wrap.scrollLeft = Math.max(0, (wrap.scrollWidth - wrap.clientWidth) / 2);
      wrap.scrollTop = Math.max(0, (wrap.scrollHeight - wrap.clientHeight) / 2);
    });
  }

  return (
    <section className="patternPanel">
      <div className="patternTools">
        <b>图纸预览</b>
        <div>
          <button onClick={() => changeZoom(Math.max(1, zoom - 0.35))} aria-label="缩小图纸"><Minus size={18} /></button>
          <span>{Math.round(zoom * 100)}%</span>
          <button onClick={() => changeZoom(Math.min(5, zoom + 0.35))} aria-label="放大图纸"><Plus size={18} /></button>
          <button onClick={showWholePattern} aria-label="显示完整图纸"><Maximize2 size={18} /></button>
        </div>
      </div>
      <div className="patternWrap" ref={wrapRef} style={gridVars}>
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
              {result.settings.style === 'codes-grid' && cellSize >= 13 ? cell.colorId : ''}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
