import { fresh, CAPACITY, WISH_CAPACITY, levelOf, type GameState } from './game.ts';
export type Mode='normal'|'demo';
export const STORAGE_KEYS={normal:'trend-buyer.normal.v1',demo:'trend-buyer.demo.v1',mode:'trend-buyer.mode.v1',day:'trend-buyer.demo-day.v1'};
const productId=(value:unknown):value is string=>typeof value==='string'&&/^p(0[1-9]|1[0-9]|2[0-4])$/.test(value);
const strings=(v:unknown):v is string[]=>Array.isArray(v)&&v.every(x=>typeof x==='string');
const validDate=(value:string)=>/^\d{4}-\d{2}-\d{2}$/.test(value)&&!Number.isNaN(Date.parse(value+'T12:00:00'));
const object=(v:unknown):v is Record<string,unknown>=>typeof v==='object'&&v!==null&&!Array.isArray(v);
export function decode(raw:string):GameState {
 const v:unknown=JSON.parse(raw);if(!object(v)||v.version!==1)throw new Error('不支持的存档格式');
 const base=fresh();
 for(const field of ['guestId','nickname','shopName','style','decoration','boardWeek'] as const)if(typeof v[field]!=='string')throw new Error('存档字段损坏');
 if(typeof v.created!=='boolean'||typeof v.xp!=='number'||!Number.isSafeInteger(v.xp)||v.xp<0)throw new Error('经验数据无效');
 if(!['松弛日常','复古街头','未来机能'].includes(v.style as string))throw new Error('风格数据无效');
 for(const field of ['wishes','acquired','opened','completed','board','exhibitionRewards','likes','visits','logs'] as const)if(!strings(v[field]))throw new Error('列表数据无效');
 if(!Array.isArray(v.shelves)||!v.shelves.every(x=>x===null||productId(x)))throw new Error('货架数据无效');
 for(const field of ['wishes','acquired','board'] as const)if(!(v[field] as string[]).every(productId))throw new Error('商品数据无效');
 if(!object(v.owned)||!Object.entries(v.owned).every(([k,val])=>productId(k)&&['得物购入 · 模拟','自行登记'].includes(val as string)))throw new Error('拥有状态无效');
 for(const field of ['activity','exhibitions'] as const)if(!object(v[field])||!Object.values(v[field]).every(strings))throw new Error('任务数据无效');
 if(!Object.values(v.exhibitions as Record<string,string[]>).every(ids=>ids.every(productId)))throw new Error('主题展数据无效');
 if(!object(v.stickers)||!Object.values(v.stickers).every(x=>typeof x==='string')||!Array.isArray(v.rewards)||!v.rewards.every(x=>[3,7,14,30].includes(x)))throw new Error('奖励数据无效');
 for(const field of ['opened','completed','exhibitionRewards'] as const)if(!(v[field] as string[]).every(validDate))throw new Error('日期数据无效');
 if(v.outfits!==undefined&&(!object(v.outfits)||!Object.values(v.outfits).every(ids=>strings(ids)&&ids.every(productId))))throw new Error('搭配数据无效');
 const s={...base,...v} as GameState;const lv=levelOf(s.xp);
 s.tutorialCompleted=typeof v.tutorialCompleted==='boolean'?v.tutorialCompleted:s.created;
 s.tutorialStep=typeof v.tutorialStep==='number'&&Number.isInteger(v.tutorialStep)&&v.tutorialStep>=1&&v.tutorialStep<=4?v.tutorialStep:(s.tutorialCompleted?4:1);
 s.tutorialPicks=Array.isArray(v.tutorialPicks)&&v.tutorialPicks.every(productId)?[...new Set(v.tutorialPicks)].slice(0,3):[];
 s.shelves=s.shelves.slice(0,CAPACITY[lv-1]).map((id,i,arr)=>id&&arr.indexOf(id)!==i?null:id);
 s.wishes=[...new Set(s.wishes)].filter(id=>!s.owned[id]).slice(0,WISH_CAPACITY[lv-1]);
 s.logs=s.logs.slice(0,100);return s;
}
export function freshDemo():GameState{return {...fresh(),guestId:'demo-curator',created:true,nickname:'体验主理人',shopName:'灵感试营业',shelves:['p01','p07','p19'],logs:['欢迎进入体验模式 · 与正常存档隔离'],tutorialCompleted:true,tutorialStep:4,tutorialPicks:[]};}
export function readSave(storage:Storage,mode:Mode):{state:GameState;warning:string} {
 const fallback=mode==='demo'?freshDemo:fresh;
 try{const raw=storage.getItem(STORAGE_KEYS[mode]);if(!raw)return {state:fallback(),warning:''};try{return {state:decode(raw),warning:''}}catch{storage.setItem(`${STORAGE_KEYS[mode]}.recovery`,raw);return {state:fallback(),warning:'存档格式异常，原始数据已备份到本地 recovery 项，已建立新存档。'}}}catch{return {state:fallback(),warning:'浏览器未开放本地存储，本次进度无法在关闭后保留。'}}
}
