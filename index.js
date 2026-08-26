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
        else if (loc && loc.includes('London')) loc = 'London';
        else if (loc && loc.includes('Moscow')) loc = 'Moscow';
        else if (loc && loc.includes('Rome')) loc = 'Rome';
        else if (loc && loc.includes('Capetown')) loc = 'Capetown';
        else if (loc && loc.includes('Sydney')) loc = 'Sydney';
        else if (loc && loc.includes('Ottawa')) loc = 'Ottawa';
        else if (loc && loc.includes('Rio de Janeiro')) loc = 'Rio de Janeiro';

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
                        let cells = [...r.querySelectorAll('td')];
                        if (cells.length >= 3) {
                            let youHaveCell = cells[2].innerText;
                            let match = youHaveCell.match(/(\d+)/);
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
            let m = body.match(/holding (\d+) items/i);
            hold = m ? +m[1] : 0;
        }
        
        return { loc, cd: cooldownStr, hold, heldItem };
      }, ITEMS);

      // ✅ كولداون: فحص دوري مع عد تنازلي يمنع تجمد السيرفر
      if (state.cd) {
        console.log(`⏳ في كولداون: ${state.cd} - بدأ الفحص الدوري`);
        for (let i = 0; i < 3; i++) {
            // نعمل عد تنازلي 5 مرات (كل مرة دقيقة)
            for (let j = 5; j > 0; j--) {
                console.log(`⏳ باقي ${j} دقيقة على الفحص القادم...`);
                await sleep(60000); // دقيقة واحدة
            }
            
            console.log(`⏳ مرت ${(i + 1) * 5} دقيقة... جاري فحص السوق`);
            await page.goto('https://www.project-dark.co.uk/blackmarket', { waitUntil: 'networkidle2' });
            await sleep(2000);

            // فحص الحالة والشراء عند الحاجة
            let marketCheck = await page.evaluate((items) => {
                let body = document.body.innerText;
                let city = null;
                let lines = body.split('\n');
                for (let i = 0; i < lines.length; i++) {
                    if (lines[i].trim().toUpperCase() === 'LOCATION') {
                        for (let j = i + 1; j < lines.length; j++) {
                            if (lines[j].trim()) { city = lines[j].trim(); break; }
                        }
                        break;
                    }
                }
                if (city && city.includes('Cairo')) city = 'Cairo';
                else if (city && city.includes('Tokyo')) city = 'Tokyo';
                
                let hold = 0;
                let rows = [...document.querySelectorAll('tr')];
                let itemName = (city === 'Tokyo') ? 'Electronics' : 'Anabolic steroid';
                
                for (let r of rows) {
                    let rText = r.innerText;
                    if (rText.includes(itemName) && !rText.includes('Confirm')) {
                        let cells = [...r.querySelectorAll('td')];
                        if (cells.length >= 3) {
                            let match = cells[2].innerText.match(/(\d+)/);
                            if (match) hold = +match[1];
                        }
                        break;
                    }
                }
                return { city, itemName, hold };
            }, ITEMS);

            // لو السلعة غير موجودة (0) -> اشتريها
            if (marketCheck.hold === 0) {
                console.log(`📦 السلعة ${marketCheck.itemName} غير موجودة (0) في ${marketCheck.city}... هشتريها`);
                await page.evaluate((itemName) => {
                    let rows = [...document.querySelectorAll('tr')];
                    for (let r of rows) {
                        if (r.innerText.includes(itemName) && r.innerText.includes('£')) {
                            let mb = [...r.querySelectorAll('button')].find(b => b.innerText.includes('Max Buy'));
                            if (mb) { mb.click(); break; }
                        }
                    }
                }, marketCheck.itemName);
                await sleep(1000);
                await page.evaluate(() => {
                    let btn = [...document.querySelectorAll('button')].find(b => b.innerText.trim() === 'BUY MAX');
                    if (btn) btn.click();
                });
                await sleep(2000);
                console.log(`✅ اشتريت ${marketCheck.itemName} أثناء الكولداون`);
            } else {
                console.log(`✅ فحصت السوق: شايل ${marketCheck.hold} من ${marketCheck.itemName}`);
            }

            // الرجوع لصفحة السفر وقراءة الوقت الجديد
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

      // ✅ كايرو: بيع الإلكترونيكس أو شراء الأنابوليك
      if (state.loc === "Cairo") {
        if (state.heldItem === "Electronics" && state.hold > 0) {
           console.log("📍 كايرو - بيع الإلكترونيكس");
           await page.evaluate(() => { let rows = [...document.querySelectorAll('tr')]; for (let r of rows) { if (r.innerText.includes('Sell All') && !r.innerText.includes('Confirm')) { let btn = [...r.querySelectorAll('button')].find(b => b.innerText.trim() === 'Sell All'); if (btn) { btn.click(); break; } } } });
           await sleep(2000);
           await page.waitForFunction(() => document.body.innerText.includes('Confirm Sell All'), { timeout: 5000 }).catch(() => {});
           await page.evaluate(() => { const allBtns = [...document.querySelectorAll('button')]; const confirmBtn = allBtns.find(b => b.innerText.trim() === 'SELL ALL' && b.offsetParent !== null); if (confirmBtn) confirmBtn.click(); });
           await sleep(3000);
           continue;
        }
        
        if (state.hold === 0) {
           console.log("📍 كايرو - شراء أنابوليك سترويدز");
           await page.evaluate(() => { let rows = [...document.querySelectorAll('tr')]; for (let r of rows) { if (r.innerText.includes('Anabolic steroid') && r.innerText.includes('£')) { let mb = [...r.querySelectorAll('button')].find(b => b.innerText.includes('Max Buy')); if (mb) { mb.click(); break; } } } });
           await sleep(1000);
           await page.evaluate(() => { let btn = [...document.querySelectorAll('button')].find(b => b.innerText.trim() === 'BUY MAX'); if (btn) btn.click(); });
           await sleep(3000);
           continue;
        }
        
        if (state.heldItem === "Anabolic steroid" && state.hold > 0) {
           console.log("📍 كايرو - رايح طوكيو");
           await page.goto('https://www.project-dark.co.uk/travel', { waitUntil: 'networkidle2' });
           await sleep(2500);
           
           let travelCd = await page.evaluate(() => {
               let body = document.body.innerText;
               let cdMatch = body.match(/You cannot travel for:?\s*([0-9hms ]+)/i) || body.match(/Travel in\s*([0-9hms ]+)/i);
               return cdMatch ? cdMatch[1] : null;
           });
           
           if (travelCd) {
               console.log(`⏳ لقيت كولداون في السفر: ${travelCd} - بدأ الفحص الدوري`);
               for (let i = 0; i < 3; i++) {
                   for (let j = 5; j > 0; j--) {
                       console.log(`⏳ باقي ${j} دقيقة على الفحص القادم...`);
                       await sleep(60000);
                   }
                   console.log(`⏳ مرت ${(i + 1) * 5} دقيقة... جاري فحص السوق`);
                   await page.goto('https://www.project-dark.co.uk/blackmarket', { waitUntil: 'networkidle2' });
                   await sleep(2000);
                   
                   let marketCheck = await page.evaluate((items) => {
                       let body = document.body.innerText;
                       let city = null;
                       let lines = body.split('\n');
                       for (let i = 0; i < lines.length; i++) {
                           if (lines[i].trim().toUpperCase() === 'LOCATION') {
                               for (let j = i + 1; j < lines.length; j++) {
                                   if (lines[j].trim()) { city = lines[j].trim(); break; }
                               }
                               break;
                           }
                       }
                       if (city && city.includes('Cairo')) city = 'Cairo';
                       
                       let hold = 0;
                       let rows = [...document.querySelectorAll('tr')];
                       let itemName = 'Anabolic steroid';
                       for (let r of rows) {
                           let rText = r.innerText;
                           if (rText.includes(itemName) && !rText.includes('Confirm')) {
                               let cells = [...r.querySelectorAll('td')];
                               if (cells.length >= 3) {
                                   let match = cells[2].innerText.match(/(\d+)/);
                                   if (match) hold = +match[1];
                               }
                               break;
                           }
                       }
                       return { city, itemName, hold };
                   }, ITEMS);

                   if (marketCheck.hold === 0) {
                       console.log(`📦 السلعة ${marketCheck.itemName} غير موجودة (0)... هشتريها`);
                       await page.evaluate((itemName) => {
                           let rows = [...document.querySelectorAll('tr')];
                           for (let r of rows) {
                               if (r.innerText.includes(itemName) && r.innerText.includes('£')) {
                                   let mb = [...r.querySelectorAll('button')].find(b => b.innerText.includes('Max Buy'));
                                   if (mb) { mb.click(); break; }
                               }
                           }
                       }, marketCheck.itemName);
                       await sleep(1000);
                       await page.evaluate(() => {
                           let btn = [...document.querySelectorAll('button')].find(b => b.innerText.trim() === 'BUY MAX');
                           if (btn) btn.click();
                       });
                       await sleep(2000);
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

           await page.evaluate(() => { let elements = [...document.querySelectorAll('a, span, div, button')]; let grid = elements.find(el => el.innerText.trim() === 'Grid View' && el.offsetParent !== null); if (grid) grid.click(); });
           await sleep(1500);
           await page.evaluate(() => { let cards = [...document.querySelectorAll('div')]; let target = cards.find(el => el.innerText.trim() === 'TOKYO' && el.offsetWidth > 150 && el.offsetHeight > 50); if (target) target.click(); });
           await sleep(1500);
           await page.evaluate(() => { let btn = [...document.querySelectorAll('button')].find(b => b.innerText.includes('Travel to Selected Location')); if (btn) btn.click(); });
           await sleep(1500);
           await page.waitForFunction(() => document.body.innerText.includes('Are you sure'), { timeout: 3000 }).catch(() => {});
           await page.evaluate(() => { let allBtns = [...document.querySelectorAll('button')]; let travelBtn = allBtns.find(b => b.innerText.trim() === 'TRAVEL' && b.offsetParent !== null); if (travelBtn) travelBtn.click(); });
           await sleep(5000);
           let verify = await page.evaluate(() => document.body.innerText.includes('Black Market - Tokyo'));
           if (verify) console.log("🎉 وصلنا طوكيو!");
           else { console.log("⚠️ حصلت مشكلة، هنرجع للسوق"); await page.goto('https://www.project-dark.co.uk/blackmarket', { waitUntil: 'networkidle2' }); }
           continue;
        }
      }

      // ✅ طوكيو: بيع الأنابوليك، أو شراء الإلكترونيكس، أو السفر لكايرو
      else if (state.loc === "Tokyo") {
        if (state.heldItem === "Anabolic steroid" && state.hold > 0) {
           console.log("📍 طوكيو - بيع الأنابوليك سترويدز");
           await page.evaluate(() => { const rows = [...document.querySelectorAll('tr')]; for (let r of rows) { const text = r.innerText; if (text.includes('Anabolic steroid') && text.includes('Sell All') && !text.includes('Confirm')) { const btn = [...r.querySelectorAll('button')].find(b => b.innerText.trim() === 'Sell All'); if (btn) { btn.click(); break; } } } });
           await sleep(2000);
           await page.waitForFunction(() => document.body.innerText.includes('Confirm Sell All'), { timeout: 5000 }).catch(() => {});
           await page.evaluate(() => { const allBtns = [...document.querySelectorAll('button')]; const confirmBtn = allBtns.find(b => b.innerText.trim() === 'SELL ALL' && b.offsetParent !== null); if (confirmBtn) confirmBtn.click(); });
           await sleep(3000);
           continue;
        }
        
        if (state.hold === 0) {
           console.log("📍 طوكيو - شراء إلكترونيكس");
           await page.evaluate(() => { let rows = [...document.querySelectorAll('tr')]; for (let r of rows) { if (r.innerText.includes('Electronics') && r.innerText.includes('£')) { let mb = [...r.querySelectorAll('button')].find(b => b.innerText.includes('Max Buy')); if (mb) { mb.click(); break; } } } });
           await sleep(1000);
           await page.evaluate(() => { let btn = [...document.querySelectorAll('button')].find(b => b.innerText.trim() === 'BUY MAX'); if (btn) btn.click(); });
           await sleep(3000);
           continue;
        }

        if (state.heldItem === "Electronics" && state.hold > 0) {
           console.log("📍 طوكيو - رايح كايرو (سأقرأ الكولداون أولاً)");
           await page.goto('https://www.project-dark.co.uk/travel', { waitUntil: 'networkidle2' });
           await sleep(2500);
           
           let travelCd = await page.evaluate(() => {
               let body = document.body.innerText;
               let cdMatch = body.match(/You cannot travel for:?\s*([0-9hms ]+)/i) || body.match(/Travel in\s*([0-9hms ]+)/i);
               return cdMatch ? cdMatch[1] : null;
           });
           
           if (travelCd) {
               console.log(`⏳ لقيت كولداون في السفر: ${travelCd} - بدأ الفحص الدوري`);
               for (let i = 0; i < 3; i++) {
                   for (let j = 5; j > 0; j--) {
                       console.log(`⏳ باقي ${j} دقيقة على الفحص القادم...`);
                       await sleep(60000);
                   }
                   console.log(`⏳ مرت ${(i + 1) * 5} دقيقة... جاري فحص السوق`);
                   await page.goto('https://www.project-dark.co.uk/blackmarket', { waitUntil: 'networkidle2' });
                   await sleep(2000);
                   
                   let marketCheck = await page.evaluate(() => {
                       let body = document.body.innerText;
                       let city = null;
                       let lines = body.split('\n');
                       for (let i = 0; i < lines.length; i++) {
                           if (lines[i].trim().toUpperCase() === 'LOCATION') {
                               for (let j = i + 1; j < lines.length; j++) {
                                   if (lines[j].trim()) { city = lines[j].trim(); break; }
                               }
                               break;
                           }
                       }
                       if (city && city.includes('Tokyo')) city = 'Tokyo';
                       
                       let hold = 0;
                       let rows = [...document.querySelectorAll('tr')];
                       let itemName = 'Electronics';
                       for (let r of rows) {
                           let rText = r.innerText;
                           if (rText.includes(itemName) && !rText.includes('Confirm')) {
                               let cells = [...r.querySelectorAll('td')];
                               if (cells.length >= 3) {
                                   let match = cells[2].innerText.match(/(\d+)/);
                                   if (match) hold = +match[1];
                               }
                               break;
                           }
                       }
                       return { city, itemName, hold };
                   });

                   if (marketCheck.hold === 0) {
                       console.log(`📦 السلعة ${marketCheck.itemName} غير موجودة (0)... هشتريها`);
                       await page.evaluate((itemName) => {
                           let rows = [...document.querySelectorAll('tr')];
                           for (let r of rows) {
                               if (r.innerText.includes(itemName) && r.innerText.includes('£')) {
                                   let mb = [...r.querySelectorAll('button')].find(b => b.innerText.includes('Max Buy'));
                                   if (mb) { mb.click(); break; }
                               }
                           }
                       }, marketCheck.itemName);
                       await sleep(1000);
                       await page.evaluate(() => {
                           let btn = [...document.querySelectorAll('button')].find(b => b.innerText.trim() === 'BUY MAX');
                           if (btn) btn.click();
                       });
                       await sleep(2000);
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

           await page.evaluate(() => { let elements = [...document.querySelectorAll('a, span, div, button')]; let grid = elements.find(el => el.innerText.trim() === 'Grid View' && el.offsetParent !== null); if (grid) grid.click(); });
           await sleep(1500);
           await page.evaluate(() => { let cards = [...document.querySelectorAll('div')]; let target = cards.find(el => el.innerText.trim() === 'CAIRO' && el.offsetWidth > 150 && el.offsetHeight > 50); if (target) target.click(); });
           await sleep(1500);
           await page.evaluate(() => { let btn = [...document.querySelectorAll('button')].find(b => b.innerText.includes('Travel to Selected Location')); if (btn) btn.click(); });
           await sleep(1500);
           await page.waitForFunction(() => document.body.innerText.includes('Are you sure'), { timeout: 3000 }).catch(() => {});
           await page.evaluate(() => { let allBtns = [...document.querySelectorAll('button')]; let travelBtn = allBtns.find(b => b.innerText.trim() === 'TRAVEL' && b.offsetParent !== null); if (travelBtn) travelBtn.click(); });
           await sleep(5000);
           let verify = await page.evaluate(() => document.body.innerText.includes('Black Market - Cairo'));
           if (verify) console.log("🎉 وصلنا كايرو!");
           else { console.log("⚠️ حصلت مشكلة، هنرجع للسوق"); await page.goto('https://www.project-dark.co.uk/blackmarket', { waitUntil: 'networkidle2' }); }
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
