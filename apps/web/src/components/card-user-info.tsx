import { UserType } from '@repo/types';
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

import { userProfile } from 'context/profile-provider';
import { Badge } from './ui/badge';

export default function CardUserInfo() {
  const { user } = userProfile();
  const {
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
  } = user;

  return (
    <Card className="lg:max-w-lg w-full">
      <CardHeader>
        <div className="flex gap-3">
          <ProfileInfo
            givenName={givenName}
            familyName={familyName}
            avatarUrl={avatarUrl}
            email={email}
          />
          <div>
            <Badge variant="blue">{type}</Badge>
          </div>
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
                {givenName} {familyName}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="text-gray-500 px-4">
                Correo electrónico
              </TableCell>
              <TableCell>{email}</TableCell>
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
                  <TableCell>{matricula}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="text-gray-500 px-4">
                    Programa educativo
                  </TableCell>
                  <TableCell>{educationalProgram?.name}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="text-gray-500 px-4">
                    Nivel de carrera
                  </TableCell>
                  <TableCell>{careerLevel}</TableCell>
                </TableRow>
              </>
            )}
            {type === UserType.MAESTRO && (
              <TableRow>
                <TableCell className="text-gray-500 px-4">
                  Número de empleado
                </TableCell>
                <TableCell>{employeeNumber}</TableCell>
              </TableRow>
            )}
            <TableRow>
              <TableCell className="text-gray-500 px-4">Division</TableCell>
              <TableCell>{division?.name}</TableCell>
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
