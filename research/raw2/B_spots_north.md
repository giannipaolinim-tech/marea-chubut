# B — Spots de pesca de costa: norte y centro de Chubut (Puerto Lobos → Isla Escondida)

- Investigación: 2026-10-16/17. Datos estructurados en `B_spots_north.json` (60 fuentes, 17 spots, 11 descartes).
- Coordenadas: Overpass API (OSM, © OpenStreetMap contributors, ODbL). La distancia a la costa se calculó contra `natural=coastline` de OSM. Para Rawson se usaron **coordenadas oficiales** que vienen incrustadas en las fichas "Pesca Deportiva" de rawson-chubut.com.ar (Municipalidad de Rawson; los datos salen de apiadmin.rawson.gov.ar).
- Confianza, según la política: existencia/ubicación/legalidad/peligros = `oficial` o `local` (≥2 fuentes independientes); tips prácticos con una sola fuente = `unica`.
- Las citas son extractos breves (<25 palabras) devueltos por las herramientas de lectura.

## Hallazgos clave

1. **Las fichas municipales de Rawson traen coordenadas oficiales**: El Sombrerito (-43.2484987, -64.9639549), Los Palos (-43.3006643, -65.0258157), Magagna (-43.3835343, -65.0453231) y Bajo Los Huesos (-43.173899, -64.8164385). Todas quedan a menos de 105 m de la costa OSM. **El Sombrerito ya tiene coordenadas.** Las de Bajo Los Huesos caen ~7 km al NE del nodo OSM "Bajo de Los Huesos".
2. **Plan de Manejo de Península Valdés** (zonificación preliminar; PDF leído completo en las secciones de zonificación):
   - Pesca deportiva de costa: «Restringir la actividad a la cercanía de El Riacho y Larralde. Temporada: Todo el año.»
   - Tramo de 500 m desde Punta Ameghino hasta Punta Arco: «Turismo y recreación, pesca con cerco de costa y pesca deportiva de costa», todo el año. **Ojo:** ese tramo es El Doradillo, en la costa *norte* del Golfo Nuevo. No es la costa sur entre Madryn y Punta Ninfas.
   - Tramo Villarino–Bengoa: «Solamente permitir la pesca artesanal con cerco de costa» → **sin pesca deportiva** en Villarino ni en Bengoa.
   - Fuente: https://peninsulavaldes.org.ar/wp-content/uploads/2023/09/Plan-de-Manejo-Peninsula-Valdes-optimizado.pdf
3. **Playa Garipe** queda ~3,5 km **al este** de Punta Ameghino (OSM), o sea fuera del tramo Ameghino–Arco del plan PV. Sí queda dentro del ANP El Doradillo (Punta Arco–Cerro Prismático), donde el municipio permite la pesca de costa. Es una discrepancia normativa a señalar.
4. **Corte por marea, explícito y con fuente oficial**:
   - Escollera sur de Rawson: queda aislada con la **pleamar** (Prefectura, 2018).
   - Playa Canto: **la creciente** corta el regreso por la playa (Bomberos, 2025).

---

## Spots existentes

### puerto-lobos
- **Coords:** OSM way 197982100 `highway=unclassified`, extremo del camino en el paraje: -42.005159, -65.071824 (~140 m de la costa). https://www.openstreetmap.org/way/197982100. El nodo `place=locality` 198413924 está a 240 m de la costa.
- **Pesca:**
  - «muy frecuentada por pescadores» — https://www.minube.com/rincon/puerto-lobos-a176121
  - «a very good fishing spot: silverside and whiting to be fished with nets» — https://www.patagonia-argentina.com/en/discovering-puerto-lobos/
- **Acceso:** «un desvío de 20 kilómetros de ripio hacia el Atlántico» (minube).
- **Servicios:** ninguno. «ni siquiera hay agua potable» (minube) y «do not forget water» (patagonia-argentina). Las dos fuentes coinciden → local.
- **Peligro, con una sola fuente** (no entra al JSON como peligro): «keep count of the time so as not to get caught when the tide changes» (patagonia-argentina, zona rocosa).
- **Legal:** sin norma chubutense específica (el ANP Puerto Lobos es de Río Negro).

