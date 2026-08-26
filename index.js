const puppeteer = require('puppeteer');

// البيانات من Railway Variables
const COOKIE = process.env.PD_COOKIE; 

const ITEMS = ["Anabolic steroid","Artifacts","Alcohol","Electronics","Plastic jewelry","Stolen paintings","Human beings","Confidential documents","Endangered exotic animals","Organs"];
let step = 'buy'; 
let targetCity = "Cairo"; // عدلها حسب مدينتك
let targetItem = "Electronics"; // عدلها حسب السلعة

async function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

(async () => {
  console.log("🚀 البوت شغال في الخلفية...");
  
  const browser = await puppeteer.launch({ 
    headless: true, 
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'] 
  });
  const page = await browser.newPage();

  // =====================================================================
  // ✅ (مهم جداً) السطر ده هو اللي بيسجل الدخول بالكوكي، تأكد إنه موجود زي ما هو:
  await page.setCookie({ name: 'project-dark-session', value: COOKIE, domain: '.project-dark.co.uk' });
  // =====================================================================

  await page.goto('https://www.project-dark.co.uk/blackmarket', { waitUntil: 'networkidle2' });
  console.log("✅ دخلنا السوق الأسود بـ Cookies");

  // اللوب الرئيسي
  while (true) {
    try {
      let state = await page.evaluate(() => {
        let body = document.body.innerText;
        let cd = body.match(/You cannot travel for:?\s*([0-9hms ]+)/i);
        let holdMatch = body.match(/holding (\d+) items/i); 
        return { body, cd: cd ? cd[1] : null, hold: holdMatch ? +holdMatch[1] : 0 };
      });

      if (state.cd) {
        console.log(`⏳ كولداون: ${state.cd}`);
        if (!page.url().includes('travel')) {
           await page.evaluate(() => { let a = [...document.querySelectorAll('a')].find(x => x.innerText.trim() === 'Travel'); if (a) a.click(); });
           await sleep(2000);
        }
        await sleep(10000);
        continue;
      }

      if (step === 'buy') {
        if (!page.url().includes('blackmarket')) {
          await page.evaluate(() => { let a = [...document.querySelectorAll('a')].find(x => x.innerText.includes('Blackmarket')); if (a) a.click(); });
          await sleep(2000);
          continue;
        }

        let actionResult = await page.evaluate((items, targetItem) => {
          let rows = [...document.querySelectorAll('tr')];
          let heldItem = null;
          for (let r of rows) {
             if (r.innerText.includes('Sell All') && !r.innerText.includes('Confirm')) {
                let txt = r.innerText.toLowerCase();
                for (let it of items) if (txt.includes(it.toLowerCase())) { heldItem = it; break; }
                break;
             }
          }
          if (heldItem && heldItem !== targetItem) {
             for (let r of rows) {
                if (r.innerText.includes('Sell All') && !r.innerText.includes('Confirm')) {
                   let btn = [...r.querySelectorAll('button')].find(b => b.innerText.trim() === 'Sell All');
                   if (btn) { btn.click(); return `بيع الصنف الغلط (${heldItem})...`; }
                }
             }
          }
          if (!heldItem) {
             for (let r of rows) {
                if (r.innerText.includes(targetItem) && r.innerText.includes('£')) {
                   let mb = [...r.querySelectorAll('button')].find(b => b.innerText.includes('Max Buy'));
                   if (mb) { mb.click(); return `شراء ${targetItem}...`; }
                }
             }
          }
          return "في انتظار الصفقة...";
        }, ITEMS, targetItem);

        console.log(actionResult);
        await sleep(2000);
        if (state.hold > 0) step = 'travel';
      }

      if (step === 'travel') {
         if (!page.url().includes('travel')) {
            await page.evaluate(() => { let a = [...document.querySelectorAll('a')].find(x => x.innerText.trim() === 'Travel'); if (a) a.click(); });
            await sleep(2000);
            continue;
         }
         console.log(`✈️ هسافر لـ ${targetCity}...`);
         await page.evaluate((city) => {
            let allEls = [...document.querySelectorAll('*')];
            let targetEl = allEls.find(e => e.children.length === 0 && e.innerText.trim().toUpperCase() === city.toUpperCase() && e.offsetParent !== null);
            if (targetEl) targetEl.click();
         }, targetCity);
         await sleep(1500);
         await page.evaluate(() => {
            let tb = [...document.querySelectorAll('button')].find(b => b.innerText.includes('Travel to Selected Location'));
            if (tb) { tb.click(); setTimeout(() => { let cb = [...document.querySelectorAll('button')].find(b => b.innerText.trim() === 'TRAVEL'); if (cb) cb.click(); }, 1200); }
         });
         console.log(`✅ وصلت ${targetCity}... رجعنا للسوق`);
         step = 'buy';
         await sleep(3000);
         await page.evaluate(() => { let a = [...document.querySelectorAll('a')].find(x => x.innerText.includes('Blackmarket')); if (a) a.click(); });
      }

    } catch (e) {
      console.log("حصل خطأ مؤقت، هعيد المحاولة بعد 15 ثانية:", e.message);
      await sleep(15000);
    }
    await sleep(10000);
  }
})();
