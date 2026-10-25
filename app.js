/* ------------------------------------------------------------
   SETTINGS: change these before sharing with the client
   ------------------------------------------------------------ */
const SETTINGS = {
  whatsapp: "8801XXXXXXXXX",      // country code + number, no + or spaces
  phoneDisplay: "+880 1XXX-XXXXXX"
};

/* ------------------------------------------------------------
   PRODUCTS: names, sizes and prices are SAMPLES. Edit freely.
   sizes: [label, price in taka]   img: file inside /images
   fresh: true shows it in "Fresh this week"
   ------------------------------------------------------------ */
const PRODUCTS = [
  { id: 1,  cat: "naru",          name: "Narkel Naru",       bn: "নারকেল নাড়ু",   img: "narkel-naru.jpg", tag: "Coconut & gur",   best: true, fresh: true, sizes: [["250 g", 320], ["500 g", 620], ["1 kg", 1200]] },
  { id: 2,  cat: "naru",          name: "Gur Naru",          bn: "গুড়ের নাড়ু",    img: "gur-naru.jpg",    tag: "Made with gur",   best: true, sizes: [["250 g", 300], ["500 g", 580], ["1 kg", 1120]] },
  { id: 3,  cat: "sandesh-pitha", name: "Narkel Sandesh",    bn: "নারকেল সন্দেশ",  img: "sandesh.jpg",     tag: "Hand-pressed",    best: true, fresh: true, sizes: [["12 pcs", 360], ["24 pcs", 700]] },
  { id: 4,  cat: "sandesh-pitha", name: "Nakshi Pitha",      bn: "নকশি পিঠা",      img: "pitha.jpg",       tag: "Shaped in moulds", best: true, sizes: [["12 pcs", 300], ["24 pcs", 580]] },
  { id: 5,  cat: "snacks",        name: "Crispy Nimki",      bn: "নিমকি",          img: "nimki.jpg",       tag: "Crisp & fresh",   best: true, sizes: [["250 g", 180], ["500 g", 340]] },
  { id: 6,  cat: "snacks",        name: "Gojja",             bn: "গজা",            img: "gojja.jpg",       tag: "Sweet & crunchy", best: true, fresh: true, sizes: [["250 g", 220], ["500 g", 420]] },
  { id: 7,  cat: "dry-fruits",    name: "Dry Fruits Mix",    bn: "ড্রাই ফ্রুটস মিক্স", img: "dry-fruits.jpg", tag: "Nuts & seeds",   best: true, sizes: [["250 g", 480], ["500 g", 920]] },
  { id: 8,  cat: "achar",         name: "Homemade Achar",    bn: "ঘরে বানানো আচার", img: "achar.jpg",       tag: "Rich & spicy",    best: true, fresh: true, sizes: [["250 g", 260], ["500 g", 500]] },
  { id: 9,  cat: "gift-box",      name: "Naru Gift Box",     bn: "নাড়ু গিফট বক্স",  img: "naru-combo.jpg",  tag: "Mixed naru",      badge: "Gift", sizes: [["Small box", 650], ["Large box", 1250]] },
  { id: 10, cat: "gift-box",      name: "Sandesh Gift Box",  bn: "সন্দেশ গিফট বক্স", img: "sandesh-box.jpg", tag: "Pressed sandesh", badge: "Gift", sizes: [["Small box", 700], ["Large box", 1350]] }
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
  const badge = p.badge ? `<span class="badge alt">${p.badge}</span>` : p.fresh ? `<span class="badge alt">Fresh</span>` : "";
  const sizes = p.sizes.map((s, i) =>
    `<button type="button" class="size${i === 0 ? " is-active" : ""}" data-i="${i}">${s[0]}</button>`).join("");
  return `
  <article class="card" data-id="${p.id}" data-size="0">
    <div class="card-img">${badge}<img src="images/${p.img}" alt="${p.name}" loading="lazy" width="480" height="480"></div>
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
  $("#newGrid").innerHTML = PRODUCTS.filter(p => p.fresh).map(cardHTML).join("");
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
        <img class="line-ico" src="images/${p.img}" alt="">
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
$("#giftWa").href = `https://wa.me/${SETTINGS.whatsapp}?text=${encodeURIComponent("আসসালামু আলাইকুম, আমি একটি গিফট বক্স অর্ডার করতে চাই।\nDate:\nNumber of people:")}`;
$("#telLink").href = `tel:+${SETTINGS.whatsapp}`;
$("#phoneText").textContent = SETTINGS.phoneDisplay;
$("#yr").textContent = new Date().getFullYear();

render(); renderNew(); renderCart();
