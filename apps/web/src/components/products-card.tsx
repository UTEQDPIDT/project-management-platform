'use client';

import { IProduct } from '@repo/types';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from './ui/card';
import ProductCard from './product-card';
import { Newspaper } from 'lucide-react';
import IconSquare from './icon-square';
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from './ui/dialog';
import { ProductForm } from './forms/product-form';
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from './ui/empty';
import { Separator } from './ui/separator';

interface ProductsCardProps {
  products: IProduct[];
  projectId: string;
}

export function ProductsCard({ products, projectId }: ProductsCardProps) {
  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between">
          <div className="flex gap-3">
            <IconSquare>
              <Newspaper />
            </IconSquare>
            <div className="flex flex-col gap-1">
              <CardTitle>Productos</CardTitle>
              {/* <CardDescription>
                Crea y gestiona los productos del proyecto.
              </CardDescription> */}
            </div>
          </div>
          <Dialog>
            <DialogTrigger className="h-7 px-3 bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground border-transparent">
              Crear
            </DialogTrigger>
            <DialogContent>
              <DialogTitle>Nuevo Producto</DialogTitle>
              <Separator />
              <ProductForm projectId={projectId} />
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {products.length > 0 ? (
          <div className="grid gap-3 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {products.map((p: IProduct) => (
              <ProductCard key={p._id} product={p} projectId={projectId} />
            ))}
          </div>
        ) : (
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <Newspaper />
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
