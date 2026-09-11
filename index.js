const puppeteer = require('puppeteer');

const USERNAME = 'amr.aly.2226@gmail.com'; 
const PASSWORD = 'Gun@12345';

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
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36');
  page.setDefaultTimeout(15000);

  // ═══════════════════════════════════════════════════════════════
  // 1) الدخول (نروح مباشرة لصفحة /login)
  // ═══════════════════════════════════════════════════════════════
  try {
      console.log("🔄 جاري فتح صفحة اللوجن مباشرة...");
      await page.goto('https://www.project-dark.co.uk/login', { waitUntil: 'networkidle2', timeout: 60000 });
      await sleep(3000);

      console.log("⏳ انتظار ظهور كلمة Success! (حل الكابتشا)...");
      // بنستنى لحد 90 ثانية عشان Cloudflare تخلص وتظهر كلمة Success!
      await page.waitForFunction(() => {
          return document.body.innerText.includes('Success!');
      }, { timeout: 90000 }).catch(() => console.log("⚠️ الكابتشا واخدة وقت، هنكمل..."));

      console.log("✅ الكابتشا خلصت، جاري كتابة اليوزر والباسورد...");
      await sleep(2000);

      // استنى ظهور خانات الإدخال
      await page.waitForSelector('input[type="email"], input[type="text"]', { timeout: 10000 }).catch(() => {});

      const inputs = await page.$$('input[type="text"], input[type="email"], input[type="password"]');
      console.log(`📝 عدد الخانات اللي لقيتها: ${inputs.length}`);
      
      if (inputs.length >= 2) {
          await inputs[0].click({ clickCount: 3 });
          await inputs[0].type(USERNAME, { delay: 150 });
          console.log("✅ تم إدخال اليوزر نيم");
          
          await inputs[1].click({ clickCount: 3 });
          await inputs[1].type(PASSWORD, { delay: 150 });
          console.log("✅ تم إدخال الباسورد");
      } else {
          console.log("⚠️ مش لاقي خانات اليوزر والباسورد!");
      }

      // الضغط على زر LOGIN
      await page.evaluate(() => {
          let btns = [...document.querySelectorAll('button')];
          let loginBtn = btns.find(b => b.innerText.trim() === 'LOGIN');
          if (loginBtn) loginBtn.click();
      });
      console.log("🖱️ تم الضغط على زر LOGIN، جاري الانتظار...");
      await sleep(12000);

      // ✅ الذهاب مباشرة للبلاك ماركت
      console.log("🔄 جاري الذهاب لصفحة البلاك ماركت...");
      await page.goto('https://www.project-dark.co.uk/blackmarket', { waitUntil: 'networkidle2', timeout: 60000 });
      await sleep(5000);

      if (page.url().includes('login')) {
          console.log("❌ فشل الدخول، ممكن البيانات غلط أو الكابتشا.");
      } else {
          console.log("✅ تم الدخول بنجاح، الصفحة جاهزة.");
      }

  } catch (e) {
      console.log("⚠️ مشكلة في الدخول:", e.message);
  }

  // ═══════════════════════════════════════════════════════════════
  // 2) اللوب الرئيسي
  // ═══════════════════════════════════════════════════════════════
  while (true) {
    try {
      // لو إحنا في صفحة الترافل
      if (page.url().includes('travel')) {
        let currentCity = await page.evaluate(() => {
            let bodyText = document.body.innerText || document.body.textContent || '';
            if (/CURRENT LOCATION/i.test(bodyText)) {
                if (/NEW YORK[\s\S]*CURRENT LOCATION/i.test(bodyText)) return 'New York';
                if (/BOSTON[\s\S]*CURRENT LOCATION/i.test(bodyText)) return 'Boston';
            }
            if (/New York/i.test(bodyText)) return 'New York';
            if (/Boston/i.test(bodyText)) return 'Boston';
            return null;
        });

        let destCity = 'New York';
        if (currentCity === 'Boston') {
            destCity = 'New York';
            console.log(`✈️ بوسطن - جاري تجهيز السفر إلى نيويورك`);
        } else if (currentCity === 'New York') {
            destCity = 'Boston';
            console.log(`✈️ نيويورك - جاري تجهيز السفر إلى بوسطن`);
        } else {
            console.log(`⚠️ مش عارف أنا فين بالظبط (${currentCity || 'غير معروف'})، بس هجرب أسافر لنيويورك...`);
            destCity = 'New York';
        }

        await page.evaluate(() => { let grid = [...document.querySelectorAll('a, span, div, button')].find(el => el.innerText.trim() === 'Grid View' && el.offsetParent !== null); if (grid) grid.click(); });
        await sleep(1500);

        await page.evaluate((city) => {
            let elements = [...document.querySelectorAll('div, span, a, button')];
            let textEl = elements.find(el => {
                let txt = el.innerText ? el.innerText.trim() : '';
                return new RegExp('^' + city + '$', 'i').test(txt) && el.offsetParent !== null;
            });
            if (textEl) {
                let card = textEl.closest('div');
                if (card && card.offsetWidth > 100) card.click();
                else textEl.click();
            } else {
                let fallbackEl = elements.find(el => el.innerText && el.innerText.toUpperCase().includes(city.toUpperCase()) && el.offsetParent !== null);
                if (fallbackEl) fallbackEl.click();
            }
        }, destCity);
        await sleep(1500);

        await page.evaluate(() => { let btn = [...document.querySelectorAll('button')].find(b => b.innerText.includes('Travel to Selected Location')); if (btn) btn.click(); });
        await sleep(1500);
        
        await page.waitForFunction(() => document.body.innerText.includes('Are you sure'), { timeout: 15000 }).catch(() => {});

        await page.evaluate(() => {
            let allBtns = [...document.querySelectorAll('button')];
            let travelBtn = allBtns.find(b => b.innerText.trim() === 'TRAVEL');
            if (travelBtn) travelBtn.click();
        });
        
        console.log(`✈️ تم الضغط على زر TRAVEL في النافذة لـ ${destCity}`);
        await sleep(7000); 
        await page.goto('https://www.project-dark.co.uk/blackmarket', { waitUntil: 'networkidle2' });
        await sleep(2000);
        continue;
      }

      // ═══════════════════════════════════════════════════════════════
      // 2) لو إحنا في السوق (بيع وشراء)
      // ═══════════════════════════════════════════════════════════════
      await sleep(2000); 
      
      let state = await page.evaluate((items) => {
        let bodyText = document.body.innerText || document.body.textContent || '';
        let loc = null;
        let cooldownStr = null;
        
        let titleMatch = bodyText.match(/Black Market\s*[-–—]?\s*(New York|Boston)/i);
        if (titleMatch) {
            loc = titleMatch[1];
        } else {
            let sidebarMatch = bodyText.match(/Location\s*[-–—:]?\s*(New York|Boston)/i);
            if (sidebarMatch) {
                loc = sidebarMatch[1];
            } else {
                let hasNY = /New York/i.test(bodyText);
                let hasBos = /Boston/i.test(bodyText);
                if (hasNY && !hasBos) loc = 'New York';
                else if (hasBos && !hasNY) loc = 'Boston';
                else if (hasNY && hasBos) loc = 'New York'; 
            }
        }

        let cdMatch = bodyText.match(/You cannot travel for:?\s*([0-9hms ]+)/i) || bodyText.match(/Travel in\s*([0-9hms ]+)/i);
        if (cdMatch) cooldownStr = cdMatch[1];

        let hold = 0;
        let heldItem = null;
        let rows = [...document.querySelectorAll('tr')];

        for (let r of rows) {
            let rText = r.innerText || '';
            if (rText.includes('Sell') && !rText.includes('Confirm')) {
                for (let it of items) {
                    if (rText.toLowerCase().includes(it.toLowerCase())) {
                        let cells = [...r.querySelectorAll('td')];
                        if (cells.length >= 3) {
                            let youHaveCell = cells[2].innerText || '';
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
            let m = bodyText.match(/holding (\d+) items/i);
            hold = m ? +m[1] : 0;
        }
        
        return { loc, cd: cooldownStr, hold, heldItem, debugSnippet: bodyText.substring(0, 300) };
      }, ITEMS);

      console.log(`📍 الموقع الحالي: ${state.loc || 'غير معروف'} | الكولداون: ${state.cd || 'لا يوجد'}`);
      
      if (!state.loc) {
          console.log("🔍 DEBUG SNIPPET:", state.debugSnippet.replace(/\n/g, ' | '));
      }

      if (state.cd) {
        console.log(`⏳ في كولداون: ${state.cd} - هستنى دقيقة وأعيد المحاولة...`);
        await sleep(60000);
        continue;
      }

      // ✅ نيويورك
      if (state.loc === "New York") {
        if (state.heldItem === "Stolen paintings" && state.hold > 0) {
           console.log("📍 نيويورك - بيع Stolen paintings (الرحلة العكسية)");
           await page.evaluate(() => { let rows = [...document.querySelectorAll('tr')]; for (let r of rows) { if (r.innerText.includes('Sell All') && !r.innerText.includes('Confirm')) { let btn = [...r.querySelectorAll('button')].find(b => b.innerText.trim() === 'Sell All'); if (btn) { btn.click(); break; } } } });
           await sleep(2000);
           await page.waitForFunction(() => document.body.innerText.includes('Confirm Sell All'), { timeout: 5000 }).catch(() => {});
           await page.evaluate(() => { const allBtns = [...document.querySelectorAll('button')]; const confirmBtn = allBtns.find(b => b.innerText.trim() === 'SELL ALL' && b.offsetParent !== null); if (confirmBtn) confirmBtn.click(); });
           await sleep(3000);
           continue;
        }
        
        if (state.heldItem === "Plastic jewelry" && state.hold > 0) {
           console.log("📍 نيويورك - رايح بوسطن لبيع البلاستيك جيولوري");
           await page.goto('https://www.project-dark.co.uk/travel', { waitUntil: 'networkidle2' });
           await sleep(2500);
           
           let travelCd = await page.evaluate(() => {
               let body = document.body.innerText || '';
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
           await page.evaluate(() => {
               let cards = [...document.querySelectorAll('div')];
               let target = cards.find(el => /boston/i.test(el.innerText) && el.offsetWidth > 150 && el.offsetHeight > 50);
               if (target) target.click();
           });
           await sleep(1500);
           await page.evaluate(() => { let btn = [...document.querySelectorAll('button')].find(b => b.innerText.includes('Travel to Selected Location')); if (btn) btn.click(); });
           await sleep(1500);
           await page.waitForFunction(() => document.body.innerText.includes('Are you sure'), { timeout: 15000 }).catch(() => {});
           await page.evaluate(() => { let allBtns = [...document.querySelectorAll('button')]; let travelBtn = allBtns.find(b => b.innerText.trim() === 'TRAVEL'); if (travelBtn) travelBtn.click(); });
           await sleep(5000);
           let verify = await page.evaluate(() => /Black Market - Boston/i.test(document.body.innerText));
           if (verify) console.log("🎉 وصلنا بوسطن!");
           else { console.log("⚠️ حصلت مشكلة، هنرجع للسوق"); await page.goto('https://www.project-dark.co.uk/blackmarket', { waitUntil: 'networkidle2' }); }
           continue;
        }
        
        if (state.hold === 0) {
           console.log("📍 نيويورك - شراء Plastic jewelry");
           await page.evaluate(() => { let rows = [...document.querySelectorAll('tr')]; for (let r of rows) { if (r.innerText.includes('Plastic jewelry') && r.innerText.includes('£')) { let mb = [...r.querySelectorAll('button')].find(b => b.innerText.includes('Max Buy')); if (mb) { mb.click(); break; } } } });
           await sleep(1000);
           await page.evaluate(() => { let btn = [...document.querySelectorAll('button')].find(b => b.innerText.trim() === 'BUY MAX'); if (btn) btn.click(); });
           await sleep(3000);
           continue;
        }
      }

      // ✅ بوسطن
      else if (state.loc === "Boston") {
        if (state.heldItem === "Plastic jewelry" && state.hold > 0) {
           console.log("📍 بوسطن - بيع Plastic jewelry (الرحلة الأساسية)");
           await page.evaluate(() => { const rows = [...document.querySelectorAll('tr')]; for (let r of rows) { const text = r.innerText; if (text.includes('Plastic jewelry') && text.includes('Sell All') && !text.includes('Confirm')) { const btn = [...r.querySelectorAll('button')].find(b => b.innerText.trim() === 'Sell All'); if (btn) { btn.click(); break; } } } });
           await sleep(2000);
           await page.waitForFunction(() => document.body.innerText.includes('Confirm Sell All'), { timeout: 5000 }).catch(() => {});
           await page.evaluate(() => { const allBtns = [...document.querySelectorAll('button')]; const confirmBtn = allBtns.find(b => b.innerText.trim() === 'SELL ALL' && b.offsetParent !== null); if (confirmBtn) confirmBtn.click(); });
           await sleep(3000);
           continue;
        }
        
        if (state.heldItem === "Stolen paintings" && state.hold > 0) {
           console.log("📍 بوسطن - رايح نيويورك لبيع Stolen paintings");
           await page.goto('https://www.project-dark.co.uk/travel', { waitUntil: 'networkidle2' });
           await sleep(2500);
           
           let travelCd = await page.evaluate(() => {
               let body = document.body.innerText || '';
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
           await page.evaluate(() => {
               let cards = [...document.querySelectorAll('div')];
               let target = cards.find(el => /new york/i.test(el.innerText) && el.offsetWidth > 150 && el.offsetHeight > 50);
               if (target) target.click();
           });
           await sleep(1500);
           await page.evaluate(() => { let btn = [...document.querySelectorAll('button')].find(b => b.innerText.includes('Travel to Selected Location')); if (btn) btn.click(); });
           await sleep(1500);
           await page.waitForFunction(() => document.body.innerText.includes('Are you sure'), { timeout: 15000 }).catch(() => {});
           await page.evaluate(() => { let allBtns = [...document.querySelectorAll('button')]; let travelBtn = allBtns.find(b => b.innerText.trim() === 'TRAVEL'); if (travelBtn) travelBtn.click(); });
           await sleep(5000);
           let verify = await page.evaluate(() => /Black Market - New York/i.test(document.body.innerText));
           if (verify) console.log("🎉 وصلنا نيويورك!");
           else { console.log("⚠️ حصلت مشكلة، هنرجع للسوق"); await page.goto('https://www.project-dark.co.uk/blackmarket', { waitUntil: 'networkidle2' }); }
           continue;
        }

        if (state.hold === 0) {
           console.log("📍 بوسطن - شراء Stolen paintings");
           await page.evaluate(() => { let rows = [...document.querySelectorAll('tr')]; for (let r of rows) { if (r.innerText.includes('Stolen paintings') && r.innerText.includes('£')) { let mb = [...r.querySelectorAll('button')].find(b => b.innerText.includes('Max Buy')); if (mb) { mb.click(); break; } } } });
           await sleep(1000);
           await page.evaluate(() => { let btn = [...document.querySelectorAll('button')].find(b => b.innerText.trim() === 'BUY MAX'); if (btn) btn.click(); });
           await sleep(3000);
           continue;
        }
      }
      
      else {
          console.log(`⚠️ مش لاقي مدينة معروفة (الحالي: ${state.loc || 'غير معروف'})، جاري السفر إلى نيويورك للبدء...`);
          await page.goto('https://www.project-dark.co.uk/travel', { waitUntil: 'networkidle2' });
          await sleep(3000);
          
          await page.evaluate(() => { let elements = [...document.querySelectorAll('a, span, div, button')]; let grid = elements.find(el => el.innerText.trim() === 'Grid View' && el.offsetParent !== null); if (grid) grid.click(); });
          await sleep(1500);
          await page.evaluate(() => {
              let cards = [...document.querySelectorAll('div')];
              let target = cards.find(el => /new york/i.test(el.innerText) && el.offsetWidth > 150 && el.offsetHeight > 50);
              if (target) target.click();
          });
          await sleep(1500);
          await page.evaluate(() => { let btn = [...document.querySelectorAll('button')].find(b => b.innerText.includes('Travel to Selected Location')); if (btn) btn.click(); });
          await sleep(1500);
          await page.waitForFunction(() => document.body.innerText.includes('Are you sure'), { timeout: 15000 }).catch(() => {});
          await page.evaluate(() => { let allBtns = [...document.querySelectorAll('button')]; let travelBtn = allBtns.find(b => b.innerText.trim() === 'TRAVEL'); if (travelBtn) travelBtn.click(); });
          await sleep(7000);
          await page.goto('https://www.project-dark.co.uk/blackmarket', { waitUntil: 'networkidle2' });
          await sleep(2000);
          continue;
      }

    } catch (e) {
      console.log("حصل خطأ مؤقت، معيد المحاولة:", e.message);
      await sleep(15000);
    }
    await sleep(10000);
  }
})();
