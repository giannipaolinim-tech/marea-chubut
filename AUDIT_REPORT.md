# Audit report — "Marea Chubut" shore-fishing web app

- **Audit date:** 2026-10-16.
- **Auditor stance:** critical review. This report is self-contained; the reader has not seen the build conversation or the code.
- **Project root:** `C:\Users\gpaol\Downloads\Chubut pesca\`. The web app lives in `web/`. Paths below are relative to the project root.
- **How the audit was done:**
  - Read all source and data files.
  - Ran scripts over the tide datasets, coordinates and source URLs.
  - Executed the app in a Chromium-based preview at `http://localhost:8765` (desktop width and 375×812 mobile emulation), including edge-case dates.
  - Ran a WCAG contrast calculation on the CSS tokens.
- **What was not done:** no code or data was modified, and nothing was tested on a physical phone.

---

## 1. Executive summary

The app is a working, offline-capable PWA. Its official SHN tide data is parsed correctly: 0 mismatches against the source HTML. Its sourcing discipline is real: every fact links to one of 151 sources. As a *shore-fishing reference* it is far from the brief. Most per-spot and per-species practical fields are empty, coverage has large coastal gaps, and the "where/when/what bait tomorrow" question cannot be answered quickly.

The three most serious problems:
1. **Official tide coverage ends on 31/12/2026** (about 2,5 months from the audit date). The app also shows blank tide heights ("—", no explanation) on 1 Jan 00:00 until the first event and on 31 Dec after the last event.
2. **Boat-fishing content and a boat-only spot are present** although the app must be shore-only. Puerto Pirámides is listed as a spot, yet the Península Valdés management plan does not allow shore fishing there.
3. **Core angler data is missing for every spot** (bottom type, best tide phase, casting distance, species by month) **and for almost every species** (shore rig, best hour, best tide phase, ranked baits for only 3 of 17). The "ideal fishing window" is a user-defined setting, not a sourced recommendation.

---

## 2. Technical context of the current app

### 2.1 Stack and libraries

| Item | Version | Where | Licence |
|---|---|---|---|
| Vanilla JavaScript, native ES modules, no build step, no framework | — | `web/js/` | — |
| Leaflet | 1.9.4 (copied from npm `leaflet@1.9.4/dist`) | `web/vendor/leaflet/leaflet.js`, `leaflet.css` | BSD-2 |
| SunCalc | 1.9.0 (npm `suncalc@1.9.0`) | `web/vendor/suncalc/suncalc.js` (global `window.SunCalc`) | BSD-2 |
| Fraunces variable font (display) | @fontsource-variable/fraunces 5.1.0, files `fraunces-latin-full-normal/italic.woff2` | `web/fonts/` | SIL OFL |
| Inter variable font (text, tabular numbers) | @fontsource-variable/inter 5.1.0, `inter-latin-wght-normal.woff2` | `web/fonts/` | SIL OFL |
| Coastline | Natural Earth 1:10m land + minor islands + admin-1 lines, clipped to lon −69,5…−61,0 and lat −47,6…−40,6 | `web/geo/coast.json` (15 KB, 5 polygons, 682 vertices in the main one) | Public domain |
| Species images | Wikimedia Commons, resized to max 1200 px JPEG | `web/img/species/*.jpg` (17 files, 2,8 MB) + `web/data/images.json` | CC BY / CC BY-SA / CC0 / PD |
| Build and maintenance tools | Python 3.12 (+ Pillow 12.3 for images) | `tools/*.py` | — |

Total size of `web/`: about 3,9 MB, all precached by the service worker.

### 2.2 File structure

```
web/
  index.html            shell: nav (5 tabs), <main>, #sheet-root, #modal-root, #toast; loads leaflet.js, suncalc.js, js/main.js (module)
  manifest.json         PWA manifest (start_url ./#/marea, standalone)
  sw.js                 service worker (VERSION stamped by tools/build_precache.py)
  precache.json         list of 61 files + version hash (generated)
  css/app.css           all styles; theme tokens on :root[data-theme="dark|light|contrast"]
  js/
    main.js             hash router, boot, SW registration (skipped on localhost unless ?sw)
    data.js             fetches all JSON in data/, builds lookup maps (DB.spotMap, speciesMap, sourceMap, portMap)
    util.js             time helpers (fixed UTC−3), formatting, DOM helpers, reveal-on-scroll, icons
    store.js            localStorage wrappers (settings, favorites, catch log, app state, weather cache)
    tide.js             loads SHN year files, applies secondary-port corrections, SHN cosine interpolation, day stats
    astro.js            sun/moon via SunCalc, phase name, sicigia/cuadratura heuristic, moon SVG
    weather.js          Open-Meteo forecast + marine fetch, multi-point wind, caching
    fishindex.js        "índice de pesca" formula
    chart.js            SVG tide curve (events, night shading, user window, draggable marker)
    water.js            WebGL ocean hero (fragment shader) with 2D-canvas fallback
    ui.js               source badges, fact blocks, modals, source modal, IUCN tag
    screens/
      common.js         regions, spotPoint(), spot picker modal, computeIndex(), favorite button
      tide.js           "Marea" screen (hero, chart, events, amplitude, moon, sun, wind, index)
      map.js            Leaflet map, markers, zones, bottom sheet / side panel
      spot.js           spot detail page (+ spotBody() reused in map sheet)
      species.js        species grid + editorial species page
      calendar.js       species × month heatmap
      more.js           Más menu, Bitácora (catch log), Normativa, Seguridad, Fuentes, Ajustes
  data/                 audited JSON datasets (schemas in 2.3)
  data/tides/tides_<CODE>_2026.json   5 files: SROM, MADR, RAWS, SELE, COMO
  geo/coast.json, img/, fonts/, vendor/
tools/
  fetch_shn.py          downloads SHN monthly HTML (POST RE_TablasDeMarea.asp) + secondary sheets (GET R_TPSMareas.asp)
  parse_shn.py          HTML → data/tides/*.json + data/tide_ports.json (merges years)
  validate_data.py      checks every fact has confidence + existing source ids, port/species refs, images, season arrays
  build_precache.py     writes precache.json and stamps sw.js VERSION
  fetch_images.py       Commons API → images + licence metadata
  build_geo.py          clips Natural Earth to the Chubut coast
research/               research report + raw annexes + 155 raw SHN HTML files (research/raw/tides_raw/)
design/ENTREGABLE_2_DISENO.md
MANTENIMIENTO.md        maintenance guide (Spanish)
README.md
```

Routes in `web/js/main.js`:

| Route | Screen |
|---|---|
| `#/marea`, `#/marea/:spotId` | Marea (tide) screen |
| `#/mapa`, `#/mapa/:spotId` | Map |
| `#/spot/:id` | Spot detail |
| `#/especies`, `#/especie/:id` | Species grid and species page |
| `#/calendario` | Season heatmap |
| `#/mas` | Más menu |
| `#/bitacora` | Catch log |
| `#/normativa` | Regulations |
| `#/seguridad` | Safety |
| `#/fuentes` | Sources |
| `#/ajustes` | Settings |

### 2.3 Data organisation (actual schemas and real records)

**Common "fact" shape**, used everywhere:

```json
{"t": "texto visible", "c": "oficial|cientifico|local|unica", "s": ["sourceId"]}
```

| `c` value | Meaning |
|---|---|
| `oficial` | Norm, public body, municipality, Prefectura, SHN, IUCN SSC |
| `cientifico` | Paper, thesis, FishBase, CENPAT researchers |
| `local` | At least 2 independent local sources agree |
| `unica` | Single source; shown only as a rotulated warning |

Optional keys:

| Key | Meaning |
|---|---|
| `k` | Group key for spot facts: `uso`, `temporada`, `acceso`, `servicios`, `senal`, `legal`, `costa` |
| `alert` | `true` shows it as a banner on the tide screen |
| `months` | Restricts the alert to those months |
| `lifeRisk` | `true` shows a red danger banner |

**spots.json**: `{verified, schema, spots:[…]}`. There are 22 spots; 3 have `coords: null`. Real record:

```json
{
 "id": "bajo-los-huesos", "name": "Bajo Los Huesos", "locality": "Rawson (Bahía Engaño)", "region": "rawson",
 "coords": {"lat": -43.2066, "lon": -64.8893, "kind": "Nodo de localidad (OpenStreetMap)", "s": ["osm"]},
 "modality": ["playa"],
 "facts": [
  {"k": "legal", "t": "Sector habilitado para la pesca deportiva marítima, dentro de la Estancia Bajo Los Huesos.", "c": "oficial", "s": ["rawson-bajo-huesos"]},
  {"k": "temporada", "t": "Según el municipio, la mejor época es septiembre y octubre (pejerrey y cazón); desde octubre, gallo y chuchos.", "c": "oficial", "s": ["rawson-bajo-huesos"]},
  {"k": "uso", "t": "Sede de concursos: 12 Horas (marzo 2025), 20 Horas (marzo 2026), Fiesta del Pejerrey (septiembre de 2024).", "c": "local", "s": ["dj-12horas-2025", "dj-pejerrey-2024"]},
  {"k": "acceso", "t": "Por la RP 1 desde Rawson; se reportó un tramo de ripio en mal estado y anuncios de pavimentación. Estado actual no verificado.", "c": "local", "s": ["radiochubut-blh-2019", "radio3-blh"]}
 ],
 "species": ["pejerrey", "cazon", "pez-gallo", "chucho"],
 "speciesSrc": {"c": "oficial", "s": ["rawson-bajo-huesos", "dj-12horas-2025"]},
 "dangers": [],
 "tide": {"port": "RAWS", "kind": "aproximacion"}
}
```

