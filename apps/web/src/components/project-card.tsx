import { IProject } from '@repo/types';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  Calendar,
  Folder,
  MoveRight,
  Paperclip,
  Shapes,
  SquareCheckBig,
  User,
} from 'lucide-react';
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
import { calculateProgress } from '@/lib/utils';
import { Progress } from './ui/progress';
import { useProjectCardData } from '@/hooks/projects';

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
    <Card className="w-full gap-6 hover:shadow-xl min-w-96">
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

      <CardContent className="flex flex-col h-full gap-4">
        <div className="flex flex-col gap-2.5 text-xs text-muted-foreground">
          <div className="flex justify-between">
            <span>Progreso</span>
            <div className="flex">
              <span>{calculateProgress(data.activities)}</span>
              <span>%</span>
            </div>
          </div>
          <Progress value={calculateProgress(data.activities)} />
        </div>

        <AvatarRow profiles={data.profiles} />

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

      <CardFooter className="border-t flex gap-3 justify-start items-center">
        <span className="flex gap-1 items-center justify-center text-xs text-muted-foreground">
          <User size={14} />
          {data.profiles.length}
        </span>
        <span className="flex gap-1 items-center justify-center text-xs text-muted-foreground">
          <SquareCheckBig size={14} />
          {data.activities.length}
        </span>
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
    <Card className="hover:shadow-xl">
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
        <div className="flex flex-col gap-2.5 text-xs text-muted-foreground">
          <div className="flex justify-between">
            <span>Progreso</span>
            <div className="flex">
              <span>{calculateProgress(data.activities)}</span>
              <span>%</span>
            </div>
          </div>
          <Progress value={calculateProgress(data.activities)} />
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

  return (
    <Link href={`/user/proyectos/${project._id}`}>
      {variant === 'compact' ? (
        <ProjectCardCompact data={data} />
      ) : (
        <ProjectCardDefault data={data} />
      )}
    </Link>
  );
}
