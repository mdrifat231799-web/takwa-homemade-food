/* ------------------------------------------------------------
   SETTINGS: change these before sharing with the client
   ------------------------------------------------------------ */
const SETTINGS = {
  whatsapp: "8801XXXXXXXXX",      // country code + number, no + or spaces
  phoneDisplay: "+880 1XXX-XXXXXX"
};

/* ------------------------------------------------------------
   PRODUCTS: sample items and sample prices (edit freely)
   sizes: [label, price in taka]
   ------------------------------------------------------------ */
const PRODUCTS = [
  { id: 1, tag: "Pure & hand-churned",  cat: "ghee-honey", name: "Pure Ghee",            bn: "গাওয়া ঘি",       icon: "🧈", bg: "#fff1c2", best: true, sizes: [["250 g", 530], ["500 g", 1020]] },
  { id: 2, tag: "Raw, unheated",  cat: "ghee-honey", name: "Natural Honey",        bn: "খাঁটি মধু",       icon: "🍯", bg: "#fde08a", best: true, sizes: [["500 g", 750], ["1 kg", 1450]] },
  { id: 3, tag: "Sun-cured",  cat: "pickles",    name: "Mango Pickle",         bn: "আমের আচার",      icon: "🥭", bg: "#ffd8b8", best: true, sizes: [["250 g", 220], ["500 g", 420]] },
  { id: 4, tag: "Pure mustard",  cat: "spices-oil", name: "Mustard Oil",          bn: "সরিষার তেল",     icon: "🫙", bg: "#f6e9a3", best: true, sizes: [["500 ml", 200], ["1 ltr", 390], ["5 ltr", 1900]] },
  { id: 5, tag: "No preservatives",  cat: "frozen",     name: "Beef Samosa",          bn: "বিফ সমুচা",      icon: "🥟", bg: "#f9d5c4", best: true, sizes: [["20 pcs", 480], ["40 pcs", 920]] },
  { id: 6, tag: "Ground fresh",  cat: "spices-oil", name: "Chili Powder",         bn: "মরিচের গুঁড়া",   icon: "🌶️", bg: "#ffc9c0", best: true, sizes: [["200 g", 160], ["500 g", 380]] },
  { id: 7, tag: "Natural sweetener",  cat: "sweets",     name: "Khejur Gur (Patali)",  bn: "খেজুর গুড়",     icon: "🍮", bg: "#f0d2a8", best: true, badge: "Pre-order", sizes: [["500 g", 380], ["1 kg", 740]] },
  { id: 8, tag: "Sun-dried",  cat: "dry-fish",   name: "Loitta Shutki",        bn: "লইট্টা শুটকি",   icon: "🐟", bg: "#d6e8f2", best: true, sizes: [["250 g", 450], ["500 g", 860]] },

  { id: 9, tag: "Freshly made",  cat: "frozen",     name: "Chicken Paratha",      bn: "চিকেন পরোটা",    icon: "🫓", bg: "#f6dfb8", isNew: true, sizes: [["10 pcs", 520]] },
  { id: 10, tag: "Raw honey + nuts", cat: "ghee-honey", name: "Honey with Nuts",      bn: "হানি নাটস",      icon: "🥜", bg: "#f8dc9a", isNew: true, sizes: [["450 g", 890]] },
  { id: 11, tag: "Sun-cured", cat: "pickles",    name: "Olive Pickle",         bn: "জলপাইয়ের আচার", icon: "🫒", bg: "#d9e8b8", isNew: true, sizes: [["250 g", 240], ["500 g", 460]] },
  { id: 12, tag: "Unrefined", cat: "sweets",     name: "Akher Gur Powder",     bn: "আখের গুড় গুঁড়া", icon: "🍬", bg: "#efd5b4", isNew: true, sizes: [["500 g", 220], ["800 g", 340]] },
  { id: 13, tag: "Ground fresh", cat: "spices-oil", name: "Turmeric Powder",      bn: "হলুদের গুঁড়া",   icon: "🟡", bg: "#fbe27a", sizes: [["200 g", 140], ["500 g", 320]] },
  { id: 14, tag: "No artificial colour", cat: "pickles",    name: "Mixed Pickle",         bn: "মিক্সড আচার",    icon: "🥒", bg: "#d8ecc9", sizes: [["250 g", 200], ["500 g", 380]] },
  { id: 15, tag: "Sun-dried", cat: "dry-fish",   name: "Chhoto Chingri Shutki", bn: "ছোট চিংড়ি শুটকি", icon: "🦐", bg: "#f9d4c9", sizes: [["200 g", 420]] },
  { id: 16, tag: "Homemade", cat: "sweets",     name: "Homemade Pitha Box",   bn: "পিঠা বক্স",       icon: "🥮", bg: "#f4dcc2", badge: "Weekend only", sizes: [["Box of 12", 600]] }
];

