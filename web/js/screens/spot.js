import { spot as getSpot, species as getSpecies, DB } from '../data.js';
import { $, h, esc, dayKey, now, DAY, fmtTime, fmtM, ICONS, observeReveal, MONTH_SHORT, currentMonth } from '../util.js';
import { appState } from '../store.js';
import { dayTide, sampleDay, hasOfficial, tideRefLabel, stateAt, portInfo } from '../tide.js';
import { sunDay } from '../astro.js';
import { renderChart } from '../chart.js';
import { badge, fact, noData, alertBox } from '../ui.js';
import { REGIONS, favButton, spotPoint } from './common.js';

const KEY_LABEL = { uso: 'Uso', temporada: 'Temporada', acceso: 'Acceso', servicios: 'Servicios', senal: 'Señal', legal: 'Normativa', costa: 'Pesca de costa' };

// Fields every spot is expected to have (H-02). Null → "Sin dato verificado".
const FIELDS = [
  ['access', 'Acceso', 'acceso'],
  ['parking', 'Estacionamiento'],
  ['bottom', 'Tipo de fondo'],
  ['bestTide', 'Mejor momento de marea'],
  ['castingDistance', 'Distancia de lance'],
  ['fuel', 'Última carga de combustible'],
];

function fieldBlock(spot, [key, label, factKey]) {
  const f = spot[key] || (factKey ? null : null);
  const legacy = factKey ? spot.facts.filter((x) => x.k === factKey) : [];
  if (f) return fact(f, label);
  if (legacy.length) return legacy.map((x) => fact(x, label)).join('');
  return `<div class="fact"><div class="fact__k">${esc(label)}</div><p>${noData()}</p></div>`;
}

function monthsTable(spot) {
  const rows = (spot.speciesByMonth || []).filter((r) => getSpecies(r.species));
  if (!rows.length) return `<p>${noData('Sin temporada verificada por mes para este spot')}</p>`;
  const nm = currentMonth();
  return `<div class="heat-wrap"><table class="heat heat--spot"><caption class="sr">Especies por mes en este spot</caption>
    <thead><tr><th></th>${MONTH_SHORT.map((m, i) => `<th scope="col" class="${i + 1 === nm ? 'now' : ''}">${m}</th>`).join('')}<th>Fuente</th></tr></thead>
    <tbody>${rows.map((r) => `<tr><th scope="row"><a href="#/especie/${r.species}">${esc(getSpecies(r.species).name)}</a></th>${MONTH_SHORT.map((_, i) => `<td class="${r.months.includes(i + 1) ? 's' : 'out'} ${i + 1 === nm ? 'now' : ''}"><span class="sr">${r.months.includes(i + 1) ? 'sí' : 'no'}</span></td>`).join('')}<td>${badge(r)}</td></tr>`).join('')}</tbody></table></div>
    ${rows.map((r) => `<p class="muted small">${esc(getSpecies(r.species).name)}: ${esc(r.t)}</p>`).join('')}`;
}

export function spotBody(spot, { compact = false } = {}) {
  const dangers = (spot.dangers || []).map((d) => alertBox(d.lifeRisk ? 'Peligro documentado' : 'Precaución', d.t, { danger: !!d.lifeRisk, badgeHtml: badge(d) })).join('');
  const cutoff = spot.cutoff ? alertBox('Corte por marea', spot.cutoff.t, { danger: true, badgeHtml: badge(spot.cutoff) }) : '';
  const speciesHtml = spot.species.length
    ? `<div class="row" style="gap:8px">${spot.species.filter((id) => getSpecies(id)).map((id) => `<a class="chip" href="#/especie/${id}">${esc(getSpecies(id).name)}</a>`).join('')}</div>
       <div style="margin-top:8px">${badge(spot.speciesSrc)}</div>${spot.speciesSrc?.note ? `<p class="muted small">${esc(spot.speciesSrc.note)}</p>` : ''}`
    : `<p>${noData('Sin especies verificadas para este punto')}</p>`;
  const legal = spot.facts.filter((f) => f.k === 'legal').map((f) => fact(f, KEY_LABEL.legal)).join('');
  const other = ['uso', 'temporada', 'costa', 'servicios', 'senal'].map((k) => spot.facts.filter((f) => f.k === k).map((f) => fact(f, KEY_LABEL[k])).join('')).join('');
  const info = portInfo(spot);
  return `
    ${dangers || cutoff ? `<div class="grid" style="gap:10px">${cutoff}${dangers}</div>` : ''}
    <section class="card reveal" style="margin-top:14px"><h2 class="card-title">Especies</h2><div style="margin-top:8px">${speciesHtml}</div>
      <h3 class="eyebrow" style="margin-top:16px">Por mes en este spot</h3>${monthsTable(spot)}</section>
    <section class="card reveal" style="margin-top:14px"><h2 class="card-title">Cómo es el lugar</h2>
      ${FIELDS.map((f) => fieldBlock(spot, f)).join('')}
      <div class="fact"><div class="fact__k">Orientación de la costa</div>${spot.orientation ? `<p>${esc(spot.orientation.t)}</p><span class="badge badge--unica">calculado a partir de la línea de costa</span> ${badge({ c: 'cientifico', s: spot.orientation.s })}` : `<p>${noData()}</p>`}</div>
    </section>
    <section class="card reveal" style="margin-top:14px"><h2 class="card-title">Normativa y uso</h2>${legal}${spot.legalNote ? `<p class="assumption">${esc(spot.legalNote)}</p>` : ''}${other || ''}</section>
    <section class="card reveal" style="margin-top:14px"><h2 class="card-title">Marea de referencia</h2>
      <p>${esc(tideRefLabel(spot))}</p>${spot.tide?.port ? badge({ c: 'oficial', s: ['shn-tablas'] }) : ''}
      ${info?.uncertain ? `<p class="assumption"><b>Suposición:</b> ${esc(spot.tide.note)}</p>` : ''}</section>
    ${compact ? '' : `<section class="card reveal" style="margin-top:14px"><h2 class="card-title">Ubicación</h2>
      ${spot.coords
        ? `<p style="margin:6px 0">${spot.coords.lat.toFixed(5)}, ${spot.coords.lon.toFixed(5)}</p><p class="muted small">${esc(spot.coords.kind)}</p>${badge({ c: spot.coords.c || 'cientifico', s: spot.coords.s })}`
        : `<p>${noData('Sin coordenadas en ninguna fuente')}</p><p class="muted small">${esc(spot.coordsNote || 'Ninguna fuente oficial ni ningún objeto de OpenStreetMap identifica con certeza el punto de acceso, así que el spot no aparece en el mapa.')}</p>`}
      ${spot.marinePoint ? `<p class="muted small">Oleaje y temperatura del mar: ${esc(spot.marinePoint.t)}</p>` : ''}</section>`}`;
}

