'use client';

import { IStandaloneProduct } from '@repo/types';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Calendar, Shapes } from 'lucide-react';
import { useStandaloneProductsByUser } from '@/hooks/standalone-products';
import ErrorCard from './error-card';
import IconSquare from './icon-square';
import LoadingMessage from './loading-message';
import { StandaloneProductActionsCell } from './standalone-products-table';
import { Badge } from './ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from './ui/empty';

function StandaloneProductCard({ product }: { product: IStandaloneProduct }) {
  return (
    <Card className="w-full min-w-60 overflow-hidden hover:shadow-xl transition-shadow duration-200">
      <CardHeader className="min-w-0">
        <div className="flex w-full min-w-0 justify-between items-center gap-2">
          <div className="flex flex-1 gap-2 items-center min-w-0">
            <IconSquare color="purple">
              <Shapes />
            </IconSquare>
            <CardTitle className="min-w-0 flex-1 truncate leading-5">
              {product.name}
            </CardTitle>
          </div>
          <div className="shrink-0">
            <StandaloneProductActionsCell product={product} />
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <div className="flex flex-wrap gap-1">
          <Badge variant="outline">{product.category?.name}</Badge>
          <Badge variant="outline">{product.subcategory?.name}</Badge>
        </div>
        <span className="flex gap-1 items-center text-xs text-muted-foreground">
          <Calendar size={14} />
          {format(product.createdAt, "d 'de' MMM 'de' yyyy", { locale: es })}
        </span>
      </CardContent>
    </Card>
  );
}

export function StandaloneProductsGallery({ userId }: { userId: string }) {
  const { data, isLoading, isError } = useStandaloneProductsByUser(userId);
  const products = (data ?? []) as IStandaloneProduct[];

  if (isLoading) {
    return <LoadingMessage message="Cargando productos independientes" />;
  }

  if (isError) return <ErrorCard />;

  if (products.length === 0) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Shapes />
          </EmptyMedia>
          <EmptyTitle>No Tienes Productos Independientes</EmptyTitle>
          <EmptyDescription>
            Inicia creando tu primer producto independiente
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    <div className="grid gap-4 grid-cols-1 lg:grid-cols-3">
      {products.map((product) => (
        <StandaloneProductCard key={product._id} product={product} />
      ))}
    </div>
  );
}
