import os
import cloudscraper
from bs4 import BeautifulSoup

# سحب بيانات الدخول
username = os.environ.get('PD_USER')
password = os.environ.get('PD_PASS')

if not username or not password:
    print("❌ خطأ: متغيرات PD_USER أو PD_PASS غير موجودة!")
    exit()

# تجهيز الـ Scraper
scraper = cloudscraper.create_scraper(
    browser={'browser': 'chrome', 'platform': 'windows', 'desktop': True}
)

headers = {
    'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Mobile Safari/537.36',
    'Referer': 'https://www.project-dark.co.uk/'
}

# 1. نروح لصفحة تسجيل الدخول الأول عشان ناخد التوكن
login_url = 'https://www.project-dark.co.uk/login'
print("⏳ جاري فتح صفحة تسجيل الدخول...")
login_page = scraper.get(login_url, headers=headers)

if login_page.status_code != 200:
    print(f"❌ فشل فتح صفحة اللوجين. كود: {login_page.status_code}")
    exit()

# 2. نسحب التوكن (CSRF Token) من الصفحة
soup = BeautifulSoup(login_page.text, 'lxml')
csrf_token = None
token_input = soup.find('input', {'name': '_token'})
if token_input:
    csrf_token = token_input.get('value')

if not csrf_token:
    print("❌ معرفتش ألاقي الـ CSRF Token. ممكن الموقع غير الشكل.")
    exit()

print("🔑 تم سحب التوكن بنجاح. جاري تسجيل الدخول...")

# 3. نبعت بيانات الدخول
login_data = {
    '_token': csrf_token,
    'email': username, 
    'password': password
}

# نعمل POST لصفحة اللوجين
login_response = scraper.post(login_url, data=login_data, headers=headers)

# 4. نروح لصفحة البلاك ماركت
blackmarket_url = 'https://www.project-dark.co.uk/blackmarket'
print("⏳ جاري الدخول للبلاك ماركت...")
response = scraper.get(blackmarket_url, headers=headers)

print(f"🔗 الرابط النهائي: {response.url}")
print(f"📊 كود الحالة: {response.status_code}")

# حفظ الصفحة للمراجعة
with open("response_page.html", "w", encoding="utf-8") as f:
    f.write(response.text)

# 5. نتأكد إحنا فين
if "Black Market" in response.text or "blackmarket" in response.url:
    print("✅ دخلنا البلاك ماركت بنجاح!")
    
    soup2 = BeautifulSoup(response.text, 'lxml')
    try:
        location = "مش لاقيها"
        for tag in soup2.find_all(['div', 'span', 'td']):
            if "Location:" in tag.text:
                location = tag.text.replace("Location:", "").strip()
                break
        print(f"📍 اللوكيشن الحالي هو: {location}")
    except Exception as e:
        print(f"⚠️ معرفتش أسحب اللوكيشن: {e}")
else:
    print("⚠️ فشل الدخول للبلاك ماركت.")
