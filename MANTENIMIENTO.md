# Guía de mantenimiento: Marea Chubut

Esta guía explica cómo mantener al día los datos de la app: mareas, normativa, spots y especies. No hace falta saber programar: alcanza con editar archivos JSON y correr tres comandos de Python.

---

## 0. Mapa del proyecto

```
Chubut pesca/
├── web/                    ← la app (esto es lo que se publica)
│   ├── data/
│   │   ├── tides/tides_<PUERTO>_<AÑO>.json   predicciones SHN (generadas, no editar a mano)
│   │   ├── tide_ports.json      puertos patrón y secundarios con sus correcciones (generado)
│   │   ├── spots.json           spots de pesca de costa
│   │   ├── species.json         especies (y especies excluidas)
│   │   ├── zones.json           áreas protegidas y zonas restringidas, con polígonos legales
│   │   ├── regulations.json     permiso de costa, vedas, reglas, estado de marea roja
│   │   ├── safety.json          emergencias, peligros, fauna
│   │   ├── guide.json           guía de liberación de tiburones y rayas
│   │   ├── excluded.json        todo lo que se dejó afuera y por qué (se ve en Fuentes)
│   │   ├── sources.json         TODAS las fuentes (cada dato apunta acá)
│   │   └── images.json          créditos de imágenes (generado)
│   ├── geo/coast.json · geo/coastline.json   tierra (Natural Earth) y línea de costa (OSM)
│   ├── sw.js · precache.json    modo sin conexión
│   └── …                        código, estilos, fuentes, imágenes
├── tools/
│   ├── fetch_shn.py            baja las tablas oficiales del SHN de un año
│   ├── parse_shn.py            las convierte en JSON para la app (conserva años anteriores)
│   ├── fetch_coastline.py      baja la línea de costa de OpenStreetMap (Overpass)
│   ├── compute_geo.py          orientación de cada playa y punto mar adentro para el oleaje
│   ├── merge_spot_research.py  incorpora investigación de spots aplicando la política de confianza
│   ├── validate_data.py        revisa fuentes, política de confianza y distancia a la costa (< 300 m)
│   ├── build_precache.py       actualiza la lista de archivos offline (correr SIEMPRE antes de publicar)
│   ├── test_offline.py         prueba automática de que todo lo necesario funciona sin conexión
│   ├── fetch_images.py         baja imágenes de Wikimedia Commons con su licencia
│   ├── make_responsive_images.py  genera las versiones WebP de 600 y 1200 px
│   └── build_geo.py            recorta la costa de Natural Earth (solo si cambia el mapa)
├── research/               informes, anexos, archivos originales del SHN y de OSM
└── design/                 concepto de diseño
```

Requisitos: Python 3.10 o más nuevo y Pillow (`pip install pillow`) para las imágenes.

**Antes de publicar, siempre, en este orden:**

```bash
python tools/validate_data.py
```

```bash
python tools/build_precache.py
```

```bash
python tools/test_offline.py
```

---

## 1. Probar y publicar

**Publicación actual:** https://giannipaolinim-tech.github.io/marea-chubut/ (repositorio `giannipaolinim-tech/marea-chubut`).

Para publicar un cambio: corré las tres herramientas del punto 0 y después:

```bash
git add -A
git commit -m "Descripción del cambio"
git push
```

GitHub Actions valida los datos, corre la prueba sin conexión y publica la carpeta `web/` en unos 30 segundos. Si la validación falla, no se publica nada. Los teléfonos con la app instalada ven el aviso «Nueva versión disponible» la próxima vez que la abren con señal.

**Probar en la computadora**

```bash
python -m http.server 8765 --directory web
```

Abrí `http://localhost:8765`. En `localhost` el modo offline está apagado para que veas los cambios al instante. Para probarlo, agregá `?sw` a la dirección: `http://localhost:8765/?sw`.

**Publicar.** Sirve cualquier hosting estático gratuito con HTTPS:

| Hosting | Cómo |
|---|---|
| GitHub Pages | Subí la carpeta `web/` a un repositorio y activá Pages sobre esa carpeta. |
| Netlify / Cloudflare Pages | Arrastrá la carpeta `web/` o configurá `web` como carpeta de publicación. |

