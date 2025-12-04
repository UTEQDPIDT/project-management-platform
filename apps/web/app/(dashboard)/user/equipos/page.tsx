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
import LoadingMessage from '@/components/loading-message';
import { CreateTeamForm } from '@/components/forms/create-team-form';

const Page = () => {
  const { data: teams, isLoading: loadingTeams } = useAllTeams();
  console.log('TEAMS', teams);

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
        {loadingTeams ? (
          <LoadingMessage message="Cargando equipos" />
        ) : (
          <CreateTeamForm />
        )}
      </PageContent>
    </div>
  );
};
export default Page;
