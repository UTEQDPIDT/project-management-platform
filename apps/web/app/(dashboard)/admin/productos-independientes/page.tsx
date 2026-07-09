import {
  Header,
  HeaderHeading,
  HeaderDescription,
  HeaderTitle,
  HeaderAction,
} from '@/components/header';
import { PageContent } from '@/components/page-content';
import { StandaloneProductsTable } from '@/components/standalone-products-table';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import Link from 'next/link';

export default function Page() {
  return (
    <div className="w-full min-h-screen">
      <Header>
        <HeaderHeading>
          <HeaderTitle>Productos Independientes</HeaderTitle>
          <HeaderDescription>
            Crea y gestiona productos sin relacion a un proyecto.
          </HeaderDescription>
        </HeaderHeading>
        <HeaderAction className="w-full sm:w-auto mt-4 sm:mt-0">
            <Button asChild className="w-full sm:w-auto">
                <Link href="/admin/productos-independientes/crear" className="flex items-center justify-center gap-2">
                    <Plus className="w-4 h-4" />
                    <span>Crear Producto</span>
                </Link>
            </Button>
        </HeaderAction>
      </Header>

      <PageContent className="flex flex-col gap-6 w-full max-w-full overflow-hidden">
        <StandaloneProductsTable />
      </PageContent>
    </div>
  );
}
