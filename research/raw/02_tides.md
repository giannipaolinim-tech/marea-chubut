# 02 — Mareas oficiales SHN, costa atlántica de Chubut

Consultado: **2026-10-16**. Fuente: Servicio de Hidrografía Naval (SHN), https://www.hidro.gob.ar
Los HTML originales están en `research/raw/tides_raw/`: 60 archivos mensuales de puertos patrón y 76 fichas de puertos secundarios. Este documento no contiene datos parseados; las filas de muestra se copiaron tal como aparecen en esos HTML.

---

## 1. Puertos patrón del SHN en Chubut (42°S–46°S)

En la lista de patrones del formulario `Form_Tmareas.asp` (año 2026) hay **5 puertos patrón en Chubut**. Los valores salen de la cabecera de cada predicción mensual 2026.

| Puerto (nombre SHN) | Código `Localidad` | Lat / Lon (SHN) | Huso | Régimen | Estab. puerto medio | Nivel medio sobre plano de reducción | Amplitud 2026 máx / media (m) | Pleamar máx / media (m) | Bajamar más baja / media (m) | Cartas |
|---|---|---|---|---|---|---|---|---|---|---|
| FONDEADERO SAN ROMÁN (Golfo San José) | `SROM` | 42º 15' S, 64º 14' W | +3 | Semidiurno | Xh 27min | 4,53 m | 8,36 / 5,78 | 8,71 / 7,41 | 0,31 / 1,63 | H-277 |
| PUERTO MADRYN | `MADR` | 42º 46' S, 65º 02' W | +3 | Semidiurno | VIh 35min | 3,20 m | 5,04 / 3,79 | 5,85 / 5,05 | 0,53 / 1,26 | H-264 |
| PUERTO RAWSON | `RAWS` | 43º 20' S, 65º 04' W | +3 | Semidiurno | Vh 43min | 2,75 m | 4,70 / 3,44 | 5,06 / 4,46 | 0,20 / 1,02 | H-215, H-219 |
| PUERTO SANTA ELENA | `SELE` | 44º 31' S, 65º 22' W | +3 | Semidiurno | IVh 47min | 2,61 m | 4,72 / 3,26 | 4,88 / 4,24 | 0,10 / 0,98 | N°44, N°46, H-311 |
| PUERTO COMODORO RIVADAVIA | `COMO` | 45º 52' S, 67º 28' W | +3 | Semidiurno | IIh 55min | 2,99 m | 5,75 / 4,10 | 5,99 / 5,15 | 0,17 / 1,05 | H-357A, H-357B |

Fuente: `RE_TablasDeMarea.asp` con POST, consultado el 2026-10-16 (archivos `shn_<COD>_2026_MM.html`).

**Correcciones de carta indicadas en las cabeceras (copia textual):**
- Comodoro Rivadavia: «Para utilizar las cartas náuticas de referencia H-357A y H357B, donde se indica que el nivel medio de puerto Comodoro Rivadavia pasa 3,14 m sobre el plano de reducción, se les debe sumar a estas predicciones 0,15 m…»
- San Román: «…carta H-277, donde se indica que el nivel medio … pasa 4,11 m sobre el plano de reducción, se les debe restar a estas predicciones 0,42 m…»
- Santa Elena: la carta N°44 requiere restar 0,32 m y la carta N°46 sumar 0,01 m.

**Lo que no es puerto patrón:** Puerto Pirámides, Bahía Camarones, Caleta Córdova, Bahía Bustamante, Punta Delgada, Caleta Valdés, Puerto Lobos, Punta Tombo, Rada Tilly y Playa Unión no aparecen como puertos patrón. Algunos figuran como secundarios (tabla siguiente).

## 2. Puertos secundarios del SHN en Chubut

Fuente: `https://www.hidro.gob.ar/oceanografia/Tmareas/R_TPSMareas.asp?CSRFToken=<token>&Psec=<nombre>`, con el token tomado de `Form_TMareas.asp?op=3`. Consultado el 2026-10-16. Archivos `psec_*.html`.