/* ------------------------------------------------------------ */
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const taka = n => "৳" + n.toLocaleString("en-US");

let activeCat = "all";
let query = "";
let cart = [];
try { cart = JSON.parse(localStorage.getItem("takwa-cart") || "[]"); } catch (e) { cart = []; }
const saveCart = () => { try { localStorage.setItem("takwa-cart", JSON.stringify(cart)); } catch (e) {} };

/* ---------- product cards ---------- */
function cardHTML(p) {
  const badge = p.badge ? `<span class="badge alt">${p.badge}</span>` : p.isNew ? `<span class="badge alt">New</span>` : "";
  const sizes = p.sizes.map((s, i) =>
    `<button type="button" class="size${i === 0 ? " is-active" : ""}" data-i="${i}">${s[0]}</button>`).join("");
  return `
  <article class="card" data-id="${p.id}" data-size="0">
    <div class="card-img" style="background:${p.bg}" aria-hidden="true">${badge}${p.icon}</div>
    <div class="card-body">
      <span class="ptag">${p.tag}</span>
      <h3>${p.name}<small>${p.bn}</small></h3>
      <div class="sizes">${sizes}</div>
      <div class="price">${taka(p.sizes[0][1])}</div>
      <button type="button" class="add">Add to cart</button>
    </div>
  </article>`;
}

function render() {
  const q = query.trim().toLowerCase();
  const list = PRODUCTS.filter(p =>
    (activeCat === "all" || p.cat === activeCat) &&
    (!q || (p.name + " " + p.bn).toLowerCase().includes(q)));
  const grid = $("#productGrid");
  grid.innerHTML = list.map(cardHTML).join("");
  $("#emptyMsg").hidden = list.length > 0;
  $("#prodTitle").textContent = q ? "Search results" : activeCat === "all" ? "Best selling items" : $(`.chip[data-cat="${activeCat}"]`).textContent;
  $$("#filters .chip").forEach(c => c.classList.toggle("is-active", c.dataset.cat === activeCat));
}

function renderNew() {
  $("#newGrid").innerHTML = PRODUCTS.filter(p => p.isNew).map(cardHTML).join("");
}

function setCat(cat, scroll) {
  activeCat = cat; query = ""; $("#searchInput").value = "";
  render();
  if (scroll) $("#products").scrollIntoView({ behavior: "smooth" });
}

/* ---------- card interactions (delegated) ---------- */
document.addEventListener("click", e => {
  const size = e.target.closest(".size");
  if (size) {
    const card = size.closest(".card");
    const p = PRODUCTS.find(x => x.id == card.dataset.id);
    card.dataset.size = size.dataset.i;
    $$(".size", card).forEach(b => b.classList.toggle("is-active", b === size));
    $(".price", card).textContent = taka(p.sizes[size.dataset.i][1]);
    return;
  }
  const add = e.target.closest(".add");
  if (add) {
    const card = add.closest(".card");
    addToCart(+card.dataset.id, +card.dataset.size);
    return;
  }
  const catBtn = e.target.closest("[data-cat]");
  if (catBtn && !catBtn.classList.contains("size") && !catBtn.closest(".card")) {
    e.preventDefault();
    setCat(catBtn.dataset.cat, true);
  }
});

/* ---------- cart ---------- */
function addToCart(id, si) {
  const found = cart.find(l => l.id === id && l.si === si);
  if (found) found.qty++; else cart.push({ id, si, qty: 1 });
  saveCart(); renderCart();
  const p = PRODUCTS.find(x => x.id === id);
  toast(`${p.name} added`);
  const btn = $("#cartBtn"); btn.classList.remove("bump"); void btn.offsetWidth; btn.classList.add("bump");
}

