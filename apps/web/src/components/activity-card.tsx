import { cn } from '@/lib/utils';
import { IActivity } from '@repo/types';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Calendar, Ellipsis, MoveRight, Pencil, Trash } from 'lucide-react';
import AvatarRow from './avatar-row';
import { ActivityForm } from './forms/activity-form';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import {
  Card,
  CardContent,
  CardDescription,
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

interface Props {
  activity: IActivity;
  onDelete: (activity: IActivity) => void;
  className?: string;
}

export function ActivityCard({ activity, onDelete, className }: Props) {
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
        <div className="flex justify-between items-start gap-1">
          <div className="flex flex-col gap-1">
            <CardTitle>{activity.name}</CardTitle>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon-sm">
                <Ellipsis />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="flex flex-col items-start gap-1">
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

                  <ActivityForm
                    activity={activity}
                    projectId={activity.projectId}
                    eventId={activity.eventId}
                  />
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
                    ¿Seguro que deseas eliminar la actividad? Esta es una
                    operación irreversible, una vez eliminada la actividad no se
                    podrá recuperar.
                  </DialogDescription>

                  <div className="flex gap-2">
                    <DialogClose asChild>
                      <Button variant="outline">Cancelar</Button>
                    </DialogClose>

                    <DialogClose asChild>
                      <Button
                        onClick={() => onDelete?.(activity)}
                        variant="destructive"
                        disabled={!onDelete}
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

      <CardContent className="flex flex-col gap-4">
        {activity.description && (
          <CardDescription>{activity.description}</CardDescription>
        )}

        {activity.assignees && activity.assignees.length > 0 && (
          <AvatarRow profiles={activity.assignees} />
        )}

        {activity.dueDate && (
          <div className="flex gap-1">
            <span className="flex gap-1 items-center justify-center text-xs text-muted-foreground">
              <Calendar size={14} />
              {format(activity.dueDate, "'Vence el' d 'de' MMM 'de' yyyy", {
                locale: es,
              })}
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

        {activity.priority && (
          <Badge variant={badgeVariant}>{activity.priority}</Badge>
        )}
      </CardContent>
    </Card>
  );
}
