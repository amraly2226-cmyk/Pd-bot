const puppeteer = require('puppeteer');

// ===== إعدادات تليجرام (تم التعديل ببياناتك) =====
const TELEGRAM_BOT_TOKEN = '8976364574:AExVRNcJgLrGKrwWavI3gLfBk6C-RDAirM';
const TELEGRAM_CHAT_ID = '7310333338';

// ===== إعدادات اللعبة =====
const USERNAME = 'amr.aly.2226@gmail.com';
const PASSWORD = 'Gun@12345';
const COOKIE_VALUE = process.env.PD_COOKIE || '';

const ITEMS = ["Anabolic steroid","Artifacts","Alcohol","Electronics","Plastic jewelry","Stolen paintings","Human beings","Confidential documents","Endangered exotic animals","Organs"];

// ===== دالة إرسال لتليجرام =====
async function sendTelegram(message) {
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) return;
  try {
    const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text: `🤖 بوت Project Dark:\n${message}`,
        parse_mode: 'HTML'
      })
    });
  } catch (err) {
    console.log('⚠️ فشل إرسال رسالة لتليجرام:', err.message);
  }
}

// ===== أدوات مساعدة =====
function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

function parseCooldown(cdString) {
  if (!cdString) return 0;
  let totalSeconds = 0;
  const parts = cdString.match(/(\d+)\s*([hms])/g);
  if (!parts) return 0;
  for (const part of parts) {
    const val = parseInt(part);
    if (part.includes('h')) totalSeconds += val * 3600;
    else if (part.includes('m')) totalSeconds += val * 60;
    else if (part.includes('s')) totalSeconds += val;
  }
  return totalSeconds * 1000;
}

async function travelTo(page, destination) {
  console.log(`✈️ محاولة السفر إلى ${destination}...`);
  await sendTelegram(`✈️ جاري السفر إلى <b>${destination}</b>`);
  try {
    if (!page.url().includes('travel')) {
      await page.goto('https://www.project-dark.co.uk/travel', { waitUntil: 'networkidle0', timeout: 30000 });
    }
    const gridViewBtn = await page.waitForXPath("//*[contains(text(),'Grid View')]", { timeout: 5000 });
    await gridViewBtn.click();
    await sleep(1000);

    let searchText = destination.replace('.', '').toUpperCase();
    const cityCard = await page.waitForXPath(`//*[contains(text(),'${searchText}')]`, { timeout: 5000 });
    await cityCard.click();
    await sleep(1000);

    const travelBtn = await page.waitForXPath("//button[contains(text(),'Travel to Selected Location')]", { timeout: 5000 });
    await travelBtn.click();

    const confirmTravelBtn = await page.waitForXPath("//button[contains(text(),'TRAVEL')]", { timeout: 15000 });
    await confirmTravelBtn.click();

    await page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 30000 });
    console.log(`✅ وصلنا إلى ${destination}`);
    await sendTelegram(`✅ تم الوصول إلى <b>${destination}</b> بنجاح 🎉`);
    return true;
  } catch (err) {
    const errorMsg = `❌ فشل السفر إلى ${destination}: ${err.message}`;
    console.error(errorMsg);
    await sendTelegram(errorMsg);
    await page.goto('https://www.project-dark.co.uk/blackmarket', { waitUntil: 'networkidle0' }).catch(() => {});
    return false;
  }
}

async function sellItem(page, itemName) {
  try {
    const sellBtn = await page.waitForXPath(`//tr[contains(., '${itemName}')]//button[contains(text(), 'Sell All')]`, { timeout: 10000 });
    await sellBtn.click();
    const confirmBtn = await page.waitForXPath("//button[contains(text(), 'SELL ALL')]", { timeout: 5000 });
    await confirmBtn.click();
    await sleep(3000);
    console.log(`💰 تم بيع ${itemName}`);
    await sendTelegram(`💰 تم بيع <b>${itemName}</b> بنجاح`);
    return true;
  } catch (err) {
    const errorMsg = `❌ فشل بيع ${itemName}: ${err.message}`;
    console.error(errorMsg);
    await sendTelegram(errorMsg);
    return false;
  }
}

