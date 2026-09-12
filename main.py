from playwright.sync_api import sync_playwright
import time

# 🔑 بيانات الدخول الخاصة بك
USERNAME = "amr.aly.2226@gmail.com"
PASSWORD = "Gun@12345"

with sync_playwright() as p:
    print("⏳ 1. جاري تشغيل المتصفح...")
    browser = p.chromium.launch(headless=True)
    
    context = browser.new_context(
        user_agent="Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Mobile Safari/537.36"
    )
    page = context.new_page()

    print("⏳ 2. جاري فتح صفحة تسجيل الدخول...")
    page.goto("https://www.project-dark.co.uk/login")
    
    print("⏳ 3. بستنى Cloudflare يعدي التحدي...")
    page.wait_for_timeout(8000) 
    
    print("🔑 4. جاري كتابة البيانات والضغط على دخول...")
    page.fill('input[name="email"]', USERNAME)
    page.fill('input[name="password"]', PASSWORD)
    page.click('button[type="submit"]')
    
    print("⏳ 5. بستنى تحميل الصفحة بعد الدخول...")
    page.wait_for_load_state("networkidle")
    time.sleep(3)

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
