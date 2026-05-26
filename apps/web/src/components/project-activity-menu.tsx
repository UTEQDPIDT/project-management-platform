import React from 'react';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';
import { Pencil, Trash, UserMinus } from 'lucide-react';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { ActivityForm } from './forms/activity-form';
import { Button } from './ui/button';

import { IActivity, IUser } from '@repo/types';
import { useDeleteActivity, useRemoveAssignee } from '@/hooks/activities';
import { useUserProfile } from 'context/profile-provider';
import { DropdownMenuItem } from './ui/dropdown-menu';

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
  const { user } = useUserProfile();

  const deleteActivity = useDeleteActivity();
  const removeAssignee = useRemoveAssignee();

  const handleDelete = () => {
    deleteActivity.mutate(activity._id);
  };

  const handleRemoveAssignee = () => {
    removeAssignee.mutate({ activityId: activity._id, userId: user._id });
  };

  return (
    <div className="flex flex-col gap-1">
      {/* Edit */}
      <Dialog>
        <DialogTrigger className="has-[>svg]:px-2 [&_svg]:text-muted-foreground px-0 h-8 border-transparent w-full justify-start font-normal">
          <Pencil /> Editar actividad
        </DialogTrigger>
        <DialogContent>
          <Badge variant="orange">Editando</Badge>
          <DialogTitle className="line-clamp-1 h-5">
            {activity.name}
          </DialogTitle>

          <ActivityForm activity={activity} projectId={projectId} />
        </DialogContent>
      </Dialog>

      {activity.assignees?.some((a: IUser) => a._id === user?._id) && (
        <DropdownMenuItem onClick={handleRemoveAssignee}>
          <UserMinus /> Salir de la actividad
        </DropdownMenuItem>
      )}

      {/* Delete */}
      <Dialog>
        <DialogTrigger
          className="has-[>svg]:px-2 [&_svg]:text-muted-foreground hover:[&_svg]:text-destructive-foreground px-0 border-transparent w-full h-8 justify-start hover:text-destructive-foreground font-normal"
          disabled={activitiesLength! <= 3}
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
                disabled={deleteActivity.isPending || activitiesLength! <= 3}
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
