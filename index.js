const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

const USERNAME = process.env.PD_USER;
const PASSWORD = process.env.PD_PASS;

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
    // 1. فتح صفحة تسجيل الدخول
    console.log("⏳ فتح صفحة تسجيل الدخول...");
    await page.goto('https://www.project-dark.co.uk/login', { waitUntil: 'networkidle2', timeout: 60000 });

    // 2. الاستعداد للتحقق (10 ثواني)
    console.log("⏳ استنى 10 ثواني عشان التحقق (Verification)...");
    await sleep(10000);

    // 3. كتابة اليوزر نيم والباسورد
    const emailInput = await page.$('input[type="email"], input[name="email"]');
    if (emailInput) {
        await emailInput.click();
        await emailInput.type(USERNAME, { delay: 50 });
    }
    
    const passInput = await page.$('input[type="password"]');
    if (passInput) {
        await passInput.click();
        await passInput.type(PASSWORD, { delay: 50 });
    }

    // 4. الضغط على زر تسجيل الدخول
    console.log("🔑 الضغط على زر تسجيل الدخول...");
    await page.click('button[type="submit"]').catch(() => {});
    await page.evaluate(() => {
        const btn = [...document.querySelectorAll('button')].find(b => b.innerText.trim().toUpperCase() === 'LOGIN');
        if (btn) btn.click();
    });

    // 5. انتظار 5 ثواني فقط (بدل ما ننتظر تغيير الرابط لأنه مش بيحصل)
    console.log("⏳ جاري الانتظار 5 ثواني لتأكيد الدخول...");
    await sleep(5000);

    // 6. التوجه المباشر للبلاك ماركت فوراً (زي ما طلبت بالظبط)
    console.log("🚀 الانتقال المباشر لصفحة البلاك ماركت...");
    await page.goto('https://www.project-dark.co.uk/blackmarket', { waitUntil: 'networkidle2', timeout: 60000 });

    // لو لسه مأخدناكش للبلاك ماركت، جربنا مرة تانية
    if (page.url().includes('login')) {
         console.log("⚠️ لسه واقف على اللوجين، جاري محاولة أخيرة بالانتقال المباشر...");
         await page.goto('https://www.project-dark.co.uk/blackmarket', { waitUntil: 'domcontentloaded', timeout: 60000 });
    }

    console.log("✅ الصفحة الحالية:", page.url());

  } catch (e) {
    console.log("❌ مشكلة في الدخول:", e.message);
    console.log("👀 اللينك الحالي:", page.url());
    await browser.close();
    return;
  }

  // من هنا يبدأ يقرأ المدينة ويشتغل (نفس اللوجيك السابق)
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

      if (state.cd) {
        console.log(`⏳ في كولداون: ${state.cd} - هستنى دقيقة وأعيد المحاولة...`);
        await sleep(60000);
        continue;
      }

      // (ضع هنا كود البيع والشراء الخاص بك، وهو موجود في نسختك القديمة)
      // مثال بسيط:
      console.log("📍 الحالة الحالية:", state.loc, "| معايا:", state.hold, "| العنصر:", state.heldItem);

    } catch (e) {
      console.log("حصل خطأ مؤقت، معيد المحاولة:", e.message);
      await sleep(15000);
    }
    await sleep(10000);
  }
})();
