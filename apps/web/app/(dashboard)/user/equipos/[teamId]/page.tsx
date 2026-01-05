'use client';

import { CardMembers } from '@/components/card-members';
import {
  Header,
  HeaderAction,
  HeaderContent,
  HeaderDescription,
  HeaderHeading,
  HeaderTitle,
} from '@/components/header';
import LoadingMessage from '@/components/loading-message';
import { PageContent } from '@/components/page-content';
import { ProjectsBoard } from '@/components/projects-board';
import { TeamMenu } from '@/components/team-menu';
import { TeamUserRequests } from '@/components/team-user-requests';
import { Badge } from '@/components/ui/badge';
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
import { BadgeVariants, TeamsGrade } from '@repo/types';
import { Bell } from 'lucide-react';
import { useParams } from 'next/navigation';

const Page = () => {
  const { teamId } = useParams<{ teamId: string }>();
  const { data: team, isLoading: loadingTeam } = useTeam(teamId);
  const { data: projects, isLoading: loadingProjects } =
    useProjectsByTeam(teamId);

  let badgeVariant:
    | 'default'
    | 'secondary'
    | 'destructive'
    | 'outline'
    | 'green'
    | 'gray'
    | 'purple'
    | 'orange'
    | null
    | undefined;
  switch (team?.grade) {
    case TeamsGrade.FORMACION:
      badgeVariant = BadgeVariants.GRAY;
      break;
    case TeamsGrade.CONSOLIDADO:
      badgeVariant = BadgeVariants.GREEN;
      break;
  }

  return (
    <div className="w-full h-full">
      {loadingTeam ? (
        <div className="w-full h-full flex items-center justify-center">
          <LoadingMessage />
        </div>
      ) : (
        <div>
          <Header>
            <HeaderHeading>
              <HeaderTitle>{team.teamName}</HeaderTitle>
              <HeaderDescription>{team.division?.name}</HeaderDescription>
            </HeaderHeading>

            <HeaderContent>
              <Badge variant={badgeVariant}>{team.grade}</Badge>
            </HeaderContent>

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
          </Header>

          <PageContent className="px-4">
            <CardMembers team={team} />
            <ProjectsBoard loading={loadingProjects} projects={projects} />
          </PageContent>
        </div>
      )}
    </div>
  );
};
export default Page;
