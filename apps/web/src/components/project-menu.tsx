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
  useCloseProject,
  useDeleteProject,
  useFirstValidationProject,
  useReopenProject,
} from '@/hooks/projects';
import { useUserProfile } from 'context/profile-provider';
import { IProject, ProjectStatus, UserRole } from '@repo/types';

export function ProjectMenu({
  projectId,
  name,
  status,
  firstValidatedBy,
  closedBy,
}: {
  projectId: string;
  name: string;
  status?: ProjectStatus;
  firstValidatedBy?: IProject['firstValidatedBy'];
  closedBy?: IProject['closedBy'];
}) {
  const deleteProject = useDeleteProject();
  const firstValidationProject = useFirstValidationProject();
  const closeProject = useCloseProject();
  const reopenProject = useReopenProject();
  const router = useRouter();
  const { user } = useUserProfile();
  const rootUrl = user.role === UserRole.ADMIN ? '/admin' : '/user';

  const isClosed = status === ProjectStatus.CLOSED;
  const closedById =
    typeof closedBy === 'string' ? closedBy : closedBy?._id;
  const hasFirstValidation = Boolean(firstValidatedBy);
  const canReopen = Boolean(isClosed && closedById && user?._id === closedById);
  const canFirstValidate = Boolean(
    !isClosed &&
      status === ProjectStatus.COMPLETED &&
      !hasFirstValidation &&
      user.role === UserRole.ADMIN,
  );
  const canClose = Boolean(
    !isClosed &&
      status === ProjectStatus.COMPLETED &&
      hasFirstValidation &&
      user.role === UserRole.ADMIN,
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
                Primera validación
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
