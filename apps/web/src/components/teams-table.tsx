'use client';

import { useAllTeams, useDeleteTeam } from '@/hooks/team';
import {
  ITeam,
  TeamMembershipRole,
  TeamMembershipStatus,
  TeamsGrade,
} from '@repo/types';
import { ColumnDef } from '@tanstack/react-table';
import React from 'react';
import { DataTable } from './ui/data-table';
import LoadingMessage from './loading-message';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { ProfileInfo } from './profile-info';
import AvatarRow from './avatar-row';
import { Badge } from './ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Button } from './ui/button';
import {
  Copy,
  ExternalLink,
  MoreHorizontal,
  Pencil,
  Trash,
} from 'lucide-react';
import Link from 'next/link';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';
import { copyValue } from '@/lib/utils';
import CopyButton from './ui/copy';

const columns: ColumnDef<ITeam>[] = [
  {
    accessorKey: 'teamName',
    header: 'Nombre',
    cell: ({ row }) => {
      const { teamName } = row.original;
      return (
        <div className="max-w-96 truncate flex items-center gap-1 group">
          <span className="truncate">{teamName}</span>
          <CopyButton
            valueToCopy={teamName}
            className="opacity-0 group-hover:opacity-100"
          />
        </div>
      );
    },
  },
  {
    accessorKey: 'division',
    header: 'Divisón',
    cell: ({ row }) => {
      const { division } = row.original;
      return (
        <div>
          {division ? (
            <span>{division.name}</span>
          ) : (
            <span className="text-muted-foreground">Vacío</span>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: 'grade',
    header: 'Grado',
    cell: ({ row }) => {
      const { grade } = row.original;
      return (
        <div>
          {grade === TeamsGrade.CONSOLIDADO ? (
            <Badge variant="green">{grade}</Badge>
          ) : (
            <Badge>{grade}</Badge>
          )}
        </div>
      );
    },
  },
  {
    id: 'owner',
    header: 'Proprietario',
    cell: ({ row }) => {
      const { memberships } = row.original;
      const ownerMembership = memberships.find(
        (m) => m.role === TeamMembershipRole.OWNER,
      );
      const owner = ownerMembership?.user;
      return owner ? (
        <div className="min-w-56">
          <ProfileInfo
            size="sm"
            givenName={owner.givenName}
            familyName={owner.familyName}
            email={owner.email}
            avatarUrl={owner.avatarUrl}
          />
        </div>
      ) : (
        <span className="text-muted-foreground">Vacío</span>
      );
    },
  },
  {
    accessorKey: 'isPrivate',
    header: 'Acceso',
    cell: ({ row }) => {
      const { isPrivate } = row.original;
      return (
        <div>
          {isPrivate ? (
            <Badge variant="purple">Privado</Badge>
          ) : (
            <Badge variant="blue">Público</Badge>
          )}
        </div>
      );
    },
  },
  {
    id: 'members',
    header: 'Miembros',
    cell: ({ row }) => {
      const { memberships } = row.original;
      const members = memberships
        .filter(
          (m) =>
            m.role === TeamMembershipRole.MEMBER &&
            m.status === TeamMembershipStatus.ACTIVE,
        )
        .map((m) => m.user);
      return (
        <div>
          {members.length > 0 ? (
            <AvatarRow profiles={members} />
          ) : (
            <span className="text-muted-foreground">Vacío</span>
          )}
        </div>
      );
    },
  },
  {
    id: 'collaborators',
    header: 'Colaboradores',
    cell: ({ row }) => {
      const { memberships } = row.original;
      const collaborators = memberships
        .filter(
          (m) =>
            m.role === TeamMembershipRole.COLLABORATOR &&
            m.status === TeamMembershipStatus.ACTIVE,
        )
        .map((m) => m.user);
      return (
        <div>
          {collaborators.length > 0 ? (
            <AvatarRow profiles={collaborators} />
          ) : (
            <span className="text-muted-foreground">Vacío</span>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: 'createdAt',
    header: 'Fecha de creación',
    cell: ({ row }) => {
      const { createdAt } = row.original;
      return (
        <div>
          {format(createdAt, "d 'de' MMM 'de' yyyy HH:mm", { locale: es })}
        </div>
      );
    },
  },
  {
    accessorKey: 'updatedAt',
    header: 'Fecha de actualización',
    cell: ({ row }) => {
      const { updatedAt } = row.original;
      return (
        <div>
          {format(updatedAt, "d 'de' MMM 'de' yyyy HH:mm", { locale: es })}
        </div>
      );
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const team = row.original;
      const deleteTeam = useDeleteTeam();
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon-sm">
              <MoreHorizontal />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Acciones</DropdownMenuLabel>
            <DropdownMenuItem asChild>
              <Link href={`/admin/equipos/${team._id}/editar`}>
                <Pencil /> Editar equipo
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={`/admin/equipos/${team._id}`}>
                <ExternalLink /> Visitar equipo
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild onClick={() => copyValue(team._id)}>
              <span>
                <Copy /> Copiar ID
              </span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              asChild
              className="hover:text-destructive-foreground"
            >
              <Dialog>
                <DialogTrigger className="has-[>svg]:px-2 [&_svg]:text-muted-foreground hover:[&_svg]:text-destructive-foreground px-0 border-transparent w-full h-8 justify-start hover:text-destructive-foreground font-normal">
                  <Trash /> Eliminar equipo
                </DialogTrigger>
                <DialogContent>
                  <Badge variant="destructive">Eliminando</Badge>
                  <DialogTitle>{team.teamName}</DialogTitle>
                  <DialogDescription>
                    ¿Seguro deseas eliminar el evento? Esta es una operación
                    irreversible.
                  </DialogDescription>
                  <div className="flex gap-2">
                    <DialogClose asChild>
                      <Button variant="outline">Cancelar</Button>
                    </DialogClose>
                    <DialogClose asChild>
                      <Button
                        onClick={() => deleteTeam.mutate(team._id)}
                        variant="destructive"
                      >
                        Eliminar
                      </Button>
                    </DialogClose>
                  </div>
                </DialogContent>
              </Dialog>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

export default function TeamsTable() {
  const { data, isLoading } = useAllTeams();
  return (
    <div className="max-w-6xl w-full">
      {isLoading ? (
        <LoadingMessage message="Cargando equipos" />
      ) : (
        <DataTable data={data} columns={columns} />
      )}
    </div>
  );
}
