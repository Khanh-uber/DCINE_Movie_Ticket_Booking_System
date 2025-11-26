(() => {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const API = window.API_BASE || '/api';
  const getParam = (k) => new URL(location.href).searchParams.get(k);

  // ======================
  // 1. UTILS
  // ======================
  async function getJSON(apiPath, localPath) {
    // Ưu tiên API, nếu lỗi thì dùng Local JSON làm fallback
    try {
      const r = await fetch(apiPath, { cache: 'no-store' });
      if (r.ok) return await r.json();
    } catch {}
    if (localPath) {
      try {
        const r2 = await fetch(localPath, { cache: 'no-store' });
        return await r2.json();
      } catch (e) { console.warn(`Fallback failed: ${localPath}`, e); }
    }
    return [];
  }

  const uniq = (a) => [...new Set(a.filter(Boolean))];
  const fmtDateVN = (str) => {
    if (!str) return '...';
    try { const [y, m, d] = str.slice(0,10).split('-'); return `${d}/${m}/${y}`; } catch { return str; }
  };
  const getDayName = (d) => ['CN', 'Th 2', 'Th 3', 'Th 4', 'Th 5', 'Th 6', 'Th 7'][d.getDay()];

  // Kiểm tra giờ chiếu đã qua chưa (Tính cả buffer 10 phút)
  function isPast(dateStr, timeStr) {
    const now = new Date();
    const today = now.toISOString().slice(0, 10);
    if (dateStr !== today) return false; // Nếu không phải hôm nay thì không care

    const [h, m] = String(timeStr).split(':').map(Number);
    const showTimeVal = h * 60 + m;
    const nowVal = now.getHours() * 60 + now.getMinutes();
    
    // Nếu suất chiếu < giờ hiện tại + 10 phút -> Disable
    return showTimeVal < (nowVal + 10);
  }

  // ======================
  // 2. STATE
  // ======================
  const state = {
    movieId: getParam('movie'),
    
    // Lấy từ LocalStorage để nhớ lựa chọn cũ của user
    selProvId: localStorage.getItem('st_provId'), 
    selLocId: localStorage.getItem('st_locId'),   
    selectedDate: null,
    selectedShowtime: null,

    // Data Containers
    movie: null,
    provinces: [], 
    locations: [], 
    theaters: [],  
    showtimes: []
  };

  // ======================
  // 3. NORMALIZERS (Logic Quan Trọng)
  // ======================
  
  // Map dữ liệu Rạp với Location và Province bằng ID
  function normTheaters(rawData) {
    const arr = Array.isArray(rawData) ? rawData : (rawData.items || []);
    return arr.map(t => {
      const id = String(t.theater_id || t.id).trim();
      const locId = t.location_id; // Key link với bảng Location
      
      // Tìm Location cha
      const loc = state.locations.find(l => String(l.location_id || l.id) === String(locId));
      
      // Tìm Province ông nội (Lấy từ Location hoặc trực tiếp từ Theater)
      const provId = loc ? (loc.province_id || loc.pid) : (t.province_id || null);
      const prov = state.provinces.find(p => String(p.province_id || p.id) === String(provId));

      return {
        id: id,
        name: t.name,
        address: t.address || 'Đang cập nhật',
        location_id: locId ? String(locId) : null,
        province_id: provId ? String(provId) : null,
        // Dữ liệu hiển thị UI
        city_name: loc ? (loc.city_name || loc.name) : (t.city || 'Khác'),
        province_name: prov ? (prov.province_name || prov.name) : 'Khác'
      };
    }).filter(t => t.id);
  }

  function normShowtimes(data, movieId) {
    const base = Array.isArray(data) ? data : (data.items || []);
    const out = [];

    base.forEach(s => {
      const mId = String(s.movieId || s.movie || '').trim();
      // Lọc phim ngay từ đầu để giảm tải
      if (movieId && mId && String(movieId) !== mId) return;

      const tId = String(s.theaterId || s.theater || '').trim();
      if (!tId) return;

      const push = (id, date, time, fmt, price) => {
        out.push({
          id: String(id),
          theaterId: tId,
          movieId: mId,
          date: String(date).slice(0, 10),
          time: time,
          format: fmt || '2D',
          price: price || 95000
        });
      };

      // Xử lý JSON lồng nhau (dates -> formats -> times)
      const dates = s.dates || [];
      if (Array.isArray(dates) && dates.length) {
        dates.forEach(d => {
          (d.formats || []).forEach(f => {
            (f.times || []).forEach(t => {
               let timeVal = typeof t === 'object' ? t.time : t;
               // Tạo Mock ID nếu JSON thiếu ID
               let idVal = typeof t === 'object' ? t.id : `mock-${tId}-${d.date}-${String(timeVal).replace(':','')}`;
               push(idVal, d.date, timeVal, f.label, f.price);
            });
          });
        });
      } 
      // Xử lý dữ liệu phẳng từ DB (start_at)
      else if (s.start_at) {
          const dObj = new Date(s.start_at);
          push(s.showtime_id || s.id, dObj.toISOString().slice(0,10), dObj.toTimeString().slice(0,5), s.format, s.base_price);
      }
    });
    return out;
  }

  // ======================
  // 4. DATA LOADING
  // ======================
  async function loadData() {
    $('#theaterList').innerHTML = `<div class="st-loading"><i class="fa-solid fa-circle-notch fa-spin"></i><span>Đang tải dữ liệu...</span></div>`;

    // Load Metadata song song
    const [pData, lData, tData] = await Promise.all([
      getJSON(`${API}/provinces`, '../data/proviences.json'),
      getJSON(`${API}/locations`, '../data/locations.json'),
      getJSON(`${API}/theaters`, '../data/theaters.json')
    ]);

    state.provinces = Array.isArray(pData) ? pData : (pData.items || []);
    state.locations = Array.isArray(lData) ? lData : (lData.items || []);
    
    // Map quan hệ ngay khi có đủ dữ liệu
    const rawTheaters = Array.isArray(tData) ? tData : (tData.items || []);
    state.theaters = normTheaters(rawTheaters);

    // Load thông tin phim
    if (state.movieId) {
      const mvData = await getJSON(`${API}/movies`, '../data/movies.json');
      const allMv = mvData.now ? [...mvData.now, ...mvData.soon] : (Array.isArray(mvData) ? mvData : []);
      state.movie = allMv.find(m => String(m.id) === String(state.movieId)) || {};
    }

    // Load lịch chiếu
    const stData = await getJSON(`${API}/showtimes`, '../data/showtimes.json');
    state.showtimes = normShowtimes(stData, state.movieId);

    $('#theaterList').innerHTML = '';
  }

  // ======================
  // 5. FILTER LOGIC
  // ======================
  
  function getFilteredLocations() {
    if (!state.selProvId) return [];
    // Chỉ lấy Location thuộc Province đang chọn
    return state.locations.filter(l => String(l.province_id || l.pid) === String(state.selProvId));
  }

  function getFilteredTheaters() {
    let list = state.theaters;
    // Lọc theo Vùng
    if (state.selProvId) {
       list = list.filter(t => String(t.province_id) === String(state.selProvId));
    }
    // Lọc theo Vị trí (nếu không phải 'all')
    if (state.selLocId && state.selLocId !== 'all') {
       list = list.filter(t => String(t.location_id) === String(state.selLocId));
    }
    return list;
  }

  function getAvailableDates() {
    const tIds = getFilteredTheaters().map(t => t.id);
    const shows = state.showtimes.filter(s => tIds.includes(s.theaterId));
    return uniq(shows.map(s => s.date)).sort();
  }

  // ======================
  // 6. RENDERERS
  // ======================

  function renderHero() {
    const m = state.movie;
    if (!m || !m.id) {
       $('#stHero').classList.add('hidden');
       $('#simpleBc').style.display = 'block';
       $('#simpleBc nav').innerHTML = `<a href="index.html">Trang chủ</a> / <span class="curr">Lịch chiếu</span>`;
       return;
    }
    $('#stHero').classList.remove('hidden');
    $('#simpleBc').style.display = 'none';
    
    // Breadcrumb đầy đủ
    $('#bc').innerHTML = `
      <a href="index.html">Trang chủ</a> <span class="sep">/</span> 
      <a href="movies.html">Phim</a> <span class="sep">/</span> 
      <a href="movie-detail.html?movie=${m.id}">${m.title}</a> <span class="sep">/</span> 
      <span class="curr">Lịch chiếu</span>
    `;

    $('#heroTitle').textContent = m.title;
    const poster = $('#heroPoster');
    poster.src = m.posterUrl || 'https://via.placeholder.com/300x450';
    poster.onerror = () => poster.src = 'https://via.placeholder.com/300x450';
    if(m.backdropUrl) $('#heroBg').style.backgroundImage = `url('${m.backdropUrl}')`;
    
    // Meta tags đầy đủ
    $('#heroAge').textContent = m.rated || m.age || 'T13';
    $('#heroDur').textContent = (m.duration || m.runtime) ? `${m.duration || m.runtime} phút` : '--';
    $('#heroGenre').textContent = Array.isArray(m.genres) ? m.genres.join(', ') : (m.genre || '--');
    $('#sumMovie').textContent = m.title;
    
    const btnT = $('#btnTrailer');
    if(m.trailerUrl) {
       btnT.style.display = 'inline-flex';
       btnT.onclick = () => window.openTrailerModal ? window.openTrailerModal(m.trailerUrl) : window.open(m.trailerUrl);
    } else btnT.style.display = 'none';

    // Link nút "Chi tiết" quay lại trang movie-detail
    const btnBack = $('#btnBackMovie');
    if(btnBack) btnBack.href = `movie-detail.html?movie=${m.id}`;
  }

  function renderProvDropdown() {
    const wrap = $('#provinceDropdown');
    const list = wrap.querySelector('.dropdown-list');
    const selText = wrap.querySelector('.select-selected');

    list.innerHTML = state.provinces.map(p => `
      <li data-id="${p.province_id || p.id}" class="${String(p.province_id||p.id) === String(state.selProvId) ? 'selected' : ''}">
        ${p.province_name || p.name}
      </li>
    `).join('');

    const cur = state.provinces.find(p => String(p.province_id||p.id) === String(state.selProvId));
    selText.textContent = cur ? (cur.province_name || cur.name) : 'Chọn khu vực';

    wrap.querySelector('.dropdown-select').onclick = (e) => { e.stopPropagation(); closeDropdowns(); wrap.classList.toggle('open'); };
    list.onclick = (e) => {
       const li = e.target.closest('li');
       if(!li) return;
       const newId = li.dataset.id;
       if(newId !== state.selProvId){
          state.selProvId = newId;
          state.selLocId = 'all'; 
          // Lưu lại để F5 không mất
          localStorage.setItem('st_provId', newId);
          localStorage.setItem('st_locId', 'all');
          renderProvDropdown();
          renderLocDropdown();
          state.selectedDate = null;
          renderDates();
       }
       wrap.classList.remove('open');
    };
  }

  function renderLocDropdown() {
    const wrap = $('#locationDropdown');
    const list = wrap.querySelector('.dropdown-list');
    const selText = wrap.querySelector('.select-selected');
    
    const locs = getFilteredLocations();

    list.innerHTML = `
      <li data-id="all" class="${state.selLocId === 'all' ? 'selected' : ''}">Tất cả</li>
      ${locs.map(l => `
        <li data-id="${l.location_id || l.id}" class="${String(l.location_id||l.id) === String(state.selLocId) ? 'selected' : ''}">
          ${l.city_name || l.name}
        </li>
      `).join('')}
    `;

    const cur = locs.find(l => String(l.location_id||l.id) === String(state.selLocId));
    selText.textContent = cur ? (cur.city_name || cur.name) : 'Tất cả';

    wrap.querySelector('.dropdown-select').onclick = (e) => { e.stopPropagation(); closeDropdowns(); wrap.classList.toggle('open'); };
    list.onclick = (e) => {
       const li = e.target.closest('li');
       if(!li) return;
       const newId = li.dataset.id;
       if(newId !== state.selLocId){
          state.selLocId = newId;
          localStorage.setItem('st_locId', newId);
          renderLocDropdown();
          state.selectedDate = null;
          renderDates();
       }
       wrap.classList.remove('open');
    };
  }

  function closeDropdowns() { $$('.custom-dropdown').forEach(d => d.classList.remove('open')); }
  document.addEventListener('click', closeDropdowns);

  function renderDates() {
    const cont = $('#dateList');
    cont.innerHTML = '';
    const dates = getAvailableDates();

    if (!dates.length) {
       cont.innerHTML = `<div class="no-show-msg">Chưa có lịch chiếu tại khu vực này.<br>Vui lòng chọn Vị trí khác.</div>`;
       $('#theaterList').innerHTML = '';
       return;
    }

    // Auto select first date nếu chưa chọn
    if (!state.selectedDate || !dates.includes(state.selectedDate)) state.selectedDate = dates[0];
    const today = new Date().toISOString().slice(0,10);

    dates.forEach(ymd => {
       const d = new Date(ymd);
       const el = document.createElement('div');
       el.className = `date-card ${ymd === state.selectedDate ? 'active' : ''}`;
       el.innerHTML = `<span class="date-day">${ymd===today?'Hôm nay':getDayName(d)}</span><span class="date-num">${d.getDate()}/${d.getMonth()+1}</span>`;
       el.onclick = () => { state.selectedDate = ymd; renderDates(); renderSchedule(); };
       cont.appendChild(el);
    });
    renderSchedule();
  }

  function renderSchedule() {
    const cont = $('#theaterList');
    cont.innerHTML = '';
    
    const validTheaters = getFilteredTheaters();
    const tIds = validTheaters.map(t => t.id);
    const shows = state.showtimes.filter(s => s.date === state.selectedDate && tIds.includes(s.theaterId));

    if (!shows.length) {
      cont.innerHTML = `<div class="st-empty">Không có suất chiếu nào trong ngày này.</div>`;
      return;
    }

    validTheaters.forEach(th => {
       const thShows = shows.filter(s => s.theaterId === th.id);
       if (!thShows.length) return;

       // Group by Format
       const fmts = {};
       thShows.forEach(s => {
          const k = s.format || '2D';
          if(!fmts[k]) fmts[k] = [];
          fmts[k].push(s);
       });
       Object.keys(fmts).forEach(k => fmts[k].sort((a,b) => a.time.localeCompare(b.time)));

       const item = document.createElement('div');
       item.className = 'theater-item';
       
       let bodyHtml = '';
       for(const [fmt, list] of Object.entries(fmts)) {
          const btns = list.map(s => {
            // Logic check giờ đã qua
            const past = isPast(s.date, s.time);
            const cls = past ? 'time-btn is-disabled' : 'time-btn';
            return `<button class="${cls}" ${past ? 'disabled' : ''} 
                    onclick="selectTime(this, '${s.theaterId}', '${th.name}', '${fmt}', '${s.time}', '${s.id}')">
                    ${s.time}
                    </button>`;
          }).join('');
          bodyHtml += `<div class="format-row"><div class="format-lbl">${fmt}</div><div class="time-list">${btns}</div></div>`;
       }

       item.innerHTML = `
         <div class="theater-head">
            <div class="theater-name">${th.name}</div>
            <div class="theater-addr" style="font-size:0.9rem; color:#888;">
               <i class="fa-solid fa-map-marker-alt"></i> ${th.address}
               <span style="color:#666; margin-left:5px;">(${th.location_name})</span>
            </div>
         </div>
         <div class="theater-body">${bodyHtml}</div>
       `;
       cont.appendChild(item);
    });
  }

  window.selectTime = (btn, tId, tName, fmt, time, stId) => {
     if(btn.disabled) return;
     $$('.time-btn').forEach(b => b.classList.remove('selected'));
     btn.classList.add('selected');
     state.selectedShowtime = { id: stId, theater: tName, format: fmt, time, date: state.selectedDate };
     updateSummary();
  };

  function updateSummary() {
     const s = state.selectedShowtime;
     const btn = $('#btnContinue');
     if (s) {
        $('#sumTheater').textContent = s.theater;
        $('#sumDate').textContent = fmtDateVN(s.date);
        $('#sumTime').textContent = s.time;
        $('#sumFormat').textContent = s.format;
        btn.disabled = false;
        btn.classList.add('active');
        btn.innerHTML = `Chọn ghế <i class="fa-solid fa-arrow-right"></i>`;
     } else {
        $('#sumTheater').textContent = '...';
        $('#sumDate').textContent = '...';
        $('#sumTime').textContent = '...';
        $('#sumFormat').textContent = '...';
        btn.disabled = true;
        btn.classList.remove('active');
        btn.textContent = 'Vui lòng chọn suất chiếu';
     }
  }

  // ---------- BOOT ----------
  document.addEventListener('DOMContentLoaded', async () => {
     if(window.mountHeader) window.mountHeader('#hdr-include');
     if(window.mountFooter) window.mountFooter('#footer-include');
     if(window.mountBreadcrumb) window.mountBreadcrumb();

     await loadData();

     // Logic chọn mặc định thông minh:
     // Nếu chưa chọn Vùng, tìm vùng "Hồ Chí Minh" làm default
     if (!state.selProvId) {
        const hcm = state.provinces.find(p => (p.province_name||p.name).includes('Hồ Chí Minh'));
        state.selProvId = hcm ? String(hcm.province_id || hcm.id) : (state.provinces[0]?.province_id || null);
        // Mặc định vị trí là "Tất cả"
        state.selLocId = 'all'; 
     }

     renderHero();
     renderProvDropdown();
     renderLocDropdown();
     renderDates();

     $('#btnContinue').onclick = () => {
        if(!state.selectedShowtime) return;
        const mvParam = state.movieId ? `&movie=${state.movieId}` : '';
        location.href = `seat-map.html?showtimeId=${encodeURIComponent(state.selectedShowtime.id)}${mvParam}`;
     };
  });

})();