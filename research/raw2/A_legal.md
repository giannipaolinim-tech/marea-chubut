# A — Investigación legal y de seguridad (costa de Chubut)

Verificado al 2026-10-16. Las fuentes son oficiales salvo que se indique otra cosa. Los PDFs descargados están en `research/raw2/legal_files/`. La versión para máquina está en `A_legal.json`.

---

## 1. ANP Rocas Coloradas: Ley XI Nº 72 (2020), modificada por la Ley XI Nº 81 (2024)

- **Creación:** Ley XI Nº 72, sancionada el 26/11/2020, Decreto 1301/20, publicada en el BO del 04/01/2021.
  - Categoría V, «Paisaje Terrestre y Marino Protegido».
  - El Plan de Manejo debía hacerse en un año.
  - BO: https://boletin.chubut.gov.ar/archivos/boletines/Enero%2004%2C%202021.pdf
- **Texto original del art. 2:** límites por coordenadas, con la isobata de 80 m al este y la RN3 al oeste. El texto tenía errores de signo.
- **Límites vigentes:** la **Ley XI Nº 81** (sancionada el 06/06/2024, Dto. 789/24, BO 03/07/2024) reemplazó el art. 2 por la «Tabla 1 y mapa» del Anexo I. También **aprobó el Plan de Manejo 2023** como Anexo II.
  - BO: https://boletin.chubut.gov.ar/archivos/boletines/Julio%2003%2C%202024.pdf
  - Anexo, escaneado de 287 págs.: https://boletin.chubut.gov.ar/archivos/boletines/ANEXO%20Ley%20XI%20N%C2%B0%2081.pdf
- **Tabla 1 (WGS84), leída del escaneo del Anexo I:**

| V | Lat | Lon | Segmento |
|---|---|---|---|
| 1 | -45,2999 | -67,31546 | s1 1-2 |
| 2 | -45,29798 | -67,22314 | s2 2-3 |
| 3 | -45,33591 | -67,15713 | s3 3-4 |
| 4 | -45,3962 | -67,1049 | s4 4-5 |
| 5 | -45,47003 | -66,93276 | **s5: isobata de 80 metros** (5-6) |
| 6 | -45,68425 | -67,19839 | s6 6-7 |
| 7 | -45,61388 | -67,3331 | s7 7-8 |
| 8 | -45,46191 | -67,52976 | **s8: ruta nacional 3** (8-1) |

- **Pesca, según el Plan de Manejo (Anexo II):**
  - En la Zona de Uso Restringido Continental, una franja costera de 9,5 km desde la línea de baja marea, de punta a punta del ANP, se permite «pesca deportiva de costa modalidad con caña».
  - La pesca deportiva «se realizará en las playas a las cuales se pueda acceder por caminos habilitados». No se puede llegar a esas playas con vehículos motorizados.
  - La modalidad, las especies, el cupo, las tallas y las temporadas se van a reglamentar más adelante.
- **Restricciones generales (cap. 7):** se prohíbe la «pesca artesanal o deportiva de costa o embarcada fuera de las modalidades, los sectores y los periodos habilitados». También están prohibidos:
  - la pesca industrial;
  - las embarcaciones sin motor (kayaks, botes) y las motos de agua;
  - los vehículos en playas e intermareal;
  - pernoctar o hacer fuego fuera de los sectores habilitados.

  Además, toda actividad que no esté en la zonificación queda prohibida.
- **Zona Intangible El Islote** (232 ha, Plan pág. 155): ahí no se puede pescar. Es un polígono de 7 vértices entre -45,609 y -45,625 de latitud y -67,267 y -67,296 de longitud.
  - Los vértices están **leídos a ojo de un escaneo de baja calidad**: hay que verificarlos con el original (ver JSON).
- **Efecto sobre los spots:**
  - **Caleta Córdova y Faro San Jorge: FUERA**, porque quedan al sur del vértice 6, a -45,684.
  - **Bahía Solano: EN EL LÍMITE.** El vértice 7 (-45,61388; -67,3331) toca la costa justo ahí y el segmento 6-7 cruza la bahía. Además, la Zona Intangible El Islote está pegada al este de la bahía.

## 2. Parque Provincial Patagonia Azul: Ley XI Nº 90

- **Publicación:** BO del 20/05/2025, págs. 11-12; Dto. 454/25.
  - https://boletin.chubut.gov.ar/archivos/boletines/Mayo%2020,%202025.pdf
  - Superficie: 295.135 ha.
- **Art. 2, parte marina:** va de la costa sobre el paralelo -44,9 a los vértices V1 (-44,9; -65,3), V2 (-45,2; -65,3), V3 (-45,2; -66,28333), V4 (-45,31388; -66,28333) y V5 (-45,31388; -66,71666). De ahí sigue al norte por el meridiano -66,716667 hasta la costa. Incluye las islas.
  - En el BO faltan signos en V1, V2 y V5; los normalicé.
