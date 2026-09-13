from playwright.sync_api import sync_playwright
import time
import re
import threading

USERNAME = "amr.aly.2226@gmail.com"
PASSWORD = "Gun@12345"

COOKIES = [
    {"name": "device_fp_d", "value": "%7B%22lang%22%3A%22en-US%22%2C%22plat%22%3A%22Linux%20armv81%22%2C%22cores%22%3A8%2C%22mem%22%3Anull%2C%22screen%22%3A%22414x920x24%22%2C%22avail%22%3A%22414x920%22%2C%22tzoff%22%3A-180%2C%22tz%22%3A%22Africa%2FCairo%22%2C%22touch%22%3A1%2C%22mtp%22%3A5%2C%22canvas%22%3A%22ed1357802482%22%7D", "domain": "project-dark.co.uk", "path": "/"},
    {"name": "_ga_JNKJRQ925S", "value": "GS2.1.s1789314068$o9$g1$t1789314084$j44$l0$h0", "domain": ".project-dark.co.uk", "path": "/"},
    {"name": "remember_web_59ba36addc2b2f9401580f014c7f58ea4e30989d", "value": "eyJpdiI6IldLaFg3N0dYN2ZkbWZINjBkV2xjdXc9PSIsInZhbHVlIjoiN2hJMEJ6dnQrYUpJb3loQml2TWJ0eUU3dXl4TjNTUWpQNkYzbmVheG9EQ2JHQ2NEaXRaQW5SWjdmL2VKRllFRDlxaVprUGd6bU9pZy9zbEpqaTZLdUpnMHNDY2tCM2YrbkcrRzRwTkhtajNITGxxdkQ5QUhzcmRGUTYxL3lKNERRbTYxdXpnSmQ0N1VaSTU2N3ZOWGNJVEZVcEI2dVFqa3FwMmpzbVlsRDlZZGwxUElNNDZycmV2Z3pTSGpkcTdITkxkcWdmS0w5Rldvb09CUUxFSE9PTDdOaEVDNWc2d3hIODBOcFdNdmRXVT0iLCJtYWMiOiI4ZWVjNmMxMWZkMjQ3NjgwNjhmYTAzMDU2MzM1ODcwZWE2ZjAzY2ZiN2RlNDI4ODU4NzhkMThiNzU5NmRmZmZmIiwidGFnIjoiIn0%3D", "domain": ".project-dark.co.uk", "path": "/"},
    {"name": "device_fp", "value": "00cad2c6896d259a5ecbceded5efe770bb8b3e5407d0d39f4e54990a5f3d9835", "domain": "project-dark.co.uk", "path": "/"},
    {"name": "_ga", "value": "GA1.1.1994605517.1787739453", "domain": ".project-dark.co.uk", "path": "/"},
    {"name": "project-dark-session", "value": "eyJpdiI6InQ1b21Jd3BXd09BcE1BMnpZK1M4Tnc9PSIsInZhbHVlIjoiM0JPUnNFNEVrT1dPZTZoQ0R0TXo1aXB6Y2FLMVFwb1lJTEpJMXB6UHFPbitleW1QbGZhamRSMjRtdjZUcjhxbXh3MXNxYmFZUTFDanhTeXFQdDQyV1JUaWhmWTNQQ1BVNFRPNmI4ZlNFMWNSbTlQOWlQOENBQVZZeXpFVlN2NUciLCJtYWMiOiJjNzk1ODJjMGUxNGQ4Yzk5ZTgwNWI2MjNlMGI2OTczZTlhMGI0ZjhjZjYzYWFjYTNhZDNmYzhmMmI1OTUyZWJjIiwidGFnIjoiIn0%3D", "domain": ".project-dark.co.uk", "path": "/"},
    {"name": "XSRF-TOKEN", "value": "eyJpdiI6IitDVnZSaU8wY0pTeVY5Umg3VjJPQVE9PSIsInZhbHVlIjoicDFJL00zNTlyZU9RQlUzZ3BPZnZhL0R4RHBIZTROc29lVUdrMHorbmk0WDNHYWFhM09iZ1BqUXhzY1ZaOWJxOGVvVitZOUpudGYzbGt4YjgwSXhGMHljK0RoMmNQejRneC9LVkltdi8yRjZ1STR0dUh0TzdjSnhwSFhnMDV1UWIiLCJtYWMiOiIwZDJhMTJmMDQ4NTA0MWQ0YjhmOGFkYWY1M2UwMDAzNTRhZjhiOTJjZWYzMzYxMGFlZmJiYmRmMmY2MzYzNDM0IiwidGFnIjoiIn0%3D", "domain": ".project-dark.co.uk", "path": "/"}
]

