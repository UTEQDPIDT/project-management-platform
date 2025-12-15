'use client';

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
          <HeaderTitle>Crear Proyecto</HeaderTitle>
          <HeaderDescription>
            Llena los detalles del nuevo proyecto.
          </HeaderDescription>
        </HeaderHeading>
        <HeaderAction>
          <Button asChild variant="outline">
            <Link href={'/user/proyectos'}>
              <ArrowLeft />
              Cancelar
            </Link>
          </Button>
        </HeaderAction>
      </Header>
      <PageContent className="items-center">Form</PageContent>
    </div>
  );
};
export default Page;
