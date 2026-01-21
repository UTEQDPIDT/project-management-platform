import { IFile, IProduct } from '@repo/types';
import { Ellipsis } from 'lucide-react';
import { ReactNode } from 'react';
import { ProfileInfo } from './profile-info';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import FileButton from './file-button';
import { useFilesForEntity } from '@/hooks/files/use-files-for-entity';

interface ProductCardProps {
  product: IProduct;
  options?: ReactNode;
  enableOptions?: boolean;
}

export default function ProductCard({
  product,
  enableOptions,
  options,
}: ProductCardProps) {
  const { data: files = [] } = useFilesForEntity(product._id);
  return (
    <Card className="gap-2 group">
      <CardHeader>
        <div className="flex items-center justify-between gap-1">
          <div className="flex flex-col gap-1">
            <CardTitle>{product.name}</CardTitle>
          </div>

          {enableOptions && (
            <DropdownMenu>
              <DropdownMenuTrigger
                asChild
                className="opacity-0 group-hover:opacity-100"
              >
                <Button variant="ghost" size="icon-sm">
                  <Ellipsis />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="flex flex-col items-start gap-1">
                <DropdownMenuLabel>Acciones</DropdownMenuLabel>
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
          <span className="text-xs text-muted-foreground">Proprietario</span>

          <ProfileInfo
            size="sm"
            givenName={product.owner.givenName}
            familyName={product.owner.familyName}
            avatarUrl={product.owner.avatarUrl}
          />
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-xs text-muted-foreground">Archivo</span>
          {files && files.length > 0 ? (
            files.map((file: IFile) => (
              <FileButton key={file._id} file={file} className="max-w-72" />
            ))
          ) : (
            <span className="text-xs text-muted-foreground">
              No hay archivo
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
