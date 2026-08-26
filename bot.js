
// Project Dark - Offline Bot 24/7 - نفس منطق v55.6
// يشتغل على سيرفر حتى لو قفلت المتصفح
require('dotenv').config();
const puppeteer = require('puppeteer-extra');
const Stealth = require('puppeteer-extra-plugin-stealth');
puppeteer.use(Stealth());

const CITIES = {1:"Cairo",2:"Tokyo",3:"London",4:"Moscow",5:"Rome",6:"Capetown",7:"Sydney",8:"Ottawa",9:"Rio de Janeiro"};
const CITY_IDS = {"Cairo":1,"Tokyo":2,"London":3,"Moscow":4,"Rome":5,"Capetown":6,"Sydney":7,"Ottawa":8,"Rio de Janeiro":9};
// غير البضاعة اللي عايزها هنا - نفس الترتيب بتاع البوت الابيض
const CONFIG = {
  "Cairo": { item: "Anabolic steroid", to: "Tokyo" },
  "Tokyo": { item: "Electronics", to: "Cairo" },
  // زود باقي المدن لو عايز
};

const USER = process.env.PD_USER;
const PASS = process.env.PD_PASS;
const LOGIN_URL = "https://www.project-dark.co.uk/login";
const BM_URL = "https://www.project-dark.co.uk/blackmarket";
const TRAVEL_URL = "https://www.project-dark.co.uk/travel";

function log(msg){ console.log(`[${new Date().toLocaleTimeString()}] ${msg}`); }
function sleep(ms){ return new Promise(r=>setTimeout(r,ms)); }

async function getHold(page){
  try{
    let txt = await page.evaluate(()=>document.body.innerText);
    let m = txt.match(/holding (\d+) items/i);
    return m? parseInt(m[1]):0;
  }catch{ return 0; }
}
async function getCurrentCity(page){
  let txt = await page.evaluate(()=>document.body.innerText);
  let m=txt.match(/Black Market - ([A-Za-z ]+)/i); if(m) return m[1].trim();
  m=txt.match(/You have traveled to ([A-Za-z ]+)!/i); if(m) return m[1].trim();
  return null;
}
async function getHeldItem(page){
  return await page.evaluate(()=>{
    let rows=[...document.querySelectorAll('tr')];
    for(let r of rows){
      if(r.innerHTML.includes('Sell All') && !r.innerText.includes('Confirm Sell All')){
        return r.innerText.split('\n')[0].trim();
      }
    }
    return null;
  });
}

async function login(page){
  log("داخل على صفحة اللوجن...");
  await page.goto(LOGIN_URL, {waitUntil:'networkidle2'});
  // غير ال selectors حسب صفحة اللوجن الحقيقية
  try{
    await page.type('input[name="username"]', USER, {delay:50});
    await page.type('input[name="password"]', PASS, {delay:50});
    await page.click('button[type="submit"]');
    await page.waitForNavigation({waitUntil:'networkidle2'});
    log("✅ عملت لوجن");
  }catch(e){
    log("⚠️ انت غالبا عامل لوجن بالكوكيز - هكمل");
  }
}

async function sellIfNeeded(page, wantedItem){
  let hold = await getHold(page);
  if(hold===0) return false;
  let heldText = await page.evaluate(()=>{
    let rows=[...document.querySelectorAll('tr')];
    for(let r of rows){
      if(r.innerHTML.includes('Sell All') && !r.innerText.includes('Confirm Sell All')){
        return r.innerText;
      }
    }
    return null;
  });
  if(!heldText) return false;
  if(heldText.toLowerCase().includes(wantedItem.toLowerCase())) return false;

  log(`⚠️ شايل حاجة غلط (${heldText.slice(0,30)}) وهبيعها عشان اشتري ${wantedItem}`);
  let sellBtn = await page.$('tr:has(button) button::-p-text(Sell All)');
  // fallback
  if(!sellBtn){
    sellBtn = await page.evaluateHandle(()=>{
      let rows=[...document.querySelectorAll('tr')];
      for(let r of rows){
        if(r.innerHTML.includes('Sell All') && !r.innerText.includes('Confirm')){
          let b=[...r.querySelectorAll('button')].find(x=>x.innerText.includes('Sell All'));
          if(b) return b;
        }
      }
      return null;
    });
  }
  try{ await sellBtn.click(); }catch{}
  await sleep(1500);
  // دوس الاحمر SELL ALL
  let confirmBtn = await page.evaluateHandle(()=>{
    return [...document.querySelectorAll('button')].find(b=>{
      if(b.textContent.trim().toUpperCase()!=='SELL ALL') return false;
      let p=b.parentElement; for(let i=0;i<5&&p;i++){ if(p.innerText.includes('Confirm Sell All')) return true; p=p.parentElement; }
      return false;
    });
  });
  try{ 
    let el = confirmBtn.asElement();
    if(el) await el.click();
    log("🔴 دوست SELL ALL الاحمر");
  }catch{}
  await sleep(3000);
  await page.reload({waitUntil:'networkidle2'});
  return true;
}

