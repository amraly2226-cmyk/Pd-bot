const puppeteer = require('puppeteer');

async function اقرأ_المدينة() {
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] }); // --no-sandbox ضروري على Railway
  const page = await browser.newPage();

  // (مهم جداً) لو الموقع بيطلب تسجيل دخول، حط الكوكيز بتاعتك هنا:
  // await page.setCookie({ name: 'اسم_الكوكي', value: 'قيمته', domain: 'project-dark.co.uk' });
  // أو اكتب سطور تسجيل الدخول (user/pass) قبل فتح الصفحة الرئيسية.

  await page.goto('https://project-dark.co.uk/black', { waitUntil: 'networkidle2' });
  
  // استنى ظهور كلمة Location
  await page.waitForFunction(() => document.body.innerText.includes('Location'), { timeout: 15000 });

  const المدينة = await page.evaluate(() => {
    const elements = document.querySelectorAll('*');
    for (let el of elements) {
      if (el.children.length === 0 && el.textContent.trim() === 'Location') {
        const parent = el.parentElement.innerText.split('\n').filter(x => x.trim() !== '');
        // العادة "Location" أول سطر والمدينة اللي بعده
        return parent[1] || 'غير معروفة';
      }
    }
  });

  await browser.close();
  return المدينة;
}

// استدعاء الدالة دي في أي مكان في برنامجك
اقرأ_المدينة().then(المدينة => {
    console.log('✅ المدينة:', المدينة);
    // هنا تقدر تحط كود اللعبة بتاعك اللي هيشتغل لما يلاقي المدينة
});
