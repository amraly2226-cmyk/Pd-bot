from playwright.sync_api import sync_playwright
from datetime import datetime, timedelta
from PIL import Image, ImageOps, ImageFilter
import time
import re
import threading
import os
import sys
import io
import random
import base64
import requests
import pytesseract

USERNAME = "amr.aly.2226@gmail.com"
PASSWORD = "Gun@12345"

# ═══════════════════════════════════════════════════════════════
# ⏰ المواعيد
# ═══════════════════════════════════════════════════════════════

WORK_START = "10:00"
WORK_END = "22:00"

# ═══════════════════════════════════════════════════════════════

DISCORD_WEBHOOK = "https://discord.com/api/webhooks/1552282827150860389/1x5A1zhour3DadjDx1f-ZPxFphYm450-v2pK0ubyJuFbr_sAxwb1RZYhqFejL-wK6tzh"

STEALTH_SCRIPT = """
    Object.defineProperty(navigator, 'webdriver', {get: () => undefined, configurable: true});
    Object.defineProperty(navigator, 'languages', {get: () => ['en-US', 'en'], configurable: true});
    window.chrome = { runtime: {}, loadTimes: function(){}, csi: function(){}, app: {} };
    const originalQuery = window.navigator.permissions.query;
    window.navigator.permissions.query = (parameters) => (
        parameters.name === 'notifications' ?
            Promise.resolve({ state: Notification.permission }) :
            originalQuery(parameters)
    );
"""

MOBILE_UA = "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Mobile Safari/537.36"
MOBILE_VIEWPORT = {"width": 414, "height": 920}


def is_work_time():
    now = datetime.now()
    start_h, start_m = map(int, WORK_START.split(':'))
    end_h, end_m = map(int, WORK_END.split(':'))
    start_min = start_h * 60 + start_m
    end_min = end_h * 60 + end_m
    current_min = now.hour * 60 + now.minute
    return start_min <= current_min < end_min


def seconds_until_work():
    now = datetime.now()
    start_h, start_m = map(int, WORK_START.split(':'))
    target = now.replace(hour=start_h, minute=start_m, second=0, microsecond=0)
    if now >= target:
        target += timedelta(days=1)
    return int((target - now).total_seconds())


def wait_for_work_time(label=""):
    while not is_work_time():
        secs = seconds_until_work()
        hours = secs // 3600
        mins = (secs % 3600) // 60
        print(f"😴 [{label}] مش وقت الشغل ({WORK_START} - {WORK_END}) — هستنى {hours}س {mins}د...")
        for _ in range(secs):
            time.sleep(1)
            if is_work_time():
                print(f"🌅 [{label}] وقت الشغل بدأ!")
                return


def human_sleep(min_sec=2.0, max_sec=5.0):
    time.sleep(random.uniform(min_sec, max_sec))


def human_click(page, locator, timeout=5000):
    try:
        locator.click(timeout=timeout, force=True)
        return True
    except:
        pass
    try:
        box = locator.bounding_box(timeout=2000)
        if box and box['width'] > 0:
            target_x = box['x'] + box['width'] / 2
            target_y = box['y'] + box['height'] / 2
            page.mouse.move(target_x, target_y, steps=random.randint(8, 15))
            time.sleep(random.uniform(0.1, 0.3))
            page.mouse.down()
            time.sleep(random.uniform(0.05, 0.1))
            page.mouse.up()
            return True
    except:
        pass
    try:
        locator.evaluate("el => el.click()")
        return True
    except:
        pass
    return False


def random_mouse_moves(page, count=None):
    if count is None:
        count = random.randint(1, 3)
    for _ in range(count):
        try:
            x = random.randint(50, MOBILE_VIEWPORT['width'] - 50)
            y = random.randint(100, MOBILE_VIEWPORT['height'] - 100)
            page.mouse.move(x, y, steps=random.randint(5, 15))
            time.sleep(random.uniform(0.15, 0.6))
        except:
            pass


def maybe_scroll(page):
    if random.random() < 0.35:
        try:
            page.mouse.wheel(0, random.randint(-150, 300))
            time.sleep(random.uniform(0.3, 0.8))
        except:
            pass


def random_break(short=False):
    if short:
        if random.random() < 0.20:
            b = random.randint(15, 60)
            print(f"☕ [بريك] هستنى {b} ث...")
            time.sleep(b)
    else:
        if random.random() < 0.12:
            b = random.randint(60, 240)
            print(f"☕ [بريك] هستنى {b//60}د {b%60}ث...")
            time.sleep(b)


# ═══════════════════════════════════════════════════════════════

