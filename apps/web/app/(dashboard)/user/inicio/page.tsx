'use client';

import {
  Header,
  HeaderDescription,
  HeaderHeading,
  HeaderTitle,
} from '@/components/header';
import { PageContent } from '@/components/page-content';
import { ProjectsBoard } from '@/components/projects-board';
import TeamsBoard from '@/components/teams-board';
import { useProjectsByOwner } from '@/hooks/projects';
import { useTeamsByUser } from '@/hooks/team';
import { userProfile } from 'context/profile-provider';
import React from 'react';

const Page = () => {
  const { user } = userProfile();
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
        <TeamsBoard
          teams={teams}
          isLoading={loadingTeams}
          isError={errorFetchingTeams}
        />
      </PageContent>
    </div>
  );
};
export default Page;
