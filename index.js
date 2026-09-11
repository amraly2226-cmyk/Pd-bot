const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

const COOKIE_VALUE = process.env.PD_COOKIE || "";
const USERNAME = 'amr.aly.2226@gmail.com'; 
const PASSWORD = 'Gun@12345';

const ITEMS = ["Anabolic steroid","Artifacts","Alcohol","Electronics","Plastic jewelry","Stolen paintings","Human beings","Confidential documents","Endangered exotic animals","Organs"];

async function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

(async () => {
  console.log("🚀 البوت شغال...");
  
  if (!COOKIE_VALUE) {
      console.log("❌ مفيش كوكيز! حط PD_COOKIE في المتغيرات على Railway.");
      process.exit(1);
  }
  
  console.log(`🔑 طول الكوكيز: ${COOKIE_VALUE.length} حرف`);
  
  const launchOptions = {
    headless: 'new',
    args: [
      '--no-sandbox', 
      '--disable-setuid-sandbox', 
      '--disable-dev-shm-usage',
      '--disable-blink-features=AutomationControlled',
      '--window-size=1920,1080'
    ]
  };
  
  if (process.env.PUPPETEER_EXECUTABLE_PATH) {
    launchOptions.executablePath = process.env.PUPPETEER_EXECUTABLE_PATH;
  }
  
  const browser = await puppeteer.launch(launchOptions);
  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 }); 
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
  page.setDefaultTimeout(30000);

  // ═══════════════════════════════════════════════════════════════
  // 1) الدخول بالكوكيز
  // ═══════════════════════════════════════════════════════════════
  try {
      console.log("🍪 جاري تحضير الكوكيز...");
      
      // نروح للصفحة الرئيسية الأول عشان نقدر نحط كوكي على الدومين
      await page.goto('https://www.project-dark.co.uk/', { waitUntil: 'domcontentloaded', timeout: 60000 });
      await sleep(3000);
      
      // نحط الكوكي
      await page.setCookie({
          name: 'project-dark-session',
          value: COOKIE_VALUE,
          domain: '.project-dark.co.uk',
          path: '/',
          httpOnly: true,
          secure: true,
          sameSite: 'Lax'
      });
      console.log("✅ تم تحضير الكوكيز.");
      
      // نروح للبلاك ماركت
      console.log("🔄 جاري الذهاب للبلاك ماركت...");
      await page.goto('https://www.project-dark.co.uk/blackmarket', { waitUntil: 'domcontentloaded', timeout: 60000 });
      await sleep(5000);
      
      let currentUrl = page.url();
      console.log(`🔗 الرابط الحالي: ${currentUrl}`);
      
      if (currentUrl.includes('/login') || currentUrl.includes('register')) {
          console.log("❌ الكوكيز انتهت صلاحيتها! محتاج تجيب كوكيز جديدة.");
          console.log("📋 الخطوات:");
          console.log("   1. افتح project-dark.co.uk في Chrome");
          console.log("   2. سجل دخول يدوياً");
          console.log("   3. F12 → Application → Cookies");
          console.log("   4. انسخ قيمة project-dark-session");
          console.log("   5. حدّث PD_COOKIE في Railway Variables");
          process.exit(1);
      }
      
      // نتأكد إننا في الصفحة الصح
      let pageCheck = await page.evaluate(() => document.body.innerText.includes('Black Market') || document.body.innerText.includes('LOCATION'));
      if (!pageCheck) {
          console.log("⚠️ الصفحة مش واضح إنها بلاك ماركت، بس هنكمل...");
      } else {
          console.log("✅ دخلنا البلاك ماركت بنجاح!");
      }
      
  } catch (e) {
      console.log("⚠️ مشكلة في الدخول بالكوكيز:", e.message);
  }

  // ═══════════════════════════════════════════════════════════════
  // 2) اللوب الرئيسي
  // ═══════════════════════════════════════════════════════════════
  while (true) {
    try {
      // لو إحنا في صفحة الترافل
      if (page.url().includes('travel')) {
        let currentCity = await page.evaluate(() => {
            let bodyText = document.body.innerText || '';
            if (/CURRENT LOCATION/i.test(bodyText)) {
                if (/NEW YORK[\s\S]*CURRENT LOCATION/i.test(bodyText)) return 'New York';
                if (/BOSTON[\s\S]*CURRENT LOCATION/i.test(bodyText)) return 'Boston';
            }
            if (/New York/i.test(bodyText)) return 'New York';
            if (/Boston/i.test(bodyText)) return 'Boston';
            return null;
        });

        let destCity = 'New York';
        if (currentCity === 'Boston') { destCity = 'New York'; console.log(`✈️ بوسطن - رايح نيويورك`); }
        else if (currentCity === 'New York') { destCity = 'Boston'; console.log(`✈️ نيويورك - رايح بوسطن`); }
        else { console.log(`⚠️ مش عارف أنا فين (${currentCity})، هروح نيويورك...`); destCity = 'New York'; }

        // اختيار جرايد فيو
        await page.evaluate(() => { 
            let grid = [...document.querySelectorAll('a, span, div, button')].find(el => el.innerText.trim() === 'Grid View' && el.offsetParent !== null); 
            if (grid) grid.click(); 
        });
        await sleep(1500);

        // اختيار المدينة
        await page.evaluate((city) => {
            let elements = [...document.querySelectorAll('div, span, a, button')];
            let textEl = elements.find(el => new RegExp('^' + city + '$', 'i').test((el.innerText||'').trim()) && el.offsetParent !== null);
            if (textEl) {
                let card = textEl.closest('div');
                if (card && card.offsetWidth > 100) card.click();
                else textEl.click();
            }
        }, destCity);
        await sleep(1500);

        // دوس Travel to Selected Location
        await page.evaluate(() => { 
            let btn = [...document.querySelectorAll('button')].find(b => b.innerText.includes('Travel to Selected Location')); 
            if (btn) btn.click(); 
        });
        await sleep(1500);
        
        // استنى البوباب
        await page.waitForFunction(() => document.body.innerText.includes('Are you sure'), { timeout: 15000 }).catch(() => {});
        
        // دوس TRAVEL
        await page.evaluate(() => { 
            let btn = [...document.querySelectorAll('button')].find(b => b.innerText.trim() === 'TRAVEL'); 
            if (btn) btn.click(); 
        });
        
        console.log(`✈️ تم السفر لـ ${destCity}`);
        await sleep(7000); 
        await page.goto('https://www.project-dark.co.uk/blackmarket', { waitUntil: 'networkidle2' });
        await sleep(2000);
        continue;
      }

      // قراءة الحالة من صفحة السوق
      await sleep(2000); 
      let state = await page.evaluate((items) => {
        let bodyText = document.body.innerText || '';
        let loc = null, cooldownStr = null;
        
        // قراءة الموقع من العنوان أو القائمة الجانبية
        let titleMatch = bodyText.match(/Black Market\s*[-–—]?\s*(New York|Boston)/i);
        if (titleMatch) loc = titleMatch[1];
        else {
            let sidebarMatch = bodyText.match(/Location\s*[-–—:]?\s*(New York|Boston)/i);
            if (sidebarMatch) loc = sidebarMatch[1];
            else {
                let hasNY = /New York/i.test(bodyText), hasBos = /Boston/i.test(bodyText);
                if (hasNY && !hasBos) loc = 'New York';
                else if (hasBos && !hasNY) loc = 'Boston';
            }
        }

        // قراءة الكولداون
        let cdMatch = bodyText.match(/You cannot travel for:?\s*([0-9hms ]+)/i) || bodyText.match(/Travel in\s*([0-9hms ]+)/i);
        if (cdMatch) cooldownStr = cdMatch[1];

        // قراءة العنصر اللي معاه
        let hold = 0, heldItem = null;
        let rows = [...document.querySelectorAll('tr')];
        for (let r of rows) {
            let rText = r.innerText || '';
            if (rText.includes('Sell') && !rText.includes('Confirm')) {
                for (let it of items) {
                    if (rText.toLowerCase().includes(it.toLowerCase())) {
                        let cells = [...r.querySelectorAll('td')];
                        if (cells.length >= 3) {
                            let match = (cells[2].innerText || '').match(/(\d+)/);
                            if (match && +match[1] > 0) { 
                                heldItem = it; 
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
            let m = bodyText.match(/holding (\d+) items/i);
            hold = m ? +m[1] : 0;
        }
        return { loc, cd: cooldownStr, hold, heldItem, debugSnippet: bodyText.substring(0, 300) };
      }, ITEMS);

      console.log(`📍 الموقع: ${state.loc || 'غير معروف'} | كولداون: ${state.cd || 'لا يوجد'} | العنصر: ${state.heldItem || 'فاضي'} (${state.hold})`);
      
      if (!state.loc) {
          console.log("🔍 DEBUG:", state.debugSnippet.replace(/\n/g, ' | '));
          // لو مش عارف المدينة، نروح نعيد من البلاك ماركت
          await page.goto('https://www.project-dark.co.uk/blackmarket', { waitUntil: 'networkidle2' });
          await sleep(5000);
          continue;
      }

      // لو في كولداون، نستنى
      if (state.cd) {
        console.log(`⏳ كولداون: ${state.cd} - هستنى دقيقة`);
        await sleep(60000);
        continue;
      }

      // ═══════════════════════════════════════════════════════════════
      // نيويورك: يشتري Plastic jewelry ويسافر بوسطن
      // ═══════════════════════════════════════════════════════════════
      if (state.loc === "New York") {
        
        // لو معاه Stolen paintings (راجع من بوسطن) -> يبيع
        if (state.heldItem === "Stolen paintings" && state.hold > 0) {
           console.log("💰 نيويورك - بيع Stolen paintings");
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
           await page.waitForFunction(() => document.body.innerText.includes('Confirm Sell All'), { timeout: 5000 }).catch(() => {});
           await page.evaluate(() => { 
               let btn = [...document.querySelectorAll('button')].find(b => b.innerText.trim() === 'SELL ALL'); 
               if (btn) btn.click(); 
           });
           await sleep(3000);
           continue;
        }
        
        // لو معاه Plastic jewelry -> يسافر بوسطن
        if (state.heldItem === "Plastic jewelry" && state.hold > 0) {
           console.log("✈️ نيويورك - رايح بوسطن");
           await page.goto('https://www.project-dark.co.uk/travel', { waitUntil: 'networkidle2' });
           await sleep(2500);
           
           let travelCd = await page.evaluate(() => { 
               let m = document.body.innerText.match(/You cannot travel for:?\s*([0-9hms ]+)/i) || document.body.innerText.match(/Travel in\s*([0-9hms ]+)/i); 
               return m ? m[1] : null; 
           });
           
           if (travelCd) { 
               console.log(`⏳ كولداون سفر: ${travelCd}`); 
               await sleep(60000); 
               continue; 
           }
           
           await page.evaluate(() => { 
               let grid = [...document.querySelectorAll('a, span, div, button')].find(el => el.innerText.trim() === 'Grid View' && el.offsetParent !== null); 
               if (grid) grid.click(); 
           });
           await sleep(1500);
           
           await page.evaluate(() => { 
               let cards = [...document.querySelectorAll('div')]; 
               let t = cards.find(el => /boston/i.test(el.innerText) && el.offsetWidth > 150 && el.offsetHeight > 50); 
               if (t) t.click(); 
           });
           await sleep(1500);
           
           await page.evaluate(() => { 
               let btn = [...document.querySelectorAll('button')].find(b => b.innerText.includes('Travel to Selected Location')); 
               if (btn) btn.click(); 
           });
           await sleep(1500);
           
           await page.waitForFunction(() => document.body.innerText.includes('Are you sure'), { timeout: 15000 }).catch(() => {});
           
           await page.evaluate(() => { 
               let btn = [...document.querySelectorAll('button')].find(b => b.innerText.trim() === 'TRAVEL'); 
               if (btn) btn.click(); 
           });
           await sleep(5000);
           
           await page.goto('https://www.project-dark.co.uk/blackmarket', { waitUntil: 'networkidle2' });
           await sleep(2000);
           continue;
        }
        
        // لو معاه 0 -> يشتري Plastic jewelry
        if (state.hold === 0) {
           console.log("🛒 نيويورك - شراء Plastic jewelry");
           await page.evaluate(() => { 
               let rows = [...document.querySelectorAll('tr')]; 
               for (let r of rows) { 
                   if (r.innerText.includes('Plastic jewelry') && r.innerText.includes('£')) { 
                       let mb = [...r.querySelectorAll('button')].find(b => b.innerText.includes('Max Buy')); 
                       if (mb) { mb.click(); break; } 
                   } 
               } 
           });
           await sleep(1000);
           await page.evaluate(() => { 
               let btn = [...document.querySelectorAll('button')].find(b => b.innerText.trim() === 'BUY MAX'); 
               if (btn) btn.click(); 
           });
           await sleep(3000);
           continue;
        }
      }

      // ═══════════════════════════════════════════════════════════════
      // بوسطن: يشتري Stolen paintings ويسافر نيويورك
      // ═══════════════════════════════════════════════════════════════
      else if (state.loc === "Boston") {
        
        // لو معاه Plastic jewelry (راجع من نيويورك) -> يبيع
        if (state.heldItem === "Plastic jewelry" && state.hold > 0) {
           console.log("💰 بوسطن - بيع Plastic jewelry");
           await page.evaluate(() => { 
               let rows = [...document.querySelectorAll('tr')]; 
               for (let r of rows) { 
                   if (r.innerText.includes('Plastic jewelry') && r.innerText.includes('Sell All') && !r.innerText.includes('Confirm')) { 
                       let btn = [...r.querySelectorAll('button')].find(b => b.innerText.trim() === 'Sell All'); 
                       if (btn) { btn.click(); break; } 
                   } 
               } 
           });
           await sleep(2000);
           await page.waitForFunction(() => document.body.innerText.includes('Confirm Sell All'), { timeout: 5000 }).catch(() => {});
           await page.evaluate(() => { 
               let btn = [...document.querySelectorAll('button')].find(b => b.innerText.trim() === 'SELL ALL'); 
               if (btn) btn.click(); 
           });
           await sleep(3000);
           continue;
        }
        
        // لو معاه Stolen paintings -> يسافر نيويورك
        if (state.heldItem === "Stolen paintings" && state.hold > 0) {
           console.log("✈️ بوسطن - رايح نيويورك");
           await page.goto('https://www.project-dark.co.uk/travel', { waitUntil: 'networkidle2' });
           await sleep(2500);
           
           let travelCd = await page.evaluate(() => { 
               let m = document.body.innerText.match(/You cannot travel for:?\s*([0-9hms ]+)/i) || document.body.innerText.match(/Travel in\s*([0-9hms ]+)/i); 
               return m ? m[1] : null; 
           });
           
           if (travelCd) { 
               console.log(`⏳ كولداون سفر: ${travelCd}`); 
               await sleep(60000); 
               continue; 
           }
           
           await page.evaluate(() => { 
               let grid = [...document.querySelectorAll('a, span, div, button')].find(el => el.innerText.trim() === 'Grid View' && el.offsetParent !== null); 
               if (grid) grid.click(); 
           });
           await sleep(1500);
           
           await page.evaluate(() => { 
               let cards = [...document.querySelectorAll('div')]; 
               let t = cards.find(el => /new york/i.test(el.innerText) && el.offsetWidth > 150 && el.offsetHeight > 50); 
               if (t) t.click(); 
           });
           await sleep(1500);
           
           await page.evaluate(() => { 
               let btn = [...document.querySelectorAll('button')].find(b => b.innerText.includes('Travel to Selected Location')); 
               if (btn) btn.click(); 
           });
           await sleep(1500);
           
           await page.waitForFunction(() => document.body.innerText.includes('Are you sure'), { timeout: 15000 }).catch(() => {});
           
           await page.evaluate(() => { 
               let btn = [...document.querySelectorAll('button')].find(b => b.innerText.trim() === 'TRAVEL'); 
               if (btn) btn.click(); 
           });
           await sleep(5000);
           
           await page.goto('https://www.project-dark.co.uk/blackmarket', { waitUntil: 'networkidle2' });
           await sleep(2000);
           continue;
        }

        // لو معاه 0 -> يشتري Stolen paintings
        if (state.hold === 0) {
           console.log("🛒 بوسطن - شراء Stolen paintings");
           await page.evaluate(() => { 
               let rows = [...document.querySelectorAll('tr')]; 
               for (let r of rows) { 
                   if (r.innerText.includes('Stolen paintings') && r.innerText.includes('£')) { 
                       let mb = [...r.querySelectorAll('button')].find(b => b.innerText.includes('Max Buy')); 
                       if (mb) { mb.click(); break; } 
                   } 
               } 
           });
           await sleep(1000);
           await page.evaluate(() => { 
               let btn = [...document.querySelectorAll('button')].find(b => b.innerText.trim() === 'BUY MAX'); 
               if (btn) btn.click(); 
           });
           await sleep(3000);
           continue;
        }
      }
      
      // لو مدينة تانية، نسافر لنيويورك
      else {
          console.log(`⚠️ مدينة غير معروفة (${state.loc})، رايح نيويورك...`);
          await page.goto('https://www.project-dark.co.uk/travel', { waitUntil: 'networkidle2' });
          await sleep(3000);
          
          await page.evaluate(() => { 
              let grid = [...document.querySelectorAll('a, span, div, button')].find(el => el.innerText.trim() === 'Grid View' && el.offsetParent !== null); 
              if (grid) grid.click(); 
          });
          await sleep(1500);
          
          await page.evaluate(() => { 
              let cards = [...document.querySelectorAll('div')]; 
              let t = cards.find(el => /new york/i.test(el.innerText) && el.offsetWidth > 150 && el.offsetHeight > 50); 
              if (t) t.click(); 
          });
          await sleep(1500);
          
          await page.evaluate(() => { 
              let btn = [...document.querySelectorAll('button')].find(b => b.innerText.includes('Travel to Selected Location')); 
              if (btn) btn.click(); 
          });
          await sleep(1500);
          
          await page.waitForFunction(() => document.body.innerText.includes('Are you sure'), { timeout: 15000 }).catch(() => {});
          
          await page.evaluate(() => { 
              let btn = [...document.querySelectorAll('button')].find(b => b.innerText.trim() === 'TRAVEL'); 
              if (btn) btn.click(); 
          });
          await sleep(7000);
          
          await page.goto('https://www.project-dark.co.uk/blackmarket', { waitUntil: 'networkidle2' });
          await sleep(2000);
          continue;
      }

    } catch (e) {
      console.log("⚠️ خطأ مؤقت:", e.message);
      await sleep(15000);
    }
    await sleep(10000);
  }
})();
