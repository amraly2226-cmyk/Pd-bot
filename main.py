import cloudscraper
from bs4 import BeautifulSoup

# 🔑 بيانات الدخول الخاصة بك
USERNAME = "amr.aly.2226@gmail.com"
PASSWORD = "Gun@12345"

# تجهيز الـ Scraper عشان يبين إنه موبايل أندرويد
scraper = cloudscraper.create_scraper(
    browser={
        'browser': 'chrome',
        'platform': 'android',
        'mobile': True,
        'desktop': False
    }
)

headers = {
    'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Mobile Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.5',
    'Referer': 'https://www.project-dark.co.uk/'
}

print("⏳ 1. جاري فتح صفحة تسجيل الدخول...")
login_url = "https://www.project-dark.co.uk/login"
login_page = scraper.get(login_url, headers=headers)

if login_page.status_code != 200:
    print(f"❌ فشل فتح صفحة اللوجين. كود الحالة: {login_page.status_code}")
    exit()

# سحب الـ CSRF Token
soup = BeautifulSoup(login_page.text, 'lxml')
token_input = soup.find('input', {'name': '_token'})

if not token_input:
    print("❌ معرفتش ألاقي التوكن (CSRF Token).")
    exit()

csrf_token = token_input.get('value')
print("🔑 2. تم سحب التوكن بنجاح. جاري تسجيل الدخول...")

# تجهيز بيانات الدخول
login_data = {
    '_token': csrf_token,
    'email': USERNAME,
    'password': PASSWORD
}

# إرسال طلب الدخول
login_response = scraper.post(login_url, data=login_data, headers=headers)
print(f"📊 3. تم إرسال بيانات الدخول. كود الحالة: {login_response.status_code}")

# التوجه لصفحة البلاك ماركت
print("⏳ 4. جاري الدخول لصفحة البلاك ماركت...")
blackmarket_url = "https://www.project-dark.co.uk/blackmarket"
response = scraper.get(blackmarket_url, headers=headers)

print(f"🔗 الرابط النهائي: {response.url}")
print(f"📊 كود الحالة: {response.status_code}")

# التأكد من نجاح الدخول
if "Black Market" in response.text or "blackmarket" in response.url:
    print("\n✅ ✅ ✅ دخلنا البلاك ماركت بنجاح! ✅ ✅ ✅")
    
    # سحب اللوكيشن
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
    print("\n❌ ❌ ❌ فشل الدخول للبلاك ماركت. لسه بنرجع لصفحة اللوجين. ❌ ❌ ❌")
    print("السبب: ممكن الكوكي محتاجة تتحدث، أو الموقع فيه تحديث جديد.")
    print("🔍 تأكد إن الإيميل والباسورد صح، وإن Cloudflare مش بيعمل بلوك.")