function renderCart() {
  const body = $("#cartItems");
  const count = cart.reduce((n, l) => n + l.qty, 0);
  const total = cart.reduce((n, l) => n + l.qty * PRODUCTS.find(p => p.id === l.id).sizes[l.si][1], 0);
  $("#cartCount").textContent = count;
  $("#cartTotal").textContent = taka(total);

  if (!cart.length) {
    body.innerHTML = `<p class="cart-empty">Your cart is empty.<br>Add something tasty from the shop.</p>`;
  } else {
    body.innerHTML = cart.map((l, i) => {
      const p = PRODUCTS.find(x => x.id === l.id);
      const [label, price] = p.sizes[l.si];
      return `
      <div class="line">
        <div class="line-ico" style="background:${p.bg}">${p.icon}</div>
        <div>
          <div class="line-name">${p.name}</div>
          <div class="line-size">${label} · ${taka(price)}</div>
          <div class="qty">
            <button type="button" data-q="-1" data-i="${i}" aria-label="Decrease quantity">−</button>
            <span>${l.qty}</span>
            <button type="button" data-q="1" data-i="${i}" aria-label="Increase quantity">+</button>
          </div>
        </div>
        <div>
          <div class="line-price">${taka(price * l.qty)}</div>
          <button type="button" class="line-rm" data-rm="${i}">Remove</button>
        </div>
      </div>`;
    }).join("");
  }

  const co = $("#checkoutBtn");
  co.setAttribute("aria-disabled", cart.length ? "false" : "true");
  co.href = cart.length ? waLink(buildOrderText(total)) : "#";
}

function buildOrderText(total) {
  const lines = cart.map(l => {
    const p = PRODUCTS.find(x => x.id === l.id);
    const [label, price] = p.sizes[l.si];
    return `- ${p.name} (${label}) x ${l.qty} = ${taka(price * l.qty)}`;
  });
  return `আসসালামু আলাইকুম, আমি অর্ডার করতে চাই:\n\n${lines.join("\n")}\n\nSubtotal: ${taka(total)}\n\nName:\nAddress:\nPhone:`;
}
const waLink = text => `https://wa.me/${SETTINGS.whatsapp}?text=${encodeURIComponent(text)}`;

$("#cartItems").addEventListener("click", e => {
  const q = e.target.closest("[data-q]");
  const rm = e.target.closest("[data-rm]");
  if (q) {
    const l = cart[+q.dataset.i];
    l.qty += +q.dataset.q;
    if (l.qty < 1) cart.splice(+q.dataset.i, 1);
  } else if (rm) {
    cart.splice(+rm.dataset.rm, 1);
  } else return;
  saveCart(); renderCart();
});

/* ---------- drawer ---------- */
const drawer = $("#drawer"), scrim = $("#scrim");
function openCart() {
  drawer.classList.add("is-open"); drawer.setAttribute("aria-hidden", "false");
  scrim.hidden = false; $("#closeCart").focus();
}
function closeCart() {
  drawer.classList.remove("is-open"); drawer.setAttribute("aria-hidden", "true");
  scrim.hidden = true; $("#cartBtn").focus();
}
$("#cartBtn").addEventListener("click", openCart);
$("#closeCart").addEventListener("click", closeCart);
scrim.addEventListener("click", closeCart);
document.addEventListener("keydown", e => { if (e.key === "Escape" && drawer.classList.contains("is-open")) closeCart(); });

/* ---------- search, menu, misc ---------- */
$("#searchForm").addEventListener("submit", e => {
  e.preventDefault();
  query = $("#searchInput").value; activeCat = "all";
  render(); $("#products").scrollIntoView({ behavior: "smooth" });
});
$("#searchInput").addEventListener("input", e => { query = e.target.value; activeCat = "all"; render(); });

let toastTimer;
function toast(msg) {
  const t = $("#toast"); t.textContent = msg; t.classList.add("show");
  clearTimeout(toastTimer); toastTimer = setTimeout(() => t.classList.remove("show"), 1800);
}

$("#waLink").href = `https://wa.me/${SETTINGS.whatsapp}`;
$("#telLink").href = `tel:+${SETTINGS.whatsapp}`;
$("#phoneText").textContent = SETTINGS.phoneDisplay;
$("#yr").textContent = new Date().getFullYear();

render(); renderNew(); renderCart();
