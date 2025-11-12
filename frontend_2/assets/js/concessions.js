(() => {
  const $  = (s, r=document) => r.querySelector(s);
  const $$ = (s, r=document) => Array.from(r.querySelectorAll(s));
  const API = window.API_BASE || '/api';

  // ===== Utilities =====
  const fmtVND = (n) => (Math.round(Number(n)||0)).toLocaleString('vi-VN') + '₫';

  async function getJSON(apiPath, localPath){
    try{
      if (apiPath) {
        const r = await fetch(apiPath, { cache:'no-store' });
        if (r.ok) return await r.json();
      }
    } catch {}
    if (localPath) {
      const r2 = await fetch(localPath, { cache:'no-store' });
      return await r2.json();
    }
    return null;
  }

  const readLS = (k,d)=>{ try{ return JSON.parse(localStorage.getItem(k) || JSON.stringify(d)); }catch{ return d; } };
  const writeLS = (k,v)=> localStorage.setItem(k, JSON.stringify(v));

  // ===== Templates (local fetch relative to /html) =====
  let COMBO_TPL = null, TICKET_TPL = null;
  async function ensureComboTpl(){
    if (COMBO_TPL) return COMBO_TPL;
    try {
      const html = await (await fetch('./components/combo-item.html', { cache:'no-store' })).text();
      const box = document.createElement('div'); box.innerHTML = html;
      COMBO_TPL = box.querySelector('#combo-item');
      document.body.appendChild(COMBO_TPL);
    } catch {}
    return COMBO_TPL;
  }
  async function ensureTicketTpl(){
    if (TICKET_TPL) return TICKET_TPL;
    try {
      const html = await (await fetch('./components/ticket-summary.html', { cache:'no-store' })).text();
      const box = document.createElement('div'); box.innerHTML = html;
      TICKET_TPL = box.querySelector('#ticket-summary');
      document.body.appendChild(TICKET_TPL);
    } catch {}
    return TICKET_TPL;
  }

// ✅ Tạo tabs theo cấu hình (có icon)
function renderCatTabs(){
  const CATEGORIES = [
    { id: 'Combo',    name: '🎁 Combo' },
    { id: 'Popcorn',  name: '🍿 Popcorn' },
    { id: 'Beverage', name: '🥤 Beverage' },
    { id: 'Hot Food', name: '🍔 Hot Food' },
    { id: 'Coffee',   name: '☕ Coffee' },
    { id: 'Desserts', name: '🍰 Desserts' },
    { id: 'all',      name: 'Tất cả' }
  ];
  const wrap = $('#catTabs'); if (!wrap) return;
  wrap.innerHTML = '';
  CATEGORIES.forEach((c, i) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'cat' + (i===0 ? ' is-active' : '');
    b.dataset.cat = c.id;
    b.textContent = c.name;
    wrap.appendChild(b);
  });
  state.activeCat = CATEGORIES[0].id;
}



  function ticketFromData(t){
    const el = TICKET_TPL.content.firstElementChild.cloneNode(true);
    if (t.posterUrl) el.querySelector('[data-poster]').src = t.posterUrl;
    el.querySelector('[data-movie]').textContent    = t.movieTitle || '';
    el.querySelector('[data-format]').textContent   = t.format || '2D';
    el.querySelector('[data-lang]').textContent     = t.language || '';
    el.querySelector('[data-theater]').textContent  = t.theater || '';
    el.querySelector('[data-showdate]').textContent = t.showDate || '';
    el.querySelector('[data-showtime]').textContent = t.showTime || '';
    el.querySelector('[data-seats]').textContent    = (t.seats||[]).join(', ');
    el.querySelector('[data-qty]').textContent      = `${t.qty || (t.seats?.length||1)} vé`;
    if (t.price != null) el.querySelector('[data-price]').textContent = fmtVND(t.price);
    if (t.combo != null){ const w = el.querySelector('[data-combo-wrap]'); w.hidden=false; w.querySelector('[data-combo]').textContent=fmtVND(t.combo); }
    if (t.total != null) el.querySelector('[data-total]').textContent = fmtVND(t.total);
    return el;
  }

  // ===== State =====
  const state = {
    allCombos: [],
    promotions: [],
    activeCat: 'all',
    cart: readLS('orderCombos', []),  // [{id, title, price, qty, imageUrl, variant?}]
    ticket: { movieId:'', theaterId:'', showDate:'', showTime:'', format:'', language:'', seats:[], price:0 }
  };

  // ===== Data loaders =====
  async function loadCatalog(){
    // Combos + promotions (BE first, fallback JSON)
    const [combos, promos] = await Promise.all([
      getJSON(`${API}/combos`, '../data/combos.json'),
      getJSON(`${API}/promotions`, '../data/promotions.json')
    ]);
    state.allCombos = Array.isArray(combos) ? combos : (combos?.items||[]);
    state.promotions = Array.isArray(promos) ? promos : (promos?.items||[]);
  }

  async function loadTicketContext(){
    // read context from LS; if needed, enrich from JSON/BE for display
    const showSel = readLS('selectedShowtime', {});
    let seatsSel = readLS('selectedSeats', {});
    let seats = Array.isArray(seatsSel) ? seatsSel : (seatsSel.seats || []);
    let ticketPrice = typeof seatsSel.total === 'number' ? seatsSel.total : 0;


if ((!seats || !seats.length) && !ticketPrice) {
  try {
    const keys = Object.keys(localStorage).filter(k => k.startsWith('booking::'));
    if (keys.length) {
      const b = JSON.parse(localStorage.getItem(keys.sort().pop()) || '{}');
      if (Array.isArray(b.seats)) seats = b.seats;
      ticketPrice = Number(b.total || 0);
    }
  } catch {}
}

    const movieId   = showSel.movieId || showSel.movie || '';
    const theaterId = showSel.theaterId || showSel.theater || '';
    const showDate  = showSel.date || showSel.showDate || '';
    const showTime  = showSel.time || showSel.showTime || '';
    const format    = showSel.format || '2D';
    const language  = showSel.language || '';

    let movieTitle = '', posterUrl = '';
    let theaterName = showSel.theaterName || '';


    // Try BE then fallback files to enrich labels
    try {
      if (!theaterName) {                    // ADD
        const ths = await getJSON(`${API}/theaters`, '../data/theaters.json');
        const arr = Array.isArray(ths) ? ths : (ths?.theaters || ths?.items || []);
        const t = arr.find(x => String(x.id) === String(theaterId) || String(x.theater_id) == String(theaterId));
        if (t) theaterName = t.name || t.title || '';
      }                                       // ADD
    } catch {}
    try {
      if (movieId) {
        const m = await getJSON(`${API}/movies/${encodeURIComponent(movieId)}`, '../data/movies.json');
        if (Array.isArray(m)) {
          const found = m.find(x => String(x.id) === String(movieId));
          if (found) { movieTitle = found.title || ''; posterUrl = found.posterUrl || found.poster || ''; }
        } else if (m && (m.title || m.posterUrl)) {
          movieTitle = m.title || '';
          posterUrl  = m.posterUrl || '';
        } else if (m?.now || m?.soon) {
          const found = [...(m.now||[]), ...(m.soon||[])].find(x => String(x.id) === String(movieId));
          if (found) { movieTitle = found.title || ''; posterUrl = found.posterUrl || found.poster || ''; }
        }
      }
    } catch {}

    state.ticket = {
      movieId, theaterId, movieTitle, posterUrl,
      showDate, showTime, format, language,
      theater: theaterName,           
      seats,
      qty: seats.length || 1,
      price: ticketPrice
    };
  }

// ===== Render: Ticket summary =====
async function renderTicket(){
  await ensureTicketTpl();
  const mount = $('#ticketWrap'); if (!mount) return;

  const el = ticketFromData(state.ticket);

  // Ghép thông tin, bỏ giá trị rỗng/ dấu "•" lẻ/ "-"
  const fmt  = [state.ticket.format, state.ticket.language].filter(Boolean).join(' • ');
  const when = [state.ticket.showDate, state.ticket.showTime].filter(Boolean).join(' • ');
  const seats = (state.ticket.seats && state.ticket.seats.length)
  ? state.ticket.seats.join(', ')
  : '';
  const qty  = (state.ticket.qty ? `${state.ticket.qty} vé` : '');

  const set = (sel, val) => { const n = el.querySelector(sel); if (n) n.textContent = (val||'').trim(); };
  set('[data-movie]'   , state.ticket.movieTitle||'');
  set('[data-format]'  , fmt);
  set('[data-theater]' , state.ticket.theater||'');
  set('[data-showdate]', when);
  set('[data-showtime]', '');     // tắt dòng giờ riêng
  set('[data-seats]'   , seats);
  set('[data-qty]'     , qty);

  // Ẩn những dòng rỗng hoặc chỉ còn "•" / "-"
  ['[data-format]','[data-theater]','[data-showdate]','[data-showtime]','[data-seats]','[data-qty]']
    .forEach(sel=>{
      const s = el.querySelector(sel);
      if(!s) return;
      const txt = s.textContent.replace(/(\s*•\s*)+/g,' • ').replace(/(^|•)\s*-\s*(?=•|$)/g,'').trim();
      s.textContent = txt;
      const line = s.closest('.row') || s.parentElement;
      if(!txt) line && (line.style.display='none');
    });

  // Layout 1 cột
  el.classList.add('stack');

  mount.replaceChildren(el);
// --- Seats: Fix lỗi hiển thị "Ghế: Ghế: ..." và ngắt dòng
{
  const seatNode = el.querySelector('[data-seats]');
  const full = (state.ticket.seats && state.ticket.seats.length) ? state.ticket.seats.join(', ') : '';

  if (seatNode) {
    // CHỈ set nội dung là danh sách ghế, không thêm "Ghế:"
    seatNode.textContent = full; 
    seatNode.title = full; // hover xem full danh sách

    // Ẩn CẢ DÒNG (bao gồm label "Ghế:") nếu không có ghế
    const line = seatNode.closest('.row');
    if (!full && line) {
      line.style.display = 'none';
    }
  }
}

// --- Ẩn mọi dòng chỉ còn dấu chấm/bullet “•”, “-”, “,” (hàng thừa)
el.querySelectorAll('.row').forEach(row => {
  const t = (row.textContent || '').replace(/\s+/g,' ').trim();
  if (!t || /^[•\-\.,\s]+$/.test(t)) row.style.display = 'none';
});

// --- Ẩn "Phí đặt vé" nếu template có
{
  const feeLine = el.querySelector('[data-fee-wrap]') 
    || [...el.querySelectorAll('.line')].find(n => /phí\s*đặt\s*vé/i.test(n.textContent));
  if (feeLine) feeLine.remove();
}
// --- Ẩn "Khuyến mãi" nếu có và giá trị là 0
{
  // Tìm dòng khuyến mãi bằng data-attr hoặc text
  const promoLine = el.querySelector('[data-promo-wrap]') 
    || [...el.querySelectorAll('.line')].find(n => /khuy[ếe]n\s*m[ãa]i/i.test(n.textContent));
  
  if (promoLine) {
    // Kiểm tra giá trị của nó (trong <strong> hoặc data-promo)
    const promoVal = promoLine.querySelector('strong, [data-promo]');
    // Lấy text giá trị, hoặc text của cả dòng nếu không tìm thấy thẻ con
    const valText = (promoVal ? promoVal.textContent : promoLine.textContent) || '';
    
    // Nếu giá trị là "0đ", "-0đ", hoặc chỉ là "0" thì ẩn
    if (/[\-\s]*0[₫dđ]?/i.test(valText.trim())) {
      promoLine.style.display = 'none';
    }
  }
}
// Đồng bộ số tiền (vé + combo) lên thẻ hóa đơn
syncSummaryTotals();
updateTotals();

}


  // ===== Render: Product grid =====
  function normalizeCategory(c){
    if (!c) return 'Combo';
    const s = String(c).trim();
    const m = s.toLowerCase();
    if (m.includes('pop')) return 'Popcorn';
    if (m.includes('bev') || m.includes('drink') || m.includes('soda')) return 'Beverage';
    if (m.includes('coffee')) return 'Coffee';
    if (m.includes('hot')) return 'Hot Food';
    if (m.includes('dess')) return 'Desserts';
    if (m.includes('combo') || m.includes('cb-')) return 'Combo';
    return s;
  }

  function comboCardFrom(c){
    // If we have template file, use it for consistent look
    if (COMBO_TPL?.content?.firstElementChild){
      const el = COMBO_TPL.content.firstElementChild.cloneNode(true);
      // set basics
      el.dataset.id = c.id || '';
      el.querySelector('[data-img]').src = c.imageUrl || '';
      el.querySelector('[data-title]').textContent = c.title || 'Combo';
      el.querySelector('[data-desc]').textContent  = c.desc  || '';
      const priceText = el.querySelector('[data-price-text]');
      const old = el.querySelector('[data-old]');
      const save = el.querySelector('[data-save]');

      // promotion/tag
      const tagEl = el.querySelector('[data-tag]');
      const promo = c.promotionId && state.promotions.find(p => String(p.id) === String(c.promotionId));
      const tag = c.tag || promo?.badge || promo?.tag || '';
      if (tag && tagEl){ tagEl.textContent = tag; tagEl.hidden = false; }

      priceText.textContent = fmtVND(c.price || 0);
      if (c.oldPrice && c.oldPrice > c.price){
        old.textContent = fmtVND(c.oldPrice); old.hidden = false;
        const percent = Math.round(100 - (c.price / c.oldPrice) * 100);
        save.textContent = `(-${percent}%)`; save.hidden = false;
      }

      // variants
      const vWrap = el.querySelector('[data-variants]');
      const vOpts = el.querySelector('[data-opts]');
      vWrap.hidden = true;
      if (Array.isArray(c.variants) && c.variants.length){
        vWrap.hidden = false;
        vOpts.innerHTML = '';
        c.variants.forEach((v, idx) => {
          const w = document.createElement('label');
          w.className = 'chip';
          
          // ======== FIX 1: Đã xóa \ và dùng đúng ` (backtick) ========
          w.innerHTML = `<input type="radio" name="${c.id}" value="${v.value}" ${idx===0?'checked':''}><span>${v.label}</span>`;
          
          vOpts.appendChild(w);
        });
      }

      // qty controls
      const qtyEl = el.querySelector('[data-qty]');
      el.querySelector('.step.dec').addEventListener('click',()=>{ qtyEl.value = Math.max(1, Number(qtyEl.value)-1); });
      el.querySelector('.step.inc').addEventListener('click',()=>{ qtyEl.value = Number(qtyEl.value)+1; });

      // add to cart
      el.querySelector('[data-add]').addEventListener('click',()=>{
        const chosen = vOpts?.querySelector('input:checked')?.value || null;
        addToCart({ id:c.id, title:c.title, price:c.price, imageUrl:c.imageUrl, variant:chosen, qty: Number(qtyEl.value)||1 });
      });

      return el;
    }

    // fallback simple card
    const card = document.createElement('div');
    card.className = 'combo';
    
    // ======== FIX 2: Đã xóa \ khỏi các biến ${...} ========
    card.innerHTML = `
      <div class="thumb"><img src="${c.imageUrl||''}" alt=""></div>
      <div class="copy">
        <div class="eyebrow">${c.tag || ''}</div>
        <h4 class="title">${c.title||'Combo'}</h4>
        <p class="desc">${c.desc||''}</p>
        <div class="price-row">
          <div class="price">${fmtVND(c.price||0)}</div>
        </div>
        <div class="controls">
          <div class="qty"><button class="step dec">–</button><input class="val" value="1" /><button class="step inc">+</button></div>
          <button class="btn add">Thêm</button>
        </div>
      </div>`;
      
    const qtyVal = card.querySelector('.val');
    card.querySelector('.dec').onclick = ()=> qtyVal.value = Math.max(1, Number(qtyVal.value)-1);
    card.querySelector('.inc').onclick = ()=> qtyVal.value = Number(qtyVal.value)+1;
    card.querySelector('.add').onclick = ()=> addToCart({ id:c.id, title:c.title, price:c.price, imageUrl:c.imageUrl, qty:Number(qtyVal.value)||1 });
    return card;
  }

  async function renderGrid(){
    await ensureComboTpl();
    const grid = $('#combosGrid'); if (!grid) return;
    const list = state.allCombos
      .map(c => ({ ...c, type: normalizeCategory(c.type || (c.category||'') || (c.id||'Combo')) }))
      .filter(c => state.activeCat === 'all' ? true : c.type === state.activeCat);

    grid.innerHTML = '';
    if (!list.length){
      grid.innerHTML = '<div class="empty">Chưa có món trong danh mục này.</div>';
      return;
    }
    list.forEach(c => grid.appendChild(comboCardFrom(c)));
  }

  
  // ===== Cart =====
  function addToCart(item){
    const found = state.cart.find(x => x.id === item.id && x.variant === item.variant);
    if (found) found.qty += item.qty || 1;
    else state.cart.push({ ...item, qty: item.qty || 1 });
    writeLS('orderCombos', state.cart);
    renderCart();
  }

  function updateQty(id, delta, variant=null){
    const it = state.cart.find(x => x.id === id && x.variant === variant);
    if (!it) return;
    it.qty = Math.max(0, (Number(it.qty)||0) + delta);
    if (it.qty === 0) removeItem(id, variant);
    writeLS('orderCombos', state.cart);
    renderCart();
  }

  function removeItem(id, variant=null){
    state.cart = state.cart.filter(x => !(x.id === id && x.variant === variant));
    writeLS('orderCombos', state.cart);
    renderCart();
  }

  function cartTotals(){
    const combosTotal = state.cart.reduce((s,it)=> s + (Number(it.price)||0) * (Number(it.qty)||0), 0);
    const ticketTotal = Number(state.ticket.price||0);
    return { ticketTotal, combosTotal, grand: ticketTotal + combosTotal };
  }
function syncSummaryTotals(){
  const { ticketTotal, combosTotal, grand } = cartTotals();
  const wrap = document.querySelector('#ticketWrap');
  if (!wrap) return;

  const comboWrap = wrap.querySelector('[data-combo-wrap]');
  if (comboWrap) comboWrap.hidden = combosTotal <= 0;

  const el = (sel) => wrap.querySelector(sel);
  el('[data-price]') && (el('[data-price]').textContent  = fmtVND(ticketTotal));
  el('[data-combo]') && (el('[data-combo]').textContent  = fmtVND(combosTotal));
  el('[data-total]') && (el('[data-total]').textContent  = fmtVND(grand));
}

function updateTotals(){
  const { ticketTotal, grand } = cartTotals();
  const f = (sel, val) => { const n = document.querySelector(sel); if (n) n.textContent = fmtVND(val); };
  f('#ticketFee', ticketTotal);
  f('#grandTotal', grand);
  syncSummaryTotals(); // <- giữ thẻ hóa đơn đồng bộ
}

  function renderCart(){
    const wrap = $('#cartList'); if (!wrap) return;
    wrap.innerHTML = '';
    if (!state.cart.length){
      wrap.innerHTML = '<div class="empty">Chưa có món nào. Hãy chọn ở phía trên.</div>';
    } else {
      state.cart.forEach(it => {
        const row = document.createElement('div');
        row.className = 'cp-item';
        
        // ======== FIX 3: Đã xóa \ khỏi các biến ${...} ========
        row.innerHTML = `
          <div class="thumb"><img src="${it.imageUrl||''}" alt=""></div>
          <div>
            <div class="name">${it.title}</div>
            <div class="sub">${it.variant ? ('Size: ' + it.variant) : ''}</div>
          </div>
          <div class="qty">
            <button aria-label="Giảm" data-act="dec">–</button>
            <span>${it.qty}</span>
            <button aria-label="Tăng" data-act="inc">+</button>
          </div>
          <div class="price">${fmtVND((Number(it.price)||0) * (Number(it.qty)||0))}</div>
          <button class="rm" title="Xóa" aria-label="Xóa">✕</button>`;
          
        row.querySelector('[data-act="dec"]').onclick = () => updateQty(it.id, -1, it.variant||null);
        row.querySelector('[data-act="inc"]').onclick = () => updateQty(it.id, +1, it.variant||null);
        row.querySelector('.rm').onclick = () => removeItem(it.id, it.variant||null);
        wrap.appendChild(row);
      });
    }

    updateTotals();

  }
  // ===== Events: Category tabs & Checkout =====
function bindTabs(){
  const tabs = $$('.cat-tabs .cat');
  tabs.forEach(b => b.addEventListener('click', () => {
    tabs.forEach(x => {
      const act = x === b;
      x.classList.toggle('is-active', act);
      x.setAttribute('aria-current', act ? 'true' : 'false');
    });
    state.activeCat = b.dataset.cat || 'all';
    renderGrid();
  }));
}


  function bindActions(){
    $('#btnCheckout').addEventListener('click', () => {
      const { grand } = cartTotals();
      const summary = {
        movieId: state.ticket.movieId,
        theaterId: state.ticket.theaterId,
        seats: state.ticket.seats,
        combos: state.cart.map(it => ({ id: it.id, qty: it.qty, variant: it.variant||undefined })),
        total: grand
      };
      localStorage.setItem('orderSummary', JSON.stringify(summary));
      location.href = 'cart.html';
    });
    $('#btnBackSeats').addEventListener('click', (e) => {
      e.preventDefault();
      location.href = 'seat-map.html';
    });
  }

  // ===== Boot =====
  document.addEventListener('DOMContentLoaded', async () => {
    // breadcrumb (uses main.js helper)
    if (window.mountBreadcrumb) window.mountBreadcrumb({ mountId: 'bc' });

    await Promise.all([loadCatalog(), loadTicketContext()]);
    renderCatTabs();
    await renderTicket();
    bindTabs();  
    await renderGrid();
    renderCart();
    bindActions();
  });
})();