ITEMS = ["Anabolic steroid","Artifacts","Alcohol","Electronics","Plastic jewelry","Stolen paintings","Human beings","Confidential documents","Endangered exotic animals","Organs"]

def sleep(ms): time.sleep(ms / 1000.0)

def parse_cooldown(text):
    t = 0
    h = re.search(r'(\d+)\s*h', text)
    if h: t += int(h.group(1)) * 3600
    m = re.search(r'(\d+)\s*m', text)
    if m: t += int(m.group(1)) * 60
    s = re.search(r'(\d+)\s*s', text)
    if s: t += int(s.group(1))
    return t

# ═══════════════════════════════════════════════════════════════
# 📈 بوت الأسهم (نسخة السكريبت الأصلي بتاعك بالظبط)
# ═══════════════════════════════════════════════════════════════

def run_stocks_bot():
    print("🚀 [الأسهم] بوت الأسهم بيشتغل...")
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True, args=['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu'])
        context = browser.new_context(user_agent="Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Mobile Safari/537.36", viewport={"width": 1920, "height": 1080})
        context.add_cookies(COOKIES)
        page = context.new_page()
        page.set_default_timeout(60000)
        
        try:
            page.goto('https://project-dark.co.uk/stocks', wait_until='domcontentloaded', timeout=120000)
            print("✅ [الأسهم] دخلنا لصفحة الأسهم بنجاح!")
        except Exception as e:
            print(f"❌ [الأسهم] مشكلة في الدخول: {e}")
            return
        
        while True:
            try:
                # 🔄 تحديث الصفحة قبل كل دورة جديدة
                try: page.reload(wait_until='domcontentloaded', timeout=60000)
                except: pass
                sleep(2000)
                
                # انتظر ظهور الجدول
                try: page.wait_for_selector('tr', timeout=20000)
                except: pass
                
                # ═══════════════════════════════════════
                # 🔴 1) البيع
                # ═══════════════════════════════════════
                print("🔴 [الأسهم] [1/2] بدأت عملية البيع...")
                
                # اضغط على آخر زر Sell All (اللي تحت خالص)
                page.evaluate("""() => {
                    const allSellBtns = [...document.querySelectorAll('button')].filter(b => b.innerText.trim() === 'Sell All');
                    if (allSellBtns.length > 0) {
                        allSellBtns[allSellBtns.length - 1].click();
                    }
                }""")
                sleep(2000)
                
                # استنى ظهور النافذة المنبثقة
                try:
                    page.wait_for_function("() => document.body.innerText.includes('Sell All Holdings') || document.body.innerText.includes('Confirm Sell All')", timeout=5000)
                except: pass
                
                # اضغط على زر SELL ALL في النافذة
                page.evaluate("""() => {
                    const allBtns = [...document.querySelectorAll('button')];
                    const confirmBtn = allBtns.find(b => b.innerText.trim() === 'SELL ALL' && b.offsetParent !== null);
                    if (confirmBtn) confirmBtn.click();
                }""")
                
                sleep(4000)
                try: page.wait_for_load_state('domcontentloaded', timeout=10000)
                except: pass
                sleep(1000)
                print("✅ [الأسهم] تم بيع كل الأسهم بنجاح!")
                
                # ═══════════════════════════════════════
                # 🟢 2) الشراء
                # ═══════════════════════════════════════
                print("🟢 [الأسهم] [2/2] بدأت عملية شراء الأسهم الخضراء...")
                bought_count = 0
                
                for attempt in range(5):
                    # بندور على السهم الأخضر - بنستخدم £ أو $
                    found_green = page.evaluate("""() => {
                        const rows = document.querySelectorAll('tr');
                        for (let row of rows) {
                            const isGreen = [...row.querySelectorAll('td')].some(cell => {
                                const text = cell.innerText.trim();
                                return (text.includes('£') || text.includes('$')) && (text.includes('↑') || text.includes('▲'));
                            });
                            if (isGreen) {
                                const maxSpan = row.querySelector('span.stock-fillmax-btn');
                                if (maxSpan) {
                                    maxSpan.click();
                                    return true;
                                }
                            }
                        }
                        return false;
                    }""")
                    
                    if not found_green:
                        break
                    
                    bought_count += 1
                    print(f"✅ [الأسهم] لقيت سهم أخضر {bought_count}، داست على Max")
                    sleep(1500)
                    
                    # اضغط على زر Buy اللي تحت
                    page.evaluate("""() => {
                        let buyBtn = document.getElementById('bottomBuyBtn');
                        if (buyBtn) buyBtn.click();
                    }""")
                    sleep(1500)
                    
                    # اضغط على زر YES في النافذة
                    page.evaluate("""() => {
                        let yesBtn = [...document.querySelectorAll('button, span, div')].find(el => el.innerText.trim().toUpperCase() === 'YES' && el.offsetWidth > 0);
                        if (yesBtn) yesBtn.click();
                    }""")
                    
                    try: page.wait_for_load_state('domcontentloaded', timeout=10000)
                    except: pass
                    sleep(2000)
                    print(f"✅ [الأسهم] تم شراء السهم الأخضر رقم {bought_count}")
                
                if bought_count == 0:
                    print("⏳ [الأسهم] مفيش أسهم خضراء في الوقت الحالي.")
                
                print("⏳ [الأسهم] هستنى 10 دقايق قبل ما نبدأ دورة جديدة...")
                sleep(600000)
                
            except Exception as e:
                print(f"⚠️ [الأسهم] حصل خطأ مؤقت: {e}")
                sleep(5000)


