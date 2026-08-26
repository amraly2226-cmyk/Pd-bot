const puppeteer = require('puppeteer');

// بنقرأ اليوزر والباسورد من الـ Secrets اللي انت عاملها فوق
const USERNAME = process.env.PD_USER;
const PASSWORD = process.env.PD_PASS;

const ITEMS = ["Anabolic steroid","Artifacts","Alcohol","Electronics","Plastic jewelry","Stolen paintings","Human beings","Confidential documents","Endangered exotic animals","Organs"];
const CITY_IDS = {"Cairo":1,"Tokyo":2,"London":3,"Moscow":4,"Rome":5,"Capetown":6,"Sydney":7,"Ottawa":8,"Rio de Janeiro":9};

let step = 'buy'; // الحالة دلوقتي: buy أو travel
let targetCity = "Cairo"; // المدينة اللي هيسافر لها (عدلها زي ما انت عايز)
let targetItem = "Electronics"; // الصنف اللي هيشتريه (عدله براحتك)

(async () => {
  console.log("🚀 البوت بيشتغل... جاري فتح المتصفح المخفي");
  
  // تشغيل متصفح مخفي (Headless) لا يظهر على الشاشة
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage();

  // أول حاجة: تسجيل الدخول أوتوماتيك
  try {
    await page.goto('https://www.project-dark.co.uk/login', { waitUntil: 'networkidle2' });
    await page.type('input[type="text"], input[name="username"]', USERNAME); // عدل الاسم لو مختلف
    await page.type('input[type="password"], input[name="password"]', PASSWORD); // عدل الباسورد لو مختلف
    await page.click('button[type="submit"], input[type="submit"]');
    await page.waitForNavigation({ waitUntil: 'networkidle2' });
    console.log("✅ تم تسجيل الدخول بنجاح من غير كوكيز!");
  } catch (e) {
    console.log("⚠️ مش قادر أسجل دخول، هجرب أكمل على أمل إنك متسجل من قبل:", e.message);
  }

  // هنبدأ العمل الأساسي (بيع وشراء وسفر) كل 6 ثواني
  setInterval(async () => {
    try {
      // جاري قراءة حالة اللعبة من داخل المتصفح
      let state = await page.evaluate((item, city) => {
        let body = document.body.innerText;
        let currentCity = null;
        let hold = 0;
        let cd = null;

        let cityMatch = body.match(/Black Market - ([A-Za-z ]+)/i); if (cityMatch) currentCity = cityMatch[1].trim();
        let holdMatch = body.match(/holding (\d+) items/i); if (holdMatch) hold = +holdMatch[1];
        let cdMatch = body.match(/You cannot travel for:?\s*([0-9hms ]+)/i); if (cdMatch) cd = cdMatch[1].trim();

        return { currentCity, hold, cd, body };
      }, targetItem, targetCity);

      // التحقق من الكولداون
      if (state.cd) {
        console.log(`⏳ في كولداون: ${state.cd}`);
        // لو مش في تبويب السفر، نروح له
        if (!page.url().includes('travel')) {
          await page.evaluate(() => { let a = [...document.querySelectorAll('a')].find(x => x.innerText.trim() === 'Travel'); if (a) a.click(); });
          await new Promise(r => setTimeout(r, 2000));
        }
        return;
      }

      // التحقق من الأزرار المنبثقة اللي محتاجة تأكيد (مثل Confirm)
      await page.evaluate(() => {
        let confirmBtn = [...document.querySelectorAll('button')].find(b => b.innerText.trim().toUpperCase() === 'BUY MAX');
        if (confirmBtn && document.body.innerText.includes('Confirm')) confirmBtn.click();
        
        let travelBtn = [...document.querySelectorAll('button')].find(b => b.innerText.trim() === 'TRAVEL');
        if (travelBtn && document.body.innerText.includes('Are you sure')) travelBtn.click();
      });

      // 1) البيع والشراء
      if (step === 'buy') {
        if (!page.url().includes('blackmarket')) {
          console.log("➡️ رايح للسوق الأسود...");
          await page.evaluate(() => { let a = [...document.querySelectorAll('a')].find(x => x.innerText.includes('Blackmarket')); if (a) a.click(); });
          await new Promise(r => setTimeout(r, 2000));
          return;
        }

        // شغل منطق البيع والشراء جوه المتصفح
        let actionResult = await page.evaluate((items, targetItem) => {
          // البحث عن الصنف الحالي المسحوب
          let heldItem = null;
          let rows = [...document.querySelectorAll('tr')];
          for (let r of rows) {
             if (r.innerText.includes('Sell All') && !r.innerText.includes('Confirm')) {
                let txt = r.innerText.toLowerCase();
                for (let it of items) if (txt.includes(it.toLowerCase())) { heldItem = it; break; }
                break;
             }
          }

          // لو شايل صنف غلط - ابعته
          if (heldItem && heldItem !== targetItem) {
             for (let r of rows) {
                if (r.innerText.includes('Sell All') && !r.innerText.includes('Confirm')) {
                   let btn = [...r.querySelectorAll('button')].find(b => b.innerText.trim() === 'Sell All');
                   if (btn) { btn.click(); return `بيع الصنف الغلط (${heldItem})...`; }
                }
             }
          }

          // لو فاضي - اشتري
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

        // لو خلص شراء، بدل الحالة لسفر
        let holdNow = await page.evaluate(() => {
           let m = document.body.innerText.match(/holding (\d+) items/i); return m ? +m[1] : 0;
        });

        if (holdNow > 0) {
           step = 'travel';
        }
      }

      // 2) السفر
      if (step === 'travel') {
         if (!page.url().includes('travel')) {
            console.log("➡️ رايح لصفحة السفر...");
            await page.evaluate(() => { let a = [...document.querySelectorAll('a')].find(x => x.innerText.trim() === 'Travel'); if (a) a.click(); });
            await new Promise(r => setTimeout(r, 2000));
            return;
         }

         console.log(`✈️ هسافر لـ ${targetCity}...`);
         // اختيار المدينة في صفحة السفر
         await page.evaluate((city) => {
            let allEls = [...document.querySelectorAll('*')];
            let targetEl = allEls.find(e => e.children.length === 0 && e.innerText.trim().toUpperCase() === city.toUpperCase() && e.offsetParent !== null);
            if (targetEl) targetEl.click();
         }, targetCity);
         
         await new Promise(r => setTimeout(r, 1500));

         // الضغط على زر السفر النهائي
         await page.evaluate(() => {
            let tb = [...document.querySelectorAll('button')].find(b => b.innerText.includes('Travel to Selected Location'));
            if (tb) { tb.click(); setTimeout(() => { let cb = [...document.querySelectorAll('button')].find(b => b.innerText.trim() === 'TRAVEL'); if (cb) cb.click(); }, 1200); }
         });

         console.log(`✅ وصلت ${targetCity}... رجعنا للسوق عشان نبدأ من جديد`);
         step = 'buy';
         await new Promise(r => setTimeout(r, 3000));
         await page.evaluate(() => { let a = [...document.querySelectorAll('a')].find(x => x.innerText.includes('Blackmarket')); if (a) a.click(); });
      }

    } catch (e) {
      console.log("حصل خطأ مؤقت:", e.message);
    }
  }, 6000); // كل 6 ثواني يتحرك لخطوة جديدة عشان ما يخنقش السيرفر
})();
