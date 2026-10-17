// Open-Meteo forecast (model, not official). No API key. Cached for offline use.
import { weatherCache } from './store.js';
import { parseLocal } from './util.js';

const FORECAST = 'https://api.open-meteo.com/v1/forecast';
const MARINE = 'https://marine-api.open-meteo.com/v1/marine';
const TTL = 15 * 60e3; // Open-Meteo refreshes current conditions every 15 minutes
const TZ = 'timezone=America%2FArgentina%2FBuenos_Aires';

function hourlyToSeries(hourly, keys) {
  if (!hourly?.time) return [];
  return hourly.time.map((t, i) => {
    const row = { t: parseLocal(t) };
    keys.forEach((k) => { row[k] = hourly[k]?.[i] ?? null; });
    return row;
  });
}

async function getJson(url) {
  const r = await fetch(url);
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  return r.json();
}

/**
 * Wind (at the spot) + marine variables (at an offshore point) for one spot.
 * Resolves to { status: 'ok' | 'cached-offline' | 'cached-failed' | 'offline' | 'failed', wind, marine, fetchedAt }.
 */
export async function pointForecast(windPt, marinePt = windPt, { force = false } = {}) {
  const key = `p:${windPt.lat.toFixed(3)},${windPt.lon.toFixed(3)}|${marinePt.lat.toFixed(3)},${marinePt.lon.toFixed(3)}`;
  const cached = weatherCache.get(key);
  if (!force && cached && Date.now() - cached.fetchedAt < TTL) return { status: 'ok', ...cached };
  const offline = typeof navigator !== 'undefined' && navigator.onLine === false;
  if (offline) return cached ? { status: 'cached-offline', ...cached } : { status: 'offline' };
  try {
    const [wx, sea] = await Promise.all([
      getJson(`${FORECAST}?latitude=${windPt.lat}&longitude=${windPt.lon}&${TZ}&past_days=1&forecast_days=16&hourly=wind_speed_10m,wind_gusts_10m,wind_direction_10m&current=wind_speed_10m,wind_gusts_10m,wind_direction_10m&wind_speed_unit=kmh`),
      getJson(`${MARINE}?latitude=${marinePt.lat}&longitude=${marinePt.lon}&${TZ}&past_days=1&forecast_days=8&hourly=wave_height,sea_surface_temperature,sea_level_height_msl`).catch(() => null),
    ]);
    const value = {
      wind: hourlyToSeries(wx.hourly, ['wind_speed_10m', 'wind_gusts_10m', 'wind_direction_10m']),
      marine: sea ? hourlyToSeries(sea.hourly, ['wave_height', 'sea_surface_temperature', 'sea_level_height_msl']) : [],
      // Current conditions (15-minute model update), not a station observation.
      current: wx.current?.time ? { t: parseLocal(wx.current.time), wind_speed_10m: wx.current.wind_speed_10m, wind_gusts_10m: wx.current.wind_gusts_10m, wind_direction_10m: wx.current.wind_direction_10m } : null,
      fetchedAt: Date.now(),
    };
    weatherCache.set(key, value);
    return { status: 'ok', ...value };
  } catch {
    return cached ? { status: 'cached-failed', ...cached } : { status: 'failed' };
  }
}

/** Wind at one instant for many points in a single request (map markers, planner). */
export async function multiWind(points, atMs) {
  const hourKey = new Date(atMs).toISOString().slice(0, 13);
  const key = `m:${points.map((p) => `${p.lat.toFixed(2)},${p.lon.toFixed(2)}`).join(';').length}:${points.length}:${hourKey}`;
  const cached = weatherCache.get(key);
  if (cached && Date.now() - cached.fetchedAt < TTL) return cached.values;
  try {
    const d = await getJson(`${FORECAST}?latitude=${points.map((p) => p.lat).join(',')}&longitude=${points.map((p) => p.lon).join(',')}&${TZ}&past_days=1&forecast_days=16&hourly=wind_speed_10m,wind_gusts_10m,wind_direction_10m&wind_speed_unit=kmh`);
    const arr = Array.isArray(d) ? d : [d];
    const values = arr.map((loc) => nearest(hourlyToSeries(loc.hourly, ['wind_speed_10m', 'wind_gusts_10m', 'wind_direction_10m']), atMs));
    weatherCache.set(key, { values, fetchedAt: Date.now() });
    return values;
  } catch {
    return cached ? cached.values : null;
  }
}

/** Full hourly wind series for many points (planner: several days). */
export async function multiWindSeries(points) {
  const key = `ms:${points.map((p) => `${p.lat.toFixed(2)},${p.lon.toFixed(2)}`).join(';')}`;
  const cached = weatherCache.get(key);
  if (cached && Date.now() - cached.fetchedAt < TTL) return cached.series;
  try {
    const d = await getJson(`${FORECAST}?latitude=${points.map((p) => p.lat).join(',')}&longitude=${points.map((p) => p.lon).join(',')}&${TZ}&forecast_days=5&hourly=wind_speed_10m,wind_gusts_10m,wind_direction_10m&wind_speed_unit=kmh`);
    const arr = Array.isArray(d) ? d : [d];
    const series = arr.map((loc) => hourlyToSeries(loc.hourly, ['wind_speed_10m', 'wind_gusts_10m', 'wind_direction_10m']));
    weatherCache.set(key, { series, fetchedAt: Date.now() });
    return series;
  } catch {
    return cached ? cached.series : null;
  }
}

export function nearest(series, t) {
  if (!series?.length) return null;
  for (const row of series) if (Math.abs(row.t - t) <= 30 * 60e3) return row;
  return null;
}

export function windText(kmh, unit) {
  if (kmh == null) return '—';
  return unit === 'kn' ? `${Math.round(kmh / 1.852)} nudos` : `${Math.round(kmh)} km/h`;
}

const DIRS = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSO', 'SO', 'OSO', 'O', 'ONO', 'NO', 'NNO'];
export const dirName = (deg) => (deg == null ? '' : DIRS[Math.round(deg / 22.5) % 16]);

/**
 * Wind relative to the coast. `seaward` is the bearing from the beach towards open water
 * (computed from the OSM coastline). Wind direction is where the wind comes FROM.
 */
export function windVsCoast(windFromDeg, seaward) {
  if (windFromDeg == null || seaward == null) return null;
  const diff = Math.abs(((windFromDeg - seaward + 540) % 360) - 180); // 0 = blowing from the sea
  if (diff <= 45) return { key: 'onshore', label: 'del mar hacia la costa' };
  if (diff >= 135) return { key: 'offshore', label: 'de tierra hacia el mar' };
  return { key: 'cross', label: 'cruzado, paralelo a la costa' };
}
