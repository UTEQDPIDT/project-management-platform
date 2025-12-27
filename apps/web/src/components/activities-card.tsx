'use client';

import { IActivity } from '@repo/types';
import { Circle, ListTodo } from 'lucide-react';
import { ActivityCard } from './activity-card';
import IconSquare from './icon-square';
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

interface Props {
  activities: IActivity[];
  projectId: string;
}

export function ActivitiesCard({ activities, projectId }: Props) {
  const pendingActivities = activities.filter(
    (a: IActivity) => a.status === 'Pendiente',
  );

  const inProgressActivities = activities.filter(
    (a: IActivity) => a.status === 'En Progreso',
  );

  const completedActivities = activities.filter(
    (a: IActivity) => a.status === 'Completado',
  );

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between ">
          <div className="flex gap-3 items-center">
            <IconSquare className="bg-green-50 text-green-800">
              <ListTodo />
            </IconSquare>

            <CardTitle>Actividades</CardTitle>
          </div>
          <Dialog>
            <DialogTrigger className="h-7 px-3 bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground border-transparent">
              Crear
            </DialogTrigger>
            <DialogContent>
              <DialogTitle>Nueva Actividad</DialogTitle>
              <Separator />
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {pendingActivities.length > 0 ? (
          <div className="grid grid-cols-3 gap-5">
            <Card className="bg-gray-50 border-transparent shadow-none">
              <CardHeader>
                <Badge>Pendiente</Badge>
              </CardHeader>
              <CardContent className="grid gap-3 grid-cols-1">
                {pendingActivities.map((a: IActivity) => (
                  <ActivityCard
                    key={a._id}
                    activity={a}
                    projectId={projectId}
                  />
                ))}
              </CardContent>
            </Card>
            <Card className="bg-blue-50 border-transparent shadow-none">
              <CardHeader>
                <Badge variant="blue">En Progreso</Badge>
              </CardHeader>
              <CardContent className="grid gap-3 grid-cols-1">
                {inProgressActivities.map((a: IActivity) => (
                  <ActivityCard
                    key={a._id}
                    activity={a}
                    projectId={projectId}
                    className="border-blue-800"
                  />
                ))}
              </CardContent>
            </Card>

            <Card className="bg-green-50 border-transparent shadow-none">
              <CardHeader>
                <Badge variant="green">Completado</Badge>
              </CardHeader>
              <CardContent className="grid gap-3 grid-cols-1">
                {completedActivities.map((a: IActivity) => (
                  <ActivityCard
                    key={a._id}
                    activity={a}
                    projectId={projectId}
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
