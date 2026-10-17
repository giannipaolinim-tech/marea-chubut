# D — Especies de pesca de costa en Chubut: aparejos, carnadas, temporadas, nudos y devolución

Verificado: 2026-10-16. Alcance: solo las 11 especies de costa. Las especies de pesca embarcada (salmón, mero, turco, escrófalo, besugo, caballa) quedaron fuera.
Datos estructurados en `D_species.json`. Las citas son textuales y de menos de 25 palabras.

**Política de confianza aplicada**
- *cientifico*: fuente científica u oficial.
- *local*: 2 o más fuentes independientes que coinciden.
- *unica*: una sola fuente.
- argentinaxplora, pezcalandia, interpatagonia y welcomeargentina publican el mismo texto, así que cuentan como **una** fuente (AX).
- Cada ficha de Proyecto Arrecife (PA) cuenta como una fuente.

## Fuentes principales
| id | Fuente | URL |
|---|---|---|
| d-pa-* | Proyecto Arrecife (CENPAT-CONICET), fichas de robalo, cazon, gatopardo, gatuzo, pez-gallo, bacota, pez-angel y palometa | https://www.proyectoarrecife.com.ar/es/pez/<slug> |
| d-ax | argentinaxplora (cluster de copias) | https://argentinaxplora.com/destinos/chubut/chpesmar.htm |
| d-wk-rocas | Weekend, J. Pollero, "Inolvidable jornada de tiburones en Rocas Coloradas" (28-01-2020) | https://weekend.perfil.com/noticias/pesca/inolvidable-jornada-tiburones-rocas-coloradas-chubut-robalos-pez-gallo-gatopardos.phtml |
| d-wk-bermeja | Weekend, G. Frontoni, "Róbalos entre mareas y restingas" (Punta Bermeja, Río Negro, Golfo San Matías) | https://weekend.perfil.com/noticias/pesca/robalos-entre-mareas-y-restingas.phtml |
| d-wk-fiestarobalo | Weekend, Fiesta Provincial del Róbalo, Comodoro (11-07-2024) | https://weekend.perfil.com/noticias/pesca/la-fiesta-provincial-del-robalo-se-celebro-en-un-entorno-natural-increible-de-comodoro-rivadavia.phtml |
| d-pescaarg | pescaargentina.com.ar, róbalo | https://www.pescaargentina.com.ar/contenidos/especies-argentinas/robalo/ |
| d-rawson | Municipalidad de Rawson, Los Palos | https://rawson-chubut.com.ar/turismo/lugar/659bfdf7fa42a90198b59983 |
| d-dj-* | Diario Jornada: Fiesta del Pejerrey 2024, Fiesta del Róbalo 2023, 20 Horas 2026, gatopardo 2026 | ver JSON |
| d-isra-engano | ISRA factsheet Engaño Bay (IUCN SSC) | https://sharkrayareas.org/wp-content/uploads/isra-factsheets/5SouthAmericanAtlantic/Engano-Bay-5SouthAmericanAtlantic.pdf |
| d-fb-* / d-naturalis | FishBase y Naturalis (identificación) | ver JSON |
| d-inidep-pba | Tríptico INIDEP + Dir. Prov. Pesca Bs. As. (2020), buenas prácticas con tiburones | http://www.maa.gba.gov.ar/pesca1/images/tripticotiburon2020.pdf |
| d-inidep-2022 | SAGyP/INIDEP (2022), buenas prácticas de devolución de condrictios | https://www.magyp.gob.ar/sitio/areas/pesca_maritima/plan/PAN-TIBURONES/_complementarios//221228_Buenas%20pr%C3%A1cticas%20de%20pesca%20y%20devoluci%C3%B3n%20de%20peces%20cartilaginosos,%20capturados%20por%20la%20flota%20comercial%20argentina%20(2022).pdf |
| d-wcs-2022 | WCS Argentina, talleres de devolución con anzuelos circulares | ver JSON |

