# Entregable 1: Informe de investigación
## Pesca de costa y embarcación menor en la costa atlántica de Chubut

**Fecha de verificación de todas las fuentes:** 2026-10-16
**Estado:** borrador para revisión. **No se escribió código.**

### Cómo leer este informe
- Este documento es la versión consolidada.
- Las citas textuales (menos de 25 palabras), las URL completas y la fecha de acceso de cada dato están en los anexos crudos:

| Anexo | Tema |
|---|---|
| [raw/01_regulations.md](raw/01_regulations.md) | Normativa, áreas protegidas, emergencias |
| [raw/02_tides.md](raw/02_tides.md) | Mareas SHN (más 155 archivos originales en `raw/tides_raw/`) |
| [raw/03_spots_north.md](raw/03_spots_north.md) | Spots de Puerto Lobos a Isla Escondida |
| [raw/04_spots_south.md](raw/04_spots_south.md) | Spots de Cabo Raso al límite con Santa Cruz |
| [raw/05_species.md](raw/05_species.md) | Especies |

### Etiquetas de confianza
| Etiqueta | Significado |
|---|---|
| **Oficial** | Norma, organismo público, municipio, Prefectura, SHN, IUCN SSC |
| **Científico** | Paper, tesis doctoral, FishBase, fichas firmadas por investigadores de CENPAT-CONICET (Proyecto Arrecife) |
| **Exp. local** | Experiencia local: al menos 2 fuentes independientes que coinciden |
| **Fuente única** | **No entra al dataset**. Se lista solo para que la revises. |

> **Regla de independencia aplicada.** argentinaxplora, pezcalandia, welcomeargentina, interpatagonia y atractivosargentinos reproducen el mismo texto. Se contaron como **una sola fuente**. Por eso muchos datos "de manual" (aparejos, carnadas) quedaron fuera.

---

## 0. Resumen ejecutivo

| Bloque | Resultado |
|---|---|
| **Mareas** | ✅ Predicciones **oficiales SHN 2026** descargadas para los **5 puertos patrón** de Chubut, más las fichas de corrección de **19 puertos secundarios**.<br>⚠️ **2027 no está publicado** por el SHN (consultado hoy).<br>⚠️ El sitio del SHN dice "Todos los derechos reservados" (ver §2.6). |
| **Normativa** | ✅ Licencia marítima obligatoria (Ley XVII Nº 8). Precios oficiales: costa $2.000, embarcación $20.000, submarina $10.000. Gatopardo protegido por ley (Ley XI Nº 93). Vedas de marea roja vigentes. Zonificación de Península Valdés y El Doradillo.<br>❌ **No existe norma publicada** con tallas mínimas, cupos o vedas por especie para pesca marítima recreativa. En la app irá "Consultar normativa vigente". |
| **Spots** | ✅ **23 spots o sectores** verificados como pesqueros (oficial o 2 fuentes).<br>⛔ **11 zonas restringidas**.<br>⏸️ **4 spots en espera** por el Parque Provincial Patagonia Azul.<br>❌ ~20 candidatos descartados. |
| **Especies** | ✅ **16 especies o grupos** verificados como capturados recreativamente en Chubut. 1 (palometa) solo con fuente única.<br>❌ Descartados: escalandrún (no llega a Chubut), chernia, abadejo, merluza, lenguado. |
| **Huecos grandes** | ❌ **Coordenadas exactas de puntos de pesca**: ninguna fuente las da. Solo hay centroides OSM de localidad, playa o cabo.<br>❌ **Mejor fase de marea por spot o especie**: casi ningún dato alcanza el criterio de 2 fuentes.<br>❌ **Distancias de lance**: no se encontró ninguna. |

**Hay 6 decisiones que necesito de vos** antes del Entregable 2 (ver §9).

---

## 1. Normativa

