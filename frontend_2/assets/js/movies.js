(() => {
  const $  = (s, r=document) => r.querySelector(s);
  const $$ = (s, r=document) => [...r.querySelectorAll(s)];

  const API_DATA = '../data/movies.json';
  
  // Nơi lưu trữ data sau khi fetch
  let allMovies = {
    now: [],
    soon: []
  };
  const PER_PAGE = 12; // Số lượng phim mỗi trang

  // ===== Template loader (nạp 1 lần) =====
  let MOVIE_TPL = null;
  async function ensureMovieTpl() {
    if (MOVIE_TPL) return MOVIE_TPL;
    try {
      const res  = await fetch('./components/movie-card.html', { cache: 'no-store' });
      if (!res.ok) return null;
      const html = await res.text();
      const box  = document.createElement('div'); box.innerHTML = html;
      MOVIE_TPL  = box.querySelector('#movie-card');
      if (MOVIE_TPL) document.body.appendChild(MOVIE_TPL);
    } catch {}
    return MOVIE_TPL;
  }

  // ===== Tạo 1 card phim (Giữ nguyên logic của bạn) =====
  function cardFrom(m, { showRating=false, showRelease=false } = {}) {
    if (!MOVIE_TPL?.content?.firstElementChild) {
      // Fallback (giữ nguyên)
      const el = document.createElement('article');
      el.className = 'poster card';
      el.innerHTML = `...`; // Fallback code
      return el;
    }

    // Dùng movie-card template mới (giữ nguyên logic của bạn)
    const el = MOVIE_TPL.content.firstElementChild.cloneNode(true);
    el.dataset.id = m.id ?? '';

    const img = el.querySelector('[data-img]');
    if (img) { img.src = m.posterUrl || m.poster || ''; img.alt = m.title || 'Poster'; }

    const t = el.querySelector('[data-title]');     if (t) t.textContent = m.title || '';
    const d = el.querySelector('[data-director]');  if (d) d.textContent = m.director ? `Directed by ${m.director}` : '';
    
    const u = el.querySelector('[data-duration]');
    if (u) {
      const durationVal = m.duration || m.runtime || '';
      if (durationVal) {
        u.textContent = /^\d+$/.test(String(durationVal).trim()) ? `${durationVal} phút` : durationVal;
      } else {
        u.textContent = '';
      }
    }
    
    const rate = el.querySelector('[data-rating]');
    if (rate) {
      // Dùng innerHTML để hiện icon ⭐
      if (showRating && (m.rating ?? null) !== null) rate.innerHTML = `⭐ ${Number(m.rating||0).toFixed(1)}/10`;
      else rate.textContent = '';
    }

    const gWrap = el.querySelector('[data-genres]');
    if (gWrap) {
      const genres = Array.isArray(m.genres) ? m.genres
                  : (typeof m.genre === 'string' ? m.genre.split(',') : []);
      gWrap.innerHTML = '';
      genres.map(x=>String(x).trim()).filter(Boolean).slice(0,4).forEach(g=>{
        const s = document.createElement('span'); s.className='tag'; s.textContent = g;
        gWrap.appendChild(s);
      });
    }

    const s = el.querySelector('[data-desc]');      if (s) s.textContent = m.synopsis || m.description || m.desc || '';

    const btnT = el.querySelector('[data-trailer]');
    if (btnT) {
      const u = m.trailerUrl || m.trailer || '';
      btnT.hidden = !u;
      if (u) btnT.addEventListener('click', (e) => {
        e.stopPropagation();
        if (window.openTrailerModal) openTrailerModal(u);
        else window.open(u, '_blank');
      });
    }

    // [QUAN TRỌNG] Ẩn/hiện nút Đặt vé dựa trên 'showRating'
    // 'Now Showing' (showRating=true) -> Hiện nút
    // 'Coming Soon' (showRating=false) -> Ẩn nút
    const book = el.querySelector('[data-book]');
    if (book) {
      book.hidden = !showRating; 
      book.href   = `movie-detail.html?id=${encodeURIComponent(m.id||'')}`;
      book.addEventListener('click', (e) => e.stopPropagation());
    }

    el.addEventListener('click', () => {
      location.href = `movie-detail.html?id=${encodeURIComponent(m.id||'')}`;
    });

    return el;
  }

  // ===== [HÀM MỚI] Render 1 section (có phân trang) =====
  async function renderPagedGrid({ list, gridId, pagerId, perPage, page = 1, options = {} }) {
    const grid = document.getElementById(gridId);
    if (!grid) return;

    await ensureMovieTpl(); // Đảm bảo template đã tải
    
    const total = list.length;
    
    // Hàm con để vẽ phim cho trang hiện tại
    const draw = (currentPage) => {
      const start = (currentPage - 1) * perPage;
      const slice = list.slice(start, start + perPage);
      
      grid.innerHTML = ''; // Xóa grid cũ
      slice.forEach(m => grid.appendChild(cardFrom(m, options)));
    };

    // Vẽ phân trang
    if (window.mountPagination) {
      window.mountPagination({
        mountId: pagerId,
        total, perPage, page,
        onChange: (to) => {
          draw(to); // Vẽ lại grid khi đổi trang
          grid.scrollIntoView({ behavior: 'smooth', block: 'start' }); // Cuộn lên đầu lưới
        },
        syncQuery: false
      });
    } else {
      document.getElementById(pagerId)?.remove();
    }

    // Vẽ phim cho trang đầu tiên
    draw(page);
  }

  // ===== Fetch data (Giữ nguyên) =====
  async function fetchMovies() {
    try {
      const res = await fetch(API_DATA, { cache: 'no-store' });
      if (res.ok) return await res.json();
    } catch {}
    // Fallback (giữ nguyên)
    return {
      now: [ { id:'m1', title:'Edge of Midnight', posterUrl:'https://picsum.photos/seed/m1/600/900', rating:8.1, trailerUrl:'', duration:'2h 10m' } ],
      soon: [ { id:'m3', title:'Crimson Blade',    posterUrl:'https://picsum.photos/seed/m3/600/900', rating:null, trailerUrl:'', releaseDate:'2025-12-05', duration:'2h 05m' } ]
    };
  }

  // ===== Tự chia now/soon (Giữ nguyên) =====
  function splitMovies(arr) {
    const now = [], soon = [];
    const today = new Date().toISOString().slice(0,10);
    arr.forEach(m => {
      const tag = (m.status || '').toLowerCase();
      if (tag === 'now' || tag === 'dangchieu' || tag === 'đang chiếu') return now.push(m);
      if (tag === 'soon' || tag === 'sapchieu' || tag === 'sắp chiếu') return soon.push(m);
      if (m.releaseDate && m.releaseDate > today) soon.push(m);
      else now.push(m);
    });
    return { now, soon };
  }

  // ===== [ĐÃ SỬA] Boot =====
  document.addEventListener('DOMContentLoaded', async () => {
    try {
      // 1. Fetch và chia data
      const raw = await fetchMovies();
      if (Array.isArray(raw)) {
        allMovies = splitMovies(raw);
      } else {
        allMovies.now = raw?.now || [];
        allMovies.soon = raw?.soon || [];
      }
      console.log('[movies] now/soon =', allMovies.now.length, allMovies.soon.length);

      // 2. Lấy các DOM element mới
      const tabNow = document.getElementById('tabNow');
      const tabSoon = document.getElementById('tabSoon');
      if (window.mountBreadcrumb) mountBreadcrumb();
      const gridId = 'movieGrid';
      const pagerId = 'moviePager';

      if (!tabNow || !tabSoon) return; // Thoát nếu không tìm thấy tab

      // 3. Gắn sự kiện click cho tab "Now Showing"
      tabNow.addEventListener('click', () => {
        // Cập nhật giao diện tab
        tabNow.classList.add('is-active');
        tabSoon.classList.remove('is-active');
        
        // Vẽ lại lưới với data "now"
        renderPagedGrid({
          list: allMovies.now,
          gridId, pagerId, perPage: PER_PAGE, page: 1,
          options: { showRating: true, showRelease: false } // Bật rating/nút đặt vé
        });
      });

      // 4. Gắn sự kiện click cho tab "Coming Soon"
      tabSoon.addEventListener('click', () => {
        // Cập nhật giao diện tab
        tabSoon.classList.add('is-active');
        tabNow.classList.remove('is-active');
        
        // Vẽ lại lưới với data "soon"
        renderPagedGrid({
          list: allMovies.soon,
          gridId, pagerId, perPage: PER_PAGE, page: 1,
          options: { showRating: false, showRelease: true } // Ẩn rating/nút đặt vé
        });
      });

      // 5. Tải lần đầu: Tự động click vào tab "Now Showing"
      tabNow.click();

    } catch (e) {
      console.error('[movies] boot error:', e);
    }
  });
})();