## Hallazgo clave nuevo: Rocas Coloradas (Weekend, 2020)
Es la nota chubutense con más datos de equipo. Permite pasar a **local** varias recetas que antes tenían una sola fuente, porque coincide con AX y con PA:
- **Pez gallo y cazón:** cañas de 3,90–4,20 m; nylon de 0,30 mm o multifilamento de 0,20 mm.
- **Tiburones:** nylon de 0,50–0,60 mm y leaders de acero.
- **Róbalo:** caña de 2,70–3 m, nylon de 0,25 mm y líneas de tres anzuelos con almejas.
- **Plomos:** de 100 a 240 g.
- **Distancia de lance:** pez gallo a 50–70 m, róbalo a 5–10 m.
- **Marea:** el pique de pez gallo empezó "con la creciente".
- Cita: el róbalo "no se clava solito".

## Por especie (resumen; el detalle y las fuentes están en el JSON)

### Róbalo (*Eleginops maclovinus*)
- **Modalidad:** costa, *local* (Rocas Coloradas, AX, Fiesta del Róbalo en Comodoro y en Playa Unión).
- **Aparejo:**
  - Puntera de 3 anzuelos (*local*: AX + Rocas Coloradas).
  - Nylon de 0,20–0,30 mm (*local*).
  - Caña de ~2,70 m (*local*).
  - Anzuelos N.º 8–14 "cormorán" (*unica*, AX). Punta Bermeja usa N.º 1 y 2: no coinciden.
  - Plomo de 40–50 g sin destrabe (*unica*, Punta Bermeja).
- **Carnadas** (por orden de mención):
  1. Langostino/camarón (*local*). AX: "convenientemente preparados con aceite de caballa".
  2. Almeja (*local*: PA almeja púrpura, Golfo San Matías + Rocas Coloradas "almejas sureñas").
  3. Lombriz colorada (*unica*).
- **Marea:** inicio de la bajante (*unica*, Río Negro). Cita: "con la marea todavía alta, pero comenzando a bajar".
- **Horario:** de día en invierno (*unica*, AX).
- **Temporada en toda la costa:** de abril a mediados de noviembre (AX). pescaargentina indica de junio a septiembre. No hay pico declarado.

### Pejerrey (*Odontesthes* spp.)
- **Fuente:** solo AX (*unica*).
- **Aparejo:** caña de 2,70 m, nylon de 0,20–0,30 mm, 3 anzuelos N.º 8–14 cormorán.
- **Carnadas:** langostino y camarón con aceite de caballa.
- **Horario:** de día.
- **Temporada:** de abril a mediados de noviembre.
- **Spot:** Bajo de los Huesos, 47.ª Fiesta del Pejerrey, 15-09-2024.
- **Identificación:** no hay fuente que asigne especie a los pejerreyes de concurso chubutenses. FishBase:
  - *O. argentinensis*: hasta 42,1 cm, llega al sur hasta los ~42°S.
  - *O. smitti*: hasta 26,2 cm LE, citado para el Golfo San Matías.

### Cazón (*Galeorhinus galeus*)
- **Modalidad:** costa, *cientifico*. ISRA: adultos y juveniles "commonly captured by recreational anglers" en Engaño, de septiembre a abril.
- **Aparejo:**
  - Brazolada de acero (*local*: PA "líneas preparadas con brazaloadas de acero" + Rocas Coloradas).
  - Caña de ~4 m (*local*).
  - Nylon de 0,30 mm (*local*).
- **Carnadas:** PA, "carnadas aceitosas como el magru o la lisa son las más efectivas". AX: langostino, calamarete y anchoa.
- **Horario:** de noche; la luna llena desfavorece (*unica*, PA).
- **Identificación (FishBase):** hocico largo y puntiagudo, dientes en forma de cuchilla, 2.ª dorsal ≈ anal, gris y blanco.

