import jsPDF from 'jspdf';
import { saveAs } from 'file-saver';
import type { ColorStat, PatternCell, PatternResult } from '../types/pattern';
import { boardLabel } from './board';

export type ExportPatternMode = 'codes' | 'blocks';

const PAGE_W = 1240;
const PAGE_H = 1754;
const MARGIN = 72;
const CARD = '#FFFFFF';
const PAPER = '#FFF8F2';
const INK = '#2F2F3A';
const MUTED = '#756C78';
const PINK = '#FF91B8';
const PURPLE = '#A98CFF';
const BORDER = '#F4DDE8';

type BoardSlice = {
  label: string;
  startRow: number;
  endRow: number;
  startCol: number;
  endCol: number;
  cells: PatternCell[];
};

export async function exportPNG(result: PatternResult, mode: ExportPatternMode) {
  const canvas = createCompletePatternCanvas(result, mode);
  const blob = await canvasToBlob(canvas, 'image/png');
  saveAs(blob, 'wonderful-beads-pattern.png');
}

export async function exportJPG(result: PatternResult, mode: ExportPatternMode) {
  const canvas = createCompletePatternCanvas(result, mode);
  const blob = await canvasToBlob(canvas, 'image/jpeg', 0.96);
  saveAs(blob, 'wonderful-beads-pattern.jpg');
}

export async function saveJPGToAlbum(result: PatternResult, mode: ExportPatternMode) {
  const canvas = createCompletePatternCanvas(result, mode);
  const blob = await canvasToBlob(canvas, 'image/jpeg', 0.96);
  const file = new File([blob], 'wonderful-beads-pattern.jpg', { type: 'image/jpeg' });
  const nav = navigator as Navigator & {
    canShare?: (data: ShareData & { files?: File[] }) => boolean;
    share?: (data: ShareData & { files?: File[] }) => Promise<void>;
  };

  if (nav.canShare?.({ files: [file] }) && nav.share) {
    await nav.share({
      files: [file],
      title: '玩豆否拼豆图纸',
      text: '保存高清 JPG 图纸到手机相册',
    });
    return;
  }

  saveAs(blob, 'wonderful-beads-pattern.jpg');
}

export async function exportPDF(result: PatternResult, mode: ExportPatternMode) {
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pages = [
    createCoverCanvas(result),
    createOverviewCanvas(result, mode),
    ...createColorListCanvases(result.stats),
    ...createBoardCanvases(result, mode),
  ];

  pages.forEach((canvas, index) => {
    if (index > 0) pdf.addPage();
    pdf.addImage(canvas.toDataURL('image/jpeg', 0.92), 'JPEG', 0, 0, 210, 297);
  });
  pdf.save('wonderful-beads-pattern.pdf');
}

export function exportCSV(result: PatternResult) {
  const rows = ['色号,颜色名,HEX,数量', ...result.stats.map((stat) => `${stat.colorId},${stat.colorName},${stat.hex},${stat.count}`)];
  saveAs(new Blob([rows.join('\n')], { type: 'text/csv;charset=utf-8' }), 'wonderful-beads-colors.csv');
}

export function exportJSON(result: PatternResult) {
  saveAs(new Blob([JSON.stringify(result, null, 2)], { type: 'application/json' }), 'wonderful-beads-project.json');
}

function createCompletePatternCanvas(result: PatternResult, mode: ExportPatternMode) {
  const board = result.settings.boardSize;
  const cell = result.width > 110 ? 12 : result.width > 80 ? 15 : 22;
  const gridW = result.width * cell;
  const gridH = result.height * cell;
  const listCols = gridW > 980 ? 4 : gridW > 680 ? 3 : 2;
  const listRowH = 42;
  const listRows = Math.ceil(result.stats.length / listCols);
  const width = Math.max(920, gridW + 120);
  const height = 280 + gridH + 96 + listRows * listRowH;
  const canvas = makeCanvas(width, height);
  const ctx = canvas.getContext('2d')!;

  fillPage(ctx, width, height);
  drawHeader(ctx, '玩豆否 Wonderful Beads', '完整拼豆图纸与颜色清单', 48, 54, width - 96);
  drawInfoLine(ctx, result, 48, 142);
  drawPattern(ctx, result, result.cells, {
    x: 60,
    y: 220,
    cell,
    rows: result.height,
    cols: result.width,
    startRow: 0,
    startCol: 0,
    board,
    mode,
  });
  drawColorList(ctx, result.stats, 60, 220 + gridH + 76, width - 120, listCols);
  return canvas;
}

