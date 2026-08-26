const puppeteer = require('puppeteer');

// بنقرأ البيانات من الـ Secrets عشان الأمان
const USERNAME = process.env.amr.aly@2226@gamilcom;
const PASSWORD = process.env.Gun@12345;

const ITEMS = ["Anabolic steroid","Artifacts","Alcohol","Electronics","Plastic jewelry","Stolen paintings","Human beings","Confidential documents","Endangered exotic animals","Organs"];
let step = 'buy'; 
let targetCity = "Cairo"; 
let targetItem = "Electronics"; 

(async () => {
  console.log("🚀 البوت بيشتغل... جاري فتح المتصفح المخفي");
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage();
  
  // مهلة أطول عشان الصفحة تتحمل
  page.setDefaultTimeout(15000);

  // تسجيل الدخول
  try {
    await page.goto('https://www.project-dark.co.uk/login', { waitUntil: 'networkidle2' });
    
    // 🔥 الطريقة الأقوى: ندور على أي خانة إدخال (Input) ظاهرة في الصفحة ونكتب فيها
    await page.waitForSelector('input', { visible: true });
    const inputs = await page.$$('input[type="text"], input[type="email"], input:not([type])');
    
    // لو اللعبة فيها خانتين (يوزر وباسورد) هنكتب في الأول والثاني
    if (inputs.length >= 2) {
       await inputs[0].click({ clickCount: 3 }); // تمسح أي حاجة قديمة
       await inputs[0].type(USERNAME);
       
       await inputs[1].click({ clickCount: 3 });
       await inputs[1].type(PASSWORD);
    } else {
       // لو اللعبة بتستخدم type مختلفة، بنجرب طريقة أعم
       await page.evaluate((u, p) => {
          let userInput = document.querySelector('input[type="text"], input[name="username"], input[name="email"], #username');
          let passInput = document.querySelector('input[type="password"], input[name="password"], #password');
          if (userInput && passInput) {
             userInput.value = u;
             passInput.value = p;
             // نطلق حدث تغيير عشان الموقع يلاحظ
             userInput.dispatchEvent(new Event('input', { bubbles: true }));
             passInput.dispatchEvent(new Event('input', { bubbles: true }));
          }
       }, USERNAME, PASSWORD);
    }

    // الضغط على زر الدخول
    await page.click('button[type="submit"], input[type="submit"], button:has-text("Login")');
    await page.waitForTimeout(3000);
    console.log("✅ تم تسجيل الدخول بنجاح!");
  } catch (e) {
    console.log("⚠️ فيه مشكلة بالتسجيل التلقائي (غالباً في كابتشا). هنحاول نكمل من غير تسجيل دخول.");
    // هنا ممكن تروح تشوف الـ Web Preview في Replit وتسجل دخول بإيدك، والكود هيشتغل بعدها
  }

  // لوب البيع والشراء
  setInterval(async () => {
    try {
      // التحقق من الكولداون
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

      // البيع والشراء
      if (step === 'buy') {
        if (!page.url().includes('blackmarket')) {
          console.log("➡️ رايح للسوق الأسود...");
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

      // السفر
      if (step === 'travel') {
         if (!page.url().includes('travel')) {
            console.log("➡️ رايح لصفحة السفر...");
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
      console.log("حصل خطأ مؤقت:", e.message);
    }
  }, 6000); 
})();
