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

  while (true) {
    try {
      // ✅ 1) لو إحنا في صفحة السفر، نفذ السفر أولاً وخلاص
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

        // (1) اختيار جرايد فيو
        await page.evaluate(() => { let grid = [...document.querySelectorAll('a, span, div, button')].find(el => el.innerText.trim() === 'Grid View' && el.offsetParent !== null); if (grid) grid.click(); });
        await sleep(1500);
           
        // (2) اختيار البلد من الكارت
        await page.evaluate((city) => {
          let cards = [...document.querySelectorAll('div')];
          let target = cards.find(el => el.innerText.trim() === city && el.offsetWidth > 150 && el.offsetHeight > 50);
          if (target) target.click();
        }, destCity);
        await sleep(1500);

        // (3) الضغط على Travel to Selected Location
        await page.evaluate(() => { let btn = [...document.querySelectorAll('button')].find(b => b.innerText.includes('Travel to Selected Location')); if (btn) btn.click(); });
        await sleep(1500);

        // (4) انتظار البوباب
        await page.waitForFunction(() => document.body.innerText.includes('Are you sure'), { timeout: 10000 }).catch(() => {});
           
        // (5) الضغط على TRAVEL جوه البوباب
        await page.evaluate(() => { let allBtns = [...document.querySelectorAll('button')]; let travelBtn = allBtns.find(b => b.innerText.trim() === 'TRAVEL' && b.offsetParent !== null); if (travelBtn) travelBtn.click(); });
        
        console.log(`✈️ تم الضغط على زر TRAVEL لـ ${destCity}`);
        await sleep(5000);
        
        // بعد السفر، نروح للسوق الجديدة عشان نبيع ونشتري
        await page.goto('https://www.project-dark.co.uk/blackmarket');
        continue;
      }

      // ✅ 2) لو إحنا في السوق، نفذ البيع والشراء
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

        return { loc, cd: cooldownStr };
      }, ITEMS);

      // لو في كولداون حقيقي (أكبر من 00)، انتظر
      if (parseCooldownToSeconds(state.cd) > 0) {
        console.log(`⏳ في كولداون: ${state.cd} - هستنى دقيقة...`);
        await sleep(60000);
        continue;
      }

      // ✅ كايرو: بيع الإلكترونيكس أو شراء أنابوليك
      if (state.loc === "Cairo") {
        if (await page.evaluate(() => document.body.innerText.includes('Electronics') && document.body.innerText.includes('Sell All'))) {
           console.log("📍 كايرو - بيع الإلكترونيكس");
           await page.evaluate(() => { let rows = [...document.querySelectorAll('tr')]; for (let r of rows) { if (r.innerText.includes('Sell All') && !r.innerText.includes('Confirm')) { let btn = [...r.querySelectorAll('button')].find(b => b.innerText.trim() === 'Sell All'); if (btn) { btn.click(); break; } } } });
           await sleep(2000);
           await page.waitForFunction(() => document.body.innerText.includes('Confirm Sell All'), { timeout: 5000 }).catch(() => {});
           await page.evaluate(() => { let b = [...document.querySelectorAll('button')].find(b => b.innerText.trim() === 'SELL ALL' && b.offsetParent !== null); if (b) b.click(); });
           await sleep(2000);
           continue;
        }

        // 🔥 الشراء، وبعدين الانتقال لصفحة السفر
        console.log("📍 كايرو - شراء أنابوليك، وبعدين انتقال مباشر للسفر");
        await page.evaluate(() => { let rows = [...document.querySelectorAll('tr')]; for (let r of rows) { if (r.innerText.includes('Anabolic steroid') && r.innerText.includes('£')) { let mb = [...r.querySelectorAll('button')].find(b => b.innerText.includes('Max Buy')); if (mb) { mb.click(); break; } } } });
        await sleep(1000);
        await page.evaluate(() => { let b = [...document.querySelectorAll('button')].find(b => b.innerText.trim() === 'BUY MAX'); if (b) b.click(); });
        await sleep(2000);
        
        console.log("✅ اشتريت! جاري الانتقال لصفحة السفر فوراً...");
        await page.goto('https://www.project-dark.co.uk/travel', { waitUntil: 'networkidle2' });
        continue;
      }

      // ✅ طوكيو: بيع الأنابوليك أو شراء إلكترونيكس
      else if (state.loc === "Tokyo") {
        if (await page.evaluate(() => document.body.innerText.includes('Anabolic steroid') && document.body.innerText.includes('Sell All'))) {
           console.log("📍 طوكيو - بيع الأنابوليك");
           await page.evaluate(() => { let rows = [...document.querySelectorAll('tr')]; for (let r of rows) { if (r.innerText.includes('Anabolic steroid') && r.innerText.includes('Sell All') && !r.innerText.includes('Confirm')) { let b = [...r.querySelectorAll('button')].find(b => b.innerText.trim() === 'Sell All'); if (b) { b.click(); break; } } } });
           await sleep(2000);
           await page.waitForFunction(() => document.body.innerText.includes('Confirm Sell All'), { timeout: 5000 }).catch(() => {});
           await page.evaluate(() => { let b = [...document.querySelectorAll('button')].find(b => b.innerText.trim() === 'SELL ALL' && b.offsetParent !== null); if (b) b.click(); });
           await sleep(2000);
           continue;
        }

        // 🔥 الشراء، وبعدين الانتقال لصفحة السفر
        console.log("📍 طوكيو - شراء إلكترونيكس، وبعدين انتقال مباشر للسفر");
        await page.evaluate(() => { let rows = [...document.querySelectorAll('tr')]; for (let r of rows) { if (r.innerText.includes('Electronics') && r.innerText.includes('£')) { let mb = [...r.querySelectorAll('button')].find(b => b.innerText.includes('Max Buy')); if (mb) { mb.click(); break; } } } });
        await sleep(1000);
        await page.evaluate(() => { let b = [...document.querySelectorAll('button')].find(b => b.innerText.trim() === 'BUY MAX'); if (b) b.click(); });
        await sleep(2000);

        console.log("✅ اشتريت! جاري الانتقال لصفحة السفر فوراً...");
        await page.goto('https://www.project-dark.co.uk/travel', { waitUntil: 'networkidle2' });
        continue;
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
    await sleep(5000);
  }
})();
