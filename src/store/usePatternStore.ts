import { create } from 'zustand';
import { defaultSettings, PatternResult, PatternSettings } from '../types/pattern';
type Store = { image?: HTMLImageElement; imageUrl?: string; settings: PatternSettings; result?: PatternResult; setImage:(image:HTMLImageElement,url:string)=>void; setSettings:(p:Partial<PatternSettings>)=>void; setResult:(r:PatternResult)=>void; reset:()=>void };
export const usePatternStore = create<Store>((set)=>({ settings: defaultSettings, setImage:(image,imageUrl)=>set({image,imageUrl,result:undefined}), setSettings:(p)=>set(s=>({settings:{...s.settings,...p}})), setResult:(result)=>set({result}), reset:()=>set({image:undefined,imageUrl:undefined,result:undefined,settings:defaultSettings}) }));