COOKIES = [
    {
        "name": "device_fp_d",
        "value": "%7B%22lang%22%3A%22en-US%22%2C%22plat%22%3A%22Linux%20armv81%22%2C%22cores%22%3A8%2C%22mem%22%3Anull%2C%22screen%22%3A%22414x920x24%22%2C%22avail%22%3A%22414x920%22%2C%22tzoff%22%3A-180%2C%22tz%22%3A%22Africa%2FCairo%22%2C%22touch%22%3A1%2C%22mtp%22%3A5%2C%22canvas%22%3A%22ed1357802482%22%7D",
        "domain": "project-dark.co.uk",
        "path": "/",
        "secure": False,
        "httpOnly": False,
        "sameSite": "Lax",
    },
    {
        "name": "_ga_JNKJRQ925S",
        "value": "GS2.1.s1789558989$o12$g1$t1789559027$j22$l0$h0",
        "domain": ".project-dark.co.uk",
        "path": "/",
        "secure": False,
        "httpOnly": False,
        "sameSite": "Lax",
    },
    {
        "name": "remember_web_59ba36addc2b2f9401580f014c7f58ea4e30989d",
        "value": "eyJpdiI6IldLaFg3N0dYN2ZkbWZINjBkV2xjdXc9PSIsInZhbHVlIjoiN2hJMEJ6dnQrYUpJb3loQml2TWJ0eUU3dXl4TjNTUWpQNkYzbmVheG9EQ2JHQ2NEaXRaQW5SWjdmL2VKRllFRDlxaVprUGd6bU9pZy9zbEpqaTZLdUpnMHNDY2tCM2YrbkcrRzRwTkhtajNITGxxdkQ5QUhzcmRGUTYxL3lKNERRbTYxdXpnSmQ0N1VaSTU2N3ZOWGNJVEZVcEI2dVFqa3FwMmpzbVlsRDlZZGwxUElNNDZycmV2Z3pTSGpkcTdITkxkcWdmS0w5Rldvb09CUUxFSE9PTDdOaEVDNWc2d3hIODBOcFdNdmRXVT0iLCJtYWMiOiI4ZWVjNmMxMWZkMjQ3NjgwNjhmYTAzMDU2MzM1ODcwZWE2ZjAzY2ZiN2RlNDI4ODU4NzhkMThiNzU5NmRmZmZmIiwidGFnIjoiIn0%3D",
        "domain": ".project-dark.co.uk",
        "path": "/",
        "secure": True,
        "httpOnly": True,
        "sameSite": "Lax",
    },
    {
        "name": "device_fp",
        "value": "00cad2c6896d259a5ecbceded5efe770bb8b3e5407d0d39f4e54990a5f3d9835",
        "domain": "project-dark.co.uk",
        "path": "/",
        "secure": False,
        "httpOnly": False,
        "sameSite": "Lax",
    },
    {
        "name": "_ga",
        "value": "GA1.1.1994605517.1787739453",
        "domain": ".project-dark.co.uk",
        "path": "/",
        "secure": False,
        "httpOnly": False,
        "sameSite": "Lax",
    },
    {
        "name": "pd_did",
        "value": "bf7b685500b8b651cae5e2927fa456a0",
        "domain": "project-dark.co.uk",
        "path": "/",
        "secure": False,
        "httpOnly": False,
        "sameSite": "Lax",
    },
    {
        "name": "project-dark-session",
        "value": "eyJpdiI6IjVXTGdQM2VMRi9qRmVCdno1M0pvMVE9PSIsInZhbHVlIjoiSkU2NXVxTEJQSEI1ekNnZ2V5Y1hIclhRNUdsR25Gd09Id1ZaS2ZWeWhSUENEeC9NQm10MFhmWGlWb2hLYTVmNkpLRkVMZHlZbW80ZWlDZ1A5cS9HNktDOVRnaTF5YldZektFUnlvRjh6cTFDM3lLelc4Y0V3WTFPMERNUVBrRjMiLCJtYWMiOiIyZDc2ODU4ZThiMjMxZDNkMjA0NTUxOGRjZDFmMzlhNDE1NmY0ZTM2NTA2NDYzZjE5Nzc3NmE5MTM5ZDJlYWEzIiwidGFnIjoiIn0%3D",
        "domain": ".project-dark.co.uk",
        "path": "/",
        "secure": True,
        "httpOnly": True,
        "sameSite": "Lax",
    },
    {
        "name": "XSRF-TOKEN",
        "value": "eyJpdiI6InhOYy9ZcDhPc0ZEYTZqVG16WGtVN3c9PSIsInZhbHVlIjoidVJ6S1RxTlFOMFBxRkNoS1loSGlhOEQvek1EcDVnTVI5Z0NhRDNTeVphNHhLU0ZzTXZKZ3ZVaTlrK3RGSjZqTERqVEFFUmEyU2Erd0lrT2ViUndERFE1OGwvYUxvSGZIVXcwT1JHVWFYVW5TVVZINkdja0FLQ2hkRTJuVFZZMXkiLCJtYWMiOiI2NWFiZDg1N2U5MzgzZGU1Njg1NTUwMGY0MGI1MzFlNzZlM2M3NWEwNzM3OWNmMDA4M2I4MGQ2ZDY4ZTMyNzNiIiwidGFnIjoiIn0%3D",
        "domain": ".project-dark.co.uk",
        "path": "/",
        "secure": True,
        "httpOnly": False,
        "sameSite": "Lax",
    },
]

