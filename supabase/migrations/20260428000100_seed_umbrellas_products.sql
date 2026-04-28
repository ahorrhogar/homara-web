begin;

-- Obtener o crear categoria padre "Jardín y Exterior"
insert into public.categories (name, slug, icon, image_url, parent_id)
values ('Jardín y Exterior', 'jardin-exterior', '🏡', null, null)
on conflict (name) do nothing;

-- Obtener ID de "Jardín y Exterior"
with parent_cat as (
  select id from public.categories where name = 'Jardín y Exterior' limit 1
)
-- Crear subcategoría "Sombrillas"
insert into public.categories (name, slug, icon, image_url, parent_id)
select 'Sombrillas', 'sombrillas', '☂️', null, parent_cat.id
from parent_cat
on conflict do nothing;

-- Crear marcas
insert into public.brands (name)
values 
  ('SONGMICS'),
  ('Acomoda Textil'),
  ('tillvex'),
  ('VOUNOT')
on conflict (name) do nothing;

-- Crear merchant Amazon
insert into public.merchants (name, logo_url)
values ('Amazon', 'https://m.media-amazon.com/images/G/09/digital/design/amazon_logo.png')
on conflict do nothing;

-- Obtener IDs necesarios
with ids as (
  select
    (select id from public.categories where name = 'Sombrillas' limit 1) as sombrillas_cat_id,
    (select id from public.brands where name = 'SONGMICS' limit 1) as songmics_brand_id,
    (select id from public.brands where name = 'Acomoda Textil' limit 1) as acomoda_brand_id,
    (select id from public.brands where name = 'tillvex' limit 1) as tillvex_brand_id,
    (select id from public.brands where name = 'VOUNOT' limit 1) as vounot_brand_id,
    (select id from public.merchants where name = 'Amazon' limit 1) as amazon_merchant_id
)
insert into public.products (
  name,
  slug,
  brand_id,
  category_id,
  description,
  short_description,
  long_description,
  specs,
  tags,
  attributes,
  is_active,
  created_at,
  updated_at
)
select
  'SONGMICS Patio Umbrella',
  'songmics-patio-umbrella',
  ids.songmics_brand_id,
  ids.sombrillas_cat_id,
  'Sombrilla de playa ligera y portátil con protección UPF 50+ y inclinación doble bidireccional.',
  'Sombrilla portátil UPF 50+ para playa y balcón',
  'Sombrilla SONGMICS de 190×120 cm con protección UPF 50+, marco de acero, botón de seguridad anti-cierre repentino e inclinación doble 30° bidireccional. Incluye bolsa de transporte y es perfecta para iniciarse sin gasto en protección solar.',
  jsonb_build_object(
    'tamaño', '190×120 cm',
    'material', 'Poliéster 160 g/m², Marco acero',
    'protección_uv', 'UPF 50+',
    'peso', '2,5 kg',
    'características', jsonb_build_array('Inclinación doble 30° bidireccional', 'Incluye bolsa de transporte', 'Botón de seguridad anti-cierre repentino')
  ),
  jsonb_build_array('sombrilla', 'playa', 'portátil', 'uv', 'exterior'),
  jsonb_build_object(
    'rating', 4.5,
    'rating_count', 54,
    'price_saw', 29.99,
    'best_for', 'Playa, balcón pequeño, uso ocasional'
  ),
  true,
  now(),
  now()
from ids
where ids.songmics_brand_id is not null
  and ids.sombrillas_cat_id is not null;

