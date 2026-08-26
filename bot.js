// v2.4 - نفس كود الكيوي بالحرف - FIXED
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
function log(m){ console.log(`[${new Date().toLocaleTimeString()}] ${m}`); }
function sleep(ms){ return new Promise(r=>setTimeout(r,ms)); }
function parseCooldown(s){ if(!s) return 0; let sec=0; let h=s.match(/(\d+)\s*h/); if(h) sec+=+h[1]*3600; let mm=s.match(/(\d+)\s*m/); if(mm) sec+=+mm[1]*60; let ss=s.match(/(\d+)\s*s/); if(ss) sec+=+ss[1]; if(sec==0){let n=s.match(/(\d+)/); if(n) sec=+n[1]*60;} return sec; }
async function getCooldowns(page){ let txt=await page.evaluate(()=>document.body.innerText); let tm=txt.match(/You cannot travel for:?\s*([0-9hms ]+)/i); let bm=txt.match(/You cannot buy for:?\s*([0-9hms ]+)/i); return { travel: tm?{sec:parseCooldown(tm[1]),str:tm[1].trim()}:null, buy: bm?{sec:parseCooldown(bm[1]),str:bm[1].trim()}:null }; }
async function getCurrentCity(page){ return await page.evaluate(()=>{ let t=document.body.innerText; let m=t.match(/Black Market - ([A-Za-z ]+)/i); if(m) return m[1].trim(); return null; }); }
async function getHold(page){ try{ let txt=await page.evaluate(()=>document.body.innerText); let m=txt.match(/holding (\d+) items/i); return m?+m[1]:0; }catch{ return 0; } }
async function login(page){ await page.goto(LOGIN_URL,{waitUntil:'networkidle2'}); try{ await page.type('input[name="username"]',USER,{delay:50}); await page.type('input[name="password"]',PASS,{delay:50}); await page.click('button[type="submit"]'); await page.waitForNavigation({waitUntil:'networkidle2'}); log("✅ لوجن"); }catch{ log("⚠️ هكمل"); } }

async function sellIfNeeded(page, wantedItem){
  let hold = await getHold(page); if(hold===0) return false;
  let heldInfo = await page.evaluate(()=>{
    let ITEMS=["Anabolic steroid","Artifacts","Alcohol","Electronics","Plastic jewelry","Stolen paintings"];
    let rows=[...document.querySelectorAll('tr')];
    for(let r of rows){
      if(r.innerHTML.includes('Sell All') &&!r.innerText.includes('Confirm Sell All')){
        let txt=r.innerText.toLowerCase();
        for(let it of ITEMS){ if(txt.includes(it.toLowerCase())) return {name:it}; }
        if(r.cells[0]) return {name:r.cells[0].innerText.trim()};
      }
    }
    return null;
  });
  if(!heldInfo) return false;
  if(heldInfo.name.toLowerCase()===wantedItem.toLowerCase()) return false;
  log(`⚠️ شايل ${heldInfo.name} لكن المفروض ${wantedItem} - هبيع زي الكيوي`);
  let clickedRow = await page.evaluate((heldName)=>{
    let row=[...document.querySelectorAll('tr')].find(tr=> tr.innerText.toLowerCase().includes(heldName.toLowerCase()) && tr.innerHTML.includes('Sell All') &&!tr.innerText.includes('Confirm Sell All'));
    if(!row) return false;
    let btn=[...row.querySelectorAll('button')].find(b=> b.innerText.trim()==='Sell All' && b.offsetParent!==null);
    if(btn){ btn.click(); return true; } return false;
  }, heldInfo.name);
  if(!clickedRow) return false;
  await sleep(2500);
  let clickedRed = await page.evaluate(()=>{
    let btn=[...document.querySelectorAll('button')].find(b=>{
      if(b.textContent.trim().toUpperCase()!=='SELL ALL') return false;
      if(b.offsetParent===null) return false;
      let p=b.parentElement;
      for(let i=0;i<5&&p;i++){ if(p.innerText&&p.innerText.includes('Confirm Sell All')) return true; p=p.parentElement; }
      return false;
    });
    if(btn){ btn.click(); return true; } return false;
  });
  if(clickedRed){ log(`🔴 دوست SELL ALL الاحمر`); await sleep(3000); await page.reload({waitUntil:'networkidle2'}); return true; }
  return false;
}

