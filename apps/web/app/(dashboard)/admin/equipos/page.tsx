import {
  Header,
  HeaderAction,
  HeaderDescription,
  HeaderHeading,
  HeaderTitle,
} from '@/components/header';
import { PageContent } from '@/components/page-content';
import TeamsTable from '@/components/teams-table';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import Link from 'next/link';
import React from 'react';

const Page = () => {
  return (
    <div className="w-full min-h-screen">
      <Header>
        <HeaderHeading>
          <HeaderTitle>Equipos</HeaderTitle>
          <HeaderDescription>
            Gestiona los equipos existentes.
          </HeaderDescription>
        </HeaderHeading>
        {/* Ajustado para que el botón fluya correctamente abajo o se adapte en móvil */}
        <HeaderAction className="w-full sm:w-auto mt-4 sm:mt-0">
          <Button asChild className="w-full sm:w-auto">
            <Link href="/admin/equipos/crear" className="flex items-center justify-center gap-2">
              <Plus className="h-4 w-4" /> 
              <span>Crear Equipo</span>
            </Link>
          </Button>
        </HeaderAction>
      </Header>
      <PageContent className="flex flex-col gap-6 w-full max-w-full overflow-hidden">
        <TeamsTable />
      </PageContent>
    </div>
  );
};

export default Page;