from playwright.sync_api import sync_playwright
import time
import re
import threading

# 🔑 بيانات الدخول والكوكيز
USERNAME = "amr.aly.2226@gmail.com"
PASSWORD = "Gun@12345"

# 🍪 الكوكيز اللي إنت جبتها من متصفح Kiwi
COOKIES = [
    {"name": "device_fp_d", "value": "%7B%22lang%22%3A%22en-US%22%2C%22plat%22%3A%22Linux%20armv81%22%2C%22cores%22%3A8%2C%22mem%22%3Anull%2C%22screen%22%3A%22414x920x24%22%2C%22avail%22%3A%22414x920%22%2C%22tzoff%22%3A-180%2C%22tz%22%3A%22Africa%2FCairo%22%2C%22touch%22%3A1%2C%22mtp%22%3A5%2C%22canvas%22%3A%22ed1357802482%22%7D", "domain": "project-dark.co.uk", "path": "/"},
    {"name": "_ga_JNKJRQ925S", "value": "GS2.1.s1789214101$o8$g1$t1789214137$j24$l0$h0", "domain": ".project-dark.co.uk", "path": "/"},
    {"name": "remember_web_59ba36addc2b2f9401580f014c7f58ea4e30989d", "value": "eyJpdiI6IldLaFg3N0dYN2ZkbWZINjBkV2xjdXc9PSIsInZhbHVlIjoiN2hJMEJ6dnQrYUpJb3loQml2TWJ0eUU3dXl4TjNTUWpQNkYzbmVheG9EQ2JHQ2NEaXRaQW5SWjdmL2VKRllFRDlxaVprUGd6bU9pZy9zbEpqaTZLdUpnMHNDY2tCM2YrbkcrRzRwTkhtajNITGxxdkQ5QUhzcmRGUTYxL3lKNERRbTYxdXpnSmQ0N1VaSTU2N3ZOWGNJVEZVcEI2dVFqa3FwMmpzbVlsRDlZZGwxUElNNDZycmV2Z3pTSGpkcTdITkxkcWdmS0w5Rldvb09CUUxFSE9PTDdOaEVDNWc2d3hIODBOcFdNdmRXVT0iLCJtYWMiOiI4ZWVjNmMxMWZkMjQ3NjgwNjhmYTAzMDU2MzM1ODcwZWE2ZjAzY2ZiN2RlNDI4ODU4NzhkMThiNzU5NmRmZmZmIiwidGFnIjoiIn0%3D", "domain": ".project-dark.co.uk", "path": "/"},
    {"name": "device_fp", "value": "00cad2c6896d259a5ecbceded5efe770bb8b3e5407d0d39f4e54990a5f3d9835", "domain": "project-dark.co.uk", "path": "/"},
    {"name": "_ga", "value": "GA1.1.1994605517.1787739453", "domain": ".project-dark.co.uk", "path": "/"},
    {"name": "project-dark-session", "value": "eyJpdiI6Ikl1WlIvbHczd2RhS3BKMVlGeHRuSXc9PSIsInZhbHVlIjoicnN3VmEvVkZubE91MzRqcWJGbHlYcloySUgzaXpkVWdHZTdxRTdPakZGdHZvNWFQZ0JYVVRRbFB2YmRmbWtKY1YwcjNGaTB2VWhVMVpFL2pLUFd1cjBoaitVMEJ5NjV2Ny9scE0wankxNGVMRjJDU0Jub0p4bGZRdWlMK1lUbDAiLCJtYWMiOiJiOTk4ZGYwNDQ4MTY5NGFiNGNjODk3ODAxZWZhYzJlOTVhZTE4NzJmNDFkYWQ3M2I2OGM2NTU0YjhkOTI4ZDJjIiwidGFnIjoiIn0%3D", "domain": ".project-dark.co.uk", "path": "/"},
    {"name": "XSRF-TOKEN", "value": "eyJpdiI6IkRlbG5MQitsczhUcnVqVFNGSmdwbEE9PSIsInZhbHVlIjoiZTZNSld1SHRiMmRCaWhpb28rc3pyUTg3RjdyY3BzeWVnaHVQVzl5WHB3bFl6b2JqUW1SSXVjb0U3K1R3VU4ydWtlQ3ZIeXV0MzNWMjNtb21JWXI3UGc5UXFNNkdkVzJZQVlOUkxRMTB6YVpyc3BpY05BT01vSEY0NCtmRnFGSWkiLCJtYWMiOiIwOTE2MDgxNDgzYzEwODgzZTM1MTk0ODUzZTk2ZWMxYzJlNWUwODcwY2IyZTZjYWYwM2FlMGRmYmEyNjQwMDI3IiwidGFnIjoiIn0%3D", "domain": ".project-dark.co.uk", "path": "/"}
]

