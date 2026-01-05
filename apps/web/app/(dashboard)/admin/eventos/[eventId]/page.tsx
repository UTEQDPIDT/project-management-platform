'use client';

import {
  Header,
  HeaderAction,
  HeaderDescription,
  HeaderHeading,
  HeaderTitle,
} from '@/components/header';
import LoadingMessage from '@/components/loading-message';
import { PageContent } from '@/components/page-content';
import { Button } from '@/components/ui/button';
import { useGetEventById } from '@/hooks/events';
import Link from 'next/link';
import { useParams } from 'next/navigation';

const Page = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const { data: event, isLoading: loadingEvent } = useGetEventById(eventId);

  return (
    <div>
      {loadingEvent ? (
        <LoadingMessage />
      ) : (
        <>
          <Header>
            <HeaderHeading>
              <HeaderTitle>Eventos</HeaderTitle>
            </HeaderHeading>
            <HeaderAction>
              <Button asChild>
                <Link href={`/admin/eventos/${eventId}/editar`}>
                  Editar Evento
                </Link>
              </Button>
            </HeaderAction>
          </Header>

          <PageContent>
            {loadingEvent ? <LoadingMessage /> : <div>Evento</div>}
          </PageContent>
        </>
      )}
    </div>
  );
};

export default Page;
