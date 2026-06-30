'use client';

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
import { useUserProfile } from 'context/profile-provider';
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
  const { user } = useUserProfile();
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
        ) : events.length > 0 ? (
          /* Grid responsivo idéntico al de proyectos y equipos: de 1 a 4 columnas */
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 w-full">
            {events.map((e: IEvent) => (
              <div key={e._id} className="w-full h-36 flex">
                <EventCard event={e} variant="compact" className="w-full h-full" />
              </div>
            ))}
            
            {user.role === UserRole.ADMIN && (
              <Link href={`${baseUrl}/eventos/crear`} className="w-full h-36 block">
                <Card className="w-full border-neutral-200 hover:shadow-xl flex items-center justify-center h-full transition-shadow duration-200">
                  <CardContent className="p-0 flex items-center justify-center w-full h-full">
                    <Button variant="ghost" className="pointer-events-none gap-2">
                      <Plus className="h-4 w-4" /> Nuevo Evento
                    </Button>
                  </CardContent>
                </Card>
              </Link>
            )}
          </div>
        ) : (
          /* Fuera del grid para mantener el centrado nativo del estado vacío */
          <div className="w-full flex items-center justify-center">
            {user.role === UserRole.ADMIN ? (
              <Empty>
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <Calendar />
                  </EmptyMedia>
                  <EmptyTitle>No Hay Eventos</EmptyTitle>
                  <EmptyDescription>
                    Inicia creando un nuevo evento
                  </EmptyDescription>
                </EmptyHeader>
                <EmptyContent>
                  <Button asChild size="sm" variant="outline">
                    <Link href={`${baseUrl}/eventos/crear`}>
                      <Plus /> Nuevo Evento
                    </Link>
                  </Button>
                </EmptyContent>
              </Empty>
            ) : (
              <Empty>
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <Calendar />
                  </EmptyMedia>
                  <EmptyTitle>No Hay Eventos</EmptyTitle>
                  <EmptyDescription>
                    Inicia entrando a tu primer evento
                  </EmptyDescription>
                </EmptyHeader>
                <EmptyContent>
                  <Button asChild variant="ghost" size="sm">
                    <Link href={`${baseUrl}/eventos`}>
                      Ir a eventos <ArrowUpRight />
                    </Link>
                  </Button>
                </EmptyContent>
              </Empty>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}