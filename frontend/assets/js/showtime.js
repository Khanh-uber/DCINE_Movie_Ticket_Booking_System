(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const API = window.API_BASE || '/api';
  const getParam = (k) => new URL(location.href).searchParams.get(k);

  // ---------- utils ----------
  async function getJSON(apiPath, localPath) {
    try { const r = await fetch(apiPath, { cache: 'no-store' }); if (r.ok) return await r.json(); } catch {}
    const r2 = await fetch(localPath, { cache: 'no-store' }); return await r2.json();
  }
  const uniq = (a) => [...new Set(a.filter(Boolean))];
  const asMin = (v) => /^\d+$/.test(String(v||'')) ? Number(v) : null;
  const fmtDur = (mins) => {
    const n = asMin(mins);
    if (n == null) return String(mins||'');
    const h = Math.floor(n/60), m = n%60;
    return (h?`${h}h `:'') + (m?`${m}m`:'');
  };
  const pickText = (x, y) => (x && String(x).trim()) || (y && String(y).trim()) || '';

  // ---------- state ----------
  const state = {
    movie: null,
    theaters: [],
    cities: [],
    showtimes: [],   // [{movieId,theaterId,date,formats:[{label,lang,times[]}]}]
    selectedCity: null,
    selectedTheaterId: null,
    selectedDate: null
  };

  // ---------- normalizers ----------
  function normTheaters(data){
    const arr = Array.isArray(data) ? data : (data.items || data.theaters || []);
    return arr.map(t => ({
      id: String(t.id ?? t.theaterId ?? t.code ?? t._id ?? ''),
      name: t.name || t.title || 'Rạp',
      city: t.city || t.location?.city || 'TP.HCM'
    })).filter(t => t.id);
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

    // Flatten shapes like {theaterId, dates:[{date,formats:[]}]}
    if (list.length && list[0]?.dates) {
      list = list.flatMap(s => (s.dates||[]).map(d => ({
        movieId: s.movieId ?? movieId,
        theaterId: s.theaterId,
        date: d.date,
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

  // ---------- render: movie side ----------
  function renderMovie(){
    const m = state.movie; if (!m) return;
    $('#mvPoster').src = m.posterUrl || m.poster || '';
    $('#mvPoster').alt = m.title || 'Poster';

    $('#mvTitle').textContent = m.title || '';
    $('#mvYear').textContent = (m.releaseDate || '').slice(0,4) || (m.year || '');
    $('#mvGenres').textContent = Array.isArray(m.genres) ? m.genres.join(', ') : (m.genre || '');
    $('#mvDuration').textContent = fmtDur(m.duration || m.runtime || '');

    $('#mvDesc').textContent = pickText(m.synopsis, m.description);

    // Trailer
    const trailer = m.trailerUrl || m.trailer || '';
    const btnT = $('#btnTrailer');
    if (trailer) {
      btnT.hidden = false;
      btnT.onclick = () => {
        if (window.openTrailerModal) openTrailerModal(trailer);
        else window.open(trailer, '_blank');
      };
    }

    // Back
    $('#btnBack').href = `movie-detail.html?movie=${encodeURIComponent(m.id||'')}`;

    // Continue scroll
    $('#btnContinue').addEventListener('click', (e)=>{
      const el = $('#filters'); if (!el) return;
      e.preventDefault(); el.scrollIntoView({ behavior:'smooth', block:'start' });
    });
  }

  // ---------- render: filters ----------
  function buildCityList(){
    state.cities = uniq(state.theaters.map(t=>t.city));
    const sel = $('#citySel');
    sel.innerHTML = state.cities.map(c=>`<option value="${c}">${c}</option>`).join('');
    state.selectedCity = state.selectedCity || state.cities[0] || 'TP.HCM';
    sel.value = state.selectedCity;

    sel.onchange = () => {
      state.selectedCity = sel.value;
      state.selectedTheaterId = null;
      renderTheaterChips();
      syncDateDefault();
      renderShowtimes();
    };
  }

  function syncDateDefault(){
    // Lấy ngày có suất đầu tiên theo city + (theater nếu đã chọn)
    const byCityTheater = state.showtimes.filter(s => {
      const th = state.theaters.find(t=>t.id===s.theaterId);
      return th && th.city === state.selectedCity && (!state.selectedTheaterId || s.theaterId === state.selectedTheaterId);
    });
    const days = uniq(byCityTheater.map(s=>s.date)).sort();
    const dft = days[0] || new Date().toISOString().slice(0,10);
    state.selectedDate = state.selectedDate || dft;

    const inp = $('#dateSel');
    inp.min = days[0] || '';
    inp.max = days.at(-1) || '';
    inp.value = state.selectedDate;

    inp.onchange = () => {
      state.selectedDate = inp.value;
      renderShowtimes();
    };
  }

  function renderTheaterChips(){
    $('#cityLabel').textContent = `Rạp tại ${state.selectedCity}`;
    const wrap = $('#theaterChips');
    wrap.innerHTML = '';

    // Theaters theo city
    const list = state.theaters.filter(t => t.city === state.selectedCity);
    // Ưu tiên rạp có suất
    const hasShow = new Set(state.showtimes.map(s=>s.theaterId));
    list.sort((a,b)=> Number(hasShow.has(b.id)) - Number(hasShow.has(a.id)));

    list.forEach(t => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'theater-chip';
      b.textContent = t.name;
      if (t.id === state.selectedTheaterId) b.classList.add('is-active');
      b.addEventListener('click', () => {
        state.selectedTheaterId = t.id;
        // default ngày theo rạp chọn
        const rDays = uniq(state.showtimes.filter(s=>s.theaterId===t.id).map(s=>s.date)).sort();
        if (rDays.length) state.selectedDate = rDays[0];
        renderTheaterChips();
        syncDateDefault();
        renderShowtimes();
      });
      wrap.appendChild(b);
    });

    // nếu chưa chọn -> chọn rạp đầu có suất
    if (!state.selectedTheaterId) {
      const firstWithShow = list.find(t => hasShow.has(t.id)) || list[0];
      if (firstWithShow) state.selectedTheaterId = firstWithShow.id;
      wrap.querySelectorAll('.theater-chip')[ list.indexOf(firstWithShow) ]?.classList.add('is-active');
    }
  }

  // ---------- render: showtimes ----------
  function renderShowtimes(){
    const box = $('#showtimesWrap');
    box.innerHTML = '';

    const th = state.theaters.find(t=>t.id===state.selectedTheaterId);
    if (!th) {
      box.innerHTML = `<div class="st-empty">Chưa có rạp khả dụng trong thành phố này.</div>`;
      return;
    }

    // Lấy lịch cho đúng rạp + ngày
    const entry = state.showtimes.find(s => s.theaterId===th.id && s.date===state.selectedDate);

    const root = document.createElement('div');
    root.className = 'st-theater';

    const title = document.createElement('h3');
    title.className = 'st-title';
    title.textContent = th.name.toUpperCase();
    root.appendChild(title);

    if (!entry) {
      root.appendChild(elEmpty(`Không có suất chiếu vào ngày ${fmtVNDate(state.selectedDate)}. Vui lòng chọn ngày khác.`));
      box.appendChild(root);
      return;
    }

    // Các dòng format
    entry.formats.forEach(f => {
      const row = document.createElement('div'); row.className = 'st-row';
      const fmt = document.createElement('div'); fmt.className = 'st-format';
      fmt.textContent = `${f.label}${f.lang ? ' • ' + f.lang : ''}`;
      row.appendChild(fmt);

      const times = document.createElement('div'); times.className = 'times';
      f.times.forEach(t => {
        const b = document.createElement('button');
        b.type = 'button'; b.className = 'time-btn'; b.textContent = t;
        b.addEventListener('click', () => confirmShowtime({ time: t, format: f.label, lang: f.lang || '' }));
        times.appendChild(b);
      });

      row.appendChild(times);
      root.appendChild(row);
    });

    box.appendChild(root);
  }

  function elEmpty(text){ const d=document.createElement('div'); d.className='st-empty'; d.textContent=text; return d; }
  function fmtVNDate(iso){ try{ const d=new Date(iso); return d.toLocaleDateString('vi-VN',{weekday:'short',day:'2-digit',month:'2-digit',year:'numeric'}); }catch{ return iso; } }

  // ---------- action: chọn giờ -> save + redirect ----------
// REPLACE this function in showtime.js
function confirmShowtime({ time, format, lang }) {
  const m  = state.movie;
  const th = state.theaters.find(x => x.id === state.selectedTheaterId);

  const payload = {
    movieId: String(m.id || ''),
    theaterId: String(th?.id || ''),
    theaterName: th?.name || '',      // ✅ thêm tên rạp
    date: state.selectedDate,
    time,
    format,
    lang
  };

  // Lưu showtime được chọn
  localStorage.setItem('selectedShowtime', JSON.stringify(payload));

  // Stash nhanh dữ liệu phim (để seat-map hiển thị tức thì)
  localStorage.setItem('selectedMovie', JSON.stringify({
    id: m.id,
    title: m.title,
    posterUrl: m.posterUrl || m.poster || '',
    trailerUrl: m.trailerUrl || m.trailer || '', 
    year: (m.releaseDate || '').slice(0,4) || m.year || '',
    genres: Array.isArray(m.genres) ? m.genres : (m.genre ? [m.genre] : []),
    duration: m.duration || m.runtime || ''
  }));

  location.href = 'seat-map.html';
}


  // ---------- boot ----------
  document.addEventListener('DOMContentLoaded', async () => {
    try{
      if (window.mountBreadcrumb) mountBreadcrumb();     // breadcrumb
      // header/footer đã được main.js lo

      const movieId = getParam('movie');

      // 1) Movies
      const mvRaw = await getJSON(`${API}/movies`, '../../data/movies.json');
      const mvList = Array.isArray(mvRaw) ? mvRaw : ([...(mvRaw?.now||[]) , ...(mvRaw?.soon||[])]);
      state.movie = mvList.find(x => String(x.id) === String(movieId)) || mvList[0] || {};
      renderMovie();

      // 2) Theaters
      state.theaters = normTheaters(await getJSON(`${API}/theaters`, '../../data/theaters.json'));

      // 3) Showtimes cho movie
      state.showtimes = normShowtimes(
        await getJSON(`${API}/showtimes?movie=${encodeURIComponent(state.movie?.id||'')}`, '../../data/showtimes.json'),
        state.movie?.id
      );

      // 4) Build filter UI
      buildCityList();
      renderTheaterChips();
      syncDateDefault();
      renderShowtimes();
    }catch(e){
      console.error('[showtime] boot error:', e);
      $('#showtimesWrap').innerHTML = `<div class="st-empty">Không tải được dữ liệu. Vui lòng thử lại.</div>`;
    }
  });
})();
