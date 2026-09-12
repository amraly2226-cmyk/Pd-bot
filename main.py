import os
import cloudscraper
from bs4 import BeautifulSoup

raw_cookie = os.environ.get('PROJECT_DARK_COOKIE')

if not raw_cookie:
    print("❌ خطأ: متغير الكوكي غير موجود في Railway!")
    exit()

scraper = cloudscraper.create_scraper(
    browser={'browser': 'chrome', 'platform': 'windows', 'desktop': True}
)

headers = {
    'Cookie': raw_cookie,
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
    'Referer': 'https://www.project-dark.co.uk/'
}

url = 'https://www.project-dark.co.uk/blackmarket'

print("⏳ جاري الدخول...")
response = scraper.get(url, headers=headers, timeout=15)

if response.status_code == 200 and "Black Market" in response.text:
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

    with open("blackmarket_page.html", "w", encoding="utf-8") as f:
        f.write(response.text)
        print("📁 تم حفظ الصفحة في ملف blackmarket_page.html")
else:
    print(f"❌ فشل الدخول. كود الحالة: {response.status_code}")