### 1.1 Autoridad y licencia — Oficial
- **Autoridad:** Secretaría de Pesca del Chubut (Libertad 279, Rawson). Tel. (0280) 483337 / 482709, tomado del membrete de la Circular 001/26 SP.
- **Licencia obligatoria para pesca deportiva marítima.** La Ley XVII Nº 8 (ex Ley 1087) abarca el mar territorial: art. 8 y art. 17, «requiere la obtención previa de la licencia de pesca».
- **Exentos:** menores de 14 años (art. 21).
- **Precios publicados hoy** en el sitio oficial de permisos, sección "Pesca Marítima" ([pescacontinental.gob.ar](https://pescacontinental.gob.ar/)):

  | Categoría | Precio |
  |---|---|
  | Pesca desde la costa | $2.000 |
  | Pesca de embarcación | $20.000 |
  | Pesca submarina | $10.000 |

- **Trámite:** asistente DINO por WhatsApp (wa.me/5492804603466). El permiso llega en PDF.
- **No verificado:** vigencia (día, temporada o año) y exenciones de jubilados u otros para la licencia **marítima**. Las exenciones de la licencia continental 2026-27 (jubilados y menores de 12, gratis) salen de prensa y **no se trasladan al mar**.

### 1.2 Tallas, cupos y vedas por especie
**Ninguna norma vigente encontrada.** La Ley XVII Nº 8, art. 20, faculta al Ejecutivo a fijarlas, pero no se halló ninguna resolución publicada. Se buscó en pesca.chubut.gob.ar, el Boletín Oficial, el Digesto y la web en general.

→ En la app, todas las especies mostrarán **"Consultar normativa vigente"** con enlace a la Secretaría de Pesca. La excepción es el gatopardo.

**Disposición 214/1994 (Península Valdés).** Proyecto Arrecife le atribuye: anzuelo único, 30 kg por día, embarcado del 1/1 al 15/8 y prohibición de concursos. **No pude abrir el texto original**, así que queda **excluida**.

### 1.3 Tiburones y condrictios
| Especie | Norma | Confianza |
|---|---|---|
| **Gatopardo** (*Notorynchus cepedianus*) | **Monumento Natural Provincial**. Ley XI Nº 93 (BO 20/05/2025), art. 2: «Queda prohibida la caza, captura, comercio o acoso». | Oficial |
| Cazón, gatuzo, bacota, pez gallo, rayas | **No hay norma provincial recreativa.** | — |
| Condrictios en general | CFP Res. 8/2021 (nacional): prohíbe la pesca objetivo y los bicheros. Su redacción apunta a la flota comercial e «invita» a Chubut a adoptar medidas similares. **No la presentaré como obligatoria para el pescador de costa.** | Oficial |

### 1.4 Vedas de marea roja vigentes al 16/10/2026 — Oficial
Afectan la recolección de mejillón, cholga o almeja, también como carnada.

| Zona | Norma | Desde | Alcance |
|---|---|---|---|
| Golfo Nuevo | Res. 296/2026-SP | 05/08/2026 | Todos los bivalvos y caracoles, hasta levantamiento expreso. No se encontró levantamiento. |
| Golfo San Jorge norte (Caleta Córdova, Km 3, Rada Tilly, Playa Belvedere) | Circular 001/26 SP | 16/10/2026 | Ídem |

Advertencia oficial: «Su cocción NO elimina la toxina» ([marearoja.chubut.gov.ar](https://marearoja.chubut.gov.ar/)).

### 1.5 Otras normas aplicables — Oficial
- **Ley XVII Nº 8, art. 14:** prohíbe usar artes o aparejos sin autorización expresa.
- **Decreto 1889/11:** la red de costa y la recolección costera de mariscos son **pesca artesanal con registro**, no recreativa.
- **Pesca submarina:** solo en el mar y con licencia.

---

## 2. Mareas (SHN)

### 2.1 Puertos patrón en Chubut — Oficial
Fuente: `hidro.gob.ar/oceanografia/Tmareas/RE_TablasDeMarea.asp`.

| Código | Puerto | Lat / Lon (SHN) | Nivel medio sobre plano de reducción | Amplitud 2026 máx / media |
|---|---|---|---|---|
| SROM | Fondeadero San Román (Golfo San José) | 42°15'S 64°14'W | 4,53 m | 8,36 / 5,78 m |
| MADR | Puerto Madryn | 42°46'S 65°02'W | 3,20 m | 5,04 / 3,79 m |
| RAWS | Puerto Rawson | 43°20'S 65°04'W | 2,75 m | 4,70 / 3,44 m |
| SELE | Puerto Santa Elena | 44°31'S 65°22'W | 2,61 m | 4,72 / 3,26 m |
| COMO | Puerto Comodoro Rivadavia | 45°52'S 67°28'W | 2,99 m | 5,75 / 4,10 m |

**Formato y referencias:**
- Las horas están en «huso +3», es decir **UTC−3**.
- Las alturas están referidas al plano de reducción de cada puerto. El SHN adoptó LAT desde 2004.
- Solo se publican **pleamares y bajamares**, sin alturas horarias, y sin indicar cuál es pleamar y cuál bajamar. Se deduce por alternancia y altura.

**Advertencias del SHN:**
- Las tablas no incluyen efectos meteorológicos.
- En Madryn, San Román y Comodoro «el mareograma se aleja de una sinusoide»: interpolar puede errar ~10 % de la amplitud a media marea.
- El SHN ofrece su propia **Tabla de Interpolación** (op=10). Propongo usar ese método en lugar de un coseno simple.

### 2.2 Puertos secundarios oficiales (correcciones SHN)
Las correcciones de hora y altura, para pleamar y bajamar, están en `raw/02_tides.md` §2.

| Patrón | Secundarios |
|---|---|
| Madryn | Punta Norte, Caleta Valdés, Puerto Pirámide, Faro Punta Delgada, Punta Ninfas, Isla Escondida, Bahía Janssen, Bahía Vera (Cabo Raso), Bahía Cruz |
| San Román | Fondeaderos Sarmiento, La Argentina y Pueyrredón |
| Santa Elena | Bahía Camarones (Caleta Carolina) |
| Comodoro | Puerto Melo, Bahía Gil, Caleta Leones, Isla Tova, Bahía Bustamante, Bahía Solano (Punta Novales)* |

\*Bahía Solano trae «0 00» en las columnas de altura, con formato irregular. Se tratará como **corrección no confirmada**.

**Sin entrada SHN:** Rada Tilly, Caleta Córdova, Punta Tombo, Playa Unión, Puerto Lobos, Bajo Los Huesos y Barrancas Blancas.
⚠️ La "Punta Lobos" del SHN está en Buenos Aires, no es Puerto Lobos.

### 2.3 Asignación de puerto de marea por spot
Regla: solo se aplica corrección si el SHN la publica. Si no, se muestra la marea del puerto oficial más cercano con la leyenda **"Referencia: [puerto]. Sin corrección oficial para este punto."**

| Spot | Referencia | Tipo |
|---|---|---|
| Puerto Pirámides, Punta Pardelas | Secundario Puerto Pirámide | Oficial para Pirámide; Pardelas es aproximación |
| El Doradillo, Playa Garipe, Muelle Piedrabuena, Playa Paraná | Patrón Madryn | Directo para el muelle; resto aproximación |
| Punta Ninfas | Secundario Punta Ninfas | Oficial |
| Bajo Los Huesos, Playa Canto, Playa Unión / Los Palos, escollera Rawson, Magagna, Santa Isabel, El Sombrerito, Punta Delfín | Patrón Rawson | Aproximación, salvo el puerto mismo |
| Isla Escondida | Secundario Isla Escondida | Oficial |
| Cabo Raso | Secundario Bahía Vera (Cabo Raso) | Oficial |
| Camarones, Playa Thompson, Playa Honda | Secundario Bahía Camarones | Oficial para Caleta Carolina; playas aproximación |
| Bahía Solano | Secundario Bahía Solano | Corrección no confirmada |
| Caleta Córdova, Comodoro Km 3 / 4 / 5 | Patrón Comodoro | Aproximación |
| Rada Tilly | Patrón Comodoro | Aproximación (~12 km) |
| Puerto Lobos | **Ninguna** | Golfo San Matías; no hay referencia SHN chubutense. Se muestra sin marea. |

### 2.4 Acceso a los datos
- **Patrones:** `POST RE_TablasDeMarea.asp` con `FAnio=2026&Localidad=MADR&FMes=10`. Funciona sin token. Los 60 archivos mensuales 2026 ya están descargados.
- **Secundarios:** `GET R_TPSMareas.asp?CSRFToken=…&Psec=<nombre>`. ⚠️ Si el nombre no coincide, el servidor devuelve en silencio la ficha de "PASO TAMAR". El parser debe validar el nombre devuelto.
- **No hay** endpoint JSON ni CSV para predicciones. Los mareógrafos en tiempo real del SHN no incluyen ninguna estación de Chubut.

### 2.5 Sicigia y cuadratura
- El SHN **no publica en la web** amplitudes medias de sicigia y cuadratura.
- La fase lunar se calculará astronómicamente con SunCalc.
- El indicador de "marea grande / chica" se derivará de la amplitud del día **comparada con la amplitud media 2026 publicada por el SHN** para ese puerto. Se rotulará como cálculo propio.

### 2.6 Licencia de uso
- El pie de página del SHN dice «© Todos los Derechos Reservados», aunque el conjunto figura en su catálogo de Datos Abiertos.
- **Recomendación:** pedir permiso escrito a shn@hidro.gov.ar antes de publicar la app.
- Para uso personal no veo impedimento práctico (ver Decisión 3).

### 2.7 Capa secundaria Open-Meteo (no oficial) — probada hoy sin clave
- **Viento:** `wind_speed_10m`, `wind_gusts_10m` y `wind_direction_10m` funcionan.
- **Oleaje:** `wave_height` devolvió **null** dentro del Golfo Nuevo. Habrá que usar puntos mar adentro o tolerar el vacío.
- **Temperatura del mar:** SST ~12 °C.
- **Nivel del mar:** `sea_level_height_msl` es un **modelo** referido al nivel medio, no a LAT. La documentación dice que no sirve para navegación costera. La fase coincidió con el SHN: mínimo 06:00 contra bajamar 05:56.
- **Licencia:** el uso no comercial es gratuito; el comercial requiere licencia.

---

## 3. Spots

**Sobre las coordenadas.** Todas provienen de OpenStreetMap/Nominatim o Wikipedia y son **centroides de localidad o área, nodos de playa o cabo, o puntos de un muelle o faro**. **Ninguna fuente publica el punto exacto de pesca.** Ver Decisión 1.

### 3.1 Spots verificados (entran al dataset)

| # | Spot | Coord. (fuente, tipo) | Modalidad | Lo verificado | Peligros verificados | Confianza principal |
|---|---|---|---|---|---|---|
| 1 | **Puerto Lobos** (lado Chubut) | −42.0015, −65.0728 (OSM, localidad) | Playa | ~20 km de ripio desde RN3; frecuentado por pescadores; **sin servicios ni agua potable** | — | Exp. local |
| 2 | **Puerto Pirámides** | −42.5719, −64.2825 (OSM, comuna) | **Embarcación** con operador | Salidas sep–mar (sitio comunal); salmón y mero; sin vehículos en playas. Caminos internos de PV cerrados al 01/08/2026: verificar. Pesca de costa en el pueblo **no documentada** | Derrumbes en acantilados (comuna) | Oficial + Exp. local |
| 3 | **Punta Pardelas** | −42.6161, −64.2703 (OSM, cabo) | — | Solo "lugar de pesca" | — | Exp. local |
| 4 | **El Doradillo** (ANP municipal) | 42°40′13″S 64°59′19″O (Wikipedia, playa) | Playa | «La pesca de costa está permitida». **Jun–dic prohibido entrar al agua y actividades náuticas.** Sin acampe; fuego solo en sitios designados; sin perros | Ruta intransitable con lluvia | **Oficial** (Municipalidad) |
| 5 | **Playa Garipe** (RP42) | −42.6039, −64.8295 (OSM, nodo) | Playa | Sede de concursos de pejerrey (mayo). Si está dentro de El Doradillo, no verificado | — | Exp. local |
| 6 | **Muelle Piedrabuena** (Madryn) | −42.7626, −65.0298 (OSM, muelle) | **Muelle** | «utilizados para la pesca deportiva con cañas» (APPM). Horarios no documentados; puede cerrarse en días de crucero (no documentado) | — | **Oficial** (APPM) |
| 7 | **Playa Paraná** (Madryn) | −42.7957, −64.9439 (OSM, nodo) | Playa | Sede de las "5 Horas del Pejerrey" (mayo) y de las "20 Horas" (marzo); pejerrey | Veda de bivalves Golfo Nuevo | Exp. local |
| 8 | **Punta Ninfas** | 42°56′14″S 64°20′05″O (Wikipedia) | Acantilado / playa | Listado como lugar de pesca por el Municipio de Rawson y la UEPP; ripio que se vuelve barrizal con lluvia; **sin combustible en el trayecto** | Acantilado alto; elefantes marinos | Oficial + Exp. local |
| 9 | **Bajo Los Huesos** (Bahía Engaño) | −43.2066, −64.8893 (OSM, localidad) | Playa agreste | «habilitado para la pesca deportiva marítima» (Municipio de Rawson). **Pejerrey, cazón, pez gallo, chuchos**; mejor sep–oct (municipio) | Oleaje en concursos | **Oficial** + Exp. local |
| 10 | **Playa Canto** (zona Punta León) | **Sin coordenadas en fuente** | Playa | Lugar de pesca según el municipio | ⚠️ **Pescadores aislados por la creciente (abr-2025)**; «rescates habituales» según el jefe de Bomberos | Oficial (vía prensa) |
| 11 | **Playa Unión / Los Palos** | −43.2978, −65.0257 (OSM, área) | Playa, espigones | «Sector de Pesca de costa». Especies: róbalo, pejerrey, raya, cazón, gallo, palometa, palo (municipio). Fiesta del Róbalo en invierno (jun–ago) | Corrientes junto a la escollera | **Oficial** + Exp. local |
| 12 | **Escollera sur, Puerto Rawson** | −43.3431, −65.0477 (OSM, **faro**, punto exacto) | Escollera | Róbalo y mero | ⚠️ **3 personas aisladas por la pleamar en la escollera (2018)**, rescate por el 106 | Oficial (Prefectura vía prensa) |
| 13 | **Playa Magagna** | −43.3814, −65.0447 (OSM, área) | Playa | Listada por el municipio y la UEPP; dunas y acantilados | — | Oficial |
| 14 | **Playa Santa Isabel** | −43.4181, −65.0761 (OSM, playa) | Playa (arena fina) | Listada por el municipio y la UEPP | — | Oficial |
| 15 | **El Sombrerito** | Sin coordenadas en fuente | Playa (arena y canto rodado) | Listada por el municipio | — | Oficial |
| 16 | **Punta Delfín** | −43.5396, −65.1945 (OSM, cabo) | — | Listada por el municipio y la UEPP | — | Oficial |
| 17 | **Isla Escondida** | −43.6794, −65.3392 (OSM, atractivo) | Playa | Listada por el municipio y la UEPP; ripio por RP1; **no es ANP**, sin guardafaunas | Elefantes marinos en harenes. **Bajada "del Baño" NO habilitada para embarcaciones** (Prefectura); lancha a la deriva en 2023 | Oficial + Exp. local |
| 18 | **Cabo Raso** | −44.3374, −65.2493 (OSM, paraje) | — | Ripio (RP1); hay pesca, sin especies; camping; **sin teléfono ni internet** | — | Exp. local |
| 19 | **Camarones**: Playa Thompson y Playa Honda | Pueblo −44.7985, −65.7104 (OSM, municipio). Playas **sin coordenadas en fuente** | Playa y embarcación | 72 km por RP30 desde RN3; playas sede del concurso de costa de la Fiesta Nacional del Salmón (abril en ediciones recientes) | — | Exp. local |
| 20 | **Bahía Solano** | −45.6204, −67.3123 (OSM, bahía) | Playa | Sede de la Fiesta Provincial del Róbalo y de las "10 Horas de Pesca Variada" | — | Exp. local |
| 21 | **Caleta Córdova** (muelle) | −45.7410, −67.3656 (OSM, caleta) | **Muelle** y costa | Jornada municipal de pesca en el muelle (2025); a 18 km del centro | ⚠️ **9 personas aisladas por la creciente cerca del Faro San Jorge (2021, Prefectura)**. Veda de bivalves vigente | **Oficial** |
| 22 | **Comodoro Km 3 / Km 4 / Km 5** | Sin coordenadas en fuente | Playa | Playas de pesca habitual; agua **no apta para baño** (2019) | Veda de bivalves en Km 3 | Exp. local |
| 23 | **Rada Tilly** | 45°56'S 67°32'O (Wikipedia, localidad) | Playa | **Pesca autorizada entre las bajadas 2 y 28 todo el año; del 15/12 al 15/03 solo de 20 a 11 h; prohibida de la bajada 28 al norte** (ordenanza 2021) | Veda de bivalves vigente | **Oficial** (Municipio) |

Notas:
- Se listan 23 filas: Camarones agrupa dos playas, y Comodoro Km 3/4/5 cuenta como un sector.
- Las especies por spot solo figuran cuando hay fuente oficial o 2 fuentes. En el resto, el dato de especies queda vacío.
- **Restinga Alí** queda fuera como spot: agua contaminada y un único caso de 4x4 atrapada por la marea, de fuente única.

### 3.2 Zonas restringidas (se mostrarán como "zona restringida" con motivo)

| Zona | Restricción | Fuente |
|---|---|---|
| **Punta León** | No abierta al público; solo investigación | Wikipedia (Ley 2580/1985) + provincia (2012) |
| **Punta Tombo** (reserva + AMP, Ley XI Nº 65) | Acceso controlado. **Ninguna fuente habilita la pesca** → no pescable | Wikipedia + AMP Argentina |
| **Punta Loma** (ANP provincial) | Pesca no documentada → no presentar como spot | chubutpatagonia.gob.ar |
| **Península Valdés: zonas intangibles** | Caleta Valdés completa; apostaderos (250 m en tierra y 500 m en el mar), incluidos Punta Norte, Punta Delgada y Punta Pirámides; Isla de los Pájaros (2.000 m); franja marina de 3 mn. Pesca de costa solo «cerca de El Riacho y Larralde» y en la costa sur del Golfo Nuevo entre Pta Ameghino y Pta Arco. **Zonificación rotulada "preliminar".** | Plan de Manejo PV (Oficial) |
| **Península Valdés: navegación** | Prohibido navegar en la Zona Intangible durante la temporada de ballenas 2026 (Prefectura, vía prensa) | Diario Jornada |
| **El Doradillo** | Pesca de costa sí; agua y náutica no, de junio a diciembre | Municipalidad de Madryn |
| **Muelle Storni** | Uso portuario comercial; pesca deportiva no documentada | APPM |
| **Rada Tilly, de la bajada 28 al norte** | Pesca prohibida | Municipio |
| **Punta del Marqués** (ANP, ampliada 2025) | Apostadero de lobos; sin reglas de pesca halladas → no pescar sin consultar | Prensa con datos oficiales |
| **Rocas Coloradas** (ANP, Ley XI Nº 72) | Sin reglas de pesca halladas → consultar | derecho.uba.ar |
| **Elefantes marinos (toda la costa)** | Franja de 50 m de «no aproximación» (Ley XI Nº 92, como contenido del plan de manejo) | Oficial |

### 3.3 Spots en espera: Parque Provincial Patagonia Azul (Ley XI Nº 90, 2025)
Comprende **Cabo Dos Bahías, Caleta Sara, Bahía Bustamante / Arroyo Marea, Bahía Arredondo** y el PIMCPA.

**Conflicto de fuentes:**

| Postura | Quién lo dice |
|---|---|
| "Toda la zona marina es no-take", incluida la pesca recreativa | Rewilding, Mongabay, GreenMe |
| La ley **no menciona la pesca** | Texto de la ley en el Boletín Oficial |
| Caleta Sara es «ideal como área de pesca (de costa o embarcado)» | APN, página vigente |
| El Plan de Manejo debía estar hecho en un año (≈ mayo 2026) | Ley XI Nº 90; no se encontró el plan |

**Propuesta:** no mostrarlos como spots hasta tener confirmación oficial. Ver Decisión 2.

### 3.4 Descartados (sin fuente suficiente)
| Motivo | Candidatos |
|---|---|
| Fuente única | Caleta Valdés (además es intangible), Punta Delgada, Punta Cormoranes, Bahía Cracker, Cerro Avanzado, Barrancas Blancas*, Playa Ancina, Los Límites / Playa Bonita |
| Sin ninguna fuente de pesca | Punta Norte, costa chubutense del San Matías salvo Puerto Lobos, "escollera" de Madryn, Punta Cuevas, Playa Kaiser, Punta Arco, Las Canteras (Rawson), Playa Las Elenas, Punta Tafor, Punta Novales, muelle del puerto de Comodoro, Ramón Santos |
| Solo marisqueo artesanal | Riacho San José, Playa Larralde |

\*Barrancas Blancas: la única guía (ADNSUR 2025) advierte «cuando sube la marea no queda costa transitable». Ver Decisión 5.

---

## 4. Especies

### 4.1 Especies verificadas como capturadas recreativamente en Chubut

| Especie | Nombre científico | IUCN | Temporada en Chubut (con fuente) | Datos de pesca verificados (2 fuentes u oficial/científico) |
|---|---|---|---|---|
| **Róbalo** | *Eleginops maclovinus* | NE | Invierno: abril a mediados de noviembre (Exp. local); concursos jun–ago | Carnada **langostino / camarón**; **mosca** (Exp. local) |
| **Pejerrey de mar** | *Odontesthes* spp. (*O. smitti*, *O. argentinensis* hasta Rawson) | NE | Invierno–primavera (Exp. local) | — |
| **Salmón de mar** | *Pseudopercis semifasciata* | NE | **Oct–abr, pico ene–feb** (Científico, Golfo San José) | **Embarcado** sobre "salmoneras", a la deriva; **anzuelos pata larga 9/0–10/0, plomada 250–500 g**; carnada **pulpito, calamar, pescado fresco** (Científico + Exp. local). Récord Chubut: 30,3 kg (1968) |
| **Mero** | *Acanthistius patachonicus* | DD | Biología: vuelve a arrecifes someros en verano, máximo en otoño (Científico) | Especie más capturada en pesca de altura (Científico) |
| **Turco** | *Pinguipes brasilianus* | NE | — | Menos frecuente con anzuelo (Científico) |
| **Escrófalo** | *Sebastes oculatus* | — | — | Pesca de altura del Golfo Nuevo al sur (Científico) |
| **Besugo** | *Pagrus pagrus* | — | Todo el año; más en verano-otoño (Científico) | Embarcado (Exp. local) |
| **Caballa / magrú** | *Scomber colias* | LC | — | Señuelo o línea de media agua desde lancha (Científico) |
| **Cazón** | *Galeorhinus galeus* | **CR** | **Sep–abr** en Bahía Engaño (Oficial, IUCN SSC). Única área de parición conocida del Atlántico SO | Capturado habitualmente desde costa en Bahía Engaño (Oficial) |
| **Gatuzo** | *Mustelus schmitti* | **CR** | Neonatos nov–abr (Oficial) | — |
| **Pez gallo** | *Callorhinchus callorynchus* | **VU** | **Sep–mar**; adultos se retiran desde marzo (Científico + Oficial) | Carnada **langostino**, solo o con anchoíta, y **anchoíta**; caña **3,5–4,2 m**; nylon **~0,30 mm** (Exp. local). Espina dorsal aserrada: puede herir |
| **Gatopardo** | *Notorynchus cepedianus* | **VU** | Caleta Valdés todo el año, pico oct–feb (Oficial) | ⛔ **Protegido por Ley XI Nº 93: no se puede capturar.** Si pica: liberar de inmediato |
| **Bacota** | *Carcharhinus brachyurus* | **VU** | Sin dato chubutense | Se pesca hasta la desembocadura del río Chubut (Científico). Chubut es su límite sur |
| **Pez ángel** | *Squatina guggenheim* | **EN** | Neonatos ago–abr (Oficial) | — |
| **Rayas** | *Sympterygia bonapartii*, *Discopyge tschudii* (eléctrica) | NT / LC | Neonatos nov–feb / mar–abr (Oficial) | "Raya" desde playa (Exp. local) |
| **Chucho** | *Myliobatis* spp. (*M. goodei* VU, *M. ridens* CR) | VU / CR | Verano (concursos de febrero) | Pieza mayor en las 20 Horas de Playa Unión |
| *Palometa* | *Parona signata* | LC | — | ⚠️ **Fuente única** (prensa 2007) más la lista municipal de Los Palos. Propongo incluirla solo por la mención oficial del municipio |

- Las tallas (máximas y típicas), la identificación y las imágenes de cada especie están en `raw/05_species.md`.
- Se usan los datos argentinos (Proyecto Arrecife, tesis) por sobre FishBase cuando FishBase está desactualizado; ver §8.

**Imágenes:** hay una por especie, todas con licencia libre de Wikimedia Commons:
- CC BY, CC BY-SA, CC0 o dominio público.
- Para salmón de mar y turco no hay foto libre: se usan láminas de dominio público de Cuvier & Valenciennes.
- Para pejerrey, la foto es de *O. argentinensis*.
- 3 licencias se confirmaron abriendo la página del archivo; el resto, por la API de Commons. Las abriré una por una antes de publicar.

### 4.2 Especies descartadas
| Especie | Motivo |
|---|---|
| **Escalandrún** | Su límite sur es el Golfo San Matías (41,5°S): **no llega a Chubut** (Científico). Es un mito local que se corrige. |
| **Chernia, abadejo, merluza** | Especies de profundidad (100–550 m); sin evidencia de pesca recreativa en Chubut. |
| **Lenguados, sargo, castañeta, pescadilla** | Presentes en la costa, pero sin documentación de captura recreativa en Chubut. |
| **"Corvina", "perca", "cornalito", "falso salmón de mar"** | Nombres de textos turísticos sin especie identificable. |

### 4.3 Lo que NO hay (para el diseño)
- **Mejor fase de marea por especie:** ningún dato cumple el criterio. Hay datos de fuente única para pez gallo («con marea estática… la actividad es nula», Proyecto Arrecife) y para róbalo (inicio de bajante, Río Negro).
- **Mejor hora del día:** ningún dato verificado.
- **Distancia de lance:** ningún dato. La profundidad solo está verificada para salmón (pesca documentada hasta ~55 m) y mero.
- **Aparejos detallados de costa** (pejerrey, cazón, rayas): las recetas existentes son de fuente única o se contradicen entre sí.

---

## 5. Seguridad y emergencias

| Número | Servicio | Fuente |
|---|---|---|
| **106** | Emergencia náutica (Prefectura Naval) | argentina.gob.ar (Oficial); usado en rescates de Rawson e Isla Escondida |
| **911** | Sistema de Emergencias Coordinadas | Ley XIX Nº 77. **Funcionamiento actual no verificado.** |
| **100 / 101 / 103 / 105 / 107** | Bomberos / Policía / Defensa Civil / Emergencia ambiental / Emergencia médica | Ley XIX Nº 77 + Municipalidad de Madryn |
| (0280) 4451603 | Prefectura Puerto Madryn | Prensa citando a Prefectura + directorio PNA |

**Teléfonos no verificados:**
- Prefectura Rawson y Camarones: no encontrados.
- Prefectura Comodoro: solo aparece en un directorio de Sanidad, así que no lo publicaré.

**Peligros documentados (oficial o prensa citando a Prefectura o Bomberos):**
- Gente aislada por la creciente en la escollera de Rawson (2018), Playa Canto (2025) y Caleta Córdova (2021).
- Lancha a la deriva desde una bajada no habilitada en Isla Escondida (2023).
- Derrumbes de acantilados en Península Valdés.
- Sin señal de celular en el interior de Península Valdés y en Cabo Raso.

**Distancias a fauna:**
- Elefantes marinos: 50 m (Ley XI Nº 92).
- Apostaderos de Península Valdés: 250 m en tierra y 500 m en el mar (Plan de Manejo).
- Ballenas: 100 m desde embarcación (Prefectura, vía prensa).
- Pingüinos: **sin distancia oficial**.

---

## 6. Datos excluidos por no verificables (resumen)
1. Tallas, cupos y vedas por especie. Disp. 214/94 sin texto.
2. Vigencia y exenciones de la licencia marítima, salvo menores de 14 años.
3. Coordenadas exactas de pesca, en todos los spots.
4. Mejor fase de marea por spot. Distancias de lance.
5. Mejor hora y aparejos de costa por especie, salvo los indicados en §4.1.
6. Reglas de pesca de Punta Loma, Punta Tombo, Cabo Dos Bahías, Punta del Marqués, Rocas Coloradas y Patagonia Azul.
7. Correcciones de marea para Rada Tilly, Caleta Córdova, Playa Unión y Puerto Lobos. La de Bahía Solano es dudosa.
8. Predicciones SHN 2027.
9. Amplitudes de sicigia y cuadratura del SHN.
10. Teléfonos de Prefectura en Rawson, Camarones y Comodoro (guardia). Funcionamiento actual del 911.
11. Distancia oficial a pingüinos.
12. Especies: escalandrún (descartado), chernia, abadejo, merluza, lenguado, sargo, palometa (parcial).

## 7. Spots: datos de fuente única (no entran; para tu criterio)
- Técnica en Playa Garipe: camarón teñido, anzuelo Sode Nº 5.
- Bajo Los Huesos: «se puede pescar en cualquier marea».
- Barrancas Blancas: guía completa, con advertencia de marea.
- Especies en Rada Tilly, Caleta Córdova, Camarones y Comodoro: fuente principal, Weekend.
- Disp. 214/94.

Detalle en los anexos.

## 8. Discrepancias resueltas
| Tema | Resolución |
|---|---|
| Costo de la licencia de costa | Proyecto Arrecife dice "gratis"; el sitio oficial cobra $2.000 → **prevalece el oficial**. |
| Número de la ley de Patagonia Azul | XI Nº 90 (Boletín Oficial), no XI Nº 91. |
| Exención por edad | Menores de 14 años (ley marítima); los menores de 12 son del régimen continental. |
| Período restringido en El Doradillo | La misma página oficial dice "jun–oct" y "jun–dic" → se usa **jun–dic**, el más restrictivo. |
| Fiesta Nacional del Salmón | Ediciones recientes en **abril**, no en febrero. |
| Róbalo "prohibido" en un concurso de Rawson | Regla del reglamento del concurso; **no hay veda legal**. |
| Temporada embarcada en Península Valdés | Disp. 214 (1/1–15/8, no verificada) vs. comuna (sep–mar) → se muestra la oficial de la comuna. |
| Tamaño y estado de conservación | Salmón: máximo de FishBase desactualizado; se usan 1,40 m / 37 kg (CONICET). Pez gallo: VU según IUCN, no LC. Pez ángel: EN. Mero y turco: FishBase subestima o sobreestima → se usa la ciencia argentina. |
| Ubicaciones | Isla Escondida está **al norte** de Punta Tombo. Bahía Arredondo está cerca de Camarones. Ramón Santos está en Chubut. |
| Distancias | Hay contradicciones (El Doradillo, Punta Ninfas, Bajo Los Huesos, Camarones, Rada Tilly) → **no se mostrarán distancias en km**, solo el tipo de acceso. |

---

## 9. Decisiones que necesito de vos

| # | Decisión | Mi recomendación |
|---|---|---|
| **1** | **Coordenadas.** No existen coordenadas verificadas de puntos de pesca. ¿Uso las de OSM/Wikipedia (localidad, playa, cabo) rotuladas como **"ubicación de referencia, no punto de pesca"**, o no pongo marcadores? | Usar OSM rotuladas. Los spots sin coordenadas en fuente (Playa Canto, El Sombrerito, Km 3/4/5, Thompson, Honda) van **sin marcador**, solo en lista. |
| **2** | **Patagonia Azul** (Cabo Dos Bahías, Caleta Sara, Bustamante, Arroyo Marea, Arredondo). | Mostrarla como "zona en revisión normativa: consultar antes de pescar", **sin presentarla como spot**. |
| **3** | **Mareas.** Solo hay datos oficiales hasta el **31/12/2026**, y el SHN dice "derechos reservados". | Embeber 2026. Desde el 1/1/2027, la app muestra **"Tabla oficial 2027 aún no cargada"** más la curva Open-Meteo rotulada **"modelo, no oficial"**. Y escribirle al SHN para pedir permiso si vas a publicar la app. |
| **4** | **"Ventana ideal de pesca".** No hay datos verificados de mejor fase de marea por especie. | Reemplazarla por una **ventana que define el usuario** ("me gusta pescar 2 h antes de la pleamar"), guardada en el dispositivo. Mostrar como nota de fuente única la observación científica sobre pez gallo (marea estática = sin actividad). **No inventar una ventana "recomendada".** |
| **5** | **Peligros de fuente única** (Barrancas Blancas, Restinga Alí). | Mostrarlos en Seguridad como **"reporte de fuente única"**. Ante un riesgo, prefiero advertir de más. Es la única excepción a la regla de 2 fuentes, y quedaría rotulada. |
| **6** | **Índice de pesca.** Con datos de especie tan incompletos, el índice se apoyará sobre todo en viento (Open-Meteo), temporada (donde exista) y amplitud de marea. | Hacerlo así, con la fórmula visible y la etiqueta "orientativo". |

Cuando confirmes, sigo con el **Entregable 2** (arquitectura de información y concepto visual pantalla por pantalla).
