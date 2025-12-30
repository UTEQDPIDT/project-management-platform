import { IActivity } from '@repo/types';
import {
  Calendar,
  Download,
  Ellipsis,
  MoveRight,
  Pencil,
  Trash,
} from 'lucide-react';
import React from 'react';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from './ui/card';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Separator } from './ui/separator';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { ActivityForm } from './forms/activity-form';

interface Props {
  activity: IActivity;
  projectId?: string;
  className?: string;
}

export function ActivityCard({ activity, projectId, className }: Props) {
  // todo: use hook
  // const deleteActivity =

  const handleDelete = () => {
    // todo: mutation
  };

  let badgeVariant:
    | 'orange'
    | 'gray'
    | 'default'
    | 'secondary'
    | 'destructive'
    | 'outline'
    | 'blue'
    | 'green'
    | 'purple'
    | null
    | undefined;

  switch (activity.priority) {
    case 'Alta':
      badgeVariant = 'purple';
      break;
    case 'Media':
      badgeVariant = 'orange';
      break;
    case 'Baja':
      badgeVariant = 'gray';
      break;
  }

  return (
    <Card className={cn(className)}>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="flex flex-col gap-1">
            <CardTitle>{activity.name}</CardTitle>
            <CardDescription></CardDescription>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon-sm">
                <Ellipsis />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="flex flex-col items-start">
              {/* Edit */}
              <Dialog>
                <DialogTrigger className="border-transparent w-full justify-start">
                  <Pencil /> Editar
                </DialogTrigger>
                <DialogContent>
                  <div className="flex gap-3 ">
                    <Badge variant="orange">Editando</Badge>
                    <DialogTitle className="line-clamp-1">
                      {activity.name}
                    </DialogTitle>
                  </div>
                  <Separator />

                  <ActivityForm activity={activity} projectId={projectId} />
                </DialogContent>
              </Dialog>

              {/* Delete */}
              <Dialog>
                <DialogTrigger className="border-transparent w-full justify-start hover:text-destructive-foreground">
                  <Trash /> Eliminar
                </DialogTrigger>
                <DialogContent className="gap-5">
                  <Badge variant="destructive">Eliminando</Badge>
                  <DialogTitle>{activity.name}</DialogTitle>
                  <DialogDescription>
                    ¿Seguro que deseas eliminar el activityo? Esta es una
                    operación irreversible, una vez eliminado el activityo no se
                    podrá recuperar.
                  </DialogDescription>

                  <div className="flex gap-2">
                    <DialogClose asChild>
                      <Button variant="outline">Cancelar</Button>
                    </DialogClose>

                    <DialogClose asChild>
                      <Button
                        onClick={handleDelete}
                        // disabled={deleteactivity.isPending}
                        variant="destructive"
                      >
                        Eliminar
                      </Button>
                    </DialogClose>
                  </div>
                </DialogContent>
              </Dialog>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className="flex flex-col gap-3">
        {activity.dueDate && (
          <div className="flex gap-1">
            <span className="flex gap-1 items-center justify-center text-xs text-muted-foreground">
              <Calendar size={14} />
              {format(activity.dueDate, "d 'de' MMM 'de' yyyy", { locale: es })}
            </span>
            {activity.dueDateEnd && (
              <span className="flex gap-1 items-center justify-center text-xs text-muted-foreground">
                <MoveRight size={10} />
                {format(activity.dueDateEnd, "d 'de' MMM 'de' yyyy", {
                  locale: es,
                })}
              </span>
            )}
          </div>
        )}
      </CardContent>

      <CardFooter className="flex">
        {activity.priority && (
          <Badge variant={badgeVariant}>{activity.priority}</Badge>
        )}
      </CardFooter>
    </Card>
  );
}
