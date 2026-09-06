const puppeteer = require('puppeteer');

const USERNAME = process.env.PD_USER;
const PASSWORD = process.env.PD_PASS;
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
        console.log("✅ دخلنا بالكوكيز (تم تسجيل الدخول)");

        // 🔥 الحل الجديد: حلقة إعادة المحاولة للدخول للداش بورد
        let dashboardSuccess = false;
        while (!dashboardSuccess) {
            console.log("🚀 جاري الذهاب إلى الرابط: https://project-dark.co.uk/dashboard");
            await page.goto('https://project-dark.co.uk/dashboard', { waitUntil: 'networkidle2', timeout: 60000 }).catch(() => {});

            // فحص: هل الصفحة هي اللوجين؟
            if (page.url().includes('login')) {
                console.log("⚠️ الصفحة الحالية هي: LOGIN (مش عارف أدخل، هحاول تاني)");
                
                // استنى 5 ثواني
                await sleep(5000);
                console.log("🧭 دوس باك (المرة الأولى)...");
                await page.goBack().catch(() => {});
                
                // استنى 5 ثواني تانية
                await sleep(5000);
                console.log("🧭 دوس باك (المرة الثانية)...");
                await page.goBack().catch(() => {});
                
                // استنى 5 ثواني وبعدين كرر المحاولة
                await sleep(5000);
                continue; // هيرجع تاني للـ while ويعيد الـ goto للداش بورد
            } else {
                console.log("✅ عرفت أدخل على الداش بورد بنجاح! (الحالي: " + page.url() + ")");
                dashboardSuccess = true; // نكسر الحلقة ونكمل
            }
        }
        
    } else {
        await page.goto('https://project-dark.co.uk/login', { waitUntil: 'networkidle2', timeout: 60000 });
        const inputs = await page.$$('input[type="text"], input[type="email"], input[type="password"]');
        if (inputs.length >= 2) {
           await inputs[0].type(USERNAME);
           await inputs[1].type(PASSWORD);
        }
        await page.click('button[type="submit"]').catch(() => {});
        await sleep(5000);
        await page.goto('https://project-dark.co.uk/dashboard', { waitUntil: 'networkidle2', timeout: 60000 });
    }
  } catch (e) {
    console.log("⚠️ مشكلة في الدخول:", e.message);
  }

  while (true) {
    try {
      // (منطق السفر والبيع والشراء كما هو بالظبط)
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

      // ✅ لو لسه على اللوجين، ارجع للحلقة الأولى عشان تعيد المحاولة
      if (page.url().includes('login')) {
          console.log("⚠️ الصفحة الحالية: LOGIN (هنايقف ويرجع يحاول يدخل داش بورد)");
          await sleep(5000);
          await page.goto('https://project-dark.co.uk/dashboard', { waitUntil: 'networkidle2' }).catch(() => {});
          continue;
      }

      // لو اللوكيشن null، اطبع التحذير
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

      // الباقي (بيع وشراء سانت لويس وواشنطن)
      if (state.loc === "St Louis") {
        // ... (كود سانت لويس كما هو في ملفك السابق)
      } else if (state.loc === "Washington") {
        // ... (كود واشنطن كما هو في ملفك السابق)
      } else {
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
