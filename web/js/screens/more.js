import { DB, spot as getSpot, species as getSpecies, source } from '../data.js';
import { $, h, esc, ICONS, toast, fmtTime, fmtDate, fmtM, fmtDateShort, dayKey, now, parseLocal, parts, MONTH_ABBR, observeReveal, DAY } from '../util.js';
import { settings, catchLog, appState, favorites, photos } from '../store.js';
import { eventsFor, heightAt, stateAt, hasOfficial, bundledRange, portInfo } from '../tide.js';
import { moonDay } from '../astro.js';
import { badge, fact, noData, alertBox, openModal } from '../ui.js';
import { spotPoint } from './common.js';

/**
 * Editorial page: big title, lede, numbered sections with an index (sticky on desktop).
 * sections: [{ id, title, html }]
 */
function editorial(eyebrow, title, lede, sections) {
  return h(`<div class="wrap ed">
    <a class="btn btn--ghost btn--sm" href="#/mas" style="margin-top:18px">${ICONS.back}Más</a>
    <header class="ed__head"><span class="eyebrow">${esc(eyebrow)}</span><h1 class="page-title">${esc(title)}</h1>${lede ? `<p class="page-lede">${lede}</p>` : ''}</header>
    <div class="ed__layout">
      <nav class="ed__index" aria-label="Secciones de la página"><ol>${sections.map((s, i) => `<li><a href="#" data-jump="${s.id}"><span>${String(i + 1).padStart(2, '0')}</span>${esc(s.title)}</a></li>`).join('')}</ol></nav>
      <div class="ed__body">${sections.map((s, i) => `<section class="ed__sec reveal" id="sec-${s.id}" aria-labelledby="h-${s.id}">
        <div class="ed__num" aria-hidden="true">${String(i + 1).padStart(2, '0')}</div><h2 class="ed__title" id="h-${s.id}">${esc(s.title)}</h2>${s.html}</section>`).join('')}</div>
    </div></div>`);
}

function wireIndex(view) {
  view.querySelectorAll('[data-jump]').forEach((a) => {
    a.onclick = (e) => { e.preventDefault(); const t = view.querySelector(`#sec-${a.dataset.jump}`); t?.scrollIntoView({ behavior: 'smooth', block: 'start' }); t?.querySelector('h2')?.setAttribute('tabindex', '-1'); t?.querySelector('h2')?.focus({ preventScroll: true }); };
  });
}

function mount(view) {
  $('#main').append(view);
  wireIndex(view);
  observeReveal(view);
  return view;
}

/* ---------------- Más ---------------- */
export function renderMore() {
  const items = [
    ['#/bitacora', '01', 'Bitácora', 'Tus lances, con foto y la marea de cada captura. Guardado en este dispositivo.'],
    ['#/seguridad', '02', 'Seguridad', 'Emergencias, compartir tu ubicación, peligros de marea documentados y fauna.'],
    ['#/normativa', '03', 'Normativa', 'Permiso de costa, vedas vigentes, especies protegidas y áreas protegidas.'],
    ['#/guia', '04', 'Liberar tiburones y rayas', 'Cómo devolver vivos a tiburones y rayas desde la costa, con fuentes.'],
    ['#/fuentes', '05', 'Fuentes y datos excluidos', 'Cada fuente con su fecha y lo que dejamos afuera por no poder verificarlo.'],
    ['#/ajustes', '06', 'Ajustes', 'Tema, tu ventana de pesca, especie objetivo, unidades y rango de las tablas.'],
  ];
  $('#main').append(h(`<div class="wrap"><h1 class="page-title">Más</h1>
    <p class="page-lede">Antes de tirar la línea: permiso, marea y avisarle a alguien a dónde vas.</p>
    <nav class="menu section" aria-label="Secciones">${items.map(([href, n, t, d]) => `<a href="${href}"><span class="menu__n">${n}</span><b>${t}</b><span>${d}</span></a>`).join('')}</nav>
    <p class="muted small" style="padding-bottom:30px">Mareas: predicciones oficiales del Servicio de Hidrografía Naval (SHN). Viento y oleaje: Open-Meteo (modelo, no oficial). Sol y luna: cálculo astronómico (SunCalc).</p></div>`));
}

/* ---------------- Bitácora (L-05) ---------------- */
const nowLocalInput = () => {
  const p = parts(now());
  return `${dayKey(now())}T${String(p.h).padStart(2, '0')}:${String(p.mi).padStart(2, '0')}`;
};

