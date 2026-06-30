import {
  Header,
  HeaderDescription,
  HeaderHeading,
  HeaderTitle,
} from '@/components/header';
import { PageContent } from '@/components/page-content';
import UsersTable from '@/components/users-table';

const Page = () => {
  return (
    <div className="w-full min-h-screen">
      <Header>
        <HeaderHeading>
          <HeaderTitle>Usuarios</HeaderTitle>
          <HeaderDescription>
            Gestiona los usuarios de la plataforma.
          </HeaderDescription>
        </HeaderHeading>
      </Header>
      
      {/* Contenedor adaptado con scroll horizontal de seguridad y sombras consistentes */}
      <PageContent className="flex flex-col gap-6 w-full max-w-full overflow-hidden">
        <div className="w-full overflow-x-auto rounded-xl border border-neutral-200 bg-white shadow-sm">
          <UsersTable />
        </div>
      </PageContent>
    </div>
  );
};

export default Page;