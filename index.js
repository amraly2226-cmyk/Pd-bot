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
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36');
  page.setDefaultTimeout(15000);

  // ═══════════════════════════════════════════════════════════════
  // 1) الدخول (كوكيز أو يوزر وباسورد)
  // ═══════════════════════════════════════════════════════════════
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
        console.log("✅ تم تسجيل الدخول باليوزر والباسورد");
    }
  } catch (e) {
    console.log("⚠️ مشكلة في الدخول:", e.message);
  }

  // ═══════════════════════════════════════════════════════════════
  // 2) تجهيز الصفحة (الخطوات اللي طلبتها)
  // ═══════════════════════════════════════════════════════════════
  try {
      console.log("🔄 جاري تجهيز الصفحة (بلاك ماركت -> ريفريش x2 -> باك)...");
      
      // 1. الذهاب لصفحة البلاك ماركت
      await page.goto('https://www.project-dark.co.uk/blackmarket', { waitUntil: 'networkidle2', timeout: 60000 });
      await sleep(3000);

      // 2. عمل ريفريش مرتين
      await page.reload({ waitUntil: 'networkidle2' });
      await sleep(2000);
      await page.reload({ waitUntil: 'networkidle2' });
      await sleep(2000);

      // 3. دوس زرار الباك
      await page.goBack({ waitUntil: 'networkidle2' }).catch(() => console.log("مش مشكلة لو الباك مش شغال..."));
      await sleep(3000);

      // 4. نرجع تاني لصفحة البلاك ماركت عشان نبدأ الشغل
      await page.goto('https://www.project-dark.co.uk/blackmarket', { waitUntil: 'networkidle2', timeout: 60000 });
      await sleep(3000);

      // ✅ Check: لو الصفحة رجعت للوجين تاني يبقى الكوكيز باظت
      if (page.url().includes('login')) {
          console.log("⚠️ الكوكيز انتهت أو غير صالحة! البوت هيكمل بالطريقة العادية...");
      } else {
          console.log("✅ الصفحة جاهزة، هنبدأ نقرا المدن...");
      }
  } catch (e) {
      console.log("⚠️ مشكلة في تجهيز الصفحة:", e.message);
  }

  // ═══════════════════════════════════════════════════════════════
  // 3) اللوب الرئيسي
  // ═══════════════════════════════════════════════════════════════
  while (true) {
    try {
      // لو إحنا في صفحة الترافل
      if (page.url().includes('travel')) {
        let currentCity = await page.evaluate(() => {
            let bodyText = document.body.innerText || document.body.textContent || '';
            let m = bodyText.match(/Location\s*[-–—:]?\s*(New York|San Francisco)/i);
            if (m) return m[1];
            if (/Black Market\s*[-–—]?\s*San Francisco/i.test(bodyText)) return 'San Francisco';
            if (/Black Market\s*[-–—]?\s*New York/i.test(bodyText)) return 'New York';
            if (/New York/i.test(bodyText)) return 'New York';
            if (/San Francisco/i.test(bodyText)) return 'San Francisco';
            return null;
        });

        let destCity = 'New York';
        if (currentCity === 'San Francisco') {
            destCity = 'New York';
            console.log(`✈️ سان فرانسيسكو - جاري تجهيز السفر إلى نيويورك`);
        } else if (currentCity === 'New York') {
            destCity = 'San Francisco';
            console.log(`✈️ نيويورك - جاري تجهيز السفر إلى سان فرانسيسكو`);
        } else {
            console.log(`⚠️ مش عارف أنا فين بالظبط (${currentCity || 'غير معروف'})، بس هجرب أسافر لنيويورك...`);
            destCity = 'New York';
        }

        // اختيار جرايد فيو
        await page.evaluate(() => { let grid = [...document.querySelectorAll('a, span, div, button')].find(el => el.innerText.trim() === 'Grid View' && el.offsetParent !== null); if (grid) grid.click(); });
        await sleep(1500);

        // اختيار البلد من البطاقة
        await page.evaluate((city) => {
            let elements = [...document.querySelectorAll('div, span, a, button')];
            let textEl = elements.find(el => {
                let txt = el.innerText ? el.innerText.trim() : '';
                return txt.toUpperCase().includes(city.toUpperCase()) && el.offsetParent !== null;
            });
            if (textEl) {
                let card = textEl.closest('div');
                if (card && card.offsetWidth > 100) card.click();
                else textEl.click();
            }
        }, destCity);
        await sleep(1500);

        // الضغط على Travel to Selected Location
        await page.evaluate(() => { let btn = [...document.querySelectorAll('button')].find(b => b.innerText.includes('Travel to Selected Location')); if (btn) btn.click(); });
        await sleep(1500);
        
        // انتظار البوباب
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

      // لو إحنا في السوق
      await sleep(2000); 
      
      let state = await page.evaluate((items) => {
        let bodyText = document.body.innerText || document.body.textContent || '';
        let loc = null;
        let cooldownStr = null;
        
        // 1. قراءة الموقع من عنوان السوق
        let titleMatch = bodyText.match(/Black Market\s*[-–—]?\s*(New York|San Francisco)/i);
        if (titleMatch) {
            loc = titleMatch[1];
        } else {
            // 2. قراءة الموقع من القائمة الشمال (PLAYER INFO)
            let sidebarMatch = bodyText.match(/Location\s*[-–—:]?\s*(New York|San Francisco)/i);
            if (sidebarMatch) {
                loc = sidebarMatch[1];
            } else {
                // 3. احتياطي
                let hasNY = /New York/i.test(bodyText);
                let hasSF = /San Francisco/i.test(bodyText);
                if (hasNY && !hasSF) loc = 'New York';
                else if (hasSF && !hasNY) loc = 'San Francisco';
                else if (hasNY && hasSF) loc = 'New York';
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

      // نيويورك
      if (state.loc === "New York") {
        if (state.heldItem === "Electronics" && state.hold > 0) {
           console.log("📍 نيويورك - بيع الإلكترونيكس");
           await page.evaluate(() => { let rows = [...document.querySelectorAll('tr')]; for (let r of rows) { if (r.innerText.includes('Sell All') && !r.innerText.includes('Confirm')) { let btn = [...r.querySelectorAll('button')].find(b => b.innerText.trim() === 'Sell All'); if (btn) { btn.click(); break; } } } });
           await sleep(2000);
           await page.waitForFunction(() => document.body.innerText.includes('Confirm Sell All'), { timeout: 5000 }).catch(() => {});
           await page.evaluate(() => { const allBtns = [...document.querySelectorAll('button')]; const confirmBtn = allBtns.find(b => b.innerText.trim() === 'SELL ALL' && b.offsetParent !== null); if (confirmBtn) confirmBtn.click(); });
           await sleep(3000);
           continue;
        }
        
        if (state.hold === 0) {
           console.log("📍 نيويورك - شراء أنابوليك سترويدز");
           await page.evaluate(() => { let rows = [...document.querySelectorAll('tr')]; for (let r of rows) { if (r.innerText.includes('Anabolic steroid') && r.innerText.includes('£')) { let mb = [...r.querySelectorAll('button')].find(b => b.innerText.includes('Max Buy')); if (mb) { mb.click(); break; } } } });
           await sleep(1000);
           await page.evaluate(() => { let btn = [...document.querySelectorAll('button')].find(b => b.innerText.trim() === 'BUY MAX'); if (btn) btn.click(); });
           await sleep(3000);
           continue;
        }
        
        if (state.heldItem === "Anabolic steroid" && state.hold > 0) {
           console.log("📍 نيويورك - رايح San Francisco");
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
               let target = cards.find(el => /san francisco/i.test(el.innerText) && el.offsetWidth > 150 && el.offsetHeight > 50);
               if (target) target.click();
           });
           await sleep(1500);
           await page.evaluate(() => { let btn = [...document.querySelectorAll('button')].find(b => b.innerText.includes('Travel to Selected Location')); if (btn) btn.click(); });
           await sleep(1500);
           await page.waitForFunction(() => document.body.innerText.includes('Are you sure'), { timeout: 15000 }).catch(() => {});
           await page.evaluate(() => { let allBtns = [...document.querySelectorAll('button')]; let travelBtn = allBtns.find(b => b.innerText.trim() === 'TRAVEL'); if (travelBtn) travelBtn.click(); });
           await sleep(5000);
           let verify = await page.evaluate(() => /Black Market - San Francisco/i.test(document.body.innerText));
           if (verify) console.log("🎉 وصلنا San Francisco!");
           else { console.log("⚠️ حصلت مشكلة، هنرجع للسوق"); await page.goto('https://www.project-dark.co.uk/blackmarket', { waitUntil: 'networkidle2' }); }
           continue;
        }
      }

      // سان فرانسيسكو
      else if (state.loc === "San Francisco") {
        if (state.heldItem === "Anabolic steroid" && state.hold > 0) {
           console.log("📍 San Francisco - بيع الأنابوليك سترويدز");
           await page.evaluate(() => { const rows = [...document.querySelectorAll('tr')]; for (let r of rows) { const text = r.innerText; if (text.includes('Anabolic steroid') && text.includes('Sell All') && !text.includes('Confirm')) { const btn = [...r.querySelectorAll('button')].find(b => b.innerText.trim() === 'Sell All'); if (btn) { btn.click(); break; } } } });
           await sleep(2000);
           await page.waitForFunction(() => document.body.innerText.includes('Confirm Sell All'), { timeout: 5000 }).catch(() => {});
           await page.evaluate(() => { const allBtns = [...document.querySelectorAll('button')]; const confirmBtn = allBtns.find(b => b.innerText.trim() === 'SELL ALL' && b.offsetParent !== null); if (confirmBtn) confirmBtn.click(); });
           await sleep(3000);
           continue;
        }
        
        if (state.hold === 0) {
           console.log("📍 San Francisco - شراء إلكترونيكس");
           await page.evaluate(() => { let rows = [...document.querySelectorAll('tr')]; for (let r of rows) { if (r.innerText.includes('Electronics') && r.innerText.includes('£')) { let mb = [...r.querySelectorAll('button')].find(b => b.innerText.includes('Max Buy')); if (mb) { mb.click(); break; } } } });
           await sleep(1000);
           await page.evaluate(() => { let btn = [...document.querySelectorAll('button')].find(b => b.innerText.trim() === 'BUY MAX'); if (btn) btn.click(); });
           await sleep(3000);
           continue;
        }

        if (state.heldItem === "Electronics" && state.hold > 0) {
           console.log("📍 San Francisco - رايح نيويورك (سأقرأ الكولداون أولاً)");
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
      }
      
      // لو المدينة مش معروفة
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
