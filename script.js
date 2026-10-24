(() => {
  const html = document.documentElement;
  const toggle = document.getElementById('theme-toggle');
  const symbol = toggle?.querySelector('.theme-symbol');
  const key = 'ziz-portfolio-theme';
  let saved = null;
  try { saved = localStorage.getItem(key); } catch (_) {}
  const apply = theme => {
    html.dataset.theme = theme;
    if (symbol) symbol.textContent = theme === 'light' ? '☾' : '☼';
    if (toggle) toggle.setAttribute('aria-label', theme === 'light' ? 'Switch to dark theme' : 'Switch to light theme');
    if (toggle) toggle.setAttribute('aria-pressed', theme === 'light' ? 'true' : 'false');
  };
  apply(saved === 'light' || saved === 'dark' ? saved : 'dark');
  toggle?.addEventListener('click', () => {
    const next = html.dataset.theme === 'light' ? 'dark' : 'light';
    apply(next);
    try { localStorage.setItem(key, next); } catch (_) {}
  });
  const year = document.getElementById('year');
  if (year) year.textContent = String(new Date().getFullYear());
})();
