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
  IdCard,
  MoreHorizontal,
  Pencil,
  Trash,
} from 'lucide-react';
import Link from 'next/link';
import { Badge } from './ui/badge';

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
  {
    accessorKey: 'owner',
    header: 'Dueño',
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
    accessorKey: 'products',
    header: 'Productos',
    cell: ({ row }) => {
      const { products } = row.original;

      return <div>{products?.length}</div>;
    },
  },
  { accessorKey: 'impactLevel', header: 'Nivel de Impacto' },
  {
    accessorKey: 'knowledgeAreas',
    header: 'Áreas de Conocimiento',
    cell: ({ row }) => {
      const { knowledgeAreas } = row.original;

      return (
        <div className="max-w-96 overflow-x-auto">
          {knowledgeAreas?.length ? (
            <span>
              {concatWithCommaAndDot(
                knowledgeAreas.map((a: SeedCategory) => a.name),
              )}
            </span>
          ) : (
            <span className="text-muted-foreground">Vacío</span>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: 'impactAreas',
    header: 'Áreas de Impacto',
    cell: ({ row }) => {
      const { impactAreas } = row.original;

      return (
        <div className="max-w-96 overflow-x-auto">
          {impactAreas?.length ? (
            <span>
              {concatWithCommaAndDot(
                impactAreas.map((a: SeedCategory) => a.name),
              )}
            </span>
          ) : (
            <span className="text-muted-foreground">Vacío</span>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: 'sustainableObjectives',
    header: 'Objetivos Sustentables',
    cell: ({ row }) => {
      const { sustainableObjectives } = row.original;

      return (
        <div className="max-w-96 overflow-x-auto">
          {sustainableObjectives?.length ? (
            <span>
              {concatWithCommaAndDot(
                sustainableObjectives.map((a: SeedCategory) => a.name),
              )}
            </span>
          ) : (
            <span className="text-muted-foreground">Vacío</span>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: 'innovationLines',
    header: 'LIIADT',
    cell: ({ row }) => {
      const { innovationLines } = row.original;

      return (
        <div className="max-w-96 overflow-x-auto">
          {innovationLines?.length ? (
            <span>
              {concatWithCommaAndDot(
                innovationLines.map((a: SeedCategory) => a.name),
              )}
            </span>
          ) : (
            <span className="text-muted-foreground">Vacío</span>
          )}
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
    <div className="max-w-6xl">
      {loadingProjects ? (
        <LoadingMessage message="Cargando proyectos" />
      ) : (
        <DataTable columns={columns} data={projects} />
      )}
    </div>
  );
}
