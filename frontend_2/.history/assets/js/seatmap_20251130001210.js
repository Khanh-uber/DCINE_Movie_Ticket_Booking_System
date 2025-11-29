(() => {
  const $  = (s, r=document) => r.querySelector(s);
  const $$ = (s, r=document) => [...r.querySelectorAll(s)];
  const toVND = (n) => (Math.round(Number(n)||0)).toLocaleString('vi-VN') + 'đ';

  // ===== Config =====
  let ROWS = 'ABCDEFGHIJ'.split('');
  let COLS = Array.from({length:16}, (_,i)=>i+1);
  let AISLES_AFTER = [4, 12];

  // 1. Định nghĩa vùng: A-C là VIP, D-I là Standard, J (hàng cuối) là Couple
  const ZONES = { 
    vip: new Set(['A','B','C']), 
    standard: new Set(['D','E','F','G','H','I']), 
    couple: new Set(['J']) // Thay thế economy bằng couple
  };

  // 2. Bảng giá GỐC theo loại ghế (fallback)
  let SEAT_PRICE = { 
    standard: 90000, 
    vip: 110000, 
    couple: 180000 
  };

  // 3. Hệ số theo độ tuổi (Adult giữ nguyên, Child giảm còn 0.8) – chỉ dùng fallback
  let AGE_FACTOR = { adult: 1.0, child: 0.8 };

  // ===== Pricing from BE (FE chỉ hiển thị) =====
  const PRICING = {
    byZone: {
      standard: { adult: null, child: null },
      vip:      { adult: null, child: null },
      couple:   { adult: null, child: null }
    }
  };

  // Lấy giá hiển thị (ưu tiên giá BE, fallback dùng SEAT_PRICE * AGE_FACTOR)
  function getDisplayPrice(zone, type) {
    const z = PRICING.byZone[zone] || {};
    const v = z[type];
    if (typeof v === 'number') return v;

    const base   = SEAT_PRICE[zone] || 0;
    const factor = AGE_FACTOR[type] || 1;
    return base * factor;
  }

  // Lưu lần preview giá gần nhất từ BE
  let lastPricingPreview = null;

  // ===== API BASE + helpers =====
  const API = window.API_BASE || '/api';

  // Throttle để tránh spam API hold khi user click nhanh
  let lastHoldCall = 0;
  const HOLD_THROTTLE_MS = 300;

  async function apiGet(path) {
    try {
      const res = await fetch(API + path, { cache: 'no-store' });
      if (!res.ok) throw new Error('HTTP ' + res.status);
      return await res.json();
    } catch (err) {
      console.error('[seatmap] GET', path, err);
      return null;
    }
  }

  async function apiPost(path, body) {
    try {
      const res = await fetch(API + path, {
        method: 'POST',
        headers: { 'Content-Type':'application/json' },
        body: JSON.stringify(body || {})
      });
      if (!res.ok) throw new Error('HTTP ' + res.status);
      return await res.json().catch(() => null);
    } catch (err) {
      console.error('[seatmap] POST', path, err);
      return null;
    }
  }
async function createBooking(showtimeId, seatsPayload) {
  // seatsPayload: [{ code, type }]
  return await apiPost('/bookings', {
    showtimeId,
    seats: seatsPayload.map(s => ({
      code: s.code,
      type: s.type || 'adult'
    }))
  });
}

  async function sendSeatHold(seatItems, action) {
    const id = state.show.id || showtimeId();
    if (!id || !codes || !codes.length) return;

    const now = Date.now();
    if (action === 'hold' && now - lastHoldCall < HOLD_THROTTLE_MS) {
      // tránh spam khi user click nhanh
      return;
    }
    lastHoldCall = now;

    await apiPost(`/showtimes/${encodeURIComponent(id)}/holds`, {
      seats: seatItems,              // ["A1","A2"]
      action: action || 'hold'   // 'hold' | 'release'
    });
  }

  const state = {
    seats:{},                      // { "A1": {zone, state} }
    selected:new Set(),            // Set<"A1">
    assigned:new Map(),            // Map<"A1","adult"|"child">
    show:{ id:null, theater:'D-Cine', date:'', time:'', format:'' },
    movie:{ id:null, title:'—', posterUrl:'', trailerUrl:'', year:'', genres:[], duration:'' }
  };

  // ===== Helpers =====

  // Hàm xác định loại ghế dựa trên tên Hàng (Row)
  const zoneOf = (row) => {
    if (ZONES.vip.has(row)) return 'vip';
    if (ZONES.couple.has(row)) return 'couple';
    return 'standard';
  };

  const codeOf = (r,c)=> `${r}${c}`;

  const showtimeId = () =>
    state.show.id ||
    [state.movie.id || 'mv', state.show.theater, state.show.date, state.show.time]
      .join('|')
      .replace(/\s+/g, '_');

  function rowChunks(){
    const a=[]; let cur=[];
    for(const c of COLS){
      cur.push(c);
      if (AISLES_AFTER.includes(c)){ a.push(cur); cur=[]; }
    }
    if(cur.length)a.push(cur);
    return a;
  }

  function violatesSingleGap(rowLetter, colNumber, willSelect){
    const rowStates = {};
    COLS.forEach(c=>{
      const el = $(`#s-${rowLetter}${c}`);
      rowStates[c] = el ? el.dataset.state : 'available';
    });
    const cur = rowStates[colNumber];
    rowStates[colNumber] = (willSelect ? 'selected' : (cur==='selected' ? 'available' : cur));

    for (const chunk of rowChunks()){
      for (let i=0;i<chunk.length;i++){
        const c = chunk[i], l = chunk[i-1], r = chunk[i+1];
        if (l && r){
          const st = rowStates[c], stL = rowStates[l], stR = rowStates[r];
          const blocked = (v)=> v==='booked' || v==='selected';
          if (st==='available' && blocked(stL) && blocked(stR)) return true;
        }
      }
    }
    return false;
  }

  function flipTooltip(t){
    const r = t.getBoundingClientRect(), vw=innerWidth, vh=innerHeight;
    t.removeAttribute('data-pos');
    if (r.left < 120) t.dataset.pos='right';
    else if (vw-r.right<120) t.dataset.pos='left';
    else if (vh-r.bottom<80) t.dataset.pos='top';
  }

  function gateCTA(){
    // bật CTA khi tất cả ghế đã được gán Adult/Child
    const ok = state.selected.size > 0 && [...state.selected].every(code => state.assigned.has(code));
    $('#btnContinue').disabled = $('#btnPay').disabled = !ok;
  }

  function showSeatWarning(seatEl, msg){
    // xóa tip cũ nếu có
    const old = document.getElementById('seatWarn');
    if (old) old.remove();

    const tip = document.createElement('div');
    tip.id = 'seatWarn';
    tip.className = 'inline-hint';
    tip.textContent = msg;
    document.body.appendChild(tip);

    // định vị ngay trên ghế
    const r = seatEl.getBoundingClientRect();
    const x = r.left + r.width/2 - tip.offsetWidth/2;
    const y = r.top - tip.offsetHeight - 8;
    tip.style.left = Math.max(8, Math.min(innerWidth - tip.offsetWidth - 8, x)) + 'px';
    tip.style.top  = Math.max(8, y) + 'px';

    // fade-in và tự ẩn
    requestAnimationFrame(()=> tip.classList.add('show'));
    setTimeout(()=> tip.remove(), 1800);
  }

  // ===== Render grid =====
  function addAisle(container){
    const gap=document.createElement('div');
    gap.className='aisle';
    gap.setAttribute('aria-hidden','true');
    container.appendChild(gap);
  }

  function renderHeadOrFoot(){
    const row = document.createElement('div');
    row.className = 'col-grid';
    row.appendChild(Object.assign(document.createElement('div'), {className:'col-spacer'}));
    COLS.forEach(c => { 
      row.appendChild(Object.assign(document.createElement('div'), {className:'col-label', textContent:String(c)})); 
      if (AISLES_AFTER.includes(c)) row.appendChild(Object.assign(document.createElement('div'), {className:'col-aisle'})); 
    });
    row.appendChild(Object.assign(document.createElement('div'), {className:'col-spacer'}));
    return row;
  }

  function renderGrid(){
    const wrap = $('#seatGrid'); wrap.innerHTML = '';
    wrap.appendChild(renderHeadOrFoot());
    ROWS.forEach((r) => {
      const row = document.createElement('div'); row.className = 'grid';
      row.appendChild(Object.assign(document.createElement('div'), {className:'row-label', textContent:r}));

      COLS.forEach(c => {
        const code = codeOf(r, c);
        const zone = state.seats[code]?.zone || zoneOf(r); 
        const btn = document.createElement('button');
        btn.type='button'; btn.className='seat'; btn.id=`s-${code}`;
        btn.dataset.zone=zone; btn.setAttribute('role','gridcell'); btn.setAttribute('aria-label', `Ghế ${code} — ${zone}`);
        
        const st = state.seats[code]?.state || 'available';
        btn.dataset.state = st;
        btn.setAttribute('aria-selected', st === 'selected' ? 'true' : 'false');

// --- XỬ LÝ GIAO DIỆN GHẾ ĐÔI (COUPLE) + TOOLTIP ---
if (zone === 'couple') {
  const isLeft = c % 2 !== 0;        // cột lẻ = ghế trái
  const leftCol  = isLeft ? c : c - 1;
  const rightCol = leftCol + 1;

  const pairText  = `${leftCol}-${rightCol}`;       // text hiển thị trên ghế: 1-2, 3-4,...
  const pairLabel = `${r}${leftCol}-${r}${rightCol}`; // label đầy đủ: J1-J2,...

  btn.classList.add(isLeft ? 'couple-left' : 'couple-right');

  // Chỉ ghế trái hiển thị text, ghế phải để trống (chỉ là vùng click)
  btn.textContent = isLeft ? pairText : '';

  const couplePrice = getDisplayPrice('couple', 'adult');
  btn.dataset.tip = `${pairLabel} • Ghế đôi (Couple) • ${
    couplePrice ? toVND(couplePrice) : '-'
  }/ghế`;
  btn.setAttribute('aria-label', `Ghế đôi ${pairLabel}`);
} else {
  btn.textContent = c;

  const pAdult = getDisplayPrice(zone, 'adult');
  const pChild = getDisplayPrice(zone, 'child');
  btn.dataset.tip = `${code} • ${zone.toUpperCase()} • Adult ${
    pAdult ? toVND(pAdult) : '-'
  } / Child ${
    pChild ? toVND(pChild) : '-'
  }`;
  btn.setAttribute('aria-label', `Ghế ${code} — ${zone}`);
}


        state.seats[code] = { zone, state: st };
        row.appendChild(btn);
        if (AISLES_AFTER.includes(c)) addAisle(row);
      });

      row.appendChild(Object.assign(document.createElement('div'), {className:'row-label', textContent:r}));
      wrap.appendChild(row);
    });
    wrap.appendChild(renderHeadOrFoot());
  }

  // ===== Load movie/showtime (đọc localStorage + query; merge an toàn) =====

  async function loadShowAndMovie() {
    const q = new URLSearchParams(location.search);

    // Ưu tiên lấy id suất chiếu từ query: ?showtimeId=... hoặc ?st=...
    const stId = q.get('showtimeId') || q.get('st') || q.get('showtime') || null;

    let detail = null;
    if (stId) {
      detail = await apiGet(`/showtimes/${encodeURIComponent(stId)}`);
    }

    if (detail) {
      // Tuỳ BE đặt tên, cố gắng map linh hoạt
      const st = detail;   // detail chính là showtimeDetailDTO trả về từ BE

      state.show.id      = st.showtimeId;
      state.show.theater = st.theaterName;
      state.show.date    = st.showDate;
      state.show.time    = st.startTime;
      state.show.format  = st.formatName;

      // Movie
      state.movie.id        = st.movieId;
      state.movie.title     = st.movieTitle;
      state.movie.posterUrl = st.posterUrl || st.poster_url || '';
      state.movie.trailerUrl= st.trailerUrl || st.trailer_url || '';
      state.movie.year      = st.releaseYear;
      state.movie.genres    = st.genres || [];
      state.movie.duration  = st.durationMin;

      // Map pricing từ BE sang PRICING (FE chỉ dùng hiển thị)
      if (detail.pricing && detail.pricing.byZone) {
        const p = detail.pricing.byZone;

        ['standard', 'vip', 'couple'].forEach((zone) => {
          const z = p[zone];
          if (!z) return;

          const adult = typeof z.adult === 'number' ? z.adult : null;
          const child = typeof z.child === 'number' ? z.child : null;

          PRICING.byZone[zone] = { adult, child };

          // Fallback: nếu chỉ có adult, dùng cho tooltip/bảng giá
          if (adult != null) {
            SEAT_PRICE[zone] = adult;
          }
        });
      }
    } else {
      // Nếu BE chưa sẵn / lỗi, để tạm giá trị mặc định
      console.warn('[seatmap] Không lấy được dữ liệu suất chiếu từ BE, dùng placeholder.');
    }
  if (!state.movie.trailerUrl) {
    state.movie.trailerUrl = 'https://www.youtube.com/watch?v=U2Qp5pL3ovA';
  }
    // Bind UI (giữ y nguyên logic cũ)
    $('#mvPoster').src = state.movie.posterUrl || 'https://picsum.photos/seed/poster/400/600';
    $('#mvTitle').textContent = state.movie.title || '—';
    $('#mvMeta').textContent = [
      state.movie.year && String(state.movie.year),
      (state.movie.genres || []).join(', '),
      state.movie.duration && `${state.movie.duration} phút`
    ].filter(Boolean).join(' • ') || '—';

    $('#mvTheater').textContent = state.show.theater || 'D-Cine';
    $('#mvDate').textContent    = state.show.date || '--/--/----';
    $('#mvTime').textContent    = state.show.time || '--:--';
    $('#mvFormat').textContent  = state.show.format || '2D';

    const tBtn  = $('#btnTrailer');
    const pPlay = $('#posterPlayBtn');

    if (state.movie.trailerUrl) {
      const openTrailer = () => (
        window.openTrailerModal
          ? window.openTrailerModal(state.movie.trailerUrl)
          : window.open(state.movie.trailerUrl, '_blank'));

      if (tBtn) {
        tBtn.disabled = false;
        tBtn.onclick  = openTrailer;
      }
      if (pPlay) {
        pPlay.hidden  = false;
        pPlay.onclick = openTrailer;
      }
    } else {
      if (tBtn)  tBtn.remove();
      if (pPlay) pPlay.remove();
    }
  }
async function loadSeatStatesFromApi() {
  const id = state.show.id;
  if (!id) return;

  const data = await apiGet(`/showtimes/${encodeURIComponent(id)}/seats`);
  if (!data) return;

  // ----- layout từ BE -----
  if (Array.isArray(data.rows) && data.rows.length) {
    ROWS = data.rows;                   // ["A","B","C",...]
  }
  if (Array.isArray(data.aislesAfter)) {
    AISLES_AFTER = data.aislesAfter;    // [4, 9, ...]
  }
  if (typeof data.cols === 'number' && data.cols > 0) {
    COLS = Array.from({ length: data.cols }, (_, i) => i + 1);
  }

  // ----- seats từ BE -----
  const seats = Array.isArray(data.seats) ? data.seats : [];
  state.seats = {}; // clear trước cho sạch

  seats.forEach((s) => {
    const code = s.code || (s.row && s.col ? `${s.row}${s.col}` : null);
    if (!code) return;

    const row  = s.row || String(code[0]);
    let status = (s.status || '').toLowerCase();

    // Cho phép BE dùng flag boolean
    if (s.booked) status = 'booked';

    if (!['booked','held','holding','available','selected'].includes(status)) {
      status = 'available';
    }
    if (status === 'holding') status = 'held';

    state.seats[code] = {
      zone: s.zone || zoneOf(row),   // nếu BE không gửi zone thì fallback theo row
      state: status                  // "booked" / "held" / "available"
    };
    // === RESTORE GHẾ SELECTED TỪ BACKEND ===
    if (status === 'selected') {
        state.selected.add(code);

        // Nếu BE không gửi loại vé -> dùng adult mặc định
        if (!state.assigned.has(code)) {
            state.assigned.set(code, 'adult');
        }
    }
  });
}


  // ===== Popover chọn loại vé =====
  const pop = { el:null, seatEl:null, code:'', zone:'' };

  function openSeatPopover(seatEl, code){
    if (!pop.el) pop.el = document.getElementById('seatPopover');
    pop.seatEl = seatEl;
    pop.code   = code;
    pop.zone   = state.seats[code]?.zone || 'standard';

    const adPrice = getDisplayPrice(pop.zone, 'adult');
    const chPrice = getDisplayPrice(pop.zone, 'child');

    $('#popoverTitle').textContent = `Chọn vé cho ghế ${code} (${pop.zone.toUpperCase()})`;
    
    $('#labelAdult').textContent = `Người lớn (${
      adPrice ? toVND(adPrice) : '-'
    })`;
    $('#labelChild').textContent = `Trẻ em (${
      chPrice ? toVND(chPrice) : '-'
    })`; // Sẽ rẻ hơn

    pop.el.hidden = false;
    setTimeout(()=> document.getElementById('pickAdult').focus(), 0);
  }

  function closeSeatPopover(){
    if (pop.el) pop.el.hidden = true;
    pop.seatEl = null; pop.code = ''; pop.zone = '';
  }

  function assignSeat(type){
    if (!pop.seatEl || !pop.code) return;

    state.assigned.set(pop.code, type);
    state.selected.add(pop.code);
    pop.seatEl.dataset.state = 'selected';
    pop.seatEl.setAttribute('aria-selected','true');
    sendSeatHold([{ code: pop.code, type }], 'hold');

    closeSeatPopover();
    syncSummary();
  }

  // ===== Price matrix & summary =====
  function renderPriceMatrix(){
    const m = $('#priceMatrix');
    // Tính giá tĩnh hiển thị trên bảng (ưu tiên giá từ PRICING)
    const vipA = getDisplayPrice('vip', 'adult');
    const stdA = getDisplayPrice('standard', 'adult');
    const cplA = getDisplayPrice('couple', 'adult');

    const vipC = getDisplayPrice('vip', 'child');
    const stdC = getDisplayPrice('standard', 'child');
    const cplC = getDisplayPrice('couple', 'child');

    // Render HTML: Cột cuối sửa thành Couple (màu hồng)
    m.innerHTML = `
      <div class="head"></div>
      <div class="head z"><span class="dot vip"></span>VIP</div>
      <div class="head z"><span class="dot std"></span>Standard</div>
      <div class="head z"><span class="dot couple"></span>Couple</div>

      <div class="head">Adult</div>
      <div class="cell"><span>x0</span><span>${vipA ? toVND(vipA) : '-'}</span></div>
      <div class="cell"><span>x0</span><span>${stdA ? toVND(stdA) : '-'}</span></div>
      <div class="cell"><span>x0</span><span>${cplA ? toVND(cplA) : '-'}</span></div>

      <div class="head">Child</div>
      <div class="cell"><span>x0</span><span>${vipC ? toVND(vipC) : '-'}</span></div>
      <div class="cell"><span>x0</span><span>${stdC ? toVND(stdC) : '-'}</span></div>
      <div class="cell"><span>x0</span><span>${cplC ? toVND(cplC) : '-'}</span></div>
    `;
  }

  // ===== Gọi BE tính giá =====
  async function requestPricingPreview() {
    const id = state.show.id || showtimeId();
    if (!id || !state.selected.size) {
      lastPricingPreview = null;
      return;
    }

    const seatsPayload = [...state.selected].map((code) => ({
      code,
      type: state.assigned.get(code) || 'adult'
    }));

    const res = await apiPost(`/showtimes/${encodeURIComponent(id)}/pricing-preview`, {
      seats: seatsPayload
    });

    if (!res) return;

    lastPricingPreview = res;
    applyPreviewToSummary(res);
  }

  function applyPreviewToSummary(preview) {
    const items = Array.isArray(preview.items) ? preview.items : [];
    const total = typeof preview.totalAmount === 'number'
      ? preview.totalAmount
      : items.reduce((sum, it) => sum + (it.price || 0), 0);

    // Tổng ghế
    $('#selCount').textContent = `${items.length} ghế được chọn`;
    $('#grandTotal').textContent = toVND(total);

  const count = {
    adult:   { vip: 0, standard: 0, couple: 0 },
    child:   { vip: 0, standard: 0, couple: 0 }
  };

  let adultTotal = 0;
  let childTotal = 0;

  items.forEach((it) => {
    const who  = it.type === 'child' ? 'child' : 'adult';
    const zone = it.zone || state.seats[it.code]?.zone || zoneOf(it.code[0]);
    const price = it.price || 0;   // giá BE trả

    if (count[who][zone] === undefined) return;
    count[who][zone]++;

    if (who === 'child') childTotal += price;
    else                 adultTotal += price;
  });

    const adNum = count.adult.vip + count.adult.standard + count.adult.couple;
    const chNum = count.child.vip + count.child.standard + count.child.couple;
    $('#adTotal').textContent = toVND(adultTotal);
    $('#chTotal').textContent = toVND(childTotal);
    $('#adCount').textContent = `(x${adNum})`;
    $('#chCount').textContent = `(x${chNum})`;

    // Update bảng matrix
    const cells = $$('#priceMatrix .cell');
    if (cells.length >= 6) {
      // Adult: VIP - Standard - Couple
      cells[0].firstElementChild.textContent = `x${count.adult.vip}`;
      cells[1].firstElementChild.textContent = `x${count.adult.standard}`;
      cells[2].firstElementChild.textContent = `x${count.adult.couple}`;
      // Child: VIP - Standard - Couple
      cells[3].firstElementChild.textContent = `x${count.child.vip}`;
      cells[4].firstElementChild.textContent = `x${count.child.standard}`;
      cells[5].firstElementChild.textContent = `x${count.child.couple}`;
    }

    // Render chip ghế (giữ logic gộp couple như cũ, nhưng dựa vào items)
    const arr = [...items].sort((a, b) => {
      const ca = a.code; const cb = b.code;
      if (ca[0] === cb[0]) return (+ca.slice(1)) - (+cb.slice(1));
      return ca[0].localeCompare(cb[0]);
    });

    const chips = [];
    const seenCouple = new Set();

    for (const it of arr) {
      const code = it.code;
      const zone = it.zone || state.seats[code]?.zone || zoneOf(code[0]);
      const who  = it.type;

      if (zone !== 'couple') {
        chips.push(
          `<span class="seat-chip ${zone}">${code} <small>${who === 'child' ? '(Child)' : ''}</small></span>`
        );
        continue;
      }

      const row = code[0];
      const col = Number(code.slice(1));
      const leftCol  = col % 2 === 0 ? col - 1 : col;
      const rightCol = leftCol + 1;
      const pairLabel = `${row}${leftCol}-${row}${rightCol}`;

      if (seenCouple.has(pairLabel)) continue;
      seenCouple.add(pairLabel);

      chips.push(`<span class="seat-chip couple">${pairLabel}</span>`);
    }

    $('#selList').innerHTML = chips.join('');
  }

  function syncSummary(){
    if (!state.selected.size) {
      $('#selCount').textContent   = '0 ghế được chọn';
      $('#grandTotal').textContent = toVND(0);
      $('#adCount').textContent    = '(x0)';
      $('#chCount').textContent    = '(x0)';
      $('#selList').innerHTML      = '';
      $('#adTotal').textContent    = toVND(0);
      $('#chTotal').textContent    = toVND(0);

      const cells = $$('#priceMatrix .cell');
      cells.forEach((cell) => {
        const span = cell.firstElementChild;
        if (span) span.textContent = 'x0';
      });

      $('#hint').textContent = 'Hãy chọn ghế để tiếp tục.';
      gateCTA();
      lastPricingPreview = null;
      return;
    }

    $('#hint').textContent = '';
    gateCTA();

    // Gọi BE tính giá & cập nhật summary
    requestPricingPreview();
  }

async function onContinue(goTo = 'concessions.html') {
  if (!state.selected.size) return;

  const id = state.show.id || showtimeId();
  const seatsPayload = [...state.selected].map(code => ({
    code,
    type: state.assigned.get(code) || 'adult'
  }));

  // 1. Gọi API tạo booking PENDING
  const booking = await createBooking(id, seatsPayload);

  if (!booking) {
    alert('Không tạo được booking, vui lòng thử lại.');
    return;
  }

  // 2. Lấy items + total từ BE, fallback nếu BE chưa trả đủ
  const items = Array.isArray(booking.items) && booking.items.length
    ? booking.items
    : seatsPayload.map(s => ({
        code: s.code,
        zone: state.seats[s.code]?.zone || zoneOf(s.code[0]),
        type: s.type,
        price: 0
      }));

  const total = typeof booking.totalAmount === 'number'
    ? booking.totalAmount
    : items.reduce((sum, it) => sum + (it.price || 0), 0);

  const bookingId = booking.bookingId || booking.id || booking.bookingCode;

  // 3. Lưu vào localStorage cho trang sau dùng
  localStorage.setItem('booking_cart', JSON.stringify({
    bookingId,          // << QUAN TRỌNG: khoá chính để làm việc với BE
    showtimeId: id,
    items,
    totalAmount: total,
    status: booking.status || 'PENDING',
    meta: {
      theater:    state.show.theater,
      date:       state.show.date,
      time:       state.show.time,
      movieId:    state.movie.id,
      movieTitle: state.movie.title
    }
  }));

  // 4. Điều hướng sang trang tiếp theo
  location.href = goTo;
}


  // ===== Events =====
  function onSeatGridClick(e){
    const seat = e.target.closest('.seat'); 
    if (!seat || !$('#seatGrid').contains(seat)) return;
    if (seat.dataset.state === 'booked' || seat.dataset.state === 'held') return;

    const code = seat.id.slice(2);
    const rowL = code[0], colN = Number(code.slice(1));
    const isSelected = seat.dataset.state === 'selected';
    const zone = state.seats[code]?.zone; 

    if (zone === 'couple') {
      const isLeft   = colN % 2 !== 0;
      const pairNum  = isLeft ? colN + 1 : colN - 1;
      const pairCode = `${rowL}${pairNum}`;
      const pairEl   = document.getElementById(`s-${pairCode}`);

      if (!pairEl || pairEl.dataset.state === 'booked' || pairEl.dataset.state === 'held') {
        alert("Ghế đôi này không bán lẻ hoặc 1 bên đã được đặt!");
        return;
      }

      const changed = [code, pairCode];

      if (isSelected) {
        // Bỏ chọn cả 2 + release hold
        changed.forEach(c => {
          state.selected.delete(c);
          state.assigned.delete(c);
          const el = document.getElementById(`s-${c}`);
          if (el) {
            el.dataset.state = 'available';
            el.setAttribute('aria-selected','false');
          }
        });
        sendSeatHold(
  changed.map(c => ({ code: c })), 
  'release'
);
      } else {
        // Chọn cả 2 (mặc định Adult) + hold
        changed.forEach(c => {
          state.selected.add(c);
          state.assigned.set(c, 'adult');
          const el = document.getElementById(`s-${c}`);
          if (el) {
            el.dataset.state = 'selected';
            el.setAttribute('aria-selected','true');
          }
        });
        sendSeatHold(
          changed.map(c => ({ code: c, type: "adult" })), 
          'hold'
        );
      }

      syncSummary();
      return;
    }

    if (isSelected){
      state.selected.delete(code);
      state.assigned.delete(code);
      seat.dataset.state = 'available';
      seat.setAttribute('aria-selected','false');
      sendSeatHold([code], 'release');

      syncSummary();
      return;
    }

    // ⛔ Chưa chọn → kiểm tra rule rồi mở popover
    if (violatesSingleGap(rowL, colN, true)) {
      const msg = 'Quy tắc rạp: không để lại 1 ghế trống kẹp giữa. Hãy chọn liền kề.';
      $('#hint').textContent = msg;               // hiện ở panel Summary
      showSeatWarning(seat, msg);                 // hiện ngay cạnh ghế
      seat.classList.add('shake'); 
      setTimeout(()=> seat.classList.remove('shake'), 250);
      return;
    }

    openSeatPopover(seat, code);
  }

  function onSeatMouseEnter(e){
    const seat = e.target.closest('.seat');
    if (seat) flipTooltip(seat);
  }

  // ===== Boot =====
  document.addEventListener('DOMContentLoaded', async () => {
    try { if (window.mountHeader)      mountHeader('#hdr-include'); } catch {}
    try { if (window.mountFooter)      mountFooter('#footer-include'); } catch {}
    try { if (window.mountBreadcrumb)  mountBreadcrumb(); } catch {}

    // 1. Lấy thông tin suất chiếu + phim từ BE
    await loadShowAndMovie();
    // 1. Lấy thông tin từ state sau khi đã load BE
    const movieId    = state.movie.id;
    const showtimeId = state.show.id;

    const showtimeUrl = movieId
      ? `showtime.html?movie=${encodeURIComponent(movieId)}`
      : 'showtime.html';

    const movieUrl = movieId
      ? `movie-detail.html?movie=${encodeURIComponent(movieId)}`
      : 'index.html';

    // 2. Nút back trên header + trong summary
    const btnBackShow = document.getElementById('btnBackShowtime');
    if (btnBackShow) btnBackShow.href = showtimeUrl;

    const btnBackMovie = document.getElementById('btnBackMovie');
    if (btnBackMovie) btnBackMovie.href = movieUrl;

    // 3. Cập nhật breadcrumb (nếu có)
    const bc = document.querySelector('nav.breadcrumb');
    if (bc) {
      const linkShow = bc.querySelector('a[href*="showtime.html"]');
      if (linkShow) linkShow.href = showtimeUrl;

      const linkSeat = bc.querySelector('a[href*="seat-map.html"]');
      if (linkSeat && showtimeId) {
        linkSeat.href = `seat-map.html?showtimeId=${encodeURIComponent(showtimeId)}`;
      }
    }
    // 2. Lấy trạng thái ghế từ BE
    await loadSeatStatesFromApi();

    // 3. Vẽ ghế + summary
    renderGrid();
    renderPriceMatrix();
    syncSummary();

    // seat events
    const grid = $('#seatGrid');
    grid.addEventListener('click', onSeatGridClick);
    grid.addEventListener('mouseenter', onSeatMouseEnter, true);
    // Double-click ghế đã chọn để đổi loại vé
    grid.addEventListener('dblclick', (e) => {
      const seat = e.target.closest('.seat');
      if (!seat || seat.dataset.state !== 'selected') return;
      openSeatPopover(seat, seat.id.slice(2));
    }); 

    // popover events (single set)
    const popEl = $('#seatPopover');
    $('#pickAdult').addEventListener('click', () => assignSeat('adult'));
    $('#pickChild').addEventListener('click', () => assignSeat('child'));
    $('#pickCancel').addEventListener('click', closeSeatPopover);
    popEl.querySelector('.popover-backdrop')
        .addEventListener('click', closeSeatPopover);
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !popEl.hidden) closeSeatPopover();
    });

    // CTA
    $('#btnContinue').addEventListener('click', () => onContinue('concessions.html'));
    $('#btnPay').addEventListener('click', () => onContinue('payment.html'));
  });

// Dọn dẹp (trang success gọi) – xoá data giỏ vé mới
window.clearSeatBookingState = () => {
  localStorage.removeItem('booking_cart');
  localStorage.removeItem('orderCombos');
};

})();
