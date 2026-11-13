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
import { MoreHorizontal, Pencil, Shield } from 'lucide-react';
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
import { getUserTypeBadge } from '@/lib/badge-mappings';
import { useUpdateUserAccess } from '@/hooks/user';

interface CardUserInfoProps {
  profile: IUser;
}

export default function CardUserInfo({ profile }: CardUserInfoProps) {
  const { user } = useUserProfile();
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isAccessDialogOpen, setIsAccessDialogOpen] = useState(false);
  const updateUserAccessMutation = useUpdateUserAccess();
  const {
    _id,
    role,
    givenName,
    familyName,
    avatarUrl,
    email,
    dateOfBirth,
    sex,
    hasDisability,
    speaksIndigenousLanguage,
    educationLevel,
    researcherType,
    sniiLevel,
    type,
    educationalProgram,
    careerLevel,
    division,
    createdAt,
  } = profile;

  const display = (value?: string | null) =>
    value ? value : <span className="text-muted-foreground">Vacío</span>;
  const yesNo = (value?: boolean | null) =>
    value === null || value === undefined ? null : value ? 'Sí' : 'No';

  const typeBadge = getUserTypeBadge(type);
  const canToggleRole =
    user.role === UserRole.ADMIN &&
    user.canCloseElements &&
    user._id !== profile._id &&
    (role === UserRole.ADMIN || role === UserRole.USER);
  const nextRole = role === UserRole.ADMIN ? UserRole.USER : UserRole.ADMIN;
  const roleActionLabel =
    nextRole === UserRole.ADMIN ? 'Cambiar a ADMIN' : 'Cambiar a USER';

  const handleToggleRole = () => {
    updateUserAccessMutation.mutate(
      { userId: profile._id, role: nextRole },
      {
        onSuccess: () => {
          setIsAccessDialogOpen(false);
        },
      },
    );
  };

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
              <Badge variant={typeBadge.variant}>{typeBadge.label}</Badge>
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
                {canToggleRole && (
                  <DropdownMenuItem asChild>
                    <Dialog
                      open={isAccessDialogOpen}
                      onOpenChange={setIsAccessDialogOpen}
                    >
                      <DialogTrigger className="w-full justify-start font-normal">
                        <Shield className="h-4 w-4" /> {roleActionLabel}
                      </DialogTrigger>

                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Cambiar rol</DialogTitle>
                          <DialogDescription>
                            Esta acción actualizará el rol del usuario.
                            Solo continúa si estás seguro.
                          </DialogDescription>
                        </DialogHeader>
                        <Separator />
                        <div className="flex flex-col gap-3">
                          <p className="text-sm text-muted-foreground">
                            El usuario actual pasará de {role} a {nextRole}.
                          </p>
                          <div className="flex flex-col-reverse sm:flex-row gap-2 justify-end">
                            <Button
                              variant="outline"
                              onClick={() => setIsAccessDialogOpen(false)}
                            >
                              Cancelar
                            </Button>
                            <Button
                              variant="destructive"
                              disabled={updateUserAccessMutation.isPending}
                              onClick={handleToggleRole}
                            >
                              {roleActionLabel}
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </DropdownMenuItem>
                )}
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
              <TableCell>{display(sex)}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="text-gray-500 px-4">
                ¿Tiene alguna discapacidad?
              </TableCell>
              <TableCell>{display(yesNo(hasDisability))}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="text-gray-500 px-4">
                ¿Habla alguna lengua indígena?
              </TableCell>
              <TableCell>{display(yesNo(speaksIndigenousLanguage))}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="text-gray-500 px-4">
                Nivel de estudios
              </TableCell>
              <TableCell>{display(educationLevel)}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="text-gray-500 px-4">
                Tipo de investigador
              </TableCell>
              <TableCell>{display(researcherType)}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="text-gray-500 px-4">Nivel SNII</TableCell>
              <TableCell>{display(sniiLevel)}</TableCell>
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
