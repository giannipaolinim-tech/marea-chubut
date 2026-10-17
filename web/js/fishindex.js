// "Índice de pesca": an orientative score, shown with its full formula in the app.
// Weights and wind thresholds are an editorial choice, not science.
// Only real factors count: a factor without data is left out, never replaced by a neutral value.
import { clamp } from './util.js';

export const WEIGHTS = { V: 0.45, T: 0.30, E: 0.25 };
export const WIND = { calmSustained: 15, calmGust: 25, maxSustained: 45, maxGust: 65 };
export const MIN_FACTORS = 2;

export function windFactor(sustained, gust) {
  if (sustained == null) return null;
  const g = gust ?? sustained;
  if (sustained <= WIND.calmSustained && g <= WIND.calmGust) return 1;
  const fs = (WIND.maxSustained - sustained) / (WIND.maxSustained - WIND.calmSustained);
  const fg = (WIND.maxGust - g) / (WIND.maxGust - WIND.calmGust);
  return clamp(Math.min(fs, fg), 0, 1);
}

/** Share of the personal windows that falls in daylight. Null when no window is defined. */
export function tideFactor(windows, sunrise, sunset) {
  if (!windows || sunrise == null || sunset == null) return null;
  if (!windows.length) return 0;
  let total = 0;
  let lit = 0;
  windows.forEach((w) => {
    total += w.to - w.from;
    lit += Math.max(0, Math.min(w.to, sunset) - Math.max(w.from, sunrise));
  });
  return total ? lit / total : 0;
}

/** 1 in a sourced season or peak month, 0.2 outside it. Null when the species has no season data. */
export function seasonFactor(species, month) {
  if (!species || !species.season.some(Boolean)) return null;
  return species.season[month - 1] ? 1 : 0.2;
}

export function fishIndex({ V, T, E }) {
  const parts = Object.entries({ V, T, E }).filter(([, v]) => v != null);
  const missing = ['V', 'T', 'E'].filter((k) => !parts.find(([p]) => p === k));
  if (parts.length < MIN_FACTORS) return { score: null, incomplete: true, used: parts.map(([k]) => k), missing };
  const wsum = parts.reduce((a, [k]) => a + WEIGHTS[k], 0);
  const score = parts.reduce((a, [k, v]) => a + WEIGHTS[k] * v, 0) / wsum;
  return { score: Math.round(score * 100), incomplete: false, used: parts.map(([k]) => k), missing };
}

export function indexColor(score) {
  if (score == null) return 'var(--mist)';
  if (score >= 70) return 'var(--ok)';
  if (score >= 45) return 'var(--teal)';
  if (score >= 25) return 'var(--signal)';
  return 'var(--danger)';
}
