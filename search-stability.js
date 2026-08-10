(() => {
  function realSearch() { return document.querySelector('#searchInput'); }
  function headerSearch() { return document.querySelector('#headerSearchInput'); }

  function applyWithoutJump(value) {
    const input = realSearch();
    if (!input) return;
    const typed = String(value ?? '');
    const normalized = typed.replace(/\bsufurias?\b/ig, 'cooking pot');
    input.value = normalized;
    input.dispatchEvent(new Event('input', { bubbles: true }));
    const header = headerSearch();
    if (header) header.value = typed;
  }

  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Enter') return;
    const target = event.target;
    if (!(target instanceof HTMLInputElement) || target.type !== 'search') return;
    if (target.id !== 'headerSearchInput' && !target.closest('.mobile-search-box')) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    applyWithoutJump(target.value);
    target.closest('.mobile-search-panel')?.classList.remove('open');
    target.closest('.mobile-search-panel')?.setAttribute('aria-hidden', 'true');
  }, true);

  document.addEventListener('click', (event) => {
    const button = event.target.closest?.('#headerSearchButton');
    if (!button) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    applyWithoutJump(headerSearch()?.value || '');
    headerSearch()?.focus();
  }, true);

  document.addEventListener('search', (event) => {
    const target = event.target;
    if (!(target instanceof HTMLInputElement) || target.type !== 'search') return;
    if (target.id !== 'headerSearchInput' && !target.closest('.mobile-search-box')) return;
    event.stopImmediatePropagation();
    applyWithoutJump(target.value);
  }, true);
})();