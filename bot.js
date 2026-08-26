const puppeteer = require('puppeteer');

// =================================================
// بيانات الدخول (عدلها)
// =================================================
const LOGIN = {
  username: 'amr.aly.2226@gmail.com',
  password: 'Gun@12345'
};

const CONFIG = {
  FROM: 'Tokyo',      // المدينة اللي هتبدأ منها
  TO: 'Cairo',        // المدينة اللي هتروحها
  ITEM: 'Alcohol'     // السلعة المطلوبة
};

// =================================================

let state = { step: 'buy', failCount: 0, running: true };
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// ===== دالة للبحث عن السلعة في الجدول =====
async function findItemRow(page, itemName) {
  return await page.evaluate((item) => {
    const rows = document.querySelectorAll('tr');
    for (const row of rows) {
      const text = row.innerText.toLowerCase();
      if (text.includes(item.toLowerCase()) && text.includes('£')) {
        return row;
      }
    }
    return null;
  }, itemName);
}

// ===== دالة للضغط على Max Buy =====
async function clickMaxBuy(page, itemName) {
  return await page.evaluate((item) => {
    const rows = document.querySelectorAll('tr');
    for (const row of rows) {
      if (row.innerText.toLowerCase().includes(item.toLowerCase()) && row.innerText.includes('£')) {
        // جرب كل الأزرار الممكنة
        const btns = row.querySelectorAll('button');
        for (const btn of btns) {
          const text = btn.innerText.trim().toUpperCase();
          if (text.includes('MAX BUY') || text.includes('BUY MAX') || text.includes('MAX')) {
            btn.click();
            return true;
          }
        }
      }
    }
    return false;
  }, itemName);
}

