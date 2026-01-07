import {
  Header,
  HeaderAction,
  HeaderContent,
  HeaderDescription,
  HeaderHeading,
  HeaderTitle,
} from '@/components/header';
import { PageContent } from '@/components/page-content';
import ProjectsTable from '@/components/projects-table';
import { Button } from '@/components/ui/button';

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
      </Header>
      <PageContent>
        <ProjectsTable />
      </PageContent>
    </div>
  );
};
export default Page;
