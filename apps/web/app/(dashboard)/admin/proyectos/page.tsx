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
import { ProductsTable } from '@/components/products-table';
import ProjectsTable from '@/components/projects-table';
import { Button } from '@/components/ui/button';
import { Eye, EyeOff, Plus } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

const Page = () => {
  const [showHidden, setShowHidden] = useState(true);

  return (
    <div className="w-full min-h-screen">
      <Header>
        <HeaderHeading>
          <HeaderTitle>{showHidden ? 'Proyectos en revisión' : 'Proyectos publicados'}</HeaderTitle>
          <HeaderDescription>
            {showHidden
              ? 'Proyectos en revisión antes de publicarse en los listados generales.'
              : 'Gestiona los proyectos existentes.'}
          </HeaderDescription>
        </HeaderHeading>
        {/* Ajustado para que el botón se adapte bien en pantallas pequeñas */}
        <HeaderAction className="w-full sm:w-auto mt-4 sm:mt-0 flex flex-col sm:flex-row gap-2">
          <Button
            type="button"
            variant={showHidden ? 'default' : 'outline'}
            aria-pressed={showHidden}
            aria-label={
              showHidden
                ? 'Mostrar proyectos publicados'
                : 'Mostrar proyectos en revisión'
            }
            onClick={() => setShowHidden((prev) => !prev)}
          >
            {showHidden ? (
              <>
                <Eye />
                Ver publicados
              </>
            ) : (
              <>
                <EyeOff />
                Ver en revisión
              </>
            )}
          </Button>
          <Button asChild className="w-full sm:w-auto">
            <Link href="/admin/proyectos/crear" className="flex items-center justify-center gap-2">
              <Plus className="h-4 w-4" /> 
              <span>Crear Proyecto</span>
            </Link>
          </Button>
        </HeaderAction>
      </Header>
      <PageContent className="flex flex-col gap-6 w-full max-w-full overflow-hidden">
        <ProjectsTable showHidden={showHidden} />
        {!showHidden && <ProductsTable />}
      </PageContent>
    </div>
  );
};

export default Page;