'use client';

import React, { useMemo, useState } from 'react';
import LoadingMessage from './loading-message';
import { DataTable, FacetedFilterConfig, facetedFilter } from './ui/data-table';
import {
  useStandaloneProducts,
  useStandaloneProductsByUser,
} from '@/hooks/standalone-products';
import { ColumnDef } from '@tanstack/react-table';
import { CoAuthor, IStandaloneProduct, SeedCategory } from '@repo/types';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Copy, Download, MoreHorizontal, Plus } from 'lucide-react';
import { copyValue } from '@/lib/utils';
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
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';
import { StandaloneProductForm } from './forms/create-standalone-product-form';
import StandaloneProductMenu from './standalone-product-menu';

function StandaloneProductActionsCell({
  product,
}: {
  product: IStandaloneProduct;
}) {
  const { data: files = [] } = useFilesForEntity(product._id);

  const handleDownload = async () => {
    if (!files?.length) {
      toast.error('No hay archivo para descargar');
      return;
    }

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
          <Download /> Descargar archivo
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => copyValue(product._id)}>
          <Copy /> Copiar ID
        </DropdownMenuItem>
        <StandaloneProductMenu product={product} />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

const columns: ColumnDef<IStandaloneProduct>[] = [
  {
    id: 'actions',
    header: 'Acciones',
    cell: ({ row }) => <StandaloneProductActionsCell product={row.original} />,
  },
  {
    accessorKey: 'name',
    header: 'Nombre',
    cell: ({ row }) => {
      const { name } = row.original;
      return (
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
    meta: { className: 'hidden md:table-cell' },
  },
  {
    id: 'subcategory',
    accessorFn: (row) => row.subcategory.name,
    header: 'Subcategoría',
    meta: { className: 'hidden lg:table-cell' },
  },
  {
    accessorKey: 'coAuthor',
    header: 'Co Autor',
    meta: { className: 'hidden xl:table-cell' },
  },
  {
    id: 'owner',
    accessorFn: (row) => row.owner?._id ?? 'Sin propietario',
    header: 'Propietario',
    filterFn: facetedFilter,
    meta: { className: 'hidden sm:table-cell' },
    cell: ({ row }) => {
      const { owner } = row.original;

      if (!owner) return <div className="w-36 md:w-52">-</div>;

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
        <div className="whitespace-nowrap">
          {format(createdAt, "d 'de' MMMM 'de' yyyy", { locale: es })}
        </div>
      );
    },
  },
];

interface StandaloneProductsTableProps {
  userId?: string;
}

export function StandaloneProductsTable({
  userId,
}: StandaloneProductsTableProps) {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const isUserScope = !!userId;
  const allProductsQuery = useStandaloneProducts(!isUserScope);
  const ownProductsQuery = useStandaloneProductsByUser(userId, isUserScope);

  const data = isUserScope ? ownProductsQuery.data : allProductsQuery.data;
  const isLoading = isUserScope
    ? ownProductsQuery.isLoading
    : allProductsQuery.isLoading;
  const { data: categories } = useProductCategories();
  const { data: subcategories } = useProductSubcategories();
  const typedProducts = useMemo(
    () => (data ?? []) as IStandaloneProduct[],
    [data],
  );

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

    const ownerOptions = Array.from(
      new Map(
        typedProducts.map((product) => {
          const ownerId = product.owner?._id ?? 'Sin propietario';

          if (!product.owner) {
            return [ownerId, 'Sin propietario'] as const;
          }

          const fullName =
            `${product.owner.givenName ?? ''} ${product.owner.familyName ?? ''}`.trim();
          const ownerLabel = fullName || product.owner.email || 'Sin nombre';

          return [ownerId, ownerLabel] as const;
        }),
      ).entries(),
    )
      .map(([value, label]) => ({ value, label }))
      .sort((a, b) => a.label.localeCompare(b.label, 'es'));

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
      {
        columnId: 'owner',
        title: 'Usuario',
        options: ownerOptions,
      },
    ];
  }, [categories, subcategories, typedProducts]);

  return (
    <div className="w-full max-w-7xl flex flex-col gap-4 p-1">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-base font-semibold">Productos independientes</h2>
          <span className="text-muted-foreground text-sm">
            Gestiona los productos independientes existentes.
          </span>
        </div>

        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="w-full sm:w-auto">
              <Plus className="h-4 w-4" /> Crear producto
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogTitle>Nuevo producto independiente</DialogTitle>
            <StandaloneProductForm onSuccess={() => setIsCreateDialogOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <LoadingMessage message="Cargando productos independientes" />
      ) : (
        <DataTable
          columns={columns}
          data={typedProducts}
          facetedFilters={facetedFilters}
        />
      )}
    </div>
  );
}
