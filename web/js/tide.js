// Official SHN tide predictions: loading, secondary-port corrections, interpolation and day statistics.
import { DB, port as getPort } from './data.js';
import { parseLocal, parts, dayStart, dayKey, DAY, MIN, HOUR } from './util.js';

const yearCache = new Map(); // `${code}-${year}` -> Promise<events|null>

function loadYear(code, year) {
  const key = `${code}-${year}`;
  if (yearCache.has(key)) return yearCache.get(key);
  const ref = getPort(code);
  const file = ref?.files?.[String(year)];
  if (!file) return Promise.resolve(null);
  const p = fetch(file)
    .then((r) => {
      if (!r.ok) throw new Error(`No se pudo cargar la tabla de marea (${r.status})`);
      return r.json();
    })
    .then((d) => d.events.map(([t, h, type]) => ({ t: parseLocal(t), h, type })));
  // Never keep a failed load in the cache: the next attempt must retry.
  p.catch(() => yearCache.delete(key));
  yearCache.set(key, p);
  return p;
}

/** Years for which an official table is bundled (same set for all reference ports). */
export function officialYears() {
  return Object.keys(DB.tide_ports.reference[0].files).map(Number).sort();
}

export function hasOfficial(ms) {
  return officialYears().includes(parts(ms).y);
}

/** First and last instant covered by the bundled official tables (reference port, uncorrected). */
export async function bundledRange(portId) {
  const p = getPort(portId);
  const code = p.reference || portId;
  const years = officialYears();
  const first = (await loadYear(code, years[0]))?.[0];
  const lastList = await loadYear(code, years[years.length - 1]);
  const last = lastList?.[lastList.length - 1];
  return first && last ? { from: first.t, to: last.t } : null;
}

async function referenceEvents(code, fromMs, toMs) {
  const years = [];
  for (let y = parts(fromMs).y; y <= parts(toMs).y; y++) years.push(y);
  const lists = await Promise.all(years.map((y) => loadYear(code, y)));
  return lists.filter(Boolean).flat().filter((e) => e.t >= fromMs && e.t <= toMs).sort((a, b) => a.t - b.t);
}

/** SHN rules for secondary ports (Tablas de Marea, Puertos secundarios). */
function applySecondary(sec, events) {
  const out = events.map((e) => (e.type === 'H'
    ? { t: e.t + sec.dtHighMin * MIN, h: e.h + sec.dhHigh, type: 'H' }
    : { t: sec.dtLowMin == null ? null : e.t + sec.dtLowMin * MIN, h: e.h + sec.dhLow, type: 'L' }));
  // Without a low-water time correction the SHN uses the mean of the surrounding high waters.
  out.forEach((e, i) => {
    if (e.t !== null) return;
    const prev = out[i - 1];
    const next = out[i + 1];
    e.t = prev && next && prev.type === 'H' && next.type === 'H' ? (prev.t + next.t) / 2 : null;
  });
  return out.filter((e) => e.t !== null).sort((a, b) => a.t - b.t);
}

/** Tide events for a port id between two instants (with a one-day margin for interpolation). */
export async function eventsFor(portId, fromMs, toMs) {
  const p = getPort(portId);
  if (!p) return [];
  if (p.reference) return applySecondary(p, await referenceEvents(p.reference, fromMs - DAY, toMs + DAY));
  return referenceEvents(portId, fromMs - DAY, toMs + DAY);
}

/** SHN interpolation: h = Pm − r/2·(1 − cos a) / Bm + r/2·(1 − cos a). Null outside the loaded events. */
export function heightAt(events, t) {
  for (let i = 0; i < events.length - 1; i++) {
    const a = events[i];
    const b = events[i + 1];
    if (t >= a.t && t <= b.t) {
      const k = (1 - Math.cos(Math.PI * (t - a.t) / (b.t - a.t))) / 2;
      return a.h + (b.h - a.h) * k;
    }
  }
  return null;
}

/** Rising/falling state. "Estoa" is an approximation: ±30 min around an event (no SHN duration published). */
export function stateAt(events, t) {
  const next = events.find((e) => e.t > t);
  const prev = [...events].reverse().find((e) => e.t <= t);
  if (!next || !prev) return null;
  const rising = next.type === 'H';
  const nearPrev = t - prev.t < 30 * MIN;
  const nearNext = next.t - t < 30 * MIN;
  let label = rising ? 'creciente' : 'bajante';
  if (nearPrev) label = prev.type === 'H' ? 'cerca de la pleamar (estoa aprox.)' : 'cerca de la bajamar (estoa aprox.)';
  else if (nearNext) label = rising ? 'creciente, cerca de la pleamar' : 'bajante, cerca de la bajamar';
  return { rising, next, prev, label };
}

/** SHN definition: amplitude = height of a high water minus the following low water. */
export function amplitudesIn(events, from, to) {
  const out = [];
  for (let i = 0; i < events.length - 1; i++) {
    const a = events[i];
    const b = events[i + 1];
    if (a.type === 'H' && b.type === 'L' && a.t >= from && a.t < to) out.push({ t: a.t, r: a.h - b.h });
  }
  return out;
}

