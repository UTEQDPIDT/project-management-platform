'use client';

import { CardMembers } from '@/components/card-members';
import ErrorCard from '@/components/error-card';
import { Header, HeaderAction, HeaderHeading } from '@/components/header';
import LoadingMessage from '@/components/loading-message';
import { PageContent } from '@/components/page-content';
import { ProjectsBoard } from '@/components/projects-board';
import { TeamInfo } from '@/components/team-info';
import { TeamMenu } from '@/components/team-menu';
import { TeamNotifications } from '@/components/team-notifications';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { useProjectsByTeam } from '@/hooks/projects';
import { useTeam } from '@/hooks/team';
import { getBaseUrlBasedOnRole } from '@/lib/utils';
import { userProfile } from 'context/profile-provider';
import Link from 'next/link';
import { useParams } from 'next/navigation';

const TeamPage = () => {
  const { user } = userProfile();
  const baseUrl = getBaseUrlBasedOnRole(user.role);

  const { teamId } = useParams<{ teamId: string }>();
  const { data: team, isLoading: loadingTeam, isError } = useTeam(teamId);
  const { data: projects, isLoading: loadingProjects } =
    useProjectsByTeam(teamId);

  // Defensive: ensure memberships is always an array
  const teamWithMemberships = {
    ...team,
    memberships: Array.isArray(team?.memberships) ? team.memberships : [],
  };

  return (
    <div className="w-full h-full">
      {loadingTeam ? (
        <div className="w-full h-full flex items-center justify-center">
          <LoadingMessage />
        </div>
      ) : isError ? (
        <ErrorCard />
      ) : (
        <div>
          <Header>
            <HeaderHeading>
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem>
                    <BreadcrumbLink asChild>
                      <Link href={`${baseUrl}/equipos`}>Equipos</Link>
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>{team.teamName}</BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </HeaderHeading>

            <HeaderAction>
              <TeamNotifications team={team} />
              <TeamMenu teamId={teamId} name={team.teamName} />
            </HeaderAction>
          </Header>

          <PageContent>
            <TeamInfo team={teamWithMemberships} />
            <div className="w-full flex gap-4">
              <CardMembers team={teamWithMemberships} />
              <ProjectsBoard loading={loadingProjects} projects={projects} />
            </div>
          </PageContent>
        </div>
      )}
    </div>
  );
};
export default TeamPage;
