# C — Spots de pesca de costa: sur de Chubut (Punta Tombo → límite con Santa Cruz)

Verificado: 2026-10-16. JSON asociado: `C_spots_south.json`.
Confianza: **oficial** (municipio, Prefectura o circular citada), **local** (2 o más fuentes independientes), **única** (una sola fuente chubutense; solo para tips prácticos).
Coordenadas: elementos OSM consultados por Overpass, o coordenadas publicadas en fichas oficiales de Comodoro Turismo. La distancia a la costa está calculada contra `natural=coastline` de OSM (todas quedan a menos de 300 m).

> **Vigente desde el 16/10/2026:** veda por marea roja. La Secretaría de Pesca del Chubut (Circular N° 001/26 SP) prohíbe extraer bivalvos y caracoles en Caleta Córdova, Km 3, Rada Tilly y Playa Belvedere. No afecta a la pesca de peces, pero **no podés juntar almeja ni mejillón para carnada**. Fuente: Diario Crónica, "suspensión de la extracción de especies de moluscos bivalvos y gasterópodos (caracoles)", https://www.diariocronica.com.ar/noticias/2026/10/16/172580-decretan-veda-total-por-marea-roja-en-la-zona-norte-del-golfo-san-jorge

---

## 1. Rada Tilly (spot existente `rada-tilly`)

- **Coordenadas:** -45.936826, -67.55697. Es el nodo OSM 12580308222, `leisure=beach_resort`, name=Rada Tilly, a unos 16 m de la costa. https://www.openstreetmap.org/node/12580308222
- **Bajadas 2 y 28: no hay coordenadas.** No figuran en OSM ni en las páginas municipales. En OSM solo están:
  - "Bajada 1" (way 551268462, -45.94495, -67.55573), en el extremo sur.
  - La bajada náutica (`leisure=slipway`, nodo 1513033929, -45.91550, -67.54396), en el extremo norte.
  - Esto confirma que la numeración crece hacia el norte, hasta la zona náutica.
- **Legal (oficial):** ordenanza de zonificación (Municipalidad de Rada Tilly, 11/04/2021), https://radatilly.gob.ar/rada-tilly-se-aprobo-ordenanza-para-zonificacion-de-la-playa/
  - "queda autorizada entre las bajadas 2 y 28 durante todo el año"
  - Del 15/12 al 15/03 solo "desde las 20hs hasta las 11hs".
  - "la actividad de pesca se encuentra prohibida desde la bajada 28 hacia el norte"
  - Los guardavidas pueden restringir actividades según el clima, la afluencia y las mareas.
- **Guardavidas (local):** temporada 2025-26 "desde la Bajada 2 hasta la Bajada 28", con 8 bases y una Base Central en la Bajada 15, hasta el 15/03. https://www.diariocronica.com.ar/noticias/2025/12/17/130113-playas-seguras-rada-tilly-activo-su-temporada-de-guardavidas-2025-2026
- **Estacionamiento:**
  - OSM tiene 29 playas de estacionamiento sobre la costanera (ways 551265549 a 551265577).
  - En temporada rige el estacionamiento medido (SEM); el tráiler está en la Bajada 10 (Crónica, fuente única).
- **Peligro y corte de marea (oficial, por cita de un funcionario):** en Los Pozones, cerca de la Falsa Punta Marqués, "Cuando sube la marea hay que salir de los lugares porque es algo que queda cubierto" (referente de Turismo, ADNSUR 04/12/2025). https://www.adnsur.com.ar/turismo/-los-pozones---el-tesoro-natural-que-aparece-cuando-baja-la-marea-en-rada-tilly_a693202b49e5fcd8362455007
  - Crónica 2025 agrega advertencias en las restingas y patrullaje en el sector de los pozones.
  - Fase: **creciente**.
- **Fondo y especies (única):** Weekend (25/01/2019) nombra róbalo y pez gallo en Rada Tilly, sin meses.
  - Róbalo donde "el fondo de arena se mezcla con pedregales chatos".
  - https://weekend.perfil.com/noticias/pesca/12-especies-a-tiro-de-cana.phtml
