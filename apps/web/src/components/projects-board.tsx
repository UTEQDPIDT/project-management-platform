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
          <div className="flex flex-wrap items-center justify-center gap-4">
            {projects.map((p: IProject) => (
              <ProjectCard key={p._id} project={p} variant="compact" />
            ))}
            <Link href={`${baseUrl}/proyectos/crear`} className="w-52 h-36">
              <Card className="w-full border-neutral-400 hover:shadow-xl min-w-52 shrink-0 flex items-center justify-center h-full">
                <CardContent>
                  <Button variant="ghost" disabled>
                    <Plus /> Nuevo Proyecto
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
