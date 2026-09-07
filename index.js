const puppeteer = require('puppeteer');

const COOKIE_VALUE = process.env.PD_COOKIE || "";

const ITEMS = ["Anabolic steroid","Artifacts","Alcohol","Electronics","Plastic jewelry","Stolen paintings","Human beings","Confidential documents","Endangered exotic animals","Organs"];

async function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

(async () => {
  console.log("🚀 البوت شغال بمتصفح Firefox...");

  const browser = await puppeteer.launch({ 
    browser: 'firefox',
    headless: true, 
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu'] 
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 }); 
  page.setDefaultTimeout(30000);

  // 🔥 نبدأ بحلقة إعادة المحاولة للدخول بالكوكيز
  let isLoggedIn = false;
  let attempt = 1;

  while (!isLoggedIn) {
    console.log(`\n========== محاولة رقم ${attempt} ==========`);

    try {
        // 1) ضبط الكوكيز
        if (COOKIE_VALUE) {
            await page.setCookie({ name: 'project-dark-session', value: COOKIE_VALUE, domain: '.project-dark.co.uk' });
            console.log("✅ تم تحميل الكوكيز.");
        } else {
            console.log("❌ لا يوجد كوكيز في PD_COOKIE! تأكد من وضع القيمة في Variables.");
            break;
        }

        // 2) الذهاب مباشرة للبلاك ماركت
        console.log("🚀 الذهاب إلى البلاك ماركت...");
        await page.goto('https://www.project-dark.co.uk/blackmarket', { waitUntil: 'domcontentloaded', timeout: 60000 }).catch(() => {});
        await sleep(3000);

        // 3) فحص الحالة
        const currentUrl = page.url();
        const pageText = await page.evaluate(() => document.body.innerText).catch(() => "");

        if (currentUrl.includes('login')) {
            console.log("❌ الرابط لسه صفحة اللوجين (Login). الكوكيز منتهية غالباً.");
            console.log("💡 جرب تاخد كوكيز جديدة من المتصفح وتحطها في PD_COOKIE");
        } else if (pageText.includes('Game Closed')) {
            console.log("🌙 اللعبة مقفولة حالياً (Game Closed). هستنى 5 دقايق وأحاول تاني...");
            await sleep(300000); // استنى 5 دقايق
        } else if (currentUrl.includes('blackmarket') || currentUrl.includes('black')) {
            console.log("✅ نجحنا! دخلنا على البلاك ماركت. الرابط: " + currentUrl);
            isLoggedIn = true; // هنكسر اللوب ونبدأ الشغل
            break;
        } else {
            console.log("⚠️ مش واضح إحنا فين. الرابط الحالي: " + currentUrl);
            console.log("👀 محتوى الصفحة (أول 200 حرف): " + pageText.substring(0, 200));
        }

        // لو فشلت المحاولة، استنى 10 ثواني وكرر
        if (!isLoggedIn) {
            console.log("⏳ هستنى 10 ثواني قبل إعادة المحاولة...");
            await sleep(10000);
            attempt++;
        }

    } catch (e) {
        console.log("⚠️ خطأ غير متوقع:", e.message);
        await sleep(10000);
        attempt++;
    }
  }

  // ✅ لو إحنا هنا، يبقى دخلنا البلاك ماركت بنجاح
  console.log("\n🎉 تم الدخول بنجاح! جاري بدء لوجيك البيع والشراء...");

  // ═══════════════════════════════════════════════════════════════
  // هنا يبدأ لوجيك البيع والشراء والسفر (زي ما هو بالظبط)
  // ═══════════════════════════════════════════════════════════════
  while (true) {
    try {
      // لو رجعنا للوجين فجأة، نكسر اللوب ونطلب إعادة تشغيل
      if (page.url().includes('login')) {
          console.log("⚠️ رجعنا لصفحة اللوجين فجأة. جاري إعادة المحاولة...");
          await sleep(5000);
          // إعادة تحميل الصفحة
          await page.goto('https://www.project-dark.co.uk/blackmarket', { waitUntil: 'domcontentloaded' }).catch(() => {});
          continue;
      }

      if (page.url().includes('travel')) {
        let currentCity = await page.evaluate(() => {
            let body = document.body.innerText;
            let m = body.match(/Location\s*\n\s*(St Louis|Washington)/i);
            if (m) return m[1];
            if (body.includes('Black Market - Washington')) return 'Washington';
            if (body.includes('Black Market - St Louis')) return 'St Louis';
            return null;
        });

        if (!currentCity) { await page.goto('https://project-dark.co.uk/travel'); continue; }

        let destCity = (currentCity === 'Washington') ? 'St Louis' : 'Washington';
        console.log(`✈️ ${currentCity} - جاري تجهيز السفر إلى ${destCity}`);

        await page.evaluate(() => { let grid = [...document.querySelectorAll('a, span, div, button')].find(el => el.innerText.trim() === 'Grid View' && el.offsetParent !== null); if (grid) grid.click(); });
        await sleep(1500);

        await page.evaluate((city) => {
            let elements = [...document.querySelectorAll('div, span, a')];
            let textEl = elements.find(el => el.innerText.trim().toUpperCase() === city.toUpperCase() && el.offsetParent !== null);
            if (textEl) {
                let card = textEl.closest('div');
                if (card && card.offsetWidth > 100) card.click();
                else textEl.click();
            }
        }, destCity);
        await sleep(1500);

        await page.evaluate(() => { let btn = [...document.querySelectorAll('button')].find(b => b.innerText.includes('Travel to Selected Location')); if (btn) btn.click(); });

        await page.waitForFunction(() => document.body.innerText.includes('Are you sure'), { timeout: 15000 }).catch(() => {});
        await page.evaluate(() => {
            let allBtns = [...document.querySelectorAll('button')];
            let travelBtn = allBtns.find(b => b.innerText.trim() === 'TRAVEL');
            if (travelBtn) travelBtn.click();
        });

        console.log(`✈️ تم الضغط على زر TRAVEL في النافذة لـ ${destCity}`);
        await sleep(7000);
        await page.goto('https://www.project-dark.co.uk/blackmarket');
        continue;
      }

      let state = await page.evaluate((items) => {
        let body = document.body.innerText;
        let loc = null;
        let cooldownStr = null;

        let lines = body.split('\n');
        for (let i = 0; i < lines.length; i++) {
            if (lines[i].trim().toUpperCase() === 'LOCATION') {
                for (let j = i + 1; j < lines.length; j++) {
                    if (lines[j].trim()) { loc = lines[j].trim(); break; }
                }
                break;
            }
        }

        // ✅ المدن الجديدة
        if (loc && loc.includes('Washington')) loc = 'Washington';
        else if (loc && loc.includes('St Louis')) loc = 'St Louis';
        else if (loc && loc.includes('Atlanta')) loc = 'Atlanta';
        else if (loc && loc.includes('Boston')) loc = 'Boston';
        else if (loc && loc.includes('Chicago')) loc = 'Chicago';
        else if (loc && loc.includes('Dallas')) loc = 'Dallas';
        else if (loc && loc.includes('Denver')) loc = 'Denver';
        else if (loc && loc.includes('Los Angeles')) loc = 'Los Angeles';
        else if (loc && loc.includes('New York')) loc = 'New York';
        else if (loc && loc.includes('Phoenix')) loc = 'Phoenix';
        else if (loc && loc.includes('San Francisco')) loc = 'San Francisco';
        else if (loc && loc.includes('Seattle')) loc = 'Seattle';

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

      if (!state.loc) {
        console.log("⚠️ مش لاقي اللوكيشن. الرابط الحالي:", page.url());
        await sleep(5000);
        continue;
      }

      if (state.cd) {
        console.log(`⏳ في كولداون: ${state.cd} - هستنى دقيقة وأعيد المحاولة...`);
        await sleep(60000);
        continue;
      }

      // سانت لويس
      if (state.loc === "St Louis") {
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
           await page.evaluate(() => { let elements = [...document.querySelectorAll('a, span, div, button')]; let grid = elements.find(el => el.innerText.trim() === 'Grid View' && el.offsetParent !== null); if (grid) grid.click(); });
           await sleep(1500);
           await page.evaluate(() => { let cards = [...document.querySelectorAll('div')]; let target = cards.find(el => el.innerText.trim().toUpperCase() === 'WASHINGTON' && el.offsetWidth > 150 && el.offsetHeight > 50); if (target) target.click(); });
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
           console.log("📍 واشنطن - رايح سانت لويس");
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
           await page.evaluate(() => { let cards = [...document.querySelectorAll('div')]; let target = cards.find(el => el.innerText.trim().toUpperCase() === 'ST LOUIS' && el.offsetWidth > 150 && el.offsetHeight > 50); if (target) target.click(); });
           await sleep(1500);
           await page.evaluate(() => { let btn = [...document.querySelectorAll('button')].find(b => b.innerText.includes('Travel to Selected Location')); if (btn) btn.click(); });
           await sleep(1500);
           await page.waitForFunction(() => document.body.innerText.includes('Are you sure'), { timeout: 15000 }).catch(() => {});
           await page.evaluate(() => { let allBtns = [...document.querySelectorAll('button')]; let travelBtn = allBtns.find(b => b.innerText.trim() === 'TRAVEL'); if (travelBtn) travelBtn.click(); });
           await sleep(5000);
           let verify = await page.evaluate(() => document.body.innerText.includes('Black Market - St Louis'));
           if (verify) console.log("🎉 وصلنا سانت لويس!");
           else { console.log("⚠️ حصلت مشكلة، هنرجع للسوق"); await page.goto('https://www.project-dark.co.uk/blackmarket', { waitUntil: 'networkidle2' }); }
           continue;
        }
      }
      else {
          console.log("📍 المدينة الحالية هي:", state.loc);
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
