export function showToast(message: string, opts: { durationMs?: number } = {}) {
  if (typeof document === 'undefined') return;
  const duration = opts.durationMs ?? 3000;
  const el = document.createElement('div');
  el.textContent = message;
  el.style.position = 'fixed';
  el.style.bottom = '20px';
  el.style.left = '50%';
  el.style.transform = 'translateX(-50%)';
  el.style.background = 'rgba(17, 24, 39, 0.95)';
  el.style.color = 'white';
  el.style.padding = '10px 14px';
  el.style.borderRadius = '8px';
  el.style.fontSize = '12px';
  el.style.zIndex = '9999';
  el.style.boxShadow = '0 4px 10px rgba(0,0,0,0.2)';
  el.style.opacity = '0';
  el.style.transition = 'opacity 200ms ease';
  document.body.appendChild(el);
  requestAnimationFrame(() => { el.style.opacity = '1'; });
  setTimeout(() => {
    el.style.opacity = '0';
    setTimeout(() => {
      if (el.parentElement) el.parentElement.removeChild(el);
    }, 250);
  }, duration);
}

