'use client';

import {
  ColumnDef,
  ColumnFiltersState,
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
}

export function DataTable<TData, TValue>({
  columns,
  data,
  facetedFilters,
  searchColumnId,
}: DataTableProps<TData, TValue>) {
  // Manejamos únicamente el estado de los filtros por columna
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);

  const table = useReactTable({
    data,
    columns,
    state: {
      columnFilters, // Pasamos el estado de los filtros de columna
    },
    onColumnFiltersChange: setColumnFilters,
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