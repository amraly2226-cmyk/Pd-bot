from playwright.sync_api import sync_playwright
from datetime import datetime, timedelta
import time
import os
import sys

# ⏰ وقت الإيقاف بتوقيت مصر (24 ساعة)
# خليها "" لو عايز البوت يشتغل للأبد بدون إيقاف
STOP_TIME = "03:39"  # 3 الفجر

# ⏰ حساب الوقت المستهدف للـ STOP_TIME
def calculate_stop_datetime():
    if not STOP_TIME:
        return None
    now = datetime.now()
    hour, minute = map(int, STOP_TIME.split(':'))
    target = now.replace(hour=hour, minute=minute, second=0, microsecond=0)
    # لو الوقت المستهدف عدى النهاردة → نخليه بكرة
    if now >= target:
        target += timedelta(days=1)
    return target

STOP_DATETIME = calculate_stop_datetime()

COOKIES = [
    {"name": "device_fp_d", "value": "%7B%22lang%22%3A%22en-US%22%2C%22plat%22%3A%22Linux%20armv81%22%2C%22cores%22%3A8%2C%22mem%22%3Anull%2C%22screen%22%3A%22414x920x24%22%2C%22avail%22%3A%22414x920%22%2C%22tzoff%22%3A-180%2C%22tz%22%3A%22Africa%2FCairo%22%2C%22touch%22%3A1%2C%22mtp%22%3A5%2C%22canvas%22%3A%22ed1357802482%22%7D", "domain": "project-dark.co.uk", "path": "/"},
    {"name": "_ga_JNKJRQ925S", "value": "GS2.1.s1789511161$o11$g1$t1789511179$j42$l0$h0", "domain": ".project-dark.co.uk", "path": "/"},
    {"name": "remember_web_59ba36addc2b2f9401580f014c7f58ea4e30989d", "value": "eyJpdiI6IldLaFg3N0dYN2ZkbWZINjBkV2xjdXc9PSIsInZhbHVlIjoiN2hJMEJ6dnQrYUpJb3loQml2TWJ0eUU3dXl4TjNTUWpQNkYzbmVheG9EQ2JHQ2NEaXRaQW5SWjdmL2VKRllFRDlxaVprUGd6bU9pZy9zbEpqaTZLdUpnMHNDY2tCM2YrbkcrRzRwTkhtajNITGxxdkQ5QUhzcmRGUTYxL3lKNERRbTYxdXpnSmQ0N1VaSTU2N3ZOWGNJVEZVcEI2dVFqa3FwMmpzbVlsRDlZZGwxUElNNDZycmV2Z3pTSGpkcTdITkxkcWdmS0w5Rldvb09CUUxFSE9PTDdOaEVDNWc2d3hIODBOcFdNdmRXVT0iLCJtYWMiOiI4ZWVjNmMxMWZkMjQ3NjgwNjhmYTAzMDU2MzM1ODcwZWE2ZjAzY2ZiN2RlNDI4ODU4NzhkMThiNzU5NmRmZmZmIiwidGFnIjoiIn0%3D", "domain": ".project-dark.co.uk", "path": "/"},
    {"name": "device_fp", "value": "00cad2c6896d259a5ecbceded5efe770bb8b3e5407d0d39f4e54990a5f3d9835", "domain": "project-dark.co.uk", "path": "/"},
    {"name": "_ga", "value": "GA1.1.1994605517.1787739453", "domain": ".project-dark.co.uk", "path": "/"},
    {"name": "project-dark-session", "value": "eyJpdiI6IkUySy9XdU1DUlAwVmtNZCt4R0IxYmc9PSIsInZhbHVlIjoiZ1BnamxYUDY2c3MwT0x3YnVnS1pkVW1tbzNoSVd6ZkVFa0Z3ck4wRVphV2hRdUtWL1g5bXB2YVVkNkJOdmtuenFFSXdoLzRRSFdHb1c0ZkxONmZpWXl2cVV0N0FZOTF0V2hmazlQUk5MOEFnbFhaaGpBbyt4WjNKM3I4UTlMMmYiLCJtYWMiOiJlMmJmNWY2MmMyNjRlMWI4NjhhYmMzZWNlODhiZjRhYmU0MmNjNTlhYmMzYjA1NjkyN2FhZjExNjg1NWNmOTg0IiwidGFnIjoiIn0%3D", "domain": ".project-dark.co.uk", "path": "/"},
    {"name": "XSRF-TOKEN", "value": "eyJpdiI6IkhXeGhVVExPaGV5OHVmWFN1RGZXVUE9PSIsInZhbHVlIjoiSjR3cjNSQ1JzMGVZa0dSMHlPSG40RVBSRnA2VHJ1N0M1TzlIaWE4Z0EvNGM3TmtvbEhCV2w2cDVWRUxYekR2VUhubnlicVhoQzZrNkJvQ2JmY1FTb1BtcnNkVTQxWjlTQlBOTFRlWHBSUTZ4enZqQkpyUU1PTWxaNkI3RERXQjAiLCJtYWMiOiIxN2ZhNzgxZGJkOGE0YTg3MGYzOTQ4ODM1MTIxNTA4MDU5MmE1NTkzMjI2MTQ2NGExYmM0ZGUzNzAzMTAzYmJiIiwidGFnIjoiIn0%3D", "domain": ".project-dark.co.uk", "path": "/"}
]