export function renderLog() {
  const spots = DB.spots.spots;
  const sp = DB.species.species.filter((s) => s.legal.status !== 'protegida');
  let editing = null;
  const form = `
    <form class="card form form--2" id="logform">
      <label class="field">Fecha y hora (UTC−3)<input type="datetime-local" name="when" required></label>
      <label class="field">Spot<select name="spot" required>${spots.map((s) => `<option value="${s.id}">${esc(s.name)}</option>`).join('')}</select></label>
      <label class="field">Especie<select name="species"><option value="">Otra / no sé</option>${sp.map((s) => `<option value="${s.id}">${esc(s.name)}</option>`).join('')}</select></label>
      <label class="field">Carnada o señuelo<input name="bait" maxlength="80" placeholder="ej. langostino"></label>
      <label class="field">Largo (cm)<input name="length" type="number" min="0" step="0.5" inputmode="decimal"></label>
      <label class="field">Peso (kg)<input name="weight" type="number" min="0" step="0.01" inputmode="decimal"></label>
      <label class="field">Foto (opcional)<input name="photo" type="file" accept="image/*" capture="environment"></label>
      <label class="field">Notas<textarea name="notes" maxlength="500" placeholder="Viento, devuelto, aparejo…"></textarea></label>
      <div class="row" style="grid-column:1/-1"><button class="btn btn--primary" type="submit">${ICONS.plus}<span class="submit-label">Guardar lance</span></button>
        <button class="btn btn--ghost cancel-edit" type="button" hidden>Cancelar edición</button>
        <span class="muted small">La marea se calcula sola con la tabla SHN del puerto de referencia del spot.</span></div>
    </form>`;
  const view = editorial('Tus salidas', 'Bitácora', 'Se guarda solo en este dispositivo. Exportá un respaldo de vez en cuando.', [
    { id: 'nuevo', title: 'Nuevo lance', html: form },
    { id: 'lances', title: 'Tus lances', html: `<div class="row"><span class="spacer"></span><button class="btn btn--sm" type="button" id="exp">Exportar</button><label class="btn btn--sm" style="cursor:pointer">Importar<input type="file" id="imp" accept="application/json" hidden></label></div><ul class="list entries"></ul>` },
    { id: 'stats', title: 'Tus números', html: '<div class="grid grid-2 stats-grid"></div><p class="muted small">Estadísticas propias a partir de tus lances: te ayudan a descubrir tu mejor momento, ya que no hay datos verificados de mejor marea por especie.</p>' },
  ]);
  mount(view);
  const f = view.querySelector('#logform');
  const resetForm = () => {
    f.reset(); editing = null;
    f.when.value = nowLocalInput();
    f.spot.value = appState.get().spotId && getSpot(appState.get().spotId) ? appState.get().spotId : spots[0].id;
    view.querySelector('.submit-label').textContent = 'Guardar lance';
    view.querySelector('.cancel-edit').hidden = true;
  };
  f.when.addEventListener('focus', () => { if (!editing && !f.when.dataset.touched) f.when.value = nowLocalInput(); });
  f.when.addEventListener('input', () => { f.when.dataset.touched = '1'; });
  view.querySelector('.cancel-edit').onclick = resetForm;
  resetForm();

  async function draw() {
    const list = catchLog.all();
    const ul = view.querySelector('.entries');
    ul.innerHTML = list.length ? list.map((e) => `<li data-id="${e.id}">
        <div class="row"><b>${esc(e.speciesName || 'Otra especie')}</b><span class="muted">${esc(getSpot(e.spot)?.name || e.spot)}</span><span class="spacer"></span>
          <button class="btn btn--sm btn--ghost" data-edit="${e.id}">Editar</button><button class="btn btn--sm btn--ghost" data-del="${e.id}">Borrar</button></div>
        <div class="del-confirm" hidden><span>¿Borrar este lance?</span> <button class="btn btn--sm btn--signal" data-del-ok="${e.id}">Sí, borrar</button> <button class="btn btn--sm btn--ghost" data-del-no>No</button></div>
        <div class="muted small">${fmtDate(e.t)} · ${fmtTime(e.t)} h${e.tide ? ` · ${esc(e.tide.label)} · ${fmtM(e.tide.h)} m <span class="muted">(${esc(e.tide.source || 'tabla SHN')})</span>` : ''}${e.moon ? ` · ${esc(e.moon)}` : ''}</div>
        <div>${[e.length ? `${String(e.length).replace('.', ',')} cm` : '', e.weight ? `${String(e.weight).replace('.', ',')} kg` : '', e.bait ? esc(e.bait) : ''].filter(Boolean).join(' · ')}</div>
        ${e.notes ? `<p style="margin:4px 0 0">${esc(e.notes)}</p>` : ''}
        ${e.hasPhoto ? '<img class="log-photo" alt="Foto del lance" hidden>' : ''}</li>`).join('') : '<li class="muted">Todavía no cargaste ningún lance. ¿Salís hoy?</li>';
    for (const e of list.filter((x) => x.hasPhoto)) {
      const blob = await photos.get(e.id);
      const img = ul.querySelector(`li[data-id="${e.id}"] .log-photo`);
      if (blob && img) { img.src = URL.createObjectURL(blob); img.hidden = false; }
    }
    // Stats (size/weight, tide phase, moon phase, month).
    const by = (fn) => list.reduce((acc, e) => { const k = fn(e); if (k) acc[k] = (acc[k] || 0) + 1; return acc; }, {});
    const bars = (title, counts) => {
      const entries = Object.entries(counts).sort((a, b) => b[1] - a[1]);
      const max = Math.max(1, ...entries.map(([, v]) => v));
      return `<div class="card"><h3 class="card-sub">${title}</h3><div class="bars">${entries.length ? entries.map(([k, v]) => `<div><span>${esc(k)}</span><i style="width:${(v / max) * 100}%"></i><b>${v}</b></div>`).join('') : '<p class="muted">Sin datos todavía.</p>'}</div></div>`;
    };
    const sizes = list.filter((e) => e.length).map((e) => e.length);
    const weights = list.filter((e) => e.weight).map((e) => e.weight);
    const avg = (a) => (a.length ? (a.reduce((s, v) => s + v, 0) / a.length) : null);
    view.querySelector('.stats-grid').innerHTML = `
      <div class="card"><h3 class="card-sub">Tamaños</h3><p class="big-num">${list.length} <small>lances</small></p>
        <p>Largo promedio: <b>${avg(sizes) ? avg(sizes).toFixed(1).replace('.', ',') + ' cm' : '—'}</b> · máximo <b>${sizes.length ? Math.max(...sizes).toString().replace('.', ',') + ' cm' : '—'}</b></p>
        <p>Peso promedio: <b>${avg(weights) ? avg(weights).toFixed(2).replace('.', ',') + ' kg' : '—'}</b> · máximo <b>${weights.length ? Math.max(...weights).toString().replace('.', ',') + ' kg' : '—'}</b></p></div>
      ${bars('Por especie', by((e) => e.speciesName || 'Otra'))}
      ${bars('Por fase de marea', by((e) => e.tide?.phase))}
      ${bars('Por fase lunar', by((e) => e.moon))}
      ${bars('Por mes', by((e) => MONTH_ABBR[parts(e.t).m - 1]))}`;
  }

  f.addEventListener('submit', async (ev) => {
    ev.preventDefault();
    const fd = new FormData(f);
    const t = parseLocal(fd.get('when'));
    const spot = getSpot(fd.get('spot'));
    let tide = null;
    if (spot.tide?.port && hasOfficial(t)) {
      try {
        const events = await eventsFor(spot.tide.port, t - DAY, t + DAY);
        const hgt = heightAt(events, t);
        const stt = stateAt(events, t);
        const info = portInfo(spot);
        if (hgt != null && stt) tide = { h: Math.round(hgt * 100) / 100, label: stt.label, phase: stt.rising ? 'Creciente' : 'Bajante', source: `SHN, ${info.port.name}${spot.tide.kind === 'aproximacion' ? ' (aproximación)' : ''}` };
      } catch { tide = null; }
    }
    const pt = spotPoint(spot);
    const moon = moonDay(dayKey(t), pt.lat, pt.lon).name;
    const speciesId = fd.get('species');
    const photo = fd.get('photo');
    const entry = {
      t, spot: spot.id, species: speciesId || null, speciesName: speciesId ? getSpecies(speciesId).name : null,
      bait: fd.get('bait')?.trim() || null, length: fd.get('length') ? Number(fd.get('length')) : null,
      weight: fd.get('weight') ? Number(fd.get('weight')) : null, notes: fd.get('notes')?.trim() || null, tide, moon,
    };
    let id = editing;
    if (editing) { catchLog.update(editing, entry); }
    else { const saved = catchLog.add(entry); id = saved?.id; if (!saved) { toast('No se pudo guardar: el almacenamiento del navegador no está disponible'); return; } }
    if (photo && photo.size) {
      try { await photos.put(id, photo); catchLog.update(id, { hasPhoto: true }); } catch { toast('El lance se guardó, pero la foto no'); }
    }
    toast(editing ? 'Lance actualizado' : 'Lance guardado');
    resetForm();
    draw();
  });

  view.querySelector('.entries').addEventListener('click', (e) => {
    const li = e.target.closest('li');
    if (e.target.closest('[data-del]')) { li.querySelector('.del-confirm').hidden = false; li.querySelector('[data-del-ok]').focus(); return; }
    if (e.target.closest('[data-del-no]')) { li.querySelector('.del-confirm').hidden = true; return; }
    const ok = e.target.closest('[data-del-ok]');
    if (ok) { catchLog.remove(ok.dataset.delOk); photos.remove(ok.dataset.delOk); toast('Lance borrado'); draw(); return; }
    const ed = e.target.closest('[data-edit]');
    if (ed) {
      const x = catchLog.all().find((y) => y.id === ed.dataset.edit);
      editing = x.id;
      const p = parts(x.t);
      f.when.value = `${dayKey(x.t)}T${String(p.h).padStart(2, '0')}:${String(p.mi).padStart(2, '0')}`;
      f.spot.value = x.spot; f.species.value = x.species || ''; f.bait.value = x.bait || '';
      f.length.value = x.length ?? ''; f.weight.value = x.weight ?? ''; f.notes.value = x.notes || '';
      view.querySelector('.submit-label').textContent = 'Guardar cambios';
      view.querySelector('.cancel-edit').hidden = false;
      f.scrollIntoView({ behavior: 'smooth' }); f.when.focus({ preventScroll: true });
    }
  });
  view.querySelector('#exp').onclick = () => {
    const blob = new Blob([JSON.stringify({ app: 'marea-chubut', exported: new Date().toISOString(), entries: catchLog.all(), favorites: favorites.all() }, null, 1)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `bitacora-${dayKey(now())}.json`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  };
  view.querySelector('#imp').onchange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const d = JSON.parse(await file.text());
      if (!Array.isArray(d.entries)) throw new Error();
      const merged = [...d.entries, ...catchLog.all()].filter((x, i, arr) => arr.findIndex((y) => y.id === x.id) === i).sort((a, b) => b.t - a.t);
      catchLog.replaceAll(merged);
      toast(`Importados ${d.entries.length} lances (las fotos no se exportan)`);
      draw();
    } catch { toast('El archivo no es una bitácora válida'); }
  };
  draw();
}

