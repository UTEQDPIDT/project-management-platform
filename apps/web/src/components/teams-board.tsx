import { getBaseUrlBasedOnRole } from '@/lib/utils';
import { ITeam } from '@repo/types';
import { userProfile } from 'context/profile-provider';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import IconSquare from './icon-square';
import { Plus, Users } from 'lucide-react';
import LoadingMessage from './loading-message';
import ErrorCard from './error-card';
import Link from 'next/link';
import { Button } from './ui/button';
import { TeamCard } from './team-card';

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
  const { user } = userProfile();
  const baseUrl = getBaseUrlBasedOnRole(user.role);

  return (
    <Card className="w-full">
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
        ) : (
          <div className="flex flex-wrap items-center justify-center gap-4">
            {teams.length > 0 &&
              teams.map((t: ITeam) => (
                <TeamCard key={t._id} team={t} variant="compact" />
              ))}
            <Link href={`${baseUrl}/equipos/crear`} className="w-52 h-36">
              <Card className="w-full hover:shadow-xl min-w-52 shrink-0 flex items-center justify-center h-full">
                <CardContent>
                  <Button variant="ghost" disabled>
                    <Plus /> Nuevo Equipo
                  </Button>
                </CardContent>
              </Card>
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
