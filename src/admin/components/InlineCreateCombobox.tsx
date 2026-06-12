"use client";

import { useMemo, useState } from "react";
import { Check, ChevronsUpDown, Loader2, Plus } from "lucide-react";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

export interface InlineCreateOption {
  value: string;
  label: string;
  sublabel?: string;
}

export interface InlineCreateComboboxProps {
  value: string;
  onValueChange: (value: string) => void;
  options: InlineCreateOption[];
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  createLabel?: (name: string) => string;
  onCreate?: (name: string) => Promise<string>;
  disabled?: boolean;
  loading?: boolean;
  className?: string;
  contentClassName?: string;
  id?: string;
}

export function InlineCreateCombobox({
  value,
  onValueChange,
  options,
  placeholder = "Selecciona una opción",
  searchPlaceholder = "Buscar...",
  emptyText = "Sin resultados",
  createLabel = (name) => `Crear «${name}»`,
  onCreate,
  disabled = false,
  loading = false,
  className,
  contentClassName,
  id,
}: InlineCreateComboboxProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const selectedLabel = useMemo(
    () => options.find((option) => option.value === value)?.label,
    [options, value],
  );

  const trimmed = search.trim();
  const exactMatch = useMemo(
    () =>
      trimmed.length > 0 &&
      options.some((option) => option.label.toLowerCase() === trimmed.toLowerCase()),
    [options, trimmed],
  );
  const canShowCreate = Boolean(onCreate) && trimmed.length > 1 && !exactMatch && !isCreating;

  async function handleCreate() {
    if (!onCreate || !trimmed) return;
    setIsCreating(true);
    try {
      const newId = await onCreate(trimmed);
      onValueChange(newId);
      setOpen(false);
      setSearch("");
    } catch (error) {
      const message = error instanceof Error ? error.message : "No se pudo crear";
      toast.error(message);
    } finally {
      setIsCreating(false);
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn("w-full justify-between", className)}
        >
          <span className="truncate">{selectedLabel || placeholder}</span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className={cn("w-[var(--radix-popover-trigger-width)] p-0", contentClassName)}
        align="start"
      >
        <Command shouldFilter>
          <CommandInput
            placeholder={searchPlaceholder}
            value={search}
            onValueChange={setSearch}
          />
          <CommandList>
            {loading ? (
              <div className="px-3 py-2 text-sm text-muted-foreground">Cargando...</div>
            ) : (
              <CommandEmpty>{emptyText}</CommandEmpty>
            )}
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  value={`${option.label} ${option.sublabel ?? ""}`}
                  onSelect={() => {
                    onValueChange(option.value);
                    setOpen(false);
                    setSearch("");
                  }}
                >
                  <Check
                    className={cn("mr-2 h-4 w-4", value === option.value ? "opacity-100" : "opacity-0")}
                  />
                  <span className="truncate">{option.label}</span>
                  {option.sublabel ? (
                    <span className="ml-2 truncate text-xs text-muted-foreground">
                      {option.sublabel}
                    </span>
                  ) : null}
                </CommandItem>
              ))}
            </CommandGroup>
            {canShowCreate ? (
              <>
                <CommandSeparator />
                <CommandGroup>
                  <CommandItem
                    value={`__create__${trimmed}`}
                    onSelect={handleCreate}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    <span className="truncate">{createLabel(trimmed)}</span>
                  </CommandItem>
                </CommandGroup>
              </>
            ) : null}
            {isCreating ? (
              <div className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Creando...
              </div>
            ) : null}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
