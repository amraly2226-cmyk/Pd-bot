from playwright.sync_api import sync_playwright
import time
import re
import threading

USERNAME = "amr.aly.2226@gmail.com"
PASSWORD = "Gun@12345"

COOKIES = [
    {"name": "device_fp_d", "value": "%7B%22lang%22%3A%22en-US%22%2C%22plat%22%3A%22Linux%20armv81%22%2C%22cores%22%3A8%2C%22mem%22%3Anull%2C%22screen%22%3A%22414x920x24%22%2C%22avail%22%3A%22414x920%22%2C%22tzoff%22%3A-180%2C%22tz%22%3A%22Africa%2FCairo%22%2C%22touch%22%3A1%2C%22mtp%22%3A5%2C%22canvas%22%3A%22ed1357802482%22%7D", "domain": "project-dark.co.uk", "path": "/"},
    {"name": "_ga_JNKJRQ925S", "value": "GS2.1.s1789214101$o8$g1$t1789214137$j24$l0$h0", "domain": ".project-dark.co.uk", "path": "/"},
    {"name": "remember_web_59ba36addc2b2f9401580f014c7f58ea4e30989d", "value": "eyJpdiI6IldLaFg3N0dYN2ZkbWZINjBkV2xjdXc9PSIsInZhbHVlIjoiN2hJMEJ6dnQrYUpJb3loQml2TWJ0eUU3dXl4TjNTUWpQNkYzbmVheG9EQ2JHQ2NEaXRaQW5SWjdmL2VKRllFRDlxaVprUGd6bU9pZy9zbEpqaTZLdUpnMHNDY2tCM2YrbkcrRzRwTkhtajNITGxxdkQ5QUhzcmRGUTYxL3lKNERRbTYxdXpnSmQ0N1VaSTU2N3ZOWGNJVEZVcEI2dVFqa3FwMmpzbVlsRDlZZGwxUElNNDZycmV2Z3pTSGpkcTdITkxkcWdmS0w5Rldvb09CUUxFSE9PTDdOaEVDNWc2d3hIODBOcFdNdmRXVT0iLCJtYWMiOiI4ZWVjNmMxMWZkMjQ3NjgwNjhmYTAzMDU2MzM1ODcwZWE2ZjAzY2ZiN2RlNDI4ODU4NzhkMThiNzU5NmRmZmZmIiwidGFnIjoiIn0%3D", "domain": ".project-dark.co.uk", "path": "/"},
    {"name": "device_fp", "value": "00cad2c6896d259a5ecbceded5efe770bb8b3e5407d0d39f4e54990a5f3d9835", "domain": "project-dark.co.uk", "path": "/"},
    {"name": "_ga", "value": "GA1.1.1994605517.1787739453", "domain": ".project-dark.co.uk", "path": "/"},
    {"name": "project-dark-session", "value": "eyJpdiI6Ikl1WlIvbHczd2RhS3BKMVlGeHRuSXc9PSIsInZhbHVlIjoicnN3VmEvVkZubE91MzRqcWJGbHlYcloySUgzaXpkVWdHZTdxRTdPakZGdHZvNWFQZ0JYVVRRbFB2YmRmbWtKY1YwcjNGaTB2VWhVMVpFL2pLUFd1cjBoaitVMEJ5NjV2Ny9scE0wankxNGVMRjJDU0Jub0p4bGZRdWlMK1lUbDAiLCJtYWMiOiJiOTk4ZGYwNDQ4MTY5NGFiNGNjODk3ODAxZWZhYzJlOTVhZTE4NzJmNDFkYWQ3M2I2OGM2NTU0YjhkOTI4ZDJjIiwidGFnIjoiIn0%3D", "domain": ".project-dark.co.uk", "path": "/"},
    {"name": "XSRF-TOKEN", "value": "eyJpdiI6IkRlbG5MQitsczhUcnVqVFNGSmdwbEE9PSIsInZhbHVlIjoiZTZNSld1SHRiMmRCaWhpb28rc3pyUTg3RjdyY3BzeWVnaHVQVzl5WHB3bFl6b2JqUW1SSXVjb0U3K1R3VU4ydWtlQ3ZIeXV0MzNWMjNtb21JWXI3UGc5UXFNNkdkVzJZQVlOUkxRMTB6YVpyc3BpY05BT01vSEY0NCtmRnFGSWkiLCJtYWMiOiIwOTE2MDgxNDgzYzEwODgzZTM1MTk0ODUzZTk2ZWMxYzJlNWUwODcwY2IyZTZjYWYwM2FlMGRmYmEyNjQwMDI3IiwidGFnIjoiIn0%3D", "domain": ".project-dark.co.uk", "path": "/"}
]

