"""Parse official SHN tide pages (hidro.gob.ar) into the app's JSON datasets.

Inputs (raw HTML exactly as served by the SHN):
  research/raw/tides_raw/shn_<CODE>_<YEAR>_<MM>.html   monthly high/low predictions (reference ports)
  research/raw/tides_raw/psec_*.html                    secondary-port correction sheets

Outputs:
  web/data/tides/tides_<CODE>_<YEAR>.json
  web/data/tide_ports.json

Usage (from the project root):
  python tools/parse_shn.py 2026
"""
import html
import json
import re
import sys
from datetime import date
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
RAW = ROOT / "research" / "raw" / "tides_raw"
OUT = ROOT / "web" / "data"

REFERENCE_PORTS = {
    "SROM": "Fondeadero San Román (Golfo San José)",
    "MADR": "Puerto Madryn",
    "RAWS": "Puerto Rawson",
    "SELE": "Puerto Santa Elena",
    "COMO": "Puerto Comodoro Rivadavia",
}

# Secondary ports on the Chubut coast: file name -> (id, display name, reference code)
SECONDARY_PORTS = {
    "psec_PENNSULA_VALDS_PUNTA_NORTE.html": ("PNOR", "Punta Norte (Península Valdés)", "MADR"),
    "psec_GOLFO_SAN_JOS_FONDEADERO_SARMIENTO.html": ("FSAR", "Fondeadero Sarmiento (Golfo San José)", "SROM"),
    "psec_GOLFO_SAN_JOS_FONDEADERO_LA_ARGENTINA.html": ("FLAR", "Fondeadero La Argentina (Golfo San José)", "SROM"),
    "psec_GOLFO_SAN_JOS_FONDEADERO_PUEYRREDN.html": ("FPUE", "Fondeadero Pueyrredón (Golfo San José)", "SROM"),
    "psec_PENNSULA_VALDS_CALETA_VALDS.html": ("CVAL", "Caleta Valdés", "MADR"),
    "psec_PEN_NSULA_VALD_S_PUERTO_PIR_MIDE.html": ("PIRA", "Puerto Pirámide", "MADR"),
    "psec_PENNSULA_VALDS_FARO_PUNTA_DELGADA.html": ("PDEL", "Faro Punta Delgada", "MADR"),
    "psec_GOLFO_NUEVO_PUNTA_NINFAS.html": ("PNIN", "Punta Ninfas", "MADR"),
    "psec_ISLA_ESCONDIDA.html": ("IESC", "Isla Escondida", "MADR"),
    "psec_BAHA_JANSSEN.html": ("BJAN", "Bahía Janssen", "MADR"),
    "psec_BAHA_VERA_Cabo_Raso_.html": ("BVER", "Bahía Vera (Cabo Raso)", "MADR"),
    "psec_BAHA_CRUZ.html": ("BCRU", "Bahía Cruz", "MADR"),
    "psec_BAHA_CAMARONES_Caleta_Carolina_.html": ("BCAM", "Bahía Camarones (Caleta Carolina)", "SELE"),
    "psec_GOLFO_SAN_JORGE_PUERTO_MELO.html": ("PMEL", "Puerto Melo", "COMO"),
    "psec_GOLFO_SAN_JORGE_BAHA_GIL_Caleta_Horno_.html": ("BGIL", "Bahía Gil (Caleta Horno)", "COMO"),
    "psec_GOLFO_SAN_JORGE_CALETA_LEONES.html": ("CLEO", "Caleta Leones", "COMO"),
    "psec_GOLFO_SAN_JORGE_ISLA_TOVA.html": ("ITOV", "Isla Tova", "COMO"),
    "psec_GOLFO_SAN_JORGE_BAHA_BUSTAMANTE.html": ("BBUS", "Bahía Bustamante", "COMO"),
    "psec_GOLFO_SAN_JORGE_BAHA_SOLANO_Punta_Novales_.html": ("BSOL", "Bahía Solano (Punta Novales)", "COMO"),
}

TIDE_FORM_URL = "https://www.hidro.gob.ar/oceanografia/Tmareas/Form_Tmareas.asp"


def text(fragment):
    fragment = re.sub(r"<[^>]+>", " ", fragment)
    return re.sub(r"\s+", " ", html.unescape(fragment)).strip()


def num(s):
    return float(s.replace(",", "."))


