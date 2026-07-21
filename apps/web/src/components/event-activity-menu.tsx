import { useDeleteActivity, useRemoveAssignee } from '@/hooks/activities';
import { IActivity, IUser, UserRole } from '@repo/types';
import { useUserProfile } from 'context/profile-provider';
import { Pencil, Trash, UserMinus } from 'lucide-react';
import React from 'react';
import { ActivityForm } from './forms/activity-form';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';
import { DropdownMenuItem } from './ui/dropdown-menu';
import { Separator } from './ui/separator';

interface ProjectActivityMenu {
  activity: IActivity;
}

export default function EventActivityMenu({ activity }: ProjectActivityMenu) {
  const { user } = useUserProfile();

  const deleteActivityMutation = useDeleteActivity();
  const removeAssignee = useRemoveAssignee();

  const handleDelete = () => {
    deleteActivityMutation.mutate(activity._id);
  };

  const handleRemoveAssignee = () => {
    removeAssignee.mutate({ activityId: activity._id, userId: user._id });
  };

  return (
    <div className="flex flex-col gap-1">
      {activity.assignees?.some((a: IUser) => a._id === user?._id) && (
        <DropdownMenuItem onClick={handleRemoveAssignee}>
          <UserMinus /> Salir de la actividad
        </DropdownMenuItem>
      )}

      {user.role === UserRole.ADMIN && (
        <>
          {/* Edit */}
          <Dialog>
            <DialogTrigger className="has-[>svg]:px-2 [&_svg]:text-muted-foreground px-0 border-transparent w-full h-8 justify-start font-normal">
              <Pencil /> Editar actividad
            </DialogTrigger>
            <DialogContent className="max-h-[85vh] overflow-y-auto">
              <Badge variant="orange">Editando</Badge>
              <DialogTitle className="line-clamp-1 h-5">
                {activity.name}
              </DialogTitle>

              <ActivityForm activity={activity} eventId={activity.entityId} />
            </DialogContent>
          </Dialog>

          {/* Delete */}
          <Dialog>
            <DialogTrigger className="has-[>svg]:px-2 [&_svg]:text-muted-foreground hover:[&_svg]:text-destructive-foreground px-0 border-transparent w-full h-8 justify-start hover:text-destructive-foreground font-normal">
              <Trash /> Eliminar actividad
            </DialogTrigger>
            <DialogContent className="gap-5">
              <Badge variant="destructive">Eliminando</Badge>
              <DialogTitle>{activity.name}</DialogTitle>
              <DialogDescription>
                ¿Seguro que deseas eliminar la actividad? Esta es una operación
                irreversible, una vez eliminada la actividad no se podrá
                recuperar.
              </DialogDescription>

              <div className="flex gap-2">
                <DialogClose asChild>
                  <Button variant="outline">Cancelar</Button>
                </DialogClose>

                <DialogClose asChild>
                  <Button
                    onClick={handleDelete}
                    variant="destructive"
                    disabled={deleteActivityMutation.isPending}
                  >
                    Eliminar
                  </Button>
                </DialogClose>
              </div>
            </DialogContent>
          </Dialog>
        </>
      )}
    </div>
  );
}
