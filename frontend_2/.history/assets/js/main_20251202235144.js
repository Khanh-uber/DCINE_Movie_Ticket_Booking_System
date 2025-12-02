(() => {
  'use strict';

  // ====== Helpers ======
  const $  = (s, r=document) => r.querySelector(s);
  const $$ = (s, r=document) => Array.from(r.querySelectorAll(s));
  const API = window.API_BASE = "http://localhost:8080/api";
  const clamp = (n,min,max)=>Math.max(min,Math.min(max,n));
  const throttle=(fn,ms=16)=>{ let t=0; return (...a)=>{ const n=Date.now(); if(n-t>ms){ t=n; fn(...a);} } };

// ===== Movie-card template loader =====
let MOVIE_TPL = null;

async function ensureMovieTpl() {
  if (MOVIE_TPL) return MOVIE_TPL;
  try {
    const res = await fetch('./components/movie-card.html', { cache: 'no-store', credentials: 'include' });
    if (!res.ok) throw new Error('movie-card.html not found');

    const html = await res.text();
    const box = document.createElement('div');
    box.innerHTML = html;

    MOVIE_TPL = box.querySelector('#movie-card');
    if (!MOVIE_TPL) throw new Error('#movie-card template missing');

    document.body.appendChild(MOVIE_TPL);
  } catch (err) {
    console.error('[movie-card] load failed:', err);
  }
  return MOVIE_TPL;
}


  // ====== Voucher card (home) – build bằng JS, không dùng promo-card.html ======
  async function ensurePromoCardTemplate() {
    return true;
  }

  function promoCardFromData(p) {
    const el = document.createElement('article');
    el.className = 'deal promo-card';
    el.dataset.id = p.id || '';

    if (p.href) {
      el.dataset.href = p.href;
    }
    const titleRow = document.createElement('div');
    titleRow.className = 'promo-title';

    const tagSpan = document.createElement('span');
    tagSpan.textContent = p.tag || 'Voucher thành viên';
    titleRow.appendChild(tagSpan);

    if (p.badge) {
      const badge = document.createElement('span');
      badge.className = 'promo-badge';
      badge.textContent = p.badge;
      titleRow.appendChild(badge);
    }

    const main = document.createElement('div');
    main.className = 'promo-main';
    main.textContent = p.title || '';

    const desc = document.createElement('p');
    desc.className = 'promo-desc';
    desc.textContent = p.desc || '';

    let validEl = null;
    if (p.validUntil) {
      validEl = document.createElement('div');
      validEl.className = 'promo-valid';
      validEl.textContent = `HSD: ${p.validUntil}`;
    }

    const codeBox = document.createElement('div');
    codeBox.className = 'promo-code-box';

    const codeText = document.createElement('span');
    codeText.className = 'code-text';
    codeText.textContent = p.code || p.id || '';

    const btnCopy = document.createElement('button');
    btnCopy.type = 'button';
    btnCopy.className = 'btn-copy';
    btnCopy.textContent = 'Sao chép';

    btnCopy.addEventListener('click', (e) => {
      e.stopPropagation();
      const code = codeText.textContent.trim();
      if (!code) return;

      // copy mã
      const doCopy = (txt) => {
        if (navigator.clipboard?.writeText) {
          navigator.clipboard.writeText(txt).catch(() => {});
        } else {
          const input = document.createElement('input');
          input.value = txt;
          document.body.appendChild(input);
          input.select();
          try { document.execCommand('copy'); } catch {}
          document.body.removeChild(input);
        }
      };

      doCopy(code);

      btnCopy.classList.add('copied');
      btnCopy.textContent = 'Đã copy';
      setTimeout(() => {
        btnCopy.classList.remove('copied');
        btnCopy.textContent = 'Sao chép';
      }, 1500);
    });

    codeBox.appendChild(codeText);
    codeBox.appendChild(btnCopy);
    el.appendChild(titleRow);
    el.appendChild(main);
    el.appendChild(desc);
    if (validEl) el.appendChild(validEl);
    el.appendChild(codeBox);

    el.addEventListener('click', (e) => {
      const rail = el.closest('.rail');
      if (rail && rail.dataset.isDragging === '1') {
        rail.dataset.isDragging = '0';
        e.preventDefault();
        e.stopPropagation();
        return;
      }

      const to = el.dataset.href;
      if (to) location.href = to;
    });

    return el;
  }


  // ====== Combo-item template loader (once) ======
  let COMBO_TPL = null;
  async function ensureComboItemTemplate(){
    if (COMBO_TPL) return COMBO_TPL;
    const res = await fetch('../../html/components/combo-item.html', { cache:'no-store' });
    const html = await res.text();
    const div = document.createElement('div'); div.innerHTML = html;
    COMBO_TPL = div.querySelector('#combo-item');
    if (COMBO_TPL) document.body.appendChild(COMBO_TPL);
    return COMBO_TPL;
  }
  const fmtVND = (n)=> (Math.round(Number(n)||0)).toLocaleString('vi-VN') + '₫';

  function comboItemFromData(c, {mode='concessions'} = {}){
    const el = COMBO_TPL.content.firstElementChild.cloneNode(true);
    el.dataset.id = c.id || '';
    el.dataset.price = c.price || 0;

    // ảnh + text
    const img = el.querySelector('[data-img]');
    if (img){ img.src = c.imageUrl || ''; img.alt = c.title || 'Combo'; }
    el.querySelector('[data-title]').textContent = c.title || 'Combo';
    el.querySelector('[data-desc]').textContent  = c.desc  || '';

    // tag
    const tag = el.querySelector('[data-tag]');
    if (c.tag){ tag.textContent = c.tag; tag.hidden = false; }

    // giá & khuyến mãi
    const priceText = el.querySelector('[data-price-text]');
    const old = el.querySelector('[data-old]');
    const save = el.querySelector('[data-save]');
    priceText.textContent = fmtVND(c.price || 0);
    if (c.oldPrice && c.oldPrice > c.price){
      old.textContent = fmtVND(c.oldPrice); old.hidden = false;
      const percent = Math.round(100 - (c.price / c.oldPrice)*100);
      save.textContent = `(-${percent}%)`; save.hidden = false;
    }

    // biến thể size
    const vWrap = el.querySelector('[data-variants]');
    const vOpts = el.querySelector('[data-opts]');
    if (Array.isArray(c.variants) && c.variants.length){
      vWrap.hidden = false;
      vOpts.innerHTML = '';
      c.variants.forEach((v, idx)=>{
        const id = `${c.id || 'combo'}_${idx}`;
        const w = document.createElement('label');
        w.className = 'chip';
        w.innerHTML = `<input type="radio" name="${c.id||'combo'}" value="${v.value}" ${idx===0?'checked':''}>
                      <span>${v.label}</span>`;
        vOpts.appendChild(w);
      });
    }

    // qty +/- & nút
    const qtyEl = el.querySelector('[data-qty]');
    const btnAdd = el.querySelector('[data-add]');
    const btnRem = el.querySelector('[data-remove]');
    el.querySelector('.step.dec').addEventListener('click', ()=>{ qtyEl.value = Math.max(1, Number(qtyEl.value)-1); });
    el.querySelector('.step.inc').addEventListener('click', ()=>{ qtyEl.value = Number(qtyEl.value)+1; });

    if (mode === 'cart'){ btnRem.hidden = false; btnAdd.textContent = 'Cập nhật'; }

    // phát sự kiện cho giỏ
    btnAdd.addEventListener('click', ()=>{
      const chosen = vOpts?.querySelector('input:checked')?.value || null;
      const detail = {
        type: 'combo',
        id: c.id, title: c.title, price: c.price, oldPrice: c.oldPrice || null,
        imageUrl: c.imageUrl || '', variant: chosen, qty: Number(qtyEl.value)||1
      };
      document.dispatchEvent(new CustomEvent(mode === 'cart' ? 'cart:update' : 'cart:add', { detail }));
    });
    btnRem.addEventListener('click', ()=>{
      document.dispatchEvent(new CustomEvent('cart:remove', { detail: { type:'combo', id: c.id }}));
    });

    return el;
  }

  // === Ticket summary template loader (once) ===
  let TICKET_TPL;
  async function ensureTicketTemplate(){
    if (TICKET_TPL) return TICKET_TPL;
    const html = await (await fetch('../../html/components/ticket-summary.html', {cache:'no-store'})).text();
    const div = document.createElement('div'); div.innerHTML = html;
    TICKET_TPL = div.querySelector('#ticket-summary');
    document.body.appendChild(TICKET_TPL);
    return TICKET_TPL;
  }

  function ticketFromData(t){
    const el = TICKET_TPL.content.firstElementChild.cloneNode(true);
    if (t.orderCode){ el.dataset.order = t.orderCode; el.querySelector('[data-order]').textContent = t.orderCode; }
    if (t.posterUrl) el.querySelector('[data-poster]').src = t.posterUrl;
    el.querySelector('[data-movie]').textContent   = t.movieTitle || '';
    el.querySelector('[data-format]').textContent  = t.format || '2D';
    el.querySelector('[data-lang]').textContent    = t.language || '';
    if (t.rated) el.querySelector('[data-rated]').textContent = t.rated;
    el.querySelector('[data-theater]').textContent = t.theater || '';
    el.querySelector('[data-showdate]').textContent= t.showDate || '';
    el.querySelector('[data-showtime]').textContent= t.showTime || '';
    el.querySelector('[data-seats]').textContent   = (t.seats||[]).join(', ');
    el.querySelector('[data-qty]').textContent     = `${t.qty || (t.seats?.length||1)} vé`;
    if (t.qrSrc) el.querySelector('[data-qrcode]').src = t.qrSrc;
    if (t.barcode){ const b=el.querySelector('[data-barcode]'); b.textContent=t.barcode; b.hidden=false; }
    const asVND = n => (Math.round(Number(n)||0)).toLocaleString('vi-VN') + '₫';
    if (t.price != null)   el.querySelector('[data-price]').textContent   = asVND(t.price);
    if (t.fee   != null){  const w=el.querySelector('[data-fee-wrap]');   w.hidden=false; w.querySelector('[data-fee]').textContent = asVND(t.fee); }
    if (t.combo != null){  const w=el.querySelector('[data-combo-wrap]'); w.hidden=false; w.querySelector('[data-combo]').textContent = asVND(t.combo); }
    if (t.discount != null){ const w=el.querySelector('[data-discount-wrap]'); w.hidden=false; w.querySelector('[data-discount]').textContent = `−${asVND(t.discount)}`; }
    if (t.total != null)   el.querySelector('[data-total]').textContent   = asVND(t.total);
    if (t.note) el.querySelector('[data-note]').textContent = t.note;
    return el;
  }

// ===== Notification template loader (once) =====
let NOTIF_TPL = null;
async function ensureNotificationTemplate(){
  if (NOTIF_TPL) return NOTIF_TPL;
  const res  = await fetch('../../html/components/notification-item.html', { cache:'no-store' });
  const html = await res.text();
  const box  = document.createElement('div'); box.innerHTML = html;
  NOTIF_TPL  = box.querySelector('#notification-item');
  if (NOTIF_TPL) document.body.appendChild(NOTIF_TPL);
  return NOTIF_TPL;
}

const timeAgo = (iso) => {
  const d = new Date(iso || Date.now()); const s = Math.floor((Date.now() - d.getTime())/1000);
  const T = (n,u)=> `${n} ${u} trước`; if (s<60) return 'vừa xong';
  const m = s/60|0; if (m<60) return T(m,'phút');
  const h = m/60|0; if (h<24) return T(h,'giờ');
  const d2 = h/24|0; if (d2<7) return T(d2,'ngày');
  return d.toLocaleDateString('vi-VN');
};

function notificationFromData(n, {inMenu=false} = {}){
  const el   = NOTIF_TPL.content.firstElementChild.cloneNode(true);
  el.dataset.id = n.id || '';
  el.dataset.unread = n.unread ? '1' : '0';
  if (n.href) el.dataset.href = n.href;

  // icon/tag/title/text/time
  if (n.icon) el.querySelector('[data-icon]').textContent = n.icon;
  const tag = el.querySelector('[data-tag]'); if (n.tag){ tag.textContent=n.tag; tag.hidden=false; }
  el.querySelector('[data-title]').textContent = n.title || '';
  el.querySelector('[data-text]').textContent  = n.text  || '';
  el.querySelector('[data-time]').textContent  = timeAgo(n.createdAt);

  // hành vi
  el.addEventListener('click', (e)=>{
    if (e.target.closest('[data-mark],[data-remove]')) return; // tránh đè nút
    const to = el.dataset.href; if (to) location.href = to;
  });

  // mark read
  el.querySelector('[data-mark]').addEventListener('click', async (e)=>{
    e.stopPropagation();
    el.dataset.unread = '0';
    document.dispatchEvent(new CustomEvent('notif:mark', { detail:{ id:n.id } }));
    // (tuỳ chọn) gọi BE:
    // fetch(`${API}/notifications/${n.id}/read`, { method:'POST' }).catch(()=>{ el.dataset.unread='1'; });
  });

  // remove
  el.querySelector('[data-remove]').addEventListener('click', async (e)=>{
    e.stopPropagation();
    el.remove();
    document.dispatchEvent(new CustomEvent('notif:remove', { detail:{ id:n.id } }));
    // (tuỳ chọn) gọi BE:
    // fetch(`${API}/notifications/${n.id}`, { method:'DELETE' }).catch(()=>{/* handle restore if needed */});
  });

  // nếu hiển thị trong menu nhỏ: rút gọn mô tả
  if (inMenu){
    const p = el.querySelector('.text');
    if (p && p.textContent.length > 100) p.textContent = p.textContent.slice(0,100) + '…';
  }
  return el;
}

// ===== Load notifications vào 1 mount bất kỳ =====
async function loadNotifications({ mountId='notifList', limit=20, inMenu=false } = {}){
  const wrap = document.getElementById(mountId); if (!wrap) return;
  await ensureNotificationTemplate();

  const API = window.API_BASE || '/api';
  let data = [];
  try{
    const res = await fetch(`${API}/notifications?limit=${limit}`, {
  cache: 'no-store',
  credentials: 'include'
});

    if (res.ok) data = await res.json();
  }catch{}

  // Dummy khi chưa có BE
  if (!Array.isArray(data) || data.length === 0){
    data = [
      { id:'n1', title:'Vé DC-123456 đã xác nhận', text:'Bạn hãy đến rạp trước 10 phút.',
        tag:'ĐƠN HÀNG', icon:'🎟', createdAt: new Date().toISOString(), href:'confirmation.html', unread:true },
      { id:'n2', title:'Ưu đãi thành viên Gold', text:'Tặng 1 vé khi tích 5 vé trong tháng này.',
        tag:'THÀNH VIÊN', icon:'⭐', createdAt: new Date(Date.now()-7200000).toISOString(), unread:false },
    ];
  }

  wrap.innerHTML = '';
  data.slice(0, limit).forEach(n => wrap.appendChild(notificationFromData(n, {inMenu})));

  // cập nhật badge (nếu có)
  const unread = data.filter(x=>x.unread).length;
  document.dispatchEvent(new CustomEvent('notif:badge', { detail:{ unread } }));
}

// ====== Modal template loader & API ======
// ====== Modal template loader & API ======
let MODAL_TPL = null, MODAL_ROOT = null, MODAL_EL = null, LAST_FOCUS = null;

// Luôn gọi được, kể cả khi không có file modal.html
async function ensureModalTemplate() {
  if (MODAL_TPL) return MODAL_TPL;

  // 1. Thử load từ /html/components/modal.html nếu bạn có file này
  try {
    const res = await fetch('components/modal.html', { cache: 'no-store', credentials: 'include' });
    if (res.ok) {
      const html = await res.text();
      const box = document.createElement('div');
      box.innerHTML = html;
      const tpl = box.querySelector('#ui-modal');
      if (tpl) {
        MODAL_TPL = tpl;
        document.body.appendChild(MODAL_TPL);
        return MODAL_TPL;
      }
    }
  } catch (e) {
    console.warn('[modal] Không load được components/modal.html:', e);
  }

  // 2. Fallback: tự tạo template modal nếu không có file
  const fallback = document.createElement('template');
  fallback.id = 'ui-modal';
  fallback.innerHTML = `
    <div class="modal-root">
      <div class="modal-backdrop" data-backdrop></div>
      <div class="modal modal--video" data-modal>
        <button class="modal-close" data-close aria-label="Đóng">✕</button>
        <header class="modal-head" data-head hidden>
          <h3 class="modal-title"></h3>
        </header>
        <div class="modal-body" data-body></div>
        <footer class="modal-foot" data-foot hidden></footer>
      </div>
    </div>`;
  MODAL_TPL = fallback;
  document.body.appendChild(MODAL_TPL);
  return MODAL_TPL;
}

function buildModalRoot() {
  if (MODAL_ROOT) return;
  if (!MODAL_TPL) {
    console.error('[modal] MODAL_TPL chưa có');
    return;
  }

  const frag = MODAL_TPL.content.cloneNode(true);
  MODAL_ROOT = frag.querySelector('.modal-root');
  MODAL_EL   = frag.querySelector('[data-modal]');
  document.body.appendChild(MODAL_ROOT);

  // Đóng modal
  MODAL_ROOT.querySelector('[data-backdrop]').addEventListener('click', closeModal);
  MODAL_ROOT.querySelector('[data-close]').addEventListener('click', closeModal);
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && MODAL_ROOT.classList.contains('is-open')) closeModal();
  });

  // Trap focus đơn giản
  MODAL_ROOT.addEventListener('keydown', (e) => {
    if (e.key !== 'Tab') return;
    const focusables = MODAL_ROOT.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    if (!focusables.length) return;
    const first = focusables[0];
    const last  = focusables[focusables.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      last.focus(); e.preventDefault();
    } else if (!e.shiftKey && document.activeElement === last) {
      first.focus(); e.preventDefault();
    }
  });
}

