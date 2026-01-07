'use client';

import {
  Header,
  HeaderHeading,
  HeaderTitle,
  HeaderDescription,
} from '@/components/header';
import { userProfile } from 'context/profile-provider';
import React from 'react';

const Page = () => {
  const { user } = userProfile();

  return (
    <div>
      <Header>
        <HeaderHeading>
          <HeaderTitle>Dashboard Administrativo</HeaderTitle>
          <HeaderDescription>
            Bienvenido {user.givenName}. Esto es lo que esta sucediendo.
          </HeaderDescription>
        </HeaderHeading>
      </Header>
    </div>
  );
};
export default Page;
