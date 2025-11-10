(() => {
  'use strict';

  // ====== Helpers ======
  const $  = (s, r=document) => r.querySelector(s);
  const $$ = (s, r=document) => [...r.querySelectorAll(s)];
  const API = window.API_BASE || '/api';
  const clamp = (n,min,max)=>Math.max(min,Math.min(max,n));
  const throttle=(fn,ms=16)=>{ let t=0; return (...a)=>{ const n=Date.now(); if(n-t>ms){ t=n; fn(...a);} } };

  // ====== [ĐÃ SỬA] Movie-card template loader (lấy từ movies.js) ======
  let MOVIE_TPL = null;
  async function ensureMovieTpl() {
    if (MOVIE_TPL) return MOVIE_TPL;
    try {
      // [SỬA LỖI] Sửa đường dẫn file
      const res = await fetch('../../html/components/movie-card.html', { cache: 'no-store' });
      if (!res.ok) return null;
      const html = await res.text();
      const box  = document.createElement('div'); box.innerHTML = html;
      MOVIE_TPL  = box.querySelector('#movie-card');
      if (MOVIE_TPL) document.body.appendChild(MOVIE_TPL);
    } catch {}
    if (!MOVIE_TPL) console.warn('[movie-card] không tìm thấy template');
    return MOVIE_TPL;
  }

  // ====== Promo-card template loader (once) ======
  let PROMO_TPL = null;

  async function ensurePromoCardTemplate() {
    if (PROMO_TPL) return PROMO_TPL;
    const res = await fetch('../../html/components/promo-card.html', { cache: 'no-store' });
    const html = await res.text();
    const holder = document.createElement('div'); holder.innerHTML = html;
    PROMO_TPL = holder.querySelector('#promo-card');
    if (PROMO_TPL) document.body.appendChild(PROMO_TPL);
    return PROMO_TPL;
  }

  function promoCardFromData(p) {
    const el = PROMO_TPL.content.firstElementChild.cloneNode(true);
    el.classList.add('deal');
    el.dataset.id = p.id || '';
    if (p.href) el.dataset.href = p.href;

    const bg = el.querySelector('[data-img]');
    if (bg && p.imageUrl) bg.style.backgroundImage = `url('${p.imageUrl}')`;

    const t = el.querySelector('[data-title]'); if (t) t.textContent = p.title || '';
    const d = el.querySelector('[data-desc]');  if (d) d.textContent = p.desc  || '';

    const tag = el.querySelector('[data-tag]'); if (tag && p.tag){ tag.textContent = p.tag; tag.hidden = false; }
    const b   = el.querySelector('[data-badge]'); if (b && p.badge){ b.textContent = p.badge; b.hidden = false; }
    const v   = el.querySelector('[data-valid]'); if (v && p.validUntil){ v.textContent = `HSD: ${p.validUntil}`; v.hidden = false; }

    const cta = el.querySelector('[data-cta]');
    if (cta) { cta.href = p.href || '#'; cta.textContent = p.ctaText || 'Nhận ưu đãi'; }

el.addEventListener('click', (e) => {
  // Nếu bấm đúng nút CTA thì cho đi như cũ
  if (e.target.closest('a.btn')) return;

  // [FIX] Nếu vừa kéo thì KHÔNG điều hướng
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
    const res = await fetch(`${API}/notifications?limit=${limit}`, { cache:'no-store' });
    if (res.ok) data = await res.json();
  }catch{}

  // Dummy khi chưa có BE
  if (!Array.isArray(data) || data.length === 0){
    data = [
      { id:'n1', title:'Vé DC-123456 đã xác nhận', text:'Bạn hãy đến rạp trước 10 phút.',
        tag:'ĐƠN HÀNG', icon:'🎟', createdAt: new Date().toISOString(), href:'confirmation.html', unread:true },
      { id:'n2', title:'Ưu đãi thành viên Gold', text:'Tặng 1 vé khi tích 5 vé trong tháng này.',
        tag:'THÀNH VIÊN', icon:'⭐', createdAt: new Date(Date.now()-7200000).toISOString(), href:'promotions.html', unread:false },
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
    const res = await fetch('components/modal.html', { cache: 'no-store' });
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

/* Render tiện lợi:
   mountBreadcrumb({ mountId:'bc', items:[{label:'Trang chủ',href:'index.html'},{label:'Phim'}] })
   hoặc auto từ pathname nếu bỏ 'items'
*/
async function mountBreadcrumb({ mountId='bc', items=null } = {}){
  const mount = document.getElementById(mountId); if (!mount) return;
  await ensureBreadcrumbTemplate();

  // auto build nếu không truyền items
  if (!items){
    const map = {
      'index.html':'Trang chủ',
      'movies.html':'Phim',
      'movie-detail.html':'Chi tiết phim',
      'showtime.html':'Lịch chiếu',
      'seat-map.html':'Chọn ghế',
      'concessions.html':'Combo bắp nước',
      'cart.html':'Giỏ hàng',
      'payment.html':'Thanh toán',
      'confirmation.html':'Xác nhận',
      'promotions.html':'Khuyến mãi',
      'theaters.html':'Rạp',
      'profile.html':'Hồ sơ',
      'notifications.html':'Thông báo'
    };
    const path = location.pathname.split('/').pop() || 'index.html';
    const label = map[path] || document.title || 'Trang hiện tại';
    items = [{ label:'Trang chủ', href:'index.html' }, { label }];
  }

  mount.replaceChildren(breadcrumbFrom(items));
}

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
      const res = await fetch('../../html/header.html', { cache: 'no-store' });
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

  // ===== [ĐÃ SỬA] Thay thế posterItem bằng cardFrom từ movies.js =====
function cardFrom(m, { showRating = false, showRelease = false } = {}) {
  if (!MOVIE_TPL?.content?.firstElementChild) {
    const el = document.createElement('article');
    el.className = 'poster card';
    el.innerHTML = '...';
    return el;
  }

  const el = MOVIE_TPL.content.firstElementChild.cloneNode(true);
  el.dataset.id = m.id ?? '';

  // Poster
  const img = el.querySelector('[data-img]');
  if (img) {
    img.src = m.posterUrl || m.poster || '';
    img.alt = m.title || 'Poster';
    img.draggable = false;
  }

  // Title, director
  const t = el.querySelector('[data-title]');
  if (t) t.textContent = m.title || '';

  const d = el.querySelector('[data-director]');
  if (d) d.textContent = m.director ? `Directed by ${m.director}` : '';

  // Duration + (optional) release
  const u = el.querySelector('[data-duration]');
  if (u) {
    let durationText = '';
    const durationVal = m.duration || m.runtime || '';
    if (durationVal) {
      durationText = /^\d+$/.test(String(durationVal).trim())
        ? `${durationVal} phút`
        : durationVal;
    }

    let releaseText = '';
    if (showRelease && m.releaseDate) {
      releaseText = m.releaseDate;
    }

    if (durationText && releaseText) {
      u.textContent = `${durationText} • ${releaseText}`;
    } else {
      u.textContent = durationText || releaseText;
    }
  }

  // Rating
  const rate = el.querySelector('[data-rating]');
  if (rate) {
    if (showRating && (m.rating ?? null) !== null) {
      rate.innerHTML = `⭐ ${Number(m.rating || 0).toFixed(1)}/10`;
    } else {
      rate.innerHTML = '';
    }
  }

  // data-release (không dùng trực tiếp -> bỏ)
  const rel = el.querySelector('[data-release]');
  if (rel) rel.remove();

  // Genres
  const gWrap = el.querySelector('[data-genres]');
  if (gWrap) {
    const genres = Array.isArray(m.genres)
      ? m.genres
      : (typeof m.genre === 'string' ? m.genre.split(',') : []);
    gWrap.innerHTML = '';
    genres.map(x => String(x).trim()).filter(Boolean).slice(0, 4).forEach(g => {
      const s = document.createElement('span');
      s.className = 'tag';
      s.textContent = g;
      gWrap.appendChild(s);
    });
  }

  // Description
  const s = el.querySelector('[data-desc]');
  if (s) s.textContent = m.synopsis || m.description || m.desc || '';

const btnT = el.querySelector('[data-trailer]');
if (btnT) {
  const trailerUrl = m.trailerUrl || m.trailer || '';

  if (trailerUrl) {
    btnT.hidden = false;

    btnT.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation(); // không cho lan lên card (tránh nhảy movie-detail)

      if (window.openTrailerModal) {
        window.openTrailerModal(trailerUrl);
      } else {
        window.open(trailerUrl, '_blank');
      }
    });
  } else {
    // không có trailer thì ẩn nút
    btnT.remove();
  }
}



  // ===== Book button -> luôn sang showtime.html =====
  const book = el.querySelector('[data-book]');
  if (book) {
    if (!showRating) {
      // Coming soon: ẩn nút đặt vé
      book.remove();
    } else {
      const movieId = encodeURIComponent(m.id || '');
      // Chốt: luôn đi showtime, không dùng m.href để tránh nhảy sang movie-detail
      book.href = movieId
        ? `showtime.html?movie=${movieId}`
        : `showtime.html`;

      book.hidden = false;

      book.addEventListener('click', (e) => {
        // Cho phép điều hướng nhưng không trigger click card
        e.stopPropagation();
      });
    }
  }

  // ===== Click toàn card -> movie-detail (trừ 2 nút trên) =====
  el.addEventListener('click', (e) => {
    // Nếu bấm Trailer hoặc Book thì bỏ qua (đã xử lý riêng)
    if (e.target.closest('[data-trailer],[data-book]')) return;

    // Nếu đang kéo coverflow thì không điều hướng
    const rail = e.currentTarget.closest('.rail');
    if (rail && rail.dataset.isDragging === '1') {
      rail.dataset.isDragging = '0';
      e.preventDefault();
      e.stopPropagation();
      return;
    }

    const id = m.id ?? '';
    if (id) {
      location.href = `movie-detail.html?movie=${encodeURIComponent(id)}`;
    }
  });

  return el;
}

  
// ===== Coverflow engine (BIG SCREEN) — 5 items + auto-snap =====
function initCoverflow(rail, dotsEl, baseLen){
  let cards = [...rail.querySelectorAll('.movie-card, .poster')]; // Hỗ trợ cả 2 class

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
      const r2 = await fetch('../../data/movies.json', { cache: 'no-store' });
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
  view.forEach((m,idx)=>{
    // [SỬA LỖI] Đổi posterItem -> cardFrom
    const a = cardFrom(m, { showRating:true, showRelease:false });
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
      const r2 = await fetch('../../data/movies.json', { cache: 'no-store' });
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
      // [SỬA LỖI] Đổi posterItem -> cardFrom
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

  async function loadDealsCarousel(){
    const wrap = document.getElementById('wrapDeals');
    const rail = document.getElementById('railDeals');
    if (!wrap || !rail) return;

    await ensurePromoCardTemplate();

    let data = [];
    try {
      const res = await fetch(`${API}/deals`, { cache:'no-store' });
      if (res.ok) data = await res.json();
    } catch {}

  // 2) Fallback ../../data/promotions.json
  if (!data.length) {
    try {
      const r2 = await fetch('../../data/promotions.json', { cache:'no-store' });
      if (r2.ok) {
        const j = await r2.json();
        // chấp nhận nhiều shape: mảng / {items:[]} / {promotions:[]}
        data = Array.isArray(j) ? j : (j.items || j.promotions || []);
      }
    } catch {}
  }

  // 3) Mock nếu trống
  if (!data.length) {
    data = Array.from({length:6}, (_,i)=>({
      id:`p${i+1}`,
      title:`Khuyến mãi ${i+1}`,
      desc:`Ưu đãi đặc biệt ${i+1}`,
      img:`https://picsum.photos/seed/promo${i}/800/400`,
      href:'#'
    }));
  }


    rail.innerHTML = '';
    data.forEach(p => rail.appendChild(promoCardFromData(p)));

    // nếu muốn tái dùng hành vi kéo/scroll như rail khác, có thể gắn wheel->ngang:
    initSimpleCarousel(document.getElementById('wrapDeals'), { itemSelector: '.deal' });
  }

  // === Combos grid ===
  async function loadCombos(mode='concessions'){
    const wrap = document.getElementById('gridCombos'); if (!wrap) return;
    await ensureComboItemTemplate();

    const API = window.API_BASE || '/api';
    let data = [];
    try{
      const res = await fetch(`${API}/concessions/combos`, { cache:'no-store' });
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

  // === Membership interactions (tier switch + card tilt + perks theo hạng) ===
  function enhanceMember(){
    const wrap = document.querySelector('#member .member-v2');
    if (!wrap) return;

    // Định nghĩa gói quyền lợi cho từng hạng
    const TIERS = {
      gold: {
        price: '79.000đ',
        perks: [
          '🎟 1 lần chọn ghế VIP / tháng',
          '🍿 Combo bắp nước ưu đãi 20%',
          '⏱️ Mua vé sớm hơn 24h',
          '🎁 Tích điểm đổi quà & voucher'
        ],
        halo: 'rgba(229, 213, 79, .45)',
        chip: ['#F8D36B','#FFB84D'],
        label: 'Gold'
      },
      platinum: {
        price: '129.000đ',
        perks: [
          '🎟 2 lần chọn ghế VIP / tháng',
          '🍿 Combo bắp nước ưu đãi 25%',
          '⏱️ Mua vé sớm hơn 48h',
          '🎫 Miễn phí nâng ghế đôi 1 lần'
        ],
        halo: 'rgba(162, 185, 255, .45)',
        chip: ['#C9DAFF','#8CA8FF'],
        label: 'Platinum'
      },
      diamond: {
        price: '199.000đ',
        perks: [
          '🎟 4 lần chọn ghế VIP / tháng',
          '🍿 Combo bắp nước ưu đãi 30%',
          '⏱️ Mua vé sớm hơn 72h',
          '🎁 Quà sinh nhật + lounge VIP'
        ],
        halo: 'rgba(116, 249, 255, .45)',
        chip: ['#7DF5FF','#35D1E2'],
        label: 'Diamond'
      }
    };

    const priceEl = document.getElementById('tierPrice');
    const perksEl = wrap.querySelector('.perks');
    const joinBtn = document.getElementById('joinEliteBtn');

    const card    = wrap.querySelector('.glass-card');
    const chip    = card?.querySelector('.chip');
    const halo    = wrap.querySelector('.halo');
    const cardNm  = card?.querySelector('.card-name');

    function applyTier(tier){
      const def = TIERS[tier]; if(!def) return;

      // set class để đổi theme theo CSS variables
      wrap.classList.remove('gold','platinum','diamond');
      wrap.classList.add(tier);

      // giá
      if (priceEl) priceEl.textContent = def.price;

      // perks
      if (perksEl) perksEl.innerHTML = def.perks.map(p=>`<li>${p}</li>`).join('');

      // join link
      if (joinBtn) joinBtn.href = `membership.html?tier=${tier}`;

      // card visuals
      if (cardNm) cardNm.textContent = def.label;
      if (halo)   halo.style.background =
        `radial-gradient(60% 70% at 50% 10%, ${def.halo}, transparent 60%)`;
      if (chip)   chip.style.background =
        `linear-gradient(135deg, ${def.chip[0]}, ${def.chip[1]})`;
    }

    // Bắt sự kiện tab hạng
    wrap.querySelectorAll('.tier').forEach(btn=>{
      btn.addEventListener('click', ()=>{
        wrap.querySelectorAll('.tier').forEach(b=>{
          b.classList.toggle('active', b===btn);
          b.setAttribute('aria-selected', String(b===btn));
        });
        applyTier(btn.dataset.tier);
      });
    });

    // Subtle tilt on the glass card (giữ như cũ)
    const rect = ()=> card?.getBoundingClientRect?.();
    const onMove = (e)=>{
      const r = rect(); if(!r || !card) return;
      const cx = r.left + r.width/2, cy = r.top + r.height/2;
      const dx = (e.clientX - cx)/r.width, dy = (e.clientY - cy)/r.height;
      card.style.transform = `rotateX(${(-dy*6).toFixed(2)}deg) rotateY(${(dx*8).toFixed(2)}deg)`;
    };
    const reset = ()=> { if(card) card.style.transform = 'rotateX(0) rotateY(0)'; };
    card?.addEventListener('pointermove', onMove);
    card?.addEventListener('pointerleave', reset);

    // Khởi tạo theo Gold mặc định
    applyTier('gold');
  }
function initSimpleCarousel(wrap, { itemSelector = '.deal' } = {}) {
  if (!wrap) return;
  const rail = wrap.querySelector('.rail'); if (!rail) return;
  const prev = wrap.querySelector('.nav.prev');
  const next = wrap.querySelector('.nav.next');
  const dotsWrap = wrap.querySelector('.dots');

  const getItems = () => Array.from(rail.querySelectorAll(itemSelector));
  const gap = parseFloat(getComputedStyle(rail).columnGap || getComputedStyle(rail).gap || 24) || 24;

  // ---- build dots
function buildDots() {
  if (!dotsWrap) return;
  dotsWrap.innerHTML = '';
  getItems().forEach((_, i) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'dot';             // [FIX] cho ăn CSS dot
    b.addEventListener('click', () => scrollToIndex(i));
    dotsWrap.appendChild(b);
  });
  updateDots();
}

  // ---- helpers
  // GET JSON, nếu API 404/ lỗi -> đọc file JSON cục bộ
async function getJSON(urlApi, localPath, pick) {
  try {
    const r = await fetch(urlApi);
    if (r.ok) {
      const j = await r.json();
      return typeof pick === 'function' ? pick(j) : j;
    }
  } catch {}
  const r2 = await fetch(localPath, { cache: 'no-store' });
  const j2 = await r2.json();
  return typeof pick === 'function' ? pick(j2) : j2;
}

// tách now/soon nếu movies.json là 1 mảng
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

  // ---- nav buttons
  prev && prev.addEventListener('click', (e) => {
    e.preventDefault(); 
    scrollToIndex(Math.max(0, currentIndex() - 1));
  });
  next && next.addEventListener('click', (e) => {
    e.preventDefault(); 
    scrollToIndex(currentIndex() + 1);
  });

  // ---- wheel: dọc -> ngang
  rail.addEventListener('wheel', (e) => {
    if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
      e.preventDefault();
      rail.scrollBy({ left: e.deltaY, behavior: 'smooth' });
    }
  }, { passive: false });

  // ---- drag to scroll (desktop)
// ---- [SỬA] drag to scroll (desktop + touch) ----
let isDown = false, startX = 0, startLeft = 0, dragMoved = false, dragTO;

const startDrag = (e) => {
  isDown = true; dragMoved = false;
  startX = ('touches' in e ? e.touches[0].pageX : e.pageX);
  startLeft = rail.scrollLeft;
  rail.classList.add('is-grabbing');
  rail.dataset.isDragging = '0';

  // Chặn hành vi "kéo ảnh" mặc định
  if (e.target.tagName === 'IMG') e.preventDefault();
};

const moveDrag = (e) => {
  if (!isDown) return;
  // Ngăn cuộn trang trên di động khi đang lướt ngang
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
document.addEventListener('mousemove', moveDrag); // Quan trọng: lắng nghe trên cả document
document.addEventListener('mouseup', stopDrag);   // Quan trọng: lắng nghe trên cả document

rail.addEventListener('touchstart', startDrag, { passive: false });
document.addEventListener('touchmove', moveDrag, { passive: false });
document.addEventListener('touchend', stopDrag);
let scrollSnapTO;

rail.addEventListener('scroll', () => {
  updateDots();
  if (isDown) return; // đang kéo tay thì không auto-snap

  clearTimeout(scrollSnapTO);
  scrollSnapTO = setTimeout(() => {
    const i = currentIndex();
    scrollToIndex(i);
  }, 140);
});

  // init
  buildDots();
}


  // ====== Boot ======
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
  // expose modal helpers to global
Object.assign(window, {
  ensureModalTemplate,
  openModal,
  closeModal,
  openTrailerModal,
  openConfirm,
  openQuickLogin
});
  // ====== Global handler: Trailer / Quick Login / Confirm ======
  document.addEventListener('click', async (e) => {
    const t = e.target.closest('[data-open-login],[data-confirm]');
    if (!t) return;

    // Trailer -> luôn ưu tiên mở modal
    if (t.hasAttribute('data-trailer-url')) {
      e.preventDefault();
      const url = t.getAttribute('data-trailer-url');
      if (!url) return;

      if (window.openTrailerModal) {
        window.openTrailerModal(url);
      } else {
        window.open(url, '_blank');
      }
      return;
    }

    // Nút mở login nhanh (nếu có)
    if (t.hasAttribute('data-open-login')) {
      e.preventDefault();
      if (window.openQuickLogin) {
        window.openQuickLogin();
      }
      return;
    }

    // Nút confirm (nếu có dùng)
    if (t.hasAttribute('data-confirm')) {
      e.preventDefault();
      if (window.openConfirm) {
        const ok = await window.openConfirm({
          title: t.getAttribute('data-title') || 'Xác nhận',
          message: t.getAttribute('data-message') || 'Bạn chắc chứ?',
        });
        if (ok) {
          console.log('Confirmed');
        }
      }
    }
  });

})();