export const THRESHOLDS = [0,150,400,800,1400,2200];
export const CAPACITY = [3,5,7,10,14,18];
export const WISH_CAPACITY = [2,3,4,5,6,8];
export const levelOf = (xp:number) => THRESHOLDS.filter(t=>xp>=t).length;
export type Source = '得物购入 · 模拟' | '自行登记';
export type GameState = {
 version: 1; guestId: string; created: boolean; nickname: string; shopName: string; style: string; xp: number;
 shelves: (string|null)[]; wishes: string[]; owned: Record<string,Source>; acquired: string[];
 opened: string[]; completed: string[]; activity: Record<string,string[]>; rewards: number[];
 outfits: Record<string,string[]>; board: string[]; boardWeek: string; exhibitions: Record<string,string[]>; exhibitionRewards: string[];
 likes: string[]; visits: string[]; stickers: Record<string,string>; logs: string[]; decoration: string;
 tutorialCompleted: boolean; tutorialStep: number; tutorialPicks: string[];
};
export function fresh():GameState {return { version:1, guestId:`guest-${Math.random().toString(36).slice(2,10)}`, created:false,nickname:'潮流主理人',shopName:'好物发生商店',style:'松弛日常',xp:0,shelves:[],wishes:['p13'],owned:{p01:'得物购入 · 模拟',p07:'自行登记',p19:'得物购入 · 模拟'},acquired:[],opened:[],completed:[],activity:{},rewards:[],outfits:{},board:[],boardWeek:'',exhibitions:{},exhibitionRewards:[],likes:[],visits:[],stickers:{},logs:[],decoration:'绿植',tutorialCompleted:false,tutorialStep:1,tutorialPicks:[]};}
export const dateKey = (d = new Date()) => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
export function shelf(state:GameState,slot:number,id:string|null):GameState { if(slot<0||slot>=CAPACITY[levelOf(state.xp)-1]) return state; const shelves=Array.from({length:CAPACITY[levelOf(state.xp)-1]},(_,i)=>state.shelves[i]||null); if(id&&shelves.includes(id)&&shelves[slot]!==id) return state; shelves[slot]=id; return {...state,shelves}; }
export function wish(state:GameState,id:string):GameState {if(state.wishes.includes(id)||state.owned[id]||state.wishes.length>=WISH_CAPACITY[levelOf(state.xp)-1])return state;return {...state,wishes:[...state.wishes,id]};}
export function own(state:GameState,id:string,source:Source):GameState {return {...state,owned:{...state.owned,[id]:source},wishes:state.wishes.filter(p=>p!==id),acquired:state.wishes.includes(id)?[...new Set([...state.acquired,id])]:state.acquired};}
export const DAYS=['周一','周二','周三','周四','周五','周六','周日'];
export const TASKS=[
 {title:'为本周挑选好物',theme:'周一选品',description:'从商品中选 2–3 件，提交一份表达你品味的选品板。',action:'开始选品',event:'selection'},
 {title:'给小店换个新气象',theme:'周二店铺升级',description:'更换一种空间风格或数字装饰，让小店焕然一新。',action:'去装修店铺',event:'decor'},
 {title:'今日搭配，由你定义',theme:'周三搭配',description:'挑选至少 2 个不同品类的商品，完成一套风格搭配。',action:'创建今日搭配',event:'outfit'},
 {title:'为货架添一份新鲜',theme:'周四上新',description:'在主货架上架或替换一件与原位置不同的商品。',action:'去货架上新',event:'restock'},
 {title:'走进别人的灵感世界',theme:'周五逛店',description:'参观一家模拟买手店，并给喜欢的小店点一个赞。',action:'去逛逛潮店',event:'community'},
 {title:'办一场自己的主题展',theme:'周六主题展',description:'围绕本周主题提交 3 件商品，组成你的迷你主题展。',action:'参加主题展',event:'exhibit'},
 {title:'记录这一周的热爱',theme:'周日经营总结',description:'回看经营数据，选一个关键词，保存你的本周经营总结。',action:'写经营总结',event:'summary'}
];
export function weekday(date:string){return (new Date(date+'T12:00:00').getDay()+6)%7;}
export function shiftDate(date:string,days:number){const d=new Date(date+'T12:00:00');d.setDate(d.getDate()+days);return dateKey(d);}
export function weekKey(date:string){return shiftDate(date,-weekday(date));}
export function record(state:GameState,date:string,event:string):GameState {const events=state.activity[date]||[];return events.includes(event)?state:{...state,activity:{...state.activity,[date]:[...events,event]}};}
export function openShop(state:GameState,date:string):GameState {return state.opened.includes(date)?state:{...state,xp:state.xp+5,opened:[...state.opened,date],logs:[`${date} · 小店开张 +5 EXP`,...state.logs].slice(0,100)};}
export function taskReady(state:GameState,date:string){return (state.activity[date]||[]).includes(TASKS[weekday(date)].event);}
export function completeTask(state:GameState,date:string):GameState {if(!state.opened.includes(date)||!taskReady(state,date)||state.completed.includes(date))return state;return {...state,xp:state.xp+35,completed:[...state.completed,date],logs:[`${date} · ${TASKS[weekday(date)].theme} +35 EXP`,...state.logs].slice(0,100)};}
export function streak(state:GameState,date:string){let n=0;let cursor=state.completed.includes(date)?date:shiftDate(date,-1);while(state.completed.includes(cursor)&&state.opened.includes(cursor)){n++;cursor=shiftDate(cursor,-1)}return n;}
export function bestStreak(state:GameState){return state.completed.reduce((best,date)=>Math.max(best,streak(state,date)),0);}
export const REWARDS=[{days:3,name:'初心主理人徽章',icon:'✳'},{days:7,name:'一周灵感纪念杯',icon:'🏆'},{days:14,name:'热爱不打烊灯牌',icon:'✦'},{days:30,name:'月度买手奖章',icon:'✺'}];
export function claimStreak(state:GameState,days:number):GameState {if(!REWARDS.some(r=>r.days===days)||state.rewards.includes(days)||bestStreak(state)<days)return state;return {...state,rewards:[...state.rewards,days],logs:[`领取 ${days} 天连续经营数字奖励`,...state.logs].slice(0,100)};}
const validProducts=(ids:string[])=>ids.every(id=>/^p(0[1-9]|1[0-9]|2[0-4])$/.test(id))&&new Set(ids).size===ids.length;
export function submitBoard(state:GameState,date:string,ids:string[]):GameState {if(ids.length<2||ids.length>3||!validProducts(ids))return state;return record({...state,board:ids,boardWeek:weekKey(date)},date,'selection');}
export function submitExhibition(state:GameState,date:string,ids:string[]):GameState {if(ids.length!==3||!validProducts(ids))return state;const week=weekKey(date);return record({...state,exhibitions:{...state.exhibitions,[week]:ids}},date,'exhibit');}
export function claimExhibition(state:GameState,date:string):GameState {const week=weekKey(date);if(!state.exhibitions[week]||state.exhibitionRewards.includes(week))return state;return {...state,xp:state.xp+60,exhibitionRewards:[...state.exhibitionRewards,week],logs:[`${date} · 每周主题展奖励 +60 EXP`,...state.logs].slice(0,100)};}
export function visit(state:GameState,date:string,id:string):GameState {let s=record({...state,visits:[...new Set([...state.visits,id])],logs:[`${date} · 参观模拟潮店 ${id}`,...state.logs].slice(0,100)},date,`visit:${id}`);if((s.activity[date]||[]).includes(`like:${id}`))s=record(s,date,'community');return s;}
export function like(state:GameState,date:string,id:string):GameState {if(state.likes.includes(id))return {...state,likes:state.likes.filter(x=>x!==id)};let s=record({...state,likes:[...state.likes,id],logs:[`${date} · 点赞模拟潮店 ${id}`,...state.logs].slice(0,100)},date,`like:${id}`);if((s.activity[date]||[]).includes(`visit:${id}`))s=record(s,date,'community');return s;}
// This helper is only exposed by the isolated demo controls; it is never called for normal saves.
export function simulateDays(state:GameState,date:string,n:number):GameState {
 if(![3,7,14,30].includes(n))return state;
 let s=state;for(let i=n-1;i>=0;i--){const d=shiftDate(date,-i);s=openShop(s,d);s=record(s,d,TASKS[weekday(d)].event);s=completeTask(s,d)}return s;
}