### el-doradillo
- **Coords:** OSM way 629466042 `amenity=parking`, estacionamiento de Playa Las Canteras: -42.640055, -64.963582 (~60 m de la costa). Está junto al node 5695276077 `leisure=beach_resort` "Playa Cantera".
- **Legal:** «La pesca de costa está permitida.» y «Desde junio a diciembre no está permitido ingresar al agua ni realizar actividades náuticas. (Ley nº 4722)» — https://turismo.madryn.gob.ar/anp-el-doradillo/. Lo respalda además el plan PV (tramo Ameghino–Arco).
- **Acceso:** RP 42; «La velocidad máxima en rutas de ripio es de 60 km/h»; «la ruta de ingreso suele transformarse en intransitable» con lluvia intensa. Vehículos prohibidos en playa y médanos (Ord. 4268/07) — https://www.madryn.gob.ar/recomendaciones-quienes-visiten-doradillo/
- **Estacionamiento:** «Estacione en zonas permitidas». Hay 11 accesos públicos.
- **Peligros:** sin guardavidas; emergencias 103.
- **Servicios:** «No posee servicios.» Fogones solo en Manara, 2º Doradillo, Bañuls y Casino. Hay baños químicos y guardaparques.
- **Sin dato:** especies por mes, fondo y marea propios del sitio.

### playa-garipe
- **Coords:** OSM node 7761856529 `leisure=beach_resort` "Playa Garipe": -42.603885, -64.829520 (~20 m de la costa). Estacionamiento en way 630765551.
- **Existencia:** «las tradicionales 5 horas del pejerrey que se desarrollaron en Playa Garipe en Puerto Madryn» — https://weekend.perfil.com/noticias/pesca/el-sur-vibro-con-otro-electrizante-torneo-a-puro-pejerrey.phtml. También figura en Aire Libre (concursos del Club El Golfo).
- **Especie por mes (fuente única):** pejerrey en mayo (concurso del 11/05/2025). «La única especie válida es el pejerrey.»
- **Técnica (fuente única, Weekend):** cañas de 2,60–3 m, nylon 0,14 mm, anzuelo Sode N° 5, plomos de 10–15 g, camarón teñido.
- **Legal:** ver Hallazgo 3.

### muelle-piedrabuena
- **Coords:** raíz del muelle en la costanera, -42.763272, -65.034290. Es el punto más al oeste del OSM way 26633906, miembro de relation 17253196 `man_made=pier` "Muelle Luis Piedrabuena". El cabezal está en -42.7622, -65.0217.
- **Legal:** «actualmente utilizados para la pesca deportiva con cañas y como paseo turístico peatonal» — https://appm.com.ar/muelle-piedra-buena. Se reabrió a pescadores en 2020 (El Chubut).
- **Sin dato:** especies por mes, horarios, restricciones en días de crucero.

### playa-parana
- **Coords:** OSM node 8435432428 `leisure=beach_resort` "Playa Paraná": -42.795706, -64.943944 (~30 m de la costa). La playa es la relation 17250520 `natural=beach` "Playa La Paraná".
- **Especies:**
  - Pejerrey en marzo y mayo (dos fuentes de concursos, El Chubut 11/05/2026 y Diario Jornada 20/03/2025).
  - Cornalito en marzo (fuente única: DJ).

### punta-ninfas
- **Coords:** fin de la RP 5, OSM way 25930091 (`fine_gravel`): -42.978693, -64.309118. Está junto al faro, ~115 m del borde del acantilado.
- **Existencia:** «Algunas playas destacadas para pescar: Punta Ninfas…» — https://www.uepp.com.ar/puerto-rawson/. También la nombra la ficha municipal de Rawson.
- **Acceso (local, 2 fuentes):**
  - «la carretera es de ripio y si llueve se convierte en un barrizal» — https://www.nuncasinviaje.com/puerto-madryn-punta-loma-y-punta-ninfas/
  - «el camino puede volverte intransitable con lluvia» — https://www.amarelviaje.com/punta-ninfas/que-hacer-en-punta-ninfas-guia-completa
- **Combustible (local):** «No hay estaciones en el trayecto» (amarel) y «Ir con el depósito de combustible lleno» (nuncasinviaje).
- **Fuente única:**
  - «En Punta Ninfas no hay red móvil».
  - La bajada a la playa tarda 1–2 h ida y vuelta: «consultar si está habilitada según temporada y marea».
  - Hay que mantenerse a ≥15 m de los elefantes marinos.

