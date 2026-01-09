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
    <div>
      <Header>
        <HeaderHeading>
          <HeaderTitle>Usuarios</HeaderTitle>
          <HeaderDescription>
            Gestiona los usuarios de la plataforma.
          </HeaderDescription>
        </HeaderHeading>
      </Header>
      <PageContent>
        <UsersTable />
      </PageContent>
    </div>
  );
};
export default Page;