`tide.kind` takes one of these values:
- `secundario-oficial`
- `patron`
- `aproximacion`
- `ninguna`

There are **no fields at all** for bottom type, best tide phase, casting distance, species-by-month per spot, or parking.

**species.json**: `{verified, schema, species:[17], excluded:[6]}`. Real record:

```json
{
 "id": "pez-gallo", "name": "Pez gallo", "sci": "Callorhinchus callorynchus", "group": "quimera", "image": "pez-gallo",
 "chubut": {"t": "Especie objetivo de la pesca recreativa de primavera–verano; desde la costa se capturan sobre todo juveniles. …", "c": "cientifico", "s": ["pa-pez-gallo", "isra-eng"]},
 "id_tips": {"t": "Hocico en forma de trompa. Primera aleta dorsal con una espina aserrada fuerte que puede herir. …", "c": "cientifico", "s": ["pa-pez-gallo"]},
 "size": {"t": "Hembras hasta 70 cm y 5,5 kg; machos hasta 61 cm y 2,3 kg. …", "c": "cientifico", "s": ["pa-pez-gallo", "dj-20horas-feb2025"]},
 "habitat": {"t": "De la costa hasta 200 m; los adultos se van a aguas profundas desde marzo.", "c": "cientifico", "s": ["pa-pez-gallo"]},
 "season": ["s","s","s",null,null,null,null,null,"s","s","s","s"],
 "seasonSrc": {"c": "local", "s": ["pa-pez-gallo", "pescadordeportivo-gallo", "isra-eng"], "note": "Septiembre a marzo: concentración costera en primavera–verano."},
 "modality": ["costa"],
 "baits": [{"t": "Langostino (solo o con anchoíta)", "c": "local", "s": ["pa-pez-gallo", "argentinaxplora"]}, {"t": "Anchoíta", "c": "local", "s": ["pa-pez-gallo", "argentinaxplora"]}],
 "lures": [],
 "rig": {"t": "Caña de 3,5 a 4,2 m; nylon de alrededor de 0,30 mm.", "c": "local", "s": ["pa-pez-gallo", "argentinaxplora"]},
 "tideNote": {"t": "Proyecto Arrecife (Rojas y Bovcon): con marea estática, … la actividad es nula; …", "c": "unica", "s": ["pa-pez-gallo"]},
 "iucn": {"cat": "VU", "date": "2019", "s": ["fb-callorhinchus"]},
 "legal": {"status": "consultar"},
 "food": {"t": "Calidad para consumo: buena.", "c": "cientifico", "s": ["pa-pez-gallo"]}
}
```

- `season` values: `"p"` peak, `"s"` season, `null` no data.
- `legal.status` values: `consultar`, `protegida`, `regulada`.
- Optional keys: `altNames`, `sciNote`, `imageNote`, `lede`, `release`, `decline`, `danger`.

There are **no fields** for best hour, best tide phase (only `tideNote`, single-source), casting distance, or a structured shore rig with hook size, line and rod.

**Tides**: `data/tides/tides_<CODE>_<YEAR>.json`, generated by `tools/parse_shn.py` from the raw SHN HTML. Real header and first events:

```json
{
 "port": "Puerto Madryn", "code": "MADR", "year": 2026, "timezone": "UTC-3",
 "tzNote": "SHN: valores horarios calculados en huso +3 (hora oficial argentina).",
 "datum": "Las alturas están referidas al plano de reducción que pasa 3,20 m debajo del nivel medio.",
 "meanLevel": 3.2, "lat": "42º 46' S", "lon": "65º 02' W",
 "yearStats": {"highMax": 5.85, "highMean": 5.05, "lowMin": 0.53, "lowMean": 1.26, "rangeMax": 5.04, "rangeMean": 3.79},
 "eventFormat": ["localTime", "heightMeters", "H=pleamar|L=bajamar (derivado por alternancia)"],
 "source": "Servicio de Hidrografía Naval (SHN), Tablas de Marea",
 "sourceUrl": "https://www.hidro.gob.ar/oceanografia/Tmareas/Form_Tmareas.asp",
 "retrieved": "2026-10-16",
 "events": [["2026-01-01T05:12", 4.95, "H"], ["2026-01-01T12:04", 1.39, "L"], ["2026-01-01T17:13", 5.23, "H"], ["2026-01-02T00:37", 1.23, "L"], "… 1410 total"]
}
```

**tide_ports.json** lists 5 reference ports and 19 secondary ports. Real records:

```json
{"id": "MADR", "name": "Puerto Madryn", "lat": -42.7667, "lon": -65.0333, "meanLevel": 3.2,
 "yearStats": {"2026": {"highMax": 5.85, "highMean": 5.05, "lowMin": 0.53, "lowMean": 1.26, "rangeMax": 5.04, "rangeMean": 3.79}},
 "files": {"2026": "data/tides/tides_MADR_2026.json"}}

{"shnName": "PENÍNSULA VALDÉS - PUERTO PIRÁMIDE", "shnReferenceName": "Puerto Madryn", "lat": "42 35", "lon": "64 17",
 "dtHighMin": -15, "dtLowMin": -41, "dhHigh": -0.06, "dhLow": 0.09, "heightCorrectionUncertain": false,
 "meanLevel": 3.2, "meanRange": 3.63, "raw": ["42 35","64 17","-0 15","-0 41","-0,06","+0,09","6 24","3,20","6 34","3,63"],
 "id": "PIRA", "name": "Puerto Pirámide", "reference": "MADR", "latDec": -42.5833, "lonDec": -64.2833}
```

The file also carries metadata keys: `source`, `sourceUrl`, `retrieved`, `secondaryRules[]` (SHN rules as text), `interpolation` (the SHN formula as text) and `generated`.

**regulations.json** has `{verified, authority, noLimitsNotice, license, rules[13], excludedNotVerified[]}`. Real records:

```json
"authority": {"name": "Secretaría de Pesca del Chubut", "address": "Libertad 279, Rawson", "phones": ["(0280) 483337", "(0280) 482709"], "url": "https://pesca.chubut.gob.ar/", "c": "oficial", "s": ["sp-chubut", "circ-001-26"]}
"license": {"required": {"t": "La pesca deportiva en el mar territorial requiere licencia previa, personal e intransferible.", "c": "oficial", "s": ["ley-xvii-8"]},
  "exempt": {"t": "Los menores de 14 años pueden pescar sin licencia.", "c": "oficial", "s": ["ley-xvii-8"]},
  "categories": [{"name": "Pesca desde la costa", "price": "$2.000"}, {"name": "Pesca de embarcación", "price": "$20.000"}, {"name": "Pesca submarina", "price": "$10.000"}],
  "categoriesSrc": {"c": "oficial", "s": ["permisos"], "note": "Precios publicados al 16/10/2026. La página no indica vigencia …"},
  "how": {"t": "El trámite es 100 % online con el asistente DINO por WhatsApp; el permiso llega en PDF.", "c": "oficial", "s": ["permisos", "sp-temporada"], "url": "https://wa.me/5492804603466?text=permisos%20de%20pesca"}, …}
rule: {"id": "veda-golfo-nuevo", "title": "Veda de moluscos: Golfo Nuevo", "t": "Desde el 05/08/2026 está prohibido extraer bivalvos y caracoles en el Golfo Nuevo (Res. 296/2026-SP), hasta su levantamiento expreso. …", "c": "oficial", "s": ["res-296-2026"], "level": "alert", "since": "2026-08-05"}
```

**sources.json** has `{verifiedDefault: "2026-10-16", types:{…}, sources:[151]}`. Real record:

```json
{"id": "shn-tablas", "type": "oficial", "title": "Tablas de Marea 2026: puertos patrón y secundarios", "publisher": "Servicio de Hidrografía Naval (SHN)", "url": "https://www.hidro.gob.ar/oceanografia/Tmareas/Form_Tmareas.asp"}
```

- `type` takes one of these values:
  - `oficial`
  - `cientifico`
  - `local`
  - `modelo`
- `verified` is optional per source; when missing, `verifiedDefault` is used.

**Other data files:**

- **zones.json** holds 15 zones. `status` is `restringida` or `revision`, and zones are point-only with no polygons. Real record:
  ```json
  {"id": "punta-tombo", "name": "Punta Tombo", "status": "restringida", "coords": {"lat": -44.0411, "lon": -65.21, "kind": "Wikipedia"}, "reason": {"t": "Reserva provincial con acceso controlado y Área Marina Protegida (Ley XI Nº 65). Ninguna fuente habilita la pesca: no pesques.", "c": "cientifico", "s": ["wiki-punta-tombo", "canal26-tombo-2026"]}}
  ```