function createCoverCanvas(result: PatternResult) {
  const canvas = makeCanvas(PAGE_W, PAGE_H);
  const ctx = canvas.getContext('2d')!;
  fillPage(ctx, PAGE_W, PAGE_H);

  ctx.fillStyle = CARD;
  roundRect(ctx, MARGIN, MARGIN, PAGE_W - MARGIN * 2, PAGE_H - MARGIN * 2, 36, true);
  drawBeadsMark(ctx, PAGE_W - 338, 150);
  drawHeader(ctx, '玩豆否 Wonderful Beads', '把喜欢拼成 wonderful', 132, 220, 780);
  ctx.font = '34px Microsoft YaHei, Arial';
  ctx.fillStyle = MUTED;
  ctx.fillText('在线图片转拼豆图纸生成器', 132, 390);

  const facts = [
    ['图纸尺寸', `${result.width} x ${result.height}`],
    ['总豆数', `${result.totalBeads}`],
    ['使用颜色', `${result.usedColors}`],
    ['色卡版本', `${result.settings.paletteId.toUpperCase()} ${result.settings.paletteVersion} 色`],
    ['拼豆板数量', `${Math.ceil(result.width / result.settings.boardSize) * Math.ceil(result.height / result.settings.boardSize)}`],
  ];
  drawFactGrid(ctx, facts, 132, 510, 976);

  ctx.font = '26px Microsoft YaHei, Arial';
  ctx.fillStyle = MUTED;
  ctx.fillText('导出内容：完整图纸总览、颜色清单、29x29 分板图纸。', 132, 1320);
  return canvas;
}

function createOverviewCanvas(result: PatternResult, mode: ExportPatternMode) {
  const canvas = makeCanvas(PAGE_W, PAGE_H);
  const ctx = canvas.getContext('2d')!;
  fillPage(ctx, PAGE_W, PAGE_H);
  drawHeader(ctx, '完整图纸总览', 'Overview Pattern', MARGIN, 74, PAGE_W - MARGIN * 2);
  drawInfoLine(ctx, result, MARGIN, 168);

  const maxW = PAGE_W - MARGIN * 2;
  const maxH = PAGE_H - 310;
  const cell = Math.max(3, Math.floor(Math.min(maxW / result.width, maxH / result.height)));
  const x = Math.round((PAGE_W - result.width * cell) / 2);
  drawPattern(ctx, result, result.cells, {
    x,
    y: 250,
    cell,
    rows: result.height,
    cols: result.width,
    startRow: 0,
    startCol: 0,
    board: result.settings.boardSize,
    mode: mode === 'codes' && cell >= 10 ? 'codes' : 'blocks',
  });
  return canvas;
}

function createColorListCanvases(stats: ColorStat[]): HTMLCanvasElement[] {
  const source = stats.length ? stats : [{ colorId: '-', colorName: '无', hex: '#ffffff', count: 0 }];
  const rowsPerPage = 28;
  const pages: HTMLCanvasElement[] = [];
  for (let i = 0; i < source.length; i += rowsPerPage) {
    const canvas = makeCanvas(PAGE_W, PAGE_H);
    const ctx = canvas.getContext('2d')!;
    fillPage(ctx, PAGE_W, PAGE_H);
    drawHeader(ctx, '颜色清单', 'Color List', MARGIN, 74, PAGE_W - MARGIN * 2);
    drawColorList(ctx, source.slice(i, i + rowsPerPage), MARGIN, 200, PAGE_W - MARGIN * 2, 2, true);
    pages.push(canvas);
  }
  return pages;
}

function createBoardCanvases(result: PatternResult, mode: ExportPatternMode) {
  return getBoardSlices(result).map((slice) => {
    const canvas = makeCanvas(PAGE_W, PAGE_H);
    const ctx = canvas.getContext('2d')!;
    fillPage(ctx, PAGE_W, PAGE_H);
    drawHeader(ctx, `分板图纸 ${slice.label}`, '29 x 29 Board Section', MARGIN, 74, PAGE_W - MARGIN * 2);

    ctx.font = '28px Microsoft YaHei, Arial';
    ctx.fillStyle = MUTED;
    ctx.fillText(`行范围：${slice.startRow + 1}-${slice.endRow + 1}    列范围：${slice.startCol + 1}-${slice.endCol + 1}`, MARGIN, 170);

    const rows = slice.endRow - slice.startRow + 1;
    const cols = slice.endCol - slice.startCol + 1;
    const cell = Math.floor(Math.min((PAGE_W - MARGIN * 2) / cols, (PAGE_H - 300) / rows));
    const x = Math.round((PAGE_W - cols * cell) / 2);
    drawPattern(ctx, result, slice.cells, {
      x,
      y: 230,
      cell,
      rows,
      cols,
      startRow: slice.startRow,
      startCol: slice.startCol,
      board: result.settings.boardSize,
      mode,
    });
    return canvas;
  });
}

