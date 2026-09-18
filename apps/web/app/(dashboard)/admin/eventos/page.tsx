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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Eye, EyeOff, Ellipsis, Plus } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { useUserProfile } from 'context/profile-provider';

export default function Page() {
  const { user } = useUserProfile();
  const [showHidden, setShowHidden] = useState(false);
  const canToggleHidden = Boolean(user?.canCloseProject);

  return (
    <div className="w-full min-h-screen">
      <Header>
        <HeaderHeading>
          <HeaderTitle>{showHidden ? 'Eventos ocultos' : 'Eventos'}</HeaderTitle>
          <HeaderDescription>
            {showHidden
              ? 'Eventos ocultados de los listados generales.'
              : 'Crea y gestiona eventos internos y externos.'}
          </HeaderDescription>
        </HeaderHeading>
        {/* Ajustado para que el botón fluya correctamente abajo o se estire en móvil */}
        <HeaderAction className="w-full sm:w-auto mt-4 sm:mt-0 flex flex-col sm:flex-row gap-2">
          {canToggleHidden && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <Ellipsis />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setShowHidden((prev) => !prev)}>
                  {showHidden ? (
                    <>
                      <Eye />
                      Ver eventos visibles
                    </>
                  ) : (
                    <>
                      <EyeOff />
                      Ver eventos ocultos
                    </>
                  )}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
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