- **safety.json** has `emergency[]`, `general[]`, `hazards[]` and `wildlife[]`. Example hazard:
  ```json
  {"spot": null, "name": "Barrancas Blancas (norte de Comodoro)", "t": "En el sector de acantilado, cuando sube la marea no queda costa transitable.", "c": "unica", "s": ["adnsur-barrancas-2025"], "singleSourceHazard": true}
  ```
- **images.json** maps a species id to `{file, title, page, author, license, licenseUrl, credit, retrieved}`.

### 2.4 External APIs (runtime)

| API | Call | Use | Notes |
|---|---|---|---|
| Open-Meteo Forecast | `https://api.open-meteo.com/v1/forecast?latitude=…&longitude=…&timezone=America/Argentina/Buenos_Aires&past_days=1&forecast_days=16&hourly=wind_speed_10m,wind_gusts_10m,wind_direction_10m&wind_speed_unit=kmh` | Wind on the tide screen. Multi-location variant for map marker colours. | No key. Non-commercial terms. Model, not official. |
| Open-Meteo Marine | `https://marine-api.open-meteo.com/v1/marine?…&forecast_days=8&hourly=wave_height,sea_surface_temperature,sea_level_height_msl` | Waves, sea temperature. Model sea-level curve when no official table exists. | `wave_height` returns `null` in some gulf cells. Sea level is relative to MSL, not to the SHN datum. |

There are no other runtime APIs. SHN data is **bundled**, not fetched at runtime.

### 2.5 State and storage

All state lives in `localStorage`, with every access wrapped in try/catch in `web/js/store.js`:

| Key | Content |
|---|---|
| `mc.settings` | `{theme, reduceMotion, windUnit, targetSpecies, window:{ref:'H'\|'L', before:min, after:min}\|null}` |
| `mc.state` | `{spotId}`: last selected spot. The date is **not** persisted. |
| `mc.favs` | Array of spot ids |
| `mc.log` | Array of catch entries `{id, t(ms), spot, species, speciesName, bait, length, weight, notes, tide:{h,label,phase}}` |
| `mc.weather` | Up to 12 cached Open-Meteo responses keyed by point or multi-point + hour |

Other behaviour:
- **Service worker** (`web/sw.js`): installs the 61 files in `precache.json` into cache `marea-chubut-<version>`. Same-origin requests are cache-first. Open-Meteo requests are network-first, falling back to cache `marea-chubut-runtime`.
- **Time:** all times are handled as fixed UTC−3 (`util.js`: `parseLocal`, `parts`), independent of the device time zone.

### 2.6 Environment limitations

- The app **must be served over HTTP**. Opening `index.html` via `file://` fails because `fetch` of the JSON is blocked; the app shows an explanatory error.
- `main.js` **does not register the service worker on `localhost`/`127.0.0.1`** unless the URL contains `?sw`. Offline behaviour is only testable that way or when deployed.
- The first visit must be online: precache is about 4 MB.
- Development and testing happened on Windows 11, Python 3.12 and Node 24, in an embedded Chromium preview. That preview throttles `requestAnimationFrame` when hidden, so screenshots of the WebGL hero were unreliable; behaviour was verified through instrumentation (shader uniforms).
- **Nothing is deployed.** The app has not been tested on iOS Safari, Android Chrome, real sunlight or a real offline phone.

---

## 3. Brief compliance table

| # | Requirement (from the original brief) | Status | Detail |
|---|---|---|---|
| 1 | Data integrity: never invent; every data point sourced; confidence badge with source and "verified on" date | **Partial** | Infrastructure is good (badges, validator). Several items are inferred or unsourced: see D-items in §4 (Cabo Raso claim, species `modality`, mero/besugo season mapping, pejerrey peak extrapolation, uncited `lede`). |
| 2 | Research phase before code; sourced dataset; excluded list | Done | `research/INFORME_INVESTIGACION.md` plus annexes. |
| 3 | **Shore fishing only (no boat content anywhere)**, as required by this audit | **Missing** | The original brief allowed "small-boat near-shore fishing", so boat content was built in. It now violates the shore-only requirement. Full list in item C-02. |
| 4 | Geography: full Chubut Atlantic coast, Río Negro border to Santa Cruz border | **Partial** | 22 spots, clustered around Madryn and Rawson. Large gaps: see H-01. |
| 5 | Restricted areas shown as "zona restringida" with reason; never as spots | **Partial** | 11 restricted + 4 "en revisión" zones exist as points. Puerto Pirámides is shown as a spot inside the Península Valdés ANP where the management plan does not permit shore fishing (C-03). No zone polygons (M-10). |
| 6 | Spot: name, locality, verified coordinates | **Partial** | All coordinates are reference points (centroids); 3 spots have none. Several render offshore or inland on the app's own coastline (H-05). |
| 7 | Spot: access type, parking | **Partial / Missing** | Access appears on 7 of 22 spots; parking on none. |
| 8 | Spot: modality | Done | Some spots have an empty modality array (Punta Delfín, Cabo Raso). |
| 9 | Spot: bottom type | **Missing** | No field; 0 of 22. |
| 10 | Spot: best tide phase + specific danger notes | **Partial** | Best tide: 0 of 22. Danger notes exist on 6 spots. |
| 11 | Spot: species with seasonality by month | **Partial** | Species lists on 6 of 22 spots, never with months per spot. |
| 12 | Spot: casting distance | **Missing** | 0 of 22. |
| 13 | Spot: reference tide port + documented correction | Done | Every spot except Puerto Lobos maps to an SHN reference or secondary port, with an explicit "approximation" label. |
| 14 | Spot: services (fuel, bait shop, signal, camping) | **Partial** | Only Puerto Lobos, Punta Ninfas, Cabo Raso, Camarones and Caleta Córdova. Bait shops: 0. |
| 15 | Species: Argentine common name + scientific name | Done | 17 species. |
| 16 | Species: licensed photo/illustration with credit | **Partial** | All credited and licensed. Several images are not of the species or region claimed (M-06). |
| 17 | Species: ID tips, average and record size | **Partial** | ID tips missing for pejerrey, besugo, caballa, cazón, gatuzo and palometa. Record size only for salmón (Chubut record). |
| 18 | Species: season by month (heatmap-ready) | **Partial** | 7 of 17 have data. Mero and besugo show biology (presence on reefs), not fishing season (H-09). |
| 19 | Species: best baits ranked + lures | **Partial** | Baits for 3 species (róbalo, salmón, pez gallo); "ranking" is just mention order. Lures for 1. |
| 20 | Species: rig, hook size, line, rod (shore vs boat) | **Missing / Partial** | Shore rig only for pez gallo (rod + line, no hook). Salmón rig is boat. |
| 21 | Species: best time of day, best tide phase | **Missing** | 0 of 17. Two single-source notes are shown as "Sin dato verificado". |
| 22 | Species: typical distance from shore / depth | **Partial** | Depth for some; casting distance 0 of 17. |
| 23 | Species: legal status (size, bag, closed season, catch-and-release) or "Consultar normativa vigente" + link | Done | "Consultar" for 16. Gatopardo protected (Ley XI Nº 93). No official limits exist, as verified in research. |
| 24 | Tides: official SHN tables for current year **and next year**, as static JSON with source and year | **Partial** | 2026 only; 2027 is not yet published by the SHN (C-01). |
| 25 | Tides: corrections only if officially documented | Done | Bahía Solano correction flagged as uncertain. |
| 26 | Tides: Argentina time UTC−3 | Done | — |
| 27 | Tides: date picker for any day of the year | **Partial** | Any 2026 day. 1 Jan before the first event and 31 Dec after the last show "—" (C-04). Other years have no data. |
| 28 | Tides: smooth full-day curve, current-time marker, high/low labels with heights, tidal range | Done | SHN cosine interpolation. "Amplitude" definition differs from the SHN's (M-03). |
| 29 | Tides: highlighted "ventana ideal de pesca" for species + spot from its best tide phase | **Partial** | Replaced by a user-defined window (approved decision) because no sourced phase data exists. Not species- or spot-specific. |
| 30 | Tide coefficient / sicigia vs cuadratura with moon phase | **Partial** | Moon-phase heuristic only, no coefficient. Can contradict the shown amplitude (M-04). |
| 31 | Sunrise, sunset, golden hours, moon phase, moonrise/set | Done | SunCalc. |
| 32 | Wind, gusts, direction, wave height, sea temperature (Open-Meteo, labelled forecast) | Done | Labelled "Modelo, no oficial". Waves are often null inside gulfs. The error state is wrong (H-11). |
| 33 | Índice de pesca with transparent formula | Done | Formula modal present. Map colours ignore the selected date (M-08). Defaults inflate scores (M-09). |
| 34 | Seasonal species × month heatmap | Done | Data quality issues: H-09, M-05. |
| 35 | Regulations section with links | Done | Hard-coded licence price elsewhere (M-11). |
| 36 | Safety section (tide hazards, wind, cliffs, wildlife distances, verified emergency numbers, "avisá a alguien") | **Partial** | Present. 911 is shown as a call button with "not verified" status (M-13). Prefectura numbers exist only for Madryn, and that one is press-sourced. |
| 37 | Favorites | **Partial** | Star toggle; favorites appear only at the top of the spot picker. No favorites list or map filter (L-04). |
| 38 | Catch log + stats in local storage | Done | No edit, no photo; `confirm()` for deletion (L-05). |
| 39 | Offline-friendly (data + tide tables bundled) | Done | Verified with the server stopped. Requires first online visit and deployment. |
| 40 | "Fuentes" page with every source + verification dates | **Partial** | All sources listed. No consolidated excluded-data list on that page (M-12). Per-source verification dates are all the default. |
| 41 | Design: animated ocean following real tide; dark custom map; editorial species cards; expressive type; motion; mobile-first; dark default + light; WCAG AA; keyboard; alt text | **Partial** | See §4 Design/UX/Accessibility items (M-02, H-06, M-14, L-06). |
| 42 | Spanish UI (Argentine "vos", local vocabulary); code in English | **Partial** | UI is Spanish with "vos". Leaflet zoom buttons are in English ("Zoom in"/"Zoom out") (L-02). Source titles in the sources modal are often English (they are paper titles; acceptable). |
| 43 | Data separated into spots/species/tides/regulations/sources JSON | Done | Plus zones, safety, images, tide_ports. |
| 44 | No API keys | Done | — |
| 45 | Deliverable 4: maintenance guide | Done | `MANTENIMIENTO.md`. |
| 46 | Answer "where, when, what bait tomorrow" in under 10 s | **Missing** | No planner view (H-07). |

