'use client';

import { useEffect, useState } from 'react';
import {
  ArrowRight, ArrowUpRight, CalendarDays, Check, ChevronLeft, Compass,
  FlaskConical, Heart, MoreHorizontal, Plus, RotateCcw, ShieldCheck, Sparkles,
  Store, Ticket, UserRound,
} from 'lucide-react';
import { PRODUCTS, STYLES, product } from '@/lib/catalog';
import {
  CAPACITY, DAYS, TASKS, THRESHOLDS, WISH_CAPACITY, claimExhibition,
  claimStreak, completeTask, dateKey, fresh, levelOf, like, openShop, own,
  record, shelf, shiftDate, simulateDays, submitBoard, submitExhibition,
  visit, weekKey, weekday, wish, type GameState,
} from '@/lib/game';
import { SHOPS, STICKERS } from '@/lib/community';
import { freshDemo, readSave, STORAGE_KEYS, type Mode } from '@/lib/storage';
import Activities from './Activities';
import Community from './Community';
import Daily from './Daily';
import Modal from './Modal';
import Scene from './Scene';
import ShopHome from './ShopHome';
import Toast from './Toast';

const NAV = [
  { label: '我的店铺', icon: Store },
  { label: '今日经营', icon: CalendarDays },
  { label: '逛逛潮店', icon: Compass },
  { label: '活动', icon: Ticket },
  { label: '我的', icon: UserRound },
];

const openedMessage = (alreadyOpen: boolean, tutorial: boolean) => tutorial
  ? (alreadyOpen ? '引导完成，继续经营你的买手店吧' : '新店正式开张！+5 EXP，灯光与营业招牌已点亮')
  : (alreadyOpen ? '今天已经开张，继续完成经营目标吧' : '今日开张 +5 EXP，店铺灯光已点亮');

