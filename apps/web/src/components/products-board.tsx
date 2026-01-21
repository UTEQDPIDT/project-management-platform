'use client';

import { IProduct } from '@repo/types';
import { Shapes } from 'lucide-react';
import { ProductForm } from './forms/product-form';
import IconSquare from './icon-square';
import ProductCard from './product-card';
import ProjectProductMenu from './project-product-menu';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from './ui/dialog';
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from './ui/empty';
import LoadingMessage from './loading-message';
import ErrorCard from './error-card';

type ProductsCardProps = {
  products: IProduct[];
  projectId: string;
  isLoading?: boolean;
  isError?: boolean;
};

export function ProductsBoard({
  products,
  projectId,
  isLoading,
  isError,
}: ProductsCardProps) {
  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between ">
          <div className="flex gap-3 items-center">
            <IconSquare color="orange">
              <Shapes />
            </IconSquare>

            <CardTitle>Productos</CardTitle>
          </div>
          <Dialog>
            <DialogTrigger className="h-7 px-3 bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground border-transparent">
              Crear
            </DialogTrigger>
            <DialogContent>
              <DialogTitle>Nuevo Producto</DialogTitle>
              <ProductForm projectId={projectId} />
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <LoadingMessage message="Cargando productos" />
        ) : isError ? (
          <ErrorCard />
        ) : products.length > 0 ? (
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {products.map((p: IProduct) => (
              <ProductCard
                key={p._id}
                product={p}
                enableOptions
                options={
                  <ProjectProductMenu projectId={projectId} product={p} />
                }
              />
            ))}
          </div>
        ) : (
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <Shapes />
              </EmptyMedia>
              <EmptyTitle>No Hay Productos</EmptyTitle>
              <EmptyDescription>
                No haz creado ningun producto. Inicia creando tu primer
                producto.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        )}
      </CardContent>
    </Card>
  );
}
