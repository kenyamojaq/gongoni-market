(() => {
  function moveBefore(node, ref) {
    if (node && ref && node !== ref) ref.parentNode.insertBefore(node, ref);
  }

  function arrange() {
    const main = document.querySelector('main#home');
    if (!main || main.dataset.rearranged === '1') return;
    main.dataset.rearranged = '1';

    const nav = document.querySelector('.market-nav');
    if (nav) {
      nav.innerHTML = `
        <a href="#products">Products</a>
        <a href="#products" data-category-chip="Furniture & chairs">Furniture</a>
        <a href="#products" data-category-chip="Kitchenware">Kitchen</a>
        <a href="#products" data-category-chip="Baby & kids">Baby & Kids</a>
        <a href="#products" data-category-chip="Cleaning">Cleaning</a>
        <a href="#products" data-category-chip="Appliances & electronics">Electronics</a>`;
    }

    const hero = main.querySelector('.hero');
    const categoryJump = main.querySelector('.category-jump');
    const toolbar = main.querySelector('.toolbar');
    const filterToggle = main.querySelector('#mobileFilterToggle');
    const productsHead = main.querySelector('#products');
    const productGrid = main.querySelector('#productGrid');
    const loadMoreProducts = main.querySelector('#liteMore');
    const delivery = main.querySelector('.delivery-rates');
    const pay = main.querySelector('#pay');
    const checkout = main.querySelector('#checkout');
    const services = main.querySelector('.live-services');
    const trust = main.querySelector('.trust-strip');
    const allPhotosHead = main.querySelector('#allPhotos');
    const photoGrid = main.querySelector('#photoGrid');
    const loadMorePhotos = main.querySelector('#loadMore');

    const marker = document.createElement('div');
    marker.className = 'shopping-flow-marker';
    main.prepend(marker);

    const shoppingSections = [hero, categoryJump, filterToggle, toolbar, productsHead, productGrid].filter(Boolean);
    marker.after(...shoppingSections);
    if (loadMoreProducts) productGrid?.after(loadMoreProducts);

    const serviceTitle = document.createElement('section');
    serviceTitle.className = 'section-head compact store-services-title';
    serviceTitle.innerHTML = '<div><p class="eyebrow">Order with confidence</p><h2>Delivery, payment and support</h2></div><span>Everything you need after choosing your products.</span>';
    productGrid?.insertAdjacentElement('afterend', serviceTitle);
    serviceTitle.after(...[delivery, pay, checkout, services, trust].filter(Boolean));

    if (allPhotosHead && photoGrid) {
      trust?.insertAdjacentElement('afterend', allPhotosHead);
      allPhotosHead.insertAdjacentElement('afterend', photoGrid);
      if (loadMorePhotos) photoGrid.insertAdjacentElement('afterend', loadMorePhotos);
    }

    const style = document.createElement('style');
    style.textContent = `
      .market-benefits{padding:6px 14px;font-size:12px;gap:14px;overflow-x:auto;white-space:nowrap}
      .market-header{position:sticky;top:0;z-index:50;background:#fff}
      .market-mainbar{gap:12px;padding-top:10px;padding-bottom:10px}
      .market-brand-text small{font-size:12px}
      .market-nav{display:flex;gap:18px;overflow-x:auto;white-space:nowrap;padding-top:8px;padding-bottom:10px}
      .hero{margin-top:12px;margin-bottom:12px;padding-top:18px;padding-bottom:18px}
      .hero h1{font-size:clamp(24px,4vw,38px);line-height:1.08}
      .hero-copy>p:not(.eyebrow){max-width:720px}
      .delivery-card{display:none}
      .category-jump{order:2;margin-top:10px;margin-bottom:10px}
      .toolbar{margin-top:8px;margin-bottom:14px}
      #products{margin-top:6px}
      .store-services-title{margin-top:28px}
      .delivery-rates,.notice,.checkout-strip,.live-services,.trust-strip{margin-top:12px}
      #allPhotos{margin-top:28px}
      @media(max-width:820px){
        .market-benefits{display:none}
        .market-header{position:sticky;top:0}
        .market-mainbar{grid-template-columns:1fr auto;padding:10px 14px}
        .market-brand{min-width:0}
        .market-brand-text strong{font-size:18px}
        .market-actions .whatsapp-link{display:none}
        .market-search{grid-column:1/-1;order:3;width:100%}
        .market-search input{min-width:0}
        .market-nav{padding:6px 14px 9px;gap:16px;font-size:14px}
        .hero{padding:14px;margin:8px 12px}
        .hero h1{font-size:22px}
        .hero-copy>p:not(.eyebrow){font-size:14px}
        .hero-actions{gap:8px}
        .hero-actions .secondary{display:none}
        .category-jump{display:flex;overflow-x:auto;white-space:nowrap;gap:8px;padding:0 12px}
        .toolbar{margin:8px 12px 12px}
        .section-head,#productGrid,.store-services-title,.delivery-rates,.notice,.checkout-strip,.live-services,.trust-strip,#allPhotos,#photoGrid,#loadMore{margin-left:12px;margin-right:12px}
        .store-services-title{margin-top:22px}
      }
    `;
    document.head.appendChild(style);

    if (filterToggle && toolbar) {
      filterToggle.addEventListener('click', () => {
        const open = toolbar.classList.toggle('mobile-open');
        filterToggle.setAttribute('aria-expanded', String(open));
        filterToggle.textContent = open ? 'Hide filters' : 'Filters and sorting';
      });
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', arrange);
  else arrange();
})();
