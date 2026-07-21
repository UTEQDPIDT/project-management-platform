'use client';

import React, { useEffect, useMemo, useState } from 'react';
import LoadingMessage from './loading-message';
import { DataTable, FacetedFilterConfig, facetedFilter, fuzzyFilter } from './ui/data-table';
import { useProducts } from '@/hooks/products';
import { ColumnDef } from '@tanstack/react-table';
import { CoAuthor, IFile, IProduct, SeedCategory } from '@repo/types';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Copy, Download, ExternalLink, Eye, MoreHorizontal } from 'lucide-react';
import { copyValue } from '@/lib/utils';
import Link from 'next/link';
import { Button } from './ui/button';
import { ProfileInfo } from './profile-info';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { downloadFile, getFileBlobUrl } from '@/services/files.service';
import { useFilesForEntity } from '@/hooks/files';
import { toast } from 'sonner';
import CopyButton from './ui/copy';
import {
  useProductCategories,
  useProductSubcategories,
} from '@/hooks/catalogs';
import {
  Dialog,
} from './ui/dialog';
import FilePreviewDialog from './file-preview-dialog';

function ProductActionsCell({ product }: { product: IProduct }) {
  const { data: files = [] } = useFilesForEntity(product._id);
  const typedFiles = files as IFile[];
  const firstFile = typedFiles[0];
  const previewableFile = typedFiles.find(
    (file) =>
      file.mimetype === 'application/pdf' ||
      file.mimetype?.startsWith('image/'),
  );
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [previewBlobUrl, setPreviewBlobUrl] = useState<string | null>(null);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);

  const handleDownload = async () => {
    if (!firstFile) {
      toast.error('No hay archivo para descargar');
      return;
    }

    try {
      await downloadFile(firstFile._id, firstFile.originalName);
    } catch (error) {
      toast.error('No se pudo descargar el archivo');
      throw error;
    }
  };

  const handleOpenPreview = async () => {
    if (!previewableFile) {
      toast.error('No hay archivo compatible para previsualizar');
      return;
    }

    try {
      setIsViewerOpen(true);
      setIsLoadingPreview(true);
      setPreviewError(null);
      setPreviewBlobUrl(null);
      const blobUrl = await getFileBlobUrl(previewableFile._id);
      setPreviewBlobUrl(blobUrl);
    } catch (error) {
      toast.error('No se pudo abrir la vista previa del archivo');
      setPreviewError('No se pudo cargar la vista previa del archivo.');
    } finally {
      setIsLoadingPreview(false);
    }
  };

  const handlePreviewDownload = async () => {
    if (!previewableFile) {
      toast.error('No hay archivo para descargar');
      return;
    }

    try {
      await downloadFile(previewableFile._id, previewableFile.originalName);
    } catch (error) {
      toast.error('No se pudo descargar el archivo');
      throw error;
    }
  };

  useEffect(() => {
    if (isViewerOpen) return;

    if (previewBlobUrl) {
      window.URL.revokeObjectURL(previewBlobUrl);
      setPreviewBlobUrl(null);
    }
    setPreviewError(null);
  }, [isViewerOpen, previewBlobUrl]);

  useEffect(() => {
    return () => {
      if (previewBlobUrl) {
        window.URL.revokeObjectURL(previewBlobUrl);
      }
    };
  }, [previewBlobUrl]);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon-sm">
            <MoreHorizontal />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Acciones</DropdownMenuLabel>
          {previewableFile && (
            <DropdownMenuItem onClick={handleOpenPreview} disabled={isLoadingPreview}>
              <Eye /> {isLoadingPreview ? 'Abriendo archivo...' : 'Ver archivo'}
            </DropdownMenuItem>
          )}
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

      <FilePreviewDialog
        open={isViewerOpen}
        onOpenChange={setIsViewerOpen}
        fileName={previewableFile?.originalName ?? 'Vista previa de archivo'}
        mimeType={previewableFile?.mimetype}
        previewBlobUrl={previewBlobUrl}
        isLoading={isLoadingPreview}
        errorMessage={previewError}
        onRetry={handleOpenPreview}
        onDownload={handlePreviewDownload}
      />
    </>
  );
}

const columns: ColumnDef<IProduct>[] = [
   {
    id: 'actions',
    header: 'Acciones',
    cell: ({ row }) => <ProductActionsCell product={row.original} />,
  },
  {
    accessorKey: 'name',
    header: 'Nombre',
    filterFn: fuzzyFilter,
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
    id: 'owner',
    accessorFn: (row) => row.owner?._id ?? 'Sin propietario',
    header: 'Propietario',
    filterFn: facetedFilter,
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
];

export function ProductsTable() {
  const { data, isLoading } = useProducts();
  const { data: categories } = useProductCategories();
  const { data: subcategories } = useProductSubcategories();
  const typedProducts = useMemo(() => (data ?? []) as IProduct[], [data]);

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

          const fullName = `${product.owner.givenName ?? ''} ${product.owner.familyName ?? ''}`.trim();
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
          data={typedProducts}
          facetedFilters={facetedFilters}
          searchColumnId="name"
        />
      )}
    </div>
  );
}