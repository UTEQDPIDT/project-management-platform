'use client';

import EventsBoard from '@/components/events-board';
import {
  Header,
  HeaderHeading,
  HeaderTitle,
  HeaderDescription,
} from '@/components/header';
import { PageContent } from '@/components/page-content';
import { ProjectsBoard } from '@/components/projects-board';
import TeamsBoard from '@/components/teams-board';
import { useEventsByUser } from '@/hooks/events';
import { useProjectsByOwner } from '@/hooks/projects';
import { useTeamsByUser } from '@/hooks/team';
import { useUserProfile } from 'context/profile-provider';
import React from 'react';

const Page = () => {
  const { user } = useUserProfile();
  const {
    data: projects,
    isLoading: loadingProjects,
    isError: errorFetchingProjects,
  } = useProjectsByOwner();
  const {
    data: teams,
    isLoading: loadingTeams,
    isError: errorFetchingTeams,
  } = useTeamsByUser();
  const {
    data: events,
    isLoading: loadingEvents,
    isError: errorFetchingEvents,
  } = useEventsByUser();

  return (
    <div className="w-full min-h-screen">
      <Header>
        <HeaderHeading>
          <HeaderTitle>Panel de Control Administrativo</HeaderTitle>
          <HeaderDescription>
            Bienvenido {user.givenName}. Esto es lo que esta sucediendo.
          </HeaderDescription>
        </HeaderHeading>
      </Header>
      
      {/* Forzamos un flujo vertical con espaciado constante y control de desbordamiento general */}
      <PageContent className="flex flex-col gap-6 w-full max-w-full overflow-hidden">
        
        {/* Contenedor responsivo individual para ProjectsBoard */}
        <div className="w-full overflow-x-auto rounded-xl border border-neutral-200 bg-white shadow-sm">
          <ProjectsBoard
            projects={projects}
            loading={loadingProjects}
            error={errorFetchingProjects}
          />
        </div>

        {/* Contenedor responsivo individual para TeamsBoard */}
        <div className="w-full overflow-x-auto rounded-xl border border-neutral-200 bg-white shadow-sm">
          <TeamsBoard
            teams={teams}
            isLoading={loadingTeams}
            isError={errorFetchingTeams}
          />
        </div>

        {/* Contenedor responsivo individual para EventsBoard */}
        <div className="w-full overflow-x-auto rounded-xl border border-neutral-200 bg-white shadow-sm">
          <EventsBoard
            events={events}
            isLoading={loadingEvents}
            isError={errorFetchingEvents}
          />
        </div>

      </PageContent>
    </div>
  );
};

export default Page;