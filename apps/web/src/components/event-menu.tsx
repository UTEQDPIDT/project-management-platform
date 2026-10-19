'useClient';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { DoorOpen, Ellipsis, Lock, Pencil, Pin, Trash, XCircle } from 'lucide-react';
import { Button } from './ui/button';
import Link from 'next/link';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
  DialogClose,
} from './ui/dialog';
import { useDeleteEvent, useExitEvent, useFirstValidationEvent, useCancelFirstValidationEvent, useCloseEvent, useReopenEvent } from '@/hooks/events';
import { Badge } from './ui/badge';
import { useUserProfile } from 'context/profile-provider';
import { IEvent, ProjectValidation, UserRole } from '@repo/types';

export function EventMenu({
  eventId,
  name,
  validationStatus,
  isClosed,
  firstValidatedBy,
  closedBy,
}: {
  eventId: string;
  name: string;
  validationStatus?: ProjectValidation;
  isClosed?: boolean;
  firstValidatedBy?: IEvent['firstValidatedBy'];
  closedBy?: IEvent['closedBy'];
}) {
  const { user } = useUserProfile();
  const deleteEvent = useDeleteEvent();
  const exitEvent = useExitEvent();
  const firstValidation = useFirstValidationEvent();
  const cancelFirstValidation = useCancelFirstValidationEvent();
  const closeEvent = useCloseEvent();
  const reopenEvent = useReopenEvent();
  const resolvedIsClosed =
    isClosed ?? validationStatus === ProjectValidation.FINAL_VALIDATION;
  const closedById =
    typeof closedBy === 'string' ? closedBy : closedBy?._id;
  const hasFirstValidation =
    validationStatus === ProjectValidation.FIRST_VALIDATION ||
    validationStatus === ProjectValidation.FINAL_VALIDATION ||
    Boolean(firstValidatedBy);
  const canReopen = Boolean(
    resolvedIsClosed &&
      user?.canCloseElements &&
      closedById &&
      user?._id === closedById,
  );
  const canFirstValidate = Boolean(
    !resolvedIsClosed &&
      !hasFirstValidation &&
      user?.canValidateElements,
  );
  const canClose = Boolean(
    !resolvedIsClosed &&
      validationStatus === ProjectValidation.FIRST_VALIDATION &&
      hasFirstValidation &&
      user?.canCloseElements,
  );
  const canCancelFirstValidation = Boolean(
    !resolvedIsClosed &&
      validationStatus === ProjectValidation.FIRST_VALIDATION &&
      hasFirstValidation &&
      user?.canValidateElements,
  );

  const handleExitEvent = () => {
    exitEvent.mutate({ eventId, userId: user._id });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size={'icon-sm'}>
          <Ellipsis />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuGroup>
          <DropdownMenuLabel>Acciones</DropdownMenuLabel>
          {user.role === UserRole.ADMIN ? (
            <div className="flex flex-col gap-1">
              {!resolvedIsClosed && (
                <DropdownMenuItem asChild>
                  <Link href={`/admin/eventos/${eventId}/editar`}>
                    <Pencil />
                    Editar evento
                  </Link>
                </DropdownMenuItem>
              )}
              {!resolvedIsClosed && (
                <Dialog>
                  <DialogTrigger className="has-[>svg]:px-2 [&_svg]:text-muted-foreground hover:[&_svg]:text-destructive-foreground px-0 border-transparent w-full h-8 justify-start hover:text-destructive-foreground font-normal">
                    <Trash /> Eliminar evento
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <Badge variant="destructive">Eliminando</Badge>
                      <DialogTitle>{name}</DialogTitle>
                      <DialogDescription>
                        ¿Seguro deseas eliminar el evento? Esta es una acción
                        irreversible.
                      </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                      <DialogClose asChild>
                        <Button variant="outline">Cancelar</Button>
                      </DialogClose>
                      <Button
                        variant="destructive"
                        onClick={() => {
                          deleteEvent.mutate(eventId);
                        }}
                      >
                        Eliminar
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              )}
            </div>
          ) : (
            <DropdownMenuItem onClick={handleExitEvent}>
              <DoorOpen /> Salir del evento
            </DropdownMenuItem>
          )}

          {canFirstValidate && (
            <DropdownMenuItem onClick={() => firstValidation.mutate(eventId)}><Pin /> Aprobar</DropdownMenuItem>
          )}
          {canCancelFirstValidation && (
            <DropdownMenuItem onClick={() => cancelFirstValidation.mutate(eventId)}><XCircle /> Cancelar aprobación</DropdownMenuItem>
          )}
          {canClose && (
            <DropdownMenuItem onClick={() => closeEvent.mutate(eventId)}><Lock /> Validación final</DropdownMenuItem>
          )}
          {canReopen && (
            <DropdownMenuItem onClick={() => reopenEvent.mutate(eventId)}><DoorOpen /> Reabrir evento</DropdownMenuItem>
          )}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
