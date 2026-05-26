// Pure helpers shared by admin server actions. No I/O.

interface ErrorLike {
  message?: string;
  code?: string;
}

export function mapAdminErrorMessage(error: ErrorLike | null | undefined | unknown, fallback: string): string {
  const message = (error as ErrorLike | null | undefined)?.message ?? "";
  const lowered = String(message).toLowerCase();

  if (!message) return fallback;

  if (lowered.includes("duplicate key") || lowered.includes("unique constraint")) {
    if (lowered.includes("products") || lowered.includes("product_")) {
      return "Producto duplicado: ya existe un producto con ese identificador.";
    }
    return "Registro duplicado: ya existe un valor único con ese identificador.";
  }

  if (lowered.includes("foreign key constraint") || lowered.includes("violates foreign key")) {
    if (lowered.includes("offers_product") || lowered.includes("offers")) {
      return "No se puede eliminar el producto: tiene ofertas asociadas.";
    }
    if (lowered.includes("category") || lowered.includes("subcategor")) {
      return "No se puede eliminar la categoría: tiene subcategorías o productos asociados.";
    }
    return "No se puede eliminar: tiene registros relacionados.";
  }

  if (lowered.includes("not found")) {
    return "Recurso no encontrado.";
  }

  return message.length < 240 ? message : fallback;
}
