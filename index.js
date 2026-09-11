const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

const USERNAME = 'amr.aly.2226@gmail.com'; 
const PASSWORD = 'Gun@12345';

const ITEMS = ["Anabolic steroid","Artifacts","Alcohol","Electronics","Plastic jewelry","Stolen paintings","Human beings","Confidential documents","Endangered exotic animals","Organs"];

async function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

(async () => {
  console.log("🚀 البوت شغال...");
  
  const launchOptions = {
    headless: false,
    args: [
      '--no-sandbox', 
      '--disable-setuid-sandbox', 
      '--disable-dev-shm-usage',
      '--disable-blink-features=AutomationControlled',
      '--window-size=1920,1080',
      '--start-maximized',
      '--disable-dbus',
      '--disable-features=dbus'
    ]
  };
  
  if (process.env.PUPPETEER_EXECUTABLE_PATH) {
    launchOptions.executablePath = process.env.PUPPETEER_EXECUTABLE_PATH;
  }
  
  const browser = await puppeteer.launch(launchOptions);
  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 }); 
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
  page.setDefaultTimeout(30000);

  // ═══════════════════════════════════════════════════════════════
  // 1) الدخول بالترتيب: Success! -> Username -> Password -> LOGIN
  // ═══════════════════════════════════════════════════════════════
  let loginSuccess = false;
  try {
      console.log("🔄 [1/5] فتح صفحة اللوجن...");
      await page.goto('https://www.project-dark.co.uk/login', { waitUntil: 'domcontentloaded', timeout: 60000 });
      await sleep(5000);

      console.log("⏳ [2/5] انتظار ظهور كلمة 'Success!' (حل الكابتشا)...");
      await page.waitForFunction(
          () => document.body.innerText.includes('Success!'),
          { timeout: 180000, polling: 1000 }
      ).catch(() => console.log("⚠️ الكابتشا واخدة وقت، هنكمل..."));
      console.log("✅ [2/5] لقينا 'Success!' - الكابتشا خلصت.");
      
      await sleep(3000);

      console.log("⏳ [3/5] التأكد إن خانات اليوزر والباسورد جاهزة...");
      await page.waitForSelector('input[type="email"]', { timeout: 15000 });
      await page.waitForSelector('input[type="password"]', { timeout: 15000 });
      console.log("✅ [3/5] الخانات جاهزة.");

      const emailInput = await page.$('input[type="email"]');
      await emailInput.click({ clickCount: 3 });
      await page.keyboard.press('Backspace');
      await emailInput.type(USERNAME, { delay: 120 });
      console.log(`✅ [4/5] تم إدخال اليوزر: ${USERNAME}`);

      const passInput = await page.$('input[type="password"]');
      await passInput.click({ clickCount: 3 });
      await page.keyboard.press('Backspace');
      await passInput.type(PASSWORD, { delay: 120 });
      console.log("✅ [4/5] تم إدخال الباسورد.");

      let stillSuccess = await page.evaluate(() => document.body.innerText.includes('Success!'));
      if (!stillSuccess) {
          console.log("⚠️ Success! اختفت، هستنى تاني...");
          await page.waitForFunction(() => document.body.innerText.includes('Success!'), { timeout: 60000 }).catch(() => {});
          await sleep(2000);
      }

      console.log("🖱️ [5/5] الضغط على زر LOGIN...");
      await page.evaluate(() => {
          let btns = [...document.querySelectorAll('button')];
          let formBtn = btns.find(b => b.innerText.trim() === 'LOGIN' && b.offsetWidth > 200);
          if (formBtn) formBtn.click();
          else {
              let anyBtn = btns.find(b => b.innerText.trim() === 'LOGIN');
              if (anyBtn) anyBtn.click();
          }
      });

      console.log("⏳ انتظار تحويل الصفحة بعد اللوجن (30 ثانية)...");
      await sleep(30000);

      let currentUrl = page.url();
      console.log(`🔗 الرابط الحالي: ${currentUrl}`);

      if (currentUrl.includes('/login')) {
          console.log("❌ لسه في صفحة اللوجن، اللوجن فشل!");
          let errText = await page.evaluate(() => {
              let body = document.body.innerText;
              let lines = body.split('\n').filter(l => l.trim().length > 0);
              return lines.slice(0, 30).join(' | ');
          });
          console.log("🔍 نص الصفحة:", errText);
      } else {
          loginSuccess = true;
          console.log("✅ اللوجن نجح! جاري الذهاب للبلاك ماركت...");
          await page.goto('https://www.project-dark.co.uk/blackmarket', { waitUntil: 'domcontentloaded', timeout: 60000 });
          await sleep(5000);
      }

  } catch (e) {
      console.log("⚠️ مشكلة في الدخول:", e.message);
  }

  // ═══════════════════════════════════════════════════════════════
  // 2) اللوب الرئيسي
  // ═══════════════════════════════════════════════════════════════
  while (true) {
    try {
      if (page.url().includes('travel')) {
        let currentCity = await page.evaluate(() => {
            let bodyText = document.body.innerText || '';
            if (/CURRENT LOCATION/i.test(bodyText)) {
                if (/NEW YORK[\s\S]*CURRENT LOCATION/i.test(bodyText)) return 'New York';
                if (/BOSTON[\s\S]*CURRENT LOCATION/i.test(bodyText)) return 'Boston';
            }
            if (/New York/i.test(bodyText)) return 'New York';
            if (/Boston/i.test(bodyText)) return 'Boston';
            return null;
        });

        let destCity = 'New York';
        if (currentCity === 'Boston') { destCity = 'New York'; console.log(`✈️ بوسطن - رايح نيويورك`); }
        else if (currentCity === 'New York') { destCity = 'Boston'; console.log(`✈️ نيويورك - رايح بوسطن`); }
        else { console.log(`⚠️ مش عارف أنا فين (${currentCity})، هروح نيويورك...`); destCity = 'New York'; }

        await page.evaluate(() => { let grid = [...document.querySelectorAll('a, span, div, button')].find(el => el.innerText.trim() === 'Grid View' && el.offsetParent !== null); if (grid) grid.click(); });
        await sleep(1500);

        await page.evaluate((city) => {
            let elements = [...document.querySelectorAll('div, span, a, button')];
            let textEl = elements.find(el => new RegExp('^' + city + '$', 'i').test((el.innerText||'').trim()) && el.offsetParent !== null);
            if (textEl) {
                let card = textEl.closest('div');
                if (card && card.offsetWidth > 100) card.click();
                else textEl.click();
            }
        }, destCity);
        await sleep(1500);

        await page.evaluate(() => { let btn = [...document.querySelectorAll('button')].find(b => b.innerText.includes('Travel to Selected Location')); if (btn) btn.click(); });
        await sleep(1500);
        await page.waitForFunction(() => document.body.innerText.includes('Are you sure'), { timeout: 15000 }).catch(() => {});
        await page.evaluate(() => { let btn = [...document.querySelectorAll('button')].find(b => b.innerText.trim() === 'TRAVEL'); if (btn) btn.click(); });
        console.log(`✈️ تم السفر لـ ${destCity}`);
        await sleep(7000); 
        await page.goto('https://www.project-dark.co.uk/blackmarket', { waitUntil: 'networkidle2' });
        await sleep(2000);
        continue;
      }

      await sleep(2000); 
      let state = await page.evaluate((items) => {
        let bodyText = document.body.innerText || '';
        let loc = null, cooldownStr = null;
        
        let titleMatch = bodyText.match(/Black Market\s*[-–—]?\s*(New York|Boston)/i);
        if (titleMatch) loc = titleMatch[1];
        else {
            let sidebarMatch = bodyText.match(/Location\s*[-–—:]?\s*(New York|Boston)/i);
            if (sidebarMatch) loc = sidebarMatch[1];
            else {
                let hasNY = /New York/i.test(bodyText), hasBos = /Boston/i.test(bodyText);
                if (hasNY && !hasBos) loc = 'New York';
                else if (hasBos && !hasNY) loc = 'Boston';
            }
        }

        let cdMatch = bodyText.match(/You cannot travel for:?\s*([0-9hms ]+)/i) || bodyText.match(/Travel in\s*([0-9hms ]+)/i);
        if (cdMatch) cooldownStr = cdMatch[1];

        let hold = 0, heldItem = null;
        let rows = [...document.querySelectorAll('tr')];
        for (let r of rows) {
            let rText = r.innerText || '';
            if (rText.includes('Sell') && !rText.includes('Confirm')) {
                for (let it of items) {
                    if (rText.toLowerCase().includes(it.toLowerCase())) {
                        let cells = [...r.querySelectorAll('td')];
                        if (cells.length >= 3) {
                            let match = (cells[2].innerText || '').match(/(\d+)/);
                            if (match && +match[1] > 0) { heldItem = it; hold = +match[1]; break; }
                        }
                        break;
                    }
                }
            }
        }
        if (heldItem === null) {
            let m = bodyText.match(/holding (\d+) items/i);
            hold = m ? +m[1] : 0;
        }
        return { loc, cd: cooldownStr, hold, heldItem, debugSnippet: bodyText.substring(0, 300) };
      }, ITEMS);

      console.log(`📍 الموقع: ${state.loc || 'غير معروف'} | كولداون: ${state.cd || 'لا يوجد'}`);
      if (!state.loc) console.log("🔍 DEBUG:", state.debugSnippet.replace(/\n/g, ' | '));

      if (state.cd) { console.log(`⏳ كولداون: ${state.cd} - هستنى دقيقة`); await sleep(60000); continue; }

      if (state.loc === "New York") {
        if (state.heldItem === "Stolen paintings" && state.hold > 0) {
           console.log("📍 نيويورك - بيع Stolen paintings");
           await page.evaluate(() => { let rows = [...document.querySelectorAll('tr')]; for (let r of rows) { if (r.innerText.includes('Sell All') && !r.innerText.includes('Confirm')) { let btn = [...r.querySelectorAll('button')].find(b => b.innerText.trim() === 'Sell All'); if (btn) { btn.click(); break; } } } });
           await sleep(2000);
           await page.waitForFunction(() => document.body.innerText.includes('Confirm Sell All'), { timeout: 5000 }).catch(() => {});
           await page.evaluate(() => { let btn = [...document.querySelectorAll('button')].find(b => b.innerText.trim() === 'SELL ALL'); if (btn) btn.click(); });
           await sleep(3000); continue;
        }
        if (state.heldItem === "Plastic jewelry" && state.hold > 0) {
           console.log("📍 نيويورك - رايح بوسطن");
           await page.goto('https://www.project-dark.co.uk/travel', { waitUntil: 'networkidle2' });
           await sleep(2500);
           let travelCd = await page.evaluate(() => { let m = document.body.innerText.match(/You cannot travel for:?\s*([0-9hms ]+)/i) || document.body.innerText.match(/Travel in\s*([0-9hms ]+)/i); return m ? m[1] : null; });
           if (travelCd) { console.log(`⏳ كولداون سفر: ${travelCd}`); await sleep(60000); continue; }
           await page.evaluate(() => { let grid = [...document.querySelectorAll('a, span, div, button')].find(el => el.innerText.trim() === 'Grid View' && el.offsetParent !== null); if (grid) grid.click(); });
           await sleep(1500);
           await page.evaluate(() => { let cards = [...document.querySelectorAll('div')]; let t = cards.find(el => /boston/i.test(el.innerText) && el.offsetWidth > 150 && el.offsetHeight > 50); if (t) t.click(); });
           await sleep(1500);
           await page.evaluate(() => { let btn = [...document.querySelectorAll('button')].find(b => b.innerText.includes('Travel to Selected Location')); if (btn) btn.click(); });
           await sleep(1500);
           await page.waitForFunction(() => document.body.innerText.includes('Are you sure'), { timeout: 15000 }).catch(() => {});
           await page.evaluate(() => { let btn = [...document.querySelectorAll('button')].find(b => b.innerText.trim() === 'TRAVEL'); if (btn) btn.click(); });
           await sleep(5000);
           await page.goto('https://www.project-dark.co.uk/blackmarket', { waitUntil: 'networkidle2' });
           await sleep(2000); continue;
        }
        if (state.hold === 0) {
           console.log("📍 نيويورك - شراء Plastic jewelry");
           await page.evaluate(() => { let rows = [...document.querySelectorAll('tr')]; for (let r of rows) { if (r.innerText.includes('Plastic jewelry') && r.innerText.includes('£')) { let mb = [...r.querySelectorAll('button')].find(b => b.innerText.includes('Max Buy')); if (mb) { mb.click(); break; } } } });
           await sleep(1000);
           await page.evaluate(() => { let btn = [...document.querySelectorAll('button')].find(b => b.innerText.trim() === 'BUY MAX'); if (btn) btn.click(); });
           await sleep(3000); continue;
        }
      }
      else if (state.loc === "Boston") {
        if (state.heldItem === "Plastic jewelry" && state.hold > 0) {
           console.log("📍 بوسطن - بيع Plastic jewelry");
           await page.evaluate(() => { let rows = [...document.querySelectorAll('tr')]; for (let r of rows) { if (r.innerText.includes('Plastic jewelry') && r.innerText.includes('Sell All') && !r.innerText.includes('Confirm')) { let btn = [...r.querySelectorAll('button')].find(b => b.innerText.trim() === 'Sell All'); if (btn) { btn.click(); break; } } } });
           await sleep(2000);
           await page.waitForFunction(() => document.body.innerText.includes('Confirm Sell All'), { timeout: 5000 }).catch(() => {});
           await page.evaluate(() => { let btn = [...document.querySelectorAll('button')].find(b => b.innerText.trim() === 'SELL ALL'); if (btn) btn.click(); });
           await sleep(3000); continue;
        }
        if (state.heldItem === "Stolen paintings" && state.hold > 0) {
           console.log("📍 بوسطن - رايح نيويورك");
           await page.goto('https://www.project-dark.co.uk/travel', { waitUntil: 'networkidle2' });
           await sleep(2500);
           let travelCd = await page.evaluate(() => { let m = document.body.innerText.match(/You cannot travel for:?\s*([0-9hms ]+)/i) || document.body.innerText.match(/Travel in\s*([0-9hms ]+)/i); return m ? m[1] : null; });
           if (travelCd) { console.log(`⏳ كولداون سفر: ${travelCd}`); await sleep(60000); continue; }
           await page.evaluate(() => { let grid = [...document.querySelectorAll('a, span, div, button')].find(el => el.innerText.trim() === 'Grid View' && el.offsetParent !== null); if (grid) grid.click(); });
           await sleep(1500);
           await page.evaluate(() => { let cards = [...document.querySelectorAll('div')]; let t = cards.find(el => /new york/i.test(el.innerText) && el.offsetWidth > 150 && el.offsetHeight > 50); if (t) t.click(); });
           await sleep(1500);
           await page.evaluate(() => { let btn = [...document.querySelectorAll('button')].find(b => b.innerText.includes('Travel to Selected Location')); if (btn) btn.click(); });
           await sleep(1500);
           await page.waitForFunction(() => document.body.innerText.includes('Are you sure'), { timeout: 15000 }).catch(() => {});
           await page.evaluate(() => { let btn = [...document.querySelectorAll('button')].find(b => b.innerText.trim() === 'TRAVEL'); if (btn) btn.click(); });
           await sleep(5000);
           await page.goto('https://www.project-dark.co.uk/blackmarket', { waitUntil: 'networkidle2' });
           await sleep(2000); continue;
        }
        if (state.hold === 0) {
           console.log("📍 بوسطن - شراء Stolen paintings");
           await page.evaluate(() => { let rows = [...document.querySelectorAll('tr')]; for (let r of rows) { if (r.innerText.includes('Stolen paintings') && r.innerText.includes('£')) { let mb = [...r.querySelectorAll('button')].find(b => b.innerText.includes('Max Buy')); if (mb) { mb.click(); break; } } } });
           await sleep(1000);
           await page.evaluate(() => { let btn = [...document.querySelectorAll('button')].find(b => b.innerText.trim() === 'BUY MAX'); if (btn) btn.click(); });
           await sleep(3000); continue;
        }
      }
      else {
          console.log(`⚠️ مدينة غير معروفة (${state.loc})، رايح نيويورك...`);
          await page.goto('https://www.project-dark.co.uk/travel', { waitUntil: 'networkidle2' });
          await sleep(3000);
          await page.evaluate(() => { let grid = [...document.querySelectorAll('a, span, div, button')].find(el => el.innerText.trim() === 'Grid View' && el.offsetParent !== null); if (grid) grid.click(); });
          await sleep(1500);
          await page.evaluate(() => { let cards = [...document.querySelectorAll('div')]; let t = cards.find(el => /new york/i.test(el.innerText) && el.offsetWidth > 150 && el.offsetHeight > 50); if (t) t.click(); });
          await sleep(1500);
          await page.evaluate(() => { let btn = [...document.querySelectorAll('button')].find(b => b.innerText.includes('Travel to Selected Location')); if (btn) btn.click(); });
          await sleep(1500);
          await page.waitForFunction(() => document.body.innerText.includes('Are you sure'), { timeout: 15000 }).catch(() => {});
          await page.evaluate(() => { let btn = [...document.querySelectorAll('button')].find(b => b.innerText.trim() === 'TRAVEL'); if (btn) btn.click(); });
          await sleep(7000);
          await page.goto('https://www.project-dark.co.uk/blackmarket', { waitUntil: 'networkidle2' });
          await sleep(2000); continue;
      }

    } catch (e) {
      console.log("خطأ مؤقت:", e.message);
      await sleep(15000);
    }
    await sleep(10000);
  }
})();