---

## 4–5. Full list of gaps, errors and improvements (sorted by priority)

**ID prefixes:**

| Prefix | Priority |
|---|---|
| C | Critical |
| H | High |
| M | Medium |
| L | Low |

### CRITICAL

**C-01 · Tides · Critical: official tide data ends on 31/12/2026**
- **Location:** `web/data/tides/` holds only `*_2026.json`. `web/data/tide_ports.json` → `reference[].files` only has `"2026"`. `web/js/tide.js` → `officialYears()` and `hasOfficial()`.
- **Current behaviour:**
  - From 1 Jan 2027 every spot shows an orange banner "Tabla oficial no cargada".
  - The readout shows "—".
  - Only within the ~8-day Open-Meteo marine horizon is a dashed **model** curve drawn, relative to MSL rather than the SHN datum.
  - The SHN had not published 2027 on the audit date: its year selector offered 2022–2026, and a POST for 2027 returned an empty table.
  - The app gives no warning before the cut-off.
- **Expected behaviour:**
  - Official data for the current year and the next (brief).
  - Until the next year is published, a visible countdown or notice in Ajustes and on the tide screen in December.
  - A documented procedure, which exists: `python tools/fetch_shn.py 2027` then `python tools/parse_shn.py 2027`, then `build_precache.py` and redeploy.
  - Consider a check that warns when `today > last bundled event − 30 days`.

**C-02 · Content / Data · Critical: boat-fishing content present in a shore-only app**
- **Location and exact items:**
  1. `web/data/spots.json` → `puerto-piramides`:
     - `"modality": ["embarcación"]`
     - fact "Pesca embarcada con operadores habilitados."
     - fact "Salidas de pesca embarcada de septiembre a marzo."
     - species salmón and mero sourced to boat-trip operators.
  2. `spots.json` → `camarones`:
     - `"modality": ["playa", "embarcación"]`
     - fact text "Pesca de costa y embarcada…"
  3. `spots.json` → `isla-escondida`:
     - fact "La bajada «del Baño» no está habilitada para bajar embarcaciones."
     - danger about a drifting boat.

     These are relevant only to boaters.
  4. `web/data/species.json`: species whose only documented Chubut fishing mode is from boats (`"modality": ["embarcado"]`):
     - salmón (`salmon`)
     - mero
     - turco
     - escrófalo
     - besugo
     - caballa

     Also cazón has `["costa","embarcado"]`. The salmón `rig` ("pesca a la deriva (al garete)", 250–500 g sinkers) is a boat rig.
  5. `web/js/screens/species.js` → filter button `data-f="embarcado"` "Embarcado".
  6. `web/data/regulations.json`:
     - `license.categories` includes "Pesca de embarcación $20.000" (and "Pesca submarina")
     - rule `embarcaciones-madryn`
     - zone `pv-navegacion` in `zones.json`
  7. `web/data/safety.json` → wildlife item "Ballenas desde embarcación: …100 m … 10 nudos".
  8. `web/data/species.json` → `besugo.chubut`: "se pesca embarcado en verano".
- **Current behaviour:** boat content is mixed with shore content.
- **Expected behaviour:**
  - Remove or hide every boat-only element.
  - Either remove boat-only species or keep them only if a shore-capture source exists. Salmón has one single-source mention of shore casting at the south margin of Golfo Nuevo, which does not meet the 2-source rule.
  - Keep only the shore licence category, perhaps noting that other categories exist.
- **Note:** this conflicts with the original brief, which allowed small-boat fishing. The product owner must confirm shore-only.

**C-03 · Data / Regulations · Critical: a spot is presented inside a zone where shore fishing is not permitted**
- **Location:**
  - `web/data/spots.json` → `puerto-piramides`
  - `web/data/zones.json` → `pv-costa`
  - management plan source `pv-plan`
- **Current behaviour:**
  - Puerto Pirámides appears as a fishing spot marker on the map, in the spot picker, and as a tide default option.
  - The Plan de Manejo de Península Valdés (zonificación preliminar, source `pv-plan`) restricts recreational **shore** fishing to "las cercanías de El Riacho y Larralde" and the south coast of Golfo Nuevo between Punta Ameghino and Punta Arco.
  - Punta Pirámides itself is an intangible apostadero (250 m on land, 500 m at sea).
  - With boat content removed (C-02), this spot has no legal shore-fishing basis.
- **Expected behaviour:**
  - Remove it as a spot, or convert it to a `zones.json` entry ("restringida: pesca de costa no habilitada por el Plan de Manejo").
  - Its tide data, from secondary port PIRA, can remain available for non-fishing reference.

**C-04 · Tides / Functionality · Critical: blank tide height at year boundaries, with no explanation**
- **Location:** `web/js/tide.js` → `dayTide()`, `heightAt()`, `stateAt()`. `web/js/screens/tide.js` → `updateSelection()`.
- **Reproduction:**
  - Spot "Playa Unión / Los Palos", date 2026-01-01, scrub to 01:00 → readout `—m`, state line empty.
  - The first Rawson event of the year is 04:57. On 31-12-2026 at 23:40 the readout is `—m` (last event 19:47).
  - The chart curve starts or stops mid-day.
- **Cause:** events are only loaded for years that are bundled, and no events exist before the first 2026 event or after the last.
  ```js
  // tide.js
  const covered = events.some((e) => e.t <= start) && events.some((e) => e.t >= end);
  // heightAt returns null when t is outside [first,last] event; updateSelection prints '—' and an empty state.
  ```
  `covered === false` is computed but never surfaced to the user. It is only used to null the index factor T in `screens/common.js`.
- **Expected behaviour:**
  - Bundle the last events of the previous year and the first events of the next, or show an explicit message ("Fuera del rango de la tabla oficial cargada").
  - Never show a silent "—" next to an official badge.
  - For secondary ports with negative time shifts the gap widens; e.g. Bahía Cruz −1 h 57 min.

### HIGH

**H-01 · Data · High: large coastal coverage gaps (brief requires the whole coast)**
- **Location:** `web/data/spots.json`. Current spots by region:

  | Region | Spots |
  |---|---|
  | norte | 1 |
  | valdes | 1 |
  | golfo-nuevo | 5 |
  | rawson | 9 |
  | sur | 2 |
  | golfo-san-jorge | 4 |

- **Missing or uncovered coastal areas**, to research and add only if sourced:
  1. **Golfo San Matías Chubut coast** between Puerto Lobos and the isthmus (Ameghino isthmus north coast). There is only one spot, Puerto Lobos, with no tide reference.
  2. **El Riacho and Playa Larralde** (Golfo San José). This is the *only* area where the PV plan allows shore fishing, yet it is not a spot. Also Playa Villarino, Punta Gales and Bengoa, cited in the Venerus thesis as camping and fishing points.
  3. **South coast of Golfo Nuevo, Punta Ameghino–Punta Arco.** The PV plan allows shore fishing here, but it is not represented.
  4. **Cerro Avanzado and Punta Cuevas** (Madryn). Researched; single source only.
  5. **Punta Tombo → Cabo Raso stretch:** Bahía Janssen, Bahía Cruz. SHN secondary ports exist; no fishing spots.
  6. **Cabo Raso → Camarones:** only a town centroid; Playa Thompson and Playa Honda have no coordinates.
  7. **Camarones → Bahía Bustamante:** all "en revisión" (Patagonia Azul).
  8. **Bahía Bustamante → Caleta Córdova:** only Bahía Solano.
  9. **Comodoro city:** Costanera (single source), Restinga Alí (excluded for contamination), Km 8 and others not researched.
  10. **South of Rada Tilly to the Santa Cruz border:** Ramón Santos (Chubut), Playa Bonita / Los Límites, Playa Ancina. None included (single source).
- **Expected behaviour:** dedicated research per area. Club contest venues are a good lead: Club de Pesca El Golfo (Madryn), Club de Pesca y Náutico Rawson, Club de Pesca, Náutica y Caza Submarina de Trelew, and Comodoro clubs.