/* ---------------- Normativa ---------------- */
export function renderRegs() {
  const R = DB.regulations;
  const L = R.license;
  const mr = R.mareaRoja;
  const view = editorial('Reglas', 'Normativa', 'Lo que dicen las normas oficiales, con enlace a cada una. Si algo no está publicado, lo decimos.', [
    { id: 'limites', title: 'Tallas, cupos y vedas', html: alertBox('No hay tallas ni cupos publicados', R.noLimitsNotice.t, { badgeHtml: badge(R.noLimitsNotice) }) },
    { id: 'permiso', title: 'Permiso de pesca de costa', html: `
      ${fact(L.required)}${fact(L.exempt)}
      <div class="fact"><div class="fact__k">Precio</div>${L.categories.map((c) => `<p class="big-num">${esc(c.price)} <small>${esc(c.name.toLowerCase())}</small></p>`).join('')}
        <p class="muted small">${esc(L.categoriesSrc.note)}</p>${badge(L.categoriesSrc)}</div>
      <div class="fact"><div class="fact__k">Cómo sacarlo</div><p>${esc(L.how.t)}</p>${badge(L.how)}
        <p style="margin-top:10px"><a class="btn btn--primary" href="${esc(L.how.url)}" target="_blank" rel="noopener">Abrir DINO en WhatsApp</a></p></div>
      ${L.otherCategories ? `<div class="fact"><p>${esc(L.otherCategories.t)} <a href="${esc(L.otherCategories.url)}" target="_blank" rel="noopener">Ver en el sitio oficial</a></p>${badge(L.otherCategories)}</div>` : ''}
      ${fact(L.notContinental)}` },
    { id: 'marea-roja', title: 'Marea roja', html: `${mr ? `<p>Estado oficial de vedas de moluscos: <a href="${esc(mr.url)}" target="_blank" rel="noopener">${esc(mr.url)}</a>.</p><p class="muted small">Última publicación verificada: ${esc(mr.lastUpdateText)}. Las vedas cambian seguido: revisá el sitio oficial antes de juntar carnada.</p>${badge(mr)}` : ''}
      ${R.rules.filter((r) => r.id.startsWith('veda') || r.id === 'toxina').map((r) => (r.level === 'alert' ? alertBox(r.title, r.t, { badgeHtml: badge(r) }) : `<div class="fact"><b>${esc(r.title)}</b><p>${esc(r.t)}</p>${badge(r)}</div>`)).join('')}` },
    { id: 'reglas', title: 'Especies protegidas y áreas', html: R.rules.filter((r) => !r.id.startsWith('veda') && r.id !== 'toxina').map((r) => (r.level === 'alert'
      ? alertBox(r.title, r.t, { badgeHtml: badge(r) })
      : `<div class="fact"><b>${esc(r.title)}</b><p>${esc(r.t)}</p>${badge(r)}</div>`)).join('') },
    { id: 'autoridad', title: 'Autoridad', html: `<p><b>${esc(R.authority.name)}</b> · ${esc(R.authority.address)} · ${R.authority.phones.map((p) => `<a href="tel:${p.replace(/\D/g, '')}">${esc(p)}</a>`).join(' / ')}</p>
      <a href="${esc(R.authority.url)}" target="_blank" rel="noopener">${esc(R.authority.url)}</a> ${badge(R.authority)}` },
  ]);
  mount(view);
}

