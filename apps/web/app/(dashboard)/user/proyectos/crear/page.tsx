import { CreateProjectForm } from '@/components/forms/create-project-form';
import {
  Header,
  HeaderAction,
  HeaderDescription,
  HeaderHeading,
  HeaderTitle,
} from '@/components/header';
import { PageContent } from '@/components/page-content';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import React from 'react';

const Page = () => {
  return (
    <div>
      <Header>
        <HeaderHeading>
          <HeaderTitle>Nuevo Proyecto</HeaderTitle>
        </HeaderHeading>
        <HeaderAction>
          <Button asChild variant="ghost">
            <Link href={'/user/proyectos'}>
              <ArrowLeft />
              Cancelar
            </Link>
          </Button>
        </HeaderAction>
      </Header>
      <PageContent className="items-center">
        <CreateProjectForm />
      </PageContent>
    </div>
  );
};
export default Page;
