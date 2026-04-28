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

const sub = await supabase.from("categories").select("id,name,parent_id").eq("slug", "sombrillas").maybeSingle();
if (sub.error) throw sub.error;

const categoryId = sub.data?.id;
const productsResult = await supabase
  .from("products")
  .select("id,slug,attributes")
  .eq("category_id", categoryId);
if (productsResult.error) throw productsResult.error;

const products = productsResult.data || [];
const productIds = products.map((p) => p.id);

let offers = [];
if (productIds.length) {
  const offersResult = await supabase
    .from("offers")
    .select("id,product_id,url,price,is_active")
    .in("product_id", productIds);

  if (offersResult.error) throw offersResult.error;
  offers = offersResult.data || [];
}

const ratedProducts = products.filter((p) => {
  const attrs = p.attributes || {};
  return typeof attrs.rating === "number" && typeof attrs.rating_count === "number";
});

console.log("Sombrillas category id:", categoryId);
console.log("Products in subcategory:", products.length);
console.log("Offers for those products:", offers.length);
console.log("Rated products:", ratedProducts.length);
console.log("Product slugs:", products.map((p) => p.slug).join(", "));