**En el teléfono:** abrí la dirección publicada con señal, esperá unos segundos y elegí "Agregar a pantalla de inicio". Desde ahí funciona sin conexión: mareas, spots, especies, normativa e imágenes. Lo único que necesita señal es el pronóstico de viento, y se guarda el último consultado.

> **Antes de publicar para terceros:** el sitio del SHN dice «Todos los derechos reservados». Pedí permiso escrito para redistribuir las predicciones a shn@hidro.gov.ar. Para uso personal no hay impedimento práctico.

---

## 2. Actualizar las tablas de marea (una vez por año)

El SHN publica el año siguiente hacia fin de año; el 16/10/2026 todavía no estaba 2027. Mientras falte, la app muestra el cartel «Tabla oficial no cargada» y, si hay pronóstico, una curva de modelo rotulada «no oficial».

**Paso 1. Bajar las tablas oficiales.**

```bash
python tools/fetch_shn.py 2027
```

- Baja los 12 meses de los 5 puertos patrón de Chubut: San Román, Madryn, Rawson, Santa Elena y Comodoro.
- Baja las 19 fichas de puertos secundarios.
- Todo queda en `research/raw/tides_raw/`.
- Si el SHN todavía no publicó el año, el script avisa y no hace nada.

**Paso 2. Convertirlas a JSON.**

```bash
python tools/parse_shn.py 2027
```

- Genera `web/data/tides/tides_<PUERTO>_2027.json`.
- Actualiza `tide_ports.json` conservando los años anteriores.
- Muestra cuántos eventos leyó por puerto: unos 1.410 por año.
- Debe decir **0 alternation anomalies**. Si no, revisá el HTML de ese mes.

**Paso 3. Controles manuales (5 minutos).**
1. Abrí la app en una fecha de 2027 y compará 2 o 3 pleamares y bajamares con la página del SHN para ese puerto y mes.
2. Revisá que las correcciones de los puertos secundarios no hayan cambiado. El script las vuelve a bajar y las imprime: compará con el año anterior.
3. Si el SHN cambió el formato de su sitio, los scripts se detienen con un mensaje. No los fuerces: avisá o adaptá el parser.

**Paso 4. Validar y publicar.**

```bash
python tools/validate_data.py
```

```bash
python tools/build_precache.py
```

Después, publicá la carpeta `web/`. Los teléfonos con la app instalada toman la versión nueva la próxima vez que la abran con señal.

**Cómo usa la app las tablas.** Para entender o auditar:
- Las horas están en UTC−3 («huso +3» del SHN). Las alturas están sobre el plano de reducción de cada puerto.
- **Puertos secundarios:** se suma la corrección de hora y altura a la pleamar o bajamar del patrón. Si falta la corrección de hora de bajamar, se usa el promedio de las pleamares vecinas. Es la regla del SHN.
- **Curva:** se interpola con la fórmula del SHN: `h = Pm − r/2·(1 − cos a)`.
- **Spots sin puerto propio:** muestran el puerto oficial más cercano con la leyenda «Sin corrección oficial para este punto». **Nunca inventes una corrección.**

---

## 3. Actualizar normativa, vedas y precios

La normativa cambia más seguido que las mareas. Revisá con esta frecuencia:

| Qué | Dónde mirar | Archivo |
|---|---|---|
| **Vedas por marea roja** (cambian cada semanas) | https://marearoja.chubut.gov.ar/ | `regulations.json` → `rules` (`veda-…`) y los `facts` con `"alert": true` en `spots.json` |
| Precio, vigencia y exenciones de la licencia marítima | https://pescacontinental.gob.ar/ y https://pesca.chubut.gob.ar/ | `regulations.json` → `license` |
| Tallas, cupos o vedas por especie (hoy no existen) | Boletín Oficial: https://boletin.chubut.gov.ar/ | `species.json` → `legal` y `regulations.json` → `noLimitsNotice` |
| Plan de Manejo de Patagonia Azul (pendiente) | Secretaría de Turismo y Áreas Protegidas del Chubut | `zones.json` (`status: "revision"`) |
| Península Valdés y El Doradillo | https://peninsulavaldes.org.ar/ · https://turismo.madryn.gob.ar/anp-el-doradillo/ | `regulations.json`, `zones.json`, `spots.json` |
| Rada Tilly (zonificación de playa) | https://radatilly.gob.ar/ | `spots.json` → `rada-tilly` |
| Números de emergencia y Prefectura | argentina.gob.ar, municipios | `safety.json` |

