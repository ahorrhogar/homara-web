"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ChevronDown, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

import {
  listBrands,
  listCategories,
  listMerchants,
  listOffers,
  upsertBrand,
  upsertCategory,
  upsertMerchant,
  upsertProductWithOffer,
} from "@/admin/services/adminCatalogService";
import type { AdminProductRecord } from "@/admin/types";
import { InlineCreateCombobox } from "@/admin/components/InlineCreateCombobox";
import { ProductImageManager } from "@/admin/components/ProductImageManager";
import { QuickFillCard, type QuickFillResult } from "@/admin/components/QuickFillCard";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { isAffiliateUrlAllowed } from "@/infrastructure/security/affiliateUrl";

function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function specsToText(specs: Array<{ label: string; value: string }>): string {
  return specs.map((item) => `${item.label}: ${item.value}`).join("\n");
}

// react-hook-form's `valueAsNumber: true` returns NaN when the input is empty.
// NaN then falls through Zod with confusing "Expected number, received nan"
// errors and slips into server-side `<= 0` checks. These helpers coerce empty
// inputs to a safe value before they hit the form state.
function numberFromInput(value: unknown, fallback: number | undefined): number | undefined {
  if (value === "" || value === null || value === undefined) return fallback;
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n)) return fallback;
  return n;
}

function parseSpecsText(value: string): Array<{ label: string; value: string }> {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const parts = line.split(":");
      const label = parts.shift()?.trim() || "";
      const specValue = parts.join(":").trim();
      return { label, value: specValue };
    })
    .filter((item) => item.label && item.value);
}

