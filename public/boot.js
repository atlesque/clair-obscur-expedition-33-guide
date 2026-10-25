// Runs before first paint: applies the saved Auto/Dark/Light choice (default: auto).
(() => {
  const root = document.documentElement;
  const read = () => { try { return localStorage.getItem('expedition-33-guide.theme'); } catch { return null; } };
  const mode = read() ?? 'auto';
  const dark = mode === 'dark' || (mode !== 'light' && matchMedia('(prefers-color-scheme: dark)').matches);
  root.classList.toggle('dark', dark);
  root.dataset.theme = dark ? 'dark' : 'light';
})();