Cómo se aplican las correcciones, según el texto del SHN:
- **Hora:** se suma con su signo a la hora de pleamar o bajamar del patrón. El resultado queda en el mismo huso que la predicción del patrón.
- **Altura:** se suma con su signo a la altura del patrón. El resultado queda referido al plano de reducción del puerto secundario.
- Si no hay corrección de hora de bajamar («- --»), el SHN indica: «se puede obtener un valor aproximado … calculando el promedio de las horas de las pleamares entre las cuales está comprendida la bajamar».
- En todas las fichas aparece la nota «s: Para pleamares de sicigia solamente».

Columnas: Corr. hora Pm / Bm (h min), Corr. altura Pm / Bm (m), Establecimiento de puerto medio, Nivel medio (m), Duración de la bajante, Amplitud media (m).

| Puerto secundario (nombre SHN) | Patrón | Lat S | Lon W | Δhora Pm | Δhora Bm | Δalt Pm | Δalt Bm | Estab. | Nivel medio | Dur. bajante | Amplitud media |
|---|---|---|---|---|---|---|---|---|---|---|---|
| PENÍNSULA VALDÉS – PUNTA NORTE | Puerto Madryn | 42 05 | 63 46 | +3 20 | +2 15 | +0,06 | -0,40 | 9 59 | 3,00 | 5 55 | 4,24 |
| GOLFO SAN JOSÉ – FONDEADERO SARMIENTO | F. San Román | 42 16 | 64 08 | +0 10 | - -- | 0,00 | 0,00 | - -- | 4,53 | - -- | 5,79 |
| GOLFO SAN JOSÉ – FONDEADERO LA ARGENTINA | F. San Román | 42 23 | 64 34 | -0 37 | - -- | -0,37 | +0,37 | 10 20 | 4,53 | - -- | 5,06 |
| GOLFO SAN JOSÉ – FONDEADERO PUEYRREDÓN | F. San Román | 42 24 | 64 09 | +0 05 | -0 02 | +0,12 | -0,12 | 10 21 | 4,53 | 6 17 | 6,04 |
| PENÍNSULA VALDÉS – CALETA VALDÉS | Puerto Madryn | 42 31 | 63 36 | +1 36 | +0 55 | -1,28 | -0,58 | 8 15 | 2,18 | 6 19 | 3,08 |
| PENÍNSULA VALDÉS – PUERTO PIRÁMIDE | Puerto Madryn | 42 35 | 64 17 | -0 15 | -0 41 | -0,06 | +0,09 | 6 24 | 3,20 | 6 34 | 3,63 |
| PENÍNSULA VALDÉS – FARO PUNTA DELGADA | Puerto Madryn | 42 46 | 63 38 | +0 39 | -0 24 | -1,06 | -0,21 | 7 18 | 2,63 | 5 57 | 2,93 |
| GOLFO NUEVO – PUNTA NINFAS | Puerto Madryn | 42 57 | 64 25 | -0 20 | -0 11 | -0,29 | -0,44 | 6 19 | 2,83 | 6 48 | 3,93 |
| ISLA ESCONDIDA | Puerto Madryn | 43 43 | 65 20 | -0 44 | -1 13 | -0,56 | -0,29 | 5 22 | 2,77 | 6 27 | 3,34 |
| BAHÍA JANSSEN | Puerto Madryn | 44 02 | 65 14 | -1 02 | -1 27 | -1,08 | -0,53 | 5 06 | 2,39 | 6 31 | 3,23 |
| BAHÍA VERA (Cabo Raso) | Puerto Madryn | 44 21 | 65 14 | -1 18 | -1 41 | -1,30 | -0,53 | 4 51 | 2,28 | 6 33 | 3,01 |
| BAHÍA CRUZ | Puerto Madryn | 44 27 | 65 19 | -1 34 | -1 57 | -1,63 | -0,72 | 4 35 | 2,45 | 6 30 | 3,33 |
| BAHÍA CAMARONES (Caleta Carolina) | Puerto Santa Elena | 44 54 | 65 36 | -0 37 | -0 25 | +0,24 | +0,15 | 4 16 | 2,82 | 6 22 | 3,35 |
| GOLFO SAN JORGE – PUERTO MELO | P. Comodoro Rivadavia | 45 01 | 65 50 | +0 27 | +0 24 | -0,64 | -0,15 | 3 44 | 2,68 | 6 22 | 3,69 |
| GOLFO SAN JORGE – BAHÍA GIL (Caleta Horno) | P. Comodoro Rivadavia | 45 02 | 65 41 | +0 27 | +0 24 | -0,64 | -0,15 | 3 44 | 2,68 | 6 22 | 3,69 |
| GOLFO SAN JORGE – CALETA LEONES | P. Comodoro Rivadavia | 45 04 | 65 35 | +0 25 | +0 20 | -0,34 | -0,34 | 4 12 | 2,85 | 6 20 | 4,18 |
| GOLFO SAN JORGE – ISLA TOVA | P. Comodoro Rivadavia | 45 06 | 65 59 | +0 27 | +0 24 | -0,64 | -0,15 | 3 44 | 2,68 | 6 22 | 3,69 |
| GOLFO SAN JORGE – BAHÍA BUSTAMANTE | P. Comodoro Rivadavia | 45 07 | 66 34 | +0 15 | +0 15 | -0,37 | -0,06 | 3 27 | 2,81 | 6 25 | 3,87 |
| GOLFO SAN JORGE – BAHÍA SOLANO (Punta Novales) | P. Comodoro Rivadavia | 45 42 | 67 20 | 0 00 | 0 00 | 0 00 (sic) | 0 00 (sic) | 3 04 | 2,99 | 6 25 | 4,18 |

