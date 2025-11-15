(() => {
  const $  = (s, r=document) => r.querySelector(s);
  const $$ = (s, r=document) => [...r.querySelectorAll(s)];
  const API = window.API_BASE = 'http://localhost:8080/api';


  // ---------- utils ----------
  const getParam = (k) => new URL(location.href).searchParams.get(k);
  const uniq = (a) => [...new Set(a.filter(Boolean))];
  const asMin = (v) => /^\d+$/.test(String(v||'')) ? Number(v) : null;
  const fmtDur = (mins) => {
    const n = asMin(mins);
    if (n == null) return String(mins||'');
    const h = Math.floor(n/60), m = n%60;
    return (h?`${h}h `:'') + (m?`${m}m`:'');
  };
  const pickText = (x, y) => (x && String(x).trim()) || (y && String(y).trim()) || '';

async function getJSON(api, local){
  try {
    const r = await fetch(api, { cache:'no-store' });
    if (r.ok) return await r.json();
  } catch {}
  if (!local) return null;
  try {
    const r2 = await fetch(local, { cache:'no-store' });
    if (r2.ok) return await r2.json();
  } catch {}
  return null;
}


  // ---------- data loaders ----------
async function loadMovieById(id){
  if (!id) return null;

  // 1) Thử BE /movies/:id
  try {
    const r = await fetch(`${API}/movies/${encodeURIComponent(id)}`, { cache:'no-store' });
    if (r.ok) {
      const m = await r.json();
      if (m && m.id) return m;
    }
  } catch {}

  // 2) Thử BE /movies/now + /movies/soon (giống movies.js)
  try {
    const [nowRes, soonRes] = await Promise.all([
      fetch(`${API}/movies/now`,  { cache:'no-store' }),
      fetch(`${API}/movies/soon`, { cache:'no-store' })
    ]);

    let pile = [];
    if (nowRes.ok)  pile = pile.concat(await nowRes.json()  || []);
    if (soonRes.ok) pile = pile.concat(await soonRes.json() || []);

    const found = pile.find(m => String(m.id) === String(id));
    if (found) return found;
  } catch {}

  // 3) Fallback: đọc movies.json (hỗ trợ cả dạng mảng hoặc {now,soon})
  const json = await getJSON('../data/movies.json');
  if (Array.isArray(json)) {
    return json.find(m => String(m.id) === String(id)) || null;
  } else if (json) {
    const pile = []
      .concat(json.now  || [])
      .concat(json.soon || []);
    return pile.find(m => String(m.id) === String(id)) || null;
  }

  return null;
}


  async function loadTheaters(){
    const t = await getJSON(`${API}/theaters`, '../data/theaters.json');
    return Array.isArray(t) ? t : (t?.items || []);
  }

  async function loadShowtimes(movieId){ 
      // Thay vì gọi /api/showtimes, hãy gọi API mới
      const s = await getJSON(
          `${API}/showtimes/movie/${encodeURIComponent(movieId)}`, // <--- API mới
          '../data/showtimes.json' // giữ fallback
      );
      return Array.isArray(s) ? s : (s?.items || []);
    }

  // ---------- normalize ----------
  function normalizeShowtimesItem(st){
    const movieId   = st.movieId || st.movie || st.movie_id || '';
    const theaterId = st.theaterId || st.theater || st.theater_id || '';
    const date      = st.date || st.showDate || st.day || '';
    const times = Array.isArray(st.times) ? st.times
                 : Array.isArray(st.sessions) ? st.sessions
                 : [];
    return { movieId, theaterId, date, times };
  }

  // records phẳng -> nhóm theo movie|theater|date
  function normalizeFlat(records){
    const map = new Map();
    for (const r of records){
      const movieId   = String(r.movieId || r.movie || r.movie_id || '');
      const theaterId = String(r.theaterId || r.theater || r.theater_id || '');
      const date      = String(r.date || r.showDate || r.day || '');
      const key = `${movieId}|${theaterId}|${date}`;
      if (!map.has(key)) map.set(key, { movieId, theaterId, date, times: [] });
      map.get(key).times.push({
        id:   r.id || '',
        at:   r.time || r.at || r.start || '',
        fmt:  r.format || r.type || '',
        lang: r.language || r.lang || '',
        room: r.room || '',
        price: r.price
      });
    }
    return [...map.values()];
  }

  // ---------- UI builders ----------
  function renderHero(m){
    $('#mdTitle').textContent = pickText(m.title, m.originalTitle) || 'Unknown title';

    const bg = m.backdropUrl || m.backdrop || m.posterUrl || m.poster || '';
    if (bg) $('#mdBackdrop').style.backgroundImage = `url('${bg}')`;

    const year = (m.releaseDate||'').slice(0,4);
    const genres = Array.isArray(m.genres) ? m.genres.join(', ') :
                   (typeof m.genre === 'string' ? m.genre : '');
    const duration = fmtDur(m.duration || m.runtime);
    const rated = m.rated || m.age || '';
    const meta = [year, genres, duration, rated].filter(Boolean)
                  .map((t,i)=> i?`<span class="dot">•</span>${t}`:t).join(' ');
    $('#mdMeta').innerHTML = meta;

    const trailer = m.trailerUrl || m.trailer || '';
    const btn = $('#watchTrailerBtn');
    if (trailer) {
      btn.hidden = false;
      btn.addEventListener('click', () => {
        if (window.openTrailerModal) window.openTrailerModal(trailer);
        else window.open(trailer, '_blank');
      });
    } else {
      btn.remove();
    }
  }

  function renderCopy(m){
    $('#mdDesc').textContent = m.synopsis || m.description || m.desc || '—';
    $('#mdLang').textContent = m.language || '—';
    $('#mdDirector').textContent = m.director || '—';

    const cast = Array.isArray(m.cast) ? m.cast : [];
    const wrap = $('#mdCast'); wrap.innerHTML = '';
    cast.slice(0, 12).forEach((name) => {
      const el = document.createElement('div');
      el.className = 'actor';
      el.innerHTML = `
        <div class="avatar"><img src="https://picsum.photos/seed/${encodeURIComponent(name)}/200/200" alt="${name}"></div>
        <div class="name">${name}</div>`;
      wrap.appendChild(el);
    });

    const team = Array.isArray(m.team) ? m.team : [];
    const ul = $('#mdTeam'); ul.innerHTML = '';
    team.forEach((line) => {
      if (typeof line === 'string') {
        const li = document.createElement('li'); li.textContent = line; ul.appendChild(li);
      } else if (line && (line.label || line.role)) {
        const li = document.createElement('li');
        li.innerHTML = `<b>${line.label || line.role}:</b> <small>${line.value || line.people || ''}</small>`;
        ul.appendChild(li);
      }
    });
  }

  function fillSelect(sel, items, { getValue = x=>x.id, getLabel = x=>x.name } = {}){
    sel.innerHTML = '';
    items.forEach((it, i) => {
      const o = document.createElement('option');
      o.value = String(getValue(it));
      o.textContent = String(getLabel(it));
      if (i === 0) o.selected = true;
      sel.appendChild(o);
    });
  }

  function renderTimes({ list, theaterId, date, movieId }){
    const wrap = $('#timeWrap'); wrap.innerHTML = '';

    const node = list
      .filter(s => String(s.movieId)===movieId && String(s.theaterId)===theaterId && s.date===date)
      .flatMap(s => s.times.map(t => ({
        id:  t.id || t.showtimeId || t.st || '',
        at:  t.at || t.time || t.start || '',
        fmt: t.format || t.type || '',
        lang:t.lang || t.language || ''
      })))
      .sort((a,b)=>a.at.localeCompare(b.at));

    if (!node.length){
      wrap.innerHTML = `<small class="md-note">Chưa có suất cho lựa chọn này. Hãy chọn ngày/rạp khác, hoặc bấm “Tiếp tục chọn suất”.</small>`;
      return;
    }

    node.forEach(t => {
      const a = document.createElement('a');
      a.className = 'time-chip';
      a.href = `showtime.html?movie=${encodeURIComponent(movieId)}&theater=${encodeURIComponent(theaterId)}&date=${encodeURIComponent(date)}&time=${encodeURIComponent(t.at)}${t.id?`&st=${encodeURIComponent(t.id)}`:''}`;
      a.innerHTML = `${t.at}${(t.fmt||t.lang)?` <span class="badge">${[t.fmt, t.lang].filter(Boolean).join(' · ')}</span>`:''}`;
      wrap.appendChild(a);
    });
  }

  function bindBooking(movie, theaters, showtimes){
    const movieId = String(movie.id||'');

    // Hỗ trợ cả dạng A (đã nhóm) và B (phẳng)
    const data = (
      Array.isArray(showtimes[0]?.times) || Array.isArray(showtimes[0]?.sessions)
    )
      ? showtimes.map(normalizeShowtimesItem)   // A
      : normalizeFlat(Array.isArray(showtimes?.items) ? showtimes.items : showtimes); // B

    // Rạp có suất cho phim (nếu không có -> tất cả rạp)
    const validTheaterIds = uniq(
      data.filter(s => String(s.movieId)===movieId).map(s => String(s.theaterId))
    );
    const theaterList = validTheaterIds.length
      ? theaters.filter(t => validTheaterIds.includes(String(t.id||t.theaterId||t.code)))
      : theaters;

    // Fill selects
    const selTheater = $('#selTheater');
    fillSelect(selTheater, theaterList, {
      getValue: t => t.id || t.theaterId || t.code,
      getLabel: t => t.name || t.title
    });

    const dates = uniq(
      data.filter(s => String(s.movieId)===movieId).map(s => s.date)
    );
    const next7 = Array.from({length:7}, (_,i)=>{
      const d = new Date(); d.setDate(d.getDate()+i);
      return d.toISOString().slice(0,10);
    });
    const dateList = dates.length ? dates : next7;

    const selDate = $('#selDate');
    fillSelect(selDate, dateList.map(d => ({
      id:d, name:new Date(d+'T00:00:00').toLocaleDateString('vi-VN')
    })), {
      getValue: x => x.id,
      getLabel: x => x.name
    });

    const go  = $('#goShowtime');
    const buy = $('#buyTicketsBtn');
    function syncHref(){
      const t = selTheater.value, d = selDate.value;
      const q = `showtime.html?movie=${encodeURIComponent(movieId)}&theater=${encodeURIComponent(t)}&date=${encodeURIComponent(d)}`;
      go.href = q; buy.href = q;
    }

    selTheater.addEventListener('change', () => {
      renderTimes({ list:data, theaterId: selTheater.value, date: selDate.value, movieId });
      syncHref();
    });
    selDate.addEventListener('change', () => {
      renderTimes({ list:data, theaterId: selTheater.value, date: selDate.value, movieId });
      syncHref();
    });

    // init
    renderTimes({ list:data, theaterId: selTheater.value, date: selDate.value, movieId });
    syncHref();
  }

  // ---------- boot ----------
  document.addEventListener('DOMContentLoaded', async () => {
    try{
      if (window.mountBreadcrumb) window.mountBreadcrumb();

      const id = getParam('id') || getParam('movie');
      const movie = await loadMovieById(id || '');
      if (!movie){ console.warn('Không tìm thấy phim'); return; }

      renderHero(movie);
      renderCopy(movie);

      localStorage.setItem('selectedMovie', JSON.stringify({
        id: movie.id, title: movie.title,
        posterUrl: movie.posterUrl || movie.poster || '',
        trailerUrl: movie.trailerUrl || movie.trailer || '',
        year: (movie.releaseDate||'').slice(0,4) || movie.year || '',
        genres: Array.isArray(movie.genres) ? movie.genres : (movie.genre ? [movie.genre] : []),
        duration: movie.duration || movie.runtime || ''
      }));
      
      const [theaters, showtimes] = await Promise.all([loadTheaters(), loadShowtimes(id)]);
      bindBooking(movie, theaters, showtimes);
    }catch(e){
      console.error('[movie-detail] boot error:', e);
    }
  });
})();
