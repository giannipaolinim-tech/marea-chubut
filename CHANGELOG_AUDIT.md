# Changelog: fixes from AUDIT_REPORT.md

**Date:** 2026-10-17.

**Rules followed:** the owner decisions 1 to 6 and the two-level confidence policy.

| Level | Applies to | Accepted sources |
|---|---|---|
| Strict | Safety, legal, protected areas, tides, coordinates | An official source or 2+ independent sources |
| Practical | Fishing tips | A single Chubut-specific source, shown as "Fuente única" |

**Verification:**
- `tools/validate_data.py` reports **0 errors**.
- `tools/test_offline.py` passes.
- Manual offline test with `?sw` and the server stopped passes.
- No browser console errors across all routes in mobile (375×812) and desktop.
- All three themes measured at WCAG AA (worst case 5,34:1).

## 1. Changelog by report ID

### Critical

**C-01: tide coverage ends on 31/12/2026.**
- Per owner decision 2, no 2027 work.
- A quiet note in Ajustes → "Tablas de marea cargadas" shows the exact bundled range.
- No countdown banner.
- Files: `web/js/screens/more.js` (`renderSettings`), `web/js/tide.js` (`bundledRange`).

**C-02: shore-only.** All boat-only content is removed:
- Spots: Puerto Pirámides boat facts; Camarones "embarcación" modality and its "pesca embarcada" text; Isla Escondida boat-ramp fact and drifting-boat danger.
- Species: salmón, mero, turco, escrófalo, besugo and caballa removed. They are listed as excluded with the reason "Solo documentada pesca embarcada en Chubut". The "embarcado" modality on cazón was unsourced and is removed. The salmón boat rig went with the species.
- Species screen: the "Embarcado" filter is removed (`species.js`).
- Regulations: only the shore licence category remains, plus one line noting other categories exist, linked to the authority. The `embarcaciones-madryn` and `submarina` rules are removed.
- Zones: `pv-navegacion` is removed. The whale-from-boat item is removed from safety.
- Meta description: boat wording removed.
- Heatmap: rebuilt, now shore species only (`calendar.js`).
- Whole-codebase grep for embarc / embarcado / embarcación / garete / deriva finds only:
  - the mandated exclusion reasons;
  - one quoted legal text from the Rocas Coloradas plan ("de costa o embarcada");
  - "deriva controlada", a shore technique for pez gallo.
- Files: `web/data/spots.json`, `species.json`, `regulations.json`, `zones.json`, `safety.json`, `sources.json`, `excluded.json`, `web/index.html`, `web/js/screens/species.js`, `calendar.js`.

**C-03: Puerto Pirámides is now a zone.**
- New zone `puerto-piramides` ("restringida: pesca de costa no habilitada por el Plan de Manejo"), with `tidePort: "PIRA"` so its SHN tide stays available.
- Files: `zones.json`, `spots.json`, `web/js/tide.js` (`portInfo` accepts zones).

**C-04: no silent "—".**
- `dayTide()` now returns `dataFrom`, `dataTo` and `covered`.
- Outside the bundled range, the readout shows "Sin dato" plus "Fuera del rango de la tabla oficial cargada" with the first and last loaded event. An alert banner says the same.
- The chart draws only continuous data runs. Gaps are hatched and labelled "Fuera del rango de la tabla oficial cargada", wrapping on narrow screens.
- The day amplitude card states the same message.
- Verified on 1 Jan 00:00 and 31 Dec 23:59.
- A multi-year loading bug found during testing was also fixed: the loader skipped middle years in a range.
- Files: `web/js/tide.js`, `web/js/chart.js`, `web/js/screens/tide.js`.

### High

**H-01: coverage.**
- New spots:
  - **El Riacho** and **Playa Larralde**: the only shore-fishing areas in the Península Valdés plan; OSM access points.
  - **Barrancas Blancas**: official Comodoro Tourism coordinate and municipal Fiesta del Pescador.
