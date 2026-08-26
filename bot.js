// v2.5 FIX - يستنى Max Buy لحد ما يظهر
async function waitForMarket(page){
  log("⏳ بستنى جدول البلاك ماركت...");
  try{
    await page.waitForFunction(()=> document.body.innerText.includes('Black Market'), {timeout:15000});
    await page.waitForFunction(()=> document.querySelectorAll('tr').length >= 5, {timeout:15000});
    await page.waitForFunction(()=> document.documentElement.innerHTML.includes('Max Buy'), {timeout:15000});
    log("✅ الجدول ظهر");
    return true;
  }catch(e){
    let dump = await page.evaluate(()=> document.body.innerText.slice(0,300));
    log(`📄 شايف: ${dump}`);
    return false;
  }
}

async function buyItem(page, itemName){
  await page.goto(BM_URL,{waitUntil:'networkidle2'});
  await waitForMarket(page); // <-- ده الحل

  let clicked = await page.evaluate((item)=>{
    let row=[...document.querySelectorAll('tr')].find(tr=> tr.innerText.toLowerCase().includes(item.toLowerCase()) && tr.innerText.includes('£'));
    if(!row) return {ok:false, reason:'row not found'};
    let mb=[...row.querySelectorAll('button')].find(b=> b.innerText.includes('Max Buy'));
    if(!mb) return {ok:false, reason:'no Max Buy'};
    mb.click(); return {ok:true};
  }, itemName);
  
  if(!clicked.ok) return false;
  await sleep(1500);
  await page.evaluate(()=>{
    let b=[...document.querySelectorAll('button')].find(x=>x.innerText.trim()==='BUY MAX');
    if(b) b.click();
  });
  return true;
}
