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
      // 1) لو إحنا في صفحة السفر: ننفذ السفر
      if (page.url().includes('travel')) {
        // دالة لقراءة المدينة الحالية من أي بلد
        let currentCity = await page.evaluate(() => {
            let body = document.body.innerText;
            let m = body.match(/Location\s*\n\s*(Cairo|Tokyo|Sydney|London|Moscow|Rome|Capetown|Ottawa|Rio de Janeiro)/i);
            if (m) return m[1];
            if (body.includes('Black Market - Cairo')) return 'Cairo';
            if (body.includes('Black Market - Tokyo')) return 'Tokyo';
            return null;
        });

        // تحديد الوجهة:
        // - لو في طوكيو => كايرو
        // - لو في كايرو => طوكيو
        // - لو في أي مدينة تانية => كايرو
        let destCity;
        if (currentCity === 'Tokyo') {
            destCity = 'Cairo';
        } else if (currentCity === 'Cairo') {
            destCity = 'Tokyo';
        } else {
            destCity = 'Cairo'; // أي بلد تانية ترجع لكايرو
        }

        console.log(`✈️ ${currentCity} - جاري تجهيز السفر إلى ${destCity}`);

        // 1) اختيار جرايد فيو
        await page.evaluate(() => { let grid = [...document.querySelectorAll('a, span, div, button')].find(el => el.innerText.trim() === 'Grid View' && el.offsetParent !== null); if (grid) grid.click(); });
        await sleep(1500);

        // 2) اختيار البلد من البطاقة (بننتظر ظهورها)
        await page.waitForSelector('div, span, a', { visible: true, timeout: 5000 }).catch(() => {});
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

        // 5) البحث عن زر TRAVEL في النافذة والضغط عليه
        await page.evaluate(() => {
            let allBtns = [...document.querySelectorAll('button')];
            let travelBtn = allBtns.find(b => b.innerText.trim() === 'TRAVEL');
            if (travelBtn) travelBtn.click();
        });

        console.log(`✈️ تم الضغط على زر السفر إلى ${destCity}`);
        await sleep(7000); // انتظار تحميل المدينة الجديدة
        await page.goto('https://www.project-dark.co.uk/blackmarket');
        continue;
      }

      // 2) لو إحنا في السوق: بيع وشراء
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
        if (loc && loc.includes('Cairo')) loc = 'Cairo';
        else if (loc && loc.includes('Tokyo')) loc = 'Tokyo';
        // لاحظ: أي مدينة تانية هيتم التعامل معها كـ "أي بلد تاني"
        else if (loc) loc = 'Other';
        
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

      if (state.cd) {
        console.log(`⏳ في كولداون: ${state.cd} - هستنى 5 دقايق وأعيد المحاولة...`);
        await sleep(300000);
        continue;
      }

      // ✅ لو في أي بلد تانية غير كايرو وطوكيو: اذهب للسفر لترجع كايرو
      if (state.loc === 'Other') {
        console.log("📍 انت في مدينة تانية، جاري الذهاب لصفحة السفر للعودة لكايرو");
        await page.goto('https://www.project-dark.co.uk/travel');
        continue;
      }

      // ✅ كايرو
      if (state.loc === "Cairo") {
        if (state.heldItem === "Electronics" && state.hold > 0) {
           console.log("📍 كايرو - بيع الإلكترونيكس");
           await page.evaluate(() => { let rows = [...document.querySelectorAll('tr')]; for (let r of rows) { if (r.innerText.includes('Sell All') && !r.innerText.includes('Confirm')) { let btn = [...r.querySelectorAll('button')].find(b => b.innerText.trim() === 'Sell All'); if (btn) { btn.click(); break; } } } });
           await sleep(2000);
           await page.waitForFunction(() => document.body.innerText.includes('Confirm Sell All'), { timeout: 5000 }).catch(() => {});
           await page.evaluate(() => { const allBtns = [...document.querySelectorAll('button')]; const confirmBtn = allBtns.find(b => b.innerText.trim() === 'SELL ALL' && b.offsetParent !== null); if (confirmBtn) confirmBtn.click(); });
           await sleep(3000);
           continue;
        }
        
        if (state.hold === 0) {
           console.log("📍 كايرو - شراء أنابوليك سترويدز");
           await page.evaluate(() => { let rows = [...document.querySelectorAll('tr')]; for (let r of rows) { if (r.innerText.includes('Anabolic steroid') && r.innerText.includes('£')) { let mb = [...r.querySelectorAll('button')].find(b => b.innerText.includes('Max Buy')); if (mb) { mb.click(); break; } } } });
           await sleep(1000);
           await page.evaluate(() => { let btn = [...document.querySelectorAll('button')].find(b => b.innerText.trim() === 'BUY MAX'); if (btn) btn.click(); });
           await sleep(3000);
           continue;
        }
        
        if (state.heldItem === "Anabolic steroid" && state.hold > 0) {
           console.log("📍 كايرو - رايح طوكيو");
           await page.goto('https://www.project-dark.co.uk/travel');
           continue;
        }
      }

      // ✅ طوكيو
      else if (state.loc === "Tokyo") {
        if (state.heldItem === "Anabolic steroid" && state.hold > 0) {
           console.log("📍 طوكيو - بيع الأنابوليك");
           await page.evaluate(() => { let rows = [...document.querySelectorAll('tr')]; for (let r of rows) { if (r.innerText.includes('Anabolic steroid') && r.innerText.includes('Sell All') && !r.innerText.includes('Confirm')) { let btn = [...r.querySelectorAll('button')].find(b => b.innerText.trim() === 'Sell All'); if (btn) { btn.click(); break; } } } });
           await sleep(2000);
           await page.waitForFunction(() => document.body.innerText.includes('Confirm Sell All'), { timeout: 5000 }).catch(() => {});
           await page.evaluate(() => { const allBtns = [...document.querySelectorAll('button')]; const confirmBtn = allBtns.find(b => b.innerText.trim() === 'SELL ALL' && b.offsetParent !== null); if (confirmBtn) confirmBtn.click(); });
           await sleep(3000);
           continue;
        }
        
        if (state.hold === 0) {
           console.log("📍 طوكيو - شراء إلكترونيكس");
           await page.evaluate(() => { let rows = [...document.querySelectorAll('tr')]; for (let r of rows) { if (r.innerText.includes('Electronics') && r.innerText.includes('£')) { let mb = [...r.querySelectorAll('button')].find(b => b.innerText.includes('Max Buy')); if (mb) { mb.click(); break; } } } });
           await sleep(1000);
           await page.evaluate(() => { let btn = [...document.querySelectorAll('button')].find(b => b.innerText.trim() === 'BUY MAX'); if (btn) btn.click(); });
           await sleep(3000);
           continue;
        }

        if (state.heldItem === "Electronics" && state.hold > 0) {
           console.log("📍 طوكيو - رايح كايرو");
           await page.goto('https://www.project-dark.co.uk/travel');
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