def parse_month(path, year, month):
    raw = path.read_text(encoding="utf-8")
    flat = text(raw)
    header = {
        "lat": re.search(r"Lat\. ([^L]+?) Long", flat).group(1).strip(),
        "lon": re.search(r"Long\. (.+?) Huso", flat).group(1).strip(),
        "tzLabel": re.search(r"Huso Horario: (\S+)", flat).group(1),
        "datumText": re.search(r"(Las alturas están referidas al plano de reducción que pasa [\d,]+ m debajo del nivel medio\.)", flat).group(1),
        "meanLevel": num(re.search(r"pasa ([\d,]+) m debajo", flat).group(1)),
    }
    stats = re.search(r"Máxima Media Más baja Media Máxima Media ([\d,]+) ([\d,]+) ([\d,]+) ([\d,]+) ([\d,]+) ([\d,]+)", flat)
    if stats:
        v = [num(x) for x in stats.groups()]
        header["yearStats"] = {"highMax": v[0], "highMean": v[1], "lowMin": v[2], "lowMean": v[3], "rangeMax": v[4], "rangeMean": v[5]}

    body = raw[raw.find("Predicciones de las Pleamares"):]
    events = []
    day = None
    for row in re.findall(r"<tr>(.*?)</tr>", body, flags=re.S):
        cells = [text(c) for c in re.findall(r"<td[^>]*>(.*?)</td>", row, flags=re.S)]
        cells = [c for c in cells if c != ""]
        if not cells:
            continue
        if len(cells) == 3:
            day = int(cells[0])
            hhmm, h = cells[1], cells[2]
        elif len(cells) == 2:
            hhmm, h = cells
        else:
            continue
        if not re.fullmatch(r"\d\d:\d\d", hhmm):
            continue
        events.append([f"{year:04d}-{month:02d}-{day:02d}T{hhmm}", num(h)])
    return header, events


def label_high_low(events):
    """SHN tables do not say which event is high or low: derive it from the neighbours."""
    n = len(events)
    for i, ev in enumerate(events):
        prev_h = events[i - 1][1] if i > 0 else None
        next_h = events[i + 1][1] if i < n - 1 else None
        neighbours = [x for x in (prev_h, next_h) if x is not None]
        ev.append("H" if all(ev[1] > x for x in neighbours) else "L")
    anomalies = [events[i][0] for i in range(1, n) if events[i][2] == events[i - 1][2]]
    return anomalies


def parse_hm(s):
    """'-0 15' -> -15 minutes; '- --' -> None."""
    s = s.strip()
    m = re.fullmatch(r"([+-]?)(\d+) (\d+)", s)
    if not m:
        return None
    minutes = int(m.group(2)) * 60 + int(m.group(3))
    return -minutes if m.group(1) == "-" else minutes


def parse_height(s):
    s = s.strip()
    if re.fullmatch(r"[+-]?\d+,\d+", s):
        return num(s), False
    if s == "0 00":  # irregular format seen in the Bahía Solano sheet
        return 0.0, True
    return None, False


def parse_secondary(path):
    raw = path.read_text(encoding="utf-8")
    name = text(re.search(r"<h3>(.*?)</h3>", raw, flags=re.S).group(1))
    ref = text(re.search(r"Puerto Patr&oacute;n: <strong>(.*?)</strong>", raw).group(1))
    rows = re.findall(r"<tr>(.*?)</tr>", raw, flags=re.S)
    cells = [text(c) for c in re.findall(r"<td[^>]*>(.*?)</td>", rows[-1], flags=re.S)]
    lat, lon, dt_hw, dt_lw, dh_hw, dh_lw, estab, mean_level, fall_dur, mean_range = cells
    h_hw, unc_hw = parse_height(dh_hw)
    h_lw, unc_lw = parse_height(dh_lw)
    return {
        "shnName": name,
        "shnReferenceName": ref,
        "lat": lat,
        "lon": lon,
        "dtHighMin": parse_hm(dt_hw),
        "dtLowMin": parse_hm(dt_lw),
        "dhHigh": h_hw,
        "dhLow": h_lw,
        "heightCorrectionUncertain": unc_hw or unc_lw,
        "meanLevel": num(mean_level) if "," in mean_level else None,
        "meanRange": num(mean_range) if "," in mean_range else None,
        "raw": cells,
    }


def dms_to_decimal(s, negative=True):
    m = re.match(r"(\d+)\D+(\d+)", s)
    value = int(m.group(1)) + int(m.group(2)) / 60
    return round(-value if negative else value, 4)