ITEMS = ["Anabolic steroid", "Artifacts", "Alcohol", "Electronics", "Plastic jewelry",
         "Stolen paintings", "Human beings", "Confidential documents",
         "Endangered exotic animals", "Organs"]
STOCKS_INTERVAL = 30 * 60
JAIL_WAIT = 5 * 60


def sleep(ms): time.sleep(ms / 1000.0)


def parse_cooldown(text):
    t = 0
    h = re.search(r'(\d+)\s*h', text)
    if h: t += int(h.group(1)) * 3600
    m = re.search(r'(\d+)\s*m', text)
    if m: t += int(m.group(1)) * 60
    s = re.search(r'(\d+)\s*s', text)
    if s: t += int(s.group(1))
    return t


def check_if_jailed(page):
    try:
        return '/jail' in page.url.lower()
    except:
        return False


def stop_bot(reason="الوقت المحدد"):
    print(f"\n🛑 البرنامج بيتوقف — السبب: {reason}")
    print("💤 هنام كويس، باي باي! 👋")
    sys.stdout.flush()
    time.sleep(2)
    os._exit(0)


# ═══════════════════════════════════════════════════════════════
# 🚨 دوال الكابتشا
# ═══════════════════════════════════════════════════════════════

def notify_discord(msg, image_bytes=None):
    if not DISCORD_WEBHOOK or "YOUR_URL_HERE" in DISCORD_WEBHOOK:
        print(f"⚠️ [Discord] مش متظبط — {msg}")
        return
    try:
        if image_bytes:
            requests.post(
                DISCORD_WEBHOOK,
                data={"content": msg},
                files={"file": ("captcha.png", image_bytes, "image/png")},
                timeout=15
            )
        else:
            requests.post(DISCORD_WEBHOOK, json={"content": msg}, timeout=15)
    except Exception as e:
        print(f"⚠️ [Discord] مشكلة: {e}")


def detect_captcha(page):
    try:
        if '/verify' in page.url.lower():
            return True
        try:
            if page.locator('button:has-text("Verify")').count() > 0:
                return True
        except:
            pass
        return False
    except:
        return False


def build_instruction_patterns():
    """
    ترتيب التعليمات بالأهمية:
    - الأكثر تحديدًا الأول
    - العام آخر
    """
    return [
        r'type\s+only\s+the\s+letters',
        r'type\s+only\s+the\s+numbers',
        r'type\s+the\s+letters\s+only',
        r'type\s+the\s+numbers\s+only',
        r'only\s+the\s+letters',
        r'only\s+the\s+numbers',
        r'letters\s+only',
        r'numbers\s+only',
        r'type\s+the\s+letters',
        r'type\s+the\s+numbers',
        r'type\s+it\s+backwards',
        r'type\s+backwards',
        r'reverse',
        r'type\s+the\s+characters',
        r'type\s+the\s+code',
        r'enter\s+the\s+code',
        r'type\s+what\s+you\s+see',
    ]


def parse_instruction(instruction):
    """يفهم نوع الكابتشا من النص"""
    ins = instruction.lower()

    # فحص "letters only" — لاحظ إن ممكن تكون "letters only" أو "only letters"
    wants_letters_only = (
        ('letter' in ins) and ('only' in ins)
    ) or ('letters only' in ins) or ('only letters' in ins) or ('only the letters' in ins)

    wants_numbers_only = (
        ('number' in ins) and ('only' in ins)
    ) or ('numbers only' in ins) or ('only numbers' in ins) or ('only the numbers' in ins)

    wants_reverse = ('backward' in ins) or ('reverse' in ins)

    return wants_letters_only, wants_numbers_only, wants_reverse


def preprocess_images(img_bytes):
    """
    يرجع ليستة (اسم, صورة) بمعالجات مختلفة
    عشان نجرب كل واحدة في OCR
    """
    result = []
    try:
        img = Image.open(io.BytesIO(img_bytes))

        # 1. مكبرة عادي (RGB)
        big = img.resize((img.width * 5, img.height * 5), Image.LANCZOS)
        result.append(('resized', big))

        # 2. Grayscale مع autocontrast
        try:
            gray = big.convert('L')
            gray = ImageOps.autocontrast(gray, cutoff=2)
            result.append(('gray_auto', gray))

            # 3. Thresholds مختلفة
            for t in [80, 100, 120, 140, 160, 180, 200]:
                bw = gray.point(lambda p, th=t: 255 if p > th else 0)
                result.append((f'bw_{t}', bw))

            # 4. عكسي
            inv = gray.point(lambda p: 0 if p > 130 else 255)
            result.append(('inv', inv))

            # 5. threshold معتدل بعد blur
            blurred = gray.filter(ImageFilter.MedianFilter(size=3))
            bw2 = blurred.point(lambda p: 255 if p > 130 else 0)
            result.append(('bw_blur', bw2))
        except Exception as e:
            print(f"⚠️ [preprocess gray] {e}")

        # 6. كل channel من RGB
        try:
            r, g, b = big.split()
            result.append(('r', ImageOps.autocontrast(r)))
            result.append(('g', ImageOps.autocontrast(g)))
            result.append(('b', ImageOps.autocontrast(b)))
        except Exception as e:
            print(f"⚠️ [preprocess rgb] {e}")

        # 7. HSV - Value channel (بيخلي الحروف الملونة بيضاء)
        try:
            hsv = big.convert('HSV')
            h, s, v = hsv.split()
            v = ImageOps.autocontrast(v, cutoff=3)
            result.append(('hsv_v', v))
            bw_v = v.point(lambda p: 255 if p > 160 else 0)
            result.append(('hsv_v_bw', bw_v))
        except Exception as e:
            print(f"⚠️ [preprocess hsv] {e}")

    except Exception as e:
        print(f"⚠️ [preprocess] {e}")

    return result


