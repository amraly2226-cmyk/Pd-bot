from playwright.sync_api import sync_playwright
import time

# 🔑 الكوكيز اللي إنت جبتها من متصفح Kiwi (تم تحويلها لصيغة Playwright)
COOKIES = [
    {"name": "device_fp_d", "value": "%7B%22lang%22%3A%22en-US%22%2C%22plat%22%3A%22Linux%20armv81%22%2C%22cores%22%3A8%2C%22mem%22%3Anull%2C%22screen%22%3A%22414x920x24%22%2C%22avail%22%3A%22414x920%22%2C%22tzoff%22%3A-180%2C%22tz%22%3A%22Africa%2FCairo%22%2C%22touch%22%3A1%2C%22mtp%22%3A5%2C%22canvas%22%3A%22ed1357802482%22%7D", "domain": "project-dark.co.uk", "path": "/"},
    {"name": "_ga_JNKJRQ925S", "value": "GS2.1.s1789214101$o8$g1$t1789214137$j24$l0$h0", "domain": ".project-dark.co.uk", "path": "/"},
    {"name": "remember_web_59ba36addc2b2f9401580f014c7f58ea4e30989d", "value": "eyJpdiI6IldLaFg3N0dYN2ZkbWZINjBkV2xjdXc9PSIsInZhbHVlIjoiN2hJMEJ6dnQrYUpJb3loQml2TWJ0eUU3dXl4TjNTUWpQNkYzbmVheG9EQ2JHQ2NEaXRaQW5SWjdmL2VKRllFRDlxaVprUGd6bU9pZy9zbEpqaTZLdUpnMHNDY2tCM2YrbkcrRzRwTkhtajNITGxxdkQ5QUhzcmRGUTYxL3lKNERRbTYxdXpnSmQ0N1VaSTU2N3ZOWGNJVEZVcEI2dVFqa3FwMmpzbVlsRDlZZGwxUElNNDZycmV2Z3pTSGpkcTdITkxkcWdmS0w5Rldvb09CUUxFSE9PTDdOaEVDNWc2d3hIODBOcFdNdmRXVT0iLCJtYWMiOiI4ZWVjNmMxMWZkMjQ3NjgwNjhmYTAzMDU2MzM1ODcwZWE2ZjAzY2ZiN2RlNDI4ODU4NzhkMThiNzU5NmRmZmZmIiwidGFnIjoiIn0%3D", "domain": ".project-dark.co.uk", "path": "/"},
    {"name": "device_fp", "value": "00cad2c6896d259a5ecbceded5efe770bb8b3e5407d0d39f4e54990a5f3d9835", "domain": "project-dark.co.uk", "path": "/"},
    {"name": "_ga", "value": "GA1.1.1994605517.1787739453", "domain": ".project-dark.co.uk", "path": "/"},
    {"name": "project-dark-session", "value": "eyJpdiI6Ikl1WlIvbHczd2RhS3BKMVlGeHRuSXc9PSIsInZhbHVlIjoicnN3VmEvVkZubE91MzRqcWJGbHlYcloySUgzaXpkVWdHZTdxRTdPakZGdHZvNWFQZ0JYVVRRbFB2YmRmbWtKY1YwcjNGaTB2VWhVMVpFL2pLUFd1cjBoaitVMEJ5NjV2Ny9scE0wankxNGVMRjJDU0Jub0p4bGZRdWlMK1lUbDAiLCJtYWMiOiJiOTk4ZGYwNDQ4MTY5NGFiNGNjODk3ODAxZWZhYzJlOTVhZTE4NzJmNDFkYWQ3M2I2OGM2NTU0YjhkOTI4ZDJjIiwidGFnIjoiIn0%3D", "domain": ".project-dark.co.uk", "path": "/"},
    {"name": "XSRF-TOKEN", "value": "eyJpdiI6IkRlbG5MQitsczhUcnVqVFNGSmdwbEE9PSIsInZhbHVlIjoiZTZNSld1SHRiMmRCaWhpb28rc3pyUTg3RjdyY3BzeWVnaHVQVzl5WHB3bFl6b2JqUW1SSXVjb0U3K1R3VU4ydWtlQ3ZIeXV0MzNWMjNtb21JWXI3UGc5UXFNNkdkVzJZQVlOUkxRMTB6YVpyc3BpY05BT01vSEY0NCtmRnFGSWkiLCJtYWMiOiIwOTE2MDgxNDgzYzEwODgzZTM1MTk0ODUzZTk2ZWMxYzJlNWUwODcwY2IyZTZjYWYwM2FlMGRmYmEyNjQwMDI3IiwidGFnIjoiIn0%3D", "domain": ".project-dark.co.uk", "path": "/"}
]

with sync_playwright() as p:
    print("⏳ 1. جاري تشغيل المتصفح...")
    browser = p.chromium.launch(headless=True, args=['--no-sandbox', '--disable-setuid-sandbox'])
    
    context = browser.new_context(
        user_agent="Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Mobile Safari/537.36"
    )
    
    # ✅ هنا بنحط الكوكيز مباشرة في المتصفح
    print("🍪 2. جاري تحميل الكوكيز في المتصفح...")
    context.add_cookies(COOKIES)
    
    page = context.new_page()

    print("⏳ 3. جاري الدخول لصفحة البلاك ماركت مباشرة...")
    page.goto("https://www.project-dark.co.uk/blackmarket")
    
    # استنى شوية عشان الصفحة تحمل
    page.wait_for_timeout(5000)

    print(f"🔗 الرابط النهائي: {page.url}")

    if "blackmarket" in page.url.lower():
        print("\n✅ ✅ ✅ دخلنا البلاك ماركت بنجاح باستخدام الكوكيز! ✅ ✅ ✅")
        try:
            location_element = page.locator("text=Location:").first
            location = location_element.inner_text()
            print(f"📍 اللوكيشن الحالي هو: {location}")
        except Exception as e:
            print(f"⚠️ معرفتش أسحب اللوكيشن: {e}")
    else:
        print("\n❌ ❌ ❌ فشل الدخول بالكوكيز. لسه في صفحة اللوجين.")
    
    browser.close()