(async () => {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  console.log('🚀 Bot Starting...');

  // ===== تسجيل الدخول =====
  try {
    console.log('🔐 جاري تسجيل الدخول...');
    await page.goto('https://www.project-dark.co.uk/login', { waitUntil: 'networkidle2' });
    await page.type('input[name="username"]', LOGIN.username);
    await page.type('input[name="password"]', LOGIN.password);
    await page.click('button[type="submit"]');
    await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 10000 });
    console.log('✅ تم تسجيل الدخول!');
  } catch (err) {
    console.log('⚠️ ممكن تكون مسجل قبل كده، هكمل...');
  }

  await page.goto('https://www.project-dark.co.uk/blackmarket', { waitUntil: 'networkidle2' });
  
  // ===== الحلقة الرئيسية =====
  while (state.running) {
    try {
      await page.waitForSelector('body', { timeout: 5000 });
      
      // جلب بيانات الصفحة
      const pageData = await page.evaluate(() => {
        const bodyText = document.body.innerText;
        const holdMatch = bodyText.match(/holding (\d+) items/i);
        const holding = holdMatch ? parseInt(holdMatch[1]) : 0;
        
        let city = null;
        const cityMatch = bodyText.match(/Black Market - ([A-Za-z ]+)/i);
        if (cityMatch) city = cityMatch[1].trim();
        else {
          const travelMatch = bodyText.match(/You have traveled to ([A-Za-z ]+)!/i);
          if (travelMatch) city = travelMatch[1].trim();
        }
        
        let heldItem = null;
        const rows = document.querySelectorAll('tr');
        const items = ["Anabolic steroid","Artifacts","Alcohol","Electronics","Plastic jewelry","Stolen paintings","Human beings","Confidential documents","Endangered exotic animals","Organs"];
        for (const row of rows) {
          if (row.innerHTML.includes('Sell All') && !row.innerText.includes('Confirm Sell All')) {
            const txt = row.innerText.toLowerCase();
            for (const it of items) {
              if (txt.includes(it.toLowerCase())) { heldItem = it; break; }
            }
            if (!heldItem && row.cells[0]) heldItem = row.cells[0].innerText.trim();
            break;
          }
        }
        
        const cdMatch = bodyText.match(/You cannot travel for:?\s*([0-9hms ]+)/i);
        let cd = cdMatch ? cdMatch[1].trim() : null;
        
        return { holding, city, heldItem, cd, bodyText };
      });
      
      const { holding, heldItem, cd, city } = pageData;
      const targetItem = CONFIG.ITEM;
      const targetTo = CONFIG.TO;
      
      // ===== كولداون =====
      if (cd) {
        console.log(`⏳ كولداون: ${cd}`);
        await delay(15000);
        continue;
      }
      
      // ===== Step: buy =====
      if (state.step === 'buy') {
        // تأكد إننا في السوق
        if (!page.url().includes('blackmarket')) {
          console.log('➡️ رايح Blackmarket...');
          await page.goto('https://www.project-dark.co.uk/blackmarket', { waitUntil: 'networkidle2' });
          await delay(2000);
          continue;
        }
        
        // لو في Confirm Sell All مفتوح
        const confirmOpen = await page.evaluate(() => document.body.innerText.includes('Confirm Sell All'));
        if (confirmOpen) {
          const btn = await page.$('button:has-text("SELL ALL")');
          if (btn) { console.log('🔴 بدوس SELL ALL تأكيد'); await btn.click(); await delay(2000); }
          continue;
        }
        
        // لو معايا سلعة غلط → ابيعها
        if (holding > 0 && heldItem && heldItem.toLowerCase() !== targetItem.toLowerCase()) {
          console.log(`⚠️ شايل ${heldItem} غلط - هبيعه`);
          await page.evaluate((itemName) => {
            const rows = document.querySelectorAll('tr');
            for (const row of rows) {
              if (row.innerText.toLowerCase().includes(itemName.toLowerCase()) && row.innerHTML.includes('Sell All')) {
                const btn = row.querySelector('button:has-text("Sell All")');
                if (btn) { btn.click(); return true; }
              }
            }
            return false;
          }, heldItem);
          await delay(3000);
          continue;
        }
        
        // لو معايا السلعة الصح → روح سافر
        if (holding > 0 && (!heldItem || heldItem.toLowerCase() === targetItem.toLowerCase())) {
          console.log(`✅ شايل ${holding} ${targetItem} صح - رايح Travel`);
          state.step = 'travel';
          state.failCount = 0;
          await page.goto('https://www.project-dark.co.uk/travel', { waitUntil: 'networkidle2' });
          await delay(2000);
          continue;
        }
        
        // ===== محاولة الشراء =====
        // 1. نتأكد إن السلعة موجودة
        const itemRow = await findItemRow(page, targetItem);
        if (!itemRow) {
          console.log(`❌ السلعة ${targetItem} مش موجودة في سوق ${city || 'الحالي'}`);
          state.failCount++;
          if (state.failCount >= 3) {
            console.log(`🛑 توقف: السلعة مش موجودة بعد 3 محاولات. غير السلعة أو المدينة.`);
            state.running = false;
            break;
          }
          await delay(8000);
          continue;
        }
        
        // 2. نحاول نضغط Max Buy
        console.log(`🛒 بجيب ${targetItem}...`);
        const clicked = await clickMaxBuy(page, targetItem);
        
        if (!clicked) {
          console.log(`⚠️ مش لاقي زر Max Buy للسلعة ${targetItem}`);
          state.failCount++;
          await delay(5000);
          continue;
        }
        
        // 3. نضغط BUY MAX (التأكيد)
        await delay(1500);
        const confirmBuy = await page.$('button:has-text("BUY MAX")');
        if (confirmBuy) {
          await confirmBuy.click();
          console.log(`✅ اشتريت ${targetItem}`);
          state.step = 'travel';
          state.failCount = 0;
          await delay(2000);
          await page.goto('https://www.project-dark.co.uk/travel', { waitUntil: 'networkidle2' });
        } else {
          console.log('⚠️ زر BUY MAX مش ظاهر، يمكن السلعة مش قابلة للشراء');
          state.failCount++;
          await delay(5000);
        }
        
      } 
      // ===== Step: travel =====
      else if (state.step === 'travel') {
        if (!page.url().includes('travel')) {
          await page.goto('https://www.project-dark.co.uk/travel', { waitUntil: 'networkidle2' });
          await delay(2000);
          continue;
        }
        
        console.log(`✈️ بسافر لـ ${targetTo}...`);
        const cityClicked = await page.evaluate((cityName) => {
          const elements = document.querySelectorAll('*');
          for (const el of elements) {
            if (el.innerText?.trim()?.toUpperCase() === cityName.toUpperCase() && el.offsetParent !== null && el.children.length === 0) {
              let parent = el.parentElement;
              for (let i=0; i<3; i++) {
                if (parent && parent.offsetWidth > 150) break;
                parent = parent.parentElement;
              }
              if (parent) { parent.click(); return true; }
            }
          }
          return false;
        }, targetTo);
        
        if (!cityClicked) {
          console.log(`❌ مش لاقي مدينة ${targetTo}`);
          await delay(5000);
          continue;
        }
        
        await delay(1500);
        const travelBtn = await page.$('button:has-text("Travel to Selected Location")');
        if (travelBtn) {
          await travelBtn.click();
          await delay(1500);
          const confirmTravel = await page.$('button:has-text("TRAVEL")');
          if (confirmTravel) {
            await confirmTravel.click();
            console.log(`✅ وصلت ${targetTo}`);
            state.step = 'buy';
            state.failCount = 0;
            await delay(3000);
            await page.goto('https://www.project-dark.co.uk/blackmarket', { waitUntil: 'networkidle2' });
          }
        }
      }
      
      await delay(3000);
      
    } catch (err) {
      console.error('⚠️ خطأ:', err.message);
      await delay(5000);
      await page.reload({ waitUntil: 'networkidle2' });
    }
  }
  
  console.log('🛑 البوت توقف.');
  // browser.close();
})();