async function buyItem(page, itemName) {
  try {
    const maxBuyBtn = await page.waitForXPath(`//tr[contains(., '${itemName}')]//button[contains(text(), 'Max Buy')]`, { timeout: 10000 });
    await maxBuyBtn.click();
    await sleep(500);
    const buyBtn = await page.waitForXPath("//button[contains(text(), 'BUY MAX')]", { timeout: 5000 });
    await buyBtn.click();
    await sleep(3000);
    console.log(`🛒 تم شراء ${itemName}`);
    await sendTelegram(`🛒 تم شراء <b>${itemName}</b> بنجاح`);
    return true;
  } catch (err) {
    const errorMsg = `❌ فشل شراء ${itemName}: ${err.message}`;
    console.error(errorMsg);
    await sendTelegram(errorMsg);
    return false;
  }
}

async function getState(page) {
  return await page.evaluate((items) => {
    const bodyText = document.body.innerText;
    let location = null;

    const locMatch = bodyText.match(/Location\s*\n\s*(St\.?\s*Louis|Washington)/i);
    if (locMatch) {
      const found = locMatch[1].toLowerCase();
      if (found.includes('st. louis') || found.includes('st louis')) location = 'St. Louis';
      else if (found.includes('washington')) location = 'Washington';
    } else {
      const lowerText = bodyText.toLowerCase();
      if (lowerText.includes('black market - washington')) location = 'Washington';
      else if (lowerText.includes('black market - st louis')) location = 'St. Louis';
    }

    let cooldownStr = null;
    const cdMatch = bodyText.match(/You cannot travel for:?\s*([0-9hms ]+)/i) || bodyText.match(/Travel in\s*([0-9hms ]+)/i);
    if (cdMatch) cooldownStr = cdMatch[1].trim();

    let heldItem = null;
    let holdCount = 0;
    const rows = document.querySelectorAll('tr');
    for (const row of rows) {
      const rowText = row.innerText;
      if (rowText.includes('Confirm')) continue;
      for (const item of items) {
        if (rowText.toLowerCase().includes(item.toLowerCase()) && rowText.includes('Sell')) {
          const cells = row.querySelectorAll('td');
          if (cells.length >= 3) {
            const cellText = cells[2].innerText;
            const match = cellText.match(/(\d+)/);
            if (match) {
              heldItem = item;
              holdCount = parseInt(match[1]);
              break;
            }
          }
        }
      }
      if (heldItem) break;
    }

    if (!heldItem) {
      const holdMatch = bodyText.match(/holding (\d+) items/i);
      if (holdMatch) holdCount = parseInt(holdMatch[1]);
    }

    return { location, cooldown: cooldownStr, heldItem, holdCount };
  }, ITEMS);
}

