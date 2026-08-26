const puppeteer = require('puppeteer');
const fs = require('fs');

const ITEMS = ["Anabolic steroid","Artifacts","Alcohol","Electronics","Plastic jewelry","Stolen paintings","Human beings","Confidential documents","Endangered exotic animals","Organs"];
let step = 'buy'; 
let targetCity = "Cairo"; 
let targetItem = "Electronics"; 

(async () => {
  console.log("🚀 البوت بيشتغل...");
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'] });
  const page = await browser.newPage();

  // 1) شوف لو في ملف جلسة محفوظ (يعني متسجل دخول من قبل)
  if (fs.existsSync('cookies.json')) {
    const cookies = JSON.parse(fs.readFileSync('cookies.json'));
    await page.setCookie(...cookies);
    console.log("✅ تم تحميل الجلسة المحفوظة");
  } else {
    console.log("⚠️ مفيش جلسة محفوظة. هتطلب منك تسجيل الدخول. افتح الرابط ده في المتصفح: https://project-dark.co.uk/login");
    
    // فتح صفحة لتسجيل الدخول
    await page.goto('https://www.project-dark.co.uk/login', { waitUntil: 'networkidle2' });
    console.log("🔥 فضيت شوية... سجل دخولك في اللعبة، وبعدين ارجع هنا واضغط Enter في الكونسول");
    
    // بنستنى المستخدم يدوس Enter
    await new Promise(resolve => process.stdin.once('data', resolve));
    
    // بنحفظ الجلسة
    const cookies = await page.cookies();
    fs.writeFileSync('cookies.json', JSON.stringify(cookies));
    console.log("✅ تم حفظ الجلسة! البوت هيكمل أوفلاين من دلوقتي.");
  }

  // 2) نبدأ الشغل
  await page.goto('https://www.project-dark.co.uk/blackmarket', { waitUntil: 'domcontentloaded' });
  
  // لوب الشراء والبيع
  setInterval(async () => {
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
      console.log("حصل خطأ:", e.message);
    }
  }, 6000); 
})();
