import { User, UserType } from '@repo/types';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Separator } from './ui/separator';
import { CircleUser } from 'lucide-react';

export default function CardUserInfo({ profile }: { profile: User }) {
  const {
    givenName,
    familyName,
    sex,
    state,
    dateOfBirth,
    type,
    matricula,
    careerLevel,
    educationalProgram,
    division,
    employeeNumber,
    email,
    createdAt,
    updatedAt,
  } = profile;

  return (
    <Card className="lg:max-w-lg w-full">
      <CardHeader>
        <CardTitle>Información General</CardTitle>
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
            <TableRow>
              <TableCell className="text-gray-500 px-4">
                Fecha de nacimiento
              </TableCell>
              <TableCell>
                {format(dateOfBirth, "d 'de' MMMM 'de' yyyy", { locale: es })}
              </TableCell>
            </TableRow>
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
            <TableRow>
              <TableCell className="text-gray-500 px-4">
                Tipo de Usuario
              </TableCell>
              <TableCell>{type}</TableCell>
            </TableRow>
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
                  <TableCell>{educationalProgram}</TableCell>
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
              <TableCell>{division}</TableCell>
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