**H-02 · Data · High: per-spot practical fields entirely missing**
- **Location:** `web/data/spots.json` schema; `web/js/screens/spot.js` → `spotBody()`.
- **Current state across 22 spots:**

  | Field | Coverage |
  |---|---|
  | `bottom` | 0, field does not exist |
  | best tide phase | 0 |
  | casting distance | 0 |
  | species by month per spot | 0 |
  | parking | 0 |
  | access | 7 |
  | services | 5 |
  | coordinates | 19 (all reference points) |

  The spot page shows "Sin dato verificado" only for `acceso` and `servicios`. It does not show a placeholder for the other missing fields, so the user doesn't know they are expected.
- **Expected behaviour:**
  - Add schema fields `bottom`, `bestTide`, `castingDistance`, `speciesByMonth`, `parking`, each a fact `{t,c,s}` or null.
  - Render "Sin dato verificado" for every null.
  - Fill them from sources (§6).

**H-03 · Data · High: per-species practical fields mostly missing**
- **Location:** `web/data/species.json`; `web/js/screens/species.js` → `renderSpecies()`.
- **Current state across 17 species:**

  | Field | Coverage |
  |---|---|
  | `baits` | 3 (róbalo, salmón, pez gallo); "ranked" = order of mention |
  | `lures` | 1 |
  | `rig` (shore) | 1 (pez gallo: rod length + line; no hook size, no rig type) |
  | best hour | 0 |
  | best tide phase | 0 |
  | casting distance | 0 |
  | `id_tips` | 11 (missing: pejerrey, besugo, caballa, cazón, gatuzo, palometa) |
  | record size | 1 |

- **Expected behaviour:** structured fields `rigShore {type, hook, line, rod, sinker}`, `bestHours`, `bestTide`, `castingDistance`, and `baits[].rank` with its basis stated. Fill them only from 2+ independent sources.

**H-04 · Data integrity · High: species `modality` values are inferred, not sourced**
- **Location:** `web/data/species.json` → `modality`. This field has **no** `c`/`s`, so `validate_data.py` cannot catch it.
- **Examples:**
  - `bacota: ["costa"]`. The source (Proyecto Arrecife) says it "se pesca … hasta la desembocadura del río Chubut" without stating shore vs boat.
  - `pez-angel: ["costa"]`. The source (ISRA Bahía Engaño) data comes from "commercial trawl fisheries and the sport and recreational fishery", with no shore statement.
  - `palometa: ["costa"]`, `gatuzo: ["costa"]` (single-source PA author from Buenos Aires), `cazon: ["costa","embarcado"]` ("embarcado" not sourced for Chubut).
- **Expected behaviour:** make `modality` a sourced fact (`{v:[…], c, s}`) or remove it. The "Desde costa" filter in `species.js` currently relies on this unsourced field.

**H-05 · Data · High: coordinates are reference centroids; several render off the coastline**
- **Location:** `web/data/spots.json` → `coords`, `web/data/zones.json` → `coords`, map in `web/js/screens/map.js`.
- **Measured distance** to the app's own coastline (Natural Earth 10m, accuracy about ±1 km):

  | Spot | Position | Distance |
  |---|---|---|
  | Rada Tilly (locality centroid) | sea | 1,01 km |
  | Bahía Solano (bay centroid) | sea | 1,50 km |
  | Punta Ninfas (Wikipedia) | sea | 1,70 km |
  | Playa Garipe | inland | 2,58 km |
  | El Doradillo | inland | 2,28 km |
  | Puerto Pirámides (comuna centroid) | inland | 1,73 km |
  | Muelle Piedrabuena | inland | 1,24 km |
  | Puerto Lobos | inland | 0,95 km |

  Zone Bahía Arredondo is 1,53 km inland. Others are within 0,6 km. Three spots have no coordinates at all: `playa-canto` (a spot with a documented life-risk incident), `el-sombrerito`, `comodoro-km`. They are not on the map.
- **Expected behaviour:**
  - The brief demands verified coordinates on the coastline.
  - Obtain the actual fishing access point per spot (official tourism pages, municipal maps, OSM features such as `natural=beach` or `man_made=pier`, or a field survey).
  - Validate each against a high-resolution coastline: OSM coastline at 1:10k, not Natural Earth.
  - Add a validator rule: distance to coastline < 300 m.

**H-06 · Accessibility / UX · High: touch targets too small for one-handed beach use**
- **Location:** `web/css/app.css`.
- **Measured:**

  | Element | Size | Rule / code |
  |---|---|---|
  | Source badges | 23 px tall | `.badge { … font-size: 11px; … line-height:1.6 }` |
  | Map markers | 22×22 px | `L.divIcon({ iconSize: [22, 22] })` in `map.js` |
  | Heatmap cells | ~24×23 px at 800 px wide | `.heat td button { min-height: 34px }`; width shrinks to about 24 px |
  | Species month strip | 6 px | `.months i { height: 6px }` |
  | Chart event labels | 11–12 px | — |

- **Expected behaviour:**
  - At least 44×44 px tap area: enlarge hit areas with padding or pseudo-elements; markers 44 px hit area.
  - Readable sizes (≥ 14 px for data).
  - Test in direct sunlight with the "Alto contraste" theme.

**H-07 · UX · High: the core question "where, when and with what bait do I fish tomorrow" cannot be answered quickly**
- **Location:** app-wide; no planner screen.
- **Current flow to answer it:**
  1. Open the spot picker, choose a spot.
  2. Press "next day".
  3. Read the curve.
  4. Open Especies, find the species, scroll to the ficha.
  5. Only 3 species have baits.

  Map colours are for *now*, not tomorrow (M-08). That is well over 10 s, and usually ends at "Sin dato verificado".
- **Expected behaviour:** a "Mañana / próximos 3 días" planner card on the home screen. For favourite spots it shows:
  - best daylight tide windows (user window)
  - wind summary
  - species in season (from heatmap data)
  - verified baits for those species
  - active alerts
- **Note:** this depends on H-02 and H-03 for content.

**H-08 · Data integrity · High: unsourced claim inside a sourced fact**
- **Location:** `web/data/spots.json`, line ~221, spot `cabo-raso`.
  ```json
  {"k": "servicios", "t": "Camping con parcelas, fogones y baños secos (reportado en 2024; otra nota de 2026 lo describe como deshabitado: verificá).", "c": "local", "s": ["rionegro-caboraso-2024", "rionegro-camarones-2024"]}
  ```
- **Problem:** the "otra nota de 2026" (a Canal 26 article) is **not** among the sources; its entry was removed because the exact URL was unknown. The fact asserts something its sources do not support.
- **Expected behaviour:** remove the parenthetical, or add the exact Canal 26 URL as a source and mark the discrepancy.

**H-09 · Data integrity · High: heatmap mixes fishing season with biological presence**
- **Location:** `web/data/species.json` → `mero.season` and `besugo.season`; `web/js/screens/calendar.js`.
- **Current behaviour:**
  - Mero is mapped `["s","s","p","p","p",null,…,"s"]` from a biology statement: it leaves shallow reefs in winter and spring, returns in summer, and peaks in autumn.
  - Besugo is mapped all-year with a "peak" Dec–May from "más abundante en arrecifes costeros en verano–otoño".
  - Both are boat species in Chubut sources, yet appear as orange "pico" cells in the same visual vocabulary as fishing seasons.
  - A footnote mentions it, but cells are indistinguishable.
  - The month mapping (which months count as "verano–otoño") is the builder's interpretation.
- **Expected behaviour:** remove these from the shore heatmap (they are boat species), or render biology-only data with a distinct pattern and legend.

**H-10 · Functionality · High: tide data load failure is unhandled**
- **Location:** `web/js/screens/tide.js` → `load()`; `web/js/tide.js` → `loadYear()`.
  ```js
  // screens/tide.js load()
  if (spot.tide?.port && official) {
    tide = await dayTide(spot.tide.port, key);   // no try/catch
  ```
  `loadYear()` does `fetch(file).then((r) => r.json())` without checking `r.ok`. A failed or corrupt fetch rejects, and `load()` aborts: the screen stays with stale or empty content and no message. The same applies in `screens/spot.js` (mini chart) and `screens/map.js` (`await dayTide` inside the marker colouring loop, which would stop colouring all subsequent markers). The promise cache in `yearCache` also keeps a rejected promise forever.
- **Expected behaviour:** catch errors, show an explicit error card, and do not cache rejected promises.

**H-11 · Functionality · High: weather card shows "Cargando pronóstico…" forever when the API fails while online**
- **Location:** `web/js/screens/tide.js` → `renderWind()`.
  ```js
  if (!fc) {
    card.innerHTML = `… ${noData(navigator.onLine ? 'Cargando pronóstico…' : 'Sin conexión y sin pronóstico guardado')} …`;
  ```
- **Problem:** `pointForecast()` returns `null` on failure when there is no cache, after the request has *finished*. `navigator.onLine` is usually true, so the card claims it is still loading. The same pattern affects the index (V factor "sin pronóstico").
- **Expected behaviour:**
  - Distinguish "loading" (before the promise settles) from "failed" (settled with null).
  - Show "No se pudo obtener el pronóstico" with a retry button.