async function openModal({ title = '', html = '', footHTML = '', size = '' } = {}) {
  await ensureModalTemplate();
  buildModalRoot();
  if (!MODAL_ROOT || !MODAL_EL) {
    console.error('[modal] Không khởi tạo được modal');
    return;
  }

  MODAL_EL.className = 'modal'; // reset
  if (size) MODAL_EL.classList.add(size);

  const head = MODAL_EL.querySelector('[data-head]');
  const body = MODAL_EL.querySelector('[data-body]');
  const foot = MODAL_EL.querySelector('[data-foot]');

  head.hidden = !title;
  head.querySelector('.modal-title') && (head.querySelector('.modal-title').textContent = title || '');

  body.innerHTML = html || '';

  foot.hidden = !footHTML;
  foot.innerHTML = footHTML || '';

  LAST_FOCUS = document.activeElement;
  document.body.classList.add('modal-open');
  MODAL_ROOT.classList.add('is-open');

  // focus vào nút close
  const closeBtn = MODAL_EL.querySelector('[data-close]');
  if (closeBtn) setTimeout(() => closeBtn.focus(), 0);
}

function closeModal() {
  if (!MODAL_ROOT || !MODAL_EL) return;

  const body = MODAL_EL.querySelector('[data-body]');

  // stop video
  body.querySelectorAll('video').forEach(v => {
    try { v.pause(); v.removeAttribute('src'); v.load(); } catch {}
  });
  body.querySelectorAll('iframe').forEach(f => {
    try { f.src = 'about:blank'; } catch {}
    f.remove();
  });
  body.innerHTML = '';

  MODAL_ROOT.classList.remove('is-open');
  document.body.classList.remove('modal-open');

  if (LAST_FOCUS) LAST_FOCUS.focus();
}

