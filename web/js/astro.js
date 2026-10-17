// Sun and moon, computed astronomically with SunCalc (bundled in vendor/).
import { dayStart, HOUR } from './util.js';

const SC = () => window.SunCalc;

export function sunDay(key, lat, lon) {
  const noon = new Date(dayStart(key) + 12 * HOUR);
  const t = SC().getTimes(noon, lat, lon);
  const ok = (d) => (d instanceof Date && !Number.isNaN(d.getTime()) ? d.getTime() : null);
  return {
    sunrise: ok(t.sunrise),
    sunset: ok(t.sunset),
    goldenAm: ok(t.goldenHourEnd),
    goldenPm: ok(t.goldenHour),
    dawn: ok(t.dawn),
    dusk: ok(t.dusk),
  };
}

const PHASES = [
  [0.0, 'Luna nueva'], [0.03, 'Luna creciente'], [0.22, 'Cuarto creciente'], [0.28, 'Gibosa creciente'],
  [0.47, 'Luna llena'], [0.53, 'Gibosa menguante'], [0.72, 'Cuarto menguante'], [0.78, 'Luna menguante'], [0.97, 'Luna nueva'],
];

export function moonDay(key, lat, lon) {
  const noon = new Date(dayStart(key) + 12 * HOUR);
  const ill = SC().getMoonIllumination(noon);
  const times = SC().getMoonTimes(noon, lat, lon);
  let name = PHASES[0][1];
  for (const [p, n] of PHASES) if (ill.phase >= p) name = n;
  // Syzygy (new/full moon) favours spring tides; quadrature favours neap tides.
  const dSyzygy = Math.min(ill.phase, Math.abs(ill.phase - 0.5), 1 - ill.phase);
  const dQuad = Math.min(Math.abs(ill.phase - 0.25), Math.abs(ill.phase - 0.75));
  const regime = dSyzygy <= 0.07 ? 'sicigia' : dQuad <= 0.07 ? 'cuadratura' : null;
  return {
    phase: ill.phase,
    fraction: ill.fraction,
    name,
    regime,
    rise: times.rise ? times.rise.getTime() : null,
    set: times.set ? times.set.getTime() : null,
  };
}

/** Small SVG of the lit portion of the moon (southern-hemisphere view: lit side mirrored). */
export function moonSvg(phase, name = 'Fase lunar', fraction = null) {
  const r = 20;
  const k = Math.cos(2 * Math.PI * phase); // 1 new, -1 full
  const waxing = phase < 0.5;
  const rx = Math.abs(k) * r;
  // Southern hemisphere: waxing moon is lit on the left.
  const litLeft = waxing;
  const sweepOuter = litLeft ? 0 : 1;
  const sweepInner = (k > 0) === litLeft ? 1 : 0;
  const d = `M22 2 A${r} ${r} 0 0 ${sweepOuter} 22 42 A${rx} ${r} 0 0 ${sweepInner} 22 2Z`;
  return `<svg class="moon" viewBox="0 0 44 44" role="img" aria-label="${name}${fraction != null ? `, ${Math.round(fraction * 100)} % iluminada` : ''}"><circle cx="22" cy="22" r="20" fill="var(--deep-2)" stroke="var(--current)"/><path d="${d}" fill="var(--foam)"/></svg>`;
}
