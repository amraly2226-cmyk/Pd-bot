from playwright.sync_api import sync_playwright
from datetime import datetime, timedelta
import time
import re
import threading
import os
import sys

USERNAME = "amr.aly.2226@gmail.com"
PASSWORD = "Gun@12345"

# ⏰ وقت الإيقاف بتوقيت مصر (24 ساعة)
STOP_TIME = "06:00"

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
    {"name": "device_fp_d", "value": "%7B%22lang%22%3A%22en-US%22%2C%22plat%22%3A%22Linux%20armv81%22%2C%22cores%22%3A8%2C%22mem%22%3Anull%2C%22screen%22%3A%22414x920x24%22%2C%22avail%22%3A%22414x920%22%2C%22tzoff%22%3A-180%2C%22tz%22%3A%22Africa%2FCairo%22%2C%22touch%22%3A1%2C%22mtp%22%3A5%2C%22canvas%22%3A%22ed1357802482%22%7D", "domain": "project-dark.co.uk", "path": "/"},
    {"name": "_ga_JNKJRQ925S", "value": "GS2.1.s1789558989$o12$g1$t1789559027$j22$l0$h0", "domain": ".project-dark.co.uk", "path": "/"},
    {"name": "remember_web_59ba36addc2b2f9401580f014c7f58ea4e30989d", "value": "eyJpdiI6IldLaFg3N0dYN2ZkbWZINjBkV2xjdXc9PSIsInZhbHVlIjoiN2hJMEJ6dnQrYUpJb3loQml2TWJ0eUU3dXl4TjNTUWpQNkYzbmVheG9EQ2JHQ2NEaXRaQW5SWjdmL2VKRllFRDlxaVprUGd6bU9pZy9zbEpqaTZLdUpnMHNDY2tCM2YrbkcrRzRwTkhtajNITGxxdkQ5QUhzcmRGUTYxL3lKNERRbTYxdXpnSmQ0N1VaSTU2N3ZOWGNJVEZVcEI2dVFqa3FwMmpzbVlsRDlZZGwxUElNNDZycmV2Z3pTSGpkcTdITkxkcWdmS0w5Rldvb09CUUxFSE9PTDdOaEVDNWc2d3hIODBOcFdNdmRXVT0iLCJtYWMiOiI4ZWVjNmMxMWZkMjQ3NjgwNjhmYTAzMDU2MzM1ODcwZWE2ZjAzY2ZiN2RlNDI4ODU4NzhkMThiNzU5NmRmZmZmIiwidGFnIjoiIn0%3D", "domain": ".project-dark.co.uk", "path": "/"},
    {"name": "device_fp", "value": "00cad2c6896d259a5ecbceded5efe770bb8b3e5407d0d39f4e54990a5f3d9835", "domain": "project-dark.co.uk", "path": "/"},
    {"name": "_ga", "value": "GA1.1.1994605517.1787739453", "domain": ".project-dark.co.uk", "path": "/"},
    {"name": "pd_did", "value": "bf7b685500b8b651cae5e2927fa456a0", "domain": "project-dark.co.uk", "path": "/"},
    {"name": "project-dark-session", "value": "eyJpdiI6IitSbWQvWEJyRkRENE90ZmhkU0kxQ3c9PSIsInZhbHVlIjoiNnV3UG1ncmVmQTZGVHBFYWxlOFFMa2o0Zm4yV1dpbjhhVkx6U0ExdW1yb1ZsM2tTZ1dMRFUrdjEzazY5SnhaUzdadFgveG5kb3RPQzhTbUU1Y2g2SUtOb01nOEFzNnlrSElIN1llaHdvNGRJSWloMmtPOW0wZGpkMzVDcjFQeVAiLCJtYWMiOiJlZGMzNWI2NjEyMjcxZTIyZjYyYTdiN2Q0ZGVlOGYyYTVlODgzMjJhMTlkYzIwZjZkZGUzMDFhOTI0Yzg1N2JhIiwidGFnIjoiIn0%3D", "domain": ".project-dark.co.uk", "path": "/"},
    {"name": "XSRF-TOKEN", "value": "eyJpdiI6ImgrSm9FWm80azN3WUhmUTBHVjA5YUE9PSIsInZhbHVlIjoiRzg0NkMvZFplUDl5dWZEbHF6L094eVdGSFNqLzJMVzN1NjM1WlNYTU9mME5vNHp4YjdpR3VwTFVNNVIwMm9uQnZZbm5zWDlpdzVIQzlQL3NmRUpnSU8wM2lubCtMK1BjYzIzSkE3ZTkrSXhvbUYrNWUwZmY5SXF0dUFpWStHTmkiLCJtYWMiOiIzYzViZDlhYWI3ZTkwOTI0OTRjNjYwNWIwOGU3ZGI2ZjgzYzE2OTU5Y2JkZDlmN2IzMGVkMTRjNTU0NGU2ODFkIiwidGFnIjoiIn0%3D", "domain": ".project-dark.co.uk", "path": "/"}
]

