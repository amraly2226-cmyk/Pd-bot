from playwright.sync_api import sync_playwright
from datetime import datetime, timedelta
import time
import re
import os
import sys

USERNAME = "amr.aly.2226@gmail.com"
PASSWORD = "Gun@12345"

# ⏰ وقت الإيقاف بتوقيت مصر (24 ساعة)
STOP_TIME = "03:00"

def calculate_stop_datetime():
    if not STOP_TIME:
        return None
    now = datetime.now()
    hour, minute = map(int, STOP_TIME.split(':'))
    target = now.replace(hour=hour, minute=minute, second=0, microsecond=0)
    if now >= target:
        target += timedelta(days=1)
    return target

STOP_DATETIME = calculate_stop_datetime()

COOKIES = [
    {
        "name": "device_fp_d",
        "value": "%7B%22lang%22%3A%22en-US%22%2C%22plat%22%3A%22Linux%20armv81%22%2C%22cores%22%3A8%2C%22mem%22%3Anull%2C%22screen%22%3A%22414x920x24%22%2C%22avail%22%3A%22414x920%22%2C%22tzoff%22%3A-180%2C%22tz%22%3A%22Africa%2FCairo%22%2C%22touch%22%3A1%2C%22mtp%22%3A5%2C%22canvas%22%3A%22ed1357802482%22%7D",
        "domain": "project-dark.co.uk",
        "path": "/",
        "secure": False,
        "httpOnly": False,
        "sameSite": "Lax",
    },
    {
        "name": "_ga_JNKJRQ925S",
        "value": "GS2.1.s1789558989$o12$g1$t1789559027$j22$l0$h0",
        "domain": ".project-dark.co.uk",
        "path": "/",
        "secure": False,
        "httpOnly": False,
        "sameSite": "Lax",
    },
    {
        "name": "remember_web_59ba36addc2b2f9401580f014c7f58ea4e30989d",
        "value": "eyJpdiI6IldLaFg3N0dYN2ZkbWZINjBkV2xjdXc9PSIsInZhbHVlIjoiN2hJMEJ6dnQrYUpJb3loQml2TWJ0eUU3dXl4TjNTUWpQNkYzbmVheG9EQ2JHQ2NEaXRaQW5SWjdmL2VKRllFRDlxaVprUGd6bU9pZy9zbEpqaTZLdUpnMHNDY2tCM2YrbkcrRzRwTkhtajNITGxxdkQ5QUhzcmRGUTYxL3lKNERRbTYxdXpnSmQ0N1VaSTU2N3ZOWGNJVEZVcEI2dVFqa3FwMmpzbVlsRDlZZGwxUElNNDZycmV2Z3pTSGpkcTdITkxkcWdmS0w5Rldvb09CUUxFSE9PTDdOaEVDNWc2d3hIODBOcFdNdmRXVT0iLCJtYWMiOiI4ZWVjNmMxMWZkMjQ3NjgwNjhmYTAzMDU2MzM1ODcwZWE2ZjAzY2ZiN2RlNDI4ODU4NzhkMThiNzU5NmRmZmZmIiwidGFnIjoiIn0%3D",
        "domain": ".project-dark.co.uk",
        "path": "/",
        "secure": True,
        "httpOnly": True,
        "sameSite": "Lax",
    },
    {
        "name": "device_fp",
        "value": "00cad2c6896d259a5ecbceded5efe770bb8b3e5407d0d39f4e54990a5f3d9835",
        "domain": "project-dark.co.uk",
        "path": "/",
        "secure": False,
        "httpOnly": False,
        "sameSite": "Lax",
    },
    {
        "name": "_ga",
        "value": "GA1.1.1994605517.1787739453",
        "domain": ".project-dark.co.uk",
        "path": "/",
        "secure": False,
        "httpOnly": False,
        "sameSite": "Lax",
    },
    {
        "name": "pd_did",
        "value": "bf7b685500b8b651cae5e2927fa456a0",
        "domain": "project-dark.co.uk",
        "path": "/",
        "secure": False,
        "httpOnly": False,
        "sameSite": "Lax",
    },
    {
        "name": "project-dark-session",
        "value": "eyJpdiI6IjVXTGdQM2VMRi9qRmVCdno1M0pvMVE9PSIsInZhbHVlIjoiSkU2NXVxTEJQSEI1ekNnZ2V5Y1hIclhRNUdsR25Gd09Id1ZaS2ZWeWhSUENEeC9NQm10MFhmWGlWb2hLYTVmNkpLRkVMZHlZbW80ZWlDZ1A5cS9HNktDOVRnaTF5YldZektFUnlvRjh6cTFDM3lLelc4Y0V3WTFPMERNUVBrRjMiLCJtYWMiOiIyZDc2ODU4ZThiMjMxZDNkMjA0NTUxOGRjZDFmMzlhNDE1NmY0ZTM2NTA2NDYzZjE5Nzc3NmE5MTM5ZDJlYWEzIiwidGFnIjoiIn0%3D",
        "domain": ".project-dark.co.uk",
        "path": "/",
        "secure": True,
        "httpOnly": True,
        "sameSite": "Lax",
    },
    {
        "name": "XSRF-TOKEN",
        "value": "eyJpdiI6InhOYy9ZcDhPc0ZEYTZqVG16WGtVN3c9PSIsInZhbHVlIjoidVJ6S1RxTlFOMFBxRkNoS1loSGlhOEQvek1EcDVnTVI5Z0NhRDNTeVphNHhLU0ZzTXZKZ3ZVaTlrK3RGSjZqTERqVEFFUmEyU2Erd0lrT2ViUndERFE1OGwvYUxvSGZIVXcwT1JHVWFYVW5TVVZINkdja0FLQ2hkRTJuVFZZMXkiLCJtYWMiOiI2NWFiZDg1N2U5MzgzZGU1Njg1NTUwMGY0MGI1MzFlNzZlM2M3NWEwNzM3OWNmMDA4M2I4MGQ2ZDY4ZTMyNzNiIiwidGFnIjoiIn0%3D",
        "domain": ".project-dark.co.uk",
        "path": "/",
        "secure": True,
        "httpOnly": False,
        "sameSite": "Lax",
    },
]