with ids as (
  select
    (select id from public.categories where name = 'Sombrillas' limit 1) as sombrillas_cat_id,
    (select id from public.brands where name = 'Acomoda Textil' limit 1) as acomoda_brand_id,
    (select id from public.merchants where name = 'Amazon' limit 1) as amazon_merchant_id
)
insert into public.products (
  name,
  slug,
  brand_id,
  category_id,
  description,
  short_description,
  long_description,
  specs,
  tags,
  attributes,
  is_active,
  created_at,
  updated_at
)
select
  'Acomoda Textil Garden Parasol',
  'acomoda-textil-garden-parasol',
  ids.acomoda_brand_id,
  ids.sombrillas_cat_id,
  'Parasol de jardín con manivela trinquete fluida, tela removible y cobertura de 6 m².',
  'Parasol jardín 200×300 cm con manivela, mejor relación tamaño-precio',
  'Parasol Acomoda Textil de 200×300 cm con protección UPF 50+, manivela trinquete fluida y suave, tela removible para lavar y cobertura amplia de 6 m². Calidad honesta sin tonterías por precio contenido, ideal para terraza mediana con familia de 4-6 personas.',
  jsonb_build_object(
    'tamaño', '200×300 cm',
    'material', 'Aluminio 4mm, Poliéster 180 g/m²',
    'protección_uv', 'UPF 50+',
    'peso', '6 kg',
    'características', jsonb_build_array('Manivela trinquete fluida y suave', 'Tela removible para lavar', 'Sombra amplia de 6 m²')
  ),
  jsonb_build_array('parasol', 'jardín', 'terraza', 'uv', 'manivela'),
  jsonb_build_object(
    'rating', 3.8,
    'rating_count', 49,
    'price_saw', 49.99,
    'best_for', 'Terraza mediana, familia de 4-6 personas'
  ),
  true,
  now(),
  now()
from ids
where ids.acomoda_brand_id is not null
  and ids.sombrillas_cat_id is not null;

with ids as (
  select
    (select id from public.categories where name = 'Sombrillas' limit 1) as sombrillas_cat_id,
    (select id from public.brands where name = 'SONGMICS' limit 1) as songmics_brand_id,
    (select id from public.merchants where name = 'Amazon' limit 1) as amazon_merchant_id
)
insert into public.products (
  name,
  slug,
  brand_id,
  category_id,
  description,
  short_description,
  long_description,
  specs,
  tags,
  attributes,
  is_active,
  created_at,
  updated_at
)
select
  'SONGMICS Garden Umbrella 300cm',
  'songmics-garden-umbrella-300cm',
  ids.songmics_brand_id,
  ids.sombrillas_cat_id,
  'Sombrilla octagonal con 3.274 valoraciones garantizando durabilidad legendaria y construcción robusta.',
  'Sombrilla octagonal 300cm UPF 50+ construcción legendaria',
  'Sombrilla SONGMICS octagonal de 300 cm con protección UPF 50+, marco de acero revestido, peso 6,8 kg, orificios de ventilación para más estabilidad con viento y manivela suave y segura. 3.274 valoraciones garantizan su durabilidad. Es el Corolla de las sombrillas: no es la más cara ni la más chula, pero será la última que venda. Reina callada de la durabilidad.',
  jsonb_build_object(
    'tamaño', '300 cm Ø (Octagonal)',
    'material', 'Acero revestido, Poliéster 180 g/m²',
    'protección_uv', 'UPF 50+',
    'peso', '6,8 kg',
    'características', jsonb_build_array('3.274 valoraciones garantizan durabilidad', 'Orificios de ventilación = más estabilidad con viento', 'Manivela suave y segura')
  ),
  jsonb_build_array('sombrilla', 'octagonal', 'jardín', 'uv', 'duradera'),
  jsonb_build_object(
    'rating', 4.4,
    'rating_count', 3274,
    'price_saw', 56.99,
    'best_for', 'Patio robusto, uso frecuente todo el verano'
  ),
  true,
  now(),
  now()
from ids
where ids.songmics_brand_id is not null
  and ids.sombrillas_cat_id is not null;

with ids as (
  select
    (select id from public.categories where name = 'Sombrillas' limit 1) as sombrillas_cat_id,
    (select id from public.brands where name = 'SONGMICS' limit 1) as songmics_brand_id,
    (select id from public.merchants where name = 'Amazon' limit 1) as amazon_merchant_id
)
insert into public.products (
  name,
  slug,
  brand_id,
  category_id,
  description,
  short_description,
  long_description,
  specs,
  tags,
  attributes,
  is_active,
  created_at,
  updated_at
)
select
  'SONGMICS Solar LED Illuminated',
  'songmics-solar-led-illuminated',
  ids.songmics_brand_id,
  ids.sombrillas_cat_id,
  'Sombrilla de 300 cm con 32 luces LED solares integradas, base incluida y ambiente romántico garantizado.',
  'Sombrilla 300cm con 32 LED solares, base incluida',
  'Sombrilla SONGMICS de 300 cm con protección UPF 50+, 32 luces LED solares integradas, base incluida (requiere 80 kg pesos), carga solar automática 8 horas = 6 horas de luz. Es la sombrilla que impresiona a tus amigos. De día cumple, de noche seduce. Vale cada céntimo si disfrutas cenar en la terraza.',
  jsonb_build_object(
    'tamaño', '300 cm Ø',
    'material', 'Acero metálico, Poliéster 180 g/m²',
    'protección_uv', 'UPF 50+',
    'peso', '13,8 kg',
    'características', jsonb_build_array('32 luces LED solares integradas', 'Base incluida (requiere 80 kg pesos)', 'Carga solar automática 8 horas = 6 horas de luz')
  ),
  jsonb_build_array('sombrilla', 'led', 'solar', 'uv', 'terraza'),
  jsonb_build_object(
    'rating', 4.3,
    'rating_count', 397,
    'price_saw', 99.99,
    'best_for', 'Ambiente romántico nocturno, cenas en terraza'
  ),
  true,
  now(),
  now()
