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
import { userProfile } from 'context/profile-provider';
import { Progress } from './ui/progress';

type ProjectCardVariant = 'default' | 'compact';
interface ProjectCardProps {
  project: IProject;
  variant?: ProjectCardVariant;
}

function ProjectCardDefault({
  data,
}: {
  data: ReturnType<typeof useProjectCardData>;
}) {
  return (
    <Card className="w-full hover:shadow-xl min-w-96">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div className="flex gap-2 items-center">
            <IconSquare color="purple">
              <Folder />
            </IconSquare>

            <CardTitle className="line-clamp-1 leading-5">
              {data.name}
            </CardTitle>
          </div>
          <div className="flex gap-1">
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
          <span className="text-xs text-muted-foreground">
            {data.completedActivitiesCount} de {data.totalActivitiesCount}{' '}
            actividades completadas
          </span>
        </div>

        {data.startDate && (
          <div className="flex gap-1">
            <span className="flex gap-1 items-center justify-center text-xs text-muted-foreground">
              <Calendar size={14} />
              {format(data.startDate, "d 'de' MMM 'de' yyyy", { locale: es })}
            </span>
            {data.endDate && (
              <span className="flex gap-1 items-center justify-center text-xs text-muted-foreground">
                <MoveRight size={10} />
                {format(data.endDate, "d 'de' MMM 'de' yyyy", { locale: es })}
              </span>
            )}
          </div>
        )}
      </CardContent>

      <CardFooter className="flex gap-3 justify-start items-center">
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
    <Card className="hover:shadow-xl w-full min-w-52 shrink-0 h-36">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div className="flex gap-2 items-center">
            <CardTitle className="line-clamp-1 leading-5">
              {data.name}
            </CardTitle>
          </div>
          <div className="flex gap-1">
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
          <span className="text-xs text-muted-foreground">
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
}: ProjectCardProps) {
  const data = useProjectCardData(project);
  const { user } = userProfile();
  const rootUrl = user.role === UserRole.ADMIN ? '/admin' : '/user';

  return (
    <Link href={`${rootUrl}/proyectos/${project._id}`}>
      {variant === 'compact' ? (
        <ProjectCardCompact data={data} />
      ) : (
        <ProjectCardDefault data={data} />
      )}
    </Link>
  );
}
