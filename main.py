from playwright.sync_api import sync_playwright
import time
import re
import threading

USERNAME = "amr.aly.2226@gmail.com"
PASSWORD = "Gun@12345"

COOKIES = [
    {"name": "device_fp_d", "value": "%7B%22lang%22%3A%22en-US%22%2C%22plat%22%3A%22Linux%20armv81%22%2C%22cores%22%3A8%2C%22mem%22%3Anull%2C%22screen%22%3A%22414x920x24%22%2C%22avail%22%3A%22414x920%22%2C%22tzoff%22%3A-180%2C%22tz%22%3A%22Africa%2FCairo%22%2C%22touch%22%3A1%2C%22mtp%22%3A5%2C%22canvas%22%3A%22ed1357802482%22%7D", "domain": "project-dark.co.uk", "path": "/"},
    {"name": "_ga_JNKJRQ925S", "value": "GS2.1.s1789511161$o11$g1$t1789511179$j42$l0$h0", "domain": ".project-dark.co.uk", "path": "/"},
    {"name": "remember_web_59ba36addc2b2f9401580f014c7f58ea4e30989d", "value": "eyJpdiI6IldLaFg3N0dYN2ZkbWZINjBkV2xjdXc9PSIsInZhbHVlIjoiN2hJMEJ6dnQrYUpJb3loQml2TWJ0eUU3dXl4TjNTUWpQNkYzbmVheG9EQ2JHQ2NEaXRaQW5SWjdmL2VKRllFRDlxaVprUGd6bU9pZy9zbEpqaTZLdUpnMHNDY2tCM2YrbkcrRzRwTkhtajNITGxxdkQ5QUhzcmRGUTYxL3lKNERRbTYxdXpnSmQ0N1VaSTU2N3ZOWGNJVEZVcEI2dVFqa3FwMmpzbVlsRDlZZGwxUElNNDZycmV2Z3pTSGpkcTdITkxkcWdmS0w5Rldvb09CUUxFSE9PTDdOaEVDNWc2d3hIODBOcFdNdmRXVT0iLCJtYWMiOiI4ZWVjNmMxMWZkMjQ3NjgwNjhmYTAzMDU2MzM1ODcwZWE2ZjAzY2ZiN2RlNDI4ODU4NzhkMThiNzU5NmRmZmZmIiwidGFnIjoiIn0%3D", "domain": ".project-dark.co.uk", "path": "/"},
    {"name": "device_fp", "value": "00cad2c6896d259a5ecbceded5efe770bb8b3e5407d0d39f4e54990a5f3d9835", "domain": "project-dark.co.uk", "path": "/"},
    {"name": "_ga", "value": "GA1.1.1994605517.1787739453", "domain": ".project-dark.co.uk", "path": "/"},
    {"name": "project-dark-session", "value": "eyJpdiI6IkUySy9XdU1DUlAwVmtNZCt4R0IxYmc9PSIsInZhbHVlIjoiZ1BnamxYUDY2c3MwT0x3YnVnS1pkVW1tbzNoSVd6ZkVFa0Z3ck4wRVphV2hRdUtWL1g5bXB2YVVkNkJOdmtuenFFSXdoLzRRSFdHb1c0ZkxONmZpWXl2cVV0N0FZOTF0V2hmazlQUk5MOEFnbFhaaGpBbyt4WjNKM3I4UTlMMmYiLCJtYWMiOiJlMmJmNWY2MmMyNjRlMWI4NjhhYmMzZWNlODhiZjRhYmU0MmNjNTlhYmMzYjA1NjkyN2FhZjExNjg1NWNmOTg0IiwidGFnIjoiIn0%3D", "domain": ".project-dark.co.uk", "path": "/"},
    {"name": "XSRF-TOKEN", "value": "eyJpdiI6IkhXeGhVVExPaGV5OHVmWFN1RGZXVUE9PSIsInZhbHVlIjoiSjR3cjNSQ1JzMGVZa0dSMHlPSG40RVBSRnA2VHJ1N0M1TzlIaWE4Z0EvNGM3TmtvbEhCV2w2cDVWRUxYekR2VUhubnlicVhoQzZrNkJvQ2JmY1FTb1BtcnNkVTQxWjlTQlBOTFRlWHBSUTZ4enZqQkpyUU1PTWxaNkI3RERXQjAiLCJtYWMiOiIxN2ZhNzgxZGJkOGE0YTg3MGYzOTQ4ODM1MTIxNTA4MDU5MmE1NTkzMjI2MTQ2NGExYmM0ZGUzNzAzMTAzYmJiIiwidGFnIjoiIn0%3D", "domain": ".project-dark.co.uk", "path": "/"}
]

