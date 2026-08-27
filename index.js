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
        let cooldownStr = null;
        
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

        let cdMatch = body.match(/You cannot travel for:?\s*([0-9hms ]+)/i) || body.match(/Travel in\s*([0-9hms ]+)/i);
        if (cdMatch) cooldownStr = cdMatch[1];

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
                            let match = cells[2].innerText.match(/(\d+)/);
                            if (match && +match[1] > 0) {
                                hold = +match[1];
                                break;
                            }
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
        
        return { loc, cd: cooldownStr, hold, heldItem };
      }, ITEMS);

      // ✅ منطق الكولداون (كما هو)
      if (state.cd) {
        console.log(`⏳ في كولداون: ${state.cd} - بدأ الفحص الدوري`);
        for (let i = 0; i < 3; i++) {
            for (let j = 30; j > 0; j--) {
                console.log(`⏳ باقي ${Math.floor(j / 6)} دقيقة و ${(j % 6) * 10} ثانية على الفحص القادم...`);
                await sleep(10000);
            }
            console.log(`⏳ مرت ${(i + 1) * 5} دقيقة... جاري فحص السوق فقط`);
            await page.goto('https://www.project-dark.co.uk/blackmarket', { waitUntil: 'networkidle2' });
            await sleep(2000);
            
            let currentHold = await page.evaluate(() => {
                let body = document.body.innerText;
                let city = body.match(/Location\s*\n\s*(Cairo|Tokyo)/i);
                let cityName = city ? city[1] : 'Unknown';
                let itemName = (cityName === 'Tokyo') ? 'Electronics' : 'Anabolic steroid';
                let hold = 0;
                let rows = [...document.querySelectorAll('tr')];
                for (let r of rows) {
                    if (r.innerText.includes(itemName) && !r.innerText.includes('Confirm')) {
                        let cells = [...r.querySelectorAll('td')];
                        if (cells.length >= 3) {
                            let match = cells[2].innerText.match(/(\d+)/);
                            if (match) hold = +match[1];
                        }
                        break;
                    }
                }
                return hold;
            });

            if (currentHold === 0) {
                console.log("📦 فحصت السوق: مش شاري حاجة حالياً");
            } else {
                console.log(`✅ فحصت السوق: كمية ${currentHold}`);
            }

            await page.goto('https://www.project-dark.co.uk/travel', { waitUntil: 'networkidle2' });
            await sleep(2000);
            
            let reCheckCd = await page.evaluate(() => {
                let body = document.body.innerText;
                let cdMatch = body.match(/You cannot travel for:?\s*([0-9hms ]+)/i) || body.match(/Travel in\s*([0-9hms ]+)/i);
                return cdMatch ? cdMatch[1] : null;
            });
            
            if (reCheckCd) {
                console.log(`⏳ رجعت للسفر، الكولداون الجديد: ${reCheckCd}`);
            } else {
                console.log("✅ الكولداون خلص! جاري تجهيز السفر");
                break;
            }
        }
        continue;
      }

      // ✅ كايرو: المنطق الصحيح
      if (state.loc === "Cairo") {
        // 1. لو شايل إلكترونيكس، ابيعها
        if (state.heldItem === "Electronics" && state.hold > 0) {
           console.log(`📍 كايرو - شايل إلكترونيكس، هبيعها الأول`);
           await page.evaluate(() => { let rows = [...document.querySelectorAll('tr')]; for (let r of rows) { if (r.innerText.includes('Electronics') && r.innerText.includes('Sell All') && !r.innerText.includes('Confirm')) { let btn = [...r.querySelectorAll('button')].find(b => b.innerText.trim() === 'Sell All'); if (btn) { btn.click(); break; } } } });
           await sleep(2000);
           await page.waitForFunction(() => document.body.innerText.includes('Confirm Sell All'), { timeout: 5000 }).catch(() => {});
           await page.evaluate(() => { const allBtns = [...document.querySelectorAll('button')]; const confirmBtn = allBtns.find(b => b.innerText.trim() === 'SELL ALL' && b.offsetParent !== null); if (confirmBtn) confirmBtn.click(); });
           await sleep(3000);
           continue;
        }

        // 2. لو شايل أنابوليك، سافر طوكيو (لا تشتري)
        if (state.heldItem === "Anabolic steroid" && state.hold > 0) {
           console.log(`📍 كايرو - شايل أنابوليك، رايح طوكيو`);
           await page.goto('https://www.project-dark.co.uk/travel', { waitUntil: 'networkidle2' });
           await sleep(2500);
           let travelCd = await page.evaluate(() => { let body = document.body.innerText; let cdMatch = body.match(/You cannot travel for:?\s*([0-9hms ]+)/i) || body.match(/Travel in\s*([0-9hms ]+)/i); return cdMatch ? cdMatch[1] : null; });
           if (travelCd) { console.log(`⏳ لقيت كولداون: ${travelCd}`); continue; }
           await page.evaluate(() => { let elements = [...document.querySelectorAll('a, span, div, button')]; let grid = elements.find(el => el.innerText.trim() === 'Grid View' && el.offsetParent !== null); if (grid) grid.click(); });
           await sleep(1500);
           await page.evaluate(() => { let cards = [...document.querySelectorAll('div')]; let target = cards.find(el => el.innerText.trim() === 'TOKYO' && el.offsetWidth > 150 && el.offsetHeight > 50); if (target) target.click(); });
           await sleep(1500);
           await page.evaluate(() => { let btn = [...document.querySelectorAll('button')].find(b => b.innerText.includes('Travel to Selected Location')); if (btn) btn.click(); });
           await sleep(1500);
           await page.waitForFunction(() => document.body.innerText.includes('Are you sure'), { timeout: 3000 }).catch(() => {});
           await page.evaluate(() => { let allBtns = [...document.querySelectorAll('button')]; let travelBtn = allBtns.find(b => b.innerText.trim() === 'TRAVEL' && b.offsetParent !== null); if (travelBtn) travelBtn.click(); });
           await sleep(5000);
           console.log("✈️ طلبت السفر لطوكيو");
           continue;
        }
        
        // 3. لو فاضي تماماً، اشتري أنابوليك مرة واحدة وبعدها سافر فوراً (الحل الجديد)
        if (state.hold === 0) {
           console.log("📍 كايرو - فاضي، هشتري أنابوليك وبعدها أسافر فوراً");
           await page.evaluate(() => { let rows = [...document.querySelectorAll('tr')]; for (let r of rows) { if (r.innerText.includes('Anabolic steroid') && r.innerText.includes('£')) { let mb = [...r.querySelectorAll('button')].find(b => b.innerText.includes('Max Buy')); if (mb) { mb.click(); break; } } } });
           await sleep(1000);
           await page.evaluate(() => { let btn = [...document.querySelectorAll('button')].find(b => b.innerText.trim() === 'BUY MAX'); if (btn) btn.click(); });
           await sleep(2000);
           // ⚡ لا نتحقق من الكمية، نذهب للسفر فوراً لمنع التكرار
           await page.goto('https://www.project-dark.co.uk/travel', { waitUntil: 'networkidle2' });
           await sleep(2000);
           continue;
        }
      }

      // ✅ طوكيو: المنطق الصحيح
      else if (state.loc === "Tokyo") {
        // 1. لو شايل أنابوليك، ابيعها الأول
        if (state.heldItem === "Anabolic steroid" && state.hold > 0) {
           console.log(`📍 طوكيو - شايل أنابوليك، هبيعها الأول`);
           await page.evaluate(() => { const rows = [...document.querySelectorAll('tr')]; for (let r of rows) { const text = r.innerText; if (text.includes('Anabolic steroid') && text.includes('Sell All') && !text.includes('Confirm')) { const btn = [...r.querySelectorAll('button')].find(b => b.innerText.trim() === 'Sell All'); if (btn) { btn.click(); break; } } } });
           await sleep(2000);
           await page.waitForFunction(() => document.body.innerText.includes('Confirm Sell All'), { timeout: 5000 }).catch(() => {});
           await page.evaluate(() => { const allBtns = [...document.querySelectorAll('button')]; const confirmBtn = allBtns.find(b => b.innerText.trim() === 'SELL ALL' && b.offsetParent !== null); if (confirmBtn) confirmBtn.click(); });
           await sleep(3000);
           continue;
        }

        // 2. لو شايل إلكترونيكس، سافر كايرو (لا تشتري)
        if (state.heldItem === "Electronics" && state.hold > 0) {
           console.log(`📍 طوكيو - شايل إلكترونيكس، رايح كايرو`);
           await page.goto('https://www.project-dark.co.uk/travel', { waitUntil: 'networkidle2' });
           await sleep(2500);
           let travelCd = await page.evaluate(() => { let body = document.body.innerText; let cdMatch = body.match(/You cannot travel for:?\s*([0-9hms ]+)/i) || body.match(/Travel in\s*([0-9hms ]+)/i); return cdMatch ? cdMatch[1] : null; });
           if (travelCd) { console.log(`⏳ لقيت كولداون: ${travelCd}`); continue; }
           await page.evaluate(() => { let elements = [...document.querySelectorAll('a, span, div, button')]; let grid = elements.find(el => el.innerText.trim() === 'Grid View' && el.offsetParent !== null); if (grid) grid.click(); });
           await sleep(1500);
           await page.evaluate(() => { let cards = [...document.querySelectorAll('div')]; let target = cards.find(el => el.innerText.trim() === 'CAIRO' && el.offsetWidth > 150 && el.offsetHeight > 50); if (target) target.click(); });
           await sleep(1500);
           await page.evaluate(() => { let btn = [...document.querySelectorAll('button')].find(b => b.innerText.includes('Travel to Selected Location')); if (btn) btn.click(); });
           await sleep(1500);
           await page.waitForFunction(() => document.body.innerText.includes('Are you sure'), { timeout: 3000 }).catch(() => {});
           await page.evaluate(() => { let allBtns = [...document.querySelectorAll('button')]; let travelBtn = allBtns.find(b => b.innerText.trim() === 'TRAVEL' && b.offsetParent !== null); if (travelBtn) travelBtn.click(); });
           await sleep(5000);
           console.log("✈️ طلبت السفر لكايرو");
           continue;
        }
        
        // 3. لو فاضي تماماً، اشتري إلكترونيكس مرة واحدة وبعدها سافر فوراً (الحل الجديد)
        if (state.hold === 0) {
           console.log("📍 طوكيو - فاضي، هشتري إلكترونيكس وبعدها أسافر فوراً");
           await page.evaluate(() => { let rows = [...document.querySelectorAll('tr')]; for (let r of rows) { if (r.innerText.includes('Electronics') && r.innerText.includes('£')) { let mb = [...r.querySelectorAll('button')].find(b => b.innerText.includes('Max Buy')); if (mb) { mb.click(); break; } } } });
           await sleep(1000);
           await page.evaluate(() => { let btn = [...document.querySelectorAll('button')].find(b => b.innerText.trim() === 'BUY MAX'); if (btn) btn.click(); });
           await sleep(2000);
           // ⚡ لا نتحقق من الكمية، نذهب للسفر فوراً لمنع التكرار
           await page.goto('https://www.project-dark.co.uk/travel', { waitUntil: 'networkidle2' });
           await sleep(2000);
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
            let currentHold = await page.evaluate(() => {
                let body = document.body.innerText;
                let city = body.match(/Location\s*\n\s*(Cairo|Tokyo)/i);
                let cityName = city ? city[1] : 'Unknown';
                let itemName = (cityName === 'Tokyo') ? 'Electronics' : 'Anabolic steroid';
                let hold = 0;
                let rows = [...document.querySelectorAll('tr')];
                for (let r of rows) {
                    if (r.innerText.includes(itemName) && !r.innerText.includes('Confirm')) {
                        let cells = [...r.querySelectorAll('td')];
                        if (cells.length >= 3) {
                            let match = cells[2].innerText.match(/(\d+)/);
                            if (match) hold = +match[1];
                        }
                        break;
                    }
                }
                return hold;
            });

            if (currentHold === 0) {
                console.log("📦 فحصت السوق: مش شاري حاجة حالياً");
            } else {
                console.log(`✅ فحصت السوق: كمية ${currentHold}`);
            }

            await page.goto('https://www.project-dark.co.uk/travel', { waitUntil: 'networkidle2' });
            await sleep(2000);
            
            let reCheckCd = await page.evaluate(() => {
                let body = document.body.innerText;
                let cdMatch = body.match(/You cannot travel for:?\s*([0-9hms ]+)/i) || body.match(/Travel in\s*([0-9hms ]+)/i);
                return cdMatch ? cdMatch[1] : null;
            });
            
            if (reCheckCd) {
                console.log(`⏳ رجعت للسفر، الكولداون الجديد: ${reCheckCd}`);
            } else {
                console.log("✅ الكولداون خلص! جاري تجهيز السفر");
                break;
            }
        }
        continue;
      }

      // ✅ كايرو: المنطق الصحيح حسب نوع العنصر
      if (state.loc === "Cairo") {
        // 1. لو شايل إلكترونيكس، ابيعها
        if (state.heldItem === "Electronics" && state.hold > 0) {
           console.log(`📍 كايرو - شايل إلكترونيكس (${state.hold})، هبيعها الأول`);
           await page.evaluate(() => { let rows = [...document.querySelectorAll('tr')]; for (let r of rows) { if (r.innerText.includes('Electronics') && r.innerText.includes('Sell All') && !r.innerText.includes('Confirm')) { let btn = [...r.querySelectorAll('button')].find(b => b.innerText.trim() === 'Sell All'); if (btn) { btn.click(); break; } } } });
           await sleep(2000);
           await page.waitForFunction(() => document.body.innerText.includes('Confirm Sell All'), { timeout: 5000 }).catch(() => {});
           await page.evaluate(() => { const allBtns = [...document.querySelectorAll('button')]; const confirmBtn = allBtns.find(b => b.innerText.trim() === 'SELL ALL' && b.offsetParent !== null); if (confirmBtn) confirmBtn.click(); });
           await sleep(3000);
           continue;
        }

        // 2. لو فاضي، اشتري أنابوليك
        if (state.hold === 0) {
           console.log("📍 كايرو - فاضي، هشتري أنابوليك");
           await page.evaluate(() => { let rows = [...document.querySelectorAll('tr')]; for (let r of rows) { if (r.innerText.includes('Anabolic steroid') && r.innerText.includes('£')) { let mb = [...r.querySelectorAll('button')].find(b => b.innerText.includes('Max Buy')); if (mb) { mb.click(); break; } } } });
           await sleep(1000);
           await page.evaluate(() => { let btn = [...document.querySelectorAll('button')].find(b => b.innerText.trim() === 'BUY MAX'); if (btn) btn.click(); });
           await sleep(2000);
           continue;
        }
        
        // 3. لو شايل أنابوليك، سافر طوكيو
        if (state.heldItem === "Anabolic steroid" && state.hold > 0) {
           console.log(`📍 كايرو - شايل أنابوليك (${state.hold})، رايح طوكيو`);
           await page.goto('https://www.project-dark.co.uk/travel', { waitUntil: 'networkidle2' });
           await sleep(2500);
           let travelCd = await page.evaluate(() => { let body = document.body.innerText; let cdMatch = body.match(/You cannot travel for:?\s*([0-9hms ]+)/i) || body.match(/Travel in\s*([0-9hms ]+)/i); return cdMatch ? cdMatch[1] : null; });
           if (travelCd) { console.log(`⏳ لقيت كولداون: ${travelCd}`); continue; }
           await page.evaluate(() => { let elements = [...document.querySelectorAll('a, span, div, button')]; let grid = elements.find(el => el.innerText.trim() === 'Grid View' && el.offsetParent !== null); if (grid) grid.click(); });
           await sleep(1500);
           await page.evaluate(() => { let cards = [...document.querySelectorAll('div')]; let target = cards.find(el => el.innerText.trim() === 'TOKYO' && el.offsetWidth > 150 && el.offsetHeight > 50); if (target) target.click(); });
           await sleep(1500);
           await page.evaluate(() => { let btn = [...document.querySelectorAll('button')].find(b => b.innerText.includes('Travel to Selected Location')); if (btn) btn.click(); });
           await sleep(1500);
           await page.waitForFunction(() => document.body.innerText.includes('Are you sure'), { timeout: 3000 }).catch(() => {});
           await page.evaluate(() => { let allBtns = [...document.querySelectorAll('button')]; let travelBtn = allBtns.find(b => b.innerText.trim() === 'TRAVEL' && b.offsetParent !== null); if (travelBtn) travelBtn.click(); });
           await sleep(5000);
           console.log("✈️ طلبت السفر لطوكيو");
           continue;
        }
      }

      // ✅ طوكيو: المنطق الصحيح حسب نوع العنصر
      else if (state.loc === "Tokyo") {
        // 1. لو شايل أنابوليك، ابيعها الأول
        if (state.heldItem === "Anabolic steroid" && state.hold > 0) {
           console.log(`📍 طوكيو - شايل أنابوليك (${state.hold})، هبيعها الأول`);
           await page.evaluate(() => { const rows = [...document.querySelectorAll('tr')]; for (let r of rows) { const text = r.innerText; if (text.includes('Anabolic steroid') && text.includes('Sell All') && !text.includes('Confirm')) { const btn = [...r.querySelectorAll('button')].find(b => b.innerText.trim() === 'Sell All'); if (btn) { btn.click(); break; } } } });
           await sleep(2000);
           await page.waitForFunction(() => document.body.innerText.includes('Confirm Sell All'), { timeout: 5000 }).catch(() => {});
           await page.evaluate(() => { const allBtns = [...document.querySelectorAll('button')]; const confirmBtn = allBtns.find(b => b.innerText.trim() === 'SELL ALL' && b.offsetParent !== null); if (confirmBtn) confirmBtn.click(); });
           await sleep(3000);
           continue;
        }

        // 2. لو فاضي، اشتري إلكترونيكس
        if (state.hold === 0) {
           console.log("📍 طوكيو - فاضي، هشتري إلكترونيكس");
           await page.evaluate(() => { let rows = [...document.querySelectorAll('tr')]; for (let r of rows) { if (r.innerText.includes('Electronics') && r.innerText.includes('£')) { let mb = [...r.querySelectorAll('button')].find(b => b.innerText.includes('Max Buy')); if (mb) { mb.click(); break; } } } });
           await sleep(1000);
           await page.evaluate(() => { let btn = [...document.querySelectorAll('button')].find(b => b.innerText.trim() === 'BUY MAX'); if (btn) btn.click(); });
           await sleep(2000);
           continue;
        }
        
        // 3. لو شايل إلكترونيكس، سافر كايرو
        if (state.heldItem === "Electronics" && state.hold > 0) {
           console.log(`📍 طوكيو - شايل إلكترونيكس (${state.hold})، رايح كايرو`);
           await page.goto('https://www.project-dark.co.uk/travel', { waitUntil: 'networkidle2' });
           await sleep(2500);
           let travelCd = await page.evaluate(() => { let body = document.body.innerText; let cdMatch = body.match(/You cannot travel for:?\s*([0-9hms ]+)/i) || body.match(/Travel in\s*([0-9hms ]+)/i); return cdMatch ? cdMatch[1] : null; });
           if (travelCd) { console.log(`⏳ لقيت كولداون: ${travelCd}`); continue; }
           await page.evaluate(() => { let elements = [...document.querySelectorAll('a, span, div, button')]; let grid = elements.find(el => el.innerText.trim() === 'Grid View' && el.offsetParent !== null); if (grid) grid.click(); });
           await sleep(1500);
           await page.evaluate(() => { let cards = [...document.querySelectorAll('div')]; let target = cards.find(el => el.innerText.trim() === 'CAIRO' && el.offsetWidth > 150 && el.offsetHeight > 50); if (target) target.click(); });
           await sleep(1500);
           await page.evaluate(() => { let btn = [...document.querySelectorAll('button')].find(b => b.innerText.includes('Travel to Selected Location')); if (btn) btn.click(); });
           await sleep(1500);
           await page.waitForFunction(() => document.body.innerText.includes('Are you sure'), { timeout: 3000 }).catch(() => {});
           await page.evaluate(() => { let allBtns = [...document.querySelectorAll('button')]; let travelBtn = allBtns.find(b => b.innerText.trim() === 'TRAVEL' && b.offsetParent !== null); if (travelBtn) travelBtn.click(); });
           await sleep(5000);
           console.log("✈️ طلبت السفر لكايرو");
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
