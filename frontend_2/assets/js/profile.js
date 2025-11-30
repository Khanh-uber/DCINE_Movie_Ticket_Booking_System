// assets/js/profile.js
(() => {
  const API = window.API_BASE || 'http://localhost:8080/api';
window.API_BASE = API;
  const toVND = (n) => (Math.round(Number(n) || 0)).toLocaleString('vi-VN') + 'đ';

  // ---------- Utils: BE-first rồi fallback JSON ----------
  async function getJSON(apiPath, localPath) {
    // 1. Gọi BE
    if (apiPath) {
      try {
        const res = await fetch(apiPath, { cache: 'no-store' ,
        credentials: 'include' });
        if (res.ok) return await res.json();
      } catch (err) {
        console.warn('[Profile] API error', apiPath, err);
      }
    }
    // 2. Fallback sang file JSON local
    if (localPath) {
      try {
        console.log('[Profile] Fallback ->', localPath);
        const res2 = await fetch(localPath, { cache: 'no-store' });
        if (res2.ok) return await res2.json();
      } catch (err2) {
        console.warn('[Profile] Local JSON error', localPath, err2);
      }
    }
    return null;
  }

  // ---------- State ----------
  let currentUser = null;
  let membershipTiers = [];
  let bookings = [];
  let vouchers = [];

  // ---------- Normalizers ----------
  function normalizeUser(raw) {
    if (!raw || typeof raw !== 'object') return null;
    const u = { ...raw };

    // avatar
    u.avatar = raw.avatarUrl || raw.avatar || null;

    // tổng chi tiêu
    if (u.totalSpent == null && raw.totalSpending != null) {
      u.totalSpent = raw.totalSpending;
    }

    // membership
    u.membership = raw.membership || raw.tierName || 'Standard';

    return u;
  }

  function normalizeBooking(b) {
    if (!b || typeof b !== 'object') return null;

    const movie = b.movie || {};
    const showtime = b.showtime || {};

    const id = b.bookingCode || b.id || b.code || '';
    const title = movie.title || movie.name || b.movieTitle || b.movie || '';

    const poster =
      movie.posterUrl ||
      movie.poster ||
      b.posterUrl ||
      b.poster ||
      '/assets/images/placeholder/poster-vertical.png';

    const theater =
      showtime.theaterName ||
      b.theaterName ||
      b.theater ||
      '';

    // ngày / giờ
    let date = b.date || showtime.date || '';
    let time = b.time || showtime.time || '';
    const startAt = showtime.startTime || b.startTime || b.showTime;

    if ((!date || !time) && startAt) {
      const d = new Date(startAt);
      if (!isNaN(d)) {
        const iso = d.toISOString();
        if (!date) date = iso.slice(0, 10);
        if (!time) time = iso.slice(11, 16);
      }
    }

    // ghế
    let seats = [];
    if (Array.isArray(b.seats)) {
      seats = b.seats
        .map((s) => {
          if (typeof s === 'string') return s;
          if (!s || typeof s !== 'object') return '';
          if (s.code) return s.code;
          const row = s.row || s.rowName || '';
          const no = s.number ?? s.col ?? s.colIndex ?? '';
          return String(row) + String(no);
        })
        .filter(Boolean);
    }

    // combo
    let concessionTexts = [];
    if (Array.isArray(b.concessions)) {
      concessionTexts = b.concessions
        .map((c) => {
          if (typeof c === 'string') return c;
          if (!c || typeof c !== 'object') return '';
          const name = c.title || c.name || c.itemName || '';
          const qty = c.quantity ?? c.qty;
          return qty ? `${name} (x${qty})` : name;
        })
        .filter(Boolean);
    }

    const total =
      b.totalAmount ??
      b.total_price ??
      b.total ??
      0;

    return {
      id,
      movie: title,
      poster,
      theater,
      date,
      time,
      seats,
      concessions: concessionTexts,
      total
    };
  }
  function normalizeVoucher(v) {
    if (!v || typeof v !== 'object') return null;
    const typeRaw = (v.type || v.discountType || '').toString().toUpperCase();
    const isPercent =
      typeRaw === 'PERCENT' || typeRaw === '%';

    const valRaw =
      v.value ??
      v.discountValue ??   
      v.val ??
      v.amount ??
      0;

    const minTier =
      v.minTier ||
      v.membershipTierName ||
      v.membershipTier ||
      'Standard';

    return {
      code: v.code,
      type: isPercent ? '%' : 'vnd',
      val: Number(valRaw) || 0,
      desc: v.description || v.desc || '',
      minTier
    };
  }


  function getEffectiveTiers() {
    if (Array.isArray(membershipTiers) && membershipTiers.length) {
      return membershipTiers;
    }
    // fallback cấu hình tĩnh (ít, không chứa data user)
    return [
      { name: 'Standard', min: 0 },
      { name: 'Silver',   min: 1000000 },
      { name: 'Gold',     min: 3000000 },
    ];
  }

  // ---------- Load toàn bộ data hồ sơ ----------
  async function loadAllProfileData() {
    const [profileRes, bookingsRes, vouchersRes] = await Promise.all([
      getJSON(`${API}/profile`, '../data/profile.json'),
      getJSON(`${API}/profile/bookings`, '../data/profile-bookings.json'),
      getJSON(`${API}/deals`, '../data/profile-vouchers.json')
    ]);

    if (profileRes) {
      const userRaw = profileRes.user || profileRes;
      currentUser = normalizeUser(userRaw);
      if (Array.isArray(profileRes.tiers)) {
        membershipTiers = profileRes.tiers;
      }
    }

    if (bookingsRes && Array.isArray(bookingsRes.bookings)) {
      bookings = bookingsRes.bookings.map(normalizeBooking).filter(Boolean);
    } else {
      bookings = [];
    }

    if (Array.isArray(vouchersRes)) {
      vouchers = vouchersRes.map(normalizeVoucher).filter(Boolean);
    } else if (vouchersRes && Array.isArray(vouchersRes.vouchers)) {
      vouchers = vouchersRes.vouchers.map(normalizeVoucher).filter(Boolean);
    } else if (vouchersRes && Array.isArray(vouchersRes.items)) {
      vouchers = vouchersRes.items.map(normalizeVoucher).filter(Boolean);
    } else {
      vouchers = [];
    }
  }


  // ---------- Render PROFILE (header + form) ----------
  function renderProfile() {
    if (!currentUser) return;

    const membership = currentUser.membership || 'Standard';

    // màu header theo hạng
    const headerCard = document.querySelector('.profile-header-card');
    if (headerCard) {
      headerCard.classList.remove(
        'tier-Standard',
        'tier-Silver',
        'tier-Gold',
        'tier-Platinum'
      );
      headerCard.classList.add(`tier-${membership}`);
    }

    const nameEl   = document.getElementById('display-name');
    const userEl   = document.getElementById('display-username');
    const badgeEl  = document.getElementById('display-badge');
    const avatarEl = document.getElementById('user-avatar');

    if (nameEl) nameEl.textContent = currentUser.fullName || '';
    if (userEl) userEl.textContent = '@' + (currentUser.username || 'user');

    if (badgeEl) {
      badgeEl.className = `badge-tier tier-${membership}`;
      badgeEl.innerHTML = `<i class="fa-solid fa-gem"></i> ${membership.toUpperCase()} MEMBER`;
    }

    if (avatarEl && currentUser.avatar) {
      avatarEl.src = currentUser.avatar;
    }

    const setVal = (id, v) => {
      const el = document.getElementById(id);
      if (el) el.value = v ?? '';
    };

    setVal('inp-name', currentUser.fullName);
    setVal('inp-username', currentUser.username);
    setVal('inp-email', currentUser.email);
    setVal('inp-phone', currentUser.phone);
    setVal('inp-dob', currentUser.dob);
    setVal('inp-address', currentUser.address);
    setVal('inp-joined', currentUser.joinedAt);

    const genderEl = document.getElementById('inp-gender');
    if (genderEl) genderEl.value = currentUser.gender || 'OTHER';

    // progress membership
    const tiers = getEffectiveTiers();
    const curIdx = tiers.findIndex((t) => t.name === membership);
    const nextTier = tiers[curIdx + 1];
    const spend = currentUser.totalSpent || 0;

    const currSpendEl   = document.getElementById('curr-spend');
    const targetSpendEl = document.getElementById('next-tier-spend');
    const barEl         = document.getElementById('tier-progress');
    const msgEl         = document.getElementById('tier-msg');

    if (currSpendEl) currSpendEl.textContent = toVND(spend);

    if (nextTier) {
      const target = nextTier.min;
      const remain = Math.max(0, target - spend);
      const percent = target > 0 ? Math.min(100, (spend / target) * 100) : 0;

      if (targetSpendEl) targetSpendEl.textContent = toVND(target);
      if (barEl) barEl.style.width = `${percent}%`;
      if (msgEl) msgEl.textContent = `Chi thêm ${toVND(remain)} để lên hạng ${nextTier.name}`;
    } else {
      if (targetSpendEl) targetSpendEl.textContent = 'MAX';
      if (barEl) barEl.style.width = '100%';
      if (msgEl) msgEl.textContent = 'Bạn đã đạt hạng cao nhất!';
    }
  }

  // ---------- Render TICKETS ----------
  function renderTickets() {
    const activeEl = document.getElementById('active-tickets');
    const pastEl   = document.getElementById('past-tickets');
    if (!activeEl || !pastEl) return;

    const today = new Date().toISOString().split('T')[0];

    activeEl.innerHTML = '';
    pastEl.innerHTML   = '';

    let hasActive = false;
    let hasPast   = false;

    bookings.forEach((t) => {
      if (!t) return;
      const isFuture = t.date >= today;

      const food = t.concessions && t.concessions.length
        ? `<div class="ticket-meta"><i class="fa-solid fa-burger"></i> ${t.concessions.join(', ')}</div>`
        : '';

      const seatsText = t.seats && t.seats.length ? t.seats.join(', ') : 'Chưa có';

      const html = `
        <div class="ticket-card">
          <img src="${t.poster}" class="ticket-poster"
               onerror="this.src='https://via.placeholder.com/150x225?text=No+Image'">
          <div class="ticket-info">
            <div class="ticket-movie">${t.movie}</div>
            <div class="ticket-meta"><i class="fa-solid fa-location-dot"></i> ${t.theater}</div>
            <div class="ticket-meta"><i class="fa-regular fa-calendar"></i> ${t.date} • ${t.time}</div>
            <div class="ticket-meta"><i class="fa-solid fa-couch"></i> Ghế: ${seatsText}</div>
            ${food}
            <div class="ticket-meta" style="margin-top:8px; color:var(--accent-gold); font-weight:bold;">
              Tổng: ${toVND(t.total)}
            </div>
            ${
              isFuture
                ? `<button class="btn-qr" onclick="window.showQR('${t.id}')">
                     <i class="fa-solid fa-qrcode"></i> QR Code
                   </button>`
                : `<div class="ticket-status-used">Đã dùng</div>`
            }
          </div>
        </div>
      `;

      if (isFuture) {
        activeEl.insertAdjacentHTML('beforeend', html);
        hasActive = true;
      } else {
        pastEl.insertAdjacentHTML('beforeend', html);
        hasPast = true;
      }
    });

    if (!hasActive) {
      activeEl.innerHTML = '<p class="st-empty">Hiện bạn chưa có vé sắp chiếu.</p>';
    }
    if (!hasPast) {
      pastEl.innerHTML = '<p class="st-empty">Chưa có lịch sử vé đã sử dụng.</p>';
    }
  }

  // ---------- Render VOUCHERS ----------
  function renderPromos() {
    const container = document.getElementById('promo-list');
    if (!container) return;

    container.innerHTML = '';

    const membership = currentUser?.membership || 'Standard';
    const tiers = getEffectiveTiers();
    const userRankIndex = tiers.findIndex((t) => t.name === membership);

    vouchers.forEach((v) => {
      if (!v) return;
      const voucherRank = tiers.findIndex((t) => t.name === v.minTier);
      if (voucherRank === -1 || voucherRank > userRankIndex) return;

      const valStr = v.type === '%' ? `${v.val}%` : toVND(v.val);
      container.insertAdjacentHTML(
        'beforeend',
        `
        <div class="promo-card">
          <div class="promo-title">
            <i class="fa-solid fa-ticket"></i> ${v.code}
          </div>
          <div class="promo-main">Giảm ${valStr}</div>
          <div class="promo-desc">${v.desc}</div>
          <div class="promo-code-box">
            <span class="code-text">${v.code}</span>
            <button class="btn-copy" onclick="window.copyCode('${v.code}')">
              <i class="fa-regular fa-copy"></i>
            </button>
          </div>
        </div>
        `
      );
    });

    if (!container.innerHTML.trim()) {
      container.innerHTML = '<p class="st-empty">Hiện bạn chưa có ưu đãi nào khả dụng.</p>';
    }
  }

  // ---------- Avatar change (preview, sau này nối upload BE) ----------
  function handleAvatarFileChange(e) {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    const img = document.getElementById('user-avatar');
    const url = URL.createObjectURL(file);

    if (img) img.src = url;
    if (currentUser) currentUser.avatar = url;
  }

  // ---------- Global handlers ----------
  window.switchTab = (id, btn) => {
    document.querySelectorAll('.nav-item').forEach((el) => el.classList.remove('active'));
    document.querySelectorAll('.tab-pane').forEach((el) => el.classList.remove('active'));

    if (btn) btn.classList.add('active');
    const pane = document.getElementById(`tab-${id}`);
    if (pane) pane.classList.add('active');
  };

  window.toggleEdit = () => {
    const ids = ['inp-name', 'inp-phone', 'inp-dob', 'inp-gender', 'inp-address'];
    const first = document.getElementById('inp-name');
    if (!first) return;
    const disabled = first.disabled;

    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) el.disabled = !disabled;
    });

    const actions = document.getElementById('edit-actions');
    const btnEdit = document.getElementById('btn-edit');
    if (actions) actions.style.display = disabled ? 'flex' : 'none';
    if (btnEdit) btnEdit.style.display = disabled ? 'none' : 'inline-flex';
  };

  window.saveProfile = async () => {
    if (!currentUser) return;

    const getVal = (id) => (document.getElementById(id)?.value ?? '');

    const payload = {
      fullName: getVal('inp-name'),
      phone: getVal('inp-phone'),
      dob: getVal('inp-dob'),
      gender: getVal('inp-gender'),
      address: getVal('inp-address')
    };

    // update local trước
    Object.assign(currentUser, payload);

    try {
      const res = await fetch(`${API}/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error('Bad response');
      const data = await res.json().catch(() => null);
      if (data && data.user) currentUser = normalizeUser(data.user);
      alert('✅ Cập nhật hồ sơ thành công.');
    } catch (err) {
      console.warn('[Profile] PUT /profile lỗi, chỉ cập nhật FE.', err);
      alert('Đã cập nhật trên giao diện. Khi BE xong hãy nối API PUT /profile.');
    }

    window.toggleEdit();
    renderProfile();
  };

  window.changePassword = async () => {
    const oldP = document.getElementById('old-pass')?.value;
    const newP = document.getElementById('new-pass')?.value;
    const cfmP = document.getElementById('confirm-pass')?.value;

    if (!oldP || !newP || !cfmP) {
      alert('Vui lòng điền đủ thông tin!');
      return;
    }
    if (newP !== cfmP) {
      alert('Mật khẩu xác nhận không khớp!');
      return;
    }

    try {
      const res = await fetch(`${API}/profile/password`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ oldPassword: oldP, newPassword: newP }),
        credentials: 'include'
      });
      if (!res.ok) throw new Error('Bad response');
      alert('✅ Đổi mật khẩu thành công.');
    } catch (err) {
      console.warn('[Profile] PUT /profile/password lỗi (mock thành công).', err);
      alert('Đã gửi yêu cầu đổi mật khẩu (mock). Khi BE xong hãy nối API PUT /profile/password.');
    }

    document.getElementById('old-pass').value = '';
    document.getElementById('new-pass').value = '';
    document.getElementById('confirm-pass').value = '';
  };

window.logout = () => {
  if (confirm('Đăng xuất khỏi tài khoản?')) {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('fullName');
    localStorage.removeItem('username');
    localStorage.removeItem('avatarUrl');
    window.location.href = 'index.html';
  }
};

  window.showQR = (ticketId) => {
    const modal = document.getElementById('qrModal');
    const box   = document.getElementById('qrcode');
    const codeEl= document.getElementById('modal-ticket-code');
    if (!modal || !box || !codeEl) return;

    box.innerHTML = '';

    if (window.QRCode) {
      // eslint-disable-next-line no-undef
      new QRCode(box, { text: ticketId, width: 180, height: 180 });
    } else {
      const fallback = document.createElement('div');
      fallback.style.background = '#ffffff';
      fallback.style.color = '#000000';
      fallback.style.padding = '12px 16px';
      fallback.style.fontFamily = 'monospace';
      fallback.textContent = ticketId;
      box.appendChild(fallback);
    }

    codeEl.textContent = ticketId;
    modal.style.display = 'flex';
  };

  window.closeModal = () => {
    const modal = document.getElementById('qrModal');
    if (modal) modal.style.display = 'none';
  };

  window.copyCode = (code) => {
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(code);
    }
    alert('Đã sao chép mã: ' + code);
  };

  document.addEventListener('click', (e) => {
    const modal = document.getElementById('qrModal');
    if (!modal) return;
    if (e.target === modal) modal.style.display = 'none';
  });

  // ---------- Boot ----------
  document.addEventListener('DOMContentLoaded', async () => {
    await loadAllProfileData();
    renderProfile();
    renderTickets();
    renderPromos();

    const avatarInput = document.getElementById('avatar-input');
    if (avatarInput) {
      avatarInput.addEventListener('change', handleAvatarFileChange);
    }
  });
})();
