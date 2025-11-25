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
          <HeaderTitle>Equipos</HeaderTitle>
          <HeaderDescription>
            Encuentra equipos y gestiona los equipos a los que perteneces.
          </HeaderDescription>
        </HeaderHeading>
      </Header>
    </div>
  );
};
export default Page;
