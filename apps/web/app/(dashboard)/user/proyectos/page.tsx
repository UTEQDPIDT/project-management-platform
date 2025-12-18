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
import { Plus } from 'lucide-react';
import Link from 'next/link';
import { useProjectsByOwner } from '@/hooks/projects/use-projects-by-owner';
import LoadingMessage from '@/components/loading-message';
import { IProject } from '@repo/types';
import { ProjectCard } from '@/components/project-card';

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
            <Link href={'/user/proyectos/crear'}>
              <Plus /> Crear proyecto
            </Link>
          </Button>
        </HeaderAction>
      </Header>
      <PageContent>
        {loadingProjects ? (
          <LoadingMessage message="Cargando Proyectos" />
        ) : (
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 px-4">
            {projects.map((p: IProject) => (
              <ProjectCard
                key={p._id}
                _id={p._id}
                name={p.name}
                summary={p.summary}
                organization={p.organization}
                status={p.status}
                trlRating={p.trlRating}
                activities={p.activities}
                files={p.files}
                relatedProjects={p.relatedProjects}
                team={p.team}
                startDate={p.startDate}
                endDate={p.endDate}
              />
            ))}
          </div>
        )}
      </PageContent>
    </div>
  );
};
export default Page;
