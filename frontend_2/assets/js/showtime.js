(() => {
  const $ = (s, r=document) => r.querySelector(s);
  const $$ = (s, r=document) => [...r.querySelectorAll(s)];
  const API = window.API_BASE || '/api';
  const getParam = (k) => new URL(location.href).searchParams.get(k);

  // ---------- utils ----------
  async function getJSON(apiPath, localPath) {
    try { const r = await fetch(apiPath, { cache: 'no-store' }); if (r.ok) return await r.json(); } catch {}
    const r2 = await fetch(localPath, { cache: 'no-store' }); return await r2.json();
  }
  const uniq = (a) => [...new Set(a.filter(Boolean))];
  const asMin = (v) => /^\d+$/.test(String(v||'')) ? Number(v) : null;
  const fmtDur = (mins) => { const n = asMin(mins); if (n==null) return String(mins||''); const h=Math.floor(n/60),m=n%60; return (h?`${h}h `:'')+(m?`${m}m`:''); };
  const pickText = (x,y) => (x && String(x).trim()) || (y && String(y).trim()) || '';

  const deAccent = (s) => String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'');
  const slug = (s) => deAccent(String(s||'')).toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'');

  // time helpers
  const toDateKey = (d) => new Date(d).toISOString().slice(0,10);
  const todayKey = () => toDateKey(new Date());
  function strTimeToMinutes(t){ // e.g. "10:30" or "21:05"
    const m = String(t||'').match(/(\d{1,2}):(\d{2})/); if(!m) return null;
    return Number(m[1])*60 + Number(m[2]);
  }

  // ---------- state ----------
  const state = {
    movie: null,
    theaters: [],
    showtimes: [],
    cities: [],
    selectedCity: null,
    selectedTheaterId: null,
    selectedDate: null,
    locationsById: {},
    provincesById: {}
  };

  // ---------- normalizers ----------
  function normTheaters(data){
    const arr = Array.isArray(data) ? data : (data.items || data.theaters || []);
    return arr.map(t => {
      const id = String(t.id ?? t.theaterId ?? t.theater_id ?? t.code ?? t._id ?? '').trim();
      const name = t.name || t.title || 'Rạp';
      const locId = t.location_id ?? t.locationId ?? t.loc_id ?? null;

      let cityFromLoc = null, provinceName = null;
      if (locId && state.locationsById[locId]) {
        const loc = state.locationsById[locId];
        cityFromLoc = loc.city_name || loc.district_name || null;
        const pid = loc.province_id ?? loc.provience_id ?? loc.pid;
        if (pid && state.provincesById[pid]) provinceName = state.provincesById[pid].name || state.provincesById[pid].province_name;
      }
      const city = provinceName || cityFromLoc || t.city || 'TP.HCM';
      return id ? { id, name, city, _slug: slug(name + '-' + id) } : null;
    }).filter(Boolean);
  }

  function normFormats(fmts, times){
    if (!Array.isArray(fmts) || !fmts.length) {
      const ts = Array.isArray(times) ? times : [];
      return ts.length ? [{ label:'2D', lang:'', times:ts }] : [];
    }
    return fmts.map(f => ({
      label: f.label || f.format || f.type || '2D',
      lang:  f.lang || f.language || f.sub || '',
      times: Array.isArray(f.times) ? f.times : (Array.isArray(f.slots) ? f.slots : [])
    })).filter(x=>x.times.length);
  }

  function normShowtimes(data, movieId){
    const base = Array.isArray(data) ? data : (data.items || data.showtimes || []);
    let list = base;
    if (list.length && list[0]?.dates) {
      list = list.flatMap(s => (s.dates||[]).map(d => ({
        movieId: s.movieId ?? movieId,
        theaterId: s.theaterId ?? s.theater_id ?? s.tid ?? '',
        date: String(d.date||'').slice(0,10),
        formats: d.formats
      })));
    }
    return list
      .filter(x => String(x.movieId ?? x.movie) === String(movieId))
      .map(x => ({
        movieId: String(x.movieId ?? movieId),
        theaterId: String(x.theaterId ?? x.theater ?? x.tid ?? ''),
        date: (x.date || x.showDate || '').slice(0,10),
        formats: normFormats(x.formats, x.times)
      }))
      .filter(s => s.theaterId && s.date && s.formats.length);
  }

  // reconcile showtimes.theaterId ↔ theaters.id (handle different prefixes)
  function reconcileShowtimesWithTheaters(){
    const ids = new Set(state.theaters.map(t=>t.id));
    const bySlug = state.theaters.map(t => ({ id:t.id, slug: t._slug }));
    state.showtimes.forEach(s => {
      if (ids.has(s.theaterId)) return;
      const tail = s.theaterId.split('-').slice(-1)[0];
      const cand = bySlug.find(t => t.slug.endsWith('-'+slug(tail))) ||
                   bySlug.find(t => t.slug.includes(slug(tail))) ||
                   bySlug.find(t => t.slug.includes(slug(s.theaterId))) || null;
      if (cand) s.theaterId = cand.id;
    });
  }

  // ---------- render: movie ----------
  function renderMovie(){
    const m = state.movie; if (!m) return;
    $('#mvPoster').src = m.posterUrl || m.poster || '';
    $('#mvPoster').alt = m.title || 'Poster';
    $('#mvTitle').textContent   = m.title || '';
    $('#mvYear').textContent    = (m.releaseDate || '').slice(0,4) || (m.year || '');
    $('#mvGenres').textContent  = Array.isArray(m.genres) ? m.genres.join(', ') : (m.genre || '');
    $('#mvDuration').textContent= fmtDur(m.duration || m.runtime || '');
    $('#mvDesc').textContent    = pickText(m.synopsis, m.description);

    const trailer = m.trailerUrl || m.trailer || '';
    const btnT = $('#btnTrailer');
    if (trailer) {
      btnT.hidden = false;
      btnT.onclick = () => { if (window.openTrailerModal) openTrailerModal(trailer); else window.open(trailer, '_blank'); };
    }

    $('#btnBack').href = `movie-detail.html?movie=${encodeURIComponent(m.id||'')}`;
    $('#btnContinue').addEventListener('click', (e)=>{ e.preventDefault(); $('#filters')?.scrollIntoView({behavior:'smooth'}); });
  }

  // ---------- render: filters ----------
  function buildCityList(){
    state.cities = uniq(state.theaters.map(t=>t.city)).sort((a,b)=>a.localeCompare(b,'vi'));
    const sel = $('#citySel');
    sel.innerHTML = state.cities.map(c=>`<option value="${c}">${c}</option>`).join('');
    state.selectedCity = localStorage.getItem('st_selectedCity') || state.selectedCity || state.cities[0] || 'TP.HCM';
    if (!state.cities.includes(state.selectedCity)) state.selectedCity = state.cities[0] || 'TP.HCM';
    sel.value = state.selectedCity;

    sel.onchange = () => {
      state.selectedCity = sel.value;
      localStorage.setItem('st_selectedCity', state.selectedCity);
      state.selectedTheaterId = null;
      renderTheaterChips();
      syncDateDefault();
      buildDayChips();
      renderShowtimes();
    };
  }

  function availableDaysInCityAndTheater(){
    const list = state.showtimes.filter(s => {
      const th = state.theaters.find(t=>t.id===s.theaterId);
      return th && th.city === state.selectedCity && (!state.selectedTheaterId || s.theaterId === state.selectedTheaterId);
    });
    return uniq(list.map(s=>s.date)).sort();
  }

  function syncDateDefault(){
    const days = availableDaysInCityAndTheater();
    const dft = days[0] || new Date().toISOString().slice(0,10);
    state.selectedDate = state.selectedDate || dft;

    const inp = $('#dateSel');
    inp.min = days[0] || '';
    inp.max = days.length ? days[days.length-1] : '';
    inp.value = state.selectedDate;

    inp.onchange = () => { state.selectedDate = inp.value; buildDayChips(); renderShowtimes(); };
  }

  function buildDayChips(){
    const wrap = $('#dayChips'); if (!wrap) return;
    const days = availableDaysInCityAndTheater();
    wrap.innerHTML = '';
    days.forEach(d => {
      const b = document.createElement('button');
      b.type = 'button'; b.className = 'day-chip'; b.textContent = toVNDayShort(d);
      if (d === state.selectedDate) b.classList.add('is-active');
      b.addEventListener('click', () => { state.selectedDate = d; $('#dateSel').value = d; buildDayChips(); renderShowtimes(); });
      wrap.appendChild(b);
    });
  }
  const toVNDayShort = (iso) => {
    try { const dt = new Date(iso+'T00:00:00'); return dt.toLocaleDateString('vi-VN',{weekday:'short', day:'2-digit', month:'short'}); }
    catch { return iso; }
  };

  function renderTheaterChips(){
    $('#cityLabel').textContent = `Movie Theatres in ${state.selectedCity}`;
    const wrap = $('#theaterChips'); wrap.innerHTML = '';

    const list = state.theaters.filter(t => t.city === state.selectedCity);
    const hasShow = new Set(state.showtimes.map(s=>s.theaterId));
    list.sort((a,b)=> Number(hasShow.has(b.id)) - Number(hasShow.has(a.id)) || a.name.localeCompare(b.name,'vi'));

    list.forEach(t => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'theater-chip';
      b.textContent = t.name;
      if (t.id === state.selectedTheaterId) b.classList.add('is-active');
      b.addEventListener('click', () => {
        state.selectedTheaterId = t.id;
        const rDays = uniq(state.showtimes.filter(s=>s.theaterId===t.id).map(s=>s.date)).sort();
        if (rDays.length) state.selectedDate = rDays[0];
        renderTheaterChips();
        syncDateDefault();
        buildDayChips();
        renderShowtimes();
      });
      wrap.appendChild(b);
    });

    if (!state.selectedTheaterId && list.length) {
      const firstWithShow = list.find(t => hasShow.has(t.id)) || list[0];
      state.selectedTheaterId = firstWithShow?.id || null;
    }
  }

  // ---------- render: showtimes ----------
  function isPastForSelectedDay(timeStr){
    if (state.selectedDate !== todayKey()) return false;
    const now = new Date(); // minutes since 00:00
    const nowMin = now.getHours()*60 + now.getMinutes();
    const tMin = strTimeToMinutes(timeStr);
    if (tMin == null) return false;
    // chặn giờ đã qua + buffer 10'
    return tMin < (nowMin + 10);
  }

  function renderShowtimes(){
    const box = $('#showtimesWrap'); box.innerHTML = '';

    const th = state.theaters.find(t=>t.id===state.selectedTheaterId);
    if (!th) { box.innerHTML = `<div class="st-empty">Chưa có rạp khả dụng trong khu vực này.</div>`; return; }

    const entry = state.showtimes.find(s => s.theaterId===th.id && s.date===state.selectedDate);

    const root  = document.createElement('div'); root.className = 'st-theater';
    const title = document.createElement('h3');  title.className = 'st-title'; title.textContent = th.name.toUpperCase();
    root.appendChild(title);

    if (!entry) {
      root.appendChild(elEmpty(`Không có suất chiếu vào ${fmtVNDate(state.selectedDate)}. Vui lòng chọn ngày khác.`));
      box.appendChild(root); return;
    }

    entry.formats.forEach(f => {
      const row = document.createElement('div'); row.className = 'st-row';
      const fmt = document.createElement('div'); fmt.className = 'st-format';
      fmt.textContent = `${f.label}${f.lang ? ' • ' + f.lang : ''}`;

      const times = document.createElement('div'); times.className = 'times';
      f.times.forEach(t => {
        const b = document.createElement('button');
        b.type='button'; b.className='time-btn'; b.textContent=t;

        // disable nếu đã qua giờ (ngày hôm nay)
        if (isPastForSelectedDay(t)) {
          b.classList.add('is-disabled');
          b.disabled = true;
          b.title = 'Suất đã qua giờ chiếu';
        } else {
          b.addEventListener('click', () => {
            // UX: highlight 150ms trước khi chuyển trang
            b.classList.add('is-active');
            setTimeout(() => confirmShowtime({ time:t, format:f.label, lang:f.lang||'' }), 120);
          });
        }
        times.appendChild(b);
      });

      row.appendChild(fmt); row.appendChild(times); root.appendChild(row);
    });

    box.appendChild(root);
  }

  function elEmpty(text){ const d=document.createElement('div'); d.className='st-empty'; d.textContent=text; return d; }
  function fmtVNDate(iso){ try{ const d=new Date(iso); return d.toLocaleDateString('vi-VN',{weekday:'short', day:'2-digit', month:'2-digit', year:'numeric'}); }catch{ return iso; } }

  // ---------- choose time -> save + go ----------
  function confirmShowtime({ time, format, lang }) {
    const m  = state.movie;
    const th = state.theaters.find(x => x.id === state.selectedTheaterId);
    const payload = { movieId:String(m.id||''), theaterId:String(th?.id||''), theaterName:th?.name||'', date:state.selectedDate, time, format, lang };
    localStorage.setItem('selectedShowtime', JSON.stringify(payload));
    localStorage.setItem('selectedMovie', JSON.stringify({
      id:m.id, title:m.title, posterUrl:m.posterUrl || m.poster || '',
      trailerUrl:m.trailerUrl || m.trailer || '', year:(m.releaseDate||'').slice(0,4) || m.year || '',
      genres:Array.isArray(m.genres)?m.genres:(m.genre?[m.genre]:[]), duration:m.duration || m.runtime || ''
    }));
    localStorage.removeItem('selectedSeats');
    localStorage.removeItem('orderCombos');
    location.href = 'seat-map.html';
  }

  // ---------- boot ----------
  document.addEventListener('DOMContentLoaded', async () => {
    try {
      if (window.mountBreadcrumb) mountBreadcrumb();
      const movieId = getParam('movie');

      // provinces (để city hiển thị cấp tỉnh/thành, không còn "Quận 1")
      try {
        const pvRaw = await getJSON(`${API}/provinces`, '../data/proviences.json');
        const arr = Array.isArray(pvRaw) ? pvRaw : (pvRaw.items || pvRaw.data || []);
        arr.forEach(p => { const id = p.id ?? p.province_id ?? p.pid; if (id!=null) state.provincesById[id] = { id, name: p.name || p.province_name }; });
      } catch {}

      // locations (mapping theatre -> province)
      try {
        const locRaw = await getJSON(`${API}/locations`, '../data/locations.json');
        const arr = Array.isArray(locRaw) ? locRaw : (locRaw.items || []);
        arr.forEach(l => { const id = l.location_id ?? l.id; if (id!=null) state.locationsById[id] = l; });
      } catch {}

      // movies
      const mvRaw = await getJSON(`${API}/movies`, '../data/movies.json');
      const mvList = Array.isArray(mvRaw) ? mvRaw : ([...(mvRaw?.now||[]) , ...(mvRaw?.soon||[])]);
      state.movie = mvList.find(x => String(x.id) === String(movieId)) || mvList[0] || {};
      renderMovie();

      // theatres
      const thRaw = await getJSON(`${API}/theaters`, '../data/theaters.json');
      state.theaters = normTheaters(thRaw);

      // showtimes for movie
      const stRaw = await getJSON(`${API}/showtimes?movie=${encodeURIComponent(state.movie?.id||'')}`, '../data/showtimes.json');
      state.showtimes = normShowtimes(stRaw, state.movie?.id);
      reconcileShowtimesWithTheaters();

      // build UI
      buildCityList();
      renderTheaterChips();
      syncDateDefault();
      buildDayChips();
      renderShowtimes();
    } catch (e) {
      console.error('[showtime] boot error:', e);
      $('#showtimesWrap').innerHTML = `<div class="st-empty">Không tải được dữ liệu. Vui lòng thử lại.</div>`;
    }
  });
})();
