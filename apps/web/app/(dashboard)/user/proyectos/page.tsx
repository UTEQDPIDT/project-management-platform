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
import { Folder, Plus } from 'lucide-react';
import Link from 'next/link';
import { useProjectsByOwner } from '@/hooks/projects/use-projects-by-owner';
import LoadingMessage from '@/components/loading-message';
import { IProject } from '@repo/types';
import { ProjectCard } from '@/components/project-card';
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty';

const Page = () => {
  const { data: projects, isLoading: loadingProjects } = useProjectsByOwner();

  return (
    <div>
      <Header>
        <HeaderHeading>
          <HeaderTitle>Proyectos</HeaderTitle>
          <HeaderDescription>
            Administra y dale seguimiento a tus proyectos.
          </HeaderDescription>
        </HeaderHeading>

        <HeaderAction>
          <Button asChild>
            <Link href={'/user/proyectos/crear'}>Crear Proyecto</Link>
          </Button>
        </HeaderAction>
      </Header>
      <PageContent>
        {loadingProjects ? (
          <LoadingMessage message="Cargando Proyectos" />
        ) : projects.length > 0 ? (
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 px-4">
            {projects.map((p: IProject) => (
              <ProjectCard key={p._id} project={p} />
            ))}
          </div>
        ) : (
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <Folder />
              </EmptyMedia>
              <EmptyTitle>No Tienes Proyectos</EmptyTitle>
              <EmptyDescription>
                No haz creado ningun proyecto. Inicia creanto tu primer
                proyecto.
              </EmptyDescription>
              <EmptyContent>
                <Button asChild>
                  <Link href={'/user/proyectos/crear'}>Crear Proyecto</Link>
                </Button>
              </EmptyContent>
            </EmptyHeader>
          </Empty>
        )}
      </PageContent>
    </div>
  );
};
export default Page;
