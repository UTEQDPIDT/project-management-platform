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
import React from 'react';
import { Plus } from 'lucide-react';

const Page = () => {
  return (
    <div>
      <Header>
        <HeaderHeading>
          <HeaderTitle>Equipos</HeaderTitle>
          <HeaderDescription>
            Encuentra equipos y gestiona los equipos a los que perteneces.
          </HeaderDescription>
        </HeaderHeading>
        <HeaderAction>
          <Button>
            <Plus />
            Crear Equipo
          </Button>
        </HeaderAction>
      </Header>
      <PageContent>
        <div>Equipos</div>
      </PageContent>
    </div>
  );
};
export default Page;
