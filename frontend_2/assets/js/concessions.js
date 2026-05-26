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
  const CART_STORAGE_KEY = 'booking_cart';
  const CONCESSIONS_STORAGE_KEY = 'concessions_cart';
  const CART_SESSION_KEY = 'concessions_cart';
  const STORAGE = window.DCineStorage;

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

  async function getJSON(apiPath, localPath) {
    if (apiPath) {
      try {
        const res = await fetch(API + apiPath, {
          cache: 'no-store',
          credentials: 'include'
        });
        if (res.ok) return await res.json();
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

  function readBookingCartFallback() {
    try {
      const data = STORAGE.readJson('booking_cart');
      if (!data || typeof data !== 'object') return;

      const meta = data.meta || {};
      const ticketObj = data.ticket || {};
      const bookingId = data.bookingId || meta.bookingId || ticketObj.bookingId || null;

      const finalTheaterName = 
          data.theaterName || meta.theaterName || meta.theater || 
          ticketObj.theaterName || 'Rạp chưa xác định';
      const finalEndTime = 
          data.end_at || data.endTime ||
          meta.end_at || meta.endTime || 
          ticketObj.end_at || ticketObj.endTime || ''; 
      const finalTime = 
          data.showTime || meta.time || data.time || 
          ticketObj.showTime || ticketObj.time || '';

      const finalMovieTitle = data.movieTitle || meta.movieTitle || ticketObj.movieTitle || '';
      const finalDate = data.showDate || meta.date || data.date || '';
      let rawItems = [];
      if (Array.isArray(data.items)) rawItems = data.items;
      else if (Array.isArray(data.selectedSeats)) {
          const p = Number(data.pricePerSeat || 45000);
          rawItems = data.selectedSeats.map(s => (typeof s === 'object' ? {code:s.seatCode, price:s.price||p} : {code:s, price:p}));
      }
      let finalAmount = Number(data.totalAmount || 0);
      if (!finalAmount && rawItems.length) finalAmount = rawItems.reduce((s, i) => s + (Number(i.price)||0), 0);

      state.ticket = {
        bookingId,
        movieTitle: finalMovieTitle,
        theaterName: finalTheaterName,
        showDate: finalDate,
        
        time: finalTime,      
        showTime: finalTime,

        endTime: finalEndTime,
        items: rawItems,
        seats: rawItems.map(i => i.code || i.seatCode).filter(Boolean),
        totalAmount: finalAmount,
        meta: { ...meta, bookingId, theaterName: finalTheaterName, endTime: finalEndTime, time: finalTime }
      };

    } catch (e) {
      console.warn('[concessions] readBookingCartFallback error', e);
    }
  }

  function readStoredCartSnapshot() {
    return STORAGE.readJson(CART_SESSION_KEY) || STORAGE.readJson(CART_STORAGE_KEY);
  }

  function persistCartSnapshot(payload) {
    if (!payload || typeof payload !== 'object') return;
    const currentBooking = STORAGE.readJson('booking_cart') || {};
    const bookingId = payload.bookingId || payload.ticket?.bookingId || payload.ticket?.meta?.bookingId || currentBooking.bookingId || currentBooking.meta?.bookingId || currentBooking.ticket?.bookingId || null;
    const showtimeId = payload.showtimeId || currentBooking.showtimeId || currentBooking.meta?.showtimeId || '';

    const mergedTicket = {
      ...(currentBooking.ticket || {}),
      ...(payload.ticket || {}),
      bookingId,
      meta: {
        ...((currentBooking.ticket && currentBooking.ticket.meta) || {}),
        ...((payload.ticket && payload.ticket.meta) || {}),
        bookingId,
        showtimeId
      }
    };

    const mergedBooking = {
      ...currentBooking,
      bookingId,
      showtimeId,
      ticket: mergedTicket,
      totals: {
        ...(currentBooking.totals || {}),
        ...(payload.totals || {})
      }
    };

    if (!Array.isArray(mergedBooking.items) || mergedBooking.items.length === 0) {
      const ticketItems = Array.isArray(mergedTicket.items) ? mergedTicket.items : [];
      if (ticketItems.length) mergedBooking.items = ticketItems;
    }

    if ((!Array.isArray(mergedBooking.selectedSeats) || mergedBooking.selectedSeats.length === 0) && Array.isArray(mergedBooking.items)) {
      mergedBooking.selectedSeats = mergedBooking.items
        .map((it) => (typeof it === 'string' ? it : (it && (it.code || it.seatCode || it.label || it.id))))
        .filter(Boolean);
    }

    if (Array.isArray(payload.combos)) {
      mergedBooking.combos = payload.combos;
    }

    if (payload.grandTotal != null) {
      mergedBooking.grandTotal = payload.grandTotal;
    }

    STORAGE.writeJson(CART_STORAGE_KEY, mergedBooking);
    STORAGE.writeJson(CONCESSIONS_STORAGE_KEY, {
      bookingId,
      showtimeId,
      ticket: mergedTicket,
      combos: Array.isArray(payload.combos) ? payload.combos : (Array.isArray(mergedBooking.combos) ? mergedBooking.combos : []),
      totals: {
        ...(mergedBooking.totals || {}),
        ...(payload.totals || {})
      },
      grandTotal: payload.grandTotal != null
        ? payload.grandTotal
        : (mergedBooking.totals && mergedBooking.totals.grandTotal)
    });
  }

  function clearCartSnapshot() {
    STORAGE.removeJson(CART_STORAGE_KEY);
  }

  function restoreCartFromPreviousSession() {
    if (state.backend.enabled && state.cart.length > 0) return;

    const currentBooking = STORAGE.readJson('booking_cart');
    const currentShowtimeId = String(currentBooking?.showtimeId || (currentBooking?.meta && currentBooking.meta.showtimeId) || '');
    if (!currentShowtimeId || currentShowtimeId === '') return; 

    try {
      const snapshot = readStoredCartSnapshot();
      if (!snapshot) return;

      const raw = JSON.stringify(snapshot);
      if (!raw) return;
      const data = snapshot;
      const savedShowtimeId = String(data.showtimeId || '');
      if (savedShowtimeId !== currentShowtimeId) {
        console.warn(`[concessions] Stale cart detected. Clearing old combo cart.`);
        clearCartSnapshot();
        return; 
      }
      if (Array.isArray(data.combos) && data.combos.length > 0) {
        console.log('[concessions] Restoring cart from storage...');
        state.cart = data.combos;
        renderCart();
        updateTotals();
      }
    } catch (err) {
      console.warn('[concessions] Error restoring cart:', err);
    }
  }

  function applyBackendSummary(data) {
    if (!data || typeof data !== 'object') return;

    if (data.ticket && typeof data.ticket === 'object') {
      state.ticket = {
        ...data.ticket,
        bookingId: data.bookingId || data.ticket.bookingId || data.ticket.meta?.bookingId || state.ticket?.bookingId || null,
        meta: {
          ...(data.ticket.meta || {}),
          bookingId: data.bookingId || data.ticket.bookingId || data.ticket.meta?.bookingId || state.ticket?.bookingId || null
        }
      };
    }

    if (Array.isArray(data.combos) && state.cart.length === 0) {
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
        const res = await fetch(API + state.backend.summaryPath, {cache: 'no-store', credentials: 'include'});
        if (res.ok) {
          const data = await res.json();
          applyBackendSummary(data);

          if (!state.ticket || !state.ticket.movieTitle) {
             console.log('[concessions] BE summary empty, fallback to localStorage');
             readBookingCartFallback();
          }
          
          renderTicketSummary();
          renderCart();
          updateTotals();
          persistCartSnapshot({
            ticket: state.ticket || {},
            combos: state.cart,
            totals: state.totals,
            bookingId: state.ticket?.bookingId || state.ticket?.meta?.bookingId || null,
            showtimeId: (state.ticket && state.ticket.meta && state.ticket.meta.showtimeId) || (state.ticket && state.ticket.showtimeId) || ''
          });
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
    persistCartSnapshot({
      ticket: state.ticket || {},
      combos: state.cart,
      totals: state.totals,
      bookingId: state.ticket?.bookingId || state.ticket?.meta?.bookingId || null,
      showtimeId: (state.ticket && state.ticket.meta && state.ticket.meta.showtimeId) || (state.ticket && state.ticket.showtimeId) || ''
    });
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
        body: JSON.stringify(payload),
        credentials: 'include'
      });
      if (!res.ok) {
        throw new Error('HTTP ' + res.status);
      }
      const data = await res.json();
      applyBackendSummary(data);
      renderTicketSummary();
      renderCart();
      updateTotals();
      persistCartSnapshot({
        ticket: state.ticket || {},
        combos: state.cart,
        totals: state.totals,
        bookingId: state.ticket?.bookingId || state.ticket?.meta?.bookingId || null,
        showtimeId: (state.ticket && state.ticket.meta && state.ticket.meta.showtimeId) || (state.ticket && state.ticket.showtimeId) || ''
      });
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
        metaEl.textContent = 'Chưa chọn vé.';
        ticketFeeEl.textContent = '0₫';
        return;
      }

      const movieTitle = t.movieTitle || '';
      const theaterName = t.theaterName || '';
      const date = t.showDate || '';
      
      // [FIX] Lấy startTime ưu tiên t.time, nếu không có thì lấy t.showTime
      const startTime = t.time || t.showTime || ''; 
      const endTime = t.endTime || '';
      const fmtTime = (s) => (s && s.length > 5) ? s.substring(0, 5) : s;

      // Format giờ: 08:00 ~ 10:00
      let timeDisplay = fmtTime(startTime);
      if (startTime && endTime) {
          timeDisplay = `${fmtTime(startTime)} ~ ${fmtTime(endTime)}`;
      }

      // Xử lý hiển thị ghế (có sắp xếp)
      let seatsText = '';
      if (t.seats && t.seats.length > 0) {
          const sortedSeats = [...t.seats].sort((a, b) => 
              a.localeCompare(b, 'en', { numeric: true })
          );
          seatsText = 'Ghế: ' + sortedSeats.join(', ');
      }

      const parts = [];
      if (movieTitle) parts.push(`<strong style="font-size: 1.1em;">${movieTitle}</strong>`);
      if (theaterName) parts.push(`<div>${theaterName}</div>`);
      if (date || timeDisplay) parts.push(`<div style="font-size: 0.9em; opacity: 0.8;">${date} • ${timeDisplay}</div>`);
      if (seatsText) parts.push(`<div style="margin-top:4px;">${seatsText}</div>`);

      metaEl.innerHTML = parts.join('');

      const amount = t.totalAmount || t.amount || 0;
      ticketFeeEl.textContent = toVND(amount);
  }

function safeParseBooking() {
  try {
    return STORAGE.readJson('booking_cart') || {};
  } catch {
    return {};
  }
}

function buildBreadcrumb() {
  const wrap = document.getElementById('bc');
  if (!wrap) return;

  const cart      = safeParseBooking();
  const movieId   = cart.meta && cart.meta.movieId;
  const showtimeId = cart.showtimeId;

  const showtimeHref = movieId
    ? `showtime.html?movie=${encodeURIComponent(movieId)}`
    : 'showtime.html';

  const seatHref = showtimeId
    ? `seat-map.html?showtimeId=${encodeURIComponent(showtimeId)}`
    : 'seat-map.html';

  wrap.innerHTML = `
    <nav class="breadcrumb" aria-label="Breadcrumb">
      <ol>
        <li><a href="index.html">Trang chủ</a></li>
        <li><a href="${showtimeHref}">Chọn suất chiếu</a></li>
        <li><a href="${seatHref}">Chọn ghế</a></li>
        <li><span class="current">Chọn bắp nước</span></li>
      </ol>
    </nav>
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
      persistCartSnapshot({
        ticket: state.ticket || {},
        combos: state.cart,
        totals: state.totals,
        bookingId: state.ticket?.bookingId || state.ticket?.meta?.bookingId || null,
        showtimeId: (state.ticket && state.ticket.meta && state.ticket.meta.showtimeId) || (state.ticket && state.ticket.showtimeId) || ''
      });
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
      persistCartSnapshot({
        ticket: state.ticket || {},
        combos: state.cart,
        totals: state.totals,
        showtimeId: (state.ticket && state.ticket.meta && state.ticket.meta.showtimeId) || (state.ticket && state.ticket.showtimeId) || ''
      });
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

  function computeTotals() {
    const ticketAmount = getTicketBaseAmount();
    const combosAmount = state.cart.reduce((sum, it) => {
      const line = typeof it.lineTotal === 'number'
        ? it.lineTotal
        : (Number(it.unitPrice || 0) * Number(it.qty || 0));
      return sum + line;
    }, 0);

    const grandTotal = state.backend.enabled && state.totals && typeof state.totals.grandTotal === 'number'
      ? Number(state.totals.grandTotal)
      : ticketAmount + combosAmount;

    return {
      ticketAmount,
      combosAmount,
      grandTotal
    };
  }

  function updateTotals() {
    const grandEl = $('#grandTotal');
    if (!grandEl) return;

    const totals = computeTotals();
    if (!state.backend.enabled || !state.totals || typeof state.totals.grandTotal !== 'number') {
      state.totals = {
        ticketAmount: totals.ticketAmount,
        combosAmount: totals.combosAmount,
        grandTotal: totals.grandTotal
      };
    }

    grandEl.textContent = toVND(totals.grandTotal);
  }

  // ===== Init =====

  async function init() {
    buildBreadcrumb();
    const btnBackSeat = document.getElementById('btnBackSeat');
    if (btnBackSeat) {
      btnBackSeat.addEventListener('click', (e) => {
        e.preventDefault();
        const canUseHistoryBack =
          document.referrer &&
          /\/seat-map\.html(?:\?|$)/i.test(document.referrer) &&
          window.history.length > 1;

        if (canUseHistoryBack) {
          window.history.back();
          return;
        }

        const cart = safeParseBooking();
        const stId = cart.showtimeId;
        const href = stId
          ? `seat-map.html?showtimeId=${encodeURIComponent(stId)}`
          : 'seat-map.html';
        location.href = href;
      });
    }

    // 1) Khôi phục cart local trước để không bị BE summary ghi đè state mới nhất
    restoreCartFromPreviousSession();
    if (!state.ticket) {
      readBookingCartFallback();
    }

    // 2) Load ticket + cart từ BE (summary) sau, nhưng không ghi đè cart local đã có
    await loadTicketAndCart();

    // 3) Load danh sách combos (menu) từ BE / JSON
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
        // 1. Tính toán tổng tiền
        const totals = computeTotals();

        // 2. --- CHIẾN THUẬT VÉT CẠN DỮ LIỆU ---
        let finalTheaterName = '';
        let finalDate = '';
        let finalTime = '';
        let finalEndTime = ''; // <--- [MỚI 1] Thêm biến giờ kết thúc

        // Nguồn 1: Lấy từ state hiện tại
        if (state.ticket) {
            finalTheaterName = state.ticket.theaterName || state.ticket.cinemaName || (state.ticket.meta && state.ticket.meta.theaterName);
            finalDate = state.ticket.showDate || state.ticket.date || (state.ticket.meta && state.ticket.meta.date);
            finalTime = state.ticket.showTime || state.ticket.time || (state.ticket.meta && state.ticket.meta.time);
            
            // [MỚI 2] Lấy endTime từ state
            finalEndTime = state.ticket.endTime || (state.ticket.meta && state.ticket.meta.endTime) || '';
        }

        try {
          const booking = safeParseBooking();
          if (booking && Object.keys(booking).length > 0) {
            if (!finalTheaterName) {
              finalTheaterName = booking.theaterName || booking.cinemaName || booking.tenRap || (booking.cinema && booking.cinema.name) || (booking.meta && booking.meta.theaterName);
            }
            if (!finalDate) finalDate = booking.showDate || booking.date || (booking.meta && booking.meta.date);
            if (!finalTime) finalTime = booking.showTime || booking.time || (booking.meta && booking.meta.time);
                
            if (!finalEndTime) finalEndTime = booking.endTime || (booking.meta && booking.meta.endTime);
          }
        } catch (e) { console.warn("Lỗi đọc booking_cart fallback", e); }

        let finalShowtimeId = '';
        try {
          const booking = safeParseBooking();
          finalShowtimeId = booking.showtimeId || (booking.meta && booking.meta.showtimeId) || '';
        } catch (e) { console.warn("Lỗi đọc showtimeId từ booking_cart", e); }

        let persistedBookingId = null;
        try {
          const booking = safeParseBooking();
          const rawBookingId = booking.bookingId || (booking.meta && booking.meta.bookingId) || (booking.ticket && booking.ticket.bookingId) || null;
          const bookingIdText = String(rawBookingId ?? '').trim();
          const numericBookingId = Number.parseInt(bookingIdText, 10);
          persistedBookingId = Number.isFinite(numericBookingId) && numericBookingId > 0
            ? numericBookingId
            : (bookingIdText || null);
        } catch (e) { console.warn('Lỗi đọc bookingId từ booking_cart', e); }

        const payload = {
          ticket: state.ticket || {}, 
          theaterName: finalTheaterName, 
          showDate: finalDate,
          showTime: finalTime,
          endTime: finalEndTime, 
          
          showtimeId: finalShowtimeId,
          bookingId: persistedBookingId || state.ticket?.bookingId || state.ticket?.meta?.bookingId || null,
          
          combos: state.cart,
          grandTotal: totals.grandTotal
        };
        if (payload.ticket) {
            if (!payload.ticket.theaterName) payload.ticket.theaterName = finalTheaterName;
            if (!payload.ticket.showDate) payload.ticket.showDate = finalDate;
            if (!payload.ticket.showTime) payload.ticket.showTime = finalTime;
            if (!payload.ticket.endTime) payload.ticket.endTime = finalEndTime; // [MỚI 5]
            if (payload.bookingId) {
              payload.ticket.bookingId = payload.bookingId;
              payload.ticket.meta = {
                ...(payload.ticket.meta || {}),
                bookingId: payload.bookingId
              };
            }
        }

        if (payload.bookingId) {
          payload.meta = {
            ...(payload.meta || {}),
            bookingId: payload.bookingId
          };
        }

        persistCartSnapshot(payload);
        location.href = 'payment.html';
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', async () => {
        if (window.guardAuth) {
             const isSafe = await window.guardAuth();
             if (!isSafe) return;
        }
        init();
    });
  } else {
    // Nếu file load trễ, cũng phải check
    if (window.guardAuth) window.guardAuth().then(ok => { if(ok) init(); });
    else init();
  }
})();