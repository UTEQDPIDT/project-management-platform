import {
  Header,
  HeaderAction,
  HeaderContent,
  HeaderDescription,
  HeaderHeading,
  HeaderTitle,
} from '@/components/header';
import { PageContent } from '@/components/page-content';
import { ProductsTable } from '@/components/products-table';
import ProjectsTable from '@/components/projects-table';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import Link from 'next/link';

const Page = () => {
  return (
    <div className="w-full min-h-screen">
      <Header>
        <HeaderHeading>
          <HeaderTitle>Proyectos</HeaderTitle>
          <HeaderDescription>
            Gestiona los proyectos existentes.
          </HeaderDescription>
        </HeaderHeading>
        {/* Ajustado para que el botón se adapte bien en pantallas pequeñas */}
        <HeaderAction className="w-full sm:w-auto mt-4 sm:mt-0">
          <Button asChild className="w-full sm:w-auto">
            <Link href="/admin/proyectos/crear" className="flex items-center justify-center gap-2">
              <Plus className="h-4 w-4" /> 
              <span>Crear Proyecto</span>
            </Link>
          </Button>
        </HeaderAction>
      </Header>
      <PageContent className="flex flex-col gap-6 w-full max-w-full overflow-hidden">
        <ProjectsTable />
        <ProductsTable />
      </PageContent>
    </div>
  );
};

export default Page;