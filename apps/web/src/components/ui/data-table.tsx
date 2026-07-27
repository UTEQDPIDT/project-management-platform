'use client';

import {
  ColumnDef,
  ColumnFiltersState,
  PaginationState,
  Updater,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  useReactTable,
  FilterFn,
} from '@tanstack/react-table';
import { rankItem } from '@tanstack/match-sorter-utils';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

import React from 'react';
import { DataTablePagination } from './data-table-pagination';
import {
  DataTableToolbar,
  type FacetedFilterConfig,
} from './data-table-toolbar';

export type { FacetedFilterConfig };
export type { FacetedFilterOption } from './data-table-faceted-filter';

declare module '@tanstack/react-table' {
  interface ColumnMeta<TData, TValue> {
    className?: string;
  }
}

// 1. Conservamos fuzzyFilter para que las columnas individuales puedan invocarlo si lo configuras
export const fuzzyFilter: FilterFn<any> = (row, columnId, value, addMeta) => {
  const itemRank = rankItem(row.getValue(columnId), value);
  addMeta({ itemRank });
  return itemRank.passed;
};

export const facetedFilter: FilterFn<any> = (row, columnId, filterValue) => {
  if (!filterValue || !Array.isArray(filterValue) || filterValue.length === 0) {
    return true;
  }
  const cellValue = row.getValue(columnId);
  return filterValue
    .map((value) => String(value))
    .includes(String(cellValue));
};

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  facetedFilters?: FacetedFilterConfig[];
  searchColumnId?: string; 
  persistStateKey?: string; // Nueva prop para la clave de persistencia
}

export function DataTable<TData, TValue>({
  columns,
  data,
  facetedFilters,
  searchColumnId,
  persistStateKey,
}: DataTableProps<TData, TValue>) {
  // Si no se proporciona una clave, la tabla funciona sin persistencia.
  const storageKey = persistStateKey ? `data-table-state-${persistStateKey}` : null;
  const filtersStorageKey = storageKey ? `${storageKey}_filters` : null;
  const paginationStorageKey = storageKey ? `${storageKey}_pagination` : null;

  // Helper pequeño para parsear JSON de localStorage sin romper la UI.
  const parseJSON = <T,>(value: string | null, fallback: T): T => {
    if (!value) return fallback;
    try {
      return JSON.parse(value) as T;
    } catch {
      return fallback;
    }
  };

  // Estado de filtros por columna (restaurado si hay persistencia).
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(() => {
    if (!filtersStorageKey || typeof window === 'undefined') return [];
    return parseJSON<ColumnFiltersState>(localStorage.getItem(filtersStorageKey), []);
  });

  // Estado de paginación (restaurado si hay persistencia).
  const [paginationState, setPaginationState] = React.useState<PaginationState>(() => {
    const defaultState: PaginationState = { pageIndex: 0, pageSize: 10 };
    if (!paginationStorageKey || typeof window === 'undefined') return defaultState;
    return parseJSON<PaginationState>(
      localStorage.getItem(paginationStorageKey),
      defaultState,
    );
  });

  // Persistimos filtros y paginación cuando cambian.
  React.useEffect(() => {
    if (!filtersStorageKey || typeof window === 'undefined') return;
    localStorage.setItem(filtersStorageKey, JSON.stringify(columnFilters));
  }, [columnFilters, filtersStorageKey]);

  React.useEffect(() => {
    if (!paginationStorageKey || typeof window === 'undefined') return;
    localStorage.setItem(paginationStorageKey, JSON.stringify(paginationState));
  }, [paginationState, paginationStorageKey]);

  // Edge case: si un filtro reduce los resultados, una página alta puede quedar vacía.
  // Al cambiar filtros, reiniciamos a la primera página para mantener resultados visibles.
  const handleColumnFiltersChange = React.useCallback(
    (updater: Updater<ColumnFiltersState>) => {
      setColumnFilters(updater);
      setPaginationState((prev) =>
        prev.pageIndex === 0 ? prev : { ...prev, pageIndex: 0 },
      );
    },
    [],
  );


  const table = useReactTable({
    data,
    columns,
    state: {
      columnFilters, // Pasamos el estado de los filtros de columna
      pagination: paginationState, // Pasamos el estado de paginación
    },
    onColumnFiltersChange: handleColumnFiltersChange,
    onPaginationChange: setPaginationState,
    autoResetPageIndex: true,
    // Registramos fuzzyFilter globalmente para poder usarlo por string 'fuzzy' en las columnas
    filterFns: {
      fuzzy: fuzzyFilter,
    },
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  });

  return (
    <div className="flex flex-col gap-4 w-full overflow-hidden">
      <div className="w-full overflow-x-auto sm:overflow-x-visible pb-1">
        <DataTableToolbar 
          table={table} 
          facetedFilters={facetedFilters} 
          searchColumnId={searchColumnId} 
        />
      </div>

      <div className="overflow-hidden rounded-md border w-full">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  const metaClassName = header.column.columnDef.meta?.className || '';
                  
                  return (
                    <TableHead 
                      key={header.id}
                      className={metaClassName}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                >
                  {row.getVisibleCells().map((cell) => {
                    const metaClassName = cell.column.columnDef.meta?.className || '';
                    return (
                      <TableCell key={cell.id} className={metaClassName}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No se encontraron datos.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <DataTablePagination table={table} />
    </div>
  );
}