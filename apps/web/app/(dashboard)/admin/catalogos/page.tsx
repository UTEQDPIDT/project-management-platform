import {
  Header,
  HeaderDescription,
  HeaderHeading,
  HeaderTitle,
} from '@/components/header';
import { PageContent } from '@/components/page-content';
import AdminCatalogsManager from '@/components/admin-catalogs-manager';

const Page = () => {
  return (
    <div className="w-full min-h-screen">
      <Header>
        <HeaderHeading>
          <HeaderTitle>Catálogos</HeaderTitle>
          <HeaderDescription>
            Agrega, edita y elimina elementos globales de catálogos.
          </HeaderDescription>
        </HeaderHeading>
      </Header>

      <PageContent className="flex flex-col gap-6 w-full max-w-full overflow-hidden">
        <AdminCatalogsManager />
      </PageContent>
    </div>
  );
};

export default Page;
