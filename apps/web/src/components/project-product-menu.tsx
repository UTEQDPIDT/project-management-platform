import React from 'react';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';
import { Pencil, Trash } from 'lucide-react';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { ProductForm } from './forms/product-form';
import { Button } from './ui/button';
import { useDeleteProduct } from '@/hooks/products';
import { IProduct } from '@repo/types';

interface ProjectProductMenuProps {
  projectId: string;
  product: IProduct;
}

export default function ProjectProductMenu({
  projectId,
  product,
}: ProjectProductMenuProps) {
  const deleteProduct = useDeleteProduct();

  const handleDelete = () => {
    deleteProduct.mutate({ productId: product._id });
  };

  return (
    <div className="flex flex-col gap-1 max-w-fit">
      {/* Edit */}
      <Dialog>
        <DialogTrigger className="border-transparent justify-start font-normal">
          <Pencil /> Editar producto
        </DialogTrigger>
        <DialogContent>
            <Badge variant="orange">Editando</Badge>
            <DialogTitle className="line-clamp-1">{product.name}</DialogTitle>
          <ProductForm product={product} projectId={projectId} />
        </DialogContent>
      </Dialog>

      {/* Delete */}
      <Dialog>
        <DialogTrigger className="border-transparent justify-start font-normal hover:text-destructive-foreground">
          <Trash /> Eliminar producto
        </DialogTrigger>
        <DialogContent className="gap-5">
          <Badge variant="destructive">Eliminando</Badge>
          <DialogTitle>{product.name}</DialogTitle>
          <DialogDescription>
            ¿Seguro que deseas eliminar el producto? Esta es una operación
            irreversible, una vez eliminado el producto no se podrá recuperar.
          </DialogDescription>

          <div className="flex gap-2">
            <DialogClose asChild>
              <Button variant="outline">Cancelar</Button>
            </DialogClose>

            <DialogClose asChild>
              <Button
                onClick={handleDelete}
                disabled={deleteProduct.isPending}
                variant="destructive"
              >
                Eliminar
              </Button>
            </DialogClose>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
