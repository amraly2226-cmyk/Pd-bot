const puppeteer = require('puppeteer');

// =================================================
// ⚠️ هات بيانات الدخول بتاعتك من هنا (عدلها)
// =================================================
const LOGIN = {
  username: 'إسم_المستخدم_بتاعك',
  password: 'كلمة_السر_بتاعتك'
};

const CONFIG = {
  FROM: 'Tokyo',
  TO: 'Cairo',
  ITEM: 'Electronics'
};
// =================================================

let state = { step: 'buy', isSelling: false, running: true };
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

(async () => {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  console.log('🚀 Bot Starting...');

  // ===== 1. تسجيل الدخول التلقائي =====
  try {
    console.log('🔐 جاري تسجيل الدخول...');
    await page.goto('https://www.project-dark.co.uk/login', { waitUntil: 'networkidle2' });
    
    // كتابة اليوزر والباس
    await page.type('input[name="username"]', LOGIN.username); // غير الـ selector لو مختلف
    await page.type('input[name="password"]', LOGIN.password);
    
    // دوس زر Login
    await page.click('button[type="submit"]');
    await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 10000 });
    
    console.log('✅ تم تسجيل الدخول بنجاح!');
  } catch (err) {
    console.log('⚠️ ممكن تكون مسجل دخول قبل كده أو في مشكلة في الـ selectors، هكمل عادي...');
  }

  // ===== 2. روح للسوق مباشرة =====
  await page.goto('https://www.project-dark.co.uk/blackmarket', { waitUntil: 'networkidle2' });
  
  // ===== 3. الحلقة الرئيسية (نفس المنطق القديم) =====
  while (state.running) {
    try {
      await page.waitForSelector('body', { timeout: 5000 });
      
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
        
        return { holding, city, heldItem, cd };
      });
      
      const { holding, heldItem, cd } = pageData;
      const targetItem = CONFIG.ITEM;
      const targetTo = CONFIG.TO;
      
      if (cd) {
        console.log(`⏳ كولداون: ${cd}`);
        await delay(15000);
        continue;
      }
      
      // ---------- منطق الشراء ----------
      if (state.step === 'buy') {
        const currentUrl = page.url();
        if (!currentUrl.includes('blackmarket')) {
          console.log('➡️ رايح Blackmarket...');
          await page.goto('https://www.project-dark.co.uk/blackmarket', { waitUntil: 'networkidle2' });
          await delay(2000);
          continue;
        }
        
        const confirmOpen = await page.evaluate(() => document.body.innerText.includes('Confirm Sell All'));
        if (confirmOpen) {
          const btn = await page.$('button:has-text("SELL ALL")');
          if (btn) { console.log('🔴 بدوس SELL ALL تأكيد'); await btn.click(); await delay(2000); }
          continue;
        }
        
        if (holding > 0 && heldItem && heldItem.toLowerCase() !== targetItem.toLowerCase()) {
          console.log(`⚠️ شايل ${heldItem} غلط - هبيعه`);
          const sellBtn = await page.evaluate((itemName) => {
            const rows = document.querySelectorAll('tr');
            for (const row of rows) {
              if (row.innerText.toLowerCase().includes(itemName.toLowerCase()) && row.innerHTML.includes('Sell All')) {
                const btn = row.querySelector('button:has-text("Sell All")');
                if (btn) { btn.click(); return true; }
              }
            }
            return false;
          }, heldItem);
          if (sellBtn) await delay(3000);
          continue;
        }
        
        if (holding > 0 && (!heldItem || heldItem.toLowerCase() === targetItem.toLowerCase())) {
          console.log(`✅ شايل ${holding} ${targetItem} صح - رايح Travel`);
          state.step = 'travel';
          await page.goto('https://www.project-dark.co.uk/travel', { waitUntil: 'networkidle2' });
          await delay(2000);
          continue;
        }
        
        console.log(`🛒 بجيب ${targetItem}...`);
        const bought = await page.evaluate((itemName) => {
          const rows = document.querySelectorAll('tr');
          for (const row of rows) {
            if (row.innerText.toLowerCase().includes(itemName.toLowerCase()) && row.innerText.includes('£')) {
              const btn = row.querySelector('button:has-text("Max Buy")');
              if (btn) { btn.click(); return true; }
            }
          }
          return false;
        }, targetItem);
        
        if (bought) {
          await delay(1500);
          const confirmBuy = await page.$('button:has-text("BUY MAX")');
          if (confirmBuy) {
            await confirmBuy.click();
            console.log(`✅ اشتريت ${targetItem}`);
            state.step = 'travel';
            await delay(2000);
            await page.goto('https://www.project-dark.co.uk/travel', { waitUntil: 'networkidle2' });
          }
        } else {
          console.log(`❌ مش لاقي ${targetItem}`);
          await delay(5000);
        }
      } 
      // ---------- منطق السفر ----------
      else if (state.step === 'travel') {
        const currentUrl = page.url();
        if (!currentUrl.includes('travel')) {
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
        
        if (!cityClicked) { console.log(`❌ مش لاقي ${targetTo}`); await delay(5000); continue; }
        
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
})();
