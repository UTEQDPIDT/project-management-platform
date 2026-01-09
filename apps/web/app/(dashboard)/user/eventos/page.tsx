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
import { useGetAllEvents } from '@/hooks/events';
import { IEvent } from '@repo/types';
import React from 'react';

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
        ) : (
          <div className="grid gap-4 grid-cols-1 lg:grid-cols-3">
            {events.map((e: IEvent) => (
              <EventCard key={e._id} event={e} />
            ))}
          </div>
        )}
      </PageContent>
    </div>
  );
};
export default Page;
