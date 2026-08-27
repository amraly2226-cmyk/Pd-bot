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

        // 🔥 سأزيل الفحص المعقد لـ "hold" هنا، وسأعتمد على "اشتري وطلع فوراً"
        return { loc, cd: cooldownStr };
      }, ITEMS);

      // ✅ لو في كولداون حقيقي (أكبر من 00)، انتظر. لو 00 كمّل فوراً
      if (parseCooldownToSeconds(state.cd) > 0) {
        console.log(`⏳ في كولداون: ${state.cd} - هستنى دقيقة...`);
        await sleep(60000);
        continue;
      }

      // ✅ كايرو: بيع الإلكترونيكس أو شراء أنابوليك (مش هنرجع للسوق تاني)
      if (state.loc === "Cairo") {
        // لو شايل إلكترونيكس، ابيعها
        if (await page.evaluate(() => document.body.innerText.includes('Electronics') && document.body.innerText.includes('Sell All'))) {
           console.log("📍 كايرو - بيع الإلكترونيكس");
           await page.evaluate(() => { let rows = [...document.querySelectorAll('tr')]; for (let r of rows) { if (r.innerText.includes('Sell All') && !r.innerText.includes('Confirm')) { let btn = [...r.querySelectorAll('button')].find(b => b.innerText.trim() === 'Sell All'); if (btn) { btn.click(); break; } } } });
           await sleep(2000);
           await page.waitForFunction(() => document.body.innerText.includes('Confirm Sell All'), { timeout: 5000 }).catch(() => {});
           await page.evaluate(() => { let b = [...document.querySelectorAll('button')].find(b => b.innerText.trim() === 'SELL ALL' && b.offsetParent !== null); if (b) b.click(); });
           await sleep(2000);
           continue;
        }

        // 🔥 الشراء والتوجه للسفر فوراً (بدون أي فحص تاني)
        console.log("📍 كايرو - شراء أنابوليك، وروح للسفر فوراً");
        await page.evaluate(() => { let rows = [...document.querySelectorAll('tr')]; for (let r of rows) { if (r.innerText.includes('Anabolic steroid') && r.innerText.includes('£')) { let mb = [...r.querySelectorAll('button')].find(b => b.innerText.includes('Max Buy')); if (mb) { mb.click(); break; } } } });
        await sleep(1000);
        await page.evaluate(() => { let b = [...document.querySelectorAll('button')].find(b => b.innerText.trim() === 'BUY MAX'); if (b) b.click(); });
        await sleep(2000);
        
        console.log("✅ اشتريت! جاري الذهاب للسفر فوراً...");
        await page.goto('https://www.project-dark.co.uk/travel');
        continue;
      }

      // ✅ طوكيو: بيع الأنابوليك أو شراء إلكترونيكس (مش هنرجع للسوق تاني)
      else if (state.loc === "Tokyo") {
        // لو شايل أنابوليك، ابيعها
        if (await page.evaluate(() => document.body.innerText.includes('Anabolic steroid') && document.body.innerText.includes('Sell All'))) {
           console.log("📍 طوكيو - بيع الأنابوليك");
           await page.evaluate(() => { let rows = [...document.querySelectorAll('tr')]; for (let r of rows) { if (r.innerText.includes('Anabolic steroid') && r.innerText.includes('Sell All') && !r.innerText.includes('Confirm')) { let b = [...r.querySelectorAll('button')].find(b => b.innerText.trim() === 'Sell All'); if (b) { b.click(); break; } } } });
           await sleep(2000);
           await page.waitForFunction(() => document.body.innerText.includes('Confirm Sell All'), { timeout: 5000 }).catch(() => {});
           await page.evaluate(() => { let b = [...document.querySelectorAll('button')].find(b => b.innerText.trim() === 'SELL ALL' && b.offsetParent !== null); if (b) b.click(); });
           await sleep(2000);
           continue;
        }

        // 🔥 الشراء والتوجه للسفر فوراً
        console.log("📍 طوكيو - شراء إلكترونيكس، وروح للسفر فوراً");
        await page.evaluate(() => { let rows = [...document.querySelectorAll('tr')]; for (let r of rows) { if (r.innerText.includes('Electronics') && r.innerText.includes('£')) { let mb = [...r.querySelectorAll('button')].find(b => b.innerText.includes('Max Buy')); if (mb) { mb.click(); break; } } } });
        await sleep(1000);
        await page.evaluate(() => { let b = [...document.querySelectorAll('button')].find(b => b.innerText.trim() === 'BUY MAX'); if (b) b.click(); });
        await sleep(2000);

        console.log("✅ اشتريت! جاري الذهاب للسفر فوراً...");
        await page.goto('https://www.project-dark.co.uk/travel');
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
