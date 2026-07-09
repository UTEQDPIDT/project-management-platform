import { useDeleteStandaloneProduct } from '@/hooks/standalone-products';
import { IStandaloneProduct } from '@repo/types';
import { Pencil, Trash } from 'lucide-react';
import { useState } from 'react';
import { StandaloneProductForm } from './forms/create-standalone-product-form';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';

interface StandaloneProductMenuProps {
  product: IStandaloneProduct;
}

export default function StandaloneProductMenu({
  product,
}: StandaloneProductMenuProps) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const deleteStandaloneProduct = useDeleteStandaloneProduct();

  const handleDelete = () => {
    deleteStandaloneProduct.mutate({ productId: product._id });
  };

  return (
    <div className="flex flex-col gap-1 max-w-fit">
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogTrigger className="has-[>svg]:px-2 [&_svg]:text-muted-foreground px-0 h-8 border-transparent w-full justify-start font-normal">
          <Pencil /> Editar producto
        </DialogTrigger>
        <DialogContent>
          <Badge variant="orange">Editando</Badge>
          <DialogTitle className="line-clamp-1 h-5">{product.name}</DialogTitle>
          <StandaloneProductForm
            product={product}
            onSuccess={() => setIsEditDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      <Dialog>
        <DialogTrigger className="has-[>svg]:px-2 [&_svg]:text-muted-foreground hover:[&_svg]:text-destructive-foreground px-0 border-transparent w-full h-8 justify-start hover:text-destructive-foreground font-normal">
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
                disabled={deleteStandaloneProduct.isPending}
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