- **Servicios (OSM, única):** Camping Municipal (way 496391696) y estación YPF (nodo 2136562446).
- **Sin datos:** mejor marea y distancia de lance.

## 2. Comodoro: Km 3, Km 4 y Km 5 (`comodoro-km`)

- **Coordenadas OSM** (nodos `leisure=beach_resort`):
  - Km 3: -45.844545, -67.468994 (nodo 12580308220, a ~7 m de la costa).
  - Km 4: -45.822717, -67.457868 (nodo 12580308219).
  - Km 5: -45.816904, -67.450529 (nodo 12580308218).
- **Existencia como pesquero (local):**
  - ADNSUR 2019: Km 3 "apta para actividad balnearia y pesca"; en Km 4 y Km 5 se practica "la pesca y la recolección de moluscos". https://www.adnsur.com.ar/sociedad/que-playas-se-pueden-conocer-en-comodoro-rivadavia_a5c93c99ca6177961e2d01efa
  - Weekend 2020: "se permite en las playas de Kilómetro 3, 4 y 5". https://weekend.perfil.com/noticias/pesca/playas-y-muelles-de-la-costa-cuales-estan-abiertos-y-que-se-pesca.phtml
  - Cholila 2020: el municipio había habilitado salidas recreativas. https://cholilaonline.ar/2020/05/el-municipio-evalua-retrotraer-la-autorizacion-a-pescadores-por-la-masiva-concurrencia-a-las-playas-de-comodoro.html
- **Fondo (única, ADNSUR 2019):**
  - Km 3: canto rodado.
  - Km 4: acantilados y canto rodado.
  - Km 5: arena y grava con arcillas.
- **Especies (única):** pejerrey en **mayo** de 2022, "con rindes buenos entre el km 3 y el 5" (Weekend 13/05/2022). https://weekend.perfil.com/noticias/el-pique/explosion-de-pejerreyes-en-todo-el-pais.phtml
- **Calidad del agua:** no apta para baño (muestreo 2019).
- **Servicios:**
  - Km 3 tiene baños, kiosco y guardavidas en temporada (2019).
  - Rampa del Club Náutico Km 3 (OSM).
  - YPF en Km 5 (OSM, nodo 272178283).

## 3. Caleta Córdova (`caleta-cordova`)

- **Coordenadas (oficial):** -45.749151, -67.376803, de la ficha de Comodoro Turismo (a ~7 m de la costa). https://comodoroturismo.gob.ar/lista/playa-caleta-cordova/
  - El muelle no tiene nombre en OSM. Hay 4 elementos `man_made=pier`; el más largo es el way 953101670.
- **Existencia y muelle (oficial):**
  - Comodoro Turismo: "tardes de pesca desde el muelle".
  - Municipio (04/05/2025): la actividad se hizo "en el Muelle de Caleta Córdova". https://www.comodoro.gov.ar/2025/05/04/adolescentes-de-la-esquina-vivieron-una-jornada-de-pesca-en-caleta-cordova/
  - El Comodorense (2022): "suelen sacar peces, tanto con caña de pescar, como con red".
- **Peligro y corte de marea (oficial):** en febrero de 2021, Prefectura rescató a 9 personas aisladas en una isla cercana al Faro San Jorge "debido a la creciente de la marea". Fase: **creciente**. https://www.argentina.gob.ar/node/242657
- **Especies (única):** gallos y róbalos en **mayo** de 2022 (Weekend 13/05/2022).
- **Fondo (única):** "playa amplia de canto rodado" con aguas calmas (Comodoro Turismo).
- **Servicios (oficial + local):** gastronomía de mar y Feria de Maricultores los fines de semana.

## 4. Bahía Solano (`bahia-solano`)

- **Coordenadas:** -45.633335, -67.353595. Es el nodo OSM 12140881216, `leisure=fishing`, name=El Pique, a ~67 m de la costa.
  - El Club Social Pesca y Náutica El Pique organiza las 10 Horas en Bahía Solano.
  - OSM tiene otros tres puntos `leisure=fishing` sin nombre en esa costa.
