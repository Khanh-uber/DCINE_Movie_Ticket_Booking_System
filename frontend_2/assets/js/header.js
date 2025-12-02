
(() => {
  const $ = (s) => document.querySelector(s);
  const $$ = (s) => document.querySelectorAll(s);
  const header = $('#site-header');
  window.addEventListener('scroll', () => {
    if (header) {
      header.classList.toggle('scrolled', window.scrollY > 10);
    }
  });
  const searchBtn = $('#searchBtn');
  const searchForm = $('#searchForm'); 
  const searchInput = $('#searchInput');

  if (searchBtn && searchForm && searchInput) {
    searchBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const isOpen = searchForm.classList.contains('open');
      const hasValue = searchInput.value.trim().length > 0;

      if (isOpen && hasValue) {
        searchForm.submit();
      } else {
        searchForm.classList.toggle('open');
        if (!isOpen) {
          setTimeout(() => searchInput.focus(), 100);
        }
      }
    });

    searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        if (searchInput.value.trim()) {
           searchForm.submit();
        }
      }
    });

    document.addEventListener('click', (e) => {
      if (!searchBtn.contains(e.target) && !searchForm.contains(e.target)) {
        if (!searchInput.value) { 
             searchForm.classList.remove('open');
        }
      }
    });
  }

  function checkAuth() {
    const token = localStorage.getItem('accessToken'); 
    const guestGroup = $('#guestAction');
    const userGroup = $('#userAction');

    if (token) {
      // --- ĐÃ ĐĂNG NHẬP ---
      if (guestGroup) guestGroup.style.display = 'none'; 
      if (userGroup) userGroup.style.display = 'flex'; 
      const fullName = localStorage.getItem('fullName') || localStorage.getItem('username') || 'Member';
      const avatarUrl = localStorage.getItem('avatarUrl');

      const nameEl = $('#userName');
      const imgEl = $('#avatarImg');
      const textEl = $('#avatarFallback');

      if (nameEl) nameEl.textContent = fullName;

      if (avatarUrl && imgEl) {
        imgEl.src = avatarUrl;
        imgEl.style.display = 'block';
        if (textEl) textEl.style.display = 'none';
      } else {
        if (imgEl) imgEl.style.display = 'none';
        if (textEl) {
            textEl.textContent = fullName.charAt(0).toUpperCase();
            textEl.style.display = 'block';
        }
      }

    } else {
      if (guestGroup) guestGroup.style.display = 'flex'; 
      if (userGroup) userGroup.style.display = 'none';   
    }
  }

  checkAuth();
  const loginLink = document.querySelector('#guestAction .btn-text');
  if (loginLink) {
    loginLink.addEventListener('click', (e) => {
      e.preventDefault();

      const url = new URL(location.href);
      const file = url.pathname.split('/').pop() || 'index.html';
      const search = url.search || '';
      const hash = url.hash || '';
      const next = `${file}${search}${hash}`; 
      const loginUrl = `D_cine_login.html?next=${encodeURIComponent(next)}`;
      location.href = loginUrl;
    });
  }

  $$('.scroll-link').forEach(link => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      if (href.includes('#')) {
        const hash = href.split('#')[1];
        const target = document.getElementById(hash);
        const isHome = location.pathname.endsWith('index.html') || location.pathname === '/' || location.pathname.endsWith('/');
        
        if (isHome && target) {
          e.preventDefault();
          const headerHeight = header ? header.offsetHeight : 70;
          const topPos = target.getBoundingClientRect().top + window.scrollY - headerHeight;
          
          window.scrollTo({
            top: topPos,
            behavior: 'smooth'
          });
        }
      }
    });
  });

})();