def sleep(ms): time.sleep(ms / 1000.0)


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


def check_if_jailed(page):
    try:
        return '/jail' in page.url.lower()
    except:
        return False


def run_session():
    SESSION_MAX = 90 * 60
    JAIL_WAIT = 5 * 60
    session_start = time.time()
    
    print("🚗 [Theft] جلسة جديدة بدأت...")
    
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
            try: browser.close()
            except: pass
            return
        
        last_clicked_col = ""
        last_click_time = 0
        
        while True:
            try:
                if should_stop():
                    stop_bot()
                
                if time.time() - session_start >= SESSION_MAX:
                    print("🔄 [Theft] عدت 90 دقيقة - هعمل restart للمتصفح...")
                    try: browser.close()
                    except: pass
                    return
                
                if check_if_jailed(page):
                    print(f"🚔 [Theft] إحنا في السجن! هستنى {JAIL_WAIT // 60} دقايق...")
                    for _ in range(JAIL_WAIT // 60):
                        time.sleep(60)
                        if should_stop():
                            stop_bot()
                    try:
                        page.goto('https://project-dark.co.uk/theft', wait_until='domcontentloaded', timeout=60000)
                        print("✅ [Theft] حاولت أرجع لصفحة السرقة")
                    except Exception as e:
                        print(f"⚠️ [Theft] مشكلة الرجوع: {e}")
                    sleep(3)
                    continue
                
                if '/theft' not in page.url:
                    print(f"⚠️ [Theft] الصفحة اتغيرت لـ {page.url}، هرجع لصفحة السرقة...")
                    try:
                        page.goto('https://project-dark.co.uk/theft', wait_until='domcontentloaded', timeout=60000)
                    except: pass
                    sleep(3)
                    continue
                
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
                except Exception as eval_err:
                    err_str = str(eval_err)
                    if 'Execution context was destroyed' in err_str or 'navigation' in err_str.lower():
                        print("🚔 [Theft] الصفحة اتنقلت فجأة، هستنى ثانية...")
                        sleep(3)
                        continue
                    else:
                        raise eval_err
                
                steal_btns = data['btns']
                readies = data['readies']
                
                if len(steal_btns) == 0 or len(readies) == 0:
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
                    
                    if col_name == last_clicked_col and (time.time() - last_click_time) < 15:
                        continue
                    
                    print(f"🎯 [Theft] {col_name} جاهز - بدوس على آخر زر Steal...")
                    
                    success = False
                    try:
                        loc = page.locator('button.theft-steal-btn').nth(bottom_btn['idx'])
                        loc.scroll_into_view_if_needed()
                        sleep(500)
                        loc.click(timeout=5000)
                        print(f"✅ [Theft] Playwright click - {col_name}")
                        success = True
                    except: pass
                    
                    if not success:
                        try:
                            loc = page.locator('button.theft-steal-btn').nth(bottom_btn['idx'])
                            loc.click(force=True, timeout=5000)
                            print(f"✅ [Theft] Playwright force - {col_name}")
                            success = True
                        except: pass
                    
                    if not success:
                        try:
                            page.mouse.move(bottom_btn['cx'], bottom_btn['cy'])
                            sleep(300)
                            page.mouse.click(bottom_btn['cx'], bottom_btn['cy'])
                            print(f"✅ [Theft] mouse.click - {col_name}")
                            success = True
                        except: pass
                    
                    if success:
                        clicked_any = True
                        last_clicked_col = col_name
                        last_click_time = time.time()
                        sleep(5)
                        if check_if_jailed(page):
                            print("🚔 [Theft] دخلنا السجن بعد الضغط!")
                            continue
                        try:
                            page.goto('https://project-dark.co.uk/theft', wait_until='domcontentloaded', timeout=60000)
                        except: pass
                        sleep(3)
                        break
                
                if not clicked_any:
                    time.sleep(3)
                
            except Exception as e:
                err_str = str(e)
                if 'Execution context was destroyed' in err_str or 'navigation' in err_str.lower():
                    print("🚔 [Theft] الصفحة اتنقلت، هستنى 3 ثواني...")
                    sleep(3)
                    continue
                
                print(f"⚠️ [Theft] مشكلة مؤقتة: {e}")
                time.sleep(3)
                try:
                    if '/theft' not in page.url:
                        page.goto('https://project-dark.co.uk/theft', wait_until='domcontentloaded', timeout=60000)
                except: pass
        
        try: browser.close()
        except: pass


def run_theft_bot():
    print("🚗 [Theft] بدأ التشغيل...")
    if STOP_DATETIME:
        print(f"⏰ وقت الإيقاف: {STOP_DATETIME.strftime('%Y-%m-%d %H:%M')} (بتوقيت مصر)")
    else:
        print("⏰ بدون إيقاف")
    while True:
        try:
            run_session()
            print("😴 [Theft] بستنى 10 ثواني قبل الجلسة الجديدة...")
            for _ in range(10):
                time.sleep(1)
                if should_stop():
                    stop_bot()
        except KeyboardInterrupt:
            print("🛑 [Theft] تم الإيقاف")
            break
        except Exception as e:
            print(f"⚠️ [Theft] مشكلة كبيرة: {e}")
            time.sleep(30)


if __name__ == "__main__":
    run_theft_bot()