from ids
where ids.songmics_brand_id is not null
  and ids.sombrillas_cat_id is not null;

with ids as (
  select
    (select id from public.categories where name = 'Sombrillas' limit 1) as sombrillas_cat_id,
    (select id from public.brands where name = 'tillvex' limit 1) as tillvex_brand_id,
    (select id from public.merchants where name = 'Amazon' limit 1) as amazon_merchant_id
)
insert into public.products (
  name,
  slug,
  brand_id,
  category_id,
  description,
  short_description,
  long_description,
  specs,
  tags,
  attributes,
  is_active,
  created_at,
  updated_at
)
select
  'tillvex Premium 330cm',
  'tillvex-premium-330cm',
  ids.tillvex_brand_id,
  ids.sombrillas_cat_id,
  'Sombrilla premium de 330 cm con rotación 360°, 6 posiciones de inclinación y funda protectora con cierre cramallera.',
  'Sombrilla Premium 330cm rotación 360°, 6 inclinaciones',
  'Sombrilla tillvex de 330 cm con protección UPF 50+, aluminio, rotación 360° mediante palanca pie sin mover base, 6 posiciones de inclinación regulables, funda protectora con cierre cramallera y tubo soporte 70×50 mm extra robusto. Es sombrilla seria. La pagas, la usas 10 años sin pensar. Inversión que merece la pena para quien busca no volver a cambiar.',
  jsonb_build_object(
    'tamaño', '330 cm Ø (100 cm base)',
    'material', 'Aluminio, Poliéster 180 g/m²',
    'protección_uv', 'UPF 50+',
    'peso', '12 kg',
    'características', jsonb_build_array('360° rotación mediante palanca pie', '6 posiciones de inclinación regulables', 'Funda protectora con cierre cramallera', 'Tubo soporte 70×50 mm extra robusto')
  ),
  jsonb_build_array('sombrilla', 'premium', 'rotación', 'uv', 'inversión'),
  jsonb_build_object(
    'rating', 4.1,
    'rating_count', 13,
    'price_saw', 149.90,
    'best_for', 'Terrazas grandes, inversión a largo plazo'
  ),
  true,
  now(),
  now()
from ids
where ids.tillvex_brand_id is not null
  and ids.sombrillas_cat_id is not null;

with ids as (
  select
    (select id from public.categories where name = 'Sombrillas' limit 1) as sombrillas_cat_id,
    (select id from public.brands where name = 'VOUNOT' limit 1) as vounot_brand_id,
    (select id from public.merchants where name = 'Amazon' limit 1) as amazon_merchant_id
)
insert into public.products (
  name,
  slug,
  brand_id,
  category_id,
  description,
  short_description,
  long_description,
  specs,
  tags,
  attributes,
  is_active,
  created_at,
  updated_at
)
select
  'VOUNOT Square Eccentric Parasol',
  'vounot-square-eccentric-parasol',
  ids.vounot_brand_id,
  ids.sombrillas_cat_id,
  'Paraguas cuadrado profesional de 300×300 cm con rotación 360°, lona ultradensa 220 g/m² y 8 varillas de acero antioxidante.',
  'Sombrilla cuadrada 300×300cm profesional XXL 220g/m²',
  'Sombrilla VOUNOT cuadrada de 300×300 cm con protección UPF 50+, lona ultradensa 220 g/m² (máxima durabilidad), rotación 360° con pedal en base, 6 niveles de inclinación por manilla, 8 varillas acero con revestimiento antioxidante. La Godzilla de las sombrillas. Si tu terraza es tu segundo salón, esta es la reina. Amplia, robusta, pensada para durar décadas bajo cualquier clima.',
  jsonb_build_object(
    'tamaño', '300×300 cm (Cuadrado)',
    'material', 'Acero reforzado, Poliéster 220 g/m²',
    'protección_uv', 'UPF 50+',
    'peso', '22,5 kg',
    'características', jsonb_build_array('Lona ultradensa 220 g/m² (máxima durabilidad)', 'Rotación 360° con pedal en base', '6 niveles de inclinación por manilla', '8 varillas acero con revestimiento antioxidante')
  ),
  jsonb_build_array('sombrilla', 'cuadrada', 'profesional', 'uv', 'xxl'),
  jsonb_build_object(
    'rating', 4.2,
    'rating_count', 23,
    'price_saw', 179.99,
    'best_for', 'Piscinas, terrazas grandes, espacios profesionales'
  ),
  true,
  now(),
  now()
