'use client';

import { getBaseUrlBasedOnRole } from '@/lib/utils';
import { IStandaloneProduct } from '@repo/types';
import { useUserProfile } from 'context/profile-provider';
import { Plus, Shapes } from 'lucide-react';
import Link from 'next/link';
import ErrorCard from './error-card';
import IconSquare from './icon-square';
import LoadingMessage from './loading-message';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from './ui/empty';

interface StandaloneProductsBoardProps {
  products: IStandaloneProduct[];
  loading?: boolean;
  error?: boolean;
  emptyDescription?: string;
}

export function StandaloneProductsBoard({
  products,
  loading,
  error,
  emptyDescription = 'Aún no hay productos vinculados a este equipo',
}: StandaloneProductsBoardProps) {
  const { user } = useUserProfile();
  const baseUrl = getBaseUrlBasedOnRole(user.role);
  const createUrl = `${baseUrl}/productos-independientes/crear`;

  return (
    <Card className="w-full border-neutral-400">
      <CardHeader>
        <div className="flex gap-3 items-center">
          <IconSquare color="purple">
            <Shapes />
          </IconSquare>
          <CardTitle>Productos Independientes</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <LoadingMessage message="Cargando Productos Independientes" />
        ) : error ? (
          <ErrorCard />
        ) : products && products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 w-full">
            {products.map((product) => (
              <Card
                key={product._id}
                className="w-full h-36 min-w-0 overflow-hidden"
              >
                <CardHeader>
                  <CardTitle className="truncate leading-5">
                    {product.name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-2">
                  <div className="flex flex-wrap gap-1">
                    <Badge variant="outline">{product.category?.name}</Badge>
                  </div>
                  <span className="text-xs text-muted-foreground truncate">
                    {product.subcategory?.name}
                  </span>
                </CardContent>
              </Card>
            ))}

            <Link href={createUrl} className="w-full h-36 block">
              <Card className="w-full border-neutral-400 hover:shadow-xl flex items-center justify-center h-full transition-shadow duration-200">
                <CardContent className="p-0 flex items-center justify-center w-full h-full">
                  <Button variant="ghost" className="pointer-events-none gap-2">
                    <Plus className="h-4 w-4" /> Nuevo Producto
                  </Button>
                </CardContent>
              </Card>
            </Link>
          </div>
        ) : (
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <Shapes />
              </EmptyMedia>
              <EmptyTitle>Sin Productos Independientes</EmptyTitle>
              <EmptyDescription>{emptyDescription}</EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <Button
                asChild
                size="sm"
                variant="outline"
                className="hover:border-neutral-600"
              >
                <Link href={createUrl}>
                  <Plus /> Nuevo Producto
                </Link>
              </Button>
            </EmptyContent>
          </Empty>
        )}
      </CardContent>
    </Card>
  );
}
