'use client';

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
          /* Reemplazado flex-wrap desordenado por un CSS Grid fluido e idéntico al de proyectos */
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 w-full">
            {teams.map((t: ITeam) => (
              /* Envoltura consistente para asegurar que TeamCard herede el ancho total de su columna */
              <div key={t._id} className="w-full h-36 flex">
                <TeamCard team={t} variant="compact" className="w-full h-full " />
              </div>
            ))}
            
            <Link href={`${baseUrl}/equipos/crear`} className="w-full h-36 block">
              {/* Eliminados min-w-52 y shrink-0 para evitar desbordes y alinearse al layout adaptativo */}
              <Card className="w-full border-neutral-400 hover:border-neutral-600 hover:shadow-xl flex items-center justify-center h-full transition-all duration-200">
                <CardContent className="p-0 flex items-center justify-center w-full h-full">
                  {/* Removido disabled para mejorar la semántica e interactividad visual */}
                  <Button variant="ghost" className="pointer-events-none gap-2">
                    <Plus className="h-4 w-4" /> Nuevo Equipo
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