### bajo-los-huesos
- **Coords:** coordenada oficial de la ficha municipal, -43.173899, -64.8164385 (~80 m de la costa). Alternativa OSM: fin del camino way 366300634 junto al nodo de localidad, -43.205246, -64.889528.
- **Legal:** «sector habilitado para Pesca Deportiva Marítima» — https://rawson-chubut.com.ar/turismo/lugar/65957faa8168d900f5c67966
- **Marea (oficial):** «por el nivel de las mareas permite la pesca en todo momento».
- **Meses (oficial):**
  - Septiembre–octubre: «pejerreyes y cazones de 10/15 kilos».
  - Desde octubre: «peces gallo o elefante, chuchos, pescadillas y palometas».
  - Pejerrey también en agosto (Fiesta del Pejerrey 2026, Superdepor) y septiembre (Club de Trelew, 15/09/2024, DJ): fuente única cada uno.
- **Acceso (fuente única, DJ 14/03/2026):** «la lluvia del miércoles por la noche que dejó los caminos complicados en toda la costa, puntualmente hacia Bajo los Huesos». https://diariojornada.com.ar/412760/deportes/casi_60_parejas_participan_de_las_12_horas_al_peso
- **Regla de concurso, no veda:** «La excepción de pesca será el róbalo, que deberá ser devuelto» (12 Horas 2026).

### playa-canto
- **Coords: null.** No hay ficha municipal con coordenadas ni objeto OSM.
- **Ubicación:** «Playa Canto se encuentra en la zona de Punta León, al norte de Playa Unión» y «cerca de Bajo de los Huesos» — https://radiochubut.com/bomberos-de-rawson-rescataron-a-pescadores-aislados-por-la-marea-en-playa-canto/
- **Corte por marea (oficial, Bomberos):** «quedaron atrapados debido a la subida de la marea, que impidió su regreso por la playa». Además: «este tipo de rescates son habituales en la zona». Fase: creciente.
- **Acceso (fuente única):** el rescate usó 4x4 y cuatriciclo 4x4.

### playa-union (Los Palos)
- **Coords:** coordenada oficial de la ficha municipal "Los Palos", -43.3006643, -65.0258157 (~20 m de la costa). Alternativa OSM: node 5930495685 `tourism=attraction` "Sector de Pesca" (-43.293307, -65.019504).
- **Legal y existencia:** «Sector de Pesca de costa» — https://www.rawsonchubut.com.ar/ciudad/nuestras-playas. En octubre de 2025 el club impulsaba una ordenanza para declararlo «Zona de Pesca» (DJ, https://diariojornada.com.ar/405214/magazine/llevaran_la_luz_y_arreglaran_los_fogones_en_los_palos); no se verificó si se aprobó.
- **Especies (oficial):** «Róbalo, Pejerrey, Raya, Cazón, Gallo, Palometa y Palo.»
- **Mes:** róbalo en agosto (Fiesta del Róbalo, 17/08/2025; 2 notas de Superdepor).
- **Servicios (fuente única):** fogones en reconstrucción; se gestiona reponer el alumbrado (oct-2025).

### escollera-rawson
- **Coords:** extremo hacia el mar del OSM way 479969420 `man_made=breakwater`: -43.342977, -65.047646. Está junto al node 1922225461 (faro).
- **Corte por marea (oficial, Prefectura vía DJ):** personas aisladas por la pleamar en la «escollera sur del canal de acceso al Puerto local», 16/03/2018. https://www.diariojornada.com.ar/208303/policiales/rawson_rescatan_a_pescadores_atrapados_por_la_pleamar
- **Especies (fuente única):** «probando suerte desde el espigón o en la playa Magagna» (róbalo, mero) — https://www.welcomeargentina.com/rawson/puerto-pescador.html

### playa-magagna
- **Coords:** coordenada oficial de la ficha municipal "Magagna", -43.3835343, -65.0453231. Coincide con el fin del OSM way 624251856 "Acceso a Playa Magagna" (`unpaved`).
- **Existencia:** «Playa virgen con dunas y acantilados, perfecta para la pesca» (municipio).
- **Fuente única** (no entra al JSON como peligro): derrumbes costeros en la zona Cangrejales (Cholila Online, 2019).

### playa-santa-isabel
- **Coords:** OSM node 8915033656 `natural=beach`: -43.418093, -65.076076 (~45 m de la costa).
- **Fondo (oficial):** «Extensa playa de arena fina, ideal para la pesca».
- **Acceso:** RP A26, ripio (según OSM).

### el-sombrerito
- **Coords (nuevo): oficial**, -43.2484987, -64.9639549 (~45 m de la costa). A ~50 m termina en la costa la huella OSM way 608431177.
- **Fondo (oficial):** «Pequeña playa de arena y canto rodado, ideal para la pesca».
- **Ubicación relativa:** DJ (2026) sitúa El Colectivo de Playa Unión «más cerca de El Sombrerito», es decir, al norte de Playa Unión.

