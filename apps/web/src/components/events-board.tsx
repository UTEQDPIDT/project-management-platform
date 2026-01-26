import { IEvent, UserRole } from '@repo/types';
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import IconSquare from './icon-square';
import { ArrowUpRight, Calendar, Plus } from 'lucide-react';
import LoadingMessage from './loading-message';
import ErrorCard from './error-card';
import { EventCard } from './event-card';
import Link from 'next/link';
import { Button } from './ui/button';
import { userProfile } from 'context/profile-provider';
import { getBaseUrlBasedOnRole } from '@/lib/utils';
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from './ui/empty';

type EventsBoardProps = {
  events: IEvent[];
  isLoading?: boolean;
  isError?: boolean;
};

export default function EventsBoard({
  events,
  isLoading,
  isError,
}: EventsBoardProps) {
  const { user } = userProfile();
  const baseUrl = getBaseUrlBasedOnRole(user.role);
  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between ">
          <div className="flex gap-3 items-center">
            <IconSquare color="green">
              <Calendar />
            </IconSquare>

            <CardTitle>Eventos</CardTitle>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <LoadingMessage message="Cargando Eventos" />
        ) : isError ? (
          <ErrorCard />
        ) : (
          <div className="flex flex-wrap items-center justify-center gap-4">
            {events.length > 0 ? (
              events.map((e: IEvent) => (
                <EventCard key={e._id} event={e} variant="compact" />
              ))
            ) : user.role === UserRole.ADMIN ? (
              <Empty>
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <Calendar />
                  </EmptyMedia>
                  <EmptyTitle>No Hay Eventos</EmptyTitle>
                  <EmptyDescription>
                    No te has creado a ningún evento. Inicia creando tu primer
                    evento.
                  </EmptyDescription>
                </EmptyHeader>
              </Empty>
            ) : (
              <Empty>
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <Calendar />
                  </EmptyMedia>
                  <EmptyTitle>No Hay Eventos</EmptyTitle>
                  <EmptyDescription>
                    No te has inscrito a ningún evento. Inicia entrando a tu
                    primer evento.
                  </EmptyDescription>
                </EmptyHeader>
                <EmptyContent>
                  <Button asChild variant="link">
                    <Link href={`${baseUrl}/eventos`}>
                      Ir a eventos <ArrowUpRight />
                    </Link>
                  </Button>
                </EmptyContent>
              </Empty>
            )}
            {user.role === UserRole.ADMIN && (
              <Link href={`${baseUrl}/eventos/crear`} className="w-52 h-36">
                <Card className="w-full hover:shadow-xl min-w-52 shrink-0 flex items-center justify-center h-full">
                  <CardContent>
                    <Button variant="ghost" disabled>
                      <Plus /> Nuevo Evento
                    </Button>
                  </CardContent>
                </Card>
              </Link>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
