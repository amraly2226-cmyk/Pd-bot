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
  
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
  await page.setViewport({ width: 1920, height: 1080 }); 
  page.setDefaultTimeout(60000);

  try {
    if (COOKIE_VALUE) {
        // 🔥 الحل الجديد: فك ترميز الكوكيز (%3D إلى =) عشان الخادم يتعرف عليها
        const decodedCookie = decodeURIComponent(COOKIE_VALUE);
        
        await page.setCookie({ name: 'project-dark-session', value: decodedCookie, domain: '.project-dark.co.uk' });
        
        console.log("🚀 فتح البلاك ماركت مباشرة...");
        await page.goto('https://www.project-dark.co.uk/blackmarket', { waitUntil: 'networkidle2', timeout: 60000 });
        
        const pageUrl = page.url();
        
        if (pageUrl.includes('login')) {
            console.log(`❌ الموقع لسه رجعنا لصفحة الدخول. الرابط الحالي: ${pageUrl}`);
            console.log("💡 أهم سبب: يا إما الكوكيز منتهية تماماً، يا إما لازم تسجل خروج وتعيد تسجيل دخول في اللعبة وتاخد كوكيز جديدة فوراً.");
            console.log("🛡️ حل بديل: لو الكوكيز مش راضية تشتغل، امسح قيمة PD_COOKIE نهائياً واعتمد على اليوزر والباسورد (PD_USER و PD_PASS).");
            await browser.close();
            return;
        }
        console.log("✅ دخلنا بالكوكيز ووصلنا للبلاك ماركت:", pageUrl);
    } else {
        // لو الكوكيز مش موجودة، اتسجل بالحساب
        await page.goto('https://www.project-dark.co.uk/login', { waitUntil: 'networkidle2', timeout: 60000 });
        const inputs = await page.$$('input[type="text"], input[type="email"], input[type="password"]');
        if (inputs.length >= 2) {
           await inputs[0].type(USERNAME);
           await inputs[1].type(PASSWORD);
        }
        await page.click('button[type="submit"]').catch(() => {});
        await sleep(5000);
        await page.goto('https://www.project-dark.co.uk/blackmarket', { waitUntil: 'networkidle2', timeout: 60000 });
        console.log("✅ دخلنا بالحساب ووصلنا للبلاك ماركت:", page.url());
    }
  } catch (e) {
    console.log("⚠️ مشكلة في الدخول:", e.message);
    await browser.close();
    return;
  }

  // ... باقي كود البوت (زي ما هو بالظبط من غير تغيير) ...
  while (true) {
    // (انسخ الجزء الخاص بالشراء والبيع من الكود السابق هنا)
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
        console.log("📍 مش لاقي Location. الرابط الحالي:", page.url());
        await sleep(10000);
        continue;
      } else {
        console.log("📍 المدينة الحالية:", state.loc);
      }
      // ... (انسخ باقي اللوجيك هنا من الكود السابق)
    } catch (e) {
      console.log("حصل خطأ مؤقت، معيد المحاولة:", e.message);
      await sleep(15000);
    }
    await sleep(10000);
  }
})();