def run_ocr_on_images(images):
    """
    يجرب OCR على كل صورة بـ configs مختلفة
    """
    configs = [
        '--psm 7 -c tessedit_char_whitelist=ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789',
        '--psm 8 -c tessedit_char_whitelist=ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789',
        '--psm 13 -c tessedit_char_whitelist=ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789',
        '--psm 7',
        '--psm 8',
    ]

    results = []
    for name, img in images:
        for cfg in configs:
            try:
                r = pytesseract.image_to_string(img, config=cfg).strip()
                r = r.replace(' ', '').replace('\n', '').replace('\t', '')
                r = ''.join(c for c in r if c.isalnum())
                if r and len(r) >= 2:
                    results.append((name, cfg.split()[1] if len(cfg.split()) > 1 else '', r))
            except:
                continue
    return results


def solve_captcha(page):
    print("🚨 [كابتشا] ظهرت — بدور على الحل...")

    instruction = "type what you see"
    img_bytes = None

    try:
        # ─── 1. نقرا التعليمات ───
        try:
            page_text = page.evaluate("() => document.body.innerText")
            if page_text:
                text_lower = page_text.lower()
                for pattern in build_instruction_patterns():
                    m = re.search(pattern, text_lower)
                    if m:
                        instruction = m.group(0)
                        break
        except Exception as e:
            print(f"⚠️ [كابتشا] قراءة التعليمات: {e}")

        print(f"📋 [كابتشا] التعليمات: '{instruction}'")

        wants_letters, wants_numbers, wants_reverse = parse_instruction(instruction)
        print(f"🔧 [كابتشا] تحليل: letters_only={wants_letters} | numbers_only={wants_numbers} | reverse={wants_reverse}")

        # ─── 2. صورة الكابتشا ───
        try:
            img_element = page.locator('img').first
            if img_element.count() > 0:
                try:
                    img_element.scroll_into_view_if_needed(timeout=2000)
                except:
                    pass
                time.sleep(0.5)
                try:
                    img_bytes = img_element.screenshot(timeout=4000)
                    print("📸 [كابتشا] صورة العنصر")
                except:
                    pass
        except:
            pass

        if not img_bytes:
            try:
                img_bytes = page.screenshot(full_page=False)
                print("📸 [كابتشا] صورة الصفحة")
            except:
                pass

        if not img_bytes:
            try:
                b64 = page.evaluate("""() => {
                    const img = document.querySelector('img');
                    if (!img) return null;
                    const canvas = document.createElement('canvas');
                    canvas.width = img.naturalWidth || img.width;
                    canvas.height = img.naturalHeight || img.height;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0);
                    return canvas.toDataURL('image/png').split(',')[1];
                }""")
                if b64:
                    img_bytes = base64.b64decode(b64)
                    print("📸 [كابتشا] صورة canvas")
            except Exception as e:
                print(f"⚠️ [كابتشا] canvas: {e}")

        if not img_bytes:
            notify_discord(
                f"🚨 **كابتشا** — مش قادر أاخد صورة\n"
                f"📋 التعليمات: `{instruction}`\n"
                f"🛑 **البوت بيتوقف** — افتح اللعبة وحلها"
            )
            stop_bot("كابتشا — مفيش صورة")

        # ─── 3. معالجة الصورة + OCR ───
        images = preprocess_images(img_bytes)
        print(f"🖼️ [كابتشا] عدد الصور المعالجة: {len(images)}")

        all_results = run_ocr_on_images(images)

        # نطبع أفضل 5 نتائج
        unique_results = {}
        for name, cfg, text in all_results:
            if text not in unique_results or len(text) > len(unique_results[text]):
                unique_results[text] = name

        print(f"🤖 [كابتشا] نتائج OCR ({len(unique_results)}):")
        for text, source in sorted(unique_results.items(), key=lambda x: -len(x[0]))[:8]:
            print(f"   - [{source}] '{text}'")

        # ─── 4. نختار الأفضل ───
        if not unique_results:
            text = ""
        else:
            # نفلتر اللي طوله >= 3
            candidates = [t for t in unique_results.keys() if len(t) >= 3]
            if candidates:
                text = max(candidates, key=len)
            else:
                text = max(unique_results.keys(), key=len)

        print(f"🤖 [كابتشا] الأفضل خام: '{text}'")

        # ─── 5. نطبق التعليمات ───
        original = text
        if wants_letters:
            text = ''.join(c for c in text if c.isalpha())
        elif wants_numbers:
            text = ''.join(c for c in text if c.isdigit())

        if wants_reverse:
            text = text[::-1]

        print(f"📝 [كابتشا] بعد الفلترة: '{text}'")

        if len(text) < 2:
            notify_discord(
                f"🚨 **كابتشا** — OCR فشل\n"
                f"📋 التعليمات: `{instruction}`\n"
                f"🔍 قرا: `{original}`\n"
                f"📝 بعد الفلترة: `{text}`\n"
                f"🛑 **البوت بيتوقف** — افتح اللعبة وحلها",
                img_bytes
            )
            stop_bot("كابتشا — OCR فشل")

        # ─── 6. نكتب الإجابة ───
        try:
            input_field = page.locator('input[type="text"]').first
            if input_field.count() == 0:
                input_field = page.locator('input').first

            if input_field.count() > 0:
                input_field.fill('')
                time.sleep(random.uniform(0.3, 0.7))
                input_field.type(text, delay=random.randint(80, 220))
                time.sleep(random.uniform(0.4, 1.0))

                verify_btn = page.locator('button:has-text("Verify")').first
                human_click(page, verify_btn)
                print(f"✅ [كابتشا] بعتنا: {text}")
                time.sleep(4)
            else:
                notify_discord(
                    f"🚨 **كابتشا** — مفيش input\n"
                    f"✍️ حاولت: `{text}`\n"
                    f"🛑 **البوت بيتوقف**",
                    img_bytes
                )
                stop_bot("كابتشا — مفيش input")
        except Exception as e:
            print(f"⚠️ [كابتشا] مشكلة الكتابة: {e}")

        # ─── 7. النتيجة ───
        if '/verify' not in page.url.lower():
            print("🎉 [كابتشا] اتخطيناها!")
            notify_discord(f"✅ **كابتشا** — اتحلت: `{text}`")
            return True
        else:
            notify_discord(
                f"🚨 **كابتشا** — OCR غلط\n"
                f"📋 التعليمات: `{instruction}`\n"
                f"❌ حاولت بـ: `{text}`\n"
                f"🛑 **البوت بيتوقف**",
                img_bytes
            )
            stop_bot("كابتشا — OCR غلط")

    except Exception as e:
        print(f"⚠️ [كابتشا] خطأ: {e}")
        import traceback
        traceback.print_exc()
        try:
            notify_discord(
                f"🚨 **كابتشا** — خطأ: `{e}`\n🛑 **البوت بيتوقف**",
                img_bytes
            )
        except:
            pass
        stop_bot(f"كابتشا — خطأ: {e}")


