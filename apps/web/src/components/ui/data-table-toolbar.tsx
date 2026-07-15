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
  searchColumnId?: string; // Nueva propiedad opcional para especificar la columna de búsqueda
}

interface DataTableToolbarProps<TData> {
  table: Table<TData>;
  facetedFilters?: FacetedFilterConfig[];
  searchColumnId?: string; // Nueva propiedad opcional para especificar la columna de búsqueda
}

export function DataTableToolbar<TData>({
  table,
  facetedFilters = [],
  searchColumnId = 'name', // Valor por defecto para la columna de búsqueda
}: DataTableToolbarProps<TData>) {
  // 1. Obtenemos la referencia a la columna del nombre
  const nameColumn = table.getColumn(searchColumnId);

  // 2. Modificamos la validación para ver si hay algún filtro de columna activo
  const isFiltered = table.getState().columnFilters.length > 0;

  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-1 items-center gap-2">
        <InputGroup className="max-w-xs">
          <InputGroupInput
            placeholder="Buscar por nombre..."
            // 3. Leemos el valor actual del filtro de la columna 'name'
            value={(nameColumn?.getFilterValue() as string) ?? ''}
            // 4. Actualizamos solo el filtro de la columna 'name'
            onChange={(event) => nameColumn?.setFilterValue(event.target.value)}
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
            // 5. Al limpiar, resetear los filtros de columnas bastará
            onClick={() => table.resetColumnFilters()}
          >
            Limpiar <X />
          </Button>
        )}
      </div>
    </div>
  );
}