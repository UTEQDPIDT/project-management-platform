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
      <PageContent className="flex flex-col gap-6 w-full max-w-full overflow-hidden">
        <UsersTable />
      </PageContent>
    </div>
  );
};

export default Page;