export async function dayTide(portId, key) {
  const start = dayStart(key);
  const end = start + DAY;
  const events = await eventsFor(portId, start, end);
  const inDay = events.filter((e) => e.t >= start && e.t < end);
  const first = events[0]?.t ?? null;
  const last = events[events.length - 1]?.t ?? null;
  // Interpolation needs an event on each side; anything outside [first, last] has no official data.
  const dataFrom = first == null ? null : Math.max(start, first);
  const dataTo = last == null ? null : Math.min(end, last);
  const covered = first != null && first <= start && last >= end;
  const amps = amplitudesIn(events, start, end);
  const amplitude = amps.length ? Math.max(...amps.map((a) => a.r)) : null;
  return { start, end, events, inDay, covered, dataFrom, dataTo, amplitude, amps };
}

/** Year statistics computed with the SHN amplitude definition, same basis for reference and secondary ports. */
const statCache = new Map();
export async function yearAmplitude(portId, year) {
  const key = `${portId}-${year}`;
  if (!statCache.has(key)) {
    const from = parseLocal(`${year}-01-01T00:00`);
    const to = parseLocal(`${year + 1}-01-01T00:00`);
    statCache.set(key, eventsFor(portId, from, to).then((ev) => {
      const a = amplitudesIn(ev, from, to).map((x) => x.r);
      if (!a.length) return null;
      const hs = ev.filter((e) => e.t >= from && e.t < to).map((e) => e.h);
      return { mean: a.reduce((s, v) => s + v, 0) / a.length, max: Math.max(...a), min: Math.min(...a), lowMin: Math.min(...hs), highMax: Math.max(...hs) };
    }).catch((e) => { statCache.delete(key); throw e; }));
  }
  return statCache.get(key);
}

/**
 * Spring/neap tendency from the official daily amplitudes: today's maximum amplitude compared
 * with the 3 days before and after. Argentina has no official tide coefficient.
 */
export async function springNeap(portId, key) {
  const start = dayStart(key);
  const events = await eventsFor(portId, start - 3 * DAY, start + 4 * DAY);
  const days = [];
  for (let d = -3; d <= 3; d++) {
    const s = start + d * DAY;
    const a = amplitudesIn(events, s, s + DAY);
    days.push(a.length ? Math.max(...a.map((x) => x.r)) : null);
  }
  const today = days[3];
  const others = days.filter((v, i) => i !== 3 && v != null);
  if (today == null || others.length < 4) return { days, label: null };
  let label = 'intermedia';
  if (today >= Math.max(...others)) label = 'viva';
  else if (today <= Math.min(...others)) label = 'muerta';
  else label = (days[4] ?? today) > today ? 'creciendo hacia marea viva' : 'bajando hacia marea muerta';
  return { days, label };
}

/** Curve samples (every `stepMin`) across a day; only where official data exists. */
export function sampleDay(events, start, end, stepMin = 10) {
  const pts = [];
  for (let t = start; t <= end; t += stepMin * MIN) {
    const h = heightAt(events, t);
    if (h !== null) pts.push({ t, h });
  }
  return pts;
}

/** Personal fishing windows inside [start, end] for a setting { ref, before, after }. */
export function windowsFor(events, start, end, win) {
  if (!win) return [];
  return events
    .filter((e) => e.type === win.ref)
    .map((e) => ({ from: Math.max(start, e.t - win.before * MIN), to: Math.min(end, e.t + win.after * MIN), event: e }))
    .filter((w) => w.to > w.from);
}

export function portInfo(spotOrZone) {
  const id = spotOrZone?.tide?.port || spotOrZone?.tidePort;
  if (!id) return null;
  const p = getPort(id);
  const ref = p.reference ? getPort(p.reference) : p;
  return { port: p, ref, kind: spotOrZone.tide?.kind || 'secundario-oficial', note: spotOrZone.tide?.note, uncertain: !!p.heightCorrectionUncertain };
}

/** Straight-line distance in km between two points. */
export function distanceKm(a, b) {
  const R = 6371;
  const dLat = (b.lat - a.lat) * Math.PI / 180;
  const dLon = (b.lon - a.lon) * Math.PI / 180;
  const s = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * Math.PI / 180) * Math.cos(b.lat * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(s));
}

export function portPoint(p) {
  return { lat: p.latDec ?? p.lat, lon: p.lonDec ?? p.lon };
}

export function tideRefLabel(spot) {
  const info = portInfo(spot);
  if (!info) return 'Sin referencia de marea oficial para este punto.';
  const { port: p, ref, kind } = info;
  if (kind === 'secundario-oficial') return `Puerto secundario SHN «${p.name}», corregido desde ${ref.name}.`;
  if (kind === 'patron') return `Puerto patrón SHN: ${p.name}.`;
  const d = spot.coords ? distanceKm(spot.coords, portPoint(p)) : null;
  return `Referencia: ${p.name} (SHN)${d != null ? `, a ${Math.round(d)} km en línea recta` : ''}. Sin corrección oficial para este punto: la hora real puede diferir; dejá margen.`;
}

export { HOUR, dayKey };
