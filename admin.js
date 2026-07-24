const listNode = document.querySelector("[data-admin-list]");
const searchInput = document.querySelector("[data-admin-search]");
const categorySelect = document.querySelector("[data-admin-category]");
const statusSelect = document.querySelector("[data-admin-status]");
const form = document.querySelector("[data-admin-form]");
const editImage = document.querySelector("[data-edit-image]");
const editName = document.querySelector("[data-edit-name]");
const editPrice = document.querySelector("[data-edit-price]");
const editCategory = document.querySelector("[data-edit-category]");
const editStatus = document.querySelector("[data-edit-status]");
const adminCount = document.querySelector("[data-admin-count]");

let products = [];
let selected = null;

function money(value) {
  return Number.isFinite(Number(value)) ? `KSh ${Number(value).toLocaleString()}` : "Ask price";
}

function overrides() {
  return JSON.parse(localStorage.getItem("gongoniAdminOverrides") || "{}");
}

function saveOverrides(value) {
  localStorage.setItem("gongoniAdminOverrides", JSON.stringify(value));
}

function applyOverride(item) {
  const edit = overrides()[String(item.id)];
  if (!edit) return item;
  return {
    ...item,
    name: edit.name || item.name,
    category: edit.category || item.category,
    price: edit.price === "" || edit.price === null ? null : Number(edit.price),
  };
}

function itemImage(item) {
  return item.thumb || item.image;
}

function categories() {
  return [...new Set(products.map((item) => applyOverride(item).category).filter(Boolean))].sort();
}

function filteredProducts() {
  const query = searchInput.value.trim().toLowerCase();
  const category = categorySelect.value;
  const status = statusSelect.value;
  return products
    .map(applyOverride)
    .filter((item) => {
      const matchesQuery =
        !query ||
        String(item.id).includes(query) ||
        item.name.toLowerCase().includes(query) ||
        item.category.toLowerCase().includes(query);
      const matchesCategory = category === "All" || item.category === category;
      const matchesStatus =
        status === "all" ||
        (status === "ask" && (item.price === null || item.price === undefined)) ||
        (status === "priced" && item.price !== null && item.price !== undefined);
      return matchesQuery && matchesCategory && matchesStatus;
    })
    .slice(0, 160);
}

function renderFilters() {
  const options = ["All", ...categories()];
  categorySelect.innerHTML = options.map((category) => `<option value="${category}">${category}</option>`).join("");
  editCategory.innerHTML = categories().map((category) => `<option value="${category}">${category}</option>`).join("");
}

function renderList() {
  const items = filteredProducts();
  adminCount.textContent = `${products.length} products loaded. Showing ${items.length}.`;
  listNode.innerHTML = items
    .map(
      (item) => `
        <button class="admin-row" type="button" data-select-id="${item.id}">
          <img src="${itemImage(item)}" alt="">
          <span>
            <strong>${item.name}</strong>
            <small>#${item.id} - ${item.category} - ${money(item.price)}</small>
          </span>
        </button>
      `
    )
    .join("");
}

function selectItem(id) {
  const item = applyOverride(products.find((entry) => String(entry.id) === String(id)));
  if (!item) return;
  selected = item;
  editImage.src = itemImage(item);
  editImage.alt = item.name;
  editName.value = item.name;
  editPrice.value = item.price === null || item.price === undefined ? "" : item.price;
  editCategory.value = item.category;
  editStatus.textContent = `Editing #${item.id}`;
}

function saveSelected(event) {
  event.preventDefault();
  if (!selected) return;
  const current = overrides();
  current[String(selected.id)] = {
    name: editName.value.trim(),
    price: editPrice.value.trim(),
    category: editCategory.value,
  };
  saveOverrides(current);
  editStatus.textContent = "Saved. Go back to Shop and refresh to see it.";
  renderFilters();
  renderList();
}

function resetSelected() {
  if (!selected) return;
  const current = overrides();
  delete current[String(selected.id)];
  saveOverrides(current);
  editStatus.textContent = "Reset this item to original data.";
  renderFilters();
  renderList();
  selectItem(selected.id);
}

function exportEdits() {
  const blob = new Blob([JSON.stringify(overrides(), null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "gongoni-admin-edits.json";
  link.click();
  URL.revokeObjectURL(url);
}

Promise.all([fetch("all-photos-data.json").then((res) => res.json())]).then(([data]) => {
  products = data;
  renderFilters();
  renderList();
  const firstAsk = products.find((item) => item.price === null || item.price === undefined) || products[0];
  if (firstAsk) selectItem(firstAsk.id);
});

document.addEventListener("click", (event) => {
  const row = event.target.closest("[data-select-id]");
  if (row) selectItem(row.dataset.selectId);
  if (event.target.closest("[data-export]")) exportEdits();
  if (event.target.closest("[data-clear-edits]")) {
    saveOverrides({});
    editStatus.textContent = "All saved edits cleared.";
    renderFilters();
    renderList();
  }
  if (event.target.closest("[data-reset-item]")) resetSelected();
});

form.addEventListener("submit", saveSelected);
searchInput.addEventListener("input", renderList);
categorySelect.addEventListener("change", renderList);
statusSelect.addEventListener("change", renderList);
