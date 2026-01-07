import {
  Header,
  HeaderAction,
  HeaderContent,
  HeaderDescription,
  HeaderHeading,
  HeaderTitle,
} from '@/components/header';
import { PageContent } from '@/components/page-content';
import { Button } from '@/components/ui/button';
import UsersTable from '@/components/users-table';
import React from 'react';

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