// Trailer trong popup (hero + card)
function openTrailerModal(url) {
  if (!url) return;

  const yt = /youtu(\.be|be\.com)/.test(url);
  const vm = /vimeo\.com/.test(url);

  const ytEmbed = (u) => {
    try {
      const Y = new URL(u);
      let id =
        (Y.hostname.includes('youtu.be') && Y.pathname.split('/')[1]) ||
        (Y.pathname.startsWith('/embed/')  && Y.pathname.split('/')[2]) ||
        (Y.pathname.startsWith('/shorts/') && Y.pathname.split('/')[2]) ||
        Y.searchParams.get('v');
      if (!id) return null;
      return `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0&modestbranding=1&playsinline=1`;
    } catch { return null; }
  };

  const vmEmbed = (u) => {
    const m = /vimeo\.com\/(\d+)/.exec(u);
    return m ? `https://player.vimeo.com/video/${m[1]}?autoplay=1` : null;
  };

  const src = yt ? ytEmbed(url) : vm ? vmEmbed(url) : null;
  const body = src
    ? `<iframe src="${src}" frameborder="0"
         allow="autoplay; encrypted-media; picture-in-picture"
         allowfullscreen></iframe>`
    : `<video src="${url}" controls autoplay playsinline></video>`;

  const foot = yt ? `<a class="btn" href="${url}" target="_blank" rel="noopener">Mở trên YouTube</a>` : '';

  // nếu modal lỗi -> mở tab mới
  openModal({ title: '', html: body, footHTML: foot, size: 'modal--video' })
    .catch(err => {
      console.error('[trailer] modal lỗi, mở tab mới:', err);
      window.open(url, '_blank');
    });
}

// Confirm + QuickLogin giữ nguyên như cũ...
// (phần openConfirm, openQuickLogin giữ nguyên)



/* ====== Helpers: các use-case thường gặp ====== */




// 2) Confirm – trả Promise<boolean>
function openConfirm({ title='Xác nhận', message='Bạn chắc chứ?', okText='Đồng ý', cancelText='Hủy' } = {}){
  return new Promise(async (resolve)=>{
    const html = `<div style="padding:6px 4px 0">${message}</div>`;
    const foot = `
      <button class="btn outline" data-act="cancel">${cancelText}</button>
      <button class="btn" data-act="ok">${okText}</button>`;
    await openModal({ title, html, footHTML: foot, size:'modal--sm' });
    const footEl = MODAL_EL.querySelector('.modal-foot');
    footEl.querySelector('[data-act="cancel"]').addEventListener('click', ()=>{ closeModal(); resolve(false); });
    footEl.querySelector('[data-act="ok"]').addEventListener('click', ()=>{ closeModal(); resolve(true); });
  });
}

// 3) Đăng nhập nhanh – bắn event cho app xử lý
function openQuickLogin(){
  const html = `
    <form id="quickLogin" class="stack" style="display:grid;gap:10px">
      <label>Email<input name="email" type="email" required placeholder="you@email.com"></label>
      <label>Mật khẩu<input name="password" type="password" required placeholder="••••••••"></label>
      <label style="display:flex;align-items:center;gap:8px">
        <input type="checkbox" name="remember"> Ghi nhớ
      </label>
    </form>`;
  const foot = `
    <button class="btn outline" data-act="cancel">Hủy</button>
    <button class="btn" data-act="login">Đăng nhập</button>`;
  openModal({ title:'Đăng nhập', html, footHTML:foot, size:'modal--sm' });
  const footEl = MODAL_EL.querySelector('.modal-foot');
  const form = MODAL_EL.querySelector('#quickLogin');
  const submit = ()=> {
    const fd = new FormData(form);
    const detail = { email: fd.get('email'), password: fd.get('password'), remember: !!fd.get('remember') };
    document.dispatchEvent(new CustomEvent('auth:quickLogin', { detail }));
    closeModal();
  };
  footEl.querySelector('[data-act="cancel"]').addEventListener('click', closeModal);
  footEl.querySelector('[data-act="login"]').addEventListener('click', submit);
}

// ===== Breadcrumb template loader + render =====
let BC_TPL=null;
async function ensureBreadcrumbTemplate(){
  if (BC_TPL) return BC_TPL;
  const html = await (await fetch('../../html/components/breadcrumb.html', {cache:'no-store'})).text();
  const box = document.createElement('div'); box.innerHTML = html;
  BC_TPL = box.querySelector('#ui-breadcrumb');
  document.body.appendChild(BC_TPL);
  return BC_TPL;
}

function breadcrumbFrom(items){
  const el = BC_TPL.content.firstElementChild.cloneNode(true);
  const list = el.querySelector('[data-list]');
  list.innerHTML = '';
  items.forEach((it, i) => {
    const li = document.createElement('li');
    const isLast = i === items.length - 1;
    if (!isLast && it.href){
      const a = document.createElement('a');
      a.href = it.href; a.textContent = it.label || '';
      li.appendChild(a);
    } else {
      const span = document.createElement('span');
      span.className = 'current'; span.textContent = it.label || '';
      span.setAttribute('aria-current','page');
      li.appendChild(span);
    }
    list.appendChild(li);
  });
  return el;
}

// ===== Breadcrumb config dùng chung =====
(function () {
  'use strict';

  const $ = (s, r = document) => r.querySelector(s);

  // Config cho từng page-key
  const BC_CONFIG = {
    // Trang lịch chiếu
    showtime: [
      { label: 'Trang chủ', href: 'index.html' },
      { label: 'Chọn suất chiếu' }
    ],

    // Trang chọn ghế
    seatmap: [
      { label: 'Trang chủ', href: 'index.html' },
      { label: 'Chọn suất chiếu', href: 'showtime.html' },
      { label: 'Chọn ghế' }
    ],

    // Trang bắp nước & combo
    concessions: [
      { label: 'Trang chủ', href: 'index.html' },
      { label: 'Chọn suất chiếu', href: 'showtime.html' },
      { label: 'Chọn ghế', href: 'seat-map.html' },
      { label: 'Bắp nước & Combo' }
    ],

    // Trang thanh toán
    payment: [
      { label: 'Trang chủ', href: 'index.html' },
      { label: 'Chọn suất chiếu', href: 'showtime.html' },
      { label: 'Chọn ghế', href: 'seat-map.html' },
      { label: 'Bắp nước & Combo', href: 'concessions.html' },
      { label: 'Thanh toán' }
    ],

    // Fallback chung
    default: [
      { label: 'Trang chủ', href: 'index.html' }
    ]
  };

  function detectPageKey() {
    const body = document.body;
    if (body && body.dataset.page) return body.dataset.page;

    // Fallback theo tên file nếu quên gắn data-page
    const path = location.pathname.toLowerCase();
    if (path.includes('concessions')) return 'concessions';
    if (path.includes('seat-map'))    return 'seatmap';
    if (path.includes('showtime'))    return 'showtime';
    if (path.includes('payment'))     return 'payment';
    return 'default';
  }

  function mountBreadcrumb(selector = '#bc') {
    const bc = $(selector);
    if (!bc) return;

    const key = bc.dataset.bc || detectPageKey();
    const items = BC_CONFIG[key] || BC_CONFIG.default;

    // Đảm bảo style đồng bộ .breadcrumb (giống concessions)
    bc.classList.remove('breadcrumb-wrap');
    bc.classList.add('breadcrumb');
    bc.setAttribute('aria-label', 'Bạn đang ở đây');

    // Render HTML
    const parts = [];
    items.forEach((it, idx) => {
      const isLast = idx === items.length - 1;
      const content = isLast || !it.href
        ? `<span>${it.label}</span>`
        : `<a href="${it.href}">${it.label}</a>`;

      parts.push(content);
      if (!isLast) parts.push('<span class="sep">/</span>');
    });

    bc.innerHTML = parts.join('');
  }

  // Expose ra global cho tất cả page dùng
  window.mountBreadcrumb = mountBreadcrumb;
})();