# ═══════════════════════════════════════════════════════════════
# 🌐 بوت التريد (زي ما هو بالظبط - مش هنلمسه)
# ═══════════════════════════════════════════════════════════════

def run_trade_bot():
    print("🌐 [التريد] بدأ التشغيل...")
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True, args=['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu'])
        context = browser.new_context(user_agent="Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Mobile Safari/537.36", viewport={"width": 1920, "height": 1080})
        context.add_cookies(COOKIES)
        page = context.new_page()
        page.set_default_timeout(15000)
        try:
            page.goto('https://www.project-dark.co.uk/blackmarket', wait_until='domcontentloaded', timeout=60000)
            print("✅ [التريد] دخلنا")
        except Exception as e: print(f"⚠️ مشكلة: {e}")

        while True:
            try:
                if 'travel' in page.url:
                    cooldown_text = page.evaluate("""() => {
                        let body = document.body.innerText;
                        let cdMatch = body.match(/You cannot travel for:?\\s*([^\\n]+)/i);
                        if (cdMatch) {
                            let str = cdMatch[1].trim();
                            if (str.includes('00:00') || str.includes('0m') || str.includes('0s')) {
                                if (!/(\\d+[hms])/.test(str)) return null;
                                if (str.match(/(\\d+)\\s*h/) && parseInt(str.match(/(\\d+)\\s*h/)[1]) > 0) return str;
                                if (str.match(/(\\d+)\\s*m/) && parseInt(str.match(/(\\d+)\\s*m/)[1]) > 0) return str;
                                if (str.match(/(\\d+)\\s*s/) && parseInt(str.match(/(\\d+)\\s*s/)[1]) > 0) return str;
                                return null;
                            }
                            return str;
                        }
                        return null;
                    }""")
                    if cooldown_text:
                        ws = parse_cooldown(cooldown_text)
                        if ws > 0:
                            ws += 10
                            print(f"⏳ [التريد] كولداون: {cooldown_text} - هستنى {ws} ث...")
                            sleep(ws * 1000)
                            print("✅ [التريد] العداد خلص، refresh...")
                            page.goto('https://www.project-dark.co.uk/travel', wait_until='domcontentloaded')
                            sleep(5000)
                            continue
                    
                    cc = page.evaluate("""() => {
                        let body = document.body.innerText;
                        let lines = body.split('\\n');
                        for (let i = 0; i < lines.length; i++) {
                            if (lines[i].trim().toUpperCase() === 'LOCATION') {
                                for (let j = i + 1; j < lines.length; j++) {
                                    if (lines[j].trim()) {
                                        if (lines[j].includes('San Francisco')) return 'San Francisco';
                                        if (lines[j].includes('St Louis')) return 'St Louis';
                                        break;
                                    }
                                }
                                break;
                            }
                        }
                        if (body.includes('Black Market - San Francisco')) return 'San Francisco';
                        if (body.includes('Black Market - St Louis')) return 'St Louis';
                        return null;
                    }""")
                    
                    if not cc:
                        print("⚠️ [التريد] مش لاقي المدينة، refresh...")
                        page.goto('https://project-dark.co.uk/travel', wait_until='domcontentloaded')
                        sleep(5000)
                        continue
                    
                    dc = 'St Louis' if cc == 'San Francisco' else 'San Francisco'
                    print(f"✈️ [التريد] {cc} -> {dc}")
                    
                    try:
                        g = page.locator("text='Grid View'").first
                        if g.count() > 0:
                            g.click(force=True)
                            print("✅ [التريد] Grid View")
                            sleep(2000)
                    except Exception as e:
                        print(f"⚠️ [التريد] Grid View: {e}")
                    
                    try:
                        c = page.locator(f"text='{dc}'").first
                        if c.count() > 0:
                            c.click(force=True)
                            print(f"✅ [التريد] كارت {dc}")
                            sleep(2000)
                    except Exception as e:
                        print(f"⚠️ [التريد] كارت المدينة: {e}")
                    
                    try:
                        t = page.locator("button:has-text('Travel to Selected Location')").first
                        if t.count() > 0:
                            t.click(force=True)
                            print("✅ [التريد] Travel to Selected")
                            sleep(2500)
                    except Exception as e:
                        print(f"⚠️ [التريد] Travel Selected: {e}")
                    
                    try:
                        page.wait_for_selector("button:has-text('TRAVEL')", timeout=10000)
                        tv = page.locator("button:has-text('TRAVEL')").last
                        if tv.count() > 0:
                            tv.click(force=True)
                            print(f"🎉 [التريد] تم السفر إلى {dc}!")
                            sleep(7000)
                    except Exception as e:
                        print(f"⚠️ [التريد] تأكيد السفر: {e}")
                    
                    page.goto('https://www.project-dark.co.uk/blackmarket', wait_until='domcontentloaded')
                    sleep(3000)
                    continue

                state = page.evaluate("""(items) => {
                    let body = document.body.innerText;
                    let loc = null, cd = null, hold = 0, held = null;
                    
                    let lines = body.split('\\n');
                    for (let i = 0; i < lines.length; i++) {
                        if (lines[i].trim().toUpperCase() === 'LOCATION') {
                            for (let j = i + 1; j < lines.length; j++) {
                                if (lines[j].trim()) {
                                    if (lines[j].includes('San Francisco')) loc = 'San Francisco';
                                    else if (lines[j].includes('St Louis')) loc = 'St Louis';
                                    break;
                                }
                            }
                            break;
                        }
                    }
                    if (!loc) {
                        if (body.includes('Black Market - San Francisco')) loc = 'San Francisco';
                        else if (body.includes('Black Market - St Louis')) loc = 'St Louis';
                    }
                    
                    let m = body.match(/You cannot travel for:?\\s*([0-9hms ]+)/i);
                    if (m) cd = m[1];
                    
                    let rows = [...document.querySelectorAll('tr')];
                    for (let r of rows) {
                        let t = r.innerText;
                        if (t.includes('Sell') && !t.includes('Confirm')) {
                            for (let it of items) {
                                if (t.toLowerCase().includes(it.toLowerCase())) {
                                    let cells = [...r.querySelectorAll('td')];
                                    if (cells.length >= 3) {
                                        let mt = cells[2].innerText.match(/(\\d+)/);
                                        if (mt && +mt[1] > 0) { held = it; hold = +mt[1]; break; }
                                    }
                                    break;
                                }
                            }
                        }
                    }
                    if (held === null) { let m2 = body.match(/holding (\\d+) items/i); hold = m2 ? +m2[1] : 0; }
                    return { loc, cd, hold, held };
                }""", ITEMS)

                if state['cd']:
                    print(f"⏳ [التريد] كولداون سوق")
                    sleep(60000)
                    continue

                if state['loc'] == "San Francisco":
                    if state['held'] == "Stolen paintings" and state['hold'] > 0:
                        print("📍 [التريد] SF - بيع اللوحات")
                        c = page.evaluate("""() => { let rs = [...document.querySelectorAll('tr')]; for (let r of rs) { if (r.innerText.includes('Stolen paintings')) { let b = [...r.querySelectorAll('button')].find(x => x.innerText.trim() === 'Sell All'); if (b) { b.click(); return true; } } } return false; }""")
                        if c:
                            sleep(3000)
                            try:
                                cf = page.locator('button:has-text("SELL ALL")').last
                                cf.wait_for(state="visible", timeout=10000)
                                cf.click(force=True)
                                print("✅ [التريد] بيع اللوحات!")
                            except: pass
                        sleep(3000)
                        continue
                    if state['held'] == "Plastic jewelry" and state['hold'] > 0:
                        print("📍 [التريد] SF -> STL")
                        page.goto('https://www.project-dark.co.uk/travel', wait_until='domcontentloaded')
                        sleep(4000)
                        continue
                    if state['hold'] == 0:
                        print("📍 [التريد] SF - شراء بلاستيك")
                        c = page.evaluate("""() => { let rs = [...document.querySelectorAll('tr')]; for (let r of rs) { if (r.innerText.includes('Plastic jewelry')) { let b = [...r.querySelectorAll('button')].find(x => x.innerText.trim() === 'Max Buy'); if (b) { b.click(); return true; } } } return false; }""")
                        if c:
                            sleep(3000)
                            try:
                                cf = page.locator('button:has-text("BUY MAX")').last
                                cf.wait_for(state="visible", timeout=10000)
                                cf.click(force=True)
                                print("✅ [التريد] شراء بلاستيك!")
                            except: pass
                        sleep(3000)
                        continue

                elif state['loc'] == "St Louis":
                    if state['held'] == "Plastic jewelry" and state['hold'] > 0:
                        print("📍 [التريد] STL - بيع البلاستيك")
                        c = page.evaluate("""() => { let rs = [...document.querySelectorAll('tr')]; for (let r of rs) { if (r.innerText.includes('Plastic jewelry')) { let b = [...r.querySelectorAll('button')].find(x => x.innerText.trim() === 'Sell All'); if (b) { b.click(); return true; } } } return false; }""")
                        if c:
                            sleep(3000)
                            try:
                                cf = page.locator('button:has-text("SELL ALL")').last
                                cf.wait_for(state="visible", timeout=10000)
                                cf.click(force=True)
                                print("✅ [التريد] بيع البلاستيك!")
                            except: pass
                        sleep(3000)
                        continue
                    if state['held'] == "Stolen paintings" and state['hold'] > 0:
                        print("📍 [التريد] STL -> SF")
                        page.goto('https://www.project-dark.co.uk/travel', wait_until='domcontentloaded')
                        sleep(4000)
                        continue
                    if state['hold'] == 0:
                        print("📍 [التريد] STL - شراء لوحات")
                        c = page.evaluate("""() => { let rs = [...document.querySelectorAll('tr')]; for (let r of rs) { if (r.innerText.includes('Stolen paintings')) { let b = [...r.querySelectorAll('button')].find(x => x.innerText.trim() === 'Max Buy'); if (b) { b.click(); return true; } } } return false; }""")
                        if c:
                            sleep(3000)
                            try:
                                cf = page.locator('button:has-text("BUY MAX")').last
                                cf.wait_for(state="visible", timeout=10000)
                                cf.click(force=True)
                                print("✅ [التريد] شراء لوحات!")
                            except: pass
                        sleep(3000)
                        continue
                else:
                    print("⚠️ [التريد] مش لاقي المدينة، refresh...")
                    page.goto('https://www.project-dark.co.uk/blackmarket', wait_until='domcontentloaded')
                    sleep(3000)
                    continue
            except Exception as e:
                print(f"⚠️ [التريد] خطأ: {e}")
                sleep(15000)
            sleep(10000)

if __name__ == "__main__":
    print("🚀🚀🚀 تشغيل البوتين...")
    print("="*60)
    t1 = threading.Thread(target=run_trade_bot, daemon=True, name="TradeBot")
    t2 = threading.Thread(target=run_stocks_bot, daemon=True, name="StocksBot")
    t1.start(); t2.start()
    print("✅ التريد:", t1.name)
    print("✅ الأسهم:", t2.name)
    print("="*60)
    try:
        while True: time.sleep(60)
    except KeyboardInterrupt: print("\n🛑 إيقاف.")
