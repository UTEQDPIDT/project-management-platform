'use client';

import { IActivity } from '@repo/types';
import { ListTodo } from 'lucide-react';
import { ActivityCard } from './activity-card';
import IconSquare from './icon-square';
import LoadingMessage from './loading-message';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from './ui/dialog';
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from './ui/empty';
import { Separator } from './ui/separator';
import { Badge } from './ui/badge';
import { ActivityForm } from './forms/activity-form';
import { ProjectActivityMenu } from './project-activity-menu';

interface Props {
  activities: IActivity[];
  projectId?: string;
  isLoading?: boolean;
  isProjectClosed?: boolean;
}

export function ActivitiesBoard({
  activities = [],
  projectId,
  isLoading = false,
  isProjectClosed = false,
}: Props) {
  const pendingActivities = (activities ?? []).filter(
    (a: IActivity) => a.status === 'Pendiente',
  );

  const inProgressActivities = (activities ?? []).filter(
    (a: IActivity) => a.status === 'En Progreso',
  );

  const completedActivities = (activities ?? []).filter(
    (a: IActivity) => a.status === 'Completado',
  );

  return (
    <Card className="w-full border-neutral-400">
      <CardHeader>
        <div className="flex justify-between ">
          <div className="flex gap-3 items-center">
            <IconSquare color="green">
              <ListTodo />
            </IconSquare>

            <CardTitle>Actividades</CardTitle>
          </div>
          {!isProjectClosed && (
            <Dialog>
              <DialogTrigger className="h-8 px-3 bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground border-transparent">
                Crear
              </DialogTrigger>
              <DialogContent>
                <DialogTitle>Nueva Actividad</DialogTitle>
                <Separator />
                <ActivityForm projectId={projectId} />
              </DialogContent>
            </Dialog>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <LoadingMessage message="Cargando actividades" />
        ) : pendingActivities.length > 0 ||
          inProgressActivities.length > 0 ||
          completedActivities.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <Card className="bg-neutral-300 border border-neutral-400 shadow-none">
              <CardHeader>
                <div className="flex gap-2">
                  <Badge>Pendiente</Badge>
                  <span>{pendingActivities.length}</span>
                </div>
              </CardHeader>
              <CardContent className="grid gap-3 grid-cols-1">
                {pendingActivities.map((a: IActivity) => (
                  <ActivityCard
                    key={a._id}
                    activity={a}
                    options={
                      <ProjectActivityMenu
                        projectId={projectId!}
                        activity={a}
                        activitiesLength={activities.length}
                        isReadOnly={isProjectClosed}
                      />
                    }
                    className="border-neutral-500 hover:border-neutral-800"
                    enableOptions={!isProjectClosed}
                    isReadOnly={isProjectClosed}
                    showPriority
                    showStatus
                  />
                ))}
              </CardContent>
            </Card>

            <Card className="bg-blue-200 border border-blue-600 shadow-none">
              <CardHeader>
                <div className="flex gap-2">
                  <Badge variant="blue">En Progreso</Badge>
                  <span className="text-blue-700">
                    {inProgressActivities.length}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="grid gap-3 grid-cols-1">
                {inProgressActivities.map((a: IActivity) => (
                  <ActivityCard
                    key={a._id}
                    activity={a}
                    options={
                      <ProjectActivityMenu
                        projectId={projectId!}
                        activity={a}
                        activitiesLength={activities.length}
                        isReadOnly={isProjectClosed}
                      />
                    }
                    className="border-neutral-500 hover:border-neutral-800"
                    enableOptions={!isProjectClosed}
                    isReadOnly={isProjectClosed}
                    showPriority
                    showStatus
                  />
                ))}
              </CardContent>
            </Card>

            <Card className="bg-green-200 border border-green-600 shadow-none">
              <CardHeader>
                <div className="flex gap-2">
                  <Badge variant="green">Completado</Badge>
                  <span className="text-green-700">
                    {completedActivities.length}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="grid gap-3 grid-cols-1">
                {completedActivities.map((a: IActivity) => (
                  <ActivityCard
                    key={a._id}
                    activity={a}
                    options={
                      <ProjectActivityMenu
                        projectId={projectId!}
                        activity={a}
                        activitiesLength={activities.length}
                        isReadOnly={isProjectClosed}
                      />
                    }
                    className="border-neutral-500 hover:border-neutral-800"
                    enableOptions={!isProjectClosed}
                    isReadOnly={isProjectClosed}
                    showPriority
                    showStatus
                  />
                ))}
              </CardContent>
            </Card>
          </div>
        ) : (
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <ListTodo />
              </EmptyMedia>
              <EmptyTitle>No Hay Actividades</EmptyTitle>
              <EmptyDescription>
                No haz creado ninguna actividad. Inicia creando tu primer
                activiadad.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        )}
      </CardContent>
    </Card>
  );
}
