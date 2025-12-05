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
  function enrichPaymentData(payment) {
      if (!payment) return null;

      try {

          const rawCart = localStorage.getItem('concessions_cart');
          let cartData = rawCart ? JSON.parse(rawCart) : {};

          const rawBooking = localStorage.getItem('booking_cart');
          let bookingData = rawBooking ? JSON.parse(rawBooking) : {};

          const realDate = 
              cartData.showDate || cartData.date || (cartData.ticket && cartData.ticket.showDate) ||
              (cartData.meta && cartData.meta.date) || 
              bookingData.showDate || bookingData.date || bookingData.ngayChieu ||
              (bookingData.meta && bookingData.meta.date);

          const realTime = 
              cartData.showTime || cartData.time || (cartData.ticket && cartData.ticket.showTime) ||
              (cartData.meta && cartData.meta.time) || 
              bookingData.showTime || bookingData.time || bookingData.gioChieu ||
              (bookingData.meta && bookingData.meta.time);

          // Lấy giá trị END TIME trực tiếp (Có thể là "" nếu không được truyền)
          const realEndTime = 
              cartData.endTime || (cartData.ticket && cartData.ticket.endTime) ||
              (cartData.meta && cartData.meta.endTime) || 
              bookingData.endTime || (bookingData.meta && bookingData.meta.endTime);

          if (realDate) payment.showDate = realDate;
          if (realTime) payment.showTime = realTime; // Raw Start Time
          if (realEndTime) payment.endTime = realEndTime; // Raw End Time (có thể là "")
          
          // [FIX] TẠO CHUỖI HIỂN THỊ CHỈ KHI END TIME CÓ GIÁ TRỊ KHÁC RỖNG
          if (realTime && realDate) {
              let timeStr = realTime; // VD: 14:00:00
              
              // Chỉ nối chuỗi nếu realEndTime KHÔNG phải là chuỗi rỗng ("")
              if (realEndTime && realEndTime !== "") { 
                  timeStr = `${realTime} ~ ${realEndTime}`; // VD: 14:00:00 ~ 16:00:00
              }

              payment.showtimeText = `${timeStr} • ${realDate}`; 
              
              // Gán chuỗi formatted (Start hoặc Start~End) vào showTime
              payment.showTime = timeStr; 
          }

      } catch (e) {
          console.warn("Lỗi trong quá trình enrichPaymentData", e);
      }

      return payment;
  }

  // ---------- Helpers ----------
  async function callMarkPaid(transactionId) {
  try {
    const res = await fetch(API + `/checkout/mark-paid?trans=${transactionId}`, {
      method: "POST",
      credentials: "include"
    });

    if (res.ok) {
      console.log("✔ mark-paid success");
      return await res.json();
    } else {
      console.error("❌ mark-paid failed");
    }

  } catch (err) {
    console.error("❌ Error calling mark-paid:", err);
  }
}
  async function getJSON(apiPath, localPath) {
    if (state.backend.enabled && apiPath) {
      try {
        const res = await fetch(API + apiPath, { cache: 'no-store', credentials: 'include' });
        if (res.ok) {
          return await res.json();
        }
      } catch (err) {
        console.warn('[payment] API error', apiPath, err);
        state.backend.enabled = false;
        state.backend.lastError = String(err);
      }
    }
    if (!localPath) return null;
    try {
      const res = await fetch(localPath, { cache: 'no-store', credentials: 'include' });
      if (res.ok) return await res.json();
    } catch (err) {
      console.warn('[payment] local JSON error', localPath, err);
    }
    return null;
  }

  function parseOrder(raw) {
    if (!raw || typeof raw !== 'object') return null;
    const ticket = raw.ticket && typeof raw.ticket === 'object' ? raw.ticket : null;
    let combos = [];
    if (Array.isArray(raw.combos)) combos = raw.combos;
    else if (Array.isArray(raw.items)) combos = raw.items;
    const totals = raw.totals && typeof raw.totals === 'object' ? raw.totals : null;
    let grandTotal = null;
    if (totals && typeof totals.grandTotal === 'number') grandTotal = totals.grandTotal;
    else if (typeof raw.grandTotal === 'number') grandTotal = raw.grandTotal;
    const discount = raw.discount && typeof raw.discount === 'object' ? raw.discount : null;
    if (!ticket) return null;
    return { ticket, combos, totals, grandTotal, discount };
  }

  function readLocalFallback() {
    try {
      const raw = localStorage.getItem('concessions_cart');
      if (!raw) return;
      const data = JSON.parse(raw);
      if (!data || typeof data !== 'object') return;
      
      // --- TÍNH TOÁN TICKET AMOUNT & CỨU ITEMS ---
      let ticketAmount = 0;
      let itemsArr = [];
      let seatsArr = []; // Khai báo thêm để cứu ghế

      // Ưu tiên 1: Lấy từ data.ticket.items (danh sách ghế chi tiết)
      if (data.ticket && Array.isArray(data.ticket.items) && data.ticket.items.length > 0) {
          itemsArr = data.ticket.items;
          seatsArr = itemsArr.map(i => i.code || i.seatCode);
          ticketAmount = itemsArr.reduce((sum, item) => sum + (Number(item.price)||0), 0);
      } 
      // Ưu tiên 2: Cứu từ booking_cart nếu concessions_cart thiếu
      else {
          const rawBooking = localStorage.getItem('booking_cart');
          if (rawBooking) {
              const bookingData = JSON.parse(rawBooking);
          
              const bookingId = bookingData.bookingId;
              data.bookingId = bookingId;  
              // [SỬA]: Ưu tiên đọc trường 'items' (chứa chi tiết ghế + giá từ BE)
              if (Array.isArray(bookingData.items) && bookingData.items.length > 0) {
                  itemsArr = bookingData.items; 
                  seatsArr = itemsArr.map(s => s.code || s.seatCode);
                  ticketAmount = itemsArr.reduce((sum, item) => sum + (Number(item.price)||0), 0);
              }
              // Fallback: đọc selectedSeats cũ
              else if (Array.isArray(bookingData.selectedSeats)) { 
                  // Giả định selectedSeats có structure {code, price}
                  itemsArr = bookingData.selectedSeats;
                  seatsArr = itemsArr.map(s => s.code);
                  ticketAmount = itemsArr.reduce((sum, item) => sum + (Number(item.price)||0), 0);
              }
          }
      }
      
      // Fallback: Lấy totalAmount trực tiếp nếu itemsArr vẫn rỗng
      if (ticketAmount === 0) {
          if (data.ticket && typeof data.ticket.totalAmount === 'number') {
              ticketAmount = data.ticket.totalAmount;
          }
          else if (data.totalPrice) {
              ticketAmount = Number(data.totalPrice);
          }
      }
      // -------------------------------------

      // Tính tổng Combo
      const combosTotal = (data.combos || []).reduce((sum, item) => {
          const unitPrice = Number(item.unitPrice || item.price || 0);
          const lineTotal = Number(item.lineTotal || 0);
          const qty = Number(item.qty || item.quantity || 1);
          return sum + (lineTotal > 0 ? lineTotal : unitPrice * qty);
      }, 0);

      const grandTotal = data.grandTotal || (ticketAmount + combosTotal);

      const finalTicket = data.ticket || {};
      if (!finalTicket.items) finalTicket.items = itemsArr;
      if (!finalTicket.seats && itemsArr.length > 0) {
          finalTicket.seats = itemsArr.map(i => i.code || i.seatCode);
      }
      if (!finalTicket.movieTitle) {
          finalTicket.movieTitle = data.movieName || data.movieTitle || data.filmName || 'Phim chưa xác định';
      }

      const rawCinema = 
          data.theaterName || data.cinemaName || data.theater || 
          data.cinema || data.branchName || 
          (data.ticket && data.ticket.theaterName) || 
          (data.ticket && data.ticket.cinemaName);

      if (!finalTicket.theaterName) {
          finalTicket.theaterName = rawCinema || 'D-cine Quận 1';
      }

      if (!finalTicket.showDate) finalTicket.showDate = data.showDate || data.date;
      if (!finalTicket.showTime) finalTicket.showTime = data.showTime || data.time;
      if (!finalTicket.endTime) finalTicket.endTime = data.endTime;
      
      // Cứu dữ liệu định dạng (format) nếu có
      if (!finalTicket.format) finalTicket.format = data.format || (data.meta && data.meta.format);

      state.order = {
        bookingId: data.bookingId,
        ticket: finalTicket, 
        combos: data.combos || [],
        totals: { 
            ticketAmount: ticketAmount,
            combosAmount: combosTotal,
            subTotal: grandTotal, 
            vat: 0, 
            grandTotal: grandTotal,
            grand: grandTotal
        }, 
        grandTotal: grandTotal
      };
      
    } catch (err) {
      console.warn('[payment] cannot parse concessions_cart', err);
    }
  }

  async function loadOrder() {
    let orderPayload = null;
    if (state.backend.enabled) {
      try {
        const res = await fetch(API + '/checkout/summary', {
          cache: 'no-store',
          credentials: 'include'
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
        state.backend.enabled = false;
        state.backend.lastError = String(err);
      }
    }
    
    readLocalFallback(); 
    
    orderPayload = state.order;
    if (state.backend.enabled && orderPayload) {
      try {
        const payload = { order: orderPayload, voucherCode: '' };
        const res = await fetch(API + '/checkout/apply-voucher', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
          cache: 'no-store',
          credentials: 'include'
        });
        if (res.ok) {
          const data = await res.json();
          if (data && data.totals) state.order = data; 
        }
      } catch (err) {
        console.warn('[payment] voucher error', err);
      }
    }
  }

  function computeTicketAmount(order) {
      if (!order || !order.ticket) return 0;
      const t = order.ticket;
      if (order.totals && typeof order.totals.ticketAmount === 'number') return order.totals.ticketAmount;
      if (typeof t.totalPrice === 'number') return t.totalPrice;
      if (typeof t.price === 'number') return t.price;
      if (typeof t.amount === 'number') return t.amount;
      if (typeof t.totalAmount === 'number') return t.totalAmount;
      if (Array.isArray(t.items)) return t.items.reduce((sum, item) => sum + (Number(item.price) || 0), 0);
      return 0;
    }

  function computeCombosAmount(order, ticketAmount) {
    if (!order) return 0;
    if (order.totals && typeof order.totals.combosAmount === 'number') return order.totals.combosAmount;
    return (order.combos || []).reduce((sum, it) => {
      if (!it) return sum;
      const unit = typeof it.unitPrice === 'number' ? it.unitPrice : typeof it.price === 'number' ? it.price : 0;
      const qty = typeof it.qty === 'number' ? it.qty : typeof it.quantity === 'number' ? it.quantity : 0;
      if (typeof it.lineTotal === 'number') return sum + it.lineTotal;
      return sum + unit * qty;
    }, 0);
  }

  function getTotals(order) {
    let ticketAmount = 0, combosAmount = 0, subTotal = 0, vat = 0, discountAmount = 0, discountCode = '', grand;
    const t = order.totals;

    if (t) {
      ticketAmount = typeof t.ticketAmount === 'number' ? t.ticketAmount : computeTicketAmount(order);
      combosAmount = typeof t.combosAmount === 'number' ? t.combosAmount : computeCombosAmount(order, ticketAmount);
      subTotal = typeof t.subTotal === 'number' ? t.subTotal : ticketAmount + combosAmount;
      vat = Math.floor(subTotal * 0.08);
      discountAmount = typeof t.discountAmount === 'number' ? t.discountAmount : 0;
      discountCode = t.discountCode || t.code || (order.discount && order.discount.code) || (order._voucher && order._voucher.code) || '';
      
      const beGrand = typeof t.grandTotal === 'number' ? t.grandTotal : typeof order.grandTotal === 'number' ? order.grandTotal : null;
      const feCalcGrand = Math.max(0, subTotal + vat - discountAmount);
      grand = (beGrand != null && Math.abs(beGrand - feCalcGrand) < 1000) ? beGrand : feCalcGrand;
    } else {
      ticketAmount = computeTicketAmount(order);
      combosAmount = computeCombosAmount(order, ticketAmount);
      subTotal = ticketAmount + combosAmount;
      vat = Math.floor(subTotal * 0.08);
      if (order.discount && typeof order.discount.amount === 'number') {
        discountAmount = order.discount.amount;
        discountCode = order.discount.code || '';
      } else if (order._voucher && typeof order._voucher.amount === 'number') {
        discountAmount = order._voucher.amount;
        discountCode = order._voucher.code || '';
      }
      grand = Math.max(0, subTotal + vat - discountAmount);
    }
    return { ticketAmount, combosAmount, subTotal, vat, discountAmount, discountCode, grand };
  }

  function extractTicketMeta(ticket) {
      if (!ticket) return { movieTitle: '', showtimeText: '', seatsText: '', theaterName: '' };
      const meta = ticket.meta && typeof ticket.meta === 'object' ? ticket.meta : {};
      const movieTitle = meta.movieTitle || ticket.movieTitle || ticket.title || '';
      const date = meta.date || ticket.date || ticket.showDate || '';
      const startTime = meta.time || ticket.time || ticket.showTime || '';
      const endTime = meta.endTime || ticket.endTime || '';
      
      let timeDisplay = startTime;
      if (startTime && endTime) timeDisplay = `${startTime} ~ ${endTime}`;

      const theaterName = ticket.theaterName || ticket.cinemaName || (meta && meta.theaterName) || 'D-cine Quận 1';

      let seatsArr = [];

      // 1) từ ticket.items
      if (Array.isArray(ticket.items)) {
          seatsArr = ticket.items
              .map(it => it && (it.code || it.seatCode || it.label))
              .filter(Boolean);
      }

      // 2) từ ticket.seats (nếu items không có)
      if (!seatsArr.length && Array.isArray(ticket.seats)) {
          seatsArr = ticket.seats.filter(Boolean);
      }

      // 3) từ ticket.ticket.items (BE trả nested)
      if (!seatsArr.length && ticket.ticket && Array.isArray(ticket.ticket.items)) {
          seatsArr = ticket.ticket.items
              .map(it => it && (it.code || it.seatCode || it.label))
              .filter(Boolean);
      }

      // 4) Fallback cuối: cartData trong localStorage
      if (!seatsArr.length) {
          const raw = localStorage.getItem('booking_cart');
          if (raw) {
              try {
                  const data = JSON.parse(raw);
                  if (Array.isArray(data.selectedSeats)) {
                      seatsArr = data.selectedSeats.map(s => s.code);
                  }
              } catch {}
          }
      }

      // Sắp xếp ghế trước khi hiển thị
      seatsArr.sort((a, b) => a.localeCompare(b, 'en', { numeric: true }));
      return {
          movieTitle: movieTitle.toUpperCase(),
          showtimeText: [timeDisplay, date].filter(Boolean).join(' • '),
          seatsText: seatsArr.join(', '),
          theaterName: theaterName
      };

      };

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
      if (confirmBtn) confirmBtn.disabled = true;
      return;
    }
    if (confirmBtn) confirmBtn.disabled = false;
    if (warnEl) warnEl.hidden = true;

    const totals = getTotals(state.order);
    state.order._computedTotals = totals;
    state.order.grandTotal = totals.grand;

    if (itemsWrap) {
      const { ticket, combos } = state.order;
      const meta = extractTicketMeta(ticket);
      const lines = [];
      const rowStyle = 'display: flex; justify-content: space-between; margin-bottom: 6px; font-size: 14px; color: #ccc; line-height: 1.4;';
      const priceStyle = 'color: #fff; font-weight: 500;';

      // 1. Tên phim
      if (meta.movieTitle) {
        lines.push(`
          <div class="summary-item" style="margin-bottom: 8px;">
            <strong style="font-size: 15px; text-transform: uppercase; line-height: 1.3;">
              ${meta.movieTitle}
            </strong>
          </div>
        `);
      }

      // 2. Rạp
      if (meta.theaterName) {
        lines.push(`
          <div style="${rowStyle}">
            <span>${meta.theaterName}</span>
            <span></span>
          </div>
        `);
      }

      // 3. Suất chiếu - Ngày (KHÔNG CÓ GIÁ)
      if (meta.showtimeText) {
        lines.push(`
          <div style="${rowStyle}">
            <span>${meta.showtimeText}</span>
            <span></span>
          </div>
        `);
      }

      // 4. Ghế + TIỀN VÉ CÙNG 1 HÀNG
      if (meta.seatsText) {
        lines.push(`
          <div style="${rowStyle}">
            <span>Ghế: ${meta.seatsText}</span>
            <span style="${priceStyle}">${toVND(totals.ticketAmount)}</span>
          </div>
        `);
      }

      // 5. Combo + giá combo
      const totalCombosAmount = totals.combosAmount;
      if (totalCombosAmount > 0) {
        // Liệt kê tên các combo đã chọn
        const comboList = (combos || []).map(c => {
            const name = c.title || c.name || 'Combo';
            const qty = c.qty || c.quantity || 1;
            return qty > 1 ? `${name} (x${qty})` : name;
        }).join(' + ');
        
        lines.push(`
          <div style="${rowStyle}">
            <span>Combo: ${comboList}</span>
            <span style="${priceStyle}">${toVND(totalCombosAmount)}</span>
          </div>
        `);
      }

      //lines.push(`<div style="border-top: 1px dashed #333; margin: 12px 0 12px 0;"></div>`);
      itemsWrap.innerHTML = lines.join('');
    }
    
    // --- RENDER CÁC TRƯỜNG TỔNG KẾT ---
    
    // Tạm tính và VAT
    if (subTotalEl) subTotalEl.textContent = toVND(totals.subTotal);
    if (vatEl) vatEl.textContent = toVND(totals.vat);

    // Giảm giá (Discount)
    if (discountRow) {
        if (totals.discountAmount > 0) {
            discountRow.style.display = 'flex'; 
            if (discountAmountEl) discountAmountEl.textContent = `-${toVND(totals.discountAmount)}`;
            if (discountCodeEl) discountCodeEl.textContent = `(${totals.discountCode || 'Mã ưu đãi'})`;
        } else {
            // Hiển thị -0đ khi không có giảm giá
            discountRow.style.display = 'flex'; 
            if (discountAmountEl) discountAmountEl.textContent = `-0₫`;
            if (discountCodeEl) discountCodeEl.textContent = '';
        }
    }

    // Tổng Thanh Toán
    if (grandEl) grandEl.textContent = toVND(totals.grand);
  }

  function setPaymentMethod(method) {
    state.paymentMethod = method;
    const tabs = $$('#paymentTabs .tab-btn');
    tabs.forEach((btn) => btn.classList.toggle('active', btn.dataset.method === method));
    ['card', 'wallet', 'bank'].forEach((m) => {
      const pane = $(`#paymentPane-${m}`);
      if (pane) pane.hidden = m !== method;
    });
    const cardVisual = $('#cardVisual');
    if (cardVisual) cardVisual.style.display = method === 'card' ? '' : 'none';
  }

  function initTabs() {
      $$('#paymentTabs .tab-btn').forEach(btn => btn.addEventListener('click', () => {
          state.paymentMethod = btn.dataset.method;
          $$('#paymentTabs .tab-btn').forEach(b => b.classList.toggle('active', b===btn));
          ['card','wallet','bank'].forEach(m => { 
              const p = $(`#paymentPane-${m}`); if(p) p.hidden = m!==state.paymentMethod; 
          });
          if($('#cardVisual')) $('#cardVisual').style.display = state.paymentMethod==='card'?'':'none';
      }));
    }

  function updateCardMock() {
    const num = $('#cardNumber')?.value || '';
    const name = $('#cardName')?.value || '';
    const exp = $('#cardExpiry')?.value || '';
    if ($('#displayCardNumber')) $('#displayCardNumber').textContent = num || '#### #### #### ####';
    if ($('#displayCardName')) $('#displayCardName').textContent = name || 'YOUR NAME';
    if ($('#displayCardExpiry')) $('#displayCardExpiry').textContent = exp || 'MM/YY';
  }

  function initCardForm() {
    // 1. SỐ THẺ
    const numEl = $('#cardNumber');
    if (numEl) {
      numEl.addEventListener('input', (e) => {
        let v = e.target.value.replace(/\D/g, '');
        v = v.slice(0, 16);
        v = v.replace(/(\d{4})(?=\d)/g, '$1 ');
        e.target.value = v;
        updateCardMock();
      });
    }

    // 2. NGÀY HẾT HẠN (Logic thông minh: tự thêm 0, chặn tháng > 12)
    const expEl = $('#cardExpiry');
    if (expEl) {
      expEl.addEventListener('input', (e) => {
        let v = e.target.value.replace(/\D/g, '');
        
        // Logic thêm số 0 nếu nhập 2-9 đầu tiên
        if (v.length === 1 && /[2-9]/.test(v)) {
          v = '0' + v;
        }

        // Validate tháng
        if (v.length >= 2) {
          const mm = parseInt(v.slice(0, 2), 10);
          if (mm === 0) v = '0'; 
          else if (mm > 12) v = v.slice(0, 1);
        }

        v = v.slice(0, 4);
        if (v.length >= 3) {
          v = v.slice(0, 2) + '/' + v.slice(2);
        }
        e.target.value = v;
        updateCardMock();
      });
    }

    // 3. TÊN CHỦ THẺ (CHUYỂN CÓ DẤU -> KHÔNG DẤU + IN HOA)
    const nameEl = $('#cardName');
    if (nameEl) {
      let isComposing = false;
      
      // Khi bắt đầu gõ tiếng Việt -> Tạm dừng xử lý
      nameEl.addEventListener('compositionstart', () => { isComposing = true; });
      
      // Khi gõ xong tiếng Việt -> Xử lý ngay
      nameEl.addEventListener('compositionend', (e) => {
        isComposing = false;
        handleNameInput(e.target);
      });

      // Khi nhập bình thường
      nameEl.addEventListener('input', (e) => {
        if (isComposing) return;
        handleNameInput(e.target);
      });

      function handleNameInput(input) {
        let v = input.value;

        // BƯỚC 1: Xóa dấu tiếng Việt (Normalize)
        // Tách ký tự có dấu thành ký tự gốc + dấu (vd: á -> a + ´), sau đó xóa dấu
        v = v.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        
        // Xử lý riêng chữ Đ/đ (vì NFD không tách đ thành d)
        v = v.replace(/đ/g, 'd').replace(/Đ/g, 'D');

        // BƯỚC 2: Chỉ giữ lại chữ cái A-Z và khoảng trắng (Loại bỏ số, ký tự đặc biệt)
        v = v.replace(/[^a-zA-Z\s]/g, '');

        // BƯỚC 3: Viết hoa toàn bộ
        v = v.toUpperCase();

        // BƯỚC 4: Xóa khoảng trắng thừa
        v = v.replace(/\s{2,}/g, ' ');

        input.value = v;
        updateCardMock();
      }
    }

    // 4. MÃ CVV
    const cvvEl = $('#cardCvv');
    if (cvvEl) {
      cvvEl.addEventListener('input', (e) => {
        let v = e.target.value.replace(/\D/g, '');
        v = v.slice(0, 4);
        e.target.value = v;
      });
    }

    // 5. NÚT XÓA
    const clearBtn = $('#btnClearCard');
    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        if (numEl) numEl.value = '';
        if (nameEl) nameEl.value = '';
        if (expEl) expEl.value = '';
        if (cvvEl) cvvEl.value = '';
        updateCardMock();
      });
    }
  }

  async function ensurePromotionsLoaded() {
    if (state.promotions.loaded) return state.promotions.list;
    const data = await getJSON('/promotions', '../data/promotions.json');
    state.promotions.list = Array.isArray(data) ? data : (data && Array.isArray(data.items) ? data.items : []);
    state.promotions.loaded = true;
    return state.promotions.list;
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
    // Clear message
    if (msgEl) {
        msgEl.textContent = '';
        msgEl.classList.remove('ok', 'err');
    }

    // Gửi request với code = "" (để BE reset discount)
    fetch(API + '/checkout/apply-voucher', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code: "",
        order: state.order
      }),
      credentials: 'include'
    }).then(r => r.json()).then(data => {
        const order = parseOrder(data);
        if (order) {
            state.order = order;
            renderOrderSummary();
        }
    });

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
          }),
          credentials: 'include'
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
  ensurePromotionsLoaded().then(list => {
    const select = $('#voucherSelect');
    if (!select) return;
    select.innerHTML = [
      '<option value="">Chọn từ danh sách</option>',
      ...list
        .filter(p => p && p.code)
        .map(p => `<option value="${p.code}">${p.code} — ${p.name || ''}</option>`)
    ].join('');
    select.addEventListener('change', (e) => {
      const code = e.target.value || '';
      const input = $('#voucherCode');
      if (input) input.value = code;
      applyVoucher(code); 
    });
  }).catch(() => {});
  const applyBtn = $('#btnApplyVoucher');
  if (applyBtn) applyBtn.addEventListener('click', () => {
    const input = $('#voucherCode');
    const code = input ? input.value : '';
    applyVoucher(code);
  });
}


  function validatePayment() {
      const num = $('#cardNumber')?.value.replace(/\s+/g,'')||'';
      if (num.length < 12) { alert('Vui lòng nhập đầy đủ thông tin thẻ.'); return false; }
      return true;
  }

  function buildOrderPayment(method, status) {
      const ticket = state.order.ticket || {};
      const totals = state.order.totals || {};
      const now = new Date();
      // ID Tạm (sẽ được enrich lại)
      const displayOrderId = state.order.bookingId ? `ORD-${state.order.bookingId}` : ('DCINE' + now.getTime().toString().slice(-8));

      return {
        orderId: displayOrderId,
        bookingId: state.order.bookingId,
        paymentMethod: method,
        status: status,
        total: totals.grand || totals.grandTotal || 0,
        createdAt: now.toISOString(),
        movieTitle: ticket.movieTitle || 'Phim chưa xác định',
        theaterName: ticket.theaterName || 'Rạp chưa xác định',
        showDate: ticket.showDate || ticket.date || '--',
        showTime: ticket.showTime || ticket.time || '--',
        endTime: ticket.endTime || '',
        seats: ticket.seats || [],
        combos: (state.order.combos || []).map(c => ({ name: c.name || c.title || 'Combo', qty: c.quantity || c.qty || 1 }))
      };
  }

  function persistAndGoConfirmation(orderPayment) {
    try {
      const METHOD_MAP = { 'wallet': 'Ví điện tử', 'bank': 'Chuyển khoản ngân hàng', 'card': 'Thẻ tín dụng / Ghi nợ' };
      const displayMethod = METHOD_MAP[orderPayment.paymentMethod] || orderPayment.paymentMethod;
      
      const confirmed = {
        orderId: orderPayment.orderId,
        
        status: orderPayment.status,
        total: orderPayment.total,
        createdAt: orderPayment.createdAt,
        movieTitle: orderPayment.movieTitle,
        theaterName: orderPayment.theaterName,
        showDate: orderPayment.showDate,
        showTime: orderPayment.showTime,
        startTime: orderPayment.showTime,
        endTime: orderPayment.endTime,
        seatsText: orderPayment.seats || [],
        combos: orderPayment.combos || [],

        paymentMethod: displayMethod,
        showtimeText: orderPayment.showtimeText
      };

      localStorage.setItem('orderConfirmed', JSON.stringify(confirmed));
      const allRaw = localStorage.getItem('orders');
      const all = allRaw ? JSON.parse(allRaw) : [];
      all.push(confirmed);
      localStorage.setItem('orders', JSON.stringify(all));

    } catch (err) { console.warn('[payment] persist error', err); }
    location.href = 'confirmation.html';
  }

  function showInlineQr(method, qrPayload) {
    const isWallet = method === 'wallet';
    const box = isWallet ? $('#walletQrBox') : $('#bankQrBox');
    const img = isWallet ? $('#walletQrImage') : $('#bankQrImage');
    const download = isWallet ? $('#walletQrDownload') : $('#bankQrDownload');
    if (!box || !img || !download) return;

    const imageUrl = (qrPayload && (qrPayload.imageUrl || qrPayload.url || qrPayload.qrImageUrl)) || (isWallet ? '../assets/img/qr-demo-wallet.png' : '../assets/img/qr-demo-bank.png');
    img.src = imageUrl;
    download.href = imageUrl;
    box.hidden = false;
    state.qr.method = method;
    state.qr.imageUrl = imageUrl;
  }

  // ============================================================
  // [QUAN TRỌNG] CALLBACK KHI THANH TOÁN QR THÀNH CÔNG
  // Hàm này giờ đây sẽ gọi enrichPaymentData để đảm bảo đủ thông tin
  // ============================================================
  window.DCINE_MARK_PAYMENT_PAID = function (payload) {
    let payment = buildOrderPayment(state.paymentMethod, 'paid');
    
    if (payload && payload.orderId) {
        payment.orderId = payload.orderId;
    }
    payment = enrichPaymentData(payment);
    
    persistAndGoConfirmation(payment);
  };

  async function handleConfirmPayment() {
    if (!state.order) { alert('Không tìm thấy đơn hàng.'); return; }
    if (state.paymentMethod === 'card' && !validatePayment()) return;

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
                bookingId : state.order.bookingId,
                ticket: state.order.ticket,
                combos: state.order.combos || [],
                grandTotal: state.order._computedTotals ? state.order._computedTotals.grand : state.order.grandTotal
            }
          }),
          credentials: 'include'
        });
        if (res.ok) backendData = await res.json();
      } catch (err) { state.backend.enabled = false; }
    }

    if (method === 'card') {
      let payment = buildOrderPayment(method, 'paid');
        if (backendData && backendData.orderId) payment.orderId = backendData.orderId;
        payment = enrichPaymentData(payment);
        persistAndGoConfirmation(payment);
        return;
    }

    // QR Flows (Wallet/Bank)
    let pendingPayment = buildOrderPayment(method, 'pending');
    state.pendingPayment = pendingPayment;

    let qrUrl = null;
    if (backendData && (backendData.qr || backendData.qrUrl)) qrUrl = backendData.qr || {imageUrl: backendData.qrUrl};
    showInlineQr(method, qrUrl);
    
    if (window.DCINE_JOIN_PAYMENT_ROOM && backendData && backendData.transactionId) {
        window.DCINE_JOIN_PAYMENT_ROOM(backendData.transactionId);
    }
      if (backendData && backendData.transactionId) {
      callMarkPaid(backendData.transactionId);
  }
  }

  async function init() {
    initTabs(); 
    initCardForm();
    initVoucher();
    await loadOrder();
    renderOrderSummary();

    // 1. Nút quay lại (Back)
    const backBtn = $('#btnBackConcessions');
    if (backBtn) {
        backBtn.addEventListener('click', (e) => {
            e.preventDefault();
            window.location.href = 'concessions.html';
        });
    }

    // 2. Nút xác nhận thanh toán (Confirm)
    const btnConfirm = $('#btnConfirmPayment');
    if (btnConfirm) {
        btnConfirm.addEventListener('click', handleConfirmPayment);
    }
  }

  if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', init);
  } else {
      init();
  }
})();