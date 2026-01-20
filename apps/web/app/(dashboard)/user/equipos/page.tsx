'use client';

import {
  Header,
  HeaderAction,
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
import Link from 'next/link';
import { ITeam } from '@repo/types';
import TeamCard from '@/components/team-card';
import ErrorCard from '@/components/error-card';

const Page = () => {
  const { data: teams, isLoading: loadingTeams, isError } = useAllTeams(false);

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
          <Button asChild>
            <Link href={'/user/equipos/crear'}>
              <Plus />
              Crear Equipo
            </Link>
          </Button>
        </HeaderAction>
      </Header>
      <PageContent>
        {loadingTeams ? (
          <LoadingMessage message="Cargando equipos" />
        ) : isError ? (
          <ErrorCard />
        ) : (
          <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
            {teams.map((team: ITeam) => (
              <TeamCard key={team._id} team={team} />
            ))}
          </div>
        )}
      </PageContent>
    </div>
  );
};
export default Page;
