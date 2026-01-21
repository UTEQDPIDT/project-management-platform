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
import { useDeleteActivity } from '@/hooks/activities';

interface ProjectActivityMenu {
  projectId: string;
  activity: IActivity;
  activitiesLength: number;
}

export function ProjectActivityMenu({
  projectId,
  activity,
  activitiesLength,
}: ProjectActivityMenu) {
  const deleteActivity = useDeleteActivity();

  const handleDelete = () => {
    deleteActivity.mutate(activity._id);
  };

  return (
    <div className="flex flex-col gap-1">
      {/* Edit */}
      <Dialog>
        <DialogTrigger className="border-transparent w-full justify-start font-normal">
          <Pencil /> Editar actividad
        </DialogTrigger>
        <DialogContent>
          <div className="flex gap-3 ">
            <Badge variant="orange">Editando</Badge>
            <DialogTitle className="line-clamp-1">{activity.name}</DialogTitle>
          </div>
          <Separator />

          <ActivityForm activity={activity} projectId={projectId} />
        </DialogContent>
      </Dialog>

      {/* Delete */}
      <Dialog>
        <DialogTrigger
          className="border-transparent w-full justify-start hover:text-destructive-foreground font-normal"
          disabled={activitiesLength! <= 5}
        >
          <Trash /> Eliminar actividad
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
                disabled={deleteActivity.isPending || activitiesLength! <= 5}
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