ITEMS = ["Anabolic steroid","Artifacts","Alcohol","Electronics","Plastic jewelry","Stolen paintings","Human beings","Confidential documents","Endangered exotic animals","Organs"]
STOCKS_INTERVAL = 15 * 60

def sleep(ms):
    time.sleep(ms / 1000.0)

def parse_cooldown(text):
    total_seconds = 0
    hours = re.search(r'(\d+)\s*h', text)
    if hours: total_seconds += int(hours.group(1)) * 3600
    minutes = re.search(r'(\d+)\s*m', text)
    if minutes: total_seconds += int(minutes.group(1)) * 60
    seconds = re.search(r'(\d+)\s*s', text)
    if seconds: total_seconds += int(seconds.group(1))
    return total_seconds

def click_yes_button(page):
    """بتدور على زر YES بأكتر من طريقة"""
    
    # الطريقة 1: Playwright locator - button بـ YES
    try:
        btn = page.locator('button').filter(has_text=re.compile(r'^\s*YES\s*$', re.IGNORECASE)).last
        if btn.count() > 0:
            btn.click(force=True, timeout=5000)
            print("✅ [الأسهم] YES (Playwright button)")
            return True
    except Exception as e:
        pass
    
    # الطريقة 2: JavaScript - button فقط (مش a ولا span)
    result = page.evaluate("""() => {
        let btns = document.querySelectorAll('button');
        for (let b of btns) {
            let t = (b.innerText || b.textContent || '').trim().toUpperCase();
            if (t === 'YES' && b.offsetWidth > 0 && b.offsetHeight > 0) {
                b.click();
                return 'js_button';
            }
        }
        return false;
    }""")
    if result:
        print(f"✅ [الأسهم] YES ({result})")
        return True
    
    # الطريقة 3: JavaScript - أي عنصر ظاهر
    result = page.evaluate("""() => {
        let els = document.querySelectorAll('div, span, input[type="submit"], input[type="button"]');
        for (let el of els) {
            let t = (el.innerText || el.value || '').trim().toUpperCase();
            if (t === 'YES' && el.offsetWidth > 0 && el.offsetHeight > 0) {
                el.click();
                return 'js_' + el.tagName.toLowerCase();
            }
        }
        return false;
    }""")
    if result:
        print(f"✅ [الأسهم] YES ({result})")
        return True
    
    # الطريقة 4: dispatchEvent
    result = page.evaluate("""() => {
        let els = document.querySelectorAll('button, span, div');
        for (let el of els) {
            let t = (el.innerText || '').trim().toUpperCase();
            if (t === 'YES' && el.offsetWidth > 0) {
                let evt = new MouseEvent('click', {bubbles: true, cancelable: true, view: window});
                el.dispatchEvent(evt);
                return 'dispatched_' + el.tagName.toLowerCase();
            }
        }
        return false;
    }""")
    if result:
        print(f"✅ [الأسهم] YES ({result})")
        return True
    
    return False

