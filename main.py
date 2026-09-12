from playwright.sync_api import sync_playwright
import time

# 🔑 بيانات الدخول الخاصة بك
USERNAME = "amr.aly.2226@gmail.com"
PASSWORD = "Gun@12345" 

with sync_playwright() as p:
    print("⏳ 1. جاري تشغيل المتصفح...")
    
    browser = p.chromium.launch(
        headless=True,
        args=[
            '--disable-blink-features=AutomationControlled',
            '--no-sandbox',
            '--disable-setuid-sandbox'
        ]
    )
    
    context = browser.new_context(
        user_agent="Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Mobile Safari/537.36"
    )
    page = context.new_page()

    print("⏳ 2. جاري فتح صفحة تسجيل الدخول...")
    page.goto("https://www.project-dark.co.uk/login")
    
    # ✅ التعديل الجديد: نستنى علامة النجاح تظهر
    print("⏳ 3. بستنى Cloudflare يظهر علامة Success!...")
    try:
        page.wait_for_selector("text=Success!", timeout=60000) # استنى لحد 60 ثانية
        print("✅ ظهرت علامة Success! بنجاح!")
    except Exception as e:
        print("⚠️ معرفتش أشوف كلمة Success!. هكمل برضه عشان أشوف هيحصل إيه.")
    
    # ✅ التعديل الجديد: نستنى 30 ثانية بعد النجاح عشان الصفحة تثبت
    print("⏳ 4. بستنى 30 ثانية عشان نتأكد إن الصفحة استقرت...")
    time.sleep(30)
    
    print("🔑 5. جاري كتابة الإيميل والباسورد...")
    page.fill('input[name="email"]', USERNAME)
    page.fill('input[name="password"]', PASSWORD)
    
    print("🖱️ 6. جاري الضغط على زر الدخول...")
    page.click('button[type="submit"]')
    
    print("⏳ 7. بستنى 5 ثواني عشان نشوف النتيجة...")
    time.sleep(5)

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
        
        # بناخد Screenshot عشان نشوف الصفحة شكلها إيه
        try:
            page.screenshot(path="error_login.png")
            print("📸 تم حفظ صورة للصفحة في ملف error_login.png")
        except:
            pass
        
        try:
            error_element = page.locator(".alert, .error, .invalid-feedback, .text-danger").first
            if error_element.count() > 0:
                print(f"🚨 رسالة الخطأ من الموقع: {error_element.inner_text()}")
            else:
                print("⚠️ مفيش رسالة خطأ ظاهرة. غالباً Cloudflare بيعمل بلوك للطلب.")
        except Exception as e:
            print("معرفتش أقرا رسالة الخطأ.")
    
    browser.close()
