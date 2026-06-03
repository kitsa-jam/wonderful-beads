import { HelpCircle, ShieldCheck, Sparkles, Wand2 } from 'lucide-react';
import { clsx } from 'clsx';

export function AppLayout({ page, children }: { page: string; children: React.ReactNode }) {
  const nav = [
    ['/', '首页'],
    ['/create', '生成'],
    ['/help', '教程'],
    ['/privacy', '隐私'],
  ];

  return (
    <>
      <header className="topbar">
        <a className="brand" href="#/">
          <span className="logo"><Sparkles size={22} /></span>
          <span><b>玩豆否</b><small>Wonderful Beads</small></span>
        </a>
        <nav>
          {nav.map(([href, label]) => (
            <a className={clsx(page === href && 'active')} href={`#${href}`} key={href}>{label}</a>
          ))}
        </nav>
      </header>
      <main>{children}</main>
      <footer>
        <span><Wand2 size={16} /> 在线图片转拼豆图纸生成器</span>
        <span><ShieldCheck size={16} /> 图片仅在浏览器本地处理</span>
        <a href="#/help"><HelpCircle size={16} /> 新手教程</a>
      </footer>
    </>
  );
}
