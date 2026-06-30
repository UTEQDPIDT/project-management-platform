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
import { Plus } from 'lucide-react';
import Link from 'next/link';

export default function Page() {
  return (
    <div className="w-full min-h-screen">
      <Header>
        <HeaderHeading>
          <HeaderTitle>Eventos</HeaderTitle>
          <HeaderDescription>
            Crea y gestiona eventos internos y externos.
          </HeaderDescription>
        </HeaderHeading>
        {/* Ajustado para que el botón fluya correctamente abajo o se estire en móvil */}
        <HeaderAction className="w-full sm:w-auto mt-4 sm:mt-0">
          <Button asChild className="w-full sm:w-auto">
            <Link href="/admin/eventos/crear" className="flex items-center justify-center gap-2">
              <Plus className="h-4 w-4" /> 
              <span>Crear Evento</span>
            </Link>
          </Button>
        </HeaderAction>
      </Header>

      <PageContent className="flex flex-col gap-6 w-full max-w-full overflow-hidden">
        <EventsTable />
      </PageContent>
    </div>
  );
}