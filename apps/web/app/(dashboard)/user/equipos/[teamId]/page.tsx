'use client';

import {
  Header,
  HeaderAction,
  HeaderContent,
  HeaderDescription,
  HeaderHeading,
  HeaderTitle,
} from '@/components/header';
import { PageContent } from '@/components/page-content';
import { Button } from '@/components/ui/button';
import React from 'react';
import { Pencil, Bell } from 'lucide-react';
import LoadingMessage from '@/components/loading-message';
import Link from 'next/link';
import { BadgeVariants, ITeam, TeamsGrade } from '@repo/types';
import { useTeam } from '@/hooks/team';
import { useParams } from 'next/navigation';
import { Badge } from '@/components/ui/badge';

const Page = () => {
  const { teamId } = useParams<{ teamId: string }>();
  const { data: team, isLoading: loadingTeam } = useTeam(teamId);
  console.log('TEAM DATA', team);

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
              <Button variant="outline" size="icon">
                <Bell />
              </Button>

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
