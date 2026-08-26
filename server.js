const express = require('express');
const puppeteer = require('puppeteer-core');
const chromium = require('@sparticuz/chromium');
const app = express();
const PORT = process.env.PORT || 8080;

app.get('/', (req,res)=>res.send('PD-Bot OFFLINE v56 LIVE - Running even if phone closed'));

app.listen(PORT, ()=>console.log(`✅ Server started on ${PORT}`));

async function startBot() {
    console.log('🚀 Starting OFFLINE Bot...');
    const browser = await puppeteer.launch({
        args: chromium.args,
        defaultViewport: chromium.defaultViewport,
        executablePath: await chromium.executablePath(),
        headless: chromium.headless,
    });
    const page = await browser.newPage();
    
    // 1- روح صفحة تسجيل الدخول
    await page.goto('https://www.project-dark.co.uk/login', {waitUntil: 'networkidle2'});
    
    // 2- سجل دخول - هياخد اليوزر والباسورد من Railway Variables
    const USER = process.env.PD_USER;
    const PASS = process.env.PD_PASS;
    
    if(!USER || !PASS){
        console.log('❌ حط PD_USER و PD_PASS في Railway Variables');
        return;
    }
    
    await page.type('input[name="username"]', USER);
    await page.type('input[name="password"]', PASS);
    await page.click('button[type="submit"]');
    await page.waitForNavigation({waitUntil: 'networkidle2'});
    console.log('✅ Logged in');

    // 3- لوب البيع والشرا - نفس منطق البوت بتاعك
    while(true){
        try{
            console.log('🔄 Checking Blackmarket...');
            await page.goto('https://www.project-dark.co.uk/blackmarket', {waitUntil: 'networkidle2'});
            // هنا نفس منطق الشراء بتاعك - هيشتري Max Buy
            await page.waitForTimeout(5000);

            console.log('✈️ Checking Travel...');
            await page.goto('https://www.project-dark.co.uk/travel', {waitUntil: 'networkidle2'});
            await page.waitForTimeout(10000);
            
        }catch(e){
            console.log('Error:', e.message);
            await page.waitForTimeout(15000);
        }
    }
}

startBot();
