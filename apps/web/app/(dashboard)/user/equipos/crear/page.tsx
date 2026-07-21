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
        <HeaderAction className="w-full sm:w-auto mt-4 sm:mt-0">
          <Button asChild variant="ghost" className="w-full sm:w-auto">
            <Link href={'/user/equipos'} className="flex items-center justify-center gap-2">
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
