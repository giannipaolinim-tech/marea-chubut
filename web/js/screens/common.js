import { DB, port as getPort, species as getSpecies } from '../data.js';
import { esc, h, ICONS, monthOf } from '../util.js';
import { badge } from '../ui.js';
import { favorites, settings } from '../store.js';
import { openModal } from '../ui.js';
import { windowsFor } from '../tide.js';
import { windFactor, tideFactor, seasonFactor, fishIndex } from '../fishindex.js';

export const REGIONS = {
  norte: 'Golfo San Matías', valdes: 'Península Valdés', 'golfo-nuevo': 'Golfo Nuevo · Puerto Madryn',
  rawson: 'Rawson · Bahía Engaño', sur: 'Costa sur · Camarones', 'golfo-san-jorge': 'Golfo San Jorge · Comodoro',
};

/** Offshore point for Open-Meteo marine variables (documented per spot), else the spot point. */
export function marinePoint(spot) {
  return spot.marinePoint ? { lat: spot.marinePoint.lat, lon: spot.marinePoint.lon } : spotPoint(spot);
}

/**
 * Species in season at a spot for a month: per-spot statements (speciesByMonth) first,
 * then the spot's verified species whose coast-wide season includes the month.
 */
export function speciesInSeason(spot, month) {
  const out = [];
  (spot.speciesByMonth || []).forEach((r) => {
    if (r.months.includes(month) && getSpecies(r.species)) out.push({ sp: getSpecies(r.species), fact: r, scope: 'spot' });
  });
  (spot.species || []).forEach((id) => {
    const sp = getSpecies(id);
    if (!sp || out.find((o) => o.sp.id === id)) return;
    if (sp.season[month - 1]) out.push({ sp, fact: sp.seasonSrc, scope: 'coast' });
  });
  return out;
}

export function baitsHtml(sp, max = 3) {
  if (!sp.baits?.length) return '<span class="nodata">Sin dato verificado de carnada</span>';
  return sp.baits.slice(0, max).map((b) => `<span class="bait">${esc(b.t)} ${badge(b)}</span>`).join(' ');
}

/** Coordinates for weather/astronomy: the spot's reference point, or its tide port. */
export function spotPoint(spot) {
  if (spot.coords) return { lat: spot.coords.lat, lon: spot.coords.lon, approx: false };
  const p = spot.tide?.port ? getPort(spot.tide.port) : null;
  if (p) return { lat: p.latDec ?? p.lat, lon: p.lonDec ?? p.lon, approx: true };
  return { lat: -43.3, lon: -65.05, approx: true };
}

export function spotPicker(currentId, onPick) {
  const favs = favorites.all();
  const spots = DB.spots.spots;
  const row = (s) => `<li><button type="button" class="chip" data-id="${s.id}" style="width:100%;justify-content:space-between;${s.id === currentId ? 'border-color:var(--teal)' : ''}">
      <span>${esc(s.name)}</span><span class="muted" style="font-weight:500;font-size:13px">${esc(s.locality)}</span></button></li>`;
  const groups = Object.entries(REGIONS).map(([k, name]) => {
    const list = spots.filter((s) => s.region === k);
    return list.length ? `<h3 class="eyebrow" style="margin:16px 0 8px">${esc(name)}</h3><ul class="grid" style="list-style:none;padding:0;margin:0;gap:8px">${list.map(row).join('')}</ul>` : '';
  }).join('');
  const favHtml = favs.length ? `<h3 class="eyebrow" style="margin:16px 0 8px">★ Favoritos</h3><ul class="grid" style="list-style:none;padding:0;margin:0;gap:8px">${favs.map((id) => spots.find((s) => s.id === id)).filter(Boolean).map(row).join('')}</ul>` : '';
  const { node, close } = openModal(`<h2>Elegí un spot</h2>
    <label class="field"><span class="sr">Buscar</span><input type="search" placeholder="Buscar spot o localidad…" autocomplete="off"></label>
    <div class="picker-list">${favHtml}${groups}</div>`, { label: 'Elegir spot' });
  const input = node.querySelector('input');
  input.addEventListener('input', () => {
    const q = input.value.trim().toLowerCase();
    node.querySelectorAll('.picker-list li').forEach((li) => {
      li.hidden = q && !li.textContent.toLowerCase().includes(q);
    });
  });
  node.addEventListener('click', (e) => {
    const b = e.target.closest('button[data-id]');
    if (!b) return;
    close();
    onPick(b.dataset.id);
  });
}

/** Index for a spot at a given instant, using whatever factors are available. */
export function computeIndex({ tide, sun, wind, at }) {
  const s = settings.get();
  const sp = s.targetSpecies ? getSpecies(s.targetSpecies) : null;
  const V = wind ? windFactor(wind.wind_speed_10m, wind.wind_gusts_10m) : null;
  const wins = s.window && tide ? windowsFor(tide.events, tide.start, tide.end, s.window) : null;
  const T = tide && tide.covered && s.window ? tideFactor(wins, sun?.sunrise, sun?.sunset) : null;
  const E = seasonFactor(sp, monthOf(at));
  return { ...fishIndex({ V, T, E }), V, T, E, species: sp };
}

export function favButton(id) {
  const on = favorites.has(id);
  return `<button type="button" class="icon-btn fav" data-fav="${id}" aria-pressed="${on}" aria-label="${on ? 'Quitar de favoritos' : 'Agregar a favoritos'}">${ICONS.star}</button>`;
}

document.addEventListener('click', (e) => {
  const b = e.target.closest('[data-fav]');
  if (!b) return;
  const on = favorites.toggle(b.dataset.fav);
  b.setAttribute('aria-pressed', on);
  b.setAttribute('aria-label', on ? 'Quitar de favoritos' : 'Agregar a favoritos');
});

export const backLink = (href, label) => h(`<a class="btn btn--ghost btn--sm" href="${href}">${ICONS.back}${esc(label)}</a>`);