def handle_captcha_if_any(page):
    if not detect_captcha(page):
        return True
    return solve_captcha(page)


# ═══════════════════════════════════════════════════════════════
# 📈 بوت الأسهم
# ═══════════════════════════════════════════════════════════════

def run_stocks_bot():
    wait_for_work_time("الأسهم")

    print("📈 [الأسهم] بدأ التشغيل...")
    with sync_playwright() as p:
        browser = p.chromium.launch(
            headless=True,
            args=[
                '--no-sandbox', '--disable-setuid-sandbox',
                '--disable-dev-shm-usage', '--disable-gpu',
                '--disable-blink-features=AutomationControlled',
                '--disable-features=IsolateOrigins,site-per-process'
            ]
        )
        context = browser.new_context(
            user_agent=MOBILE_UA,
            viewport=MOBILE_VIEWPORT,
            device_scale_factor=3,
            is_mobile=True,
            has_touch=True,
            locale="en-US",
            timezone_id="Africa/Cairo"
        )
        context.add_init_script(STEALTH_SCRIPT)
        context.add_cookies(COOKIES)
        page = context.new_page()
        page.set_default_timeout(15000)
        time.sleep(random.uniform(4, 7))

        while True:
            try:
                if not is_work_time():
                    print("\n🌙 [الأسهم] وقت الشغل خلص — بينام")
                    try: page.goto('about:blank')
                    except: pass
                    wait_for_work_time("الأسهم")

                print("\n" + "=" * 50)
                print("📈 [الأسهم] جاري الدخول...")
                print("=" * 50)
                page.goto('https://project-dark.co.uk/stocks',
                          wait_until='domcontentloaded', timeout=60000)
                print("✅ [الأسهم] دخلنا")
                human_sleep(1.5, 3.0)

                handle_captcha_if_any(page)

                try:
                    page.wait_for_selector('tr', timeout=20000)
                except:
                    pass
                human_sleep(1.0, 2.0)

                random_mouse_moves(page)
                maybe_scroll(page)

                if check_if_jailed(page):
                    print(f"🚔 [الأسهم] سجن!")
                    for _ in range(JAIL_WAIT // 60):
                        time.sleep(60)
                    continue

                print("\n🔴 [الأسهم] [1/2] بيع...")
                try:
                    sell_btn = page.locator('button:has-text("Sell All")').first
                    if sell_btn.count() > 0:
                        if human_click(page, sell_btn):
                            print("✅ [الأسهم] داس Sell All")
                            human_sleep(2.0, 3.5)
                            try:
                                cf = page.locator('button:has-text("SELL ALL")').last
                                cf.wait_for(state="visible", timeout=10000)
                                human_click(page, cf)
                                print("✅ [الأسهم] تم البيع!")
                                human_sleep(5.0, 7.5)
                            except Exception as e:
                                print(f"⚠️ [الأسهم] مشكلة البيع: {e}")
                except Exception as e:
                    err = str(e)
                    if 'Execution context was destroyed' in err or 'navigation' in err.lower():
                        print("🚔 [الأسهم] الصفحة اتنقلت")
                        continue

                if check_if_jailed(page):
                    print(f"🚔 [الأسهم] سجن بعد البيع!")
                    for _ in range(JAIL_WAIT // 60):
                        time.sleep(60)
                    continue

                print("\n🟢 [الأسهم] [2/2] شراء...")
                bought_count = 0
                for attempt in range(15):
                    try:
                        if check_if_jailed(page):
                            print(f"🚔 [الأسهم] سجن!")
                            for _ in range(JAIL_WAIT // 60):
                                time.sleep(60)
                            break

                        found_green = False
                        rows = page.locator('tr')
                        for i in range(rows.count()):
                            try:
                                row = rows.nth(i)
                                row_text = row.inner_text()
                                if ('↑' in row_text or '▲' in row_text):
                                    max_btn = row.locator('button:has-text("Max Buy")').first
                                    if max_btn.count() > 0:
                                        random_mouse_moves(page, 1)
                                        maybe_scroll(page)
                                        if human_click(page, max_btn):
                                            found_green = True
                                            break
                            except:
                                continue

                        if not found_green:
                            break

                        bought_count += 1
                        print(f"✅ [الأسهم] سهم أخضر {bought_count}")
                        human_sleep(2.5, 4.0)

                        try:
                            cf = page.locator('button:has-text("BUY MAX")').last
                            cf.wait_for(state="visible", timeout=10000)
                            human_click(page, cf)
                            print(f"✅ [الأسهم] تم شراء السهم {bought_count}")
                            human_sleep(3.5, 5.5)
                        except Exception as e:
                            print(f"⚠️ [الأسهم] مشكلة: {e}")
                            break

                        random_break(short=True)

                    except Exception as e:
                        err = str(e)
                        if 'Execution context was destroyed' in err or 'navigation' in err.lower():
                            print("🚔 [الأسهم] الصفحة اتنقلت")
                            break
                        print(f"⚠️ [الأسهم] مشكلة: {e}")
                        break

                if bought_count == 0:
                    print("ℹ️ [الأسهم] مفيش أسهم خضراء")
                print(f"📊 [الأسهم] خلصنا: {bought_count} سهم")
                print("=" * 50 + "\n")

            except Exception as e:
                err = str(e)
                if 'Execution context was destroyed' in err or 'navigation' in err.lower():
                    print("🚔 [الأسهم] الصفحة اتنقلت")
                    sleep(3)
                    continue
                print(f"⚠️ خطأ: {e}")

            wait_min = random.uniform(28 * 60, 32 * 60)
            print(f"⏰ [الأسهم] هستنى {int(wait_min/60)}د {int(wait_min%60)}ث...")
            end = time.time() + wait_min
            while time.time() < end:
                time.sleep(1)
                if not is_work_time():
                    break


# ═══════════════════════════════════════════════════════════════
# 🌐 بوت التريد
# ═══════════════════════════════════════════════════════════════

def run_trade_bot():
    wait_for_work_time("التريد")

    print("🌐 [التريد] بدأ التشغيل...")
    with sync_playwright() as p:
        browser = p.chromium.launch(
            headless=True,
            args=[
                '--no-sandbox', '--disable-setuid-sandbox',
                '--disable-dev-shm-usage', '--disable-gpu',
                '--disable-blink-features=AutomationControlled',
                '--disable-features=IsolateOrigins,site-per-process'
            ]
        )
        context = browser.new_context(
            user_agent=MOBILE_UA,
            viewport=MOBILE_VIEWPORT,
            device_scale_factor=3,
            is_mobile=True,
            has_touch=True,
            locale="en-US",
            timezone_id="Africa/Cairo"
        )
        context.add_init_script(STEALTH_SCRIPT)
        context.add_cookies(COOKIES)
        page = context.new_page()
        page.set_default_timeout(15000)
        time.sleep(random.uniform(4, 7))

        try:
            page.goto('https://www.project-dark.co.uk/blackmarket',
                      wait_until='domcontentloaded', timeout=60000)
            print("✅ [التريد] دخلنا")
            human_sleep(1.5, 3.0)
            handle_captcha_if_any(page)
        except Exception as e:
            print(f"⚠️ مشكلة: {e}")

        while True:
            try:
                if not is_work_time():
                    print("\n🌙 [التريد] وقت الشغل خلص — بينام")
                    try: page.goto('about:blank')
                    except: pass
                    wait_for_work_time("التريد")
                    try:
                        page.goto('https://www.project-dark.co.uk/blackmarket',
                                  wait_until='domcontentloaded')
                    except:
                        pass
                    continue

                if check_if_jailed(page):
                    print(f"🚔 [التريد] سجن!")
                    for _ in range(JAIL_WAIT // 60):
                        time.sleep(60)
                    try:
                        page.goto('https://www.project-dark.co.uk/blackmarket',
                                  wait_until='domcontentloaded')
                    except:
                        pass
                    continue

                if 'travel' in page.url:
                    random_mouse_moves(page)
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
                        ws = parse_cooldown(cooldown_text)
                        if ws > 0:
                            ws += random.randint(5, 15)
                            print(f"⏳ [التريد] كولداون: {cooldown_text} - هستنى {ws} ث...")
                            for _ in range(int(ws)):
                                time.sleep(1)
                            page.goto('https://www.project-dark.co.uk/travel',
                                      wait_until='domcontentloaded')
                            human_sleep(4.0, 6.0)
                            continue

                    cc = page.evaluate("""() => {
                        let body = document.body.innerText;
                        let lines = body.split('\\n');
                        for (let i = 0; i < lines.length; i++) {
                            if (lines[i].trim().toUpperCase() === 'LOCATION') {
                                for (let j = i + 1; j < lines.length; j++) {
                                    if (lines[j].trim()) {
                                        if (lines[j].includes('San Francisco')) return 'San Francisco';
                                        if (lines[j].includes('St Louis')) return 'St Louis';
                                        break;
                                    }
                                }
                                break;
                            }
                        }
                        if (body.includes('Black Market - San Francisco')) return 'San Francisco';
                        if (body.includes('Black Market - St Louis')) return 'St Louis';
                        return null;
                    }""")

                    if not cc:
                        human_sleep(20, 40)
                        page.goto('https://project-dark.co.uk/travel',
                                  wait_until='domcontentloaded')
                        human_sleep(4.0, 6.0)
                        continue

                    dc = 'St Louis' if cc == 'San Francisco' else 'San Francisco'
                    print(f"✈️ [التريد] {cc} -> {dc}")

                    try:
                        g = page.locator("text='Grid View'").first
                        if g.count() > 0:
                            human_click(page, g)
                            human_sleep(1.5, 3.0)
                    except:
                        pass

                    try:
                        c = page.locator(f"text='{dc}'").first
                        if c.count() > 0:
                            human_click(page, c)
                            human_sleep(1.5, 3.0)
                    except:
                        pass

                    try:
                        t = page.locator("button:has-text('Travel to Selected Location')").first
                        if t.count() > 0:
                            human_click(page, t)
                            human_sleep(2.0, 3.5)
                    except:
                        pass

                    try:
                        page.wait_for_selector("button:has-text('TRAVEL')", timeout=10000)
                        tv = page.locator("button:has-text('TRAVEL')").last
                        if tv.count() > 0:
                            human_click(page, tv)
                            print(f"🎉 [التريد] تم السفر إلى {dc}!")
                            human_sleep(5.0, 8.0)
                    except:
                        pass

                    page.goto('https://www.project-dark.co.uk/blackmarket',
                              wait_until='domcontentloaded')
                    human_sleep(2.5, 4.0)
                    continue

                random_mouse_moves(page, 1)

                state = page.evaluate("""(items) => {
                    let body = document.body.innerText;
                    let loc = null, cd = null, hold = 0, held = null;
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
                    if (!loc) {
                        if (body.includes('Black Market - San Francisco')) loc = 'San Francisco';
                        else if (body.includes('Black Market - St Louis')) loc = 'St Louis';
                    }
                    let m = body.match(/You cannot travel for:?\\s*([0-9hms ]+)/i);
                    if (m) cd = m[1];
                    let rows = [...document.querySelectorAll('tr')];
                    for (let r of rows) {
                        let t = r.innerText;
                        if (t.includes('Sell') && !t.includes('Confirm')) {
                            for (let it of items) {
                                if (t.toLowerCase().includes(it.toLowerCase())) {
                                    let cells = [...r.querySelectorAll('td')];
                                    if (cells.length >= 3) {
                                        let mt = cells[2].innerText.match(/(\\d+)/);
                                        if (mt && +mt[1] > 0) { held = it; hold = +mt[1]; break; }
                                    }
                                    break;
                                }
                            }
                        }
                    }
                    if (held === null) { let m2 = body.match(/holding (\\d+) items/i); hold = m2 ? +m2[1] : 0; }
                    return { loc, cd, hold, held };
                }""", ITEMS)

                if state['cd']:
                    print(f"⏳ [التريد] كولداون سوق")
                    human_sleep(50, 80)
                    continue

                if state['loc'] == "San Francisco":
                    if state['held'] == "Stolen paintings" and state['hold'] > 0:
                        print("📍 [التريد] SF - بيع اللوحات")
                        try:
                            sell_btn = page.locator('tr').filter(has_text='Stolen paintings').locator('button:has-text("Sell All")').first
                            if sell_btn.count() > 0:
                                human_click(page, sell_btn)
                                human_sleep(2.5, 4.0)
                                cf = page.locator('button:has-text("SELL ALL")').last
                                cf.wait_for(state="visible", timeout=10000)
                                human_click(page, cf)
                                print("✅ [التريد] بيع اللوحات!")
                        except Exception as e:
                            print(f"⚠️ [التريد] {e}")
                        human_sleep(2.5, 4.5)
                        continue
                    if state['held'] == "Plastic jewelry" and state['hold'] > 0:
                        print("📍 [التريد] SF -> STL")
                        page.goto('https://www.project-dark.co.uk/travel',
                                  wait_until='domcontentloaded')
                        human_sleep(3.5, 5.5)
                        continue
                    if state['hold'] == 0:
                        print("📍 [التريد] SF - شراء بلاستيك")
                        try:
                            buy_btn = page.locator('tr').filter(has_text='Plastic jewelry').locator('button:has-text("Max Buy")').first
                            if buy_btn.count() > 0:
                                random_mouse_moves(page, 1)
                                human_click(page, buy_btn)
                                human_sleep(2.5, 4.0)
                                cf = page.locator('button:has-text("BUY MAX")').last
                                cf.wait_for(state="visible", timeout=10000)
                                human_click(page, cf)
                                print("✅ [التريد] شراء بلاستيك!")
                        except Exception as e:
                            print(f"⚠️ [التريد] {e}")
                        human_sleep(2.5, 4.5)
                        continue

                elif state['loc'] == "St Louis":
                    if state['held'] == "Plastic jewelry" and state['hold'] > 0:
                        print("📍 [التريد] STL - بيع البلاستيك")
                        try:
                            sell_btn = page.locator('tr').filter(has_text='Plastic jewelry').locator('button:has-text("Sell All")').first
                            if sell_btn.count() > 0:
                                human_click(page, sell_btn)
                                human_sleep(2.5, 4.0)
                                cf = page.locator('button:has-text("SELL ALL")').last
                                cf.wait_for(state="visible", timeout=10000)
                                human_click(page, cf)
                                print("✅ [التريد] بيع البلاستيك!")
                        except Exception as e:
                            print(f"⚠️ [التريد] {e}")
                        human_sleep(2.5, 4.5)
                        continue
                    if state['held'] == "Stolen paintings" and state['hold'] > 0:
                        print("📍 [التريد] STL -> SF")
                        page.goto('https://www.project-dark.co.uk/travel',
                                  wait_until='domcontentloaded')
                        human_sleep(3.5, 5.5)
                        continue
                    if state['hold'] == 0:
                        print("📍 [التريد] STL - شراء لوحات")
                        try:
                            buy_btn = page.locator('tr').filter(has_text='Stolen paintings').locator('button:has-text("Max Buy")').first
                            if buy_btn.count() > 0:
                                random_mouse_moves(page, 1)
                                human_click(page, buy_btn)
                                human_sleep(2.5, 4.0)
                                cf = page.locator('button:has-text("BUY MAX")').last
                                cf.wait_for(state="visible", timeout=10000)
                                human_click(page, cf)
                                print("✅ [التريد] شراء لوحات!")
                        except Exception as e:
                            print(f"⚠️ [التريد] {e}")
                        human_sleep(2.5, 4.5)
                        continue
                else:
                    human_sleep(40, 70)
                    page.goto('https://www.project-dark.co.uk/blackmarket',
                              wait_until='domcontentloaded')
                    human_sleep(2.5, 4.0)
                    continue

            except Exception as e:
                err = str(e)
                if 'Execution context was destroyed' in err or 'navigation' in err.lower():
                    print("🚔 [التريد] الصفحة اتنقلت")
                    sleep(3)
                    continue
                print(f"⚠️ [التريد] خطأ: {e}")
                human_sleep(10, 20)

            human_sleep(8, 15)
            random_break(short=True)


# ═══════════════════════════════════════════════════════════════
# 🚀 التشغيل
# ═══════════════════════════════════════════════════════════════

if __name__ == "__main__":
    print("🚀🚀🚀 تشغيل بوتين (تريد + أسهم)...")
    print(f"⏰ مواعيد الشغل: من {WORK_START} لـ {WORK_END} (بتوقيت مصر)")
    print("=" * 60)
    if not is_work_time():
        secs = seconds_until_work()
        print(f"😴 الوقت الحالي خارج ساعات الشغل — هيبدأ بعد {secs//3600}س {(secs%3600)//60}د")
    print("=" * 60)
    t1 = threading.Thread(target=run_trade_bot, daemon=True, name="TradeBot")
    t2 = threading.Thread(target=run_stocks_bot, daemon=True, name="StocksBot")
    t1.start()
    t2.start()
    print("✅ التريد:", t1.name)
    print("✅ الأسهم:", t2.name)
    print("=" * 60)
    try:
        while True:
            time.sleep(60)
    except KeyboardInterrupt:
        print("\n🛑 إيقاف.")
