const puppeteer = require('puppeteer');

// ضع بياناتك هنا (أو خليها في Railway Variables)
const USERNAME = 'amr.aly.2226@gmail.com'; 
const PASSWORD = 'Gun@12345';
const COOKIE_VALUE = process.env.PD_COOKIE || "";

const ITEMS = ["Anabolic steroid","Artifacts","Alcohol","Electronics","Plastic jewelry","Stolen paintings","Human beings","Confidential documents","Endangered exotic animals","Organs"];

async function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

(async () => {
  const browser = await puppeteer.launch({ 
    headless: true, 
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu'] 
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 }); 
  page.setDefaultTimeout(15000);

  try {
    if (COOKIE_VALUE) {
        await page.setCookie({ name: 'project-dark-session', value: COOKIE_VALUE, domain: '.project-dark.co.uk' });
        await page.goto('https://www.project-dark.co.uk/blackmarket', { waitUntil: 'networkidle2', timeout: 60000 });
    } else {
        await page.goto('https://www.project-dark.co.uk/login', { waitUntil: 'networkidle2', timeout: 60000 });
        const inputs = await page.$$('input');
        if (inputs.length >= 2) { await inputs[0].type(USERNAME); await inputs[1].type(PASSWORD); }
        await page.click('button[type="submit"]').catch(() => {});
        await sleep(5000);
        await page.goto('https://www.project-dark.co.uk/blackmarket', { waitUntil: 'networkidle2', timeout: 60000 });
    }
  } catch (e) { console.log("مشكلة دخول:", e.message); }

  while (true) {
    try {
      // 1) اقرأ حالتك (المدينة، وشايل إيه، وفي كولداون؟)
      let state = await page.evaluate((items) => {
        let body = document.body.innerText;
        let loc = null;
        let lines = body.split('\n');
        for (let i = 0; i < lines.length; i++) {
          if (lines[i].trim().toUpperCase() === 'LOCATION') {
            for (let j = i + 1; j < lines.length; j++) { if (lines[j].trim()) { loc = lines[j].trim(); break; } }
            break;
          }
        }
        if (loc && loc.includes('Cairo')) loc = 'Cairo';
        else if (loc && loc.includes('Tokyo')) loc = 'Tokyo';

        let cd = body.match(/You cannot travel for:?\s*([0-9hms ]+)/i) || body.match(/Travel in\s*([0-9hms ]+)/i);
        
        let hold = 0;
        let heldItem = null;
        let rows = [...document.querySelectorAll('tr')];
        for (let r of rows) {
          if (r.innerText.includes('Sell') && !r.innerText.includes('Confirm')) {
            for (let it of items) {
              if (r.innerText.toLowerCase().includes(it.toLowerCase())) {
                heldItem = it;
                let cells = [...r.querySelectorAll('td')];
                if (cells.length >= 3) {
                  let match = cells[2].innerText.match(/(\d+)/);
                  if (match && +match[1] > 0) { hold = +match[1]; break; }
                }
              }
            }
          }
        }
        if (heldItem === null) { let m = body.match(/holding (\d+) items/i); hold = m ? +m[1] : 0; }
        return { loc, cd: cd ? cd[1] : null, hold, heldItem };
      }, ITEMS);

      // 2) لو في كولداون: انتظر 30 ثانية وكرر (بس، من غير أي حاجات زيادة)
      if (state.cd) {
        console.log(`⏳ في كولداون: ${state.cd} - هستنى 30 ثانية`);
        await sleep(30000);
        await page.goto('https://www.project-dark.co.uk/travel', { waitUntil: 'networkidle2' });
        await sleep(2000);
        continue;
      }

      // 3) **في أي مدينة (كايرو أو طوكيو):**
      if (state.loc === "Cairo" || state.loc === "Tokyo") {
        let targetItem = (state.loc === "Tokyo") ? "Electronics" : "Anabolic steroid";
        let targetCity = (state.loc === "Tokyo") ? "Cairo" : "Tokyo";

        // **أ- لو شايل حاجة.. ابيعها كلها فوراً**
        if (state.hold > 0) {
           console.log(`📍 ${state.loc} - شايل ${state.hold} قطعة، هبيعهم كلهم`);
           await page.evaluate(() => { let rows = [...document.querySelectorAll('tr')]; for (let r of rows) { if (r.innerText.includes('Sell All') && !r.innerText.includes('Confirm')) { let b = [...r.querySelectorAll('button')].find(b => b.innerText.trim() === 'Sell All'); if (b) { b.click(); break; } } } });
           await sleep(2000);
           await page.waitForFunction(() => document.body.innerText.includes('Confirm Sell All'), { timeout: 5000 }).catch(() => {});
           await page.evaluate(() => { let b = [...document.querySelectorAll('button')].find(b => b.innerText.trim() === 'SELL ALL' && b.offsetParent !== null); if (b) b.click(); });
           await sleep(3000);
           continue;
        }
        
        // **ب- لو فاضي.. اشترِ السلعة الجديدة مرة واحدة فقط**
        if (state.hold === 0) {
           console.log(`📍 ${state.loc} - فاضي، هشتري ${targetItem} مرة واحدة`);
           await page.evaluate((item) => { let rows = [...document.querySelectorAll('tr')]; for (let r of rows) { if (r.innerText.includes(item) && r.innerText.includes('£')) { let mb = [...r.querySelectorAll('button')].find(b => b.innerText.includes('Max Buy')); if (mb) { mb.click(); break; } } } }, targetItem);
           await sleep(1000);
           await page.evaluate(() => { let b = [...document.querySelectorAll('button')].find(b => b.innerText.trim() === 'BUY MAX'); if (b) b.click(); });
           await sleep(2000);
           console.log(`✅ اشتريت ${targetItem}، رايح ${targetCity}`);
           await page.goto('https://www.project-dark.co.uk/travel', { waitUntil: 'networkidle2' });
           await sleep(2000);
           continue;
        }
      }

      // 4) **لما تروح لصفحة السفر وتسافر:**
      if (page.url().includes('travel')) {
         console.log("✈️ جاري تجهيز السفر...");
         // لو كولداون لسه موجود، انتظر وارجع
         let travelCd = await page.evaluate(() => { let body = document.body.innerText; let m = body.match(/You cannot travel for:?\s*([0-9hms ]+)/i) || body.match(/Travel in\s*([0-9hms ]+)/i); return m ? m[1] : null; });
         if (travelCd) { continue; }

         let currentCity = state.loc;
         let destCity = (currentCity === "Tokyo") ? "Cairo" : "Tokyo";

         // دوس Grid View، اختار المدينة، دوس السفر
         await page.evaluate(() => { let grid = [...document.querySelectorAll('a, span, div, button')].find(el => el.innerText.trim() === 'Grid View' && el.offsetParent !== null); if (grid) grid.click(); });
         await sleep(1000);
         
         await page.evaluate((city) => {
            let elements = [...document.querySelectorAll('div')];
            let target = elements.find(el => el.innerText.trim() === city && el.offsetWidth > 150 && el.offsetHeight > 50);
            if (target) target.click();
         }, destCity);
         await sleep(1000);
         
         await page.evaluate(() => { let b = [...document.querySelectorAll('button')].find(b => b.innerText.includes('Travel to Selected Location')); if (b) b.click(); });
         await sleep(1000);
         
         await page.waitForFunction(() => document.body.innerText.includes('Are you sure'), { timeout: 3000 }).catch(() => {});
         await page.evaluate(() => { let b = [...document.querySelectorAll('button')].find(b => b.innerText.trim() === 'TRAVEL' && b.offsetParent !== null); if (b) b.click(); });
         
         console.log(`✈️ طلبت السفر لـ ${destCity}`);
         await sleep(5000);
         // بعد ما يسافر، روح للسوق على طول عشان تبدأ دورة البيع والشراء الجديدة
         await page.goto('https://www.project-dark.co.uk/blackmarket', { waitUntil: 'networkidle2' });
         continue;
      }
      
    } catch (e) {
      console.log("حصل خطأ مؤقت:", e.message);
      await sleep(15000);
    }
    await sleep(3000);
  }
})();
