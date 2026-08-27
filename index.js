const puppeteer = require('puppeteer');

const USERNAME = 'amr.aly.2226@gmail.com'; 
const PASSWORD = 'Gun@12345';
const COOKIE_VALUE = process.env.PD_COOKIE || "";

const ITEMS = ["Anabolic steroid","Artifacts","Alcohol","Electronics","Plastic jewelry","Stolen paintings","Human beings","Confidential documents","Endangered exotic animals","Organs"];

async function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

function parseCooldownToSeconds(str) {
    if (!str) return 0;
    let h = str.match(/(\d+)\s*h/);
    let m = str.match(/(\d+)\s*m/);
    let s = str.match(/(\d+)\s*s/);
    let seconds = 0;
    if (h) seconds += parseInt(h[1]) * 3600;
    if (m) seconds += parseInt(m[1]) * 60;
    if (s) seconds += parseInt(s[1]);
    if (seconds === 0) { let n = str.match(/(\d+)/); if (n && parseInt(n[1]) > 0) seconds = parseInt(n[1]) * 60; }
    return seconds;
}

(async () => {
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu'] });
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
      if (page.url().includes('travel')) {
        let travelText = await page.evaluate(() => document.body.innerText);
        let cd = travelText.match(/You cannot travel for:?\s*([0-9hms ]+)/i) || travelText.match(/Travel in\s*([0-9hms ]+)/i);
        if (parseCooldownToSeconds(cd ? cd[1] : null) > 0) {
          console.log(`⏳ كولداون: ${cd[1]} - هستنى دقيقة`);
          await sleep(60000);
          await page.goto('https://www.project-dark.co.uk/travel');
          continue;
        }

        let fromCity = travelText.includes('Black Market - Tokyo') ? 'Tokyo' : 'Cairo';
        let destCity = (fromCity === 'Tokyo') ? 'Cairo' : 'Tokyo';

        console.log(`✈️ ${fromCity} - جاري تجهيز السفر إلى ${destCity}`);

        // 1) التحول لوضع Grid View
        await page.evaluate(() => { let grid = [...document.querySelectorAll('a, span, div, button')].find(el => el.innerText.trim() === 'Grid View' && el.offsetParent !== null); if (grid) grid.click(); });
        await sleep(2000);

        // 2) اختيار الكارت بتاع البلد
        await page.evaluate((city) => {
            let cards = [...document.querySelectorAll('div')];
            let target = cards.find(el => el.innerText.trim().startsWith(city) && el.offsetWidth > 100 && el.offsetHeight > 50);
            if (target) target.click();
        }, destCity);
        await sleep(1500);

        // 3) الضغط على Travel to Selected Location
        await page.evaluate(() => { let b = [...document.querySelectorAll('button')].find(b => b.innerText.includes('Travel to Selected Location')); if (b) b.click(); });
        await sleep(1500);

        // 🔥 (التعديل الوحيد هنا): انتظر 15 ثانية كاملة، وجرب النقر المباشر لو فشلت المهلة
        try {
            await page.waitForFunction(() => document.body.innerText.includes('Are you sure'), { timeout: 15000 });
            await page.evaluate(() => {
                let allBtns = [...document.querySelectorAll('button')];
                let travelBtn = allBtns.find(b => b.innerText.trim() === 'TRAVEL' && b.offsetParent !== null);
                if (travelBtn) travelBtn.click();
            });
            console.log(`✈️ تم الضغط على زر TRAVEL في النافذة لـ ${destCity}`);
        } catch (e) {
            console.log("⚠️ النافذة ما ظهرتش، بجرب النقر المباشر تاني...");
            await page.evaluate(() => {
                let btn = [...document.querySelectorAll('button')].find(b => b.innerText.trim() === 'TRAVEL');
                if (btn) btn.click();
            });
        }
        // 🔥 نهاية التعديل

        await sleep(7000);
        await page.goto('https://www.project-dark.co.uk/blackmarket');
        continue;
      }

      // كود السوق (لم يتم تعديله نهائياً)
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

      if (parseCooldownToSeconds(state.cd) > 0) {
        await sleep(60000);
        await page.goto('https://www.project-dark.co.uk/travel');
        continue;
      }

      if (state.loc === "Cairo") {
        if (state.heldItem === "Anabolic steroid" && state.hold > 0) {
           console.log("📍 كايرو - شاري أنابوليك، جاري الانتقال للسفر فوراً...");
           await page.goto('https://www.project-dark.co.uk/travel');
           continue;
        }
        if (state.hold === 0) {
           console.log("📍 كايرو - شراء أنابوليك، وروح للسفر فوراً");
           await page.evaluate(() => { let rows = [...document.querySelectorAll('tr')]; for (let r of rows) { if (r.innerText.includes('Anabolic steroid') && r.innerText.includes('£')) { let mb = [...r.querySelectorAll('button')].find(b => b.innerText.includes('Max Buy')); if (mb) { mb.click(); break; } } } });
           await sleep(1000);
           await page.evaluate(() => { let btn = [...document.querySelectorAll('button')].find(b => b.innerText.trim() === 'BUY MAX'); if (btn) btn.click(); });
           await sleep(2000);
           await page.goto('https://www.project-dark.co.uk/travel');
           continue;
        }
        if (state.heldItem === "Electronics" && state.hold > 0) {
           console.log("📍 كايرو - بيع الإلكترونيكس، وروح للسفر");
           await page.evaluate(() => { let rows = [...document.querySelectorAll('tr')]; for (let r of rows) { if (r.innerText.includes('Sell All') && !r.innerText.includes('Confirm')) { let b = [...r.querySelectorAll('button')].find(b => b.innerText.trim() === 'Sell All'); if (b) { b.click(); break; } } } });
           await sleep(2000);
           await page.waitForFunction(() => document.body.innerText.includes('Confirm Sell All'), { timeout: 5000 }).catch(() => {});
           await page.evaluate(() => { let b = [...document.querySelectorAll('button')].find(b => b.innerText.trim() === 'SELL ALL' && b.offsetParent !== null); if (b) b.click(); });
           await sleep(3000);
           await page.goto('https://www.project-dark.co.uk/travel');
           continue;
        }
      }

      else if (state.loc === "Tokyo") {
        if (state.heldItem === "Electronics" && state.hold > 0) {
           console.log("📍 طوكيو - شاري إلكترونيكس، جاري الانتقال للسفر فوراً...");
           await page.goto('https://www.project-dark.co.uk/travel');
           continue;
        }
        if (state.hold === 0) {
           console.log("📍 طوكيو - شراء إلكترونيكس، وروح للسفر فوراً");
           await page.evaluate(() => { let rows = [...document.querySelectorAll('tr')]; for (let r of rows) { if (r.innerText.includes('Electronics') && r.innerText.includes('£')) { let mb = [...r.querySelectorAll('button')].find(b => b.innerText.includes('Max Buy')); if (mb) { mb.click(); break; } } } });
           await sleep(1000);
           await page.evaluate(() => { let btn = [...document.querySelectorAll('button')].find(b => b.innerText.trim() === 'BUY MAX'); if (btn) btn.click(); });
           await sleep(2000);
           await page.goto('https://www.project-dark.co.uk/travel');
           continue;
        }
        if (state.heldItem === "Anabolic steroid" && state.hold > 0) {
           console.log("📍 طوكيو - بيع الأنابوليك، وروح للسفر");
           await page.evaluate(() => { let rows = [...document.querySelectorAll('tr')]; for (let r of rows) { if (r.innerText.includes('Anabolic steroid') && r.innerText.includes('Sell All') && !r.innerText.includes('Confirm')) { let b = [...r.querySelectorAll('button')].find(b => b.innerText.trim() === 'Sell All'); if (b) { b.click(); break; } } } });
           await sleep(2000);
           await page.waitForFunction(() => document.body.innerText.includes('Confirm Sell All'), { timeout: 5000 }).catch(() => {});
           await page.evaluate(() => { let b = [...document.querySelectorAll('button')].find(b => b.innerText.trim() === 'SELL ALL' && b.offsetParent !== null); if (b) b.click(); });
           await sleep(3000);
           await page.goto('https://www.project-dark.co.uk/travel');
           continue;
        }
      }

    } catch (e) {
      console.log("خطأ مؤقت:", e.message);
      await sleep(15000);
    }
    await sleep(2000);
  }
})();
