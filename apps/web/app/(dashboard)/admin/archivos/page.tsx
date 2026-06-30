import FilesTable from '@/components/files-table';
import {
  Header,
  HeaderDescription,
  HeaderHeading,
  HeaderTitle,
} from '@/components/header';
import { PageContent } from '@/components/page-content';

import React from 'react';

const Page = () => {
  return (
    <div className="w-full min-h-screen">
      <Header>
        <HeaderHeading>
          <HeaderTitle>Archivos</HeaderTitle>
          <HeaderDescription>
            Gestiona los archivos existentes.
          </HeaderDescription>
        </HeaderHeading>
      </Header>
      <PageContent className="flex flex-col gap-6 w-full max-w-full overflow-hidden">
        <FilesTable />
      </PageContent>
    </div>
  );
};

export default Page;