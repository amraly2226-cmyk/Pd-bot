const puppeteer = require('puppeteer');

const USERNAME = 'amr.aly.2226@gmail.com'; 
const PASSWORD = 'Gun@12345';
const COOKIE_VALUE = process.env.PD_COOKIE || "";

const ITEMS = ["Anabolic steroid","Artifacts","Alcohol","Electronics","Plastic jewelry","Stolen paintings","Human beings","Confidential documents","Endangered exotic animals","Organs"];

async function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

(async () => {
  console.log("🚀 البوت شغال...");
  
  const browser = await puppeteer.launch({ 
    headless: true, 
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu'] 
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 }); 
  page.setDefaultTimeout(15000);

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
        await page.goto('https://www.project-dark.co.uk/blackmarket', { waitUntil: 'networkidle2', timeout: 60000 });
    }
  } catch (e) {
    console.log("⚠️ مشكلة في الدخول:", e.message);
  }

  while (true) {
    try {
      let state = await page.evaluate((items) => {
        let body = document.body.innerText;
        let loc = null;
        
        let lines = body.split('\n');
        for (let i = 0; i < lines.length; i++) {
            if (lines[i].trim().toUpperCase() === 'LOCATION') {
                for (let j = i + 1; j < lines.length; j++) {
                    if (lines[j].trim()) { loc = lines[j].trim(); break; }
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

        let cd = body.match(/You cannot travel for:?\s*([0-9hms ]+)/i);
        
        let hold = 0;
        let heldItem = null;
        let rows = [...document.querySelectorAll('tr')];

        for (let r of rows) {
            let rText = r.innerText;
            if (rText.includes('Sell') && !rText.includes('Confirm')) {
                for (let it of items) {
                    if (rText.toLowerCase().includes(it.toLowerCase())) {
                        heldItem = it;
                        let cells = [...r.querySelectorAll('td')];
                        if (cells.length >= 3) {
                            let youHaveCell = cells[2].innerText;
                            let match = youHaveCell.match(/(\d+)/);
                            if (match) hold = +match[1];
                        }
                        break;
                    }
                }
            }
        }

        if (heldItem === null) {
            let m = body.match(/holding (\d+) items/i);
            hold = m ? +m[1] : 0;
        }
        
        return { loc, cd: cd ? cd[1] : null, hold, heldItem };
      }, ITEMS);

      if (state.cd) {
        console.log(`⏳ كولداون: ${state.cd}`);
        await page.goto('https://www.project-dark.co.uk/travel', { waitUntil: 'networkidle2' });
        await sleep(3000);
        continue;
      }

      // ✅ الحالة 1: في كايرو
      if (state.loc === "Cairo") {
        if (state.heldItem === "Electronics") {
           console.log("📍 كايرو - ببيع الإلكترونيكس");
           await page.evaluate(() => { let rows = [...document.querySelectorAll('tr')]; for (let r of rows) { if (r.innerText.includes('Sell All') && !r.innerText.includes('Confirm')) { let btn = [...r.querySelectorAll('button')].find(b => b.innerText.trim() === 'Sell All'); if (btn) { btn.click(); break; } } } });
           await sleep(2000);
           await page.evaluate(() => { let btn = [...document.querySelectorAll('button')].find(b => b.innerText.trim().toUpperCase() === 'SELL ALL'); if (btn) btn.click(); });
           await sleep(3000);
           continue;
        }
        
        if (state.hold === 0) {
           console.log("📍 كايرو - شراء Anabolic steroid");
           await page.evaluate(() => { let rows = [...document.querySelectorAll('tr')]; for (let r of rows) { if (r.innerText.includes('Anabolic steroid') && r.innerText.includes('£')) { let mb = [...r.querySelectorAll('button')].find(b => b.innerText.includes('Max Buy')); if (mb) { mb.click(); break; } } } });
           await sleep(1000);
           await page.evaluate(() => { let btn = [...document.querySelectorAll('button')].find(b => b.innerText.trim() === 'BUY MAX'); if (btn) btn.click(); });
           await sleep(3000);
           continue;
        }
        
        if (state.heldItem === "Anabolic steroid") {
           console.log("📍 كايرو - رايح طوكيو (بالمباشر)");
           
           await page.goto('https://www.project-dark.co.uk/travel', { waitUntil: 'networkidle2' });
           await sleep(2000);
           
           // اختيار مدينة طوكيو
           await page.evaluate(() => {
              let elements = [...document.querySelectorAll('div, a, span')];
              let tokyo = elements.find(el => el.innerText.trim() === 'TOKYO' && el.offsetParent !== null && el.children.length === 0);
              if (tokyo) {
                 let card = tokyo.closest('div');
                 if (card && card.offsetWidth > 100) card.click();
                 else tokyo.click();
              }
           });
           await sleep(1500);
           
           // الضغط على زر "Travel to Selected Location"
           await page.evaluate(() => { 
              let btn = [...document.querySelectorAll('button')].find(b => b.innerText.includes('Travel to Selected Location')); 
              if (btn) btn.click(); 
           });
           await sleep(1500);
           
           // 🔥 الأهم: انتظار ظهور نافذة التأكيد والضغط على زر TRAVEL اللي جواها
           try {
               await page.waitForSelector('button', { visible: true, timeout: 5000 });
               await page.evaluate(() => {
                   // نبحث عن كل الأزرار، ونختار الزر اللي اسمه "TRAVEL" بالظبط واللي مش مخفي
                   let allBtns = [...document.querySelectorAll('button')];
                   let travelBtn = allBtns.find(b => b.innerText.trim() === 'TRAVEL' && b.offsetParent !== null);
                   if (travelBtn) travelBtn.click();
               });
               console.log("✈️ تم الضغط على TRAVEL في النافذة!");
           } catch (e) {
               console.log("⚠️ النافذة مفتحتش، بحاول أضغط تاني...");
           }
           
           await sleep(5000);
           
           // التحقق من الوصول لطوكيو
           let verify = await page.evaluate(() => document.body.innerText.includes('Black Market - Tokyo') || document.body.innerText.includes('Tokyo'));
           if (verify) {
               console.log("🎉 وصلنا طوكيو!");
           } else {
               console.log("⚠️ لسه في كايرو، بنرجع للسوق ونجرب تاني...");
               await page.goto('https://www.project-dark.co.uk/blackmarket', { waitUntil: 'networkidle2' });
           }
           continue;
        }
      }

      // ✅ الحالة 2: في طوكيو
      else if (state.loc === "Tokyo") {
        if (state.heldItem === "Anabolic steroid" || state.hold > 0) {
           console.log("📍 طوكيو - ببيع الأنابوليك");
           await page.evaluate(() => { let rows = [...document.querySelectorAll('tr')]; for (let r of rows) { if (r.innerText.includes('Sell All') && !r.innerText.includes('Confirm')) { let btn = [...r.querySelectorAll('button')].find(b => b.innerText.trim() === 'Sell All'); if (btn) { btn.click(); break; } } } });
           await sleep(2000);
           await page.evaluate(() => { let btn = [...document.querySelectorAll('button')].find(b => b.innerText.trim().toUpperCase() === 'SELL ALL'); if (btn) btn.click(); });
           await sleep(3000);
           continue;
        }
        
        if (state.hold === 0) {
           console.log("📍 طوكيو - شراء Electronics");
           await page.evaluate(() => { let rows = [...document.querySelectorAll('tr')]; for (let r of rows) { if (r.innerText.includes('Electronics') && r.innerText.includes('£')) { let mb = [...r.querySelectorAll('button')].find(b => b.innerText.includes('Max Buy')); if (mb) { mb.click(); break; } } } });
           await sleep(1000);
           await page.evaluate(() => { let btn = [...document.querySelectorAll('button')].find(b => b.innerText.trim() === 'BUY MAX'); if (btn) btn.click(); });
           await sleep(3000);
           continue;
        }

        if (state.heldItem === "Electronics") {
           console.log("📍 طوكيو - رايح كايرو (بالمباشر)");
           
           await page.goto('https://www.project-dark.co.uk/travel', { waitUntil: 'networkidle2' });
           await sleep(2000);
           
           await page.evaluate(() => {
              let elements = [...document.querySelectorAll('div, a, span')];
              let cairo = elements.find(el => el.innerText.trim() === 'CAIRO' && el.offsetParent !== null && el.children.length === 0);
              if (cairo) {
                 let card = cairo.closest('div');
                 if (card && card.offsetWidth > 100) card.click();
                 else cairo.click();
              }
           });
           await sleep(1500);
           
           await page.evaluate(() => { 
              let btn = [...document.querySelectorAll('button')].find(b => b.innerText.includes('Travel to Selected Location')); 
              if (btn) btn.click(); 
           });
           await sleep(1500);
           
           // 🔥 انتظار وفتح نافذة التأكيد لكايرو
           try {
               await page.waitForSelector('button', { visible: true, timeout: 5000 });
               await page.evaluate(() => {
                   let allBtns = [...document.querySelectorAll('button')];
                   let travelBtn = allBtns.find(b => b.innerText.trim() === 'TRAVEL' && b.offsetParent !== null);
                   if (travelBtn) travelBtn.click();
               });
               console.log("✈️ تم الضغط على TRAVEL في النافذة!");
           } catch (e) {
               console.log("⚠️ النافذة مفتحتش، بحاول أضغط تاني...");
           }
           
           await sleep(5000);
           
           // التحقق من الوصول لكايرو
           let verify = await page.evaluate(() => document.body.innerText.includes('Black Market - Cairo') || document.body.innerText.includes('Cairo'));
           if (verify) {
               console.log("🎉 وصلنا كايرو!");
           } else {
               console.log("⚠️ لسه في طوكيو، بنرجع للسوق ونجرب تاني...");
               await page.goto('https://www.project-dark.co.uk/blackmarket', { waitUntil: 'networkidle2' });
           }
           continue;
        }
      }
      
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
