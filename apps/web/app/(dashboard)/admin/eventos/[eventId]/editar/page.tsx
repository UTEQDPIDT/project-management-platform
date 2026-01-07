'use client';

import EventForm from '@/components/forms/event-form';
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
import { useGetEventById } from '@/hooks/events';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

const Page = () => {
  const { eventId } = useParams<{ eventId: 'string' }>();
  const { data: event, isLoading: loadingEvent } = useGetEventById(eventId);

  return (
    <div>
      <Header>
        <HeaderHeading className="flex-row gap-2">
          <Badge variant="orange">Editando</Badge>
          <HeaderTitle>{loadingEvent ? 'Evento' : event.name}</HeaderTitle>
        </HeaderHeading>
        <HeaderAction>
          <Button asChild variant="ghost">
            <Link href={'/admin/eventos'}>
              <ArrowLeft />
              Cancelar
            </Link>
          </Button>
        </HeaderAction>
      </Header>
      <PageContent className="items-center">
        {loadingEvent ? <LoadingMessage /> : <EventForm event={event} />}
      </PageContent>
    </div>
  );
};

export default Page;
