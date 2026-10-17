import { DB } from '../data.js';
import { $, h, esc, MONTH_SHORT, MONTH_ABBR, prefersReducedMotion, currentMonth } from '../util.js';
import { openSources, openModal } from '../ui.js';

export function renderCalendar() {
  const main = $('#main');
  const nm = currentMonth();
  const list = DB.species.species.filter((s) => s.legal.status !== 'protegida' && s.modality?.v?.includes('costa'));
  const withData = list.filter((s) => s.seasonSrc);
  const without = list.filter((s) => !s.seasonSrc);
  let k = 0;
  const cell = (sp, v, i) => {
    const has = !!sp.seasonSrc;
    const bio = sp.seasonKind === 'biologia';
    const cls = !has ? 'nd' : v === 'p' ? 'p' : v === 's' ? (bio ? 'bio' : 's') : 'out';
    const label = !has ? 'sin dato verificado' : v === 'p' ? 'pico' : v === 's' ? (bio ? 'presencia según biología' : 'temporada') : 'fuera de temporada documentada';
    const delay = prefersReducedMotion() ? 0 : (k++) * 10;
    return `<td class="${cls} ${i + 1 === nm ? 'now' : ''}"><button type="button" class="cell-in" style="animation-delay:${delay}ms" data-sp="${sp.id}" aria-label="${esc(sp.name)}, ${MONTH_ABBR[i]}: ${label}"><span aria-hidden="true">${v === 'p' ? '●' : ''}</span></button></td>`;
  };
  const rowsFor = (arr) => arr.map((sp) => `<tr><th scope="row"><a href="#/especie/${sp.id}">${esc(sp.name)}</a></th>${sp.season.map((v, i) => cell(sp, v, i)).join('')}</tr>`).join('');
  const view = h(`<div class="wrap">
    <h1 class="page-title">Calendario</h1>
    <p class="page-lede">Temporada por especie y mes en la costa, solo con datos que tienen fuente. Tocá una celda para ver de dónde sale el dato. Las temporadas propias de un spot están en la ficha de cada spot.</p>
    <div class="legend">
      <span><i class="lg lg--p"></i>Pico</span><span><i class="lg lg--s"></i>Temporada</span>
      <span><i class="lg lg--bio"></i>Presencia según biología</span>
      <span><i class="lg lg--out"></i>Fuera de temporada documentada</span>
      <span><i class="lg lg--nd"></i>Sin dato verificado</span>
    </div>
    <div class="card heat-wrap" tabindex="0" aria-label="Tabla de temporadas; deslizá horizontalmente en pantallas chicas">
      <table class="heat"><caption class="sr">Temporada por especie y mes</caption>
        <thead><tr><th scope="col"><span class="sr">Especie</span></th>${MONTH_SHORT.map((m, i) => `<th scope="col" class="${i + 1 === nm ? 'now' : ''}"><abbr title="${MONTH_ABBR[i]}">${m}</abbr></th>`).join('')}</tr></thead>
        <tbody>${rowsFor(withData)}${rowsFor(without)}</tbody></table>
    </div>
    <p class="muted small" style="margin:14px 0 30px">El gatopardo no figura: está protegido y no se puede capturar. Las celdas «sin dato» no significan que no haya peces: significan que no encontramos una fuente que lo respalde.</p>
  </div>`);
  main.append(view);
  view.querySelector('.heat').addEventListener('click', (e) => {
    const b = e.target.closest('button[data-sp]');
    if (!b) return;
    const sp = DB.speciesMap[b.dataset.sp];
    if (sp.seasonSrc) openSources(sp.seasonSrc.s, sp.seasonSrc.c);
    else openModal(`<h2>${esc(sp.name)}</h2><p>Sin dato verificado de temporada para esta especie en la costa de Chubut.</p>`, { label: 'Sin dato' });
  });
}
