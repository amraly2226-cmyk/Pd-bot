const puppeteer = require('puppeteer');

// ✅ ضع بيانات حسابك هنا (اللي هيسجل بيها دخول تلقائي)
const USERNAME = 'amr.aly.2226@gmail.com'; 
const PASSWORD = 'Gun@12345';

const ITEMS = ["Anabolic steroid","Artifacts","Alcohol","Electronics","Plastic jewelry","Stolen paintings","Human beings","Confidential documents","Endangered exotic animals","Organs"];
let step = 'buy'; 
let targetCity = "Cairo"; // عدلها حسب مدينتك
let targetItem = "Electronics"; // عدلها حسب السلعة

async function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

(async () => {
  console.log("🚀 البوت شغال، جاري تسجيل الدخول تلقائياً...");
  
  const browser = await puppeteer.launch({ 
    headless: true, 
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu'] 
  });
  const page = await browser.newPage();
  page.setDefaultTimeout(15000);

  try {
    // 1) التوجه لصفحة تسجيل الدخول
    await page.goto('https://www.project-dark.co.uk/login', { waitUntil: 'networkidle2', timeout: 60000 });

    // 2) البحث عن حقول الإدخال (الاسم والباسورد) والكتابة فيها
    const inputs = await page.$$('input[type="text"], input[type="email"], input[type="password"]');
    if (inputs.length >= 2) {
       await inputs[0].click({ clickCount: 3 }); // مسح أي حاجة قديمة
       await inputs[0].type(USERNAME);
       
       await inputs[1].click({ clickCount: 3 });
       await inputs[1].type(PASSWORD);
    } else {
       // خطة بديلة لو الموقع مخفي الحقول بطريقة مختلفة
       await page.evaluate((u, p) => {
          let user = document.querySelector('input[name="username"], input[name="email"], input[type="text"]');
          let pass = document.querySelector('input[name="password"], input[type="password"]');
          if (user) user.value = u;
          if (pass) pass.value = p;
       }, USERNAME, PASSWORD);
    }

    // 3) الضغط على زر الدخول
    await page.click('button[type="submit"], input[type="submit"], button:has-text("Login")').catch(e => console.log("جاري محاولة الضغط على زر الدخول..."));

    // 4) انتظار تحميل الصفحة بعد الدخول
    await sleep(5000);
    console.log("✅ تم تسجيل الدخول بنجاح!");

    // 5) التوجه للسوق مباشرة
    await page.goto('https://www.project-dark.co.uk/blackmarket', { waitUntil: 'networkidle2', timeout: 60000 });
    console.log("✅ دخلنا السوق الأسود");

  } catch (e) {
    console.log("⚠️ مشكلة في تسجيل الدخول الآلي:", e.message);
    console.log("🔑 الحل: إذا كان في كابتشا أو طلب إثبات بشري، افتح تبويب Webview من Replit وسجل الدخول بنفسك مرة واحدة فقط، ثم اترك البوت يعمل.");
  }

  // 6) اللوب الرئيسي (بيع وشراء وسفر)
  while (true) {
    try {
      let state = await page.evaluate(() => {
        let body = document.body.innerText;
        let cd = body.match(/You cannot travel for:?\s*([0-9hms ]+)/i);
        let holdMatch = body.match(/holding (\d+) items/i); 
        return { body, cd: cd ? cd[1] : null, hold: holdMatch ? +holdMatch[1] : 0 };
      });

      if (state.cd) {
        console.log(`⏳ كولداون: ${state.cd}`);
        if (!page.url().includes('travel')) {
           await page.evaluate(() => { let a = [...document.querySelectorAll('a')].find(x => x.innerText.trim() === 'Travel'); if (a) a.click(); });
           await sleep(2000);
        }
        await sleep(10000);
        continue;
      }

      if (step === 'buy') {
        if (!page.url().includes('blackmarket')) {
          await page.evaluate(() => { let a = [...document.querySelectorAll('a')].find(x => x.innerText.includes('Blackmarket')); if (a) a.click(); });
          await sleep(2000);
          continue;
        }

        let actionResult = await page.evaluate((items, targetItem) => {
          let rows = [...document.querySelectorAll('tr')];
          let heldItem = null;
          for (let r of rows) {
             if (r.innerText.includes('Sell All') && !r.innerText.includes('Confirm')) {
                let txt = r.innerText.toLowerCase();
                for (let it of items) if (txt.includes(it.toLowerCase())) { heldItem = it; break; }
                break;
             }
          }
          if (heldItem && heldItem !== targetItem) {
             for (let r of rows) {
                if (r.innerText.includes('Sell All') && !r.innerText.includes('Confirm')) {
                   let btn = [...r.querySelectorAll('button')].find(b => b.innerText.trim() === 'Sell All');
                   if (btn) { btn.click(); return `بيع الصنف الغلط (${heldItem})...`; }
                }
             }
          }
          if (!heldItem) {
             for (let r of rows) {
                if (r.innerText.includes(targetItem) && r.innerText.includes('£')) {
                   let mb = [...r.querySelectorAll('button')].find(b => b.innerText.includes('Max Buy'));
                   if (mb) { mb.click(); return `شراء ${targetItem}...`; }
                }
             }
          }
          return "في انتظار الصفقة...";
        }, ITEMS, targetItem);

        console.log(actionResult);
        await sleep(2000);
        if (state.hold > 0) step = 'travel';
      }

      if (step === 'travel') {
         if (!page.url().includes('travel')) {
            await page.evaluate(() => { let a = [...document.querySelectorAll('a')].find(x => x.innerText.trim() === 'Travel'); if (a) a.click(); });
            await sleep(2000);
            continue;
         }
         console.log(`✈️ هسافر لـ ${targetCity}...`);
         await page.evaluate((city) => {
            let allEls = [...document.querySelectorAll('*')];
            let targetEl = allEls.find(e => e.children.length === 0 && e.innerText.trim().toUpperCase() === city.toUpperCase() && e.offsetParent !== null);
            if (targetEl) targetEl.click();
         }, targetCity);
         await sleep(1500);
         await page.evaluate(() => {
            let tb = [...document.querySelectorAll('button')].find(b => b.innerText.includes('Travel to Selected Location'));
            if (tb) { tb.click(); setTimeout(() => { let cb = [...document.querySelectorAll('button')].find(b => b.innerText.trim() === 'TRAVEL'); if (cb) cb.click(); }, 1200); }
         });
         console.log(`✅ وصلت ${targetCity}... رجعنا للسوق`);
         step = 'buy';
         await sleep(3000);
         await page.evaluate(() => { let a = [...document.querySelectorAll('a')].find(x => x.innerText.includes('Blackmarket')); if (a) a.click(); });
      }

    } catch (e) {
      console.log("حصل خطأ مؤقت، هعيد المحاولة بعد 15 ثانية:", e.message);
      await sleep(15000);
    }
    await sleep(10000);
  }
})();
