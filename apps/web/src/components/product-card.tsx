import { IProduct } from '@repo/types';
import React from 'react';
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from './ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Download, Ellipsis, Pencil, Trash } from 'lucide-react';
import { Button } from './ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';
import { DialogClose } from '@radix-ui/react-dialog';
import { useDeleteProduct } from '@/hooks/projects';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { ProductForm } from './forms/product-form';
import { ProfileInfo } from './profile-info';

interface ProductCardProps {
  product: Pick<
    IProduct,
    | '_id'
    | 'name'
    | 'details'
    | 'category'
    | 'subcategory'
    | 'coAuthor'
    | 'owner'
    | 'files'
  >;
  projectId: string;
}

export default function ProductCard({ product, projectId }: ProductCardProps) {
  const deleteProduct = useDeleteProduct();

  const handleDelete = () => {
    deleteProduct.mutate({ projectId, productId: product._id });
  };

  return (
    <Card className="gap-2">
      <CardHeader>
        <div className="flex items-center justify-between gap-1">
          <div className="flex flex-col gap-1">
            <CardTitle>{product.name}</CardTitle>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon-sm">
                <Ellipsis />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="flex flex-col items-start gap-1">
              {/* Edit */}
              <Dialog>
                <DialogTrigger className="border-transparent w-full justify-start">
                  <Pencil /> Editar
                </DialogTrigger>
                <DialogContent>
                  <div className="flex gap-3 ">
                    <Badge variant="orange">Editando</Badge>
                    <DialogTitle className="line-clamp-1">
                      {product.name}
                    </DialogTitle>
                  </div>
                  <Separator />

                  <ProductForm product={product} projectId={projectId} />
                </DialogContent>
              </Dialog>

              {/* Delete */}
              <Dialog>
                <DialogTrigger className="border-transparent w-full justify-start hover:text-destructive-foreground">
                  <Trash /> Eliminar
                </DialogTrigger>
                <DialogContent className="gap-5">
                  <Badge variant="destructive">Eliminando</Badge>
                  <DialogTitle>{product.name}</DialogTitle>
                  <DialogDescription>
                    ¿Seguro que deseas eliminar el producto? Esta es una
                    operación irreversible, una vez eliminado el producto no se
                    podrá recuperar.
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
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className="flex flex-col gap-3">
        <div className="flex flex-col gap-2">
          <span className="text-xs text-muted-foreground">Categoría</span>
          <Badge>{product.category.name}</Badge>
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-xs text-muted-foreground">Subcategoría</span>

          <Badge>{product.subcategory.name}</Badge>
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-xs text-muted-foreground">Co Autor</span>

          <Badge>{product.coAuthor}</Badge>
        </div>

        <div className="flex flex-col">
          <span className="text-xs text-muted-foreground">Dueño</span>

          <ProfileInfo
            givenName={product.owner.givenName}
            familyName={product.owner.familyName}
            avatarUrl={product.owner.avatarUrl}
            email={product.owner.email}
          />
        </div>
      </CardContent>

      <CardFooter className="flex justify-end">
        <CardAction>
          <Button title="Descargar" variant="ghost" size="icon-sm">
            <Download />
          </Button>
        </CardAction>
      </CardFooter>
    </Card>
  );
}
