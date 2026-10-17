// Shared UI pieces: source badges, fact blocks, modals.
import { DB, source } from './data.js';
import { esc, h, $, ICONS, fmtDateShort, parseLocal } from './util.js';

const CONF_LABEL = { oficial: 'Oficial', cientifico: 'Científico', local: 'Exp. local', unica: 'Fuente única', modelo: 'Modelo, no oficial' };

/** Badge for a fact {c, s}. Clicking opens the list of sources. */
export function badge(fact, extra = '') {
  if (!fact || !fact.c) return '';
  const ids = fact.s || [];
  const first = ids.length ? source(ids[0]) : null;
  let label = first ? first.publisher.split(' (')[0].split(',')[0] : '';
  if (fact.c === 'local' && ids.length > 1) label = `${ids.length} fuentes`;
  if (fact.c === 'unica') label = 'reporte de una sola fuente';
  const verified = DB.sources.verifiedDefault;
  const title = `${CONF_LABEL[fact.c]}${label ? ' · ' + label : ''} · verificado ${fmtDateShort(parseLocal(verified))}`;
  return `<button type="button" class="badge badge--${fact.c}" data-src="${esc(ids.join(','))}" data-conf="${fact.c}" title="${esc(title)}" aria-label="Fuente: ${esc(title)}">${CONF_LABEL[fact.c]}${label && fact.c !== 'unica' ? ` <small>· ${esc(label.length > 26 ? label.slice(0, 24) + '…' : label)}</small>` : ''}${extra}</button>`;
}

export function modelBadge() {
  return `<button type="button" class="badge badge--modelo" data-src="open-meteo" data-conf="modelo">Modelo, no oficial <small>· Open-Meteo</small></button>`;
}

export function fact(f, key) {
  if (!f) return '';
  return `<div class="fact">${key ? `<div class="fact__k">${esc(key)}</div>` : ''}<p>${esc(f.t)}</p>${badge(f)}</div>`;
}

export const noData = (txt = 'Sin dato verificado') => `<span class="nodata">${esc(txt)}</span>`;

export function alertBox(title, body, { danger = false, badgeHtml = '' } = {}) {
  return `<div class="alert ${danger ? 'alert--danger' : ''}" role="${danger ? 'alert' : 'note'}">${ICONS.alert}<div><strong>${esc(title)}</strong><p>${esc(body)}</p>${badgeHtml}</div></div>`;
}

const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/** Keep Tab / Shift+Tab inside `container`. Returns a cleanup function. */
export function trapFocus(container, onEscape) {
  const onKey = (e) => {
    if (e.key === 'Escape' && onEscape) { e.preventDefault(); onEscape(); return; }
    if (e.key !== 'Tab') return;
    const items = [...container.querySelectorAll(FOCUSABLE)].filter((el) => el.offsetParent !== null || el === document.activeElement);
    if (!items.length) return;
    const first = items[0];
    const last = items[items.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  };
  document.addEventListener('keydown', onKey);
  return () => document.removeEventListener('keydown', onKey);
}

export function openModal(innerHtml, { label = 'Detalle' } = {}) {
  const root = $('#modal-root');
  const prev = document.activeElement;
  const node = h(`<div class="modal-backdrop"><div class="modal" role="dialog" aria-modal="true" aria-label="${esc(label)}">
    <button class="icon-btn close" type="button" aria-label="Cerrar">${ICONS.close}</button>${innerHtml}</div></div>`);
  let release = () => {};
  const close = () => { release(); node.remove(); if (prev && document.contains(prev)) prev.focus(); };
  node.addEventListener('click', (e) => { if (e.target === node || e.target.closest('.close')) close(); });
  root.append(node);
  release = trapFocus(node.querySelector('.modal'), close);
  node.querySelector('.close').focus();
  return { node, close };
}

export function openSources(ids, conf) {
  const items = ids.map((id) => source(id)).filter(Boolean);
  const explain = {
    oficial: 'Dato de una norma, organismo público, municipio, Prefectura, SHN o IUCN.',
    cientifico: 'Dato de literatura científica, tesis, FishBase o fichas de investigadores del CENPAT-CONICET.',
    local: 'Experiencia local: al menos dos fuentes independientes coinciden.',
    unica: 'Reporte de una sola fuente. Se muestra solo porque advierte un riesgo o aporta contexto, y no cuenta como dato verificado.',
    modelo: 'Pronóstico de un modelo numérico. No es una fuente oficial.',
  }[conf] || '';
  const body = items.length
    ? items.map((s) => `<div class="src-item"><span class="badge badge--${s.type === 'modelo' ? 'modelo' : s.type}">${CONF_LABEL[s.type] || s.type}</span>
        <p style="margin:6px 0 2px"><b>${esc(s.title)}</b></p><p class="muted" style="margin:0 0 4px">${esc(s.publisher)}</p>
        <a href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.url)}</a>
        <p class="muted" style="margin:4px 0 0;font-size:13px">Verificado el ${fmtDateShort(parseLocal(s.verified || DB.sources.verifiedDefault))}</p></div>`).join('')
    : '<p class="muted">Sin fuente que respalde este dato: por eso está rotulado.</p>';
  openModal(`<h2>Fuente${items.length > 1 ? 's' : ''}</h2><p class="muted">${esc(explain)}</p>${body}`, { label: 'Fuentes del dato' });
}

// Delegated handler for every badge in the app.
document.addEventListener('click', (e) => {
  const b = e.target.closest('.badge[data-src]');
  if (!b) return;
  e.preventDefault();
  e.stopPropagation();
  openSources(b.dataset.src ? b.dataset.src.split(',').filter(Boolean) : [], b.dataset.conf);
});

export function iucnTag(iucn) {
  if (!iucn) return '';
  const names = { CR: 'En peligro crítico', EN: 'En peligro', VU: 'Vulnerable', NT: 'Casi amenazada', LC: 'Preocupación menor', DD: 'Datos insuficientes', NE: 'No evaluada' };
  return `<span class="iucn"><b class="${iucn.cat}">${iucn.cat}</b> IUCN · ${names[iucn.cat] || ''}</span>`;
}
