'use client';

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
import { useAllTeams } from '@/hooks/team';
import { CreateTeamForm } from '@/components/forms/create-team-form';
import Link from 'next/link';

const Page = () => {
  return (
    <div>
      <Header>
        <HeaderHeading>
          <HeaderTitle>Crear Equipo</HeaderTitle>
          <HeaderDescription>
            Llena los detalles del nuevo equipo e invita a los integrantes.
          </HeaderDescription>
        </HeaderHeading>
        <HeaderAction>
          <Button asChild variant="outline">
            <Link href={'/user/equipos'}>Cancelar</Link>
          </Button>
        </HeaderAction>
      </Header>
      <PageContent className="items-center">
        <CreateTeamForm />
      </PageContent>
    </div>
  );
};
export default Page;
