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

  // ===== State =====
  const state = {
    seats:{} , selected:new Set(),
    assigned:new Map(),                     // code -> 'adult'|'child' (chế độ vé trước)
    qty:{ adult:0, child:0 },               // ghế trước
    quota:{                                  // vé trước
      adult:{vip:0,standard:0,economy:0},
      child:{vip:0,standard:0,economy:0}
    },
    mode:'seat-first',                       // 'seat-first' | 'ticket-first'
    show:{ theater:'D-Cine', date:'', time:'', format:'' },
    movie:{ id:null, title:'—', posterUrl:'', trailerUrl:'', year:'', genres:[], duration:'' }
  };

  // ===== Helpers =====
  const zoneOf = (row) => ZONES.vip.has(row) ? 'vip' : (ZONES.standard.has(row) ? 'standard' : 'economy');
  const codeOf = (r,c)=> `${r}${c}`;
  const showtimeId = () => [state.movie.id||'mv', state.show.theater, state.show.date, state.show.time].join('|').replace(/\s+/g,'_');
  const selKey = () => `selectedSeats::${showtimeId()}`;
  const bookingKey = () => `booking::${showtimeId()}`;
  const quotaSum = () => {
    const q = state.quota, s = q.adult.vip+q.adult.standard+q.adult.economy+q.child.vip+q.child.standard+q.child.economy;
    return s|0;
  };
  const quotaLeft = (zone, type) => Math.max(0, state.quota[type][zone] - [...state.assigned.entries()].filter(([_,who]) => who===type).filter(([code]) => state.seats[code]?.zone===zone).length);

  const persistSelected = () => localStorage.setItem(selKey(), JSON.stringify([...state.selected]));
  const loadSelected = () => { try{ (JSON.parse(localStorage.getItem(selKey())||'[]')||[]).forEach(s=>state.selected.add(s)); }catch{} };

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

  // ===== Pricing / totals =====
  function smartSplitAndTotals(){
    // seat-first: tự gán Adult cho ghế đắt hơn trước
    if (state.mode==='seat-first'){
      const seats = [...state.selected].map(code => {
        const zone = state.seats[code]?.zone || zoneOf(code[0]);
        return { code, zone, rate: ZONE_RATE[zone] || 1 };
      }).sort((a,b)=> b.rate - a.rate);

      let adLeft = state.qty.adult, chLeft = state.qty.child;
      let adultTotal=0, childTotal=0;
      const count = { adult:{vip:0,standard:0,economy:0}, child:{vip:0,standard:0,economy:0} };

      for (const s of seats){ if (adLeft>0){ adultTotal += PRICE.adult * s.rate; count.adult[s.zone]++; adLeft--; } }
      for (const s of seats){ if (!Object.values(count.adult).some((v,i)=>i&&false) && chLeft>0 && !Object.keys(count.adult).includes(s.code)){ /* no-op */ } }
      for (const s of seats){ if ((count.child.vip+count.child.standard+count.child.economy) < state.qty.child && !Object.values(count.adult).reduce((a,b)=>a+b,0) || true){
          const alreadyAdult = (count.adult.vip+count.adult.standard+count.adult.economy) >= (state.qty.adult);
          if (!alreadyAdult && state.qty.adult>0) continue;
        }
      }
      // gán phần còn lại cho Child
      for (const s of seats){
        const adultAssigned = (count.adult.vip+count.adult.standard+count.adult.economy);
        const childAssigned = (count.child.vip+count.child.standard+count.child.economy);
        if (adultAssigned >= state.qty.adult && childAssigned < state.qty.child){
          childTotal += PRICE.child * s.rate; count.child[s.zone]++; 
        }
      }
      return { adultTotal, childTotal, count };
    }

    // ticket-first: dùng mapping state.assigned (đã gán khi click)
    let adultTotal=0, childTotal=0;
    const count = { adult:{vip:0,standard:0,economy:0}, child:{vip:0,standard:0,economy:0} };
    for (const code of state.selected){
      const who = state.assigned.get(code);
      const zone = state.seats[code]?.zone || zoneOf(code[0]);
      const rate = ZONE_RATE[zone]||1;
      if (who==='adult'){ adultTotal += PRICE.adult*rate; count.adult[zone]++; }
      else if (who==='child'){ childTotal += PRICE.child*rate; count.child[zone]++; }
    }
    return { adultTotal, childTotal, count };
  }

  function chipSeats(){
    const arr = [...state.selected].sort((a,b)=> a[0]===b[0] ? (+a.slice(1))-(+b.slice(1)) : a[0].localeCompare(b[0]));
    $('#selList').innerHTML = arr.map(s=>{
      const who = state.assigned.get(s); const tag = who ? (who==='adult'?'A':'C') : '';
      return `<span class="seat-chip">${s}${tag?` (${tag})`:''}</span>`;
    }).join('');
  }

  function gateCTA(){
    let ok=false;
    if (state.mode==='seat-first'){
      ok = state.selected.size>0 && (state.qty.adult + state.qty.child)===state.selected.size;
    } else {
      ok = state.selected.size>0 && state.selected.size===quotaSum();
    }
    $('#btnContinue').disabled = $('#btnPay').disabled = !ok;
  }

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
    $('#adCount').textContent  = `(x${state.mode==='seat-first'?state.qty.adult:state.quota.adult.vip+state.quota.adult.standard+state.quota.adult.economy})`;
    $('#chCount').textContent  = `(x${state.mode==='seat-first'?state.qty.child:state.quota.child.vip+state.quota.child.standard+state.quota.child.economy})`;

    const { adultTotal, childTotal, count } = smartSplitAndTotals();
    $('#adTotal').textContent  = adultTotal ? toVND(adultTotal) : '0đ';
    $('#chTotal').textContent  = childTotal ? toVND(childTotal) : '0đ';
    $('#grandTotal').textContent = toVND(adultTotal + childTotal);

    // show count in matrix
    const cells = $$('#priceMatrix .cell');
    cells[0].firstElementChild.textContent = `x${count.adult.vip}`;
    cells[1].firstElementChild.textContent = `x${count.adult.standard}`;
    cells[2].firstElementChild.textContent = `x${count.adult.economy}`;
    cells[3].firstElementChild.textContent = `x${count.child.vip}`;
    cells[4].firstElementChild.textContent = `x${count.child.standard}`;
    cells[5].firstElementChild.textContent = `x${count.child.economy}`;

    const hint = $('#hint');
    if (state.mode==='seat-first'){
      const diff = state.selected.size - (state.qty.adult + state.qty.child);
      hint.textContent = diff>0 ? `Bạn còn thiếu ${diff} vé.` : diff<0 ? `Đã vượt ${Math.abs(diff)} vé.` : (state.selected.size? '' : 'Hãy chọn ghế để tiếp tục.');
    } else {
      const diff = state.selected.size - quotaSum();
      hint.textContent = diff>0 ? `Đã chọn quá quota ${Math.abs(diff)} ghế.` : diff<0 ? `Còn thiếu ${Math.abs(diff)} ghế theo quota.` : (state.selected.size? '' : 'Đặt quota vé rồi chọn ghế.');
    }

    chipSeats();
    gateCTA();
  }

  function setQty(type, to){
    if (state.mode!=='seat-first') return;
    const totalSel = state.selected.size, other = type === 'adult' ? state.qty.child : state.qty.adult;
    to = Math.max(0, Math.min(99, to));
    if (to + other > totalSel) to = Math.max(0, totalSel - other);
    state.qty[type] = to;
    $('#qtyAdult').value = state.qty.adult;
    $('#qtyChild').value = state.qty.child;
    syncSummary();
  }

  function setQuota(key, delta){
    if (state.mode!=='ticket-first') return;
    const [who, z] = key.split('-'); // ad/ch - vip/std/eco
    const type = (who==='ad') ? 'adult' : 'child';
    state.quota[type][z] = Math.max(0, Math.min(99, state.quota[type][z] + delta));
    $('#q-'+key).value = state.quota[type][z];
    // đồng bộ qty tổng để breakdown hiển thị đẹp
    state.qty.adult = state.quota.adult.vip + state.quota.adult.standard + state.quota.adult.economy;
    state.qty.child = state.quota.child.vip + state.quota.child.standard + state.quota.child.economy;
    syncSummary();
  }

  // ===== Render grid =====
  function addAisle(container){ const gap=document.createElement('div'); gap.className='aisle'; gap.setAttribute('aria-hidden','true'); container.appendChild(gap); }
  function renderHeadOrFoot(){
    const row = document.createElement('div'); row.className = 'col-grid';
    row.appendChild(Object.assign(document.createElement('div'), {className:'col-spacer'}));
    COLS.forEach(c => { row.appendChild(Object.assign(document.createElement('div'), {className:'col-label', textContent:String(c)})); if (AISLES_AFTER.includes(c)) row.appendChild(Object.assign(document.createElement('div'), {className:'col-aisle'})); });
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

  // ===== Load movie/showtime (robust path & schema) =====
  const pick = (...xs) => xs.find(v => v !== undefined && v !== null && v !== "");
async function loadShowAndMovie(){
  // 1) lấy localStorage trước (hiển thị tức thì)
  let st = null, mvQuick = null;
  try { st = JSON.parse(localStorage.getItem('selectedShowtime') || 'null'); } catch {}
  try { mvQuick = JSON.parse(localStorage.getItem('selectedMovie')  || 'null'); } catch {}

  // 2) định nghĩa base path dữ liệu
  const bases = [window.DATA_BASE, '../data', '/data'].filter(Boolean);

  // 3) tải dữ liệu gốc (có thể khác schema)
  const [movies, shows, theaters] = await Promise.all([
    (async ()=>{ for (const b of bases){ const j = await getJSON(`${b}/movies.json`);    if (j) return j; } return null; })(),
    (async ()=>{ for (const b of bases){ const j = await getJSON(`${b}/showtimes.json`); if (j) return j; } return null; })(),
    (async ()=>{ for (const b of bases){ const j = await getJSON(`${b}/theaters.json`);  if (j) return j; } return null; })()
  ]);

  // 4) nếu có theaterId nhưng chưa có tên → map từ theaters.json
  if (st && st.theaterId && !st.theaterName && Array.isArray(theaters)) {
    const th = (theaters.items || theaters.theaters || theaters || []).find(t =>
      String(t.id ?? t.theaterId ?? t.code ?? t._id) === String(st.theaterId)
    );
    if (th) st.theaterName = th.name || th.title || 'D-Cine';
  }

  // 5) xác định movie theo id (ưu tiên selectedMovie)
const movieId = st?.movieId || mvQuick?.id;

const listMovies = movies
  ? (Array.isArray(movies) ? movies : [ ...(movies.now||[]), ...(movies.soon||[]) ])
  : [];

const mvFromData = listMovies.find(x => String(x.id) === String(movieId));
const mv = Object.assign({}, mvFromData || {}, mvQuick || {}); // merge: ưu tiên mvQuick ghi đè


  // 6) gắn state hiển thị
  if (st) {
    state.show.theater = st.theaterName || st.theater || state.show.theater;
    state.show.date    = st.date  || state.show.date;
    state.show.time    = st.time  || state.show.time;
    state.show.format  = st.format|| state.show.format;
  }
  if (mv) {
    state.movie.id        = mv.id || movieId || null;
    state.movie.title     = mv.title || state.movie.title;
    state.movie.posterUrl = mv.posterUrl || mv.poster || state.movie.posterUrl || '';
    state.movie.trailerUrl= mv.trailerUrl || state.movie.trailerUrl || '';
    state.movie.year      = mv.year || (mv.releaseDate||'').slice(0,4) || '';
    state.movie.genres    = mv.genres || (mv.genre ? [mv.genre] : []);
    state.movie.duration  = mv.duration || mv.runtime || '';
  }

  // 7) bind UI
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
    tBtn.remove();
  }
}

  // ===== Events =====
  function onSeatGridClick(e){
    const seat = e.target.closest('.seat'); if (!seat || !$('#seatGrid').contains(seat)) return;
    if (seat.dataset.state === 'booked') return;

    const code = seat.id.slice(2), rowL = code[0], colN = Number(code.slice(1));
    const wantSelect = seat.dataset.state !== 'selected';

    if (wantSelect && violatesSingleGap(rowL, colN, true)){
      $('#hint').textContent = 'Quy tắc rạp: không để lại 1 ghế trống kẹp giữa. Hãy chọn liền kề.';
      seat.classList.add('shake'); setTimeout(()=>seat.classList.remove('shake'), 250);
      return;
    }

    // CHẾ ĐỘ: seat-first
    if (state.mode==='seat-first'){
      if (wantSelect) { seat.dataset.state='selected'; seat.setAttribute('aria-selected','true'); state.selected.add(code); }
      else            { seat.dataset.state='available'; seat.setAttribute('aria-selected','false'); state.selected.delete(code); }
      // co số vé nếu vượt
      const totalTickets = state.qty.adult + state.qty.child;
      if (totalTickets > state.selected.size) {
        const overflow = totalTickets - state.selected.size;
        const decChild = Math.min(state.qty.child, overflow);
        const decAdult = overflow - decChild;
        if (decChild) setQty('child', state.qty.child - decChild);
        if (decAdult) setQty('adult', state.qty.adult - decAdult);
      }
    }
    // CHẾ ĐỘ: ticket-first
    else {
      const zone = state.seats[code]?.zone || zoneOf(rowL);
      if (wantSelect){
        // ưu tiên gán Adult nếu quota adult zone còn, không thì Child
        const adLeft = quotaLeft(zone,'adult');
        const chLeft = quotaLeft(zone,'child');
        if (adLeft<=0 && chLeft<=0){ $('#hint').textContent='Hết quota ở zone này. Tăng quota hoặc chọn zone khác.'; return; }
        const who = adLeft>0 ? 'adult' : 'child';
        state.assigned.set(code, who);
        seat.dataset.state='selected'; seat.setAttribute('aria-selected','true'); state.selected.add(code);
      } else {
        const who = state.assigned.get(code);
        if (who) state.assigned.delete(code);
        seat.dataset.state='available'; seat.setAttribute('aria-selected','false'); state.selected.delete(code);
      }
    }

    persistSelected();
    flipTooltip(seat);
    syncSummary();
  }

  function onSeatMouseEnter(e){ const seat = e.target.closest('.seat'); if (seat) flipTooltip(seat); }

  function onStepClick(e){
    const btn = e.target.closest('.step'); if (!btn) return;

    // seat-first counters
    if (btn.dataset.step && btn.closest('#ticketTypes')) {
      const wrap = btn.closest('.type-row'); const type = wrap.dataset.type;
      setQty(type, state.qty[type] + Number(btn.dataset.step||0));
    }

    // ticket-first quotas
    if (btn.dataset.q){
      setQuota(btn.dataset.q, Number(btn.dataset.step||0));
    }
  }

  function onModeSwitch(mode){
    if (state.mode === mode) return;
    state.mode = mode;

    // reset phân bổ khi đổi chế độ
    state.assigned.clear();
    state.qty.adult = state.qty.child = 0;
    state.quota = { adult:{vip:0,standard:0,economy:0}, child:{vip:0,standard:0,economy:0} };

    // UI: tabs + khối ẩn/hiện
    $$('.mode-tabs .tab').forEach(t=>t.classList.toggle('active', t.dataset.mode===mode));
    $('#ticketTypes').hidden = (mode!=='seat-first');
    $('#ticketQuota').hidden = (mode!=='ticket-first');

    // hủy chọn ghế để tránh mâu thuẫn
    state.selected.forEach(code=>{
      const el = document.getElementById(`s-${code}`);
      if (el && el.dataset.state==='selected'){ el.dataset.state='available'; el.setAttribute('aria-selected','false'); }
    });
    state.selected.clear();

    syncSummary();
  }

  function onContinue(goTo='concessions.html'){
    const { adultTotal, childTotal } = smartSplitAndTotals();
    const booking = {
      showtimeId: showtimeId(),
      movieId: state.movie.id, movieTitle: state.movie.title, posterUrl: state.movie.posterUrl,
      theater: state.show.theater, showDate: state.show.date, showTime: state.show.time, format: state.show.format,
      seats: [...state.selected],
      tickets: state.mode==='seat-first'
        ? { adult: state.qty.adult, child: state.qty.child }
        : {
            adult: Object.fromEntries(Object.entries(state.quota.adult)), 
            child: Object.fromEntries(Object.entries(state.quota.child))
          },
      mode: state.mode, price: { adult: PRICE.adult, child: PRICE.child }, zoneRate: ZONE_RATE,
      total: Math.round(adultTotal + childTotal)
    };
    localStorage.setItem(selKey(), JSON.stringify(booking.seats));
    localStorage.setItem(bookingKey(), JSON.stringify(booking));
    location.href = goTo;
  }

  // ===== Boot =====
  document.addEventListener('DOMContentLoaded', async () => {
    try { if (window.mountHeader) mountHeader('#hdr-include'); } catch {}
    try { if (window.mountFooter) mountFooter('#footer-include'); } catch {}
    try { if (window.mountBreadcrumb) mountBreadcrumb(); } catch {}

    await loadShowAndMovie();
    loadSelected();
    renderGrid();
    renderPriceMatrix();

    // restore selected (seat-first)
    state.selected.forEach(code => {
      const el = document.getElementById(`s-${code}`);
      if (el && el.dataset.state !== 'booked'){ el.dataset.state = 'selected'; el.setAttribute('aria-selected','true'); }
    });

    // events
    $('#seatGrid').addEventListener('click', onSeatGridClick);
    $('#seatGrid').addEventListener('mouseenter', onSeatMouseEnter, true);
    document.body.addEventListener('click', onStepClick);
    $$('.mode-tabs .tab').forEach(t=> t.addEventListener('click', ()=> onModeSwitch(t.dataset.mode)));
    $('#btnContinue').addEventListener('click', () => onContinue('concessions.html'));
    $('#btnPay').addEventListener('click', () => onContinue('payment.html'));

    syncSummary();
  });

  // dọn dẹp (trang success gọi)
  window.clearSeatBookingState = () => {
    localStorage.removeItem(selKey());
    localStorage.removeItem(bookingKey());
  };
})();
