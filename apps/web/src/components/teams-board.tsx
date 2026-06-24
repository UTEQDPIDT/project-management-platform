import { getBaseUrlBasedOnRole } from '@/lib/utils';
import { ITeam } from '@repo/types';
import { useUserProfile } from 'context/profile-provider';
import { ArrowUpRight, Plus, Users } from 'lucide-react';
import Link from 'next/link';
import ErrorCard from './error-card';
import IconSquare from './icon-square';
import LoadingMessage from './loading-message';
import { TeamCard } from './team-card';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from './ui/empty';

type TeamsBoardProps = {
  teams: ITeam[];
  isLoading?: boolean;
  isError?: boolean;
};

export default function TeamsBoard({
  teams,
  isLoading,
  isError,
}: TeamsBoardProps) {
  const { user } = useUserProfile();
  const baseUrl = getBaseUrlBasedOnRole(user.role);

  return (
    <Card className="w-full border-neutral-400">
      <CardHeader>
        <div className="flex justify-between ">
          <div className="flex gap-3 items-center">
            <IconSquare color="blue">
              <Users />
            </IconSquare>

            <CardTitle>Equipos</CardTitle>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <LoadingMessage message="Cargando Equipos" />
        ) : isError ? (
          <ErrorCard />
        ) : teams.length > 0 ? (
          <div className="flex flex-wrap items-center justify-center gap-4">
            {teams.map((t: ITeam) => (
              <TeamCard key={t._id} team={t} variant="compact" />
            ))}
            <Link href={`${baseUrl}/equipos/crear`} className="w-52 h-36">
              <Card className="w-full border-neutral-400 hover:border-neutral-600 hover:shadow-xl min-w-52 shrink-0 flex items-center justify-center h-full">
                <CardContent>
                  <Button variant="ghost" disabled>
                    <Plus /> Nuevo Equipo
                  </Button>
                </CardContent>
              </Card>
            </Link>
          </div>
        ) : (
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <Users />
              </EmptyMedia>
              <EmptyTitle>No Tienes Equipos</EmptyTitle>
              <EmptyDescription>
                Inicia creando un nuevo equipo o unete a un equipo existente.
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <Button asChild size="sm" variant="outline" className="hover:border-neutral-600">
                <Link href={`${baseUrl}/equipos/crear`}>
                  <Plus /> Nuevo Equipo
                </Link>
              </Button>
              <Button asChild size="sm" variant="ghost">
                <Link href={`${baseUrl}/equipos`}>
                  Ver equipos <ArrowUpRight />
                </Link>
              </Button>
            </EmptyContent>
          </Empty>
        )}
      </CardContent>
    </Card>
  );
}
