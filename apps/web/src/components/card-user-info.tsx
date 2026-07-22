import { IUser, UserRole, UserType } from '@repo/types';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Separator } from './ui/separator';
import { ProfileInfo } from './profile-info';

import { useUserProfile } from 'context/profile-provider';
import { Badge } from './ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';
import { MoreHorizontal, Pencil, Share } from 'lucide-react';
import UserForm from './forms/user-form';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from './ui/dropdown-menu';
import { Button } from './ui/button';
import CopyButton from './ui/copy';
import { useState } from 'react';

interface CardUserInfoProps {
  profile: IUser;
}

export default function CardUserInfo({ profile }: CardUserInfoProps) {
  const { user } = useUserProfile();
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const {
    _id,
    role,
    givenName,
    familyName,
    avatarUrl,
    email,
    dateOfBirth,
    sex,
    state,
    type,
    matricula,
    educationalProgram,
    careerLevel,
    division,
    employeeNumber,
    createdAt,
  } = profile;

  let badgeVariant:
    | 'blue'
    | 'default'
    | 'secondary'
    | 'destructive'
    | 'outline'
    | 'green'
    | 'gray'
    | 'purple'
    | 'orange'
    | null
    | undefined;
  switch (type) {
    case UserType.ESTUDIANTE:
      badgeVariant = 'blue';
      break;
    case UserType.MAESTRO:
      badgeVariant = 'green';
      break;
    case UserType.ADMINISTRATIVO:
      badgeVariant = 'purple';
      break;
  }

  return (
    <Card className="lg:max-w-lg w-full">
      <CardHeader>
        <div className="flex justify-between">
          <div className="flex gap-3">
            <ProfileInfo
              givenName={givenName}
              familyName={familyName}
              avatarUrl={avatarUrl}
              email={email}
            />
            <div>
              <Badge variant={badgeVariant}>{type}</Badge>
            </div>
          </div>
          {(user._id === profile._id || user.role === UserRole.ADMIN) && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon-sm">
                  <MoreHorizontal />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem asChild>
                  <Dialog open={isEditProfileOpen} onOpenChange={setIsEditProfileOpen}>
                    <DialogTrigger className="w-full justify-start font-normal">
                      <Pencil /> Editar
                    </DialogTrigger>

                    <DialogContent className="max-h-[85vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Editar Perfil</DialogTitle>
                        <DialogDescription>
                          Edita tu perfil aquí y haz click en guardar cuando
                          termines.
                        </DialogDescription>
                      </DialogHeader>
                      <Separator />
                      <div className="px-2">
                        <UserForm
                          profile={profile}
                          onSuccess={() => setIsEditProfileOpen(false)}
                        />
                      </div>
                    </DialogContent>
                  </Dialog>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </CardHeader>

      <CardHeader>
        <CardTitle>Información Personal</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableBody>
            <TableRow>
              <TableCell className="text-gray-500 px-4">Nombre</TableCell>
              <TableCell>
                <div className="flex items-center gap-1 group">
                  {givenName} {familyName}
                  <CopyButton
                    valueToCopy={givenName + ' ' + familyName}
                    className="opacity-0 group-hover:opacity-100"
                  />
                </div>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="text-gray-500 px-4">
                Correo electrónico
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1 group">
                  {email}
                  <CopyButton
                    valueToCopy={email}
                    className="opacity-0 group-hover:opacity-100"
                  />
                </div>
              </TableCell>
            </TableRow>
            {dateOfBirth && (
              <TableRow>
                <TableCell className="text-gray-500 px-4">
                  Fecha de nacimiento
                </TableCell>
                <TableCell>
                  {format(dateOfBirth, "d 'de' MMMM 'de' yyyy", { locale: es })}
                </TableCell>
              </TableRow>
            )}
            <TableRow>
              <TableCell className="text-gray-500 px-4">Sexo</TableCell>
              <TableCell>{sex}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="text-gray-500 px-4">
                Estado de residencia
              </TableCell>
              <TableCell>{state}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>

      <Separator />

      <CardHeader>
        <CardTitle>Información Institucional</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableBody>
            {type === UserType.ESTUDIANTE && (
              <>
                <TableRow>
                  <TableCell className="text-gray-500 px-4">
                    Matricula
                  </TableCell>
                  <TableCell>
                    {matricula ? (
                      <div className="flex items-center gap-1 group">
                        {matricula}
                        <CopyButton
                          valueToCopy={matricula}
                          className="opacity-0 group-hover:opacity-100"
                        />
                      </div>
                    ) : (
                      <span className="text-muted-foreground">Vacío</span>
                    )}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="text-gray-500 px-4">
                    Programa educativo
                  </TableCell>
                  <TableCell>
                    {educationalProgram ? (
                      educationalProgram.name
                    ) : (
                      <span className="text-muted-foreground">Vacío</span>
                    )}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="text-gray-500 px-4">
                    Nivel de carrera
                  </TableCell>
                  <TableCell>
                    {careerLevel ? (
                      careerLevel
                    ) : (
                      <span className="text-muted-foreground">Vacío</span>
                    )}
                  </TableCell>
                </TableRow>
              </>
            )}
            {(type === UserType.MAESTRO ||
              type === UserType.ADMINISTRATIVO) && (
              <TableRow>
                <TableCell className="text-gray-500 px-4">
                  Número de empleado
                </TableCell>
                <TableCell>
                  {employeeNumber ? (
                    <div className="flex items-center gap-1 group">
                      {employeeNumber}
                      <CopyButton
                        valueToCopy={employeeNumber}
                        className="opacity-0 group-hover:opacity-100"
                      />
                    </div>
                  ) : (
                    <span className="text-muted-foreground">Vacío</span>
                  )}
                </TableCell>
              </TableRow>
            )}
            <TableRow>
              <TableCell className="text-gray-500 px-4">Division</TableCell>
              <TableCell>
                {division ? (
                  division.name
                ) : (
                  <span className="text-muted-foreground">Vacío</span>
                )}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
      <CardFooter>
        <div className="flex gap-1 items-center justify-center text-muted-foreground text-xs">
          <span>
            Se unió el{' '}
            {format(createdAt, "d 'de' MMM 'de' yyyy", { locale: es })}
          </span>
        </div>
      </CardFooter>
    </Card>
  );
}