### Gatuzo (*Mustelus schmitti*)
- **Modalidad:** costa (Rocas Coloradas; ISRA Engaño).
- **Carnadas y técnica:** solo de PA, con autor bonaerense: crustáceos y tiras de pejerrey, de noche, equipo liviano.
- **Identificación (Naturalis):** "grey above, light below, often with numerous white spots", con espacio internasal muy estrecho.

### Pez gallo (*Callorhinchus callorynchus*), la especie mejor documentada
Fuente principal: PA, sección Pesca de M. Rojas y N. Bovcon.
- **Aparejo:**
  - Caña de 3,5–4,2 m (*local*).
  - Nylon de 0,28–0,35 mm (*local*) con chicote cónico de 10 m.
  - Plomo de hasta 250 g (*local*).
  - Puntera de 1–3 anzuelos sin tándem (*local*).
  - Anzuelos Mustad 1.0–3.0 (*unica*; AX dice 18/20).
- **Carnadas:** langostino es el n.º 1 (*local*). PA: "mejores resultados con langostino o langostino combinado con anchoíta".
- **Marea:** en movimiento. PA: "Cuando la marea esta estática... la actividad de los peces es nula". Coincide con Rocas Coloradas (*local*).
- **Distancia:** 50–70 m (*unica*).
- **Temporada en Chubut:** apareamiento costero de octubre a febrero; desde marzo, los adultos van a aguas profundas (*cientifico*).

### Gatopardo (*Notorynchus cepedianus*), PROTEGIDO
- Se captura con frecuencia desde la playa en Chubut (DJ 2026).
- **Devolución:** anzuelos circulares, quitar el anzuelo con cuidado y reportar las marcas.
- PA: "las herramientas caseras para sacar anzuelos son fundamentales".
- **Temporada al sur:** verano.

### Bacota (*Carcharhinus brachyurus*)
- **Sin fuente de captura desde costa en Chubut.** Candidata a eliminar.
- PA (E. Redondo) solo cubre Bahía Blanca y playas rionegrinas del Golfo San Matías. Distribución "hasta aproximadamente la desembocadura del Rio Chubut".
- Su ranking de carnadas, "en orden de éxito", es: lisa, saraca, magrú, pescadilla, corvina.

### Pez ángel (*Squatina guggenheim*)
- **Modalidad:** solo por ISRA Engaño (pesca deportiva/recreativa combinada con arrastre).
- **Técnica:** referencia bonaerense, carnada fresca cualquiera.

### Rayas (*Sympterygia bonapartii*, *Discopyge tschudii*)
- **Modalidad:** costa, *local* (AX, Rocas Coloradas, Rawson).
- **Aparejo y carnadas:** solo AX: caña de 4 m acción 6/7, nylon de 0,30 mm, 3 anzuelos 18/20, carnadas langostino, calamarete y anchoa.

### Chucho (*Myliobatis* spp.)
- Pieza mayor de 5,020 kg en las 20 Horas de Los Palos (febrero de 2026). La pesca de costa es inferida: la nota no lo dice.
- Sin datos de equipo ni de carnada.

### Palometa (*Parona signata*)
- **Modalidad:** Municipalidad de Rawson, Los Palos (*unica*).
- **Técnica (PA, no chubutense):** brazoladas de 1 m o más; tirita de pejerrey "fresco y con escamas"; cucharas.
- **Identificación (FishBase):** "A black patch on the opercle is a conspicuous character".

## Nudos
**Ninguna fuente chubutense de pesca de costa consultada nombra nudos.** Las fichas de PA, Weekend, AX y Jornada no los mencionan. PA pez gallo solo habla de anzuelos "atados a los rotores del chicote".

Dejé candidatos de Commons para nudos genéricos, sin atribuirles una recomendación local:

