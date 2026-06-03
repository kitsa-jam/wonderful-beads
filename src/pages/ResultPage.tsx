import { ArrowLeft } from 'lucide-react';
import { ColorList } from '../components/pattern/ColorList';
import { PatternCanvas } from '../components/pattern/PatternCanvas';
import { ExportButtons } from '../components/export/ExportButtons';
import { usePatternStore } from '../store/usePatternStore';
import { boardCount } from '../utils/board';
export function ResultPage(){ const {result}=usePatternStore(); if(!result) return <section className="empty card"><h1>还没有图纸</h1><p>先上传图片并生成图纸，结果会显示在这里。</p><a className="cta" href="/create"><ArrowLeft size={18}/>去生成</a></section>; return <section className="result"><div id="exportArea" className="resultMain"><PatternCanvas result={result}/><ColorList stats={result.stats}/></div><aside className="card info"><h2>图纸信息</h2><p>尺寸：{result.width}x{result.height}</p><p>总豆数：{result.totalBeads}</p><p>使用颜色：{result.usedColors}</p><p>色卡：{result.settings.paletteId.toUpperCase()}</p><p>色卡版本：{result.settings.paletteVersion} 色</p><p>拼豆板数量：{boardCount(result.width,result.height,result.settings.boardSize)}</p><p>镜像状态：{result.settings.mirror}</p><ExportButtons result={result} targetId="exportArea"/></aside></section> }
