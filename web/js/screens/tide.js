import { DB, spot as getSpot } from '../data.js';
import { $, h, esc, fmtTime, fmtDate, fmtM, fmtDuration, dayKey, dayStart, parts, MIN, HOUR, DAY, now, ICONS, monthOf, observeReveal, fmtDateShort, parseLocal } from '../util.js';
import { appState, settings, favorites } from '../store.js';
import { dayTide, sampleDay, heightAt, stateAt, windowsFor, hasOfficial, officialYears, tideRefLabel, portInfo, yearAmplitude, springNeap } from '../tide.js';
import { sunDay, moonDay, moonSvg } from '../astro.js';
import { pointForecast, nearest, windText, dirName, windVsCoast } from '../weather.js';
import { WEIGHTS, WIND, MIN_FACTORS, indexColor } from '../fishindex.js';
import { renderChart } from '../chart.js';
import { createWater } from '../water.js';
import { badge, modelBadge, alertBox, openModal, noData } from '../ui.js';
import { spotPicker, spotPoint, marinePoint, computeIndex, favButton } from './common.js';
import { renderPlanner, licenseCard } from './planner.js';

const OUT_OF_RANGE = 'Fuera del rango de la tabla oficial cargada';

export async function renderTide(spotIdArg, dateArg) {
  const main = $('#main');
  const st = appState.get();
  let spotId = spotIdArg && getSpot(spotIdArg) ? spotIdArg : (getSpot(st.spotId) ? st.spotId : 'playa-union');
  let key = dateArg && /^\d{4}-\d{2}-\d{2}$/.test(dateArg) ? dateArg : (st.date || dayKey(now()));
  let selected = key === dayKey(now()) ? now() : dayStart(key) + (st.minutes ?? 12 * 60) * MIN;
  let water = null;
  let current = null;
  let chartApi = null;
  let token = 0; // M-01: every load gets a token; stale results are dropped

  const view = h(`<div class="tide-screen">
    <section class="tide-hero" aria-label="Marea">
      <div class="tide-hero__grid">
        <div class="tide-hero__text">
          <div class="row"><button type="button" class="chip spot-chip">${ICONS.pin}<span class="spot-name"></span>${ICONS.chevron}</button><span class="fav-slot"></span></div>
          <div class="datebar">
            <button type="button" class="icon-btn prev" aria-label="Día anterior">${ICONS.back}</button>
            <label class="sr" for="tide-date">Fecha</label><input type="date" class="date" id="tide-date">
            <button type="button" class="icon-btn next" aria-label="Día siguiente" style="transform:scaleX(-1)">${ICONS.back}</button>
            <button type="button" class="btn btn--sm btn--ghost today">Hoy</button>
          </div>
          <div class="tide-readout">
            <div class="tide-readout__h"><span class="hval">—</span><small class="hunit">m</small></div>
            <div class="tide-readout__state"></div>
            <div class="tide-readout__time"></div>
            <p class="tide-ref"></p>
          </div>
          <p class="sr" aria-live="polite" id="tide-announce"></p>
        </div>
        <div class="gauge" aria-hidden="true">
          <canvas class="water"></canvas>
          <div class="gauge__ticks"></div>
          <div class="gauge__level"><span></span></div>
        </div>
      </div>
    </section>
    <div class="wrap tide-panel">
      <div class="alerts grid" style="gap:10px"></div>
      <div class="favs-strip"></div>
      <section class="planner-slot"></section>
      <section class="card timeline reveal" aria-label="Línea de tiempo del día">
        <div class="row timeline__head"><h2 class="timeline__title">El día, hora por hora</h2><span class="spacer"></span><span class="chart-badge"></span></div>
        <svg class="chart" role="img" aria-label="Curva de marea del día con viento, sol y luna"></svg>
        <label class="sr" for="scrub">Hora del día</label>
        <input id="scrub" class="scrub" type="range" min="0" max="1439" step="5">
        <div class="events"></div>
        <div class="timeline__facts"></div>
        <p class="muted chart-note"></p>
      </section>
      <div class="grid grid-2 duo">
        <section class="card reveal wind-card" aria-live="off"></section>
        <section class="card reveal index-card"></section>
      </div>
      <div class="license-slot"></div>
    </div>
  </div>`);
  main.append(view);
  const q = (s) => view.querySelector(s);
  water = createWater(q('canvas.water'));
  observeReveal(view);

  q('.spot-chip').onclick = () => spotPicker(spotId, (id) => { spotId = id; load(); });
  q('.date').onchange = (e) => { if (e.target.value) { key = e.target.value; selected = defaultSelected(); load(); } };
  q('.prev').onclick = () => { key = dayKey(dayStart(key) - DAY / 2); selected = defaultSelected(); load(); };
  q('.next').onclick = () => { key = dayKey(dayStart(key) + DAY * 1.5); selected = defaultSelected(); load(); };
  q('.today').onclick = () => { key = dayKey(now()); selected = now(); load(); };
  q('#scrub').oninput = (e) => { selected = dayStart(key) + Number(e.target.value) * MIN; updateSelection(); };
  q('#scrub').onchange = () => announce();

  function defaultSelected() { return key === dayKey(now()) ? now() : dayStart(key) + 12 * HOUR; }

  function persist() {
    appState.set({ spotId, date: key, minutes: Math.round((selected - dayStart(key)) / MIN) });
    const target = `#/marea/${spotId}/${key}`;
    if (location.hash !== target) history.replaceState(null, '', target); // L-09: back button restores spot + date
  }

  async function load() {
    const my = ++token;
    const spot = getSpot(spotId);
    const pt = spotPoint(spot);
    persist();
    q('.spot-name').textContent = spot.name;
    q('.fav-slot').innerHTML = favButton(spot.id);
    q('.date').value = key;
    q('.today').hidden = key === dayKey(now());
    const sun = sunDay(key, pt.lat, pt.lon);
    const moon = moonDay(key, pt.lat, pt.lon);
    const official = hasOfficial(dayStart(key));
    let tide = null; let samples = []; let error = null; let yearStats = null; let sn = null;
    if (spot.tide?.port && official) {
      try {
        [tide, yearStats, sn] = await Promise.all([
          dayTide(spot.tide.port, key),
          yearAmplitude(spot.tide.port, parts(dayStart(key)).y),
          springNeap(spot.tide.port, key),
        ]);
        samples = sampleDay(tide.events, tide.start, tide.end, 10);
      } catch (e) { error = e; }
    }
    if (my !== token) return; // a newer request started meanwhile
    current = { spot, pt, sun, moon, tide, samples, official, error, yearStats, sn, forecast: { status: 'loading' }, model: null };
    renderStatic();
    updateSelection();
    renderFavs();
    const fc = await pointForecast(pt, marinePoint(spot));
    if (my !== token) return;
    current.forecast = fc;
    if (!official && fc.marine?.length) {
      const s0 = dayStart(key);
      const pts = fc.marine.filter((r) => r.t >= s0 && r.t <= s0 + DAY && r.sea_level_height_msl != null).map((r) => ({ t: r.t, h: r.sea_level_height_msl }));
      if (pts.length > 12) current.model = pts;
    }
    renderStatic();
    updateSelection();
  }

  function renderFavs() {
    const favs = favorites.all().map((id) => getSpot(id)).filter(Boolean);
    q('.favs-strip').innerHTML = favs.length
      ? `<div class="row favs" role="list" aria-label="Spots favoritos"><span class="eyebrow">★ Favoritos</span>${favs.map((s) => `<button type="button" role="listitem" class="chip ${s.id === spotId ? 'chip--on' : ''}" data-go="${s.id}">${esc(s.name)}</button>`).join('')}</div>`
      : '';
    q('.favs-strip').onclick = (e) => { const b = e.target.closest('[data-go]'); if (b) { spotId = b.dataset.go; load(); } };
  }

  function cutoffPins(spot, tide) {
    if (!spot.cutoff || !tide) return [];
    return tide.inDay.filter((e) => e.type === 'H').map((e) => ({ t: e.t, label: 'Pleamar: riesgo de quedar aislado', danger: true }));
  }

  function renderStatic() {
    const { spot, tide, samples, sun, moon, official, model, error, yearStats, sn, forecast } = current;
    const s0 = dayStart(key);
    const win = settings.get().window;
    const wins = tide ? windowsFor(tide.events, tide.start, tide.end, win) : [];
    const info = portInfo(spot);
    q('.tide-ref').innerHTML = spot.tide?.port
      ? `${esc(tideRefLabel(spot))} ${badge({ c: 'oficial', s: ['shn-tablas'] })}`
      : esc(spot.tide?.note || 'Sin referencia de marea oficial.');

    // Gauge ticks from the port's annual extremes (same basis for every port).
    const ticks = q('.gauge__ticks');
    if (yearStats) {
      const lo = Math.floor(yearStats.lowMin); const hi = Math.ceil(yearStats.highMax);
      current.gauge = { lo, hi };
      let html = '';
      for (let m = lo; m <= hi; m++) html += `<span style="bottom:${gaugePct(m)}%">${m} m</span>`;
      ticks.innerHTML = html;
    } else { current.gauge = null; ticks.innerHTML = ''; }

    // Alerts.
    const m = monthOf(s0);
    const alerts = [];
    if (error) alerts.push(`<div class="alert alert--danger" role="alert">${ICONS.alert}<div><strong>No se pudo cargar la tabla de marea</strong><p>${esc(error.message || '')}</p><button type="button" class="btn btn--sm retry">Reintentar</button></div></div>`);
    if (!official) alerts.push(alertBox('Tabla oficial no cargada', `La app incluye las predicciones oficiales del SHN para ${officialYears().join(', ')}. Para esta fecha no hay tabla oficial cargada.${model ? ' Abajo ves una curva de modelo (Open-Meteo), no oficial, en metros sobre el nivel medio.' : ''}`));
    if (tide && !tide.covered) alerts.push(alertBox(OUT_OF_RANGE, `Parte de este día queda fuera de las predicciones oficiales cargadas (${tide.dataFrom > s0 ? `sin datos antes de las ${fmtTime(tide.dataFrom)}` : ''}${tide.dataTo < s0 + DAY ? `sin datos después de las ${fmtTime(tide.dataTo)}` : ''}). En esos tramos no se muestra altura.`));
    (spot.dangers || []).filter((d) => d.lifeRisk).forEach((d) => alerts.push(alertBox('Peligro documentado', d.t, { danger: true, badgeHtml: badge(d) })));
    if (spot.cutoff && tide) {
      const next = tide.events.find((e) => e.type === 'H' && e.t > now());
      if (next && next.t - now() < 8 * HOUR && key === dayKey(now())) {
        alerts.push(alertBox(`Próxima pleamar en ${fmtDuration(next.t - now())} (${fmtTime(next.t)})`, spot.cutoff.t, { danger: true, badgeHtml: badge(spot.cutoff) }));
      }
    }
    (spot.facts || []).filter((f) => f.alert && (!f.months || f.months.includes(m))).forEach((f) => alerts.push(alertBox('Atención', f.t, { badgeHtml: badge(f) })));
    if (info?.uncertain) alerts.push(alertBox('Corrección de altura asumida', `${spot.tide.note || ''} Es una suposición: tomá las alturas con cautela.`));
    q('.alerts').innerHTML = alerts.join('');
    q('.alerts .retry')?.addEventListener('click', load);

    // Timeline.
    const svg = q('.chart');
    const scrub = q('#scrub');
    const wind = forecast?.wind?.filter((r) => r.t >= s0 && r.t < s0 + DAY) || [];
    const unit = settings.get().windUnit;
    if (tide && samples.length) {
      q('.chart-badge').innerHTML = badge({ c: 'oficial', s: ['shn-tablas', 'shn-generalidades'] }) + (wind.length ? ' ' + modelBadge() : '');
      chartApi = renderChart(svg, { start: s0, end: s0 + DAY, samples, events: tide.events, windows: wins, sun, moon, wind, windUnit: unit, pins: cutoffPins(spot, tide), selected, dataFrom: tide.dataFrom, dataTo: tide.dataTo, onScrub: (t) => { selected = t; updateSelection(); }, onRelease: () => announce() });
      q('.chart-note').textContent = 'Curva interpolada con el método del SHN entre pleamares y bajamares. El SHN advierte que en algunos puertos puede diferir alrededor de un 10 % de la amplitud a media marea y que las tablas no incluyen el efecto del viento ni de la presión.' + (win ? ' La franja naranja es tu ventana de pesca.' : ' Definí tu ventana de pesca en Ajustes para verla resaltada.');
      svg.hidden = false; scrub.hidden = false;
    } else if (model) {
      q('.chart-badge').innerHTML = modelBadge();
      chartApi = renderChart(svg, { start: s0, end: s0 + DAY, samples: model, events: [], sun, moon, wind, windUnit: unit, selected, model: true, onScrub: (t) => { selected = t; updateSelection(); }, onRelease: () => announce() });
      q('.chart-note').textContent = 'Modelo numérico (Open-Meteo, referido al nivel medio del mar, no al plano de reducción del SHN). No reemplaza la tabla oficial.';
      svg.hidden = false; scrub.hidden = false;
    } else {
      chartApi = null; svg.innerHTML = ''; svg.hidden = true; scrub.hidden = true;
      q('.chart-badge').innerHTML = '';
      q('.chart-note').textContent = error ? 'No se pudo cargar la tabla oficial.' : spot.tide?.port ? `Sin datos oficiales ni de modelo para esta fecha. ${OUT_OF_RANGE}.` : (spot.tide?.note || '');
    }

    const evs = tide ? tide.inDay : [];
    q('.events').innerHTML = evs.map((e) => `<div class="event ${e.t < now() ? 'event--past' : ''}">
        <div class="event__k">${e.type === 'H' ? '▲ Pleamar' : '▼ Bajamar'}</div><div class="event__t">${fmtTime(e.t)}</div><div class="event__h">${fmtM(e.h)} m</div></div>`).join('');

    // Facts strip: amplitude (SHN definition), spring/neap from official amplitudes, sun, moon.
    const amp = tide?.amplitude;
    const snText = { viva: 'Marea viva: la amplitud de hoy es la mayor entre 3 días antes y 3 después', muerta: 'Marea muerta: la amplitud de hoy es la menor entre 3 días antes y 3 después', intermedia: 'Amplitud intermedia', 'creciendo hacia marea viva': 'Amplitudes en aumento, hacia marea viva', 'bajando hacia marea muerta': 'Amplitudes en baja, hacia marea muerta' };
    q('.timeline__facts').innerHTML = `
      <div class="tfact"><span class="eyebrow">Amplitud</span>
        ${amp != null ? `<b class="tfact__v">${fmtM(amp, 2)} m</b>
        <span class="muted">Máxima del día, definición SHN (pleamar menos la bajamar siguiente).${yearStats ? ` Media 2026 de este punto: ${fmtM(yearStats.mean)} m; máxima: ${fmtM(yearStats.max)} m.` : ''}</span>
        ${badge({ c: 'oficial', s: ['shn-tablas', 'shn-generalidades'] })}` : noData(spot.tide?.port ? OUT_OF_RANGE : 'Sin referencia de marea oficial para este punto')}</div>
      <div class="tfact"><span class="eyebrow">Marea viva o muerta</span>
        ${sn?.label ? `<b class="tfact__v">${esc(snText[sn.label] || sn.label)}</b>` : noData()}
        <span class="muted">Calculado con las amplitudes oficiales del SHN. En Argentina no existe un coeficiente de marea oficial.</span></div>
      <div class="tfact"><span class="eyebrow">Luna</span>
        <div class="row">${moonSvg(moon.phase, moon.name, moon.fraction)}<b class="tfact__v">${esc(moon.name)} · ${Math.round(moon.fraction * 100)} %</b></div>
        <span class="muted">Sale ${moon.rise ? fmtTime(moon.rise) : '—'} · se pone ${moon.set ? fmtTime(moon.set) : '—'}${moon.regime ? ` · posición de ${moon.regime} (fase lunar)` : ''}</span>${badge({ c: 'cientifico', s: ['suncalc'] })}</div>
      <div class="tfact"><span class="eyebrow">Sol</span>
        <b class="tfact__v">${sun.sunrise ? fmtTime(sun.sunrise) : '—'} → ${sun.sunset ? fmtTime(sun.sunset) : '—'}</b>
        <span class="muted">Hora dorada hasta ${sun.goldenAm ? fmtTime(sun.goldenAm) : '—'} y desde ${sun.goldenPm ? fmtTime(sun.goldenPm) : '—'} · primera luz ${sun.dawn ? fmtTime(sun.dawn) : '—'}</span>${badge({ c: 'cientifico', s: ['suncalc'] })}</div>`;

    q('.license-slot').innerHTML = licenseCard();
  }

  function gaugePct(hgt) {
    const g = current?.gauge;
    if (!g) return 30;
    return 6 + 88 * ((hgt - g.lo) / Math.max(0.5, g.hi - g.lo));
  }

  function updateSelection() {
    if (!current) return;
    const { tide, samples, model, spot } = current;
    const s0 = dayStart(key);
    const minutes = Math.round((selected - s0) / MIN);
    const scrub = q('#scrub');
    if (document.activeElement !== scrub) scrub.value = Math.max(0, Math.min(1439, minutes));
    q('.tide-readout__time').textContent = `${fmtDate(selected)} · ${fmtTime(selected)} h (UTC−3)`;
    let hNow = null;
    const hv = q('.hval');
    hv.classList.remove('hval--msg');
    if (tide && samples.length) {
      hNow = heightAt(tide.events, selected);
      const stt = stateAt(tide.events, selected);
      q('.hunit').textContent = 'm';
      if (hNow == null) {
        hv.classList.add('hval--msg');
        q('.hunit').textContent = '';
        q('.tide-readout__state').innerHTML = `<b>${OUT_OF_RANGE}</b> · la primera predicción cargada es del ${fmtDateShort(tide.events[0]?.t ?? s0)} a las ${fmtTime(tide.events[0]?.t ?? s0)} y la última del ${fmtDateShort(tide.events.at(-1)?.t ?? s0)} a las ${fmtTime(tide.events.at(-1)?.t ?? s0)}.`;
      } else {
        q('.tide-readout__state').innerHTML = stt
          ? `<b>${esc(stt.label)}</b> · ${stt.next.type === 'H' ? '▲ pleamar' : '▼ bajamar'} ${fmtTime(stt.next.t)} (${fmtM(stt.next.h)} m) · en ${fmtDuration(stt.next.t - selected)}`
          : '';
      }
    } else if (model) {
      hNow = heightAt(model.map((p, i) => ({ ...p, type: i })), selected);
      q('.hunit').textContent = 'm s/ nivel medio';
      q('.tide-readout__state').innerHTML = '<b>Modelo, no oficial</b>';
    } else {
      hv.classList.add('hval--msg');
      q('.hunit').textContent = '';
      q('.tide-readout__state').innerHTML = `<b>${current.error ? 'No se pudo cargar la tabla de marea' : spot.tide?.port ? OUT_OF_RANGE : 'Sin marea oficial para este punto'}</b>`;
    }
    hv.textContent = hNow == null ? (tide || current.error || !spot.tide?.port ? 'Sin dato' : 'Sin dato') : fmtM(hNow);

    // Water gauge: absolute height on the port's annual scale (M-02).
    if (hNow != null && tide && current.gauge) {
      const pct = gaugePct(hNow);
      water.setLevel(pct / 100);
      const lvl = q('.gauge__level');
      lvl.style.bottom = `${pct}%`;
      lvl.querySelector('span').textContent = `${fmtM(hNow)} m`;
      lvl.hidden = false;
    } else {
      water.setLevel(0.06);
      q('.gauge__level').hidden = true;
    }
    chartApi?.place(selected);
    persistSoft();
    renderWind();
    renderIndex();
  }

  let pt = 0;
  function persistSoft() { clearTimeout(pt); pt = setTimeout(persist, 400); }

  function announce() {
    const txt = `${q('.tide-readout__time').textContent}. Altura ${q('.hval').textContent} ${q('.hunit').textContent}. ${q('.tide-readout__state').textContent}`;
    q('#tide-announce').textContent = txt;
  }

  function renderWind() {
    const card = q('.wind-card');
    const fc = current.forecast;
    const unit = settings.get().windUnit;
    const head = `<div class="row"><h2 class="card-title">Viento y mar</h2><span class="spacer"></span>${modelBadge()}</div>`;
    if (!fc || fc.status === 'loading') { card.innerHTML = `${head}<p>${noData('Cargando pronóstico…')}</p>`; return; }
    if (fc.status === 'failed' || fc.status === 'offline') {
      card.innerHTML = `${head}<p>${noData(fc.status === 'offline' ? 'Sin conexión y sin pronóstico guardado' : 'No se pudo obtener el pronóstico')}</p>${fc.status === 'failed' ? '<button type="button" class="btn btn--sm retry-wx">Reintentar</button>' : ''}`;
      card.querySelector('.retry-wx')?.addEventListener('click', async () => {
        current.forecast = { status: 'loading' }; renderWind();
        const my = token; const spot = current.spot;
        const r = await pointForecast(current.pt, marinePoint(spot));
        if (my === token) { current.forecast = r; renderStatic(); updateSelection(); }
      });
      return;
    }
    const row = nearest(fc.wind, selected);
    if (!row) { card.innerHTML = `${head}<p>${noData('Sin pronóstico para esta fecha (el modelo cubre unos 16 días)')}</p>`; return; }
    const sea = nearest(fc.marine, selected);
    const deg = row.wind_direction_10m ?? 0;
    const seaward = current.spot.orientation?.seaward;
    const rel = windVsCoast(deg, seaward);
    card.innerHTML = `${head}
      <div class="row" style="margin-top:10px;gap:16px">
        <svg class="wind-arrow" viewBox="0 0 56 56" style="transform:rotate(${deg + 180}deg)" role="img" aria-label="Viento desde el ${dirName(deg)}"><path d="M28 6 40 46 28 38 16 46Z"/></svg>
        <div class="stat"><span class="stat__v">${windText(row.wind_speed_10m, unit)}</span><span class="muted">desde el ${dirName(deg)} · ráfagas ${windText(row.wind_gusts_10m, unit)}</span></div>
      </div>
      <p style="margin:12px 0 4px">${rel ? `Respecto de la costa: <b>${rel.label}</b> <span class="badge badge--unica" title="Orientación calculada a partir de la línea de costa de OpenStreetMap">calculado a partir de la línea de costa</span>` : '<span class="nodata">Sin orientación de costa para este punto</span>'}</p>
      <p style="margin:6px 0 0">Olas: ${sea?.wave_height != null ? `<b>${fmtM(sea.wave_height, 1)} m</b>` : '<span class="muted">sin dato del modelo en este punto</span>'} · Mar: ${sea?.sea_surface_temperature != null ? `<b>${Math.round(sea.sea_surface_temperature)} °C</b>` : '<span class="muted">—</span>'}</p>
      <p class="muted small">Consultado ${new Date(fc.fetchedAt).toLocaleString('es-AR', { timeZone: 'America/Argentina/Buenos_Aires', hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' })}${fc.status.startsWith('cached') ? ' · mostrando el último pronóstico guardado' : ''}${current.spot.marinePoint ? ' · oleaje en un punto mar adentro frente al spot' : ''}</p>`;
  }

  function renderIndex() {
    const card = q('.index-card');
    const fc = current.forecast;
    const wind = fc?.wind ? nearest(fc.wind, selected) : null;
    const r = computeIndex({ tide: current.tide, sun: current.sun, wind, at: selected });
    const C = 2 * Math.PI * 38;
    const sp = r.species;
    const wxState = !fc || fc.status === 'loading' ? 'cargando' : (fc.status === 'failed' ? 'no se pudo obtener' : fc.status === 'offline' ? 'sin conexión' : 'sin pronóstico');
    card.innerHTML = `<div class="row"><h2 class="card-title">Índice de pesca</h2><span class="spacer"></span>
        <button type="button" class="icon-btn info" aria-label="Cómo se calcula el índice">${ICONS.info}</button></div>
      <p class="muted small" style="margin:2px 0 8px">Orientativo, no es una predicción de pique.</p>
      <div class="row" style="gap:18px">
        <svg class="index-ring" viewBox="0 0 92 92" role="img" aria-label="${r.incomplete ? 'Índice incompleto' : `Índice ${r.score} de 100`}">
          <circle class="bg" cx="46" cy="46" r="38"/><circle class="fg" cx="46" cy="46" r="38" style="stroke:${indexColor(r.score)};stroke-dasharray:${C};stroke-dashoffset:${r.score == null ? C : C * (1 - r.score / 100)}"/>
          <text x="46" y="46" style="font-size:${r.incomplete ? 13 : 26}px">${r.incomplete ? 'Incompleto' : r.score}</text></svg>
        <div class="index-factors">
          <div>Viento: <b>${r.V == null ? wxState : Math.round(r.V * 100) + ' / 100'}</b></div>
          <div>Marea y luz: <b>${r.T == null ? (settings.get().window ? 'sin tabla' : 'definí tu ventana') : Math.round(r.T * 100) + ' / 100'}</b></div>
          <div>Temporada: <b>${r.E == null ? (sp ? 'sin dato de temporada' : 'elegí una especie') : Math.round(r.E * 100) + ' / 100'}</b>${sp ? ` <span class="muted">(${esc(sp.name)})</span>` : ''}</div>
        </div>
      </div>
      ${r.incomplete ? `<p class="muted small">Índice incompleto: hacen falta al menos ${MIN_FACTORS} factores con datos reales.</p>` : r.missing.length ? `<p class="muted small">Calculado sin: ${r.missing.map((k) => ({ V: 'viento', T: 'marea', E: 'temporada' }[k])).join(', ')}.</p>` : ''}
      <a class="btn btn--sm btn--ghost" href="#/ajustes">Especie objetivo y ventana</a>`;
    card.querySelector('.info').onclick = indexInfo;
  }

  // Planner (H-07) is independent of the selected spot/date.
  renderPlanner(q('.planner-slot'), (id, date) => { spotId = id; key = date; selected = dayStart(key) + 12 * HOUR; load(); window.scrollTo({ top: 0, behavior: 'smooth' }); });

  let rt = 0;
  const onResize = () => { clearTimeout(rt); rt = setTimeout(() => { if (current) { renderStatic(); updateSelection(); } }, 200); };
  window.addEventListener('resize', onResize);
  load();
  return () => { water?.destroy(); window.removeEventListener('resize', onResize); token++; };
}

