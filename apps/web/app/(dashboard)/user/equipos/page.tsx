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
import Link from 'next/link';
import { ITeam } from '@repo/types';
import CardTeam from '@/components/card-team';

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
        ) : (
          <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
            {teams.map((team: ITeam) => (
              <CardTeam
                key={team._id}
                teamName={team.teamName}
                summary={team.summary}
                grade={team.grade}
                division={team.division}
                members={team.members}
                collaborators={team.collaborators}
              />
            ))}
          </div>
        )}
      </PageContent>
    </div>
  );
};
export default Page;
