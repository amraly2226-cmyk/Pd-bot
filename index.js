const puppeteer = require('puppeteer');

const USERNAME = 'amr.aly.2226@gmail.com'; 
const PASSWORD = 'Gun@12345';
const COOKIE_VALUE = process.env.PD_COOKIE || "";

const ITEMS = ["Anabolic steroid","Artifacts","Alcohol","Electronics","Plastic jewelry","Stolen paintings","Human beings","Confidential documents","Endangered exotic animals","Organs"];

async function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

(async () => {
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });
  page.setDefaultTimeout(15000);

  try {
    if (COOKIE_VALUE) {
        await page.setCookie({ name: 'project-dark-session', value: COOKIE_VALUE, domain: '.project-dark.co.uk' });
        await page.goto('https://www.project-dark.co.uk/blackmarket', { waitUntil: 'networkidle2' });
    } else {
        await page.goto('https://www.project-dark.co.uk/login', { waitUntil: 'networkidle2' });
        const inputs = await page.$$('input');
        if (inputs.length >= 2) { await inputs[0].type(USERNAME); await inputs[1].type(PASSWORD); }
        await page.click('button[type="submit"]').catch(() => {});
        await sleep(5000);
        await page.goto('https://www.project-dark.co.uk/blackmarket', { waitUntil: 'networkidle2' });
    }
  } catch (e) { console.log("مشكلة دخول:", e.message); }

  while (true) {
    try {
      // 1) كود صفحة السفر (منفصل تماماً عن السوق)
      if (page.url().includes('travel')) {
        let travelText = await page.evaluate(() => document.body.innerText);
        let cd = travelText.match(/You cannot travel for:?\s*([0-9hms ]+)/i) || travelText.match(/Travel in\s*([0-9hms ]+)/i);

        // لو في كولداون: اطبع وانتظر 60 ثانية وارجع للسفر
        if (cd) {
          console.log(`⏳ كولداون في السفر: ${cd[1]} - هستنى 60 ثانية`);
          await sleep(60000);
          await page.goto('https://www.project-dark.co.uk/travel');
          continue;
        }

        // لو مفيش كولداون: ابدأ السفر
        console.log("✈️ مفيش كولداون، جاري تجهيز السفر...");
        // اعرف المدينة الحالية من الرابط
        let fromCity = travelText.includes('Black Market - Tokyo') ? 'Tokyo' : 'Cairo';
        let destCity = (fromCity === 'Tokyo') ? 'Cairo' : 'Tokyo';

        // دوس Grid View
        await page.evaluate(() => { let grid = [...document.querySelectorAll('a, span, div, button')].find(el => el.innerText.trim() === 'Grid View' && el.offsetParent !== null); if (grid) grid.click(); });
        await sleep(1000);

        // دوس على المدينة
        await page.evaluate((city) => {
          let cards = [...document.querySelectorAll('div')];
          let target = cards.find(el => el.innerText.trim() === city && el.offsetWidth > 150 && el.offsetHeight > 50);
          if (target) target.click();
        }, destCity);
        await sleep(1000);

        // دوس على زر السفر والتأكيد
        await page.evaluate(() => { let b = [...document.querySelectorAll('button')].find(b => b.innerText.includes('Travel to Selected Location')); if (b) b.click(); });
        await sleep(1000);
        await page.waitForFunction(() => document.body.innerText.includes('Are you sure'), { timeout: 3000 }).catch(() => {});
        await page.evaluate(() => { let b = [...document.querySelectorAll('button')].find(b => b.innerText.trim() === 'TRAVEL' && b.offsetParent !== null); if (b) b.click(); });
        
        console.log(`✈️ تم طلب السفر لـ ${destCity}، جاري العودة للسوق`);
        await sleep(5000);
        await page.goto('https://www.project-dark.co.uk/blackmarket');
        continue;
      }

      // 2) كود السوق (الشراء والبيع)
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
        return { loc, hold, heldItem };
      }, ITEMS);

      // 3) منطق كايرو
      if (state.loc === "Cairo") {
        // لو شايل حاجة غلط (إلكترونيكس) يبيعها
        if (state.heldItem === "Electronics" && state.hold > 0) {
           console.log(`📍 كايرو - بيع ${state.hold} إلكترونيكس`);
           await page.evaluate(() => { let rows = [...document.querySelectorAll('tr')]; for (let r of rows) { if (r.innerText.includes('Electronics') && r.innerText.includes('Sell All') && !r.innerText.includes('Confirm')) { let b = [...r.querySelectorAll('button')].find(b => b.innerText.trim() === 'Sell All'); if (b) { b.click(); break; } } } });
           await sleep(2000);
           await page.waitForFunction(() => document.body.innerText.includes('Confirm Sell All'), { timeout: 5000 }).catch(() => {});
           await page.evaluate(() => { let b = [...document.querySelectorAll('button')].find(b => b.innerText.trim() === 'SELL ALL' && b.offsetParent !== null); if (b) b.click(); });
           await sleep(3000);
           continue;
        }
        
        // لو فاضي، اشترِ أنابوليك وروح فوراً للسفر
        if (state.hold === 0) {
           console.log("📍 كايرو - شراء أنابوليك، وروح فوراً للسفر");
           await page.evaluate(() => { let rows = [...document.querySelectorAll('tr')]; for (let r of rows) { if (r.innerText.includes('Anabolic steroid') && r.innerText.includes('£')) { let mb = [...r.querySelectorAll('button')].find(b => b.innerText.includes('Max Buy')); if (mb) { mb.click(); break; } } } });
           await sleep(1000);
           await page.evaluate(() => { let b = [...document.querySelectorAll('button')].find(b => b.innerText.trim() === 'BUY MAX'); if (b) b.click(); });
           await sleep(2000);
           await page.goto('https://www.project-dark.co.uk/travel'); // ⚡ لا ترجع للسوق، روح للسفر فوراً
           continue;
        }

        // لو شايل أنابوليك، روح للسفر
        if (state.heldItem === "Anabolic steroid" && state.hold > 0) {
           console.log("📍 كايرو - رايح طوكيو");
           await page.goto('https://www.project-dark.co.uk/travel');
           continue;
        }
      }

      // 4) منطق طوكيو
      else if (state.loc === "Tokyo") {
        // لو شايل أنابوليك، يبيعها
        if (state.heldItem === "Anabolic steroid" && state.hold > 0) {
           console.log("📍 طوكيو - بيع الأنابوليك");
           await page.evaluate(() => { let rows = [...document.querySelectorAll('tr')]; for (let r of rows) { if (r.innerText.includes('Anabolic steroid') && r.innerText.includes('Sell All') && !r.innerText.includes('Confirm')) { let b = [...r.querySelectorAll('button')].find(b => b.innerText.trim() === 'Sell All'); if (b) { b.click(); break; } } } });
           await sleep(2000);
           await page.waitForFunction(() => document.body.innerText.includes('Confirm Sell All'), { timeout: 5000 }).catch(() => {});
           await page.evaluate(() => { let b = [...document.querySelectorAll('button')].find(b => b.innerText.trim() === 'SELL ALL' && b.offsetParent !== null); if (b) b.click(); });
           await sleep(3000);
           continue;
        }

        // لو فاضي، اشترِ إلكترونيكس وروح فوراً للسفر
        if (state.hold === 0) {
           console.log("📍 طوكيو - شراء إلكترونيكس، وروح فوراً للسفر");
           await page.evaluate(() => { let rows = [...document.querySelectorAll('tr')]; for (let r of rows) { if (r.innerText.includes('Electronics') && r.innerText.includes('£')) { let mb = [...r.querySelectorAll('button')].find(b => b.innerText.includes('Max Buy')); if (mb) { mb.click(); break; } } } });
           await sleep(1000);
           await page.evaluate(() => { let b = [...document.querySelectorAll('button')].find(b => b.innerText.trim() === 'BUY MAX'); if (b) b.click(); });
           await sleep(2000);
           await page.goto('https://www.project-dark.co.uk/travel'); // ⚡ لا ترجع للسوق، روح للسفر فوراً
           continue;
        }

        // لو شايل إلكترونيكس، روح للسفر
        if (state.heldItem === "Electronics" && state.hold > 0) {
           console.log("📍 طوكيو - رايح كايرو");
           await page.goto('https://www.project-dark.co.uk/travel');
           continue;
        }
      }
      
    } catch (e) {
      console.log("خطأ مؤقت:", e.message);
      await sleep(15000);
    }
    await sleep(5000);
  }
})();
