# Entregable 2: Arquitectura de información y concepto de diseño
## "La marea patagónica"

Este documento se apoya en el dataset aprobado (`research/INFORME_INVESTIGACION.md`) y en las 6 decisiones confirmadas.

---

## 1. Idea central

La app es **una sola escena de agua**. El mar ocupa la pantalla y su nivel **es** la marea real: sube y baja según la predicción SHN del spot y la hora elegidos. Todo lo demás (spots, especies, viento, normativa) flota sobre o debajo de esa superficie.

Tres principios guían el diseño:
1. **El dato manda.** Cada número tiene su fuente a un toque. Si falta un dato, se ve el hueco ("Sin dato verificado"), nunca un relleno.
2. **Playa primero.** Se usa con una mano, al sol y sin señal. Los números son grandes, los toques amplios y el contraste alto.
3. **El peligro no se esconde.** Las advertencias de marea y de zona restringida usan el acento y aparecen antes que lo lindo.

---

## 2. Sistema visual

### Paleta

| Token | Oscuro (default) | "Sol de playa" (claro) | Uso |
|---|---|---|---|
| `--abyss` | `#050B16` | `#F6F1E7` (arena) | Fondo |
| `--deep` | `#0B1E33` | `#FFFFFF` | Superficies y tarjetas |
| `--current` | `#123A52` | `#DCE8EC` | Bordes, rejillas |
| `--teal` | `#3CC6C4` | `#0B6E73` | Agua, curva de marea, datos |
| `--foam` | `#E8F3F2` | `#0A1626` | Texto principal |
| `--mist` | `#8FA9B5` | `#4A5E6A` | Texto secundario |
| `--signal` | `#FF6A3D` | `#C93A12` | **Acento único**: ventana de pesca, alertas, zonas restringidas |
| `--danger` | `#FF4D5E` | `#B0122A` | Solo peligro de vida (aislamiento por marea) |

- **Modo alto contraste:** fondo negro puro, texto blanco, curva amarilla `#FFE14D`, sin transparencias ni degradés.
- **Contraste:** todas las combinaciones de texto cumplen WCAG AA. Lo valido con script antes de entregar.

### Tipografía (archivos locales, sin depender de Google Fonts, para que funcione sin señal)

| Rol | Fuente | Por qué |
|---|---|---|
| Display (titulares, nombres de spot) | **Fraunces** (variable, eje "SOFT" y óptico) | Serif expresiva, editorial, con algo de náutico antiguo |
| Texto y UI | **Inter** | Legibilidad máxima a sol pleno |
| Números grandes (alturas, horas) | Inter con cifras tabulares `tnum`, peso 200–800 | Los números no "bailan" al animar |

Ambas tienen licencia SIL OFL y se empaquetan en `/fonts`.

### Escala de números

```
4,87 m          ← 96 px, peso 200: la altura actual, protagonista
▲ 22:37         ← 28 px: próxima pleamar
amplitud 4,6 m  ← 14 px, mayúsculas espaciadas
```

### Badge de fuente

Va en cada dato y abre el detalle de la fuente:

```
┌──────────────────────────────────┐
│ ● OFICIAL · SHN · verif. 16/10/26 │   verde-teal
│ ● CIENTÍFICO · CENPAT · 16/10/26  │   azul
│ ● EXP. LOCAL · 2 fuentes · …      │   gris cálido
│ ◌ REPORTE DE FUENTE ÚNICA         │   contorno punteado (solo peligros, decisión 5)
│ ◌ MODELO, NO OFICIAL · Open-Meteo │   contorno punteado
└──────────────────────────────────┘
```

---

## 3. Arquitectura de información

```
                         ┌──────────────┐
                         │   MAREA (Hoy) │  ← pantalla de inicio
                         └──────┬───────┘
   ┌──────────┬───────────┬─────┴─────┬────────────┐
   │  MAPA    │ ESPECIES  │ CALENDARIO │    MÁS     │
   │ spots +  │ fichas    │ heatmap    │ Bitácora   │
   │ zonas    │ editoriales│ especie×mes│ Normativa │
   │ restring.│           │            │ Seguridad  │
   └────┬─────┘└────┬─────┘            │ Fuentes    │
        │           │                  │ Ajustes    │
        ▼           ▼                  └────────────┘
   FICHA DE SPOT ◄──► FICHA DE ESPECIE
        │
        └──► "Ver marea acá" → MAREA con ese spot
```

**Estado global** (persistente en el dispositivo): spot activo, fecha y hora, especie objetivo, tema, "mi ventana de pesca", favoritos.

**Navegación:**
- **Móvil:** barra inferior de 5 pestañas (Marea · Mapa · Especies · Calendario · Más), con iconos de 28 px y toques de 56 px.
- **Escritorio:** riel lateral, más un panel dividido (mapa a la izquierda, ficha a la derecha; la marea vive siempre arriba como franja).

