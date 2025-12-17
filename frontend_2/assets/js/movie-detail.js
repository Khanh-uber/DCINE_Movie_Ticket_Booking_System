// assets/js/movie-detail.js
(() => {
  const $  = (s, r=document) => r.querySelector(s);
  const $$ = (s, r=document) => [...r.querySelectorAll(s)];
  const API = window.API_BASE = 'http://localhost:8080/api';

  const ICON_BASE = '../assets/icons';

  // ---------- utils ----------
  const getParam = (k) => new URL(location.href).searchParams.get(k);
  const asMin = (v) => /^\d+$/.test(String(v || '')) ? Number(v) : null;
  const fmtDur = (mins) => {
    const n = asMin(mins);
    if (n == null) return String(mins || '');
    const h = Math.floor(n / 60), m = n % 60;
    return (h ? `${h}h ` : '') + (m ? `${m}m` : '');
  };
  const pickText = (x, y) =>
    (x && String(x).trim()) || (y && String(y).trim()) || '';

  const setText = (sel, val, fallback = '—') => {
    const el = $(sel);
    if (el) el.textContent = val && String(val).trim() ? val : fallback;
  };

  async function getJSON(api, local){
    try{
      const r = await fetch(api, { cache: 'no-store', credentials: 'include'});
      if (r.ok) return await r.json();
    }catch{}
    if (!local) return null;
    try{
      const r2 = await fetch(local, { cache: 'no-store', credentials: 'include' });
      if (r2.ok) return await r2.json();
    }catch{}
    return null;
  }

  // ---------- data loader ----------
  async function loadMovieById(id) {
    if (!id) return null;

    // 1) BE /movies/:id
    try {
      const r = await fetch(
        `${API}/movies/${encodeURIComponent(id)}`,
        { cache: 'no-store', credentials: 'include' }
      );
      if (r.ok) {
        const m = await r.json();
        if (m && m.id) return m;
      }
    } catch {}

    // 2) BE /movies/now + /movies/soon
    try {
      const [nowRes, soonRes] = await Promise.all([
        fetch(`${API}/movies/now`,  { cache: 'no-store', credentials: 'include' }),
        fetch(`${API}/movies/soon`, { cache: 'no-store', credentials: 'include' })
      ]);

      let pile = [];
      if (nowRes.ok)  pile = pile.concat((await nowRes.json())  || []);
      if (soonRes.ok) pile = pile.concat((await soonRes.json()) || []);

      const found = pile.find(m => String(m.id) === String(id));
      if (found) return found;
    } catch {}

    // 3) Fallback: movies.json (mảng hoặc {now,soon})
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

  const metaItem = (iconName, text) => `
    <span class="meta-item">
      <img src="${ICON_BASE}/ic-${iconName}.svg"
           alt="" class="meta-ic" aria-hidden="true">
      <span>${text}</span>
    </span>
  `;

  // ---------- UI builders ----------
  function renderHero(m) {
    const title = pickText(
      m.title,
      m.originalTitle || m.original_title
    );
    $('#mdTitle').textContent = title || 'Unknown title';
    const bc = $('#bc');
    if (bc) {
      // Tự render HTML cho breadcrumb thay vì chờ hàm tự động
      bc.innerHTML = `
        <a href="index.html">Trang chủ</a>
        <span class="sep">/</span>
        <a href="movies.html">Phim</a>
        <span class="sep">/</span>
        <span class="curr">${title}</span>
      `;
    }
    const bg =
      m.backdropUrl || m.backdrop ||
      m.bannerUrl   || m.banner   ||
      m.posterUrl   || m.poster   || '';
    if (bg) $('#mdBackdrop').style.backgroundImage = `url('${bg}')`;

    const year = (m.releaseDate || m.release_date || '').slice(0, 4);
    const genres = Array.isArray(m.genres)
      ? m.genres.join(', ')
      : (typeof m.genre === 'string' ? m.genre : '');
    const duration = fmtDur(
      m.duration || m.runtime || m.durationMin || m.duration_min
    );
    const rated = m.rated || m.age || m.ageLimit || m.age_limit || '';
    const ratingScore = (m.rating !== undefined && m.rating !== null)
      ? String(m.rating)
      : '';

    const metaNode = $('#mdMeta');
    if (metaNode) {
      const chunks = [];
      if (year)        chunks.push(metaItem('calendar', year));
      if (genres)      chunks.push(metaItem('popcorn', genres));
      if (duration)    chunks.push(metaItem('clock', duration));
      if (rated)       chunks.push(metaItem('warning-triangle', rated));
      if (ratingScore) chunks.push(metaItem('star', `${ratingScore}`));

      metaNode.innerHTML = chunks.join('');
    }

    const trailer = m.trailerUrl || m.trailer || '';
    const btn = $('#watchTrailerBtn');
    if (trailer && btn) {
      btn.hidden = false;
      btn.addEventListener('click', () => {
        if (window.openTrailerModal) window.openTrailerModal(trailer);
        else window.open(trailer, '_blank');
      });
    } else if (btn) {
      btn.remove();
    }
  }

  function renderCopy(m) {
    setText('#mdDesc',
      m.synopsis || m.description || m.desc,
      '—'
    );
    setText('#mdLang', m.language);

    // đạo diễn (List<CastDTO>)
    if (Array.isArray(m.director)) {
      const names = m.director.map(d => d.name).join(', ');
      setText('#mdDirector', names);
    } else {
      setText('#mdDirector', m.director);
    }

    // diễn viên
    const cast = Array.isArray(m.cast) ? m.cast : [];
    const wrap = $('#mdCast');
    if (!wrap) return;

    wrap.innerHTML = '';

    cast.slice(0, 12).forEach(actor => {
      const name = actor.name || String(actor || '');
      const img  = actor.castUrl || `https://picsum.photos/seed/${encodeURIComponent(name)}/200/200`;

      const el = document.createElement('div');
      el.className = 'actor';
      el.innerHTML = `
        <div class="avatar">
          <img src="${img}" alt="${name}">
        </div>
        <div class="name">${name}</div>
      `;
      wrap.appendChild(el);
    });
  }


  function renderFacts(m) {
    const originalTitle =
      m.originalTitle || m.original_title || '';
    const duration = fmtDur(
      m.duration || m.runtime || m.durationMin || m.duration_min || ''
    );
    const genres = Array.isArray(m.genres)
      ? m.genres.join(', ')
      : (m.genre || '');
    const rated = m.rated || m.age || m.ageLimit || m.age_limit || '';
    const ratingScore =
      (m.rating !== undefined && m.rating !== null)
        ? String(m.rating)
        : '';
    const release = m.releaseDate || m.release_date || '';
    const statusRaw = m.status || '';
    let status = statusRaw;
    if (statusRaw === 'now')   status = 'Đang chiếu';
    if (statusRaw === 'soon')  status = 'Sắp chiếu';
    if (statusRaw === 'ended') status = 'Ngừng chiếu';

    setText('#mdOriginal', originalTitle);
    setText('#mdRelease', release);
    setText('#mdStatus', status);
    setText('#mdDuration', duration);
    setText('#mdGenres', genres);
    setText('#mdRated', rated);
    setText('#mdRating', ratingScore);
  }

  function bindBookingLinks(movieId) {
    const href = `showtime.html?movie=${encodeURIComponent(movieId)}`;
    const buy = $('#buyTicketsBtn');
    if (buy) buy.href = href;
  }

// ---------- COMMENT LOGIC (REAL API) ----------

  let currentMovieId = null;

  async function initCommentSection(movieId) {
    currentMovieId = movieId;

    const txt = $('#txtComment');
    const btn = $('#btnPostComment');
    const prompt = $('#cmtLoginPrompt');
    const btnLoginLink = $('#btnLoginLink');
    const charDisplay = $('#charCount');

    const token = localStorage.getItem('accessToken');
    
    const doLogin = (e) => {
        if(e) e.preventDefault();
        const currentPath = window.location.pathname.split('/').pop() + window.location.search;
        window.location.href = `D_cine_login.html?next=${encodeURIComponent(currentPath)}`;
    };

    if (token) {
      if (prompt) prompt.style.display = 'none';
      if (btn) btn.onclick = () => handlePostComment(token);
    } else {
      if (prompt) prompt.style.display = 'block';
      if (btnLoginLink) btnLoginLink.addEventListener('click', doLogin);

      const requireLogin = () => {
         if(confirm('Bạn cần đăng nhập để tham gia bình luận. Đăng nhập ngay?')) {
             doLogin();
         }
         if (txt) txt.blur();
      };

      if (txt) txt.addEventListener('focus', requireLogin);
      if (btn) btn.addEventListener('click', requireLogin);
    }

    if (txt && charDisplay) {
        txt.addEventListener('input', () => {
            charDisplay.textContent = `${txt.value.length} / 1000`;
        });
    }

    await loadCommentsReal(movieId);
  }


async function loadCommentsReal(movieId) {
    const container = $('#commentList');
    const countDisplay = $('#cmtCount');
    const token = localStorage.getItem('accessToken'); 
    const headers = {
        'Content-Type': 'application/json'
    };
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    try {
        const res = await fetch(`${API}/comments?movieId=${movieId}`, {
            method: 'GET',
            headers: headers,     
            credentials: 'include' 
        });
        
        if (res.ok) {
            const data = await res.json();      
            if (countDisplay) countDisplay.textContent = data.length || 0;
            renderCommentList(data);
        } else {
            container.innerHTML = '<p style="color:#666">Không tải được bình luận.</p>';
        }
    } catch (err) {
        console.error(err);
        container.innerHTML = '<p style="color:#666">Lỗi kết nối.</p>';
    }
}

  async function handlePostComment(token) {
    const txt = $('#txtComment');
    const text = txt ? txt.value.trim() : '';
    
    if (!text) return; 

    const btn = $('#btnPostComment');
    btn.disabled = true;
    btn.innerHTML = 'Đang gửi...';

    try {
        const res = await fetch(`${API}/comments`, {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` 
            },
            body: JSON.stringify({
                movieId: currentMovieId,
                content: text
            })
        });

        if (res.ok) {
            txt.value = '';
            $('#charCount').textContent = '0 / 1000';
            await loadCommentsReal(currentMovieId); 
        } else {
            alert('Gửi thất bại. Vui lòng thử lại.');
        }

    } catch (err) {
        console.error(err);
        alert('Lỗi kết nối Server.');
    } finally {
        btn.disabled = false;
        btn.innerHTML = `Gửi <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>`;
    }
  }

// assets/js/movie-detail.js

  function renderCommentList(arr) {
    const container = $('#commentList');
    if (!container) return;
    
    // 1. Kiểm tra nếu không có bình luận
    if (!arr || arr.length === 0) {
        container.innerHTML = '<p style="color:#666; font-style:italic; text-align:center; padding:20px;">Chưa có bình luận nào. Hãy là người đầu tiên!</p>';
        return;
    }

    const html = arr.map(c => {
        // 2. Logic tạo nút Sửa/Xóa (Chỉ hiện khi myComment = true)
        let actions = '';
        if (c.myComment) { // Biến này do Backend trả về (true/false)
            // Xử lý dấu nháy đơn để không lỗi JS
            const safeContent = c.content ? c.content.replace(/'/g, "\\'") : "";
            
            actions = `
              <div class="cmt-actions">
                <button class="btn-icon edit" title="Sửa" onclick="editComment(${c.id}, '${safeContent}')">
                  <i class="fa-solid fa-pen"></i>
                </button>
                <button class="btn-icon delete" title="Xóa" onclick="deleteComment(${c.id})">
                  <i class="fa-solid fa-trash"></i>
                </button>
              </div>
            `;
        }

        // 3. Render HTML
        return `
        <div class="cmt-item" id="cmt-${c.id}">
            <div class="cmt-avatar">
                <img src="${c.avatarUrl}" 
                     alt="${c.fullName}" 
                     onerror="this.src='../assets/images/avatar-default.png'">
            </div>
            <div class="cmt-content">
                <div class="cmt-header">
                    <div class="cmt-info">
                        <span class="cmt-author">${c.fullName || 'Người dùng'}</span>
                        <span class="cmt-date">${c.createdAt}</span>
                    </div>
                    ${actions} </div>
                <div class="cmt-text" id="cmt-text-${c.id}">${c.content}</div>
            </div>
        </div>
        `;
    }).join('');

    container.innerHTML = html;
  }

  window.deleteComment = async function(id) {
      if(!confirm('Bạn chắc chắn muốn xóa bình luận này?')) return;
      
      try {
          const res = await fetch(`${API}/comments/${id}`, {
              method: 'DELETE',
              credentials: 'include'
          });
          if(res.ok) {
              initCommentSection(new URL(location.href).searchParams.get('id'));
          } else {
              alert('Không thể xóa comment này.');
          }
      } catch(e) { console.error(e); }
  };

  window.editComment = function(id, oldContent) {
      const newContent = prompt("Sửa bình luận của bạn:", oldContent);
      if (newContent !== null && newContent.trim() !== "" && newContent !== oldContent) {
          submitEditComment(id, newContent);
      }
  };

  async function submitEditComment(id, content) {
      try {
          const res = await fetch(`${API}/comments/${id}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              credentials: 'include',
              body: JSON.stringify({ content: content })
          });
          if(res.ok) {
              initCommentSection(new URL(location.href).searchParams.get('id'));
          } else {
              alert('Lỗi khi sửa comment.');
          }
      } catch(e) { console.error(e); }
  }
  document.addEventListener('DOMContentLoaded', async () => {
    try {
      if (window.mountBreadcrumb) window.mountBreadcrumb();

      const id = getParam('id') || getParam('movie');
      if (!id) {
        console.warn('[movie-detail] Thiếu id phim trên URL');
        return;
      }

      const movie = await loadMovieById(id);
      if (!movie) {
        console.warn('[movie-detail] Không tìm thấy phim với id =', id);
        return;
      }

      renderHero(movie);
      renderCopy(movie);
      renderFacts(movie);
      bindBookingLinks(movie.id);
      initCommentSection(movie.id);
    } catch (e) {
      console.error('[movie-detail] boot error:', e);
    }
  });
})();
