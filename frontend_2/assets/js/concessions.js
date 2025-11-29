(() => {
  'use strict';

  // ===== Basic helpers & config =====
  const $  = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const API = window.API_BASE || '/api';

  // Nếu file nằm trong /html/, đổi thành '../assets/icons'
  const ICON_BASE = '../assets/icons';

  const toVND = (n) =>
    (Math.round(Number(n) || 0)).toLocaleString('vi-VN') + '₫';

  const CAT_ORDER = ['combo', 'popcorn', 'beverage', 'hot-food', 'coffee', 'dessert'];

const CAT_CONFIG = {
  combo:    { label: 'Combo',    icon: 'ic-ticket-star' },
  popcorn:  { label: 'Popcorn',  icon: 'ic-popcorn' },
  beverage: { label: 'Beverage', icon: 'ic-beverage' },
  'hot-food': { label: 'Hot Food', icon: 'ic-hot-food' },
  coffee:   { label: 'Coffee',   icon: 'ic-drink' },
  dessert: { label: 'Dessert', icon: 'ic-dessert' },
  all:      { label: 'Tất cả',   icon: 'ic-menu' }
};

  const state = {
    combos: [],
    currentCat: 'combo',
    perPage: 8,
    page: 1,
    cart: [],
    ticket: null,
    totals: null,
    backend: {
      enabled: true,
      summaryPath: '/concessions/summary',
      cartPath: '/concessions/cart',
      lastError: null
    }
  };

  // ===== Helpers =====
  async function getJSON(apiPath, localPath) {
    if (apiPath) {
      try {
        const res = await fetch(API + apiPath, { cache: 'no-store' });
        if (res.ok) {
          return await res.json();
        }
      } catch (err) {
        console.warn('[concessions] API error, fallback to local', err);
      }
    }

    if (localPath) {
      try {
        const res = await fetch(localPath, { cache: 'no-store' });
        if (res.ok) {
          return await res.json();
        }
      } catch (err) {
        console.error('[concessions] Local JSON error', err);
      }
    }

    return null;
  }

  /**
   * Chuẩn hoá dữ liệu combos từ BE / JSON local
   * để grid bên trái dùng.
   */
  function normalizeCombos(raw) {
    let items = [];
    if (!raw) return [];
    if (Array.isArray(raw)) items = raw;
    else if (Array.isArray(raw.items)) items = raw.items;
    else return [];

    return items
      .filter(it => it && it.active !== false)
      .map(it => ({
        id: it.id,
        code: it.code || '',
        title: it.title || '',
        description: it.description || '',
        price: Number(it.price || 0),
        oldPrice: it.oldPrice != null ? Number(it.oldPrice) : null,
        tag: it.tag || null,
        imageUrl: it.imageUrl || '',
        category: (it.category || 'combo').toString().toLowerCase(),
        variants: Array.isArray(it.variants)
          ? it.variants.map(v => ({
              id: v.id,
              label: v.label || v.value || '',
              value: (v.value || v.label || '').toString(),
              priceDiff: Number(v.priceDiff || 0)
            }))
          : []
      }));
  }

  // ===== Ticket & cart (BE-first + fallback) =====

  /**
   * Đọc vé (ticket) từ localStorage.booking_cart.
   * Chỉ dùng trong Fallback khi BE không hoạt động.
   */
  function readBookingCartFallback() {
    try {
      const raw = localStorage.getItem('booking_cart');
      if (!raw) return;
      const data = JSON.parse(raw);
      if (!data || typeof data !== 'object') return;

      state.ticket = {
        showtimeId: data.showtimeId,
        items: Array.isArray(data.items) ? data.items : [],
        totalAmount: Number(data.totalAmount || 0),
        meta: data.meta || {}
      };
      state.totals = null; // totals sẽ do FE tự tính
    } catch (e) {
      console.warn('[concessions] cannot parse booking_cart', e);
    }
  }

  function applyBackendSummary(data) {
    if (!data || typeof data !== 'object') return;

    if (data.ticket && typeof data.ticket === 'object') {
      // Ticket của BE sẽ override ticket cũ
      state.ticket = data.ticket;
    }

    if (Array.isArray(data.combos)) {
      state.cart = data.combos
        .map(raw => {
          const variant = raw.variant || raw.size || '';
          const id = raw.comboId != null ? raw.comboId : raw.id;
          const key = raw.key || `${id}__${variant}`;
          return {
            key,
            id,
            code: raw.code || '',
            title: raw.title || raw.name || '',
            imageUrl: raw.imageUrl || raw.thumbnail || '',
            variant,
            variantLabel: raw.variantLabel || raw.sizeLabel || variant || '',
            unitPrice: Number(
              raw.unitPrice != null ? raw.unitPrice : (raw.price || 0)
            ),
            qty: Number(raw.qty || raw.quantity || 0),
            lineTotal: raw.lineTotal != null ? Number(raw.lineTotal) : undefined
          };
        })
        .filter(it => it.qty > 0);
    }

    if (data.totals && typeof data.totals === 'object') {
      const t = data.totals;
      state.totals = {
        ticketAmount: Number(
          t.ticketAmount != null ? t.ticketAmount : (t.ticket || 0)
        ),
        combosAmount: Number(
          t.combosAmount != null ? t.combosAmount : (t.combos || 0)
        ),
        grandTotal: Number(
          t.grandTotal != null ? t.grandTotal : (t.total || 0)
        )
      };
    } else {
      state.totals = null;
    }
  }

  /**
   * BE-first: thử gọi /concessions/summary.
   * Nếu lỗi => tắt backend.enabled & fallback đọc từ localStorage.
   */
  async function loadTicketAndCart() {
    if (state.backend.enabled) {
      try {
        const res = await fetch(API + state.backend.summaryPath, { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          applyBackendSummary(data);
          renderTicketSummary();
          renderCart();
          updateTotals();
          return;
        }
        console.warn('[concessions] summary not ok:', res.status);
        state.backend.enabled = false;
        state.backend.lastError = 'HTTP ' + res.status;
      } catch (err) {
        console.warn('[concessions] summary error, fallback to FE only', err);
        state.backend.enabled = false;
        state.backend.lastError = String(err);
      }
    }

    // Fallback: đọc vé từ localStorage.booking_cart
    readBookingCartFallback();
    renderTicketSummary();
    renderCart();
    updateTotals();
  }

  /**
   * Sync giỏ hàng bắp-nước lên BE.
   * Nếu BE ok -> dùng result từ BE.
   * Nếu lỗi -> tắt backend.enabled và quay về FE tự tính.
   */
  async function syncCartWithBackend() {
    // Nếu BE đã tắt hoặc chưa bật -> dùng FE
    if (!state.backend.enabled) {
      state.totals = null;
      updateTotals();
      return;
    }

    const payload = {
      items: state.cart.map(it => ({
        comboId: it.id,
        variant: it.variant || null,
        qty: it.qty
      }))
    };

    try {
      const res = await fetch(API + state.backend.cartPath, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) {
        throw new Error('HTTP ' + res.status);
      }
      const data = await res.json();
      applyBackendSummary(data);
      renderTicketSummary();
      renderCart();
      updateTotals();
    } catch (err) {
      console.warn('[concessions] syncCartWithBackend failed, fallback FE only', err);
      state.backend.enabled = false;
      state.backend.lastError = String(err);
      state.totals = null;
      updateTotals();
    }
  }

  // ===== UI: Ticket summary =====

  function renderTicketSummary() {
    const metaEl = $('#ticketMeta');
    const ticketFeeEl = $('#ticketFee');
    if (!metaEl || !ticketFeeEl) return;

    const t = state.ticket;
    if (!t) {
      metaEl.textContent = 'Chưa chọn vé. Vui lòng quay lại chọn ghế.';
      ticketFeeEl.textContent = '0₫';
      return;
    }

    const meta = (t.meta && typeof t.meta === 'object') ? t.meta : {};

    const movieTitle =
      meta.movieTitle ||
      t.movieTitle ||
      t.title ||
      '';

    const date =
      meta.date ||
      t.date ||
      t.showDate ||
      '';

    const time =
      meta.time ||
      t.time ||
      t.showTime ||
      '';

    let seatsArr = [];
    if (Array.isArray(t.items)) {
      seatsArr = t.items
        .map(it => it && (it.code || it.seatCode || it.label))
        .filter(Boolean);
    }
    if (!seatsArr.length && Array.isArray(t.seats)) {
      seatsArr = t.seats.filter(Boolean);
    }
    const seatsText = seatsArr.length ? 'Ghế: ' + seatsArr.join(', ') : '';

    const parts = [];
    if (movieTitle) parts.push(movieTitle);
    if (date || time) parts.push([date, time].filter(Boolean).join(' • '));
    if (seatsText) parts.push(seatsText);

    metaEl.textContent = parts.join(' • ') || 'Thông tin vé';

    // Tiền vé: ưu tiên totals.ticketAmount của BE, fallback sang ticket.amount / totalAmount
    let ticketAmount = 0;
    if (state.totals && typeof state.totals.ticketAmount === 'number') {
      ticketAmount = state.totals.ticketAmount;
    } else if (typeof t.amount === 'number') {
      ticketAmount = t.amount;
    } else if (typeof t.totalAmount === 'number') {
      ticketAmount = t.totalAmount;
    }
    ticketFeeEl.textContent = toVND(ticketAmount);
  }

function safeParseBooking() {
  try {
    return JSON.parse(localStorage.getItem('booking_cart') || '{}');
  } catch {
    return {};
  }
}

// ===== Breadcrumb (Style Code 1: Phẳng + Separator) =====
  function buildBreadcrumb() {
    const wrap = document.getElementById('bc'); // Container trên HTML (thường là <nav class="breadcrumb">)
    if (!wrap) return;

    // 1. Đọc dữ liệu booking đang dở dang từ localStorage
    let cart = {};
    try {
      cart = JSON.parse(localStorage.getItem('booking_cart') || '{}');
    } catch (e) {
      console.warn('Lỗi đọc booking_cart', e);
    }

    const meta = cart.meta || {};
    const movieId = meta.movieId || cart.movieId;
    const showtimeId = cart.showtimeId;
    const movieTitle = meta.movieTitle || 'Chi tiết phim';

    // 2. Tạo đường dẫn (Back links)
    const movieUrl = movieId 
      ? `movie-detail.html?movie=${encodeURIComponent(movieId)}` 
      : 'movies.html';

    const showtimeUrl = movieId 
      ? `showtime.html?movie=${encodeURIComponent(movieId)}` 
      : 'showtime.html';

    const seatUrl = showtimeId
      ? `seat-map.html?showtimeId=${encodeURIComponent(showtimeId)}`
      : 'seat-map.html';

    // 3. Render HTML chuẩn Style Code 1
    // Cấu trúc: Trang chủ > Phim > Tên Phim > Lịch Chiếu > Chọn Ghế > Bắp Nước
    wrap.innerHTML = `
      <a href="index.html">Trang chủ</a>
      <span class="sep">/</span>
      <a href="movies.html">Phim</a>
      <span class="sep">/</span>
      <a href="${movieUrl}">${movieTitle}</a>
      <span class="sep">/</span>
      <a href="${showtimeUrl}">Lịch chiếu</a>
      <span class="sep">/</span>
      <a href="${seatUrl}">Chọn ghế</a>
      <span class="sep">/</span>
      <span class="curr">Bắp nước</span>
    `;
  }


  // ===== Categories =====

  function renderCatTabs() {
    const wrap = $('#catTabs');
    if (!wrap) return;

    const catsFromData = new Set(state.combos.map(c => c.category));
    const order = CAT_ORDER.filter(c => catsFromData.has(c));
    if (!order.length) order.push('combo');
    order.push('all');

    wrap.innerHTML = '';

    order.forEach(cat => {
      const cfg = CAT_CONFIG[cat] || { label: cat, icon: 'ic-menu' };
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'cat' + (cat === state.currentCat ? ' is-active' : '');
      btn.dataset.cat = cat;

      if (cfg.icon) {
        const span = document.createElement('span');
        span.className = 'cat-icon';
        const img = document.createElement('img');
        img.src = `${ICON_BASE}/${cfg.icon}.svg`;
        img.alt = '';
        span.appendChild(img);
        btn.appendChild(span);
      }

      const labelSpan = document.createElement('span');
      labelSpan.className = 'cat-label';
      labelSpan.textContent = cfg.label;
      btn.appendChild(labelSpan);

      wrap.appendChild(btn);
    });

    wrap.addEventListener('click', onCatClick);
  }

  function onCatClick(e) {
    const btn = e.target.closest('.cat');
    if (!btn) return;
    const cat = btn.dataset.cat;
    if (!cat || cat === state.currentCat) return;

    state.currentCat = cat;
    state.page = 1;

    $$('.cat', $('#catTabs')).forEach(el => {
      el.classList.toggle('is-active', el === btn);
    });

    renderProducts();
  }

  function getFilteredCombos() {
    if (state.currentCat === 'all') return state.combos;
    return state.combos.filter(c => c.category === state.currentCat);
  }

  // ===== Products grid =====

  function renderProducts() {
    const grid = $('#combosGrid');
    if (!grid) return;

    const list = getFilteredCombos();
    if (!list.length) {
      grid.innerHTML = '<p class="empty-hint">Chưa có món trong danh mục này.</p>';
      return;
    }

    const html = list.map(it => {
      const priceText = toVND(it.price);
      const oldText = it.oldPrice ? toVND(it.oldPrice) : '';
      const badge = it.tag
        ? `<span class="combo-badge" data-tag="${it.tag}">${it.tag}</span>`
        : '';

      const variants = (it.variants || []).map((v, idx) => {
        const pv = it.price + (v.priceDiff || 0);
        return `<button type="button" class="size-chip${idx === 0 ? ' is-active' : ''}" data-act="variant" data-variant="${v.value}" data-price="${pv}">${v.label}</button>`;
      }).join('');

      const variantsBlock = variants
        ? `<div class="combo-variants" data-role="variants">
             <span class="combo-label">Size</span>
             <div class="combo-sizes">${variants}</div>
           </div>`
        : '';

      return `
<article class="combo-card" data-id="${it.id}" data-cat="${it.category}" data-unit-price="${it.price}" data-qty="0">
  <div class="combo-media">
    <img src="${it.imageUrl}" alt="${it.title}">
    ${badge}
  </div>
  <div class="combo-body">
    <h3 class="combo-title">${it.title}</h3>
    <p class="combo-desc">${it.description || ''}</p>

    <div class="combo-price-row">
      <div class="combo-price-main">
        <span class="combo-price-current" data-role="price">${priceText}</span>
        ${oldText ? `<span class="combo-price-old">${oldText}</span>` : ''}
      </div>
      <span class="combo-unit">/ combo</span>
    </div>

    ${variantsBlock}

    <div class="combo-footer">
      <div class="qty-control">
        <button type="button" class="icon-btn" data-act="qty-minus" aria-label="Giảm">
          <img src="${ICON_BASE}/ic-minus.svg" alt="">
        </button>
        <span class="qty" data-role="qty">0</span>
        <button type="button" class="icon-btn" data-act="qty-plus" aria-label="Tăng">
          <img src="${ICON_BASE}/ic-plus.svg" alt="">
        </button>
      </div>

      <button type="button" class="combo-add-btn" data-act="add">
        <span class="btn-icon">
          <img src="${ICON_BASE}/ic-cart.svg" alt="">
        </span>
        <span>Thêm vào giỏ</span>
      </button>
    </div>
  </div>
</article>`;
    }).join('');

    grid.innerHTML = html;
  }

  function onGridClick(e) {
    const btn = e.target.closest('[data-act]');
    if (!btn) return;

    const card = btn.closest('.combo-card');
    if (!card) return;

    const id = Number(card.dataset.id);
    const combo = state.combos.find(c => c.id === id);
    if (!combo) return;

    const act = btn.dataset.act;

    if (act === 'qty-plus' || act === 'qty-minus') {
      const span = card.querySelector('[data-role="qty"]');
      let q = Number(card.dataset.qty || '0') || 0;
      q = act === 'qty-plus' ? q + 1 : q - 1;
      if (q < 0) q = 0;
      card.dataset.qty = String(q);
      if (span) span.textContent = q;
      return;
    }

    if (act === 'variant') {
      const price = Number(btn.dataset.price || combo.price);
      card.dataset.unitPrice = String(price);
      card.dataset.variant = btn.dataset.variant || '';

      const priceEl = card.querySelector('[data-role="price"]');
      if (priceEl) priceEl.textContent = toVND(price);

      card.querySelectorAll('[data-act="variant"]').forEach(el =>
        el.classList.toggle('is-active', el === btn)
      );
      return;
    }

    if (act === 'add') {
      addCardToCart(card, combo);
    }
  }

  // ===== Cart =====

  function addCardToCart(card, combo) {
    let qty = Number(card.dataset.qty || '0') || 0;
    if (!qty) qty = 1; // nếu chưa chỉnh qty thì mặc định 1

    // reset qty trên card
    card.dataset.qty = '0';
    const qtySpan = card.querySelector('[data-role="qty"]');
    if (qtySpan) qtySpan.textContent = '0';

    const unitPrice = Number(card.dataset.unitPrice || combo.price);
    const variant = card.dataset.variant ||
      ((combo.variants && combo.variants[0]) ? combo.variants[0].value : '');
    const variantLabel = variant
      ? (combo.variants || []).find(v => v.value === variant)?.label || variant
      : '';

    const key = `${combo.id}__${variant}`;
    let item = state.cart.find(it => it.key === key);

    if (!item) {
      item = {
        key,
        id: combo.id,
        code: combo.code,
        title: combo.title,
        imageUrl: combo.imageUrl,
        variant,
        variantLabel,
        unitPrice,
        qty: 0
      };
      state.cart.push(item);
    }

    item.qty += qty;
    if (item.qty <= 0) {
      state.cart = state.cart.filter(it => it !== item);
    }

    // Nếu BE còn bật -> sync lên BE, ngược lại FE tự render
    if (state.backend.enabled) {
      syncCartWithBackend();
    } else {
      renderCart();
      updateTotals();
    }
  }

  function renderCart() {
    const listEl = $('#cartList');
    if (!listEl) return;

    if (!state.cart.length) {
      listEl.innerHTML = '<p class="empty-hint">Chưa chọn món nào.</p>';
      return;
    }

    const html = state.cart.map(it => {
      const sum = typeof it.lineTotal === 'number'
        ? it.lineTotal
        : (it.unitPrice * it.qty);
      return `
<div class="cp-item" data-key="${it.key}">
  <div class="cp-item-main">
    <div class="cp-thumb">
      <img src="${it.imageUrl}" alt="${it.title}">
    </div>
    <div class="cp-info">
      <div class="cp-title-row">
        <span class="cp-title">${it.title}</span>
        ${it.variantLabel ? `<span class="cp-pill">${it.variantLabel}</span>` : ''}
      </div>
      <div class="cp-meta-row">
        ${it.code ? `<span class="cp-code">Mã: ${it.code}</span>` : ''}
      </div>
      <div class="cp-qty-row">
        <div class="qty-control small">
          <button type="button" class="icon-btn" data-act="cart-minus" aria-label="Giảm">
            <img src="${ICON_BASE}/ic-minus.svg" alt="">
          </button>
          <span class="qty">${it.qty}</span>
          <button type="button" class="icon-btn" data-act="cart-plus" aria-label="Tăng">
            <img src="${ICON_BASE}/ic-plus.svg" alt="">
          </button>
        </div>
        <span class="cp-line-price">${toVND(it.unitPrice)}</span>
      </div>
    </div>
  </div>
  <div class="cp-item-actions">
    <span class="cp-sum">${toVND(sum)}</span>
    <button type="button" class="icon-btn ghost" data-act="cart-remove" aria-label="Xoá">
      <img src="${ICON_BASE}/ic-trash.svg" alt="">
    </button>
  </div>
</div>`;
    }).join('');

    listEl.innerHTML = html;
  }

  function onCartClick(e) {
    const btn = e.target.closest('[data-act]');
    if (!btn) return;

    const row = btn.closest('.cp-item');
    if (!row) return;

    const key = row.dataset.key;
    const item = state.cart.find(it => it.key === key);
    if (!item) return;

    const act = btn.dataset.act;
    if (act === 'cart-remove') {
      state.cart = state.cart.filter(it => it !== item);
    } else if (act === 'cart-plus') {
      item.qty += 1;
    } else if (act === 'cart-minus') {
      item.qty -= 1;
      if (item.qty <= 0) {
        state.cart = state.cart.filter(it => it !== item);
      }
    } else {
      return;
    }

    if (state.backend.enabled) {
      syncCartWithBackend();
    } else {
      renderCart();
      updateTotals();
    }
  }

  function getTicketBaseAmount() {
    const t = state.ticket;
    if (!t) return 0;
    if (state.totals && typeof state.totals.ticketAmount === 'number') {
      return state.totals.ticketAmount;
    }
    if (typeof t.amount === 'number') return t.amount;
    if (typeof t.totalAmount === 'number') return t.totalAmount;
    return 0;
  }

  function updateTotals() {
    const grandEl = $('#grandTotal');
    if (!grandEl) return;

    // Nếu có totals từ BE -> ưu tiên hiển thị
    if (state.backend.enabled && state.totals && typeof state.totals.grandTotal === 'number') {
      grandEl.textContent = toVND(state.totals.grandTotal);
      return;
    }

    const ticketBase = getTicketBaseAmount();
    const combosTotal = state.cart.reduce((sum, it) => {
      const line = typeof it.lineTotal === 'number'
        ? it.lineTotal
        : (Number(it.unitPrice || 0) * Number(it.qty || 0));
      return sum + line;
    }, 0);

    grandEl.textContent = toVND(ticketBase + combosTotal);
  }

  // ===== Init =====

  async function init() {
    buildBreadcrumb();
      const btnBackSeat = document.getElementById('btnBackSeat');
  if (btnBackSeat) {
    btnBackSeat.addEventListener('click', (e) => {
      e.preventDefault();
      const cart = safeParseBooking();
      const stId = cart.showtimeId;
      const href = stId
        ? `seat-map.html?showtimeId=${encodeURIComponent(stId)}`
        : 'seat-map.html';
      location.href = href;
    });
  }

    // 1) Load ticket + cart từ BE (summary) trước, lỗi thì fallback localStorage
    await loadTicketAndCart();

    // 2) Load danh sách combos (menu) từ BE / JSON
    const rawCombos = await getJSON('/concessions', '../data/combos.json');
    state.combos = normalizeCombos(rawCombos);

    const grid = $('#combosGrid');
    if (!state.combos.length) {
      if (grid) {
        grid.innerHTML = '<p class="empty-hint">Không tải được danh sách món. Vui lòng thử lại.</p>';
      }
      return;
    }

    const cats = new Set(state.combos.map(c => c.category));
    state.currentCat = cats.has('combo') ? 'combo' : 'all';

    renderCatTabs();
    renderProducts();
    renderCart();
    updateTotals();

    if (grid) grid.addEventListener('click', onGridClick);
    const cartList = $('#cartList');
    if (cartList) cartList.addEventListener('click', onCartClick);

    const btnCheckout = $('#btnCheckout');
    if (btnCheckout) {
      btnCheckout.addEventListener('click', () => {
        // NOTE:
        // - Khi BE hoạt động: nên để BE xử lý confirm order.
        // - LocalStorage dưới đây chỉ dùng như Fallback để trang payment.html có thể đọc nếu cần.
        const ticketBase = getTicketBaseAmount();
        const combosTotal = state.cart.reduce((s, it) => {
          const line = typeof it.lineTotal === 'number'
            ? it.lineTotal
            : (Number(it.unitPrice || 0) * Number(it.qty || 0));
          return s + line;
        }, 0);

        const payload = {
          ticket: state.ticket,
          combos: state.cart,
          grandTotal: ticketBase + combosTotal
        };
        try {
          localStorage.setItem('concessions_cart', JSON.stringify(payload));
        } catch (e) {
          console.warn('[concessions] cannot save concessions_cart', e);
        }
        location.href = 'payment.html';
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