def main(year):
    retrieved = date.today().isoformat()
    (OUT / "tides").mkdir(parents=True, exist_ok=True)
    ports = {"reference": [], "secondary": []}
    # Keep the tables of previous years already bundled with the app.
    previous = {}
    existing = OUT / "tide_ports.json"
    if existing.exists():
        previous = {p["id"]: p for p in json.loads(existing.read_text(encoding="utf-8"))["reference"]}

    for code, name in REFERENCE_PORTS.items():
        events, header = [], None
        for month in range(1, 13):
            path = RAW / f"shn_{code}_{year}_{month:02d}.html"
            if not path.exists():
                sys.exit(f"Missing {path}")
            h, ev = parse_month(path, year, month)
            header = header or h
            events.extend(ev)
        anomalies = label_high_low(events)
        dataset = {
            "port": name,
            "code": code,
            "year": year,
            "timezone": "UTC-3",
            "tzNote": "SHN: valores horarios calculados en huso +3 (hora oficial argentina).",
            "datum": header["datumText"],
            "meanLevel": header["meanLevel"],
            "lat": header["lat"],
            "lon": header["lon"],
            "yearStats": header.get("yearStats"),
            "eventFormat": ["localTime", "heightMeters", "H=pleamar|L=bajamar (derivado por alternancia)"],
            "source": "Servicio de Hidrografía Naval (SHN), Tablas de Marea",
            "sourceUrl": TIDE_FORM_URL,
            "retrieved": retrieved,
            "events": events,
        }
        (OUT / "tides" / f"tides_{code}_{year}.json").write_text(json.dumps(dataset, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
        prev = previous.get(code, {})
        files = {**prev.get("files", {}), str(year): f"data/tides/tides_{code}_{year}.json"}
        stats = {**prev.get("yearStats", {}), str(year): header.get("yearStats")}
        ports["reference"].append({
            "id": code, "name": name, "lat": dms_to_decimal(header["lat"]), "lon": dms_to_decimal(header["lon"]),
            "meanLevel": header["meanLevel"], "yearStats": dict(sorted(stats.items())),
            "files": dict(sorted(files.items())),
        })
        print(f"{code}: {len(events)} events, {len(anomalies)} alternation anomalies {anomalies[:5]}")

    for fname, (pid, display, ref_code) in SECONDARY_PORTS.items():
        sec = parse_secondary(RAW / fname)
        expected = REFERENCE_PORTS[ref_code].split(" (")[0].replace("Fondeadero", "F.").lower()
        if sec["shnName"] == "PASO TAMAR":
            sys.exit(f"{fname}: SHN returned the default sheet (PASO TAMAR)")
        sec.update({
            "id": pid, "name": display, "reference": ref_code,
            "latDec": dms_to_decimal(sec["lat"]), "lonDec": dms_to_decimal(sec["lon"]),
        })
        ports["secondary"].append(sec)
        print(f"{pid}: {sec['shnName']} -> {sec['shnReferenceName']} ({expected}) dt={sec['dtHighMin']}/{sec['dtLowMin']} dh={sec['dhHigh']}/{sec['dhLow']}{' UNCERTAIN' if sec['heightCorrectionUncertain'] else ''}")

    ports.update({
        "source": "Servicio de Hidrografía Naval (SHN), Tablas de Marea, puertos patrón y puertos secundarios",
        "sourceUrl": TIDE_FORM_URL,
        "retrieved": retrieved,
        "secondaryRules": [
            "Hora: la corrección se suma con su signo a la hora de pleamar o bajamar del puerto patrón.",
            "Altura: la corrección se suma con su signo a la altura del patrón; el resultado queda referido al plano de reducción del puerto secundario.",
            "Sin corrección de hora de bajamar: promedio de las horas de las pleamares entre las que está comprendida la bajamar.",
        ],
        "interpolation": "h = Pm − r/2·(1 − cos a) o h = Bm + r/2·(1 − cos a), con a = 180° × intervalo / duración de la creciente o bajante (SHN, Generalidades de las Tablas de Marea).",
        "generated": date.today().isoformat(),
    })
    (OUT / "tide_ports.json").write_text(json.dumps(ports, ensure_ascii=False, indent=1), encoding="utf-8")


if __name__ == "__main__":
    main(int(sys.argv[1]) if len(sys.argv) > 1 else 2026)
