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
    return value !== null && value !== '' && Number.isFinite(number)
      ? `KSh ${number.toLocaleString()}`
      : 'Ask price';
  }

  function productLink(item) {
    const url = new URL(window.location.href);
    url.hash = '';
    url.searchParams.set('product', item.id);
    return url.toString();
  }

  function openBuyNow(item) {
    const existingPayButton = [...document.querySelectorAll('[data-pay-item]')].find((button) => {
      try {
        const candidate = JSON.parse(button.dataset.payItem || '{}');
        return String(candidate.id) === String(item.id);
      } catch { return false; }
    });
    if (existingPayButton) { existingPayButton.click(); return; }
    const opener = [...document.querySelectorAll('[data-open][data-item]')].find((button) => {
      try {
        const candidate = JSON.parse(button.dataset.item || '{}');
        return String(candidate.id) === String(item.id);
      } catch { return false; }
    });
    if (opener) {
      opener.click();
      setTimeout(() => document.querySelector('[data-viewer-pay]')?.click(), 80);
    }
  }

  function enhanceCard(card) {
    if (!card || card.dataset.enhanced === '1') return;
    const item = readItem(card);
    if (!item) return;
    card.dataset.enhanced = '1';
    const actions = document.createElement('div');
    actions.className = 'card-extra-actions';
    actions.innerHTML = `<button class="buy-now" type="button" data-buy-now>Buy now</button><button type="button" data-native-share>Share</button>`;
    const current = card.querySelector('.card-actions');
    current?.insertAdjacentElement('afterend', actions);
    actions.querySelector('[data-buy-now]')?.addEventListener('click', () => openBuyNow(item));
    actions.querySelector('[data-native-share]')?.addEventListener('click', async () => {
      const url = productLink(item);
      const shareData = { title: item.name, text: `${item.name} - ${money(item.price)} at Gongoni Furniture Shop`, url };
      try {
        if (navigator.share) await navigator.share(shareData);
        else if (navigator.clipboard) {
          await navigator.clipboard.writeText(url);
          actions.querySelector('[data-native-share]').textContent = 'Link copied';
          setTimeout(() => { actions.querySelector('[data-native-share]').textContent = 'Share'; }, 1400);
        }
      } catch {}
    });
    card.querySelectorAll('img').forEach((img) => { img.loading = 'lazy'; img.decoding = 'async'; img.setAttribute('fetchpriority', 'low'); });
  }

  function enhanceAllCards(root = document) { root.querySelectorAll('.product-card,.photo-card').forEach(enhanceCard); }

  function createMobileSearch() {
    if (document.querySelector('.mobile-search-panel')) return;
    const bottomSearch = document.querySelector('.mobile-shop-bar a[href="#products"]');
    const realSearch = document.querySelector('#searchInput');
    if (!bottomSearch || !realSearch) return;

    const panel = document.createElement('div');
    panel.className = 'mobile-search-panel';
    panel.setAttribute('aria-hidden', 'true');
    panel.innerHTML = `
      <div class="mobile-search-box">
        <input type="search" inputmode="search" autocomplete="off" placeholder="Type product name..." aria-label="Search products">
        <button type="button" data-mobile-search-close aria-label="Close search">×</button>
      </div>
    `;
    document.body.appendChild(panel);
    const input = panel.querySelector('input');
    const close = panel.querySelector('[data-mobile-search-close]');

    function openSearch(event) {
      event?.preventDefault();
      panel.classList.add('open');
      panel.setAttribute('aria-hidden', 'false');
      input.value = realSearch.value;
      setTimeout(() => input.focus(), 30);
    }
    function closeSearch() {
      panel.classList.remove('open');
      panel.setAttribute('aria-hidden', 'true');
    }

    bottomSearch.addEventListener('click', openSearch);
    input.addEventListener('input', () => {
      realSearch.value = input.value;
      realSearch.dispatchEvent(new Event('input', { bubbles: true }));
      document.querySelector('#products')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
    input.addEventListener('search', () => {
      realSearch.value = input.value;
      realSearch.dispatchEvent(new Event('input', { bubbles: true }));
    });
    close.addEventListener('click', closeSearch);
    panel.addEventListener('click', (event) => { if (event.target === panel) closeSearch(); });
  }

  function createFeaturedSections() {
    if (document.querySelector('[data-storefront-featured]')) return;
    const anchor = document.querySelector('.category-jump');
    const productGrid = document.querySelector('#productGrid');
    if (!anchor || !productGrid || !productGrid.children.length) return;
    const section = document.createElement('section');
    section.dataset.storefrontFeatured = '1';
    section.innerHTML = `<div class="shop-section-title"><div><p class="eyebrow">Quick picks</p><h2>Popular products</h2></div><p>Easy items to browse first</p></div><div class="featured-strip" data-popular-strip></div><div class="shop-section-title"><div><p class="eyebrow">Fresh stock</p><h2>New arrivals</h2></div><p>Recently added items</p></div><div class="featured-strip" data-new-strip></div>`;
    anchor.parentNode.insertBefore(section, anchor);
    const cards = [...productGrid.querySelectorAll('.product-card')];
    const cloneInto = (target, sourceCards) => { sourceCards.forEach((card) => { const clone = card.cloneNode(true); clone.dataset.enhanced = ''; target.appendChild(clone); }); enhanceAllCards(target); };
    cloneInto(section.querySelector('[data-popular-strip]'), cards.slice(0, 6));
    cloneInto(section.querySelector('[data-new-strip]'), cards.slice(-6).reverse());
  }

  function improveCheckout() {
    const checkout = document.querySelector('#checkout');
    if (!checkout || document.querySelector('.checkout-steps')) return;
    const steps = document.createElement('div'); steps.className = 'checkout-steps';
    steps.innerHTML = `<div class="checkout-step"><b>1</b><span>Add items</span></div><div class="checkout-step"><b>2</b><span>Choose delivery</span></div><div class="checkout-step"><b>3</b><span>Confirm total</span></div><div class="checkout-step"><b>4</b><span>Pay / WhatsApp</span></div>`;
    checkout.parentNode.insertBefore(steps, checkout);
  }

  function improveTrust() {
    const trust = document.querySelector('.trust-strip'); if (!trust || document.querySelector('.quick-help')) return;
    const help = document.createElement('section'); help.className = 'quick-help';
    help.innerHTML = `<strong>Need help before paying?</strong><span>Confirm stock, delivery area and bulky-item delivery on WhatsApp first. Then pay using Paybill ${PAYBILL}, Account ${ACCOUNT}.</span>`;
    trust.insertAdjacentElement('afterend', help);
  }

  function syncCategoryHighlight() { document.querySelectorAll('[data-category-chip]').forEach((button) => button.addEventListener('click', () => { document.querySelectorAll('[data-category-chip]').forEach((node) => node.classList.remove('active')); button.classList.add('active'); })); }

  function addViewerSwipe() {
    const wrap = document.querySelector('.viewer-photo-wrap'); if (!wrap || wrap.dataset.swipeReady === '1') return; wrap.dataset.swipeReady = '1'; let startX = 0, startY = 0;
    wrap.addEventListener('touchstart', (event) => { const touch = event.changedTouches[0]; startX = touch.clientX; startY = touch.clientY; }, { passive: true });
    wrap.addEventListener('touchend', (event) => { const touch = event.changedTouches[0]; const dx = touch.clientX - startX, dy = touch.clientY - startY; if (Math.abs(dx) < 45 || Math.abs(dx) < Math.abs(dy)) return; const button = wrap.querySelector(dx < 0 ? '[data-viewer-next]' : '[data-viewer-prev]'); if (button && !button.hidden) button.click(); }, { passive: true });
  }

  const observer = new MutationObserver((mutations) => { for (const mutation of mutations) mutation.addedNodes.forEach((node) => { if (!(node instanceof Element)) return; if (node.matches?.('.product-card,.photo-card')) enhanceCard(node); enhanceAllCards(node); }); createFeaturedSections(); });

  function boot() {
    improveCheckout(); improveTrust(); syncCategoryHighlight(); addViewerSwipe(); createMobileSearch(); enhanceAllCards(); createFeaturedSections();
    [document.querySelector('#productGrid'), document.querySelector('#photoGrid')].filter(Boolean).forEach((grid) => observer.observe(grid, { childList: true }));
    setTimeout(() => { enhanceAllCards(); createFeaturedSections(); }, 600); setTimeout(() => { enhanceAllCards(); createFeaturedSections(); }, 1800);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();