/* ---------------- Seguridad (M-13) ---------------- */
export function renderSafety() {
  const S = DB.safety;
  const verified = S.emergency.filter((e) => e.c === 'oficial' && !e.unconfirmed);
  const pending = S.emergency.filter((e) => !(e.c === 'oficial' && !e.unconfirmed));
  const view = editorial('Antes de salir', 'Seguridad', 'En esta costa la marea sube rápido y el viento manda.', [
    { id: 'emergencias', title: 'Emergencias', html: `<div class="call">${verified.map((e) => `<a class="${e.number === '106' ? 'primary' : ''}" href="tel:${e.number}"><b>${esc(e.display || e.number)}</b><span>${esc(e.label)}</span></a>`).join('')}</div>
      <p class="small" style="margin-top:8px">${badge({ c: 'oficial', s: [...new Set(verified.flatMap((e) => e.s))] })}</p>
      ${pending.length ? `<h3 class="card-sub" style="margin-top:18px">A confirmar</h3><ul class="list">${pending.map((e) => `<li><b>${esc(e.display || e.number)}</b> · ${esc(e.label)} <span class="tag">a confirmar</span> ${badge(e)}</li>`).join('')}</ul>` : ''}` },
    { id: 'ubicacion', title: 'Compartir mi ubicación', html: `<p>Toma tu posición con el GPS del teléfono (funciona sin datos móviles) y arma un mensaje para enviar por SMS o WhatsApp.</p>
      <button class="btn btn--signal" type="button" id="gps">${ICONS.pin}Obtener mi ubicación</button><div class="gps-out"></div>` },
    { id: 'aviso', title: 'Avisá a alguien a dónde vas', html: `<p>Armamos el mensaje con el spot, tu hora de regreso y la próxima pleamar. Lo mandás vos.</p>
      <div class="form form--2">
        <label class="field">Spot<select id="ws">${DB.spots.spots.map((s) => `<option value="${s.id}" ${s.id === appState.get().spotId ? 'selected' : ''}>${esc(s.name)}</option>`).join('')}</select></label>
        <label class="field">Vuelvo a las<input id="wt" type="time" value="${fmtTime(now() + 4 * 3600e3)}"></label>
      </div><button class="btn btn--primary" type="button" id="wsend" style="margin-top:12px">${ICONS.share}Compartir mi plan</button>` },
    { id: 'mareas', title: 'Mareas y viento', html: S.general.map((g) => fact(g)).join('') },
    { id: 'peligros', title: 'Peligros documentados', html: `<ul class="list">${S.hazards.map((x) => `<li>${x.singleSourceHazard ? '<span class="tag tag--dashed">Reporte de una sola fuente</span> ' : ''}<p style="margin:6px 0">${esc(x.t)}</p>${badge(x)}${x.spot ? ` <a href="#/spot/${x.spot}">Ver spot</a>` : ''}</li>`).join('')}</ul>` },
    { id: 'fauna', title: 'Fauna: distancias', html: S.wildlife.map((w) => fact(w)).join('') + (S.notes || []).map((n) => `<p class="assumption">${esc(n)}</p>`).join('') },
  ]);
  mount(view);

  const share = async (text) => {
    if (navigator.share) { try { await navigator.share({ text }); return; } catch { /* cancelled */ } }
    try { await navigator.clipboard.writeText(text); toast('Mensaje copiado: pegalo en tu chat'); } catch { openModal(`<h2>Tu mensaje</h2><p>${esc(text)}</p>`, { label: 'Mensaje' }); }
  };
  view.querySelector('#gps').onclick = () => {
    const out = view.querySelector('.gps-out');
    if (!navigator.geolocation) { out.innerHTML = '<p class="nodata">Tu dispositivo no permite obtener la ubicación.</p>'; return; }
    out.innerHTML = '<p class="muted">Buscando señal GPS…</p>';
    navigator.geolocation.getCurrentPosition((pos) => {
      const { latitude: la, longitude: lo, accuracy } = pos.coords;
      const coords = `${la.toFixed(5)}, ${lo.toFixed(5)}`;
      const text = `Estoy en ${coords} (precisión ±${Math.round(accuracy)} m), ${fmtDate(now())} ${fmtTime(now())} h. Mapa: https://www.openstreetmap.org/?mlat=${la.toFixed(5)}&mlon=${lo.toFixed(5)}#map=15/${la.toFixed(5)}/${lo.toFixed(5)}`;
      const enc = encodeURIComponent(text);
      out.innerHTML = `<p class="big-num">${coords}</p><p class="muted small">Precisión ±${Math.round(accuracy)} m</p>
        <div class="row"><a class="btn btn--primary" href="sms:?&body=${enc}">Enviar por SMS</a><a class="btn" href="https://wa.me/?text=${enc}" target="_blank" rel="noopener">WhatsApp</a><button class="btn btn--ghost" type="button" id="gps-share">Más opciones</button></div>
        <p class="muted small">Sin señal de datos, el SMS puede salir igual si hay señal de voz. En emergencias náuticas llamá al 106.</p>`;
      out.querySelector('#gps-share').onclick = () => share(text);
    }, (err) => { out.innerHTML = `<p class="nodata">No se pudo obtener la ubicación (${esc(err.message || 'permiso denegado')}).</p>`; }, { enableHighAccuracy: true, timeout: 30000, maximumAge: 60000 });
  };
  view.querySelector('#wsend').onclick = async () => {
    const spot = getSpot(view.querySelector('#ws').value);
    const back = view.querySelector('#wt').value;
    let tideTxt = '';
    if (spot.tide?.port && hasOfficial(now())) {
      try {
        const events = await eventsFor(spot.tide.port, now(), now() + DAY);
        const nextH = events.find((e) => e.type === 'H' && e.t > now());
        if (nextH) tideTxt = ` Próxima pleamar: ${fmtTime(nextH.t)} (${fmtM(nextH.h)} m, SHN).`;
      } catch { /* message without tide */ }
    }
    const pt = spot.coords ? ` Ubicación de referencia: ${spot.coords.lat.toFixed(5)}, ${spot.coords.lon.toFixed(5)}.` : '';
    share(`Me voy a pescar a ${spot.name} (${spot.locality}). Pienso volver a las ${back} h.${tideTxt}${pt} Si no tenés noticias mías, llamá al 106 (Prefectura).`);
  };
}

