import {
  Header,
  HeaderHeading,
  HeaderTitle,
  HeaderDescription,
} from '@/components/header';
import React from 'react';

const Page = () => {
  return (
    <div>
      <Header>
        <HeaderHeading>
          <HeaderTitle>Dashboard Administrativo</HeaderTitle>
          <HeaderDescription>
            Bienvenido de vuelta Aeon Julien
          </HeaderDescription>
        </HeaderHeading>
      </Header>
    </div>
  );
};
export default Page;
