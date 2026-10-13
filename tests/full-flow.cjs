const {chromium}=require('playwright');
const fs=require('node:fs');
fs.mkdirSync('test-results',{recursive:true});
(async()=>{
 const browser=await chromium.launch({...(process.env.CHROME_EXECUTABLE?{executablePath:process.env.CHROME_EXECUTABLE}:{}),headless:true});
 const page=await browser.newPage({viewport:{width:390,height:844}});const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(process.env.BASE_URL||'http://127.0.0.1:3000');await page.getByRole('button',{name:'跳过引导，直接进入小店'}).click();
 await page.locator('.topbar').getByRole('button',{name:'体验模式与更多设置'}).click();await page.getByRole('button',{name:'进入独立体验模式'}).click();
 const navigate=async name=>page.locator('.bottom-nav').getByRole('button',{name,exact:true}).click();
 const dayNames=['周一 选品','周二 店铺升级','周三 搭配','周四 上新','周五 逛店','周六 主题展','周日 经营总结'];
 const choose=async name=>page.locator('dialog .product-card').filter({hasText:name}).click();
 async function closeCelebration(){const m=page.getByRole('dialog',{name:'小店的闪光时刻'});if(await m.isVisible())await m.getByRole('button',{name:'关闭弹窗'}).click();}
 for(let day=0;day<7;day++){
  await page.getByRole('button',{name:'切换体验',exact:true}).click();await page.getByRole('button',{name:dayNames[day],exact:true}).click();
  await page.locator('.open-card').getByRole('button',{name:'今日开张 +5',exact:true}).click();await closeCelebration();
  if(day===0){await page.getByRole('button',{name:'开始选品'}).click();await choose('雾绿城市夹克');await choose('云朵复古跑鞋');await page.getByRole('button',{name:'提交本周选品 · 2/3'}).click();}
  if(day===1){await page.getByRole('button',{name:'去装修店铺'}).click();await page.getByRole('button',{name:'复古街头',exact:true}).click();await page.getByRole('button',{name:'关闭弹窗'}).click();}
  if(day===2){await page.getByRole('button',{name:'创建今日搭配'}).click();await choose('雾绿城市夹克');await choose('云朵复古跑鞋');await page.getByRole('button',{name:'提交今日搭配 · 2/3'}).click();}
  if(day===3){await page.getByRole('button',{name:'去货架上新'}).click();await page.getByRole('button',{name:'货架 1：雾绿城市夹克'}).click();await choose('奶油学院卫衣');await navigate('今日经营');}
  if(day===4){await page.getByRole('button',{name:'去逛逛潮店'}).click();await page.getByRole('button',{name:'参观 慢半拍 SELECT'}).click();await page.getByRole('button',{name:'喜欢这间店'}).click();await page.getByRole('button',{name:'今日灵感 +1',exact:true}).click();await page.getByRole('button',{name:'关闭弹窗'}).click();await navigate('今日经营');}
  if(day===5){await page.getByRole('button',{name:'参加主题展'}).click();await page.getByRole('button',{name:'策划我的主题展'}).click();const text=await page.locator('dialog .muted').textContent();const names=text.includes('松弛日常')?['雾绿城市夹克','砂岩工装外套','云朵复古跑鞋']:text.includes('复古街头')?['奶油学院卫衣','莓果针织开衫','抹茶低帮板鞋']:['午夜廓形衬衫','冰蓝运动短袖','银翼机能跑鞋'];for(const name of names)await choose(name);await page.getByRole('button',{name:'发布我的模拟主题展 · 3/3'}).click();await page.getByRole('button',{name:'领取 60 EXP',exact:true}).click();await closeCelebration();await navigate('今日经营');}
  if(day===6){await page.getByRole('button',{name:'写经营总结'}).click();await page.getByRole('button',{name:'遇见更多灵感',exact:true}).click();await page.getByRole('button',{name:'保存经营总结'}).click();}
  await page.getByRole('button',{name:'领取 +35 EXP',exact:true}).click();await closeCelebration();await navigate('今日经营');await page.getByRole('button',{name:'已领取 +35 EXP'}).waitFor();
  console.log('Passed task',day+1);
 }
 let state=await page.evaluate(()=>JSON.parse(localStorage.getItem('trend-buyer.demo.v1')));if(state.xp!==340||state.completed.length!==7)throw Error('seven days state wrong '+JSON.stringify({xp:state.xp,n:state.completed.length}));
 await page.locator('.reward-list>div').filter({hasText:'初心主理人徽章'}).getByRole('button').click();await closeCelebration();await navigate('今日经营');await page.locator('.reward-list>div').filter({hasText:'一周灵感纪念杯'}).getByRole('button').click();await closeCelebration();
 await navigate('活动');await page.getByRole('button',{name:'未来机能',exact:true}).click();await page.getByRole('button',{name:'选择品牌商品 午夜廓形衬衫'}).click();await page.getByRole('button',{name:'选择品牌商品 银翼机能跑鞋'}).click();await page.getByRole('button',{name:'完成选品板 · 2/3'}).click();await page.locator('.saved-board button').first().click();await page.getByRole('button',{name:'加入想要',exact:true}).click();await page.getByRole('button',{name:'关闭弹窗'}).click();
 await page.reload();await page.getByText('体验模式 · 周日',{exact:false}).waitFor();
 state=await page.evaluate(()=>JSON.parse(localStorage.getItem('trend-buyer.demo.v1')));if(state.xp!==340||!state.wishes.includes('p03')||state.rewards.length!==2)throw Error('reward or save wrong');
 await page.getByRole('button',{name:'切换体验',exact:true}).click();await page.getByRole('button',{name:'30 天',exact:true}).click();await closeCelebration();
 await navigate('今日经营');await page.locator('.reward-list>div').filter({hasText:'月度买手奖章'}).getByRole('button').click();await closeCelebration();
 await page.getByRole('button',{name:'切换体验',exact:true}).click();await page.getByRole('button',{name:'恢复初始体验数据',exact:true}).click();await page.getByRole('button',{name:'确认恢复初始体验数据'}).click();
 state=await page.evaluate(()=>JSON.parse(localStorage.getItem('trend-buyer.demo.v1')));if(state.xp!==0||state.completed.length)throw Error('reset failed');
 for(const width of [360,390,768,1440]){await page.setViewportSize({width,height:900});for(const name of ['我的店铺','今日经营','逛逛潮店','活动','我的']){await page.locator('.bottom-nav').getByRole('button',{name,exact:true}).click();if(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth))throw Error('overflow '+width+' '+name)}}
 fs.writeFileSync('test-results/full-flow-check.json',JSON.stringify({passed:true,checks:['all 7 daily tasks via UI','daily +280 XP','weekly +60 XP','3/7/30 day rewards','brand style selection','wishlist from board','refresh preserves demo','demo reset','20 viewport/navigation combinations'],errors},null,2));if(errors.length)throw Error(errors.join('\n'));console.log('FULL FLOW PASSED');await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
