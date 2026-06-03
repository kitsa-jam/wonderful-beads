import { Wand2 } from 'lucide-react';
import { Button } from '../components/common/Button';
import { SettingsPanel } from '../components/settings/SettingsPanel';
import { ImageUploader } from '../components/upload/ImageUploader';
import { usePatternStore } from '../store/usePatternStore';
import { generatePattern } from '../utils/patternGenerator';

export function CreatePage() {
  const { image, settings, setResult } = usePatternStore();

  async function run() {
    if (!image) {
      alert('请先上传图片');
      return;
    }
    const result = await generatePattern(image, settings);
    setResult(result);
    history.pushState(null, '', '/result');
    dispatchEvent(new Event('wonderful:navigate'));
  }

  return (
    <section className="create">
      <div className="split">
        <ImageUploader />
        <SettingsPanel />
      </div>
      <div className="mobileDock">
        <Button onClick={run}><Wand2 size={20} />生成拼豆图纸</Button>
      </div>
      <Button className="desktopGenerate" onClick={run}><Wand2 size={20} />生成拼豆图纸</Button>
    </section>
  );
}
