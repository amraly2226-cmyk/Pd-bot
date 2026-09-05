const puppeteer = require('puppeteer-core');

const USERNAME = 'amr.aly.2226@gmail.com'; 
const PASSWORD = 'Gun@12345'; 

const ITEMS = ["Anabolic steroid","Artifacts","Alcohol","Electronics","Plastic jewelry","Stolen paintings","Human beings","Confidential documents","Endangered exotic animals","Organs"];

async function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

function parseCooldownToSeconds(str) {
    if (!str) return 0;
    let h = str.match(/(\d+)\s*h/);
    let m = str.match(/(\d+)\s*m/);
    let s = str.match(/(\d+)\s*s/);
    let seconds = 0;
    if (h) seconds += parseInt(h[1]) * 3600;
    if (m) seconds += parseInt(m[1]) * 60;
    if (s) seconds += parseInt(s[1]);
    if (seconds === 0) {
        let n = str.match(/(\d+)/);
        if (n && parseInt(n[1]) > 0) seconds = parseInt(n[1]) * 60; 
    }
    return seconds;
}

(async () => {
  console.log("🚀 البوت شغال (شيكاغو ↔ سانت لويس)...");

  const browser = await puppeteer.launch({ 
    headless: true,
    executablePath: '/data/data/com.termux/files/usr/bin/chromium-browser',
    protocolTimeout: 90000, // المهلة الكبيرة حتى لا يتجمد
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu'] 
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 }); 
  page.setDefaultTimeout(90000);

  try {
    // 1) فتح صفحة اللوجين بمهلة كبيرة
    console.log("⏳ جاري فتح اللوجين... (مستني التحقق الأمني)");
    await page.goto('https://www.project-dark.co.uk/login', { waitUntil: 'domcontentloaded', timeout: 90000 });
    
    // 2) الانتظار 15 ثانية للسماح بظهور التحقق (Verification) واكتماله
    console.log("⏳ بنستنى 15 ثانية عشان التحقق الأمني يخلص...");
    await sleep(15000);
    
    // 3) الانتظار حتى تظهر حقول الإدخال فعلاً
    await page.waitForSelector('input[type="text"], input[type="email"], input[type="password"]', { timeout: 30000 });

    // 4) كتابة البيانات والدخول
    const inputs = await page.$$('input[type="text"], input[type="email"], input[type="password"]');
    if (inputs.length >= 2) {
       await inputs[0].type(USERNAME);
       await inputs[1].type(PASSWORD);
    }
    await page.click('button[type="submit"]').catch(() => {});
    console.log("✅ كتبت البيانات، جاري الدخول...");
    
    // 5) انتظار تحميل السوق
    await sleep(5000);
    await page.goto('https://www.project-dark.co.uk/blackmarket', { waitUntil: 'domcontentloaded', timeout: 90000 });
    await sleep(5000);
    console.log("✅ دخلنا السوق الأسود!");
  } catch (e) {
    console.log("⚠️ مشكلة في الدخول:", e.message);
  }

  while (true) {
    try {
      // ... (باقي كود البيع والشراء والسفر بين شيكاغو وسانت لويس كما هو - سأضيفه إذا كنت بحاجة له، لكن الجزء المهم هو الدخول)
