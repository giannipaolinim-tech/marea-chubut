# Marea Chubut

App web para la pesca de costa en la costa atlántica de Chubut, de Puerto Lobos al límite con Santa Cruz. Incluye las mareas oficiales del SHN, spots, especies, normativa, seguridad y una bitácora personal. **Cada dato lleva su fuente**, y lo que no se pudo verificar no aparece.

## En línea

Versión publicada: https://giannipaolinim-tech.github.io/marea-chubut/ (se actualiza sola en cada `push` a `main`).

> Las predicciones de marea se reproducen de las Tablas de Marea del Servicio de Hidrografía Naval (SHN). El permiso de redistribución está pendiente.

## Usarla

```bash
python -m http.server 8765 --directory web
```

Abrí http://localhost:8765. Para usarla en la playa, publicá la carpeta `web/` en un hosting estático (GitHub Pages, Netlify), abrila una vez con señal y agregala a la pantalla de inicio: queda funcionando sin conexión.

## Documentos

| Documento | Contenido |
|---|---|
| [research/INFORME_INVESTIGACION.md](research/INFORME_INVESTIGACION.md) | Entregable 1: dataset, fuentes y datos excluidos (anexos en `research/raw/`) |
| [design/ENTREGABLE_2_DISENO.md](design/ENTREGABLE_2_DISENO.md) | Entregable 2: arquitectura de información y diseño |
| [MANTENIMIENTO.md](MANTENIMIENTO.md) | Entregable 4: actualizar las mareas cada año, la normativa y los datos |

## Datos

Todos los datos son JSON auditables en `web/data/`, y cada dato apunta a una fuente de `sources.json`. Después de cualquier cambio, corré:

```bash
python tools/validate_data.py
```

```bash
python tools/build_precache.py
```

## Créditos

- **Mareas:** Servicio de Hidrografía Naval (SHN).
- **Viento y oleaje:** Open-Meteo (CC BY 4.0), modelo no oficial.
- **Sol y luna:** SunCalc (BSD-2).
- **Mapa:** Leaflet (BSD-2). Costa de Natural Earth (dominio público). Coordenadas de referencia de © colaboradores de OpenStreetMap (ODbL) y Wikipedia.
- **Imágenes:** Wikimedia Commons, con autor y licencia en cada ficha.
- **Tipografías:** Fraunces e Inter (SIL OFL).
