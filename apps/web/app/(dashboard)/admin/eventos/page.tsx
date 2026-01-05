'use client';

import {
  Header,
  HeaderAction,
  HeaderContent,
  HeaderDescription,
  HeaderHeading,
  HeaderTitle,
} from '@/components/header';
import { PageContent } from '@/components/page-content';
import { Button } from '@/components/ui/button';
import { useGetAllEvents } from '@/hooks/events';
import Link from 'next/link';

const Page = () => {
  const { data: events, isLoading: loadingEvents } = useGetAllEvents();

  return (
    <div>
      <Header>
        <HeaderHeading>
          <HeaderTitle>Eventos</HeaderTitle>
          <HeaderDescription>
            Crea y gestiona eventos internos y externos.
          </HeaderDescription>
        </HeaderHeading>
        <HeaderAction>
          <Button asChild>
            <Link href="/admin/eventos/crear">Crear Evento</Link>
          </Button>
        </HeaderAction>
      </Header>

      <PageContent>
        <div>Eventos</div>
      </PageContent>
    </div>
  );
};
export default Page;
