// Pure CSV parsing + validation helpers. No I/O, no auth.
// Imported by both the server action (adminImportService.ts) and unit tests.
import Papa from "papaparse";

import type { ImportColumnMapping } from "@/admin/types";
import { parseAffiliateUrl } from "@/infrastructure/security/affiliateUrl";
import { sanitizeText } from "@/infrastructure/security/sanitize";

export const MAX_CSV_CHARS = 2_000_000;
export const MAX_IMPORT_ROWS = 10_000;
export const IMPORT_BATCH_SIZE = 100;

const DEFAULT_MAPPING: ImportColumnMapping = {
  productName: "product_name",
  brandName: "brand_name",
  categoryName: "category_name",
  subcategoryName: "subcategory_name",
  description: "description",
  longDescription: "long_description",
  price: "price",
  oldPrice: "old_price",
  merchantName: "merchant_name",
  offerUrl: "offer_url",
  stock: "stock",
  imageUrl: "image_url",
  sku: "sku",
  ean: "ean",
  tags: "tags",
};

export interface CsvPreviewResult {
  headers: string[];
  rows: Array<Record<string, string>>;
  totalRows: number;
  mapping: ImportColumnMapping;
}

export interface ImportPayloadRow {
  product_name: string;
  brand_name: string;
  category_name: string;
  subcategory_name: string;
  description: string;
  long_description: string;
  merchant_name: string;
  offer_url: string;
  image_url: string;
  price: number;
  old_price: number | null;
  stock: boolean;
  sku: string;
  ean: string;
  tags: string[];
}

export interface RowImportError {
  rowIndex: number;
  message: string;
}

export function assertCsvLimits(csvText: string, rowCount?: number): void {
  if (csvText.length > MAX_CSV_CHARS) {
    throw new Error("El CSV supera el limite permitido (2MB de texto)");
  }
  if (typeof rowCount === "number" && rowCount > MAX_IMPORT_ROWS) {
    throw new Error(`El CSV supera el limite de ${MAX_IMPORT_ROWS} filas por importacion`);
  }
}

function normalizeHeader(value: string): string {
  return sanitizeText(value.toLowerCase().replace(/\s+/g, "_"), 80);
}

export function parseCsv(csvText: string): Array<Record<string, string>> {
  const parsed = Papa.parse<Record<string, string>>(csvText, {
    header: true,
    skipEmptyLines: true,
    transformHeader: normalizeHeader,
  });

  if (parsed.errors.length) {
    throw new Error(`CSV invalido: ${parsed.errors[0].message}`);
  }

  return parsed.data.map((row) => {
    const next: Record<string, string> = {};
    for (const [key, value] of Object.entries(row)) {
      if (!key) continue;
      next[key] = typeof value === "string" ? value.trim() : String(value ?? "");
    }
    return next;
  });
}

export function inferMapping(headers: string[]): ImportColumnMapping {
  const normalized = headers.map((h) => normalizeHeader(h));
  const pick = (candidates: string[], fallback: string): string => {
    const found = candidates.find((c) => normalized.includes(c));
    return found || fallback;
  };

  return {
    productName: pick(["product_name", "name", "producto", "titulo"], DEFAULT_MAPPING.productName),
    brandName: pick(["brand_name", "marca", "brand"], DEFAULT_MAPPING.brandName),
    categoryName: pick(["category_name", "categoria", "category"], DEFAULT_MAPPING.categoryName),
    subcategoryName: pick(["subcategory_name", "subcategoria", "sub_category"], DEFAULT_MAPPING.subcategoryName),
    description: pick(["description", "descripcion", "short_description"], DEFAULT_MAPPING.description),
    longDescription: pick(["long_description", "descripcion_larga", "details"], DEFAULT_MAPPING.longDescription),
    price: pick(["price", "precio"], DEFAULT_MAPPING.price),
    oldPrice: pick(["old_price", "precio_anterior", "compare_at_price"], DEFAULT_MAPPING.oldPrice),
    merchantName: pick(["merchant_name", "tienda", "merchant", "store"], DEFAULT_MAPPING.merchantName),
    offerUrl: pick(["offer_url", "url", "link"], DEFAULT_MAPPING.offerUrl),
    stock: pick(["stock", "in_stock", "availability"], DEFAULT_MAPPING.stock),
    imageUrl: pick(["image_url", "imagen", "image", "photo"], DEFAULT_MAPPING.imageUrl),
    sku: pick(["sku", "reference", "ref"], DEFAULT_MAPPING.sku),
    ean: pick(["ean", "gtin", "barcode"], DEFAULT_MAPPING.ean),
    tags: pick(["tags", "etiquetas", "keywords"], DEFAULT_MAPPING.tags),
  };
}