// xuất ra window để trang gọi
Object.assign(window, { mountBreadcrumb });

// ===== Pagination template loader + render =====
let PAG_TPL = null;
async function ensurePaginationTemplate(){
  if (PAG_TPL) return PAG_TPL;
  const html = await (await fetch('../../html/components/pagination.html', {cache:'no-store'})).text();
  const box  = document.createElement('div'); box.innerHTML = html;
  PAG_TPL = box.querySelector('#ui-pagination');
  document.body.appendChild(PAG_TPL);
  return PAG_TPL;
}

// sinh danh sách trang có dấu "..."
function buildPageList(totalPages, page, windowSize = 7){
  const pages = [];
  const clamp = (n,min,max)=>Math.max(min,Math.min(max,n));
  page = clamp(page,1,totalPages);
  if (totalPages <= windowSize){
    for (let i=1;i<=totalPages;i++) pages.push(i);
    return pages;
  }
  const head = [1,2];
  const tail = [totalPages-1,totalPages];
  const rangeStart = clamp(page-1, 3, totalPages-2);
  const range = [rangeStart-1, rangeStart, rangeStart+1].filter(x=>x>2 && x<totalPages-1);

  const add = (arr)=>arr.forEach(n=>{ if (!pages.includes(n)) pages.push(n); });
  add(head);
  if (range[0] > 3) pages.push('…');
  add(range);
  if (range.at(-1) < totalPages-2) pages.push('…');
  add(tail);
  return pages;
}

function paginationFrom({ total = 0, perPage = 12, page = 1 } = {}){
  const totalPages = Math.max(1, Math.ceil(total / perPage));
  const tpl = PAG_TPL.content.firstElementChild.cloneNode(true);
  const list = tpl.querySelector('[data-pages]');

  // build buttons
  list.innerHTML = '';
  const makeBtn = (label, value, current=false, disabled=false)=>{
    const li = document.createElement('li');
    const b  = document.createElement('button');
    b.textContent = label;
    if (value) b.dataset.page = value;
    if (current) b.classList.add('is-current');
    if (disabled) b.disabled = true;
    li.appendChild(b); list.appendChild(li);
  };

  buildPageList(totalPages, page).forEach(p=>{
    if (p === '…'){ const li=document.createElement('li'); const el=document.createElement('button');
      el.textContent='…'; el.className='ellipsis'; el.disabled=true; li.appendChild(el); list.appendChild(li); }
    else makeBtn(String(p), p, p===page);
  });

  // prev/next/first/last
  tpl.querySelector('[data-first]').disabled = page<=1;
  tpl.querySelector('[data-prev]').disabled  = page<=1;
  tpl.querySelector('[data-next]').disabled  = page>=totalPages;
  tpl.querySelector('[data-last]').disabled  = page>=totalPages;

  tpl.querySelector('[data-first]').dataset.page = 1;
  tpl.querySelector('[data-prev]').dataset.page  = Math.max(1, page-1);
  tpl.querySelector('[data-next]').dataset.page  = Math.min(totalPages, page+1);
  tpl.querySelector('[data-last]').dataset.page  = totalPages;

  // click handler: bắn sự kiện ra ngoài
  tpl.addEventListener('click', (e)=>{
    const b = e.target.closest('button'); if (!b || b.disabled) return;
    const to = Number(b.dataset.page || NaN); if (!to) return;
    tpl.dispatchEvent(new CustomEvent('page:change', { bubbles:true, detail:{ page: to } }));
  });

  return { el: tpl, totalPages };
}

// tiện lợi: mount vào 1 id + callback
async function mountPagination({ mountId='pager', total=0, perPage=12, page=1, onChange=null, syncQuery=false } = {}){
  const mount = document.getElementById(mountId); if (!mount) return;
  await ensurePaginationTemplate();

  const render = (p)=>{
    const { el, totalPages } = paginationFrom({ total, perPage, page: p });
    mount.replaceChildren(el);
    el.addEventListener('page:change', (ev)=>{
      const to = ev.detail.page;
      if (syncQuery){
        const url = new URL(location.href);
        url.searchParams.set('page', String(to));
        history.replaceState(null,'',url);
      }
      if (typeof onChange === 'function') onChange(to);
      render(to); // cập nhật UI sau khi chuyển
    }, { once: true });
  };
  render(page);
}

// export cho trang gọi
Object.assign(window, { mountPagination });

  // ====== Header / Footer includes ======
  async function mountHeader(){
    const mount = document.querySelector('#hdr-include');
    if (!mount) return;
    try {
      const res = await fetch('../../html/header.html', { cache: 'no-store', credentials: 'include' });
      mount.innerHTML = await res.text();
    } catch (e) {
      console.warn('[header] load fail', e);
    }
    const s = document.createElement('script');
    s.src = '../assets/js/header.js';             
    s.onload = s.onerror = () => {};
    document.body.appendChild(s);
  }

  async function mountFooter() {
    const footerContainer = document.querySelector("footer, #footer-include");
    if (!footerContainer) return;
    
    const res = await fetch("../../html/footer.html", { cache: "no-store" });
    const html = await res.text();
    footerContainer.outerHTML = html;

    // nếu có footer.js (giống header.js)
    if (!window.footerMounted) {
      const script = document.createElement("script");
      script.src = "../assets/js/footer.js";
      document.body.appendChild(script);
      window.footerMounted = true;
    }
  }

  // ====== Reveal on scroll ======
  const io = new IntersectionObserver((es)=>{
    es.forEach(en => { if(en.isIntersecting){ en.target.classList.add('is-visible'); io.unobserve(en.target); } });
  }, { threshold: .15 });
  document.addEventListener('DOMContentLoaded', () => $$('.reveal').forEach(el => io.observe(el)));

  // ====== Parallax (hero) ======
  function parallax(){
    const hero = $('.hero'), bg = $('#heroBackdrop'), vid = $('#heroVideo');
    if (!hero || !bg) return;
    const rect = hero.getBoundingClientRect();
    const p = Math.min(1, Math.max(0, (window.innerHeight - rect.top) / (window.innerHeight + rect.height)));
    const ty = (p * 18)|0;
    bg.style.transform = `translateY(${ty}px)`;
    if (vid) vid.style.transform = `translateY(${ty}px)`;
  }
  window.addEventListener('scroll', parallax, { passive:true });

  // ====== UI helpers ======
  const fmtStars = (r=0) => `⭐ ${Number(r||0).toFixed(1)}`;