- Researched and rejected with reasons in `excluded.json`:
  - Golfo San Matías coast, Cerro Avanzado, Punta Cuevas, Playa Kaiser/Punta Arco, Villarino, Bengoa, Punta Gales.
  - Bahía Janssen, Bahía Cruz, Punta Clara.
  - Caleta Carolina, Bahía Bustamante, Puerto Visser.
  - Costanera, Km 8, Restinga Alí, Belvedere, Punta Borja, La Herradura.
  - Playa Bonita, Ramón Santos, Playa Ancina (in Santa Cruz).
- The Punta Ameghino–Punta Arco strip turned out to be El Doradillo, on the north/west coast of Golfo Nuevo, so no new beaches came from it. The wrong "costa sur" wording was corrected everywhere.
- Files: `spots.json`, `excluded.json`, `zones.json`, `regulations.json`, `tools/merge_spot_research.py`.

**H-02: spot schema.**
- New fields: `bottom`, `bestTide`, `castingDistance`, `speciesByMonth`, `parking`, `orientation`, `marinePoint`, `cutoff`, `fuel`, `access`.
- The spot page renders "Sin dato verificado" for every null field.
- Files: `spots.json`, `web/js/screens/spot.js`.

**H-03: species schema.**
- New fields: `rigShore {type, hook, line, rod, sinker}`, `bestHours`, `bestTide`, `castingDistance`, `baits[].rank` and `rankBasis`, each sourced or null.
- Filled from research per policy. Single-source tips are shown as "Fuente única". Non-Chubut single-source tips (Río Negro, Buenos Aires, Bahía Blanca) were dropped.
- Files: `species.json`, `web/js/screens/species.js`.

**H-04: modality.**
- `modality` is now a sourced fact `{v, c, s}`.
- **Bacota** removed: no source documents shore fishing for it in Chubut.
- Pez ángel kept as single-source: its ISRA monitoring mixes trawl and shore data.
- The validator enforces it.

**H-05: coordinates on the coastline.**
- Every coordinate is now an access point: an OSM beach, pier root, breakwater end, parking or track end, or an official municipal/tourism coordinate. `kind` records the feature id.
- 23 of 24 spots are within 300 m of the OSM coastline. Playa Canto has no source coordinate; it stays off the map and its page explains why.
- The validator rule is distance < 300 m to the full OSM coastline (`research/geo/osm_coastline.json`, 49,755 nodes).
- Files: `spots.json`, `tools/fetch_coastline.py`, `tools/compute_geo.py`, `tools/validate_data.py`, `web/geo/coastline.json` (map layer, 120 KB).

**H-06: touch targets and readability.**
- Badges keep their visual size but have a ≥44 px hit area via `::after`.
- Buttons, chips, segmented controls and date inputs are ≥44 px. Map markers have 44×44 hit areas.
- Heatmap cells are 44 px with a sticky species column and horizontal scroll at 375 px.
- The month strip is 22 px with readable letters. Chart labels are 12–14 px.
- Files: `web/css/app.css`, `map.js`, `calendar.js`, `species.js`.

**H-07: planner.**
- A "¿Dónde, cuándo y con qué?" planner sits on the home screen, with Mañana, Pasado and En 3 días.
- It uses favourites, otherwise "Cerca mío" (GPS), otherwise three default spots.
- Each card shows: daylight tide events and the user's window, the daylight wind summary relative to the coast, species in season for that spot with their baits and badges, active alerts, and a link to the full day.
- Files: `web/js/screens/planner.js`, `tide.js`, `common.js`.

**H-08: Cabo Raso.**
- The unsupported "otra nota de 2026" parenthetical is removed.

**H-09, M-05, M-17: seasons.**
- Mero and besugo were removed as boat species.
- **Pejerrey:** the peak is no longer coast-wide; it moved to Bajo Los Huesos `speciesByMonth`.
- **Pez gallo:** coast-wide season is Oct–Feb from the Chubut CENPAT source (Rojas & Bovcon). The municipal "desde octubre" is in Bajo Los Huesos `speciesByMonth`.
- **Cazón:** Bahía Engaño Sep–Apr was added per spot.
- Biology-only data now has `seasonKind: "biologia"` and a distinct hatched pattern and legend; no species currently uses it.
- Files: `species.json`, `spots.json`, `calendar.js`, `species.js`, `spot.js`.

