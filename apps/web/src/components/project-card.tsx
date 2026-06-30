'use client';

import { IProject, UserRole } from '@repo/types';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Calendar, Folder, MoveRight, Paperclip, Shapes } from 'lucide-react';
import Link from 'next/link';
import AvatarRow from './avatar-row';
import IconSquare from './icon-square';
import { Badge } from './ui/badge';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from './ui/card';
import { useProjectCardData } from '@/hooks/projects';
import { useUserProfile } from 'context/profile-provider';
import { Progress } from './ui/progress';

type ProjectCardVariant = 'default' | 'compact';
interface ProjectCardProps {
  project: IProject;
  variant?: ProjectCardVariant;
  className?: string;
}

function ProjectCardDefault({
  data,
}: {
  data: ReturnType<typeof useProjectCardData>;
}) {
  return (
    /* Eliminado min-w-96 para permitir que se adapte de forma fluida a layouts de una sola columna en móviles */
    <Card className="w-full hover:shadow-xl transition-shadow duration-200">
      <CardHeader>
        <div className="flex justify-between items-center gap-2">
          <div className="flex gap-2 items-center min-w-0">
            <IconSquare color="purple">
              <Folder />
            </IconSquare>

            <CardTitle className="line-clamp-1 leading-5">
              {data.name}
            </CardTitle>
          </div>
          <div className="flex gap-1 shrink-0">
            <Badge variant="outline" className="h-6">
              TRL {data.trlRating}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex flex-col gap-4">
        {/* Progress Bar */}
        <div className="w-full flex flex-col gap-1">
          <div className="flex justify-between items-center text-xs">
            <span>Progreso</span>
            <span>{Math.round(data.progress)}%</span>
          </div>
          <Progress value={data.progress} />
          <span className="text-xs text-muted-foreground line-clamp-1">
            {data.completedActivitiesCount} de {data.totalActivitiesCount}{' '}
            actividades completadas
          </span>
        </div>

        {data.startDate && (
          /* flex-wrap agregado para que en celulares muy angostos las fechas se acomoden sin desbordar */
          <div className="flex flex-wrap gap-x-2 gap-y-1">
            <span className="flex gap-1 items-center justify-center text-xs text-muted-foreground whitespace-nowrap">
              <Calendar size={14} />
              {format(data.startDate, "d 'de' MMM 'de' yyyy", { locale: es })}
            </span>
            {data.endDate && (
              <span className="flex gap-1 items-center justify-center text-xs text-muted-foreground whitespace-nowrap">
                <MoveRight size={10} />
                {format(data.endDate, "d 'de' MMM 'de' yyyy", { locale: es })}
              </span>
            )}
          </div>
        )}
      </CardContent>

      <CardFooter className="flex gap-3 justify-start items-center flex-wrap">
        <AvatarRow profiles={data.profiles} />
        <span className="flex gap-1 items-center justify-center text-xs text-muted-foreground">
          <Shapes size={14} />
          {data.products?.length}
        </span>
        <span className="flex gap-1 items-center justify-center text-xs text-muted-foreground">
          <Paperclip size={14} />
          {data.files?.length}
        </span>
        <span className="flex gap-1 items-center justify-center text-xs text-muted-foreground">
          <Folder size={14} />
          {data.relatedProjects?.length}
        </span>
      </CardFooter>
    </Card>
  );
}

function ProjectCardCompact({
  data,
}: {
  data: ReturnType<typeof useProjectCardData>;
}) {
  return (
    /* Eliminado min-w-52 y shrink-0 para que crezca o decrezca simétricamente en base al espacio de su grid */
    <Card className="hover:shadow-xl w-full h-36 transition-shadow duration-200">
      <CardHeader>
        <div className="flex justify-between items-center gap-2">
          <div className="flex gap-2 items-center min-w-0">
            <CardTitle className="line-clamp-1 leading-5">
              {data.name}
            </CardTitle>
          </div>
          <div className="flex gap-1 shrink-0">
            <Badge variant="outline" className="h-6">
              TRL {data.trlRating}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Progress Bar */}
        <div className="w-full flex flex-col gap-1">
          <div className="flex justify-between items-center text-xs">
            <span>Progreso</span>
            <span>{Math.round(data.progress)}%</span>
          </div>
          <Progress value={data.progress} />
          <span className="text-xs text-muted-foreground line-clamp-1">
            {data.completedActivitiesCount} de {data.totalActivitiesCount}{' '}
            actividades completadas
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

export function ProjectCard({
  project,
  variant = 'default',
  className = '',
}: ProjectCardProps) {
  const data = useProjectCardData(project);
  const { user } = useUserProfile();
  const rootUrl = user.role === UserRole.ADMIN ? '/admin' : '/user';

  return (
    /* Pasamos el className al Link (y le inyectamos w-full por defecto) para asegurar que se comporte de forma elástica en los layouts */
    <Link href={`${rootUrl}/proyectos/${project._id}`} className={`w-full block ${className}`}>
      {variant === 'compact' ? (
        <ProjectCardCompact data={data} />
      ) : (
        <ProjectCardDefault data={data} />
      )}
    </Link>
  );
}