export async function renderSpot(id) {
  const spot = getSpot(id);
  const main = $('#main');
  if (!spot) { main.innerHTML = '<div class="wrap section"><h1>Spot no encontrado</h1><p><a href="#/mapa">Volver al mapa</a></p></div>'; return; }
  const key = dayKey(now());
  const L = DB.regulations.license;
  const shore = L.categories[0];
  const view = h(`<div class="wrap">
    <div class="spot-head">
      <a class="btn btn--ghost btn--sm" href="#/mapa/${spot.id}">${ICONS.back}Mapa</a>
      <p class="eyebrow" style="margin-top:16px">${esc(REGIONS[spot.region] || '')} · ${esc(spot.locality)}</p>
      <h1>${esc(spot.name)}</h1>
      <div class="row">${spot.modality.map((m) => `<span class="tag">${esc(m)}</span>`).join('')}<span class="spacer"></span>${favButton(spot.id)}</div>
    </div>
    <section class="card reveal mini">
      <div class="row"><h2 class="card-title">Marea hoy</h2><span class="spacer"></span><a class="btn btn--sm btn--primary" href="#/marea/${spot.id}/${key}">Ver marea</a></div>
      <div class="mini-body"></div>
    </section>
    <div class="body">${spotBody(spot)}</div>
    <section class="card reveal" style="margin:14px 0 30px"><h2 class="card-title">Permiso</h2>
      <p style="margin:6px 0">Para pescar en el mar necesitás licencia: ${esc(shore.name.toLowerCase())}, <b>${esc(shore.price)}</b> (${esc(L.categoriesSrc.note.split('.')[0].toLowerCase())}). No hay tallas ni cupos publicados: consultá la normativa vigente.</p>
      ${badge(L.categoriesSrc)} <a class="btn btn--sm" href="#/normativa">Ver normativa</a></section>
  </div>`);
  main.append(view);
  appState.set({ spotId: spot.id });
  observeReveal(view);

  const mini = view.querySelector('.mini-body');
  if (!spot.tide?.port) { mini.innerHTML = `<p class="muted">${esc(spot.tide?.note || '')}</p>`; return; }
  if (!hasOfficial(now())) { mini.innerHTML = `<p>${noData('Fuera del rango de la tabla oficial cargada')}</p>`; return; }
  try {
    const tide = await dayTide(spot.tide.port, key);
    const pt = spotPoint(spot);
    const sun = sunDay(key, pt.lat, pt.lon);
    const samples = sampleDay(tide.events, tide.start, tide.end, 15);
    const stt = stateAt(tide.events, now());
    mini.innerHTML = `<p style="margin:6px 0 0">${stt ? `<b style="color:var(--teal)">${esc(stt.label)}</b> · ${stt.next.type === 'H' ? '▲ pleamar' : '▼ bajamar'} ${fmtTime(stt.next.t)} (${fmtM(stt.next.h)} m)` : '<span class="nodata">Fuera del rango de la tabla oficial cargada</span>'}</p>
      <svg class="mini-chart" role="img" aria-label="Marea de hoy"></svg>${badge({ c: 'oficial', s: ['shn-tablas'] })}`;
    renderChart(mini.querySelector('svg'), { start: tide.start, end: tide.start + DAY, samples, events: tide.events, sun, selected: now(), mini: true, dataFrom: tide.dataFrom, dataTo: tide.dataTo });
  } catch (e) {
    mini.innerHTML = `<p class="nodata">No se pudo cargar la tabla de marea.</p><button type="button" class="btn btn--sm retry">Reintentar</button>`;
    mini.querySelector('.retry').onclick = () => { main.innerHTML = ''; renderSpot(id); };
  }
}
