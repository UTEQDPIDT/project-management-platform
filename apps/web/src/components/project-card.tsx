import { BadgeVariants, IProject, Status } from '@repo/types';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  Calendar,
  Folder,
  MoveRight,
  Paperclip,
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
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from './ui/card';
import { calculateProgress } from '@/lib/utils';
import { Progress } from './ui/progress';

interface ProjectCardProps {
  project: IProject;
}

export function ProjectCard({ project }: ProjectCardProps) {
  const {
    name,
    team,
    owner,
    _id: projectId,
    trlRating,
    summary,
    startDate,
    endDate,
    files,
    activities,
    relatedProjects,
  } = project;

  /**
   * Team member count
   */
  const members = team?.members ?? [];
  const collaborators = team?.collaborators ?? [];

  // 1. Deduplicate using user._id BEFORE mapping
  const uniqueUsers = Array.from(
    new Map([...members, ...collaborators].map((u) => [u._id, u])).values(),
  );

  // 2. Extract only the fields needed for AvatarRow
  const profiles = uniqueUsers.map((u) => ({
    givenName: u.givenName,
    familyName: u.familyName,
    avatarUrl: u.avatarUrl,
  }));

  profiles.push({
    givenName: owner.givenName,
    familyName: owner.familyName,
    avatarUrl: owner.avatarUrl,
  });

  return (
    <Link href={`/user/proyectos/${projectId}`}>
      <Card className="w-full gap-6">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div className="flex gap-2 items-center">
              <IconSquare className="bg-orange-50 text-orange-700">
                <Folder />
              </IconSquare>

              <CardTitle className="line-clamp-1 leading-5">{name}</CardTitle>
            </div>
            <div className="flex gap-1">
              <Badge variant="outline" className="h-6">
                TRL {trlRating}
              </Badge>
            </div>
          </div>
        </CardHeader>

        <CardContent className="flex flex-col h-full gap-4">
          <CardDescription className="h-24 line-clamp-5">
            {summary}
          </CardDescription>

          <div className="flex flex-col gap-2.5 text-xs text-muted-foreground">
            <div className="flex justify-between">
              <span>Progreso</span>
              <div className="flex">
                <span>{calculateProgress(activities)}</span>
                <span>%</span>
              </div>
            </div>
            <Progress value={calculateProgress(activities)} />
          </div>

          <AvatarRow profiles={profiles} />
        </CardContent>

        <CardFooter className="border-t flex gap-2 justify-start items-center">
          <span className="flex gap-1 items-center justify-center text-xs text-muted-foreground">
            <User size={14} />
            {profiles.length}
          </span>
          <span className="flex gap-1 items-center justify-center text-xs text-muted-foreground">
            <SquareCheckBig size={14} />
            {activities.length}
          </span>
          <span className="flex gap-1 items-center justify-center text-xs text-muted-foreground">
            <Paperclip size={14} />
            {files?.length}
          </span>
          <span className="flex gap-1 items-center justify-center text-xs text-muted-foreground">
            <Folder size={14} />
            {relatedProjects?.length}
          </span>
          {startDate && (
            <div className="flex gap-1">
              <span className="flex gap-1 items-center justify-center text-xs text-muted-foreground">
                <Calendar size={14} />
                {format(startDate, "d 'de' MMM 'de' yyyy", { locale: es })}
              </span>
              {endDate && (
                <span className="flex gap-1 items-center justify-center text-xs text-muted-foreground">
                  <MoveRight size={10} />
                  {format(endDate, "d 'de' MMM 'de' yyyy", { locale: es })}
                </span>
              )}
            </div>
          )}
        </CardFooter>
      </Card>
    </Link>
  );
}
