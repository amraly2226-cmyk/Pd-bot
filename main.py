from playwright.sync_api import sync_playwright
import time
import re

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

# 📦 قائمة العناصر اللي البوت بيتعامل معاها
ITEMS = ["Anabolic steroid","Artifacts","Alcohol","Electronics","Plastic jewelry","Stolen paintings","Human beings","Confidential documents","Endangered exotic animals","Organs"]

def sleep(ms):
    time.sleep(ms / 1000.0)

def parse_cooldown(text):
    """بتحول نص العداد زي '13m 24s' لعدد الثواني"""
    total_seconds = 0
    # ندور على الساعات
    hours = re.search(r'(\d+)\s*h', text)
    if hours: total_seconds += int(hours.group(1)) * 3600
    # ندور على الدقايق
    minutes = re.search(r'(\d+)\s*m', text)
    if minutes: total_seconds += int(minutes.group(1)) * 60
    # ندور على الثواني
    seconds = re.search(r'(\d+)\s*s', text)
    if seconds: total_seconds += int(seconds.group(1))
    return total_seconds

with sync_playwright() as p:
    print("🚀 البوت شغال...")
    
    browser = p.chromium.launch(
        headless=True, 
        args=['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu']
    )
    context = browser.new_context(
        user_agent="Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Mobile Safari/537.36",
        viewport={"width": 1920, "height": 1080}
    )
    
    # 🍪 تحميل الكوكيز
    print("🍪 جاري تحميل الكوكيز...")
    context.add_cookies(COOKIES)
    
    page = context.new_page()
    page.set_default_timeout(15000)

    # 🌐 الدخول الأولي
    try:
        page.goto('https://www.project-dark.co.uk/blackmarket', wait_until='networkidle', timeout=60000)
        print("✅ دخلنا بالكوكيز")
    except Exception as e:
        print(f"⚠️ مشكلة في الدخول: {e}")

    # 🔄 الحلقة اللانهائية للبيع والشراء والسفر
    while True:
        try:
            # ═══════════════════════════════════════════════════════════════
            # 1) لو إحنا في صفحة الترافل (نفذ السفر)
            # ═══════════════════════════════════════════════════════════════
            if 'travel' in page.url:
                # ✅ قراءة العداد وحساب الوقت بالظبط
                cooldown_text = page.evaluate("""() => {
                    let body = document.body.innerText;
                    let cdMatch = body.match(/You cannot travel for:?\\s*([^\\n]+)/i);
                    if (cdMatch) {
                        let str = cdMatch[1].trim();
                        // لو الوقت خلص (00:00:00) أو مش موجود، نرجع null
                        if (str.includes('00:00') || str.includes('0m') || str.includes('0s')) {
                            // نتأكد إنه مش صفر حقيقي
                            if (!/(\d+[hms])/.test(str)) return null;
                            // لو فيه أرقام غير الصفر، نرجعه
                            if (str.match(/(\d+)\s*h/) && parseInt(str.match(/(\d+)\s*h/)[1]) > 0) return str;
                            if (str.match(/(\d+)\s*m/) && parseInt(str.match(/(\d+)\s*m/)[1]) > 0) return str;
                            if (str.match(/(\d+)\s*s/) && parseInt(str.match(/(\d+)\s*s/)[1]) > 0) return str;
                            return null;
                        }
                        return str;
                    }
                    return null;
                }""")

                if cooldown_text:
                    # حساب الوقت بالثواني
                    wait_seconds = parse_cooldown(cooldown_text)
                    if wait_seconds > 0:
                        # نضيف 10 ثواني أمان
                        wait_seconds += 10
                        print(f"⏳ في كولداون للسفر: {cooldown_text} - البوت هيستنى {wait_seconds} ثانية بالظبط...")
                        sleep(wait_seconds * 1000)
                        print("✅ العداد خلص! جاري السفر فوراً...")
                        # نعمل Refresh ونكمل على طول
                        page.goto('https://www.project-dark.co.uk/travel', wait_until='networkidle')
                        continue
                    else:
                        print("✅ مفيش كولداون! جاري تجهيز السفر...")
                else:
                    print("✅ مفيش كولداون! جاري تجهيز السفر...")

                # لو مفيش كولداون، نكمل عملية السفر
                current_city = page.evaluate("""() => {
                    let body = document.body.innerText;
                    let m = body.match(/Location\\s*\\n\\s*(San Francisco|St Louis)/i);
                    if (m) return m[1];
                    if (body.includes('Black Market - St Louis')) return 'St Louis';
                    if (body.includes('Black Market - San Francisco')) return 'San Francisco';
                    return null;
                }""")

                if not current_city:
                    page.goto('https://project-dark.co.uk/travel')
                    continue

                dest_city = 'St Louis' if current_city == 'San Francisco' else 'San Francisco'
                print(f"✈️ {current_city} - جاري تجهيز السفر إلى {dest_city}")

                # 1) اختيار جرايد فيو بالضغط المباشر
                try:
                    grid_view_btn = page.locator("text='Grid View'").first
                    if grid_view_btn.count() > 0:
                        grid_view_btn.click(force=True)
                        print("✅ تم الضغط على Grid View")
                        sleep(2000)
                except Exception as e:
                    print(f"⚠️ مشكلة في الضغط على Grid View: {e}")

                # 2) اختيار البلد من الكارت
                try:
                    city_card = page.locator(f"text='{dest_city}'").first
                    if city_card.count() > 0:
                        city_card.click(force=True)
                        print(f"✅ تم الضغط على كارت {dest_city}")
                        sleep(2000)
                except Exception as e:
                    print(f"⚠️ مشكلة في اختيار المدينة: {e}")

                # 3) الضغط على Travel to Selected Location
                try:
                    travel_selected_btn = page.locator("button:has-text('Travel to Selected Location')").first
                    if travel_selected_btn.count() > 0:
                        travel_selected_btn.click(force=True)
                        print("✅ تم الضغط على Travel to Selected Location")
                        sleep(2000)
                except Exception as e:
                    print(f"⚠️ مشكلة في الضغط على Travel to Selected Location: {e}")

                # 4) انتظار النافذة المنبثقة والضغط على TRAVEL
                try:
                    page.wait_for_selector("button:has-text('TRAVEL')", timeout=10000)
                    travel_confirm_btn = page.locator("button:has-text('TRAVEL')").last
                    if travel_confirm_btn.count() > 0:
                        travel_confirm_btn.click(force=True)
                        print(f"🎉 تم تأكيد السفر إلى {dest_city}!")
                        sleep(7000) 
                    else:
                        print("⚠️ مش لاقي زر TRAVEL في النافذة")
                except Exception as e:
                    print(f"⚠️ مشكلة في نافذة تأكيد السفر: {e}")
                    page.screenshot(path="travel_confirm_error.png")

                # نرجع للسوق بعد السفر
                page.goto('https://www.project-dark.co.uk/blackmarket')
                continue

            # ═══════════════════════════════════════════════════════════════
            # 2) لو إحنا في السوق (بيع وشراء)
            # ═══════════════════════════════════════════════════════════════
            state = page.evaluate("""(items) => {
                let body = document.body.innerText;
                let loc = null;
                let cooldownStr = null;
                
                let lines = body.split('\\n');
                for (let i = 0; i < lines.length; i++) {
                    if (lines[i].trim().toUpperCase() === 'LOCATION') {
                        for (let j = i + 1; j < lines.length; j++) {
                            if (lines[j].trim()) { loc = lines[j].trim(); break; }
                        }
                        break;
                    }
                }
                if (loc && loc.includes('San Francisco')) loc = 'San Francisco';
                else if (loc && loc.includes('St Louis')) loc = 'St Louis';

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
                print(f"⏳ في كولداون في السوق: {state['cd']} - هستنى دقيقة...")
                sleep(60000)
                continue

            # ✅ سان فرانسيسكو: بيع اللوحات أو شراء البلاستيك
            if state['loc'] == "San Francisco":
                # بيع اللوحات
                if state['heldItem'] == "Stolen paintings" and state['hold'] > 0:
                    print("📍 سان فرانسيسكو - بيع لوحات مسروقة")
                    row = page.locator("tr", has_text="Stolen paintings").first
                    if row.count() > 0:
                        sell_btn = row.locator("button", has_text="Sell All")
                        if sell_btn.count() > 0:
                            sell_btn.click(force=True)
                            sleep(2000)
                            try:
                                confirm_btn = page.locator("button:has-text('SELL ALL')").last
                                confirm_btn.wait_for(state="visible", timeout=10000)
                                confirm_btn.click(force=True)
                                print("✅ تم بيع اللوحات!")
                            except Exception as e:
                                print(f"⚠️ زر تأكيد البيع مش ظهر: {e}")
                                page.screenshot(path="no_confirm_sell_paintings.png")
                            sleep(3000)
                    continue
                
                # لو معاه بلاستيك، يسافر
                if state['heldItem'] == "Plastic jewelry" and state['hold'] > 0:
                    print("📍 سان فرانسيسكو - رايح ST LOUIS (عشان نبيع البلاستيك)")
                    page.goto('https://www.project-dark.co.uk/travel', wait_until='networkidle')
                    sleep(2500)
                    continue

                # شراء البلاستيك لو فاضي
                if state['hold'] == 0:
                    print("📍 سان فرانسيسكو - شراء بلاستيك جيلوري")
                    buy_btn = page.locator('tr:has-text("Plastic jewelry") button:has-text("Max Buy")').first
                    
                    if buy_btn.count() > 0:
                        print("🔍 لقيت زر Max Buy، جاري الضغط...")
                        buy_btn.click(force=True)
                        sleep(2000)
                        
                        try:
                            confirm_btn = page.locator('button:has-text("BUY MAX")').last
                            confirm_btn.wait_for(state="visible", timeout=10000)
                            confirm_btn.click(force=True)
                            print("✅ تم شراء البلاستيك بنجاح!")
                        except Exception as e:
                            print(f"⚠️ زر التأكيد مش ظهر: {e}")
                            page.screenshot(path="no_confirm_buy.png")
                    else:
                        print("⚠️ مش لاقي زر Max Buy في صف Plastic jewelry")
                        page.screenshot(path="no_max_buy_btn.png")
                    
                    sleep(3000)
                    continue

            # ✅ ST LOUIS: بيع البلاستيك أو شراء اللوحات
            elif state['loc'] == "St Louis":
                # بيع البلاستيك
                if state['heldItem'] == "Plastic jewelry" and state['hold'] > 0:
                    print("📍 ST LOUIS - بيع بلاستيك جيلوري")
                    row = page.locator("tr", has_text="Plastic jewelry").first
                    if row.count() > 0:
                        sell_btn = row.locator("button", has_text="Sell All")
                        if sell_btn.count() > 0:
                            sell_btn.click(force=True)
                            sleep(2000)
                            try:
                                confirm_btn = page.locator("button:has-text('SELL ALL')").last
                                confirm_btn.wait_for(state="visible", timeout=10000)
                                confirm_btn.click(force=True)
                                print("✅ تم بيع البلاستيك!")
                            except Exception as e:
                                print(f"⚠️ زر تأكيد البيع مش ظهر: {e}")
                                page.screenshot(path="no_confirm_sell_plastic.png")
                            sleep(3000)
                    continue
                
                # لو معاه لوحات، يسافر
                if state['heldItem'] == "Stolen paintings" and state['hold'] > 0:
                    print("📍 ST LOUIS - رايح سان فرانسيسكو (عشان نبيع اللوحات)")
                    page.goto('https://www.project-dark.co.uk/travel', wait_until='networkidle')
                    sleep(2500)
                    continue

                # شراء اللوحات لو فاضي
                if state['hold'] == 0:
                    print("📍 ST LOUIS - شراء لوحات مسروقة")
                    buy_btn = page.locator('tr:has-text("Stolen paintings") button:has-text("Max Buy")').first
                    
                    if buy_btn.count() > 0:
                        print("🔍 لقيت زر Max Buy للوحات، جاري الضغط...")
                        buy_btn.click(force=True)
                        sleep(2000)
                        
                        try:
                            confirm_btn = page.locator('button:has-text("BUY MAX")').last
                            confirm_btn.wait_for(state="visible", timeout=10000)
                            confirm_btn.click(force=True)
                            print("✅ تم شراء اللوحات بنجاح!")
                        except Exception as e:
                            print(f"⚠️ زر التأكيد مش ظهر: {e}")
                            page.screenshot(path="no_confirm_buy_paintings.png")
                    else:
                        print("⚠️ مش لاقي زر Max Buy في صف Stolen paintings")
                        page.screenshot(path="no_max_buy_paintings.png")
                    
                    sleep(3000)
                    continue
            
            else:
                print("⚠️ مش لاقي المدينة، بجرب تاني...")
                sleep(5000)
                continue

        except Exception as e:
            print(f"حصل خطأ مؤقت، معيد المحاولة: {e}")
            try:
                page.screenshot(path="error_screenshot.png")
                print("📸 تم حفظ صورة للخطأ في error_screenshot.png")
            except:
                pass
            sleep(15000)
        
        sleep(10000)