# 📦 قائمة العناصر
ITEMS = ["Anabolic steroid","Artifacts","Alcohol","Electronics","Plastic jewelry","Stolen paintings","Human beings","Confidential documents","Endangered exotic animals","Organs"]

# ⏰ إعدادات بوت الأسهم
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

# ═══════════════════════════════════════════════════════════════
# 🔧 دوال مساعدة
# ═══════════════════════════════════════════════════════════════

def click_sell_all_in_row(page, item_name):
    try:
        row = page.locator(f'tr:has-text("{item_name}")').first
        if row.count() > 0:
            sell_btn = row.locator('button:has-text("Sell All")').first
            if sell_btn.count() > 0:
                sell_btn.click(force=True)
                return True
    except Exception as e:
        print(f"⚠️ مشكلة في الضغط على Sell All لـ {item_name}: {e}")
    return False

def click_max_buy_in_row(page, item_name):
    try:
        row = page.locator(f'tr:has-text("{item_name}")').first
        if row.count() > 0:
            buy_btn = row.locator('button:has-text("Max Buy")').first
            if buy_btn.count() > 0:
                buy_btn.click(force=True)
                return True
    except Exception as e:
        print(f"⚠️ مشكلة في الضغط على Max Buy لـ {item_name}: {e}")
    return False

def confirm_modal(page, button_text, timeout=10000):
    try:
        confirm_btn = page.locator(f'button:has-text("{button_text}")').last
        confirm_btn.wait_for(state="visible", timeout=timeout)
        confirm_btn.click(force=True)
        return True
    except Exception as e:
        print(f"⚠️ زر التأكيد {button_text} مش ظهر: {e}")
        return False

def get_hold_count(page, item_name):
    """بترجع كمية العنصر اللي مع البوت من المخزن"""
    try:
        return page.evaluate("""(itemName) => {
            let rows = [...document.querySelectorAll('tr')];
            for (let r of rows) {
                if (r.innerText.toLowerCase().includes(itemName.toLowerCase())) {
                    let cells = [...r.querySelectorAll('td')];
                    if (cells.length >= 3) {
                        let youHaveCell = cells[2].innerText;
                        let match = youHaveCell.match(/(\\d+)/);
                        if (match) return parseInt(match[1]);
                    }
                }
            }
            return 0;
        }""", item_name)
    except:
        return 0

# ═══════════════════════════════════════════════════════════════
# 📈 بوت الأسهم
# ═══════════════════════════════════════════════════════════════

