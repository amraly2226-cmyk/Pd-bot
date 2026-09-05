const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ 
    headless: true, 
    args: ['--no-sandbox', '--disable-setuid-sandbox'] 
  });
  const page = await browser.newPage();

  // قراءة المتغيرات
  const USERNAME = process.env.PD_USER;
  const PASSWORD = process.env.PD_PASS;
  const COOKIE = process.env.PD_COOKIE;

  try {
    // 1. لو في كوكيز محفوظة، استخدمها فوراً
    if (COOKIE) {
        console.log('🍪 تم العثور على كوكيز، جاري تسجيل الدخول بها مباشرة...');
        // الصق الكوكيز (افصل بينهم لو في أكتر من واحد بـ ; )
        const cookies = COOKIE.split(';').map(c => {
            const [name, ...value] = c.trim().split('=');
            return { name: name.trim(), value: value.join('='), domain: 'project-dark.co.uk' };
        }).filter(c => c.name);
        await page.setCookie(...cookies);
        await page.goto('https://project-dark.co.uk/black', { waitUntil: 'domcontentloaded', timeout: 60000 });
    } 
    // 2. لو مفيش كوكيز، ادخل باليوزر والباسورد
    else {
        await page.goto('https://project-dark.co.uk/login', { waitUntil: 'domcontentloaded', timeout: 60000 });
        await page.waitForSelector('input[type="text"], input[name="username"], input[name="email"]', { timeout: 10000 });
        await page.type('input[type="text"], input[name="username"], input[name="email"]', USERNAME);
        
        await page.waitForSelector('input[type="password"]', { timeout: 10000 });
        await page.type('input[type="password"]', PASSWORD);
        
        await page.click('button[type="submit"], input[type="submit"]');
        console.log('🔑 تم الضغط على زر تسجيل الدخول');
        
        // 3. بدل ما نستنى تغيير الرابط، نستنى 5 ثواني (وقت تسجيل الدخول)
        await new Promise(r => setTimeout(r, 5000));
        
        // 4. افتح السوق
        await page.goto('https://project-dark.co.uk/black', { waitUntil: 'domcontentloaded', timeout: 60000 });
    }

    // 5. استنى ظهور كلمة Location (بمدة أطول)
    console.log('⏳ جاري البحث عن المدينة...');
    await page.waitForFunction(() => document.body.innerText.includes('Location'), { timeout: 60000 });
    console.log('✅ تم العثور على كلمة Location');

    // 6. اقرأ المدينة
    const المدينة = await page.evaluate(() => {
        const elements = document.querySelectorAll('*');
        for (let el of elements) {
            if (el.children.length === 0 && el.textContent.trim() === 'Location') {
                const parent = el.parentElement.innerText.split('\n').filter(x => x.trim() !== '');
                return parent[1] || 'غير معروفة';
            }
        }
    });

    console.log('✅ المدينة الحالية هي:', المدينة);

  } catch (error) {
    console.error('❌ حصل خطأ:', error.message);
    console.log('🔍 محتوى الصفحة:');
    console.log(await page.content());
  } finally {
    await browser.close();
  }
})();
