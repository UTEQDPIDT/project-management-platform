import { IProduct } from '@repo/types';
import { Download, Ellipsis } from 'lucide-react';
import { ReactNode } from 'react';
import { ProfileInfo } from './profile-info';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';

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
  options?: ReactNode;
  enableOptions?: boolean;
}

export default function ProductCard({
  product,
  enableOptions,
  options,
}: ProductCardProps) {
  return (
    <Card className="gap-2">
      <CardHeader>
        <div className="flex items-center justify-between gap-1">
          <div className="flex flex-col gap-1">
            <CardTitle>{product.name}</CardTitle>
          </div>

          {enableOptions && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon-sm">
                  <Ellipsis />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="flex flex-col items-start gap-1">
                {options}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </CardHeader>

      <CardContent className="flex flex-col gap-3">
        <div className="flex flex-col gap-2">
          <span className="text-xs text-muted-foreground">Categoría</span>
          <Badge variant="outline">{product.category.name}</Badge>
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-xs text-muted-foreground">Subcategoría</span>

          <Badge variant="outline">{product.subcategory.name}</Badge>
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-xs text-muted-foreground">Co Autor</span>

          <Badge variant="outline">Tipo {product.coAuthor}</Badge>
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-xs text-muted-foreground">Dueño</span>

          <ProfileInfo
            size="sm"
            givenName={product.owner.givenName}
            familyName={product.owner.familyName}
            avatarUrl={product.owner.avatarUrl}
          />
        </div>

        <div className="flex">
          <Button size="sm" variant="outline">
            <Download /> Archivo
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
