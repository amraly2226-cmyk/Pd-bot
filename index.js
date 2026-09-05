const puppeteer = require('puppeteer-core');

const USERNAME = 'amr.aly.2226@gmail.com'; 
const PASSWORD = 'Gun@12345'; 

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
    if (seconds === 0) {
        let n = str.match(/(\d+)/);
        if (n && parseInt(n[1]) > 0) seconds = parseInt(n[1]) * 60; 
    }
    return seconds;
}

(async () => {
  console.log("🚀 البوت شغال (شيكاغو ↔ سانت لويس)...");

  const browser = await puppeteer.launch({ 
    headless: true,
    executablePath: '/data/data/com.termux/files/usr/bin/chromium-browser',
    protocolTimeout: 90000,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu'] 
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 }); 
  page.setDefaultTimeout(90000);

  try {
    console.log("⏳ جاري فتح اللوجين... (مستني التحقق الأمني)");
    await page.goto('https://www.project-dark.co.uk/login', { waitUntil: 'domcontentloaded', timeout: 90000 });
    
    console.log("⏳ بنستنى 15 ثانية عشان التحقق الأمني يخلص...");
    await sleep(15000);
    
    await page.waitForSelector('input[type="text"], input[type="email"], input[type="password"]', { timeout: 30000 });

    const inputs = await page.$$('input[type="text"], input[type="email"], input[type="password"]');
    if (inputs.length >= 2) {
       await inputs[0].type(USERNAME);
       await inputs[1].type(PASSWORD);
    }
    await page.click('button[type="submit"]').catch(() => {});
    console.log("✅ كتبت البيانات، جاري الدخول...");
    
    await sleep(5000);
    await page.goto('https://www.project-dark.co.uk/blackmarket', { waitUntil: 'domcontentloaded', timeout: 90000 });
    await sleep(5000);
    console.log("✅ دخلنا السوق الأسود!");
  } catch (e) {
    console.log("⚠️ مشكلة في الدخول:", e.message);
  }

  while (true) {
    try {
      // 1) لو إحنا في صفحة السفر
      if (page.url().includes('travel')) {
        let currentCity = await page.evaluate(() => {
            let body = document.body.innerText;
            if (body.includes('CHICAGO') || body.includes('Chicago')) return 'Chicago';
            if (body.includes('ST LOUIS') || body.includes('St. Louis') || body.includes('St Louis')) return 'St. Louis';
            return null;
        });

        if (!currentCity) { await page.goto('https://project-dark.co.uk/travel', { waitUntil: 'domcontentloaded' }); await sleep(2000); continue; }

        let destCity = (currentCity === 'St. Louis' || currentCity === 'St Louis') ? 'Chicago' : 'St. Louis';

        console.log(`✈️ ${currentCity} - جاري تجهيز السفر إلى ${destCity}`);

        await page.evaluate(() => { let grid = [...document.querySelectorAll('a, span, div, button')].find(el => el.innerText.trim() === 'Grid View' && el.offsetParent !== null); if (grid) grid.click(); });
        await sleep(1500);
        await page.evaluate((city) => {
            let elements = [...document.querySelectorAll('div, span, a')];
            let textEl = elements.find(el => el.innerText.trim() === city && el.offsetParent !== null);
            if (textEl) {
                let card = textEl.closest('div');
                if (card && card.offsetWidth > 100) card.click();
                else textEl.click();
            }
        }, destCity);
        await sleep(1500);
        await page.evaluate(() => { let btn = [...document.querySelectorAll('button')].find(b => b.innerText.includes('Travel to Selected Location')); if (btn) btn.click(); });
        
        await page.waitForFunction(() => document.body.innerText.includes('Are you sure'), { timeout: 10000 }).catch(() => {});
        
        await page.evaluate(() => {
            let allBtns = [...document.querySelectorAll('button')];
            let travelBtn = allBtns.find(b => b.innerText.trim() === 'TRAVEL');
            if (travelBtn) travelBtn.click();
        });
        
        console.log(`✈️ تم الضغط على زر السفر إلى ${destCity}`);
        await sleep(7000); 
        await page.goto('https://www.project-dark.co.uk/blackmarket', { waitUntil: 'domcontentloaded' });
        await sleep(3000);
        continue;
      }

      // 2) لو إحنا في السوق
      let state = await page.evaluate((items) => {
        let body = document.body.innerText;
        let loc = null;
        let cooldownStr = null;
        
        if (body.includes('CHICAGO') || body.includes('Chicago')) loc = 'Chicago';
        else if (body.includes('ST LOUIS') || body.includes('St. Louis') || body.includes('St Louis')) loc = 'St. Louis';

        let cdMatch = body.match(/You cannot travel for:?\s*([0-9hms ]+)/i) || body.match(/Travel in\s*([0-9hms ]+)/i);
        if (cdMatch) cooldownStr = cdMatch[1];

        let hold = 0;
        let heldItem = null;
        let rows = [...document.querySelectorAll('tr')];

        for (let r of rows) {
            let rText = r.innerText;
            if (rText.includes('Sell') && !rText.includes('Confirm')) {
                for (let it of items) {
                    if (rText.toLowerCase().includes(it.toLowerCase())) {
                        let cells = [...r.querySelectorAll('td')];
                        if (cells.length >= 3) {
                            let youHaveCell = cells[2].innerText;
                            let match = youHaveCell.match(/(\d+)/);
                            if (match && +match[1] > 0) {
                                heldItem = it;
                                hold = +match[1];
                                break;
                            }
                        }
                        break;
                    }
                }
            }
        }

        if (heldItem === null) {
            let m = body.match(/holding (\d+) items/i);
            hold = m ? +m[1] : 0;
        }
        
        return { loc, cd: cooldownStr, hold, heldItem };
      }, ITEMS);

      // قراءة الكولداون
      if (state.cd) {
        let waitSeconds = parseCooldownToSeconds(state.cd);
        console.log(`⏳ في كولداون: ${state.cd} - هستنى ${Math.floor(waitSeconds / 60)} دقيقة و ${waitSeconds % 60} ثانية...`);
        await sleep(waitSeconds * 1000);
        await page.goto('https://www.project-dark.co.uk/travel', { waitUntil: 'domcontentloaded' });
        await sleep(2000);
        continue;
      }

      // ✅ شيكاغو: شراء Human Beings وبيع Endangered exotic animals
      if (state.loc === "Chicago") {
        if (state.heldItem === "Endangered exotic animals" && state.hold > 0) {
           console.log("📍 شيكاغو - بيع Endangered exotic animals");
           await page.evaluate(() => { let rows = [...document.querySelectorAll('tr')]; for (let r of rows) { if (r.innerText.includes('Endangered exotic animals') && r.innerText.includes('Sell All') && !r.innerText.includes('Confirm')) { let btn = [...r.querySelectorAll('button')].find(b => b.innerText.trim() === 'Sell All'); if (btn) { btn.click(); break; } } } });
           await sleep(2000);
           await page.waitForFunction(() => document.body.innerText.includes('Confirm Sell All'), { timeout: 5000 }).catch(() => {});
           await page.evaluate(() => { const allBtns = [...document.querySelectorAll('button')]; const confirmBtn = allBtns.find(b => b.innerText.trim() === 'SELL ALL' && b.offsetParent !== null); if (confirmBtn) confirmBtn.click(); });
           await sleep(3000);
           continue;
        }
        
        if (state.hold === 0) {
           console.log("📍 شيكاغو - شراء Human Beings");
           await page.evaluate(() => { let rows = [...document.querySelectorAll('tr')]; for (let r of rows) { if (r.innerText.includes('Human beings') && r.innerText.includes('$')) { let mb = [...r.querySelectorAll('button')].find(b => b.innerText.includes('Max Buy')); if (mb) { mb.click(); break; } } } });
           await sleep(1000);
           await page.evaluate(() => { let btn = [...document.querySelectorAll('button')].find(b => b.innerText.trim() === 'BUY MAX'); if (btn) btn.click(); });
           await sleep(3000);
           continue;
        }
        
        if (state.heldItem === "Human beings" && state.hold > 0) {
           console.log("📍 شيكاغو - رايح سانت لويس");
           await page.goto('https://www.project-dark.co.uk/travel', { waitUntil: 'domcontentloaded' });
           await sleep(2000);
           continue;
        }
      }

      // ✅ سانت لويس: شراء Endangered exotic animals وبيع Human Beings
      else if (state.loc === "St. Louis") {
        if (state.heldItem === "Human beings" && state.hold > 0) {
           console.log("📍 سانت لويس - بيع Human Beings");
           await page.evaluate(() => { let rows = [...document.querySelectorAll('tr')]; for (let r of rows) { if (r.innerText.includes('Human beings') && r.innerText.includes('Sell All') && !r.innerText.includes('Confirm')) { let btn = [...r.querySelectorAll('button')].find(b => b.innerText.trim() === 'Sell All'); if (btn) { btn.click(); break; } } } });
           await sleep(2000);
           await page.waitForFunction(() => document.body.innerText.includes('Confirm Sell All'), { timeout: 5000 }).catch(() => {});
           await page.evaluate(() => { const allBtns = [...document.querySelectorAll('button')]; const confirmBtn = allBtns.find(b => b.innerText.trim() === 'SELL ALL' && b.offsetParent !== null); if (confirmBtn) confirmBtn.click(); });
           await sleep(3000);
           continue;
        }
        
        if (state.hold === 0) {
           console.log("📍 سانت لويس - شراء Endangered exotic animals");
           await page.evaluate(() => { let rows = [...document.querySelectorAll('tr')]; for (let r of rows) { if (r.innerText.includes('Endangered exotic animals') && r.innerText.includes('$')) { let mb = [...r.querySelectorAll('button')].find(b => b.innerText.includes('Max Buy')); if (mb) { mb.click(); break; } } } });
           await sleep(1000);
           await page.evaluate(() => { let btn = [...document.querySelectorAll('button')].find(b => b.innerText.trim() === 'BUY MAX'); if (btn) btn.click(); });
           await sleep(3000);
           continue;
        }

        if (state.heldItem === "Endangered exotic animals" && state.hold > 0) {
           console.log("📍 سانت لويس - رايح شيكاغو");
           await page.goto('https://www.project-dark.co.uk/travel', { waitUntil: 'domcontentloaded' });
           await sleep(2000);
           continue;
        }
      }

    } catch (e) {
      console.log("حصل خطأ مؤقت، معيد المحاولة:", e.message);
      await sleep(15000);
    }
    await sleep(10000);
  }
})();