---

## 4. Pantallas

### 4.1 MAREA (inicio)

```
┌─────────────────────────────────┐
│ ◉ Playa Unión / Los Palos   ▾   │  chip de spot (abre buscador)
│ jueves 16 oct · ‹ hoy ›    📅   │  selector de fecha
│                                 │
│        4,12 m                   │  altura actual (96 px)
│        creciente · ▲ 22:39      │
│ ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ │  ← SUPERFICIE DEL MAR (WebGL)
│ ≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈ │     el nivel sube o baja con la marea
│ ░░ mar profundo, partículas ░░░ │
├─────────────────────────────────┤
│  ╭─╮        ╭─╮                 │  CURVA DEL DÍA (se dibuja al entrar)
│ ╯   ╰──╮  ╭╯   ╰╮               │  ▓ franja naranja = MI VENTANA
│        ╰──╯     ╰─              │  │ marcador de hora actual (arrastrable)
│ 04:43  10:30  16:54  22:39      │
│ ▼0,60  ▲4,81  ▼0,67  ▲4,87      │
│ ◄━━━━━━━━━━━●━━━━━━━━━━━━━━━━►  │  SCRUBBER: mueve el agua del hero
├─────────────────────────────────┤
│ Amplitud 4,2 m │ 🌖 Luna 84%    │
│ ████████░░ marea grande*        │  *cálculo propio vs. media SHN
│ ☀ 06:41 → 19:52 · hora dorada… │
├─────────────────────────────────┤
│ VIENTO (pronóstico)  ◌ modelo   │
│ ↗ SO 32 km/h · ráfagas 54       │  flecha animada, banda de color
│ olas 1,1 m · mar 12 °C          │
├─────────────────────────────────┤
│ ÍNDICE DE PESCA   62 / 100  ⓘ   │  orientativo, fórmula visible
└─────────────────────────────────┘
│ Referencia: Puerto Rawson (SHN). │  leyenda fija si no hay corrección oficial
│ Sin corrección oficial p/ punto. │
```

**Comportamiento:**
- La curva interpola entre pleamar y bajamar con el **método de la Tabla de Interpolación del SHN**.
- La leyenda dice "interpolado; puede diferir ±10 % a media marea", con el texto del SHN.
- **Más allá del 31/12/2026:** cartel "Tabla oficial 2027 aún no cargada". La curva pasa a Open-Meteo, punteada, con badge "MODELO, NO OFICIAL" y en metros sobre nivel medio, sin mezclar escalas.
- **Viento:** se muestra solo dentro del rango de pronóstico. Fuera de ese rango: "Sin pronóstico para esta fecha".
- **Alertas** (banda roja arriba, solo si aplica):
  - "Este spot tiene antecedentes de aislamiento por la creciente: la próxima pleamar es 22:39".
  - "El Doradillo: jun–dic prohibido entrar al agua".
- **Mi ventana:** el usuario la define en Ajustes (ej. "de 2 h antes a 1 h después de la pleamar"). Si no la definió, no se dibuja ninguna franja.

### 4.2 MAPA

```
┌─────────────────────────────────┐
│ [buscar spot…]        ⚙ capas   │
│                                 │
│   ·  costa estilizada           │  línea de costa propia (vectorial, offline)
│      ◉ pulso teal (índice alto) │  marcadores que brillan según el índice del día
│        ◎ tenue (índice bajo)    │
│     ⊘ zona restringida (naranja │  icono rayado + nombre
│        con trama)               │
│     ⊙ "en revisión normativa"   │  Patagonia Azul (decisión 2)
├─────────────────────────────────┤
│ ═══ BOTTOM SHEET (arrastrable) ═│  al tocar un marcador: fly-to suave
│ Bajo Los Huesos   ● OFICIAL     │
│ Playa agreste · ripio RP1       │
│ Marea ahora: bajante · ▼ 16:54  │
│ [Ver ficha]  [Ver marea]  ☆     │
└─────────────────────────────────┘
```

- **Motor:** Leaflet sin teselas, con costa y límites dibujados desde un GeoJSON empaquetado (Natural Earth, dominio público). Funciona 100 % offline y tiene estética propia.
- **Capa opcional online:** relieve oscuro (CARTO Dark Matter), con su atribución y apagada por defecto.
- **Marcadores** con la leyenda "ubicación de referencia, no punto de pesca" (decisión 1). Los spots sin coordenadas en fuente no aparecen en el mapa, pero sí en la lista.
- **Zonas restringidas:** solo hay puntos, no polígonos verificados, así que se muestran como **icono más radio indicativo rotulado**. No dibujo límites que no tengo.