ITEMS = ["Anabolic steroid","Artifacts","Alcohol","Electronics","Plastic jewelry","Stolen paintings","Human beings","Confidential documents","Endangered exotic animals","Organs"]
JAIL_WAIT = 5 * 60

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

def check_if_jailed(page):
    try:
        return '/jail' in page.url.lower()
    except:
        return False

def should_stop():
    if not STOP_DATETIME:
        return False
    return datetime.now() >= STOP_DATETIME

def stop_bot():
    print(f"\n🛑 وصلنا للوقت المحدد ({STOP_TIME}) - بيقفل البرنامج...")
    print("💤 هنام كويس، باي باي! 👋")
    sys.stdout.flush()
    time.sleep(2)
    os._exit(0)


# ═══════════════════════════════════════════════════════════════
# 📈 دورة أسهم واحدة (تتنادى بعد السفر فقط)
# ═══════════════════════════════════════════════════════════════

def do_stocks_cycle(page, quiet_wait):
    print("\n" + "="*50)
    print("📈 [الأسهم] دورة بعد السفر...")
    print("="*50)

    try:
        page.goto('https://project-dark.co.uk/stocks', wait_until='domcontentloaded', timeout=60000)
        print("✅ [الأسهم] دخلنا الصفحة")
        try: page.wait_for_selector('tr', timeout=20000)
        except: pass
        sleep(1500)

        if check_if_jailed(page):
            print(f"🚔 [الأسهم] سجن! هستنى {JAIL_WAIT // 60} دقايق...")
            quiet_wait(JAIL_WAIT, "سجن")
            return

        # ─── بيع الكل ───
        print("🔴 [الأسهم] بيع...")
        try:
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
        except Exception as e:
            err = str(e)
            if 'Execution context was destroyed' in err or 'navigation' in err.lower():
                print("🚔 [الأسهم] الصفحة اتنقلت")
                return

        if check_if_jailed(page):
            print(f"🚔 [الأسهم] سجن بعد البيع! هستنى {JAIL_WAIT // 60} دقايق...")
            quiet_wait(JAIL_WAIT, "سجن")
            return

        # ─── شراء الأخضر ───
        print("🟢 [الأسهم] شراء...")
        bought_count = 0
        for attempt in range(15):
            try:
                if should_stop():
                    stop_bot()

                if check_if_jailed(page):
                    print(f"🚔 [الأسهم] سجن أثناء الشراء! هستنى {JAIL_WAIT // 60} دقايق...")
                    quiet_wait(JAIL_WAIT, "سجن")
                    break

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
                    print(f"ℹ️ [الأسهم] مفيش تأكيد (يمكن مفيش فلوس)")
                    break
            except Exception as e:
                err = str(e)
                if 'Execution context was destroyed' in err or 'navigation' in err.lower():
                    print("🚔 [الأسهم] الصفحة اتنقلت")
                    break
                print(f"⚠️ [الأسهم] مشكلة: {e}")
                break

        if bought_count == 0:
            print("ℹ️ [الأسهم] مفيش أسهم خضراء")
        print(f"📊 [الأسهم] خلصنا: {bought_count} سهم")
        print("="*50 + "\n")

    except Exception as e:
        err = str(e)
        if 'Execution context was destroyed' in err or 'navigation' in err.lower():
            print("🚔 [الأسهم] الصفحة اتنقلت")
            return
        print(f"⚠️ [الأسهم] خطأ: {e}")


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

        def quiet_wait(seconds, reason=""):
            """ينتظر على about:blank مع keep-alive كل 20 ثانية"""
            try:
                page.goto('about:blank')
            except: pass
            if reason:
                mins = int(seconds // 60)
                secs = int(seconds % 60)
                print(f"⏳ [التريد] {reason} — هستنى {mins}د {secs}ث على صفحة فاضية...")

            elapsed = 0
            last_ping = 0
            while elapsed < int(seconds):
                time.sleep(1)
                elapsed += 1
                if should_stop():
                    stop_bot()
                # ✅ keep-alive كل 20 ثانية
                if elapsed - last_ping >= 20:
                    try:
                        page.evaluate("1 + 1")
                        last_ping = elapsed
                    except Exception as e:
                        print(f"⚠️ [keep-alive]: {e}")
                        last_ping = elapsed

        try:
            page.goto('https://www.project-dark.co.uk/blackmarket', wait_until='domcontentloaded', timeout=60000)
            print("✅ [التريد] دخلنا")
        except Exception as e: print(f"⚠️ مشكلة: {e}")

        while True:
            try:
                if should_stop():
                    stop_bot()

                if check_if_jailed(page):
                    print(f"🚔 [التريد] سجن! هستنى {JAIL_WAIT // 60} دقايق...")
                    quiet_wait(JAIL_WAIT, "سجن")
                    try:
                        page.goto('https://www.project-dark.co.uk/blackmarket', wait_until='domcontentloaded')
                    except: pass
                    continue

                # ─── صفحة السفر ───
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
                            quiet_wait(ws, f"كولداون سفر: {cooldown_text}")
                            print("✅ [التريد] العداد خلص، راجع لصفحة السفر...")
                            try:
                                page.goto('https://www.project-dark.co.uk/travel', wait_until='domcontentloaded', timeout=30000)
                            except Exception as e:
                                print(f"⚠️ [التريد] مشكلة الرجوع: {e}")
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
                        quiet_wait(30, "مش لاقي المكان")
                        continue

                    dc = 'St Louis' if cc == 'San Francisco' else 'San Francisco'
                    print(f"✈️ [التريد] {cc} -> {dc}")

                    try:
                        g = page.locator("text='Grid View'").first
                        if g.count() > 0:
                            g.click(force=True)
                            sleep(2000)
                    except: pass

                    try:
                        c = page.locator(f"text='{dc}'").first
                        if c.count() > 0:
                            c.click(force=True)
                            sleep(2000)
                    except: pass

                    try:
                        t = page.locator("button:has-text('Travel to Selected Location')").first
                        if t.count() > 0:
                            t.click(force=True)
                            sleep(2500)
                    except: pass

                    travel_done = False
                    try:
                        page.wait_for_selector("button:has-text('TRAVEL')", timeout=10000)
                        tv = page.locator("button:has-text('TRAVEL')").last
                        if tv.count() > 0:
                            tv.click(force=True)
                            print(f"🎉 [التريد] تم السفر إلى {dc}!")
                            sleep(7000)
                            travel_done = True
                    except: pass

                    if travel_done:
                        do_stocks_cycle(page, quiet_wait)

                    page.goto('https://www.project-dark.co.uk/blackmarket', wait_until='domcontentloaded')
                    sleep(3000)
                    continue

                # ─── صفحة البلاك ماركت ───
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
                    quiet_wait(60, "كولداون سوق")
                    continue

                if state['loc'] == "San Francisco":
                    if state['held'] == "Stolen paintings" and state['hold'] > 0:
                        print("📍 [التريد] SF - بيع اللوحات")
                        try:
                            page.evaluate("""() => { let rs = [...document.querySelectorAll('tr')]; for (let r of rs) { if (r.innerText.includes('Stolen paintings')) { let b = [...r.querySelectorAll('button')].find(x => x.innerText.trim() === 'Sell All'); if (b) { b.click(); return true; } } } return false; }""")
                            sleep(3000)
                            cf = page.locator('button:has-text("SELL ALL")').last
                            cf.wait_for(state="visible", timeout=10000)
                            cf.click(force=True)
                            print("✅ [التريد] بيع اللوحات!")
                        except Exception as e:
                            print(f"⚠️ [التريد] {e}")
                        sleep(3000)
                        continue
                    if state['held'] == "Plastic jewelry" and state['hold'] > 0:
                        print("📍 [التريد] SF -> STL (سفر)")
                        page.goto('https://www.project-dark.co.uk/travel', wait_until='domcontentloaded')
                        sleep(4000)
                        continue
                    if state['hold'] == 0:
                        print("📍 [التريد] SF - شراء بلاستيك")
                        try:
                            page.evaluate("""() => { let rs = [...document.querySelectorAll('tr')]; for (let r of rs) { if (r.innerText.includes('Plastic jewelry')) { let b = [...r.querySelectorAll('button')].find(x => x.innerText.trim() === 'Max Buy'); if (b) { b.click(); return true; } } } return false; }""")
                            sleep(3000)
                            cf = page.locator('button:has-text("BUY MAX")').last
                            cf.wait_for(state="visible", timeout=10000)
                            cf.click(force=True)
                            print("✅ [التريد] شراء بلاستيك!")
                        except Exception as e:
                            print(f"⚠️ [التريد] {e}")
                            if check_if_jailed(page):
                                print("🚔 [التريد] سجن أثناء الشراء!")
                                quiet_wait(JAIL_WAIT, "سجن")
                        sleep(3000)
                        continue

                elif state['loc'] == "St Louis":
                    if state['held'] == "Plastic jewelry" and state['hold'] > 0:
                        print("📍 [التريد] STL - بيع البلاستيك")
                        try:
                            page.evaluate("""() => { let rs = [...document.querySelectorAll('tr')]; for (let r of rs) { if (r.innerText.includes('Plastic jewelry')) { let b = [...r.querySelectorAll('button')].find(x => x.innerText.trim() === 'Sell All'); if (b) { b.click(); return true; } } } return false; }""")
                            sleep(3000)
                            cf = page.locator('button:has-text("SELL ALL")').last
                            cf.wait_for(state="visible", timeout=10000)
                            cf.click(force=True)
                            print("✅ [التريد] بيع البلاستيك!")
                        except Exception as e:
                            print(f"⚠️ [التريد] {e}")
                        sleep(3000)
                        continue
                    if state['held'] == "Stolen paintings" and state['hold'] > 0:
                        print("📍 [التريد] STL -> SF (سفر)")
                        page.goto('https://www.project-dark.co.uk/travel', wait_until='domcontentloaded')
                        sleep(4000)
                        continue
                    if state['hold'] == 0:
                        print("📍 [التريد] STL - شراء لوحات")
                        try:
                            page.evaluate("""() => { let rs = [...document.querySelectorAll('tr')]; for (let r of rs) { if (r.innerText.includes('Stolen paintings')) { let b = [...r.querySelectorAll('button')].find(x => x.innerText.trim() === 'Max Buy'); if (b) { b.click(); return true; } } } return false; }""")
                            sleep(3000)
                            cf = page.locator('button:has-text("BUY MAX")').last
                            cf.wait_for(state="visible", timeout=10000)
                            cf.click(force=True)
                            print("✅ [التريد] شراء لوحات!")
                        except Exception as e:
                            print(f"⚠️ [التريد] {e}")
                            if check_if_jailed(page):
                                print("🚔 [التريد] سجن أثناء الشراء!")
                                quiet_wait(JAIL_WAIT, "سجن")
                        sleep(3000)
                        continue
                else:
                    quiet_wait(60, "مش لاقي المكان")
                    continue
            except Exception as e:
                err = str(e)
                if 'Execution context was destroyed' in err or 'navigation' in err.lower():
                    print("🚔 [التريد] الصفحة اتنقلت، هستنى...")
                    sleep(3)
                    continue
                print(f"⚠️ [التريد] خطأ: {e}")
                quiet_wait(15, "خطأ مؤقت")


# ═══════════════════════════════════════════════════════════════
# 🚀 التشغيل
# ═══════════════════════════════════════════════════════════════

if __name__ == "__main__":
    print("🚀🚀🚀 تشغيل سكريبت نمبر وان...")
    if STOP_DATETIME:
        print(f"⏰ وقت الإيقاف: {STOP_DATETIME.strftime('%Y-%m-%d %H:%M')} (بتوقيت مصر)")
    else:
        print("⏰ بدون إيقاف")
    print("="*60)
    run_trade_bot()
