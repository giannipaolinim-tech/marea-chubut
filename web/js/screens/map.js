import { DB, spot as getSpot } from '../data.js';
import { $, h, esc, ICONS, dayKey, dayStart, now, fmtTime, fmtM, fmtDate, observeReveal, MIN, HOUR } from '../util.js';
import { appState, favorites } from '../store.js';
import { dayTide, stateAt, hasOfficial } from '../tide.js';
import { sunDay } from '../astro.js';
import { multiWind } from '../weather.js';
import { indexColor } from '../fishindex.js';
import { badge, fact, trapFocus } from '../ui.js';
import { spotBody } from './spot.js';
import { computeIndex, spotPoint, favButton, REGIONS } from './common.js';

let coastCache = null;
const ZONE_LABEL = { restringida: 'Zona restringida', revision: 'Zona en revisión normativa', regulada: 'Área protegida: pesca de costa con condiciones' };
const zoneClass = (st) => (st === 'restringida' ? 'mk--zone' : st === 'regulada' ? 'mk--regulated' : 'mk--review');
let osmCache = null;
let leafletReady = null;

/** Load Leaflet only when the map is opened (L-07). */
function loadLeaflet() {
  if (window.L) return Promise.resolve();
  if (!leafletReady) {
    leafletReady = new Promise((resolve, reject) => {
      const css = document.createElement('link');
      css.rel = 'stylesheet'; css.href = 'vendor/leaflet/leaflet.css';
      document.head.append(css);
      const s = document.createElement('script');
      s.src = 'vendor/leaflet/leaflet.js';
      s.onload = () => resolve();
      s.onerror = () => { leafletReady = null; reject(new Error('No se pudo cargar el mapa')); };
      document.head.append(s);
    });
  }
  return leafletReady;
}

