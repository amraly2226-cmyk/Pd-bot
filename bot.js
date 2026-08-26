async function buyItem(page, itemName){
  log(`💰 بحاول اشتري ${itemName}`);
  await page.goto(BM_URL, {waitUntil:'networkidle2'});
  await sleep(2500); // استنى الصفحة تحمل اكتر

  let cds = await getCooldowns(page);
  if(cds.buy){ 
    log(`⏳ كولدون شراء: ${cds.buy.str} - هستنى ${cds.buy.sec} ث`); 
    await sleep((cds.buy.sec+2)*1000); 
    await page.goto(BM_URL, {waitUntil:'networkidle2'});
    await sleep(2000);
  }

  try{
    // دور بأي طريقة على زرار الشراء - زي الكود القديم اللي كان شغال
    let maxBuyBtn = await page.evaluateHandle((item)=>{
      let rows = [...document.querySelectorAll('tr')];
      let row = rows.find(tr=> tr.innerText.toLowerCase().includes(item.toLowerCase()) && tr.innerText.includes('£'));
      if(!row) row = rows.find(tr=> tr.innerText.toLowerCase().includes(item.toLowerCase()));
      if(!row) return null;
      let btns = [...row.querySelectorAll('button')];
      // جرب كل الاحتمالات
      let btn = btns.find(b=> b.innerText.toLowerCase().includes('max buy')) 
             || btns.find(b=> b.innerText.toLowerCase().includes('buy max'))
             || btns.find(b=> b.innerText.toLowerCase().includes('max'));
      return btn || null;
    }, itemName);
    
    let el = maxBuyBtn.asElement();
    if(!el){ 
      log(`❌ مفيش Max Buy لـ ${itemName} - هعمل ريلود واشوف الصفحة`);
      let txt = await page.evaluate(()=> document.body.innerText.slice(0,800));
      log(`📄 الصفحة فيها: ${txt.slice(0,200)}`);
      return false; 
    }
    await el.click(); 
    await sleep(1500);
    
    // دوس BUY MAX التأكيد
    let confirm = await page.evaluateHandle(()=> {
      let btns = [...document.querySelectorAll('button')];
      return btns.find(b=> b.innerText.trim().toUpperCase()==='BUY MAX' || b.innerText.toUpperCase().includes('BUY MAX')) || null;
    });
    let el2 = confirm.asElement();
    if(el2){ 
      await el2.click(); 
      log(`✅ اشتريت ${itemName} Max`); 
      await sleep(2500); 
      return true; 
    } else {
      log(`❌ دوست Max بس مش لاقي BUY MAX`);
      return false;
    }
  }catch(e){ log(`خطأ شراء: ${e.message}`); }
  return false;
}
