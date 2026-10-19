'useClient';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { DoorOpen, Ellipsis, ExternalLink, Pencil, Trash, Lock, Pin } from 'lucide-react';
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
import { useRouter } from 'next/navigation';
import {
  useCancelFirstValidationProject,
  useCloseProject,
  useDeleteProject,
  useFirstValidationProject,
  useReopenProject,
} from '@/hooks/projects';
import { useUserProfile } from 'context/profile-provider';
import {
  IProject,
  ProjectStatus,
  ProjectValidation,
  UserRole,
} from '@repo/types';
import { XCircle } from 'lucide-react';

export function ProjectMenu({
  projectId,
  name,
  status,
  firstValidatedBy,
  validationStatus,
  closedBy,
}: {
  projectId: string;
  name: string;
  status?: ProjectStatus;
  validationStatus?: ProjectValidation;
  firstValidatedBy?: IProject['firstValidatedBy'];
  closedBy?: IProject['closedBy'];
}) {
  const deleteProject = useDeleteProject();
  const firstValidationProject = useFirstValidationProject();
  const cancelFirstValidationProject = useCancelFirstValidationProject();
  const closeProject = useCloseProject();
  const reopenProject = useReopenProject();
  const router = useRouter();
  const { user } = useUserProfile();
  const rootUrl = user.role === UserRole.ADMIN ? '/admin' : '/user';

  const isClosed = status === ProjectStatus.CLOSED;
  const closedById =
    typeof closedBy === 'string' ? closedBy : closedBy?._id;
  const hasFirstValidation =
    validationStatus === ProjectValidation.FIRST_VALIDATION ||
    validationStatus === ProjectValidation.FINAL_VALIDATION ||
    Boolean(firstValidatedBy);
  const canReopen = Boolean(
    isClosed &&
      user?.canCloseElements &&
      closedById &&
      user?._id === closedById,
  );
  const canFirstValidate = Boolean(
    !isClosed &&
      !hasFirstValidation &&
      user?.canValidateElements,
  );
  const canClose = Boolean(
    !isClosed &&
      status === ProjectStatus.COMPLETED &&
      validationStatus === ProjectValidation.FIRST_VALIDATION &&
      hasFirstValidation &&
      user?.canCloseElements,
  );
  const canCancelFirstValidation = Boolean(
    !isClosed &&
      validationStatus === ProjectValidation.FIRST_VALIDATION &&
      hasFirstValidation &&
      user?.canValidateElements,
  );
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size={'icon-sm'}>
          <Ellipsis />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuGroup>
          <DropdownMenuLabel>Acciones</DropdownMenuLabel>
          
          {!isClosed && (
            <>
              <DropdownMenuItem asChild>
                <Link href={`${rootUrl}/proyectos/${projectId}/editar`}>
                  <Pencil />
                  Editar proyecto
                </Link>
              </DropdownMenuItem>
              <Dialog>
                <DialogTrigger className="has-[>svg]:px-2 [&_svg]:text-muted-foreground hover:[&_svg]:text-destructive-foreground px-0 border-transparent w-full h-8 justify-start hover:text-destructive-foreground font-normal">
                  <Trash /> Eliminar proyecto
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Eliminar: {name}</DialogTitle>
                    <DialogDescription>
                      ¿Seguro deseas eliminar el proyecto? Esta es una acción
                      irreversible.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <DialogClose asChild>
                      <Button variant="outline">Cancelar</Button>
                    </DialogClose>
                    <Button
                      disabled={deleteProject.isPending}
                      variant="destructive"
                      onClick={() => {
                        deleteProject.mutate(projectId);
                        router.push(`${rootUrl}/proyectos`);
                      }}
                    >
                      Eliminar
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </>
          )}

          {canFirstValidate && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                disabled={firstValidationProject.isPending}
                onClick={() => firstValidationProject.mutate(projectId)}
              >
                <Pin />
                Aprobar
              </DropdownMenuItem>
            </>
          )}

          {canCancelFirstValidation && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                disabled={cancelFirstValidationProject.isPending}
                onClick={() => cancelFirstValidationProject.mutate(projectId)}
              >
                <XCircle />
                Cancelar aprobación
              </DropdownMenuItem>
            </>
          )}

          {canClose && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                disabled={closeProject.isPending}
                onClick={() => closeProject.mutate(projectId)}
              >
                <Lock />
                Cerrar proyecto (2da validación)
              </DropdownMenuItem>
            </>
          )}

          {canReopen && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                disabled={reopenProject.isPending}
                onClick={() => reopenProject.mutate(projectId)}
              >
                <DoorOpen />
                Reabrir proyecto
              </DropdownMenuItem>
            </>
          )}

        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
