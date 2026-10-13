import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, Heart, Plus } from 'lucide-react';
import { product } from '@/lib/catalog';
import { CAPACITY, WISH_CAPACITY, type GameState } from '@/lib/game';

const AREA_NAMES = ['主理人精选', '当季新品', '风格实验室', '主题陈列', '高级展厅', '限定收藏'];
const EMPTY_FIXTURES = ['服饰', '球鞋', '包袋'];
const fixtureName = (category: string) => category === '服饰' ? 'rack' : category === '球鞋' ? 'shoe' : category === '包袋' ? 'cabinet' : 'jewelry';

export default function Scene({ state, level, onSlot, onWish, onDecor, isOpen, tutorialStep = 0 }: {
  state: GameState;
  level: number;
  onSlot: (index: number) => void;
  onWish: (id?: string) => void;
  onDecor: () => void;
  isOpen?: boolean;
  tutorialStep?: number;
}) {
  const [area, setArea] = useState(0);
  const capacity = CAPACITY[level - 1];
  const areaCount = Math.ceil(capacity / 3);
  const styleIndex = ['松弛日常', '复古街头', '未来机能'].indexOf(state.style);
  const opened = isOpen ?? state.opened.length > 0;
  const firstSlot = area * 3;
  const visibleSlots = Array.from({ length: Math.min(3, capacity - firstSlot) }, (_, offset) => firstSlot + offset);

  useEffect(() => {
    if (area >= areaCount) setArea(0);
  }, [area, areaCount]);

  return <div className={`scene store25-scene style-${styleIndex} level-${level} ${opened ? 'is-open' : ''}`}>
    <svg className="store25-room" viewBox="0 0 393 526" preserveAspectRatio="none" aria-hidden="true">
      <defs>
        <linearGradient id="backWall" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#f8fbfb"/><stop offset="1" stopColor="#e8eeee"/></linearGradient>
        <linearGradient id="leftWall" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#e1e8e8"/><stop offset="1" stopColor="#f6f8f7"/></linearGradient>
        <linearGradient id="rightWall" x1="1" y1="0" x2="0" y2="1"><stop stopColor="#d8e3e3"/><stop offset="1" stopColor="#f4f7f6"/></linearGradient>
        <linearGradient id="floor" x1="0" y1="0" x2="0" y2="1"><stop stopColor="#d9dedc"/><stop offset="1" stopColor="#bfc8c6"/></linearGradient>
      </defs>
      <polygon points="58,35 335,35 318,310 75,310" fill="url(#backWall)"/>
      <polygon points="0,0 58,35 75,310 0,382" fill="url(#leftWall)"/>
      <polygon points="393,0 335,35 318,310 393,382" fill="url(#rightWall)"/>
      <polygon points="0,382 75,310 318,310 393,382 393,526 0,526" fill="url(#floor)"/>
      <path d="M75 310H318M40 417H353M13 472H380M102 310L74 526M160 310L151 526M233 310L244 526M291 310L320 526" stroke="#8f9e9d" strokeOpacity=".32" strokeWidth="1"/>
      <path d="M58 35L75 310M335 35L318 310" stroke="#a8b4b2" strokeWidth="2"/>
      <path d="M0 382L75 310H318L393 382" fill="none" stroke="#f8ffff" strokeOpacity=".72" strokeWidth="3"/>
    </svg>

    <div className="store25-lighting" aria-hidden="true"><i/><i/><i/></div>
    <div className="store25-status"><span><i />{opened ? 'OPEN · 营业中' : 'READY · 待开张'}</span><span>LV.{level} · {AREA_NAMES[area]}</span></div>

    <div className="store25-sign">
      <small>CURATED BY {state.nickname.toUpperCase()}</small>
      <h2>{state.shopName}</h2>
      <span>MY TREND BUYER SHOP</span>
    </div>

    {level >= 2 && <div className="store25-sign-wing" aria-hidden="true"><i />NEW<br/>PERSPECTIVE</div>}
    {level >= 3 && <div className="store25-feature-wall" aria-hidden="true"><span>STYLE<br/>IN MOTION</span></div>}
    {level >= 4 && <div className="store25-gallery-door" aria-hidden="true"><i/><span>GALLERY 02</span></div>}
    {level >= 5 && <div className="store25-premium-plinth" aria-hidden="true"><i/><span>CURATOR&apos;S OBJECT</span></div>}
    {level >= 6 && <div className="store25-collector-mark" aria-hidden="true"><b>M</b><span>CHIEF BUYER<br/>COLLECTION</span></div>}

    <div className="store25-area-label"><span>{String(area + 1).padStart(2, '0')}</span><b>{AREA_NAMES[area]}</b><small>{firstSlot + 1}—{Math.min(firstSlot + 3, capacity)} / {capacity}</small></div>

    <div className="store25-display-zone">
      {visibleSlots.map((index, bay) => {
        const item = state.shelves[index] ? product(state.shelves[index]!) : null;
        const category = item?.category || EMPTY_FIXTURES[bay];
        const fixture = fixtureName(category);
        const guided = tutorialStep === 2 && !item;
        return <button
          className={`store25-slot store25-bay-${bay} fixture-${fixture} ${item ? 'filled shelf-pop' : 'empty'} ${guided ? 'tutorial-focus' : ''}`}
          key={index}
          onClick={() => onSlot(index)}
          aria-label={`货架 ${index + 1}${item ? `：${item.name}` : '：空位，上架商品'}`}
        >
          <span className="store25-fixture" aria-hidden="true"><i/><i/><i/><i/></span>
          {item ? <span className="store25-product">
            <img src={item.image} alt={item.name}/>
            <em>{state.owned[item.id] ? '我有' : state.wishes.includes(item.id) ? '想要' : '陈列'}</em>
          </span> : <span className="store25-empty"><Plus/><b>陈列 {String(index + 1).padStart(2, '0')}</b></span>}
          <span className="store25-product-name">{item?.name || `${category}陈列位`}</span>
        </button>;
      })}
    </div>

    {areaCount > 1 && <div className="store25-area-switch" aria-label="切换店铺展示区">
      <button onClick={() => setArea((area - 1 + areaCount) % areaCount)} aria-label="上一展示区"><ChevronLeft/></button>
      <div>{Array.from({ length: areaCount }, (_, index) => <button key={index} className={area === index ? 'active' : ''} onClick={() => setArea(index)} aria-label={`查看${AREA_NAMES[index]}`}><i/></button>)}</div>
      <button onClick={() => setArea((area + 1) % areaCount)} aria-label="下一展示区"><ChevronRight/></button>
    </div>}

    <div className="store25-wish-window">
      <button className="store25-window-head" onClick={() => onWish()} aria-label="管理心愿橱窗"><Heart/><b>WISH WINDOW</b><small>{state.wishes.length}/{WISH_CAPACITY[level - 1]}</small></button>
      <span className="store25-window-shelf">
        {state.wishes.slice(0, 2).map((id) => <button key={id} onClick={() => onWish(id)} aria-label={`查看心愿：${product(id).name}`}><img src={product(id).image} alt={product(id).name}/></button>)}
        {state.wishes.length < WISH_CAPACITY[level - 1] && <button onClick={() => onWish()} aria-label="添加心愿商品"><Plus/></button>}
      </span>
    </div>

    <button className="store25-decor" onClick={onDecor} aria-label="更换店铺装饰"><span aria-hidden="true"><i/><i/><i/><i/></span><small>{state.decoration}</small></button>
    <div className="store25-counter" aria-hidden="true"><span>CURATION DESK</span><i/><b>M.</b></div>
  </div>;
}
