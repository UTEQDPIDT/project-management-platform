import { EventsTable } from '@/components/events-table';
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
import Link from 'next/link';

export default function Page() {
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
        <EventsTable />
      </PageContent>
    </div>
  );
}