function cardFrom(m, { showRating = false, showRelease = false } = {}) {

  // ===== Fallback khi không có template =====
  if (!MOVIE_TPL?.content?.firstElementChild) {
    const el = document.createElement('article');
    el.className = 'movie-card poster';
    el.textContent = m.title || 'Movie';

    el.addEventListener('click', (e) => {
      // Nếu đang kéo rail thì không điều hướng
      const rail = el.closest('.rail');
      if (rail && rail.dataset.isDragging === '1') {
        rail.dataset.isDragging = '0';
        e.preventDefault();
        e.stopPropagation();
        return;
      }

      if (m.id) {
        location.href = `movie-detail.html?movie=${encodeURIComponent(m.id)}`;
      }
    });

    return el;
  }

  // ===== Dùng template chuẩn =====
  const el = MOVIE_TPL.content.firstElementChild.cloneNode(true);
  el.dataset.id = m.id || '';

  // ===== Poster =====
  const img = el.querySelector('[data-img]');
  if (img) {
    const poster =
      m.posterUrl || m.poster ||
      m.backdropUrl || m.backdrop ||
      m.bannerUrl || m.banner || '';
    img.src = poster;
    img.alt = m.title || 'Poster';
    img.draggable = false;
  }

  // ===== Title =====
  const t = el.querySelector('[data-title]');
  if (t) {
    t.textContent =
      m.title ||
      m.movieName ||
      m.name ||
      '';
  }

  // ===== Director (hỗ trợ List<CastDTO> giống movie-detail) =====
  const d = el.querySelector('[data-director]');
  if (d) {
    let directorText = '';

    if (Array.isArray(m.director)) {
      directorText = m.director
        .map(x => x && (x.name || x.fullName || String(x)))
        .filter(Boolean)
        .join(', ');
    } else {
      directorText = m.director || m.directorName || '';
    }

    d.textContent = directorText ? `Đạo diễn: ${directorText}` : '';
  }

  // ===== Duration + (optional) release (đọc cả durationMin) =====
  const u = el.querySelector('[data-duration]');
  if (u) {
    const raw =
      m.duration ||
      m.runtime ||
      m.durationMin ||
      m.duration_min ||
      '';

    let durationText = '';
    if (raw) {
      const s = String(raw).trim();
      if (/^\d+$/.test(s)) {
        const mins = Number(s);
        const h = Math.floor(mins / 60);
        const rest = mins % 60;
        if (h && rest) durationText = `${h}h ${rest}m`;
        else if (h)    durationText = `${h}h`;
        else           durationText = `${rest}m`;
      } else {
        durationText = s;
      }
    }

    let releaseText = '';
    if (showRelease) {
      releaseText = m.releaseDate || m.release_date || '';
    }

    if (durationText && releaseText) {
      u.textContent = `${durationText} • ${releaseText}`;
    } else {
      u.textContent = durationText || releaseText || '';
    }
  }

  // ===== Rating =====
  const rate = el.querySelector('[data-rating]');
  if (rate) {
    if (showRating && (m.rating ?? null) !== null) {
      const num = Number(m.rating);
      const text = Number.isFinite(num) ? num.toFixed(1) : String(m.rating);
      rate.innerHTML = `⭐ ${text}/10`;
    } else {
      rate.innerHTML = '';
    }
  }

  // ===== Genres =====
  const gWrap = el.querySelector('[data-genres]');
  if (gWrap) {
    const genres = Array.isArray(m.genres)
      ? m.genres
      : (typeof m.genre === 'string' ? m.genre.split(',') : []);

    gWrap.innerHTML = '';
    genres
      .map(x => String(x).trim())
      .filter(Boolean)
      .slice(0, 4)
      .forEach(g => {
        const s = document.createElement('span');
        s.className = 'tag';
        s.textContent = g;
        gWrap.appendChild(s);
      });
  }

  // ===== Description =====
  const desc = el.querySelector('[data-desc]');
  if (desc) {
    desc.textContent = m.synopsis || m.description || m.desc || '';
  }

  // ===== Nút Trailer =====
  const btnT = el.querySelector('[data-trailer]');
  if (btnT) {
    const trailerUrl = m.trailerUrl || m.trailer || '';
    if (trailerUrl) {
      btnT.hidden = false;
      btnT.addEventListener('click', (e) => {
        // chặn bubble + chặn click khi đang kéo
        const rail = el.closest('.rail');
        if (rail && rail.dataset.isDragging === '1') {
          rail.dataset.isDragging = '0';
          e.preventDefault();
          e.stopPropagation();
          return;
        }

        e.preventDefault();
        e.stopPropagation();
        if (window.openTrailerModal) {
          window.openTrailerModal(trailerUrl);
        } else {
          window.open(trailerUrl, '_blank');
        }
      });
    } else {
      btnT.remove();
    }
  }

  // ===== Nút Đặt vé (only cho phim đang chiếu) =====
  const book = el.querySelector('[data-book]');
  if (book) {
    if (!showRating) {
      // Coming soon: không cho đặt vé
      book.remove();
    } else {
      const movieId = encodeURIComponent(m.id || '');
      book.hidden = false;
      book.href = movieId
        ? `showtime.html?movie=${movieId}`
        : `showtime.html`;

      // chặn click card + chặn khi đang kéo
      book.addEventListener('click', (e) => {
        const rail = el.closest('.rail');
        if (rail && rail.dataset.isDragging === '1') {
          rail.dataset.isDragging = '0';
          e.preventDefault();
          e.stopPropagation();
          return;
        }
        e.stopPropagation(); // chỉ cho anchor tự điều hướng
      });
    }
  }

  // ===== Click cả card -> chi tiết phim (trừ khi đang kéo) =====
  el.addEventListener('click', (e) => {
    // Nếu bấm vào Trailer/Book thì bỏ (đã handle riêng)
    if (e.target.closest('[data-trailer],[data-book]')) return;

    // Nếu đang kéo coverflow thì không điều hướng
    const rail = el.closest('.rail');
    if (rail && rail.dataset.isDragging === '1') {
      rail.dataset.isDragging = '0';
      e.preventDefault();
      e.stopPropagation();
      return;
    }

    if (m.id) {
      location.href = `movie-detail.html?movie=${encodeURIComponent(m.id)}`;
    }
  });

  return el;
}

