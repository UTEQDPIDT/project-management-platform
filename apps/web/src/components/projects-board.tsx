import { IProject } from '@repo/types';
import { Folder, ListTodo } from 'lucide-react';
import IconSquare from './icon-square';
import { ProjectCard } from './project-card';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from './ui/empty';
import LoadingMessage from './loading-message';

interface ProjectsBoardProps {
  projects: IProject[];
  loading?: boolean;
}

export function ProjectsBoard({ projects, loading }: ProjectsBoardProps) {
  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between ">
          <div className="flex gap-3 items-center">
            <IconSquare className="bg-purple-50 text-purple-800">
              <Folder />
            </IconSquare>

            <CardTitle>Proyectos</CardTitle>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <LoadingMessage message="Cargando Proyectos" />
        ) : projects.length > 0 ? (
          <div className="grid grid-cols-3 gap-4">
            {projects.map((p: IProject) => (
              <ProjectCard key={p._id} project={p} variant="compact" />
            ))}
          </div>
        ) : (
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <Folder />
              </EmptyMedia>
              <EmptyTitle>No Hay Proyectos</EmptyTitle>
              {/* <EmptyDescription>
                No haz seleccionado proyectos.
              </EmptyDescription> */}
            </EmptyHeader>
          </Empty>
        )}
      </CardContent>
    </Card>
  );
}
