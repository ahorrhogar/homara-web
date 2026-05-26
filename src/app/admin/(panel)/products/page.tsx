"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Copy, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { AdminPageHeader } from "@/admin/components/AdminPageHeader";
import { BulkActionsBar } from "@/admin/components/BulkActionsBar";
import { ProductSheet } from "@/admin/components/ProductSheet";
import { useBulkSelection } from "@/admin/hooks/useBulkSelection";
import {
  deleteProduct,
  duplicateProduct,
  listBrands,
  listCategories,
  listProducts,
} from "@/admin/services/adminCatalogService";
import type { AdminProductRecord } from "@/admin/types";
import { exportRowsToExcel } from "@/admin/utils/excel";
import { formatCurrency, formatDate, formatNumber } from "@/admin/utils/format";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function AdminProductsPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [search, setSearch] = useState("");
  const [brandFilter, setBrandFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const [sheetOpen, setSheetOpen] = useState(false);
  const [sheetMode, setSheetMode] = useState<"create" | "edit">("create");
  const [editTarget, setEditTarget] = useState<AdminProductRecord | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AdminProductRecord | null>(null);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);

  const brandsQuery = useQuery({ queryKey: ["admin-brands"], queryFn: listBrands });
  const categoriesQuery = useQuery({ queryKey: ["admin-categories"], queryFn: listCategories });

  const productsQuery = useQuery({
    queryKey: ["admin-products", { page, pageSize, search, brandFilter, categoryFilter, statusFilter }],
    queryFn: () =>
      listProducts({
        page,
        pageSize,
        search,
        brandId: brandFilter === "all" ? undefined : brandFilter,
        categoryId: categoryFilter === "all" ? undefined : categoryFilter,
        isActive: statusFilter === "all" ? undefined : statusFilter === "active",
      }),
  });

  const duplicateMutation = useMutation({
    mutationFn: duplicateProduct,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      toast.success("Producto duplicado");
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "No se pudo duplicar el producto");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteProduct,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      toast.success("Producto eliminado");
      setDeleteTarget(null);
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "No se pudo eliminar el producto");
    },
  });

  const rows = productsQuery.data?.rows || [];
  const bulkSelection = useBulkSelection(rows);
  const total = productsQuery.data?.total || 0;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const brandOptions = useMemo(() => brandsQuery.data || [], [brandsQuery.data]);
  const allCategorySelectOptions = useMemo(
    () =>
      (categoriesQuery.data || []).map((category) => ({
        value: category.id,
        label: category.parentName ? `${category.parentName} / ${category.name}` : category.name,
      })),
    [categoriesQuery.data],
  );
  const categoryFilterOptions = useMemo(
    () => [{ value: "all", label: "Todas las categorías" }, ...allCategorySelectOptions],
    [allCategorySelectOptions],
  );

  const bulkDeleteMutation = useMutation({
    mutationFn: async (selectedRows: AdminProductRecord[]) => {
      for (const row of selectedRows) {
        await deleteProduct(row.id);
      }
      return selectedRows;
    },
    onSuccess: async (deletedRows) => {
      await queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      bulkSelection.clearSelection();
      setBulkDeleteOpen(false);
      toast.success(`${deletedRows.length} productos eliminados`);
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "No se pudieron eliminar los productos seleccionados");
    },
  });

  const openCreate = () => {
    setSheetMode("create");
    setEditTarget(null);
    setSheetOpen(true);
  };

  const openEdit = (product: AdminProductRecord) => {
    setSheetMode("edit");
    setEditTarget(product);
    setSheetOpen(true);
  };

  const onExportSelected = () => {
    try {
      exportRowsToExcel({
        rows: bulkSelection.selectedRows,
        columns: [
          { header: "Nombre", value: (row) => row.name, width: 32 },
          { header: "Slug", value: (row) => row.slug, width: 28 },
          { header: "Marca", value: (row) => row.brandName, width: 24 },
          { header: "Categoria", value: (row) => row.categoryName, width: 24 },
          { header: "Activo", value: (row) => (row.isActive ? "Si" : "No"), width: 12 },
          { header: "Ofertas", value: (row) => row.offerCount, width: 12 },
          { header: "Precio min", value: (row) => row.minPrice, width: 14 },
          { header: "Actualizado", value: (row) => formatDate(row.updatedAt), width: 20 },
        ],
        fileName: `productos_${new Date().toISOString().slice(0, 10)}`,
        sheetName: "Productos",
      });
      toast.success("Excel exportado correctamente");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo exportar el Excel");
    }
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Productos"
        description="CRUD de catálogo con control de metadata e imágenes."
        actionLabel="Nuevo producto"
        onAction={openCreate}
      />

      <div className="rounded-lg border border-border bg-card p-4">
        <div className="mb-4 grid grid-cols-1 gap-3 lg:grid-cols-5">
          <Input
            value={search}
            onChange={(event) => {
              setPage(1);
              setSearch(event.target.value);
            }}
            placeholder="Buscar producto..."
            className="lg:col-span-2"
          />

          <Select
            value={brandFilter}
            onValueChange={(value) => {
              setPage(1);
              setBrandFilter(value);
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Marca" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las marcas</SelectItem>
              {brandOptions.map((brand) => (
                <SelectItem key={brand.id} value={brand.id}>
                  {brand.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <SearchableSelect
            value={categoryFilter}
            onValueChange={(value) => {
              setPage(1);
              setCategoryFilter(value || "all");
            }}
            options={categoryFilterOptions}
            placeholder="Categoría"
            searchPlaceholder="Buscar categoría..."
            emptyText="Sin categorías"
            loading={categoriesQuery.isLoading}
          />

          <Select
            value={statusFilter}
            onValueChange={(value) => {
              setPage(1);
              setStatusFilter(value);
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="active">Activos</SelectItem>
              <SelectItem value="inactive">Inactivos</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {bulkSelection.selectedCount > 0 ? (
          <BulkActionsBar
            selectedCount={bulkSelection.selectedCount}
            onExport={onExportSelected}
            onDelete={() => setBulkDeleteOpen(true)}
            onClear={bulkSelection.clearSelection}
            isDeleting={bulkDeleteMutation.isPending}
          />
        ) : null}

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10">
                <Checkbox
                  checked={
                    bulkSelection.allSelected ? true : bulkSelection.someSelected ? "indeterminate" : false
                  }
                  onCheckedChange={(checked) => bulkSelection.setAllSelected(Boolean(checked))}
                  aria-label="Seleccionar todos"
                />
              </TableHead>
              <TableHead>Producto</TableHead>
              <TableHead>Marca</TableHead>
              <TableHead>Categoría</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Ofertas</TableHead>
              <TableHead>Precio min</TableHead>
              <TableHead>Actualizado</TableHead>
              <TableHead className="w-[160px] text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((product) => (
              <TableRow key={product.id}>
                <TableCell>
                  <Checkbox
                    checked={bulkSelection.isSelected(product.id)}
                    onCheckedChange={(checked) => bulkSelection.setRowSelected(product.id, Boolean(checked))}
                    aria-label={`Seleccionar ${product.name}`}
                  />
                </TableCell>
                <TableCell>
                  <div>
                    <p className="font-medium">{product.name}</p>
                    <p className="text-xs text-muted-foreground">{product.slug}</p>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {product.featured ? <Badge variant="outline">Destacado</Badge> : null}
                      {product.teamRecommended ? <Badge variant="outline">Equipo</Badge> : null}
                      {product.editorialPriority > 0 ? (
                        <Badge variant="outline">Prioridad {product.editorialPriority}</Badge>
                      ) : null}
                    </div>
                  </div>
                </TableCell>
                <TableCell>{product.brandName}</TableCell>
                <TableCell>{product.categoryName}</TableCell>
                <TableCell>
                  <Badge variant={product.isActive ? "default" : "secondary"}>
                    {product.isActive ? "Activo" : "Inactivo"}
                  </Badge>
                </TableCell>
                <TableCell>{formatNumber(product.offerCount)}</TableCell>
                <TableCell>{formatCurrency(product.minPrice)}</TableCell>
                <TableCell>{formatDate(product.updatedAt)}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(product)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => duplicateMutation.mutate(product.id)}>
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => setDeleteTarget(product)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}

            {!rows.length ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center text-muted-foreground">
                  No hay productos para los filtros seleccionados.
                </TableCell>
              </TableRow>
            ) : null}
          </TableBody>
        </Table>

        <div className="mt-4 flex items-center justify-between text-sm">
          <p className="text-muted-foreground">
            Mostrando {rows.length} de {formatNumber(total)} productos
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((prev) => Math.max(1, prev - 1))}
            >
              Anterior
            </Button>
            <span>
              Página {page} de {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
            >
              Siguiente
            </Button>
          </div>
        </div>
      </div>

      <ProductSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        mode={sheetMode}
        product={editTarget ?? undefined}
        onSaved={() => {
          void queryClient.invalidateQueries({ queryKey: ["admin-products"] });
        }}
      />

      <AlertDialog open={Boolean(deleteTarget)} onOpenChange={(open) => (!open ? setDeleteTarget(null) : null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar producto</AlertDialogTitle>
            <AlertDialogDescription>
              {`Se eliminará el producto ${deleteTarget?.name} y sus ofertas asociadas.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleteTarget) {
                  void deleteMutation.mutateAsync(deleteTarget.id);
                }
              }}
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={bulkDeleteOpen} onOpenChange={setBulkDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar productos seleccionados</AlertDialogTitle>
            <AlertDialogDescription>
              {`Se eliminarán ${bulkSelection.selectedCount} productos y sus ofertas asociadas. Esta acción no se puede deshacer.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                void bulkDeleteMutation.mutateAsync(bulkSelection.selectedRows);
              }}
            >
              Eliminar seleccionados
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
