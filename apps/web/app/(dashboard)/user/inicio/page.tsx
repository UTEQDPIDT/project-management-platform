'use client';

import EventsBoard from '@/components/events-board';
import {
  Header,
  HeaderDescription,
  HeaderHeading,
  HeaderTitle,
} from '@/components/header';
import { PageContent } from '@/components/page-content';
import { ProjectsBoard } from '@/components/projects-board';
import TeamsBoard from '@/components/teams-board';
import { useEventsByUser } from '@/hooks/events';
import { useProjectsByOwner } from '@/hooks/projects';
import { useStandaloneProductsByUser } from '@/hooks/standalone-products';
import { StandaloneProductsBoard } from '@/components/standalone-products-board';
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
    data: standaloneProducts,
    isLoading: loadingStandaloneProducts,
    isError: errorFetchingStandaloneProducts,
  } = useStandaloneProductsByUser(user._id);
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
          <HeaderTitle>Panel de Control</HeaderTitle>
          <HeaderDescription>Bienvenido {user.givenName}</HeaderDescription>
        </HeaderHeading>
      </Header>
      <PageContent>
        <ProjectsBoard
          projects={projects}
          loading={loadingProjects}
          error={errorFetchingProjects}
        />
        <StandaloneProductsBoard
          products={standaloneProducts}
          loading={loadingStandaloneProducts}
          error={errorFetchingStandaloneProducts}
          emptyDescription="Inicia creando un nuevo producto independiente"
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
