// Integrated day timeline: tide curve (SHN), wind barbs above, sun arc and night shading behind,
// moon rise/set, personal windows, alert pins and labelled gaps where no official data exists.
import { fmtTime, fmtM, HOUR, prefersReducedMotion, esc } from './util.js';
import { dirName } from './weather.js';

export function renderChart(svg, {
  start, end, samples, events, windows = [], sun, moon, wind = [], pins = [], selected,
  model = false, unit = 'm', onScrub, onRelease, mini = false, dataFrom = null, dataTo = null, windUnit = 'kmh',
}) {
  const W = Math.max(300, Math.round(svg.clientWidth || svg.parentElement?.clientWidth || 1000));
  const narrow = W < 560;
  const windBand = !mini && wind.length ? 46 : 0;
  const pinBand = !mini && pins.length ? 22 : 0;
  const PAD = { l: 36, r: 14, t: (mini ? 14 : 44) + windBand + pinBand, b: mini ? 26 : 58 };
  const height = mini ? 124 : (narrow ? 300 : 320) + windBand + pinBand;
  const iw = W - PAD.l - PAD.r;
  const ih = height - PAD.t - PAD.b;
  const top = PAD.t;
  const hs = samples.map((s) => s.h);
  let lo = hs.length ? Math.min(...hs) : 0;
  let hi = hs.length ? Math.max(...hs) : 1;
  const span = Math.max(0.5, hi - lo);
  lo -= span * 0.12; hi += span * 0.12;
  const x = (t) => PAD.l + ((t - start) / (end - start)) * iw;
  const y = (v) => top + (1 - (v - lo) / (hi - lo)) * ih;

  // Curve split into continuous runs (never bridge a gap without data).
  const runs = [];
  let run = [];
  samples.forEach((s, i) => {
    if (i && s.t - samples[i - 1].t > 20 * 60e3) { runs.push(run); run = []; }
    run.push(s);
  });
  if (run.length) runs.push(run);
  const pathOf = (r) => r.map((s, i) => `${i ? 'L' : 'M'}${x(s.t).toFixed(1)},${y(s.h).toFixed(1)}`).join('');
  const curves = runs.map((r) => `<path class="area" d="${pathOf(r)}L${x(r.at(-1).t).toFixed(1)},${top + ih}L${x(r[0].t).toFixed(1)},${top + ih}Z"/><path class="curve ${model ? 'curve--model' : ''}" d="${pathOf(r)}"/>`).join('');

  const hours = [];
  for (let k = 0; k <= 24; k += mini || narrow ? 6 : 3) hours.push(k);
  const grid = hours.map((k) => {
    const xx = x(start + k * HOUR);
    return `<line class="grid-line" x1="${xx}" x2="${xx}" y1="${top}" y2="${top + ih}" opacity="${k % 6 ? .35 : .8}"/>${k < 24 ? `<text class="axis" x="${xx + 3}" y="${top + ih + (mini ? 18 : 52)}">${String(k).padStart(2, '0')} h</text>` : ''}`;
  }).join('');

  // Sun: night shading + a faint arc from sunrise to sunset behind the curve.
  let sky = '';
  if (sun?.sunrise && sun?.sunset) {
    sky += `<rect class="night" x="${x(start)}" y="${top}" width="${Math.max(0, x(sun.sunrise) - x(start))}" height="${ih}"/>
      <rect class="night" x="${x(sun.sunset)}" y="${top}" width="${Math.max(0, x(end) - x(sun.sunset))}" height="${ih}"/>`;
    if (!mini) {
      const x1 = x(sun.sunrise); const x2 = x(sun.sunset); const peak = top + ih * 0.12;
      sky += `<path class="sun-arc" d="M${x1},${top + ih} Q${(x1 + x2) / 2},${peak - ih * 0.35} ${x2},${top + ih}"/>
        <text class="sky-label" x="${x1}" y="${top + ih - 6}" text-anchor="middle">☀ ${fmtTime(sun.sunrise)}</text>
        <text class="sky-label" x="${x2}" y="${top + ih - 6}" text-anchor="middle">${fmtTime(sun.sunset)}</text>`;
    }
  }
  if (!mini && moon) {
    [['rise', '☾ sale'], ['set', '☾ se pone']].forEach(([k, l]) => {
      const t = moon[k];
      if (t && t >= start && t <= end) sky += `<text class="moon-label" x="${x(t)}" y="${top + ih + 32}" text-anchor="middle">${l} ${fmtTime(t)}</text>`;
    });
  }

  // Gaps without official data: the message always says why (never a silent blank).
  const gapText = (cx, cy, w) => {
    const lines = w > 260 ? ['Fuera del rango de la tabla oficial cargada'] : w > 130 ? ['Fuera del rango de', 'la tabla oficial cargada'] : ['Fuera del', 'rango de la', 'tabla oficial'];
    return `<text class="gap-label${w < 90 ? ' gap-label--sm' : ''}" x="${cx}" y="${cy - (lines.length - 1) * 8}" text-anchor="middle">${lines.map((l, i) => `<tspan x="${cx}" dy="${i ? 16 : 0}">${l}</tspan>`).join('')}</text>`;
  };
  let gaps = '';
  const gapRect = (a, b) => (b - a > 10 * 60e3 ? `<rect class="gap" x="${x(a)}" y="${top}" width="${x(b) - x(a)}" height="${ih}"/>
      ${gapText((x(a) + x(b)) / 2, top + ih / 2, x(b) - x(a))}` : '');
  if (!model && dataFrom != null && dataTo != null) {
    gaps += gapRect(start, dataFrom) + gapRect(dataTo, end);
  }

  const win = windows.map((w) => `<rect class="window" x="${x(w.from)}" y="${top}" width="${x(w.to) - x(w.from)}" height="${ih}" rx="6"/>
     <line class="window-edge" x1="${x(w.from)}" x2="${x(w.from)}" y1="${top}" y2="${top + ih}"/><line class="window-edge" x1="${x(w.to)}" x2="${x(w.to)}" y1="${top}" y2="${top + ih}"/>`).join('');

  const evs = mini ? '' : events.filter((e) => e.t >= start && e.t <= end).map((e) => {
    const ex = x(e.t); const ey = y(e.h); const above = e.type === 'H';
    const ly = above ? ey - 22 : ey + 22;
    const anchor = ex < 50 ? 'start' : ex > W - 50 ? 'end' : 'middle';
    return `<circle class="ev-dot" cx="${ex}" cy="${ey}" r="6"/>
      <text class="ev-label" x="${ex}" y="${ly}" text-anchor="${anchor}">${above ? '▲' : '▼'} ${fmtTime(e.t)}</text>
      <text class="ev-sub" x="${ex}" y="${ly + 15}" text-anchor="${anchor}">${fmtM(e.h)} ${unit}</text>`;
  }).join('');

  // Wind barbs: one arrow every 3 h (2 h on wide screens), pointing where the wind blows.
  let barbs = '';
  if (windBand) {
    const step = narrow ? 3 : 2;
    const by = 16;
    for (let k = 0; k < 24; k += step) {
      const t = start + k * HOUR + HOUR;
      const r = wind.find((w) => Math.abs(w.t - t) <= 30 * 60e3);
      if (!r || r.wind_speed_10m == null) continue;
      const xx = x(t);
      const strong = (r.wind_gusts_10m ?? 0) >= 50;
      const v = windUnit === 'kn' ? Math.round(r.wind_speed_10m / 1.852) : Math.round(r.wind_speed_10m);
      barbs += `<g transform="translate(${xx},${by})" class="barb ${strong ? 'barb--hi' : ''}"><title>${fmtTime(t)}: viento del ${dirName(r.wind_direction_10m)}, ${v} ${windUnit === 'kn' ? 'nudos' : 'km/h'}, ráfagas ${Math.round(r.wind_gusts_10m ?? 0)} km/h</title>
        <g transform="rotate(${(r.wind_direction_10m ?? 0) + 180})"><path d="M0,-10 L5,4 L0,1 L-5,4Z"/></g>
        <text y="26" text-anchor="middle">${v}</text></g>`;
    }
    barbs = `<text class="band-label" x="${PAD.l}" y="10">Viento (${windUnit === 'kn' ? 'nudos' : 'km/h'}) · modelo</text>${barbs}`;
  }

  // Alert pins at the times they apply.
  const pinEls = pins.filter((p) => p.t >= start && p.t <= end).map((p) => {
    const px = x(p.t);
    const py = windBand + 8;
    return `<g class="pin ${p.danger ? 'pin--danger' : ''}"><line x1="${px}" x2="${px}" y1="${py + 12}" y2="${top + ih}"/><circle cx="${px}" cy="${py + 6}" r="6"/>
      <text x="${px + (px > W - 160 ? -10 : 10)}" y="${py + 10}" text-anchor="${px > W - 160 ? 'end' : 'start'}">${esc(p.label)}</text></g>`;
  }).join('');

  svg.setAttribute('viewBox', `0 0 ${W} ${height}`);
  svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
  svg.style.height = `${height}px`;
  svg.innerHTML = `<defs><linearGradient id="tideFill" x1="0" x2="0" y1="0" y2="1">
      <stop offset="0" stop-color="var(--teal)" stop-opacity=".35"/><stop offset="1" stop-color="var(--teal)" stop-opacity="0"/></linearGradient>
      <pattern id="gapHatch" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="8" height="8" fill="transparent"/><line x1="0" y1="0" x2="0" y2="8" stroke="var(--current)" stroke-width="3"/></pattern></defs>
    ${sky}${grid}${win}${gaps}${curves}${evs}${barbs}${pinEls}
    <g class="marker"><line class="now" x1="0" x2="0" y1="${top - 6}" y2="${top + ih}"/><circle class="now-dot" r="7" cx="0" cy="0"/></g>`;

  if (!mini && !prefersReducedMotion() && !model) {
    svg.querySelectorAll('.curve').forEach((c) => {
      const len = c.getTotalLength();
      c.style.setProperty('--len', len);
    });
    svg.classList.remove('draw');
    void svg.getBoundingClientRect();
    svg.classList.add('draw');
  }

  const marker = svg.querySelector('.marker');
  const place = (t) => {
    const s = samples.length ? samples.reduce((best, p) => (Math.abs(p.t - t) < Math.abs(best.t - t) ? p : best), samples[0]) : null;
    const inData = s && Math.abs(s.t - t) <= 15 * 60e3;
    marker.setAttribute('transform', `translate(${x(t)},0)`);
    const dot = marker.querySelector('.now-dot');
    dot.style.display = inData ? '' : 'none';
    if (inData) dot.setAttribute('cy', y(s.h));
    marker.style.display = t >= start && t <= end ? '' : 'none';
  };
  place(selected);

  if (onScrub && !mini) {
    const toT = (ev) => {
      const r = svg.getBoundingClientRect();
      const px = ((ev.clientX - r.left) / r.width) * W;
      return Math.min(end, Math.max(start, start + ((px - PAD.l) / iw) * (end - start)));
    };
    let dragging = false;
    svg.onpointerdown = (ev) => { dragging = true; svg.setPointerCapture(ev.pointerId); const t = toT(ev); place(t); onScrub(t); };
    svg.onpointermove = (ev) => { if (!dragging) return; const t = toT(ev); place(t); onScrub(t); };
    svg.onpointerup = svg.onpointercancel = (ev) => { if (dragging && onRelease) onRelease(toT(ev)); dragging = false; };
  }
  return { place };
}
