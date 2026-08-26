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
        let cooldown = null;
        
        // اكتشاف المدينة
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

        // اكتشاف الكولداون (مهم جداً!)
        let cdMatch = body.match(/Travel in\s*([0-9hms ]+)/i) || body.match(/You cannot travel for:?\s*([0-9hms ]+)/i);
        if (cdMatch) cooldown = cdMatch[1];

        // اكتشاف العنصر المحمول
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
        
        return { loc, cd: cooldown, hold, heldItem };
      }, ITEMS);

      // ⏳ مهما كان، لو في كولداون، ننتظر ولا نعمل أي حاجة!
      if (state.cd) {
        console.log(`⏳ كولداون: ${state.cd} - هينتظر وينام 60 ثانية`);
        await sleep(60000); 
        continue;
      }

      // ✅ الحالة 1: في كايرو
      if (state.loc === "Cairo") {
        if (state.heldItem === "Electronics") {
           console.log("📍 كايرو - ببيع الإلكترونيكس");
           // اضغط على Sell All
           await page.evaluate(() => { let rows = [...document.querySelectorAll('tr')]; for (let r of rows) { if (r.innerText.includes('Sell All') && !r.innerText.includes('Confirm')) { let btn = [...r.querySelectorAll('button')].find(b => b.innerText.trim() === 'Sell All'); if (btn) { btn.click(); break; } } } });
           await sleep(2000);
           // اضغط على Confirm Sell All
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
           console.log("📍 كايرو - رايح طوكيو");
           await page.goto('https://www.project-dark.co.uk/travel', { waitUntil: 'networkidle2' });
           await sleep(2500);
           
           // Grid View
           await page.evaluate(() => { let elements = [...document.querySelectorAll('a, span, div, button')]; let grid = elements.find(el => el.innerText.trim() === 'Grid View' && el.offsetParent !== null); if (grid) grid.click(); });
           await sleep(1500);
           
           // اختيار طوكيو
           await page.evaluate(() => { let cards = [...document.querySelectorAll('div')]; let target = cards.find(el => el.innerText.trim() === 'TOKYO' && el.offsetWidth > 150 && el.offsetHeight > 50); if (target) target.click(); });
           await sleep(1500);
           
           // تأكيد السفر
           await page.evaluate(() => { let btn = [...document.querySelectorAll('button')].find(b => b.innerText.includes('Travel to Selected Location')); if (btn) btn.click(); });
           await sleep(1500);
           try {
               await page.waitForSelector('button', { visible: true, timeout: 3000 });
               await page.evaluate(() => { let allBtns = [...document.querySelectorAll('button')]; let travelBtn = allBtns.find(b => b.innerText.trim() === 'TRAVEL' && b.offsetParent !== null); if (travelBtn) travelBtn.click(); });
           } catch (e) {}

           await sleep(5000);
           let verify = await page.evaluate(() => document.body.innerText.includes('Black Market - Tokyo'));
           if (verify) console.log("🎉 وصلنا طوكيو!");
           else { console.log("⚠️ السفر مكملش، هنرجع للسوق"); await page.goto('https://www.project-dark.co.uk/blackmarket', { waitUntil: 'networkidle2' }); }
           continue;
        }
      }

      // ✅ الحالة 2: في طوكيو
      else if (state.loc === "Tokyo") {
        if (state.heldItem === "Anabolic steroid" || state.hold > 0) {
           console.log("📍 طوكيو - بيع الأنابوليك");
           // 🔥 إصلاح البيع هنا (نفس الفكرة بتاعة بيع الإلكترونيكس)
           await page.evaluate(() => { let rows = [...document.querySelectorAll('tr')]; for (let r of rows) { if (r.innerText.includes('Sell All') && !r.innerText.includes('Confirm')) { let btn = [...r.querySelectorAll('button')].find(b => b.innerText.trim() === 'Sell All'); if (btn) { btn.click(); break; } } } });
           await sleep(2000);
           // الآن اضغط على Confirm Sell All
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
           console.log("📍 طوكيو - رايح كايرو");
           await page.goto('https://www.project-dark.co.uk/travel', { waitUntil: 'networkidle2' });
           await sleep(2500);
           
           // Grid View
           await page.evaluate(() => { let elements = [...document.querySelectorAll('a, span, div, button')]; let grid = elements.find(el => el.innerText.trim() === 'Grid View' && el.offsetParent !== null); if (grid) grid.click(); });
           await sleep(1500);
           
           // اختيار كايرو
           await page.evaluate(() => { let cards = [...document.querySelectorAll('div')]; let target = cards.find(el => el.innerText.trim() === 'CAIRO' && el.offsetWidth > 150 && el.offsetHeight > 50); if (target) target.click(); });
           await sleep(1500);
           
           // تأكيد السفر
           await page.evaluate(() => { let btn = [...document.querySelectorAll('button')].find(b => b.innerText.includes('Travel to Selected Location')); if (btn) btn.click(); });
           await sleep(1500);
           try {
               await page.waitForSelector('button', { visible: true, timeout: 3000 });
               await page.evaluate(() => { let allBtns = [...document.querySelectorAll('button')]; let travelBtn = allBtns.find(b => b.innerText.trim() === 'TRAVEL' && b.offsetParent !== null); if (travelBtn) travelBtn.click(); });
           } catch (e) {}

           await sleep(5000);
           let verify = await page.evaluate(() => document.body.innerText.includes('Black Market - Cairo'));
           if (verify) console.log("🎉 وصلنا كايرو!");
           else { console.log("⚠️ السفر مكملش، هنرجع للسوق"); await page.goto('https://www.project-dark.co.uk/blackmarket', { waitUntil: 'networkidle2' }); }
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