export async function renderMap(focusId) {
  const main = $('#main');
  const st = appState.get();
  let key = st.date || dayKey(now());
  let minutes = key === dayKey(now()) ? Math.round((now() - dayStart(key)) / MIN) : (st.minutes ?? 12 * 60);
  let onlyFavs = false;

  const view = h(`<div class="map-screen">
    <div id="map" aria-label="Mapa de la costa de Chubut. La lista de spots está en el panel."></div>
    <div class="map-top">
      <div class="map-search"><label class="sr" for="mapq">Buscar spot</label><input id="mapq" type="search" placeholder="Buscar spot o localidad…" autocomplete="off" aria-controls="map-results"></div>
      <div class="map-when"><label class="sr" for="map-date">Fecha</label><input type="date" id="map-date"><label class="sr" for="map-time">Hora</label><input type="time" id="map-time" step="1800">
        <button type="button" class="chip map-favs" aria-pressed="false">★ Favoritos</button>
        <button type="button" class="chip map-list-btn">Lista</button></div>
    </div>
    <details class="map-legend">
      <summary>Referencias</summary>
      <p class="legend-time"></p>
      <div><span class="mk-dot" style="--mk:var(--ok)"></span>Índice alto</div>
      <div><span class="mk-dot" style="--mk:var(--signal)"></span>Índice bajo</div>
      <div><span class="mk-dot" style="--mk:var(--mist)"></span>Índice incompleto</div>
      <div><span class="mk-zone-dot"></span>Zona restringida</div>
      <div><span class="mk-review-dot"></span>En revisión normativa</div>
      <div><span class="mk-regulated-dot"></span>Área protegida con pesca de costa regulada</div>
      <div class="muted">Puntos de acceso de referencia. Línea de costa de OpenStreetMap.</div>
    </details>
    <aside class="side-panel" aria-label="Spots y detalle"><div class="wrap panel-body"></div></aside>
  </div>`);
  main.append(view);
  const sheet = h(`<section class="sheet" hidden aria-label="Detalle" role="dialog" aria-modal="false">
    <div class="sheet__bar"><div class="sheet__grip" aria-hidden="true"></div><button type="button" class="icon-btn sheet__close" aria-label="Cerrar panel">${ICONS.close}</button></div>
    <div class="sheet__body"></div></section>`);
  $('#sheet-root').append(sheet);
  const desktop = () => window.matchMedia('(min-width: 1024px)').matches;

  try {
    await loadLeaflet();
  } catch (e) {
    view.querySelector('#map').innerHTML = `<div class="wrap section"><p class="nodata">${esc(e.message)}. Probá recargar.</p></div>`;
    return;
  }

  const map = L.map(view.querySelector('#map'), { zoomControl: false, attributionControl: true, minZoom: 5, maxZoom: 15, zoomSnap: 0.25, keyboard: true });
  L.control.zoom({ position: 'bottomright', zoomInTitle: 'Acercar', zoomOutTitle: 'Alejar' }).addTo(map);
  map.attributionControl.setPrefix(false);
  map.attributionControl.addAttribution('Costa: © colaboradores de OpenStreetMap (ODbL), Natural Earth · Mareas: SHN');
  view.querySelectorAll('.leaflet-control-zoom a').forEach((a) => a.setAttribute('aria-label', a.title));

  try {
    [coastCache, osmCache] = await Promise.all([
      coastCache || fetch('geo/coast.json').then((r) => r.json()),
      osmCache || fetch('geo/coastline.json').then((r) => (r.ok ? r.json() : null)).catch(() => null),
    ]);
  } catch { /* the map still works without the land layer */ }
  const css = getComputedStyle(document.documentElement);
  const v = (n) => css.getPropertyValue(n).trim();
  if (coastCache) L.polygon(coastCache.land.map((ring) => [ring]), { stroke: false, fillColor: v('--land'), fillOpacity: 1, interactive: false }).addTo(map);
  if (osmCache) L.polyline(osmCache.lines, { color: v('--land-line'), weight: 1.4, interactive: false }).addTo(map);
  coastCache?.borders.forEach((line) => L.polyline(line, { color: v('--land-line'), weight: 1, dashArray: '4 6', opacity: 0.8, interactive: false }).addTo(map));
  [['RÍO NEGRO', -41.25, -66.6], ['CHUBUT', -43.9, -67.6], ['SANTA CRUZ', -46.9, -68.6], ['Golfo Nuevo', -42.75, -64.6], ['Golfo San Jorge', -45.95, -66.7], ['Océano Atlántico', -44.2, -63.4]].forEach(([t, la, lo]) => {
    L.marker([la, lo], { interactive: false, keyboard: false, icon: L.divIcon({ className: '', html: `<span class="map-label">${t}</span>`, iconSize: [0, 0] }) }).addTo(map);
  });

  // Zones: official polygons where a legal text defines them (M-10); otherwise a point.
  DB.zones.zones.forEach((z) => {
    if (z.polygon?.vertices?.length > 1) {
      const col = z.status === 'regulada' ? v('--teal') : v('--signal');
      const shape = z.polygon.closed === false
        ? L.polyline(z.polygon.vertices, { color: col, weight: 2, dashArray: '6 6' })
        : L.polygon(z.polygon.vertices, { color: col, weight: 1.5, dashArray: z.status === 'restringida' ? null : '6 6', fillColor: col, fillOpacity: 0.1 });
      shape.addTo(map).on('click', () => showZone(z));
    }
    if (!z.coords) return;
    const m = L.marker([z.coords.lat, z.coords.lon], {
      icon: L.divIcon({ className: 'mk-hit', html: `<span class="mk ${zoneClass(z.status)}"></span>`, iconSize: [44, 44], iconAnchor: [22, 22] }),
      title: `${z.name}: ${ZONE_LABEL[z.status].toLowerCase()}`, alt: z.name, keyboard: true,
    }).addTo(map);
    m.on('click', () => showZone(z));
  });

  const markers = {};
  const withCoords = DB.spots.spots.filter((s) => s.coords);
  withCoords.forEach((s) => {
    const m = L.marker([s.coords.lat, s.coords.lon], {
      icon: L.divIcon({ className: 'mk-hit', html: `<span class="mk" data-id="${s.id}"></span>`, iconSize: [44, 44], iconAnchor: [22, 22] }),
      keyboard: true, title: s.name, alt: s.name,
    }).addTo(map);
    m.bindTooltip(s.name, { className: 'mk-label', direction: 'right', offset: [14, 0] });
    m.on('click', () => select(s.id));
    markers[s.id] = m;
  });
  map.fitBounds(L.latLngBounds(withCoords.map((s) => [s.coords.lat, s.coords.lon])), { padding: [40, 40] });
  if (desktop()) view.querySelector('.map-legend').open = true;

  // ---- Panel / sheet with focus management (M-14) ----
  let releaseTrap = () => {};
  let lastTrigger = null;
  function setPanel(html, { focus = true } = {}) {
    const target = desktop() ? view.querySelector('.panel-body') : sheet.querySelector('.sheet__body');
    target.innerHTML = html;
    if (!desktop()) {
      lastTrigger = lastTrigger || document.activeElement;
      sheet.hidden = false; sheet.scrollTop = 0;
      releaseTrap(); releaseTrap = trapFocus(sheet, closeSheet);
      if (focus) sheet.querySelector('.sheet__close').focus();
    } else if (focus) {
      target.querySelector('h2')?.setAttribute('tabindex', '-1');
      target.querySelector('h2')?.focus();
    }
    observeReveal(target);
    target.querySelector('.back-list')?.addEventListener('click', () => setPanel(listPanel()));
    wireList(target);
  }
  function closeSheet() {
    sheet.hidden = true; releaseTrap(); releaseTrap = () => {};
    if (lastTrigger && document.contains(lastTrigger)) lastTrigger.focus();
    lastTrigger = null;
  }
  sheet.querySelector('.sheet__close').onclick = closeSheet;
  sheet.querySelector('.sheet__grip').onclick = closeSheet;
  map.on('click', () => { if (!desktop()) closeSheet(); });

  const back = '<button type="button" class="btn btn--sm btn--ghost back-list">← Volver a la lista</button>';

  async function select(id) {
    const s = getSpot(id);
    appState.set({ spotId: id });
    document.querySelectorAll('.mk.is-selected').forEach((e) => e.classList.remove('is-selected'));
    document.querySelector(`.mk[data-id="${id}"]`)?.classList.add('is-selected');
    if (s.coords) map.flyTo([s.coords.lat, s.coords.lon], Math.max(map.getZoom(), 10), { duration: 1.1 });
    let tideLine = '';
    const at = dayStart(key) + minutes * MIN;
    if (s.tide?.port && hasOfficial(at)) {
      try {
        const t = await dayTide(s.tide.port, key);
        const stt = stateAt(t.events, at);
        tideLine = stt ? `<p class="map-tide"><b>${fmtTime(at)}: ${esc(stt.label)}</b> · ${stt.next.type === 'H' ? '▲ pleamar' : '▼ bajamar'} ${fmtTime(stt.next.t)} (${fmtM(stt.next.h)} m)</p>` : '<p class="nodata">Fuera del rango de la tabla oficial cargada</p>';
      } catch { tideLine = '<p class="nodata">No se pudo cargar la tabla de marea</p>'; }
    }
    setPanel(`${back}<div class="row"><p class="eyebrow" style="margin:0">${esc(REGIONS[s.region] || '')}</p><span class="spacer"></span>${favButton(s.id)}</div>
      <h2 class="panel-title">${esc(s.name)}</h2>
      <div class="row">${s.modality.map((m) => `<span class="tag">${esc(m)}</span>`).join('')}</div>
      ${tideLine}
      <div class="row" style="margin:10px 0 4px"><a class="btn btn--primary btn--sm" href="#/spot/${s.id}">Ver ficha</a><a class="btn btn--sm" href="#/marea/${s.id}/${key}">Ver marea</a></div>
      ${spotBody(s, { compact: true })}`);
  }

  function showZone(z) {
    setPanel(`${back}<p class="eyebrow" style="margin:0;color:${z.status === 'regulada' ? 'var(--teal)' : 'var(--signal)'}">${ZONE_LABEL[z.status]}</p>
      <h2 class="panel-title">${esc(z.name)}</h2>
      <div class="card">${fact(z.reason)}
        ${(z.extra || []).map((f) => fact(f)).join('')}
        <div class="fact"><div class="fact__k">Límites</div><p>${z.polygon ? `Dibujados según el texto legal. ${esc(z.polygon.note || '')}` : 'Límites oficiales no publicados: el punto marca solo una referencia.'}</p>${z.polygon ? badge({ c: 'oficial', s: z.polygon.s }) : ''}</div></div>
      ${z.status === 'revision' ? `<div class="card" style="margin-top:12px"><b>${esc(DB.zones.reviewExplainer.title)}</b><p>${esc(DB.zones.reviewExplainer.t)}</p>${badge(DB.zones.reviewExplainer)}</div>` : ''}
      ${z.tidePort ? `<p class="muted small" style="margin-top:12px">Su marea (puerto SHN de referencia) sigue disponible como dato no pesquero en Marea.</p>` : ''}`);
  }

  function listPanel(filter = '') {
    const qn = filter.trim().toLowerCase();
    const favs = favorites.all();
    const spots = DB.spots.spots.filter((s) => (!onlyFavs || favs.includes(s.id)) && (!qn || `${s.name} ${s.locality}`.toLowerCase().includes(qn)));
    const zones = DB.zones.zones.filter((z) => !onlyFavs && (!qn || z.name.toLowerCase().includes(qn)));
    const groups = Object.entries(REGIONS).map(([k, name]) => {
      const list = spots.filter((s) => s.region === k);
      return list.length ? `<h3 class="eyebrow list-group">${esc(name)}</h3><ul class="spot-list">${list.map((s) => `<li><button type="button" class="spot-row" data-spot="${s.id}"><span class="mk-dot" style="--mk:${s.coords ? 'var(--teal)' : 'var(--mist)'}"></span><span><b>${esc(s.name)}</b><small>${esc(s.locality)}${s.coords ? '' : ' · sin ubicación en mapa'}</small></span></button></li>`).join('')}</ul>` : '';
    }).join('');
    return `<h2 class="panel-title" id="map-results">${qn ? `Resultados para «${esc(filter)}»` : onlyFavs ? 'Tus favoritos' : 'Spots de la costa'}</h2>
      ${groups || '<p class="nodata">Ningún spot coincide.</p>'}
      ${zones.length ? `<h3 class="eyebrow list-group">Áreas protegidas y zonas restringidas</h3><ul class="spot-list">${zones.map((z) => `<li><button type="button" class="spot-row" data-zone="${z.id}"><span class="${z.status === 'restringida' ? 'mk-zone-dot' : z.status === 'regulada' ? 'mk-regulated-dot' : 'mk-review-dot'}"></span><span><b>${esc(z.name)}</b><small>${esc(ZONE_LABEL[z.status])}</small></span></button></li>`).join('')}</ul>` : ''}`;
  }

  function wireList(root) {
    root.querySelectorAll('[data-spot]').forEach((b) => { b.onclick = () => { lastTrigger = b; const s = getSpot(b.dataset.spot); if (s.coords) select(s.id); else location.hash = `#/spot/${s.id}`; }; });
    root.querySelectorAll('[data-zone]').forEach((b) => { b.onclick = () => { lastTrigger = b; const z = DB.zones.zones.find((x) => x.id === b.dataset.zone); if (z.coords) map.flyTo([z.coords.lat, z.coords.lon], 10); showZone(z); }; });
  }

  // ---- Search (L-03), list toggle, favourites filter (L-04) ----
  const qInput = view.querySelector('#mapq');
  qInput.addEventListener('input', () => setPanel(listPanel(qInput.value), { focus: false }));
  qInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') { const first = (desktop() ? view.querySelector('.panel-body') : sheet).querySelector('.spot-row'); first?.click(); } });
  view.querySelector('.map-list-btn').onclick = (e) => { lastTrigger = e.currentTarget; setPanel(listPanel(qInput.value)); };
  view.querySelector('.map-favs').onclick = (e) => {
    onlyFavs = !onlyFavs;
    e.currentTarget.setAttribute('aria-pressed', onlyFavs);
    const favs = favorites.all();
    withCoords.forEach((s) => { const el = markers[s.id].getElement(); if (el) el.style.display = !onlyFavs || favs.includes(s.id) ? '' : 'none'; });
    setPanel(listPanel(qInput.value), { focus: false });
  };
  if (desktop()) setPanel(listPanel(), { focus: false });

  // ---- Shared date/time (M-08) ----
  const dIn = view.querySelector('#map-date');
  const tIn = view.querySelector('#map-time');
  const sync = () => {
    dIn.value = key;
    tIn.value = `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`;
    view.querySelector('.legend-time').textContent = `Índice para el ${fmtDate(dayStart(key))} a las ${tIn.value} h`;
    appState.set({ date: key, minutes });
  };
  dIn.onchange = () => { if (dIn.value) { key = dIn.value; sync(); colour(); } };
  tIn.onchange = () => { const [hh, mm] = tIn.value.split(':').map(Number); if (!Number.isNaN(hh)) { minutes = hh * 60 + (mm || 0); sync(); colour(); } };
  sync();

  if (focusId && getSpot(focusId)?.coords) setTimeout(() => select(focusId), 300);

  let colourToken = 0;
  async function colour() {
    const my = ++colourToken;
    const at = dayStart(key) + minutes * MIN;
    const winds = await multiWind(withCoords.map((s) => s.coords), at);
    for (const [i, s] of withCoords.entries()) {
      if (my !== colourToken) return;
      let tide = null;
      if (s.tide?.port && hasOfficial(at)) {
        try { tide = await dayTide(s.tide.port, key); } catch { tide = null; }
      }
      const pt = spotPoint(s);
      const r = computeIndex({ tide, sun: sunDay(key, pt.lat, pt.lon), wind: winds ? winds[i] : null, at });
      const el = document.querySelector(`.mk[data-id="${s.id}"]`);
      if (!el) continue;
      el.style.setProperty('--mk', indexColor(r.score));
      el.classList.toggle('mk--hi', (r.score ?? 0) >= 70);
      markers[s.id].setTooltipContent(`${s.name} · ${r.incomplete ? 'índice incompleto' : `índice ${r.score}`}`);
    }
  }
  colour();

  const onKey = (e) => { if (e.key === 'Escape' && !sheet.hidden) closeSheet(); };
  document.addEventListener('keydown', onKey);
  return () => { colourToken++; releaseTrap(); document.removeEventListener('keydown', onKey); map.remove(); };
}

export { HOUR };