### punta-delfin
- **Coords: null.** El único objeto OSM es el cabo (node 8915033657 `natural=cape`, -43.539563, -65.194507, a 62 m de la costa). No es un punto de acceso. La huella más cercana (way 1553537495) termina ~1,5 km al SO y no se puede asegurar que corresponda.
- **Existencia:** UEPP + municipio.

### isla-escondida
- **Coords:** OSM node 5402530921 `tourism=attraction` "Isla Escondida": -43.679409, -65.339169 (~25 m de la costa).
- **Existencia:** «uno de los paraísos de los pescadores» — https://www.elchubut.com.ar/chubut/2022-10-4-20-31-0-de-nuevo-turistas-molestan-a-la-fauna-en-la-isla-escondida. También UEPP y el municipio.
- **Acceso (fuente única):** «por la Ruta N° 1, camino de ripio».
- **Peligro (local, El Chubut + Argentina Wild Expeditions):** elefantes marinos en época reproductiva. Un guía citado en la nota: «gente pescando entre medio de los harenes».
- **Legal:** no es ANP: «no cuenta con guardafaunas».

---

## Spots nuevos

### el-riacho (new)
- **Coords:** fin de la huella OSM way 675321332: -42.426180, -64.615379 (~190 m de la costa). Está junto al node 5615094290 "Riacho San José". Wikipedia da 42°25′30″S 64°37′00″O.
- **Legal y existencia:** plan PV (ver Hallazgo 2). Es un paraje de mariscadores: «pequeño villorrio permanente integrado por mariscadores» — https://es.wikipedia.org/wiki/Riacho_San_Jos%C3%A9
- **Acceso (fuente única, Wikipedia):** RN 3 + RP 2 (asfalto) 40 km, luego ~6 km de ripio.
- **Fondo (oficial):** marismas (el plan las declara ambiente restringido).
- **Advertencia:** no hay relatos de pesca deportiva en el sitio. La existencia se apoya solo en la zonificación oficial, que es preliminar.

### playa-larralde (new)
- **Coords:** fin del OSM way 134975452 (`unclassified`, `ground`): -42.413595, -64.318534 (~40 m de la costa). Está junto al node 1525171239 "Playa Larralde".
- **Existencia:** «un pequeño asentamiento de pescadores artesanales», a 24 km de Puerto Pirámides — https://diariojornada.com.ar/411681/magazine/inseguridad_en_larralde_filman_a_un_caballo_robapanes. Base legal: plan PV.
- **Fuente única (ADNSUR):**
  - «La temporada de cornalitos y pejerrey es desde febrero hasta abril aproximadamente» (pesca artesanal).
  - «no hay agua potable, ni gas, ni electricidad».
  - Acceso: desvío de tierra desde la RP 2. https://www.adnsur.com.ar/turismo/la-vida-en-playa-larralde--un-refugio-para-pescadores-y-aventureros-en-la-patagonia_a67c0898cbb0699c0abe43772
- **Sin señal (local, 2 fuentes):** «En el Golfo San José no hay señal telefónica» (ADNSUR) y «inexistencia de señal telefónica» (La Nación).
- La pesca con caña que cuenta La Nación (máx. 6 cañas, piezas >3,5 kg) es parte de una salida **embarcada**. No se usó para costa.

## Descartados (detalle en el JSON)
- **Villarino y Bengoa:** el plan PV allí permite solo pesca artesanal con cerco.
- **Punta Gales:** asentamiento artesanal, no nombrado para pesca deportiva.
- **Cerro Avanzado:** sigue con una sola fuente (Ohlalá 2017).
- **Punta Cuevas:** sin fuentes de pesca (solo buceo e historia).
- **Playa Kaiser y Punta Arco:** solo existen como objetos OSM.
- **Golfo San Matías chubutense (salvo Puerto Lobos):** sin fuentes.
- **Las Canteras de Rawson:** está en la lista municipal pero sin ubicación.
- **Playa Elola:** queda en Camarones, fuera de esta zona.
- **Muelle Storni:** pesca deportiva no documentada.

## Pendiente o sin dato
- Casi no hay fuentes sobre **distancia de lance, mejor fase de marea y fondo** por spot (salvo Bajo Los Huesos, Santa Isabel y El Sombrerito). Los textos de clubes y prensa no lo detallan. Se dejó en null.
- No se verificó la "última carga de combustible" de ningún sitio, salvo Punta Ninfas («no hay estaciones en el trayecto»).
