(() => {
  'use strict';

  const $ = (s, r = document) => r.querySelector(s);

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

  function buildOrderView(raw) {
    if (!raw || typeof raw !== 'object') return null;

    // Helper lấy dữ liệu lồng nhau
    const t = raw.ticket || {}; 
    const totals = raw.totals || {};

    // 1. Lấy tên phim, rạp
    const movieTitle = raw.movieTitle || t.movieTitle || raw.movieName || 'Phim chưa xác định';
    const theaterName = raw.theaterName || t.theaterName || raw.cinemaName || 'Rạp chưa xác định';
    
    // 2. [FIX HOÀN CHỈNH] Đọc trực tiếp các trường đã format từ payment.js
    // Payment.js đã đảm bảo raw.showDate và raw.showTime là các chuỗi đã được làm sạch.
    const showDate = raw.showDate || raw.date || t.date || t.showDate || '--';
    const showtimeDisplay = raw.showTime || raw.time || t.time || t.showTime || '--'; // Chuỗi "Start ~ End"
    
    // 3. Xử lý ghế
    const seatsList = raw.seats || t.seats || [];
    const seatsText = Array.isArray(seatsList) ? seatsList.join(', ') : (seatsList || '--');

    // 4. Xử lý Combo (giữ nguyên logic cũ)
    let combosText = 'Không có';
    const comboSource = raw.combos || [];
    if (Array.isArray(comboSource) && comboSource.length > 0) {
      combosText = comboSource
        .map(c => `${c.name || c.title || 'Combo'} (x${c.qty || c.quantity || 1})`)
        .join(', ');
    }

    // 5. Xử lý Tổng tiền
    const total = raw.total || raw.grandTotal || totals.grandTotal || 0;

    // 6. Xử lý Phương thức thanh toán (giữ nguyên logic cũ)
    const paymentMethodMap = { /* ... (map logic) ... */ }; // Giả sử map đã tồn tại
    const rawMethod = raw.paymentMethod || 'cash';
    const methodText = paymentMethodMap[rawMethod] || rawMethod;


    return {
        orderId: raw.orderId || '--',
        movieText: movieTitle,
        theaterText: theaterName,
        showDate: showDate,         // Ngày chiếu
        showtimeText: showtimeDisplay, // Giờ chiếu (Start ~ End)
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

    // Left: vé
    const idEl = $('#tk-orderId');
    if (idEl) idEl.textContent = o.orderId;

    const movieEl = $('#tk-movie');
    if (movieEl) movieEl.textContent = o.movieText;

    const theaterEl = $('#tk-theater');
    if (theaterEl) theaterEl.textContent = o.theaterText;

    // [MỚI] Render Ngày chiếu
    const dateEl = $('#tk-showdate');
    if (dateEl) dateEl.textContent = o.showDate;

    // Render Suất chiếu (chỉ còn giờ)
    const showtimeEl = $('#tk-showtime');
    if (showtimeEl) showtimeEl.textContent = o.showtimeText;

    const seatsEl = $('#tk-seats');
    if (seatsEl) seatsEl.textContent = o.seatsText;

    const combosEl = $('#tk-combos');
    if (combosEl) combosEl.textContent = o.combosText;

    // QR code
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
      // Xóa hết các flag booking để dọn dẹp cho lần mua sau
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

  function init() {
    let raw = null;

    try {
      const stored = localStorage.getItem('orderConfirmed');
      if (stored) {
        raw = JSON.parse(stored);
      }
    } catch (err) {
      console.warn('[confirmation] cannot parse orderConfirmed', err);
    }

    // Fallback demo nếu chạy trực tiếp file html này
    if (!raw) {
      console.warn('[confirmation] Dùng dữ liệu demo.');
      raw = {
        orderId: 'DCINE-' + Math.floor(Math.random() * 1000000),
        movieTitle: 'Đào, Phở và Piano',
        theaterName: 'D-cine Lê Văn Việt',
        showDate: '29/11/2025',     // [MỚI] Ngày riêng
        showTime: '19:30 ~ 21:30',  // [MỚI] Giờ riêng
        seats: ['F5', 'F6'],
        combos: [{ name: 'Bắp phô mai', qty: 1 }],
        paymentMethod: 'Ví điện tử',
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

  document.addEventListener('DOMContentLoaded', init);
})();