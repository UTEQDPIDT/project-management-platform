'use client';

import ErrorCard from '@/components/error-card';
import { UpdateTeamForm } from '@/components/forms/update-team-form';
import {
  Header,
  HeaderAction,
  HeaderHeading,
  HeaderTitle,
} from '@/components/header';
import LoadingMessage from '@/components/loading-message';
import { PageContent } from '@/components/page-content';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useTeam } from '@/hooks/team';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

const Page = () => {
  const { teamId } = useParams<{ teamId: string }>();
  const { data: team, isLoading: loadingTeam, isError } = useTeam(teamId);

  return (
    <div>
      <Header>
        <HeaderHeading className="flex-row gap-2">
          <Badge variant="orange">Editando</Badge>
          <HeaderTitle>{loadingTeam ? 'Equipo' : team.teamName}</HeaderTitle>
        </HeaderHeading>
        <HeaderAction>
          <Button asChild variant="ghost">
            <Link href={`/user/equipos/${teamId}`}>
              <ArrowLeft />
              Cancelar
            </Link>
          </Button>
        </HeaderAction>
      </Header>
      <PageContent className="items-center">
        {loadingTeam ? (
          <div className="w-full h-full flex items-center justify-center">
            <LoadingMessage />
          </div>
        ) : isError ? (
          <ErrorCard />
        ) : (
          <UpdateTeamForm team={team} />
        )}
      </PageContent>
    </div>
  );
};
export default Page;