**H-10: tide load errors.**
- `loadYear()` checks `r.ok` and evicts failed promises from the cache.
- try/catch was added on the tide screen (error card with "Reintentar"), the spot mini chart (retry button), the map selection and the map colouring loop, the planner and the log.

**H-11: forecast states.**
- `pointForecast()` resolves to `ok`, `cached-offline`, `cached-failed`, `offline` or `failed`.
- The UI shows "Cargando pronóstico…" only while loading. On failure it shows "No se pudo obtener el pronóstico" with a "Reintentar" button. The index V factor shows the same state.
- Verified by simulating an API failure.

**H-12: protected areas.**
- Rocas Coloradas (Ley XI Nº 81) is now an official polygon with its plan rules. Shore fishing with rod is allowed under conditions, so it uses the new zone status "regulada".
- Bahía Solano gets legal facts: the north of the bay is inside the protected area, and Zona Intangible El Islote is adjacent.
- Caleta Córdova is outside.
- Patagonia Azul: its offshore boundary line is drawn; the law says nothing about fishing and there is no approved plan. PIMCPA limits are text only.
- The elephant-seal 50 m rule is reworded correctly: it is a required content of a management plan, not a rule that applies on its own. It appears as a danger on Isla Escondida and Punta Ninfas.
- Files: `zones.json`, `spots.json`, `regulations.json`, `safety.json`, `map.js`.

**H-13: SHN permission.**
- A visible note on Fuentes says the tide data is reproduced from SHN and redistribution permission is pending. The app remains unpublished.

**H-14: images.**
- Replaced with licensed photos:
  - From Chubut: róbalo (Caleta Córdova, CC0), pez gallo (Península Valdés, CC BY), palometa (Playa Unión, CC0).
  - From Argentina: pejerrey (*O. smitti*), gatopardo, chucho, gatuzo, pez ángel.
- "Rayas" is now a two-image gallery: *S. bonapartii* and *D. tschudii*.
- Every image credits author, licence, place and link.
- Files: `web/img/species/*`, `images.json`, `species.js`, `research/raw2/E_images.json`.

### Medium

**M-01: stale results.**
- A request token on the tide screen drops stale `dayTide` and `pointForecast` results; the map colouring has its own token.
- Verified with 6 rapid "next day" clicks: they end on the right date with the right data.

**M-02: hero.**
- Redesigned as two columns, text and a separate water gauge. Text never overlaps the water.
- The water is normalised to the point's annual extremes (`lowMin`/`highMax` computed for 2026), with metre ticks and a height label.
- The WebGL loop pauses off-screen.
- Files: `screens/tide.js`, `water.js`, `app.css`.

**M-03: amplitude.**
- The SHN definition is adopted: high water minus the following low water (SHN glossary, `Form_TMareas.asp?op=11`).
- Recomputing the 2026 max and mean this way matches the SHN published values for all 5 reference ports.
- The same basis applies to secondary ports, which use their own corrected 2026 events.
- The old "% de la amplitud media SHN" comparison is gone. The card shows the day maximum plus the point's 2026 mean and max.

**M-04: spring/neap.**
- Derived from the official daily amplitudes: today's maximum compared with ±3 days, labelled "marea viva", "marea muerta", "intermedia" or the trend.
- The moon phase is shown separately.
- The card says Argentina has no official tide coefficient.

**M-06: badges.**
- `lede` and `sciNote` are now badged facts.
- Mixed-level facts were downgraded: the validator checks that "local" has 2+ independent publishers and that "oficial" cites an official source.
- Same-publisher pairs (Diario Jornada ×2, Río Negro ×2, Superdepor ×2) were downgraded to "unica" where they are practical.

**M-07: approximate tide references.**
- These spots show the straight-line distance to the reference port and "Sin corrección oficial para este punto: la hora real puede diferir; dejá margen".

**M-08: map date and time.**
- A date/time selector is shared with the tide screen (`appState.date`/`minutes`). The legend states the time.

**M-09: index.**
- No score with fewer than 2 real factors ("Índice incompleto").
- Neutral defaults are removed: T counts only with a defined window, E only with documented season data.

