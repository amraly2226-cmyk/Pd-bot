def run_theft_bot():
    print("🚗 [Theft] بدأ التشغيل...")
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True, args=['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu'])
        context = browser.new_context(user_agent="Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Mobile Safari/537.36", viewport={"width": 1920, "height": 1080})
        context.add_cookies(COOKIES)
        page = context.new_page()
        page.set_default_timeout(15000)
        time.sleep(5)
        
        while True:
            try:
                print("\n" + "="*50)
                print("🚗 [Theft] جاري الدخول لصفحة السرقة...")
                print("="*50)
                page.goto('https://project-dark.co.uk/theft', wait_until='domcontentloaded', timeout=60000)
                print("✅ [Theft] دخلنا الصفحة")
                sleep(4000)
                
                def read_state():
                    data = page.evaluate("""() => {
                        const btns = [...document.querySelectorAll('button.theft-steal-btn')].map((b, i) => {
                            const r = b.getBoundingClientRect();
                            return {
                                idx: i,
                                cx: Math.round(r.left + r.width / 2),
                                cy: Math.round(r.top + r.height / 2),
                                top: Math.round(r.top),
                                disabled: b.disabled,
                                isSuccess: b.classList.contains('game-button--success'),
                                visible: b.offsetWidth > 0
                            };
                        });
                        
                        const now_sec = Math.floor(Date.now() / 1000);
                        const timers = [...document.querySelectorAll('span.theft-cd')].map(el => {
                            const r = el.getBoundingClientRect();
                            const expires = parseInt(el.getAttribute('data-expires') || '0', 10);
                            const remaining = Math.max(0, expires - now_sec);
                            return {
                                x: Math.round(r.left + r.width / 2),
                                y: Math.round(r.top + r.height / 2),
                                remaining: remaining,
                                text: (el.textContent || '').trim()
                            };
                        });
                        
                        return {btns, timers};
                    }""")
                    
                    all_btns = data['btns']
                    timers = data['timers']
                    
                    if len(all_btns) == 0:
                        return {'cols': []}
                    
                    # ترتيب الأزرار وتقسيمها على عواميد
                    all_sorted = sorted(all_btns, key=lambda b: (b['cx'], b['top']))
                    columns = []
                    current = [all_sorted[0]]
                    for i in range(1, len(all_sorted)):
                        if abs(all_sorted[i]['cx'] - current[0]['cx']) < 50:
                            current.append(all_sorted[i])
                        else:
                            columns.append(current)
                            current = [all_sorted[i]]
                    columns.append(current)
                    
                    cols_info = []
                    col_names = ['Cars', 'Bikes', 'Vans']
                    
                    for col_idx, col in enumerate(columns):
                        col_sorted = sorted(col, key=lambda b: b['top'])
                        bottom_btn = col_sorted[-1]
                        col_name = col_names[col_idx] if col_idx < 3 else f'Col{col_idx+1}'
                        
                        all_available = all(b['isSuccess'] and not b['disabled'] for b in col)
                        
                        # ✅ نبحث عن كولداون بنفس X العمود (فرق < 100 بكسل)
                        col_timer = None
                        for t in timers:
                            if abs(t['x'] - bottom_btn['cx']) < 100:
                                col_timer = t
                                break
                        
                        # ✅ لو مفيش كولداون بنفس X → العمود جاهز (زي Bikes دلوقتي)
                        if col_timer is None:
                            # مفيش كولداون → جاهز
                            col_available = all_available
                            col_status = "Ready (مفيش كولداون)"
                        else:
                            # فيه كولداون
                            timer_ready = col_timer['remaining'] <= 1
                            col_available = all_available and timer_ready
                            col_status = f"{col_timer['text']} = {col_timer['remaining']}s"
                        
                        cols_info.append({
                            'name': col_name,
                            'bottom_btn': bottom_btn,
                            'available': col_available,
                            'timer': col_timer,
                            'status_text': col_status,
                            'col_cx': bottom_btn['cx']
                        })
                    
                    return {'cols': cols_info}
                
                state = read_state()
                cols_info = state['cols']
                
                if len(cols_info) == 0:
                    print("⏰ [Theft] مفيش أزرار، هستنى 30 ث...")
                    time.sleep(30)
                    continue
                
                print(f"\n📋 [Theft] حالة الأعمدة:")
                for col in cols_info:
                    status = "✅ جاهز" if col['available'] else f"⏳ كولداون ({col['status_text']})"
                    print(f"  {col['name']} (x={col['col_cx']}): آخر زر (idx={col['bottom_btn']['idx']}) - {status}")
                
                clicked_any = False
                for col in cols_info:
                    if not col['available']:
                        continue
                    
                    bottom = col['bottom_btn']
                    print(f"\n🎯 [Theft] بدوس على {col['name']} (idx={bottom['idx']})...")
                    
                    success = False
                    try:
                        loc = page.locator('button.theft-steal-btn').nth(bottom['idx'])
                        loc.scroll_into_view_if_needed()
                        sleep(300)
                        loc.click(force=True, timeout=5000)
                        print(f"✅ [Theft] Playwright click نجح")
                        success = True
                    except Exception as e:
                        print(f"⚠️ [Theft] Playwright فشل: {e}")
                    
                    if not success:
                        try:
                            page.mouse.move(bottom['cx'], bottom['cy'])
                            sleep(200)
                            page.mouse.click(bottom['cx'], bottom['cy'])
                            print(f"✅ [Theft] mouse.click نجح")
                            success = True
                        except Exception as e:
                            print(f"⚠️ [Theft] mouse فشل: {e}")
                    
                    if success:
                        clicked_any = True
                        print(f"🔄 [Theft] refresh بعد الضغط على {col['name']}...")
                        sleep(3000)
                        page.goto('https://project-dark.co.uk/theft', wait_until='domcontentloaded', timeout=60000)
                        sleep(4000)
                        break
                
                if not clicked_any:
                    cd_times = []
                    for col in cols_info:
                        if col['timer'] and col['timer']['remaining'] > 0:
                            cd_times.append((col['timer']['remaining'], col['timer']['text'], col['name']))
                    
                    if cd_times:
                        cd_times.sort()
                        min_sec, min_text, min_col = cd_times[0]
                        wait_sec = min_sec + 15
                        print(f"\n⏰ [Theft] كل الأعمدة في كولداون.")
                        print(f"   أقصر واحد: {min_col} ({min_text} = {min_sec}s)")
                        print(f"   هستنى {wait_sec} ث بالظبط...")
                        time.sleep(wait_sec)
                        page.goto('https://project-dark.co.uk/theft', wait_until='domcontentloaded', timeout=60000)
                        sleep(4000)
                    else:
                        print(f"\n⏰ [Theft] مفيش كولداون مقروء، هستنى 60 ث...")
                        time.sleep(60)
                        page.goto('https://project-dark.co.uk/theft', wait_until='domcontentloaded', timeout=60000)
                        sleep(4000)
                
                print(f"📊 [Theft] خلصنا الدورة")
                print("="*50 + "\n")
            except Exception as e:
                print(f"⚠️ [Theft] خطأ: {e}")
                time.sleep(15)
