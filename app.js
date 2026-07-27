const WHATSAPP_NUMBER = "254789872543";
const PAYBILL = "222111";
const ACCOUNT = "3072428";
const BUSINESS_NAME = "GONGONI FURNITURE SHOP";
const DELIVERY_AREAS = [
  { area: "Gongoni", fee: 100 },
  { area: "Watamu", fee: 300 },
  { area: "Marereni", fee: 300 },
  { area: "Adu", fee: 450 },
  { area: "Marafa", fee: 500 },
  { area: "Lango Baya", fee: 600 },
];
const DELIVERY_NOTE =
  "Home delivery to your doorstep in Kilifi County and its environs. Delivery starts from KSh 100 in Gongoni, KSh 300 to Watamu/Marereni, KSh 450 to Adu, KSh 500 to Marafa, and KSh 600 to Lango Baya. Parcel drop locations are available in Adu and Malindi. Bulky furniture or heavy orders are confirmed before dispatch.";

const productGrid = document.querySelector("#productGrid");
const photoGrid = document.querySelector("#photoGrid");
const searchInput = document.querySelector("#searchInput");
const searchSuggestions = document.querySelector("#searchSuggestions");
const categorySelect = document.querySelector("#categorySelect");
const sortSelect = document.querySelector("#sortSelect");
const clearFilters = document.querySelector("#clearFilters");
const productCount = document.querySelector("#productCount");
const photoCount = document.querySelector("#photoCount");
const loadMore = document.querySelector("#loadMore");
const viewer = document.querySelector("#viewer");
const paybillModal = document.querySelector("#paybillModal");
const basketPanel = document.querySelector("#basketPanel");
const basketItems = document.querySelector("#basketItems");
const basketDeliveryArea = document.querySelector("#basketDeliveryArea");
const accountModal = document.querySelector("#accountModal");

const state = {
  products: [],
  photos: [],
  photoTotal: 0,
  category: "All",
  search: "",
  sort: "featured",
  shown: 0,
  pageSize: 72,
  activeItem: null,
  viewerImages: [],
  viewerIndex: 0,
  viewerZoom: 1,
  accountMode: "signup",
  pendingOtp: null,
  pendingAccount: null,
  clientAccount: JSON.parse(localStorage.getItem("gongoniClientAccount") || "null"),
  basket: JSON.parse(localStorage.getItem("gongoniBasket") || "{}"),
};

function money(value) {
  return Number.isFinite(Number(value)) ? `KSh ${Number(value).toLocaleString()}` : "Ask price";
}

function deliveryLabel(area) {
  const option = DELIVERY_AREAS.find((item) => item.area === area) || DELIVERY_AREAS[0];
  return `${option.area} - from ${money(option.fee)}`;
}

function brandName(item) {
  const first = String(item.name || "").split(/\s+/)[0] || "Gongoni";
  if (/^batch|general|product$/i.test(first)) return "Gongoni";
  return first.replace(/[^A-Za-z0-9-]/g, "") || "Gongoni";
}

function badgeHtml(item) {
  const priceBadge = Number.isFinite(Number(item.price)) ? "Price ready" : "Ask price";
  const labels = itemLabels(item);
  return `
    <div class="badges">
      <span>In stock</span>
      <span>${priceBadge}</span>
      ${labels.map((label) => `<span>${escapeHtml(label)}</span>`).join("")}
    </div>
  `;
}

function isPlaceholderName(item) {
  return /^(General Goods Item|Batch \d+ Item)/i.test(item.name || "");
}

function itemLabels(item) {
  const labels = [];
  const price = Number(item.price);
  if (isPlaceholderName(item) || !Number.isFinite(price)) labels.push("Needs confirmation");
  if (Number.isFinite(price) && price <= 500) labels.push("Best price");
  if (itemImages(item).length > 1) labels.push("More photos");
  if (Number(item.id) > 700) labels.push("New");
  if (/speaker|flask|thermos|bottle|lanzo|soap|shampoo|oil/i.test(item.name || "")) labels.push("Popular");
  return labels.slice(0, 2);
}

