'use client';

import { getBaseUrlBasedOnRole } from '@/lib/utils';
import { IProject } from '@repo/types';
import { useUserProfile } from 'context/profile-provider';
import { Folder, Plus } from 'lucide-react';
import Link from 'next/link';
import ErrorCard from './error-card';
import IconSquare from './icon-square';
import LoadingMessage from './loading-message';
import { ProjectCard } from './project-card';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from './ui/empty';

interface ProjectsBoardProps {
  projects: IProject[];
  loading?: boolean;
  error?: boolean;
}

export function ProjectsBoard({
  projects,
  loading,
  error,
}: ProjectsBoardProps) {
  const { user } = useUserProfile();
  const baseUrl = getBaseUrlBasedOnRole(user.role);

  return (
    <Card className="w-full border-neutral-400">
      <CardHeader>
        <div className="flex justify-between ">
          <div className="flex gap-3 items-center">
            <IconSquare color="purple">
              <Folder />
            </IconSquare>

            <CardTitle>Proyectos</CardTitle>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <LoadingMessage message="Cargando Proyectos" />
        ) : error ? (
          <ErrorCard />
        ) : projects.length > 0 ? (
          /* Cambiado a un grid responsivo:
            1 columna en móvil, 2 en tablets, 3 en laptops chicas y 4 en pantallas grandes.
            Se eliminó el centrado que desalineaba las tarjetas.
          */
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 w-full">
            {projects.map((p: IProject) => (
              /* Envolvemos la tarjeta para asegurarnos de que herede el ancho total de su columna de manera fluida */
              <div key={p._id} className="w-full h-36 flex">
                <ProjectCard project={p} variant="compact" className="w-full h-full" />
              </div>
            ))}
            
            <Link href={`${baseUrl}/proyectos/crear`} className="w-full h-36 block">
              {/* Eliminado min-w-52 y shrink-0 para que la tarjeta se adapte simétricamente al grid */}
              <Card className="w-full border-neutral-400 hover:shadow-xl flex items-center justify-center h-full transition-shadow duration-200">
                <CardContent className="p-0 flex items-center justify-center w-full h-full">
                  {/* Se quitó 'disabled' para que el botón refleje visualmente que es un elemento interactivo y clickeable */}
                  <Button variant="ghost" className="pointer-events-none gap-2">
                    <Plus className="h-4 w-4" /> Nuevo Proyecto
                  </Button>
                </CardContent>
              </Card>
            </Link>
          </div>
        ) : (
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <Folder />
              </EmptyMedia>
              <EmptyTitle>No Tienes Proyectos</EmptyTitle>
              <EmptyDescription>
                Inicia creando un nuevo proyecto
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <Button asChild size="sm" variant="outline" className="hover:border-neutral-600">
                <Link href={`${baseUrl}/proyectos/crear`}>
                  <Plus /> Nuevo Proyecto
                </Link>
              </Button>
            </EmptyContent>
          </Empty>
        )}
      </CardContent>
    </Card>
  );
}