def run_stocks_bot():
    print("📈 [الأسهم] بدأ التشغيل...")
    
    with sync_playwright() as p:
        browser = p.chromium.launch(
            headless=True,
            args=['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu']
        )
        context = browser.new_context(
            user_agent="Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Mobile Safari/537.36",
            viewport={"width": 1920, "height": 1080}
        )
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
                
                try:
                    page.wait_for_selector('tr', timeout=20000)
                except:
                    pass
                
                # 1) بيع كل الأسهم
                print("🔴 [الأسهم] بدأت عملية البيع...")
                try:
                    sell_all_buttons = page.locator('button:has-text("Sell All")')
                    count = sell_all_buttons.count()
                    
                    if count > 0:
                        sell_all_buttons.last.click(force=True)
                        print("✅ [الأسهم] تم الضغط على Sell All")
                        sleep(2000)
                        
                        if confirm_modal(page, "SELL ALL"):
                            print("✅ [الأسهم] تم تأكيد البيع")
                            sleep(4000)
                        else:
                            print("⚠️ [الأسهم] مفيش زر تأكيد SELL ALL")
                    else:
                        print("ℹ️ [الأسهم] مفيش أسهم للبيع")
                except Exception as e:
                    print(f"⚠️ [الأسهم] مشكلة في البيع: {e}")
                
                # 2) شراء الأسهم الخضراء
                print("🟢 [الأسهم] بدأت عملية الشراء...")
                bought_count = 0
                
                for attempt in range(5):
                    try:
                        found_green = False
                        rows = page.locator('tr')
                        row_count = rows.count()
                        
                        for i in range(row_count):
                            try:
                                row = rows.nth(i)
                                row_text = row.inner_text()
                                
                                if ('↑' in row_text or '▲' in row_text):
                                    max_span = row.locator('span.stock-fillmax-btn').first
                                    if max_span.count() > 0:
                                        max_span.click(force=True)
                                        found_green = True
                                        break
                            except:
                                continue
                        
                        if not found_green:
                            break
                        
                        bought_count += 1
                        print(f"✅ [الأسهم] لقيت سهم أخضر {bought_count}، داست على Max")
                        sleep(1500)
                        
                        try:
                            bottom_buy = page.locator('#bottomBuyBtn').first
                            if bottom_buy.count() > 0:
                                bottom_buy.click(force=True)
                                print("✅ [الأسهم] تم الضغط على زر الشراء")
                                sleep(1500)
                        except Exception as e:
                            print(f"⚠️ [الأسهم] مشكلة في bottomBuyBtn: {e}")
                            break
                        
                        try:
                            yes_btn = page.locator('button:has-text("YES"), span:has-text("YES"), div:has-text("YES")').last
                            yes_btn.wait_for(state="visible", timeout=5000)
                            yes_btn.click(force=True)
                            print("✅ [الأسهم] تم التأكيد بـ YES")
                        except Exception as e:
                            print(f"⚠️ [الأسهم] مشكلة في YES: {e}")
                            break
                        
                        sleep(2500)
                        print(f"✅ [الأسهم] تم شراء السهم رقم {bought_count}")
                    except Exception as e:
                        print(f"⚠️ [الأسهم] مشكلة في شراء سهم: {e}")
                        break
                
                if bought_count == 0:
                    print("ℹ️ [الأسهم] مفيش أسهم خضراء دلوقتي")
                
                print(f"📊 [الأسهم] خلصنا الدورة: اشترينا {bought_count} سهم أخضر")
                print("="*50 + "\n")
                
            except Exception as e:
                print(f"⚠️ [الأسهم] حصل خطأ: {e}")
            
            print(f"⏰ [الأسهم] هستنى 15 دقيقة للدورة الجاية...")
            time.sleep(STOCKS_INTERVAL)

# ═══════════════════════════════════════════════════════════════
# 🌐 بوت التريد
# ═══════════════════════════════════════════════════════════════

