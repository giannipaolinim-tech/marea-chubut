import { DB, species as getSpecies, source } from '../data.js';
import { $, h, esc, ICONS, MONTH_SHORT, MONTH_ABBR, observeReveal, prefersReducedMotion, currentMonth } from '../util.js';
import { badge, noData, iucnTag } from '../ui.js';

const GROUP = { 'óseo': 'Pez óseo', 'tiburón': 'Tiburón', 'quimera': 'Quimera', 'raya': 'Raya' };
const imagesOf = (sp) => (Array.isArray(sp.image) ? sp.image : [sp.image]).map((k) => ({ key: k, ...DB.images[k] })).filter((i) => i.file);

function monthsStrip(sp) {
  const nm = currentMonth();
  return `<div class="months" role="img" aria-label="Temporada por mes: ${sp.season.map((v, i) => (v ? MONTH_ABBR[i] : null)).filter(Boolean).join(', ') || 'sin dato verificado'}">${sp.season.map((v, i) => `<i class="${v || ''} ${sp.seasonKind === 'biologia' && v ? 'bio' : ''} ${i + 1 === nm ? 'now' : ''}"><span>${MONTH_SHORT[i]}</span></i>`).join('')}</div>`;
}

function picture(img, alt, { sizes = '(min-width: 720px) 33vw, 100vw', eager = false } = {}) {
  const base = img.file.replace(/\.jpg$/, '');
  return `<picture>
    <source type="image/webp" srcset="${base}-600.webp 600w, ${base}-1200.webp 1200w" sizes="${sizes}">
    <img src="${img.file}" alt="${esc(alt)}" ${eager ? '' : 'loading="lazy"'} decoding="async">
  </picture>`;
}

function credit(img) {
  return `${esc(img.author || 'Autor desconocido')} · ${esc(img.license || '')} · <a href="${esc(img.page)}" target="_blank" rel="noopener">${img.page?.includes('inaturalist') ? 'iNaturalist' : 'Wikimedia Commons'}</a>${img.place ? ` · ${esc(img.place)}` : ''}${img.caption ? ` · ${esc(img.caption)}` : ''}`;
}

const shoreSp = () => DB.species.species.filter((s) => s.modality?.v?.includes('costa'));

export function renderSpeciesList() {
  const main = $('#main');
  const view = h(`<div class="wrap">
    <h1 class="page-title">Especies</h1>
    <p class="page-lede">Especies verificadas como capturadas desde la costa de Chubut. Cada dato lleva su fuente; si no hay dato verificado, lo decimos.</p>
    <div class="row" style="margin:18px 0"><div class="seg" role="group" aria-label="Filtrar">
      <button type="button" aria-pressed="true" data-f="all">Todas</button>
      <button type="button" aria-pressed="false" data-f="now">En temporada ahora</button>
      <button type="button" aria-pressed="false" data-f="bait">Con carnada documentada</button></div></div>
    <div class="species-grid"></div>
    <section class="card" style="margin-bottom:30px"><h2 class="card-title">Fuera de esta app</h2>
      <ul class="list">${DB.species.excluded.map((x) => `<li><b>${esc(x.name)}</b> ${x.sci ? `<em class="muted">${esc(x.sci)}</em>` : ''}<p style="margin:4px 0">${esc(x.reason)}</p>${x.s.length ? badge({ c: source(x.s[0])?.type || 'cientifico', s: x.s }) : ''}</li>`).join('')}</ul></section>
  </div>`);
  main.append(view);
  const grid = view.querySelector('.species-grid');
  const draw = (f) => {
    const nm = currentMonth();
    const items = shoreSp().filter((sp) => f === 'all' || (f === 'now' ? !!sp.season[nm - 1] : sp.baits.length));
    grid.innerHTML = items.map((sp) => {
      const img = imagesOf(sp)[0];
      return `<a class="sp-card reveal" href="#/especie/${sp.id}">
        ${img ? picture(img, `${sp.name} (${sp.sci})`) : ''}
        ${sp.legal.status === 'protegida' ? '<span class="flag flag-protegida">Protegida</span>' : ''}
        <div class="sp-card__body"><span class="eyebrow on-image">${esc(GROUP[sp.group] || '')}</span>
          <h2>${esc(sp.name)}</h2><em>${esc(sp.sci)}</em>${monthsStrip(sp)}</div></a>`;
    }).join('') || `<p>${noData('Ninguna especie cumple el filtro')}</p>`;
    observeReveal(grid);
  };
  view.querySelector('.seg').addEventListener('click', (e) => {
    const b = e.target.closest('button');
    if (!b) return;
    view.querySelectorAll('.seg button').forEach((x) => x.setAttribute('aria-pressed', x === b));
    draw(b.dataset.f);
  });
  draw('all');
}

