"""Download the official SHN tide tables for a year (reference ports) and the
secondary-port correction sheets, exactly as the SHN serves them.

Usage (from the project root):
  python tools/fetch_shn.py 2027
Then:
  python tools/parse_shn.py 2027

Files land in research/raw/tides_raw/. Nothing is modified: the parser reads them.
"""
import re
import sys
import time
import urllib.parse
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
RAW = ROOT / "research" / "raw" / "tides_raw"
BASE = "https://www.hidro.gob.ar/oceanografia/Tmareas/"
UA = {"User-Agent": "MareaChubut/1.0 (actualizacion anual de tablas)"}
CODES = ["SROM", "MADR", "RAWS", "SELE", "COMO"]

# SHN option text for each secondary port (as listed in Form_TMareas.asp?op=3) -> local file name
SECONDARY = {
    "PENÍNSULA VALDÉS - PUNTA NORTE": "psec_PENNSULA_VALDS_PUNTA_NORTE.html",
    "GOLFO SAN JOSÉ - FONDEADERO SARMIENTO": "psec_GOLFO_SAN_JOS_FONDEADERO_SARMIENTO.html",
    "GOLFO SAN JOSÉ - FONDEADERO LA ARGENTINA": "psec_GOLFO_SAN_JOS_FONDEADERO_LA_ARGENTINA.html",
    "GOLFO SAN JOSÉ - FONDEADERO PUEYRREDÓN": "psec_GOLFO_SAN_JOS_FONDEADERO_PUEYRREDN.html",
    "PENÍNSULA VALDÉS - CALETA VALDÉS": "psec_PENNSULA_VALDS_CALETA_VALDS.html",
    "PENÍNSULA VALDÉS - PUERTO PIRÁMIDE": "psec_PEN_NSULA_VALD_S_PUERTO_PIR_MIDE.html",
    "PENÍNSULA VALDÉS - FARO PUNTA DELGADA": "psec_PENNSULA_VALDS_FARO_PUNTA_DELGADA.html",
    "GOLFO NUEVO - PUNTA NINFAS": "psec_GOLFO_NUEVO_PUNTA_NINFAS.html",
    "ISLA ESCONDIDA": "psec_ISLA_ESCONDIDA.html",
    "BAHÍA JANSSEN": "psec_BAHA_JANSSEN.html",
    "BAHÍA VERA (Cabo Raso)": "psec_BAHA_VERA_Cabo_Raso_.html",
    "BAHÍA CRUZ": "psec_BAHA_CRUZ.html",
    "BAHÍA CAMARONES (Caleta Carolina)": "psec_BAHA_CAMARONES_Caleta_Carolina_.html",
    "GOLFO SAN JORGE - PUERTO MELO": "psec_GOLFO_SAN_JORGE_PUERTO_MELO.html",
    "GOLFO SAN JORGE - BAHÍA GIL (Caleta Horno)": "psec_GOLFO_SAN_JORGE_BAHA_GIL_Caleta_Horno_.html",
    "GOLFO SAN JORGE - CALETA LEONES": "psec_GOLFO_SAN_JORGE_CALETA_LEONES.html",
    "GOLFO SAN JORGE - ISLA TOVA": "psec_GOLFO_SAN_JORGE_ISLA_TOVA.html",
    "GOLFO SAN JORGE - BAHÍA BUSTAMANTE": "psec_GOLFO_SAN_JORGE_BAHA_BUSTAMANTE.html",
    "GOLFO SAN JORGE - BAHÍA SOLANO (Punta Novales)": "psec_GOLFO_SAN_JORGE_BAHA_SOLANO_Punta_Novales_.html",
}


def get(url, data=None):
    req = urllib.request.Request(url, data=data, headers=UA)
    with urllib.request.urlopen(req, timeout=60) as r:
        return r.read()


def main(year):
    RAW.mkdir(parents=True, exist_ok=True)
    form = get(BASE + "Form_Tmareas.asp").decode("utf-8", "replace")
    years = re.findall(r'<option[^>]*value="(\d{4})"', form)
    if str(year) not in years:
        sys.exit(f"El SHN todavía no publica {year} (años disponibles: {', '.join(years)}). Probá más adelante.")

    for code in CODES:
        for month in range(1, 13):
            body = urllib.parse.urlencode({"FAnio": year, "Localidad": code, "FMes": f"{month:02d}"}).encode()
            html = get(BASE + "RE_TablasDeMarea.asp", body)
            if b"HORA:MIN" not in html:
                sys.exit(f"{code} {year}-{month:02d}: respuesta sin tabla. ¿Cambió el sitio del SHN?")
            (RAW / f"shn_{code}_{year}_{month:02d}.html").write_bytes(html)
            print(f"{code} {year}-{month:02d} ok")
            time.sleep(0.5)

    page = get(BASE + "Form_TMareas.asp?op=3").decode("utf-8", "replace")
    token = re.search(r'name="CSRFToken"[^>]*value="([^"]+)"', page) or re.search(r'value="([^"]+)"[^>]*name="CSRFToken"', page)
    if not token:
        sys.exit("No se encontró el CSRFToken del formulario de puertos secundarios.")
    for name, fname in SECONDARY.items():
        q = urllib.parse.urlencode({"CSRFToken": token.group(1), "Psec": name})
        html = get(BASE + "R_TPSMareas.asp?" + q)
        text = html.decode("utf-8", "replace")
        # The SHN silently returns the default sheet (PASO TAMAR) for unknown names.
        if "PASO TAMAR" in text and "PASO TAMAR" not in name:
            sys.exit(f"{name}: el SHN devolvió la ficha por defecto (PASO TAMAR). Revisá el nombre exacto en Form_TMareas.asp?op=3.")
        (RAW / fname).write_bytes(html)
        print(f"secundario {name} ok")
        time.sleep(0.5)


if __name__ == "__main__":
    if len(sys.argv) < 2:
        sys.exit("Uso: python tools/fetch_shn.py <año>")
    main(int(sys.argv[1]))
