// "Mañana y próximos días": where, when and with what bait, at a glance (H-07).
import { DB, spot as getSpot } from '../data.js';
import { esc, dayKey, dayStart, fmtTime, fmtM, now, parts, DAY, HOUR, fmtDate, ICONS, toast } from '../util.js';
import { favorites, settings } from '../store.js';
import { dayTide, windowsFor, hasOfficial, distanceKm } from '../tide.js';
import { sunDay } from '../astro.js';
import { multiWindSeries, dirName, windText, windVsCoast } from '../weather.js';
import { badge } from '../ui.js';
import { spotPoint, speciesInSeason, baitsHtml } from './common.js';

const DEFAULT_SPOTS = ['playa-union', 'playa-parana', 'rada-tilly'];
let nearbyIds = null; // set by "Cerca mío" for this session

export function renderPlanner(container, onOpen) {
  let offset = 1;
  container.innerHTML = `<div class="planner">
    <div class="planner__head">
      <div><span class="eyebrow">Planificador</span><h2 class="planner__title">¿Dónde, cuándo y con qué?</h2></div>
      <div class="seg" role="group" aria-label="Día">
        <button type="button" data-off="1" aria-pressed="true">Mañana</button>
        <button type="button" data-off="2" aria-pressed="false">Pasado</button>
        <button type="button" data-off="3" aria-pressed="false">En 3 días</button>
      </div>
    </div>
    <p class="muted planner__src"></p>
    <div class="planner__cards" aria-live="polite"></div>
  </div>`;
  const cards = container.querySelector('.planner__cards');
  const srcLine = container.querySelector('.planner__src');

  container.querySelector('.seg').addEventListener('click', (e) => {
    const b = e.target.closest('button[data-off]');
    if (!b) return;
    container.querySelectorAll('.seg button').forEach((x) => x.setAttribute('aria-pressed', x === b));
    offset = Number(b.dataset.off);
    draw();
  });

  function pickSpots() {
    const favs = favorites.all().filter((id) => getSpot(id));
    if (favs.length) return { ids: favs.slice(0, 4), why: 'Tus spots favoritos.' };
    if (nearbyIds) return { ids: nearbyIds.map((n) => n.id), why: 'Los spots más cercanos a tu ubicación (distancia en línea recta).' };
    return { ids: DEFAULT_SPOTS, why: 'Spots de ejemplo: marcá favoritos con ★ o usá «Cerca mío».' };
  }

  async function draw() {
    const { ids, why } = pickSpots();
    const key = dayKey(now() + offset * DAY);
    srcLine.innerHTML = `${esc(fmtDate(dayStart(key)))} · ${esc(why)} <button type="button" class="btn btn--sm btn--ghost near">${ICONS.pin}Cerca mío</button>`;
    srcLine.querySelector('.near').onclick = locate;
    const spots = ids.map((id) => getSpot(id));
    cards.innerHTML = spots.map((s) => `<article class="pcard" data-id="${s.id}"><h3>${esc(s.name)}</h3><p class="muted">Cargando…</p></article>`).join('');
    const winds = await multiWindSeries(spots.map((s) => spotPoint(s)));
    const month = parts(dayStart(key)).m;
    const userWin = settings.get().window;
    for (const [i, s] of spots.entries()) {
      const pt = spotPoint(s);
      const sun = sunDay(key, pt.lat, pt.lon);
      let tideHtml = '';
      if (!s.tide?.port) tideHtml = '<p class="nodata">Sin marea oficial para este punto</p>';
      else if (!hasOfficial(dayStart(key))) tideHtml = '<p class="nodata">Fuera del rango de la tabla oficial cargada</p>';
      else {
        try {
          const t = await dayTide(s.tide.port, key);
          const lit = t.inDay.filter((e) => sun.sunrise && e.t >= sun.sunrise && e.t <= sun.sunset);
          const wins = userWin ? windowsFor(t.events, t.start, t.end, userWin).map((w) => ({ from: Math.max(w.from, sun.sunrise), to: Math.min(w.to, sun.sunset) })).filter((w) => w.to > w.from) : null;
          tideHtml = `<p class="pcard__tide">${lit.length ? lit.map((e) => `<span>${e.type === 'H' ? '▲' : '▼'} <b>${fmtTime(e.t)}</b> ${fmtM(e.h)} m</span>`).join('') : '<span class="muted">Sin pleamar ni bajamar con luz</span>'}</p>
            ${wins ? `<p class="pcard__win">${wins.length ? `Tu ventana con luz: ${wins.map((w) => `<b>${fmtTime(w.from)}–${fmtTime(w.to)}</b>`).join(', ')}` : 'Tu ventana cae de noche'}</p>` : ''}
            ${badge({ c: 'oficial', s: ['shn-tablas'] })}`;
        } catch {
          tideHtml = '<p class="nodata">No se pudo cargar la tabla de marea</p>';
        }
      }
      let windHtml = '<p class="nodata">Sin pronóstico de viento</p>';
      const series = winds?.[i]?.filter((r) => sun.sunrise && r.t >= sun.sunrise && r.t <= sun.sunset) || [];
      if (series.length) {
        const mean = series.reduce((a, r) => a + (r.wind_speed_10m || 0), 0) / series.length;
        const gust = Math.max(...series.map((r) => r.wind_gusts_10m || 0));
        const vx = series.reduce((a, r) => a + Math.sin((r.wind_direction_10m || 0) * Math.PI / 180), 0);
        const vy = series.reduce((a, r) => a + Math.cos((r.wind_direction_10m || 0) * Math.PI / 180), 0);
        const dir = (Math.atan2(vx, vy) * 180 / Math.PI + 360) % 360;
        const rel = windVsCoast(dir, s.orientation?.seaward);
        const unit = settings.get().windUnit;
        windHtml = `<p class="pcard__wind">Con luz: ${windText(mean, unit)} del ${dirName(dir)}, ráfagas hasta ${windText(gust, unit)}${rel ? ` · <b>${rel.label}</b>` : ''} <span class="badge badge--modelo">Modelo</span></p>`;
      }
      const inSeason = speciesInSeason(s, month);
      const spHtml = inSeason.length
        ? inSeason.map(({ sp, fact, scope }) => `<li><a href="#/especie/${sp.id}"><b>${esc(sp.name)}</b></a> <span class="muted small">${scope === 'spot' ? 'en este spot' : 'temporada en la costa'}</span> ${badge(fact)}<div class="baits">${baitsHtml(sp)}</div></li>`).join('')
        : '<li class="nodata">Sin especies con temporada verificada para este mes</li>';
      const alerts = [
        ...(s.dangers || []).filter((d) => d.lifeRisk).map((d) => `<li class="pcard__alert pcard__alert--danger">${esc(d.t.split('.')[0])}.</li>`),
        ...(s.facts || []).filter((f) => f.alert && (!f.months || f.months.includes(month))).map((f) => `<li class="pcard__alert">${esc(f.t)}</li>`),
        ...(s.cutoff ? [`<li class="pcard__alert pcard__alert--danger">${esc(s.cutoff.t)}</li>`] : []),
      ];
      const near = nearbyIds?.find((n) => n.id === s.id);
      const el = cards.querySelector(`[data-id="${s.id}"]`);
      if (!el) continue;
      el.innerHTML = `<h3>${esc(s.name)}</h3><p class="muted small">${esc(s.locality)}${near ? ` · ${near.km.toFixed(0)} km` : ''}</p>
        <div class="pcard__sec"><span class="eyebrow">Cuándo</span>${tideHtml}</div>
        <div class="pcard__sec"><span class="eyebrow">Viento</span>${windHtml}</div>
        <div class="pcard__sec"><span class="eyebrow">Qué y con qué</span><ul class="pcard__sp">${spHtml}</ul></div>
        ${alerts.length ? `<ul class="pcard__alerts">${alerts.join('')}</ul>` : ''}
        <button type="button" class="btn btn--sm btn--primary open">Ver el día completo</button>`;
      el.querySelector('.open').onclick = () => onOpen(s.id, key);
    }
  }

  function locate() {
    if (!navigator.geolocation) { toast('Tu dispositivo no permite obtener la ubicación'); return; }
    navigator.geolocation.getCurrentPosition((pos) => {
      const me = { lat: pos.coords.latitude, lon: pos.coords.longitude };
      nearbyIds = DB.spots.spots.filter((s) => s.coords).map((s) => ({ id: s.id, km: distanceKm(me, s.coords) })).sort((a, b) => a.km - b.km).slice(0, 3);
      if (favorites.all().length) toast('Mostrando tus favoritos; quitá favoritos para ver los cercanos');
      draw();
    }, () => toast('No se pudo obtener tu ubicación'), { enableHighAccuracy: false, timeout: 15000, maximumAge: 600000 });
  }

  draw();
}

