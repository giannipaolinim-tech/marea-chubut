import { loadData } from './data.js';
import { $, $$, h } from './util.js';
import { settings } from './store.js';
import { warnInAppBrowser } from './install.js';
import { renderTide } from './screens/tide.js';
import { renderMap } from './screens/map.js';
import { renderSpot } from './screens/spot.js';
import { renderSpeciesList, renderSpecies } from './screens/species.js';
import { renderCalendar } from './screens/calendar.js';
import { renderMore, renderLog, renderRegs, renderSafety, renderSources, renderSettings, renderGuide } from './screens/more.js';

const routes = [
  [/^\/?$|^\/marea$/, () => renderTide(), 'marea'],
  [/^\/marea\/([\w-]+)$/, (m) => renderTide(m[1]), 'marea'],
  [/^\/marea\/([\w-]+)\/(\d{4}-\d{2}-\d{2})$/, (m) => renderTide(m[1], m[2]), 'marea'],
  [/^\/mapa$/, () => renderMap(), 'mapa'],
  [/^\/mapa\/([\w-]+)$/, (m) => renderMap(m[1]), 'mapa'],
  [/^\/spot\/([\w-]+)$/, (m) => renderSpot(m[1]), 'mapa'],
  [/^\/especies$/, () => renderSpeciesList(), 'especies'],
  [/^\/especie\/([\w-]+)$/, (m) => renderSpecies(m[1]), 'especies'],
  [/^\/calendario$/, () => renderCalendar(), 'calendario'],
  [/^\/mas$/, () => renderMore(), 'mas'],
  [/^\/bitacora$/, () => renderLog(), 'mas'],
  [/^\/normativa$/, () => renderRegs(), 'mas'],
  [/^\/seguridad$/, () => renderSafety(), 'mas'],
  [/^\/fuentes$/, () => renderSources(), 'mas'],
  [/^\/ajustes$/, () => renderSettings(), 'mas'],
  [/^\/guia$/, () => renderGuide(), 'mas'],
];

let cleanup = null;

async function route() {
  const path = location.hash.replace(/^#/, '') || '/marea';
  const main = $('#main');
  for (const [re, fn, tab] of routes) {
    const m = path.match(re);
    if (!m) continue;
    $$('.nav__item').forEach((a) => {
      if (a.dataset.tab === tab) a.setAttribute('aria-current', 'page');
      else a.removeAttribute('aria-current');
    });
    if (typeof cleanup === 'function') cleanup();
    cleanup = null;
    $('#sheet-root').innerHTML = '';
    main.innerHTML = '';
    window.scrollTo(0, 0);
    cleanup = await fn(m);
    main.focus({ preventScroll: true });
    return;
  }
  location.hash = '#/marea';
}

async function boot() {
  const s = settings.get();
  document.documentElement.dataset.theme = s.theme;
  if (s.reduceMotion) document.documentElement.dataset.motion = 'reduce';
  try {
    await loadData();
  } catch (e) {
    $('#main').append(h(`<div class="wrap section"><h1>No se pudieron cargar los datos</h1>
      <p class="muted">Abrí la app desde un servidor web (por ejemplo <code>python -m http.server</code> en la carpeta <code>web</code>) o desde su dirección publicada. Abriendo el archivo directamente el navegador bloquea la lectura de los datos.</p>
      <p class="muted">${e.message}</p></div>`));
    return;
  }
  window.addEventListener('hashchange', route);
  route();
  warnInAppBrowser();
  // Offline cache. Skipped on localhost during development unless ?sw is in the URL.
  const dev = ['localhost', '127.0.0.1'].includes(location.hostname) && !location.search.includes('sw');
  if ('serviceWorker' in navigator && location.protocol !== 'file:' && !dev) {
    let userAskedReload = false;
    navigator.serviceWorker.register('sw.js').then((reg) => {
      // M-15: tell the user when a new version is ready instead of swapping silently.
      const offer = (worker) => {
        if (!navigator.serviceWorker.controller) return; // first install: nothing to replace
        const bar = h(`<div class="update-bar" role="status"><span>Nueva versión disponible</span><button type="button" class="btn btn--sm btn--primary">Recargar</button></div>`);
        bar.querySelector('button').onclick = () => { userAskedReload = true; worker.postMessage('skipWaiting'); };
        document.body.append(bar);
      };
      if (reg.waiting) offer(reg.waiting);
      reg.addEventListener('updatefound', () => {
        const w = reg.installing;
        w?.addEventListener('statechange', () => { if (w.state === 'installed') offer(w); });
      });
      // Reload only when the user accepted the update (first install takes control silently).
      navigator.serviceWorker.addEventListener('controllerchange', () => { if (userAskedReload) location.reload(); });
    }).catch(() => {});
  }
}

boot();
