"use client";

import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, Loader2, Plus, Sparkles, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { AdminPageHeader } from "@/admin/components/AdminPageHeader";
import { listBrands, listCategories } from "@/admin/services/adminCatalogService";
import {
  approveCandidate,
  findSimilarAmazon,
  getAmazonByAsin,
  listCandidates,
  queueCandidate,
  rejectCandidate,
  searchAmazon,
  type AmazonCandidateRecord,
  type AmazonSearchResult,
} from "@/admin/services/adminAmazonService";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SearchableSelect } from "@/components/ui/searchable-select";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";

function priceLabel(value: number | null, currency = "EUR") {
  if (value == null) return "—";
  return new Intl.NumberFormat("es-ES", { style: "currency", currency }).format(value);
}

// ─── Search result card ───────────────────────────────────────────────────

function ResultCard({
  result,
  onQueue,
  onSimilar,
  busy,
}: {
  result: AmazonSearchResult;
  onQueue: (r: AmazonSearchResult) => void;
  onSimilar: (asin: string) => void;
  busy: boolean;
}) {
  const disabled = result.inCatalog || result.queued || busy;
  return (
    <div className="flex gap-3 rounded-lg border p-3">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={result.primaryImageUrl ?? "/placeholder.svg"}
        alt={result.name}
        className="h-20 w-20 shrink-0 rounded object-contain"
        loading="lazy"
      />
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <p className="line-clamp-2 text-sm font-medium">{result.name}</p>
        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <span className="font-mono">{result.asin}</span>
          {result.brandName ? <span>· {result.brandName}</span> : null}
          <span className="font-semibold text-foreground">
            {priceLabel(result.offer.price, result.offer.currency)}
          </span>
          {result.offer.dealBadge ? <Badge variant="secondary">{result.offer.dealBadge}</Badge> : null}
          {!result.offer.inStock ? <Badge variant="destructive">Sin stock</Badge> : null}
          {result.inCatalog ? <Badge>En catálogo</Badge> : null}
          {result.queued && !result.inCatalog ? <Badge variant="outline">En cola</Badge> : null}
        </div>
        <div className="mt-1 flex gap-2">
          <Button size="sm" variant="outline" disabled={disabled} onClick={() => onQueue(result)}>
            <Plus className="mr-1 h-3.5 w-3.5" /> Añadir a la cola
          </Button>
          <Button size="sm" variant="ghost" onClick={() => onSimilar(result.asin)}>
            <Sparkles className="mr-1 h-3.5 w-3.5" /> Similares
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Search tab ────────────────────────────────────────────────────────────

function SearchTab() {
  const queryClient = useQueryClient();
  const [keywords, setKeywords] = useState("");
  const [brand, setBrand] = useState("");
  const [sortBy, setSortBy] = useState("Relevance");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [results, setResults] = useState<AmazonSearchResult[]>([]);

  const search = useMutation({
    mutationFn: () =>
      searchAmazon({
        keywords: keywords || undefined,
        brand: brand || undefined,
        sortBy: sortBy as never,
        // Amazon expects the lowest denomination (cents).
        minPrice: minPrice ? Math.round(Number(minPrice) * 100) : undefined,
        maxPrice: maxPrice ? Math.round(Number(maxPrice) * 100) : undefined,
        itemCount: 10,
      }),
    onSuccess: (data) => {
      setResults(data.results);
      if (data.results.length === 0) toast.info("Sin resultados");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const similar = useMutation({
    mutationFn: (asin: string) => findSimilarAmazon(asin),
    onSuccess: (data) => {
      setResults(data);
      toast.success(`${data.length} productos similares`);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const queue = useMutation({
    mutationFn: (r: AmazonSearchResult) => queueCandidate(r, keywords || "search"),
    onSuccess: (_d, r) => {
      setResults((prev) => prev.map((x) => (x.asin === r.asin ? { ...x, queued: true } : x)));
      queryClient.invalidateQueries({ queryKey: ["amazon-candidates"] });
      toast.success("Añadido a la cola de aprobación");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const busy = search.isPending || similar.isPending;

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="lg:col-span-2">
          <Label htmlFor="kw">Palabras clave</Label>
          <Input
            id="kw"
            value={keywords}
            onChange={(e) => setKeywords(e.target.value)}
            placeholder="freidora de aire, robot aspirador…"
            onKeyDown={(e) => e.key === "Enter" && search.mutate()}
          />
        </div>
        <div>
          <Label htmlFor="brand">Marca</Label>
          <Input id="brand" value={brand} onChange={(e) => setBrand(e.target.value)} placeholder="Cecotec" />
        </div>
        <div>
          <Label>Ordenar por</Label>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Relevance">Relevancia</SelectItem>
              <SelectItem value="Price:LowToHigh">Precio ↑</SelectItem>
              <SelectItem value="Price:HighToLow">Precio ↓</SelectItem>
              <SelectItem value="AvgCustomerReviews">Valoraciones</SelectItem>
              <SelectItem value="NewestArrivals">Novedades</SelectItem>
              <SelectItem value="Featured">Destacados</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="min">Precio mín. (€)</Label>
          <Input id="min" type="number" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} />
        </div>
        <div>
          <Label htmlFor="max">Precio máx. (€)</Label>
          <Input id="max" type="number" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} />
        </div>
        <div className="flex items-end">
          <Button onClick={() => search.mutate()} disabled={busy} className="w-full">
            {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Buscar
          </Button>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {results.map((r) => (
          <ResultCard
            key={r.asin}
            result={r}
            busy={queue.isPending}
            onQueue={(x) => queue.mutate(x)}
            onSimilar={(asin) => similar.mutate(asin)}
          />
        ))}
      </div>
    </div>
  );
}

// ─── By-ASIN tab ───────────────────────────────────────────────────────────

function AsinTab() {
  const queryClient = useQueryClient();
  const [raw, setRaw] = useState("");
  const [results, setResults] = useState<AmazonSearchResult[]>([]);

  const lookup = useMutation({
    mutationFn: () => getAmazonByAsin(raw.split(/[\s,]+/).filter(Boolean)),
    onSuccess: (data) => {
      setResults(data);
      if (data.length === 0) toast.info("Sin resultados");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const queue = useMutation({
    mutationFn: (r: AmazonSearchResult) => queueCandidate(r, "asin"),
    onSuccess: (_d, r) => {
      setResults((prev) => prev.map((x) => (x.asin === r.asin ? { ...x, queued: true } : x)));
      queryClient.invalidateQueries({ queryKey: ["amazon-candidates"] });
      toast.success("Añadido a la cola");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="asins">ASIN(s)</Label>
        <Textarea
          id="asins"
          value={raw}
          onChange={(e) => setRaw(e.target.value)}
          placeholder="B0DXFMCB2G, B09B2SBHQK…"
          rows={3}
        />
      </div>
      <Button onClick={() => lookup.mutate()} disabled={lookup.isPending}>
        {lookup.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
        Buscar por ASIN
      </Button>
      <div className="grid gap-3 md:grid-cols-2">
        {results.map((r) => (
          <ResultCard
            key={r.asin}
            result={r}
            busy={queue.isPending}
            onQueue={(x) => queue.mutate(x)}
            onSimilar={() => undefined}
          />
        ))}
      </div>
    </div>
  );
}

// ─── Approval queue tab ────────────────────────────────────────────────────

function QueueTab() {
  const queryClient = useQueryClient();
  const [reviewing, setReviewing] = useState<AmazonCandidateRecord | null>(null);
  const [rejecting, setRejecting] = useState<AmazonCandidateRecord | null>(null);

  const candidatesQuery = useQuery({
    queryKey: ["amazon-candidates"],
    queryFn: () => listCandidates("pending"),
  });

  const reject = useMutation({
    mutationFn: (id: string) => rejectCandidate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["amazon-candidates"] });
      toast.success("Candidato rechazado");
      setRejecting(null);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const candidates = candidatesQuery.data ?? [];

  return (
    <div className="space-y-3">
      {candidatesQuery.isLoading ? (
        <p className="text-sm text-muted-foreground">Cargando…</p>
      ) : candidates.length === 0 ? (
        <p className="text-sm text-muted-foreground">No hay candidatos pendientes.</p>
      ) : (
        candidates.map((c) => (
          <div key={c.id} className="flex items-center gap-3 rounded-lg border p-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={c.primaryImageUrl ?? "/placeholder.svg"}
              alt={c.name}
              className="h-14 w-14 shrink-0 rounded object-contain"
              loading="lazy"
            />
            <div className="min-w-0 flex-1">
              <p className="line-clamp-1 text-sm font-medium">{c.name}</p>
              <p className="text-xs text-muted-foreground">
                <span className="font-mono">{c.asin}</span>
                {c.brandName ? ` · ${c.brandName}` : ""} · {priceLabel(c.price, c.currency)}
              </p>
            </div>
            <Button size="sm" onClick={() => setReviewing(c)}>
              Revisar
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setRejecting(c)}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))
      )}

      <ReviewSheet
        candidate={reviewing}
        onClose={() => setReviewing(null)}
        onApproved={() => {
          setReviewing(null);
          queryClient.invalidateQueries({ queryKey: ["amazon-candidates"] });
        }}
      />

      <AlertDialog open={Boolean(rejecting)} onOpenChange={(o) => !o && setRejecting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Rechazar candidato?</AlertDialogTitle>
            <AlertDialogDescription>
              {rejecting?.name} ({rejecting?.asin}) no se publicará. Podrás volver a añadirlo más tarde.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={() => rejecting && reject.mutate(rejecting.id)}>
              Rechazar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// ─── Review & publish sheet ────────────────────────────────────────────────

function ReviewSheet({
  candidate,
  onClose,
  onApproved,
}: {
  candidate: AmazonCandidateRecord | null;
  onClose: () => void;
  onApproved: () => void;
}) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [brandId, setBrandId] = useState("");

  const brandsQuery = useQuery({ queryKey: ["admin-brands"], queryFn: listBrands });
  const categoriesQuery = useQuery({ queryKey: ["admin-categories"], queryFn: listCategories });

  // Sync form when a new candidate opens.
  useEffect(() => {
    if (candidate) {
      setName(candidate.name);
      setDescription("");
      setCategoryId("");
      setBrandId("");
    }
  }, [candidate]);

  const categoryOptions = useMemo(
    () =>
      (categoriesQuery.data ?? []).map((c) => ({
        value: c.id,
        label: c.parentName ? `${c.parentName} › ${c.name}` : c.name,
      })),
    [categoriesQuery.data],
  );

  const approve = useMutation({
    mutationFn: () =>
      approveCandidate({
        id: candidate!.id,
        categoryId,
        brandId: brandId || undefined,
        name: name || undefined,
        description: description || undefined,
      }),
    onSuccess: () => {
      toast.success("Producto publicado en el catálogo");
      onApproved();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <Sheet open={Boolean(candidate)} onOpenChange={(o) => !o && onClose()}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>Revisar y publicar</SheetTitle>
          <SheetDescription>
            Asigna marca y categoría antes de publicar. ASIN <span className="font-mono">{candidate?.asin}</span>.
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-4 py-4">
          <div>
            <Label htmlFor="r-name">Nombre</Label>
            <Input id="r-name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="r-desc">Descripción (opcional)</Label>
            <Textarea
              id="r-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Se usará la descripción generada si lo dejas vacío."
            />
          </div>
          <div>
            <Label>Marca</Label>
            <SearchableSelect
              value={brandId}
              onValueChange={setBrandId}
              options={(brandsQuery.data ?? []).map((b) => ({ value: b.id, label: b.name }))}
              placeholder={candidate?.brandName ? `Auto: ${candidate.brandName}` : "Selecciona o deja en auto"}
              loading={brandsQuery.isLoading}
            />
            <p className="mt-1 text-xs text-muted-foreground">
              Si lo dejas vacío se usará/creará «{candidate?.brandName ?? "Genérico"}».
            </p>
          </div>
          <div>
            <Label>Categoría (obligatoria)</Label>
            <SearchableSelect
              value={categoryId}
              onValueChange={setCategoryId}
              options={categoryOptions}
              placeholder="Selecciona una categoría"
              loading={categoriesQuery.isLoading}
            />
          </div>
        </div>

        <SheetFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button disabled={!categoryId || approve.isPending} onClick={() => approve.mutate()}>
            {approve.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Check className="mr-2 h-4 w-4" />
            )}
            Aprobar y publicar
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────

export default function AdminAmazonPage() {
  return (
    <div>
      <AdminPageHeader
        title="Amazon"
        description="Busca productos en Amazon, añádelos a la cola y publícalos tras revisión."
      />
      <Tabs defaultValue="search">
        <TabsList>
          <TabsTrigger value="search">Buscar</TabsTrigger>
          <TabsTrigger value="asin">Por ASIN</TabsTrigger>
          <TabsTrigger value="queue">Cola de aprobación</TabsTrigger>
        </TabsList>
        <TabsContent value="search" className="mt-4">
          <SearchTab />
        </TabsContent>
        <TabsContent value="asin" className="mt-4">
          <AsinTab />
        </TabsContent>
        <TabsContent value="queue" className="mt-4">
          <QueueTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
