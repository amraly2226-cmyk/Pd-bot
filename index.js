const puppeteer = require('puppeteer');

// ✅ ضع بيانات حسابك هنا
const USERNAME = 'amr.aly.2226@gmail.com'; 
const PASSWORD = 'Gun@12345';

// أو استخدم الكوكيز اللي جبتها (لو حبيت تستخدمها)
const COOKIE_VALUE = process.env.PD_COOKIE || ""; // في Replit: Tools -> Secrets -> PD_COOKIE

const ITEMS = ["Anabolic steroid","Artifacts","Alcohol","Electronics","Plastic jewelry","Stolen paintings","Human beings","Confidential documents","Endangered exotic animals","Organs"];

async function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

(async () => {
  console.log("🚀 البوت شغال...");
  
  // تشغيل المتصفح بتكوين آمن للخادم
  const browser = await puppeteer.launch({ 
    headless: true, 
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu'] 
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 }); // عشان تظهر القائمة الجانبية
  page.setDefaultTimeout(15000);

  // محاولة الدخول بالكوكيز أو باليوزر والباسورد
  try {
    if (COOKIE_VALUE) {
        await page.setCookie({ name: 'project-dark-session', value: COOKIE_VALUE, domain: '.project-dark.co.uk' });
        await page.goto('https://www.project-dark.co.uk/blackmarket', { waitUntil: 'networkidle2', timeout: 60000 });
        console.log("✅ دخلنا بالكوكيز");
    } else {
        await page.goto('https://www.project-dark.co.uk/login', { waitUntil: 'networkidle2', timeout: 60000 });
        const inputs = await page.$$('input[type="text"], input[type="email"], input[type="password"]');
        if (inputs.length >= 2) {
           await inputs[0].type(USERNAME);
           await inputs[1].type(PASSWORD);
        }
        await page.click('button[type="submit"]').catch(() => {});
        await sleep(5000);
        console.log("✅ تم تسجيل الدخول، جاري الدخول للسوق");
        await page.goto('https://www.project-dark.co.uk/blackmarket', { waitUntil: 'networkidle2', timeout: 60000 });
    }
  } catch (e) {
    console.log("⚠️ مشكلة في الدخول:", e.message);
  }
  
  console.log("✅ دخلنا السوق الأسود، جاري بدء اللوب");

  while (true) {
    try {
      // قراءة الحالة برة الـ evaluate
      let state = await page.evaluate(() => {
        let body = document.body.innerText;
        let loc = null;
        
        // قراءة المدينة من القائمة الجانبية (LOCATION)
        let lines = body.split('\n');
        for (let i = 0; i < lines.length; i++) {
            if (lines[i].trim().toUpperCase() === 'LOCATION') {
                for (let j = i + 1; j < lines.length; j++) {
                    if (lines[j].trim()) {
                        loc = lines[j].trim();
                        break;
                    }
                }
                break;
            }
        }
        if (loc && loc.includes('Cairo')) loc = 'Cairo';
        else if (loc && loc.includes('Tokyo')) loc = 'Tokyo';
        else if (loc && loc.includes('London')) loc = 'London';
        else if (loc && loc.includes('Moscow')) loc = 'Moscow';
        else if (loc && loc.includes('Rome')) loc = 'Rome';
        else if (loc && loc.includes('Capetown')) loc = 'Capetown';
        else if (loc && loc.includes('Sydney')) loc = 'Sydney';
        else if (loc && loc.includes('Ottawa')) loc = 'Ottawa';
        else if (loc && loc.includes('Rio de Janeiro')) loc = 'Rio de Janeiro';

        // قراءة الكولداون والـ Hold
        let cd = body.match(/You cannot travel for:?\s*([0-9hms ]+)/i);
        let holdMatch = body.match(/holding (\d+) items/i); 
        let hold = holdMatch ? +holdMatch[1] : 0;

        // قراءة العنصر المحمول
        let heldItem = null;
        let rows = [...document.querySelectorAll('tr')];
        for (let r of rows) {
          if (r.innerText.includes('Sell All') && !r.innerText.includes('Confirm')) {
            for (let it of ["Anabolic steroid","Artifacts","Alcohol","Electronics","Plastic jewelry","Stolen paintings","Human beings","Confidential documents","Endangered exotic animals","Organs"]) {
              if (r.innerText.toLowerCase().includes(it.toLowerCase())) { heldItem = it; break; }
            }
            break;
          }
        }
        
        console.log("📡 المدينة:", loc);
        return { loc, cd: cd ? cd[1] : null, hold, heldItem };
      });

      // لو في كولداون، استنى
      if (state.cd) {
        console.log(`⏳ كولداون: ${state.cd}`);
        if (!page.url().includes('travel')) {
           await page.evaluate(() => { let a = [...document.querySelectorAll('a')].find(x => x.innerText.trim() === 'Travel'); if (a) a.click(); });
           await sleep(2000);
        }
        await sleep(10000);
        continue;
      }

      // ✅ الحالة 1: في كايرو
      if (state.loc === "Cairo") {
        // لو شايل إلكترونيكس، ابيعها
        if (state.heldItem === "Electronics") {
           console.log("📍 كايرو - ببيع الإلكترونيكس");
           await page.evaluate(() => { let rows = [...document.querySelectorAll('tr')]; for (let r of rows) { if (r.innerText.includes('Sell All') && !r.innerText.includes('Confirm')) { let btn = [...r.querySelectorAll('button')].find(b => b.innerText.trim() === 'Sell All'); if (btn) { btn.click(); break; } } } });
           await sleep(2000);
           await page.evaluate(() => { let btn = [...document.querySelectorAll('button')].find(b => b.innerText.trim().toUpperCase() === 'SELL ALL'); if (btn) btn.click(); });
           await sleep(3000);
           continue;
        }
        
        // لو فاضي، اشتري أنابوليك
        if (state.hold === 0) {
           console.log("📍 كايرو - شراء Anabolic steroid");
           await page.evaluate(() => { let rows = [...document.querySelectorAll('tr')]; for (let r of rows) { if (r.innerText.includes('Anabolic steroid') && r.innerText.includes('£')) { let mb = [...r.querySelectorAll('button')].find(b => b.innerText.includes('Max Buy')); if (mb) { mb.click(); break; } } } });
           await sleep(1000);
           await page.evaluate(() => { let btn = [...document.querySelectorAll('button')].find(b => b.innerText.trim() === 'BUY MAX'); if (btn) btn.click(); });
           await sleep(3000);
           continue;
        }
        
        // لو شايل أنابوليك، سافر طوكيو
        if (state.heldItem === "Anabolic steroid") {
           console.log("📍 كايرو - رايح طوكيو");
           await page.evaluate(() => { let a = [...document.querySelectorAll('a')].find(x => x.innerText.trim() === 'Travel'); if (a) a.click(); });
           await sleep(2000);
           continue;
        }
      }

      // ✅ الحالة 2: في طوكيو
      else if (state.loc === "Tokyo") {
        // لو شايل أنابوليك، ابيعها
        if (state.heldItem === "Anabolic steroid" || state.hold > 0) {
           console.log("📍 طوكيو - ببيع الأنابوليك");
           await page.evaluate(() => { let rows = [...document.querySelectorAll('tr')]; for (let r of rows) { if (r.innerText.includes('Sell All') && !r.innerText.includes('Confirm')) { let btn = [...r.querySelectorAll('button')].find(b => b.innerText.trim() === 'Sell All'); if (btn) { btn.click(); break; } } } });
           await sleep(2000);
           await page.evaluate(() => { let btn = [...document.querySelectorAll('button')].find(b => b.innerText.trim().toUpperCase() === 'SELL ALL'); if (btn) btn.click(); });
           await sleep(3000);
           continue;
        }
        
        // لو فاضي، اشتري إلكترونيكس
        if (state.hold === 0) {
           console.log("📍 طوكيو - شراء Electronics");
           await page.evaluate(() => { let rows = [...document.querySelectorAll('tr')]; for (let r of rows) { if (r.innerText.includes('Electronics') && r.innerText.includes('£')) { let mb = [...r.querySelectorAll('button')].find(b => b.innerText.includes('Max Buy')); if (mb) { mb.click(); break; } } } });
           await sleep(1000);
           await page.evaluate(() => { let btn = [...document.querySelectorAll('button')].find(b => b.innerText.trim() === 'BUY MAX'); if (btn) btn.click(); });
           await sleep(3000);
           continue;
        }

        // لو شايل إلكترونيكس، ارجع كايرو
        if (state.heldItem === "Electronics") {
           console.log("📍 طوكيو - رايح كايرو");
           await page.evaluate(() => { let a = [...document.querySelectorAll('a')].find(x => x.innerText.trim() === 'Travel'); if (a) a.click(); });
           await sleep(2000);
           continue;
        }
      }
      
      // لو مش لاقي
      else {
          console.log("⚠️ مش لاقي المدينة، بجرب تاني...");
          await sleep(5000);
          continue;
      }

    } catch (e) {
      console.log("حصل خطأ مؤقت، معيد المحاولة:", e.message);
      await sleep(15000);
    }
    await sleep(10000);
  }
})();