/* ---------------- Guía de liberación y nudos ---------------- */
export function renderGuide() {
  const G = DB.guide || { releaseGuide: [], knots: [] };
  const view = editorial('Devolución', 'Liberar tiburones y rayas', 'Varias especies de esta costa están amenazadas y el gatopardo está protegido por ley. Así se las devuelve vivas, según las fuentes.', [
    { id: 'pasos', title: 'Paso a paso', html: G.releaseGuide.length ? `<ol class="steps">${G.releaseGuide.map((s) => `<li><p>${esc(s.t)}</p>${badge(s)}</li>`).join('')}</ol>` : `<p>${noData()}</p>` },
    { id: 'aparejos', title: 'Aparejos de costa verificados', html: rigsHtml() },
    { id: 'nudos', title: 'Nudos', html: G.knots.length ? `<div class="knots">${G.knots.map((k) => `<figure class="card knot">${k.image?.file ? `<img src="${esc(k.image.file)}" alt="Diagrama del nudo ${esc(k.name)}" loading="lazy">` : ''}<figcaption><b>${esc(k.name)}</b><p>${esc(k.t)}</p>${badge(k)}${k.image ? `<p class="credit">Diagrama: ${esc(k.image.author || '')} · ${esc(k.image.license || '')} · <a href="${esc(k.image.commonsPage)}" target="_blank" rel="noopener">Wikimedia Commons</a></p>` : ''}</figcaption></figure>`).join('')}</div>` : `<p>${noData('Sin nudos documentados en fuentes de pesca de costa de Chubut')}</p>` },
  ]);
  mount(view);
}

