const puppeteer = require('puppeteer');

const USERNAME = 'amr.aly.2226@gmail.com'; 
const PASSWORD = 'Gun@12345';
const COOKIE_VALUE = process.env.PD_COOKIE || "";

const ITEMS = ["Anabolic steroid","Artifacts","Alcohol","Electronics","Plastic jewelry","Stolen paintings","Human beings","Confidential documents","Endangered exotic animals","Organs"];

async function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

(async () => {
  console.log("🚀 البوت شغال (واشنطن ↔ سانت لويس)...");

  // 🔥 إعدادات التخفي: تخلي الموقع ميعرفش إنه بوت
  const browser = await puppeteer.launch({ 
    headless: true, 
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu',
           '--disable-blink-features=AutomationControlled', 
           '--disable-infobars', 
           '--disable-notifications'] 
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 }); 
  page.setDefaultTimeout(60000);

  try {
    if (COOKIE_VALUE) {
        await page.setCookie({ name: 'project-dark-session', value: COOKIE_VALUE, domain: '.project-dark.co.uk' });
        await page.goto('https://www.project-dark.co.uk/blackmarket', { waitUntil: 'networkidle2', timeout: 60000 });
        await sleep(5000);
        console.log("✅ دخلنا بالكوكيز");
    } else {
        await page.goto('https://www.project-dark.co.uk/login', { waitUntil: 'networkidle2', timeout: 60000 });
        await sleep(3000);
        const inputs = await page.$$('input[type="text"], input[type="email"], input[type="password"]');
        if (inputs.length >= 2) {
           await inputs[0].type(USERNAME);
           await inputs[1].type(PASSWORD);
        }
        await page.click('button[type="submit"]').catch(() => {});
        await sleep(5000);
        await page.goto('https://www.project-dark.co.uk/blackmarket', { waitUntil: 'networkidle2', timeout: 60000 });
        await sleep(5000);
        console.log("✅ دخلنا بالدخول المباشر");
    }
  } catch (e) {
    console.log("⚠️ مشكلة في الدخول:", e.message);
  }

  while (true) {
    try {
      // 🔥 التحقق من مكاننا الحالي في الصفحة (هل هي سوق، تسجيل دخول، أو تمويه؟)
      let currentUrl = page.url();
      
      if (currentUrl.includes('login') || currentUrl.includes('cloak')) {
        console.log("⚠️ الموقع رجعنا لصفحة اللوجين أو التمويه، بنعيد تسجيل الدخول...");
        await page.goto('https://www.project-dark.co.uk/login', { waitUntil: 'domcontentloaded' });
        await sleep(3000);
        const inputs = await page.$$('input[type="text"], input[type="email"], input[type="password"]');
        if (inputs.length >= 2) {
           await inputs[0].type(USERNAME);
           await inputs[1].type(PASSWORD);
        }
        await page.click('button[type="submit"]').catch(() => {});
        await sleep(8000);
        await page.goto('https://www.project-dark.co.uk/blackmarket', { waitUntil: 'domcontentloaded' });
        await sleep(3000);
        continue;
      }

      // 🔥 انتظار ظهور المدينة (وأيضًا حماية من التجمد)
      let currentCity = await Promise.race([
        page.evaluate(() => {
          let text = document.body.innerText;
          if (text.includes('Washington')) return 'Washington';
          if (text.includes('St. Louis')) return 'St. Louis';
          return null;
        }),
        new Promise(resolve => setTimeout(() => resolve(null), 15000)) // مهلة 15 ثانية
      ]).catch(() => null);

      if (!currentCity) {
        console.log("⚠️ اللوكيشن مش ظاهر، جاري إعادة تحميل السوق...");
        await page.goto('https://project-dark.co.uk/blackmarket', { waitUntil: 'domcontentloaded' });
        await sleep(5000);
        continue;
      }

      if (page.url().includes('travel')) {
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
        
        await page.waitForFunction(() => document.body.innerText.includes('Are you sure'), { timeout: 15000 }).catch(() => {});
        await page.evaluate(() => { let allBtns = [...document.querySelectorAll('button')]; let travelBtn = allBtns.find(b => b.innerText.trim() === 'TRAVEL'); if (travelBtn) travelBtn.click(); });
        console.log(`✈️ تم الضغط على زر السفر إلى ${destCity}`);
        await sleep(7000); 
        await page.goto('https://www.project-dark.co.uk/blackmarket', { waitUntil: 'domcontentloaded' });
        await sleep(3000);
        continue;
      }

      // 2) قراءة السوق (بيع وشراء)
      let state = await Promise.race([
        page.evaluate((items) => {
          let body = document.body.innerText;
          let loc = null;
          let cooldownStr = null;

          if (body.includes('Washington')) loc = 'Washington';
          else if (body.includes('St. Louis')) loc = 'St. Louis';

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

          if (heldItem === null) { let m = body.match(/holding (\d+) items/i); hold = m ? +m[1] : 0; }
          return { loc, cd: cooldownStr, hold, heldItem };
        }, ITEMS),
        new Promise(resolve => setTimeout(() => resolve({ loc: null, cd: null, hold: 0, heldItem: null }), 15000)) 
      ]).catch(() => ({ loc: null, cd: null, hold: 0, heldItem: null }));

      if (state.cd) {
        console.log(`⏳ في كولداون: ${state.cd} - هستنى دقيقة وأعيد المحاولة...`);
        await sleep(60000);
        continue;
      }

      // ✅ واشنطن
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
           let travelCd = await page.evaluate(() => { let body = document.body.innerText; let cdMatch = body.match(/You cannot travel for:?\s*([0-9hms ]+)/i) || body.match(/Travel in\s*([0-9hms ]+)/i); return cdMatch ? cdMatch[1] : null; });
           if (travelCd) { console.log(`⏳ لقيت كولداون في السفر: ${travelCd} - هستنى دقيقة...`); await sleep(60000); continue; }

           await page.evaluate(() => { let elements = [...document.querySelectorAll('a, span, div, button')]; let grid = elements.find(el => el.innerText.trim() === 'Grid View' && el.offsetParent !== null); if (grid) grid.click(); });
           await sleep(1500);
           await page.evaluate(() => { let cards = [...document.querySelectorAll('div')]; let target = cards.find(el => el.innerText.trim() === 'ST LOUIS' && el.offsetWidth > 150 && el.offsetHeight > 50); if (target) target.click(); });
           await sleep(1500);
           await page.evaluate(() => { let btn = [...document.querySelectorAll('button')].find(b => b.innerText.includes('Travel to Selected Location')); if (btn) btn.click(); });
           await sleep(1500);
           await page.waitForFunction(() => document.body.innerText.includes('Are you sure'), { timeout: 15000 }).catch(() => {});
           await page.evaluate(() => { let allBtns = [...document.querySelectorAll('button')]; let travelBtn = allBtns.find(b => b.innerText.trim() === 'TRAVEL'); if (travelBtn) travelBtn.click(); });
           await sleep(5000);
           let verify = await page.evaluate(() => document.body.innerText.includes('Black Market - St. Louis'));
           if (verify) console.log("🎉 وصلنا سانت لويس!");
           else { console.log("⚠️ حصلت مشكلة، هنرجع للسوق"); await page.goto('https://www.project-dark.co.uk/blackmarket', { waitUntil: 'domcontentloaded' }); }
           continue;
        }
      }

      // ✅ سانت لويس
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
           let travelCd = await page.evaluate(() => { let body = document.body.innerText; let cdMatch = body.match(/You cannot travel for:?\s*([0-9hms ]+)/i) || body.match(/Travel in\s*([0-9hms ]+)/i); return cdMatch ? cdMatch[1] : null; });
           if (travelCd) { console.log(`⏳ لقيت كولداون في السفر: ${travelCd} - هستنى دقيقة...`); await sleep(60000); continue; }

           await page.evaluate(() => { let elements = [...document.querySelectorAll('a, span, div, button')]; let grid = elements.find(el => el.innerText.trim() === 'Grid View' && el.offsetParent !== null); if (grid) grid.click(); });
           await sleep(1500);
           await page.evaluate(() => { let cards = [...document.querySelectorAll('div')]; let target = cards.find(el => el.innerText.trim() === 'WASHINGTON' && el.offsetWidth > 150 && el.offsetHeight > 50); if (target) target.click(); });
           await sleep(1500);
           await page.evaluate(() => { let btn = [...document.querySelectorAll('button')].find(b => b.innerText.includes('Travel to Selected Location')); if (btn) btn.click(); });
           await sleep(1500);
           await page.waitForFunction(() => document.body.innerText.includes('Are you sure'), { timeout: 15000 }).catch(() => {});
           await page.evaluate(() => { let allBtns = [...document.querySelectorAll('button')]; let travelBtn = allBtns.find(b => b.innerText.trim() === 'TRAVEL'); if (travelBtn) travelBtn.click(); });
           await sleep(5000);
           let verify = await page.evaluate(() => document.body.innerText.includes('Black Market - Washington'));
           if (verify) console.log("🎉 وصلنا واشنطن!");
           else { console.log("⚠️ حصلت مشكلة، هنرجع للسوق"); await page.goto('https://www.project-dark.co.uk/blackmarket', { waitUntil: 'domcontentloaded' }); }
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