/** Licence reminder with the official DINO link and a locally stored expiry date. */
export function licenseCard() {
  const L = DB.regulations.license;
  const cat = L.categories[0];
  const until = settings.get().licenseUntil;
  const today = dayKey(now());
  const daysLeft = until ? Math.round((dayStart(until) - dayStart(today)) / DAY) : null;
  const state = !until ? 'Cargá la fecha de vencimiento de tu permiso para que te avisemos.'
    : daysLeft < 0 ? `Tu permiso venció el ${until.split('-').reverse().join('/')}.`
      : daysLeft <= 15 ? `Tu permiso vence en ${daysLeft} días.` : `Permiso vigente hasta el ${until.split('-').reverse().join('/')}.`;
  return `<section class="card license ${!until || daysLeft <= 15 ? 'license--warn' : ''}">
    <div class="row"><h2 class="card-title">Tu permiso de pesca</h2><span class="spacer"></span>${badge(L.categoriesSrc)}</div>
    <p>${esc(cat.name)}: <b>${esc(cat.price)}</b> <span class="muted small">(${esc(L.categoriesSrc.note.split('.')[0])}).</span> ${esc(state)}</p>
    <div class="row"><label class="field" style="flex:1;min-width:180px">Vence el<input type="date" class="lic-date" value="${until || ''}"></label>
      <a class="btn btn--primary" href="${esc(L.how.url)}" target="_blank" rel="noopener">Sacarlo con DINO</a></div>
  </section>`;
}

document.addEventListener('change', (e) => {
  if (!e.target.matches('.lic-date')) return;
  settings.set({ licenseUntil: e.target.value || null });
  const card = e.target.closest('.license');
  if (card) card.outerHTML = licenseCard();
  toast('Fecha de vencimiento guardada en este dispositivo');
});

export { HOUR };
