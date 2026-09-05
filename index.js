const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ 
    headless: true, 
    args: ['--no-sandbox', '--disable-setuid-sandbox'] 
  });
  const page = await browser.newPage();

  // قراءة البيانات من متغيرات البيئة (التي أضفناها في Railway)
  const USERNAME = process.env.USERNAME;
  const PASSWORD = process.env.PASSWORD;

  if (!USERNAME || !PASSWORD) {
    console.log('❌ تأكد من وضع USERNAME و PASSWORD في Variables في الإعدادات');
    await browser.close();
    return;
  }

  try {
    // 1. الذهاب لصفحة تسجيل الدخول
    await page.goto('https://project-dark.co.uk/login', { waitUntil: 'networkidle2', timeout: 60000 });
    console.log('📄 فتح صفحة تسجيل الدخول');

    // 2. إدخال البيانات (قد تحتاج لتغيير أسماء الحقول لو الموقع اتغير)
    // أمثلة للحقول: input[name="username"] أو #login-username
    await page.waitForSelector('input[type="text"], input[name="username"], input[name="email"]', { timeout: 10000 });
    await page.type('input[type="text"], input[name="username"], input[name="email"]', USERNAME);
    
    await page.waitForSelector('input[type="password"]', { timeout: 10000 });
    await page.type('input[type="password"]', PASSWORD);

    // الضغط على زر الدخول (أمثلة: button[type="submit"], #login-btn)
    await page.click('button[type="submit"], input[type="submit"]');
    console.log('🔑 تم الضغط على زر تسجيل الدخول');

    // 3. انتظار الانتقال للصفحة الرئيسية أو اللعبة
    await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 60000 }).catch(() => {});
    console.log('📄 الصفحة الحالية بعد الدخول:', page.url());

    // 4. الذهاب لصفحة السوق الأسود
    await page.goto('https://project-dark.co.uk/black', { waitUntil: 'networkidle2', timeout: 60000 });

    // 5. استنى كلمة Location تظهر (مدة 60 ثانية)
    await page.waitForFunction(() => document.body.innerText.includes('Location'), { timeout: 60000 });
    console.log('✅ تم العثور على كلمة Location');

    // 6. اقرأ المدينة واطبعها
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
    // إذا فشل، نطبع محتوى الصفحة لمعرفة السبب (هل هي صفحة كابتشا؟ هل هي صفحة تحقق Cloudflare؟)
    console.log('🔍 محتوى الصفحة الحالية لتشخيص المشكلة:');
    console.log(await page.content());
  } finally {
    await browser.close();
  }
})();
