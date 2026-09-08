// ============================================================
// 👇 انسخ هذا السكربت بالكامل والصقه في ملف index.js
// ============================================================

const puppeteer = require('puppeteer');

// ⬅️ بيانات الدخول (عدّلها حسب حسابك)
const USERNAME = 'amr.aly.2226@gmail.com';
const PASSWORD = 'Gun@12345';

const ITEMS = ["Anabolic steroid", "Artifacts", "Alcohol", "Electronics", "Plastic jewelry", "Stolen paintings", "Human beings", "Confidential documents", "Endangered exotic animals", "Organs"];

async function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

(async () => {
  console.log("🚀 البوت شغال...");

  // ✅ تشغيل المتصفح (headless: true مناسب للخوادم)
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });
  page.setDefaultTimeout(60000);

  try {
    // =================== الخطوة 1: فتح صفحة الدخول ===================
    console.log("🔐 جاري فتح صفحة الدخول...");
    await page.goto('https://www.project-dark.co.uk/login', { waitUntil: 'networkidle2', timeout: 60000 });

    // =================== الخطوة 2: انتظار ظهور مربع التحقق ===================
    console.log("⏳ في انتظار ظهور مربع التحقق (علامة الصح)...");
    let verified = false;

    // انتظر حتى تظهر علامة الصح أو يتم تفعيل checkbox
    try {
      await page.waitForFunction(() => {
        const body = document.body.innerText;
        if (body.includes('✓') || body.includes('Success!') || body.includes('CLOUDFLARE')) return true;
        const cb = document.querySelector('input[type="checkbox"]:checked, [role="checkbox"][aria-checked="true"]');
        if (cb && cb.offsetParent !== null) return true;
        return false;
      }, { timeout: 30000 });
      console.log("✅ تم اكتشاف علامة الصح تلقائياً");
      verified = true;
    } catch (e) {
      console.log("⚠️ لم نجد علامة الصح، نحاول النقر على مربع التحقق إن وجد...");
      // حاول النقر على أي checkbox
      const clicked = await page.evaluate(() => {
        const cbs = document.querySelectorAll('input[type="checkbox"], [role="checkbox"]');
        for (let cb of cbs) {
          if (cb.offsetParent !== null && !cb.checked && cb.getAttribute('aria-checked') !== 'true') {
            cb.click();
            return true;
          }
        }
        return false;
      });
      if (clicked) {
        console.log("✅ تم النقر على مربع التحقق، ننتظر ثانيتين...");
        await sleep(2000);
        // تحقق مرة أخرى من ظهور العلامة
        const recheck = await page.evaluate(() => {
          const body = document.body.innerText;
          return body.includes('✓') || body.includes('Success!');
        });
        if (recheck) {
          console.log("✅ أصبحت العلامة ظاهرة الآن");
          verified = true;
        }
      } else {
        console.log("⚠️ لم نجد مربع تحقق، نكمل على أي حال...");
      }
    }

    // =================== الخطوة 3: كتابة البيانات (بعد التحقق) ===================
    console.log("✍️ جاري كتابة اليوزرنيم والباسورد...");
    const inputs = await page.$$('input[type="text"], input[type="email"], input[type="password"]');
    if (inputs.length >= 2) {
      await inputs[0].click({ clickCount: 3 });
      await inputs[0].type(USERNAME);
      await inputs[1].click({ clickCount: 3 });
      await inputs[1].type(PASSWORD);
    }
    console.log("✅ تم كتابة البيانات");

    // =================== الخطوة 4: الضغط على زر Login ===================
    console.log("🔑 جاري الضغط على Login...");
    await page.click('button[type="submit"]').catch(async () => {
      await page.evaluate(() => {
        const btns = [...document.querySelectorAll('button, input[type="submit"]')];
        const loginBtn = btns.find(b => b.innerText?.toLowerCase().includes('login') || b.value?.toLowerCase().includes('login'));
        if (loginBtn) loginBtn.click();
      });
    });
    console.log("✅ تم الضغط على Login");

    // =================== الخطوة 5: انتظار التوجيه ===================
    console.log("⏳ في انتظار التوجيه بعد الدخول...");
    await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 30000 }).catch(() => {
      console.log("⚠️ لم يحدث توجيه تلقائي، ننتظر 5 ثوانٍ ثم نكمل...");
    });
    await sleep(5000);

    // =================== الخطوة 6: التوجه إلى البلاك ماركت ===================
    if (!page.url().includes('blackmarket')) {
      console.log("🚀 جاري التوجه إلى البلاك ماركت يدوياً...");
      await page.goto('https://www.project-dark.co.uk/blackmarket', { waitUntil: 'networkidle2', timeout: 60000 });
    } else {
      console.log("✅ بالفعل في البلاك ماركت");
    }

    // =================== الخطوة 7: قراءة المدينة (مع إعادة المحاولة) ===================
    let currentCity = null;
    for (let attempt = 0; attempt < 5; attempt++) {
      currentCity = await page.evaluate(() => {
        const body = document.body.innerText;
        // 1) من "Black Market - ..."
        let match = body.match(/Black Market - (Los Angeles|San Francisco)/i);
        if (match) return match[1];
        // 2) من "Location"
        let locMatch = body.match(/Location\s*\n\s*(Los Angeles|San Francisco)/i);
        if (locMatch) return locMatch[1];
        // 3) بحث عام
        if (body.includes('Los Angeles')) return 'Los Angeles';
        if (body.includes('San Francisco')) return 'San Francisco';
        // 4) من الرابط
        const url = window.location.href;
        if (url.includes('los-angeles')) return 'Los Angeles';
        if (url.includes('san-francisco')) return 'San Francisco';
        return null;
      });

      if (currentCity) {
        console.log(`✅ المدينة الحالية: ${currentCity}`);
        break;
      } else {
        console.log(`⚠️ لم نجد المدينة في المحاولة ${attempt + 1}، نعيد التحميل...`);
        await page.reload({ waitUntil: 'networkidle2' });
        await sleep(3000);
      }
    }

    if (!currentCity) {
      console.log("❌ فشل في العثور على المدينة حتى بعد عدة محاولات.");
      await page.screenshot({ path: 'debug_fail.png' });
      console.log(`🌐 الرابط الحالي: ${page.url()}`);
      console.log("⏳ ننتظر 20 ثانية للمعاينة ثم نغلق...");
      await sleep(20000);
      await browser.close();
      return;
    }

    // ============================================================
    // ========== باقي السكربت (التداول والسفر بين المدن) ==========
    // ============================================================
    while (true) {
      try {
        // 1) إذا كنا في صفحة السفر
        if (page.url().includes('travel')) {
          // نقرأ المدينة الحالية من نفس الصفحة
          let city = await page.evaluate(() => {
            const body = document.body.innerText;
            let match = body.match(/Black Market - (Los Angeles|San Francisco)/i);
            if (match) return match[1];
            let locMatch = body.match(/Location\s*\n\s*(Los Angeles|San Francisco)/i);
            if (locMatch) return locMatch[1];
            if (body.includes('Los Angeles')) return 'Los Angeles';
            if (body.includes('San Francisco')) return 'San Francisco';
            return null;
          });

          if (!city) {
            console.log("⚠️ لم نجد المدينة في صفحة السفر، نعيد المحاولة...");
            await page.goto('https://project-dark.co.uk/travel');
            await sleep(3000);
            continue;
          }

          const destCity = (city === 'Los Angeles') ? 'San Francisco' : 'Los Angeles';
          console.log(`✈️ ${city} → جاري السفر إلى ${destCity}`);

          // اختيار Grid View
          await page.evaluate(() => {
            const grid = [...document.querySelectorAll('a, span, div, button')]
              .find(el => el.innerText.trim() === 'Grid View' && el.offsetParent !== null);
            if (grid) grid.click();
          });
          await sleep(1500);

          // اختيار المدينة من البطاقة
          await page.evaluate((dest) => {
            const cityUpper = dest.toUpperCase();
            const elements = [...document.querySelectorAll('div, span, a')];
            const textEl = elements.find(el => el.innerText.trim() === cityUpper && el.offsetParent !== null);
            if (textEl) {
              const card = textEl.closest('div');
              if (card && card.offsetWidth > 100) card.click();
              else textEl.click();
            }
          }, destCity);
          await sleep(1500);

          // الضغط على Travel to Selected Location
          await page.evaluate(() => {
            const btn = [...document.querySelectorAll('button')]
              .find(b => b.innerText.includes('Travel to Selected Location'));
            if (btn) btn.click();
          });

          // انتظار ظهور "Are you sure"
          await page.waitForFunction(() => document.body.innerText.includes('Are you sure'), { timeout: 15000 }).catch(() => {});
          // الضغط على زر TRAVEL في النافذة المنبثقة
          await page.evaluate(() => {
            const allBtns = [...document.querySelectorAll('button')];
            const travelBtn = allBtns.find(b => b.innerText.trim() === 'TRAVEL');
            if (travelBtn) travelBtn.click();
          });

          console.log(`✈️ تم الضغط على TRAVEL لـ ${destCity}`);
          await sleep(7000);
          await page.goto('https://www.project-dark.co.uk/blackmarket');
          // انتظار ظهور المدينة الجديدة
          await page.waitForFunction(() => {
            const body = document.body.innerText;
            return body.includes('Location') || body.includes('Black Market -');
          }, { timeout: 20000 }).catch(() => console.log("⚠️ لم نجد المدينة بعد السفر"));
          continue;
        }

        // 2) إذا كنا في السوق (بيع وشراء)
        // نقرأ الحالة (المدينة، الكولداون، العناصر المحمولة)
        const state = await page.evaluate((items) => {
          const body = document.body.innerText;
          let loc = null;
          let cooldownStr = null;

          // محاولة قراءة المدينة من "Location"
          const lines = body.split('\n');
          for (let i = 0; i < lines.length; i++) {
            if (lines[i].trim().toUpperCase() === 'LOCATION') {
              for (let j = i + 1; j < lines.length; j++) {
                if (lines[j].trim()) {
                  const candidate = lines[j].trim();
                  if (candidate.includes('Los Angeles')) loc = 'Los Angeles';
                  else if (candidate.includes('San Francisco')) loc = 'San Francisco';
                  break;
                }
              }
              break;
            }
          }
          // إذا لم نجد من Location، نبحث عن "Black Market - ..."
          if (!loc) {
            const match = body.match(/Black Market - (Los Angeles|San Francisco)/i);
            if (match) loc = match[1];
          }
          // بحث عام
          if (!loc) {
            if (body.includes('Los Angeles')) loc = 'Los Angeles';
            else if (body.includes('San Francisco')) loc = 'San Francisco';
          }

          // كولداون
          const cdMatch = body.match(/You cannot travel for:?\s*([0-9hms ]+)/i) || body.match(/Travel in\s*([0-9hms ]+)/i);
          if (cdMatch) cooldownStr = cdMatch[1];

          // العناصر المحمولة
          let hold = 0;
          let heldItem = null;
          const rows = [...document.querySelectorAll('tr')];

          for (const r of rows) {
            const rText = r.innerText;
            if (rText.includes('Sell') && !rText.includes('Confirm')) {
              for (const it of items) {
                if (rText.toLowerCase().includes(it.toLowerCase())) {
                  const cells = [...r.querySelectorAll('td')];
                  if (cells.length >= 3) {
                    const youHaveCell = cells[2].innerText;
                    const matchNum = youHaveCell.match(/(\d+)/);
                    if (matchNum && +matchNum[1] > 0) {
                      heldItem = it;
                      hold = +matchNum[1];
                      break;
                    }
                  }
                  break;
                }
              }
            }
          }

          if (heldItem === null) {
            const m = body.match(/holding (\d+) items/i);
            hold = m ? +m[1] : 0;
          }

          return { loc, cd: cooldownStr, hold, heldItem };
        }, ITEMS);

        // إذا لم نجد المدينة، نعيد تحميل الصفحة
        if (!state.loc) {
          console.log("⚠️ لم نجد المدينة، نعيد تحميل الصفحة...");
          await page.reload({ waitUntil: 'networkidle2' });
          await sleep(5000);
          continue;
        }

        console.log(`📍 المدينة الحالية: ${state.loc}`);

        // إذا كان هناك كولداون، ننتظر دقيقة
        if (state.cd) {
          console.log(`⏳ كولداون: ${state.cd} - ننتظر دقيقة...`);
          await sleep(60000);
          continue;
        }

        // ---------- استراتيجية التداول ----------
        if (state.loc === "San Francisco") {
          // في سان فرانسيسكو: نبيع Electronics إذا كنا نملكها، وإلا نشتري Anabolic steroid
          if (state.heldItem === "Electronics" && state.hold > 0) {
            console.log("📍 سان فرانسيسكو - بيع الإلكترونيكس");
            await page.evaluate(() => {
              const rows = [...document.querySelectorAll('tr')];
              for (const r of rows) {
                if (r.innerText.includes('Sell All') && !r.innerText.includes('Confirm')) {
                  const btn = [...r.querySelectorAll('button')].find(b => b.innerText.trim() === 'Sell All');
                  if (btn) { btn.click(); break; }
                }
              }
            });
            await sleep(2000);
            await page.waitForFunction(() => document.body.innerText.includes('Confirm Sell All'), { timeout: 5000 }).catch(() => {});
            await page.evaluate(() => {
              const allBtns = [...document.querySelectorAll('button')];
              const confirmBtn = allBtns.find(b => b.innerText.trim() === 'SELL ALL' && b.offsetParent !== null);
              if (confirmBtn) confirmBtn.click();
            });
            await sleep(3000);
            continue;
          }

          if (state.hold === 0) {
            console.log("📍 سان فرانسيسكو - شراء أنابوليك سترويدز");
            await page.evaluate(() => {
              const rows = [...document.querySelectorAll('tr')];
              for (const r of rows) {
                if (r.innerText.includes('Anabolic steroid') && r.innerText.includes('£')) {
                  const mb = [...r.querySelectorAll('button')].find(b => b.innerText.includes('Max Buy'));
                  if (mb) { mb.click(); break; }
                }
              }
            });
            await sleep(1000);
            await page.evaluate(() => {
              const btn = [...document.querySelectorAll('button')].find(b => b.innerText.trim() === 'BUY MAX');
              if (btn) btn.click();
            });
            await sleep(3000);
            continue;
          }

          if (state.heldItem === "Anabolic steroid" && state.hold > 0) {
            console.log("📍 سان فرانسيسكو → رايح لوس أنجلوس");
            await page.goto('https://www.project-dark.co.uk/travel', { waitUntil: 'networkidle2' });
            await sleep(2500);
            // نتحقق من كولداون السفر
            const travelCd = await page.evaluate(() => {
              const body = document.body.innerText;
              const cdMatch = body.match(/You cannot travel for:?\s*([0-9hms ]+)/i) || body.match(/Travel in\s*([0-9hms ]+)/i);
              return cdMatch ? cdMatch[1] : null;
            });
            if (travelCd) {
              console.log(`⏳ كولداون سفر: ${travelCd} - ننتظر دقيقة...`);
              await sleep(60000);
              continue;
            }
            // تنفيذ السفر (نفس الخطوات السابقة)
            await page.evaluate(() => {
              const grid = [...document.querySelectorAll('a, span, div, button')]
                .find(el => el.innerText.trim() === 'Grid View' && el.offsetParent !== null);
              if (grid) grid.click();
            });
            await sleep(1500);
            await page.evaluate(() => {
              const cards = [...document.querySelectorAll('div')];
              const target = cards.find(el => el.innerText.trim() === 'LOS ANGELES' && el.offsetWidth > 150 && el.offsetHeight > 50);
              if (target) target.click();
            });
            await sleep(1500);
            await page.evaluate(() => {
              const btn = [...document.querySelectorAll('button')].find(b => b.innerText.includes('Travel to Selected Location'));
              if (btn) btn.click();
            });
            await sleep(1500);
            await page.waitForFunction(() => document.body.innerText.includes('Are you sure'), { timeout: 15000 }).catch(() => {});
            await page.evaluate(() => {
              const allBtns = [...document.querySelectorAll('button')];
              const travelBtn = allBtns.find(b => b.innerText.trim() === 'TRAVEL');
              if (travelBtn) travelBtn.click();
            });
            await sleep(5000);
            const verify = await page.evaluate(() => document.body.innerText.includes('Black Market - Los Angeles') || document.body.innerText.includes('Los Angeles'));
            if (verify) console.log("🎉 وصلنا لوس أنجلوس!");
            else {
              console.log("⚠️ مشكلة، نرجع للسوق");
              await page.goto('https://www.project-dark.co.uk/blackmarket', { waitUntil: 'networkidle2' });
            }
            continue;
          }
        } else if (state.loc === "Los Angeles") {
          // في لوس أنجلوس: نبيع Anabolic steroid إذا كنا نملكها، وإلا نشتري Electronics
          if (state.heldItem === "Anabolic steroid" && state.hold > 0) {
            console.log("📍 لوس أنجلوس - بيع الأنابوليك");
            await page.evaluate(() => {
              const rows = [...document.querySelectorAll('tr')];
              for (const r of rows) {
                if (r.innerText.includes('Anabolic steroid') && r.innerText.includes('Sell All') && !r.innerText.includes('Confirm')) {
                  const btn = [...r.querySelectorAll('button')].find(b => b.innerText.trim() === 'Sell All');
                  if (btn) { btn.click(); break; }
                }
              }
            });
            await sleep(2000);
            await page.waitForFunction(() => document.body.innerText.includes('Confirm Sell All'), { timeout: 5000 }).catch(() => {});
            await page.evaluate(() => {
              const allBtns = [...document.querySelectorAll('button')];
              const confirmBtn = allBtns.find(b => b.innerText.trim() === 'SELL ALL' && b.offsetParent !== null);
              if (confirmBtn) confirmBtn.click();
            });
            await sleep(3000);
            continue;
          }

          if (state.hold === 0) {
            console.log("📍 لوس أنجلوس - شراء إلكترونيكس");
            await page.evaluate(() => {
              const rows = [...document.querySelectorAll('tr')];
              for (const r of rows) {
                if (r.innerText.includes('Electronics') && r.innerText.includes('£')) {
                  const mb = [...r.querySelectorAll('button')].find(b => b.innerText.includes('Max Buy'));
                  if (mb) { mb.click(); break; }
                }
              }
            });
            await sleep(1000);
            await page.evaluate(() => {
              const btn = [...document.querySelectorAll('button')].find(b => b.innerText.trim() === 'BUY MAX');
              if (btn) btn.click();
            });
            await sleep(3000);
            continue;
          }

          if (state.heldItem === "Electronics" && state.hold > 0) {
            console.log("📍 لوس أنجلوس → رايح سان فرانسيسكو");
            await page.goto('https://www.project-dark.co.uk/travel', { waitUntil: 'networkidle2' });
            await sleep(2500);
            const travelCd = await page.evaluate(() => {
              const body = document.body.innerText;
              const cdMatch = body.match(/You cannot travel for:?\s*([0-9hms ]+)/i) || body.match(/Travel in\s*([0-9hms ]+)/i);
              return cdMatch ? cdMatch[1] : null;
            });
            if (travelCd) {
              console.log(`⏳ كولداون سفر: ${travelCd} - ننتظر دقيقة...`);
              await sleep(60000);
              continue;
            }
            await page.evaluate(() => {
              const grid = [...document.querySelectorAll('a, span, div, button')]
                .find(el => el.innerText.trim() === 'Grid View' && el.offsetParent !== null);
              if (grid) grid.click();
            });
            await sleep(1500);
            await page.evaluate(() => {
              const cards = [...document.querySelectorAll('div')];
              const target = cards.find(el => el.innerText.trim() === 'SAN FRANCISCO' && el.offsetWidth > 150 && el.offsetHeight > 50);
              if (target) target.click();
            });
            await sleep(1500);
            await page.evaluate(() => {
              const btn = [...document.querySelectorAll('button')].find(b => b.innerText.includes('Travel to Selected Location'));
              if (btn) btn.click();
            });
            await sleep(1500);
            await page.waitForFunction(() => document.body.innerText.includes('Are you sure'), { timeout: 15000 }).catch(() => {});
            await page.evaluate(() => {
              const allBtns = [...document.querySelectorAll('button')];
              const travelBtn = allBtns.find(b => b.innerText.trim() === 'TRAVEL');
              if (travelBtn) travelBtn.click();
            });
            await sleep(5000);
            const verify = await page.evaluate(() => document.body.innerText.includes('Black Market - San Francisco') || document.body.innerText.includes('San Francisco'));
            if (verify) console.log("🎉 وصلنا سان فرانسيسكو!");
            else {
              console.log("⚠️ مشكلة، نرجع للسوق");
              await page.goto('https://www.project-dark.co.uk/blackmarket', { waitUntil: 'networkidle2' });
            }
            continue;
          }
        } else {
          console.log("⚠️ مدينة غير معروفة، نعيد المحاولة...");
          await sleep(5000);
          continue;
        }

        // نهاية الدورة
        await sleep(10000);
      } catch (e) {
        console.log("⚠️ خطأ مؤقت، نعيد المحاولة:", e.message);
        await sleep(15000);
      }
    }

  } catch (e) {
    console.log("❌ فشل في الدخول:", e.message);
    await page.screenshot({ path: 'error.png' });
    await browser.close();
  }
})();
