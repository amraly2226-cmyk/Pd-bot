from playwright.sync_api import sync_playwright
import time

# 🔑 بيانات الدخول الخاصة بك
USERNAME = "amr.aly.2226@gmail.com"
PASSWORD = "Gun@12345"

with sync_playwright() as p:
    print("⏳ 1. جاري تشغيل المتصفح...")
    # بنشغل المتصفح في الخلفية (headless)
    browser = p.chromium.launch(headless=True)
    
    context = browser.new_context(
        user_agent="Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Mobile Safari/537.36"
    )
    page = context.new_page()

    print("⏳ 2. جاري فتح صفحة تسجيل الدخول...")
    page.goto("https://www.project-dark.co.uk/login")
    
    print("⏳ 3. بستنى Cloudflare يعدي التحدي (هياخد حوالي 8 ثواني)...")
    page.wait_for_timeout(8000) 
    
    print("🔑 4. جاري كتابة الإيميل والباسورد...")
    page.fill('input[name="email"]', USERNAME)
    page.fill('input[name="password"]', PASSWORD)
    
    print("🖱️ 5. جاري الضغط على زر الدخول...")
    page.click('button[type="submit"]')
    
    # ✅ التعديل الجديد هنا: هنستنى تغيير الرابط بدل ما نستنى "هدوء" الصفحة
    print("⏳ 6. بستنى الرابط يتغير لصفحة البلاك ماركت...")
    try:
        page.wait_for_url("**/blackmarket**", timeout=60000) # استنى لحد 60 ثانية
        print("✅ الرابط اتغير بنجاح!")
    except Exception as e:
        print(f"⚠️ الرابط مازال مش blackmarket. الرابط الحالي هو: {page.url}")

    print(f"🔗 الرابط النهائي: {page.url}")

    if "blackmarket" in page.url.lower():
        print("\n✅ ✅ ✅ دخلنا البلاك ماركت بنجاح! ✅ ✅ ✅")
        try:
            location_element = page.locator("text=Location:").first
            location = location_element.inner_text()
            print(f"📍 اللوكيشن الحالي هو: {location}")
        except Exception as e:
            print(f"⚠️ معرفتش أسحب اللوكيشن: {e}")
    else:
        print("\n❌ ❌ ❌ فشل الدخول. لسه في صفحة اللوجين.")
    
    browser.close()