**M-10: zone polygons.**
- Drawn only where a legal text gives the vertices:
  - Rocas Coloradas (Ley XI 81)
  - Punta Tombo extension (Ley XI 88)
  - Punta del Marqués extension (Ley XI 95)
  - Patagonia Azul offshore line (Ley XI 90, open line)
- Every other zone keeps its point and shows "Límites oficiales no publicados".
- El Islote is not drawn: its vertex table is an illegible scan.

**M-11: licence price.**
- Read from `regulations.json` in the spot page and the licence card.

**M-12: excluded data.**
- New `data/excluded.json` with 69 items, consolidating species, spots, regulations, single-source safety items and other data, each with reason and sources consulted.
- Rendered on Fuentes, along with per-source verified dates and archived copies.

**M-13: emergency numbers.**
- Only officially verified numbers are primary call tiles:
  - 106, 107, 101, 100, 103
  - Prefectura Madryn (official PNA directory plus a second source)
  - PNA central 0800
- Listed as "a confirmar": 911 (in law, operation unverified) and Prefectura Comodoro (medical-office directory only).

**M-14: modal and sheet accessibility.**
- Modals have a focus trap and restore focus.
- The map bottom sheet has a close button, Esc handling, focus trap and focus restore.
- `role="application"` is removed. There is an accessible spot list: the "Lista" button, the desktop side panel and search results.

**M-15: service worker updates.**
- A "Nueva versión disponible" bar with "Recargar" appears. The waiting worker takes over only after confirmation.
- The automated offline test is `tools/test_offline.py`.

**M-16: Bahía Solano.**
- The warning is kept, and the spot page labels it "Suposición".

### Low

**L-01: current month.**
- `currentMonth()` (Argentina time) is used in the calendar, species screens and spot months table.

**L-02: map zoom.**
- Zoom titles and aria-labels are "Acercar" and "Alejar".

**L-03: map search.**
- Incremental search with a result list, Enter to open the first result, and "← Volver a la lista".

**L-04: favourites.**
- A favourites strip on home, a "★ Favoritos" map filter, and favourites drive the planner.

**L-05: catch log.**
- Edit, inline delete confirmation, and a photo stored in IndexedDB.
- The tide source is shown (port and approximation flag), and the moon phase is stored.
- The datetime default is fresh on focus.
- Stats: size and weight, by species, tide phase, moon phase and month.
- Editorial layout.

**L-06: announcements.**
- The readout is announced only when the scrub is released (separate live region).
- The moon `aria-label` includes the phase name and illumination.

**L-07: performance.**
- WebGL pauses via IntersectionObserver.
- Leaflet is lazy-loaded on `#/mapa`; it was removed from `index.html`.

**L-08: images.**
- `-600.webp` and `-1200.webp` variants with `<picture>`/`srcset`.
- Species images are cached on first view, not precached, so the precache dropped from 61 to 49 files.

**L-09: date in the URL.**
- Route `#/marea/:spot/:date` via `history.replaceState`, so the back button restores the spot and date.

**L-10: slack water.**
- "Estoa" is labelled "(estoa aprox.)". No SHN duration was found.

**L-11: source links.**
- All 19 previously failed URLs were re-checked: they return 200 and the content matches.
- Every source has a real `verified` date: 253 opened on 16/10. `isra-eng` returns a Cloudflare 403 to automated access, but its archive snapshot is verified.
- 83 critical sources have `archivedUrl` on the Wayback Machine.

**L-12: marine point.**
- `marinePoint` is computed for 23 spots: 6 km seaward, perpendicular to the OSM coastline.
- It is used for Open-Meteo marine calls and documented on each spot page.

**L-13: Rada Tilly.**
- Ordenanza **2557/21** (art. 10) is cited.
- New legal alert: since 2025 the water in front of the beach is inside the extended ANP Punta del Marqués (Ley XI Nº 95), whose fishing rules (Ley XI Nº 100 annex) are unpublished.

