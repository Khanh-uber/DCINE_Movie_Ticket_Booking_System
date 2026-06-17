(() => {
  'use strict';

  const API_BASE = (window.API_BASE || '/api').replace(/\/+$/, '');
  const buildApiUrl = (path) => `${API_BASE}/${String(path || '').replace(/^\/+/, '')}`;
  const STORAGE = window.DCineStorage || {
    readJson(key) {
      try { return JSON.parse(sessionStorage.getItem(key) || localStorage.getItem(key) || 'null'); } catch { return null; }
    },
    writeJson() {},
    removeJson() {}
  };

  const state = {
    bookingId: null,
    order: null,
    promotions: [],
    promotionsLoaded: false,
    backendEnabled: true
  };

  const $ = (selector, root = document) => root.querySelector(selector);

  function toPositiveInteger(value) {
    if (typeof value === 'number' && Number.isInteger(value) && value > 0) {
      return value;
    }

    const text = String(value ?? '').trim();
    if (!/^\d+$/.test(text)) return null;

    const parsed = Number.parseInt(text, 10);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
  }

  function firstPositiveInteger(values) {
    for (const value of values) {
      const parsed = toPositiveInteger(value);
      if (parsed) return parsed;
    }
    return null;
  }

  function sumTicketItems(items) {
    if (!Array.isArray(items)) return 0;
    return items.reduce((sum, item) => sum + (Number(item?.price) || 0), 0);
  }

  function sumComboItems(items) {
    if (!Array.isArray(items)) return 0;
    return items.reduce((sum, item) => {
      if (!item) return sum;
      const quantity = Number(item.qty ?? item.quantity ?? 1) || 1;
      const unitPrice = Number(item.unitPrice ?? item.price ?? 0) || 0;
      const lineTotal = Number(item.lineTotal ?? item.totalPrice ?? item.total ?? 0) || 0;
      return sum + (lineTotal > 0 ? lineTotal : unitPrice * quantity);
    }, 0);
  }

  function readMergedCartSnapshot() {
    const booking = STORAGE.readJson('booking_cart') || {};
    const concessions = STORAGE.readJson('concessions_cart') || {};
    return {
      booking,
      concessions,
      bookingId: booking.bookingId || booking.id || booking.meta?.bookingId || booking.ticket?.bookingId || concessions.bookingId || concessions.id || concessions.meta?.bookingId || concessions.ticket?.bookingId || null
    };
  }

  function extractBookingIdFromSnapshot(snapshot) {
    const b = snapshot && snapshot.booking ? snapshot.booking : {};
    const c = snapshot && snapshot.concessions ? snapshot.concessions : {};
    return firstPositiveInteger([
      snapshot?.bookingId,
      b.bookingId,
      b.id,
      b.meta?.bookingId,
      b.ticket?.bookingId,
      c.bookingId,
      c.id,
      c.meta?.bookingId,
      c.ticket?.bookingId
    ]);
  }

  function extractBookingContext(snapshot) {
    const booking = snapshot.booking && typeof snapshot.booking === 'object' ? snapshot.booking : {};
    const concessions = snapshot.concessions && typeof snapshot.concessions === 'object' ? snapshot.concessions : {};
    const bookingTicket = booking.ticket && typeof booking.ticket === 'object' ? booking.ticket : {};
    const concessionTicket = concessions.ticket && typeof concessions.ticket === 'object' ? concessions.ticket : {};
    const bookingMeta = booking.meta && typeof booking.meta === 'object' ? booking.meta : {};
    const concessionMeta = concessions.meta && typeof concessions.meta === 'object' ? concessions.meta : {};
    const movieSource = booking.movie && typeof booking.movie === 'object'
      ? booking.movie
      : concessions.movie && typeof concessions.movie === 'object'
        ? concessions.movie
        : bookingTicket.movie && typeof bookingTicket.movie === 'object'
          ? bookingTicket.movie
          : concessionTicket.movie && typeof concessionTicket.movie === 'object'
            ? concessionTicket.movie
            : {};

    const movieTitle = normalizeText(
      bookingTicket.movieTitle || bookingTicket.movieName || bookingTicket.title ||
      booking.movieTitle || booking.movieName || booking.title ||
      bookingMeta.movieTitle || bookingMeta.movieName || bookingMeta.title ||
      concessions.movieTitle || concessions.movieName || concessions.title ||
      concessionTicket.movieTitle || concessionTicket.movieName || concessionTicket.title ||
      concessionMeta.movieTitle || concessionMeta.movieName || concessionMeta.title ||
      movieSource.movieTitle || movieSource.movieName || movieSource.title || movieSource.name ||
      'Phim chưa xác định'
    );

    const cinemaName = normalizeText(
      bookingTicket.cinemaName || bookingTicket.theaterName || bookingTicket.cinema || bookingTicket.theater ||
      booking.cinemaName || booking.theaterName || booking.cinema || booking.theater ||
      bookingMeta.cinemaName || bookingMeta.theaterName || bookingMeta.cinema || bookingMeta.theater ||
      concessions.cinemaName || concessions.theaterName || concessions.cinema || concessions.theater ||
      concessionTicket.cinemaName || concessionTicket.theaterName || concessionTicket.cinema || concessionTicket.theater ||
      concessionMeta.cinemaName || concessionMeta.theaterName || concessionMeta.cinema || concessionMeta.theater ||
      'D-cine Quận 1'
    );

    const showDate = normalizeText(
      bookingTicket.showDate || bookingTicket.date || bookingTicket.ngayChieu ||
      booking.showDate || booking.date || booking.ngayChieu ||
      bookingMeta.showDate || bookingMeta.date || bookingMeta.ngayChieu ||
      concessions.showDate || concessions.date || concessions.ngayChieu ||
      concessionTicket.showDate || concessionTicket.date || concessionTicket.ngayChieu ||
      concessionMeta.showDate || concessionMeta.date || concessionMeta.ngayChieu ||
      ''
    );

    const showTime = normalizeText(
      bookingTicket.showTime || bookingTicket.time || bookingTicket.gioChieu || bookingTicket.showtimeText ||
      booking.showTime || booking.time || booking.gioChieu || booking.showtimeText ||
      bookingMeta.showTime || bookingMeta.time || bookingMeta.gioChieu ||
      concessions.showTime || concessions.time || concessions.showtimeText ||
      concessionTicket.showTime || concessionTicket.time || concessionTicket.gioChieu || concessionTicket.showtimeText ||
      concessionMeta.showTime || concessionMeta.time || concessionMeta.gioChieu ||
      ''
    );

    const endTime = normalizeText(
      bookingTicket.endTime || bookingTicket.end_at ||
      booking.endTime || booking.end_at ||
      bookingMeta.endTime || bookingMeta.end_at ||
      concessions.endTime || concessions.end_at ||
      concessionTicket.endTime || concessionTicket.end_at ||
      concessionMeta.endTime || concessionMeta.end_at ||
      ''
    );

    const seatItems = Array.isArray(bookingTicket.items)
      ? bookingTicket.items
      : Array.isArray(booking.items)
        ? booking.items
        : Array.isArray(concessionTicket.items)
          ? concessionTicket.items
          : [];

    return {
      booking,
      concessions,
      ticket: bookingTicket,
      concessionTicket,
      movieTitle,
      cinemaName,
      showDate,
      showTime,
      endTime,
      seatItems
    };
  }

  function toVND(value) {
    return `${Math.round(Number(value) || 0).toLocaleString('vi-VN')}đ`;
  }

  function normalizeText(value) {
    return String(value ?? '').replace(/\s+/g, ' ').trim();
  }

  function normalizeSeatCodes(input) {
    const seats = [];
    const pushSeat = (value) => {
      if (!value) return;
      if (typeof value === 'string') {
        seats.push(value);
        return;
      }
      if (typeof value === 'object') {
        seats.push(value.code || value.seatCode || value.label || value.id || '');
      }
    };

    if (Array.isArray(input)) {
      input.forEach(pushSeat);
    } else if (input && typeof input === 'object') {
      if (Array.isArray(input.seats)) input.seats.forEach(pushSeat);
      if (Array.isArray(input.items)) input.items.forEach(pushSeat);
      if (Array.isArray(input.selectedSeats)) input.selectedSeats.forEach(pushSeat);
    } else {
      pushSeat(input);
    }

    return seats.map(normalizeText).filter(Boolean);
  }

  function clearNode(node) {
    if (!node) return;
    node.innerHTML = '';
  }

  function buildSeatLabel(ticket) {
    const seats = [];
    if (ticket && Array.isArray(ticket.items)) {
      seats.push(...ticket.items.map((item) => item && (item.code || item.seatCode || item.label)).filter(Boolean));
    }
    if (!seats.length && ticket && Array.isArray(ticket.seats)) {
      seats.push(...ticket.seats.filter(Boolean));
    }
    if (!seats.length && ticket && ticket.ticket && Array.isArray(ticket.ticket.items)) {
      seats.push(...ticket.ticket.items.map((item) => item && (item.code || item.seatCode || item.label)).filter(Boolean));
    }
    if (!seats.length) {
      const snapshot = readMergedCartSnapshot();
      seats.push(...normalizeSeatCodes(snapshot.booking.selectedSeats || snapshot.booking.items || snapshot.concessions.ticket?.items || []));
    }
    return seats.sort((a, b) => a.localeCompare(b, 'en', { numeric: true })).join(', ');
  }

  function getTitleFontSize(title) {
    const length = normalizeText(title).length;
    if (!length) return '2rem';
    if (length <= 18) return '2.25rem';
    if (length <= 24) return '2rem';
    if (length <= 32) return '1.75rem';
    if (length <= 42) return '1.55rem';
    return '1.35rem';
  }

  function buildLocalOrderFromSnapshot() {
    const snapshot = readMergedCartSnapshot();
    const booking = snapshot.booking || {};
    const concessions = snapshot.concessions || {};
    const context = extractBookingContext(snapshot);

    const ticket = booking.ticket && typeof booking.ticket === 'object' ? { ...booking.ticket } : {};
    const ticketItems = Array.isArray(ticket.items) ? ticket.items : (Array.isArray(context.seatItems) ? context.seatItems : []);

    if (!ticket.items && ticketItems.length) ticket.items = ticketItems;

    const movieTitle = context.movieTitle;
    const cinemaName = context.cinemaName;
    const showDate = context.showDate;
    const showTime = context.showTime;
    const endTime = context.endTime;
    const seatsText = buildSeatLabel(ticket || booking);

    const combos = Array.isArray(concessions.combos)
      ? concessions.combos
      : Array.isArray(concessions.items)
        ? concessions.items
        : Array.isArray(booking.combos)
          ? booking.combos
          : Array.isArray(booking.itemsCombos)
            ? booking.itemsCombos
            : [];

    const ticketAmount = Number(
      booking.ticketAmount ?? ticket.totalAmount ?? ticket.totalPrice ?? ticket.price ?? booking.ticket?.totalAmount ?? 0
    ) || (Array.isArray(ticket.items)
      ? ticket.items.reduce((sum, item) => sum + (Number(item.price) || 0), 0)
      : 0);

    const combosAmount = sumComboItems(combos);

    const discountAmount = Number(
      concessions.discountAmount ?? concessions.totals?.discountAmount ?? booking.discountAmount ?? booking.totals?.discountAmount ?? 0
    ) || 0;
    const discountCode = normalizeText(
      concessions.discountCode || concessions.totals?.discountCode || concessions._voucher?.code || booking.discountCode || booking.totals?.discountCode || ''
    );
    const subTotal = ticketAmount + combosAmount;
    const grandTotal = Math.max(0, subTotal - discountAmount);

    return {
      bookingId: extractBookingIdFromSnapshot(snapshot),
      ticket: {
        movieTitle,
        cinemaName,
        showDate,
        showTime,
        endTime,
        seatsText,
        items: ticketItems,
        seats: seatsText ? seatsText.split(', ').filter(Boolean) : []
      },
      combos,
      totals: {
        ticketAmount,
        combosAmount,
        discountAmount,
        discountCode,
        subTotal,
        grandTotal
      }
    };
  }

  function parseBackendOrder(raw) {
    if (!raw || typeof raw !== 'object') return null;
    const ticket = raw.ticket && typeof raw.ticket === 'object' ? raw.ticket : null;
    const totals = raw.totals && typeof raw.totals === 'object' ? raw.totals : null;
    const combos = Array.isArray(raw.combos) ? raw.combos : (Array.isArray(raw.items) ? raw.items : []);
    if (!ticket && !totals) return null;
    return {
      bookingId: raw.bookingId || null,
      ticket: ticket || {},
      combos,
      totals: totals || {},
      discount: raw.discount && typeof raw.discount === 'object' ? raw.discount : null,
      grandTotal: Number(raw.grandTotal ?? totals?.grandTotal ?? totals?.grand ?? 0) || 0
    };
  }

  function computeTotals(order) {
    const totals = order && order.totals ? order.totals : {};
    const ticketItems = Array.isArray(order?.ticket?.items) ? order.ticket.items : [];
    const comboItems = Array.isArray(order?.combos) ? order.combos : (Array.isArray(order?.items) ? order.items : []);
    const ticketAmount = Number(
      totals.ticketAmount ?? order?.ticket?.totalAmount ?? order?.ticket?.totalPrice ?? order?.ticket?.price ?? sumTicketItems(ticketItems)
    ) || sumTicketItems(ticketItems);
    const combosAmount = sumComboItems(comboItems) || (Number(totals.combosAmount ?? 0) || 0);
    const discountAmount = Number(totals.discountAmount ?? order?.discount?.amount ?? 0) || 0;
    const discountCode = normalizeText(totals.discountCode || order?.discount?.code || '');
    const subTotal = ticketAmount + combosAmount;
    const grandTotal = Math.max(0, subTotal - discountAmount);

    return { ticketAmount, combosAmount, discountAmount, discountCode, subTotal, grandTotal };
  }

  function setBanner(kind, title, message) {
    const banner = $('#checkoutStateBanner');
    const bannerTitle = $('#checkoutStateTitle');
    const bannerDesc = $('#checkoutStateDesc');
    if (!banner || !bannerTitle || !bannerDesc) return;

    if (!title && !message) {
      banner.hidden = true;
      banner.className = 'checkout-state-banner';
      return;
    }

    banner.hidden = false;
    banner.className = `checkout-state-banner ${kind || ''}`.trim();
    bannerTitle.textContent = title || '';
    bannerDesc.textContent = message || '';
  }

  function updateMovieTitle(title) {
    const el = $('#paymentMovieTitle');
    if (!el) return;
    const clean = normalizeText(title) || 'Phim chưa xác định';
    el.textContent = clean;
    el.style.fontSize = getTitleFontSize(clean);
  }

  function createOverviewItem(label, value) {
    const item = document.createElement('div');
    item.className = 'payment-overview-item';

    const labelEl = document.createElement('span');
    labelEl.textContent = label;

    const valueEl = document.createElement('strong');
    valueEl.textContent = value || '--';

    item.append(labelEl, valueEl);
    return item;
  }

  function renderCheckoutOverview() {
    const snapshot = readMergedCartSnapshot();
    const localOrder = buildLocalOrderFromSnapshot();
    const currentOrder = state.order || localOrder;
    const ticket = currentOrder.ticket || localOrder.ticket || {};
    const context = extractBookingContext(snapshot);

    const movieTitle = normalizeText(ticket.movieTitle || currentOrder.movieTitle || localOrder.ticket?.movieTitle || context.movieTitle);
    const cinemaName = normalizeText(ticket.cinemaName || ticket.theaterName || currentOrder.cinemaName || localOrder.ticket?.cinemaName || context.cinemaName);
    const showtimeText = normalizeText(
      [ticket.showDate || currentOrder.showDate || localOrder.ticket?.showDate || context.showDate, ticket.showTime || currentOrder.showTime || localOrder.ticket?.showTime || context.showTime]
        .filter(Boolean)
        .join(' • ')
    );

    updateMovieTitle(movieTitle);

    const overview = $('#bookingOverview');
    if (!overview) return;

    clearNode(overview);
    const items = [
      createOverviewItem('Cinema Screen', cinemaName || 'D-cine Quận 1'),
      createOverviewItem('Showtime', showtimeText || '--'),
      createOverviewItem('Selected Seats', ticket.seatsText || 'Chưa có ghế'),
      createOverviewItem('Booking ID', currentOrder.bookingId ? `#${currentOrder.bookingId}` : (snapshot.booking.bookingId ? `#${snapshot.booking.bookingId}` : '--'))
    ];

    overview.append(...items);

    const label = $('#paymentMethodLabel');
    const note = $('#paymentMethodNote');
    if (label) label.textContent = 'Thanh toán qua cổng VNPAY Sandbox';
    if (note) {
      note.textContent = 'Hệ thống sẽ tạo một liên kết thanh toán an toàn và chuyển thẳng sang VNPAY để hoàn tất giao dịch.';
    }
  }

  function createSummaryItem(label, value, options = {}) {
    const row = document.createElement('div');
    row.className = options.grand ? 'summary-item summary-grand' : 'summary-item';

    const labelEl = document.createElement('span');
    labelEl.textContent = label;

    const valueEl = document.createElement('strong');
    valueEl.textContent = value;

    row.append(labelEl, valueEl);
    return row;
  }

  function renderOrderSummary() {
    const rows = $('#summaryRows');
    const grandEl = $('#sumGrandTotal');
    const warning = $('#orderWarning');

    if (!rows || !grandEl) return;

    clearNode(rows);

    const order = state.order || buildLocalOrderFromSnapshot();
    const totals = computeTotals(order);
    const ticket = order.ticket || {};
    const combos = Array.isArray(order.combos) ? order.combos : [];

    const comboRows = combos
      .filter(Boolean)
      .map((combo) => {
        const title = normalizeText(combo.title || combo.name || 'Combo');
        const qty = Number(combo.qty ?? combo.quantity ?? 1) || 1;
        const lineTotal = Number(combo.lineTotal ?? combo.totalPrice ?? combo.total ?? 0) || 0;
        const unitPrice = Number(combo.unitPrice ?? combo.price ?? 0) || 0;
        const amount = lineTotal > 0 ? lineTotal : unitPrice * qty;
        return createSummaryItem(
          qty > 1 ? `${title} × ${qty}` : title,
          toVND(amount)
        );
      });

    rows.append(
      createSummaryItem('Tickets subtotal', toVND(totals.ticketAmount)),
      ...comboRows,
      createSummaryItem(
        totals.discountAmount > 0
          ? `Voucher discount${totals.discountCode ? ` (${totals.discountCode})` : ''}`
          : 'Voucher discount',
        totals.discountAmount > 0 ? `-${toVND(totals.discountAmount)}` : '-0đ'
      )
    );

    grandEl.textContent = toVND(totals.grandTotal);
    if (warning) {
      warning.hidden = !state.order;
      warning.textContent = state.order ? '' : 'Không tìm thấy đơn hàng. Vui lòng quay lại chọn combo/ghế.';
    }

    setBanner(
      'ok',
      'Phiên giữ ghế đang hợp lệ',
      ticket.seatsText
        ? `Ghế: ${ticket.seatsText}. Tổng thanh toán: ${toVND(totals.grandTotal)}.`
        : `Tổng thanh toán: ${toVND(totals.grandTotal)}.`
    );
  }

  async function ensurePromotionsLoaded() {
    if (state.promotionsLoaded) return state.promotions;
    try {
      const res = await fetch(buildApiUrl('promotions'), { cache: 'no-store', credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        state.promotions = Array.isArray(data) ? data : (Array.isArray(data?.items) ? data.items : []);
      }
    } catch (error) {
      console.warn('[payment] promotions load failed', error);
      state.promotions = [];
    }
    state.promotionsLoaded = true;
    return state.promotions;
  }

  async function applyVoucher(code) {
    const inputMessage = $('#voucherMessage');
    const cleanCode = normalizeText(code).toUpperCase();
    if (inputMessage) {
      inputMessage.textContent = '';
      inputMessage.classList.remove('ok', 'err');
    }

    if (!state.order) return;

    try {
      const res = await fetch(buildApiUrl('checkout/apply-voucher'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ code: cleanCode, order: state.order })
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const data = await res.json();
      const parsed = parseBackendOrder(data);
      if (parsed) {
        parsed.bookingId = state.bookingId || parsed.bookingId;
        state.order = parsed;
      } else {
        const localOrder = buildLocalOrderFromSnapshot();
        localOrder.totals.discountCode = cleanCode;
        state.order = localOrder;
      }

      renderCheckoutOverview();
      renderOrderSummary();
      if (inputMessage) {
        inputMessage.textContent = cleanCode ? `Đã áp dụng mã ${cleanCode}.` : 'Đã xóa mã ưu đãi.';
        inputMessage.classList.add('ok');
      }
      return;
    } catch (error) {
      console.warn('[payment] apply voucher failed', error);
    }

    const promotions = await ensurePromotionsLoaded();
    const orderTotals = computeTotals(state.order);
    const promo = promotions.find((item) => normalizeText(item?.code).toUpperCase() === cleanCode);

    if (!cleanCode) {
      state.order.totals.discountAmount = 0;
      state.order.totals.discountCode = '';
      renderOrderSummary();
      return;
    }

    if (!promo) {
      if (inputMessage) {
        inputMessage.textContent = 'Mã không hợp lệ hoặc đã hết hạn.';
        inputMessage.classList.add('err');
      }
      state.order.totals.discountAmount = 0;
      state.order.totals.discountCode = '';
      renderOrderSummary();
      return;
    }

    const discountAmount = promo.discountType === 'percent'
      ? Math.min(orderTotals.subTotal, Math.round((orderTotals.subTotal * Number(promo.discountValue || promo.value || 0)) / 100))
      : Math.min(orderTotals.subTotal, Number(promo.discountValue || promo.value || 0));

    state.order.totals.discountAmount = discountAmount;
    state.order.totals.discountCode = promo.code;
    renderCheckoutOverview();
    renderOrderSummary();

    if (inputMessage) {
      inputMessage.textContent = `Đã áp dụng mã ${promo.code}.`;
      inputMessage.classList.add('ok');
    }
  }

  async function loadOrder() {
    const localOrder = buildLocalOrderFromSnapshot();
    state.order = localOrder;

    try {
      const res = await fetch(buildApiUrl('checkout/summary'), { cache: 'no-store', credentials: 'include' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const data = await res.json();
      const parsed = parseBackendOrder(data);
      if (parsed) {
        parsed.bookingId = parsed.bookingId;
        state.order = {
          ...localOrder,
          ...parsed,
          ticket: { ...localOrder.ticket, ...(parsed.ticket || {}) },
          combos: Array.isArray(parsed.combos) && parsed.combos.length ? parsed.combos : localOrder.combos,
          totals: { ...localOrder.totals, ...(parsed.totals || {}) }
        };
      }
    } catch (error) {
      console.warn('[payment] backend summary unavailable, using snapshot', error);
      state.backendEnabled = false;
    }

    state.order.bookingId = state.bookingId || state.order.bookingId;

    const totals = computeTotals(state.order);
    state.order.totals = { ...state.order.totals, ...totals };
    state.order.grandTotal = totals.grandTotal;
  }

  function getActiveBookingId() {
    const snapshot = readMergedCartSnapshot();
    const booking = snapshot.booking && typeof snapshot.booking === 'object' ? snapshot.booking : {};
    const concessions = snapshot.concessions && typeof snapshot.concessions === 'object' ? snapshot.concessions : {};

    return firstPositiveInteger([
      state.order?.bookingId,
      state.bookingId,
      booking.bookingId,
      booking.id,
      booking.meta?.bookingId,
      booking.ticket?.bookingId,
      concessions.bookingId,
      concessions.id,
      concessions.meta?.bookingId,
      concessions.ticket?.bookingId
    ]);
  }

  function showError(message) {
    const warning = $('#orderWarning');
    if (warning) {
      warning.hidden = false;
      warning.textContent = message;
    }
    setBanner('error', 'Checkout không hợp lệ', message);
    alert(message);
  }

  async function handleConfirmPayment() {
    const bookingId = getActiveBookingId();
    if (!bookingId) {
      showError('Không tìm thấy bookingId hợp lệ để tạo link thanh toán.');
      return;
    }

    const totals = computeTotals(state.order || buildLocalOrderFromSnapshot());
    if (!totals.grandTotal || totals.grandTotal <= 0) {
      showError('Tổng thanh toán không hợp lệ. Vui lòng kiểm tra lại phiên đặt vé.');
      return;
    }

    const button = $('#btnConfirmPayment');
    const originalLabel = button ? button.innerHTML : '';
    if (button) {
      button.disabled = true;
      button.innerHTML = '<span>ĐANG TẠO LIÊN KẾT VNPAY...</span>';
    }

    try {
      const res = await fetch(buildApiUrl(`payment/create-url/${bookingId}`), {
        method: 'POST',
        credentials: 'include'
      });

      const raw = await res.text();
      let data = {};
      try {
        data = raw ? JSON.parse(raw) : {};
      } catch (error) {
        console.warn('[payment] create-url response parse failed', error);
      }

      if (!res.ok) {
        throw new Error(data?.error || data?.message || `Không thể tạo link VNPAY (HTTP ${res.status}).`);
      }

      const redirectUrl = data.url || data.paymentUrl || data.redirectUrl;
      if (!redirectUrl) {
        throw new Error('Backend không trả về đường dẫn VNPAY hợp lệ.');
      }

      window.location.href = redirectUrl;
    } catch (error) {
      console.error('[payment] VNPAY redirect failed', error);
      showError(error?.message || 'Không thể chuyển đến cổng thanh toán VNPAY.');
      if (button) {
        button.disabled = false;
        button.innerHTML = originalLabel || '<span>THANH TOÁN QUA CỔNG VNPAY</span>';
      }
    }
  }

  function bindVoucherControls() {
    const applyBtn = $('#btnApplyVoucher');
    const voucherInput = $('#voucherCode');
    const voucherSelect = $('#voucherSelect');

    if (applyBtn && voucherInput) {
      applyBtn.addEventListener('click', () => applyVoucher(voucherInput.value));
    }

    if (voucherSelect) {
      ensurePromotionsLoaded().then((promotions) => {
        const options = ['<option value="">Chọn từ danh sách</option>']
          .concat(promotions.filter((promo) => promo && promo.code).map((promo) => `<option value="${promo.code}">${promo.code} — ${promo.name || promo.title || ''}</option>`));
        voucherSelect.innerHTML = options.join('');
      });

      voucherSelect.addEventListener('change', (event) => {
        if (voucherInput) voucherInput.value = event.target.value || '';
        applyVoucher(event.target.value || '');
      });
    }
  }

  function bindNavigationControls() {
    const backButton = $('#btnBackConcessions');
    if (backButton) {
      backButton.addEventListener('click', () => {
        const canUseHistoryBack =
          document.referrer &&
          /\/concessions\.html(?:\?|$)/i.test(document.referrer) &&
          window.history.length > 1;
        if (canUseHistoryBack) {
          window.history.back();
          return;
        }
        window.location.href = 'concessions.html';
      });
    }
  }

  async function init() {
    const initialSnapshots = readMergedCartSnapshot();
    console.log('[Debug Booking ID]', initialSnapshots);
    const b = initialSnapshots.booking || {};
    state.bookingId = firstPositiveInteger([
      b.bookingId,
      b.id,
      b.meta?.bookingId,
      b.ticket?.bookingId,
      initialSnapshots.bookingId,
      initialSnapshots.concessions?.bookingId,
      initialSnapshots.concessions?.id,
      initialSnapshots.concessions?.meta?.bookingId,
      initialSnapshots.concessions?.ticket?.bookingId
    ]) || extractBookingIdFromSnapshot(initialSnapshots);

    await loadOrder();
    renderCheckoutOverview();
    renderOrderSummary();
    bindVoucherControls();
    bindNavigationControls();

    const confirmButton = $('#btnConfirmPayment');
    if (confirmButton) {
      confirmButton.addEventListener('click', handleConfirmPayment);
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
    init();
  }
})();
