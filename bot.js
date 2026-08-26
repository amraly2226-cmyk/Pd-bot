// Project Dark - RoundTrip v2.1 - Cairo <-> Tokyo + كولدون كامل زي كيوي
require('dotenv').config();
const puppeteer = require('puppeteer-extra');
const Stealth = require('puppeteer-extra-plugin-stealth');
puppeteer.use(Stealth());

const CONFIG = {
  "Cairo": { item: "Alcohol", to: "Tokyo" },
  "Tokyo": { item: "Electronics", to: "Cairo" },
};

const USER = process.env.PD_USER;
const PASS = process.env.PD_PASS;
const LOGIN_URL = "https://www.project-dark.co.uk/login";
const BM_URL = "https://www.project-dark.co.uk/blackmarket";
const TRAVEL_URL = "https://www.project-dark.co.uk/travel";

function log(msg){ console.log(`[${new Date().toLocaleTimeString()}] ${msg}`); }
function sleep(ms){ return new Promise(r=>setTimeout(r,ms)); }

function parseCooldown(str){
  if(!str) return 0;
  let sec=0;
  let h=str.match(/(\d+)\s*h/); if(h) sec+=parseInt(h[1])*3600;
  let m=str.match(/(\d+)\s*m/); if(m) sec+=parseInt(m[1])*60;
  let s=str.match(/(\d+)\s*s/); if(s) sec+=parseInt(s[1]);
  if(sec===0){ let num=str.match(/(\d+)/); if(num) sec=parseInt(num[1])*60; }
  return sec;
}

async function getCooldowns(page){
  let txt = await page.evaluate(()=>document.body.innerText);
  let travelMatch = txt.match(/You cannot travel for:?\s*([0-9hms ]+)/i);
  let buyMatch = txt.match(/You cannot buy for:?\s*([0-9hms ]+)/i);
  return {
    travel: travelMatch? { sec: parseCooldown(travelMatch[1]), str: travelMatch[1].trim() } : null,
    buy: buyMatch? { sec: parseCooldown(buyMatch[1]), str: buyMatch[1].trim() } : null
  };
}

async function getHold(page){
  try{ let txt = await page.evaluate(()=>document.body.innerText); let m = txt.match(/holding (\d+) items/i); return m? parseInt(m[1]):0; }catch{ return 0; }
}

async function getCurrentCity(page){
  return await page.evaluate(()=>{
    let txt=document.body.innerText;
    let m=txt.match(/Black Market - ([A-Za-z ]+)/i); if(m) return m[1].trim();
    m=txt.match(/You have traveled to ([A-Za-z ]+)!/i); if(m) return m[1].trim();
    let cur=[...document.querySelectorAll('*')].find(e=>e.innerText&&e.innerText.trim()==='CURRENT LOCATION');
    if(cur){ let p=cur.closest('div')?.innerText.toUpperCase()||""; for(let c of ["Cairo","Tokyo","London","Moscow","Rome","Capetown","Sydney","Ottawa","Rio de Janeiro"]) if(p.includes(c.toUpperCase())) return c; }
    let sm=txt.match(/Location\s*\n?\s*(Cairo|Tokyo|London|Moscow|Rome|Capetown|Sydney|Ottawa|Rio de Janeiro)/i); if(sm) return sm[1].trim();
    return null;
  });
}

async function getHeldItemName(page){
  return await page.evaluate(()=>{
    let rows=[...document.querySelectorAll('tr')];
    for(let r of rows){ if(r.innerHTML.includes('Sell All') &&!r.innerText.includes('Confirm Sell All')){ return r.innerText.split('\n')[0].trim(); } }
    return null;
  });
}

async function login(page){
  log("داخل على صفحة اللوجن...");
  await page.goto(LOGIN_URL, {waitUntil:'networkidle2'});
  try{
    await page.type('input[name="username"]', USER, {delay:50});
    await page.type('input[name="password"]', PASS, {delay:50});
    await page.click('button[type="submit"]');
    await page.waitForNavigation({waitUntil:'networkidle2'});
    log("✅ عملت لوجن");
  }catch(e){ log("⚠️ غالبا عامل لوجن بالكوكيز - هكمل"); }
}

async function sellAll(page){
  let hold = await getHold(page);
  if(hold===0) return false;
  log(`💸 معاك ${hold} - هبيعهم الاول...`);
  await page.goto(BM_URL, {waitUntil:'networkidle2'});
  await sleep(2000);
  let sellBtn = await page.evaluateHandle(()=>{
    let rows=[...document.querySelectorAll('tr')];
    for(let r of rows){
      if(r.innerHTML.includes('Sell All') &&!r.innerText.includes('Confirm Sell All')){
        let b=[...r.querySelectorAll('button')].find(x=>x.innerText.includes('Sell All'));
        if(b && b.offsetParent!==null) return b;
      }
    }
    return null;
  });
  try{ let el = sellBtn.asElement(); if(!el){ log("❌ مش لاقي زرار Sell All"); return false; } await el.click(); log("🟡 دوست Sell All"); await sleep(1500); }catch{ return false; }
  let confirmBtn = await page.evaluateHandle(()=>{
    return [...document.querySelectorAll('button')].find(b=>{
      if(b.textContent.trim().toUpperCase()!=='SELL ALL') return false;
      if(b.offsetParent===null) return false;
      let p=b.parentElement; for(let i=0;i<6&&p;i++){ if(p.innerText && p.innerText.includes('Confirm Sell All')) return true; p=p.parentElement; }
      return false;
    });
  });
  try{
    let el2 = confirmBtn.asElement();
    if(el2){ await el2.click(); log("🔴 دوست SELL ALL الاحمر - اتباع"); await sleep(3000); await page.reload({waitUntil:'networkidle2'}); return true; }
  }catch{}
  return false;
}