ITEMS = ["Anabolic steroid","Artifacts","Alcohol","Electronics","Plastic jewelry","Stolen paintings","Human beings","Confidential documents","Endangered exotic animals","Organs"]
STOCKS_INTERVAL = 30 * 60

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
# 🚗 بوت السرقة (Theft) - بيستنى Ready والزر الأخضر
# ═══════════════════════════════════════════════════════════════

def run_theft_bot():
    print("🚗 [Theft] بدأ التشغيل...")
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True, args=['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu'])
        context = browser.new_context(user_agent="Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Mobile Safari/537.36", viewport={"width": 1920, "height": 1080})
        context.add_cookies(COOKIES)
        page = context.new_page()
        page.set_default_timeout(15000)
        time.sleep(5)
        
        try:
            page.goto('https://project-dark.co.uk/theft', wait_until='domcontentloaded', timeout=60000)
            print("✅ [Theft] دخلنا الصفحة")
        except Exception as e:
            print(f"❌ [Theft] فشل الدخول: {e}")
            return
        
        while True:
            try:
                data = page.evaluate("""() => {
                    const btns = [...document.querySelectorAll('button.theft-steal-btn')].map((b, i) => {
                        const r = b.getBoundingClientRect();
                        return {
                            idx: i,
                            cx: Math.round(r.left + r.width / 2),
                            cy: Math.round(r.top + r.height / 2),
                            top: Math.round(r.top),
                            isSuccess: b.classList.contains('game-button--success'),
                            disabled: b.disabled,
                            visible: b.offsetWidth > 0 && b.offsetHeight > 0
                        };
                    }).filter(b => b.visible);
                    
                    const readies = [];
                    const seen = new Set();
                    document.querySelectorAll('*').forEach(el => {
                        if (el.children.length === 0 && !seen.has(el)) {
                            const t = (el.textContent || '').trim();
                            if (t === 'Ready' && el.offsetWidth > 0 && el.offsetHeight > 0) {
                                const r = el.getBoundingClientRect();
                                readies.push({
                                    x: Math.round(r.left + r.width / 2),
                                    y: Math.round(r.top + r.height / 2)
                                });
                                seen.add(el);
                            }
                        }
                    });
                    
                    return {btns, readies};
                }""")
                
                steal_btns = data['btns']
                readies = data['readies']
                
                if len(steal_btns) == 0:
                    time.sleep(3)
                    try: page.reload(wait_until='domcontentloaded', timeout=30000)
                    except: pass
                    continue
                
                if len(readies) == 0:
                    time.sleep(3)
                    continue
                
                all_sorted = sorted(steal_btns, key=lambda b: (b['cx'], b['top']))
                columns = []
                current = [all_sorted[0]]
                for i in range(1, len(all_sorted)):
                    if abs(all_sorted[i]['cx'] - current[0]['cx']) < 50:
                        current.append(all_sorted[i])
                    else:
                        columns.append(current)
                        current = [all_sorted[i]]
                columns.append(current)
                
                col_names = ['Cars', 'Bikes', 'Vans']
                clicked_any = False
                
                for ready in readies:
                    col_btns = [b for b in steal_btns if abs(b['cx'] - ready['x']) < 100]
                    if not col_btns:
                        continue
                    
                    col_btns.sort(key=lambda b: b['top'])
                    bottom_btn = col_btns[-1]
                    
                    if not (bottom_btn['isSuccess'] and not bottom_btn['disabled']):
                        continue
                    
                    col_idx = 0
                    for ci, col in enumerate(columns):
                        if bottom_btn in col:
                            col_idx = ci
                            break
                    col_name = col_names[col_idx] if col_idx < len(col_names) else f'Col{col_idx+1}'
                    
                    print(f"🎯 [Theft] {col_name} جاهز - بدوس على آخر زر Steal...")
                    
                    success = False
                    try:
                        loc = page.locator('button.theft-steal-btn').nth(bottom_btn['idx'])
                        loc.scroll_into_view_if_needed()
                        sleep(500)
                        loc.click(timeout=5000)
                        print(f"✅ [Theft] Playwright click - {col_name}")
                        success = True
                    except Exception as e1:
                        pass
                    
                    if not success:
                        try:
                            loc = page.locator('button.theft-steal-btn').nth(bottom_btn['idx'])
                            loc.click(force=True, timeout=5000)
                            print(f"✅ [Theft] Playwright force - {col_name}")
                            success = True
                        except:
                            pass
                    
                    if not success:
                        try:
                            page.mouse.move(bottom_btn['cx'], bottom_btn['cy'])
                            sleep(300)
                            page.mouse.click(bottom_btn['cx'], bottom_btn['cy'])
                            print(f"✅ [Theft] mouse.click - {col_name}")
                            success = True
                        except:
                            pass
                    
                    if success:
                        clicked_any = True
                        sleep(3)
                        try: page.reload(wait_until='domcontentloaded', timeout=30000)
                        except: pass
                        sleep(3)
                        break
                
                if not clicked_any:
                    time.sleep(3)
                
            except Exception as e:
                print(f"⚠️ [Theft] خطأ: {e}")
                time.sleep(15)


