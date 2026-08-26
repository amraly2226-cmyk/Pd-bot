// bot.js - Project Dark Offline Bot v55.7 FULL FIXED FOR GITHUB / RAILWAY
const puppeteer = require('puppeteer');

const CITIES = {1:"Cairo",2:"Tokyo",3:"London",4:"Moscow",5:"Rome",6:"Capetown",7:"Sydney",8:"Ottawa",9:"Rio de Janeiro"};
const ITEMS = ["Anabolic Steroids","Artifacts","Alcohol","Electronics","Plastic jewelry","Stolen paintings","Human beings","Confidential documents","Endangered exotic animals","Organs"];

const CONFIG = {
  username: process.env.PD_USER || "",
  password: process.env.PD_PASS || "",
  from: process.env.PD_FROM || "Cairo",
  to: process.env.PD_TO || "Tokyo",
  item: process.env.PD_ITEM || "Anabolic Steroids",
  baseUrl: "https://www.project-dark.co.uk"
};

function normalizeItemName(name) {
  if (!name) return name;
  const lower = name.toLowerCase().trim();
  if (lower.includes('anabolic')) return 'Anabolic Steroids';
  if (lower.includes('artifact')) return 'Artifacts';
  return name;
}

function log(msg) {
  const time = new Date().toLocaleTimeString('en-US', {hour12:true});
  console.log(`[${time}] ${msg}`);
}
async function sleep(ms){ return new Promise(r=>setTimeout(r, ms)); }

async function getCurrentCity(page){
  return await page.evaluate(() => {
    let txt = document.body.innerText;
    let m = txt.match(/Black Market - ([A-Za-z ]+)/i);
    if(m) return m[1].trim();
    m = txt.match(/You have traveled to ([A-Za-z ]+)!/i);
    if(m) return m[1].trim();
    return null;
  });
}
async function getHold(page){
  return await page.evaluate(() => {
    let m = document.body.innerText.match(/holding (\d+) items/i);
    return m? +m[1] : 0;
  });
}
async function getMoney(page){
  return await page.evaluate(() => {
    let m = document.body.innerText.match(/£\s*([\d,]+)/);
    return m? m[1] : "0";
  });
}

async function buyItem(page, itemName){
  const fixedName = normalizeItemName(itemName);
  log(`📍 في ${await getCurrentCity(page) || '??'} - هشتري - ${await getMoney(page)} معاك - بدور على ${fixedName}`);

  await page.goto(`${CONFIG.baseUrl}/blackmarket`, {waitUntil:'networkidle2'});
  await sleep(3000);

  const bodyHTML = await page.content();
  const hasMaxBuy = bodyHTML.includes('Max Buy');
  log(`🔍 HTML فيه Max Buys? ${hasMaxBuy}`);

  if(!hasMaxBuy){
    log(`⚠️ مش لاقي Max Buy - السيشن خلص - هعمل ريلود`);
    console.log(bodyHTML.slice(0,1000));
    return false;
  }

  const result = await page.evaluate((itemSearch) => {
    const search = itemSearch.toLowerCase().includes('anabolic')? 'anabolic' : itemSearch.toLowerCase();
    const rows = [...document.querySelectorAll('tr')];
    let targetRow = null;
    for(let tr of rows){
      if(tr.innerText.toLowerCase().includes(search) && tr.innerHTML.toLowerCase().includes('buy')){
        targetRow = tr; break;
      }
    }
    if(!targetRow){
      const first = search.split(' ')[0];
      targetRow = rows.find(tr=> tr.innerText.toLowerCase().includes(first) && tr.innerText.includes('£'));
    }
    if(!targetRow) return {found:false};
    const maxBtn = [...targetRow.querySelectorAll('button')].find(b=> b.innerText.includes('Max Buy'));
    if(!maxBtn) return {found:false, reason:'no Max Buy button'};
    maxBtn.click();
    return {found:true, text: targetRow.innerText.slice(0,150)};
  }, fixedName);

  log(`💰 بحاول اشتري ${fixedName} - ${JSON.stringify(result).slice(0,200)}`);

  if(!result.found){
    log(`❌ row not found لـ ${fixedName}`);
    return false;
  }

  await sleep(2000);
  const bought = await page.evaluate(()=>{
    const btn = [...document.querySelectorAll('button')].find(b=> b.innerText.trim()==='BUY MAX');
    if(btn){ btn.click(); return true; }
    return false;
  });

  if(bought){
    log(`✅ اشتريت ${fixedName} بنجاح`);
    return true;
  } else {
    log(`❌ مفيش BUY MAX - يمكن فلوسك 0`);
    return false;
  }
}

async function travelTo(page, toCity){
  log(`✈️ هسافر ${toCity}`);
  await page.goto(`${CONFIG.baseUrl}/travel`, {waitUntil:'networkidle2'});
  await sleep(2000);
  await page.evaluate((toCity)=>{
    for(let el of document.querySelectorAll('*')){
      if(el.innerText && el.innerText.trim().toUpperCase()===toCity.toUpperCase() && el.children.length===0){
        let card = el.parentElement;
        for(let i=0;i<3;i++){ if(card && card.offsetWidth>150) break; card=card.parentElement; }
        if(card){ card.click(); }
      }
    }
  }, toCity);
  await sleep(1500);
  await page.evaluate(()=>{
    const tb = [...document.querySelectorAll('button')].find(b=> b.innerText.trim()==='Travel to Selected Location');
    if(tb) tb.click();
  });
  await sleep(1500);
  await page.evaluate(()=>{
    const confirmBtn = [...document.querySelectorAll('button')].find(b=> b.innerText.trim()==='TRAVEL');
    if(confirmBtn) confirmBtn.click();
  });
  await sleep(3000);
  log(`✅ سافرت ${toCity}`);
}

async function main(){
  log(`Starting Container - Bot v55.7 FIXED`);
  log(`Config: ${CONFIG.from} -> ${CONFIG.to} | Item: ${normalizeItemName(CONFIG.item)}`);

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox','--disable-setuid-sandbox','--disable-dev-shm-usage']
  });
  const page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36');

  // لو عندك لوجين حطه في Railway Variables: PD_USER و PD_PASS
  if(CONFIG.username){
    await page.goto(`${CONFIG.baseUrl}/login`, {waitUntil:'networkidle2'});
    await page.evaluate((u,p)=>{
      let userInput = document.querySelector('input[name="username"], input[name="email"], input[type="text"]');
      let passInput = document.querySelector('input[type="password"]');
      if(userInput && passInput){ userInput.value = u; passInput.value = p; }
    }, CONFIG.username, CONFIG.password);
    const btn = await page.$('button[type="submit"]');
    if(btn) await btn.click();
    await sleep(3000);
  }

  while(true){
    try{
      const hold = await getHold(page);
      log(`📍 انت في ${await getCurrentCity(page) || '??'} - شايل ${hold} - معاك £${await getMoney(page)}`);
      if(hold===0){
        const ok = await buyItem(page, CONFIG.item);
        if(!ok){ await sleep(30000); continue; }
      }
      await travelTo(page, CONFIG.to);
      let tmp = CONFIG.from; CONFIG.from = CONFIG.to; CONFIG.to = tmp;
      await sleep(10000);
    }catch(e){
      log(`❌ Error: ${e.message}`);
      await sleep(15000);
    }
  }
}
main();