async function buyItem(page, itemName){
  log(`💰 بحاول اشتري ${itemName}`);
  await page.goto(BM_URL, {waitUntil:'networkidle2'});
  await sleep(1500);
  let cds = await getCooldowns(page);
  if(cds.buy){ log(`⏳ كولدون شراء: ${cds.buy.str} - هستنى ${cds.buy.sec} ث`); await sleep((cds.buy.sec+2)*1000); }
  try{
    let maxBuyBtn = await page.evaluateHandle((item)=>{
      let row=[...document.querySelectorAll('tr')].find(tr=> tr.innerText.toLowerCase().includes(item.toLowerCase()));
      if(!row) return null;
      return [...row.querySelectorAll('button')].find(b=>b.innerText.includes('Max Buy'));
    }, itemName);
    let el = maxBuyBtn.asElement();
    if(!el){ log(`❌ مفيش Max Buy لـ ${itemName}`); return false; }
    await el.click(); await sleep(1000);
    let confirm = await page.evaluateHandle(()=> [...document.querySelectorAll('button')].find(b=>b.innerText.trim()==='BUY MAX'));
    let el2 = confirm.asElement();
    if(el2){ await el2.click(); log(`✅ اشتريت ${itemName} Max`); await sleep(2000); return true; }
  }catch(e){ log(`خطأ شراء: ${e.message}`); }
  return false;
}

async function travelTo(page, toCity){
  log(`✈️ مسافر ${toCity}...`);
  await page.goto(TRAVEL_URL, {waitUntil:'networkidle2'});
  await sleep(2000);
  let cds = await getCooldowns(page);
  if(cds.travel){
    log(`⏳ كولدون سفر: ${cds.travel.str} - هستنى ${cds.travel.sec} ثانية في صفحة Travel`);
    await sleep((cds.travel.sec+5)*1000);
    await page.reload({waitUntil:'networkidle2'});
  }
  await page.evaluate((to)=>{
    let els=[...document.querySelectorAll('*')];
    for(let el of els){
      if(el.innerText && el.innerText.trim().toUpperCase()===to.toUpperCase() && el.offsetParent!==null && el.children.length===0){
        let card=el.parentElement;
        for(let i=0;i<4;i++){ if(card&&card.offsetWidth>150) break; card=card.parentElement; }
        if(card){ card.click(); return; }
      }
    }
  }, toCity);
  await sleep(1500);
  let btn1 = await page.evaluateHandle(()=> [...document.querySelectorAll('button')].find(b=>b.innerText.trim()==='Travel to Selected Location'));
  let e1 = btn1.asElement(); if(e1){ await e1.click(); await sleep(1200); }
  let btn2 = await page.evaluateHandle(()=> [...document.querySelectorAll('button')].find(b=>b.innerText.trim()==='TRAVEL'));
  let e2 = btn2.asElement();
  if(e2){ await e2.click(); log(`✈️ دوست TRAVEL لـ ${toCity}`); await sleep(4000); return true; }
  else { log(`❌ مش لاقي زرار TRAVEL لـ ${toCity}`); return false; }
}

async function main(){
  if(!USER ||!PASS){ console.log("حط PD_USER و PD_PASS في Variables"); return; }
  const browser = await puppeteer.launch({headless:true, args:['--no-sandbox','--disable-setuid-sandbox']});
  const page = await browser.newPage();
  await login(page);
  let lastCity = "Cairo";
  while(true){
    try{
      let cur = await getCurrentCity(page);
      if(!cur){ await page.goto(BM_URL, {waitUntil:'networkidle2'}); cur = await getCurrentCity(page) || lastCity; }
      lastCity = cur;
      let cfg = CONFIG[cur];
      if(!cfg){ cfg = CONFIG[lastCity] || CONFIG["Cairo"]; cur = lastCity; }
      log(`📍 انت في ${cur} - المفروض تشتري ${cfg.item} وتسافر ${cfg.to} - معاك ${await getHold(page)}`);
      let cds = await getCooldowns(page);
      if(cds.travel){
        log(`⏳ كولدون سفر: ${cds.travel.str} - هروح Travel واستنى`);
        await page.goto(TRAVEL_URL, {waitUntil:'networkidle2'});
        await sleep((cds.travel.sec+5)*1000);
        continue;
      }
      await page.goto(BM_URL, {waitUntil:'networkidle2'});
      await sleep(2000);
      let hold = await getHold(page);
      let heldName = await getHeldItemName(page);
      if(hold>0 && heldName &&!heldName.toLowerCase().includes(cfg.item.toLowerCase())){
        log(`🔄 شايل ${heldName} وانت في ${cur} - هبيعه عشان اشتري ${cfg.item}`);
        await sellAll(page);
        hold = 0;
      }
      if(hold===0){
        let bought = await buyItem(page, cfg.item);
        if(!bought){ log(`❌ فشل شراء ${cfg.item} - هحاول بعد 10 ث`); await sleep(10000); continue; }
      }
      let traveled = await travelTo(page, cfg.to);
      if(!traveled){ await sleep(5000); continue; }
      let afterTravelCD = await getCooldowns(page);
      if(afterTravelCD.travel){
        log(`⏳ بعد السفر - كولدون: ${afterTravelCD.travel.str} - هنام ${afterTravelCD.travel.sec} ث`);
        await sleep((afterTravelCD.travel.sec+5)*1000);
      }else{ await sleep(3000); }
    }catch(e){
      log(`❌ خطأ: ${e.message} - ريلود بعد 10 ث`);
      await sleep(10000);
      try{ await page.goto(BM_URL, {waitUntil:'networkidle2'}); }catch{}
    }
  }
}
main();
