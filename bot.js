// ==UserScript==
// @name Project Dark - v55.6 START CHECK BUY THEN TRAVEL
// @namespace PD-V55-FINAL
// @version 55.6
// @description لما تدوس Start يتأكد الاول انك شاري اللي معلم عليه وبعدين يسافر
// @match *://*.project-dark.co.uk/*
// @grant none
// @run-at document-idle
// @updateURL https://raw.githubusercontent.com/amrtawfick/pd-bot/main/pd-bot.user.js
// @downloadURL https://raw.githubusercontent.com/amrtawfick/pd-bot/main/pd-bot.user.js
// ==/UserScript==

(function(){
    window.confirm=()=>true;
    const CITIES={1:"Cairo",2:"Tokyo",3:"London",4:"Moscow",5:"Rome",6:"Capetown",7:"Sydney",8:"Ottawa",9:"Rio de Janeiro"};
    const CITY_IDS={"Cairo":1,"Tokyo":2,"London":3,"Moscow":4,"Rome":5,"Capetown":6,"Sydney":7,"Ottawa":8,"Rio de Janeiro":9};
    const ITEMS=["Anabolic steroid","Artifacts","Alcohol","Electronics","Plastic jewelry","Stolen paintings","Human beings","Confidential documents","Endangered exotic animals","Organs"];
    let active=localStorage.getItem('pd_active')==='1';
    let lock=false; let isSelling=false; let lastSellClick=0;
    let cityConfig=JSON.parse(localStorage.getItem('pd_city_config')||'{}');
    let step=localStorage.getItem('pd_step')||'buy';
    function getHold(){let m=document.body.innerText.match(/holding (\d+) items/i); return m?+m[1]:0;}
    function getCD(){let m=document.body.innerText.match(/You cannot travel for:?\s*([0-9hms ]+)/i); if(!m) return null; let s=m[1].trim(); let sec=0; let h=s.match(/(\d+)\s*h/); if(h) sec+=+h[1]*3600; let mm=s.match(/(\d+)\s*m/); if(mm) sec+=+mm[1]*60; let ss=s.match(/(\d+)\s*s/); if(ss) sec+=+ss[1]; if(sec==0){let n=s.match(/(\d+)/); if(n) sec=+n[1]*60;} return {sec,str:s};}
    function getCurrentCity(){let txt=document.body.innerText; let m=txt.match(/Black Market - ([A-Za-z ]+)/i); if(m) return m[1].trim(); m=txt.match(/You have traveled to ([A-Za-z ]+)!/i); if(m) return m[1].trim(); return null;}
    function saveCfg(city,item,to){cityConfig[city]={item,to}; localStorage.setItem('pd_city_config',JSON.stringify(cityConfig)); localStorage.setItem('pd_from',city); localStorage.setItem('pd_item',item); localStorage.setItem('pd_to',to); updateList();}
    function clickTravelMenu(){let a=[...document.querySelectorAll('a')].filter(x=>x.innerText.trim()==='Travel'); for(let l of a) if(l.offsetParent!==null){l.click(); return;} window.location.href="https://www.project-dark.co.uk/travel";}
    function clickBlackMarketMenu(){let a=[...document.querySelectorAll('a')].filter(x=>x.innerText.includes('Blackmarket')); for(let l of a) if(l.offsetParent!==null){l.click(); return;} window.location.href="https://www.project-dark.co.uk/blackmarket";}
    function updateList(){let el=document.getElementById('pd-saved-list'); if(!el) return; let h=''; for(let c in cityConfig){let cfg=cityConfig[c]; h+=`<div style="background:#000;color:#0f0;padding:2px 4px;margin:2px;border-radius:3px;font-size:10px;">${c}: ${cfg.item} → ${cfg.to}</div>`;} el.innerHTML=h||'<div style="color:#999;font-size:10px;">مفيش سيتنج</div>';}
    function getHeldItem(){let rows=[...document.querySelectorAll('tr')]; for(let r of rows){ if(r.innerHTML.includes('Sell All') &&!r.innerText.includes('Confirm Sell All')){ let txt=r.innerText.toLowerCase(); for(let it of ITEMS){ if(txt.includes(it.toLowerCase())) return it; } if(r.cells[0]) return r.cells[0].innerText.trim(); } } return null;}
    function getRowForItem(name){ if(!name) return null; return [...document.querySelectorAll('tr')].find(tr=> tr.innerText.toLowerCase().includes(name.toLowerCase()) && tr.innerHTML.includes('Sell All') &&!tr.innerText.includes('Confirm Sell All')); }
    function isConfirmOpen(){ return document.body.innerText.includes('Confirm Sell All'); }
    function getConfirmBtn(){ return [...document.querySelectorAll('button')].find(b=>{ if(b.textContent.trim().toUpperCase()!=='SELL ALL') return false; if(b.offsetParent===null) return false; let p=b.parentElement; for(let i=0;i<5 && p;i++){ if(p.innerText && p.innerText.includes('Confirm Sell All')) return true; p=p.parentElement; } return false; }); }
    function getRowSellBtn(heldItem){ let row=getRowForItem(heldItem); if(!row) return null; return [...row.querySelectorAll('button')].find(b=> b.innerText.trim()==='Sell All' && b.offsetParent!==null); }
    function build(){
        if(document.getElementById('pd-panel')) return;
        let css=`#pd-panel{position:fixed;bottom:8px;left:8px;background:#fff;padding:8px;border-radius:8px;z-index:2147483647;border:2px solid #000;display:flex;flex-direction:column;gap:6px;max-width:96%;} #pd-panel>div{display:flex;gap:6px;align-items:center;flex-wrap:wrap;} #pd-panel select{height:30px;background:#fff;color:#000;border:1px solid #000;border-radius:4px;padding:0 8px;font-size:12px;min-width:80px;} #pd-panel button{height:30px;border:1px solid #000;border-radius:4px;padding:0 12px;font-size:12px;font-weight:bold;cursor:pointer;} #pd-start{background:#00aa55;color:#fff;}#pd-stop{background:#ff3333;color:#fff;} #pd-log{position:fixed;bottom:50px;left:8px;background:#242c39;color:#fff;padding:8px 12px;border-radius:6px;font-size:11px;z-index:2147483646;border:1px solid #000;min-width:280px;max-width:90%;white-space:pre-wrap;} #pd-saved-list{max-height:70px;overflow-y:auto;background:#222;padding:4px;border-radius:4px;width:100%;}`;
        let style=document.createElement('style'); style.innerText=css; document.head.appendChild(style);
        let panel=document.createElement('div'); panel.id='pd-panel';
        let from=localStorage.getItem('pd_from')||"Tokyo"; let to=localStorage.getItem('pd_to')||"Cairo"; let item=localStorage.getItem('pd_item')||"Electronics";
        let cur=getCurrentCity(); if(cur && cityConfig[cur]){from=cur; item=cityConfig[cur].item; to=cityConfig[cur].to;}
        let fromId=CITY_IDS[from]||2; let toId=CITY_IDS[to]||1; let itemIdx=ITEMS.indexOf(item); if(itemIdx<0) itemIdx=3;
        panel.innerHTML=`<div><span id="pd-cur" style="font-weight:bold;background:#ff0;padding:2px 6px;border-radius:3px;font-size:11px;">${cur||'??'} (انت هنا)</span> <select id="pd-from-sel">${Object.entries(CITIES).map(([id,name])=>`<option value="${id}" ${id==fromId?'selected':''}>${name}</option>`).join('')}</select> <select id="pd-item-sel">${ITEMS.map((n,i)=>`<option value="${i}" ${i==itemIdx?'selected':''}>${n}</option>`).join('')}</select> <select id="pd-to-sel">${Object.entries(CITIES).map(([id,name])=>`<option value="${id}" ${id==toId?'selected':''}>${name}</option>`).join('')}</select> <button id="${active?'pd-stop':'pd-start'}">${active?'Stop':'Start'}</button></div><div id="pd-saved-list"></div>`;
        document.body.appendChild(panel);
        let logEl=document.createElement('div'); logEl.id='pd-log'; logEl.innerText='جاهز - دوس Start'; document.body.appendChild(logEl);
        const log=t=>{logEl.innerText=t; console.log(t);};
        updateList();
        function doStart(){
            let nowCity=getCurrentCity(); if(nowCity){ localStorage.setItem('pd_from',nowCity); localStorage.removeItem('pd_manual_from'); document.getElementById('pd-from-sel').value=CITY_IDS[nowCity]||2; if(cityConfig[nowCity]){ localStorage.setItem('pd_item',cityConfig[nowCity].item); localStorage.setItem('pd_to',cityConfig[nowCity].to); document.getElementById('pd-item-sel').value=ITEMS.indexOf(cityConfig[nowCity].item); document.getElementById('pd-to-sel').value=CITY_IDS[cityConfig[nowCity].to]||1; } }
            let wanted=localStorage.getItem('pd_item')||ITEMS[document.getElementById('pd-item-sel').value]; let held=getHeldItem(); let hold=getHold();
            if(hold===0){ log(`🟢 Start - مش شايل حاجة - هتأكد واشتري ${wanted} وبعدين اروح Travel`); } else if(held && held.toLowerCase()!==wanted.toLowerCase()){ log(`🟢 Start - شايل ${held} غلط - هبيع ${held} واشتري ${wanted} وبعدين اروح Travel`); } else { log(`🟢 Start - شايل ${wanted} صح (${hold}) - هروح Travel لـ ${localStorage.getItem('pd_to')}`); }
            localStorage.setItem('pd_active','1'); localStorage.setItem('pd_step','buy'); active=true; lock=false; isSelling=false;
            let btn=document.getElementById('pd-start'); if(btn){btn.id='pd-stop'; btn.innerText='Stop'; btn.style.background='#ff3333'; btn.onclick=doStop;}
            document.getElementById('pd-cur').innerText=`${nowCity||'??'} (انت هنا) - شغال`; setTimeout(run,1000);
        }
        function doStop(){localStorage.setItem('pd_active','0'); active=false; lock=false; isSelling=false; let btn=document.getElementById('pd-stop'); if(btn){btn.id='pd-start'; btn.innerText='Start'; btn.style.background='#00aa55'; btn.onclick=doStart;} log("🔴 Stop - وقف");}
        document.getElementById('pd-start')?.addEventListener('click',doStart); document.getElementById('pd-stop')?.addEventListener('click',doStop);
        new MutationObserver(()=>{ if(!active) return; let b=[...document.querySelectorAll('button')].find(x=>x.innerText.trim()==='BUY MAX'&&document.body.innerText.includes('Confirm')); if(b&&active){ b.click(); return; } let b2=[...document.querySelectorAll('button')].find(x=>x.innerText.trim()==='TRAVEL'&&document.body.innerText.includes('Are you sure')); if(b2&&active){ b2.click(); localStorage.setItem('pd_step','buy'); return; } }).observe(document.body,{childList:true,subtree:true});
        if(active) setTimeout(run,2000);
    }
    function run(){
        if(!active || lock) return; lock=true;
        let hold=getHold(); let from=localStorage.getItem('pd_from')||"Tokyo"; let to=localStorage.getItem('pd_to')||"Cairo"; let item=localStorage.getItem('pd_item')||"Electronics";
        let logEl=document.getElementById('pd-log'); const log=t=>{if(logEl) logEl.innerText=t; console.log(t);};
        step=localStorage.getItem('pd_step')||'buy'; let cur=getCurrentCity(); let cd=getCD();
        if(cd){ if(!location.href.includes('travel')){ log(`⏳ كولداون ${cd.str}`); lock=false; clickTravelMenu(); return; } else { log(`⏳ ثابت في Travel ${cd.str}`); lock=false; setTimeout(()=>{if(active) location.reload();},30000); return; } }
        if(step==='buy'){
            if(!location.href.includes('blackmarket')){log(`➡️ رايح Blackmarket اتأكد من ${item}`); lock=false; clickBlackMarketMenu(); return;}
            if(isConfirmOpen()){ let btn=getConfirmBtn(); if(btn && Date.now()-lastSellClick>1500){ log(`🔴 بدوس SELL ALL الاحمر`); lastSellClick=Date.now(); btn.click(); setTimeout(()=>location.reload(),1500); } lock=false; setTimeout(()=>{ if(active) run(); },2000); return; }
            let heldItem=getHeldItem(); if(hold>0 && heldItem && heldItem.toLowerCase()!==item.toLowerCase()){ if(isSelling){ lock=false; setTimeout(run,2000); return; } if(Date.now()-lastSellClick < 4000){ lock=false; setTimeout(run,1500); return; } let sellBtn=getRowSellBtn(heldItem); if(sellBtn){ log(`⚠️ شايل ${heldItem} (${hold}) لكن عايز ${item} - هبيع`); isSelling=true; lastSellClick=Date.now(); sellBtn.click(); setTimeout(()=>{ isSelling=false; lock=false; if(active) run(); },2500); return; } }
            if(hold>0 && (!heldItem || heldItem.toLowerCase()===item.toLowerCase())){ log(`✅ شايل ${hold} ${item} صح - رايح Travel ${to}`); localStorage.setItem('pd_step','travel'); lock=false; setTimeout(()=>{if(active) clickTravelMenu();},1500); return;}
            let row=[...document.querySelectorAll('tr')].find(tr=>tr.innerText.toLowerCase().includes(item.toLowerCase())&&tr.innerText.includes('£')); if(row){let mb=[...row.querySelectorAll('button')].find(b=>b.innerText.includes('Max Buy')); if(mb){mb.click(); setTimeout(()=>{let bm=[...document.querySelectorAll('button')].find(b=>b.innerText.trim()==='BUY MAX'); if(bm){bm.click(); saveCfg(from,item,to); log(`✅ اشتريت ${item} - رايح Travel ${to}`); localStorage.setItem('pd_step','travel'); setTimeout(()=>{lock=false; if(active) clickTravelMenu();},2000);} else lock=false;},1000);} else {log(`مفيش ${item}`); lock=false;}} else {log(`مش لاقي ${item}`); lock=false;}
        } else {
            if(!location.href.includes('travel')){log(`رايح Travel`); lock=false; clickTravelMenu(); return;}
            log(`✈️ هسافر ${to} من ${from}`); let clicked=false; for(let el of document.querySelectorAll('*')){if(el.innerText&&el.innerText.trim().toUpperCase()===to.toUpperCase()&&el.offsetParent!==null&&el.children.length===0){let card=el.parentElement; for(let i=0;i<3;i++){if(card&&card.offsetWidth>150) break; card=card.parentElement;} if(card){card.click(); clicked=true; break;}}}
            if(!clicked){log(`مش لاقي ${to}`); lock=false; return;}
            setTimeout(()=>{let tb=[...document.querySelectorAll('button')].find(b=>b.innerText.trim()==='Travel to Selected Location'); if(tb){tb.click(); setTimeout(()=>{let cb=[...document.querySelectorAll('button')].find(b=>b.innerText.trim()==='TRAVEL'); if(cb){cb.click(); log(`✈️ مسافر ${to}`); localStorage.setItem('pd_step','buy'); lock=false; setTimeout(()=>{if(active) clickBlackMarketMenu();},2000);} else lock=false;},1200);} else lock=false;},1500);
        }
    }
    if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',build); else build();
    setInterval(()=>{if(!document.getElementById('pd-panel')) build();},3000);
})();
