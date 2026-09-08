const puppeteer = require('puppeteer');

// ⬅️ بيانات الدخول
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
  page.setDefaultTimeout(15000);

  try {
    console.log("🔐 جاري فتح صفحة الدخول...");
    await page.goto('https://www.project-dark.co.uk/login', { waitUntil: 'networkidle2', timeout: 60000 });
    
    // ⭐ الخطوة 1: انتظار ظهور مربع التحقق أو علامة الصح
    console.log("⏳ في انتظار ظهور مربع التحقق (علامة الصح) ...");
    let verified = false;
    try {
        // انتظر ظهور أي عنصر يحوي ✓ أو "Success!" أو "CLOUDFLARE" أو مربع check
        await page.waitForFunction(() => {
            const body = document.body.innerText;
            // البحث عن علامة الصح أو النص الدال على اكتمال التحقق
            if (body.includes('✓') || body.includes('Success!') || body.includes('CLOUDFLARE')) {
                return true;
            }
            // البحث عن مربع اختيار (checkbox) أو عنصر يشبهه
            const checkboxes = document.querySelectorAll('input[type="checkbox"], [role="checkbox"]');
            for (let cb of checkboxes) {
                if (cb.offsetParent !== null && (cb.checked || cb.getAttribute('aria-checked') === 'true')) {
                    return true;
                }
            }
            return false;
        }, { timeout: 60000 });
        console.log("✅ تم اكتشاف اكتمال التحقق (ظهرت العلامة أو تم تفعيل المربع)");
        verified = true;
    } catch (e) {
        console.log("⚠️ لم تظهر العلامة تلقائياً، نحاول النقر على مربع التحقق إن وجد...");
        // محاولة النقر على مربع التحقق (إذا كان موجوداً)
        const clicked = await page.evaluate(() => {
            const checkboxes = document.querySelectorAll('input[type="checkbox"], [role="checkbox"]');
            for (let cb of checkboxes) {
                if (cb.offsetParent !== null && !cb.checked && cb.getAttribute('aria-checked') !== 'true') {
                    cb.click();
                    return true;
                }
            }
            return false;
        });
        if (clicked) {
            console.log("✅ تم النقر على مربع التحقق، ننتظر ثانية...");
            await sleep(1000);
            // نتحقق مرة أخرى من ظهور العلامة
            const recheck = await page.evaluate(() => {
                const body = document.body.innerText;
                return body.includes('✓') || body.includes('Success!') || body.includes('CLOUDFLARE');
            });
            if (recheck) {
                console.log("✅ أصبحت العلامة ظاهرة الآن");
                verified = true;
            } else {
                console.log("⚠️ ما زالت العلامة غير ظاهرة، لكننا سنكمل...");
            }
        } else {
            console.log("⚠️ لم نجد مربع تحقق للنقر عليه، سنكمل على أي حال...");
        }
    }

    // ⭐ الخطوة 2: كتابة البيانات (إن لم تكن مكتوبة بالفعل)
    console.log("✍️ جاري كتابة اليوزرنيم والباسورد...");
    const inputs = await page.$$('input[type="text"], input[type="email"], input[type="password"]');
    if (inputs.length >= 2) {
        // التأكد من أن الحقول فارغة أو نكتب فوقها
        await inputs[0].click({ clickCount: 3 });
        await inputs[0].type(USERNAME);
        await inputs[1].click({ clickCount: 3 });
        await inputs[1].type(PASSWORD);
    }
    console.log("✅ تم كتابة البيانات");

    // ⭐ الخطوة 3: الضغط على Login
    console.log("🔑 جاري الضغط على Login...");
    await page.click('button[type="submit"]').catch(async () => {
        await page.evaluate(() => {
            const btns = [...document.querySelectorAll('button, input[type="submit"]')];
            const loginBtn = btns.find(b => 
                b.innerText?.toLowerCase().includes('login') || 
                b.value?.toLowerCase().includes('login')
            );
            if (loginBtn) loginBtn.click();
        });
    });
    console.log("✅ تم الضغط على Login");

    // انتظار التوجيه إلى البلاك ماركت
    await sleep(5000);
    console.log("🚀 جاري التوجه إلى البلاك ماركت...");
    await page.goto('https://www.project-dark.co.uk/blackmarket', { waitUntil: 'networkidle2', timeout: 60000 });

    // انتظار ظهور اسم المدينة (من أي مصدر)
    try {
        await page.waitForFunction(() => {
            const body = document.body.innerText;
            return body.includes('Location') || body.includes('Black Market -') || body.includes('Los Angeles') || body.includes('San Francisco');
        }, { timeout: 30000 });
        console.log("✅ تم تحميل البلاك ماركت بنجاح");
    } catch (e) {
        console.log("⚠️ لم نجد المدينة بعد الدخول، نعيد تحميل الصفحة...");
        await page.reload({ waitUntil: 'networkidle2' });
        await sleep(5000);
    }

  } catch (e) {
    console.log("⚠️ مشكلة في الدخول:", e.message);
  }

  // ========== باقي السكربت (التداول والسفر) ==========
  while (true) {
    try {
      // ═══════════════════════════════════════════════════════════════
      // 1) لو إحنا في صفحة الترافل
      // ═══════════════════════════════════════════════════════════════
      if (page.url().includes('travel')) {
        let currentCity = await page.evaluate(() => {
            let body = document.body.innerText;
            let match = body.match(/Black Market - (Los Angeles|San Francisco)/i);
            if (match) return match[1];
            let locMatch = body.match(/Location\s*\n\s*(Los Angeles|San Francisco)/i);
            if (locMatch) return locMatch[1];
            if (body.includes('Los Angeles')) return 'Los Angeles';
            if (body.includes('San Francisco')) return 'San Francisco';
            return null;
        });

        if (!currentCity) {
            console.log("⚠️ لم نجد المدينة في صفحة السفر، نعيد المحاولة...");
            await page.goto('https://project-dark.co.uk/travel');
            await sleep(3000);
            continue;
        }

        let destCity = (currentCity === 'Los Angeles') ? 'San Francisco' : 'Los Angeles';
        console.log(`✈️ ${currentCity} - جاري تجهيز السفر إلى ${destCity}`);

        await page.evaluate(() => {
            let grid = [...document.querySelectorAll('a, span, div, button')].find(el => el.innerText.trim() === 'Grid View' && el.offsetParent !== null);
            if (grid) grid.click();
        });
        await sleep(1500);

        await page.evaluate((city) => {
            let cityUpper = city.toUpperCase();
            let elements = [...document.querySelectorAll('div, span, a')];
            let textEl = elements.find(el => el.innerText.trim() === cityUpper && el.offsetParent !== null);
            if (textEl) {
                let card = textEl.closest('div');
                if (card && card.offsetWidth > 100) card.click();
                else textEl.click();
            }
        }, destCity);
        await sleep(1500);

        await page.evaluate(() => {
            let btn = [...document.querySelectorAll('button')].find(b => b.innerText.includes('Travel to Selected Location'));
            if (btn) btn.click();
        });
        await page.waitForFunction(() => document.body.innerText.includes('Are you sure'), { timeout: 15000 }).catch(() => {});
        await page.evaluate(() => {
            let allBtns = [...document.querySelectorAll('button')];
            let travelBtn = allBtns.find(b => b.innerText.trim() === 'TRAVEL');
            if (travelBtn) travelBtn.click();
        });
        
        console.log(`✈️ تم الضغط على TRAVEL لـ ${destCity}`);
        await sleep(7000);
        await page.goto('https://www.project-dark.co.uk/blackmarket');
        await page.waitForFunction(() => {
            const body = document.body.innerText;
            return body.includes('Location') || body.includes('Black Market -') || body.includes('Los Angeles') || body.includes('San Francisco');
        }, { timeout: 20000 }).catch(() => console.log("⚠️ لم نجد المدينة بعد السفر"));
        continue;
      }

      // ═══════════════════════════════════════════════════════════════
      // 2) السوق - قراءة المدينة من مكانين (Location أو Black Market)
      // ═══════════════════════════════════════════════════════════════
      let state = await page.evaluate((items) => {
        let body = document.body.innerText;
        let loc = null;
        let cooldownStr = null;
        
        // 🔥 محاولة قراءة المدينة من "Location"
        let lines = body.split('\n');
        for (let i = 0; i < lines.length; i++) {
            if (lines[i].trim().toUpperCase() === 'LOCATION') {
                for (let j = i + 1; j < lines.length; j++) {
                    if (lines[j].trim()) {
                        let candidate = lines[j].trim();
                        if (candidate.includes('Los Angeles') || candidate.includes('San Francisco')) {
                            loc = candidate.includes('Los Angeles') ? 'Los Angeles' : 'San Francisco';
                        }
                        break;
                    }
                }
                break;
            }
        }
        
        // 🔥 إذا لم نجد من Location، جرب من "Black Market - ..."
        if (!loc) {
            let match = body.match(/Black Market - (Los Angeles|San Francisco)/i);
            if (match) loc = match[1];
        }
        
        // 🔥 بحث عام
        if (!loc) {
            if (body.includes('Los Angeles')) loc = 'Los Angeles';
            else if (body.includes('San Francisco')) loc = 'San Francisco';
        }

        // كولداون
        let cdMatch = body.match(/You cannot travel for:?\s*([0-9hms ]+)/i) || body.match(/Travel in\s*([0-9hms ]+)/i);
        if (cdMatch) cooldownStr = cdMatch[1];

        // عدد العناصر المحمولة ونوعها
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
                            let matchNum = youHaveCell.match(/(\d+)/);
                            if (matchNum && +matchNum[1] > 0) {
                                heldItem = it;
                                hold = +matchNum[1];
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
          console.log("⚠️ لم نجد المدينة، نعيد تحميل الصفحة...");
          await page.reload({ waitUntil: 'networkidle2' });
          await sleep(5000);
          continue;
      }

      console.log(`📍 المدينة الحالية: ${state.loc}`);

      if (state.cd) {
        console.log(`⏳ كولداون: ${state.cd} - هستنى دقيقة...`);
        await sleep(60000);
        continue;
      }

      // San Francisco
      if (state.loc === "San Francisco") {
        if (state.heldItem === "Electronics" && state.hold > 0) {
           console.log("📍 سان فرانسيسكو - بيع الإلكترونيكس");
           await page.evaluate(() => { let rows = [...document.querySelectorAll('tr')]; for (let r of rows) { if (r.innerText.includes('Sell All') && !r.innerText.includes('Confirm')) { let btn = [...r.querySelectorAll('button')].find(b => b.innerText.trim() === 'Sell All'); if (btn) { btn.click(); break; } } } });
           await sleep(2000);
           await page.waitForFunction(() => document.body.innerText.includes('Confirm Sell All'), { timeout: 5000 }).catch(() => {});
           await page.evaluate(() => { const allBtns = [...document.querySelectorAll('button')]; const confirmBtn = allBtns.find(b => b.innerText.trim() === 'SELL ALL' && b.offsetParent !== null); if (confirmBtn) confirmBtn.click(); });
           await sleep(3000);
           continue;
        }
        
        if (state.hold === 0) {
           console.log("📍 سان فرانسيسكو - شراء أنابوليك");
           await page.evaluate(() => { let rows = [...document.querySelectorAll('tr')]; for (let r of rows) { if (r.innerText.includes('Anabolic steroid') && r.innerText.includes('£')) { let mb = [...r.querySelectorAll('button')].find(b => b.innerText.includes('Max Buy')); if (mb) { mb.click(); break; } } } });
           await sleep(1000);
           await page.evaluate(() => { let btn = [...document.querySelectorAll('button')].find(b => b.innerText.trim() === 'BUY MAX'); if (btn) btn.click(); });
           await sleep(3000);
           continue;
        }
        
        if (state.heldItem === "Anabolic steroid" && state.hold > 0) {
           console.log("📍 سان فرانسيسكو → رايح لوس أنجلوس");
           await page.goto('https://www.project-dark.co.uk/travel', { waitUntil: 'networkidle2' });
           await sleep(2500);
           let travelCd = await page.evaluate(() => {
               let body = document.body.innerText;
               let cdMatch = body.match(/You cannot travel for:?\s*([0-9hms ]+)/i) || body.match(/Travel in\s*([0-9hms ]+)/i);
               return cdMatch ? cdMatch[1] : null;
           });
           if (travelCd) { console.log(`⏳ كولداون سفر: ${travelCd}`); await sleep(60000); continue; }
           await page.evaluate(() => { let elements = [...document.querySelectorAll('a, span, div, button')]; let grid = elements.find(el => el.innerText.trim() === 'Grid View' && el.offsetParent !== null); if (grid) grid.click(); });
           await sleep(1500);
           await page.evaluate(() => { let cards = [...document.querySelectorAll('div')]; let target = cards.find(el => el.innerText.trim() === 'LOS ANGELES' && el.offsetWidth > 150 && el.offsetHeight > 50); if (target) target.click(); });
           await sleep(1500);
           await page.evaluate(() => { let btn = [...document.querySelectorAll('button')].find(b => b.innerText.includes('Travel to Selected Location')); if (btn) btn.click(); });
           await sleep(1500);
           await page.waitForFunction(() => document.body.innerText.includes('Are you sure'), { timeout: 15000 }).catch(() => {});
           await page.evaluate(() => { let allBtns = [...document.querySelectorAll('button')]; let travelBtn = allBtns.find(b => b.innerText.trim() === 'TRAVEL'); if (travelBtn) travelBtn.click(); });
           await sleep(5000);
           let verify = await page.evaluate(() => document.body.innerText.includes('Black Market - Los Angeles') || document.body.innerText.includes('Los Angeles'));
           if (verify) console.log("🎉 وصلنا لوس أنجلوس!");
           else { console.log("⚠️ مشكلة، نرجع للسوق"); await page.goto('https://www.project-dark.co.uk/blackmarket', { waitUntil: 'networkidle2' }); }
           continue;
        }
      }

      // Los Angeles
      else if (state.loc === "Los Angeles") {
        if (state.heldItem === "Anabolic steroid" && state.hold > 0) {
           console.log("📍 لوس أنجلوس - بيع الأنابوليك");
           await page.evaluate(() => { const rows = [...document.querySelectorAll('tr')]; for (let r of rows) { const text = r.innerText; if (text.includes('Anabolic steroid') && text.includes('Sell All') && !text.includes('Confirm')) { const btn = [...r.querySelectorAll('button')].find(b => b.innerText.trim() === 'Sell All'); if (btn) { btn.click(); break; } } } });
           await sleep(2000);
           await page.waitForFunction(() => document.body.innerText.includes('Confirm Sell All'), { timeout: 5000 }).catch(() => {});
           await page.evaluate(() => { const allBtns = [...document.querySelectorAll('button')]; const confirmBtn = allBtns.find(b => b.innerText.trim() === 'SELL ALL' && b.offsetParent !== null); if (confirmBtn) confirmBtn.click(); });
           await sleep(3000);
           continue;
        }
        
        if (state.hold === 0) {
           console.log("📍 لوس أنجلوس - شراء إلكترونيكس");
           await page.evaluate(() => { let rows = [...document.querySelectorAll('tr')]; for (let r of rows) { if (r.innerText.includes('Electronics') && r.innerText.includes('£')) { let mb = [...r.querySelectorAll('button')].find(b => b.innerText.includes('Max Buy')); if (mb) { mb.click(); break; } } } });
           await sleep(1000);
           await page.evaluate(() => { let btn = [...document.querySelectorAll('button')].find(b => b.innerText.trim() === 'BUY MAX'); if (btn) btn.click(); });
           await sleep(3000);
           continue;
        }

        if (state.heldItem === "Electronics" && state.hold > 0) {
           console.log("📍 لوس أنجلوس → رايح سان فرانسيسكو");
           await page.goto('https://www.project-dark.co.uk/travel', { waitUntil: 'networkidle2' });
           await sleep(2500);
           let travelCd = await page.evaluate(() => {
               let body = document.body.innerText;
               let cdMatch = body.match(/You cannot travel for:?\s*([0-9hms ]+)/i) || body.match(/Travel in\s*([0-9hms ]+)/i);
               return cdMatch ? cdMatch[1] : null;
           });
           if (travelCd) { console.log(`⏳ كولداون سفر: ${travelCd}`); await sleep(60000); continue; }
           await page.evaluate(() => { let elements = [...document.querySelectorAll('a, span, div, button')]; let grid = elements.find(el => el.innerText.trim() === 'Grid View' && el.offsetParent !== null); if (grid) grid.click(); });
           await sleep(1500);
           await page.evaluate(() => { let cards = [...document.querySelectorAll('div')]; let target = cards.find(el => el.innerText.trim() === 'SAN FRANCISCO' && el.offsetWidth > 150 && el.offsetHeight > 50); if (target) target.click(); });
           await sleep(1500);
           await page.evaluate(() => { let btn = [...document.querySelectorAll('button')].find(b => b.innerText.includes('Travel to Selected Location')); if (btn) btn.click(); });
           await sleep(1500);
           await page.waitForFunction(() => document.body.innerText.includes('Are you sure'), { timeout: 15000 }).catch(() => {});
           await page.evaluate(() => { let allBtns = [...document.querySelectorAll('button')]; let travelBtn = allBtns.find(b => b.innerText.trim() === 'TRAVEL'); if (travelBtn) travelBtn.click(); });
           await sleep(5000);
           let verify = await page.evaluate(() => document.body.innerText.includes('Black Market - San Francisco') || document.body.innerText.includes('San Francisco'));
           if (verify) console.log("🎉 وصلنا سان فرانسيسكو!");
           else { console.log("⚠️ مشكلة، نرجع للسوق"); await page.goto('https://www.project-dark.co.uk/blackmarket', { waitUntil: 'networkidle2' }); }
           continue;
        }
      }
      
      else {
          console.log("⚠️ مدينة غير معروفة، بجرب تاني...");
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
