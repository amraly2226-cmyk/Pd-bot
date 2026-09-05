const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ 
    headless: true, 
    args: ['--no-sandbox', '--disable-setuid-sandbox'] 
  });
  const page = await browser.newPage();

  // قراءة البيانات من الأسماء اللي في Railway عندك
  const USERNAME = process.env.PD_USER;
  const PASSWORD = process.env.PD_PASS;

  if (!USERNAME || !PASSWORD) {
    console.log('❌ لسه في مشكلة في الـ Variables! متأكد إن قيم PD_USER و PD_PASS موجودة؟');
    await browser.close();
    return;
  }

  console.log('✅ تم قراءة المتغيرات بنجاح.');

  try {
    // 1. فتح صفحة تسجيل الدخول
    await page.goto('https://project-dark.co.uk/login', { waitUntil: 'networkidle2', timeout: 60000 });
    
    // 2. إدخال البيانات
    await page.waitForSelector('input[type="text"], input[name="username"], input[name="email"]', { timeout: 10000 });
    await page.type('input[type="text"], input[name="username"], input[name="email"]', USERNAME);
    
    await page.waitForSelector('input[type="password"]', { timeout: 10000 });
    await page.type('input[type="password"]', PASSWORD);

    // 3. الضغط على زر الدخول
    await page.click('button[type="submit"], input[type="submit"]');
    console.log('🔑 تم الضغط على زر تسجيل الدخول');

    // 4. انتظار الانتقال وفتح صفحة السوق الأسود
    await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 60000 }).catch(() => {});
    await page.goto('https://project-dark.co.uk/black', { waitUntil: 'networkidle2', timeout: 60000 });

    // 5. استنى كلمة Location
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
    console.log('🔍 محتوى الصفحة الحالية:');
    console.log(await page.content());
  } finally {
    await browser.close();
  }
})();
