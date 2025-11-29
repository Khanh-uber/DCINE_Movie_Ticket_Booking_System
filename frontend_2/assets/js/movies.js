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

// ===== [HÀM HỖ TRỢ] Chuẩn hóa tiếng Việt để tìm kiếm =====
  function removeAccents(str) {
    return str.normalize('NFD')
              .replace(/[\u0300-\u036f]/g, '')
              .replace(/đ/g, 'd').replace(/Đ/g, 'D')
              .toLowerCase();
  }

  // ===== [ĐÃ SỬA] Boot: Xử lý cả Tìm kiếm và Chuyển Tab từ Header =====
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
      
      // 2. Lấy các DOM element
      const tabNow = document.getElementById('tabNow');
      const tabSoon = document.getElementById('tabSoon');
      const tabsContainer = document.querySelector('.tabs-nav');
      const pageTitle = document.querySelector('.sec-head h1');
      
      if (window.mountBreadcrumb) mountBreadcrumb();

      // Breadcrumb giống movie-detail: Trang chủ / Phim
      const bc = document.getElementById('bc');
      if (bc) {
        bc.classList.add('breadcrumb', 'movies-bc');
        bc.innerHTML = `
          <a href="index.html">Trang chủ</a>
          <span class="sep">/</span>
          <span class="curr">Phim</span>
        `;
      }

      const gridId = 'movieGrid';
      const pagerId = 'moviePager';


      // 3. LẤY THAM SỐ TỪ URL
      const urlParams = new URLSearchParams(window.location.search);
      const query = urlParams.get('q');       // Lấy từ khóa tìm kiếm
      const status = urlParams.get('status'); // Lấy trạng thái (now / soon)

      // --- TRƯỜNG HỢP 1: CÓ TỪ KHÓA TÌM KIẾM (?q=...) ---
      if (query && query.trim() !== '') {
        console.log(`[movies] Searching for: "${query}"`);
        
        // Ẩn tab đi
        if (tabsContainer) tabsContainer.style.display = 'none';
        if (pageTitle) pageTitle.textContent = `KẾT QUẢ TÌM KIẾM: "${query}"`;

        const allList = [...allMovies.now, ...allMovies.soon];
        const keyword = removeAccents(query);

        const results = allList.filter(m => {
          const title = removeAccents(m.title || '');
          const director = removeAccents(m.director || '');
          return title.includes(keyword) || director.includes(keyword);
        });

        renderPagedGrid({
          list: results,
          gridId, pagerId, perPage: PER_PAGE, page: 1,
          options: { showRating: true, showRelease: true }
        });

        if (results.length === 0) {
          const grid = document.getElementById(gridId);
          if (grid) grid.innerHTML = `<div style="grid-column: 1/-1; text-align: center; color: #aaa; padding: 40px;">Không tìm thấy phim nào phù hợp với "${query}"</div>`;
        }

      } else {
        // --- TRƯỜNG HỢP 2: KHÔNG TÌM KIẾM (CHẾ ĐỘ MẶC ĐỊNH) ---
        if (!tabNow || !tabSoon) return;

        // Định nghĩa hành động click cho các tab
        tabNow.addEventListener('click', () => {
          tabNow.classList.add('is-active');
          tabSoon.classList.remove('is-active');
          // Sửa lại tiêu đề cho đúng ngữ cảnh
          if (pageTitle) pageTitle.textContent = 'PHIM ĐANG CHIẾU';
          
          renderPagedGrid({
            list: allMovies.now,
            gridId, pagerId, perPage: PER_PAGE, page: 1,
            options: { showRating: true, showRelease: false }
          });
        });

        tabSoon.addEventListener('click', () => {
          tabSoon.classList.add('is-active');
          tabNow.classList.remove('is-active');
          // Sửa lại tiêu đề cho đúng ngữ cảnh
          if (pageTitle) pageTitle.textContent = 'PHIM SẮP CHIẾU';

          renderPagedGrid({
            list: allMovies.soon,
            gridId, pagerId, perPage: PER_PAGE, page: 1,
            options: { showRating: false, showRelease: true }
          });
        });

        // --- XỬ LÝ ĐIỀU HƯỚNG TỪ HEADER (?status=soon hoặc ?status=now) ---
        if (status === 'soon') {
            // Nếu trên URL có ?status=soon -> Kích hoạt tab Sắp chiếu
            tabSoon.click();
        } else {
            // Mặc định hoặc ?status=now -> Kích hoạt tab Đang chiếu
            tabNow.click();
        }
      }

    } catch (e) {
      console.error('[movies] boot error:', e);
    }
  });
})();