| Nudo | Página Commons | Autor | Licencia |
|---|---|---|---|
| Palomar | https://commons.wikimedia.org/wiki/File:PalomarKnotSequence.jpg | Vaughan Pratt | CC BY-SA 3.0 |
| Palomar (alt.) | https://commons.wikimedia.org/wiki/File:Barb07.Palomarknoten.jpg | Der Barbar | CC BY 4.0 |
| Clinch | https://commons.wikimedia.org/wiki/File:Barb._01_Clinchknoten.jpg | Der Barbar | CC BY-SA 4.0 |
| Dropper loop (brazolada) | https://commons.wikimedia.org/wiki/File:Dropper_loop_knot.jpg | TheHungryTiger | Dominio público |
| Dropper loop (alt.) | https://commons.wikimedia.org/wiki/File:Blood_loop_dropper_knot_form_loop.jpg | Zaripov999 | CC BY-SA 4.0 |
| Uni knot | https://commons.wikimedia.org/wiki/File:Uni_knot.jpg | Snapper G | CC BY-SA 3.0 |

## Guía de devolución de tiburones y rayas (fuentes argentinas)
1. **Liberar de inmediato, sin agotar al animal y con el mínimo tiempo fuera del agua** (INIDEP/PBA). Cita: "Evitar retirarlo del agua o cansarlo en exceso."
2. **No tocar las branquias ni levantarlo por las hendiduras** (INIDEP/PBA; INIDEP 2022, "Las lesiones en la región branquial pueden ser letales").
3. **No levantarlo de la cola cabeza abajo ni usar bichero** (INIDEP 2022). En Buenos Aires el bichero está prohibido con tiburones.
4. **Quitar el anzuelo o cortar la línea lo más cerca posible de la boca** (INIDEP/PBA). PA cazón: "pinzas largas y fuertes alicates".
5. **Usar anzuelos circulares** (DJ/Patagonia Azul; WCS) **con la rebaba rebajada** (INIDEP/PBA).
6. **Poner una boya tope a 25 cm del anzuelo en líneas de fondo, para que no lo trague** (INIDEP/PBA).
7. **Tener guantes, pinzas y tenaza** (INIDEP/PBA).
8. **Para ejemplares de menos de 1,5 m: sujetar de la cola y de una aleta pectoral o la dorsal, horizontal; soltarlo, no arrojarlo** (INIDEP 2022, guía para flota adaptada).
9. **Para calmarlo, cubrirle la cabeza con un trapo mojado; nunca golpearlo** (INIDEP 2022).
10. **Cuidado con las espinas.** La chuza del chucho es "aserrada" y ponzoñosa; la espina dorsal del pez gallo también hiere (INIDEP 2022; PA).
11. **"¡Foto rápida y al agua!"** (PA cazón).
12. **Si tiene marca: anotar número, fecha, hora y playa, sacar foto, liberar y reportar** (DJ/Patagonia Azul; INIDEP 2022).
13. **Gatopardo: la ley provincial exige devolverlo vivo** (DJ 2026).

## No encontrado / advertencias
- No hay nudos en las fuentes chubutenses.
- Bacota sin captura desde costa en Chubut.
- Chucho sin datos técnicos.
- Para gatuzo, pez ángel y palometa, la técnica solo tiene fuentes bonaerenses.
- PA no tiene fichas de pejerrey, rayas ni chucho.
- La ficha de róbalo de PA trata del Golfo San Matías.
- **Discrepancias de anzuelos:** róbalo 8–14 (AX) vs 1–2 (Punta Bermeja); pez gallo Mustad 1.0–3.0 (PA) vs 18/20 (AX).
- **Pez gallo, conflicto de temporada:** pesqa.ar dice de abril a septiembre (portal genérico, sin fuentes, excluido). PA/ISRA dicen octubre a abril en la costa de Chubut.
- El Patagónico 2007 y argentinaturismo solo listan especies de Playa Unión, sin técnica.
- Revista Aire Libre, Superdepor y ADNSUR: no se hallaron notas útiles.
- No se encontró el texto del manual de marcado de tiburones (ResearchGate 403).
