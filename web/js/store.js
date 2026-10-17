// Per-device persistence. Every access is guarded: storage can be unavailable
// (private mode, blocked site data) and the app must keep working without it.
const KEY = { settings: 'mc.settings', favs: 'mc.favs', log: 'mc.log', state: 'mc.state', weather: 'mc.weather' };

function read(key, fallback) {
  try {
    const v = localStorage.getItem(key);
    return v ? JSON.parse(v) : fallback;
  } catch {
    return fallback;
  }
}
function write(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

export const DEFAULT_SETTINGS = {
  theme: 'dark',
  reduceMotion: false,
  windUnit: 'kmh',
  targetSpecies: null,
  // Personal fishing window relative to a tide event: { ref: 'H'|'L', before: minutes, after: minutes }
  window: null,
  // Date the user's own licence expires (YYYY-MM-DD), stored only on this device.
  licenseUntil: null,
};

export const settings = {
  get: () => ({ ...DEFAULT_SETTINGS, ...read(KEY.settings, {}) }),
  set(patch) {
    const next = { ...settings.get(), ...patch };
    write(KEY.settings, next);
    return next;
  },
};

// Shared between the tide screen and the map: selected spot, date (YYYY-MM-DD) and minutes of the day.
export const appState = {
  get: () => read(KEY.state, { spotId: 'playa-union', date: null, minutes: null }),
  set: (patch) => write(KEY.state, { ...appState.get(), ...patch }),
};

export const favorites = {
  all: () => read(KEY.favs, []),
  has: (id) => favorites.all().includes(id),
  toggle(id) {
    const list = favorites.all();
    const next = list.includes(id) ? list.filter((x) => x !== id) : [...list, id];
    write(KEY.favs, next);
    return next.includes(id);
  },
};

export const catchLog = {
  all: () => read(KEY.log, []),
  add(entry) {
    const list = catchLog.all();
    const item = { id: (crypto.randomUUID ? crypto.randomUUID() : String(Date.now())), ...entry };
    list.unshift(item);
    return write(KEY.log, list) ? item : null;
  },
  remove(id) { write(KEY.log, catchLog.all().filter((e) => e.id !== id)); },
  update(id, patch) {
    const list = catchLog.all().map((e) => (e.id === id ? { ...e, ...patch } : e));
    return write(KEY.log, list);
  },
  replaceAll(list) { return write(KEY.log, list); },
};

export const weatherCache = {
  get: (k) => read(KEY.weather, {})[k] || null,
  set(k, v) {
    const all = read(KEY.weather, {});
    all[k] = v;
    // Keep the cache small: last 12 entries.
    const keys = Object.keys(all).sort((a, b) => (all[b].fetchedAt || 0) - (all[a].fetchedAt || 0));
    keys.slice(12).forEach((x) => delete all[x]);
    write(KEY.weather, all);
  },
};

// Catch photos live in IndexedDB (too large for localStorage).
function idb() {
  return new Promise((resolve, reject) => {
    if (!('indexedDB' in window)) { reject(new Error('IndexedDB no disponible')); return; }
    const req = indexedDB.open('marea-chubut', 1);
    req.onupgradeneeded = () => req.result.createObjectStore('photos');
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export const photos = {
  async put(id, blob) {
    const db = await idb();
    return new Promise((res, rej) => { const tx = db.transaction('photos', 'readwrite'); tx.objectStore('photos').put(blob, id); tx.oncomplete = () => res(true); tx.onerror = () => rej(tx.error); });
  },
  async get(id) {
    try {
      const db = await idb();
      return await new Promise((res) => { const r = db.transaction('photos').objectStore('photos').get(id); r.onsuccess = () => res(r.result || null); r.onerror = () => res(null); });
    } catch { return null; }
  },
  async remove(id) {
    try {
      const db = await idb();
      db.transaction('photos', 'readwrite').objectStore('photos').delete(id);
    } catch { /* nothing stored */ }
  },
};
