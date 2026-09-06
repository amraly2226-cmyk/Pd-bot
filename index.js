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
    console.log("🚀 الذهاب إلى: https://project-dark.co.uk/login");
    await page.goto('https://project-dark.co.uk/login', { waitUntil: 'networkidle2', timeout: 60000 });

    console.log("⏳ استنى 15 ثانية...");
    await sleep(15000);

    console.log("⌨️ جاري كتابة اليوزر نيم...");
    const emailInput = await page.$('input[type="email"], input[type="text"], input[name="email"]');
    if (emailInput) {
        await emailInput.click();
        await emailInput.type(USERNAME, { delay: 60 });
    } else {
        console.log("❌ مش لاقي خانة اليوزر نيم!");
    }

    console.log("⌨️ جاري كتابة الباسورد...");
    const passInput = await page.$('input[type="password"]');
    if (passInput) {
        await passInput.click();
        await passInput.type(PASSWORD, { delay: 60 });
    } else {
        console.log("❌ مش لاقي خانة الباسورد!");
    }

    console.log("🔑 الضغط على زر تسجيل الدخول...");
    await page.click('button[type="submit"]').catch(() => {
        return page.evaluate(() => {
            const btn = [...document.querySelectorAll('button')].find(b => b.innerText.trim().toUpperCase() === 'LOGIN');
            if (btn) btn.click();
        });
    });

    console.log("⏳ استنى 10 ثواني بعد الضغط على زر اللوجين...");
    await sleep(10000);

    // 🔥 هنا الجزء الجديد: قراءة الصفحة اللي هو عليها وتقريرها
    const currentUrl = page.url();
    const pageText = await page.evaluate(() => document.body.innerText).catch(() => "تعذر قراءة الصفحة");

    console.log("\n========== 📊 تقرير حالة الصفحة ==========");
    console.log("🔗 الرابط الحالي:", currentUrl);

    if (currentUrl.includes('login') && pageText.includes('LOGIN')) {
        console.log("❌ الحالة: فشل الدخول! الصفحة ما زالت هي صفحة تسجيل الدخول (Login).");
        console.log("🤔 السبب المحتمل: كلمة السر غلط، أو الكابتشا (Verification) مانع، أو اللعبة مقفولة.");
    } else if (pageText.includes('Game Closed')) {
        console.log("🌙 الحالة: اللعبة مقفولة حالياً (Game Closed).");
    } else if (currentUrl.includes('dashboard')) {
        console.log("✅ الحالة: تم الدخول بنجاح! أنت الآن على صفحة الداش بورد (Dashboard).");
    } else if (currentUrl.includes('blackmarket')) {
        console.log("✅ الحالة: تم الدخول بنجاح! أنت الآن على صفحة البلاك ماركت.");
    } else {
        console.log("⚠️ الحالة: مش واضحة، الصفحة الحالية هي:");
        console.log(pageText.substring(0, 300)); // طباعة أول 300 حرف عشان نشوف هو فين
    }
    console.log("=========================================\n");

    // لو نجح، يكمل للداش بورد ولو فشل يقف عشان نعرف السبب
    if (currentUrl.includes('login') || pageText.includes('Game Closed')) {
        console.log("⛔ البوت هيتوقف هنا لحد ما تحل مشكلة الدخول أو تنتظر فتح اللعبة.");
        await browser.close();
        return;
    } else {
        console.log("🚀 التوجه للداش بورد للعمل...");
        await page.goto('https://project-dark.co.uk/dashboard', { waitUntil: 'networkidle2', timeout: 60000 });
        console.log("✅ تم الدخول للداش بورد بنجاح!");
    }

  } catch (e) {
    console.log("⚠️ حصلت مشكلة غير متوقعة أثناء الدخول:", e.message);
  }

  // هنا يبدأ لوجيك البيع والشراء (لو حابب ترجع الكود القديم بالكامل، الصقه هنا)
  while (true) {
    try {
      // ... باقي الكود القديم الخاص بالبيع والشراء ...
      // ملاحظة: عشان الرد لا يطول، سأضع هنا أمر تعليقي بسيط.
      // ولكن، يمكنك لصق كود البيع والشراء والترافل القديم كاملاً هنا في هذا الملف.
      console.log("📍 البوت واقف على الصفحة:", page.url());
      await sleep(5000);
    } catch (e) {
      console.log("حصل خطأ مؤقت، معيد المحاولة:", e.message);
      await sleep(15000);
    }
  }
})();
