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
          <HeaderTitle>Equipos</HeaderTitle>
          <HeaderDescription>
            Gestiona los equipos existentes.
          </HeaderDescription>
        </HeaderHeading>
      </Header>
      <PageContent>
        <TeamsTable />
      </PageContent>
    </div>
  );
};
export default Page;
