'use client';

import { CardMembers } from '@/components/card-members';
import ErrorCard from '@/components/error-card';
import { Header, HeaderAction, HeaderHeading } from '@/components/header';
import LoadingMessage from '@/components/loading-message';
import { PageContent } from '@/components/page-content';
import { ProjectsBoard } from '@/components/projects-board';
import { TeamInfo } from '@/components/team-info';
import { TeamMenu } from '@/components/team-menu';
import { TeamUserRequests } from '@/components/team-user-requests';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Separator } from '@/components/ui/separator';
import { useProjectsByTeam } from '@/hooks/projects';
import { useTeam } from '@/hooks/team';
import { userProfile } from 'context/profile-provider';
import { Bell } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

const Page = () => {
  const { teamId } = useParams<{ teamId: string }>();
  const { data: team, isLoading: loadingTeam, isError } = useTeam(teamId);
  const { data: projects, isLoading: loadingProjects } =
    useProjectsByTeam(teamId);

  const { user } = userProfile();

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

            {user._id === team.owner._id && (
              <HeaderAction>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon-sm">
                      <Bell />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Notificaciones</DropdownMenuLabel>
                    <Separator />
                    {team.userRequests.length > 0 ? (
                      <TeamUserRequests
                        teamId={teamId}
                        request={team.userRequests}
                      />
                    ) : (
                      <div className="px-2 py-3">
                        <span className="text-muted-foreground text-sm">
                          No hay notificaciones
                        </span>
                      </div>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>

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