**L-14: editorial redesign.**
- The card grid is replaced by one integrated timeline: tide curve, wind barbs above it, sun arc and night shading behind it, moonrise and moonset, personal window, cut-off pins, gaps.
- Below it, a facts strip: amplitude, spring/neap, moon, sun.
- Normativa, Seguridad, Bitácora, Guía, Fuentes and Ajustes now use an editorial layout with numbered sections and a sticky index.

### Phase 6 extras

- **Wind relative to the coast:**
  - Onshore, offshore or cross, from beach orientation computed from the OSM coastline.
  - Labelled "calculado a partir de la línea de costa".
  - Shown in the wind card and the planner.
- **Tide cut-off countdown:**
  - Shown only where a strict-rule source states the condition. Today that is Caleta Córdova (Prefectura 2021).
  - It appears as an alert before the next high tide and a pin on the timeline.
  - Escollera de Rawson and Playa Canto were downgraded: see open items.
- **Marea roja:** link to the official page with its last update date (16/10/2026).
- **"Cerca mío":** GPS with straight-line distances in the planner. "Última carga de combustible" appears only where sourced (`fuel`).
- **Emergency share:**
  - The current GPS position goes out via SMS (works with voice signal only) or WhatsApp, with an OSM map link.
  - In Seguridad.
- **Licence reminder:** on home, with the DINO link and a locally saved expiry date.
- **Personal stats:** by tide phase and moon phase in the log.
- **Release guide:**
  - 14 steps from INIDEP / SAGyP / Buenos Aires province / Proyecto Arrecife, plus the Chubut gatopardo law, on the new route `#/guia`.
  - The verified shore rigs are shown with a generic diagram of the parts that have data.
- **New tools:** `fetch_coastline.py`, `compute_geo.py`, `merge_spot_research.py`, `make_responsive_images.py`, `test_offline.py`.
- **Updated tools:** `validate_data.py` (rewritten), `parse_shn.py` (year merge), `build_precache.py` (version stamp, image exclusion).
- **Maintenance guide:** `MANTENIMIENTO.md` sections 0, 3 and 4 updated (policy and tools).

## 2. Open items

| ID | Why it stays open | What would close it |
|---|---|---|
| C-01 | SHN has not published 2027 predictions; owner decided no 2027 work now. | Run `tools/fetch_shn.py 2027` and `parse_shn.py 2027` when the SHN publishes them (see MANTENIMIENTO §2). |
| H-13 | SHN redistribution permission not obtained; app stays unpublished. | Written authorization from shn@hidro.gov.ar. |
| Safety (from H-12/H-02) | Removed by the strict rule; each relied on one press article: the Escollera sur Rawson pleamar incident and cut-off, the Playa Canto rising-tide incident and cut-off, the Rada Tilly "Los Pozones" cut-off, and the Barrancas Blancas and Restinga Alí reports. Listed in `excluded.json`. | Official records from Prefectura Naval (Rawson / Comodoro delegations) or Bomberos de Rawson, or a second independent source. |
| H-05 | Playa Canto still has no coordinate in any source; Punta Delfín uses an OSM cape node because there is no access feature. | Municipal map of Rawson or a field GPS survey. |
| H-02 / H-03 | Many practical fields remain empty: best tide (1 spot), casting distance (2 spots), bottom (8 spots), parking (3 spots); species best hours (3 of 10), best tide (3 of 10), casting distance (2 of 10). Gatuzo, pez ángel and palometa have no Chubut-specific tips (the existing ones are from Buenos Aires). | Club records (Club de Pesca El Golfo, Club de Pesca y Náutico Rawson, Comodoro clubs) and Bovcon (2016) thesis from CENPAT/UNPSJB. |
| Knots | No Chubut shore-fishing source names the knots used, so no diagrams are shown. | A Chubut club or fishing-media article naming knots, then Commons diagrams (candidates in `research/raw2/D_species.json`, `knotDiagramCandidates`). |
| H-12 | Patagonia Azul has no management plan and its fishing rules are unknown; PIMCPA has no recreational rules; Punta del Marqués Ley XI Nº 100 annex (zoning) is unpublished, which affects Rada Tilly; Punta Loma and Punta León have no legal instruments or limits; El Doradillo creation ordinance not found. | Ministerio de Turismo y Áreas Protegidas del Chubut; APN PIMCPA administration; Municipalidad de Rada Tilly / Boletín Oficial annexes; Municipalidad de Puerto Madryn. |
| M-10 | El Islote (Rocas Coloradas) vertex table is an illegible scan, so it is not drawn. | A legible copy of Ley XI Nº 81, Anexo II, p. 155. |
| M-13 | 911 operation in Chubut unconfirmed; Prefectura Comodoro number may not be the duty line; no Prefectura numbers for Rawson and Camarones. | Ministerio de Seguridad del Chubut; Prefectura Naval Argentina official directory. |
| Elephant seal | The 50 m strip depends on a species management plan not yet approved. | Plan de manejo del elefante marino (Subsecretaría de Conservación). |
| H-14 | Cazón keeps its museum-specimen photo (the only open alternative is from Madeira); rayas *D. tschudii* photo has no stated place. | A CC-BY photo of a live *G. galeus* / *D. tschudii* from Argentina (iNaturalist). |
| M-16 | Bahía Solano SHN height correction format ("0 00") is still an assumption. | SHN confirmation or printed H-610 table. |
| Pejerrey | No source identifies the contest pejerrey species in Chubut. | CENPAT-CONICET ichthyologists. |
| §5 skipped | Community reports and offline map tiles are skipped by owner decision. | Future scope. |
| Device test | Not yet tested on a physical iOS/Android phone in sunlight. | Deploy to a private static host and test on devices. |