function itemMetaHtml(item) {
  return `
    <div class="item-meta">
      <span>Brand: ${escapeHtml(brandName(item))}</span>
      <span>+ delivery from KSh 100</span>
      <span>No ratings yet</span>
    </div>
  `;
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function itemDescription(item) {
  const name = item.name || "This item";
  const category = item.category || "General goods";
  if (category === "Basket") {
    return "This is a basket order with all selected items together. Choose your delivery area to see the estimated total before paying.";
  }
  const priceLine = Number.isFinite(Number(item.price))
    ? `It is priced at ${money(item.price)}.`
    : "The price should be confirmed before ordering.";

  const categoryDescriptions = {
    "Appliances & electronics": `${name} is a practical electronics or appliance item for home and daily use.`,
    "Baby & kids": `${name} is selected for baby and kids needs, with convenient everyday use in mind.`,
    "Beauty & care": `${name} is a personal care item for grooming, hygiene, and daily freshness.`,
    Cleaning: `${name} is a cleaning product for keeping the home, kitchen, clothes, or shoes neat.`,
    "Flasks & bottles": `${name} is suitable for carrying or serving drinks and helping keep them ready for use.`,
    "Furniture & chairs": `${name} is a furniture item for seating, home use, or shop use.`,
    "General goods": `${name} is available at Gongoni Furniture Shop for everyday household shopping.`,
    "Grocery & food": `${name} is a grocery item for everyday home use and quick restocking.`,
    "Home & bedding": `${name} is a home item for comfort, furniture, or household arrangement.`,
    Kitchenware: `${name} is a kitchen item for cooking, serving, storage, or dining at home.`,
  };

  return `${categoryDescriptions[category] || `${name} is available under ${category}.`} ${priceLine} Delivery is available to Gongoni, Watamu, Marereni, Adu, Marafa, Lango Baya, and nearby areas. Parcel drop locations are available in Adu and Malindi.`;
}

function whatsappUrl(message) {
  const encoded = encodeURIComponent(message);
  return WHATSAPP_NUMBER
    ? `https://wa.me/${WHATSAPP_NUMBER}?text=${encoded}`
    : `https://wa.me/?text=${encoded}`;
}

function orderMessage(item) {
  return [
    `Hello Gongoni, I want to order: ${item.name}`,
    `Price: ${money(item.price)}`,
    `Description: ${itemDescription(item)}`,
    DELIVERY_NOTE,
    "My delivery area:",
    `Paybill: ${PAYBILL}`,
    `Account No: ${ACCOUNT}`,
    `Name: ${BUSINESS_NAME}`,
  ].join("\n");
}

function shareMessage(item) {
  return [
    `${item.name} at Gongoni Furniture Shop`,
    `Price: ${money(item.price)}`,
    "Delivery available in Kilifi County and environs.",
    `WhatsApp: 0789872543`,
  ].join("\n");
}

function paymentMessage(item) {
  return [
    `Hello Gongoni, I have paid for: ${item.name}`,
    `Amount: ${money(item.price)}`,
    "Delivery area:",
    "Delivery fee:",
    "Total paid:",
    `Paybill: ${PAYBILL}`,
    `Account No: ${ACCOUNT}`,
    `Name: ${BUSINESS_NAME}`,
    "Delivery location:",
  ].join("\n");
}

function generalMessage() {
  return [
    "Hello Gongoni, I want to place an order.",
    DELIVERY_NOTE,
    "My delivery area:",
    `Paybill: ${PAYBILL}`,
    `Account No: ${ACCOUNT}`,
    `Name: ${BUSINESS_NAME}`,
  ].join("\n");
}

function accountMessage() {
  const name = accountModal.querySelector("[data-account-name]").value.trim() || "Client";
  const contact = accountModal.querySelector("[data-account-contact]").value.trim() || "Not provided";
  const area = accountModal.querySelector("[data-account-area]").value || DELIVERY_AREAS[0].area;
  const action = state.accountMode === "signin" ? "sign in to my client account" : "sign up for a client account";
  return [
    `Hello Gongoni, I want to ${action}.`,
    `Name: ${name}`,
    `Email/Phone: ${contact}`,
    `Delivery area: ${area}`,
    "I understand I can still order without an account.",
  ].join("\n");
}

function openAccount(mode = state.clientAccount ? "signin" : "signup") {
  setAccountMode(mode);
  accountModal.classList.add("open");
  accountModal.setAttribute("aria-hidden", "false");
  updateAccountWhatsapp();
}

function closeAccount() {
  accountModal.classList.remove("open");
  accountModal.setAttribute("aria-hidden", "true");
}

function updateAccountWhatsapp() {
  accountModal.querySelector("[data-account-whatsapp]").href = whatsappUrl(accountMessage());
}

function accountFields() {
  return {
    name: accountModal.querySelector("[data-account-name]"),
    contact: accountModal.querySelector("[data-account-contact]"),
    area: accountModal.querySelector("[data-account-area]"),
    otp: accountModal.querySelector("[data-account-otp]"),
    otpField: accountModal.querySelector(".otp-field"),
    otpPreview: accountModal.querySelector("[data-otp-preview]"),
    title: accountModal.querySelector("[data-account-title]"),
    intro: accountModal.querySelector("[data-account-intro]"),
    submit: accountModal.querySelector("[data-account-submit]"),
    status: accountModal.querySelector("[data-account-status]"),
  };
}

function generateOtp() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

function setAccountMode(mode) {
  state.accountMode = mode;
  state.pendingOtp = null;
  state.pendingAccount = null;
  const fields = accountFields();
  fields.otp.value = "";
  fields.otpField.hidden = true;
  fields.otpPreview.hidden = true;
  fields.otpPreview.textContent = "";
  fields.status.textContent = "";
  if (mode === "signin" && state.clientAccount) {
    fields.title.textContent = "Sign in to your account";
    fields.intro.textContent = "Enter your phone or email and verify with OTP to continue. Quick WhatsApp ordering still works without signing in.";
    fields.name.value = state.clientAccount.name || "";
    fields.contact.value = state.clientAccount.contact || "";
    fields.area.value = state.clientAccount.area || DELIVERY_AREAS[0].area;
    fields.submit.textContent = "Send sign in OTP";
  } else {
    fields.title.textContent = "Sign up with email or phone";
    fields.intro.textContent = "No account is needed for quick WhatsApp orders. Sign up only if you want your details saved for faster repeat shopping.";
    fields.submit.textContent = "Send OTP";
  }
  updateAccountButtons();
  updateAccountWhatsapp();
}

function updateAccountButtons() {
  const name = String(state.clientAccount?.name || "").trim();
  const contact = String(state.clientAccount?.contact || "").trim();
  const label = name || contact;
  document.querySelectorAll("[data-account-button]").forEach((button) => {
    button.textContent = state.clientAccount ? "Sign in" : "Sign up";
  });
  document.querySelectorAll("[data-client-greeting]").forEach((node) => {
    node.hidden = !label;
    node.textContent = label ? `Hi, ${label}` : "";
  });
  document.querySelectorAll("[data-client-welcome]").forEach((node) => {
    node.hidden = !label;
    node.textContent = label ? `Welcome back, ${label}. Your client account is ready for faster shopping.` : "";
  });
}

function sendOtp() {
  const fields = accountFields();
  const name = fields.name.value.trim();
  const contact = fields.contact.value.trim();
  const area = fields.area.value || DELIVERY_AREAS[0].area;
  if (!contact) {
    fields.status.textContent = "Please enter an email or phone number.";
    return false;
  }
  state.pendingOtp = generateOtp();
  state.pendingAccount = { name, contact, area };
  fields.otpField.hidden = false;
  fields.otpPreview.hidden = false;
  fields.otpPreview.textContent = `Preview OTP: ${state.pendingOtp}. On the live website, this code will be sent to the phone or email entered.`;
  fields.submit.textContent = state.accountMode === "signin" ? "Sign in" : "Verify and create account";
  fields.status.textContent = `OTP created for ${contact}. Enter it below to continue.`;
  fields.otp.focus();
  updateAccountWhatsapp();
  return true;
}

function saveAccount(event) {
  event.preventDefault();
  const fields = accountFields();
  if (!state.pendingOtp) {
    sendOtp();
    return;
  }
  if (fields.otp.value.trim() !== state.pendingOtp) {
    fields.status.textContent = "That OTP is not correct. Please check and try again.";
    return;
  }
  const account = {
    ...state.pendingAccount,
    verified: true,
    signedInAt: new Date().toISOString(),
    savedAt: state.clientAccount?.savedAt || new Date().toISOString(),
  };
  localStorage.setItem("gongoniClientAccount", JSON.stringify(account));
  state.clientAccount = account;
  state.pendingOtp = null;
  state.pendingAccount = null;
  fields.otpField.hidden = true;
  fields.otpPreview.hidden = true;
  fields.status.textContent =
    state.accountMode === "signin" ? "Signed in successfully." : "Account verified and saved on this device.";
  fields.submit.textContent = "Send sign in OTP";
  updateAccountButtons();
  updateAccountWhatsapp();
  setTimeout(closeAccount, 700);
}

function itemPayload(item) {
  return escapeHtml(JSON.stringify(item));
}

function itemImages(item) {
  const images = Array.isArray(item.images) && item.images.length ? item.images : [item.image];
  return [...new Set(images.filter(Boolean))];
}

function displayImage(item) {
  return itemImages(item)[0] || item.image;
}

function cardImage(item) {
  return item.thumb || displayImage(item);
}

function isGenericBlankItem(item) {
  return isPlaceholderName(item) && !String(item.caption || "").trim();
}

function isSideAngleItem(item) {
  return (
    (item.price === null || item.price === undefined) &&
    item.category === "General goods" &&
    (isGenericBlankItem(item) || /(dower|technical|off power|power ac|input speaker|power output)/i.test(item.name || item.caption || ""))
  );
}

function groupSimilarItems(items) {
  const grouped = [];
  items.forEach((source) => {
    const item = { ...source, images: itemImages(source) };
    const previous = grouped[grouped.length - 1];
    const shouldAttachPrevious =
      previous &&
      isSideAngleItem(previous) &&
      Number.isFinite(Number(item.price)) &&
      /(speaker|woofer|multimedia|vitron|sayona|nunix|sinatech|ailyons|ctc)/i.test(item.name || item.caption || "");
    const shouldJoinPrevious =
      previous &&
      isGenericBlankItem(item) &&
      !isGenericBlankItem(previous) &&
      Number.isFinite(Number(previous.price));

    if (shouldAttachPrevious) {
      grouped.pop();
      item.images = [...new Set([...itemImages(previous), ...item.images])];
      grouped.push(item);
      return;
    }

    if (shouldJoinPrevious) {
      previous.images = [...new Set([...itemImages(previous), ...item.images])];
      return;
    }

    grouped.push(item);
  });
  return grouped;
}

function applyAdminOverrides(items) {
  const overrides = JSON.parse(localStorage.getItem("gongoniAdminOverrides") || "{}");
  return items.map((item) => {
    const edit = overrides[String(item.id)];
    if (!edit) return item;
    return {
      ...item,
      name: edit.name || item.name,
      category: edit.category || item.category,
      price: edit.price === "" || edit.price === null ? null : Number(edit.price),
    };
  });
}

function actionButtons(item) {
  return `
    <div class="card-actions">
      <button class="add-action" type="button" data-add-item="${itemPayload(item)}">Add to basket</button>
      <button class="paybill-action" type="button" data-pay-item="${itemPayload(item)}">Direct Paybill</button>
    </div>
  `;
}

function basketKey(item) {
  return `${item.id || displayImage(item)}-${item.name}`;
}

function saveBasket() {
  localStorage.setItem("gongoniBasket", JSON.stringify(state.basket));
}

function basketEntries() {
  return Object.values(state.basket);
}

function basketCount() {
  return basketEntries().reduce((sum, entry) => sum + entry.qty, 0);
}

function basketSubtotal() {
  return basketEntries().reduce((sum, entry) => {
    const price = Number(entry.item.price);
    return Number.isFinite(price) ? sum + price * entry.qty : sum;
  }, 0);
}

function selectedDelivery() {
  const area = basketDeliveryArea?.value || DELIVERY_AREAS[0].area;
  return DELIVERY_AREAS.find((item) => item.area === area) || DELIVERY_AREAS[0];
}

function addToBasket(item) {
  const key = basketKey(item);
  if (!state.basket[key]) state.basket[key] = { item, qty: 0 };
  state.basket[key].qty += 1;
  saveBasket();
  renderBasket();
  openBasket();
}

function changeBasketQty(key, amount) {
  if (!state.basket[key]) return;
  state.basket[key].qty += amount;
  if (state.basket[key].qty <= 0) delete state.basket[key];
  saveBasket();
  renderBasket();
}

function basketMessage() {
  const entries = basketEntries();
  const delivery = selectedDelivery();
  const subtotal = basketSubtotal();
  const hasAskPrice = entries.some((entry) => !Number.isFinite(Number(entry.item.price)));
  const lines = entries.map((entry) => {
    const each = money(entry.item.price);
    const lineTotal = Number.isFinite(Number(entry.item.price))
      ? money(Number(entry.item.price) * entry.qty)
      : "Ask price";
    return `${entry.qty} x ${entry.item.name} - ${each} each - ${lineTotal}`;
  });
  return [
    "Hello Gongoni, I want to order this basket:",
    ...lines,
    `Items total: ${money(subtotal)}`,
    `Delivery area: ${delivery.area}`,
    `Delivery fee: from ${money(delivery.fee)}`,
    `Estimated total: ${hasAskPrice ? "Confirm ask-price items first" : money(subtotal + delivery.fee)}`,
    DELIVERY_NOTE,
    `Paybill: ${PAYBILL}`,
    `Account No: ${ACCOUNT}`,
    `Name: ${BUSINESS_NAME}`,
  ].join("\n");
}

function renderBasket() {
  document.querySelectorAll("[data-basket-count]").forEach((node) => {
    node.textContent = basketCount();
  });

  const currentArea = basketDeliveryArea.value || DELIVERY_AREAS[0].area;
  basketDeliveryArea.innerHTML = DELIVERY_AREAS.map(
    (area) => `<option value="${area.area}">${deliveryLabel(area.area)}</option>`
  ).join("");
  basketDeliveryArea.value = DELIVERY_AREAS.some((area) => area.area === currentArea)
    ? currentArea
    : DELIVERY_AREAS[0].area;

  const entries = basketEntries();
  if (!entries.length) {
    basketItems.innerHTML = `<p class="empty-basket">Your basket is empty. Add items from the product cards.</p>`;
  } else {
    basketItems.innerHTML = entries
      .map(({ item, qty }) => {
        const key = escapeHtml(basketKey(item));
        return `
          <article class="basket-item">
            <img src="${escapeHtml(cardImage(item))}" alt="${escapeHtml(item.name)}">
            <div>
              <strong>${escapeHtml(item.name)}</strong>
              <small>${escapeHtml(item.category)} - ${money(item.price)}</small>
              <div class="qty-controls">
                <button type="button" data-basket-dec="${key}">-</button>
                <span>${qty}</span>
                <button type="button" data-basket-inc="${key}">+</button>
              </div>
            </div>
          </article>
        `;
      })
      .join("");
  }

  const delivery = selectedDelivery();
  const subtotal = basketSubtotal();
  const hasAskPrice = entries.some((entry) => !Number.isFinite(Number(entry.item.price)));
  document.querySelector("[data-basket-subtotal]").textContent = money(subtotal);
  document.querySelector("[data-basket-delivery]").textContent = `From ${money(delivery.fee)}`;
  document.querySelector("[data-basket-total]").textContent =
    entries.length && !hasAskPrice ? `${money(subtotal + delivery.fee)} estimate` : "Confirm prices first";
  document.querySelector("[data-basket-whatsapp]").href = whatsappUrl(basketMessage());
  renderCheckout();
}

function openBasket() {
  renderBasket();
  basketPanel.classList.add("open");
  basketPanel.setAttribute("aria-hidden", "false");
}

function closeBasket() {
  basketPanel.classList.remove("open");
  basketPanel.setAttribute("aria-hidden", "true");
}

function filteredItems(items) {
  const query = state.search.trim().toLowerCase();
  const filtered = items.filter((item) => {
    const matchesCategory = state.category === "All" || item.category === state.category;
    const matchesSearch =
      !query ||
      item.name.toLowerCase().includes(query) ||
      item.category.toLowerCase().includes(query);
    return matchesCategory && matchesSearch;
  });
  return sortItems(filtered);
}

function sortItems(items) {
  const sorted = [...items];
  const price = (item) => (Number.isFinite(Number(item.price)) ? Number(item.price) : Number.POSITIVE_INFINITY);
  if (state.sort === "featured") {
    sorted.sort((a, b) => {
      const aScore =
        (isPlaceholderName(a) ? 100 : 0) +
        (!Number.isFinite(Number(a.price)) ? 40 : 0) -
        (itemImages(a).length > 1 ? 5 : 0);
      const bScore =
        (isPlaceholderName(b) ? 100 : 0) +
        (!Number.isFinite(Number(b.price)) ? 40 : 0) -
        (itemImages(b).length > 1 ? 5 : 0);
      return aScore - bScore || Number(a.id || 0) - Number(b.id || 0);
    });
  }
  if (state.sort === "price-low") sorted.sort((a, b) => price(a) - price(b));
  if (state.sort === "price-high") sorted.sort((a, b) => price(b) - price(a));
  if (state.sort === "name") sorted.sort((a, b) => String(a.name).localeCompare(String(b.name)));
  if (state.sort === "newest") sorted.sort((a, b) => Number(b.id || 0) - Number(a.id || 0));
  return sorted;
}

function renderCategories() {
  const categories = [...new Set(state.photos.map((item) => item.category))].sort();
  categorySelect.innerHTML = `<option value="All">All categories (${state.photos.length})</option>`;
  categories.forEach((category) => {
    const count = state.photos.filter((item) => item.category === category).length;
    const option = document.createElement("option");
    option.value = category;
    option.textContent = `${category} (${count})`;
    categorySelect.appendChild(option);
  });
  renderSearchSuggestions();
}

function renderSearchSuggestions() {
  const names = [...new Set(state.photos.map((item) => item.name).filter(Boolean))].slice(0, 240);
  searchSuggestions.innerHTML = names.map((name) => `<option value="${escapeHtml(name)}"></option>`).join("");
}

function renderCheckout() {
  const entries = basketEntries();
  const delivery = selectedDelivery();
  const subtotal = basketSubtotal();
  const hasAskPrice = entries.some((entry) => !Number.isFinite(Number(entry.item.price)));
  document.querySelector("[data-checkout-count]").textContent = `${basketCount()} items`;
  document.querySelector("[data-checkout-subtotal]").textContent = money(subtotal);
  document.querySelector("[data-checkout-delivery]").textContent = `From ${money(delivery.fee)}`;
  document.querySelector("[data-checkout-total]").textContent =
    entries.length && !hasAskPrice ? `${money(subtotal + delivery.fee)} estimate` : "Confirm prices first";
  document.querySelector("[data-checkout-empty]").textContent = entries.length
    ? "Review your basket, choose delivery, then send order or pay by Paybill."
    : "Add items to basket and confirm delivery before paying.";
  document.querySelector("[data-checkout-whatsapp]").href = whatsappUrl(entries.length ? basketMessage() : generalMessage());
}

function renderProducts() {
  const products = filteredItems(state.products);
  productCount.textContent = `${products.length} featured products`;
  productGrid.innerHTML = products
    .map(
      (item) => `
        <article class="product-card">
          <button type="button" data-open="${escapeHtml(displayImage(item))}" data-title="${escapeHtml(item.name)}" data-description="${escapeHtml(itemDescription(item))}" data-item="${itemPayload(item)}">
            <img src="${escapeHtml(cardImage(item))}" alt="${escapeHtml(item.name)}" loading="lazy">
            ${itemImages(item).length > 1 ? `<span class="slide-count">1 / ${itemImages(item).length}</span>` : ""}
          </button>
          ${badgeHtml(item)}
          <div>
            <h3>${escapeHtml(item.name)}</h3>
            <small>${escapeHtml(item.category)}</small>
          </div>
          <div class="price">${money(item.price)}</div>
          ${itemMetaHtml(item)}
          ${actionButtons(item)}
        </article>
      `
    )
    .join("");
}

function renderPhotos(reset = false) {
  const photos = filteredItems(state.photos);
  if (reset) {
    state.shown = 0;
    photoGrid.innerHTML = "";
  }

  const next = photos.slice(state.shown, state.shown + state.pageSize);
  const html = next
    .map(
      (item) => `
        <article class="photo-card">
          <button type="button" data-open="${escapeHtml(displayImage(item))}" data-title="${escapeHtml(item.name)}" data-description="${escapeHtml(itemDescription(item))}" data-item="${itemPayload(item)}">
            <img src="${escapeHtml(cardImage(item))}" alt="${escapeHtml(item.name)}" loading="lazy">
            ${itemImages(item).length > 1 ? `<span class="slide-count">1 / ${itemImages(item).length}</span>` : ""}
          </button>
          ${badgeHtml(item)}
          <div>
            <strong>${escapeHtml(item.name)}</strong>
            <small>${escapeHtml(item.category)}</small>
          </div>
          <div class="price">${money(item.price)}</div>
          ${itemMetaHtml(item)}
          ${actionButtons(item)}
        </article>
      `
    )
    .join("");

  photoGrid.insertAdjacentHTML("beforeend", html);
  state.shown += next.length;
  photoCount.textContent =
    state.photoTotal > photos.length ? `${photos.length} product cards / ${state.photoTotal} photos` : `${photos.length} photos showing`;
  loadMore.hidden = state.shown >= photos.length;
}

function refresh() {
  renderProducts();
  renderPhotos(true);
}

function openViewer(src, title, description, item) {
  state.activeItem = item;
  state.viewerImages = itemImages(item);
  state.viewerIndex = Math.max(0, state.viewerImages.indexOf(src));
  state.viewerZoom = 1;
  updateViewerImage();
  updateViewerZoom();
  viewer.querySelector("img").alt = title;
  viewer.querySelector("strong").textContent = title;
  viewer.querySelector(".viewer-meta").innerHTML = `
    <span>Brand: ${escapeHtml(brandName(item))}</span>
    <span>In stock</span>
    <span>+ shipping from KSh 100</span>
    <span>No ratings yet</span>
  `;
  viewer.querySelector("p").textContent = description;
  viewer.querySelector(".whatsapp-action").href = whatsappUrl(orderMessage(item));
  viewer.querySelector("[data-viewer-share-whatsapp]").href = whatsappUrl(shareMessage(item));
  viewer.classList.add("open");
  viewer.setAttribute("aria-hidden", "false");
}

function updateViewerImage() {
  const images = state.viewerImages.length ? state.viewerImages : [state.activeItem?.image].filter(Boolean);
  const total = images.length;
  if (!total) return;
  state.viewerIndex = (state.viewerIndex + total) % total;
  viewer.querySelector("img").src = images[state.viewerIndex];
  viewer.querySelector(".viewer-slides").textContent = total > 1 ? `${state.viewerIndex + 1} / ${total}` : "";
  viewer.querySelector("[data-viewer-prev]").hidden = total < 2;
  viewer.querySelector("[data-viewer-next]").hidden = total < 2;
}

function updateViewerZoom() {
  const image = viewer.querySelector("img");
  image.style.transform = `scale(${state.viewerZoom})`;
  image.style.transformOrigin = "center center";
  viewer.querySelectorAll("[data-zoom]").forEach((button) => {
    const selected = Number(button.dataset.zoom) === state.viewerZoom;
    button.classList.toggle("active", selected);
  });
}

function closeViewer() {
  viewer.classList.remove("open");
  viewer.setAttribute("aria-hidden", "true");
}

function openPaybill(item) {
  state.activeItem = item;
  paybillModal.querySelector("h2").textContent = item.name;
  paybillModal.querySelector("[data-pay-amount]").textContent = money(item.price);
  const areaSelect = paybillModal.querySelector("[data-delivery-area]");
  areaSelect.innerHTML = DELIVERY_AREAS.map(
    (area) => `<option value="${area.area}">${deliveryLabel(area.area)}</option>`
  ).join("");
  updatePaybillTotal();
  paybillModal.querySelector("[data-pay-note]").textContent =
    Number.isFinite(Number(item.price))
      ? `${itemDescription(item)} Pick your delivery area above, then pay the estimated total. For bulky furniture, confirm the final delivery fee before dispatch.`
      : "Please confirm the product price on WhatsApp before paying. Delivery fee depends on the selected area and bulky items are confirmed before dispatch.";
  paybillModal.querySelector("[data-pay-whatsapp]").href = whatsappUrl(paymentMessage(item));
  paybillModal.classList.add("open");
  paybillModal.setAttribute("aria-hidden", "false");
}

function updatePaybillTotal() {
  if (!state.activeItem) return;
  const area = paybillModal.querySelector("[data-delivery-area]")?.value || DELIVERY_AREAS[0].area;
  const delivery = DELIVERY_AREAS.find((item) => item.area === area) || DELIVERY_AREAS[0];
  const itemPrice = Number(state.activeItem.price);
  const hasPrice = Number.isFinite(itemPrice);
  paybillModal.querySelector("[data-delivery-fee]").textContent = `From ${money(delivery.fee)}`;
  paybillModal.querySelector("[data-pay-total]").textContent = hasPrice
    ? `${money(itemPrice + delivery.fee)} estimate`
    : "Confirm item price first";
  paybillModal.querySelector("[data-pay-whatsapp]").href = whatsappUrl([
    `Hello Gongoni, I want to confirm payment for: ${state.activeItem.name}`,
    `Item price: ${money(state.activeItem.price)}`,
    `Delivery area: ${delivery.area}`,
    `Delivery fee: from ${money(delivery.fee)}`,
    `Estimated total: ${hasPrice ? money(itemPrice + delivery.fee) : "Confirm item price first"}`,
    `Paybill: ${PAYBILL}`,
    `Account No: ${ACCOUNT}`,
    `Name: ${BUSINESS_NAME}`,
  ].join("\n"));
}

function closePaybill() {
  paybillModal.classList.remove("open");
  paybillModal.setAttribute("aria-hidden", "true");
}

function readItem(value) {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

document.addEventListener("click", (event) => {
  const open = event.target.closest("[data-open]");
  const payItem = event.target.closest("[data-pay-item]");
  const addItem = event.target.closest("[data-add-item]");
  const incItem = event.target.closest("[data-basket-inc]");
  const decItem = event.target.closest("[data-basket-dec]");
  const viewerPrev = event.target.closest("[data-viewer-prev]");
  const viewerNext = event.target.closest("[data-viewer-next]");
  const zoomButton = event.target.closest("[data-zoom]");
  if (addItem) {
    const item = readItem(addItem.dataset.addItem);
    if (item) addToBasket(item);
  }
  if (open) {
    const item = readItem(open.dataset.item);
    if (item) openViewer(open.dataset.open, open.dataset.title, open.dataset.description, item);
  }
  if (event.target.closest("[data-viewer-add]") && state.activeItem) addToBasket(state.activeItem);
  if (event.target.closest("[data-copy-share]") && state.activeItem) {
    navigator.clipboard?.writeText(shareMessage(state.activeItem));
  }
  if (viewerPrev && state.activeItem) {
    state.viewerIndex -= 1;
    updateViewerImage();
  }
  if (viewerNext && state.activeItem) {
    state.viewerIndex += 1;
    updateViewerImage();
  }
  if (zoomButton && state.activeItem) {
    state.viewerZoom = Number(zoomButton.dataset.zoom) || 1;
    updateViewerZoom();
  }
  if (payItem) {
    const item = readItem(payItem.dataset.payItem);
    if (item) openPaybill(item);
  }
  if (event.target.closest("[data-viewer-pay]") && state.activeItem) openPaybill(state.activeItem);
  if (event.target.closest("[data-close]") || event.target === viewer) closeViewer();
  if (event.target.closest("[data-pay-close]") || event.target === paybillModal) closePaybill();
  if (event.target.closest("[data-basket-open]")) openBasket();
  if (event.target.closest("[data-basket-close]") || event.target === basketPanel) closeBasket();
  if (event.target.closest("[data-account-open]")) openAccount(state.clientAccount ? "signin" : "signup");
  if (event.target.closest("[data-account-close]") || event.target === accountModal) closeAccount();
  if (incItem) changeBasketQty(incItem.dataset.basketInc, 1);
  if (decItem) changeBasketQty(decItem.dataset.basketDec, -1);
  if (event.target.closest("[data-basket-clear]")) {
    state.basket = {};
    saveBasket();
    renderBasket();
  }
  if (event.target.closest("[data-basket-pay]") && basketEntries().length) {
    const delivery = selectedDelivery();
    const subtotal = basketSubtotal();
    openPaybill({
      id: "basket",
      name: "Basket order",
      category: "Basket",
      price: subtotal,
      image: displayImage(basketEntries()[0].item),
    });
    paybillModal.querySelector("[data-delivery-area]").value = delivery.area;
    updatePaybillTotal();
  }
});

paybillModal.querySelector("[data-delivery-area]").addEventListener("change", updatePaybillTotal);
basketDeliveryArea.addEventListener("change", renderBasket);
accountModal.querySelector("[data-account-area]").innerHTML = DELIVERY_AREAS.map(
  (area) => `<option value="${area.area}">${deliveryLabel(area.area)}</option>`
).join("");
accountModal.querySelector("form").addEventListener("submit", saveAccount);
accountModal.querySelectorAll("input, select").forEach((field) => {
  field.addEventListener("input", updateAccountWhatsapp);
  field.addEventListener("change", updateAccountWhatsapp);
});
updateAccountButtons();

document.querySelectorAll("[data-whatsapp]").forEach((link) => {
  link.href = whatsappUrl(generalMessage());
  link.target = "_blank";
  link.rel = "noopener";
});

searchInput.addEventListener("input", () => {
  state.search = searchInput.value;
  refresh();
});

categorySelect.addEventListener("change", () => {
  state.category = categorySelect.value;
  refresh();
});

sortSelect.addEventListener("change", () => {
  state.sort = sortSelect.value;
  refresh();
});

clearFilters.addEventListener("click", () => {
  state.search = "";
  state.category = "All";
  state.sort = "featured";
  searchInput.value = "";
  categorySelect.value = "All";
  sortSelect.value = "featured";
  refresh();
});

document.querySelectorAll("[data-category-chip]").forEach((button) => {
  button.addEventListener("click", () => {
    state.category = button.dataset.categoryChip;
    categorySelect.value = state.category;
    refresh();
    document.querySelector("#products").scrollIntoView({ behavior: "smooth", block: "start" });
  });
});

loadMore.addEventListener("click", () => renderPhotos());

Promise.all([
  fetch("products.json?v=shop-contact-locations-01").then((res) => res.json()),
  fetch("all-photos-data.json?v=shop-contact-locations-01").then((res) => res.json()),
])
  .then(([products, photos]) => {
    state.products = groupSimilarItems(applyAdminOverrides(products));
    state.photos = groupSimilarItems(applyAdminOverrides(photos));
    state.photoTotal = photos.length;
    renderCategories();
    renderBasket();
    refresh();
  })
  .catch(() => {
    productGrid.innerHTML = "<p>Could not load products.</p>";
    photoGrid.innerHTML = "<p>Could not load photos.</p>";
  });
