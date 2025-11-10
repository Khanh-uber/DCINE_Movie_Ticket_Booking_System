// header.js (Desktop Header interactions)
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  // Sticky header effect
  const header = $('#site-header');
  const onScroll = () => {
    if (header) {
      header.classList.toggle('scrolled', window.scrollY > 8);
    }
  };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  // Helper to check if an element is inside another (for click events)
  const inside = (parent, target) => !!parent && (parent === target || parent.contains(target));

  // Search toggle logic
  const searchBtn = $('#searchBtn');
  const searchForm = $('#searchForm');
  const searchInput = $('#searchInput');
  function openSearch(show) {
    if (!searchForm) return;
    searchForm.classList.toggle('open', show);
    searchBtn?.setAttribute('aria-expanded', String(show));
    // Compress other header tools when search is open
    $('.hdr-tools')?.classList.toggle('compact', show);
    if (show) {
      setTimeout(() => searchInput?.focus(), 0);
    }
  }
  searchBtn?.addEventListener('click', () => {
    const isOpen = searchForm.classList.contains('open');
    openSearch(!isOpen);
  });
  document.addEventListener('click', (e) => {
    if (!searchForm?.classList.contains('open')) return;
    if (!inside(searchForm, e.target) && !inside(searchBtn, e.target)) {
      openSearch(false);
    }
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      openSearch(false);
    }
    // Press "/" to quick-open search (when not typing in an input)
    if (e.key === '/' && !/input|textarea|select/i.test(document.activeElement.tagName)) {
      e.preventDefault();
      openSearch(true);
    }
  });

  // Authentication state UI update
  function refreshAuthUI() {
    const token = localStorage.getItem('accessToken');
    const isAuth = !!token;
    // Show/hide elements based on auth state
    $$('.guest-only').forEach(el => {
      el.style.display = isAuth ? 'none' : '';
    });
    $$('.auth-only').forEach(el => {
      el.hidden = !isAuth;
    });
    if (isAuth) {
      const name = (localStorage.getItem('fullName') || localStorage.getItem('username') || 'User').trim();
      const imgUrl = localStorage.getItem('avatarUrl') || '';
      const imgEl = $('#avatarImg');
      const fallbackEl = $('#avatarFallback');
      const userNameEl = $('#userName');
      // Set avatar image or initial
      if (imgUrl && imgEl) {
        imgEl.src = imgUrl;
        imgEl.hidden = false;
        fallbackEl.hidden = true;
      } else if (fallbackEl) {
        fallbackEl.textContent = (name[0] || 'U').toUpperCase();
        if (imgEl) imgEl.hidden = true;
        fallbackEl.hidden = false;
      }
      // Set user name text
      if (userNameEl) {
        userNameEl.textContent = name;
        userNameEl.setAttribute('title', name);
      }
    }
  }
  refreshAuthUI();

  // Dev helper: call in console like window.dcineAuth('login', {name: 'Test User', avatar: 'avatar.jpg'})
  window.dcineAuth = (cmd, payload = {}) => {
    if (cmd === 'login') {
      localStorage.setItem('accessToken', 'dev-token');
      if (payload.name) localStorage.setItem('fullName', payload.name);
      if (payload.avatar) localStorage.setItem('avatarUrl', payload.avatar);
    } else if (cmd === 'logout') {
      ['accessToken', 'fullName', 'username', 'avatarUrl'].forEach(k => localStorage.removeItem(k));
    }
    location.reload();
  };

  // User avatar dropdown menu
  const userBtn = $('#userBtn');
  const userMenu = $('#userMenu');
  function toggleMenu(show) {
    if (!userMenu || !userBtn) return;
    userMenu.hidden = !show;
    userBtn.setAttribute('aria-expanded', String(show));
  }
  userBtn?.addEventListener('click', () => {
    toggleMenu(userMenu.hidden);
  });
  document.addEventListener('click', (e) => {
    if (!userMenu || userMenu.hidden) return;
    if (!inside(userMenu, e.target) && !inside(userBtn, e.target)) {
      toggleMenu(false);
    }
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      toggleMenu(false);
    }
  });

  // Log out action (clear token and reload)
  $('#logoutBtn')?.addEventListener('click', () => {
    ['accessToken', 'fullName', 'username', 'avatarUrl'].forEach(k => localStorage.removeItem(k));
    location.reload();
  });

  // Highlight active nav link based on page
  const path = location.pathname.toLowerCase();
  $$('.main-nav .nav-link').forEach(link => {
    const key = (link.getAttribute('data-match') || '').toLowerCase();
    if (key && path.includes(key)) {
      link.classList.add('active');
    }
  });
})();
