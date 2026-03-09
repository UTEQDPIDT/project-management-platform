'use client';

import { type Table } from '@tanstack/react-table';

import { Search, X } from 'lucide-react';

import { Button } from './button';
import { InputGroup, InputGroupAddon, InputGroupInput } from './input-group';

interface DataTableToolbarProps<TData> {
  table: Table<TData>;
}

export function DataTableToolbar<TData>({
  table,
}: DataTableToolbarProps<TData>) {
  const isFiltered = table.getState().globalFilter?.length > 0;

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
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
        {isFiltered && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => table.setGlobalFilter('')}
          >
            Limpiar <X />
          </Button>
        )}
      </div>
    </div>
  );
}
