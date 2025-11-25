import {
  Header,
  HeaderAction,
  HeaderContent,
  HeaderDescription,
  HeaderHeading,
  HeaderTitle,
} from '@/components/header';
import { Button } from '@/components/ui/button';
import React from 'react';

const Page = () => {
  return (
    <div>
      <Header>
        <HeaderHeading>
          <HeaderTitle>Proyectos</HeaderTitle>
          <HeaderDescription>
            Administra y dale seguimiento a tus proyectos.
          </HeaderDescription>
        </HeaderHeading>
      </Header>
    </div>
  );
};
export default Page;
