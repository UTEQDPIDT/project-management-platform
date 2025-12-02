import {
  Header,
  HeaderAction,
  HeaderContent,
  HeaderDescription,
  HeaderHeading,
  HeaderTitle,
} from '@/components/header';
import { Button } from '@/components/ui/button';
import { PageContent } from '@/components/page-content';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ProfileInfo } from '@/components/profile-info';
import { Pencil } from 'lucide-react';
import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table';
import UserForm from '@/components/forms/user-form';

const Page = () => {
  return (
    <div>
      <Header>
        <HeaderHeading>
          <ProfileInfo givenName="Aeon Julien" email="example@mail.com" />
        </HeaderHeading>
        <HeaderAction>
          <Button variant={'outline'}>
            <Pencil /> Editar
          </Button>
        </HeaderAction>
      </Header>
      <PageContent className="flex flex-col items-center gap-5 py-5">
        {/* <Card className="lg:max-w-lg w-full">
          <CardHeader>
            <CardTitle>Información General</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableBody>
                <TableRow>
                  <TableCell className="text-gray-500 px-4">Nombre</TableCell>
                  <TableCell>Aeon Julien</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="text-gray-500 px-4">
                    Fecha de Nacimiento
                  </TableCell>
                  <TableCell>Aeon Julien</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="text-gray-500 px-4">Genero</TableCell>
                  <TableCell>Aeon Julien</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="text-gray-500 px-4">
                    Estado de Recidencia
                  </TableCell>
                  <TableCell>Aeon Julien</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="text-gray-500 px-4">
                    Correo electrónico
                  </TableCell>
                  <TableCell>Aeon Julien</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="lg:max-w-lg w-full">
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
                  <TableCell>Estudiante</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="text-gray-500 px-4">
                    Matricula
                  </TableCell>
                  <TableCell>Estudiante</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="text-gray-500 px-4">
                    Número de Empleado
                  </TableCell>
                  <TableCell>Estudiante</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="text-gray-500 px-4">Division</TableCell>
                  <TableCell>Estudiante</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="text-gray-500 px-4">
                    Programa Educativo
                  </TableCell>
                  <TableCell>Aeon Julien</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="text-gray-500 px-4">
                    Nivel de Carrera
                  </TableCell>
                  <TableCell>Aeon Julien</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card> */}

        <UserForm />
      </PageContent>
    </div>
  );
};
export default Page;
