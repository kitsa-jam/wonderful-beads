import type { ColorStat } from '../../types/pattern';
export function ColorList({stats}:{stats:ColorStat[]}){ return <section className="card"><h2>颜色清单</h2><div className="colorList">{stats.map(s=><div className="colorRow" key={s.colorId}><i style={{background:s.hex}}/><b>{s.colorId}</b><span>{s.colorName}</span><strong>{s.count} 颗</strong></div>)}</div></section> }
