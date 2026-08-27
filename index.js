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

  // 🔥 السطر السحري: ده بيمسك أي بوباب أو نافذة تأكيد (Dialog) ويقبلها تلقائياً
  page.on('dialog', async dialog => { await dialog.accept(); });

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
      // ═══════════════════════════════════════════
      // 1) لو إحنا في صفحة الترافل
      // ═══════════════════════════════════════════
      if (page.url().includes('travel')) {
        let currentCity = await page.evaluate(() => {
            let body = document.body.innerText;
            let m = body.match(/Location\s*\n\s*(Cairo|Tokyo)/i);
            if (m) return m[1];
            if (body.includes('Black Market - Tokyo')) return 'Tokyo';
            if (body.includes('Black Market - Cairo')) return 'Cairo';
            return null;
        });

        if (!currentCity) { await page.goto('https://project-dark.co.uk/travel'); continue; }

        let destCity = (currentCity === 'Tokyo') ? 'Cairo' : 'Tokyo';
        console.log(`✈️ ${currentCity} - جاري تجهيز السفر إلى ${destCity}`);

        // 2) اختيار جرايد فيو
        await page.evaluate(() => { let grid = [...document.querySelectorAll('a, span, div, button')].find(el => el.innerText.trim() === 'Grid View' && el.offsetParent !== null); if (grid) grid.click(); });
        await sleep(1500);

        // 3) اختيار المدينة
        await page.evaluate((city) => {
            let elements = [...document.querySelectorAll('div, span, a')];
            let textEl = elements.find(el => el.innerText.trim() === city && el.offsetParent !== null);
            if (textEl) {
                let card = textEl.closest('div');
                if (card && card.offsetWidth > 100) card.click(); else textEl.click();
            }
        }, destCity);
        await sleep(1500);

        // 4) الضغط على Travel to Selected Location
        await page.evaluate(() => { let btn = [...document.querySelectorAll('button')].find(b => b.innerText.includes('Travel to Selected Location')); if (btn) btn.click(); });
        await sleep(1500);

        // 5) انتظار ظهور البوباب (سواء كان HTML أو Dialog) والضغط على زر TRAVEL
        try {
            // استنى ظهور النص أو الزر، بحد أقصى 10 ثواني
            await page.waitForFunction(() => {
                return document.body.innerText.includes('Are you sure') || 
                       [...document.querySelectorAll('button')].some(b => b.innerText.trim() === 'TRAVEL');
            }, { timeout: 10000 });

            // دوس على زر TRAVEL
            await page.evaluate(() => {
                let allBtns = [...document.querySelectorAll('button')];
                let travelBtn = allBtns.find(b => b.innerText.trim() === 'TRAVEL');
                if (travelBtn) travelBtn.click();
            });
        } catch (e) {
            console.log("⚠️ البوباب مش ظاهر في المتصفح، بنحاول نوصل للزر مباشرة...");
            // لو النافذة مش HTML، الـ page.on('dialog') هيقبلها تلقائياً وتتأكد من الضغط على الزر مرة أخرى
            await page.evaluate(() => {
                let allBtns = [...document.querySelectorAll('button')];
                let travelBtn = allBtns.find(b => b.innerText.trim() === 'TRAVEL');
                if (travelBtn) travelBtn.click();
            });
        }

        // 6) النجاح! استنى 7 ثواني وروح للسوق الجديدة عشان تبيع وتشتري
        console.log(`✈️ تم الضغط على زر TRAVEL والتأكيد لـ ${destCity}`);
        await sleep(7000);
        await page.goto('https://www.project-dark.co.uk/blackmarket');
        continue;
      }

      // ═══════════════════════════════════════════
      // 2) لو إحنا في السوق (بيع وشراء)
      // ═══════════════════════════════════════════
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
        let rows = [...document.querySelectorAll('tr')];
        for (let r of rows) {
            if (r.innerText.includes('Sell All') && !r.innerText.includes('Confirm')) {
                let cells = [...r.querySelectorAll('td')];
                if (cells.length >= 3) {
                    let match = cells[2].innerText.match(/(\d+)/);
                    if (match) hold = +match[1];
                }
            }
        }

        return { loc, cd: cooldownStr, hold };
      }, ITEMS);

      if (parseCooldownToSeconds(state.cd) > 0) {
        console.log(`⏳ في كولداون: ${state.cd} - هستنى دقيقة...`);
        await sleep(60000);
        continue;
      }

      // ✅ كايرو
      if (state.loc === "Cairo") {
        if (state.hold > 0) {
           console.log(`📍 كايرو - شاري ${state.hold}، رايح طوكيو`);
           await page.goto('https://project-dark.co.uk/travel');
           continue;
        }

        console.log("📍 كايرو - فاضي، هشتري أنابوليك وبعدين أسافر");
        await page.evaluate(() => { let rows = [...document.querySelectorAll('tr')]; for (let r of rows) { if (r.innerText.includes('Anabolic steroid') && r.innerText.includes('£')) { let mb = [...r.querySelectorAll('button')].find(b => b.innerText.includes('Max Buy')); if (mb) { mb.click(); break; } } } });
        await sleep(1000);
        await page.evaluate(() => { let b = [...document.querySelectorAll('button')].find(b => b.innerText.trim() === 'BUY MAX'); if (b) b.click(); });
        await sleep(2000);

        console.log("✅ اشتريت، جاري الانتقال للسفر");
        await page.goto('https://project-dark.co.uk/travel');
        continue;
      }

      // ✅ طوكيو
      else if (state.loc === "Tokyo") {
        if (state.hold > 0) {
           console.log(`📍 طوكيو - شاري ${state.hold}، رايح كايرو`);
           await page.goto('https://project-dark.co.uk/travel');
           continue;
        }

        console.log("📍 طوكيو - فاضي، هشتري إلكترونيكس وبعدين أسافر");
        await page.evaluate(() => { let rows = [...document.querySelectorAll('tr')]; for (let r of rows) { if (r.innerText.includes('Electronics') && r.innerText.includes('£')) { let mb = [...r.querySelectorAll('button')].find(b => b.innerText.includes('Max Buy')); if (mb) { mb.click(); break; } } } });
        await sleep(1000);
        await page.evaluate(() => { let b = [...document.querySelectorAll('button')].find(b => b.innerText.trim() === 'BUY MAX'); if (b) b.click(); });
        await sleep(2000);

        console.log("✅ اشتريت، جاري الانتقال للسفر");
        await page.goto('https://project-dark.co.uk/travel');
        continue;
      }

    } catch (e) {
      console.log("حصل خطأ مؤقت، معيد المحاولة:", e.message);
      await sleep(15000);
    }
    await sleep(5000);
  }
})();
