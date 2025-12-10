'use client';

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
import { ProfileInfo } from '@/components/profile-info';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Separator } from '@/components/ui/separator';
import { useAcceptRequest, useRejectRequest, useTeam } from '@/hooks/team';
import { BadgeVariants, IUser, TeamsGrade } from '@repo/types';
import { Bell, Pencil } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

const Page = () => {
  const { teamId } = useParams<{ teamId: string }>();
  const { data: team, isLoading: loadingTeam } = useTeam(teamId);
  console.log('TEAM DATA', team);
  const acceptRequestMutation = useAcceptRequest();
  const rejectRequestMutation = useRejectRequest();

  let badgeVariant:
    | 'default'
    | 'secondary'
    | 'destructive'
    | 'outline'
    | 'green'
    | 'gray'
    | 'pruple'
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
                  <Button variant="outline" size="icon">
                    <Bell />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Notificaciones</DropdownMenuLabel>
                  <Separator />
                  {team.userRequests.length > 0 ? (
                    <div className="flex flex-col px-2 pb-3 gap-3 overflow-y-auto max-h-96 snap-y">
                      <span className="text-muted-foreground text-xs snap-start pt-4">
                        Solicitudes de acceso
                      </span>
                      {team.userRequests.map((user: IUser) => (
                        <div
                          key={user._id}
                          className="flex flex-col snap-start"
                        >
                          <div className="flex justify-between gap-4 items-center">
                            <ProfileInfo
                              givenName={user.givenName}
                              email={user.email}
                              avatarUrl={user.avatarUrl}
                            />
                            <div className="flex gap-2">
                              <Button
                                disabled={rejectRequestMutation.isPending}
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                  rejectRequestMutation.mutate({
                                    teamId: teamId,
                                    userId: user._id,
                                  })
                                }
                              >
                                Rechazar
                              </Button>
                              <Button
                                disabled={acceptRequestMutation.isPending}
                                size="sm"
                                onClick={() =>
                                  acceptRequestMutation.mutate({
                                    teamId: teamId,
                                    userId: user._id,
                                  })
                                }
                              >
                                Aceptar
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="px-2 py-3">
                      <span className="text-muted-foreground text-sm">
                        No hay notificaciones
                      </span>
                    </div>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>

              <Button variant="outline" asChild>
                <Link href={'/user/equipos/editar'}>
                  <Pencil />
                  Editar
                </Link>
              </Button>
            </HeaderAction>
          </Header>

          <PageContent>
            <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
              pagina de equipo cool
            </div>
          </PageContent>
        </div>
      )}
    </div>
  );
};
export default Page;