from ids
where ids.vounot_brand_id is not null
  and ids.sombrillas_cat_id is not null;

-- Agregar imágenes a los productos
with product_images_data as (
  select
    (select id from public.products where slug = 'songmics-patio-umbrella' limit 1) as product_id,
    'https://m.media-amazon.com/images/I/6163TwCWODL._AC_SX569_.jpg' as url,
    true as is_primary
  union all
  select
    (select id from public.products where slug = 'acomoda-textil-garden-parasol' limit 1),
    'https://m.media-amazon.com/images/I/417bIAGRX5L._AC_SX425_.jpg',
    true
  union all
  select
    (select id from public.products where slug = 'songmics-garden-umbrella-300cm' limit 1),
    'https://m.media-amazon.com/images/I/61evsUkivPL._AC_SX425_.jpg',
    true
  union all
  select
    (select id from public.products where slug = 'songmics-solar-led-illuminated' limit 1),
    'https://m.media-amazon.com/images/I/61+BHg4B7YL._AC_SX679_.jpg',
    true
  union all
  select
    (select id from public.products where slug = 'tillvex-premium-330cm' limit 1),
    'https://m.media-amazon.com/images/I/81woIQnkj0L._AC_SX522_.jpg',
    true
  union all
  select
    (select id from public.products where slug = 'vounot-square-eccentric-parasol' limit 1),
    'https://m.media-amazon.com/images/I/71CVlYCvVdL._AC_SX679_.jpg',
    true
)
insert into public.product_images (product_id, url, is_primary, sort_order)
select product_id, url, is_primary, 1 from product_images_data
where product_id is not null
on conflict do nothing;

-- Agregar ofertas en Amazon
with offer_data as (
  select
    (select id from public.products where slug = 'songmics-patio-umbrella' limit 1) as product_id,
    (select id from public.merchants where name = 'Amazon' limit 1) as merchant_id,
    29.99::numeric as price,
    null::numeric as old_price,
    'https://amzn.to/3QoDsfp' as url
  union all
  select
    (select id from public.products where slug = 'acomoda-textil-garden-parasol' limit 1),
    (select id from public.merchants where name = 'Amazon' limit 1),
    49.99::numeric,
    null::numeric,
    'https://amzn.to/4sXb2Xk'
  union all
  select
    (select id from public.products where slug = 'songmics-garden-umbrella-300cm' limit 1),
    (select id from public.merchants where name = 'Amazon' limit 1),
    56.99::numeric,
    null::numeric,
    'https://amzn.to/4mTiVf4'
  union all
  select
    (select id from public.products where slug = 'songmics-solar-led-illuminated' limit 1),
    (select id from public.merchants where name = 'Amazon' limit 1),
    99.99::numeric,
    null::numeric,
    'https://amzn.to/4n02FZO'
  union all
  select
    (select id from public.products where slug = 'tillvex-premium-330cm' limit 1),
    (select id from public.merchants where name = 'Amazon' limit 1),
    149.90::numeric,
    null::numeric,
    'https://amzn.to/42sWVhx'
  union all
  select
    (select id from public.products where slug = 'vounot-square-eccentric-parasol' limit 1),
    (select id from public.merchants where name = 'Amazon' limit 1),
    179.99::numeric,
    null::numeric,
    'https://amzn.to/48qBKjL'
)
insert into public.offers (product_id, merchant_id, price, old_price, url, stock, is_active, updated_at)
select product_id, merchant_id, price, old_price, url, true, true, now()
from offer_data
where product_id is not null and merchant_id is not null
on conflict do nothing;

commit;