// ===== Coverflow engine (BIG SCREEN) — 5 items + auto-snap =====
function initCoverflow(rail, dotsEl, baseLen){
  let cards = Array.from(rail.querySelectorAll('.movie-card, .poster')); // Hỗ trợ cả 2 class

  // Dots
  dotsEl.innerHTML = '';
  const dots = Array.from({length: baseLen}, (_,i)=>{
    const d = document.createElement('button');
    d.className = 'dot';
    d.setAttribute('aria-label', `Slide ${i+1}`);
    d.onclick = ()=>scrollToIndex(midStart + i);
    dotsEl.appendChild(d);
    return d;
  });

  const midStart = baseLen;
  let active = midStart;

  const getX = (i)=> cards[i].offsetLeft + cards[i].offsetWidth/2 - rail.clientWidth/2;

  let isProgrammatic = false;
  let programmaticTimer = null;
  const jump = (i)=>{ rail.scrollLeft = getX(i); };
  const snap = (i)=>{
    isProgrammatic = true;
    rail.scrollTo({ left: getX(i), behavior:'smooth' });
    clearTimeout(programmaticTimer);
    programmaticTimer = setTimeout(()=>{ isProgrammatic = false; }, 420);
  };

  // UPDATE: phong cách “main cũ” + spacing khít (phù hợp 5 poster)
  function update(){
    const rr = rail.getBoundingClientRect();
    const center = rr.left + rr.width/2;
    let bestI = 0, bestDist = 1e9;

    cards.forEach((c,i)=>{
      const r  = c.getBoundingClientRect();
      const cc = r.left + r.width/2;

      const dist = (cc - center) / r.width;    // 0 = giữa
      const d    = clamp(dist, -1.2, 1.2);
      const ad   = Math.abs(d);

      const rotY    = -d * 20;                 // nghiêng nhẹ
      const scale   = 1 - Math.min(0.16, ad * 0.12);
      const shiftX  = -d * 22;                 // nhỏ hơn để khít hơn
      const opacity = 1 - Math.min(0.30, ad * 0.26);
      const z       = 1000 - Math.floor(ad * 400);

      c.style.transform = `translateX(${shiftX}px) rotateY(${rotY}deg) scale(${scale})`;
      c.style.opacity   = String(opacity);
      c.style.zIndex    = String(z);
      c.classList.toggle('is-center', Math.abs(dist) < 0.33);

      if (Math.abs(dist) < bestDist){ bestDist = Math.abs(dist); bestI = i; }
    });

    if (active !== bestI){
      active = bestI;
      const baseIndex = Number(cards[active].dataset.baseIndex ?? (active % baseLen));
      dots.forEach((d,i)=>d.classList.toggle('active', i===baseIndex));
    }
  }

  function normalize(){
    if (active < baseLen)         { active += baseLen; jump(active); }
    else if (active >= 2*baseLen) { active -= baseLen; jump(active); }
  }

  function scrollToIndex(i){ snap(i); }
  function next(){ snap(active+1); setTimeout(normalize, 420); }
  function prev(){ snap(active-1); setTimeout(normalize, 420); }

  // --- Scroll handlers: update + auto-snap khi dừng cuộn ---
  let scrollEndTimer = null;
  rail.addEventListener('scroll', ()=>{
    update();
    if (isProgrammatic) return;
    clearTimeout(scrollEndTimer);
    scrollEndTimer = setTimeout(()=>{ normalize(); snap(active); }, 140); // tự vào nấc
  }, {passive:true});
  window.addEventListener('resize', update);

  // [SỬA LỖI] Drag / touch + cờ isDragging
  let down=false, sx=0, sl=0;
  const start=e=>{
    down=true;
    rail.classList.add('dragging');
    rail.dataset.isDragging = '0';
    sx=('touches'in e?e.touches[0].clientX:e.clientX);
    sl=rail.scrollLeft;
  };
  const move =e=>{
    if(!down) return;
    rail.dataset.isDragging = '1';
    const x=('touches'in e?e.touches[0].clientX:e.clientX);
    rail.scrollLeft = sl - (x - sx);
  };
  const stop =()=>{
    if(!down) return;
    down=false;
    rail.classList.remove('dragging');
    normalize(); snap(active);  // thả tay cũng snap
  };
  // [SỬA LỖI] Đổi 'pointerdown' -> 'mousedown'
  rail.addEventListener('mousedown', start);
  rail.addEventListener('mousemove',  move);
  window.addEventListener('mouseup',  stop);
  
  rail.addEventListener('touchstart', start, {passive:true});
  rail.addEventListener('touchmove',  move,  {passive:true});
  rail.addEventListener('touchend',   stop);

  // Scroll bằng wheel: đổi cuộn dọc -> ngang
  rail.addEventListener('wheel', (e)=>{
    if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
      e.preventDefault();
      rail.scrollBy({ left: e.deltaY, behavior:'smooth' });
    }
  }, { passive:false });

  requestAnimationFrame(update);
  return { next, prev, scrollToIndex:(i)=>snap(i), normalize };
}
  // ====== Fetch with fallback ======
  async function fetchWithFallback(apiPath, fallbackFile) {
    try {
      const res = await fetch(apiPath);
      if (!res.ok) throw new Error("API not available");
      return await res.json();
    } catch (err) {
      console.warn(`⚠️ API ${apiPath} lỗi, dùng fallback ${fallbackFile}`);
      const res = await fetch(`../../data/${fallbackFile}`);
      return await res.json();
    }
  }

  // ====== Data loaders ======
  async function loadHero(){
    const t = $('#heroTitle'), de = $('#heroDesc'), lb = $('#heroEyebrow');
    const bg = $('#heroBackdrop'), cta = $('#heroCta'), btn = $('#heroTrailerBtn'), vid = $('#heroVideo');
    try{
      const res = await fetch(`${API}/home/hero`, { cache:'no-store' });
      const d = await res.json();
      t.textContent = d.title || 'Experience the Magic of Cinema with D-cine';
      de.textContent = d.description || 'Watch the latest blockbusters and book your favorite seats in seconds.';
      lb.textContent = d.label || 'Now streaming';
      if (d.imageUrl) bg.style.backgroundImage = `url('${d.imageUrl}')`;
      if (d.ctaHref) cta.href = d.ctaHref;
      if (d.trailerUrl) btn.addEventListener('click', () => {
  if (window.openTrailerModal) openTrailerModal(d.trailerUrl);
  else window.open(d.trailerUrl,'_blank'); 
}, { once:true });
      if (d.videoUrl){ vid.src = d.videoUrl; vid.addEventListener('loadeddata', ()=> vid.style.opacity = 1, { once:true }); }
    }catch{/* silent */}
  }

  // Coverflow: ON THE BIG SCREEN
  async function loadOnTheBigScreen(){
    const wrap = $('#bigscreen .carousel');
    const rail = $('#railBigScreen');
    const dots = $('#dotsBigScreen');
    if(!wrap || !rail || !dots) return;
    await ensureMovieTpl(); // [SỬA LỖI] Đổi tên hàm
    let base = [];
    try{
      const res = await fetch(`${API}/movies/now`, { cache:'no-store' });
      if(res.ok) base = await res.json();
    }catch{}
  if (!base.length) {
    try {
      const r2 = await fetch('../../data/movies.json', { cache: 'no-store', credentials: 'include' });
      if (r2.ok) {
        const j = await r2.json();
        if (Array.isArray(j)) {
          // nếu movies.json là mảng -> tách now/soon theo status/ngày
          const today = new Date().toISOString().slice(0,10);
          base = j.filter(m => {
            const tag = (m.status || '').toLowerCase();
            if (tag === 'now' || tag === 'dangchieu' || tag === 'đang chiếu') return true;
            if (m.releaseDate && m.releaseDate <= today) return true;
            return false;
          });
        } else {
          base = Array.isArray(j?.now) ? j.now : [];
        }
      }
    } catch {}
  }

    if(!base.length){
      base = Array.from({length:8}, (_,i)=>({
        id:`n${i+1}`,
        title:`Now ${i+1}`,
        posterUrl:`https://picsum.photos/seed/now${i}/520/720`,
        rating:(7.2+Math.random()*2).toFixed(1),
        trailerUrl:''
      }));
    }
    base = base.slice(0, 8);
    const originalBaseLen = base.length;
    while(base.length < 8) base = base.concat(base);
    const view = base.concat(base, base);

  rail.innerHTML = '';
view.forEach((m, idx) => {
  const a = cardFrom(m, { showRating: true, showRelease: false });
  a.dataset.baseIndex = String(idx % originalBaseLen);
  rail.appendChild(a);
});

    const api = initCoverflow(rail, dots, originalBaseLen);
    const left  = wrap.querySelector('.arrow.left');
    const right = wrap.querySelector('.arrow.right');
    if(left)  left.onclick  = ()=>{ api.prev();  setTimeout(api.normalize, 420); };
    if(right) right.onclick = ()=>{ api.next();  setTimeout(api.normalize, 420); };
    api.scrollToIndex(originalBaseLen);
  }

  // Coverflow: COMING SOON
  async function loadComingSoon(){
    const wrap = $('#coming .carousel');
    const rail = $('#railComingSoon');
    const dots = $('#dotsComingSoon');
    if(!wrap || !rail || !dots) return;
    await ensureMovieTpl(); // [SỬA LỖI] Đổi tên hàm
    let base = [];
    try{
      const res = await fetch(`${API}/movies/soon`, { cache:'no-store' });
      if(res.ok) base = await res.json();
    }catch{}

 if (!base.length) {
    try {
      const r2 = await fetch('../../data/movies.json', { cache: 'no-store', credentials: 'include' });
      if (r2.ok) {
        const j = await r2.json();
        if (Array.isArray(j)) {
          const today = new Date().toISOString().slice(0,10);
          base = j.filter(m => {
            const tag = (m.status || '').toLowerCase();
            if (tag === 'soon' || tag === 'sapchieu' || tag === 'sắp chiếu') return true;
            if (m.releaseDate && m.releaseDate > today) return true;
            return false;
          });
        } else {
          base = Array.isArray(j?.soon) ? j.soon : [];
        }
      }
    } catch {}
  }

    if(!base.length){
      base = Array.from({length:8}, (_,i)=>({
        id:`s${i+1}`,
        title:`Soon ${i+1}`,
        posterUrl:`https://picsum.photos/seed/soon${i}/520/720`,
        trailerUrl:'',
        releaseDate:`2025-12-${(i%9)+1}`
      }));
    }
    
    // [SỬA LỖI] Thêm slice(0, 8) để sửa lỗi nhiều dots
    base = base.slice(0, 8); 
    
    const originalBaseLen = base.length;
    while(base.length < 8) base = base.concat(base);
    const view = base.concat(base, base);

    rail.innerHTML = '';
    view.forEach((m,idx)=>{
      const a = cardFrom(m, { showRating:false, showRelease:true });
      a.dataset.baseIndex = String(idx % originalBaseLen);
      rail.appendChild(a);
    });

    const api = initCoverflow(rail, dots, originalBaseLen);
    const left  = wrap.querySelector('.arrow.left');
    const right = wrap.querySelector('.arrow.right');
    if(left)  left.onclick  = ()=>{ api.prev();  setTimeout(api.normalize, 420); };
    if(right) right.onclick = ()=>{ api.next();  setTimeout(api.normalize, 420); };
    api.scrollToIndex(originalBaseLen);
  }

