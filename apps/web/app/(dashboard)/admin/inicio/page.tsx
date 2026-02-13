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
    <div>
      <Header>
        <HeaderHeading>
          <HeaderTitle>Panel de Control Administrativo</HeaderTitle>
          <HeaderDescription>
            Bienvenido {user.givenName}. Esto es lo que esta sucediendo.
          </HeaderDescription>
        </HeaderHeading>
      </Header>
      <PageContent>
        <ProjectsBoard
          projects={projects}
          loading={loadingProjects}
          error={errorFetchingProjects}
        />
        <TeamsBoard
          teams={teams}
          isLoading={loadingTeams}
          isError={errorFetchingTeams}
        />
        <EventsBoard
          events={events}
          isLoading={loadingEvents}
          isError={errorFetchingEvents}
        />
      </PageContent>
    </div>
  );
};
export default Page;