# ═══════════════════════════════════════════════════════════════
# 📈 بوت الأسهم
# ═══════════════════════════════════════════════════════════════

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
                print("📈 [الأسهم] جاري الدخول...")
                print("="*50)
                page.goto('https://project-dark.co.uk/stocks', wait_until='domcontentloaded', timeout=60000)
                print("✅ [الأسهم] دخلنا الصفحة")
                try: page.wait_for_selector('tr', timeout=20000)
                except: pass
                sleep(1500)
                
                print("\n🔴 [الأسهم] [1/2] بيع...")
                page.evaluate("""() => {
                    const btns = [...document.querySelectorAll('button')];
                    for (let i = btns.length - 1; i >= 0; i--) {
                        const t = (btns[i].textContent || '').trim();
                        if (t === 'Sell All' && btns[i].offsetWidth > 0 && !btns[i].closest('tr')) {
                            btns[i].click();
                            return true;
                        }
                    }
                    return false;
                }""")
                print("✅ [الأسهم] داس على Sell All")
                sleep(3000)
                try:
                    cf = page.locator('button:has-text("SELL ALL")').last
                    cf.wait_for(state="visible", timeout=10000)
                    cf.click(force=True, timeout=10000)
                    print("✅ [الأسهم] تم البيع!")
                    sleep(7000)
                except Exception as e:
                    print(f"⚠️ [الأسهم] مشكلة البيع: {e}")
                
                print("\n🟢 [الأسهم] [2/2] شراء...")
                bought_count = 0
                for attempt in range(15):
                    try:
                        found_green = False
                        rows = page.locator('tr')
                        for i in range(rows.count()):
                            try:
                                row = rows.nth(i)
                                row_text = row.inner_text()
                                if ('↑' in row_text or '▲' in row_text):
                                    c = page.evaluate("""(idx) => {
                                        const rows = [...document.querySelectorAll('tr')];
                                        const row = rows[idx];
                                        if (!row) return false;
                                        const btns = [...row.querySelectorAll('button')];
                                        for (let b of btns) {
                                            if ((b.textContent || '').trim() === 'Max Buy') {
                                                b.click();
                                                return true;
                                            }
                                        }
                                        return false;
                                    }""", i)
                                    if c:
                                        found_green = True
                                        break
                            except: continue
                        
                        if not found_green: break
                        
                        bought_count += 1
                        print(f"✅ [الأسهم] سهم أخضر {bought_count}")
                        sleep(3500)
                        try:
                            cf = page.locator('button:has-text("BUY MAX")').last
                            cf.wait_for(state="visible", timeout=10000)
                            cf.click(force=True, timeout=10000)
                            print(f"✅ [الأسهم] تم شراء السهم {bought_count}")
                            sleep(5000)
                        except Exception as e:
                            print(f"⚠️ [الأسهم] مشكلة: {e}")
                            break
                    except Exception as e:
                        print(f"⚠️ [الأسهم] مشكلة: {e}")
                        break
                
                if bought_count == 0: print("ℹ️ [الأسهم] مفيش أسهم خضراء")
                print(f"📊 [الأسهم] خلصنا: {bought_count} سهم")
                print("="*50 + "\n")
            except Exception as e: print(f"⚠️ خطأ: {e}")
            
            print(f"⏰ [الأسهم] هستنى 30 دقيقة...")
            time.sleep(STOCKS_INTERVAL)


# ═══════════════════════════════════════════════════════════════
# 🌐 بوت التريد
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
                            time.sleep(ws)
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
    print("🚀🚀🚀 تشغيل 3 بوتات (تريد + أسهم + سرقة)...")
    print("="*60)
    t1 = threading.Thread(target=run_trade_bot, daemon=True, name="TradeBot")
    t2 = threading.Thread(target=run_stocks_bot, daemon=True, name="StocksBot")
    t3 = threading.Thread(target=run_theft_bot, daemon=True, name="TheftBot")
    t1.start(); t2.start(); t3.start()
    print("✅ التريد:", t1.name)
    print("✅ الأسهم:", t2.name)
    print("✅ السرقة:", t3.name)
    print("="*60)
    try:
        while True: time.sleep(60)
    except KeyboardInterrupt: print("\n🛑 إيقاف.")