- **Existencia (local):**
  - 10 Horas de Pesca Variada: "la costanera de la zona norte en Bahía Solano" (Crónica 02/02/2026). https://www.diariocronica.com.ar/noticias/2026/02/02/132633-preparan-las-10-horas-de-pesca-variada-en-bahia-solano
  - Fiesta Provincial del Róbalo (Weekend 2024).
  - Jornada en el "Refugio Vasco Gonnard en Playa Bahía Solano" (El Comodorense 2022).
  - 5 Horas / Provincial del Pejerrey en el Refugio Pascual Fenolle (Crónica 21/05/2026).
- **Legal:** sin prohibición documentada.
  - Según OSM, el sector norte de la bahía (hacia el Pico Salamanca, cerca de -45.60) **está dentro del ANP Rocas Coloradas** (relation 13767809, Ley 102/20).
  - El punto El Pique queda fuera.
  - No se encontró reglamento de pesca del ANP.
- **Especies por mes (única):**
  - Pejerrey en **febrero** (Weekend 20/02/2020): de 18 a 25 cm, con línea de fondo y almeja, camarón o magrú. "El tiro es corto, apenitas en la rompiente". https://weekend.perfil.com/noticias/pesca/chubut.phtml
  - Pejerrey en **mayo** (concurso del 17/05/2026: 561 piezas una pareja).
  - Róbalo en **julio** (Fiesta del 07/07/2024: "Cerca del mediodía, fueron dándose los piques").
- **Carnada (única):** la inscripción a la Fiesta del Róbalo 2025 se hacía en El Nuevo Coyote, Pescadería Océano, Carnadas del Sur y De Paso Cañazo.

## 5. NUEVO: Playa Barrancas Blancas (`barrancas-blancas`)

- **Coordenadas (oficial):** -45.69775, -67.362861 (Comodoro Turismo). Coinciden con el way OSM 286685315 `natural=beach`. https://comodoroturismo.gob.ar/lista/playa-barrancas-blancas/
- **Existencia (oficial):**
  - Comodoro Turismo: "la tradicional Fiesta de los Pescadores".
  - Municipio: concurso de pesca "de 15:00 a 18:00 horas en la playa de Barrancas Blancas" (2020); "5 kilómetros al norte de Caleta Córdova". https://www.comodoro.gov.ar/2020/02/20/el-municipio-invita-a-disfrutar-de-barrancas-blancas-con-actividades-para-toda-la-familia-en-la-tradicional-fiesta-del-pescador/
  - Guía de ADNSUR (26/10/2025), que es la segunda fuente pedida.
- **Legal:** sin restricción. Según OSM, queda fuera del ANP Rocas Coloradas.
- **Acceso (local):** asfalto hasta Caleta Córdova y luego ripio por la RP1, "transitable con precaución" (ADNSUR). En 2020 el municipio reparó los caminos y las bajadas.
- **Datos de ADNSUR (única):**
  - Fondo: canto rodado y arena; restingas en bajamar.
  - Pejerrey y róbalo todo el año; "De septiembre a marzo se pueden pescar también cazones, pez gallo, chucho, raya y gato pardo".
  - Sin baños, almacenes, combustible ni señal.
- **Peligro (FUENTE ÚNICA, no cumple el criterio estricto; se deja marcado):** en las barrancas de arcilla, "cuando sube la marea no queda costa transitable en ese sector". https://www.adnsur.com.ar/turismo/barrancas-blancas--una-guia-para-descubrir-la-playa-virgen-y-solitaria-de-comodoro-rivadavia-_a68fa0ea2a812b1da0f3f9462
- **Oficial:** "No cuenta con guardavidas ni servicios."

## 6. Camarones (`camarones`)

- **Coordenadas:** -44.870876, -65.711491. Es el nodo OSM 5982120199, `place=locality`, name=Playa Honda, a ~22 m de la costa; es un topónimo, no un acceso señalizado.
  - **Playa Thompson** (sede principal, al norte del pueblo) **no está en OSM**: no tiene coordenadas.
  - Caleta Carolina figura en OSM como `place=locality` (-44.9054, -65.6066).
