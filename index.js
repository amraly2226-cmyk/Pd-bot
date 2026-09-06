const puppeteer = require('puppeteer');

const USERNAME = process.env.PD_USER;
const PASSWORD = process.env.PD_PASS;

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

  try {
    // 1) فتح صفحة اللوجين
    console.log("🚀 الذهاب إلى: https://project-dark.co.uk/login");
    await page.goto('https://project-dark.co.uk/login', { waitUntil: 'networkidle2', timeout: 60000 });

    // 2) استنى 10 ثواني
    console.log("⏳ استنى 10 ثواني الأول...");
    await sleep(10000);

    // 3) كتابة اليوزر نيم
    console.log("⌨️ جاري كتابة اليوزر نيم...");
    const emailInput = await page.$('input[type="email"], input[type="text"], input[name="email"]');
    if (emailInput) {
        await emailInput.click();
        await emailInput.type(USERNAME, { delay: 60 });
    }

    // 4) كتابة الباسورد
    console.log("⌨️ جاري كتابة الباسورد...");
    const passInput = await page.$('input[type="password"]');
    if (passInput) {
        await passInput.click();
        await passInput.type(PASSWORD, { delay: 60 });
    }

    // 5) الضغط على Verify
    console.log("🛡️ جاري الضغط على زر Verify...");
    const frames = page.frames();
    for (const frame of frames) {
        try {
            const checkbox = await frame.$('.ctp-checkbox-label, .ctp-checkbox, input[type="checkbox"], #challenge-stage');
            if (checkbox) {
                await checkbox.click();
                console.log("✅ تم الضغط على Verify بنجاح!");
                break;
            }
        } catch (e) {}
    }
    
    await sleep(2000);

    // 6) الضغط على لوجين
    console.log("🔑 الضغط على زر تسجيل الدخول (LOGIN)...");
    await page.click('button[type="submit"]').catch(() => {
        return page.evaluate(() => {
            const btn = [...document.querySelectorAll('button')].find(b => b.innerText.trim().toUpperCase() === 'LOGIN');
            if (btn) btn.click();
        });
    });

    // 7) استنى 10 ثواني بعد اللوجين
    console.log("⏳ استنى 10 ثواني بعد الضغط على لوجين...");
    await sleep(10000);

    // 📊 تقرير حالة الدخول الأول
    const currentUrl = page.url();
    const pageText = await page.evaluate(() => document.body.innerText).catch(() => "تعذر قراءة الصفحة");
    console.log("\n========== 📊 تقرير حالة الدخول ==========");
    console.log("🔗 الرابط الحالي:", currentUrl);

    if (currentUrl.includes('login') && pageText.includes('LOGIN')) {
        console.log("❌ الحالة: فشل الدخول! (الصفحة لسه لوجين)");
    } else {
        console.log("✅ الحالة: يبدو أن الدخول تم، جاري التوجه للبلاك ماركت...");
    }

    // 🔥 الجزء الجديد اللي طلبته: التوجه للبلاك ماركت وقراءة اللوكيشن
    console.log("\n🚀 جاري الذهاب لصفحة البلاك ماركت...");
    await page.goto('https://www.project-dark.co.uk/blackmarket', { waitUntil: 'domcontentloaded', timeout: 60000 }).catch(() => {});
    await sleep(5000); // استنى 5 ثواني عشان الصفحة تحمل و اللوكيشن يظهر

    const finalUrl = page.url();
    const finalPageText = await page.evaluate(() => document.body.innerText).catch(() => "تعذر قراءة الصفحة");

    console.log("\n========== 📊 تقرير البلاك ماركت واللوكيشن ==========");
    console.log("🔗 الرابط الحالي:", finalUrl);

    // فحص إذا كان رجع للوجين تاني
    if (finalUrl.includes('login')) {
        console.log("❌ فشل الدخول للبلاك ماركت! لسه على اللوجين.");
    } else if (finalPageText.includes('Game Closed')) {
        console.log("🌙 اللعبة مقفولة حالياً (Game Closed).");
    } else {
        // قراءة اللوكيشن من فوق (Location)
        let location = null;
        const lines = finalPageText.split('\n');
        for (let i = 0; i < lines.length; i++) {
            if (lines[i].trim().toUpperCase() === 'LOCATION') {
                for (let j = i + 1; j < lines.length; j++) {
                    if (lines[j].trim()) { location = lines[j].trim(); break; }
                }
                break;
            }
        }
        
        if (location) {
            console.log("✅ دخلت البلاك ماركت بنجاح!");
            console.log("📍 المدينة (اللوكيشن) هي: " + location);
        } else {
            console.log("⚠️ دخلت البلاك ماركت، لكن مش قادر أقرأ اللوكيشن (يمكن اللعبة مقفولة أو الصفحة لسه بتحمل).");
        }
    }
    console.log("=========================================\n");

  } catch (e) {
    console.log("⚠️ حصلت مشكلة غير متوقعة أثناء الدخول:", e.message);
  }
})();
