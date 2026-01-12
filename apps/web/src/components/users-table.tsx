'use client';

import { useGetAllUsers } from '@/hooks/user';
import React from 'react';
import LoadingMessage from './loading-message';
import { DataTable } from './ui/data-table';
import { ColumnDef } from '@tanstack/react-table';
import { IUser, UserRole, UserType } from '@repo/types';
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

const columns: ColumnDef<IUser>[] = [
  { accessorKey: 'givenName', header: 'Nombre(s)' },
  { accessorKey: 'familyName', header: 'Apellido(s)' },
  {
    id: 'user-type',
    header: 'Rol',
    cell: ({ row }) => {
      const { type } = row.original;

      return (
        <div>
          {type === UserType.ADMINISTRATIVO ? (
            <Badge variant="purple">{type}</Badge>
          ) : type === UserType.MAESTRO ? (
            <Badge variant="green">{type}</Badge>
          ) : (
            <Badge variant="blue">{type}</Badge>
          )}
        </div>
      );
    },
  },
  {
    id: 'identificator',
    header: 'Matricula/No. Empleado',
    cell: ({ row }) => {
      const { type } = row.original;
      const { matricula } = row.original;
      const { employeeNumber } = row.original;

      return (
        <div>
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
    cell: ({ row }) => {
      const { email } = row.original;

      return (
        <div className="flex justify-between group">
          <span>{email}</span>
          <CopyButton
            className="opacity-0 group-hover:opacity-100"
            variant="outline"
            valueToCopy={email}
          />
        </div>
      );
    },
  },
  { accessorKey: 'sex', header: 'Sexo' },
  {
    accessorKey: 'dateOfBirth',
    header: 'Fecha de nacimiento',
    cell: ({ row }) => {
      const { dateOfBirth } = row.original;

      return (
        <div>
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
  { accessorKey: 'state', header: 'Estado de recidencia' },
  {
    accessorKey: 'division',
    header: 'División',
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
    accessorKey: 'educationalProgram',
    header: 'Programa educativo',
    cell: ({ row }) => {
      const { educationalProgram } = row.original;

      return (
        <div>
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
    cell: ({ row }) => {
      const { createdAt } = row.original;

      return (
        <div>
          {format(createdAt, "d 'de' MMMM 'de' yyyy HH':'mm", { locale: es })}
        </div>
      );
    },
  },
  {
    id: 'actions',
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

  return (
    <div className="max-w-6xl">
      {isLoading ? (
        <LoadingMessage message="Cargando usuarios" />
      ) : (
        <DataTable data={data} columns={columns} />
      )}
    </div>
  );
}
