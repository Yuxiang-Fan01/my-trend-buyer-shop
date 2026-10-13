import {
  ArrowRight,
  Award,
  CalendarCheck,
  Check,
  ChevronRight,
  Gift,
  Layers3,
  Sparkles,
  Trophy,
} from 'lucide-react';
import { PRODUCTS } from '@/lib/catalog';
import {
  CAPACITY,
  DAYS,
  REWARDS,
  TASKS,
  THRESHOLDS,
  bestStreak,
  streak,
  taskReady,
  weekday,
  type GameState,
} from '@/lib/game';
import Scene from './Scene';

type Props = {
  state: GameState;
  level: number;
  date: string;
  tutorialStep?: number;
  onSkipTutorial?: () => void;
  onSlot: (index: number) => void;
  onWish: (id?: string) => void;
  onDecor: () => void;
  onOpen: () => void;
  onTask: () => void;
  onClaim: () => void;
  onDaily: () => void;
  onUpgrade: () => void;
  onBrand: () => void;
  onExhibit: () => void;
  onCommunity: () => void;
  onCollection: () => void;
  onDetail: (id: string) => void;
};

export default function ShopHome({
  state,
  level,
  date,
  tutorialStep = 0,
  onSkipTutorial,
  onSlot,
  onWish,
  onDecor,
  onOpen,
  onTask,
  onClaim,
  onDaily,
  onUpgrade,
  onBrand,
  onExhibit,
  onCommunity,
  onCollection,
  onDetail,
}: Props) {
  const next = THRESHOLDS[level];
  const currentFloor = THRESHOLDS[level - 1];
  const progress = next ? ((state.xp - currentFloor) / (next - currentFloor)) * 100 : 100;
  const opened = state.opened.includes(date);
  const ready = taskReady(state, date);
  const completed = state.completed.includes(date);
  const day = weekday(date);
  const task = TASKS[day];
  const collection = PRODUCTS.filter((item) => state.owned[item.id] || state.wishes.includes(item.id)).slice(0, 5);
  const activeTutorial = tutorialStep === 2 || tutorialStep === 3;
  const placedPicks = state.tutorialPicks.filter((id) => state.shelves.includes(id)).length;
  const currentStreak = streak(state, date);
  const nextReward = REWARDS.find((reward) => reward.days > bestStreak(state));

  let actionLabel = '今日开张';
  let action = onOpen;
  let goalState = '未开始';
  if (opened && !ready) { actionLabel = task.action; action = onTask; goalState = '经营中'; }
  if (opened && ready && !completed) { actionLabel = '领取 35 EXP'; action = onClaim; goalState = '待领奖'; }
  if (completed) { actionLabel = '查看今日成果'; action = onDaily; goalState = '已完成'; }

  if (tutorialStep === 3) {
    actionLabel = opened ? '完成开店引导' : '正式开张';
    action = onOpen;
    goalState = '步骤 3/3';
  }

  return (
    <section className={`shop-home store25-home ${opened ? 'is-open' : ''} ${activeTutorial ? 'tutorial-active' : ''}`}>
      <div className="scene-stage store25-stage">
        <Scene state={state} level={level} isOpen={opened} tutorialStep={tutorialStep} onSlot={onSlot} onWish={onWish} onDecor={onDecor}/>

        {!activeTutorial && <>
          <div className="float-menu float-menu-left" aria-label="经营快捷入口">
            <button onClick={onDaily} aria-label="今日任务"><span><CalendarCheck/></span><b>今日任务</b>{!completed && <i/>}</button>
            <button onClick={onBrand} aria-label="品牌选品"><span><Layers3/></span><b>品牌选品</b></button>
          </div>
          <div className="float-menu float-menu-right" aria-label="店铺快捷入口">
            <button onClick={onUpgrade} aria-label="店铺升级"><span><Award/></span><b>成长</b>{next && state.xp >= next - 40 && <i/>}</button>
            <button onClick={onCommunity} aria-label="人气榜和逛店"><span><Trophy/></span><b>逛店</b></button>
          </div>
        </>}

        {tutorialStep === 2 && <div className="tutorial-coach tutorial-coach-scene" role="status">
          <span>步骤 2 / 3</span>
          <h3>布置第一面货架</h3>
          <p>点击发光的空陈列位，把刚选的 3 件好物依次摆出来。</p>
          <div><b>{placedPicks}/3 已上架</b><button onClick={onSkipTutorial}>跳过引导</button></div>
          <i aria-hidden="true"/>
        </div>}
      </div>

      <div className="growth-dock store25-growth">
        <button className="level-orb" onClick={onUpgrade} aria-label={`查看店铺等级 LV.${level}`}><span>LV.</span><b>{level}</b></button>
        <button className="growth-track-wrap" onClick={onUpgrade} aria-label="查看等级成长与下一等级店铺变化">
          <span><b>{state.xp}</b> / {next || 2200} EXP</span>
          <div className="growth-track"><i style={{ width: `${Math.max(2, progress)}%` }}/></div>
          <small>{next ? `再获得 ${next - state.xp} EXP，解锁新货架与空间` : '首席买手店已完整解锁'}</small>
        </button>
        <button className="reward-gift" onClick={onDaily} aria-label="查看连续经营奖励"><Gift/>{state.rewards.length > 0 && <i>{state.rewards.length}</i>}</button>
      </div>

      <section className={`daily-goal-card ${completed ? 'complete' : ''} ${tutorialStep === 3 ? 'tutorial-final' : ''}`}>
        <header>
          <div><span>{tutorialStep === 3 ? 'NEW STORE GUIDE' : 'TODAY’S ONE THING'}</span><h2>{tutorialStep === 3 ? '最后一步：让小店正式亮灯' : `今日任务：${task.theme.slice(2)}`}</h2></div>
          <b>{goalState}</b>
        </header>
        <p>{tutorialStep === 3 ? '你的第一面货架已经布置完成。点击开张，开始今天的经营！' : completed ? `今天获得 40 EXP。明日主题：${DAYS[(day + 1) % 7]} · ${TASKS[(day + 1) % 7].theme.slice(2)}` : task.description}</p>
        <div className="goal-progress">
          <span className={opened ? 'done' : ''}><i>{opened ? <Check/> : '1'}</i>开张</span>
          <em/>
          <span className={ready || completed ? 'done' : ''}><i>{ready || completed ? <Check/> : '2'}</i>完成任务</span>
          <em/>
          <span className={completed ? 'done' : ''}><i>{completed ? <Check/> : '3'}</i>领取奖励</span>
        </div>
        <div className="goal-action-row">
          <div><small>完成奖励</small><b>+35 EXP</b></div>
          <button className={completed ? 'completed' : ''} onClick={action}>{actionLabel}{completed ? <Check/> : <ArrowRight/>}</button>
        </div>
        {completed && <div className="goal-return-note">
          <span><Sparkles/><b>连续经营 {currentStreak} 天</b></span>
          <span>{nextReward ? `再坚持 ${Math.max(0, nextReward.days - bestStreak(state))} 天解锁「${nextReward.name}」` : '连续奖励已全部收藏'}</span>
        </div>}
        {tutorialStep === 3 && <button className="tutorial-skip" onClick={onSkipTutorial}>稍后再说，跳过引导</button>}
      </section>

      {!activeTutorial && <div className="collection-rail">
        <div className="collection-rail-title">
          <div><span>MY COLLECTION</span><b>我的好物</b></div>
          <button onClick={onCollection}>全部 {Object.keys(state.owned).length + state.wishes.length}<ChevronRight/></button>
        </div>
        <div className="collection-scroll">
          {collection.map((item) => <button key={item.id} onClick={() => onDetail(item.id)}><span><img src={item.image} alt={item.name}/></span><b>{item.name}</b><small>{state.owned[item.id] ? '我有' : '想要'}</small></button>)}
          <button className="collection-more" onClick={onCollection}><span><Gift/></span><b>发现好物</b><small>24 件精选</small></button>
        </div>
      </div>}

      {!activeTutorial && <div className="scene-capacity"><button onClick={onExhibit}>本周主题展 <ArrowRight/></button><span>当前陈列 {state.shelves.filter(Boolean).length}/{CAPACITY[level - 1]}</span><span>非官方概念演示 · 所有商品与购买均为模拟</span></div>}
    </section>
  );
}