ITEMS = ["Anabolic steroid","Artifacts","Alcohol","Electronics","Plastic jewelry","Stolen paintings","Human beings","Confidential documents","Endangered exotic animals","Organs"]
STOCKS_INTERVAL = 30 * 60
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
                if should_stop():
                    stop_bot()
                
                print("\n" + "="*50)
                print("📈 [الأسهم] جاري الدخول...")
                print("="*50)
                page.goto('https://project-dark.co.uk/stocks', wait_until='domcontentloaded', timeout=60000)
                print("✅ [الأسهم] دخلنا الصفحة")
                try: page.wait_for_selector('tr', timeout=20000)
                except: pass
                sleep(1500)
                
                if check_if_jailed(page):
                    print(f"🚔 [الأسهم] إحنا في السجن! هستنى {JAIL_WAIT // 60} دقايق...")
                    for _ in range(JAIL_WAIT // 60):
                        time.sleep(60)
                        if should_stop():
                            stop_bot()
                    continue
                
                print("\n🔴 [الأسهم] [1/2] بيع...")
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
                        print("🚔 [الأسهم] الصفحة اتنقلت (سجن)، هستنى...")
                        continue
                
                if check_if_jailed(page):
                    print(f"🚔 [الأسهم] دخلنا السجن بعد البيع! هستنى {JAIL_WAIT // 60} دقايق...")
                    for _ in range(JAIL_WAIT // 60):
                        time.sleep(60)
                        if should_stop():
                            stop_bot()
                    continue
                
                print("\n🟢 [الأسهم] [2/2] شراء...")
                bought_count = 0
                for attempt in range(15):
                    try:
                        if should_stop():
                            stop_bot()
                        
                        if check_if_jailed(page):
                            print(f"🚔 [الأسهم] دخلنا السجن أثناء الشراء! هستنى {JAIL_WAIT // 60} دقايق...")
                            for _ in range(JAIL_WAIT // 60):
                                time.sleep(60)
                                if should_stop():
                                    stop_bot()
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
                            print(f"⚠️ [الأسهم] مشكلة: {e}")
                            break
                    except Exception as e:
                        err = str(e)
                        if 'Execution context was destroyed' in err or 'navigation' in err.lower():
                            print("🚔 [الأسهم] الصفحة اتنقلت، هستنى...")
                            break
                        print(f"⚠️ [الأسهم] مشكلة: {e}")
                        break
                
                if bought_count == 0: print("ℹ️ [الأسهم] مفيش أسهم خضراء")
                print(f"📊 [الأسهم] خلصنا: {bought_count} سهم")
                print("="*50 + "\n")
            except Exception as e: 
                err = str(e)
                if 'Execution context was destroyed' in err or 'navigation' in err.lower():
                    print("🚔 [الأسهم] الصفحة اتنقلت (سجن)، هستنى ثانية...")
                    sleep(3)
                    continue