- **Parte terrestre:** una franja de 1.500 m, más las parcelas 13b (Cabo Dos Bahías), 12e y 19g (San Miguel).
- **Categorías:** la zona marina y esas parcelas son Categoría II; el resto de la franja es Categoría V.
- **Anexos A y B (mapas):** figuran como «(Ver anexos)», pero **no están publicados** en el PDF del BO.
- **Pesca:** la ley **no dice nada sobre la pesca recreativa**. El art. 6 manda a hacer el Plan de Manejo en un año.
  - Hubo talleres participativos en abril y mayo de 2026 (Red43, El Diario Web), pero **no encontré un Plan aprobado** al 16/10/2026.
  - Tampoco encontré un comunicado oficial sobre pesca recreativa dentro del parque.
  - El 21/09/2026 se ratificó (Dto. 1461/26, BO 29/09/2026) un convenio con Camarones sobre Cabo Dos Bahías, sin reglas de pesca.
- **Camarones:** el pueblo queda al norte del paralelo 44,9, o sea fuera. Cabo Dos Bahías está dentro.

## 3. PIMCPA: Tratado de 2007 (OD 1086/2008)

Fuente: https://www4.hcdn.gob.ar/dependencias/dcomisiones/periodo-126/126-1086.pdf

- **Límites (cláusula SEGUNDA):**
  - **a) Franja marina:** va desde el paralelo **44° 54' S** hasta **1 milla náutica** de la línea de más alta marea, siguiendo la costa hacia el sur hasta el meridiano **66° 43' O**.
  - **Área marina adicional:** entre 45° 06' S y 1 mn de la costa, 45° 06' S / 66° 00' O, y 66° 00' O y 1 mn de la costa.
  - **Islas:** incluye las islas, con Leones y Arce, y 1 mn alrededor de cada una.
  - **b) Parte terrestre:** una franja de **1.500 m** desde la línea de más alta marea, entre 44° 54' S y 66° 43' O.
- **Reparto de la gestión:** la franja de 1 mn y las islas quedan a cargo de la APN; el resto queda a cargo de la Provincia.
- **Reglamento de usos:** según la cláusula NOVENA, la Comisión de Manejo debía dictar en un año el reglamento de usos permitidos y prohibidos. **No encontré un reglamento de la APN** de pesca recreativa.
- **Polígono:** no tiene vértices cerrados porque depende de la línea de costa.

## 4. Otros límites con coordenadas

| Área | Instrumento | ¿Coordenadas? |
|---|---|---|
| **AMP Punta Tombo** | Ley XI Nº 65 (BO 24/12/2015) | Textual: «43° 47’S como límite norte, 44° 09’S como límite sur», la línea de baja marea al oeste y 3 millas marinas al este. Categoría VI. |
| **ANP Punta Tombo (ampliada)** | Ley XI Nº 88 (BO 28/03/2025) | **Sí: 31 vértices WGS84** (ver JSON). Cierra por la línea de baja marea. Categoría II. |
| **ANP Punta Marqués (ampliada)** | Ley XI Nº 95 (BO 11/06/2025), 3.727 ha | **Sí: puntos f, g, h, i, j, a, b, c, d, e.** Por ejemplo, f (-45,91779; -67,54673), g (-45,91779; -67,51675), h (-46; -67,51675) e i (-46; -67,59569). Algunos tramos siguen la costa, la RN3 o caminos. |
| **Plan de Manejo Punta Marqués** | Ley XI Nº 100 (BO 02/06/2026) | Su Anexo A **no está publicado** en el BO. No pude verificar las reglas de pesca. |
| **El Doradillo** | Municipal, 2001; plan de manejo por Ord. 5028 | Límites textuales sin coordenadas: «franja costera de 25 km de longitud desde Punta Arco hasta Cerro Prismático», 7.500 ha. «La pesca de costa está permitida» (turismo.madryn.gob.ar). |
| **Península Valdés** | Ley XI Nº 20 (ex 4722), art. 2 | Textual: meridiano 64° 51' 30", RP2 y RP1 hasta el **paralelo 42° 41' 25" (Punta Arco)**, la recta Punta Arco–Punta Cormoranes y una franja marina de 3 mn. |
| **Punta Loma / Punta León** | — | NO ENCONTRADO. |

**Importante sobre Punta Marqués y Rada Tilly:** el límite de la ampliación sigue la línea de más alta marea entre Falsa Punta y el punto f, que está «al norte de la Playa de Rada Tilly». Por eso **el agua frente a toda la playa de Rada Tilly queda dentro del ANP**.

## 5. Elefante marino: Ley XI Nº 92 (BO 20/05/2025, págs. 12-13)

- **Art. 4 c):** el plan de manejo que haga la autoridad tiene que incluir «una franja de exclusión de 50 metros de «no aproximación»» alrededor de los ejemplares en la costa, fuera de las ANP.
- **¿Rige directamente?** Según la letra de la ley, es un **contenido mínimo obligatorio del plan** y no una prohibición que se aplique sola. No encontré el plan aprobado.
- **Faltas:** son graves, con multas de 1.000 a 10.000 módulos (art. 5).

## 6. Rada Tilly: Ordenanza Nº 2557/21

