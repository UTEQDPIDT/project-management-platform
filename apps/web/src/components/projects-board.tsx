import { IProject } from '@repo/types';
import { Folder, Plus } from 'lucide-react';
import IconSquare from './icon-square';
import { ProjectCard } from './project-card';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import LoadingMessage from './loading-message';
import ErrorCard from './error-card';
import { Button } from './ui/button';
import Link from 'next/link';
import { userProfile } from 'context/profile-provider';
import { getBaseUrlBasedOnRole } from '@/lib/utils';

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
  const { user } = userProfile();
  const baseUrl = getBaseUrlBasedOnRole(user.role);

  return (
    <Card className="w-full">
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
        ) : (
          <div className="flex flex-wrap items-center justify-center gap-4">
            {projects.length &&
              projects.map((p: IProject) => (
                <ProjectCard key={p._id} project={p} variant="compact" />
              ))}
            <Link href={`${baseUrl}/proyectos/crear`} className="w-52 h-36">
              <Card className="w-full hover:shadow-xl min-w-52 shrink-0 flex items-center justify-center h-full">
                <CardContent>
                  <Button variant="ghost" disabled>
                    <Plus /> Nuevo Proyecto
                  </Button>
                </CardContent>
              </Card>
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
