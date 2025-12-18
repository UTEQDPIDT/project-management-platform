'use client';

import { CreateTeamForm } from '@/components/forms/create-team-form';
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
          <HeaderTitle>Crear Equipo</HeaderTitle>
          <HeaderDescription>
            Llena los detalles del nuevo equipo e invita a los integrantes.
          </HeaderDescription>
        </HeaderHeading>
        <HeaderAction>
          <Button asChild variant="ghost">
            <Link href={'/user/equipos'}>
              <ArrowLeft />
              Cancelar
            </Link>
          </Button>
        </HeaderAction>
      </Header>
      <PageContent className="items-center">
        <CreateTeamForm />
      </PageContent>
    </div>
  );
};
export default Page;