**H-12 · Data / Regulations · High: possible spot inside protected areas with unknown limits**
- **Location:** `spots.json` → `bahia-solano`, `caleta-cordova`, `camarones`, `punta-ninfas`, `isla-escondida`.
- **Problems:**
  - **Bahía Solano and Caleta Córdova** (north of Comodoro) lie in the coastal stretch of the **ANP Rocas Coloradas** (Ley XI Nº 72; about 30 km of coast north of Comodoro per a HCDN project). Its boundaries and fishing rules were not found. The app lists both as spots and Rocas Coloradas only as a coordinate-less zone.
  - **Camarones:** the Parque Provincial Patagonia Azul has a "Portal Isla Tova" accessed via Camarones, and its exact limits are unknown.
  - **Punta Ninfas:** elephant seal colony; status relative to any protected area is not verified.
  - **Isla Escondida:** elephant seal harems, with people reported fishing among them.
- **Expected behaviour:**
  - Obtain the official boundaries of Ley XI Nº 72 and Ley XI Nº 90 (Boletín Oficial annexes).
  - If a spot falls inside, move it to zones or attach the area's rules.
  - Add the 50 m elephant-seal rule (Ley XI Nº 92) as a danger on Isla Escondida, which is partially done.

**H-13 · Legal / Content · High: SHN data redistribution permission unresolved**
- **Location:** `web/data/tides/*`, README, MANTENIMIENTO.md (which mentions it).
- **Problem:** the SHN site footer says "© Todos los Derechos Reservados". Publishing the app with bundled SHN predictions without written permission is a legal risk.
- **Expected behaviour:** obtain written permission (shn@hidro.gov.ar) before public deployment, and state it on the Fuentes page.

**H-14 · Data · High: three species images are not the species or region claimed, and one group image represents one species**
- **Location:** `web/data/images.json`, `tools/fetch_images.py` → `FILES`.

  | Species | Image problem |
  |---|---|
  | `pejerrey` | *Odontesthes argentinensis* from Mar del Plata (not *O. smitti*, the main Chubut species; noted) |
  | `bacota` | Aquarium photo in Auckland, New Zealand |
  | `gatopardo` | Photo from South Africa |
  | `rayas` | One species (*Sympterygia bonapartii*) for a group that includes an electric ray |
  | `salmon`, `turco` | 19th-century plates (acceptable but not photographic) |
  | `chucho` | Specimen photo from a barcode database |

- **Expected behaviour:** prefer licensed photos of Argentine Patagonian specimens (iNaturalist research-grade CC-BY from Chubut, CENPAT, Proyecto Arrecife with permission). The "rayas" card needs a per-species breakdown or several images.

### MEDIUM

**M-01 · Functionality · Medium: race condition when changing dates or spots quickly**
- **Location:** `web/js/screens/tide.js` → `load()`.
- **Problem:** each call awaits `dayTide()` and then assigns `current = {…}`. Two rapid clicks (e.g. "next day" twice) can resolve out of order: the older request finishes last, overwriting `current` with the previous day's tide while `key` (closure variable) already holds the newer date. The chart then shows one day's data labelled as another. The only guard is after the forecast:
  ```js
  if (current.spot !== spot) return;   // compares spot only, not the date/request
  ```
- **Expected behaviour:** use a request token (incrementing id). Ignore stale results for both `dayTide` and `pointForecast`.

**M-02 · Design · Medium: the hero water does not represent the absolute tide**
- **Location:** `web/js/screens/tide.js` → `updateSelection()`; `web/js/water.js`.
  ```js
  water.setLevel(0.07 + 0.27 * ((hNow - range[0]) / Math.max(0.1, range[1] - range[0])));
  ```
- **Problem:** the level is normalised to the *day's* min/max and squeezed into 7–34 % of the hero height so it doesn't cover the text. A neap-tide high and a spring-tide high look identical, and a 2 m day looks the same as a 5 m day. The brief: "water level physically rises and falls following the real tide".
- **Expected behaviour:**
  - Normalise to the port's annual extremes (`yearStats.lowMin`/`highMax`) so amplitude differences are visible.
  - Show a scale or height ticks on the water.
  - Redesign the layout so text is never overlapped instead of compressing the range.

**M-03 · Tides · Medium: "Amplitud del día" uses a different definition from the SHN figures it is compared to**
- **Location:** `web/js/tide.js` → `dayTide()` and `amplitudeIndex()`.
  ```js
  if (mid >= start && mid < end) amplitude = Math.max(amplitude, Math.abs(around[i + 1].h - around[i].h));
  …
  const mean = info.port.reference ? info.port.meanRange : info.ref.yearStats?.[String(year)]?.rangeMean;
  ```
- **Problems:**
  1. The app takes the maximum single rise or fall in the day. Over 2026 this reaches 5,22 m at Madryn, while the SHN's published 2026 "Amplitud Máxima" for Madryn is 5,04 m. So "% de la amplitud media SHN" compares unlike quantities.
  2. For secondary ports `meanRange` is the SHN 19-year (Metonic) mean amplitude; for reference ports it is the 2026 mean. The two bases are inconsistent.
- **Expected behaviour:** adopt the SHN definition (find it in the SHN glossary, `Form_TMareas.asp?op=11`) and the same basis for all ports, or label the metric as the app's own without comparing.

**M-04 · Tides · Medium: sicigia/cuadratura label can contradict the amplitude shown next to it**
- **Location:** `web/js/astro.js` → `moonDay()`.
  ```js
  const regime = dSyzygy <= 0.07 ? 'sicigia' : dQuad <= 0.07 ? 'cuadratura' : null;
  ```
- **Problem:** this is purely moon-phase based, with a ±0,07 phase window (about ±2 days) chosen by the builder. It ignores the tidal lag in Patagonia ("edad de la marea") and perigee. On 16/10/2026 the screen showed "Cuadratura: tendencia a mareas chicas" while the amplitude card said "Por encima de la media: 110 %".
- **Expected behaviour:** derive the spring/neap indication from the official daily amplitudes (e.g. a local maximum of amplitude within ±3 days), or show both clearly labelled. There is no official "coeficiente" for Argentina; say so.

**M-05 · Data integrity · Medium: pejerrey "peak" extrapolated from one spot to the whole species**
- **Location:** `web/data/species.json` → `pejerrey.season` (`"p"` in Sep–Oct).
- **Problem:** the peak comes from the Rawson municipality's statement about Bajo Los Huesos only ("mejor época septiembre y octubre"), but it is displayed as a species-wide peak for the whole coast.
- **Expected behaviour:** keep the peak only in that spot's data (requires H-02's per-spot months), or source a coast-wide peak.

**M-06 · Data integrity · Medium: weakly supported species-per-spot and copy without badge**
- **Location and problems:**
  - `spots.json` → `escollera-rawson`: species "róbalo, mero" are backed by welcomeargentina (spot-specific) plus `uepp-rawson`, which is a *generic* list for the Rawson coast, not the jetty. That is effectively one spot-specific source.
  - `species.json` → `salmon.lede` ("Poco tiene que ver con un salmónido: … fiel a su roca") is rendered in `species.js` without any badge. It paraphrases `pa-salmon`.
  - `species.json` → `rayas.chubut` is marked `"c": "oficial"` but mixes ISRA (official) with two tourism and press sources.
  - `species.json` → `gatuzo.habitat` is marked `"oficial"` but cites `pa-gatuzo` (scientific) + ISRA.
- **Expected behaviour:**
  - Badge every visible factual sentence.
  - Set `c` to the weakest-justified level when sources are mixed, or split the facts.

**M-07 · Data · Medium: approximated tide reference distances are not disclosed numerically**
- **Location:** `spots.json` → `tide.kind: "aproximacion"`.
- **Problem:** 12 spots use a reference port without official correction:
  - Bajo Los Huesos uses Rawson, about 15 km away.
  - Playa Garipe and El Doradillo use Madryn, about 10–15 km.
  - Rada Tilly uses Comodoro.

  Times may differ by minutes to tens of minutes, especially across a gulf. The label exists, but the user isn't told the distance or the risk.
- **Expected behaviour:**
  - Show the distance to the reference port.
  - Add a caution ("la hora real puede diferir; dejá margen").
  - Request SHN secondary data, or use the nearest secondary port with the same exposure.

**M-08 · Functionality · Medium: map marker colours ignore the selected date and time**
- **Location:** `web/js/screens/map.js`.
  ```js
  const winds = await multiWind(spotsWithCoords.map((s) => s.coords), now());
  … computeIndex({ tide, sun: sunDay(key, …), wind: winds ? winds[i] : null, at: now() })
  ```
- **Problem:** the map always shows the index for *now*. The user cannot see tomorrow's best spots. The legend says "Índice alto/bajo" without stating the time.
- **Expected behaviour:** add a date/time selector on the map, shared with the tide screen state, and state the time in the legend.

**M-09 · Functionality · Medium: fishing index defaults inflate scores**
- **Location:** `web/js/fishindex.js`.
- **Problems:**
  - `tideFactor()` returns 0,5 when no window is defined.
  - `seasonFactor()` returns 0,5 when the species has no season data.
  - When no target species is chosen, E is dropped and V gets 60 % of the weight.

  With light wind and nothing configured, the score is 71–94: Puerto Lobos showed 94 with "Marea y luz: sin tabla". Users may read a high number as a recommendation.