function getBoardSlices(result: PatternResult): BoardSlice[] {
  const slices: BoardSlice[] = [];
  const board = result.settings.boardSize;
  for (let row = 0; row < result.height; row += board) {
    for (let col = 0; col < result.width; col += board) {
      const endRow = Math.min(row + board - 1, result.height - 1);
      const endCol = Math.min(col + board - 1, result.width - 1);
      slices.push({
        label: boardLabel(row, col, board),
        startRow: row,
        endRow,
        startCol: col,
        endCol,
        cells: result.cells.filter((cell) => cell.row >= row && cell.row <= endRow && cell.col >= col && cell.col <= endCol),
      });
    }
  }
  return slices;
}

function drawPattern(
  ctx: CanvasRenderingContext2D,
  result: PatternResult,
  cells: PatternCell[],
  opts: { x: number; y: number; cell: number; rows: number; cols: number; startRow: number; startCol: number; board: number; mode: ExportPatternMode },
) {
  const map = new Map(cells.map((cell) => [`${cell.row}-${cell.col}`, cell]));
  ctx.save();
  ctx.fillStyle = CARD;
  roundRect(ctx, opts.x - 26, opts.y - 26, opts.cols * opts.cell + 52, opts.rows * opts.cell + 52, 20, true);

  for (let row = 0; row < opts.rows; row += 1) {
    for (let col = 0; col < opts.cols; col += 1) {
      const sourceRow = row + opts.startRow;
      const sourceCol = col + opts.startCol;
      const cell = map.get(`${sourceRow}-${sourceCol}`) ?? result.cells[sourceRow * result.width + sourceCol];
      const x = opts.x + col * opts.cell;
      const y = opts.y + row * opts.cell;
      ctx.fillStyle = cell.hex;
      ctx.fillRect(x, y, opts.cell, opts.cell);
      ctx.strokeStyle = '#00000035';
      ctx.lineWidth = 1;
      ctx.strokeRect(x, y, opts.cell, opts.cell);

      if ((sourceCol + 1) % opts.board === 0) {
        ctx.strokeStyle = INK;
        ctx.lineWidth = 3;
        line(ctx, x + opts.cell, opts.y, x + opts.cell, opts.y + opts.rows * opts.cell);
      }
      if ((sourceRow + 1) % opts.board === 0) {
        ctx.strokeStyle = INK;
        ctx.lineWidth = 3;
        line(ctx, opts.x, y + opts.cell, opts.x + opts.cols * opts.cell, y + opts.cell);
      }

      if (opts.mode === 'codes') {
        drawCellCode(ctx, cell.colorId, x, y, opts.cell);
      }
    }
  }

  drawAxis(ctx, opts);
  ctx.restore();
}

function drawCellCode(ctx: CanvasRenderingContext2D, code: string, x: number, y: number, cell: number) {
  if (cell < 12) return;
  let size = Math.min(22, Math.max(7, cell * 0.32));
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = INK;
  do {
    ctx.font = `800 ${size}px Arial`;
    if (ctx.measureText(code).width <= cell - 3 || size <= 6) break;
    size -= 1;
  } while (size > 6);
  ctx.fillText(code, x + cell / 2, y + cell / 2);
}

function drawAxis(ctx: CanvasRenderingContext2D, opts: { x: number; y: number; cell: number; rows: number; cols: number; startRow: number; startCol: number }) {
  if (opts.cell < 14) return;
  ctx.font = `${Math.min(18, opts.cell * 0.42)}px Arial`;
  ctx.fillStyle = MUTED;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  for (let col = 0; col < opts.cols; col += 1) {
    ctx.fillText(String(opts.startCol + col + 1), opts.x + col * opts.cell + opts.cell / 2, opts.y - opts.cell * 0.55);
  }
  for (let row = 0; row < opts.rows; row += 1) {
    ctx.fillText(String(opts.startRow + row + 1), opts.x - opts.cell * 0.55, opts.y + row * opts.cell + opts.cell / 2);
  }
}

