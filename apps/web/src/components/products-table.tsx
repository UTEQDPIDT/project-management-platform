'use client';

import React, { useMemo } from 'react';
import LoadingMessage from './loading-message';
import { DataTable, FacetedFilterConfig } from './ui/data-table';
import { useProducts } from '@/hooks/products';
import { ColumnDef } from '@tanstack/react-table';
import { CoAuthor, IProduct, SeedCategory } from '@repo/types';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Copy, Download, ExternalLink, MoreHorizontal } from 'lucide-react';
import { copyValue } from '@/lib/utils';
import Link from 'next/link';
import { Button } from './ui/button';
import { ProfileInfo } from './profile-info';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { downloadFile } from '@/services/files.service';
import { useFilesForEntity } from '@/hooks/files';
import { toast } from 'sonner';
import CopyButton from './ui/copy';
import {
  useProductCategories,
  useProductSubcategories,
} from '@/hooks/catalogs';

function ProductActionsCell({ product }: { product: IProduct }) {
  const { data: files = [] } = useFilesForEntity(product._id);

  const handleDownload = async () => {
    try {
      await downloadFile(files[0]._id, files[0].originalName);
    } catch (error) {
      toast.error('No se pudo descargar el archivo');
      throw error;
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon-sm">
          <MoreHorizontal />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Acciones</DropdownMenuLabel>
        <DropdownMenuItem onClick={handleDownload}>
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
}

const columns: ColumnDef<IProduct>[] = [
  {
    accessorKey: 'name',
    header: 'Nombre',
    cell: ({ row }) => {
      const { name } = row.original;
      return (
        /* max-w-40 en móvil que escala a max-w-96 en pantallas grandes para no romper la celda */
        <div className="flex max-w-40 sm:max-w-60 md:max-w-96 group">
          <span className="truncate">{name}</span>
          <CopyButton
            variant="ghost"
            valueToCopy={name}
            className="opacity-0 group-hover:opacity-100 hidden sm:flex"
          />
        </div>
      );
    },
  },
  {
    id: 'category',
    accessorFn: (row) => row.category.name,
    header: 'Categoría',
    /* Se oculta en móviles, visible desde pantallas medianas (md) */
    meta: { className: 'hidden md:table-cell' }, 
  },
  {
    id: 'subcategory',
    accessorFn: (row) => row.subcategory.name,
    header: 'Subcategoría',
    /* Se oculta en móviles y tablets, visible desde pantallas grandes (lg) */
    meta: { className: 'hidden lg:table-cell' },
  },
  { 
    accessorKey: 'coAuthor', 
    header: 'Co Autor',
    meta: { className: 'hidden xl:table-cell' },
  },
  {
    accessorKey: 'owner',
    header: 'Propietario',
    meta: { className: 'hidden sm:table-cell' }, /* Visible a partir de celulares horizontales/tablets */
    cell: ({ row }) => {
      const { owner } = row.original;

      if (!owner) return <div className="w-36 md:w-52">—</div>;

      return (
        <div className="w-36 md:w-52">
          <ProfileInfo
            size="sm"
            givenName={owner.givenName}
            familyName={owner.familyName}
            email={owner.email}
            avatarUrl={owner.avatarUrl}
          />
        </div>
      );
    },
  },
  {
    accessorKey: 'createdAt',
    header: 'Fecha de creación',
    meta: { className: 'hidden md:table-cell' },
    cell: ({ row }) => {
      const { createdAt } = row.original;
      return (
        <div className="whitespace-nowrap">{format(createdAt, "d 'de' MMMM 'de' yyyy", { locale: es })}</div>
      );
    },
  },
  {
    id: 'actions',
    header: 'Acciones',
    cell: ({ row }) => <ProductActionsCell product={row.original} />,
  },
];

export function ProductsTable() {
  const { data, isLoading } = useProducts();
  const { data: categories } = useProductCategories();
  const { data: subcategories } = useProductSubcategories();

  const facetedFilters = useMemo((): FacetedFilterConfig[] => {
    const categoriesOptions =
      categories?.map((category: SeedCategory) => ({
        label: category.name,
        value: category.name,
      })) ?? [];

    const subcategoriesOptions =
      subcategories?.map((subcategory: SeedCategory) => ({
        label: subcategory.name,
        value: subcategory.name,
      })) ?? [];

    return [
      {
        columnId: 'category',
        title: 'Categoría',
        options: categoriesOptions,
      },
      {
        columnId: 'subcategory',
        title: 'Subcategoría',
        options: subcategoriesOptions,
      },
      {
        columnId: 'coAuthor',
        title: 'Co Autor',
        options: Object.values(CoAuthor).map((coAuthor) => ({
          label: coAuthor,
          value: coAuthor,
        })),
      },
    ];
  }, [categories, subcategories]);

  return (
    <div className="w-full max-w-8xl flex flex-col gap-4 p-1">
      <div>
        <h2 className="text-base font-semibold">Productos</h2>
        <span className="text-muted-foreground text-sm">
          Gestiona los productos existentes.
        </span>
      </div>
      {isLoading ? (
        <LoadingMessage message="Cargando productos" />
      ) : (
        <DataTable
          columns={columns}
          data={data}
          facetedFilters={facetedFilters}
        />
      )}
    </div>
  );
}