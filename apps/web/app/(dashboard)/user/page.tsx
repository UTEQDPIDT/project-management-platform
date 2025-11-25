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
          <HeaderTitle>Dashboard</HeaderTitle>
          <HeaderDescription>
            Bienvenido de vuelta Aeon Julien
          </HeaderDescription>
        </HeaderHeading>
      </Header>
    </div>
  );
};
export default Page;
