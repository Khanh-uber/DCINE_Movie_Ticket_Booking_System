(() => {
  'use strict';

  const $ = (s, r = document) => r.querySelector(s);

  const toVND = (n) =>
    (Math.round(Number(n) || 0)).toLocaleString('vi-VN') + 'đ';

  const paymentMethodMap = {
    'credit-card': 'Thẻ tín dụng / ghi nợ',
    wallet: 'Ví điện tử (Momo, ZaloPay…)',
    'bank-transfer': 'Chuyển khoản ngân hàng',
    bank: 'Chuyển khoản ngân hàng'
  };

  function formatDate(iso) {
    if (!iso) return '--';
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return '--';
    return d.toLocaleString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  // Chuẩn hóa object orderConfirmed thành view model
  function buildOrderView(raw) {
    if (!raw || typeof raw !== 'object') return null;

    const safe = Object.assign(
      {
        orderId: '',
        movieId: '',
        theaterId: '',
        showtimeId: '',
        seats: [],
        combos: [],
        paymentMethod: '',
        total: 0,
        discountAmount: 0,
        createdAt: raw.createdAt || raw.date || new Date().toISOString(),
        movieTitle: raw.movieTitle || '',
        theaterName: raw.theaterName || '',
        showtimeText: raw.showtimeText || ''
      },
      raw
    );

    // Ghế
    const seatsText = Array.isArray(safe.seats) && safe.seats.length
      ? safe.seats.join(', ')
      : '';

    // Combo (chưa có DB map tên nên tạm hiển thị theo id + qty)
    let combosText = 'Không có';
    if (Array.isArray(safe.combos) && safe.combos.length) {
      combosText = safe.combos
        .map((c) => {
          if (!c) return '';
          const id = c.id || c.comboId || c.code || '';
          const qty =
            typeof c.qty === 'number'
              ? c.qty
              : typeof c.quantity === 'number'
              ? c.quantity
              : 0;
          if (!id && !qty) return '';
          return qty ? `${id} (x${qty})` : id;
        })
        .filter(Boolean)
        .join(', ');
    }

    const grand =
      typeof safe.total === 'number'
        ? safe.total
        : typeof safe.grandTotal === 'number'
        ? safe.grandTotal
        : 0;

    return {
      raw: safe,
      orderId: safe.orderId || '--',
      movieText: safe.movieTitle || safe.movieId || '--',
      theaterText: safe.theaterName || safe.theaterId || '--',
      showtimeText: safe.showtimeText || '',
      seatsText,
      combosText,
      methodText:
        paymentMethodMap[safe.paymentMethod] ||
        safe.paymentMethod ||
        '--',
      createdAt: safe.createdAt,
      total: grand
    };
  }

  function render(orderView) {
    if (!orderView) return;

    const o = orderView;

    // Left: vé
    const idEl = $('#tk-orderId');
    if (idEl) idEl.textContent = o.orderId;

    const movieEl = $('#tk-movie');
    if (movieEl) movieEl.textContent = o.movieText;

    const theaterEl = $('#tk-theater');
    if (theaterEl) theaterEl.textContent = o.theaterText;

    const showtimeEl = $('#tk-showtime');
    if (showtimeEl) showtimeEl.textContent = o.showtimeText || '--';

    const seatsEl = $('#tk-seats');
    if (seatsEl) seatsEl.textContent = o.seatsText || '--';

    const combosEl = $('#tk-combos');
    if (combosEl) combosEl.textContent = o.combosText || 'Không có';

    // QR code – dùng orderId
    const qrWrap = $('#qr-code-container');
    if (qrWrap && window.QRCode && o.orderId && o.orderId !== '--') {
      qrWrap.innerHTML = '';
      new QRCode(qrWrap, {
        text: o.orderId,
        width: 180,
        height: 180,
        colorDark: '#000000',
        colorLight: '#ffffff',
        correctLevel: QRCode.CorrectLevel.H
      });
    }

    // Right: invoice
    const invId = $('#inv-id');
    if (invId) invId.textContent = o.orderId;

    const invDate = $('#inv-date');
    if (invDate) invDate.textContent = formatDate(o.createdAt);

    const invMethod = $('#inv-method');
    if (invMethod) invMethod.textContent = o.methodText;

    const invTotal = $('#inv-total');
    if (invTotal) invTotal.textContent = toVND(o.total);
  }

  function downloadQr() {
    const canvas = document.querySelector('#qr-code-container canvas');
    if (canvas) {
      const url = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = url;
      a.download = 'dcine-ticket-qr.png';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      return;
    }

    const img = document.querySelector('#qr-code-container img');
    if (img && img.src) {
      const a = document.createElement('a');
      a.href = img.src;
      a.download = 'dcine-ticket-qr.png';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  }

  function clearCurrentOrderSession() {
    try {
      localStorage.removeItem('orderConfirmed');
      localStorage.removeItem('orderSummary');
    } catch (err) {
      console.warn('[confirmation] cannot clear session', err);
    }
  }

  function goHome() {
    clearCurrentOrderSession();
    window.location.href = 'index.html';
  }

  function goHistory() {
    clearCurrentOrderSession();
    window.location.href = 'profile.html';
  }

  function init() {
    let raw = null;

    // Lấy orderConfirmed từ payment.js
    try {
      const stored = localStorage.getItem('orderConfirmed');
      if (stored) {
        raw = JSON.parse(stored);
      }
    } catch (err) {
      console.warn('[confirmation] cannot parse orderConfirmed', err);
    }

    // Fallback demo nếu không có dữ liệu (dev/test giao diện)
    if (!raw) {
      console.warn(
        '[confirmation] Không tìm thấy orderConfirmed, dùng dữ liệu demo để test.'
      );
      raw = {
        orderId: 'DCINE-TEST-9999',
        movieId: 'mv-demo',
        theaterId: 'dcine-demo',
        showtimeText: '19:30 • 09/11/2025',
        seats: ['A5', 'A6'],
        combos: [{ id: 'cb01', qty: 1 }],
        paymentMethod: 'wallet',
        total: 504000,
        discountAmount: 0,
        createdAt: new Date().toISOString()
      };
    }

    const view = buildOrderView(raw);
    render(view);

    const dlBtn = $('#btnDownloadQr');
    if (dlBtn) dlBtn.addEventListener('click', downloadQr);

    const homeBtn = $('#btnGoHome');
    if (homeBtn) homeBtn.addEventListener('click', goHome);

    const historyBtn = $('#btnGoHistory');
    if (historyBtn) historyBtn.addEventListener('click', goHistory);
  }

  document.addEventListener('DOMContentLoaded', init);
})();
