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
import Link from 'next/link';

const Page = () => {
  return (
    <div>
      <Header>
        <HeaderHeading>
          <HeaderTitle>Proyectos</HeaderTitle>
          <HeaderDescription>
            Gestiona los proyectos existentes.
          </HeaderDescription>
        </HeaderHeading>
        <HeaderAction>
          <Button asChild>
            <Link href="/admin/proyectos/crear">Crear Proyecto</Link>
          </Button>
        </HeaderAction>
      </Header>
      <PageContent>
        <ProjectsTable />
        <ProductsTable />
      </PageContent>
    </div>
  );
};
export default Page;