async function buyItem(page, itemName){
  log(`💰 بحاول اشتري ${itemName} - كيوي`);
  await page.goto(BM_URL,{waitUntil:'networkidle2'}); await sleep(3000);
  let debug = await page.evaluate(()=>{
    let html=document.documentElement.innerHTML;
    return { hasMaxBuy: html.includes('Max Buy'), hasBuyMax: html.includes('BUY MAX') };
  });
  log(`🔍 HTML فيه Max Buy؟ ${debug.hasMaxBuy} | BUY MAX؟ ${debug.hasBuyMax}`);

  let clicked = await page.evaluate((item)=>{
    let row=[...document.querySelectorAll('tr')].find(tr=> tr.innerText.toLowerCase().includes(item.toLowerCase()) && tr.innerText.includes('£'));
    if(!row) return {ok:false, reason:'row not found'};
    let mb=[...row.querySelectorAll('button')].find(b=> b.innerText.includes('Max Buy'));
    if(!mb) return {ok:false, reason:'Max Buy btn not found'};
    mb.click(); return {ok:true};
  }, itemName);
  if(!clicked.ok){ log(`❌ ${clicked.reason}`); return false; }
  log(`🟡 دوست Max Buy - مستني BUY MAX`);
  await sleep(1500);
  let confirmed = await page.evaluate(()=>{
    let bm=[...document.querySelectorAll('button')].find(b=> b.innerText.trim()==='BUY MAX');
    if(bm){ bm.click(); return true; } return false;
  });
  if(confirmed){ log(`✅ اشتريت ${itemName}`); await sleep(3000); return true; }
  return false;
}

async function travelTo(page, toCity){
  log(`✈️ مسافر ${toCity}`); await page.goto(TRAVEL_URL,{waitUntil:'networkidle2'}); await sleep(2000);
  let picked = await page.evaluate((to)=>{
    for(let el of document.querySelectorAll('*')){
      if(el.innerText&&el.innerText.trim().toUpperCase()===to.toUpperCase()&&el.offsetParent!==null&&el.children.length===0){
        let card=el.parentElement; for(let i=0;i<4;i++){ if(card&&card.offsetWidth>150) break; card=card.parentElement; }
        if(card){ card.click(); return true; }
      }
    } return false;
  }, toCity);
  if(!picked) return false;
  await sleep(1500);
  await page.evaluate(()=>{ let b=[...document.querySelectorAll('button')].find(x=>x.innerText.trim()==='Travel to Selected Location'); if(b) b.click(); });
  await sleep(1200);
  let traveled = await page.evaluate(()=>{ let b=[...document.querySelectorAll('button')].find(x=>x.innerText.trim()==='TRAVEL'); if(b){ b.click(); return true; } return false; });
  if(traveled){ log(`✈️ سافرت ${toCity}`); await sleep(4000); return true; } return false;
}

async function main(){
  const browser = await puppeteer.launch({headless:"new", args:['--no-sandbox']});
  const page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0');
  await login(page);
  let lastCity="Cairo";
  while(true){
    try{
      let cur = await getCurrentCity(page) || lastCity; lastCity=cur;
      let cfg=CONFIG[cur]||CONFIG["Cairo"];
      let hold=await getHold(page);
      log(`📍 في ${cur} - معاك ${hold} - هشتري ${cfg.item} -> ${cfg.to}`);
      await page.goto(BM_URL,{waitUntil:'networkidle2'}); await sleep(2000);
      await sellIfNeeded(page, cfg.item); hold=await getHold(page);
      if(hold===0){ let ok=await buyItem(page, cfg.item); if(!ok){ await sleep(10000); continue; } }
      await travelTo(page, cfg.to);
      let after=await getCooldowns(page); if(after.travel) await sleep((after.travel.sec+5)*1000);
    }catch(e){ log(`❌ ${e.message}`); await sleep(10000); }
  }
}
main();
