// Loads the audited JSON datasets bundled with the app.
const FILES = ['spots', 'species', 'zones', 'regulations', 'safety', 'sources', 'tide_ports', 'images', 'excluded', 'guide'];

export const DB = {};

export async function loadData() {
  const results = await Promise.all(FILES.map((f) => fetch(`data/${f}.json`).then((r) => {
    if (!r.ok) throw new Error(`No se pudo cargar data/${f}.json`);
    return r.json();
  })));
  FILES.forEach((f, i) => { DB[f] = results[i]; });
  DB.sourceMap = Object.fromEntries(DB.sources.sources.map((s) => [s.id, s]));
  DB.spotMap = Object.fromEntries(DB.spots.spots.map((s) => [s.id, s]));
  DB.speciesMap = Object.fromEntries(DB.species.species.map((s) => [s.id, s]));
  DB.portMap = Object.fromEntries([...DB.tide_ports.reference, ...DB.tide_ports.secondary].map((p) => [p.id, p]));
  return DB;
}

export const spot = (id) => DB.spotMap[id];
export const species = (id) => DB.speciesMap[id];
export const source = (id) => DB.sourceMap[id];
export const port = (id) => DB.portMap[id];