## 3. Updated counts

**Spots: 24.**
- Previously 22. Changes: −1 Puerto Pirámides (now a zone), +3 El Riacho, Playa Larralde and Barrancas Blancas.
- By region: norte 1, Península Valdés 2, Golfo Nuevo 5, Rawson 9, sur 2, Golfo San Jorge 5.

**Species: 10.** Previously 17. Six boat-only species and bacota were removed; 13 species are now in the excluded list.

**Zones: 17**, 4 of them with legal polygons. **Sources: 254**, 83 archived. **Excluded items: 69.**

Coverage per spot field (24 spots):

| Field | Filled (official/scientific/2+ sources) | Single-source | Empty |
|---|---|---|---|
| Coordinates (≤300 m from OSM coast) | 23 | 0 | 1 |
| Access | 8 | 11 | 5 |
| Parking | 1 | 2 | 21 |
| Bottom type | 3 | 5 | 16 |
| Best tide | 1 | 0 | 23 |
| Casting distance | 0 | 2 | 22 |
| Fuel ("última carga") | 2 | 3 | 19 |
| Tide cut-off | 1 | 0 | 23 |
| Coast orientation / marine point | 23 | 0 | 1 |
| Species by month | 3 | 7 | 14 |
| Species list | 12 | 6 | 6 |
| Dangers | 6 | 0 | 18 |

Coverage per species field (10 species):

| Field | Filled | Single-source | Empty |
|---|---|---|---|
| Modality (shore) | 8 | 2 | 0 |
| ID tips | 10 | 0 | 0 |
| Season (coast-wide) | 4 | 0 | 6 |
| Baits | 2 | 3 | 5 |
| Rig: type / hook / line / rod / sinker | 3 / 0 / 3 / 3 / 1 | 2 / 5 / 2 / 2 / 1 | 5 / 5 / 5 / 5 / 8 |
| Best hours | 0 | 3 | 7 |
| Best tide | 1 | 2 | 7 |
| Casting distance | 0 | 2 | 8 |

## 4. Run the app locally

Run this from the project folder `C:\Users\gpaol\Downloads\Chubut pesca`:

```bash
python -m http.server 8765 --directory web
```

Then open `http://localhost:8765`.

- To test offline mode, open `http://localhost:8765/?sw`, wait a few seconds, then stop the server and reload.
- Opening `index.html` directly (`file://`) does not work, because the browser blocks reading the data files.
- Before publishing, run in order:

```bash
python tools/validate_data.py
```

```bash
python tools/build_precache.py
```

```bash
python tools/test_offline.py
```