export function parseCsvPreview(csvText: string): CsvPreviewResult {
  assertCsvLimits(csvText);
  const rows = parseCsv(csvText);
  assertCsvLimits(csvText, rows.length);
  const headers = rows.length ? Object.keys(rows[0]) : [];
  return { headers, rows: rows.slice(0, 20), totalRows: rows.length, mapping: inferMapping(headers) };
}

function parseTags(value: string): string[] {
  return value
    .split(/[|,;]/g)
    .map((tag) => sanitizeText(tag, 50))
    .filter(Boolean);
}

function parseNumber(value: string): number {
  if (!value) return 0;
  const normalized = value.replace(/\./g, "").replace(/,/g, ".").replace(/[^0-9.-]/g, "");
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
}

function parseBoolean(value: string): boolean {
  const normalized = sanitizeText(value.toLowerCase(), 20);
  return ["1", "true", "yes", "si", "on", "available", "in_stock", "stock"].includes(normalized);
}

function readField(row: Record<string, string>, key: string): string {
  return sanitizeText(row[key] || "", 2000);
}

function readRawField(row: Record<string, string>, key: string, maxLength = 2000): string {
  return String(row[key] || "").trim().slice(0, maxLength);
}

function containsControlCharacters(value: string): boolean {
  for (let i = 0; i < value.length; i += 1) {
    const code = value.charCodeAt(i);
    if (code <= 31 || code === 127) return true;
  }
  return false;
}

function normalizeHttpUrl(value: string): string {
  const candidate = String(value || "").trim();
  if (!candidate || containsControlCharacters(candidate)) return "";
  try {
    const parsed = new URL(candidate);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return "";
    if (parsed.username || parsed.password) return "";
    return parsed.toString();
  } catch {
    return "";
  }
}

export function buildImportPayload(
  rows: Array<Record<string, string>>,
  mapping: ImportColumnMapping,
): ImportPayloadRow[] {
  return rows.map((row) => {
    const oldPriceRaw = parseNumber(readField(row, mapping.oldPrice));
    return {
      product_name: readField(row, mapping.productName),
      brand_name: readField(row, mapping.brandName) || "Sin marca",
      category_name: readField(row, mapping.categoryName) || "General",
      subcategory_name: readField(row, mapping.subcategoryName),
      description: readField(row, mapping.description),
      long_description: readField(row, mapping.longDescription),
      merchant_name: readField(row, mapping.merchantName),
      offer_url: normalizeHttpUrl(readRawField(row, mapping.offerUrl)),
      image_url: normalizeHttpUrl(readRawField(row, mapping.imageUrl)),
      price: parseNumber(readField(row, mapping.price)),
      old_price: oldPriceRaw > 0 ? oldPriceRaw : null,
      stock: parseBoolean(readField(row, mapping.stock)),
      sku: readField(row, mapping.sku),
      ean: readField(row, mapping.ean),
      tags: parseTags(readField(row, mapping.tags)),
    };
  });
}

export function validateImportPayloadRows(rows: ImportPayloadRow[]): RowImportError[] {
  const errors: RowImportError[] = [];
  rows.forEach((row, index) => {
    if (!row.offer_url) {
      errors.push({
        rowIndex: index,
        message: "Fila invalida: offer_url es obligatorio y debe ser una URL http/https valida",
      });
      return;
    }
    if (!parseAffiliateUrl(row.offer_url)) {
      errors.push({
        rowIndex: index,
        message: "Fila invalida: offer_url debe ser HTTPS publico y sin credenciales incrustadas",
      });
    }
    if (!row.product_name) {
      errors.push({ rowIndex: index, message: "Fila invalida: product_name es obligatorio" });
    }
    if (!row.merchant_name) {
      errors.push({ rowIndex: index, message: "Fila invalida: merchant_name es obligatorio" });
    }
    if (row.price <= 0) {
      errors.push({ rowIndex: index, message: "Fila invalida: price debe ser mayor que 0" });
    }
  });
  return errors;
}
