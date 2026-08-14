// Lightweight layout loader. Core shopping behavior remains in app.js.
(() => {
  const script = document.createElement('script');
  script.src = 'layout.js?v=category-visual-search-01';
  script.defer = true;
  document.head.appendChild(script);
})();
