const puppeteer = require('puppeteer');

const USERNAME = 'amr.aly.2226@gmail.com';
const PASSWORD = 'Gun@12345';

const ITEMS = ["Anabolic steroid","Artifacts","Alcohol","Electronics","Plastic jewelry","Stolen paintings","Human beings","Confidential documents","Endangered exotic animals","Organs"];

async function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

(async () => {
  console.log("🚀 البوت شغال...");

  // 🔧 تشغيل المتصفح في وضع غير مخفي لمشاهدة الأحداث
  const browser = await puppeteer.launch({
    headless: false, // عشان نشوف بنفسنا
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });
  page.setDefaultTimeout(60000); // زيادة المهلة

  try {
    console.log("🔐 جاري فتح صفحة الدخول...");
    await page.goto('https://www.project-dark.co.uk/login', { waitUntil: 'networkidle2', timeout: 60000 });

    // انتظار ظهور حقول الإدخال
    await page.waitForSelector('input[type="text"], input[type="email"], input[type="password"]', { timeout: 30000 });

    // 📝 كتابة البيانات
    const inputs = await page.$$('input[type="text"], input[type="email"], input[type="password"]');
    if (inputs.length >= 2) {
      await inputs[0].click({ clickCount: 3 });
      await inputs[0].type(USERNAME);
      await inputs[1].click({ clickCount: 3 });
      await inputs[1].type(PASSWORD);
    }
    console.log("✅ تم كتابة البيانات");

    // 🔍 محاولة إيجاد مربع التحقق (reCAPTCHA أو Cloudflare)
    console.log("⏳ في انتظار ظهور أي تحقق...");
    let verified = false;

    // 1) انتظار ظهور علامة الصح أو مربع الاختيار
    try {
      await page.waitForFunction(() => {
        const body = document.body.innerText;
        if (body.includes('✓') || body.includes('Success!') || body.includes('CLOUDFLARE')) return true;
        // البحث عن checkbox مفعل
        const cb = document.querySelector('input[type="checkbox"]:checked, [role="checkbox"][aria-checked="true"]');
        if (cb && cb.offsetParent !== null) return true;
        return false;
      }, { timeout: 30000 });
      console.log("✅ تم اكتشاف علامة الصح تلقائياً");
      verified = true;
    } catch (e) {
      console.log("⚠️ لم نجد علامة الصح، نحاول النقر على مربع التحقق إن وجد...");
      // محاولة النقر على أي checkbox
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
        console.log("✅ تم النقر على مربع التحقق، ننتظر ثانية...");
        await sleep(2000);
        // نتحقق مرة أخرى
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

    // ⭐ الضغط على Login
    console.log("🔑 جاري الضغط على Login...");
    await page.click('button[type="submit"]').catch(async () => {
      await page.evaluate(() => {
        const btns = [...document.querySelectorAll('button, input[type="submit"]')];
        const loginBtn = btns.find(b => b.innerText?.toLowerCase().includes('login') || b.value?.toLowerCase().includes('login'));
        if (loginBtn) loginBtn.click();
      });
    });
    console.log("✅ تم الضغط على Login");

    // ⏳ انتظار التوجيه إلى البلاك ماركت (أو أي صفحة تالية)
    console.log("⏳ في انتظار التوجيه...");
    await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 30000 }).catch(() => console.log("⚠️ لم يحدث توجيه تلقائي، ننتظر 5 ثوانٍ ثم نكمل"));
    await sleep(5000);

    // 🚀 التوجه يدوياً إلى البلاك ماركت لو مش واصلين
    const currentUrl = page.url();
    if (!currentUrl.includes('blackmarket')) {
      console.log("🚀 جاري التوجه إلى البلاك ماركت يدوياً...");
      await page.goto('https://www.project-dark.co.uk/blackmarket', { waitUntil: 'networkidle2', timeout: 60000 });
    } else {
      console.log("✅ بالفعل في البلاك ماركت");
    }

    // 🔍 محاولة قراءة المدينة من عدة مصادر
    let cityFound = false;
    for (let attempt = 0; attempt < 5; attempt++) {
      const city = await page.evaluate(() => {
        const body = document.body.innerText;
        // من النص
        let match = body.match(/Black Market - (Los Angeles|San Francisco)/i);
        if (match) return match[1];
        let locMatch = body.match(/Location\s*\n\s*(Los Angeles|San Francisco)/i);
        if (locMatch) return locMatch[1];
        if (body.includes('Los Angeles')) return 'Los Angeles';
        if (body.includes('San Francisco')) return 'San Francisco';
        // من العنوان (URL)
        const url = window.location.href;
        if (url.includes('los-angeles')) return 'Los Angeles';
        if (url.includes('san-francisco')) return 'San Francisco';
        return null;
      });

      if (city) {
        console.log(`✅ المدينة الحالية: ${city}`);
        cityFound = true;
        break;
      } else {
        console.log(`⚠️ لم نجد المدينة في المحاولة ${attempt + 1}، ننتظر قليلاً...`);
        await sleep(3000);
        await page.reload({ waitUntil: 'networkidle2' });
      }
    }

    if (!cityFound) {
      console.log("❌ فشل في العثور على المدينة حتى بعد عدة محاولات.");
      // 🖼️ نلتقط سكرين شوت عشان نشوف الوضع
      await page.screenshot({ path: 'debug_login_fail.png' });
      console.log("📸 تم حفظ سكرين شوت كـ debug_login_fail.png");
      console.log(`🌐 الرابط الحالي: ${page.url()}`);
      // ننتظر قليلاً يدوياً عشان نقدر نتدخل
      console.log("⏳ انتظر 30 ثانية للمعاينة اليدوية ثم أغلق المتصفح...");
      await sleep(30000);
      await browser.close();
      return;
    }

    // ========== باقي السكربت (التداول والسفر) ==========
    // هنا نضع نفس الكود السابق للتداول لكن مع تحسينات طفيفة
    // ... (نفس الكود)

    // سأضع باقي الكود ولكن لتوفير المساحة، سأشير إلى أنه مكمل
    // استخدم نفس الكود السابق من while(true) إلى النهاية

  } catch (e) {
    console.log("⚠️ مشكلة في الدخول:", e.message);
    await page.screenshot({ path: 'error_screenshot.png' });
    console.log("📸 تم حفظ سكرين شوت للخطأ");
    await browser.close();
  }
})();
