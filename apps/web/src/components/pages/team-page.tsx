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
import { ITeamMembership, TeamMembershipRole, UserRole } from '@repo/types';
import { useUserProfile } from 'context/profile-provider';
import Link from 'next/link';
import { useParams } from 'next/navigation';

const TeamPage = () => {
  const { user } = useUserProfile();
  const baseUrl = getBaseUrlBasedOnRole(user.role);

  const { teamId } = useParams<{ teamId: string }>();
  const { data: team, isLoading: loadingTeam, isError } = useTeam(teamId);
  const { data: projects, isLoading: loadingProjects } =
    useProjectsByTeam(teamId);

  const ownerId = team?.memberships.filter(
    (m: ITeamMembership) => m.role === TeamMembershipRole.OWNER,
  )[0]?.user._id;

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

            {(user._id === ownerId || user.role === UserRole.ADMIN) && (
              <HeaderAction className="w-full sm:w-auto mt-4 sm:mt-0 flex flex-wrap sm:flex-nowrap items-center gap-2 justify-end">
                <TeamNotifications team={team} />
                <TeamMenu
                  teamId={teamId}
                  name={team.teamName}
                  isOwner={user._id === ownerId}
                />
              </HeaderAction>
            )}
          </Header>

          <PageContent className="w-full max-w-full overflow-hidden">
            <TeamInfo team={team} />
            <div className="w-full flex flex-col gap-2 p-2 bg-neutral-200 rounded-2xl md:flex-row md:gap-4 md:p-4">
              <div className="w-full lg:max-w-sm flex flex-col gap-4">
                <CardMembers team={team} />
              </div>
              <div className="w-full flex flex-col gap-2">
                <ProjectsBoard loading={loadingProjects} projects={projects} />
              </div>
            </div>
          </PageContent>
        </div>
      )}
    </div>
  );
};
export default TeamPage;
