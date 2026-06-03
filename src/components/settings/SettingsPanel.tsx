import { useState } from 'react';
import { Check, ChevronRight, X } from 'lucide-react';
import { palettes } from '../../data/palettes';
import { defaultSettings, type MergeStrength } from '../../types/pattern';
import { boardPresets, canvasPresets } from '../../utils/board';
import { usePatternStore } from '../../store/usePatternStore';

const maxColors = [8, 16, 24, 32, 48, 64, 96, 128];
const mergeOptions: { value: MergeStrength; label: string; note: string }[] = [
  { value: 'none', label: '不合并', note: '保留更多细节' },
  { value: 'light', label: '轻度合并', note: '轻微减少近似色' },
  { value: 'medium', label: '中度合并', note: '推荐，制作更顺手' },
  { value: 'strong', label: '强力合并', note: '颜色更少，画面更概括' },
];

type SheetKey = 'size' | 'paletteVersion' | 'maxColors' | 'mergeStrength' | null;

export function SettingsPanel() {
  const { settings, setSettings } = usePatternStore();
  const [sheet, setSheet] = useState<SheetKey>(null);
  const palette = palettes.find((item) => item.id === settings.paletteId) ?? palettes[1];
  const paletteVersions = Object.keys(palette.versions);
  const currentMerge = mergeOptions.find((item) => item.value === settings.mergeStrength) ?? mergeOptions[2];
  const sizeOptions = [
    ...canvasPresets.map(([w, h]) => ({ label: `${w}x${h}`, note: '常用画布尺寸', w, h })),
    ...boardPresets.map((item) => ({ label: item.label, note: '拼豆板尺寸', w: item.w, h: item.h })),
  ];

  return (
    <section className="card settings">
      <div className="settingsHead">
        <h2>图纸参数</h2>
        <span>{settings.width}x{settings.height}</span>
      </div>

      <div className="settingsList">
        <div className="settingItem">
          <div>
            <b>生成方式</b>
            <small>控制取图比例</small>
          </div>
          <select value={settings.mode} onChange={(e) => setSettings({ mode: e.target.value as typeof settings.mode })}>
            <option value="keep-ratio">保持图片比例</option>
            <option value="fit-board">适配拼豆板</option>
          </select>
        </div>

        <button className="settingItem settingButton" onClick={() => setSheet('size')}>
          <div>
            <b>图纸尺寸</b>
            <small>{settings.width}x{settings.height}，16 到 256</small>
          </div>
          <span>{settings.width}x{settings.height}<ChevronRight size={18} /></span>
        </button>

        <div className="customSize">
          <label>
            <span>宽度</span>
            <input type="number" min={16} max={256} value={settings.width} onChange={(e) => setSettings({ width: +e.target.value })} />
          </label>
          <label>
            <span>高度</span>
            <input type="number" min={16} max={256} value={settings.height} onChange={(e) => setSettings({ height: +e.target.value })} />
          </label>
        </div>

        {settings.width * settings.height > 16000 && <p className="warn">尺寸较大，生成和导出可能需要更多时间。</p>}

        <div className="settingItem">
          <div>
            <b>拼豆板规格</b>
            <small>每 29 格显示分区线</small>
          </div>
          <select value={settings.boardSize} onChange={(e) => setSettings({ boardSize: +e.target.value })}>
            <option value={29}>标准方板 29x29</option>
          </select>
        </div>

        <div className="settingItem">
          <div>
            <b>豆子色卡</b>
            <small>真实颜色候选范围</small>
          </div>
          <select
            value={settings.paletteId}
            onChange={(e) => setSettings({ paletteId: e.target.value, paletteVersion: e.target.value === 'basic' ? '16' : defaultSettings.paletteVersion })}
          >
            {palettes.map((item) => <option value={item.id} key={item.id}>{item.name}</option>)}
          </select>
        </div>

        <button className="settingItem settingButton" onClick={() => setSheet('paletteVersion')}>
          <div>
            <b>色卡版本</b>
            <small>可从多少个真实色号中选择</small>
          </div>
          <span>{settings.paletteVersion} 色<ChevronRight size={18} /></span>
        </button>

        <button className="settingItem settingButton" onClick={() => setSheet('maxColors')}>
          <div>
            <b>最终使用颜色数</b>
            <small>颜色越多越接近原图，制作也更复杂</small>
          </div>
          <span>{settings.maxColors} 色<ChevronRight size={18} /></span>
        </button>

        <button className="settingItem settingButton" onClick={() => setSheet('mergeStrength')}>
          <div>
            <b>相近颜色合并</b>
            <small>{currentMerge.note}</small>
          </div>
          <span>{currentMerge.label}<ChevronRight size={18} /></span>
        </button>

        <div className="settingItem">
          <div>
            <b>镜像设置</b>
            <small>按制作方向翻转</small>
          </div>
          <select value={settings.mirror} onChange={(e) => setSettings({ mirror: e.target.value as typeof settings.mirror })}>
            <option value="none">不镜像</option>
            <option value="horizontal">水平镜像</option>
            <option value="vertical">垂直镜像</option>
            <option value="both">同时导出正向和镜像</option>
          </select>
        </div>

        <div className="settingItem">
          <div>
            <b>图纸样式</b>
            <small>色号图 + 网格为默认</small>
          </div>
          <select value={settings.style} onChange={(e) => setSettings({ style: e.target.value as typeof settings.style })}>
            <option value="blocks">纯色块图</option>
            <option value="grid">网格图</option>
            <option value="codes-grid">色号图 + 网格</option>
          </select>
        </div>
      </div>

      <p className="hint">从所选色卡中挑选这些颜色生成图纸。颜色越多越接近原图，但制作难度也越高。</p>

      {sheet && (
        <div className="sheetOverlay" role="dialog" aria-modal="true" onClick={() => setSheet(null)}>
          <div className="bottomSheet" onClick={(e) => e.stopPropagation()}>
            <div className="sheetHandle" />
            <div className="sheetTitle">
              <b>{sheetTitle(sheet)}</b>
              <button onClick={() => setSheet(null)} aria-label="关闭"><X size={20} /></button>
            </div>
            <div className="sheetOptions">
              {sheet === 'size' && sizeOptions.map((item) => (
                <button key={`${item.note}-${item.label}`} onClick={() => { setSettings({ width: item.w, height: item.h }); setSheet(null); }}>
                  <span><b>{item.label}</b><small>{item.note}</small></span>
                  {settings.width === item.w && settings.height === item.h && <Check size={20} />}
                </button>
              ))}
              {sheet === 'paletteVersion' && paletteVersions.map((version) => (
                <button key={version} onClick={() => { setSettings({ paletteVersion: version }); setSheet(null); }}>
                  <span><b>{version} 色</b><small>{version === '221' ? '推荐，玩家常用专业款' : '适合不同细腻度'}</small></span>
                  {settings.paletteVersion === version && <Check size={20} />}
                </button>
              ))}
              {sheet === 'maxColors' && maxColors.map((count) => (
                <button key={count} onClick={() => { setSettings({ maxColors: count }); setSheet(null); }}>
                  <span><b>{count} 色</b><small>{count === 32 ? '推荐，细节和难度更平衡' : count < 32 ? '更容易制作' : '更接近原图'}</small></span>
                  {settings.maxColors === count && <Check size={20} />}
                </button>
              ))}
              {sheet === 'mergeStrength' && mergeOptions.map((item) => (
                <button key={item.value} onClick={() => { setSettings({ mergeStrength: item.value }); setSheet(null); }}>
                  <span><b>{item.label}</b><small>{item.note}</small></span>
                  {settings.mergeStrength === item.value && <Check size={20} />}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

function sheetTitle(sheet: Exclude<SheetKey, null>) {
  return {
    size: '选择图纸尺寸',
    paletteVersion: '选择色卡版本',
    maxColors: '选择最终颜色数',
    mergeStrength: '选择合并强度',
  }[sheet];
}
