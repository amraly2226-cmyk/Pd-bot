import os
import cloudscraper
from bs4 import BeautifulSoup

# سحب الكوكي من الإعدادات
raw_cookie = os.environ.get('PD_COOKIE')

if not raw_cookie:
    print("❌ خطأ: متغير الكوكي (PD_COOKIE) غير موجود!")
    exit()

# تجهيز الـ Scraper
scraper = cloudscraper.create_scraper(
    browser={'browser': 'chrome', 'platform': 'windows', 'desktop': True}
)

# الهيدرز (تم تعديل الـ User-Agent عشان يطابق الموبايل)
headers = {
    'Cookie': raw_cookie,
    'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Mobile Safari/537.36',
    'Referer': 'https://www.project-dark.co.uk/'
}

url = 'https://www.project-dark.co.uk/blackmarket'

print("⏳ جاري الدخول...")
response = scraper.get(url, headers=headers, timeout=15)

# طباعة الرابط النهائي وكود الحالة عشان نعرف إحنا فين
print(f"🔗 الرابط النهائي: {response.url}")
print(f"📊 كود الحالة: {response.status_code}")

# حفظ الصفحة عشان نقدر نراجعها لو فشل الدخول
with open("response_page.html", "w", encoding="utf-8") as f:
    f.write(response.text)

if "Black Market" in response.text or "Black Market" in response.url:
    print("✅ دخلنا الصفحة بنجاح!")
    
    soup = BeautifulSoup(response.text, 'lxml')
    try:
        location = "مش لاقيها"
        for tag in soup.find_all(['div', 'span', 'td']):
            if "Location:" in tag.text:
                location = tag.text.replace("Location:", "").strip()
                break
        print(f"📍 اللوكيشن الحالي هو: {location}")
    except Exception as e:
        print(f"⚠️ معرفتش أسحب اللوكيشن: {e}")
else:
    print("⚠️ السيرفر رد بس إحنا مش في البلاك ماركت. غالباً دي صفحة تسجيل الدخول.")
    if "login" in response.url.lower() or "password" in response.text.lower():
        print("🔍 الصفحة دي فيها فورم تسجيل دخول! يبقى الكوكي ضربت أو ناقصة.")
