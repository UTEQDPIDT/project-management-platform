import React from 'react';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';
import { Pencil, Trash } from 'lucide-react';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { ActivityForm } from './forms/activity-form';
import { Button } from './ui/button';
import { IActivity } from '@repo/types';
import { useDeleteEventActivity } from '@/hooks/events';

interface ProjectActivityMenu {
  eventId: string;
  activity: IActivity;
}

export default function EventActivityMenu({
  eventId,
  activity,
}: ProjectActivityMenu) {
  const deleteActivity = useDeleteEventActivity();

  const handleDelete = () => {
    deleteActivity.mutate({
      eventId,
      activityId: activity._id,
    });
  };

  return (
    <div>
      {/* Edit */}
      <Dialog>
        <DialogTrigger className="border-transparent w-full justify-start">
          <Pencil /> Editar
        </DialogTrigger>
        <DialogContent>
          <div className="flex gap-3 ">
            <Badge variant="orange">Editando</Badge>
            <DialogTitle className="line-clamp-1">{activity.name}</DialogTitle>
          </div>
          <Separator />

          <ActivityForm activity={activity} eventId={activity.eventId} />
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
            ¿Seguro que deseas eliminar la actividad? Esta es una operación
            irreversible, una vez eliminada la actividad no se podrá recuperar.
          </DialogDescription>

          <div className="flex gap-2">
            <DialogClose asChild>
              <Button variant="outline">Cancelar</Button>
            </DialogClose>

            <DialogClose asChild>
              <Button
                onClick={handleDelete}
                variant="destructive"
                disabled={deleteActivity.isPending}
              >
                Eliminar
              </Button>
            </DialogClose>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
