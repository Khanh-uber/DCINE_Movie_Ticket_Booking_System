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
  // fallback nếu chưa load được template
  if (!MOVIE_TPL?.content?.firstElementChild) {
    const el = document.createElement('article');
    el.className = 'movie-card poster';
    el.textContent = m.title || 'Movie';
    el.addEventListener('click', () => {
      if (m.id) {
        location.href = `movie-detail.html?movie=${encodeURIComponent(m.id)}`;
      }
    });
    return el;
  }

  const el = MOVIE_TPL.content.firstElementChild.cloneNode(true);
  el.dataset.id = m.id || '';

  // ===== Poster =====
  const img = el.querySelector('[data-img]');
  if (img) {
    const poster =
      m.posterUrl || m.poster ||
      m.backdropUrl || m.backdrop ||
      m.bannerUrl || m.banner || '';
    img.src = poster;
    img.alt = m.title || 'Poster';
    img.draggable = false;
  }

  // ===== Title =====
  const t = el.querySelector('[data-title]');
  if (t) {
    t.textContent =
      m.title ||
      m.movieName ||
      m.name ||
      '';
  }

  // ===== Director (hỗ trợ List<CastDTO> giống movie-detail) =====
  const d = el.querySelector('[data-director]');
  if (d) {
    let directorText = '';

    if (Array.isArray(m.director)) {
      directorText = m.director
        .map(x => x && (x.name || x.fullName || String(x)))
        .filter(Boolean)
        .join(', ');
    } else {
      directorText = m.director || m.directorName || '';
    }

    d.textContent = directorText ? `Đạo diễn: ${directorText}` : '';
  }

  // ===== Duration + (optional) release (đọc cả durationMin) =====
  const u = el.querySelector('[data-duration]');
  if (u) {
    const raw =
      m.duration ||
      m.runtime ||
      m.durationMin ||
      m.duration_min ||
      '';

    let durationText = '';
    if (raw) {
      const s = String(raw).trim();
      if (/^\d+$/.test(s)) {
        const mins = Number(s);
        const h = Math.floor(mins / 60);
        const rest = mins % 60;
        if (h && rest) durationText = `${h}h ${rest}m`;
        else if (h)    durationText = `${h}h`;
        else           durationText = `${rest}m`;
      } else {
        durationText = s;
      }
    }

    let releaseText = '';
    if (showRelease) {
      releaseText = m.releaseDate || m.release_date || '';
    }

    if (durationText && releaseText) {
      u.textContent = `${durationText} • ${releaseText}`;
    } else {
      u.textContent = durationText || releaseText || '';
    }
  }

  // ===== Rating =====
  const rate = el.querySelector('[data-rating]');
  if (rate) {
    if (showRating && (m.rating ?? null) !== null) {
      const num = Number(m.rating);
      const text = Number.isFinite(num) ? num.toFixed(1) : String(m.rating);
      rate.innerHTML = `⭐ ${text}/10`;
    } else {
      rate.innerHTML = '';
    }
  }

  // ===== Genres =====
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

  // ===== Description =====
  const desc = el.querySelector('[data-desc]');
  if (desc) {
    desc.textContent = m.synopsis || m.description || m.desc || '';
  }

  // ===== Nút Trailer =====
  const btnT = el.querySelector('[data-trailer]');
  if (btnT) {
    const trailerUrl = m.trailerUrl || m.trailer || '';
    if (trailerUrl) {
      btnT.hidden = false;
      btnT.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
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

  // ===== Nút Đặt vé (only cho phim đang chiếu) =====
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
    }
  }

  // Click cả card -> chi tiết phim
  el.addEventListener('click', () => {
    if (m.id) {
      location.href = `movie-detail.html?movie=${encodeURIComponent(m.id)}`;
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

if (query && query.trim() !== '') {
  console.log(`[movies] Searching for: "${query}"`);

  // Ẩn tab đi
  if (tabsContainer) tabsContainer.style.display = 'none';
  if (pageTitle) pageTitle.textContent = `KẾT QUẢ TÌM KIẾM: "${query}"`;

  const allList = [...(allMovies.now || []), ...(allMovies.soon || [])];
  const keyword = removeAccents(query);

  const results = allList.filter((m) => {
    const bagParts = [
      m.title,
      m.movieName,
      m.name,
      m.originalTitle,
      m.vnTitle, 
      m.viTitle,
      m.enTitle,
      Array.isArray(m.director)
      ? m.director.map(d => d && (d.name || d.fullName || String(d))).join(' ')
      : (m.director || m.directorName),
      // cast / diễn viên
      Array.isArray(m.cast) ? m.cast.join(' ') : m.cast,
      Array.isArray(m.actors) ? m.actors.join(' ') : m.actors,

      // genres / tags
      Array.isArray(m.genres) ? m.genres.join(' ') : m.genre,
      Array.isArray(m.tags) ? m.tags.join(' ') : m.tags,
    ];

    const bagRaw = bagParts
      .filter(Boolean)
      .map(String)
      .join(' ')
      .trim();

    if (!bagRaw) return false;

    const bag = removeAccents(bagRaw);
    return bag.includes(keyword);
  });

  renderPagedGrid({
    list: results,
    gridId,
    pagerId,
    perPage: PER_PAGE,
    page: 1,
    options: { showRating: true, showRelease: true },
  });

  if (results.length === 0) {
    const grid = document.getElementById(gridId);
    if (grid) {
      grid.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; color: #aaa; padding: 40px;">
          Không tìm thấy phim nào phù hợp với "${query}"
        </div>`;
    }
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