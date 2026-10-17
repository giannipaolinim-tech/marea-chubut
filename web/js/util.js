// Time is handled in Argentina time (UTC-3, no DST) regardless of the device time zone.
export const ART_OFFSET_MS = 3 * 3600e3;
export const MIN = 60e3;
export const HOUR = 3600e3;
export const DAY = 86400e3;

const WEEKDAYS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
const MONTHS = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
export const MONTH_SHORT = ['E', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'];
export const MONTH_ABBR = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

/** "2026-10-01T05:16" in UTC-3 -> epoch ms */
export function parseLocal(s) {
  const [d, t = '00:00'] = s.split('T');
  const [y, m, day] = d.split('-').map(Number);
  const [h, mi] = t.split(':').map(Number);
  return Date.UTC(y, m - 1, day, h, mi) + ART_OFFSET_MS;
}

export function parts(ms) {
  const d = new Date(ms - ART_OFFSET_MS);
  return { y: d.getUTCFullYear(), m: d.getUTCMonth() + 1, d: d.getUTCDate(), h: d.getUTCHours(), mi: d.getUTCMinutes(), dow: d.getUTCDay() };
}

const pad = (n) => String(n).padStart(2, '0');
export const dayKey = (ms) => { const p = parts(ms); return `${p.y}-${pad(p.m)}-${pad(p.d)}`; };
export const dayStart = (key) => parseLocal(`${key}T00:00`);
export const fmtTime = (ms) => { const p = parts(ms); return `${pad(p.h)}:${pad(p.mi)}`; };
export function fmtDate(ms, { weekday = true, year = false } = {}) {
  const p = parts(ms);
  return `${weekday ? WEEKDAYS[p.dow] + ' ' : ''}${p.d} de ${MONTHS[p.m - 1]}${year ? ' de ' + p.y : ''}`;
}
export const fmtDateShort = (ms) => { const p = parts(ms); return `${p.d}/${pad(p.m)}/${p.y}`; };
export const monthOf = (ms) => parts(ms).m;
export const fmtM = (h, dec = 2) => (h == null || Number.isNaN(h) ? '—' : h.toFixed(dec).replace('.', ','));
export const fmtNum = (n, dec = 0) => (n == null || Number.isNaN(n) ? '—' : n.toFixed(dec).replace('.', ','));
export const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
export const now = () => Date.now();
/** Current month (1–12) in Argentina time. */
export const currentMonth = () => parts(Date.now()).m;

export function fmtDuration(ms) {
  const m = Math.round(Math.abs(ms) / MIN);
  const h = Math.floor(m / 60);
  return h ? `${h} h ${pad(m % 60)} min` : `${m} min`;
}

export function esc(s) {
  return String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

export function html(strings, ...vals) {
  return strings.reduce((acc, s, i) => acc + s + (i < vals.length ? (vals[i] ?? '') : ''), '');
}

export function h(markup) {
  const t = document.createElement('template');
  t.innerHTML = markup.trim();
  return t.content.firstElementChild;
}

export const $ = (sel, root = document) => root.querySelector(sel);
export const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

export const prefersReducedMotion = () =>
  document.documentElement.dataset.motion === 'reduce' || window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export function toast(msg) {
  const t = $('#toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toast._t);
  toast._t = setTimeout(() => t.classList.remove('show'), 2600);
}

export function observeReveal(root) {
  const items = $$('.reveal', root);
  if (!('IntersectionObserver' in window) || prefersReducedMotion()) {
    items.forEach((el) => el.classList.add('in'));
    return;
  }
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
    });
  }, { rootMargin: '0px 0px -8% 0px' });
  items.forEach((el, i) => { el.style.transitionDelay = `${Math.min(i, 8) * 60}ms`; io.observe(el); });
  // Fail-safe: never leave content hidden if the observer does not fire (hidden tabs, old browsers).
  setTimeout(() => items.forEach((el) => el.classList.add('in')), 1400);
}

export const ICONS = {
  alert: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3 2 21h20L12 3Z"/><path d="M12 10v5m0 3v.01"/></svg>',
  back: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5l-7 7 7 7"/></svg>',
  star: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m12 3 2.8 5.8 6.2.9-4.5 4.4 1 6.2L12 17.4 6.5 20.3l1-6.2L3 9.7l6.2-.9L12 3Z"/></svg>',
  pin: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s-7-6.3-7-12a7 7 0 0 1 14 0c0 5.7-7 12-7 12Z"/><circle cx="12" cy="9" r="2.5"/></svg>',
  close: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg>',
  chevron: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>',
  info: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 11v6m0-9v.01"/></svg>',
  share: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12v7a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-7M16 6l-4-4-4 4m4-4v13"/></svg>',
  phone: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2"/></svg>',
  wave: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2 14c3-3 6-3 9 0s6 3 9 0 2-1 2-1"/></svg>',
  plus: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>',
};
