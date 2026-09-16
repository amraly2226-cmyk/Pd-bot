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
# 🚗 بوت السرقة (Theft)
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
        
        while True:
            try:
                print("\n" + "="*50)
                print("🚗 [Theft] جاري الدخول لصفحة السرقة...")
                print("="*50)
                page.goto('https://project-dark.co.uk/theft', wait_until='domcontentloaded', timeout=60000)
                print("✅ [Theft] دخلنا الصفحة")
                sleep(4000)
                
                def read_state():
                    data = page.evaluate("""() => {
                        const btns = [...document.querySelectorAll('button.theft-steal-btn')].map((b, i) => {
                            const r = b.getBoundingClientRect();
                            return {
                                idx: i,
                                cx: Math.round(r.left + r.width / 2),
                                cy: Math.round(r.top + r.height / 2),
                                top: Math.round(r.top),
                                disabled: b.disabled,
                                isSuccess: b.classList.contains('game-button--success'),
                                visible: b.offsetWidth > 0
                            };
                        });
                        
                        const now_sec = Math.floor(Date.now() / 1000);
                        const timers = [...document.querySelectorAll('span.theft-cd')].map(el => {
                            const r = el.getBoundingClientRect();
                            const expires = parseInt(el.getAttribute('data-expires') || '0', 10);
                            const remaining = Math.max(0, expires - now_sec);
                            return {
                                x: Math.round(r.left + r.width / 2),
                                y: Math.round(r.top + r.height / 2),
                                remaining: remaining,
                                text: (el.textContent || '').trim()
                            };
                        });
                        
                        return {btns, timers};
                    }""")
                    
                    all_btns = data['btns']
                    timers = data['timers']
                    
                    if len(all_btns) == 0:
                        return {'cols': []}
                    
                    all_sorted = sorted(all_btns, key=lambda b: (b['cx'], b['top']))
                    columns = []
                    current = [all_sorted[0]]
                    for i in range(1, len(all_sorted)):
                        if abs(all_sorted[i]['cx'] - current[0]['cx']) < 50:
                            current.append(all_sorted[i])
                        else:
                            columns.append(current)
                            current = [all_sorted[i]]
                    columns.append(current)
                    
                    cols_info = []
                    col_names = ['Cars', 'Bikes', 'Vans']
                    
                    for col_idx, col in enumerate(columns):
                        col_sorted = sorted(col, key=lambda b: b['top'])
                        bottom_btn = col_sorted[-1]
                        col_name = col_names[col_idx] if col_idx < 3 else f'Col{col_idx+1}'
                        
                        all_available = all(b['isSuccess'] and not b['disabled'] for b in col)
                        
                        # مطابقة دقيقة: كولداون بنفس X العمود (< 100 بكسل)
                        col_timer = None
                        for t in timers:
                            if abs(t['x'] - bottom_btn['cx']) < 100:
                                col_timer = t
                                break
                        
                        # لو مفيش كولداون بنفس X → العمود جاهز
                        if col_timer is None:
                            col_available = all_available
                            col_status = "Ready (مفيش كولداون)"
                        else:
                            timer_ready = col_timer['remaining'] <= 1
                            col_available = all_available and timer_ready
                            col_status = f"{col_timer['text']} = {col_timer['remaining']}s"
                        
                        cols_info.append({
                            'name': col_name,
                            'bottom_btn': bottom_btn,
                            'available': col_available,
                            'timer': col_timer,
                            'status_text': col_status,
                            'col_cx': bottom_btn['cx']
                        })
                    
                    return {'cols': cols_info}
                
                state = read_state()
                cols_info = state['cols']
                
                if len(cols_info) == 0:
                    print("⏰ [Theft] مفيش أزرار، هستنى 30 ث...")
                    time.sleep(30)
                    continue
                
                print(f"\n📋 [Theft] حالة الأعمدة:")
                for col in cols_info:
                    status = "✅ جاهز" if col['available'] else f"⏳ كولداون ({col['status_text']})"
                    print(f"  {col['name']} (x={col['col_cx']}): آخر زر (idx={col['bottom_btn']['idx']}) - {status}")
                
                clicked_any = False
                for col in cols_info:
                    if not col['available']:
                        continue
                    
                    bottom = col['bottom_btn']
                    print(f"\n🎯 [Theft] بدوس على {col['name']} (idx={bottom['idx']})...")
                    
                    success = False
                    try:
                        loc = page.locator('button.theft-steal-btn').nth(bottom['idx'])
                        loc.scroll_into_view_if_needed()
                        sleep(300)
                        loc.click(force=True, timeout=5000)
                        print(f"✅ [Theft] Playwright click نجح")
                        success = True
                    except Exception as e:
                        print(f"⚠️ [Theft] Playwright فشل: {e}")
                    
                    if not success:
                        try:
                            page.mouse.move(bottom['cx'], bottom['cy'])
                            sleep(200)
                            page.mouse.click(bottom['cx'], bottom['cy'])
                            print(f"✅ [Theft] mouse.click نجح")
                            success = True
                        except Exception as e:
                            print(f"⚠️ [Theft] mouse فشل: {e}")
                    
                    if success:
                        clicked_any = True
                        print(f"🔄 [Theft] refresh بعد الضغط على {col['name']}...")
                        sleep(3000)
                        page.goto('https://project-dark.co.uk/theft', wait_until='domcontentloaded', timeout=60000)
                        sleep(4000)
                        break
                
                if not clicked_any:
                    cd_times = []
                    for col in cols_info:
                        if col['timer'] and col['timer']['remaining'] > 0:
                            cd_times.append((col['timer']['remaining'], col['timer']['text'], col['name']))
                    
                    if cd_times:
                        cd_times.sort()
                        min_sec, min_text, min_col = cd_times[0]
                        wait_sec = min_sec + 15
                        print(f"\n⏰ [Theft] كل الأعمدة في كولداون.")
                        print(f"   أقصر واحد: {min_col} ({min_text} = {min_sec}s)")
                        print(f"   هستنى {wait_sec} ث بالظبط...")
                        time.sleep(wait_sec)
                        page.goto('https://project-dark.co.uk/theft', wait_until='domcontentloaded', timeout=60000)
                        sleep(4000)
                    else:
                        print(f"\n⏰ [Theft] مفيش كولداون مقروء، هستنى 60 ث...")
                        time.sleep(60)
                        page.goto('https://project-dark.co.uk/theft', wait_until='domcontentloaded', timeout=60000)
                        sleep(4000)
                
                print(f"📊 [Theft] خلصنا الدورة")
                print("="*50 + "\n")
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
