const express = require('express');
const puppeteer = require('puppeteer-core');
const chromium = require('@sparticuz/chromium');
const app = express();
const PORT = process.env.PORT || 8080;

app.get('/', (req,res)=>res.send(`PD-Bot OFFLINE v56 - From: ${process.env.PD_FROM} To: ${process.env.PD_TO} Item: ${process.env.PD_ITEM}`));
app.listen(PORT, ()=>console.log(`✅ Server started on ${PORT}`));

const CITIES = {1:"Cairo",2:"Tokyo",3:"London",4:"Moscow",5:"Rome",6:"Capetown",7:"Sydney",8:"Ottawa",9:"Rio de Janeiro"};
const CITY_IDS = {"Cairo":1,"Tokyo":2,"London":3,"Moscow":4,"Rome":5,"Capetown":6,"Sydney":7,"Ottawa":8,"Rio de Janeiro":9};

async function startBot() {
    console.log('🚀 Starting OFFLINE Bot...');
    const browser = await puppeteer.launch({
        args: [...chromium.args, '--no-sandbox', '--disable-setuid-sandbox'],
        defaultViewport: {width: 1280, height: 800},
        executablePath: await chromium.executablePath(),
        headless: chromium.headless,
    });
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0 Safari/537.36');

    const USER = process.env.PD_USER;
    const PASS = process.env.PD_PASS;
    let FROM = process.env.PD_FROM || 'Tokyo';
    let TO = process.env.PD_TO || 'Cairo';
    let ITEM = process.env.PD_ITEM || 'Electronics';

    if(!USER || !PASS){ console.log('❌ PD_USER / PD_PASS ناقصين'); return; }

    console.log(`Config: ${FROM} -> ${ITEM} -> ${TO}`);
    await page.goto('https://www.project-dark.co.uk/login', {waitUntil: 'networkidle2'});
    await page.waitForSelector('input[name="username"]', {timeout: 10000});
    await page.type('input[name="username"]', USER);
    await page.type('input[name="password"]', PASS);
    await page.click('button[type="submit"]');
    await page.waitForNavigation({waitUntil: 'networkidle2', timeout: 15000});
    console.log('✅ Logged in');

    while(true){
        try{
            const content = await page.content();
            
            // Check cooldown
            let cdMatch = content.match(/You cannot travel for:?\s*([0-9hms ]+)/i);
            if(cdMatch){
                console.log(`⏳ Cooldown: ${cdMatch[1]} - waiting 30s`);
                await new Promise(r=>setTimeout(r, 30000));
                await page.goto('https://www.project-dark.co.uk/travel', {waitUntil: 'networkidle2'});
                continue;
            }

            // Step 1: BUY
            console.log(`🛒 Going to Blackmarket to buy ${ITEM} in ${FROM}`);
            await page.goto('https://www.project-dark.co.uk/blackmarket', {waitUntil: 'networkidle2'});
            await new Promise(r=>setTimeout(r, 3000));

            // Sell wrong items if any
            const sold = await page.evaluate((ITEM)=>{
                let rows = [...document.querySelectorAll('tr')];
                for(let r of rows){
                    if(r.innerHTML.includes('Sell All') && !r.innerText.includes('Confirm Sell All')){
                        let txt = r.innerText.toLowerCase();
                        if(!txt.includes(ITEM.toLowerCase())){
                            let btn = [...r.querySelectorAll('button')].find(b=>b.innerText.trim()==='Sell All');
                            if(btn){ btn.click(); return 'sold_wrong'; }
                        }
                    }
                }
                return 'ok';
            }, ITEM);

            if(sold === 'sold_wrong'){
                await new Promise(r=>setTimeout(r, 2000));
                await page.evaluate(()=>{
                    let b = [...document.querySelectorAll('button')].find(x=> x.innerText.trim().toUpperCase()==='SELL ALL' && x.offsetParent!==null);
                    if(b) b.click();
                });
                console.log(`🔴 Sold wrong items`);
                await new Promise(r=>setTimeout(r, 3000));
                await page.reload({waitUntil: 'networkidle2'});
            }

            // Buy MAX
            const bought = await page.evaluate((ITEM)=>{
                let row = [...document.querySelectorAll('tr')].find(tr=> tr.innerText.toLowerCase().includes(ITEM.toLowerCase()) && tr.innerText.includes('£'));
                if(row){
                    let btn = [...row.querySelectorAll('button')].find(b=> b.innerText.includes('Max Buy'));
                    if(btn){ btn.click(); return true; }
                }
                return false;
            }, ITEM);

            if(bought){
                await new Promise(r=>setTimeout(r, 1500));
                await page.evaluate(()=>{
                    let b = [...document.querySelectorAll('button')].find(x=> x.innerText.trim()==='BUY MAX');
                    if(b) b.click();
                });
                console.log(`✅ Bought ${ITEM}`);
                await new Promise(r=>setTimeout(r, 3000));
            }

            // Step 2: TRAVEL
            console.log(`✈️ Traveling to ${TO}`);
            await page.goto('https://www.project-dark.co.uk/travel', {waitUntil: 'networkidle2'});
            await new Promise(r=>setTimeout(r, 3000));

            await page.evaluate((TO)=>{
                for(let el of document.querySelectorAll('*')){
                    if(el.innerText && el.innerText.trim().toUpperCase()===TO.toUpperCase() && el.offsetParent!==null && el.children.length===0){
                        let card = el.parentElement;
                        for(let i=0;i<4;i++){ if(card && card.offsetWidth>150) break; card=card.parentElement; }
                        if(card) card.click();
                    }
                }
            }, TO);

            await new Promise(r=>setTimeout(r, 2000));
            
            await page.evaluate(()=>{
                let tb = [...document.querySelectorAll('button')].find(b=> b.innerText.trim()==='Travel to Selected Location');
                if(tb) tb.click();
            });
            await new Promise(r=>setTimeout(r, 1500));
            await page.evaluate(()=>{
                let cb = [...document.querySelectorAll('button')].find(b=> b.innerText.trim()==='TRAVEL');
                if(cb) cb.click();
            });
            
            console.log(`✈️ Traveled to ${TO} - swapping route`);
            // Swap route for next loop
            let temp = FROM; FROM = TO; TO = temp;
            await new Promise(r=>setTimeout(r, 8000));

        }catch(e){
            console.log('❌ Error:', e.message);
            await new Promise(r=>setTimeout(r, 15000));
            try{ await page.goto('https://www.project-dark.co.uk/', {waitUntil: 'networkidle2'}); }catch{}
        }
    }
}

startBot();
