const puppeteer = require('puppeteer');

// ✅ اقرأ بياناتك من المتغيرات البيئية في Railway (مهم جدًا تفتح "Variables" وتحطها هناك)
const USERNAME = process.env.PD_USER;
const PASSWORD = process.env.PD_PASS;
const COOKIE_VALUE = process.env.PD_COOKIE; // القيمة بتاعة الكوكيز (هتاخدها من متصفحك)

const ITEMS = ["Anabolic steroid","Artifacts","Alcohol","Electronics","Plastic jewelry","Stolen paintings","Human beings","Confidential documents","Endangered exotic animals","Organs"];
let step = 'buy'; 
let targetCity = "Cairo"; 
let targetItem = "Electronics"; 

(async () => {
  console.log("🚀 البوت بيشتغل...");
  
  // تشغيل المتصفح مع خيارات لتفادي مشاكل الذاكرة في Railway
  const browser = await puppeteer.launch({ 
      headless: true, 
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'] 
  });
  
  const page = await browser.newPage();
  
  // 1) إذا كان عندك الكوكيز، ضعها هنا عشان يتسجل دخول فورًا
  if (COOKIE_VALUE) {
      await page.setCookie({ name: 'PHPSESSID', value: COOKIE_VALUE, domain: '.project-dark.co.uk' });
      console.log("✅ تم تحميل الكوكيز، هجرب أدخل اللعبة فورًا");
  }

  try {
    // 2) حاول فتح السوق مباشرة. لو مش متسجل، هيتحول لصفحة الدخول
    console.log("⏳ جاري فتح اللعبة...");
    await page.goto('https://www.project-dark.co.uk/blackmarket', { waitUntil: 'networkidle2', timeout: 60000 });
    
    // 3) التحقق: لو طلع صفحة تسجيل الدخول، نسجل دخول تلقائي
    if (page.url().includes('login')) {
        console.log("⚠️ مش متسجل، هجرب أسجل دخول تلقائي...");
        await page.waitForSelector('input', { visible: true, timeout: 10000 });
        
        await page.evaluate((u, p) => {
            let userInput = document.querySelector('input[type="text"], input[type="email"], input:not([type])');
            let passInput = document.querySelector('input[type="password"]');
            
            if (userInput && passInput) {
                userInput.value = u;
                passInput.value = p;
                userInput.dispatchEvent(new Event('input', { bubbles: true }));
                passInput.dispatchEvent(new Event('input', { bubbles: true }));
                console.log("🔑 كتبت البيانات، هدوس زر الدخول");
            }
        }, USERNAME, PASSWORD);
        
        await page.click('button[type="submit"], input[type="submit"]').catch(() => {});
        await page.waitForTimeout(5000); // استنى الصفحة تتحمل
        console.log("✅ خلصت تسجيل الدخول، متابعة العمل");
    }

  } catch (e) {
    console.log("❌ حصلت مشكلة في الدخول (احتمال الموقع مش متاح أو مفيش نت).", e.message);
  }

  // 4) اللوب الرئيسي للبيع والشراء
  setInterval(async () => {
    try {
      console.log("🔄 بفحص الحالة...");
      let state = await page.evaluate(() => {
        let body = document.body.innerText;
        let cd = body.match(/You cannot travel for:?\s*([0-9hms ]+)/i);
        let holdMatch = body.match(/holding (\d+) items/i); 
        return { body, cd: cd ? cd[1] : null, hold: holdMatch ? +holdMatch[1] : 0 };
      });

      if (state.cd) {
        console.log(`⏳ في كولداون: ${state.cd}`);
        if (!page.url().includes('travel')) {
           await page.evaluate(() => { let a = [...document.querySelectorAll('a')].find(x => x.innerText.trim() === 'Travel'); if (a) a.click(); });
           await new Promise(r => setTimeout(r, 2000));
        }
        return;
      }

      if (step === 'buy') {
        if (!page.url().includes('blackmarket')) {
          await page.evaluate(() => { let a = [...document.querySelectorAll('a')].find(x => x.innerText.includes('Blackmarket')); if (a) a.click(); });
          await new Promise(r => setTimeout(r, 2000));
          return;
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
        await new Promise(r => setTimeout(r, 2000));

        if (state.hold > 0) step = 'travel';
      }

      if (step === 'travel') {
         if (!page.url().includes('travel')) {
            await page.evaluate(() => { let a = [...document.querySelectorAll('a')].find(x => x.innerText.trim() === 'Travel'); if (a) a.click(); });
            await new Promise(r => setTimeout(r, 2000));
            return;
         }
         console.log(`✈️ هسافر لـ ${targetCity}...`);
         await page.evaluate((city) => {
            let allEls = [...document.querySelectorAll('*')];
            let targetEl = allEls.find(e => e.children.length === 0 && e.innerText.trim().toUpperCase() === city.toUpperCase() && e.offsetParent !== null);
            if (targetEl) targetEl.click();
         }, targetCity);
         
         await new Promise(r => setTimeout(r, 1500));

         await page.evaluate(() => {
            let tb = [...document.querySelectorAll('button')].find(b => b.innerText.includes('Travel to Selected Location'));
            if (tb) { tb.click(); setTimeout(() => { let cb = [...document.querySelectorAll('button')].find(b => b.innerText.trim() === 'TRAVEL'); if (cb) cb.click(); }, 1200); }
         });

         console.log(`✅ وصلت ${targetCity}... رجعنا للسوق`);
         step = 'buy';
         await new Promise(r => setTimeout(r, 3000));
         await page.evaluate(() => { let a = [...document.querySelectorAll('a')].find(x => x.innerText.includes('Blackmarket')); if (a) a.click(); });
      }

    } catch (e) {
      console.log("حصل خطأ مؤقت (غالبًا مشكلة اتصال):", e.message);
    }
  }, 8000); // زودت المدة لـ 8 ثواني عشان لا يضغط على الخادم
})();
