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
import { ITeamMembership, TeamMembershipRole } from '@repo/types';
import { userProfile } from 'context/profile-provider';
import Link from 'next/link';
import { useParams } from 'next/navigation';

const Page = () => {
  const { teamId } = useParams<{ teamId: string }>();
  const { data: team, isLoading: loadingTeam, isError } = useTeam(teamId);
  const { data: projects, isLoading: loadingProjects } =
    useProjectsByTeam(teamId);

  const { user } = userProfile();

  // Defensive: handle undefined userRequests and owner
  const ownerId =
    team?.owner?._id ||
    team?.memberships?.find(
      (m: ITeamMembership) => m.role === TeamMembershipRole.OWNER,
    )?.user?._id;

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
                      <Link href="/user/equipos">Eventos</Link>
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>{team.teamName}</BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </HeaderHeading>

            {user._id === ownerId && (
              <HeaderAction>
                <TeamNotifications team={team} />
                <TeamMenu teamId={teamId} name={team.teamName} />
              </HeaderAction>
            )}
          </Header>

          <PageContent>
            <TeamInfo team={team} />
            <div className="w-full flex gap-4">
              <CardMembers team={team} />
              <ProjectsBoard loading={loadingProjects} projects={projects} />
            </div>
          </PageContent>
        </div>
      )}
    </div>
  );
};
export default Page;
