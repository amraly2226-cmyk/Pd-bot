const puppeteer = require('puppeteer');

const USERNAME = 'amr.aly.2226@gmail.com'; 
const PASSWORD = 'Gun@12345';
const COOKIE_VALUE = process.env.PD_COOKIE || "";

const ITEMS = ["Anabolic steroid","Artifacts","Alcohol","Electronics","Plastic jewelry","Stolen paintings","Human beings","Confidential documents","Endangered exotic animals","Organs"];

async function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

(async () => {
  console.log("🚀 البوت شغال...");
  
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
        console.log("✅ دخلنا بالكوكيز");
    } else {
        await page.goto('https://www.project-dark.co.uk/login', { waitUntil: 'networkidle2', timeout: 60000 });
        const inputs = await page.$$('input[type="text"], input[type="email"], input[type="password"]');
        if (inputs.length >= 2) {
           await inputs[0].type(USERNAME);
           await inputs[1].type(PASSWORD);
        }
        await page.click('button[type="submit"]').catch(() => {});
        await sleep(5000);
        await page.goto('https://www.project-dark.co.uk/blackmarket', { waitUntil: 'networkidle2', timeout: 60000 });
    }
  } catch (e) {
    console.log("⚠️ مشكلة في الدخول:", e.message);
  }

  while (true) {
    try {
      // ═══════════════════════════════════════════════════════════════
      // 1) لو إحنا في صفحة الترافل (نفذ السفر بالطريقة الصح 100%)
      // ═══════════════════════════════════════════════════════════════
      if (page.url().includes('travel')) {
        // استخراج المدينة من كلمة "Location" كما تظهر في الصورة
        let currentCity = await page.evaluate(() => {
            let body = document.body.innerText;
            let lines = body.split('\n');
            let city = null;
            for (let i = 0; i < lines.length; i++) {
                if (lines[i].trim().toUpperCase() === 'LOCATION') {
                    for (let j = i + 1; j < lines.length; j++) {
                        let line = lines[j].trim();
                        if (line && !line.includes('Stamina') && !line.includes('Tokens') && !line.includes(':')) {
                            city = line;
                            break;
                        }
                    }
                    break;
                }
            }
            // إذا لم نجد، نبحث في النص الكامل
            if (!city) {
                let lowerBody = body.toLowerCase();
                if (lowerBody.includes('washington')) city = 'Washington';
                else if (lowerBody.includes('st. louis') || lowerBody.includes('st louis')) city = 'St. Louis';
            }
            return city;
        });

        if (!currentCity) { 
            console.log("⚠️ مش عارف المدينة في صفحة السفر، هروح للسوق");
            await page.goto('https://project-dark.co.uk/blackmarket'); 
            continue; 
        }

        let destCity = (currentCity === 'Washington') ? 'St. Louis' : 'Washington';
        console.log(`✈️ ${currentCity} - جاري تجهيز السفر إلى ${destCity}`);

        // 1) اختيار جرايد فيو
        await page.evaluate(() => { let grid = [...document.querySelectorAll('a, span, div, button')].find(el => el.innerText.trim() === 'Grid View' && el.offsetParent !== null); if (grid) grid.click(); });
        await sleep(1500);

        // 2) اختيار البلد من البطاقة
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

        // 3) الضغط على Travel to Selected Location
        await page.evaluate(() => { let btn = [...document.querySelectorAll('button')].find(b => b.innerText.includes('Travel to Selected Location')); if (btn) btn.click(); });
        
        // 4) انتظار ظهور البوباب (Are you sure)
        await page.waitForFunction(() => document.body.innerText.includes('Are you sure'), { timeout: 15000 }).catch(() => {});

        // ⚡ الخطوة الأهم: البحث عن زر TRAVEL في النافذة والضغط عليه (بدون offsetParent لتفادي أي مشاكل)
        await page.evaluate(() => {
            let allBtns = [...document.querySelectorAll('button')];
            let travelBtn = allBtns.find(b => b.innerText.trim() === 'TRAVEL');
            if (travelBtn) travelBtn.click();
        });
        
        console.log(`✈️ تم الضغط على زر TRAVEL في النافذة لـ ${destCity}`);
        await sleep(7000); // انتظار تحميل المدينة الجديدة
        await page.goto('https://www.project-dark.co.uk/blackmarket');
        continue;
      }

      // ═══════════════════════════════════════════════════════════════
      // 2) لو إحنا في السوق (بيع وشراء)
      // ═══════════════════════════════════════════════════════════════
      let state = await page.evaluate((items) => {
        let body = document.body.innerText;
        let loc = null;
        let cooldownStr = null;
        
        // استخراج المدينة من كلمة "Location" كما تظهر في الصورة
        let lines = body.split('\n');
        for (let i = 0; i < lines.length; i++) {
            if (lines[i].trim().toUpperCase() === 'LOCATION') {
                for (let j = i + 1; j < lines.length; j++) {
                    let line = lines[j].trim();
                    if (line && !line.includes('Stamina') && !line.includes('Tokens') && !line.includes(':')) {
                        loc = line;
                        break;
                    }
                }
                break;
            }
        }
        // إذا لم نجد، نبحث في النص الكامل
        if (!loc) {
            let lowerBody = body.toLowerCase();
            if (lowerBody.includes('washington')) loc = 'Washington';
            else if (lowerBody.includes('st. louis') || lowerBody.includes('st louis')) loc = 'St. Louis';
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
      }, ITEMS);

      // ✅ لو في كولداون حقيقي (أكبر من 00)، انتظر. لو 00 كمّل فوراً
      if (state.cd) {
        console.log(`⏳ في كولداون: ${state.cd} - هستنى دقيقة وأعيد المحاولة...`);
        await sleep(60000);
        continue;
      }

      // ✅ سانت لويس: بيع الإلكترونيكس أو شراء الأنابوليك
      if (state.loc === "St. Louis") {
        if (state.heldItem === "Electronics" && state.hold > 0) {
           console.log("📍 سانت لويس - بيع الإلكترونيكس");
           await page.evaluate(() => { let rows = [...document.querySelectorAll('tr')]; for (let r of rows) { if (r.innerText.includes('Sell All') && !r.innerText.includes('Confirm')) { let btn = [...r.querySelectorAll('button')].find(b => b.innerText.trim() === 'Sell All'); if (btn) { btn.click(); break; } } } });
           await sleep(2000);
           await page.waitForFunction(() => document.body.innerText.includes('Confirm Sell All'), { timeout: 5000 }).catch(() => {});
           await page.evaluate(() => { const allBtns = [...document.querySelectorAll('button')]; const confirmBtn = allBtns.find(b => b.innerText.trim() === 'SELL ALL' && b.offsetParent !== null); if (confirmBtn) confirmBtn.click(); });
           await sleep(3000);
           continue;
        }
        
        if (state.hold === 0) {
           console.log("📍 سانت لويس - شراء أنابوليك سترويدز");
           await page.evaluate(() => { let rows = [...document.querySelectorAll('tr')]; for (let r of rows) { if (r.innerText.includes('Anabolic steroid') && r.innerText.includes('£')) { let mb = [...r.querySelectorAll('button')].find(b => b.innerText.includes('Max Buy')); if (mb) { mb.click(); break; } } } });
           await sleep(1000);
           await page.evaluate(() => { let btn = [...document.querySelectorAll('button')].find(b => b.innerText.trim() === 'BUY MAX'); if (btn) btn.click(); });
           await sleep(3000);
           continue;
        }
        
        if (state.heldItem === "Anabolic steroid" && state.hold > 0) {
           console.log("📍 سانت لويس - رايح واشنطن");
           await page.goto('https://www.project-dark.co.uk/travel', { waitUntil: 'networkidle2' });
           await sleep(2500);
           
           let travelCd = await page.evaluate(() => {
               let body = document.body.innerText;
               let cdMatch = body.match(/You cannot travel for:?\s*([0-9hms ]+)/i) || body.match(/Travel in\s*([0-9hms ]+)/i);
               return cdMatch ? cdMatch[1] : null;
           });
           
           if (travelCd) {
               console.log(`⏳ لقيت كولداون في السفر: ${travelCd} - هستنى دقيقة...`);
               await sleep(60000);
               continue;
           }

           // السفر بطريقتك، لكن بمهلة أطول للنافذة
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
           else { console.log("⚠️ حصلت مشكلة، هنرجع للسوق"); await page.goto('https://www.project-dark.co.uk/blackmarket', { waitUntil: 'networkidle2' }); }
           continue;
        }
      }

      // ✅ واشنطن: بيع الأنابوليك، أو شراء الإلكترونيكس، أو السفر لسانت لويس
      else if (state.loc === "Washington") {
        if (state.heldItem === "Anabolic steroid" && state.hold > 0) {
           console.log("📍 واشنطن - بيع الأنابوليك سترويدز");
           await page.evaluate(() => { const rows = [...document.querySelectorAll('tr')]; for (let r of rows) { const text = r.innerText; if (text.includes('Anabolic steroid') && text.includes('Sell All') && !text.includes('Confirm')) { const btn = [...r.querySelectorAll('button')].find(b => b.innerText.trim() === 'Sell All'); if (btn) { btn.click(); break; } } } });
           await sleep(2000);
           await page.waitForFunction(() => document.body.innerText.includes('Confirm Sell All'), { timeout: 5000 }).catch(() => {});
           await page.evaluate(() => { const allBtns = [...document.querySelectorAll('button')]; const confirmBtn = allBtns.find(b => b.innerText.trim() === 'SELL ALL' && b.offsetParent !== null); if (confirmBtn) confirmBtn.click(); });
           await sleep(3000);
           continue;
        }
        
        if (state.hold === 0) {
           console.log("📍 واشنطن - شراء إلكترونيكس");
           await page.evaluate(() => { let rows = [...document.querySelectorAll('tr')]; for (let r of rows) { if (r.innerText.includes('Electronics') && r.innerText.includes('£')) { let mb = [...r.querySelectorAll('button')].find(b => b.innerText.includes('Max Buy')); if (mb) { mb.click(); break; } } } });
           await sleep(1000);
           await page.evaluate(() => { let btn = [...document.querySelectorAll('button')].find(b => b.innerText.trim() === 'BUY MAX'); if (btn) btn.click(); });
           await sleep(3000);
           continue;
        }

        if (state.heldItem === "Electronics" && state.hold > 0) {
           console.log("📍 واشنطن - رايح سانت لويس (سأقرأ الكولداون أولاً)");
           await page.goto('https://www.project-dark.co.uk/travel', { waitUntil: 'networkidle2' });
           await sleep(2500);
           
           let travelCd = await page.evaluate(() => {
               let body = document.body.innerText;
               let cdMatch = body.match(/You cannot travel for:?\s*([0-9hms ]+)/i) || body.match(/Travel in\s*([0-9hms ]+)/i);
               return cdMatch ? cdMatch[1] : null;
           });
           
           if (travelCd) {
               console.log(`⏳ لقيت كولداون في السفر: ${travelCd} - هستنى دقيقة...`);
               await sleep(60000);
               continue;
           }

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
           else { console.log("⚠️ حصلت مشكلة، هنرجع للسوق"); await page.goto('https://www.project-dark.co.uk/blackmarket', { waitUntil: 'networkidle2' }); }
           continue;
        }
      }
      
      else {
          console.log("⚠️ مش لاقي المدينة، بجرب تاني...");
          await sleep(5000);
          continue;
      }

    } catch (e) {
      console.log("حصل خطأ مؤقت، معيد المحاولة:", e.message);
      await sleep(15000);
    }
    await sleep(10000);
  }
})();