async function loadDealsCarousel() {
  const wrap = document.getElementById('wrapDeals');
  const rail = document.getElementById('railDeals');
  if (!wrap || !rail) return;

  await ensurePromoCardTemplate();

  let data = [];

  // 1) Ưu tiên gọi BE – ghép từ bảng voucher + membership_tier
  try {
    const res = await fetch(`${API}/promotions`, { cache: 'no-store', credentials: 'include' });
    if (res.ok) {
      const json = await res.json();
      if (Array.isArray(json)) data = json;
      else if (Array.isArray(json.items)) data = json.items;
      else if (Array.isArray(json.deals)) data = json.deals;
    }
  } catch (err) {
    console.warn('[Deals] API /deals lỗi, fallback JSON', err);
  }

  // 2) Fallback đọc từ file JSON cục bộ (xuất từ DB)
  if (!data.length) {
    try {
      const r2 = await fetch('./assets/data/promotions.json', { cache: 'no-store', credentials: 'include' });
      if (r2.ok) {
        const json2 = await r2.json();
        if (Array.isArray(json2)) data = json2;
        else if (Array.isArray(json2.items)) data = json2.items;
        else if (Array.isArray(json2.promotions)) data = json2.promotions;
      }
    } catch (err2) {
      console.warn('[Deals] Fallback promotions.json lỗi', err2);
    }
  }

  if (!data.length) {
    data = [
      {
        id: 'WELCOME10',
        voucherId: 1,
        code: 'WELCOME10',
        title: 'WELCOME10 – Giảm 10% cho thành viên mới',
        description:
          'Giảm 10% cho hoá đơn từ 100.000đ. Áp dụng cho hạng Standard trở lên.',
        type: 'PERCENT',
        value: 10,
        minOrder: 100000,
        membershipTierId: 1,
        membershipTierName: 'Standard',
        endAt: '2025-12-31'
      },
      {
        id: 'SILVER20K',
        voucherId: 2,
        code: 'SILVER20K',
        title: 'SILVER20K – Ưu đãi 20.000đ cho hạng Silver',
        description:
          'Giảm trực tiếp 20.000đ cho hoá đơn từ 150.000đ. Chỉ dành cho hạng Silver.',
        type: 'AMOUNT',
        value: 20000,
        minOrder: 150000,
        membershipTierId: 2,
        membershipTierName: 'Silver',
        endAt: '2025-12-31'
      },
      {
        id: 'GOLD15',
        voucherId: 3,
        code: 'GOLD15',
        title: 'GOLD15 – Giảm 15% cho hạng Gold',
        description:
          'Giảm 15% cho hoá đơn từ 200.000đ. Ưu tiên cho thành viên Gold.',
        type: 'PERCENT',
        value: 15,
        minOrder: 200000,
        membershipTierId: 3,
        membershipTierName: 'Gold',
        endAt: '2025-12-31'
      },
      {
        id: 'SUMMER25',
        voucherId: 4,
        code: 'SUMMER25',
        title: 'SUMMER25 – Ưu đãi mùa hè 25%',
        description:
          'Flash sale mùa hè – giảm 25% cho mọi hạng thành viên, đơn từ 100.000đ.',
        type: 'PERCENT',
        value: 25,
        minOrder: 100000,
        membershipTierId: null,
        membershipTierName: 'Tất cả hạng',
        endAt: '2025-08-31'
      },
      {
        id: 'MOVIE50K',
        voucherId: 5,
        code: 'MOVIE50K',
        title: 'MOVIE50K – Giảm 50.000đ cho mọi hạng',
        description:
          'Giảm 50.000đ cho hoá đơn từ 250.000đ. Áp dụng cho tất cả thành viên.',
        type: 'AMOUNT',
        value: 50000,
        minOrder: 250000,
        membershipTierId: null,
        membershipTierName: 'Tất cả hạng',
        endAt: '2025-06-30'
      }
    ];
  }

const items = data
  .map((raw) => {
    const isPercent = (raw.type || '').toUpperCase() === 'PERCENT';
    const val = Number(raw.value ?? raw.discountValue) || 0;
    const minOrder = raw.minOrder ?? raw.min_order ?? 0;
    const tierName =
      raw.membershipTierName ||
      raw.tierName ||
      raw.tier_name ||
      raw.appliesTo ||
      '';

    const code = raw.code || raw.voucherCode || raw.id;
    const discountText = isPercent ? `${val}%` : fmtVND(val);

    let desc =
      raw.desc ||
      raw.description ||
      (discountText ? `Giảm ${discountText}` : '');

    if (minOrder) desc += ` cho đơn từ ${fmtVND(minOrder)}`;
    if (tierName) desc += ` • Hạng ${tierName}`;

    return {
      id: raw.id || code,
      code,
      title: raw.title || raw.name || (code ? `Mã ${code}` : 'Ưu đãi thành viên'),
      desc,
      imageUrl: raw.imageUrl || raw.bannerUrl || raw.img,
      tag: raw.tag || tierName || 'Voucher thành viên',
      badge: raw.badge || (discountText ? (isPercent ? `-${discountText}` : 'VOUCHER') : ''),
      validUntil:
        raw.validUntil || raw.validTo || raw.valid_to || raw.endAt || raw.end_at,
      href: raw.href,
    };
  })
  .filter(Boolean);


  if (!items.length) {
    rail.innerHTML = '<p class="empty-text">Hiện chưa có ưu đãi khả dụng.</p>';
    return;
  }

  const prev = wrap.querySelector('.nav.prev');
  const next = wrap.querySelector('.nav.next');
  const dotsWrap = wrap.querySelector('.dots');

  const perPage = 3;
  const totalPages = Math.max(1, Math.ceil(items.length / perPage));
  let pageIndex = 0;

  function renderPage() {
    rail.innerHTML = '';
    const start = pageIndex * perPage;
    const slice = items.slice(start, start + perPage);
    slice.forEach((p) => {
      const card = promoCardFromData(p);
      if (card) rail.appendChild(card);
    });

    if (dotsWrap) {
      const dots = dotsWrap.querySelectorAll('button.dot');
      dots.forEach((d, idx) => {
        d.classList.toggle('active', idx === pageIndex);
      });
    }
  }

  function buildDots() {
    if (!dotsWrap) return;
    dotsWrap.innerHTML = '';
    for (let i = 0; i < totalPages; i++) {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'dot';
      if (i === pageIndex) b.classList.add('active');
      b.addEventListener('click', () => {
        pageIndex = i;
        renderPage();
      });
      dotsWrap.appendChild(b);
    }
  }

  function go(delta) {
    if (!totalPages) return;
    pageIndex = (pageIndex + delta + totalPages) % totalPages;
    renderPage();
  }

  if (prev) {
    prev.addEventListener('click', (e) => {
      e.preventDefault();
      go(-1);
    });
  }
  if (next) {
    next.addEventListener('click', (e) => {
      e.preventDefault();
      go(1);
    });
  }

  buildDots();
  renderPage();
}



  // === Combos grid ===
  async function loadCombos(mode='concessions'){
    const wrap = document.getElementById('gridCombos'); if (!wrap) return;
    await ensureComboItemTemplate();

    const API = window.API_BASE || '/api';
    let data = [];
    try{
      const res = await fetch(`${API}/concessions/combos`, {
  cache: 'no-store',
  credentials: 'include'
});

      if (res.ok) data = await res.json();
    }catch{}

    if (!Array.isArray(data) || data.length===0){
      data = [
        { id:'m1', title:'Combo M1: 1 bắp + 1 nước', desc:'Bắp bơ + Coca 500ml',
          price:49000, oldPrice:65000, tag:'BEST VALUE',
          imageUrl:'https://picsum.photos/seed/pop1/420/280',
          variants:[{label:'M',value:'M'},{label:'L',value:'L(+6k)'}] },
        { id:'m2', title:'Combo M2: 2 bắp + 2 nước', desc:'Tiết kiệm đi nhóm',
          price:89000, oldPrice:120000, imageUrl:'https://picsum.photos/seed/pop2/420/280' }
      ];
    }
    wrap.innerHTML = '';
    data.forEach(c => wrap.appendChild(comboItemFromData(c, {mode})));
  }

