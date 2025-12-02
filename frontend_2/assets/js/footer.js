(() => {
  const mount = document.getElementById('ftr-include');
  if (!mount) return;
  const tryPaths = ['./footer.html','footer.html','../html/footer.html','html/footer.html'];
  async function load() {
    let html = null, used = null;
    for (const p of tryPaths) {
      try {
        const r = await fetch(p + '?v=' + Date.now(), { cache: 'no-store' });
        if (r.ok) { html = await r.text(); used = p; break; }
      } catch {}
    }
    if (!html) { console.warn('[footer] không tìm thấy footer.html'); return; }
    mount.innerHTML = html;
    mount.style.display = 'block';
    console.log('[footer] loaded from:', used,
                '| version:', mount.querySelector('.site-footer')?.dataset.version);
    const y = mount.querySelector('[data-year]');
    if (y) y.textContent = new Date().getFullYear();
    const grid = mount.querySelector('.sf-grid');
    if (grid) {
      console.table([...grid.children].map(n => n.className));
    }
  }

  load();
})();