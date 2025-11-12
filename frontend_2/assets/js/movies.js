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

function cardFrom(m, { showRating = false, showRelease = false } = {}) {
  // Nếu có template <template id="movie-card">
  let el;
  if (MOVIE_TPL?.content?.firstElementChild) {
    el = MOVIE_TPL.content.firstElementChild.cloneNode(true);
  } else {
    // fallback đơn giản
    el = document.createElement('article');
    el.className = 'movie-card poster';
  }

  el.dataset.id = m.id || '';

  // Poster
  const img = el.querySelector('[data-img]');
  if (img) {
    img.src = m.posterUrl || m.poster || '';
    img.alt = m.title || 'Poster';
    img.draggable = false;
  }

  // Title
  const t = el.querySelector('[data-title]');
  if (t) t.textContent = m.title || '';

  // Director
  const d = el.querySelector('[data-director]');
  if (d) d.textContent = m.director ? `Directed by ${m.director}` : '';

  // Duration + Release
  const u = el.querySelector('[data-duration]');
  if (u) {
    const raw = m.duration || m.runtime || '';
    const dur =
      raw && /^\d+$/.test(String(raw).trim())
        ? `${raw} phút`
        : (raw || '');
    const rel = showRelease && m.releaseDate ? m.releaseDate : '';
    u.textContent = dur && rel ? `${dur} • ${rel}` : (dur || rel || '');
  }

  // Rating (chỉ dùng để phân biệt phim đang chiếu)
  const rate = el.querySelector('[data-rating]');
  if (rate) {
    if (showRating && (m.rating ?? null) !== null) {
      rate.innerHTML = `⭐ ${Number(m.rating || 0).toFixed(1)}/10`;
    } else {
      rate.innerHTML = '';
    }
  }

  // Genres
  const gWrap = el.querySelector('[data-genres]');
  if (gWrap) {
    const genres = Array.isArray(m.genres)
      ? m.genres
      : (typeof m.genre === 'string' ? m.genre.split(',') : []);
    gWrap.innerHTML = '';
    genres
      .map(x => String(x).trim())
      .filter(Boolean)
      .slice(0, 4)
      .forEach(g => {
        const s = document.createElement('span');
        s.className = 'tag';
        s.textContent = g;
        gWrap.appendChild(s);
      });
  }

  // Description
  const desc = el.querySelector('[data-desc]');
  if (desc) {
    desc.textContent = m.synopsis || m.description || m.desc || '';
  }

  // ===== Trailer button =====
  const btnT = el.querySelector('[data-trailer]');
  if (btnT) {
    const trailerUrl = m.trailerUrl || m.trailer || '';
    if (trailerUrl) {
      btnT.hidden = false;
      btnT.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation(); // KHÔNG cho nổi lên card
        if (window.openTrailerModal) {
          window.openTrailerModal(trailerUrl);
        } else {
          window.open(trailerUrl, '_blank');
        }
      });
    } else {
      btnT.remove();
    }
  }

  // ===== Book button -> sang showtime cho phim đang chiếu =====
  const book = el.querySelector('[data-book]');
  if (book) {
    if (!showRating) {
      // Coming soon: không cho đặt vé
      book.remove();
    } else {
      const movieId = encodeURIComponent(m.id || '');
      book.hidden = false;
      book.href = movieId
        ? `showtime.html?movie=${movieId}`
        : `showtime.html`;

      // Cho anchor tự điều hướng, nhưng không bắn click card
      book.addEventListener('click', (e) => {
        e.stopPropagation();
      });
    }
  }

  // ===== Click cả card -> movie-detail (trừ 2 nút trên, trừ lúc kéo) =====
  el.addEventListener('click', (e) => {
    // Nếu bấm vào Trailer/Book thì bỏ (đã handle riêng)
    if (e.target.closest('[data-trailer],[data-book]')) return;

    // Nếu đang kéo coverflow thì không điều hướng
    const rail = el.closest('.rail');
    if (rail && rail.dataset.isDragging === '1') {
      rail.dataset.isDragging = '0';
      e.preventDefault();
      e.stopPropagation();
      return;
    }

    const id = m.id || '';
    if (id) {
      location.href = `movie-detail.html?movie=${encodeURIComponent(id)}`;
    }
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
    const [nowRes, soonRes] = await Promise.all([
      fetch('http://localhost:8080/api/movies/now',  { cache: 'no-store' }),
      fetch('http://localhost:8080/api/movies/soon', { cache: 'no-store' })
    ]);

    if (nowRes.ok && soonRes.ok) {
      const now = await nowRes.json();
      const soon = await soonRes.json();
      return { now, soon };
    }
  } catch (err) {
    console.error("Lỗi khi gọi backend:", err);
  }
    // Fallback (giữ nguyên)
    return fetch(API_DATA, { cache: 'no-store' })
      .then(res => {
        if (!res.ok) throw new Error('Network response was not ok');
        return res.json();
      })
    ;
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