### 4.3 FICHA DE SPOT

```
┌─────────────────────────────────┐
│ ← RAWSON                     ☆  │
│ Escollera sur,                   │  Fraunces 40 px
│ Puerto Rawson                    │
│ ESCOLLERA · CANTO/ROCA*          │  *solo si hay fuente
├─────────────────────────────────┤
│ ⚠ PELIGRO                        │  bloque rojo SIEMPRE arriba
│ En 2018 tres personas quedaron   │
│ aisladas por la pleamar en la    │
│ escollera. No te quedes con      │
│ marea creciente.  ● OFICIAL (PNA)│
├─────────────────────────────────┤
│ MAREA HOY (mini curva)  → ver    │
│ Referencia: Puerto Rawson (SHN)  │
├─────────────────────────────────┤
│ ESPECIES                         │  chips con foto → ficha de especie
│ [Róbalo] [Mero]   ● EXP. LOCAL   │
├─────────────────────────────────┤
│ ACCESO   Sin dato verificado     │  los huecos se ven
│ SERVICIOS  Sin dato verificado   │
├─────────────────────────────────┤
│ NORMATIVA  Licencia de costa     │
│ obligatoria → ver                │
│ FUENTES (3) ▾                    │
└─────────────────────────────────┘
```

### 4.4 ESPECIES (listado y ficha editorial)

**Listado:** grilla de tarjetas grandes, cada una con foto o lámina a sangre, nombre en Fraunces y una franja con los meses de temporada.

```
┌─────────────────────────────────┐
│ [lámina Cuvier & Valenciennes,  │  imagen a sangre con parallax
│  dominio público]               │
│                                 │
│ Salmón de mar                   │  Fraunces 56 px
│ Pseudopercis semifasciata       │  cursiva
├──────────────┬──────────────────┤
│ FICHA TÉCNICA│ "Poco tiene que  │  columna editorial (texto breve propio)
│ Récord Chubut│  ver con un      │
│ 30,3 kg ●CIE │  salmónido…"     │
│ Temporada    │                  │
│ O N D E F M A│                  │
│ Modalidad    │                  │
│ embarcado    │                  │
│ Anzuelo      │                  │
│ 9/0–10/0 ●   │                  │
│ Plomada      │                  │
│ 250–500 g ●  │                  │
│ Carnada      │                  │
│ 1 pulpito    │                  │
│ 2 calamar    │                  │
│ 3 pescado    │                  │
│ Marea ideal  │                  │
│ Sin dato     │                  │
│ verificado   │                  │
├──────────────┴──────────────────┤
│ ESTADO LEGAL                     │
│ Consultar normativa vigente →    │  enlace a la Secretaría de Pesca
│ IUCN: No evaluado                │
├─────────────────────────────────┤
│ Foto: Cuvier & Valenciennes,     │
│ dominio público, Wikimedia       │
└─────────────────────────────────┘
```

- **Gatopardo:** la ficha va con una franja naranja "PROTEGIDO, NO SE PUEDE CAPTURAR (Ley XI Nº 93)" y el consejo de liberación inmediata.
- **Especies CR, EN o VU:** muestran su categoría IUCN, sin sermón.

### 4.5 CALENDARIO

*Boceto ilustrativo: las celdas reales salen de `species.json` con su fuente.*

```
            E  F  M  A  M  J  J  A  S  O  N  D
Róbalo      ·  ·  ·  ▒  ▒  ▒  ▒  ▒  ▒  ▒  ▒  ·     ▒ exp. local
Salmón      █  █  ▓  ▓  ·  ·  ·  ·  ·  ▓  ▓  ▓     █ pico (científico)
Cazón       ▓  ▓  ▓  ▓  ·  ·  ·  ·  ▓  ▓  ▓  ▓     ▓ temporada (oficial / científico)
Pez gallo   ▓  ▓  ▓  ·  ·  ·  ·  ·  ▓  ▓  ▓  ▓
Mero        ╳  ╳  ╳  ╳  ╳  ╳  ╳  ╳  ╳  ╳  ╳  ╳     ╳ sin dato verificado (trama)
```

- **Al tocar una celda:** aparece la fuente de ese dato.
- **Mes actual:** resaltado con una columna luminosa.
- **Animación de entrada:** la grilla se llena celda a celda, con escalonado de 15 ms.

### 4.6 MÁS

