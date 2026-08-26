const puppeteer = require('puppeteer');

// ✅ ضع بيانات حسابك هنا
const USERNAME = 'amr.aly.2226@gmail.com'; 
const PASSWORD = 'Gun@12345';

const ITEMS = ["Anabolic steroid","Artifacts","Alcohol","Electronics","Plastic jewelry","Stolen paintings","Human beings","Confidential documents","Endangered exotic animals","Organs"];
let currentBuyItem = "Anabolic steroid";
let buyItemInTokyo = "Electronics";

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
    await page.goto('https://www.project-dark.co.uk/login', { waitUntil: 'networkidle2', timeout: 60000 });

    const inputs = await page.$$('input[type="text"], input[type="email"], input[type="password"]');
    if (inputs.length >= 2) {
       await inputs[0].click({ clickCount: 3 });
       await inputs[0].type(USERNAME);
       await inputs[1].click({ clickCount: 3 });
       await inputs[1].type(PASSWORD);
    } else {
       await page.evaluate((u, p) => {
          let user = document.querySelector('input[name="username"], input[name="email"], input[type="text"]');
          let pass = document.querySelector('input[name="password"], input[type="password"]');
          if (user) user.value = u;
          if (pass) pass.value = p;
       }, USERNAME, PASSWORD);
    }

    await page.click('button[type="submit"], input[type="submit"], button:has-text("Login")').catch(() => {});
    await sleep(5000);
    console.log("✅ تم تسجيل الدخول بنجاح!");
    await page.goto('https://www.project-dark.co.uk/blackmarket', { waitUntil: 'networkidle2', timeout: 60000 });
    console.log("✅ دخلنا السوق الأسود");

  } catch (e) {
    console.log("⚠️ مشكلة في تسجيل الدخول الآلي:", e.message);
  }

  while (true) {
    try {
      let state = await page.evaluate(() => {
        let body = document.body.innerText;
        let cityMatch = body.match(/Black Market - ([A-Za-z ]+)/i);
        let loc = cityMatch ? cityMatch[1].trim() : null;
        
        let cd = body.match(/You cannot travel for:?\s*([0-9hms ]+)/i);
        let holdMatch = body.match(/holding (\d+) items/i); 
        let hold = holdMatch ? +holdMatch[1] : 0;

        let heldItem = null;
        let rows = [...document.querySelectorAll('tr')];
        for (let r of rows) {
          if (r.innerText.includes('Sell All') && !r.innerText.includes('Confirm')) {
            for (let it of ITEMS) {
              if (r.innerText.toLowerCase().includes(it.toLowerCase())) { heldItem = it; break; }
            }
            break;
          }
        }
        return { loc, cd: cd ? cd[1] : null, hold, heldItem, body };
      });

      if (state.cd) {
        console.log(`⏳ في كولداون: ${state.cd}`);
        if (!page.url().includes('travel')) {
           await page.evaluate(() => { let a = [...document.querySelectorAll('a')].find(x => x.innerText.trim() === 'Travel'); if (a) a.click(); });
           await sleep(2000);
        }
        await sleep(10000);
        continue;
      }

      if (state.loc === "Cairo") {
        if (state.heldItem === "Electronics") {
           console.log("📍 في كايرو... شايل إلكترونيكس، هبيعها الأول");
           await page.evaluate(() => {
              let rows = [...document.querySelectorAll('tr')];
              for (let r of rows) {
                if (r.innerText.includes('Sell All') && !r.innerText.includes('Confirm')) {
                   let btn = [...r.querySelectorAll('button')].find(b => b.innerText.trim() === 'Sell All');
                   if (btn) { btn.click(); break; }
                }
              }
           });
           await sleep(2000);
           await page.evaluate(() => {
              let btn = [...document.querySelectorAll('button')].find(b => b.innerText.trim().toUpperCase() === 'SELL ALL');
              if (btn) btn.click();
           });
           console.log("✅ بعت الإلكترونيكس في كايرو");
           await sleep(3000);
           continue;
        }

        if (state.hold === 0) {
           console.log("📍 في كايرو... جاري شراء Anabolic steroid");
           await page.evaluate((itemName) => {
              let rows = [...document.querySelectorAll('tr')];
              for (let r of rows) {
                if (r.innerText.includes(itemName) && r.innerText.includes('£')) {
                  let mb = [...r.querySelectorAll('button')].find(b => b.innerText.includes('Max Buy'));
                  if (mb) { mb.click(); break; }
                }
              }
           }, currentBuyItem);
           await sleep(1000);
           await page.evaluate(() => {
              let btn = [...document.querySelectorAll('button')].find(b => b.innerText.trim() === 'BUY MAX');
              if (btn) btn.click();
           });
           console.log("✅ اشتريت الأنابوليك في كايرو");
           await sleep(3000);
           continue;
        }
        
        if (state.heldItem === "Anabolic steroid") {
           console.log("📍 في كايرو... شايل أنابوليك، رايح طوكيو");
           await page.evaluate(() => { let a = [...document.querySelectorAll('a')].find(x => x.innerText.trim() === 'Travel'); if (a) a.click(); });
           await sleep(2000);
           continue;
        }
      }

      else if (state.loc === "Tokyo") {
        if (state.heldItem === "Anabolic steroid" || state.hold > 0) {
           console.log("📍 في طوكيو... شايل أنابوليك، هبيعها الأول");
           await page.evaluate(() => {
              let rows = [...document.querySelectorAll('tr')];
              for (let r of rows) {
                if (r.innerText.includes('Sell All') && !r.innerText.includes('Confirm')) {
                   let btn = [...r.querySelectorAll('button')].find(b => b.innerText.trim() === 'Sell All');
                   if (btn) { btn.click(); break; }
                }
              }
           });
           await sleep(2000);
           await page.evaluate(() => {
              let btn = [...document.querySelectorAll('button')].find(b => b.innerText.trim().toUpperCase() === 'SELL ALL');
              if (btn) btn.click();
           });
           console.log("✅ بعت الأنابوليك في طوكيو");
           await sleep(3000);
           continue;
        }

        if (state.hold === 0) {
           console.log("📍 في طوكيو... جاري شراء Electronics");
           await page.evaluate((itemName) => {
              let rows = [...document.querySelectorAll('tr')];
              for (let r of rows) {
                if (r.innerText.includes(itemName) && r.innerText.includes('£')) {
                  let mb = [...r.querySelectorAll('button')].find(b => b.innerText.includes('Max Buy'));
                  if (mb) { mb.click(); break; }
                }
              }
           }, buyItemInTokyo);
           await sleep(1000);
           await page.evaluate(() => {
              let btn = [...document.querySelectorAll('button')].find(b => b.innerText.trim() === 'BUY MAX');
              if (btn) btn.click();
           });
           console.log("✅ اشتريت الإلكترونيكس في طوكيو");
           await sleep(3000);
           continue;
        }

        if (state.heldItem === "Electronics") {
           console.log("📍 في طوكيو... شايل إلكترونيكس، رايح كايرو");
           await page.evaluate(() => { let a = [...document.querySelectorAll('a')].find(x => x.innerText.trim() === 'Travel'); if (a) a.click(); });
           await sleep(2000);
           continue;
        }
      }

    } catch (e) {
      console.log("حصل خطأ مؤقت، هعيد المحاولة بعد 15 ثانية:", e.message);
      await sleep(15000);
    }
    await sleep(10000);
  }
})();