export default function Game() {
  const [state, setState] = useState<GameState | null>(null);
  const [mode, setMode] = useState<Mode>('normal');
  const [demoDay, setDemoDay] = useState(0);
  const [today, setToday] = useState(dateKey());
  const [storageWarning, setStorageWarning] = useState('');
  const [previewLevel, setPreviewLevel] = useState(1);
  const [tab, setTab] = useState(0);
  const [toast, setToast] = useState('');
  const [modal, setModal] = useState<string | null>(null);
  const [slot, setSlot] = useState<number | null>(null);
  const [detail, setDetail] = useState<string | null>(null);
  const [visiting, setVisiting] = useState<string | null>(null);
  const [brandTag, setBrandTag] = useState('松弛日常');
  const [brandPicks, setBrandPicks] = useState<string[]>([]);
  const [celebrate, setCelebrate] = useState<string | null>(null);
  const [taskPicks, setTaskPicks] = useState<string[]>([]);
  const [summary, setSummary] = useState('发现自己的风格');
  const [source, setSource] = useState('全部');
  const [category, setCategory] = useState('全部');
  const [selection, setSelection] = useState(['p01', 'p07', 'p19']);
  const [step, setStep] = useState(0);
  const [replayStep, setReplayStep] = useState<number | null>(null);

  useEffect(() => {
    try {
      const activeMode: Mode = localStorage.getItem(STORAGE_KEYS.mode) === 'demo' ? 'demo' : 'normal';
      const loaded = readSave(localStorage, activeMode);
      setMode(activeMode);
      setState(loaded.state);
      setStorageWarning(loaded.warning);
      const day = Number(localStorage.getItem(STORAGE_KEYS.day));
      setDemoDay(Number.isInteger(day) && day >= 0 && day <= 6 ? day : 0);
    } catch {
      setState(fresh());
      setStorageWarning('浏览器未开放本地存储，本次进度无法在关闭后保留。');
    }
  }, []);

  useEffect(() => {
    if (!state) return;
    try {
      localStorage.setItem(STORAGE_KEYS[mode], JSON.stringify(state));
      localStorage.setItem(STORAGE_KEYS.mode, mode);
      localStorage.setItem(STORAGE_KEYS.day, String(demoDay));
    } catch {
      setStorageWarning('存档保存失败：浏览器存储不可用或空间不足，请保持页面打开。');
    }
  }, [state, mode, demoDay]);

  useEffect(() => {
    const refresh = () => setToday(dateKey());
    const timer = setInterval(refresh, 30000);
    window.addEventListener('focus', refresh);
    return () => { clearInterval(timer); window.removeEventListener('focus', refresh); };
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(''), 3500);
    return () => clearTimeout(timer);
  }, [toast]);

  if (!state) return <div className="loading"><span className="loading-mark">M</span><p>正在打开你的买手店…</p></div>;

  const date = mode === 'demo' ? shiftDate('2026-10-12', demoDay) : today;
  const level = levelOf(state.xp);
  const next = THRESHOLDS[level];
  const xpProgress = next ? Math.max(2, ((state.xp - THRESHOLDS[level - 1]) / (next - THRESHOLDS[level - 1])) * 100) : 100;
  const tutorialStep = replayStep || (!state.tutorialCompleted ? state.tutorialStep : 0);

  const update = (value: GameState, message?: string) => {
    setState(value);
    if (levelOf(value.xp) > levelOf(state.xp)) setCelebrate(`升级啦！LV.${levelOf(value.xp)}`);
    if (message) setToast(message);
  };
  const identity = (id: string) => state.owned[id] || (state.wishes.includes(id) ? '想要' : '推荐商品');
  const close = () => { setModal(null); setSlot(null); setDetail(null); };
  const switchMode = (target: Mode) => {
    try {
      localStorage.setItem(STORAGE_KEYS[mode], JSON.stringify(state));
      const loaded = readSave(localStorage, target);
      setState(loaded.state);
      setStorageWarning(loaded.warning);
      setMode(target);
      setTab(0);
      setModal(null);
      setDetail(null);
      setVisiting(null);
      setTaskPicks([]);
      setBrandPicks([]);
      setReplayStep(null);
      setToast(target === 'demo' ? '已进入独立体验空间，正常进度不会改变' : '已返回你的正常存档');
    } catch {
      setStorageWarning('无法切换模式：请允许浏览器使用 localStorage。');
    }
  };
  const choose = (id: string) => {
    if (slot === null) { setDetail(id); return; }
    if (state.shelves.includes(id) && state.shelves[slot] !== id) { setToast('这件商品已在主货架上'); return; }
    let value = record(shelf(state, slot, id), date, state.shelves[slot] !== id ? 'restock' : 'noop');
    if (!state.tutorialCompleted && state.tutorialStep === 2) {
      const finished = state.tutorialPicks.every((pick) => value.shelves.includes(pick));
      value = { ...value, tutorialStep: finished ? 3 : 2 };
      update(value, finished ? '第一面货架布置完成，下一步：正式开张' : `上架成功 · ${value.shelves.filter((item) => state.tutorialPicks.includes(item || '')).length}/3`);
    } else update(value, '上架成功，商品已进入对应陈列家具');
    close();
  };
  const catalog = (onPick: (id: string) => void, selected: string[] = []) => <>
    <div className="filters">{['全部', '我有', '想要', '推荐商品'].map((item) => <button className={source === item ? 'selected' : ''} onClick={() => setSource(item)} key={item}>{item}</button>)}</div>
    <div className="categories">{['全部', '服饰', '球鞋', '包袋', '饰品'].map((item) => <button className={category === item ? 'active' : ''} onClick={() => setCategory(item)} key={item}>{item}</button>)}</div>
    <div className="product-grid">{PRODUCTS.filter((item) => (category === '全部' || item.category === category) && (source === '全部' || source === '我有' && !!state.owned[item.id] || source === '想要' && state.wishes.includes(item.id) || source === '推荐商品' && !state.owned[item.id] && !state.wishes.includes(item.id))).map((item) => <button className={`product-card ${selected.includes(item.id) ? 'picked' : ''}`} key={item.id} onClick={() => onPick(item.id)}>
      <div className="product-photo"><span>{identity(item.id)}</span><img src={item.image} alt={item.name} /><i>{selected.includes(item.id) ? <Check /> : <Plus />}</i></div>
      <small>{item.brand}</small><b>{item.name}</b><div className="product-meta"><span>{item.style}</span><span>¥{item.price}</span></div>
    </button>)}</div>
  </>;

  const openToday = () => {
    let value = openShop(state, date);
    if (!state.tutorialCompleted && state.tutorialStep === 3) value = { ...value, tutorialCompleted: true, tutorialStep: 4, tutorialPicks: [] };
    if (replayStep === 3) setReplayStep(null);
    update(value, openedMessage(state.opened.includes(date), replayStep === 3 || state.tutorialStep === 3));
  };
  const skipTutorial = () => {
    if (replayStep) { setReplayStep(null); setToast('已退出引导，店铺数据没有改变'); return; }
    update({ ...state, tutorialCompleted: true, tutorialStep: 4, tutorialPicks: [] }, '已跳过引导，可随时从右上角设置重新体验');
  };
  const openTask = () => {
    setTaskPicks(weekday(date) === 2 ? state.outfits[date] || [] : []);
    const day = weekday(date);
    if (day === 1) setModal('装修店铺');
    else if (day === 3) { setTab(0); setToast('点击任意货架，替换或上架一件商品即可完成上新'); }
    else if (day === 4) setTab(2);
    else if (day === 5) setTab(3);
    else setModal(day === 0 ? '本周选品' : day === 2 ? '今日搭配' : '经营总结');
  };

  return <div className="desktop-game-stage"><div className={`app-shell ${tutorialStep === 2 || tutorialStep === 3 ? 'app-tutorial-active' : ''}`}>
    <header className="topbar">
      <button className="topbar-icon" onClick={() => tab === 0 ? setToast('已在我的店铺') : setTab(0)} aria-label="返回我的店铺"><ChevronLeft /></button>
      <div className="topbar-title"><b>我的潮流买手店</b><span>{mode === 'demo' ? 'DEMO MODE · 独立体验存档' : 'MY TREND BUYER SHOP'}</span></div>
      <div className="topbar-level"><b>LV.{level}</b><span><i style={{ width: `${xpProgress}%` }} /></span><small>{state.xp} EXP</small></div>
      <button className="topbar-icon" onClick={() => setModal('体验模式')} aria-label="体验模式与更多设置"><MoreHorizontal /></button>
    </header>

    {mode === 'demo' && <div className="demo-banner"><span><FlaskConical />体验模式 · {DAYS[demoDay]}</span><div><button onClick={() => setModal('体验模式')}>切换体验</button><button onClick={() => switchMode('normal')}>返回正常店铺</button></div></div>}

    <main className={`main-shell tab-${tab}`}>
      {storageWarning && <div className="storage-warning" role="alert">{storageWarning}</div>}
      {tab === 0 && <ShopHome state={state} level={level} date={date} tutorialStep={tutorialStep} onSkipTutorial={skipTutorial} onSlot={(index) => { if (replayStep === 2) setReplayStep(3); setSlot(index); setModal(!state.tutorialCompleted && state.tutorialStep === 2 ? '布置第一面货架' : '挑选上架商品'); }} onWish={(id) => id ? setDetail(id) : setModal('挑选心愿商品')} onDecor={() => setModal('装修店铺')} onOpen={openToday} onTask={openTask} onClaim={() => update(completeTask(state, date), '今日经营完成 +35 EXP，成长进度已更新')} onDaily={() => setTab(1)} onUpgrade={() => { setPreviewLevel(level); setModal('店铺升级'); }} onBrand={() => setTab(3)} onExhibit={() => setTab(3)} onCommunity={() => setTab(2)} onCollection={() => setModal('好物档案')} onDetail={setDetail} />}
      {tab > 0 && <div className="subpage-heading"><div><span>{['', 'DAILY ROUTINE', 'INSPIRATION BLOCK', 'TREND EVENTS', 'MY PROFILE'][tab]}</span><h1>{['', '今日经营', '逛逛潮店', '潮流活动', '我的档案'][tab]}</h1></div>{tab === 1 && <button className="subpage-status" onClick={() => { if (!state.opened.includes(date)) openToday(); }}>{state.opened.includes(date) ? '今日已开张' : '今日开张 +5'}</button>}</div>}
      {tab === 1 && <Daily state={state} date={date} onOpen={openToday} onClaim={() => update(completeTask(state, date), '经营任务完成 +35 EXP')} onTask={openTask} onReward={(days) => { update(claimStreak(state, days), '数字奖励领取成功'); setCelebrate(`连续 ${days} 天！热爱值得纪念`); }} />}
      {tab === 2 && <Community state={state} onVisit={(id) => { update(visit(state, date, id)); setVisiting(id); }} onLike={(id) => update(like(state, date, id), state.likes.includes(id) ? '已取消点赞' : '点赞已保存，仅你可见')} />}
      {tab === 3 && <Activities state={state} date={date} tag={brandTag} setTag={setBrandTag} picks={brandPicks} setPicks={setBrandPicks} onSubmit={() => update(submitBoard(state, date, brandPicks), '选品板已完成！点击板上的商品可加入想要或货架')} onDetail={setDetail} onExhibit={() => { setTaskPicks(state.exhibitions[weekKey(date)] || []); setModal('策划主题展'); }} onClaim={() => { update(claimExhibition(state, date), '主题展奖励 +60 EXP'); setCelebrate('主题展完成！+60 EXP'); }} />}
      {tab === 4 && <section className="panel profile-panel">
        <div className="profile-hero"><span>{state.nickname.slice(0, 1)}</span><div><h2>{state.nickname}</h2><p>{state.shopName} · LV.{level} 主理人</p></div><ShieldCheck /></div>
        <p className="muted">游客编号：{state.guestId} · 仅保存在当前浏览器</p>
        <div className="stats-grid"><div><b>{Object.keys(state.owned).length}</b>拥有好物</div><div><b>{state.acquired.length}</b>心愿已入手</div><div><b>{state.xp}</b>经营经验</div></div>
        <div className="profile-actions"><button className="button" onClick={() => setModal('好物档案')}>管理我的商品</button><button className="button" onClick={() => setModal('体验模式')}><FlaskConical />体验模式</button><button className="button danger" onClick={() => setModal('重置 Demo')}><RotateCcw />重置 Demo</button></div>
        <h3 className="log-title">我的经营足迹</h3><div className="log-list">{state.logs.length ? state.logs.slice(0, 20).map((log, index) => <p key={index}>{log}</p>) : <p>你的第一个故事，从今日开张开始。</p>}</div>
      </section>}
      <footer>非官方概念演示，仅用于产品设计交流 · 所有商品、购买与合作均为模拟</footer>
    </main>

    <nav className="bottom-nav">{NAV.map((item, index) => <button key={item.label} className={tab === index ? 'active' : ''} onClick={() => setTab(index)}><span><item.icon />{index === 1 && !state.completed.includes(date) && <i />}</span><small>{item.label}</small></button>)}</nav>

    {!state.created && <Modal title={step === 0 ? '你好，未来的主理人。' : '步骤 1 · 挑选 3 件好物'} onClose={() => {}} wide dismissible={false}>
      <div className="onboarding-step"><span className={step === 0 ? 'active' : ''}>建立身份</span><i/><span className={step === 1 ? 'active' : ''}>1 选品</span><i/><span>2 布置</span><i/><span>3 开张</span></div>
      {step === 0 ? <>
        <div className="tutorial-intro"><span>YOUR FIRST BUYER STORE</span><h3>经营一家属于你的潮流买手店</h3><p>每天完成一件经营目标，积累经验，解锁更大的空间和新陈列家具。</p></div>
        <div className="form-grid"><label>你的昵称<input maxLength={12} value={state.nickname} onChange={(event) => setState({ ...state, nickname: event.target.value })}/></label><label>店铺名称<input maxLength={16} value={state.shopName} onChange={(event) => setState({ ...state, shopName: event.target.value })}/></label></div>
        <p className="form-label">选择你的空间风格</p><div className="style-options">{STYLES.map((item, index) => <button className={state.style === item ? 'chosen' : ''} key={item} onClick={() => setState({ ...state, style: item })}><div className={`swatch swatch-${index}`}><i/><i/><i/></div><b>{item}</b><small>{['冰蓝轻氧 · 清爽日常', '蓝橙撞色 · 街头灵感', '银蓝材质 · 未来实验'][index]}</small>{state.style === item && <Check/>}</button>)}</div>
        <button className="button dark full" disabled={!state.nickname.trim() || !state.shopName.trim()} onClick={() => setStep(1)}>开始 3 步开店任务 <ArrowRight/></button>
        <button className="tutorial-skip full" onClick={() => update({ ...state, created: true, shelves: selection, nickname: state.nickname.trim(), shopName: state.shopName.trim(), tutorialCompleted: true, tutorialStep: 4 }, '已使用默认陈列创建店铺')}>跳过引导，直接进入小店</button>
      </> : <>
        <div className="tutorial-intro compact"><span>STEP 1 / 3</span><h3>欢迎成为潮流买手！</h3><p>先挑 3 件喜欢的好物，打造你的第一家店。我有、想要和推荐商品都可以选择，不需要真实购买。</p></div>
        {catalog((id) => setSelection((value) => value.includes(id) ? value.filter((item) => item !== id) : value.length < 3 ? [...value, id] : value), selection)}
        <div className="sticky-actions"><button className="button" onClick={() => setStep(0)}>上一步</button><button className="button dark" disabled={selection.length !== 3} onClick={() => update({ ...state, created: true, shelves: [], tutorialPicks: selection, tutorialStep: 2, tutorialCompleted: false, nickname: state.nickname.trim(), shopName: state.shopName.trim() }, '选好啦！点击发光的空货架，把好物摆出来。')}>选好了，去布置 · {selection.length}/3 <ArrowRight/></button></div>
      </>}
    </Modal>}

    {modal && <Modal title={modal} onClose={close} wide={['好物档案', '挑选上架商品', '挑选心愿商品', '布置第一面货架', '本周选品', '今日搭配', '策划主题展', '等级外观预览', '店铺升级'].includes(modal)}>
      {['好物档案', '挑选上架商品', '挑选心愿商品'].includes(modal) && <>{slot !== null && state.shelves[slot] && <button className="button danger" onClick={() => { update(shelf(state, slot, null), '商品已下架'); close(); }}>下架当前商品</button>}{catalog(choose)}</>}
      {modal === '布置第一面货架' && <><div className="tutorial-sheet-note"><b>把选好的商品放进发光陈列位</b><span>根据商品品类，场景会自动匹配挂架、鞋台、展示柜或饰品台座。</span></div><div className="product-grid tutorial-products">{state.tutorialPicks.map((id) => { const item = product(id); const placed = state.shelves.includes(id); return <button className={`product-card ${placed ? 'picked' : ''}`} disabled={placed} key={id} onClick={() => choose(id)}><div className="product-photo"><span>{identity(id)}</span><img src={item.image} alt={item.name}/><i>{placed ? <Check/> : <Plus/>}</i></div><small>{item.category} · {item.brand}</small><b>{item.name}</b><div className="product-meta"><span>{placed ? '已上架' : '点击摆放'}</span><span>{item.style}</span></div></button>; })}</div></>}
      {modal === '装修店铺' && <><p className="muted">切换空间材质与数字装饰，变化会实时出现在店铺场景。</p><div className="style-options">{STYLES.map((item, index) => <button className={state.style === item ? 'chosen' : ''} key={item} onClick={() => update(state.style !== item ? record({ ...state, style: item }, date, 'decor') : state, '店铺风格已更新')}><div className={`swatch swatch-${index}`}><i /><i /><i /></div><b>{item}</b></button>)}</div><div className="decoration-options">{['绿植', ...(level >= 2 ? ['唱片'] : []), ...(level >= 3 ? ['霓虹星'] : []), ...(state.rewards.includes(3) ? ['初心徽章'] : []), ...(state.rewards.includes(7) ? ['纪念奖杯'] : []), ...(state.rewards.includes(14) ? ['热爱灯牌'] : []), ...(state.rewards.includes(30) ? ['买手奖章'] : [])].map((item) => <button className={`button ${state.decoration === item ? 'dark' : ''}`} onClick={() => update(state.decoration !== item ? record({ ...state, decoration: item }, date, 'decor') : state, '数字装饰已更换')} key={item}>{item}</button>)}</div><p className="muted">LV2 解锁唱片 · LV3 解锁霓虹星 · 连续奖励解锁纪念装饰</p></>}
      {modal === '重置 Demo' && <><p>这会清除当前{mode === 'demo' ? '体验' : '正常'}存档的小店进度、商品与奖励。另一份存档不受影响。</p><button className="button danger full" onClick={() => { setState(fresh()); setStep(0); setSelection(['p01', 'p07', 'p19']); close(); setTab(0); }}>确认清空并重新建店</button></>}
      {['本周选品', '今日搭配'].includes(modal) && <><p className="muted">{modal === '今日搭配' ? '选择 2–3 件不同品类的商品，完成一套穿搭。' : '选择 2–3 件商品，选品板不占用主货架。'}</p>{catalog((id) => setTaskPicks((value) => value.includes(id) ? value.filter((item) => item !== id) : value.length < 3 ? [...value, id] : value), taskPicks)}<button className="button dark full" disabled={taskPicks.length < 2 || (modal === '今日搭配' && new Set(taskPicks.map((id) => product(id).category)).size < 2)} onClick={() => { update(modal === '本周选品' ? submitBoard(state, date, taskPicks) : record({ ...state, outfits: { ...state.outfits, [date]: taskPicks } }, date, 'outfit'), '已保存，返回今日经营领取奖励'); close(); }}>提交{modal} · {taskPicks.length}/3</button></>}
      {modal === '策划主题展' && <><p className="muted">挑选 3 件好物组成主题展。至少 2 件符合本周主题：{STYLES[Math.floor(new Date(weekKey(date) + 'T12:00:00').getTime() / 604800000) % 3]}。</p>{catalog((id) => setTaskPicks((value) => value.includes(id) ? value.filter((item) => item !== id) : value.length < 3 ? [...value, id] : value), taskPicks)}<button className="button dark full" disabled={taskPicks.length !== 3 || taskPicks.filter((id) => product(id).style === STYLES[Math.floor(new Date(weekKey(date) + 'T12:00:00').getTime() / 604800000) % 3]).length < 2} onClick={() => { update(submitExhibition(state, date, taskPicks), '主题展已保存，可在活动页领取本周奖励'); close(); }}>发布我的模拟主题展 · {taskPicks.length}/3</button></>}
      {modal === '经营总结' && <><div className="stats-grid"><div><b>{state.opened.length}</b>累计开张</div><div><b>{state.completed.length}</b>有效经营</div><div><b>{state.xp}</b>累计经验</div></div><p>用一个关键词，记录你的小店成长。</p><div className="decoration-options">{['发现自己的风格', '心愿慢慢实现', '遇见更多灵感'].map((item) => <button className={`button ${summary === item ? 'dark' : ''}`} onClick={() => setSummary(item)} key={item}>{item}</button>)}</div><button className="button dark full" onClick={() => { update(record({ ...state, logs: [`${date} · 本周总结：${summary}`, ...state.logs].slice(0, 100) }, date, 'summary'), '经营总结已保存'); close(); }}>保存经营总结</button></>}
      {modal === '体验模式' && <><p className="muted">用几分钟体验完整成长旅程。体验数据单独保存，不会覆盖你的正常小店。</p><button className="button full" onClick={() => { setReplayStep(2); setTab(0); close(); setToast('引导重播已开始，不会清空或覆盖现有店铺'); }}><Sparkles/>重新体验新手引导</button>{mode === 'normal' ? <button className="button dark full" onClick={() => switchMode('demo')}><FlaskConical />进入独立体验模式</button> : <><p className="form-label">01 / 切换经营日</p><div className="demo-days">{DAYS.map((day, index) => <button className={`button ${demoDay === index ? 'dark' : ''}`} key={day} onClick={() => { setDemoDay(index); setTab(1); close(); setToast(`已切换到${day}，完成操作后领取经营奖励`); }}>{day}<small>{TASKS[index].theme.slice(2)}</small></button>)}</div><p className="form-label">02 / 六级空间预览</p><div className="level-buttons">{THRESHOLDS.map((xp, index) => <button className="button" key={xp} onClick={() => { setPreviewLevel(index + 1); setModal('等级外观预览'); }}>LV.{index + 1}</button>)}</div><p className="form-label">03 / 连续经营奖励演示</p><div className="decoration-options">{[3, 7, 14, 30].map((days) => <button className="button" key={days} onClick={() => { update(simulateDays(state, date, days), `已模拟 ${days} 天有效经营，请领取解锁的数字奖励`); setTab(1); close(); }}>{days} 天</button>)}</div><button className="button" onClick={() => setCelebrate(`升级动画预览 · LV.${Math.min(6, level + 1)}`)}>播放升级动画</button><div className="demo-footer"><button className="button dark" onClick={() => switchMode('normal')}>返回正常店铺</button><button className="button danger" onClick={() => setModal('恢复体验数据')}><RotateCcw />恢复初始体验数据</button></div></>}</>}
      {['等级外观预览', '店铺升级'].includes(modal) && <><div className="upgrade-summary"><span>LV.{modal === '店铺升级' ? level : previewLevel}</span><div><b>{modal === '店铺升级' ? state.xp : THRESHOLDS[previewLevel - 1]} EXP</b><small>{modal === '店铺升级' && next ? `距离 LV.${level + 1} 还需 ${next - state.xp}` : `${CAPACITY[previewLevel - 1]} 个陈列位 · ${WISH_CAPACITY[previewLevel - 1]} 个心愿位`}</small></div></div><div className="level-buttons">{THRESHOLDS.map((xp, index) => <button className={`button ${previewLevel === index + 1 ? 'dark' : ''}`} key={xp} onClick={() => setPreviewLevel(index + 1)}>LV.{index + 1}</button>)}</div><Scene state={{ ...state, decoration: previewLevel >= 3 ? '霓虹星' : previewLevel >= 2 ? '唱片' : '绿植', shelves: PRODUCTS.slice(0, CAPACITY[previewLevel - 1]).map((item) => item.id), wishes: PRODUCTS.slice(-WISH_CAPACITY[previewLevel - 1]).map((item) => item.id) }} level={previewLevel} onSlot={() => setToast('外观预览，返回小店即可编辑陈列')} onWish={() => setToast('外观预览，不改变现有心愿')} onDecor={() => setToast('装饰随等级解锁')} /><button className="button dark full" onClick={() => setCelebrate(`升级动画预览 · LV.${previewLevel}`)}>播放此等级升级动画</button></>}
      {modal === '恢复体验数据' && <><p className="muted">只重置体验空间的等级、日期、任务和奖励。你的正常小店保持原样。</p><button className="button danger full" onClick={() => { if (mode !== 'demo') return; setState(freshDemo()); setDemoDay(0); setBrandPicks([]); setTaskPicks([]); setTab(0); close(); setToast('体验空间已恢复初始状态'); }}>确认恢复初始体验数据</button></>}
    </Modal>}

    {visiting && <Modal title={SHOPS.find((item) => item.id === visiting)!.name} onClose={() => setVisiting(null)} wide><p className="muted visit-note">预置模拟买手店 · 互动仅保存在你的浏览器</p><Scene state={{ ...fresh(), created: true, shopName: SHOPS.find((item) => item.id === visiting)!.name, style: SHOPS.find((item) => item.id === visiting)!.style, shelves: SHOPS.find((item) => item.id === visiting)!.products }} level={SHOPS.find((item) => item.id === visiting)!.level} onSlot={(index) => { const id = SHOPS.find((item) => item.id === visiting)!.products[index]; if (id) setDetail(id); else setToast('模拟店铺的空位尚未陈列'); }} onWish={(id) => id ? setDetail(id) : setToast('这是模拟店铺的橱窗')} onDecor={() => setToast('这间店使用预置数字装饰')} /><div className="detail-actions"><button className={`button ${state.likes.includes(visiting) ? 'lime' : ''}`} onClick={() => update(like(state, date, visiting), state.likes.includes(visiting) ? '已取消点赞' : '已点赞这间模拟潮店')}><Heart />{state.likes.includes(visiting) ? '已点赞' : '喜欢这间店'}</button></div><p className="form-label">留下一个灵感贴纸</p><div className="sticker-options">{STICKERS.map((item) => <button className={`button ${state.stickers[visiting] === item ? 'lime' : ''}`} key={item} onClick={() => update({ ...state, stickers: { ...state.stickers, [visiting]: item }, logs: [`${date} · 给 ${visiting} 留下贴纸：${item}`, ...state.logs].slice(0, 100) }, '留言贴纸已保存在本地')}>{item}</button>)}</div>{state.stickers[visiting] && <p className="acquired">我的留言：{state.stickers[visiting]}（本地记录）</p>}</Modal>}

    {detail && <Modal title="好物详情" onClose={() => setDetail(null)}><div className="detail-photo"><img src={product(detail).image} alt={product(detail).name} /><span>{identity(detail)}</span></div><p className="eyebrow">{product(detail).brand} / {product(detail).category}</p><h2>{product(detail).name}</h2><p className="muted">{product(detail).style} · 原创示意商品 · 展示价 ¥{product(detail).price}</p>{state.acquired.includes(detail) && <p className="acquired"><Check />心愿达成 · 已入手，热爱有了回响。</p>}<div className="detail-actions">{!state.owned[detail] && <><button className="button dark" onClick={() => update(own(state, detail, '得物购入 · 模拟'), '模拟购入成功！已加入「我有」，没有发生真实支付。')}>模拟得物购买</button><button className="button" onClick={() => update(own(state, detail, '自行登记'), '已登记拥有，商品身份已更新')}>登记为我有</button><button className="button" disabled={state.wishes.includes(detail)} onClick={() => { if (state.wishes.length >= WISH_CAPACITY[level - 1]) { setToast('心愿橱窗已满，升级或移除心愿后再添加'); return; } update(wish(state, detail), '已加入心愿橱窗'); }}><Heart />{state.wishes.includes(detail) ? '已加入想要' : '加入想要'}</button></>}{state.wishes.includes(detail) && <button className="button" onClick={() => update({ ...state, wishes: state.wishes.filter((id) => id !== detail) }, '已移出心愿橱窗')}>移除心愿</button>}<button className="button" onClick={() => { const index = Array.from({ length: CAPACITY[level - 1] }, (_, item) => item).find((item) => !state.shelves[item]); if (state.shelves.includes(detail)) { setToast('已在货架上'); return; } if (index === undefined) { setToast('主货架已满，请点击陈列位替换商品'); return; } update(record(shelf(state, index, detail), date, 'restock'), '已陈列到主货架'); setDetail(null); }}>上架到主货架 <ArrowUpRight /></button></div><p className="fine-print">纯模拟体验，不跳转交易，不产生订单或扣款。</p></Modal>}

    {celebrate && <Modal title="小店的闪光时刻" onClose={() => setCelebrate(null)}><div className="celebration"><span><i /><i /><i /></span><p className="eyebrow">GROW INTO YOUR OWN</p><h2>{celebrate}</h2><p>新的空间，装下更多热爱。</p><button className="button dark full" onClick={() => { setCelebrate(null); setTab(0); }}>去看看我的小店 <ArrowRight /></button></div></Modal>}
    {toast && <Toast message={toast} />}
  </div></div>;
}
