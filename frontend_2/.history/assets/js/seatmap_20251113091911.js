(() => {
  const $  = (s, r=document) => r.querySelector(s);
  const $$ = (s, r=document) => [...r.querySelectorAll(s)];
  const toVND = (n) => (Math.round(Number(n)||0)).toLocaleString('vi-VN') + 'đ';

  // ===== Config =====
  const ROWS = 'ABCDEFGHIJ'.split('');
  const COLS = Array.from({length:16}, (_,i)=>i+1);
  const AISLES_AFTER = [4, 12];

  const ZONES = { vip:new Set(['A','B','C']), standard:new Set(['D','E','F','G','H']), economy:new Set(['I','J']) };
  const ZONE_RATE = { vip:1.2, standard:1.0, economy:0.9 };
  const PRICE = { adult:120000, child:90000 };

  const MOCK_BOOKED = new Set(['A2','A3','A7','B4','B5','C10','C11','D3','E7','F12','G8','H15','I2','J14']);

  // ===== State (đã lược bỏ mode/qty/quota cũ) =====
  const state = {
    seats:{},                      // { "A1": {zone, state} }
    selected:new Set(),            // Set<"A1">
    assigned:new Map(),            // Map<"A1","adult"|"child">
    show:{ theater:'D-Cine', date:'', time:'', format:'' },
    movie:{ id:null, title:'—', posterUrl:'', trailerUrl:'', year:'', genres:[], duration:'' }
  };

  // ===== Helpers =====
  const zoneOf = (row) => ZONES.vip.has(row) ? 'vip' : (ZONES.standard.has(row) ? 'standard' : 'economy');
  const codeOf = (r,c)=> `${r}${c}`;
  const showtimeId = () => [state.movie.id||'mv', state.show.theater, state.show.date, state.show.time]
    .join('|').replace(/\s+/g,'_');
  const bookingKey = () => `booking::${showtimeId()}`;

  const getJSON = async (url) => { try{ const r = await fetch(url); if(!r.ok) throw 0; return await r.json(); }catch{ return null; } };

  function rowChunks(){ const a=[]; let cur=[]; for(const c of COLS){ cur.push(c); if (AISLES_AFTER.includes(c)){ a.push(cur); cur=[]; } } if(cur.length)a.push(cur); return a; }
  function violatesSingleGap(rowLetter, colNumber, willSelect){
    const rowStates = {};
    COLS.forEach(c=>{ const el = $(`#s-${rowLetter}${c}`); rowStates[c] = el ? el.dataset.state : 'available'; });
    const cur = rowStates[colNumber]; rowStates[colNumber] = (willSelect ? 'selected' : (cur==='selected' ? 'available' : cur));
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
  function addAisle(container){ const gap=document.createElement('div'); gap.className='aisle'; gap.setAttribute('aria-hidden','true'); container.appendChild(gap); }
  function renderHeadOrFoot(){
    const row = document.createElement('div'); row.className = 'col-grid';
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
        const code = codeOf(r,c), zone = zoneOf(r);
        const btn = document.createElement('button');
        btn.type='button'; btn.className='seat'; btn.id=`s-${code}`;
        btn.dataset.zone=zone; btn.setAttribute('role','gridcell'); btn.setAttribute('aria-label', `Ghế ${code} — ${zone}`);
        const st = state.seats[code]?.state || (MOCK_BOOKED.has(code) ? 'booked' : 'available');
        btn.dataset.state = st; btn.setAttribute('aria-selected', st==='selected'?'true':'false');
        btn.textContent = c;
        btn.dataset.tip = `${code} • ${zone.toUpperCase()} • Adult ${toVND(PRICE.adult*(ZONE_RATE[zone]||1))} / Child ${toVND(PRICE.child*(ZONE_RATE[zone]||1))}`;
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
  const pick = (...xs) => xs.find(v => v !== undefined && v !== null && v !== "");

  async function loadShowAndMovie(){
    let st = null, mvQuick = null;
    try { st = JSON.parse(localStorage.getItem('selectedShowtime') || 'null'); } catch {}
    try { mvQuick = JSON.parse(localStorage.getItem('selectedMovie')  || 'null'); } catch {}
    const q = new URLSearchParams(location.search);

    const bases = [window.DATA_BASE, '../data', '/data'].filter(Boolean);
    const [movies, shows, theaters] = await Promise.all([
      (async ()=>{ for (const b of bases){ const j = await getJSON(`${b}/movies.json`);    if (j) return j; } return null; })(),
      (async ()=>{ for (const b of bases){ const j = await getJSON(`${b}/showtimes.json`); if (j) return j; } return null; })(),
      (async ()=>{ for (const b of bases){ const j = await getJSON(`${b}/theaters.json`);  if (j) return j; } return null; })()
    ]);

    // Map theater name nếu chỉ có id
    if (st && st.theaterId && !st.theaterName && Array.isArray(theaters)) {
      const th = (theaters.items || theaters.theaters || theaters || []).find(t =>
        String(t.id ?? t.theaterId ?? t.code ?? t._id) === String(st.theaterId)
      );
      if (th) st.theaterName = th.name || th.title || 'D-Cine';
    }

    const movieId = pick(st?.movieId, mvQuick?.id, q.get('movie'), q.get('mv'));
    const listMovies = movies ? (Array.isArray(movies) ? movies : [ ...(movies.now||[]), ...(movies.soon||[]) ]) : [];
    const mvFromData = listMovies.find(x => String(x.id) === String(movieId));
    const mv = Object.assign({}, mvFromData || {}, mvQuick || {}); // ưu tiên mvQuick ghi đè

    // Gắn show
    state.show.theater = pick(st?.theaterName, st?.theater, q.get('theater'), state.show.theater);
    state.show.date    = pick(st?.date,        q.get('date'),   state.show.date);
    state.show.time    = pick(st?.time,        q.get('time'),   state.show.time);
    state.show.format  = pick(st?.format,      q.get('format'), state.show.format);

    // Gắn movie
    state.movie.id        = mv?.id || movieId || null;
    state.movie.title     = mv?.title || state.movie.title;
    state.movie.posterUrl = mv?.posterUrl || mv?.poster || state.movie.posterUrl || '';
    state.movie.trailerUrl= mv?.trailerUrl || state.movie.trailerUrl || '';
    state.movie.year      = mv?.year || (mv?.releaseDate||'').slice(0,4) || '';
    state.movie.genres    = mv?.genres || (mv?.genre ? [mv.genre] : []);
    state.movie.duration  = mv?.duration || mv?.runtime || '';

    // Bind UI
    $('#mvPoster').src = state.movie.posterUrl || 'https://picsum.photos/seed/poster/400/600';
    $('#mvTitle').textContent = state.movie.title || '—';
    $('#mvMeta').textContent = [
      state.movie.year && String(state.movie.year),
      (state.movie.genres||[]).join(', '),
      state.movie.duration && `${state.movie.duration} phút`
    ].filter(Boolean).join(' • ') || '—';

    $('#mvTheater').textContent = state.show.theater || 'D-Cine';
    $('#mvDate').textContent    = state.show.date || '--/--/----';
    $('#mvTime').textContent    = state.show.time || '--:--';
    $('#mvFormat').textContent  = state.show.format || '2D';

    const tBtn = $('#btnTrailer');
    if (state.movie.trailerUrl) {
      tBtn.disabled = false;
      tBtn.onclick  = () => (window.openTrailerModal
        ? window.openTrailerModal(state.movie.trailerUrl)
        : window.open(state.movie.trailerUrl, '_blank'));
    } else {
      tBtn.remove(); // bỏ luôn nút khi không có trailer
    }
  }

  // ===== Popover chọn loại vé =====
  const pop = { el:null, seatEl:null, code:'', zone:'' };

  function openSeatPopover(seatEl, code){
    if (!pop.el) pop.el = document.getElementById('seatPopover');
    pop.seatEl = seatEl;
    pop.code   = code;
    pop.zone   = state.seats[code]?.zone || 'standard';

    const rate = ZONE_RATE[pop.zone] || 1;
    $('#popoverTitle').textContent = `Chọn vé cho ghế ${code}`;
    $('#labelAdult').textContent   = `ODC Adult (${toVND(PRICE.adult*rate)})`;
    $('#labelChild').textContent   = `ODC Child (${toVND(PRICE.child*rate)})`;

    pop.el.hidden = false;
    setTimeout(()=> document.getElementById('pickAdult').focus(), 0);
  }

  function closeSeatPopover(){
    if (pop.el) pop.el.hidden = true;
    pop.seatEl = null; pop.code = ''; pop.zone = '';
  }

  function assignSeat(type){ // 'adult' | 'child'
    if (!pop.seatEl || !pop.code) return;
    state.assigned.set(pop.code, type);
    state.selected.add(pop.code);
    pop.seatEl.dataset.state = 'selected';
    pop.seatEl.setAttribute('aria-selected','true');
    closeSeatPopover();
    syncSummary();
  }

  // ===== Price matrix & summary =====
  function renderPriceMatrix(){
    const m = $('#priceMatrix');
    const vipA = toVND(PRICE.adult*ZONE_RATE.vip), stdA = toVND(PRICE.adult*ZONE_RATE.standard), ecoA = toVND(PRICE.adult*ZONE_RATE.economy);
    const vipC = toVND(PRICE.child*ZONE_RATE.vip), stdC = toVND(PRICE.child*ZONE_RATE.standard), ecoC = toVND(PRICE.child*ZONE_RATE.economy);
    m.innerHTML = `
      <div class="head"></div>
      <div class="head z"><span class="dot vip"></span>VIP</div>
      <div class="head z"><span class="dot std"></span>Standard</div>
      <div class="head z"><span class="dot eco"></span>Economy</div>
      <div class="head">Adult</div>
      <div class="cell"><span>x0</span><span>${vipA}</span></div>
      <div class="cell"><span>x0</span><span>${stdA}</span></div>
      <div class="cell"><span>x0</span><span>${ecoA}</span></div>
      <div class="head">Child</div>
      <div class="cell"><span>x0</span><span>${vipC}</span></div>
      <div class="cell"><span>x0</span><span>${stdC}</span></div>
      <div class="cell"><span>x0</span><span>${ecoC}</span></div>
    `;
  }

  function syncSummary(){
    $('#selCount').textContent = `${state.selected.size} ghế được chọn`;

    let adultTotal=0, childTotal=0;
    const count = { adult:{vip:0,standard:0,economy:0}, child:{vip:0,standard:0,economy:0} };

    for (const code of state.selected){
      const who  = state.assigned.get(code);
      const zone = state.seats[code]?.zone || zoneOf(code[0]);
      const rate = ZONE_RATE[zone] || 1;
      if (who === 'adult'){ adultTotal += PRICE.adult*rate; count.adult[zone]++; }
      if (who === 'child'){ childTotal += PRICE.child*rate; count.child[zone]++; }
    }

    $('#adTotal').textContent    = adultTotal ? toVND(adultTotal) : '0đ';
    $('#chTotal').textContent    = childTotal ? toVND(childTotal) : '0đ';
    $('#grandTotal').textContent = toVND(adultTotal + childTotal);

    const adNum = count.adult.vip + count.adult.standard + count.adult.economy;
    const chNum = count.child.vip + count.child.standard + count.child.economy;
    $('#adCount').textContent = `(x${adNum})`;
    $('#chCount').textContent = `(x${chNum})`;

    const cells = $$('#priceMatrix .cell');
    if (cells.length >= 6){
      cells[0].firstElementChild.textContent = `x${count.adult.vip}`;
      cells[1].firstElementChild.textContent = `x${count.adult.standard}`;
      cells[2].firstElementChild.textContent = `x${count.adult.economy}`;
      cells[3].firstElementChild.textContent = `x${count.child.vip}`;
      cells[4].firstElementChild.textContent = `x${count.child.standard}`;
      cells[5].firstElementChild.textContent = `x${count.child.economy}`;
    }

    const arr = [...state.selected].sort((a,b)=> a[0]===b[0] ? (+a.slice(1))-(+b.slice(1)) : a[0].localeCompare(b[0]));
    $('#selList').innerHTML = arr.map(s=>{
      const who = state.assigned.get(s);
      return `<span class="seat-chip">${s}${who?` (${who==='adult'?'Adult':'Child'})`:''}</span>`;
    }).join('');

    $('#hint').textContent = state.selected.size ? '' : 'Hãy chọn ghế để tiếp tục.';
    gateCTA();
  }

  // ===== Booking (khôi phục & lưu) =====
  function loadBooking(){
    try{
      const b = JSON.parse(localStorage.getItem(bookingKey())||'null');
      if(!b || !Array.isArray(b.seats)) return;
      // Khôi phục mapping nếu có
      if (b.assign && typeof b.assign === 'object'){
        for (const [code, who] of Object.entries(b.assign)){
          state.selected.add(code);
          state.assigned.set(code, who);
          const el = document.getElementById(`s-${code}`);
          if (el && el.dataset.state!=='booked'){ el.dataset.state='selected'; el.setAttribute('aria-selected','true'); }
        }
      } else {
        // Fallback: nếu chỉ có số Adult thì gán lần lượt
        const ad = b.tickets?.adult|0;
        b.seats.forEach((code,i)=>{
          state.selected.add(code);
          state.assigned.set(code, i<ad ? 'adult' : 'child');
          const el = document.getElementById(`s-${code}`);
          if (el && el.dataset.state!=='booked'){ el.dataset.state='selected'; el.setAttribute('aria-selected','true'); }
        });
      }
    }catch{}
  }

  function onContinue(goTo='concessions.html'){
    // tính lại tổng từ mapping hiện tại
    let adultTotal=0, childTotal=0;
    for (const code of state.selected){
      const who  = state.assigned.get(code);
      const zone = state.seats[code]?.zone || zoneOf(code[0]);
      const rate = ZONE_RATE[zone] || 1;
      if (who==='adult') adultTotal += PRICE.adult*rate;
      if (who==='child') childTotal += PRICE.child*rate;
    }

    const booking = {
      showtimeId: showtimeId(),
      movieId: state.movie.id, movieTitle: state.movie.title, posterUrl: state.movie.posterUrl,
      theater: state.show.theater, showDate: state.show.date, showTime: state.show.time, format: state.show.format,
      seats: [...state.selected],
      assign: Object.fromEntries(state.assigned.entries()),   // 🔴 lưu mapping Adult/Child
      price: { adult: PRICE.adult, child: PRICE.child }, zoneRate: ZONE_RATE,
      total: Math.round(adultTotal + childTotal)
    };
    const breakdown = {};
    state.assigned.forEach((type) => { breakdown[type] = (breakdown[type]||0) + 1; });
    localStorage.setItem('selectedSeats', JSON.stringify({
      seats: [...state.selected],
      breakdown,
      total: Math.round(adultTotal + childTotal)
    }));
    localStorage.setItem(bookingKey(), JSON.stringify(booking));
    location.href = goTo;
  }

  // ===== Events =====
function onSeatGridClick(e){
  const seat = e.target.closest('.seat'); 
  if (!seat || !$('#seatGrid').contains(seat)) return;
  if (seat.dataset.state === 'booked') return;

  const code = seat.id.slice(2);
  const rowL = code[0], colN = Number(code.slice(1));
  const isSelected = seat.dataset.state === 'selected';

  // ✅ Đang chọn → click lần nữa để bỏ chọn
  if (isSelected){
    state.selected.delete(code);
    state.assigned.delete(code);
    seat.dataset.state = 'available';
    seat.setAttribute('aria-selected','false');
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

  function onSeatMouseEnter(e){ const seat = e.target.closest('.seat'); if (seat) flipTooltip(seat); }

  // ===== Boot =====
  document.addEventListener('DOMContentLoaded', async () => {
    try { if (window.mountHeader)      mountHeader('#hdr-include'); } catch {}
    try { if (window.mountFooter)      mountFooter('#footer-include'); } catch {}
    try { if (window.mountBreadcrumb)  mountBreadcrumb(); } catch {}

    await loadShowAndMovie();
    renderGrid();
    renderPriceMatrix();
    loadBooking();
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


  // Dọn dẹp (trang success gọi)
  window.clearSeatBookingState = () => {
    localStorage.removeItem(bookingKey());
  };
})();
