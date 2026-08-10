(() => {
  function stripPrice(text='') {
    return String(text)
      .replace(/@\s*(?:ksh\s*)?[\d,.]+\s*\/?=?/ig, '')
      .replace(/\bksh\s*[\d,.]+\b/ig, '')
      .replace(/\s{2,}/g, ' ')
      .trim();
  }

  function titleCaseKnown(text='') {
    return String(text)
      .replace(/0scar/ig, 'Oscar')
      .replace(/do0rmat|d00rmat/ig, 'Doormat')
      .replace(/multipurposeset/ig, 'Multipurpose Set')
      .replace(/gascooker/ig, 'Gas Cooker')
      .replace(/doubleburner/ig, 'Double Burner')
      .replace(/lowgasconsumption/ig, 'Low Gas Consumption')
      .replace(/efficientanddurableburner/ig, 'Efficient and Durable Burner')
      .replace(/tri-cyclebicycle/ig, 'Tri-Cycle Bicycle')
      .replace(/([a-z])([A-Z])/g, '$1 $2')
      .replace(/([A-Za-z])([0-9])/g, '$1 $2')
      .replace(/([0-9])([A-Za-z])/g, '$1 $2')
      .replace(/\s{2,}/g, ' ')
      .trim();
  }

  function usefulCaption(caption='') {
    const value = stripPrice(caption);
    if (!value || value.length < 3) return '';
    return titleCaseKnown(value);
  }

  function preferredName(item) {
    const raw = String(item?.name || '').trim();
    if (/^General Goods Item\s+\d+$/i.test(raw)) {
      const fromCaption = usefulCaption(item?.caption || '');
      if (fromCaption) return fromCaption;
    }
    return titleCaseKnown(raw);
  }

  function cleanBrand(text='') {
    const value = text.replace(/^Brand:\s*/i, '').trim();
    if (!value) return '';
    return titleCaseKnown(value);
  }

  function itemFromCard(card) {
    const opener = card.querySelector('[data-open][data-item]');
    if (!opener) return null;
    try { return JSON.parse(opener.dataset.item || '{}'); } catch { return null; }
  }

  function cleanCard(card) {
    if (!card || card.dataset.catalogCleaned === '1') return;
    const item = itemFromCard(card);
    if (!item) return;
    card.dataset.catalogCleaned = '1';

    const title = card.querySelector('h3');
    if (title) title.textContent = preferredName(item);

    card.querySelectorAll('.item-meta, .product-meta, p, span').forEach((node) => {
      if (/^Brand:/i.test(node.textContent.trim())) {
        const cleaned = cleanBrand(node.textContent);
        if (cleaned) node.textContent = `Brand: ${cleaned}`;
      }
    });
  }

  function cleanAll(root=document) {
    root.querySelectorAll('.product-card,.photo-card').forEach(cleanCard);
  }

  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      mutation.addedNodes.forEach((node) => {
        if (!(node instanceof Element)) return;
        if (node.matches?.('.product-card,.photo-card')) cleanCard(node);
        cleanAll(node);
      });
    }
  });

  function boot() {
    cleanAll();
    [document.querySelector('#productGrid'), document.querySelector('#photoGrid')]
      .filter(Boolean)
      .forEach((grid) => observer.observe(grid, { childList: true, subtree: true }));
    setTimeout(cleanAll, 700);
    setTimeout(cleanAll, 1800);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();