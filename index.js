const puppeteer = require('puppeteer');

const USERNAME = 'amr.aly.2226@gmail.com'; 
const PASSWORD = 'Gun@12345';
const COOKIE_VALUE = process.env.PD_COOKIE || "";

const ITEMS = ["Anabolic steroid","Artifacts","Alcohol","Electronics","Plastic jewelry","Stolen paintings","Human beings","Confidential documents","Endangered exotic animals","Organs"];

async function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

// حماية: أي عملية تتجاوز 15 ثانية هتتوقف وتكمل
function withTimeout(promise, ms) {
    return Promise.race([
        promise,
        new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout")), ms))
    ]);
}

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
  console.log("🚀 البوت شغال (واشنطن ↔ سانت لويس)...");
  
  const browser = await puppeteer.launch({ 
    headless: true, 
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu'] 
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 }); 
  page.setDefaultTimeout(60000);
  
  // قبول أي نوافذ منبثقة تلقائياً
  page.on('dialog', async dialog => { await dialog.accept(); });

  try {
    if (COOKIE_VALUE) {
        await page.setCookie({ name: 'project-dark-session', value: COOKIE_VALUE, domain: '.project-dark.co.uk' });
        // ✅ تغيير حاسم: استخدام domcontentloaded بدلاً من networkidle2 (يحمي من التجمد)
        await page.goto('https://www.project-dark.co.uk/blackmarket', { waitUntil: 'domcontentloaded', timeout: 60000 });
        await sleep(3000);
        console.log("✅ دخلنا بالكوكيز");
    } else {
        await page.goto('https://www.project-dark.co.uk/login', { waitUntil: 'domcontentloaded', timeout: 60000 });
        const inputs = await page.$$('input[type="text"], input[type="email"], input[type="password"]');
        if (inputs.length >= 2) {
           await inputs[0].type(USERNAME);
           await inputs[1].type(PASSWORD);
        }
        await page.click('button[type="submit"]').catch(() => {});
        await sleep(5000);
        await page.goto('https://www.project-dark.co.uk/blackmarket', { waitUntil: 'domcontentloaded', timeout: 60000 });
    }
  } catch (e) {
    console.log("⚠️ مشكلة في الدخول:", e.message);
  }

  while (true) {
    try {
      // ✅ إعادة توجيه للسوق بشكل آمن (مش هيتجمد)
      if (page.url().includes('travel')) {
        let currentCity = await withTimeout(page.evaluate(() => {
            let body = document.body.innerText;
            let lines = body.split('\n');
            for (let i = 0; i < lines.length; i++) {
                if (lines[i].trim().toUpperCase() === 'LOCATION') {
                    for (let j = i + 1; j < lines.length; j++) {
                        if (lines[j].trim()) { 
                            let city = lines[j].trim();
                            if (city.includes('Washington')) return 'Washington';
                            if (city.includes('St. Louis')) return 'St. Louis';
                        }
                    }
                }
            }
            return null;
        }), 15000);

        if (!currentCity) { await page.goto('https://project-dark.co.uk/travel', { waitUntil: 'domcontentloaded' }); await sleep(2000); continue; }

        let destCity = (currentCity === 'St. Louis') ? 'Washington' : 'St. Louis';
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

      // 2) لو إحنا في السوق (بيع وشراء)
      let state = await withTimeout(page.evaluate((items) => {
        let body = document.body.innerText;
        let loc = null;
        let cooldownStr = null;

        // قراءة المدينة من سطر LOCATION
        let lines = body.split('\n');
        for (let i = 0; i < lines.length; i++) {
            if (lines[i].trim().toUpperCase() === 'LOCATION') {
                for (let j = i + 1; j < lines.length; j++) {
                    if (lines[j].trim()) {
                        let city = lines[j].trim();
                        if (city.includes('Washington')) loc = 'Washington';
                        else if (city.includes('St. Louis')) loc = 'St. Louis';
                        break;
                    }
                }
                break;
            }
        }

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
      }, ITEMS), 15000);

      // ✅ لو في كولداون حقيقي، انتظر
      if (state.cd) {
        let waitSeconds = parseCooldownToSeconds(state.cd);
        console.log(`⏳ في كولداون: ${state.cd} - هستنى ${Math.floor(waitSeconds / 60)} دقيقة...`);
        await sleep(waitSeconds * 1000);
        await page.goto('https://www.project-dark.co.uk/travel', { waitUntil: 'domcontentloaded' });
        await sleep(2000);
        continue;
      }

      // ✅ واشنطن: بيع Endangered exotic animals أو شراء Human Beings
      if (state.loc === "Washington") {
        if (state.heldItem === "Endangered exotic animals" && state.hold > 0) {
           console.log("📍 واشنطن - بيع Endangered exotic animals");
           await page.evaluate(() => { let rows = [...document.querySelectorAll('tr')]; for (let r of rows) { if (r.innerText.includes('Endangered exotic animals') && r.innerText.includes('Sell All') && !r.innerText.includes('Confirm')) { let btn = [...r.querySelectorAll('button')].find(b => b.innerText.trim() === 'Sell All'); if (btn) { btn.click(); break; } } } });
           await sleep(2000);
           await page.waitForFunction(() => document.body.innerText.includes('Confirm Sell All'), { timeout: 5000 }).catch(() => {});
           await page.evaluate(() => { const allBtns = [...document.querySelectorAll('button')]; const confirmBtn = allBtns.find(b => b.innerText.trim() === 'SELL ALL' && b.offsetParent !== null); if (confirmBtn) confirmBtn.click(); });
           await sleep(3000);
           continue;
        }
        
        if (state.hold === 0) {
           console.log("📍 واشنطن - شراء Human Beings");
           await page.evaluate(() => { let rows = [...document.querySelectorAll('tr')]; for (let r of rows) { if (r.innerText.includes('Human beings') && r.innerText.includes('$')) { let mb = [...r.querySelectorAll('button')].find(b => b.innerText.includes('Max Buy')); if (mb) { mb.click(); break; } } } });
           await sleep(1000);
           await page.evaluate(() => { let btn = [...document.querySelectorAll('button')].find(b => b.innerText.trim() === 'BUY MAX'); if (btn) btn.click(); });
           await sleep(3000);
           continue;
        }
        
        if (state.heldItem === "Human beings" && state.hold > 0) {
           console.log("📍 واشنطن - رايح سانت لويس");
           await page.goto('https://www.project-dark.co.uk/travel', { waitUntil: 'domcontentloaded' });
           await sleep(2500);
           
           let travelCd = await page.evaluate(() => {
               let body = document.body.innerText;
               let cdMatch = body.match(/You cannot travel for:?\s*([0-9hms ]+)/i) || body.match(/Travel in\s*([0-9hms ]+)/i);
               return cdMatch ? cdMatch[1] : null;
           });
           
           if (travelCd) {
               let waitSeconds = parseCooldownToSeconds(travelCd);
               console.log(`⏳ لقيت كولداون في السفر: ${travelCd} - هستنى ${Math.floor(waitSeconds / 60)} دقيقة...`);
               await sleep(waitSeconds * 1000);
               await page.goto('https://www.project-dark.co.uk/travel', { waitUntil: 'domcontentloaded' });
               await sleep(2000);
               continue;
           }

           await page.evaluate(() => { let elements = [...document.querySelectorAll('a, span, div, button')]; let grid = elements.find(el => el.innerText.trim() === 'Grid View' && el.offsetParent !== null); if (grid) grid.click(); });
           await sleep(1500);
           await page.evaluate(() => { let cards = [...document.querySelectorAll('div')]; let target = cards.find(el => el.innerText.trim() === 'ST LOUIS' && el.offsetWidth > 150 && el.offsetHeight > 50); if (target) target.click(); });
           await sleep(1500);
           await page.evaluate(() => { let btn = [...document.querySelectorAll('button')].find(b => b.innerText.includes('Travel to Selected Location')); if (btn) btn.click(); });
           await sleep(1500);
           await page.waitForFunction(() => document.body.innerText.includes('Are you sure'), { timeout: 10000 }).catch(() => {});
           await page.evaluate(() => { let allBtns = [...document.querySelectorAll('button')]; let travelBtn = allBtns.find(b => b.innerText.trim() === 'TRAVEL'); if (travelBtn) travelBtn.click(); });
           await sleep(5000);
           let verify = await page.evaluate(() => document.body.innerText.includes('Black Market - St. Louis'));
           if (verify) console.log("🎉 وصلنا سانت لويس!");
           else { console.log("⚠️ حصلت مشكلة، هنرجع للسوق"); await page.goto('https://www.project-dark.co.uk/blackmarket', { waitUntil: 'domcontentloaded' }); }
           continue;
        }
      }

      // ✅ سانت لويس: بيع Human Beings أو شراء Endangered exotic animals
      else if (state.loc === "St. Louis") {
        if (state.heldItem === "Human beings" && state.hold > 0) {
           console.log("📍 سانت لويس - بيع Human Beings");
           await page.evaluate(() => { const rows = [...document.querySelectorAll('tr')]; for (let r of rows) { const text = r.innerText; if (text.includes('Human beings') && text.includes('Sell All') && !text.includes('Confirm')) { const btn = [...r.querySelectorAll('button')].find(b => b.innerText.trim() === 'Sell All'); if (btn) { btn.click(); break; } } } });
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
           console.log("📍 سانت لويس - رايح واشنطن");
           await page.goto('https://www.project-dark.co.uk/travel', { waitUntil: 'domcontentloaded' });
           await sleep(2500);
           
           let travelCd = await page.evaluate(() => {
               let body = document.body.innerText;
               let cdMatch = body.match(/You cannot travel for:?\s*([0-9hms ]+)/i) || body.match(/Travel in\s*([0-9hms ]+)/i);
               return cdMatch ? cdMatch[1] : null;
           });
           
           if (travelCd) {
               let waitSeconds = parseCooldownToSeconds(travelCd);
               console.log(`⏳ لقيت كولداون في السفر: ${travelCd} - هستنى ${Math.floor(waitSeconds / 60)} دقيقة...`);
               await sleep(waitSeconds * 1000);
               await page.goto('https://www.project-dark.co.uk/travel', { waitUntil: 'domcontentloaded' });
               await sleep(2000);
               continue;
           }

           await page.evaluate(() => { let elements = [...document.querySelectorAll('a, span, div, button')]; let grid = elements.find(el => el.innerText.trim() === 'Grid View' && el.offsetParent !== null); if (grid) grid.click(); });
           await sleep(1500);
           await page.evaluate(() => { let cards = [...document.querySelectorAll('div')]; let target = cards.find(el => el.innerText.trim() === 'WASHINGTON' && el.offsetWidth > 150 && el.offsetHeight > 50); if (target) target.click(); });
           await sleep(1500);
           await page.evaluate(() => { let btn = [...document.querySelectorAll('button')].find(b => b.innerText.includes('Travel to Selected Location')); if (btn) btn.click(); });
           await sleep(1500);
           await page.waitForFunction(() => document.body.innerText.includes('Are you sure'), { timeout: 10000 }).catch(() => {});
           await page.evaluate(() => { let allBtns = [...document.querySelectorAll('button')]; let travelBtn = allBtns.find(b => b.innerText.trim() === 'TRAVEL'); if (travelBtn) travelBtn.click(); });
           await sleep(5000);
           let verify = await page.evaluate(() => document.body.innerText.includes('Black Market - Washington'));
           if (verify) console.log("🎉 وصلنا واشنطن!");
           else { console.log("⚠️ حصلت مشكلة، هنرجع للسوق"); await page.goto('https://www.project-dark.co.uk/blackmarket', { waitUntil: 'domcontentloaded' }); }
           continue;
        }
      }

    } catch (e) {
      console.log("حصل خطأ أو تجمد، معيد المحاولة:", e.message);
      await sleep(15000);
    }
    await sleep(10000);
  }
})();
