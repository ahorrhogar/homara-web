"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowDown, ArrowUp, Upload } from "lucide-react";
import { toast } from "sonner";

import {
  addProductImage,
  deleteProductImage,
  listProductImages,
  reorderProductImages,
  setPrimaryProductImage,
  uploadProductImage,
} from "@/admin/services/adminCatalogService";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { applyProductImageFallback, PRODUCT_IMAGE_FALLBACK } from "@/lib/productImage";

function shortenSegment(value: string, max: number): string {
  if (value.length <= max) return value;
  return `${value.slice(0, max - 1)}…`;
}

function formatCompactImageUrl(rawUrl: string): string {
  const normalized = rawUrl.trim();
  if (!normalized) return "URL de imagen";
  try {
    const parsed = new URL(normalized);
    const host = shortenSegment(parsed.hostname.replace(/^www\./, ""), 22);
    const pathSegments = parsed.pathname.split("/").filter(Boolean);
    const fileName =
      pathSegments.length > 0 ? shortenSegment(pathSegments[pathSegments.length - 1], 24) : "imagen";
    return `${host}/.../${fileName}`;
  } catch {
    return shortenSegment(normalized, 34);
  }
}

export interface ProductImageManagerProps {
  productId: string | null;
}

export function ProductImageManager({ productId }: ProductImageManagerProps) {
  const queryClient = useQueryClient();
  const [newImageUrl, setNewImageUrl] = useState("");
  const [uploadFiles, setUploadFiles] = useState<File[]>([]);
  const [uploadInputKey, setUploadInputKey] = useState(0);

  const enabled = Boolean(productId);

  const imagesQuery = useQuery({
    queryKey: ["admin-product-images", productId],
    queryFn: () => listProductImages(productId as string),
    enabled,
  });

  const invalidate = async () => {
    await queryClient.invalidateQueries({ queryKey: ["admin-product-images", productId] });
    await queryClient.invalidateQueries({ queryKey: ["admin-products"] });
  };

  const addImageUrlMutation = useMutation({
    mutationFn: (params: { productId: string; url: string }) =>
      addProductImage(params.productId, params.url, false),
    onSuccess: async () => {
      await invalidate();
      setNewImageUrl("");
      toast.success("Imagen agregada");
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "No se pudo agregar imagen");
    },
  });

  const uploadImageMutation = useMutation({
    mutationFn: async (params: { productId: string; files: File[] }) => {
      for (const file of params.files) {
        await uploadProductImage(params.productId, file, false);
      }
      return params.files.length;
    },
    onSuccess: async (uploadedCount) => {
      await invalidate();
      setUploadFiles([]);
      setUploadInputKey((prev) => prev + 1);
      toast.success(uploadedCount > 1 ? `${uploadedCount} imágenes subidas` : "Imagen subida");
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "No se pudo subir imagen");
    },
  });

  const setPrimaryMutation = useMutation({
    mutationFn: (params: { productId: string; imageId: string }) =>
      setPrimaryProductImage(params.productId, params.imageId),
    onSuccess: async () => {
      await invalidate();
      toast.success("Imagen principal actualizada");
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "No se pudo actualizar imagen principal");
    },
  });

  const reorderImagesMutation = useMutation({
    mutationFn: (params: { productId: string; imageIdsInOrder: string[] }) =>
      reorderProductImages(params.productId, params.imageIdsInOrder),
    onSuccess: async () => {
      await invalidate();
      toast.success("Orden de imágenes actualizado");
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "No se pudo actualizar el orden");
    },
  });

  const deleteImageMutation = useMutation({
    mutationFn: deleteProductImage,
    onSuccess: async () => {
      await invalidate();
      toast.success("Imagen eliminada");
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "No se pudo eliminar la imagen");
    },
  });

  const images = imagesQuery.data || [];
  const isPending =
    addImageUrlMutation.isPending ||
    uploadImageMutation.isPending ||
    reorderImagesMutation.isPending ||
    setPrimaryMutation.isPending ||
    deleteImageMutation.isPending;

  const handleAddUrl = () => {
    if (!productId) return;
    const trimmed = newImageUrl.trim();
    if (!trimmed) {
      toast.error("Pega una URL válida");
      return;
    }
    addImageUrlMutation.mutate({ productId, url: trimmed });
  };

  const handleUpload = () => {
    if (!productId || uploadFiles.length === 0) return;
    uploadImageMutation.mutate({ productId, files: uploadFiles });
  };

  const moveImageOrder = (imageId: string, direction: "up" | "down") => {
    if (!productId) return;
    const currentIndex = images.findIndex((image) => image.id === imageId);
    if (currentIndex < 0) return;
    const targetIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= images.length) return;
    const reordered = [...images];
    const [movedImage] = reordered.splice(currentIndex, 1);
    if (!movedImage) return;
    reordered.splice(targetIndex, 0, movedImage);
    reorderImagesMutation.mutate({
      productId,
      imageIdsInOrder: reordered.map((image) => image.id),
    });
  };

  return (
    <div className="space-y-3 overflow-hidden rounded-lg border border-border p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">Imágenes del producto</h3>
        <p className="text-xs text-muted-foreground">{images.length} imágenes</p>
      </div>

      {!enabled ? (
        <p className="rounded-md bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
          Guarda el producto primero para añadir o reordenar imágenes adicionales.
        </p>
      ) : null}

      <div className="flex flex-col gap-2 md:flex-row">
        <Input
          className="min-w-0 flex-1"
          value={newImageUrl}
          onChange={(event) => setNewImageUrl(event.target.value)}
          onKeyDown={(event) => {
            if (event.key !== "Enter") return;
            event.preventDefault();
            handleAddUrl();
          }}
          placeholder="https://..."
          disabled={!enabled}
        />
        <Button
          type="button"
          variant="outline"
          onClick={handleAddUrl}
          className="md:shrink-0"
          disabled={!enabled || isPending}
        >
          Agregar URL
        </Button>
      </div>

      <div className="flex flex-col gap-2 md:flex-row">
        <Input
          key={uploadInputKey}
          className="min-w-0 flex-1"
          type="file"
          accept="image/*"
          multiple
          onChange={(event) => setUploadFiles(Array.from(event.target.files || []))}
          disabled={!enabled}
        />
        <Button
          type="button"
          variant="outline"
          className="md:shrink-0"
          disabled={!enabled || !uploadFiles.length || isPending}
          onClick={handleUpload}
        >
          <Upload className="mr-2 h-4 w-4" />
          {uploadImageMutation.isPending
            ? "Subiendo..."
            : uploadFiles.length > 1
              ? `Subir ${uploadFiles.length} archivos`
              : "Subir archivo"}
        </Button>
      </div>

      {uploadFiles.length > 0 ? (
        <p className="text-xs text-muted-foreground">
          {uploadFiles.length} archivo(s) seleccionado(s) para subir.
        </p>
      ) : null}

      <div className="space-y-2">
        {images.map((image, index) => (
          <div
            key={image.id}
            className="flex w-full flex-col gap-2 overflow-hidden rounded-md border border-border p-2 md:flex-row md:items-center"
          >
            <img
              src={image.url || PRODUCT_IMAGE_FALLBACK}
              alt="Producto"
              className="h-16 w-16 rounded bg-secondary/40 object-contain p-1"
              onError={(event) => applyProductImageFallback(event.currentTarget)}
            />
            <div className="min-w-0 flex-1 overflow-hidden">
              <p className="max-w-full truncate text-xs text-muted-foreground" title={image.url}>
                {formatCompactImageUrl(image.url)}
              </p>
              <div className="mt-1 flex flex-wrap items-center gap-1">
                <Badge variant="outline">Orden {index + 1}</Badge>
                {image.isPrimary ? <Badge>Principal</Badge> : null}
              </div>
            </div>
            <div className="flex flex-wrap gap-2 md:shrink-0 md:justify-end">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => moveImageOrder(image.id, "up")}
                disabled={index === 0 || isPending}
              >
                <ArrowUp className="mr-1 h-4 w-4" />
                Subir
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => moveImageOrder(image.id, "down")}
                disabled={index === images.length - 1 || isPending}
              >
                <ArrowDown className="mr-1 h-4 w-4" />
                Bajar
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  if (!productId) return;
                  setPrimaryMutation.mutate({ productId, imageId: image.id });
                }}
                disabled={isPending}
              >
                Principal
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => deleteImageMutation.mutate(image.id)}
                disabled={isPending}
              >
                Eliminar
              </Button>
            </div>
          </div>
        ))}

        {imagesQuery.isLoading ? (
          <p className="text-xs text-muted-foreground">Cargando imágenes...</p>
        ) : null}
        {enabled && !imagesQuery.isLoading && images.length === 0 ? (
          <p className="text-xs text-muted-foreground">No hay imágenes cargadas.</p>
        ) : null}
      </div>
    </div>
  );
}