function rigsHtml() {
  const items = DB.species.species.filter((s) => s.rigShore && Object.values(s.rigShore).some(Boolean));
  if (!items.length) return `<p>${noData()}</p>`;
  return items.map((s) => {
    const r = s.rigShore;
    const parts2 = [['type', 'Aparejo'], ['hook', 'Anzuelo'], ['line', 'Línea'], ['rod', 'Caña'], ['sinker', 'Plomo']];
    return `<div class="card rig-card"><h3 class="card-sub"><a href="#/especie/${s.id}">${esc(s.name)}</a></h3>
      <svg class="rig-diagram" viewBox="0 0 220 120" role="img" aria-label="Esquema genérico de aparejo de fondo: línea madre, brazoladas con anzuelo y plomo al final">
        <line x1="110" y1="4" x2="110" y2="100" stroke="currentColor" stroke-width="2"/>
        ${r.hook ? '<line x1="110" y1="40" x2="150" y2="48" stroke="currentColor" stroke-width="1.5"/><path d="M150 48 q8 2 6 10 q-2 6 -8 2" fill="none" stroke="var(--signal)" stroke-width="2"/>' : ''}
        ${r.sinker ? '<path d="M100 100 L120 100 L110 116 Z" fill="var(--mist)"/>' : ''}
        <text x="116" y="14" font-size="10" fill="currentColor">línea</text></svg>
      <ul class="rig">${parts2.map(([k, l]) => `<li><b>${l}:</b> ${r[k] ? `${esc(r[k].t)} ${badge(r[k])}` : noData()}</li>`).join('')}</ul>
      <p class="muted small">El esquema es genérico y solo ilustra las partes con dato verificado.</p></div>`;
  }).join('');
}

