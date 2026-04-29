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
        name: "Jardín y Exterior",
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
    (c) => c.parent_id === parent.id && (norm(c.slug) === "piscinas" || norm(c.name) === "piscinas"),
  );

  if (!sub) {
    const { data, error: insertError } = await supabase
      .from("categories")
      .insert({
        name: "Piscinas",
        slug: "piscinas",
        icon: "water",
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
    name: "Intex 28272NP Small Frame – Detachable Swimming Pool, 300 x 200 x 75 cm, 3.834 Litres, Blue",
    slug: "intex-28272np-small-frame-300x200x75",
    brand: "Intex",
    description: "Piscina desmontable Intex Small Frame con estructura metálica y montaje rápido.",
    short_description: "Piscina desmontable Intex Small Frame 300 x 200 x 75 cm",
    long_description:
      "Piscina desmontable Intex Small Frame con estructura de acero, lona Super-Tough y drenaje con conexión a manguera.",
    specs: {
      estructura: "Small Frame (tubular)",
      tamano: "300 x 200 x 75 cm",
      capacidad: "3.834 L",
    },
    tags: ["piscinas desmontables", "intex", "small frame", "verano"],
    attributes: {
      size: "300 x 200 x 75 cm",
      rating: 4.5,
      rating_count: 48084,
      best_for: "Primeros compradores y patios pequeños",
    },
    image_url: "https://m.media-amazon.com/images/I/61Yj7vQtbAL._AC_SX569_.jpg",
    offer: { price: 99.0, old_price: null, url: "https://amzn.to/4u4lMEf" },
  },
  {
    name: "BESTWAY 56406 – Steel Pro MAX Tubular Detachable Swimming Pool, 305 x 76 cm, Multicoloured",
    slug: "bestway-56406-steel-pro-max-305x76",
    brand: "Bestway",
    description: "Piscina desmontable Bestway Steel Pro MAX tubular de 305 x 76 cm.",
    short_description: "Piscina desmontable Bestway Steel Pro MAX 305 x 76 cm",
    long_description:
      "Piscina desmontable Bestway Steel Pro MAX con estructura tubular y tamaño familiar de 305 x 76 cm.",
    specs: {
      estructura: "Steel Pro MAX (tubular)",
      tamano: "305 x 76 cm",
    },
    tags: ["piscinas desmontables", "bestway", "verano"],
    attributes: {
      size: "305 x 76 cm",
      rating: 4.4,
      rating_count: 2555,
      best_for: "Familias que quieren gastar poco",
    },
    image_url: "https://m.media-amazon.com/images/I/81i97asQzML._AC_SX569_.jpg",
    offer: { price: 89.99, old_price: null, url: "https://amzn.to/4cvKozO" },
  },
  {
    name: "Intex ¡¡¡28212-POOL Metal Frame 366X76CM 6503L C/DEPURATOR",
    slug: "intex-28212-metal-frame-366x76-6503l",
    brand: "Intex",
    description: "Piscina desmontable Intex Metal Frame 366 x 76 cm con depuradora.",
    short_description: "Piscina Intex Metal Frame 366 x 76 cm con depuradora",
    long_description:
      "Piscina desmontable Intex Metal Frame 366 x 76 cm con estructura de acero, lona triple capa y depuradora de cartucho tipo A.",
    specs: {
      estructura: "Metal Frame",
      tamano: "366 x 76 cm",
      capacidad: "6.503 L",
    },
    tags: ["piscinas desmontables", "intex", "metal frame", "verano"],
    attributes: {
      size: "366 x 76 cm",
      rating: 4.3,
      rating_count: 5169,
      best_for: "Uso frecuente con más estabilidad",
    },
    image_url: "https://m.media-amazon.com/images/I/51m14kNojZL._AC_SX569_.jpg",
    offer: { price: 114.99, old_price: null, url: "https://amzn.to/4cZY4TQ" },
  },
  {
    name: "Bestway Fast Set Self-Standing Detachable Pool, 244 x 66 cm",
    slug: "bestway-fast-set-244x66",
    brand: "Bestway",
    description: "Piscina autoportante Bestway Fast Set de 244 x 66 cm.",
    short_description: "Piscina autoportante Bestway Fast Set 244 x 66 cm",
    long_description:
      "Piscina autoportante Bestway Fast Set con lona Tritech y drenaje con conexión a manguera.",
    specs: {
      estructura: "Autoportante",
      tamano: "244 x 66 cm",
    },
    tags: ["piscinas desmontables", "bestway", "autoportante", "verano"],
    attributes: {
      size: "244 x 66 cm",
      rating: 3.9,
      rating_count: 4037,
      best_for: "Montaje rápido y uso ocasional",
    },
    image_url: "https://m.media-amazon.com/images/I/51-glVV9EwL._AC_SX569_.jpg",
    offer: { price: 41.99, old_price: null, url: "https://amzn.to/4u4hBZ1" },
  },
  {
    name: "Intex 26700NP – Round Prisma Frame Raised Pool 305 x 76 cm",
    slug: "intex-26700np-prisma-frame-305x76",
    brand: "Intex",
    description: "Piscina Intex Prisma Frame 305 x 76 cm con estructura metálica y lona triple capa.",
    short_description: "Piscina Intex Prisma Frame 305 x 76 cm",
    long_description:
      "Piscina desmontable Intex Prisma Frame 305 x 76 cm con estructura de acero, lona PVC-poliéster y drenaje con conexión a manguera.",
    specs: {
      estructura: "Prisma Frame",
      tamano: "305 x 76 cm",
      capacidad: "4.485 L",
    },
    tags: ["piscinas desmontables", "intex", "prism frame", "verano"],
    attributes: {
      size: "305 x 76 cm",
      rating: 4.1,
      rating_count: 1186,
      best_for: "Familias que necesitan más espacio",
    },
    image_url: "https://m.media-amazon.com/images/I/61o2sQfnLvL._AC_SX425_.jpg",
    offer: { price: 89.95, old_price: null, url: "https://amzn.to/498sukr" },
  },
];

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

  if (productInput.image_url) {
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
  }

  const resolvedOfferUrl = await resolveOfferUrl(productInput.offer.url);

  if (!Number.isFinite(productInput.offer.price) || productInput.offer.price <= 0) {
    console.warn(`Skipping offer for ${productInput.slug}: price not available`);
    return { slug: productInput.slug, action };
  }

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
