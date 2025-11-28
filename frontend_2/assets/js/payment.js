(() => {
  'use strict';

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const API = window.API_BASE || '/api';

  const toVND = (n) =>
    (Math.round(Number(n) || 0)).toLocaleString('vi-VN') + 'đ';

  const state = {
    order: null,
    backend: {
      enabled: true,
      lastError: null
    },
    paymentMethod: 'card',
    promotions: {
      loaded: false,
      list: []
    },
    pendingPayment: null,      
    qr: {
      method: null,
      imageUrl: null
    }
  };
  // ---------- Helpers ----------

  async function getJSON(apiPath, localPath) {
    // API trước
    if (state.backend.enabled && apiPath) {
      try {
        const res = await fetch(API + apiPath, { cache: 'no-store' });
        if (res.ok) {
          return await res.json();
        }
      } catch (err) {
        console.warn('[payment] API error', apiPath, err);
        state.backend.enabled = false;
        state.backend.lastError = String(err);
      }
    }
    // Fallback file local
    if (!localPath) return null;
    try {
      const res = await fetch(localPath, { cache: 'no-store' });
      if (res.ok) return await res.json();
    } catch (err) {
      console.warn('[payment] local JSON error', localPath, err);
    }
    return null;
  }

  // Parse đơn hàng từ BE / localStorage
  function parseOrder(raw) {
    if (!raw || typeof raw !== 'object') return null;

    const ticket =
      raw.ticket && typeof raw.ticket === 'object' ? raw.ticket : null;

    let combos = [];
    if (Array.isArray(raw.combos)) combos = raw.combos;
    else if (Array.isArray(raw.items)) combos = raw.items;

    const totals =
      raw.totals && typeof raw.totals === 'object' ? raw.totals : null;

    let grandTotal = null;
    if (totals && typeof totals.grandTotal === 'number') {
      grandTotal = totals.grandTotal;
    } else if (typeof raw.grandTotal === 'number') {
      grandTotal = raw.grandTotal;
    }

    const discount = raw.discount && typeof raw.discount === 'object'
      ? raw.discount
      : null;

    if (!ticket) return null;

    return { ticket, combos, totals, grandTotal, discount };
  }

  function readLocalFallback() {
    try {
      const raw = localStorage.getItem('concessions_cart');
      if (!raw) return;

      const data = JSON.parse(raw);
      if (!data || typeof data !== 'object') return;

      state.order = {
        ticket: data.ticket || {},
        combos: data.combos || [],
        totals: { grandTotal: data.grandTotal || 0 },
        grandTotal: data.grandTotal || 0
      };
    } catch (err) {
      console.warn('[payment] cannot parse concessions_cart', err);
    }
  }

  async function loadOrder() {
    // BE trước: /checkout/summary
    if (state.backend.enabled) {
      try {
        const res = await fetch(API + '/checkout/summary', {
          cache: 'no-store'
        });
        if (res.ok) {
          const data = await res.json();
          const order = parseOrder(data);
          if (order) {
            state.order = order;
            return;
          }
        } else {
          state.backend.enabled = false;
          state.backend.lastError = 'HTTP ' + res.status;
        }
      } catch (err) {
        console.warn('[payment] /checkout/summary error', err);
        state.backend.enabled = false;
        state.backend.lastError = String(err);
      }
    }

    // Fallback localStorage
    if (!state.order) {
      readLocalFallback();
    }

    // Nếu vẫn không có gì → quay về trang chủ
    if (!state.order) {
      location.href = 'index.html';
    }
  }

  // ---------- Tính tổng (ưu tiên số BE trả) ----------

  function computeTicketAmount(order) {
    if (!order || !order.ticket) return 0;
    const t = order.ticket;
    if (order.totals && typeof order.totals.ticketAmount === 'number') {
      return order.totals.ticketAmount;
    }
    if (typeof t.amount === 'number') return t.amount;
    if (typeof t.totalAmount === 'number') return t.totalAmount;
    return 0;
  }

  function computeCombosAmount(order, ticketAmount) {
    if (!order) return 0;

    if (order.totals && typeof order.totals.combosAmount === 'number') {
      return order.totals.combosAmount;
    }

    const combosTotal = (order.combos || []).reduce((sum, it) => {
      if (!it) return sum;
      const unit = typeof it.unitPrice === 'number'
        ? it.unitPrice
        : typeof it.price === 'number'
        ? it.price
        : 0;
      const qty = typeof it.qty === 'number'
        ? it.qty
        : typeof it.quantity === 'number'
        ? it.quantity
        : 0;
      if (typeof it.lineTotal === 'number') return sum + it.lineTotal;
      return sum + unit * qty;
    }, 0);

    if (combosTotal === 0 && typeof order.grandTotal === 'number' && ticketAmount > 0) {
      const diff = order.grandTotal - ticketAmount;
      return diff > 0 ? diff : combosTotal;
    }
    return combosTotal;
  }

  function getTotals(order) {
    let ticketAmount = 0;
    let combosAmount = 0;
    let subTotal = 0;
    let vat = 0;
    let discountAmount = 0;
    let discountCode = '';
    let grand;

    const t = order.totals;

    if (t) {
      ticketAmount =
        typeof t.ticketAmount === 'number'
          ? t.ticketAmount
          : computeTicketAmount(order);
      combosAmount =
        typeof t.combosAmount === 'number'
          ? t.combosAmount
          : computeCombosAmount(order, ticketAmount);
      subTotal =
        typeof t.subTotal === 'number'
          ? t.subTotal
          : ticketAmount + combosAmount;
      vat =
        typeof t.vat === 'number' ? t.vat : Math.round(subTotal * 0.1);

      discountAmount =
        typeof t.discountAmount === 'number' ? t.discountAmount : 0;

      discountCode =
        t.discountCode ||
        t.code ||
        (order.discount && order.discount.code) ||
        (order._voucher && order._voucher.code) ||
        '';

      const beGrand =
        typeof t.grandTotal === 'number'
          ? t.grandTotal
          : typeof order.grandTotal === 'number'
          ? order.grandTotal
          : null;

      if (beGrand != null) {
        grand = beGrand;
      } else {
        grand = Math.max(0, subTotal + vat - discountAmount);
      }
    } else {
      ticketAmount = computeTicketAmount(order);
      combosAmount = computeCombosAmount(order, ticketAmount);
      subTotal = ticketAmount + combosAmount;
      vat = Math.round(subTotal * 0.1);

      if (order.discount && typeof order.discount.amount === 'number') {
        discountAmount = order.discount.amount;
        discountCode = order.discount.code || '';
      } else if (
        order._voucher &&
        typeof order._voucher.amount === 'number'
      ) {
        discountAmount = order._voucher.amount;
        discountCode = order._voucher.code || '';
      }

      grand = Math.max(0, subTotal + vat - discountAmount);
    }

    return {
      ticketAmount,
      combosAmount,
      subTotal,
      vat,
      discountAmount,
      discountCode,
      grand
    };
  }

  function extractTicketMeta(ticket) {
    if (!ticket) {
      return {
        movieTitle: '',
        showtimeText: '',
        seatsText: ''
      };
    }

    const meta =
      ticket.meta && typeof ticket.meta === 'object' ? ticket.meta : {};

    const movieTitle =
      meta.movieTitle ||
      ticket.movieTitle ||
      ticket.title ||
      '';

    const date =
      meta.date ||
      ticket.date ||
      ticket.showDate ||
      '';

    const time =
      meta.time ||
      ticket.time ||
      ticket.showTime ||
      '';

    let seatsArr = [];
    if (Array.isArray(ticket.items)) {
      seatsArr = ticket.items
        .map((it) => it && (it.code || it.seatCode || it.label))
        .filter(Boolean);
    }
    if (!seatsArr.length && Array.isArray(ticket.seats)) {
      seatsArr = ticket.seats.filter(Boolean);
    }

    return {
      movieTitle,
      showtimeText: [time, date].filter(Boolean).join(' • '),
      seatsText: seatsArr.length ? seatsArr.join(', ') : ''
    };
  }

  // ---------- Render Order Summary ----------

  function renderOrderSummary() {
    const itemsWrap = $('#summaryItems');
    const subTotalEl = $('#sumSubTotal');
    const vatEl = $('#sumVat');
    const discountRow = $('#discountRow');
    const discountCodeEl = $('#sumDiscountCode');
    const discountAmountEl = $('#sumDiscountAmount');
    const grandEl = $('#sumGrandTotal');
    const warnEl = $('#orderWarning');
    const confirmBtn = $('#btnConfirmPayment');

    if (!state.order) {
      if (itemsWrap) {
        itemsWrap.innerHTML =
          '<div class="summary-item"><span>Không tìm thấy đơn hàng</span><span>0đ</span></div>';
      }
      if (subTotalEl) subTotalEl.textContent = '0đ';
      if (vatEl) vatEl.textContent = '0đ';
      if (grandEl) grandEl.textContent = '0đ';
      if (discountRow) discountRow.hidden = true;
      if (warnEl) warnEl.hidden = false;
      if (confirmBtn) confirmBtn.disabled = true;
      return;
    }

    if (confirmBtn) confirmBtn.disabled = false;
    if (warnEl) warnEl.hidden = true;

    const totals = getTotals(state.order);
    state.order._computedTotals = totals;

    // Render line items: vé + combos
    if (itemsWrap) {
      const { ticket, combos } = state.order;
      const meta = extractTicketMeta(ticket);

      const lines = [];

      if (meta.movieTitle) {
        lines.push(`
          <div class="summary-item">
            <strong>${meta.movieTitle}</strong>
            <span></span>
          </div>
        `);
      }

      const seatInfoParts = [];
      if (meta.showtimeText) seatInfoParts.push(meta.showtimeText);
      if (meta.seatsText) seatInfoParts.push(`Ghế: ${meta.seatsText}`);
      if (seatInfoParts.length) {
        lines.push(`
          <div class="summary-item">
            <span>${seatInfoParts.join(' • ')}</span>
            <span>${toVND(totals.ticketAmount)}</span>
          </div>
        `);
      }

      (combos || []).forEach((it) => {
        if (!it) return;

        const rawTitle = it.title || it.name || '';
        const qty =
          typeof it.qty === 'number'
            ? it.qty
            : typeof it.quantity === 'number'
            ? it.quantity
            : 0;

        const unit =
          typeof it.unitPrice === 'number'
            ? it.unitPrice
            : typeof it.price === 'number'
            ? it.price
            : 0;

        const line =
          typeof it.lineTotal === 'number' ? it.lineTotal : unit * qty;

        const backendLabel =
          it.label || it.displayName || it.comboName || '';
        const fallbackId =
          it.code || it.id || it.comboId || '';

        const baseTitle =
          rawTitle ||
          backendLabel ||
          (fallbackId ? `Combo ${fallbackId}` : 'Combo');

        const label = qty ? `${baseTitle} (x${qty})` : baseTitle;

        lines.push(`
          <div class="summary-item">
            <span>${label}</span>
            <span>${toVND(line)}</span>
          </div>
        `);
      });

      itemsWrap.innerHTML = lines.join('') || `
        <div class="summary-item">
          <span>Chưa có dữ liệu</span><span>0đ</span>
        </div>
      `;
    }

    if (subTotalEl) subTotalEl.textContent = toVND(totals.subTotal);
    if (vatEl) vatEl.textContent = toVND(totals.vat);

    if (discountRow && discountCodeEl && discountAmountEl) {
      if (totals.discountAmount > 0 && totals.discountCode) {
        discountRow.hidden = false;
        discountCodeEl.textContent = `(${totals.discountCode})`;
        discountAmountEl.textContent = '-' + toVND(totals.discountAmount);
      } else if (totals.discountAmount > 0) {
        discountRow.hidden = false;
        discountCodeEl.textContent = '';
        discountAmountEl.textContent = '-' + toVND(totals.discountAmount);
      } else {
        discountRow.hidden = true;
      }
    }

    if (grandEl) grandEl.textContent = toVND(totals.grand);
  }

  // ---------- Tabs & card mock ----------

  function setPaymentMethod(method) {
    state.paymentMethod = method;

    const tabs = $$('#paymentTabs .tab-btn');
    tabs.forEach((btn) => {
      const m = btn.dataset.method;
      btn.classList.toggle('active', m === method);
    });

    ['card', 'wallet', 'bank'].forEach((m) => {
      const pane = $(`#paymentPane-${m}`);
      if (!pane) return;
      pane.hidden = m !== method;
    });

    // Ẩn/hiện card mock chỉ khi chọn thẻ
    const cardVisual = $('#cardVisual');
    if (cardVisual) {
      cardVisual.style.display = method === 'card' ? '' : 'none';
    }
  }

  function initTabs() {
    const tabs = $$('#paymentTabs .tab-btn');
    tabs.forEach((btn) => {
      btn.addEventListener('click', () => {
        const method = btn.dataset.method || 'card';
        setPaymentMethod(method);
      });
    });
    setPaymentMethod('card');
  }

  function updateCardMock() {
    const num = $('#cardNumber')?.value || '';
    const name = $('#cardName')?.value || '';
    const exp = $('#cardExpiry')?.value || '';

    const numEl = $('#displayCardNumber');
    const nameEl = $('#displayCardName');
    const expEl = $('#displayCardExpiry');

    if (numEl) numEl.textContent = num || '#### #### #### ####';
    if (nameEl) nameEl.textContent = name || 'YOUR NAME';
    if (expEl) expEl.textContent = exp || 'MM/YY';
  }

  function formatCardNumberInput(e) {
    let v = e.target.value.replace(/[^\d]/g, '');
    v = v.replace(/(.{4})/g, '$1 ').trim();
    e.target.value = v;
  }

  function formatExpiryInput(e) {
    let v = e.target.value.replace(/[^\d]/g, '');
    if (v.length >= 3) {
      v = v.slice(0, 4);
      v = v.slice(0, 2) + '/' + v.slice(2);
    }
    e.target.value = v;
  }

  function initCardForm() {
    const numEl = $('#cardNumber');
    const nameEl = $('#cardName');
    const expEl = $('#cardExpiry');

    if (numEl) {
      numEl.addEventListener('input', (e) => {
        formatCardNumberInput(e);
        updateCardMock();
      });
    }
    if (nameEl) {
      nameEl.addEventListener('input', updateCardMock);
    }
    if (expEl) {
      expEl.addEventListener('input', (e) => {
        formatExpiryInput(e);
        updateCardMock();
      });
    }

    const clearBtn = $('#btnClearCard');
    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        const form = $('#cardForm');
        if (form) form.reset();
        updateCardMock();
      });
    }

    const saveBtn = $('#btnSaveCard');
    if (saveBtn) {
      saveBtn.addEventListener('click', () => {
        // Optional: lưu card vào localStorage / gửi BE nếu cần
        alert('Thông tin thẻ đã được lưu (mock).');
      });
    }
  }

  // ---------- Promotions (voucher) ----------

  async function ensurePromotionsLoaded() {
    if (state.promotions.loaded) return state.promotions.list;
    const data = await getJSON('/promotions', '../data/promotions.json');
    let list = [];
    if (Array.isArray(data)) list = data;
    else if (data && Array.isArray(data.items)) list = data.items;
    state.promotions.list = list;
    state.promotions.loaded = true;
    return list;
  }

  function fillVoucherSelect(list) {
    const select = $('#voucherSelect');
    if (!select) return;
    const options = [
      '<option value="">Chọn từ danh sách</option>',
      ...list
        .filter((p) => p && p.code)
        .map(
          (p) =>
            `<option value="${p.code}">${p.code} — ${p.name || p.title || ''}</option>`
        )
    ];
    select.innerHTML = options.join('');
  }

  function isPromoValidForOrder(promo, totals) {
    if (!promo || !promo.code) return false;
    if (promo.isActive === false) return false;

    // Kiểm tra minOrder
    if (
      typeof promo.minOrder === 'number' &&
      totals.subTotal < promo.minOrder
    ) {
      return false;
    }

    // Kiểm tra ngày
    const now = new Date();

    if (promo.validFrom) {
      const from = new Date(promo.validFrom);
      if (now < from) return false;
    }
    if (promo.validTo) {
      const to = new Date(promo.validTo);
      if (now > to) return false;
    }

    return true;
  }

  function calcDiscountFromPromo(promo, totals) {
    if (!promo) return 0;
    const type = promo.discountType || promo.type;
    const value = Number(promo.discountValue || promo.value || 0);
    if (!value) return 0;

    const base = totals.subTotal + totals.vat; // giảm trên tổng tạm tính + VAT
    if (type === 'percent') {
      return Math.min(base, Math.round((base * value) / 100));
    }
    // flat
    return Math.min(base, value);
  }

  async function applyVoucher(code) {
    const msgEl = $('#voucherMessage');
    if (msgEl) {
      msgEl.textContent = '';
      msgEl.classList.remove('ok', 'err');
    }

    if (!state.order) return;

    const trimmed = (code || '').trim().toUpperCase();
    if (!trimmed) {
      if (msgEl) {
        msgEl.textContent = 'Vui lòng nhập mã.';
        msgEl.classList.add('err');
      }
      return;
    }

    // BE trước: /checkout/apply-voucher
    if (state.backend.enabled) {
      try {
        const res = await fetch(API + '/checkout/apply-voucher', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            code: trimmed,
            order: state.order
          })
        });
        if (res.ok) {
          const data = await res.json();
          const order = parseOrder(data);
          if (order) {
            // Chèn discountCode/discountAmount nếu BE trả ở root
            if (typeof data.discountAmount === 'number') {
              order.discount = {
                code: data.discountCode || trimmed,
                amount: data.discountAmount
              };
            }
            state.order = order;
            renderOrderSummary();
            if (msgEl) {
              const totals = state.order._computedTotals || getTotals(state.order);
              msgEl.textContent =
                totals.discountAmount > 0
                  ? `Đã áp dụng mã ${trimmed}.`
                  : `Áp dụng mã ${trimmed} thành công.`;
              msgEl.classList.add('ok');
            }
            return;
          }
        } else {
          console.warn(
            '[payment] /checkout/apply-voucher not ok',
            res.status
          );
          state.backend.enabled = false;
          state.backend.lastError = 'HTTP ' + res.status;
        }
      } catch (err) {
        console.warn('[payment] /checkout/apply-voucher error', err);
        state.backend.enabled = false;
        state.backend.lastError = String(err);
      }
    }

    // Fallback: tự check promotions.json
    const list = await ensurePromotionsLoaded();
    const totals =
      state.order._computedTotals || getTotals(state.order);
    const promo = list.find(
      (p) => p && String(p.code || '').toUpperCase() === trimmed
    );

    if (!promo || !isPromoValidForOrder(promo, totals)) {
      if (msgEl) {
        msgEl.textContent =
          '⚠️ Mã không hợp lệ hoặc đã hết hạn.';
        msgEl.classList.add('err');
      }
      // clear discount
      state.order._voucher = { code: '', amount: 0 };
      renderOrderSummary();
      return;
    }

    const discount = calcDiscountFromPromo(promo, totals);
    state.order._voucher = {
      code: promo.code,
      amount: discount,
      type: promo.discountType || promo.type || 'flat'
    };

    renderOrderSummary();
    if (msgEl) {
      msgEl.textContent = `Đã áp dụng mã ${promo.code}.`;
      msgEl.classList.add('ok');
    }
  }

  function initVoucher() {
    // load danh sách cho select
    ensurePromotionsLoaded().then(fillVoucherSelect).catch(() => {});

    const applyBtn = $('#btnApplyVoucher');
    if (applyBtn) {
      applyBtn.addEventListener('click', () => {
        const input = $('#voucherCode');
        applyVoucher(input ? input.value : '');
      });
    }

    const select = $('#voucherSelect');
    if (select) {
      select.addEventListener('change', () => {
        if (select.value) {
          const input = $('#voucherCode');
          if (input) input.value = select.value;
          applyVoucher(select.value);
        }
      });
    }
  }

  // ---------- Confirm payment ----------

  function validatePayment() {
    if (!state.order) return false;
    const method = state.paymentMethod;

    if (method === 'card') {
      const num = $('#cardNumber')?.value.replace(/\s+/g, '') || '';
      const name = $('#cardName')?.value.trim() || '';
      const exp = $('#cardExpiry')?.value.trim() || '';
      const cvv = $('#cardCvv')?.value.trim() || '';

      if (num.length < 12 || name.length < 3 || !exp || cvv.length < 3) {
        alert('Vui lòng nhập đầy đủ thông tin thẻ.');
        return false;
      }
    }

    return true;
  }

  function buildOrderPayment(method, status) {
    const totals = state.order._computedTotals || getTotals(state.order);
    const ticket = state.order.ticket || {};
    const combos = (state.order.combos || []).map((it) => ({
      id: it.id || it.comboId || it.code || '',
      qty:
        typeof it.qty === 'number'
          ? it.qty
          : typeof it.quantity === 'number'
          ? it.quantity
          : 0
    }));

    const now = new Date();
    const idBase = now.toISOString().slice(0, 10).replace(/-/g, '');
    const rand = Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, '0');

    return {
      orderId: 'DCINE' + idBase + '-' + rand,
      movieId: ticket.movieId || ticket.movieCode || null,
      theaterId: ticket.theaterId || ticket.cinemaId || null,
      showtimeId: ticket.showtimeId || null,
      seats: ticket.seats || [],
      combos,
      paymentMethod:
        method === 'card'
          ? 'credit-card'
          : method === 'wallet'
          ? 'wallet'
          : 'bank-transfer',
      discountCode:
        (totals && totals.discountCode) || null,
      discountAmount:
        (totals && totals.discountAmount) || 0,
      total: totals ? totals.grand : 0,
      status,
      createdAt: now.toISOString()
    };
  }

  function persistAndGoConfirmation(orderPayment) {
    try {
      localStorage.setItem(
        'orderConfirmed',
        JSON.stringify(orderPayment)
      );

      const allRaw = localStorage.getItem('orders');
      const all = allRaw ? JSON.parse(allRaw) : [];
      all.push(orderPayment);
      localStorage.setItem('orders', JSON.stringify(all));
    } catch (err) {
      console.warn('[payment] cannot persist orderConfirmed', err);
    }

    location.href = 'confirmation.html';
  }


  function showInlineQr(method, qrPayload) {
    const isWallet = method === 'wallet';

    const box = isWallet ? $('#walletQrBox') : $('#bankQrBox');
    const img = isWallet ? $('#walletQrImage') : $('#bankQrImage');
    const download = isWallet
      ? $('#walletQrDownload')
      : $('#bankQrDownload');

    if (!box || !img || !download) return;

    const imageUrl =
      (qrPayload &&
        (qrPayload.imageUrl ||
          qrPayload.url ||
          qrPayload.qrUrl ||
          qrPayload.qrImageUrl)) ||
      (isWallet
        ? '../assets/img/qr-demo-wallet.png'
        : '../assets/img/qr-demo-bank.png');

    img.src = imageUrl;
    img.alt = isWallet
      ? 'Mã QR ví điện tử D-cine'
      : 'Mã QR chuyển khoản D-cine';

    download.href =
      (qrPayload &&
        (qrPayload.downloadUrl ||
          qrPayload.imageUrl ||
          qrPayload.url)) ||
      imageUrl;

    box.hidden = false;

    state.qr.method = method;
    state.qr.imageUrl = imageUrl;
  }

  // Cho trang web demo QR / back-end gọi lại khi đã thanh toán xong
  // Ví dụ: trong trang mở từ QR, khi user bấm "Thanh toán thành công"
  // gọi: window.opener?.DCINE_MARK_PAYMENT_PAID(paymentObject)
  window.DCINE_MARK_PAYMENT_PAID = function (payload) {
    let payment = null;

    if (payload && payload.orderId) {
      // BE gửi về full payment object
      payment = payload;
    } else if (payload && payload.payment && payload.payment.orderId) {
      payment = payload.payment;
    } else if (state.pendingPayment) {
      payment = Object.assign({}, state.pendingPayment, {
        status: 'paid'
      });
    } else if (state.order) {
      payment = buildOrderPayment(state.paymentMethod, 'paid');
    }

    if (!payment) return;
    persistAndGoConfirmation(payment);
  };

  async function handleConfirmPayment() {
    if (!state.order) {
      alert('Không tìm thấy đơn hàng.');
      return;
    }
    if (!validatePayment()) return;

    const method = state.paymentMethod;

    let backendData = null;
    if (state.backend.enabled) {
      try {
        const res = await fetch(API + '/checkout/confirm', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            paymentMethod: state.paymentMethod,
            order: {
                ticket: state.order.ticket,
                combos: state.order.combos || [],
                grandTotal: state.order.grandTotal
            }
          })
        });
        if (res.ok) {
          backendData = await res.json();
        } else {
          console.warn(
            '[payment] /checkout/confirm not ok',
            res.status
          );
        }
      } catch (err) {
        console.warn('[payment] /checkout/confirm error', err);
        state.backend.enabled = false;
        state.backend.lastError = String(err);
      }
    }

    if (method === 'card') {
      let payment = null;

      if (backendData) {
        if (backendData.payment && backendData.payment.orderId) {
          payment = backendData.payment;
        } else if (backendData.orderId) {
          payment = backendData;
        }
      }

      if (!payment) {
        payment = buildOrderPayment(method, 'paid');
      }

      persistAndGoConfirmation(payment);
      return;
    }

    let qrPayload = null;
    let pendingPayment = null;

    if (backendData) {
      const fromBe =
        backendData.order && typeof backendData.order === 'object'
          ? parseOrder(backendData.order)
          : parseOrder(backendData);

      if (fromBe) {
        state.order = fromBe;
        renderOrderSummary();
      }

      if (backendData.payment && backendData.payment.status) {
        pendingPayment = backendData.payment;
      }

      // Lấy thông tin QR
      if (backendData.qr) {
        qrPayload = backendData.qr;
      }
      else if (backendData.qrUrl || backendData.qrImageUrl) {
          qrPayload = { imageUrl: backendData.qrUrl || backendData.qrImageUrl };
      }

      const beStatus =
        backendData.status ||
        (backendData.payment && backendData.payment.status);
      if (beStatus === 'paid') {
        const paid =
          pendingPayment || buildOrderPayment(method, 'paid');
        persistAndGoConfirmation(paid);
        return;
      }
    }

    if (!pendingPayment) {
      pendingPayment = buildOrderPayment(method, 'pending');
    }
    state.pendingPayment = pendingPayment;
    showInlineQr(method, qrPayload);
    if (state.backend.enabled && backendData && backendData.transactionId) {
      console.log('Đang chờ tín hiệu thanh toán từ server cho giao dịch:', backendData.transactionId);
    }
    window.joinPaymentRoom = function() {};
  }


  // ---------- Init ----------

  async function init() {
    initTabs();
    initCardForm();
    initVoucher();

    await loadOrder();
    renderOrderSummary();

    const backBtn = $('#btnBackConcessions');
    if (backBtn) {
      backBtn.addEventListener('click', () => {
        location.href = 'concessions.html';
      });
    }

    const confirmBtn = $('#btnConfirmPayment');
    if (confirmBtn) {
      confirmBtn.addEventListener('click', handleConfirmPayment);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