def run_trade_bot():
    print("🌐 [التريد] بدأ التشغيل...")
    
    with sync_playwright() as p:
        browser = p.chromium.launch(
            headless=True,
            args=['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu']
        )
        context = browser.new_context(
            user_agent="Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Mobile Safari/537.36",
            viewport={"width": 1920, "height": 1080}
        )
        context.add_cookies(COOKIES)
        page = context.new_page()
        page.set_default_timeout(15000)

        try:
            page.goto('https://www.project-dark.co.uk/blackmarket', wait_until='domcontentloaded', timeout=60000)
            print("✅ [التريد] دخلنا بالكوكيز")
        except Exception as e:
            print(f"⚠️ [التريد] مشكلة في الدخول: {e}")

        while True:
            try:
                # ═══════════════════════════════════════
                # 1) صفحة الترافل
                # ═══════════════════════════════════════
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
                            print(f"⏳ [التريد] كولداون سفر: {cooldown_text} - هستنى {wait_seconds} ثانية...")
                            sleep(wait_seconds * 1000)
                            print("✅ [التريد] العداد خلص! هسافر فوراً...")
                            page.goto('https://www.project-dark.co.uk/travel', wait_until='domcontentloaded')
                            continue
                    
                    current_city = page.evaluate("""() => {
                        let body = document.body.innerText;
                        if (body.includes('Black Market - San Francisco')) return 'San Francisco';
                        if (body.includes('Black Market - St Louis')) return 'St Louis';
                        let m = body.match(/Location\\s*\\n\\s*(San Francisco|St Louis)/i);
                        if (m) return m[1];
                        return null;
                    }""")

                    if not current_city:
                        page.goto('https://project-dark.co.uk/travel', wait_until='domcontentloaded')
                        continue

                    dest_city = 'St Louis' if current_city == 'San Francisco' else 'San Francisco'
                    print(f"✈️ [التريد] {current_city} -> {dest_city}")

                    try:
                        grid_btn = page.locator("text='Grid View'").first
                        if grid_btn.count() > 0:
                            grid_btn.click(force=True)
                            sleep(2000)
                    except Exception as e:
                        print(f"⚠️ [التريد] Grid View: {e}")

                    try:
                        city_card = page.locator(f"text='{dest_city}'").first
                        if city_card.count() > 0:
                            city_card.click(force=True)
                            sleep(2000)
                    except Exception as e:
                        print(f"⚠️ [التريد] اختيار المدينة: {e}")

                    try:
                        travel_selected_btn = page.locator("button:has-text('Travel to Selected Location')").first
                        if travel_selected_btn.count() > 0:
                            travel_selected_btn.click(force=True)
                            sleep(2000)
                    except Exception as e:
                        print(f"⚠️ [التريد] Travel Selected: {e}")

                    if confirm_modal(page, "TRAVEL"):
                        print(f"🎉 [التريد] تم السفر إلى {dest_city}!")
                        sleep(7000)
                    else:
                        page.screenshot(path="travel_confirm_error.png")

                    page.goto('https://www.project-dark.co.uk/blackmarket', wait_until='domcontentloaded')
                    continue

                # ═══════════════════════════════════════
                # 2) في السوق
                # ═══════════════════════════════════════
                state = page.evaluate("""(items) => {
                    let body = document.body.innerText;
                    let loc = null;
                    let cooldownStr = null;
                    
                    // ✅ اكتشاف المدينة من عنوان الصفحة (أدق بكتير)
                    if (body.includes('Black Market - San Francisco')) loc = 'San Francisco';
                    else if (body.includes('Black Market - St Louis')) loc = 'St Louis';
                    else {
                        // طريقة احتياطية
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
                    }

                    let cdMatch = body.match(/You cannot travel for:?\\s*([0-9hms ]+)/i) || body.match(/Travel in\\s*([0-9hms ]+)/i);
                    if (cdMatch) cooldownStr = cdMatch[1];

                    let hold = 0;
                    let heldItem = null;
                    let rows = [...document.querySelectorAll('tr')];

                    for (let r of rows) {
                        let rText = r.innerText;
                        if (rText.includes('Sell') && !rText.includes('Confirm')) {
                            for (let it of items) {
                                if (rText.toLowerCase().includes(it.toLowerCase())) {
                                    let cells = [...r.querySelectorAll('td')];
                                    if (cells.length >= 3) {
                                        let youHaveCell = cells[2].innerText;
                                        let match = youHaveCell.match(/(\\d+)/);
                                        if (match && +match[1] > 0) {
                                            heldItem = it;
                                            hold = +match[1];
                                            break;
                                        }
                                    }
                                    break;
                                }
                            }
                        }
                    }

                    if (heldItem === null) {
                        let m = body.match(/holding (\\d+) items/i);
                        hold = m ? +m[1] : 0;
                    }
                    
                    return { loc, cd: cooldownStr, hold, heldItem };
                }""", ITEMS)

                if state['cd']:
                    print(f"⏳ [التريد] كولداون سوق: {state['cd']} - هستنى دقيقة...")
                    sleep(60000)
                    continue

                # ✅ سان فرانسيسكو
                if state['loc'] == "San Francisco":
                    if state['heldItem'] == "Stolen paintings" and state['hold'] > 0:
                        print("📍 [التريد] سان فرانسيسكو - بيع اللوحات")
                        if click_sell_all_in_row(page, "Stolen paintings"):
                            sleep(3000)
                            if confirm_modal(page, "SELL ALL"):
                                sleep(4000)
                                remaining = get_hold_count(page, "Stolen paintings")
                                if remaining == 0:
                                    print("✅ [التريد] تم بيع اللوحات (متأكد)!")
                                else:
                                    print(f"⚠️ [التريد] لسه فيه {remaining} لوحة! البيع فشل.")
                                    page.screenshot(path="sell_failed_paintings.png")
                            else:
                                page.screenshot(path="no_confirm_sell_paintings.png")
                        else:
                            print("⚠️ [التريد] مفيش زر Sell All للوحات")
                        sleep(3000)
                        continue
                    
                    if state['heldItem'] == "Plastic jewelry" and state['hold'] > 0:
                        print("📍 [التريد] سان فرانسيسكو - رايح ST LOUIS")
                        page.goto('https://www.project-dark.co.uk/travel', wait_until='domcontentloaded')
                        sleep(2500)
                        continue

                    if state['hold'] == 0:
                        print("📍 [التريد] سان فرانسيسكو - شراء بلاستيك")
                        if click_max_buy_in_row(page, "Plastic jewelry"):
                            sleep(3000)
                            if confirm_modal(page, "BUY MAX"):
                                sleep(4000)
                                new_count = get_hold_count(page, "Plastic jewelry")
                                if new_count > 0:
                                    print(f"✅ [التريد] تم شراء البلاستيك ({new_count} حاجة)!")
                                else:
                                    print("⚠️ [التريد] الشراء فشل!")
                                    page.screenshot(path="buy_failed_plastic.png")
                            else:
                                page.screenshot(path="no_confirm_buy.png")
                        else:
                            print("⚠️ [التريد] مفيش زر Max Buy للبلاستيك")
                        sleep(3000)
                        continue

                # ✅ ST LOUIS
                elif state['loc'] == "St Louis":
                    if state['heldItem'] == "Plastic jewelry" and state['hold'] > 0:
                        print("📍 [التريد] ST LOUIS - بيع البلاستيك")
                        if click_sell_all_in_row(page, "Plastic jewelry"):
                            sleep(3000)
                            if confirm_modal(page, "SELL ALL"):
                                sleep(4000)
                                remaining = get_hold_count(page, "Plastic jewelry")
                                if remaining == 0:
                                    print("✅ [التريد] تم بيع البلاستيك (متأكد)!")
                                else:
                                    print(f"⚠️ [التريد] لسه فيه {remaining} بلاستيك! البيع فشل.")
                                    page.screenshot(path="sell_failed_plastic.png")
                            else:
                                page.screenshot(path="no_confirm_sell_plastic.png")
                        else:
                            print("⚠️ [التريد] مفيش زر Sell All للبلاستيك")
                        sleep(3000)
                        continue
                    
                    if state['heldItem'] == "Stolen paintings" and state['hold'] > 0:
                        print("📍 [التريد] ST LOUIS - رايح سان فرانسيسكو")
                        page.goto('https://www.project-dark.co.uk/travel', wait_until='domcontentloaded')
                        sleep(2500)
                        continue

                    if state['hold'] == 0:
                        print("📍 [التريد] ST LOUIS - شراء لوحات")
                        if click_max_buy_in_row(page, "Stolen paintings"):
                            sleep(3000)
                            if confirm_modal(page, "BUY MAX"):
                                sleep(4000)
                                new_count = get_hold_count(page, "Stolen paintings")
                                if new_count > 0:
                                    print(f"✅ [التريد] تم شراء اللوحات ({new_count} حاجة)!")
                                else:
                                    print("⚠️ [التريد] الشراء فشل!")
                                    page.screenshot(path="buy_failed_paintings.png")
                            else:
                                page.screenshot(path="no_confirm_buy_paintings.png")
                        else:
                            print("⚠️ [التريد] مفيش زر Max Buy للوحات")
                        sleep(3000)
                        continue
                
                else:
                    print("⚠️ [التريد] مش لاقي المدينة، بجرب تاني...")
                    sleep(5000)
                    continue

            except Exception as e:
                print(f"⚠️ [التريد] حصل خطأ مؤقت: {e}")
                try:
                    page.screenshot(path="error_screenshot.png")
                except:
                    pass
                sleep(15000)
            
            sleep(10000)

# ═══════════════════════════════════════════════════════════════
# 🚀 التشغيل
# ═══════════════════════════════════════════════════════════════

if __name__ == "__main__":
    print("🚀🚀🚀 تشغيل البوتين (تريد + أسهم)...")
    print("="*60)
    
    trade_thread = threading.Thread(target=run_trade_bot, daemon=True, name="TradeBot")
    stocks_thread = threading.Thread(target=run_stocks_bot, daemon=True, name="StocksBot")
    
    trade_thread.start()
    stocks_thread.start()
    
    print("✅ التريد شغال:", trade_thread.name)
    print("✅ الأسهم شغالة:", stocks_thread.name)
    print("="*60)
    
    try:
        while True:
            time.sleep(60)
    except KeyboardInterrupt:
        print("\n🛑 تم إيقاف البوتات.")