export function indexInfo() {
  openModal(`<h2>Índice de pesca</h2>
    <p><b>Es orientativo.</b> No es una predicción científica de pique: combina hasta tres factores con pesos elegidos por nosotros.</p>
    <pre class="formula">Índice = 100 × (${WEIGHTS.V}·V + ${WEIGHTS.T}·T + ${WEIGHTS.E}·E)</pre>
    <p><b>V · Viento</b> (Open-Meteo, a la hora elegida): 1 si el viento sostenido es ≤ ${WIND.calmSustained} km/h y las ráfagas ≤ ${WIND.calmGust} km/h; baja en línea recta hasta 0 con sostenido de ${WIND.maxSustained} km/h o ráfagas de ${WIND.maxGust} km/h. Umbrales: criterio editorial.</p>
    <p><b>T · Marea y luz</b>: qué parte de tu ventana de pesca del día cae con luz solar. Solo cuenta si definiste una ventana en Ajustes.</p>
    <p><b>E · Temporada</b> de tu especie objetivo: 1 si el mes figura como temporada o pico con fuente, 0,2 si no. Solo cuenta si la especie tiene temporada documentada.</p>
    <p>Los factores sin datos no se reemplazan por valores neutros: se dejan afuera y los pesos se reparten entre los que hay. Con menos de ${MIN_FACTORS} factores reales se muestra «Índice incompleto».</p>
    <p class="muted">La luna no entra en la fórmula: no encontramos evidencia verificada de su efecto en esta costa.</p>`, { label: 'Cómo se calcula el índice' });
}
