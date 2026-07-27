'use client';

import { useGetAllUsers } from '@/hooks/user';
import React, { useMemo } from 'react';
import LoadingMessage from './loading-message';
import { DataTable, FacetedFilterConfig, fuzzyFilter } from './ui/data-table';
import { ColumnDef } from '@tanstack/react-table';
import { IUser, SeedCategory, Sex, State, UserType } from '@repo/types';
import { Badge } from './ui/badge';
import CopyButton from './ui/copy';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Button } from './ui/button';
import { Copy, ExternalLink, MoreHorizontal } from 'lucide-react';
import Link from 'next/link';
import { copyValue } from '@/lib/utils';
import { useDivisions } from '@/hooks/catalogs/use-divisions';
import { usePrograms } from '@/hooks/catalogs/use-programs';
import { getUserTypeBadge } from '@/lib/badge-mappings';

const columns: ColumnDef<IUser>[] = [
  { 
    accessorKey: 'givenName', 
    header: 'Nombre(s)',
    filterFn: (row, _columnId, filterValue) => {
      // Search input in this table should match either given name or family name.
      return (
        fuzzyFilter(row, 'givenName', filterValue, () => undefined) ||
        fuzzyFilter(row, 'familyName', filterValue, () => undefined)
      );
    },
    cell: ({ row }) => <span className="whitespace-nowrap">{row.original.givenName}</span>
  },
  { 
    accessorKey: 'familyName', 
    header: 'Apellido(s)',
    filterFn: (row, _columnId, filterValue) =>
      fuzzyFilter(row, 'familyName', filterValue, () => undefined),
    cell: ({ row }) => <span className="whitespace-nowrap">{row.original.familyName}</span>
  },
  {
    accessorKey: 'type',
    header: 'Rol',
    cell: ({ row }) => {
      const { type } = row.original;
      const typeBadge = getUserTypeBadge(type);

      return (
        <div>
          <Badge variant={typeBadge.variant}>{typeBadge.label}</Badge>
        </div>
      );
    },
  },
  {
    id: 'identificator',
    header: 'Matricula/No. Empleado',
    meta: { className: 'hidden sm:table-cell' }, // Se oculta en móviles verticales
    cell: ({ row }) => {
      const { type } = row.original;
      const { matricula } = row.original;
      const { employeeNumber } = row.original;

      return (
        <div className="min-w-35">
          {type === UserType.MAESTRO || type === UserType.ADMINISTRATIVO ? (
            employeeNumber ? (
              <div className="flex justify-between group">
                <span>{employeeNumber}</span>
                <CopyButton
                  className="group-hover:opacity-100 opacity-0"
                  valueToCopy={employeeNumber}
                />
              </div>
            ) : (
              <span className="text-muted-foreground">Vacío</span>
            )
          ) : matricula ? (
            <div className="flex justify-between group">
              <span>{matricula}</span>
              <CopyButton
                className="group-hover:opacity-100 opacity-0"
                variant="outline"
                valueToCopy={matricula}
              />
            </div>
          ) : (
            <span className="text-muted-foreground">Vacío</span>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: 'email',
    header: 'Correo',
    meta: { className: 'hidden md:table-cell' }, // Oculto en celulares
    cell: ({ row }) => {
      const { email } = row.original;

      return (
        <div className="flex justify-between group min-w-45">
          <span>{email}</span>
          <CopyButton
            className="opacity-0 group-hover:opacity-100"
            valueToCopy={email}
          />
        </div>
      );
    },
  },
  { 
    accessorKey: 'sex', 
    header: 'Sexo',
    meta: { className: 'hidden lg:table-cell' }
  },
  {
    accessorKey: 'dateOfBirth',
    header: 'Fecha de nacimiento',
    meta: { className: 'hidden lg:table-cell' },
    cell: ({ row }) => {
      const { dateOfBirth } = row.original;

      return (
        <div className="whitespace-nowrap">
          {dateOfBirth ? (
            <span>
              {format(dateOfBirth, "d 'de' MMMM 'de' yyyy", { locale: es })}
            </span>
          ) : (
            <span className="text-muted-foreground">Vacío</span>
          )}
        </div>
      );
    },
  },
  { 
    accessorKey: 'state', 
    header: 'Estado de recidencia',
    meta: { className: 'hidden lg:table-cell' }
  },
  {
    id: 'division',
    accessorFn: (row) => row.division?.name,
    header: 'División',
    meta: { className: 'hidden xl:table-cell' },
    cell: ({ row }) => {
      const { division } = row.original;

      return (
        <div className="max-w-50 truncate">
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
    id: 'educationalProgram',
    accessorFn: (row) => row.educationalProgram?.name,
    header: 'Programa educativo',
    meta: { className: 'hidden xl:table-cell' },
    cell: ({ row }) => {
      const { educationalProgram } = row.original;

      return (
        <div className="max-w-50 truncate">
          {educationalProgram ? (
            <span>{educationalProgram.name}</span>
          ) : (
            <span className="text-muted-foreground">Vacío</span>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: 'createdAt',
    header: 'Se unió el',
    meta: { className: 'hidden md:table-cell' },
    cell: ({ row }) => {
      const { createdAt } = row.original;

      return (
        <div className="whitespace-nowrap">
          {format(createdAt, "d 'de' MMMM 'de' yyyy HH':'mm", { locale: es })}
        </div>
      );
    },
  },
  {
    id: 'actions',
    header: 'Acciones',
    cell: ({ row }) => {
      const user = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon-sm">
              <MoreHorizontal />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Acciones</DropdownMenuLabel>
            {/* <DropdownMenuItem asChild>
              <Link href={`/admin/equipos/${user._id}/editar`}>
                <Pencil /> Editar usuario
              </Link>
            </DropdownMenuItem> */}
            <DropdownMenuItem asChild>
              <Link href={`/admin/perfil/${user._id}`}>
                <ExternalLink /> Ver perfil
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild onClick={() => copyValue(user._id)}>
              <span>
                <Copy /> Copiar ID
              </span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

export default function UsersTable() {
  const { data, isLoading } = useGetAllUsers();
  const { data: divisions } = useDivisions();
  const { data: educationalPrograms } = usePrograms();

  const facetedFilters: FacetedFilterConfig[] = useMemo(() => {
    const divisionsOptions =
      divisions?.map((division: SeedCategory) => ({
        label: division.name,
        value: division.name,
      })) ?? [];

    const educationalProgramsOptions =
      educationalPrograms?.map((program: SeedCategory) => ({
        label: program.name,
        value: program.name,
      })) ?? [];

    return [
      {
        columnId: 'type',
        title: 'Rol',
        options: Object.values(UserType).map((userType) => ({
          label: userType,
          value: userType,
        })),
      },
      {
        columnId: 'sex',
        title: 'Sexo',
        options: Object.values(Sex).map((sex) => ({
          label: sex,
          value: sex,
        })),
      },
      {
        columnId: 'state',
        title: 'Estado de residencia',
        options: Object.values(State).map((state) => ({
          label: state,
          value: state,
        })),
      },
      {
        columnId: 'division',
        title: 'División',
        options: divisionsOptions,
      },
      {
        columnId: 'educationalProgram',
        title: 'Programa educativo',
        options: educationalProgramsOptions,
      },
    ];
  }, [divisions, educationalPrograms]);

  return (
    <div className="max-w-7xl w-full p-1">
      {isLoading ? (
        <LoadingMessage message="Cargando usuarios" />
      ) : (
        <DataTable
          data={data}
          columns={columns}
          facetedFilters={facetedFilters}
          searchColumnId="givenName"
          persistStateKey="users-table"
        />
      )}
    </div>
  );
}