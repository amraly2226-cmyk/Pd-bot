const puppeteer = require('puppeteer');

const USERNAME = 'amr.aly.2226@gmail.com'; 
const PASSWORD = 'Gun@12345';
const COOKIE_VALUE = process.env.PD_COOKIE || "";

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
    if (seconds === 0) { let n = str.match(/(\d+)/); if (n && parseInt(n[1]) > 0) seconds = parseInt(n[1]) * 60; }
    return seconds;
}

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

  // 🔥 متغير لمنع تكرار الشراء بعد أول ضغطة
  let justBought = false;

  while (true) {
    try {
      // 1) لو إحنا في صفحة السفر
      if (page.url().includes('travel')) {
        let travelText = await page.evaluate(() => document.body.innerText);
        let cd = travelText.match(/You cannot travel for:?\s*([0-9hms ]+)/i) || travelText.match(/Travel in\s*([0-9hms ]+)/i);
        
        if (parseCooldownToSeconds(cd ? cd[1] : null) > 0) {
          console.log(`⏳ في كولداون: ${cd[1]} - هستنى دقيقة`);
          await sleep(60000);
          await page.goto('https://www.project-dark.co.uk/travel');
          continue;
        }

        let fromCity = travelText.includes('Black Market - Tokyo') ? 'Tokyo' : 'Cairo';
        let destCity = (fromCity === 'Tokyo') ? 'Cairo' : 'Tokyo';

        console.log(`✈️ ${fromCity} - جاري تجهيز السفر إلى ${destCity}`);

        await page.evaluate(() => { let grid = [...document.querySelectorAll('a, span, div, button')].find(el => el.innerText.trim() === 'Grid View' && el.offsetParent !== null); if (grid) grid.click(); });
        await sleep(2000);

        await page.evaluate((city) => {
            let cards = [...document.querySelectorAll('div')];
            let target = cards.find(el => el.innerText.trim().startsWith(city) && el.offsetWidth > 100 && el.offsetHeight > 50);
            if (target) target.click();
        }, destCity);
        await sleep(1500);

        await page.evaluate(() => { let b = [...document.querySelectorAll('button')].find(b => b.innerText.includes('Travel to Selected Location')); if (b) b.click(); });
        await sleep(1500);

        // 🔥 انتظار أطول للنافذة
        try {
            await page.waitForFunction(() => document.body.innerText.includes('Are you sure'), { timeout: 15000 });
            await page.evaluate(() => {
                let allBtns = [...document.querySelectorAll('button')];
                let travelBtn = allBtns.find(b => b.innerText.trim() === 'TRAVEL' && b.offsetParent !== null);
                if (travelBtn) travelBtn.click();
            });
            console.log(`✈️ تم الضغط على TRAVEL لـ ${destCity}`);
            
            // 🔥 بعد نجاح السفر، نقفل متغير منع الشراء ونروح للسوق
            justBought = false;
            await sleep(5000);
            await page.goto('https://www.project-dark.co.uk/blackmarket');
            continue;
            
        } catch (e) {
            console.log("⚠️ النافذة ما ظهرتش، بنحاول تاني من نفس الصفحة (مش هنرجع للسوق)");
            await page.goto('https://www.project-dark.co.uk/travel');
            continue;
        }
      }

      // 2) لو إحنا في السوق، والشراء ممنوع (لأنه لسه مخلصش السفر)، نوجهه للسفر
      if (justBought) {
        await page.goto('https://www.project-dark.co.uk/travel');
        continue;
      }

      // 3) كود السوق (البيع والشراء - لم يتغير نهائياً)
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

      if (parseCooldownToSeconds(state.cd) > 0) {
        console.log(`⏳ في كولداون: ${state.cd} - هستنى دقيقة...`);
        await sleep(60000);
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
           console.log("📍 كايرو - شراء أنابوليك، وروح للسفر فوراً");
           await page.evaluate(() => { let rows = [...document.querySelectorAll('tr')]; for (let r of rows) { if (r.innerText.includes('Anabolic steroid') && r.innerText.includes('£')) { let mb = [...r.querySelectorAll('button')].find(b => b.innerText.includes('Max Buy')); if (mb) { mb.click(); break; } } } });
           await sleep(1000);
           await page.evaluate(() => { let btn = [...document.querySelectorAll('button')].find(b => b.innerText.trim() === 'BUY MAX'); if (btn) btn.click(); });
           await sleep(2000);
           
           // 🔥 تأكيد الشراء، نمنع الشراء التاني ونروح للسفر
           justBought = true;
           await page.goto('https://www.project-dark.co.uk/travel');
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
           await page.evaluate(() => { const rows = [...document.querySelectorAll('tr')]; for (let r of rows) { const text = r.innerText; if (text.includes('Anabolic steroid') && text.includes('Sell All') && !text.includes('Confirm')) { const btn = [...r.querySelectorAll('button')].find(b => b.innerText.trim() === 'Sell All'); if (btn) { btn.click(); break; } } } });
           await sleep(2000);
           await page.waitForFunction(() => document.body.innerText.includes('Confirm Sell All'), { timeout: 5000 }).catch(() => {});
           await page.evaluate(() => { const allBtns = [...document.querySelectorAll('button')]; const confirmBtn = allBtns.find(b => b.innerText.trim() === 'SELL ALL' && b.offsetParent !== null); if (confirmBtn) confirmBtn.click(); });
           await sleep(3000);
           continue;
        }
        
        if (state.hold === 0) {
           console.log("📍 طوكيو - شراء إلكترونيكس، وروح للسفر فوراً");
           await page.evaluate(() => { let rows = [...document.querySelectorAll('tr')]; for (let r of rows) { if (r.innerText.includes('Electronics') && r.innerText.includes('£')) { let mb = [...r.querySelectorAll('button')].find(b => b.innerText.includes('Max Buy')); if (mb) { mb.click(); break; } } } });
           await sleep(1000);
           await page.evaluate(() => { let btn = [...document.querySelectorAll('button')].find(b => b.innerText.trim() === 'BUY MAX'); if (btn) btn.click(); });
           await sleep(2000);
           
           // 🔥 تأكيد الشراء، نمنع الشراء التاني ونروح للسفر
           justBought = true;
           await page.goto('https://www.project-dark.co.uk/travel');
           continue;
        }

        if (state.heldItem === "Electronics" && state.hold > 0) {
           console.log("📍 طوكيو - رايح كايرو");
           await page.goto('https://www.project-dark.co.uk/travel');
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
