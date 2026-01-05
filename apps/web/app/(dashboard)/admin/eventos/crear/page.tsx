import EventForm from '@/components/forms/event-form';
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

export default function page() {
  return (
    <div>
      <Header>
        <HeaderHeading>
          <HeaderTitle>Crear Evento</HeaderTitle>
          <HeaderDescription>
            Llena los detalles del nuevo evento e invita a los participantes.
          </HeaderDescription>
        </HeaderHeading>
        <HeaderAction>
          <Button asChild variant="ghost">
            <Link href={'/admin/eventos'}>
              <ArrowLeft />
              Cancelar
            </Link>
          </Button>
        </HeaderAction>
      </Header>
      <PageContent className="items-center">
        <EventForm />
      </PageContent>
    </div>
  );
}