const productSheetSchema = z.object({
  name: z.string().trim().min(3, "Nombre requerido"),
  // Loosened regex: legacy slugs (accents, dots, underscores from pre-migration
  // seeds) must remain editable without forcing a rename — HARD RULE #2.
  // Slugify normalizes new slugs as the user types the name; this regex just
  // blocks structurally broken values (whitespace, slashes, query strings).
  slug: z
    .string()
    .trim()
    .min(3, "Slug requerido")
    .regex(/^[^\s/?#&]+$/, "Slug no puede tener espacios, /, ?, # ni &"),
  brandId: z.string().uuid("Selecciona una marca"),
  parentCategoryId: z.string().uuid("Selecciona una categoría"),
  subcategoryId: z.string().optional(),
  shortDescription: z.string().trim().min(10, "Mínimo 10 caracteres"),
  longDescription: z.string().trim().min(20, "Mínimo 20 caracteres"),
  imageUrl: z.string().trim().optional(),

  offer: z.object({
    merchantId: z.string().uuid("Selecciona una tienda"),
    price: z
      .number({ invalid_type_error: "Precio inválido" })
      .positive("El precio debe ser mayor que 0"),
    oldPrice: z.number().nonnegative().optional(),
    url: z
      .string()
      .url("URL inválida")
      .refine((u) => isAffiliateUrlAllowed(u), "URL no permitida"),
    stock: z.boolean(),
    isActive: z.boolean(),
    sourceType: z.enum(["manual", "api", "feed", "future_auto"]),
  }),

  tags: z.string().optional(),
  technicalSpecsText: z.string().optional(),
  sku: z.string().optional(),
  ean: z.string().optional(),
  material: z.string().optional(),
  color: z.string().optional(),
  style: z.string().optional(),
  dimensions: z.string().optional(),
  weight: z.string().optional(),
  rating: z
    .union([z.number(), z.nan()])
    .optional()
    .transform((v) => (typeof v === "number" && Number.isFinite(v) ? v : undefined)),
  reviewCount: z
    .union([z.number(), z.nan()])
    .optional()
    .transform((v) => (typeof v === "number" && Number.isFinite(v) ? Math.floor(v) : undefined)),
  isActive: z.boolean(),
  featured: z.boolean(),
  teamRecommended: z.boolean(),
  editorialPriority: z.number().int().min(0).max(100),
});

type ProductSheetFormValues = z.infer<typeof productSheetSchema>;

const INITIAL_VALUES: ProductSheetFormValues = {
  name: "",
  slug: "",
  brandId: "",
  parentCategoryId: "",
  subcategoryId: "",
  shortDescription: "",
  longDescription: "",
  imageUrl: "",
  offer: {
    merchantId: "",
    price: 0,
    oldPrice: undefined,
    url: "",
    stock: true,
    isActive: true,
    sourceType: "manual",
  },
  tags: "",
  technicalSpecsText: "",
  sku: "",
  ean: "",
  material: "",
  color: "",
  style: "",
  dimensions: "",
  weight: "",
  rating: undefined,
  reviewCount: undefined,
  isActive: true,
  featured: false,
  teamRecommended: false,
  editorialPriority: 0,
};

export interface ProductSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "create" | "edit";
  product?: AdminProductRecord;
  onSaved?: (productId: string) => void;
}

export function ProductSheet({ open, onOpenChange, mode, product, onSaved }: ProductSheetProps) {
  const queryClient = useQueryClient();
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showQuickFill, setShowQuickFill] = useState(true);
  const [slugLocked, setSlugLocked] = useState(false);
  const [savedProductId, setSavedProductId] = useState<string | null>(null);

  const brandsQuery = useQuery({ queryKey: ["admin-brands"], queryFn: listBrands });
  const categoriesQuery = useQuery({ queryKey: ["admin-categories"], queryFn: listCategories });
  const merchantsQuery = useQuery({ queryKey: ["admin-merchants"], queryFn: listMerchants });

  const editProductId = mode === "edit" ? product?.id : undefined;
  const offersQuery = useQuery({
    queryKey: ["admin-product-offers-first", editProductId],
    queryFn: () => listOffers({ productId: editProductId, page: 1, pageSize: 5 }),
    enabled: Boolean(editProductId),
  });
  const offerCount = offersQuery.data?.total ?? 0;

  const form = useForm<ProductSheetFormValues>({
    resolver: zodResolver(productSheetSchema),
    defaultValues: INITIAL_VALUES,
    mode: "onTouched",
  });

  // Track the (open, mode, productId) tuple we last hydrated for so background
  // refetches of categories / offers / brands never re-fire form.reset and
  // overwrite in-progress edits. We rebuild the form values inside the effect
  // using the freshest data the queries have at firing time.
  const lastHydratedRef = useRef<string | null>(null);
  const categoriesData = categoriesQuery.data;
  const offersData = offersQuery.data;

  useEffect(() => {
    if (!open) {
      lastHydratedRef.current = null;
      return;
    }

    const hydrationKey = `${mode}:${product?.id ?? "new"}`;
    if (lastHydratedRef.current === hydrationKey) return;

    if (mode === "create" || !product) {
      form.reset(INITIAL_VALUES);
      setSlugLocked(false);
      setShowQuickFill(true);
      setShowAdvanced(false);
      setSavedProductId(null);
      lastHydratedRef.current = hydrationKey;
      return;
    }

    // Edit mode: wait until categoriesQuery and offersQuery have at least one
    // resolved snapshot before hydrating so we don't reset with placeholder
    // (empty) parent/subcategory/offer values and then reset again 200 ms
    // later — which is exactly what was wiping admin input mid-typing.
    if (!categoriesData || !offersData) return;

    const selectedCategory = categoriesData.find((c) => c.id === product.categoryId);
    const parentCategoryId = selectedCategory?.parentId || product.categoryId;
    const subcategoryId = selectedCategory?.parentId ? selectedCategory.id : "";
    const offer = offersData.rows[0];
    const offerValues = offer
      ? {
          merchantId: offer.merchantId,
          price: offer.price,
          oldPrice: offer.oldPrice ?? undefined,
          url: offer.url,
          stock: offer.stock,
          isActive: offer.isActive,
          sourceType: offer.sourceType as ProductSheetFormValues["offer"]["sourceType"],
        }
      : INITIAL_VALUES.offer;

    form.reset({
      name: product.name,
      slug: product.slug,
      brandId: product.brandId,
      parentCategoryId,
      subcategoryId,
      shortDescription: product.shortDescription,
      longDescription: product.longDescription,
      imageUrl: "",
      offer: offerValues,
      tags: product.tags.join(", "),
      technicalSpecsText: specsToText(product.technicalSpecs),
      sku: product.sku || "",
      ean: product.ean || "",
      material: product.material || "",
      color: product.color || "",
      style: product.style || "",
      dimensions: product.dimensions || "",
      weight: product.weight || "",
      rating: product.rating,
      reviewCount: product.reviewCount,
      isActive: product.isActive,
      featured: product.featured,
      teamRecommended: product.teamRecommended,
      editorialPriority: product.editorialPriority,
    });
    setSlugLocked(true);
    setShowQuickFill(false);
    setShowAdvanced(false);
    setSavedProductId(product.id);
    lastHydratedRef.current = hydrationKey;
  }, [open, mode, product, categoriesData, offersData, form]);

  const watchedName = form.watch("name");
  useEffect(() => {
    if (slugLocked) return;
    form.setValue("slug", slugify(watchedName), { shouldValidate: false });
  }, [watchedName, slugLocked, form]);

  const watchedParentCategory = form.watch("parentCategoryId");
  const parentCategoryOptions = useMemo(
    () => (categoriesData || []).filter((c) => !c.parentId).map((c) => ({ value: c.id, label: c.name })),
    [categoriesData],
  );
  const subcategoryOptions = useMemo(
    () =>
      (categoriesData || [])
        .filter((c) => c.parentId === watchedParentCategory)
        .map((c) => ({ value: c.id, label: c.name })),
    [categoriesData, watchedParentCategory],
  );
  const brandOptions = useMemo(
    () => (brandsQuery.data || []).map((b) => ({ value: b.id, label: b.name })),
    [brandsQuery.data],
  );
  const merchantOptions = useMemo(
    () =>
      (merchantsQuery.data || []).map((m) => ({
        value: m.id,
        label: m.name,
        sublabel: m.domain,
      })),
    [merchantsQuery.data],
  );

  const handleCreateBrand = async (name: string) => {
    const created = await upsertBrand({ name, isActive: true });
    await queryClient.invalidateQueries({ queryKey: ["admin-brands"], refetchType: "active" });
    return created.id;
  };

  const handleCreateMerchant = async (name: string) => {
    const created = await upsertMerchant({ name, isActive: true });
    await queryClient.invalidateQueries({ queryKey: ["admin-merchants"], refetchType: "active" });
    return created.id;
  };

  const handleCreateParentCategory = async (name: string) => {
    const created = await upsertCategory({ name, isActive: true });
    await queryClient.invalidateQueries({ queryKey: ["admin-categories"], refetchType: "active" });
    return created.id;
  };

  const handleCreateSubcategory = async (name: string) => {
    if (!watchedParentCategory) {
      throw new Error("Selecciona primero una categoría padre");
    }
    const created = await upsertCategory({ name, parentId: watchedParentCategory, isActive: true });
    await queryClient.invalidateQueries({ queryKey: ["admin-categories"], refetchType: "active" });
    return created.id;
  };

  const saveMutation = useMutation({
    mutationFn: upsertProductWithOffer,
    onSuccess: async ({ productId }) => {
      await queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      await queryClient.invalidateQueries({ queryKey: ["admin-product-images", productId] });
      toast.success(mode === "create" ? "Producto creado" : "Producto actualizado");
      onSaved?.(productId);
      onOpenChange(false);
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "No se pudo guardar el producto");
    },
  });

  const onSubmit = form.handleSubmit((values) => {
    const categoryId = values.subcategoryId || values.parentCategoryId;
    saveMutation.mutate({
      productId: mode === "edit" ? product?.id : undefined,
      name: values.name,
      slug: values.slug,
      brandId: values.brandId,
      categoryId,
      shortDescription: values.shortDescription,
      longDescription: values.longDescription,
      tags: (values.tags || "")
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      technicalSpecs: parseSpecsText(values.technicalSpecsText || ""),
      sku: values.sku || undefined,
      ean: values.ean || undefined,
      material: values.material || undefined,
      color: values.color || undefined,
      style: values.style || undefined,
      dimensions: values.dimensions || undefined,
      weight: values.weight || undefined,
      rating: values.rating,
      reviewCount: values.reviewCount,
      isActive: values.isActive,
      featured: values.featured,
      teamRecommended: values.teamRecommended,
      editorialPriority: values.editorialPriority,
      primaryImageUrl: values.imageUrl?.trim() || undefined,
      offer: {
        merchantId: values.offer.merchantId,
        price: values.offer.price,
        oldPrice: values.offer.oldPrice,
        url: values.offer.url,
        stock: values.offer.stock,
        isActive: values.offer.isActive,
        sourceType: values.offer.sourceType,
      },
    });
  });

  const handleQuickFilled = (result: QuickFillResult) => {
    const current = form.getValues();
    if (result.name) {
      form.setValue("name", result.name);
      if (!slugLocked) form.setValue("slug", slugify(result.name));
    }
    if (result.image) form.setValue("imageUrl", result.image);
    if (result.description) {
      if (!current.shortDescription) form.setValue("shortDescription", result.description.slice(0, 280));
      if (!current.longDescription) form.setValue("longDescription", result.description);
    }
    if (result.price !== null) {
      form.setValue("offer.price", result.price);
    }
    if (result.merchantId) form.setValue("offer.merchantId", result.merchantId);
    if (result.sourceUrl) form.setValue("offer.url", result.sourceUrl);
    if (result.brandGuess && !current.brandId) {
      const match = brandOptions.find((b) => b.label.toLowerCase() === result.brandGuess?.toLowerCase());
      if (match) form.setValue("brandId", match.value);
    }
    setShowQuickFill(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="flex w-full flex-col gap-0 p-0 sm:max-w-2xl"
      >
        <SheetHeader className="border-b px-6 py-4">
          <SheetTitle>{mode === "create" ? "Nuevo producto" : `Editar ${product?.name ?? "producto"}`}</SheetTitle>
          <SheetDescription>
            {mode === "create"
              ? "Pega una URL para rellenar campos o introduce los datos manualmente."
              : "Edita los datos del producto y su oferta principal."}
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={onSubmit} className="flex flex-1 flex-col overflow-hidden">
          <div className="flex-1 space-y-5 overflow-y-auto px-6 py-5">
            {showQuickFill ? (
              <QuickFillCard onFilled={handleQuickFilled} />
            ) : (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="w-fit"
                onClick={() => setShowQuickFill(true)}
              >
                <Sparkles className="mr-2 h-4 w-4" />
                Rellenar desde URL otra vez
              </Button>
            )}

            <section className="space-y-4">
              <h3 className="text-sm font-semibold">Datos esenciales</h3>
              <div className="grid gap-3 sm:grid-cols-2">
                <FieldRow label="Nombre" error={form.formState.errors.name?.message}>
                  <Input {...form.register("name")} placeholder="Outsunny Conjunto 5 piezas" />
                </FieldRow>
                <FieldRow label="Slug" error={form.formState.errors.slug?.message}>
                  <Input
                    {...form.register("slug")}
                    onChange={(event) => {
                      setSlugLocked(true);
                      form.setValue("slug", event.target.value, { shouldValidate: true });
                    }}
                    placeholder="outsunny-conjunto-5-piezas"
                  />
                </FieldRow>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <FieldRow label="Marca" error={form.formState.errors.brandId?.message}>
                  <Controller
                    control={form.control}
                    name="brandId"
                    render={({ field }) => (
                      <InlineCreateCombobox
                        value={field.value}
                        onValueChange={field.onChange}
                        options={brandOptions}
                        placeholder="Selecciona o crea una marca"
                        searchPlaceholder="Buscar marca..."
                        emptyText="Sin marcas. Escribe para crear una."
                        onCreate={handleCreateBrand}
                        loading={brandsQuery.isLoading}
                      />
                    )}
                  />
                </FieldRow>
                <FieldRow
                  label="Categoría principal"
                  error={form.formState.errors.parentCategoryId?.message}
                >
                  <Controller
                    control={form.control}
                    name="parentCategoryId"
                    render={({ field }) => (
                      <InlineCreateCombobox
                        value={field.value}
                        onValueChange={(v) => {
                          field.onChange(v);
                          form.setValue("subcategoryId", "");
                        }}
                        options={parentCategoryOptions}
                        placeholder="Selecciona o crea"
                        searchPlaceholder="Buscar categoría..."
                        emptyText="Sin categorías. Escribe para crear una."
                        onCreate={handleCreateParentCategory}
                        loading={categoriesQuery.isLoading}
                      />
                    )}
                  />
                </FieldRow>
              </div>

              <FieldRow label="Subcategoría (opcional)">
                <Controller
                  control={form.control}
                  name="subcategoryId"
                  render={({ field }) => (
                    <InlineCreateCombobox
                      value={field.value || ""}
                      onValueChange={field.onChange}
                      options={subcategoryOptions}
                      placeholder={
                        watchedParentCategory ? "Selecciona o crea subcategoría" : "Selecciona primero categoría"
                      }
                      searchPlaceholder="Buscar subcategoría..."
                      emptyText="Sin subcategorías. Escribe para crear una."
                      onCreate={handleCreateSubcategory}
                      disabled={!watchedParentCategory}
                      loading={categoriesQuery.isLoading}
                    />
                  )}
                />
              </FieldRow>

              <FieldRow
                label="Descripción corta"
                error={form.formState.errors.shortDescription?.message}
                hint="Aparece en listados y tarjetas."
              >
                <Textarea
                  {...form.register("shortDescription")}
                  rows={3}
                  placeholder="Conjunto de mesa y 4 sillas..."
                />
              </FieldRow>
              <FieldRow
                label="Descripción larga"
                error={form.formState.errors.longDescription?.message}
                hint="Texto editorial completo en la ficha de producto."
              >
                <Textarea {...form.register("longDescription")} rows={5} />
              </FieldRow>

              <FieldRow label="Imagen principal (URL)" hint="Pega una URL o usa el gestor de imágenes abajo.">
                <Input
                  {...form.register("imageUrl")}
                  placeholder="https://..."
                  type="url"
                />
              </FieldRow>
            </section>

            <section className="rounded-lg border bg-muted/30 p-4">
              <h3 className="mb-3 text-sm font-semibold">Oferta inicial</h3>
              <div className="grid gap-3 sm:grid-cols-2">
                <FieldRow label="Tienda" error={form.formState.errors.offer?.merchantId?.message}>
                  <Controller
                    control={form.control}
                    name="offer.merchantId"
                    render={({ field }) => (
                      <InlineCreateCombobox
                        value={field.value}
                        onValueChange={field.onChange}
                        options={merchantOptions}
                        placeholder="Selecciona o crea una tienda"
                        searchPlaceholder="Buscar tienda..."
                        emptyText="Sin tiendas. Escribe para crear una."
                        onCreate={handleCreateMerchant}
                        loading={merchantsQuery.isLoading}
                      />
                    )}
                  />
                </FieldRow>
                <FieldRow label="Tipo de fuente">
                  <Controller
                    control={form.control}
                    name="offer.sourceType"
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="manual">Manual</SelectItem>
                          <SelectItem value="feed">Feed</SelectItem>
                          <SelectItem value="api">API</SelectItem>
                          <SelectItem value="future_auto">Futuro / auto</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                </FieldRow>
              </div>

              <div className="mt-3 grid gap-3 sm:grid-cols-3">
                <FieldRow label="Precio (€)" error={form.formState.errors.offer?.price?.message}>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    {...form.register("offer.price", {
                      setValueAs: (v: unknown) => numberFromInput(v, 0),
                    })}
                  />
                </FieldRow>
                <FieldRow label="Precio anterior (€)">
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    {...form.register("offer.oldPrice", {
                      valueAsNumber: true,
                      setValueAs: (v: unknown) => {
                        if (v === "" || v === null || v === undefined) return undefined;
                        const n = Number(v);
                        return Number.isFinite(n) && n > 0 ? n : undefined;
                      },
                    })}
                  />
                </FieldRow>
                <FieldRow label="Stock">
                  <Controller
                    control={form.control}
                    name="offer.stock"
                    render={({ field }) => (
                      <SwitchRow checked={field.value} onCheckedChange={field.onChange} label="En stock" />
                    )}
                  />
                </FieldRow>
              </div>

              <div className="mt-3">
                <FieldRow label="URL de la oferta" error={form.formState.errors.offer?.url?.message}>
                  <Input {...form.register("offer.url")} placeholder="https://www.amazon.es/dp/..." />
                </FieldRow>
              </div>

              <div className="mt-3">
                <Controller
                  control={form.control}
                  name="offer.isActive"
                  render={({ field }) => (
                    <SwitchRow
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      label="Oferta activa"
                      description="Solo las ofertas activas se muestran en el front."
                    />
                  )}
                />
              </div>

              {mode === "edit" && offerCount > 1 ? (
                <p className="mt-2 text-xs text-muted-foreground">
                  Este producto tiene {offerCount} ofertas. Edita las demás en{" "}
                  <a className="underline" href="/admin/offers">
                    /admin/offers
                  </a>
                  .
                </p>
              ) : null}
            </section>

            <ProductImageManager productId={savedProductId} />

            <Collapsible open={showAdvanced} onOpenChange={setShowAdvanced}>
              <CollapsibleTrigger asChild>
                <Button type="button" variant="ghost" size="sm" className="w-fit">
                  <ChevronDown
                    className={`mr-2 h-4 w-4 transition-transform ${showAdvanced ? "rotate-180" : ""}`}
                  />
                  Más detalles
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-4 pt-3">
                <div className="grid gap-3 sm:grid-cols-2">
                  <FieldRow label="SKU">
                    <Input {...form.register("sku")} />
                  </FieldRow>
                  <FieldRow label="EAN">
                    <Input {...form.register("ean")} />
                  </FieldRow>
                  <FieldRow label="Material">
                    <Input {...form.register("material")} />
                  </FieldRow>
                  <FieldRow label="Color">
                    <Input {...form.register("color")} />
                  </FieldRow>
                  <FieldRow label="Estilo">
                    <Input {...form.register("style")} />
                  </FieldRow>
                  <FieldRow label="Dimensiones">
                    <Input {...form.register("dimensions")} placeholder="140 x 80 x 74 cm" />
                  </FieldRow>
                  <FieldRow label="Peso">
                    <Input {...form.register("weight")} placeholder="12 kg" />
                  </FieldRow>
                  <FieldRow label="Tags (separados por coma)">
                    <Input {...form.register("tags")} placeholder="aluminio, terraza, 4 plazas" />
                  </FieldRow>
                  <FieldRow label="Rating (0-5)">
                    <Input
                      type="number"
                      step="0.1"
                      min="0"
                      max="5"
                      {...form.register("rating", {
                        setValueAs: (v: unknown) => numberFromInput(v, undefined),
                      })}
                    />
                  </FieldRow>
                  <FieldRow label="Nº reseñas">
                    <Input
                      type="number"
                      min="0"
                      {...form.register("reviewCount", {
                        setValueAs: (v: unknown) => numberFromInput(v, undefined),
                      })}
                    />
                  </FieldRow>
                </div>

                <FieldRow label="Especificaciones técnicas (una por línea, formato &quot;Etiqueta: valor&quot;)">
                  <Textarea
                    {...form.register("technicalSpecsText")}
                    rows={4}
                    placeholder={"Material: Aluminio\nDimensiones: 140 x 80 cm\nGarantía: 2 años"}
                  />
                </FieldRow>

                <div className="grid gap-3 sm:grid-cols-2">
                  <Controller
                    control={form.control}
                    name="isActive"
                    render={({ field }) => (
                      <SwitchRow checked={field.value} onCheckedChange={field.onChange} label="Producto activo" />
                    )}
                  />
                  <Controller
                    control={form.control}
                    name="featured"
                    render={({ field }) => (
                      <SwitchRow checked={field.value} onCheckedChange={field.onChange} label="Destacado" />
                    )}
                  />
                  <Controller
                    control={form.control}
                    name="teamRecommended"
                    render={({ field }) => (
                      <SwitchRow
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        label="Recomendado por el equipo"
                      />
                    )}
                  />
                  <FieldRow label="Prioridad editorial (0-100)">
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      step="1"
                      {...form.register("editorialPriority", {
                        setValueAs: (v: unknown) => numberFromInput(v, 0) ?? 0,
                      })}
                    />
                  </FieldRow>
                </div>
              </CollapsibleContent>
            </Collapsible>
          </div>

          <div className="flex items-center justify-end gap-2 border-t bg-background px-6 py-4">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={saveMutation.isPending}>
              {saveMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Guardando...
                </>
              ) : mode === "create" ? (
                "Crear producto"
              ) : (
                "Guardar cambios"
              )}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}

interface FieldRowProps {
  label: string;
  error?: string;
  hint?: string;
  children: React.ReactNode;
}

function FieldRow({ label, error, hint, children }: FieldRowProps) {
  return (
    <div className="space-y-1">
      <Label className="text-xs font-medium text-foreground/80">{label}</Label>
      {children}
      {hint && !error ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </div>
  );
}

interface SwitchRowProps {
  checked: boolean;
  onCheckedChange: (value: boolean) => void;
  label: string;
  description?: string;
}

function SwitchRow({ checked, onCheckedChange, label, description }: SwitchRowProps) {
  return (
    <div className="flex items-start justify-between gap-3 rounded-md border bg-background px-3 py-2">
      <div>
        <p className="text-sm font-medium">{label}</p>
        {description ? <p className="text-xs text-muted-foreground">{description}</p> : null}
      </div>
      <Switch checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  );
}