### Cómo editar un dato, con el ejemplo de una veda que se levanta

1. **Agregá la fuente** a `web/data/sources.json`, con un `id` nuevo y único:
   ```json
   {"id": "res-xxx-2027", "type": "oficial", "title": "Resolución Nº XXX/2027-SP: levantamiento de veda en Golfo Nuevo",
    "publisher": "Secretaría de Pesca del Chubut", "url": "https://…", "verified": "2027-03-02"}
   ```
   Usá `"verified"` con la fecha en que la abriste. Si no lo ponés, se toma la fecha general `verifiedDefault`.

2. **Editá el dato** en el archivo que corresponda. Cada dato tiene esta forma:
   ```json
   {"t": "texto que ve el usuario", "c": "oficial", "s": ["res-xxx-2027"]}
   ```

   | Valor de `c` | Cuándo usarlo |
   |---|---|
   | `oficial` | Norma u organismo público. |
   | `cientifico` | Paper, tesis, FishBase, CENPAT. |
   | `local` | Solo con **2 o más fuentes independientes** que coinciden. |
   | `unica` | Una sola fuente. Usalo solo para advertir un peligro, y la app lo rotula. |

   Si la veda terminó, borrá la regla de `regulations.json` y los `facts` de los spots afectados.

3. **Validá:**
   ```bash
   python tools/validate_data.py
   ```
   Te avisa si una fuente no existe, si un dato quedó sin fuente o si un spot apunta a algo inexistente.

4. **Actualizá el modo offline y publicá:**
   ```bash
   python tools/build_precache.py
   ```

### Reglas de oro: la política de confianza (dos niveles)

- **Nunca inventes ni estimes un dato.** Si no hay fuente, dejalo en `null`. La app muestra «Sin dato verificado».
- **Nivel estricto**: seguridad, normativa, áreas protegidas, mareas y coordenadas.
  - Solo valen una fuente **oficial** o **dos fuentes independientes** (`"c": "local"`).
  - Nunca `"unica"`, sin excepciones.
  - Una nota de prensa que cita a Prefectura sigue siendo prensa: hace falta el documento oficial o una segunda fuente.
- **Nivel práctico**: carnadas y su orden, aparejos, anzuelo, línea, caña, mejor hora, mejor marea, distancia de lance, fondo, estacionamiento, combustible.
  - Alcanza **una fuente creíble y específica de Chubut**, con `"c": "unica"`. La app la muestra con el sello punteado «Fuente única».
  - Nunca subas a `"local"` algo que tiene una sola fuente.
  - Datos de otras provincias (Río Negro, Buenos Aires) no valen como fuente única.
- **Independencia:** varias notas del mismo medio, o sitios que copian el mismo texto, cuentan como **una** fuente. `validate_data.py` lo controla por editor.
- Un `"c": "oficial"` tiene que citar al menos una fuente de tipo oficial.
- Una norma oficial nueva le gana a cualquier fuente anterior. Anotá la discrepancia en `research/`.
- Lo que descartes va a `data/excluded.json`, con el motivo y lo consultado. Se ve en la página Fuentes.
- **Normativa por especie** (`species.json` → `legal`):
  - Hoy es `{"status": "consultar"}`.
  - Cuando exista una norma, reemplazalo por `{"status": "regulada", "t": "…", "c": "oficial", "s": ["…"]}`.
  - El gatopardo usa `protegida`.

---

## 4. Agregar o corregir spots y especies

**Spot nuevo** (en `spots.json`). Solo si su existencia como pesquero, su ubicación y su legalidad cumplen la regla estricta.

- **Campos obligatorios.** Todos van, aunque sea en `null`: `access`, `parking`, `bottom`, `bestTide`, `castingDistance`, `fuel`, `cutoff`, `orientation`, `marinePoint`, `speciesByMonth`.
- **Coordenadas.**
  - Usá el punto de acceso real, por ejemplo un objeto de OSM (`natural=beach`, `man_made=pier`, fin de una huella hacia la costa) o una coordenada oficial.
  - Anotá en `kind` qué objeto es.
  - El validador rechaza puntos a más de 300 m de la línea de costa de OSM.
  - Sin fuente, poné `null`: el spot aparece en la lista, no en el mapa, y la ficha explica por qué.