/* ---------------- Fuentes (M-12, H-13, L-11) ---------------- */
export function renderSources() {
  const S = DB.sources;
  const X = DB.excluded || { items: [] };
  const typeName = { oficial: 'Oficial', cientifico: 'Científico', local: 'Experiencia local y prensa', modelo: 'Modelo' };
  const view = editorial('Transparencia', 'Fuentes y datos excluidos', 'Cada dato de la app enlaza a estas fuentes. Lo que no pudimos verificar no está en la app: está listado abajo.', [
    { id: 'shn', title: 'Mareas: aviso sobre el SHN', html: `<div class="alert" role="note">${ICONS.info}<div><strong>Datos reproducidos del Servicio de Hidrografía Naval</strong><p>Las predicciones de marea se reproducen de las Tablas de Marea del SHN. El sitio del SHN indica «Todos los derechos reservados» y el permiso de redistribución está pendiente: esta app no está publicada.</p>${badge({ c: 'oficial', s: ['shn-tablas'] })}</div></div>` },
    { id: 'lista', title: 'Todas las fuentes', html: `<label class="field" style="max-width:520px"><span class="sr">Buscar fuente</span><input type="search" id="sq" placeholder="Buscar por título, organismo o dominio…"></label>
      ${Object.keys(typeName).map((t) => `<h3 class="card-sub" style="margin-top:18px">${typeName[t]}</h3><p class="muted small">${esc(S.types[t] || '')}</p>
      <ul class="list">${S.sources.filter((s) => s.type === t).map((s) => `<li data-q="${esc((s.title + ' ' + s.publisher + ' ' + s.url).toLowerCase())}"><b>${esc(s.title)}</b><div class="muted small">${esc(s.publisher)} · verificado el ${fmtDateShort(parseLocal(s.verified || S.verifiedDefault))}${s.status && s.status !== 200 ? ' · <span class="tag">enlace no confirmado</span>' : ''}</div>
        <a href="${esc(s.url)}" target="_blank" rel="noopener" class="small" style="word-break:break-word">${esc(s.url)}</a>${s.archivedUrl ? ` · <a href="${esc(s.archivedUrl)}" target="_blank" rel="noopener" class="small">copia archivada</a>` : ''}</li>`).join('')}</ul>`).join('')}` },
    { id: 'excluidos', title: 'Datos excluidos', html: X.items.length ? `<p class="muted">Lo que dejamos afuera y por qué. Incluye lo investigado y descartado.</p>
      ${[...new Set(X.items.map((i) => i.category))].map((cat) => `<h3 class="card-sub" style="margin-top:18px">${esc(cat)}</h3><ul class="list">${X.items.filter((i) => i.category === cat).map((i) => `<li><b>${esc(i.item)}</b><p style="margin:4px 0">${esc(i.reason)}</p>${i.consulted?.length ? `<p class="muted small">Consultado: ${i.consulted.map((c) => (source(c) ? esc(source(c).publisher) : `<a href="${esc(c)}" target="_blank" rel="noopener">${esc(c.replace(/^https?:\/\//, '').slice(0, 50))}</a>`)).join(' · ')}</p>` : ''}</li>`).join('')}</ul>`).join('')}` : `<p>${noData()}</p>` },
    { id: 'licencias', title: 'Licencias de contenido', html: '<p>Costa: © colaboradores de OpenStreetMap (ODbL) y Natural Earth (dominio público). Coordenadas de referencia: OpenStreetMap y Wikipedia. Viento y oleaje: Open-Meteo (CC BY 4.0). Imágenes: Wikimedia Commons e iNaturalist, con autor y licencia en cada ficha. Tipografías Fraunces e Inter (SIL OFL). Leaflet (BSD-2), SunCalc (BSD-2).</p>' },
  ]);
  mount(view);
  view.querySelector('#sq').addEventListener('input', (e) => {
    const q = e.target.value.trim().toLowerCase();
    view.querySelectorAll('li[data-q]').forEach((li) => { li.hidden = q && !li.dataset.q.includes(q); });
  });
}