def run_stocks_bot():
    print("📈 [الأسهم] بدأ التشغيل...")
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True, args=['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu'])
        context = browser.new_context(user_agent="Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Mobile Safari/537.36", viewport={"width": 1920, "height": 1080})
        context.add_cookies(COOKIES)
        page = context.new_page()
        page.set_default_timeout(15000)
        time.sleep(5)
        
        while True:
            try:
                print("\n" + "="*50)
                print("📈 [الأسهم] جاري الدخول لصفحة الأسهم...")
                print("="*50)
                page.goto('https://project-dark.co.uk/stocks', wait_until='domcontentloaded', timeout=60000)
                print("✅ [الأسهم] دخلنا الصفحة")
                try: page.wait_for_selector('tr', timeout=20000)
                except: pass
                
                print("🔴 [الأسهم] بدأت عملية البيع...")
                try:
                    sell_btns = page.locator('button:has-text("Sell All")')
                    if sell_btns.count() > 0:
                        sell_btns.last.click(force=True)
                        sleep(2000)
                        page.evaluate("""() => {
                            let btns = [...document.querySelectorAll('button')];
                            for (let b of btns) {
                                if (b.innerText.trim().toUpperCase() === 'SELL ALL' && !b.closest('tr')) { b.click(); return true; }
                            }
                        }""")
                        sleep(4000)
                    else: print("ℹ️ [الأسهم] مفيش أسهم للبيع")
                except Exception as e: print(f"⚠️ [الأسهم] مشكلة في البيع: {e}")
                
                print("🟢 [الأسهم] بدأت عملية الشراء...")
                bought_count = 0
                for attempt in range(5):
                    try:
                        found_green = False
                        rows = page.locator('tr')
                        for i in range(rows.count()):
                            row = rows.nth(i)
                            if ('↑' in row.inner_text() or '▲' in row.inner_text()):
                                max_span = row.locator('span.stock-fillmax-btn').first
                                if max_span.count() > 0:
                                    max_span.click(force=True)
                                    found_green = True
                                    break
                        if not found_green: break
                        
                        bought_count += 1
                        print(f"✅ [الأسهم] لقيت سهم أخضر {bought_count}، داس على Max")
                        sleep(3000)
                        
                        # اضغط على Buy بالـ Playwright (مضمون أكتر)
                        try:
                            page.locator('#bottomBuyBtn').click(force=True, timeout=5000)
                            print("✅ [الأسهم] داس على Buy (Playwright)")
                        except:
                            page.evaluate("document.getElementById('bottomBuyBtn').click()")
                            print("✅ [الأسهم] داس على Buy (JS)")
                        
                        sleep(5000)
                        
                        # Screenshot قبل البحث عن YES
                        try: page.screenshot(path="before_yes_click.png")
                        except: pass
                        
                        # بندور على YES بأكتر من طريقة
                        if click_yes_button(page):
                            sleep(5000)
                            print(f"✅ [الأسهم] تم شراء السهم رقم {bought_count}")
                        else:
                            print("⚠️ [الأسهم] مش لاقي زر YES خالص")
                            page.screenshot(path="no_yes_button.png")
                            break
                        
                    except Exception as e:
                        print(f"⚠️ [الأسهم] مشكلة: {e}")
                        break
                
                if bought_count == 0: print("ℹ️ [الأسهم] مفيش أسهم خضراء")
                print(f"📊 [الأسهم] خلصنا: {bought_count} سهم")
                print("="*50 + "\n")
            except Exception as e: print(f"⚠️ [الأسهم] خطأ: {e}")
            
            print(f"⏰ [الأسهم] هستنى 15 دقيقة...")
            time.sleep(STOCKS_INTERVAL)


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
        except Exception as e: print(f"⚠️ [التريد] مشكلة: {e}")

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
                        wait_seconds = parse_cooldown(cooldown_text)
                        if wait_seconds > 0:
                            wait_seconds += 10
                            print(f"⏳ [التريد] كولداون: {cooldown_text} - هستنى {wait_seconds} ث...")
                            sleep(wait_seconds * 1000)
                            page.goto('https://www.project-dark.co.uk/travel', wait_until='domcontentloaded')
                            continue
                    current_city = page.evaluate("""() => {
                        let body = document.body.innerText;
                        if (body.includes('Black Market - San Francisco')) return 'San Francisco';
                        if (body.includes('Black Market - St Louis')) return 'St Louis';
                        return null;
                    }""")
                    if not current_city:
                        page.goto('https://project-dark.co.uk/travel', wait_until='domcontentloaded'); continue
                    dest_city = 'St Louis' if current_city == 'San Francisco' else 'San Francisco'
                    print(f"✈️ [التريد] {current_city} -> {dest_city}")
                    try:
                        g = page.locator("text='Grid View'").first
                        if g.count() > 0: g.click(force=True); sleep(2000)
                    except: pass
                    try:
                        c = page.locator(f"text='{dest_city}'").first
                        if c.count() > 0: c.click(force=True); sleep(2000)
                    except: pass
                    try:
                        t = page.locator("button:has-text('Travel to Selected Location')").first
                        if t.count() > 0: t.click(force=True); sleep(2000)
                    except: pass
                    try:
                        page.wait_for_selector("button:has-text('TRAVEL')", timeout=10000)
                        tv = page.locator("button:has-text('TRAVEL')").last
                        if tv.count() > 0: tv.click(force=True); sleep(7000)
                    except: pass
                    page.goto('https://www.project-dark.co.uk/blackmarket', wait_until='domcontentloaded')
                    continue

                state = page.evaluate("""(items) => {
                    let body = document.body.innerText;
                    let loc = null, cd = null, hold = 0, held = null;
                    if (body.includes('Black Market - San Francisco')) loc = 'San Francisco';
                    else if (body.includes('Black Market - St Louis')) loc = 'St Louis';
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
                                        let match = cells[2].innerText.match(/(\\d+)/);
                                        if (match && +match[1] > 0) { held = it; hold = +match[1]; break; }
                                    }
                                    break;
                                }
                            }
                        }
                    }
                    if (held === null) { let m2 = body.match(/holding (\\d+) items/i); hold = m2 ? +m2[1] : 0; }
                    return { loc, cd, hold, held };
                }""", ITEMS)

                if state['cd']: print(f"⏳ كولداون: {state['cd']}"); sleep(60000); continue

                if state['loc'] == "San Francisco":
                    if state['held'] == "Stolen paintings" and state['hold'] > 0:
                        print("📍 SF - بيع اللوحات")
                        c = page.evaluate("""() => { let rs = [...document.querySelectorAll('tr')]; for (let r of rs) { if (r.innerText.includes('Stolen paintings')) { let b = [...r.querySelectorAll('button')].find(x => x.innerText.trim() === 'Sell All'); if (b) { b.click(); return true; } } } return false; }""")
                        if c:
                            sleep(3000)
                            try:
                                cf = page.locator('button:has-text("SELL ALL")').last
                                cf.wait_for(state="visible", timeout=10000); cf.click(force=True); print("✅ بيع اللوحات!")
                            except: pass
                        sleep(3000); continue
                    if state['held'] == "Plastic jewelry" and state['hold'] > 0:
                        print("📍 SF -> ST LOUIS")
                        page.goto('https://www.project-dark.co.uk/travel', wait_until='domcontentloaded'); sleep(2500); continue
                    if state['hold'] == 0:
                        print("📍 SF - شراء بلاستيك")
                        c = page.evaluate("""() => { let rs = [...document.querySelectorAll('tr')]; for (let r of rs) { if (r.innerText.includes('Plastic jewelry')) { let b = [...r.querySelectorAll('button')].find(x => x.innerText.trim() === 'Max Buy'); if (b) { b.click(); return true; } } } return false; }""")
                        if c:
                            sleep(3000)
                            try:
                                cf = page.locator('button:has-text("BUY MAX")').last
                                cf.wait_for(state="visible", timeout=10000); cf.click(force=True); print("✅ شراء بلاستيك!")
                            except: pass
                        sleep(3000); continue

                elif state['loc'] == "St Louis":
                    if state['held'] == "Plastic jewelry" and state['hold'] > 0:
                        print("📍 STL - بيع البلاستيك")
                        c = page.evaluate("""() => { let rs = [...document.querySelectorAll('tr')]; for (let r of rs) { if (r.innerText.includes('Plastic jewelry')) { let b = [...r.querySelectorAll('button')].find(x => x.innerText.trim() === 'Sell All'); if (b) { b.click(); return true; } } } return false; }""")
                        if c:
                            sleep(3000)
                            try:
                                cf = page.locator('button:has-text("SELL ALL")').last
                                cf.wait_for(state="visible", timeout=10000); cf.click(force=True); print("✅ بيع البلاستيك!")
                            except: pass
                        sleep(3000); continue
                    if state['held'] == "Stolen paintings" and state['hold'] > 0:
                        print("📍 STL -> SF")
                        page.goto('https://www.project-dark.co.uk/travel', wait_until='domcontentloaded'); sleep(2500); continue
                    if state['hold'] == 0:
                        print("📍 STL - شراء لوحات")
                        c = page.evaluate("""() => { let rs = [...document.querySelectorAll('tr')]; for (let r of rs) { if (r.innerText.includes('Stolen paintings')) { let b = [...r.querySelectorAll('button')].find(x => x.innerText.trim() === 'Max Buy'); if (b) { b.click(); return true; } } } return false; }""")
                        if c:
                            sleep(3000)
                            try:
                                cf = page.locator('button:has-text("BUY MAX")').last
                                cf.wait_for(state="visible", timeout=10000); cf.click(force=True); print("✅ شراء لوحات!")
                            except: pass
                        sleep(3000); continue
                else:
                    sleep(5000); continue
            except Exception as e: print(f"⚠️ خطأ: {e}"); sleep(15000)
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