async function buyItem(page, itemName){
  log(`💰 بحاول اشتري ${itemName}`);
  await page.goto(BM_URL, {waitUntil:'networkidle2'});
  let row = await page.evaluateHandle((item)=>{
    return [...document.querySelectorAll('tr')].find(tr=> tr.innerText.toLowerCase().includes(item.toLowerCase()) && tr.innerText.includes('£'));
  }, itemName);
  if(!row) { log(`❌ مش لاقي ${itemName}`); return false; }
  try{
    let btn = await page.evaluateHandle((item)=>{
      let row=[...document.querySelectorAll('tr')].find(tr=> tr.innerText.toLowerCase().includes(item.toLowerCase()));
      if(!row) return null;
      return [...row.querySelectorAll('button')].find(b=>b.innerText.includes('Max Buy'));
    }, itemName);
    let el = btn.asElement();
    if(el){ await el.click(); await sleep(1000);
      let confirm = await page.$('button::-p-text(BUY MAX)');
      if(confirm){ await confirm.click(); log(`✅ اشتريت ${itemName}`); await sleep(2000); return true; }
    }
  }catch(e){ log(`خطأ شراء: ${e.message}`); }
  return false;
}

async function travelTo(page, toCity){
  log(`✈️ مسافر ${toCity}`);
  await page.goto(TRAVEL_URL, {waitUntil:'networkidle2'});
  await sleep(2000);
  // دور على كارت المدينة
  await page.evaluate((to)=>{
    let els=[...document.querySelectorAll('*')];
    for(let el of els){
      if(el.innerText && el.innerText.trim().toUpperCase()===to.toUpperCase() && el.offsetParent!==null && el.children.length===0){
        let card=el.parentElement;
        for(let i=0;i<4;i++){ if(card&&card.offsetWidth>150) break; card=card.parentElement; }
        if(card) card.click();
      }
    }
  }, toCity);
  await sleep(1500);
  let btn1 = await page.$('button::-p-text(Travel to Selected Location)');
  if(btn1){ await btn1.click(); await sleep(1200); }
  let btn2 = await page.$('button::-p-text(TRAVEL)');
  if(btn2){ await btn2.click(); log(`✈️ دوست TRAVEL لـ ${toCity}`); await sleep(3000); }
}

async function main(){
  if(!USER || !PASS){ console.log("حط اليوزر والباس في ملف .env - شوف .env.example"); return; }
  const browser = await puppeteer.launch({headless:true, args:['--no-sandbox','--disable-setuid-sandbox']});
  const page = await browser.newPage();
  await login(page);

  while(true){
    try{
      let cur = await getCurrentCity(page) || "Cairo";
      let cfg = CONFIG[cur];
      if(!cfg){ log(`مفيش كونفيج لـ ${cur} - بستخدم Cairo`); cfg=CONFIG["Cairo"]; cur="Cairo"; }
      log(`📍 انت في ${cur} - المفروض تشتري ${cfg.item} وتسافر ${cfg.to} - معاك ${await getHold(page)}`);

      // 1- اتأكد انك شاري الصح قبل السفر - نفس اللي طلبته في Start
      await page.goto(BM_URL, {waitUntil:'networkidle2'});
      await sleep(2000);
      let didSell = await sellIfNeeded(page, cfg.item);
      let hold = await getHold(page);
      if(hold===0){
        await buyItem(page, cfg.item);
      }

      // 2- سافر
      await travelTo(page, cfg.to);

      // 3- استنى الكولداون
      let cdText = await page.evaluate(()=>document.body.innerText);
      let m = cdText.match(/You cannot travel for:?\s*([0-9hms ]+)/i);
      if(m){
        log(`⏳ كولداون: ${m[1]} - هنام 60 ثانية`);
        await sleep(60000);
      }else{
        await sleep(5000);
      }

    }catch(e){
      log(`❌ خطأ: ${e.message} - هعمل ريلود بعد 10 ث`);
      await sleep(10000);
      try{ await page.goto(BM_URL, {waitUntil:'networkidle2'}); }catch{}
    }
  }
}

main();
