(() => {
  const WA = '254789872543';
  const PAYBILL = '222111';
  const ACCOUNT = '3072428';

  function readItem(card) {
    const opener = card?.querySelector('[data-open][data-item]');
    if (!opener) return null;
    try { return JSON.parse(opener.dataset.item); } catch { return null; }
  }

  function money(value) {
    const number = Number(value);
    return value !== null && value !== '' && Number.isFinite(number) ? `KSh ${number.toLocaleString()}` : 'Ask price';
  }

  function isSufuriaItem(item) { return /sufuria|cooking\s*pot/i.test(`${item?.name || ''} ${item?.caption || ''}`); }

  function cleanProductName(name='') {
    const raw = String(name).trim();
    const exact = {
      'DoubleburnergascookerRG/515': 'Double Burner Gas Cooker RG/515',
      'DoubleburnergascookerRG515': 'Double Burner Gas Cooker RG/515',
      'AILYON Sgascooker 6.2 KWG 014': 'AILYONS Gas Cooker 6.2 KW GS014',
      'AILYON Sgascooker 6.2 KWG014': 'AILYONS Gas Cooker 6.2 KW GS014',
      'AILONS Efficientanddurableburner Lowgasconsumption AILYONSGASCOOKERGS 005 A-1': 'AILYONS Gas Cooker GS005 A-1 - Efficient Low Gas Consumption',
      'AILONS Efficientanddurableburner Lowgasconsumption AILYONSGASCOOKERGS005 A-1': 'AILYONS Gas Cooker GS005 A-1 - Efficient Low Gas Consumption'
    };
    if (exact[raw]) return exact[raw];
    return raw
      .replace(/Doubleburnergascooker/ig, 'Double Burner Gas Cooker ')
      .replace(/gascooker/ig, 'Gas Cooker ')
      .replace(/Efficientanddurableburner/ig, 'Efficient and Durable Burner ')
      .replace(/Lowgasconsumption/ig, 'Low Gas Consumption ')
      .replace(/multipurposeset/ig, 'Multipurpose Set ')
      .replace(/Tri-cyclebicycle/ig, 'Tri-Cycle Bicycle ')
      .replace(/([a-z])([A-Z])/g, '$1 $2')
      .replace(/([A-Za-z])([0-9])/g, '$1 $2')
      .replace(/([0-9])([A-Za-z])/g, '$1 $2')
      .replace(/\s{2,}/g, ' ')
      .trim();
  }

  function productLink(item) { const url = new URL(window.location.href); url.hash=''; url.searchParams.set('product', item.id); return url.toString(); }

  function openBuyNow(item) {
    const existingPayButton = [...document.querySelectorAll('[data-pay-item]')].find((button) => { try { return String(JSON.parse(button.dataset.payItem || '{}').id) === String(item.id); } catch { return false; } });
    if (existingPayButton) { existingPayButton.click(); return; }
    const opener = [...document.querySelectorAll('[data-open][data-item]')].find((button) => { try { return String(JSON.parse(button.dataset.item || '{}').id) === String(item.id); } catch { return false; } });
    if (opener) { opener.click(); setTimeout(() => document.querySelector('[data-viewer-pay]')?.click(), 80); }
  }

  function enhanceCard(card) {
    if (!card || card.dataset.enhanced === '1') return;
    const item = readItem(card); if (!item) return;
    card.dataset.enhanced='1';
    const title = card.querySelector('h3');
    if (title) title.textContent = cleanProductName(item.name);
    if (isSufuriaItem(item)) { const categoryLabel=card.querySelector('small'); if(categoryLabel) categoryLabel.textContent='Kitchen - Sufuria'; }
    const actions=document.createElement('div'); actions.className='card-extra-actions';
    actions.innerHTML='<button class="buy-now" type="button" data-buy-now>Buy now</button><button type="button" data-native-share>Share</button>';
    card.querySelector('.card-actions')?.insertAdjacentElement('afterend',actions);
    actions.querySelector('[data-buy-now]')?.addEventListener('click',()=>openBuyNow(item));
    actions.querySelector('[data-native-share]')?.addEventListener('click',async()=>{ const url=productLink(item); const shareData={title:cleanProductName(item.name),text:`${cleanProductName(item.name)} - ${money(item.price)} at Gongoni Furniture Shop`,url}; try{if(navigator.share)await navigator.share(shareData);else if(navigator.clipboard){await navigator.clipboard.writeText(url);const b=actions.querySelector('[data-native-share]');b.textContent='Link copied';setTimeout(()=>b.textContent='Share',1400);}}catch{} });
    card.querySelectorAll('img').forEach(img=>{img.loading='lazy';img.decoding='async';img.setAttribute('fetchpriority','low');});
  }

  function enhanceAllCards(root=document){root.querySelectorAll('.product-card,.photo-card').forEach(enhanceCard);}

  function searchAlias(value){
    const normalized=String(value||'').trim();
    if (/^sufurias?$/i.test(normalized)) return 'cooking pot';
    return normalized.replace(/\bsufurias?\b/ig,'cooking pot');
  }

  function applySearch(value,shouldScroll=true){
    const realSearch=document.querySelector('#searchInput'),headerSearch=document.querySelector('#headerSearchInput');
    if(!realSearch)return;
    const displayValue=value;
    realSearch.value=searchAlias(value);
    if(headerSearch&&headerSearch.value!==displayValue)headerSearch.value=displayValue;
    realSearch.dispatchEvent(new Event('input',{bubbles:true}));
    if(headerSearch)headerSearch.value=displayValue;
    if(shouldScroll)document.querySelector('#products')?.scrollIntoView({behavior:'smooth',block:'start'});
  }

  function enableSufuriaAlias(){
    const realSearch=document.querySelector('#searchInput'),headerSearch=document.querySelector('#headerSearchInput');
    if(!realSearch||realSearch.dataset.sufuriaAlias==='1')return;
    realSearch.dataset.sufuriaAlias='1';
    realSearch.addEventListener('input',()=>{
      const typed=realSearch.value;
      if(!/\bsufurias?\b/i.test(typed))return;
      realSearch.value=searchAlias(typed);
      setTimeout(()=>{realSearch.value=typed;if(headerSearch)headerSearch.value=typed;},0);
    },true);
  }

  function syncHeaderSearch(){const h=document.querySelector('#headerSearchInput'),b=document.querySelector('#headerSearchButton'),r=document.querySelector('#searchInput');if(!h||!r)return;h.addEventListener('input',()=>applySearch(h.value,false));h.addEventListener('search',()=>applySearch(h.value,true));h.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();applySearch(h.value,true);}});b?.addEventListener('click',()=>applySearch(h.value,true));r.addEventListener('input',()=>{if(!/cooking\s*pot/i.test(r.value)&&h.value!==r.value)h.value=r.value;});}

  function createMobileSearch(){if(document.querySelector('.mobile-search-panel'))return;const bottomSearch=document.querySelector('[data-mobile-search-trigger]')||document.querySelector('.mobile-shop-bar a[href="#products"]'),realSearch=document.querySelector('#searchInput');if(!bottomSearch||!realSearch)return;const panel=document.createElement('div');panel.className='mobile-search-panel';panel.setAttribute('aria-hidden','true');panel.innerHTML='<div class="mobile-search-box"><input type="search" inputmode="search" autocomplete="off" placeholder="Type product name..." aria-label="Search products"><button type="button" data-mobile-search-close aria-label="Close search">×</button></div>';document.body.appendChild(panel);const input=panel.querySelector('input'),close=panel.querySelector('[data-mobile-search-close]');function openSearch(e){e?.preventDefault();panel.classList.add('open');panel.setAttribute('aria-hidden','false');input.value=realSearch.value;setTimeout(()=>input.focus(),30);}function closeSearch(){panel.classList.remove('open');panel.setAttribute('aria-hidden','true');}bottomSearch.addEventListener('click',openSearch);input.addEventListener('input',()=>applySearch(input.value,false));input.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();applySearch(input.value,true);closeSearch();}});input.addEventListener('search',()=>applySearch(input.value,true));close.addEventListener('click',closeSearch);panel.addEventListener('click',e=>{if(e.target===panel)closeSearch();});}

  function createFeaturedSections(){if(document.querySelector('[data-storefront-featured]'))return;const anchor=document.querySelector('.category-jump'),grid=document.querySelector('#productGrid');if(!anchor||!grid||!grid.children.length)return;const section=document.createElement('section');section.dataset.storefrontFeatured='1';section.innerHTML='<div class="shop-section-title"><div><p class="eyebrow">Quick picks</p><h2>Popular products</h2></div><p>Easy items to browse first</p></div><div class="featured-strip" data-popular-strip></div><div class="shop-section-title"><div><p class="eyebrow">Fresh stock</p><h2>New arrivals</h2></div><p>Recently added items</p></div><div class="featured-strip" data-new-strip></div>';anchor.parentNode.insertBefore(section,anchor);const cards=[...grid.querySelectorAll('.product-card')];const cloneInto=(target,source)=>{source.forEach(card=>{const clone=card.cloneNode(true);clone.dataset.enhanced='';target.appendChild(clone);});enhanceAllCards(target);};cloneInto(section.querySelector('[data-popular-strip]'),cards.slice(0,6));cloneInto(section.querySelector('[data-new-strip]'),cards.slice(-6).reverse());}
  function improveCheckout(){const checkout=document.querySelector('#checkout');if(!checkout||document.querySelector('.checkout-steps'))return;const steps=document.createElement('div');steps.className='checkout-steps';steps.innerHTML='<div class="checkout-step"><b>1</b><span>Add items</span></div><div class="checkout-step"><b>2</b><span>Choose delivery</span></div><div class="checkout-step"><b>3</b><span>Confirm total</span></div><div class="checkout-step"><b>4</b><span>Pay / WhatsApp</span></div>';checkout.parentNode.insertBefore(steps,checkout);}
  function improveTrust(){const trust=document.querySelector('.trust-strip');if(!trust||document.querySelector('.quick-help'))return;const help=document.createElement('section');help.className='quick-help';help.innerHTML=`<strong>Need help before paying?</strong><span>Confirm stock, delivery area and bulky-item delivery on WhatsApp first. Then pay using Paybill ${PAYBILL}, Account ${ACCOUNT}.</span>`;trust.insertAdjacentElement('afterend',help);}
  function syncCategoryHighlight(){document.querySelectorAll('[data-category-chip]').forEach(button=>button.addEventListener('click',()=>{document.querySelectorAll('[data-category-chip]').forEach(n=>n.classList.remove('active'));button.classList.add('active');}));}
  function addViewerSwipe(){const wrap=document.querySelector('.viewer-photo-wrap');if(!wrap||wrap.dataset.swipeReady==='1')return;wrap.dataset.swipeReady='1';let startX=0,startY=0;wrap.addEventListener('touchstart',e=>{const t=e.changedTouches[0];startX=t.clientX;startY=t.clientY;},{passive:true});wrap.addEventListener('touchend',e=>{const t=e.changedTouches[0],dx=t.clientX-startX,dy=t.clientY-startY;if(Math.abs(dx)<45||Math.abs(dx)<Math.abs(dy))return;const button=wrap.querySelector(dx<0?'[data-viewer-next]':'[data-viewer-prev]');if(button&&!button.hidden)button.click();},{passive:true});}
  const observer=new MutationObserver(mutations=>{for(const mutation of mutations)mutation.addedNodes.forEach(node=>{if(!(node instanceof Element))return;if(node.matches?.('.product-card,.photo-card'))enhanceCard(node);enhanceAllCards(node);});createFeaturedSections();});
  function boot(){improveCheckout();improveTrust();syncCategoryHighlight();addViewerSwipe();enableSufuriaAlias();syncHeaderSearch();createMobileSearch();enhanceAllCards();createFeaturedSections();[document.querySelector('#productGrid'),document.querySelector('#photoGrid')].filter(Boolean).forEach(grid=>observer.observe(grid,{childList:true}));setTimeout(()=>{enhanceAllCards();createFeaturedSections();},600);setTimeout(()=>{enhanceAllCards();createFeaturedSections();},1800);}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();

(() => {
  if (document.querySelector('script[data-catalog-cleanup]')) return;
  const script = document.createElement('script');
  script.src = 'catalog-cleanup.js?v=1';
  script.defer = true;
  script.dataset.catalogCleanup = '1';
  document.head.appendChild(script);
})();