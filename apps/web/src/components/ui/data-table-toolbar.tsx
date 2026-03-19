'use client';

import { type Table } from '@tanstack/react-table';

import { Search, X } from 'lucide-react';

import { Button } from './button';
import { InputGroup, InputGroupAddon, InputGroupInput } from './input-group';
import {
  DataTableFacetedFilter,
  type FacetedFilterOption,
} from './data-table-faceted-filter';

export interface FacetedFilterConfig {
  columnId: string;
  title: string;
  options: FacetedFilterOption[];
}

interface DataTableToolbarProps<TData> {
  table: Table<TData>;
  facetedFilters?: FacetedFilterConfig[];
}

export function DataTableToolbar<TData>({
  table,
  facetedFilters = [],
}: DataTableToolbarProps<TData>) {
  const isFiltered =
    table.getState().globalFilter?.length > 0 ||
    table.getState().columnFilters.length > 0;

  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-1 items-center gap-2">
        <InputGroup className="max-w-xs">
          <InputGroupInput
            placeholder="Buscar"
            value={table.getState().globalFilter ?? ''}
            onChange={(event) => table.setGlobalFilter(event.target.value)}
          />
          <InputGroupAddon>
            <Search />
          </InputGroupAddon>
        </InputGroup>
        {facetedFilters.map((filter) => {
          const column = table.getColumn(filter.columnId);
          if (!column) return null;
          return (
            <DataTableFacetedFilter
              key={filter.columnId}
              column={column}
              title={filter.title}
              options={filter.options}
            />
          );
        })}
        {isFiltered && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              table.resetColumnFilters();
              table.setGlobalFilter('');
            }}
          >
            Limpiar <X />
          </Button>
        )}
      </div>
    </div>
  );
}