- **Orientación y punto mar adentro.** Después de cargar las coordenadas corré:
  ```bash
  python tools/compute_geo.py
  ```
  Calcula hacia dónde mira la playa (para viento del mar, de tierra o cruzado) y un punto a 6 km mar adentro para el oleaje.
- **`cutoff`.** Solo si una fuente que cumple la regla estricta dice explícitamente que la marea corta el paso. Indicá `phase`: `pleamar` o `creciente`. La app muestra una cuenta regresiva a la próxima pleamar.
- **`speciesByMonth`.** Temporadas propias de ese spot, con sus meses explícitos. Las temporadas de toda la costa van en la especie.
- **`tide.port`.** El id de un puerto de `tide_ports.json`. Usá `kind: "secundario-oficial"` solo si el SHN publica ese puerto. Si no, usá el más cercano con `kind: "aproximacion"`; la app muestra la distancia y la advertencia «la hora real puede diferir».
- **Zonas.** Las zonas prohibidas o restringidas van en `zones.json`. Dibujá un polígono (`polygon.vertices`) solo si un texto legal da los vértices. Si no, queda el punto con «Límites oficiales no publicados».
- **Investigación nueva.** Si viene de un JSON de investigación, usá:
  ```bash
  python tools/merge_spot_research.py <archivo.json>
  ```
  Aplica la política y manda a `excluded.json` lo que no la cumple.

**Especie nueva** (en `species.json`):
- **Modalidad.** `modality` es un dato con fuente: `{"v": ["costa"], "t": "…", "c": "…", "s": ["…"]}`. Sin pesca de costa documentada en Chubut, la especie no entra.
- **Temporada.** `season` lleva 12 valores (`"p"`, `"s"` o `null`) más `seasonSrc`. Si los meses salen de la biología y no de la pesca, agregá `"seasonKind": "biologia"`: el calendario la dibuja con otro patrón.
- **Campos de pesca.** `rigShore {type, hook, line, rod, sinker}`, `bestHours`, `bestTide`, `castingDistance`, `baits[].rank` y `rankBasis`. Cada uno es un dato con fuente o `null`.
- **Imagen.** Agregala en `tools/fetch_images.py` (`FILES`) y corré `fetch_images.py` y luego `make_responsive_images.py`. Solo sirven licencias libres.

Después de cualquier cambio, corré las tres herramientas del punto 0.

---

## 5. Calendario de revisión sugerido

| Frecuencia | Tarea |
|---|---|
| Antes de cada temporada y cuando haya noticias | Vedas de marea roja |
| Cada noviembre | Precios y vigencia de la licencia; cambios en Península Valdés y El Doradillo |
| Diciembre–enero | Tablas SHN del año nuevo (sección 2) |
| Cada año | Repasar que los enlaces de `sources.json` sigan vivos; si una fuente desapareció, buscá una equivalente o retirá el dato |
| Cuando se publique | Plan de Manejo de Patagonia Azul: decidir si esas zonas pasan a spots, a restringidas o se quedan en revisión |

---

## 6. Problemas frecuentes

| Problema | Causa y solución |
|---|---|
| «No se pudieron cargar los datos» | Abriste `index.html` con doble clic. Serví la carpeta con `python -m http.server` o publicala. |
| Cambié datos y el teléfono sigue mostrando lo viejo | Faltó correr `build_precache.py` antes de publicar. Corrélo, publicá y abrí la app con señal. |
| El viento dice «sin pronóstico» | Fecha fuera de los ~16 días del modelo, o sin conexión y sin pronóstico guardado. |
| Olas «sin dato del modelo» | Open-Meteo no calcula oleaje en algunas celdas dentro de los golfos. Es normal. |
| `fetch_shn.py` dice «PASO TAMAR» | El SHN cambió el nombre de un puerto secundario. Copiá el texto exacto de la lista en `Form_TMareas.asp?op=3` al diccionario `SECONDARY`. |
