(() => {
  function stripPrice(text='') {
    return String(text)
      .replace(/@\s*(?:ksh\.?\s*)?[\d,.]+\s*\/?=?/ig, '')
      .replace(/\bksh\.?\s*[\d,.]+\s*\/?=?/ig, '')
      .replace(/\s{2,}/g, ' ').trim();
  }

  function cleanName(text='') {
    let s = String(text).trim();
    const replacements = [
      [/0scar/ig,'Oscar'],[/do0rmat|d00rmat/ig,'Doormat'],
      [/tri[- ]?cyclebicycle/ig,'Tri-Cycle Bicycle'],[/multipurposesets?/ig,'Multipurpose Set'],
      [/chapatiboard/ig,'Chapati Board'],[/choppingboard/ig,'Chopping Board'],
      [/bamboomwiko/ig,'Bamboo Mwiko'],[/woodenmotorandpistle/ig,'Wooden Mortar and Pestle'],
      [/motorand\s*pistle/ig,'Mortar and Pestle'],[/melaminecalabash/ig,'Melamine Calabash'],
      [/ceramicbowl/ig,'Ceramic Bowl'],[/melamineplate/ig,'Melamine Plate'],
      [/melaminebowl/ig,'Melamine Bowl'],[/melamineportionplate/ig,'Melamine Portion Plate'],
      [/melamineservingbowl/ig,'Melamine Serving Bowl'],[/melamine\s*servingbowl/ig,'Melamine Serving Bowl'],
      [/melamineservingpot/ig,'Melamine Serving Pot'],[/melamine\s*servingpot/ig,'Melamine Serving Pot'],
      [/melaminehotpot/ig,'Melamine Hot Pot'],[/oasisbowl/ig,'Oasis Bowl'],
      [/ascotsugardish/ig,'Ascot Sugar Dish'],[/gpmelamine/ig,'GP Melamine'],
      [/cutleryset/ig,'Cutlery Set'],[/servingbowl/ig,'Serving Bowl'],[/servingpot/ig,'Serving Pot'],
      [/sugardish/ig,'Sugar Dish'],[/hotpot/ig,'Hot Pot'],
      [/doubleburnergascooker/ig,'Double Burner Gas Cooker'],[/doubleburner/ig,'Double Burner'],
      [/gascooker/ig,'Gas Cooker'],[/efficientanddurableburner/ig,'Efficient and Durable Burner'],
      [/lowgasconsumption/ig,'Low Gas Consumption'],[/gassaving/ig,'Gas Saving'],
      [/stainlessglass/ig,'Stainless Glass'],[/vacuumflask/ig,'Vacuum Flask'],
      [/babywalker/ig,'Baby Walker'],[/officechair/ig,'Office Chair'],
      [/coffeetable/ig,'Coffee Table'],[/standingfan/ig,'Standing Fan'],
      [/chestfreezer/ig,'Chest Freezer'],[/ride[- ]?on/ig,'Ride-On'],
      [/armchair/ig,'Armchair'],[/doormat/ig,'Doormat']
    ];
    replacements.forEach(([pattern,value]) => { s=s.replace(pattern,value); });
    s=s
      .replace(/([a-z])([A-Z])/g,'$1 $2')
      .replace(/([A-Za-z])([0-9])/g,'$1 $2')
      .replace(/([0-9])([A-Za-z])/g,'$1 $2')
      .replace(/\b(\d+)\s*(Ltr|LTR|ltr)\b/g,'$1 Ltr')
      .replace(/\b(\d+)\s*(ml|ML|Ml)\b/g,'$1 ml')
      .replace(/\b(\d+)\s*(pcs|PCS|Pcs)\b/g,'$1 Pcs')
      .replace(/\b(\d+)\s*(inch|INCH|lnch)\b/g,'$1 Inch')
      .replace(/\b(\d+)\s*g\b/ig,'$1 g')
      .replace(/\bA\s+0(\d{2})\b/g,'A0$1')
      .replace(/\bD\s+0(\d{2})\b/g,'D0$1')
      .replace(/\bGS\s+0(\d{2})\b/ig,'GS0$1')
      .replace(/\b0\s*M-(\d+)/ig,'OM-$1')
      .replace(/\bSc\s*M-(\d+)/ig,'SCM-$1')
      .replace(/\s+([,.;:])/g,'$1')
      .replace(/\s{2,}/g,' ').trim();
    return s;
  }

  function usefulCaption(caption='') {
    const value=stripPrice(caption);
    return value && value.length>=3 ? cleanName(value) : '';
  }

  function preferredName(item) {
    const raw=String(item?.name||'').trim();
    if (/^General Goods Item\s+\d+$/i.test(raw)) {
      const fromCaption=usefulCaption(item?.caption||'');
      if (fromCaption) return fromCaption;
      return raw;
    }
    return cleanName(raw);
  }

  function itemFromCard(card) {
    const opener=card.querySelector('[data-open][data-item]');
    if(!opener)return null;
    try{return JSON.parse(opener.dataset.item||'{}');}catch{return null;}
  }

  function cleanCard(card) {
    if(!card)return;
    const item=itemFromCard(card); if(!item)return;
    const title=card.querySelector('h3'); if(title)title.textContent=preferredName(item);
    card.querySelectorAll('.item-meta span').forEach(node=>{
      if(/^Brand:/i.test(node.textContent.trim())) {
        const value=node.textContent.replace(/^Brand:\s*/i,'').trim();
        if(value)node.textContent=`Brand: ${cleanName(value)}`;
      }
    });
    card.dataset.catalogCleaned='1';
  }

  function cleanViewer() {
    const viewer=document.querySelector('#viewer');
    if(!viewer || viewer.getAttribute('aria-hidden')==='true')return;
    const title=viewer.querySelector('.viewer-details > strong');
    if(title && title.textContent) title.textContent=cleanName(title.textContent);
  }

  function cleanAll(root=document) {
    root.querySelectorAll?.('.product-card,.photo-card').forEach(cleanCard);
    cleanViewer();
  }

  const observer=new MutationObserver(()=>cleanAll());
  function boot(){
    cleanAll();
    observer.observe(document.body,{childList:true,subtree:true,characterData:true});
    setTimeout(cleanAll,500); setTimeout(cleanAll,1500); setTimeout(cleanAll,3000);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();