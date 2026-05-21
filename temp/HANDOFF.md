# HANDOFF — Corpus de 50 artículos SEO Homara

> **Para:** otro agente / sesión que retoma el trabajo.
> **Última actualización:** 2026-05-21 — **CORPUS COMPLETADO (50/50).**
> **Working dir:** `/Users/martiwarda/Projects/homara/homara-web/temp/`.

## ✅ Estado final (2026-05-21)

**50 de 50 artículos completados.** QA pasado:

- 5 pillars + 8 A + 8 B + 11 C + 11 D + 7 E = **50 archivos .md**.
- 0 archivos con frontmatter YAML (regla #1).
- 0 archivos con URLs afiliadas crudas (amzn.to / amazon.es/dp / amazon.es/gp / awin1).
- 50/50 con bloque JSON-LD (Article + FAQPage + BreadcrumbList; ItemList añadido en rankings).
- 50/50 con sección "Preguntas frecuentes".
- Los 9 artículos pendientes (D10 rehecho + D11 + E1–E7) se escribieron el 2026-05-21.
- 16 artículos preexistentes (A2, A3, A4, A5, C8, C9, C10, C11, D1, D2, D3, D4, D6, D7, D8, D9) tenían frontmatter YAML al inicio y se limpiaron en el QA final.

**Próximos pasos (fase TSX/Supabase):** crear los `Offer` UUID en Supabase y un mapeo `slug → UUID` para sustituir los `{{OFFER:slug-producto}}` en producción. Los `{{OFFER:}}` están en los rankings/comparativas con producto: D10 (10), D11 (10), E3 (8), E5 (3) y los 41 artículos previos. Las guías/comparativas de servicios (E1, E2, E4, E6, E7) no llevan `{{OFFER:}}` por diseño.

## Contexto en 30 segundos

Homara (https://homara.es) es un comparador de precios de hogar en España (modelo: contenido SEO + comparador + afiliación Amazon/Awin; **NO es tienda**). Se está produciendo un corpus de **50 artículos SEO** en markdown puro para atacar las keywords ganadoras de Google Search Console (comparativa precios muebles España, comparador electrodomésticos, comparador precios genérico).

Toda la estrategia, distribución, anti-duplicación y plantillas están en **`PLAN.md`** (en esta misma carpeta). **Léelo antes de empezar.** El contexto editorial vive en `homara-brain/` (vault Obsidian hermano de homara-web).

## Estado actual

**41 de 50 artículos completados.** Pendientes: 9.

| Bloque | Estado | Total | OK | Pendiente |
|---|---|---|---|---|
| Pillars | ✅ Terminado | 5 | 5 | — |
| Cluster A · Muebles terraza/jardín | ✅ Terminado | 8 | 8 | — |
| Cluster B · Electro verano | ✅ Terminado | 8 | 8 | — |
| Cluster C · Muebles general | ✅ Terminado | 11 | 11 | — |
| Cluster D · Electro general | 🟡 En curso | 11 | 9 | **D10 (rehacer), D11** |
| Cluster E · Comparador genérico | 🔴 Sin empezar | 7 | 0 | **E1, E2, E3, E4, E5, E6, E7** |

### D10 está corrupto y hay que rehacerlo

`clusters/D-electrodomesticos-general/D10-top-10-hornos-piroliticos-calidad-precio-2026.md` se guardó con **frontmatter YAML al inicio** (no debería tenerlo) y **sin el bloque JSON-LD final** (truncado por límite de tokens). Hay que regenerarlo desde cero.

## Reglas duras (NO NEGOCIABLES)

Estas reglas vienen del brain (`homara-brain/04-Contenido/Estilo-editorial.md`, `homara-brain/05-Producto/Reglas-de-cambio.md`, `homara-brain/06-Monetizacion/Proteccion-de-enlaces.md`) y aplican a TODO artículo nuevo:

1. **Markdown puro, SIN frontmatter YAML.** El artículo empieza directamente con `# Título H1`.
2. **JAMÁS URLs afiliadas crudas.** Todos los enlaces a producto usan el placeholder `{{OFFER:slug-producto-en-kebab-case}}`. Ejemplo: `[Ver oferta]({{OFFER:bosch-hba512br0-horno-multifuncion})`.
3. **NO hacer WebSearch.** Decisión explícita del usuario: consume demasiados tokens. Usa marcas/modelos estándar conocidos del mercado español (Cecotec, Bosch, Balay, Siemens, Roborock, Cosori, IKEA, Conforama, Maisons du Monde, Kave Home, etc.). Si dudas de un precio o spec, pon rango ("desde ~280€") o nota `(verificar antes de publicar)`.
4. **Una intención = una URL.** No duplicar ángulo con ningún slug que ya esté en `/temp/` o en `homara-web/src/app/blog/`.
5. **Anti-duplicación con blog existente.** Los 13 posts publicados (no tocar el ángulo): `mejores-sofas-calidad-precio-2026`, `mejores-frigorificos-combi-bajo-consumo-2026`, `mejores-freidoras-aire-amazon-2026-menos-100-euros`, `review-cosori-5-7l-freidora-aire-calidad-precio-menos-100-euros`, `mejores-ventiladores-de-pie-para-este-verano-2026`, `los-7-mejores-ventiladores-amazon-calor-verano-2026`, `mejores-piscinas-desmontables-baratas-amazon-2026`, `mejores-sombrillas-resistentes-amazon-2026`, `10-mesas-de-terraza-baratas-y-bonitas-en-amazon-2026`, `mejores-cafeteras-superautomaticas-amantes-del-cafe-2026`, `mejores-microondas-sin-plato-giratorio-2026`, `mejores-robots-de-cocina-baratos-alternativas-thermomix-2026`.

## Tono y voz (NO NEGOCIABLE)

- Editorial, cercano y experto. Como un amigo que entiende mucho de productos para casa.
- Frases CORTAS y directas. Evitar paja.
- Datos concretos siempre: medidas, materiales, vatios, garantía, dimensiones, capacidad.
- CERO superlativos vacíos ("el mejor del mundo", "imprescindible", "sin duda alguna").
- CERO frases tipo "En el mundo de hoy...", "Sumergidos en...", "En este artículo descubriremos...".
- CERO listas vacías de "pros" genéricas ("buena calidad", "buen precio", "moderno").
- Si suena a IA, reescribe.

## Estructura estándar por tipo

Cada `.md` empieza directamente con `# H1` (sin frontmatter), incluye `> lede` de 2-3 frases que menciona **mayo de 2026** una vez, y termina con un bloque ` ```json ... ``` ` con Article + FAQPage + BreadcrumbList (los rankings añaden ItemList).

### Comparativa (X vs Y)

```
# H1 con keyword
> Lede 2-3 frases.
## TL;DR (4-6 bullets)
## Diferencias clave (2-3 párrafos)
## Tabla comparativa (markdown table real)
## [Opción A] cuándo encaja (rango precio + 2-3 productos REALES con {{OFFER:slug}})
## [Opción B] cuándo encaja (rango precio + 2-3 productos REALES con {{OFFER:slug}})
## Análisis criterio por criterio (3-5 H3)
## Cuándo elegir cada uno (3-4 perfiles)
## Errores comunes (4-5)
## Preguntas frecuentes (5-7 Q&A)
## Artículos relacionados (4-6 slugs internos)
CTA final: "Más [categoría](/categoria/<slug>)"
## JSON-LD
```json``` Article + FAQPage + BreadcrumbList
```

### Guía (cómo elegir / cómo comparar)

```
# H1
> Lede 2-3 frases.
## TL;DR (4-6 bullets)
## Por qué [tema] (2-3 párrafos contexto)
## Los X factores que SÍ mueven el precio / la decisión (3-5 H3)
## Los X factores que confunden y no importan tanto (2-3 H3)
## Cómo comparar/elegir paso a paso (8-10 pasos numerados)
## Errores comunes (4-5)
## Productos donde aplicar la guía (3-5 reales con {{OFFER:slug}})
## Preguntas frecuentes (5-7 Q&A)
## Artículos relacionados
CTA final
## JSON-LD
```json``` Article + FAQPage + BreadcrumbList
```

### Ranking (Top 10 / Mejores X)

```
# H1
> Lede 2-3 frases.
## TL;DR (4-6 bullets con picks por perfil)
## Cómo hemos elegido estos 10 (criterios editoriales)
## Tabla resumen (# | producto | spec clave | precio aprox | mejor para)
## Los 10 [productos] al detalle (10 fichas con: specs reales, garantía, precio aprox, "para quién", pros 3-4, contras 2-3, mini-veredicto, CTA {{OFFER:slug}})
   - Reparto: 3-4 entrada, 4 gama media, 2-3 premium
## Recomendaciones por perfil (3-4)
## Errores comunes (4-5)
## Preguntas frecuentes (5-7 Q&A)
## Artículos relacionados
CTA final
## JSON-LD
```json``` Article + ItemList(10) + FAQPage + BreadcrumbList
```

## Trabajo pendiente — 9 artículos

### 🔴 D10 (REHACER) · Ranking · Cluster D

- **Slug:** `top-10-hornos-piroliticos-calidad-precio-2026`
- **Título H1:** Top 10 hornos pirolíticos calidad-precio 2026
- **Keyword:** mejor horno pirolítico
- **Ruta exacta:** `/Users/martiwarda/Projects/homara/homara-web/temp/clusters/D-electrodomesticos-general/D10-top-10-hornos-piroliticos-calidad-precio-2026.md`
- **Notas:**
  - El archivo actual tiene frontmatter YAML y está incompleto. **Sobrescribir desde cero.**
  - Marcas estándar: Balay 3HB5848B3, Bosch HBA533BS0, Siemens HB578A0S6, AEG BPK748180, Whirlpool W7 OS4 4S1, Teka HLB 860, Beko BBIE17300XCS.
  - Reparto: 3 entrada (<450€), 4 gama media (450-800€), 3 premium con vapor (>800€).
- **Slugs internos a enlazar:** `comparador-electrodomesticos-verano-aire-ventilacion-2026` (P2), `como-elegir-horno-tipos-prestaciones-precios-2026`, `placas-induccion-vs-vitroceramica-vs-gas-comparativa-precios-consumo`, `campanas-extractoras-decorativas-vs-telescopicas-comparativa-2026`, `lavavajillas-integrables-vs-libre-instalacion-comparativa-2026`, `frigorificos-americanos-vs-side-by-side-comparativa-precios-espacio`.
- **CTA final:** `Más [electrodomésticos de cocina](/categoria/cocina)`.

### 🔴 D11 · Ranking · Cluster D

- **Slug:** `mejores-aspiradores-robot-con-mopa-2026`
- **Título H1:** Mejores aspiradores robot con mopa 2026
- **Keyword:** mejor aspirador robot con mopa
- **Ruta exacta:** `/Users/martiwarda/Projects/homara/homara-web/temp/clusters/D-electrodomesticos-general/D11-mejores-aspiradores-robot-con-mopa-2026.md`
- **Marcas estándar:** Roborock S8 Pro Ultra / S7 MaxV / Q7 Max+, Cecotec Conga 11090 / 7090 / 8290, Xiaomi Robot Vacuum X10+ / Mi Robot S10, iRobot Roomba Combo j7+, Dreame L20 Ultra, Eufy X10 Pro Omni, Ecovacs Deebot T20 Omni.
- **Reparto:** 3 entrada (<300€), 4 gama media (300-700€), 3 premium con estación auto-vaciado y mopa lavable (>700€).
- **Slugs internos:** `comparador-electrodomesticos-verano-aire-ventilacion-2026` (P2), `como-comparar-aspirador-escoba-vs-robot-guia-2026`, `como-comparar-precios-pequeno-electrodomestico-2026`, `historico-precios-importancia-comprar-muebles-electrodomesticos-2026`, `como-comparar-precios-tiendas-online-espana-guia-completa-2026`, `comparativa-precios-muebles-terraza-jardin-espana-2026` (P1).
- **CTA final:** `Más [electrodomésticos para el hogar](/categoria/hogar)`.

### 🔴 E1 · Comparativa · Cluster E

- **Slug:** `comparadores-precios-espana-mejores-como-funcionan-2026`
- **Título H1:** Comparadores de precios en España: cuáles son los mejores y cómo funcionan
- **Keyword:** mejores comparadores de precios
- **Ruta exacta:** `/Users/martiwarda/Projects/homara/homara-web/temp/clusters/E-comparador-generico/E1-comparadores-precios-espana-mejores-como-funcionan-2026.md`
- **Cubre:** Idealo, Kelkoo, Google Shopping, Twenga, Shoptize, MiElectro, Camel/Keepa para Amazon. Diferencia comparador horizontal vs vertical. Cómo monetizan (afiliación). Cómo posicionar bien la propia ficha.
- **Slugs internos:** `mejores-tiendas-online-hogar-espana-comparativa-2026`, `como-comparar-precios-tiendas-online-espana-guia-completa-2026`, `historico-precios-importancia-comprar-muebles-electrodomesticos-2026`, `detectar-falsas-ofertas-black-friday-prime-day-rebajas-2026`, `top-10-comparadores-precios-hogar-espana-2026`, `amazon-prime-day-2026-hogar-comparar-precios-falsas-ofertas` (P4).
- **CTA final:** `Compara precios actuales en [el comparador de Homara](/comparador)`.

### 🔴 E2 · Comparativa · Cluster E

- **Slug:** `mejores-tiendas-online-hogar-espana-comparativa-2026`
- **Título H1:** Mejores tiendas online de hogar en España: comparativa de catálogo y precios 2026
- **Keyword:** mejores tiendas online hogar
- **Ruta exacta:** `/Users/martiwarda/Projects/homara/homara-web/temp/clusters/E-comparador-generico/E2-mejores-tiendas-online-hogar-espana-comparativa-2026.md`
- **Cubre:** Amazon ES, El Corte Inglés Hogar, Media Markt, PcComponentes, Carrefour, IKEA, Leroy Merlin, Conforama, Maisons du Monde, Worten, La Redoute. Comparar por catálogo (muebles, electro, decoración), envío, garantía, financiación, devolución, atención al cliente.
- **Slugs internos:** `comparadores-precios-espana-mejores-como-funcionan-2026`, `ikea-vs-leroy-merlin-vs-el-corte-ingles-comparativa-precios-hogar`, `ikea-vs-conforama-vs-maisons-du-monde-comparativa-precios-muebles`, `como-comparar-precios-tiendas-online-espana-guia-completa-2026`, `como-comparar-precios-muebles-online-espana-guia-2026`, `historico-precios-importancia-comprar-muebles-electrodomesticos-2026`.
- **CTA final:** `Más [productos para el hogar](/comparador)`.

### 🔴 E3 · Comparativa · Cluster E

- **Slug:** `ikea-vs-leroy-merlin-vs-el-corte-ingles-comparativa-precios-hogar`
- **Título H1:** IKEA vs Leroy Merlin vs El Corte Inglés: ¿dónde está más barato el hogar?
- **Keyword:** IKEA vs Leroy Merlin vs ECI
- **Ruta exacta:** `/Users/martiwarda/Projects/homara/homara-web/temp/clusters/E-comparador-generico/E3-ikea-vs-leroy-merlin-vs-el-corte-ingles-comparativa-precios-hogar.md`
- **Cubre:** Tres tiendas, comparativa por categoría (muebles, electro, iluminación, baño, cocina), modelo de negocio (autoservicio IKEA vs DIY Leroy vs servicio premium ECI), envío, garantía, financiación 0%, días de oro ECI vs rebajas, devolución.
- **Slugs internos:** `mejores-tiendas-online-hogar-espana-comparativa-2026`, `comparadores-precios-espana-mejores-como-funcionan-2026`, `ikea-vs-conforama-vs-maisons-du-monde-comparativa-precios-muebles`, `como-comparar-precios-tiendas-online-espana-guia-completa-2026`, `como-comparar-precios-muebles-online-espana-guia-2026`, `armarios-empotrados-vs-modulares-comparativa-precio-instalacion`.
- **CTA final:** `Más [muebles y hogar en nuestro comparador](/categoria/muebles)`.

### 🔴 E4 · Guía · Cluster E

- **Slug:** `como-comparar-precios-tiendas-online-espana-guia-completa-2026`
- **Título H1:** Cómo comparar precios de tiendas online en España: guía completa 2026
- **Keyword:** cómo comparar precios tiendas online
- **Ruta exacta:** `/Users/martiwarda/Projects/homara/homara-web/temp/clusters/E-comparador-generico/E4-como-comparar-precios-tiendas-online-espana-guia-completa-2026.md`
- **Cubre:** Método paso a paso (PVPR, precio 30 días, comparadores horizontales/verticales, histórico Keepa/Camel, alertas, costes ocultos envío y financiación), errores comunes, herramientas. Incluir guiño a Directiva Omnibus (RDL 7/2021).
- **Slugs internos:** `comparadores-precios-espana-mejores-como-funcionan-2026`, `mejores-tiendas-online-hogar-espana-comparativa-2026`, `historico-precios-importancia-comprar-muebles-electrodomesticos-2026`, `detectar-falsas-ofertas-black-friday-prime-day-rebajas-2026`, `como-comparar-precios-muebles-online-espana-guia-2026`, `top-10-comparadores-precios-hogar-espana-2026`.
- **CTA final:** `Compara precios en [el comparador de Homara](/comparador)`.

### 🔴 E5 · Guía · Cluster E

- **Slug:** `historico-precios-importancia-comprar-muebles-electrodomesticos-2026`
- **Título H1:** Histórico de precios: por qué importa antes de comprar muebles o electrodomésticos
- **Keyword:** histórico precios Amazon
- **Ruta exacta:** `/Users/martiwarda/Projects/homara/homara-web/temp/clusters/E-comparador-generico/E5-historico-precios-importancia-comprar-muebles-electrodomesticos-2026.md`
- **Cubre:** Qué es histórico (precio mínimo, medio, eventos típicos), herramientas (Keepa, CamelCamelCamel, Idealo, Pricerunner para España), cómo leer un gráfico, ejemplos por categoría (electrodoméstico grande baja antes de rebajas, sofá baja en agosto, etc.), por qué no fiarse del "precio antes" en marketing.
- **Slugs internos:** `detectar-falsas-ofertas-black-friday-prime-day-rebajas-2026`, `amazon-prime-day-2026-hogar-comparar-precios-falsas-ofertas` (P4), `black-friday-2026-muebles-electrodomesticos-comparativa-precios` (P5), `como-comparar-precios-tiendas-online-espana-guia-completa-2026`, `comparadores-precios-espana-mejores-como-funcionan-2026`, `como-comparar-precios-muebles-online-espana-guia-2026`.
- **CTA final:** `Sigue el histórico de precios en [el comparador de Homara](/comparador)`.

### 🔴 E6 · Guía · Cluster E

- **Slug:** `detectar-falsas-ofertas-black-friday-prime-day-rebajas-2026`
- **Título H1:** Cómo detectar falsas ofertas en Black Friday, Prime Day y rebajas
- **Keyword:** detectar falsas ofertas
- **Ruta exacta:** `/Users/martiwarda/Projects/homara/homara-web/temp/clusters/E-comparador-generico/E6-detectar-falsas-ofertas-black-friday-prime-day-rebajas-2026.md`
- **Cubre:** Las 5 trampas comunes (precio tachado inflado, oferta flash que era el precio normal, bundles caros, stock fantasma, garantía oculta), cómo usar Keepa, denuncias OCU, Directiva Omnibus (precio referencia debe ser el más bajo de los 30 días previos), lista de chequeo 5 min antes de comprar.
- **Slugs internos:** `historico-precios-importancia-comprar-muebles-electrodomesticos-2026`, `amazon-prime-day-2026-hogar-comparar-precios-falsas-ofertas` (P4), `black-friday-2026-muebles-electrodomesticos-comparativa-precios` (P5), `rebajas-verano-2026-muebles-electrodomesticos-comparativa-precios` (P3), `como-comparar-precios-tiendas-online-espana-guia-completa-2026`, `comparadores-precios-espana-mejores-como-funcionan-2026`.
- **CTA final:** `Comprueba precios reales en [el comparador de Homara](/comparador)`.

### 🔴 E7 · Ranking · Cluster E

- **Slug:** `top-10-comparadores-precios-hogar-espana-2026`
- **Título H1:** Top 10 comparadores de precios de hogar en España 2026
- **Keyword:** mejores comparadores hogar
- **Ruta exacta:** `/Users/martiwarda/Projects/homara/homara-web/temp/clusters/E-comparador-generico/E7-top-10-comparadores-precios-hogar-espana-2026.md`
- **Cubre:** Top 10 comparadores (mix de horizontales y verticales): Idealo, Google Shopping, Kelkoo, Twenga, Shoptize, MiElectro, Keepa (Amazon), CamelCamelCamel, Pricerunner, Homara (mención editorial al final). Para cada uno: ficha (cobertura, especialidad, app, alertas precio, modelo monetización, pros, contras).
- **Slugs internos:** `comparadores-precios-espana-mejores-como-funcionan-2026`, `mejores-tiendas-online-hogar-espana-comparativa-2026`, `como-comparar-precios-tiendas-online-espana-guia-completa-2026`, `historico-precios-importancia-comprar-muebles-electrodomesticos-2026`, `detectar-falsas-ofertas-black-friday-prime-day-rebajas-2026`, `ikea-vs-leroy-merlin-vs-el-corte-ingles-comparativa-precios-hogar`.
- **CTA final:** `Pruébanos en [Homara](/comparador)`.

## Plantilla de prompt para subagent (lista para copiar)

Reusa esta plantilla para lanzar cada agente que escriba uno de los 9 pendientes. Sustituye `<<...>>` con los valores específicos del artículo.

```
Redactor SEO para Homara (comparador hogar España, no tienda). UN artículo .md SIN WebSearch.

**Tipo:** <<Comparativa/Guía/Ranking>> | **Slug:** <<slug>>
**H1:** <<H1>>
**Keyword:** <<keyword>> | **Longitud:** 2500-3000 palabras (3000-3500 si es pillar)
**Ruta:** <<ruta absoluta exacta>>

TONO: editorial, cercano, experto. Frases CORTAS. Datos concretos (cm, kg, W, dB, €, garantía). CERO superlativos vacíos, CERO "en el mundo de hoy", CERO relleno IA. Menciona mayo 2026 una vez en el lede.

HARD RULES:
1. SIN frontmatter YAML. Empieza con `# H1`.
2. JAMÁS afiliados crudos → SIEMPRE `{{OFFER:slug-producto-kebab}}`.
3. Una intención = una URL.

ESTRUCTURA: <<copia la estructura del tipo correspondiente de HANDOFF.md>>

PRODUCTOS REALES (sin WebSearch, marcas conocidas estándar): <<lista de marcas/modelos del bloque pendiente>>

ARTÍCULOS RELACIONADOS al final:
<<lista de slugs del bloque pendiente>>

CTA final: <<copia del bloque pendiente>>

JSON-LD final: bloque ```json``` con Article + FAQPage + BreadcrumbList (añade ItemList si es ranking).

ENTREGABLE:
1. Guarda en la ruta exacta indicada.
2. Resumen <80 palabras: palabras totales, productos referenciados, slugs internos enlazados, notas para editor humano.
```

## Cuando termines los 9 pendientes

1. **Verificación rápida** con `Glob` de que existen los 50 archivos (5 pillars + 8 A + 8 B + 11 C + 11 D + 7 E).
2. **QA rápido** con `Grep` sobre los nuevos archivos:
   - Confirmar que NO existe `amzn.to` ni `amazon.es/dp` ni `amazon.es/gp` en ningún `.md` del corpus (regla #1 del CLAUDE.md de homara-web).
   - Confirmar que NO empieza ningún archivo con `---` (sin frontmatter YAML).
   - Confirmar presencia de `JSON-LD` y `## Preguntas frecuentes` en cada archivo.
3. **Marcar tareas como completed:**
   - Task #5 (45 satélites) → completed
   - Task #10 (Cluster D) → completed
   - Task #11 (Cluster E) → completed
   - Task #6 (Verificación final) → completed después del QA
4. **Comunicar al usuario** con un mensaje breve: corpus de 50 listo en `/temp`, ruta, lista de pendientes para fase TSX/Supabase si los hay (crear los `Offer` UUID en Supabase para reemplazar `{{OFFER:slug}}` en producción).

## Decisiones de diseño ya tomadas (no replantear)

- **Distribución:** 20 muebles + 20 electrodomésticos + 10 genéricos. **Tipos:** 5 pillars + 20 comparativas + 15 guías + 10 rankings.
- **Frontmatter:** NO. Markdown puro.
- **Afiliados:** placeholders `{{OFFER:slug}}`.
- **Interlinking:** bloque "Artículos relacionados" al final.
- **FAQ + JSON-LD:** sí, ambos al final de cada artículo.
- **Pillars:** ya escritos, foco estacional (verano + Prime Day + rebajas + Black Friday).
- **Verificación de datos:** NO WebSearch en los pendientes (el editor humano valida antes de publicar).
- **Fechas:** mayo 2026 (mencionar una vez por artículo).
- **Imágenes:** NO en los `.md` (se añaden en fase TSX).
- **CTAs:** principal a producto vía `{{OFFER:slug}}` + secundaria a `/categoria/<slug>` o `/comparador` al final.
- **Anti-duplicación:** lista de los 13 posts publicados en sección "Reglas duras".

## Archivos de referencia

- `/Users/martiwarda/Projects/homara/homara-web/temp/PLAN.md` — Mapa completo de los 50 artículos.
- `/Users/martiwarda/Projects/homara/homara-web/temp/README.md` — Convenciones generales.
- `/Users/martiwarda/Projects/homara/homara-brain/04-Contenido/Estilo-editorial.md` — Reglas de estilo editorial.
- `/Users/martiwarda/Projects/homara/homara-brain/01-Empresa/Tono-y-voz.md` — Tono y voz.
- `/Users/martiwarda/Projects/homara/homara-brain/04-Contenido/Checklist-publicacion.md` — Checklist a validar antes de publicar.
- `/Users/martiwarda/Projects/homara/homara-web/CLAUDE.md` — Hard rules del repo (especialmente #1: enlaces afiliados via `/api/redirect`).

## Comando de arranque sugerido

> "Continúa el handoff en `homara-web/temp/HANDOFF.md`. Lanza los 9 artículos pendientes en paralelo (D10 rehacer + D11 + E1-E7) usando la plantilla de prompt del propio handoff. Cuando termines, ejecuta el QA y marca las tareas como completed."
