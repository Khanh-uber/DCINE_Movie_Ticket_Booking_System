(() => {
  'use strict';

  const $ = (s, r = document) => r.querySelector(s);

  const API = window.API_BASE || '/api';

  const toVND = (n) =>
    (Math.round(Number(n) || 0)).toLocaleString('vi-VN') + 'đ';
  const paymentMethodMap = {
    'card': 'Thẻ tín dụng / Ghi nợ',
    'credit-card': 'Thẻ tín dụng / Ghi nợ',
    'wallet': 'Ví điện tử (Momo, ZaloPay)',
    'momo': 'Ví Momo',
    'zalopay': 'Ví ZaloPay',
    'bank-transfer': 'Chuyển khoản ngân hàng',
    'bank': 'Chuyển khoản ngân hàng',
    'cash': 'Tiền mặt'
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
  async function fetchOrderFromBackend() {
    try {
      const res = await fetch(API + '/checkout/last-confirmed', {
        cache: 'no-store',
        credentials: 'include'
      });
      if (!res.ok) return null;
      const data = await res.json();
      if (!data || typeof data !== 'object') return null;
      return data;
    } catch (err) {
      console.warn('[confirmation] cannot load from backend', err);
      return null;
    }
  }

  function buildOrderView(raw) {
    if (!raw || typeof raw !== 'object') return null;

    const t = raw.ticket || {};
    const totals = raw.totals || {};

    const movieTitle = raw.movieTitle || t.movieTitle || raw.movieName || 'Phim chưa xác định';
    const theaterName = raw.theaterName || t.theaterName || raw.cinemaName || 'Rạp chưa xác định';

    const showDate = raw.showDate || raw.date || t.date || t.showDate || '--';
    const showtimeDisplay =
      raw.showTime || raw.time || t.time || t.showTime || raw.showtimeText || '--'; 
    const seatsList = raw.seats || raw.seatsText || t.seats || [];
    const seatsText = Array.isArray(seatsList) ? seatsList.join(', ') : (seatsList || '--');

    let combosText = 'Không có';
    const comboSource = raw.combos || [];
    if (Array.isArray(comboSource) && comboSource.length > 0) {
      combosText = comboSource
        .map(c => `${c.name || c.title || 'Combo'} (x${c.qty || c.quantity || 1})`)
        .join(', ');
    }

    const total = raw.total || raw.grandTotal || totals.grandTotal || 0;

    const rawMethod =
      raw.paymentMethod || raw.paymentCode || raw.paymentType || 'cash';
    const methodText = paymentMethodMap[rawMethod] || rawMethod;

    return {
      orderId: raw.orderId || '--',
      movieText: movieTitle,
      theaterText: theaterName,
      showDate: showDate,             
      showtimeText: showtimeDisplay,  
      seatsText: seatsText,
      combosText: combosText,
      methodText: methodText,
      total: total,
      createdAt: raw.createdAt || new Date().toISOString()
    };
  }

  function render(orderView) {
    if (!orderView) return;

    const o = orderView;

    const idEl = $('#tk-orderId');
    if (idEl) idEl.textContent = o.orderId;

    const movieEl = $('#tk-movie');
    if (movieEl) movieEl.textContent = o.movieText;

    const theaterEl = $('#tk-theater');
    if (theaterEl) theaterEl.textContent = o.theaterText;

    const dateEl = $('#tk-showdate');
    if (dateEl) dateEl.textContent = o.showDate;

    const showtimeEl = $('#tk-showtime');
    if (showtimeEl) showtimeEl.textContent = o.showtimeText;

    const seatsEl = $('#tk-seats');
    if (seatsEl) seatsEl.textContent = o.seatsText;

    const combosEl = $('#tk-combos');
    if (combosEl) combosEl.textContent = o.combosText;

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
      localStorage.removeItem('booking_cart');
      localStorage.removeItem('concessions_cart');
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

  async function init() {
    let raw = null;
    raw = await fetchOrderFromBackend();
    if (!raw) {
      try {
        const stored = localStorage.getItem('orderConfirmed');
        if (stored) {
          raw = JSON.parse(stored);
        }
      } catch (err) {
        console.warn('[confirmation] cannot parse orderConfirmed', err);
      }
    }
    if (!raw) {
      console.warn('[confirmation] Dùng dữ liệu demo.');
      raw = {
        orderId: 'DCINE-' + Math.floor(Math.random() * 1000000),
        movieTitle: 'Đào, Phở và Piano',
        theaterName: 'D-cine Lê Văn Việt',
        showDate: '29/11/2025',
        showTime: '19:30 ~ 21:30',
        seats: ['F5', 'F6'],
        combos: [{ name: 'Bắp phô mai', qty: 1 }],
        paymentMethod: 'wallet',
        total: 245000,
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

  document.addEventListener('DOMContentLoaded', () => {
    init();
  });
})();