// ===== الوظيفة الرئيسية =====
(async () => {
  console.log("🚀 بوت Project Dark يبدأ العمل...");
  await sendTelegram("🚀 <b>بوت Project Dark بدأ شغله</b>");

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu'],
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });
  page.setDefaultTimeout(20000);

  // ===== التقاط رسائل الكونسول وإرسال الأخطاء =====
  page.on('console', msg => {
    const type = msg.type();
    const text = msg.text();
    console.log(`📢 [Console] ${type.toUpperCase()}: ${text}`);
    if (type === 'error' || type === 'warning') {
      sendTelegram(`⚠️ [${type.toUpperCase()}] ${text}`);
    }
  });

  page.on('pageerror', async (err) => {
    console.error(`❌ [Page Error] ${err.message}`);
    await sendTelegram(`❌ خطأ في الصفحة: ${err.message}`);
  });

  page.on('error', async (err) => {
    console.error(`❌ [Browser Error] ${err.message}`);
    await sendTelegram(`❌ خطأ في المتصفح: ${err.message}`);
  });

  try {
    if (COOKIE_VALUE) {
      await page.setCookie({ name: 'project-dark-session', value: COOKIE_VALUE, domain: '.project-dark.co.uk' });
      await page.goto('https://www.project-dark.co.uk/blackmarket', { waitUntil: 'networkidle0', timeout: 60000 });
      console.log("✅ تم الدخول بواسطة الكوكيز");
      await sendTelegram("✅ تم الدخول بواسطة الكوكيز");
    } else {
      await page.goto('https://www.project-dark.co.uk/login', { waitUntil: 'networkidle0', timeout: 60000 });
      const emailInput = await page.waitForSelector('input[type="email"], input[type="text"]', { timeout: 10000 });
      const passInput = await page.waitForSelector('input[type="password"]', { timeout: 10000 });
      await emailInput.type(USERNAME);
      await passInput.type(PASSWORD);
      const loginBtn = await page.waitForSelector('button[type="submit"]', { timeout: 5000 });
      await loginBtn.click();
      await page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 30000 });
      console.log("✅ تم تسجيل الدخول بنجاح");
      await sendTelegram("✅ تم تسجيل الدخول بنجاح");
      const cookies = await page.cookies();
      const sessionCookie = cookies.find(c => c.name === 'project-dark-session');
      if (sessionCookie) {
        console.log(`🍪 تم حفظ الكوكيز`);
      }
    }
  } catch (err) {
    const errorMsg = `❌ فشل في تسجيل الدخول: ${err.message}`;
    console.error(errorMsg);
    await sendTelegram(errorMsg);
    await browser.close();
    process.exit(1);
  }

  let retryCount = 0;
  const MAX_RETRIES = 5;

  while (true) {
    try {
      const currentUrl = page.url();
      if (!currentUrl.includes('blackmarket') && !currentUrl.includes('travel')) {
        await page.goto('https://www.project-dark.co.uk/blackmarket', { waitUntil: 'networkidle0', timeout: 30000 });
        await sleep(2000);
        continue;
      }

      if (currentUrl.includes('travel')) {
        const state = await getState(page);
        if (!state.location) {
          await page.goto('https://www.project-dark.co.uk/blackmarket', { waitUntil: 'networkidle0' });
          continue;
        }
        const dest = (state.location === 'St. Louis') ? 'Washington' : 'St. Louis';
        await travelTo(page, dest);
        continue;
      }

      const state = await getState(page);
      console.log(`📊 الحالة: المدينة=${state.location}, الكولداون="${state.cooldown}", يحمل=${state.holdCount}`);
      
      if (state.cooldown) {
        const cdMs = parseCooldown(state.cooldown);
        if (cdMs > 60000) {
          await sendTelegram(`⏳ كولداون طويل: ${state.cooldown} (هأنتظر)`);
        }
        if (cdMs > 5000) {
          console.log(`⏳ كولداون: ${state.cooldown} - انتظار...`);
          await sleep(cdMs + 5000);
          continue;
        } else if (cdMs > 0) {
          await sleep(cdMs + 2000);
          continue;
        }
      }

      // ===== سانت لويس =====
      if (state.location === 'St. Louis') {
        if (state.heldItem === 'Electronics' && state.holdCount > 0) {
          await sellItem(page, 'Electronics');
          continue;
        }
        if (state.holdCount === 0) {
          await buyItem(page, 'Anabolic steroid');
          continue;
        }
        if (state.heldItem === 'Anabolic steroid' && state.holdCount > 0) {
          console.log('🔄 رايح واشنطن');
          await page.goto('https://www.project-dark.co.uk/travel', { waitUntil: 'networkidle0' });
          await sleep(2000);
          continue;
        }
        console.warn('⚠️ حالة غير متوقعة في St. Louis');
        await sleep(5000);
        continue;
      }

      // ===== واشنطن =====
      if (state.location === 'Washington') {
        if (state.heldItem === 'Anabolic steroid' && state.holdCount > 0) {
          await sellItem(page, 'Anabolic steroid');
          continue;
        }
        if (state.holdCount === 0) {
          await buyItem(page, 'Electronics');
          continue;
        }
        if (state.heldItem === 'Electronics' && state.holdCount > 0) {
          console.log('🔄 رايح سانت لويس');
          await page.goto('https://www.project-dark.co.uk/travel', { waitUntil: 'networkidle0' });
          await sleep(2000);
          continue;
        }
        console.warn('⚠️ حالة غير متوقعة في Washington');
        await sleep(5000);
        continue;
      }

      console.warn('⚠️ مش لاقي المدينة');
      await page.goto('https://www.project-dark.co.uk/blackmarket', { waitUntil: 'networkidle0' });
      await sleep(3000);

    } catch (err) {
      const errorMsg = `❌ خطأ في الحلقة الرئيسية: ${err.message}`;
      console.error(errorMsg);
      await sendTelegram(errorMsg);
      retryCount++;
      if (retryCount > MAX_RETRIES) {
        await sendTelegram("⚠️ أعادت التشغيل بعد 5 محاولات فاشلة");
        await page.reload({ waitUntil: 'networkidle0' });
        retryCount = 0;
      } else {
        await sleep(15000);
      }
    }
    await sleep(3000);
  }
})();
