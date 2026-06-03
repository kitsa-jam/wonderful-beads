import { Wand2 } from 'lucide-react';
import { ImageUploader } from '../components/upload/ImageUploader';
import { SettingsPanel } from '../components/settings/SettingsPanel';
import { Button } from '../components/common/Button';
import { usePatternStore } from '../store/usePatternStore';
import { generatePattern } from '../utils/patternGenerator';
export function CreatePage(){ const {image,settings,setResult}=usePatternStore(); async function run(){ if(!image) return alert('请先上传图片'); const result=await generatePattern(image,settings); setResult(result); history.pushState(null,'','/result'); dispatchEvent(new PopStateEvent('popstate')); location.href='/result'; } return <section className="create"><div className="split"><ImageUploader/><SettingsPanel/></div><div className="mobileDock"><Button onClick={run}><Wand2 size={20}/>生成拼豆图纸</Button></div><Button className="desktopGenerate" onClick={run}><Wand2 size={20}/>生成拼豆图纸</Button></section> }
