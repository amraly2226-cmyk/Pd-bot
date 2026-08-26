const puppeteer = require('puppeteer');

// ⚠️ مهم جدًا: حط هنا الكوكيز الخاصة بحسابك من المتصفح
// (افتح اللعبة على جوجل كروم، افحص -> Application -> Cookies وانسخ قيمها هنا)
const cookies = [
    { name: 'PHPSESSID', value: 'حط_قيمة_الكوكي_هنا', domain: '.project-dark.co.uk' }
];

(async () => {
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage();
  
  await page.setCookie(...cookies);
  await page.goto('https://www.project-dark.co.uk/blackmarket', { waitUntil: 'networkidle2' });
  
  console.log("✅ البوت اشتغل في الخلفية!");

  // اللوب الرئيسي (خليه ينتظر 5 ثواني بين كل عملية عشان ميحاولش يحرق السيرفر)
  setInterval(async () => {
    try {
        // الكود بتاعك الأصلي (المتعلق بـ buy و travel) لازم تتحول عشان تشتغل هنا
        // عن طريق استخدام page.evaluate()
        
        // مثال لقراءة النص:
        const text = await page.evaluate(() => document.body.innerText);
        console.log("قرأت الصفحة:", text.substring(0, 100));

        // وهكذا تكمل بقية الأكواد (الشراء، البيع، السفر) باستخدام page.evaluate
    } catch (e) {
        console.log("حصل خطأ:", e.message);
    }
  }, 5000); 
})();
