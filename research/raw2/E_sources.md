# E_sources: link check + Wayback archiving (2026-10-16)

Method: every source in web/data/sources.json fetched sequentially (Chrome 130/Windows UA, Accept-Language es-AR, 60 s timeout, up to 3 attempts; 5-10 s delays for the 19 retry ids). contentOk = a title keyword found in the HTML, or a valid %PDF header for PDFs. Wayback: availability API, then CDX API, then Save Page Now for the rest (>=15 s between saves).

## Totals

- Sources covered: 254
- HTTP 200 / verified 2026-10-16: 253
- Not verified: isra-eng (403)
- contentOk false: none
- Wayback targets (oficial + critical): 83; archived: 83

## 19 previously failing ids (retried)

| id | status | contentOk |
|---|---|---|
| pa-salmon | 200 | True |
| pa-mero | 200 | True |
| pa-turco | 200 | True |
| pa-escrofalo | 200 | True |
| pa-besugo | 200 | True |
| pa-caballa | 200 | True |
| pa-cazon | 200 | True |
| pa-gatuzo | 200 | True |
| pa-palometa | 200 | True |
| pa-reglamentos | 200 | True |
| osm | 200 | True |
| natural-earth | 200 | True |
| dj-2018-escollera | 200 | True |
| perceptivetravel | 200 | True |
| dj-pv-acceso-2026 | 200 | True |
| dj-escondida-2023 | 200 | True |
| dj-gatopardo-2026 | 200 | True |
| pescadordeportivo-gallo | 200 | True |
| mongabay-2025 | 200 | True |

All 19 now return 200 with matching content; the earlier failures came from the parallel checker (rate limiting/timeouts), not dead links. osm redirects to nominatim.openstreetmap.org/ui/search.html.

## Wayback targets without a snapshot

- none

## Notes

- ISRA factsheets (sharkrayareas.org) sit behind Cloudflare: python-requests got 403; curl got the PDF for isra-gn and isra-cv, isra-eng kept getting the challenge page. Save Page Now first archived 403 challenge pages, but a second save got real PDF snapshots (HTTP 200, checked in CDX) for all three; archivedUrl points to those.
- infocampo-restinga-2020 (?p=438745) redirects to a slug URL; archivedUrl points to the snapshot of the slug URL.
- archivedAt timestamps are UTC (Wayback); snapshots requested late on 2026-10-16 local time show 20261017.
- The ids animaltravel and piramides-aventuras were removed from sources.json and are not included. Sources added to sources.json during the run (a-*, b-*, c-*, d-*, osm-coastline; 254 ids at final write) were checked too.
