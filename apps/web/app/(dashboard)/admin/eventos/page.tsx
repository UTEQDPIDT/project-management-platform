'use client';

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
import { Eye, EyeOff, Plus } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

export default function Page() {
  const [showHidden, setShowHidden] = useState(true);

  return (
    <div className="w-full min-h-screen">
      <Header>
        <HeaderHeading>
          <HeaderTitle>{showHidden ? 'Eventos en revisión' : 'Eventos publicados'}</HeaderTitle>
          <HeaderDescription>
            {showHidden
              ? 'Eventos pendientes de aprobación.'
              : 'Eventos aprobados y publicados.'}
          </HeaderDescription>
        </HeaderHeading>
        {/* Ajustado para que el botón fluya correctamente abajo o se estire en móvil */}
        <HeaderAction className="w-full sm:w-auto mt-4 sm:mt-0 flex flex-col sm:flex-row gap-2">
          <Button
            type="button"
            variant={showHidden ? 'default' : 'outline'}
            aria-pressed={showHidden}
            aria-label={showHidden ? 'Mostrar eventos publicados' : 'Mostrar eventos en revisión'}
            onClick={() => setShowHidden((prev) => !prev)}
          >
            {showHidden ? (
              <>
                <Eye /> Ver publicados
              </>
            ) : (
              <>
                <EyeOff /> Ver en revisión
              </>
            )}
          </Button>
          <Button asChild className="w-full sm:w-auto">
            <Link href="/admin/eventos/crear" className="flex items-center justify-center gap-2">
              <Plus className="h-4 w-4" /> 
              <span>Crear Evento</span>
            </Link>
          </Button>
        </HeaderAction>
      </Header>

      <PageContent className="flex flex-col gap-6 w-full max-w-full overflow-hidden">
        <EventsTable showHidden={showHidden} />
      </PageContent>
    </div>
  );
}