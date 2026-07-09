import {
  Header,
  HeaderHeading,
  HeaderDescription,
  HeaderTitle,
  HeaderAction,
} from '@/components/header';
import { PageContent } from '@/components/page-content';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { StandaloneProductForm } from '@/components/forms/create-standalone-product-form';

export default function Page() {
  return (
    <div>
      <Header>
        <HeaderHeading>
          <HeaderTitle>Nuevo Producto Independiente</HeaderTitle>
          <HeaderDescription>
            Crea un producto sin relacionarlo con un proyecto.
          </HeaderDescription>
        </HeaderHeading>
        <HeaderAction>
          <Button asChild variant="ghost">
            <Link href="/admin/productos-independientes">
              <ArrowLeft />
              Cancelar
            </Link>
          </Button>
        </HeaderAction>
      </Header>

      <PageContent className="items-center">
        <StandaloneProductForm useDialogClose={false} />
      </PageContent>
    </div>
  );
}