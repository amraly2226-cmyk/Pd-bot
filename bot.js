// v2.3 Fix - بيدور على زرار Max Buy نفسه
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
async function login(page){ await page.goto(LOGIN_URL,{waitUntil:'networkidle2'}); try{ await page.type('input[name="username"]',USER,{delay:50}); await page.type('input[name="password"]',PASS,{delay:50}); await page.click('button[type="submit"]'); await page.waitForNavigation({waitUntil:'networkidle2'}); log("✅ لوجن"); }catch{ log("⚠️ هكمل"); } }
async function buyItem(page,itemName){
  log(`💰 بحاول اشتري ${itemName}`);
  await page.goto(BM_URL,{waitUntil:'networkidle2'}); await sleep(3000);
  let pageItems = await page.evaluate(()=>{ let all=document.body.innerText; let found=[]; let names=["Alcohol","Anabolic steroid","Electronics"]; for(let n of names){ if(all.toLowerCase().includes(n.toLowerCase())) found.push(n); } return { hasMaxBuy: all.includes("Max Buy"), itemsFound: found }; });
  log(`📄 في الصفحة: ${pageItems.itemsFound.join(',')} | فيه Max Buy؟ ${pageItems.hasMaxBuy}`);
  let ok = await page.evaluate((item)=>{
    let btns = [...document.querySelectorAll('button')].filter(b=> b.innerText && b.innerText.trim().toLowerCase()==='max buy' && b.offsetParent!==null);
    for(let btn of btns){ let tr = btn.closest('tr'); if(tr && tr.innerText.toLowerCase().includes(item.toLowerCase())){ btn.click(); return 'clicked Max Buy'; } }
    return false;
  }, itemName);
  if(!ok){ log(`❌ مش لاقي Max Buy لـ ${itemName}`); return false; }
  log(`🟡 ${ok} لـ ${itemName}`); await sleep(1500);
  let confirmed = await page.evaluate(()=>{ let btns=[...document.querySelectorAll('button')].filter(b=> b.offsetParent!==null); let b = btns.find(x=> x.innerText.trim().toUpperCase()==='BUY MAX') || btns.find(x=> x.innerText.trim().toUpperCase()==='BUY'); if(b){ b.click(); return b.innerText; } return false; });
  if(confirmed){ log(`✅ دوست ${confirmed} - اشتريت ${itemName}`); await sleep(3000); return true; }
  return false;
}
async function travelTo(page,toCity){ log(`✈️ مسافر ${toCity}`); await page.goto(TRAVEL_URL,{waitUntil:'networkidle2'}); await sleep(2000); let p=await page.evaluate((to)=>{ let els=[...document.querySelectorAll('*')]; for(let el of els){ if(el.innerText&&el.innerText.trim().toUpperCase()===to.toUpperCase()&&el.offsetParent!==null&&el.children.length===0){ let c=el.parentElement; for(let i=0;i<5;i++){ if(c&&c.offsetWidth>150) break; c=c.parentElement; } if(c){c.click(); return true;} } } return false; },toCity); if(!p) return false; await sleep(1500); let c1=await page.evaluate(()=>{ let b=[...document.querySelectorAll('button')].find(x=>x.innerText.includes('Travel to Selected Location')); if(b){b.click(); return true;} return false; }); if(c1) await sleep(1200); let c2=await page.evaluate(()=>{ let b=[...document.querySelectorAll('button')].find(x=>x.innerText.trim()==='TRAVEL'); if(b){b.click(); return true;} return false; }); if(c2){ log(`✈️ سافرت ${toCity}`); await sleep(4000); return true;} return false; }
async function main(){ const browser=await puppeteer.launch({headless:true,args:['--no-sandbox']}); const page=await browser.newPage(); await login(page); let last="Cairo"; while(true){ try{ let cur=await getCurrentCity(page)||last; last=cur; let cfg=CONFIG[cur]||CONFIG["Cairo"]; log(`📍 في ${cur} - هشتري ${cfg.item} -> ${cfg.to}`); let cds=await getCooldowns(page); if(cds.travel){ await page.goto(TRAVEL_URL,{waitUntil:'networkidle2'}); await sleep((cds.travel.sec+5)*1000); continue; } await page.goto(BM_URL,{waitUntil:'networkidle2'}); await sleep(1500); let hold=await page.evaluate(()=>{ let m=document.body.innerText.match(/holding (\d+)/i); return m?+m[1]:0; }); if(hold===0){ let ok=await buyItem(page,cfg.item); if(!ok){ await sleep(8000); continue; } } await travelTo(page,cfg.to); let after=await getCooldowns(page); if(after.travel) await sleep((after.travel.sec+5)*1000); }catch(e){ log(`❌ ${e.message}`); await sleep(10000); } } } main();
