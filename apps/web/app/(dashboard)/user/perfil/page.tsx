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
import { Avatar, AvatarFallback } from '@radix-ui/react-avatar';

const Page = () => {
  return (
    <div>
      <Header>
        <HeaderHeading>
          <HeaderTitle>Perfil</HeaderTitle>
          <HeaderDescription>
            Una vista a los detalles de tu cuenta.
          </HeaderDescription>
        </HeaderHeading>
        <HeaderAction>
          <Button variant={'outline'}>Editar</Button>
        </HeaderAction>
      </Header>
      <PageContent>
        <Card>
          <CardHeader>
            <CardTitle>Información del perfil</CardTitle>
            <CardDescription>Description</CardDescription>
          </CardHeader>
          <CardContent>Contenido</CardContent>
          <CardFooter></CardFooter>
        </Card>
      </PageContent>
    </div>
  );
};
export default Page;