- **Existencia (local):**
  - Jornada (01/04/2023): "de 10 a 14, en la Playa Thompson, con opción de Playa Honda". https://diariojornada.com.ar/344590/magazine/se_viene_la_fiesta_nacional_del_salmon_
  - WelcomeArgentina menciona Playa Honda.
  - Weekend 2022 menciona Playa Thompson.
  - El Chubut (2026): el concurso de costa es "organizada por la Peña local 'La Bahía'" y la Fiesta fue del 3 al 5 de abril de 2026.
- **Especies y técnica (única):** róbalo en **julio** de 2022, "colocando el aparejo un poco más allá de la rompiente". Thompson y Caleta Carolina tienen "buena profundidad cerca de la costa". https://weekend.perfil.com/noticias/el-pique/donde-esta-el-pique-en-vacaciones.phtml
- **Combustible (local, con conflicto):**
  - EconoJournal (12/10/2022): la estación de Camarones pasa a la red PetroChubut. https://econojournal.com.ar/?p=60841
  - OSM tiene `amenity=fuel` PetroChubut (nodo 4795088515).
  - Río Negro (2024) dice en cambio que la más cercana está en Garayalde (83 km). Hay que confirmarlo.
- **Servicios (local):** hospedajes, cabañas y camping municipal (OSM way 633731439).

## 7. Cabo Raso (`cabo-raso`)

- **Coordenadas:** -44.3467395, -65.2262403. Es el nodo OSM 5981692726, `amenity=parking`, a ~75 m de la costa.
  - Camping "El Cabo": nodo 5973534926.
- **Existencia (local):** "varias opciones de pesca" (Río Negro, febrero de 2024), más el relato de Perceptive Travel. No se nombran especies ni puntos.
- **Peligro (local):** "playas solitarias de gran oleaje" (Río Negro, agosto de 2024).
- **Servicios (local):** camping con fogones y baños secos, parador y proveeduría. "No hay internet ni teléfono".
- **Sin datos:** fondo, marea, especies y combustible.

---

## Descartados o sin verificar (detalle en el JSON, campo `rejected`)

- **Bahía Janssen, Bahía Cruz y Punta Clara:** ninguna fuente de pesca. En OSM solo hay cabos en ese tramo.
- **Caleta Carolina:** una sola fuente de pesca. Está al sur de 44°54' S, así que probablemente queda **dentro del PIMCPA y de Patagonia Azul (legalidad sin confirmar)**.
- **Playa Elola, El Pescadero, Caleta Sara y Chuequito:** solo aparecen en listados turísticos.
- **Playa Elena y Punta Tafor:** sin resultados.
- **Bahía Bustamante / Arroyo Marea:** una sola fuente (Canal26); **dentro de Patagonia Azul (legalidad sin confirmar)**.
- **Puerto Visser:** una sola fuente (ADNSUR 2023, tiburón, acceso 4x4); en el límite de Rocas Coloradas.
- **Costanera, Km 8, Restinga Alí y Punta Borja:** sin dos fuentes de pesca. En Restinga Alí, además, el agua no es apta.
- **Belvedere / Bajada de los Palitos:** una sola fuente de pesca; linda con el ANP Punta Marqués, ampliada en 2025.
- **Punta del Marqués:** es un ANP, excluida por instrucción.
- **La Herradura:** country privado.
- **Playa Bonita / Los Límites:** la coordenada oficial (-46.000095) cae justo sobre el paralelo 46° S (unos 10 m del lado de Santa Cruz). La pesca tiene una sola fuente.
- **Ramón Santos:** es el puesto policial, del lado de Chubut; no hay datos de pesca.
- **Playa Ancina/Acina:** está en Santa Cruz.

## Pendientes

- Texto legal del Parque Provincial Patagonia Azul. No se encontró.
- Coordenadas de las bajadas 2 y 28 de Rada Tilly y de Playa Thompson.
- Mejor fase de marea y distancia de lance: ninguna fuente las da, salvo el "tiro corto" para pejerrey en Bahía Solano y "más allá de la rompiente" para róbalo en Camarones.
