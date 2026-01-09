'use client';

import React from 'react';
import LoadingMessage from './loading-message';
import { DataTable } from './ui/data-table';
import { useProducts } from '@/hooks/products';
import { ColumnDef } from '@tanstack/react-table';
import { IProduct } from '@repo/types';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import {
  Copy,
  Download,
  ExternalLink,
  MoreHorizontal,
  Pencil,
} from 'lucide-react';
import { copyValue } from '@/lib/utils';
import Link from 'next/link';
import { Button } from './ui/button';
import { ProfileInfo } from './profile-info';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const columns: ColumnDef<IProduct>[] = [
  { accessorKey: 'name', header: 'Nombre' },
  {
    accessorKey: 'category',
    header: 'Catagoría',
    cell: ({ row }) => {
      const { category } = row.original;

      return <div>{category.name}</div>;
    },
  },
  {
    accessorKey: 'subcategory',
    header: 'Subcategoría',
    cell: ({ row }) => {
      const { subcategory } = row.original;

      return <div>{subcategory.name}</div>;
    },
  },
  { accessorKey: 'coAuthor', header: 'Co Autor' },
  {
    accessorKey: 'owner',
    header: 'Dueño',
    cell: ({ row }) => {
      const { owner } = row.original;

      return (
        <ProfileInfo
          size="sm"
          givenName={owner.givenName}
          familyName={owner.familyName}
          email={owner.email}
          avatarUrl={owner.avatarUrl}
        />
      );
    },
  },
  {
    accessorKey: 'createdAt',
    header: 'Creado el',
    cell: ({ row }) => {
      const { createdAt } = row.original;
      return (
        <div>{format(createdAt, "d 'de' MMMM 'de' yyyy", { locale: es })}</div>
      );
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const product = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon-sm">
              <MoreHorizontal />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Acciones</DropdownMenuLabel>
            <DropdownMenuItem>
              <Download /> Descargar producto
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={`/admin/proyectos/${product.projectId}`}>
                <ExternalLink /> Visitar proyecto
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => copyValue(product._id)}>
              <Copy /> Copiar ID
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

export function ProductsTable() {
  const { data, isLoading } = useProducts();

  return (
    <div className="w-full max-w-6xl flex flex-col gap-4">
      <div>
        <h2 className="text-base font-semibold">Productos</h2>
        <span className="text-muted-foreground text-sm">
          Gestiona los productos existentes.
        </span>
      </div>
      {isLoading ? (
        <LoadingMessage message="Cargando productos" />
      ) : (
        <DataTable columns={columns} data={data} />
      )}
    </div>
  );
}
