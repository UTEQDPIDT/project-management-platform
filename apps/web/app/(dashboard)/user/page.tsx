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
        <HeaderContent>
          <Button>Button</Button>
          <Button>Button</Button>
        </HeaderContent>
        <HeaderAction>
          <Button>Button</Button>
          <Button>Button</Button>
        </HeaderAction>
      </Header>
    </div>
  );
};
export default Page;
