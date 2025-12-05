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
      summaryPath: '/c/summary',
      cartPath: '/concessions/cart',
      lastError: null
    }
  };

  // ===== Helpers =====
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
  function readBookingCartFallback() {
    try {
      const raw = localStorage.getItem('booking_cart');
      if (!raw) return;

      const data = JSON.parse(raw);
      if (!data || typeof data !== 'object') return;

      const meta = data.meta || {};
      const ticketObj = data.ticket || {};
      
      // 1. LẤY TÊN RẠP
      const finalTheaterName = 
          data.theaterName || meta.theaterName || meta.theater || 
          ticketObj.theaterName || 'Rạp chưa xác định';

      // 2. LẤY GIỜ KẾT THÚC
      const finalEndTime = 
          data.end_at || data.endTime ||
          meta.end_at || meta.endTime || 
          ticketObj.end_at || ticketObj.endTime || ''; 

      // 3. LẤY GIỜ BẮT ĐẦU (Ưu tiên lấy từ meta.time do seatmap.js lưu)
      const finalTime = 
          data.showTime || meta.time || data.time || 
          ticketObj.showTime || ticketObj.time || '';

      const finalMovieTitle = data.movieTitle || meta.movieTitle || ticketObj.movieTitle || '';
      const finalDate = data.showDate || meta.date || data.date || '';

      // Xử lý ghế và giá tiền
      let rawItems = [];
      if (Array.isArray(data.items)) rawItems = data.items;
      else if (Array.isArray(data.selectedSeats)) {
          const p = Number(data.pricePerSeat || 45000);
          rawItems = data.selectedSeats.map(s => (typeof s === 'object' ? {code:s.seatCode, price:s.price||p} : {code:s, price:p}));
      }
      let finalAmount = Number(data.totalAmount || 0);
      if (!finalAmount && rawItems.length) finalAmount = rawItems.reduce((s, i) => s + (Number(i.price)||0), 0);

      // Cập nhật State
      state.ticket = {
        movieTitle: finalMovieTitle,
        theaterName: finalTheaterName,
        showDate: finalDate,
        
        // [FIX QUAN TRỌNG] Lưu vào cả 2 biến để render không bị lỗi
        time: finalTime,      
        showTime: finalTime,

        endTime: finalEndTime,
        items: rawItems,
        seats: rawItems.map(i => i.code || i.seatCode).filter(Boolean),
        totalAmount: finalAmount,
        meta: { ...meta, theaterName: finalTheaterName, endTime: finalEndTime, time: finalTime }
      };

    } catch (e) {
      console.warn('[concessions] readBookingCartFallback error', e);
    }
  }

  function restoreCartFromPreviousSession() {
    // Nếu Backend đang bật và đã load được cart thì không ghi đè
    if (state.backend.enabled && state.cart.length > 0) return;

    // 1. Lấy ID suất chiếu hiện tại (từ booking_cart)
    const currentBookingRaw = localStorage.getItem('booking_cart');
    let currentShowtimeId = null;
    if (currentBookingRaw) {
        try {
            const currentBooking = JSON.parse(currentBookingRaw);
            // Lấy ID từ showtimeId hoặc meta.showtimeId
            currentShowtimeId = String(currentBooking.showtimeId || (currentBooking.meta && currentBooking.meta.showtimeId) || '');
        } catch(e) {}
    }
    // Nếu không có ID hiện tại, không restore để tránh lỗi.
    if (!currentShowtimeId || currentShowtimeId === '') return; 

    try {
      const raw = localStorage.getItem('concessions_cart');
      if (!raw) return;
      const data = JSON.parse(raw);
      
      // 2. Kiểm tra ID suất chiếu của giỏ hàng đã lưu
      const savedShowtimeId = String(data.showtimeId || '');

      // Nếu ID suất chiếu KHÔNG TRÙNG -> GIỎ HÀNG CŨ -> XÓA VÀ THOÁT.
      if (savedShowtimeId !== currentShowtimeId) {
        console.warn(`[concessions] Stale cart detected. Clearing old combo cart.`);
        localStorage.removeItem('concessions_cart');
        return; 
      }
      
      // Nếu có dữ liệu combos đã lưu trước đó và ID trùng khớp (OK để restore)
      if (Array.isArray(data.combos) && data.combos.length > 0) {
        console.log('[concessions] Restoring cart from storage...');
        state.cart = data.combos;
        
        // Render lại giao diện
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
    return JSON.parse(localStorage.getItem('booking_cart') || '{}');
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
    restoreCartFromPreviousSession();

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
        // 1. Tính toán tổng tiền
        const ticketBase = getTicketBaseAmount();
        const combosTotal = state.cart.reduce((s, it) => {
          const line = typeof it.lineTotal === 'number'
            ? it.lineTotal
            : (Number(it.unitPrice || 0) * Number(it.qty || 0));
          return s + line;
        }, 0);

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

        // Nguồn 2: Fallback từ booking_cart cũ
        try {
            const rawBooking = localStorage.getItem('booking_cart');
            if (rawBooking) {
                const b = JSON.parse(rawBooking);
                if (!finalTheaterName) {
                    finalTheaterName = b.theaterName || b.cinemaName || b.tenRap || (b.cinema && b.cinema.name) || (b.meta && b.meta.theaterName);
                }
                if (!finalDate) finalDate = b.showDate || b.date || (b.meta && b.meta.date);
                if (!finalTime) finalTime = b.showTime || b.time || (b.meta && b.meta.time);
                
                // [MỚI 3] Fallback endTime (nếu trong booking_cart có lưu)
                if (!finalEndTime) finalEndTime = b.endTime || (b.meta && b.meta.endTime);
            }
        } catch (e) { console.warn("Lỗi đọc booking_cart fallback", e); }

        let finalShowtimeId = '';
        try {
            const rawBooking = localStorage.getItem('booking_cart');
            if (rawBooking) {
                const b = JSON.parse(rawBooking);
                finalShowtimeId = b.showtimeId || (b.meta && b.meta.showtimeId) || '';
            }
        } catch (e) { console.warn("Lỗi đọc showtimeId từ booking_cart", e); }

        // 3. Đóng gói payload gửi sang Payment
        const payload = {
          ticket: state.ticket || {}, 
          theaterName: finalTheaterName, 
          showDate: finalDate,
          showTime: finalTime,
          endTime: finalEndTime, 
          
          showtimeId: finalShowtimeId,
          
          combos: state.cart,
          grandTotal: ticketBase + combosTotal
        };

        // Cập nhật ngược lại vào ticket để chắc chắn (dự phòng)
        if (payload.ticket) {
            if (!payload.ticket.theaterName) payload.ticket.theaterName = finalTheaterName;
            if (!payload.ticket.showDate) payload.ticket.showDate = finalDate;
            if (!payload.ticket.showTime) payload.ticket.showTime = finalTime;
            if (!payload.ticket.endTime) payload.ticket.endTime = finalEndTime; // [MỚI 5]
        }

        try {
          // Lệnh này lưu concessions_cart, giờ đã có showtimeId
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