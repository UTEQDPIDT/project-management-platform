import { type Table } from '@tanstack/react-table';
import { Button } from './button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './select';
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react';

interface DataTablePaginationProps<TData> {
  table: Table<TData>;
}

export default function DataTablePagination<TData>({
  table,
}: DataTablePaginationProps<TData>) {
  return (
    <div className="flex items-center space-x-6 lg:space-x-8 justify-end py-4 text-sm">
      <div className="flex items-center gap-2">
        <p className="font-medium">Filas por página</p>
        <Select
          value={`${table.getState().pagination.pageSize}`}
          onValueChange={(value) => {
            table.setPageSize(Number(value));
          }}
        >
          <SelectTrigger className="h-8 w-17.5">
            <SelectValue placeholder={table.getState().pagination.pageSize} />
          </SelectTrigger>
          <SelectContent side="top">
            {[10, 20, 30, 40, 50].map((pageSize) => (
              <SelectItem key={pageSize} value={pageSize.toString()}>
                {pageSize}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex w-25 items-center justify-center font-medium">
        Página {table.getState().pagination.pageIndex + 1} de{' '}
        {table.getPageCount()}
      </div>
      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          size="icon"
          className="size-8"
          disabled={!table.getCanPreviousPage()}
          onClick={() => table.setPageIndex(0)}
        >
          <span className="sr-only">Ir a primera página</span>
          <ChevronsLeft />
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="size-8"
          disabled={!table.getCanPreviousPage()}
          onClick={() => table.previousPage()}
        >
          <span className="sr-only">Ir a página anterior</span>
          <ChevronLeft />
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="size-8"
          disabled={!table.getCanNextPage()}
          onClick={() => table.nextPage()}
        >
          <span className="sr-only">Ir a página siguiente</span>
          <ChevronRight />
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="size-8"
          disabled={!table.getCanNextPage()}
          onClick={() => table.setPageIndex(table.getPageCount() - 1)}
        >
          <span className="sr-only">Ir a última página</span>
          <ChevronsRight />
        </Button>
      </div>
    </div>
  );
}
