# /temp — 50 artículos SEO para Homara

Carpeta de trabajo para los 50 artículos en markdown puro que apuntan a las keywords ganadoras de Google Search Console:

- Comparativa de precios de muebles en España (51 imp)
- Comparación de precios de muebles (39 imp)
- Comparador de electrodomésticos (7 imp)
- Genéricos: compara tiendas, compara mejor precio, etc.

## Estructura

- `PLAN.md` — Mapa de los 50 artículos: título, slug, tipo, cluster, keyword, fecha.
- `pillars/` — 5 artículos pillar (cabezas SEO estacionales).
- `clusters/` — 45 artículos satélite agrupados por cluster temático.

## Convenciones

- **Idioma:** español (España).
- **Tono:** editorial, cercano, experto. Ver `homara-brain/01-Empresa/Tono-y-voz.md`.
- **Longitud:** 2.500–3.500 palabras por artículo (pillars al alto del rango).
- **Productos:** marcas y modelos reales (Amazon ES, Awin). Verificación con WebSearch antes de redactar.
- **Enlaces afiliados:** placeholders `{{OFFER:slug-producto}}`. Reemplazo posterior por `/api/redirect?offerId=<uuid>` (hard rule #1 del CLAUDE.md).
- **Interlinking:** bloque "Artículos relacionados" al final con 3-5 slugs sugeridos (existentes o pendientes).
- **CTAs:** principal al producto (vía placeholder) + secundaria a `/comparador` o `/categoria/<slug>`.
- **FAQ:** 5-8 preguntas frecuentes al final + bloque JSON-LD listo (FAQPage + Article + BreadcrumbList).
- **Imágenes:** no incluidas en .md (se añaden en fase TSX).
- **Sin frontmatter YAML.** Markdown puro.

## Fase actual

1. ✅ Recopilación de requisitos.
2. 🟡 Plan de los 50 → aprobación del usuario.
3. ⏳ Redacción pillars.
4. ⏳ Redacción satélites en tandas.
5. ⏳ QA final.