| Sección | Contenido |
|---|---|
| **Bitácora** | Formulario rápido: especie, talla o peso, carnada, spot (preseleccionado) y la marea, que se completa sola desde los datos del momento. Lista con filtros. Estadísticas simples: capturas por especie, por fase de marea y por mes. Exportar e importar en JSON. Todo en el dispositivo. |
| **Normativa** | Licencia (categorías, precios oficiales, cómo sacarla por DINO), vedas de marea roja vigentes, gatopardo, Península Valdés, El Doradillo, Rada Tilly. Cada ítem lleva fecha y enlace oficial. Arriba, aviso fijo: "No hay tallas ni cupos publicados para pesca marítima recreativa: consultá a la Secretaría de Pesca". |
| **Seguridad** | Botones gigantes para llamar al **106** (Prefectura), al **107** y al **101**.<br>"Avisá a alguien": arma un mensaje con spot, hora de regreso y próxima pleamar, y lo comparte con el menú nativo del teléfono. Lo envía el usuario, no la app.<br>Peligros documentados por spot, incluidos los reportes de fuente única rotulados (decisión 5). Distancias a fauna. Sin señal en Península Valdés y Cabo Raso. |
| **Fuentes** | Tabla de todas las fuentes: nombre, tipo, URL, fecha de verificación y qué datos respalda. Con buscador. |
| **Ajustes** | Tema (oscuro, sol de playa, alto contraste), mi ventana de pesca, especie objetivo, unidades de viento (km/h o nudos), reducir movimiento. |

---

## 5. Índice de pesca (borrador de fórmula, visible en la app)

```
Índice = 100 × (0,45·V + 0,30·T + 0,25·E)      (si falta un factor, se renormaliza y se avisa)

V  Viento (Open-Meteo, sostenido y ráfagas, en el horario elegido)
   1,0  si sostenido ≤ 15 km/h y ráfagas ≤ 25
   lineal hasta 0 en sostenido 45 km/h o ráfagas 65
T  Marea: fracción de "mi ventana" con luz de día. Si no hay ventana definida: 0,5 fijo
E  Especie objetivo: 1 = temporada o pico con fuente · 0,5 = sin dato · 0,2 = fuera de temporada con fuente
```

- La luna no entra en la fórmula: no hay evidencia verificada. Se muestra igual, como información.
- Los umbrales de viento son **criterio editorial**, y así se rotulan.
- La palabra "orientativo" va siempre al lado del número.

---

## 6. Movimiento

| Elemento | Comportamiento |
|---|---|
| Agua del hero | Shader WebGL de ondas, de bajo costo. El nivel sigue la marea interpolada y responde al scrubber con una transición de 600 ms. Sin WebGL, cae a canvas 2D. |
| Curva de marea | Se dibuja de izquierda a derecha (stroke-dashoffset, 900 ms). Los puntos de pleamar y bajamar aparecen después. |
| Mapa | Fly-to con easing. Los marcadores con índice alto laten suave. |
| Fichas | Entrada escalonada. Parallax leve en la imagen de especie. |
| `prefers-reduced-motion` | Agua estática con nivel correcto, sin parallax y transiciones instantáneas. |

---

## 7. Arquitectura técnica (sin paso de build)

```
chubut-pesca/
├── index.html              app de una página, módulos ES nativos
├── app/                    JS por módulo: tide.js, astro.js, map.js, species.js, log.js…
├── styles/                 CSS con tokens (variables) por tema
├── data/
│   ├── spots.json
│   ├── species.json
│   ├── zones.json          zonas restringidas y "en revisión"
│   ├── regulations.json
│   ├── sources.json
│   ├── tide_ports.json     patrones y secundarios con correcciones SHN
│   └── tides/tides_MADR_2026.json …   uno por puerto patrón (5)
├── tools/parse_shn.py      convierte los HTML del SHN en JSON (lo uso yo; lo documento)
├── vendor/                 Leaflet y SunCalc en copia local, con licencias
├── fonts/  img/  geo/      fuentes OFL, imágenes de especies con créditos, costa Natural Earth
├── sw.js  manifest.json    PWA: se instala y funciona offline
```

- **Para usarla en la playa** hay que servirla por HTTP: GitHub Pages, Netlify o cualquier hosting estático gratuito. Se abre una vez con señal, se "instala" y queda offline (service worker).
- **En la PC:** `python -m http.server`. No funciona abriendo el archivo con doble clic, porque el navegador bloquea la lectura de los JSON.
- **Sin claves de API.** Open-Meteo se llama solo con señal, y se guarda en caché el último pronóstico con su hora de consulta.

---

## 8. Muestras de tono (español rioplatense)

| Contexto | Texto |
|---|---|
| Alerta | "Ojo: la creciente corta el regreso por la playa. Pleamar a las 22:39." |
| Hueco de dato | "Sin dato verificado. Preferimos dejarlo vacío antes que inventarlo." |
| Bitácora vacía | "Todavía no cargaste ningún lance. ¿Salís hoy?" |
| Normativa | "Antes de tirar la línea, sacá tu permiso de costa ($2.000) por WhatsApp con DINO." |

Cuando lo apruebes, construyo la app completa (Entregable 3).