- **Expected behaviour:**
  - Don't show a score when fewer than 2 factors are real.
  - Display "incompleto" instead.
  - Exclude neutral defaults from the weighted average.

**M-10 · Design / Data · Medium: restricted zones are points without boundaries**
- **Location:** `web/data/zones.json`; `map.js` (zone markers).
- **Problem:** zones such as Península Valdés intangible strips, El Doradillo (25 km of coast), Punta Tombo AMP (about 3 nm) and the PIMCPA (1 nm marine + 1.500 m land) are shown as a single icon. Five zones have no coordinates and appear only in a text list. An angler cannot tell whether a beach is inside.
- **Expected behaviour:** draw official polygons where a legal text defines them (PIMCPA treaty limits, El Doradillo Punta Arco–Cerro Prismático, PV plan zoning). Otherwise draw nothing and say so.

**M-11 · Content · Medium: hard-coded licence price outside the data files**
- **Location:** `web/js/screens/spot.js` → `renderSpot()`.
  ```html
  <p …>Para pescar en el mar necesitás licencia (desde la costa, $2.000 al 16/10/2026). No hay tallas ni cupos publicados: consultá la normativa vigente.</p>
  ```
- **Problem:** when `regulations.json` is updated, this text goes stale.
- **Expected behaviour:** read the price and its date from `DB.regulations.license`.

**M-12 · Content · Medium: Sources page lacks the consolidated excluded-data list**
- **Location:** `web/js/screens/more.js` → `renderSources()`.
- **Problem:** the brief and this audit require the Fuentes page to show what was excluded. Currently excluded items are scattered:
  - `regulations.json.excludedNotVerified` (2 items, shown on Normativa)
  - `species.json.excluded` (shown on Especies)

  The large exclusion list in `research/INFORME_INVESTIGACION.md` §6–7 is not in the app at all: discarded spots, single-source items, unverified rules. Also, every source shows the same default verification date, with no per-source dates.
- **Expected behaviour:** add `data/excluded.json` (item, reason, sources consulted) and render it on Fuentes. Store a real `verified` date per source.

**M-13 · Content / Safety · Medium: unverified emergency number presented as a call button**
- **Location:** `web/data/safety.json` → `emergency`; `more.js` → `renderSafety()`.
- **Problems:**
  - "911 · Emergencias coordinadas (funcionamiento actual en Chubut no verificado)" is a full tap-to-call tile.
  - The Prefectura Puerto Madryn number `(0280) 445-1603` is sourced only to press (`dj-ballenas-2024`).
  - There are no numbers for Prefectura Rawson, Camarones or Comodoro.
- **Expected behaviour:** show only officially verified numbers as primary tiles, list the others as "a confirmar", and obtain official PNA numbers (§6).

**M-14 · Accessibility · Medium: modal and sheet keyboard handling**
- **Location:** `web/js/ui.js` → `openModal()`; `web/js/screens/map.js` (bottom sheet).
- **Problems:**
  - The modal focuses the close button and closes on Esc, but there is **no focus trap**: Tab moves to the page behind.
  - The map bottom sheet can only be dismissed by tapping the grip or the map. It has no close button, no Esc handling and no focus management.
  - The map container has `role="application"`, which can trap screen-reader users.
- **Expected behaviour:**
  - Add a focus trap and restore focus.
  - Add a close button and Esc handling on the sheet.
  - Remove `role="application"` or provide an accessible list alternative, which partially exists on desktop.

**M-15 · Functionality · Medium: service worker update UX and dev bypass**
- **Location:** `web/sw.js`, `web/js/main.js`.
- **Problems:**
  - Cache-first for all same-origin requests means data updates reach users only after `tools/build_precache.py` is re-run and the new SW installs. There is no "nueva versión disponible" prompt; the SW calls `skipWaiting()`, so a page may run old JS against new cached files until reload.
  - On localhost the SW is disabled unless `?sw`, so offline regressions are easy to miss.
- **Expected behaviour:** add an update notice with a reload button, and add an automated offline test.

**M-16 · Tides · Medium: Bahía Solano secondary correction is uncertain**
- **Location:** `tide_ports.json` → `BSOL` (`heightCorrectionUncertain: true`), raw `"0 00"` in the height columns.
- **Problem:** the app applies 0,00 m and shows a warning banner. This is still an assumption.
- **Expected behaviour:** confirm with the SHN (printed table H-610 or email), or treat it as a reference-only approximation.

**M-17 · Data · Medium: Pez gallo season inconsistent between spot and species views**
- **Location:** `spots.json` → `bajo-los-huesos` facts vs `species.json` → `pez-gallo.season`.
- **Problem:** the spot says gallo "desde octubre" (municipal source). The species heatmap marks September as season (general source, not Chubut-specific: pescadordeportivo.net).
- **Expected behaviour:** reconcile, preferring the Chubut-specific source, or show both with their scope.

### LOW

**L-01 · Functionality · Low: "current month" computed in UTC, not Argentina time**
- **Location:** `web/js/screens/calendar.js` line 7, `web/js/screens/species.js` line 6.
  ```js
  const nm = new Date().getUTCMonth() + 1;
  ```
- **Problem:** between 21:00 and 24:00 ART on the last day of a month, the heatmap highlight, the "En temporada ahora" filter and the month strip use the next month.
- **Expected behaviour:** use `parts(now()).m` from `util.js`.

**L-02 · Content · Low: English left in the UI**
- **Location:** Leaflet zoom control (`map.js`: `L.control.zoom({ position: 'bottomright' })`).
- **Problem:** title and aria-label are "Zoom in" / "Zoom out".
- **Expected behaviour:** `L.control.zoom({ zoomInTitle: 'Acercar', zoomOutTitle: 'Alejar', … })`.

**L-03 · Functionality · Low: map search only works on exact names**
- **Location:** `map.js`: `#mapq` `change` handler matches `x.name.toLowerCase() === value`.
- **Problem:** partial text does nothing, and no results list exists. On desktop, after selecting a spot, the default side-panel list (spots without coordinates, other zones) can't be brought back without leaving the screen.
- **Expected behaviour:** add incremental filtering with a result list and a "volver a la lista" control.

**L-04 · UX · Low: favorites have no dedicated view**
- **Location:** `store.js` → `favorites`; used only in `screens/common.js` → `spotPicker()`.
- **Expected behaviour:** a favorites strip on the home screen and a map filter.

**L-05 · Functionality · Low: catch log limitations**
- **Location:** `more.js` → `renderLog()`.
- **Problems:**
  - No edit.
  - Deletion uses blocking `confirm()`.
  - No photo.
  - The tide auto-fill uses the spot's reference or approximation port without saying so.
  - The datetime default is computed once at render.
  - Stats have no size or weight summaries.
- **Expected behaviour:** add edit, an inline confirmation, a photo (stored in IndexedDB), and note the tide source.

**L-06 · Accessibility · Low: noisy live region and generic labels**
- **Location:** `screens/tide.js` (`<div class="tide-readout" aria-live="polite">`), `astro.js` → `moonSvg()` (`aria-label="Fase lunar"`).
- **Problems:** every scrub step re-announces the whole readout, and the moon image label doesn't include the phase name.
- **Expected behaviour:** announce only on release, and set `aria-label` to the phase name and illumination.

**L-07 · Performance · Low: WebGL loop runs while the hero is off-screen; Leaflet loaded on every screen**
- **Location:** `web/js/water.js` (stops only on `document.hidden`), `web/index.html` (loads `vendor/leaflet/leaflet.js`, 147 KB, on all routes).
- **Expected behaviour:** pause the render loop with an IntersectionObserver, and lazy-load Leaflet on `#/mapa`.

**L-08 · Performance · Low: 4 MB precache on first visit, including all 1200 px images**
- **Location:** `tools/build_precache.py`, `web/img/species/`.
- **Expected behaviour:** use responsive image sizes (e.g. 600 px for cards, WebP/AVIF), and consider caching images on first view instead of at install.

**L-09 · Functionality · Low: selected date is not in the URL or persisted**
- **Location:** `screens/tide.js` (`key` local variable), router in `main.js`.
- **Expected behaviour:** use `#/marea/:spot/:date`, so a tide day can be shared or bookmarked and the back button restores it.

**L-10 · Tides · Low: slack-water label heuristic**
- **Location:** `web/js/tide.js` → `stateAt()`.
  ```js
  const nearSlack = Math.min(t - prev.t, next.t - t) < 30 * MIN;
  ```
- **Problem:** "estoa" is labelled within ±30 min of any event. This threshold is not sourced; real slack duration varies by site.
- **Expected behaviour:** label it as approximate, or use the SHN's own definition if one exists.