Puertos cercanos fuera de Chubut, como referencia:
- GOLFO SAN JORGE – CALETA OLIVIA (Santa Cruz, 46 26 S, 67 31 W): patrón Caleta Paula, correcciones 0 00.
- GOLFO SAN MATÍAS – CALETA DE LOS LOROS (Río Negro, 41 02 S, 64 06 W): patrón Puerto San Antonio (Muelle de Ultramar), Δ +0 23 / +0 20 / -0 09 (sic) / +0,18.

**Atención:** «PUNTA LOBOS» (39 11 S, 61 52 W, patrón Puerto Belgrano) está en Buenos Aires y **no** es Puerto Lobos de Chubut. Hay que buscar por nombre y comprobar también las coordenadas.

**Comprobación cruzada:** en `Form_TMareas.asp?op=3` el SHN incluye un ejemplo con Puerto Pirámide cuyos valores (42 35, 64 17, -0 15, -0 41, -0,06, +0,09, 6 24, 3,20, 6 34, 3,63) coinciden con los de la ficha. Su resultado: «Las alturas obtenidas están referidas al plano de reducción de puerto Pirámide que pasa 3,20 m debajo del nivel medio.»

## 3. Años publicados y forma de acceso

- **Años disponibles:** el selector `FAnio` ofrece 2022, 2023, 2024, 2025 y 2026 (2026 por defecto). **2027 no está publicado.** Un POST con `FAnio=2027&Localidad=MADR&FMes=01` devuelve HTTP 200 con 4,4 KB y sin tabla (archivo `shn_MADR_2027_01_test.html`).
- **Puertos patrón: HTML por puerto y por mes.**
  - `POST https://www.hidro.gob.ar/oceanografia/Tmareas/RE_TablasDeMarea.asp`
  - Cuerpo `application/x-www-form-urlencoded`: `FAnio=2026&Localidad=MADR&FMes=10` (`FMes` va de 01 a 12; los códigos de `Localidad` están en la tabla 1).
  - No hace falta cookie, token ni Referer. Con `curl -d` funcionó al primer intento.
  - Se descargaron los 12 meses de 2026 para MADR, RAWS, SROM, SELE y COMO: cada mes trae entre 108 y 120 eventos, sin errores.