function drawColorList(ctx: CanvasRenderingContext2D, stats: ColorStat[], x: number, y: number, width: number, cols: number, roomy = false) {
  const gap = 16;
  const rowH = roomy ? 88 : 42;
  const colW = (width - gap * (cols - 1)) / cols;
  ctx.font = `800 ${roomy ? 28 : 20}px Microsoft YaHei, Arial`;
  ctx.fillStyle = INK;
  ctx.fillText('颜色清单', x, y - 24);

  stats.forEach((stat, index) => {
    const col = index % cols;
    const row = Math.floor(index / cols);
    const px = x + col * (colW + gap);
    const py = y + row * rowH;
    ctx.fillStyle = CARD;
    roundRect(ctx, px, py, colW, rowH - 8, roomy ? 18 : 12, true);
    ctx.fillStyle = stat.hex;
    roundRect(ctx, px + 12, py + 10, roomy ? 48 : 24, roomy ? 48 : 24, roomy ? 12 : 7, true);
    ctx.strokeStyle = '#00000028';
    ctx.stroke();
    ctx.fillStyle = INK;
    ctx.font = `800 ${roomy ? 25 : 17}px Microsoft YaHei, Arial`;
    ctx.fillText(`${stat.colorId}  ${stat.count} 颗`, px + (roomy ? 76 : 46), py + (roomy ? 31 : 27));
    ctx.fillStyle = MUTED;
    ctx.font = `${roomy ? 21 : 14}px Microsoft YaHei, Arial`;
    ctx.fillText(`${stat.colorName}  ${stat.hex}`, px + (roomy ? 76 : 46), py + (roomy ? 58 : 39));
  });
}

function drawHeader(ctx: CanvasRenderingContext2D, title: string, subtitle: string, x: number, y: number, width: number) {
  ctx.fillStyle = PINK;
  roundRect(ctx, x, y - 42, 88, 28, 14, true);
  ctx.fillStyle = PURPLE;
  roundRect(ctx, x + 104, y - 42, 52, 28, 14, true);
  ctx.fillStyle = INK;
  ctx.font = '800 54px Microsoft YaHei, Arial';
  fitText(ctx, title, x, y + 52, width, 54);
  ctx.fillStyle = MUTED;
  ctx.font = '28px Microsoft YaHei, Arial';
  ctx.fillText(subtitle, x, y + 100);
}

function drawInfoLine(ctx: CanvasRenderingContext2D, result: PatternResult, x: number, y: number) {
  ctx.font = '22px Microsoft YaHei, Arial';
  ctx.fillStyle = MUTED;
  ctx.fillText(`尺寸 ${result.width}x${result.height}    总豆数 ${result.totalBeads}    使用颜色 ${result.usedColors}    色卡 ${result.settings.paletteId.toUpperCase()} ${result.settings.paletteVersion} 色`, x, y);
}

function drawFactGrid(ctx: CanvasRenderingContext2D, facts: string[][], x: number, y: number, width: number) {
  const cols = 2;
  const gap = 20;
  const itemW = (width - gap) / cols;
  facts.forEach(([label, value], index) => {
    const px = x + (index % cols) * (itemW + gap);
    const py = y + Math.floor(index / cols) * 132;
    ctx.fillStyle = PAPER;
    roundRect(ctx, px, py, itemW, 104, 22, true);
    ctx.fillStyle = MUTED;
    ctx.font = '22px Microsoft YaHei, Arial';
    ctx.fillText(label, px + 26, py + 36);
    ctx.fillStyle = INK;
    ctx.font = '800 32px Microsoft YaHei, Arial';
    ctx.fillText(value, px + 26, py + 76);
  });
}

function drawBeadsMark(ctx: CanvasRenderingContext2D, x: number, y: number) {
  const colors = [PINK, PURPLE, '#FFD166', '#B8E6D1', CARD];
  for (let i = 0; i < 25; i += 1) {
    ctx.fillStyle = colors[i % colors.length];
    ctx.beginPath();
    ctx.arc(x + (i % 5) * 46, y + Math.floor(i / 5) * 46, 17, 0, Math.PI * 2);
    ctx.fill();
  }
}

function makeCanvas(width: number, height: number) {
  const canvas = document.createElement('canvas');
  canvas.width = Math.ceil(width);
  canvas.height = Math.ceil(height);
  return canvas;
}

function canvasToBlob(canvas: HTMLCanvasElement, type: string, quality?: number) {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(blob);
      } else {
        reject(new Error('图片生成失败，请稍后再试'));
      }
    }, type, quality);
  });
}

function fillPage(ctx: CanvasRenderingContext2D, width: number, height: number) {
  ctx.fillStyle = PAPER;
  ctx.fillRect(0, 0, width, height);
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number, fill = false) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
  if (fill) ctx.fill();
}

function line(ctx: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number) {
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
}

function fitText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number, startSize: number) {
  let size = startSize;
  do {
    ctx.font = `800 ${size}px Microsoft YaHei, Arial`;
    if (ctx.measureText(text).width <= maxWidth || size <= 24) break;
    size -= 2;
  } while (size > 24);
  ctx.fillText(text, x, y);
}
