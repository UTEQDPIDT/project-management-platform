import {
  Header,
  HeaderAction,
  HeaderDescription,
  HeaderHeading,
  HeaderTitle,
} from '@/components/header';
import { PageContent } from '@/components/page-content';
import TeamsTable from '@/components/teams-table';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import Link from 'next/link';
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
        <HeaderAction>
          <Button asChild>
            <Link href="/admin/equipos/crear">
              <Plus /> Crear Equipo
            </Link>
          </Button>
        </HeaderAction>
      </Header>
      <PageContent>
        <TeamsTable />
      </PageContent>
    </div>
  );
};
export default Page;