Sancionada el 08/04/2021 y publicada en el Boletín Oficial Municipal de abril de 2021.
- BO municipal: http://radatilly.gob.ar/wp-content/uploads/2021/07/ABRIL-2021.pdf
- PDF de la ordenanza: http://radatilly.gob.ar/wp-content/uploads/2021/04/ORD-2557-21.pdf

**Qué establece:**
- **Art. 10:** del 15/12 al 15/03, la pesca deportiva se permite entre las bajadas 2 y 28 de 20 a 11 h. Desde la bajada 28 al norte está prohibida.
  - La nota municipal del 11/04/2021 agrega que entre esas bajadas se puede pescar «durante todo el año».
- **Art. 8:** no se puede acampar ni hacer fogatas en la playa.
- **Art. 9:** no se puede circular con vehículos motorizados por la playa.
- **Art. 16, sanciones:** apercibimiento la primera vez y después de 5.000 a 20.000 módulos. Si es falta grave, de 20.000 a 40.000 módulos.

**Cambios posteriores:** solo encontré las Ord. 2772/24 y 2843/25, que exceptúan a la Secretaría de Cultura del art. 8. No hay cambios en la regla de pesca.

## 7. Teléfonos de emergencia

- **106: emergencias náuticas de Prefectura**, gratis y las 24 h (https://www.argentina.gob.ar/tema/emergencias).
- **Prefectura Puerto Madryn:** (0280) 4451603 / 4454200. Fuentes: el listado de Sanidad de la PNA de 2024 y Weekend 2019, que coinciden.
- **Prefectura Comodoro Rivadavia:** (0297) 4464018 / 4473863. Sale del listado de Sanidad de la PNA, así que puede no ser la guardia operativa.
- **Prefectura Rawson y Camarones:** NO ENCONTRADOS en fuentes oficiales.
- **Ley XIX Nº 77 (2017):** fija 911 (sistema coordinado), 100 Bomberos, 101 Policía, **103 Defensa Civil** y 107 Emergencia médica.
  - **No encontré confirmación oficial de que el 911 funcione hoy** en las ciudades costeras.

## 8. Marea roja (https://marearoja.chubut.gov.ar/), última publicación del 16/10/2026

**Vedas activas:**
1. **Zona norte del Golfo San Jorge, desde el 16/10/2026** (Circular 001/26 SP). Incluye Caleta Córdova, Km 3, Rada Tilly y Playa Belvedere. Se detectaron más de 400 UR de TPM.
2. **Golfo Nuevo, desde el 05/08/2026** (Res. 296/2026-SP y Circular 04/26). Sigue hasta que una resolución expresa la levante.

**Vedas levantadas en 2026:**
- Golfo San José: Disp. 004/26, del 06/02.
- Puerto Lobos: Res. 73/26, del 09/03.
- Bahía Camarones: Res. 98/26, del 10/04.
- Golfo Nuevo: Res. 117/26, del 29/04. Esta veda volvió el 05/08.

## 9. Cómo soltar tiburones y rayas

En Chubut el gatopardo es Monumento Natural y está prohibida su captura (Ley XI Nº 93), así que siempre hay que soltarlo. Los pasos y sus fuentes están en el JSON (`releaseGuide`). Salen de:
- el tríptico de buenas prácticas de PBA/INIDEP: un solo anzuelo, anzuelos curvos, boya tope a 25 cm, anzuelo sin rebaba, poco tiempo fuera del agua, no tocar las branquias, cortar la línea cerca de la boca;
- la guía del PAN-Tiburón/INIDEP de 2022: no colgarlo de la cola, no usar ganchos, mantenerlo húmedo, manipularlo entre dos si mide más de 1,5 m, cuidado con la chuza de los chuchos.

No encontré una guía oficial específica de Chubut.

## 10. Península Valdés: zonas de pesca de costa del Plan de Manejo

Fuente: el Plan de Manejo de Península Valdés, que es una «zonificación preliminar».

- **Pesca deportiva de costa:** «Restringir la actividad a la cercanía de El Riacho y Larralde», todo el año. El plan no da distancias, coordenadas ni mapa.
- **Uso sostenible restringido:** la «zona costera comprendida entre la línea de baja marea promedio y los 500 metros hacia el continente, desde Punta Ameghino hasta Punta Arco» permite «pesca con cerco de costa y pesca deportiva de costa» todo el año (pág. 103).
  - Este tramo está en la costa oeste y norte del Golfo Nuevo, hacia El Doradillo, y no en la costa sur.
- **Única coordenada legal:** el paralelo de Punta Arco, 42° 41' 25" S, que fija la Ley XI Nº 20.

## NO ENCONTRADO (resumen)

- Anexos de la Ley XI Nº 90 y de la Ley XI Nº 100.
- Plan de Manejo de Patagonia Azul.
- Reglamento de la APN para el PIMCPA.
- Ordenanza de creación de El Doradillo y coordenadas oficiales de Punta Arco y Cerro Prismático.
- Límites de Punta Loma y Punta León.
- Teléfonos de Prefectura en Rawson y Camarones.
- Confirmación oficial de que el 911 funciona hoy.
- Plan de manejo del elefante marino.
- Guía de liberación de tiburones específica de Chubut.

Lo que busqué en cada caso está en el JSON, en `notFound`.
