'use client';

import { EventCard } from '@/components/event-card';
import {
  Header,
  HeaderDescription,
  HeaderHeading,
  HeaderTitle,
} from '@/components/header';
import LoadingMessage from '@/components/loading-message';
import { PageContent } from '@/components/page-content';
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
} from '@/components/ui/empty';
import { useGetAllEvents } from '@/hooks/events';
import { IEvent } from '@repo/types';
import { Calendar } from 'lucide-react';

const Page = () => {
  const { data: events, isLoading: laodingEvents } = useGetAllEvents();

  return (
    <div>
      <Header>
        <HeaderHeading>
          <HeaderTitle>Eventos</HeaderTitle>
          <HeaderDescription>
            Encuentra y participa en eventos internos y externos.
          </HeaderDescription>
        </HeaderHeading>
      </Header>
      <PageContent>
        {laodingEvents ? (
          <LoadingMessage message="Cargando eventos" />
        ) : events.length > 0 ? (
          <div className="grid gap-4 grid-cols-1 lg:grid-cols-3">
            {events.map((e: IEvent) => (
              <EventCard key={e._id} event={e} />
            ))}
          </div>
        ) : (
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <Calendar />
              </EmptyMedia>
              <EmptyTitle>No Hay Eventos</EmptyTitle>
              <EmptyDescription>
                Espera a que los administradores creen eventos o ponte en
                contacto con ellos para sugerir uno.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        )}
      </PageContent>
    </div>
  );
};
export default Page;