const row = (label, value) => `<dt>${esc(label)}</dt><dd>${value}</dd>`;
const factOr = (f, empty = 'Sin dato verificado') => (f ? `${esc(f.t)} ${badge(f)}` : noData(empty));

export function renderSpecies(id) {
  const sp = getSpecies(id);
  const main = $('#main');
  if (!sp) { main.innerHTML = '<div class="wrap section"><h1>Especie no encontrada</h1><p><a href="#/especies">Volver</a></p></div>'; return; }
  const imgs = imagesOf(sp);
  const spots = DB.spots.spots.filter((s) => s.species.includes(sp.id) || (s.speciesByMonth || []).some((r) => r.species === sp.id));
  const baits = sp.baits.length
    ? `<ol>${[...sp.baits].sort((a, b) => (a.rank ?? 99) - (b.rank ?? 99)).map((b) => `<li>${esc(b.t)} ${badge(b)}</li>`).join('')}</ol><p class="muted small">${esc(sp.rankBasis || 'Orden de mención en las fuentes.')}</p>`
    : noData();
  const lures = sp.lures.length ? sp.lures.map((b) => `${esc(b.t)} ${badge(b)}`).join('<br>') : noData();
  const rs = sp.rigShore || {};
  const rig = ['type', 'hook', 'line', 'rod', 'sinker'].some((k) => rs[k])
    ? `<ul class="rig">${[['type', 'Aparejo'], ['hook', 'Anzuelo'], ['line', 'Línea'], ['rod', 'Caña'], ['sinker', 'Plomo']].map(([k, l]) => `<li><b>${l}:</b> ${factOr(rs[k])}</li>`).join('')}</ul>`
    : noData();
  const seasonTxt = sp.seasonSrc ? `${monthsStrip(sp)}
      <p style="margin:6px 0">${esc(sp.seasonSrc.note || '')}</p>${badge(sp.seasonSrc)}${sp.seasonKind === 'biologia' ? '<p class="muted small">Presencia según la biología de la especie, no una temporada de pesca.</p>' : ''}` : noData();
  const legal = sp.legal.status === 'protegida'
    ? `<div class="alert alert--danger"><span>${ICONS.alert}</span><div><strong>Protegida: no se puede capturar</strong><p>${esc(sp.legal.t)}</p>${badge(sp.legal)} <a href="#/guia">Cómo liberarla</a></div></div>`
    : sp.legal.status !== 'consultar' && sp.legal.t
      ? `<p style="margin:0 0 6px">${esc(sp.legal.t)}</p>${badge(sp.legal)}`
      : `<p style="margin:0 0 6px"><b>Consultar normativa vigente.</b> No hay talla mínima, cupo ni veda publicados para esta especie en la pesca marítima recreativa de Chubut.</p>
       <a href="${esc(DB.regulations.authority.url)}" target="_blank" rel="noopener">Secretaría de Pesca del Chubut</a> · <a href="#/normativa">Normativa</a> ${badge(DB.regulations.noLimitsNotice)}`;
  const hero = imgs[0];

  const view = h(`<article>
    <header class="sp-hero">
      ${hero ? picture(hero, `${sp.name} (${sp.sci})`, { sizes: '100vw', eager: true }) : ''}
      <a class="btn btn--sm back" href="#/especies">${ICONS.back}Especies</a>
      <div class="wrap">
        <span class="eyebrow on-image">${esc(GROUP[sp.group] || '')}${sp.altNames ? ' · ' + esc(sp.altNames) : ''}</span>
        <h1>${esc(sp.name)}</h1><em>${esc(sp.sci)}</em>
        ${sp.legal.status === 'protegida' ? '<div style="margin-top:12px"><span class="flag-protegida">Protegida · Ley XI Nº 93</span></div>' : ''}
      </div>
    </header>
    <div class="wrap editorial">
      <aside class="card ficha reveal">
        <h2 class="card-title">Ficha técnica</h2>
        <dl>
          ${row('Se pesca desde', sp.modality ? `${esc(sp.modality.v.join(' · '))} ${badge(sp.modality)}` : noData())}
          ${row('Temporada en Chubut', seasonTxt)}
          ${row('Carnadas', baits)}
          ${row('Señuelos', lures)}
          ${row('Aparejo de costa', rig)}
          ${row('Mejor marea', factOr(sp.bestTide))}
          ${sp.tideNote ? row('Observación de marea', factOr(sp.tideNote)) : ''}
          ${row('Mejor hora', factOr(sp.bestHours))}
          ${row('Distancia de lance', factOr(sp.castingDistance))}
          ${row('Conservación', sp.iucn ? `${iucnTag(sp.iucn)}${sp.iucn.note ? `<br><small class="muted">${esc(sp.iucn.note)}</small>` : ''} ${badge({ c: source(sp.iucn.s[0])?.type || 'cientifico', s: sp.iucn.s })}` : noData())}
        </dl>
        <p class="legend-inline"><span class="badge badge--oficial">Oficial</span> <span class="badge badge--cientifico">Científico</span> <span class="badge badge--local">2+ fuentes</span> <span class="badge badge--unica">Fuente única</span></p>
      </aside>
      <div>
        ${sp.lede ? `<p class="lede reveal">${esc(sp.lede.t)} ${badge(sp.lede)}</p>` : ''}
        <section class="reveal" style="margin-bottom:22px"><h2 class="card-title">En Chubut</h2><p style="font-size:18px">${factOr(sp.chubut)}</p></section>
        <section class="grid grid-2 reveal">
          <div class="card"><h3 class="card-sub">Cómo reconocerlo</h3><p>${factOr(sp.id_tips)}</p></div>
          <div class="card"><h3 class="card-sub">Tamaño</h3><p>${factOr(sp.size)}</p></div>
          <div class="card"><h3 class="card-sub">Hábitat y profundidad</h3><p>${factOr(sp.habitat)}</p></div>
          <div class="card"><h3 class="card-sub">Estado legal</h3>${legal}</div>
          ${sp.release ? `<div class="card"><h3 class="card-sub">Devolución</h3><p>${factOr(sp.release)}</p></div>` : ''}
          ${sp.decline ? `<div class="card"><h3 class="card-sub">Tendencia</h3><p>${factOr(sp.decline)}</p></div>` : ''}
          ${sp.danger ? `<div class="card"><h3 class="card-sub">Precaución</h3><p>${factOr(sp.danger)}</p></div>` : ''}
          ${sp.food ? `<div class="card"><h3 class="card-sub">En la cocina</h3><p>${factOr(sp.food)}</p></div>` : ''}
        </section>
        ${sp.group === 'tiburón' || sp.group === 'raya' ? '<p class="reveal" style="margin-top:16px"><a class="btn btn--sm" href="#/guia">Guía de liberación de tiburones y rayas</a></p>' : ''}
        ${sp.sciNote ? `<p class="muted reveal" style="margin-top:18px">${esc(sp.sciNote.t || sp.sciNote)} ${sp.sciNote.c ? badge(sp.sciNote) : ''}</p>` : ''}
        <section class="reveal" style="margin:22px 0"><h2 class="card-title">Spots donde está verificada</h2>
          <div class="row" style="gap:8px;margin-top:8px">${spots.length ? spots.map((s) => `<a class="chip" href="#/spot/${s.id}">${esc(s.name)}</a>`).join('') : noData('Ningún spot con esta especie verificada')}</div></section>
        ${imgs.length > 1 ? `<section class="gallery reveal"><h2 class="card-title">Especies del grupo</h2><div class="gallery__grid">${imgs.map((i) => `<figure>${picture(i, i.caption || sp.name, { sizes: '(min-width:720px) 33vw, 50vw' })}<figcaption>${esc(i.caption || '')}<br><span class="credit">${credit(i)}</span></figcaption></figure>`).join('')}</div></section>` : ''}
        ${hero ? `<p class="credit">Imagen: ${credit(hero)}</p>` : ''}
      </div>
    </div>
  </article>`);
  main.append(view);
  observeReveal(view);
  const heroImg = view.querySelector('.sp-hero img');
  if (heroImg && !prefersReducedMotion()) {
    const onScroll = () => { heroImg.style.transform = `translateY(${Math.min(120, window.scrollY * 0.25)}px)`; };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }
}