// ====== MEMBER SECTION: LOGIC TÍCH ĐIỂM & GIẢM GIÁ ======
async function enhanceMember() {
  const wrap = document.querySelector('#member .member-v2');
  if (!wrap) return;

  // Các element hiển thị
  const els = {
    btns: wrap.querySelectorAll('.tier-tab'),
    price: document.getElementById('tierPrice'),
    cardName: document.getElementById('cardTierName'),
    perksList: document.getElementById('loyaltyPerks'),
    userTier: document.getElementById('loyaltyTierName'),
    userPts: document.getElementById('loyaltyPoints'),
    progFill: document.getElementById('loyaltyProgressFill'),
    progTxt: document.getElementById('loyaltyProgressText')
  };


  const TIERS = {
    STANDARD: {
      label: 'Standard',
      min: 0,
      perks: [
        'Hạng thành viên mặc định',
        'Tích lũy điểm chi tiêu để thăng hạng'
      ]
    },
    SILVER: {
      label: 'Silver',
      min: 1000000, 
      perks: [
        'Đạt mốc chi tiêu 1.000.000đ',
        'GIẢM 5% trên tổng hóa đơn'
      ]
    },
    GOLD: {
      label: 'Gold',
      min: 3000000,
      perks: [
        'Đạt mốc chi tiêu 3.000.000đ',
        'GIẢM 10% trên tổng hóa đơn'
      ]
    }
  };
  let beTiers = [];
  const API = window.API_BASE || '/api';

  try {
    const res = await fetch(`${API}/memberships`, { cache: 'no-store', credentials: 'include' });
    if (res.ok) {
      beTiers = await res.json();
    }
  } catch (e) {
    console.warn('[Member] /memberships lỗi, dùng config cứng:', e);
  }

  if (Array.isArray(beTiers) && beTiers.length) {
    const map = {};

    beTiers.forEach(t => {
      const key = (t.name || '').trim().toUpperCase();
      if (!key) return;

      map[key] = {
        label: t.name,
        min: t.minSpent ?? 0,
        perks: [
          t.description || '',
          t.pointRate != null ? `Tích điểm x${t.pointRate}` : ''
        ].filter(Boolean)
      };
    });
    Object.keys(map).forEach(key => {
      if (!TIERS[key]) TIERS[key] = {};

      TIERS[key].label = map[key].label || TIERS[key].label || key;
      TIERS[key].min   = map[key].min   ?? TIERS[key].min ?? 0;

      if (map[key].perks.length) {
        TIERS[key].perks = map[key].perks;
      }
    });
  }
  const checkIcon = `<svg viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>`;
  const fmt = n => n.toLocaleString('vi-VN') + 'đ';
  function uiSwitchTab(key) {
    const t = TIERS[key];
    if (!t) return;

    wrap.setAttribute('data-theme', key);
    if (els.cardName) els.cardName.textContent = t.label;
    if (els.price) {
        els.price.textContent = t.min === 0 ? 'Mức khởi điểm' : `Cần tích lũy ${fmt(t.min)}`;
    }
    if (els.perksList) {
        els.perksList.innerHTML = t.perks.map(p => `<li>${checkIcon}${p}</li>`).join('');
    }
    els.btns.forEach(b => b.classList.toggle('active', b.dataset.tier === key));
  }
  const userSpent = 1200000; 
  
  let currentTierKey = 'STANDARD';
  if (userSpent >= TIERS.GOLD.min) currentTierKey = 'GOLD';
  else if (userSpent >= TIERS.SILVER.min) currentTierKey = 'SILVER';
  if (els.userTier) els.userTier.textContent = TIERS[currentTierKey].label;
  if (els.userPts) els.userPts.textContent = fmt(userSpent);

  let nextGoal = 0;
  let nextLabel = '';

  if (currentTierKey === 'STANDARD') {
      nextGoal = TIERS.SILVER.min;
      nextLabel = 'Silver';
  } else if (currentTierKey === 'SILVER') {
      nextGoal = TIERS.GOLD.min;
      nextLabel = 'Gold';
  }

  if (nextGoal > 0) {
      const percent = Math.min(100, (userSpent / nextGoal) * 100);
      
      if (els.progFill) els.progFill.style.width = `${percent}%`;
      
      const remain = nextGoal - userSpent;
      if (els.progTxt) {
        els.progTxt.innerHTML = `Bạn cần chi thêm <b style="color:#fff">${fmt(remain)}</b> để lên hạng ${nextLabel} (Giảm ${nextLabel === 'Silver' ? '5%' : '10%'})`;
      }
  } else {
      if (els.progFill) els.progFill.style.width = '100%';
      if (els.progTxt) els.progTxt.textContent = 'Bạn đang hưởng mức giảm giá cao nhất (10%)!';
  }

  els.btns.forEach(btn => {
    btn.addEventListener('click', () => uiSwitchTab(btn.dataset.tier));
  });
  uiSwitchTab(currentTierKey);
}

function initSimpleCarousel(wrap, { itemSelector = '.deal' } = {}) {
  if (!wrap) return;
  const rail = wrap.querySelector('.rail'); if (!rail) return;
  const prev = wrap.querySelector('.nav.prev');
  const next = wrap.querySelector('.nav.next');
  const dotsWrap = wrap.querySelector('.dots');

  const getItems = () => Array.from(rail.querySelectorAll(itemSelector));
  const gap = parseFloat(getComputedStyle(rail).columnGap || getComputedStyle(rail).gap || 24) || 24;

function buildDots() {
  if (!dotsWrap) return;
  dotsWrap.innerHTML = '';
  getItems().forEach((_, i) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'dot';            
    b.addEventListener('click', () => scrollToIndex(i));
    dotsWrap.appendChild(b);
  });
  updateDots();
}
async function getJSON(urlApi, localPath, pick) {
  try {
    const r = await fetch(urlApi, {
      cache: 'no-store',
      credentials: 'include'   
    });
    if (r.ok) {
      const j = await r.json();
      return typeof pick === 'function' ? pick(j) : j;
    }
  } catch {}

  if (!localPath) return null; 

  const r2 = await fetch(localPath, { cache: 'no-store' });
  const j2 = await r2.json();
  return typeof pick === 'function' ? pick(j2) : j2;
}

function splitMovies(arr){
  const now=[], soon=[], today = new Date().toISOString().slice(0,10);
  arr.forEach(m=>{
    const tag = (m.status||'').toLowerCase();
    if (tag==='now'||tag==='dangchieu'||tag==='đang chiếu') now.push(m);
    else if (tag==='soon'||tag==='sapchieu'||tag==='sắp chiếu') soon.push(m);
    else if (m.releaseDate && m.releaseDate>today) soon.push(m);
    else now.push(m);
  });
  return {now, soon};
}

  function getCardWidth() {
    const first = rail.querySelector(itemSelector);
    if (!first) return rail.clientWidth;
    return first.getBoundingClientRect().width + gap;
  }
  function currentIndex() {
    return Math.round(rail.scrollLeft / getCardWidth());
  }
  function scrollToIndex(i) {
    rail.scrollTo({ left: i * getCardWidth(), behavior: 'smooth' });
    updateDots(i);
  }
  function updateDots(i = currentIndex()) {
    if (!dotsWrap) return;
    dotsWrap.querySelectorAll('button').forEach((d, idx) =>
      d.classList.toggle('active', idx === i));
  }
  prev && prev.addEventListener('click', (e) => {
    e.preventDefault(); 
    scrollToIndex(Math.max(0, currentIndex() - 1));
  });
  next && next.addEventListener('click', (e) => {
    e.preventDefault(); 
    scrollToIndex(currentIndex() + 1);
  });
  rail.addEventListener('wheel', (e) => {
    if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
      e.preventDefault();
      rail.scrollBy({ left: e.deltaY, behavior: 'smooth' });
    }
  }, { passive: false });

let isDown = false, startX = 0, startLeft = 0, dragMoved = false, dragTO;

const startDrag = (e) => {
  isDown = true; dragMoved = false;
  startX = ('touches' in e ? e.touches[0].pageX : e.pageX);
  startLeft = rail.scrollLeft;
  rail.classList.add('is-grabbing');
  rail.dataset.isDragging = '0';
  if (e.target.tagName === 'IMG') e.preventDefault();
};

const moveDrag = (e) => {
  if (!isDown) return;
  if (e.type === 'touchmove') e.preventDefault(); 

  const x = ('touches' in e ? e.touches[0].pageX : e.pageX);
  const dx = x - startX;
  if (Math.abs(dx) > 3) {
    dragMoved = true;
    rail.dataset.isDragging = '1';
  }
  rail.scrollLeft = startLeft - dx;
  clearTimeout(dragTO);
  dragTO = setTimeout(() => { rail.dataset.isDragging = '0'; }, 120);
};

const stopDrag = () => {
  if (!isDown) return;
  isDown = false; rail.classList.remove('is-grabbing');
    if (dragMoved) {
    const i = currentIndex();
    scrollToIndex(i);
  }
};

rail.addEventListener('mousedown', startDrag);
document.addEventListener('mousemove', moveDrag); 
document.addEventListener('mouseup', stopDrag);   

rail.addEventListener('touchstart', startDrag, { passive: false });
document.addEventListener('touchmove', moveDrag, { passive: false });
document.addEventListener('touchend', stopDrag);
let scrollSnapTO;

rail.addEventListener('scroll', () => {
  updateDots();
  if (isDown) return;

  clearTimeout(scrollSnapTO);
  scrollSnapTO = setTimeout(() => {
    const i = currentIndex();
    scrollToIndex(i);
  }, 140);
});

  buildDots();
}

document.addEventListener('DOMContentLoaded', async () => {
    await mountHeader();
    await mountFooter();
    document.body.classList.add('ready');
    if (document.querySelector('#hero')) loadHero();
    loadOnTheBigScreen();
    loadComingSoon();
    loadDealsCarousel();
    enhanceMember();
    parallax();
  });
Object.assign(window, {
  ensureModalTemplate,
  openModal,
  closeModal,
  openTrailerModal,
  openConfirm,
  openQuickLogin
});
// Global handler: Trailer / Quick Login / Confirm
document.addEventListener('click', async (e) => {
  const t = e.target.closest('[data-trailer-url],[data-open-login],[data-confirm]');
  if (!t) return;

  if (t.hasAttribute('data-trailer-url')) {
    e.preventDefault();
    e.stopPropagation();
    const url = t.getAttribute('data-trailer-url');
    if (!url) return;
    if (window.openTrailerModal) window.openTrailerModal(url);
    else window.open(url, '_blank');
    return;
  }

  if (t.hasAttribute('data-open-login')) {
    e.preventDefault();
    e.stopPropagation();
    if (window.openQuickLogin) window.openQuickLogin();
    return;
  }

  if (t.hasAttribute('data-confirm')) {
    e.preventDefault();
    e.stopPropagation();
    if (window.openConfirm) {
      const ok = await window.openConfirm({
        title: t.getAttribute('data-title') || 'Xác nhận',
        message: t.getAttribute('data-message') || 'Bạn chắc chứ?'
      });
      if (ok) console.log('Confirmed');
    }
  }
});

})();