- **Puertos secundarios: HTML con una ficha por puerto.**
  - `GET https://www.hidro.gob.ar/oceanografia/Tmareas/R_TPSMareas.asp?CSRFToken=<token>&Psec=<nombre>`
  - `<token>` es el campo oculto `CSRFToken` de `Form_TMareas.asp?op=3`. Parece fijo, pero conviene leerlo en cada ejecución.
  - El valor de `Psec` es el texto de la opción con los espacios colapsados, codificado en UTF-8, por ejemplo `GOLFO SAN JORGE - BAHÍA BUSTAMANTE`.
  - **Riesgo:** un nombre no reconocido no da error. El servidor responde la ficha por defecto, «PASO TAMAR» (patrón Buenos Aires). Siempre hay que comprobar que el nombre devuelto coincide con el pedido.
  - Las respuestas vienen en ISO-8859-1/Windows-1252, aunque el formulario está en UTF-8.
- **Sin endpoint legible por máquina para las predicciones de pleamar y bajamar.** El catálogo Datos Abiertos (https://www.hidro.gob.ar/DA/DatosAbiertos.asp) remite a este mismo formulario. Su metadato (`/DA/MTMareas.asp`) dice: Formato «HTML», Frecuencia «Anual».
- **Mareógrafos en tiempo real:** `/Oceanografia/AlturasHorarias.asp` permite exportar a CSV (`?export=csv`), pero **no incluye ninguna estación de Chubut**. Las estaciones son Atalaya, Buenos Aires, La Plata, Mar del Plata, Martín García, Oyarvide, Pilote Norden, Puerto Belgrano, Punta Loyola, San Antonio Este, San Clemente, San Fernando y Ushuaia.
- **Alturas horarias:** el SHN calcula alturas horarias para 9 patrones y ninguno está en Chubut. Para Chubut solo hay pleamares y bajamares; para alturas intermedias el SHN propone la Tabla de Interpolación (`op=10`).
- **Publicación impresa:** H-610 «Tablas de Marea», que se vende por https://www.hidro.gob.ar/ventas/ventas.asp. No se encontró un PDF público.
- **Condiciones de uso:** el pie de página dice «© Copyright - Todos los Derechos Reservados - Servicio de Hidrografía Naval». No se encontraron términos de uso ni licencia abierta, aunque el conjunto figura en el catálogo «Datos Abiertos». Contacto del área: mareas@hidro.gov.ar, según tablas antárticas del SHN publicadas en iho.int; no está verificado en hidro.gob.ar. Contacto general: shn@hidro.gov.ar.

## 4. Formato y muestra (Puerto Madryn, octubre 2026)

Estructura HTML: `<tbody>` con un `<tr>` por evento. La celda del día (`<td CLASS="text-primary">`) solo trae el número en el primer evento de cada día. Luego vienen `<td>HH:MM</td><td>h,hh</td>` con coma decimal. **No se indica si cada evento es pleamar o bajamar**: hay que deducirlo por alternancia o por altura. No hay marcas de fase lunar. Los días tienen 3 o 4 eventos.

Muestra textual de `shn_MADR_2026_10.html`, extraída del HTML:

```
PUERTO MADRYN
Lat. 42º 46' S Long. 65º 02' W
Huso Horario: +3
Las alturas están referidas al plano de reducción que pasa 3,20 m debajo del nivel medio.
Predicciones de las Pleamares y Bajamares para: octubre/2026
DIA  HORA:MIN  ALTURA (m)
01   05:16  0,70 | 10:43  5,47 | 17:31  0,82 | 22:37  5,29
02   06:00  0,81 | 11:35  5,34 | 18:19  1,03 | 23:20  5,12
03   06:49  0,98 | 12:32  5,13 | 19:14  1,30
04   00:11  4,87 | 07:47  1,18 | 13:37  4,89 | 20:19  1,56
05   01:16  4,59 | 08:59  1,35 | 14:50  4,74 | 21:34  1,68
...
16   05:56  1,14 | 11:41  4,97 | 17:57  1,38 | 23:05  4,92
...
29   04:15  0,63 | 09:44  5,61 | 16:29  0,76 | 21:28  5,46
30   05:00  0,67 | 10:35  5,58 | 17:17  0,90 | 22:12  5,34
31   05:49  0,78 | 11:29  5,48 | 18:09  1,10 | 23:02  5,14
```
Las barras «|» separan eventos y se añadieron aquí para legibilidad. En el HTML cada evento ocupa su propia fila.

Muestras del 1 al 3 de octubre de 2026 en otros patrones:
- RAWSON: `01 04:43 0,60 | 10:30 4,81 | 16:54 0,67 | 22:39 4,87 · 02 05:28 0,65 | 11:19 4,72 | 17:38 0,83 | 23:22 4,73 · 03 06:15 0,76 | 12:12 4,54 | 18:27 1,08`
- COMODORO RIVADAVIA: `01 01:43 0,52 | 07:42 5,54 | 13:50 0,76 | 19:52 5,53 · 02 02:17 0,47 | 08:27 5,42 | 14:26 0,86 | 20:33 5,36`
- SAN ROMÁN: `01 02:33 8,51 | 08:58 0,58 | 14:58 8,28 | 21:18 0,87`
- SANTA ELENA: `01 03:16 0,28 | 09:31 4,77 | 15:37 0,67 | 21:43 4,70`

### Huso horario y datum: citas del SHN
- Cabecera de cada patrón: «Huso Horario: +3».
- Generalidades (`Form_TMareas.asp?op=12`): «Las alturas indicadas en estas Tablas de Marea están expresadas en metros y los valores horarios de todas las predicciones están calculados en huso +3. Se utiliza la convención que asigna valores positivos a los husos horarios ubicados al Oeste del meridiano de Greenwich…». Por tanto, **hora local = UTC−3**. Interpretación propia: Argentina usa UTC−3 todo el año y hoy no aplica horario de verano. Si eso cambia, las tablas seguirían en huso +3.
- Cabecera: «Las alturas están referidas al plano de reducción que pasa 3,20 m debajo del nivel medio» (Madryn; cada puerto tiene su propio valor).
- Generalidades: «El Servicio de Hidrografía Naval adoptó, desde 2004, la Bajamar Astronómica más Baja (LAT) como plano de reducción de sondajes para las Cartas Náuticas … y para los puertos incluidos en esta publicación.»
- Secundarios: «Las alturas así obtenidas quedan referidas al plano de reducción del puerto secundario.»
- Advertencias del SHN: las tablas «no incluyen los efectos de las acciones meteorológicas que pueden llegar a ser significativos». Además, en San Román, Madryn y Comodoro, entre otros, «el mareograma se aleja de una sinusoide»: interpolar entre pleamar y bajamar puede errar en torno al 10 % de la amplitud a media marea.

## 5. Amplitudes (rangos de marea)

- **El SHN no publica en la web amplitud media de sicigias ni de cuadraturas.** Las predicciones de patrones traen «Amplitud Máxima / Media» del año 2026 (tabla 1). Las fichas de secundarios traen «Amplitud Media». Según el glosario, las amplitudes medias son la media de todas las amplitudes durante un ciclo de Metón, es decir 19 años.
- Los valores de sicigia y cuadratura podrían figurar en el cuadro «Datos de Marea» de las cartas náuticas (H-264, H-215, H-357A…). No se verificó.

## 6. Correcciones para puntos de pesca concretos

| Punto | Estado oficial SHN |
|---|---|
| Playa Unión / Rawson | Puerto Rawson es **patrón** (43º20'S). Playa Unión no tiene entrada propia. Usar Rawson es una aproximación propia, no del SHN. |
| Puerto Pirámides | Secundario «PUERTO PIRÁMIDE» de Madryn (tabla 2). |
| Caleta Valdés | Secundario de Madryn (tabla 2). |
| Punta Delgada | Secundario «FARO PUNTA DELGADA» de Madryn. |
| Bahía Camarones | Secundario «BAHÍA CAMARONES (Caleta Carolina)» de **Puerto Santa Elena**. |
| Bahía Bustamante | Secundario de Comodoro Rivadavia. |
| Rada Tilly | **Sin entrada SHN.** El patrón más cercano es Comodoro Rivadavia (~12 km). Bahía Solano (Punta Novales) queda al norte. |
| Caleta Córdova | **Sin entrada SHN.** Entre Bahía Solano (45º42') y Comodoro (45º52'). |
| Punta Tombo | **Sin entrada SHN.** Los más cercanos son Isla Escondida (43º43') y Bahía Janssen (44º02'), ambos de Madryn. |
| Puerto Lobos (límite con Río Negro) | **Sin entrada SHN.** La «PUNTA LOBOS» del listado es de Buenos Aires. |
| San Román | Patrón, Golfo San José. |

## 7. Open-Meteo: capa secundaria no oficial

- Marine API: `https://marine-api.open-meteo.com/v1/marine`. Variables horarias: `sea_level_height_msl`, `wave_height`, `wave_direction`, `wave_period`, `sea_surface_temperature`, `ocean_current_velocity`, `ocean_current_direction`.
- Advertencias textuales de la documentación (https://open-meteo.com/en/docs/marine-weather-api):
  - «The reference (datum) height is the global mean sea level, not the lowest astronomical tide.»
  - «Accuracy at coastal areas is limited.»
  - «This is not suitable for coastal navigation and does not replace your nautical almanac.»
  - Resolución de mareas y corrientes: 0,08° (~8 km), con fuente MeteoFrance SMOC.
- Forecast API: `https://api.open-meteo.com/v1/forecast` con `hourly=wind_speed_10m,wind_gusts_10m,wind_direction_10m`, más `&wind_speed_unit=kmh|ms|kn` y `&timezone=America/Argentina/Buenos_Aires`.
- **Sin clave API** para uso no comercial; el parámetro `apikey` solo se exige para uso comercial. Hay que atribuir a Open-Meteo y a las fuentes de datos. Antes de lanzar una app con ingresos, revisar la licencia comercial.
- Prueba del 2026-10-16 en Madryn (-42.77, -65.03), archivos `openmeteo_marine_madryn.json` y `openmeteo_forecast_madryn.json`. Ambas llamadas devolvieron HTTP 200 sin clave.
  - `sea_level_height_msl`: mínimo de −2,07 m a las 06:00 local. El SHN da una bajamar a las 05:56, así que la fase es coherente. Los valores son relativos al nivel medio y **no** son comparables con las alturas SHN sobre el plano de reducción.
  - **`wave_height` vino `null`** en esa celda dentro del Golfo Nuevo (enmascarada como costa o golfo). Habrá que elegir puntos mar adentro o tolerar valores nulos.
  - `sea_surface_temperature`: ~11,7–12,0 °C.
  - Viento: `wind_speed_10m`, `wind_gusts_10m` y `wind_direction_10m` en km/h y grados, sin problemas.

## NO VERIFICADO

- Si existen predicciones 2027 en otro canal (H-610 impreso o PDF). La web solo publica hasta 2026; conviene revisar en diciembre o enero.
- Términos formales de reutilización o licencia de las predicciones del SHN. Solo consta el «Todos los Derechos Reservados» del pie de página. Recomendación: pedir permiso por escrito (mareas@hidro.gov.ar / shn@hidro.gov.ar).
- Que el plano de reducción de cada puerto coincida exactamente con LAT. El SHN afirma que adoptó LAT desde 2004 «para los puertos incluidos en esta publicación», pero las cabeceras solo dicen «plano de reducción que pasa X m debajo del nivel medio».
- Amplitudes medias de sicigia y cuadratura por puerto (posiblemente en las cartas náuticas).
- Correcciones válidas para Rada Tilly, Caleta Córdova, Punta Tombo, Playa Unión y Puerto Lobos: el SHN no las publica.
- Bahía Solano (Punta Novales) muestra «0 00» en las columnas de altura, con formato irregular. Puede tratarse de 0,00 m, pero no está confirmado.
- La vigencia del CSRFToken de puertos secundarios: en esta sesión parecía estático.
