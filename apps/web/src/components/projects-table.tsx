'use client';

import { useAllProjects, useDeleteProject } from '@/hooks/projects';
import React from 'react';
import LoadingMessage from './loading-message';
import { DataTable } from './ui/data-table';
import { ColumnDef } from '@tanstack/react-table';
import { IProject, SeedCategory } from '@repo/types';
import { ProfileInfo } from './profile-info';
import { Progress } from './ui/progress';
import {
  calculateProgress,
  concatWithCommaAndDot,
  copyValue,
} from '@/lib/utils';
import CopyButton from './ui/copy';
import { Button } from './ui/button';
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
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import {
  Copy,
  ExternalLink,
  MoreHorizontal,
  Pencil,
  Trash,
} from 'lucide-react';
import Link from 'next/link';
import { Badge } from './ui/badge';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useProductsByProject } from '@/hooks/products';

const columns: ColumnDef<IProject>[] = [
  {
    accessorKey: 'name',
    header: 'Nombre',
    cell: ({ row }) => {
      const name = String(row.getValue('name'));

      return (
        <div className="relative group flex justify-between w-full">
          <div className="max-w-96 overflow-x-auto">
            <span>{name}</span>
          </div>
          <CopyButton
            valueToCopy={name}
            variant="outline"
            className=" opacity-0 group-hover:opacity-100"
          />
        </div>
      );
    },
  },
  { accessorKey: 'trlRating', header: 'Nivel TRL' },
  {
    id: 'progress',
    header: 'Progreso',
    cell: ({ row }) => {
      const { activities } = row.original;
      const progress = calculateProgress(activities);

      return (
        <div>
          <div className="p-2 hover:bg-secondary rounded-md flex gap-2 w-full min-w-48 items-center">
            <Progress value={progress} />
            <div className="flex text-xs select-none">
              <span>{progress}</span>
              <span>%</span>
            </div>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: 'activities',
    header: 'Actividades',
    cell: ({ row }) => {
      const project = row.original;
      const { activities } = project;

      return <div>{activities?.length}</div>;
    },
  },
  {
    id: 'products',
    header: 'Productos',
    cell: ({ row }) => {
      const { _id } = row.original;
      const { data: products, isLoading } = useProductsByProject(_id);
      return <div>{isLoading ? <LoadingMessage /> : products.length}</div>;
    },
  },
  {
    id: 'period',
    header: 'Periodo',
    cell: ({ row }) => {
      const { startDate } = row.original;
      const { endDate } = row.original;

      return (
        <div>
          <span>{format(startDate, "d 'de' MMMM 'al' ", { locale: es })}</span>
          <span>
            {format(endDate, "d 'de' MMMM 'de' yyyy", { locale: es })}
          </span>
        </div>
      );
    },
  },
  { accessorKey: 'impactLevel', header: 'Nivel de Impacto' },
  {
    accessorKey: 'owner',
    header: 'Proprietario',
    cell: ({ row }) => {
      const project = row.original;
      const { owner } = project;

      return (
        <div className="w-52">
          <ProfileInfo
            size="sm"
            givenName={owner.givenName}
            familyName={owner.familyName}
            email={owner.email}
            avatarUrl={owner.avatarUrl}
          />
        </div>
      );
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const project = row.original;
      const deleteProject = useDeleteProject();

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
              <Link href={`/admin/proyectos/${project._id}/editar`}>
                <Pencil /> Editar proyecto
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={`/admin/proyectos/${project._id}`}>
                <ExternalLink /> Visitar proyecto
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild onClick={() => copyValue(project._id)}>
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
                <DialogTrigger className="group items-center justify-start p-0 font-normal hover:text-destructive-foreground">
                  <Trash className="text-muted-foreground group-hover:text-destructive-foreground" />{' '}
                  Eliminar proyecto
                </DialogTrigger>
                <DialogContent>
                  <Badge variant="destructive">Eliminando</Badge>
                  <DialogTitle>{project.name}</DialogTitle>
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
                        onClick={() => deleteProject.mutate(project._id)}
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

export default function ProjectsTable() {
  const { data: projects, isLoading: loadingProjects } = useAllProjects();

  return (
    <div className="max-w-6xl w-full">
      {loadingProjects ? (
        <LoadingMessage message="Cargando proyectos" />
      ) : (
        <DataTable columns={columns} data={projects} />
      )}
    </div>
  );
}
