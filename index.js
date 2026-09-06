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

    // 2) استنى 10 ثواني الأول (بدون أي خطوات تانية)
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

    // 5) دوس على كلمة Verify (الفريفيكيشن)
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
    
    // (مهلة قصيرة جداً جداً عشان الـ Verify يثبت، بدون نوم طويل)
    await sleep(2000);

    // 6) دوس لوجين
    console.log("🔑 الضغط على زر تسجيل الدخول (LOGIN)...");
    await page.click('button[type="submit"]').catch(() => {
        return page.evaluate(() => {
            const btn = [...document.querySelectorAll('button')].find(b => b.innerText.trim().toUpperCase() === 'LOGIN');
            if (btn) btn.click();
        });
    });

    // استنى 10 ثواني بعد اللوجين عشان نشوف النتيجة
    console.log("⏳ استنى 10 ثواني بعد الضغط على لوجين...");
    await sleep(10000);

    // 7) تقرير حالة الصفحة (هل دخل ولا لأ؟)
    const currentUrl = page.url();
    const pageText = await page.evaluate(() => document.body.innerText).catch(() => "تعذر قراءة الصفحة");

    console.log("\n========== 📊 تقرير حالة الصفحة ==========");
    console.log("🔗 الرابط الحالي:", currentUrl);

    if (currentUrl.includes('login') && pageText.includes('LOGIN')) {
        console.log("❌ الحالة: فشل الدخول! الصفحة ما زالت هي صفحة اللوجين.");
        console.log("🤔 السبب غالباً: الـ Cloudflare رفض البوت من السيرفر، أو كلمة السر غلط.");
    } else if (pageText.includes('Game Closed')) {
        console.log("🌙 الحالة: اللعبة مقفولة حالياً (Game Closed).");
    } else if (currentUrl.includes('dashboard')) {
        console.log("✅ الحالة: تم الدخول بنجاح! أنت الآن على الداش بورد.");
    } else if (currentUrl.includes('blackmarket')) {
        console.log("✅ الحالة: تم الدخول بنجاح! أنت الآن على البلاك ماركت.");
    } else {
        console.log("⚠️ الحالة: مش واضحة. المحتوى:");
        console.log(pageText.substring(0, 300));
    }
    console.log("=========================================\n");

  } catch (e) {
    console.log("⚠️ حصلت مشكلة غير متوقعة أثناء الدخول:", e.message);
  }
})();
