import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error("Missing SUPABASE_URL/VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

function norm(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

async function getOrCreateCategoryTree() {
  const { data: categories, error } = await supabase
    .from("categories")
    .select("id,name,slug,parent_id")
    .limit(2000);

  if (error) throw error;

  const rows = categories || [];

  let parent = rows.find((c) => {
    const name = norm(c.name);
    const slug = norm(c.slug);
    return (
      (!c.parent_id && (slug === "jardin-exterior" || slug === "jardin-y-exterior")) ||
      (!c.parent_id && (name === "jardin y exterior" || name === "jardin y exteror")) ||
      (!c.parent_id && name === "jardin")
    );
  });

  if (!parent) {
    const { data, error: insertError } = await supabase
      .from("categories")
      .insert({
        name: "Jardin y Exterior",
        slug: "jardin-exterior",
        icon: "sun",
        sort_order: 0,
        is_active: true,
      })
      .select("id,name,slug,parent_id")
      .single();

    if (insertError) throw insertError;
    parent = data;
  }

  let sub = rows.find(
    (c) => c.parent_id === parent.id && (norm(c.slug) === "sombrillas" || norm(c.name) === "sombrillas"),
  );

  if (!sub) {
    const { data, error: insertError } = await supabase
      .from("categories")
      .insert({
        name: "Sombrillas",
        slug: "sombrillas",
        icon: "umbrella",
        parent_id: parent.id,
        sort_order: 0,
        is_active: true,
      })
      .select("id,name,slug,parent_id")
      .single();

    if (insertError) throw insertError;
    sub = data;
  }

  return { parent, sub };
}

async function getOrCreateBrand(name) {
  const { data: existing, error } = await supabase
    .from("brands")
    .select("id,name")
    .ilike("name", name)
    .maybeSingle();

  if (error && error.code !== "PGRST116") throw error;
  if (existing) return existing;

  const { data, error: insertError } = await supabase
    .from("brands")
    .insert({ name, is_active: true })
    .select("id,name")
    .single();

  if (insertError) throw insertError;
  return data;
}

async function getOrCreateAmazonMerchant() {
  const { data: existing, error } = await supabase
    .from("merchants")
    .select("id,name")
    .ilike("name", "Amazon")
    .maybeSingle();

  if (error && error.code !== "PGRST116") throw error;
  if (existing) return existing;

  const { data, error: insertError } = await supabase
    .from("merchants")
    .insert({
      name: "Amazon",
      domain: "amazon.es",
      country: "ES",
      is_active: true,
      logo_url: "https://m.media-amazon.com/images/G/09/digital/design/amazon_logo.png",
    })
    .select("id,name")
    .single();

  if (insertError) throw insertError;
  return data;
}

const PRODUCTS = [
  {
    name: "SONGMICS Patio Umbrella",
    slug: "songmics-patio-umbrella",
    brand: "SONGMICS",
    description: "Sombrilla de playa ligera y portatil con proteccion UPF 50+ e inclinacion doble.",
    short_description: "Sombrilla portatil UPF 50+ para playa y balcon",
    long_description:
      "Sombrilla SONGMICS de 190x120 cm con proteccion UPF 50+, marco de acero, boton de seguridad anti-cierre e inclinacion doble 30 grados.",
    specs: {
      tamano: "190x120 cm",
      material: "Poliester 160 g/m2, acero",
      proteccion_uv: "UPF 50+",
      peso: "2.5 kg",
    },
    tags: ["sombrilla", "playa", "balcon", "uv", "exterior"],
    attributes: { rating: 4.5, rating_count: 54, best_for: "Playa, balcon pequeno, uso ocasional" },
    image_url: "https://m.media-amazon.com/images/I/6163TwCWODL._AC_SX569_.jpg",
    offer: { price: 29.99, old_price: null, url: "https://amzn.to/3QoDsfp" },
  },
  {
    name: "Acomoda Textil Garden Parasol",
    slug: "acomoda-textil-garden-parasol",
    brand: "Acomoda Textil",
    description: "Parasol de jardin con manivela, tela removible y cobertura amplia.",
    short_description: "Parasol jardin 200x300 cm con manivela",
    long_description:
      "Parasol Acomoda Textil de 200x300 cm con proteccion UPF 50+, manivela suave y cobertura aproximada de 6 m2.",
    specs: {
      tamano: "200x300 cm",
      material: "Aluminio, poliester 180 g/m2",
      proteccion_uv: "UPF 50+",
      peso: "6 kg",
    },
    tags: ["parasol", "jardin", "terraza", "uv"],
    attributes: { rating: 3.8, rating_count: 49, best_for: "Terraza mediana, familia 4-6 personas" },
    image_url: "https://m.media-amazon.com/images/I/417bIAGRX5L._AC_SX425_.jpg",
    offer: { price: 49.99, old_price: null, url: "https://amzn.to/4sXb2Xk" },
  },
  {
    name: "SONGMICS Garden Umbrella 300cm",
    slug: "songmics-garden-umbrella-300cm",
    brand: "SONGMICS",
    description: "Sombrilla octogonal robusta para uso frecuente en verano.",
    short_description: "Sombrilla octogonal 300cm UPF 50+",
    long_description:
      "Sombrilla SONGMICS de 300 cm con proteccion UPF 50+, ventilacion superior, manivela suave y estructura robusta.",
    specs: {
      tamano: "300 cm diametro",
      material: "Acero revestido, poliester 180 g/m2",
      proteccion_uv: "UPF 50+",
      peso: "6.8 kg",
    },
    tags: ["sombrilla", "jardin", "octogonal", "uv"],
    attributes: { rating: 4.4, rating_count: 3274, best_for: "Patio robusto, uso frecuente" },
    image_url: "https://m.media-amazon.com/images/I/61evsUkivPL._AC_SX425_.jpg",
    offer: { price: 56.99, old_price: null, url: "https://amzn.to/4mTiVf4" },
  },
  {
    name: "SONGMICS Solar LED Illuminated",
    slug: "songmics-solar-led-illuminated",
    brand: "SONGMICS",
    description: "Sombrilla con iluminacion LED solar integrada para cenas exteriores.",
    short_description: "Sombrilla 300cm con 32 LED solares",
    long_description:
      "Sombrilla SONGMICS de 300 cm con 32 luces LED solares, base incluida y proteccion UPF 50+.",
    specs: {
      tamano: "300 cm diametro",
      material: "Acero metalico, poliester 180 g/m2",
      proteccion_uv: "UPF 50+",
      peso: "13.8 kg",
    },
    tags: ["sombrilla", "led", "solar", "terraza", "uv"],
    attributes: { rating: 4.3, rating_count: 397, best_for: "Cenas en terraza" },
    image_url: "https://m.media-amazon.com/images/I/61+BHg4B7YL._AC_SX679_.jpg",
    offer: { price: 99.99, old_price: null, url: "https://amzn.to/4n02FZO" },
  },
  {
    name: "tillvex Premium 330cm",
    slug: "tillvex-premium-330cm",
    brand: "tillvex",
    description: "Sombrilla premium con giro 360 grados y 6 posiciones de inclinacion.",
    short_description: "Sombrilla premium 330cm con giro 360",
    long_description:
      "Sombrilla tillvex 330 cm con proteccion UPF 50+, giro 360 grados, 6 inclinaciones y funda incluida.",
    specs: {
      tamano: "330 cm diametro",
      material: "Aluminio, poliester 180 g/m2",
      proteccion_uv: "UPF 50+",
      peso: "12 kg",
    },
    tags: ["sombrilla", "premium", "giro 360", "uv"],
    attributes: { rating: 4.1, rating_count: 13, best_for: "Terrazas grandes" },
    image_url: "https://m.media-amazon.com/images/I/81woIQnkj0L._AC_SX522_.jpg",
    offer: { price: 149.9, old_price: null, url: "https://amzn.to/42sWVhx" },
  },
  {
    name: "VOUNOT Square Eccentric Parasol",
    slug: "vounot-square-eccentric-parasol",
    brand: "VOUNOT",
    description: "Sombrilla cuadrada profesional de alta densidad para espacios amplios.",
    short_description: "Sombrilla cuadrada 300x300 profesional",
    long_description:
      "Sombrilla VOUNOT 300x300 cm con lona 220 g/m2, giro 360 grados y 6 niveles de inclinacion.",
    specs: {
      tamano: "300x300 cm",
      material: "Acero reforzado, poliester 220 g/m2",
      proteccion_uv: "UPF 50+",
      peso: "22.5 kg",
    },
    tags: ["sombrilla", "cuadrada", "profesional", "uv", "terraza"],
    attributes: { rating: 4.2, rating_count: 23, best_for: "Piscinas y terrazas grandes" },
    image_url: "https://m.media-amazon.com/images/I/71CVlYCvVdL._AC_SX679_.jpg",
    offer: { price: 179.99, old_price: null, url: "https://amzn.to/48qBKjL" },
  },
];

async function resolveOfferUrl(rawUrl) {
  const fallback = String(rawUrl || "").trim();
  if (!fallback) {
    return fallback;
  }

  try {
    const response = await fetch(fallback, {
      method: "GET",
      redirect: "follow",
      headers: {
        "user-agent": "Mozilla/5.0 (compatible; HomaraSeedBot/1.0)",
      },
    });

    const finalUrl = String(response.url || "").trim();
    return finalUrl || fallback;
  } catch {
    return fallback;
  }
}

async function upsertProduct(categoryId, merchantId, productInput) {
  const brand = await getOrCreateBrand(productInput.brand);

  const productPayload = {
    name: productInput.name,
    slug: productInput.slug,
    brand_id: brand.id,
    category_id: categoryId,
    description: productInput.description,
    short_description: productInput.short_description,
    long_description: productInput.long_description,
    specs: productInput.specs,
    tags: productInput.tags,
    attributes: productInput.attributes,
    is_active: true,
  };

  const { data: existing, error: existingError } = await supabase
    .from("products")
    .select("id")
    .eq("slug", productInput.slug)
    .maybeSingle();

  if (existingError && existingError.code !== "PGRST116") throw existingError;

  let productId;
  let action;

  if (existing?.id) {
    const { error: updateError } = await supabase.from("products").update(productPayload).eq("id", existing.id);
    if (updateError) throw updateError;
    productId = existing.id;
    action = "updated";
  } else {
    const { data, error: insertError } = await supabase
      .from("products")
      .insert(productPayload)
      .select("id")
      .single();

    if (insertError) throw insertError;
    productId = data.id;
    action = "inserted";
  }

  const { data: imageExisting, error: imageExistingError } = await supabase
    .from("product_images")
    .select("id")
    .eq("product_id", productId)
    .eq("url", productInput.image_url)
    .maybeSingle();

  if (imageExistingError && imageExistingError.code !== "PGRST116") throw imageExistingError;

  if (!imageExisting?.id) {
    const { error: imageInsertError } = await supabase.from("product_images").insert({
      product_id: productId,
      url: productInput.image_url,
      is_primary: true,
      sort_order: 1,
    });
    if (imageInsertError) throw imageInsertError;
  }

  const resolvedOfferUrl = await resolveOfferUrl(productInput.offer.url);

  const { data: offerExisting, error: offerExistingError } = await supabase
    .from("offers")
    .select("id")
    .eq("product_id", productId)
    .eq("merchant_id", merchantId)
    .limit(1)
    .maybeSingle();

  if (offerExistingError && offerExistingError.code !== "PGRST116") throw offerExistingError;

  if (offerExisting?.id) {
    const { error: offerUpdateError } = await supabase
      .from("offers")
      .update({
        price: productInput.offer.price,
        old_price: productInput.offer.old_price,
        url: resolvedOfferUrl,
        stock: true,
        is_active: true,
        updated_at: new Date().toISOString(),
      })
      .eq("id", offerExisting.id);

    if (offerUpdateError) throw offerUpdateError;
  } else {
    const { error: offerInsertError } = await supabase.from("offers").insert({
      product_id: productId,
      merchant_id: merchantId,
      price: productInput.offer.price,
      old_price: productInput.offer.old_price,
      url: resolvedOfferUrl,
      stock: true,
      is_active: true,
      is_featured: false,
    });

    if (offerInsertError) throw offerInsertError;
  }

  return { slug: productInput.slug, action };
}

async function main() {
  const { parent, sub } = await getOrCreateCategoryTree();
  const merchant = await getOrCreateAmazonMerchant();

  const results = [];
  for (const p of PRODUCTS) {
    const r = await upsertProduct(sub.id, merchant.id, p);
    results.push(r);
  }

  const inserted = results.filter((r) => r.action === "inserted").length;
  const updated = results.filter((r) => r.action === "updated").length;

  console.log("Seed completed");
  console.log(`Parent category: ${parent.name} (${parent.id})`);
  console.log(`Subcategory: ${sub.name} (${sub.id})`);
  console.log(`Merchant: ${merchant.name} (${merchant.id})`);
  console.log(`Products inserted: ${inserted}`);
  console.log(`Products updated: ${updated}`);
  console.log("Products processed:", results.map((r) => `${r.slug}:${r.action}`).join(", "));
}

main().catch((error) => {
  console.error("Seed failed:", error?.message || error);
  if (error?.details) console.error("Details:", error.details);
  if (error?.hint) console.error("Hint:", error.hint);
  process.exit(1);
});