**L-11 · Data · Low: 19 source URLs could not be confirmed by automated check**
- **Location:** `web/data/sources.json`.
- **Problem:** of 151 sources, 132 returned HTTP 200. The other 19 failed:

  | Result | Sources |
  |---|---|
  | Timeout (Proyecto Arrecife, slow under parallel requests) | `pa-salmon`, `pa-mero`, `pa-turco`, `pa-escrofalo`, `pa-besugo`, `pa-caballa`, `pa-cazon`, `pa-gatuzo`, `pa-palometa`, `pa-reglamentos` |
  | 503 (Diario Jornada, likely bot protection) | `dj-2018-escollera`, `dj-pv-acceso-2026`, `dj-escondida-2023`, `dj-gatopardo-2026` |
  | 403 | `osm`, `perceptivetravel`, `pescadordeportivo-gallo`, `mongabay-2025` |
  | 406 | `natural-earth` |

- **Expected behaviour:** check these manually in a browser, and archive critical sources (Wayback Machine) with the archived URL stored.

**L-12 · Weather · Low: weather fetched at reference centroids; waves often null in gulfs**
- **Location:** `screens/common.js` → `spotPoint()`, `weather.js`.
- **Problem:** for inland centroids (H-05) wind is taken slightly inland. Marine variables return `null` for gulf cells (observed at Madryn), and the app shows "sin dato del modelo".
- **Expected behaviour:** add a per-spot `marinePoint` (an offshore coordinate in open water), documented.

**L-13 · Content · Low: Rada Tilly ordinance number unknown**
- **Location:** `spots.json` → `rada-tilly` legal facts.
- **Problem:** the facts come from a 2021 municipal news note, and the ordinance number is not cited.
- **Expected behaviour:** cite the ordinance number and text (Concejo Deliberante de Rada Tilly).

**L-14 · Design · Low: visual identity strong on the hero, generic below it**
- **Location:** tide screen below the hero, Más, Normativa, Bitácora.
- **Problem:** these are a standard card grid. The species pages and the dark custom map are the most distinctive parts. Measured against the brief's "Awwwards/Apple-level" standard, the lower half of the home screen reads as a typical dashboard: three equal stat cards, wind card, index card.
- **Expected behaviour:**
  - Integrate wind, sun and moon into the curve itself as one timeline (wind barbs above the curve, sun arc behind it).
  - Give the alerts a stronger visual treatment tied to the tide timeline, e.g. "la escollera se corta en 40 min".

---

## 5. What an angler would still miss (beyond the brief)

1. **"Mañana en mis spots" planner**: the main daily question in one card (see H-07).
2. **Tide-cut-off countdown per spot**: "volvé antes de las 21:30". This needs sourced cut-off heights per spot; rescues at Rawson, Playa Canto and Caleta Córdova prove the need.
3. **Wind relative to the coast (onshore/offshore/cross) per spot**: on this coast, wind direction relative to beach orientation matters more than speed.
4. **Official SMN weather alerts** (Servicio Meteorológico Nacional "alertas"): an official source, unlike the Open-Meteo model.
5. **Live marea roja status** from marearoja.chubut.gov.ar with dates: bans change every few weeks and affect bait collection.
6. **GPS "spots near me" and distance/driving time**, plus "last fuel before" notes: remote coast, long gravel roads, no fuel.
7. **Offline map tiles of the coast at street/track level**: the current Natural Earth outline cannot guide you to an access track.
8. **Bait-shop directory** (verified, per town): the brief asked for it and anglers need it before leaving.
9. **Shark and ray release guide** (gatopardo legal obligation, CR/VU species): practical handling, circle hooks, photos of key ID features.
10. **Knot and rig diagrams** for verified shore rigs: turns "Aparejo" text into something usable on the beach.
11. **Emergency SMS/WhatsApp with GPS coordinates that works offline-first**: extends "avisá a alguien" with the real position.
12. **Licence reminder and DINO deep link** on the home screen when the user has no saved licence date.
13. **Personal stats tied to tide and moon** (from the catch log): lets each angler discover their own best window, replacing the missing sourced "best tide".
14. **Spot photos and access-track descriptions** (licensed): decide on access and parking without driving there.
15. **Community reports, moderated and labelled as unverified**: fresh "pique" info, kept separate from verified data.

---

## 6. Data that could not be verified and which source would settle it

| # | Missing / unverified data | Source that would settle it |
|---|---|---|
| 1 | SHN tide predictions for 2027 (and later) | SHN, `https://www.hidro.gob.ar/oceanografia/Tmareas/Form_Tmareas.asp` (run `tools/fetch_shn.py 2027` when published), or the printed H-610 "Tablas de Marea" |
| 2 | Permission to redistribute SHN predictions in a public app | Written authorization from SHN (shn@hidro.gov.ar) |
| 3 | Official SHN definition of amplitude; mean spring and neap ranges per port | SHN glossary (`Form_TMareas.asp?op=11`) and "Datos de marea" tables on nautical charts H-264, H-215/H-219, H-311, H-357A/B |
| 4 | Tide corrections for Playa Unión, Bajo Los Huesos, Rada Tilly, Caleta Córdova, Puerto Lobos; Bahía Solano height-correction format | SHN Departamento Oceanografía (mareas@hidro.gov.ar), formal request |
| 5 | Minimum sizes, bag limits and closed seasons for marine recreational species in Chubut | Secretaría de Pesca del Chubut (Libertad 279, Rawson; pesca.chubut.gob.ar) and Boletín Oficial del Chubut |
| 6 | Text of Disposición 214/1994 (Península Valdés fishing) | Boletín Oficial del Chubut archive; Administración Península Valdés |
| 7 | Validity and exemptions of the marine licence (costa) | Secretaría de Pesca del Chubut / pescacontinental.gob.ar (DINO) |
| 8 | Whether recreational shore fishing is allowed in Parque Provincial Patagonia Azul (Cabo Dos Bahías, Caleta Sara, Bahía Bustamante, Arroyo Marea, Bahía Arredondo); its boundaries | Plan de Manejo of Ley XI Nº 90 (Ministerio de Turismo y Áreas Protegidas del Chubut); Boletín Oficial annexes |
| 9 | PIMCPA use regulations (usos permitidos/prohibidos) | Administración de Parques Nacionales, intendencia PIMCPA (Camarones) |
| 10 | Boundaries and fishing rules of ANP Rocas Coloradas (affects Bahía Solano and Caleta Córdova) | Ley XI Nº 72 full text with annex; Subsecretaría de Conservación y Áreas Protegidas del Chubut |
| 11 | Fishing rules at Punta Loma, Punta Tombo, Punta del Marqués, Cabo Dos Bahías; status of Golfo San José as Parque Marino | Subsecretaría de Conservación y Áreas Protegidas del Chubut; Municipalidad de Rada Tilly (Punta del Marqués, Ley XI Nº 100 plan) |
| 12 | Final (non-preliminary) Península Valdés zoning, with maps of El Riacho–Larralde and Punta Ameghino–Punta Arco shore-fishing areas | Administración Península Valdés (peninsulavaldes.org.ar), Plan de Manejo maps |
| 13 | Exact access/fishing coordinates per spot, on the coastline | Municipal tourism offices (Madryn, Rawson, Comodoro, Rada Tilly, Camarones), OSM high-resolution features, field GPS survey |
| 14 | Bottom type per spot | SHN nautical charts (sea-bed annotations); CENPAT-CONICET coastal geomorphology studies; club knowledge (2+ sources) |
| 15 | Best tide phase, casting distance and species-by-month per spot | Fishing clubs (Club de Pesca El Golfo – Madryn; Club de Pesca y Náutico Rawson; Club de Pesca, Náutica y Caza Submarina Trelew; Comodoro clubs) contest records; Bovcon (2016) PhD thesis on Chubut coastal recreational fisheries (not found online, request from CENPAT/UNPSJB) |
| 16 | Shore rigs, hook sizes, ranked baits, best hours for pejerrey, róbalo, cazón, rayas, gatuzo, palometa in Chubut | Same clubs and thesis; Argentine fishing media with Chubut-specific articles (Weekend, Aire Libre) needing a second independent source |
| 17 | Species identity of contest "pejerrey" in Chubut (O. smitti vs others) | CENPAT-CONICET ichthyologists (e.g. authors of Carballo et al.) |
| 18 | Whether bacota, pez ángel, palometa and gatuzo are caught from shore in Chubut | Bovcon thesis; ISRA authors (IUCN SSC SSG); club records |
| 19 | Official Prefectura duty phones (Rawson, Camarones, Comodoro, Madryn) | Prefectura Naval Argentina official directory / delegations |
| 20 | Whether 911 is operational across coastal Chubut | Ministerio de Seguridad del Chubut |
| 21 | Official approach distance to penguin colonies | Subsecretaría de Conservación y Áreas Protegidas del Chubut |
| 22 | Current state of Cabo Raso services (2024 vs 2026 reports) | Comuna or provincial tourism office; the exact Canal 26 2026 article URL |
| 23 | Muelle Piedrabuena hours for anglers; cruise-day closures | Administración Portuaria de Puerto Madryn (APPM) |
| 24 | Bait shops and fuel availability per town | Municipal tourism offices; verified business listings |
| 25 | Licensed regional photographs of the species (Chubut specimens) | iNaturalist research-grade CC-BY observations from Chubut; Proyecto Arrecife / CENPAT (with permission) |
| 26 | Open-Meteo commercial licence (if the app is monetised) | Open-Meteo, open-meteo.com/en/pricing |