/* ---------------- Ajustes ---------------- */
export function renderSettings() {
  const s = settings.get();
  const sp = DB.species.species.filter((x) => x.legal.status !== 'protegida');
  const seg = (name, opts, val) => `<div class="seg" role="group" data-set="${name}">${opts.map(([v, l]) => `<button type="button" data-v="${v}" aria-pressed="${String(v) === String(val)}">${l}</button>`).join('')}</div>`;
  const mins = [0, 30, 60, 90, 120, 180, 240];
  const w = s.window || { ref: '', before: 120, after: 60 };
  const view = editorial('Preferencias', 'Ajustes', 'Se guardan en este dispositivo.', [
    { id: 'tema', title: 'Tema', html: `${seg('theme', [['dark', 'Oscuro'], ['light', 'Sol de playa'], ['contrast', 'Alto contraste']], s.theme)}
      <label class="row check" style="margin-top:14px"><input type="checkbox" id="rm" ${s.reduceMotion ? 'checked' : ''}> Reducir movimiento</label>` },
    { id: 'ventana', title: 'Mi ventana de pesca', html: `<p class="muted">No encontramos datos verificados sobre la mejor fase de marea por especie. Definí la tuya y la app la resalta en naranja.</p>
      <div class="form form--2">
        <label class="field">Referencia<select id="wref"><option value="">Sin ventana</option><option value="H" ${w.ref === 'H' ? 'selected' : ''}>Pleamar</option><option value="L" ${w.ref === 'L' ? 'selected' : ''}>Bajamar</option></select></label><span></span>
        <label class="field">Desde (antes)<select id="wb">${mins.map((m) => `<option value="${m}" ${m === w.before ? 'selected' : ''}>${m ? (m / 60).toString().replace('.', ',') + ' h antes' : 'En el momento'}</option>`).join('')}</select></label>
        <label class="field">Hasta (después)<select id="wa">${mins.map((m) => `<option value="${m}" ${m === w.after ? 'selected' : ''}>${m ? (m / 60).toString().replace('.', ',') + ' h después' : 'En el momento'}</option>`).join('')}</select></label>
      </div>` },
    { id: 'especie', title: 'Especie objetivo', html: `<p class="muted">Se usa para el factor de temporada del índice de pesca.</p>
      <label class="field"><span class="sr">Especie</span><select id="tsp"><option value="">Ninguna</option>${sp.map((x) => `<option value="${x.id}" ${x.id === s.targetSpecies ? 'selected' : ''}>${esc(x.name)}</option>`).join('')}</select></label>` },
    { id: 'unidades', title: 'Unidades de viento', html: seg('windUnit', [['kmh', 'km/h'], ['kn', 'nudos']], s.windUnit) },
    { id: 'tablas', title: 'Tablas de marea cargadas', html: '<p class="muted tables-range">Calculando…</p>' },
  ]);
  mount(view);
  bundledRange(DB.tide_ports.reference[1].id).then((r) => {
    view.querySelector('.tables-range').innerHTML = r
      ? `Predicciones oficiales del SHN cargadas desde el ${fmtDateShort(r.from)} (${fmtTime(r.from)} h) hasta el ${fmtDateShort(r.to)} (${fmtTime(r.to)} h), según el puerto. Fuera de ese rango la app no muestra alturas oficiales. ${badge({ c: 'oficial', s: ['shn-tablas'] })}`
      : 'No se pudo leer el rango de las tablas.';
  }).catch(() => { view.querySelector('.tables-range').textContent = 'No se pudo leer el rango de las tablas.'; });
  view.addEventListener('click', (e) => {
    const b = e.target.closest('[data-set] button');
    if (!b) return;
    const group = b.closest('[data-set]');
    group.querySelectorAll('button').forEach((x) => x.setAttribute('aria-pressed', x === b));
    const next = settings.set({ [group.dataset.set]: b.dataset.v });
    if (group.dataset.set === 'theme') document.documentElement.dataset.theme = next.theme;
    toast('Guardado');
  });
  view.querySelector('#rm').onchange = (e) => {
    settings.set({ reduceMotion: e.target.checked });
    if (e.target.checked) document.documentElement.dataset.motion = 'reduce'; else delete document.documentElement.dataset.motion;
  };
  const saveWin = () => {
    const ref = view.querySelector('#wref').value;
    settings.set({ window: ref ? { ref, before: Number(view.querySelector('#wb').value), after: Number(view.querySelector('#wa').value) } : null });
    toast(ref ? 'Ventana guardada' : 'Ventana desactivada');
  };
  ['#wref', '#wb', '#wa'].forEach((id) => { view.querySelector(id).onchange = saveWin; });
  view.querySelector('#tsp').onchange = (e) => { settings.set({ targetSpecies: e.target.value || null }); toast('Guardado'); };
}
