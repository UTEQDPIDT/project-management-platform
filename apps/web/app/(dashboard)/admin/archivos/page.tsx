'use client';

import FilesTable from '@/components/files-table';
import {
  Header,
  HeaderAction,
  HeaderContent,
  HeaderDescription,
  HeaderHeading,
  HeaderTitle,
} from '@/components/header';
import { PageContent } from '@/components/page-content';
import TeamsTable from '@/components/teams-table';
import { Button } from '@/components/ui/button';
import React from 'react';

const Page = () => {
  return (
    <div>
      <Header>
        <HeaderHeading>
          <HeaderTitle>Archivos</HeaderTitle>
          <HeaderDescription>
            Gestiona los archivos existentes.
          </HeaderDescription>
        </HeaderHeading>
      </Header>
      <PageContent>
        <FilesTable />
      </PageContent>
    </div>
  );
};
export default Page;
